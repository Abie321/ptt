// Level Detail Scene - Zesty Jelly Theme
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

        // Title using Fredoka, neon lime, thick outline, drop shadow
        const titleText = this.add.text(centerX, 100, this.levelConfig.name || 'Unknown Level', {
            fontFamily: 'Fredoka',
            fontSize: '48px',
            fill: '#79ff5b', // neon lime
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 6,
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: '#120224',
                blur: 0,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        // Playful tilt on title
        titleText.setAngle(-1.5);

        // Small Back Button (Tertiary Cyan Jelly Button)
        this.createJellyButton(
            90, 
            50, 
            110, 
            38, 
            '< Back', 
            0x00daf3, // tertiary cyan
            0x006c79, // on-tertiary-container
            '#f0fcff', 
            () => {
                this.scene.start('LevelSelectScene');
            }
        );

        // Stars setup
        const starSpacing = 160;
        const startX = centerX - starSpacing;
        const starY = 260;

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

            // Neumorphic floating container for each star card
            const cardBg = this.add.graphics();
            cardBg.fillStyle(0x2e0854, 0.6); // surface-container
            cardBg.lineStyle(3, 0x120224, 1);
            cardBg.fillRoundedRect(x - 70, starY - 60, 140, 190, 15);
            cardBg.strokeRoundedRect(x - 70, starY - 60, 140, 190, 15);

            // Draw a beautiful star using graphics with thick outlines
            this.drawStar(x, starY - 10, 5, 30, 15, 0xFFD700);

            // Display threshold value below the star
            this.add.text(x, starY + 50, `${star.points}`, {
                fontFamily: 'Fredoka',
                fontSize: '22px',
                fill: '#00daf3', // electric cyan
                fontStyle: 'bold',
                stroke: '#120224',
                strokeThickness: 4
            }).setOrigin(0.5);

            this.add.text(x, starY + 75, 'pts', {
                fontFamily: 'Quicksand',
                fontSize: '14px',
                fill: '#efdbff' // on-surface
            }).setOrigin(0.5);

            this.add.text(x, starY + 105, star.label, {
                fontFamily: 'Fredoka',
                fontSize: '16px',
                fill: '#efffe3', // neon lime
                stroke: '#120224',
                strokeThickness: 3
            }).setOrigin(0.5);
        });

        // Play Button (Primary Neon Lime Jelly Button)
        this.createJellyButton(
            centerX, 
            height - 100, 
            240, 
            55, 
            'PLAY', 
            0x2ae500, // primary lime
            0x053900, // on-primary
            '#efffe3', 
            () => {
                this.scene.start('GameScene', { levelConfig: this.levelConfig });
            }
        );
    }

    drawStar(x, y, points, outerRadius, innerRadius, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.lineStyle(3, 0x120224, 1); // Thick outline

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

    // Helper builder for custom-sized Jelly buttons
    createJellyButton(x, y, w, h, text, color, rimColor, textColor, onClick) {
        const container = this.add.container(x, y);

        const rim = this.add.graphics();
        rim.fillStyle(rimColor, 1);
        rim.fillRoundedRect(-w/2, -h/2 + 4, w, h, h/2);
        container.add(rim);

        const body = this.add.graphics();
        body.fillStyle(color, 1);
        body.lineStyle(4, 0x120224, 1); // 4px outline
        body.fillRoundedRect(-w/2, -h/2, w, h, h/2);
        body.strokeRoundedRect(-w/2, -h/2, w, h, h/2);
        container.add(body);

        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'Fredoka',
            fontSize: '26px',
            fill: textColor,
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 5
        }).setOrigin(0.5);
        container.add(btnText);

        const hitArea = new Phaser.Geom.Rectangle(-w/2, -h/2, w, h);
        body.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        body.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
            this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        body.on('pointerout', () => {
            this.input.setDefaultCursor('default');
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
            body.y = 0;
            btnText.y = 0;
        });

        body.on('pointerdown', () => {
            body.y = 4;
            btnText.y = 4;
            this.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.95, duration: 50 });
        });

        body.on('pointerup', () => {
            body.y = 0;
            btnText.y = 0;
            onClick();
        });

        return container;
    }
}
