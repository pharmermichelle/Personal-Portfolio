/* Cut the Cheese account save + guarded XP bridge.
   Cloud saves are user-editable progress, NEVER evidence for XP or leaderboards. */
(function(global){
 "use strict";
 const bridge=global.CutCheeseBridge;
 const status=document.getElementById("cheeseCloudStatus");
 const options=document.getElementById("cheeseSyncOptions");
 const startBtn=document.getElementById("startBtn");
 if(!bridge||!global.RetroSaveService){if(status)status.textContent="Device progress only • cloud module unavailable";return;}
 const gameId="cut-the-cheese";
 const safeInt=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
 function validate(raw){
   if(!raw||typeof raw!=="object"||Array.isArray(raw)||!safeInt(raw.level,1,200)||
      !raw.knife||typeof raw.knife!=="object"||!raw.inventory||typeof raw.inventory!=="object")
     throw Error("Invalid Cut the Cheese save");
   const k=raw.knife,i=raw.inventory;
   if(!safeInt(k.points,0,9999999)||!safeInt(k.tier,0,3)||
      !safeInt(k.equipped,0,k.tier)||!["knife","board","parm"].every(n=>safeInt(i[n],0,25)))
     throw Error("Invalid knife or inventory save");
   return {level:raw.level,knife:{points:k.points,tier:k.tier,equipped:k.equipped},
     inventory:{knife:i.knife,board:i.board,parm:i.parm}};
 }
 const empty=()=>({level:1,knife:{points:0,tier:0,equipped:0},
    inventory:{knife:0,board:0,parm:0}});
 const legacy=()=>{
   try{
     const level=Number(localStorage.getItem("retro-cut-cheese-highest-level-v1")||1);
     const knife=JSON.parse(localStorage.getItem("retro-cut-cheese-knives-v1")||"{}");
     const inventory=JSON.parse(localStorage.getItem("retro-cut-cheese-inventory-v1")||"{}");
     return validate({
       level:Number.isInteger(level)&&level>=1&&level<=200?level:1,
       knife:{points:Number.isInteger(knife.points)?knife.points:0,
         tier:Number.isInteger(knife.tier)?knife.tier:0,
         equipped:Number.isInteger(knife.equipped)?knife.equipped:0},
       inventory:{knife:Number.isInteger(inventory.knife)?inventory.knife:0,
          board:Number.isInteger(inventory.board)?inventory.board:0,
          parm:Number.isInteger(inventory.parm)?inventory.parm:0}
     });
   }catch(_){return null;}
 };
 const adapter={
   gameId,displayName:"Cut the Cheese",schemaVersion:1,gameVersion:"v3",
   emptyState:empty,validateSave:validate,readLegacyLocal:legacy,
   restoreState:state=>bridge.restore(validate(state)),
   meaningful:state=>state.level>1||state.knife.points>0||state.knife.tier>0||
     Object.values(state.inventory).some(n=>n>0),
   summarizeSave:state=>"Level "+state.level+", "+state.knife.points+" cheese points, "+
     ["Classic","Precision","Double Cheddar","Cheese Reaper"][state.knife.equipped]+" knife"
 };
 let save=null,rewards=null,started=false;
 function rewardStatus(message){bridge.setRewardStatus(message);}
 async function setupRewards(client){
   if(!global.RetroRewards||!client)return;
   rewards=global.RetroRewards.create({
     gameId,version:"v1",
     onUpdate:info=>{
       if(info.type==="ready"){rewardStatus("XP challenge active • Level "+info.level);return;}
       if(info.type==="award"){
         const gained=Number(info.awarded_xp)||0;
         rewardStatus(gained?"+"+gained+" arcade XP earned on Level "+info.level+"!":
           "Level "+info.level+" already received its arcade XP reward.");
         if(gained)global.dispatchEvent(new Event("retro-arcade-xp-updated"));
       }
     },
     onError:message=>rewardStatus("Account XP: "+message)
   });
   const applyUser=user=>{
     rewards.setClient(client,user);
     if(user)rewardStatus("Signed in • earn XP by completing a new level.");
     else rewardStatus("Guest play • sign in to earn account XP.");
   };
   client.auth.onAuthStateChange((_event,session)=>setTimeout(()=>applyUser(session?.user||null),0));
   try {
     const {data}=await client.auth.getSession();
     applyUser(data?.session?.user||null);
   } catch(_error) {
     rewardStatus("Account XP unavailable • gameplay still works.");
   }
   bridge.onStart=level=>{if(rewards)void rewards.begin(level);};
   bridge.onComplete=level=>{if(rewards)void rewards.completed(level,[]);};
 }
 async function initialize(){
   if(started||!global.retroArcadeSupabaseClient)return;
   started=true;
   startBtn.disabled=true;
   if(status)status.textContent="Checking account progress…";
   try{
     save=global.RetroSaveService.create(adapter,{statusId:"cheeseCloudStatus",optionsId:"cheeseSyncOptions"});
     bridge.connectSave(save);
     const state=await save.initialize();
     if(state)bridge.restore(validate(state));
     await setupRewards(global.retroArcadeSupabaseClient);
     if(status&&save.mode==="account"&&(!status.textContent||status.textContent.toLowerCase().includes("checking")))
        status.textContent="Account progress ready";
   }catch(error){
     if(status)status.textContent="Cloud unavailable • device progress retained";
     console.warn("Cut the Cheese cloud:",error?.message||error);
     await setupRewards(global.retroArcadeSupabaseClient);
   }finally{startBtn.disabled=false;}
 }
 global.addEventListener("retro-arcade-auth-ready",()=>{void initialize();});
 if(global.retroArcadeSupabaseClient)void initialize();
 else {
   if(status)status.textContent="Waiting for player login…";
   // The shared arcade header normally sets up Supabase first.
   setTimeout(()=>{
     if(!started){
       if(global.retroArcadeSupabaseClient)void initialize();
       else if(status)status.textContent="Device progress only • login unavailable";
     }
   },1800);
 }
})(window);
