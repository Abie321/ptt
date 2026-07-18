const fs = require('fs');
const path = require('path');

// Load required classes
const scenePath = path.join(__dirname, '../js/scenes/LevelCreatorScene.js');
const sceneCode = fs.readFileSync(scenePath, 'utf8').replace('class LevelCreatorScene', 'global.LevelCreatorScene = class LevelCreatorScene');

eval(sceneCode);

describe('LevelCreatorScene', () => {
  let creatorScene;

  beforeEach(() => {
    creatorScene = new LevelCreatorScene();
    
    // Mock Phaser Scene requirements
    creatorScene.cameras = {
      main: { 
        width: 800, 
        height: 600,
        setBounds: jest.fn(),
        scrollX: 0,
        scrollY: 0,
        worldView: { width: 1600, height: 1200 }
      }
    };

    creatorScene.input = {
      keyboard: {
        createCursorKeys: jest.fn().mockReturnValue({
          up: {}, down: {}, left: {}, right: {}
        }),
        addKey: jest.fn().mockReturnValue({})
      },
      on: jest.fn(),
      setDraggable: jest.fn(),
      mouse: {
        disableContextMenu: jest.fn()
      }
    };

    // Mock Phaser.Game config parent
    creatorScene.game = {
      config: {
        parent: 'game-container'
      }
    };

    // Add mocks
    creatorScene.add = {
      text: jest.fn().mockReturnValue({
        setDepth: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      }),
      graphics: jest.fn().mockReturnValue({
        lineStyle: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        strokePath: jest.fn(),
        setDepth: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      }),
      circle: jest.fn().mockReturnValue({
        setStrokeStyle: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn(),
        destroy: jest.fn()
      }),
      rectangle: jest.fn().mockReturnValue({
        setStrokeStyle: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn(),
        destroy: jest.fn()
      }),
      image: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      })
    };

    // Mock Phaser Events
    creatorScene.events = {
      once: jest.fn()
    };

    // Create a mock DOM container in JSDOM
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    document.body.appendChild(gameContainer);

    creatorScene.init();
    creatorScene.create();
  });

  afterEach(() => {
    // Clean up JSDOM elements
    const panel = document.getElementById('editor-sidebar');
    if (panel) panel.remove();
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.remove();
  });

  test('should initialize with default level config', () => {
    expect(creatorScene.levelConfig).toBeDefined();
    expect(creatorScene.levelConfig.name).toBe('My Custom Level');
    expect(creatorScene.levelConfig.winSize).toBe(300);
    expect(creatorScene.currentTier).toBe(1);
    expect(creatorScene.activeBrush).toBe('Coin');
  });

  test('should place an entity at grid snapped coordinates', () => {
    // With grid snap enabled (true) and grid size 50
    // Placing at 123, 178 should snap to 100, 200
    creatorScene.placeEntity(123, 178);

    const activeTierEntities = creatorScene.levelConfig.TIER_ENTITIES[1];
    expect(activeTierEntities.length).toBe(1);
    expect(activeTierEntities[0].type).toBe('Coin');
    expect(activeTierEntities[0].positions[0].x).toBe(100);
    expect(activeTierEntities[0].positions[0].y).toBe(200);
  });

  test('should place an entity at exact coordinates when grid snap is disabled', () => {
    creatorScene.snapToGrid = false;
    creatorScene.placeEntity(123, 178);

    const activeTierEntities = creatorScene.levelConfig.TIER_ENTITIES[1];
    expect(activeTierEntities.length).toBe(1);
    expect(activeTierEntities[0].positions[0].x).toBe(123);
    expect(activeTierEntities[0].positions[0].y).toBe(178);
  });

  test('should delete an entity close to target coordinates', () => {
    creatorScene.placeEntity(100, 100); // Index 0
    creatorScene.placeEntity(200, 200); // Index 1
    expect(creatorScene.levelConfig.TIER_ENTITIES[1].length).toBe(2);

    // Delete near 205, 195 (closest to 200, 200)
    creatorScene.deleteAt(205, 195);
    expect(creatorScene.levelConfig.TIER_ENTITIES[1].length).toBe(1);
    expect(creatorScene.levelConfig.TIER_ENTITIES[1][0].positions[0].x).toBe(100);
  });

  test('should allow adding and removing size tiers', () => {
    // Initial tier count is 1
    expect(creatorScene.levelConfig.SIZE_TIERS.length).toBe(1);

    // Simulate Add Tier button click
    const addTierBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === '+ Add');
    expect(addTierBtn).toBeDefined();
    addTierBtn.click();

    expect(creatorScene.levelConfig.SIZE_TIERS.length).toBe(2);
    expect(creatorScene.currentTier).toBe(2);

    // Simulate Delete Tier button click
    const delTierBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === '- Del');
    expect(delTierBtn).toBeDefined();
    delTierBtn.click();

    expect(creatorScene.levelConfig.SIZE_TIERS.length).toBe(1);
    expect(creatorScene.currentTier).toBe(1);
  });

  test('should update background image when selected', () => {
    const bgSelect = document.getElementById('tier-bg-select');
    expect(bgSelect).toBeDefined();

    bgSelect.value = 'assets/images/Level4.png';
    bgSelect.dispatchEvent(new Event('change'));

    const activeTier = creatorScene.levelConfig.SIZE_TIERS[creatorScene.currentTier - 1];
    expect(activeTier.ASSETS.BACKGROUND_IMAGE).toBe('assets/images/Level4.png');
  });
});
