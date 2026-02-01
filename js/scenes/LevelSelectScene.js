class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Title
        this.add.text(width / 2, 80, 'SELECT LEVEL', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Back button
        const backBtn = this.add.text(50, 50, '< Back', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#333',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });

        backBtn.on('pointerover', () => backBtn.setStyle({ fill: '#4CAF50' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ fill: '#fff' }));
        backBtn.on('pointerdown', () => {
             this.scene.start('MainMenuScene');
        });

        // Grid of levels
        // Ensure GameConfig.LEVELS exists
        const levels = (typeof GameConfig !== 'undefined' && GameConfig.LEVELS) ? GameConfig.LEVELS : [];

        if (levels.length === 0) {
            this.add.text(width / 2, height / 2, 'No levels found in config!', {
                fontSize: '24px',
                fill: '#ff0000'
            }).setOrigin(0.5);
            return;
        }

        const cols = 3;
        const paddingX = 200;
        const paddingY = 150;
        const startY = 200;

        // Calculate total width of grid to center it
        const rowCount = Math.ceil(levels.length / cols);

        levels.forEach((level, index) => {
             const row = Math.floor(index / cols);
             const col = index % cols;

             // Dynamic centering for the row
             const itemsInThisRow = (row === rowCount - 1) ? (levels.length % cols || cols) : cols;
             const rowWidth = (itemsInThisRow - 1) * paddingX;
             const startX = (width / 2) - (rowWidth / 2);

             const x = startX + (col * paddingX);
             const y = startY + (row * paddingY);

             this.createLevelButton(x, y, level, index + 1);
        });
    }

    createLevelButton(x, y, levelConfig, index) {
        // Container for easier handling (optional, but simple groups work too)

        // Button Background
        const bg = this.add.rectangle(x, y, 160, 120, 0x333333)
            .setInteractive({ useHandCursor: true });

        // Level Number/Title
        this.add.text(x, y - 20, `Level ${index}`, {
            fontSize: '16px',
            fill: '#aaa'
        }).setOrigin(0.5);

        const name = this.add.text(x, y + 10, levelConfig.name || 'Unknown', {
            fontSize: '22px',
            fill: '#fff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 140 }
        }).setOrigin(0.5);

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x4CAF50);
            this.tweens.add({
                targets: bg,
                scale: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x333333);
             this.tweens.add({
                targets: bg,
                scale: 1,
                duration: 100
            });
        });

        bg.on('pointerdown', () => {
            this.scene.start('GameScene', { levelConfig: levelConfig });
        });
    }
}
