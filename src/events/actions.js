import { toggleLanguageModal } from '../components/languageModal.js';
import { viewport, actionButtons, themeBtn, fullscreenBtn, languageBtn, moonIcon, sunIcon, expandIcon, minimizeIcon, } from '../dom.js';

export function setupActionBtns() {

    viewport.addEventListener('dblclick', (e) => {
        if (e.target.closest('.content-wrapper')) return;
        e.preventDefault();
        window.getSelection().removeAllRanges();
        actionButtons.classList.toggle('hide');
    });
    themeBtn.addEventListener('click', function () {
        document.body.classList.toggle('light');
        moonIcon.classList.toggle('hide');
        sunIcon.classList.toggle('hide');
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
    languageBtn.addEventListener('click', toggleLanguageModal);
}