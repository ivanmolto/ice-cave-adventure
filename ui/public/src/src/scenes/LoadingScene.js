import * as Phaser from 'phaser';

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('Loading');
  }

  preload() {
    this.loadImages();
    this.loadSpriteSheets();
    this.loadAudio();
  }

  create() {
    this.initializeAnimations();
    const botLoading = this.add.sprite(this.scale.width / 2, this.scale.height / 2, 'loading').setOrigin(0.5, 0.5);
    botLoading.setScale(3);
    botLoading.anims.play('load');
    botLoading.on('animationcomplete-load', () => {
      this.startScene('Title');
    });
  }

  loadImages() {
    this.load.image('button1', 'assets/images/ui/blue_button_state_01.png');
    this.load.image('button2', 'assets/images/ui/blue_button_state_02.png');
    this.load.image('title', 'assets/images/title.png');
    this.load.image('background_gameplay', 'assets/images/background_gameplay.png');
  }

  loadSpriteSheets() {
    this.load.spritesheet('green_bot', 'assets/images/green_bot.png', { frameWidth: 128, frameHeight: 128 });
  }

  loadAudio() {
    this.load.audio('shopMusic', ['assets/audio/shopMusic.mp3']);
    this.load.audio('gameMusic', ['assets/audio/gameMusic.mp3']);
    this.load.audio('pickupStarSound', ['assets/audio/pickupStarSound.wav']);
  }

  initializeAnimations() {
    this.anims.create({
      key: 'load',
      frames: this.anims.generateFrameNumbers('loading', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: 1,
    });
  }

  startScene(targetScene) {
    this.scene.start(targetScene);
  }
}
