import { modalBackdrop, reciterList, reciterModal, saveReciterBtn } from '../dom';
import { setAreEventsPaused } from '../events/controls';
import { hideModal } from '../utils/hideModal';

const reciters = [["ar.husary", "Mahmoud Khalil Al-Husary (Murattal) - محمود خليل الحصري (المرتل)", "128"], ["ar.husarymujawwad", "Mahmoud Khalil Al-Husary (Mujawwad) - محمود خليل الحصري (المجود)", "128"], ["ar.abdulbasitmurattal", "AbdulBaset AbdulSamad (Murattal) - عبدالباسط عبدالصمد (المرتل)", "192"], ["ar.abdulsamad", "AbdulBaset AbdulSamad (Mujawwad) - عبدالباسط عبدالصمد (المجود)", "64"], ["ar.minshawi", "Mohamed Siddiq El-Minshawi (Murattal) - محمد صديق المنشاوي (المرتل)", "128"], ["ar.minshawimujawwad", "Mohamed Siddiq El-Minshawi (Mujawwad) - محمد صديق المنشاوي (المجود)", "64"], ["ar.abdullahbasfar", "Abdullah Basfar - عبد الله بصفر", "192"], ["ar.abdurrahmaansudais", "Abdurrahman Al-Sudais - عبدالرحمن السديس", "192"], ["ar.shaatree", "Abu Bakr Al-Shatri - أبو بكر الشاطري", "128"], ["ar.ahmedajamy", "Ahmed Al-Ajamy - أحمد العجمي", "128"], ["ar.alafasy", "Mishary Rashid Alafasy - مشاري العفاسي", "128"], ["ar.hanirifai", "Hani ar-Rifai - هاني الرفاعي", "192"], ["ar.hudhaify", "Ali Al-Hudhaify - علي الحذيفي", "128"], ["ar.mahermuaiqly", "Maher Al-Muaiqly - ماهر المعيقلي", "128"], ["ar.muhammadayyoub", "Muhammad Ayyoub - محمد أيوب", "128"], ["ar.muhammadjibreel", "Muhammad Jibreel - محمد جبريل", "128"], ["ar.saoodshuraym", "Sa'ud Al-Shuraym - سعود الشريم", "64"], ["ar.aymanswoaid", "Ayman Sowaid - أيمن سويد", "64"], ["ar.parhizgar", "Shahriar Parhizgar - شهریار پرهیزگار", "48"], ["ar.ibrahimakhbar", "Ibrahim Al-Akhdar - إبراهيم الأخضر", "32"]];
let currentReciter = (localStorage.getItem('currentReciter') || 'ar.abdulbasitmurattal');
let currentReciterBitrate = (localStorage.getItem('currentReciterBitrate') || '192');

export function getReciterData() {
    if (currentReciter === 'random') {
        let randomReciterIndex = Math.floor(Math.random() * 20);
        return [reciters[randomReciterIndex][2], reciters[randomReciterIndex][0]];
    } else {
        return [currentReciterBitrate, currentReciter];
    }
}

let isListCreatedBefore = false;
export function toggleReciterModal() {
    modalBackdrop.classList.remove('hide');
    reciterModal.classList.remove('hide');
    setAreEventsPaused(true);

    if (isListCreatedBefore) {
        document.querySelector('input[name="reciter"]:checked').scrollIntoView({ behavior: 'instant', block: 'center', container: 'nearest', inline: 'center' });
        return;
    }
    reciters.forEach(reciter => {
        const li = document.createElement('li');
        const input = document.createElement('input');
        const label = document.createElement('label');
        const span = document.createElement('span');

        li.classList.add('list-item');
        input.type = 'radio';
        input.id = `${reciter[0]}`;
        input.value = `${reciter[0]}`;
        input.name = 'reciter';
        input.setAttribute('data-bitrate', `${reciter[2]}`);

        span.append(document.createTextNode(`${reciter[1]}`));

        label.setAttribute('for', `${reciter[0]}`);
        label.classList.add('item-label');
        label.append(span);
        li.append(input, label);
        reciterList.append(li);
    });
    isListCreatedBefore = true;
    if (localStorage.getItem('isRandomChecked') === 'true') document.getElementById('random').checked = true;
    else document.getElementById(currentReciter).checked = true;
    document.getElementById(currentReciter).scrollIntoView({ behavior: 'instant', block: 'center', container: 'nearest', inline: 'center' });
}

saveReciterBtn.addEventListener('click', () => {
    const selectedReciter = document.querySelector('input[name="reciter"]:checked');
    if (selectedReciter) {
        currentReciter = selectedReciter.value;
        localStorage.setItem('currentReciter', currentReciter);

        currentReciterBitrate = selectedReciter.getAttribute('data-bitrate');
        localStorage.setItem('currentReciterBitrate', currentReciterBitrate);

        hideModal();
    }
});