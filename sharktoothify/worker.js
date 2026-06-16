/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SharkToothify AI Backend — Cloudflare Worker
 * ═══════════════════════════════════════════════════════════════════════════
 *  Holds YOUR Anthropic API key server-side and meters paid "AI ID" credit
 *  packs purchased through Stripe Payment Links. The app never sees the key.
 *
 *  ROUTES
 *    POST /v1/identify   Proxy one identification to Anthropic (1 credit)
 *    POST /v1/claim      Redeem a Stripe Checkout session → credits
 *    POST /v1/trial      One-time free trial credits per device
 *    GET  /v1/balance    Current balance for a token
 *
 *  REQUIRED BINDINGS (see wrangler.toml + SETUP-GUIDE.md)
 *    KV namespace : CREDITS
 *    Secrets      : ANTHROPIC_API_KEY, STRIPE_SECRET_KEY
 *    Vars         : ALLOWED_ORIGIN, TRIAL_CREDITS, MAX_TOKENS_CAP,
 *                   ALLOWED_MODEL, PRICE_MAP
 *
 *  PRICE_MAP maps Stripe amount_total (cents) → credits, as a fallback when a
 *  Payment Link has no `credits` metadata. Example: "299:10,699:30,1499:100"
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const cors = corsHeaders(req, env);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    try {
      if (url.pathname === "/v1/identify" && req.method === "POST") return await identify(req, env, cors);
      if (url.pathname === "/v1/claim"    && req.method === "POST") return await claim(req, env, cors);
      if (url.pathname === "/v1/trial"    && req.method === "POST") return await trial(req, env, cors);
      if (url.pathname === "/v1/balance"  && req.method === "GET")  return await balance(req, env, cors);
      return json({ error: { type: "not_found", message: "Unknown route." } }, 404, cors);
    } catch (e) {
      return json({ error: { type: "server_error", message: e.message || "Server error." } }, 500, cors);
    }
  },
};

