import {
  BonusInterface,
  EnemyInterface,
  EnemyType,
  ParticleInterface,
  ProjectileInterface
} from '../reducers/canvasReducer'
import { PlayerInterface } from './Player'
import {
  BONUS_BORDER_COLOR,
  BONUS_BORDER_WIDTH,
  BONUS_COLOR,
  BONUS_INNER_RADIUS,
  BONUS_OUTER_RADIUS,
  BONUS_SPIKES, BONUS_TIME,
  ENEMY_TYPE_SPINNING,
  ENEMY_TYPE_SPINNING_TRACKING,
  ENEMY_TYPE_STATIC,
  ENEMY_TYPE_TRACKING,
  MAX_ENEMY_SIZE,
  MIN_ENEMY_SIZE,
  SHOT_SIZE,
  SPIED_ENEMY,
  SPIED_SHOTS,
  xCenter,
  yCenter
} from './constants'
import gsap from 'gsap'
import { calculateObjectVelocity, randomIntFromRange, randomStartPosition } from '../utils/utils'
import { ControllerType } from './controller'
import { obtainPowerUpSound, shootSound } from '../utils/sounds'

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
  shootSound()
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
      color: player.color,
      velocity
    }
    projectiles.push(newProjectile)
  }
}
export const addNewEnemies = (
  enemies: Array<EnemyInterface>
) => {
  const enemySize = randomIntFromRange(MIN_ENEMY_SIZE, MAX_ENEMY_SIZE)
  const enemyColor = `rgba(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, 1)`
  const { xPos, yPos } = randomStartPosition(enemySize)

  const enemySpeed = Math.round((SPIED_ENEMY / enemySize) * 10)
  const enemyVelocity = calculateObjectVelocity(yPos, yCenter, xPos, xCenter, enemySpeed)

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
export const addNewBonus = (bonuses: Array<BonusInterface>) => {
  const { xPos, yPos } = randomStartPosition(BONUS_OUTER_RADIUS)
  const bonusVelocity = calculateObjectVelocity(yPos, yCenter, xPos, xCenter, 1)
  const newBonus = {
    x: xPos,
    y: yPos,
    radius: BONUS_OUTER_RADIUS,
    innerRadius: BONUS_INNER_RADIUS,
    color: BONUS_COLOR,
    time: BONUS_TIME,
    borderColor: BONUS_BORDER_COLOR,
    velocity: bonusVelocity,
    spikes: BONUS_SPIKES,
    borderWidth: BONUS_BORDER_WIDTH
  }
  bonuses.push(newBonus)
}
export const checkIntakeBonus = (
  bonuses: Array<BonusInterface>,
  bonus: BonusInterface,
  player: PlayerInterface,
  controller: ControllerType,
  indexB: number) => {
  const distanceToPlayer = Math.hypot(bonus.x - player.x, bonus.y - player.y)
  if (distanceToPlayer < bonus.radius + player.radius) {
    obtainPowerUpSound()
    removeBonusFromCanvas(bonuses, indexB)
    const originalColor = player.color
    player.color = bonus.color
    player.machineGunMode = true
    setTimeout(() => {
      player.machineGunMode = false
      player.color = originalColor
      controller['Mouse'].pressed = false
    }, bonus.time)
  }
}

export const removeBonusFromCanvas = (bonuses: Array<BonusInterface>, indexB: number) => {
  setTimeout(() => {
    bonuses.splice(indexB, 1)
  }, 0)
}


