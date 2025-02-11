import { CircuitBoard } from './components/circuitboard.js';
import { Switch } from './components/switch.js';
import { LightBulb } from './components/lightbulb.js';
import { Wire } from './components/wire.js';
import { saveCircuit, loadCircuit } from './api.js';


let switchSound = new Audio('/src/assets/Audio/switch.wav');
window.bulbOnSound = new Audio('src/assets/Audio/bulb.wav');
const canvas = document.getElementById('canvas');
const circuitBoard = new CircuitBoard(canvas);
window.circuitBoard = circuitBoard; // changed to window. to make it more accessibile - as was having issues

document.getElementById("save-button").addEventListener("click", async () => {
  console.log("Saving circuit...");

  const circuitData = {
    gates: circuitBoard.gates.filter(g => g).map(g => {
        const gateElement = document.getElementById(g.id);
        if (!gateElement) return null; // Skip if gate element isn’t found

        return {
            id: g.id, // Keep the same ID for reference
            type: g.type || 
                  (g instanceof Switch ? "SWITCH" : 
                   g instanceof LightBulb ? "BULB" : "UNKNOWN"), // Make sure switches and bulbs are labelled right
            position: {
                x: parseInt(gateElement.style.left) || 0, // Get X position, default to 0 if missing
                y: parseInt(gateElement.style.top) || 0 // Get Y position, default to 0 if missing
            }
        };
    }).filter(Boolean), // Get rid of null values

    wires: circuitBoard.wires.filter(w => w && w.inputTerminal && w.outputTerminal).map(w => ({
      start: w.inputTerminal.id, // Start of the wire
      end: w.outputTerminal.id // End of the wire
    }))
};

  console.log("Formatted circuit data:", circuitData);
  saveCircuit(circuitData);
});



document.getElementById("load-button").addEventListener("click", async () => {
  console.log("🔄 Loading circuit...");
  const data = await loadCircuit();

  if (!data) {
      console.error("❌ Failed to load circuit data.");
      return;
  }

  console.log("✅ Data received:", data);

  // Load data into CircuitBoard
  window.circuitBoard.loadFromData(data);
});


document.addEventListener("DOMContentLoaded", async () => {
  const savedCircuit = await loadCircuit();
  if (savedCircuit) {
      console.log("Loaded saved circuit:", savedCircuit);
      // Load the circuit into UI
  }
});

function handleGateClick(gateElement) {
  console.log(`🖱️ Gate clicked: ${gateElement.id}`);
  
}

initializeDragAndDrop();

/**
 * Reset the circuit when the reset button is clicked
 */
document.getElementById("reset-button").addEventListener("click", () => {
  console.log("Reset button clicked.");
  circuitBoard.resetBoard();

  // Remove all gates from the DOM
  document.querySelectorAll(".gate").forEach(gate => gate.remove());

  // Remove all wire elements from canvas
  document.querySelectorAll(".wire").forEach(wire => wire.parentNode.removeChild(wire));

  // Makes sure circuitBoard wires are cleared (if it has an array to track them)
  if (circuitBoard.wires) {
    circuitBoard.wires = [];
  }

  //WireStartGate is reset to avoid lingering refs
  wireStartGate = null;

  // Reinit the drag and drop system to prevent issues
  initializeDragAndDrop();
});

document.addEventListener("DOMContentLoaded", async () => {
  // Load the saved circuit when the page loads
  const savedCircuit = await loadCircuit();
  if (savedCircuit) {
      console.log("Restoring saved circuit...");
      
  }

  // Handle Save Button Click
  document.getElementById("save-button").addEventListener("click", async () => {
      console.log("🔄 Saving circuit...");

      
      const circuitState = {
          gates: circuitBoard.gates.map(gate => ({
              id: gate.id,
              type: gate.type,
              position: { x: gate.x, y: gate.y }
          })),
          wires: circuitBoard.wires.map(wire => ({
              start: wire.startGate.id,
              end: wire.endGate.id
          }))
      };

      await saveCircuit(circuitState);
  });
  // Reinit the drag and drop system to prevent issues
  initializeDragAndDrop();
});


/**
 * Enables dragging for gates already on canvas
 */
