# 🦈 SharkToothify — Launch Setup Guide

Everything to go from these files to a live, money-making app. Total hands-on time: **~45–60 minutes**. Do the steps in order — each one ends with something you paste into the app.

**Files in this package**

| File | What it is | Where it goes |
|---|---|---|
| `SharkToothIdentifier.jsx` | The entire app | Your web host (root) |
| `index.html` | PWA loader page | Your web host (root) |
| `manifest.webmanifest` | PWA install manifest | Your web host (root) |
| `sw.js` | Offline service worker | Your web host (root) |
| `worker.js` | AI backend (holds YOUR Anthropic key) | Cloudflare Workers |
| `wrangler.toml` | Worker config | Same folder as worker.js |
| `robots.txt` | Search-engine permissions | Your web host (root) |
| `sitemap.xml` | Search-engine site map | Your web host (root) |
| `SETUP-GUIDE.md` | This guide | Your records |

---

## Part 1 — Stripe (~20 min)

You'll create **3 credit packs**, **1 tip jar**, and copy **1 secret key**.

### 1.1 Account
Go to **stripe.com** → create an account (business type: individual is fine). You can do everything below in **Test mode** first (toggle, top-right of the dashboard) and repeat in Live mode when ready — strongly recommended.

### 1.2 Create the three pack products
Dashboard → **Product catalog** → **+ Add product**, three times:

| Name | Price | One-time |
|---|---|---|
| 10 AI Identifications | $2.99 | ✓ |
| 30 AI Identifications | $6.99 | ✓ |
| 100 AI Identifications | $14.99 | ✓ |

### 1.3 Create a Payment Link for each pack
For each product: open it → **Create payment link** (or **Payment links** in the left nav → **+ New**, pick the product). Then on the payment link's settings:

