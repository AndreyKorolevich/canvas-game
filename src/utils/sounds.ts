import shoot from '../media/shoot.mp3'
import startGame from '../media/startGame.mp3'
import endGame from '../media/endGame.mp3'
import enemyEliminated from '../media/enemyEliminated.mp3'
import enemyHit from '../media/enemyHit.mp3'
import obtainPowerUp from '../media/obtainPowerUp.mp3'

export const shootSound = () => {
  new Audio(shoot).play()
}
export const startGameSound = () => {
  new Audio(startGame).play()
}
export const endGameSound = () => {
  new Audio(endGame).play()
}
export const enemyEliminatedSound = () => {
  new Audio(enemyEliminated).play()
}
export const enemyHitSound = () => {
  new Audio(enemyHit).play()
}
export const obtainPowerUpSound = () => {
  new Audio(obtainPowerUp).play()
}