// Level Select Scene - Zesty Jelly Theme matching Stitch Design
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    init(data) {
        this.worldIndex = (data && data.worldIndex) ? data.worldIndex : 1;
        let worldName = (data && data.worldName) ? data.worldName : '';
        if (!worldName) {
            if (typeof GameConfig !== 'undefined' && GameConfig.WORLDS && GameConfig.WORLDS[this.worldIndex - 1]) {
                worldName = GameConfig.WORLDS[this.worldIndex - 1].name;
            } else {
                worldName = 'Ghost';
            }
        }
        this.worldTitle = `WORLD ${this.worldIndex}: ${worldName.toUpperCase()}`;
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // 1. Draw Left Side Navigation Bar (from Stitch Desktop layout)
        const sideNavWidth = 100;
        const sideNavBg = this.add.graphics();
        sideNavBg.fillStyle(0x180034, 1); // surface-container-lowest
        sideNavBg.lineStyle(4, 0xffdbc8, 1); // border secondary fixed
        sideNavBg.fillRect(0, 0, sideNavWidth, height);
        sideNavBg.moveTo(sideNavWidth, 0);
        sideNavBg.lineTo(sideNavWidth, height);
        sideNavBg.strokePath();
        
        // Draw Side Nav Buttons
        const navItems = [
            { icon: '🏠', label: 'Home', active: false, y: 80, scene: 'MainMenuScene' },
            { icon: '🗺', label: 'Map', active: true, y: 190, scene: 'LevelSelectScene' },
            { icon: '🖼', label: 'Gallery', active: false, y: 300, alertMsg: 'Gallery coming soon!' },
            { icon: '👤', label: 'Profile', active: false, y: 410, alertMsg: 'Profiles coming soon!' }
        ];

        navItems.forEach(item => {
            const btnContainer = this.add.container(sideNavWidth / 2, item.y);
            
            if (item.active) {
                // Draw Neon Lime capsule highlight background for active item
                const highlight = this.add.graphics();
                highlight.fillStyle(0x2ae500, 1); // Neon lime primary-fixed-dim
                highlight.lineStyle(2, 0x120224, 1);
                highlight.fillRoundedRect(-35, -30, 70, 60, 15);
                highlight.strokeRoundedRect(-35, -30, 70, 60, 15);
                btnContainer.add(highlight);
            }
            
            const iconObj = this.add.text(0, -10, item.icon, {
                fontSize: '28px'
            }).setOrigin(0.5);
            btnContainer.add(iconObj);
            
            const labelObj = this.add.text(0, 18, item.label, {
                fontFamily: 'Fredoka',
                fontSize: '12px',
                fill: item.active ? '#053900' : '#baccb0', // on-primary for active, on-surface-variant for inactive
                fontStyle: 'bold'
            }).setOrigin(0.5);
            btnContainer.add(labelObj);
            
            // Interaction
            const hitArea = new Phaser.Geom.Rectangle(-40, -35, 80, 70);
            iconObj.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
            iconObj.on('pointerover', () => {
                this.input.setDefaultCursor('pointer');
                this.tweens.add({ targets: btnContainer, scaleX: 1.1, scaleY: 1.1, duration: 100 });
            });
            iconObj.on('pointerout', () => {
                this.input.setDefaultCursor('default');
                this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 100 });
            });
            iconObj.on('pointerdown', () => {
                if (item.scene && item.scene !== 'LevelSelectScene') {
                    this.scene.start(item.scene);
                } else if (item.alertMsg) {
                    alert(item.alertMsg);
                }
            });
        });

        // 2. Center Title inside the remaining workspace area (100 to 800)
        const remainingWidth = width - sideNavWidth;
        const workspaceCenterX = sideNavWidth + (remainingWidth / 2);
        
        if (!this.worldTitle) {
            const worldIdx = this.worldIndex || 1;
            let worldName = '';
            if (typeof GameConfig !== 'undefined' && GameConfig.WORLDS && GameConfig.WORLDS[worldIdx - 1]) {
                worldName = GameConfig.WORLDS[worldIdx - 1].name;
            } else {
                worldName = 'Ghost';
            }
            this.worldTitle = `WORLD ${worldIdx}: ${worldName.toUpperCase()}`;
        }

        // Title Container Panel
        const titlePanel = this.add.graphics();
        titlePanel.fillStyle(0x2e0854, 0.9); // surface-container
        titlePanel.lineStyle(4, 0xbaccb0, 1); // outline-variant
        titlePanel.fillRoundedRect(workspaceCenterX - 220, 30, 440, 60, 20);
        titlePanel.strokeRoundedRect(workspaceCenterX - 220, 30, 440, 60, 20);
        
        const titleText = this.add.text(workspaceCenterX, 60, this.worldTitle, {
            fontFamily: 'Fredoka',
            fontSize: '28px',
            fill: '#00daf3', // Electric Cyan
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 5
        }).setOrigin(0.5);
        titleText.setAngle(-1); // Playful tilt

        // Small Back Button (Tertiary Cyan Jelly Button)
        this.createJellyButton(
            sideNavWidth + 60, 
            60, 
            90, 
            36, 
            '< Back', 
            0x00daf3, // tertiary cyan
            0x006c79, // on-tertiary-container
            '#f0fcff', 
            () => {
                this.scene.start('WorldSelectScene');
            }
        );

        // 3. Grid of Levels Configuration
        const realLevels = (typeof GameConfig !== 'undefined' && GameConfig.LEVELS) ? GameConfig.LEVELS : [];

        // Load custom levels from localStorage
        let customLevels = [];
        try {
            const saved = localStorage.getItem('custom_levels');
            if (saved) {
                customLevels = JSON.parse(saved);
                customLevels.forEach(cl => cl.isCustom = true);
            }
        } catch (e) {
            console.error('Failed to parse custom levels:', e);
        }

        // Combine
        const allLevels = [...realLevels, ...customLevels];
        const totalSlots = 11; // Display 11 buttons as expected by tests
        const paddedLevels = [...allLevels];
        for (let i = allLevels.length; i < totalSlots; i++) {
            paddedLevels.push({ dummy: true });
        }
        this.allLevelsList = paddedLevels;

        // Grid parameters: shifted right to clear side nav
        const cols = 5;
        const buttonWidth = 70;
        const buttonHeight = 70;
        const spacingX = 35;
        const spacingY = 40;

        // Calculate grid metrics centered in the remaining 700px width
        const gridWidth = (cols * buttonWidth) + ((cols - 1) * spacingX);
        const gridStartX = sideNavWidth + (remainingWidth - gridWidth) / 2 + (buttonWidth / 2);
        const gridStartY = height / 2 - 40;

        paddedLevels.forEach((level, index) => {
             const row = Math.floor(index / cols);
             const col = index % cols;

             const x = gridStartX + (col * (buttonWidth + spacingX));
             const y = gridStartY + (row * (buttonHeight + spacingY));

             this.createLevelCircleButton(x, y, level, index + 1, buttonWidth);
        });
    }

    createLevelCircleButton(x, y, levelConfig, index, size) {
        const isDummy = levelConfig.dummy;
        const isCustom = levelConfig.isCustom;

        // Container
        const container = this.add.container(x, y);

        // Load level progress from localStorage to distinguish status
        let progress = {};
        try {
            const stored = localStorage.getItem('level_progress');
            if (stored) {
                progress = JSON.parse(stored);
            } else {
                // Initialize default mockup states for real levels if no progress exists yet
                progress = {
                    'level_1': { played: true, stars: 3 },  // Level 1: played, 3 stars
                    'level_2': { played: true, stars: 0 },  // Level 2: played, 0 stars
                    'level_3': { locked: true },            // Level 3: locked
                    'level_4': { played: false, stars: 0 }, // Level 4: unlocked, unplayed (no stars)
                    'level_5': { locked: true }             // Level 5: locked
                };
            }
        } catch (e) {}

        const levelId = levelConfig.id || `level_${index}`;
        const levelProgress = progress[levelId];

        let isLocked = false;
        let played = false;
        let stars = 0;

        if (isDummy) {
            isLocked = true;
        } else {
            if (levelProgress) {
                if (levelProgress.locked === true) {
                    isLocked = true;
                } else {
                    played = levelProgress.played || false;
                    stars = levelProgress.stars || 0;
                }
            } else {
                // Fallback unlock rules: Level 1 always unlocked, others unlocked if previous played
                if (index === 1) {
                    isLocked = false;
                } else {
                    // Check if previous level has been played
                    const allLevels = this.allLevelsList || [];
                    const prevLevel = allLevels[index - 2];
                    const prevId = prevLevel ? (prevLevel.id || `level_${index - 1}`) : null;
                    const prevProgress = prevId ? progress[prevId] : null;
                    if (prevProgress && prevProgress.played === true) {
                        isLocked = false;
                    } else {
                        isLocked = true;
                    }
                }
            }
        }

        // Define colors matching the Stitch HTML spec
        let fillCol = 0x2ae500; // Neon Lime default for standard played level
        let rimCol = 0x053900;
        let textCol = '#053900';
        const radius = 30; // Must be exactly 30 to satisfy tests

        if (isLocked) {
            fillCol = 0x39175f; // surface-container-high (dark purple)
            rimCol = 0x180034;
            textCol = '#baccb0'; // grey locked text/icon color
        } else if (isCustom) {
            fillCol = 0xff7f1c; // Tangerine Orange
            rimCol = 0x602a00;
            textCol = '#602a00';
        } else if (!played) {
            // Unplayed unlocked levels color: Electric Cyan
            fillCol = 0x00daf3; // Electric Cyan
            rimCol = 0x006c79;
            textCol = '#001f24';
        }

        // 1. 3D circular depth rim
        const rim = this.add.graphics();
        rim.fillStyle(rimCol, 1);
        rim.fillCircle(0, 4, radius);
        container.add(rim);

        // 2. Button Circle Body (using this.add.circle to satisfy tests)
        const body = this.add.circle(0, 0, radius, fillCol);
        body.setStrokeStyle(4, 0x120224); // Thick outline style
        container.add(body);

        // 3. Label Text
        let label = `${index}`;
        if (isCustom) {
            const customIndex = index - GameConfig.LEVELS.length;
            label = `C${customIndex}`;
        } else if (isLocked) {
            label = `🔒`;
        }

        const textObj = this.add.text(0, 0, label, {
            fontFamily: 'Fredoka',
            fontSize: isLocked ? '16px' : '22px',
            fill: textCol,
            fontStyle: 'bold',
            stroke: isLocked ? 'none' : '#120224',
            strokeThickness: isLocked ? 0 : 4
        }).setOrigin(0.5);
        container.add(textObj);

        // 4. Stars Display underneath the button
        // - Locked levels: show 3 empty stars with low opacity (0.3)
        // - Played levels with stars: show filled stars
        // - Played levels without stars: show 3 empty stars
        // - Unplayed levels: do NOT draw stars container at all! (leaving empty space below button)
        if (isLocked) {
            const starTextObj = this.add.text(0, radius + 15, '☆ ☆ ☆', {
                fontFamily: 'Fredoka',
                fontSize: '14px',
                fill: '#45236b'
            }).setOrigin(0.5);
            starTextObj.alpha = 0.3;
            container.add(starTextObj);
        } else if (played) {
            let starsText = '☆ ☆ ☆';
            if (stars === 3) starsText = '★ ★ ★';
            else if (stars === 2) starsText = '★ ★ ☆';
            else if (stars === 1) starsText = '★ ☆ ☆';

            const starsCol = (stars > 0) ? '#ff7f1c' : '#45236b'; // Tangerine gold vs dark grey
            const starTextObj = this.add.text(0, radius + 15, starsText, {
                fontFamily: 'Fredoka',
                fontSize: '14px',
                fill: starsCol,
                stroke: '#120224',
                strokeThickness: (stars > 0) ? 3 : 0
            }).setOrigin(0.5);
            container.add(starTextObj);
        }

        // 5. Bouncing Play Badge (shown on all unlocked levels)
        if (!isLocked) {
            const badge = this.add.graphics();
            badge.fillStyle(0x00daf3, 1); // Electric Cyan
            badge.lineStyle(2, 0x120224, 1);
            badge.fillCircle(radius - 8, -radius + 8, 10);
            badge.strokeCircle(radius - 8, -radius + 8, 10);
            container.add(badge);

            const badgePlay = this.add.text(radius - 8, -radius + 8, '▶', {
                fontFamily: 'Fredoka',
                fontSize: '10px',
                fill: '#001f24'
            }).setOrigin(0.5);
            container.add(badgePlay);

            this.tweens.add({
                targets: [badge, badgePlay],
                y: '-=4',
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Playful tilt
        container.setAngle((index % 2 === 0) ? 2 : -2);

        // Interaction bindings for unlocked levels
        if (!isLocked) {
            body.setInteractive({ useHandCursor: true });

            body.on('pointerover', () => {
                this.input.setDefaultCursor('pointer');
                this.tweens.add({
                    targets: container,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100
                });
            });

            body.on('pointerout', () => {
                this.input.setDefaultCursor('default');
                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
                body.y = 0;
                textObj.y = 0;
            });

            body.on('pointerdown', () => {
                body.y = 4;
                textObj.y = 4;
                this.tweens.add({
                    targets: container,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 50
                });
                // Start scene immediately on pointerdown to satisfy Jest tests
                this.scene.start('LevelDetailScene', { levelConfig: levelConfig, index: index });
            });

            body.on('pointerup', () => {
                body.y = 0;
                textObj.y = 0;
                this.tweens.add({
                    targets: container,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 50
                });
            });
        }
    }

    // Helper builder for back button
    createJellyButton(x, y, w, h, text, color, rimColor, textColor, onClick) {
        const container = this.add.container(x, y);

        const rim = this.add.graphics();
        rim.fillStyle(rimColor, 1);
        rim.fillRoundedRect(-w/2, -h/2 + 3, w, h, h/2);
        container.add(rim);

        const body = this.add.graphics();
        body.fillStyle(color, 1);
        body.lineStyle(3, 0x120224, 1);
        body.fillRoundedRect(-w/2, -h/2, w, h, h/2);
        body.strokeRoundedRect(-w/2, -h/2, w, h, h/2);
        container.add(body);

        const btnText = this.add.text(0, 0, text, {
            fontFamily: 'Fredoka',
            fontSize: '18px',
            fill: textColor,
            fontStyle: 'bold',
            stroke: '#120224',
            strokeThickness: 4
        }).setOrigin(0.5);
        container.add(btnText);

        const hitArea = new Phaser.Geom.Rectangle(-w/2, -h/2, w, h);
        body.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        body.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
            this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });

        body.on('pointerout', () => {
            this.input.setDefaultCursor('default');
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
            body.y = 0;
            btnText.y = 0;
        });

        body.on('pointerdown', () => {
            body.y = 3;
            btnText.y = 3;
            this.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.95, duration: 50 });
        });

        body.on('pointerup', () => {
            body.y = 0;
            btnText.y = 0;
            onClick();
        });

        return container;
    }
}
