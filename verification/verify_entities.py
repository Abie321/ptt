
from playwright.sync_api import sync_playwright
import time
import os

def verify_entities():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Point to the local file since we are in the sandbox
        # Get absolute path to index.html
        cwd = os.getcwd()
        path = f"file://{cwd}/index.html"
        print(f"Navigating to {path}")
        page.goto(path)

        # Wait for game to initialize
        time.sleep(2)

        # Take a screenshot to verify entities are visible
        page.screenshot(path='verification/entities.png')

        browser.close()

if __name__ == '__main__':
    verify_entities()
