import * as Phaser from 'phaser';
import Multi from './Multi';

export default class Player {
  constructor(scene, x, y, texture, frame, shapes_greenbot) {
    this.scene = scene;
    this.mainPlayer = scene.matter.add.sprite(x, y, texture, frame, {
      shape: shapes_greenbot.green_08,
    });
    this.mainPlayer.velocity = 150;
    this.scene.add.existing(this);

    const { UP, RIGHT, DOWN, LEFT } = Phaser.Input.Keyboard.KeyCodes;

    this.upInput = new Multi(scene, [UP]);
    this.rightInput = new Multi(scene, [RIGHT]);
    this.downInput = new Multi(scene, [DOWN]);
    this.leftInput = new Multi(scene, [LEFT]);
  }

  update(cursors) {
    const sprite = this.mainPlayer;
    // const velocity = sprite.body.velocity;
    if (cursors.left.isDown) {
      this.mainPlayer.setVelocityX(-5);
    } else if (cursors.right.isDown) {
      this.mainPlayer.setVelocityX(5);
    }

    if (cursors.up.isDown) {
      this.mainPlayer.setVelocityY(-5);
    } else if (cursors.down.isDown) {
      this.mainPlayer.setVelocityY(5);
    }
  }
}
