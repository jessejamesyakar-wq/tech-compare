// Transport-only optimization: never resample textures, quantize or edit the mesh.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');

const models = path.resolve(__dirname, '../public/models');
const source = fs.readFileSync(path.join(models, 'robopengu-new-motion.glb'));
const hash = crypto.createHash('sha256').update(source).digest('hex');
assert.equal(hash, '1dcdbbc49c6bde9047e224092309a52e720d8f70dff2704f7af8242d5b0b805e',
  'Source changed: review the model and update its versioned URL before packaging.');
const destination = path.join(models, `robopengu-motion-${hash.slice(0, 12)}.glb.gz`);
const check = process.argv.includes('--check');
const packed = check ? fs.readFileSync(destination) : zlib.gzipSync(source, { level: 9 });
assert(zlib.gunzipSync(packed).equals(source), 'Decoded model must be byte-identical.');
if (!check) fs.writeFileSync(destination, packed);
console.log(JSON.stringify({ sourceBytes: source.length, transferBytes: packed.length,
  savedPercent: +(100 * (1 - packed.length / source.length)).toFixed(2), sha256: hash,
  byteIdentical: true, mode: check ? 'check' : 'write' }, null, 2));
