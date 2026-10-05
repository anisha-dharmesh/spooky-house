import Phaser from 'phaser';
import { C, H, MAX_ITEMS, PLAYER_RADIUS, REACH, SNEAK_SPEED, W, WALK_SPEED, WORLD_SCALE, hex } from '../config';
import { L, t } from '../i18n';
import { BADDIE_KINDS, getLevel } from '../levels';
import { blockers, buildWorld, type Hide, type Pickup, type RoomJson, type Target, type World } from '../levels/world';
import type { LevelDef } from '../levels/types';
import { Baddie, BADDIE_RADIUS } from '../game/Baddie';
import { Player } from '../game/Player';
import { dist, distToRect, hasLineOfSight, inCone, pointInRect, rectCenter, type Rect } from '../game/geometry';
import { Controls } from '../ui/Controls';
import { Hud } from '../ui/Hud';
import { button, panel, txt } from '../ui/widgets';

// How fast the "seen" meter fills / drains (fraction of full per second).
const METER_FILL = 0.55;
const METER_DRAIN = 0.3;
const PET_DISTRACTION = 5; // seconds a baddie is distracted

type Interactable =
  | { kind: 'pickup'; pickup: Pickup; rect: Rect }
  | { kind: 'target'; target: Target; rect: Rect }
  | { kind: 'hide'; hide: Hide; rect: Rect };

export class GameScene extends Phaser.Scene {
  private level!: LevelDef;
  private world!: World;
  private solids: Rect[] = [];
  private player!: Player;
  private baddies: Baddie[] = [];
  private controls!: Controls;
  private hud!: Hud;
  private hint!: Phaser.GameObjects.Text;
  private marker!: Phaser.GameObjects.Arc;
  private spriteByUid = new Map<string, Phaser.GameObjects.Image>();
  private extraObjs = new Map<string, Phaser.GameObjects.Container>();

  private stepIndex = 0;
  private inventory: string[] = []; // uids
  private meter = 0;
  private maxMeter = 0;
  private elapsed = 0;
  private petsLeft = 0;
  private hiding: Hide | null = null;
  private preHide = { x: 0, y: 0 };
  private finished = false;
  private paused = false;
  private pauseLayer?: Phaser.GameObjects.Container;
  private touch = false;

  constructor() {
    super('Game');
  }

  init(data: { levelId: number }): void {
    const level = getLevel(data.levelId);
    if (!level) throw new Error(`No level ${data.levelId}`);
    this.level = level;
    this.stepIndex = 0;
    this.inventory = [];
    this.meter = 0;
    this.maxMeter = 0;
    this.elapsed = 0;
    this.petsLeft = level.petHelp;
    this.hiding = null;
    this.finished = false;
    this.paused = false;
    this.baddies = [];
    this.spriteByUid.clear();
    this.extraObjs.clear();
  }

