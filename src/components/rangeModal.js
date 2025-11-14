import { disableRangeBtn, modalBackdrop, rangeModal, saveRangeBtn } from '../dom';
import { setAreEventsPaused } from '../events/controls';
import { startingSurahSelection, startingAyahSelection, endingSurahSelection, endingAyahSelection } from '../dom';
import { range, surahLength, usedRange, panelMap, createRandomPanelBetweenRange } from './panel/panel';
import { hideModal } from '../utils/hideModal';
import { cleanCanvas } from '../utils/cleanCanvas';

let surahNames = ['ٱلْفَاتِحَةِ', 'البَقَرَةِ', 'آلِ عِمۡرَانَ', 'النِّسَاءِ', 'المَائـِدَةِ', 'الأَنۡعَامِ', 'الأَعۡرَافِ', 'الأَنفَالِ', 'التَّوۡبَةِ', 'يُونُسَ', 'هُودٍ', 'يُوسُفَ', 'الرَّعۡدِ', 'إِبۡرَاهِيمَ', 'الحِجۡرِ', 'النَّحۡلِ', 'الإِسۡرَاءِ', 'الكَهۡفِ', 'مَرۡيَمَ', 'طه', 'الأَنبِيَاءِ', 'الحَجِّ', 'المُؤۡمِنُونَ', 'النُّورِ', 'الفُرۡقَانِ', 'الشُّعَرَاءِ', 'النَّمۡلِ', 'القَصَصِ', 'العَنكَبُوتِ', 'الرُّومِ', 'لُقۡمَانَ', 'السَّجۡدَةِ', 'الأَحۡزَابِ', 'سَبَإٍ', 'فَاطِرٍ', 'يسٓ', 'الصَّافَّاتِ', 'صٓ', 'الزُّمَرِ', 'غَافِرٍ', 'فُصِّلَتۡ', 'الشُّورَىٰ', 'الزُّخۡرُفِ', 'الدُّخَانِ', 'الجَاثِيَةِ', 'الأَحۡقَافِ', 'مُحَمَّدٍ', 'الفَتۡحِ', 'الحُجُرَاتِ', 'قٓ', 'الذَّارِيَاتِ', 'الطُّورِ', 'النَّجۡمِ', 'القَمَرِ', 'الرَّحۡمَٰن', 'الوَاقِعَةِ', 'الحَدِيدِ', 'المُجَادلَةِ', 'الحَشۡرِ', 'المُمۡتَحنَةِ', 'الصَّفِّ', 'الجُمُعَةِ', 'المُنَافِقُونَ', 'التَّغَابُنِ', 'الطَّلَاقِ', 'التَّحۡرِيمِ', 'المُلۡكِ', 'القَلَمِ', 'الحَاقَّةِ', 'المَعَارِجِ', 'نُوحٍ', 'الجِنِّ', 'المُزَّمِّلِ', 'المُدَّثِّرِ', 'القِيَامَةِ', 'الإِنسَانِ', 'المُرۡسَلَاتِ', 'النَّبَإِ', 'النَّازِعَاتِ', 'عَبَسَ', 'التَّكۡوِيرِ', 'الانفِطَارِ', 'المُطَفِّفِينَ', 'الانشِقَاقِ', 'البُرُوجِ', 'الطَّارِقِ', 'الأَعۡلَىٰ', 'الغَاشِيَةِ', 'الفَجۡرِ', 'البَلَدِ', 'الشَّمۡسِ', 'اللَّيۡلِ', 'الضُّحَىٰ', 'الشَّرۡحِ', 'التِّينِ', 'العَلَقِ', 'القَدۡرِ', 'البَيِّنَةِ', 'الزَّلۡزَلَةِ', 'العَادِيَاتِ', 'القَارِعَةِ', 'التَّكَاثُرِ', 'العَصۡرِ', 'الهُمَزَةِ', 'الفِيلِ', 'قُرَيۡشٍ', 'المَاعُونِ', 'الكَوۡثَرِ', 'الكَافِرُونَ', 'النَّصۡرِ', 'المَسَدِ', 'الإِخۡلَاصِ', 'الفَلَقِ', 'النَّاسِ'];
let isListCreatedBefore = false;
export let isRangeEnabled = false;
export let startingSurahIndex, startingAyahIndex, endingSurahIndex, endingAyahIndex;

