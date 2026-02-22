const fs = require('fs');
const path = require('path');

// Load Hazard class
const hazardPath = path.join(__dirname, '../js/entities/Hazard.js');
const hazardCode = fs.readFileSync(hazardPath, 'utf8').replace('class Hazard', 'global.Hazard = class Hazard');
eval(hazardCode);

describe('Hazard', () => {
  let scene;
  const mockConfig = {
      tier: 3,
      type: 'MockHazard',
      value: 50,
      shape: 'circle',
      color: 0xFF0000,
      isHazard: true
  };

  beforeEach(() => {
    scene = createMockScene();
  });

  describe('Initialization', () => {
    test('should create hazard with correct tier', () => {
      const hazard = new Hazard(scene, 100, 200, mockConfig);

      expect(hazard.tier).toBe(3);
      expect(hazard.sprite).toBeDefined();
    });

    test('should create hazards for tiers 2-5', () => {
      for (let tier = 2; tier <= 5; tier++) {
        const config = { ...mockConfig, tier: tier };
        const hazard = new Hazard(scene, 100, 100, config);
        expect(hazard.tier).toBe(tier);
      }
    });

    test('should store hazard data reference on sprite', () => {
      const hazard = new Hazard(scene, 100, 100, mockConfig);
      expect(hazard.sprite.hazardData).toEqual(mockConfig);
    });

    test('should be created as red circles by default config', () => {
      const hazard = new Hazard(scene, 100, 100, mockConfig);
      expect(scene.add.circle).toHaveBeenCalled();

      // Check that it was called with red color (0xFF0000)
      const callArgs = scene.add.circle.mock.calls[scene.add.circle.mock.calls.length - 1];
      expect(callArgs[3]).toBe(0xFF0000);
    });
  });

  describe('Visual Appearance', () => {
    test('should have semi-transparent appearance', () => {
      const hazard = new Hazard(scene, 100, 100, mockConfig);

      // Alpha should be 0.7
      const callArgs = scene.add.circle.mock.calls[scene.add.circle.mock.calls.length - 1];
      expect(callArgs[4]).toBe(0.7);
    });

    test('should be larger than edible items', () => {
      // Hazard base size is 15
      const hazard = new Hazard(scene, 100, 100, mockConfig);
      expect(scene.add.circle).toHaveBeenCalled();

      const hazardSize = scene.add.circle.mock.calls[scene.add.circle.mock.calls.length - 1][2];
      expect(hazardSize).toBeGreaterThan(8); // Base size of edible items
    });

    test('should increase size based on tier', () => {
      scene.add.circle.mockClear();

      const hazard2 = new Hazard(scene, 100, 100, { ...mockConfig, tier: 2 });
      const size2 = scene.add.circle.mock.calls[0][2];

      scene.add.circle.mockClear();

      const hazard5 = new Hazard(scene, 100, 100, { ...mockConfig, tier: 5 });
      const size5 = scene.add.circle.mock.calls[0][2];

      expect(size5).toBeGreaterThan(size2);
    });

    test('should use explicit size from config if provided', () => {
      const config = { ...mockConfig, size: 45 };
      const hazard = new Hazard(scene, 100, 100, config);
      expect(hazard.radius).toBe(45);
    });
  });

  describe('Physics and Movement', () => {
    test('should have bounce physics enabled', () => {
      const hazard = new Hazard(scene, 100, 100, mockConfig);

      expect(hazard.sprite.body.setBounce).toHaveBeenCalledWith(1, 1);
    });

    test('should have initial velocity set', () => {
      const hazard = new Hazard(scene, 100, 100, mockConfig);

      expect(hazard.sprite.body.setVelocity).toHaveBeenCalled();
      const callArgs = hazard.sprite.body.setVelocity.mock.calls[0];

      // Velocity should be between -50 and 50
      expect(callArgs[0]).toBeGreaterThanOrEqual(-50);
      expect(callArgs[0]).toBeLessThanOrEqual(50);
      expect(callArgs[1]).toBeGreaterThanOrEqual(-50);
      expect(callArgs[1]).toBeLessThanOrEqual(50);
    });

    test('should collide with world bounds', () => {
      const hazard = new Hazard(scene, 100, 100, mockConfig);

      expect(hazard.sprite.body.setCollideWorldBounds).toHaveBeenCalledWith(true);
    });

    test('should bounce when hitting world bounds', () => {
      const hazard = new Hazard(scene, 100, 100, mockConfig);

      // Perfect bounce (1, 1) means no energy loss
      expect(hazard.sprite.body.setBounce).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('Destruction', () => {
    test('should destroy sprite when hazard is destroyed', () => {
      const hazard = new Hazard(scene, 100, 100, mockConfig);
      hazard.destroy();

      expect(hazard.sprite.destroy).toHaveBeenCalled();
    });

    test('should handle destruction safely even if sprite is null', () => {
      const hazard = new Hazard(scene, 100, 100, mockConfig);
      hazard.sprite = null;

      expect(() => hazard.destroy()).not.toThrow();
    });
  });

  describe('Tier System', () => {
    test('should create hazards for multiple tiers', () => {
      const hazards = [2, 3, 4, 5].map(tier => {
        return new Hazard(scene, 100, 100, { ...mockConfig, tier: tier });
      });

      expect(hazards.length).toBe(4);
      hazards.forEach((hazard, index) => {
        expect(hazard.tier).toBe(index + 2);
      });
    });

    test('should maintain tier identity', () => {
      const hazard = new Hazard(scene, 100, 100, { ...mockConfig, tier: 4 });
      expect(hazard.tier).toBe(4);
    });
  });
});
