import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Start capturing video
        await page.goto("http://localhost:8080")

        await asyncio.sleep(2)

        # Force start GameScene directly using level configuration
        await page.evaluate("""
            window.game.scene.scenes[0].scene.start('GameScene', {levelConfig: GameConfig.LEVELS[0]})
        """)

        # Wait a bit for the scene to load and the arrow to appear
        await asyncio.sleep(2)

        # Take a screenshot
        await page.screenshot(path="/home/jules/verification/screenshots/verification3.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