function createSurahList(type, name, index) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input');
    const span = document.createElement('span');

    label.classList.add('option-label');
    span.classList.add('surah-number');

    label.setAttribute('for', `${type}${index}`);
    input.type = 'radio';
    input.id = `${type}${index}`;
    input.value = `${index}`;
    input.name = `${type}`;

    span.append(document.createTextNode(`${index}`));
    label.append(input, span, document.createTextNode(`${name}`));
    li.append(label);

    return li;
}

function createAyahList(type, index) {

    const li = document.createElement('li');
    const label = document.createElement('label');
    const input = document.createElement('input');

    li.classList.add('option');
    label.classList.add('option-label');
    input.classList.add('option-input');

    label.setAttribute('for', `${type}${index}`);
    input.type = 'radio';
    input.id = `${type}${index}`;
    input.value = `${index}`;
    input.name = `${type}`;

    label.append(input, document.createTextNode(`${index}`));
    li.append(label);

    return li;
}

function moveCheckToFront() {
    ['ss', 'sa', 'es', 'ea'].forEach((el) => {
        document.querySelector(`input[name="${el}"]:checked`).scrollIntoView({ behavior: 'instant', block: 'center', container: 'nearest', inline: 'center' });
    });
}

export function toggleRangeModal() {
    modalBackdrop.classList.remove('hide');
    rangeModal.classList.remove('hide');
    setAreEventsPaused(true);

    if (isListCreatedBefore) {
        moveCheckToFront();
        return;
    }
    surahNames.forEach((name, i) => {
        let index = i + 1;
        startingSurahSelection.append(createSurahList('ss', name, index)); //ss = starting-surah
        endingSurahSelection.append(createSurahList('es', name, index)); //es = ending-surah
    });
    document.getElementById('ss1').checked = true;
    document.getElementById('es114').checked = true;

    moveCheckToFront();
    isListCreatedBefore = true;
}

function cleanAyahList(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

startingSurahSelection.addEventListener('change', (e) => {
    if (e.target.name === 'ss') {
        cleanAyahList(startingAyahSelection);
        for (let i = 1; i <= surahLength[+e.target.value - 1]; i++) {
            startingAyahSelection.append(createAyahList('sa', i)); // sa = starting-ayah
        }
        document.getElementById('sa1').checked = true;
        moveCheckToFront();
    }
});

endingSurahSelection.addEventListener('change', (e) => {
    if (e.target.name === 'es') {
        cleanAyahList(endingAyahSelection);
        for (let i = 1; i <= surahLength[+e.target.value - 1]; i++) {
            endingAyahSelection.append(createAyahList('ea', i));//ea = ending-ayah
        }
        document.getElementById('ea1').checked = true;
        moveCheckToFront();
    }
});

['click', 'blur'].forEach(eventType => {
    let shortNames = ['ss', 'sa', 'es', 'ea'];
    [startingSurahSelection, startingAyahSelection, endingSurahSelection, endingAyahSelection].forEach((el, i) => {
        el.addEventListener(eventType, () => { document.querySelector(`input[name="${shortNames[i]}"]:checked`).scrollIntoView({ behavior: 'smooth', block: 'center', container: 'nearest', inline: 'center' }); });
    });
});

disableRangeBtn.addEventListener('click', () => {
    isRangeEnabled = false;
    hideModal();
});
saveRangeBtn.addEventListener('click', () => {

    range.length = 0;
    usedRange.length = 0;

    let ssi = Number(document.querySelector('input[name="ss"]:checked').value);
    let sai = Number(document.querySelector('input[name="sa"]:checked').value);
    let esi = Number(document.querySelector('input[name="es"]:checked').value);
    let eai = Number(document.querySelector('input[name="ea"]:checked').value);

    if (ssi > esi) {
        startingSurahIndex = esi;
        startingAyahIndex = eai;
        endingSurahIndex = ssi;
        endingAyahIndex = sai;
    } else {
        startingSurahIndex = ssi;
        startingAyahIndex = sai;
        endingSurahIndex = esi;
        endingAyahIndex = eai;
    }

    isRangeEnabled = true;
    hideModal();
    cleanCanvas();
    panelMap.clear();
    createRandomPanelBetweenRange();
});