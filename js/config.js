// Game configuration constants

const ENTITY_TEMPLATES = {
    "Tea drop": {
            "type": "Tea drop",
            "value": 11,
            "shape": "circle",
            "color": 9159498,
            "isHazard": false,
            "image": "teadrop",
            "size": [
                    9,
                    17
            ],
            "hideInNextTier": true
    },
    "Cookie crumb": {
            "type": "Cookie crumb",
            "value": 11,
            "shape": "square",
            "color": 9159498,
            "isHazard": false,
            "image": "crumb",
            "size": [
                    9,
                    17
            ],
            "hideInNextTier": true
    },
    "Coin": {
            "type": "Coin",
            "value": 25,
            "shape": "square",
            "color": 9159498,
            "isHazard": false,
            "image": "coin",
            "size": 25
    },
    "Sugarcube": {
            "type": "Sugarcube",
            "value": 18,
            "shape": "square",
            "color": 9159498,
            "isHazard": false,
            "image": "cube",
            "size": 18
    },
    "Sandwich": {
            "type": "Sandwich",
            "value": 58,
            "shape": "circle",
            "color": 240116,
            "isHazard": false,
            "size": 58,
            "image": "sandwich"
    },
    "Tea bag": {
            "type": "Tea bag",
            "value": 68,
            "shape": "circle",
            "color": 240116,
            "isHazard": false,
            "size": 68,
            "image": "teabag"
    },
    "Cake": {
            "type": "Cake",
            "value": 100,
            "shape": "circle",
            "color": 240116,
            "isHazard": false,
            "size": 100,
            "image": "cake"
    },
    "Spoon": {
            "type": "Spoon",
            "value": 60,
            "shape": "circle",
            "color": 240116,
            "isHazard": false,
            "size": 60,
            "image": "spoon"
    },
    "Cup": {
            "type": "Cup",
            "value": 48,
            "shape": "circle",
            "color": 240116,
            "isHazard": false,
            "size": 48,
            "image": "cup"
    },
    "Biscuit": {
            "type": "Biscuit",
            "value": 42,
            "shape": "circle",
            "color": 240116,
            "isHazard": false,
            "size": 42,
            "image": "biscuit"
    },
    "Teapot": {
            "type": "Teapot",
            "shape": "circle",
            "color": 240116,
            "isHazard": false,
            "image": "teapot"
    },
    "Mouse": {
            "type": "Mouse",
            "value": 60,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "size": 60,
            "image": "mouse"
    },
    "Mouse Spawner": {
            "type": "Mouse Spawner",
            "value": 60,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "size": 60,
            "image": "mouse",
            "hideInPreviousTier": true
    },
    "One pound note": {
            "type": "One pound note",
            "shape": "circle",
            "color": 16771899,
            "isHazard": false,
            "image": "onepoundnote",
            "noCollision": true
    },
    "Beans can": {
            "type": "Beans can",
            "shape": "circle",
            "color": 16771899,
            "isHazard": false,
            "image": "beanscan"
    },
    "Chair": {
            "type": "Chair",
            "shape": "circle",
            "isHazard": false,
            "image": "chair"
    },
    "Table": {
            "type": "Table",
            "isHazard": false
    },
    "Counter": {
            "type": "Counter",
            "value": 300,
            "shape": "square",
            "color": 16771899,
            "isHazard": false,
            "image": "emptycounter"
    },
    "Waiter": {
            "type": "Waiter",
            "value": 350,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "hideInPreviousTier": true,
            "size": 350,
            "SPRITE": {
                    "USE_SPRITESHEET": true,
                    "KEY": "waiter",
                    "FRAME_WIDTH": 750,
                    "FRAME_HEIGHT": 750,
                    "ANIMATIONS": {
                            "UP": {
                                    "start": 0,
                                    "end": 1,
                                    "rate": 10
                            },
                            "DOWN": {
                                    "start": 2,
                                    "end": 3,
                                    "rate": 10
                            },
                            "LEFT": {
                                    "start": 4,
                                    "end": 5,
                                    "rate": 10
                            },
                            "RIGHT": {
                                    "start": 6,
                                    "end": 7,
                                    "rate": 10
                            }
                    }
            }
    },
    "Customer": {
            "type": "Customer",
            "value": 350,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "hideInPreviousTier": true,
            "size": 350,
            "SPRITE": {
                    "USE_SPRITESHEET": true,
                    "KEY": "customer",
                    "FRAME_WIDTH": 750,
                    "FRAME_HEIGHT": 750,
                    "ANIMATIONS": {
                            "UP": {
                                    "start": 0,
                                    "end": 1,
                                    "rate": 10
                            },
                            "DOWN": {
                                    "start": 2,
                                    "end": 3,
                                    "rate": 10
                            },
                            "LEFT": {
                                    "start": 4,
                                    "end": 5,
                                    "rate": 10
                            },
                            "RIGHT": {
                                    "start": 6,
                                    "end": 7,
                                    "rate": 10
                            }
                    }
            }
    },
    "Phone booth": {
            "type": "Phone booth",
            "shape": "square",
            "color": 9159498,
            "isHazard": false,
            "image": "phonebooth"
    },
    "Goose": {
            "type": "Goose",
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "image": "goose"
    },
    "Guard": {
            "type": "Guard",
            "value": 78,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "hideInPreviousTier": true,
            "size": 78,
            "visual_size": 100,
            "SPRITE": {
                    "USE_SPRITESHEET": true,
                    "KEY": "guard",
                    "FRAME_WIDTH": 750,
                    "FRAME_HEIGHT": 750,
                    "ANIMATIONS": {
                            "UP": {
                                    "start": 0,
                                    "end": 1,
                                    "rate": 5
                            },
                            "DOWN": {
                                    "start": 2,
                                    "end": 3,
                                    "rate": 5
                            },
                            "LEFT": {
                                    "start": 4,
                                    "end": 5,
                                    "rate": 5
                            },
                            "RIGHT": {
                                    "start": 6,
                                    "end": 7,
                                    "rate": 5
                            }
                    }
            },
            "movementType": "tracking",
            "speed": 80
    },
    "King": {
            "type": "King",
            "value": 119,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "hideInPreviousTier": true,
            "size": 119,
            "visual_size": 140,
            "SPRITE": {
                    "USE_SPRITESHEET": true,
                    "KEY": "king",
                    "FRAME_WIDTH": 750,
                    "FRAME_HEIGHT": 750,
                    "ANIMATIONS": {
                            "UP": {
                                    "start": 0,
                                    "end": 1,
                                    "rate": 5
                            },
                            "DOWN": {
                                    "start": 2,
                                    "end": 3,
                                    "rate": 5
                            },
                            "LEFT": {
                                    "start": 4,
                                    "end": 5,
                                    "rate": 5
                            },
                            "RIGHT": {
                                    "start": 6,
                                    "end": 7,
                                    "rate": 5
                            }
                    }
            },
            "movementType": "tracking",
            "speed": 80
    },
    "Brit": {
            "type": "Brit",
            "value": 20,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "hideInPreviousTier": true,
            "size": 20,
            "visual_size": 25,
            "SPRITE": {
                    "USE_SPRITESHEET": true,
                    "KEY": "brit",
                    "FRAME_WIDTH": 750,
                    "FRAME_HEIGHT": 750,
                    "ANIMATIONS": {
                            "UP": {
                                    "start": 0,
                                    "end": 1,
                                    "rate": 5
                            },
                            "DOWN": {
                                    "start": 2,
                                    "end": 3,
                                    "rate": 5
                            },
                            "LEFT": {
                                    "start": 4,
                                    "end": 5,
                                    "rate": 5
                            },
                            "RIGHT": {
                                    "start": 6,
                                    "end": 7,
                                    "rate": 5
                            }
                    }
            }
    },
    "Tourist": {
            "type": "Tourist",
            "value": 20,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "hideInPreviousTier": true,
            "size": 20,
            "visual_size": 25,
            "SPRITE": {
                    "USE_SPRITESHEET": true,
                    "KEY": "tourist",
                    "FRAME_WIDTH": 750,
                    "FRAME_HEIGHT": 750,
                    "ANIMATIONS": {
                            "UP": {
                                    "start": 0,
                                    "end": 1,
                                    "rate": 5
                            },
                            "DOWN": {
                                    "start": 2,
                                    "end": 3,
                                    "rate": 5
                            },
                            "LEFT": {
                                    "start": 4,
                                    "end": 5,
                                    "rate": 5
                            },
                            "RIGHT": {
                                    "start": 6,
                                    "end": 7,
                                    "rate": 5
                            }
                    }
            }
    },
    "Cyclist": {
            "type": "Cyclist",
            "value": 20,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "hideInPreviousTier": true,
            "size": 20,
            "image": "cyclist"
    },
    "Bush": {
            "type": "Bush",
            "shape": "circle",
            "color": 16711680,
            "isHazard": false,
            "image": "bush"
    },
    "Streetlight": {
            "type": "Streetlight",
            "value": 25,
            "shape": "circle",
            "color": 16711680,
            "isHazard": false,
            "size": 25,
            "image": "streetlight"
    },
    "Building, Large": {
            "type": "Building, Large",
            "value": 100,
            "shape": "square",
            "color": 9159498,
            "isHazard": false,
            "hideInPreviousTier": true,
            "size": 100,
            "image": "building2"
    },
    "Building, Small": {
            "type": "Building, Small",
            "value": 75,
            "shape": "square",
            "color": 9159498,
            "isHazard": false,
            "hideInPreviousTier": true,
            "size": 75,
            "image": "building2"
    },
    "Tree": {
            "type": "Tree",
            "value": 50,
            "shape": "circle",
            "color": 16711680,
            "isHazard": false,
            "hideInPreviousTier": true,
            "size": 50,
            "image": "tree"
    },
    "Awning": {
            "type": "Awning",
            "value": 40,
            "shape": "circle",
            "color": 16711680,
            "isHazard": false,
            "size": 40,
            "hideInPreviousTier": true,
            "image": "awning"
    },
    "Car": {
            "type": "Car",
            "value": 40,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "size": 40,
            "image": "car"
    },
    "Taxi": {
            "type": "Taxi",
            "value": 40,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "size": 40,
            "image": "taxi"
    },
    "Doubledecker bus": {
            "type": "Doubledecker bus",
            "value": 60,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "hideInPreviousTier": true,
            "size": 60,
            "image": "doubledecker"
    },
    "Duck": {
            "type": "Duck",
            "value": 20,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "size": 20,
            "image": "duck",
            "movementType": "random_facing"
    },
    "Swan": {
            "type": "Swan",
            "value": 125,
            "shape": "circle",
            "color": 16711680,
            "isHazard": true,
            "size": 125,
            "image": "swan",
            "movementType": "random_facing"
    },
};


