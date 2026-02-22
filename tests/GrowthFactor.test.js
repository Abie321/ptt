const fs = require('fs');
const path = require('path');

// Load Player class
const playerPath = path.join(__dirname, '../js/entities/Player.js');
const playerCode = fs.readFileSync(playerPath, 'utf8');
const modifiedPlayerCode = playerCode.replace('class Player', 'global.Player = class Player');
eval(modifiedPlayerCode);

describe('Player Growth Factor', () => {
    let scene;

    beforeEach(() => {
        scene = createMockScene();
        // Ensure clean slate for GameConfig modifications
        if (global.GameConfig && global.GameConfig.LEVELS) {
            // Reset to Level 1 base
            Object.assign(global.GameConfig, global.GameConfig.LEVELS[0]);
        }
    });

    test('should use configured GROWTH_FACTOR', () => {
        // Set specific growth factor
        global.GameConfig.PLAYER.GROWTH_FACTOR = 0.5;

        const player = new Player(scene, 0, 0);
        expect(player.GROWTH_FACTOR).toBe(0.5);
    });

    test('should fallback to 0.1 if GROWTH_FACTOR is undefined', () => {
        // Remove growth factor
        delete global.GameConfig.PLAYER.GROWTH_FACTOR;

        const player = new Player(scene, 0, 0);
        expect(player.GROWTH_FACTOR).toBe(0.1);
    });

    test('should apply different growth amounts based on factor', () => {
        const item = { tier: 1, size: 10, value: 10 };

        // Case 1: Factor 0.1
        global.GameConfig.PLAYER.GROWTH_FACTOR = 0.1;
        const player1 = new Player(scene, 0, 0);
        const initialArea1 = player1.size * player1.size;
        player1.consume(item);
        const finalArea1 = player1.size * player1.size;
        const addedArea1 = finalArea1 - initialArea1;

        // Case 2: Factor 0.5
        global.GameConfig.PLAYER.GROWTH_FACTOR = 0.5;
        const player2 = new Player(scene, 0, 0);
        const initialArea2 = player2.size * player2.size;
        player2.consume(item);
        const finalArea2 = player2.size * player2.size;
        const addedArea2 = finalArea2 - initialArea2;

        expect(addedArea2).toBeCloseTo(addedArea1 * 5, 2);
    });
});
