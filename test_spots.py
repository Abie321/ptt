from PIL import Image, ImageDraw
import sys

image_path = "assets/images/Level5.png"
output_path = "test_spots.png"

# Coordinates I think are pure grass:
points = [
    # Top Left Park
    (100, 300),
    (100, 400),
    (180, 350),
    (180, 420),

    # Top Right Park (Top Edge)
    (930, 40),
    (960, 90),

    # Middle Right Park (Lake area)
    (650, 310),
    (930, 270),
    (970, 330),

    # Bottom Right Park
    (670, 780),
    (670, 850),
    (790, 810),
    (780, 880),
    (810, 880),

    # Bottom Middle Park
    (340, 830)
]

print(f"Number of points: {len(points)}")

try:
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)
    r = 5
    for (x, y) in points:
        draw.ellipse((x-r, y-r, x+r, y+r), fill="red", outline="white")

    img.save(output_path)
    print(f"Saved {output_path}")
except Exception as e:
    print(e)
