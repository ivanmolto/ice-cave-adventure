import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // TODO: Evaluate to pack texture 'game_loading.jpg'
    this.load.image('game_loading', 'assets/images/game_loading.jpg');
    this.load.spritesheet('loading', 'assets/images/loading.png', {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create() {
    this.scene.start('Loading');
  }
}
