import Phaser from 'phaser';
import UiButton from './../classes/UiButton';

export default class TitleScene extends Phaser.Scene {
  constructor () {
    super('Title');
  }
 
  preload () {
  }
 
  create () {
    this.add.image(0, 0, 'splash').setOrigin(0);
    this.startGameButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.85,
      'button1',
      'button2',
      'Start',
      this.startScene.bind(this, 'Game'),
    );
  }

  startScene(targetScene) {
    this.scene.start(targetScene);
  }
};