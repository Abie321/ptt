const fs = require('fs');
const path = require('path');

// Load all required classes
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

describe('GameScene', () => {
  let gameScene;

  beforeEach(() => {
    gameScene = new GameScene();

    // Initialize groups manually to mock them before create()
    // create() will overwrite them but we can mock the values if we mock the add.group function
    // However, GameScene.js calls this.add.group() inside create().

    // We need to intercept the groups AFTER create() calls this.add.group() but BEFORE it calls checkWinnability()?
    // Impossible in synchronous code.

    // Solution: Mock this.add.group implementation in the test setup for this suite?
    // tests/setup.js defines global.Phaser.Scene ... this.add.group

    // We can just rely on the fact that we can modify the mock implementation of countActive *after* create()
    // and then manually reset gameEnded to false if we want to proceed with a "valid" game state test.

    gameScene.create();

    // Default to a winnable state for most tests
    for (let t = 1; t <= 5; t++) {
        if (gameScene.edibleItems[t]) {
             gameScene.edibleItems[t].countActive.mockReturnValue(50);
        }
    }
    // Force game not ended
    gameScene.gameEnded = false;
    gameScene.physics.pause.mockClear(); // Clear any pause called by impossible warning
  });

  describe('Initialization', () => {
    test('should initialize with score of 0', () => {
      expect(gameScene.score).toBe(0);
    });

    test('should track start time', () => {
      expect(gameScene.startTime).toBeDefined();
      expect(typeof gameScene.startTime).toBe('number');
    });

    test('should not be ended initially', () => {
      expect(gameScene.gameEnded).toBe(false);
    });

    test('should create a player', () => {
      expect(gameScene.player).toBeDefined();
      expect(gameScene.player).toBeInstanceOf(Player);
    });

    test('should set up physics world bounds', () => {
      expect(gameScene.physics.world.setBounds).toHaveBeenCalledWith(
        0, 0, GameConfig.WORLD.WIDTH, GameConfig.WORLD.HEIGHT
      );
    });
  });

  describe('Asset Loading', () => {
    test('should preload background image', () => {
        gameScene.preload();
        expect(gameScene.load.image).toHaveBeenCalledWith('background', GameConfig.ASSETS.BACKGROUND_IMAGE);
    });

    test('should create background image', () => {
        // Checking if add.image was called with correct parameters
        // The mock setup clears after each test in most setups, but here we're inside beforeEach which runs create()
        // so add.image should have been called.
        expect(gameScene.add.image).toHaveBeenCalledWith(
            GameConfig.WORLD.WIDTH / 2,
            GameConfig.WORLD.HEIGHT / 2,
            'background'
        );
    });
  });

  describe('Camera System', () => {
    test('should set camera bounds to world size', () => {
      expect(gameScene.cameras.main.setBounds).toHaveBeenCalledWith(
        0, 0, GameConfig.WORLD.WIDTH, GameConfig.WORLD.HEIGHT
      );
    });

    test('should start following player', () => {
      expect(gameScene.cameras.main.startFollow).toHaveBeenCalledWith(
        gameScene.player.sprite,
        true,
        0.1,
        0.1
      );
    });

    test('should start with zoom level 1', () => {
      expect(gameScene.cameras.main.setZoom).toHaveBeenCalledWith(1);
    });

    test('should zoom out when player advances tiers', () => {
      gameScene.cameras.main.setZoom.mockClear();

      const tier2Config = GameConfig.SIZE_TIERS[1];
      gameScene.onTierAdvanced(2);

      expect(gameScene.cameras.main.setZoom).toHaveBeenCalledWith(tier2Config.zoom);
    });

    test('should flash camera on tier advancement', () => {
      gameScene.onTierAdvanced(2);

      expect(gameScene.cameras.main.flash).toHaveBeenCalledWith(500, 255, 255, 255);
    });
  });

  describe('Item Spawning', () => {
    test('should spawn edible items for all tiers', () => {
      for (let tier = 1; tier <= 5; tier++) {
        expect(gameScene.edibleItems[tier]).toBeDefined();
      }
    });

    test('should spawn correct number of items per tier', () => {
      // Check that items were added to groups
      expect(gameScene.edibleItems[1]).toBeDefined();
      expect(gameScene.edibleItems[1].add).toHaveBeenCalled();
    });

    test('should spawn hazards', () => {
      expect(gameScene.hazards).toBeDefined();
      expect(gameScene.hazards.add).toHaveBeenCalled();
    });
  });

  describe('Tier Advancement System', () => {
    test('should despawn tier N-2 items when advancing', () => {
      gameScene.edibleItems[1].clear.mockClear();

      gameScene.onTierAdvanced(3);

      expect(gameScene.edibleItems[1].clear).toHaveBeenCalledWith(true, true);
    });

    test('should not despawn items from invalid tiers', () => {
      gameScene.onTierAdvanced(2);

      // Tier 0 doesn't exist, so no error should occur
      expect(() => gameScene.onTierAdvanced(2)).not.toThrow();
    });

    test('should listen for tierAdvanced event', () => {
      expect(gameScene.events.on).toHaveBeenCalledWith(
        'tierAdvanced',
        gameScene.onTierAdvanced,
        gameScene
      );
    });
  });

  describe('HUD Elements', () => {
    test('should create size indicator text', () => {
      expect(gameScene.sizeText).toBeDefined();
    });

    test('should create progress bar', () => {
      expect(gameScene.progressBarBg).toBeDefined();
      expect(gameScene.progressBar).toBeDefined();
    });

    test('should create score text', () => {
      expect(gameScene.scoreText).toBeDefined();
    });

    test('should create timer text', () => {
      expect(gameScene.timerText).toBeDefined();
    });

    test('should update size text during gameplay', () => {
      gameScene.updateHUD();

      expect(gameScene.sizeText.setText).toHaveBeenCalled();
      const text = gameScene.sizeText.setText.mock.calls[
        gameScene.sizeText.setText.mock.calls.length - 1
      ][0];
      expect(text).toContain('Size:');
      expect(text).toContain('Tier');
    });

    test('should update progress bar based on growth', () => {
      // Tier 1 start 20. Tier 2 start 30.
      // Set radius to 25 (50% progress)
      gameScene.player.size = 25;
      gameScene.player.internalSize = 25;
      gameScene.player.radius = 25;
      gameScene.updateHUD();

      expect(gameScene.progressBar.width).toBeGreaterThan(0);
    });

    test('should update score display', () => {
      gameScene.score = 1234;
      gameScene.updateHUD();

      expect(gameScene.scoreText.setText).toHaveBeenCalled();
      const text = gameScene.scoreText.setText.mock.calls[
        gameScene.scoreText.setText.mock.calls.length - 1
      ][0];
      expect(text).toContain('1234');
    });

    test('should update timer display', () => {
      gameScene.updateHUD();

      expect(gameScene.timerText.setText).toHaveBeenCalled();
      const text = gameScene.timerText.setText.mock.calls[
        gameScene.timerText.setText.mock.calls.length - 1
      ][0];
      expect(text).toContain('Time:');
    });

    test('should format timer correctly (MM:SS)', () => {
      gameScene.startTime = Date.now() - 125000; // 2 minutes 5 seconds ago
      gameScene.updateHUD();

      const text = gameScene.timerText.setText.mock.calls[
        gameScene.timerText.setText.mock.calls.length - 1
      ][0];
      expect(text).toMatch(/Time: \d+:\d{2}/);
    });
  });

  describe('Consumption Mechanics', () => {
    test('should check for consumption each frame', () => {
      const spy = jest.spyOn(gameScene, 'checkConsumption');
      gameScene.update();

      expect(spy).toHaveBeenCalled();
    });

    test('should award points when consuming items', () => {
      const initialScore = gameScene.score;

      // Mock an item in range (at mouth position)
      const mouthPos = gameScene.player.getMouthPosition();
      const mockItem = {
        x: mouthPos.x,
        y: mouthPos.y,
        active: true,
        displayWidth: 20,
        itemData: { tier: 1, itemType: 0 },
        destroy: jest.fn()
      };

      gameScene.edibleItems[1].getChildren = jest.fn(() => [mockItem]);
      gameScene.checkConsumption();

      expect(gameScene.score).toBeGreaterThan(initialScore);
    });

    test('should NOT consume item if player is not larger than item', () => {
      const initialScore = gameScene.score;
      const mouthPos = gameScene.player.getMouthPosition();

      // Player radius 20. Item radius 20 (equal).
      const mockItem = {
        x: mouthPos.x,
        y: mouthPos.y,
        active: true,
        radius: 20,
        itemData: { tier: 1, itemType: 0 },
        destroy: jest.fn()
      };

      gameScene.edibleItems[1].getChildren = jest.fn(() => [mockItem]);
      gameScene.checkConsumption();

      expect(gameScene.score).toBe(initialScore);
      expect(mockItem.destroy).not.toHaveBeenCalled();
    });
  });

  describe('Hazard Collision System', () => {
    test('should check for hazard collisions each frame', () => {
      const spy = jest.spyOn(gameScene, 'checkHazardCollisions');
      gameScene.update();

      expect(spy).toHaveBeenCalled();
    });

    test('should deduct points when hitting hazard (Player smaller than hazard)', () => {
      gameScene.score = 1000;
      // Player radius ~20.

      // Mock a hazard in range that's dangerous (larger)
      const mockHazard = {
        x: gameScene.player.sprite.x,
        y: gameScene.player.sprite.y,
        active: true,
        radius: 30, // Larger than player
        hazardData: { tier: 3 },
        destroy: jest.fn()
      };

      gameScene.hazards.getChildren = jest.fn(() => [mockHazard]);
      gameScene.checkHazardCollisions();

      expect(gameScene.score).toBeLessThan(1000);
    });

    test('should shake camera when hitting hazard', () => {
      gameScene.cameras.main.shake.mockClear();

      const mockHazard = {
        x: gameScene.player.sprite.x,
        y: gameScene.player.sprite.y,
        active: true,
        radius: 30, // Larger
        hazardData: { tier: 5 },
        destroy: jest.fn()
      };

      gameScene.hazards.getChildren = jest.fn(() => [mockHazard]);
      gameScene.checkHazardCollisions();

      expect(gameScene.cameras.main.shake).toHaveBeenCalled();
    });

    test('should consume and award points for smaller hazards', () => {
      gameScene.score = 1000;

      // Player radius ~20.
      // Mock hazard smaller than player
      const mockHazard = {
        x: gameScene.player.sprite.x,
        y: gameScene.player.sprite.y,
        active: true,
        radius: 10, // Smaller
        hazardData: { tier: 2 },
        destroy: jest.fn()
      };

      gameScene.hazards.getChildren = jest.fn(() => [mockHazard]);
      gameScene.checkHazardCollisions();

      // Score should increase (hazard consumed)
      expect(gameScene.score).toBeGreaterThan(1000);
      expect(mockHazard.destroy).toHaveBeenCalled();
    });

    test('should damage player if size is equal', () => {
      gameScene.score = 1000;

      const mockHazard = {
        x: gameScene.player.sprite.x,
        y: gameScene.player.sprite.y,
        active: true,
        radius: 20, // Equal to player (20)
        hazardData: { tier: 3 },
        destroy: jest.fn()
      };

      gameScene.hazards.getChildren = jest.fn(() => [mockHazard]);
      gameScene.checkHazardCollisions();

      expect(gameScene.score).toBeLessThan(1000);
      expect(mockHazard.destroy).not.toHaveBeenCalled();
    });
  });

  describe('Win Condition', () => {
    test('should check win condition each frame', () => {
      const spy = jest.spyOn(gameScene, 'checkWinCondition');
      gameScene.update();

      expect(spy).toHaveBeenCalled();
    });

    test('should end level when reaching max tier target size', () => {
      // Max Tier is 5.
      gameScene.player.currentTier = 5;
      gameScene.player.size = 1000;
      gameScene.player.internalSize = 1000; // Ensure internal size is also huge
      gameScene.player.radius = 1000; // Huge

      const spy = jest.spyOn(gameScene, 'endLevel');
      gameScene.checkWinCondition();

      expect(spy).toHaveBeenCalled();
    });

    test('should not end level before max tier', () => {
      gameScene.player.currentTier = 4;
      gameScene.player.size = 1000;
      gameScene.player.internalSize = 1000;
      gameScene.player.radius = 1000; // Huge but tier not advanced (should technically be 5 if radius is huge, but checkWinCondition checks currentTier property first)

      const spy = jest.spyOn(gameScene, 'endLevel');
      gameScene.checkWinCondition();

      expect(spy).not.toHaveBeenCalled();
    });

    test('should not end level if max tier target not met', () => {
      gameScene.player.currentTier = 5;
      // Set radius to exactly start of Tier 5. Progress should be 0.
      const tier5Config = GameConfig.SIZE_TIERS[4];
      const threshold = tier5Config.threshold || (GameConfig.PLAYER.INITIAL_SIZE * tier5Config.scale);

      gameScene.player.size = threshold;
      gameScene.player.internalSize = threshold;
      gameScene.player.radius = threshold;

      const spy = jest.spyOn(gameScene, 'endLevel');
      gameScene.checkWinCondition();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Star Rating System', () => {
    test('should award 0 stars for low scores', () => {
      gameScene.score = 100;
      gameScene.player.currentTier = 5;
      gameScene.player.consumedInTier = GameConfig.SIZE_TIERS[4].quota;

      gameScene.endLevel();

      expect(gameScene.scene.start).toHaveBeenCalled();
      const sceneData = gameScene.scene.start.mock.calls[0][1];
      expect(sceneData.stars).toBe(0);
    });

    test('should award 1 star for scores >= 500', () => {
      gameScene.score = 600;
      gameScene.player.currentTier = 5;
      gameScene.player.consumedInTier = GameConfig.SIZE_TIERS[4].quota;

      gameScene.endLevel();

      const sceneData = gameScene.scene.start.mock.calls[0][1];
      expect(sceneData.stars).toBe(1);
    });

    test('should award 2 stars for scores >= 1500', () => {
      gameScene.score = 2000;
      gameScene.player.currentTier = 5;
      gameScene.player.consumedInTier = GameConfig.SIZE_TIERS[4].quota;

      gameScene.endLevel();

      const sceneData = gameScene.scene.start.mock.calls[0][1];
      expect(sceneData.stars).toBe(2);
    });

    test('should award 3 stars for scores >= 3000', () => {
      gameScene.score = 3500;
      gameScene.player.currentTier = 5;
      gameScene.player.consumedInTier = GameConfig.SIZE_TIERS[4].quota;

      gameScene.endLevel();

      const sceneData = gameScene.scene.start.mock.calls[0][1];
      expect(sceneData.stars).toBe(3);
    });
  });

  describe('End Level Transition', () => {
    test('should transition to EndLevelScene when level ends', () => {
      gameScene.player.currentTier = 5;
      gameScene.player.consumedInTier = GameConfig.SIZE_TIERS[4].quota;

      gameScene.endLevel();

      expect(gameScene.scene.start).toHaveBeenCalledWith(
        'EndLevelScene',
        expect.any(Object)
      );
    });

    test('should pass score data to end scene', () => {
      gameScene.score = 2500;
      gameScene.player.currentTier = 5;
      gameScene.player.consumedInTier = GameConfig.SIZE_TIERS[4].quota;

      gameScene.endLevel();

      const sceneData = gameScene.scene.start.mock.calls[0][1];
      expect(sceneData.score).toBe(2500);
    });

    test('should pass time data to end scene', () => {
      gameScene.player.currentTier = 5;
      gameScene.player.consumedInTier = GameConfig.SIZE_TIERS[4].quota;

      gameScene.endLevel();

      const sceneData = gameScene.scene.start.mock.calls[0][1];
      expect(sceneData.time).toBeDefined();
      expect(typeof sceneData.time).toBe('number');
    });

    test('should not end level twice', () => {
      gameScene.player.currentTier = 5;
      gameScene.player.consumedInTier = GameConfig.SIZE_TIERS[4].quota;

      gameScene.endLevel();
      const firstCallCount = gameScene.scene.start.mock.calls.length;

      gameScene.endLevel();
      const secondCallCount = gameScene.scene.start.mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount);
    });
  });

  describe('Pause Functionality', () => {
    test('should pause scene when ESC is pressed', () => {
      const escCallback = gameScene.input.keyboard.on.mock.calls.find(
        call => call[0] === 'keydown-ESC'
      )[1];

      escCallback();

      expect(gameScene.scene.pause).toHaveBeenCalled();
    });
  });

  describe('Game Loop', () => {
    test('should not update when game has ended', () => {
      gameScene.gameEnded = true;

      const spy = jest.spyOn(gameScene.player, 'update');
      gameScene.update();

      expect(spy).not.toHaveBeenCalled();
    });

    test('should update player each frame', () => {
      const spy = jest.spyOn(gameScene.player, 'update');
      gameScene.update();

      expect(spy).toHaveBeenCalled();
    });

    test('should update HUD each frame', () => {
      const spy = jest.spyOn(gameScene, 'updateHUD');
      gameScene.update();

      expect(spy).toHaveBeenCalled();
    });
  });
});