  create(): void {
    const rooms: Record<string, RoomJson> = {};
    for (const id of this.level.rooms) rooms[id] = this.cache.json.get('room:' + id) as RoomJson;
    this.world = buildWorld(this.level, rooms);
    this.solids = blockers(this.world);

    this.drawWorld();

    const spawn = this.world.spawn;
    this.player = new Player(this, spawn.x, spawn.y, t('you'));
    this.tweens.add({ targets: this.player.youLabel, alpha: 0, delay: 5000, duration: 800 });

    for (const mb of this.world.baddies) {
      const def = this.level.baddies.find((b) => b.id === mb.id);
      if (!def) continue;
      const kind = BADDIE_KINDS[def.kind];
      this.baddies.push(
        new Baddie(this, {
          id: mb.id,
          kind: def.kind,
          name: L(kind.name),
          x: mb.patrol[0].x,
          y: mb.patrol[0].y,
          speed: def.speed ?? kind.speed,
          range: def.range ?? kind.range,
          halfAngle: Phaser.Math.DegToRad(def.halfAngle ?? kind.halfAngle),
          patrol: mb.patrol,
        }),
      );
    }

    // Camera follows Anisha. Bounds are padded so a small level sits in the middle of the screen.
    const b = this.world.bounds;
    const bw = Math.max(b.w, W);
    const bh = Math.max(b.h, H);
    this.cameras.main.setBounds(b.x - (bw - b.w) / 2, b.y - (bh - b.h) / 2, bw, bh);
    this.cameras.main.startFollow(this.player.follow, true, 0.12, 0.12);
    this.cameras.main.centerOn(spawn.x, spawn.y);

    this.touch = this.sys.game.device.input.touch || new URLSearchParams(location.search).has('touch');
    this.controls = new Controls(this, this.touch);
    this.hud = new Hud(this, this.level, this.petsLeft, () => this.controls.queue('pet'), () => this.controls.queue('pause'));
    this.hud.setSteps(0);

    this.hint = txt(this, 0, 0, '', 20, hex(C.bg), { backgroundColor: '#f2f2ef', padding: { x: 10, y: 3 } }).setOrigin(0.5, 1).setDepth(50).setVisible(false);
    this.marker = this.add.circle(0, 0, 40).setStrokeStyle(3, C.white, 0.9).setDepth(2);
    this.tweens.add({ targets: this.marker, scale: { from: 0.8, to: 1.35 }, alpha: { from: 1, to: 0.15 }, duration: 1000, repeat: -1 });
    this.placeMarker();

    if (!this.touch) {
      txt(this, W / 2, H - 28, t('keysHelp'), 16, hex(0x8a8a85)).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    }
    this.cameras.main.fadeIn(250, 10, 10, 11);
  }

  // ---------- drawing ----------

  private dashedRect(g: Phaser.GameObjects.Graphics, r: Rect, color: number): void {
    g.lineStyle(3, color, 1);
    const dash = (x1: number, y1: number, x2: number, y2: number) => {
      const d = Math.hypot(x2 - x1, y2 - y1);
      for (let s = 0; s < d; s += 14) {
        const e = Math.min(s + 8, d);
        g.lineBetween(x1 + ((x2 - x1) * s) / d, y1 + ((y2 - y1) * s) / d, x1 + ((x2 - x1) * e) / d, y1 + ((y2 - y1) * e) / d);
      }
    };
    dash(r.x, r.y, r.x + r.w, r.y);
    dash(r.x + r.w, r.y, r.x + r.w, r.y + r.h);
    dash(r.x + r.w, r.y + r.h, r.x, r.y + r.h);
    dash(r.x, r.y + r.h, r.x, r.y);
  }

  private drawWorld(): void {
    const w = this.world;
    this.cameras.main.setBackgroundColor(C.bg);

    for (const room of w.rooms) {
      this.add.image(room.floorX, room.floorY, 'floor:' + room.id).setOrigin(0).setScale(WORLD_SCALE).setDepth(0);
      txt(this, room.interior.x + 18, room.interior.y + room.interior.h - 34, room.name.toUpperCase(), 18, hex(C.dim)).setLetterSpacing(3).setDepth(1);
    }

    // open doors show as a dark gap in the wall
    const gaps = this.add.graphics().setDepth(1);
    gaps.fillStyle(0x121214, 1);
    for (const d of w.doorways) gaps.fillRect(d.x, d.y, d.w, d.h);

    for (const s of w.safes) this.dashedRect(this.add.graphics().setDepth(1), s, 0x8a8a85);

    for (const e of w.exits) {
      const c = rectCenter(e.rect);
      if (e.label) {
        const vertical = e.side === 'N' || e.side === 'S';
        txt(this, c.x, vertical ? (e.side === 'S' ? e.rect.y + e.rect.h - 10 : e.rect.y + 10) : c.y, L(e.label), 16, hex(0x8a8a85))
          .setOrigin(0.5, e.side === 'S' ? 1 : 0.5)
          .setDepth(1);
      }
    }

    for (const s of w.sprites) {
      const img = this.add.image(s.cx, s.cy, 'items', s.frame).setScale(WORLD_SCALE / 2).setAngle(s.angle).setDepth(2);
      this.spriteByUid.set(s.uid, img);
    }

    for (const h of w.hides) {
      const g = this.add.graphics().setDepth(3);
      this.dashedRect(g, h.rect, 0xbdbdb8);
      const eye = this.add.graphics({ x: h.rect.x + 22, y: h.rect.y + 18 }).setDepth(3);
      eye.fillStyle(C.bg, 0.85);
      eye.fillCircle(0, 0, 15);
      eye.lineStyle(2, C.white, 1);
      eye.beginPath();
      eye.moveTo(-9, 0);
      eye.lineTo(-3, -5);
      eye.lineTo(3, -5);
      eye.lineTo(9, 0);
      eye.lineTo(3, 5);
      eye.lineTo(-3, 5);
      eye.closePath();
      eye.strokePath();
      eye.lineBetween(-9, -9, 9, 9);
    }

    for (const tg of w.targets) {
      if (tg.kind !== 'shoes') continue;
      const c = rectCenter(tg.rect);
      const g = this.add.graphics();
      for (const dx of [-24, 4]) {
        g.fillStyle(0x6a6a66, 1);
        g.fillRoundedRect(dx, -6, 20, 40, 10);
        g.lineStyle(2, C.white, 1);
        g.strokeRoundedRect(dx, -6, 20, 40, 10);
      }
      g.setRotation(-0.17);
      const tag = txt(this, 0, -36, L(tg.label), 16, hex(C.bg), { backgroundColor: '#f2f2ef', padding: { x: 10, y: 2 } }).setOrigin(0.5, 1);
      this.extraObjs.set(tg.id, this.add.container(c.x, c.y, [g, tag]).setDepth(3));
    }
  }

