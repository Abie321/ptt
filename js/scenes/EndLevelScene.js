// End Level Scene - Zesty Jelly Theme matching Stitch Design
class EndLevelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndLevelScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalTime = data.time || 0;
        this.stars = data.stars || 0;
        this.levelConfig = data.levelConfig;
        this.itemsEaten = data.itemsEaten || 0;
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;

        // Fade in from black
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Title using Fredoka, neon lime, outline, drop shadow
        const titleText = this.add.text(centerX, 70, 'LEVEL COMPLETE!', {
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

        // 1. Stats card box (Tactile Neumorphic container)
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x2e0854, 0.75); // surface-container
        cardBg.lineStyle(4, 0x120224, 1);
        cardBg.fillRoundedRect(centerX - 240, 140, 480, 110, 20);
        cardBg.strokeRoundedRect(centerX - 240, 140, 480, 110, 20);

        // Sub-panels side-by-side inside the card container
        const subPanelWidth = 135;
        const subPanelHeight = 80;
        const subPanelY = 155;
        const subPanelXOffsets = [-150, 0, 150]; // Left, center, right shifts relative to centerX
        
        const statsData = [
            { title: 'ITEMS EATEN', value: `${this.itemsEaten}`, valColor: '#79ff5b' }, // neon lime
            { title: 'TIME', value: timeStr, valColor: '#00daf3' }, // electric cyan
            { title: 'BEST SCORE', value: `${this.finalScore}`, valColor: '#ffdbc8' } // tangerine text
        ];

        statsData.forEach((stat, idx) => {
            const xPos = centerX + subPanelXOffsets[idx];
            
            // Sub-panel background
            const panel = this.add.graphics();
            panel.fillStyle(0x45236b, 0.5); // surface-container-highest
            panel.lineStyle(2, 0x120224, 1);
            panel.fillRoundedRect(xPos - subPanelWidth/2, subPanelY, subPanelWidth, subPanelHeight, 10);
            panel.strokeRoundedRect(xPos - subPanelWidth/2, subPanelY, subPanelWidth, subPanelHeight, 10);
            
            // Title text
            this.add.text(xPos, subPanelY + 18, stat.title, {
                fontFamily: 'Fredoka',
                fontSize: '11px',
                fill: '#baccb0', // on-surface-variant
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Value text
            this.add.text(xPos, subPanelY + 48, stat.value, {
                fontFamily: 'Fredoka',
                fontSize: '24px',
                fill: stat.valColor,
                fontStyle: 'bold',
                stroke: '#120224',
                strokeThickness: 3
            }).setOrigin(0.5);
        });

        // 2. Stars layout matching Stitch design: center star is larger and shifted up
        const starSpacing = 100;
        const starStartX = centerX - starSpacing;

        const starConfigs = [
            { x: starStartX, y: 350, size: 30, delay: 0 },
            { x: centerX, y: 325, size: 42, delay: 200 }, // Center star is larger and higher
            { x: centerX + starSpacing, y: 350, size: 30, delay: 400 }
        ];

        starConfigs.forEach((starConf, idx) => {
            const hasStar = idx < this.stars;
            const starColor = hasStar ? 0xFFD700 : 0x2a0350;

            const star = this.add.graphics();
            star.fillStyle(starColor, 1);
            star.lineStyle(3, 0x120224, 1); // Thick stroke

            // Draw star path dynamically based on custom configurations
            let rot = Math.PI / 2 * 3;
            const points = 5;
            const outerRadius = starConf.size;
            const innerRadius = starConf.size * 0.47;
            const step = Math.PI / points;

            star.beginPath();
            star.moveTo(starConf.x, starConf.y - outerRadius);
            for (let p = 0; p < points; p++) {
                let cx = starConf.x + Math.cos(rot) * outerRadius;
                let cy = starConf.y + Math.sin(rot) * outerRadius;
                star.lineTo(cx, cy);
                rot += step;

                cx = starConf.x + Math.cos(rot) * innerRadius;
                cy = starConf.y + Math.sin(rot) * innerRadius;
                star.lineTo(cx, cy);
                rot += step;
            }
            star.lineTo(starConf.x, starConf.y - outerRadius);
            star.closePath();
            star.fillPath();
            star.strokePath();

            // Pop animation on star reveal
            star.setScale(0);
            this.time.delayedCall(starConf.delay + 300, () => {
                this.tweens.add({
                    targets: star,
                    scale: 1,
                    duration: 450,
                    ease: 'Back.easeOut'
                });
            });
        });

        // 3. Action Buttons (Replay and Next Level / Main Menu side-by-side)
        
        // Find next level config to see if Next Level is available
        const currentIdx = (typeof GameConfig !== 'undefined' && GameConfig.LEVELS) ? GameConfig.LEVELS.findIndex(l => l.id === this.levelConfig.id) : -1;
        const hasNextLevel = (currentIdx !== -1 && currentIdx < GameConfig.LEVELS.length - 1);
        
        // Replay Button (Tangerine Secondary Jelly Button)
        this.createJellyButton(
            centerX - 110, 
            height - 110, 
            180, 
            50, 
            '↻ REPLAY', 
            0xff7f1c, // Tangerine orange
            0x602a00, 
            '#ffdbc8', 
            () => {
                this.scene.start('GameScene', { levelConfig: this.levelConfig });
            }
        );

        // Next Level / Menu Button (Neon Lime Primary Jelly Button)
        const nextBtnLabel = hasNextLevel ? 'NEXT LEVEL ▶' : 'MAIN MENU 🏠';
        this.createJellyButton(
            centerX + 110, 
            height - 110, 
            180, 
            50, 
            nextBtnLabel, 
            0x2ae500, // Neon Lime green
            0x053900, 
            '#efffe3', 
            () => {
                if (hasNextLevel) {
                    const nextLevelConfig = GameConfig.LEVELS[currentIdx + 1];
                    this.scene.start('LevelDetailScene', { levelConfig: nextLevelConfig, index: currentIdx + 2 });
                } else {
                    this.scene.start('MainMenuScene');
                }
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
            fontSize: '18px',
            fill: textColor,
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 4
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
            this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 50 });
            onClick();
        });

        return container;
    }
}
