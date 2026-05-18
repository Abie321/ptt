const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function testSpots() {
    const image = await loadImage('assets/images/Level5.png');
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);

    const points = [
        // Top Left Park (approx 5)
        {x: 100, y: 300},
        {x: 100, y: 400},
        {x: 180, y: 350},
        {x: 180, y: 420},
        {x: 150, y: 370},

        // Top Right Park (approx 2)
        {x: 930, y: 40},
        {x: 960, y: 90},

        // Middle Right Park (approx 3)
        {x: 650, y: 310},
        {x: 930, y: 270},
        {x: 970, y: 330},

        // Bottom Right Park (approx 4)
        {x: 670, y: 780},
        {x: 670, y: 850},
        {x: 790, y: 810},
        {x: 810, y: 880},

        // Bottom Middle Park (approx 1)
        {x: 340, y: 830}
    ];

    console.log(`Number of points: ${points.length}`);

    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('test_spots.png', buffer);
    console.log('Saved test_spots.png');
}

testSpots().catch(console.error);
