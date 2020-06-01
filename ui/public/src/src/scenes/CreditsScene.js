import * as Phaser from 'phaser';

export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super('Credits');
  }

  create() {
    this.add.text(0, 0, 'This is a placeholder to check the CreditsScene');
  }
}