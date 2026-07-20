class LevelCreatorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCreatorScene' });
    }

    preload() {
        this.load.image('bg_level1', 'assets/images/Level1.png');
        this.load.image('bg_level2', 'assets/images/Level2.png');
        this.load.image('bg_level4', 'assets/images/Level4.png');
        this.load.image('bg_level5', 'assets/images/Level5.png');
        this.load.image('bg_level6', 'assets/images/Level6.png');
        this.load.image('ghost_start', 'assets/images/ghost.png');

        // Preload all entity item images from registry for Level Creator canvas
        if (typeof GLOBAL_ASSET_REGISTRY !== 'undefined') {
            Object.keys(GLOBAL_ASSET_REGISTRY).forEach(key => {
                if (key !== 'player_sheet') {
                    this.load.image(key, GLOBAL_ASSET_REGISTRY[key]);
                }
            });
        }
    }

    init(data) {
        // Restore layout from playtest if returning
        if (data && data.restoreLayout && data.levelConfig) {
            this.levelConfig = data.levelConfig;
            // Clean up playtest flag in the editing copy
            this.levelConfig.isPlaytest = false;
        } else {
            // Default initial configuration
            this.activeTab = this.activeTab || 'level';
            this.levelConfig = {
                id: 'custom_level_' + Date.now(),
                name: 'My Custom Level',
                worldIndex: 1,
                worldName: 'Ghost',
                winSize: 300,
                currentEditingTier: 1,
                SIZE_TIERS: [
                    { 
                        tier: 1, 
                        initialSize: 15, 
                        threshold: 50, 
                        name: 'Tiny', 
                        color: 0x2196F3, 
                        zoom: 1.5, 
                        LEVEL_AREA: { WIDTH: 1600, HEIGHT: 1200 }, 
                        ASSETS: { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.5 } 
                    }
                ],
                TIER_ENTITIES: {
                    1: []
                }
            };
        }

        // Active editing tier (default to 1)
        this.currentTier = this.levelConfig.currentEditingTier || 1;
        this.activeBrush = 'Coin'; // Default brush item
        this.snapToGrid = true;
        this.gridSize = 50;

        // Visual tracking arrays
        this.visualEntities = [];
    }

    create() {
        // Add navigation instructions
        this.navText = this.add.text(10, 10, 'Use Arrow Keys to scroll map\nLeft-click to place entity\nDrag to move | Right-click to delete', {
            fontSize: '16px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 5, y: 5 }
        }).setDepth(1000).setScrollFactor(0);

        // Background / World Setup
        this.setupWorld();

        // Keyboard panning controls (Arrow keys only to prevent typing conflicts with WASD)
        this.cursors = this.input.keyboard.createCursorKeys();

        // Pointer input for placement
        this.input.on('pointerdown', (pointer) => {
            // Ignore click if clicking HTML overlay UI
            if (pointer.event.target.tagName !== 'CANVAS') return;

            // Click world coordinates
            const worldX = pointer.worldX;
            const worldY = pointer.worldY;

            if (pointer.rightButtonDown()) {
                // Right click delete is handled on sprite pointerdown, but fallback check here
                this.deleteAt(worldX, worldY);
            } else {
                // Left click place
                this.placeEntity(worldX, worldY);
            }
        });

        // Setup Drag & Drop
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.snapToGrid) {
                gameObject.x = Math.round(dragX / this.gridSize) * this.gridSize;
                gameObject.y = Math.round(dragY / this.gridSize) * this.gridSize;
            } else {
                gameObject.x = dragX;
                gameObject.y = dragY;
            }
            if (gameObject.labelText) {
                gameObject.labelText.x = gameObject.x;
                gameObject.labelText.y = gameObject.y - gameObject.radius - 12;
            }
        });

        this.input.on('dragend', (pointer, gameObject) => {
            // Save new position back to configuration
            if (gameObject.entityIndex !== undefined && this.levelConfig.TIER_ENTITIES[this.currentTier]) {
                const item = this.levelConfig.TIER_ENTITIES[this.currentTier][gameObject.entityIndex];
                if (item) {
                    // Update fixed coordinates
                    if (!item.positions) {
                        item.positions = [];
                    }
                    // For single placements, update the coordinates
                    item.x = gameObject.x;
                    item.y = gameObject.y;
                    
                    // If it was a multi-position array, we update the first one or create/save custom positions
                    if (item.positions.length > 0) {
                        item.positions[0].x = gameObject.x;
                        item.positions[0].y = gameObject.y;
                    }
                }
            }
        });

        // Disable standard browser right-click menu on the game canvas
        this.input.mouse.disableContextMenu();

        // Create HTML Overlay GUI
        this.createUIOverlay();

        // Draw existing entities
        this.redrawEntities();
    }

    update() {
        // Map scrolling speed
        const scrollSpeed = 15;
        const cam = this.cameras.main;

        if (this.cursors.left.isDown) {
            cam.scrollX = Math.max(cam.scrollX - scrollSpeed, 0);
        } else if (this.cursors.right.isDown) {
            cam.scrollX = Math.min(cam.scrollX + scrollSpeed, cam.worldView.width);
        }

        if (this.cursors.up.isDown) {
            cam.scrollY = Math.max(cam.scrollY - scrollSpeed, 0);
        } else if (this.cursors.down.isDown) {
            cam.scrollY = Math.min(cam.scrollY + scrollSpeed, cam.worldView.height);
        }
    }

    setupWorld() {
        const tierConfig = this.levelConfig.SIZE_TIERS[this.currentTier - 1] || this.levelConfig.SIZE_TIERS[0];
        const width = tierConfig.LEVEL_AREA.WIDTH;
        const height = tierConfig.LEVEL_AREA.HEIGHT;

        // Set camera and physics bounds
        this.cameras.main.setBounds(0, 0, width, height);

        // Render Background Image
        if (this.bgImage) this.bgImage.destroy();
        this.bgImage = null;

        const bgAsset = tierConfig.ASSETS && tierConfig.ASSETS.BACKGROUND_IMAGE;
        if (bgAsset) {
            let key = '';
            if (bgAsset.includes('Level1.png')) key = 'bg_level1';
            else if (bgAsset.includes('Level2.png')) key = 'bg_level2';
            else if (bgAsset.includes('Level4.png')) key = 'bg_level4';
            else if (bgAsset.includes('Level5.png')) key = 'bg_level5';
            else if (bgAsset.includes('Level6.png')) key = 'bg_level6';

            if (key) {
                const bgScale = tierConfig.ASSETS.BACKGROUND_SCALE || 1.0;
                this.bgImage = this.add.image(0, 0, key).setOrigin(0, 0);
                this.bgImage.setScale(bgScale);
                this.bgImage.setDepth(-1); // Render behind grid and entities
            }
        }

        // Draw subtle background grid
        if (this.gridGraphics) this.gridGraphics.destroy();
        this.gridGraphics = this.add.graphics();
        this.gridGraphics.lineStyle(1, 0x555555, 0.4);
        this.gridGraphics.setDepth(0);

        for (let x = 0; x < width; x += this.gridSize) {
            this.gridGraphics.moveTo(x, 0);
            this.gridGraphics.lineTo(x, height);
        }
        for (let y = 0; y < height; y += this.gridSize) {
            this.gridGraphics.moveTo(0, y);
            this.gridGraphics.lineTo(width, y);
        }
        this.gridGraphics.strokePath();
        if (this.gridGraphics.setVisible) {
            this.gridGraphics.setVisible(this.snapToGrid !== false);
        }
    }

    toggleGrid(show) {
        this.snapToGrid = show;
        if (this.gridGraphics && this.gridGraphics.setVisible) {
            this.gridGraphics.setVisible(show);
        }
    }

    placeEntity(worldX, worldY) {
        let x = worldX;
        let y = worldY;

        if (this.snapToGrid && this.placementMode !== 'random') {
            x = Math.round(x / this.gridSize) * this.gridSize;
            y = Math.round(y / this.gridSize) * this.gridSize;
        }

        // Handle Start Point placement
        if (this.activeBrush === 'Start Point') {
            if (!this.levelConfig.PLAYER) this.levelConfig.PLAYER = {};
            this.levelConfig.PLAYER.START_X = x;
            this.levelConfig.PLAYER.START_Y = y;
            this.redrawEntities();
            return;
        }

        if (!this.levelConfig.TIER_ENTITIES[this.currentTier]) {
            this.levelConfig.TIER_ENTITIES[this.currentTier] = [];
        }

        const tierConfig = (this.levelConfig.SIZE_TIERS && this.levelConfig.SIZE_TIERS[this.currentTier - 1]) || (this.levelConfig.SIZE_TIERS && this.levelConfig.SIZE_TIERS[0]);
        const width = (tierConfig && tierConfig.LEVEL_AREA) ? tierConfig.LEVEL_AREA.WIDTH : 1600;
        const height = (tierConfig && tierConfig.LEVEL_AREA) ? tierConfig.LEVEL_AREA.HEIGHT : 1200;

        if (this.placementMode === 'random') {
            const count = this.fillCount || 10;
            const radius = this.fillRadius || 100;
            const positions = [];

            for (let i = 0; i < count; i++) {
                const r = Math.random() * radius;
                const angle = Math.random() * Math.PI * 2;
                let px = Math.round(x + Math.cos(angle) * r);
                let py = Math.round(y + Math.sin(angle) * r);

                if (this.snapToGrid) {
                    px = Math.round(px / this.gridSize) * this.gridSize;
                    py = Math.round(py / this.gridSize) * this.gridSize;
                }

                px = Math.max(30, Math.min(width - 30, px));
                py = Math.max(30, Math.min(height - 30, py));

                positions.push({ x: px, y: py, rotation: 0 });
            }

            const newEntityBatch = {
                type: this.activeBrush,
                count: count,
                positions: positions
            };

            this.levelConfig.TIER_ENTITIES[this.currentTier].push(newEntityBatch);
        } else {
            const newEntity = {
                type: this.activeBrush,
                count: 1,
                positions: [{ x: x, y: y, rotation: 0 }]
            };
            this.levelConfig.TIER_ENTITIES[this.currentTier].push(newEntity);
        }

        this.redrawEntities();
    }

    deleteAt(worldX, worldY) {
        const entities = (this.levelConfig.TIER_ENTITIES && this.levelConfig.TIER_ENTITIES[this.currentTier]) ? this.levelConfig.TIER_ENTITIES[this.currentTier] : [];
        let closestItemIdx = -1;
        let closestPosIdx = -1;
        let closestDist = 50; // Max click radius to delete

        entities.forEach((item, itemIdx) => {
            if (Array.isArray(item.positions) && item.positions.length > 0) {
                item.positions.forEach((pos, posIdx) => {
                    if (pos.x !== undefined && pos.y !== undefined) {
                        const dist = Phaser.Math.Distance.Between(worldX, worldY, pos.x, pos.y);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestItemIdx = itemIdx;
                            closestPosIdx = posIdx;
                        }
                    }
                });
            } else if (item.x !== undefined && item.y !== undefined) {
                const dist = Phaser.Math.Distance.Between(worldX, worldY, item.x, item.y);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestItemIdx = itemIdx;
                    closestPosIdx = -1;
                }
            }
        });

        if (closestItemIdx !== -1) {
            const item = entities[closestItemIdx];
            if (closestPosIdx !== -1 && Array.isArray(item.positions)) {
                item.positions.splice(closestPosIdx, 1);
                item.count = item.positions.length;
                if (item.positions.length === 0) {
                    entities.splice(closestItemIdx, 1);
                }
            } else {
                entities.splice(closestItemIdx, 1);
            }
            this.redrawEntities();
        }
    }

    redrawEntities() {
        // Clear previous visual sprites
        this.visualEntities.forEach(obj => {
            if (obj.labelText) obj.labelText.destroy();
            obj.destroy();
        });
        this.visualEntities = [];

        // Draw Player Start Point marker
        let startMarker;
        const startX = (this.levelConfig.PLAYER && this.levelConfig.PLAYER.START_X !== undefined) ? this.levelConfig.PLAYER.START_X : 800;
        const startY = (this.levelConfig.PLAYER && this.levelConfig.PLAYER.START_Y !== undefined) ? this.levelConfig.PLAYER.START_Y : 600;

        if (this.textures && (this.textures.exists('ghost_start') || this.textures.exists('player_sheet'))) {
            const key = this.textures.exists('ghost_start') ? 'ghost_start' : 'player_sheet';
            startMarker = this.add.image(startX, startY, key);
            const targetDim = 48;
            const scale = targetDim / Math.max(1, startMarker.width || targetDim);
            startMarker.setScale(scale);
        } else {
            startMarker = this.add.circle(startX, startY, 24, 0x39ff14);
            if (startMarker.setStrokeStyle) startMarker.setStrokeStyle(3, 0x022100);
        }
        startMarker.setAlpha(0.95);
        startMarker.setInteractive({ draggable: true, useHandCursor: true });
        this.input.setDraggable(startMarker);

        startMarker.on('drag', (pointer, dragX, dragY) => {
            const newX = this.snapToGrid ? Math.round(dragX / this.gridSize) * this.gridSize : dragX;
            const newY = this.snapToGrid ? Math.round(dragY / this.gridSize) * this.gridSize : dragY;
            startMarker.x = newX;
            startMarker.y = newY;
            if (startMarker.labelText) {
                startMarker.labelText.x = newX;
                startMarker.labelText.y = newY - 36;
            }
            if (!this.levelConfig.PLAYER) this.levelConfig.PLAYER = {};
            this.levelConfig.PLAYER.START_X = newX;
            this.levelConfig.PLAYER.START_Y = newY;
        });

        const startLabel = this.add.text(startX, startY - 36, '👻 Start Point', {
            fontSize: '12px',
            fontFamily: 'Fredoka',
            fill: '#39ff14',
            backgroundColor: 'rgba(18,2,36,0.85)',
            padding: { x: 5, y: 2 }
        }).setOrigin(0.5);
        startMarker.labelText = startLabel;
        this.visualEntities.push(startMarker);

        const tierConfig = (this.levelConfig.SIZE_TIERS && this.levelConfig.SIZE_TIERS[this.currentTier - 1]) || (this.levelConfig.SIZE_TIERS && this.levelConfig.SIZE_TIERS[0]);
        const levelWidth = (tierConfig && tierConfig.LEVEL_AREA) ? tierConfig.LEVEL_AREA.WIDTH : 1600;
        const levelHeight = (tierConfig && tierConfig.LEVEL_AREA) ? tierConfig.LEVEL_AREA.HEIGHT : 1200;

        const entities = (this.levelConfig.TIER_ENTITIES && this.levelConfig.TIER_ENTITIES[this.currentTier]) ? this.levelConfig.TIER_ENTITIES[this.currentTier] : [];
        
        entities.forEach((item, itemIndex) => {
            const template = ENTITY_TEMPLATES[item.type] || {};
            const size = template.size || item.size || 20;
            const sizeVal = Array.isArray(size) ? size[1] : size;
            const color = template.color || item.color || 0x00FF00;
            const isHazard = template.isHazard || item.isHazard || false;
            const imageKey = template.image || item.image || (template.SPRITE && template.SPRITE.KEY);

            // Collect all positions for this item
            const positionsList = [];
            if (Array.isArray(item.positions) && item.positions.length > 0) {
                item.positions.forEach((p, pIdx) => {
                    if (p && p.x !== undefined && p.y !== undefined) {
                        positionsList.push({ x: p.x, y: p.y, posRef: p, posIdx: pIdx });
                    }
                });
            } else if (item.x !== undefined && item.y !== undefined) {
                positionsList.push({ x: item.x, y: item.y, posRef: item, posIdx: 0 });
            } else if (item.count && item.count > 0) {
                if (!item.positions) item.positions = [];
                const needed = item.count;
                if (item.positions.length < needed) {
                    const cols = Math.ceil(Math.sqrt(needed));
                    const marginX = levelWidth / (cols + 1);
                    const marginY = levelHeight / (cols + 1);
                    for (let c = item.positions.length; c < needed; c++) {
                        const col = c % cols;
                        const row = Math.floor(c / cols);
                        const px = Math.round(marginX * (col + 1));
                        const py = Math.round(marginY * (row + 1));
                        item.positions.push({ x: px, y: py, rotation: 0 });
                    }
                }
                item.positions.forEach((p, pIdx) => {
                    positionsList.push({ x: p.x, y: p.y, posRef: p, posIdx: pIdx });
                });
            }

            positionsList.forEach(({ x, y, posRef }) => {
                let marker;
                if (imageKey && this.textures && this.textures.exists(imageKey)) {
                    marker = this.add.image(x, y, imageKey);
                    const targetDim = Math.max(24, sizeVal * 2);
                    const scale = targetDim / Math.max(1, marker.width || targetDim);
                    marker.setScale(scale);
                } else if (template.shape === 'square') {
                    marker = this.add.rectangle(x, y, sizeVal * 1.5, sizeVal * 1.5, color);
                    if (marker.setStrokeStyle) marker.setStrokeStyle(2, isHazard ? 0xFF0000 : 0xFFFFFF);
                } else {
                    marker = this.add.circle(x, y, sizeVal, color);
                    if (marker.setStrokeStyle) marker.setStrokeStyle(2, isHazard ? 0xFF0000 : 0xFFFFFF);
                }
                marker.setAlpha(0.85);

                marker.entityIndex = itemIndex;
                marker.radius = sizeVal;

                // Enable drag on marker
                marker.setInteractive({ draggable: true, useHandCursor: true });
                this.input.setDraggable(marker);

                marker.on('drag', (pointer, dragX, dragY) => {
                    const newX = this.snapToGrid ? Math.round(dragX / this.gridSize) * this.gridSize : dragX;
                    const newY = this.snapToGrid ? Math.round(dragY / this.gridSize) * this.gridSize : dragY;
                    marker.x = newX;
                    marker.y = newY;
                    posRef.x = newX;
                    posRef.y = newY;
                    if (marker.labelText) {
                        marker.labelText.x = newX;
                        marker.labelText.y = newY - sizeVal - 12;
                    }
                });

                // Right click delete support
                marker.on('pointerdown', (pointer) => {
                    if (pointer.rightButtonDown()) {
                        if (Array.isArray(item.positions)) {
                            const pIdx = item.positions.indexOf(posRef);
                            if (pIdx !== -1) {
                                item.positions.splice(pIdx, 1);
                                item.count = item.positions.length;
                            }
                            if (item.positions.length === 0) {
                                entities.splice(itemIndex, 1);
                            }
                        } else {
                            entities.splice(itemIndex, 1);
                        }
                        this.redrawEntities();
                    }
                });

                const labelText = this.add.text(x, y - sizeVal - 12, item.type, {
                    fontSize: '11px',
                    fill: '#fff',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    padding: { x: 3, y: 1 }
                }).setOrigin(0.5);

                marker.labelText = labelText;
                this.visualEntities.push(marker);
            });
        });
    }

    createUIOverlay() {
        // Destroy existing DOM root if any
        const oldRoot = document.getElementById('level-creator-root');
        if (oldRoot) oldRoot.remove();
        const oldSidebar = document.getElementById('editor-sidebar');
        if (oldSidebar) oldSidebar.remove();

        // Create Full-Screen HTML Overlay container matching Stitch Prototype (screen 3c78536529db45138cd231bc687909d6)
        const root = document.createElement('div');
        root.id = 'level-creator-root';
        root.style.position = 'fixed';
        root.style.inset = '0';
        root.style.pointerEvents = 'none';
        root.style.zIndex = '9999';
        root.style.display = 'flex';
        root.style.flexDirection = 'column';
        root.style.fontFamily = "'Fredoka', 'Quicksand', sans-serif";

        // ==========================================
        // 1. TOP APP BAR (HEADER)
        // ==========================================
        const header = document.createElement('header');
        header.style.height = '64px';
        header.style.background = '#2e0854'; // surface-container
        header.style.borderBottom = '4px solid #180034';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.padding = '0 24px';
        header.style.pointerEvents = 'auto';
        header.style.boxShadow = '0 8px 16px rgba(0,0,0,0.4)';

        // Left Header: Back Button + Title
        const headerLeft = document.createElement('div');
        headerLeft.style.display = 'flex';
        headerLeft.style.alignItems = 'center';
        headerLeft.style.gap = '12px';

        const btnBack = document.createElement('button');
        btnBack.id = 'btn-back-header';
        btnBack.innerText = '⬅';
        btnBack.title = 'Back to Level Select';
        btnBack.style.background = '#45236b';
        btnBack.style.color = '#baccb0';
        btnBack.style.border = '2px solid #180034';
        btnBack.style.borderRadius = '9999px';
        btnBack.style.width = '40px';
        btnBack.style.height = '40px';
        btnBack.style.cursor = 'pointer';
        btnBack.style.fontSize = '18px';
        btnBack.addEventListener('click', () => {
            root.remove();
            this.scene.start('LevelSelectScene');
        });
        headerLeft.appendChild(btnBack);

        const title = document.createElement('h1');
        title.textContent = (this.activeTab === 'world') ? 'World & Level Manager' : 'Level Creator';
        title.style.fontFamily = "'Fredoka', sans-serif";
        title.style.fontSize = '26px';
        title.style.color = '#79ff5b'; // primary-fixed
        title.style.margin = '0';
        title.style.textShadow = '0 4px 0 #022100';
        headerLeft.appendChild(title);

        header.appendChild(headerLeft);

        // Right Header: World Editing, Entities Editing, Save & Test Play Actions
        const headerRight = document.createElement('div');
        headerRight.style.display = 'flex';
        headerRight.style.alignItems = 'center';
        headerRight.style.gap = '12px';

        const btnLevelHeader = document.createElement('button');
        btnLevelHeader.id = 'btn-level-header';
        btnLevelHeader.innerText = '✏️ Level Editor';
        const isLevelActive = (this.activeTab === 'level');
        btnLevelHeader.style.background = isLevelActive ? '#39ff14' : '#45236b';
        btnLevelHeader.style.color = isLevelActive ? '#053900' : '#efdbff';
        btnLevelHeader.style.border = isLevelActive ? '2px solid #095300' : '2px solid #2a0350';
        btnLevelHeader.style.borderRadius = '12px';
        btnLevelHeader.style.padding = '8px 16px';
        btnLevelHeader.style.fontFamily = "'Fredoka', sans-serif";
        btnLevelHeader.style.fontWeight = 'bold';
        btnLevelHeader.style.fontSize = '14px';
        btnLevelHeader.style.cursor = 'pointer';
        btnLevelHeader.addEventListener('click', () => {
            this.activeTab = 'level';
            this.createUIOverlay();
        });
        headerRight.appendChild(btnLevelHeader);

        const btnWorldHeader = document.createElement('button');
        btnWorldHeader.id = 'btn-world-header';
        btnWorldHeader.innerText = '🌐 World';
        const isWorldActive = (this.activeTab === 'world');
        btnWorldHeader.style.background = isWorldActive ? '#00daf3' : '#45236b';
        btnWorldHeader.style.color = isWorldActive ? '#001f24' : '#efdbff';
        btnWorldHeader.style.border = isWorldActive ? '2px solid #00daf3' : '2px solid #2a0350';
        btnWorldHeader.style.borderRadius = '12px';
        btnWorldHeader.style.padding = '8px 16px';
        btnWorldHeader.style.fontFamily = "'Fredoka', sans-serif";
        btnWorldHeader.style.fontWeight = 'bold';
        btnWorldHeader.style.fontSize = '14px';
        btnWorldHeader.style.cursor = 'pointer';
        btnWorldHeader.addEventListener('click', () => {
            this.activeTab = 'world';
            this.createUIOverlay();
        });
        headerRight.appendChild(btnWorldHeader);

        const btnEntitiesHeader = document.createElement('button');
        btnEntitiesHeader.id = 'btn-entities-header';
        btnEntitiesHeader.innerText = '👾 Entities';
        const isEntitiesActive = (this.activeTab === 'entities');
        btnEntitiesHeader.style.background = isEntitiesActive ? '#ffb68b' : '#45236b';
        btnEntitiesHeader.style.color = isEntitiesActive ? '#522300' : '#efdbff';
        btnEntitiesHeader.style.border = isEntitiesActive ? '2px solid #ffb68b' : '2px solid #2a0350';
        btnEntitiesHeader.style.borderRadius = '12px';
        btnEntitiesHeader.style.padding = '8px 16px';
        btnEntitiesHeader.style.fontFamily = "'Fredoka', sans-serif";
        btnEntitiesHeader.style.fontWeight = 'bold';
        btnEntitiesHeader.style.fontSize = '14px';
        btnEntitiesHeader.style.cursor = 'pointer';
        btnEntitiesHeader.addEventListener('click', () => {
            this.activeTab = 'entities';
            this.createUIOverlay();
        });
        headerRight.appendChild(btnEntitiesHeader);

        const btnSaveHeader = document.createElement('button');
        btnSaveHeader.id = 'btn-save-header';
        btnSaveHeader.innerText = '💾 Save';
        btnSaveHeader.style.background = '#ff7f1c'; // secondary-container orange
        btnSaveHeader.style.color = '#602a00';
        btnSaveHeader.style.border = '2px solid #522300';
        btnSaveHeader.style.borderRadius = '12px';
        btnSaveHeader.style.padding = '8px 18px';
        btnSaveHeader.style.fontFamily = "'Fredoka', sans-serif";
        btnSaveHeader.style.fontWeight = 'bold';
        btnSaveHeader.style.fontSize = '14px';
        btnSaveHeader.style.cursor = 'pointer';
        btnSaveHeader.addEventListener('click', () => this.saveToStorage());
        headerRight.appendChild(btnSaveHeader);

        const btnPlayHeader = document.createElement('button');
        btnPlayHeader.id = 'btn-play-header';
        btnPlayHeader.innerText = '▶ Test Play';
        btnPlayHeader.style.background = '#39ff14'; // primary-container neon lime
        btnPlayHeader.style.color = '#053900';
        btnPlayHeader.style.border = '2px solid #095300';
        btnPlayHeader.style.borderRadius = '12px';
        btnPlayHeader.style.padding = '8px 18px';
        btnPlayHeader.style.fontFamily = "'Fredoka', sans-serif";
        btnPlayHeader.style.fontWeight = 'bold';
        btnPlayHeader.style.fontSize = '14px';
        btnPlayHeader.style.cursor = 'pointer';
        btnPlayHeader.addEventListener('click', () => this.playtest());
        headerRight.appendChild(btnPlayHeader);

        header.appendChild(headerRight);
        root.appendChild(header);

        // ==========================================
        // 2. MAIN WORKSPACE CONTAINER
        // ==========================================
        const workspace = document.createElement('div');
        workspace.style.flex = '1';
        workspace.style.display = 'flex';
        workspace.style.position = 'relative';
        workspace.style.overflow = 'hidden';

        if (this.activeTab === 'world') {
            workspace.style.padding = '24px';
            workspace.style.gap = '24px';
            workspace.style.background = '#1f0040';
            workspace.style.pointerEvents = 'auto';

            // Left Section: Worlds List (matching Stitch screen 2777d8b32e664bf1910e95aa66f36abf)
            const worldsSection = document.createElement('section');
            worldsSection.style.width = '35%';
            worldsSection.style.background = '#2e0854';
            worldsSection.style.borderRadius = '24px';
            worldsSection.style.border = '4px solid #180034';
            worldsSection.style.display = 'flex';
            worldsSection.style.flexDirection = 'column';
            worldsSection.style.overflow = 'hidden';

            const worldsHeader = document.createElement('div');
            worldsHeader.style.background = '#39175f';
            worldsHeader.style.padding = '16px';
            worldsHeader.style.borderBottom = '4px solid #180034';
            worldsHeader.innerHTML = `<h2 style="margin:0; font-size:22px; color:#ffb68b; font-family:'Fredoka', sans-serif;">Worlds</h2>`;
            worldsSection.appendChild(worldsHeader);

            const worldsListContainer = document.createElement('div');
            worldsListContainer.style.flex = '1';
            worldsListContainer.style.overflowY = 'auto';
            worldsListContainer.style.padding = '14px';
            worldsListContainer.style.display = 'flex';
            worldsListContainer.style.flexDirection = 'column';
            worldsListContainer.style.gap = '10px';

            const worldsList = (typeof GameConfig !== 'undefined' && GameConfig.WORLDS) ? GameConfig.WORLDS : [
                { name: "Ghost", subtitle: "Death isn't the end of you, but it is the end for London." },
                { name: "Stingray", subtitle: "The Atlantic isn't safe from poachers..." },
                { name: "Snake", subtitle: "Eat your way through an indian zoo." },
                { name: "Pigeon", subtitle: "Consume NYC and gain the ability to fly." },
                { name: "Jaguar", subtitle: "A consumption journey of the Amazon." },
                { name: "Seagull", subtitle: "The ultimate feasting on Shanghai!" },
                { name: "Goo", subtitle: "Start in a petri dish and eat your way to the end of the universe!" }
            ];

            const currentWorldIdx = this.levelConfig.worldIndex || 1;

            worldsList.forEach((worldObj, idx) => {
                const worldNum = idx + 1;
                const isSelected = (currentWorldIdx === worldNum);

                const card = document.createElement('div');
                card.style.background = isSelected ? '#39ff14' : '#45236b';
                card.style.color = isSelected ? '#053900' : '#efdbff';
                card.style.borderRadius = '16px';
                card.style.padding = '14px';
                card.style.border = isSelected ? '4px solid #180034' : '2px solid #180034';
                card.style.cursor = 'pointer';
                card.style.display = 'flex';
                card.style.justifyContent = 'space-between';
                card.style.alignItems = 'center';
                card.style.gap = '10px';

                card.innerHTML = `
                    <div style="flex:1;">
                        <div style="font-size:16px; font-weight:bold; font-family:'Fredoka', sans-serif;">World ${worldNum}: ${worldObj.name}</div>
                        <div style="font-size:12px; opacity:0.9; font-family:'Quicksand', sans-serif;">${worldObj.subtitle}</div>
                    </div>
                    <button class="btn-edit-world" style="background:#ff7f1c; color:#120224; border:none; border-radius:8px; padding:6px 12px; font-family:'Fredoka', sans-serif; font-weight:bold; font-size:13px; cursor:pointer;">✏️ Edit</button>
                `;

                const btnEditWorld = card.querySelector('.btn-edit-world');
                btnEditWorld.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.openEditWorldModal(worldObj);
                });

                card.addEventListener('click', () => {
                    this.levelConfig.worldIndex = worldNum;
                    this.levelConfig.worldName = worldObj.name;
                    this.createUIOverlay();
                });

                worldsListContainer.appendChild(card);
            });
            worldsSection.appendChild(worldsListContainer);

            // New World, Export JSON & Import JSON Footer
            const newWorldFooter = document.createElement('div');
            newWorldFooter.style.padding = '14px';
            newWorldFooter.style.background = '#39175f';
            newWorldFooter.style.borderTop = '4px solid #180034';
            newWorldFooter.style.display = 'flex';
            newWorldFooter.style.flexDirection = 'column';
            newWorldFooter.style.gap = '8px';

            const btnNewWorld = document.createElement('button');
            btnNewWorld.id = 'btn-new-world';
            btnNewWorld.innerText = '➕ New World';
            btnNewWorld.style.width = '100%';
            btnNewWorld.style.background = '#ffdbc8';
            btnNewWorld.style.color = '#321200';
            btnNewWorld.style.border = '2px solid #753400';
            btnNewWorld.style.borderRadius = '14px';
            btnNewWorld.style.padding = '10px';
            btnNewWorld.style.fontFamily = "'Fredoka', sans-serif";
            btnNewWorld.style.fontSize = '15px';
            btnNewWorld.style.fontWeight = 'bold';
            btnNewWorld.style.cursor = 'pointer';
            btnNewWorld.addEventListener('click', () => {
                const worldName = prompt('Enter new World Name:', 'New World');
                if (worldName) {
                    const subtitle = prompt('Enter World Subtitle:', 'A new world of consumption.');
                    const newId = (GameConfig.WORLDS && GameConfig.WORLDS.length > 0) ? Math.max(...GameConfig.WORLDS.map(w => w.id || 0)) + 1 : 1;
                    if (!GameConfig.WORLDS) GameConfig.WORLDS = [];
                    GameConfig.WORLDS.push({ id: newId, name: worldName, subtitle: subtitle || '' });
                    try {
                        localStorage.setItem('ptt_custom_worlds', JSON.stringify(GameConfig.WORLDS));
                    } catch (e) {}
                    this.createUIOverlay();
                }
            });
            newWorldFooter.appendChild(btnNewWorld);

            const btnExportWorlds = document.createElement('button');
            btnExportWorlds.id = 'btn-export-worlds';
            btnExportWorlds.innerText = '📥 Export worlds.json';
            btnExportWorlds.style.width = '100%';
            btnExportWorlds.style.background = '#00daf3';
            btnExportWorlds.style.color = '#001f24';
            btnExportWorlds.style.border = 'none';
            btnExportWorlds.style.borderRadius = '10px';
            btnExportWorlds.style.padding = '8px';
            btnExportWorlds.style.fontFamily = "'Fredoka', sans-serif";
            btnExportWorlds.style.fontWeight = 'bold';
            btnExportWorlds.style.fontSize = '12px';
            btnExportWorlds.style.cursor = 'pointer';
            btnExportWorlds.addEventListener('click', () => {
                const jsonStr = JSON.stringify(GameConfig.WORLDS || [], null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'worlds.json';
                a.click();
                URL.revokeObjectURL(url);
            });
            newWorldFooter.appendChild(btnExportWorlds);
            worldsSection.appendChild(newWorldFooter);

            workspace.appendChild(worldsSection);

            // Right Section: Levels in World (matching Stitch screen 2777d8b32e664bf1910e95aa66f36abf)
            const levelsSection = document.createElement('section');
            levelsSection.style.flex = '1';
            levelsSection.style.background = '#2e0854';
            levelsSection.style.borderRadius = '24px';
            levelsSection.style.border = '4px solid #180034';
            levelsSection.style.display = 'flex';
            levelsSection.style.flexDirection = 'column';
            levelsSection.style.overflow = 'hidden';

            const activeWorldObj = worldsList[currentWorldIdx - 1] || worldsList[0];

            const btnAddLevel = document.createElement('button');
            btnAddLevel.innerText = '➕ Add Level';
            btnAddLevel.style.background = '#00daf3';
            btnAddLevel.style.color = '#001f24';
            btnAddLevel.style.border = '2px solid #004f58';
            btnAddLevel.style.borderRadius = '9999px';
            btnAddLevel.style.padding = '10px 20px';
            btnAddLevel.style.fontFamily = "'Fredoka', sans-serif";
            btnAddLevel.style.fontWeight = 'bold';
            btnAddLevel.style.fontSize = '14px';
            btnAddLevel.style.cursor = 'pointer';

            const registeredLevels = (typeof GameConfig !== 'undefined' && GameConfig.LEVELS) ? GameConfig.LEVELS : [];

            btnAddLevel.addEventListener('click', () => {
                const newLvlName = prompt('Enter new Level Name:', 'New Level');
                if (newLvlName) {
                    const newLvlConfig = {
                        id: 'custom_level_' + Date.now(),
                        name: newLvlName,
                        worldIndex: currentWorldIdx,
                        worldName: activeWorldObj.name,
                        winSize: 300,
                        SIZE_TIERS: [
                            {
                                tier: 1,
                                initialSize: 15,
                                threshold: 50,
                                name: "Tiny",
                                color: 2201331,
                                zoom: 1.5,
                                LEVEL_AREA: { WIDTH: 1600, HEIGHT: 1200 },
                                ASSETS: { BACKGROUND_IMAGE: "assets/images/Level1.png", BACKGROUND_SCALE: 1.5 }
                            }
                        ],
                        TIER_ENTITIES: { "1": [] }
                    };
                    if (typeof GameConfig !== 'undefined' && GameConfig.registerLevel) {
                        GameConfig.registerLevel(newLvlConfig);
                    }
                    try {
                        const storedCustom = JSON.parse(localStorage.getItem('ptt_custom_levels') || '[]');
                        storedCustom.push(newLvlConfig);
                        localStorage.setItem('ptt_custom_levels', JSON.stringify(storedCustom));
                    } catch (err) {}
                    this.createUIOverlay();
                }
            });

            const levelsHeader = document.createElement('div');
            levelsHeader.style.background = '#39175f';
            levelsHeader.style.padding = '20px';
            levelsHeader.style.borderBottom = '4px solid #180034';
            levelsHeader.style.display = 'flex';
            levelsHeader.style.justifyContent = 'space-between';
            levelsHeader.style.alignItems = 'center';
            
            const headerInfo = document.createElement('div');
            headerInfo.innerHTML = `
                <h2 style="margin:0; font-size:24px; color:#79ff5b; font-family:'Fredoka', sans-serif;">Levels in '${activeWorldObj.name}'</h2>
                <p style="margin:4px 0 0 0; font-size:13px; color:#baccb0; font-family:'Quicksand', sans-serif;">Drag to reorder levels in this world sequence.</p>
            `;
            levelsHeader.appendChild(headerInfo);
            levelsHeader.appendChild(btnAddLevel);
            levelsSection.appendChild(levelsHeader);

            const levelsContainer = document.createElement('div');
            levelsContainer.style.flex = '1';
            levelsContainer.style.overflowY = 'auto';
            levelsContainer.style.padding = '20px';
            levelsContainer.style.display = 'flex';
            levelsContainer.style.flexDirection = 'column';
            levelsContainer.style.gap = '14px';

            // Filter all registered levels matching current selected world
            let worldLevels = registeredLevels.filter(lvl => (lvl.worldIndex === currentWorldIdx || lvl.worldName === activeWorldObj.name));

            if (worldLevels.length === 0) {
                if (this.levelConfig) {
                    worldLevels = [this.levelConfig];
                } else if (registeredLevels.length > 0) {
                    worldLevels = registeredLevels;
                }
            }

            worldLevels.forEach((lvlData, idx) => {
                const lvlCard = document.createElement('div');
                lvlCard.style.background = '#45236b';
                lvlCard.style.border = (this.levelConfig && this.levelConfig.id === lvlData.id) ? '4px solid #39ff14' : '2px solid #180034';
                lvlCard.style.borderRadius = '16px';
                lvlCard.style.padding = '16px';
                lvlCard.style.display = 'flex';
                lvlCard.style.alignItems = 'center';
                lvlCard.style.gap = '16px';

                lvlCard.innerHTML = `
                    <div style="font-size:24px; color:#baccb0; cursor:grab;">☰</div>
                    <div style="flex:1;">
                        <h3 style="margin:0; font-size:20px; color:#efdbff; font-family:'Fredoka', sans-serif;">Level ${idx + 1}: ${lvlData.name || 'Unnamed Level'}</h3>
                        <div style="color:#ffb68b; font-size:14px; margin-top:4px;">⭐ ⭐ ⭐ Target Win Size: ${lvlData.winSize || 300}</div>
                    </div>
                    <button class="btn-edit-lvl" style="background:#39ff14; color:#053900; border:none; border-radius:10px; padding:8px 16px; font-family:'Fredoka', sans-serif; font-weight:bold; cursor:pointer;">Edit Level</button>
                `;

                lvlCard.querySelector('.btn-edit-lvl').addEventListener('click', () => {
                    this.levelConfig = JSON.parse(JSON.stringify(lvlData));
                    this.currentTier = 1;
                    this.setupWorld();
                    this.redrawEntities();
                    this.activeTab = 'level';
                    this.createUIOverlay();
                });

                levelsContainer.appendChild(lvlCard);
            });

            levelsSection.appendChild(levelsContainer);
            workspace.appendChild(levelsSection);
        } else {

        // ==========================================
        // 3. LEFT SIDEBAR: TOOLS & ASSET LIBRARY
        // ==========================================
        const sidebar = document.createElement('aside');
        sidebar.id = 'editor-sidebar';
        sidebar.style.width = '280px';
        sidebar.style.background = '#2e0854'; // surface-container
        sidebar.style.borderRight = '4px solid #180034';
        sidebar.style.display = 'flex';
        sidebar.style.flexDirection = 'column';
        sidebar.style.overflowY = 'auto';
        sidebar.style.pointerEvents = 'auto';
        sidebar.style.padding = '16px';
        sidebar.style.color = '#efdbff';

        // Tools Section
        const toolsHeading = document.createElement('h2');
        toolsHeading.innerText = 'Tools';
        toolsHeading.style.fontSize = '18px';
        toolsHeading.style.color = '#ffb68b';
        toolsHeading.style.margin = '0 0 10px 0';
        toolsHeading.style.fontFamily = "'Fredoka', sans-serif";
        sidebar.appendChild(toolsHeading);

        const toolsGrid = document.createElement('div');
        toolsGrid.style.display = 'grid';
        toolsGrid.style.gridTemplateColumns = '1fr';
        toolsGrid.style.gap = '8px';
        toolsGrid.style.marginBottom = '14px';

        const btnToolClear = document.createElement('button');
        btnToolClear.id = 'tool-clear-btn';
        btnToolClear.innerText = '💥 Clear';
        btnToolClear.style.background = '#93000a';
        btnToolClear.style.color = '#ffdad6';
        btnToolClear.style.border = '2px solid #690005';
        btnToolClear.style.borderRadius = '10px';
        btnToolClear.style.padding = '10px';
        btnToolClear.style.fontWeight = 'bold';
        btnToolClear.style.cursor = 'pointer';
        btnToolClear.addEventListener('click', () => {
            this.levelConfig.TIER_ENTITIES[this.currentTier] = [];
            this.redrawEntities();
        });

        toolsGrid.appendChild(btnToolClear);
        sidebar.appendChild(toolsGrid);

        // Grid Snap Switch
        const gridBox = document.createElement('div');
        gridBox.style.display = 'flex';
        gridBox.style.alignItems = 'center';
        gridBox.style.justifyContent = 'space-between';
        gridBox.style.background = '#180034';
        gridBox.style.padding = '8px 12px';
        gridBox.style.borderRadius = '8px';
        gridBox.style.border = '2px solid #2a0350';
        gridBox.style.marginBottom = '16px';

        const gridLabel = document.createElement('span');
        gridLabel.innerText = 'Grid Overlay';
        gridLabel.style.fontSize = '13px';
        gridLabel.style.fontWeight = 'bold';
        gridBox.appendChild(gridLabel);

        const snapChk = document.createElement('input');
        snapChk.type = 'checkbox';
        snapChk.id = 'snap-chk';
        snapChk.checked = this.snapToGrid;
        snapChk.style.width = '18px';
        snapChk.style.height = '18px';
        snapChk.style.cursor = 'pointer';
        snapChk.addEventListener('change', (e) => {
            this.toggleGrid(e.target.checked);
        });
        gridBox.appendChild(snapChk);
        sidebar.appendChild(gridBox);

        // Placement Mode Section (Stitch Prototype Specification)
        const pmHeading = document.createElement('div');
        pmHeading.innerText = 'Placement Mode';
        pmHeading.style.fontSize = '12px';
        pmHeading.style.color = '#baccb0';
        pmHeading.style.fontFamily = "'Fredoka', sans-serif";
        pmHeading.style.fontWeight = 'bold';
        pmHeading.style.marginTop = '4px';
        pmHeading.style.marginBottom = '6px';
        sidebar.appendChild(pmHeading);

        const pmContainer = document.createElement('div');
        pmContainer.style.display = 'flex';
        pmContainer.style.background = '#180034';
        pmContainer.style.padding = '4px';
        pmContainer.style.borderRadius = '9999px';
        pmContainer.style.border = '2px solid #2a0350';
        pmContainer.style.marginBottom = '10px';

        const btnModeSingle = document.createElement('button');
        btnModeSingle.id = 'btn-mode-single';
        btnModeSingle.innerText = 'Single';
        btnModeSingle.style.flex = '1';
        btnModeSingle.style.padding = '6px 8px';
        btnModeSingle.style.borderRadius = '9999px';
        btnModeSingle.style.border = 'none';
        btnModeSingle.style.fontFamily = "'Fredoka', sans-serif";
        btnModeSingle.style.fontSize = '12px';
        btnModeSingle.style.fontWeight = 'bold';
        btnModeSingle.style.cursor = 'pointer';

        const btnModeRandom = document.createElement('button');
        btnModeRandom.id = 'btn-mode-random';
        btnModeRandom.innerText = 'Random Fill';
        btnModeRandom.style.flex = '1';
        btnModeRandom.style.padding = '6px 8px';
        btnModeRandom.style.borderRadius = '9999px';
        btnModeRandom.style.border = 'none';
        btnModeRandom.style.fontFamily = "'Fredoka', sans-serif";
        btnModeRandom.style.fontSize = '12px';
        btnModeRandom.style.fontWeight = 'bold';
        btnModeRandom.style.cursor = 'pointer';

        if (!this.placementMode) this.placementMode = 'single';
        if (this.fillCount === undefined) this.fillCount = 10;
        if (this.fillRadius === undefined) this.fillRadius = 100;

        const updateModeStyles = () => {
            if (this.placementMode === 'random') {
                btnModeSingle.style.background = 'transparent';
                btnModeSingle.style.color = '#efdbff';
                btnModeRandom.style.background = '#39ff14';
                btnModeRandom.style.color = '#053900';
            } else {
                btnModeSingle.style.background = '#39ff14';
                btnModeSingle.style.color = '#053900';
                btnModeRandom.style.background = 'transparent';
                btnModeRandom.style.color = '#efdbff';
            }
        };

        updateModeStyles();

        btnModeSingle.addEventListener('click', () => {
            this.placementMode = 'single';
            updateModeStyles();
            fillSettingsCard.style.display = 'none';
        });

        btnModeRandom.addEventListener('click', () => {
            this.placementMode = 'random';
            updateModeStyles();
            fillSettingsCard.style.display = 'flex';
        });

        pmContainer.appendChild(btnModeSingle);
        pmContainer.appendChild(btnModeRandom);
        sidebar.appendChild(pmContainer);

        // Fill Settings Card
        const fillSettingsCard = document.createElement('div');
        fillSettingsCard.id = 'fill-settings-card';
        fillSettingsCard.style.display = this.placementMode === 'random' ? 'flex' : 'none';
        fillSettingsCard.style.flexDirection = 'column';
        fillSettingsCard.style.gap = '10px';
        fillSettingsCard.style.background = '#2a0350';
        fillSettingsCard.style.padding = '12px';
        fillSettingsCard.style.borderRadius = '14px';
        fillSettingsCard.style.border = '2px solid #39175f';
        fillSettingsCard.style.marginBottom = '16px';

        const fsTitle = document.createElement('div');
        fsTitle.innerText = 'Fill Settings';
        fsTitle.style.fontSize = '12px';
        fsTitle.style.color = '#9cf0ff';
        fsTitle.style.fontFamily = "'Fredoka', sans-serif";
        fsTitle.style.fontWeight = 'bold';
        fillSettingsCard.appendChild(fsTitle);

        // Entity Count Field
        const countGroup = document.createElement('div');
        countGroup.style.display = 'flex';
        countGroup.style.flexDirection = 'column';
        countGroup.style.gap = '4px';

        const countLabel = document.createElement('label');
        countLabel.innerText = `Entity Count (${this.fillCount})`;
        countLabel.style.fontSize = '11px';
        countLabel.style.color = '#baccb0';

        const countInput = document.createElement('input');
        countInput.type = 'number';
        countInput.id = 'fill-count-input';
        countInput.value = this.fillCount;
        countInput.min = '1';
        countInput.max = '100';
        countInput.style.background = '#180034';
        countInput.style.color = '#efdbff';
        countInput.style.border = '2px solid #2a0350';
        countInput.style.borderRadius = '8px';
        countInput.style.padding = '6px';
        countInput.style.fontSize = '13px';
        countInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val > 0) {
                this.fillCount = val;
                countLabel.innerText = `Entity Count (${this.fillCount})`;
            }
        });

        countGroup.appendChild(countLabel);
        countGroup.appendChild(countInput);
        fillSettingsCard.appendChild(countGroup);

        // Spread Radius Slider Field
        const radiusGroup = document.createElement('div');
        radiusGroup.style.display = 'flex';
        radiusGroup.style.flexDirection = 'column';
        radiusGroup.style.gap = '4px';

        const radiusLabel = document.createElement('label');
        radiusLabel.innerText = `Spread Radius (${this.fillRadius}px)`;
        radiusLabel.style.fontSize = '11px';
        radiusLabel.style.color = '#baccb0';

        const radiusInput = document.createElement('input');
        radiusInput.type = 'range';
        radiusInput.id = 'fill-radius-input';
        radiusInput.min = '20';
        radiusInput.max = '300';
        radiusInput.value = this.fillRadius;
        radiusInput.style.accentColor = '#39ff14';
        radiusInput.style.cursor = 'pointer';
        radiusInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
                this.fillRadius = val;
                radiusLabel.innerText = `Spread Radius (${this.fillRadius}px)`;
            }
        });

        radiusGroup.appendChild(radiusLabel);
        radiusGroup.appendChild(radiusInput);
        fillSettingsCard.appendChild(radiusGroup);

        sidebar.appendChild(fillSettingsCard);

        // Library Section
        const libHeading = document.createElement('h2');
        libHeading.innerText = 'Library';
        libHeading.style.fontSize = '18px';
        libHeading.style.color = '#9cf0ff';
        libHeading.style.margin = '0 0 10px 0';
        libHeading.style.fontFamily = "'Fredoka', sans-serif";
        sidebar.appendChild(libHeading);

        // Start Point Card (Stitch prototype design)
        const startCardBox = document.createElement('div');
        startCardBox.style.marginBottom = '14px';

        const startCardLabel = document.createElement('label');
        startCardLabel.innerText = 'Start Point';
        startCardLabel.style.display = 'block';
        startCardLabel.style.fontSize = '12px';
        startCardLabel.style.color = '#baccb0';
        startCardLabel.style.fontWeight = 'bold';
        startCardLabel.style.marginBottom = '4px';
        startCardBox.appendChild(startCardLabel);

        const btnStartPoint = document.createElement('div');
        btnStartPoint.id = 'btn-start-point';
        btnStartPoint.innerHTML = `
            <div style="background: #45236b; border: 2px solid #180034; border-left: 5px solid #39ff14; border-radius: 12px; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; color: #79ff5b; font-weight: bold; font-family: 'Fredoka', sans-serif;">
                <span>👻</span> Set Ghost Start Point
            </div>
        `;
        btnStartPoint.addEventListener('click', () => {
            this.activeBrush = 'Start Point';
        });
        startCardBox.appendChild(btnStartPoint);
        sidebar.appendChild(startCardBox);

        const brushLabel = document.createElement('label');
        brushLabel.innerText = 'Select Entity Brush:';
        brushLabel.style.display = 'block';
        brushLabel.style.fontSize = '12px';
        brushLabel.style.color = '#baccb0';
        brushLabel.style.fontWeight = 'bold';
        brushLabel.style.marginBottom = '4px';
        sidebar.appendChild(brushLabel);

        const selectBrush = document.createElement('select');
        selectBrush.id = 'select-brush';
        selectBrush.style.width = '100%';
        selectBrush.style.padding = '8px';
        selectBrush.style.marginBottom = '16px';
        selectBrush.style.background = '#45236b';
        selectBrush.style.color = '#efdbff';
        selectBrush.style.border = '2px solid #180034';
        selectBrush.style.borderRadius = '10px';
        selectBrush.style.fontFamily = "'Fredoka', sans-serif";

        const categories = {
            'Edibles 🟢': ["Coin", "Tea drop", "Cookie crumb", "Sugarcube", "Sandwich", "Tea bag", "Cake", "Spoon", "Cup", "Biscuit", "Teapot", "One pound note", "Beans can"],
            'Hazards 🔴': ["Mouse", "Waiter", "Customer", "Goose", "Guard", "King", "Brit", "Tourist", "Cyclist", "Duck", "Swan"],
            'Scenery 📦': ["Chair", "Table", "Counter", "Bush", "Streetlight", "Building, Large", "Building, Small", "Tree", "Awning"]
        };

        Object.keys(categories).forEach(cat => {
            const group = document.createElement('optgroup');
            group.label = cat;
            categories[cat].forEach(type => {
                if (ENTITY_TEMPLATES[type]) {
                    const opt = document.createElement('option');
                    opt.value = type;
                    opt.innerText = type;
                    if (type === this.activeBrush) opt.selected = true;
                    group.appendChild(opt);
                }
            });
            selectBrush.appendChild(group);
        });

        selectBrush.addEventListener('change', (e) => {
            this.activeBrush = e.target.value;
        });
        sidebar.appendChild(selectBrush);

        workspace.appendChild(sidebar);

        // ==========================================
        // 4. FLOATING SETTINGS PANEL (TOP RIGHT)
        // ==========================================
        const panel = document.createElement('div');
        panel.style.position = 'absolute';
        panel.style.top = '16px';
        panel.style.right = '16px';
        panel.style.width = '310px';
        panel.style.maxHeight = 'calc(100% - 32px)';
        panel.style.background = 'rgba(57, 23, 95, 0.95)'; // surface-container-high
        panel.style.border = '4px solid #180034';
        panel.style.borderRadius = '16px';
        panel.style.padding = '16px';
        panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
        panel.style.pointerEvents = 'auto';
        panel.style.overflowY = 'auto';
        panel.style.color = '#efdbff';

        const panelHeading = document.createElement('h3');
        panelHeading.innerText = 'Level Settings';
        panelHeading.style.fontSize = '20px';
        panelHeading.style.color = '#79ff5b';
        panelHeading.style.marginTop = '0';
        panelHeading.style.marginBottom = '12px';
        panelHeading.style.fontFamily = "'Fredoka', sans-serif";
        panel.appendChild(panelHeading);

        // Level Name Input
        const labelName = document.createElement('label');
        labelName.innerText = 'Level Name';
        labelName.style.display = 'block';
        labelName.style.fontSize = '12px';
        labelName.style.color = '#baccb0';
        labelName.style.fontWeight = 'bold';
        labelName.style.marginBottom = '4px';
        panel.appendChild(labelName);

        const inputName = document.createElement('input');
        inputName.type = 'text';
        inputName.value = this.levelConfig.name;
        inputName.style.width = '100%';
        inputName.style.padding = '6px';
        inputName.style.marginBottom = '12px';
        inputName.style.background = '#180034';
        inputName.style.color = '#efdbff';
        inputName.style.border = '2px solid #2a0350';
        inputName.style.borderRadius = '8px';
        inputName.addEventListener('input', (e) => {
            this.levelConfig.name = e.target.value;
        });
        panel.appendChild(inputName);

        // Target World Selection Dropdown
        const labelWorld = document.createElement('label');
        labelWorld.innerText = 'Target World';
        labelWorld.style.display = 'block';
        labelWorld.style.fontSize = '12px';
        labelWorld.style.color = '#baccb0';
        labelWorld.style.fontWeight = 'bold';
        labelWorld.style.marginBottom = '4px';
        panel.appendChild(labelWorld);

        const selectWorld = document.createElement('select');
        selectWorld.id = 'world-select';
        selectWorld.style.width = '100%';
        selectWorld.style.padding = '6px';
        selectWorld.style.marginBottom = '12px';
        selectWorld.style.background = '#180034';
        selectWorld.style.color = '#efdbff';
        selectWorld.style.border = '2px solid #2a0350';
        selectWorld.style.borderRadius = '8px';
        selectWorld.style.fontFamily = "'Fredoka', sans-serif";

        const worldsList = (typeof GameConfig !== 'undefined' && GameConfig.WORLDS) ? GameConfig.WORLDS : [
            { name: "Ghost", subtitle: "Death isn't the end of you, but it is the end for London." },
            { name: "Stingray", subtitle: "The Atlantic isn't safe from poachers..." },
            { name: "Snake", subtitle: "Eat your way through an indian zoo." },
            { name: "Pigeon", subtitle: "Consume NYC and gain the ability to fly." },
            { name: "Jaguar", subtitle: "A consumption journey of the Amazon." },
            { name: "Seagull", subtitle: "The ultimate feasting on Shanghai!" },
            { name: "Goo", subtitle: "Start in a petri dish and eat your way to the end of the universe!" }
        ];

        worldsList.forEach((worldObj, idx) => {
            const opt = document.createElement('option');
            opt.value = idx + 1;
            opt.textContent = `World ${idx + 1}: ${worldObj.name}`;
            if (this.levelConfig.worldIndex === idx + 1 || (this.levelConfig.worldName && this.levelConfig.worldName === worldObj.name)) {
                opt.selected = true;
            }
            selectWorld.appendChild(opt);
        });

        selectWorld.addEventListener('change', (e) => {
            const chosenIdx = parseInt(e.target.value);
            const chosenWorld = worldsList[chosenIdx - 1];
            this.levelConfig.worldIndex = chosenIdx;
            this.levelConfig.worldName = chosenWorld ? chosenWorld.name : `World ${chosenIdx}`;
        });
        panel.appendChild(selectWorld);

        // Advanced Tier Config Section Header
        const tierSectionHeader = document.createElement('div');
        tierSectionHeader.style.display = 'flex';
        tierSectionHeader.style.alignItems = 'center';
        tierSectionHeader.style.justifyContent = 'space-between';
        tierSectionHeader.style.borderTop = '2px solid #180034';
        tierSectionHeader.style.paddingTop = '10px';
        tierSectionHeader.style.marginBottom = '10px';

        const tierTitle = document.createElement('h4');
        tierTitle.innerText = 'Advanced Tier Config';
        tierTitle.style.margin = '0';
        tierTitle.style.fontSize = '15px';
        tierTitle.style.color = '#79ff5b';
        tierTitle.style.fontFamily = "'Fredoka', sans-serif";
        tierSectionHeader.appendChild(tierTitle);

        const tierBtnGroup = document.createElement('div');
        tierBtnGroup.style.display = 'flex';
        tierBtnGroup.style.gap = '4px';

        const btnAddTier = document.createElement('button');
        btnAddTier.id = 'btn-add-tier';
        btnAddTier.innerText = '+ Add';
        btnAddTier.style.background = '#39ff14';
        btnAddTier.style.color = '#053900';
        btnAddTier.style.border = 'none';
        btnAddTier.style.borderRadius = '6px';
        btnAddTier.style.padding = '4px 8px';
        btnAddTier.style.fontSize = '11px';
        btnAddTier.style.fontWeight = 'bold';
        btnAddTier.style.cursor = 'pointer';
        btnAddTier.addEventListener('click', () => {
            const newTierNum = this.levelConfig.SIZE_TIERS.length + 1;
            if (newTierNum > 5) return;
            const prevTier = this.levelConfig.SIZE_TIERS[newTierNum - 2];
            this.levelConfig.SIZE_TIERS.push({
                tier: newTierNum,
                initialSize: prevTier ? prevTier.threshold : 20,
                threshold: prevTier ? Math.round(prevTier.threshold * 2.5) : 100,
                name: 'New Tier',
                color: 0x4CAF50,
                zoom: prevTier ? Math.max(prevTier.zoom * 0.7, 0.5) : 1.0,
                LEVEL_AREA: prevTier ? { ...prevTier.LEVEL_AREA } : { WIDTH: 2000, HEIGHT: 1500 },
                ASSETS: prevTier ? { ...prevTier.ASSETS } : { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.0 }
            });
            this.levelConfig.TIER_ENTITIES[newTierNum] = [];
            this.currentTier = newTierNum;
            this.setupWorld();
            this.redrawEntities();
            this.createUIOverlay();
        });
        tierBtnGroup.appendChild(btnAddTier);

        const btnDelTier = document.createElement('button');
        btnDelTier.id = 'btn-del-tier';
        btnDelTier.innerText = '- Del';
        btnDelTier.style.background = '#93000a';
        btnDelTier.style.color = '#ffdad6';
        btnDelTier.style.border = 'none';
        btnDelTier.style.borderRadius = '6px';
        btnDelTier.style.padding = '4px 8px';
        btnDelTier.style.fontSize = '11px';
        btnDelTier.style.fontWeight = 'bold';
        btnDelTier.style.cursor = 'pointer';
        btnDelTier.addEventListener('click', () => {
            const count = this.levelConfig.SIZE_TIERS.length;
            if (count <= 1) return;
            this.levelConfig.SIZE_TIERS.pop();
            delete this.levelConfig.TIER_ENTITIES[count];
            if (this.currentTier > this.levelConfig.SIZE_TIERS.length) {
                this.currentTier = this.levelConfig.SIZE_TIERS.length;
            }
            this.setupWorld();
            this.redrawEntities();
            this.createUIOverlay();
        });
        tierBtnGroup.appendChild(btnDelTier);

        tierSectionHeader.appendChild(tierBtnGroup);
        panel.appendChild(tierSectionHeader);

        // Active Tier Select
        const selectTier = document.createElement('select');
        selectTier.style.width = '100%';
        selectTier.style.padding = '6px';
        selectTier.style.marginBottom = '12px';
        selectTier.style.background = '#180034';
        selectTier.style.color = '#efdbff';
        selectTier.style.border = '2px solid #2a0350';
        selectTier.style.borderRadius = '8px';
        selectTier.style.fontFamily = "'Fredoka', sans-serif";

        this.levelConfig.SIZE_TIERS.forEach((tierObj, idx) => {
            const opt = document.createElement('option');
            opt.value = idx + 1;
            opt.textContent = `Tier ${idx + 1} (${tierObj.name || 'Unnamed'})`;
            if (idx + 1 === this.currentTier) opt.selected = true;
            selectTier.appendChild(opt);
        });

        selectTier.addEventListener('change', (e) => {
            this.currentTier = parseInt(e.target.value);
            this.setupWorld();
            this.redrawEntities();
            this.createUIOverlay();
        });
        panel.appendChild(selectTier);

        // Current Tier Card Inputs
        const tierConfig = this.levelConfig.SIZE_TIERS[this.currentTier - 1] || this.levelConfig.SIZE_TIERS[0];

        const tierCard = document.createElement('div');
        tierCard.style.background = '#45236b';
        tierCard.style.borderRadius = '10px';
        tierCard.style.padding = '10px';
        tierCard.style.border = '2px solid #180034';
        tierCard.style.marginBottom = '12px';

        // Tier Name
        tierCard.innerHTML = `
            <div style="margin-bottom: 8px;">
                <label style="display:block; font-size:11px; font-weight:bold; color:#baccb0; margin-bottom:2px;">Tier Label</label>
                <input type="text" id="tier-name" value="${tierConfig.name || ''}" style="width:100%; padding:4px; background:#180034; color:#efdbff; border:1px solid #2a0350; border-radius:6px; font-size:12px;">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
                <div>
                    <label style="display:block; font-size:11px; font-weight:bold; color:#baccb0; margin-bottom:2px;">Player Size</label>
                    <input type="number" id="tier-init-size" value="${tierConfig.initialSize || 15}" style="width:100%; padding:4px; background:#180034; color:#efdbff; border:1px solid #2a0350; border-radius:6px; font-size:12px;">
                </div>
                <div>
                    <label style="display:block; font-size:11px; font-weight:bold; color:#baccb0; margin-bottom:2px;">Threshold</label>
                    <input type="number" id="tier-threshold" value="${tierConfig.threshold || 50}" style="width:100%; padding:4px; background:#180034; color:#efdbff; border:1px solid #2a0350; border-radius:6px; font-size:12px;">
                </div>
            </div>
            <div style="margin-bottom:8px;">
                <label style="display:block; font-size:11px; font-weight:bold; color:#baccb0; margin-bottom:2px;">Camera Zoom</label>
                <input type="number" id="tier-zoom" min="0.1" max="10.0" step="0.1" value="${tierConfig.zoom || 1.0}" style="width:100%; padding:4px; background:#180034; color:#efdbff; border:1px solid #2a0350; border-radius:6px; font-size:12px;">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
                <div>
                    <label style="display:block; font-size:11px; font-weight:bold; color:#baccb0; margin-bottom:2px;">Bound Width</label>
                    <input type="number" id="tier-area-w" value="${(tierConfig.LEVEL_AREA && tierConfig.LEVEL_AREA.WIDTH) || 1600}" style="width:100%; padding:4px; background:#180034; color:#efdbff; border:1px solid #2a0350; border-radius:6px; font-size:12px;">
                </div>
                <div>
                    <label style="display:block; font-size:11px; font-weight:bold; color:#baccb0; margin-bottom:2px;">Bound Height</label>
                    <input type="number" id="tier-area-h" value="${(tierConfig.LEVEL_AREA && tierConfig.LEVEL_AREA.HEIGHT) || 1200}" style="width:100%; padding:4px; background:#180034; color:#efdbff; border:1px solid #2a0350; border-radius:6px; font-size:12px;">
                </div>
            </div>
            <div>
                <label style="display:block; font-size:11px; font-weight:bold; color:#baccb0; margin-bottom:2px;">Background Image</label>
                <select id="tier-bg-select" style="width:100%; padding:4px; background:#180034; color:#efdbff; border:1px solid #2a0350; border-radius:6px; font-size:12px;">
                    <option value="assets/images/Level1.png" ${((tierConfig.ASSETS && tierConfig.ASSETS.BACKGROUND_IMAGE) || '').includes('Level1.png') ? 'selected' : ''}>Level 1 (Green Shop)</option>
                    <option value="assets/images/Level2.png" ${((tierConfig.ASSETS && tierConfig.ASSETS.BACKGROUND_IMAGE) || '').includes('Level2.png') ? 'selected' : ''}>Level 2 (Phone Floor)</option>
                    <option value="assets/images/Level4.png" ${((tierConfig.ASSETS && tierConfig.ASSETS.BACKGROUND_IMAGE) || '').includes('Level4.png') ? 'selected' : ''}>Level 4 (Castle Red)</option>
                    <option value="assets/images/Level5.png" ${((tierConfig.ASSETS && tierConfig.ASSETS.BACKGROUND_IMAGE) || '').includes('Level5.png') ? 'selected' : ''}>Level 5 (Park Green)</option>
                    <option value="assets/images/Level6.png" ${((tierConfig.ASSETS && tierConfig.ASSETS.BACKGROUND_IMAGE) || '').includes('Level6.png') ? 'selected' : ''}>Level 6 (Blue Pond)</option>
                    <option value="none">No Background Image</option>
                </select>
            </div>
        `;
        panel.appendChild(tierCard);

        // Bind input listeners
        const inputTierName = tierCard.querySelector('#tier-name');
        const inputInitSize = tierCard.querySelector('#tier-init-size');
        const inputThreshold = tierCard.querySelector('#tier-threshold');
        const inputZoom = tierCard.querySelector('#tier-zoom');
        const inputAreaW = tierCard.querySelector('#tier-area-w');
        const inputAreaH = tierCard.querySelector('#tier-area-h');
        const selectBgImage = tierCard.querySelector('#tier-bg-select');

        if (inputTierName) inputTierName.addEventListener('input', (e) => {
            tierConfig.name = e.target.value;
            const opt = selectTier.options[this.currentTier - 1];
            if (opt) opt.textContent = `Tier ${this.currentTier} (${e.target.value})`;
        });

        if (inputInitSize) inputInitSize.addEventListener('change', (e) => {
            tierConfig.initialSize = parseInt(e.target.value) || 15;
        });

        if (inputThreshold) inputThreshold.addEventListener('change', (e) => {
            tierConfig.threshold = parseInt(e.target.value) || 50;
        });

        if (inputZoom) inputZoom.addEventListener('change', (e) => {
            tierConfig.zoom = parseFloat(e.target.value) || 1.0;
        });

        if (inputAreaW) inputAreaW.addEventListener('change', (e) => {
            if (!tierConfig.LEVEL_AREA) tierConfig.LEVEL_AREA = {};
            tierConfig.LEVEL_AREA.WIDTH = parseInt(e.target.value) || 1600;
            this.setupWorld();
        });

        if (inputAreaH) inputAreaH.addEventListener('change', (e) => {
            if (!tierConfig.LEVEL_AREA) tierConfig.LEVEL_AREA = {};
            tierConfig.LEVEL_AREA.HEIGHT = parseInt(e.target.value) || 1200;
            this.setupWorld();
        });

        if (selectBgImage) selectBgImage.addEventListener('change', (e) => {
            if (!tierConfig.ASSETS) tierConfig.ASSETS = {};
            if (e.target.value === 'none') {
                tierConfig.ASSETS.BACKGROUND_IMAGE = undefined;
            } else {
                tierConfig.ASSETS.BACKGROUND_IMAGE = e.target.value;
            }
            this.setupWorld();
        });

        // Code Output Container
        const outputBox = document.createElement('div');
        outputBox.id = 'export-box';
        outputBox.style.display = 'none';
        outputBox.style.marginTop = '10px';

        const txtCode = document.createElement('textarea');
        txtCode.id = 'export-textarea';
        txtCode.style.width = '100%';
        txtCode.style.height = '100px';
        txtCode.style.background = '#180034';
        txtCode.style.color = '#39ff14';
        txtCode.style.fontSize = '11px';
        txtCode.style.fontFamily = 'monospace';
        txtCode.readOnly = true;
        txtCode.style.padding = '5px';
        txtCode.style.borderRadius = '6px';
        outputBox.appendChild(txtCode);

        const btnDownloadJson = document.createElement('button');
        btnDownloadJson.id = 'btn-download-json';
        btnDownloadJson.innerText = '📥 Download .json File';
        btnDownloadJson.style.width = '100%';
        btnDownloadJson.style.marginTop = '6px';
        btnDownloadJson.style.background = '#00daf3';
        btnDownloadJson.style.color = '#001f24';
        btnDownloadJson.style.border = 'none';
        btnDownloadJson.style.borderRadius = '8px';
        btnDownloadJson.style.padding = '8px';
        btnDownloadJson.style.fontFamily = "'Fredoka', sans-serif";
        btnDownloadJson.style.fontWeight = 'bold';
        btnDownloadJson.style.fontSize = '12px';
        btnDownloadJson.style.cursor = 'pointer';
        btnDownloadJson.addEventListener('click', () => this.downloadJsonFile());
        outputBox.appendChild(btnDownloadJson);

        panel.appendChild(outputBox);
        workspace.appendChild(panel);
        }

        root.appendChild(workspace);

        // Append root to parent container
        const parent = document.getElementById(this.game.config.parent) || document.body;
        parent.appendChild(root);

        // Keep local reference to root
        this.sidebarOverlay = root;

        // Cleanup overlay on scene shutdown
        this.events.once('shutdown', () => {
            if (this.sidebarOverlay) {
                this.sidebarOverlay.remove();
                this.sidebarOverlay = null;
            }
        });
    }



    playtest() {
        // Complete current editing configuration
        // Clone config to prevent mutations during play
        const cleanConfig = JSON.parse(JSON.stringify(this.levelConfig));
        
        // Setup playtest metadata
        cleanConfig.isPlaytest = true;
        
        // We need to inject default settings (like PLAYER or SCORING) so it works in GameScene
        // Using registerLevel logic inline or loading standard defaults
        cleanConfig.SCORING = { MAX_POINTS_PER_ITEM: 80, MIN_POINTS_PER_ITEM: 1, HAZARD_PENALTY: 80 };
        cleanConfig.STAR_THRESHOLDS = { ONE_STAR: 500, TWO_STAR: 1500, THREE_STAR: 3000 };
        cleanConfig.EFFECTS = { SMOKE_DURATION_MIN: 100, SMOKE_DURATION_MAX: 1000 };
        cleanConfig.PLAYER = {
            GROWTH_FACTOR: 0.15,
            TIER_GROWTH_FACTOR: 0.15,
            SPEED: 200,
            MOUTH_OFFSET: 0.7,
            CONSUMPTION_RANGE_BONUS: 10,
            INVULNERABILITY_DURATION: 500,
            SPRITE: {
                USE_SPRITESHEET: true,
                KEY: 'player_sheet',
                FRAME_WIDTH: 800,
                FRAME_HEIGHT: 800,
                ANIMATIONS: {
                    DOWN: { start: 0, end: 2, rate: 10 },
                    UP: { start: 3, end: 5, rate: 10 },
                    RIGHT: { start: 9, end: 11, rate: 10 },
                    LEFT: { start: 6, end: 8, rate: 10 }
                }
            }
        };

        // Construct TIER_ENTITIES with templates properties
        const expandedEntities = {};
        for (const tier in cleanConfig.TIER_ENTITIES) {
            expandedEntities[tier] = cleanConfig.TIER_ENTITIES[tier].map(item => {
                const template = ENTITY_TEMPLATES[item.type] || {};
                
                // Deep merge standard template and overrides
                const mergedItem = JSON.parse(JSON.stringify(template));
                Object.keys(item).forEach(key => {
                    if (item[key] && typeof item[key] === 'object' && !Array.isArray(item[key])) {
                        mergedItem[key] = Object.assign({}, mergedItem[key] || {}, item[key]);
                    } else {
                        mergedItem[key] = item[key];
                    }
                });
                return mergedItem;
            });
        }
        cleanConfig.TIER_ENTITIES = expandedEntities;

        // Auto-generate preloading images
        cleanConfig.ENTITY_IMAGES = {
            'player_sheet': 'assets/images/ghost.png'
        };
        const assetMap = {
            'teadrop': 'assets/images/teadrop.png',
            'crumb': 'assets/images/crumb.png',
            'coin': 'assets/images/coin.png',
            'cube': 'assets/images/cube.png',
            'sandwich': 'assets/images/sandwich.png',
            'teabag': 'assets/images/teabag.png',
            'cake': 'assets/images/cake.png',
            'spoon': 'assets/images/spoon.png',
            'cup': 'assets/images/cup.png',
            'teapot': 'assets/images/teapot.png',
            'biscuit': 'assets/images/biscuit.png',
            'onepoundnote': 'assets/images/onepoundnote.png',
            'beanscan': 'assets/images/beanscan.png',
            'chair': 'assets/images/chair.png',
            'table': 'assets/images/table.png',
            'waiter': 'assets/images/waiter.png',
            'customer': 'assets/images/customer.png',
            'mouse': 'assets/images/mouse.png',
            'emptycounter': 'assets/images/emptycounter.png',
            'phonebooth': 'assets/images/phonebooth.png',
            'goose': 'assets/images/goose.png',
            'guard': 'assets/images/guard.png',
            'king': 'assets/images/king.png',
            'tourist': 'assets/images/tourist.png',
            'brit': 'assets/images/brit.png',
            'cyclist': 'assets/images/cyclist.png',
            'bush': 'assets/images/bush.png',
            'streetlight': 'assets/images/streetlight.png',
            'circletable': 'assets/images/circletable.png',
            'building1': 'assets/images/building1.png',
            'building2': 'assets/images/building2.png',
            'awning': 'assets/images/awning.png',
            'car': 'assets/images/car.png',
            'taxi': 'assets/images/taxi.png',
            'doubledecker': 'assets/images/doubledecker.png',
            'tree': 'assets/images/tree.png',
            'duck': 'assets/images/duck.png',
            'swan': 'assets/images/swan.png'
        };

        for (const tier in cleanConfig.TIER_ENTITIES) {
            cleanConfig.TIER_ENTITIES[tier].forEach(entity => {
                if (entity.image && assetMap[entity.image]) {
                    cleanConfig.ENTITY_IMAGES[entity.image] = assetMap[entity.image];
                }
                if (entity.SPRITE && entity.SPRITE.KEY && assetMap[entity.SPRITE.KEY]) {
                    cleanConfig.ENTITY_IMAGES[entity.SPRITE.KEY] = assetMap[entity.SPRITE.KEY];
                }
            });
        }

        // Clean up UI sidebar overlay before transitioning
        if (this.sidebarOverlay) {
            this.sidebarOverlay.remove();
            this.sidebarOverlay = null;
        }

        // Save current editing tier state in restoring kop
        this.levelConfig.currentEditingTier = this.currentTier;

        // Transition to GameScene passing the playtest configuration
        this.scene.start('GameScene', { levelConfig: cleanConfig });
    }

    saveToStorage() {
        let customLevels = [];
        try {
            const saved = localStorage.getItem('custom_levels');
            if (saved) {
                customLevels = JSON.parse(saved);
            }
        } catch (e) {
            console.error(e);
        }

        // Check if level already exists (update it)
        const idx = customLevels.findIndex(lvl => lvl.id === this.levelConfig.id);
        if (idx !== -1) {
            customLevels[idx] = this.levelConfig;
        } else {
            customLevels.push(this.levelConfig);
        }

        try {
            localStorage.setItem('custom_levels', JSON.stringify(customLevels));
            alert(`Level "${this.levelConfig.name}" saved to browser successfully!`);
        } catch (e) {
            alert('Failed to save level. Storage quota might be full.');
        }
    }

    exportConfig() {
        const cleanConfig = JSON.parse(JSON.stringify(this.levelConfig));
        
        // Remove helper editing values
        delete cleanConfig.currentEditingTier;
        
        // Format clean JSON block
        const jsonString = JSON.stringify(cleanConfig, null, 2);

        const exportBox = document.getElementById('export-box');
        const txtArea = document.getElementById('export-textarea');
        if (exportBox && txtArea) {
            exportBox.style.display = 'block';
            txtArea.value = jsonString;
        }
    }

    downloadJsonFile() {
        const cleanConfig = JSON.parse(JSON.stringify(this.levelConfig));
        delete cleanConfig.currentEditingTier;
        const jsonString = JSON.stringify(cleanConfig, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.levelConfig.id || 'custom_level'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    openEditWorldModal(worldObj) {
        const existingModal = document.getElementById('edit-world-modal-backdrop');
        if (existingModal) existingModal.remove();

        const backdrop = document.createElement('div');
        backdrop.id = 'edit-world-modal-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.inset = '0';
        backdrop.style.background = 'rgba(18, 0, 52, 0.85)';
        backdrop.style.backdropFilter = 'blur(8px)';
        backdrop.style.zIndex = '99999';
        backdrop.style.display = 'flex';
        backdrop.style.justifyContent = 'center';
        backdrop.style.alignItems = 'center';
        backdrop.style.padding = '20px';

        const modalBox = document.createElement('div');
        modalBox.style.width = '480px';
        modalBox.style.maxWidth = '90vw';
        modalBox.style.background = '#2e0854';
        modalBox.style.border = '4px solid #180034';
        modalBox.style.borderRadius = '24px';
        modalBox.style.padding = '24px';
        modalBox.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.7)';
        modalBox.style.display = 'flex';
        modalBox.style.flexDirection = 'column';
        modalBox.style.gap = '16px';
        modalBox.style.color = '#efdbff';

        // Modal Header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = `
            <h2 style="margin:0; font-size:22px; color:#79ff5b; font-family:'Fredoka', sans-serif;">✏️ Edit World Details</h2>
            <button id="btn-modal-close" style="background:none; border:none; color:#efdbff; font-size:24px; cursor:pointer; padding:0;">✕</button>
        `;
        modalBox.appendChild(header);

        // Form Fields Container
        const form = document.createElement('div');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '14px';

        // 1. World Name
        const nameGroup = document.createElement('div');
        nameGroup.innerHTML = `<label style="display:block; font-size:13px; font-weight:bold; color:#ffb68b; margin-bottom:4px; font-family:'Quicksand', sans-serif;">World Name</label>`;
        const inputName = document.createElement('input');
        inputName.id = 'modal-world-name';
        inputName.type = 'text';
        inputName.value = worldObj.name || '';
        inputName.style.width = '100%';
        inputName.style.background = '#180034';
        inputName.style.color = '#39ff14';
        inputName.style.border = '2px solid #39175f';
        inputName.style.borderRadius = '10px';
        inputName.style.padding = '10px';
        inputName.style.fontFamily = "'Fredoka', sans-serif";
        inputName.style.fontSize = '14px';
        inputName.style.boxSizing = 'border-box';
        nameGroup.appendChild(inputName);
        form.appendChild(nameGroup);

        // 2. World Subtitle
        const subtitleGroup = document.createElement('div');
        subtitleGroup.innerHTML = `<label style="display:block; font-size:13px; font-weight:bold; color:#ffb68b; margin-bottom:4px; font-family:'Quicksand', sans-serif;">World Subtitle</label>`;
        const inputSubtitle = document.createElement('input');
        inputSubtitle.id = 'modal-world-subtitle';
        inputSubtitle.type = 'text';
        inputSubtitle.value = worldObj.subtitle || '';
        inputSubtitle.style.width = '100%';
        inputSubtitle.style.background = '#180034';
        inputSubtitle.style.color = '#00daf3';
        inputSubtitle.style.border = '2px solid #39175f';
        inputSubtitle.style.borderRadius = '10px';
        inputSubtitle.style.padding = '10px';
        inputSubtitle.style.fontFamily = "'Quicksand', sans-serif";
        inputSubtitle.style.fontSize = '13px';
        inputSubtitle.style.boxSizing = 'border-box';
        subtitleGroup.appendChild(inputSubtitle);
        form.appendChild(subtitleGroup);

        modalBox.appendChild(form);

        // Footer Action Buttons
        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.justifyContent = 'flex-end';
        footer.style.gap = '10px';
        footer.style.marginTop = '8px';

        const btnCancel = document.createElement('button');
        btnCancel.id = 'modal-world-cancel';
        btnCancel.innerText = 'Cancel';
        btnCancel.style.background = '#45236b';
        btnCancel.style.color = '#efdbff';
        btnCancel.style.border = '2px solid #180034';
        btnCancel.style.borderRadius = '12px';
        btnCancel.style.padding = '10px 18px';
        btnCancel.style.fontFamily = "'Fredoka', sans-serif";
        btnCancel.style.fontWeight = 'bold';
        btnCancel.style.cursor = 'pointer';
        btnCancel.addEventListener('click', () => backdrop.remove());

        const btnSave = document.createElement('button');
        btnSave.id = 'modal-world-save';
        btnSave.innerText = '💾 Save World';
        btnSave.style.background = '#39ff14';
        btnSave.style.color = '#053900';
        btnSave.style.border = '2px solid #095300';
        btnSave.style.borderRadius = '12px';
        btnSave.style.padding = '10px 22px';
        btnSave.style.fontFamily = "'Fredoka', sans-serif";
        btnSave.style.fontWeight = 'bold';
        btnSave.style.fontSize = '14px';
        btnSave.style.cursor = 'pointer';
        btnSave.addEventListener('click', () => {
            worldObj.name = inputName.value.trim() || worldObj.name;
            worldObj.subtitle = inputSubtitle.value.trim();

            try {
                localStorage.setItem('ptt_custom_worlds', JSON.stringify(GameConfig.WORLDS));
            } catch (e) {}

            backdrop.remove();
            this.createUIOverlay();
        });

        footer.appendChild(btnCancel);
        footer.appendChild(btnSave);
        modalBox.appendChild(footer);

        backdrop.appendChild(modalBox);
        document.body.appendChild(backdrop);

        header.querySelector('#btn-modal-close').addEventListener('click', () => backdrop.remove());
    }
}
