# Tasty Planet Fan Game - Technical Project Memory

This document serves as the project memory for the Tasty Planet Fan Game codebase. It documents the core architecture, design decisions, game configuration structures, mathematical formulas, and testing systems to help any developer (or AI assistant) quickly onboard and contribute.

---

## 🏗️ Core Architecture & Scene Flow

The game is built on **Phaser 3** using standard scene management. It does not use external build bundlers (like Webpack or Vite) but rather loads vanilla ES5/ES6 scripts sequentially in `index.html`.

### 1. Scene Registry & Transitions
The scenes are initialized in [js/main.js](file:///home/alanebarber3/ptt/ptt/js/main.js) in the following order:
1. `MainMenuScene`: Application splash screen and entrance.
2. `WorldSelectScene`: Displays world buttons. Currently, 7 worlds are hardcoded; World 1 is active, others are locked.
3. `LevelSelectScene`: Displays a grid of levels for the chosen world.
4. `LevelDetailScene`: Displays level name, star thresholds (1, 2, and 3-star values), and has the primary "PLAY" button.
5. `GameScene`: Handles gameplay, spawning, physics, HUD, and time tracking.
6. `EndLevelScene`: Results screen shown upon completing a level, displaying time, score, and stars.

```mermaid
graph LR
    MainMenu[MainMenuScene] --> WorldSelect[WorldSelectScene]
    WorldSelect --> LevelSelect[LevelSelectScene]
    LevelSelect --> LevelDetail[LevelDetailScene]
    LevelDetail --> Game[GameScene]
    Game --> EndLevel[EndLevelScene]
    EndLevel --> MainMenu
```

### 2. Entities System
Game entities are defined in [js/entities/](file:///home/alanebarber3/ptt/ptt/js/entities/):
- `Player`: Manages keyboard inputs (WASD/Arrows), physics velocity, direction-based animations, mouth hitbox calculation, visual scale updates, consumption, and tier advancement.
- `EdibleItem`: Represents consumable items. Contains properties for type, size, tier, value (score), and color.
- `Hazard`: Represents obstacles that damage the player. Can move, bounce off borders, or be eaten if the player is larger than the hazard.

---

## ⚙️ Game Configuration System

All levels, sizes, scoring rules, and entity types are configured in [js/config.js](file:///home/alanebarber3/ptt/ptt/js/config.js). The main object is `GameConfig` which contains:
- `DEBUG`: Boolean flag to turn on Phaser physics body debug boxes.
- `WORLDS`: List of worlds.
- `LEVELS`: List of level configuration structures.

### Level Configuration Structure
Each level config (e.g. `LEVEL_1_CONFIG`) defines:
- `winSize`: The final target size needed to trigger the level win condition.
- `SIZE_TIERS`: An array of tiers configuring how the player scales.
  - `tier`: Index number (1, 2, 3, etc.).
  - `initialSize`: Starting radius for this tier.
  - `threshold`: Growth progress size target before advancing to the next tier.
  - `name`: Text label shown on HUD (e.g., 'Micro', 'Tiny', 'Small').
  - `color`: Hex color used for circle fallback graphics.
  - `zoom`: Camera zoom factor to apply when in this tier.
  - `LEVEL_AREA`: Width/height bounds of the active game space.
- `SCORING`: Points and penalties config.
- `STAR_THRESHOLDS`: Scores required for 1, 2, and 3-star ratings.
- `PLAYER`: Growth parameters, speed, mouth positioning multiplier, invulnerability duration.
- `ENTITY_IMAGES`: Key-value map of texture identifiers to image asset paths.
- `TIER_ENTITIES`: Map where key is the size tier (1, 2, etc.) and value is an array of entity templates:
  ```javascript
  {
      type: "Sandwich",
      count: 5,        // Number of items to spawn
      value: 58,       // Base score awarded
      shape: 'circle',
      size: 58,        // Physical size of the item
      image: 'sandwich',
      isHazard: false, // Flag to identify hazards
      hideInPreviousTier: true // Visually hide in smaller tiers
  }
  ```

---

## 🧮 Core Algorithms & Math Formulas

### 1. Mouth Hitbox Positioning
Instead of checking collisions against the player's center point, consumption is triggered only when food enters the player's **mouth**.
- **Math**: The mouth coordinates $(x_m, y_m)$ are calculated relative to the player's center $(x_p, y_p)$, player radius $R$, normalized movement direction vector $(\hat{d}_x, \hat{d}_y)$, and a configured mouth offset multiplier $M_{\text{offset}}$ (default 0.7):
$$x_m = x_p + \hat{d}_x \cdot (R \cdot M_{\text{offset}})$$
$$y_m = y_p + \hat{d}_y \cdot (R \cdot M_{\text{offset}})$$
- **Mouth Collision**: During update loops, Phaser checks if the mouth coordinate falls inside the bounds of the target edible entity's physics body.

### 2. Player Dual-Scale Growth
To prevent the player from looking disproportionately large or small when jumping between level areas, the player has two independent size metrics:
- **Visual Size (`size`)**: Determines physical size in the Phaser scene. When the player eats an item, the player's visual area increases:
$$\text{Area}_{\text{new}} = \text{size}^2 + (\text{itemSize}^2 \cdot \text{scale}_{\text{current}}^2 \cdot \text{GROWTH\_FACTOR})$$
$$\text{size}_{\text{new}} = \sqrt{\text{Area}_{\text{new}}}$$
- **Internal Size (`internalSize`)**: Determines tier progression. It is unaffected by camera scaling/re-baselining:
$$\text{InternalArea}_{\text{new}} = \text{internalSize}^2 + (\text{itemSize}^2 \cdot \text{TIER\_GROWTH\_FACTOR})$$
$$\text{internalSize}_{\text{new}} = \sqrt{\text{InternalArea}_{\text{new}}}$$
- **Tier Advancement**: Triggered when `internalSize` exceeds the `threshold` specified for the current tier in the level configuration.

### 3. Score Diminishing Returns (Decay Formula)
Eaten items award points. To encourage variety, repeating the same food type degrades its point value.
- **Math**: For a consumed item of type $T$ with base value $V_{\text{base}}$, consumption count $C_T$, and total entity count $D_T$ (density) in that tier:
$$\text{DecayFactor} = 0.9^{\frac{C_T - 1}{D_T}}$$
$$\text{Points} = \max(V_{\text{min}}, \lfloor V_{\text{base}} \cdot \text{DecayFactor} \rfloor)$$
- **Score Penalties**: Hazard collisions subtract 80 points. The score can go negative and remain negative until enough items are consumed to recover.

---

## 🧪 Testing Infrastructure

The test suite runs on **Jest** with `jest-environment-jsdom` and uses `jest-canvas-mock` to mock Phaser's HTML5 canvas dependency.

### Running Tests
- Standard run: `npm test`
- Watch changes: `npm run test:watch`
- Code coverage report: `npm run test:coverage` (outputs report in `coverage/lcov-report/index.html`)

### Core Mocks
All Phaser game engine objects, scenes, cameras, keys, physics bodies, and tweens are mocked in [tests/setup.js](file:///home/alanebarber3/ptt/ptt/tests/setup.js). This allows the integration and unit tests to verify:
- Accurate player movement vectors.
- Mouth coordinates matching velocity directions.
- Consumption events, scoring point awards, and diminishing returns.
- Boundary condition checks for size advancement and camera zooming.
- UI layouts, progress bar widths, and timers updating in real-time.

---

## 🛠️ Known Technical Debt & Future Challenges

1. **Pause Menu UI**: Pressing `ESC` freezes Phaser's scene manager but has no user-facing recovery menu. Needs a pause overlay scene or canvas UI elements.
2. **Hardcoded Progression**: The World Selection screen unlocks only World 1 by default, but there is no mechanism to unlock Worlds 2-7. Level locks are completely inactive.
3. **Data Persistence**: The options, high scores, stars, and gallery counters are lost on page refresh. Needs a standard browser `localStorage` integration.
4. **Hazard Projectiles**: Config references `REQ-DMG-002` projectile hazard but the entities do not currently shoot or instantiate sub-hazards.
5. **Fallbacks**: If images fail to load or are not configured, entities fall back to geometric shapes. Ensure fallbacks are styled cleanly for debug builds.
