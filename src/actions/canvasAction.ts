import {
  ParticleInterface,
  ProjectileInterface,
  EnemyInterface,
  BonusInterface,
  INCREASE_GAME_NUMBER,
  INCREASE_SCORE,
  SET_MOUSE_POSITION,
  SHOW_FINAL_MODAL,
  START_NEW_GAME,
  SET_REFRESH_RATE_MONITOR,
  ADD_POINT,
  HIDE_START_MODAL,
  UPDATE_POINT_POSITIONS,
  DELETE_POINT, UPDATE_COLOR_LAST_KILLED_ENEMY
} from '../reducers/canvasReducer'
import { ActionTypes, ThunkType } from '../app/store'
import {
  BIG_REWORD_FOR_KILLED_ENEMY,
  FREQUENCY_APPEAR_BONUS,
  FREQUENCY_APPEAR_ENEMY,
  FREQUENCY_GUN_SHOT,
  MIDDLE_ENEMY_SIZE,
  SMALL_REWORD_FOR_KILLED_ENEMY
} from '../game/constants'
import refreshRate from 'refresh-rate'
import { PlayerInterface } from '../game/Player'
import { drawEnemies, drawCircleOnCanvas, drawParticles, drawBonusOnCanvas, drawBcg } from '../game/drawObjects'
import {
  addNewBonus,
  addNewEnemies,
  addParticles,
  addProjectile,
  checkIntakeBonus,
  deleteCollision,
  removeParticles,
  removeProjectileOfScreen,
  shrinkEnemy
} from '../game/operationWithObjects'
import { ControllerType } from '../game/controller'
import { PointType } from '../components/Points/Point'
import { endGameSound, enemyEliminatedSound, enemyHitSound } from '../utils/sounds'

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
  increaseScoreAC: (count: number) => ({
    type: INCREASE_SCORE,
    payload: {
      count
    }
  } as const),
  showFinalModalAC: () => ({
    type: SHOW_FINAL_MODAL
  } as const),
  hideStartModalAC: () => ({
    type: HIDE_START_MODAL
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
  } as const),
  addPointAC: (point: PointType) => ({
    type: ADD_POINT,
    payload: {
      point
    }
  } as const),
  deletePointAC: (id: string) => ({
    type: DELETE_POINT,
    payload: {
      id
    }
  } as const),
  updatePointPositionsAC: (id: string) => ({
    type: UPDATE_POINT_POSITIONS,
    payload: {
      id
    }
  } as const),
  updateColorLastKilledEnemyAC: (color: string) => ({
    type: UPDATE_COLOR_LAST_KILLED_ENEMY,
    payload: {
      color
    }
  } as const),
}

export type CanvasActionTypes = ActionTypes<typeof actionsCanvas>

export type SourceGameObjectType = {
  projectiles: Array<ProjectileInterface>,
  enemies: Array<EnemyInterface>,
  particles: Array<ParticleInterface>,
  bonuses: Array<BonusInterface>,
  player: PlayerInterface,
  controller: ControllerType,
  ctx: CanvasRenderingContext2D,
  requestAnimationId: number,
  refreshCanvas: number
}

export const sourceGame = (
  sourceGameObject: SourceGameObjectType
): ThunkType<CanvasActionTypes> => async (dispatch, getState) => {
  const points = getState().canvasReducer.points
  const colorLastKilledEnemy = getState().canvasReducer.colorLastKilledEnemy
  const {
    projectiles,
    ctx,
    enemies,
    player,
    requestAnimationId,
    particles,
    bonuses,
    controller,
    refreshCanvas
  } = sourceGameObject

   drawBcg(ctx, player, colorLastKilledEnemy)

  // projectiles section
  projectiles.forEach((projectile: ProjectileInterface, indexP: number) => {
    drawCircleOnCanvas(ctx, projectile)

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

  //bonuses section
  bonuses.forEach((bonus, i) => {
    drawBonusOnCanvas(ctx, bonus)
    checkIntakeBonus(bonuses, bonus, player, controller, i)
  })

  //points section
  points.forEach(point => {
    if (point.opacity > 0) {
      dispatch(actionsCanvas.updatePointPositionsAC(point.id))
    }else{
      dispatch(actionsCanvas.deletePointAC(point.id))
    }
  })

  if (refreshCanvas % FREQUENCY_APPEAR_ENEMY === 0) {
    addNewEnemies(enemies)
  }

  if (refreshCanvas % FREQUENCY_APPEAR_BONUS === 0) {
    addNewBonus(bonuses)
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
      let point: PointType
      if (enemy.radius >= MIDDLE_ENEMY_SIZE) {
        enemyHitSound()
        shrinkEnemy(projectiles, indexP, enemy)
        dispatch(actionsCanvas.increaseScoreAC(SMALL_REWORD_FOR_KILLED_ENEMY))
        point = createPoints(enemy, projectile, SMALL_REWORD_FOR_KILLED_ENEMY)
      } else {
        enemyEliminatedSound()
        deleteCollision(projectiles, enemies, indexP, indexE)
        dispatch(actionsCanvas.increaseScoreAC(BIG_REWORD_FOR_KILLED_ENEMY))
        dispatch(actionsCanvas.updateColorLastKilledEnemyAC(enemy.color))
        point = createPoints(enemy, projectile, BIG_REWORD_FOR_KILLED_ENEMY)
      }
      addParticles(enemy, projectile, particles)
      dispatch(actionsCanvas.addPointAC(point))
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
    endGameSound()
    cancelAnimationFrame(requestAnimationId)
  }
}

export const setRefreshRate = (): ThunkType<CanvasActionTypes> => async dispatch => {
  const refreshRateMonitor = await refreshRate()
  dispatch(actionsCanvas.setRefreshRateMonitor(refreshRateMonitor))
}

export const machineGunModeShooting = (
  projectiles: Array<ProjectileInterface>,
  player: PlayerInterface,
  controller: ControllerType,
  refreshCanvas: number
): ThunkType<CanvasActionTypes> => async (distance, getState) => {
  const mousePosition: MousePositionType = getState().canvasReducer.mousePosition
  if (refreshCanvas % FREQUENCY_GUN_SHOT === 0 && controller['Mouse'].pressed) {
    addProjectile(projectiles, player, mousePosition)
  }
}

export const createPoints = (
  enemy: EnemyInterface,
  projectile: ProjectileInterface,
  count: number
) => {
  const angle = Math.atan2(enemy.y - projectile.y, enemy.x - projectile.x)

  const xCollision = Math.round(enemy.x - (enemy.radius * Math.cos(angle)))
  const yCollision = Math.round(enemy.y - (enemy.radius * Math.sin(angle)))

  return {
    left: xCollision,
    top: yCollision,
    count,
    opacity: 1,
    id: `${new Date().getTime() - Math.round(Math.random() * 1000)}`
  }
}

