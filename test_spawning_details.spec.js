const { test, expect } = require('@playwright/test');
test('Waiters and Customers spawn details', async ({ page }) => {
    await page.goto('http://localhost:8080');
    // Start game
    await page.waitForFunction(() => typeof GameConfig !== 'undefined');
    await page.evaluate(() => {
        GameConfig.LEVELS[0].cutscene = null;
        window.game.scene.scenes[0].scene.start('GameScene', {levelConfig: GameConfig.LEVELS[0]});
    });

    await page.waitForTimeout(2000);
    // Advance to tier 2
    let details = await page.evaluate(() => {
        const gameScene = window.game.scene.getScene('GameScene');
        gameScene.player.internalSize = 100; // force tier 3
        gameScene.onTierAdvanced(3);
        return {
            hazardCount: gameScene.hazards.getChildren().filter(h => h.hazardData && h.hazardData.tier === 3).length,
            edibleCount: gameScene.edibleItems[3] ? gameScene.edibleItems[3].getChildren().length : 0,
        };
    });

    console.log("Tier 3 items spawned during Tier 3: ", details);
});
