const fs = require('fs');
let content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');

const edibleReplace = `                    // Reposition
                    const oldX = item.x;
                    const oldY = item.y;
                    item.x *= repositionRatio;
                    item.y *= repositionRatio;
                    console.log(\`[REPOSITION EDIBLE] Tier \${tier}, \${item.itemData ? item.itemData.type : 'unknown'}, old: (\${oldX.toFixed(2)}, \${oldY.toFixed(2)}), new: (\${item.x.toFixed(2)}, \${item.y.toFixed(2)}), repositionRatio: \${repositionRatio.toFixed(3)}\`);
                } else {
                    console.log(\`[SKIP EDIBLE] Tier \${tier}, \${item && item.itemData ? item.itemData.type : 'unknown'}, active: \${item ? item.active : 'N/A'}\`);
                }`;

content = content.replace(
    /                    \/\/ Reposition\n                    const oldX = item\.x;\n                    const oldY = item\.y;\n                    item\.x \*= repositionRatio;\n                    item\.y \*= repositionRatio;\n                    console\.log\(\`\[REPOSITION EDIBLE\].*?\`\);\n                }/g,
    edibleReplace
);

const hazardReplace = `                // Reposition
                const oldX = hazard.x;
                const oldY = hazard.y;
                hazard.x *= repositionRatio;
                hazard.y *= repositionRatio;
                console.log(\`[REPOSITION HAZARD] \${hazard.hazardData ? hazard.hazardData.type : 'unknown'}, old: (\${oldX.toFixed(2)}, \${oldY.toFixed(2)}), new: (\${hazard.x.toFixed(2)}, \${hazard.y.toFixed(2)}), repositionRatio: \${repositionRatio.toFixed(3)}\`);
            } else {
                console.log(\`[SKIP HAZARD] \${hazard && hazard.hazardData ? hazard.hazardData.type : 'unknown'}, active: \${hazard ? hazard.active : 'N/A'}\`);
            }`;

content = content.replace(
    /                \/\/ Reposition\n                const oldX = hazard\.x;\n                const oldY = hazard\.y;\n                hazard\.x \*= repositionRatio;\n                hazard\.y \*= repositionRatio;\n                console\.log\(\`\[REPOSITION HAZARD\].*?\`\);\n            }/g,
    hazardReplace
);

fs.writeFileSync('js/scenes/GameScene.js', content, 'utf8');
