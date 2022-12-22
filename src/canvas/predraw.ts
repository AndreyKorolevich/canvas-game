import resizeCanvasToDisplaySize from './resizeCanvasToDisplaySize'
import { CanvasType } from './Canvas'

const preDraw = (context: CanvasRenderingContext2D, canvas: CanvasType) => {
  context.save()
  resizeCanvasToDisplaySize(canvas)
  const { width, height } = context.canvas
  context.fillStyle = `rgba(0, 0, 0, 0.1)`
  context.fillRect(0, 0, width, height)
}

export default preDraw