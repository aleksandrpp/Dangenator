const SPEED = 100
const COLLIDER_SIZE = 50

export class Controller {
    #physic = undefined

    constructor(view) {
        this.#physic = view.scene.physics.add.existing(view)

        this.#physic.body.setSize(COLLIDER_SIZE, COLLIDER_SIZE)
        this.#physic.body.isCircle = true

        view.scene.physics.add.collider(this.#physic, view.scene.physicWorld)

        this.dir = 'south'
    }

    update(input) {
        this.#physic.body.setVelocity(0)

        if (input.up.isDown) {
            this.#physic.body.setVelocityY(-SPEED)
            this.dir = 'north'
        } else if (input.down.isDown) {
            this.#physic.body.setVelocityY(SPEED)
            this.dir = 'south'
        }

        if (input.left.isDown) {
            this.#physic.body.setVelocityX(-SPEED)
            this.dir = 'west'
        } else if (input.right.isDown) {
            this.#physic.body.setVelocityX(SPEED)
            this.dir = 'east'
        }

        this.motion = this.#physic.body.velocity.length() === 0 ? 'idle' : 'walk'

        if (input.space.isDown) {
            this.#physic.body.setVelocity(0)
            this.motion = 'attack'
        }

        this.#physic.body.velocity.limit(SPEED)
    }

    dispose() {
        //?
    }
}
