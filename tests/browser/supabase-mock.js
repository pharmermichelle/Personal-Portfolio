(() => {
  const account = {
    id: '00000000-0000-4000-8000-000000000001',
    email: 'player@example.test',
  };
  const sessionKey = 'retro-browser-test-session';
  const session = () => localStorage.getItem(sessionKey) ? { user: account } : null;
  const subscribers = new Set();
  const emit = (event) => {
    for (const listener of subscribers) listener(event, session());
  };
  const ok = (data) => ({ data, error: null });
  const data = {
    earned_badges: [],
    game_activity: [],
    game_scores: [],
    thanksgiving_2026_activity: null,
    profiles: { username: 'Test Player', avatar_key: null },
    xp_ledger: [{ id: '0001', amount: 2, game_id: 'heads-or-tails' }],
    equipped_cosmetics: [],
    player_inventory: [],
    game_saves: {
      revision: 3,
      save_data: { schemaVersion: 1, payload: { unlocked: 4, score: 250 } },
    },
  };
  const cloudKey = 'retro-browser-test-cloud';
  let completedRuns = 0;

  window.supabase = {
    createClient() {
      return {
        auth: {
          getSession: async () => ok({ session: session() }),
          onAuthStateChange(listener) {
            subscribers.add(listener);
            queueMicrotask(() => listener('INITIAL_SESSION', session()));
            return { data: { subscription: { unsubscribe: () => subscribers.delete(listener) } } };
          },
          async signInWithPassword() {
            localStorage.setItem(sessionKey, 'signed-in');
            emit('SIGNED_IN');
            return ok({ user: account, session: session() });
          },
          async signOut() {
            localStorage.removeItem(sessionKey);
            emit('SIGNED_OUT');
            return ok(null);
          },
        },
        from(table) {
          if (!Object.hasOwn(data, table)) throw new Error(`Unexpected test table: ${table}`);
          const filters = new Map();
          let update;
          let nextId = null;
          let limit;
          return {
            select() { return this; },
            eq(column, value) { filters.set(column, value); return this; },
            order() { return this; },
            limit(value) { limit = value; return this; },
            gt(column, value) { if (column === 'id') nextId = value; return this; },
            update(fields) { update = fields; return this; },
            async maybeSingle() {
              if (table !== 'game_saves') return ok(data[table]);
              if (filters.get('user_id') !== account.id || filters.get('game_id') !== 'brick-blitz') {
                throw new Error('Unexpected cloud save scope');
              }
              const saved = JSON.parse(localStorage.getItem(cloudKey)) ?? data.game_saves;
              if (!update) return ok(saved);
              if (filters.get('revision') !== saved.revision || update.revision !== saved.revision + 1) {
                throw new Error('Expected cloud save revision check');
              }
              localStorage.setItem(cloudKey, JSON.stringify(update));
              return ok({ revision: update.revision });
            },
            then(resolve, reject) {
              let rows = table === 'game_saves' ? [] : data[table];
              const ledgerSize = Number(localStorage.getItem('retro-test-ledger-size'));
              if (table === 'xp_ledger' && ledgerSize > 0) {
                rows = Array.from({length: ledgerSize}, (_, i) => ({
                  id: String(i + 1).padStart(4, '0'), amount: 2, game_id: 'heads-or-tails',
                }));
              }
              if (table === 'xp_ledger') {
                rows = rows.filter(row => nextId === null || row.id > nextId).slice(0, Math.min(limit ?? 100, 100));
              }
              return Promise.resolve(ok(rows)).then(resolve, reject);
            },
          };
        },
        async rpc(name, args) {
          if (name === 'record_game_presence') return ok({ status: 'ok' });
          if (name !== 'retro_coin_daily_xp') throw new Error(`Unexpected test RPC: ${name}`);
          switch (args.p_action) {
            case 'start': return ok({ status: 'started' });
            case 'flip': return ok({ status: 'ok', hit: 0 });
            case 'complete': return ok({ status: 'complete', awarded_xp: completedRuns++ === 0 ? 2 : 0, daily_best: 10 });
            default: throw new Error(`Unexpected coin action: ${args.p_action}`);
          }
        },
      };
    },
  };
})();
