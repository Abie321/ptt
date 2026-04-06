import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("http://localhost:8080")

        # Give it a moment to load
        await page.wait_for_timeout(2000)

        # Click the Play button using its known coordinate or logic.
        # Actually, let's just evaluate JS to start the game directly, safely:
        await page.evaluate("""
            // This assumes the global 'game' object exists
            const mainMenu = game.scene.getScene('MainMenuScene');
            if (mainMenu) {
                // start Level Select
                mainMenu.scene.start('LevelSelectScene', { worldIndex: 0 });
            }
        """)
        await page.wait_for_timeout(1000)

        await page.evaluate("""
            const levelSelect = game.scene.getScene('LevelSelectScene');
            if (levelSelect) {
                // By-pass the comic
                levelSelect.scene.start('GameScene', { levelConfig: GameConfig.LEVELS[0] });
            }
        """)

        await page.wait_for_timeout(3000)

        # Take screenshot of the game
        await page.screenshot(path="/home/jules/verification/screenshots/verification_game.png")
        print("Screenshot saved to /home/jules/verification/screenshots/verification_game.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
