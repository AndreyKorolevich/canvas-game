import { CanvasActionTypes } from '../actions/canvasAction'
import {
  ENEMY_TYPE_SPINNING,
  ENEMY_TYPE_SPINNING_TRACKING,
  ENEMY_TYPE_STATIC, ENEMY_TYPE_TRACKING,
  PLAYER_SIZE,
  xCenter,
  yCenter
} from '../game/constants'

export const SET_MOUSE_POSITION = 'SET_MOUSE_POSITION'
export const INCREASE_SCORE = 'INCREASE_SCORE'
export const SHOW_FINAL_MODAL = 'SHOW_FINAL_MODAL'
export const START_NEW_GAME = 'START_NEW_GAME'
export const INCREASE_GAME_NUMBER = 'INCREASE_GAME_NUMBER'
export const ADD_ENEMY = 'ADD_ENEMY'
export const ADD_PARTICLES = 'ADD_PARTICLES'
export const ADD_PROJECTILE = 'ADD_PROJECTILE'
export const REMOVE_ENEMY = 'REMOVE_ENEMY'
export const REMOVE_PARTICLES = 'REMOVE_PARTICLES'
export const REMOVE_PROJECTILE = 'REMOVE_PROJECTILE'
export const UPDATE_ENEMY_POSITION = 'UPDATE_ENEMY_POSITION'
export const UPDATE_PARTICLE_POSITION = 'UPDATE_PARTICLE_POSITION'
export const UPDATE_PROJECTILE_POSITION = 'UPDATE_PROJECTILE_POSITION'
export const SHRINK_ENEMY = 'SHRINK_ENEMY'
export const SET_REFRESH_RATE_MONITOR = 'SET_REFRESH_RATE_MONITOR'

export interface GameObjectInterface {
  x: number
  y: number
  radius: number
  color: string
}

export type EnemyType = typeof ENEMY_TYPE_STATIC |
  typeof ENEMY_TYPE_TRACKING |
  typeof ENEMY_TYPE_SPINNING |
  typeof ENEMY_TYPE_SPINNING_TRACKING

export interface ParticleInterface extends GameObjectInterface {
  velocity: {
    x: number,
    y: number
  }
  alpha: number
  gravity: number
  friction: number
}

export interface ProjectileInterface extends GameObjectInterface {
  velocity: {
    x: number,
    y: number
  }
}

export interface EnemyInterface extends GameObjectInterface {
  type: EnemyType
  speed: number,
  spin: number
  radians: number
  velocity: {
    x: number,
    y: number
  }
}

export type CanvasStateType = {
  mousePosition: {
    x: number
    y: number
  },
  score: number
  isShowFinalModal: boolean
  gameNumber: number
  refreshRateMonitor: number
}

const initialState = {
  mousePosition: {
    x: 0,
    y: 0
  },
  score: 0,
  isShowFinalModal: false,
  gameNumber: 0,

  refreshRateMonitor: 0
}

export default (state: CanvasStateType = initialState, action: CanvasActionTypes) => {
  switch (action.type) {
    case SET_MOUSE_POSITION:
      return {
        ...state,
        mousePosition: {
          ...state.mousePosition,
          x: action.payload.x,
          y: action.payload.y
        }
      }
    case INCREASE_SCORE: {
      return {
        ...state,
        score: state.score + 10
      }
    }
    case SET_REFRESH_RATE_MONITOR: {
      return {
        ...state,
        refreshRateMonitor: action.payload.refreshRateMonitor
      }
    }
    case SHOW_FINAL_MODAL: {
      return {
        ...state,
        isShowFinalModal: true
      }
    }
    case START_NEW_GAME: {
      return {
        ...state,
        score: 0,
        isShowFinalModal: false,
        projectiles: [],
        enemies: [],
        particles: [],
      }
    }
    case INCREASE_GAME_NUMBER: {
      return {
        ...state,
        gameNumber: state.gameNumber + 1
      }
    }
    default:
      return state
  }
}