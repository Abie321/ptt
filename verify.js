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

        console.log("Clicking Play on Main Menu...");
        // Wait for canvas to load
        await page.waitForSelector('canvas');

        // Main Menu "Play" button is roughly centered.
        // The canvas is 800x600.
        // We can just click the center of the canvas.
        await page.mouse.click(400, 300);
        await page.waitForTimeout(1000);

        console.log("Clicking World 1 on Level Select...");
        // Level select screen. World 1 is unlocked.
        // It's in a row. Let's try clicking around x=100, y=300 (rough guess) or just click the first button.
        // From memory: "World Select UI: Features a row of 7 rectangular buttons (80x120px, 20px spacing). World 1 is unlocked and interactive"
        // Let's click at x=150, y=300
        await page.mouse.click(150, 300);
        await page.waitForTimeout(1000);

        console.log("Clicking Level 1 on Level Select Modal...");
        // Level select modal. "Level buttons are rendered as circles with a radius calculated as Math.min(width, height) / 2 (typically 30px) to fit within the original 80x60 grid layout"
        // Let's click at x=400, y=300
        await page.mouse.click(400, 300);
        await page.waitForTimeout(1000);

        console.log("In Game...");
        // Wait a bit to let the game start
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
