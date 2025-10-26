// loadContent.js

import { showLoading, hideLoading } from '../components/loading.js';
import { createPanel, currentAyahIndex, currentSurahIndex, panelMap } from '../components/panel/panel.js';
import { cleanCanvas } from './cleanCanvas.js';
// Import the new IndexedDB utilities
import { saveToIDB, loadFromIDB, clearIDBCache } from './indexedDB_utils.js'; // Assuming the utilities file is named indexedDB_utils.js

const CURRENT_CACHE_VERSION = '1.0';
let currentLanguage = 'ku.asan';
let isContentLoaded = false;
let content = {};

// ... (getContent function remains the same as it handles live API fetch)

/**
 * Checks if the cached data version is valid.
 */
async function isCacheValid() {
    // Check version from IndexedDB
    const cachedVersion = await loadFromIDB('CACHE_VERSION');
    return cachedVersion === CURRENT_CACHE_VERSION;
}

// REMOVE the old loadFromCache, clearCache, saveToCache, and updateCache functions
// because they are replaced by the new IDB functions (loadFromIDB, clearIDBCache, saveToIDB)
// loadContent.js

// handle messages from worker
worker.onmessage = async (event) => { // IMPORTANT: Make the handler async
    const { status, type, quran, tafseer, message } = event.data;

    if (status === 'error') {
        console.error('Worker error:', message);
        return;
    }

    switch (type) {
        case 'loadContent':
            Object.assign(content, { quran, tafseer });
            // --- IDB SAVING ---
            await saveToIDB('QURAN_CACHE', quran);
            await saveToIDB(currentLanguage, tafseer);
            await saveToIDB('CACHE_VERSION', CURRENT_CACHE_VERSION); // Save the version
            // ------------------
            isContentLoaded = true;
            break;
        case 'loadNewTafseer':
            content.tafseer = tafseer;
            // --- IDB UPDATE ---
            await saveToIDB(currentLanguage, tafseer);
            // ------------------
            cleanCanvas();
            panelMap.clear();
            createPanel(currentSurahIndex, currentAyahIndex);
            break;
    }
};
// loadContent.js

export async function loadContent() {
    if (Object.keys(content).length > 0) {
        isContentLoaded = true;
        return;
    }

    let quran = null;
    let tafseer = null;
    const cacheValid = await isCacheValid();

    if (cacheValid) {
        // --- IDB LOADING ---
        quran = await loadFromIDB('QURAN_CACHE');
        tafseer = await loadFromIDB(currentLanguage);
        // ------------------
    } else {
        await clearIDBCache(); // Clear old version cache
    }

    if (quran && tafseer) {
        Object.assign(content, { quran, tafseer });
        isContentLoaded = true;
        console.log('Loaded from IndexedDB');
        return;
    }

    // Not in cache / Cache invalid → ask worker to fetch
    worker.postMessage({ type: 'loadContent', language: currentLanguage });
}
// loadContent.js

export async function updateLanguage(newLanguageId) {
    if (newLanguageId === currentLanguage) return;

    // --- IDB LOADING ---
    const cachedTafseer = await loadFromIDB(newLanguageId);
    // -------------------

    if (cachedTafseer !== null) {
        content.tafseer = cachedTafseer;
        cleanCanvas();
        panelMap.clear();
        createPanel(currentSurahIndex, currentAyahIndex);
        currentLanguage = newLanguageId;
        return;
    }

    worker.postMessage({ type: 'loadNewTafseer', language: newLanguageId });
    currentLanguage = newLanguageId;
}