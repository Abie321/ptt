const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://127.0.0.1:8080');

  // We want to skip to Level 5 and advance to Tier 2 to see the streetlights we added.
  await page.waitForFunction(() => typeof window.game !== 'undefined' && window.game.scene.scenes.length > 0);

  // Need to evaluate to start Level 5 directly and skip cutscenes.
  await page.evaluate(() => {
      // Find the main menu or whatever scene is active.
      let activeScene = window.game.scene.scenes.find(s => s.sys.isActive());

      // We want Level 5 (index 4).
      GameConfig.LEVELS[4].cutscene = null;
      GameConfig.LEVELS[4].DEBUG = false;

      // Start GameScene with Level 5 config.
      activeScene.scene.start('GameScene', { levelConfig: GameConfig.LEVELS[4] });
  });

  // Wait a bit for the game scene to load and initialize.
  await page.waitForTimeout(2000);

  // Now, we are in Tier 1. We need to cheat the player's size so they immediately advance to Tier 2.
  await page.evaluate(() => {
      let gameScene = window.game.scene.scenes.find(s => s.sys.config === 'GameScene');
      if (gameScene && gameScene.player) {
          gameScene.player.size = 20; // 20 should be enough to advance to tier 2 for level 5.
          // The update loop should catch this and trigger the advance.
      }
  });

  // Wait for the tier transition (it includes a camera zoom animation).
  await page.waitForTimeout(4000);

  // Capture a screenshot.
  await page.screenshot({ path: '/home/jules/verification/screenshots/verification_patched.png' });

  await browser.close();
})();