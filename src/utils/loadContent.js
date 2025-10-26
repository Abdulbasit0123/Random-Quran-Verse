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

export async function getContent(surahIndex, ayahIndex) {
    let quranAyahText, tafseerAyahText, surahName;

    if (isContentLoaded) {
        quranAyahText = content.quran.data.surahs[surahIndex].ayahs[ayahIndex].text;
        tafseerAyahText = content.tafseer.data.surahs[surahIndex].ayahs[ayahIndex].text;
        surahName = content.quran.data.surahs[surahIndex].name;
        console.log('loaded from localstorage');
    } else {
        try {
            const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahIndex + 1}:${ayahIndex + 1}/editions/ar.sahih,${currentLanguage}`);
            if (!res.ok) throw new Error('Failed to fetch data from API');
            const data = await res.json();

            quranAyahText = data.data[0].text;
            tafseerAyahText = data.data[1].text;
            surahName = data.data[0].surah.name;
            console.log('loaded from api');
        } catch (error) {
            throw error;
        }
    }
    surahName = surahName.replace('سُورَةُ ', '');
    if (ayahIndex === 0 && surahIndex > 0) quranAyahText = quranAyahText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '');
    return { quranAyahText, tafseerAyahText, surahName };
}

/**
 * Checks if the cached data version is valid.
 */
async function isCacheValid() {
    // Check version from IndexedDB
    const cachedVersion = await loadFromIDB('CACHE_VERSION');
    return cachedVersion === CURRENT_CACHE_VERSION;
}

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