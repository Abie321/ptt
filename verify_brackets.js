const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080');

  // Wait for Phaser to initialize
  await page.waitForTimeout(2000);

  // Force skip to GameScene without cutscene
  await page.evaluate(() => {
    // Modify config to remove cutscene temporarily
    GameConfig.LEVELS[0].cutscene = null;
    window.game.scene.scenes[0].scene.start('GameScene', {levelConfig: GameConfig.LEVELS[0]});
  });

  // Give GameScene time to spawn things and player
  await page.waitForFunction(() => {
    const scene = window.game && window.game.scene && window.game.scene.getScene('GameScene');
    return scene && scene.player && scene.player.sprite && scene.edibleItems;
  }, { timeout: 10000 });

  await page.evaluate(() => {
      // Force an item to be very close and strictly smaller than the player
      const scene = window.game.scene.getScene('GameScene');
      const player = scene.player;
      const playerLogicalSize = player.getLogicalSize ? player.getLogicalSize() : player.getSize();

      const ediblesGroup = scene.edibleItems[1] || scene.edibleItems[2];
      const edibles = ediblesGroup ? ediblesGroup.getChildren() : [];
      if (edibles.length > 0) {
          const item = edibles[0];
          // ensure size is smaller
          item.itemData.size = playerLogicalSize - 2;
          item.displayWidth = item.itemData.size * 2;
          item.displayHeight = item.itemData.size * 2;

          item.x = player.sprite.x + 50;
          item.y = player.sprite.y;
      }
      scene.updateClosestIndicator();
  });

  // Take screenshot
  await page.screenshot({ path: '/app/game_brackets_verification.png' });

  await browser.close();
})();
