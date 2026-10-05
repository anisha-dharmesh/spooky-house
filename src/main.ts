import '@fontsource/creepster/400.css';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/kalam/400.css';
import Phaser from 'phaser';
import { C, H, W } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { LevelMapScene } from './scenes/LevelMapScene';
import { GameScene } from './scenes/GameScene';
import { CaughtScene } from './scenes/CaughtScene';
import { CompleteScene } from './scenes/CompleteScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: C.bg,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  scene: [BootScene, TitleScene, LevelMapScene, GameScene, CaughtScene, CompleteScene],
});

// Handy for poking at scenes from the browser console while developing (not in the published build).
if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
