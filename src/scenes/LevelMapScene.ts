import Phaser from 'phaser';
import { C, TITLE_FONT, TOTAL_LEVELS, hex } from '../config';
import { L, onLangChange, t } from '../i18n';
import { LEVELS, getLevel } from '../levels';
import { getResult, isCompleted, totalStars } from '../save';
import { button, drawLock, drawStar, panel, txt } from '../ui/widgets';

// Node positions inside the map panel (from the design). Levels are shown 11 per page.
const NODES: [number, number][] = [
  [200, 470], [290, 510], [390, 450], [470, 330], [380, 260], [310, 200],
  [400, 160], [480, 220], [620, 200], [700, 260], [720, 350],
];
const PER_PAGE = NODES.length;
const MAP_X = 40;
const MAP_Y = 110;

export class LevelMapScene extends Phaser.Scene {
  private page = 0;
  private selected = 1;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super('LevelMap');
  }

  init(data: { levelId?: number }): void {
    const firstOpen = LEVELS.find((l) => !isCompleted(l.id)) ?? LEVELS[LEVELS.length - 1];
    this.selected = data?.levelId ?? firstOpen.id;
    this.page = Math.floor((this.selected - 1) / PER_PAGE);
  }

  create(): void {
    const off = onLangChange(() => this.build());
    this.events.once('shutdown', off);
    this.build();
  }

  private isUnlocked(id: number): boolean {
    return id === 1 || isCompleted(id - 1);
  }

  private build(): void {
    this.layer?.destroy();
    this.children.removeAll(true);
    this.add.rectangle(0, 0, 1280, 720, C.bg).setOrigin(0);
    this.layer = this.add.container(0, 0);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.layer.add(o);
      return o;
    };

    // header
    add(button(this, 66, 56, 52, 52, '', { style: 'dark', radius: 26, onClick: () => this.scene.start('Title') }));
    const back = add(this.add.graphics({ x: 66, y: 56 }));
    back.lineStyle(3, C.white, 1);
    back.beginPath();
    back.moveTo(5, -9);
    back.lineTo(-5, 0);
    back.lineTo(5, 9);
    back.strokePath();
    add(txt(this, 108, 28, t('spookyTown'), 52, hex(C.white), { fontFamily: TITLE_FONT }).setLetterSpacing(1));
    this.chip(add, 880, 30, hex(C.white), `${totalStars()} / ${TOTAL_LEVELS * 3}`, true);
    this.chip(add, 1030, 30, hex(C.white), t('levelOf', { n: this.selected, total: TOTAL_LEVELS }), false);

    // map panel
    add(panel(this, MAP_X, MAP_Y, 820, 580, { fill: 0x121214, alpha: 1, stroke: C.dark, radius: 22 }));
    this.zone(add, 150, 360, 300, 190, t('grannysHouse'), false, 0);
    this.zone(add, 250, 80, 280, 270, t('playground', { n: 5 }), true, 5);
    this.zone(add, 560, 100, 230, 300, t('garden', { n: 10 }), true, 10);
    const road = add(this.add.graphics({ x: MAP_X, y: MAP_Y }));
    road.fillStyle(C.panelStroke, 1);
    const pts = [[70, 500], [200, 470], [290, 510], [390, 450], [470, 330], [380, 260], [310, 200], [400, 160], [480, 220], [620, 200], [700, 260], [720, 350]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const d = Math.hypot(x2 - x1, y2 - y1);
      for (let s = 0; s < d; s += 18) road.fillCircle(x1 + ((x2 - x1) * s) / d, y1 + ((y2 - y1) * s) / d, 2.5);
    }
    // home
    const home = add(this.add.graphics({ x: MAP_X + 30, y: MAP_Y + 450 }));
    home.fillStyle(C.dark, 1);
    home.lineStyle(2, C.dim, 1);
    home.fillPoints([new Phaser.Math.Vector2(4, 24), new Phaser.Math.Vector2(28, 4), new Phaser.Math.Vector2(52, 24), new Phaser.Math.Vector2(52, 48), new Phaser.Math.Vector2(4, 48)], true);
    home.strokePoints([new Phaser.Math.Vector2(4, 24), new Phaser.Math.Vector2(28, 4), new Phaser.Math.Vector2(52, 24), new Phaser.Math.Vector2(52, 48), new Phaser.Math.Vector2(4, 48)], true);
    home.fillStyle(C.bg, 1);
    home.fillRect(22, 30, 12, 18);
    add(txt(this, MAP_X + 70, MAP_Y + 506, t('home'), 18, hex(0xc9c9c4)).setOrigin(0.5, 0));
    add(txt(this, MAP_X + 640, MAP_Y + 470, t('laterAreas'), 18, hex(0x8a8a85), { wordWrap: { width: 170 } }));

    // level nodes for this page
    NODES.forEach(([nx, ny], i) => {
      const id = this.page * PER_PAGE + i + 1;
      if (id > TOTAL_LEVELS) return;
      this.node(add, MAP_X + nx, MAP_Y + ny, id);
    });

    // page arrows
    const pages = Math.ceil(TOTAL_LEVELS / PER_PAGE);
    const nav = (x: number, dir: number, enabled: boolean) => {
      const b = add(button(this, x, MAP_Y + 556, 44, 36, '', { style: 'dark', radius: 18, onClick: () => enabled && this.go(dir) }));
      const g = add(this.add.graphics({ x, y: MAP_Y + 556 }));
      g.lineStyle(3, enabled ? C.white : C.dim, 1);
      g.beginPath();
      g.moveTo(-4 * dir, -7);
      g.lineTo(4 * dir, 0);
      g.lineTo(-4 * dir, 7);
      g.strokePath();
      b.setAlpha(enabled ? 1 : 0.5);
    };
    nav(MAP_X + 560, -1, this.page > 0);
    add(txt(this, MAP_X + 640, MAP_Y + 556, `${this.page * PER_PAGE + 1}–${Math.min(TOTAL_LEVELS, (this.page + 1) * PER_PAGE)}`, 20, hex(C.mid)).setOrigin(0.5));
    nav(MAP_X + 720, 1, this.page < pages - 1);

    this.sidePanel(add);
  }

  private go(dir: number): void {
    this.page = Phaser.Math.Clamp(this.page + dir, 0, Math.ceil(TOTAL_LEVELS / PER_PAGE) - 1);
    this.build();
  }

  private chip(add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, x: number, y: number, color: string, label: string, star: boolean): void {
    const text = txt(this, x + (star ? 44 : 20), y + 12, label, 24, color);
    const w = text.width + (star ? 44 : 20) + 20;
    add(panel(this, x, y, w, 52, { fill: C.chip, alpha: 1, stroke: C.panelStroke, radius: 26 }));
    if (star) drawStar(add(this.add.graphics()), x + 28, y + 26, 12, true);
    add(text);
  }

  private zone(add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, x: number, y: number, w: number, h: number, label: string, locked: boolean, unlockAt: number): void {
    const g = add(this.add.graphics({ x: MAP_X + x, y: MAP_Y + y }));
    g.lineStyle(2, C.panelStroke, 1);
    // dashed border
    const dash = (x1: number, y1: number, x2: number, y2: number) => {
      const d = Math.hypot(x2 - x1, y2 - y1);
      for (let s = 0; s < d; s += 14) {
        const e = Math.min(s + 8, d);
        g.lineBetween(x1 + ((x2 - x1) * s) / d, y1 + ((y2 - y1) * s) / d, x1 + ((x2 - x1) * e) / d, y1 + ((y2 - y1) * e) / d);
      }
    };
    dash(0, 0, w, 0);
    dash(w, 0, w, h);
    dash(w, h, 0, h);
    dash(0, h, 0, 0);
    const isLocked = locked && !this.isUnlocked(unlockAt);
    let tx = MAP_X + x + 16;
    if (locked) {
      drawLock(add(this.add.graphics()), tx + 8, MAP_Y + y + 20, isLocked ? C.mid : C.dim);
      tx += 24;
    }
    add(txt(this, tx, MAP_Y + y + 10, label, 20, hex(locked ? C.mid : 0xc9c9c4)));
  }

  private node(add: <T extends Phaser.GameObjects.GameObject>(o: T) => T, cx: number, cy: number, id: number): void {
    const exists = !!getLevel(id);
    const unlocked = exists && this.isUnlocked(id);
    const done = isCompleted(id);
    const current = unlocked && !done;
    const selected = id === this.selected;
    const g = add(this.add.graphics({ x: cx, y: cy }));
    if (unlocked) {
      g.fillStyle(C.white, 1);
      g.fillCircle(0, 0, 28);
    } else {
      g.fillStyle(exists ? C.dark : C.chip, 1);
      g.fillCircle(0, 0, 28);
      g.lineStyle(2, exists ? 0x4a4a4d : C.panelStroke, 1);
      g.strokeCircle(0, 0, 27);
    }
    if (selected) {
      g.lineStyle(3, C.white, 1);
      g.strokeCircle(0, 0, 35);
    }
    if (current) {
      const ring = add(this.add.circle(cx, cy, 28).setStrokeStyle(2, C.white, 0.55));
      this.tweens.add({ targets: ring, scale: 1.5, alpha: 0, duration: 1100, repeat: -1 });
    }
    add(txt(this, cx, cy - 2, String(id), id > 99 ? 20 : 26, hex(unlocked ? C.bg : exists ? 0x8a8a85 : C.dim)).setOrigin(0.5));
    if (done) {
      const sg = add(this.add.graphics());
      const stars = getResult(id)?.stars ?? 0;
      for (let i = 0; i < 3; i++) drawStar(sg, cx - 18 + i * 18, cy + 44, 7, i < stars);
    }
    const hit = add(this.add.circle(cx, cy, 32, 0xffffff, 0.001).setInteractive({ useHandCursor: true }));
    hit.on('pointerup', () => {
      this.selected = id;
      this.build();
    });
  }

  private sidePanel(add: <T extends Phaser.GameObjects.GameObject>(o: T) => T): void {
    const x = 890;
    const y = MAP_Y;
    add(panel(this, x, y, 350, 580, { fill: C.white, alpha: 1, radius: 22 }));
    const dark = hex(C.bg);
    const level = getLevel(this.selected);
    if (!level || !this.isUnlocked(this.selected)) {
      add(txt(this, x + 28, y + 28, t('level', { n: this.selected }), 22, '#4a4a4d'));
      const lg = add(this.add.graphics({ x: x + 175, y: y + 230 }));
      lg.lineStyle(5, 0x8a8a85, 1);
      lg.strokeRoundedRect(-24, -4, 48, 36, 6);
      lg.beginPath();
      lg.arc(0, -8, 15, Math.PI, 0, false);
      lg.strokePath();
      add(txt(this, x + 175, y + 310, level ? t('locked') : t('comingSoon'), 26, '#4a4a4d', { wordWrap: { width: 280 }, align: 'center' }).setOrigin(0.5, 0));
      return;
    }
    add(txt(this, x + 28, y + 28, `${t('level', { n: level.id })} · ${L(level.name)}`, 22, '#4a4a4d', { wordWrap: { width: 294 } }));
    const title = add(txt(this, x + 28, y + 60, L(level.task), 34, dark, { wordWrap: { width: 294 }, lineSpacing: -4 }));
    let yy = y + 60 + title.height + 14;
    const rule = () => {
      const r = add(this.add.graphics({ x: x + 28, y: yy }));
      r.fillStyle(0xd4d4cf, 1);
      r.fillRect(0, 0, 294, 2);
      yy += 14;
    };
    rule();
    const rows: [string, string][] = [
      [t('needs'), L(level.needs)],
      [t('watchOut'), L(level.watchOut)],
      [t('hideIn'), L(level.hideIn)],
    ];
    for (const [k, v] of rows) {
      add(txt(this, x + 28, yy, k, 21, '#5a5a5d'));
      const val = add(txt(this, x + 124, yy, v, 21, dark, { wordWrap: { width: 198 } }));
      yy += Math.max(30, val.height + 8);
    }
    rule();
    add(txt(this, x + 28, yy, t('winStars'), 20, '#4a4a4d'));
    yy += 30;
    for (const label of [t('starDone'), t('starNotSeen'), t('starQuick')]) {
      const sg = add(this.add.graphics());
      sg.lineStyle(2, C.bg, 1);
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? 10 : 4.5;
        pts.push(new Phaser.Math.Vector2(x + 38 + Math.cos(a) * r, yy + 12 + Math.sin(a) * r));
      }
      sg.strokePoints(pts, true);
      add(txt(this, x + 60, yy, label, 20, dark));
      yy += 28;
    }
    add(button(this, x + 175, y + 580 - 28 - 34, 294, 68, t('startLevel'), { style: 'dark', size: 30, onClick: () => this.scene.start('Game', { levelId: level.id }) }));
    // dark-on-white button text colour: the 'dark' style uses white text on near-black, which fits.
  }
}
