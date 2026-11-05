(() => {
"use strict";
const canvas=document.getElementById("film"),ctx=canvas.getContext("2d");
const W=1280,H=720,DURATION=98;
const $=id=>document.getElementById(id);
let playing=true,started=performance.now(),pausedAt=0,last=0,soundOn=false,audio=null,audioOsc=null,audioGain=null;
const chapters=[
{t:0,name:"CAPITULO 01 - A SEMENTE",who:"NARRADOR",line:"Na pequena Brumavila, a noite nunca era completamente escura."},
{t:12,name:"CAPITULO 02 - O VISITANTE",who:"DORA",line:"Isso n\u00e3o \u00e9 uma estrela. Est\u00e1 crescendo!"},
{t:25,name:"CAPITULO 03 - O HOMEM DEBAIXO DA TERRA",who:"MIRO",line:"Eu lembro do meu nome. S\u00f3 n\u00e3o lembro do meu rosto."},
{t:40,name:"CAPITULO 04 - A LUA CAIU",who:"IVO",line:"A lua n\u00e3o caiu do c\u00e9u. Ela est\u00e1 chamando a gente."},
{t:55,name:"CAPITULO 05 - O LOBO E A CARTOGRAFA",who:"NOX",line:"Eu desenhei este lugar antes de ele existir."},
{t:70,name:"CAPITULO 06 - A VERDADE",who:"LUMA",line:"Voc\u00eas n\u00e3o est\u00e3o perdidos. Est\u00e3o dentro de mim."},
{t:86,name:"CAPITULO 07 - UM NOVO COMECO",who:"NARRADOR",line:"E, pela primeira vez, Brumavila olhou para o universo de fora."}
];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
const mix=(a,b,t)=>a+(b-a)*t;
function rounded(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function line(x1,y1,x2,y2,color,width=5){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function star(x,y,r,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle="#f8e8b7";ctx.globalAlpha=.5+.5*Math.sin(a*2);ctx.beginPath();for(let i=0;i<8;i++){let q=i%2?r*.35:r;let ang=i*Math.PI/4;ctx.lineTo(Math.cos(ang)*q,Math.sin(ang)*q)}ctx.closePath();ctx.fill();ctx.restore()}
function background(t){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#101b35");g.addColorStop(.58,"#354d70");g.addColorStop(1,"#d28d70");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 for(let i=0;i<100;i++){let x=(i*197+40)%W,y=(i*83+22)%390;star(x,y,2+(i%3),t*.12+i)}
 let glow=ctx.createRadialGradient(1010,175,4,1010,175,260);glow.addColorStop(0,"#f6dbad55");glow.addColorStop(1,"#f6dbad00");ctx.fillStyle=glow;ctx.fillRect(700,0,580,470);
 // hills
 ctx.fillStyle="#293c51";ctx.beginPath();ctx.moveTo(0,440);ctx.quadraticCurveTo(230,320,480,438);ctx.quadraticCurveTo(850,310,1280,420);ctx.lineTo(1280,720);ctx.lineTo(0,720);ctx.fill();
 // distant town
 for(let i=0;i<15;i++){let x=i*94-20,h=80+(i*37)%110;rounded(x,500-h,70,h,5,"#26364a");for(let yy=520-h;yy<490;yy+=28)for(let xx=x+14;xx<x+58;xx+=25)rounded(xx,yy,9,12,(i+xx)%3?"#e7bd76":"#6d8b9d")}
 // ground
 ctx.fillStyle="#182b32";ctx.fillRect(0,565,W,155);ctx.fillStyle="#29463e";ctx.beginPath();ctx.moveTo(0,580);ctx.quadraticCurveTo(500,540,900,590);ctx.quadraticCurveTo(1100,550,1280,580);ctx.lineTo(1280,720);ctx.lineTo(0,720);ctx.fill();
}
function house(x,y,s=1){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="#b96e5d";ctx.beginPath();ctx.moveTo(-75,0);ctx.lineTo(0,-70);ctx.lineTo(75,0);ctx.fill();rounded(-62,0,124,105,5,"#e7bd89");rounded(-18,48,36,57,4,"#604c4a");rounded(-49,20,26,27,3,"#ffe1a1");rounded(23,20,26,27,3,"#ffe1a1");ctx.restore();
}
function plant(x,y,s=1,glow=0){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);if(glow){let g=ctx.createRadialGradient(0,-70,4,0,-70,105);g.addColorStop(0,"#d7ffb866");g.addColorStop(1,"#d7ffb800");ctx.fillStyle=g;ctx.fillRect(-120,-190,240,240)}
 line(0,0,0,-100,"#4c9a68",13);
 for(let i=0;i<5;i++){let side=i%2?1:-1,yy=-22-i*17;ctx.save();ctx.translate(0,yy);ctx.rotate(side*(.45+i*.09));ctx.fillStyle=i%2?"#71bc79":"#3e956b";ctx.beginPath();ctx.ellipse(side*25,-10,19,43,0,0,Math.PI*2);ctx.fill();ctx.restore()}
 ellipse(0,-107,18,23,glow?"#e6ff9c":"#9fd78b");ctx.restore();
}
function person(x,y,s,kind,t,pose=0){
 ctx.save();ctx.translate(x,y+Math.sin(t*3+pose)*3);ctx.scale(s,s);
 let skin="#d99d79",shirt="#d16c54",pants="#33465e",head=0;
 if(kind==="dora"){shirt="#c66d4e";pants="#315a70";skin="#a96d55"}
 if(kind==="ivo"){shirt="#d9dce0";pants="#7186a0";skin="#d7a37c"}
 if(kind==="miro"){shirt="#6f9278";pants="#465b4b";skin="#9a7058"}
 if(kind==="nox"){shirt="#303c4e";pants="#1e2938";skin="#b6a0a0"}
 // legs walking
 let walk=Math.sin(t*7+pose)*9;
 line(-10,-40,-13+walk*.35,0,pants,12);line(10,-40,13-walk*.35,0,pants,12);
 // torso
 rounded(-23,-99,46,61,14,shirt);
 if(kind==="dora"){line(-15,-85,15,-85,"#f2d9aa",5);rounded(-6,-73,12,20,3,"#edc879")}
 if(kind==="ivo"){rounded(-18,-95,36,32,9,"#a8c6d7");ellipse(0,-79,7,7,"#f5d89a")}
 if(kind==="miro"){line(-16,-89,16,-89,"#b8d8a2",5)}
 if(kind==="nox"){ctx.fillStyle="#242d3d";ctx.beginPath();ctx.moveTo(-22,-98);ctx.lineTo(-35,-35);ctx.lineTo(0,-48);ctx.lineTo(35,-35);ctx.lineTo(22,-98);ctx.fill()}
 // arms swing
 line(-20,-88,-33+walk*.6,-52,shirt,10);line(20,-88,33-walk*.6,-52,shirt,10);
 // head
 ellipse(0,-117,22,25,skin);ellipse(-22,-118,5,9,skin);ellipse(22,-118,5,9,skin);
 ellipse(-8,-119,2.6,3.5,"#26313b");ellipse(8,-119,2.6,3.5,"#26313b");line(-5,-105,5,-105,"#754e48",2);
 if(kind==="dora"){ctx.fillStyle="#3d2b2b";ctx.beginPath();ctx.arc(0,-128,24,Math.PI,Math.PI*2);ctx.fill();rounded(-25,-130,50,8,4,"#d5a66a")}
 if(kind==="ivo"){ellipse(0,-139,26,12,"#e6e9e8");rounded(-25,-139,50,7,3,"#9baec0")}
 if(kind==="miro"){for(let i=0;i<3;i++)ellipse(-13+i*13,-139,7,8,"#6e8c70")}
 if(kind==="nox"){ctx.fillStyle="#222b39";ctx.beginPath();ctx.moveTo(-19,-128);ctx.lineTo(-25,-157);ctx.lineTo(-4,-141);ctx.lineTo(0,-132);ctx.lineTo(4,-141);ctx.lineTo(25,-157);ctx.lineTo(19,-128);ctx.fill();ellipse(-9,-118,3,3,"#f4c36c");ellipse(9,-118,3,3,"#f4c36c")}
 ctx.restore();
}
function worm(x,y,s,t){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineCap="round";
 ctx.strokeStyle="#a8c77b";ctx.lineWidth=42;ctx.beginPath();ctx.moveTo(-130,0);ctx.bezierCurveTo(-90,-85,-35,35,10,-25);ctx.bezierCurveTo(50,-90,70,-100,80,-130);ctx.stroke();
 ctx.strokeStyle="#d0e09b";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-130,-8);ctx.bezierCurveTo(-85,-90,-30,25,10,-35);ctx.stroke();
 ellipse(80,-145,30,29,"#a8c77b");ellipse(70,-151,4,5,"#273d32");ellipse(91,-151,4,5,"#273d32");line(75,-132,90,-132,"#59714c",3);
 for(let i=0;i<7;i++){let a=t*2+i;star(-90+i*26,Math.sin(a)*9-35,3,a)}
 ctx.restore();
}
function moon(x,y,r,t){let g=ctx.createRadialGradient(x-r*.3,y-r*.4,2,x,y,r*1.5);g.addColorStop(0,"#fff2c9");g.addColorStop(.7,"#e5c9a1");g.addColorStop(1,"#a58d91");ellipse(x,y,r,r,g);ellipse(x-r*.25,y-r*.2,r*.17,r*.12,"#c9b39b");ellipse(x+r*.27,y+r*.18,r*.11,r*.09,"#c9b39b");}
function draw(t){
 ctx.clearRect(0,0,W,H);background(t);
 const bob=Math.sin(t*1.8)*5;
 // town foreground and warm windows
 house(190,510,.8);house(390,535,.62);house(1080,515,.9);
 // lampposts
 for(let x of [80,620,1190]){line(x,580,x,460,"#526c69",7);line(x,463,x+17,463,"#526c69",4);ellipse(x+18,465,10,13,"#f8d58b");}
 // little garden
 plant(950,584,.85,.25);
 // scene choreography
 if(t<12){person(420,570,1.1,"dora",t);plant(760,580,.7,.15);rounded(0,0,W,H,0,"#00000000");}
 else if(t<25){
   let p=smooth((t-12)/7);person(mix(420,620,p),570,1.1,"dora",t);
   plant(760,580,1.25,.9);for(let i=0;i<14;i++)star(760+Math.sin(i*8+t)*55,460+Math.cos(i*5+t)*65,3+(i%3),t+i);
   // falling star pod
   let sy=mix(-60,425,smooth((t-13)/5));ellipse(760,sy,12,17,"#d9f5a1");ellipse(756,sy-5,4,5,"#fff7c8");
   if(t>19){worm(950,590,.75,t)}
 } else if(t<40){
   person(450,570,1,"dora",t);worm(mix(980,760,smooth((t-25)/4)),580,1.1,t);
   let tr=smooth((t-32)/6);person(mix(920,820,tr),570,1.15,"miro",t);
   if(t>33){for(let i=0;i<12;i++)star(820+Math.sin(i*7+t)*65,430+Math.cos(i*4+t)*50,3,t+i)}
 } else if(t<55){
   person(430,570,1,"dora",t);person(720,570,1.1,"miro",t);
   let p=smooth((t-40)/6);person(mix(1450,1010,p),570,1.15,"ivo",t);
   moon(mix(1160,950,p),mix(-120,170,p),72,t);
   for(let i=0;i<18;i++){let a=t*1.3+i*.8;star(950+Math.cos(a)*110,170+Math.sin(a)*85,3,a)}
 } else if(t<70){
   person(400,570,1,"dora",t);person(650,570,1.05,"miro",t);person(850,570,1.1,"ivo",t);
   let p=smooth((t-55)/5);person(mix(1430,1060,p),570,1.25,"nox",t);
   // wolf shadow
   ctx.globalAlpha=.25;ellipse(1080,545,85,18,"#0c1424");ctx.globalAlpha=1;
 } else if(t<86){
   person(390,570,1,"dora",t);person(600,570,1.05,"miro",t);person(790,570,1.05,"ivo",t);person(990,570,1.1,"nox",t);
   let p=smooth((t-70)/8);plant(660,585,1.8,1);
   // luminous roots connect everyone
   ctx.save();ctx.globalAlpha=.65;ctx.strokeStyle="#c4f49a";ctx.lineWidth=5;ctx.shadowBlur=28;ctx.shadowColor="#b6ff91";ctx.beginPath();ctx.moveTo(660,570);ctx.bezierCurveTo(600,500,500,570,390,560);ctx.bezierCurveTo(520,610,850,600,990,560);ctx.stroke();ctx.restore();
   moon(660,145,100,t);
   for(let i=0;i<35;i++){let a=i*2.4+t;star(660+Math.cos(a)*mix(40,300,p),360+Math.sin(a)*mix(25,170,p),3+(i%3),a)}
 } else {
   let p=smooth((t-86)/8);
   // the "moon" opens like a flower; reveal the enormous plant holding the town
   moon(660,145,100,t);ctx.save();ctx.translate(660,260);ctx.rotate(Math.sin(t)*.04);
   for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);ctx.fillStyle=i%2?"#8fc68a":"#b4dc91";ctx.beginPath();ctx.ellipse(0,-105,35,120,0,0,Math.PI*2);ctx.fill();ctx.restore()}
   ellipse(0,0,40,40,"#fff1a6");ctx.restore();
   // vast plant stem under the town
   ctx.strokeStyle="#4b936c";ctx.lineWidth=85;ctx.beginPath();ctx.moveTo(660,720);ctx.bezierCurveTo(560,610,800,540,660,370);ctx.stroke();
   ctx.fillStyle="#263e3b";ctx.fillRect(0,565,W,155);
   // tiny town floats as a seed pod
   ctx.save();ctx.translate(660,500);ctx.scale(1+p*.18,1+p*.18);
   ctx.fillStyle="#a4ce8b";ctx.beginPath();ctx.ellipse(0,0,480,90,0,0,Math.PI*2);ctx.fill();
   house(-250,-45,.5);house(-70,-65,.55);house(160,-50,.5);plant(20,-25,.8,1);
   ctx.restore();
   person(390,550,0.8,"dora",t);person(600,550,.8,"miro",t);person(790,550,.8,"ivo",t);person(990,550,.8,"nox",t);
   for(let i=0;i<45;i++){let a=t+i*2.1;star(640+Math.cos(a)*mix(100,560,p),340+Math.sin(a)*mix(70,260,p),3+(i%3),a)}
   if(t>92){ctx.fillStyle="#fff4d4";ctx.font="italic 42px Georgia";ctx.textAlign="center";ctx.globalAlpha=smooth((t-92)/3);ctx.fillText("A cidade era uma semente.",640,115);ctx.globalAlpha=1}
 }
 // atmospheric drifting fireflies
 for(let i=0;i<24;i++){let x=(i*113+t*12)%W,y=390+(i*47)%260+Math.sin(t*2+i)*14;ellipse(x,y,2.5,2.5,i%3?"#f6d68c":"#c7f0a3")}
}
function updateCaption(t){let c=chapters[0];for(const item of chapters)if(t>=item.t)c=item; $("chapter").textContent=c.name;$("speaker").textContent=c.who;$("line").textContent=c.line}
function format(s){let n=Math.floor(s);return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0")}
function frame(now){if(!playing)return;let t=(now-started)/1000;if(t>=DURATION){t=DURATION;playing=false;$("play").textContent="▶ Assistir novamente"}draw(t);updateCaption(t);$("seek").value=t/DURATION*100;$("elapsed").textContent=format(t);last=t;if(playing)requestAnimationFrame(frame)}
function start(){playing=true;started=performance.now()-last*1000;$("play").textContent="Ⅱ PAUSAR";requestAnimationFrame(frame)}
$("play").addEventListener("click",()=>{if(playing){playing=false;pausedAt=last;$("play").textContent="▶ CONTINUAR"}else{if(last>=DURATION)last=0;start()}});
$("restart").addEventListener("click",()=>{last=0;started=performance.now();if(!playing){playing=true}$("play").textContent="Ⅱ PAUSAR";requestAnimationFrame(frame)});
$("seek").addEventListener("input",e=>{last=Number(e.target.value)/100*DURATION;started=performance.now()-last*1000;draw(last);updateCaption(last);$("elapsed").textContent=format(last);if(!playing){$("play").textContent="▶ CONTINUAR"}});
$("sound").addEventListener("click",()=>{soundOn=!soundOn;$("sound").textContent="♫ Som ambiente: "+(soundOn?"ligado":"desligado");try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();if(!audioOsc){audioOsc=audio.createOscillator();audioGain=audio.createGain();audioOsc.type="sine";audioOsc.frequency.value=110;audioGain.gain.value=0;audioOsc.connect(audioGain);audioGain.connect(audio.destination);audioOsc.start()}audioGain.gain.setTargetAtTime(soundOn?0.018:0,audio.currentTime,0.35)}catch(e){soundOn=false;$("sound").textContent="Som ambiente indisponivel"}});
$("duration").textContent=format(DURATION);draw(0);updateCaption(0);requestAnimationFrame(frame);
})();
