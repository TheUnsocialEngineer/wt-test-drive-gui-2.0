function extractTankModels(unit) {
    /**
     * Recursively extract tank models and collect 'name', 'unit_class', 'weapons' from all nested tankModels.
     */
    const tankModels = [];
    if (unit.tankModels) {
        if (Array.isArray(unit.tankModels)) {
            for (const tank of unit.tankModels) {
                tankModels.push({
                    name: tank.name,
                    unit_class: tank.unit_class,
                    weapons: tank.weapons
                });
            }
        } else if (typeof unit.tankModels === "object") {
            tankModels.push({
                name: unit.tankModels.name,
                unit_class: unit.tankModels.unit_class,
                weapons: unit.tankModels.weapons
            });
        }

        // Recurse through nested tankModels if deeper nesting exists
        if (typeof unit.tankModels === "object") {
            const nestedTankModels = extractTankModels(unit.tankModels);
            tankModels.push(...nestedTankModels);
        }
    }
    return tankModels;
}

function extractNestedTankModels(data) {
    /**
     * Extract and process only tankModels from nested units.
     */
    const tankModels = [];

    // Safely handle both list and object for triggers
    let triggers = data?.imports?.triggers || [];
    if (!Array.isArray(triggers)) {
        triggers = [triggers];
    }

    // Iterate through triggers and sub-triggers to extract tankModels
    for (const trigger of triggers) {
        let events = trigger?.events?.conditions || [];
        if (!Array.isArray(events)) {
            events = [events];
        }

        for (const condition of events) {
            let actions = condition?.actions || [];
            if (!Array.isArray(actions)) {
                actions = [actions];
            }

            for (const action of actions) {
                let subEvents = action?.events?.conditions || [];
                if (!Array.isArray(subEvents)) {
                    subEvents = [subEvents];
                }

                for (const subCondition of subEvents) {
                    const rearm = subCondition?.ReArm || {};
                    const variables = rearm?.variables || {};
                    let dialogs = variables?.dialogs || [];
                    if (!Array.isArray(dialogs)) {
                        dialogs = [dialogs];
                    }

                    for (const dialog of dialogs) {
                        let airfields = dialog?.airfields || [];
                        if (!Array.isArray(airfields)) {
                            airfields = [airfields];
                        }

                        for (const airfield of airfields) {
                            let effects = airfield?.effects || [];
                            if (!Array.isArray(effects)) {
                                effects = [effects];
                            }

                            for (const effect of effects) {
                                let units = effect?.units || [];
                                if (!Array.isArray(units)) {
                                    units = [units];
                                }

                                // Process only tankModels
                                for (const unit of units) {
                                    const models = extractTankModels(unit);
                                    tankModels.push(...models);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return tankModels;
}

export function extractTankModelsFromJson(jsonData) {
    /**
     * Extract tank models from the JSON data and return the results.
     */
    if (typeof jsonData !== "object" || jsonData === null) {
        throw new Error("Invalid JSON data provided");
    }

    // Extract tank models
    return extractNestedTankModels(jsonData);
}

// Extract tank models from the example JSON
//const tankModels = extractTankModelsFromJson(exampleJson);
//console.log("Extracted Tank Models:", JSON.stringify(tankModels, null, 4));
