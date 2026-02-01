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
  GameObjects: {
    Sprite: class {}
  },
  Scene: class {
    constructor(config) {
      this.config = config;
      this.events = {
        on: jest.fn(),
        emit: jest.fn()
      };
      this.load = {
        image: jest.fn()
      };
      this.textures = {
        exists: jest.fn(() => false),
        get: jest.fn(() => ({
          add: jest.fn()
        })),
        createCanvas: jest.fn(),
        addSpriteSheet: jest.fn()
      };
      this.make = {
          graphics: jest.fn(() => ({
              fillStyle: jest.fn(),
              fillCircle: jest.fn(),
              generateTexture: jest.fn(),
              destroy: jest.fn()
          }))
      };
      this.anims = {
          create: jest.fn(),
          generateFrameNumbers: jest.fn()
      };
      this.add = {
        image: jest.fn((x, y, key) => ({
          x, y, key,
          active: true,
          visible: true,
          setOrigin: jest.fn().mockReturnThis(),
          setScrollFactor: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setActive: jest.fn(function(a) { this.active = a; return this; }),
          setVisible: jest.fn(function(v) { this.visible = v; return this; }),
          destroy: jest.fn(),
          setScale: jest.fn().mockReturnThis(),
          setTint: jest.fn().mockReturnThis(),
          play: jest.fn().mockReturnThis(),
          setRotation: jest.fn().mockReturnThis(),
          anims: {
            play: jest.fn().mockReturnThis()
          }
        })),
        sprite: jest.fn((x, y, key) => {
          const s = new Phaser.GameObjects.Sprite();
          Object.assign(s, {
            x, y, key,
            displayWidth: 20, displayHeight: 20,
            active: true,
            visible: true,
            setOrigin: jest.fn().mockReturnThis(),
            setScrollFactor: jest.fn().mockReturnThis(),
            setDepth: jest.fn().mockReturnThis(),
            setActive: jest.fn(function(a) { this.active = a; return this; }),
            setVisible: jest.fn(function(v) { this.visible = v; return this; }),
            destroy: jest.fn(),
            setScale: jest.fn().mockReturnThis(),
            setTint: jest.fn().mockReturnThis(),
            play: jest.fn().mockReturnThis(),
            setRotation: jest.fn().mockReturnThis(),
            anims: {
              play: jest.fn().mockReturnThis()
            }
          });
          return s;
        }),
        circle: jest.fn((x, y, radius, color, alpha) => ({
          x, y, radius, displayWidth: radius * 2, displayHeight: radius * 2,
          active: true,
          visible: true,
          setRadius: jest.fn(function(r) { this.radius = r; this.displayWidth = r * 2; }),
          setFillStyle: jest.fn(),
          setActive: jest.fn(function(a) { this.active = a; return this; }),
          setVisible: jest.fn(function(v) { this.visible = v; return this; }),
          destroy: jest.fn()
        })),
        rectangle: jest.fn((x, y, w, h, color) => ({
          x, y, width: w, height: h, displayWidth: w, displayHeight: h,
          active: true,
          visible: true,
          setOrigin: jest.fn().mockReturnThis(),
          setScrollFactor: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setActive: jest.fn(function(a) { this.active = a; return this; }),
          setVisible: jest.fn(function(v) { this.visible = v; return this; }),
          destroy: jest.fn()
        })),
        triangle: jest.fn((x, y, x1, y1, x2, y2, x3, y3, color) => ({
          x, y, displayWidth: 20, displayHeight: 20,
          active: true,
          visible: true,
          setActive: jest.fn(function(a) { this.active = a; return this; }),
          setVisible: jest.fn(function(v) { this.visible = v; return this; }),
          destroy: jest.fn()
        })),
        text: jest.fn((x, y, text, style) => ({
          x, y, text,
          active: true,
          visible: true,
          setText: jest.fn(function(t) { this.text = t; }),
          setOrigin: jest.fn().mockReturnThis(),
          setScrollFactor: jest.fn().mockReturnThis(),
          setInteractive: jest.fn().mockReturnThis(),
          on: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setActive: jest.fn(function(a) { this.active = a; return this; }),
          setVisible: jest.fn(function(v) { this.visible = v; return this; }),
          destroy: jest.fn()
        })),
        group: jest.fn(() => ({
          add: jest.fn(),
          getChildren: jest.fn(() => []),
          clear: jest.fn(),
          countActive: jest.fn(() => 0),
          getLength: jest.fn(() => 0)
        })),
        graphics: jest.fn(() => ({
          x: 0, y: 0,
          clear: jest.fn(),
          fillStyle: jest.fn(),
          fillCircle: jest.fn(),
          fillRect: jest.fn(),
          fillTriangle: jest.fn(),
          setScrollFactor: jest.fn(),
          setDepth: jest.fn(),
          active: true,
          visible: true,
          alpha: 1,
          setActive: jest.fn(function(a) { this.active = a; return this; }),
          setVisible: jest.fn(function(v) { this.visible = v; return this; }),
          destroy: jest.fn()
        }))
      };
      this.physics = {
        add: {
          existing: jest.fn((sprite) => {
            sprite.body = {
              setCollideWorldBounds: jest.fn(),
              setVelocity: jest.fn(),
              setImmovable: jest.fn(),
              setBounce: jest.fn(),
              setCircle: jest.fn()
            };
          })
        },
        world: {
          setBounds: jest.fn()
        },
        pause: jest.fn(),
        resume: jest.fn()
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
        pause: jest.fn(),
        restart: jest.fn()
      };
      this.time = {
        delayedCall: jest.fn((delay, callback, args, scope) => {
          // Auto-execute callback for simple tests or store it?
          // For now, just mocking the function is enough to prevent crashes.
          // In specific tests, we can override this implementation.
          return { remove: jest.fn() };
        })
      };
      this.tweens = {
        add: jest.fn((config) => {
          // Execute onComplete immediately if needed? No, let tests handle it.
          return { stop: jest.fn() };
        }),
        killTweensOf: jest.fn()
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
