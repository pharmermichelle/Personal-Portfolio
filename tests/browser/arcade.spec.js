const { expect, test } = require('./fixtures');

const hub = '/retro-game-hub.html';
const coin = '/minigame/retro-classics/index.html?game=coin';
const brickBlitz = '/minigame/brick-blitz/';

async function signIn(page) {
  await page.goto(hub);
  await page.locator('#auth-open-btn').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Email address', { exact: true }).fill('player@example.test');
  await dialog.locator('#auth-password').fill('fixture-password');
  await dialog.getByRole('button', { name: 'Log In', exact: true }).click();
  await expect(page.locator('#player-header-name')).toHaveText('Test Player');
}

test('browse and search on the current viewport', async ({ page, isMobile }) => {
  await page.goto(hub);
  const browse = page.getByRole('searchbox');
  const filters = page.locator('#filter-disclosure');
  if (isMobile) {
    await expect(filters).not.toHaveAttribute('open', '');
    await filters.locator('summary').click();
  }
  await expect(filters).toHaveAttribute('open', '');
  const chance = filters.getByRole('button', { name: 'Chance', exact: true });
  await chance.click();
  await expect(chance).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: 'Play Brick Blitz' })).toHaveCount(0);
  await browse.fill('Heads or Tails');
  await expect(page.getByRole('link', { name: 'Play Heads or Tails' })).toHaveCount(1);
  await expect(page.locator('#game-result-count')).toHaveText(/^1 of \d+ games$/);
  await browse.fill('does not match any game');
  await expect(page.getByRole('heading', { name: 'No games match those filters' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all games' }).click();
  await expect(browse).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('launch a game and use the shared navigation and share dialog', async ({ page, baseURL }) => {
  await page.goto(hub);
  const [game] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: 'Play Brick Blitz' }).click(),
  ]);
  await expect(game.getByRole('heading', { name: 'Brick Blitz' })).toBeVisible();
  const nav = game.getByRole('navigation', { name: 'Arcade navigation' });
  await expect(nav.getByRole('link', { name: 'Arcade Hub' })).toHaveAttribute('href', `${baseURL}${hub}`);
  await nav.getByRole('button', { name: 'Share' }).click();
  const share = game.getByRole('dialog', { name: 'Share this game' });
  await expect(share.getByLabel('Shareable game link')).toHaveValue(`${baseURL}${brickBlitz}index.html`);
  await share.getByRole('button', { name: 'Close' }).click();
  await expect(share).toBeHidden();
});

test('restore the signed-in session after reload and clear it on logout', async ({ page }) => {
  await signIn(page);
  await expect(page.locator('#player-header-xp')).toHaveText(/2 total XP/);
  await page.reload();
  await expect(page.locator('#player-header-name')).toHaveText('Test Player');
  await page.getByRole('button', { name: 'Log Out', exact: true }).click();
  await expect(page.locator('#auth-open-btn')).toBeVisible();
  await page.reload();
  await expect(page.locator('#player-header-card')).toBeHidden();
  await expect(page.locator('#auth-open-btn')).toBeVisible();
});

test('render a completed round and credit only the XP returned by the server', async ({ page }) => {
  await signIn(page);
  await page.goto(coin);
  const heads = page.getByRole('button', { name: 'Heads', exact: true });
  const round = page.locator('#round');
  const xp = page.locator('#xp-state');
  for (const message of [/\+2 XP banked!/, /No additional XP this game/]) {
    for (let turn = 1; turn <= 10; turn++) {
      await heads.click();
      await expect(round).toHaveText(`${turn}/10`);
    }
    await expect(page.locator('#status')).toHaveText(/Game complete! Final score: 10/);
    await expect(xp).toHaveText(message);
    await expect(xp).toHaveText(/account best: 10\/10/);
    await page.getByRole('button', { name: 'New game' }).click();
  }
  await expect(round).toHaveText('0/10');
  await page.reload();
  await expect(page.locator('#best')).toHaveText('10');
});

test('load account cloud progress and restore the unlocked level on reload', async ({ page }) => {
  await signIn(page);
  await page.goto(brickBlitz);
  for (let visit = 0; visit < 2; visit++) {
    await expect(page.locator('#brick-cloud-status')).toHaveText('Saved to account');
    await expect(page.locator('#level')).toHaveText('4 / 12');
    await expect(page.getByRole('button', { name: /Start level 4/i })).toBeEnabled();
    if (visit === 0) await page.reload();
  }
});

test('choose the device progress and sync it to the account', async ({ page }) => {
  await signIn(page);
  await page.evaluate(() => {
    localStorage.setItem('retro:brick-blitz:progress:v1', JSON.stringify({ unlocked: 7, score: 500 }));
  });
  await page.goto(brickBlitz);
  const choice = page.getByRole('dialog', { name: 'Choose Brick Blitz progress' });
  await expect(choice).toContainText('Level 7 unlocked');
  await expect(choice).toContainText('Level 4 unlocked');
  await choice.getByRole('button', { name: 'Use device save (replace account)' }).click();
  await expect(page.locator('#brick-cloud-status')).toHaveText('Saved to account');
  await page.evaluate(() => localStorage.removeItem('retro:brick-blitz:progress:v1'));
  await page.reload();
  await expect(page.locator('#level')).toHaveText('7 / 12');
});
