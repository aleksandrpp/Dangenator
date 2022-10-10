export class AnimationService {
    #lastDirection = undefined
    #lastMotion = undefined

    constructor() {
        // TODO: Set Initial values
    }

    reached(dir, motion) {
        if (dir != this.#lastDirection || motion != this.#lastMotion) {
            this.#lastDirection = dir
            this.#lastMotion = motion

            return { dir, motion }
        }

        return false
    }
}
