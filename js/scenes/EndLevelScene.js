// End Level Scene - Zesty Jelly Theme
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
        const centerX = width / 2;

        // Fade in from black
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Title using Fredoka, neon lime, outline, drop shadow
        const titleText = this.add.text(centerX, 90, 'LEVEL COMPLETE!', {
            fontFamily: 'Fredoka',
            fontSize: '56px',
            fill: '#79ff5b', // neon lime
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 8,
            shadow: {
                offsetX: 0,
                offsetY: 6,
                color: '#120224',
                blur: 0,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        // Gentle tilt wobble
        titleText.setAngle(-2);
        this.tweens.add({
            targets: titleText,
            angle: { from: -2, to: 2 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Time format
        const minutes = Math.floor(this.finalTime / 60);
        const seconds = this.finalTime % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Stats card box
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x2e0854, 0.7); // surface-container
        cardBg.lineStyle(4, 0x120224, 1);
        cardBg.fillRoundedRect(centerX - 160, 160, 320, 120, 18);
        cardBg.strokeRoundedRect(centerX - 160, 160, 320, 120, 18);

        // Stats texts (using Quicksand / Fredoka)
        this.add.text(centerX - 120, 190, 'Time Spent:', {
            fontFamily: 'Quicksand',
            fontSize: '18px',
            fill: '#efdbff' // on-surface text
        });
        this.add.text(centerX + 120, 190, timeStr, {
            fontFamily: 'Fredoka',
            fontSize: '22px',
            fill: '#00daf3', // electric cyan
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 4
        }).setOrigin(1, 0.5);

        this.add.text(centerX - 120, 240, 'Final Score:', {
            fontFamily: 'Quicksand',
            fontSize: '18px',
            fill: '#efdbff'
        });
        this.add.text(centerX + 120, 240, `${this.finalScore}`, {
            fontFamily: 'Fredoka',
            fontSize: '22px',
            fill: '#00daf3',
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 4
        }).setOrigin(1, 0.5);

        // Stars layout (unlocked gold, locked dark purple)
        const starY = 345;
        const starSpacing = 90;
        const startX = centerX - starSpacing;

        for (let i = 0; i < 3; i++) {
            const hasStar = i < this.stars;
            const starX = startX + (i * starSpacing);
            const starColor = hasStar ? 0xFFD700 : 0x2a0350;

            const star = this.add.graphics();
            star.fillStyle(starColor, 1);
            star.lineStyle(3, 0x120224, 1); // Thick stroke

            // Draw star path
            let rot = Math.PI / 2 * 3;
            const points = 5;
            const outerRadius = 32;
            const innerRadius = 15;
            const step = Math.PI / points;

            star.beginPath();
            star.moveTo(starX, starY - outerRadius);
            for (let p = 0; p < points; p++) {
                let cx = starX + Math.cos(rot) * outerRadius;
                let cy = starY + Math.sin(rot) * outerRadius;
                star.lineTo(cx, cy);
                rot += step;

                cx = starX + Math.cos(rot) * innerRadius;
                cy = starY + Math.sin(rot) * innerRadius;
                star.lineTo(cx, cy);
                rot += step;
            }
            star.lineTo(starX, starY - outerRadius);
            star.closePath();
            star.fillPath();
            star.strokePath();

            // Pop animation on star reveal
            star.setScale(0);
            this.time.delayedCall(i * 200 + 300, () => {
                this.tweens.add({
                    targets: star,
                    scale: 1,
                    duration: 400,
                    ease: 'Back.easeOut'
                });
            });
        }

        // Return Button (Primary Lime Jelly Button)
        this.createJellyButton(
            centerX, 
            height - 110, 
            260, 
            55, 
            'MAIN MENU', 
            0x2ae500, // Lime green
            0x053900, 
            '#efffe3', 
            () => {
                this.scene.start('MainMenuScene');
            }
        );
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
