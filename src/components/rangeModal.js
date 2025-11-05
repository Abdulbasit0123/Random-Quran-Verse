import { disableRangeBtn, modalBackdrop, rangeModal, saveRangeBtn } from '../dom';
import { setAreEventsPaused } from '../events/controls';
import { startingSurahSelection, startingAyahSelection, endingSurahSelection, endingAyahSelection } from '../dom';
import { surahLength } from './panel/panel';
import { hideModal } from '../utils/hideModal';

let surahNames = ['ٱلْفَاتِحَةِ', 'البَقَرَةِ', 'آلِ عِمۡرَانَ', 'النِّسَاءِ', 'المَائـِدَةِ', 'الأَنۡعَامِ', 'الأَعۡرَافِ', 'الأَنفَالِ', 'التَّوۡبَةِ', 'يُونُسَ', 'هُودٍ', 'يُوسُفَ', 'الرَّعۡدِ', 'إِبۡرَاهِيمَ', 'الحِجۡرِ', 'النَّحۡلِ', 'الإِسۡرَاءِ', 'الكَهۡفِ', 'مَرۡيَمَ', 'طه', 'الأَنبِيَاءِ', 'الحَجِّ', 'المُؤۡمِنُونَ', 'النُّورِ', 'الفُرۡقَانِ', 'الشُّعَرَاءِ', 'النَّمۡلِ', 'القَصَصِ', 'العَنكَبُوتِ', 'الرُّومِ', 'لُقۡمَانَ', 'السَّجۡدَةِ', 'الأَحۡزَابِ', 'سَبَإٍ', 'فَاطِرٍ', 'يسٓ', 'الصَّافَّاتِ', 'صٓ', 'الزُّمَرِ', 'غَافِرٍ', 'فُصِّلَتۡ', 'الشُّورَىٰ', 'الزُّخۡرُفِ', 'الدُّخَانِ', 'الجَاثِيَةِ', 'الأَحۡقَافِ', 'مُحَمَّدٍ', 'الفَتۡحِ', 'الحُجُرَاتِ', 'قٓ', 'الذَّارِيَاتِ', 'الطُّورِ', 'النَّجۡمِ', 'القَمَرِ', 'الرَّحۡمَٰن', 'الوَاقِعَةِ', 'الحَدِيدِ', 'المُجَادلَةِ', 'الحَشۡرِ', 'المُمۡتَحنَةِ', 'الصَّفِّ', 'الجُمُعَةِ', 'المُنَافِقُونَ', 'التَّغَابُنِ', 'الطَّلَاقِ', 'التَّحۡرِيمِ', 'المُلۡكِ', 'القَلَمِ', 'الحَاقَّةِ', 'المَعَارِجِ', 'نُوحٍ', 'الجِنِّ', 'المُزَّمِّلِ', 'المُدَّثِّرِ', 'القِيَامَةِ', 'الإِنسَانِ', 'المُرۡسَلَاتِ', 'النَّبَإِ', 'النَّازِعَاتِ', 'عَبَسَ', 'التَّكۡوِيرِ', 'الانفِطَارِ', 'المُطَفِّفِينَ', 'الانشِقَاقِ', 'البُرُوجِ', 'الطَّارِقِ', 'الأَعۡلَىٰ', 'الغَاشِيَةِ', 'الفَجۡرِ', 'البَلَدِ', 'الشَّمۡسِ', 'اللَّيۡلِ', 'الضُّحَىٰ', 'الشَّرۡحِ', 'التِّينِ', 'العَلَقِ', 'القَدۡرِ', 'البَيِّنَةِ', 'الزَّلۡزَلَةِ', 'العَادِيَاتِ', 'القَارِعَةِ', 'التَّكَاثُرِ', 'العَصۡرِ', 'الهُمَزَةِ', 'الفِيلِ', 'قُرَيۡشٍ', 'المَاعُونِ', 'الكَوۡثَرِ', 'الكَافِرُونَ', 'النَّصۡرِ', 'المَسَدِ', 'الإِخۡلَاصِ', 'الفَلَقِ', 'النَّاسِ'];
let isListCreatedBefore = false;
export let isRangeEnabled = false;
export let startingSurahIndex, startingAyahIndex, endingSurahIndex, endingAyahIndex;

