import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve('art/reference/selected-products'),manifest=path.join(root,'image-acquisition.json');
const records=JSON.parse(fs.readFileSync(manifest,'utf8'));
const sources=[
  {id:'radial-jiso',product:'yamaha-mg12xu-bundle',page:'https://www.radialeng.com/product/j-iso',pattern:/jiso-featured-img-thumb\.jpg/,og:true},
  {id:'hosa-gpp105',product:'yamaha-mg12xu-bundle',page:'https://hosatech.com/products/analog-audio/adapters/general-adapters/gpp-105/',pattern:/GPP-105-Full\.jpg/,og:true},
  {id:'hosa-ypp136',product:'yamaha-mg12xu-bundle',page:'https://hosatech.com/products/analog-audio/stereo-breakouts/hosa-breakouts/ypp-136/',pattern:/YPP-136[^/]*\.(?:jpg|png)/i,og:true},
  {id:'decklink-duo2',product:'dell3660-decklink',page:'https://www.blackmagicdesign.com/products/decklink/techspecs',pattern:/\/(?:hero|connections|physical-specifications)\/decklink-duo-2(?:-sm|-imperial)?\.(?:png|jpg)/},
];
const old=JSON.parse(fs.readFileSync('art/qa/photo-modeling/source-model-ledger.json','utf8'));
const hashPaths=new Map(records.filter(r=>r.sha256&&fs.existsSync(r.localPath)).map(r=>[r.sha256,r.localPath]));
for(const item of old.items)for(const f of item.files)hashPaths.set(f.sha256,path.join(old.archive,path.dirname(item.pack),f.path));
for(const source of sources) {
  const directory=path.join(root,source.product),snapshot=path.join(directory,`${source.id}-source.html`);
  let html;if(fs.existsSync(snapshot))html=fs.readFileSync(snapshot,'utf8');
  else{const response=await fetch(source.page,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(`${source.id}: HTTP ${response.status}`);html=await response.text();fs.writeFileSync(snapshot,html);}
  const urls=source.og?[...html.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map(m=>m[1]).filter(u=>source.pattern.test(u))
    :[...new Set([...html.matchAll(/https:\/\/[^\s"'<>]+?\.(?:png|jpe?g)(?:\?[^\s"'<>]*)?/g)].map(m=>m[0].replaceAll('&amp;','&')).filter(u=>source.pattern.test(u)))];
  if(!urls.length)throw Error(`No product-specific image: ${source.id}`);
  for(const [i,url] of urls.entries()) {
    if(records.some(r=>r.url===url&&fs.existsSync(r.localPath)))continue;
    const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(`HTTP ${response.status}`);
    const type=response.headers.get('content-type')??'';if(!type.startsWith('image/'))throw Error('Not an image');
    const bytes=Buffer.from(await response.arrayBuffer()),sha256=crypto.createHash('sha256').update(bytes).digest('hex'),id=`${source.id}-${i+1}`;
    const existing=hashPaths.get(sha256),localPath=existing??path.join(directory,`${id}.${type.includes('png')?'png':type.includes('webp')?'webp':'jpg'}`);
    if(!existing)fs.writeFileSync(localPath,bytes);
    records.push({id,product:source.product,component:source.id,url,page:source.page,localPath,sha256,bytes:bytes.length,status:existing?'REUSED_EXISTING_SHA256':'DOWNLOADED_NEEDS_VISUAL_REVIEW',visualReview:'PENDING',rights:'local research only; not public game artwork'});
    hashPaths.set(sha256,localPath);fs.writeFileSync(manifest,JSON.stringify(records,null,2));
  }
}
console.log(`${records.length} image records; component evidence preserved separately from profile identities`);
