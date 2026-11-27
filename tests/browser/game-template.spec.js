const { expect, test } = require('./fixtures');

test('play the template with its tutorial, shared navigation and restart', async ({ page, isMobile }) => {
  await page.goto('/minigame/_template/index.html');
  await page.getByText('How to play', { exact: true }).click();
  await expect(page.getByText('Start a practice round', { exact: false })).toBeVisible();
  const start = page.getByRole('button', { name: 'Start round' });
  const finish = page.getByRole('button', { name: 'Finish practice round' });
  const restart = page.getByRole('button', { name: 'Restart' });
  await expect(finish).toBeDisabled();
  if (isMobile) await start.tap();
  else await start.press('Enter');
  await expect(finish).toBeFocused();
  if (isMobile) await finish.tap();
  else await finish.press('Enter');
  await expect(page.getByRole('status')).toContainText('Round complete.');
  await restart.click();
  await expect(start).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Arcade navigation' })).toBeVisible();
});
