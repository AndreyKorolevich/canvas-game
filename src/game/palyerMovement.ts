import { PlayerInterface } from './Player'
import { PLAYER_SPED } from './constants'
import { ControllerType } from './controller'

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