// Main Game Scene

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        // Default for tests that might skip init
        if (typeof GameConfig !== 'undefined' && GameConfig.LEVELS) {
             this.levelConfig = GameConfig.LEVELS[0];
        } else {
             this.levelConfig = {};
        }
    }

    init(data) {
        // Initialize level config
        if (data && data.levelConfig) {
            this.levelConfig = data.levelConfig;
        } else if (typeof GameConfig !== 'undefined' && GameConfig.LEVELS) {
             // Fallback to first level
             this.levelConfig = GameConfig.LEVELS[0];
        } else {
             this.levelConfig = {};
        }
    }

    preload() {
        if (this.levelConfig.ASSETS && this.levelConfig.ASSETS.BACKGROUND_IMAGE) {
            this.load.image('background', this.levelConfig.ASSETS.BACKGROUND_IMAGE);
        }
        if (this.levelConfig.ENTITY_IMAGES) {
            for (const [key, path] of Object.entries(this.levelConfig.ENTITY_IMAGES)) {
                if (this.levelConfig.PLAYER && this.levelConfig.PLAYER.SPRITE &&
                    key === this.levelConfig.PLAYER.SPRITE.KEY &&
                    this.levelConfig.PLAYER.SPRITE.USE_SPRITESHEET) {
                    this.load.spritesheet(key, path, {
                        frameWidth: this.levelConfig.PLAYER.SPRITE.FRAME_WIDTH,
                        frameHeight: this.levelConfig.PLAYER.SPRITE.FRAME_HEIGHT
                    });
                } else {
                    this.load.image(key, path);
                }
            }
        }
    }

    generateDummySpriteSheet() {
        const spriteConfig = this.levelConfig.PLAYER.SPRITE;
        const width = spriteConfig.FRAME_WIDTH;
        const height = spriteConfig.FRAME_HEIGHT;
        const frameCount = 32; // Updated to 32

        // Create a graphics object to draw frames
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Draw frames horizontally
        for (let i = 0; i < frameCount; i++) {
            const xOffset = i * width;

            // Draw circle body
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillCircle(xOffset + width/2, height/2, width/2 - 2);

            // Draw detail to show animation
            graphics.fillStyle(0x000000, 1);

            // Simple visual diff for frames based on index
            const pulseSize = 4 + (i % 2) * 2;
            graphics.fillCircle(xOffset + width/2, height/2, pulseSize);

            // Add directional indicator based on range
            // 0-7: Down, 8-15: Up, 16-23: Right, 24-31: Left
            if (i >= 8 && i < 16) { // Up
                 graphics.fillRect(xOffset + width/2 - 5, height/2 - 15, 10, 5);
            } else if (i >= 16 && i < 24) { // Right
                 graphics.fillRect(xOffset + width/2 + 10, height/2 - 5, 5, 10);
            } else if (i >= 24) { // Left
                 graphics.fillRect(xOffset + width/2 - 15, height/2 - 5, 5, 10);
            } else { // Down
                 graphics.fillRect(xOffset + width/2 - 5, height/2 + 10, 10, 5);
            }
        }

        // Generate texture
        graphics.generateTexture(spriteConfig.KEY, width * frameCount, height);
        graphics.destroy();

        // Manually add frames to the texture
        const texture = this.textures.get(spriteConfig.KEY);
        if (texture) {
            for (let i = 0; i < frameCount; i++) {
                texture.add(i, 0, i * width, 0, width, height);
            }
        }
    }

    createPlayerAnimations() {
        const spriteConfig = this.levelConfig.PLAYER.SPRITE;
        const anims = spriteConfig.ANIMATIONS;

        for (const [key, config] of Object.entries(anims)) {
            // Convert 'DOWN' to 'down', etc.
            const animKey = key.toLowerCase();
            this.anims.create({
                key: animKey,
                frames: this.anims.generateFrameNumbers(spriteConfig.KEY, config),
                frameRate: config.rate,
                repeat: -1
            });
        }
    }

    create() {
        // Initialize game state
        this.score = 0;
        this.startTime = Date.now();
        this.gameEnded = false;

        // Generate player sprite if needed and create animations
        if (this.levelConfig.PLAYER && this.levelConfig.PLAYER.SPRITE && this.levelConfig.PLAYER.SPRITE.USE_SPRITESHEET) {
            if (!this.textures.exists(this.levelConfig.PLAYER.SPRITE.KEY)) {
                this.generateDummySpriteSheet();
            }
            this.createPlayerAnimations();
        }

        // Set world bounds
        this.physics.world.setBounds(0, 0, this.levelConfig.WORLD.WIDTH, this.levelConfig.WORLD.HEIGHT);

        // Add background
        const bg = this.add.image(this.levelConfig.WORLD.WIDTH / 2, this.levelConfig.WORLD.HEIGHT / 2, 'background');
        bg.setDepth(-1); // Ensure it's behind everything

        // Create player
        this.player = new Player(this, this.levelConfig.WORLD.WIDTH / 2, this.levelConfig.WORLD.HEIGHT / 2);

        // Camera follows player
        this.cameras.main.setBounds(0, 0, this.levelConfig.WORLD.WIDTH, this.levelConfig.WORLD.HEIGHT);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(this.levelConfig.SIZE_TIERS[0].zoom);

        // Create item groups
        this.edibleItems = {};
        this.hazards = this.add.group();

        // Spawn entities for all tiers based on new configuration
        this.spawnEntities();

        // Listen for tier advancement
        this.events.on('tierAdvanced', this.onTierAdvanced, this);

        // Initial visibility update
        this.updateEntityVisibility();

        // Initial winnability check
        if (!this.checkWinnability()) {
            this.showImpossibleWarning();
        }

        // Create HUD (fixed to camera)
        this.createHUD();

        // ESC key for pause
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            // In a full implementation, show pause menu here
        });
    }

    spawnEntities() {
        if (!this.levelConfig.TIER_ENTITIES) return;

        // Initialize edibleItems groups per tier
        for (let tier = 1; tier <= this.levelConfig.SIZE_TIERS.length; tier++) {
            this.edibleItems[tier] = this.add.group();
        }

        // Iterate through all tiers in configuration
        for (const [tierKey, entities] of Object.entries(this.levelConfig.TIER_ENTITIES)) {
            const tier = parseInt(tierKey);

            entities.forEach(entityConfig => {
                const count = entityConfig.count || 1;

                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(50, this.levelConfig.WORLD.WIDTH - 50);
                    const y = Phaser.Math.Between(50, this.levelConfig.WORLD.HEIGHT - 50);

                    // Inject tier into the config for the entity to use
                    const instanceConfig = { ...entityConfig, tier: tier };

                    if (entityConfig.isHazard) {
                        const hazard = new Hazard(this, x, y, instanceConfig);
                        this.hazards.add(hazard.sprite);
                    } else {
                        const item = new EdibleItem(this, x, y, instanceConfig);
                        if (this.edibleItems[tier]) {
                            this.edibleItems[tier].add(item.sprite);
                        }
                    }
                }
            });
        }
    }

    createHUD() {
        const hudStyle = {
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        };

        // Size indicator (top-left)
        this.sizeText = this.add.text(10, 10, 'Size: Micro (Tier 1)', hudStyle).setScrollFactor(0);

        // Progress bar (below size)
        this.progressBarBg = this.add.rectangle(10, 45, 200, 20, 0x333333).setOrigin(0, 0).setScrollFactor(0);
        this.progressBar = this.add.rectangle(10, 45, 0, 20, 0x4CAF50).setOrigin(0, 0).setScrollFactor(0);

        // Score (top-right)
        this.scoreText = this.add.text(this.cameras.main.width - 10, 10, 'Score: 0', hudStyle)
            .setOrigin(1, 0)
            .setScrollFactor(0);

        // Timer (below score)
        this.timerText = this.add.text(this.cameras.main.width - 10, 45, 'Time: 0:00', hudStyle)
            .setOrigin(1, 0)
            .setScrollFactor(0);

        // REQ-UI-HUD-005: Last Consumed Indicator
        // Positioned to the left of the score
        const indicatorX = this.cameras.main.width - 250;
        const indicatorY = 25;

        // Create graphics for the shape
        this.consumedIcon = this.add.graphics();
        this.consumedIcon.setScrollFactor(0);
        this.consumedIcon.setDepth(100);
        this.consumedIcon.x = indicatorX;
        this.consumedIcon.y = indicatorY;
        this.consumedIcon.alpha = 0;

        // Text for the name
        this.consumedText = this.add.text(indicatorX - 20, indicatorY, '', {
            fontSize: '18px',
            fill: '#fff',
            fontStyle: 'bold'
        })
        .setOrigin(1, 0.5) // Right aligned
        .setScrollFactor(0)
        .setDepth(100);
        this.consumedText.alpha = 0;

        // Helper to manage fade out
        this.consumedFadeEvent = null;
        this.consumedTween = null;
    }

    update() {
        if (this.gameEnded) return;

        // Update player
        this.player.update();

        // Check for consumption collisions
        this.checkConsumption();

        // Check for hazard collisions
        this.checkHazardCollisions();

        // Update HUD
        this.updateHUD();

        // Check win condition
        this.checkWinCondition();
    }

    checkConsumption() {
        const mouthPos = this.player.getMouthPosition();
        const consumableTiers = this.player.getConsumableTiers();

        consumableTiers.forEach(tier => {
            if (!this.edibleItems[tier]) return;

            const items = this.edibleItems[tier].getChildren();
            for (let item of items) {
                if (!item.active) continue;

                const distance = Phaser.Math.Distance.Between(
                    mouthPos.x, mouthPos.y,
                    item.x, item.y
                );

                // Check if mouth touches the item
                if (distance < this.player.getSize() * 0.5 + item.displayWidth / 2) {
                    const points = this.player.consume(item.itemData);
                    this.score += points;
                    this.showConsumedItem(item.itemData); // Show HUD indicator
                    item.destroy();
                    break; // Only consume one item per frame
                }
            }
        });
    }

    checkHazardCollisions() {
        const playerTier = this.player.getCurrentTier();
        // Create a copy to safely modify the group during iteration
        const hazards = [...this.hazards.getChildren()];

        for (let hazard of hazards) {
            if (!hazard.active || !hazard.hazardData) continue;

            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                hazard.x, hazard.y
            );

            // Check collision
            if (distance < this.player.getSize() + hazard.displayWidth / 2) {
                const maxTier = this.levelConfig.SIZE_TIERS.length;
                if (playerTier > hazard.hazardData.tier || playerTier === maxTier) {
                    // Consume hazard
                    const points = this.player.consume(hazard.hazardData);
                    this.score += points;
                    this.showConsumedItem(hazard.hazardData); // Show HUD indicator
                    hazard.destroy();
                } else {
                    // Damage player (equal or greater tier hazards are dangerous)
                    const penalty = this.player.takeDamage();
                    this.score -= penalty;

                    // Visual feedback
                    this.cameras.main.shake(200, 0.01);

                    // Push player away
                    const angle = Phaser.Math.Angle.Between(hazard.x, hazard.y, this.player.sprite.x, this.player.sprite.y);
                    this.player.sprite.body.setVelocity(
                        Math.cos(angle) * 300,
                        Math.sin(angle) * 300
                    );
                }
            }
        }
    }

    onTierAdvanced(newTier) {
        // Despawn items from tier N-2
        const despawnTier = newTier - 2;
        if (despawnTier > 0 && this.edibleItems[despawnTier]) {
            this.edibleItems[despawnTier].clear(true, true);
        }

        // Update entity visibility based on new tier
        this.updateEntityVisibility();

        // Update camera zoom to accommodate larger player
        const tierConfig = this.levelConfig.SIZE_TIERS[newTier - 1];
        if (tierConfig && tierConfig.zoom) {
            this.cameras.main.setZoom(tierConfig.zoom);
        }

        // Visual feedback
        this.cameras.main.flash(500, 255, 255, 255);

        // Check winnability
        if (!this.checkWinnability()) {
            this.showImpossibleWarning();
        }
    }

    updateEntityVisibility() {
        const playerTier = this.player.getCurrentTier();

        // REQ-MECH-013: Entities visible only if in [N-1, N, N+1]
        // REQ-DMG-006: If Player Tier == 1, NO Hazards are visible/active.

        // Update Edible Items
        for (let tier = 1; tier <= this.levelConfig.SIZE_TIERS.length; tier++) {
            if (!this.edibleItems[tier]) continue;

            const isVisible = (tier >= playerTier - 1) && (tier <= playerTier + 1);

            const items = this.edibleItems[tier].getChildren();
            items.forEach(item => {
                if (item) {
                    item.setActive(isVisible);
                    item.setVisible(isVisible);
                }
            });
        }

        // Update Hazards
        const hazards = this.hazards.getChildren();
        hazards.forEach(hazard => {
            if (!hazard.hazardData) return;

            const tier = hazard.hazardData.tier;
            let isVisible = (tier >= playerTier - 1) && (tier <= playerTier + 1);

            // REQ-DMG-006 Override
            if (playerTier === 1) {
                isVisible = false;
            }

            hazard.setActive(isVisible);
            hazard.setVisible(isVisible);
        });
    }

    updateHUD() {
        // Size indicator
        const tierConfig = this.levelConfig.SIZE_TIERS[this.player.getCurrentTier() - 1];
        this.sizeText.setText(`Size: ${tierConfig.name} (Tier ${this.player.getCurrentTier()})`);

        // Progress bar
        const progress = this.player.getProgress();
        this.progressBar.width = 200 * progress;

        // Score
        this.scoreText.setText(`Score: ${this.score}`);

        // Timer
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.timerText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }

    checkWinCondition() {
        // Win when player reaches max tier and completes its quota
        const maxTier = this.levelConfig.SIZE_TIERS.length;
        if (this.player.getCurrentTier() === maxTier && this.player.getProgress() >= 1) {
            this.endLevel();
        }
    }

    endLevel() {
        if (this.gameEnded) return;
        this.gameEnded = true;

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);

        // Calculate stars
        let stars = 0;
        if (this.score >= this.levelConfig.STAR_THRESHOLDS.THREE_STAR) stars = 3;
        else if (this.score >= this.levelConfig.STAR_THRESHOLDS.TWO_STAR) stars = 2;
        else if (this.score >= this.levelConfig.STAR_THRESHOLDS.ONE_STAR) stars = 1;

        // Transition to end scene
        this.scene.start('EndLevelScene', {
            score: this.score,
            time: elapsed,
            stars: stars,
            levelConfig: this.levelConfig
        });
    }

    checkWinnability() {
        // Clone current state
        const currentTier = this.player.getCurrentTier();
        const consumedInTier = this.player.consumedInTier;

        // Count available items per tier (all existing ones, ignoring current active state)
        const availableItems = {};
        for (let t = 1; t <= this.levelConfig.SIZE_TIERS.length; t++) {
            if (this.edibleItems[t]) {
                // use getLength() to count all items including inactive ones (hidden by fog of war)
                availableItems[t] = this.edibleItems[t].getLength();
            } else {
                availableItems[t] = 0;
            }
        }

        // Count available hazards per tier
        const availableHazards = {};
        const hazards = this.hazards.getChildren();
        for (let hazard of hazards) {
            // Count hazards regardless of active state (they might be hidden now but consumable later)
            if (hazard.hazardData) {
                const tier = hazard.hazardData.tier;
                if (!availableHazards[tier]) {
                    availableHazards[tier] = 0;
                }
                availableHazards[tier]++;
            }
        }

        // Iterate through remaining growth stages
        const maxTier = this.levelConfig.SIZE_TIERS.length;

        for (let t = currentTier; t <= maxTier; t++) {
            // 't' represents the player's size tier during this simulation step.
            // We are trying to satisfy the quota to grow from tier 't' to 't+1'.
            const tierConfig = this.levelConfig.SIZE_TIERS[t - 1];
            const quota = tierConfig.quota;

            // If this is the current tier, we already consumed some
            const needed = (t === currentTier) ? (quota - consumedInTier) : quota;

            if (needed <= 0) {
                continue;
            }

            let remainingNeeded = needed;

            // Strategy: Eat from lower tier (t-1) first, then current tier (t)

            // Eat from t-1 (if applicable)
            if (t > 1) {
                const lowerTier = t - 1;

                // Edible items from t-1
                const canEatItems = availableItems[lowerTier] || 0;
                const eatenItems = Math.min(remainingNeeded, canEatItems);
                availableItems[lowerTier] -= eatenItems;
                remainingNeeded -= eatenItems;

                // Hazards from t-1 (now edible since we are tier t)
                // Hazards of tier 'lowerTier' are smaller than player tier 't', so they are edible.
                if (remainingNeeded > 0) {
                    const canEatHazards = availableHazards[lowerTier] || 0;
                    const eatenHazards = Math.min(remainingNeeded, canEatHazards);
                    availableHazards[lowerTier] -= eatenHazards;
                    remainingNeeded -= eatenHazards;
                }
            }

            // Eat from t
            if (remainingNeeded > 0) {
                const sameTier = t;
                const canEat = availableItems[sameTier] || 0;
                const eating = Math.min(remainingNeeded, canEat);
                availableItems[sameTier] -= eating;
                remainingNeeded -= eating;

                // REQ-MECH-014: If at Max Tier, hazards of current tier are also edible
                if (remainingNeeded > 0 && t === maxTier) {
                    const canEatHazards = availableHazards[t] || 0;
                    const eatenHazards = Math.min(remainingNeeded, canEatHazards);
                    availableHazards[t] -= eatenHazards;
                    remainingNeeded -= eatenHazards;
                }
            }

            if (remainingNeeded > 0) {
                // Cannot satisfy quota for tier t
                return false;
            }

            // Simulate despawn for next tier advancement
            // When we advance from t to t+1, items from t-1 are despawned.
            if (t > 1) {
                availableItems[t - 1] = 0;
                availableHazards[t - 1] = 0;
            }
        }

        return true;
    }

    showImpossibleWarning() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.physics.pause();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        const bg = this.add.rectangle(centerX, centerY, width, height, 0x000000, 0.7)
            .setScrollFactor(0);

        const text = this.add.text(centerX, centerY - 50, 'Growth Stunted!\nNot enough food to reach full size.', {
            fontSize: '32px',
            fill: '#ff0000',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        const restartBtn = this.add.text(centerX, centerY + 50, 'Restart Level', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.restart({ levelConfig: this.levelConfig });
        });

        bg.setDepth(1000);
        text.setDepth(1001);
        restartBtn.setDepth(1001);
    }

    showConsumedItem(itemData) {
        if (!itemData) return;

        // Reset any existing tweens or timers
        if (this.consumedFadeEvent) {
            this.consumedFadeEvent.remove();
            this.consumedFadeEvent = null;
        }
        if (this.consumedTween) {
            this.consumedTween.stop(); // Stop tween
            this.tweens.killTweensOf([this.consumedIcon, this.consumedText]); // Ensure clean state
            this.consumedTween = null;
        }

        // With new system, itemData IS the config object
        const name = itemData.type || "Unknown";
        const color = itemData.color !== undefined ? itemData.color : 0xFFFFFF;
        const shape = itemData.shape || 'circle';

        // Update Text
        this.consumedText.setText(name);
        this.consumedText.alpha = 1;

        // Update Graphics
        this.consumedIcon.clear();
        this.consumedIcon.fillStyle(color, 1);

        const size = 10; // Fixed size for HUD
        if (shape === 'circle') {
            this.consumedIcon.fillCircle(0, 0, size);
        } else if (shape === 'square') {
            this.consumedIcon.fillRect(-size, -size, size * 2, size * 2);
        } else {
            // Triangle pointing up
            this.consumedIcon.fillTriangle(0, -size, size, size, -size, size);
        }
        this.consumedIcon.alpha = 1;

        // Schedule fade out after 2 seconds
        this.consumedFadeEvent = this.time.delayedCall(2000, () => {
            this.consumedTween = this.tweens.add({
                targets: [this.consumedIcon, this.consumedText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.consumedTween = null;
                }
            });
        }, [], this);
    }
}
