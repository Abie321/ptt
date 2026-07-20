// Main game initialization

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    transparent: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: typeof GameConfig !== 'undefined' ? GameConfig.DEBUG : false
        }
    },
    scene: [MainMenuScene, WorldSelectScene, LevelSelectScene, LevelDetailScene, LevelCreatorScene, GameScene, EndLevelScene]
};

if (typeof ConfigLoader !== 'undefined') {
    ConfigLoader.loadAllConfig();
}

const game = new Phaser.Game(config);
window.game = game; // Expose for debugging/testing
