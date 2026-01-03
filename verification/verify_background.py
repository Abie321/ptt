from playwright.sync_api import sync_playwright

def verify_background():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the game
        print("Navigating to game...")
        page.goto("http://localhost:8081")

        # Wait for canvas to be present
        print("Waiting for canvas...")
        page.wait_for_selector("canvas")

        # Wait for the PLAY button text to be visible and click it
        # Since it's a canvas, we can't select "text" easily with get_by_text if it's drawn on canvas unless accessible.
        # But Phaser doesn't automatically make text accessible.
        # So we simulate a click in the center where the button is.
        # The button is at width/2, height/2. Default game size is 800x600?
        # config.js says WORLD is 1600x1200, but main.js sets the game size.

        # Let's check main.js for game size.
        # Assuming 800x600 for now.

        # Actually, clicking center of screen is a safe bet for the PLAY button.
        print("Clicking PLAY button (center of screen)...")
        # page.mouse.click(400, 300) # Default center?

        # Better approach: Just click the canvas center.
        canvas = page.locator("canvas")
        box = canvas.bounding_box()
        if box:
            page.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        else:
            print("Canvas not found!")

        # Wait for game to start
        print("Waiting for game to start...")
        page.wait_for_timeout(3000)

        # Take a screenshot
        output_path = "verification/background_verification.png"
        page.screenshot(path=output_path)

        print(f"Screenshot taken at {output_path}")
        browser.close()

if __name__ == "__main__":
    verify_background()
