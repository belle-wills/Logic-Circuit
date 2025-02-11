/**
 * Evaluates a logic gate based on its type and inputs
 * @param {string} type - The type of the logic gate (e.g., 'AND', 'OR', 'NOT', 'XOR')
 * @param {Array<boolean>} inputs - An array of boolean inputs for the gate
 * @returns {boolean|null} - The output of the gate, or `null` for invalid inputs
 */
export function evaluateGate(type, inputs) {
  if (!Array.isArray(inputs)) {
    console.error(`Invalid inputs: ${inputs}. Expected an array of boolean values.`);
    return null;
  }

  // Norm the gate type for case-insensitive comparison
  const normalizedType = type.toUpperCase();

  // Perform the logic gate evaluation
  switch (normalizedType) {
    case 'AND':
      return inputs.every(Boolean); // Returns true if all inputs are true
    case 'OR':
      return inputs.some(Boolean); // Returns true if at least one input is true
    case 'NOT':
      if (!validateInputs(normalizedType, inputs)) return null;
      return !inputs[0]; // Negates the single input
    case 'XOR':
      if (!validateInputs(normalizedType, inputs)) return null;
      return inputs[0] !== inputs[1]; // Returns true if inputs are different
    default:
      console.error(`Unknown gate type: ${type}`);
      return null;
  }
}

/**
 * Validates the inputs for a specific logic gate type
 * @param {string} type - The type of the logic gate
 * @param {Array<boolean>} inputs - The inputs to validate
 * @returns {boolean} - True if the inputs are valid for the gate type - false otherwise
 */
export function validateInputs(type, inputs) {
  const normalizedType = type.toUpperCase();

  switch (normalizedType) {
    case 'NOT':
      if (inputs.length !== 1) {
        console.error(`Gate 'NOT' requires exactly one input, received: ${inputs.length}`);
        return false;
      }
      return true;
    case 'XOR':
      if (inputs.length !== 2) {
        console.error(`Gate 'XOR' requires exactly two inputs, received: ${inputs.length}`);
        return false;
      }
      return true;
    case 'AND':
    case 'OR':
      if (inputs.length < 1) {
        console.error(`Gate '${normalizedType}' requires at least one input, received: ${inputs.length}`);
        return false;
      }
      return true;
    default:
      console.error(`Unknown gate type: ${type}`);
      return false;
  }
}
