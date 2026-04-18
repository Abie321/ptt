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

        // Find player tier background scale and item tier background scale
        let playerTierIndex = (scene.player && scene.player.getCurrentTier) ? (scene.player.getCurrentTier() - 1) : 0;
        let itemTierIndex = this.tier - 1;

        let playerTierConfig = scene.levelConfig ? scene.levelConfig.SIZE_TIERS[playerTierIndex] : null;
        let itemTierConfig = scene.levelConfig ? scene.levelConfig.SIZE_TIERS[itemTierIndex] : null;

        let playerBgScale = (playerTierConfig && playerTierConfig.ASSETS && playerTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? playerTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;
        let itemBgScale = (itemTierConfig && itemTierConfig.ASSETS && itemTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? itemTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;

        const scaleRatio = playerBgScale / itemBgScale;

        // The radius used visually and for placement overlap is scaled by the player's scale factor if mid-game,
        // however, items should use scaleRatio for base scaling, then be affected by currentScale.
        const scale = (scene.player && scene.player.currentScale) ? scene.player.currentScale : 1.0;

        // We only scale visual size, NOT the internal logical radius definition
        this.radius = logicalRadius * scaleRatio * scale;

        // Clone the config to itemData to avoid mutating the global configuration.
        // We ensure `size` is set to the specific randomly generated scalar size (UNSCALED) for consumption logic.
        this.itemData = { ...config, size: logicalRadius, radius: logicalRadius };

        const visualSize = this.radius;

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
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }

    getPosition() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }
}
