// Test setup and utilities

const fs = require('fs');
const path = require('path');

// Load game configuration
const configPath = path.join(__dirname, '../js/config.js');
const configCode = fs.readFileSync(configPath, 'utf8');
// Replace const declaration with global assignment for testing
const modifiedConfigCode = configCode.replace('const GameConfig =', 'global.GameConfig =');
eval(modifiedConfigCode);

// Mock Phaser for testing
global.Phaser = {
  Scene: class {
    constructor(config) {
      this.config = config;
      this.events = {
        on: jest.fn(),
        emit: jest.fn()
      };
      this.add = {
        circle: jest.fn((x, y, radius, color, alpha) => ({
          x, y, radius, displayWidth: radius * 2, displayHeight: radius * 2,
          setRadius: jest.fn(function(r) { this.radius = r; this.displayWidth = r * 2; }),
          setFillStyle: jest.fn(),
          destroy: jest.fn()
        })),
        rectangle: jest.fn((x, y, w, h, color) => ({
          x, y, width: w, height: h, displayWidth: w, displayHeight: h,
          setOrigin: jest.fn().mockReturnThis(),
          setScrollFactor: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        })),
        triangle: jest.fn((x, y, x1, y1, x2, y2, x3, y3, color) => ({
          x, y, displayWidth: 20, displayHeight: 20,
          destroy: jest.fn()
        })),
        text: jest.fn((x, y, text, style) => ({
          x, y, text,
          setText: jest.fn(function(t) { this.text = t; }),
          setOrigin: jest.fn().mockReturnThis(),
          setScrollFactor: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        })),
        group: jest.fn(() => ({
          add: jest.fn(),
          getChildren: jest.fn(() => []),
          clear: jest.fn()
        }))
      };
      this.physics = {
        add: {
          existing: jest.fn((sprite) => {
            sprite.body = {
              setCollideWorldBounds: jest.fn(),
              setVelocity: jest.fn(),
              setImmovable: jest.fn(),
              setBounce: jest.fn()
            };
          })
        },
        world: {
          setBounds: jest.fn()
        }
      };
      this.cameras = {
        main: {
          setBounds: jest.fn(),
          startFollow: jest.fn(),
          setZoom: jest.fn(),
          shake: jest.fn(),
          flash: jest.fn(),
          width: 800,
          height: 600
        }
      };
      this.input = {
        keyboard: {
          createCursorKeys: jest.fn(() => ({
            up: { isDown: false },
            down: { isDown: false },
            left: { isDown: false },
            right: { isDown: false }
          })),
          addKey: jest.fn((keyCode) => ({ isDown: false })),
          on: jest.fn()
        }
      };
      this.scene = {
        start: jest.fn(),
        pause: jest.fn()
      };
    }
  },
  Math: {
    Between: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    Distance: {
      Between: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    },
    Angle: {
      Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1)
    }
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        W: 87,
        A: 65,
        S: 83,
        D: 68,
        ESC: 27
      }
    }
  }
};

// Helper function to create a mock scene
global.createMockScene = () => new Phaser.Scene({ key: 'TestScene' });

// Helper to simulate key press
global.simulateKeyPress = (key, isDown = true) => {
  key.isDown = isDown;
};
