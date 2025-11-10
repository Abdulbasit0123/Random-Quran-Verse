export function hideTafseer() {
    const tafseerEl = document.querySelectorAll('.tafseer');
    tafseerEl.forEach((element) => {
        element.classList.add('hide');
    });
    localStorage.setItem('isTafseerTurnedOff', 'true');
}
export function showTafseer() {
    const tafseerEl = document.querySelectorAll('.tafseer');
    tafseerEl.forEach((element) => {
        element.classList.remove('hide');
    });
    localStorage.setItem('isTafseerTurnedOff', 'false');
}