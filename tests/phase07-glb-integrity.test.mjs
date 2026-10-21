import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('public/models/equipment');
const widths = {5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const components = {SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};

test('Phase 07: every shipped equipment GLB has valid buffers, finite vertex data and resolvable scene references', () => {
  const files = fs.readdirSync(root).filter(n => n.endsWith('.glb'));
  assert.ok(files.length >= 10, 'equipment library missing');
  for (const file of files) {
    const bytes = fs.readFileSync(path.join(root, file));
    assert.equal(bytes.readUInt32LE(0), 0x46546c67, `${file}: GLB magic`);
    assert.equal(bytes.readUInt32LE(4), 2, `${file}: GLB version`);
    assert.equal(bytes.readUInt32LE(8), bytes.length, `${file}: truncated file`);
    let doc, binary;
    for (let cursor=12; cursor<bytes.length;) {
      const length=bytes.readUInt32LE(cursor), type=bytes.readUInt32LE(cursor+4);
      assert.ok(cursor+8+length<=bytes.length, `${file}: chunk overflow`);
      if (type===0x4e4f534a) doc=JSON.parse(bytes.toString('utf8',cursor+8,cursor+8+length));
      if (type===0x004e4942) binary=bytes.subarray(cursor+8,cursor+8+length);
      cursor+=8+length;
    }
    assert.ok(doc && binary, `${file}: missing JSON/BIN`);
    assert.equal(doc.asset.version, '2.0');
    for (const view of doc.bufferViews ?? []) {
      assert.equal(view.buffer, 0, `${file}: unexpected external buffer`);
      assert.ok((view.byteOffset??0)+view.byteLength<=binary.length, `${file}: bufferView overflow`);
    }
    for (const accessor of doc.accessors ?? []) {
      assert.ok(accessor.count>0 && widths[accessor.componentType] && components[accessor.type], `${file}: accessor format`);
      if (accessor.bufferView===undefined) continue;
      const view=doc.bufferViews[accessor.bufferView];
      assert.ok(view, `${file}: missing bufferView`);
      const element=widths[accessor.componentType]*components[accessor.type], stride=view.byteStride??element;
      const end=(accessor.byteOffset??0)+(accessor.count-1)*stride+element;
      assert.ok(end<=view.byteLength, `${file}: accessor overflow`);
      if (accessor.componentType===5126) {
        const base=(view.byteOffset??0)+(accessor.byteOffset??0);
        for(let i=0;i<accessor.count;i++) for(let c=0;c<components[accessor.type];c++) {
          assert.ok(Number.isFinite(binary.readFloatLE(base+i*stride+c*4)), `${file}: nonfinite float`);
        }
      }
    }
    for(const mesh of doc.meshes??[]) for(const primitive of mesh.primitives) {
      assert.ok(doc.accessors[primitive.attributes.POSITION], `${file}: missing positions`);
      if(primitive.indices!==undefined) assert.ok(doc.accessors[primitive.indices], `${file}: missing indices`);
      if(primitive.material!==undefined) assert.ok(doc.materials[primitive.material], `${file}: missing material`);
    }
    for(const node of doc.nodes??[]) {
      if(node.mesh!==undefined) assert.ok(doc.meshes[node.mesh], `${file}: missing mesh`);
      for(const child of node.children??[]) assert.ok(doc.nodes[child], `${file}: missing child`);
      for(const key of ['matrix','translation','rotation','scale']) if(node[key]) assert.ok(node[key].every(Number.isFinite), `${file}: nonfinite transform`);
    }
    for(const scene of doc.scenes??[]) for(const node of scene.nodes??[]) assert.ok(doc.nodes[node], `${file}: missing scene node`);
    for(const image of doc.images??[]) {
      assert.ok(image.bufferView!==undefined && doc.bufferViews[image.bufferView], `${file}: texture must remain embedded`);
    }
  }
});
