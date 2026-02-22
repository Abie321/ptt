const fs = require('fs');
const path = require('path');

// Load EdibleItem class
const itemPath = path.join(__dirname, '../js/entities/EdibleItem.js');
const itemCode = fs.readFileSync(itemPath, 'utf8').replace('class EdibleItem', 'global.EdibleItem = class EdibleItem');
eval(itemCode);

describe('EdibleItem', () => {
  let scene;
  const mockConfig = {
      tier: 2,
      type: 'MockItem',
      value: 10,
      shape: 'square',
      color: 0x00FF00,
      isHazard: false
  };

  beforeEach(() => {
    scene = createMockScene();
  });

  describe('Initialization', () => {
    test('should create item with correct properties from config', () => {
      const item = new EdibleItem(scene, 100, 200, mockConfig);

      expect(item.tier).toBe(2);
      expect(item.itemType).toBe('MockItem');
      expect(item.sprite).toBeDefined();
    });

    test('should create items for all 5 tiers', () => {
      for (let tier = 1; tier <= 5; tier++) {
        const config = { ...mockConfig, tier: tier };
        const item = new EdibleItem(scene, 100, 100, config);
        expect(item.tier).toBe(tier);
      }
    });

    test('should store item data reference on sprite', () => {
      const item = new EdibleItem(scene, 100, 100, mockConfig);
      expect(item.sprite.itemData).toEqual(mockConfig);
    });

    test('should set sprite as immovable', () => {
      const item = new EdibleItem(scene, 100, 100, mockConfig);
      expect(item.sprite.body.setImmovable).toHaveBeenCalled();
    });
  });

  describe('Visual Representation', () => {
    test('should create different shapes based on config', () => {
      // Circle
      const circleConfig = { ...mockConfig, shape: 'circle' };
      new EdibleItem(scene, 100, 100, circleConfig);
      expect(scene.add.circle).toHaveBeenCalled();

      // Reset mock
      scene.add.circle.mockClear();
      scene.add.rectangle.mockClear();
      scene.add.triangle.mockClear();

      // Square
      const squareConfig = { ...mockConfig, shape: 'square' };
      new EdibleItem(scene, 100, 100, squareConfig);
      expect(scene.add.rectangle).toHaveBeenCalled();

      // Reset mock
      scene.add.circle.mockClear();
      scene.add.rectangle.mockClear();
      scene.add.triangle.mockClear();

      // Triangle
      const triangleConfig = { ...mockConfig, shape: 'triangle' };
      new EdibleItem(scene, 100, 100, triangleConfig);
      expect(scene.add.triangle).toHaveBeenCalled();
    });

    test('should use color from config', () => {
        const colorConfig = { ...mockConfig, color: 0x123456 };
        new EdibleItem(scene, 100, 100, colorConfig);

        // Square uses add.rectangle(x, y, w, h, color)
        // 5th argument is color (index 4)
        expect(scene.add.rectangle.mock.calls[0][4]).toBe(0x123456);
    });

    test('should increase size based on tier', () => {
      scene.add.rectangle.mockClear();

      const item1 = new EdibleItem(scene, 100, 100, { ...mockConfig, tier: 1 });
      const size1 = scene.add.rectangle.mock.calls[0][2]; // width

      scene.add.rectangle.mockClear();

      const item5 = new EdibleItem(scene, 100, 100, { ...mockConfig, tier: 5 });
      const size5 = scene.add.rectangle.mock.calls[0][2]; // width

      expect(size5).toBeGreaterThan(size1);
    });

    test('should use explicit size from config if provided', () => {
      const config = { ...mockConfig, size: 50 };
      const item = new EdibleItem(scene, 100, 100, config);
      expect(item.radius).toBe(50);
    });
  });

  describe('Position', () => {
    test('should be created at specified position', () => {
      const item = new EdibleItem(scene, 150, 250, mockConfig);
      const pos = item.getPosition();

      expect(pos.x).toBe(150);
      expect(pos.y).toBe(250);
    });

    test('should return current position', () => {
      const item = new EdibleItem(scene, 100, 200, mockConfig);
      const position = item.getPosition();

      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });
  });

  describe('Destruction', () => {
    test('should destroy sprite when item is destroyed', () => {
      const item = new EdibleItem(scene, 100, 100, mockConfig);
      item.destroy();

      expect(item.sprite.destroy).toHaveBeenCalled();
    });

    test('should handle destruction safely even if sprite is null', () => {
      const item = new EdibleItem(scene, 100, 100, mockConfig);
      item.sprite = null;

      expect(() => item.destroy()).not.toThrow();
    });
  });

  describe('Tier Coverage', () => {
    test('should create items across all size tiers', () => {
      const items = GameConfig.SIZE_TIERS.map((tierConfig, index) => {
        return new EdibleItem(scene, 100, 100, { ...mockConfig, tier: tierConfig.tier });
      });

      expect(items.length).toBe(5);
      items.forEach((item, index) => {
        expect(item.tier).toBe(index + 1);
      });
    });
  });
});
