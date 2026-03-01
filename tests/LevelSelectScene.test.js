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

  test('should create modal container hidden', () => {
    expect(levelSelectScene.add.container).toHaveBeenCalled();
    expect(levelSelectScene.modalContainer).toBeDefined();
    expect(levelSelectScene.modalContainer.visible).toBe(false);
  });

  test('should show modal when level button clicked', () => {
    // Find the first level button (interactive one)
    // The first call to createLevelButton is for Level 1.
    // We need to find the interactive object attached to it.
    // In our mock, createLevelButton creates a circle and calls setInteractive on it.

    // Let's spy on showModal
    const showModalSpy = jest.spyOn(levelSelectScene, 'showModal');

    // Re-create scene to attach spy
    levelSelectScene.add.circle.mockClear();
    levelSelectScene.create(); // Rerunning create might duplicate things in the "scene" but mocks are cleared manually or we just check calls.

    // We need to trigger the pointerdown event on the button.
    // The button logic is:
    // bg.on('pointerdown', () => { this.showModal(levelConfig, index); });

    // We need to find the specific mock object returned by add.circle that corresponds to a level button.
    const circleResults = levelSelectScene.add.circle.mock.results;
    // The first 24 circles are level buttons (assuming order).
    // create() calls createLevelButton loop first.
    // The first one is Level 1 (real level).
    const level1Btn = circleResults[0].value;

    // Verify it has on('pointerdown')
    const pointerDownCall = level1Btn.on.mock.calls.find(call => call[0] === 'pointerdown');
    expect(pointerDownCall).toBeDefined();

    // Execute callback
    const callback = pointerDownCall[1];
    callback();

    expect(showModalSpy).toHaveBeenCalledWith(expect.objectContaining({ id: 'level1' }), 1);
    expect(levelSelectScene.modalContainer.setVisible).toHaveBeenCalledWith(true);
  });

  test('play button should start game scene', () => {
    // Show modal first to set currentLevelConfig
    const levelConfig = { id: 'test', name: 'Test Level' };
    levelSelectScene.showModal(levelConfig, 1);

    // Find play button
    // It's created in createModal.
    // createModal is called at the end of create().
    // It adds a rectangle 150x50.
    const rectCalls = levelSelectScene.add.rectangle.mock.calls;
    const playBtnArgs = rectCalls.find(call => call[2] === 150 && call[3] === 50);
    // We need the result object to trigger event.
    // We can iterate results and match args? No, mock.results[i] corresponds to mock.calls[i].
    const playBtnIndex = rectCalls.findIndex(call => call[2] === 150 && call[3] === 50);
    const playBtn = levelSelectScene.add.rectangle.mock.results[playBtnIndex].value;

    const pointerDownCall = playBtn.on.mock.calls.find(call => call[0] === 'pointerdown');
    const callback = pointerDownCall[1];

    callback();

    expect(levelSelectScene.scene.start).toHaveBeenCalledWith('GameScene', { levelConfig: levelConfig });
  });

  test('cancel button should hide modal', () => {
    // Show modal first
    levelSelectScene.modalContainer.setVisible(true);

    // Find cancel button (150x40)
    const rectCalls = levelSelectScene.add.rectangle.mock.calls;
    const cancelBtnIndex = rectCalls.findIndex(call => call[2] === 150 && call[3] === 40);
    const cancelBtn = levelSelectScene.add.rectangle.mock.results[cancelBtnIndex].value;

    const pointerDownCall = cancelBtn.on.mock.calls.find(call => call[0] === 'pointerdown');
    const callback = pointerDownCall[1];

    callback();

    expect(levelSelectScene.modalContainer.setVisible).toHaveBeenCalledWith(false);
  });
});
