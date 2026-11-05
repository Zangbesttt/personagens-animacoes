import * as THREE from './three.module.js';

const canvas=document.querySelector('#film');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
renderer.setPixelRatio(1); renderer.setSize(720,1280,false);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x91c9e8); scene.fog=new THREE.Fog(0x9bc9df,34,100);
const camera=new THREE.PerspectiveCamera(43,720/1280,.1,180);
const hemi=new THREE.HemisphereLight(0xc9eaff,0x66506b,2.0); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe6bd,3.2); sun.position.set(-15,28,12); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;scene.add(sun);
const fill=new THREE.PointLight(0x5caaff,2,55);fill.position.set(10,12,-8);scene.add(fill);
const mat=(color,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const M={grass:mat(0x4b9b72),road:mat(0x394c60),stone:mat(0x9bafbb),cream:mat(0xf1d9ad),brick:mat(0xc86f5a),blue:mat(0x4c8fb8),roof:mat(0x344c70),dark:mat(0x18273e),gold:mat(0xf5bd55,.45),glow:new THREE.MeshBasicMaterial({color:0x9ff8ff}),white:mat(0xf8f5eb),green:mat(0x4fc38b),purple:mat(0x8762b8),black:mat(0x101626),skin:mat(0xd99b72),teal:mat(0x2b9b9a),red:mat(0xe36a58)};
const box=(w,h,d,m,x=0,y=0,z=0,parent=scene)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
const sphere=(r,m,x=0,y=0,z=0,parent=scene,seg=16)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,seg,12),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o};
const group=(p=scene)=>{const g=new THREE.Group();p.add(g);return g};

