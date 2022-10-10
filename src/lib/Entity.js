import { AnimationService } from './AnimationService.js'
import { PositionService } from './PositionService.js'

export class Entity {
    constructor(model, view, controller) {
        this.model = model
        this.view = view
        this.controller = controller

        this.animation = new AnimationService()
        this.position = new PositionService()
    }

    update(input, deltaTime) {
        this.controller?.update(input)
        this.view.update(deltaTime)
    }

    dispose() {
        this.controller?.dispose()
        this.view.destroy()
    }
}
