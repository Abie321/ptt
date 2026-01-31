// Game configuration constants

const GameConfig = {
    // Size tier configuration
    SIZE_TIERS: [
        { tier: 1, quota: 10, scale: 1.0, name: 'Micro', color: 0x4CAF50, zoom: 1.0 },
        { tier: 2, quota: 15, scale: 1.5, name: 'Tiny', color: 0x2196F3, zoom: 0.9 },
        { tier: 3, quota: 20, scale: 2.0, name: 'Small', color: 0xFF9800, zoom: 0.8 },
        { tier: 4, quota: 25, scale: 2.5, name: 'Medium', color: 0xF44336, zoom: 0.7 },
        { tier: 5, quota: 30, scale: 3.0, name: 'Large', color: 0x9C27B0, zoom: 0.6 }
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
        INITIAL_SIZE: 20,
        SPEED: 200,
        MOUTH_OFFSET: 0.7, // Multiplier for hitbox position relative to player size
        SPRITE: {
            USE_SPRITESHEET: true,
            KEY: 'player_sheet',
            FRAME_WIDTH: 352,
            FRAME_HEIGHT: 384,
            ANIMATIONS: {
                IDLE: { start: 0, end: 3, rate: 8 },
                MOVE: { start: 4, end: 7, rate: 12 }
            }
        }
    },

    // World configuration
    WORLD: {
        WIDTH: 1600,
        HEIGHT: 1200
    },

    ASSETS: {
        BACKGROUND_IMAGE: 'assets/images/background.png'
    },

    ENTITY_IMAGES: {
        'apple': 'assets/images/apple.png',
        'player_sheet': 'assets/images/ghost.png'
    },
  
    // Entities configuration per tier
    // Each entry: { type: 'Name', count: N, value: Score, shape: 'circle'|'square'|'triangle', color: Hex, isHazard: boolean }
    TIER_ENTITIES: {
        1: [
            { type: "Bacteria", count: 3, value: 5, shape: 'circle', color: 0x8BC34A, isHazard: false },
            { type: "Plankton", count: 3, value: 5, shape: 'square', color: 0x8BC34A, isHazard: false },
            { type: "Virus", count: 3, value: 5, shape: 'triangle', color: 0x8BC34A, isHazard: false },
            { type: "Cell", count: 3, value: 5, shape: 'circle', color: 0x8BC34A, isHazard: false },
            { type: "Spore", count: 3, value: 5, shape: 'square', color: 0x8BC34A, isHazard: false },
            { type: "Amoeba", count: 3, value: 5, shape: 'triangle', color: 0x8BC34A, isHazard: false },
            { type: "Germ", count: 3, value: 5, shape: 'circle', color: 0x8BC34A, isHazard: false },
            { type: "Mite", count: 3, value: 5, shape: 'square', color: 0x8BC34A, isHazard: false },
            { type: "Algae", count: 3, value: 5, shape: 'triangle', color: 0x8BC34A, isHazard: false },
            { type: "Yeast", count: 3, value: 5, shape: 'circle', color: 0x8BC34A, isHazard: false }
        ],
        2: [
            // Edibles
            { type: "Ant", count: 3, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false },
            { type: "Crumb", count: 3, value: 10, shape: 'square', color: 0x03A9F4, isHazard: false },
            { type: "Dust", count: 2, value: 10, shape: 'triangle', color: 0x03A9F4, isHazard: false },
            { type: "Seed", count: 3, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false },
            { type: "Flea", count: 2, value: 10, shape: 'square', color: 0x03A9F4, isHazard: false },
            { type: "Gnat", count: 3, value: 10, shape: 'triangle', color: 0x03A9F4, isHazard: false },
            { type: "Pollen", count: 2, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false },
            { type: "Sand", count: 3, value: 10, shape: 'square', color: 0x03A9F4, isHazard: false },
            { type: "Rice", count: 2, value: 10, shape: 'triangle', color: 0x03A9F4, isHazard: false },
            { type: "Lint", count: 2, value: 10, shape: 'circle', color: 0x03A9F4, isHazard: false },
            // Hazards
            { type: "Predator Mite", count: 5, value: 50, shape: 'circle', color: 0xFF0000, isHazard: true }
        ],
        3: [
            // Edibles
            { type: "Bug", count: 3, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false },
            { type: "Pebble", count: 3, value: 15, shape: 'square', color: 0xFFEB3B, isHazard: false },
            { type: "Berry", count: 2, value: 15, shape: 'triangle', color: 0xFFEB3B, isHazard: false },
            { type: "Coin", count: 3, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false },
            { type: "Beetle", count: 2, value: 15, shape: 'square', color: 0xFFEB3B, isHazard: false },
            { type: "Marble", count: 3, value: 15, shape: 'triangle', color: 0xFFEB3B, isHazard: false },
            { type: "Button", count: 2, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false },
            { type: "Bean", count: 3, value: 15, shape: 'square', color: 0xFFEB3B, isHazard: false },
            { type: "Nut", count: 2, value: 15, shape: 'triangle', color: 0xFFEB3B, isHazard: false },
            { type: "Leaf", count: 2, value: 15, shape: 'circle', color: 0xFFEB3B, isHazard: false },
            // Hazards
            { type: "Spider", count: 6, value: 60, shape: 'circle', color: 0xFF0000, isHazard: true }
        ],
        4: [
            // Edibles
            { type: "Mouse", count: 3, value: 20, shape: 'circle', color: 0xFF5722, isHazard: false },
            { type: "Apple", count: 3, value: 20, shape: 'square', color: 0xFF5722, isHazard: false, image: 'apple' },
            { type: "Rock", count: 2, value: 20, shape: 'triangle', color: 0xFF5722, isHazard: false },
            { type: "Can", count: 3, value: 20, shape: 'circle', color: 0xFF5722, isHazard: false },
            { type: "Rat", count: 2, value: 20, shape: 'square', color: 0xFF5722, isHazard: false },
            { type: "Bird", count: 3, value: 20, shape: 'triangle', color: 0xFF5722, isHazard: false },
            { type: "Frog", count: 2, value: 20, shape: 'circle', color: 0xFF5722, isHazard: false },
            { type: "Phone", count: 3, value: 20, shape: 'square', color: 0xFF5722, isHazard: false },
            { type: "Shoe", count: 2, value: 20, shape: 'triangle', color: 0xFF5722, isHazard: false },
            { type: "Cup", count: 2, value: 20, shape: 'circle', color: 0xFF5722, isHazard: false },
            // Hazards
            { type: "Cat", count: 7, value: 70, shape: 'circle', color: 0xFF0000, isHazard: true }
        ],
        5: [
            // Edibles
            { type: "Cat", count: 3, value: 25, shape: 'circle', color: 0xE91E63, isHazard: false },
            { type: "Chair", count: 3, value: 25, shape: 'square', color: 0xE91E63, isHazard: false },
            { type: "Bush", count: 2, value: 25, shape: 'triangle', color: 0xE91E63, isHazard: false },
            { type: "Tire", count: 3, value: 25, shape: 'circle', color: 0xE91E63, isHazard: false },
            { type: "Dog", count: 2, value: 25, shape: 'square', color: 0xE91E63, isHazard: false },
            { type: "Table", count: 3, value: 25, shape: 'triangle', color: 0xE91E63, isHazard: false },
            { type: "Fence", count: 2, value: 25, shape: 'circle', color: 0xE91E63, isHazard: false },
            { type: "Bike", count: 3, value: 25, shape: 'square', color: 0xE91E63, isHazard: false },
            { type: "Sign", count: 2, value: 25, shape: 'triangle', color: 0xE91E63, isHazard: false },
            { type: "Box", count: 2, value: 25, shape: 'circle', color: 0xE91E63, isHazard: false },
            // Hazards
            { type: "Human", count: 8, value: 80, shape: 'circle', color: 0xFF0000, isHazard: true }
        ]
    }
};
