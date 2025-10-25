import { showLoading, hideLoading } from '../components/loading.js';
import { createPanel, currentAyahIndex, currentSurahIndex, panelMap } from '../components/panel/panel.js';
import { cleanCanvas } from './cleanCanvas.js';

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

function isCacheValid() {
    return localStorage.getItem('CACHE_VERSION') === CURRENT_CACHE_VERSION;
}

function loadFromCache() {
    if (!isCacheValid()) {
        clearCache();
        return { quran: null, tafseer: null };
    }
    try {
        const quran = localStorage.getItem('QURAN_CACHE');
        const tafseer = localStorage.getItem(currentLanguage);
        return {
            quran: quran ? JSON.parse(quran) : null,
            tafseer: tafseer ? JSON.parse(tafseer) : null
        };
    } catch {
        clearCache();
        return { quran: null, tafseer: null };
    }
}

function clearCache() {
    localStorage.removeItem('QURAN_CACHE');
    localStorage.removeItem(currentLanguage);
    localStorage.removeItem('CACHE_VERSION');
}

function saveToCache(quran, tafseer) {
    try {
        localStorage.setItem('QURAN_CACHE', JSON.stringify(quran));
        localStorage.setItem(currentLanguage, JSON.stringify(tafseer));
        localStorage.setItem('CACHE_VERSION', CURRENT_CACHE_VERSION);
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            clearCache();
        }
    }
}

// create the worker
const worker = new Worker(new URL('./contentWorker.js', import.meta.url), { type: 'module' });
// remember to terminate this worker somewhere if you no longer need it.

// handle messages from worker
worker.onmessage = (event) => {
    const { status, type, quran, tafseer, message } = event.data;

    if (type === 'loadContent' && status === 'success') {
        Object.assign(content, { quran, tafseer });
        saveToCache(quran, tafseer);
        isContentLoaded = true;
    } else {
        console.error('Worker error:', message);
    }

    if (type === 'loadNewTafseer' && status === 'success') {
        content.tafseer = tafseer;
        updateCache(tafseer);
        cleanCanvas();
        panelMap.clear();
        createPanel(currentSurahIndex, currentAyahIndex);
    } else {
        console.error('Worker error:', message);
    }
};

export async function loadContent() {
    if (Object.keys(content).length > 0) {
        isContentLoaded = true;
        return;
    }

    const cached = loadFromCache();
    if (cached.quran && cached.tafseer) {
        Object.assign(content, cached);
        isContentLoaded = true;
        console.log('Loaded from cache');
        return;
    }

    // Not in cache → ask worker to fetch
    worker.postMessage({ type: 'loadContent', language: currentLanguage });
}


export async function updateLanguage(newLanguageId) {
    if (newLanguageId === currentLanguage) return;
    if (localStorage.getItem(newLanguageId) !== null) {
        const tafseer = localStorage.getItem(newLanguageId);
        content.tafseer = JSON.parse(tafseer);
        cleanCanvas();
        panelMap.clear();
        createPanel(currentSurahIndex, currentAyahIndex);
        currentLanguage = newLanguageId;
        return;
    }
    worker.postMessage({ type: 'loadNewTafseer', language: newLanguageId });
    currentLanguage = newLanguageId;
}

function updateCache(tafseer) {
    try {
        localStorage.setItem(currentLanguage, JSON.stringify(tafseer));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            clearCache();
        }
    }
}