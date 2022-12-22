export interface GameObjectInterface {
  x: number
  y: number
  radius: number
  ctx: CanvasRenderingContext2D
  color: string
  draw: () => void
  update: () => void
}

export abstract  class GameObject implements GameObjectInterface {
  x: number
  y: number
  radius: number
  ctx: CanvasRenderingContext2D
  color: string

  protected constructor(x: number, y: number, radius: number, color: string, ctx: CanvasRenderingContext2D) {
    this.x = x
    this.y = y
    this.radius = radius
    this.ctx = ctx
    this.color = color
  }

  draw() {
    if(this.ctx){
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