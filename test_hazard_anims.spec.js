const { test, expect } = require('@playwright/test');
test('Waiters and Customers animations', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    await page.goto('http://localhost:8080');
    // Start game
    await page.waitForFunction(() => typeof GameConfig !== 'undefined');
    await page.evaluate(() => {
        GameConfig.LEVELS[0].cutscene = null;

        // Let's modify createHazardAnimations to log what it's doing
        const originalCreateHazardAnimations = window.GameScene.prototype.createHazardAnimations;
        window.GameScene.prototype.createHazardAnimations = function() {
            console.log("Calling createHazardAnimations");
            if (!this.levelConfig.TIER_ENTITIES) {
                console.log("NO TIER ENTITIES");
                return;
            }
            for (const tier in this.levelConfig.TIER_ENTITIES) {
                console.log("Checking tier:", tier);
                for (const entity of this.levelConfig.TIER_ENTITIES[tier]) {
                    console.log("Checking entity:", entity.type, "isHazard:", entity.isHazard, "SPRITE:", entity.SPRITE ? "yes" : "no");
                    if (entity.isHazard && entity.SPRITE && entity.SPRITE.USE_SPRITESHEET && entity.SPRITE.ANIMATIONS) {
                        const anims = entity.SPRITE.ANIMATIONS;
                        for (const [key, config] of Object.entries(anims)) {
                            const direction = key.toLowerCase();
                            const animKey = `${entity.type.replace(/\s+/g, '_').toLowerCase()}_${direction}`;
                            console.log("Creating anim:", animKey);
                            if (!this.anims.exists(animKey)) {
                                try {
                                    this.anims.create({
                                        key: animKey,
                                        frames: this.anims.generateFrameNumbers(entity.SPRITE.KEY, config),
                                        frameRate: config.rate,
                                        repeat: -1
                                    });
                                } catch (e) {
                                    console.error("Error creating anim:", e);
                                }
                            }
                        }
                    }
                }
            }
            originalCreateHazardAnimations.call(this);
        };

        window.game.scene.scenes[0].scene.start('GameScene', {levelConfig: GameConfig.LEVELS[0]});
    });

    await page.waitForTimeout(2000);
    // Check if animations exist
    let anims = await page.evaluate(() => {
        const gameScene = window.game.scene.getScene('GameScene');
        return {
            waiter_down: gameScene.anims.exists('waiter_down'),
            customer_down: gameScene.anims.exists('customer_down')
        };
    });

    console.log("Animations: ", anims);
});
