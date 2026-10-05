import Phaser from 'phaser';
import { C, FONT, PLAYER_RADIUS } from '../config';
import { resolveCircle, type Rect } from './geometry';

/** Anisha, drawn as a white disc with a pointer showing which way she faces (final look is still undecided). */
export class Player {
  x: number;
  y: number;
  facing = 0;
  hidden = false;
  private readonly body: Phaser.GameObjects.Container;
  private readonly pointer: Phaser.GameObjects.Graphics;
  readonly youLabel: Phaser.GameObjects.Text;

  /** The game object the camera follows. */
  get follow(): Phaser.GameObjects.Container {
    return this.body;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, youText: string) {
    this.x = x;
    this.y = y;
    const disc = scene.add.graphics();
    disc.fillStyle(C.white, 1);
    disc.fillCircle(0, 0, PLAYER_RADIUS + 3);
    disc.fillStyle(C.bg, 1);
    disc.fillCircle(0, 0, PLAYER_RADIUS);
    disc.fillStyle(C.white, 1);
    disc.fillCircle(0, 0, PLAYER_RADIUS - 4);
    this.pointer = scene.add.graphics();
    this.pointer.fillStyle(C.white, 1);
    this.pointer.fillTriangle(PLAYER_RADIUS + 3, -8, PLAYER_RADIUS + 3, 8, PLAYER_RADIUS + 14, 0);
    this.body = scene.add.container(x, y, [disc, this.pointer]).setDepth(5);
    this.youLabel = scene.add
      .text(x, y + PLAYER_RADIUS + 10, youText, { fontFamily: FONT, fontSize: '16px', color: '#0a0a0b', backgroundColor: '#f2f2ef', padding: { x: 10, y: 2 }, resolution: 2 })
      .setOrigin(0.5, 0)
      .setDepth(5);
  }

  move(dx: number, dy: number, speed: number, dt: number, solids: Rect[], bounds: Rect): void {
    if (dx === 0 && dy === 0) return;
    this.facing = Math.atan2(dy, dx);
    this.x += dx * speed * dt;
    this.y += dy * speed * dt;
    const p = resolveCircle(this.x, this.y, PLAYER_RADIUS, solids);
    this.x = Phaser.Math.Clamp(p.x, bounds.x + PLAYER_RADIUS, bounds.x + bounds.w - PLAYER_RADIUS);
    this.y = Phaser.Math.Clamp(p.y, bounds.y + PLAYER_RADIUS, bounds.y + bounds.h - PLAYER_RADIUS);
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  render(sneaking: boolean): void {
    this.body.setPosition(this.x, this.y);
    this.pointer.setRotation(this.facing);
    this.body.setAlpha(this.hidden ? 0.28 : sneaking ? 0.72 : 1);
    this.youLabel.setPosition(this.x, this.y + PLAYER_RADIUS + 10).setVisible(!this.hidden);
  }
}
