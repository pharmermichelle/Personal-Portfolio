const path = require('node:path');
const { expect, test: base } = require('@playwright/test');

const test = base.extend({
  offlineServices: [async ({ context, baseURL }, use) => {
    // Install routes before creating pages so newly opened game tabs stay isolated too.
    await context.routeWebSocket('**/*', (socket) => socket.close());
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === baseURL) return route.continue();
      if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('/@supabase/supabase-js')) {
        return route.fulfill({ path: path.join(__dirname, 'supabase-mock.js'), contentType: 'application/javascript' });
      }
      return route.abort('blockedbyclient');
    });
    await use();
  }, { auto: true }],
});

module.exports = { expect, test };
