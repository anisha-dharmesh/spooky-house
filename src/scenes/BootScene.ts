import Phaser from 'phaser';
import { FONT, TITLE_FONT } from '../config';
import { LEVELS } from '../levels';
import { roomFiles } from '../levels/rooms';
import { getSavedLang } from '../save';
import { setLang } from '../i18n';

/** Loads level maps and web fonts, builds small textures, then opens the title screen. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.atlas('items', 'assets/atlas/items_atlas@2x.png', 'assets/atlas/items_atlas@2x.json');
    const rooms = new Set(LEVELS.flatMap((l) => l.rooms));
    for (const id of rooms) {
      const f = roomFiles(id);
      this.load.json('room:' + id, f.json);
      this.load.image('floor:' + id, f.floor);
    }
  }

  create(): void {
    setLang(getSavedLang());
    const ready = Promise.all([
      document.fonts.load(`28px ${FONT}`, 'Anisha'),
      document.fonts.load(`28px ${FONT}`, 'हिन्दी अनीशा'),
      document.fonts.load(`40px ${TITLE_FONT}`, 'Spooky House'),
    ]).catch(() => undefined);
    // Never wait on fonts for more than a moment (slow networks, blocked fonts).
    const timeout = new Promise((r) => setTimeout(r, 2500));
    Promise.race([ready, timeout]).then(() => {
      this.makeTextures();
      this.scene.start('Title');
    });
  }

  private makeTextures(): void {
    if (!this.textures.exists('bat')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff, 1);
      g.fillPoints(
        [
          { x: 32, y: 10 }, { x: 24, y: 2 }, { x: 14, y: 4 }, { x: 16, y: 11 }, { x: 6, y: 12 }, { x: 12, y: 18 },
          { x: 24, y: 17 }, { x: 32, y: 26 }, { x: 40, y: 17 }, { x: 52, y: 18 }, { x: 58, y: 12 }, { x: 48, y: 11 },
          { x: 50, y: 4 }, { x: 40, y: 2 },
        ].map((p) => new Phaser.Math.Vector2(p.x, p.y)),
        true,
      );
      g.generateTexture('bat', 64, 28);
      g.destroy();
    }
    if (!this.textures.exists('floor')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x19191b, 1);
      g.fillRect(0, 0, 60, 60);
      g.fillStyle(0x222225, 1);
      g.fillRect(0, 0, 60, 2);
      g.fillRect(0, 0, 2, 60);
      g.generateTexture('floor', 60, 60);
      g.destroy();
    }
  }
}
