// Game configuration constants

const LEVEL_1_CONFIG = {
    VIEW_AREA: { WIDTH: 800, HEIGHT: 600 },
    winSize: 400,
    // Size tier configuration
    SIZE_TIERS: [
        { tier: 1, initialSize: 11, threshold: 10, name: 'Micro', color: 0x4CAF50, zoom: 2.0, zoomInStart: 2.0, LEVEL_AREA: { WIDTH: 1800, HEIGHT: 1000 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 2.0, BACKGROUND_X: 0, BACKGROUND_Y: 0 } },
        { tier: 2, initialSize: 20, threshold: 40, name: 'Tiny', color: 0x2196F3, zoom: 2.0, zoomInStart: 4.0, LEVEL_AREA: { WIDTH: 2400, HEIGHT: 1000 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.0, BACKGROUND_X: 0, BACKGROUND_Y: 0 } },
        { tier: 3, initialSize: 37, threshold: 150, name: 'Small', color: 0xFF9800, zoom: 0.5, zoomInStart: 2.0, LEVEL_AREA: { WIDTH: 2816, HEIGHT: 1536 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.0 } }
    ],

    // Scoring configuration
    SCORING: {
        MAX_POINTS_PER_ITEM: 80,
        MIN_POINTS_PER_ITEM: 1,
        HAZARD_PENALTY: 80
    },

    // Star thresholds (per level)
    STAR_THRESHOLDS: {
        ONE_STAR: 500,
        TWO_STAR: 1500,
        THREE_STAR: 3000
    },

    // Player configuration
    PLAYER: {
        GROWTH_FACTOR: 0.15,
        TIER_GROWTH_FACTOR: 0.15,
        SPEED: 200,
        MOUTH_OFFSET: 0.7, // Multiplier for hitbox position relative to player size
        SPRITE: {
            USE_SPRITESHEET: true,
            KEY: 'player_sheet',
            FRAME_WIDTH: 800,
            FRAME_HEIGHT: 800,
            ANIMATIONS: {
                DOWN: { start: 0, end: 2, rate: 10 },
                UP: { start: 3, end: 5, rate: 10 },
                RIGHT: { start: 9, end: 11, rate: 10 },
                LEFT: { start: 6, end: 8, rate: 10 }
            }
        }
    },

    ENTITY_IMAGES: {
        'player_sheet': 'assets/images/ghost.png',
        'teadrop': 'assets/images/teadrop.png',
        'crumb': 'assets/images/crumb.png',
        'coin': 'assets/images/coin.png',
        'cube': 'assets/images/cube.png',
        'sandwich': 'assets/images/sandwich.png',
        'teabag': 'assets/images/teabag.png',
        'cake': 'assets/images/cake.png',
        'spoon': 'assets/images/spoon.png',
        'cup': 'assets/images/cup.png',
        'teapot': 'assets/images/teapot.png',
        'biscuit': 'assets/images/biscuit.png',
        'onepoundnote': 'assets/images/onepoundnote.png',
        'beanscan': 'assets/images/beanscan.png',
        'chair': 'assets/images/chair.png',
        'waiter': 'assets/images/waiter.png',
        'customer': 'assets/images/customer.png'
    },
  
    // Entities configuration per tier
    // Each entry: { type: 'Name', count: N, value: Score, shape: 'circle'|'square'|'triangle', color: Hex, isHazard: boolean, size: Number }
    TIER_ENTITIES: {
        1: [
            { type: "Tea drop", count: 18, value: 5, shape: 'circle', color: 0x8BC34A, isHazard: false, image: 'teadrop', size: [9, 17], hideInNextTier: true },
            { type: "Cookie crumb", count: 18, value: 5, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'crumb', size: [9, 17], hideInNextTier: true },
            { type: "Coin", count: 10, value: 5, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'coin', size: 25 },
            { type: "Sugarcube", count: 10, value: 5, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'cube', size: 18},
        ],
        2: [
            // Edibles
            { type: "Sandwich", count: 5, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 58, image: 'sandwich'},
            { type: "Tea bag", count: 5, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 68, image: 'teabag'},
            { type: "Cake", count: 7, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 100, image: 'cake', hideInPreviousTier: true },
            { type: "Spoon", count: 7, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 60, image: 'spoon'},
            { type: "Cup", count: 5, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 48, image: 'cup'},
            { type: "Biscuit", count: 5, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 42, image: 'biscuit'},
            { type: "Teapot", count: 7, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 125, image: 'teapot', hideInPreviousTier: true },
            // Hazards
            { type: "Mouse", count: 5, value: 50, shape: 'circle', color: 0xFF0000, isHazard: true, size: 60 }
        ],
        3: [
            // Edibles
            { type: "One pound note", count: 12, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 200, image: 'onepoundnote', noCollision: true },
            { type: "Beans can", count: 12, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 180, image: 'beanscan'},
            { type: "Chair", count: 6, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 300, image: 'chair'},
            // Hazards
            { 
                    type: "Waiter", 
                    count: 5, 
                    value: 50, 
                    shape: 'circle', 
                    color: 0xFF0000, 
                    isHazard: true, 
                    size: 350,
                    SPRITE: {
                        USE_SPRITESHEET: true,
                        KEY: 'waiter', // The key used for preloading the image
                        FRAME_WIDTH: 750,         // Width of a single frame
                        FRAME_HEIGHT: 750,        // Height of a single frame
                        ANIMATIONS: {
                            UP: { start: 0, end: 1, rate: 10 },
                            DOWN: { start: 2, end: 3, rate: 10 },
                            LEFT: { start: 4, end: 5, rate: 10 },
                            RIGHT: { start: 6, end: 7, rate: 10 }
                        }
                    }
            },
            { 
                    type: "Customer", 
                    count: 5, 
                    value: 50, 
                    shape: 'circle', 
                    color: 0xFF0000, 
                    isHazard: true, 
                    size: 350,
                    SPRITE: {
                        USE_SPRITESHEET: true,
                        KEY: 'customer', // The key used for preloading the image
                        FRAME_WIDTH: 750,         // Width of a single frame
                        FRAME_HEIGHT: 750,        // Height of a single frame
                        ANIMATIONS: {
                            UP: { start: 0, end: 1, rate: 10 },
                            DOWN: { start: 2, end: 3, rate: 10 },
                            LEFT: { start: 4, end: 5, rate: 10 },
                            RIGHT: { start: 6, end: 7, rate: 10 }
                        }
                    }
            },
        ],
    }
};

