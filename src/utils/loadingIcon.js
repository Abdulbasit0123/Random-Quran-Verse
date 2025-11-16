// this is the bottom right status icon

import { spinIcon, storedIcon, errorIcon } from '../dom';

export function showLoading() {
    hideStatus();
    spinIcon.classList.remove('hide');
}
export function showSuccess() {
    hideStatus();
    storedIcon.classList.remove('hide');
    setTimeout(() => storedIcon.classList.add('hide'), 1000);
}

export function showError(){
    hideStatus();
    errorIcon.classList.remove('hide');
}

export function hideStatus() {
    spinIcon.classList.add('hide');
    storedIcon.classList.add('hide');
    errorIcon.classList.add('hide');
}