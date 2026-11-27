const { expect, test } = require('./fixtures');

const catalogSize = 34;
const batchSize = 9;

for (let start = 0; start < catalogSize; start += batchSize) {
  const end = Math.min(start + batchSize, catalogSize);

  test(`open catalog games ${start + 1}–${end} with shared navigation`, async ({ page, baseURL }) => {
    test.setTimeout(90_000);
    await page.goto('/retro-game-hub.html');
    const links = page.locator('#gallery .game-tile-link');
    await expect(links).toHaveCount(catalogSize);

    const games = await links.evaluateAll(anchors => anchors.map(anchor => ({
      url: anchor.href,
      name: anchor.getAttribute('aria-label'),
    })));
    expect(new Set(games.map(game => game.url)).size).toBe(catalogSize);

    for (const game of games.slice(start, end)) {
      await test.step(game.name, async () => {
        expect(new URL(game.url).origin).toBe(baseURL);
        const response = await page.goto(game.url, { waitUntil: 'domcontentloaded' });
        expect(response?.ok()).toBe(true);
        await expect(page.locator('#retro-arcade-header')).toBeVisible();
        await expect(page.getByRole('navigation', { name: 'Arcade navigation' })
          .getByRole('link', { name: 'Arcade Hub' })).toHaveAttribute('href', `${baseURL}/retro-game-hub.html`);

        if (new URL(game.url).searchParams.has('game')) {
          await expect(page.locator('h1#title')).toHaveText(game.name.replace(/^Play /, ''));
        }
      });
    }
  });
}
