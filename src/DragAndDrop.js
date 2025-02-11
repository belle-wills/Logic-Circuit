/**
 * Sets up drag-and-drop functionality for the circuit board
 * - Allows users to drag new gates from the sidebar and drop them onto the canvas
 * - Enables repositioning of existing gates on the canvas
 * - Hides the placeholder text when the first gate is added
 */
export function initializeCircuitBoard(circuitBoard) {
  const gates = document.querySelectorAll('.gate-template');
  const canvas = document.getElementById('canvas');
  const placeholder = document.getElementById('canvas-placeholder');

  // Enable dragging for new gates
  gates.forEach((gate) => {
    gate.addEventListener('dragstart', (e) => {
      const gateType = e.target.dataset.type;
      if (!gateType) {
        console.error('Gate type not found during dragstart');
        return;
      }
      e.dataTransfer.setData('new-gate-type', gateType); // Store gate type for new gate creation
      gate.classList.add('dragging'); // Add dragging style
    });

    gate.addEventListener('dragend', () => {
      gate.classList.remove('dragging'); // Remove dragging style when done
    });
  });

  // Allow dropping onto the canvas
  canvas.addEventListener('dragover', (e) => {
    e.preventDefault(); // Required for drop event to work
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();

    // Hide placeholder once a gate is dropped
    if (placeholder) placeholder.style.display = 'none';

    const newGateType = e.dataTransfer.getData('new-gate-type');
    if (newGateType) {
      console.log('Adding new gate:', newGateType);

      const { x, y } = getRelativePosition(e, canvas);
      const newGate = circuitBoard.addGate(newGateType, x, y); // Create new gate

      if (newGate) enableGateDragging(newGate, canvas); // Make sure it can be dragged
      return;
    }

    const existingGateId = e.dataTransfer.getData('existing-gate-id');
    if (existingGateId) {
      console.log('Repositioning existing gate:', existingGateId);

      const gateToMove = document.getElementById(existingGateId);
      if (gateToMove) {
        const { x, y } = getRelativePosition(e, canvas);
        gateToMove.style.left = `${x}px`; // Update position
        gateToMove.style.top = `${y}px`;
      }
      return;
    }

    console.error('No valid data found in drop event'); // If drop event fails
  });
}

/**
 * Gets the position of the drag event relative to the canvas
 * @param {DragEvent} e - The drag event
 * @param {HTMLElement} canvas - The canvas element
 * @returns {{x: number, y: number}} - The relative position
 */
function getRelativePosition(e, canvas) {
  const canvasRect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - canvasRect.left,
    y: e.clientY - canvasRect.top
  };
}

/**
 * Enables dragging for gates already placed on the canvas
 * - Allows users to move gates around after placement
 * @param {HTMLElement} gateElement - The gate element to enable dragging for
 * @param {HTMLElement} canvas - The canvas element
 */
export function enableGateDragging(gateElement, canvas) {
  gateElement.setAttribute('draggable', true); // Make gate draggable

  gateElement.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('existing-gate-id', gateElement.id); // Store gate ID for repositioning
    gateElement.classList.add('dragging'); // Add dragging style
  });

  gateElement.addEventListener('dragend', () => {
    gateElement.classList.remove('dragging'); // Remove dragging style
  });
}
