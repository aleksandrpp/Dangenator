import * as Phaser from 'phaser'

export class View extends Phaser.GameObjects.Image {
    constructor(scene, x, y, type) {
        super(scene, x, y, type)
    }

    updateAnimation(dir, motion) {}
    updatePosition(x, y) {}
}
