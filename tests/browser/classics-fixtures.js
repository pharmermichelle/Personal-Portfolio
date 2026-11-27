const { expect, test: base } = require('./fixtures');

const test = base.extend({
  openClassic: async ({ page }, use) => {
    await use(async (mode, random) => {
      await page.addInitScript(values => {
        let index = 0;
        crypto.getRandomValues = array => {
          for (let i = 0; i < array.length; i++) array[i] = values[index++ % values.length];
          return array;
        };
      }, random);
      await page.goto('/minigame/retro-classics/index.html?game=' + mode);
    });
  },
});

module.exports = { expect, test };
