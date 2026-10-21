import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const base=path.resolve('art/reference/selected-products');
const ledger=JSON.parse(fs.readFileSync('art/qa/photo-modeling/source-model-ledger.json','utf8'));
const hashes=new Map();
for(const item of ledger.items) for(const file of item.files) hashes.set(file.sha256,path.join(ledger.archive,path.dirname(item.pack),file.path));
const previousPath=path.join(base,'image-acquisition.json');
const previous=fs.existsSync(previousPath)?JSON.parse(fs.readFileSync(previousPath,'utf8')):[];
for(const record of previous) if(record.sha256&&record.localPath&&fs.existsSync(record.localPath)) hashes.set(record.sha256,record.localPath);
const selections={
  'atem-mini-extreme':/\/(?:hero|connections|physical-specifications)\/atem-mini-extreme(?:-sm|-imperial)?\.(?:jpg|png)/,
  'tplink-er605-v1':/\/ER605_UN_1\.0_\d+(?:-2)?_large_/,
  'whirlwind-mini6-w1':/Mini%206%2026\.jpg/,
  'contour-shuttleprov2':/ShuttleProV2FRONT/,
  'bmd-optical12g':/\/(?:hero|connections|physical-specifications)\/mini-converter-optical-fiber-12g(?:-sm|-imperial)?\.(?:jpg|png)/,
  'yamaha-ql1':/photoviewer_mixers_ql1_/i,
  'yamaha-dbr12':/photoviewer_speaker_dbr12_/i,
  'yamaha-mg12xu-bundle':/\/MG12XU_(?:front|rear|angle)_[a-f0-9]+\.(?:jpg|png)/i,
  'epson-eb-fh52':/epsonemear\/29753-productpicture-lores-en-eb-fh52_main/,
  'sony-lmda170':/sony\.com\/image\/96d695373cf2528f6fd48b4c1a49dd13/,
  'sony-srgx400':/sony\.com\/image\//,
  'sennheiser-sk100g4':/SK_100_Overview\.png/,
  'sennheiser-em100g4':/EM_100_(?:Overview_front|Anschluesse_Rueckseite)\.png/,
  'sennheiser-skm100g4':/SKM_100_Overview\.png/,
  'sennheiser-me2':/assets\.sennheiser\.com\/assets\/ME_2/i,
  'sennheiser-mke600':/assets\.sennheiser\.com\/assets\/MKE_600_Product_shot_cutout_front_view/i,
  'hp-probook450g10':/probook_450_g10\/images\/move[1-8]_full\.jpg/,
  'dell-r250':/i\.dell\.com\/is\/image\/DellContent\/.*r250.*campaign-hero/i,
  'dell3660-decklink':/i\.dell\.com\/is\/image\/DellContent\/.*3660\/media-gallery\/.*gallery-[2356]\.psd/i,
};
const overview={
  'yamaha-ql1':'https://usa.yamaha.com/products/proaudio/mixers/ql_series/',
  'yamaha-dbr12':'https://usa.yamaha.com/products/proaudio/speakers/dbr/',
  'yamaha-mg12xu-bundle':'https://usa.yamaha.com/products/proaudio/mixers/mg_series_xu_model/',
  'sennheiser-sk100g4':'https://docs.cloud.sennheiser.com/en-us/ew-g4/sk100g4-overview.html',
  'sennheiser-em100g4':'https://docs.cloud.sennheiser.com/en-us/ew-g4/em100g4-overview.html',
  'sennheiser-skm100g4':'https://docs.cloud.sennheiser.com/en-us/ew-g4/skm100g4-overview.html',
  'sennheiser-me2':'https://www.sennheiser.com/en-us/catalog/products/microphones/me-2/me-2-508935',
  'sennheiser-mke600':'https://www.sennheiser.com/en-us/catalog/products/microphones/mke-600/mke-600-505453',
  'hp-probook450g10':'https://jp.ext.hp.com/notebooks/business/probook_450_g10/',
  'dell3660-decklink':'https://www.dell.com/en-us/shop/desktop-computers/precision-3660-tower/spd/precision-3660-workstation',
};
// Patterns select specific product names, never "first image on page" (often another model or a logo).
const out=previous.filter(r=>r.component);
for(const [id,pattern] of Object.entries(selections)) {
  const dir=path.join(base,id);
  const sourcePath=path.join(dir,'source.html');
  let html=fs.existsSync(sourcePath)?fs.readFileSync(sourcePath,'utf8'):'',page=JSON.parse(fs.readFileSync(path.join(dir,'evidence.json'),'utf8')).page;
  if(overview[id]) {
    page=overview[id];const snapshot=path.join(dir,'overview.html');
    if(fs.existsSync(snapshot)) html=fs.readFileSync(snapshot,'utf8');
    else {const response=await fetch(page,{signal:AbortSignal.timeout(45000)});if(!response.ok) throw Error(`Source HTTP ${response.status}`);html=await response.text();fs.writeFileSync(snapshot,html);}
  }
  let urls;
  if(['sennheiser-me2','sennheiser-mke600','dell-r250','dell3660-decklink','hp-probook450g10'].includes(id)) {
    const unique=new Map();
    for(const match of html.matchAll(/(?:src|content)\s*=\s*"([^"]+)"/gi)) {
      try {const u=new URL(match[1].replaceAll('&amp;','&'),page); if(pattern.test(u.href)&&!unique.has(u.pathname)) unique.set(u.pathname,u.href);}catch{}
    }
    urls=[...unique.values()];
  }
  else if(id.startsWith('sennheiser-')) urls=[...new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>new URL(m[1],page).href).filter(u=>pattern.test(u)))];
  else if(overview[id]) urls=[...new Set([...html.matchAll(/(?:href|data-enlarge-image)="(\/files\/[^"?]+\.(?:jpg|png))[^"<>]*"/g)].map(m=>new URL(m[1],page).href).filter(u=>pattern.test(u)))];
  else if(id==='epson-eb-fh52') urls=[...html.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map(m=>m[1]).filter(u=>pattern.test(u));
  else if(id.startsWith('sony-')) {
    // Only the named product introduction hero; gallery/feature cards may depict related products.
    const intro=html.match(/"name":"ProductIntroBanner","data":\{[^}]*?"image":"([^"]+)"/);
    urls=intro&&pattern.test(intro[1])?[intro[1].replaceAll('&amp;','&')]:[];
  }
  else urls=[...new Set([...html.matchAll(/https:\/\/[^\s"'<>]+?\.(?:png|jpe?g)(?:\?[^\s"'<>]*)?/g)].map(m=>m[0].replaceAll('&amp;','&')).filter(u=>pattern.test(u)))];
  for(const [index,url] of urls.entries()) {
    const cached=previous.find(r=>r.url===url&&r.localPath&&fs.existsSync(r.localPath));
    if(cached) {
      const digest=crypto.createHash('sha256').update(fs.readFileSync(cached.localPath)).digest('hex');
      if(digest===cached.sha256) {out.push(cached);fs.writeFileSync(previousPath,JSON.stringify(out,null,2));continue;}
    }
    const key=`${id}-${index+1}`,record={id:key,product:id,url,page,status:'DOWNLOAD_FAILED',rights:'local research only; not shipped in public assets',visualReview:'PENDING'};
    try {
      const response=await fetch(url,{signal:AbortSignal.timeout(45000)}); if(!response.ok) throw Error(`HTTP ${response.status}`);
      const bytes=Buffer.from(await response.arrayBuffer()),mime=response.headers.get('content-type')??'';
      if(!mime.startsWith('image/')) throw Error(`Not image: ${mime}`);
      const hash=crypto.createHash('sha256').update(bytes).digest('hex'); record.sha256=hash;record.bytes=bytes.length;
      if(hashes.has(hash)) {record.status='REUSED_EXISTING_SHA256';record.localPath=hashes.get(hash);}
      else {
        const extension=mime.includes('png')?'png':mime.includes('webp')?'webp':'jpg',file=path.join(dir,`${key}.${extension}`);
        fs.writeFileSync(file,bytes);record.status='DOWNLOADED_NEEDS_VISUAL_REVIEW';record.localPath=file;hashes.set(hash,file);
      }
    } catch(error) {record.error=error.message;}
    out.push(record);
    // Persist after every item, including failures. Existing verified archive files are never overwritten.
    fs.writeFileSync(path.join(base,'image-acquisition.json'),JSON.stringify(out,null,2));
  }
}
console.log(JSON.stringify({records:out.length,saved:out.filter(r=>r.status==='DOWNLOADED_NEEDS_VISUAL_REVIEW').length,reused:out.filter(r=>r.status==='REUSED_EXISTING_SHA256').length,failed:out.filter(r=>r.status==='DOWNLOAD_FAILED').length}));
