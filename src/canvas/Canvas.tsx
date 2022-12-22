import React, { useEffect, useRef, useState } from 'react'
import preDraw from './predraw'
import postDraw from './postdraw'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { EnemyInterface, ParticleInterface, ProjectileInterface } from '../reducers/canvasReducer'
import { setRefreshRate, sourceGame } from '../actions/canvasAction'
import { FPS, PLAYER_COLOR, PLAYER_SIZE, xCenter, yCenter } from '../game/constants'
import { Player, PlayerInterface } from '../game/Player'
import { addProjectile, executeMoves } from '../utils/utils'
import { controllerCreator, ControllerType } from '../game/controller'

export type CanvasType = HTMLCanvasElement | null

const Canvas: React.FC<unknown> = () => {

  const canvasRef = useRef<CanvasType>(null)
  const dispatch = useAppDispatch()
  const [workFrame, setWorkFrame] = useState(0)
  const gameNumber = useAppSelector(state => state.canvasReducer.gameNumber)
  const refreshRateMonitor = useAppSelector(state => state.canvasReducer.refreshRateMonitor)


  useEffect(() => {
    dispatch(setRefreshRate())
  }, [])

  useEffect(() => {
    const newWorkFrame = Math.round(refreshRateMonitor / FPS)
    setWorkFrame(newWorkFrame)
  }, [refreshRateMonitor])


  useEffect(() => {
    const enemies: Array<EnemyInterface> = []
    const particles: Array<ParticleInterface> = []
    const projectiles: Array<ProjectileInterface> = []

    const canvas: CanvasType = canvasRef?.current
    const context = canvas?.getContext('2d') as CanvasRenderingContext2D
    const player: PlayerInterface = new Player(xCenter, yCenter, PLAYER_SIZE, PLAYER_COLOR, context)
    const controller: ControllerType = controllerCreator(player)

    const handleKeyDown = (event: KeyboardEvent) => {
      if(controller[event.code]){
        controller[event.code].pressed = true
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if(controller[event.code]){
        controller[event.code].pressed = false
      }
    }
    const handleClick = (event: MouseEvent) => {
      const mousePosition = { x: Math.round(event.x), y: Math.round(event.y) }
      addProjectile(projectiles, player, mousePosition)
    }

    let animationFrameId: number
    let refreshCount = 0

    canvas?.addEventListener('click', handleClick)
    canvas?.addEventListener('keydown', handleKeyDown)
    canvas?.addEventListener('keyup', handleKeyUp)

    const render = () => {
      animationFrameId = window.requestAnimationFrame(render)
      if (refreshCount % workFrame === 0) {
        preDraw(context, canvas)
        player.update()
        executeMoves(controller)
        dispatch(sourceGame(projectiles, enemies, particles, player, context, animationFrameId, refreshCount))
        postDraw(context)
      }
      refreshCount++
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      canvas?.removeEventListener('click', handleClick)
      canvas?.removeEventListener('keydown', handleKeyDown)
      canvas?.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameNumber, workFrame])


  return <canvas ref={canvasRef} tabIndex={0} />
}

export default Canvas