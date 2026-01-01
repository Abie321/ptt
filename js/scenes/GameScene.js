// Main Game Scene

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Initialize game state
        this.score = 0;
        this.startTime = Date.now();
        this.gameEnded = false;

        // Set world bounds
        this.physics.world.setBounds(0, 0, GameConfig.WORLD.WIDTH, GameConfig.WORLD.HEIGHT);

        // Create player
        this.player = new Player(this, GameConfig.WORLD.WIDTH / 2, GameConfig.WORLD.HEIGHT / 2);

        // Camera follows player
        this.cameras.main.setBounds(0, 0, GameConfig.WORLD.WIDTH, GameConfig.WORLD.HEIGHT);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);

        // Create item groups
        this.edibleItems = {};
        this.hazards = this.add.group();

        // Spawn initial items for all tiers
        for (let tier = 1; tier <= GameConfig.SIZE_TIERS.length; tier++) {
            this.edibleItems[tier] = this.add.group();
            this.spawnItemsForTier(tier);
        }

        // Spawn some hazards
        this.spawnHazards();

        // Listen for tier advancement
        this.events.on('tierAdvanced', this.onTierAdvanced, this);

        // Create HUD (fixed to camera)
        this.createHUD();

        // ESC key for pause
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause();
            // In a full implementation, show pause menu here
        });
    }

    spawnItemsForTier(tier) {
        const count = GameConfig.ITEMS_PER_TIER[tier] || 10;

        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(50, GameConfig.WORLD.WIDTH - 50);
            const y = Phaser.Math.Between(50, GameConfig.WORLD.HEIGHT - 50);
            const itemType = Phaser.Math.Between(0, 9); // 10 different item types per tier

            const item = new EdibleItem(this, x, y, tier, itemType);
            this.edibleItems[tier].add(item.sprite);
        }
    }

    spawnHazards() {
        // Spawn hazards for higher tiers
        for (let tier = 2; tier <= 5; tier++) {
            const count = 3 + tier;
            for (let i = 0; i < count; i++) {
                const x = Phaser.Math.Between(100, GameConfig.WORLD.WIDTH - 100);
                const y = Phaser.Math.Between(100, GameConfig.WORLD.HEIGHT - 100);

                const hazard = new Hazard(this, x, y, tier);
                this.hazards.add(hazard.sprite);
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
                    item.destroy();
                    break; // Only consume one item per frame
                }
            }
        });
    }

    checkHazardCollisions() {
        const playerTier = this.player.getCurrentTier();
        const hazards = this.hazards.getChildren();

        for (let hazard of hazards) {
            if (!hazard.active || !hazard.hazardData) continue;

            // Only hazards from higher tiers are dangerous
            if (hazard.hazardData.tier <= playerTier) continue;

            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                hazard.x, hazard.y
            );

            if (distance < this.player.getSize() + hazard.displayWidth / 2) {
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

    onTierAdvanced(newTier) {
        // Despawn items from tier N-2
        const despawnTier = newTier - 2;
        if (despawnTier > 0 && this.edibleItems[despawnTier]) {
            this.edibleItems[despawnTier].clear(true, true);
        }

        // Update camera zoom to accommodate larger player
        const zoomLevels = [1, 0.9, 0.8, 0.7, 0.6];
        this.cameras.main.setZoom(zoomLevels[newTier - 1] || 0.5);

        // Visual feedback
        this.cameras.main.flash(500, 255, 255, 255);
    }

    updateHUD() {
        // Size indicator
        const tierConfig = GameConfig.SIZE_TIERS[this.player.getCurrentTier() - 1];
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
        const maxTier = GameConfig.SIZE_TIERS.length;
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
        if (this.score >= GameConfig.STAR_THRESHOLDS.THREE_STAR) stars = 3;
        else if (this.score >= GameConfig.STAR_THRESHOLDS.TWO_STAR) stars = 2;
        else if (this.score >= GameConfig.STAR_THRESHOLDS.ONE_STAR) stars = 1;

        // Transition to end scene
        this.scene.start('EndLevelScene', {
            score: this.score,
            time: elapsed,
            stars: stars
        });
    }
}
