const fs = require('fs');
const path = require('path');

// Load required classes
const playerPath = path.join(__dirname, '../js/entities/Player.js');
eval(fs.readFileSync(playerPath, 'utf8'));

describe('Scoring System', () => {
  let scene;
  let player;

  beforeEach(() => {
    scene = createMockScene();
    player = new Player(scene, 400, 300);
  });

  describe('Base Point Awards', () => {
    test('should award 80 base points for first consumption', () => {
      const item = { tier: 1, itemType: 0 };
      const points = player.consume(item);

      expect(points).toBe(80);
      expect(points).toBe(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
    });

    test('should have minimum point floor of 1', () => {
      expect(GameConfig.SCORING.MIN_POINTS_PER_ITEM).toBe(1);
    });

    test('should never award less than minimum points', () => {
      const item = { tier: 1, itemType: 0 };

      // Consume same item many times
      for (let i = 0; i < 200; i++) {
        const points = player.consume(item);
        expect(points).toBeGreaterThanOrEqual(GameConfig.SCORING.MIN_POINTS_PER_ITEM);
      }
    });
  });

  describe('Diminishing Returns Algorithm', () => {
    test('should decrease points for repeated consumption of same type', () => {
      const item = { tier: 1, itemType: 5 };

      const points1 = player.consume(item);
      const points2 = player.consume(item);
      const points3 = player.consume(item);
      const points4 = player.consume(item);

      expect(points1).toBeGreaterThan(points2);
      expect(points2).toBeGreaterThan(points3);
      expect(points3).toBeGreaterThan(points4);
    });

    test('should track consumption count per item type', () => {
      const item1 = { tier: 1, itemType: 3 };
      const item2 = { tier: 1, itemType: 7 };

      player.consume(item1);
      player.consume(item1);
      player.consume(item2);

      expect(player.consumedTypes[3]).toBe(2);
      expect(player.consumedTypes[7]).toBe(1);
    });

    test('should apply diminishing returns independently per item type', () => {
      const itemA = { tier: 1, itemType: 0 };
      const itemB = { tier: 1, itemType: 1 };

      // Consume itemA multiple times
      player.consume(itemA);
      player.consume(itemA);
      const itemAThirdPoints = player.consume(itemA);

      // Consume itemB for first time
      const itemBFirstPoints = player.consume(itemB);

      // ItemB should give full points despite itemA being consumed multiple times
      expect(itemBFirstPoints).toBe(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
      expect(itemBFirstPoints).toBeGreaterThan(itemAThirdPoints);
    });

    test('should use decay factor based on consumption count', () => {
      const item = { tier: 1, itemType: 0 };

      const points = [];
      for (let i = 0; i < 10; i++) {
        points.push(player.consume(item));
      }

      // Each subsequent consumption should give less or equal points
      for (let i = 1; i < points.length; i++) {
        expect(points[i]).toBeLessThanOrEqual(points[i - 1]);
      }
    });

    test('should factor in tier density for decay calculation', () => {
      // Items from tiers with different densities should have different decay rates
      const tier1Item = { tier: 1, itemType: 0 };
      const tier5Item = { tier: 5, itemType: 1 };

      // Consume each type twice
      player.consume(tier1Item);
      const tier1Second = player.consume(tier1Item);

      // Reset player for tier 5
      const player2 = new Player(scene, 400, 300);
      player2.consume(tier5Item);
      const tier5Second = player2.consume(tier5Item);

      // Both should show diminishing returns
      expect(tier1Second).toBeLessThan(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
      expect(tier5Second).toBeLessThan(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
    });
  });

  describe('Score Penalties', () => {
    test('should apply 80 point penalty for hazard collisions', () => {
      const penalty = player.takeDamage();

      expect(penalty).toBe(80);
      expect(penalty).toBe(GameConfig.SCORING.HAZARD_PENALTY);
    });

    test('should have equal penalty and max points values', () => {
      // Design choice: penalty equals max points per item
      expect(GameConfig.SCORING.HAZARD_PENALTY).toBe(
        GameConfig.SCORING.MAX_POINTS_PER_ITEM
      );
    });
  });

  describe('3-Star Rating System', () => {
    test('should have defined star thresholds', () => {
      expect(GameConfig.STAR_THRESHOLDS.ONE_STAR).toBe(500);
      expect(GameConfig.STAR_THRESHOLDS.TWO_STAR).toBe(1500);
      expect(GameConfig.STAR_THRESHOLDS.THREE_STAR).toBe(3000);
    });

    test('should have increasing thresholds', () => {
      expect(GameConfig.STAR_THRESHOLDS.TWO_STAR).toBeGreaterThan(
        GameConfig.STAR_THRESHOLDS.ONE_STAR
      );
      expect(GameConfig.STAR_THRESHOLDS.THREE_STAR).toBeGreaterThan(
        GameConfig.STAR_THRESHOLDS.TWO_STAR
      );
    });

    test('should be achievable through normal gameplay', () => {
      // Calculate maximum possible score
      let maxScore = 0;
      for (let tier = 1; tier <= 5; tier++) {
        const quota = GameConfig.SIZE_TIERS[tier - 1].quota;
        // Assume perfect play with varied items
        maxScore += quota * GameConfig.SCORING.MAX_POINTS_PER_ITEM;
      }

      // 3-star threshold should be achievable
      expect(maxScore).toBeGreaterThan(GameConfig.STAR_THRESHOLDS.THREE_STAR);
    });
  });

  describe('Item Type Variety Scoring', () => {
    test('should reward consuming different item types', () => {
      let totalScore = 0;

      // Consume 5 different item types once each
      for (let i = 0; i < 5; i++) {
        const points = player.consume({ tier: 1, itemType: i });
        totalScore += points;
      }

      const averageVariedScore = totalScore / 5;

      // Reset player
      const player2 = new Player(scene, 400, 300);
      let repeatedScore = 0;

      // Consume same item type 5 times
      for (let i = 0; i < 5; i++) {
        const points = player2.consume({ tier: 1, itemType: 0 });
        repeatedScore += points;
      }

      const averageRepeatedScore = repeatedScore / 5;

      expect(averageVariedScore).toBeGreaterThan(averageRepeatedScore);
    });

    test('should support at least 10 item types per tier', () => {
      // Based on GameScene spawning logic
      for (let itemType = 0; itemType < 10; itemType++) {
        const points = player.consume({ tier: 1, itemType: itemType });
        expect(points).toBe(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
      }

      // All 10 types should be tracked independently
      expect(Object.keys(player.consumedTypes).length).toBe(10);
    });
  });

  describe('Scoring Edge Cases', () => {
    test('should handle consuming items from different tiers', () => {
      const tier1Item = { tier: 1, itemType: 0 };
      const tier2Item = { tier: 2, itemType: 0 };
      const tier3Item = { tier: 3, itemType: 0 };

      const points1 = player.consume(tier1Item);
      const points2 = player.consume(tier2Item);
      const points3 = player.consume(tier3Item);

      // All should give points
      expect(points1).toBeGreaterThan(0);
      expect(points2).toBeGreaterThan(0);
      expect(points3).toBeGreaterThan(0);
    });

    test('should handle very high consumption counts', () => {
      const item = { tier: 1, itemType: 0 };

      for (let i = 0; i < 1000; i++) {
        const points = player.consume(item);
        expect(points).toBeGreaterThanOrEqual(GameConfig.SCORING.MIN_POINTS_PER_ITEM);
        expect(points).toBeLessThanOrEqual(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
      }
    });

    test('should handle item type 0', () => {
      const item = { tier: 1, itemType: 0 };
      const points = player.consume(item);

      expect(points).toBe(GameConfig.SCORING.MAX_POINTS_PER_ITEM);
    });

    test('should floor point values to integers', () => {
      const item = { tier: 1, itemType: 0 };

      for (let i = 0; i < 50; i++) {
        const points = player.consume(item);
        expect(Number.isInteger(points)).toBe(true);
      }
    });
  });

  describe('Tier Progression Scoring', () => {
    test('should continue scoring across tier boundaries', () => {
      const item = { tier: 1, itemType: 5 };

      // Consume items to advance tier
      const quota = GameConfig.SIZE_TIERS[0].quota;
      for (let i = 0; i < quota; i++) {
        player.consume({ tier: 1, itemType: i % 10 });
      }

      // Now in tier 2, consume same item type
      const pointsAfterAdvance = player.consume(item);

      // Should still track the item type consumption history
      expect(pointsAfterAdvance).toBeDefined();
      expect(pointsAfterAdvance).toBeGreaterThanOrEqual(GameConfig.SCORING.MIN_POINTS_PER_ITEM);
    });

    test('should maintain consumption history across tiers', () => {
      const itemType5 = { tier: 1, itemType: 5 };

      // Consume item type 5 three times
      player.consume(itemType5);
      player.consume(itemType5);
      player.consume(itemType5);

      const consumptionCount = player.consumedTypes[5];
      expect(consumptionCount).toBe(3);

      // Advance tier
      const quota = GameConfig.SIZE_TIERS[0].quota;
      for (let i = 0; i < quota; i++) {
        player.consume({ tier: 1, itemType: i });
      }

      // Consumption history should persist
      expect(player.consumedTypes[5]).toBeGreaterThanOrEqual(3);
    });
  });
});
