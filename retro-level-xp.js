/* Retro Games Hub: opt-in level XP adapter, version 1.
 * Game scripts must call begin(level) when actual play starts, and complete(level)
 * only after genuine success. Client events are NOT proof for leaderboards.
 * Server owns level limits, timer checks, awards, dedupe, and user identity.
 */
(function(global){
 "use strict";
 const script=document.currentScript;
 const gameId=script?.dataset?.gameId;
 if(!gameId||global.RetroLevelXP)return;
 let rewards=null,client=null,identity=null,active=null,requested=null;
 let beginTask=null,initializing=false;
 const listeners=[];
 function emit(type,detail){
   global.dispatchEvent(new CustomEvent("retro-level-xp",{
     detail:{gameId,type,...detail}
   }));
 }
 function init(){
   if(initializing||!global.RetroRewards||!global.retroArcadeSupabaseClient)return;
   initializing=true;
   client=global.retroArcadeSupabaseClient;
   rewards=global.RetroRewards.create({
     gameId,version:"v1",
     onUpdate:info=>{
       if(info.type==="award"){
         const amount=Number(info.awarded_xp)||0;
         if(amount)global.dispatchEvent(new Event("retro-arcade-xp-updated"));
         emit("award",{level:info.level,amount,alreadyEarned:!amount});
       }
       if(info.type==="ready")emit("ready",{level:info.level});
     },
     onError:message=>emit("error",{message})
   });
   function identityChange(user){
     const id=user?.id||null;
     if(identity!==id){identity=id;active=null;beginTask=null;}
     rewards.setClient(client,user||null);
     if(identity&&requested!==null)void start(requested);
   }
   client.auth.onAuthStateChange((_evt,session)=>{
     setTimeout(()=>identityChange(session?.user||null),0);
   });
   void client.auth.getSession().then(({data})=>identityChange(data?.session?.user||null))
     .catch(()=>emit("error",{message:"Account unavailable; guest play continues."}));
 }
 async function start(level){
   if(!Number.isInteger(level)||level<1||level>500)return;
   requested=level;
   if(!rewards||!identity){init();return;}
   if(active===level&&beginTask)return beginTask;
   active=level;
   beginTask=rewards.begin(level);
   return beginTask;
 }
 async function complete(level){
   if(!Number.isInteger(level)||level<1||level>500)return;
   if(!rewards||!identity){
     emit("guest",{level});
     return;
   }
   // A stale level or account switch must not claim the new player's XP.
   if(active!==level){emit("error",{message:"This level had no signed-in reward attempt."});return;}
   if(beginTask)await beginTask;
   const result=await rewards.completed(level,[]);
   if(active===level){active=null;beginTask=null;}
   return result;
 }
 global.RetroLevelXP={begin:start,complete,getGameId:()=>gameId};
 global.addEventListener("retro-arcade-auth-ready",init);
 if(global.retroArcadeSupabaseClient)init();
})(window);
