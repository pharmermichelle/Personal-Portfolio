/* Arcade rankings — opt-in only. Server controls metrics and public row visibility. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const metric=$("leaderboard-metric"),game=$("leaderboard-game"),rows=$("rank-rows");
const checkbox=$("leaderboard-optin");
let client=null,userId=null,available=[],request=0,connecting=false,subscribed=false;
const format=(value,type)=>{
 const n=Number(value)||0;
 if(type==="xp")return n.toLocaleString()+" XP";
 if(type==="playtime"){const h=Math.floor(n/3600),m=Math.floor(n%3600/60);return h? h+"h "+m+"m":m+"m";}
 if(type==="level")return "Level "+n;
 if(type==="snake_survival"){const m=Math.floor(n/60),s=n%60;return m+":"+String(s).padStart(2,"0");}
 return n.toLocaleString();
};
const status=(id,text)=>{$(id).textContent=text;};
function configureGames(){
 const type=metric.value,prior=game.value;
 let options=[];
 if(type==="level")options=available.filter(row=>row.reward_type==="level");
 else if(type==="snake_survival")options=[{game_id:"grass-snake",display_name:"Grass Snake"}];
 else options=available;
 game.replaceChildren();
 if(type!=="level"&&type!=="snake_survival"){
  const opt=new Option("All Games","");game.append(opt);
 }
 for(const row of options){
  const opt=new Option(row.display_name||row.game_id,row.game_id);
  game.append(opt);
 }
 if([...game.options].some(o=>o.value===prior))game.value=prior;
 else if(type==="level"){
   const first=options.find(x=>x.game_id==="hockey-gear-rush")||options[0];
   if(first)game.value=first.game_id;
 }
 game.disabled=type==="snake_survival";
 if(type==="snake_survival")game.value="grass-snake";
}
function proof(type){
 const label={
 xp:"XP comes from the server ledger. Many claims are server-timed, not replay verified.",
 playtime:"Estimated visible game time from bounded server heartbeats. Not proof of active physical play.",
 level:"Highest eligible server-recorded level clear. Not replay-verified competition.",
 snake_survival:"Server-timed Grass Snake personal best. Not a verified replay."
 };
 $("rank-proof").textContent=label[type]||"";
}
async function refresh(){
 if(!client)return;
 const id=++request,type=metric.value,gameId=game.value||null;
 rows.replaceChildren();
 proof(type);
 status("rank-status","Loading opt-in rankings…");
 try{
  const {data,error}=await client.rpc("arcade_leaderboard",{
    p_metric:type,p_game_id:gameId,p_limit:20
  });
  if(error)throw error;if(id!==request)return;
  if(!data?.length){
    status("rank-status","No opted-in players with recorded results for this category yet.");
    return;
  }
  const fragment=document.createDocumentFragment();
  for(const entry of data){
    const tr=document.createElement("tr");
    const position=document.createElement("td");position.textContent="#"+entry.rank_number;
    const name=document.createElement("td");name.textContent=entry.display_name||"Arcade Player";
    const value=document.createElement("td");value.textContent=format(entry.metric_value,type);
    tr.append(position,name,value);fragment.append(tr);
  }
  rows.append(fragment);
  status("rank-status",data.length+" opted-in player"+(data.length===1?"":"s")+" ranked. Only eligible public results are shown.");
 }catch(e){
  if(id!==request)return;
  status("rank-status","Rankings unavailable: "+(e.message||"Please retry later."));
 }
}
async function syncAccount(){
 if(!client)return;
 const old=userId;
 try{
  const {data,error}=await client.auth.getUser();
  if(error)throw error;
  userId=data.user?.id||null;
  if(userId){
   const {data:pref,error:prefError}=await client.from("leaderboard_preferences")
    .select("opted_in").eq("user_id",userId).maybeSingle();
   if(prefError)throw prefError;
   checkbox.checked=pref?.opted_in===true;
   checkbox.disabled=false;
   status("opt-status",checkbox.checked?"You are listed publicly. Turn this off whenever you want.":"You are private. Choose the option above to appear in rankings.");
  }else{
   checkbox.checked=false;checkbox.disabled=true;
   status("opt-status","Log in to choose public leaderboard participation. Private by default.");
  }
  if(old!==userId)await refresh();
 }catch(e){
  checkbox.checked=false;checkbox.disabled=true;
  status("opt-status","Unable to verify account privacy settings. Public participation stays off.");
 }
}
async function connect(){
 const c=window.retroArcadeSupabaseClient;
 if(!c||connecting)return;connecting=true;client=c;
 if(!subscribed){
  subscribed=true;
  // A signed-out browser must never keep showing a previous player's opt-in state.
  client.auth.onAuthStateChange(()=>{
   checkbox.checked=false;checkbox.disabled=true;
   setTimeout(()=>{void syncAccount();},0);
  });
 }
 try{
  const {data,error}=await client.from("game_xp_rules").select("game_id,display_name,reward_type").eq("enabled",true);
  if(error)throw error;
  available=(data||[]).sort((a,b)=>String(a.display_name||a.game_id).localeCompare(String(b.display_name||b.game_id)));
  configureGames();
  await Promise.all([syncAccount(),refresh()]);
 }catch(e){status("rank-status","Unable to load rankings: "+(e.message||"Please retry."));}
 finally{connecting=false;}
}
metric.addEventListener("change",()=>{configureGames();void refresh();});
game.addEventListener("change",()=>{void refresh();});
checkbox.addEventListener("change",async()=>{
 if(!client||!userId){checkbox.checked=false;return;}
 const account=userId,allowed=checkbox.checked;
 checkbox.disabled=true;
 status("opt-status","Saving your public ranking preference…");
 try{
  const {error}=await client.from("leaderboard_preferences").upsert({
   user_id:account,opted_in:allowed,updated_at:new Date().toISOString()
  },{onConflict:"user_id"});
  if(error)throw error;
  status("opt-status",allowed
    ?"Your arcade username and qualifying results can appear publicly. Uncheck to leave."
    :"You are opted out. Your account records remain private.");
  void refresh();
 }catch(e){
  checkbox.checked=!allowed;
  status("opt-status","Could not update ranking privacy: "+(e.message||"Please retry."));
 }finally{checkbox.disabled=false;}
});
window.addEventListener("retro-arcade-auth-ready",()=>{void connect();});
window.addEventListener("retro-arcade-xp-updated",()=>{void refresh();});
if(window.retroArcadeSupabaseClient)void connect();
})();
