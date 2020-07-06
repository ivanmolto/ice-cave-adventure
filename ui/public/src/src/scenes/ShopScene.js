import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super('Shop');
  }

  create() {
    this.model = this.sys.game.globals.model;

    const shop_bg = this.add.image(0, 0, 'shop_screen');
    shop_bg.setOrigin(0, 0);
    this.initializeAnimations();
    const jokerNoNo = this.add.sprite(500, 1000, 'joker').setOrigin(0.5, 0.5);
    jokerNoNo.setScale(2);
    jokerNoNo.anims.play('dont_be_joker');

    const promo = this.add.sprite(1740, 780, 'store_sprite', 'promo');

    const no_joker = this.add.sprite(725, 950, 'store_sprite', 'joker_blurb');
    no_joker.setScale(0.75);

    const ertpAndZoe = this.add.sprite(
      260,
      960,
      'store_sprite',
      'ertp-and-zoe',
    );
    ertpAndZoe.setScale(0.73);
    const lockSafety = this.add.sprite(100, 960, 'store_sprite', 'lock');
    lockSafety.setScale(0.5);

    const loot1Blurb = this.add.sprite(1510, 275, 'store_sprite', 'loot_box_1');
    loot1Blurb.setScale(0.65);
    const loot2Blurb = this.add.sprite(930, 175, 'store_sprite', 'loot_box_2');
    loot2Blurb.setScale(0.65);
    const loot3Blurb = this.add.sprite(650, 505, 'store_sprite', 'loot_box_3');
    loot3Blurb.setScale(0.65);

    this.buyLoot1Button = new UiButton(
      this,
      1590,
      395,
      'buy1',
      'buy2',
      this.buyLoot(),
    );

    this.buyLoot2Button = new UiButton(
      this,
      1010,
      295,
      'buy1',
      'buy2',
      this.buyLoot(),
    );

    this.buyLoot3Button = new UiButton(
      this,
      730,
      625,
      'buy1',
      'buy2',
      this.buyLoot(),
    );

    const loot1Asteroid = this.add.sprite(
      745,
      270,
      'store_sprite',
      'loot_box_1_asteroid',
    );
    loot1Asteroid.setScale(0.45);

    const loot2Asteroid = this.add.sprite(
      1300,
      350,
      'store_sprite',
      'loot_box_2_asteroid',
    );
    loot2Asteroid.setScale(0.45);

    const loot3Asteroid = this.add.sprite(
      440,
      580,
      'store_sprite',
      'loot_box_3_asteroid',
    );
    loot3Asteroid.setScale(0.45);

    const hud_menu = this.add.image(100, 100, 'hud');
    hud_menu.setScale(0.5);

    this.menuButton = new UiButton(
      this,
      100,
      100,
      'menu1',
      'menu2',
      this.startScene.bind(this, 'Menu'),
    );

    if (this.model.musicOn === true) {
      this.createAudio();
    }
  }

  createAudio() {
    this.shopSound = this.sound.add('shopMusic', {
      loop: true,
      volume: 0.5,
    });
    this.shopSound.play();
  }

  initializeAnimations() {
    this.anims.create({
      key: 'dont_be_joker',
      frames: this.anims.generateFrameNumbers('joker', { start: 0, end: 13 }),
      frameRate: 4,
      repeat: -1,
    });
  }

  buyLoot() {
    // TODO: Connect with wallet and Agoric local blockchain
  }

  startScene(targetScene) {
    this.shopSound.stop();
    this.scene.start(targetScene);
  }
}
