// Game configuration constants

const LEVEL_1_CONFIG = {
    VIEW_AREA: { WIDTH: 800, HEIGHT: 600 },
    winSize: 500,
    coverImage: 'assets/images/Comic1.png',
    // Size tier configuration
    SIZE_TIERS: [
        { tier: 1, initialSize: 11, threshold: 10, name: 'Micro', color: 0x4CAF50, zoom: 2.0, zoomInStart: 2.0, LEVEL_AREA: { WIDTH: 1800, HEIGHT: 1000 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 2.0, BACKGROUND_X: 0, BACKGROUND_Y: 0 } },
        { tier: 2, initialSize: 20, threshold: 40, name: 'Tiny', color: 0x2196F3, zoom: 2.0, zoomInStart: 4.0, LEVEL_AREA: { WIDTH: 2400, HEIGHT: 1000 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.0, BACKGROUND_X: 0, BACKGROUND_Y: 0 } },
        { tier: 3, initialSize: 37, threshold: 150, name: 'Small', color: 0xFF9800, zoom: 0.5, zoomInStart: 2.0, LEVEL_AREA: { WIDTH: 2800, HEIGHT: 1450 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.0 } }
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

    // Effects configuration
    EFFECTS: {
        SMOKE_DURATION_MIN: 100,
        SMOKE_DURATION_MAX: 1000
    },

    // Player configuration
    PLAYER: {
        GROWTH_FACTOR: 0.15,
        TIER_GROWTH_FACTOR: 0.15,
        SPEED: 200,
        MOUTH_OFFSET: 0.7, // Multiplier for hitbox position relative to player size
        CONSUMPTION_RANGE_BONUS: 10, // Additional pixel range for eating
        INVULNERABILITY_DURATION: 500, // ms of invulnerability after taking damage
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
        'table': 'assets/images/table.png',
        'waiter': 'assets/images/waiter.png',
        'customer': 'assets/images/customer.png',
        'mouse': 'assets/images/mouse.png',
        'emptycounter': 'assets/images/emptycounter.png'
    },
  
    // Entities configuration per tier
    // Each entry: { type: 'Name', count: N, value: Score, shape: 'circle'|'square'|'triangle', color: Hex, isHazard: boolean, size: Number }
    TIER_ENTITIES: {
        1: [
            { type: "Tea drop", count: 18, value: 11, shape: 'circle', color: 0x8BC34A, isHazard: false, image: 'teadrop', size: [9, 17], hideInNextTier: true },
            { type: "Cookie crumb", count: 18, value: 11, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'crumb', size: [9, 17], hideInNextTier: true },
            { type: "Coin", count: 10, value: 25, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'coin', size: 25 },
            { type: "Sugarcube", count: 10, value: 18, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'cube', size: 18},
        ],
        2: [
            // Edibles
            { type: "Sandwich", count: 5, value: 58, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 58, image: 'sandwich'},
            { type: "Tea bag", count: 5, value: 68, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 68, image: 'teabag'},
            { type: "Cake", count: 7, value: 100, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 100, image: 'cake', hideInPreviousTier: true },
            { type: "Spoon", count: 7, value: 60, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 60, image: 'spoon'},
            { type: "Cup", count: 5, value: 48, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 48, image: 'cup'},
            { type: "Biscuit", count: 5, value: 42, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 42, image: 'biscuit'},
            { type: "Teapot", count: 7, value: 125, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 125, image: 'teapot', hideInPreviousTier: true },
            // Hazards
            { type: "Mouse", count: 5, value: 60, shape: 'circle', color: 0xFF0000, isHazard: true, size: 60, image: 'mouse', hideInPreviousTier: true }
        ],
        3: [
            // Edibles
            { type: "One pound note", count: 12, value: 200, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 200, image: 'onepoundnote', noCollision: true },
            { type: "Beans can", count: 12, value: 180, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 180, image: 'beanscan'},
            { type: "Teapot", count: 7, value: 125, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 125, image: 'teapot', hideInPreviousTier: true },
            { 
                type: "Chair", 
                count: 2, 
                value: 300, 
                shape: 'circle',
                color: 0xFFEB3B, 
                isHazard: false,
                hideInPreviousTier: true, 
                size: 300, 
                image: 'chair',
                hitbox: { width: 150, height: 150 },
                positions: [{x: 450, y: 400, rotation: 270}, {x: 950, y: 400, rotation: 90}, {x: 450, y: 1000, rotation: 270}, {x: 950, y: 1000, rotation: 90}, {x: 1700, y: 400, rotation: 270}, {x: 2250, y: 400, rotation: 90}, {x: 1700, y: 1000, rotation: 270}, {x: 2250, y: 1000, rotation: 90}]
            },
            { 
                type: "Table", 
                count: 4, 
                value: 300, 
                shape: 'square',
                color: 0xFFEB3B, 
                isHazard: false,
                hideInPreviousTier: true, 
                size: 650, 
                image: 'table',
                hitbox: { width: 400, height: 200 },
                positions: [{x: 700, y: 400}, {x: 700, y: 1000}, {x: 2000, y: 400}, {x: 2000, y: 1000}]
            },
            { 
                type: "Counter", 
                count: 4, 
                value: 300, 
                shape: 'square',
                color: 0xFFEB3B, 
                isHazard: false,
                hideInPreviousTier: true, 
                size: 1200, 
                image: 'emptycounter',
                hitbox: { width: 600, height: 200 },
                positions: [{x: 1450, y: 100}]
            },
            // Hazards
            { 
                    type: "Waiter", 
                    count: 5, 
                    value: 350, 
                    shape: 'circle', 
                    color: 0xFF0000, 
                    isHazard: true,
                    hideInPreviousTier: true,
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
                    value: 350, 
                    shape: 'circle', 
                    color: 0xFF0000, 
                    isHazard: true,
                    hideInPreviousTier: true,
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
LEVEL_2_CONFIG['coverImage'] = undefined;
LEVEL_2_CONFIG['SIZE_TIERS'] = [
        { tier: 1, initialSize: 45, threshold: 40, name: 'Tiny', color: 0x2196F3, zoom: 1.0, zoomInStart: 4.0, LEVEL_AREA: { WIDTH: 2400, HEIGHT: 1000 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.0, BACKGROUND_X: 0, BACKGROUND_Y: 0 } },
        { tier: 2, initialSize: 37, threshold: 115, name: 'Small', color: 0xFF9800, zoom: 0.5, zoomInStart: 1.0, LEVEL_AREA: { WIDTH: 2800, HEIGHT: 1450 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.0 } },
        { tier: 3, initialSize: 125, threshold: 450, name: 'Medium', color: 0xFF9800, zoom: 0.5, zoomInStart: 1.0, LEVEL_AREA: { WIDTH: 2800, HEIGHT: 1450 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.0 } },
    ];
LEVEL_2_CONFIG['winSize'] = 700;
LEVEL_2_CONFIG['PLAYER'] = {
        GROWTH_FACTOR: 0.15,
        TIER_GROWTH_FACTOR: 0.15,
        SPEED: 200,
        MOUTH_OFFSET: 0.7, // Multiplier for hitbox position relative to player size
        CONSUMPTION_RANGE_BONUS: 10, // Additional pixel range for eating
        INVULNERABILITY_DURATION: 500, // ms of invulnerability after taking damage
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
};
LEVEL_2_CONFIG['TIER_ENTITIES'] = {
        1: [
            // Edibles
            { type: "Sandwich", count: 2, value: 58, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 58, image: 'sandwich'},
            { type: "Tea bag", count: 3, value: 68, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 68, image: 'teabag'},
            { type: "Cake", count: 3, value: 100, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 100, image: 'cake'},
            { type: "Spoon", count: 3, value: 60, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 60, image: 'spoon'},
            { type: "Cup", count: 2, value: 48, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 48, image: 'cup'},
            { type: "Biscuit", count: 5, value: 42, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 42, image: 'biscuit'},
            { type: "Teapot", count: 1, value: 110, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 110, image: 'teapot'},
            // Hazards
            { type: "Mouse", count: 5, value: 60, shape: 'circle', color: 0xFF0000, isHazard: true, size: 60, image: 'mouse' }
        ],
        2: [
            // Edibles
            { 
                type: "Chair", 
                count: 2, 
                value: 300, 
                shape: 'circle',
                color: 0xFFEB3B, 
                isHazard: false,
                hideInPreviousTier: true, 
                size: 300, 
                image: 'chair',
                positions: [{x: 450, y: 400, rotation: 270}, {x: 950, y: 400, rotation: 90}, {x: 450, y: 1000, rotation: 270}, {x: 950, y: 1000, rotation: 90}, {x: 1700, y: 400, rotation: 270}, {x: 2250, y: 400, rotation: 90}, {x: 1700, y: 1000, rotation: 270}, {x: 2250, y: 1000, rotation: 90}]
            },
            { 
                type: "One pound note", 
                count: 10, 
                value: 200, 
                shape: 'circle', 
                color: 0xFFEB3B, 
                isHazard: false, 
                size: 200, 
                image: 'onepoundnote', 
                noCollision: true,
             },
            { type: "Beans can", count: 6, value: 150, shape: 'circle', color: 0xFFEB3B, isHazard: false, size: 150, image: 'beanscan', hideInPreviousTier: true},
            { type: "Teapot", count: 6, value: 110, shape: 'circle', color: 0x03A9F4, isHazard: false, size: 110, image: 'teapot', hideInPreviousTier: true },
            // Hazards
            { 
                    type: "Waiter", 
                    count: 5, 
                    value: 350, 
                    shape: 'circle', 
                    color: 0xFF0000, 
                    isHazard: true,
                    hideInPreviousTier: true,
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
                    value: 350, 
                    shape: 'circle', 
                    color: 0xFF0000, 
                    isHazard: true,
                    hideInPreviousTier: true,
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
        3 : [
            { 
                type: "Table", 
                count: 4, 
                value: 500, 
                shape: 'square',
                color: 0xFFEB3B, 
                isHazard: false,
                size: 500, 
                image: 'table',
                hitbox: { width: 250, height: 100 },
                positions: [{x: 700, y: 400}, {x: 700, y: 1000}, {x: 2000, y: 400}, {x: 2000, y: 1000}]
            },
            { 
                type: "Counter", 
                count: 4, 
                value: 300, 
                shape: 'square',
                color: 0xFFEB3B, 
                isHazard: false,
                size: 700, 
                image: 'emptycounter',
                hitbox: { width: 350, height: 100 },
                positions: [{x: 1450, y: 100}]
            },
        ],
};

const LEVEL_3_CONFIG = JSON.parse(JSON.stringify(LEVEL_2_CONFIG));
LEVEL_3_CONFIG['ENTITY_IMAGES'] = {
        'player_sheet': 'assets/images/ghost.png',
        'coin': 'assets/images/coin.png',
        'onepoundnote': 'assets/images/onepoundnote.png',
        'phonebooth': 'assets/images/phonebooth.png',
    },
LEVEL_3_CONFIG['SIZE_TIERS'] = [
        { tier: 1, initialSize: 26, threshold: 25, name: 'Tiny', color: 0x2196F3, zoom: 1.5, zoomInStart: 4.0, LEVEL_AREA: { WIDTH: 550, HEIGHT: 2000 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level2.png', BACKGROUND_SCALE: 1.5, BACKGROUND_X: 0, BACKGROUND_Y: 0 } },
        { tier: 2, initialSize: 40, threshold: 95, name: 'Small', color: 0xFF9800, zoom: 0.8, zoomInStart: 1.5, LEVEL_AREA: { WIDTH: 1100, HEIGHT: 2200 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level2.png', BACKGROUND_SCALE: 1.0 } },
    ];
LEVEL_3_CONFIG['winSize'] = 210;
LEVEL_3_CONFIG['PLAYER'] = {
        GROWTH_FACTOR: 0.15,
        TIER_GROWTH_FACTOR: 0.15,
        SPEED: 200,
        MOUTH_OFFSET: 0.7, // Multiplier for hitbox position relative to player size
        CONSUMPTION_RANGE_BONUS: 10, // Additional pixel range for eating
        INVULNERABILITY_DURATION: 500, // ms of invulnerability after taking damage
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
};
LEVEL_3_CONFIG['TIER_ENTITIES'] = {
        1: [
            // Edibles
            { type: "Coin", count: 80, value: 25, shape: 'square', color: 0x8BC34A, isHazard: false, image: 'coin', size: 25 },
            { 
                type: "One pound note", 
                count: 1, 
                value: 90, 
                shape: 'circle', 
                color: 0xFFEB3B, 
                isHazard: false, 
                size: 90, 
                image: 'onepoundnote', 
                noCollision: true,
                positions: [{x: 200, y: 1500}],
             },
        ],
        2: [
            // Edibles
            { 
                type: "One pound note", 
                count: 21, 
                value: 90, 
                shape: 'circle', 
                color: 0xFFEB3B, 
                isHazard: false, 
                size: 90, 
                image: 'onepoundnote', 
                noCollision: true,
                hideInPreviousTier: true,
            },
            { 
                type: "Coin", 
                count: 60, 
                value: 25, 
                shape: 'square', 
                color: 0x8BC34A, 
                isHazard: false, 
                image: 'coin', 
                size: 25,
                hideInPreviousTier: true, 
            },
            { 
                type: "Phone booth", 
                count: 1, 
                value: 200, 
                shape: 'square', 
                color: 0x8BC34A, 
                isHazard: false, 
                image: 'phonebooth', 
                size: 200,
                hideInPreviousTier: true,
                positions: [{x: 1000, y: 1000}], 
            },
        ],
};

const LEVEL_4_CONFIG = JSON.parse(JSON.stringify(LEVEL_2_CONFIG));
LEVEL_4_CONFIG['ENTITY_IMAGES'] = {
        'player_sheet': 'assets/images/ghost.png',
        'goose': 'assets/images/goose.png',
        'guard': 'assets/images/guard.png',
    },
LEVEL_4_CONFIG['SIZE_TIERS'] = [
        { tier: 1, initialSize: 40, threshold: 25, name: 'Tiny', color: 0x2196F3, zoom: 1.0, zoomInStart: 4.0, LEVEL_AREA: { WIDTH: 2200, HEIGHT: 1700 }, ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level4.png', BACKGROUND_SCALE: 1.0, BACKGROUND_X: 0, BACKGROUND_Y: 0 } },
    ];
LEVEL_4_CONFIG['winSize'] = 210;
LEVEL_4_CONFIG['PLAYER'] = {
        GROWTH_FACTOR: 0.15,
        TIER_GROWTH_FACTOR: 0.15,
        SPEED: 200,
        MOUTH_OFFSET: 0.7, // Multiplier for hitbox position relative to player size
        CONSUMPTION_RANGE_BONUS: 10, // Additional pixel range for eating
        INVULNERABILITY_DURATION: 500, // ms of invulnerability after taking damage
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
};
LEVEL_4_CONFIG['TIER_ENTITIES'] = {
        1: [
            { type: "Goose", count: 20, value: 39, shape: 'circle', color: 0xFF0000, isHazard: true, size: 39, image: 'goose' },
            { 
                    type: "Guard", 
                    count: 12, 
                    value: 50, 
                    shape: 'circle', 
                    color: 0xFF0000, 
                    isHazard: true,
                    hideInPreviousTier: true,
                    size: 50,
                    SPRITE: {
                        USE_SPRITESHEET: true,
                        KEY: 'guard', // The key used for preloading the image
                        FRAME_WIDTH: 750,         // Width of a single frame
                        FRAME_HEIGHT: 750,        // Height of a single frame
                        ANIMATIONS: {
                            UP: { start: 0, end: 1, rate: 5 },
                            DOWN: { start: 2, end: 3, rate: 5 },
                            LEFT: { start: 4, end: 5, rate: 5 },
                            RIGHT: { start: 6, end: 7, rate: 5 }
                        }
                    },
                    movementType: 'tracking', 
                    speed: 80 
            },
        ],
};

const GameConfig = {
    DEBUG: false,
    PLACEMENT_ATTEMPTS: 500,
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
            name: 'Spot of Tea',
            ...LEVEL_2_CONFIG
        },
        {
            id: 'level3',
            name: 'Spare some change\nfor the phones',
            ...LEVEL_3_CONFIG
        },
        {
            id: 'level4',
            name: 'All hail the King',
            ...LEVEL_4_CONFIG
        },
    ]
};
