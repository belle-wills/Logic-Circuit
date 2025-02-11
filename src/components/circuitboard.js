import { Gate } from './gate.js';
import { Wire } from './wire.js';
import { Switch } from './switch.js';
import { LightBulb } from './lightbulb.js';
import { initializeDragAndDrop } from '../main.js';

export class CircuitBoard {
  constructor(container) {
    this.container = container;
    this.container.circuitBoard = this;
    this.gates = [];
    this.wires = [];
    this.currentConnection = null;
  }
  loadFromData(data) {
    this.resetBoard(); // Clears canvas before loading

    console.log("🔄 Loading circuit data...", data);

    // Load gates with correct positions
    data.gates.forEach(gateData => {
        const { id, type, position } = gateData;

        if (!type) {
            console.error("❌ Invalid gate type: undefined", gateData);
            return;
        }

        let gateElement = this.addGate(type, position.x, position.y);
        if (!gateElement) {
            console.error(`❌ Failed to add gate of type ${type} at (${position.x}, ${position.y})`);
            return;
        }

        // Correct ID and position assignment
        gateElement.id = id;
        gateElement.style.left = `${position.x}px`;
        gateElement.style.top = `${position.y}px`;

        let gateInstance;
        if (type === "SWITCH") {
            gateInstance = new Switch(id, gateElement, this);
            gateInstance.attachSounds();  //Reattach sound effects
        } else if (type === "BULB") {
            gateInstance = new LightBulb(id, gateElement, this);
            gateInstance.attachSounds();  // Reattach sound effects
        } else {
            gateInstance = new Gate(type, id, this);
        }

        this.gates.push(gateInstance);
        console.log(`✅ Loaded ${type} gate with ID ${id} at (${position.x}, ${position.y})`);
    });

    // Load wires properly
    setTimeout(() => { // Small delay - ensures elements exist before connecting
        data.wires.forEach(wireData => {
            console.log(`🔗 Reconnecting ${wireData.start} → ${wireData.end}`);
            this.connectGates(wireData.start, wireData.end);
        });
    }, 100);
    
    console.log("✅ Circuit loaded successfully!");
}

  /**
   * Adds a gate or component to the circuit board at a specified position.
   */
  addGate(type, x, y) {
    if (!['AND', 'OR', 'NOT', 'XOR', 'SWITCH', 'BULB'].includes(type)) {
        console.error(`❌ Invalid gate type: ${type}`);
        return null;
    }

    const id = `${type.toLowerCase()}-${this.gates.length}`;

    if (document.getElementById(id)) {
        console.warn(`⚠️ Gate with ID ${id} already exists. Skipping creation.`);
        return null;
    }

    // Create the gate element
    const gateElement = document.createElement('div');
    gateElement.className = 'gate';
    gateElement.id = id;
    gateElement.style.position = 'absolute';
    gateElement.style.left = `${x}px`;
    gateElement.style.top = `${y}px`;

    if (type === 'BULB') {
        gateElement.classList.add('lightbulb', 'off');
    } else if (type === 'SWITCH') {
        gateElement.classList.add('switch', 'off');
    } else {
        gateElement.textContent = type;
    }

    this.container.appendChild(gateElement);
    this._enableGateDragging(gateElement);

    let gate;
    if (type === 'SWITCH') {
        gate = new Switch(id, gateElement, this); // CircuitBoard is passed
    } else if (type === 'BULB') {
        gate = new LightBulb(id, gateElement);
    } else {
        gate = new Gate(type, id, this);
    }

    this.gates.push(gate); //Ensure its stored properly

    console.log(`✅ Added ${type} gate with ID ${id} at (${x}, ${y})`);
    return gateElement;
}


