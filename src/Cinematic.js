import Sprite from "./Sprite.js";

export default class Cinematic extends Sprite {
    constructor (props = {}) {
        super(props)

        this.animations = props.animations ?? {}
        this.animation = null
        this.cooldown = 0
        this.timer = 0
        this.frameNumber = 0

        this.onEnd = null
    }

    start (name, param = {}) {
        const animation = this.animations.find(x => x.name === name)

        if (animation && this.animation !== animation) {
            this.animation = animation
            this.cooldown = this.animation.duration / this.animation.frames.length
            this.timer = 0
            this.frameNumber = 0
            this.frame = this.animation.frames[0]
        }

        if (param.onEnd) {
            this.onEnd = param.onEnd
        }
    }

    stop () {
        this.animation = null
        this.cooldown = 0
        this.timer = 0
        this.frameNumber = 0
        this.frame = null
    }

    update (delta) {
        super.update(delta)

        if (this.animation) {
            this.timer += delta
    
            if (this.timer >= this.cooldown) {
                this.frameNumber = (this.frameNumber + 1) % this.animation.frames.length
                this.frame = this.animation.frames[this.frameNumber]
                this.timer = 0
    
                if (this.frameNumber === 0 && this.onEnd) {
                    this.onEnd()
                }
            }
        }

    }
}