// island + street grid
const island=box(34,1.3,34,M.grass,0,-.9,0); island.scale.y=1;
box(38,1,38,mat(0x32465e),0,-1.8,0).scale.set(1,.7,1);
box(4,.08,34,M.road,0,-.18,0);box(34,.08,4,M.road,0,-.17,1);
for(let z=-15;z<17;z+=3)box(.12,.025,1.15,M.gold,0,-.1,z);
for(let x=-15;x<17;x+=3)box(1.1,.025,.12,M.gold,x,-.1,1);
const buildings=[];
function building(x,z,w,h,d,color,roofColor){
 const g=group(); box(w,h,d,mat(color),x,h/2-.15,z,g);
 box(w+.35,.38,d+.35,mat(roofColor),x,h-.12,z,g);
 const cols=Math.max(1,Math.floor(w/1.25)), rows=Math.max(1,Math.floor(h/1.5));
 for(let a=0;a<cols;a++)for(let b=0;b<rows;b++){
  const wx=x-w/2+.65+a*(w-1.0)/Math.max(1,cols-1), wy=.85+b*1.35;
  const win=box(.36,.55,.05,mat(0xffd77d,.35),wx,wy,z-d/2-.035,g);
  win.material.emissive=new THREE.Color(0x5c3611);win.material.emissiveIntensity=.25;
 }
 box(.9,1.5,.12,mat(0x4d3b39),x,.6,z-d/2-.09,g);
 buildings.push(g); return g;
}
building(-10,-9,5,8,5,0xd88968,0x65485e);
building(-4,-12,4,11,5,0x76a9b9,0x3b637d);
building(7,-11,5,7,5,0xe0b77b,0x875d55);
building(12,-4,4,9,5,0x7b9b83,0x456b6c);
building(-12,5,5,6,5,0x9c7eaa,0x5c496f);
building(11,7,5,8,5,0xd77f5e,0x67485b);
building(-8,12,4,5,4,0xe1c58c,0x8a634e);
building(7,13,5,6,4,0x79a5b0,0x456b7d);
// clock tower
const tower=group(); box(3.3,13,3.3,M.cream,0,6.1,-7,tower);box(4.1,.65,4.1,M.roof,0,12.9,-7,tower);
const clockFace=sphere(1.15,M.white,0,9.5,-5.25,tower,24);clockFace.scale.set(1,1,.12);
box(.09,1.4,.08,M.dark,0,9.5,-5.08,tower);box(1.1,.08,.08,M.dark,.48,9.5,-5.08,tower);
const spire=new THREE.Mesh(new THREE.ConeGeometry(1.4,3,4),M.gold);spire.position.set(0,14.6,-7);spire.castShadow=true;tower.add(spire);
// market stalls
for(let i=0;i<5;i++){let x=-10+i*4.8;box(2.7,1.4,2,M.cream,x,.7,4);box(3,.25,2.3,mat(i%2?0x5e9eb0:0xe18b63),x,1.55,4);box(.12,2,.12,M.dark,x-1.25,1,4);box(.12,2,.12,M.dark,x+1.25,1,4);sphere(.32,M.gold,x,.35,2.85);}
// trees
for(const [x,z] of [[-14,-2],[-14,11],[14,2],[2,15],[-2,-15]]){
 box(.55,2,.55,mat(0x79543d),x,1,z);
 for(let i=0;i<3;i++)sphere(1.15-i*.12,mat(i===1?0x3d9c72:0x4cb77d),x+(i-1)*.6,2.8+i*.25,z,scene,12);
}
// street lamps
const lamps=[];
for(const [x,z] of [[-14,-7],[14,-8],[-14,8],[14,9],[-5,2],[5,2],[0,-14]]){
 const g=group();box(.16,3,.16,M.dark,x,1.4,z,g);box(.9,.12,.5,M.dark,x,2.9,z,g);const bulb=sphere(.24,M.glow,x,2.75,z,g);bulb.material=mat(0xffe8a3,.25);bulb.material.emissive=new THREE.Color(0xffc75c);bulb.material.emissiveIntensity=1.2;const l=new THREE.PointLight(0xffc76d,1.1,7);l.position.set(x,2.6,z);g.add(l);lamps.push({g,bulb,l,base:new THREE.Vector3(x,0,z)});
}
// small clouds
const clouds=[];
for(let i=0;i<9;i++){const g=group();let x=(i%3-1)*22+(i%2)*3,z=-24-Math.floor(i/3)*12;for(let j=0;j<4;j++)sphere(1.8-j*.15,mat(0xf2f7ff),x+(j-1.5)*1.25,19+(j%2)*.5,z,g,12);clouds.push(g);}
// character factory
function makeCharacter({coat,legs,hair,hat,accessory}) {
 const root=group(), torso=group(root);box(.92,1.05,.55,mat(coat),0,1.55,0,torso);sphere(.48,mat(0xe3ad84),0,2.42,0,torso,18);
 sphere(.5,mat(hair),0,2.7,-.02,torso,16);
 if(hat){box(.9,.16,.9,mat(hat),0,2.98,0,torso);box(.52,.24,.52,mat(hat),0,3.14,0,torso);}
 // eyes facing camera-ish toward -z
 sphere(.065,M.dark,-.16,2.47,-.43,torso,10);sphere(.065,M.dark,.16,2.47,-.43,torso,10);
 box(.18,.045,.035,mat(0x8c4b49),0,2.22,-.47,torso);
 const arms=[];
 for(const s of [-1,1]){const a=group(torso);box(.28,.9,.3,mat(coat),s*.62,1.55,0,a);a.position.set(s*.62,1.95,0);a.userData.side=s;arms.push(a);}
 const legsG=[];
 for(const s of [-1,1]){const l=group(torso);box(.34,.85,.38,mat(legs),s*.25,.45,0,l);l.position.set(s*.25,.85,0);legsG.push(l);}
 if(accessory){const pack=box(.55,.65,.25,mat(accessory),0,1.65,.36,torso);pack.rotation.x=-.1;}
 return {root,torso,arms,legs:legsG};
}
const nilo=makeCharacter({coat:0x287f8d,legs:0x253d59,hair:0x3c2a2a,hat:0xe9a84f,accessory:0xd35c46});nilo.root.position.set(-2,0,3);
const bia=makeCharacter({coat:0x8b5eb1,legs:0x2c3e63,hair:0x39b89b,hat:0x2c4059,accessory:0xe6a24e});bia.root.position.set(2,0,2);
const citizens=[];
for(let i=0;i<9;i++){let c=makeCharacter({coat:[0x4b9d77,0xc9795f,0x597fae][i%3],legs:0x34435a,hair:[0x342a32,0x593d2d,0x283e4c][i%3],hat:null,accessory:null});c.root.scale.setScalar(.72);c.root.position.set(-12+(i%5)*5.5,0,7+Math.floor(i/5)*2);citizens.push(c);}
// detached shadow and guardian
const shadowMat=new THREE.MeshBasicMaterial({color:0x10152a,transparent:true,opacity:.95});
const shadow=group();const shBody=new THREE.Mesh(new THREE.CapsuleGeometry(.58,1.1,4,8),shadowMat);shBody.position.y=1.25;shadow.add(shBody);
for(const s of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.22,1.4,3,7),shadowMat);arm.position.set(s*.8,1.35,0);arm.rotation.z=s*.5;shadow.add(arm);}
const guardian=group();guardian.visible=false;const gb=new THREE.Mesh(new THREE.CapsuleGeometry(1.8,3.6,5,12),shadowMat);gb.position.y=3;guardian.add(gb);
for(const s of [-1,1]){const a=new THREE.Mesh(new THREE.CapsuleGeometry(.7,4.8,5,10),shadowMat);a.position.set(s*2.6,3.1,0);a.rotation.z=s*.62;guardian.add(a);const wing=new THREE.Mesh(new THREE.ConeGeometry(1.5,4,5),shadowMat);wing.position.set(s*3.6,5,-.2);wing.rotation.z=s*-.7;guardian.add(wing);}
const star=group();const starLight=new THREE.PointLight(0xffd45e,0,20);star.add(starLight);starLight.position.set(0,0,1);const starCore=sphere(.7,mat(0xffe68a,.2),0,0,0,star,20);starCore.material.emissive=new THREE.Color(0xffc63f);starCore.material.emissiveIntensity=2;
for(let i=0;i<8;i++){let p=new THREE.Mesh(new THREE.ConeGeometry(.24,.8,5),mat(0xffd45e));p.position.set(Math.cos(i*Math.PI/4)*.72,Math.sin(i*Math.PI/4)*.72,0);p.rotation.z=i*Math.PI/4+Math.PI/2;star.add(p);}
sphere(.08,M.dark,-.2,.05,.62,star,10);sphere(.08,M.dark,.2,.05,.62,star,10);
star.position.set(0,8,-7);
// particles
const particles=[];
for(let i=0;i<150;i++){let p=sphere(.045+(i%4)*.018,mat(i%3?0x8fe7ff:0xffdb82),0,0,0,scene,7);p.visible=false;particles.push(p);}
const burst=group();const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.12,8,64),new THREE.MeshBasicMaterial({color:0xffe28a,transparent:true,opacity:.9}));ring.rotation.x=Math.PI/2;burst.add(ring);
for(let i=0;i<36;i++){let q=sphere(.08,M.glow,0,0,0,burst,7);q.userData.a=i/36*Math.PI*2;q.userData.r=1.2+Math.random()*2;}
const keys=[
 [0,[24,25,31],[0,2,0]],[6,[-2,4,-2],[-2,2.2,3]],[13,[-3,5,-5],[-2,2.2,3]],[20,[0,6,-5],[0,2.2,1]],
 [29,[7,11,0],[0,5,-5]],[37,[9,9,-1],[0,6,-7]],[45,[0,27,24],[0,0,0]],[53,[-2,4,-2],[-2,2.2,3]],[60,[-2,4,-2],[-2,2.2,3]]
];
const smooth=x=>x*x*(3-2*x);
function cameraAt(t){let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;let a=keys[i],b=keys[i+1],u=smooth(THREE.MathUtils.clamp((t-a[0])/(b[0]-a[0]),0,1));camera.position.set(...a[1].map((v,k)=>THREE.MathUtils.lerp(v,b[1][k],u)));let target=new THREE.Vector3(...a[2].map((v,k)=>THREE.MathUtils.lerp(v,b[2][k],u)));camera.lookAt(target);}
const captions=[
 [0,6,"Na cidade de Solária, a noite nunca assustava ninguém.","CAPÍTULO 01 · A CIDADE DAS LUZES"],
 [6,13,"Até Nilo perceber que sua sombra estava... atrasada.","CAPÍTULO 02 · ALGO FORA DO LUGAR"],
 [13,20,"Então ela se soltou do chão. E todas fizeram o mesmo!","CAPÍTULO 03 · A FUGA DAS SOMBRAS"],
 [20,29,"Nilo e Bia correram atrás delas pela feira.","CAPÍTULO 04 · A PERSEGUIÇÃO"],
 [29,37,"No alto da torre, uma criatura enorme os esperava.","CAPÍTULO 05 · O GUARDIÃO"],
 [37,45,"Mas havia uma pequena estrela brilhando em seu peito.","CAPÍTULO 06 · A VERDADE"],
 [45,53,"A sombra não queria destruir a cidade. Queria protegê-la.","CAPÍTULO 07 · A LUZ RETORNA"],
 [53,60,"E a sombra de Nilo... ainda tinha algo a dizer.","CAPÍTULO 08 · UM ÚLTIMO SEGREDO"]
];
function moveChar(c,x,z,t,run=false){c.root.position.x=x;c.root.position.z=z;c.root.position.y=Math.abs(Math.sin(t*8))*(run?.13:.04);c.torso.rotation.z=run?Math.sin(t*8)*.09:Math.sin(t*2)*.025;c.arms.forEach((a,i)=>a.rotation.x=run?Math.sin(t*8+i*Math.PI)*.85:Math.sin(t*2+i)*.08);c.legs.forEach((l,i)=>l.rotation.x=run?Math.sin(t*8+i*Math.PI)*.7:0);}
function update(t){
 const night=THREE.MathUtils.clamp((t-5)/9,0,1);const warm=THREE.MathUtils.clamp((t-44)/8,0,1);
 scene.background.setRGB(.57-night*.38,.79-night*.57,.91-night*.49);scene.fog.color.copy(scene.background);
 sun.intensity=3.2-night*2.2+warm*1.1;hemi.intensity=2-night*.85+warm*.8;fill.intensity=2+night*1.5;
 lamps.forEach((l,i)=>{let blink=t>7?(.2+Math.abs(Math.sin(t*3.4+i))*.8):.15;l.l.material?.color?.setHex?.(0xffd77d);l.bulb.material.emissiveIntensity=night*(.6+blink*1.8)+warm*.5;l.l.intensity=night*blink*2;});
 clouds.forEach((c,i)=>{c.position.x=Math.sin(t*.12+i)*1.4;c.position.y=Math.sin(t*.3+i)*.3;});
 // city lifts briefly, then settles
 island.position.y=t>15&&t<22?Math.sin((t-15)/7*Math.PI)*.8:0;
 moveChar(nilo, t<18?-2:THREE.MathUtils.lerp(-2,-.8,Math.min(1,(t-18)/14)), t<18?3:THREE.MathUtils.lerp(3,-3,Math.min(1,(t-18)/14)),t,t>17&&t<37);
 moveChar(bia, t<18?2:THREE.MathUtils.lerp(2,1.4,Math.min(1,(t-18)/14)), t<18?2:THREE.MathUtils.lerp(2,-4,Math.min(1,(t-18)/14)),t,t>17&&t<37);
 if(t>37&&t<45){nilo.root.position.set(-2,0,-1.5);bia.root.position.set(2,0,-1.5);}
 if(t>=53){nilo.root.position.set(-2,0,3);bia.root.position.set(2,0,3);}
 citizens.forEach((c,i)=>{c.root.rotation.y=Math.sin(t*2+i)*.18;if(t>14)c.root.position.y=.06+Math.sin(t*5+i)*.05;});
 // Nilo's shadow slips away and races toward the tower
 shadow.visible=t>9&&t<39;shadow.position.set(THREE.MathUtils.lerp(-2,0,THREE.MathUtils.clamp((t-10)/20,0,1)),.03,THREE.MathUtils.lerp(3,-6,THREE.MathUtils.clamp((t-10)/20,0,1)));shadow.scale.set(.75,.22,.75);shadow.rotation.y=t*.5;
 guardian.visible=t>29&&t<54;guardian.position.set(0,Math.max(0,Math.min(1,(t-29)/7))*1.3,-8);guardian.scale.setScalar(t<37?THREE.MathUtils.lerp(.15,1,Math.max(0,(t-29)/8)):1);
 star.visible=t>37;star.position.set(0,8.5+Math.sin(t*3)*.25,-4.5);star.rotation.y=t*1.4;star.scale.setScalar(t<44?1:THREE.MathUtils.lerp(1,1.5,Math.min(1,(t-44)/8)));starLight.intensity=t>37?3+warm*4:0;
 burst.visible=t>37&&t<51;let bp=THREE.MathUtils.clamp((t-37)/7,0,1);burst.position.set(0,7,-7);burst.scale.setScalar(.1+bp*5);ring.material.opacity=(1-bp)*.85;
 burst.children.slice(1).forEach(q=>{let a=q.userData.a,rr=q.userData.r*(.2+bp*2);q.position.set(Math.cos(a)*rr,Math.sin(a)*rr,Math.sin(a*2)*.5);q.scale.setScalar(.7+bp);});
 particles.forEach((p,i)=>{let a=i*2.399,phase=(t*1.7+i*.17);let r=(t>37?2+((i*7)%13):.4);p.position.set(Math.cos(a+phase*.12)*r,3+Math.sin(phase)*2+((i%7)-3)*.3,-7+Math.sin(a)*r);p.visible=t>35&&t<54;p.material.opacity=1;});
 // lights face toward the sky after the reveal
 if(t>45)lamps.forEach((l,i)=>{l.g.rotation.z=Math.sin(t*.7+i)*.05;});
 cameraAt(t);
 const active=captions.find(c=>t>=c[0]&&t<c[1])||captions[captions.length-1];
 document.querySelector('#caption').textContent=active[2];document.querySelector('#chapter').textContent=active[3];
 document.querySelector('#progress').style.width=(t/60*100)+'%';
 document.querySelector('#top').style.opacity=t>6?0:1;
 renderer.render(scene,camera);
}
let start=performance.now(),paused=false,elapsed=0,raf=0;
function loop(now){if(!paused){elapsed=(now-start)/1000;update(Math.min(60,elapsed));if(elapsed>=60){paused=true;document.querySelector('#toggle').textContent='Reproduzir';}}raf=requestAnimationFrame(loop);}
window.__renderFrame=(t)=>{paused=true;update(t);return true;};window.__duration=60;
document.querySelector('#toggle').onclick=()=>{if(paused){start=performance.now()-elapsed*1000;paused=false;document.querySelector('#toggle').textContent='Pausar';}else{paused=true;document.querySelector('#toggle').textContent='Reproduzir';}};
document.querySelector('#restart').onclick=()=>{elapsed=0;start=performance.now();paused=false;document.querySelector('#toggle').textContent='Pausar';update(0);};
update(0);loop(performance.now());
