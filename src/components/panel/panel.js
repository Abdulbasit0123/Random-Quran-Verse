import { content } from '../../utils/loadContent.js';
import { canvas } from '../../dom.js';
import { showWarningEdge } from '../showWarningEdge.js';
import { currentDirection } from '../languageModal.js';

export let currentV = 0;
export let currentH = 0;

export let currentSurahIndex = null;
export let currentAyahIndex = null;

export const panelMap = new Map();

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function storePanel(surahIndex, ayahIndex) {
    panelMap.set(`${currentV},${currentH}`, {
        surahIndex,
        ayahIndex
    });
}

export function updateCurrentState() {
    const data = panelMap.get(`${currentV},${currentH}`);
    currentSurahIndex = data.surahIndex;
    currentAyahIndex = data.ayahIndex;
}

function animateCanvasTranslation() {
    canvas.style.transform = `translate(${-currentH * 100}vw, ${-currentV * 100}vh)`;
}

export function createPanel(surahIndex, ayahIndex) {
    const surah = content.quran.data.surahs[surahIndex];
    let quranAyahText = surah.ayahs[ayahIndex].text;
    const surahName = surah.name.replace('سُورَةُ ', '');
    const ayahNumber = surah.ayahs[ayahIndex].numberInSurah;
    const tafseerAyahText = content.tafseer.data.surahs[surahIndex].ayahs[ayahIndex].text;

    if (ayahIndex === 0 && surahIndex > 0) quranAyahText = quranAyahText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '');

    const panel = createElement('div', 'panel');
    panel.id = `x${currentH}y${currentV}`;
    panel.style.top = `${currentV * 100}vh`;
    panel.style.left = `${currentH * 100}vw`;

    const wrapper = createElement('div', 'content-wrapper');
    const quranEl = createElement('p', 'quran', quranAyahText);
    const tafseerEl = createElement('p', 'tafseer', tafseerAyahText);
    tafseerEl.style = `direction: ${currentDirection};`;
    const sourceEl = createElement('a', 'source', `${surahName} - ${ayahNumber}`);
    sourceEl.href = `https://tarteel.ai/ayah/${surahIndex + 1}/${ayahNumber}`;

    wrapper.append(quranEl, tafseerEl, sourceEl, document.createElement('br'));
    panel.appendChild(wrapper);
    canvas.appendChild(panel);

    storePanel(surahIndex, ayahIndex);
}

export function createRandomPanel() {
    const surahIndex = Math.floor(Math.random() * 114);
    const ayahIndex = Math.floor(Math.random() * content.quran.data.surahs[surahIndex].ayahs.length);
    createPanel(surahIndex, ayahIndex);
}

window.test = createRandomPanelBetweenRange;

export function createRandomPanelBetweenRange(startingSurahIndex, startingAyahIndex, endingSurahIndex, endingAyahIndex) {
    const surahIndex = Math.floor(Math.random() * (endingSurahIndex - startingSurahIndex + 1)) + startingSurahIndex;
    let ayahIndex = 0;
    if (startingSurahIndex === endingSurahIndex) {
        ayahIndex = Math.floor(Math.random() * (endingAyahIndex - startingAyahIndex + 1)) + startingAyahIndex;
    } else {
        if (surahIndex === startingSurahIndex) {
            ayahIndex = Math.floor(Math.random() * (content.quran.data.surahs[surahIndex].ayahs.length - startingAyahIndex + 1)) + startingAyahIndex;
        } else if (surahIndex === endingSurahIndex) {
            ayahIndex = Math.floor(Math.random() * endingAyahIndex);
        } else {
            ayahIndex = Math.floor(Math.random() * content.quran.data.surahs[surahIndex].ayahs.length);
        }
    }
    createPanel(surahIndex, ayahIndex);
}

function wasPanelCreated() {
    return panelMap.has(`${currentV},${currentH}`);
}

export function movePanelVertically(dir) {
    currentV += dir;
    currentH = 0;
    if (!wasPanelCreated()) {
        createRandomPanel();
    }
    animateCanvasTranslation();
    updateCurrentState();
}

export function movePanelHorizontally(dir) {
    // dir > 0 means move right (previous ayah), dir < 0 move left (next ayah)
    const offset = dir * -1;
    const nextAyahIndex = currentAyahIndex + offset;

    if (nextAyahIndex < 0) {
        showWarningEdge('startEdge');
        return;
    }
    if (nextAyahIndex >= content.quran.data.surahs[currentSurahIndex].ayahs.length) {
        showWarningEdge('endEdge');
        return;
    }

    currentH += dir;
    if (!wasPanelCreated()) {
        createPanel(currentSurahIndex, nextAyahIndex);
    }
    animateCanvasTranslation();
    updateCurrentState();
}