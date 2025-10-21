
export function hideTafseer() {
    const tafseerEl = document.querySelectorAll('.tafseer');
    tafseerEl.forEach((element) => {
        element.classList.add('hide');
    });
}
export function showTafseer() {
    const tafseerEl = document.querySelectorAll('.tafseer');
    tafseerEl.forEach((element) => {
        element.classList.remove('hide');
    });
}