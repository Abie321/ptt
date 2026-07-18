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
    }

    init(data) {
        // Restore layout from playtest if returning
        if (data && data.restoreLayout && data.levelConfig) {
            this.levelConfig = data.levelConfig;
            // Clean up playtest flag in the editing copy
            this.levelConfig.isPlaytest = false;
        } else {
            // Default initial configuration
            this.levelConfig = {
                id: 'custom_level_' + Date.now(),
                name: 'My Custom Level',
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
        this.navText = this.add.text(10, 10, 'Use WASD or Arrows to scroll map\nLeft-click to place entity\nDrag to move | Right-click to delete', {
            fontSize: '16px',
            fill: '#fff',
            backgroundColor: '#000',
            padding: { x: 5, y: 5 }
        }).setDepth(1000).setScrollFactor(0);

        // Background / World Setup
        this.setupWorld();

        // Keyboard panning controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

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

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            cam.scrollX = Math.max(cam.scrollX - scrollSpeed, 0);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            cam.scrollX = Math.min(cam.scrollX + scrollSpeed, cam.worldView.width);
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            cam.scrollY = Math.max(cam.scrollY - scrollSpeed, 0);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
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
    }

    placeEntity(worldX, worldY) {
        let x = worldX;
        let y = worldY;

        if (this.snapToGrid) {
            x = Math.round(x / this.gridSize) * this.gridSize;
            y = Math.round(y / this.gridSize) * this.gridSize;
        }

        // Add to active tier entity layout
        if (!this.levelConfig.TIER_ENTITIES[this.currentTier]) {
            this.levelConfig.TIER_ENTITIES[this.currentTier] = [];
        }

        const template = ENTITY_TEMPLATES[this.activeBrush] || {};
        
        // Define a placed instance
        const newEntity = {
            type: this.activeBrush,
            count: 1, // Single placement
            positions: [{ x: x, y: y, rotation: 0 }]
        };

        this.levelConfig.TIER_ENTITIES[this.currentTier].push(newEntity);
        
        // Redraw
        this.redrawEntities();
    }

    deleteAt(worldX, worldY) {
        // Find closest entity within threshold
        const entities = this.levelConfig.TIER_ENTITIES[this.currentTier] || [];
        let closestIndex = -1;
        let closestDist = 50; // Max click radius to delete

        entities.forEach((item, index) => {
            const pos = item.positions && item.positions[0] ? item.positions[0] : item;
            if (pos.x !== undefined && pos.y !== undefined) {
                const dist = Phaser.Math.Distance.Between(worldX, worldY, pos.x, pos.y);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIndex = index;
                }
            }
        });

        if (closestIndex !== -1) {
            entities.splice(closestIndex, 1);
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

        const entities = this.levelConfig.TIER_ENTITIES[this.currentTier] || [];
        
        entities.forEach((item, index) => {
            // Find template for style details
            const template = ENTITY_TEMPLATES[item.type] || {};
            const pos = item.positions && item.positions[0] ? item.positions[0] : item;
            
            if (pos.x === undefined || pos.y === undefined) return;

            const size = template.size || 20;
            const sizeVal = Array.isArray(size) ? size[1] : size;
            const color = template.color || 0x00FF00;
            const isHazard = template.isHazard || false;

            // Draw a graphic representation
            let marker;
            if (template.shape === 'square') {
                marker = this.add.rectangle(pos.x, pos.y, sizeVal * 1.5, sizeVal * 1.5, color);
            } else {
                marker = this.add.circle(pos.x, pos.y, sizeVal, color);
            }

            // Outline style
            marker.setStrokeStyle(2, isHazard ? 0xFF0000 : 0xFFFFFF);
            marker.setAlpha(0.85);

            // Keep reference properties for drag and drop
            marker.entityIndex = index;
            marker.radius = sizeVal;

            // Enable drag on markers
            marker.setInteractive({ draggable: true, useHandCursor: true });
            this.input.setDraggable(marker);

            // Right click delete support
            marker.on('pointerdown', (pointer) => {
                if (pointer.rightButtonDown()) {
                    entities.splice(index, 1);
                    this.redrawEntities();
                }
            });

            // Write tiny label above the marker
            const labelText = this.add.text(pos.x, pos.y - sizeVal - 12, item.type, {
                fontSize: '11px',
                fill: '#fff',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: { x: 3, y: 1 }
            }).setOrigin(0.5);

            marker.labelText = labelText;
            this.visualEntities.push(marker);
        });
    }

    createUIOverlay() {
        // Destroy existing DOM panel if any
        const oldPanel = document.getElementById('editor-sidebar');
        if (oldPanel) oldPanel.remove();

        // Create HTML Overlay container
        const overlay = document.createElement('div');
        overlay.id = 'editor-sidebar';
        overlay.style.position = 'absolute';
        overlay.style.top = '10px';
        overlay.style.right = '10px';
        overlay.style.width = '300px';
        overlay.style.maxHeight = '580px';
        overlay.style.overflowY = 'auto';
        overlay.style.background = 'rgba(20, 20, 20, 0.95)';
        overlay.style.border = '2px solid #444';
        overlay.style.color = '#fff';
        overlay.style.padding = '15px';
        overlay.style.borderRadius = '8px';
        overlay.style.fontFamily = 'Arial, sans-serif';
        overlay.style.fontSize = '14px';
        overlay.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '9999';

        // Header
        const header = document.createElement('h3');
        header.innerText = '⚙️ LEVEL EDITOR';
        header.style.marginTop = '0';
        header.style.textAlign = 'center';
        header.style.color = '#2196F3';
        overlay.appendChild(header);

        // Level Name Input
        const labelName = document.createElement('label');
        labelName.innerText = 'Level Name:';
        labelName.style.display = 'block';
        labelName.style.fontWeight = 'bold';
        labelName.style.marginBottom = '4px';
        overlay.appendChild(labelName);

        const inputName = document.createElement('input');
        inputName.type = 'text';
        inputName.value = this.levelConfig.name;
        inputName.style.width = '100%';
        inputName.style.padding = '5px';
        inputName.style.marginBottom = '12px';
        inputName.style.background = '#333';
        inputName.style.color = '#fff';
        inputName.style.border = '1px solid #555';
        inputName.style.borderRadius = '4px';
        inputName.addEventListener('input', (e) => {
            this.levelConfig.name = e.target.value;
        });
        overlay.appendChild(inputName);

        // Win Size Input
        const labelWinSize = document.createElement('label');
        labelWinSize.innerText = 'Win Size (Target Radius):';
        labelWinSize.style.display = 'block';
        labelWinSize.style.fontWeight = 'bold';
        labelWinSize.style.marginBottom = '4px';
        overlay.appendChild(labelWinSize);

        const inputWin = document.createElement('input');
        inputWin.type = 'number';
        inputWin.value = this.levelConfig.winSize;
        inputWin.style.width = '100%';
        inputWin.style.padding = '5px';
        inputWin.style.marginBottom = '12px';
        inputWin.style.background = '#333';
        inputWin.style.color = '#fff';
        inputWin.style.border = '1px solid #555';
        inputWin.style.borderRadius = '4px';
        inputWin.addEventListener('change', (e) => {
            this.levelConfig.winSize = parseInt(e.target.value) || 300;
        });
        overlay.appendChild(inputWin);

        // --- Tier & Background Configuration Section ---
        const tierDivider = document.createElement('hr');
        tierDivider.style.border = '0';
        tierDivider.style.borderTop = '1px solid #444';
        tierDivider.style.margin = '15px 0';
        overlay.appendChild(tierDivider);

        const tierSectionTitle = document.createElement('label');
        tierSectionTitle.innerText = '🗺️ Tiers & Backgrounds:';
        tierSectionTitle.style.display = 'block';
        tierSectionTitle.style.fontWeight = 'bold';
        tierSectionTitle.style.marginBottom = '6px';
        tierSectionTitle.style.color = '#2196F3';
        overlay.appendChild(tierSectionTitle);

        // Tier selection container
        const tierSelectContainer = document.createElement('div');
        tierSelectContainer.style.display = 'flex';
        tierSelectContainer.style.gap = '6px';
        tierSelectContainer.style.marginBottom = '10px';

        const selectTier = document.createElement('select');
        selectTier.style.flex = '1';
        selectTier.style.padding = '5px';
        selectTier.style.background = '#333';
        selectTier.style.color = '#fff';
        selectTier.style.border = '1px solid #555';
        selectTier.style.borderRadius = '4px';

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
        tierSelectContainer.appendChild(selectTier);

        // Add Tier Button
        const btnAddTier = document.createElement('button');
        btnAddTier.textContent = '+ Add';
        btnAddTier.style.padding = '5px 8px';
        btnAddTier.style.background = '#4CAF50';
        btnAddTier.style.color = '#fff';
        btnAddTier.style.border = 'none';
        btnAddTier.style.borderRadius = '4px';
        btnAddTier.style.cursor = 'pointer';
        btnAddTier.style.fontWeight = 'bold';
        btnAddTier.addEventListener('click', () => {
            const newTierNum = this.levelConfig.SIZE_TIERS.length + 1;
            if (newTierNum > 5) {
                alert('Maximum of 5 size tiers allowed.');
                return;
            }
            const prevTier = this.levelConfig.SIZE_TIERS[newTierNum - 2];
            
            const newTierConfig = {
                tier: newTierNum,
                initialSize: prevTier ? prevTier.threshold : 20,
                threshold: prevTier ? Math.round(prevTier.threshold * 2.5) : 100,
                name: 'New Tier',
                color: 0x4CAF50,
                zoom: prevTier ? Math.max(prevTier.zoom * 0.7, 0.5) : 1.0,
                LEVEL_AREA: prevTier ? { ...prevTier.LEVEL_AREA } : { WIDTH: 2000, HEIGHT: 1500 },
                ASSETS: prevTier ? { ...prevTier.ASSETS } : { BACKGROUND_IMAGE: 'assets/images/Level1.png', BACKGROUND_SCALE: 1.0 }
            };

            this.levelConfig.SIZE_TIERS.push(newTierConfig);
            this.levelConfig.TIER_ENTITIES[newTierNum] = [];
            this.currentTier = newTierNum;

            this.setupWorld();
            this.redrawEntities();
            this.createUIOverlay();
        });
        tierSelectContainer.appendChild(btnAddTier);

        // Remove Tier Button
        const btnRemoveTier = document.createElement('button');
        btnRemoveTier.textContent = '- Del';
        btnRemoveTier.style.padding = '5px 8px';
        btnRemoveTier.style.background = '#F44336';
        btnRemoveTier.style.color = '#fff';
        btnRemoveTier.style.border = 'none';
        btnRemoveTier.style.borderRadius = '4px';
        btnRemoveTier.style.cursor = 'pointer';
        btnRemoveTier.style.fontWeight = 'bold';
        btnRemoveTier.addEventListener('click', () => {
            const count = this.levelConfig.SIZE_TIERS.length;
            if (count <= 1) {
                alert('Your level must contain at least 1 size tier.');
                return;
            }

            this.levelConfig.SIZE_TIERS.pop();
            delete this.levelConfig.TIER_ENTITIES[count];

            if (this.currentTier > this.levelConfig.SIZE_TIERS.length) {
                this.currentTier = this.levelConfig.SIZE_TIERS.length;
            }

            this.setupWorld();
            this.redrawEntities();
            this.createUIOverlay();
        });
        tierSelectContainer.appendChild(btnRemoveTier);

        overlay.appendChild(tierSelectContainer);

        // Active Tier config panel
        const tierConfig = this.levelConfig.SIZE_TIERS[this.currentTier - 1] || this.levelConfig.SIZE_TIERS[0];
        
        const tierPanel = document.createElement('div');
        tierPanel.style.background = 'rgba(255,255,255,0.05)';
        tierPanel.style.padding = '10px';
        tierPanel.style.borderRadius = '6px';
        tierPanel.style.border = '1px solid #444';
        tierPanel.style.marginBottom = '12px';

        // Tier Name input
        const divName = document.createElement('div');
        divName.style.marginBottom = '8px';
        divName.innerHTML = `<label style="display:block; font-size:12px; font-weight:bold; margin-bottom:2px;">Tier Label (Name):</label>
                             <input type="text" id="tier-name" value="${tierConfig.name || ''}" style="width:100%; padding:4px; background:#222; color:#fff; border:1px solid #555; border-radius:4px;">`;
        tierPanel.appendChild(divName);

        // Initial Size & Threshold size
        const divSizes = document.createElement('div');
        divSizes.style.display = 'grid';
        divSizes.style.gridTemplateColumns = '1fr 1fr';
        divSizes.style.gap = '8px';
        divSizes.style.marginBottom = '8px';
        divSizes.innerHTML = `
            <div>
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:2px;">Player Size:</label>
                <input type="number" id="tier-init-size" value="${tierConfig.initialSize || 15}" style="width:100%; padding:4px; background:#222; color:#fff; border:1px solid #555; border-radius:4px;">
            </div>
            <div>
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:2px;">Threshold:</label>
                <input type="number" id="tier-threshold" value="${tierConfig.threshold || 50}" style="width:100%; padding:4px; background:#222; color:#fff; border:1px solid #555; border-radius:4px;">
            </div>
        `;
        tierPanel.appendChild(divSizes);

        // Camera Zoom & Background Scale
        const divCamera = document.createElement('div');
        divCamera.style.display = 'grid';
        divCamera.style.gridTemplateColumns = '1fr 1fr';
        divCamera.style.gap = '8px';
        divCamera.style.marginBottom = '8px';
        divCamera.innerHTML = `
            <div>
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:2px;">Camera Zoom:</label>
                <input type="number" step="0.1" id="tier-zoom" value="${tierConfig.zoom || 1.0}" style="width:100%; padding:4px; background:#222; color:#fff; border:1px solid #555; border-radius:4px;">
            </div>
            <div>
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:2px;">Bg Scale:</label>
                <input type="number" step="0.1" id="tier-bg-scale" value="${(tierConfig.ASSETS && tierConfig.ASSETS.BACKGROUND_SCALE) || 1.0}" style="width:100%; padding:4px; background:#222; color:#fff; border:1px solid #555; border-radius:4px;">
            </div>
        `;
        tierPanel.appendChild(divCamera);

        // Area dimensions (Width & Height)
        const divArea = document.createElement('div');
        divArea.style.display = 'grid';
        divArea.style.gridTemplateColumns = '1fr 1fr';
        divArea.style.gap = '8px';
        divArea.style.marginBottom = '8px';
        divArea.innerHTML = `
            <div>
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:2px;">World Width:</label>
                <input type="number" id="tier-area-w" value="${(tierConfig.LEVEL_AREA && tierConfig.LEVEL_AREA.WIDTH) || 1600}" style="width:100%; padding:4px; background:#222; color:#fff; border:1px solid #555; border-radius:4px;">
            </div>
            <div>
                <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:2px;">World Height:</label>
                <input type="number" id="tier-area-h" value="${(tierConfig.LEVEL_AREA && tierConfig.LEVEL_AREA.HEIGHT) || 1200}" style="width:100%; padding:4px; background:#222; color:#fff; border:1px solid #555; border-radius:4px;">
            </div>
        `;
        tierPanel.appendChild(divArea);

        // Background Image select dropdown
        const divBg = document.createElement('div');
        divBg.style.marginBottom = '4px';
        
        const currentBg = (tierConfig.ASSETS && tierConfig.ASSETS.BACKGROUND_IMAGE) || 'none';
        
        divBg.innerHTML = `<label style="display:block; font-size:12px; font-weight:bold; margin-bottom:2px;">Background Image:</label>
                           <select id="tier-bg-select" style="width:100%; padding:4px; background:#222; color:#fff; border:1px solid #555; border-radius:4px;">
                               <option value="assets/images/Level1.png" ${currentBg.includes('Level1.png') ? 'selected' : ''}>Level 1 (Shop - Green)</option>
                               <option value="assets/images/Level2.png" ${currentBg.includes('Level2.png') ? 'selected' : ''}>Level 2 (Floor - Phone)</option>
                               <option value="assets/images/Level4.png" ${currentBg.includes('Level4.png') ? 'selected' : ''}>Level 4 (Castle - Red)</option>
                               <option value="assets/images/Level5.png" ${currentBg.includes('Level5.png') ? 'selected' : ''}>Level 5 (Park - Green)</option>
                               <option value="assets/images/Level6.png" ${currentBg.includes('Level6.png') ? 'selected' : ''}>Level 6 (Pond - Blue)</option>
                               <option value="none" ${currentBg === 'none' ? 'selected' : ''}>No Background Image</option>
                           </select>`;
        tierPanel.appendChild(divBg);

        overlay.appendChild(tierPanel);

        // Bind input listeners
        const inputTierName = overlay.querySelector('#tier-name');
        const inputInitSize = overlay.querySelector('#tier-init-size');
        const inputThreshold = overlay.querySelector('#tier-threshold');
        const inputZoom = overlay.querySelector('#tier-zoom');
        const inputBgScale = overlay.querySelector('#tier-bg-scale');
        const inputAreaW = overlay.querySelector('#tier-area-w');
        const inputAreaH = overlay.querySelector('#tier-area-h');
        const selectBgImage = overlay.querySelector('#tier-bg-select');

        if (inputTierName) inputTierName.addEventListener('input', (e) => {
            tierConfig.name = e.target.value;
            // Update dropdown text immediately
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

        if (inputBgScale) inputBgScale.addEventListener('change', (e) => {
            if (!tierConfig.ASSETS) tierConfig.ASSETS = {};
            tierConfig.ASSETS.BACKGROUND_SCALE = parseFloat(e.target.value) || 1.0;
            this.setupWorld();
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

        const gridDivider = document.createElement('hr');
        gridDivider.style.border = '0';
        gridDivider.style.borderTop = '1px solid #444';
        gridDivider.style.margin = '15px 0';
        overlay.appendChild(gridDivider);

        // Grid Snap Settings
        const gridLabel = document.createElement('label');
        gridLabel.style.display = 'block';
        gridLabel.style.marginBottom = '12px';
        gridLabel.innerHTML = `<input type="checkbox" id="snap-chk" ${this.snapToGrid ? 'checked' : ''}> Snap to 50px Grid`;
        overlay.appendChild(gridLabel);

        // Brush/Palette Picker
        const labelBrush = document.createElement('label');
        labelBrush.innerText = 'Select Brush Item:';
        labelBrush.style.display = 'block';
        labelBrush.style.fontWeight = 'bold';
        labelBrush.style.marginBottom = '4px';
        overlay.appendChild(labelBrush);

        const selectBrush = document.createElement('select');
        selectBrush.style.width = '100%';
        selectBrush.style.padding = '5px';
        selectBrush.style.marginBottom = '15px';
        selectBrush.style.background = '#333';
        selectBrush.style.color = '#fff';
        selectBrush.style.border = '1px solid #555';

        // Group categories in dropdown
        const categories = {
            'Edibles 🟢': ["Coin", "Tea drop", "Cookie crumb", "Sugarcube", "Sandwich", "Tea bag", "Cake", "Spoon", "Cup", "Biscuit", "Teapot", "One pound note", "Beans can"],
            'Hazards 🔴': ["Mouse", "Waiter", "Customer", "Goose", "Guard", "King", "Brit", "Tourist", "Cyclist", "Duck", "Swan"],
            'Scenery / Obstacles 📦': ["Chair", "Table", "Counter", "Bush", "Streetlight", "Building, Large", "Building, Small", "Tree", "Awning"]
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
        overlay.appendChild(selectBrush);

        // --- Action Buttons ---
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'grid';
        btnContainer.style.gridTemplateColumns = '1fr 1fr';
        btnContainer.style.gap = '8px';
        btnContainer.style.marginTop = '10px';

        // Playtest Button
        const btnPlay = document.createElement('button');
        btnPlay.innerText = '▶️ Playtest';
        btnPlay.style.background = '#4CAF50';
        btnPlay.style.color = '#fff';
        btnPlay.style.border = 'none';
        btnPlay.style.padding = '10px';
        btnPlay.style.borderRadius = '4px';
        btnPlay.style.cursor = 'pointer';
        btnPlay.style.fontWeight = 'bold';
        btnPlay.addEventListener('click', () => {
            this.playtest();
        });
        btnContainer.appendChild(btnPlay);

        // Export Code Button
        const btnExport = document.createElement('button');
        btnExport.innerText = '📤 Export Code';
        btnExport.style.background = '#FF9800';
        btnExport.style.color = '#fff';
        btnExport.style.border = 'none';
        btnExport.style.padding = '10px';
        btnExport.style.borderRadius = '4px';
        btnExport.style.cursor = 'pointer';
        btnExport.style.fontWeight = 'bold';
        btnExport.addEventListener('click', () => {
            this.exportConfig();
        });
        btnContainer.appendChild(btnExport);

        // Save Layout Button
        const btnSave = document.createElement('button');
        btnSave.innerText = '💾 Save Layout';
        btnSave.style.background = '#2196F3';
        btnSave.style.color = '#fff';
        btnSave.style.border = 'none';
        btnSave.style.padding = '10px';
        btnSave.style.borderRadius = '4px';
        btnSave.style.cursor = 'pointer';
        btnSave.style.fontWeight = 'bold';
        btnSave.addEventListener('click', () => {
            this.saveToStorage();
        });
        btnContainer.appendChild(btnSave);

        // Exit Button
        const btnExit = document.createElement('button');
        btnExit.innerText = '🚪 Exit Editor';
        btnExit.style.background = '#F44336';
        btnExit.style.color = '#fff';
        btnExit.style.border = 'none';
        btnExit.style.padding = '10px';
        btnExit.style.borderRadius = '4px';
        btnExit.style.cursor = 'pointer';
        btnExit.style.fontWeight = 'bold';
        btnExit.addEventListener('click', () => {
            // Clean up sidebar DOM element
            overlay.remove();
            this.scene.start('MainMenuScene');
        });
        btnContainer.appendChild(btnExit);

        overlay.appendChild(btnContainer);

        // Append Code Output Container (initially hidden)
        const outputBox = document.createElement('div');
        outputBox.id = 'export-box';
        outputBox.style.display = 'none';
        outputBox.style.marginTop = '15px';

        const outputLabel = document.createElement('label');
        outputLabel.innerText = 'Copy Config Code:';
        outputLabel.style.display = 'block';
        outputLabel.style.fontWeight = 'bold';
        outputBox.appendChild(outputLabel);

        const txtCode = document.createElement('textarea');
        txtCode.id = 'export-textarea';
        txtCode.style.width = '100%';
        txtCode.style.height = '120px';
        txtCode.style.background = '#222';
        txtCode.style.color = '#00FF00';
        txtCode.style.fontSize = '11px';
        txtCode.style.fontFamily = 'monospace';
        txtCode.readOnly = true;
        txtCode.style.padding = '5px';
        txtCode.style.borderRadius = '4px';
        outputBox.appendChild(txtCode);

        overlay.appendChild(outputBox);

        // Append to parent container of game
        const parent = document.getElementById(this.game.config.parent) || document.body;
        parent.appendChild(overlay);

        // Bind snap checkbox
        document.getElementById('snap-chk').addEventListener('change', (e) => {
            this.snapToGrid = e.target.checked;
        });

        // Keep local reference to overlay
        this.sidebarOverlay = overlay;

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
        
        // Format JS code block
        let code = `// Modular Level Configuration\n\n`;
        code += `GameConfig.registerLevel(${JSON.stringify(cleanConfig, null, 4)});\n`;

        const exportBox = document.getElementById('export-box');
        const txtArea = document.getElementById('export-textarea');
        if (exportBox && txtArea) {
            exportBox.style.display = 'block';
            txtArea.value = code;
            txtArea.select();
        }
    }
}
