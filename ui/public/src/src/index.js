import * as Phaser from 'phaser';
import scenes from './scenes/scenes';
import Model from './Model';

const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  scene: scenes,
  physics: {
    default: 'matter',
    matter: {
      debug: true,
    },
  },
  roundPixels: true,
};

class Game extends Phaser.Game {
  constructor() {
    super(config);
    const model = new Model();
    this.globals = { model };
    this.scene.start('Boot');
  }
}

window.onload = () => {
  window.game = new Game();
};
