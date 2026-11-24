/* Arcade Floor — neon 2.5D walkable social lobby; multiplayer not yet enabled. */
(() => {
"use strict";
const GAMES=[{"name":"Brick Blitz","icon":"🧱","href":"minigame/brick-blitz/index.html"},{"name":"Neon Pong","icon":"🏓","href":"minigame/neon-pong/index.html"},{"name":"Grass Snake","icon":"🐍","href":"minigame/grass-snake/index.html"},{"name":"Claws vs. Paws","icon":"🐈","href":"minigame/claws-vs-paws/index.html"},{"name":"Cut the Cheese","icon":"🧀","href":"minigame/Cut-the-Cheese/index.html"},{"name":"Fallen Grid","icon":"🧩","href":"minigame/Tide-Tetris/index.html"},{"name":"Revive Nature","icon":"🌱","href":"minigame/Revive-nature/revive-index.html"},{"name":"Rink Putt","icon":"🏒","href":"minigame/hockey_shooter/index.html"},{"name":"Hockey Gear Rush","icon":"🥅","href":"minigame/hockey-gear-rush/index.html"},{"name":"Survive 2026","icon":"🌪️","href":"minigame/survive-2026/index.html"},{"name":"Acorn Ascent","icon":"🐿️","href":"minigame/acorn-ascent/index.html"},{"name":"Bugged Out!","icon":"🐞","href":"minigame/bugged-out/index.html"},{"name":"Coastline Cruiser","icon":"🚙","href":"minigame/coastline-cruiser/cruiser.html"},{"name":"Lemon Pound Cake","icon":"🍋","href":"minigame/pound_cake/index.html"},{"name":"Wizard's Mana Forge","icon":"🧙","href":"minigame/clickgame.html"},{"name":"Whack-a-Bug","icon":"🪲","href":"minigame/whackgame.html"},{"name":"Choose Your Adventure","icon":"📜","href":"minigame/game.html"},{"name":"Ferret Life (WIP)","icon":"🐾","href":"minigame/ferret-life/index.html"},{"name":"Inbox Hero","icon":"📥","href":"minigame/inbox-hero.html"},{"name":"Community Garden","icon":"🌻","href":"minigame/community-garden.html"}];
const $=id=>document.getElementById(id);
const viewport=$("room-window"),world=$("room-world"),grid=$("cabinet-grid");
const avatar=$("floor-player"),avatarArt=$("floor-player-art");
const player={x:665,y:1115};
try{const saved=JSON.parse(sessionStorage.getItem("rgh-arcade-position")||"null");if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)){player.x=clampStart(saved.x,45,1285);player.y=clampStart(saved.y,120,1155);}}catch(_){ }
function clampStart(v,min,max){return Math.min(max,Math.max(min,v));}
const bounds={w:1330,h:1200};
const SPEED=250,INTERACT_DISTANCE=118,keys=new Set();
const seats=[];let seatedAt=null;const tapIndicator=$("floor-tap-indicator");
let selected=null,autoTarget=null,last=performance.now(),active=true;
let account=null,lastAccountRequest=0;
let lastPositionSave=0;
const status=message=>{$("floor-status").textContent=message;};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

/* Lightweight grid routing: avoid cabinet bases and lounge furniture.
   All coordinates live in the room's logical world, so touch and keyboard
   use exactly the same collision boundaries across mobile and desktop. */
