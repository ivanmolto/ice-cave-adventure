import * as Phaser from 'phaser';
import scenes from './scenes/scenes';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scene: scenes,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {
        y: 0,
      },
    },
  },
  roundPixels: true,
};

class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.start('Boot');
  }
}

window.onload = () => {
  window.game = new Game();
};