1. **After payment** → *Don't show confirmation page* → **Redirect customers to your website** and enter — exactly, including the curly braces:
   ```
   https://sharktoothify.us/?session_id={CHECKOUT_SESSION_ID}
   ```
   (Swap in your real app URL. Stripe replaces `{CHECKOUT_SESSION_ID}` automatically — that's how the app knows which purchase to redeem.)
2. **Metadata** (under the link's advanced options): add key `credits` with value `10`, `30`, or `100` to match the pack.
   *(If you can't find metadata, skip it — the Worker also maps by price: 299¢→10, 699¢→30, 1499¢→100 via `PRICE_MAP` in wrangler.toml. Just keep prices exact.)*
3. Copy the link (looks like `https://buy.stripe.com/abc123…`).

### 1.4 Tip jar ("Buy Dev a Coffee")
**Payment links** → **+ New** → choose **Customers choose what to pay** → name it "Buy the Dev a Coffee ☕" → suggested amount $5 (or whatever feels right) → create → copy the link. No redirect or metadata needed.

### 1.5 Secret key
**Developers** → **API keys** → copy the **Secret key** (`sk_test_…` in test mode, `sk_live_…` in live). You'll feed this to the Worker in Part 2 — it never goes in the app.

### 1.6 Paste into the app (`SharkToothIdentifier.jsx`, near the top)
```js
const EXTERNAL_LINKS = {
  coffee: "https://buy.stripe.com/YOUR_TIP_LINK",
  ...
};
const AI_BACKEND = {
  ...
  packs: [
    { ... link:"https://buy.stripe.com/YOUR_10_PACK_LINK"  },
    { ... link:"https://buy.stripe.com/YOUR_30_PACK_LINK"  },
    { ... link:"https://buy.stripe.com/YOUR_100_PACK_LINK" },
  ],
};
```

---

## Part 2 — Cloudflare Worker: the AI backend (~15 min)

This tiny server holds your Anthropic API key, meters credits, and verifies Stripe purchases. Cloudflare's **free plan covers it** (100k requests/day).

### 2.1 Anthropic key (if you don't have a production one)
**console.anthropic.com** → API Keys → Create key (name it `sharktoothify-prod`). While you're there: **Settings → Limits** — set a **monthly spend cap** (e.g. $50) as a safety net. This key goes ONLY into the Worker secret below.

### 2.2 Deploy
On your computer (Node.js installed), put `worker.js` + `wrangler.toml` in a folder, then:

```bash
npx wrangler login                          # opens browser, authorize
npx wrangler kv namespace create CREDITS    # prints an id like 0f31…
```
Paste that id into `wrangler.toml` (`id = "PASTE_YOUR_KV_NAMESPACE_ID_HERE"`), and set `ALLOWED_ORIGIN` to your app URL (e.g. `https://sharktoothify.us`). Then:

```bash
npx wrangler secret put ANTHROPIC_API_KEY   # paste sk-ant-…
npx wrangler secret put STRIPE_SECRET_KEY   # paste sk_live_… (or sk_test_ while testing)
npx wrangler deploy
```
The deploy prints your Worker URL, e.g. `https://sharktoothify-ai.dustin.workers.dev`.

### 2.3 Paste into the app
```js
const AI_BACKEND = {
  workerUrl: "https://sharktoothify-ai.YOURSUBDOMAIN.workers.dev",
  ...
};
```
*(Optional, prettier: Cloudflare dashboard → your Worker → Settings → Triggers → Custom Domains → `api.sharktoothify.us`, then use that URL instead.)*

---

## Part 3 — Shopify in-app shop (optional, ~5 min)

The Shop screen works either way — without a token it shows a hero card linking to **shop.sharktoothify.us**; with a token it also shows a live product grid.

1. Shopify admin → **Settings → Apps and sales channels → Develop apps** → **Create an app** (name: "SharkToothify App").
2. **Configure Storefront API scopes** → check `unauthenticated_read_product_listings` → Save → **Install app**.
3. Copy the **Storefront API access token** (this one is safe for client-side use).
4. Paste into the app:
```js
const SHOPIFY = {
  domain: "your-store.myshopify.com",   // Settings → Domains (the myshopify one)
  storefrontToken: "shpat_or_storefront_token_here",
  collectionHandle: "frontpage",        // or any collection handle you want featured
};
```

---

## Part 4 — Deploy the app (Cloudflare Pages, free, ~10 min)

1. Make a folder containing: `index.html`, `SharkToothIdentifier.jsx`, `sw.js`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, and an `icons/` folder (see icon list below).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Upload assets** → drag the folder in → Deploy.
3. Add your custom domain (Pages project → Custom domains → `sharktoothify.us`).
4. Go back to `wrangler.toml`, make sure `ALLOWED_ORIGIN` matches this final URL, and `npx wrangler deploy` once more.

**Icons to drop in `/icons/`** (export from your Sharktoothify badge logo):
`icon-192.png` (192×192) · `icon-512.png` (512×512) · `maskable-512.png` (512×512 with ~20% safe padding) · `icon-180.png` (Apple touch) · `og-card.png` (1200×630 social preview)

**Analytics (recommended):** create a free site at plausible.io for `sharktoothify.us`, then uncomment the Plausible `<script>` line in `index.html`. Privacy-friendly, no cookie banner needed — fits the "100% private" brand.

---

## Part 5 — Test flight checklist (do this in Stripe TEST mode first)

Test card: `4242 4242 4242 4242`, any future date, any CVC.

- [ ] Open the deployed app → tap **⚡** → **Start free — 3 IDs on us** → balance shows 3
- [ ] Run an AI identification → works with **no API key** → chip shows "⚡ 2 AI IDs left"
- [ ] Buy the 10-pack with the test card → redirected back → 🎉 "AI pack activated" → balance 12
- [ ] Paste the same success URL again → "already redeemed" alert (replay protection ✓)
- [ ] Remove credits scenario: spend to 0 → next ID shows the out-of-credits message with pack buttons
- [ ] Advanced path: connect a personal `sk-ant-` key with 0 credits → AI still works (BYOK fallback ✓)
- [ ] ☕ Buy Dev a Coffee opens the Stripe tip page
- [ ] 🎯 Hunt Planner: pick Venice, FL from 🏖️ Beaches → scored low-tide windows appear
- [ ] Install to home screen (Add to Home Screen) → relaunch with Wi-Fi off → app shell loads
- [ ] Settings → Export backup → file downloads; Import on another browser → finds restored
- [ ] AI result → **📣 Make Share Card** → branded PNG shares/downloads

**Going live:** flip Stripe out of test mode, recreate the 3 pack links + tip link in Live mode (or use the same products — payment links are mode-specific), paste the live links into the JSX, `wrangler secret put STRIPE_SECRET_KEY` with the live key, redeploy both Worker and Pages.

---

## Part 6 — The money math 💰

| | |
|---|---|
| Your cost per AI ID (Sonnet, photo + web search) | ≈ $0.01–0.03 |
| 10-pack: $2.99 − ~$0.39 Stripe fee − ~$0.20 AI cost | **≈ $2.40 profit (80%)** |
| 30-pack: $6.99 − ~$0.50 − ~$0.60 | **≈ $5.89 profit (84%)** |
| 100-pack: $14.99 − ~$0.73 − ~$2.00 | **≈ $12.26 profit (82%)** |

Cloudflare Worker + KV + Pages: $0 at launch scale. Anthropic spend cap = your worst-case bill.

**Fine print to know**
- Credit decrements use KV (not atomic): two *simultaneous* IDs could rarely cost one credit. Worst case a user gets a free ID — acceptable, and never overcharges.
- The free trial is per device-id in localStorage; clearing storage re-enables it. It's 3 cheap IDs — fine as a growth cost.
- Refunds: refund in Stripe as normal; credits already granted stay on-device (your call to claw back manually via KV if it ever matters).
- The claude.ai preview sandbox blocks all outbound requests — payments, tides and AI only work on the real deployment.

---

## Part 7 — Domain, email & shop (sharktoothify.us) ~15 min

1. **Add the zone:** Cloudflare dashboard → Add site → `sharktoothify.us` → update the nameservers at your registrar to the two Cloudflare gives you.
2. **App at the root:** Pages project → Custom domains → add `sharktoothify.us` (and `www.sharktoothify.us`, set to redirect to the apex). The app/website now lives at https://sharktoothify.us.
3. **Email (required — it's printed in your Terms):** Cloudflare → Email → Email Routing → enable → create address `updates@sharktoothify.us` → forward to your personal inbox → verify. Free, two minutes.
4. **Shop subdomain:** the app links to `shop.sharktoothify.us`. In your Lovable/Shopify store settings add that as a custom domain, then create the CNAME Cloudflare prompts for. (Until you do, the Shop button 404s — do this before launch.)
5. **Worker (optional, prettier):** Worker → Settings → Triggers → Custom Domains → `api.sharktoothify.us`, then use that as `AI_BACKEND.workerUrl`.
6. **Tell Google:** Search Console → add property `sharktoothify.us` → submit `https://sharktoothify.us/sitemap.xml`. The landing copy + JSON-LD baked into index.html does the rest.

## Part 8 — Legal protection checklist (do before/at launch)

- [ ] **Register the copyright** at copyright.gov (Literary Work covering the source code; ~$45–65). Registering *before* any infringement unlocks statutory damages + attorney's fees — that's the real deterrent. Deposit a copy of `SharkToothIdentifier.jsx`.
- [ ] **File the trademark**: USPTO TEAS application for the word mark "SHARKTOOTHIFY" and (separately or combined) the tooth-badge logo — Class 9 (software) and/or 42 (SaaS), ~$250–350 per class. Until registration, keep using ™ (already in-app); switch to ® only after it issues.
- [ ] **Attorney pass** on the in-app Terms (15–30 min of an IP lawyer's time) — especially the NC governing-law/venue clause and the purchases section.
- [ ] **Keep dated records**: this build conversation, file timestamps, and any repo history establish your creation date.
- [ ] Optional: register a **DMCA agent** (copyright.gov/dmca, $6) so takedown notices have a formal channel.

**Honest scope note:** these protect your *expression and brand* — code, design, text, name, logo. No filing makes the underlying *idea* of a tooth-ID app exclusive; competing apps are legal so long as they don't copy yours.

## Releasing updates

When you ship a new version: bump `APP_VERSION` in the JSX **and** `VERSION` in `sw.js` (e.g. `stfy-v2`), then re-upload. Users with the old version get the in-app "🔄 Update ready — Refresh" pill automatically.

You're cleared for takeoff. 🦈
