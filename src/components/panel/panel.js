import { getContent } from '../../utils/loadContent.js';
import { canvas } from '../../dom.js';
import { showWarningEdge } from '../showWarningEdge.js';
import { currentDirection } from '../languageModal.js';
import { isRangeEnabled, startingSurahIndex, startingAyahIndex, endingSurahIndex, endingAyahIndex } from '../rangeModal.js';

export let surahLength = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6];

export let currentV = 0;
export let currentH = 0;

export let currentSurahIndex = null;
export let currentAyahIndex = null;

export const panelMap = new Map();

export let range = [];
export let usedRange = [];

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

export async function createPanel(surahIndex, ayahIndex) {
    storePanel(surahIndex, ayahIndex);
    const { quranAyahText, tafseerAyahText, surahName } = await getContent(surahIndex, ayahIndex);
    const panel = createElement('div', 'panel');
    panel.id = `x${currentH}y${currentV}`;
    panel.style.top = `${currentV * 100}vh`;
    panel.style.left = `${currentH * 100}vw`;

    const wrapper = createElement('div', 'content-wrapper');
    const quranEl = createElement('p', 'quran', quranAyahText);
    const tafseerEl = createElement('p', 'tafseer', tafseerAyahText);
    if ((localStorage.getItem('isTafseerTurnedOff') === 'true')){
        tafseerEl.classList.add('hide');
    }
    tafseerEl.style = `direction: ${currentDirection};`;
    const sourceEl = createElement('a', 'source', `${surahName} - ${ayahIndex + 1}`);
    sourceEl.href = `https://tarteel.ai/ayah/${surahIndex + 1}/${ayahIndex + 1}`;

    wrapper.append(quranEl, tafseerEl, sourceEl, document.createElement('br'));
    panel.appendChild(wrapper);
    canvas.appendChild(panel);
}

export function createRandomPanel() {
    const surahIndex = Math.floor(Math.random() * 114);
    const ayahIndex = Math.floor(Math.random() * surahLength[surahIndex]);
    createPanel(surahIndex, ayahIndex);
}

function generateTheRange() {
    if (startingSurahIndex === endingSurahIndex) {//if they are the same surah
        for (let i = startingAyahIndex; i <= endingAyahIndex; i++) {
            range.push([startingSurahIndex, i]);
        }
    } else {//if they are not the same surah
        for (let i = startingSurahIndex; i <= endingSurahIndex; i++) {
            if (i === startingSurahIndex) {
                for (let j = startingAyahIndex; j <= surahLength[(i - 1)]; j++) {
                    range.push([i, j]);
                }
            }
            if (i > startingSurahIndex && i < endingSurahIndex) {
                for (let j = 1; j <= surahLength[(i - 1)]; j++) {
                    range.push([i, j]);
                }
            }
            if (i === endingSurahIndex) {
                for (let j = 1; j <= endingAyahIndex; j++) {
                    range.push([i, j]);
                }
            }
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function getRandomAyahInTheRange() {
    if (!range.length) {//this is the same as range.length === 0
        generateTheRange();
    }
    if (!usedRange.length) {
        usedRange = structuredClone(shuffleArray(range));
    }
    return usedRange.pop();
}

export function createRandomPanelBetweenRange() {
    let [surahIndex, ayahIndex] = getRandomAyahInTheRange();
    surahIndex -= 1;
    ayahIndex -= 1;
    createPanel(surahIndex, ayahIndex);
}

function wasPanelCreated() {
    return panelMap.has(`${currentV},${currentH}`);
}

export function movePanelVertically(dir) {
    currentV += dir;
    currentH = 0;
    if (!wasPanelCreated()) {
        if (isRangeEnabled) createRandomPanelBetweenRange();
        else createRandomPanel();
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
    if (nextAyahIndex >= surahLength[currentSurahIndex]) {
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