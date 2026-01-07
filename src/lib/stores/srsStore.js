import { writable } from 'svelte/store';

// Simplified SM-2 Algorithm
const defaultStats = {
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    dueDate: new Date().toISOString()
};

// Time Constants (Change TIME_UNIT to modify the base speed)
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

// CONFIGURATION: Change this to ONE_MINUTE for testing, ONE_DAY for production
const TIME_UNIT = ONE_MINUTE;

// Interval steps (in TIME_UNITs)
const INITIAL_INTERVAL = 1; // e.g. 1 Day
const SECOND_INTERVAL = 6;  // e.g. 6 Days

function calculateNextReview(stats, rating) {
    let newStats = { ...stats };

    // Rating: 0=Again (Fail), 1=Hard, 2=Good, 3=Easy

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

    // Update E-Factor
    // q: user grade (0-3 in our UI, but SM-2 uses 0-5. mapping: 0->0, 1->3, 2->4, 3->5 approx?)
    // Let's stick to standard SM-2 formula but map our ratings.
    // Standard: q=0..5. 
    // Our buttons: Again (0), Hard (1), Good (2), Easy (3)
    // Mapping to roughly standard SM-2 q values: 
    // Again -> q=0
    // Hard -> q=3
    // Good -> q=4
    // Easy -> q=5

    let q = 0;
    if (rating === 1) q = 3;
    if (rating === 2) q = 4;
    if (rating === 3) q = 5;

    newStats.efactor = newStats.efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newStats.efactor < 1.3) newStats.efactor = 1.3;

    // Set new due date
    const now = new Date();
    const nextDate = new Date(now.getTime() + newStats.interval * TIME_UNIT);
    newStats.dueDate = nextDate.toISOString();

    return newStats;
}

function createSrsStore() {
    const { subscribe, set, update } = writable({});

    // Load from localStorage on client side
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
        // Add a word to the system (or reset it)
        addWord: (wordChar) => update(s => {
            const newState = { ...s, [wordChar]: { ...defaultStats, dueDate: new Date().toISOString() } }; // Start immediately
            save(newState);
            return newState;
        }),
        // Submit a review
        review: (wordChar, rating) => update(s => {
            const currentStats = s[wordChar] || { ...defaultStats };
            const newStats = calculateNextReview(currentStats, rating);
            const newState = { ...s, [wordChar]: newStats };
            save(newState);
            return newState;
        }),
        // Helper to check if a word is due
        isDue: (wordChar, srsData) => {
            if (!srsData || !srsData[wordChar]) return false;
            return new Date(srsData[wordChar].dueDate) <= new Date();
        },
        getAllDue: (srsData) => {
            if (!srsData) return [];
            const now = new Date();
            return Object.keys(srsData).filter(key => new Date(srsData[key].dueDate) <= now);
        },
        // Reset all progress
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
