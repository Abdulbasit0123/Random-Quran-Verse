import { audioEl, playBtn, pauseBtn } from '../dom';
import { currentAyahNumber } from './panel/panel';
import { getReciterData } from './reciterModal';

export function playAudio() {
    playBtn.classList.add('hide');
    pauseBtn.classList.remove('hide');

    audioEl.pause(); // I don't know if this is necessary or not

    let [bitrate, reciter] = getReciterData();
    let audioSrc = `https://cdn.islamic.network/quran/audio/${bitrate}/${reciter}/${currentAyahNumber}.mp3`;

    // Only change source if it's different
    if (audioEl.src !== audioSrc) {
        audioEl.src = audioSrc;
        audioEl.load(); // Load the new source
    }

    audioEl.play().catch(error => {
        if (error.name === 'AbortError') {
            console.log('Playback was interrupted by pause.');
        }
        else {
            console.error('Playback failed:', error);
        }
    });
}

export function pauseAudio() {
    playBtn.classList.remove('hide');
    pauseBtn.classList.add('hide');
    audioEl.pause();
}