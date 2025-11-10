import { toggleLanguageModal } from '../components/languageModal.js';
import { toggleRangeModal } from '../components/rangeModal.js';
import { viewport, modalBackdrop, actionButtons, themeBtn, fullscreenBtn, rangeBtn, languageBtn, moonIcon, sunIcon, expandIcon, minimizeIcon, closeModal, } from '../dom.js';
import { hideModal } from '../utils/hideModal.js';

export function setupActionBtns() {

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

    closeModal.addEventListener('click', hideModal);
    modalBackdrop.addEventListener('click', (event) => {
        if (event.target === modalBackdrop) {
            hideModal();
        }
    });
    setTimeout(() => {
        actionButtons.classList.add('hide');
    }, 7000);
}