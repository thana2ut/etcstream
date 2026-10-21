import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Manufacturer pages are evidence, not permission to redistribute their photographs.
// This script saves private research snapshots and image CANDIDATES. It never auto-approves an image.
const root=process.cwd(), data=JSON.parse(fs.readFileSync(path.join(root,'game/content/selected-product-targets.json'),'utf8'));
const output=path.join(root,'art/reference/selected-products');
fs.mkdirSync(output,{recursive:true});
const limit=process.argv.slice(2), entries=Object.entries(data.products).filter(([id])=>!limit.length||limit.includes(id));
const results=await Promise.all(entries.map(async([id,product])=>{
  const dir=path.join(output,id); fs.mkdirSync(dir,{recursive:true});
  const existing=path.join(dir,'evidence.json');
  if(fs.existsSync(existing)&&!process.env.REFRESH_PRODUCT_EVIDENCE) return JSON.parse(fs.readFileSync(existing,'utf8'));
  let record={id,name:product.name,page:product.url,acquiredAt:new Date().toISOString(),status:'FETCH_FAILED',images:[],rights:'research-only; redistribution permission not established',modelStatus:'TARGET_SELECTED_NOT_VISUALLY_APPROVED'};
  try {
    const response=await fetch(product.url,{signal:AbortSignal.timeout(45000),headers:{'User-Agent':'Mozilla/5.0 EduStream reference research'}});
    const bytes=Buffer.from(await response.arrayBuffer()),type=response.headers.get('content-type')??'';
    record={...record,httpStatus:response.status,finalUrl:response.url,contentType:type,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
    if(response.ok&&(type.includes('html')||type.includes('pdf'))) {
      const extension=type.includes('pdf')?'pdf':'html'; fs.writeFileSync(path.join(dir,`source.${extension}`),bytes);
      record.status='SOURCE_SAVED_NEEDS_VISUAL_REVIEW'; record.localSource=`art/reference/selected-products/${id}/source.${extension}`;
      if(extension==='html') {
        const html=bytes.toString('utf8'), candidates=new Set();
        for(const match of html.matchAll(/(?:src|data-src|content)\s*=\s*["']([^"']+\.(?:jpe?g|png|webp)(?:\?[^"']*)?)["']/gi)) {
          try { const url=new URL(match[1].replaceAll('&amp;','&'),response.url); if(url.protocol==='https:') candidates.add(url.href); } catch {}
        }
        record.images=[...candidates].map(url=>({url,status:'UNREVIEWED_CANDIDATE_NOT_DOWNLOADED'}));
      }
    }
  } catch(error) { record.error=String(error.message); }
  fs.writeFileSync(existing,JSON.stringify(record,null,2)); return record;
}));
const all=fs.readdirSync(output,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>path.join(output,d.name,'evidence.json')).filter(f=>fs.existsSync(f)).map(f=>JSON.parse(fs.readFileSync(f,'utf8')));
fs.writeFileSync(path.join(output,'source-audit.json'),JSON.stringify({profileCount:Object.keys(data.profiles).length,productCount:Object.keys(data.products).length,records:all},null,2));
for(const r of results) console.log(`${r.id}: ${r.status}; candidates=${r.images.length}`);
