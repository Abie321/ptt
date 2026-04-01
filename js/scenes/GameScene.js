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
                let isSpriteSheet = false;
                let frameWidth = null;
                let frameHeight = null;

                // Check if it's the player spritesheet
                if (this.levelConfig.PLAYER && this.levelConfig.PLAYER.SPRITE &&
                    key === this.levelConfig.PLAYER.SPRITE.KEY &&
                    this.levelConfig.PLAYER.SPRITE.USE_SPRITESHEET) {
                    isSpriteSheet = true;
                    frameWidth = this.levelConfig.PLAYER.SPRITE.FRAME_WIDTH;
                    frameHeight = this.levelConfig.PLAYER.SPRITE.FRAME_HEIGHT;
                }

                // Check if it's a hazard spritesheet
                if (!isSpriteSheet && this.levelConfig.TIER_ENTITIES) {
                    for (const tier in this.levelConfig.TIER_ENTITIES) {
                        for (const entity of this.levelConfig.TIER_ENTITIES[tier]) {
                            if (entity.isHazard && entity.SPRITE && entity.SPRITE.KEY === key && entity.SPRITE.USE_SPRITESHEET) {
                                isSpriteSheet = true;
                                frameWidth = entity.SPRITE.FRAME_WIDTH;
                                frameHeight = entity.SPRITE.FRAME_HEIGHT;
                                break;
                            }
                        }
                        if (isSpriteSheet) break;
                    }
                }

                if (isSpriteSheet) {
                    this.load.spritesheet(key, path, {
                        frameWidth: frameWidth,
                        frameHeight: frameHeight
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

    createHazardAnimations() {
        if (!this.levelConfig.TIER_ENTITIES) return;

        for (const tier in this.levelConfig.TIER_ENTITIES) {
            for (const entity of this.levelConfig.TIER_ENTITIES[tier]) {
                if (entity.isHazard && entity.SPRITE && entity.SPRITE.USE_SPRITESHEET && entity.SPRITE.ANIMATIONS) {
                    const anims = entity.SPRITE.ANIMATIONS;
                    for (const [key, config] of Object.entries(anims)) {
                        // Create unique animation key for this hazard type
                        const direction = key.toLowerCase();
                        const animKey = `${entity.type.replace(/\s+/g, '_').toLowerCase()}_${direction}`;

                        // Only create if it doesn't already exist
                        if (!this.anims.exists(animKey)) {
                            this.anims.create({
                                key: animKey,
                                frames: this.anims.generateFrameNumbers(entity.SPRITE.KEY, config),
                                frameRate: config.rate,
                                repeat: -1
                            });
                        }
                    }
                }
            }
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

        // Create hazard animations
        this.createHazardAnimations();

        // Apply View Area resize
        const viewArea = this.levelConfig.VIEW_AREA || { WIDTH: 800, HEIGHT: 600 };
        if (this.scale && this.scale.resize) {
            this.scale.resize(viewArea.WIDTH, viewArea.HEIGHT);
        }

        // Get initial tier config
        const initialTierConfig = this.levelConfig.SIZE_TIERS[0];
        const initialWorld = initialTierConfig.LEVEL_AREA || { WIDTH: 1600, HEIGHT: 1200 };

        // Set world bounds
        this.physics.world.setBounds(0, 0, initialWorld.WIDTH, initialWorld.HEIGHT);

        // Add background
        const bgKey = (initialTierConfig.ASSETS && initialTierConfig.ASSETS.BACKGROUND_IMAGE) ? 'background_tier_1' : 'background';

        let bgScale = 1;
        if (initialTierConfig.ASSETS && initialTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) {
            bgScale = initialTierConfig.ASSETS.BACKGROUND_SCALE;
        }

        let bgX = initialWorld.WIDTH / 2;
        let bgY = initialWorld.HEIGHT / 2;
        let useTopLeftOrigin = false;

        if (initialTierConfig.ASSETS && initialTierConfig.ASSETS.BACKGROUND_X !== undefined && initialTierConfig.ASSETS.BACKGROUND_Y !== undefined) {
            bgX = initialTierConfig.ASSETS.BACKGROUND_X;
            bgY = initialTierConfig.ASSETS.BACKGROUND_Y;
            useTopLeftOrigin = true;
        }

        if (initialTierConfig.ASSETS && initialTierConfig.ASSETS.TILE_BACKGROUND) {
            this.bg = this.add.tileSprite(
                bgX,
                bgY,
                initialWorld.WIDTH / bgScale,
                initialWorld.HEIGHT / bgScale,
                bgKey
            );
        } else {
            this.bg = this.add.image(bgX, bgY, bgKey);
        }

        if (useTopLeftOrigin) {
            this.bg.setOrigin(0, 0);
        }

        this.bg.setScale(bgScale);
        this.bg.setDepth(-1); // Ensure it's behind everything

        // Create player
        this.player = new Player(this, initialWorld.WIDTH / 2, initialWorld.HEIGHT / 2);

        // Camera follows player
        this.cameras.main.setBounds(0, 0, initialWorld.WIDTH, initialWorld.HEIGHT);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

        // Apply initial camera zoom
        if (initialTierConfig.zoom !== undefined) {
            this.cameras.main.setZoom(initialTierConfig.zoom);
        }

        // Create item groups
        this.edibleItems = {};
        this.hazards = this.add.group();

        // Spawn entities for all tiers based on new configuration
        this.spawnEntities();

        // Setup item colliders
        this.setupColliders();

        // Listen for tier advancement
        this.events.on('tierAdvanced', this.onTierAdvanced, this);

        // Initial visibility update
        this.updateEntityVisibility();

        // Initial winnability check
        if (!this.checkWinnability()) {
            this.showImpossibleWarning();
        }

        // Create UI camera
        this.uiCamera = this.cameras.add(0, 0, this.cameras.main.width, this.cameras.main.height);

        // Tell the UI camera to ignore the game world elements so it only renders HUD
        if (this.bg) this.uiCamera.ignore(this.bg);
        if (this.player && this.player.sprite) this.uiCamera.ignore(this.player.sprite);
        if (this.player && this.player.mouthIndicator) this.uiCamera.ignore(this.player.mouthIndicator);

        // Tell uiCamera to ignore all current entities
        this.updateUICameraIgnore();

        // Create HUD (fixed to camera)
        this.createHUD();

        // ESC key for pause
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            // In a full implementation, show pause menu here
        });

        // Cleanup on scene shutdown
        this.events.on('shutdown', this.shutdown, this);
    }

    shutdown() {
        if (this.events) {
            this.events.off('tierAdvanced', this.onTierAdvanced, this);
            this.events.off('shutdown', this.shutdown, this);
        }

        if (this.edibleItems) {
            for (let tier in this.edibleItems) {
                const group = this.edibleItems[tier];
                if (group) {
                    // Destroy all children manually before destroying the group
                    if (typeof group.getChildren === 'function') {
                        const items = group.getChildren();
                        if (items) {
                            [...items].forEach(item => {
                                if (item && typeof item.destroy === 'function') {
                                    item.destroy();
                                }
                            });
                        }
                    }
                    if (typeof group.destroy === 'function') {
                        group.destroy(true, true);
                    }
                }
            }
            this.edibleItems = {};
        }

        if (this.hazards) {
            // Destroy all children manually before destroying the group
            if (typeof this.hazards.getChildren === 'function') {
                const hazardItems = this.hazards.getChildren();
                if (hazardItems) {
                    [...hazardItems].forEach(hazard => {
                        if (hazard && typeof hazard.destroy === 'function') {
                            hazard.destroy();
                        }
                    });
                }
            }
            if (typeof this.hazards.destroy === 'function') {
                this.hazards.destroy(true, true);
            }
            this.hazards = null;
        }

        if (this.player && this.player.sprite) {
            this.player.sprite.destroy();
            if (this.player.mouthIndicator) {
                this.player.mouthIndicator.destroy();
            }
            this.player = null;
        }

        if (this.bg) {
            this.bg.destroy();
            this.bg = null;
        }

        // Clean up UI timers/tweens
        if (this.consumedFadeEvent) {
            this.consumedFadeEvent.remove();
            this.consumedFadeEvent = null;
        }
        if (this.consumedTween) {
            this.consumedTween.stop();
            this.consumedTween = null;
        }
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

        // Gather existing entities for overlap checking
        const existingEntities = [];

        // Add existing hazards
        if (this.hazards) {
            this.hazards.getChildren().forEach(hazard => {
                let r = hazard.radius;
                if (r === undefined && hazard.hazardData && hazard.hazardData.radius !== undefined) {
                    r = hazard.hazardData.radius;
                }
                if (r === undefined || isNaN(r)) {
                    r = hazard.displayWidth / 2;
                }
                existingEntities.push({
                    x: hazard.x,
                    y: hazard.y,
                    radius: r
                });
            });
        }

        // Add existing edibles from all tiers
        for (let t = 1; t <= this.levelConfig.SIZE_TIERS.length; t++) {
            if (this.edibleItems[t]) {
                this.edibleItems[t].getChildren().forEach(item => {
                    let r = item.radius;
                    if (r === undefined && item.itemData && item.itemData.radius !== undefined) {
                        r = item.itemData.radius;
                    }
                    if (r === undefined || isNaN(r)) {
                        r = item.displayWidth / 2;
                    }
                    existingEntities.push({
                        x: item.x,
                        y: item.y,
                        radius: r
                    });
                });
            }
        }

        // Get the current player tier config
        const playerTierIndex = (this.player && this.player.getCurrentTier) ? (this.player.getCurrentTier() - 1) : 0;
        const playerTierConfig = this.levelConfig.SIZE_TIERS[playerTierIndex] || this.levelConfig.SIZE_TIERS[0];
        const playerBgScale = (playerTierConfig.ASSETS && playerTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? playerTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;

        entities.forEach(entityConfig => {
            const count = entityConfig.count || 1;

            for (let i = 0; i < count; i++) {
                // Determine bounds based on the entity's tier
                const entityTierIndex = tier - 1;
                const tierConfig = this.levelConfig.SIZE_TIERS[entityTierIndex] || this.levelConfig.SIZE_TIERS[0];
                const world = tierConfig.LEVEL_AREA || { WIDTH: 1600, HEIGHT: 1200 };
                const itemBgScale = (tierConfig.ASSETS && tierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? tierConfig.ASSETS.BACKGROUND_SCALE : 1.0;

                const bgScaleRatio = playerBgScale / itemBgScale;

                // Pre-calculate radius
                let logicalRadius;
                if (Array.isArray(entityConfig.size) && entityConfig.size.length === 2) {
                    logicalRadius = Phaser.Math.Between(entityConfig.size[0], entityConfig.size[1]);
                } else {
                    if (entityConfig.isHazard) {
                        logicalRadius = entityConfig.size !== undefined ? entityConfig.size : (15 + (tier * 5));
                    } else {
                        logicalRadius = entityConfig.size !== undefined ? entityConfig.size : (8 + (tier * 3));
                    }
                }

                const scale = (this.player && this.player.currentScale) ? this.player.currentScale : 1.0;
                const radius = logicalRadius * scale;

                let x, y;
                let foundSpot = false;

                if (!entityConfig.isHazard) {
                    for (let attempt = 0; attempt < 50; attempt++) {
                        const candidateX = Phaser.Math.Between(50, world.WIDTH - 50);
                        const candidateY = Phaser.Math.Between(50, world.HEIGHT - 50);

                        let overlaps = false;
                        for (const existing of existingEntities) {
                            const dist = Phaser.Math.Distance.Between(candidateX * bgScaleRatio, candidateY * bgScaleRatio, existing.x, existing.y);
                            // Add a 10% + 5px buffer to the radius check to prevent visual overlapping
                            if (dist < (radius + existing.radius) * 1.1 + 5) {
                                overlaps = true;
                                break;
                            }
                        }

                        if (!overlaps) {
                            x = candidateX * bgScaleRatio;
                            y = candidateY * bgScaleRatio;
                            foundSpot = true;
                            break;
                        }
                    }

                    if (!foundSpot) {
                        continue; // Skip placing this edible
                    }
                } else {
                    x = Phaser.Math.Between(50, world.WIDTH - 50) * bgScaleRatio;
                    y = Phaser.Math.Between(50, world.HEIGHT - 50) * bgScaleRatio;
                    foundSpot = true;
                }

                // Calculate subset visibility for Tier N+1 items
                // The user requested to show all higher tier items at lower tiers
                let earlyVisible = true;

                // Inject tier and early visibility flag into the config for the entity to use
                const instanceConfig = { ...entityConfig, tier: tier, earlyVisible: earlyVisible, size: logicalRadius };

                if (entityConfig.isHazard) {
                    const hazard = new Hazard(this, x, y, instanceConfig);
                    this.hazards.add(hazard.sprite);
                    existingEntities.push({
                        x: hazard.sprite.x,
                        y: hazard.sprite.y,
                        radius: hazard.radius
                    });
                } else {
                    const item = new EdibleItem(this, x, y, instanceConfig);
                    if (this.edibleItems[tier]) {
                        this.edibleItems[tier].add(item.sprite);
                    }
                    existingEntities.push({
                        x: item.sprite.x,
                        y: item.sprite.y,
                        radius: item.radius
                    });
                }
            }
        });
    }

    setupColliders() {
        if (!this.levelConfig.SIZE_TIERS) return;

        // Add a collider between player and each edible item group
        for (let tier = 1; tier <= this.levelConfig.SIZE_TIERS.length; tier++) {
            if (this.edibleItems[tier]) {
                this.physics.add.collider(
                    this.player.sprite,
                    this.edibleItems[tier],
                    null, // No collision callback needed, handled in checkConsumption if they overlap
                    (playerSprite, itemSprite) => {
                        // Process callback: return true to collide (solid), false to overlap (pass through)
                        if (!itemSprite.active) return false;

                        // Use explicit radius if available, fallback to displayWidth/2
                        const itemRadius = itemSprite.radius || itemSprite.displayWidth / 2;

                        // If the item is configured to have no collision, always allow overlap
                        if (itemSprite.itemData && itemSprite.itemData.noCollision) {
                            return false;
                        }

                        // Use unscaled sizes for mechanics
                        const itemLogicalSize = (itemSprite.itemData && itemSprite.itemData.size) ? itemSprite.itemData.size : itemRadius;
                        const playerLogicalSize = this.player.getLogicalSize ? this.player.getLogicalSize() : this.player.getSize();

                        // If player cannot eat it, it's solid (return true)
                        // If player can eat it, it's NOT solid (return false), allowing overlap for consumption
                        return playerLogicalSize <= itemLogicalSize;
                    },
                    this
                );
            }
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
        // Positioned to the left of the score, moved down to avoid overlapping with long size text
        const indicatorX = this.cameras.main.width - 250;
        const indicatorY = 85;

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

        // Debug size indicator (bottom-left)
        const initialDebugSize = (this.player.radius * 2).toFixed(2);
        this.debugSizeText = this.add.text(10, this.cameras.main.height - 40, `Debug Size: ${initialDebugSize}`, hudStyle)
            .setOrigin(0, 1) // Bottom-left aligned
            .setScrollFactor(0)
            .setDepth(100);

        // Assign all HUD elements to the UI camera and ignore them on the main camera
        const hudElements = [
            this.sizeText,
            this.progressBarBg,
            this.progressBar,
            this.scoreText,
            this.timerText,
            this.consumedIcon,
            this.consumedText,
            this.debugSizeText
        ];

        if (this.cameras.main) {
            this.cameras.main.ignore(hudElements);
        }

        // Helper to manage fade out
        this.consumedFadeEvent = null;
        this.consumedTween = null;
    }

    update() {
        if (this.gameEnded) return;

        // Update player
        this.player.update();

        // Update hazards (for animations, etc)
        if (this.hazards) {
            this.hazards.getChildren().forEach(hazardSprite => {
                if (hazardSprite.entityWrapper && typeof hazardSprite.entityWrapper.update === 'function') {
                    hazardSprite.entityWrapper.update();
                }
            });
        }

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
                    // If player is invulnerable, skip damage and knockback
                    if (this.player.isInvulnerable) {
                        continue;
                    }

                    // Damage player
                    const penalty = this.player.takeDamage();
                    this.score -= penalty;

                    // Make player invulnerable temporarily
                    if (typeof this.player.makeInvulnerable === 'function') {
                        this.player.makeInvulnerable();
                    }

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
        const despawnGroup = despawnTier > 0 ? this.edibleItems[despawnTier] : null;
        if (despawnGroup) {
            // Manually destroy children to avoid Phaser clear() size bug
            if (typeof despawnGroup.getChildren === 'function') {
                const items = despawnGroup.getChildren();
                if (items) {
                    [...items].forEach(item => {
                        if (item && typeof item.destroy === 'function') {
                            item.destroy();
                        }
                    });
                }
            }
            if (typeof despawnGroup.clear === 'function') {
                despawnGroup.clear(false, false);
            }
        }

        // --- Re-baselining (Scaling) Logic ---
        // Calculate new scale factor to bring player back down to new tier's initialSize visually
        const newTierConfigData = this.levelConfig.SIZE_TIERS[newTier - 1];
        const initialSize = (newTierConfigData && newTierConfigData.initialSize) ? newTierConfigData.initialSize : 11;
        const scaleMultiplier = initialSize / this.player.size;

        // --- Calculate Background Repositioning Ratio ---
        // Find the scale of the old tier and the new tier to undo the coordinate multiplication
        const oldTierConfig = this.levelConfig.SIZE_TIERS[newTier - 2];
        const oldBgScale = (oldTierConfig && oldTierConfig.ASSETS && oldTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? oldTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;
        const newBgScale = (newTierConfigData && newTierConfigData.ASSETS && newTierConfigData.ASSETS.BACKGROUND_SCALE !== undefined) ? newTierConfigData.ASSETS.BACKGROUND_SCALE : 1.0;

        // Items were placed at X * (oldBgScale / itemBgScale)
        // Now they should be at X * (newBgScale / itemBgScale)
        // To fix this without re-evaluating itemBgScale, we just multiply their current position by (newBgScale / oldBgScale)
        const repositionRatio = newBgScale / oldBgScale;

        // Update cumulative global scale
        this.player.currentScale *= scaleMultiplier;

        // Scale player visually
        this.player.size *= scaleMultiplier;
        this.player.radius *= scaleMultiplier;
        this.player.updateSpriteScale();

        // Update player coordinates to keep relative position in the newly scaled world
        this.player.sprite.x *= repositionRatio;
        this.player.sprite.y *= repositionRatio;

        // Scale and reposition all existing entities visually
        // Edibles
        for (let tier = 1; tier <= this.levelConfig.SIZE_TIERS.length; tier++) {
            if (!this.edibleItems[tier]) continue;
            const items = this.edibleItems[tier].getChildren();
            items.forEach(item => {
                if (item) {
                    // Update the visual property stored on the sprite
                    if (item.radius !== undefined) item.radius *= scaleMultiplier;
                    if (item.itemData && item.itemData.radius !== undefined) {
                        item.itemData.radius *= scaleMultiplier;
                    }

                    if (item.displayWidth !== undefined) {
                         const currentScale = item.scale !== undefined ? item.scale : 1;
                         item.setScale(currentScale * scaleMultiplier);
                    }
                    if (item.body) {
                         // Rescale physics body
                         if (item.geom && item.geom.radius !== undefined && item.radius !== undefined) {
                             item.geom.radius = item.radius;
                         } else if (item.radius !== undefined && typeof item.setRadius === 'function') {
                             item.setRadius(item.radius);
                         }
                    }
                    // Reposition
                    item.x *= repositionRatio;
                    item.y *= repositionRatio;
                }
            });
        }

        // Hazards
        this.hazards.getChildren().forEach(hazard => {
            if (hazard) {
                // Update the visual property stored on the sprite
                if (hazard.radius !== undefined) hazard.radius *= scaleMultiplier;
                if (hazard.hazardData && hazard.hazardData.radius !== undefined) {
                    hazard.hazardData.radius *= scaleMultiplier;
                }

                if (hazard.displayWidth !== undefined) {
                     const currentScale = hazard.scale !== undefined ? hazard.scale : 1;
                     hazard.setScale(currentScale * scaleMultiplier);
                }
                if (hazard.body) {
                     // Rescale physics body
                     if (hazard.geom && hazard.geom.radius !== undefined && hazard.radius !== undefined) {
                         hazard.geom.radius = hazard.radius;
                     } else if (hazard.radius !== undefined && typeof hazard.setRadius === 'function') {
                         hazard.setRadius(hazard.radius);
                     }
                }
                // Reposition
                hazard.x *= repositionRatio;
                hazard.y *= repositionRatio;
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
            const world = newTierConfig.LEVEL_AREA || { WIDTH: 1600, HEIGHT: 1200 };

            // Adjust bounds to the actual absolute size of the new tier's world
            this.physics.world.setBounds(0, 0, world.WIDTH, world.HEIGHT);
            this.cameras.main.setBounds(0, 0, world.WIDTH, world.HEIGHT);

            if (this.bg) {
                let bgKey = this.bg.texture.key;
                if (newTierConfig.ASSETS && newTierConfig.ASSETS.BACKGROUND_IMAGE) {
                    bgKey = `background_tier_${newTier}`;
                }

                let bgScale = 1;
                if (newTierConfig.ASSETS && newTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) {
                    bgScale = newTierConfig.ASSETS.BACKGROUND_SCALE;
                }

                const isTileBackground = newTierConfig.ASSETS && newTierConfig.ASSETS.TILE_BACKGROUND;

                // If it needs to be a tileSprite and it currently isn't, or vice-versa, or just for a cleaner refresh
                this.bg.destroy();

                let bgX = world.WIDTH / 2;
                let bgY = world.HEIGHT / 2;
                let useTopLeftOrigin = false;

                if (newTierConfig.ASSETS && newTierConfig.ASSETS.BACKGROUND_X !== undefined && newTierConfig.ASSETS.BACKGROUND_Y !== undefined) {
                    bgX = newTierConfig.ASSETS.BACKGROUND_X;
                    bgY = newTierConfig.ASSETS.BACKGROUND_Y;
                    useTopLeftOrigin = true;
                }

                if (isTileBackground) {
                    this.bg = this.add.tileSprite(
                        bgX,
                        bgY,
                        world.WIDTH / bgScale,
                        world.HEIGHT / bgScale,
                        bgKey
                    );
                } else {
                    this.bg = this.add.image(bgX, bgY, bgKey);
                }

                if (useTopLeftOrigin) {
                    this.bg.setOrigin(0, 0);
                }

                this.bg.setScale(bgScale);
                this.bg.setDepth(-1); // Ensure it's behind everything
            }
        }

        // Update entity visibility based on new tier
        this.updateEntityVisibility();

        // Tell UI camera to ignore newly spawned entities and the background
        if (this.bg && this.uiCamera) this.uiCamera.ignore(this.bg);
        this.updateUICameraIgnore();

        // Handle Camera Zoom Animation
        if (newTierConfig) {
            const targetZoom = newTierConfig.zoom !== undefined ? newTierConfig.zoom : 1.0;

            if (newTier >= 2 && newTierConfig.zoomInStart !== undefined) {
                // Set the camera immediately to the zoomed in state
                this.cameras.main.setZoom(newTierConfig.zoomInStart);

                // Animate zoom to the target zoom level
                this.tweens.add({
                    targets: this.cameras.main,
                    zoom: targetZoom,
                    duration: 1000,
                    ease: 'Sine.easeOut'
                });
            } else {
                this.cameras.main.setZoom(targetZoom);
            }
        }

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

            // Only fully show N-1 and N. N+1 is conditionally visible
            const items = this.edibleItems[tier].getChildren();
            items.forEach(item => {
                if (item) {
                    let isVisible = false;
                    if (tier === playerTier - 1) {
                        if (item.itemData && item.itemData.hideInNextTier) {
                            isVisible = false;
                        } else {
                            isVisible = true;
                        }
                    } else if (tier === playerTier) {
                        isVisible = true;
                    } else if (tier === playerTier + 1) {
                        // Apply subset visibility if it's tier N+1
                        if (item.itemData && item.itemData.hideInPreviousTier) {
                            // If it should be hidden in previous tier, do not make it early visible
                            isVisible = false;
                        } else if (item.itemData && item.itemData.earlyVisible !== undefined) {
                            isVisible = item.itemData.earlyVisible;
                        } else {
                            isVisible = true; // Fallback
                        }
                    }

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
            let isVisible = false;

            if (tier === playerTier - 1) {
                if (hazard.hazardData && hazard.hazardData.hideInNextTier) {
                    isVisible = false;
                } else {
                    isVisible = true;
                }
            } else if (tier === playerTier) {
                isVisible = true;
            } else if (tier === playerTier + 1) {
                 // Apply subset visibility if it's tier N+1
                 if (hazard.hazardData && hazard.hazardData.hideInPreviousTier) {
                     isVisible = false;
                 } else if (hazard.hazardData.earlyVisible !== undefined) {
                     isVisible = hazard.hazardData.earlyVisible;
                 } else {
                     isVisible = true; // Fallback
                 }
            }

            // REQ-DMG-006 Override
            if (playerTier === 1) {
                isVisible = false;
            }

            hazard.setActive(isVisible);
            hazard.setVisible(isVisible);
        });
    }

    updateUICameraIgnore() {
        if (!this.uiCamera) return;

        const ignoreList = [];

        // Add all edibles
        for (let tier = 1; tier <= this.levelConfig.SIZE_TIERS.length; tier++) {
            if (!this.edibleItems[tier]) continue;
            const items = this.edibleItems[tier].getChildren();
            ignoreList.push(...items);
        }

        // Add all hazards
        ignoreList.push(...this.hazards.getChildren());

        if (ignoreList.length > 0) {
            this.uiCamera.ignore(ignoreList);
        }
    }

    updateHUD() {
        // Size indicator
        const tierConfig = this.levelConfig.SIZE_TIERS[this.player.getCurrentTier() - 1];
        const internalSize = this.player.internalSize.toFixed(2);
        this.sizeText.setText(`Size: ${tierConfig.name} (Tier ${this.player.getCurrentTier()}) - Internal Size: ${internalSize}`);

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

        // Debug size
        const debugSize = (this.player.radius * 2).toFixed(2);
        this.debugSizeText.setText(`Debug Size: ${debugSize}`);
    }

    checkWinCondition() {
        // Win when player reaches the configured winSize
        const winSize = this.levelConfig.winSize;
        if (this.player.getLogicalSize() >= winSize) {
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
            const initialSize = (this.levelConfig.SIZE_TIERS && this.levelConfig.SIZE_TIERS[0] && this.levelConfig.SIZE_TIERS[0].initialSize) ? this.levelConfig.SIZE_TIERS[0].initialSize : 11;
            targetRadius = initialSize * maxTierConfig.scale;
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
        if (this.gameEnded || this.hasSeenImpossibleWarning) return;
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

        const continueBtn = this.add.text(centerX, centerY + 50, 'Continue Anyway', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.gameEnded = false;
            this.hasSeenImpossibleWarning = true;
            this.physics.resume();
            bg.destroy();
            text.destroy();
            continueBtn.destroy();
        });

        bg.setDepth(1000);
        text.setDepth(1001);
        continueBtn.setDepth(1001);

        // Assign warning UI to UI camera and ignore on main camera
        if (this.cameras.main) {
            this.cameras.main.ignore([bg, text, continueBtn]);
        }
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
