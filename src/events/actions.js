import { toggleLanguageModal } from '../components/languageModal.js';
import { toggleRangeModal } from '../components/rangeModal.js';
import { viewport, modalBackdrop, actionButtons, themeBtn, fullscreenBtn, rangeBtn, languageBtn, moonIcon, sunIcon, expandIcon, minimizeIcon, closeModal, githubBtn, playBtn, pauseBtn, audioEl, reciterBtn, progressBar, progress, currentTimeEl, durationEl, seekBackwardBtn, seekForwardBtn, blurBtn, blurIcon, unblurIcon, canvas, autoPlayMode, orderIcon, shuffleIcon, repeatBtn, playbackSpeedBtn } from '../dom.js';
import { hideModal } from '../utils/hideModal.js';
import { playAudio } from '../components/audio.js';
import { pauseAudio } from '../components/audio.js';
import { toggleReciterModal } from '../components/reciterModal.js';
import { movePanelHorizontally, movePanelVertically } from '../components/panel/panel.js';

export let isOnAutoplay = false;
export let playModeState = 0;//0 is disabled, 1 is ordered, 2 is shuffled
let isRepeatModeOn = false; //0 is disabled, 1 is twice, 2 is thrice, 3 is infinite
export let currentPlaybackSpeed = 1;

export function setupActionBtns() {
    //double click to show/hide overlay buttons
    viewport.addEventListener('dblclick', (e) => {
        if (e.target.closest('.content-wrapper')) return;
        e.preventDefault();
        window.getSelection().removeAllRanges();
        if (actionButtons.classList.contains('hide')) {
            actionButtons.classList.remove('hide');
            setTimeout(() => {
                actionButtons.classList.add('hide');
            }, 7000);
        } else {
            actionButtons.classList.add('hide');
        }
    });
    themeBtn.addEventListener('click', function () {
        document.body.classList.toggle('light');
        moonIcon.classList.toggle('hide');
        sunIcon.classList.toggle('hide');
        // Persist theme choice
        const theme = document.body.classList.contains('light') ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
    });
    fullscreenBtn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        expandIcon.classList.toggle('hide');
        minimizeIcon.classList.toggle('hide');
    });
    rangeBtn.addEventListener('click', toggleRangeModal);
    languageBtn.addEventListener('click', toggleLanguageModal);
    reciterBtn.addEventListener('click', toggleReciterModal);
    githubBtn.addEventListener('click', () => {
        window.open('https://github.com/Abdulbasit0123/Random-Quran-Verse', '_blank');
    });

    closeModal.addEventListener('click', hideModal);
    modalBackdrop.addEventListener('click', (event) => {
        if (event.target === modalBackdrop) {
            hideModal();
        }
    });
    setTimeout(() => {
        actionButtons.classList.add('hide');
    }, 7000);

    //audio related buttons
    playBtn.addEventListener('click', () => {
        playAudio();
        isOnAutoplay = true;
    });
    pauseBtn.addEventListener('click', () => {
        pauseAudio();
        isOnAutoplay = false;
    });
    audioEl.addEventListener('ended', () => {
        playBtn.classList.remove('hide');
        pauseBtn.classList.add('hide');

        /* Snap to 100% on end */
        progress.style.width = '100%';
        currentTimeEl.textContent = formatTime(audioEl.duration);

        if (isRepeatModeOn) {
            playAudio();
            return;
        }
        if (playModeState === 1) {
            movePanelHorizontally(-1);
            playAudio();
        }
        if (playModeState === 2) {
            movePanelVertically(1);
            playAudio();
        }
    });

    /* Format mm:ss */
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    /* Set duration when metadata loads */
    audioEl.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioEl.duration);
    });

    /* Update progress while playing */
    audioEl.addEventListener('timeupdate', () => {
        if (!audioEl.duration) return;

        const percent = audioEl.currentTime / audioEl.duration;
        progress.style.width = `${percent * 100}%`;
        currentTimeEl.textContent = formatTime(audioEl.currentTime);
    });

    /* Click-to-seek */
    progressBar.addEventListener('click', (e) => {
        if (!audioEl.duration || isNaN(audioEl.duration)) return;
        const progressBarRect = progressBar.getBoundingClientRect();
        const clickPositionX = e.clientX - progressBarRect.left;
        const width = progressBarRect.width;
        const percentage = Math.max(0, Math.min(1, clickPositionX / width));
        audioEl.currentTime = audioEl.duration * percentage;
        progress.style.width = `${percentage * 100}%`;
    });

    function seekBackward() {
        if (!audioEl.duration || isNaN(audioEl.duration)) return;
        const newTime = Math.max(0, audioEl.currentTime - 5);
        audioEl.currentTime = newTime;
        const percent = newTime / audioEl.duration;
        progress.style.width = `${percent * 100}%`;
    }
    seekBackwardBtn.addEventListener('click', () => {
        seekBackward();
        seekBackwardBtn.blur();
    });

    function seekForward() {
        if (!audioEl.duration || isNaN(audioEl.duration)) return;
        const newTime = Math.max(0, audioEl.currentTime + 5);
        audioEl.currentTime = newTime;
        const percent = newTime / audioEl.duration;
        progress.style.width = `${percent * 100}%`;
    }
    seekForwardBtn.addEventListener('click', () => {
        seekForward();
        seekForwardBtn.blur();
    });

    blurBtn.addEventListener('click', () => {
        blurIcon.classList.toggle('hide');
        unblurIcon.classList.toggle('hide');
        canvas.classList.toggle('blur');
        blurBtn.blur();
    });

    autoPlayMode.addEventListener('click', () => {
        isRepeatModeOn = false;
        repeatBtn.classList.add('disabled');

        if (playModeState === 0) {
            orderIcon.classList.remove('disabled');
            playModeState++;
        } else if (playModeState === 1) {
            orderIcon.classList.toggle('hide');
            shuffleIcon.classList.toggle('hide');
            playModeState++;
        } else {
            orderIcon.classList.toggle('hide');
            shuffleIcon.classList.toggle('hide');
            orderIcon.classList.toggle('disabled');
            playModeState = 0;
        }

        autoPlayMode.blur();
    });

    repeatBtn.addEventListener('click', () => {
        repeatBtn.classList.toggle('disabled');
        isRepeatModeOn = isRepeatModeOn ? false : true;
        if (isRepeatModeOn) {
            orderIcon.classList.remove('hide');
            orderIcon.classList.add('disabled');
            shuffleIcon.classList.add('hide');
            playModeState = 0;
        }
        repeatBtn.blur();
    });

    const speeds = [1, 1.5, 1.75, 2, 0.5, 0.75];
    let speedIndex = 0;
    playbackSpeedBtn.addEventListener('click', () => {
        speedIndex = (speedIndex + 1) % speeds.length;

        currentPlaybackSpeed = speeds[speedIndex];
        audioEl.playbackRate = currentPlaybackSpeed;
        playbackSpeedBtn.textContent = `${currentPlaybackSpeed}x`;
        playbackSpeedBtn.blur();
    });

}