const NAV_STEP=34;
const WALK_MARGIN=12;
function blocked(x,y){
 if(x<42||x>bounds.w-42||y<118||y>bounds.h-42)return true;
 for(const c of cabinets){
  if(Math.abs(x-c.x)<84+WALK_MARGIN&&y>c.y-24-WALK_MARGIN&&y<c.y+110+WALK_MARGIN)return true;
 }
 // Couch footprints are solid, but nearby seats remain reachable.
 if(x>417&&x<607&&y>1016&&y<1098)return true;
 if(x>723&&x<913&&y>1016&&y<1098)return true;
 for(const tx of [325,1010])if(Math.abs(x-tx)<73&&Math.abs(y-1083)<42)return true;
 return false;
}
function nearestOpen(x,y){
 x=clamp(x,44,bounds.w-44);y=clamp(y,120,bounds.h-44);
 if(!blocked(x,y))return{x,y};
 for(let r=14;r<250;r+=14){
  for(let a=0;a<24;a++){
   const px=clamp(x+Math.cos(a*Math.PI/12)*r,44,bounds.w-44);
   const py=clamp(y+Math.sin(a*Math.PI/12)*r,120,bounds.h-44);
   if(!blocked(px,py))return{x:px,y:py};
  }
 }
 return {x:player.x,y:player.y};
}
function lineClear(a,b){
 const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/10);
 for(let i=1;i<=n;i++){
  const t=i/n;
  if(blocked(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;
 }
 return true;
}
function planRoute(from,to){
 if(lineClear(from,to))return [to];
 const step=NAV_STEP,cols=Math.floor(bounds.w/step)+1,rows=Math.floor(bounds.h/step)+1;
 const key=(x,y)=>y*cols+x;
 const node=p=>[clamp(Math.round(p.x/step),0,cols-1),clamp(Math.round(p.y/step),0,rows-1)];
 const a=node(from),b=node(to),start=key(...a);
 const queue=[a],parent=new Map([[start,null]]);
 let goal=null;
 const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
 // Starting grid cell can overlap a collision edge; the exact player start is still valid.
 for(let i=0;i<queue.length;i++){
  const [cx,cy]=queue[i],here={x:cx*step,y:cy*step};
  if(lineClear(here,to)){goal=key(cx,cy);break;}
  for(const [dx,dy] of dirs){
   const nx=cx+dx,ny=cy+dy,k=key(nx,ny);
   if(nx<0||ny<0||nx>=cols||ny>=rows||parent.has(k)||blocked(nx*step,ny*step))continue;
   if(dx&&dy&&(blocked((cx+dx)*step,cy*step)||blocked(cx*step,(cy+dy)*step)))continue;
   parent.set(k,key(cx,cy));queue.push([nx,ny]);
  }
 }
 if(goal===null)return null;
 const path=[];let k=goal;
 while(k!==start&&k!==null){
  path.push({x:k%cols*step,y:Math.floor(k/cols)*step});k=parent.get(k);
 }
 path.reverse();
 path.push(to);
 // Smooth out the jagged grid route only where a straight segment is clear.
 const smoothed=[];let cursor=from;
 for(let i=0;i<path.length;){
  let far=i;
  for(let j=i+1;j<path.length;j++){if(lineClear(cursor,path[j]))far=j;}
  smoothed.push(path[far]);cursor=path[far];i=far+1;
 }
 return smoothed;
}
function setDestination(target){
 const goal=nearestOpen(target.x,target.y);
 const path=planRoute(player,goal);
 if(!path){
  autoTarget=null;
  status("That spot is blocked. Try another part of the floor.");
  return false;
 }
 autoTarget={...goal,seat:target.seat||null,path};
 return true;
}
function cabinetColor(index){return ["#ff65d4","#78e9ff","#ffe07a","#8ef8c8","#d2a5ff"][index%5];}
const cabinets=GAMES.map((g,i)=>{
 const col=i%5,row=Math.floor(i/5),x=175+col*245,y=166+row*239;
 const button=document.createElement("button");
 button.type="button";
 button.className="arcade-cabinet";
 button.style.left=(x-77)+"px";button.style.top=(y-15)+"px";
 button.style.setProperty("--glow",cabinetColor(i));button.style.setProperty("--cabinet-depth",String(row));
 button.setAttribute("aria-label","Arcade cabinet: "+g.name+". Select to walk over and play.");
 const casing=document.createElement("span");casing.className="cabinet-case";
 const screen=document.createElement("span");screen.className="cabinet-screen";
 const icon=document.createElement("span");icon.className="cabinet-icon";icon.textContent=g.icon;
 screen.append(icon);
 const consoleRow=document.createElement("span");consoleRow.className="cabinet-console";
 casing.append(screen,consoleRow);
 const label=document.createElement("span");label.className="cabinet-label";label.textContent=g.name;
 button.append(casing,label);grid.append(button);
 const entry={...g,button,x,y,frontY:y+154};
 button.addEventListener("click",()=>selectCabinet(entry,true));
 return entry;
});
const picker=$("cabinet-picker");
cabinets.forEach((c,i)=>{const option=document.createElement("option");option.value=String(i);option.textContent=c.name;picker.append(option);});
picker.addEventListener("change",()=>{if(picker.value!=="")selectCabinet(cabinets[Number(picker.value)],true);});
if(blocked(player.x,player.y)){player.x=665;player.y=1115;}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.frontY);}
function nearestCabinet(){
 let best=null,d=Infinity;
 for(const c of cabinets){const current=distance(player,c);if(current<d){best=c;d=current;}}
 return {cabinet:best,distance:d};
}
function selectCabinet(c,auto=false){
 leaveSeat();
 selected=c;
 cabinets.forEach(g=>g.button.classList.toggle("is-selected",g===selected));
 if(auto){setDestination({x:c.x,y:Math.min(bounds.h-48,c.frontY+26)});}
 updateAction();
}
function updateAction(){
 if(seatedAt){$("stand-button").hidden=false;$("floor-location").textContent="Coffee lounge";status("Relaxing at "+seatedAt.tableName+". Tap the floor to get up and walk.");$("play-button").disabled=true;$("approach-button").disabled=!selected;return;}
 const near=selected&&distance(player,selected)<=INTERACT_DISTANCE;
 $("play-button").disabled=!near;
 $("approach-button").disabled=!selected||!!autoTarget;
 if(!selected){
   const n=nearestCabinet();$("floor-location").textContent="Entrance";
   status("Walk up to a cabinet, or tap one to travel there. "+(n.cabinet?.name||"")+" is nearby.");
 }else{
   $("floor-location").textContent=selected.name;
   status(near
     ? selected.name+" is ready! Press PLAY, E or Enter."
     : "Heading to "+selected.name+". Walk closer to its glowing screen.");
 }
}
$("approach-button").addEventListener("click",()=>{
 if(selected){setDestination({x:selected.x,y:Math.min(bounds.h-48,selected.frontY+26)});updateAction();}
});
function launchGame(){
 const target=selected&&distance(player,selected)<=INTERACT_DISTANCE?selected:null;
 if(!target)return;
 // Each cabinet goes straight to its existing deployed game. Login/save
 // remains the responsibility of the individual game page.
 location.href=new URL(target.href,location.href).href;
}
$("play-button").addEventListener("click",launchGame);
function leaveSeat(){if(!seatedAt)return;seatedAt.button.classList.remove("is-occupied");seatedAt=null;avatar.classList.remove("is-seated");$("stand-button").hidden=true;}
$("stand-button").addEventListener("click",()=>{leaveSeat();updateAction();});
function setHeld(direction,yes,button){
 if(yes){leaveSeat();autoTarget=null;keys.add(direction);}else keys.delete(direction);
 button?.classList.toggle("is-held",yes);
}
for(const button of document.querySelectorAll("[data-direction]")){
 const dir=button.dataset.direction;
 button.addEventListener("pointerdown",e=>{
   if(e.button!==0)return;
   e.preventDefault();wasPointerHeld=true;try{button.setPointerCapture(e.pointerId);}catch(_){}
   setHeld(dir,true,button);
 });
 const release=()=>setHeld(dir,false,button);
 button.addEventListener("pointerup",release);
 button.addEventListener("pointercancel",release);
 button.addEventListener("lostpointercapture",release);
 button.addEventListener("click",()=>{ // works for keyboard/switch users
   if(keys.size)return;
   leaveSeat();autoTarget=null;
   const dx=dir==="right"?45:dir==="left"?-45:0;
   const dy=dir==="down"?45:dir==="up"?-45:0;
   const px=clamp(player.x+dx,45,bounds.w-45),py=clamp(player.y+dy,120,bounds.h-45);
   if(!blocked(px,player.y))player.x=px;
   if(!blocked(player.x,py))player.y=py;
   syncScene();
 });
}
function keyDirection(key){
 const k=key.toLowerCase();
 if(k==="arrowup"||k==="w")return"up";
 if(k==="arrowdown"||k==="s")return"down";
 if(k==="arrowleft"||k==="a")return"left";
 if(k==="arrowright"||k==="d")return"right";
 return null;
}
window.addEventListener("keydown",event=>{
 if(event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement)return;
 const dir=keyDirection(event.key);
 if(dir){event.preventDefault();leaveSeat();keys.add(dir);autoTarget=null;return;}
 if((event.key==="e"||event.key==="E"||event.key==="Enter")&&!event.repeat){
   if(event.target instanceof HTMLButtonElement && event.key==="Enter")return;
   if(!selected||distance(player,selected)>INTERACT_DISTANCE){
     const nearest=nearestCabinet();
     if(nearest.distance<=INTERACT_DISTANCE)selectCabinet(nearest.cabinet);
   }
   launchGame();
 }
});
window.addEventListener("keyup",event=>{const dir=keyDirection(event.key);if(dir)keys.delete(dir);});
window.addEventListener("blur",()=>{keys.clear();active=false;last=performance.now();});
window.addEventListener("focus",()=>{active=true;last=performance.now();});
document.addEventListener("visibilitychange",()=>{active=!document.hidden;keys.clear();last=performance.now();});
function syncScene(){
 const now=performance.now();if(now-lastPositionSave>1400&&!blocked(player.x,player.y)){lastPositionSave=now;try{sessionStorage.setItem("rgh-arcade-position",JSON.stringify(player));}catch(_){}}
 avatar.style.transform="translate3d("+(player.x-45)+"px,"+(player.y-116)+"px,0)";
 const dx=viewport.clientWidth/2-player.x;
 const dy=viewport.clientHeight/2-player.y;
 const offsetX=viewport.clientWidth>=bounds.w?(viewport.clientWidth-bounds.w)/2:clamp(dx,viewport.clientWidth-bounds.w,0);
 const offsetY=viewport.clientHeight>=bounds.h?(viewport.clientHeight-bounds.h)/2:clamp(dy,viewport.clientHeight-bounds.h,0);
 world.style.transform="translate3d("+offsetX+"px,"+offsetY+"px,0)";
 cabinets.forEach(c=>c.button.classList.toggle("is-near",distance(player,c)<=INTERACT_DISTANCE));
 if(selected && distance(player,selected)<=INTERACT_DISTANCE && autoTarget && !autoTarget.seat)autoTarget=null;
}
let lastNear=false,lastSelected=null;
function step(now){
 const dt=clamp((now-last)/1000,0,.05);last=now;
 if(active){
   let x=0,y=0;
   if(keys.has("left"))x--;if(keys.has("right"))x++;
   if(keys.has("up"))y--;if(keys.has("down"))y++;
   if(autoTarget && !x && !y){
     const waypoint=autoTarget.path?.[0]||autoTarget;
     const dx=waypoint.x-player.x,dy=waypoint.y-player.y;
     if(Math.hypot(dx,dy)>5){x=dx;y=dy;}else if(autoTarget.path?.length>1){autoTarget.path.shift();}else {if(autoTarget.seat){seatedAt=autoTarget.seat;seatedAt.button.classList.add("is-occupied");avatar.classList.add("is-seated");selected=null;picker.value="";cabinets.forEach(c=>c.button.classList.remove("is-selected"));updateAction();}autoTarget=null;}
   }
   avatar.classList.toggle("is-moving",!!(x||y));
   if(x||y){
     avatar.dataset.facing=Math.abs(x)>Math.abs(y)?(x>0?"right":"left"):(y>0?"down":"up");
     const norm=Math.hypot(x,y);
     const waypoint=autoTarget?.path?.[0]||autoTarget;
     const move=Math.min(SPEED*dt,waypoint?Math.hypot(waypoint.x-player.x,waypoint.y-player.y):Infinity);
     const nx=clamp(player.x+x/norm*move,45,bounds.w-45);
     const ny=clamp(player.y+y/norm*move,120,bounds.h-45);
     if(!blocked(nx,player.y))player.x=nx;
     if(!blocked(player.x,ny))player.y=ny;
     syncScene();
   }
   const near=selected&&distance(player,selected)<=INTERACT_DISTANCE;
   if(near!==lastNear||lastSelected!==selected){
     lastNear=near;lastSelected=selected;updateAction();
   }
 }
 requestAnimationFrame(step);
}
function setAvatar(key,opts={},name="PLAYER 1"){
 try{
   const render=window.RetroHubAvatars?.render;
   if(typeof render==="function")avatarArt.innerHTML=render(key,opts);
   else avatarArt.innerHTML='<img src="assets/arcade-neon-robot.svg" alt="" width="75" height="91">';
 }catch(_){avatarArt.innerHTML='<img src="assets/arcade-neon-robot.svg" alt="" width="75" height="91">';}
 $("floor-player-name").textContent=(name||"PLAYER 1").slice(0,24);
}
async function fetchAvatar(){
 const client=window.retroArcadeSupabaseClient;
 if(!client)return;
 const request=++lastAccountRequest;
 try{
   const {data:identity,error:authError}=await client.auth.getUser();
   if(authError||!identity?.user){account=null;setAvatar("chrome-byte");return;}
   account=identity.user.id;
   const [profile,equipped,inventory]=await Promise.all([
     client.from("profiles").select("username,avatar_key").eq("id",account).maybeSingle(),
     client.from("equipped_cosmetics").select("slot,cosmetic_id").eq("user_id",account),
     client.from("player_inventory").select("cosmetic_id").eq("user_id",account)
   ]);
   if(request!==lastAccountRequest||account!==identity.user.id)return;
   const owned=new Set((inventory.data||[]).map(x=>x.cosmetic_id));
   const gear={};
   for(const row of equipped.data||[]){
     if(owned.has(row.cosmetic_id)&&window.RetroGearWearables?.get(row.cosmetic_id)?.kind===row.slot)
       gear[row.slot]=row.cosmetic_id;
   }
   const eq=(equipped.data||[]).map(x=>x.cosmetic_id);
   setAvatar(profile.data?.avatar_key||"chrome-byte",{
     equippedShirt:eq.includes("shirt-acorn-ascent"),
     equippedHat:eq.includes("hat-cheese-wedge"),
     gearWearables:gear
   },profile.data?.username||"PLAYER 1");
 }catch(_){setAvatar("chrome-byte");}
}
window.addEventListener("retro-arcade-auth-ready",()=>{void fetchAvatar();});
window.addEventListener("retro-arcade-avatar-updated",()=>{void fetchAvatar();});
window.addEventListener("retro-arcade-xp-updated",()=>{void fetchAvatar();});
if(window.retroArcadeSupabaseClient)void fetchAvatar();

