// Edible item class

class EdibleItem {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.config = config;
        this.tier = config.tier;
        this.itemType = config.type; // Maintaining property for compatibility/debugging
        this.itemData = config; // Standardize on itemData holding the config

        // Visual representation based on config
        // Use configured size if available, otherwise fallback to old formula
        let logicalRadius;
        if (Array.isArray(config.size) && config.size.length === 2) {
            logicalRadius = Phaser.Math.Between(config.size[0], config.size[1]);
        } else {
            logicalRadius = config.size !== undefined ? config.size : (8 + (this.tier * 3));
        }

        // Initial spawning doesn't need currentScale logic applied this way, items are scaled by tier config
        // Actually, we use the background scale ratio for the item relative to the player's current tier

        this.itemData = { ...config, size: logicalRadius };

        // Pre-calculate positions and sizes for all tiers
        this.tierPositions = {};
        this.tierRadii = {};
        this.tierHitboxes = {};

        let itemTierConfig = scene.levelConfig ? scene.levelConfig.SIZE_TIERS[this.tier - 1] : null;
        let itemBgScale = (itemTierConfig && itemTierConfig.ASSETS && itemTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? itemTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;

        const numTiers = scene.levelConfig && scene.levelConfig.SIZE_TIERS ? scene.levelConfig.SIZE_TIERS.length : 1;
        for (let t = 1; t <= numTiers; t++) {
            let targetTierConfig = scene.levelConfig.SIZE_TIERS[t - 1];
            let targetBgScale = (targetTierConfig && targetTierConfig.ASSETS && targetTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? targetTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;

            const scaleRatio = targetBgScale / itemBgScale;

            this.tierPositions[t] = {
                x: x * scaleRatio,
                y: y * scaleRatio
            };
            this.tierRadii[t] = logicalRadius * scaleRatio;

            if (config.hitbox) {
                this.tierHitboxes[t] = {
                    width: config.hitbox.width * scaleRatio,
                    height: config.hitbox.height * scaleRatio
                };
            }
        }

        // Set initial state based on player's current tier
        let playerTier = (scene.player && scene.player.getCurrentTier) ? scene.player.getCurrentTier() : 1;

        // Apply global scale factor if it exists
        const scale = (scene.player && scene.player.currentScale) ? scene.player.currentScale : 1.0;
        this.radius = this.tierRadii[playerTier] * scale;
        this.itemData.radius = logicalRadius;

        const visualSize = this.radius;

        // Visual position based on current tier (ignoring global scale since x,y shouldn't multiply by currentScale,
        // they are repositioned during tier transitions)
        // Note: `x` and `y` passed to constructor are already in the player's coordinate space during mid-game spawning.
        // Wait, the constructor is called with x,y in the PLAYER'S coordinate space. So we need to compute the base item space first.
        // Let's fix that calculation:

        let playerBgScale = (scene.levelConfig && scene.levelConfig.SIZE_TIERS[playerTier - 1] && scene.levelConfig.SIZE_TIERS[playerTier - 1].ASSETS && scene.levelConfig.SIZE_TIERS[playerTier - 1].ASSETS.BACKGROUND_SCALE !== undefined) ? scene.levelConfig.SIZE_TIERS[playerTier - 1].ASSETS.BACKGROUND_SCALE : 1.0;

        // Convert the input x,y (which are in playerTier space) back to the item's native tier space
        const nativeX = x / (playerBgScale / itemBgScale);
        const nativeY = y / (playerBgScale / itemBgScale);

        // Recalculate tier mappings accurately from the native coordinates
        for (let t = 1; t <= numTiers; t++) {
            let targetTierConfig = scene.levelConfig.SIZE_TIERS[t - 1];
            let targetBgScale = (targetTierConfig && targetTierConfig.ASSETS && targetTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? targetTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;

            const scaleRatio = targetBgScale / itemBgScale;

            this.tierPositions[t] = {
                x: nativeX * scaleRatio,
                y: nativeY * scaleRatio
            };
            // Radii don't depend on input x,y
        }

        const shape = config.shape;
        const color = config.color;

        if (config.image) {
            this.sprite = scene.add.sprite(x, y, config.image);
            // Scale sprite to match the desired radius (diameter = visualSize * 2)
            const spriteScale = (visualSize * 2) / Math.max(1, this.sprite.width);
            this.sprite.setScale(spriteScale);
        } else if (shape === 'circle') {
            this.sprite = scene.add.circle(x, y, visualSize, color);
        } else if (shape === 'square') {
            this.sprite = scene.add.rectangle(x, y, visualSize * 2, visualSize * 2, color);
        } else {
            // Triangle approximation with polygon
            this.sprite = scene.add.triangle(x, y, 0, visualSize * 2, visualSize * 2, visualSize * 2, visualSize, 0, color);
        }

        scene.physics.add.existing(this.sprite);
        this.sprite.body.setImmovable(true);

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
            // Ensure circular body for circles, otherwise default rectangular body is fine
            if (config.image) {
                // For images, the sprite is already scaled. setCircle expects the *unscaled* radius.
                // The unscaled radius is half the original width of the texture.
                this.sprite.body.setCircle(this.sprite.width / 2);
            } else if (shape === 'circle') {
                // For primitive circles, visualSize is the unscaled radius.
                this.sprite.body.setCircle(visualSize);
            }
        }

        // Store reference
        this.sprite.itemData = this.itemData;
        this.sprite.radius = this.radius;
        this.sprite.entityWrapper = this;
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    getPosition(tier) {
        if (tier && this.tierPositions[tier]) {
            return this.tierPositions[tier];
        }
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }
}
