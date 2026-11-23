/* Original, shared Hockey Gear Rush cosmetics. Presentation only:
 * ownership and unlocks always come from Supabase inventory, never from this list. */
(function(root){
"use strict";
const ITEMS=[
  {
    "id": "gear-rush-l01",
    "level": 1,
    "title": "Rookie Rink Cap",
    "kind": "hat",
    "color": "#f24566"
  },
  {
    "id": "gear-rush-l02",
    "level": 2,
    "title": "Locker Room Tee",
    "kind": "shirt",
    "color": "#e83750"
  },
  {
    "id": "gear-rush-l03",
    "level": 3,
    "title": "Tape Stripe Shorts",
    "kind": "pants",
    "color": "#d93255"
  },
  {
    "id": "gear-rush-l04",
    "level": 4,
    "title": "Faceoff Star Frame",
    "kind": "frame",
    "color": "#efb65d"
  },
  {
    "id": "gear-rush-l05",
    "level": 5,
    "title": "Captain's Hockey Helmet",
    "kind": "hat",
    "color": "#e5e8ef"
  },
  {
    "id": "gear-rush-l06",
    "level": 6,
    "title": "Home Ice Jersey",
    "kind": "shirt",
    "color": "#dc2248"
  },
  {
    "id": "gear-rush-l07",
    "level": 7,
    "title": "Skater Warmup Pants",
    "kind": "pants",
    "color": "#9e183d"
  },
  {
    "id": "gear-rush-l08",
    "level": 8,
    "title": "Goal Light Frame",
    "kind": "frame",
    "color": "#ff7e95"
  },
  {
    "id": "gear-rush-l09",
    "level": 9,
    "title": "Away Game Beanie",
    "kind": "hat",
    "color": "#8db3ff"
  },
  {
    "id": "gear-rush-l10",
    "level": 10,
    "title": "Frozen Rink Hoodie",
    "kind": "shirt",
    "color": "#61cddc"
  },
  {
    "id": "gear-rush-l11",
    "level": 11,
    "title": "Power Play Joggers",
    "kind": "pants",
    "color": "#5276bb"
  },
  {
    "id": "gear-rush-l12",
    "level": 12,
    "title": "Overtime Spark Frame",
    "kind": "frame",
    "color": "#a883ff"
  },
  {
    "id": "gear-rush-l13",
    "level": 13,
    "title": "All-Star Visor",
    "kind": "hat",
    "color": "#ffe98f"
  },
  {
    "id": "gear-rush-l14",
    "level": 14,
    "title": "Championship Sweater",
    "kind": "shirt",
    "color": "#ffd86f"
  },
  {
    "id": "gear-rush-l15",
    "level": 15,
    "title": "Final Buzzer Pants",
    "kind": "pants",
    "color": "#ffb274"
  }
];

const milestoneLevels=new Set([5,10,15]);
for(const item of ITEMS){
 item.category="game";
 item.active=milestoneLevels.has(item.level);
}
const LEVEL_PALETTE=["#56d3da","#a989ed","#ffac6d","#ff89b6","#a4d97c","#82aff3","#e8c977"];
for(let level=2;level<=50;level++){
 ITEMS.push({
   id:"level-shirt-"+String(level).padStart(2,"0"),
   title:"Level "+level+" Arcade Shirt",level,kind:"shirt",
   category:"level",active:true,
   color:LEVEL_PALETTE[(level-2)%LEVEL_PALETTE.length]
 });
}
ITEMS.push({
 id:"event-thanksgiving-2026-frame",title:"Thanksgiving 2026 Frame",level:0,
 kind:"frame",category:"event",active:true,color:"#e6a04f"
},{
 id:"event-thanksgiving-2026-hat",title:"Thanksgiving Turkey Hat",level:0,
 kind:"hat",category:"event",active:true,color:"#c77f42"
});
const byId=new Map(ITEMS.map(item=>[item.id,item]));
const esc=v=>String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
function artwork(id){
 const item=byId.get(id);if(!item)return "";
 const c=esc(item.color),dark="#2e1b3a",white="#fff9f2";
 if(item.id==="event-thanksgiving-2026-hat"){
   return '<g stroke="'+dark+'" stroke-width="4" stroke-linejoin="round">'
    +'<ellipse cx="90" cy="38" rx="53" ry="21" fill="#a96937"/>'
    +'<path d="M55 40Q34 3 60 1L76 20Q73 -9 92 0L101 22Q121 -9 133 4L120 29Q152 6 154 33L123 49Z" fill="#e2a343"/>'
    +'<circle cx="90" cy="24" r="22" fill="#bc713d"/>'
    +'<circle cx="82" cy="21" r="3" fill="'+dark+'"/><circle cx="99" cy="21" r="3" fill="'+dark+'"/>'
    +'<path d="M91 27l-9 7h18Z" fill="#f2c864"/>'
    +'</g>';
 }
 switch(item.kind){
  case "hat":
   return '<g><path d="M39 36Q90 -12 141 36L138 47Q91 60 42 46Z" fill="'+c+'" stroke="'+dark+'" stroke-width="5"/><path d="M46 39Q90 26 135 39L152 49Q91 67 29 49Z" fill="'+c+'" stroke="'+dark+'" stroke-width="4"/><path d="M62 26Q89 15 118 26" stroke="'+white+'" fill="none" stroke-width="5"/><text x="90" y="39" font-size="15" text-anchor="middle" fill="'+dark+'" font-weight="900">'+item.level+'</text></g>';
  case "shirt":
   return '<g><path d="M62 115L75 109H104L119 115L130 151L119 184H62L50 151Z" fill="'+c+'" stroke="'+dark+'" stroke-width="5"/><path d="M64 120h52M72 137h37M72 160h37" stroke="'+white+'" stroke-width="5" opacity=".78"/><path d="M77 109Q90 125 103 109" stroke="'+dark+'" stroke-width="4" fill="none"/><text x="90" y="157" font-size="20" text-anchor="middle" fill="'+dark+'" font-weight="900">'+item.level+'</text></g>';
  case "pants":
   return '<g><path d="M62 180L89 180L89 209L60 209Z M92 180L120 180L122 209L92 209Z" fill="'+c+'" stroke="'+dark+'" stroke-width="4"/><path d="M70 186h13M99 186h13" stroke="'+white+'" stroke-width="4"/><path d="M76 189v17M106 189v17" stroke="'+dark+'" stroke-width="3"/></g>';
  case "frame":
   return '<g fill="none" stroke="'+c+'" stroke-width="6" stroke-linecap="round"><path d="M14 63V17H59M121 17h45v46M14 173v46h45M121 219h45v-46"/><circle cx="28" cy="28" r="5" fill="'+white+'"/><circle cx="152" cy="28" r="5" fill="'+white+'"/><circle cx="28" cy="205" r="5" fill="'+white+'"/><circle cx="152" cy="205" r="5" fill="'+white+'"/></g>';
 }
 return "";
}
function inject(svg,ids){
 if(typeof svg!=="string"||!svg.includes("</svg>"))return svg;
 const layers=["pants","shirt","hat","frame"].map(kind=>ids?.[kind]).filter(Boolean).map(artwork).join("");
 return svg.replace("</svg>",layers+"</svg>");
}
root.RetroGearWearables=Object.freeze({
 items:Object.freeze(ITEMS.map(item=>Object.freeze(item))),get:id=>byId.get(id)||null,artwork,inject
});
})(window);