const LEVEL_2_CONFIG = JSON.parse(JSON.stringify(LEVEL_1_CONFIG));
LEVEL_2_CONFIG.VIEW_AREA = { WIDTH: 800, HEIGHT: 600 };
LEVEL_2_CONFIG.winSize = 80;
LEVEL_2_CONFIG.SIZE_TIERS = [
    { tier: 1, initialSize: 11, threshold: 20, name: 'Nano', color: 0x607D8B, zoom: 1.0, zoomInStart: 1.0, LEVEL_AREA: { WIDTH: 1600, HEIGHT: 1200 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png', BACKGROUND_SCALE: 1.0, TILE_BACKGROUND: true } },
    { tier: 2, initialSize: 11, threshold: 30, name: 'Mini', color: 0x9E9E9E, zoom: 0.9, zoomInStart: 2.0, LEVEL_AREA: { WIDTH: 1800, HEIGHT: 1400 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png', BACKGROUND_SCALE: 1.0, TILE_BACKGROUND: true } },
    { tier: 3, initialSize: 11, threshold: 40, name: 'Small', color: 0x795548, zoom: 0.8, zoomInStart: 2.0, LEVEL_AREA: { WIDTH: 2000, HEIGHT: 1600 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png', BACKGROUND_SCALE: 1.0, TILE_BACKGROUND: true } },
    { tier: 4, initialSize: 11, threshold: 50, name: 'Average', color: 0xFF5722, zoom: 0.7, zoomInStart: 2.0, LEVEL_AREA: { WIDTH: 2200, HEIGHT: 1800 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png', BACKGROUND_SCALE: 1.0, TILE_BACKGROUND: true } },
    { tier: 5, initialSize: 11, threshold: 60, name: 'Massive', color: 0xE91E63, zoom: 0.6, zoomInStart: 2.0, LEVEL_AREA: { WIDTH: 2400, HEIGHT: 2000 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png', BACKGROUND_SCALE: 1.0, TILE_BACKGROUND: true } }
];
// Make level 2 slightly harder
LEVEL_2_CONFIG.SCORING.HAZARD_PENALTY = 100;

const GameConfig = {
    WORLDS: [
        { name: "Ghost" },
        { name: "Stingray" },
        { name: "Snake" },
        { name: "Pigeon" },
        { name: "Jaguar" },
        { name: "Seagull" },
        { name: "Goo" },

    ],
    LEVELS: [
        {
            id: 'level1',
            name: 'The Haunted Tea Shop',
            ...LEVEL_1_CONFIG
        },
        {
            id: 'level2',
            name: 'Garden',
            ...LEVEL_2_CONFIG
        }
    ]
};
