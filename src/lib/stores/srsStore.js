import { writable } from 'svelte/store';

// simplified sm-2 algorithm
const defaultStats = {
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    dueDate: new Date().toISOString()
};

// time constants
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

// configuration
const TIME_UNIT = ONE_MINUTE;

// interval steps in time_units
const INITIAL_INTERVAL = 1;
const SECOND_INTERVAL = 6;

function calculateNextReview(stats, rating) {
    let newStats = { ...stats };

    // rating: 0=again (fail), 1=hard, 2=good, 3=easy

    if (rating === 0) {
        newStats.repetition = 0;
        newStats.interval = 1;
    } else {
        if (newStats.repetition === 0) {
            newStats.interval = INITIAL_INTERVAL;
        } else if (newStats.repetition === 1) {
            newStats.interval = SECOND_INTERVAL;
        } else {
            newStats.interval = Math.round(newStats.interval * newStats.efactor);
        }
        newStats.repetition += 1;
    }

    let q = 0;
    if (rating === 1) q = 3;
    if (rating === 2) q = 4;
    if (rating === 3) q = 5;

    newStats.efactor = newStats.efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newStats.efactor < 1.3) newStats.efactor = 1.3;

    // set new due date
    const now = new Date();
    const nextDate = new Date(now.getTime() + newStats.interval * TIME_UNIT);
    newStats.dueDate = nextDate.toISOString();

    return newStats;
}

function createSrsStore() {
    const { subscribe, set, update } = writable({});

    // load from localstorage on client side
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('hsk_srs_data');
        if (stored) {
            try {
                set(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse SRS data", e);
            }
        }
    }

    return {
        subscribe,
        // add a word to the system (or reset it)
        addWord: (wordChar) => update(s => {
            const newState = { ...s, [wordChar]: { ...defaultStats, dueDate: new Date().toISOString() } }; // start immediately
            save(newState);
            return newState;
        }),
        // submit a review
        review: (wordChar, rating) => update(s => {
            const currentStats = s[wordChar] || { ...defaultStats };
            const newStats = calculateNextReview(currentStats, rating);
            const newState = { ...s, [wordChar]: newStats };
            save(newState);
            return newState;
        }),
        // helper to check if a word is due
        isDue: (wordChar, srsData) => {
            if (!srsData || !srsData[wordChar]) return false;
            return new Date(srsData[wordChar].dueDate) <= new Date();
        },
        getAllDue: (srsData) => {
            if (!srsData) return [];
            const now = new Date();
            return Object.keys(srsData).filter(key => new Date(srsData[key].dueDate) <= now);
        },
        // reset all progress
        clearAll: () => {
            set({});
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('hsk_srs_data');
            }
        }
    };
}

function save(data) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hsk_srs_data', JSON.stringify(data));
    }
}

export const srsStore = createSrsStore();
