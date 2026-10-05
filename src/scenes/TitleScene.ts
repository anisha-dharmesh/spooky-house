import Phaser from 'phaser';
import { C, TITLE_FONT, hex } from '../config';
import { getLang, onLangChange, setLang, t, type Lang } from '../i18n';
import { LEVELS } from '../levels';
import { hasProgress, isCompleted, saveLang } from '../save';
import { button, drawMoon, nightBackground, txt } from '../ui/widgets';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const off = onLangChange(() => this.scene.restart());
    this.events.once('shutdown', off);

    nightBackground(this);
    drawMoon(this, 1100, 116, 60);

    const bats: [number, number, number, number, number][] = [
      [790, 104, 64, 0x3a3a3c, 1600],
      [902, 160, 44, 0x4a4a4d, 1300],
      [1030, 218, 36, 0x3a3a3c, 1900],
    ];
    for (const [x, y, w, tint, ms] of bats) {
      const b = this.add.image(x, y, 'bat').setTint(tint).setDisplaySize(w, (w * 28) / 64);
      this.tweens.add({ targets: b, y: y - 8, duration: ms / 2, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    this.drawHouse();

    // text and buttons
    txt(this, 80, 112, t('anisha'), 30, hex(0xbdbdb8)).setLetterSpacing(2);
    txt(this, 80, 150, t('gameTitle'), 112, hex(C.white), { fontFamily: TITLE_FONT }).setLetterSpacing(2);
    txt(this, 80, 296, t('tagline'), 28, hex(0xc9c9c4), { wordWrap: { width: 600 } });

    const next = LEVELS.find((l) => !isCompleted(l.id)) ?? LEVELS[LEVELS.length - 1];
    button(this, 80 + 170, 440, 340, 72, t('play'), { size: 36, onClick: () => this.scene.start('LevelMap') });
    if (hasProgress()) {
      button(this, 80 + 170, 516, 340, 60, t('continue', { n: next.id }), {
        style: 'ghost',
        size: 26,
        onClick: () => this.scene.start('Game', { levelId: next.id }),
      });
    }
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('LevelMap'));

    this.languageToggle(80, hasProgress() ? 578 : 502);
  }

  private languageToggle(x: number, y: number): void {
    const g = this.add.graphics();
    g.fillStyle(C.chip, 1);
    g.fillRoundedRect(x, y, 230, 52, 26);
    g.lineStyle(2, C.panelStroke, 1);
    g.strokeRoundedRect(x, y, 230, 52, 26);
    const opt = (lang: Lang, label: string, ox: number, w: number) => {
      const active = getLang() === lang;
      const bg = this.add.graphics();
      if (active) {
        bg.fillStyle(C.white, 1);
        bg.fillRoundedRect(x + ox, y + 4, w, 44, 22);
      }
      txt(this, x + ox + w / 2, y + 26, label, 20, hex(active ? C.bg : C.light)).setOrigin(0.5);
      this.add
        .zone(x + ox + w / 2, y + 26, w, 44)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => {
          if (getLang() === lang) return;
          setLang(lang);
          saveLang(lang);
        });
    };
    opt('en', 'English', 4, 108);
    opt('hi', 'हिन्दी', 116, 110);
  }

  private drawHouse(): void {
    const g = this.add.graphics();
    // ground glow and ground
    g.fillStyle(0xc8c8c3, 0.06);
    g.fillRect(0, 620, 1280, 70);
    g.fillStyle(0x141415, 1);
    g.fillRect(0, 660, 1280, 60);
    // dead tree
    g.lineStyle(10, 0x2c2c2f, 1);
    const tree: [number, number, number, number][] = [
      [660, 700, 660, 530], [660, 580, 610, 500], [610, 500, 580, 470], [610, 500, 620, 450],
      [660, 550, 720, 480], [720, 480, 750, 460], [720, 480, 710, 430], [660, 530, 655, 440],
    ];
    for (const [x1, y1, x2, y2] of tree) g.lineBetween(x1, y1, x2, y2);
    // gravestones
    g.fillStyle(0x2a2a2d, 1);
    g.fillRoundedRect(480, 610, 44, 60, { tl: 22, tr: 22, bl: 0, br: 0 });
    g.fillStyle(0x232325, 1);
    g.fillRoundedRect(540, 626, 36, 46, { tl: 18, tr: 18, bl: 0, br: 0 });
    // the house
    const hx = 760;
    const hy = 250;
    g.fillStyle(0x1a1a1c, 1);
    g.fillTriangle(hx + 20, hy + 70, hx + 220, hy, hx + 420, hy + 70);
    g.fillRect(hx + 300, hy + 4, 30, 50);
    g.fillStyle(0x161618, 1);
    g.fillRect(hx + 40, hy + 70, 360, 360);
    g.lineStyle(2, 0x2a2a2d, 1);
    g.strokeRect(hx + 40, hy + 70, 360, 360);
    const lit = new Set([0, 3, 5, 10]);
    const bright = new Set([0, 10]);
    for (let i = 0; i < 12; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const wx = hx + 40 + 26 + col * (52 + 22 + 6);
      const wy = hy + 70 + 24 + row * (52 + 22 + 6);
      const fill = bright.has(i) ? 0xd8d8d2 : lit.has(i) ? 0x8a8a85 : 0x0d0d0e;
      const win = this.add.rectangle(wx, wy, 52, 52, fill).setOrigin(0).setStrokeStyle(3, 0x2a2a2d);
      if (bright.has(i)) {
        this.tweens.add({ targets: win, alpha: { from: 1, to: 0.35 }, duration: 160, yoyo: true, repeat: -1, repeatDelay: i === 0 ? 3800 : 5800 });
      }
    }
    g.fillStyle(C.bg, 1);
    g.fillRoundedRect(hx + 190, hy + 340, 60, 90, { tl: 30, tr: 30, bl: 0, br: 0 });
    g.lineStyle(3, 0x2a2a2d, 1);
    g.strokeRoundedRect(hx + 190, hy + 340, 60, 90, { tl: 30, tr: 30, bl: 0, br: 0 });
  }
}
