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
        const totalSlots = 24; // Ensure we have enough to show 3 rows
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

        // Initialize modal (hidden)
        this.createModal(width, height);
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
                this.showModal(levelConfig, index);
            });
        }
    }

    createModal(width, height) {
        this.modalContainer = this.add.container(0, 0);
        this.modalContainer.setVisible(false);
        this.modalContainer.setDepth(100); // Ensure it's on top

        // 1. Background Blocker
        const blocker = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        blocker.setInteractive(); // Blocks clicks behind it
        this.modalContainer.add(blocker);

        // 2. Modal Window
        const modalWidth = 400;
        const modalHeight = 300;
        const modalBg = this.add.rectangle(width / 2, height / 2, modalWidth, modalHeight, 0x222222);
        modalBg.setStrokeStyle(2, 0xffffff);
        this.modalContainer.add(modalBg);

        // 3. Level Title (e.g. "Level 1")
        this.modalLevelTitle = this.add.text(width / 2, height / 2 - 80, 'Level X', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.modalContainer.add(this.modalLevelTitle);

        // 4. Level Name (e.g. "Kitchen")
        this.modalLevelName = this.add.text(width / 2, height / 2 - 30, 'Level Name', {
            fontSize: '24px',
            fill: '#aaa',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        this.modalContainer.add(this.modalLevelName);

        // 5. Play Button
        const playBtnBg = this.add.rectangle(width / 2, height / 2 + 50, 150, 50, 0x4CAF50)
            .setInteractive({ useHandCursor: true });
        const playBtnText = this.add.text(width / 2, height / 2 + 50, 'PLAY', {
            fontSize: '24px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        playBtnBg.on('pointerover', () => playBtnBg.setFillStyle(0x66BB6A));
        playBtnBg.on('pointerout', () => playBtnBg.setFillStyle(0x4CAF50));
        playBtnBg.on('pointerdown', () => {
            if (this.currentLevelConfig) {
                this.scene.start('GameScene', { levelConfig: this.currentLevelConfig });
            }
        });

        this.modalContainer.add([playBtnBg, playBtnText]);

        // 6. Cancel Button
        const cancelBtnBg = this.add.rectangle(width / 2, height / 2 + 110, 150, 40, 0x666666)
            .setInteractive({ useHandCursor: true });
        const cancelBtnText = this.add.text(width / 2, height / 2 + 110, 'Cancel', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0.5);

        cancelBtnBg.on('pointerover', () => cancelBtnBg.setFillStyle(0x888888));
        cancelBtnBg.on('pointerout', () => cancelBtnBg.setFillStyle(0x666666));
        cancelBtnBg.on('pointerdown', () => {
            this.modalContainer.setVisible(false);
        });

        this.modalContainer.add([cancelBtnBg, cancelBtnText]);
    }

    showModal(levelConfig, index) {
        this.currentLevelConfig = levelConfig;
        this.modalLevelTitle.setText(`Level ${index}`);
        this.modalLevelName.setText(levelConfig.name || 'Unknown Level');
        this.modalContainer.setVisible(true);
    }
}
