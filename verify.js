const { syncPlaywright } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyFeature() {
    // Create verification directories
    const verificationDir = path.join('/home/jules/verification');
    const videoDir = path.join(verificationDir, 'video');
    if (!fs.existsSync(verificationDir)) {
        fs.mkdirSync(verificationDir, { recursive: true });
    }
    if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
    }

    const browser = await require('playwright').chromium.launch({ headless: true });
    const context = await browser.newContext({
        recordVideo: {
            dir: videoDir,
            size: { width: 800, height: 600 }
        }
    });

    const page = await context.newPage();

    try {
        console.log("Navigating to game...");
        await page.goto("http://localhost:8080");
        await page.waitForTimeout(1000);

        console.log("Bypassing menu...");
        await page.evaluate(() => {
            window.game.scene.scenes[0].scene.start('GameScene', {levelConfig: GameConfig.LEVELS[0]});
        });

        console.log("In Game...");
        // Wait a bit to let the game start and arrow to show up
        await page.waitForTimeout(2000);

        // Take a screenshot of the game scene to verify player size
        const screenshotPath = path.join(verificationDir, 'verification.png');
        await page.screenshot({ path: screenshotPath });
        console.log("Screenshot saved to", screenshotPath);

        await page.waitForTimeout(1000);

    } catch (e) {
        console.error("Error during Playwright script:", e);
    } finally {
        await context.close();
        await browser.close();
        console.log("Verification script finished.");
    }
}

verifyFeature();
