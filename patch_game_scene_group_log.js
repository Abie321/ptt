const fs = require('fs');
let content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');

content = content.replace(
    /for \(let tier = 1; tier <= this.levelConfig.SIZE_TIERS.length; tier\+\+\) {\n            if \(!this.edibleItems\[tier\]\) continue;\n            this.edibleItems\[tier\].getChildren\(\).forEach\(item => {/g,
    `for (let tier = 1; tier <= this.levelConfig.SIZE_TIERS.length; tier++) {
            if (!this.edibleItems[tier]) continue;
            const items = this.edibleItems[tier].getChildren();
            console.log(\`[GROUP LOG] Tier \${tier} has \${items.length} items tracked in group.\`);
            items.forEach(item => {`
);

fs.writeFileSync('js/scenes/GameScene.js', content, 'utf8');
