import { GameObject, GameObjectInterface } from './GameObject'

export type PlayerInterface = GameObjectInterface

export class Player extends GameObject {
  constructor(x: number, y: number, radius: number, color: string, ctx: CanvasRenderingContext2D) {
    super(x, y, radius, color, ctx)
  }

  draw() {
    if (this.ctx) {
      this.ctx.beginPath()
      this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
      this.ctx.fillStyle = this.color
      this.ctx.fill()
    }
  }

  update() {
    this.draw()
  }
}