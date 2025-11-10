import { spinIcon, storedIcon } from '../dom';

export function showLoading() {
    spinIcon.classList.remove('hide');
}

export function hideLoading() {
    spinIcon.classList.add('hide');
    storedIcon.classList.remove('hide');
    setTimeout(() => storedIcon.classList.add('hide'), 1000);
}