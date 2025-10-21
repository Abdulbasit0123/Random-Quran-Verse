import { cleanCanvas } from '../utils/cleanCanvas';

const loading = document.createElement('div');
loading.classList.add('loading');
loading.innerHTML = `<img id="skeleton" src="/skeleton.svg" alt="skeleton"><img id="spinner" src="/spinner.svg" alt="spinner">`;


export function showLoading(){
    cleanCanvas();
    canvas.append(loading);
}
export function hideLoading(){
    cleanCanvas();
}
