import * as Phaser from 'phaser'
import { View } from './View.js'

const DIRECTIONS = {
    west: { offset: 0, x: -2, y: 0 },
    northWest: { offset: 32, x: -2, y: -1 },
    north: { offset: 64, x: 0, y: -2 },
    northEast: { offset: 96, x: 2, y: -1 },
    east: { offset: 128, x: 2, y: 0 },
    southEast: { offset: 160, x: 2, y: 1 },
    south: { offset: 192, x: 0, y: 2 },
    southWest: { offset: 224, x: -2, y: 1 },
}

const ANIMATIONS = {
    idle: {
        startFrame: 0,
        endFrame: 4,
        speed: 0.2,
    },
    walk: {
        startFrame: 4,
        endFrame: 12,
        speed: 0.15,
    },
    attack: {
        startFrame: 12,
        endFrame: 20,
        speed: 0.11,
    },
    die: {
        startFrame: 20,
        endFrame: 28,
        speed: 0.2,
    },
    shoot: {
        startFrame: 28,
        endFrame: 32,
        speed: 0.1,
    },
}

const POSITION_SMOOTH_MLP = 2.25
const TEXT_OFFSET = 20

export class SkeletonView extends View {
    #model

    #dir = 'south'
    #motion = 'idle'
    #changed = true

    #targetPosition = undefined
    #position = undefined

    #f = undefined
    #anim = undefined
    #direction = undefined

    #text = undefined

    #positionData = undefined
    #animationData = undefined
    #localData = undefined

    constructor(scene, position, model) {
        super(scene, position.x, position.y, 'skeleton')
        this.#model = model

        this.#positionData = this.#model.get('position')
        this.#animationData = this.#model.get('animation')
        this.#localData = this.#model.get('local_permission')

        this.#targetPosition = new Phaser.Math.Vector2(
            this.#positionData.value.x,
            this.#positionData.value.y
        )
        this.#position = new Phaser.Math.Vector2(
            this.#positionData.value.x,
            this.#positionData.value.y
        )

        this.scene.add.existing(this)

        if (this.#localData.value) {
            this.scene.cameras.main.startFollow(this, true, 0.01, 0.01)
        }

        this.#text = this.scene.add.text(0, 0, model.get('name').value, {
            font: '16px Courier',
            fill: '#ffffff',
        })

        this.subscribe()

        this.changeFrame()
    }

    changeFrame() {
        this.#f++

        if (this.#changed || this.#f === this.#anim.endFrame) {
            this.#changed = false

            this.#anim = ANIMATIONS[this.#motion]
            this.#f = this.#anim.startFrame
            this.#direction = DIRECTIONS[this.#dir]
        }

        this.animate()
    }

    animate() {
        this.frame = this.texture.get(this.#direction.offset + this.#f)
        try {
            this.scene.time.delayedCall(this.#anim.speed * 1000, this.changeFrame, [], this)
        } catch {}
    }

    animationUpdate(fromValue, toValue) {
        this.#dir = toValue.dir
        this.#motion = toValue.motion
        this.#changed = true
    }

    positionUpdate(fromValue, toValue) {
        this.#targetPosition = new Phaser.Math.Vector2(toValue.x, toValue.y)
    }

    update(deltaTime) {
        this.depth = this.y

        this.#text.setPosition(this.x + TEXT_OFFSET, this.y + TEXT_OFFSET)
        this.#text.depth = 9999

        this.#position.lerp(this.#targetPosition, deltaTime * POSITION_SMOOTH_MLP)

        if (!this.#localData.value) {
            this.copyPosition(this.#position)
        }
    }

    destroy() {
        this.unsubscribe()

        this.#text.destroy()
        super.destroy()
    }

    subscribe() {
        this.#positionData.subscribe({ obj: this, func: this.positionUpdate })
        this.#animationData.subscribe({ obj: this, func: this.animationUpdate })
    }

    unsubscribe() {
        this.#positionData.unsubscribe({ obj: this, func: this.positionUpdate })
        this.#animationData.unsubscribe({ obj: this, func: this.animationUpdate })
    }
}
