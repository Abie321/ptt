// Main Menu Scene - Zesty Jelly Theme matching Stitch Design
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        // Load the sidekick mascot image downloaded from the Stitch project
        this.load.image('mascot', 'assets/images/mascot.png');
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

        // 0. Mascot Image (Sidekick Mascot from Stitch screens)
        const mascot = this.add.image(centerX - 240, height / 3 - 35, 'mascot')
            .setOrigin(0.5)
            .setScale(0.35)
            .setAngle(-12);

        // Mascot hover and click interactivity juice
        mascot.setInteractive({ useHandCursor: true });
        mascot.on('pointerover', () => {
            this.tweens.add({
                targets: mascot,
                scaleX: 0.38,
                scaleY: 0.38,
                angle: 5,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        mascot.on('pointerout', () => {
            this.tweens.add({
                targets: mascot,
                scaleX: 0.35,
                scaleY: 0.35,
                angle: -12,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });

        const triggerMascotReaction = () => {
            this.tweens.add({
                targets: mascot,
                angle: { from: -12, to: 15 },
                scaleX: 0.42,
                scaleY: 0.42,
                duration: 100,
                yoyo: true,
                repeat: 1,
                ease: 'Sine.easeInOut'
            });
        };

        // Primary Buttons Layout (Tactile Neumorphic Jelly Buttons)

        // 1. PLAY Button (Neon Lime Primary Jelly Button)
        this.createJellyButton(
            centerX, 
            height / 2 - 20, 
            280,
            55,
            '▶ PLAY', 
            0x2ae500, // primary-fixed-dim
            0x053900, // on-primary
            '#efffe3', 
            () => {
                triggerMascotReaction();
                this.time.delayedCall(200, () => {
                    this.scene.start('WorldSelectScene');
                });
            }
        );

        // 2. LEVEL CREATOR Button (Tangerine Secondary Jelly Button)
        this.createJellyButton(
            centerX, 
            height / 2 + 45, 
            280,
            55,
            '⚙ LEVEL CREATOR', 
            0xff7f1c, // secondary-container
            0x522300, // on-secondary
            '#ffdbc8', 
            () => {
                triggerMascotReaction();
                this.time.delayedCall(200, () => {
                    this.scene.start('LevelCreatorScene');
                });
            }
        );

        // 3. Side-by-side Row: GALLERY & OPTIONS Buttons (Surface Bright secondary buttons)
        // Gallery Button
        this.createJellyButton(
            centerX - 75, 
            height / 2 + 110, 
            130,
            45,
            '🖼 GALLERY', 
            0x49286f, // surface-bright
            0x2e0854, // surface-container
            '#efdbff', 
            () => {
                triggerMascotReaction();
                alert("Gallery coming soon! Track items eaten to unlock cards.");
            }
        );

        // Options Button
        this.createJellyButton(
            centerX + 75, 
            height / 2 + 110, 
            130,
            45,
            '⚙ OPTIONS', 
            0x49286f, // surface-bright
            0x2e0854, // surface-container
            '#efdbff', 
            () => {
                triggerMascotReaction();
                alert("Options: Sound toggles coming soon!");
            }
        );

        // Instructions with Quicksand typography
        this.add.text(centerX, height - 60, 'Use WASD or Arrow Keys to move\nEat smaller items to grow! Avoid red hazards!', {
            fontFamily: 'Quicksand',
            fontSize: '16px',
            fill: '#efdbff', // on-surface variant
            align: 'center',
            stroke: '#120224',
            strokeThickness: 3,
            lineSpacing: 4
        }).setOrigin(0.5);

        // Version Label
        this.add.text(20, height - 25, 'v0.1.0 - Zesty Jelly Edition', {
            fontFamily: 'Fredoka',
            fontSize: '12px',
            fill: '#45236b' // surface-container-highest
        });
    }

    // Helper builder for Tactile Neumorphic "Jelly Push" Buttons
    createJellyButton(x, y, w, h, text, color, rimColor, textColor, onClick) {
        const container = this.add.container(x, y);
        
        // 1. 3D Bottom Rim (the physical depth of the button)
        const rim = this.add.graphics();
        rim.fillStyle(rimColor, 1);
        rim.fillRoundedRect(-w/2, -h/2 + 4, w, h, h/2);
        container.add(rim);
        
        // 2. Button Front Surface
        const body = this.add.graphics();
        body.fillStyle(color, 1);
        body.lineStyle(4, 0x120224, 1); // Thick comic stroke
        body.fillRoundedRect(-w/2, -h/2, w, h, h/2);
        body.strokeRoundedRect(-w/2, -h/2, w, h, h/2);
        container.add(body);
        
        // 3. Button Label Text
        const fontSize = w < 150 ? '16px' : '22px';
        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'Fredoka',
            fontSize: fontSize,
            fill: textColor,
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 4
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
