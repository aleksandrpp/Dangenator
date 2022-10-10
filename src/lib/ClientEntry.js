import { ClientTransport } from './ClientTransport.js'
import { Model } from './model/Model.js'
import { Data } from './model/Data.js'
import { MainScene } from './MainScene.js'
import * as Phaser from 'phaser'
import { SkeletonView } from './SkeletonView.js'
import { Controller } from './Controller.js'
import { Entity } from './Entity.js'

export class ClientEntry {
    #transport = undefined
    #conn = undefined

    #scene = undefined
    #game = undefined
    #input = undefined

    #entities = []

    constructor() {
        this.#scene = new MainScene(
            () => this.created(),
            () => this.updated()
        )

        this.#game = new Phaser.Game({
            type: Phaser.WEBGL,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: '0xababab',
            scale: {
                mode: Phaser.Scale.NONE,
            },
            physics: {
                default: 'arcade',
                arcade: {
                    fps: 60,
                    gravity: { y: 0 },
                    debug: true,
                },
            },
            scene: [this.#scene],
        })
    }

    created() {
        this.#transport = new ClientTransport(
            this.#onopen,
            this.#onmessage,
            this.#onerror,
            this.#onclose
        )

        window.onresize = ev => {
            this.#game.scale.resize(window.innerWidth, window.innerHeight)
            this.#scene.cameras.main.setSize(window.innerWidth, window.innerHeight)
        }

        this.#input = this.#scene.input.keyboard.createCursorKeys()
        this.text = this.#scene.add.text(
            -110,
            235,
            `> press ARROWS for move \n> hold SPACE for attack`,
            { font: '16px Courier', fill: '#E3BB3B' }
        )
        this.text.depth = 99
    }

    updated() {
        this.#entities
            .filter(x => x)
            .forEach(x => {
                if (x.model.get('local_permission').value) {
                    this.updatePosition(x)
                    this.updateAnimation(x)
                }

                x.update(this.#input, 1 / this.#game.loop.delta)
            })

        // this.text.setText(this.#game.loop.actualFps.toFixed())
    }

    updatePosition(x) {
        const position = x.position.reached(x.view.x, x.view.y)

        if (position !== false) {
            x.model.get('position').value = position
            this.#transport.send({
                type: 'position',
                conn: this.#conn,
                value: position,
            })
        }
    }

    updateAnimation(x) {
        const animation = x.animation.reached(x.controller.dir, x.controller.motion)
        if (animation !== false) {
            x.model.get('animation').value = animation
            this.#transport.send({
                type: 'animation',
                conn: this.#conn,
                value: animation,
            })
        }
    }

    removeEntity(conn) {
        this.#entities[conn]?.dispose()
        this.#entities[conn] = undefined
    }

    //#region NETWORK

    #onopen = ev => {
        console.log(`connected`)
    }

    #onmessage = message => {
        switch (message.type) {
            case 'welcome':
                this.onWelcomeMessage(message)
                break
            case 'character':
                if (this.#conn !== message.conn) this.onCharacterMessage(message)
                break
            case 'reply':
                if (this.#conn !== message.conn && !this.#entities[message.conn])
                    this.onReplyMessage(message)
                break
            case 'goodluck':
                this.onGoodluckMessage(message)
                break
            case 'position':
                if (this.#conn !== message.conn) this.onPositionMessage(message)
                break
            case 'animation':
                if (this.#conn !== message.conn) this.onAnimationMessage(message)
                break

            default:
                break
        }
    }

    #onerror = ev => {
        console.log(`error`)
    }

    #onclose = ev => {
        console.log(`disconnected with code ${ev.code}`)
        this.removeEntity(this.#conn || -1)
    }

    //#endregion NETWORK

    //#region COMMANDER

    onWelcomeMessage(message) {
        console.log(`characterize [${message.conn}]`)

        const name = `anon [${message.conn}]`
        const position = { x: 0, y: 400 }
        const animation = { dir: 'south', motion: 'idle' }

        const model = new Model({
            name: new Data(name),
            local_permission: new Data(true),
            position: new Data(position),
            animation: new Data(animation),
        })

        const view = new SkeletonView(this.#scene, position, model)
        this.#entities[message.conn] = new Entity(model, view, new Controller(view))

        this.#conn = message.conn

        this.#transport.send({
            type: 'character',
            conn: message.conn,
            name,
            position,
            animation,
        })
    }

    onCharacterMessage(message) {
        this.onReplyMessage(message)

        const m = this.#entities[this.#conn].model
        this.#transport.send({
            type: 'reply',
            conn: this.#conn,
            name: m.get('name').value,
            position: m.get('position').value,
            animation: m.get('animation').value,
        })
    }

    onReplyMessage(message) {
        const model = new Model({
            name: new Data(message.name),
            local_permission: new Data(false),
            position: new Data(message.position),
            animation: new Data(message.animation),
        })

        const view = new SkeletonView(this.#scene, message.position, model)
        this.#entities[message.conn] = new Entity(model, view, null)
    }

    onPositionMessage(message) {
        this.#entities[message.conn].model.get('position').value = message.value
    }

    onAnimationMessage(message) {
        this.#entities[message.conn].model.get('animation').value = message.value
    }

    onGoodluckMessage(message) {
        this.removeEntity(message.conn)
    }

    //#endregion COMMANDER
}
