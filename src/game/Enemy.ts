import { GameObject, GameObjectInterface } from './GameObject'


export interface EnemyInterface extends GameObjectInterface {
  velocity: {
    x: number,
    y: number
  }
}

export class Enemy extends GameObject {
  velocity: {
    x: number,
    y: number
  }

  constructor(x: number, y: number, radius: number, color: string, velocity: { x: number, y: number }, ctx: CanvasRenderingContext2D) {
    super(x, y, radius, color, ctx)
    this.velocity = velocity
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
    this.x = this.x - this.velocity.x
    this.y = this.y - this.velocity.y
  }
}