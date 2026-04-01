const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { runScripts: 'dangerously', resources: 'usable' });
const window = dom.window;
global.window = window;
global.document = window.document;
global.navigator = window.navigator;

const Phaser = require('phaser');

class TestScene extends Phaser.Scene {
    constructor() { super('TestScene'); }
    create() {
        this.myGroup = this.add.group();
        this.myRect = this.add.rectangle(0,0,10,10);
        this.myGroup.add(this.myRect);

        this.events.on('shutdown', () => {
            console.log('shutting down');
            if (this.myGroup) {
                const items = this.myGroup.getChildren();
                [...items].forEach(i => i.destroy());

                // wait, if we manually destroy children, they might be removed from the group implicitly.
                // calling group.destroy(false, false) is what we added.
                this.myGroup.destroy(false, false);
                this.myGroup = null;
            }
        });

        setTimeout(() => {
            console.log('starting next scene');
            this.scene.start('NextScene');
        }, 100);
    }
}

class NextScene extends Phaser.Scene {
    constructor() { super('NextScene'); }
    create() {
        console.log('next scene created');
        setTimeout(() => process.exit(0), 100);
    }
}

const config = {
    type: Phaser.HEADLESS,
    width: 800,
    height: 600,
    scene: [TestScene, NextScene]
};

new Phaser.Game(config);
