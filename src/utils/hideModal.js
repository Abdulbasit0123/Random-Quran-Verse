import { modalBackdrop, rangeModal, languageModal, searchInput, reciterModal } from '../dom';
import { setAreEventsPaused } from '../events/controls';
export const hideModal = () => {
    modalBackdrop.classList.add('hide');

    rangeModal.classList.add('hide');
    languageModal.classList.add('hide');
    reciterModal.classList.add('hide');
    
    searchInput.value = '';

    setAreEventsPaused(false);
};