import Phaser from 'phaser';
import blueButton1 from "./../assets/images/ui/blue_button01.png"
import blueButton2 from "./../assets/images/ui/blue_button02.png"
import splashImg from "./../assets/images/splash.png"
import gameplayImg from "./../assets/images/gameplay.png"
import snowflakeGreenImg from "./../assets/images/snowflake_green.png"
import snowflakeImg from "./../assets/images/snowflake.png"
import botImg from "./../assets/images/green_eyes_left.png"


export default class BootScene extends Phaser.Scene {
  constructor () {
    super('Boot');
  }
 
  preload () {
    this.loadImages();
    this.loadSpriteSheets();
    this.loadAudio();
  }

  loadImages() {
    this.load.image('button1', blueButton1);
    this.load.image('button2', blueButton2);
    this.load.image('splash', splashImg);
    this.load.image('gameplay', gameplayImg);
    this.load.image('snowflakeGreen', snowflakeGreenImg);
  }

  loadSpriteSheets() {
    this.load.spritesheet('items', snowflakeImg, {
      frameWidth: 167,
      frameHeight: 160,
    });
    this.load.spritesheet('characters', botImg, {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  loadAudio() {
    // this.load.audio('music', ['assets/audio/music.ogg']);
    // this.load.audio('pickup', ['assets/audio/pickup.wav']);
  }
 
  create () {
    this.scene.start('Title');
  }
};