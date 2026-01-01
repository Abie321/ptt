const fs = require('fs');
const path = require('path');

// Load required classes
const playerPath = path.join(__dirname, '../js/entities/Player.js');
const itemPath = path.join(__dirname, '../js/entities/EdibleItem.js');
const hazardPath = path.join(__dirname, '../js/entities/Hazard.js');
const scenePath = path.join(__dirname, '../js/scenes/GameScene.js');

const playerCode = fs.readFileSync(playerPath, 'utf8').replace('class Player', 'global.Player = class Player');
const itemCode = fs.readFileSync(itemPath, 'utf8').replace('class EdibleItem', 'global.EdibleItem = class EdibleItem');
const hazardCode = fs.readFileSync(hazardPath, 'utf8').replace('class Hazard', 'global.Hazard = class Hazard');
const sceneCode = fs.readFileSync(scenePath, 'utf8').replace('class GameScene', 'global.GameScene = class GameScene');

eval(playerCode);
eval(itemCode);
eval(hazardCode);
eval(sceneCode);

describe('UI and HUD Elements', () => {
  let gameScene;

  beforeEach(() => {
    gameScene = new GameScene();
    gameScene.create();
  });

  describe('HUD Initialization', () => {
    test('should create all HUD elements', () => {
      expect(gameScene.sizeText).toBeDefined();
      expect(gameScene.progressBarBg).toBeDefined();
      expect(gameScene.progressBar).toBeDefined();
      expect(gameScene.scoreText).toBeDefined();
      expect(gameScene.timerText).toBeDefined();
    });

    test('should initialize HUD elements with scroll factor 0', () => {
      // HUD should be fixed to camera
      expect(gameScene.sizeText.setScrollFactor).toHaveBeenCalledWith(0);
      expect(gameScene.progressBarBg.setScrollFactor).toHaveBeenCalledWith(0);
      expect(gameScene.progressBar.setScrollFactor).toHaveBeenCalledWith(0);
      expect(gameScene.scoreText.setScrollFactor).toHaveBeenCalledWith(0);
      expect(gameScene.timerText.setScrollFactor).toHaveBeenCalledWith(0);
    });
  });

  describe('Size Indicator', () => {
    test('should display current tier name', () => {
      gameScene.updateHUD();

      const text = gameScene.sizeText.setText.mock.calls[
        gameScene.sizeText.setText.mock.calls.length - 1
      ][0];

      expect(text).toContain('Micro');
      expect(text).toContain('Tier 1');
    });

    test('should update when tier changes', () => {
      // Advance to tier 2
      const quota = GameConfig.SIZE_TIERS[0].quota;
      for (let i = 0; i < quota; i++) {
        gameScene.player.consume({ tier: 1, itemType: i });
      }

      gameScene.updateHUD();

      const text = gameScene.sizeText.setText.mock.calls[
        gameScene.sizeText.setText.mock.calls.length - 1
      ][0];

      expect(text).toContain('Tiny');
      expect(text).toContain('Tier 2');
    });

    test('should show all tier names correctly', () => {
      const tierNames = ['Micro', 'Tiny', 'Small', 'Medium', 'Large'];

      tierNames.forEach((name, index) => {
        const tierConfig = GameConfig.SIZE_TIERS[index];
        expect(tierConfig.name).toBe(name);
      });
    });

    test('should be positioned in top-left area', () => {
      expect(gameScene.sizeText.x).toBeLessThan(100);
      expect(gameScene.sizeText.y).toBeLessThan(100);
    });
  });

  describe('Progress Bar', () => {
    test('should have background and foreground bars', () => {
      expect(gameScene.progressBarBg).toBeDefined();
      expect(gameScene.progressBar).toBeDefined();
    });

    test('should start with 0 width', () => {
      expect(gameScene.progressBar.width).toBe(0);
    });

    test('should increase width as player consumes items', () => {
      gameScene.player.consumedInTier = 5;
      gameScene.updateHUD();

      expect(gameScene.progressBar.width).toBeGreaterThan(0);
    });

    test('should fill to 200px width at 100% progress', () => {
      const quota = GameConfig.SIZE_TIERS[0].quota;
      gameScene.player.consumedInTier = quota;

      gameScene.updateHUD();

      expect(gameScene.progressBar.width).toBe(200);
    });

    test('should show 50% width at 50% progress', () => {
      const quota = GameConfig.SIZE_TIERS[0].quota;
      gameScene.player.consumedInTier = Math.floor(quota / 2);

      gameScene.updateHUD();

      expect(gameScene.progressBar.width).toBeCloseTo(100, 0);
    });

    test('should reset when advancing tiers', () => {
      // Fill progress bar
      const quota = GameConfig.SIZE_TIERS[0].quota;
      gameScene.player.consumedInTier = quota;
      gameScene.updateHUD();
      expect(gameScene.progressBar.width).toBe(200);

      // Advance tier
      gameScene.player.advanceTier();
      gameScene.updateHUD();

      // Progress should reset
      expect(gameScene.progressBar.width).toBe(0);
    });

    test('should be positioned below size indicator', () => {
      expect(gameScene.progressBarBg.y).toBeGreaterThan(gameScene.sizeText.y);
    });
  });

  describe('Score Display', () => {
    test('should display current score', () => {
      gameScene.score = 1234;
      gameScene.updateHUD();

      const text = gameScene.scoreText.setText.mock.calls[
        gameScene.scoreText.setText.mock.calls.length - 1
      ][0];

      expect(text).toContain('Score:');
      expect(text).toContain('1234');
    });

    test('should start at 0', () => {
      gameScene.updateHUD();

      const text = gameScene.scoreText.setText.mock.calls[
        gameScene.scoreText.setText.mock.calls.length - 1
      ][0];

      expect(text).toContain('0');
    });

    test('should update when score changes', () => {
      gameScene.score = 500;
      gameScene.updateHUD();

      let text = gameScene.scoreText.setText.mock.calls[
        gameScene.scoreText.setText.mock.calls.length - 1
      ][0];
      expect(text).toContain('500');

      gameScene.score = 1000;
      gameScene.updateHUD();

      text = gameScene.scoreText.setText.mock.calls[
        gameScene.scoreText.setText.mock.calls.length - 1
      ][0];
      expect(text).toContain('1000');
    });

    test('should handle negative scores from hazard penalties', () => {
      gameScene.score = -80;
      gameScene.updateHUD();

      const text = gameScene.scoreText.setText.mock.calls[
        gameScene.scoreText.setText.mock.calls.length - 1
      ][0];

      expect(text).toContain('-80');
    });

    test('should be positioned in top-right area', () => {
      expect(gameScene.scoreText.setOrigin).toHaveBeenCalledWith(1, 0);
    });
  });

  describe('Timer Display', () => {
    test('should display elapsed time', () => {
      gameScene.updateHUD();

      const text = gameScene.timerText.setText.mock.calls[
        gameScene.timerText.setText.mock.calls.length - 1
      ][0];

      expect(text).toContain('Time:');
      expect(text).toMatch(/\d+:\d{2}/);
    });

    test('should format seconds with leading zero', () => {
      gameScene.startTime = Date.now() - 5000; // 5 seconds ago
      gameScene.updateHUD();

      const text = gameScene.timerText.setText.mock.calls[
        gameScene.timerText.setText.mock.calls.length - 1
      ][0];

      expect(text).toContain('0:05');
    });

    test('should format minutes and seconds correctly', () => {
      gameScene.startTime = Date.now() - 125000; // 2 minutes 5 seconds
      gameScene.updateHUD();

      const text = gameScene.timerText.setText.mock.calls[
        gameScene.timerText.setText.mock.calls.length - 1
      ][0];

      expect(text).toContain('2:05');
    });

    test('should handle times over 10 minutes', () => {
      gameScene.startTime = Date.now() - 650000; // 10 minutes 50 seconds
      gameScene.updateHUD();

      const text = gameScene.timerText.setText.mock.calls[
        gameScene.timerText.setText.mock.calls.length - 1
      ][0];

      expect(text).toContain('10:50');
    });

    test('should be positioned below score', () => {
      expect(gameScene.timerText.y).toBeGreaterThan(gameScene.scoreText.y);
    });

    test('should be right-aligned', () => {
      expect(gameScene.timerText.setOrigin).toHaveBeenCalledWith(1, 0);
    });
  });

  describe('HUD Layout', () => {
    test('should position elements to not overlap', () => {
      // Left side elements
      expect(gameScene.sizeText.y).toBeLessThan(gameScene.progressBarBg.y);

      // Right side elements
      expect(gameScene.scoreText.y).toBeLessThan(gameScene.timerText.y);
    });

    test('should use consistent styling', () => {
      // All text elements should be created with styles
      expect(gameScene.add.text).toHaveBeenCalled();

      const calls = gameScene.add.text.mock.calls;
      calls.forEach(call => {
        const style = call[3];
        expect(style).toBeDefined();
        expect(style.fontSize).toBeDefined();
        expect(style.fill).toBeDefined();
      });
    });
  });

  describe('HUD Updates', () => {
    test('should update all elements each frame', () => {
      gameScene.sizeText.setText.mockClear();
      gameScene.scoreText.setText.mockClear();
      gameScene.timerText.setText.mockClear();

      gameScene.updateHUD();

      expect(gameScene.sizeText.setText).toHaveBeenCalled();
      expect(gameScene.scoreText.setText).toHaveBeenCalled();
      expect(gameScene.timerText.setText).toHaveBeenCalled();
    });

    test('should reflect real-time game state', () => {
      // Initial state
      gameScene.updateHUD();
      let scoreText = gameScene.scoreText.setText.mock.calls[
        gameScene.scoreText.setText.mock.calls.length - 1
      ][0];
      expect(scoreText).toContain('0');

      // After consuming item
      gameScene.player.consume({ tier: 1, itemType: 0 });
      gameScene.score += 80;
      gameScene.updateHUD();

      scoreText = gameScene.scoreText.setText.mock.calls[
        gameScene.scoreText.setText.mock.calls.length - 1
      ][0];
      expect(scoreText).toContain('80');
    });
  });

  describe('Progress Bar Colors', () => {
    test('should have distinct background and foreground colors', () => {
      // Background should be dark (0x333333)
      const bgCall = gameScene.add.rectangle.mock.calls.find(
        call => call[4] === 0x333333
      );
      expect(bgCall).toBeDefined();

      // Foreground should be green (0x4CAF50)
      const fgCall = gameScene.add.rectangle.mock.calls.find(
        call => call[4] === 0x4CAF50
      );
      expect(fgCall).toBeDefined();
    });
  });

  describe('Tier Color Coding', () => {
    test('should have unique colors for each tier', () => {
      const colors = GameConfig.SIZE_TIERS.map(tier => tier.color);
      const uniqueColors = new Set(colors);

      expect(uniqueColors.size).toBe(5);
    });

    test('should have defined colors for all tiers', () => {
      GameConfig.SIZE_TIERS.forEach(tier => {
        expect(tier.color).toBeDefined();
        expect(typeof tier.color).toBe('number');
      });
    });
  });
});
