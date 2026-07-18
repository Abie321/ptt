# Tasty Planet Fan Game - Prototype v0.1

A fan-made video game inspired by Tasty Planet, built with Phaser JS.

## Overview

This is a prototype implementation of a top-down consumption game where you control a character that grows by eating smaller objects while avoiding larger hazards.

## Features Implemented (v0.1)

### Core Gameplay
- ✅ Top-down perspective with player-controlled character
- ✅ WASD and Arrow Key movement controls
- ✅ Consumption mechanics with mouth hitbox detection
- ✅ 5-tier size progression system
- ✅ Dynamic player growth and scaling
- ✅ Edible items across all size tiers (varying shapes and colors)
- ✅ Hazard entities that damage the player

### Scoring System
- ✅ Points awarded for consumption (80 base points)
- ✅ Diminishing returns algorithm based on item type repetition
- ✅ Score penalties for hazard collisions (-80 points)
- ✅ 3-star rating system based on score thresholds

### UI Elements
- ✅ Main Menu with Play button
- ✅ HUD with size indicator (current tier)
- ✅ Progress bar showing advancement to next tier
- ✅ Live score display
- ✅ Timer showing elapsed game time
- ✅ End-of-level summary with stats and stars

### Game Mechanics
- ✅ Camera follows player and zooms out as player grows
- ✅ Items from Size Tier N-2 despawn when player advances
- ✅ Player can consume current tier and previous tier items
- ✅ Hazards move with bounce physics
- ✅ Win condition: Complete tier 5 quota