  private currentStep() {
    return this.level.steps[this.stepIndex];
  }

  /** Puts the pulsing ring on whatever the current step needs. */
  private placeMarker(): void {
    const step = this.currentStep();
    let r: Rect | undefined;
    if (step?.type === 'pickup') r = this.world.pickups.find((p) => p.uid === step.item)?.rect;
    else if (step?.type === 'use') r = this.world.targets.find((p) => p.id === step.target)?.rect;
    else if (step?.type === 'reach') r = this.world.exits.find((p) => p.id === step.zone)?.rect;
    this.marker.setVisible(!!r);
    if (r) {
      const c = rectCenter(r);
      this.marker.setPosition(c.x, c.y).setRadius(Math.max(36, Math.min(r.w, r.h) / 2 + 12));
    }
  }

  // ---------- game loop ----------

  update(_time: number, delta: number): void {
    if (this.controls.take('pause') && !this.finished) this.togglePause();
    if (this.finished || this.paused) return;
    const dt = Math.min(delta / 1000, 0.05);
    this.elapsed += dt;

    if (this.controls.take('hide')) this.toggleHide();
    if (this.controls.take('use')) this.tryUse();
    if (this.controls.take('pet')) this.callPet();

    const sneaking = this.controls.sneaking();
    if (!this.hiding) {
      const m = this.controls.move();
      this.player.move(m.x, m.y, sneaking ? SNEAK_SPEED : WALK_SPEED, dt, this.solids, this.world.bounds);
    }
    this.player.hidden = !!this.hiding;
    this.player.render(sneaking);

    for (const b of this.baddies) b.update(dt);
    this.detect(dt, sneaking);
    if (this.finished) return;

    const step = this.currentStep();
    if (step?.type === 'reach') {
      const z = this.world.exits.find((zz) => zz.id === step.zone);
      if (z && distToRect(this.player.x, this.player.y, z.rect) < PLAYER_RADIUS * 0.6) this.completeStep();
    }

    this.updateHint();
    this.hud.setMeter(this.meter);
  }

  private detect(dt: number, sneaking: boolean): void {
    const px = this.player.x;
    const py = this.player.y;
    const covered = !!this.hiding || this.world.safes.some((s) => pointInRect(px, py, s));
    let sees = false;
    let touched = false;
    for (const b of this.baddies) {
      let seesNow = false;
      if (!covered && !b.distracted) {
        seesNow = inCone(b.x, b.y, b.facing, b.cfg.halfAngle, b.cfg.range, px, py) && hasLineOfSight(b.x, b.y, px, py, this.solids);
        if (dist(b.x, b.y, px, py) < BADDIE_RADIUS + PLAYER_RADIUS) touched = true;
      }
      if (seesNow) sees = true;
      b.drawCone(this.solids, seesNow);
    }
    if (sees) this.meter += METER_FILL * (sneaking ? 0.5 : 1) * dt;
    else this.meter -= METER_DRAIN * dt;
    this.meter = Phaser.Math.Clamp(this.meter, 0, 1);
    this.maxMeter = Math.max(this.maxMeter, this.meter);
    if (this.meter >= 1 || touched) this.caught();
  }

