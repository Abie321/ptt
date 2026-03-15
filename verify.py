from playwright.sync_api import Page, expect, sync_playwright

def verify_feature(page: Page):
    # Navigate to the game
    page.goto("http://localhost:8080")
    page.wait_for_timeout(1000)

    # Force the game to start into GameScene directly to skip the menus
    page.evaluate("window.game.scene.scenes[0].scene.start('GameScene', {level: 1, world: 1})")
    page.wait_for_timeout(2000) # Give the scene some time to load

    # Capture a screenshot showing the player sprite size
    page.screenshot(path="/home/jules/verification/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/home/jules/verification/video")
        page = context.new_page()
        try:
            verify_feature(page)
        finally:
            context.close()
            browser.close()