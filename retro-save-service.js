/* Retro Games Hub save pilot. Progress only: not evidence for XP or leaderboards. */
(function (global) {
  "use strict";
  const MAX_BYTES = 65536;
  const get = key => { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (_) { return null; } };
  const put = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch (_) { return false; } };
  const del = key => { try { localStorage.removeItem(key); } catch (_) {} };
  const uuid = () => global.crypto && global.crypto.randomUUID ? global.crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36);
  function dialogStyles() {
    if (document.getElementById("retro-save-dialog-style")) return;
    const el=document.createElement("style"); el.id="retro-save-dialog-style";
    el.textContent=".retro-save-overlay{position:fixed;inset:0;z-index:2147483645;display:grid;place-items:center;background:#061019e0;padding:16px;overflow:auto}.retro-save-panel{max-width:520px;width:100%;background:#122b42;color:#f8ffff;border:2px solid #bce4e7;border-radius:15px;padding:21px;font:16px/1.5 system-ui,Arial,sans-serif;box-shadow:0 15px 70px #000b}.retro-save-panel h2{font-size:24px;margin:0 0 12px}.retro-save-panel p{font-size:16px;margin:0 0 16px}.retro-save-buttons{display:grid;gap:10px}.retro-save-buttons button{color:#fff;background:#184364;border:2px solid #89dbed;border-radius:10px;font:700 16px system-ui,Arial,sans-serif;padding:12px;min-height:48px;white-space:normal}.retro-save-buttons button:first-child{background:#f4d875;color:#112139;border-color:#fff4b9}.retro-save-buttons button:focus-visible{outline:4px solid #fff;outline-offset:3px}";
    document.head.append(el);
  }
  class SaveService {
    constructor(adapter,opts) {
      this.adapter=adapter; this.gameId=adapter.gameId;
      this.guestKey="retro:guest:"+this.gameId+":v1";
      this.status=document.getElementById(opts.statusId);
      this.options=document.getElementById(opts.optionsId);
      this.client=null;this.user=null;this.current=null;this.pending=null;this.cloud=null;
      this.revision=null;this.mode="guest";this.epoch=0;this.busy=false;this.timer=null;
      this.initializing=true;this.closeDialog=null;
      this.setStatus("Checking saved progress…");
    }
    setStatus(text) { if(this.status)this.status.textContent=text; }
    modeTo(mode) { this.mode=mode;if(this.options)this.options.hidden=!this.user; }
    key(type,user) { return "retro:account:"+(user||this.user.id)+":"+this.gameId+":"+type+":v1"; }
    validate(value) {
      const state=this.adapter.validateSave(value);
      if(JSON.stringify(state).length>MAX_BYTES)throw Error("Save too large");
      return state;
    }
    wrap(value,origin) {
      return {schemaVersion:this.adapter.schemaVersion,gameVersion:this.adapter.gameVersion,clientSaveId:uuid(),deviceUpdatedAt:new Date().toISOString(),origin:origin||"autosave",payload:this.validate(value)};
    }
    unwrap(envelope) {
      if(!envelope||typeof envelope!=="object"||envelope.schemaVersion!==this.adapter.schemaVersion||!envelope.payload)throw Error("Unsupported save format");
      return this.validate(envelope.payload);
    }
    guest() {
      const v=get(this.guestKey);
      if(v) {try{return this.unwrap(v);}catch(_){this.setStatus("Device save could not be read");}}
      try {const legacy=this.adapter.readLegacyLocal();return legacy?this.validate(legacy):null;}catch(_){return null;}
    }
    backup(name,value) {
      if(value==null)return;
      const key="retro:backup:"+this.gameId+":"+name;
      const history=get(key)||[];
      history.push({at:new Date().toISOString(),value});
      put(key,history.slice(-6));
    }
    async prompt(title,description,choices) {
      dialogStyles();
      if(this.closeDialog)this.closeDialog();
      const overlay=document.createElement("div");overlay.className="retro-save-overlay";
      const panel=document.createElement("div");panel.className="retro-save-panel";
      panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");
      panel.setAttribute("aria-label",title);
      const heading=document.createElement("h2");heading.textContent=title;
      const explanation=document.createElement("p");explanation.textContent=description;
      const list=document.createElement("div");list.className="retro-save-buttons";
      panel.append(heading,explanation,list);overlay.append(panel);document.body.append(overlay);
      return new Promise(resolve=>{
        let done=false;
        const finish=value=>{if(done)return;done=true;overlay.remove();if(this.closeDialog===cancel)this.closeDialog=null;resolve(value);};
        const cancel=()=>finish("later");this.closeDialog=cancel;
        for(const entry of choices) {
          const button=document.createElement("button");button.type="button";button.textContent=entry.text;
          button.addEventListener("click",()=>finish(entry.value));list.append(button);
        }
        list.firstElementChild.focus();
      });
    }
    async initialize() {
      this.client=global.retroArcadeSupabaseClient||null;
      if(this.options)this.options.addEventListener("click",()=>{void this.openSyncOptions();});
      if(!this.client){this.initializing=false;return this.activate(null);}
      this.client.auth.onAuthStateChange((_event,session)=>{
        if(this.initializing)return;
        const user=session&&session.user||null;
        if((user&&user.id)!==(this.user&&this.user.id)) {
          setTimeout(()=>{void this.activate(user).then(state=>this.adapter.restoreState(state||this.adapter.emptyState()));},0);
        }
      });
      let user=null;
      try {const r=await this.client.auth.getSession();user=r.data&&r.data.session&&r.data.session.user||null;}catch(_){}
      this.initializing=false;
      let state=await this.activate(user);
      try {
        const r=await this.client.auth.getSession();const actual=r.data&&r.data.session&&r.data.session.user||null;
        if((actual&&actual.id)!==(this.user&&this.user.id))state=await this.activate(actual);
      }catch(_){}
      global.addEventListener("online",()=>{if(this.mode==="account")void this.flush();});
      document.addEventListener("visibilitychange",()=>{if(!document.hidden&&this.mode==="account")void this.flush();});
      return state;
    }
    async fetchCloud(user) {
      const r=await this.client.from("game_saves").select("save_data,revision,updated_at").eq("user_id",user.id).eq("game_id",this.gameId).maybeSingle();
      if(r.error)throw r.error;
      return r.data ? {envelope:r.data.save_data,state:this.unwrap(r.data.save_data),revision:Number(r.data.revision),updatedAt:r.data.updated_at} : null;
    }
    async activate(user) {
      const epoch=++this.epoch;
      clearTimeout(this.timer);this.timer=null;
      if(this.closeDialog)this.closeDialog();
      this.user=user;this.current=null;this.pending=null;this.cloud=null;this.revision=null;
      const guest=this.guest();
      if(!user) {
        this.modeTo("guest");this.current=guest;this.setStatus("Guest • saved on this device only");return guest;
      }
      this.modeTo("loading");this.setStatus("Loading account save…");
      let cloud=null;
      try {cloud=await this.fetchCloud(user);}catch(_){
        if(epoch!==this.epoch)return null;
        const pending=get(this.key("pending"));
        if(pending&&pending.envelope){
          try {
            const state=this.unwrap(pending.envelope);this.pending=pending;this.revision=pending.baseRevision;this.current=state;
            this.modeTo("account");this.setStatus("Device backup • waiting for cloud");return state;
          }catch(_){}
        }
        this.modeTo("deferred");this.current=guest;
        this.setStatus("Cloud unavailable • device-only save");return guest;
      }
      if(epoch!==this.epoch)return null;
      this.cloud=cloud;this.revision=cloud?cloud.revision:null;
      const pending=get(this.key("pending"));
      if(pending&&pending.envelope) {
        try {
          const state=this.unwrap(pending.envelope);
          this.current=state;this.pending=pending;
          if((cloud?cloud.revision:null)!==pending.baseRevision)return await this.resolve(state,cloud,"An unsynced device save differs from the account save.");
          this.modeTo("account");this.setStatus("Device backup • syncing…");void this.flush();return state;
        }catch(_){this.backup("invalid-pending",pending);this.pending=null;}
      }
      if(cloud) {
        const seen=get(this.key("guest-choice"));
        const differs=guest&&this.adapter.meaningful(guest)&&JSON.stringify(guest)!==(seen&&seen.guestSnapshot)&&JSON.stringify(guest)!==JSON.stringify(cloud.state);
        if(differs)return await this.resolve(guest,cloud,"Choose which progress to use. Neither copy will be deleted.");
        this.current=cloud.state;this.modeTo("account");this.setStatus("Saved to account");
        put(this.key("cache"),cloud.envelope);return cloud.state;
      }
      if(guest&&this.adapter.meaningful(guest))return await this.resolve(guest,null,"Bring your existing device progress to your account?");
      this.modeTo("account");this.setStatus("Account save ready");return null;
    }
    async resolve(device,cloud,description) {
      const epoch=this.epoch;
      this.backup("device",device);if(cloud)this.backup("account",cloud.envelope);
      this.modeTo("conflict");this.setStatus("Choose your save • not synced yet");
      const choice=await this.prompt("Choose Acorn Ascent progress",description+" Device: "+this.adapter.summarizeSave(device)+". Account: "+(cloud?this.adapter.summarizeSave(cloud.state):"no progress yet")+".",[
        {text:cloud?"Use account save":"Start fresh in account",value:"account"},
        {text:cloud?"Use device save (replace account)":"Import device save to account",value:"device"},
        {text:"Not now — device only",value:"later"}
      ]);
      if(epoch!==this.epoch)return null;
      if(choice==="account") {
        this.pending=null;del(this.key("pending"));this.revision=cloud?cloud.revision:null;
        this.current=cloud?cloud.state:this.adapter.emptyState();
        put(this.key("guest-choice"),{guestSnapshot:JSON.stringify(this.guest())});
        if(cloud)put(this.key("cache"),cloud.envelope);
        this.modeTo("account");this.setStatus(cloud?"Saved to account":"Account save ready");
        this.adapter.restoreState(this.current);return this.current;
      }
      if(choice==="device") {
        this.pending=null;del(this.key("pending"));
        this.revision=cloud?cloud.revision:null;this.current=device;
        put(this.key("guest-choice"),{guestSnapshot:JSON.stringify(this.guest())});
        this.modeTo("account");this.save(device,"imported-local");this.adapter.restoreState(device);return device;
      }
      this.current=device;this.modeTo("deferred");this.setStatus("Device only • not synced to account");
      this.adapter.restoreState(device);return device;
    }
    save(value,origin) {
      let state;
      try{state=this.validate(value);}catch(_){this.setStatus("Save invalid • not synced");return;}
      this.current=state;
      if(this.mode==="guest"||this.mode==="deferred"||!this.user) {
        this.setStatus(put(this.guestKey,this.wrap(state,origin))?"Device save only":"Device storage unavailable");
        return;
      }
      if(this.mode==="loading")return;
      const baseRevision=this.pending?this.pending.baseRevision:this.revision;
      this.pending={envelope:this.wrap(state,origin),baseRevision};
      if(!put(this.key("pending"),this.pending)){this.setStatus("Device storage unavailable • do not close this tab");return;}
      this.setStatus(this.mode==="conflict"?"Save conflict • choose a version":"Device backup • awaiting cloud");
      if(this.mode==="account"){clearTimeout(this.timer);this.timer=setTimeout(()=>{void this.flush();},650);}
    }
    async flush() {
      if(this.busy||this.mode!=="account"||!this.user||!this.pending||!this.client)return;
      const epoch=this.epoch,user=this.user,pending=this.pending;
      this.busy=true;
      try {
        const query=pending.baseRevision===null
          ? this.client.from("game_saves").insert({user_id:user.id,game_id:this.gameId,save_data:pending.envelope,revision:1}).select("revision").single()
          : this.client.from("game_saves").update({save_data:pending.envelope,revision:pending.baseRevision+1}).eq("user_id",user.id).eq("game_id",this.gameId).eq("revision",pending.baseRevision).select("revision").maybeSingle();
        const result=await query;
        if(epoch!==this.epoch)return;
        if(result.error) {
          if(result.error.code==="23505")return await this.refreshConflict(pending);
          throw result.error;
        }
        if(!result.data)return await this.refreshConflict(pending);
        this.revision=Number(result.data.revision);
        put(this.key("cache"),pending.envelope);
        if(this.pending&&this.pending.envelope.clientSaveId===pending.envelope.clientSaveId){
          this.pending=null;del(this.key("pending"));this.setStatus("Saved to account");
        } else if(this.pending){
          this.pending.baseRevision=this.revision;put(this.key("pending"),this.pending);
        }
      }catch(_){if(epoch===this.epoch)this.setStatus("Saved on device • cloud retry pending");}
      finally{
        this.busy=false;
        if(epoch===this.epoch&&this.pending&&this.mode==="account"){
          clearTimeout(this.timer);this.timer=setTimeout(()=>{void this.flush();},4000);
        }
      }
    }
    async refreshConflict(pending) {
      try {
        const cloud=await this.fetchCloud(this.user);
        if(!cloud)throw Error("No cloud row");
        this.cloud=cloud;this.revision=cloud.revision;
        await this.resolve(this.unwrap(pending.envelope),cloud,"Another device updated this game. Select which save to keep.");
      }catch(_){this.modeTo("conflict");this.setStatus("Save conflict • open Sync Options");}
    }
    async openSyncOptions() {
      if(!this.user)return;
      if(this.mode==="conflict") {
        const cloud=await this.fetchCloud(this.user).catch(()=>null);
        await this.resolve(this.current||this.adapter.emptyState(),cloud,"Resolve the device/account save difference.");
      }else if(this.mode==="deferred"){
        const state=await this.activate(this.user);
        this.adapter.restoreState(state||this.adapter.emptyState());
      }else if(this.mode==="account"){
        if(this.pending)void this.flush();else this.setStatus("Saved to account");
      }
    }
  }
  global.RetroSaveService={create:(adapter,opts)=>new SaveService(adapter,opts)};
})(window);
