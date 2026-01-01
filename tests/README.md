# Test Suite Documentation

This directory contains a comprehensive test suite for the Tasty Planet Fan Game, covering all features listed in the main README.

## Overview

The test suite uses **Jest** as the testing framework with custom mocks for Phaser 3. It provides:
- Unit tests for individual components
- Integration tests for game mechanics
- Comprehensive coverage of all game features
- Automated verification after each development cycle

## Test Files

### setup.js
Test configuration and Phaser mocking utilities. This file:
- Loads game configuration
- Creates Phaser mocks for headless testing
- Provides helper functions for simulating game events
- Sets up global test utilities

### Player.test.js (100+ tests)
Tests for the Player class covering:
- **Initialization**: Starting values, tier, position
- **Movement Controls**: WASD and Arrow keys in all directions
- **Mouth Hitbox**: Positioning and directional updates
- **Size Progression**: All 5 tiers with quotas
- **Consumption Mechanics**: Item consumption and tracking
- **Scoring System**: Points calculation and diminishing returns
- **Hazard Damage**: Penalty application
- **Progress Tracking**: Quota completion percentage

### EdibleItem.test.js
Tests for edible items covering:
- **Item Creation**: All tiers and types
- **Visual Variety**: Shapes (circle, square, triangle)
- **Size Scaling**: Tier-based sizing
- **Position**: Spawn location tracking
- **Item Types**: 10 unique types per tier
- **Destruction**: Safe cleanup

### Hazard.test.js
Tests for hazard entities covering:
- **Hazard Creation**: Tiers 2-5
- **Visual Appearance**: Red color, semi-transparent
- **Physics**: Bounce mechanics, world bounds
- **Movement**: Initial velocity
- **Size**: Larger than edible items
- **Destruction**: Safe cleanup

### GameScene.test.js
Integration tests for the main game scene covering:
- **Scene Initialization**: Player, world, camera setup
- **Camera System**: Follow, zoom, effects
- **Item Spawning**: All tiers and hazards
- **Tier Advancement**: Item despawning, visual effects
- **HUD Elements**: All UI components
- **Consumption Mechanics**: Item detection and scoring
- **Hazard Collisions**: Damage and visual feedback
- **Win Condition**: Tier 5 completion
- **Star Rating**: Score thresholds (0-3 stars)
- **Pause Functionality**: ESC key handling
- **Game Loop**: Update cycle

### ScoringSystem.test.js
Comprehensive scoring algorithm tests covering:
- **Base Points**: 80 points for first consumption
- **Diminishing Returns**: Decay algorithm
- **Item Type Tracking**: Independent scoring per type
- **Tier Density**: Factor in decay calculation
- **Score Penalties**: -80 points for hazards
- **Star Thresholds**: 500, 1500, 3000 points
- **Variety Rewards**: Different item types
- **Edge Cases**: Negative scores, high counts
- **Cross-Tier Scoring**: Consumption history persistence

### UI.test.js
UI and HUD element tests covering:
- **HUD Initialization**: All elements present
- **Size Indicator**: Tier name and number display
- **Progress Bar**: Width updates, color coding
- **Score Display**: Real-time updates, negative values
- **Timer Display**: MM:SS format, leading zeros
- **HUD Layout**: Positioning, scroll factor
- **Color Coding**: Unique tier colors
- **Update Frequency**: Frame-by-frame updates

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Output

Tests provide clear feedback:
```
PASS tests/Player.test.js
  Player
    Initialization
      ✓ should initialize with correct starting values (5ms)
      ✓ should start at tier 1 with Micro size (2ms)
    Movement Controls
      ✓ should move up when W or Up arrow is pressed (3ms)
      ...
```

### Coverage Reports

Coverage reports show:
- **Statements**: % of code statements executed
- **Branches**: % of conditional branches tested
- **Functions**: % of functions called
- **Lines**: % of lines executed

View the HTML report at `coverage/index.html` after running `npm run test:coverage`.

## Test Philosophy

### Comprehensive Coverage
Every feature listed in the README has corresponding tests. This ensures:
- Features work as documented
- Regressions are caught immediately
- New features can be verified
- Code quality is maintained

### Isolated Unit Tests
Individual components are tested in isolation:
- Player logic separate from scene
- Items and hazards independent
- Scoring algorithm isolated

### Integration Tests
GameScene tests verify components work together:
- Player + Items + Scoring
- Camera + Player + Tier advancement
- HUD + Game state

### Edge Case Testing
Tests include boundary conditions:
- Minimum and maximum values
- Negative scores
- High consumption counts
- Tier boundaries

## Adding New Tests

When adding features, follow this pattern:

```javascript
describe('Feature Name', () => {
  let scene;
  let component;

  beforeEach(() => {
    scene = createMockScene();
    component = new Component(scene);
  });

  describe('Specific Behavior', () => {
    test('should do something specific', () => {
      // Arrange
      const input = setupTestData();

      // Act
      const result = component.doSomething(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## Test Utilities

### createMockScene()
Creates a mock Phaser scene with all necessary mocks.

### simulateKeyPress(key, isDown)
Simulates keyboard input for testing movement.

### GameConfig
Global game configuration loaded in setup.js.

### Phaser
Mocked Phaser object with:
- Scene class
- Math utilities
- Input constants
- Add methods

## Continuous Testing

### During Development
Run `npm run test:watch` to automatically test as you code:
- Tests run on file save
- Only affected tests re-run
- Fast feedback loop

### Before Commits
Run `npm test` to ensure all tests pass:
- Catches breaking changes
- Verifies feature completeness
- Maintains code quality

### After Each Development Cycle
Run `npm run test:coverage` to verify:
- All features are tested
- Coverage hasn't decreased
- New features have tests

## Test Maintenance

### Updating Tests
When game behavior changes:
1. Update corresponding test expectations
2. Run full test suite
3. Verify coverage hasn't decreased

### Adding Features
For new features:
1. Write tests first (TDD approach recommended)
2. Implement feature
3. Verify all tests pass
4. Add to README test coverage section

### Debugging Failures
When tests fail:
1. Read the error message carefully
2. Check what was expected vs. received
3. Use `console.log` in tests if needed
4. Run single test file: `npm test -- Player.test.js`

## Coverage Goals

Current coverage targets:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Known Test Limitations

- Tests use mocked Phaser, not actual game engine
- No visual rendering tests
- No performance/FPS tests
- No browser compatibility tests
- No touch/mobile input tests

For actual gameplay testing, use the game in a browser.

## Future Test Enhancements

Planned improvements:
- Scene transition tests (MainMenu, EndLevel)
- Keyboard event integration tests
- Performance benchmarks
- Visual regression testing
- E2E tests with Puppeteer
