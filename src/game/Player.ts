export interface PlayerInterface {
  x: number
  y: number
  radius: number
  ctx: CanvasRenderingContext2D
  color: string
  draw: () => void
  update: () => void
  machineGunMode: boolean
}

export class Player  {
  x: number
  y: number
  radius: number
  ctx: CanvasRenderingContext2D
  color: string
  machineGunMode: boolean
  constructor(x: number, y: number, radius: number, color: string, ctx: CanvasRenderingContext2D) {
    this.x = x
    this.y = y
    this.radius = radius
    this.ctx = ctx
    this.color = color
    this.machineGunMode = false
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
