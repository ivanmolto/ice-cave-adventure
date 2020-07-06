import * as Phaser from 'phaser';

export default class UiButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, key, hoverKey, targetCallback) {
    super(scene, x, y);
    this.scene = scene;
    this.x = x;
    this.y = y;

    // Background image of the button
    this.key = key;

    // Image that will be displayed when the player hovers over the button
    this.hoverKey = hoverKey;

    // Callback function that will be called when the player clicks the button
    this.targetCallback = targetCallback;
    this.createButton(key);
    this.scene.add.existing(this);
  }

  createButton(key) {
    this.button = this.scene.add.image(0, 0, key);
    // Make button interactive
    this.button.setInteractive();
    this.add(this.button);

    // Listen for events
    this.button.on('pointerdown', () => {
      this.targetCallback();
    });

    this.button.on('pointerover', () => {
      this.button.setTexture(this.hoverKey);
    });

    this.button.on('pointerout', () => {
      this.button.setTexture(this.key);
    });
  }
}
