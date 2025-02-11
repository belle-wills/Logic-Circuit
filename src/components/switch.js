export class Switch {
  /**
   * Represents a switch component in the circuit
   * - Can toggle between on and off states
   * - Updates connected wires when toggled
   * @param {string} id - The unique ID of the switch
   * @param {HTMLElement} container - The container where the switch is placed
   * @param {CircuitBoard} circuitBoard - Reference to the main circuit board
   */
  constructor(id, container, circuitBoard) {
    this.id = id;
    this.container = container;
    this.state = false; // Default state is off
    this.circuitBoard = circuitBoard; // Keep track of the circuit board
    this.element = document.getElementById(id) || this.createSwitchElement();
    this.attachToggleEvent();
    this.attachSounds(); // Load switch sound effects
    this.setupEventListeners();
  }

  /**
   * Loads and attaches sound effects for the switch toggle
   * - Ensures sound is ready to play
   */
  attachSounds() {
    this.switchSound = new Audio("./assets/Audio/switch.wav");  
    this.switchSound.volume = 0.5; 

    this.switchSound.addEventListener("canplaythrough", () => {
        console.log(`✅ Switch sound loaded for ${this.id}`);
    });

    if (!this.switchSound.canPlayType("audio/wav")) {
        console.error(`❌ Switch sound format not supported: ${this.id}`);
    }
  }

  /**
   * Sets up event listeners for the switch
   * - Toggles the state when clicked
   * - Plays sound when toggled
   * - Updates circuit wires
   */
  setupEventListeners() {
    this.element.addEventListener("click", () => {
        this.isOn = !this.isOn;
        this.element.classList.toggle("on", this.isOn);
        this.switchSound.play();
        this.circuitBoard.updateAllWires(); // Updates connected components
    });
  }

  /**
   * Creates the switch element and appends it to the container
   * @returns {HTMLElement} The created switch element
   */
  createSwitchElement() {
    const switchElement = document.createElement('div');
    switchElement.id = this.id;
    switchElement.className = 'switch off'; // Default to OFF
    switchElement.textContent = ''; // No label needed
    this.container.appendChild(switchElement);
    return switchElement;
  }

  /**
   * Toggles the switch state and updates its visual representation
   * - Triggers circuit updates when switched
   */
  toggle() {
    this.state = !this.state;
    this.element.classList.toggle('on', this.state);
    this.element.classList.toggle('off', !this.state);
    console.log(`🔀 Switch ${this.id} toggled ${this.state ? 'ON' : 'OFF'}`);

    if (this.circuitBoard) {
        this.circuitBoard.updateAllWires(); // Refresh logic connections
    } else {
        console.error(`⚠️ No circuit board found for Switch ${this.id}`);
    }
  }

  /**
   * Attaches the click event to toggle the switch and trigger simulation
   */
  attachToggleEvent() {
    this.element.addEventListener('click', () => {
      this.toggle(); 
      this.container.dispatchEvent(new CustomEvent('simulate')); // Notify other components
    });
  }

  /**
   * Gets the current state of the switch
   * @returns {boolean} True if switch is ON, false if OFF
   */
  getSignal() {
    return this.state;
  }
}
