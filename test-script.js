const fs = require('fs');
const content = fs.readFileSync('./js/config.js', 'utf8');
const vm = require('vm');
const context = {};
vm.createContext(context);
vm.runInContext(content, context);

console.log(context.LEVEL_2_CONFIG.TIER_ENTITIES[2]);
