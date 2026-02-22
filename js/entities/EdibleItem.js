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
        this.radius = config.size !== undefined ? config.size : (8 + (this.tier * 3));
        const size = this.radius;

        const shape = config.shape;
        const color = config.color;

        if (config.image) {
            this.sprite = scene.add.sprite(x, y, config.image);
            // Scale sprite to match the desired radius (diameter = size * 2)
            const scale = (size * 2) / Math.max(1, this.sprite.width);
            this.sprite.setScale(scale);
        } else if (shape === 'circle') {
            this.sprite = scene.add.circle(x, y, size, color);
        } else if (shape === 'square') {
            this.sprite = scene.add.rectangle(x, y, size * 2, size * 2, color);
        } else {
            // Triangle approximation with polygon
            this.sprite = scene.add.triangle(x, y, 0, size * 2, size * 2, size * 2, size, 0, color);
        }

        scene.physics.add.existing(this.sprite);
        this.sprite.body.setImmovable(true);

        // Store reference
        config.radius = this.radius;
        this.sprite.itemData = config;
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
