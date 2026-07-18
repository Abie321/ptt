// Main game initialization

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#87CEEB', // Sky blue background
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: typeof GameConfig !== 'undefined' ? GameConfig.DEBUG : false
        }
    },
    scene: [MainMenuScene, WorldSelectScene, LevelSelectScene, LevelDetailScene, LevelCreatorScene, GameScene, EndLevelScene]
};

const game = new Phaser.Game(config);
window.game = game; // Expose for debugging/testing
