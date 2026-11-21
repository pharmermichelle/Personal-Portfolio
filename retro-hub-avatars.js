/* Shared original avatar artwork used by the Retro Games Hub header. */
window.RetroHubAvatars = (() => {
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

  function avatarSVG(a, size, equippedShirt = false, equippedHat = false) {
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
      + (equippedHat?'<g stroke-linejoin="round"><path d="M43 28L90 -16L137 28Q90 43 43 28Z" fill="#ffdf55" stroke="#6b3b22" stroke-width="5"/><path d="M43 28Q90 43 137 28L137 39Q90 54 43 39Z" fill="#e9a73f" stroke="#6b3b22" stroke-width="4"/><circle cx="90" cy="10" r="9" fill="#d8902f"/><circle cx="71" cy="24" r="6" fill="#d8902f"/><circle cx="110" cy="26" r="5" fill="#d8902f"/></g>':'')
      + (!small?'<path d="M18 19l4-8 4 8 9 3-9 3-4 8-4-8-9-3ZM147 119l3-7 3 7 7 3-7 3-3 7-3-7-7-3Z" fill="#fff07b"/>':"")
      + '</svg>';
  }

return {render(key,options={}){const a=avatars.find(v=>v.key===key);return a?avatarSVG(a,"small",Boolean(options.equippedShirt),Boolean(options.equippedHat)):"🎮";}};
})();
