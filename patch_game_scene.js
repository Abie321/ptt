const fs = require('fs');
let content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');

// Replace spawn tier entities logic with console logs
content = content.replace(
    /foundSpot = true;/g,
    `foundSpot = true;
                    // Log spawn info
                    console.log(\`[SPAWN] Tier: \${tier}, Type: \${entityConfig.type}, isHazard: \${entityConfig.isHazard}, x: \${x.toFixed(2)}, y: \${y.toFixed(2)}, bgScaleRatio: \${bgScaleRatio}, bounds: \${world.WIDTH}x\${world.HEIGHT}\`);`
);

const edibleReplace = `                    // Reposition
                    const oldX = item.x;
                    const oldY = item.y;
                    item.x *= repositionRatio;
                    item.y *= repositionRatio;
                    console.log(\`[REPOSITION EDIBLE] Tier \${tier}, \${item.itemData ? item.itemData.type : 'unknown'}, old: (\${oldX.toFixed(2)}, \${oldY.toFixed(2)}), new: (\${item.x.toFixed(2)}, \${item.y.toFixed(2)}), repositionRatio: \${repositionRatio.toFixed(3)}\`);`;

content = content.replace(
    /                    \/\/ Reposition\s+item\.x \*= repositionRatio;\s+item\.y \*= repositionRatio;/g,
    edibleReplace
);

const hazardReplace = `                // Reposition
                const oldX = hazard.x;
                const oldY = hazard.y;
                hazard.x *= repositionRatio;
                hazard.y *= repositionRatio;
                console.log(\`[REPOSITION HAZARD] \${hazard.hazardData ? hazard.hazardData.type : 'unknown'}, old: (\${oldX.toFixed(2)}, \${oldY.toFixed(2)}), new: (\${hazard.x.toFixed(2)}, \${hazard.y.toFixed(2)}), repositionRatio: \${repositionRatio.toFixed(3)}\`);`;

content = content.replace(
    /                \/\/ Reposition\s+hazard\.x \*= repositionRatio;\s+hazard\.y \*= repositionRatio;/g,
    hazardReplace
);

fs.writeFileSync('js/scenes/GameScene.js', content, 'utf8');
