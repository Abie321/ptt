
const fs = require('fs');
const path = require('path');

const loadFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf8');
};

const playerCode = loadFile(path.join(__dirname, '../js/entities/Player.js'));
const gameSceneCode = loadFile(path.join(__dirname, '../js/scenes/GameScene.js'));

const playerCodeGlobal = playerCode.replace('class Player', 'global.Player = class Player');
const gameSceneCodeGlobal = gameSceneCode.replace('class GameScene', 'global.GameScene = class GameScene');

eval(playerCodeGlobal);
eval(gameSceneCodeGlobal);

describe('Winnability Validation', () => {
    let scene;

    beforeEach(() => {
        scene = new global.GameScene();

        scene.add = {
            group: jest.fn(() => ({
                add: jest.fn(),
                getChildren: jest.fn(() => []),
                countActive: jest.fn(),
                getLength: jest.fn(() => 0), // Added getLength mock
                clear: jest.fn()
            })),
            text: jest.fn().mockReturnThis(),
            rectangle: jest.fn().mockReturnThis(),
            circle: jest.fn().mockReturnThis()
        };

        const mockObj = {
            setOrigin: jest.fn().mockReturnThis(),
            setScrollFactor: jest.fn().mockReturnThis(),
            setInteractive: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            setDepth: jest.fn().mockReturnThis(),
            setText: jest.fn()
        };
        scene.add.text.mockReturnValue(mockObj);
        scene.add.rectangle.mockReturnValue(mockObj);

        // Correctly mock physics with body creation
        scene.physics = {
            pause: jest.fn(),
            add: {
                existing: jest.fn((sprite) => {
                    sprite.body = {
                        setCollideWorldBounds: jest.fn(),
                        setVelocity: jest.fn(),
                        setImmovable: jest.fn(),
                        setBounce: jest.fn()
                    };
                })
            },
            world: { setBounds: jest.fn() }
        };

        scene.cameras = {
            main: {
                width: 800,
                height: 600,
                setBounds: jest.fn(),
                startFollow: jest.fn(),
                setZoom: jest.fn(),
                shake: jest.fn(),
                flash: jest.fn()
            }
        };

        scene.input = {
            keyboard: {
                createCursorKeys: jest.fn(() => ({})),
                addKey: jest.fn(() => ({})),
                on: jest.fn()
            }
        };

        scene.events = {
            on: jest.fn(),
            emit: jest.fn()
        };

        scene.scene = {
            restart: jest.fn(),
            start: jest.fn(),
            pause: jest.fn()
        };

        scene.player = new global.Player(scene, 0, 0);
        scene.edibleItems = {};
        for(let t=1; t<=5; t++) {
            scene.edibleItems[t] = scene.add.group();
        }
        scene.hazards = scene.add.group();
    });

    test('should pass validation when items are sufficient', () => {
        scene.edibleItems[1].getLength.mockReturnValue(30); // Changed from countActive
        scene.edibleItems[2].getLength.mockReturnValue(30);
        scene.edibleItems[3].getLength.mockReturnValue(30);
        scene.edibleItems[4].getLength.mockReturnValue(30);
        scene.edibleItems[5].getLength.mockReturnValue(30);

        const result = scene.checkWinnability();
        expect(result).toBe(true);
    });

    test('should fail validation when Tier 5 is impossible', () => {
        scene.edibleItems[1].getLength.mockReturnValue(50);
        scene.edibleItems[2].getLength.mockReturnValue(50);
        scene.edibleItems[3].getLength.mockReturnValue(50);
        scene.edibleItems[4].getLength.mockReturnValue(10);
        scene.edibleItems[5].getLength.mockReturnValue(5);

        const result = scene.checkWinnability();
        expect(result).toBe(false);
    });

    test('should fail validation when Tier 2 is impossible (early fail)', () => {
        scene.edibleItems[1].getLength.mockReturnValue(5);
        scene.edibleItems[2].getLength.mockReturnValue(100);

        const result = scene.checkWinnability();
        expect(result).toBe(false);
    });

    test('should correctly handle despawn logic (items from T(N-2) are lost)', () => {
        scene.edibleItems[1].getLength.mockReturnValue(10);
        scene.edibleItems[2].getLength.mockReturnValue(40);
        scene.edibleItems[3].getLength.mockReturnValue(20);
        scene.edibleItems[4].getLength.mockReturnValue(5);
        scene.edibleItems[5].getLength.mockReturnValue(100);

        const result = scene.checkWinnability();
        expect(result).toBe(true);
    });

    test('showImpossibleWarning should create UI and pause physics', () => {
        scene.showImpossibleWarning();

        expect(scene.physics.pause).toHaveBeenCalled();
        expect(scene.add.rectangle).toHaveBeenCalled();
        expect(scene.add.text).toHaveBeenCalled();
    });
});
