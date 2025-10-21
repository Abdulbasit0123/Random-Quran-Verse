import { currentH, currentV } from './panel/panel.js';

export function showWarningEdge(id) {
    const element = document.getElementById(id);
    const maxWidth = 10; // in pixels
    const duration = 250; // total time for full animation (expand + contract) in ms

    let startTime = null;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const halfDuration = duration / 2;

        let progress;
        if (elapsed <= halfDuration) {
            // Expanding phase
            progress = elapsed / halfDuration;
            element.style.width = (progress * maxWidth) + 'px';
            if (id === 'startEdge') {
                canvas.style.transform = `translate(${(-currentH * 100) - (progress * maxWidth)}vw, ${(-currentV * 100)}vh`;
            } else {
                canvas.style.transform = `translate(${(-currentH * 100) + (progress * maxWidth)}vw, ${(-currentV * 100)}vh`;
            }

        } else if (elapsed <= duration) {
            // Contracting phase
            progress = (elapsed - halfDuration) / halfDuration;
            element.style.width = ((1 - progress) * maxWidth) + 'px';
            if (id === 'startEdge') {
                canvas.style.transform = `translate(${(-currentH * 100) + ((1 - progress) * maxWidth)}vw, ${(-currentV * 100)}vh`;
            } else {
                canvas.style.transform = `translate(${(-currentH * 100) - ((1 - progress) * maxWidth)}vw, ${(-currentV * 100)}vh`;
            }
        } else {
            element.style.width = '0px';
            canvas.style.transform = `translate(${(-currentH * 100)}vw, ${(-currentV * 100)}vh`;
            return;
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}
