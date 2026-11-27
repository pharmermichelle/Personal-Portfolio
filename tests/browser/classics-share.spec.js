const { expect, test } = require('./fixtures');

for (const [mode, title] of [['memory', 'Memory Match'], ['2048', '2048'], ['invalid', 'Heads or Tails']]) {
  test(`share the selected Classics game from ${mode}`, async ({ page, baseURL }) => {
    const route = '/minigame/retro-classics/index.html';
    await page.goto(`${route}?game=${mode}&ignored=1#unrelated`);
    await page.getByRole('navigation', { name: 'Arcade navigation' })
      .getByRole('button', { name: 'Share' }).click();

    const link = page.getByLabel('Shareable game link');
    await expect(link).toHaveValue(`${baseURL}${route}?game=${mode === 'invalid' ? 'coin' : mode}`);
    await page.goto(await link.inputValue());
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  });
}
