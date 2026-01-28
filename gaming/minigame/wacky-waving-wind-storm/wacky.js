(() => {
  const TAU = Math.PI * 2;
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  let W = canvas.width,
    H = canvas.height;

  const ui = {
    angleEl: document.getElementById("angle"),
    speedEl: document.getElementById("speed"),
    angOut: document.getElementById("ang"),
    powBar: document.getElementById("pow"),
    gustBtn: document.getElementById("gustBtn"),
    resetBtn: document.getElementById("resetBtn"),
    nextBtn: document.getElementById("nextBtn"),
    assistEl: document.getElementById("assist"),
    score: document.getElementById("scorePct"),
    toast: document.getElementById("toast"),
  };

  const state = {
    angle: (-20 * Math.PI) / 180,
    power: 0.75,
    gustT: 0,
    assist: true,
  };

  ui.angleEl.addEventListener("input", () => {
    state.angle = (parseFloat(ui.angleEl.value) * Math.PI) / 180;
    ui.angOut.textContent = `${Math.round(parseFloat(ui.angleEl.value))}°`;
  });
  ui.speedEl.addEventListener("input", () => {
    state.power = parseFloat(ui.speedEl.value);
    ui.powBar.style.width = `${Math.min(
      100,
      Math.round((state.power / 1.2) * 100)
    )}%`;
  });
  ui.assistEl.addEventListener(
    "change",
    (e) => (state.assist = e.target.checked)
  );
  ui.gustBtn.addEventListener("click", () => {
    state.gustT = 0.35;
    toast("GUST!");
  });
  ui.resetBtn.addEventListener("click", resetPose);
  ui.nextBtn.addEventListener("click", nextPose);
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      state.gustT = 0.35;
      toast("GUST!");
    }
  });

  function toast(t) {
    ui.toast.textContent = t;
    ui.toast.style.display = "block";
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (ui.toast.style.display = "none"), 900);
  }

  // --- Ragdoll (central spine + 2-seg arms) ---
  class P {
    constructor(x, y, pin = false) {
      this.x = x;
      this.y = y;
      this.ox = x;
      this.oy = y;
      this.pin = pin;
    }
  }
  class S {
    constructor(a, b, len, st = 1) {
      this.a = a;
      this.b = b;
      this.len = len;
      this.st = st;
    }
  }
  const pts = [],
    sticks = [];
  function add(x, y, p = false) {
    const pnt = new P(x, y, p);
    pts.push(pnt);
    return pnt;
  }
  function link(a, b, st = 1) {
    const dx = b.x - a.x,
      dy = b.y - a.y;
    sticks.push(new S(a, b, Math.hypot(dx, dy), st));
  }

  const pump = { x: W * 0.24, y: H * 0.86 };
  const SEG = 12;
  const SPINE_LEN = H * 0.35;
  const segLen = SPINE_LEN / SEG;

  let base,
    spine = [],
    head,
    neck,
    lShoulder,
    rShoulder,
    lElbow,
    rElbow,
    lHand,
    rHand;

  function build() {
    pts.length = 0;
    sticks.length = 0;
    base = add(pump.x, pump.y, true);
    spine = [base];
    for (let i = 1; i <= SEG; i++) {
      spine.push(add(base.x, base.y - segLen * i));
      link(spine[i - 1], spine[i], 0.55);
    }
    neck = spine[spine.length - 2];
    head = spine[spine.length - 1];
    // shoulders near top third
    const sIdx = Math.max(2, Math.floor(SEG * 0.7));
    lShoulder = spine[sIdx];
    rShoulder = spine[sIdx];
    lElbow = add(lShoulder.x - segLen * 1.0, lShoulder.y + segLen * 0.5);
    rElbow = add(rShoulder.x + segLen * 1.0, rShoulder.y + segLen * 0.5);
    lHand = add(lElbow.x - segLen * 0.9, lElbow.y + segLen * 0.2);
    rHand = add(rElbow.x + segLen * 0.9, rElbow.y + segLen * 0.2);
    link(lShoulder, lElbow, 0.8);
    link(lElbow, lHand, 0.8);
    link(rShoulder, rElbow, 0.8);
    link(rElbow, rHand, 0.8);
  }
  build();

  // --- Outline poses (joint-based) ---
  // Each pose defines target joint positions normalized (0..1) across the canvas.
  // We draw a thick "chalk" figure from these joints.
  const poses = [
    {
      spine: [
        { x: 0.24, y: 0.86 },
        { x: 0.28, y: 0.78 },
        { x: 0.34, y: 0.7 },
        { x: 0.42, y: 0.63 },
        { x: 0.5, y: 0.55 },
        { x: 0.58, y: 0.49 },
        { x: 0.64, y: 0.42 },
      ],
      lArm: [
        { x: 0.42, y: 0.63 },
        { x: 0.36, y: 0.5 },
        { x: 0.32, y: 0.44 },
      ],
      rArm: [
        { x: 0.42, y: 0.63 },
        { x: 0.58, y: 0.54 },
        { x: 0.68, y: 0.5 },
      ],
    },
    {
      spine: [
        { x: 0.24, y: 0.86 },
        { x: 0.27, y: 0.78 },
        { x: 0.33, y: 0.7 },
        { x: 0.42, y: 0.64 },
        { x: 0.52, y: 0.6 },
        { x: 0.62, y: 0.56 },
        { x: 0.7, y: 0.5 },
      ],
      lArm: [
        { x: 0.42, y: 0.64 },
        { x: 0.35, y: 0.58 },
        { x: 0.3, y: 0.52 },
      ],
      rArm: [
        { x: 0.42, y: 0.64 },
        { x: 0.5, y: 0.48 },
        { x: 0.56, y: 0.4 },
      ],
    },
    {
      spine: [
        { x: 0.24, y: 0.86 },
        { x: 0.26, y: 0.78 },
        { x: 0.3, y: 0.7 },
        { x: 0.36, y: 0.61 },
        { x: 0.44, y: 0.54 },
        { x: 0.54, y: 0.49 },
        { x: 0.64, y: 0.46 },
      ],
      lArm: [
        { x: 0.36, y: 0.61 },
        { x: 0.3, y: 0.44 },
        { x: 0.26, y: 0.36 },
      ],
      rArm: [
        { x: 0.36, y: 0.61 },
        { x: 0.48, y: 0.52 },
        { x: 0.6, y: 0.5 },
      ],
    },
  ];
  let poseIndex = 0;
  function posePx(p) {
    return p.map((q) => ({ x: q.x * W, y: q.y * H }));
  }
  function currentPose() {
    const P = poses[poseIndex];
    return {
      spine: posePx(P.spine),
      lArm: posePx(P.lArm),
      rArm: posePx(P.rArm),
    };
  }
  function nextPose() {
    poseIndex = (poseIndex + 1) % poses.length;
    hold = 0;
  }

  // physics
  function step(dt) {
    const GRAV = 680,
      DAMP = 0.996,
      AIR = 0.18;
    const wind = state.power * 4200 + (state.gustT > 0 ? 2400 : 0);
    state.gustT = Math.max(0, state.gustT - dt);
    const wx = Math.cos(state.angle) * wind,
      wy = Math.sin(state.angle) * wind;

    for (const p of pts) {
      if (p.pin) continue;
      let vx = (p.x - p.ox) * DAMP;
      let vy = (p.y - p.oy) * DAMP;
      vx += wx * AIR * dt;
      vy += (wy * AIR + GRAV) * dt;
      p.ox = p.x;
      p.oy = p.y;
      p.x += vx * dt;
      p.y += vy * dt;
    }

    // constraints
    for (let it = 0; it < 14; it++) {
      for (const s of sticks) {
        const ax = s.a.x,
          ay = s.a.y,
          bx = s.b.x,
          by = s.b.y;
        let dx = bx - ax,
          dy = by - ay,
          dist = Math.hypot(dx, dy) || 0.0001;
        const diff = (dist - s.len) / dist,
          inv = 0.5 * s.st,
          offx = dx * diff * inv,
          offy = dy * diff * inv;
        if (!s.a.pin) {
          s.a.x += offx;
          s.a.y += offy;
        }
        if (!s.b.pin) {
          s.b.x -= offx;
          s.b.y -= offy;
        }
      }
      for (const p of pts) {
        if (p.pin) continue;
        if (p.x < 10) p.x = 10;
        else if (p.x > W - 10) p.x = W - 10;
        if (p.y < 10) p.y = 10;
        else if (p.y > H - 10) p.y = H - 10;
      }
    }

    // optional magnet: pull select joints toward the target curves when close
    if (state.assist) {
      const pose = currentPose();
      const pullers = [
        head,
        neck,
        spine[Math.floor(SEG * 0.6)],
        spine[Math.floor(SEG * 0.3)],
        lElbow,
        rElbow,
        lHand,
        rHand,
      ];
      for (const p of pullers) {
        const target = nearestOnPose(p.x, p.y, pose);
        const dx = target.x - p.x,
          dy = target.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 90) {
          p.x += dx * 0.06;
          p.y += dy * 0.06;
        }
      }
    }
  }

  function nearestOnPolyline(x, y, poly) {
    let best = Infinity,
      bx = poly[0].x,
      by = poly[0].y;
    for (let i = 1; i < poly.length; i++) {
      const ax = poly[i - 1].x,
        ay = poly[i - 1].y,
        bx2 = poly[i].x,
        by2 = poly[i].y;
      // project point onto segment
      const vx = bx2 - ax,
        vy = by2 - ay;
      const t = Math.max(
        0,
        Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1))
      );
      const px = ax + t * vx,
        py = ay + t * vy;
      const d = (x - px) ** 2 + (y - py) ** 2;
      if (d < best) {
        best = d;
        bx = px;
        by = py;
      }
    }
    return { x: bx, y: by, d: Math.sqrt(best) };
  }
  function nearestOnPose(x, y, pose) {
    const a = nearestOnPolyline(x, y, pose.spine);
    const b = nearestOnPolyline(x, y, pose.lArm);
    const c = nearestOnPolyline(x, y, pose.rArm);
    return a.d < b.d && a.d < c.d ? a : b.d < c.d ? b : c;
  }

  // scoring: compare key joints to nearest on corresponding limb curves
  let hold = 0;
  const CLEAR = 0.9,
    HOLD_FRAMES = 20;
  function score() {
    const pose = currentPose();
    const keys = [
      { p: head, line: pose.spine, w: 1.2 },
      { p: neck, line: pose.spine, w: 1.1 },
      { p: spine[Math.floor(SEG * 0.6)], line: pose.spine, w: 1.0 },
      { p: spine[Math.floor(SEG * 0.3)], line: pose.spine, w: 1.0 },
      { p: lElbow, line: pose.lArm, w: 1.0 },
      { p: lHand, line: pose.lArm, w: 1.0 },
      { p: rElbow, line: pose.rArm, w: 1.0 },
      { p: rHand, line: pose.rArm, w: 1.0 },
    ];
    const ideal = 26; // px
    let wsum = 0,
      acc = 0;
    for (const k of keys) {
      const n = nearestOnPolyline(k.p.x, k.p.y, k.line);
      const s = Math.max(0, 1 - n.d / (ideal * 2.2));
      acc += s * k.w;
      wsum += k.w;
    }
    return acc / wsum;
  }

  // drawing
  function draw() {
    ctx.clearRect(0, 0, W, H);
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#e8f7ff");
    g.addColorStop(0.55, "#e8f7ff");
    g.addColorStop(0.56, "#c9ebff");
    g.addColorStop(1, "#bbdefb");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // pump
    ctx.save();
    ctx.translate(pump.x, pump.y);
    ctx.rotate(state.angle);
    ctx.fillStyle = "#0b2a3f";
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 30, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#1e4770";
    ctx.fillRect(30, -12, 50, 24);
    ctx.fillStyle = "rgba(11,42,63,.9)";
    ctx.beginPath();
    ctx.moveTo(70, 0);
    ctx.lineTo(110, -10);
    ctx.lineTo(110, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // wind streaks
    const dirx = Math.cos(state.angle),
      diry = Math.sin(state.angle);
    for (let i = 0; i < 16; i++) {
      const t = (performance.now() / 1000 + i * 0.2) % 1;
      const px = pump.x + dirx * (40 + t * W * 0.8);
      const py = pump.y + diry * (40 + t * H * 0.8);
      ctx.globalAlpha = 0.1 * (1 - t);
      ctx.lineWidth = 6 + 6 * (1 - t);
      ctx.strokeStyle = "#0b2a3f";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(px - dirx * 60, py - diry * 60);
      ctx.lineTo(px + dirx * 80, py + diry * 80);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // chalk outline for current pose
    const pose = currentPose();
    function drawChalk(poly, width) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = width + 36;
      stroke(poly);
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = width;
      stroke(poly);
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = "rgba(11,42,63,.25)";
      ctx.lineWidth = 2;
      stroke(poly);
      ctx.restore();
    }
    drawChalk(pose.spine, 18);
    drawChalk(pose.lArm, 16);
    drawChalk(pose.rArm, 16);

    // wacky tube
    ctx.strokeStyle = "#0b83ff";
    ctx.lineWidth = 44;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(spine[0].x, spine[0].y);
    for (let i = 1; i < spine.length; i++) ctx.lineTo(spine[i].x, spine[i].y);
    ctx.stroke();
    // arms
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(lShoulder.x, lShoulder.y);
    ctx.lineTo(lElbow.x, lElbow.y);
    ctx.lineTo(lHand.x, lHand.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rShoulder.x, rShoulder.y);
    ctx.lineTo(rElbow.x, rElbow.y);
    ctx.lineTo(rHand.x, rHand.y);
    ctx.stroke();

    // head
    ctx.save();
    ctx.translate(head.x, head.y);
    const neckPt = spine[spine.length - 2];
    ctx.rotate(Math.atan2(head.y - neckPt.y, head.x - neckPt.x));
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#0b2a3f";
    ctx.beginPath();
    ctx.arc(-5, -2, 2.8, 0, TAU);
    ctx.arc(5, -2, 2.8, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0b2a3f";
    ctx.beginPath();
    ctx.arc(0, 4, 6, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    const s = score();
    ui.score.textContent = `${Math.round(s * 100)}%`;
    if (s > 0.9) {
      hold++;
      if (hold === 22) {
        toast("Level Clear!");
        setTimeout(nextPose, 800);
      }
    } else {
      hold = Math.max(0, hold - 1);
    }
  }

  function stroke(poly) {
    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
    ctx.stroke();
  }

  // loop
  let last = performance.now();
  function loop(t) {
    const dt = Math.min(1 / 30, (t - last) / 1000);
    last = t;
    step(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function resetPose() {
    build();
    hold = 0;
  }
})();
