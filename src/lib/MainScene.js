import * as Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
    constructor(created, updated) {
        super()
        this.physicWorld = []

        this.created = created
        this.updated = updated
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'iso3/isorpg.json')

        this.load.json('data', 'iso3/isorpg.json')
        this.load.spritesheet('tiles', 'iso3/iso-64x64-outside.png', {
            frameWidth: 64,
            frameHeight: 64,
        })

        this.load.spritesheet('skeleton', 'iso3/skeleton8.png', {
            frameWidth: 128,
            frameHeight: 128,
        })
    }

    create() {
        this.loadPhysics()
        this.loadTilesDepth()
        this.created()
    }

    loadPhysics() {
        const map = this.add.tilemap('map')

        for (let o = 0; o < map.layers.length; o++) {
            for (let i = 0; i < map.layers[o].data.length; i++) {
                for (let j = 0; j < map.layers[o].data[i].length; j++) {
                    if (map.layers[o].data[i][j].properties.collide) {
                        const tile = map.layers[o].data[i][j]

                        const collider = this.physics.add
                            .image(tile.pixelX, tile.pixelY, null, null)
                            .setVisible(false)
                            .setOrigin(0.5, 0.5)

                        collider.body.immovable = true
                        this.physicWorld.push(collider)
                    }
                }
            }
        }
    }

    loadTilesDepth() {
        const data = this.cache.json.get('data')

        const tilewidth = data.tilewidth
        const tileheight = data.tileheight

        const tileWidthHalf = tilewidth / 2
        const tileHeightHalf = tileheight / 2

        for (let o = 0; o < data.layers.length; o++) {
            // console.log('LAYER ' + o)

            let i = 0
            let mapwidth = data.layers[o].width
            let mapheight = data.layers[o].height

            for (let y = 0; y < mapheight; y++) {
                for (let x = 0; x < mapwidth; x++) {
                    const tx = (x - y) * tileWidthHalf
                    const ty = (x + y) * tileHeightHalf

                    const id = data.layers[o].data[i] - 1

                    if (id !== -1) {
                        const tile = this.add.image(tx, ty, 'tiles', id)
                        tile.depth = ty - tileheight + (o - 1) * 1000
                    }

                    i++
                }
            }
        }
    }

    update() {
        this.updated()
    }
}
