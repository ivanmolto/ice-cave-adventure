import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const background = this.add.image(0, 0, 'title');
    background.setOrigin(0, 0);
    this.startGameButton = new UiButton(this, this.scale.width * 0.20, this.scale.height * 0.85, 'button1', 'button2', 'SETTINGS', this.startScene.bind(this, 'Settings'));
    this.startGameButton = new UiButton(this, this.scale.width / 2, this.scale.height * 0.85, 'button1', 'button2', 'PLAY', this.startScene.bind(this, 'Game'));
    this.startGameButton = new UiButton(this, this.scale.width * 0.80, this.scale.height * 0.85, 'button1', 'button2', 'CREDITS', this.startScene.bind(this, 'Credits'));
  }

  startScene(targetScene) {
    this.scene.start(targetScene);
  }
}
