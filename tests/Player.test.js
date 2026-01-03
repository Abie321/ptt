const fs = require('fs');
const path = require('path');

// Load Player class
const playerPath = path.join(__dirname, '../js/entities/Player.js');
const playerCode = fs.readFileSync(playerPath, 'utf8');
const modifiedPlayerCode = playerCode.replace('class Player', 'global.Player = class Player');
eval(modifiedPlayerCode);

describe('Player', () => {
  let scene;
  let player;

  beforeEach(() => {
    scene = createMockScene();
    player = new Player(scene, 400, 300);
  });

  describe('Initialization', () => {
    test('should initialize with correct starting values', () => {
      expect(player.currentTier).toBe(1);
      expect(player.consumedInTier).toBe(0);
      expect(player.totalConsumed).toBe(0);
      expect(player.sprite).toBeDefined();
      expect(player.mouthIndicator).toBeDefined();
    });

    test('should start at tier 1 with Micro size', () => {
      expect(player.getCurrentTier()).toBe(1);
      const tierConfig = GameConfig.SIZE_TIERS[0];
      expect(tierConfig.name).toBe('Micro');
    });

    test('should initialize with default direction facing up', () => {
      expect(player.direction).toEqual({ x: 0, y: -1 });
    });

    test('should have WASD and Arrow key controls initialized', () => {
      expect(player.cursors).toBeDefined();
      expect(player.wasd).toBeDefined();
      expect(player.wasd.up).toBeDefined();
      expect(player.wasd.down).toBeDefined();
      expect(player.wasd.left).toBeDefined();
      expect(player.wasd.right).toBeDefined();
    });
  });

  describe('Movement Controls', () => {
    test('should move up when W or Up arrow is pressed', () => {
      simulateKeyPress(player.wasd.up, true);
      player.update();
      expect(player.sprite.body.setVelocity).toHaveBeenCalledWith(
        0,
        -GameConfig.PLAYER.SPEED
      );
    });

    test('should move down when S or Down arrow is pressed', () => {
      simulateKeyPress(player.wasd.down, true);
      player.update();
      expect(player.sprite.body.setVelocity).toHaveBeenCalledWith(
        0,
        GameConfig.PLAYER.SPEED
      );
    });

    test('should move left when A or Left arrow is pressed', () => {
      simulateKeyPress(player.wasd.left, true);
      player.update();
      expect(player.sprite.body.setVelocity).toHaveBeenCalledWith(
        -GameConfig.PLAYER.SPEED,
        0
      );
    });

    test('should move right when D or Right arrow is pressed', () => {
      simulateKeyPress(player.wasd.right, true);
      player.update();
      expect(player.sprite.body.setVelocity).toHaveBeenCalledWith(
        GameConfig.PLAYER.SPEED,
        0
      );
    });

    test('should move diagonally when two keys are pressed', () => {
      simulateKeyPress(player.wasd.up, true);
      simulateKeyPress(player.wasd.right, true);
      player.update();
      expect(player.sprite.body.setVelocity).toHaveBeenCalledWith(
        GameConfig.PLAYER.SPEED,
        -GameConfig.PLAYER.SPEED
      );
    });

    test('should not move when no keys are pressed', () => {
      player.update();
      expect(player.sprite.body.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    test('should work with arrow keys', () => {
      simulateKeyPress(player.cursors.up, true);
      player.update();
      expect(player.sprite.body.setVelocity).toHaveBeenCalledWith(
        0,
        -GameConfig.PLAYER.SPEED
      );
    });
  });

  describe('Mouth Hitbox', () => {
    test('should update mouth position based on movement direction', () => {
      simulateKeyPress(player.wasd.right, true);
      player.update();

      const mouthPos = player.getMouthPosition();
      expect(mouthPos.x).toBeGreaterThan(player.sprite.x);
    });

    test('should position mouth in front of player', () => {
      const initialPos = player.getMouthPosition();
      expect(initialPos).toBeDefined();
      expect(initialPos.x).toBeDefined();
      expect(initialPos.y).toBeDefined();
    });

    test('should update mouth direction when moving', () => {
      // Move right
      simulateKeyPress(player.wasd.right, true);
      player.update();
      expect(player.direction.x).toBeGreaterThan(0);

      // Reset
      simulateKeyPress(player.wasd.right, false);

      // Move left
      simulateKeyPress(player.wasd.left, true);
      player.update();
      expect(player.direction.x).toBeLessThan(0);
    });
  });

  describe('Size Progression System', () => {
    test('should start at tier 1', () => {
      expect(player.getCurrentTier()).toBe(1);
    });

    test('should advance tier after consuming quota', () => {
      const tier1Quota = GameConfig.SIZE_TIERS[0].quota;

      // Create mock items
      for (let i = 0; i < tier1Quota; i++) {
        const mockItem = { tier: 1, itemType: 0 };
        player.consume(mockItem);
      }

      expect(player.getCurrentTier()).toBe(2);
    });

    test('should have 5 tiers total', () => {
      expect(GameConfig.SIZE_TIERS.length).toBe(5);
    });

    test('should reset consumedInTier when advancing', () => {
      const tier1Quota = GameConfig.SIZE_TIERS[0].quota;

      for (let i = 0; i < tier1Quota; i++) {
        const mockItem = { tier: 1, itemType: 0 };
        player.consume(mockItem);
      }

      expect(player.consumedInTier).toBe(0);
    });

    test('should scale player size when advancing tiers', () => {
      const initialRadius = player.sprite.radius;
      const tier1Quota = GameConfig.SIZE_TIERS[0].quota;

      for (let i = 0; i < tier1Quota; i++) {
        const mockItem = { tier: 1, itemType: 0 };
        player.consume(mockItem);
      }

      expect(player.sprite.setRadius).toHaveBeenCalled();
    });

    test('should emit tierAdvanced event when advancing', () => {
      const tier1Quota = GameConfig.SIZE_TIERS[0].quota;

      for (let i = 0; i < tier1Quota; i++) {
        const mockItem = { tier: 1, itemType: 0 };
        player.consume(mockItem);
      }

      expect(scene.events.emit).toHaveBeenCalledWith('tierAdvanced', 2);
    });

    test('should not advance beyond tier 5', () => {
      // Consume enough to reach tier 5
      for (let tier = 1; tier <= 5; tier++) {
        const quota = GameConfig.SIZE_TIERS[tier - 1].quota;
        for (let i = 0; i < quota; i++) {
          const mockItem = { tier: tier, itemType: 0 };
          player.consume(mockItem);
        }
      }

      expect(player.getCurrentTier()).toBe(5);
    });
  });

  describe('Consumption Mechanics', () => {
    test('should consume items and return points', () => {
      const mockItem = { tier: 1, itemType: 0 };
      const points = player.consume(mockItem);

      expect(points).toBe(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
      expect(player.consumedInTier).toBe(1);
      expect(player.totalConsumed).toBe(1);
    });

    test('should track consumed item types', () => {
      const mockItem = { tier: 1, itemType: 5 };
      player.consume(mockItem);

      expect(player.consumedTypes[5]).toBe(1);
    });

    test('should increment consumed count for same item type', () => {
      const mockItem = { tier: 1, itemType: 3 };
      player.consume(mockItem);
      player.consume(mockItem);
      player.consume(mockItem);

      expect(player.consumedTypes[3]).toBe(3);
    });

    test('should be able to consume current tier items', () => {
      const consumableTiers = player.getConsumableTiers();
      expect(consumableTiers).toContain(1);
    });

    test('should be able to consume previous tier items', () => {
      // Advance to tier 2
      const tier1Quota = GameConfig.SIZE_TIERS[0].quota;
      for (let i = 0; i < tier1Quota; i++) {
        player.consume({ tier: 1, itemType: 0 });
      }

      const consumableTiers = player.getConsumableTiers();
      expect(consumableTiers).toContain(1);
      expect(consumableTiers).toContain(2);
    });
  });

  describe('Scoring System', () => {
    test('should award maximum points for first consumption', () => {
      const mockItem = { tier: 1, itemType: 0 };
      const points = player.consume(mockItem);

      expect(points).toBe(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
    });

    test('should implement diminishing returns for repeated items', () => {
      // Create a specific test entity configuration for this test
      // to ensure we have a controlled density
      const originalEntities = GameConfig.TIER_ENTITIES;

      // Override with a single item type with count 5 for density calculation
      GameConfig.TIER_ENTITIES = {
          1: [{ type: 'TestItem', count: 5, value: 80, shape: 'circle', color: 0xFFFFFF }]
      };

      const mockItem = { tier: 1, itemType: 'TestItem', value: 80 };
      const firstPoints = player.consume(mockItem);
      const secondPoints = player.consume(mockItem);
      const thirdPoints = player.consume(mockItem);

      expect(firstPoints).toBe(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
      expect(secondPoints).toBeLessThan(firstPoints);
      expect(thirdPoints).toBeLessThan(secondPoints);

      // Restore
      GameConfig.TIER_ENTITIES = originalEntities;
    });

    test('should never award less than minimum points', () => {
      const mockItem = { tier: 1, itemType: 0 };

      // Consume same item many times
      for (let i = 0; i < 100; i++) {
        const points = player.consume(mockItem);
        expect(points).toBeGreaterThanOrEqual(GameConfig.SCORING.MIN_POINTS_PER_ITEM);
      }
    });

    test('should apply different scoring for different item types', () => {
      const item1 = { tier: 1, itemType: 'TypeA' };
      const item2 = { tier: 1, itemType: 'TypeB' };

      // Consume first item type multiple times
      player.consume(item1);
      player.consume(item1);
      const item1ThirdPoints = player.consume(item1);

      // Consume second item type for first time
      const item2FirstPoints = player.consume(item2);

      expect(item2FirstPoints).toBe(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
      expect(item2FirstPoints).toBeGreaterThan(item1ThirdPoints);
    });
  });

  describe('Hazard Damage', () => {
    test('should return penalty amount when taking damage', () => {
      const penalty = player.takeDamage();
      expect(penalty).toBe(GameConfig.SCORING.HAZARD_PENALTY);
    });

    test('should have correct penalty value', () => {
      expect(GameConfig.SCORING.HAZARD_PENALTY).toBe(80);
    });
  });

  describe('Progress Tracking', () => {
    test('should calculate progress correctly', () => {
      const quota = GameConfig.SIZE_TIERS[0].quota;

      expect(player.getProgress()).toBe(0);

      // Consume half the quota
      for (let i = 0; i < quota / 2; i++) {
        player.consume({ tier: 1, itemType: 0 });
      }

      expect(player.getProgress()).toBeCloseTo(0.5);
    });

    test('should reach 100% progress at quota', () => {
      const quota = GameConfig.SIZE_TIERS[0].quota;

      for (let i = 0; i < quota; i++) {
        player.consume({ tier: 1, itemType: 0 });
      }

      // Should have advanced, so new tier progress is 0
      expect(player.getProgress()).toBe(0);
    });
  });

  describe('Player Size', () => {
    test('should return current player size', () => {
      const size = player.getSize();
      expect(size).toBe(player.sprite.radius);
    });

    test('should increase size when advancing tiers', () => {
      const initialSize = player.getSize();
      const quota = GameConfig.SIZE_TIERS[0].quota;

      for (let i = 0; i < quota; i++) {
        player.consume({ tier: 1, itemType: 0 });
      }

      // Size should have changed (setRadius was called)
      expect(player.sprite.setRadius).toHaveBeenCalled();
    });
  });
});
