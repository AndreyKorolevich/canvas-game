import React, { useEffect, useRef, useState } from 'react'
import preDraw from './predraw'
import postDraw from './postdraw'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  BonusInterface,
  EnemyInterface,
  ParticleInterface,

  ProjectileInterface
} from '../reducers/canvasReducer'
import {
  actionsCanvas,
  machineGunModeShooting,
  setRefreshRate,
  sourceGame,
  SourceGameObjectType
} from '../actions/canvasAction'
import { FPS, PLAYER_COLOR, PLAYER_SIZE, xCenter, yCenter } from '../game/constants'
import { Player, PlayerInterface } from '../game/Player'
import { controllerCreator, ControllerType } from '../game/controller'
import { executeMoves } from '../game/palyerMovement'
import { addProjectile } from '../game/operationWithObjects'

export type CanvasType = HTMLCanvasElement | null

const Canvas: React.FC<unknown> = () => {

  const canvasRef = useRef<CanvasType>(null)
  const dispatch = useAppDispatch()
  const [workFrame, setWorkFrame] = useState(0)
  const gameNumber = useAppSelector(state => state.canvasReducer.gameNumber)
  const refreshRateMonitor = useAppSelector(state => state.canvasReducer.refreshRateMonitor)
  const isShowStartModal = useAppSelector(state => state.canvasReducer.isShowStartModal)


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
    const bonuses: Array<BonusInterface> = []

    const canvas: CanvasType = canvasRef?.current
    const context = canvas?.getContext('2d') as CanvasRenderingContext2D
    const player: PlayerInterface = new Player(xCenter, yCenter, PLAYER_SIZE, PLAYER_COLOR, context)
    const controller: ControllerType = controllerCreator(player)

    let animationFrameId: number
    let refreshCount = 0

    const handleKeyDown = (event: KeyboardEvent) => {
      if (controller[event.code]) {
        controller[event.code].pressed = true
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (controller[event.code]) {
        controller[event.code].pressed = false
      }
    }
    const handleClick = (event: MouseEvent) => {
      const mousePosition = { x: Math.round(event.x), y: Math.round(event.y) }
      addProjectile(projectiles, player, mousePosition)
    }
    const handleMousemove = (event: MouseEvent) => {
      const mousePosition = { x: Math.round(event.x), y: Math.round(event.y) }
      dispatch(actionsCanvas.setMousePositionAC(mousePosition))
    }
    const handleMousedown = () => {
      if (player.machineGunMode) {
        controller['Mouse'].pressed = true
      }
    }
    const handleMouseup = () => {
      controller['Mouse'].pressed = false
    }

    canvas?.addEventListener('click', handleClick)
    canvas?.addEventListener('mousedown', handleMousedown)
    canvas?.addEventListener('mouseup', handleMouseup)
    canvas?.addEventListener('mousemove', handleMousemove)
    canvas?.addEventListener('keydown', handleKeyDown)
    canvas?.addEventListener('keyup', handleKeyUp)

    const render = () => {
      animationFrameId = window.requestAnimationFrame(render)
      const sourceGameObject: SourceGameObjectType = {
        projectiles,
        enemies,
        particles,
        bonuses,
        player,
        controller,
        ctx: context,
        requestAnimationId: animationFrameId,
        refreshCanvas: refreshCount
      }

      if (!isShowStartModal) {
        preDraw(context, canvas)
        player.update()
        executeMoves(controller)
        dispatch(machineGunModeShooting(projectiles, player, controller, refreshCount))
        dispatch(sourceGame(sourceGameObject))
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
      canvas?.removeEventListener('mousedown', handleMousedown)
      canvas?.removeEventListener('mouseup', handleMouseup)
      canvas?.removeEventListener('mousemove', handleMousemove)
    }
  }, [gameNumber, workFrame, isShowStartModal])


  return (
    <>
      <canvas ref={canvasRef} tabIndex={0} />
    </>
  )
}

export default Canvas