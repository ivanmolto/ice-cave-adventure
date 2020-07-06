import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.model = this.sys.game.globals.model;

    const menu_bg = this.add.image(0, 0, 'menu_screen');
    menu_bg.setOrigin(0, 0);

    const cave = this.add.sprite(600, 675, 'title_sprite', 'ice_cave_teaser');
    cave.setScale(0.6);
    const cave_ad = this.add.sprite(600, 450, 'title_sprite', 'ice_cave_blurb');
    cave_ad.setScale(0.75);

    const store = this.add.sprite(1320, 675, 'title_sprite', 'store_teaser');
    store.setScale(0.6);
    const store_ad = this.add.sprite(1320, 450, 'title_sprite', 'shop_blurb');
    store_ad.setScale(0.75);

    const hud = this.add.image(100, 100, 'hud');
    hud.setScale(0.5);

    this.startGameButton = new UiButton(
      this,
      600,
      this.scale.height * 0.9,
      'play1',
      'play2',
      this.startScene.bind(this, 'Game'),
    );
    this.storeButton = new UiButton(
      this,
      1320,
      this.scale.height * 0.9,
      'store1',
      'store2',
      this.startScene.bind(this, 'Shop'),
    );

    if (this.model.musicOn === true) {
      this.createAudio();
      this.musicButton = new UiButton(
        this,
        100,
        100,
        'music1',
        'music2',
        this.dismissAudio.bind(this),
      );
    } else {
      this.muteButton = new UiButton(
        this,
        100,
        100,
        'mute1',
        'mute2',
        this.resumeAudio.bind(this),
      );
    }

    this.initializeAnimations();
    const voltAir = this.add.sprite(875, 850, 'voltair').setOrigin(0.5, 0.5);
    voltAir.setScale(2);
    voltAir.anims.play('welcome');

    const promo = this.add.sprite(1318, 445, 'moolas').setOrigin(0.5, 0.5);
    promo.anims.play('sale');
  }

  createAudio() {
    this.menuSound = this.sound.add('menuMusic', {
      loop: true,
      volume: 0.5,
    });
    this.menuSound.play();
  }

  dismissAudio() {
    this.model.musicOn = false;
    this.menuSound.stop();
    this.musicButton.destroy();
    this.muteButton = new UiButton(
      this,
      100,
      100,
      'mute1',
      'mute2',
      this.resumeAudio.bind(this),
    );
  }

  resumeAudio() {
    this.model.musicOn = true;
    this.menuSound.play();
    this.muteButton.destroy();
    this.musicButton = new UiButton(
      this,
      100,
      100,
      'music1',
      'music2',
      this.dismissAudio.bind(this),
    );
  }

  startScene(targetScene) {
    this.menuSound.stop();
    this.scene.start(targetScene);
  }

  initializeAnimations() {
    this.anims.create({
      key: 'welcome',
      frames: this.anims.generateFrameNumbers('voltair', { start: 7, end: 10 }),
      frameRate: 2,
      repeat: -1,
    });
    this.anims.create({
      key: 'sale',
      frames: this.anims.generateFrameNumbers('moolas', { start: 0, end: 10 }),
      frameRate: 3,
      repeat: -1,
    });
  }
}
