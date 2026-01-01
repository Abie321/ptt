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
- REQ-CAM-001-004: Top-down camera and character orientation ✅
- REQ-INP-001-004: WASD and Arrow key controls ✅
- REQ-MECH-001-010: Consumption, growth, and size tier mechanics ✅
- REQ-SCR-001-006: Scoring with diminishing returns ✅
- REQ-DMG-001-005: Hazard detection and penalties ✅
- REQ-UI-HUD-001-004: HUD elements ✅
- REQ-UI-MNU-001: Basic main menu ✅
- REQ-UI-END-001: End-of-level summary ✅

### Partially Implemented
- REQ-INP-005: ESC key pauses (no pause menu UI yet)
- REQ-SYS-001: Game loop at 60 FPS (Phaser default, not explicitly set)

### Not Yet Implemented (Future Versions)
- Level selection screen
- Options/settings menu
- Gallery system
- Data persistence
- Multiple levels
- Sound effects
- Credits screen

## Project Structure

```
ptt/
├── index.html              # Main HTML entry point
├── package.json            # NPM dependencies
├── js/
│   ├── main.js            # Phaser game configuration
│   ├── config.js          # Game constants and configuration
│   ├── entities/
│   │   ├── Player.js      # Player character class
│   │   ├── EdibleItem.js  # Consumable items
│   │   └── Hazard.js      # Hazard entities
│   └── scenes/
│       ├── MainMenuScene.js    # Main menu
│       ├── GameScene.js        # Core gameplay
│       └── EndLevelScene.js    # Level completion screen
└── requirements/
    └── requirements.txt   # Full requirements specification
```

## Technical Details

- **Engine**: Phaser 3.80.1
- **Physics**: Arcade Physics (no gravity)
- **World Size**: 1600x1200 pixels
- **Viewport**: 800x600 pixels
- **Target FPS**: 60

## Known Limitations (Prototype)

- No sprite assets (using geometric shapes)
- Single level only
- No save/load functionality
- No sound effects or music
- No animations
- Simplified hazard AI

## Next Steps for Full Implementation

1. Add sprite assets and animations
2. Implement multiple levels with level selection
3. Add persistent data storage (LocalStorage)
4. Create options menu with sound controls
5. Implement gallery/collection system
6. Add sound effects and background music
7. Create pause menu functionality
8. Add more sophisticated hazard behaviors
9. Implement projectile hazards
