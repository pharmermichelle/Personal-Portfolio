const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const test = require('node:test');

const api = new URL(process.env.RETRO_LOCAL_SUPABASE_URL || 'http://127.0.0.1:54321');
const key = process.env.RETRO_LOCAL_SUPABASE_ANON_KEY;
assert.equal(api.origin, 'http://127.0.0.1:54321', 'Use a dedicated Supabase CLI stack on loopback');
assert.ok(key, 'Set RETRO_LOCAL_SUPABASE_ANON_KEY to the local CLI anon key');

async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(new URL(path, api), {
    method,
    headers: {
      apikey: key,
      authorization: `Bearer ${token || key}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  assert.ok(response.ok, `${method} ${new URL(path, api).pathname}: HTTP ${response.status} (${data.code || data.error_code || 'request failed'})`);
  return data;
}

async function newAccount() {
  const credentials = { email: `arcade-${randomUUID()}@example.com`, password: randomUUID() };
  await request('/auth/v1/signup', { method: 'POST', body: credentials });
  const signIn = () => request('/auth/v1/token?grant_type=password', { method: 'POST', body: credentials });
  return { signIn, session: await signIn() };
}

function rpc(name, token, body) {
  return request(`/rest/v1/rpc/${name}`, { token, method: 'POST', body });
}

test('local Auth, save ownership, revision conflicts and daily XP deduplication', { timeout: 60_000 }, async () => {
  const [first, second] = await Promise.all([newAccount(), newAccount()]);
  const { access_token: token, user } = first.session;
  const other = second.session.access_token;
  const secondDevice = (await first.signIn()).access_token;
  const refreshed = await request('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: { refresh_token: first.session.refresh_token },
  });
  assert.equal(refreshed.user.id, user.id);

  const saves = '/rest/v1/game_saves';
  const ownSave = `${saves}?game_id=eq.brick-blitz&select=revision,save_data`;
  await request(saves, { token, method: 'POST', body: {
    user_id: user.id, game_id: 'brick-blitz', revision: 1,
    save_data: { schemaVersion: 1, payload: { level: 2 } },
  } });
  assert.deepEqual(await request(ownSave, { token: other }), []);
  assert.deepEqual(await request(`${ownSave}&user_id=eq.${user.id}`, {
    token: other, method: 'PATCH', body: { revision: 2 },
  }), []);
  assert.equal((await request(ownSave, { token: secondDevice }))[0].revision, 1);

  const saveRevision = revision => `${ownSave}&revision=eq.${revision}`;
  const [winningWrite, conflictingWrite] = await Promise.all([
    request(saveRevision(1), { token, method: 'PATCH', body: { revision: 2 } }),
    request(saveRevision(1), { token: secondDevice, method: 'PATCH', body: { revision: 2 } }),
  ]);
  assert.deepEqual([winningWrite.length, conflictingWrite.length].sort(), [0, 1]);
  assert.equal((await request(ownSave, { token: secondDevice }))[0].revision, 2);

  const classic = action => rpc('retro_classic_daily_xp', token, { p_game_id: 'memory-match', p_action: action });
  const runId = randomUUID();
  const coin = (action, args) => rpc('retro_coin_daily_xp', token, { p_run_id: runId, p_action: action, ...args });
  assert.equal((await coin('start')).status, 'started');
  assert.equal((await classic('start')).status, 'started');
  for (let turn = 1; turn <= 10; turn++) {
    assert.equal((await coin('flip', { p_seq: turn, p_guess: 0 })).status, 'ok');
  }
  await new Promise(resolve => setTimeout(resolve, 10_100));
  const claims = await Promise.all([classic('complete'), classic('complete'), coin('complete'), coin('complete')]);
  assert.deepEqual(claims.slice(0, 2).map(claim => claim.awarded_xp).sort(), [0, 2]);
  assert.ok(claims.slice(2).every(claim => claim.status === 'complete'));
  const ledger = '/rest/v1/xp_ledger?select=game_id,amount';
  const awards = await request(ledger, { token });
  assert.deepEqual(awards.filter(row => row.game_id === 'heads-or-tails').map(row => row.amount), [2]);
  assert.deepEqual(awards.filter(row => row.game_id === 'memory-match').map(row => row.amount), [2]);
  assert.deepEqual(await request(ledger, { token: other }), []);
});

test('concurrent unique coin runs only award progress beyond the daily best', { timeout: 60_000 }, async () => {
  const { session: { access_token: token } } = await newAccount();
  const runs = await Promise.all(Array.from({ length: 6 }, async () => {
    const id = randomUUID();
    const call = (action, args) => rpc('retro_coin_daily_xp', token, { p_run_id: id, p_action: action, ...args });
    assert.equal((await call('start')).status, 'started');
    let score = 0;
    for (let turn = 1; turn <= 10; turn++) {
      const result = await call('flip', { p_seq: turn, p_guess: 0 });
      assert.equal(result.status, 'ok');
      if (result.hit === 0) score++;
    }
    return { score, complete: () => call('complete') };
  }));
  const [baseline, tieOrImprovement, ...others] = runs.sort((a, b) => a.score - b.score);
  await new Promise(resolve => setTimeout(resolve, 10_100));

  assert.equal((await baseline.complete()).awarded_xp, 2);
  assert.equal((await tieOrImprovement.complete()).awarded_xp, tieOrImprovement.score - baseline.score);
  const claims = await Promise.all(others.map(run => run.complete()));
  assert.ok(claims.every(claim => claim.status === 'complete'));
  const best = Math.max(...runs.map(run => run.score));
  const ledger = '/rest/v1/xp_ledger?game_id=eq.heads-or-tails&select=amount';
  const getTotal = async () => (await request(ledger, { token })).reduce((sum, row) => sum + row.amount, 0);
  assert.equal(await getTotal(), 2 + best - baseline.score);

  await Promise.all(runs.map(run => run.complete()));
  assert.equal(await getTotal(), 2 + best - baseline.score);
});
