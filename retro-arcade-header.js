/* Shared Retro Games Hub header — original, isolated, mobile-friendly. */
(function () {
 "use strict";
 const script=document.currentScript;
 if (!script||document.getElementById("retro-arcade-header")) return;
 const root=new URL("./",script.src);
 const url=name=>new URL(name,root).href;
 const arcade=url("retro-game-hub.html"), projects=url("projects.html"), profile=url("retro-player-profile.html");
 const gameId=script.dataset.gameId||"game";
 function accountURL(mode){
   const u=new URL(arcade);
   u.searchParams.set("auth",mode);
   u.searchParams.set("return_to",location.pathname+location.search);
   return u.href;
 }
 const host=document.createElement("div");
 host.id="retro-arcade-header";
 host.style.cssText="display:block;position:relative;z-index:1000;flex:none;align-self:stretch;width:100%;min-width:0;isolation:isolate";
 const shadow=host.attachShadow({mode:"open"});
 const css='<style>'+
 ':host{display:block;color:#e6f0ff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}*{box-sizing:border-box}' +
 '.bar{background:linear-gradient(180deg,#0a1220,#111e37);color:#e6f0ff;box-shadow:0 3px 16px #03071644;border-bottom:2px solid #34557a;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px 14px;padding:10px 14px;min-height:65px;width:100%;line-height:1.25}' +
 '.brand{display:flex;align-items:center;text-decoration:none;flex:none;color:#e7f7ff;gap:7px;white-space:nowrap}.crt{font-weight:1000;letter-spacing:1px;color:#a2d4ff;background:#0b1429;box-shadow:inset 0 -2px 0 #ffffff15,0 0 0 1px #6dc1ff60;padding:7px 9px;border-radius:6px;font-size:14px}.brand-mark{color:#e8c94a;font-size:18px}' +
 '.xp-badge{display:inline-flex;align-items:center;justify-content:center;flex:none;gap:6px;white-space:nowrap;min-height:36px;padding:6px 9px;border:2px solid #e9c36c;border-radius:7px;background:#241f1a;box-shadow:inset 0 0 0 1px #6d5135;color:#ffe7a1;font:900 13px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace}' +
 '.links{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center}.nav-link{display:inline-flex;align-items:center;gap:5px;justify-content:center;min-height:43px;text-decoration:none;color:#eaf2ff;background:#12233d;border:1px solid #496a8a;border-radius:9px;padding:9px 12px;font-size:14px;font-weight:800;white-space:nowrap}.nav-link:hover{border-color:#8ff1e6;background:#1a3352}.nav-link.profile{border-color:#78d8df;color:#d4fafa}' +
 '.account{display:flex;align-items:center;gap:7px;justify-content:flex-end;min-width:0}.player-status{display:inline-flex;align-items:center;gap:6px;color:#d8e8f8;font-weight:800;font-size:12px;white-space:nowrap;min-width:0}.player-status span:last-child{max-width:160px;overflow:hidden;text-overflow:ellipsis}.status-light{width:9px;height:9px;flex:none;background:#d5b56b;border-radius:50%;box-shadow:0 0 0 2px #544927}.status-light.signed-in{background:#73ebbd;box-shadow:0 0 0 2px #225b4c}' +
 '.sign-in,.sign-up,.logout{min-height:43px;display:inline-flex;align-items:center;justify-content:center;border-radius:9px;padding:9px 12px;font-family:inherit;font-weight:900;font-size:13px;white-space:nowrap;text-decoration:none;cursor:pointer}.sign-in{background:#152c46;color:#f8ffff;border:1px solid #8dece9}.sign-up{background:linear-gradient(135deg,#f9eb84,#efc653);color:#251536;border:1px solid #ffe787}.logout{background:#12233d;color:#e9f2ff;border:1px solid #6885a5}.sign-in:hover,.logout:hover{background:#284965}.sign-up:hover{background:#fff6b8}a:focus-visible,button:focus-visible{outline:3px solid #ffe15e;outline-offset:2px}[hidden]{display:none!important}' +
 '@media(max-width:860px){.bar{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 9px;padding:7px 9px}.brand{grid-column:1;grid-row:1}.brand .crt{font-size:12px;padding:6px 8px}.xp-badge{grid-column:2;grid-row:1;justify-self:end;min-height:32px;padding:4px 7px;font-size:12px}.account{grid-column:1/-1;grid-row:2;justify-content:flex-end}.links{grid-column:1/-1;grid-row:3;justify-content:stretch;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}.nav-link{font-size:12px;min-height:39px;padding:7px 4px}.player-status{font-size:11px}.sign-up{display:none}.logout,.sign-in{font-size:12px;min-height:37px;padding:6px 8px}}' +
 '@media(max-width:370px){.brand .crt{font-size:10px;letter-spacing:0}.brand-mark{font-size:14px}.player-status span:last-child{max-width:56px}.nav-link{font-size:11px}}' +
 '@media(max-height:510px) and (min-width:640px){.bar{min-height:49px;padding-top:4px;padding-bottom:4px;gap:7px}.crt{font-size:12px;padding:4px 6px}.nav-link,.sign-in,.sign-up,.logout{min-height:36px;padding:5px 7px;font-size:12px}.player-status{font-size:11px}}' +
 '</style>';
 shadow.innerHTML=css+
 '<div class="bar" role="banner" aria-label="Retro Games Hub navigation">'+
 '<a class="brand" id="site-brand" href="'+arcade+'"><span class="brand-mark" aria-hidden="true">✦</span><span class="crt">RETRO GAMES HUB</span></a>'+
 '<div class="xp-badge" id="xp-badge" hidden title="Verified arcade XP"><span aria-hidden="true">🌰</span><span id="xp-total">XP …</span></div>'+
 '<nav class="links" aria-label="Back navigation"><a class="nav-link" id="arcade-link" href="'+arcade+'">← Arcade</a><a class="nav-link" href="'+projects+'">← Projects</a><a class="nav-link profile" href="'+profile+'">★ My Profile</a></nav>'+
 '<div class="account" aria-label="Player account"><div class="player-status" aria-live="polite"><span class="status-light" id="status-light"></span><span id="player-text">Checking player…</span></div>'+
 '<a class="sign-in" id="login-link" href="'+accountURL("login")+'" hidden>Log In</a><a class="sign-up" id="signup-link" href="'+accountURL("signup")+'" hidden>Sign Up Free</a><button class="logout" id="logout-button" type="button" hidden>Log Out</button></div></div>';
 document.body.prepend(host);
 if(script.dataset.layout==="viewport"){
   document.body.classList.add("retro-arcade-viewport");
   const style=document.createElement("style");
   style.textContent="html{height:100%}body.retro-arcade-viewport{display:flex!important;flex-direction:column!important;margin:0!important;height:100dvh!important;min-height:0!important;overflow:hidden!important}body.retro-arcade-viewport > #retro-arcade-header{flex:0 0 auto!important}body.retro-arcade-viewport > main.shell,body.retro-arcade-viewport > main.game-shell,body.retro-arcade-viewport > #gameWrap,body.retro-arcade-viewport > .wrap{flex:1 1 0%!important;min-height:0!important;height:auto!important}";
   document.head.append(style);
 } else if(script.dataset.layout==="scroll"){
   const style=document.createElement("style");
   style.textContent="body{height:auto!important;min-height:100dvh!important;overflow-y:auto!important}";
   document.head.append(style);
 }
 let client=null,player=null;
 // Account-private visible-tab time estimates. Does NOT award XP, badges or leaderboard scores.
 const trackableGames=new Set([
   "claws-vs-paws","cut-the-cheese","fallen-grid","revive-nature","rink-putt",
   "hockey-gear-rush","survive-2026","acorn-ascent","bugged-out",
   "coastline-cruiser","lemon-pound-cake","wizards-mana","whack-a-bug",
   "choose-adventure","ferret-life","inbox-hero","community-garden"
 ]);
 // Personal estimated time only; never used for XP or public leaderboard scores.
 // A 'start' presence event resets the server cursor on initial load or resume
 // instead of crediting time spent behind another tab or app.
 let trackingTimer=null,heartbeatBusy=false,heartbeatIdentity=null,presenceNeedsStart=true;
 async function sendActivityHeartbeat(){
   if(!trackableGames.has(gameId)||!player||!client||document.hidden||
      (typeof document.hasFocus==="function"&&!document.hasFocus())||heartbeatBusy)return;
   const id=player.id;
   const mode=presenceNeedsStart?"start":"heartbeat";
   presenceNeedsStart=false;
   heartbeatBusy=true;
   try{
     // Authenticated server lookup: the browser never supplies a user ID,
     // timestamp, number of minutes, XP, or leaderboard score.
     if(player?.id===id){
       const result=await client.rpc("record_game_presence",{p_game_id:gameId,p_mode:mode});
       if(result.error)presenceNeedsStart=true;
     }
   }catch(_error){presenceNeedsStart=true;}
   finally{
     heartbeatBusy=false;
     // A tab may have been hidden and resumed during an in-flight request.
     if(mode!=="start" && presenceNeedsStart && player?.id===id &&
        !document.hidden && (typeof document.hasFocus!=="function"||document.hasFocus())){
       void sendActivityHeartbeat();
     }
   }
 }
 function syncActivityTracker(){
   const identity=trackableGames.has(gameId)?player?.id:null;
   if(!identity){
     heartbeatIdentity=null;
     presenceNeedsStart=true;
     if(trackingTimer!==null){clearInterval(trackingTimer);trackingTimer=null;}
     return;
   }
   if(identity===heartbeatIdentity)return;
   heartbeatIdentity=identity;
   presenceNeedsStart=true;
   if(trackingTimer!==null)clearInterval(trackingTimer);
   void sendActivityHeartbeat();
   trackingTimer=setInterval(()=>{void sendActivityHeartbeat();},30000);
 }
 document.addEventListener("visibilitychange",()=>{
   if(document.hidden){presenceNeedsStart=true;return;}
   void sendActivityHeartbeat();
 });
 window.addEventListener("blur",()=>{presenceNeedsStart=true;});
 window.addEventListener("focus",()=>{void sendActivityHeartbeat();});

 const txt=shadow.getElementById("player-text");
 const light=shadow.getElementById("status-light");
 const login=shadow.getElementById("login-link");
 const signup=shadow.getElementById("signup-link");
 const logout=shadow.getElementById("logout-button");
 const xpBadge=shadow.getElementById("xp-badge");
 const xpTotal=shadow.getElementById("xp-total");
 let xpRequest=0;
 function setAccount(user,name){
   const previousId=player&&player.id;
   player=user||null;
   if(previousId!==(player&&player.id)){xpRequest++;xpTotal.textContent="XP …";}
   xpBadge.hidden=!player;
   txt.textContent=player?"Player: "+(name||"Signed In"):"Guest Player";
   light.classList.toggle("signed-in",!!player);
   login.hidden=!!player;signup.hidden=!!player;logout.hidden=!player;
   syncActivityTracker();
 }
 async function refreshXp(user){
   if(!user||!client)return;
   const request=++xpRequest;
   xpTotal.textContent="XP …";
   try{
     // Display the same verified totals used on the Player Profile and Arcade.
     const result=await client.from("xp_ledger").select("amount").eq("user_id",user.id);
     if(request!==xpRequest||player?.id!==user.id)return;
     if(result.error)throw result.error;
     const total=(result.data||[]).reduce((sum,item)=>sum+(Number(item.amount)||0),0);
     xpTotal.textContent="XP "+total.toLocaleString();
     xpBadge.title=total.toLocaleString()+" verified arcade XP";
   }catch(_error){
     if(request!==xpRequest||player?.id!==user.id)return;
     xpTotal.textContent="XP —";
     xpBadge.title="XP temporarily unavailable";
   }
 }
 window.addEventListener("retro-arcade-xp-updated",()=>{if(player)void refreshXp(player);});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden&&player)void refreshXp(player);});
 const visitStarted=Date.now();
 function noteReturn(){
   if(player) return;
   try{
     if(sessionStorage.getItem("retroHubGuestInviteShown")==="yes")return;
     const prior=sessionStorage.getItem("retroHubPendingGuestGame");
     if(!prior && Date.now()-visitStarted>=5000){
       sessionStorage.setItem("retroHubPendingGuestGame",JSON.stringify({gameId:gameId,startedAt:visitStarted}));
     }
   }catch(_error){}
 }
 shadow.getElementById("site-brand").addEventListener("click",noteReturn);
 shadow.getElementById("arcade-link").addEventListener("click",noteReturn);
 logout.addEventListener("click",async function(){
   if(!client)return;
   logout.disabled=true;
   try{const result=await client.auth.signOut();if(result.error)throw result.error;setAccount(null);}
   catch(_error){txt.textContent="Sign out failed — try again";}
   finally{logout.disabled=false;}
 });
 async function showUser(user){
   if(!user){setAccount(null);return;}
   setAccount(user,"Signed In");
   void refreshXp(user);
   try{
     const result=await client.from("profiles").select("username").eq("id",user.id).maybeSingle();
     if(!result.error&&result.data&&result.data.username)setAccount(user,result.data.username);
   }catch(_error){}
 }
 function beginAuth(){
   if(!window.supabase||!window.supabase.createClient){setAccount(null);return;}
   try{
     client=window.supabase.createClient(
       "https://dxemotgroklcjsbunspg.supabase.co",
       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZW1vdGdyb2tsY2pzYnVuc3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjcyMjgsImV4cCI6MjA5MjkwMzIyOH0.3129v6Uc_XFv-XPfJv99jlQ9mYTuj492hM07TZdpnDo"
     );
     window.retroArcadeSupabaseClient=client;
     window.dispatchEvent(new Event("retro-arcade-auth-ready"));
     client.auth.getUser().then(function(result){return showUser(result.data&&result.data.user);}).catch(function(){setAccount(null);});
     client.auth.onAuthStateChange(function(_event,session){void showUser(session&&session.user);});
   }catch(_error){setAccount(null);}
 }
 if(window.supabase&&window.supabase.createClient)beginAuth();
 else{
   const loaderEl=document.createElement("script");
   loaderEl.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.min.js";
   loaderEl.async=true;
   loaderEl.onload=beginAuth;loaderEl.onerror=function(){setAccount(null);};
   document.head.append(loaderEl);
 }
 window.addEventListener("pageshow",function(event){
   if(event.persisted&&client)client.auth.getUser().then(function(result){return showUser(result.data&&result.data.user);}).catch(function(){});
 });
})();