## How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Game

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:8080
```

### Alternative (No Installation)

Simply open `index.html` in a modern web browser. The game loads Phaser from a CDN.

## Testing

A comprehensive test suite is included to verify all game features work correctly after each development cycle.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite covers all features listed in this README:

#### Core Gameplay Tests
- ✅ Player movement (WASD and Arrow keys)
- ✅ Mouth hitbox detection and positioning
- ✅ Consumption mechanics
- ✅ 5-tier size progression system
- ✅ Dynamic player growth and scaling
- ✅ Edible item variety (shapes, colors, tiers)
- ✅ Hazard entities and collision detection

#### Scoring System Tests
- ✅ Base point awards (80 points)
- ✅ Diminishing returns algorithm
- ✅ Item type variety rewards
- ✅ Score penalties for hazards (-80 points)
- ✅ 3-star rating thresholds

#### UI/HUD Tests
- ✅ Size indicator display
- ✅ Progress bar updates
- ✅ Live score display
- ✅ Timer formatting (MM:SS)
- ✅ HUD element positioning

#### Game Mechanics Tests
- ✅ Camera follow and zoom
- ✅ Item despawning (tier N-2)
- ✅ Consumable tier rules
- ✅ Hazard bounce physics
- ✅ Win condition (tier 5 completion)
- ✅ Pause functionality (ESC key)

### Test Files

```
tests/
├── setup.js              # Test configuration and mocks
├── Player.test.js        # Player movement, consumption, tier advancement (100+ tests)
├── EdibleItem.test.js    # Item creation and properties
├── Hazard.test.js        # Hazard behavior and physics
├── GameScene.test.js     # Game mechanics and integration tests
├── ScoringSystem.test.js # Comprehensive scoring algorithm tests
└── UI.test.js            # HUD and UI element tests
```

### Viewing Coverage Reports

After running `npm run test:coverage`, open `coverage/index.html` in your browser to see a detailed coverage report showing:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

## How to Play

1. **Movement**: Use WASD or Arrow Keys to move your character
2. **Objective**: Eat smaller items (green/blue/yellow) to grow
3. **Growth**: Consume enough items to advance through 5 size tiers
4. **Avoid**: Red hazards that are larger than you (they reduce your score)
5. **Win**: Complete all 5 tiers by eating the required quota of items

### Scoring Tips
- First-time consumption of an item type awards maximum points (80)
- Repeated consumption of the same item type awards fewer points
- Avoid hazards to maintain your score
- Reach 3000+ points for 3 stars!

## Requirements Implementation Status

Based on `requirements/requirements.txt`:

### Fully Implemented
- REQ-TECH-001: Phaser JS game engine ✅
- REQ-CAM-001-004: Top-down camera, character orientation, and zooming ✅
- REQ-INP-001-004: WASD and Arrow key controls ✅
- REQ-MECH-001-010: Consumption, growth, size tier mechanics, and tier N-2 despawning ✅
- REQ-SCR-001-006: Scoring with decaying returns based on density ✅
- REQ-SCR-007-008: 3-star rating thresholds per level ✅
- REQ-DMG-001, REQ-DMG-003-005: Hazard size categorization and score penalty ✅
- REQ-UI-HUD-001-004: Size indicator, level progress bar, timer, and score HUD ✅
- REQ-UI-LVL-001, REQ-UI-LVL-005: World Select, Level Select grid, and Level Detail views ✅
- REQ-UI-END-001: End-of-level summary scene with stats and stars ✅

### Partially Implemented
- REQ-INP-005: ESC key pauses physics and updates (no menu overlay UI yet)
- REQ-SYS-001: Game loop at 60 FPS (Phaser default, not explicitly capped)
- REQ-UI-MNU-001: Basic main menu (Play functions; Options and Gallery button layouts exist but are inactive)
- REQ-UI-LVL-002: Level lock visuals (World 1 is unlocked, others are locked; individual level locking is not active)

### Not Yet Implemented (Future Versions)
- REQ-DMG-002: Projectiles emitted by hazards
- REQ-UI-LVL-003: Stars earned display under level circle buttons
- REQ-UI-LVL-004: Hover level descriptions on selection screen
- REQ-UI-OPT-001-002: Sound options toggles and credits panel
- REQ-UI-GAL-001-002: Gallery screen showing cumulative eaten item counters
- REQ-PRG-001-002: Sequential lock logic for level progression
- REQ-DAT-001: Local browser storage data persistence

## Project Structure

```
ptt/
├── index.html              # Main HTML entry point
├── package.json            # NPM dependencies
├── PLANNING.md             # Developer planning and roadmap
├── PROJECT_MEMORY.md       # Technical project memory documentation
├── README.md               # Game overview and setup instructions
├── assets/
│   └── images/            # Level background screens and sprite sheets
├── js/
│   ├── main.js            # Phaser game initialization config
│   ├── config.js          # World and level entity declarations
│   ├── entities/
│   │   ├── Player.js      # Player character movement and scale
│   │   ├── EdibleItem.js  # Consumable items
│   │   └── Hazard.js      # Obstacles and dynamic enemies
│   └── scenes/
│       ├── MainMenuScene.js    # Game title screen
│       ├── WorldSelectScene.js # World map selection
│       ├── LevelSelectScene.js # Level grid selector
│       ├── LevelDetailScene.js # Level info, stars and start button
│       ├── GameScene.js        # Main gameplay loops and physics
│       └── EndLevelScene.js    # Level win statistics and results
└── requirements/
    └── requirements.txt   # Detailed software requirements document
```

## Technical Details

- **Engine**: Phaser 3.80.1
- **Physics**: Arcade Physics (no gravity)
- **World Size**: Dynamically loaded based on tier configurations (up to 3300x2546 pixels)
- **Viewport**: 800x600 pixels
- **Target FPS**: 60

## Known Limitations (Prototype)

- Simple ESC pause lacks a Resume/Restart overlay menu.
- Progression state and configurations are not saved between refreshes.
- No sound effects or background music track.
- Hazard entities move with bounce physics but do not shoot projectiles.

## Next Steps for Full Implementation

1. **Pause Menu UI**: Add Resume and Exit buttons to the pause state.
2. **Local Storage Integration**: Add a SaveManager utility for level progression.
3. **Audio FX**: Integrate eat sounds and level completion sounds.
4. **Options Screen**: Connect volume toggles and simple credits text.
5. **Collection Gallery**: Display the gallery screen with item icons and counts.

