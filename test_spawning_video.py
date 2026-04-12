from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:8080")
    page.wait_for_timeout(1000)

    # Click the Play button
    page.evaluate('''() => {
        window.game.scene.scenes[0].scene.start('GameScene', {levelConfig: GameConfig.LEVELS[0]});
    }''')
    page.wait_for_timeout(1000)

    # Advance to Tier 2
    page.evaluate('''() => {
        const gameScene = window.game.scene.getScene('GameScene');
        gameScene.player.internalSize = 40; // force tier 2
        gameScene.onTierAdvanced(2);
    }''')

    page.wait_for_timeout(1000)

    # Advance to Tier 3
    page.evaluate('''() => {
        const gameScene = window.game.scene.getScene('GameScene');
        gameScene.player.internalSize = 100; // force tier 3
        gameScene.onTierAdvanced(3);

        // Move player to center
        gameScene.player.sprite.x = 1400;
        gameScene.player.sprite.y = 700;
    }''')

    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(2000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
