// Player character class

class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        // Access level config from scene, fallback to first level if not defined (e.g. tests)
        this.config = scene.levelConfig || (typeof GameConfig !== 'undefined' && GameConfig.LEVELS ? GameConfig.LEVELS[0] : {});

        this.currentTier = 1;
        this.consumedInTier = 0;
        this.totalConsumed = 0;

        // Size Property (Logic)
        this.size = this.config.PLAYER ? this.config.PLAYER.INITIAL_SIZE : 20;

        // Radius Property (Visual/Physics)
        // Currently 1:1 with size, but kept distinct for architectural separation
        this.radius = this.size;

        // Growth Factor: Controls how much area/radius is added per consumed item
        this.GROWTH_FACTOR = (this.config.PLAYER && this.config.PLAYER.GROWTH_FACTOR !== undefined) ? this.config.PLAYER.GROWTH_FACTOR : 0.1;

        // Create player sprite
        if (this.config.PLAYER && this.config.PLAYER.SPRITE && this.config.PLAYER.SPRITE.USE_SPRITESHEET) {
            this.sprite = scene.add.sprite(x, y, this.config.PLAYER.SPRITE.KEY);

            // Set initial scale
            this.updateSpriteScale();

            // Set color and animation
            this.sprite.play('down'); // Default to down

            scene.physics.add.existing(this.sprite);
            // Set circular body matching the frame size (will scale with sprite)
            this.sprite.body.setCircle(this.config.PLAYER.SPRITE.FRAME_WIDTH / 2);
        } else {
            // Fallback to circle
            const color = (this.config.SIZE_TIERS && this.config.SIZE_TIERS[0]) ? this.config.SIZE_TIERS[0].color : 0x4CAF50;
            this.sprite = scene.add.circle(x, y, this.radius, color);
            scene.physics.add.existing(this.sprite);
        }

        this.sprite.body.setCollideWorldBounds(true);

        // Create mouth indicator (small circle at the front)
        this.mouthIndicator = scene.add.circle(x, y - this.radius, 5, 0xFFFFFF, 0.0);

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

        // Track facing direction for animation
        this.facing = 'down';
    }

    update() {
        const velocity = { x: 0, y: 0 };
        const speed = this.config.PLAYER ? this.config.PLAYER.SPEED : 200;

        // Handle input (Arrow keys and WASD)
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            velocity.y = -speed;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            velocity.y = speed;
        }

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            velocity.x = -speed;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            velocity.x = speed;
        }

        // Update velocity
        this.sprite.body.setVelocity(velocity.x, velocity.y);

        // Update animation based on velocity
        if (this.sprite.anims) {
            if (velocity.x !== 0 || velocity.y !== 0) {
                // Determine facing direction
                if (velocity.x > 0) this.facing = 'right';
                else if (velocity.x < 0) this.facing = 'left';
                else if (velocity.y > 0) this.facing = 'down';
                else if (velocity.y < 0) this.facing = 'up';

                this.sprite.play(this.facing, true);
            } else {
                // Continue playing the last facing animation
                this.sprite.play(this.facing, true);
            }
        }

        // Update direction for mouth positioning
        if (velocity.x !== 0 || velocity.y !== 0) {
            const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            this.direction.x = velocity.x / length;
            this.direction.y = velocity.y / length;
        }

        // Update mouth indicator position
        const mouthOffset = this.config.PLAYER ? this.config.PLAYER.MOUTH_OFFSET : 0.7;
        const mouthDistance = this.radius * mouthOffset;
        this.mouthIndicator.x = this.sprite.x + this.direction.x * mouthDistance;
        this.mouthIndicator.y = this.sprite.y + this.direction.y * mouthDistance;
    }

    consume(item) {
        // Track consumed types for scoring
        const itemType = item.type || item.itemType; // Support both new and old (for tests/compat)
        if (!this.consumedTypes[itemType]) {
            this.consumedTypes[itemType] = 0;
        }
        this.consumedTypes[itemType]++;

        // Calculate score with diminishing returns
        const consumeCount = this.consumedTypes[itemType];

        // Calculate tier density from TIER_ENTITIES
        let tierDensity = 10; // Default fallback
        if (this.config.TIER_ENTITIES && this.config.TIER_ENTITIES[item.tier]) {
            tierDensity = this.config.TIER_ENTITIES[item.tier].reduce((sum, e) => sum + (e.count || 0), 0);
        } else if (this.config.ITEMS_PER_TIER) {
             // Fallback for tests using old config structure
             tierDensity = this.config.ITEMS_PER_TIER[item.tier] || 10;
        }

        const decayFactor = Math.pow(0.9, (consumeCount - 1) / tierDensity);

        // Use value from item config if available, otherwise max points
        const baseValue = item.value || (this.config.SCORING ? this.config.SCORING.MAX_POINTS_PER_ITEM : 80);

        const minPoints = this.config.SCORING ? this.config.SCORING.MIN_POINTS_PER_ITEM : 1;
        const points = Math.max(
            minPoints,
            Math.floor(baseValue * decayFactor)
        );

        // Update consumption tracking
        this.consumedInTier++;
        this.totalConsumed++;

        // --- Growth Logic ---
        // Area-based growth: NewArea = OldArea + (ItemArea * GrowthFactor)
        // Use SIZE for growth calculation
        const itemSize = item.size !== undefined ? item.size : (item.radius || 10);
        const currentArea = this.size * this.size;
        const itemArea = itemSize * itemSize;
        const addedArea = itemArea * this.GROWTH_FACTOR;

        this.size = Math.sqrt(currentArea + addedArea);

        // Sync radius to size (for now)
        this.radius = this.size;

        // Apply new size
        this.updateSpriteScale();

        // Check for tier advancement (visual milestone)
        const newTier = this.calculateTier();
        if (newTier > this.currentTier) {
            this.advanceTier(newTier);
        }

        return points;
    }

    calculateTier() {
        // Find the highest tier where current radius exceeds the tier's base size
        if (!this.config.SIZE_TIERS) return 1;

        const baseSize = this.config.PLAYER.INITIAL_SIZE;
        let calculatedTier = 1;

        for (let i = 0; i < this.config.SIZE_TIERS.length; i++) {
            const tierConfig = this.config.SIZE_TIERS[i];
            const tierStartRadius = baseSize * tierConfig.scale;

            // Allow small epsilon or exact match
            // Using size (which is same as radius for now)
            if (this.size >= tierStartRadius - 0.1) {
                calculatedTier = tierConfig.tier;
            } else {
                break;
            }
        }
        return calculatedTier;
    }

    updateSpriteScale() {
        if (this.sprite instanceof Phaser.GameObjects.Sprite) {
            // Scale based on size/radius
            const targetDiameter = this.radius * 2;
            const scale = targetDiameter / this.config.PLAYER.SPRITE.FRAME_WIDTH;
            this.sprite.setScale(scale);
        } else {
            this.sprite.setRadius(this.radius);
        }
    }

    advanceTier(newTier) {
        this.currentTier = newTier;
        this.consumedInTier = 0;

        const newTierConfig = this.config.SIZE_TIERS[this.currentTier - 1];

        // Update color if using shape
        if (!(this.sprite instanceof Phaser.GameObjects.Sprite)) {
            this.sprite.setFillStyle(newTierConfig.color);
        }

        // Emit event for scene to handle (zoom, cleanup)
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
        // Return active visible tiers for collision checking
        return [
            Math.max(1, this.currentTier - 1),
            this.currentTier,
            this.currentTier + 1
        ];
    }

    takeDamage() {
        return this.config.SCORING ? this.config.SCORING.HAZARD_PENALTY : 80;
    }

    getSize() {
        // Returns the logical size for consumption checks
        return this.size;
    }

    getCollisionRadius() {
        // Returns the visual/physics radius for collision checks
        return this.radius;
    }

    getProgress() {
        // Calculate progress towards next tier
        if (!this.config.SIZE_TIERS) return 0;

        const currentTierIdx = this.currentTier - 1;
        const currentTierConfig = this.config.SIZE_TIERS[currentTierIdx];

        // Next Tier Index
        const nextTierIdx = currentTierIdx + 1;

        const baseSize = this.config.PLAYER.INITIAL_SIZE;
        const currentTierStartRadius = baseSize * currentTierConfig.scale;

        let nextTierStartRadius;
        if (nextTierIdx < this.config.SIZE_TIERS.length) {
            nextTierStartRadius = baseSize * this.config.SIZE_TIERS[nextTierIdx].scale;
        } else {
            // Extrapolate for final level so bar fills up
            const step = this.config.SIZE_TIERS[currentTierIdx].scale - (currentTierIdx > 0 ? this.config.SIZE_TIERS[currentTierIdx-1].scale : 0.5);
            nextTierStartRadius = baseSize * (currentTierConfig.scale + step);
        }

        const totalNeeded = nextTierStartRadius - currentTierStartRadius;
        // Progress based on size
        const currentProgress = this.size - currentTierStartRadius;

        return Phaser.Math.Clamp(currentProgress / totalNeeded, 0, 1);
    }
}
