// Phase 1 state machine regression tests using a fake DOM and fake Supabase.
// Does not create real users or send email. Run: node --test tests/retro-hub-account-behavior.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script, createContext } from "node:vm";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../retro-hub-account.js"), "utf8");
const controlIds = [...new Set([...source.matchAll(/byId\("([^"]+)"\)/g)].map(match => match[1]))];

function makeHarness(options = {}) {
  const nodes = Object.create(null);
  let activeElement = null;
  const classes = new Set();
  const calls = [];
  const currentUser = { id: "test-user-a", email: "player@example.invalid" };
  const profile = { username: "PilotPlayer", avatar_key: "pixel-star", is_public: false };
  let authCallback = null;
  class Node {
    constructor(id) {
      this.id = id;
      this.listeners = {};
      this.value = "";
      this.textContent = "";
      this.hidden = id === "auth-modal" || id === "profile-modal";
      this.disabled = false;
      this.dataset = {};
      this.validity = { valid: true };
      this.type = id.includes("password") ? "password" : "text";
      this.autocomplete = "";
      this.required = false;
      this.style = {};
      this.classList = { add: name => classes.add(name), remove: name => classes.delete(name) };
    }
    addEventListener(name, handler) { this.listeners[name] = handler; }
    async emit(name, payload = {}) {
      if (!this.listeners[name]) throw new Error("Missing listener: " + this.id + "." + name);
      return this.listeners[name]({ preventDefault() {}, target: this, ...payload });
    }
    focus() { activeElement = this; }
    querySelector() { return this; }
    querySelectorAll() { return []; }
    getClientRects() { return [1]; }
  }
  for (const id of controlIds.concat(["auth-modal", "profile-modal"])) nodes[id] = new Node(id);
  const document = {
    getElementById: id => nodes[id] ?? null,
    addEventListener() {},
    get activeElement() { return activeElement; },
    body: { classList: { add: name => classes.add(name), remove: name => classes.delete(name) } }
  };
  const fakeClient = {
    auth: {
      getSession: async () => ({ data: { session: options.initialSession || null }, error: null }),
      onAuthStateChange: callback => { authCallback = callback; return { data: { subscription: { unsubscribe() {} } } }; },
      signUp: async input => {
        calls.push({ type: "signup", input });
        return { data: options.signupResult || { user: currentUser, session: null }, error: null };
      },
      signInWithPassword: async input => {
        calls.push({ type: "login", input });
        return { data: { user: currentUser, session: { user: currentUser } }, error: null };
      },
      resetPasswordForEmail: async (email, opts) => {
        calls.push({ type: "recovery", email, opts });
        return { data: {}, error: null };
      },
      updateUser: async changes => {
        calls.push({ type: "update-password", changes });
        return { data: {}, error: null };
      },
      resend: async input => { calls.push({ type: "resend", input }); return { data: {}, error: null }; },
      signOut: async () => { calls.push({ type: "logout" }); return { error: null }; }
    },
    from(table) {
      assert.equal(table, "profiles", "Only profile calls should occur in these tests");
      return {
        select: () => ({
          eq: (key, id) => {
            assert.equal(key, "id");
            assert.equal(id, currentUser.id);
            return { maybeSingle: async () => ({ data: profile, error: null }) };
          }
        }),
        update(values) {
          calls.push({ type: "profile-update", values });
          return {
            eq: (key, id) => {
              assert.equal(key, "id");
              assert.equal(id, currentUser.id);
              return {
                select: async () => ({ data: [{ id }], error: null })
              };
            }
          };
        }
      };
    }
  };
  const window = { location: { origin: "https://michellew.io", pathname: "/retro-game-hub.html" } };
  new Script(source).runInContext(createContext({ window, document, setTimeout: callback => callback() }));
  window.RetroHubAccount.init({ client: fakeClient });
  return {
    nodes, calls, currentUser,
    fireAuth: (event, session) => authCallback(event, session),
    settle: async () => { await Promise.resolve(); await Promise.resolve(); },
    text: id => nodes[id].textContent,
    isHidden: id => nodes[id].hidden
  };
}

test("signup requiring confirmation never announces signed-in", async () => {
  const h = makeHarness();
  await h.settle();
  await h.nodes["auth-open-btn"].emit("click");
  await h.nodes["auth-signup-mode"].emit("click");
  h.nodes["auth-email"].value = "player@example.invalid";
  h.nodes["auth-password"].value = "longpassword12345";
  h.nodes["auth-confirm-password"].value = "longpassword12345";
  await h.nodes["auth-form"].emit("submit");
  assert.equal(h.calls[0].type, "signup");
  assert.equal(h.calls[0].input.options.emailRedirectTo, "https://michellew.io/retro-game-hub.html");
  assert.equal(h.text("auth-status"), "Playing as guest");
  assert.equal(h.isHidden("auth-resend-row"), false);
  assert.match(h.text("auth-message"), /verification email/i);
});

test("email verification resend is available after signup", async () => {
  const h = makeHarness();
  await h.settle();
  await h.nodes["auth-signup-mode"].emit("click");
  h.nodes["auth-email"].value = "player@example.invalid";
  h.nodes["auth-password"].value = "longpassword12345";
  h.nodes["auth-confirm-password"].value = "longpassword12345";
  await h.nodes["auth-form"].emit("submit");
  await h.nodes["auth-resend-btn"].emit("click");
  assert.equal(h.calls.at(-1).type, "resend");
  assert.equal(h.calls.at(-1).input.options.emailRedirectTo, "https://michellew.io/retro-game-hub.html");
});

test("login with verified session opens private player profile", async () => {
  const h = makeHarness();
  await h.settle();
  h.nodes["auth-email"].value = "player@example.invalid";
  h.nodes["auth-password"].value = "password-is-not-logged";
  await h.nodes["auth-form"].emit("submit");
  await h.settle();
  assert.equal(h.text("auth-status"), "🎮 PilotPlayer");
  assert.equal(h.isHidden("profile-open-btn"), false);
  assert.equal(h.isHidden("logout-btn"), false);
  assert.equal(h.isHidden("auth-modal"), true);
  assert.equal(h.nodes["profile-username"].value, "PilotPlayer");
  assert.equal(h.text("profile-visibility").includes("Private"), true);
});

test("password recovery uses configured Hub callback, not localhost", async () => {
  const h = makeHarness();
  await h.settle();
  await h.nodes["auth-forgot-mode"].emit("click");
  assert.equal(h.nodes["auth-password"].required, false);
  h.nodes["auth-email"].value = "player@example.invalid";
  await h.nodes["auth-form"].emit("submit");
  assert.equal(h.calls.at(-1).type, "recovery");
  assert.equal(h.calls.at(-1).opts.redirectTo, "https://michellew.io/retro-game-hub.html");
});

test("password reset callback allows entering a new password", async () => {
  const h = makeHarness();
  await h.settle();
  h.fireAuth("PASSWORD_RECOVERY", { user: h.currentUser });
  assert.equal(h.isHidden("auth-email-row"), true);
  assert.equal(h.nodes["auth-password"].required, true);
  assert.equal(h.nodes["auth-confirm-password"].required, true);
  h.nodes["auth-password"].value = "newlongpassword1234";
  h.nodes["auth-confirm-password"].value = "newlongpassword1234";
  await h.nodes["auth-form"].emit("submit");
  assert.equal(h.calls.at(-1).type, "update-password");
});

test("updating profile can only target the active user's UUID", async () => {
  const h = makeHarness();
  await h.settle();
  h.fireAuth("SIGNED_IN", { user: h.currentUser });
  await h.settle();
  h.nodes["profile-username"].value = "UpdatedPlayer";
  h.nodes["profile-avatar"].value = "pixel-cat";
  await h.nodes["profile-form"].emit("submit");
  assert.equal(h.calls.at(-1).type, "profile-update");
  assert.equal(h.calls.at(-1).values.username, "UpdatedPlayer");
  assert.equal(h.text("auth-status"), "🎮 UpdatedPlayer");
});

test("logout restores guest mode", async () => {
  const h = makeHarness();
  await h.settle();
  h.fireAuth("SIGNED_IN", { user: h.currentUser });
  await h.settle();
  await h.nodes["logout-btn"].emit("click");
  assert.equal(h.calls.at(-1).type, "logout");
  assert.equal(h.text("auth-status"), "Playing as guest");
});
