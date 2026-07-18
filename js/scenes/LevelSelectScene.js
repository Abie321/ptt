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

        // Load custom levels from localStorage
        let customLevels = [];
        try {
            const saved = localStorage.getItem('custom_levels');
            if (saved) {
                customLevels = JSON.parse(saved);
                // Mark them as custom
                customLevels.forEach(cl => cl.isCustom = true);
            }
        } catch (e) {
            console.error('Failed to parse custom levels:', e);
        }

        // Add dummy levels for layout testing
        const allLevels = [...realLevels, ...customLevels];
        const totalSlots = 11; // Ensure we have enough to show 3 rows
        for (let i = allLevels.length; i < totalSlots; i++) {
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
        const isCustom = levelConfig.isCustom;
        
        let color = 0x333333;
        if (isDummy) {
            color = 0x555555;
        } else if (isCustom) {
            color = 0x2196F3; // Blue for custom levels
        }

        // Button Background
        const radius = Math.min(w, h) / 2;
        const bg = this.add.circle(x, y, radius, color);

        // Level Number (or 'C' + custom index)
        let label = `${index}`;
        if (isCustom) {
            const customIndex = index - GameConfig.LEVELS.length;
            label = `C${customIndex}`;
        }

        this.add.text(x, y, label, {
            fontSize: '24px',
            fill: isDummy ? '#888' : '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        if (!isDummy) {
            bg.setInteractive({ useHandCursor: true });

            const baseColor = isCustom ? 0x2196F3 : 0x333333;

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
                bg.setFillStyle(baseColor); // Back to normal color
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
