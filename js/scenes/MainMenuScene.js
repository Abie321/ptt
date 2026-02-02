// Main Menu Scene

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Title
        this.add.text(width / 2, height / 3, 'TASTY PLANET', {
            fontSize: '64px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 3 + 70, 'Fan Game Prototype', {
            fontSize: '24px',
            fill: '#aaa'
        }).setOrigin(0.5);

        // Play button
        const playButton = this.add.text(width / 2, height / 2, 'PLAY', {
            fontSize: '48px',
            fill: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        playButton.on('pointerover', () => {
            playButton.setScale(1.1);
        });

        playButton.on('pointerout', () => {
            playButton.setScale(1);
        });

        playButton.on('pointerdown', () => {
            this.scene.start('WorldSelectScene');
        });

        // Instructions
        this.add.text(width / 2, height - 100, 'Use WASD or Arrow Keys to move\nEat smaller items to grow!\nAvoid red hazards!', {
            fontSize: '20px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Version
        this.add.text(10, height - 30, 'v0.1.0 - Prototype', {
            fontSize: '16px',
            fill: '#666'
        });
    }
}
