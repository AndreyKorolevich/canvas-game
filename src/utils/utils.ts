import {
  EnemyInterface,
  EnemyType,
  GameObjectInterface,
  ParticleInterface,
  ProjectileInterface
} from '../reducers/canvasReducer'
import gsap from 'gsap'
import {
  ENEMY_TYPE_SPINNING,
  ENEMY_TYPE_SPINNING_TRACKING,
  ENEMY_TYPE_STATIC,
  ENEMY_TYPE_TRACKING,
  MAX_ENEMY_SIZE,
  MIN_ENEMY_SIZE,
  PLAYER_SPED,
  SHOT_SIZE,
  SPIED_ENEMY,
  SPIED_SHOTS,
  xCenter,
  yCenter
} from '../game/constants'
import { PlayerInterface } from '../game/Player'
import { ControllerType } from '../game/controller'

export const randomIntFromRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  const xDist = x2 - x1
  const yDist = y2 - y1

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 * @param velocity
 * @param angle
 */

const rotate = (velocity: { x: number, y: number }, angle: number) => {
  return {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  }
}

export const drawObjectOnCanvas = (ctx: CanvasRenderingContext2D, object: GameObjectInterface) => {
  ctx.beginPath()
  ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2, false)
  ctx.fillStyle = object.color
  ctx.fill()
}

export const removeProjectileOfScreen = (
  projectiles: Array<ProjectileInterface>,
  projectile: ProjectileInterface,
  indexP: number
) => {
  if (projectile.x + projectile.radius > document.body.clientWidth ||
    projectile.x - projectile.radius < 0 ||
    projectile.y - projectile.radius < 0 ||
    projectile.y + projectile.radius > window.innerHeight) {
    setTimeout(() => {
      projectiles.splice(indexP, 1)
    }, 0)
  }
}

export const addParticles = (
  enemy: EnemyInterface,
  projectile: ProjectileInterface,
  particles: Array<ParticleInterface>
) => {
  const angle = Math.atan2(enemy.y - projectile.y, enemy.x - projectile.x)

  const xCollision = enemy.x - (enemy.radius * Math.cos(angle))
  const yCollision = enemy.y - (enemy.radius * Math.sin(angle))
  const particleColor = enemy.color

  for (let i = 0; i < enemy.radius; i++) {
    const particleRadius = Math.random() * 2
    const particleVelocity = {
      x: (Math.random() - 0.5) * (Math.random() * 5),
      y: (Math.random() - 0.5) * (Math.random() * 5)
    }

    const newParticle: ParticleInterface = {
      x: xCollision,
      y: yCollision,
      radius: particleRadius,
      color: particleColor,
      velocity: particleVelocity,
      alpha: 1,
      gravity: 0.005,
      friction: 0.99
    }
    particles.push(newParticle)
  }

}

export const shrinkEnemy = (
  projectiles: Array<ProjectileInterface>,
  indexP: number,
  enemy: EnemyInterface
) => {
  gsap.to(enemy, {
    radius: enemy.radius - 10
  })
  setTimeout(() => {
    projectiles.splice(indexP, 1)
  }, 0)
}

export const removeParticles = (particles: Array<ParticleInterface>, indexP: number) => {
  setTimeout(() => {
    particles.splice(indexP, 1)
  }, 0)
}

export const deleteCollision = (
  projectiles: Array<ProjectileInterface>,
  enemies: Array<EnemyInterface>,
  indexP: number,
  indexE: number
) => {
  setTimeout(() => {
    projectiles.splice(indexP, 1)
    enemies.splice(indexE, 1)
  }, 0)
}

export const addProjectile = (
  projectiles: Array<ProjectileInterface>,
  player: PlayerInterface,
  shootPosition: { x: number, y: number }
) => {
  if (shootPosition.x !== 0 && shootPosition.y !== 0) {
    const angle = Math.atan2(shootPosition.y - player.y, shootPosition.x - player.x)
    const velocity = {
      x: Math.cos(angle) * SPIED_SHOTS,
      y: Math.sin(angle) * SPIED_SHOTS
    }

    const newProjectile: ProjectileInterface = {
      x: player.x,
      y: player.y,
      radius: SHOT_SIZE,
      color: 'white',
      velocity
    }
    projectiles.push(newProjectile)
  }
}


