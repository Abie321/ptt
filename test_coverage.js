const tables = [{x: 700, y: 400}, {x: 700, y: 1000}, {x: 2000, y: 400}, {x: 2000, y: 1000}];
let covered = 0;
let total = 0;
for (let x = 0; x <= 2800; x += 10) {
    for (let y = 0; y <= 1450; y += 10) {
        total++;
        let isCovered = false;
        for (let table of tables) {
            let dist = Math.sqrt(Math.pow(x - table.x, 2) + Math.pow(y - table.y, 2));
            if (dist < 1000) {
                isCovered = true;
                break;
            }
        }
        if (isCovered) covered++;
    }
}
console.log(`Covered: ${covered}, Total: ${total}`);
