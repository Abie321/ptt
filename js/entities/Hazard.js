// Hazard entity class (larger entities that damage the player)

class Hazard {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.config = config;
        this.tier = config.tier;
        this.hazardData = config; // Standardize on hazardData holding the config

        // Hazards use configured size if available
        let logicalRadius;
        if (Array.isArray(config.size) && config.size.length === 2) {
            logicalRadius = Phaser.Math.Between(config.size[0], config.size[1]);
        } else {
            logicalRadius = config.size !== undefined ? config.size : (15 + (this.tier * 5));
        }

        // Apply global scale factor if it exists
        const scale = (scene.player && scene.player.currentScale) ? scene.player.currentScale : 1.0;
        this.radius = logicalRadius * scale;

        // Clone the config to hazardData to avoid mutating the global configuration.
        // We ensure `size` is set to the specific randomly generated scalar size (UNSCALED) for consumption logic.
        this.hazardData = { ...config, size: logicalRadius, radius: logicalRadius };

        const visualSize = this.radius;

        // Use color from config (defaults to red if not provided, though config should have it)
        const color = config.color !== undefined ? config.color : 0xFF0000;

        if (config.SPRITE && config.SPRITE.USE_SPRITESHEET) {
            this.sprite = scene.add.sprite(x, y, config.SPRITE.KEY);

            // Set scale based on visual size/radius
            const targetDiameter = visualSize * 2;
            const scale = targetDiameter / config.SPRITE.FRAME_WIDTH;
            this.sprite.setScale(scale);

            // Set initial animation
            this.facing = 'down';
            const animKey = `${config.type.replace(/\s+/g, '_').toLowerCase()}_${this.facing}`;
            this.sprite.play(animKey);

            scene.physics.add.existing(this.sprite);
        } else if (config.image) {
            this.sprite = scene.add.sprite(x, y, config.image);
            // Scale sprite to match the desired radius (diameter = visualSize * 2)
            const spriteScale = (visualSize * 2) / Math.max(1, this.sprite.width);
            this.sprite.setScale(spriteScale);
            this.sprite.setAlpha(0.7);

            scene.physics.add.existing(this.sprite);
        } else {
            this.sprite = scene.add.circle(x, y, visualSize, color, 0.7);
            scene.physics.add.existing(this.sprite);
        }

        if (config.rotation !== undefined) {
            this.sprite.setAngle(config.rotation);
        }

        // Setup physics body based on config hitbox or fallback to circle
        if (config.hitbox) {
            // If explicit rectangular hitbox is configured (expected in unscaled dimensions)
            this.sprite.body.setSize(config.hitbox.width, config.hitbox.height);
            // Center the body on the sprite
            this.sprite.body.setOffset(
                (this.sprite.width - config.hitbox.width) / 2,
                (this.sprite.height - config.hitbox.height) / 2
            );
        } else {
            if (config.SPRITE && config.SPRITE.USE_SPRITESHEET) {
                this.sprite.body.setCircle(config.SPRITE.FRAME_WIDTH / 2);
            } else if (config.image) {
                this.sprite.body.setCircle(this.sprite.width / 2);
            } else {
                this.sprite.body.setCircle(visualSize);
            }
        }

        // Simple movement pattern (optional for prototype)
        this.sprite.body.setVelocity(
            Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(-50, 50)
        );
        this.sprite.body.setBounce(1, 1);
        this.sprite.body.setCollideWorldBounds(true);

        // Store reference
        this.sprite.hazardData = this.hazardData;
        this.sprite.radius = this.radius;

        // Circular reference so update can be called on the wrapper
        this.sprite.entityWrapper = this;

        this.itemType = 'HAZARD';
    }

    update() {
        if (!this.sprite || !this.sprite.active || !this.sprite.body) return;

        const velocity = this.sprite.body.velocity;

        if (this.config.SPRITE && this.config.SPRITE.USE_SPRITESHEET && this.sprite.anims) {
            if (velocity.x !== 0 || velocity.y !== 0) {
                // Determine facing direction based on primary movement axis
                if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
                    if (velocity.x > 0) this.facing = 'right';
                    else this.facing = 'left';
                } else {
                    if (velocity.y > 0) this.facing = 'down';
                    else this.facing = 'up';
                }

                const animKey = `${this.config.type.replace(/\s+/g, '_').toLowerCase()}_${this.facing}`;
                this.sprite.play(animKey, true);
            }
        }
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
