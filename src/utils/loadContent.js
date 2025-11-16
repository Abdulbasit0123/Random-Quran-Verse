import { createPanel, currentAyahIndex, currentSurahIndex, panelMap } from '../components/panel/panel.js';
import { cleanCanvas } from './cleanCanvas.js';
import { saveToIDB, loadFromIDB, clearIDBData } from './indexedDB_utils.js';
import { showLoading, showSuccess, showError } from './loadingIcon.js';
import { hideTafseer, showTafseer } from './toggleTafseer.js';

const CURRENT_CONTENT_VERSION = '1.0';
export let currentLanguage = (localStorage.getItem('currentLanguage') || 'en.sahih'); // this is the default tafseer language
let isContentLoaded = false;
let content = {};

export async function getContent(surahIndex, ayahIndex) {
    let quranAyahText, tafseerAyahText, surahName;

    if (isContentLoaded) {
        quranAyahText = content.quran.data.surahs[surahIndex].ayahs[ayahIndex].text;
        tafseerAyahText = content.tafseer.data.surahs[surahIndex].ayahs[ayahIndex].text;
        surahName = content.quran.data.surahs[surahIndex].name;
    } else {
        try {
            const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahIndex + 1}:${ayahIndex + 1}/editions/ar.sahih,${currentLanguage}`);
            if (!res.ok) throw new Error('Failed to fetch data from API');
            const data = await res.json();

            quranAyahText = data.data[0].text;
            tafseerAyahText = data.data[1].text;
            surahName = data.data[0].surah.name;
        } catch (error) {
            showError();
            throw error;
        }
    }
    surahName = surahName.replace('سُورَةُ ', '');
    if (ayahIndex === 0 && surahIndex > 0) quranAyahText = quranAyahText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '');
    return { quranAyahText, tafseerAyahText, surahName };
}

// Check version from IndexedDB
async function isDataValid() {
    const contentVersion = await loadFromIDB('CONTENT_VERSION');
    return contentVersion === CURRENT_CONTENT_VERSION;
}

const worker = new Worker(new URL('./contentWorker.js', import.meta.url), { type: 'module' });

// handle messages from worker
worker.onmessage = async (event) => {
    const { status, type, quran, tafseer, message } = event.data;

    if (status === 'error') {
        console.error('Worker error:', message);
        showError()
        return;
    }

    switch (type) {
        case 'loadContent':
            Object.assign(content, { quran, tafseer });
            await saveToIDB('QURAN_CONTENT', quran);
            await saveToIDB(currentLanguage, tafseer);
            await saveToIDB('CONTENT_VERSION', CURRENT_CONTENT_VERSION);

            isContentLoaded = true;
            cleanCanvas();
            panelMap.clear();
            createPanel(currentSurahIndex, currentAyahIndex);
            showSuccess()
            break;
        case 'loadNewTafseer':
            content.tafseer = tafseer;
            await saveToIDB(currentLanguage, tafseer);

            showSuccess();
            showTafseer();
            cleanCanvas();
            panelMap.clear();
            createPanel(currentSurahIndex, currentAyahIndex);
            break;
    }
    console.log('content saved to IndexedDB');
};

export async function loadContent() {
    let quran = null;
    let tafseer = null;
    const dataValid = await isDataValid();

    if (dataValid) {
        quran = await loadFromIDB('QURAN_CONTENT');
        tafseer = await loadFromIDB(currentLanguage);
    } else {
        await clearIDBData(); // Clear old version data
    }

    if (quran && tafseer) {
        Object.assign(content, { quran, tafseer });
        isContentLoaded = true;
        return;
    }

    // Not in DB / DB invalid → ask worker to fetch
    setTimeout(() => {
        worker.postMessage({ type: 'loadContent', language: currentLanguage });
        showLoading();
    }, 1500);
}

export async function updateLanguage(newLanguageId) {

    if (newLanguageId === 'none') {
        hideTafseer();
        localStorage.setItem('isNoneChecked', 'true');
        return;
    }
    if (newLanguageId !== 'none') {
        localStorage.setItem('isNoneChecked', 'false');
        localStorage.setItem('currentLanguage', newLanguageId);
        showTafseer();
    }
    if (newLanguageId === currentLanguage) return;

    const contentTafseer = await loadFromIDB(newLanguageId);

    if (contentTafseer !== null) {
        content.tafseer = contentTafseer;
        cleanCanvas();
        panelMap.clear();
        createPanel(currentSurahIndex, currentAyahIndex);
        currentLanguage = newLanguageId;
        return;
    }

    worker.postMessage({ type: 'loadNewTafseer', language: newLanguageId });
    showLoading();
    hideTafseer();
    currentLanguage = newLanguageId;
}