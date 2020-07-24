export function haveCollision (a, b) {
    const aPoints = [
        { x: a.x, y: a.y },
        { x: a.x + a.width, y: a.y },
        { x: a.x, y: a.y + a.height },
        { x: a.x + a.width, y: a.y + a.height },
    ]

    for (const {x, y} of aPoints) {
        if (b.x < x && x < b.x + b.width && b.y < y && y < b.y + b.height) {
            return true
        }
    }

    const bPoints = [
        { x: b.x, y: b.y },
        { x: b.x + b.width, y: b.y },
        { x: b.x, y: b.y + b.height },
        { x: b.x + b.width, y: b.y + b.height },
    ]

    for (const {x, y} of bPoints) {
        if (a.x < x && x < a.x + a.width && a.y < y && y < a.y + a.height) {
            return true
        }
    }

    return false
}

export function getRandomFrom (...array) {
    const index = Math.floor(Math.random() * array.length)
    return array[index]
}