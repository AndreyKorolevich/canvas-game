import {
  ParticleInterface,
  ProjectileInterface,
  EnemyInterface,
  ADD_ENEMY,
  INCREASE_GAME_NUMBER,
  INCREASE_SCORE,
  SET_MOUSE_POSITION,
  SHOW_FINAL_MODAL,
  START_NEW_GAME,
  ADD_PARTICLES,
  ADD_PROJECTILE,
  REMOVE_PARTICLES,
  REMOVE_PROJECTILE,
  REMOVE_ENEMY,
  UPDATE_ENEMY_POSITION,
  UPDATE_PROJECTILE_POSITION,
  UPDATE_PARTICLE_POSITION,
  SHRINK_ENEMY,
  SET_REFRESH_RATE_MONITOR
} from '../reducers/canvasReducer'
import { ActionTypes, RootStateType, ThunkType } from '../app/store'

import {
  addNewEnemies,
  addParticles, deleteCollision, drawEnemies,
  drawObjectOnCanvas, drawParticles,
  randomIntFromRange, removeParticles, removeProjectileOfScreen, shrinkEnemy
} from '../utils/utils'
import {
  FREQUENCY_APPEAR_ENEMY,
  MAX_ENEMY_SIZE,
  MIDDLE_ENEMY_SIZE,
  MIN_ENEMY_SIZE,
  SHOT_SIZE, SPIED_ENEMY,
  SPIED_SHOTS,
  xCenter,
  yCenter
} from '../game/constants'
import refreshRate from 'refresh-rate'
import gsap from 'gsap'
import { PlayerInterface } from '../game/Player'

export type MousePositionType = {
  x: number
  y: number
}

export const actionsCanvas = {
  setMousePositionAC: (mousePosition: MousePositionType) => ({
    type: SET_MOUSE_POSITION,
    payload: {
      x: mousePosition.x,
      y: mousePosition.y
    }
  } as const),
  increaseScoreAC: () => ({
    type: INCREASE_SCORE
  } as const),
  showFinalModalAC: () => ({
    type: SHOW_FINAL_MODAL
  } as const),
  startNewGameAC: () => ({
    type: START_NEW_GAME
  } as const),
  increaseGameNumberAC: () => ({
    type: INCREASE_GAME_NUMBER
  } as const),

  setRefreshRateMonitor: (refreshRateMonitor: number) => ({
    type: SET_REFRESH_RATE_MONITOR,
    payload: {
      refreshRateMonitor
    }
  } as const)
}

export type CanvasActionTypes = ActionTypes<typeof actionsCanvas>

export const sourceGame = (
  projectiles: Array<ProjectileInterface>,
  enemies: Array<EnemyInterface>,
  particles: Array<ParticleInterface>,
  player: PlayerInterface,
  ctx: CanvasRenderingContext2D,
  requestAnimationId: number,
  refreshCanvas: number
): ThunkType<CanvasActionTypes> => async (dispatch, getState) => {


  // projectiles section
  projectiles.forEach((projectile: ProjectileInterface, indexP: number) => {
    drawObjectOnCanvas(ctx, projectile)

    projectile.x = projectile.x + projectile.velocity.x
    projectile.y = projectile.y + projectile.velocity.y

    removeProjectileOfScreen(projectiles, projectile, indexP)
  })

  // enemies section
  enemies.forEach((enemy: EnemyInterface, indexE: number) => {
    drawEnemies(ctx, enemy, player)

    dispatch(checkFinishGame(enemy, requestAnimationId, player))
    dispatch(manageShot(projectiles, enemies, particles, enemy, indexE))
  })

  //particles section
  particles.forEach((particle, i) => {
    if (particle.alpha > 0) {
      drawParticles(ctx, particle)
    } else {
      removeParticles(particles, i)
    }
  })

  if (refreshCanvas % FREQUENCY_APPEAR_ENEMY === 0) {
    addNewEnemies(enemies)
  }
}


export const manageShot = (
  projectiles: Array<ProjectileInterface>,
  enemies: Array<EnemyInterface>,
  particles: Array<ParticleInterface>,
  enemy: EnemyInterface,
  indexE: number
): ThunkType<CanvasActionTypes> => async (dispatch) => {

  projectiles.forEach((projectile, indexP) => {
    const distance = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y)
    if (distance < projectile.radius + enemy.radius) {
      if (enemy.radius >= MIDDLE_ENEMY_SIZE) {
        shrinkEnemy(projectiles, indexP, enemy)
      } else {
        deleteCollision(projectiles, enemies, indexP, indexE)
      }
      dispatch(actionsCanvas.increaseScoreAC())
      addParticles(enemy, projectile, particles)
    }
  })
}

export const checkFinishGame = (
  enemy: EnemyInterface,
  requestAnimationId: number,
  player: PlayerInterface
): ThunkType<CanvasActionTypes> => async (dispatch, getState) => {
  const distanceToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y)
  if (distanceToPlayer < enemy.radius + player.radius) {
    dispatch(actionsCanvas.showFinalModalAC())
    cancelAnimationFrame(requestAnimationId)
  }
}


export const setRefreshRate = (): ThunkType<CanvasActionTypes> => async dispatch => {
  const refreshRateMonitor = await refreshRate()
  dispatch(actionsCanvas.setRefreshRateMonitor(refreshRateMonitor))
}


