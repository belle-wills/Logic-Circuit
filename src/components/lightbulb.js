export class LightBulb {
  constructor(id, container) {
    this.id = id;
    this.container = container;
    this.element = document.getElementById(id) || this.createBulbElement();
    this.state = false; // Tracks if bulb is on or off
    this.attachSounds(); // Sets up sounds for on/off state
  }

  /**
   * Loads sound effects for when the bulb turns on/off
   */
  attachSounds() {
    this.bulbOnSound = new Audio("./assets/Audio/bulb.wav"); // Sound for turning on
    this.bulbOffSound = new Audio("./assets/Audio/bulb.wav"); // Sound for turning off
    
    this.bulbOnSound.volume = 0.5; // Set volume to avoid being too loud
    this.bulbOffSound.volume = 0.5;

    console.log(`🔊 Lightbulb sounds loaded for ${this.id}`);

    // Checks if the audio format is supported
    if (!this.bulbOnSound.canPlayType("audio/wav") || !this.bulbOffSound.canPlayType("audio/wav")) {
        console.error("❌ Lightbulb sound format not supported");
    }
  }

  /**
   * Creates the lightbulb element and appends it to the container
   * @returns {HTMLElement} The created lightbulb element
   */
  createBulbElement() {
    const bulb = document.createElement('div');
    bulb.id = this.id;
    bulb.className = 'lightbulb off'; // Default state is off
    this.container.appendChild(bulb);
    return bulb;
  }

  /**
   * Turns the bulb on visually and updates state
   */
  turnOn() {
    if (!this.state) {
      this.state = true;
      this.element.classList.remove('off');
      this.element.classList.add('on');
      console.log(`LightBulb ${this.id} is ON`);
    }
  }

  /**
   * Turns the bulb off visually and updates state
   */
  turnOff() {
    if (this.state) {
      this.state = false;
      this.element.classList.remove('on');
      this.element.classList.add('off');
      console.log(`💡 LightBulb ${this.id} is OFF`);
    }
  }

  /**
   * Updates the bulb state based on input signal
   * @param {boolean} inputSignal - True to turn on, false to turn off
   */
  updateState(inputSignal) {
    console.log(`💡 LightBulb ${this.id} received signal: ${inputSignal}`);
    if (inputSignal) {
        this.turnOn();
    } else {
        this.turnOff();
    }
  }

  /**
   * Returns the current state of the lightbulb
   * @returns {boolean} True if the bulb is on, false otherwise
   */
  getSignal() {
    return this.state;
  }

  /**
   * Turns the bulb on
   */
  turnOn() {
    this.element.classList.remove('off');
    this.element.classList.add('on');
    console.log(`LightBulb ${this.id} turned ON`); // Debugging log
  }

  /**
   * Turns the bulb off 
   */
  turnOff() {
    this.element.classList.remove('on');
    this.element.classList.add('off');
    console.log(`LightBulb ${this.id} turned OFF`); // Debugging log
  }
}
