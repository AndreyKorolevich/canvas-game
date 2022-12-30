import {
  BonusInterface,
  EnemyInterface,
  GameObjectInterface,
  ParticleInterface
} from '../reducers/canvasReducer'
import { PlayerInterface } from './Player'
import { ENEMY_TYPE_SPINNING, ENEMY_TYPE_SPINNING_TRACKING, ENEMY_TYPE_TRACKING, rgbRegex } from './constants'
import { calculateObjectVelocity, distance } from '../utils/utils'

export const drawCircleOnCanvas = (ctx: CanvasRenderingContext2D, object: GameObjectInterface) => {
  ctx.beginPath()
  ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2, false)
  ctx.fillStyle = object.color
  ctx.fill()
}
export const drawBonusOnCanvas = (ctx: CanvasRenderingContext2D, bonus: BonusInterface) => {
  ctx.beginPath()
  drawStar(bonus.x, bonus.y, bonus.spikes, bonus.radius, bonus.innerRadius, ctx)

  bonus.x = bonus.x - bonus.velocity.x
  bonus.y = bonus.y - bonus.velocity.y

  ctx.closePath()
  ctx.lineWidth = bonus.borderWidth
  ctx.strokeStyle = bonus.borderColor
  ctx.stroke()
  ctx.fillStyle = bonus.color
  ctx.fill()
}
const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, ctx: CanvasRenderingContext2D) => {
  let rot = Math.PI / 2 * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)

}

export const drawParticles = (ctx: CanvasRenderingContext2D, particle: ParticleInterface) => {
  ctx.save()
  ctx.globalAlpha = particle.alpha
  drawCircleOnCanvas(ctx, particle)
  ctx.restore()

  gravityOfFallingObject(particle, 0.004)
}
export const drawEnemies = (
  ctx: CanvasRenderingContext2D,
  enemy: EnemyInterface,
  player: PlayerInterface
) => {
  drawCircleOnCanvas(ctx, enemy)
  enemy.x = enemy.x - enemy.velocity.x
  enemy.y = enemy.y - enemy.velocity.y

  if (enemy.type === ENEMY_TYPE_TRACKING || enemy.type === ENEMY_TYPE_SPINNING_TRACKING) {
    enemy.velocity = calculateObjectVelocity(enemy.y, player.y, enemy.x, player.x, enemy.speed)
  }
  if (enemy.type === ENEMY_TYPE_SPINNING || enemy.type === ENEMY_TYPE_SPINNING_TRACKING) {
    enemy.radians += enemy.spin
    enemy.x = enemy.x + Math.cos(enemy.radians) * 2
    enemy.y = enemy.y + Math.sin(enemy.radians) * 2
  }
}

export const gravityOfFallingObject = (object: ParticleInterface, alpha: number) => {
  object.velocity.x *= object.friction
  object.velocity.y *= object.friction
  object.velocity.y += object.gravity
  object.x = object.x + object.velocity.x
  object.y = object.y + object.velocity.y
  object.alpha -= alpha
}

export const drawBcg = (ctx: CanvasRenderingContext2D, player: PlayerInterface, color: string) => {
  for (let i = 20; i < window.innerHeight; i = i + 40) {
    for (let j = 2; j < document.body.clientWidth; j = j + 40) {
      if (distance(j, i, player.x, player.y) > 150) {
        const colorArr = color.match(rgbRegex)
        const r = colorArr && colorArr[0]
        const g = colorArr && colorArr[1]
        const b = colorArr && colorArr[2]
        const dot = {
          x: j,
          y: i,
          color: `rgba(${r}, ${g}, ${b}, ${0.05})`,
          radius: 3,
          velocity: {
            x: 0,
            y: 0
          }
        }
        drawCircleOnCanvas(ctx, dot)
      } else if(distance(j, i, player.x, player.y) > 100) {
        const dot = {
          x: j,
          y: i,
          color,
          radius: 3,
          velocity: {
            x: 0,
            y: 0
          }
        }
        drawCircleOnCanvas(ctx, dot)
      }

    }
  }

}