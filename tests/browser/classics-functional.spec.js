const { expect, test } = require('./classics-fixtures');

test('Memory Match completes, persists its device best, and restarts', async ({ page, openClassic }) => {
  await openClassic('memory', Array.from({ length: 15 }, (_, index) => 15 - index));
  const cards = page.locator('.memory button');
  await expect(cards).toHaveCount(16);
  for (let index = 0; index < 8; index++) {
    await cards.nth(index).click();
    await cards.nth(index + 8).click();
  }
  await expect(page.locator('#round')).toHaveText('8/8');
  await expect(page.locator('#status')).toContainText('Game complete!');
  await expect(page.locator('#best')).toHaveText('800');
  await page.getByRole('button', { name: 'New game' }).click();
  await expect(page.locator('#round')).toHaveText('0/8');
  await expect(page.locator('.memory .matched')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#best')).toHaveText('800');
});

test('2048 merges tiles with desktop keyboard or mobile touch and retains its best', async ({ page, isMobile, openClassic }) => {
  await openClassic('2048', [1]);
  if (isMobile) await page.getByRole('button', { name: 'Left' }).tap();
  else await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.tile2048').first()).toHaveText('4');
  await expect(page.locator('#score')).toHaveText('4');
  await page.getByRole('button', { name: 'New game' }).click();
  await expect(page.locator('#score')).toHaveText('0');
  await page.reload();
  await expect(page.locator('#best')).toHaveText('4');
});

test('Simon Says increases sequence length and ends on a wrong input', async ({ page, openClassic }) => {
  await page.clock.install();
  await openClassic('simon', [0]);
  const watch = page.getByRole('button', { name: 'Watch sequence' });
  const red = page.getByRole('button', { name: 'Red', exact: true });
  await watch.click();
  await page.clock.runFor(1000);
  await red.click();
  await expect(page.locator('#score')).toHaveText('1');

  await watch.click();
  await page.clock.runFor(1650);
  await red.click();
  await expect(page.locator('#score')).toHaveText('1');
  await red.click();
  await expect(page.locator('#score')).toHaveText('2');

  await watch.click();
  await page.clock.runFor(2300);
  await page.getByRole('button', { name: 'Blue', exact: true }).click();
  await expect(page.locator('#status')).toContainText('Wrong color');
  await page.getByRole('button', { name: 'New game' }).click();
  await expect(page.locator('#score')).toHaveText('0');
});

test('Reaction Time rejects an early tap and finishes after five attempts', async ({ page, openClassic }) => {
  await page.clock.install();
  await openClassic('reaction', [0]);
  const start = page.getByRole('button', { name: 'Start attempt' });
  await start.click();
  await page.getByRole('button', { name: 'WAIT…', exact: true }).click();
  await expect(page.locator('#status')).toContainText('Too early!');
  await expect(page.locator('#score')).toHaveText('0');
  for (let attempt = 2; attempt <= 5; attempt++) {
    await start.click();
    await page.clock.runFor(1200);
    await page.getByRole('button', { name: 'TAP NOW!', exact: true }).click();
    await expect(page.locator('#round')).toHaveText(`${attempt}/5`);
  }
  await expect(page.getByRole('button', { name: 'Finished', exact: true })).toBeDisabled();
  await expect(page.locator('#status')).toContainText('Game complete!');
  await page.getByRole('button', { name: 'New game' }).click();
  await expect(start).toBeEnabled();
});

test('Rock Paper Scissors scores a tie and win, then locks a finished match', async ({ page, openClassic }) => {
  await openClassic('rps', [0]);
  const rock = page.getByRole('button', { name: 'Rock' });
  const paper = page.getByRole('button', { name: 'Paper' });
  await rock.click();
  await expect(page.locator('#status')).toContainText('Tie.');
  for (let round = 2; round <= 10; round++) await paper.click();
  await expect(page.locator('#status')).toContainText('Game complete!');
  await expect(page.locator('#score')).toHaveText('9');
  await expect(paper).toBeDisabled();
  await page.getByRole('button', { name: 'New game' }).click();
  await expect(rock).toBeEnabled();
});
