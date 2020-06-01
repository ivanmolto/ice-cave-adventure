import * as Phaser from 'phaser';

export default class StoreScene extends Phaser.Scene {
  constructor() {
    super('Store');
  }

  create() {
    this.add.text(0, 0, 'This is a placeholder to check the StoreScene');
  }
}