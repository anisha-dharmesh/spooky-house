import Phaser from 'phaser';
import { C, FONT, hex } from '../config';

export function txt(
  scene: Phaser.Scene,
  x: number,
  y: number,
  str: string,
  size: number,
  color: string = hex(C.white),
  extra: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, str, { fontFamily: FONT, fontSize: size + 'px', color, resolution: 2, ...extra });
}

export function panel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fill?: number; alpha?: number; stroke?: number; radius?: number; dashed?: boolean } = {},
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  const r = opts.radius ?? 16;
  g.fillStyle(opts.fill ?? C.panel, opts.alpha ?? 0.88);
  g.fillRoundedRect(0, 0, w, h, r);
  if (opts.stroke !== undefined) {
    g.lineStyle(2, opts.stroke, 1);
    g.strokeRoundedRect(0, 0, w, h, r);
  }
  return g;
}

export function drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, filled: boolean, color: number = C.white): void {
  const pts: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push(new Phaser.Math.Vector2(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad));
  }
  if (filled) {
    g.fillStyle(color, 1);
    g.fillPoints(pts, true);
  } else {
    g.lineStyle(Math.max(2, r / 12), 0x5a5a5d, 1);
    g.strokePoints(pts, true);
  }
}

export function drawEye(g: Phaser.GameObjects.Graphics, cx: number, cy: number, color: number = C.white): void {
  g.lineStyle(2, color, 1);
  g.beginPath();
  g.moveTo(cx - 11, cy);
  g.lineTo(cx - 4, cy - 6);
  g.lineTo(cx + 4, cy - 6);
  g.lineTo(cx + 11, cy);
  g.lineTo(cx + 4, cy + 6);
  g.lineTo(cx - 4, cy + 6);
  g.closePath();
  g.strokePath();
  g.strokeCircle(cx, cy, 3.5);
}

export function drawPaw(g: Phaser.GameObjects.Graphics, cx: number, cy: number, s = 1, color: number = C.white): void {
  g.fillStyle(color, 1);
  g.fillCircle(cx - 8 * s, cy - 3 * s, 2.7 * s);
  g.fillCircle(cx - 3 * s, cy - 8 * s, 2.7 * s);
  g.fillCircle(cx + 3 * s, cy - 8 * s, 2.7 * s);
  g.fillCircle(cx + 8 * s, cy - 3 * s, 2.7 * s);
  g.fillEllipse(cx, cy + 5 * s, 15 * s, 11 * s);
}

export function drawLock(g: Phaser.GameObjects.Graphics, cx: number, cy: number, color: number = C.mid): void {
  g.lineStyle(2, color, 1);
  g.strokeRoundedRect(cx - 6, cy - 1, 12, 9, 2);
  g.beginPath();
  g.arc(cx, cy - 2, 4, Math.PI, 0, false);
  g.strokePath();
}

export function drawMoon(scene: Phaser.Scene, x: number, y: number, r: number, bg = C.bg): void {
  scene.add.circle(x, y, r, 0xe9e9e4);
  scene.add.circle(x + r * 0.28, y - r * 0.2, r * 0.95, bg);
}

export interface ButtonOpts {
  style?: 'primary' | 'ghost' | 'dark';
  size?: number;
  radius?: number;
  onClick: () => void;
}

/** Large, tappable text button. Returns the container so callers can position/destroy it. */
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  opts: ButtonOpts,
): Phaser.GameObjects.Container {
  const style = opts.style ?? 'primary';
  const g = scene.add.graphics();
  const draw = (hover: boolean) => {
    g.clear();
    const r = opts.radius ?? 14;
    if (style === 'primary') {
      g.fillStyle(hover ? 0xffffff : C.white, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    } else if (style === 'dark') {
      g.fillStyle(hover ? 0x1d1d20 : C.panel, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    } else {
      g.fillStyle(hover ? 0x1c1c1e : C.bg, 0.01);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
      g.lineStyle(3, hover ? C.white : 0x8a8a85, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    }
  };
  draw(false);
  const color = style === 'primary' ? hex(C.bg) : hex(C.white);
  const text = txt(scene, 0, 0, label, opts.size ?? 30, color).setOrigin(0.5);
  const c = scene.add.container(x, y, [g, text]);
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerover', () => draw(true));
  c.on('pointerout', () => {
    draw(false);
    c.setScale(1);
  });
  c.on('pointerdown', () => c.setScale(0.97));
  c.on('pointerup', () => {
    c.setScale(1);
    opts.onClick();
  });
  return c;
}

/** Soft starfield + dim grid used behind menus. */
export function nightBackground(scene: Phaser.Scene, stars = 14): void {
  scene.add.rectangle(0, 0, 1280, 720, C.bg).setOrigin(0);
  for (let i = 0; i < stars; i++) {
    const x = Phaser.Math.Between(40, 1240);
    const y = Phaser.Math.Between(30, 300);
    const s = scene.add.circle(x, y, Phaser.Math.Between(1, 2), i % 2 ? 0x9a9a95 : 0xbdbdb8);
    scene.tweens.add({ targets: s, alpha: 0.3, duration: Phaser.Math.Between(900, 2200), yoyo: true, repeat: -1 });
  }
}
