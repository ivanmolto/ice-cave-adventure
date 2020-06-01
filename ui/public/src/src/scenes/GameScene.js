import * as Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    this.scene.launch('Ui');
  }

  createBackground() {
    this.add.image(0, 0, 'background_gameplay').setOrigin(0);
  }

  create() {
    this.createBackground();
  }
}
