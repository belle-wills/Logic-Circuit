export class Wire {
  /**
   * Represents a wire connecting two terminals in the circuit
   * - Handles visual representation and updates position dynamically
   * @param {HTMLElement} inputTerminal - The input terminal element
   * @param {HTMLElement} outputTerminal - The output terminal element
   * @param {HTMLElement} container - The canvas or container where the wire is drawn
   */
  constructor(inputTerminal, outputTerminal, container) {
    if (!inputTerminal || !outputTerminal) {
        console.error("❌ ERROR: Invalid terminals for connection.", inputTerminal, outputTerminal);
        return;
    }

    this.inputTerminal = inputTerminal;
    this.outputTerminal = outputTerminal;
    this.container = container;
    this.element = this.createWireElement();
    this.updatePosition(); // Position the wire initially
  }

  /**
   * Creates a wire element and appends it to the container
   * - Sets initial styles for visibility and animation
   * @returns {HTMLElement} - The wire element
   */
  createWireElement() {
    const wire = document.createElement("div");
    wire.className = "wire";
    wire.style.position = "absolute";
    wire.style.backgroundColor = "black";
    wire.style.height = "2px"; // Thin wire representation
    wire.style.pointerEvents = "none"; // Prevent interactions
    wire.style.transition = "width 0.3s ease-out"; // Smooth animation when appearing
    this.container.appendChild(wire);
    return wire;
  }

  /**
   * Updates the wire's position dynamically based on connected terminals
   * - Uses bounding box calculations to determine start and end points
   * - Rotates and scales the wire to visually connect terminals
   */
  updatePosition() {
    const inputRect = this.inputTerminal.closest('.gate')?.getBoundingClientRect();
    const outputRect = this.outputTerminal.closest('.gate')?.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    if (!inputRect || !outputRect) {
        console.warn("⚠️ Unable to calculate wire position. Terminal(s) might be missing.");
        return;
    }

    // Get coordinates relative to the container
    const startX = inputRect.left + inputRect.width / 2 - containerRect.left;
    const startY = inputRect.top + inputRect.height / 2 - containerRect.top;
    const endX = outputRect.left + outputRect.width / 2 - containerRect.left;
    const endY = outputRect.top + outputRect.height / 2 - containerRect.top;

    // Calculate wire direction and length
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);

    this.element.style.width = "0px"; // Start invisible for animation effect
    this.element.style.transformOrigin = "0 0";
    this.element.style.transform = `rotate(${angle}rad)`;
    this.element.style.left = `${startX}px`;
    this.element.style.top = `${startY}px`;

    // Animate wire growth after a slight delay
    setTimeout(() => {
      this.element.style.width = `${length}px`;
    }, 10); // Short delay to trigger CSS transition
  }
}
