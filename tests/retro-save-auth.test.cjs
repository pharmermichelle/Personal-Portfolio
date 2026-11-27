const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'retro-save-service.js'), 'utf8');
const account = id => ({ id });
const session = user => ({ data: { session: user ? { user } : null } });

function cloudSave(level) {
  return {
    data: {
      revision: 1,
      save_data: { schemaVersion: 1, payload: { level } }
    }
  };
}

function harness(getSession) {
  const requests = [];
  const writes = [];
  const timers = new Map();
  const restored = [];
  const status = {};
  let authChange;
  let nextTimer = 0;
  const values = new Map();
  const window = {
    addEventListener() {},
    retroArcadeSupabaseClient: {
      auth: {
        getSession,
        onAuthStateChange(callback) {
          authChange = callback;
        }
      },
      from(table) {
        assert.equal(table, 'game_saves');
        let userId;
        let write = false;
        return {
          select() { return this; },
          update() { write = true; return this; },
          eq(column, value) {
            if (column === 'user_id') userId = value;
            return this;
          },
          maybeSingle() {
            return new Promise(resolve => (write ? writes : requests).push({ userId, resolve }));
          }
        };
      }
    }
  };
  vm.runInNewContext(source, {
    window,
    document: { getElementById: id => id === 'save-status' ? status : null, addEventListener() {} },
    localStorage: {
      getItem: key => values.get(key),
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key)
    },
    setTimeout(callback) {
      const id = ++nextTimer;
      timers.set(id, callback);
      return id;
    },
    clearTimeout: id => timers.delete(id)
  });
  const service = window.RetroSaveService.create({
    gameId: 'test-game',
    schemaVersion: 1,
    validateSave: state => state,
    readLegacyLocal: () => null,
    meaningful: () => false,
    summarizeSave: state => String(state.level),
    emptyState: () => ({ level: 0 }),
    restoreState: state => restored.push(state.level)
  }, { statusId: 'save-status' });
  return {
    service,
    restored,
    requests,
    writes,
    status,
    auth(event, user) {
      authChange(event, user ? { user } : null);
    },
    runTimers() {
      for (const [id, callback] of timers) {
        timers.delete(id);
        callback();
      }
    }
  };
}

const drainPromises = () => new Promise(resolve => setImmediate(resolve));
const testOptions = { timeout: 2000 };

test('sign-out during initial session read takes precedence over its stale account snapshot', testOptions, async () => {
  let resolveSession;
  const app = harness(() => new Promise(resolve => { resolveSession = resolve; }));
  const initial = app.service.initialize();
  app.auth('SIGNED_OUT');
  resolveSession(session(account('old-account')));
  assert.equal(await initial, null);
  app.runTimers();
  assert.equal(app.service.mode, 'guest');
  assert.equal(app.requests.length, 0);
});

test('a signed-in event followed by sign-out in the same turn leaves guest progress active', testOptions, async () => {
  const app = harness(async () => session(null));
  await app.service.initialize();
  app.auth('SIGNED_IN', account('account-a'));
  app.auth('SIGNED_OUT');
  app.runTimers();
  await drainPromises();
  assert.equal(app.service.mode, 'guest');
  assert.equal(app.requests.length, 0);
});

test('a slow account save cannot overwrite progress restored for a newer account', testOptions, async () => {
  const app = harness(async () => session(null));
  await app.service.initialize();
  app.auth('SIGNED_IN', account('account-a'));
  app.runTimers();
  app.auth('SIGNED_IN', account('account-b'));
  app.runTimers();
  assert.deepEqual(app.requests.map(request => request.userId), ['account-a', 'account-b']);

  app.requests[1].resolve(cloudSave(8));
  await drainPromises();
  app.requests[0].resolve(cloudSave(12));
  await drainPromises();

  assert.equal(app.service.user.id, 'account-b');
  assert.deepEqual(app.restored, [8]);
});

test('initialization returns the latest account progress while an old cloud read is pending', testOptions, async () => {
  const app = harness(async () => session(account('account-a')));
  const initial = app.service.initialize();
  await drainPromises();
  app.auth('SIGNED_IN', account('account-b'));
  app.runTimers();
  assert.deepEqual(app.requests.map(request => request.userId), ['account-a', 'account-b']);
  app.requests[1].resolve(cloudSave(8));
  assert.equal((await initial).level, 8);
  app.requests[0].resolve(cloudSave(12));
  await drainPromises();
  assert.equal(app.service.current.level, 8);
  assert.deepEqual(app.restored, []);
});

test('an autosave between auth notification and activation does not touch the previous account', testOptions, async () => {
  const app = harness(async () => session(account('account-a')));
  const initial = app.service.initialize();
  await drainPromises();
  app.requests[0].resolve(cloudSave(5));
  await initial;
  app.auth('SIGNED_OUT');
  app.service.save({ level: 30 });
  assert.equal(app.service.pending, null);
  assert.equal(app.service.current.level, 5);
  app.runTimers();
  await drainPromises();
  assert.equal(app.service.mode, 'guest');
});

test('token refresh for the same player does not reload or reset progress', testOptions, async () => {
  const app = harness(async () => session(account('account-a')));
  const initial = app.service.initialize();
  await drainPromises();
  app.requests[0].resolve(cloudSave(5));
  assert.equal((await initial).level, 5);

  app.auth('TOKEN_REFRESHED', account('account-a'));
  app.runTimers();
  await drainPromises();
  assert.equal(app.requests.length, 1);
  assert.deepEqual(app.restored, []);
});

test('a previous account write cannot unlock or block the current account write queue', testOptions, async () => {
  const app = harness(async () => session(account('account-a')));
  const initial = app.service.initialize();
  await drainPromises();
  app.requests[0].resolve(cloudSave(5));
  await initial;
  app.service.save({ level: 6 });
  const firstWrite = app.service.flush();

  app.auth('SIGNED_IN', account('account-b'));
  app.runTimers();
  app.requests[1].resolve(cloudSave(8));
  await drainPromises();
  app.service.save({ level: 9 });
  const secondWrite = app.service.flush();
  assert.deepEqual(app.writes.map(write => write.userId), ['account-a', 'account-b']);

  app.writes[0].resolve({ data: { revision: 2 } });
  await firstWrite;
  await app.service.flush();
  assert.equal(app.writes.length, 2);
  app.writes[1].resolve({ data: { revision: 2 } });
  await secondWrite;
  assert.equal(app.service.revision, 2);
  assert.equal(app.status.textContent, 'Saved to account');
});

test('Sync Options preserves a pending conflict if the account save cannot be read', testOptions, async () => {
  const app = harness(async () => session(account('account-a')));
  let prompted = false;
  app.service.prompt = async () => { prompted = true; return 'later'; };
  const initial = app.service.initialize();
  await drainPromises();
  app.requests[0].resolve(cloudSave(5));
  await initial;
  app.service.save({ level: 6 });
  const write = app.service.flush();
  app.writes[0].resolve({ data: null });
  await drainPromises();
  app.requests[1].resolve({ error: new Error('offline') });
  await write;
  assert.equal(app.service.mode, 'conflict');

  const options = app.service.openSyncOptions();
  app.requests[2].resolve({ error: new Error('offline') });
  await options;
  assert.equal(prompted, false);
  assert.equal(app.service.mode, 'conflict');
  assert.equal(app.service.pending.envelope.payload.level, 6);
  assert.match(app.status.textContent, /try Sync Options again/);
});
