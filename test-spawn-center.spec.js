const { test, expect } = require('@playwright/test');

test('Check One Pound Note Placement Distribution', async ({ page }) => {
    await page.goto('http://127.0.0.1:8080');

    await page.waitForFunction(() => window.game && window.game.scene.scenes.length > 0);

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

    await page.waitForTimeout(2000);

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
    // Check if any notes spawned in the central area (where Tier 1 items are initially dense)
    // Level 1 area is 2400x1000, which corresponds roughly to the middle of the 2800x1450 Level 2 area
    // So X: 200 - 2600, Y: 225 - 1225
    const centralNotes = logs.filter(n => n.x > 200 && n.x < 2600 && n.y > 225 && n.y < 1225);
    console.log("Central notes count: ", centralNotes.length);
    expect(centralNotes.length).toBeGreaterThan(0);
});
