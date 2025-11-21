/**
 * ScenarioStorage - Persists scenarios to localStorage
 */

class ScenarioStorage {
    constructor() {
        this.storageKey = 'cashflow-scenarios';
    }

    saveScenario(name, disabledExpenses, summary) {
        const scenarios = this.getAllScenarios();
        scenarios[name] = {
            disabledExpenses: Array.from(disabledExpenses),
            summary: summary,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(scenarios));
        return true;
    }

    loadScenario(name) {
        const scenarios = this.getAllScenarios();
        return scenarios[name] || null;
    }

    deleteScenario(name) {
        const scenarios = this.getAllScenarios();
        delete scenarios[name];
        localStorage.setItem(this.storageKey, JSON.stringify(scenarios));
        return true;
    }

    getAllScenarios() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    scenarioExists(name) {
        const scenarios = this.getAllScenarios();
        return name in scenarios;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ScenarioStorage = ScenarioStorage;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScenarioStorage;
}
