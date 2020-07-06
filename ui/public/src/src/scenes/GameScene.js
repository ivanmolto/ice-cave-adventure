import * as Phaser from 'phaser';
import UiButton from '../classes/UiButton';
import Player from '../classes/player/Player';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init() {
    this.scene.launch('UiGame');
  }

  createBackground() {
    this.add.image(0, 0, 'game_screen').setOrigin(0);
  }

  create() {
    this.model = this.sys.game.globals.model;

    var shapes_deco = this.cache.json.get('deco_shapes');
    this.matter.world.setBounds(0, 0, 1920, 1080);
    this.createBackground();

    this.matter.add.sprite(965, 676, 'deco_sprite', 'ground', {
      shape: shapes_deco.ground,
    });

    this.matter.add.sprite(270, 700, 'deco_sprite', 'bumper_01', {
      shape: shapes_deco.bumper_01,
    });
    this.matter.add.sprite(750, 800, 'deco_sprite', 'bumper_02', {
      shape: shapes_deco.bumper_02,
    });
    this.matter.add.sprite(1150, 780, 'deco_sprite', 'bumper_03', {
      shape: shapes_deco.bumper_03,
    });
    this.matter.add.sprite(1600, 600, 'deco_sprite', 'bumper_04', {
      shape: shapes_deco.bumper_04,
    });

    const hud_pause = this.add.image(100, 100, 'hud');
    hud_pause.setScale(0.5);

    if (this.model.musicOn === true) {
      this.createAudio();
    }

    this.createInput();

    var shapes_greenbot = this.cache.json.get('greenbot_shapes');
    this.player = new Player(
      this,
      960,
      0,
      'greenbot_sprite',
      'green_08',
      shapes_greenbot,
    );

    this.pauseButton = new UiButton(
      this,
      100,
      100,
      'pause1',
      'pause2',
      this.togglePause.bind(this),
    );
  }

  update() {
    if (this.player) this.player.update(this.cursors);

    const togglePause = () => {
      if (this.model.isPaused === true) {
        this.model.isPaused = false;
        this.removePauseScreen();
      } else {
        this.model.isPaused = true;
        this.displayPauseScreen();
      }
    };

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      togglePause();
    }
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  createAudio() {
    this.gameSound = this.sound.add('gameMusic', {
      loop: true,
      volume: 0.5,
    });
    this.gameSound.play();
  }

  dismissAudio() {
    this.model.musicOn = false;
    this.gameSound.stop();
    this.musicButton.destroy();
    this.muteButton = new UiButton(
      this,
      100,
      500,
      'mute1',
      'mute2',
      this.resumeAudio.bind(this),
    );
  }

  resumeAudio() {
    if (this.model.musicOn === false) {
      this.createAudio();
    }
    this.model.musicOn = true;

    this.muteButton.destroy();
    this.musicButton = new UiButton(
      this,
      100,
      500,
      'music1',
      'music2',
      this.dismissAudio.bind(this),
    );
  }

  startScene(targetScene) {
    if (this.model.isPaused === true) {
      this.menuButton.destroy();
      if (this.model.musicOn === true) {
        this.musicButton.destroy();
      } else {
        this.muteButton.destroy();
      }
      this.model.isPaused = false;
    }
    this.gameSound.stop();
    this.scene.stop('UiGame');
    this.scene.start(targetScene);
  }

  togglePause() {
    if (this.model.isPaused === true) {
      this.model.isPaused = false;
      this.removePauseScreen();
    } else {
      this.model.isPaused = true;
      this.displayPauseScreen();
    }
  }

  displayPauseScreen() {
    this.model.isPaused = true;

    this.menuButton = new UiButton(
      this,
      100,
      300,
      'menu1',
      'menu2',
      this.startScene.bind(this, 'Menu'),
    );

    if (this.model.musicOn === true) {
      this.musicButton = new UiButton(
        this,
        100,
        500,
        'music1',
        'music2',
        this.dismissAudio.bind(this),
      );
    } else {
      this.muteButton = new UiButton(
        this,
        100,
        500,
        'mute1',
        'mute2',
        this.resumeAudio.bind(this),
      );
    }
  }

  removePauseScreen() {
    this.model.isPaused = false;
    this.menuButton.destroy();
    this.musicButton.destroy();
  }
}
