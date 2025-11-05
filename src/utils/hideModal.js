import { modalBackdrop, rangeModal, languageModal, searchInput } from '../dom';
import { setAreEventsPaused } from '../events/controls';
export const hideModal = () => {
    modalBackdrop.classList.add('hide');

    rangeModal.classList.add('hide');

    searchInput.value = '';
    languageModal.classList.add('hide');

    setAreEventsPaused(false);
};