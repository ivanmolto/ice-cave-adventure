import * as Phaser from 'phaser';

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('Loading');
  }

  preload() {
    this.loadImages();
    this.loadAudio();
  }

  create() {
    const background_loading = this.add.image(0, 0, 'game_loading');
    background_loading.setOrigin(0, 0);
    this.initializeAnimations();
    const botLoading = this.add
      .sprite(this.scale.width / 2, this.scale.height / 2, 'loading')
      .setOrigin(0.5, 0.5);
    botLoading.setScale(3);
    botLoading.anims.play('load');
    botLoading.on('animationcomplete-load', () => {
      this.startScene('Menu');
    });
  }

  loadImages() {
    // TODO: Evaluate to pack texture screens
    this.load.image('menu_screen', 'assets/images/menu_bg.jpg');
    this.load.image('game_screen', 'assets/images/game_bg.jpg');
    this.load.image('shop_screen', 'assets/images/shop_bg.jpg');

    this.load.image('play1', 'assets/images/ui/play_button_state_01.png');
    this.load.image('play2', 'assets/images/ui/play_button_state_02.png');
    this.load.image('store1', 'assets/images/ui/store_button_state_01.png');
    this.load.image('store2', 'assets/images/ui/store_button_state_02.png');
    this.load.image('buy1', 'assets/images/ui/buy_button_state_01.png');
    this.load.image('buy2', 'assets/images/ui/buy_button_state_02.png');
    this.load.image('menu1', 'assets/images/ui/back_button_state_01.png');
    this.load.image('menu2', 'assets/images/ui/back_button_state_02.png');
    this.load.image('music1', 'assets/images/ui/music_on_button_state_01.png');
    this.load.image('music2', 'assets/images/ui/music_on_button_state_02.png');
    this.load.image('mute1', 'assets/images/ui/music_off_button_state_01.png');
    this.load.image('mute2', 'assets/images/ui/music_off_button_state_02.png');
    this.load.image('pause1', 'assets/images/ui/pause_button_state_01.png');
    this.load.image('pause2', 'assets/images/ui/pause_button_state_02.png');
    this.load.image('hud', 'assets/images/ui/hud_bg.png');
    // TODO: Evaluate to pack texture snowflake
    this.load.image('snowflake_green', 'assets/images/snowflake_green.png');

    this.load.spritesheet('voltair', 'assets/images/voltair.png', {
      frameWidth: 128,
      frameHeight: 128,
    });

    this.load.spritesheet('joker', 'assets/images/joker.png', {
      frameWidth: 128,
      frameHeight: 128,
    });

    this.load.spritesheet('moolas', 'assets/images/moolas.png', {
      frameWidth: 334,
      frameHeight: 232,
    });

    // TODO: Evaluate this texture pack instead of individual png
    this.load.atlas(
      'buttons_sprite',
      'assets/images/buttons_sprites.png',
      'assets/images/buttons_sprites.json',
    );

    this.load.atlas(
      'title_sprite',
      'assets/images/title_sprites.png',
      'assets/images/title_sprites.json',
    );

    this.load.atlas(
      'store_sprite',
      'assets/images/store_sprites.png',
      'assets/images/store_sprites.json',
    );

    this.load.atlas(
      'deco_sprite',
      'assets/images/deco_sprites.png',
      'assets/images/deco_sprites.json',
    );
    this.load.json('deco_shapes', 'assets/shapes/deco_shapes.json');

    this.load.atlas(
      'greenbot_sprite',
      'assets/images/greenbot_sprites.png',
      'assets/images/greenbot_sprites.json',
    );
    this.load.json('greenbot_shapes', 'assets/shapes/greenbot_shapes.json');
  }

  loadAudio() {
    this.load.audio('shopMusic', [
      'assets/audio/shopMusic.mp3',
      'assets/audio/shopMusic.ogg',
    ]);
    this.load.audio('menuMusic', [
      'assets/audio/menuMusic.mp3',
      'assets/audio/menuMusic.ogg',
    ]);
    this.load.audio('gameMusic', [
      'assets/audio/gameMusic.mp3',
      'assets/audio/gameMusic.ogg',
    ]);
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
