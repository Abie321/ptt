const fs = require('fs');
const path = require('path');

// Load required classes
const scenePath = path.join(__dirname, '../js/scenes/LevelSelectScene.js');
const sceneCode = fs.readFileSync(scenePath, 'utf8').replace('class LevelSelectScene', 'global.LevelSelectScene = class LevelSelectScene');

eval(sceneCode);

describe('LevelSelectScene', () => {
  let levelSelectScene;

  beforeEach(() => {
    levelSelectScene = new LevelSelectScene();
    // Mock cameras.main
    levelSelectScene.cameras = {
      main: { width: 800, height: 600 }
    };
    levelSelectScene.create();
  });

  test('should create grid buttons', () => {
    // We expect buttons to be created.
    // In our mock, add.circle is called for each button.
    // 2 configured levels + dummy levels to reach 11 total.
    // Each button has a background circle.

    // Let's filter calls to find level buttons.
    // Level buttons have radius 30 (min(80, 60) / 2).
    const circleCalls = levelSelectScene.add.circle.mock.calls;
    const levelButtons = circleCalls.filter(call => call[2] === 30);
    expect(levelButtons.length).toBe(11);
  });

  test('should go to LevelDetailScene when level button clicked', () => {
    const circleResults = levelSelectScene.add.circle.mock.results;
    const level1Btn = circleResults[0].value;

    // Verify it has on('pointerdown')
    const pointerDownCall = level1Btn.on.mock.calls.find(call => call[0] === 'pointerdown');
    expect(pointerDownCall).toBeDefined();

    // Execute callback
    const callback = pointerDownCall[1];
    callback();

    expect(levelSelectScene.scene.start).toHaveBeenCalledWith('LevelDetailScene', { levelConfig: expect.objectContaining({ id: 'level1' }), index: 1 });
  });
});
