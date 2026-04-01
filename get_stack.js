const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('pageerror', error => {
    console.log(`STACK: \n${error.stack}`);
  });
  await page.goto('http://localhost:8080');
  await page.evaluate(async () => {
    return new Promise(resolve => {
        const checkGame = setInterval(() => {
            if (window.game && window.game.scene && window.game.scene.scenes[0]) {
                clearInterval(checkGame);
                const gameScene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
                if (gameScene) {
                     window.game.scene.start('GameScene', { levelConfig: GameConfig.LEVELS[0] });
                     setTimeout(() => {
                         const scene = window.game.scene.getScene('GameScene');
                         scene.score = 5000;
                         if (scene.player) {
                             scene.player.internalSize = 600;
                             scene.player.size = 600;
                             scene.player.radius = 600;
                             scene.player.currentTier = 3;
                             scene.player.getLogicalSize = () => 600;
                         }
                         scene.endLevel();
                         resolve();
                     }, 1500);
                } else resolve();
            }
        }, 100);
    });
  });
  await page.waitForTimeout(1000);
  await browser.close();
})();
