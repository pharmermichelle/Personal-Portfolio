// Retro Games Hub official reward gateway: game adapters share one authenticated endpoint.
// Only this Edge Function uses the service role (server environment); browser cannot grant XP.
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

type Point = [number, number];
const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const anon=Deno.env.get("SUPABASE_ANON_KEY")!;
const secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin=createClient(SUPABASE_URL,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const configuredOrigins=new Set(["https://michellew.io","https://www.michellew.io"]);
function headers(origin:string|null):HeadersInit {
  return {"content-type":"application/json","access-control-allow-origin":configuredOrigins.has(origin||"")?origin!:"https://michellew.io",
    "vary":"Origin","access-control-allow-headers":"authorization,apikey,content-type,x-client-info","access-control-allow-methods":"POST, OPTIONS","cache-control":"no-store"};
}
function response(status:number,body:unknown,origin:string|null){return new Response(JSON.stringify(body),{status,headers:headers(origin)});}
function randomGenerator(seed:number) {
 let value=seed>>>0;
 return ()=>{value=(value+0x6d2b79f5)>>>0;let t=value;
   t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);
   return ((t^(t>>>14))>>>0)/4294967296;};
}
function shuffle<T>(items:T[],rng:()=>number):T[]{
 const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;
}
function normalize(blocks:Point[]):Point[]{
 const r=Math.min(...blocks.map(p=>p[0])),c=Math.min(...blocks.map(p=>p[1]));
 return blocks.map(p=>[p[0]-r,p[1]-c] as Point).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
}
function rotate(blocks:Point[]):Point[]{const mr=Math.max(...blocks.map(p=>p[0]));return normalize(blocks.map(p=>[p[1],mr-p[0]] as Point));}
function connected(cells:Point[]):boolean{
 if(!cells.length)return false;
 const keys=new Set(cells.map(p=>p.join(","))),seen=new Set<string>(),stack=[cells[0]];
 while(stack.length){const [r,c]=stack.pop()!,k=r+","+c;if(seen.has(k))continue;seen.add(k);
  for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]]){const nk=(r+dr)+","+(c+dc);
   if(keys.has(nk)&&!seen.has(nk))stack.push([r+dr,c+dc]);}}
 return seen.size===keys.size;
}
const CONFIG=[{size:3,pieces:3,twists:0},{size:4,pieces:4,twists:0},{size:4,pieces:4,twists:2},
 {size:5,pieces:5,twists:3},{size:5,pieces:6,twists:4},{size:6,pieces:6,twists:5},
 {size:6,pieces:7,twists:6},{size:7,pieces:7,twists:7},{size:7,pieces:8,twists:8},{size:8,pieces:9,twists:9}];
