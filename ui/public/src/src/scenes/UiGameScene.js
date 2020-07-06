import * as Phaser from 'phaser';

export default class UiScene extends Phaser.Scene {
  constructor() {
    super('UiGame');
  }

  init() {
    this.gameScene = this.scene.get('Game');
  }

  create() {
    this.setupUiElements();
  }

  setupUiElements() {
    // this.scoreText = this.add.text(35, 8, 'Snowflakes: 0', {
    //  fontSize: '25px',
    //  fill: '#ffffff',
    // });
    this.snowflakeImage = this.add
      .image(100, 980, 'snowflake_green')
      .setScale(1.5);
  }

  setupEvents() {
    this.gameScene.events.on('updateScore', score => {
      this.scoreText.setText(`Snowflakes: ${score}`);
    });
  }
}
