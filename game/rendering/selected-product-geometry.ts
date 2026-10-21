/** Original photo-authored GAME meshes. Registry IDs and electrical profiles deliberately remain untouched.
 * Sources: art/reference/selected-products/* /MODELING_REFERENCE_PACK.md. Unseen measurements remain estimates.
 * This is a separate visual registry: selected GAME identity must never masquerade as a verified owner unit.
 */
import type {ModelGeometry,ModelPortGeometry,Part,SocketKind,V3} from '../training/sim/model-geometry';
import * as targets from '../content/selected-product-targets.json';
import {HARDWARE_GEOMETRY} from '../training/sim/hardware-geometry';
const UP:V3=[0,1,0],BACK:V3=[0,0,-1],FRONT:V3=[0,0,1],RIGHT:V3=[1,0,0],LEFT:V3=[-1,0,0];
const box=(p:V3,s:V3,c='#252930'):Part=>({t:'box',p,s,c,round:true,finish:'plastic'});
const text=(p:V3,n:V3,value:string,size=.004):Part=>({t:'text',p,n,text:value,size,c:'#d7dbe0'});
const cyl=(p:V3,r:number,h:number,n:V3,c='#30353c'):Part=>({t:'cyl',p,r,h,n,c});
const key=(p:V3,label:string,c='#333840',s:[number,number]=[.009,.007]):Extract<Part,{t:'key'}>=>({t:'key',p,n:UP,label,c,s});
const port=(at:V3,normal:V3,kind:SocketKind):ModelPortGeometry=>({at,normal,kind});
function geo(id:string,size:V3,displayScale:number,parts:Part[],ports:Record<string,ModelPortGeometry>,inert:ModelGeometry['inert']=[]):ModelGeometry {
  const product=targets.products[targets.profiles[id as keyof typeof targets.profiles] as keyof typeof targets.products];
  return {size,displayScale,parts,ports,inert,source:[product.url],estimates:['รูปทรงและตำแหน่งรายละเอียดอ่านจากภาพทางการที่เก็บในเครื่อง ไม่ใช่ CAD โรงงาน; สเกลแสดงผลขยายเพื่อเล็งพอร์ตในเกม']};
}
function laptop(id:string):ModelGeometry {
  // ProBook 450 G10: silver deck, black full keyboard incl. numpad, off-centre trackpad, open lid.
  const w=.3594,d=.2339,h=.0199;
  const parts:Part[]=[box([0,h/2,0],[w,h,d],'#b8bdc4'),box([0,h+.001,0],[w*.92,.002,d*.73],'#292d32'),
    box([-.027,h+.001,d*.33],[.113,.001,.061],'#a8aeb5'),
    {t:'loft',sections:[[-d/2-.012,.127,w,.237],[-d/2+.002,.127,w,.237]],chamfer:.04,c:'#aeb4bc'},
    {t:'screen',p:[0,.128,-d/2+.003],s:[w-.016,.207],n:FRONT},text([0,.020,-d/2+.004],FRONT,'HP',.005)];
  for(let row=0;row<6;row++) for(let col=0;col<18;col++) parts.push(key([-.157+col*.0175,h+.002,-.075+row*.018],row===5&&col===7?'SPACE':'','#16191f',[.0135,.013]));
  const all={hdmi:port([w/2,.009,-.036],RIGHT,'hdmi'),a1:port([w/2,.009,-.006],RIGHT,'usba'),a2:port([-w/2,.009,-.012],LEFT,'usba'),eth:port([-w/2,.009,-.047],LEFT,'rj45')};
  const ports:Record<string,ModelPortGeometry>=id==='generic-obs-host'?{'usb-1':all.a1,'usb-2':all.a2,eth:all.eth}:{'hdmi-out':all.hdmi};
  return geo(id,[w,.25,d],1.34,parts,ports,[{name:'USB-C',...port([w/2,.009,-.063],RIGHT,'usbc')},{name:'HEADSET',...port([w/2,.009,.036],RIGHT,'jack35')}]);
}
function receiver():ModelGeometry {
  const w=.212,h=.043,d=.202,parts:Part[]=[box([0,h/2,0],[w,h,d],'#23262b'),box([0,h/2,d/2+.001],[w,h*.92,.002],'#9ba0a6'),
    box([-.037,.023,d/2+.003],[.108,.031,.002],'#171c20'),{t:'screen',p:[-.025,.023,d/2+.004],n:FRONT,s:[.073,.026]},text([.065,.009,d/2+.003],FRONT,'SENNHEISER',.005)];
  for(const [x,y] of [[.035,.031],[.035,.013],[.057,.031],[.057,.013],[.079,.031],[.101,.021]]) parts.push(cyl([x,y,d/2+.003],.004,.002,FRONT));
  // EM 100 G4 front (photo 1): logo square top-left, SYNC IR window left of the display, red power symbol, ew G4 mark.
  parts.push(box([-.098,.035,d/2+.003],[.007,.006,.001],'#111316'),cyl([-.084,.013,d/2+.004],.0025,.001,FRONT,'#d8dadd'),cyl([.101,.021,d/2+.0045],.0028,.001,FRONT,'#c8332c'),text([.04,.005,d/2+.003],FRONT,'ew G4',.0035));
  for(const side of [-1,1])parts.push({t:'tube',points:[[side*.08,.022,-d/2],[side*.085,.1,-d/2-.015],[side*.10,.17,-d/2-.015]],r:.0028,c:'#13171b'});
  return geo('generic-wireless-rx',[w,.17,d+.015],1.35,parts,{'audio-out':port([.073,.022,-d/2],BACK,'xlr3m')},[
    {name:'AF OUT 6.3',...port([.045,.022,-d/2],BACK,'trs')},{name:'DC',...port([.101,.022,-d/2],BACK,'dc')},
    ...[-.025,.005].map(x=>({name:`DATA ${x}`,...port([x,.022,-d/2],BACK,'rj45')}))]);
}
function bodypack():ModelGeometry {
  const w=.064,h=.082,d=.024,parts:Part[]=[box([0,h/2,0],[w,h,d],'#23272b'),box([0,h*.29,d/2+.001],[w*.94,h*.55,.002],'#181c22'),
    {t:'screen',p:[-.004,h*.73,d/2+.002],n:FRONT,s:[w*.61,h*.20]},
    box([0,h*.53,d/2+.003],[w*.9,.002,.001],'#6c7178'),box([0,h*.48,-d/2-.003],[w*.39,h*.63,.004],'#5a5e64'),
    {t:'tube',points:[[.023,h,0],[.024,h+.05,.003],[.03,h+.10,.006]],r:.0016,c:'#18191d'}];
  for(const [x,y] of [[.014,.047],[.025,.047],[.005,.04]])parts.push(cyl([x,y,d/2+.003],.0027,.0015,FRONT));
  // SK 100 G4 top (photo 1): MUTE slide switch between the MIC/LINE jack and the antenna.
  parts.push(box([.0,h+.001,0],[.016,.002,.008],'#2c3036'),box([-.003,h+.003,0],[.004,.004,.005],'#6a6f76'),text([.009,h+.0025,.0],UP,'MUTE',.0028));
  return geo('generic-wireless-tx',[w,h+.10,d+.01],1.4,parts,{'mic-in':port([-.021,h,0],UP,'jack35')});
}
function mixer(id:string,big=false):ModelGeometry {
  const w=big?.468:.308,h=big?.272:.118,d=big?.562:.422,parts:Part[]=[
    {t:'prism',profile:[[-d/2,0],[d/2,0],[d/2,.025],[-d/2,h]],x:[-w/2,w/2],c:'#242b34'},
    box([0,.009,0],[w,.018,d],'#141b22')];
  const surface=(z:number)=>.025+(d/2-z)/d*(h-.025);
  const slope=(h-.025)/d,normal:V3=[0,1/Math.hypot(1,slope),slope/Math.hypot(1,slope)];
  const surfaceKey=(p:V3,label:string,c:string,size:[number,number]):Part=>({...key(p,label,c,size),n:normal});
  const columns=big?18:8,step=(w-.035)/columns;
  for(let ch=0;ch<columns;ch++) {
    const x=-w/2+.018+ch*step;
    // QL1 strips (photo 1) carry no knobs: SEL, CUE, 6-step meter and a channel-name display with a colour bar.
    if(big) {
      const sel=surfaceKey([x,surface(-.035)+.002,-.035],'SEL',ch===0?'#3f8f6c':'#30353b',[step*.7,.01]),cue=surfaceKey([x,surface(-.012)+.002,-.012],'CUE',ch===0?'#c9573f':'#30353b',[step*.6,.008]);
      parts.push(sel,cue);
      for(let m=0;m<6;m++)parts.push(surfaceKey([x-step*.18,surface(.004+m*.005)+.0015,.004+m*.005],'',['#c7392f','#d97a35','#d9a335','#c9c13d','#7fbf4a','#4fa84a'][m],[.004,.0025]));
      parts.push(surfaceKey([x,surface(d*.2)+.002,d*.2],ch>=16?(ch===16?'ST L':'MONO'):`ch ${ch+1}`,'#d9dbe8',[step*.72,.016]),
        surfaceKey([x,surface(d*.2+.012)+.002,d*.2+.012],'',['#2f6fd0','#2f6fd0','#d2473b','#d2473b','#e2b73a','#e2b73a','#4b52c4','#4b52c4','#3ec2c0','#3ec2c0','#c78ad6','#c78ad6','#d2473b','#d2473b','#4cc06a','#4cc06a','#d2473b','#d2473b'][ch],[step*.72,.002]));
    }
    for(let row=0;row<(big?0:7);row++) {
      const z=-d*.19+row*.028;
      parts.push({t:'knob',p:[x,surface(z)+.002,z],r:big?.006:.0045,n:normal});
      if(!big)parts.push(cyl([x,surface(z)+.001,z],.0052,.001,normal,['#eef0ee','#e8d27a','#2fae5a','#2fae5a','#2fae5a','#2e8fd6','#d2352d'][row]));
    }
    const z=d*.31; parts.push(surfaceKey([x,surface(z)+.001,z],'','#05080b',[.001,d*.25*Math.hypot(1,slope)]));
    parts.push(surfaceKey([x,surface(z)+.003,z],String(ch+1),big?(ch>=columns-2?'#b9bec6':'#9da3ab'):(ch===columns-1?'#c8302a':ch===columns-2?'#1c2026':'#dfe1e3'),[step*.75,.016]));
    // MG12XU strip divider lines are blue (photo 1).
    if(!big)parts.push(surfaceKey([x+step/2,surface(0)+.0005,0],'','#1e5d9e',[.0008,d*.92*Math.hypot(1,slope)]));
    parts.push(surfaceKey([x,surface(d*.13)+.001,d*.13],'ON',big?'#d9644a':'#e0a33a',[step*.65,.009]));
  }
  if(big) {
    const z=-d*.27; parts.push({t:'screen',p:[-.064,surface(z)+.002,z],n:normal,s:[.245,.146]},
      text([0,surface(-d*.44)+.003,-d*.44],normal,'YAMAHA   QL1',.012));
  } else parts.push(box([w*.39,.032,d*.32],[w*.18,.012,d*.33],'#1267a0'),text([0,surface(-d*.44)+.003,-d*.44],UP,'YAMAHA   MG12XU',.009));
  const ports:Record<string,ModelPortGeometry>={},inert:ModelGeometry['inert']=[];
  if(big) {
    for(let n=1;n<=16;n++) {const p=port([w/2-.026-((n-1)%8)*.028,.18+Math.floor((n-1)/8)*.037,-d/2],BACK,'xlr3f'); if(n<=6)ports[`in-${n}`]=p;else inert.push({name:`INPUT ${n}`,...p});}
    for(let n=0;n<8;n++) {const p=port([-.20+(n%4)*.035,.217-Math.floor(n/4)*.037,-d/2],BACK,'xlr3m');if(n<4) ports[['pa-l','pa-r','bc-l','bc-r'][n]]=p;else inert.push({name:`OMNI OUT ${n+1}`,...p});}
  } else {
    for(let n=1;n<=4;n++) {const z=-d*.40;ports[`in-${n}`]=port([-w/2+.025+(n-1)*.033,surface(z)+.001,z],UP,'xlr3f');}
    ports['main-out']=port([w*.24,surface(-d*.39),-d*.39],UP,'xlr3m');
    inert.push({name:'STEREO R',...port([w*.36,surface(-d*.39),-d*.39],UP,'xlr3m')});
    // The legacy single stereo LINE port is a bundled training service adapter, NOT Yamaha's mono AUX/PHONES.
    ports['aux-out']={...port([w*.25,.018,d/2+.045],FRONT,'trs'),lead:true};
    // Real passive Radial J-Iso lowers the independent GROUP bus to consumer LINE level.
    // Its dual mono outputs feed a captive Hosa YPP-136 stereo breakout; no new inventory cable or objective.
    const jx=-.05,jz=d/2+.052;
    parts.push(box([jx,.024,jz],[.127,.048,.084],'#276b50'),box([jx,.002,jz],[.133,.004,.09],'#2c7356'),
      text([jx,.049,jz],UP,'Radial J-ISO',.008),cyl([w*.25,.018,d/2+.031],.007,.028,FRONT,'#171e26'));
    for(const side of [-1,1]) {
      const input=port([jx+side*.035,.026,jz+.042],FRONT,'xlr3f');
      inert.push({name:`J-Iso ${side<0?'LEFT':'RIGHT'} INPUT (supplied patch)`,...input},
        {name:`J-Iso mono output ${side}`, ...port([jx+side*.025,.026,jz-.042],BACK,'trs')});
      parts.push({t:'tube',points:[[w*.25+side*.012,surface(-d*.33),-d*.33],[w/2+.025,.05,-d*.15],[w/2+.02,.014,jz+.06],[jx+side*.035,.026,jz+.06],input.at],r:.0025,c:'#17191e'},
        {t:'tube',points:[[jx+side*.025,.026,jz-.042],[jx+side*.025,.015,jz-.049],[w*.20,.010,d/2+.005],[w*.25,.018,d/2+.020]],r:.0023,c:'#181b20'});
    }
  }
  const result=geo(id,[w,h,d],big?1.6:1.45,parts,ports,inert);
  if(!big)result.stagingBounds={min:[-w/2,0,-d/2],max:[w/2+.03,h,d/2+.118]};
  return result;
}
function atem():ModelGeometry {
  const w=.3699,h=.0381,d=.1364,parts:Part[]=[box([0,h/2,0],[w,h,d],'#20252c')],ports:Record<string,ModelPortGeometry>={},inert:ModelGeometry['inert']=[];
  const rear=(px:number,kind:SocketKind)=>port([-(px-331)/662*w,.015,-d/2],BACK,kind);
  for(let n=1;n<=8;n++) {const p=rear(540-(n-1)*41.4,'hdmi');if(n<=4)ports[`hdmi-in-${n}`]=p;else inert.push({name:`HDMI IN ${n}`,...p});}
  ports['hdmi-mv-out']=rear(167,'hdmi');ports['hdmi-pgm-out']=rear(209,'hdmi');ports['audio-in']=rear(591,'jack35');
  inert.push({name:'MIC 2',...rear(570,'jack35')},{name:'HEADPHONES',...rear(612,'jack35')},{name:'DC',...rear(49,'dc')},{name:'ATEM CONTROL',...rear(78,'rj45')},...['USB 1','USB 2'].map((name,i)=>({name,...rear(109+i*25,'usbc')})));
  for(let n=1;n<=8;n++) {const x=-w/2+.026+(n-1)*.028;parts.push(key([x,h+.001,d*.35],String(n),n===3?'#d8352c':'#d9dadc',[.023,.017]));}
  // Transition block (photo 1): CUT, lit AUTO and FTB to the right of the eight source keys.
  [['CUT','#d9dadc'],['AUTO','#f4f4f2'],['FTB','#d9dadc']].forEach(([label,c],i)=>parts.push(key([.098+i*.033,h+.001,d*.35],label,c,[.027,.017])));
  for(let row=0;row<8;row++)for(let col=0;col<23;col++) {
    const z=-d*.34+row*.0092,x=-w/2+.02+col*.0143;
    parts.push(key([x,h+.001,z],row===0&&col===0?'ON':'',row===0&&col<3?'#943a37':'#15191f',[.010,.005]));
  }
  parts.push(text([-.11,h+.003,-d*.46],UP,'ATEM Mini Extreme',.005));
  return geo('generic-studio-switcher',[w,h,d],1.7,parts,ports,inert);
}
function monitor(id:string):ModelGeometry {
  const w=.429,h=.282,d=.07,parts:Part[]=[box([0,h/2+.025,0],[w,h,d],'#191e25'),
    {t:'screen',p:[0,h/2+.035,.0355],n:FRONT,s:[.377,.212]},box([-w*.36,.012,.005],[.05,.024,.14],'#232831'),box([w*.36,.012,.005],[.05,.024,.14],'#232831'),text([0,.035,.036],FRONT,'SONY',.009)];
  for(let i=0;i<10;i++)parts.push(cyl([-.14+i*.031,.045,.036],.0035,.002,FRONT));
  return geo(id,[w,h+.025,.14],1.4,parts,{[id==='generic-sdi-monitor'?'sdi-in':'hdmi-in']:port([-.125,.135,-d/2],BACK,id==='generic-sdi-monitor'?'bnc':'hdmi')},[
    {name:'SDI 2',...port([-.095,.135,-d/2],BACK,'bnc')},{name:'AC',...port([.14,.1,-d/2],BACK,'iec')}]);
}
function optical(id:string,tx:boolean):ModelGeometry {
  const w=.11,h=.023,d=.059,parts:Part[]=[box([0,h/2,0],[w,h,d],'#656a6d'),
    text([0,h+.001,0],UP,'Mini Converter',.007),text([0,h+.001,.012],UP,'Optical Fiber 12G',.0045),
    text([.02,h+.001,-.018],UP,'Blackmagicdesign',.0035),box([0,h+.0006,.005],[.05,.0004,.0008],'#e0892e'),text([-.02,h+.001,.024],UP,'ULTRA HD   12G SDI',.003)];
  return geo(id,[w,h,d],2.4,parts,tx?{'sdi-in':port([w/2,.012,-.011],RIGHT,'bnc'),'optical-out':port([-w/2,.012,0],LEFT,'optical-lc')}:{'sdi-out':port([w/2,.012,.011],RIGHT,'bnc'),'optical-in':port([-w/2,.012,0],LEFT,'optical-lc')},[
    {name:tx?'SDI OUT':'SDI IN',...port([w/2,.012,tx?.011:-.011],RIGHT,'bnc')},{name:'POWER',...port([w/2,.012,.024],RIGHT,'dc')}]);
}
function gateway():ModelGeometry {
  // ER605 V1 front (photo 1): tp-link / ER605 label and Power + System LEDs left, five RJ45 right of centre, Link/Act + RESET far right.
  const w=.158,h=.025,d=.101,x0=-.018,parts:Part[]=[box([0,h/2,0],[w,h,d],'#4a4e53'),text([0,h+.001,0],UP,'tp-link | Omada',.008),
    text([-.06,.017,d/2+.001],FRONT,'tp-link',.005),text([-.06,.01,d/2+.001],FRONT,'ER605',.0028),text([-.055,.005,d/2+.001],FRONT,'Omada Gigabit VPN Router',.0022),
    box([-.033,.016,d/2+.001],[.004,.003,.001],'#2f7a5a'),box([-.033,.009,d/2+.001],[.004,.003,.001],'#2f7a5a'),
    box([x0+.019*2,.012,d/2+.0005],[.08,.017,.001],'#c3c6ca'),cyl([.07,.009,d/2+.001],.0015,.001,FRONT,'#0b0d10'),text([.07,.004,d/2+.001],FRONT,'RESET',.0022),
    cyl([.066,.019,d/2+.001],.0008,.001,FRONT,'#52c46a'),cyl([.066,.016,d/2+.001],.0008,.001,FRONT,'#52c46a')];
  const ports:Record<string,ModelPortGeometry>={};for(let i=0;i<5;i++) {
    const p=port([x0+i*.019,.012,d/2],FRONT,'rj45');if(i<3)ports[['wan','lan-1','lan-2'][i]]=p;
    parts.push(cyl([x0-.006+i*.019,.017,d/2+.001],.0006,.001,FRONT,'#538b4d'));
  }
  return geo('generic-gateway',[w,h,d],2.1,parts,ports,[{name:'LAN 3',...port([x0+.057,.012,d/2],FRONT,'rj45')},{name:'LAN 4',...port([x0+.076,.012,d/2],FRONT,'rj45')},{name:'DC',...port([.05,.012,-d/2],BACK,'dc')}]);
}
function server():ModelGeometry {
  const w=.434,h=.043,d=.585,parts:Part[]=[box([0,h/2,0],[w,h,d],'#949aa2'),box([0,h/2,d/2+.001],[w,h,.002],'#212730'),text([0,.024,d/2+.003],FRONT,'DELL EMC',.010)];
  for(let i=0;i<4;i++)parts.push(box([-.153+i*.101,.022,d/2+.004],[.094,.033,.006],'#333b45'),box([-.153+i*.101,.019,d/2+.009],[.06,.004,.004],'#b3b6bb'));
  return geo('generic-test-ingest',[w,h,d],1,parts,{'wan-in':port([.12,.02,-d/2],BACK,'rj45')},[{name:'NIC 2',...port([.145,.02,-d/2],BACK,'rj45')},{name:'AC',...port([-.16,.02,-d/2],BACK,'iec')}]);
}
function replay():ModelGeometry {
  const w=.173,h=.369,d=.420,parts:Part[]=[box([0,h/2,0],[w,h,d],'#24292f'),box([0,h*.4,d/2+.002],[w*.89,h*.72,.002],'#11171b'),box([0,h*.88,d/2+.002],[w*.91,.045,.003],'#34383d'),cyl([0,.13,d/2+.004],.016,.002,FRONT,'#0c0f12'),cyl([0,.13,d/2+.0045],.0155,.001,FRONT,'#d9dcdf'),cyl([0,.13,d/2+.005],.0135,.001,FRONT,'#0c0f12'),text([0,.13,d/2+.0055],FRONT,'DELL',.007)];
  parts.push({t:'pattern',p:[0,h*.4,d/2+.003],n:FRONT,points:Array.from({length:20*10},(_,i)=>[(i%10-4.5)*.013,(Math.floor(i/10)-9.5)*.012] as [number,number]),r:.002,c:'#444b54'});
  parts.push(box([.013,.105,-d/2-.001],[.145,.025,.002],'#8c959c'),text([0,.13,-d/2-.003],BACK,'DeckLink Duo 2',.005),
    cyl([w*.34,h*.79,d/2+.003],.0035,.003,FRONT,'#919ba6'),box([0,h*.84,d/2+.004],[w*.8,.001,.001],'#979da4'),
    {t:'pattern',p:[-.04,.25,-d/2-.002],n:BACK,points:Array.from({length:64},(_,i)=>[(i%8-3.5)*.007,(Math.floor(i/8)-3.5)*.007] as [number,number]),r:.0017,c:'#070b10'});
  return geo('reference-replay',[w,h,d],1,parts,{'sdi-out':port([-.04,.105,-d/2-.002],BACK,'bnc')},[
    ...[-.012,.016,.044].map((x,i)=>({name:`DeckLink SDI ${i+2}`,...port([x,.105,-d/2-.002],BACK,'bnc')})),
    {name:'DeckLink REFERENCE IN',...port([.072,.105,-d/2-.002],BACK,'bnc')},
    {name:'PSU AC',...port([.045,.34,-d/2],BACK,'iec')},{name:'NIC',...port([.05,.22,-d/2],BACK,'rj45')},
    ...[.22,.24,.26].map((y,i)=>({name:`FRONT USB ${i+1}`,...port([.061,y,d/2],FRONT,'usba')})),
    {name:'FRONT USB-C',...port([.061,.28,d/2],FRONT,'usbc')}]);
}
function stagebox():ModelGeometry {
  const w=.255,h=.065,d=.11,parts:Part[]=[box([0,h/2,0],[w,h,d],'#22282e'),text([0,h+.002,.035],UP,'Whirlwind MINI 6',.007)];
  const ports:Record<string,ModelPortGeometry>={multicore:port([w/2,h/2,0],RIGHT,'multipin')};
  for(let n=1;n<=6;n++) ports[`mic-in-${n}`]=port([-.103+(n-1)*.041,h,-.011],UP,'xlr3f');
  // MINI 6 (photo 1): numbered XLR row, silver multipin barrel on the right end with blue snake cable, rubber feet.
  for(let n=1;n<=6;n++) parts.push(text([-.103+(n-1)*.041,h+.001,-.042],UP,String(n),.008),box([-.103+(n-1)*.041,h+.0005,-.011],[.032,.001,.036],'#15181c'));
  parts.push(cyl([w/2+.025,h/2,0],.016,.05,RIGHT,'#b9bdc1'),{t:'tube',points:[[w/2+.05,h/2,0],[w/2+.09,h/2,-.03],[w/2+.1,.012,-.09]],r:.006,c:'#2c4d72'});
  for(const x of [-1,1])for(const z of [-1,1])parts.push(cyl([x*w*.42,.003,z*d*.35],.007,.006,UP,'#0c0e10'));
  parts.push({t:'tube',points:[[-.09,.01,-.055],[-.09,.06,-.075],[.09,.06,-.075],[.09,.01,-.055]],r:.005,c:'#171a20'});
  return geo('reference-stagebox-6',[w,h+.005,d+.025],1.9,parts,ports);
}
function tail():ModelGeometry {
  const parts:Part[]=[cyl([0,.026,.075],.023,.05,FRONT,'#6a7179')],ports:Record<string,ModelPortGeometry>={multicore:port([0,.026,.1],FRONT,'multipin')};
  for(let n=1;n<=6;n++) {
    const x=(n-3.5)*.05,z=-.105-(n%2)*.035;
    ports[`tail-${n}`]={...port([x,.018,z],BACK,'xlr3m'),lead:true};
    parts.push({t:'tube',points:[[0,.026,.045],[x*.4,.014,-.025],[x,.018,z+.035]],r:.003,c:'#171b20'},cyl([x,.018,z+.019],.012,.038,[0,0,1],'#3a424b'),cyl([x,.018,z+.03],.0122,.004,[0,0,1],['#ab4b42','#b79a50','#3e789b','#629361','#8e6598','#9a9da3'][n-1]));
  }
  return geo('reference-tail-6',[.3,.055,.26],1.45,parts,ports);
}
function lav():ModelGeometry {
  const parts:Part[]=[cyl([0,.013,0],.00525,.018,UP,'#171b22'),cyl([0,.023,0],.0056,.003,UP,'#292e35'),box([.012,.006,0],[.025,.004,.006],'#232830'),box([.015,.002,0],[.023,.002,.006],'#12171d'),
    {t:'tube',points:[[0,.004,0],[.02,.003,.025],[.03,.004,.05],[.015,.005,.07]],r:.0012,c:'#12161a'},cyl([.015,.005,.075],.0035,.015,FRONT),
    cyl([.015,.005,.084],.0042,.005,FRONT,'#c9a14a'),cyl([0,.0255,0],.0052,.002,UP,'#3a3f45')]; // ME 2: gold locking ring, mesh capsule top
  return geo('generic-lav-mic',[.048,.028,.09],1.5,parts,{out:{...port([.015,.005,.085],FRONT,'jack35'),lead:true}});
}
function mic(id:string,shotgun=false):ModelGeometry {
  const L=shotgun?.256:.265,r=shotgun?.01:.019,cy=shotgun?.012:.025;
  const parts:Part[]=[{t:'lathe',p:[0,cy,0],n:RIGHT,c:'#2e333a',profile:[[0,-L/2],[r*.8,-L/2],[r,-L*.38],[r,L*.40],[r*.7,L/2],[0,L/2]]}];
  if(shotgun)for(let i=0;i<18;i++)parts.push(box([-L*.41+i*.007,cy+r-.0003,0],[.002,.001,.009],'#090b0e'));
  // MKE 600 (photo 1): silver mesh capsule end, ON / LOW CUT switch window mid-body, SENNHEISER + MKE 600 on the rear tube.
  if(shotgun)parts.push(cyl([-L/2-.0005,cy,0],r*.92,.002,LEFT,'#b9bdc2'),box([.0,cy+r-.0002,0],[.02,.002,.007],'#1d2126'),
    cyl([-.003,cy+r+.0008,0],.0009,.0005,UP,'#53d36b'),text([.07,cy+r+.0004,0],UP,'SENNHEISER',.0035),text([.07,cy+r+.0004,.0045],UP,'MKE 600',.0022));
  else {
    parts.push(cyl([-L*.34,cy,0],.024,.05,RIGHT,'#454d55'),{t:'screen',p:[L*.28,cy+.016,0],s:[.029,.011],n:UP});
    for(let i=0;i<5;i++)parts.push(cyl([-L*.42+i*.009,cy,0],.0242,.001,RIGHT,'#7a8188'));
  }
  return geo(id,[L,cy*2,.05],1.35,parts,shotgun?{'xlr-out':port([L/2,cy,0],RIGHT,'xlr3m')}:{},[]);
}
export const SELECTED_PRODUCT_GEOMETRY:Record<string,ModelGeometry>={
  'generic-dynamic-mic':HARDWARE_GEOMETRY['shure-sm58'],
  'generic-ambience-mic':HARDWARE_GEOMETRY['shure-sm58'],
  'generic-hdmi-camera':{size:[.32,1.5,.45],displayScale:1,source:['art/blender/hc-x2000-manifest.json'],
    ports:{'hdmi-out':port([.048,1.3,.168],FRONT,'hdmi')},inert:[],estimates:['ใช้ HC-X2000 GLB เดิม; ตำแหน่ง VIDEO OUT เป็นจุดบริการประมาณจาก manifest ไม่อ้างพิกัดโรงงาน']},
  ...Object.fromEntries(['generic-laptop','generic-obs-host','generic-graphics-pc'].map(id=>[id,laptop(id)])),
  'generic-wireless-rx':receiver(),'generic-wireless-tx':bodypack(),'generic-4ch-mixer':mixer('generic-4ch-mixer'),
  'reference-console-6':mixer('reference-console-6',true),'generic-studio-switcher':atem(),
  'generic-hdmi-monitor':monitor('generic-hdmi-monitor'),'generic-sdi-monitor':monitor('generic-sdi-monitor'),
  'reference-fiber-tx':optical('reference-fiber-tx',true),'reference-fiber-rx':optical('reference-fiber-rx',false),
  'generic-gateway':gateway(),'generic-test-ingest':server(),'reference-replay':replay(),
  'reference-stagebox-6':stagebox(),'reference-tail-6':tail(),'generic-lav-mic':lav(),
  'reference-handheld-tx':mic('reference-handheld-tx'),'reference-shotgun':mic('reference-shotgun',true),
};
