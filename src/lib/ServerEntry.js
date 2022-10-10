import { ServerTransport } from './ServerTransport.js'

export class ServerEntry {
    #transport = undefined

    constructor() {
        this.#transport = new ServerTransport(
            this.#onopen,
            this.#onmessage,
            this.#onerror,
            this.#onclose
        )
    }

    #onopen = conn => {
        console.log(`connected [${conn}]`)
        this.#transport.send(conn, { type: 'welcome', conn: conn })
    }

    #onmessage = message => {
        this.#transport.broadcast(message)
    }

    #onerror = ev => {
        console.log(`error ${ev}`)
    }

    #onclose = (conn, code) => {
        console.log(`disconnected [${conn}] with code ${code}`)
        this.#transport.broadcast({ type: 'goodluck', conn: conn })
    }
}
