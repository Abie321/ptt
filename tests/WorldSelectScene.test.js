const fs = require('fs');
const path = require('path');

// Load WorldSelectScene
const scenePath = path.join(__dirname, '../js/scenes/WorldSelectScene.js');
const sceneCode = fs.readFileSync(scenePath, 'utf8').replace('class WorldSelectScene', 'global.WorldSelectScene = class WorldSelectScene');
eval(sceneCode);

describe('WorldSelectScene', () => {
    let scene;

    beforeEach(() => {
        scene = new WorldSelectScene();
        scene.cameras = {
            main: { width: 800, height: 600 }
        };
        scene.create();
    });

    test('should create 7 world buttons', () => {
        const rectCalls = scene.add.rectangle.mock.calls;
        // We expect at least 7 rectangles for the world buttons
        expect(rectCalls.length).toBeGreaterThanOrEqual(7);
    });

    test('should have World 1 unlocked', () => {
        // World 1 is the first button created.
        const rectCalls = scene.add.rectangle.mock.calls;
        const rectResults = scene.add.rectangle.mock.results;

        // Index 0 is World 1
        const world1 = rectResults[0].value;
        const world1Args = rectCalls[0]; // [x, y, w, h, color]

        // Check color (0x333333 is unlocked)
        expect(world1Args[4]).toBe(0x333333);

        // Check interactivity
        expect(world1.setInteractive).toHaveBeenCalled();
    });

    test('should have World 2 locked', () => {
        // World 2 is the second button
        const rectCalls = scene.add.rectangle.mock.calls;
        const rectResults = scene.add.rectangle.mock.results;

        const world2 = rectResults[1].value;
        const world2Args = rectCalls[1];

        // Check color (0x555555 is locked)
        expect(world2Args[4]).toBe(0x555555);

        // Check alpha (0.5)
        expect(world2.setAlpha).toHaveBeenCalledWith(0.5);

        // Check it is NOT interactive (setInteractive not called on this specific object)
        expect(world2.setInteractive).not.toHaveBeenCalled();
    });

    test('World 1 click should go to LevelSelectScene', () => {
        const rectResults = scene.add.rectangle.mock.results;
        const world1 = rectResults[0].value;

        const pointerDownCall = world1.on.mock.calls.find(call => call[0] === 'pointerdown');
        const callback = pointerDownCall[1];

        callback();
        expect(scene.scene.start).toHaveBeenCalledWith('LevelSelectScene');
    });

    test('Back button should go to MainMenuScene', () => {
        // Back button is text
        const textResults = scene.add.text.mock.results;

        // Back button is the one with "< Back"
        const backTextCallIndex = scene.add.text.mock.calls.findIndex(call => call[2] === '< Back');
        const backBtn = textResults[backTextCallIndex].value;

        const pointerDownCall = backBtn.on.mock.calls.find(call => call[0] === 'pointerdown');
        const callback = pointerDownCall[1];

        callback();
        expect(scene.scene.start).toHaveBeenCalledWith('MainMenuScene');
    });
});
