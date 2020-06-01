import * as Phaser from 'phaser';

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  create() {
    this.add.text(0, 0, 'This is a placeholder to check the SettingsScene');
  }
}
