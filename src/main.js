import Game from './Game.js'
import { loadImage, loadJSON } from './Loader.js'
import Sprite from './Sprite.js'
import Cinematic from './Cinematic.js'
import { haveCollision, getRandomFrom } from './Additional.js'
import DisplayObject from './DisplayObject.js'
import Group from './Group.js'
import Text from './Text.js'

const scale = 3

export default async function main () {
    const game = new Game({
        width: 672,
        height: 800,
        background: 'black'
    })

    const party = new Group()
    party.offsetY = 50
    game.stage.add(party)

    const status = new Text({
        x: game.canvas.width / 2,
        y: 40,
        content: "0 очков",
        fill: 'white',
    })

    status.points = 0
    game.stage.add(status)
    document.body.append(game.canvas)

    const image = await loadImage('/sets/spritesheet.png')
    const atlas = await loadJSON('/sets/atlas.json')
    
    const maze = new Sprite({
        image,
        x: 0,
        y: 0,
        width: atlas.maze.width * scale,
        height: atlas.maze.height * scale,
        frame: atlas.maze
    })
    // game.canvas.width = maze.width
    // game.canvas.height = maze.height
    
    let foods = atlas.maze.foods
        .map(food => ({
            ...food,
            x: food.x * scale,
            y: food.y * scale,
            width: food.width * scale,
            height: food.height * scale,
        }))
        .map(food => new Sprite({
            image,
            frame: atlas.food,
            ...food
        }))
    
    const pacman = new Cinematic({
        image,
        x: atlas.position.pacman.x * scale,
        y: atlas.position.pacman.y * scale,
        width: 13 * scale,
        height: 13 * scale,
        animations: atlas.pacman,
        // debug: true,
        speedX: 1
    })
    pacman.start('right')
    
    const ghosts = ['red', 'pink', 'turquoise', 'banana']
        .map(color => {
            const ghost = new Cinematic({
                image,
                x: atlas.position[color].x * scale,
                y: atlas.position[color].y * scale,
                width: 13 * scale,
                height: 13 * scale,
                animations: atlas[`${color}Ghost`],
                // debug: true,
            })
            ghost.start(atlas.position[color].direction)
            ghost.nextDirection = atlas.position[color].direction
            ghost.isBlue = false
    
            return ghost
        })
    
    const walls = atlas.maze.walls.map(wall => new DisplayObject({
        x: wall.x * scale,
        y: wall.y * scale,
        width: wall.width * scale,
        height: wall.height * scale,
        // debug: true,
    }))
    
    const leftPortal = new DisplayObject({
        x: atlas.position.leftPortal.x * scale,
        y: atlas.position.leftPortal.y * scale,
        width: atlas.position.leftPortal.width * scale,
        height: atlas.position.leftPortal.height * scale,
        // debug: true,
    })
    
    const rightPortal = new DisplayObject({
        x: atlas.position.rightPortal.x * scale,
        y: atlas.position.rightPortal.y * scale,
        width: atlas.position.rightPortal.width * scale,
        height: atlas.position.rightPortal.height * scale,
        // debug: true,
    })
    
    const tablets = atlas.position.tablets
        .map(tablet => new Sprite({
            image,
            frame: atlas.tablet,
            x: tablet.x * scale,
            y: tablet.y * scale,
            width: tablet.width * scale,
            height: tablet.height * scale,
        }))
    
    party.add(maze)
    foods.forEach(food => party.add(food))
    party.add(pacman)
    ghosts.forEach(ghost => party.add(ghost))
    walls.forEach(wall => party.add(wall))
    party.add(leftPortal)
    party.add(rightPortal)
    tablets.forEach(tablet => party.add(tablet))
    
    game.update = () => {
        // Проверка съеденой еды
        const eated = []
        for (const food of foods) {
            if (haveCollision(pacman, food)) {
                eated.push(food)
                party.remove(food)
                status.points += 100
                status.content = `${status.points} очков`
            }
        }
        foods = foods.filter(food => !eated.includes(food))
    
        // Смена направления движения
        changeDirecton(pacman)
        ghosts.forEach(changeDirecton)
    
        // Проверка столкновения призраков со стеной
        for (const ghost of ghosts) {
            if (!ghost.play) {
                return
            }
    
            const wall = getWallCollition(ghost.getNextPosition())
            
            if (wall) {
                ghost.speedX = 0
                ghost.speedY = 0
            }
    
            if ((ghost.speedX === 0 && ghost.speedY === 0) || Math.random() > 0.95) {
                if (ghost.animation.name === 'up') {
                    ghost.nextDirection = getRandomFrom('left', 'right')
                }
    
                else if (ghost.animation.name === 'down') {
                    ghost.nextDirection = getRandomFrom('left', 'right')
                }
    
                else if (ghost.animation.name === 'left') {
                    ghost.nextDirection = getRandomFrom('up', 'down')
                }
    
                else if (ghost.animation.name === 'right') {
                    ghost.nextDirection = getRandomFrom('up', 'down')
                }
            }
    
            if (pacman.play && ghost.play && haveCollision(pacman, ghost)) {
                if (ghost.isBlue) {
                    ghost.play = false
                    ghost.speedX = 0
                    ghost.speedY = 0
                    party.remove(ghost)
                    ghosts.splice(ghosts.indexOf(ghost), 1)

                    status.points += 5000
                    status.content = `${status.points} очков`
                }
    
                else {
                    pacman.speedX = 0
                    pacman.speedY = 0
                    pacman.start('die', {
                        onEnd () {
                            pacman.play = false
                            pacman.stop()
                            party.remove(pacman)
                        }
                    })
                }
    
            }
            
            // Телепортация
            if (haveCollision(ghost, leftPortal)) {
                ghost.x = atlas.position.rightPortal.x * scale - ghost.width - 1
            }
        
            if (haveCollision(ghost, rightPortal)) {
                ghost.x = atlas.position.leftPortal.x * scale + ghost.width + 1
            }
        }
        
        // Проверка столкновения pacman со стеной
        const wall = getWallCollition(pacman.getNextPosition())
        if (wall) {
            pacman.start(`wait${pacman.animation.name}`)
            pacman.speedX = 0
            pacman.speedY = 0
        }
    
        // Телепортация
        if (haveCollision(pacman, leftPortal)) {
            pacman.x = atlas.position.rightPortal.x * scale - pacman.width - 1
        }
    
        if (haveCollision(pacman, rightPortal)) {
            pacman.x = atlas.position.leftPortal.x * scale + pacman.width + 1
        }
    
        // Поедание таблеток
        for (let i = 0; i < tablets.length; i++) {
            const tablet = tablets[i]
    
            if (haveCollision(pacman, tablet)) {
                tablets.splice(i, 1)
                party.remove(tablet)
    
                ghosts.forEach(ghost => {
                    ghost.originalAnimations = ghost.animations
                    ghost.animations = atlas.blueGhost
                    ghost.isBlue = true
                    ghost.start(ghost.animation.name)
                })
    
                setTimeout(() => {
                    ghosts.forEach(ghost => {
                        ghost.animations = ghost.originalAnimations
                        ghost.isBlue = false
                        ghost.start(ghost.animation.name)
                    })
                }, 5000)
                
                break
            }
        }
    }
    
    document.addEventListener('keydown', event => {
        if (!pacman.play) {
            return
        }
    
        if (event.key === "ArrowLeft") {
            pacman.nextDirection = 'left'
        }
    
        else if (event.key === 'ArrowRight') {
            pacman.nextDirection = 'right'
        }
    
        else if (event.key === 'ArrowUp') {
            pacman.nextDirection = 'up'
        }
    
        else if (event.key === 'ArrowDown') {
            pacman.nextDirection = 'down'
        }
    })
    
    function getWallCollition (obj) {
        for (const wall of walls) {
            if (haveCollision(wall, obj)) {
                return wall
            }
        }
    
        return null
    }
    
    function changeDirecton (sprite) {
        if (!sprite.nextDirection) {
            return
        }
    
        if (sprite.nextDirection === 'up') {
            sprite.y -= 10
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = 0
                sprite.speedY = -1
                sprite.start('up')
            }
            sprite.y += 10
        }
    
        else if (sprite.nextDirection === 'down') {
            sprite.y += 10
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = 0
                sprite.speedY = 1
                sprite.start('down')
            }
            sprite.y -= 10
        }
    
        else if (sprite.nextDirection === 'left') {
            sprite.x -= 10
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = -1
                sprite.speedY = 0
                sprite.start('left')
            }
            sprite.x += 10
        }
    
        else if (sprite.nextDirection === 'right') {
            sprite.x += 10
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = 1
                sprite.speedY = 0
                sprite.start('right')
            }
            sprite.x -= 10
        }
    }
}