  /**
   * Clears circuit board and resets all components
   */
  resetBoard() {
    console.log("🔄 Resetting circuit board...");

    // Remove all gate elements
    this.gates.forEach((gate) => {
        const gateElement = document.getElementById(gate.id);
        if (gateElement) {
            gateElement.remove();
        }
    });

    // Remove all wire elements directly from the DOM
    document.querySelectorAll(".wire").forEach(wire => wire.remove());

    this.gates = [];  // Clear gates
    this.wires = [];  // Clear wires array
    this.currentConnection = null;

    //Restore canvas placeholder
    document.getElementById("canvas-placeholder").style.display = "block";

    // Reinit drag-and-drop (fix missing function separately)
    if (typeof initializeDragAndDrop === "function") {
        initializeDragAndDrop();
    } else {
        console.warn("⚠️ initializeDragAndDrop is not defined.");
    }

    console.log("✅ Circuit board reset complete. Wires removed.");
}
//
  /**
   * Enables dragging for gates already on canvas.
   */
  _enableGateDragging(gateElement) {
    let isDragging = false;
    let offsetX, offsetY;

    gateElement.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return; // Only allow left-click dragging

      const rect = gateElement.getBoundingClientRect();
      const parentRect = this.container.getBoundingClientRect(); // Get canvas position

      // Correct the offset by subtracting the parent container's position
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;

      isDragging = true;
      gateElement.classList.add("dragging");

      const moveAt = (e) => {
        if (!isDragging) return;

        let newX = e.clientX - parentRect.left - offsetX;
        let newY = e.clientY - parentRect.top - offsetY;

        // Makes sure the gate stays inside the canvas
        newX = Math.max(0, Math.min(newX, this.container.clientWidth - rect.width));
        newY = Math.max(0, Math.min(newY, this.container.clientHeight - rect.height));

        gateElement.style.left = `${newX}px`;
        gateElement.style.top = `${newY}px`;

        this.updateAllWires(); // Wires update as the gate moves
      };

      const stopDragging = () => {
        isDragging = false;
        gateElement.classList.remove("dragging");
        document.removeEventListener("mousemove", moveAt);
        document.removeEventListener("mouseup", stopDragging);
      };

      document.addEventListener("mousemove", moveAt);
      document.addEventListener("mouseup", stopDragging);
    });

    gateElement.ondragstart = () => false; // Disable native drag behavior
  }

  /**
   * Connects two gates via a wire
   */
  connectGates(inputTerminalId, outputTerminalId) {
    const inputTerminal = document.getElementById(inputTerminalId);
    const outputTerminal = document.getElementById(outputTerminalId);

    if (!inputTerminal || !outputTerminal) {
      console.error('❌ Invalid terminals for connection.');
      return;
    }

    // Prevent self-connection
    if (inputTerminalId.split("-")[0] === outputTerminalId.split("-")[0]) {
      console.error('❌ Cannot connect a gate to itself.');
      return;
    }

    const wire = new Wire(inputTerminal, outputTerminal, this.container);
    if (!this.wires) this.wires = [];
    this.wires.push(wire);
    wire.updatePosition(); // 
    console.log(`🔗 Connected ${inputTerminalId} → ${outputTerminalId}`);
    console.log(`🛠 Connecting ${inputTerminalId} (input) to ${outputTerminalId} (output)`);


    // Immediately update the circuit logic
    this.updateAllWires();
  }

  /**
   * Updates all wire connections and propagates logic signals
   */
  updateAllWires() {
    console.log('🔄 Updating all wires...');

    // wires stay visually connected
    this.wires.forEach((wire) => {
      wire.updatePosition();
      console.log(`🔗 Wire updated: ${wire.inputTerminal.id} → ${wire.outputTerminal.id}`);
    });

    // Correct signal propagation
    this.gates.forEach((gate) => {
      if (gate instanceof LightBulb) {
        const inputs = this._getInputsForGate(gate);
        console.log(`💡 Inputs for LightBulb ${gate.id}:`, inputs);

        const isOn = inputs.some((input) => input === true);
        if (isOn) {
          gate.turnOn();
        } else {
          gate.turnOff();
        }
      } else if (gate instanceof Gate) {
        const inputs = this._getInputsForGate(gate);
        console.log(`⚙️ Inputs for Gate ${gate.id} (${gate.type}):`, inputs);
        gate.setInputs(inputs);
      }
    });
  }

  /**
   * Gets the input values for a given gate
   */
  _getInputsForGate(gate) {
    const inputWires = this.wires.filter((wire) => wire.outputTerminal.id.includes(gate.id));
    const inputs = inputWires.map((wire) => {
        let parentNode = wire.inputTerminal.closest('.gate'); // Correct parent selection

        if (!parentNode) {
            console.warn(`⚠️ Skipping wire connection. Parent node of ${wire.inputTerminal.id} is the canvas.`);
            return false;
        }

        const gateObj = this.gates.find(g => g.id === parentNode.id); // Correct mapping

        if (gateObj && typeof gateObj.getSignal === 'function') {
            return gateObj.getSignal();
        } else {
            console.warn(`⚠️ Parent node of ${wire.inputTerminal.id} does not have getSignal.`);
            return false;
        }
    });

    if (typeof gate.setInputs === 'function') {
        gate.setInputs(inputs);
    }

    return inputs;
}

}