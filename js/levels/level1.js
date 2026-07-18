// Level 1 Configuration

GameConfig.registerLevel({
    "id": "level1",
    "name": "The Haunted Tea Shop",
    "winSize": 500,
    "coverImage": "assets/images/Comic1.png",
    "SIZE_TIERS": [
        {
            "tier": 1,
            "initialSize": 11,
            "threshold": 10,
            "name": "Micro",
            "color": 5025616,
            "zoom": 2,
            "zoomInStart": 2,
            "LEVEL_AREA": {
                "WIDTH": 1800,
                "HEIGHT": 1000
            },
            "ASSETS": {
                "BACKGROUND_IMAGE": "assets/images/Level1.png",
                "BACKGROUND_SCALE": 2,
                "BACKGROUND_X": 0,
                "BACKGROUND_Y": 0
            }
        },
        {
            "tier": 2,
            "initialSize": 20,
            "threshold": 40,
            "name": "Tiny",
            "color": 2201331,
            "zoom": 2,
            "zoomInStart": 4,
            "LEVEL_AREA": {
                "WIDTH": 2400,
                "HEIGHT": 1000
            },
            "ASSETS": {
                "BACKGROUND_IMAGE": "assets/images/Level1.png",
                "BACKGROUND_SCALE": 1,
                "BACKGROUND_X": 0,
                "BACKGROUND_Y": 0
            }
        },
        {
            "tier": 3,
            "initialSize": 37,
            "threshold": 150,
            "name": "Small",
            "color": 16750592,
            "zoom": 0.5,
            "zoomInStart": 2,
            "LEVEL_AREA": {
                "WIDTH": 2800,
                "HEIGHT": 1450
            },
            "ASSETS": {
                "BACKGROUND_IMAGE": "assets/images/Level1.png",
                "BACKGROUND_SCALE": 1
            }
        }
    ],
    "TIER_ENTITIES": {
        "1": [
            {
                "type": "Tea drop",
                "count": 18
            },
            {
                "type": "Cookie crumb",
                "count": 18
            },
            {
                "type": "Coin",
                "count": 10
            },
            {
                "type": "Sugarcube",
                "count": 10
            }
        ],
        "2": [
            {
                "type": "Sandwich",
                "count": 5
            },
            {
                "type": "Tea bag",
                "count": 5
            },
            {
                "type": "Cake",
                "count": 7,
                "hideInPreviousTier": true
            },
            {
                "type": "Spoon",
                "count": 7
            },
            {
                "type": "Cup",
                "count": 5
            },
            {
                "type": "Biscuit",
                "count": 5
            },
            {
                "type": "Teapot",
                "count": 7,
                "value": 125,
                "size": 125,
                "hideInPreviousTier": true
            },
            {
                "type": "Mouse",
                "count": 5,
                "hideInPreviousTier": true
            },
            {
                "type": "Mouse Spawner"
            }
        ],
        "3": [
            {
                "type": "One pound note",
                "count": 12,
                "value": 200,
                "size": 200
            },
            {
                "type": "Beans can",
                "count": 12,
                "value": 180,
                "size": 180
            },
            {
                "type": "Teapot",
                "count": 7,
                "value": 125,
                "size": 125,
                "hideInPreviousTier": true
            },
            {
                "type": "Chair",
                "count": 2,
                "positions": [
                    {
                        "x": 450,
                        "y": 400,
                        "rotation": 270
                    },
                    {
                        "x": 950,
                        "y": 400,
                        "rotation": 90
                    },
                    {
                        "x": 450,
                        "y": 1000,
                        "rotation": 270
                    },
                    {
                        "x": 950,
                        "y": 1000,
                        "rotation": 90
                    },
                    {
                        "x": 1700,
                        "y": 400,
                        "rotation": 270
                    },
                    {
                        "x": 2250,
                        "y": 400,
                        "rotation": 90
                    },
                    {
                        "x": 1700,
                        "y": 1000,
                        "rotation": 270
                    },
                    {
                        "x": 2250,
                        "y": 1000,
                        "rotation": 90
                    }
                ],
                "value": 300,
                "color": 16771899,
                "hideInPreviousTier": true,
                "size": 300,
                "hitbox": {
                    "width": 150,
                    "height": 150
                }
            },
            {
                "type": "Table",
                "count": 4,
                "positions": [
                    {
                        "x": 700,
                        "y": 400
                    },
                    {
                        "x": 700,
                        "y": 1000
                    },
                    {
                        "x": 2000,
                        "y": 400
                    },
                    {
                        "x": 2000,
                        "y": 1000
                    }
                ],
                "value": 300,
                "shape": "square",
                "color": 16771899,
                "hideInPreviousTier": true,
                "size": 650,
                "image": "table",
                "hitbox": {
                    "width": 400,
                    "height": 200
                }
            },
            {
                "type": "Counter",
                "count": 4,
                "positions": [
                    {
                        "x": 1450,
                        "y": 100
                    }
                ],
                "hideInPreviousTier": true,
                "size": 1200,
                "hitbox": {
                    "width": 600,
                    "height": 200
                }
            },
            {
                "type": "Waiter",
                "count": 5
            },
            {
                "type": "Customer",
                "count": 5
            }
        ]
    }
});