/* Furniture is generated from stable ids to allow future authenticated room/seat presence. */
const lounge=$("lounge-tables");
for(const [tableId,x,y,label] of [["coffee-1",325,1083,"Coffee Table 1"],["coffee-2",1010,1083,"Coffee Table 2"]]){
 const table=document.createElement("div");table.className="lounge-table";table.style.left=(x-68)+"px";table.style.top=(y-35)+"px";
 const top=document.createElement("div");top.className="lounge-tabletop";
 table.append(top);
 for(const [seatId,dx,dy,glyph] of [["west",-91,0,"🪑"],["east",91,0,"🪑"]]){
  const b=document.createElement("button");b.type="button";b.className="lounge-seat";b.textContent=glyph;
  b.style.left=(68+dx-24)+"px";b.style.top=(35+dy-23)+"px";b.setAttribute("aria-label","Sit at "+label+", "+seatId+" seat");
  const seat={id:tableId+"-"+seatId,tableId,tableName:label,button:b,x:x+dx,y:y+dy};
  seats.push(seat);
  b.addEventListener("click",event=>{event.stopPropagation();leaveSeat();selected=null;cabinets.forEach(c=>c.button.classList.remove("is-selected"));setDestination({x:seat.x,y:seat.y,seat});status("Walking to "+label+"…");});
  table.append(b);
 }
 lounge.append(table);
}
viewport.addEventListener("pointerup",event=>{
 if(event.button!==0||event.target.closest("button,a"))return;
 const rect=world.getBoundingClientRect();
 const x=clamp(event.clientX-rect.left,45,bounds.w-45);
 const y=clamp(event.clientY-rect.top,120,bounds.h-45);
 leaveSeat();selected=null;cabinets.forEach(c=>c.button.classList.remove("is-selected"));
 setDestination({x,y});tapIndicator.style.left=x+"px";tapIndicator.style.top=y+"px";
 tapIndicator.classList.remove("is-active");void tapIndicator.offsetWidth;tapIndicator.classList.add("is-active");
 $("floor-location").textContent="Exploring";status("Walking to your chosen spot…");
});

setAvatar("chrome-byte");
syncScene();
updateAction();
requestAnimationFrame(step);
})();