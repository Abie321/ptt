// End Level Scene

class EndLevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndLevelScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalTime = data.time || 0;
        this.stars = data.stars || 0;
        this.levelConfig = data.levelConfig;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Title
        this.add.text(width / 2, 100, 'LEVEL COMPLETE!', {
            fontSize: '56px',
            fill: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stats
        const minutes = Math.floor(this.finalTime / 60);
        const seconds = this.finalTime % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.add.text(width / 2, 220, `Time: ${timeStr}`, {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.add.text(width / 2, 270, `Score: ${this.finalScore}`, {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Stars
        const starY = 350;
        const starSpacing = 80;
        const startX = width / 2 - starSpacing;

        for (let i = 0; i < 3; i++) {
            const color = i < this.stars ? 0xFFD700 : 0x444444;
            const star = this.add.star(startX + (i * starSpacing), starY, 5, 15, 30, color);
        }

        // Buttons
        const playAgainButton = this.add.text(width / 2, height - 150, 'PLAY AGAIN', {
            fontSize: '36px',
            fill: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        playAgainButton.on('pointerover', () => playAgainButton.setScale(1.1));
        playAgainButton.on('pointerout', () => playAgainButton.setScale(1));
        playAgainButton.on('pointerdown', () => this.scene.start('GameScene', { levelConfig: this.levelConfig }));

        const menuButton = this.add.text(width / 2, height - 100, 'MAIN MENU', {
            fontSize: '28px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive();

        menuButton.on('pointerover', () => menuButton.setScale(1.1));
        menuButton.on('pointerout', () => menuButton.setScale(1));
        menuButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
    }
}
