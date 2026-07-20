// Asynchronous Configuration Loader Service for JSON Game Setup
class ConfigLoader {
    static async loadAllConfig() {
        try {
            // Load Asset Registry
            const assetsRes = await fetch('data/assets.json');
            if (assetsRes.ok) {
                const assetsData = await assetsRes.json();
                if (typeof window !== 'undefined') {
                    window.GLOBAL_ASSET_REGISTRY = Object.assign({}, window.GLOBAL_ASSET_REGISTRY || {}, assetsData);
                }
            }

            // Load Entities Registry (Edibles, Hazards, Scenery)
            const entitiesRes = await fetch('data/entities.json');
            if (entitiesRes.ok) {
                const entitiesData = await entitiesRes.json();
                if (typeof window !== 'undefined') {
                    window.ENTITY_TEMPLATES = Object.assign({}, window.ENTITY_TEMPLATES || {}, entitiesData);
                }
            }

            // Load Worlds
            const worldsRes = await fetch('data/worlds.json');
            if (worldsRes.ok) {
                const worldsData = await worldsRes.json();
                if (typeof GameConfig !== 'undefined') {
                    GameConfig.WORLDS = worldsData;
                }
            }

            // Load Campaign Levels 1-6
            for (let i = 1; i <= 6; i++) {
                const levelRes = await fetch(`data/levels/level${i}.json`);
                if (levelRes.ok) {
                    const levelData = await levelRes.json();
                    if (typeof GameConfig !== 'undefined') {
                        // Avoid duplicates if already registered
                        const existingIdx = GameConfig.LEVELS.findIndex(l => l.id === levelData.id);
                        if (existingIdx >= 0) {
                            GameConfig.LEVELS[existingIdx] = levelData;
                        } else {
                            GameConfig.registerLevel(levelData);
                        }
                    }
                }
            }

            // Load User Custom Levels from localStorage
            if (typeof localStorage !== 'undefined') {
                const storedCustom = localStorage.getItem('ptt_custom_levels');
                if (storedCustom) {
                    try {
                        const customList = JSON.parse(storedCustom);
                        if (Array.isArray(customList)) {
                            customList.forEach(lvl => GameConfig.registerLevel(lvl));
                        }
                    } catch (e) {}
                }
            }
        } catch (err) {
            console.warn('ConfigLoader async load warning:', err);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigLoader;
}
