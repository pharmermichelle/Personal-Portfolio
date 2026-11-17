// Deterministic, network-free Phase 1 smoke checks. Run: node --test tests/retro-hub-phase1.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { Script } from "node:vm";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const read = path => readFileSync(resolve(root, path), "utf8");
const hub = read("retro-game-hub.html");
const account = read("retro-hub-account.js");
const platform = read("retro-hub-platform.js");
test("all browser JavaScript parses", () => {
  new Script(account);
  new Script(platform);
  const inline = [...hub.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  assert.ok(inline.length > 0);
  for (const [, body] of inline) new Script(body);
});
test("all account controls used by the controller exist", () => {
  const ids = new Set([...hub.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const referenced = new Set([...account.matchAll(/byId\("([^"]+)"\)/g)].map(m => m[1]));
  for (const id of referenced) assert.ok(ids.has(id), "Missing HTML id: " + id);
});
test("shared assets and auth view are included", () => {
  for (const file of ["retro-hub-platform.js", "retro-hub-account.js", "retro-hub-account.css"]) {
    assert.ok(existsSync(resolve(root, file)));
    assert.ok(hub.includes('"' + file + '"'));
  }
  assert.ok(hub.includes('id="profile-modal"'));
  assert.ok(hub.includes('id="auth-modal"'));
  assert.ok(!hub.includes("updateAuthUI(data.user)"), "Do not treat unconfirmed signup as login");
  assert.ok(!account.includes("service_role"), "No service role should appear in the client");
});
test("17 games and all four missing portfolio entries are present", () => {
  const ids = [...hub.matchAll(/\bid:\s*"([^"]+)"\s*,\s*title:/g)].map(m => m[1]);
  assert.equal(ids.length, 17);
  assert.equal(new Set(ids).size, 17);
  for (const id of ["claws-vs-paws", "revive-nature", "tide-tetris", "cut-the-cheese"]) {
    assert.ok(ids.includes(id));
  }
  for (const url of [
    "minigame/claws-vs-paws/index.html", "minigame/Revive-nature/revive-index.html",
    "minigame/Tide-Tetris/index.html", "minigame/Cut-the-Cheese/index.html"
  ]) assert.ok(existsSync(resolve(root, url)), "Game entry target absent: " + url);
});
test("existing game filters and ad unit remain in place", () => {
  assert.ok(hub.includes("bindFilters()"));
  assert.ok(hub.includes('data-ad-slot="4366267404"'));
  assert.ok(hub.includes('id="gallery"'));
  assert.ok(hub.includes("renderGallery()"));
});
