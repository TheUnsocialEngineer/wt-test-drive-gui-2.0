export function extractMissionSettings(jsonData) {
    /**
     * Extract the 'mission_settings' object from the provided JSON data.
     * Returns the extracted mission_settings object.
     */
    try {
        // Ensure the input is a valid object
        if (typeof jsonData !== 'object' || jsonData === null) {
            throw new Error("Invalid JSON data provided");
        }

        // Extract the mission_settings object
        const missionSettings = jsonData.mission_settings || {};

        // Return the mission_settings object
        return missionSettings;
    } catch (e) {
        console.error(`An error occurred: ${e.message}`);
        return null; // Return null in case of an error
    }
}

// Main execution for testing
const jsonData = {
    mission_settings: {
        player: {
            army: "1",
            wing: "\"You\""
        },
        mission: {
            type: "\"singleMission\"",
            level: "\"levels/avg_poland.bin\"",
            environment: "\"Day\"",
            weather: "\"clear\""
        }
    }
};

// Extract the mission settings
//const missionSettings = extractMissionSettings(jsonData);

//if (missionSettings) {
    //console.log("Extracted mission settings:", JSON.stringify(missionSettings, null, 4));
//}
