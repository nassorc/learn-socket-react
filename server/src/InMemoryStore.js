class InMemoryStore {
    constructor() {
        this.sessions = new Map();
    }
    saveSession(id, session) {
        this.sessions.set(id, session);
    }
    findSession(id) {
        return this.sessions.get(id);
    }
    findAllSession() {
        console.log("FROM SESSION STORE CLASS", this.sessions.values());
        return [...this.sessions.values()];
    }
    getSession() {
        return this.sessions;
    }
};

module.exports = InMemoryStore;