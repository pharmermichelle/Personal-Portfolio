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
 const css = '<style>' +
 ':host{display:block;color:#f1f5ff;font:600 14px/1.3 system-ui,-apple-system,Segoe UI,Arial,sans-serif}*{box-sizing:border-box}[hidden]{display:none!important}' +
 '.bar{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;grid-template-areas:"brand player coffee links";gap:9px 14px;align-items:center;background:linear-gradient(110deg,#0c1529,#172641 60%,#0b1a30);border-bottom:2px solid #46cdd0;box-shadow:0 3px 12px #0005;padding:10px 14px;min-width:0}' +
 '.brand{grid-area:brand;display:flex;align-items:center;gap:8px;white-space:nowrap;text-decoration:none;color:#e9f7ff}.brand .star{color:#ffcf66;font-size:18px}.brand .wordmark{font-size:13px;font-weight:1000;letter-spacing:.75px;border:1px solid #5f89ac;padding:9px 10px;border-radius:8px;background:#11263f}' +
 '.player{grid-area:player;display:flex;gap:10px;align-items:center;min-width:0;color:inherit;text-decoration:none;border-radius:9px;padding:3px 5px}.player:hover{background:#273752}.avatar{display:grid;place-items:center;flex:none;width:52px;height:52px;border-radius:12px;background:#332854;border:2px solid #75dce5;overflow:hidden;font-size:23px}.avatar svg{width:100%;height:100%;object-fit:contain}.identity{min-width:0;flex:1}.name{font-weight:950;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.details{display:flex;gap:10px;align-items:center;margin-top:3px;font-size:13px;color:#ffe7a9;font-weight:900;white-space:nowrap}.level{color:#a8eeff}.track{width:min(235px,100%);height:6px;background:#2d3a58;border-radius:20px;margin-top:6px;overflow:hidden}.fill{height:100%;width:0;background:linear-gradient(90deg,#7fdbf1,#f2cc69);transition:width .2s}' +
 '.links{grid-area:links;display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:6px}.nav-link,.login,.logout,.coffee{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:8px 10px;border:1px solid #63849f;border-radius:8px;background:#152b45;color:#f2f8ff;text-decoration:none;font-weight:900;font-size:12px;white-space:nowrap;cursor:pointer}.nav-link:hover,.login:hover,.logout:hover{background:#294660}.coffee{grid-area:coffee;background:#4d314c;border-color:#ecafcf;color:#ffe6f7}.coffee:hover{background:#66405c}.logout{background:#192439}.login{border-color:#f1d27b;color:#ffeab7}.nav-link:focus-visible,.coffee:focus-visible,.player:focus-visible,.logout:focus-visible,.login:focus-visible{outline:3px solid #ffdd7f;outline-offset:2px}' +
 '@media(max-width:1050px){.bar{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"brand coffee" "player player" "links links";gap:6px 9px;padding:8px 10px}.brand .wordmark{padding:6px 8px;font-size:12px}.coffee{grid-area:coffee;justify-self:end;min-height:34px;padding:5px 9px}.player{padding:4px 3px}.avatar{width:45px;height:45px}.details{margin-top:2px}.track{margin-top:4px}.links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));width:100%;gap:5px}.nav-link{min-height:39px;white-space:normal;text-align:center;padding:6px 5px}.logout,.login{grid-column:4}.links .profile-link{grid-column:3}.links .home-link{grid-column:1}.links .projects-link{grid-column:2}.links .coffee{display:none}.links .logout,.links .login{font-size:11px}}' +
 '@media(max-width:400px){.name{font-size:14px}.details{font-size:12px}.nav-link{font-size:11px}.brand .wordmark{font-size:11px}.coffee{font-size:11px}.avatar{width:42px;height:42px}}' +
 '</style>';
 shadow.innerHTML = css +
 '<div class="bar" role="banner" aria-label="Retro Games Hub player navigation">' +
 '<a class="brand" id="site-brand" href="'+arcade+'"><span class="star" aria-hidden="true">✦</span><span class="wordmark">RETRO GAMES HUB</span></a>' +
 '<a class="coffee" href="https://venmo.com/pharmermichelle" target="_blank" rel="noopener noreferrer" title="Buy Dev a Coffee with Venmo">☕ Buy Dev a Coffee</a>' +
 '<a class="player" id="player-card" href="'+profile+'" aria-label="View your arcade player profile"><span class="avatar" id="player-avatar">🎮</span><span class="identity"><span class="name" id="player-text" style="display:block">Checking player…</span><span class="details"><span class="level" id="player-level">LEVEL —</span><span id="xp-total">XP —</span></span><span class="track" role="progressbar" aria-label="XP toward next level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="player-track" style="display:block"><span class="fill" id="player-fill" style="display:block"></span></span></span></a>' +
 '<nav class="links" aria-label="Arcade navigation"><a class="nav-link home-link" id="arcade-link" href="'+arcade+'">← Arcade Hub</a><a class="nav-link projects-link" href="'+projects+'">← Projects</a><a class="nav-link profile-link" href="'+profile+'">★ My Profile</a><a class="login" id="login-link" href="'+accountURL("login")+'" hidden>Log In</a><button class="logout" id="logout-button" type="button" hidden>Log Out</button></nav>' +
 '</div>';
 document.body.prepend(host);
 // Load the same original avatars as the player profile across every game.
 if(!window.RetroHubAvatars){
   const avatarScript=document.createElement("script");
   avatarScript.src=url("retro-player-avatar.js?v=20261121");
   avatarScript.async=true;
   avatarScript.onload=()=>{if(player)void refreshPlayer(player);};
   document.head.appendChild(avatarScript);
 }
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
   "choose-adventure","ferret-life","inbox-hero","community-garden","grass-snake","neon-pong","brick-blitz"
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
   // Faster heartbeat for short, focused cheese rounds; server still caps
  // elapsed time and refuses credit for inactive/background tabs.
  trackingTimer=setInterval(()=>{void sendActivityHeartbeat();},
    gameId==="cut-the-cheese"?15000:30000);
 }
 document.addEventListener("visibilitychange",()=>{
   if(document.hidden){presenceNeedsStart=true;return;}
   void sendActivityHeartbeat();
 });
 window.addEventListener("blur",()=>{presenceNeedsStart=true;});
 window.addEventListener("focus",()=>{void sendActivityHeartbeat();});

 const txt=shadow.getElementById("player-text");
 const avatar=shadow.getElementById("player-avatar");
 const levelText=shadow.getElementById("player-level");
 const xpTotal=shadow.getElementById("xp-total");
 const xpFill=shadow.getElementById("player-fill");
 const xpTrack=shadow.getElementById("player-track");
 const login=shadow.getElementById("login-link");
 const logout=shadow.getElementById("logout-button");
 let profileRequest=0;
 let displayedUserId=null;
 function clearPlayerStatus(){
   txt.textContent="Guest Player";
   avatar.textContent="🎮";
   levelText.textContent="LEVEL —";
   xpTotal.textContent="Sign in for XP";
   xpFill.style.width="0%";
   xpTrack.setAttribute("aria-valuenow","0");
 }
 function setAccount(user){
   const oldId=player?.id||null;
   player=user||null;
   if(oldId!==player?.id){profileRequest++;displayedUserId=null;clearPlayerStatus();}
   login.hidden=!!player;
   logout.hidden=!player;
   if(!player)clearPlayerStatus();
   else if(displayedUserId!==player.id)txt.textContent=player.user_metadata?.username||player.email?.split("@")[0]||"Player";
   syncActivityTracker();
 }
 function paintAvatar(key){
   avatar.textContent="🎮";
   if(!key)return;
   if(window.RetroHubAvatars&&typeof window.RetroHubAvatars.render==="function"){
     try{avatar.innerHTML=window.RetroHubAvatars.render(key);}
     catch(error){console.warn("Player avatar render failed",error);}
   }
 }
 async function refreshPlayer(user){
   if(!user||!client)return;
   const request=++profileRequest;
   const id=user.id;
   try{
     const [p,x]=await Promise.all([
       client.from("profiles").select("username,avatar_key").eq("id",id).maybeSingle(),
       client.from("xp_ledger").select("amount").eq("user_id",id)
     ]);
     if(request!==profileRequest||player?.id!==id)return;
     if(p.error)console.warn("Player name/avatar unavailable:",p.error.code||p.error.message);
     const row=p.error?null:p.data;
     txt.textContent=row?.username||user.email?.split("@")[0]||"Player";
     paintAvatar(row?.avatar_key);
     displayedUserId=id;
     if(x.error)throw x.error;
     const total=(x.data||[]).reduce((sum,item)=>sum+(Number(item.amount)||0),0);
     const level=Math.floor(Math.sqrt(Math.max(0,total)/50))+1;
     const start=50*(level-1)*(level-1),next=50*level*level;
     const progress=Math.max(0,Math.min(100,100*(total-start)/(next-start)));
     levelText.textContent="LV "+level;
     xpTotal.textContent="XP "+total.toLocaleString();
     xpFill.style.width=progress+"%";
     xpTrack.setAttribute("aria-valuenow",String(Math.round(progress)));
     xpTotal.title=(total-start)+" / "+(next-start)+" XP until next level";
   }catch(error){
     if(request!==profileRequest||player?.id!==id)return;
     xpTotal.textContent="XP unavailable";
     console.warn("Player stats unavailable",error?.message||error);
   }
 }
 window.addEventListener("retro-arcade-xp-updated",()=>{if(player)void refreshPlayer(player);});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden&&player)void refreshPlayer(player);});
 window.addEventListener("retro-arcade-avatar-updated",()=>{if(player)void refreshPlayer(player);});
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
   const alreadyReady=player?.id===user.id && displayedUserId===user.id;
   setAccount(user);
   if(!alreadyReady)void refreshPlayer(user);
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
     // Use the cached Supabase session first, then verify it without holding the UI in loading.
     client.auth.getSession().then(({data})=>showUser(data?.session?.user||null))
       .catch(()=>setAccount(null));
     client.auth.onAuthStateChange((_event,session)=>{
       void showUser(session?.user||null);
     });
     client.auth.getUser().then(({data,error})=>{
       if(error){console.warn("Player session verification:",error.message);return;}
       if((data?.user?.id||null)!==(player?.id||null))void showUser(data?.user||null);
     }).catch(error=>console.warn("Player verification unavailable",error?.message||error));
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