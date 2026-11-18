/* Reusable Retro Games Hub reward client, configured by each game's adapter.
   All XP, badges, and wardrobe entitlements are issued by the server. */
(function(global) {
 "use strict";
 const endpoint="https://dxemotgroklcjsbunspg.supabase.co/functions/v1/retro-rewards";
 class Rewards {
  constructor({gameId,version,onUpdate,onError}) {
   this.gameId=gameId;this.version=version;this.onUpdate=onUpdate||(()=>{});
   this.onError=onError||(()=>{});this.client=null;this.active=null;
   this.attempt=null;this.userId=null;this.pending=null;this.starting=null;
   this.epoch=0;
  }
  static key(user,game) {return "retro:reward-pending:"+user+":"+game+":v1";}
  async request(action,body) {
   const client=this.client;
   if(!client)throw new Error("Account service unavailable");
   const {data:{session}}=await client.auth.getSession();
   if(!session||session.user.id!==this.userId)throw new Error("Sign in to earn account XP");
   const res=await fetch(endpoint,{method:"POST",headers:{
    authorization:"Bearer "+session.access_token,
    apikey:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZW1vdGdyb2tsY2pzYnVuc3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjcyMjgsImV4cCI6MjA5MjkwMzIyOH0.3129v6Uc_XFv-XPfJv99jlQ9mYTuj492hM07TZdpnDo",
    "content-type":"application/json"},body:JSON.stringify({game_id:this.gameId,version:this.version,action,...body})});
   let payload={};try{payload=await res.json();}catch(_){}
   if(!res.ok)throw Object.assign(new Error(payload.error||"Reward service error"),{status:res.status});
   return payload;
  }
  setClient(client,user) {
   const id=user&&user.id||null;
   if(id===this.userId&&this.client===client)return;
   this.epoch++;this.userId=id;this.client=client;
   this.attempt=null;this.active=null;this.pending=null;this.starting=null;
   if(id)void this.retryPending();
  }
  async begin(level) {
   if(!this.userId||this.active===level&&this.attempt)return;
   const epoch=this.epoch;
   if(this.starting)return this.starting;
   this.starting=(async()=>{
    try{
     const result=await this.request("start",{level});
     if(epoch!==this.epoch)return;
     this.active=level;this.attempt=result.attempt_id;
     this.onUpdate({type:"ready",level});
    }catch(e){if(epoch===this.epoch)this.onError(e.message||"Reward connection unavailable");}
    finally {if(epoch===this.epoch)this.starting=null;}
   })();
   return this.starting;
  }
  async completed(level,placements) {
   if(!this.userId)return {type:"guest"};
   if(this.starting)await this.starting;
   if(this.active!==level||!this.attempt) {
    this.onError("No verified challenge started for this branch. Progress saved, but XP not awarded.");
    return {type:"unverified"};
   }
   const attempt=this.attempt,id=this.userId,epoch=this.epoch;
   this.attempt=null;this.active=null;
   const claim={level,attempt_id:attempt,placements};
   this.pending=claim;
   try {localStorage.setItem(Rewards.key(id,this.gameId),JSON.stringify(claim));}catch(_){}
   try {
    const result=await this.request("complete",claim);
    if(epoch!==this.epoch)return result;
    this.pending=null;
    try{localStorage.removeItem(Rewards.key(id,this.gameId));}catch(_){}
    this.onUpdate({type:"award",level,...result});
    return result;
   }catch(e){
    if(epoch===this.epoch){
     if(e.status===409||e.status===422||e.status===400){
      this.pending=null;
      try{localStorage.removeItem(Rewards.key(id,this.gameId));}catch(_){}
     }
     this.onError("Branch saved. XP "+(this.pending?"awaiting connection":"requires a fresh verified play")+".");
    }
    return {type:"pending",error:e.message};
   }
  }
  async retryPending() {
   if(!this.userId||this.pending)return;
   const id=this.userId,epoch=this.epoch;
   let pending=null;
   try{pending=JSON.parse(localStorage.getItem(Rewards.key(id,this.gameId))||"null");}catch(_){}
   if(!pending||!Number.isInteger(pending.level)||typeof pending.attempt_id!=="string")return;
   try{
    const result=await this.request("complete",pending);
    if(epoch!==this.epoch)return;
    localStorage.removeItem(Rewards.key(id,this.gameId));
    this.onUpdate({type:"award",level:pending.level,...result,restored:true});
   }catch(e){
    if(epoch!==this.epoch)return;
    if(e.status===409||e.status===422||e.status===400){
     try{localStorage.removeItem(Rewards.key(id,this.gameId));}catch(_){}
    }
   }
  }
 }
 global.RetroRewards={create:config=>new Rewards(config)};
})(window);
