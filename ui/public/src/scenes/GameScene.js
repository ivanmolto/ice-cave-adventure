import Phaser from 'phaser';
import Player from '../classes/Player';
 
export default class GameScene extends Phaser.Scene {
  constructor () {
    super('Game');
  }
  init() {
    this.scene.launch('Ui');
    this.score = 0;
  }
 
  create () {
    this.createAudio();
    this.createBackground();
    this.createSnowflakes();
    this.createPlayer();
    this.addCollisions();
    this.createInputs();
  }
  update() {
    this.player.update(this.cursors);
  }

  createAudio() {
    // this.music = this.sound.add('music', { loop: true, volume: 0.05 });
    // this.music.play();
    // this.pickup = this.sound.add('pickup', { loop: false, volume: 0.2 });
  }

  createBackground() {
    this.add.image(0, 0, 'gameplay').setOrigin(0);
  }

  createPlayer() {
    this.player = new Player(this, 500, 500, 'characters', 0);
  }

  createSnowflakes() {
    
  }

  spawnSnowflake() {
    
    
  }

  createInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  addCollisions() {
    // this.physics.add.collider(this.player, this.wall);
    // this.physics.add.overlap(this.player, this.snowflakes, this.collectSnowflake, null, this);
  }

  collectSnowflake(player, snowflake) {
    
  }
}