function enableGateDragging(gateElement) {
  let isDragging = false;
  let offsetX, offsetY;

  gateElement.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return; // Ignore right-clicks or middle clicks

      offsetX = event.clientX - gateElement.offsetLeft;
      offsetY = event.clientY - gateElement.offsetTop;
      isDragging = true;

      function moveAt(e) {
          if (isDragging) {
              gateElement.style.left = `${e.clientX - offsetX}px`;
              gateElement.style.top = `${e.clientY - offsetY}px`;
          }
      }

      function stopDragging() {
          isDragging = false;
          gateElement.classList.remove("dragging");
          document.removeEventListener("mousemove", moveAt);
          document.removeEventListener("mouseup", stopDragging);
      }

      document.addEventListener("mousemove", moveAt);
      document.addEventListener("mouseup", stopDragging);
  });

  gateElement.ondragstart = () => false;
}
function addSwitchSoundListeners() {
  console.log("🔊 Adding switch sound listeners...");
  document.querySelectorAll(".switch").forEach(switchElement => {
    switchElement.removeEventListener("click", playSwitchSound); // Prevent duplicate listeners
    switchElement.addEventListener("click", playSwitchSound);
  });
}

function playSwitchSound() {
  console.log("🔊 Switch toggled");
  switchSound.currentTime = 0; // Reset audio to allow replay
  switchSound.play();
  console.log("🔄 Running simulateCircuit() after switch toggle...");
  simulateCircuit();
}

/**
 * init drag-and-drop for new and existing gates
 */
export function initializeDragAndDrop() {
  console.log("🚀 Initialising drag-and-drop functionality...");

  const gates = document.querySelectorAll('.gate-template');

  gates.forEach((gate) => {
    gate.addEventListener('dragstart', (e) => {
      const gateType = e.target.dataset.type;
      if (gateType) {
        e.dataTransfer.setData('new-gate-type', gateType);
        gate.classList.add('dragging');
      }
    });

    gate.addEventListener('dragend', () => {
      gate.classList.remove('dragging');
    });
  });

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const newGateType = e.dataTransfer.getData('new-gate-type');

    if (!newGateType) {
      console.error('❌ Error: No gate type found.');
      return;
    }

    console.log(`➕ Attempting to add new gate: ${newGateType}`);

    const { x, y } = getRelativePosition(e, canvas);

    // Prevent duplicate SWITCH and BULB (Only allow one each)
    if (["SWITCH", "BULB"].includes(newGateType)) {
      const existingGate = document.querySelector(`.gate[data-type="${newGateType}"]`);
      if (existingGate) {
        console.warn(`⚠️ A ${newGateType} already exists. Skipping addition.`);
        return;
      }
    }

    // Prevent multiple identical gates in same location
    const existingGates = document.querySelectorAll(`.gate[data-type="${newGateType}"]`);
    if (!["SWITCH", "BULB"].includes(newGateType) && existingGates.length > 0) {
      const duplicate = Array.from(existingGates).find(gate => 
          Math.abs(gate.offsetLeft - x) < 10 && Math.abs(gate.offsetTop - y) < 10
      );
      if (duplicate) {
        console.warn(`⚠️ A ${newGateType} gate already exists in this location. Skipping addition.`);
        return;
      }
    }

    //Create the new gate
    const newGate = circuitBoard.addGate(newGateType, x, y);
    if (newGate) {
      newGate.setAttribute("data-type", newGateType);
      enableGateDragging(newGate);

      if (newGateType === "SWITCH") {
        newGate.classList.add("switch");
        addSwitchSoundListeners();
      }

      // Make gates interactive immediately (for wire connections)
      newGate.addEventListener("click", (e) => handleGateClick(e, newGate));
    } else {
      console.warn('⚠️ Gate could not be added.');
    }
  });
}


/**
 * Handles selecting and connecting gates
 */
let wireStartGate = null; // Track the first gate click

canvas.addEventListener("click", (e) => {
    let clickedElement = e.target;

    // only valid circuit components are clicked
    if (!clickedElement.classList.contains("gate") && 
        !clickedElement.classList.contains("switch") && 
        !clickedElement.classList.contains("lightbulb")) {
        console.warn("⚠️ Clicked element is not a valid circuit component.");
        return;
    }

    // First click: Set wire start position
    if (!wireStartGate) {
        wireStartGate = clickedElement;
        wireStartGate.classList.add("connecting");
        console.log(`🔵 Selected ${wireStartGate.id} as start of wire.`);
        return;
    }

    // Second click: Connect the wire
    if (wireStartGate !== clickedElement) {
        console.log(`🔗 Connecting ${wireStartGate.id} → ${clickedElement.id}`);

        // Check if `circuitBoard.connectGates` is defined
        if (typeof circuitBoard.connectGates === "function") {
            circuitBoard.connectGates(wireStartGate.id, clickedElement.id);
        } else {
            console.error("❌ ERROR: circuitBoard.connectGates is undefined.");
        }

        // Check if Wire class exists
        if (typeof Wire !== "undefined") {
            new Wire(wireStartGate, clickedElement, canvas);
        } else {
            console.error("❌ ERROR: Wire class is not defined.");
        }
    } else {
        console.warn("❌ Cannot connect a gate to itself!");
    }

    // Reset wire selection after connection
    wireStartGate.classList.remove("connecting");
    wireStartGate = null;
});

