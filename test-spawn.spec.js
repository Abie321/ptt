const { test, expect } = require('@playwright/test');

test('Check One Pound Note Placement', async ({ page }) => {
    await page.goto('http://127.0.0.1:8080');

    // Wait for the game to initialize
    await page.waitForFunction(() => window.game && window.game.scene.scenes.length > 0);

    // Bypass menu and start Level 2 immediately
    await page.evaluate(() => {
        const gameScene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
        if (gameScene) {
             const level2Config = GameConfig.LEVELS.find(l => l.id === 'level2');
             window.game.scene.scenes[0].scene.start('GameScene', { levelConfig: level2Config });
        } else {
             const level2Config = GameConfig.LEVELS.find(l => l.id === 'level2');
             window.game.scene.scenes[0].scene.start('GameScene', { levelConfig: level2Config });
        }
    });

    await page.waitForTimeout(2000); // Give it a moment to spawn entities

    // Evaluate how many "One pound note" were placed successfully vs skipped
    const logs = await page.evaluate(() => {
        const gameScene = window.game.scene.scenes.find(s => s.scene.key === 'GameScene');
        if (!gameScene || !gameScene.edibleItems) return "Scene not found";

        let notes = [];
        for (let t = 1; t <= 3; t++) {
             if (gameScene.edibleItems[t]) {
                 gameScene.edibleItems[t].getChildren().forEach(item => {
                     if (item.itemData && item.itemData.type === 'One pound note') {
                         notes.push({ x: item.x, y: item.y });
                     }
                 });
             }
        }
        return notes;
    });

    console.log("Found notes: ", logs);
    expect(logs.length).toBeGreaterThan(0);
});
