// Hazard entity class (larger entities that damage the player)

class Hazard {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.config = config;
        this.tier = config.tier;
        this.hazardData = config; // Standardize on hazardData holding the config

        // Hazards use configured size if available
        this.radius = config.size !== undefined ? config.size : (15 + (this.tier * 5));

        // Ensure size is set in config for consumption logic
        if (config.size === undefined) {
            config.size = this.radius;
        }

        const size = this.radius;

        // Use color from config (defaults to red if not provided, though config should have it)
        const color = config.color !== undefined ? config.color : 0xFF0000;

        this.sprite = scene.add.circle(x, y, size, color, 0.7);
        scene.physics.add.existing(this.sprite);

        // Simple movement pattern (optional for prototype)
        this.sprite.body.setVelocity(
            Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(-50, 50)
        );
        this.sprite.body.setBounce(1, 1);
        this.sprite.body.setCollideWorldBounds(true);

        // Store reference
        config.radius = this.radius;
        this.sprite.hazardData = config;
        this.itemType = 'HAZARD';
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
