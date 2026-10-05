import Phaser from 'phaser';
import { C, NOT_SEEN_LIMIT, TITLE_FONT, hex } from '../config';
import { L, t } from '../i18n';
import { getLevel, nextLevel } from '../levels';
import { recordResult } from '../save';
import { button, drawMoon, drawStar, nightBackground, txt } from '../ui/widgets';

export interface CompleteData {
  levelId: number;
  maxMeter: number; // highest "seen" meter reached, 0..1
  time: number; // seconds
}

export class CompleteScene extends Phaser.Scene {
  private data0!: CompleteData;

  constructor() {
    super('Complete');
  }

  init(data: CompleteData): void {
    this.data0 = data;
  }

  create(): void {
    const level = getLevel(this.data0.levelId)!;
    const notSeen = this.data0.maxMeter < NOT_SEEN_LIMIT;
    const quick = this.data0.time <= level.parTime;
    const stars = 1 + (notSeen ? 1 : 0) + (quick ? 1 : 0);
    recordResult(level.id, stars, Math.round(this.data0.time));

    nightBackground(this, 10);
    drawMoon(this, 1100, 108, 45);

    txt(this, 640, 106, t('levelComplete', { n: level.id }), 26, hex(C.mid)).setOrigin(0.5);
    txt(this, 640, 208, t('prankDone'), 120, hex(C.white), { fontFamily: TITLE_FONT }).setOrigin(0.5).setLetterSpacing(3);
    txt(this, 640, 312, L(level.completeText), 30, hex(0xd4d4cf), { wordWrap: { width: 900 }, align: 'center' }).setOrigin(0.5, 0);

    const starDefs = [
      { on: true, label: t('starPrankDone') },
      { on: notSeen, label: notSeen ? t('starNotSeenLabel') : t('starNotSeen') },
      { on: quick, label: quick ? t('starQuickLabel') : t('starBeQuicker') },
    ];
    starDefs.forEach((s, i) => {
      const cx = 640 + (i - 1) * 190;
      const g = this.add.graphics({ x: cx, y: 470 });
      drawStar(g, 0, 0, 48, s.on);
      g.setScale(0);
      this.tweens.add({ targets: g, scale: 1, duration: 450, delay: 300 + i * 350, ease: 'Back.out' });
      txt(this, cx, 530, s.label, 22, hex(s.on ? C.white : C.mid)).setOrigin(0.5);
    });

    const next = nextLevel(level.id);
    if (next) {
      button(this, 640 - 130, 640, 300, 72, t('nextLevel', { n: next.id }), { size: 30, onClick: () => this.scene.start('Game', { levelId: next.id }) });
    } else {
      button(this, 640 - 130, 640, 300, 72, t('map'), { size: 30, onClick: () => this.scene.start('LevelMap') });
    }
    button(this, 640 + 150, 640, 220, 72, t('playAgain'), { style: 'ghost', size: 26, onClick: () => this.scene.start('Game', { levelId: level.id }) });
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start(next ? 'Game' : 'LevelMap', { levelId: next?.id }));
  }
}
