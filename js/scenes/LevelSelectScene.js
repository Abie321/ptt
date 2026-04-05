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
             this.scene.start('WorldSelectScene');
        });

        // Grid of levels
        // Ensure GameConfig.LEVELS exists
        const realLevels = (typeof GameConfig !== 'undefined' && GameConfig.LEVELS) ? GameConfig.LEVELS : [];

        // Add dummy levels for layout testing
        const allLevels = [...realLevels];
        const totalSlots = 11; // Ensure we have enough to show 3 rows
        for (let i = realLevels.length; i < totalSlots; i++) {
            allLevels.push({ dummy: true });
        }

        const cols = 8;
        const buttonWidth = 80;
        const buttonHeight = 60;
        const spacing = 15; // Gap between buttons

        // Calculate grid metrics
        const gridWidth = (cols * buttonWidth) + ((cols - 1) * spacing);
        const startX = (width - gridWidth) / 2 + (buttonWidth / 2);
        const startY = 200;

        allLevels.forEach((level, index) => {
             const row = Math.floor(index / cols);
             const col = index % cols;

             const x = startX + (col * (buttonWidth + spacing));
             const y = startY + (row * (buttonHeight + spacing));

             this.createLevelButton(x, y, level, index + 1, buttonWidth, buttonHeight);
        });
    }

    createLevelButton(x, y, levelConfig, index, w, h) {
        const isDummy = levelConfig.dummy;
        const color = isDummy ? 0x555555 : 0x333333;

        // Button Background
        const radius = Math.min(w, h) / 2;
        const bg = this.add.circle(x, y, radius, color);

        // Level Number
        this.add.text(x, y, `${index}`, {
            fontSize: '24px',
            fill: isDummy ? '#888' : '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        if (!isDummy) {
            bg.setInteractive({ useHandCursor: true });

            // Hover effects
            bg.on('pointerover', () => {
                bg.setFillStyle(0x4CAF50); // Green on hover
                this.tweens.add({
                    targets: bg,
                    scale: 1.1,
                    duration: 100
                });
            });

            bg.on('pointerout', () => {
                bg.setFillStyle(0x333333); // Back to normal
                this.tweens.add({
                    targets: bg,
                    scale: 1,
                    duration: 100
                });
            });

            bg.on('pointerdown', () => {
                this.scene.start('LevelDetailScene', { levelConfig: levelConfig, index: index });
            });
        }
    }
}
