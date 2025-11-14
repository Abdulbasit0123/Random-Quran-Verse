import { movePanelHorizontally, movePanelVertically } from '../components/panel/panel.js';
import { viewport } from '../dom.js';

export let areEventsPaused = false;
export function setAreEventsPaused(value) { 
    areEventsPaused = value; 
}
// Keyboard, touch, mouse, scroll controls
export function setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
        if (areEventsPaused) return;

        if (e.key === 'ArrowRight') movePanelHorizontally(1);
        else if (e.key === 'ArrowLeft') movePanelHorizontally(-1);
        else if (e.key === 'ArrowDown') movePanelVertically(1);
        else if (e.key === ' ') movePanelVertically(1);
        else if (e.key === 'ArrowUp') movePanelVertically(-1);
    });
}

export function setupTouchControls() {

    let startX = 0;
    let startY = 0;
    let touchStartTarget = null; // Stores the element where the touch began

    window.addEventListener('touchstart', e => {
        if (areEventsPaused) return;
        // Record the starting coordinates and, most importantly, the target element.
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        touchStartTarget = e.target;
    }, { passive: true }); // This listener just records data, so it can be passive.

    window.addEventListener('touchend', e => {
        if (areEventsPaused) return;
        if (!touchStartTarget) {
            return; // Exit if the touch didn't start properly.
        }

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;

        const diffX = startX - endX;
        const diffY = startY - endY;
        const swipeThreshold = 50; // Minimum pixel distance to be considered a swipe.

        // --- HORIZONTAL SWIPE ---
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > swipeThreshold) movePanelHorizontally(1);
            else if (diffX < -swipeThreshold) movePanelHorizontally(-1);
        }
        // --- VERTICAL SWIPE ---
        else {
            const isSwipeUp = diffY > swipeThreshold; // Finger moved up (scroll down).
            const isSwipeDown = diffY < -swipeThreshold; // Finger moved down (scroll up).

            if (!isSwipeUp && !isSwipeDown) {
                return; // Not a long enough swipe.
            }

            // Find the content wrapper based on where the touch STARTED.
            const contentWrapper = touchStartTarget.closest('.content-wrapper');

            // If the swipe didn't start on a content area, just move the panel.
            if (!contentWrapper) {
                if (isSwipeUp) movePanelVertically(1);
                else if (isSwipeDown) movePanelVertically(-1);
                return;
            }

            const { scrollTop, scrollHeight, clientHeight } = contentWrapper;
            const isContentScrollable = scrollHeight > clientHeight;

            // If the content isn't scrollable, any swipe moves the panel.
            if (!isContentScrollable) {
                if (isSwipeUp) movePanelVertically(1);
                else if (isSwipeDown) movePanelVertically(-1);
                return;
            }

            // Check if the scrollable content is at its boundaries.
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
            const isAtTop = scrollTop === 0;

            // If swiping up (to scroll down) AND we're already at the bottom...
            if (isSwipeUp && isAtBottom) {
                movePanelVertically(1); // ...then move the panel.
            }
            // If swiping down (to scroll up) AND we're already at the top...
            else if (isSwipeDown && isAtTop) {
                movePanelVertically(-1); // ...then move the panel.
            }
            // Otherwise, do nothing. The browser's native touch scroll has taken over.
        }

        // Reset for the next touch event.
        touchStartTarget = null;
    });
}

export function setupMouseControls() {

    let startX, startY;
    let isClickedAndMovedOutside = false;
    window.addEventListener('mousedown', (e) => {
        if (areEventsPaused) return;
        if (e.target.closest('.content-wrapper')) {
            isClickedAndMovedOutside = false;
            return;
        }
        startX = e.clientX;
        startY = e.clientY;
        viewport.classList.add('grabbing');
        window.addEventListener('mousemove', (e) => {
            window.getSelection().removeAllRanges();
            isClickedAndMovedOutside = true;
        }, { once: true });
    });
    window.addEventListener('mouseup', (e) => {
        viewport.classList.remove('grabbing');
        if (areEventsPaused) return;
        if (!isClickedAndMovedOutside) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const threshold = 50;
        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                deltaX > 0 ? movePanelHorizontally(-1) : movePanelHorizontally(1);
            } else deltaY > 0 ? movePanelVertically(-1) : movePanelVertically(1);
        }
        isClickedAndMovedOutside = false;
    });
}

export function setupScrollControls() {
    if (areEventsPaused) return;

    window.addEventListener('wheel', (e) => {
        if (areEventsPaused) return;
        // Handle horizontal scrolling first, as it's simpler.
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault(); // Prevent browser back/forward navigation.
            if (e.deltaX > 0) movePanelHorizontally(1);
            else movePanelHorizontally(-1);
            return; // Stop here.
        }

        // --- VERTICAL SCROLL LOGIC ---
        const contentWrapper = e.target.closest('.content-wrapper');
        const isScrollingDown = e.deltaY > 0;

        // If not scrolling over content, or if the panel is off-screen,
        // just move the main canvas.
        if (!contentWrapper) {
            e.preventDefault();
            movePanelVertically(isScrollingDown ? 1 : -1);
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = contentWrapper;

        // Check if the content is actually taller than its container.
        const isContentScrollable = scrollHeight > clientHeight;

        // If the content is NOT scrollable, any scroll should move the panel.
        if (!isContentScrollable) {
            e.preventDefault();
            movePanelVertically(isScrollingDown ? 1 : -1);
            return;
        }

        // If the content IS scrollable, we check the boundaries.
        if (isScrollingDown) {
            // Check if we are at the very bottom (with a 1px tolerance).
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
            if (isAtBottom) {
                // If at the bottom, move the panel.
                e.preventDefault();
                movePanelVertically(1);
            }
            // Otherwise, do nothing and let the browser scroll the content.
        } else { // Scrolling up
            const isAtTop = scrollTop === 0;
            if (isAtTop) {
                // If at the top, move the panel.
                e.preventDefault();
                movePanelVertically(-1);
            }
            // Otherwise, do nothing and let the browser scroll the content.
        }

    }, { passive: false }); // `passive: false` is required to use preventDefault().
}
