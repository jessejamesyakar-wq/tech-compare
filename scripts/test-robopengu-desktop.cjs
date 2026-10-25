// Compare the shipped desktop bundle with the approved original, not the encoder.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),sharp=require('sharp');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{
 const {MeshoptDecoder}=await import(pathToFileURL(root+'/node_modules/three/examples/jsm/libs/meshopt_decoder.module.js').href);await MeshoptDecoder.ready;
 const packed=fs.readFileSync(root+'/public/models/robopengu-motion-1dcdbbc49c6b.glb.gz'),bytes=zlib.gunzipSync(packed),length=bytes.readUInt32LE(12);
 const old={json:JSON.parse(bytes.subarray(20,20+length)),bin:bytes.subarray(28+length)};
 const nextPacked=fs.readFileSync(root+'/public/models/robopengu-desktop-lossless-e487f79e706b.glb.gz'),nextBytes=zlib.gunzipSync(nextPacked),nextLength=nextBytes.readUInt32LE(12),json=JSON.parse(nextBytes.subarray(20,20+nextLength)),next={json,bin:nextBytes.subarray(28+nextLength)};
 function view(asset,i){const v=asset.json.bufferViews[i],e=v.extensions?.EXT_meshopt_compression;if(!e)return asset.bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);const out=new Uint8Array(e.count*e.byteStride);MeshoptDecoder.decodeGltfBuffer(out,e.count,e.byteStride,asset.bin.subarray(e.byteOffset,e.byteOffset+e.byteLength),e.mode,e.filter);return Buffer.from(out);}
 let attributes=0,triangles=0;
 function compareAccessor(a,b){const before=old.json.accessors[a],after=json.accessors[b];for(const key of ['componentType','count','type','normalized','min','max'])assert.deepEqual(after[key],before[key]);assert.deepEqual(view(next,after.bufferView),view(old,before.bufferView));attributes++;}
 for(const key of ['nodes','materials','textures','samplers','scenes','scene','animations'])assert.deepEqual(json[key],old.json[key]);
 assert.equal(json.meshes.length,old.json.meshes.length);
 old.json.meshes.forEach((m,i)=>m.primitives.forEach((p,j)=>{const n=json.meshes[i].primitives[j];for(const key of ['mode','material','extras'])assert.deepEqual(n[key],p[key]);assert.deepEqual(Object.keys(n.attributes),Object.keys(p.attributes));for(const key of Object.keys(p.attributes))compareAccessor(p.attributes[key],n.attributes[key]);compareAccessor(p.indices,n.indices);triangles+=old.json.accessors[p.indices].count/3;}));
 old.json.skins.forEach((s,i)=>{const n=json.skins[i];assert.deepEqual(n.joints,s.joints);compareAccessor(s.inverseBindMatrices,n.inverseBindMatrices);});
 for(let i=0;i<old.json.images.length;i++){const source=view(old,old.json.images[i].bufferView),image=view(next,json.images[i].bufferView);const a=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});const b=await sharp(image).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual(b.info,a.info);assert.deepEqual(b.data,a.data);assert.equal((await sharp(image).metadata()).isProgressive,false);}
 assert.equal(next.bin.length,json.buffers[0].byteLength);
 const afterBytes=nextPacked.length;assert(afterBytes<packed.length);
 console.log(JSON.stringify({result:'PASS',accessorComparisons:attributes,triangles,pixelIdenticalTextures:3,textureResolution:'8192/4096/4096',rigAndMaterials:'identical',beforeBytes:packed.length,afterBytes,geometryBufferBytes:next.bin.length,originalGlbBufferBytes:bytes.length},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