  private caught(): void {
    if (this.finished) return;
    this.finished = true;
    const culprit = this.baddies[0]?.cfg.kind ?? 'teacher';
    this.cameras.main.shake(250, 0.006);
    this.time.delayedCall(450, () => this.scene.start('Caught', { levelId: this.level.id, kind: culprit }));
  }

  // ---------- actions ----------

  private reachable(): Interactable | null {
    if (this.hiding) return { kind: 'hide', hide: this.hiding, rect: this.hiding.rect };
    const px = this.player.x;
    const py = this.player.y;
    let best: Interactable | null = null;
    let bestD = REACH;
    const consider = (i: Interactable) => {
      const d = distToRect(px, py, i.rect);
      if (d < bestD) {
        best = i;
        bestD = d;
      }
    };
    for (const pickup of this.world.pickups) if (!this.inventory.includes(pickup.uid)) consider({ kind: 'pickup', pickup, rect: pickup.rect });
    for (const target of this.world.targets) consider({ kind: 'target', target, rect: target.rect });
    for (const hide of this.world.hides) consider({ kind: 'hide', hide, rect: hide.rect });
    return best;
  }

  private itemName(uid: string): string {
    return this.world.pickups.find((p) => p.uid === uid)?.name ?? uid;
  }

  private refreshSlots(): void {
    this.hud.drawSlots(this.inventory.map((uid) => this.world.pickups.find((p) => p.uid === uid)!.frame));
  }

  private tryUse(): void {
    const near = this.reachable();
    if (!near) return;
    if (near.kind === 'hide') {
      this.toggleHide();
      return;
    }
    if (near.kind === 'pickup') {
      if (this.inventory.length >= MAX_ITEMS) return;
      this.inventory.push(near.pickup.uid);
      this.spriteByUid.get(near.pickup.uid)?.setVisible(false);
      this.refreshSlots();
      this.syncSteps();
      return;
    }
    const step = this.currentStep();
    if (step?.type === 'use' && step.target === near.target.id) {
      if (!this.inventory.includes(step.item)) {
        this.hud.toast(t('needItem', { item: this.itemName(step.item) }));
        return;
      }
      this.inventory = this.inventory.filter((u) => u !== step.item);
      this.refreshSlots();
      const obj = this.extraObjs.get(near.target.id) ?? this.spriteByUid.get(near.target.id);
      if (obj) this.tweens.add({ targets: obj, scale: { from: obj.scale * 1.4, to: obj.scale }, duration: 300, ease: 'Back.out' });
      this.completeStep();
      return;
    }
    const wanted = this.level.steps.find((s) => s.type === 'use' && s.target === near.target.id);
    if (wanted && wanted.type === 'use' && !this.inventory.includes(wanted.item)) this.hud.toast(t('needItem', { item: this.itemName(wanted.item) }));
    else this.hud.toast(t('notYet'));
  }

  /** Auto-completes pickup steps whose item is already in the bag. */
  private syncSteps(): void {
    let s = this.currentStep();
    while (s && s.type === 'pickup' && this.inventory.includes(s.item)) {
      this.stepIndex++;
      s = this.currentStep();
    }
    this.afterStepChange();
  }

  private completeStep(): void {
    this.stepIndex++;
    this.syncSteps();
  }

  private afterStepChange(): void {
    this.hud.setSteps(this.stepIndex);
    this.placeMarker();
    if (this.stepIndex >= this.level.steps.length) this.win();
  }

