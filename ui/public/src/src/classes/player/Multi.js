export default class Multi {
  constructor(scene, keys) {
    if (!Array.isArray(keys)) keys = [keys];
    this.keys = keys.map(key => scene.input.keyboard.addKey(key));
  }

  isDown() {
    return this.keys.some(key => key.isDown);
  }

  isUp() {
    return this.keys.every(key => key.isUp);
  }
}
