const { expect, test } = require('./fixtures');

test('profile totals include XP beyond a shorter API page cap', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('retro-browser-test-session', 'signed-in');
    localStorage.setItem('retro-test-ledger-size', '260');
  });
  await page.goto('/retro-player-profile.html');
  await expect(page.locator('#xp-text')).toHaveText('520 XP total');
  const record = page.getByRole('row').filter({ hasText: 'Heads or Tails' });
  await expect(record.getByRole('cell', { name: /^(XP )?520 XP$/ })).toBeVisible();
});
