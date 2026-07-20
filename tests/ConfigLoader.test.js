const ConfigLoader = require('../js/services/ConfigLoader.js');

describe('ConfigLoader', () => {
    beforeEach(() => {
        global.GameConfig = {
            WORLDS: [],
            LEVELS: [],
            registerLevel(data) {
                this.LEVELS.push(data);
            }
        };

        global.fetch = jest.fn().mockImplementation((url) => {
            if (url === 'data/assets.json') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ 'test_item': 'assets/images/test.png' })
                });
            }
            if (url === 'data/entities.json') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ 'Test Entity': { type: 'Test Entity', value: 10 } })
                });
            }
            if (url === 'data/worlds.json') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([{ id: 1, name: 'Ghost', subtitle: 'Test' }])
                });
            }
            if (url.startsWith('data/levels/')) {
                const idStr = url.replace('data/levels/', '').replace('.json', '');
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: idStr, name: `Level ${idStr}` })
                });
            }
            return Promise.reject(new Error('404'));
        });
    });

    test('should asynchronously fetch assets, entities, worlds, and levels into GameConfig', async () => {
        await ConfigLoader.loadAllConfig();

        expect(global.GLOBAL_ASSET_REGISTRY.test_item).toBe('assets/images/test.png');
        expect(global.ENTITY_TEMPLATES['Test Entity'].value).toBe(10);
        expect(global.GameConfig.WORLDS.length).toBe(1);
        expect(global.GameConfig.LEVELS.length).toBe(6);
        expect(global.GameConfig.LEVELS[0].id).toBe('level1');
    });

    test('should merge custom levels from localStorage into GameConfig', async () => {
        const customLevel = { id: 'custom1', name: 'User Level' };
        localStorage.setItem('ptt_custom_levels', JSON.stringify([customLevel]));

        await ConfigLoader.loadAllConfig();

        const loadedCustom = global.GameConfig.LEVELS.find(l => l.id === 'custom1');
        expect(loadedCustom).toBeDefined();
        expect(loadedCustom.name).toBe('User Level');
    });
});
