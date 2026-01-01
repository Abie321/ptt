// Hazard entity class (larger entities that damage the player)

class Hazard {
    constructor(scene, x, y, tier) {
        this.scene = scene;
        this.tier = tier;

        // Hazards are larger and red-tinted
        const baseSize = 15;
        const size = baseSize + (tier * 5);

        this.sprite = scene.add.circle(x, y, size, 0xFF0000, 0.7);
        scene.physics.add.existing(this.sprite);

        // Simple movement pattern (optional for prototype)
        this.sprite.body.setVelocity(
            Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(-50, 50)
        );
        this.sprite.body.setBounce(1, 1);
        this.sprite.body.setCollideWorldBounds(true);

        // Store reference
        this.sprite.hazardData = this;
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
