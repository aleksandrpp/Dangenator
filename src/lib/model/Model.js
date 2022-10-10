export class Model {
    #data = {}

    constructor(data) {
        this.#data = data
    }

    get(key) {
        return this.#data[key]
    }
}
