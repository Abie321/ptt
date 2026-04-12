const fs = require('fs');

function checkOverlap() {
    const LEVEL_AREA = { WIDTH: 2800, HEIGHT: 1450 };
    const tables = [
        {x: 700, y: 400, radius: 650},
        {x: 700, y: 1000, radius: 650},
        {x: 2000, y: 400, radius: 650},
        {x: 2000, y: 1000, radius: 650}
    ];
    const chairs = [
        {x: 450, y: 400, radius: 300},
        {x: 950, y: 400, radius: 300},
        {x: 450, y: 1000, radius: 300},
        {x: 950, y: 1000, radius: 300},
        {x: 1700, y: 400, radius: 300},
        {x: 2250, y: 400, radius: 300},
        {x: 1700, y: 1000, radius: 300},
        {x: 2250, y: 1000, radius: 300}
    ];
    const counters = [
        {x: 1450, y: 100, radius: 700}
    ];

    const existingEntities = [...tables, ...chairs, ...counters];

    let validSpots = 0;
    let totalSpots = 0;

    const testRadius = 350; // Waiter / Customer

    for (let x = 50; x < LEVEL_AREA.WIDTH - 50; x += 10) {
        for (let y = 50; y < LEVEL_AREA.HEIGHT - 50; y += 10) {
            totalSpots++;
            let overlap = false;
            for (let existing of existingEntities) {
                const dist = Math.sqrt(Math.pow(x - existing.x, 2) + Math.pow(y - existing.y, 2));
                if (dist < (testRadius + existing.radius) * 1.1 + 5) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) {
                validSpots++;
            }
        }
    }

    console.log(`Valid spots: ${validSpots} out of ${totalSpots}`);
}

checkOverlap();
