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

        // Apply global scale factor if it exists
        const scale = (scene.player && scene.player.currentScale) ? scene.player.currentScale : 1.0;
        this.radius = logicalRadius * scale;

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

        // Store reference
        this.sprite.itemData = this.itemData;
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
