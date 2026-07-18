// Main Menu Scene - Zesty Jelly Theme
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;

        // Title text using Fredoka font, Neon Lime color, thick dark stroke, and soft drop shadow
        const titleText = this.add.text(centerX, height / 3 - 30, 'TASTY PLANET', {
            fontFamily: 'Fredoka',
            fontSize: '72px',
            fill: '#79ff5b', // Zesty Jelly Primary Light Neon Green
            fontStyle: 'bold',
            stroke: '#120224', // Thick dark comic outline
            strokeThickness: 8,
            shadow: {
                offsetX: 0,
                offsetY: 6,
                color: '#120224', // Neumorphic flat drop shadow
                blur: 0,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        // Gentle wobble rotation tween for playful toy feel
        this.tweens.add({
            targets: titleText,
            angle: { from: -2, to: 2 },
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle using Fredoka
        const subtitleText = this.add.text(centerX, height / 3 + 45, 'Fan Game Prototype', {
            fontFamily: 'Fredoka',
            fontSize: '24px',
            fill: '#85edff', // Zesty Jelly Tertiary Cyan
            stroke: '#120224',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Gentle scale pulse tween
        this.tweens.add({
            targets: subtitleText,
            scale: { from: 0.95, to: 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Play Button (Neon Lime Primary Jelly Button)
        this.createJellyButton(
            centerX, 
            height / 2 + 10, 
            'PLAY', 
            0x2ae500, // primary-fixed-dim
            0x053900, // on-primary
            '#efffe3', 
            () => {
                this.scene.start('WorldSelectScene');
            }
        );

        // Level Creator Button (Tangerine Secondary Jelly Button)
        this.createJellyButton(
            centerX, 
            height / 2 + 85, 
            'LEVEL CREATOR', 
            0xff7f1c, // secondary-container
            0x522300, // on-secondary
            '#ffdbc8', 
            () => {
                this.scene.start('LevelCreatorScene');
            }
        );

        // Instructions with Quicksand typography
        this.add.text(centerX, height - 90, 'Use WASD or Arrow Keys to move\nEat smaller items to grow!\nAvoid red hazards!', {
            fontFamily: 'Quicksand',
            fontSize: '18px',
            fill: '#efdbff', // on-surface variant
            align: 'center',
            stroke: '#120224',
            strokeThickness: 3,
            lineSpacing: 4
        }).setOrigin(0.5);

        // Version Label
        this.add.text(20, height - 30, 'v0.1.0 - Zesty Jelly Edition', {
            fontFamily: 'Fredoka',
            fontSize: '14px',
            fill: '#45236b' // surface-container-highest
        });
    }

    // Helper builder for Tactile Neumorphic "Jelly Push" Buttons
    createJellyButton(x, y, text, color, rimColor, textColor, onClick) {
        const container = this.add.container(x, y);
        
        const w = 280;
        const h = 55;
        
        // 1. 3D Bottom Rim (the physical depth of the button)
        const rim = this.add.graphics();
        rim.fillStyle(rimColor, 1);
        rim.fillRoundedRect(-w/2, -h/2 + 4, w, h, 28);
        container.add(rim);
        
        // 2. Button Front Surface
        const body = this.add.graphics();
        body.fillStyle(color, 1);
        body.lineStyle(4, 0x120224, 1); // Thick comic stroke
        body.fillRoundedRect(-w/2, -h/2, w, h, 28);
        body.strokeRoundedRect(-w/2, -h/2, w, h, 28);
        container.add(body);
        
        // 3. Button Label Text
        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'Fredoka',
            fontSize: '26px',
            fill: textColor,
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 5
        }).setOrigin(0.5);
        container.add(btnText);
        
        // Hit area for cursor interactions
        const hitArea = new Phaser.Geom.Rectangle(-w/2, -h/2, w, h);
        body.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        
        // Dynamic hover feedback
        body.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });
        
        body.on('pointerout', () => {
            this.input.setDefaultCursor('default');
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
            body.y = 0;
            btnText.y = 0;
        });
        
        body.on('pointerdown', () => {
            // Push button down (overlaps the bottom 3D rim)
            body.y = 4;
            btnText.y = 4;
            this.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50
            });
        });
        
        body.on('pointerup', () => {
            body.y = 0;
            btnText.y = 0;
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 50
            });
            onClick();
        });
        
        return container;
    }
}
