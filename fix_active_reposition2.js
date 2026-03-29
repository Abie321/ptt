const fs = require('fs');
let content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');

content = content.replace(
    /items\.forEach\(item => {\n\s*if \(item && item\.active\) {/g,
    `items.forEach(item => {
                if (item) {`
);

content = content.replace(
    /this\.hazards\.getChildren\(\)\.forEach\(hazard => {\n\s*if \(hazard && hazard\.active\) {/g,
    `this.hazards.getChildren().forEach(hazard => {
            if (hazard) {`
);

fs.writeFileSync('js/scenes/GameScene.js', content, 'utf8');
