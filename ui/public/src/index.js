import 'phaser';
import config from './config/config';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import UiScene from './scenes/UiScene';
import GameScene from './scenes/GameScene';

class Game extends Phaser.Game {
  constructor () {
    super(config);
    this.scene.add('Boot', BootScene);
    this.scene.add('Title', TitleScene);
    this.scene.add('Ui', UiScene);
    this.scene.add('Game', GameScene);
    this.scene.start('Boot');
  }
}
 
window.game = new Game();