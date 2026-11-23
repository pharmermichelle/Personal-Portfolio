/* Original mascot characters and profile creator — Michelle's Retro Game Hub */
(() => {
  "use strict";
  const PROJECT_URL = "https://dxemotgroklcjsbunspg.supabase.co";
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZW1vdGdyb2tsY2pzYnVuc3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjcyMjgsImV4cCI6MjA5MjkwMzIyOH0.3129v6Uc_XFv-XPfJv99jlQ9mYTuj492hM07TZdpnDo";
  const GAMES = [
    ["Claws vs. Paws", "claws-vs-paws", "minigame/claws-vs-paws/index.html"],
    ["Cut the Cheese", "cut-the-cheese", "minigame/Cut-the-Cheese/index.html"],
    ["Grass Snake: Bug Hunt", "grass-snake", "minigame/grass-snake/index.html"],
    ["Neon Pong", "neon-pong", "minigame/neon-pong/index.html"],
    ["Brick Blitz", "brick-blitz", "minigame/brick-blitz/index.html"],
    ["Fallen Grid", "fallen-grid", "minigame/Tide-Tetris/index.html"],
    ["Revive Nature", "revive-nature", "minigame/Revive-nature/revive-index.html"],
    ["Rink Putt", "rink-putt", "minigame/hockey_shooter/index.html"],
    ["Hockey Gear Rush", "hockey-gear-rush", "minigame/hockey-gear-rush/index.html"],
    ["Survive 2026", "survive-2026", "minigame/survive-2026/index.html"],
    ["Acorn Ascent", "acorn-ascent", "minigame/acorn-ascent/index.html"],
    ["Bugged Out!", "bugged-out", "minigame/bugged-out/index.html"],
    ["Coastline Cruiser", "coastline-cruiser", "minigame/coastline-cruiser/cruiser.html"],
    ["Lemon Pound Cake", "lemon-pound-cake", "minigame/pound_cake/index.html"],
    ["Wizard's Mana Forge", "wizards-mana", "minigame/clickgame.html"],
    ["Whack-a-Bug", "whack-a-bug", "minigame/whackgame.html"],
    ["Choose Your Adventure", "choose-adventure", "minigame/game.html"],
    ["Ferret Life", "ferret-life", "minigame/ferret-life/index.html"],
    ["Inbox Hero", "inbox-hero", "minigame/inbox-hero.html"],
    ["Community Garden", "community-garden", "minigame/community-garden.html"]
  ];
  const avatars = [
    {key:"chrome-byte", name:"Chrome Byte", type:"Friendly robot", color:"#b6e5fa", dark:"#5583b2", eyes:"#101b46"},
    {key:"zorp-scout", name:"Zorp Scout", type:"Three-eyed alien", color:"#89f6a5", dark:"#3b9f79", eyes:"#253454"},
    {key:"neon-fin", name:"Neon Fin", type:"Shark adventurer", color:"#87cbea", dark:"#357ab7", eyes:"#152d48"},
    {key:"mega-moss", name:"Mega Moss", type:"Mountain gorilla", color:"#aa80d0", dark:"#684990", eyes:"#1c1636"},
    {key:"tape-ghost", name:"Tape Ghost", type:"Spectral tape creature", color:"#f4d0ff", dark:"#ad62cb", eyes:"#3a2455"},
    {key:"disco-orbit", name:"Disco Orbit", type:"Cosmic cyclops", color:"#ff9bc8", dark:"#bd4d98", eyes:"#2a135c"},
    {key:"circuit-newt", name:"Circuit Newt", type:"Neon salamander", color:"#ffb669", dark:"#de6b5b", eyes:"#46223b"},
    {key:"astro-moth", name:"Astro Moth", type:"Starlight insect", color:"#c6c4ff", dark:"#7b76cb", eyes:"#27204a"},
    {key:"jelly-jolt", name:"Jelly Jolt", type:"Electric jelly critter", color:"#7cf1ec", dark:"#2da7b7", eyes:"#233b57"}
  ];
  const byId = id => document.getElementById(id);
  const escapeAttr = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let selected = avatars[0], client=null, user=null, equippedShirt=false, shirtOwned=false, equippedHat=false, hatOwned=false;

  const heads = {
    "chrome-byte": a => '<rect x="43" y="30" width="94" height="77" rx="18" fill="'+a.color+'" stroke="#34235c" stroke-width="6"/><rect x="51" y="57" width="78" height="34" rx="7" fill="#193255"/><rect x="61" y="66" width="19" height="13" rx="4" fill="#5af5eb"/><rect x="99" y="66" width="19" height="13" rx="4" fill="#5af5eb"/><path d="M75 85h30" stroke="#fdb9e6" stroke-width="4"/><rect x="83" y="12" width="14" height="23" rx="5" fill="'+a.color+'"/><circle cx="90" cy="10" r="9" fill="#fff05f"/><rect x="34" y="60" width="12" height="24" rx="5" fill="'+a.dark+'"/><rect x="134" y="60" width="12" height="24" rx="5" fill="'+a.dark+'"/>',
    "zorp-scout": a => '<path d="M42 78Q28 27 89 24Q155 24 139 82Q132 111 91 111Q53 110 42 78Z" fill="'+a.color+'" stroke="#34235c" stroke-width="6"/><path d="M64 30L51 12M114 30L125 12" stroke="'+a.dark+'" stroke-width="7"/><circle cx="50" cy="12" r="7" fill="#fff05f"/><circle cx="127" cy="12" r="7" fill="#fff05f"/><ellipse cx="65" cy="76" rx="13" ry="16" fill="#25234e"/><ellipse cx="112" cy="76" rx="13" ry="16" fill="#25234e"/><circle cx="90" cy="47" r="10" fill="#25234e"/><circle cx="61" cy="72" r="3" fill="#fff"/><circle cx="108" cy="72" r="3" fill="#fff"/><path d="M76 96q15 12 29 0" stroke="#2c3362" stroke-width="4" fill="none"/>',
    "neon-fin": a => '<path d="M54 40L87 7L112 41Q139 44 143 76Q138 111 87 109Q38 111 38 75Q39 51 54 40Z" fill="'+a.color+'" stroke="#283e72" stroke-width="6"/><path d="M82 15L87 43L104 42" fill="'+a.dark+'"/><path d="M48 80Q92 105 132 78L127 103Q90 116 53 99Z" fill="#f7edf7"/><circle cx="63" cy="67" r="6" fill="#1b3453"/><circle cx="116" cy="67" r="6" fill="#1b3453"/><path d="M70 94l9 7 8-6 9 6 8-7" stroke="#345679" stroke-width="3" fill="none"/><path d="M40 67L19 57L34 91M143 69L160 56L151 92" fill="'+a.dark+'" stroke="#283e72" stroke-width="4"/>',
    "mega-moss": a => '<path d="M47 35Q27 19 22 60Q20 88 45 92Q48 114 90 113Q134 114 138 92Q161 87 158 60Q154 20 133 35Q110 17 89 20Q65 17 47 35Z" fill="'+a.dark+'" stroke="#31204e" stroke-width="6"/><path d="M55 54Q85 37 125 54Q141 94 99 105H80Q43 103 55 54Z" fill="'+a.color+'"/><ellipse cx="72" cy="72" rx="7" ry="10" fill="#29193e"/><ellipse cx="108" cy="72" rx="7" ry="10" fill="#29193e"/><ellipse cx="89" cy="88" rx="14" ry="9" fill="#493260"/><path d="M80 100q10 5 19 0" stroke="#39234b" stroke-width="4"/><path d="M54 33q-22-17-27 13M124 33q22-17 27 13" stroke="'+a.color+'" stroke-width="9" fill="none"/>',
    "tape-ghost": a => '<path d="M44 104V58Q48 20 89 20Q135 20 138 59L144 113L120 99L102 113L83 100L61 114Z" fill="'+a.color+'" stroke="#543077" stroke-width="6"/><rect x="51" y="42" width="77" height="49" rx="8" fill="#78419b" stroke="#4e2d80" stroke-width="4"/><rect x="59" y="49" width="61" height="20" rx="3" fill="#dfb8fd"/><circle cx="76" cy="59" r="7" fill="#2d255d"/><circle cx="103" cy="59" r="7" fill="#2d255d"/><path d="M76 82h28" stroke="#ffdf67" stroke-width="5"/><path d="M89 20V8" stroke="#fce584" stroke-width="5"/><circle cx="89" cy="7" r="5" fill="#fa6fc9"/>',
    "disco-orbit": a => '<path d="M87 18Q138 19 140 72Q136 111 89 113Q38 111 37 71Q39 20 87 18Z" fill="'+a.color+'" stroke="#65316e" stroke-width="6"/><ellipse cx="89" cy="71" rx="28" ry="29" fill="#fff3fa" stroke="#9b3e8c" stroke-width="5"/><ellipse cx="89" cy="71" rx="12" ry="16" fill="#30205c"/><circle cx="85" cy="65" r="5" fill="white"/><path d="M41 45L26 30M135 43L153 30M87 19V1" stroke="#ffda65" stroke-width="7" stroke-linecap="round"/><circle cx="27" cy="27" r="6" fill="#fff05f"/><circle cx="150" cy="27" r="6" fill="#fff05f"/>',
    "circuit-newt": a => '<path d="M46 46Q59 23 90 24Q127 23 139 50Q149 95 91 108Q31 100 46 46Z" fill="'+a.color+'" stroke="#7f3c62" stroke-width="6"/><path d="M44 45L24 24L27 54L15 71L41 70M139 46L157 24L154 55L167 71L142 70" fill="'+a.dark+'" stroke="#7f3c62" stroke-width="4"/><circle cx="64" cy="68" r="10" fill="#352445"/><circle cx="115" cy="68" r="10" fill="#352445"/><circle cx="61" cy="65" r="3" fill="#fff"/><circle cx="112" cy="65" r="3" fill="#fff"/><path d="M76 91q13 10 27 0" stroke="#ae3b64" stroke-width="5" fill="none"/><path d="M81 29L89 11L99 28" fill="#fbe37b"/>',
    "astro-moth": a => '<path d="M58 47Q25 12 19 57Q19 88 60 95M123 47Q156 12 161 57Q161 88 120 95" fill="'+a.dark+'" stroke="#3e3b75" stroke-width="6"/><path d="M52 63Q45 22 89 24Q137 21 128 68Q132 106 88 111Q46 109 52 63Z" fill="'+a.color+'" stroke="#48417d" stroke-width="6"/><path d="M69 30L56 10M111 30L123 10" stroke="#eee9ff" stroke-width="6"/><circle cx="55" cy="11" r="7" fill="#fff05f"/><circle cx="124" cy="11" r="7" fill="#fff05f"/><ellipse cx="72" cy="71" rx="11" ry="13" fill="#3a2b77"/><ellipse cx="109" cy="71" rx="11" ry="13" fill="#3a2b77"/><path d="M79 94l11 7 11-7" stroke="#775ea9" stroke-width="5" fill="none"/>',
    "jelly-jolt": a => '<path d="M34 97Q29 71 44 45Q55 21 91 20Q135 22 146 60Q152 83 143 103L130 95L116 109L100 97L87 110L68 98L50 110Z" fill="'+a.color+'" stroke="#2c6b83" stroke-width="6"/><ellipse cx="66" cy="73" rx="13" ry="17" fill="#1b5267"/><ellipse cx="113" cy="73" rx="13" ry="17" fill="#1b5267"/><circle cx="62" cy="68" r="4" fill="white"/><circle cx="108" cy="68" r="4" fill="white"/><path d="M81 91q10 8 18 0" stroke="#2b6683" stroke-width="4" fill="none"/><path d="M89 19L105 3L105 21L122 11" fill="none" stroke="#ffe65c" stroke-width="6"/>'
  };

  function avatarSVG(a, size) {
    const small = size === "small";
    const head = heads[a.key](a);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 244" role="presentation" aria-hidden="true" focusable="false">'
      + '<ellipse cx="90" cy="232" rx="59" ry="10" fill="#171034" opacity=".5"/>'
      + '<path d="M48 118L28 156L43 168L66 143M131 118L152 158L135 168L115 140" fill="'+a.color+'" stroke="#251944" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path d="M57 112L42 142L61 158L77 136M122 112L137 142L119 158L104 136" fill="#ff62b6" stroke="#391a61" stroke-width="5" stroke-linejoin="round"/>'
      + '<path d="M62 184L62 218L86 219L91 185M95 185L96 218L122 219L117 183" fill="'+a.color+'" stroke="#251944" stroke-width="6"/>'
      + '<path d="M62 180L60 205L89 205L90 183M91 183L93 205L120 205L118 180" fill="#4bc8ef" stroke="#291b59" stroke-width="4"/>'
      + '<path d="M58 216h31v15H49q-3-12 9-15ZM93 216h31q11 3 10 15H93Z" fill="#fff5e7" stroke="#302356" stroke-width="5"/>'
      + '<path d="M64 108Q90 99 116 108L130 154L119 185H62L50 154Z" fill="'+(equippedShirt?'#647a3a':'#ffef69')+'" stroke="#30235b" stroke-width="6"/>'
      + (equippedShirt?'<path d="M97 126Q105 137 92 159" fill="none" stroke="#65472e" stroke-width="5"/><path d="M80 150Q82 130 96 139Q102 146 92 151Q84 158 80 150Z" fill="#c98442" stroke="#7b4d2b" stroke-width="2"/><path d="M77 147Q65 138 73 134Q81 134 82 143" fill="none" stroke="#d7a05b" stroke-width="5"/><circle cx="92" cy="140" r="1.8" fill="#251944"/>':'')
      + '<path d="M63 167h55v19H63Z" fill="#d85d9d" stroke="#30235b" stroke-width="4"/>'
      + '<rect x="85" y="143" width="12" height="12" rx="3" fill="#fb65b7"/>'
      + '<g>'+head+'</g>'
      + (equippedHat?'<g stroke-linejoin="round"><path d="M43 38L90 1L137 38Q90 51 43 38Z" fill="#ffdf55" stroke="#6b3b22" stroke-width="5"/><path d="M43 38Q90 51 137 38L137 46Q90 60 43 46Z" fill="#e9a73f" stroke="#6b3b22" stroke-width="4"/><circle cx="90" cy="25" r="9" fill="#d8902f"/><circle cx="71" cy="38" r="6" fill="#d8902f"/><circle cx="110" cy="39" r="5" fill="#d8902f"/><path d="M65 38Q83 19 95 5" stroke="#fff4ad" stroke-width="4" opacity=".8" fill="none"/></g>':'')
      + (!small?'<path d="M18 19l4-8 4 8 9 3-9 3-4 8-4-8-9-3ZM147 119l3-7 3 7 7 3-7 3-3 7-3-7-7-3Z" fill="#fff07b"/>':"")
      + '</svg>';
  }
  function status(message, kind="") {
    const el=byId("save-status");
    el.textContent=message;
    el.className="save-status "+kind;
  }
  function renderAvatar() {
    byId("avatar-preview").innerHTML=avatarSVG(selected);
    byId("mini-portrait").innerHTML=avatarSVG(selected, "small");
    byId("avatar-preview").setAttribute("aria-label", selected.name+", full-body "+selected.type+(equippedHat?" wearing a cheese wedge hat":""));
    byId("avatar-name").textContent=selected.name;
    byId("avatar-type").textContent=selected.type+" / Level 1 look";
    byId("picked-label").textContent=selected.name;
    document.querySelectorAll(".avatar-option").forEach(b=>b.setAttribute("aria-pressed", String(b.dataset.avatar===selected.key)));
  }
  function setupOptions() {
    const grid=byId("avatar-grid");
    for(const a of avatars) {
      const b=document.createElement("button");
      b.type="button"; b.className="avatar-option"; b.dataset.avatar=a.key;
      b.setAttribute("aria-label","Choose "+a.name+", "+a.type);
      b.innerHTML=avatarSVG(a,"small")+"<span>"+escapeAttr(a.name)+"</span>";
      b.addEventListener("click",()=>{ selected=a;renderAvatar(); });
      grid.append(b);
    }
    renderAvatar();
  }
  // Personal stats are read from account-scoped Supabase tables. An unverified save or
  // client-reported activity NEVER counts as a verified score or grants XP.
  let statsRequest=0;
  const statLabels=["GAME","VISITS","RECORDED TIME","XP","SAVED PROGRESS","VERIFIED BEST","RANK"];
  const formatTime=seconds=>{
    const mins=Math.floor(Math.max(0,Number(seconds)||0)/60);
    if(!mins)return seconds>0?"Under 1m":"—";
    return mins>=60 ? Math.floor(mins/60)+"h "+(mins%60)+"m" : mins+"m";
  };
  function describeSave(gameId,record){
    if(!record)return "No cloud save";
    const data=record.save_data?.payload;
    if(!data || typeof data!=="object")return "Cloud save available";
    // Cloud saves are player-editable personal progress, not verified scores.
    if(gameId==="brick-blitz"){
      const unlocked=Number(data.unlocked);
      return Number.isInteger(unlocked)&&unlocked>=1&&unlocked<=12
        ? "Level "+unlocked+" unlocked (personal)" : "Cloud progress saved";
    }
    if(gameId==="neon-pong"){
      const wins=Number(data.wins),matches=Number(data.matches),rally=Number(data.bestRally);
      if([wins,matches,rally].every(Number.isInteger)&&wins>=0&&wins<=matches&&matches<=1000000&&rally>=0)
        return wins+" wins / "+matches+" matches · best rally "+rally+" (personal)";
      return "Cloud progress saved";
    }
    const level=Number(data.level);
    let parts=[];
    if(Number.isInteger(level) && level>=0)
      parts.push((gameId==="acorn-ascent"?"Branch ":"Level ")+level);
    if(gameId==="acorn-ascent" && Number.isFinite(Number(data.acorns)))
      parts.push(Math.max(0,Number(data.acorns))+" acorns");
    if(gameId==="acorn-ascent" && data.complete===true)parts.push("Completed");
    return parts.join(" · ") || "Cloud save available";
  }
  function renderGames(stats={}){
    const body=byId("game-records");
    body.replaceChildren();
    const activity=stats.activity||new Map();
    const saves=stats.saves||new Map();
    const scores=stats.scores||new Map();
    const xp=stats.xp||new Map();
    for(const [title,id,href] of GAMES){
      const a=activity.get(id);
      const saved=saves.get(id);
      const score=scores.get(id);
      const gameXP=xp.get(id);
      const tr=document.createElement("tr");
      const values=[
        title,
        a?String(Math.max(1,Number(a.visits)||1)):"—",
        a&&Number(a.active_seconds)>0?formatTime(a.active_seconds):"—",
        gameXP===undefined?"—":gameXP.toLocaleString()+" XP",
        describeSave(id,saved),
        score===undefined?"—":score.toLocaleString(),
        "Not live"
      ];
      values.forEach((value,i)=>{
        const td=document.createElement("td");
        td.dataset.label=statLabels[i];
        if(i===0){
          const link=document.createElement("a");
          link.href=href;link.textContent=value;
          td.append(link);
        }else td.textContent=value;
        if(i===4 && saved)td.title="Latest cloud save, not a verified result";
        if(i===5)td.title="Only server-verified leaderboard scores appear here";
        tr.append(td);
      });
      body.append(tr);
    }
  }
  async function loadGameStats(account){
    if(!client||!account)return;
    const request=++statsRequest;
    const marker=byId("game-stats-status");
    if(marker)marker.textContent="Loading your recorded game progress…";
    const queries=[
      client.from("game_activity").select("game_id,active_seconds,visits,last_seen_at").eq("user_id",account),
      client.from("game_saves").select("game_id,save_data,updated_at").eq("user_id",account),
      client.from("xp_ledger").select("game_id,amount").eq("user_id",account),
      client.from("game_scores").select("game_id,score,is_verified").eq("user_id",account).eq("is_verified",true)
    ];
    const outcomes=await Promise.allSettled(queries);
    if(request!==statsRequest||user?.id!==account)return;
    const errors=[];
    const values=outcomes.map((response,i)=>{
      if(response.status==="rejected"){errors.push(["activity","saves","XP","scores"][i]);return [];}
      if(response.value.error){errors.push(["activity","saves","XP","scores"][i]);return [];}
      return response.value.data||[];
    });
    const [rawActivity,rawSaves,rawXP,rawScores]=values;
    const activity=new Map(rawActivity.map(row=>[row.game_id,row]));
    const saves=new Map(rawSaves.map(row=>[row.game_id,row]));
    const xp=new Map();
    for(const row of rawXP)xp.set(row.game_id,(xp.get(row.game_id)||0)+(Number(row.amount)||0));
    const scores=new Map();
    for(const row of rawScores){
      const v=Number(row.score);
      if(Number.isFinite(v))scores.set(row.game_id,Math.max(v,scores.get(row.game_id)??-Infinity));
    }
    renderGames({activity,saves,xp,scores});
    const ids=new Set([...activity.keys(),...saves.keys(),...xp.keys(),...scores.keys()]);
    const seconds=rawActivity.reduce((sum,row)=>sum+Math.max(0,Number(row.active_seconds)||0),0);
    byId("games-tracked").textContent=String(ids.size);
    byId("total-time").textContent=formatTime(seconds);
    if(marker)marker.textContent=errors.length
      ? "Some stats are unavailable ("+errors.join(", ")+"). Other available records are shown."
      : "Visits and estimated visible game time begin with the new tracker. Existing saves and XP are preserved; earlier playtime cannot be recovered.";
    const countNote=byId("games-tracked-note");
    if(countNote)countNote.textContent="Games with an account record";
    const timeNote=byId("total-time-note");
    if(timeNote)timeNote.textContent="Estimated focused game-page time; no XP awarded";
  }
  function clearGameStats(){
    ++statsRequest;
    renderGames();
    byId("games-tracked").textContent="—";
    byId("total-time").textContent="—";
    const marker=byId("game-stats-status");
    if(marker)marker.textContent="Sign in to view your recorded activity and saves.";
  }
  function updateAuthUI() {
    byId("save-profile").disabled=!user;
    byId("save-name").disabled=!user;
    byId("sign-in-link").style.display=user?"none":"inline-flex";
    byId("account-status").textContent=user?"Signed in • Account settings":"Not signed in";
    if(!user) {
      byId("display-name").textContent="Guest Player";
      byId("player-level").textContent="—";
      byId("xp-text").textContent="Sign in to see your saved XP";
      const progress=byId("xp-current-progress");
      if(progress)progress.textContent="Account not connected. Your existing XP is saved on your account, not lost.";
      const bar=byId("xp-progress-fill");
      if(bar)bar.style.width="0%";
      for(const key of ["total-time","badge-count","games-tracked","overall-rank"]){
        const element=byId(key);if(element)element.textContent="—";
      }
      const stats=byId("game-stats-status");
      if(stats)stats.textContent="Sign in to load your saved game stats and XP.";
      status("You are viewing the guest preview. Sign in to load your existing arcade XP and character.");
    }
  }
  function setRewardStatus(text) {
    const e=byId("rewards-status");if(e)e.textContent=text;
  }
  async function loadRewards() {
    if(!client||!user)return;
    const account=user.id;
    try {
      const [xp,badges,inventory,equipped]=await Promise.all([
        client.from("xp_ledger").select("amount,game_id").eq("user_id",account),
        client.from("earned_badges").select("badge_id,earned_at").eq("user_id",account),
        client.from("player_inventory").select("cosmetic_id,awarded_at").eq("user_id",account),
        client.from("equipped_cosmetics").select("cosmetic_id,slot").eq("user_id",account)
      ]);
      for(const v of [xp,badges,inventory,equipped])if(v.error)throw v.error;
      if(!user||user.id!==account)return;
      const total=(xp.data||[]).reduce((n,item)=>n+Number(item.amount||0),0);
      const acornXP=(xp.data||[]).filter(item=>item.game_id==="acorn-ascent")
        .reduce((n,item)=>n+Number(item.amount||0),0);
      const cheeseXP=(xp.data||[]).filter(item=>item.game_id==="cut-the-cheese")
        .reduce((n,item)=>n+Number(item.amount||0),0);
      const level=Math.floor(Math.sqrt(total/50))+1;
      const levelStart=50*(level-1)*(level-1),levelEnd=50*level*level;
      const earnedThisLevel=Math.max(0,total-levelStart),neededForNext=levelEnd-levelStart;
      byId("player-level").textContent=String(level);
      byId("xp-text").textContent=total+" XP total";
      const progress=byId("xp-current-progress");
      if(progress)progress.textContent=earnedThisLevel+" / "+neededForNext+" XP to next player level · "+acornXP+" Acorn XP · "+cheeseXP+" Cheese XP";
      const bar=byId("xp-progress-fill");
      if(bar)bar.style.width=Math.min(100,100*earnedThisLevel/neededForNext)+"%";
      byId("badge-count").textContent=String((badges.data||[]).length);
      byId("badge-note").textContent="Official account badges";
      const earned=(badges.data||[]).some(x=>x.badge_id==="acorn-complete");
      const hasShirt=(inventory.data||[]).some(x=>x.cosmetic_id==="shirt-acorn-ascent");
      shirtOwned=hasShirt;
      const shirt=byId("acorn-shirt-card");
      if(shirt){
       shirt.classList.toggle("locked",!hasShirt);
       shirt.classList.toggle("unlocked",hasShirt);
       byId("acorn-shirt-state").textContent=hasShirt?"OWNED":"LOCKED";
       const button=byId("equip-acorn-shirt");
       button.hidden=!hasShirt;
       equippedShirt=hasShirt&&(equipped.data||[]).some(x=>x.slot==="shirt"&&x.cosmetic_id==="shirt-acorn-ascent");
       button.textContent=equippedShirt?"Equipped ✓":"Wear This Shirt";
       renderAvatar();
      }
      const badge=byId("acorn-earned-badge");
      if(badge){
       badge.hidden=!earned;
       byId("badge-details").textContent=earned?
        "Oakward Bound unlocked! All ten branches mastered.":"Earn Oakward Bound by completing all ten Acorn Ascent branches.";
      }
      const hasHat=(inventory.data||[]).some(x=>x.cosmetic_id==="hat-cheese-wedge");
      hatOwned=hasHat;
      equippedHat=hasHat&&(equipped.data||[]).some(x=>x.slot==="hat"&&x.cosmetic_id==="hat-cheese-wedge");
      const hat=byId("cheese-hat-card");
      if(hat){
        hat.classList.toggle("locked",!hasHat);
        hat.classList.toggle("unlocked",hasHat);
        byId("cheese-hat-state").textContent=hasHat?"OWNED":"LOCKED";
        const button=byId("equip-cheese-hat");
        button.hidden=!hasHat;
        button.textContent=equippedHat?"Remove Hat ✓":"Wear This Hat";
        renderAvatar();
      }
      const cheeseBadge=(badges.data||[]).some(x=>x.badge_id==="cheese-ten-levels");
      byId("cheese-earned-badge").hidden=!cheeseBadge;
      const cheeseClears=(xp.data||[]).filter(item=>item.game_id==="cut-the-cheese").length;
      byId("cheese-badge-details").textContent=cheeseBadge?
        "Big Cheese earned! Your cheese wedge hat is now in the wardrobe.":
        cheeseClears+" / 10 distinct signed-in level clears toward Big Cheese.";
      setRewardStatus("Account rewards loaded • "+acornXP+" Acorn XP • "+cheeseXP+" Cheese XP");
    }catch(e){setRewardStatus("Rewards unavailable: "+(e.message||"Try again")); }
  }
  async function equipAcornShirt() {
    if(!client||!user||!shirtOwned)return;
    const id=user.id,button=byId("equip-acorn-shirt");
    button.disabled=true;
    try{
      if(equippedShirt){
        const {error}=await client.from("equipped_cosmetics").delete().eq("user_id",id).eq("slot","shirt");
        if(error)throw error;
      }else{
        const {error}=await client.from("equipped_cosmetics").upsert({
          user_id:id,slot:"shirt",cosmetic_id:"shirt-acorn-ascent"
        },{onConflict:"user_id,slot"});
        if(error)throw error;
      }
      await loadRewards();
    }catch(e){setRewardStatus("Could not update outfit: "+e.message);}
    finally{button.disabled=false;}
  }
  async function equipCheeseHat() {
    if(!client||!user||!hatOwned)return;
    const id=user.id,button=byId("equip-cheese-hat");
    button.disabled=true;
    try{
      if(equippedHat){
        const {error}=await client.from("equipped_cosmetics").delete().eq("user_id",id).eq("slot","hat");
        if(error)throw error;
      }else{
        const {error}=await client.from("equipped_cosmetics").upsert({
          user_id:id,slot:"hat",cosmetic_id:"hat-cheese-wedge"
        },{onConflict:"user_id,slot"});
        if(error)throw error;
      }
      await loadRewards();
    }catch(e){setRewardStatus("Could not update hat: "+e.message);}
    finally{button.disabled=false;}
  }
  async function loadProfile() {
    if(!user)return;
    const {data,error}=await client.from("profiles").select("username,avatar_key,is_public").eq("id",user.id).maybeSingle();
    if(error){status("Couldn't load account profile: "+error.message,"error");return;}
    if(data){
      savedProfile={username:data.username||null,avatar_key:data.avatar_key||null,is_public:data.is_public===true};
      if(data.username){byId("username").value=data.username;byId("display-name").textContent=data.username;}
      if(data.avatar_key){
        const found=avatars.find(a=>a.key===data.avatar_key);
        if(found){selected=found;renderAvatar();}
      }
      byId("profile-public").checked=data.is_public===true;
      status("Your account is connected. Choose a character and save changes.");
    }else status("Welcome! Choose your character and arcade name, then save to finish setting up.");
  }
  let savedProfile={username:null,avatar_key:null,is_public:false};
  async function saveProfile(part){
    if(!client||!user){status("Sign in to save your profile.","error");return;}
    const isName=part==="name";
    const btn=byId(isName?"save-name":"save-profile");
    const username=byId("username").value.trim();
    if(isName&&!/^[A-Za-z0-9_]{3,24}$/.test(username)){status("Username must be 3–24 letters, numbers, or underscores.","error");byId("name-editor").open=true;byId("username").focus();return;}
    btn.disabled=true;
    status(isName?"Saving your arcade name…":"Saving your avatar…");
    try{
      const changes=isName?{username,is_public:byId("profile-public").checked}:{avatar_key:selected.key};
      // Update only the chosen section; never overwrite unsaved changes in the other editor.
      const {data,error}=await client.from("profiles").update(changes).eq("id",user.id).select("id");
      if(error)throw error;
      if(!data?.length){
        const fallback={id:user.id,username:isName?username:(savedProfile.username||username),avatar_key:isName?(savedProfile.avatar_key||selected.key):selected.key,is_public:isName?byId("profile-public").checked:savedProfile.is_public};
        if(!/^[A-Za-z0-9_]{3,24}$/.test(fallback.username)){throw new Error("Choose a valid arcade name first, then save your avatar.");}
        const inserted=await client.from("profiles").upsert(fallback,{onConflict:"id"});
        if(inserted.error)throw inserted.error;
        Object.assign(savedProfile,fallback);
      }else Object.assign(savedProfile,changes);
      if(isName)byId("display-name").textContent=username;
      status(isName?"Arcade name saved!":"Avatar saved! Your new character is ready for the arcade.","success");
    }catch(e){status("Couldn't save: "+(e.message||"Please try again."),"error");}
    finally{btn.disabled=!user;}
  }
  async function start(){
    setupOptions();renderGames();
    byId("save-profile").addEventListener("click",()=>saveProfile("avatar"));
    byId("save-name").addEventListener("click",()=>saveProfile("name"));
    byId("equip-acorn-shirt").addEventListener("click",equipAcornShirt);
    byId("equip-cheese-hat").addEventListener("click",equipCheeseHat);
    window.addEventListener("focus",()=>{if(user)void loadGameStats(user.id);});
    document.addEventListener("visibilitychange",()=>{if(!document.hidden&&user)void loadGameStats(user.id);});
    if(!window.supabase || !window.supabase.createClient){status("Account connection is unavailable right now. Character preview still works.","error");return;}
    try{
      client=window.supabase.createClient(PROJECT_URL,ANON_KEY);
      const {data,error}=await client.auth.getUser();
      if(error && !/session missing|auth session missing/i.test(error.message||""))status("Account connection issue: "+error.message,"error");
      user=data?.user||null;
      updateAuthUI();
      if(user){await Promise.all([loadProfile(),loadRewards(),loadGameStats(user.id)]);}
      client.auth.onAuthStateChange((_event,session)=>{
        const next=session?.user||null;
        if(next?.id===user?.id)return;
        user=next;updateAuthUI();
        if(user){void loadProfile().then(loadRewards);void loadGameStats(user.id);}
        else{
          equippedShirt=false;shirtOwned=false;equippedHat=false;hatOwned=false;renderAvatar();clearGameStats();
          byId("player-level").textContent="—";byId("xp-text").textContent="Sign in for XP";
          byId("badge-count").textContent="—";setRewardStatus("Sign in to view your rewards");
          byId("equip-acorn-shirt").hidden=true;
          byId("equip-cheese-hat").hidden=true;
          byId("cheese-earned-badge").hidden=true;
          byId("acorn-earned-badge").hidden=true;
        }
      });
    }catch(e){status("Account service unavailable. You can still preview every avatar.","error");}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true}); else void start();
})();