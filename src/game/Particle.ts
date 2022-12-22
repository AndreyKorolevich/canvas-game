import { GameObject, GameObjectInterface } from './GameObject'

export interface ParticleInterface extends GameObjectInterface {
  velocity: {
    x: number,
    y: number
  }
  alpha: number
}

export class Particle extends GameObject {
  velocity: {
    x: number,
    y: number
  }
  alpha: number
  gravity: number
  friction: number

  constructor(x: number, y: number, radius: number, color: string, velocity: { x: number, y: number }, ctx: CanvasRenderingContext2D) {
    super(x, y, radius, color, ctx)
    this.velocity = velocity
    this.alpha = 1
    this.gravity = 0.005
    this.friction = 0.99
  }

  draw() {
    this.ctx.save()
    this.ctx.globalAlpha = this.alpha
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
    this.ctx.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= this.friction
    this.velocity.y *= this.friction
    this.velocity.y += this.gravity
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.002
  }
}