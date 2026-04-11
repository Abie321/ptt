import sys
from playwright.sync_api import sync_playwright

def main():
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Go to the local server
            page.goto("http://localhost:8080")

            # Start game directly to level 1
            page.evaluate("""
                if (window.game && window.game.scene) {
                    const scenes = window.game.scene.scenes;
                    const mainScene = scenes[0];
                    GameConfig.LEVELS[0].cutscene = null;
                    mainScene.scene.start('GameScene', { levelConfig: GameConfig.LEVELS[0] });
                }
            """)

            # Wait for GameScene to initialize
            page.wait_for_timeout(1000)

            # Force advance player to tier 3
            page.evaluate("""
                const gameScene = window.game.scene.getScene('GameScene');
                if (gameScene && gameScene.player) {
                    gameScene.player.internalSize = 150;
                    gameScene.player.advanceTier(gameScene.player.calculateTier());
                    gameScene.cameras.main.setZoom(0.3); // zoom out a lot to see everything
                }
            """)

            # Wait for tier transition to finish
            page.wait_for_timeout(2000)

            page.screenshot(path="/home/jules/verification/screenshots/verification2.png")
            print("Screenshot saved to /home/jules/verification/screenshots/verification2.png")
            browser.close()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
