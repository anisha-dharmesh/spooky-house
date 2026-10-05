import Phaser from 'phaser';
import { C, TITLE_FONT, hex } from '../config';
import { L, t } from '../i18n';
import { getLevel } from '../levels';
import { drawBaddieFace } from '../game/Baddie';
import { BADDIE_KINDS } from '../levels';
import { button, txt } from '../ui/widgets';

export class CaughtScene extends Phaser.Scene {
  private levelId = 1;
  private kind = 'teacher';

  constructor() {
    super('Caught');
  }

  init(data: { levelId: number; kind?: string }): void {
    this.levelId = data.levelId;
    this.kind = data.kind ?? 'teacher';
  }

  create(): void {
    const level = getLevel(this.levelId)!;
    this.add.rectangle(0, 0, 1280, 720, 0x050505).setOrigin(0);
    this.add.tileSprite(0, 0, 1280, 720, 'floor').setOrigin(0).setAlpha(0.5);

    const face = this.add.graphics({ x: 260, y: 360 });
    face.fillStyle(C.dark, 1);
    face.fillCircle(0, 0, 150);
    drawBaddieFace(face, 140);
    this.tweens.add({ targets: face, angle: { from: -2, to: 2 }, x: { from: 254, to: 266 }, duration: 100, yoyo: true, repeat: 8 });

    const baddieName = L(BADDIE_KINDS[this.kind]?.name ?? 'The baddie');
    txt(this, 460, 130, t('caught'), 140, hex(C.white), { fontFamily: TITLE_FONT }).setLetterSpacing(3);
    txt(this, 460, 300, t('sawYou', { name: baddieName }), 32, hex(C.light));

    const tipBg = this.add.graphics({ x: 460, y: 368 });
    tipBg.fillStyle(C.chip, 1);
    tipBg.fillRoundedRect(0, 0, 560, 100, 16);
    tipBg.lineStyle(2, C.panelStroke, 1);
    tipBg.strokeRoundedRect(0, 0, 560, 100, 16);
    txt(this, 480, 384, L(level.tip), 22, hex(C.light), { wordWrap: { width: 520 } });

    button(this, 460 + 130, 540, 260, 72, t('tryAgain'), { size: 32, onClick: () => this.scene.start('Game', { levelId: this.levelId }) });
    button(this, 460 + 345, 540, 130, 72, t('map'), { style: 'ghost', size: 26, onClick: () => this.scene.start('LevelMap', { levelId: this.levelId }) });
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('Game', { levelId: this.levelId }));
  }
}