/**
 * Handles wire connections between components
 */
function connectWire(targetGate) {
    if (!wireStartGate) {
        // First click: Select the starting gate
        wireStartGate = targetGate;
        wireStartGate.classList.add("connecting");
        wiringMode = true;
        console.log(`🔵 Selected ${wireStartGate.id} as start of wire.`);
    } else {
        // Second click: Connect to another gate
        if (wireStartGate !== targetGate) {
            console.log(`🔗 Connecting ${wireStartGate.id} → ${targetGate.id}`);
            circuitBoard.connectGates(wireStartGate.id, targetGate.id);
            new Wire(wireStartGate, targetGate, canvas);
        } else {
            console.warn("❌ Cannot connect a gate to itself!");
        }

        // Reset wiring mode
        wireStartGate.classList.remove("connecting");
        wireStartGate = null;
        wiringMode = false;
    }
}


/**
 * Calculate the position of the drop relative to the canvas
 */
function getRelativePosition(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

/**
 * Simulate the circuit by evaluating gates and updating the bulb state.
 */
/**
 * Runs the circuit logic to check if the bulb should turn on or off
 * - Finds the switch and bulb components in the circuit
 * - If no switch or bulb exists, exits early
 * - Gets the switch state and updates all wire connections
 * - Checks if the bulb should turn on (if any of its inputs are true)
 * - Plays the bulb sound when it turns on, making sure it resets properly
 * - Turns the bulb off when it has no active inputs and stops the sound
 */
function simulateCircuit() {
  console.log('🔄 Simulating the circuit...');

  const switchComponent = circuitBoard.gates.find(g => g instanceof Switch);
  const bulbComponent = circuitBoard.gates.find(g => g instanceof LightBulb);

  if (!switchComponent) {
      console.warn('⚠️ No switch found in the circuit');
      return;
  }
  if (!bulbComponent) {
      console.warn('⚠️ No lightbulb found in the circuit');
      return;
  }

  const signal = switchComponent.getSignal();
  console.log(`💡 Switch signal: ${signal}`);

  circuitBoard.updateAllWires();

  const bulbInputs = circuitBoard._getInputsForGate(bulbComponent);
  console.log(`💡 Bulb inputs: ${bulbInputs}`);

  if (!bulbComponent.isOn && bulbInputs.some(input => input === true)) {
    console.log("💡 Bulb is turning ON!");
    bulbComponent.turnOn();
    bulbComponent.isOn = true;
    console.log("🔊 Playing bulb sound...");

    // Make sure the sound resets properly
    window.bulbOnSound.pause();
    window.bulbOnSound.currentTime = 0;

    // Force reset the audio buffer so it can play again
    window.bulbOnSound.src = window.bulbOnSound.src;
    window.bulbOnSound.load();

    setTimeout(() => {
    let playPromise = window.bulbOnSound.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => console.warn("🔇 Audio playback prevented:", error));
    }
    }, 50); // Small delay to allow the sound to reset

  } else if (bulbComponent.isOn && !bulbInputs.some(input => input === true)) {
    console.log("💡 Bulb is turning OFF!");

    bulbComponent.turnOff();
    bulbComponent.isOn = false;

    // Stop the sound when the bulb turns off (prevents looping issues)
    window.bulbOnSound.pause();
    window.bulbOnSound.currentTime = 0;
  }
}


/**
 * Load initial components into workspace
 */
document.addEventListener("DOMContentLoaded", () => {
  const components = ["AND", "OR", "NOT", "XOR", "SWITCH", "BULB"];

  const workspace = document.getElementById("workspace");

  // Clear workspace before adding elements to prevent duplicates
  workspace.innerHTML = ""; 

  components.forEach(component => {
      const gateButton = document.createElement("div");
      gateButton.classList.add("gate-template");
      gateButton.textContent = component;
      gateButton.setAttribute("data-type", component);
      gateButton.draggable = true; // 🔥 Ensure it can be dragged

      // Add event listeners for drag functionality
      gateButton.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("new-gate-type", component);
          e.target.classList.add("dragging");
      });

      gateButton.addEventListener("dragend", () => {
          gateButton.classList.remove("dragging");
      });

      // Append gate button to workspace
      workspace.appendChild(gateButton);
  });

  // Reinit drag-and-drop after adding elements
  initializeDragAndDrop();
  addSwitchSoundListeners(); 
});


