import { PlayerInterface } from './Player'
import { moveDown, moveLeft, moveRight, moveUp } from '../utils/utils'

export type ControllerType = {
  [property: string]: {pressed: boolean, func: () => void},
}

export const controllerCreator = (player: PlayerInterface): ControllerType =>  ({
  KeyW: {pressed: false, func: moveUp(player)},
  KeyS: {pressed: false, func: moveDown(player)},
  KeyA: {pressed: false, func: moveLeft(player)},
  KeyD: {pressed: false, func: moveRight(player)},
})