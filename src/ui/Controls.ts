import Phaser from 'phaser';
import { C, FONT, H, W, hex } from '../config';
import { t } from '../i18n';

export type Action = 'use' | 'hide' | 'pet' | 'pause';

/** Keyboard plus on-screen touch buttons (D-pad + Use / Hide / Sneak) feeding one simple interface. */
export class Controls {
  sneakToggle = false;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly touchDir = { up: false, down: false, left: false, right: false };
  private readonly queued: Record<Action, boolean> = { use: false, hide: false, pet: false, pause: false };
  private readonly sneakBtn?: { redraw: () => void };

  constructor(scene: Phaser.Scene, showTouch: boolean) {
    const kb = scene.input.keyboard!;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = kb.addKeys({
      up: K.UP, down: K.DOWN, left: K.LEFT, right: K.RIGHT,
      w: K.W, a: K.A, s: K.S, d: K.D,
      shift: K.SHIFT, e: K.E, space: K.SPACE, h: K.H, c: K.C, p: K.P, esc: K.ESC,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
    scene.input.addPointer(3); // let thumbs work together

    if (showTouch) {
      this.buildDpad(scene);
      this.sneakBtn = this.buildActions(scene);
    }
  }

  private buildDpad(scene: Phaser.Scene): void {
    const x0 = 40;
    const y0 = H - 250;
    const cell = 68;
    const mk = (col: number, row: number, dir: keyof Controls['touchDir'], angle: number) => {
      const cx = x0 + col * (cell + 4) + cell / 2;
      const cy = y0 + row * (cell + 4) + cell / 2;
      const g = scene.add.graphics().setScrollFactor(0).setDepth(120);
      g.fillStyle(C.white, 0.16);
      g.fillRoundedRect(cx - cell / 2, cy - cell / 2, cell, cell, 14);
      g.lineStyle(2, C.white, 0.4);
      g.strokeRoundedRect(cx - cell / 2, cy - cell / 2, cell, cell, 14);
      const pts = [[-6, 9], [6, 0], [-6, -9]].map(([px, py]) => [
        cx + px * Math.cos(angle) - py * Math.sin(angle),
        cy + px * Math.sin(angle) + py * Math.cos(angle),
      ]);
      g.lineStyle(5, C.white, 1);
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      g.lineTo(pts[1][0], pts[1][1]);
      g.lineTo(pts[2][0], pts[2][1]);
      g.strokePath();
      const hit = scene.add.rectangle(cx, cy, cell, cell, 0xffffff, 0.001).setScrollFactor(0).setDepth(122).setInteractive();
      hit.on('pointerdown', () => (this.touchDir[dir] = true));
      hit.on('pointerup', () => (this.touchDir[dir] = false));
      hit.on('pointerout', () => (this.touchDir[dir] = false));
    };
    mk(1, 0, 'up', -Math.PI / 2);
    mk(0, 1, 'left', Math.PI);
    mk(2, 1, 'right', 0);
    mk(1, 2, 'down', Math.PI / 2);
    scene.input.on('pointerup', () => {
      this.touchDir.up = this.touchDir.down = this.touchDir.left = this.touchDir.right = false;
    });
  }

  private buildActions(scene: Phaser.Scene): { redraw: () => void } {
    const circle = (cx: number, cy: number, r: number, label: string, primary: boolean, onTap: () => void) => {
      const g = scene.add.graphics().setScrollFactor(0).setDepth(120);
      const draw = (on = false) => {
        g.clear();
        if (primary || on) {
          g.fillStyle(primary ? C.white : 0xbdbdb8, 1);
          g.fillCircle(cx, cy, r);
          if (!primary) {
            g.lineStyle(3, C.white, 1);
            g.strokeCircle(cx, cy, r);
          }
        } else {
          g.fillStyle(C.panel, 0.88);
          g.fillCircle(cx, cy, r);
          g.lineStyle(3, 0xbdbdb8, 1);
          g.strokeCircle(cx, cy, r);
        }
      };
      draw();
      scene.add
        .text(cx, cy, label, { fontFamily: FONT, fontSize: primary ? '30px' : '22px', color: primary || false ? hex(C.bg) : hex(C.white), resolution: 2 })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(121);
      const hit = scene.add.circle(cx, cy, r, 0xffffff, 0.001).setScrollFactor(0).setDepth(122).setInteractive();
      hit.on('pointerdown', onTap);
      return { draw, g };
    };
    const bx = W - 40;
    const by = H - 40;
    circle(bx - 56, by - 56, 56, t('use'), true, () => (this.queued.use = true));
    circle(bx - 124 - 40 + 12, by - 46, 40, t('hide'), false, () => (this.queued.hide = true));
    // Sneak is a toggle: draw it separately so the pressed state can show.
    const sx = bx - 40 - 16;
    const sy = by - 124 - 40;
    const sg = scene.add.graphics().setScrollFactor(0).setDepth(120);
    const st = scene.add
      .text(sx, sy, t('sneak'), { fontFamily: FONT, fontSize: '22px', color: hex(C.white), resolution: 2 })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(121);
    const redraw = () => {
      sg.clear();
      if (this.sneakToggle) {
        sg.fillStyle(0xbdbdb8, 1);
        sg.fillCircle(sx, sy, 40);
        sg.lineStyle(3, C.white, 1);
        sg.strokeCircle(sx, sy, 40);
        st.setColor(hex(C.bg));
      } else {
        sg.fillStyle(C.panel, 0.88);
        sg.fillCircle(sx, sy, 40);
        sg.lineStyle(3, 0xbdbdb8, 1);
        sg.strokeCircle(sx, sy, 40);
        st.setColor(hex(C.white));
      }
    };
    redraw();
    const hit = scene.add.circle(sx, sy, 40, 0xffffff, 0.001).setScrollFactor(0).setDepth(122).setInteractive();
    hit.on('pointerdown', () => {
      this.sneakToggle = !this.sneakToggle;
      redraw();
    });
    return { redraw };
  }

  /** Called by the HUD buttons (pet / pause). */
  queue(a: Action): void {
    this.queued[a] = true;
  }

  move(): { x: number; y: number } {
    const k = this.keys;
    let x = (k.right.isDown || k.d.isDown || this.touchDir.right ? 1 : 0) - (k.left.isDown || k.a.isDown || this.touchDir.left ? 1 : 0);
    let y = (k.down.isDown || k.s.isDown || this.touchDir.down ? 1 : 0) - (k.up.isDown || k.w.isDown || this.touchDir.up ? 1 : 0);
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  }

  sneaking(): boolean {
    return this.sneakToggle || this.keys.shift.isDown;
  }

  /** True once per press. */
  take(a: Action): boolean {
    const J = Phaser.Input.Keyboard.JustDown;
    const k = this.keys;
    const pressed =
      (a === 'use' && (J(k.e) || J(k.space))) ||
      (a === 'hide' && J(k.h)) ||
      (a === 'pet' && J(k.c)) ||
      (a === 'pause' && (J(k.p) || J(k.esc)));
    const q = this.queued[a];
    this.queued[a] = false;
    return pressed || q;
  }

  refreshSneak(): void {
    this.sneakBtn?.redraw();
  }
}
