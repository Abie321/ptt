// Player character class

class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.currentTier = 1;
        this.consumedInTier = 0;
        this.totalConsumed = 0;

        // Create player sprite (circle for prototype)
        this.sprite = scene.add.circle(x, y, GameConfig.PLAYER.INITIAL_SIZE, GameConfig.SIZE_TIERS[0].color);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);

        // Create mouth indicator (small circle at the front)
        this.mouthIndicator = scene.add.circle(x, y - GameConfig.PLAYER.INITIAL_SIZE, 5, 0xFFFFFF);

        // Track consumed item types for scoring
        this.consumedTypes = {};

        // Movement
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Direction vector for mouth positioning
        this.direction = { x: 0, y: -1 }; // Default: facing up
    }

    update() {
        const velocity = { x: 0, y: 0 };

        // Handle input (Arrow keys and WASD)
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            velocity.y = -GameConfig.PLAYER.SPEED;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            velocity.y = GameConfig.PLAYER.SPEED;
        }

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            velocity.x = -GameConfig.PLAYER.SPEED;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            velocity.x = GameConfig.PLAYER.SPEED;
        }

        // Update velocity
        this.sprite.body.setVelocity(velocity.x, velocity.y);

        // Update direction for mouth positioning
        if (velocity.x !== 0 || velocity.y !== 0) {
            const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            this.direction.x = velocity.x / length;
            this.direction.y = velocity.y / length;
        }

        // Update mouth indicator position
        const mouthDistance = this.sprite.radius * GameConfig.PLAYER.MOUTH_OFFSET;
        this.mouthIndicator.x = this.sprite.x + this.direction.x * mouthDistance;
        this.mouthIndicator.y = this.sprite.y + this.direction.y * mouthDistance;
    }

    consume(item) {
        // Track consumed types for scoring
        const itemType = item.itemType;
        if (!this.consumedTypes[itemType]) {
            this.consumedTypes[itemType] = 0;
        }
        this.consumedTypes[itemType]++;

        // Calculate score with diminishing returns
        const consumeCount = this.consumedTypes[itemType];
        const tierDensity = GameConfig.ITEMS_PER_TIER[item.tier] || 10;
        const decayFactor = Math.pow(0.9, (consumeCount - 1) / tierDensity);
        const points = Math.max(
            GameConfig.SCORING.MIN_POINTS_PER_ITEM,
            Math.floor(GameConfig.SCORING.MAX_POINTS_PER_ITEM * decayFactor)
        );

        // Update consumption tracking
        this.consumedInTier++;
        this.totalConsumed++;

        // Check for tier advancement
        const currentTierConfig = GameConfig.SIZE_TIERS[this.currentTier - 1];
        if (this.consumedInTier >= currentTierConfig.quota && this.currentTier < GameConfig.SIZE_TIERS.length) {
            this.advanceTier();
        }

        return points;
    }

    advanceTier() {
        this.currentTier++;
        this.consumedInTier = 0;

        const newTierConfig = GameConfig.SIZE_TIERS[this.currentTier - 1];

        // Grow the player
        const newRadius = GameConfig.PLAYER.INITIAL_SIZE * newTierConfig.scale;
        this.sprite.setRadius(newRadius);
        this.sprite.setFillStyle(newTierConfig.color);

        // Emit event for scene to handle
        this.scene.events.emit('tierAdvanced', this.currentTier);
    }

    getMouthPosition() {
        return {
            x: this.mouthIndicator.x,
            y: this.mouthIndicator.y
        };
    }

    getCurrentTier() {
        return this.currentTier;
    }

    getConsumableTiers() {
        // Can consume current tier and previous tier
        return [this.currentTier, Math.max(1, this.currentTier - 1)];
    }

    takeDamage() {
        return GameConfig.SCORING.HAZARD_PENALTY;
    }

    getSize() {
        return this.sprite.radius;
    }

    getProgress() {
        const currentTierConfig = GameConfig.SIZE_TIERS[this.currentTier - 1];
        return this.consumedInTier / currentTierConfig.quota;
    }
}
