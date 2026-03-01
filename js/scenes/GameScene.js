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
        if (this.levelConfig.SIZE_TIERS) {
            this.levelConfig.SIZE_TIERS.forEach((tier, index) => {
                if (tier.ASSETS && tier.ASSETS.BACKGROUND_IMAGE) {
                    this.load.image(`background_tier_${index + 1}`, tier.ASSETS.BACKGROUND_IMAGE);
                }
            });
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

        // Get initial tier config
        const initialTierConfig = this.levelConfig.SIZE_TIERS[0];
        const initialWorld = initialTierConfig.WORLD || { WIDTH: 1600, HEIGHT: 1200 };

        // Set world bounds
        this.physics.world.setBounds(0, 0, initialWorld.WIDTH, initialWorld.HEIGHT);

        // Add background
        const bgKey = (initialTierConfig.ASSETS && initialTierConfig.ASSETS.BACKGROUND_IMAGE) ? 'background_tier_1' : 'background';
        this.bg = this.add.image(initialWorld.WIDTH / 2, initialWorld.HEIGHT / 2, bgKey);
        this.bg.setDepth(-1); // Ensure it's behind everything

        // Create player
        this.player = new Player(this, initialWorld.WIDTH / 2, initialWorld.HEIGHT / 2);

        // Camera follows player
        this.cameras.main.setBounds(0, 0, initialWorld.WIDTH, initialWorld.HEIGHT);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

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

        // Initially spawn only tiers 1 and 2
        this.spawnTierEntities(1);
        this.spawnTierEntities(2);
    }

    spawnTierEntities(tier) {
        if (!this.levelConfig.TIER_ENTITIES || !this.levelConfig.TIER_ENTITIES[tier]) return;

        const entities = this.levelConfig.TIER_ENTITIES[tier];

        entities.forEach(entityConfig => {
            const count = entityConfig.count || 1;

            for (let i = 0; i < count; i++) {
                // Determine bounds for this tier
                const tierConfig = this.levelConfig.SIZE_TIERS[tier - 1] || this.levelConfig.SIZE_TIERS[this.levelConfig.SIZE_TIERS.length - 1];
                const world = tierConfig.WORLD || { WIDTH: 1600, HEIGHT: 1200 };
                const x = Phaser.Math.Between(50, world.WIDTH - 50);
                const y = Phaser.Math.Between(50, world.HEIGHT - 50);

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
                // Use explicit radius if available, fallback to displayWidth/2
                const itemRadius = item.radius || item.displayWidth / 2;

                // Check if mouth touches the item (collision check using visual radii)
                if (distance < this.player.getCollisionRadius() * 0.5 + itemRadius) {
                    // Check if player is larger than item (size-based consumption)
                    // Use unscaled sizes for mechanics
                    const itemLogicalSize = (item.itemData && item.itemData.size) ? item.itemData.size : itemRadius;
                    const playerLogicalSize = this.player.getLogicalSize ? this.player.getLogicalSize() : this.player.getSize();

                    if (playerLogicalSize > itemLogicalSize) {
                        const points = this.player.consume(item.itemData);
                        this.score += points;
                        this.showConsumedItem(item.itemData); // Show HUD indicator
                        item.destroy();
                        break; // Only consume one item per frame
                    }
                }
            }
        });
    }

    checkHazardCollisions() {
        // Create a copy to safely modify the group during iteration
        const hazards = [...this.hazards.getChildren()];

        for (let hazard of hazards) {
            if (!hazard.active || !hazard.hazardData) continue;

            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                hazard.x, hazard.y
            );

            const hazardRadius = hazard.radius || hazard.displayWidth / 2;

            // Check collision (Body vs Body) using visual radii
            if (distance < this.player.getCollisionRadius() + hazardRadius) {
                // Size-based Interaction
                // If Player > Hazard, consume
                // Use unscaled sizes for mechanics
                const hazardLogicalSize = (hazard.hazardData && hazard.hazardData.size) ? hazard.hazardData.size : hazardRadius;
                const playerLogicalSize = this.player.getLogicalSize ? this.player.getLogicalSize() : this.player.getSize();

                if (playerLogicalSize > hazardLogicalSize) {
                    // Consume hazard
                    const points = this.player.consume(hazard.hazardData);
                    this.score += points;
                    this.showConsumedItem(hazard.hazardData); // Show HUD indicator
                    hazard.destroy();
                } else {
                    // Damage player
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

        // --- Re-baselining (Scaling) Logic ---
        // Calculate new scale factor to bring player back down to INITIAL_SIZE visually
        const initialSize = this.levelConfig.PLAYER.INITIAL_SIZE || 20;
        const scaleMultiplier = initialSize / this.player.size;

        // Update cumulative global scale
        this.player.currentScale *= scaleMultiplier;

        // Scale player visually
        this.player.size *= scaleMultiplier;
        this.player.radius *= scaleMultiplier;
        this.player.updateSpriteScale();

        // Scale all existing entities visually
        // Edibles
        for (let tier = 1; tier <= this.levelConfig.SIZE_TIERS.length; tier++) {
            if (!this.edibleItems[tier]) continue;
            this.edibleItems[tier].getChildren().forEach(item => {
                if (item) {
                    item.radius *= scaleMultiplier;
                    if (item.displayWidth !== undefined) {
                         const currentScale = item.scale !== undefined ? item.scale : 1;
                         item.setScale(currentScale * scaleMultiplier);
                    }
                    if (item.body) {
                         // Some logic to rescale physics body if needed, simple approach:
                         if (item.geom && item.geom.radius !== undefined) {
                             item.geom.radius = item.radius;
                         } else if (item.radius !== undefined && typeof item.setRadius === 'function') {
                             item.setRadius(item.radius);
                         }
                    }
                }
            });
        }

        // Hazards
        this.hazards.getChildren().forEach(hazard => {
            if (hazard) {
                hazard.radius *= scaleMultiplier;
                if (hazard.displayWidth !== undefined) {
                     const currentScale = hazard.scale !== undefined ? hazard.scale : 1;
                     hazard.setScale(currentScale * scaleMultiplier);
                }
                if (hazard.body) {
                     if (hazard.geom && hazard.geom.radius !== undefined) {
                         hazard.geom.radius = hazard.radius;
                     } else if (hazard.radius !== undefined && typeof hazard.setRadius === 'function') {
                         hazard.setRadius(hazard.radius);
                     }
                }
            }
        });

        // Spawn items for tier N+1
        const spawnTier = newTier + 1;
        if (spawnTier <= this.levelConfig.SIZE_TIERS.length) {
            this.spawnTierEntities(spawnTier);
        }

        // Update world bounds and background for the new tier
        const newTierConfig = this.levelConfig.SIZE_TIERS[newTier - 1];
        if (newTierConfig) {
            const world = newTierConfig.WORLD || { WIDTH: 1600, HEIGHT: 1200 };

            // Adjust bounds to the actual absolute size of the new tier's world
            this.physics.world.setBounds(0, 0, world.WIDTH, world.HEIGHT);
            this.cameras.main.setBounds(0, 0, world.WIDTH, world.HEIGHT);

            if (this.bg) {
                if (newTierConfig.ASSETS && newTierConfig.ASSETS.BACKGROUND_IMAGE) {
                    this.bg.setTexture(`background_tier_${newTier}`);
                }
                this.bg.setPosition(world.WIDTH / 2, world.HEIGHT / 2);
                this.bg.setScale(1);
            }
        }

        // Update entity visibility based on new tier
        this.updateEntityVisibility();

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
        // Size/Area based winnability check
        // We check against INTERNAL size (progression) now, as that determines if we reach the max tier
        const tierGrowthFactor = this.player.TIER_GROWTH_FACTOR || 0.1;

        // Use internal size for progression check
        const currentRadius = this.player.getLogicalSize ? this.player.getLogicalSize() : (this.player.internalSize || this.player.getSize());
        const currentArea = currentRadius * currentRadius;

        // Calculate Target Area (Max Tier Start Size)
        const maxTierConfig = this.levelConfig.SIZE_TIERS[this.levelConfig.SIZE_TIERS.length - 1];

        // Handle new threshold or legacy scale
        let targetRadius;
        if (maxTierConfig.threshold !== undefined) {
            targetRadius = maxTierConfig.threshold;
        } else {
            targetRadius = this.levelConfig.PLAYER.INITIAL_SIZE * maxTierConfig.scale;
        }

        const targetArea = targetRadius * targetRadius;

        // Calculate total potential area from all entities in the CONFIGURATION
        // Because items are delayed spawned, we can't count on `edibleItems` or `hazards` children
        let potentialAddedArea = 0;

        if (this.levelConfig.TIER_ENTITIES) {
            for (const [tierKey, entities] of Object.entries(this.levelConfig.TIER_ENTITIES)) {
                entities.forEach(entityConfig => {
                    const count = entityConfig.count || 1;

                    // Determine logical size
                    let size = 10;
                    if (Array.isArray(entityConfig.size) && entityConfig.size.length === 2) {
                        // Average size for potential calculation
                        size = (entityConfig.size[0] + entityConfig.size[1]) / 2;
                    } else if (entityConfig.size !== undefined) {
                        size = entityConfig.size;
                    } else if (entityConfig.isHazard) {
                        size = 15 + (parseInt(tierKey) * 5);
                    } else {
                        size = 8 + (parseInt(tierKey) * 3);
                    }

                    // Add area for all instances
                    potentialAddedArea += (size * size * tierGrowthFactor) * count;
                });
            }
        }

        // Check if achievable
        if (currentArea + potentialAddedArea < targetArea) {
            return false;
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
