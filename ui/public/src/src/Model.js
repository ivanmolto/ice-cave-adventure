export default class Model {
  // TODO: A place for NFTs?

  constructor() {
    this._musicOn = true;
    // this._soundOn = true;
    this._isPaused = false;
  }

  set musicOn(value) {
    this._musicOn = value;
  }

  get musicOn() {
    return this._musicOn;
  }

  set paused(value) {
    this._isPaused = value;
  }

  get paused() {
    return this._isPaused;
  }

  /* set soundOn(value) {
    this._soundOn = value;
  }

  get soundOn() {
    return this._soundOn;
  } */
}
