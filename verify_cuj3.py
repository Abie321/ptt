import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the local server
        await page.goto("http://localhost:8080")

        # Bypass menu and cutscene
        await page.evaluate("""
            GameConfig.LEVELS[0].cutscene = null;
            window.game.scene.scenes[0].scene.start('GameScene', {levelConfig: GameConfig.LEVELS[0]});
        """)

        # Wait for the GameScene to load and player to be available
        await page.wait_for_function("""
            window.game &&
            window.game.scene &&
            window.game.scene.getScene('GameScene') &&
            window.game.scene.getScene('GameScene').player &&
            window.game.scene.getScene('GameScene').edibleItems &&
            window.game.scene.getScene('GameScene').edibleItems[1] &&
            window.game.scene.getScene('GameScene').edibleItems[1].getChildren().length > 0
        """)

        # Advance tier to 3 (which spawns bean cans)
        await page.evaluate("""
            const gameScene = window.game.scene.getScene('GameScene');
            gameScene.player.internalSize = 150;
            const newTier = gameScene.player.calculateTier();
            gameScene.player.advanceTier(newTier);
        """)

        # Wait a moment for entities to spawn and render
        await page.wait_for_timeout(1000)

        # Zoom out camera to see the environment
        await page.evaluate("""
            const gameScene = window.game.scene.getScene('GameScene');
            gameScene.cameras.main.setZoom(0.2);
        """)

        await page.wait_for_timeout(1000)

        await page.screenshot(path="/home/jules/verification/screenshots/verification3.png", full_page=True)

        await browser.close()
        print("Screenshot saved to /home/jules/verification/screenshots/verification3.png")

asyncio.run(main())
