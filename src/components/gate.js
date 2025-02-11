export class Gate {
  constructor(type, id) {
    this.type = type.toUpperCase(); // Gate type is stored in uppercase for consistency
    this.id = id; // Unique identifier for each gate
    this.inputs = []; // Stores input signals for logic processing
    this.output = null; // Holds the evaluated output of the gate
  }

  /**
   * Evaluates the gate logic based on its inputs
   * @param {Array<boolean>} inputs - The input values for the gate
   * @returns {boolean|null} - The computed output or null if invalid
   */
  evaluate(inputs) {
    if (!Array.isArray(inputs)) {
      console.error(`Gate ${this.id} (${this.type}) requires an array of Boolean inputs.`);
      return null;
    }

    switch (this.type) {
      case 'AND': // True if all inputs are true
        return this._validateInputs(inputs, 2) ? inputs.every(Boolean) : null;

      case 'OR': // True if at least one input is true
        return this._validateInputs(inputs, 2) ? inputs.some(Boolean) : null;

      case 'NOT': // Inverts a single input
        return this._validateInputs(inputs, 1) ? !inputs[0] : null;

      case 'XOR': // True if exactly one input is true
        return this._validateInputs(inputs, 2) ? inputs[0] !== inputs[1] : null;

      default:
        console.error(`Unknown gate type: ${this.type}`); // Catch invalid gate types
        return null;
    }
  }

  /**
   * Validates the number and type of inputs for the gate
   * @param {Array<boolean>} inputs - The input signals
   * @param {number} expectedCount - The expected number of inputs
   * @returns {boolean} - True if inputs are valid, otherwise false
   */
  _validateInputs(inputs, expectedCount) {
    if (inputs.length !== expectedCount) {
      console.error(`⚠️ Gate ${this.id} (${this.type}) requires ${expectedCount} input(s), but got ${inputs.length}.`);
      return false;
    }

    if (!inputs.every((input) => typeof input === 'boolean')) {
      console.error(`⚠️ Gate ${this.id} (${this.type}) requires Boolean inputs only.`);
      return false;
    }

    return true; // Inputs are valid
  }

  /**
   * Transfers the signal from one gate to another via a wire
   * Ensures correct logic flow between connected components
   */
  transferSignal() {
    const inputGate = this.inputTerminal.parentNode.circuitBoard.gates.find(g => g.id === this.inputTerminal.parentNode.id);
    const outputGate = this.outputTerminal.parentNode.circuitBoard.gates.find(g => g.id === this.outputTerminal.parentNode.id);

    if (inputGate && outputGate) {
        const signal = inputGate.getSignal(); // Get signal from input gate
        console.log(`Transferring signal ${signal} from ${inputGate.id} to ${outputGate.id}`);
        outputGate.setInputs([signal]); // Ensure output gate receives updated input
    } else {
        console.error("Wire transfer failed: Invalid gates."); // Log error if gates are missing
    }
  }

  /**
   * Sets the input signals for the gate and updates output
   * Logic updates immediately when inputs change
   * @param {Array<boolean>} inputs - Array of Boolean input signals
   */
  setInputs(inputs) {
    this.inputs = inputs; // Store new input values
    console.log(`Gate ${this.id} (${this.type}) inputs set to: ${inputs}`);
    this.output = this.evaluate(inputs); // Compute the new output based on inputs
  }
}
