import * as Phaser from 'phaser';

export default class UiScene extends Phaser.Scene {
  constructor() {
    super('UiGame');
  }

  init() {
    this.gameScene = this.scene.get('Game');
  }

  create() {
    this.add.text(0, 0, 'This is a placeholder to check the UiGameScene');
  }
}