  private win(): void {
    if (this.finished) return;
    this.finished = true;
    const msg = txt(this, W / 2, H / 2, t('prankDone'), 96, hex(C.white), { fontFamily: "'Creepster', cursive" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200)
      .setScale(0);
    this.tweens.add({ targets: msg, scale: 1, duration: 450, ease: 'Back.out' });
    this.time.delayedCall(1300, () => this.scene.start('Complete', { levelId: this.level.id, maxMeter: this.maxMeter, time: this.elapsed }));
  }

  private toggleHide(): void {
    if (this.hiding) {
      this.player.setPosition(this.preHide.x, this.preHide.y);
      this.hiding = null;
      return;
    }
    const near = this.reachable();
    if (near?.kind !== 'hide') return;
    this.preHide = { x: this.player.x, y: this.player.y };
    this.hiding = near.hide;
    const c = rectCenter(near.hide.rect);
    this.player.setPosition(c.x, c.y);
  }

  private callPet(): void {
    if (this.petsLeft <= 0) {
      this.hud.toast(t('noPets'));
      return;
    }
    if (this.baddies.length === 0) return;
    const nearest = [...this.baddies].sort((a, b) => dist(a.x, a.y, this.player.x, this.player.y) - dist(b.x, b.y, this.player.x, this.player.y))[0];
    this.petsLeft--;
    this.hud.setPets(this.petsLeft);
    this.hud.toast(t('petRuns'));
    // a pet runs from Anisha to the baddie
    const paw = this.add.circle(this.player.x, this.player.y, 12, C.white).setDepth(8);
    this.tweens.add({
      targets: paw,
      x: nearest.x + 40,
      y: nearest.y + 20,
      duration: 700,
      onComplete: () => {
        nearest.distract(PET_DISTRACTION, nearest.x + 120, nearest.y + 80);
        this.tweens.add({ targets: paw, alpha: 0, duration: 400, delay: PET_DISTRACTION * 700, onComplete: () => paw.destroy() });
      },
    });
  }

  private updateHint(): void {
    const near = this.reachable();
    if (!near || this.finished) {
      this.hint.setVisible(false);
      return;
    }
    const key = (k: string) => (this.touch ? '' : `${k}: `);
    let msg = '';
    if (near.kind === 'pickup') msg = key('E') + t('grab', { item: near.pickup.name });
    else if (near.kind === 'target') {
      const wanted = this.level.steps.find((s) => s.type === 'use' && s.target === near.target.id);
      const itemUid = wanted && wanted.type === 'use' ? wanted.item : '';
      msg = key('E') + (wanted && this.inventory.includes(itemUid) ? t('useItem', { item: this.itemName(itemUid) }) : L(near.target.label));
    } else msg = key('H') + (this.hiding ? t('getOut') : t('hideHere'));
    this.hint.setText(msg).setPosition(this.player.x, this.player.y - PLAYER_RADIUS - 12).setVisible(true);
  }

  // ---------- pause ----------

  private togglePause(): void {
    this.paused = !this.paused;
    if (!this.paused) {
      this.pauseLayer?.destroy();
      this.pauseLayer = undefined;
      return;
    }
    const layer = this.add.container(0, 0).setScrollFactor(0).setDepth(300);
    const dim = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setInteractive();
    layer.add([
      dim,
      panel(this, W / 2 - 220, H / 2 - 190, 440, 380, { fill: C.chip, alpha: 1, stroke: C.panelStroke, radius: 22 }),
      txt(this, W / 2, H / 2 - 150, t('paused'), 48, hex(C.white), { fontFamily: "'Creepster', cursive" }).setOrigin(0.5, 0),
      button(this, W / 2, H / 2 - 50, 320, 64, t('resume'), { size: 28, onClick: () => this.togglePause() }),
      button(this, W / 2, H / 2 + 36, 320, 64, t('restart'), { style: 'ghost', size: 26, onClick: () => this.scene.restart({ levelId: this.level.id }) }),
      button(this, W / 2, H / 2 + 122, 320, 64, t('map'), { style: 'ghost', size: 26, onClick: () => this.scene.start('LevelMap', { levelId: this.level.id }) }),
    ]);
    layer.each((o: Phaser.GameObjects.GameObject) => (o as unknown as Phaser.GameObjects.Components.ScrollFactor).setScrollFactor(0));
    this.pauseLayer = layer;
  }
}
