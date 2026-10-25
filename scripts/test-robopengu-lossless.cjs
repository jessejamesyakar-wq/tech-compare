// Verifies the shipped asset, independently of the offline encoder.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto'),sharp=require('sharp');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
function read(name){const compressed=fs.readFileSync(root+'/public/models/'+name),bytes=zlib.gunzipSync(compressed),length=bytes.readUInt32LE(12);return {compressed,bytes,json:JSON.parse(bytes.subarray(20,20+length)),bin:bytes.subarray(28+length)};}
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
(async()=>{
 const {MeshoptDecoder}=await import(pathToFileURL(root+'/node_modules/three/examples/jsm/libs/meshopt_decoder.module.js').href);await MeshoptDecoder.ready;
 const old=read('robopengu-mobile-feda5b385835.glb.gz'),next=read('robopengu-mobile-lossless-246c09dcc8a3.glb.gz');
 assert.equal(hash(next.bytes),'246c09dcc8a3797c735706fb2eb307e0b6519877bbd2b11d04e6b028402f74f9');
 function view(asset,i){const v=asset.json.bufferViews[i],e=v.extensions?.EXT_meshopt_compression;if(!e)return asset.bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);const out=new Uint8Array(e.count*e.byteStride);MeshoptDecoder.decodeGltfBuffer(out,e.count,e.byteStride,asset.bin.subarray(e.byteOffset,e.byteOffset+e.byteLength),e.mode,e.filter);return Buffer.from(out);}
 let attributes=0,triangles=0;
 function compareAccessor(a,b){const before=old.json.accessors[a],after=next.json.accessors[b];for(const key of ['componentType','count','type','normalized','min','max'])assert.deepEqual(after[key],before[key]);assert.deepEqual(view(next,after.bufferView),view(old,before.bufferView));attributes++;}
 for(const key of ['nodes','materials','samplers','scenes','scene','animations'])assert.deepEqual(next.json[key],old.json[key]);
 assert.equal(next.json.meshes.length,old.json.meshes.length);
 old.json.meshes.forEach((m,i)=>m.primitives.forEach((p,j)=>{const n=next.json.meshes[i].primitives[j];for(const key of ['mode','material','extras'])assert.deepEqual(n[key],p[key]);assert.deepEqual(Object.keys(n.attributes),Object.keys(p.attributes));for(const key of Object.keys(p.attributes))compareAccessor(p.attributes[key],n.attributes[key]);compareAccessor(p.indices,n.indices);triangles+=old.json.accessors[p.indices].count/3;}));
 old.json.skins.forEach((s,i)=>{const n=next.json.skins[i];assert.deepEqual(n.joints,s.joints);compareAccessor(s.inverseBindMatrices,n.inverseBindMatrices);});
 for(let i=0;i<old.json.images.length;i++){const a=await sharp(view(old,old.json.images[i].bufferView)).ensureAlpha().raw().toBuffer({resolveWithObject:true});const b=await sharp(view(next,next.json.images[i].bufferView)).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual(b.info,a.info);assert.deepEqual(b.data,a.data);}
 old.json.textures.forEach((t,i)=>{assert.equal(next.json.textures[i].extensions.EXT_texture_webp.source,t.source);assert.equal(next.json.textures[i].sampler,t.sampler);});
 assert(next.compressed.length<old.compressed.length);assert(next.bytes.length<old.bytes.length);
 console.log(JSON.stringify({result:'PASS',accessorComparisons:attributes,triangles,pixelIdenticalTextures:old.json.images.length,rigAndMaterials:'identical',beforeBytes:old.compressed.length,afterBytes:next.compressed.length,decodedBefore:old.bytes.length,decodedAfter:next.bytes.length},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
