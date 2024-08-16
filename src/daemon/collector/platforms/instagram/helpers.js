
export const findNodesWithAdverts = (data, results = [], visited = new Set()) => {
    // Check if the current data is an object
    if (typeof data === 'object' && data !== null) {
        // Check if the object has the 'node' property
        if (data.hasOwnProperty('node')) {
            // Check if the 'node' object has the 'ad' property
            if (data.node.hasOwnProperty('ad') && data.node.ad !== null) {
                // Create a unique identifier for the node
                const nodeId = JSON.stringify(data.node);
                // Add the 'node' object to the results array if not already added
                if (!visited.has(nodeId)) {
                    results.push(data.node);
                    visited.add(nodeId);
                }
            }
        }

        // Recursively check all properties of the current object
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                findNodesWithAdverts(data[key], results, visited);
            }
        }
    }

    // Check if the current data is an array
    if (Array.isArray(data)) {
        // Recursively check all elements of the array
        for (let item of data) {
            findNodesWithAdverts(item, results, visited);
        }
    }

    return results;
}

