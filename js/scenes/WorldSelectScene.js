class WorldSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldSelectScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Title
        this.add.text(width / 2, 80, 'SELECT WORLD', {
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

        // World Buttons
        const totalWorlds = 7;
        const buttonWidth = 80;
        const buttonHeight = 120;
        const spacing = 20;

        const totalWidth = (totalWorlds * buttonWidth) + ((totalWorlds - 1) * spacing);
        const startX = (width - totalWidth) / 2 + (buttonWidth / 2);
        const startY = height / 2;

        for (let i = 0; i < totalWorlds; i++) {
            const worldIndex = i + 1;
            const x = startX + (i * (buttonWidth + spacing));
            const y = startY;

            this.createWorldButton(x, y, worldIndex, buttonWidth, buttonHeight);
        }
    }

    createWorldButton(x, y, index, w, h) {
        const isUnlocked = (index === 1);
        const color = isUnlocked ? 0x333333 : 0x555555;
        const alpha = isUnlocked ? 1 : 0.5;

        // Button Background
        const bg = this.add.rectangle(x, y, w, h, color)
            .setAlpha(alpha);

        if (isUnlocked) {
            bg.setStrokeStyle(2, 0xffffff);
        }

        // Label
        let labelText = `World\n${index}`;
        if (typeof GameConfig !== 'undefined' && GameConfig.WORLDS && GameConfig.WORLDS[index - 1] && GameConfig.WORLDS[index - 1].name) {
            labelText = GameConfig.WORLDS[index - 1].name;
        }

        this.add.text(x, y, labelText, {
            fontSize: '18px',
            fill: isUnlocked ? '#fff' : '#aaa',
            align: 'center',
            fontStyle: 'bold',
            wordWrap: { width: w - 10 }
        }).setOrigin(0.5);

        if (isUnlocked) {
            bg.setInteractive({ useHandCursor: true });

            bg.on('pointerover', () => {
                bg.setFillStyle(0x4CAF50);
                this.tweens.add({
                    targets: bg,
                    scale: 1.1,
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
                this.scene.start('LevelSelectScene');
            });
        }
    }
}
