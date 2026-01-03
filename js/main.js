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
            debug: false
        }
    },
    scene: [MainMenuScene, GameScene, EndLevelScene]
};

const game = new Phaser.Game(config);
window.game = game; // Expose for debugging/testing
