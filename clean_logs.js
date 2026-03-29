const fs = require('fs');
let content = fs.readFileSync('js/scenes/GameScene.js', 'utf8');

content = content.replace(
    /                    \/\/ Log spawn info\n                    console\.log\(\`\[SPAWN\].*?\`\);\n/g,
    ''
);

content = content.replace(
    /                    console\.log\(\`\[REPOSITION EDIBLE\].*?\`\);\n                } else {\n                    console\.log\(\`\[SKIP EDIBLE\].*?\`\);\n                }/g,
    '                }'
);

content = content.replace(
    /                console\.log\(\`\[REPOSITION HAZARD\].*?\`\);\n            } else {\n                console\.log\(\`\[SKIP HAZARD\].*?\`\);\n            }/g,
    '            }'
);

content = content.replace(
    /            console\.log\(\`\[GROUP LOG\].*?\`\);\n/g,
    ''
);

// We also added const oldX/oldY and need to remove them
content = content.replace(
    /                    const oldX = item\.x;\n                    const oldY = item\.y;\n/g,
    ''
);

content = content.replace(
    /                const oldX = hazard\.x;\n                const oldY = hazard\.y;\n/g,
    ''
);

fs.writeFileSync('js/scenes/GameScene.js', content, 'utf8');
