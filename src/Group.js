import DisplayObject from './DisplayObject.js'

export default class Group extends DisplayObject {
    constructor (props = {}) {
        super(props)

        this.container = new Set
        this.offsetX = 0
        this.offsetY = 0
    }

    get items () {
        return Array.from(this.container)
    }

    add (...dos) {
        for (const displayObject of dos) {
            this.container.add(displayObject)
        }
    }

    remove (...dos) {
        for (const displayObject of dos) {
            this.container.delete(displayObject)
        }
    }

    update (delta) {
        this.items.forEach(x => x.update(delta))
    }

    draw (context) {
        context.save()
        context.translate(this.offsetX, this.offsetY)
        this.items.forEach(x => x.draw(context))
        context.restore()
    }
}