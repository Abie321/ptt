from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:8080")
    page.wait_for_timeout(1000)

    # Click Play in Main Menu
    page.evaluate("window.game.scene.scenes[0].scene.start('WorldSelectScene')")
    page.wait_for_timeout(1000)

    # Click World 1
    page.evaluate("window.game.scene.getScene('WorldSelectScene').scene.start('LevelSelectScene', {worldId: 0, worldName: 'Ghost'})")
    page.wait_for_timeout(1000)

    # Click Level 1
    page.evaluate("window.game.scene.getScene('LevelSelectScene').scene.start('LevelDetailScene', {levelConfig: GameConfig.LEVELS[0]})")
    page.wait_for_timeout(1000)

    # Bypass cover image
    page.evaluate('''
        GameConfig.LEVELS[0].coverImage = null;
        window.game.scene.getScene('LevelDetailScene').scene.start('GameScene', {levelConfig: GameConfig.LEVELS[0]});
    ''')
    page.wait_for_timeout(2000)

    # Zoom out hard and make everything visible to verify teapots are placed correctly
    page.evaluate('''
        const scene = window.game.scene.getScene('GameScene');
        if (scene && scene.cameras && scene.cameras.main) {
            scene.cameras.main.setZoom(0.3); // zoom out hard
            // make all edibles visible
            for (let tier in scene.edibleItems) {
                scene.edibleItems[tier].getChildren().forEach(i => { i.setActive(true); i.setVisible(true); });
            }
        }
    ''')

    page.wait_for_timeout(2000)

    # Wait for the scene to settle and capture screenshot
    os.makedirs('/home/jules/verification/screenshots', exist_ok=True)
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(2000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 800, 'height': 600}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
