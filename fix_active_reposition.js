const fs = require('fs');
let content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');

// Replace edible items loop
content = content.replace(
    /this\.edibleItems\[tier\]\.getChildren\(\)\.forEach\(item => {\n\s*if \(item && item\.active\) {/g,
    `this.edibleItems[tier].getChildren().forEach(item => {
                if (item) {`
);

// Replace hazards loop
content = content.replace(
    /this\.hazards\.getChildren\(\)\.forEach\(hazard => {\n\s*if \(hazard && hazard\.active\) {/g,
    `this.hazards.getChildren().forEach(hazard => {
            if (hazard) {`
);

fs.writeFileSync('js/scenes/GameScene.js', content, 'utf8');