export function toggleRangeModal() {
    modalBackdrop.classList.remove('hide');
    rangeModal.classList.remove('hide');
    setAreEventsPaused(true);

    if (isListCreatedBefore) return;
    surahNames.forEach((name, i) => {
        let index = i + 1;
        //ss stands for starting-surah
        const ssOption = document.createElement('input');
        const ssNumber = document.createElement('span');
        const ssName = document.createElement('label');

        ssOption.type = 'radio';
        ssOption.id = `ss${index }`;
        ssOption.value = `${index}`;
        ssOption.name = 'ss';
        ssOption.classList.add('modal-input');

        ssNumber.classList.add('surah-number');
        ssNumber.append(document.createTextNode(`${index}`));
        ssName.classList.add('option');
        ssName.setAttribute('for', `ss${index}`);
        ssName.append(ssNumber, document.createTextNode(`${name}`));

        startingSurahSelection.append(ssOption, ssName);

        //   <input type="radio" id="es3" value="2" name="es">
        //   <label for="startingSurah1" class="option"><span class="surah-number">3</span>آلِ عِمۡرَانَ</label>

        const esOption = document.createElement('input');
        const esNumber = document.createElement('span');
        const esName = document.createElement('label');

        esOption.type = 'radio';
        esOption.id = `es${index}`;
        esOption.value = `${index}`;
        esOption.name = 'es';
        esOption.classList.add('modal-input');

        esNumber.classList.add('surah-number');
        esNumber.append(document.createTextNode(`${index}`));
        esName.classList.add('option');
        esName.setAttribute('for', `es${index}`);
        esName.append(esNumber, document.createTextNode(`${name}`));

        endingSurahSelection.append(esOption, esName);
    });
    document.getElementById('ss1').checked = true;
    document.getElementById('es114').checked = true;
    isListCreatedBefore = true;
}

startingSurahSelection.addEventListener('change', (e) => {
    if (e.target.name === 'ss') {
        while (startingAyahSelection.firstChild) {
            startingAyahSelection.removeChild(startingAyahSelection.firstChild);
        }
        for (let i = 1; i <= surahLength[+e.target.value - 1]; i++) {

            const saOption = document.createElement('input');
            const saNumber = document.createElement('label');

            saOption.type = 'radio';
            saOption.id = `sa${i}`;
            saOption.value = `${i}`;
            saOption.name = 'sa';
            saOption.classList.add('modal-input');

            saNumber.classList.add('option');
            saNumber.setAttribute('for', `sa${i}`);
            saNumber.append(document.createTextNode(`${i}`));

            startingAyahSelection.append(saOption, saNumber);
        }
        document.getElementById('sa1').checked = true;
    }
});

endingSurahSelection.addEventListener('change', (e) => {
    if (e.target.name === 'es') {
        while (endingAyahSelection.firstChild) {
            endingAyahSelection.removeChild(endingAyahSelection.firstChild);
        }
        for (let i = 1; i <= surahLength[+e.target.value - 1]; i++) {

            const eaOption = document.createElement('input');
            const eaNumber = document.createElement('label');

            eaOption.type = 'radio';
            eaOption.id = `ea${i}`;
            eaOption.value = `${i}`;
            eaOption.name = 'ea';
            eaOption.classList.add('modal-input');

            eaNumber.classList.add('option');
            eaNumber.setAttribute('for', `ea${i}`);
            eaNumber.append(document.createTextNode(`${i}`));

            endingAyahSelection.append(eaOption, eaNumber);
        }
        document.getElementById('ea1').checked = true;
    }
});

['click', 'blur'].forEach(eventType => {
    startingSurahSelection.addEventListener(eventType, () => { document.querySelector('input[name="ss"]:checked').scrollIntoView({ behavior: 'instant', block: 'center', container: 'nearest', inline: 'center' }); });
    startingAyahSelection.addEventListener(eventType, () => { document.querySelector('input[name="sa"]:checked').scrollIntoView({ behavior: 'instant', block: 'center', container: 'nearest', inline: 'center' }); });
    endingSurahSelection.addEventListener(eventType, () => { document.querySelector('input[name="es"]:checked').scrollIntoView({ behavior: 'instant', block: 'center', container: 'nearest', inline: 'center' }); });
    endingAyahSelection.addEventListener(eventType, () => { document.querySelector('input[name="ea"]:checked').scrollIntoView({ behavior: 'instant', block: 'center', container: 'nearest', inline: 'center' }); });
});

disableRangeBtn.addEventListener('click', () => {
    isRangeEnabled = false;
    hideModal();
});
saveRangeBtn.addEventListener('click', () => {

    let ssi = Number(document.querySelector('input[name="ss"]:checked').value);
    let sai = Number(document.querySelector('input[name="sa"]:checked').value);
    let esi = Number(document.querySelector('input[name="es"]:checked').value);
    let eai = Number(document.querySelector('input[name="ea"]:checked').value);
    
    if(ssi < esi){
        startingSurahIndex = ssi;
        startingAyahIndex = sai;
        endingSurahIndex = esi;
        endingAyahIndex = eai;
    } else {
        startingSurahIndex = esi;
        startingAyahIndex = eai;
        endingSurahIndex = ssi;
        endingAyahIndex = sai;
    }

    isRangeEnabled = true;
    hideModal();
});