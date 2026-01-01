// Edible item class

class EdibleItem {
    constructor(scene, x, y, tier, itemType) {
        this.scene = scene;
        this.tier = tier;
        this.itemType = itemType;

        // Visual representation based on tier
        const colors = [0x8BC34A, 0x03A9F4, 0xFFEB3B, 0xFF5722, 0xE91E63];
        const baseSize = 8;
        const size = baseSize + (tier * 3);

        // Create sprite (different shapes for variety)
        const shapes = ['circle', 'square', 'triangle'];
        const shape = shapes[itemType % shapes.length];

        if (shape === 'circle') {
            this.sprite = scene.add.circle(x, y, size, colors[tier - 1]);
        } else if (shape === 'square') {
            this.sprite = scene.add.rectangle(x, y, size * 2, size * 2, colors[tier - 1]);
        } else {
            // Triangle approximation with polygon
            this.sprite = scene.add.triangle(x, y, 0, size * 2, size * 2, size * 2, size, 0, colors[tier - 1]);
        }

        scene.physics.add.existing(this.sprite);
        this.sprite.body.setImmovable(true);

        // Store reference
        this.sprite.itemData = this;
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
