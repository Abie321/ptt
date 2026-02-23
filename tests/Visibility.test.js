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

        // Create mock items for Tiers 1-5
        // Needs sufficient items to pass winnability: 30, 25, 25, 25, 25
        const itemsPerTier = {
             1: 30,
             2: 25,
             3: 25,
             4: 25,
             5: 25
        };

        for (let t = 1; t <= 5; t++) {
            const items = [];
            const count = itemsPerTier[t];
            for(let i=0; i<count; i++) {
                // Mock Sprite
                const sprite = {
                    active: true,
                    visible: true,
                    setActive: jest.fn(function(a) { this.active = a; return this; }),
                    setVisible: jest.fn(function(v) { this.visible = v; return this; }),
                    itemData: { tier: t, itemType: 0 },
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

        // Create mock hazards for Tiers 2-5
        const hazardSprites = [];
        for (let t = 2; t <= 5; t++) {
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

        // Verify Tier 3 Items
        gameScene.edibleItems[3].getChildren().forEach(item => {
            expect(item.active).toBe(true);
            expect(item.visible).toBe(true);
        });

        // Verify Tier 4 Items
        gameScene.edibleItems[4].getChildren().forEach(item => {
            expect(item.active).toBe(false);
            expect(item.visible).toBe(false);
        });

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

        // Tier 3 Items: Visible
        gameScene.edibleItems[3].getChildren().forEach(item => {
            expect(item.active).toBe(true);
            expect(item.visible).toBe(true);
        });

        // Tier 4 Items: Visible
        gameScene.edibleItems[4].getChildren().forEach(item => {
            expect(item.active).toBe(true);
            expect(item.visible).toBe(true);
        });

        // Tier 5 Items: Invisible
        gameScene.edibleItems[5].getChildren().forEach(item => {
            expect(item.active).toBe(false);
            expect(item.visible).toBe(false);
        });

        // Verify Hazards
        gameScene.hazards.getChildren().forEach(hazard => {
            const tier = hazard.hazardData.tier;
            if (tier >= 2 && tier <= 4) {
                expect(hazard.active).toBe(true);
                expect(hazard.visible).toBe(true);
            } else {
                // Tier 5 Hazard
                expect(hazard.active).toBe(false);
                expect(hazard.visible).toBe(false);
            }
        });
    });

    test('Winnability Check Integration', () => {
        // Ensure checkWinnability counts inactive items

        // Hide all items to simulate visibility rules (or just manual hiding)
        for(let t=1; t<=5; t++) {
             gameScene.edibleItems[t].getChildren().forEach(i => i.active = false);
        }

        // checkWinnability uses getLength() if we update it, otherwise countActive(true)
        // We will call checkWinnability and see if it returns true (it should, because items exist)
        // Provided we have enough items mock setup (30, 25, 25, 25, 25) which matches config.

        const winnable = gameScene.checkWinnability();

        // If it used countActive(true), it would see 0 items and return false.
        // If it uses getLength(), it sees items and returns true.
        expect(winnable).toBe(true);
    });
});
