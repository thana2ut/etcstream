import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const ledger=JSON.parse(fs.readFileSync('art/qa/photo-modeling/source-model-ledger.json','utf8'));
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
let packs=0,files=0;
for(const item of ledger.items) {
  const pack=path.join(ledger.archive,item.pack);if(digest(pack)!==item.packSha256)throw Error(`Original pack changed: ${item.key}`);packs++;
  for(const file of item.files) {
    const absolute=path.join(ledger.archive,path.dirname(item.pack),file.path);
    if(digest(absolute)!==file.sha256)throw Error(`Original reference changed: ${absolute}`);files++;
  }
}
const images=JSON.parse(fs.readFileSync('art/reference/selected-products/image-acquisition.json','utf8'));
for(const image of images)if(digest(image.localPath)!==image.sha256)throw Error(`New reference changed: ${image.id}`);
const report={originalPacks:packs,originalReferences:files,originalPaths:packs+files,newImageRecords:images.length,originalArchiveChanged:false};
fs.writeFileSync('art/qa/table-equipment/reference-integrity.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
