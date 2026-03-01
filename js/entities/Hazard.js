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

        this.sprite = scene.add.circle(x, y, visualSize, color, 0.7);
        scene.physics.add.existing(this.sprite);

        // Simple movement pattern (optional for prototype)
        this.sprite.body.setVelocity(
            Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(-50, 50)
        );
        this.sprite.body.setBounce(1, 1);
        this.sprite.body.setCollideWorldBounds(true);

        // Store reference
        this.sprite.hazardData = this.hazardData;
        this.itemType = 'HAZARD';
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
