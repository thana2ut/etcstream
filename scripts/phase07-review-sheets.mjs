import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const root = path.resolve(process.argv[2]??'art/qa/phase07');
const files = fs.readdirSync(root).filter(n => n.endsWith('.png') && !n.startsWith('sheet-'));
for (let start = 0; start < files.length; start += 9) {
  const layers = [];
  for (const [i, name] of files.slice(start, start + 9).entries()) {
    const left = (i % 3) * 400, top = Math.floor(i / 3) * 330;
    layers.push({input: await sharp(path.join(root, name)).resize(400, 300).png().toBuffer(), left, top});
    layers.push({input: Buffer.from(`<svg width="400" height="30"><rect width="400" height="30" fill="white"/><text x="8" y="20" font-size="12">${name}</text></svg>`), left, top: top + 300});
  }
  await sharp({create:{width:1200,height:990,channels:3,background:'white'}}).composite(layers).png().toFile(path.join(root, `sheet-${start / 9 + 1}.png`));
}
console.log(`${files.length} previews, ${Math.ceil(files.length / 9)} sheets`);
