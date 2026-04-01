const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Log all console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
    console.log(error.stack);
  });

  await page.goto('http://localhost:8080');

  // Skip Main Menu and World Select, go directly to GameScene with win condition simulation
  await page.evaluate(async () => {
    return new Promise(resolve => {
        // Wait for game to be initialized
        const checkGame = setInterval(() => {
            if (window.game && window.game.scene && window.game.scene.scenes[0]) {
                clearInterval(checkGame);

                // Jump directly to GameScene with Level 1 config
                const gameScene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
                if (gameScene) {
                     window.game.scene.start('GameScene', { levelConfig: GameConfig.LEVELS[0] });

                     // Wait a bit for GameScene to initialize
                     setTimeout(() => {
                         const scene = window.game.scene.getScene('GameScene');

                         // Manually trigger win condition check
                         scene.score = 5000;
                         scene.player = scene.player || {}; // Avoid crash
                         scene.player.internalSize = 600;
                         scene.player.size = 600;
                         scene.player.radius = 600;
                         scene.player.currentTier = 3;
                         scene.player.getLogicalSize = () => 600;

                         scene.endLevel();

                         resolve();
                     }, 1000);
                } else {
                     resolve();
                }
            }
        }, 100);
    });
  });

  await page.waitForTimeout(2000); // Give time for errors to appear

  await browser.close();
})();
