import Phaser from 'phaser';
import { C, H, MAX_ITEMS, W, hex } from '../config';
import { L, t } from '../i18n';
import type { LevelDef } from '../levels/types';
import { drawEye, drawPaw, panel, txt } from './widgets';

const D = 100; // HUD depth

/** Heads-up display from the design: task list, item slots, "seen" meter, pet button, pause. */
export class Hud {
  private readonly scene: Phaser.Scene;
  private readonly level: LevelDef;
  private readonly stepsLayer: Phaser.GameObjects.Container;
  private readonly slots: Phaser.GameObjects.Container;
  private readonly meterBar: Phaser.GameObjects.Graphics;
  private readonly petText: Phaser.GameObjects.Text;
  private readonly toastText: Phaser.GameObjects.Text;
  private toastTimer?: Phaser.Time.TimerEvent;
  private lastMeter = -1;

  constructor(scene: Phaser.Scene, level: LevelDef, pets: number, onPet: () => void, onPause: () => void) {
    this.scene = scene;
    this.level = level;
    const fixed = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      (o as unknown as Phaser.GameObjects.Components.ScrollFactor).setScrollFactor(0);
      (o as unknown as Phaser.GameObjects.Components.Depth).setDepth(D);
      return o;
    };

    this.stepsLayer = fixed(scene.add.container(24, 24));
    const slotsW = MAX_ITEMS * 56 + (MAX_ITEMS - 1) * 10 + 20;
    this.slots = fixed(scene.add.container((W - slotsW) / 2, H - 112));
    this.drawSlots([]);

    // top right: seen meter, pet help, pause
    const top = 36;
    const eyeChip = fixed(panel(scene, W - 36 - 176 - 12 - 92 - 12 - 52, top, 176, 52, { stroke: C.panelStroke, radius: 26 }));
    const ex = W - 36 - 176 - 12 - 92 - 12 - 52;
    const eye = fixed(scene.add.graphics());
    drawEye(eye, ex + 28, top + 26);
    fixed(scene.add.graphics()).fillStyle(C.dark, 1).fillRoundedRect(ex + 54, top + 20, 110, 12, 6);
    this.meterBar = fixed(scene.add.graphics());
    this.meterBar.setPosition(ex + 54, top + 20);
    void eyeChip;

    const px = W - 36 - 92 - 12 - 52;
    const petBtn = fixed(panel(scene, px, top, 92, 52, { stroke: C.panelStroke, radius: 26 }));
    const paw = fixed(scene.add.graphics());
    drawPaw(paw, px + 28, top + 26, 1);
    this.petText = fixed(txt(scene, px + 52, top + 14, '×' + pets, 22)).setOrigin(0, 0);
    petBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 92, 52), Phaser.Geom.Rectangle.Contains);
    petBtn.input!.cursor = 'pointer';
    petBtn.on('pointerdown', onPet);

    const pauseX = W - 36 - 52;
    const pauseBtn = fixed(panel(scene, pauseX, top, 52, 52, { stroke: C.panelStroke, radius: 26 }));
    const bars = fixed(scene.add.graphics());
    bars.fillStyle(C.white, 1);
    bars.fillRoundedRect(pauseX + 15, top + 16, 7, 20, 2);
    bars.fillRoundedRect(pauseX + 30, top + 16, 7, 20, 2);
    pauseBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 52, 52), Phaser.Geom.Rectangle.Contains);
    pauseBtn.input!.cursor = 'pointer';
    pauseBtn.on('pointerdown', onPause);

    this.toastText = fixed(
      txt(scene, W / 2, 650, '', 26, hex(C.white), { backgroundColor: '#0a0a0b', padding: { x: 18, y: 8 } }),
    )
      .setOrigin(0.5)
      .setVisible(false);
    this.setMeter(0);
  }

  /** Redraws the task panel. `done` is how many steps are finished. */
  setSteps(done: number): void {
    this.stepsLayer.removeAll(true);
    const steps = this.level.steps;
    const head = txt(this.scene, 18, 14, t('level', { n: this.level.id }), 18, hex(C.mid));
    const task = txt(this.scene, 18, 38, L(this.level.task), 23, hex(C.white), { wordWrap: { width: 264 }, lineSpacing: -2 });
    const rows: Phaser.GameObjects.GameObject[] = [head, task];
    let y = 38 + task.height + 12;
    steps.forEach((s, i) => {
      const complete = i < done;
      const active = i === done;
      const box = this.scene.add.graphics({ x: 18, y: y + 3 });
      box.lineStyle(2, active || complete ? C.white : C.dim, 1);
      box.strokeRoundedRect(0, 0, 18, 18, 4);
      if (complete) {
        box.lineStyle(3, C.white, 1);
        box.beginPath();
        box.moveTo(4, 9);
        box.lineTo(8, 13);
        box.lineTo(15, 4);
        box.strokePath();
      }
      const label = txt(this.scene, 44, y, L(s.text), 19, hex(active || complete ? C.white : C.mid), { wordWrap: { width: 240 } });
      rows.push(box, label);
      y += Math.max(26, label.height + 6);
    });
    const bg = panel(this.scene, 0, 0, 300, y + 12, { stroke: C.panelStroke });
    this.stepsLayer.add([bg, ...rows]);
  }

  /** Item slots: `frames` are atlas frame names of what Anisha is carrying. */
  drawSlots(frames: string[]): void {
    this.slots.removeAll(true);
    const w = MAX_ITEMS * 56 + (MAX_ITEMS - 1) * 10 + 20;
    this.slots.add(panel(this.scene, 0, 0, w, 76, { stroke: C.panelStroke }));
    for (let i = 0; i < MAX_ITEMS; i++) {
      const x = 10 + i * 66;
      const g = this.scene.add.graphics({ x, y: 10 });
      if (frames[i]) {
        g.fillStyle(0x2a2a2d, 1);
        g.fillRoundedRect(0, 0, 56, 56, 10);
        g.lineStyle(2, C.white, 1);
        g.strokeRoundedRect(0, 0, 56, 56, 10);
        this.slots.add(g);
        const img = this.scene.add.image(x + 28, 38, 'items', frames[i]);
        img.setScale(Math.min(46 / img.width, 46 / img.height));
        this.slots.add(img);
      } else {
        g.lineStyle(2, 0x4a4a4d, 1);
        g.strokeRoundedRect(0, 0, 56, 56, 10);
        this.slots.add(g);
      }
    }
  }

  setMeter(v: number): void {
    if (Math.abs(v - this.lastMeter) < 0.001) return;
    this.lastMeter = v;
    this.meterBar.clear();
    this.meterBar.fillStyle(C.white, 1);
    if (v > 0.01) this.meterBar.fillRoundedRect(0, 0, Math.max(8, 110 * v), 12, 6);
  }

  setPets(n: number): void {
    this.petText.setText('×' + n);
  }

  toast(msg: string, seconds = 2): void {
    this.toastText.setText(msg).setVisible(true);
    this.toastTimer?.remove();
    this.toastTimer = this.scene.time.delayedCall(seconds * 1000, () => this.toastText.setVisible(false));
  }
}

