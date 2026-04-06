class LevelDetailScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelDetailScene' });
    }

    init(data) {
        this.levelConfig = data.levelConfig;
        this.levelIndex = data.index;
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;

        // Title
        const titleText = `${this.levelConfig.name || 'Unknown'}`;
        this.add.text(centerX, 100, titleText, {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stars setup
        const starSpacing = 150;
        const startX = centerX - starSpacing;
        const starY = 250;

        const thresholds = this.levelConfig.STAR_THRESHOLDS || {
            ONE_STAR: 500,
            TWO_STAR: 1500,
            THREE_STAR: 3000
        };

        const starsConfig = [
            { points: thresholds.ONE_STAR, label: '1 Star' },
            { points: thresholds.TWO_STAR, label: '2 Stars' },
            { points: thresholds.THREE_STAR, label: '3 Stars' }
        ];

        starsConfig.forEach((star, index) => {
            const x = startX + (index * starSpacing);

            // Draw a simple star using graphics
            this.drawStar(x, starY, 5, 40, 20, 0xFFD700);

            // Display threshold value below the star
            this.add.text(x, starY + 60, `${star.points} pts`, {
                fontSize: '24px',
                fill: '#fff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(x, starY + 90, star.label, {
                fontSize: '18px',
                fill: '#aaa'
            }).setOrigin(0.5);
        });

        // Back Button
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
             this.scene.start('LevelSelectScene');
        });

        // Play Button
        const playBtnBg = this.add.rectangle(centerX, height - 100, 200, 60, 0x4CAF50)
            .setInteractive({ useHandCursor: true });

        const playBtnText = this.add.text(centerX, height - 100, 'PLAY', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        playBtnBg.on('pointerover', () => playBtnBg.setFillStyle(0x66BB6A));
        playBtnBg.on('pointerout', () => playBtnBg.setFillStyle(0x4CAF50));
        playBtnBg.on('pointerdown', () => {
            this.scene.start('GameScene', { levelConfig: this.levelConfig });
        });
    }

    drawStar(x, y, points, outerRadius, innerRadius, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.lineStyle(2, 0xFFFFFF, 1);

        let rot = Math.PI / 2 * 3;
        const step = Math.PI / points;

        graphics.beginPath();
        graphics.moveTo(x, y - outerRadius);
        for (let i = 0; i < points; i++) {
            let cx = x + Math.cos(rot) * outerRadius;
            let cy = y + Math.sin(rot) * outerRadius;
            graphics.lineTo(cx, cy);
            rot += step;

            cx = x + Math.cos(rot) * innerRadius;
            cy = y + Math.sin(rot) * innerRadius;
            graphics.lineTo(cx, cy);
            rot += step;
        }
        graphics.lineTo(x, y - outerRadius);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }
}
