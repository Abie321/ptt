const fs = require('fs');

let content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');

// I will update the edibleItems section first
// Need to replace the `else if (!entityConfig.isHazard) {` block
// I'll grab it using a simple script to read and modify

let script = `
        const hazardTierExtractor = (hazard) => {
            if (hazard && hazard.hazardData && hazard.hazardData.tier) return hazard.hazardData.tier;
            return 1;
        };
        const itemTierExtractor = (item) => {
            if (item && item.itemData && item.itemData.tier) return item.itemData.tier;
            return 1;
        };
`;
// Let's modify the code by building a regex search and replace