/* ── helpers ──────────────────────────────────────────────────────────────── */
function corsHeaders(req, env) {
  const origin = req.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGIN || "*").split(",").map(s => s.trim());
  const ok = allowed.includes("*") || allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? (allowed.includes("*") ? "*" : origin) : "null",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Expose-Headers": "X-Credits-Remaining",
    "Vary": "Origin",
  };
}
function json(obj, status, cors, extra) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors, ...(extra || {}) },
  });
}
function bearer(req) {
  const h = req.headers.get("Authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : null;
}
async function getTok(env, token) {
  if (!token || !token.startsWith("stk_")) return null;
  const raw = await env.CREDITS.get("tok:" + token);
  return raw ? JSON.parse(raw) : null;
}
async function putTok(env, token, data) {
  await env.CREDITS.put("tok:" + token, JSON.stringify(data));
}
function newToken() {
  return "stk_" + crypto.randomUUID().replace(/-/g, "");
}

/* ── POST /v1/identify ────────────────────────────────────────────────────── */
async function identify(req, env, cors) {
  const token = bearer(req);
  const rec = await getTok(env, token);
  if (!rec) {
    return json({ error: { type: "invalid_token", message: "This device isn't linked to an AI pack yet. Get a pack or start the free trial." } }, 401, cors);
  }
  if ((rec.credits | 0) <= 0) {
    return json(
      { error: { type: "insufficient_credits", message: "You're out of AI identification credits." } },
      402, cors, { "X-Credits-Remaining": "0" }
    );
  }
  let body;
  try { body = await req.json(); } catch { return json({ error: { type: "bad_request", message: "Invalid JSON body." } }, 400, cors); }

  // Guardrails: lock the model and cap tokens so a tampered client can't run up costs.
  body.model = env.ALLOWED_MODEL || "claude-sonnet-4-20250514";
  const cap = parseInt(env.MAX_TOKENS_CAP || "8000", 10);
  body.max_tokens = Math.min(parseInt(body.max_tokens || cap, 10) || cap, cap);
  body.stream = false;

  const up = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  const text = await up.text();

  // Only charge for successful generations.
  let remaining = rec.credits;
  if (up.ok) {
    remaining = Math.max(0, (rec.credits | 0) - 1);
    rec.credits = remaining;
    rec.used = (rec.used | 0) + 1;
    rec.lastUsed = Date.now();
    await putTok(env, token, rec);
  }
  return new Response(text, {
    status: up.status,
    headers: { "Content-Type": "application/json", ...cors, "X-Credits-Remaining": String(remaining) },
  });
}

/* ── POST /v1/claim  {session_id, existing_token?} ────────────────────────── */
async function claim(req, env, cors) {
  let b; try { b = await req.json(); } catch { b = {}; }
  const sid = (b.session_id || "").trim();
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sid)) {
    return json({ error: { type: "bad_request", message: "Missing or invalid session_id." } }, 400, cors);
  }
  // Replay guard
  if (await env.CREDITS.get("claimed:" + sid)) {
    return json({ error: { type: "already_claimed", message: "This purchase was already redeemed on a device." } }, 409, cors);
  }
  // Verify with Stripe using the secret key (server-side only).
  const sres = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sid), {
    headers: { Authorization: "Bearer " + env.STRIPE_SECRET_KEY },
  });
  const sess = await sres.json();
  if (!sres.ok) return json({ error: { type: "stripe_error", message: (sess.error && sess.error.message) || "Couldn't verify the purchase." } }, 400, cors);
  if (sess.payment_status !== "paid") {
    return json({ error: { type: "unpaid", message: "That checkout hasn't been paid." } }, 402, cors);
  }
  // Credits: Payment-Link metadata first, amount map as fallback.
  let credits = parseInt((sess.metadata && sess.metadata.credits) || "0", 10);
  if (!credits) {
    const map = Object.fromEntries((env.PRICE_MAP || "").split(",").filter(Boolean).map(p => p.split(":").map(s => s.trim())));
    credits = parseInt(map[String(sess.amount_total)] || "0", 10);
  }
  if (!credits) return json({ error: { type: "unmapped_price", message: "Purchase verified but no credit amount is configured for it. Email support." } }, 422, cors);

  // Merge into an existing device token when provided, else mint a new one.
  let token = (b.existing_token || "").trim();
  let rec = await getTok(env, token);
  if (!rec) { token = newToken(); rec = { credits: 0, used: 0, created: Date.now() }; }
  rec.credits = (rec.credits | 0) + credits;
  rec.lastClaim = sid;
  await putTok(env, token, rec);
  await env.CREDITS.put("claimed:" + sid, token);
  return json({ token, credits: rec.credits, added: credits }, 200, cors);
}

/* ── POST /v1/trial  {device_id} ──────────────────────────────────────────── */
async function trial(req, env, cors) {
  let b; try { b = await req.json(); } catch { b = {}; }
  const dev = (b.device_id || "").trim();
  if (!/^[A-Za-z0-9-]{8,64}$/.test(dev)) return json({ error: { type: "bad_request", message: "Missing device_id." } }, 400, cors);
  if (await env.CREDITS.get("trial:" + dev)) {
    return json({ error: { type: "trial_used", message: "The free trial was already used on this device." } }, 409, cors);
  }
  const amount = parseInt(env.TRIAL_CREDITS || "3", 10);
  const token = newToken();
  await putTok(env, token, { credits: amount, used: 0, created: Date.now(), trial: true });
  await env.CREDITS.put("trial:" + dev, token);
  return json({ token, credits: amount, added: amount, trial: true }, 200, cors);
}

/* ── GET /v1/balance ──────────────────────────────────────────────────────── */
async function balance(req, env, cors) {
  const rec = await getTok(env, bearer(req));
  if (!rec) return json({ error: { type: "invalid_token", message: "Unknown token." } }, 401, cors);
  return json({ credits: rec.credits | 0, used: rec.used | 0 }, 200, cors);
}