function levelPieces(index:number){
 const cfg=CONFIG[index],rng=randomGenerator(43571+index*104729);
 let regions=[{top:0,left:0,height:cfg.size,width:cfg.size}];
 while(regions.length<cfg.pieces){
  const candidates=regions.map((r,i)=>({r,i})).filter(({r})=>r.width>1||r.height>1)
   .sort((a,b)=>b.r.width*b.r.height-a.r.width*a.r.height);
  const {r,i}=candidates[0];
  const horizontal=r.height>1&&(r.width===1||(r.height>=r.width?rng()<.76:rng()<.28));
  const extent=horizontal?r.height:r.width;
  const cut=Math.max(1,Math.min(extent-1,Math.round(extent*(.35+rng()*.3))));
  const a={...r},b={...r};
  if(horizontal){a.height=cut;b.top+=cut;b.height-=cut;}else{a.width=cut;b.left+=cut;b.width-=cut;}
  regions.splice(i,1,a,b);
 }
 const owner=Array.from({length:cfg.size},()=>Array(cfg.size).fill(-1));
 regions.forEach((region,id)=>{
   for(let r=region.top;r<region.top+region.height;r++)
    for(let c=region.left;c<region.left+region.width;c++)owner[r][c]=id;
 });
 const minArea=index<2?2:3;
 for(let trial=0;trial<cfg.size*cfg.size*28;trial++){
  const r=Math.floor(rng()*cfg.size),c=Math.floor(rng()*cfg.size);
  const neighbors=shuffle([[0,1],[1,0],[0,-1],[-1,0]],rng),source=owner[r][c];
  for(const [dr,dc] of neighbors){
   const nr=r+dr,nc=c+dc;
   if(nr<0||nr>=cfg.size||nc<0||nc>=cfg.size||owner[nr][nc]===source)continue;
   const target=owner[nr][nc],sourceCells:Point[]=[],targetCells:Point[]=[];
   owner.forEach((row,rr)=>row.forEach((id,cc)=>{
     if(id===source&&!(rr===r&&cc===c))sourceCells.push([rr,cc]);
     if(id===target)targetCells.push([rr,cc]);
   }));
   if(sourceCells.length<minArea||targetCells.length>Math.ceil(cfg.size*cfg.size/cfg.pieces*1.6))continue;
   if(!connected(sourceCells))continue;
   if(rng()<.33){owner[r][c]=target;break;}
  }
 }
 const shapes=Array.from({length:cfg.pieces},(_,id)=>{
  const cells:Point[]=[];
  owner.forEach((row,r)=>row.forEach((o,c)=>{if(o===id)cells.push([r,c]);}));
  const solution=normalize(cells);
  let initial=solution;
  if(index>=2&&id<cfg.twists){const rotations=1+Math.floor(rng()*3);for(let k=0;k<rotations;k++)initial=rotate(initial);}
  return {id,initial};
 });
 return {size:cfg.size,shapes:shuffle(shapes,rng)};
}
function same(a:Point[],b:Point[]):boolean {return JSON.stringify(normalize(a))===JSON.stringify(normalize(b));}
function validateProof(level:number,placements:unknown):boolean{
 if(!Array.isArray(placements))return false;
 const board=levelPieces(level-1);
 if(placements.length!==board.shapes.length)return false;
 const covered=new Set<string>(),used=new Set<number>();
 for(const item of placements){
  if(!item||typeof item!=="object"||Array.isArray(item))return false;
  const p=item as {id?:unknown,row?:unknown,col?:unknown,blocks?:unknown};
  if(!Number.isInteger(p.id)||!Number.isInteger(p.row)||!Number.isInteger(p.col)
      ||!Array.isArray(p.blocks))return false;
  const id=p.id as number,row=p.row as number,col=p.col as number;
  if(used.has(id)||id<0||id>=board.shapes.length||row<0||col<0||row>=board.size||col>=board.size)return false;
  used.add(id);
  const blocks=p.blocks as unknown[];
  if(blocks.length<1||blocks.length>64||!blocks.every(c=>Array.isArray(c)&&c.length===2&&c.every(Number.isInteger)))return false;
  const points=blocks as Point[];
  let variant=board.shapes.find(s=>s.id===id)!.initial;
  let ok=false;
  for(let spin=0;spin<4;spin++){if(same(points,variant))ok=true;variant=rotate(variant);}
  if(!ok)return false;
  for(const [dr,dc] of points){
    const r=row+dr,c=col+dc,key=r+","+c;
    if(r<0||c<0||r>=board.size||c>=board.size||covered.has(key))return false;
    covered.add(key);
  }
 }
 return covered.size===board.size*board.size;
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin");
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return response(405,{error:"Method not allowed"},origin);
 const bearer=req.headers.get("authorization")||"",token=bearer.replace(/^Bearer\s+/i,"");
 if(!token||token===bearer)return response(401,{error:"Sign in for verified rewards"},origin);
 const userResult=await admin.auth.getUser(token);
 const user=userResult.data.user;
 if(userResult.error||!user||user.is_anonymous)return response(401,{error:"Sign in for verified rewards"},origin);
 let body:any;
 try{const raw=await req.text();if(raw.length>18000)throw Error("Too large");body=JSON.parse(raw);}catch(_){return response(400,{error:"Invalid request"},origin);}
 if(!body||typeof body!=="object")return response(400,{error:"Invalid reward request"},origin);
 // Grass Snake: the server times each attempt and owns account best, XP milestones and idempotency.
 if(body.game_id==="grass-snake"){
   if(body.version!=="v1")return response(400,{error:"Unsupported Snake version"},origin);
   if(body.action==="start"){
     const cutoff=new Date(Date.now()-60000).toISOString();
     const {count,error:rateError}=await admin.from("reward_attempts")
       .select("id",{count:"exact",head:true}).eq("user_id",user.id)
       .eq("game_id","grass-snake").gte("created_at",cutoff);
     if(rateError)return response(503,{error:"Snake rewards temporarily unavailable"},origin);
     if((count||0)>=12)return response(429,{error:"Too many Snake attempts started"},origin);
     const {data:attempt,error:attemptError}=await admin.from("reward_attempts")
       .insert({user_id:user.id,game_id:"grass-snake",level_number:1,game_version:"v1"})
       .select("id,expires_at").single();
     if(attemptError||!attempt)return response(503,{error:"Unable to start Snake challenge"},origin);
     const {data:best,error:bestError}=await admin.from("snake_run_records")
       .select("best_seconds,completed_runs").eq("user_id",user.id).maybeSingle();
     if(bestError)return response(503,{error:"Unable to load Snake record"},origin);
     return response(200,{attempt_id:attempt.id,expires_at:attempt.expires_at,
       best_seconds:best?.best_seconds||0,completed_runs:best?.completed_runs||0},origin);
   }
   if(body.action==="checkpoint"||body.action==="complete"){
     if(typeof body.attempt_id!=="string"||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.attempt_id)||
        !Number.isInteger(body.seconds)||body.seconds<0||body.seconds>18000||
        !Number.isInteger(body.bugs)||body.bugs<0||body.bugs>576)
       return response(400,{error:"Invalid Snake run"},origin);
     const {data,error}=await admin.rpc("claim_snake_checkpoint",{
       p_user:user.id,p_attempt:body.attempt_id,p_seconds:body.seconds,p_bugs:body.bugs,
       p_final:body.action==="complete"});
     if(error)return response(409,{error:"Snake time check failed. Sign in and start a fresh run if the challenge expired."},origin);
     return response(200,{accepted:true,...data},origin);
   }
   return response(400,{error:"Unsupported Snake reward action"},origin);
 }
 // Catalog-driven game integration. Server owns XP rules; clients only request
 // level start/complete. These claims are bounded and NOT replay-verified scores.
 if(["fallen-grid","rink-putt","hockey-gear-rush"].includes(body.game_id)){
   const game=body.game_id,level=body.level;
   if(body.version!=="v1"||!Number.isInteger(level)||level<1||level>500)
     return response(400,{error:"Unsupported game level"},origin);
   const {data:rule,error:ruleError}=await admin.from("game_xp_rules")
     .select("max_level,enabled,reward_type,verification_tier,min_seconds")
     .eq("game_id",game).maybeSingle();
   if(ruleError||!rule||!rule.enabled||rule.reward_type!=="level"||
      rule.verification_tier!=="server_timed"||level>rule.max_level)
     return response(403,{error:"Rewards are not enabled for this level"},origin);
   if(body.action==="start"){
     const since=new Date(Date.now()-60000).toISOString();
     const {count,error:rateError}=await admin.from("reward_attempts")
       .select("id",{count:"exact",head:true}).eq("user_id",user.id).eq("game_id",game).gte("created_at",since);
     if(rateError)return response(503,{error:"Reward service temporarily unavailable"},origin);
     if((count||0)>=12)return response(429,{error:"Challenge limit reached. Try again shortly."},origin);
     const {data,error}=await admin.from("reward_attempts")
       .insert({user_id:user.id,game_id:game,level_number:level,game_version:"v1"})
       .select("id,expires_at").single();
     if(error||!data)return response(503,{error:"Could not start reward challenge"},origin);
     return response(200,{attempt_id:data.id,expires_at:data.expires_at},origin);
   }
   if(body.action==="complete"){
     if(typeof body.attempt_id!=="string"||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.attempt_id))
       return response(400,{error:"Missing challenge"},origin);
     const {data,error}=await admin.rpc("claim_catalog_level",{
       p_user:user.id,p_attempt:body.attempt_id,p_game:game,p_level:level
     });
     if(error)return response(409,{error:"Level reward could not be validated for this attempt"},origin);
     return response(200,{accepted:true,...data},origin);
   }
   return response(400,{error:"Unsupported reward action"},origin);
 }
 if(body.game_id==="cut-the-cheese"){
   const level=body.level;
   if(body.version!=="v1"||!Number.isInteger(level)||level<1||level>200)return response(400,{error:"Unsupported cheese level"},origin);
   if(body.action==="start"){
     const cutoff=new Date(Date.now()-60000).toISOString();
     const {count,error:rateError}=await admin.from("reward_attempts").select("id",{count:"exact",head:true})
       .eq("user_id",user.id).eq("game_id","cut-the-cheese").gte("created_at",cutoff);
     if(rateError)return response(503,{error:"Could not check challenge limit"},origin);
     if((count||0)>=15)return response(429,{error:"Too many challenge requests"},origin);
     // Pre-existing local players may resume at higher levels; duplicate claims
     // are blocked by the unique XP ledger key. Scores are NOT replay-verified.
     const {data:attempt,error:attemptError}=await admin.from("reward_attempts")
       .insert({user_id:user.id,game_id:"cut-the-cheese",level_number:level,game_version:"v1"})
       .select("id,expires_at").single();
     if(attemptError||!attempt)return response(503,{error:"Could not begin challenge"},origin);
     return response(200,{attempt_id:attempt.id,expires_at:attempt.expires_at},origin);
   }
   if(body.action==="complete"){
     if(typeof body.attempt_id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.attempt_id))
       return response(400,{error:"Missing challenge"},origin);
     // The client only supplies a completion report. It is time-gated and idempotent
     // but not replay-verified; never interpret it as a verified leaderboard score.
     const {data,error}=await admin.rpc("claim_cheese_level",{p_user:user.id,p_attempt:body.attempt_id,p_level:level});
     if(error)return response(409,{error:"Level XP unavailable; complete a fresh signed-in challenge"},origin);
     return response(200,{accepted:true,...data,verification:"server-timed-not-replay-verified"},origin);
   }
   return response(400,{error:"Unsupported cheese reward action"},origin);
 }
 if(body.game_id!=="acorn-ascent"||body.version!=="v2"||
    !Number.isInteger(body.level)||body.level<1||body.level>10)return response(400,{error:"Unsupported game or level"},origin);
 const level=body.level as number;
 if(body.action==="start"){
   const cutoff=new Date(Date.now()-60000).toISOString();
   const {count,error:countError}=await admin.from("reward_attempts").select("id",{count:"exact",head:true})
    .eq("user_id",user.id).eq("game_id","acorn-ascent").gte("created_at",cutoff);
   if(countError)return response(503,{error:"Unable to start challenge"},origin);
   if((count||0)>=20)return response(429,{error:"Too many challenge requests. Try again shortly."},origin);
   const {data,error}=await admin.from("reward_attempts")
    .insert({user_id:user.id,game_id:"acorn-ascent",level_number:level,game_version:"v2"})
    .select("id,expires_at").single();
   if(error||!data)return response(503,{error:"Unable to start challenge"},origin);
   return response(200,{attempt_id:data.id,expires_at:data.expires_at},origin);
 }
 if(body.action==="complete"){
  if(typeof body.attempt_id!=="string"||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.attempt_id))
    return response(400,{error:"Missing challenge"},origin);
  if(!validateProof(level,body.placements))return response(422,{error:"Invalid puzzle proof; no XP awarded"},origin);
  const {data,error}=await admin.rpc("claim_verified_level",{p_user:user.id,p_attempt:body.attempt_id,p_game:"acorn-ascent",p_level:level});
  if(error)return response(409,{error:"Reward unavailable; replay the level for another verified attempt"},origin);
  return response(200,{accepted:true,...data},origin);
 }
 return response(400,{error:"Unsupported reward action"},origin);
});
