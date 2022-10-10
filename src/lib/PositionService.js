import * as Phaser from 'phaser'

export class PositionService {
    #lastPosition = undefined

    constructor() {
        this.#lastPosition = new Phaser.Math.Vector2(0, 0)
    }

    reached(x, y) {
        const position = new Phaser.Math.Vector2(x, y)

        if (position.distance(this.#lastPosition) > 10) {
            this.#lastPosition = position

            return { x, y }
        }

        return false
    }
}