export const addNewEnemies = (
  enemies: Array<EnemyInterface>
) => {
  const enemySize = randomIntFromRange(MIN_ENEMY_SIZE, MAX_ENEMY_SIZE)
  let xPos = 0
  let yPos = 0
  const enemyColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
  if (Math.random() > 0.5) {
    xPos = Math.random() > 0.5 ? (0 - enemySize) : (document.body.clientWidth + enemySize)
    yPos = Math.random() * window.innerHeight
  } else {
    xPos = Math.random() * document.body.clientWidth
    yPos = Math.random() > 0.5 ? (0 - enemySize) : (window.innerHeight + enemySize)
  }

  const enemySpeed = Math.round((SPIED_ENEMY / enemySize) * 10)
  const enemyVelocity = calculateEnemyVelocity(yPos, yCenter, xPos, xCenter, enemySpeed)

  let enemyType: EnemyType = ENEMY_TYPE_STATIC
  const randomEnemy = Math.random()
  if (randomEnemy > 0.9) {
    enemyType = ENEMY_TYPE_SPINNING_TRACKING
  } else if (randomEnemy > 0.7) {
    enemyType = ENEMY_TYPE_SPINNING
  } else if (randomEnemy > 0.4) {
    enemyType = ENEMY_TYPE_TRACKING
  }

  const newEnemy: EnemyInterface = {
    type: enemyType,
    speed: Math.round((SPIED_ENEMY / enemySize) * 10),
    spin: 0.02,
    radians: Math.random() * Math.PI * 2,
    x: xPos,
    y: yPos,
    radius: enemySize,
    color: enemyColor,
    velocity: enemyVelocity
  }
  enemies.push(newEnemy)
}

export const calculateEnemyVelocity = (yStart: number, yEnd: number, xStart: number, xEnd: number, enemySpeed: number) => {
  const angle = Math.atan2(yStart - yEnd, xStart - xEnd)
  return {
    x: Math.cos(angle) * enemySpeed,
    y: Math.sin(angle) * enemySpeed
  }
}

export const drawParticles = (ctx: CanvasRenderingContext2D, particle: ParticleInterface) => {
  ctx.save()
  ctx.globalAlpha = particle.alpha
  drawObjectOnCanvas(ctx, particle)
  ctx.restore()

  particle.velocity.x *= particle.friction
  particle.velocity.y *= particle.friction
  particle.velocity.y += particle.gravity
  particle.x = particle.x + particle.velocity.x
  particle.y = particle.y + particle.velocity.y
  particle.alpha -= 0.002
}

export const drawEnemies = (
  ctx: CanvasRenderingContext2D,
  enemy: EnemyInterface,
  player: PlayerInterface
) => {
  drawObjectOnCanvas(ctx, enemy)
  enemy.x = enemy.x - enemy.velocity.x
  enemy.y = enemy.y - enemy.velocity.y

  if (enemy.type === ENEMY_TYPE_TRACKING || enemy.type === ENEMY_TYPE_SPINNING_TRACKING) {
    enemy.velocity = calculateEnemyVelocity(enemy.y, player.y, enemy.x, player.x, enemy.speed)
  }
  if (enemy.type === ENEMY_TYPE_SPINNING || enemy.type === ENEMY_TYPE_SPINNING_TRACKING) {
    enemy.radians += enemy.spin
    enemy.x = enemy.x + Math.cos(enemy.radians) * 2
    enemy.y = enemy.y + Math.sin(enemy.radians) * 2
  }


}

export const executeMoves = (controller: ControllerType) => {
  Object.keys(controller).forEach(key => {
    if (controller[key].pressed) {
      controller[key].func()
    }
  })
}

export const moveUp = (player: PlayerInterface) => () => {
  if (player.y > player.radius * 2) {
    player.y = player.y - PLAYER_SPED
  }
}

export const moveDown = (player: PlayerInterface) => () => {
  if (player.y < window.innerHeight - player.radius * 2) {
    player.y = player.y + PLAYER_SPED
  }
}

export const moveRight = (player: PlayerInterface) => () => {
  if (player.x < document.body.clientWidth - player.radius * 2) {
    player.x = player.x + PLAYER_SPED
  }
}

export const moveLeft = (player: PlayerInterface) => () => {
  if (player.x > player.radius * 2) {
    player.x = player.x - PLAYER_SPED
  }
}











