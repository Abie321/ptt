// Game configuration constants

const LEVEL_1_CONFIG = {
    // Size tier configuration
    SIZE_TIERS: [
        { tier: 1, threshold: 10, name: 'Micro', color: 0x4CAF50, zoom: 1.0, WORLD: { WIDTH: 1600, HEIGHT: 1200 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } },
        { tier: 2, threshold: 44, name: 'Tiny', color: 0x2196F3, zoom: 0.9, WORLD: { WIDTH: 1800, HEIGHT: 1400 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } },
        { tier: 3, threshold: 70, name: 'Small', color: 0xFF9800, zoom: 0.8, WORLD: { WIDTH: 2000, HEIGHT: 1600 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } },
        { tier: 4, threshold: 100, name: 'Medium', color: 0xF44336, zoom: 0.7, WORLD: { WIDTH: 2200, HEIGHT: 1800 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } },
        { tier: 5, threshold: 140, name: 'Large', color: 0x9C27B0, zoom: 0.6, WORLD: { WIDTH: 2400, HEIGHT: 2000 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } }
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
        INITIAL_SIZE: 11,
        GROWTH_FACTOR: 0.4,
        TIER_GROWTH_FACTOR: 0.4,
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
        'apple': 'assets/images/apple.png',
        'player_sheet': 'assets/images/ghost.png',
        'teadrop': 'assets/images/teadrop.png',
        'crumb': 'assets/images/crumb.png',
        'coin': 'assets/images/coin.png',
        'cube': 'assets/images/cube.png',
        'sandwich': 'assets/images/sandwich.png'
    },
  
    // Entities configuration per tier
    // Each entry: { type: 'Name', count: N, value: Score, shape: 'circle'|'square'|'triangle', color: Hex, isHazard: boolean, size: Number }
    TIER_ENTITIES: {
        1: [
            { type: "Tea drop", count: 15, value: 5, shape: 'circle', color: 0x8BC34A, isHazard: false, image: 'teadrop', size: [5, 9] },
            { type: "Cookie crumb", count: 15, value: 5, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'crumb', size: [5, 9] },
            { type: "Coin", count: 10, value: 5, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'coin', size: [16, 20] },
            { type: "Sugarcube", count: 10, value: 5, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'cube', size: [18, 22] },
        ],
        2: [
            // Edibles
            { type: "Sandwich", count: 3, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false, size: [40, 50], image: 'sandwich'},
            { type: "Crumb", count: 3, value: 10, shape: 'square', color: 0x03A9F4, isHazard: false, size: [40, 50] },
            { type: "Dust", count: 2, value: 10, shape: 'triangle', color: 0x03A9F4, isHazard: false, size: [40, 50] },
            // Hazards
            { type: "Predator Mite", count: 5, value: 50, shape: 'circle', color: 0xFF0000, isHazard: true, size: 45 }
        ],
        3: [
            // Edibles
            { type: "Bug", count: 3, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 16 },
            { type: "Pebble", count: 3, value: 15, shape: 'square', color: 0xFFEB3B, isHazard: false, size: 17 },
            { type: "Berry", count: 2, value: 15, shape: 'triangle', color: 0xFFEB3B, isHazard: false, size: 18 },
            { type: "Coin", count: 3, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 17 },
            { type: "Beetle", count: 2, value: 15, shape: 'square', color: 0xFFEB3B, isHazard: false, size: 19 },
            { type: "Marble", count: 3, value: 15, shape: 'triangle', color: 0xFFEB3B, isHazard: false, size: 18 },
            { type: "Button", count: 2, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 17 },
            { type: "Bean", count: 3, value: 15, shape: 'square', color: 0xFFEB3B, isHazard: false, size: 18 },
            { type: "Nut", count: 2, value: 15, shape: 'triangle', color: 0xFFEB3B, isHazard: false, size: 19 },
            { type: "Leaf", count: 2, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 20 },
            // Hazards
            { type: "Spider", count: 6, value: 60, shape: 'circle', color: 0xFF0000, isHazard: true, size: 30 }
        ],
        4: [
            // Edibles
            { type: "Mouse", count: 3, value: 20, shape: 'circle', color: 0xFF5722, isHazard: false, size: 21 },
            { type: "Apple", count: 3, value: 20, shape: 'square', color: 0xFF5722, isHazard: false, image: 'apple', size: 22 },
            { type: "Rock", count: 2, value: 20, shape: 'triangle', color: 0xFF5722, isHazard: false, size: 23 },
            { type: "Can", count: 3, value: 20, shape: 'circle', color: 0xFF5722, isHazard: false, size: 22 },
            { type: "Rat", count: 2, value: 20, shape: 'square', color: 0xFF5722, isHazard: false, size: 24 },
            { type: "Bird", count: 3, value: 20, shape: 'triangle', color: 0xFF5722, isHazard: false, size: 23 },
            { type: "Frog", count: 2, value: 20, shape: 'circle', color: 0xFF5722, isHazard: false, size: 22 },
            { type: "Phone", count: 3, value: 20, shape: 'square', color: 0xFF5722, isHazard: false, size: 25 },
            { type: "Shoe", count: 2, value: 20, shape: 'triangle', color: 0xFF5722, isHazard: false, size: 24 },
            { type: "Cup", count: 2, value: 20, shape: 'circle', color: 0xFF5722, isHazard: false, size: 23 },
            // Hazards
            { type: "Cat", count: 7, value: 70, shape: 'circle', color: 0xFF0000, isHazard: true, size: 35 }
        ],
        5: [
            // Edibles
            { type: "Cat", count: 3, value: 25, shape: 'circle', color: 0xE91E63, isHazard: false, size: 30 },
            { type: "Chair", count: 3, value: 25, shape: 'square', color: 0xE91E63, isHazard: false, size: 32 },
            { type: "Bush", count: 2, value: 25, shape: 'triangle', color: 0xE91E63, isHazard: false, size: 35 },
            { type: "Tire", count: 3, value: 25, shape: 'circle', color: 0xE91E63, isHazard: false, size: 30 },
            { type: "Dog", count: 2, value: 25, shape: 'square', color: 0xE91E63, isHazard: false, size: 33 },
            { type: "Table", count: 3, value: 25, shape: 'triangle', color: 0xE91E63, isHazard: false, size: 38 },
            { type: "Fence", count: 2, value: 25, shape: 'circle', color: 0xE91E63, isHazard: false, size: 34 },
            { type: "Bike", count: 3, value: 25, shape: 'square', color: 0xE91E63, isHazard: false, size: 36 },
            { type: "Sign", count: 2, value: 25, shape: 'triangle', color: 0xE91E63, isHazard: false, size: 32 },
            { type: "Box", count: 2, value: 25, shape: 'circle', color: 0xE91E63, isHazard: false, size: 31 },
            // Hazards
            { type: "Human", count: 8, value: 80, shape: 'circle', color: 0xFF0000, isHazard: true, size: 45 }
        ]
    }
};

const LEVEL_2_CONFIG = JSON.parse(JSON.stringify(LEVEL_1_CONFIG));
LEVEL_2_CONFIG.SIZE_TIERS = [
    { tier: 1, threshold: 20, name: 'Nano', color: 0x607D8B, zoom: 1.0, WORLD: { WIDTH: 1600, HEIGHT: 1200 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } },
    { tier: 2, threshold: 30, name: 'Mini', color: 0x9E9E9E, zoom: 0.9, WORLD: { WIDTH: 1800, HEIGHT: 1400 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } },
    { tier: 3, threshold: 40, name: 'Small', color: 0x795548, zoom: 0.8, WORLD: { WIDTH: 2000, HEIGHT: 1600 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } },
    { tier: 4, threshold: 50, name: 'Average', color: 0xFF5722, zoom: 0.7, WORLD: { WIDTH: 2200, HEIGHT: 1800 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } },
    { tier: 5, threshold: 60, name: 'Massive', color: 0xE91E63, zoom: 0.6, WORLD: { WIDTH: 2400, HEIGHT: 2000 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/background.png' } }
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
