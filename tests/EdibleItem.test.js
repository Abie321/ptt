const fs = require('fs');
const path = require('path');

// Load EdibleItem class
const itemPath = path.join(__dirname, '../js/entities/EdibleItem.js');
const itemCode = fs.readFileSync(itemPath, 'utf8').replace('class EdibleItem', 'global.EdibleItem = class EdibleItem');
eval(itemCode);

describe('EdibleItem', () => {
  let scene;

  beforeEach(() => {
    scene = createMockScene();
  });

  describe('Initialization', () => {
    test('should create item with correct tier and type', () => {
      const item = new EdibleItem(scene, 100, 200, 2, 5);

      expect(item.tier).toBe(2);
      expect(item.itemType).toBe(5);
      expect(item.sprite).toBeDefined();
    });

    test('should create items for all 5 tiers', () => {
      for (let tier = 1; tier <= 5; tier++) {
        const item = new EdibleItem(scene, 100, 100, tier, 0);
        expect(item.tier).toBe(tier);
      }
    });

    test('should store item data reference on sprite', () => {
      const item = new EdibleItem(scene, 100, 100, 1, 0);
      expect(item.sprite.itemData).toBe(item);
    });

    test('should set sprite as immovable', () => {
      const item = new EdibleItem(scene, 100, 100, 1, 0);
      expect(item.sprite.body.setImmovable).toHaveBeenCalled();
    });
  });

  describe('Visual Representation', () => {
    test('should create different shapes based on item type', () => {
      // Type 0 should be circle (0 % 3 = 0)
      const circle = new EdibleItem(scene, 100, 100, 1, 0);
      expect(scene.add.circle).toHaveBeenCalled();

      // Reset mock
      scene.add.circle.mockClear();
      scene.add.rectangle.mockClear();
      scene.add.triangle.mockClear();

      // Type 1 should be square (1 % 3 = 1)
      const square = new EdibleItem(scene, 100, 100, 1, 1);
      expect(scene.add.rectangle).toHaveBeenCalled();

      // Reset mock
      scene.add.circle.mockClear();
      scene.add.rectangle.mockClear();
      scene.add.triangle.mockClear();

      // Type 2 should be triangle (2 % 3 = 2)
      const triangle = new EdibleItem(scene, 100, 100, 1, 2);
      expect(scene.add.triangle).toHaveBeenCalled();
    });

    test('should create items with varying shapes and colors', () => {
      const item1 = new EdibleItem(scene, 100, 100, 1, 0); // circle
      const item2 = new EdibleItem(scene, 100, 100, 1, 1); // square
      const item3 = new EdibleItem(scene, 100, 100, 1, 2); // triangle

      expect(item1.sprite).toBeDefined();
      expect(item2.sprite).toBeDefined();
      expect(item3.sprite).toBeDefined();
    });

    test('should increase size based on tier', () => {
      scene.add.circle.mockClear();

      const item1 = new EdibleItem(scene, 100, 100, 1, 0);
      const size1 = scene.add.circle.mock.calls[0][2]; // radius parameter

      scene.add.circle.mockClear();

      const item5 = new EdibleItem(scene, 100, 100, 5, 0);
      const size5 = scene.add.circle.mock.calls[0][2]; // radius parameter

      expect(size5).toBeGreaterThan(size1);
    });
  });

  describe('Position', () => {
    test('should be created at specified position', () => {
      const item = new EdibleItem(scene, 150, 250, 1, 0);
      const pos = item.getPosition();

      expect(pos.x).toBe(150);
      expect(pos.y).toBe(250);
    });

    test('should return current position', () => {
      const item = new EdibleItem(scene, 100, 200, 1, 0);
      const position = item.getPosition();

      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });
  });

  describe('Item Types', () => {
    test('should support multiple item types per tier', () => {
      const types = [];
      for (let i = 0; i < 10; i++) {
        const item = new EdibleItem(scene, 100, 100, 1, i);
        types.push(item.itemType);
      }

      expect(types.length).toBe(10);
      expect(new Set(types).size).toBe(10); // All unique
    });

    test('should maintain item type identity', () => {
      const item = new EdibleItem(scene, 100, 100, 3, 7);
      expect(item.itemType).toBe(7);
    });
  });

  describe('Destruction', () => {
    test('should destroy sprite when item is destroyed', () => {
      const item = new EdibleItem(scene, 100, 100, 1, 0);
      item.destroy();

      expect(item.sprite.destroy).toHaveBeenCalled();
    });

    test('should handle destruction safely even if sprite is null', () => {
      const item = new EdibleItem(scene, 100, 100, 1, 0);
      item.sprite = null;

      expect(() => item.destroy()).not.toThrow();
    });
  });

  describe('Tier Coverage', () => {
    test('should create items across all size tiers', () => {
      const items = GameConfig.SIZE_TIERS.map((tierConfig, index) => {
        return new EdibleItem(scene, 100, 100, tierConfig.tier, 0);
      });

      expect(items.length).toBe(5);
      items.forEach((item, index) => {
        expect(item.tier).toBe(index + 1);
      });
    });
  });
});
