import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8c789d);
scene.fog = new THREE.Fog(0x8c789d, 28, 95);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.insertBefore(renderer.domElement, document.getElementById("game"));
renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:0";
scene.add(new THREE.HemisphereLight(0xffffff, 0x342044, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(-10, 20, 8); sun.castShadow = true; scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(180,180), new THREE.MeshStandardMaterial({color:0x55515d}));
ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
const roadMat = new THREE.MeshStandardMaterial({color:0x25232b});
function road(x,z,w,d){const m=new THREE.Mesh(new THREE.BoxGeometry(w,.04,d),roadMat);m.position.set(x,.025,z);scene.add(m)}
road(0,0,180,10); road(0,0,10,180);
const lineMat = new THREE.MeshStandardMaterial({color:0xe5c7a1});
for(let i=-80;i<=80;i+=8){const l=new THREE.Mesh(new THREE.BoxGeometry(.25,.05,3),lineMat);l.position.set(i,.06,0);scene.add(l)}
const buildingMats=[0x55445e,0x746174,0x4b5365,0x806b78].map(c=>new THREE.MeshStandardMaterial({color:c}));
for(let x=-55;x<=55;x+=14) for(let z=-55;z<=55;z+=14){
 if(Math.abs(x)<12||Math.abs(z)<12) continue;
 const h=5+Math.random()*10;
 const b=new THREE.Mesh(new THREE.BoxGeometry(7,h,7),buildingMats[Math.floor(Math.random()*buildingMats.length)]);
 b.position.set(x,h/2,z); b.castShadow=true;b.receiveShadow=true;scene.add(b);
}
// Низкополигональные игровые модели VAMP RP, собранные из настоящей 3D-геометрии.
const characterRigs=[];
function makeCharacter(skin="homeless_male", remote=false){
 const g=new THREE.Group();
 const female=skin==="homeless_female";
 const coatColor=female?0x51434b:0x37333d;
 const cloth=new THREE.MeshStandardMaterial({color:remote?0x9874b2:coatColor,roughness:.95});
 const dark=new THREE.MeshStandardMaterial({color:0x24212a,roughness:1});
 const skinMat=new THREE.MeshStandardMaterial({color:female?0xc89578:0xb98568,roughness:.9});
 const worn=new THREE.MeshStandardMaterial({color:female?0x62545a:0x625d64,roughness:1});
 function part(geo,mat,parent,pos){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 // torso and layered worn clothing
 part(new THREE.BoxGeometry(female?.66:.72,.78,.38),cloth,g,[0,1.12,0]);
 part(new THREE.BoxGeometry(.58,.22,.395),worn,g,[0,1.18,.012]);
 part(new THREE.BoxGeometry(.74,.18,.4),dark,g,[0,.72,0]);
 // head, ears, nose and simple low-poly facial features
 part(new THREE.SphereGeometry(.235,10,8),skinMat,g,[0,1.82,0]);
 part(new THREE.BoxGeometry(.08,.1,.07),skinMat,g,[0,1.78,.21]);
 const hair=new THREE.MeshStandardMaterial({color:female?0x40302b:0x343039});
 if(female){part(new THREE.SphereGeometry(.25,9,7,0,Math.PI*2,0,Math.PI*.62),hair,g,[0,1.9,-.015]);part(new THREE.BoxGeometry(.48,.12,.34),worn,g,[0,2.03,0]);}
 else {part(new THREE.CylinderGeometry(.24,.25,.13,9),dark,g,[0,2.02,0]);part(new THREE.SphereGeometry(.245,9,5,0,Math.PI*2,0,Math.PI*.45),dark,g,[0,2.04,0]);}
 // arms and legs on pivots so they can animate while walking
 const limbs=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.43,1.42,0);g.add(arm);
  part(new THREE.BoxGeometry(.19,.48,.2),cloth,arm,[0,-.23,0]);part(new THREE.SphereGeometry(.095,8,6),skinMat,arm,[0,-.49,.015]);limbs.push({pivot:arm,phase:side===-1?0:Math.PI});
  const leg=new THREE.Group();leg.position.set(side*.2,.68,0);g.add(leg);
  part(new THREE.BoxGeometry(.24,.5,.25),female?worn:dark,leg,[0,-.24,0]);part(new THREE.BoxGeometry(.27,.12,.38),dark,leg,[0,-.51,.055]);limbs.push({pivot:leg,phase:side===-1?Math.PI:0});
 }
 // signature scarf / patched cloth detail
 if(female){part(new THREE.BoxGeometry(.42,.16,.42),worn,g,[0,1.57,.015]);}
 else {part(new THREE.BoxGeometry(.3,.12,.39),worn,g,[.12,1.3,.205]);}
 if(!remote){const label=new THREE.Group();g.userData.skinName=female?"Бомжиха":"Бомж";}
 characterRigs.push({group:g,limbs});
 return g;
}
let selectedSkin="homeless_male";
try{selectedSkin=localStorage.getItem("vamp-rp-skin")||selectedSkin}catch{}
let player=makeCharacter(selectedSkin);scene.add(player);player.position.set(0,0,3);
const characterSelect=document.getElementById("character-select");
const skinButtons=[...document.querySelectorAll(".skin-card[data-skin]")];
function chooseSkin(skin){selectedSkin=skin;skinButtons.forEach(b=>b.classList.toggle("selected",b.dataset.skin===skin));}
skinButtons.forEach(b=>b.addEventListener("click",()=>chooseSkin(b.dataset.skin)));
chooseSkin(selectedSkin);
document.getElementById("start-game").addEventListener("click",()=>{
 try{localStorage.setItem("vamp-rp-skin",selectedSkin)}catch{}
 const oldPosition=player.position.clone();scene.remove(player);player=makeCharacter(selectedSkin);player.position.copy(oldPosition);scene.add(player);
 player.userData.skinName=selectedSkin;characterSelect.style.display="none";
 toast("Добро пожаловать в VAMP RP!");
});
const car=new THREE.Group();const shell=new THREE.Mesh(new THREE.BoxGeometry(2.1,.65,4),new THREE.MeshStandardMaterial({color:0x28204a,metalness:.55,roughness:.3}));shell.position.y=.7;car.add(shell);
const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.55,.65,1.8),new THREE.MeshStandardMaterial({color:0x171322,metalness:.2,roughness:.2}));cabin.position.set(0,1.3,-.25);car.add(cabin);
for(const x of [-1,1])for(const z of [-1.25,1.25]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.18,12),new THREE.MeshStandardMaterial({color:0x111111}));w.rotation.z=Math.PI/2;w.position.set(x,.35,z);car.add(w)}
car.position.set(5,0,4);scene.add(car);
let inCar=false, running=false, jumpTime=0, cameraFar=false;
const keys={};addEventListener("keydown",e=>keys[e.key.toLowerCase()]=true);addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
let joy={x:0,y:0};const pad=document.getElementById("joystick"),stick=document.getElementById("stick");
let active=false;
function joyStart(e){active=true;joyMove(e)}
function joyMove(e){if(!active)return;const r=pad.getBoundingClientRect(),p=e.touches?e.touches[0]:e;let x=p.clientX-(r.left+r.width/2),y=p.clientY-(r.top+r.height/2);const len=Math.hypot(x,y),max=35;if(len>max){x=x/len*max;y=y/len*max}joy.x=x/max;joy.y=-y/max;stick.style.transform=`translate(${x}px,${y}px)`}
function joyEnd(){active=false;joy={x:0,y:0};stick.style.transform="translate(0,0)"}
pad.addEventListener("pointerdown",e=>{pad.setPointerCapture(e.pointerId);joyStart(e)});pad.addEventListener("pointermove",joyMove);pad.addEventListener("pointerup",joyEnd);pad.addEventListener("pointercancel",joyEnd);
document.getElementById("run").onclick=()=>{running=!running;toast(running?"Бег включён":"Обычная скорость")};
document.getElementById("jump").onclick=()=>{if(!inCar&&player.position.y<.05)jumpTime=.55};
document.getElementById("camera").onclick=()=>{cameraFar=!cameraFar;toast(cameraFar?"Камера дальше":"Камера ближе")};
document.getElementById("car").onclick=()=>{if(inCar){inCar=false;player.position.copy(car.position).add(new THREE.Vector3(2,0,0));player.visible=true;toast("Вы вышли из машины")}else if(player.position.distanceTo(car.position)<4){inCar=true;player.visible=false;toast("Вы сели в машину")}else toast("Подойдите ближе к машине")};
let toastTimer;function toast(s){const el=document.getElementById("toast");el.textContent=s;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),1500)}
let ws,myId=null,remote={};
try{const proto=location.protocol==="https:"?"wss":"ws";ws=new WebSocket(`${proto}://${location.host}`);ws.onopen=()=>document.getElementById("connection").textContent="В сети";ws.onclose=()=>document.getElementById("connection").textContent="Оффлайн";ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==="welcome"){myId=m.id;updateRemote(m.players)}if(m.type==="state")updateRemote(m.players)};}catch{}
function updateRemote(players){for(const [id,p] of Object.entries(players)){if(id===myId)continue;if(!remote[id]){remote[id]=makeCharacter("homeless_male",true);scene.add(remote[id])}remote[id].position.set(p.x,0,p.z)}for(const id of Object.keys(remote))if(!players[id]){scene.remove(remote[id]);delete remote[id]}document.getElementById("players").textContent=Object.keys(players).length||1}
let lastSend=0;
function animate(t){requestAnimationFrame(animate);const dt=Math.min(.04,(t-(animate.last||t))/1000);animate.last=t;
 const dx=joy.x+((keys.d||keys.arrowright)?1:0)-((keys.a||keys.arrowleft)?1:0);
 const dz=-joy.y+((keys.s||keys.arrowdown)?1:0)-((keys.w||keys.arrowup)?1:0);
 const len=Math.hypot(dx,dz)||1,speed=(running?8:4)*dt;
 if(inCar){car.position.x+=dx/len*speed*1.7;car.position.z+=dz/len*speed*1.7;if(Math.abs(dx)+Math.abs(dz)>.1)car.rotation.y=Math.atan2(dx,dz)}else{
 player.position.x+=dx/len*speed;player.position.z+=dz/len*speed;
 if(Math.abs(dx)+Math.abs(dz)>.1)player.rotation.y=Math.atan2(dx,dz);
 if(jumpTime>0){jumpTime-=dt;player.position.y=Math.sin((.55-jumpTime)/.55*Math.PI)*1.4}else player.position.y=0;
 }
 const moving=!inCar&&(Math.abs(dx)+Math.abs(dz)>.12);
 for(const rig of characterRigs){if(rig.group!==player)continue;const swing=moving?Math.sin(t*.012)*(running?0.72:0.42):0;for(const limb of rig.limbs)limb.pivot.rotation.x=Math.sin(t*.012+limb.phase)*(moving?(running?.95:.55):0);}
 const target=inCar?car.position:player.position;
 const offset=cameraFar?new THREE.Vector3(0,9,15):new THREE.Vector3(0,6,9);
 camera.position.lerp(new THREE.Vector3(target.x+offset.x,target.y+offset.y,target.z+offset.z),.09);camera.lookAt(target.x,target.y+1,target.z);
 if(ws&&ws.readyState===1&&t-lastSend>100){const p=inCar?car.position:player.position;ws.send(JSON.stringify({type:"move",x:p.x,z:p.z}));lastSend=t}
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
setTimeout(()=>{document.body.classList.add("ready");document.getElementById("loading").style.opacity="0";setTimeout(()=>document.getElementById("loading").remove(),750)},900);
