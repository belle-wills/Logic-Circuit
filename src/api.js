/**
 * Saves the current circuit state to the backend
 * - Sends a POST request with the circuit data as JSON
 * - Logs success or error messages
 * @param {Object} circuitData - The circuit data to save
 */
export async function saveCircuit(circuitData) {
    try {
        await fetch('http://localhost:3001/saveCircuit', {
            method: 'POST', // Send data to the server
            headers: { 'Content-Type': 'application/json' }, // Ensure JSON format
            body: JSON.stringify(circuitData), // Convert data to JSON string
        });
        console.log("✅ Circuit saved successfully!");
    } catch (error) {
        console.error("❌ Error saving circuit:", error);
    }
}

/**
 * Loads the saved circuit state from the backend
 * - Sends a GET request to retrieve circuit data
 * - Parses and returns the response if successful
 * @returns {Object|null} - The loaded circuit data or null if it fails
 */
export async function loadCircuit() {
    try {
        const response = await fetch('http://localhost:3001/loadCircuit'); // Fetch data from server
        if (!response.ok) throw new Error("Failed to load circuit"); // Handle HTTP errors
        const data = await response.json(); // Convert response to JSON
        console.log("✅ Loaded circuit:", data);
        return data;
    } catch (error) {
        console.error("❌ Error loading circuit:", error);
        return null; // Return null if loading fails
    }
}
