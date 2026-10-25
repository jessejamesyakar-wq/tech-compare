// Preserve every mesh/rig buffer; resize only embedded maps for mobile memory.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const align = n => (n + 3) & ~3;

async function main() {
  const models = path.resolve(__dirname, '../public/models');
  const source = fs.readFileSync(path.join(models, 'robopengu-new-motion.glb'));
  assert.equal(hash(source), '1dcdbbc49c6bde9047e224092309a52e720d8f70dff2704f7af8242d5b0b805e');
  const jsonLength = source.readUInt32LE(12);
  const original = JSON.parse(source.subarray(20, 20 + jsonLength));
  const json = structuredClone(original);
  const sourceBin = source.subarray(28 + jsonLength);
  const replacements = new Map(), dimensions = [];
  // Sequential decode bounds build-time memory, too. PNG adds no encoding loss
  // after resizing; the full-resolution source remains available for desktop.
  for (const image of json.images) {
    const view = original.bufferViews[image.bufferView];
    const input = sourceBin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    const before = await sharp(input).metadata();
    const { data, info } = await sharp(input).resize({ width: 2048, height: 2048,
      fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' })
      .png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer({ resolveWithObject: true });
    replacements.set(image.bufferView, data);
    image.mimeType = 'image/png';
    dimensions.push({ before: [before.width, before.height], after: [info.width, info.height], bytes: data.length });
  }
  let offset = 0;
  const pieces = json.bufferViews.map((view, index) => {
    const old = original.bufferViews[index];
    const data = replacements.get(index) || sourceBin.subarray(old.byteOffset || 0, (old.byteOffset || 0) + old.byteLength);
    view.byteOffset = offset; view.byteLength = data.length;
    const padded = Buffer.alloc(align(data.length)); data.copy(padded); offset += padded.length;
    return padded;
  });
  const bin = Buffer.concat(pieces);
  json.buffers[0].byteLength = bin.length;
  const jsonBytes = Buffer.from(JSON.stringify(json));
  const paddedJson = Buffer.alloc(align(jsonBytes.length), 0x20); jsonBytes.copy(paddedJson);
  const output = Buffer.alloc(28 + paddedJson.length + bin.length);
  output.writeUInt32LE(0x46546c67, 0); output.writeUInt32LE(2, 4); output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(paddedJson.length, 12); output.writeUInt32LE(0x4e4f534a, 16); paddedJson.copy(output, 20);
  output.writeUInt32LE(bin.length, 20 + paddedJson.length); output.writeUInt32LE(0x004e4942, 24 + paddedJson.length);
  bin.copy(output, 28 + paddedJson.length);
  for (let i = 0; i < original.bufferViews.length; i++) {
    if (replacements.has(i)) continue;
    const old = original.bufferViews[i], view = json.bufferViews[i];
    assert(sourceBin.subarray(old.byteOffset || 0, (old.byteOffset || 0) + old.byteLength)
      .equals(bin.subarray(view.byteOffset, view.byteOffset + view.byteLength)), `Geometry/rig buffer ${i} changed`);
  }
  for (const key of ['accessors', 'meshes', 'skins', 'nodes', 'materials', 'textures', 'samplers']) {
    assert.deepEqual(json[key], original[key], `${key} changed`);
  }
  const digest = hash(output), name = `robopengu-mobile-${digest.slice(0, 12)}.glb.gz`;
  const packed = zlib.gzipSync(output, { level: 9 });
  assert(zlib.gunzipSync(packed).equals(output));
  fs.writeFileSync(path.join(models, name), packed);
  const textureMemory = field => dimensions.reduce((sum, image) => sum + image[field][0] * image[field][1] * 4 * 4 / 3, 0);
  console.log(JSON.stringify({ name, sha256: digest, decodedBytes: output.length, transferBytes: packed.length,
    dimensions, geometryAndRigByteIdentical: true, estimatedTextureBytesWithMipmaps: {
      desktop: textureMemory('before'), mobile: textureMemory('after'),
    } }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
