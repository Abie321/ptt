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

        this.hazardData = { ...config, size: logicalRadius };

        // Pre-calculate positions and sizes for all tiers
        this.tierPositions = {};
        this.tierRadii = {};
        this.tierHitboxes = {};

        let itemTierConfig = scene.levelConfig ? scene.levelConfig.SIZE_TIERS[this.tier - 1] : null;
        let itemBgScale = (itemTierConfig && itemTierConfig.ASSETS && itemTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? itemTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;

        let playerTier = (scene.player && scene.player.getCurrentTier) ? scene.player.getCurrentTier() : 1;
        let playerBgScale = (scene.levelConfig && scene.levelConfig.SIZE_TIERS[playerTier - 1] && scene.levelConfig.SIZE_TIERS[playerTier - 1].ASSETS && scene.levelConfig.SIZE_TIERS[playerTier - 1].ASSETS.BACKGROUND_SCALE !== undefined) ? scene.levelConfig.SIZE_TIERS[playerTier - 1].ASSETS.BACKGROUND_SCALE : 1.0;

        // Convert input x,y back to the item's native tier space
        const nativeX = x / (playerBgScale / itemBgScale);
        const nativeY = y / (playerBgScale / itemBgScale);

        const numTiers = scene.levelConfig && scene.levelConfig.SIZE_TIERS ? scene.levelConfig.SIZE_TIERS.length : 1;
        for (let t = 1; t <= numTiers; t++) {
            let targetTierConfig = scene.levelConfig.SIZE_TIERS[t - 1];
            let targetBgScale = (targetTierConfig && targetTierConfig.ASSETS && targetTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? targetTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;

            const scaleRatio = targetBgScale / itemBgScale;

            this.tierPositions[t] = {
                x: nativeX * scaleRatio,
                y: nativeY * scaleRatio
            };
            this.tierRadii[t] = logicalRadius * scaleRatio;

            if (config.hitbox) {
                this.tierHitboxes[t] = {
                    width: config.hitbox.width * scaleRatio,
                    height: config.hitbox.height * scaleRatio
                };
            }
        }

        // Apply global scale factor if it exists
        const scale = (scene.player && scene.player.currentScale) ? scene.player.currentScale : 1.0;
        this.radius = this.tierRadii[playerTier] * scale;
        this.hazardData.radius = logicalRadius;

        const visualSize = config.visual_size !== undefined ? config.visual_size : this.radius;

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
                if (config.visual_size !== undefined) {
                    const spriteScale = (visualSize * 2) / config.SPRITE.FRAME_WIDTH;
                    const unscaledLogicRadius = this.radius / spriteScale;
                    this.sprite.body.setCircle(unscaledLogicRadius);
                    const offset = (config.SPRITE.FRAME_WIDTH - (unscaledLogicRadius * 2)) / 2;
                    this.sprite.body.setOffset(offset, offset);
                } else {
                    this.sprite.body.setCircle(config.SPRITE.FRAME_WIDTH / 2);
                }
            } else if (config.image) {
                if (config.visual_size !== undefined) {
                    const spriteScale = (visualSize * 2) / Math.max(1, this.sprite.width);
                    const unscaledLogicRadius = this.radius / spriteScale;
                    this.sprite.body.setCircle(unscaledLogicRadius);
                    const offset = (this.sprite.width - (unscaledLogicRadius * 2)) / 2;
                    this.sprite.body.setOffset(offset, offset);
                } else {
                    this.sprite.body.setCircle(this.sprite.width / 2);
                }
            } else {
                this.sprite.body.setCircle(this.radius);
            }
        }

        this.movementType = config.movementType || 'random';
        this.speed = config.speed !== undefined ? config.speed : 50;

        if (this.movementType === 'tracking') {
            this.sprite.body.setBounce(0, 0);
        } else {
            // Simple movement pattern (optional for prototype)
            this.sprite.body.setVelocity(
                Phaser.Math.Between(-this.speed, this.speed),
                Phaser.Math.Between(-this.speed, this.speed)
            );
            this.sprite.body.setBounce(1, 1);
        }

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

        if (this.movementType === 'tracking' && this.scene && this.scene.player && this.scene.player.sprite && this.scene.player.sprite.active) {
            const playerSprite = this.scene.player.sprite;
            const dx = playerSprite.x - this.sprite.x;
            const dy = playerSprite.y - this.sprite.y;

            // Calculate distance
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                // Normalize and apply speed
                this.sprite.body.setVelocity(
                    (dx / distance) * this.speed,
                    (dy / distance) * this.speed
                );
            } else {
                this.sprite.body.setVelocity(0, 0);
            }
        }

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