const GLOBAL_ASSET_REGISTRY = {
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
    'emptycounter': 'assets/images/emptycounter.png',
    'phonebooth': 'assets/images/phonebooth.png',
    'goose': 'assets/images/goose.png',
    'guard': 'assets/images/guard.png',
    'king': 'assets/images/king.png',
    'tourist': 'assets/images/tourist.png',
    'brit': 'assets/images/brit.png',
    'cyclist': 'assets/images/cyclist.png',
    'bush': 'assets/images/bush.png',
    'streetlight': 'assets/images/streetlight.png',
    'circletable': 'assets/images/circletable.png',
    'building1': 'assets/images/building1.png',
    'building2': 'assets/images/building2.png',
    'awning': 'assets/images/awning.png',
    'car': 'assets/images/car.png',
    'taxi': 'assets/images/taxi.png',
    'doubledecker': 'assets/images/doubledecker.png',
    'tree': 'assets/images/tree.png',
    'duck': 'assets/images/duck.png',
    'swan': 'assets/images/swan.png'
};

const BASE_LEVEL_CONFIG = {
    VIEW_AREA: { WIDTH: 800, HEIGHT: 600 },
    SCORING: {
        MAX_POINTS_PER_ITEM: 80,
        MIN_POINTS_PER_ITEM: 1,
        HAZARD_PENALTY: 80
    },
    STAR_THRESHOLDS: {
        ONE_STAR: 500,
        TWO_STAR: 1500,
        THREE_STAR: 3000
    },
    EFFECTS: {
        SMOKE_DURATION_MIN: 100,
        SMOKE_DURATION_MAX: 1000
    },
    PLAYER: {
        GROWTH_FACTOR: 0.15,
        TIER_GROWTH_FACTOR: 0.15,
        SPEED: 200,
        MOUTH_OFFSET: 0.7,
        CONSUMPTION_RANGE_BONUS: 10,
        INVULNERABILITY_DURATION: 500,
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
    }
};

