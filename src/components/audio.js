import { audioEl, playBtn, pauseBtn } from '../dom';
import { currentAyahNumber } from './panel/panel';

export function playAudio() {
    playBtn.classList.add('hide');
    pauseBtn.classList.remove('hide');

    audioEl.pause(); // I don't know if this is necessary or not

    let audioSrc = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${currentAyahNumber}.mp3`;

    // Only change source if it's different
    if (audioEl.src !== audioSrc) {
        audioEl.src = audioSrc;
        audioEl.load(); // Load the new source
    }
    audioEl.play(); // Start or resume playback
}

export function pauseAudio() {
    playBtn.classList.remove('hide');
    pauseBtn.classList.add('hide');
    audioEl.pause();
}