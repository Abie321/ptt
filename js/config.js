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
        MOUTH_OFFSET: 0.7 // Multiplier for hitbox position relative to player size
    },

    // World configuration
    WORLD: {
        WIDTH: 1600,
        HEIGHT: 1200
    },

    // Item spawn configuration
    ITEMS_PER_TIER: {
        1: 30,
        2: 25,
        3: 25,
        4: 25,
        5: 25
    },

    ASSETS: {
        BACKGROUND_IMAGE: 'assets/images/background.png'
    },
  
    ITEM_NAMES: {
        1: ["Bacteria", "Plankton", "Virus", "Cell", "Spore", "Amoeba", "Germ", "Mite", "Algae", "Yeast"],
        2: ["Ant", "Crumb", "Dust", "Seed", "Flea", "Gnat", "Pollen", "Sand", "Rice", "Lint"],
        3: ["Bug", "Pebble", "Berry", "Coin", "Beetle", "Marble", "Button", "Bean", "Nut", "Leaf"],
        4: ["Mouse", "Apple", "Rock", "Can", "Rat", "Bird", "Frog", "Phone", "Shoe", "Cup"],
        5: ["Cat", "Chair", "Bush", "Tire", "Dog", "Table", "Fence", "Bike", "Sign", "Box"]
    },

    HAZARD_NAMES: {
        2: "Predator Mite",
        3: "Spider",
        4: "Cat",
        5: "Human"
    }
};