const GameConfig = {
    DEBUG: false,
    PLACEMENT_ATTEMPTS: 500,
    WORLDS: [
       { name: "Ghost", subtitle: "Death isn't the end of you, but it is the end for London." },
        { name: "Stingray", subtitle: "The Atlantic isn't safe from poachers, and so isn't your appetite." },
        { name: "Snake", subtitle: "Eat your way through an indian zoo." },
        { name: "Pigeon", subtitle: "Consume NYC and gain the ability to fly." },
        { name: "Jaguar", subtitle: "A consumption journey of the Amazon." },
        { name: "Seagull", subtitle: "The ultimate feasting on Shanghai!" },
        { name: "Goo", subtitle: "Start in a petri dish and eat your way to the end of the universe!" }

    ],
    LEVELS: [],

    // Registration Helper
    registerLevel(levelData) {
        // Deep clone base config as start
        const merged = JSON.parse(JSON.stringify(BASE_LEVEL_CONFIG));
        
        // Merge level-specific overrides
        Object.assign(merged, levelData);
        if (levelData.PLAYER) {
            merged.PLAYER = Object.assign({}, BASE_LEVEL_CONFIG.PLAYER, levelData.PLAYER);
            if (levelData.PLAYER.SPRITE) {
                merged.PLAYER.SPRITE = Object.assign({}, BASE_LEVEL_CONFIG.PLAYER.SPRITE, levelData.PLAYER.SPRITE);
            }
        }

        // Expand TIER_ENTITIES from templates
        merged.TIER_ENTITIES = {};
        for (const tier in levelData.TIER_ENTITIES) {
            merged.TIER_ENTITIES[tier] = levelData.TIER_ENTITIES[tier].map(item => {
                const template = ENTITY_TEMPLATES[item.type] || {};
                
                // Deep merge standard template and overrides (needed to avoid nested objects like SPRITE getting overwritten completely)
                const mergedItem = JSON.parse(JSON.stringify(template));
                
                // Perform deep merge of properties
                Object.keys(item).forEach(key => {
                    if (item[key] && typeof item[key] === 'object' && !Array.isArray(item[key])) {
                        mergedItem[key] = Object.assign({}, mergedItem[key] || {}, item[key]);
                    } else {
                        mergedItem[key] = item[key];
                    }
                });
                
                return mergedItem;
            });
        }

        // Auto-generate ENTITY_IMAGES preloads mapping
        merged.ENTITY_IMAGES = {};
        // Add player sheet by default
        const playerKey = merged.PLAYER.SPRITE.KEY;
        if (GLOBAL_ASSET_REGISTRY[playerKey]) {
            merged.ENTITY_IMAGES[playerKey] = GLOBAL_ASSET_REGISTRY[playerKey];
        }
        
        // Scan all entities for custom images
        for (const tier in merged.TIER_ENTITIES) {
            merged.TIER_ENTITIES[tier].forEach(entity => {
                // If it uses custom key in SPRITE config, load that
                if (entity.SPRITE && entity.SPRITE.KEY && GLOBAL_ASSET_REGISTRY[entity.SPRITE.KEY]) {
                    merged.ENTITY_IMAGES[entity.SPRITE.KEY] = GLOBAL_ASSET_REGISTRY[entity.SPRITE.KEY];
                }
                // Otherwise normal image
                if (entity.image && GLOBAL_ASSET_REGISTRY[entity.image]) {
                    merged.ENTITY_IMAGES[entity.image] = GLOBAL_ASSET_REGISTRY[entity.image];
                }
            });
        }

        // In level 5, there was building1 in ENTITY_IMAGES even though building1 wasn't used in entities.
        // Let's add any custom preloads if specified under levelData.ENTITY_IMAGES (e.g. for legacy preloads)
        if (levelData.ENTITY_IMAGES) {
            Object.assign(merged.ENTITY_IMAGES, levelData.ENTITY_IMAGES);
        }

        this.LEVELS.push(merged);
    }
};
