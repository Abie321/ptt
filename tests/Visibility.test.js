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

describe('Entity Visibility System', () => {
    let gameScene;

    beforeEach(() => {
        gameScene = new GameScene();

        // Mock Groups for Items and Hazards with children
        // We need to support `getChildren` returning items that have `setActive` and `setVisible`

        // Mock create() manually partially
        gameScene.edibleItems = {};
        gameScene.hazards = {
            getChildren: jest.fn(() => []),
            add: jest.fn()
        };

        // Create mock items for config tiers
        const maxTier = GameConfig.LEVELS[0].SIZE_TIERS.length;
        const itemsPerTier = {
             1: 30,
             2: 25,
             3: 25,
             4: 25,
             5: 25
        };

        for (let t = 1; t <= maxTier; t++) {
            const items = [];
            const count = itemsPerTier[t] || 25;
            for(let i=0; i<count; i++) {
                // Mock Sprite
                const sprite = {
                    active: true,
                    visible: true,
                    setActive: jest.fn(function(a) { this.active = a; return this; }),
                    setVisible: jest.fn(function(v) { this.visible = v; return this; }),
                    itemData: { tier: t, itemType: 0, size: 20 },
                    destroy: jest.fn()
                };
                items.push(sprite);
            }
            gameScene.edibleItems[t] = {
                getChildren: jest.fn(() => items),
                add: jest.fn(),
                countActive: jest.fn(() => items.filter(i => i.active).length),
                getLength: jest.fn(() => items.length),
                clear: jest.fn()
            };
        }

        // Create mock hazards for Tiers 2 to maxTier
        const hazardSprites = [];
        for (let t = 2; t <= maxTier; t++) {
            for(let i=0; i<3; i++) {
                const sprite = {
                    active: true,
                    visible: true,
                    setActive: jest.fn(function(a) { this.active = a; return this; }),
                    setVisible: jest.fn(function(v) { this.visible = v; return this; }),
                    hazardData: { tier: t },
                    destroy: jest.fn()
                };
                hazardSprites.push(sprite);
            }
        }
        gameScene.hazards.getChildren = jest.fn(() => hazardSprites);

        // Create Player
        gameScene.player = {
            currentTier: 1,
            getCurrentTier: jest.fn(function() { return this.currentTier; }),
            consumedInTier: 0,
            getProgress: jest.fn(() => 0),
            getSize: jest.fn(() => 20),
            internalSize: 20,
            GROWTH_FACTOR: 0.5, // High factor to ensure winnability with few items
            TIER_GROWTH_FACTOR: 0.5 // High tier factor for winnability calculation
        };

        // Setup HUD mocks
        gameScene.sizeText = { setText: jest.fn() };
        gameScene.progressBar = { width: 0 };
        gameScene.scoreText = { setText: jest.fn() };
        gameScene.timerText = { setText: jest.fn() };

        // Mock Cameras
        gameScene.cameras = { main: { setZoom: jest.fn(), flash: jest.fn(), width: 800, height: 600 } };

        // Mock Physics
        gameScene.physics = { pause: jest.fn() };

        // Mock Events
        gameScene.events = { emit: jest.fn() };

        // Mock Add
        gameScene.add = {
            rectangle: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis() })),
            text: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis(), setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis() }))
        };
    });

    test('REQ-MECH-013 & REQ-DMG-006: Visibility at Tier 1', () => {
        gameScene.player.currentTier = 1;

        if (gameScene.updateEntityVisibility) {
            gameScene.updateEntityVisibility();
        }

        // Verify Tier 1 Items
        gameScene.edibleItems[1].getChildren().forEach(item => {
            expect(item.active).toBe(true);
            expect(item.visible).toBe(true);
        });

        // Verify Tier 2 Items
        gameScene.edibleItems[2].getChildren().forEach(item => {
            expect(item.active).toBe(true);
            expect(item.visible).toBe(true);
        });

        // Verify Tier 3 Items
        gameScene.edibleItems[3].getChildren().forEach(item => {
            expect(item.active).toBe(false);
            expect(item.visible).toBe(false);
        });

        // Verify Hazards (All should be hidden at Tier 1)
        gameScene.hazards.getChildren().forEach(hazard => {
            expect(hazard.active).toBe(false);
            expect(hazard.visible).toBe(false);
        });
    });

    test('REQ-MECH-013: Visibility at Tier 2', () => {
        gameScene.player.currentTier = 2;

        if (gameScene.updateEntityVisibility) {
            gameScene.updateEntityVisibility();
        }

        // Verify Tier 1 Items
        gameScene.edibleItems[1].getChildren().forEach(item => {
            expect(item.active).toBe(true);
            expect(item.visible).toBe(true);
        });

        // Verify Tier 2 Items
        gameScene.edibleItems[2].getChildren().forEach(item => {
            expect(item.active).toBe(true);
            expect(item.visible).toBe(true);
        });

        // Verify Tier 3 Items (if it exists)
        if (gameScene.edibleItems[3]) {
            gameScene.edibleItems[3].getChildren().forEach(item => {
                expect(item.active).toBe(true);
                expect(item.visible).toBe(true);
            });
        }

        // Verify Tier 4 Items (if it exists)
        if (gameScene.edibleItems[4]) {
            gameScene.edibleItems[4].getChildren().forEach(item => {
                expect(item.active).toBe(false);
                expect(item.visible).toBe(false);
            });
        }

        // Verify Hazards
        gameScene.hazards.getChildren().forEach(hazard => {
            const tier = hazard.hazardData.tier;
            if (tier === 2 || tier === 3) {
                expect(hazard.active).toBe(true);
                expect(hazard.visible).toBe(true);
            } else {
                expect(hazard.active).toBe(false);
                expect(hazard.visible).toBe(false);
            }
        });
    });

    test('REQ-MECH-013: Visibility at Tier 3', () => {
        gameScene.player.currentTier = 3;

        if (gameScene.updateEntityVisibility) {
            gameScene.updateEntityVisibility();
        }

        // Tier 2 Items: Visible
        gameScene.edibleItems[2].getChildren().forEach(item => {
            expect(item.active).toBe(true);
            expect(item.visible).toBe(true);
        });

        // Tier 3 Items: Visible (if it exists)
        if (gameScene.edibleItems[3]) {
            gameScene.edibleItems[3].getChildren().forEach(item => {
                expect(item.active).toBe(true);
                expect(item.visible).toBe(true);
            });
        }

        // Tier 4 Items: Visible (if it exists)
        if (gameScene.edibleItems[4]) {
            gameScene.edibleItems[4].getChildren().forEach(item => {
                expect(item.active).toBe(true);
                expect(item.visible).toBe(true);
            });
        }

        // Tier 5 Items: Invisible (if it exists)
        if (gameScene.edibleItems[5]) {
            gameScene.edibleItems[5].getChildren().forEach(item => {
                expect(item.active).toBe(false);
                expect(item.visible).toBe(false);
            });
        }

        // Verify Hazards
        gameScene.hazards.getChildren().forEach(hazard => {
            const tier = hazard.hazardData.tier;
            if (tier >= 2 && tier <= 4) {
                expect(hazard.active).toBe(true);
                expect(hazard.visible).toBe(true);
            } else {
                // Max Tier Hazard (e.g., 5)
                expect(hazard.active).toBe(false);
                expect(hazard.visible).toBe(false);
            }
        });
    });

    test('hideInPreviousTier: Entities in N+1 tier should be hidden when player is N if configured', () => {
        gameScene.player.currentTier = 1; // Player is tier 1

        // Set up one item in Tier 2 with the flag
        const item1 = gameScene.edibleItems[2].getChildren()[0];
        item1.itemData.hideInPreviousTier = true;
        // Assume earlyVisible might have made it visible
        item1.itemData.earlyVisible = true;

        // Set up one hazard in Tier 2 with the flag
        const hazard1 = {
            active: true,
            visible: true,
            setActive: jest.fn(function(a) { this.active = a; return this; }),
            setVisible: jest.fn(function(v) { this.visible = v; return this; }),
            hazardData: { tier: 2, hideInPreviousTier: true, earlyVisible: true },
            destroy: jest.fn()
        };
        gameScene.hazards.getChildren().push(hazard1);

        // Note: REQ-DMG-006 override normally hides all hazards at tier 1 regardless.
        // We will temporarily test this from player tier 2 looking at tier 3.
        gameScene.player.currentTier = 2; // Player is tier 2

        // Let's modify the item/hazard tier so it's N+1 relative to 2
        item1.itemData.tier = 3;
        // Keep a copy of the original children to append
        const origChildren = gameScene.edibleItems[3].getChildren();
        // Overwrite the group just for the test
        gameScene.edibleItems[3].getChildren = jest.fn(() => [item1, ...origChildren.slice(1)]);

        hazard1.hazardData.tier = 3;

        if (gameScene.updateEntityVisibility) {
            gameScene.updateEntityVisibility();
        }

        // Verify the item with the flag is hidden despite earlyVisible
        expect(item1.active).toBe(false);
        expect(item1.visible).toBe(false);

        // Verify other Tier 3 items (without the flag, maybe earlyVisible)
        const currentChildren = gameScene.edibleItems[3].getChildren();
        const item2 = currentChildren[1];
        item2.itemData = { tier: 3, earlyVisible: true }; // ensure itemData exists

        // Re-run visibility to ensure item2 earlyVisible takes effect
        if (gameScene.updateEntityVisibility) {
            gameScene.updateEntityVisibility();
        }

        expect(item2.active).toBe(true);
        expect(item2.visible).toBe(true);

        // Verify the hazard with the flag is hidden despite earlyVisible
        expect(hazard1.active).toBe(false);
        expect(hazard1.visible).toBe(false);
    });

    test('Winnability Check Integration', () => {
        // Now checkWinnability uses gameScene.levelConfig.TIER_ENTITIES rather than edibleItems/hazards groups
        // So we need to mock gameScene.levelConfig to include enough potential area
        gameScene.levelConfig = {
            SIZE_TIERS: [
                { tier: 1, initialSize: 20, threshold: 40 },
                { tier: 2, threshold: 80 },
                { tier: 3, threshold: 120 },
                { tier: 4, threshold: 160 },
                { tier: 5, threshold: 200 }
            ],
            TIER_ENTITIES: {
                1: [{ size: 20, count: 50 }],
                2: [{ size: 30, count: 50 }],
                3: [{ size: 40, count: 50 }],
                4: [{ size: 50, count: 50 }],
                5: [{ size: 60, count: 50 }]
            }
        };
        gameScene.player.TIER_GROWTH_FACTOR = 0.5;

        const winnable = gameScene.checkWinnability();

        expect(winnable).toBe(true);
    });
});
