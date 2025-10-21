import { showLoading, hideLoading } from '../components/loading.js';
import { createPanel, currentAyahIndex, currentSurahIndex, panelMap } from '../components/panel/panel.js';
import { cleanCanvas } from './cleanCanvas.js';

const CURRENT_CACHE_VERSION = '1.0';
let CURRENT_LANGUAGE = 'ku.asan';

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
        const tafseer = localStorage.getItem(CURRENT_LANGUAGE);
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
    localStorage.removeItem(CURRENT_LANGUAGE);
    localStorage.removeItem('CACHE_VERSION');
}

function saveToCache(quran, tafseer) {
    try {
        localStorage.setItem('QURAN_CACHE', JSON.stringify(quran));
        localStorage.setItem(CURRENT_LANGUAGE, JSON.stringify(tafseer));
        localStorage.setItem('CACHE_VERSION', CURRENT_CACHE_VERSION);
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            clearCache();
        }
    }
}

export let content = {};
export async function loadContent() {
    if (!(Object.keys(content).length === 0)) return;
    const cached = loadFromCache();
    if (cached.quran && cached.tafseer) {
        Object.assign(content, cached);
        return;
    }
    try {
        showLoading();
        const [quranRes, tafseerRes] = await Promise.all([
            fetch('https://api.alquran.cloud/v1/quran/ar.sahih'),
            fetch(`https://api.alquran.cloud/v1/quran/${CURRENT_LANGUAGE}`)
        ]);
        if (!quranRes.ok || !tafseerRes.ok) throw new Error('Failed to fetch data from API');
        const quran = await quranRes.json();
        const tafseer = await tafseerRes.json();
        Object.assign(content, { quran, tafseer });
        saveToCache(quran, tafseer);
        hideLoading();
        return;
    } catch (error) {
        hideLoading();
        throw error;
    }
}

export async function updateLanguage(newLanguageId) {
    if (newLanguageId === CURRENT_LANGUAGE) return;
    if (localStorage.getItem(newLanguageId) !== null) {
        const tafseer = localStorage.getItem(newLanguageId);
        content.tafseer = JSON.parse(tafseer);
        cleanCanvas();
        panelMap.clear();
        createPanel(currentSurahIndex, currentAyahIndex);
        CURRENT_LANGUAGE = newLanguageId;
        return;
    } else {
        try {
            showLoading();
            const tafseerRes = await fetch(`https://api.alquran.cloud/v1/quran/${newLanguageId}`);
            if (!tafseerRes.ok) throw new Error('Failed to fetch data from API');
            const tafseer = await tafseerRes.json();
            content.tafseer = tafseer;
            CURRENT_LANGUAGE = newLanguageId;
            updateCache(tafseer);
            hideLoading();
            createPanel(currentSurahIndex, currentAyahIndex);
        } catch (error) {
            hideLoading();
            throw error;
        }
    }
}

function updateCache(tafseer) {
    try {
        localStorage.setItem(CURRENT_LANGUAGE, JSON.stringify(tafseer));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            clearCache();
        }
    }
}