import Phaser from 'phaser';
import { C, FONT } from '../config';
import { angleDiff, conePolygon, type Rect } from './geometry';

export interface BaddieConfig {
  id: string;
  kind: string;
  name: string;
  x: number;
  y: number;
  speed: number;
  range: number;
  halfAngle: number; // radians
  patrol: { x: number; y: number; wait: number }[];
}

export const BADDIE_RADIUS = 32;
const TURN_RATE = 3.2; // radians per second

/** The scary face used on the baddie token and the Caught screen. `r` is the token radius. */
export function drawBaddieFace(g: Phaser.GameObjects.Graphics, r: number): void {
  const k = r / 32;
  g.fillStyle(0x3a3a3d, 1);
  g.fillCircle(0, 0, r);
  g.lineStyle(Math.max(3, 4 * k), C.white, 1);
  g.strokeCircle(0, 0, r - 2 * k);
  g.lineStyle(Math.max(2, 2.4 * k), C.white, 1);
  g.beginPath();
  g.moveTo(-15 * k, -10 * k);
  g.lineTo(-5 * k, -6 * k);
  g.moveTo(15 * k, -10 * k);
  g.lineTo(5 * k, -6 * k);
  g.strokePath();
  g.fillStyle(C.white, 1);
  g.fillCircle(-8 * k, -1 * k, 2.6 * k);
  g.fillCircle(8 * k, -1 * k, 2.6 * k);
  g.beginPath();
  g.arc(0, 22 * k, 12 * k, Math.PI * 1.15, Math.PI * 1.85, false);
  g.strokePath();
}

export class Baddie {
  readonly cfg: BaddieConfig;
  x: number;
  y: number;
  facing = 0;
  private target = 1;
  private waitLeft = 0;
  private distractedLeft = 0;
  private lookAt: { x: number; y: number } | null = null;
  private readonly token: Phaser.GameObjects.Container;
  private readonly cone: Phaser.GameObjects.Graphics;
  private readonly bubble: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, cfg: BaddieConfig) {
    this.cfg = cfg;
    this.x = cfg.x;
    this.y = cfg.y;
    this.cone = scene.add.graphics().setDepth(3);
    const face = scene.add.graphics();
    drawBaddieFace(face, BADDIE_RADIUS);
    const label = scene.add
      .text(0, BADDIE_RADIUS + 10, cfg.name, { fontFamily: FONT, fontSize: '16px', color: '#f2f2ef', backgroundColor: '#0a0a0b', padding: { x: 10, y: 2 }, resolution: 2 })
      .setOrigin(0.5, 0);
    this.token = scene.add.container(this.x, this.y, [face, label]).setDepth(6);
    this.bubble = scene.add
      .text(0, 0, '?', { fontFamily: FONT, fontSize: '34px', color: '#f2f2ef', resolution: 2 })
      .setOrigin(0.5)
      .setDepth(7)
      .setVisible(false);
    if (cfg.patrol.length > 0) {
      this.x = cfg.patrol[0].x;
      this.y = cfg.patrol[0].y;
    }
    this.faceTarget();
  }

  get distracted(): boolean {
    return this.distractedLeft > 0;
  }

  distract(seconds: number, lookX: number, lookY: number): void {
    this.distractedLeft = seconds;
    this.lookAt = { x: lookX, y: lookY };
  }

  private faceTarget(): void {
    const p = this.cfg.patrol[this.target];
    if (p) this.facing = Math.atan2(p.y - this.y, p.x - this.x);
  }

  private turnToward(angle: number, dt: number): void {
    const d = angleDiff(this.facing, angle);
    const step = TURN_RATE * dt;
    this.facing += Math.max(-step, Math.min(step, d));
  }

  update(dt: number): void {
    const patrol = this.cfg.patrol;
    if (this.distractedLeft > 0) {
      this.distractedLeft -= dt;
      if (this.lookAt) this.turnToward(Math.atan2(this.lookAt.y - this.y, this.lookAt.x - this.x), dt);
    } else if (patrol.length >= 2) {
      const tp = patrol[this.target];
      if (this.waitLeft > 0) {
        this.waitLeft -= dt;
        this.turnToward(Math.atan2(tp.y - this.y, tp.x - this.x), dt);
      } else {
        const dx = tp.x - this.x;
        const dy = tp.y - this.y;
        const d = Math.hypot(dx, dy);
        const step = this.cfg.speed * dt;
        this.turnToward(Math.atan2(dy, dx), dt);
        if (d <= step) {
          this.x = tp.x;
          this.y = tp.y;
          this.waitLeft = tp.wait;
          this.target = (this.target + 1) % patrol.length;
        } else {
          this.x += (dx / d) * step;
          this.y += (dy / d) * step;
        }
      }
    }
    this.token.setPosition(this.x, this.y);
    this.bubble.setPosition(this.x, this.y - BADDIE_RADIUS - 22).setVisible(this.distracted);
  }

  drawCone(blockers: Rect[], alert: boolean): void {
    this.cone.clear();
    if (this.distracted) return;
    const poly = conePolygon(this.x, this.y, this.facing, this.cfg.halfAngle, this.cfg.range, blockers);
    this.cone.fillStyle(C.white, alert ? 0.3 : 0.1);
    this.cone.fillPoints(poly, true);
  }

  destroy(): void {
    this.token.destroy();
    this.cone.destroy();
    this.bubble.destroy();
  }
}
