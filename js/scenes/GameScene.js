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
        if (this.levelConfig.coverImage) {
            this.load.image('level_cover_image', this.levelConfig.coverImage);
        }

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

        // Create graphics object for the closest consumable indicator
        this.closestIndicator = this.add.graphics();
        this.closestIndicator.setDepth(150);
        if (this.uiCamera) {
            this.uiCamera.ignore(this.closestIndicator);
        }

        // ESC key for pause
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            // In a full implementation, show pause menu here
        });

        // Cleanup on scene shutdown
        this.events.on('shutdown', this.shutdown, this);

        // Show cover screen if configured, else start timer
        if (this.levelConfig.coverImage && this.textures.exists('level_cover_image')) {
            this.showCoverScreen();
        }
    }

    shutdown() {
        if (this.events) {
            this.events.off('tierAdvanced', this.onTierAdvanced, this);
            // We should not remove the 'shutdown' listener while the 'shutdown' event is being emitted.
            // Phaser handles scene event cleanup automatically. Removing it here modifies the internal
            // event listener Set during iteration, causing the "Cannot read properties of undefined (reading 'entries')" error.
        }

        if (this.edibleItems) {
            for (let tier in this.edibleItems) {
                const group = this.edibleItems[tier];
                if (group && group.scene) { // Check group.scene to ensure it hasn't already been destroyed
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
                        // Pass false, false so we don't try to double-destroy already manually destroyed children
                        group.destroy(false, false);
                    }
                }
            }
            this.edibleItems = null; // Set to null instead of {} so successive calls skip it
        }

        if (this.hazards && this.hazards.scene) {
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
                // Pass false, false so we don't try to double-destroy already manually destroyed children
                this.hazards.destroy(false, false);
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

        if (this.closestIndicator) {
            this.closestIndicator.destroy();
            this.closestIndicator = null;
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

    spawnTierEntities(tier, allowReplacement = false) {
        if (!this.levelConfig.TIER_ENTITIES || !this.levelConfig.TIER_ENTITIES[tier]) return;

        const entities = this.levelConfig.TIER_ENTITIES[tier];

        // Gather existing entities for overlap checking
        const existingEntities = [];

        // Add existing hazards
        if (this.hazards && this.hazards.scene) {
            this.hazards.getChildren().forEach(hazard => {
                const hazardTier = (hazard.hazardData && hazard.hazardData.tier) ? hazard.hazardData.tier : 1;
                existingEntities.push({
                    sprite: hazard,
                    entityWrapper: hazard.entityWrapper,
                    tier: hazardTier,
                    noCollision: (hazard.hazardData && hazard.hazardData.noCollision) ? true : false
                });
            });
        }

        // Add existing edibles from all tiers
        if (this.edibleItems) {
            for (let t = 1; t <= this.levelConfig.SIZE_TIERS.length; t++) {
                if (this.edibleItems[t] && this.edibleItems[t].scene) {
                    this.edibleItems[t].getChildren().forEach(item => {
                        const itemTier = (item.itemData && item.itemData.tier) ? item.itemData.tier : t;
                        // For tests that might not have set up entityWrapper
                        // We attach it from scene or just store it
                        // Since we just added entityWrapper to hazard, we should ensure item has one too or we access sprite.itemData
                        // item.entityWrapper doesn't exist on EdibleItem natively in previous code, but we can access tierPositions through it if we add it or just look it up. Wait, EdibleItem doesn't attach itself to sprite.entityWrapper. Let's fix that conceptually, or just use the itemData if we can't find it. Actually, wait, tierPositions is on the EdibleItem instance, not the sprite. Let's just find it or fix it.
                        // For now we assume if entityWrapper exists, use it. If not, maybe we can't easily get tierPositions.
                        // I'll make sure EdibleItem sets sprite.entityWrapper too in step 1. Ah, I missed that. Let's just read it from sprite.itemData if possible, but tierPositions isn't there. I'll modify the loop below to check for sprite.entityWrapper. If absent, fallback to old math.

                        existingEntities.push({
                            sprite: item,
                            entityWrapper: item.entityWrapper || null,
                            tier: itemTier,
                            noCollision: (item.itemData && item.itemData.noCollision) ? true : false
                        });
                    });
                }
            }
        }

        // Helper function for geometric overlap checks during spawning
        const checkEntityOverlap = (nativeX, nativeY, nativeRadius, nativeHitbox, existingObj, currentSpawningTier) => {
            // If the existing object has noCollision, it's a background element and won't block placement
            if (existingObj.noCollision) return false;

            // Check if existingObj has precalculated tier positions
            let existingX, existingY, existingRadius, existingHitbox;

            if (existingObj.entityWrapper && existingObj.entityWrapper.tierPositions && existingObj.entityWrapper.tierPositions[currentSpawningTier]) {
                existingX = existingObj.entityWrapper.tierPositions[currentSpawningTier].x;
                existingY = existingObj.entityWrapper.tierPositions[currentSpawningTier].y;
                existingRadius = existingObj.entityWrapper.tierRadii[currentSpawningTier];
                existingHitbox = existingObj.entityWrapper.tierHitboxes ? existingObj.entityWrapper.tierHitboxes[currentSpawningTier] : null;
            } else {
                // Fallback for tests or objects without wrappers
                existingX = existingObj.sprite.x;
                existingY = existingObj.sprite.y;
                existingRadius = existingObj.sprite.radius || 10;
                existingHitbox = null; // simplified fallback
            }

            if (nativeHitbox && existingHitbox) {
                // Rect to Rect
                const rect1 = new Phaser.Geom.Rectangle(
                    nativeX - (nativeHitbox.width) / 2,
                    nativeY - (nativeHitbox.height) / 2,
                    nativeHitbox.width,
                    nativeHitbox.height
                );
                const rect2 = new Phaser.Geom.Rectangle(
                    existingX - (existingHitbox.width) / 2,
                    existingY - (existingHitbox.height) / 2,
                    existingHitbox.width,
                    existingHitbox.height
                );
                return Phaser.Geom.Intersects.RectangleToRectangle(rect1, rect2);
            } else if (nativeHitbox) {
                // Rect to Circle
                const rect = new Phaser.Geom.Rectangle(
                    nativeX - (nativeHitbox.width) / 2,
                    nativeY - (nativeHitbox.height) / 2,
                    nativeHitbox.width,
                    nativeHitbox.height
                );
                // Add buffer to existing circular radius
                const circle = new Phaser.Geom.Circle(existingX, existingY, existingRadius * 1.1 + 5);
                return Phaser.Geom.Intersects.CircleToRectangle(circle, rect);
            } else if (existingHitbox) {
                // Circle to Rect
                const circle = new Phaser.Geom.Circle(nativeX, nativeY, nativeRadius * 1.1 + 5);
                const rect = new Phaser.Geom.Rectangle(
                    existingX - (existingHitbox.width) / 2,
                    existingY - (existingHitbox.height) / 2,
                    existingHitbox.width,
                    existingHitbox.height
                );
                return Phaser.Geom.Intersects.CircleToRectangle(circle, rect);
            } else {
                // Circle to Circle (standard distance check)
                const dist = Phaser.Math.Distance.Between(nativeX, nativeY, existingX, existingY);
                return dist < (nativeRadius + existingRadius) * 1.1 + 5;
            }
        };

        // Get the current player tier config
        const playerTierIndex = (this.player && this.player.getCurrentTier) ? (this.player.getCurrentTier() - 1) : 0;
        const playerTierConfig = this.levelConfig.SIZE_TIERS[playerTierIndex] || this.levelConfig.SIZE_TIERS[0];
        const playerBgScale = (playerTierConfig.ASSETS && playerTierConfig.ASSETS.BACKGROUND_SCALE !== undefined) ? playerTierConfig.ASSETS.BACKGROUND_SCALE : 1.0;

        // Process positioned entities first
        const positionedEntities = entities.filter(e => Array.isArray(e.positions) && e.positions.length > 0);
        // Process random entities next
        const randomEntities = entities.filter(e => !(Array.isArray(e.positions) && e.positions.length > 0));

        [...positionedEntities, ...randomEntities].forEach(entityConfig => {
            const hasPositions = Array.isArray(entityConfig.positions) && entityConfig.positions.length > 0;
            const count = hasPositions ? entityConfig.positions.length : (entityConfig.count || 1);

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
                let radius = logicalRadius * bgScaleRatio;

                let x, y, rotation;
                let foundSpot = false;

                // Logger variables
                let logAttempts = 0;
                let logStatus = 'Skipped';
                let logOverlappedTiers = [];
                let failedCoordinates = [];

                // Pre-calculate an actual visual radius estimation to correctly prevent overlap with large rectangular sprites
                if (entityConfig.image && this.textures) {
                    const tex = this.textures.get(entityConfig.image);
                    if (tex && tex.key !== '__MISSING' && typeof tex.get === 'function') {
                        const frame = tex.get();
                        if (frame && frame.width > 0 && frame.height > 0) {
                            const estimatedScale = (radius * 2) / frame.width;
                            const estimatedHeight = frame.height * estimatedScale;
                            const maxDim = Math.max(radius * 2, estimatedHeight);
                            radius = maxDim / 2;
                        }
                    }
                }

                if (hasPositions) {
                    x = entityConfig.positions[i].x * bgScaleRatio;
                    y = entityConfig.positions[i].y * bgScaleRatio;
                    rotation = entityConfig.positions[i].rotation;
                    logAttempts = 1;

                    // (Positioned entities always conceptually "place", but could fail logic if we change it in the future, so track the coordinate just in case it is skipped)
                    failedCoordinates.push(`(${x.toFixed(1)}, ${y.toFixed(1)})`);

                    if (allowReplacement) {
                        for (let j = existingEntities.length - 1; j >= 0; j--) {
                            const existing = existingEntities[j];
                            if (checkEntityOverlap(entityConfig.positions[i].x, entityConfig.positions[i].y, logicalRadius, entityConfig.hitbox, existing, tier)) {
                                logOverlappedTiers.push(existing.tier);
                                if (entityConfig.hideInPreviousTier) {
                                    // Do not destroy the existing entity, wait for the new entity to become visible
                                } else {
                                    if (existing.sprite && typeof existing.sprite.destroy === 'function') {
                                        existing.sprite.destroy();
                                    }
                                    existingEntities.splice(j, 1);
                                }
                            }
                        }
                    }
                    logStatus = logOverlappedTiers.length > 0 ? 'Overlaps (Replaced/Hidden)' : 'Success';
                    foundSpot = true;
                } else if (!entityConfig.isHazard) {
                    let bestFallback = null;

                    const maxAttempts = (typeof GameConfig !== 'undefined' && GameConfig.PLACEMENT_ATTEMPTS) ? GameConfig.PLACEMENT_ATTEMPTS : 200;
                    for (let attempt = 0; attempt < maxAttempts; attempt++) {
                        logAttempts = attempt + 1;
                        logAttempts = attempt + 1;
                        const candidateX = Phaser.Math.Between(50, world.WIDTH - 50);
                        const candidateY = Phaser.Math.Between(50, world.HEIGHT - 50);
                        const testX = candidateX * bgScaleRatio;
                        const testY = candidateY * bgScaleRatio;

                        const overlaps = [];
                        let hasSameOrHigherTierOverlap = false;

                        for (let j = 0; j < existingEntities.length; j++) {
                            const existing = existingEntities[j];
                            if (checkEntityOverlap(candidateX, candidateY, logicalRadius, entityConfig.hitbox, existing, tier)) {
                                overlaps.push(j);
                                if (existing.tier >= tier) {
                                    hasSameOrHigherTierOverlap = true;
                                }
                            }
                        }

                        // Perfect spot found
                        if (overlaps.length === 0) {
                            x = testX;
                            y = testY;
                            foundSpot = true;
                            logStatus = 'Success (0 overlaps)';
                            break;
                        }

                        // If we have allowReplacement and it only overlaps with lower tier entities
                        if (allowReplacement && !hasSameOrHigherTierOverlap) {
                            bestFallback = { x: testX, y: testY, overlaps: overlaps };
                        }

                        failedCoordinates.push(`(${testX.toFixed(1)}, ${testY.toFixed(1)})`);
                    }

                    if (!foundSpot && bestFallback) {
                        x = bestFallback.x;
                        y = bestFallback.y;
                        foundSpot = true;
                        logStatus = 'Placed with overlaps';

                        // Always collect overlapped tiers for logging
                        for (let idx of bestFallback.overlaps) {
                            logOverlappedTiers.push(existingEntities[idx].tier);
                        }

                        if (!entityConfig.hideInPreviousTier) {
                            // Sort descending so splicing doesn't mess up indices
                            bestFallback.overlaps.sort((a, b) => b - a);
                            for (let idx of bestFallback.overlaps) {
                                const existing = existingEntities[idx];
                                if (existing.tier < tier) {
                                    if (existing.sprite && typeof existing.sprite.destroy === 'function') {
                                        existing.sprite.destroy();
                                    }
                                    existingEntities.splice(idx, 1);
                                }
                            }
                        }
                    }

                    if (!foundSpot) {
                        if (GameConfig && GameConfig.DEBUG) {
                            console.log(`[DEBUG PLACEMENT] Skipped ${entityConfig.type || 'Unknown'} (Tier ${tier}). Attempts: ${logAttempts}. Status: ${logStatus}. allowReplacement: ${allowReplacement}. Failed Coords: [${failedCoordinates.join(', ')}]`);
                        }
                        continue; // Skip placing this edible
                    }
                } else {
                    let bestFallback = null;

                    const maxAttempts = (typeof GameConfig !== 'undefined' && GameConfig.PLACEMENT_ATTEMPTS) ? GameConfig.PLACEMENT_ATTEMPTS : 200;
                    for (let attempt = 0; attempt < maxAttempts; attempt++) {
                        logAttempts = attempt + 1;
                        const candidateX = Phaser.Math.Between(50, world.WIDTH - 50);
                        const candidateY = Phaser.Math.Between(50, world.HEIGHT - 50);
                        const testX = candidateX * bgScaleRatio;
                        const testY = candidateY * bgScaleRatio;

                        const overlaps = [];
                        let hasSameOrHigherTierOverlap = false;

                        for (let j = 0; j < existingEntities.length; j++) {
                            const existing = existingEntities[j];
                            if (checkEntityOverlap(candidateX, candidateY, logicalRadius, entityConfig.hitbox, existing, tier)) {
                                overlaps.push(j);
                                if (existing.tier >= tier) {
                                    hasSameOrHigherTierOverlap = true;
                                }
                            }
                        }

                        // Perfect spot found
                        if (overlaps.length === 0) {
                            x = testX;
                            y = testY;
                            foundSpot = true;
                            logStatus = 'Success (0 overlaps)';
                            break;
                        }

                        // If we have allowReplacement and it only overlaps with lower tier entities
                        if (allowReplacement) {
                            // For hazards we can allow overlap with same/higher tier entities
                            // to ensure they spawn even if the level is crowded (like level 2 tier 3)
                            bestFallback = { x: testX, y: testY, overlaps: overlaps };
                        }

                        failedCoordinates.push(`(${testX.toFixed(1)}, ${testY.toFixed(1)})`);
                    }

                    if (!foundSpot && bestFallback) {
                        x = bestFallback.x;
                        y = bestFallback.y;
                        foundSpot = true;
                        logStatus = 'Placed with overlaps';

                        // Always collect overlapped tiers for logging
                        for (let idx of bestFallback.overlaps) {
                            logOverlappedTiers.push(existingEntities[idx].tier);
                        }

                        if (!entityConfig.hideInPreviousTier) {
                            // Sort descending so splicing doesn't mess up indices
                            bestFallback.overlaps.sort((a, b) => b - a);
                            for (let idx of bestFallback.overlaps) {
                                const existing = existingEntities[idx];
                                if (existing.tier < tier) {
                                    if (existing.sprite && typeof existing.sprite.destroy === 'function') {
                                        existing.sprite.destroy();
                                    }
                                    existingEntities.splice(idx, 1);
                                }
                            }
                        }
                    }

                    if (!foundSpot) {
                        if (GameConfig && GameConfig.DEBUG) {
                            console.log(`[DEBUG PLACEMENT] Skipped ${entityConfig.type || 'Unknown'} (Tier ${tier}). Attempts: ${logAttempts}. Status: ${logStatus}. allowReplacement: ${allowReplacement}. Failed Coords: [${failedCoordinates.join(', ')}]`);
                        }
                        continue; // Skip placing this hazard if no valid spot
                    }
                }

                if (foundSpot && GameConfig && GameConfig.DEBUG) {
                    const overlapStr = logOverlappedTiers.length > 0 ? ` Overlapped Tiers: [${logOverlappedTiers.join(', ')}].` : '';
                    console.log(`[DEBUG PLACEMENT] Placed ${entityConfig.type || 'Unknown'} (Tier ${tier}) at (${x.toFixed(1)}, ${y.toFixed(1)}). Attempts: ${logAttempts}. Status: ${logStatus}.${overlapStr} Scaling Ratio: ${bgScaleRatio.toFixed(2)}. allowReplacement: ${allowReplacement}`);
                }

                // Calculate subset visibility for Tier N+1 items
                // The user requested to show all higher tier items at lower tiers
                let earlyVisible = true;

                // Inject tier and early visibility flag into the config for the entity to use
                const instanceConfig = { ...entityConfig, tier: tier, earlyVisible: earlyVisible, size: logicalRadius };
                if (rotation !== undefined) {
                    instanceConfig.rotation = rotation;
                }

                if (entityConfig.isHazard) {
                    const hazard = new Hazard(this, x, y, instanceConfig);
                    this.hazards.add(hazard.sprite);
                    existingEntities.push({
                        sprite: hazard.sprite,
                        entityWrapper: hazard,
                        tier: tier,
                        noCollision: (hazard.hazardData && hazard.hazardData.noCollision) ? true : false
                    });
                } else {
                    const item = new EdibleItem(this, x, y, instanceConfig);
                    if (this.edibleItems[tier]) {
                        this.edibleItems[tier].add(item.sprite);
                    }
                    existingEntities.push({
                        sprite: item.sprite,
                        entityWrapper: item,
                        tier: tier,
                        noCollision: (item.itemData && item.itemData.noCollision) ? true : false
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
        if (this.gameEnded || this.gamePaused) return;

        // Update player
        this.player.update();

        // Update hazards (for animations, etc)
        if (this.hazards && this.hazards.scene) {
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

        // Update closest consumable indicator
        this.updateClosestIndicator();

        // Check win condition
        this.checkWinCondition();
    }

    updateClosestIndicator() {
        if (!this.closestIndicator) return;

        this.closestIndicator.clear();

        if (!this.player || !this.player.sprite) return;

        let closestItem = null;
        let minDistance = Infinity;

        const playerX = this.player.sprite.x;
        const playerY = this.player.sprite.y;
        const playerLogicalSize = this.player.getLogicalSize ? this.player.getLogicalSize() : this.player.getSize();

        const playerTier = this.player.getCurrentTier();

        // Helper to calculate distance from player to entity, handling rectangles properly
        const getDistanceToEntity = (entity, itemData) => {
            // Get current dynamic coordinates (already in player's tier space)
            let entityX = entity.x;
            let entityY = entity.y;
            let entityHitbox = null;

            if (entity.entityWrapper && entity.entityWrapper.tierPositions && entity.entityWrapper.tierPositions[playerTier]) {
                if (entity.entityWrapper.tierHitboxes && entity.entityWrapper.tierHitboxes[playerTier]) {
                    entityHitbox = {
                        width: entity.entityWrapper.tierHitboxes[playerTier].width * this.player.currentScale,
                        height: entity.entityWrapper.tierHitboxes[playerTier].height * this.player.currentScale
                    };
                }
            } else if (itemData && itemData.hitbox) {
                // Fallback using original sprite scale
                entityHitbox = {
                    width: itemData.hitbox.width * entity.scale,
                    height: itemData.hitbox.height * entity.scale
                };
            }

            if (itemData && entityHitbox) {
                // If rectangular, find distance to the closest point on the rectangle
                const halfWidth = (entityHitbox.width) / 2;
                const halfHeight = (entityHitbox.height) / 2;

                const closestX = Phaser.Math.Clamp(playerX, entityX - halfWidth, entityX + halfWidth);
                const closestY = Phaser.Math.Clamp(playerY, entityY - halfHeight, entityY + halfHeight);

                return Phaser.Math.Distance.Between(playerX, playerY, closestX, closestY);
            } else {
                return Phaser.Math.Distance.Between(playerX, playerY, entityX, entityY);
            }
        };

        // Check all edible items
        const consumableTiers = this.player.getConsumableTiers();
        consumableTiers.forEach(tier => {
            if (!this.edibleItems || !this.edibleItems[tier] || !this.edibleItems[tier].scene) return;

            const items = this.edibleItems[tier].getChildren();
            for (let item of items) {
                if (!item.active || item.isBeingConsumed) continue;

                const itemRadius = item.radius || item.displayWidth / 2;
                const itemLogicalSize = (item.itemData && item.itemData.size) ? item.itemData.size : itemRadius;

                if (playerLogicalSize > itemLogicalSize) {
                    const distance = getDistanceToEntity(item, item.itemData);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestItem = item;
                    }
                }
            }
        });

        // Check hazards
        if (this.hazards && this.hazards.scene && typeof this.hazards.getChildren === 'function') {
            const hazardItems = this.hazards.getChildren();
            for (let hazard of hazardItems) {
                if (!hazard.active || hazard.isBeingConsumed || !hazard.hazardData) continue;

                const hazardRadius = hazard.radius || hazard.displayWidth / 2;
                const hazardLogicalSize = (hazard.hazardData && hazard.hazardData.size) ? hazard.hazardData.size : hazardRadius;

                if (playerLogicalSize > hazardLogicalSize) {
                    const distance = getDistanceToEntity(hazard, hazard.hazardData);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestItem = hazard;
                    }
                }
            }
        }

        if (closestItem) {
            // Reset position and rotation
            this.closestIndicator.setPosition(0, 0);
            this.closestIndicator.setRotation(0);

            // Draw bracket indicator
            const itemRadius = closestItem.radius || closestItem.displayWidth / 2;
            const bracketDist = itemRadius + 5; // Little padding
            const targetX = closestItem.x;
            const targetY = closestItem.y;
            const len = Math.max(5, bracketDist * 0.4);

            this.closestIndicator.lineStyle(3, 0x000000, 1);

            // Top Left
            this.closestIndicator.beginPath();
            this.closestIndicator.moveTo(targetX - bracketDist, targetY - bracketDist + len);
            this.closestIndicator.lineTo(targetX - bracketDist, targetY - bracketDist);
            this.closestIndicator.lineTo(targetX - bracketDist + len, targetY - bracketDist);
            this.closestIndicator.strokePath();

            // Top Right
            this.closestIndicator.beginPath();
            this.closestIndicator.moveTo(targetX + bracketDist - len, targetY - bracketDist);
            this.closestIndicator.lineTo(targetX + bracketDist, targetY - bracketDist);
            this.closestIndicator.lineTo(targetX + bracketDist, targetY - bracketDist + len);
            this.closestIndicator.strokePath();

            // Bottom Left
            this.closestIndicator.beginPath();
            this.closestIndicator.moveTo(targetX - bracketDist, targetY + bracketDist - len);
            this.closestIndicator.lineTo(targetX - bracketDist, targetY + bracketDist);
            this.closestIndicator.lineTo(targetX - bracketDist + len, targetY + bracketDist);
            this.closestIndicator.strokePath();

            // Bottom Right
            this.closestIndicator.beginPath();
            this.closestIndicator.moveTo(targetX + bracketDist - len, targetY + bracketDist);
            this.closestIndicator.lineTo(targetX + bracketDist, targetY + bracketDist);
            this.closestIndicator.lineTo(targetX + bracketDist, targetY + bracketDist - len);
            this.closestIndicator.strokePath();

            // Check if the item is within the camera view
            const camera = this.cameras.main;
            const isVisibleOnScreen = targetX >= camera.worldView.x &&
                                      targetX <= camera.worldView.right &&
                                      targetY >= camera.worldView.y &&
                                      targetY <= camera.worldView.bottom;

            if (isVisibleOnScreen) {
                // Draw pointing arrow orbiting the player
                const angle = Phaser.Math.Angle.Between(playerX, playerY, targetX, targetY);

                // Orbit distance: just outside the player's collision radius + some padding
                const orbitDistance = this.player.getCollisionRadius() + 15;

                const arrowX = playerX + Math.cos(angle) * orbitDistance;
                const arrowY = playerY + Math.sin(angle) * orbitDistance;

                this.closestIndicator.fillStyle(0xFFD700, 1); // Gold color arrow
                this.closestIndicator.lineStyle(2, 0x000000, 1); // Black outline

                const arrowSize = 10;
                const rotation = angle + Math.PI / 2;

                // Function to rotate a point around origin
                const rotatePoint = (x, y, rad) => {
                    return {
                        x: x * Math.cos(rad) - y * Math.sin(rad),
                        y: x * Math.sin(rad) + y * Math.cos(rad)
                    };
                };

                // Calculate absolute points for the triangle
                const pt1 = rotatePoint(0, -arrowSize, rotation);
                const pt2 = rotatePoint(-arrowSize * 0.7, arrowSize, rotation);
                const pt3 = rotatePoint(arrowSize * 0.7, arrowSize, rotation);

                // Draw a triangle
                this.closestIndicator.beginPath();
                this.closestIndicator.moveTo(arrowX + pt1.x, arrowY + pt1.y); // Tip
                this.closestIndicator.lineTo(arrowX + pt2.x, arrowY + pt2.y); // Bottom left
                this.closestIndicator.lineTo(arrowX + pt3.x, arrowY + pt3.y); // Bottom right
                this.closestIndicator.closePath();

                this.closestIndicator.fillPath();
                this.closestIndicator.strokePath();
            }
        }
    }

    checkConsumption() {
        const mouthPos = this.player.getMouthPosition();
        const consumableTiers = this.player.getConsumableTiers();

        const consumeBonus = (this.levelConfig.PLAYER && this.levelConfig.PLAYER.CONSUMPTION_RANGE_BONUS !== undefined) ? this.levelConfig.PLAYER.CONSUMPTION_RANGE_BONUS : 0;
        const playerConsumeRadius = this.player.getCollisionRadius() * 0.5 + consumeBonus;
        const playerMouthCircle = new Phaser.Geom.Circle(mouthPos.x, mouthPos.y, playerConsumeRadius);

        const playerTier = this.player.getCurrentTier();

        consumableTiers.forEach(tier => {
            if (!this.edibleItems[tier] || !this.edibleItems[tier].scene) return;

            const items = this.edibleItems[tier].getChildren();
            for (let item of items) {
                if (!item.active) continue;

                let isOverlapping = false;

                // Get current dynamic coordinates (already in player's tier space)
                let itemX = item.x;
                let itemY = item.y;
                let itemRadius = item.radius || item.displayWidth / 2;
                let itemHitbox = null;

                if (item.entityWrapper && item.entityWrapper.tierPositions && item.entityWrapper.tierPositions[playerTier]) {
                    itemRadius = item.entityWrapper.tierRadii[playerTier] * this.player.currentScale;
                    if (item.entityWrapper.tierHitboxes && item.entityWrapper.tierHitboxes[playerTier]) {
                        itemHitbox = {
                            width: item.entityWrapper.tierHitboxes[playerTier].width * this.player.currentScale,
                            height: item.entityWrapper.tierHitboxes[playerTier].height * this.player.currentScale
                        };
                    }
                } else if (item.itemData && item.itemData.hitbox) {
                    // Fallback using original sprite scale
                    itemHitbox = {
                        width: item.itemData.hitbox.width * item.scale,
                        height: item.itemData.hitbox.height * item.scale
                    };
                }

                if (item.itemData && itemHitbox) {
                    // Check intersection with rectangular hitbox
                    const rect = new Phaser.Geom.Rectangle(
                        itemX - (itemHitbox.width) / 2,
                        itemY - (itemHitbox.height) / 2,
                        itemHitbox.width,
                        itemHitbox.height
                    );
                    isOverlapping = Phaser.Geom.Intersects.CircleToRectangle(playerMouthCircle, rect);
                } else {
                    // Check intersection with circular hitbox
                    const distance = Phaser.Math.Distance.Between(mouthPos.x, mouthPos.y, itemX, itemY);
                    if (distance < playerConsumeRadius + itemRadius) {
                        isOverlapping = true;
                    }
                }

                // Check if mouth touches the item (collision check using visual radii)
                if (isOverlapping) {
                    // Check if player is larger than item (size-based consumption)
                    // Use unscaled sizes for mechanics
                    const itemLogicalSize = (item.itemData && item.itemData.size) ? item.itemData.size : itemRadius;
                    const playerLogicalSize = this.player.getLogicalSize ? this.player.getLogicalSize() : this.player.getSize();

                    if (playerLogicalSize > itemLogicalSize) {
                        if (!item.isBeingConsumed) {
                            this.startConsumptionAnimation(item, item.itemData);
                            break; // Only consume one item per frame
                        }
                    }
                }
            }
        });
    }

    checkHazardCollisions() {
        if (!this.hazards || !this.hazards.scene) return;

        // Create a copy to safely modify the group during iteration
        const hazards = [...this.hazards.getChildren()];

        const mouthPos = this.player.getMouthPosition();
        const consumeBonus = (this.levelConfig.PLAYER && this.levelConfig.PLAYER.CONSUMPTION_RANGE_BONUS !== undefined) ? this.levelConfig.PLAYER.CONSUMPTION_RANGE_BONUS : 0;
        const playerRadius = this.player.getCollisionRadius();

        // Damage uses player's main body
        const playerCircle = new Phaser.Geom.Circle(this.player.sprite.x, this.player.sprite.y, playerRadius);

        // Consumption uses player's mouth, just like EdibleItems
        const playerConsumeRadius = playerRadius * 0.5 + consumeBonus;
        const playerMouthCircle = new Phaser.Geom.Circle(mouthPos.x, mouthPos.y, playerConsumeRadius);

        const playerTier = this.player.getCurrentTier();

        for (let hazard of hazards) {
            if (!hazard.active || !hazard.hazardData) continue;

            // Use current sprite coordinates because hazards move!
            let hazardX = hazard.x;
            let hazardY = hazard.y;
            let hazardRadius = hazard.radius || hazard.displayWidth / 2;
            let hazardHitbox = null;

            if (hazard.entityWrapper && hazard.entityWrapper.tierPositions && hazard.entityWrapper.tierPositions[playerTier]) {
                hazardRadius = hazard.entityWrapper.tierRadii[playerTier] * this.player.currentScale;
                if (hazard.entityWrapper.tierHitboxes && hazard.entityWrapper.tierHitboxes[playerTier]) {
                    hazardHitbox = {
                        width: hazard.entityWrapper.tierHitboxes[playerTier].width * this.player.currentScale,
                        height: hazard.entityWrapper.tierHitboxes[playerTier].height * this.player.currentScale
                    };
                }
            } else if (hazard.hazardData && hazard.hazardData.hitbox) {
                // Fallback using original sprite scale
                hazardHitbox = {
                    width: hazard.hazardData.hitbox.width * hazard.scale,
                    height: hazard.hazardData.hitbox.height * hazard.scale
                };
            }

            const hazardLogicalSize = (hazard.hazardData && hazard.hazardData.size) ? hazard.hazardData.size : hazardRadius;
            const playerLogicalSize = this.player.getLogicalSize ? this.player.getLogicalSize() : this.player.getSize();

            let isOverlappingConsume = false;
            let isOverlappingDamage = false;

            if (hazard.hazardData && hazardHitbox) {
                // Check intersection with rectangular hitbox
                const rect = new Phaser.Geom.Rectangle(
                    hazardX - (hazardHitbox.width) / 2,
                    hazardY - (hazardHitbox.height) / 2,
                    hazardHitbox.width,
                    hazardHitbox.height
                );
                isOverlappingConsume = Phaser.Geom.Intersects.CircleToRectangle(playerMouthCircle, rect);
                isOverlappingDamage = Phaser.Geom.Intersects.CircleToRectangle(playerCircle, rect);
            } else {
                // Check intersection with circular hitbox
                const distToMouth = Phaser.Math.Distance.Between(mouthPos.x, mouthPos.y, hazardX, hazardY);
                if (distToMouth < playerConsumeRadius + hazardRadius) {
                    isOverlappingConsume = true;
                }

                const distToBody = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, hazardX, hazardY);
                if (distToBody < playerRadius + hazardRadius) {
                    isOverlappingDamage = true;
                }
            }

            // Check collision for consumption (includes bonus range)
            if (playerLogicalSize > hazardLogicalSize) {
                if (isOverlappingConsume) {
                    // Consume hazard
                    if (!hazard.isBeingConsumed) {
                        this.startConsumptionAnimation(hazard, hazard.hazardData);
                    }
                }
            } else {
                // Check collision for damage (no bonus range)
                if (isOverlappingDamage) {
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
                    const angle = Phaser.Math.Angle.Between(hazardX, hazardY, this.player.sprite.x, this.player.sprite.y);
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
        const despawnGroup = (this.edibleItems && despawnTier > 0) ? this.edibleItems[despawnTier] : null;
        if (despawnGroup && despawnGroup.scene) {
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
                // Pass false, false so we don't try to double-destroy already manually destroyed children
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

        // Player just exists in the current tier, so we manually adjust its position
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

        // Scale and reposition all existing entities visually using their precalculated tier dictionaries
        // Edibles
        for (let tier = 1; tier <= this.levelConfig.SIZE_TIERS.length; tier++) {
            if (!this.edibleItems[tier]) continue;
            const items = this.edibleItems[tier].getChildren();
            items.forEach(item => {
                if (item && item.entityWrapper && item.entityWrapper.tierPositions) {
                    // Update the visual property stored on the sprite
                    const tierPositions = item.entityWrapper.tierPositions;
                    const tierRadii = item.entityWrapper.tierRadii;
                    const tierHitboxes = item.entityWrapper.tierHitboxes;

                    if (tierPositions[newTier]) {
                        item.x = tierPositions[newTier].x;
                        item.y = tierPositions[newTier].y;

                        // Use scale ratio for logic size internally, but sprite needs the global scale
                        item.radius = tierRadii[newTier] * this.player.currentScale;

                        if (item.itemData && item.itemData.radius !== undefined) {
                            // Update internal physics logic radius based purely on logical radius?
                            // item.itemData.radius was used globally, but we shouldn't rely on it since it's the player's scale,
                            // actually `itemData.size` is what is used for logical consumption sizes.
                            item.itemData.radius = item.radius;
                        }

                        if (item.displayWidth !== undefined) {
                            if (item.texture && item.texture.key && item.texture.get() && item.texture.get().width > 0) {
                                const targetDiameter = item.radius * 2;
                                const texWidth = item.texture.get().width;
                                const spriteScale = targetDiameter / Math.max(1, texWidth);
                                item.setScale(spriteScale);
                            } else {
                                // Fallback if no texture size available or primitive
                                const currentScale = item.scale !== undefined ? item.scale : 1;
                                item.setScale(currentScale * scaleMultiplier);
                            }
                        }

                        if (item.body) {
                            // Rescale physics body
                            if (item.geom && item.geom.radius !== undefined && item.radius !== undefined) {
                                item.geom.radius = item.radius;
                            } else if (item.radius !== undefined && typeof item.setRadius === 'function') {
                                item.setRadius(item.radius);
                            }
                        }
                    }
                }
            });
        }

        // Hazards
        if (this.hazards && this.hazards.scene) {
            this.hazards.getChildren().forEach(hazard => {
                if (hazard && hazard.entityWrapper && hazard.entityWrapper.tierPositions) {
                    // Update the visual property stored on the sprite
                    const tierPositions = hazard.entityWrapper.tierPositions;
                    const tierRadii = hazard.entityWrapper.tierRadii;
                    const tierHitboxes = hazard.entityWrapper.tierHitboxes;

                    if (tierPositions[newTier]) {
                        hazard.x = tierPositions[newTier].x;
                        hazard.y = tierPositions[newTier].y;

                        hazard.radius = tierRadii[newTier] * this.player.currentScale;

                        if (hazard.hazardData && hazard.hazardData.radius !== undefined) {
                            hazard.hazardData.radius = hazard.radius;
                        }

                        if (hazard.displayWidth !== undefined) {
                            if (hazard.texture && hazard.texture.key && hazard.texture.get() && hazard.texture.get().width > 0) {
                                const targetDiameter = hazard.radius * 2;
                                // Need to account for spritesheets (use FRAME_WIDTH if available)
                                let texWidth = hazard.texture.get().width;
                                if (hazard.entityWrapper.hazardData && hazard.entityWrapper.hazardData.SPRITE && hazard.entityWrapper.hazardData.SPRITE.FRAME_WIDTH) {
                                    texWidth = hazard.entityWrapper.hazardData.SPRITE.FRAME_WIDTH;
                                }
                                const spriteScale = targetDiameter / Math.max(1, texWidth);
                                hazard.setScale(spriteScale);
                            } else {
                                const currentScale = hazard.scale !== undefined ? hazard.scale : 1;
                                hazard.setScale(currentScale * scaleMultiplier);
                            }
                        }

                        if (hazard.body) {
                            // Rescale physics body
                            if (hazard.geom && hazard.geom.radius !== undefined && hazard.radius !== undefined) {
                                hazard.geom.radius = hazard.radius;
                            } else if (hazard.radius !== undefined && typeof hazard.setRadius === 'function') {
                                hazard.setRadius(hazard.radius);
                            }
                        }
                    }
                }
            });
        }

        // Spawn items for tier N+1
        const spawnTier = newTier + 1;
        if (spawnTier <= this.levelConfig.SIZE_TIERS.length) {
            this.spawnTierEntities(spawnTier, true);
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

        // Cleanup overlapping lower-tier entities now that N+1 items have become visible (tier N)
        this.cleanupOverlappingEntities(newTier);

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


            hazard.setActive(isVisible);
            hazard.setVisible(isVisible);
        });
    }

    cleanupOverlappingEntities(tier) {
        // Find visible items in the specified tier
        const currentItems = [];
        const playerTier = this.player.getCurrentTier();

        if (this.edibleItems && this.edibleItems[tier]) {
            this.edibleItems[tier].getChildren().forEach(item => {
                if (item.visible) {
                    let x = item.x;
                    let y = item.y;
                    let r = item.radius || item.displayWidth / 2;

                    if (item.entityWrapper && item.entityWrapper.tierPositions && item.entityWrapper.tierPositions[playerTier]) {
                        x = item.entityWrapper.tierPositions[playerTier].x;
                        y = item.entityWrapper.tierPositions[playerTier].y;
                        r = item.entityWrapper.tierRadii[playerTier] * this.player.currentScale;
                    }

                    currentItems.push({
                        sprite: item,
                        x: x,
                        y: y,
                        radius: r,
                        isHazard: false
                    });
                }
            });
        }

        if (this.hazards && this.hazards.scene) {
            this.hazards.getChildren().forEach(hazard => {
                if (hazard.visible && hazard.hazardData && hazard.hazardData.tier === tier) {
                    let x = hazard.x;
                    let y = hazard.y;
                    let r = hazard.radius || hazard.displayWidth / 2;

                    if (hazard.entityWrapper && hazard.entityWrapper.tierPositions && hazard.entityWrapper.tierPositions[playerTier]) {
                        x = hazard.entityWrapper.tierPositions[playerTier].x;
                        y = hazard.entityWrapper.tierPositions[playerTier].y;
                        r = hazard.entityWrapper.tierRadii[playerTier] * this.player.currentScale;
                    }

                    currentItems.push({
                        sprite: hazard,
                        x: x,
                        y: y,
                        radius: r,
                        isHazard: true
                    });
                }
            });
        }

        // We will check against visible lower tier items
        const lowerTierItems = [];
        for (let t = 1; t < tier; t++) {
            if (this.edibleItems && this.edibleItems[t]) {
                this.edibleItems[t].getChildren().forEach(item => {
                    if (item.visible) {
                        let x = item.x;
                        let y = item.y;
                        let r = item.radius || item.displayWidth / 2;

                        if (item.entityWrapper && item.entityWrapper.tierPositions && item.entityWrapper.tierPositions[playerTier]) {
                            x = item.entityWrapper.tierPositions[playerTier].x;
                            y = item.entityWrapper.tierPositions[playerTier].y;
                            r = item.entityWrapper.tierRadii[playerTier] * this.player.currentScale;
                        }

                        lowerTierItems.push({
                            sprite: item,
                            x: x,
                            y: y,
                            radius: r
                        });
                    }
                });
            }
        }

        if (this.hazards && this.hazards.scene) {
            this.hazards.getChildren().forEach(hazard => {
                if (hazard.visible && hazard.hazardData && hazard.hazardData.tier < tier) {
                    let x = hazard.x;
                    let y = hazard.y;
                    let r = hazard.radius || hazard.displayWidth / 2;

                    if (hazard.entityWrapper && hazard.entityWrapper.tierPositions && hazard.entityWrapper.tierPositions[playerTier]) {
                        x = hazard.entityWrapper.tierPositions[playerTier].x;
                        y = hazard.entityWrapper.tierPositions[playerTier].y;
                        r = hazard.entityWrapper.tierRadii[playerTier] * this.player.currentScale;
                    }

                    lowerTierItems.push({
                        sprite: hazard,
                        x: x,
                        y: y,
                        radius: r
                    });
                }
            });
        }

        // Perform overlap checks
        for (const current of currentItems) {
            const currentRadius = current.radius;

            for (let j = lowerTierItems.length - 1; j >= 0; j--) {
                const lower = lowerTierItems[j];
                const lowerRadius = lower.radius;

                const dist = Phaser.Math.Distance.Between(current.x, current.y, lower.x, lower.y);

                // Add a buffer to the radius check to prevent visual overlapping (same as spawn logic)
                if (dist < (currentRadius + lowerRadius) * 1.1 + 5) {
                    if (lower.sprite && typeof lower.sprite.destroy === 'function') {
                        lower.sprite.destroy();
                    }
                    lowerTierItems.splice(j, 1);
                }
            }
        }
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
        if (this.isWinning || this.gameEnded) return;

        // Win when player reaches the configured winSize
        const winSize = this.levelConfig.winSize;
        if (this.player.getLogicalSize() >= winSize) {
            this.triggerWinSequence();
        }
    }

    triggerWinSequence() {
        this.isWinning = true;

        // Create the sparkle eruption effect at the player's current position
        if (this.player && this.player.sprite) {
            this.createSparkleEruption(this.player.sprite.x, this.player.sprite.y);
        }

        // Delay before fading to black
        this.time.delayedCall(1000, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            if (this.uiCamera) {
                this.uiCamera.fadeOut(500, 0, 0, 0);
            }
        });

        // Delay before finally ending the level so the player can see the animation
        this.time.delayedCall(1500, () => {
            this.endLevel();
        });
    }

    createSparkleEruption(x, y) {
        const numSparkles = 40;
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0xffffff];

        for (let i = 0; i < numSparkles; i++) {
            // Pick a random color (safely handling tests where Phaser.Utils might be mocked/missing)
            let color = colors[0];
            if (Phaser.Utils && Phaser.Utils.Array && Phaser.Utils.Array.GetRandom) {
                color = Phaser.Utils.Array.GetRandom(colors);
            } else {
                color = colors[Math.floor(Math.random() * colors.length)];
            }

            // Create a small star or circle shape
            const isStar = Math.random() > 0.5;
            const sparkle = this.add.graphics();
            sparkle.fillStyle(color, 1);

            if (isStar && Phaser.Curves && Phaser.Curves.Path) {
                // Draw a 5-pointed star
                const radius1 = 18;
                const radius2 = 9;
                let path = new Phaser.Curves.Path(0, -radius1);
                for (let j = 1; j <= 10; j++) {
                    const angle = (Math.PI / 5) * j - (Math.PI / 2);
                    const r = j % 2 === 0 ? radius1 : radius2;
                    path.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                path.closePath();
                sparkle.fillPoints(path.getPoints(), true);
            } else {
                // Draw a circle (fallback for tests where Phaser.Curves is missing)
                sparkle.fillCircle(0, 0, 5);
            }

            if (sparkle.setPosition) sparkle.setPosition(x, y);
            else {
                sparkle.x = x;
                sparkle.y = y;
            }
            if (sparkle.setDepth) sparkle.setDepth(100); // Make sure it renders above everything

            // Calculate random radial velocity
            const angle = Math.random() * Math.PI * 2;
            // Adjust the distance based on player's visual radius, ensuring it erupts out far enough
            const distance = (this.player.radius || 50) + Phaser.Math.Between(100, 300);

            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            // Randomize rotation for stars
            const rotationDist = isStar ? Phaser.Math.Between(-Math.PI * 4, Math.PI * 4) : 0;

            // Tween to move and fade out
            this.tweens.add({
                targets: sparkle,
                x: targetX,
                y: targetY,
                alpha: 0,
                rotation: rotationDist,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: Phaser.Math.Between(800, 1500),
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    sparkle.destroy();
                }
            });
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
        // We delay the scene transition slightly to allow the current update loop
        // to finish cleanly. Calling scene.start() synchronously mid-update can cause
        // "TypeError: Cannot read properties of undefined (reading 'entries')" inside
        // Phaser's internal list iterators if objects are destroyed while being processed.
        this.time.delayedCall(50, () => {
            this.scene.start('EndLevelScene', {
                score: this.score,
                time: elapsed,
                stars: stars,
                levelConfig: this.levelConfig
            });
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

    showCoverScreen() {
        // Pause physics and stop tracking time
        this.physics.pause();
        this.gamePaused = true;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Ensure UI container
        if (!this.coverContainer) {
            this.coverContainer = this.add.container(0, 0);
            this.coverContainer.setScrollFactor(0);
            this.coverContainer.setDepth(2000); // Higher than impossible warning (1000)
            if (this.cameras.main) {
                this.cameras.main.ignore(this.coverContainer);
            }
        }

        // Add image
        const coverImg = this.add.image(centerX, centerY, 'level_cover_image');

        // Calculate scale to fill screen (cover)
        const scaleX = width / coverImg.width;
        const scaleY = height / coverImg.height;
        const scale = Math.max(scaleX, scaleY);
        coverImg.setScale(scale);
        this.coverContainer.add(coverImg);

        // Add Continue Button Background
        const btnWidth = 150;
        const btnHeight = 50;
        const btnX = width - btnWidth / 2 - 20; // 20px padding from right
        const btnY = height - btnHeight / 2 - 20; // 20px padding from bottom

        const continueBtnBg = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x4CAF50);
        continueBtnBg.setInteractive({ useHandCursor: true });

        // Add Continue Button Text
        const continueBtnText = this.add.text(btnX, btnY, 'Continue', {
            fontSize: '24px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.coverContainer.add([continueBtnBg, continueBtnText]);

        // Hover effects
        continueBtnBg.on('pointerover', () => continueBtnBg.setFillStyle(0x66BB6A));
        continueBtnBg.on('pointerout', () => continueBtnBg.setFillStyle(0x4CAF50));

        // Click action
        continueBtnBg.on('pointerdown', () => {
            this.coverContainer.destroy();
            this.coverContainer = null;
            this.gamePaused = false;
            this.physics.resume();

            // Reset start time so timer starts correctly from 0
            this.startTime = Date.now();
        });
    }

    startConsumptionAnimation(sprite, itemData) {
        sprite.isBeingConsumed = true;

        // Disable physics/collision for the item
        if (sprite.body) {
            sprite.body.checkCollision = { none: true, up: false, down: false, left: false, right: false };
        }

        const mouthPos = this.player.getMouthPosition();

        // Target position is the mouth's position at the start of consumption
        const targetX = mouthPos.x;
        const targetY = mouthPos.y;

        // Create smoke effect immediately at the item's location
        this.createSmokeEffect(sprite.x, sprite.y);

        // Tween to pull and shrink the item
        this.tweens.add({
            targets: sprite,
            x: targetX,
            y: targetY,
            scaleX: 0,
            scaleY: 0,
            duration: 250,
            ease: 'Power2',
            onComplete: () => {
                if (!this.gameEnded && this.player && this.player.sprite) {
                    const points = this.player.consume(itemData);
                    this.score += points;
                    this.showConsumedItem(itemData); // Show HUD indicator
                }
                sprite.destroy();
            }
        });
    }

    createSmokeEffect(x, y) {
        const effectsConfig = this.levelConfig.EFFECTS || { SMOKE_DURATION_MIN: 400, SMOKE_DURATION_MAX: 800 };

        // Create a procedural smoke effect using a few fading and expanding cloud shapes
        const offsetX = Phaser.Math.Between(-3, 3);
        const offsetY = Phaser.Math.Between(-3, 3);

        const smoke = this.add.graphics();
        smoke.x = x + offsetX;
        smoke.y = y + offsetY;
        smoke.fillStyle(0x888888, 0.8);

        // Draw a basic cloud shape using overlapping circles
        // Center
        smoke.fillCircle(0, 0, 12);
        // Top left
        smoke.fillCircle(-8, -6, 8);
        // Top right
        smoke.fillCircle(8, -6, 8);
        // Bottom left
        smoke.fillCircle(-10, 4, 6);
        // Bottom right
        smoke.fillCircle(10, 4, 6);

        // Bring smoke to front so it's clearly visible
        smoke.setDepth(10);

        // Ensure the UI camera doesn't render the smoke effect
        if (this.uiCamera) {
            this.uiCamera.ignore(smoke);
        }

        this.tweens.add({
            targets: smoke,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: Phaser.Math.Between(effectsConfig.SMOKE_DURATION_MIN, effectsConfig.SMOKE_DURATION_MAX),
            ease: 'Power1',
            onComplete: () => {
                smoke.destroy();
            }
        });
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
