import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.spritesheet('loading', 'assets/images/loading.png', { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    this.scene.start('Loading');
  }
}
