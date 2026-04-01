const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Make directories
const videoDir = '/home/jules/verification/videos';
const screenshotDir = '/home/jules/verification/screenshots';
fs.mkdirSync(videoDir, { recursive: true });
fs.mkdirSync(screenshotDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Create context with video recording
  const context = await browser.newContext({
    recordVideo: {
      dir: videoDir
    }
  });

  const page = await context.newPage();

  // Log all console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
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

                         // Emulate taking an action that would win
                         scene.score = 5000;
                         if (scene.player) {
                             scene.player.internalSize = 600;
                             scene.player.size = 600;
                             scene.player.radius = 600;
                             scene.player.currentTier = 3;
                             scene.player.getLogicalSize = () => 600;
                         }

                         scene.endLevel(); // Trigger end level, which used to crash

                         resolve();
                     }, 1500);
                } else {
                     resolve();
                }
            }
        }, 100);
    });
  });

  await page.waitForTimeout(1000); // Give time for transition to EndLevelScene

  // Take screenshot of the End Level Scene
  const screenshotPath = path.join(screenshotDir, 'verification.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to ${screenshotPath}`);

  await page.waitForTimeout(1000); // Hold final state for the video

  await context.close(); // MUST close context to save the video
  await browser.close();

  // Find the video file
  const files = fs.readdirSync(videoDir);
  const videoFile = files.find(f => f.endsWith('.webm'));
  if (videoFile) {
      console.log(`Video saved to ${path.join(videoDir, videoFile)}`);
  }
})();
