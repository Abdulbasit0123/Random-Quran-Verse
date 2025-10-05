const canvas = document.getElementById('canvas');
const landing = document.querySelector('.landing');

// Tracks position
let currentV = 0;
let currentH = 0;

// Tracks the current surah and ayah
let currentSurah = null;
let currentSurahIndex = null;
let currentAyahIndex = null;

// Stores panels by 'v,h' with their verse information
const panelMap = {};

// Cache for Quran and Tafseer data
let cachedQuranData = null;
let cachedTafseerData = null;

// Cache keys for localStorage
const QURAN_CACHE_KEY = 'quran_data_ar_sahih';
const TAFSEER_CACHE_KEY = 'tafseer_data_ku_asan';
const CACHE_VERSION_KEY = 'quran_cache_version';
const CURRENT_CACHE_VERSION = '1.0'; // Increment this to invalidate old cache

// Utility to generate a unique key
function panelKey(v, h) {
    return `${v},${h}`;
}

// Check if cached data is valid
function isCacheValid() {
    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    return cachedVersion === CURRENT_CACHE_VERSION;
}

// Load data from localStorage
function loadFromCache() {
    try {
        if (!isCacheValid()) {
            console.log('Cache version mismatch, clearing old cache');
            clearCache();
            return { quran: null, tafseer: null };
        }

        const quranData = localStorage.getItem(QURAN_CACHE_KEY);
        const tafseerData = localStorage.getItem(TAFSEER_CACHE_KEY);

        return {
            quran: quranData ? JSON.parse(quranData) : null,
            tafseer: tafseerData ? JSON.parse(tafseerData) : null
        };
    } catch (error) {
        console.error('Error loading from cache:', error);
        clearCache();
        return { quran: null, tafseer: null };
    }
}

// Save data to localStorage
function saveToCache(quran, tafseer) {
    try {
        localStorage.setItem(QURAN_CACHE_KEY, JSON.stringify(quran));
        localStorage.setItem(TAFSEER_CACHE_KEY, JSON.stringify(tafseer));
        localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
        console.log('Data saved to cache successfully');
    } catch (error) {
        console.error('Error saving to cache:', error);
        // Handle storage quota exceeded
        if (error.name === 'QuotaExceededError') {
            console.log('Storage quota exceeded, clearing cache and retrying...');
            clearCache();
            try {
                localStorage.setItem(QURAN_CACHE_KEY, JSON.stringify(quran));
                localStorage.setItem(TAFSEER_CACHE_KEY, JSON.stringify(tafseer));
                localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
            } catch (retryError) {
                console.error('Failed to save to cache even after clearing:', retryError);
            }
        }
    }
}

// Clear cache
function clearCache() {
    localStorage.removeItem(QURAN_CACHE_KEY);
    localStorage.removeItem(TAFSEER_CACHE_KEY);
    localStorage.removeItem(CACHE_VERSION_KEY);
}

// Fetch Quran and Tafseer data from API or cache
async function fetchQuranAndTafseer() {
    // Return cached data if available
    if (cachedQuranData && cachedTafseerData) {
        return { quran: cachedQuranData, tafseer: cachedTafseerData };
    }

    // Try to load from localStorage first
    const cachedData = loadFromCache();
    if (cachedData.quran && cachedData.tafseer) {
        console.log('Loading data from cache');
        cachedQuranData = cachedData.quran;
        cachedTafseerData = cachedData.tafseer;
        return { quran: cachedQuranData, tafseer: cachedTafseerData };
    }

    // Fetch from API if not in cache
    console.log('Fetching data from API...');
    try {
        landing.style.display = 'flex';
        const [quranRes, tafseerRes] = await Promise.all([
            fetch('https://api.alquran.cloud/v1/quran/ar.sahih'),
            fetch('https://api.alquran.cloud/v1/quran/ku.asan')
        ]);

        if (!quranRes.ok || !tafseerRes.ok) {
            throw new Error('Failed to fetch data from API');
        }

        const quran = await quranRes.json();
        const tafseer = await tafseerRes.json();

        // Cache the fetched data
        cachedQuranData = quran;
        cachedTafseerData = tafseer;
        saveToCache(quran, tafseer);

        landing.style.display = "none";
        return { quran, tafseer };
    } catch (error) {
        console.error('Error fetching data:', error);

        // Try to use cached data as fallback even if version mismatch
        const fallbackData = {
            quran: localStorage.getItem(QURAN_CACHE_KEY),
            tafseer: localStorage.getItem(TAFSEER_CACHE_KEY)
        };

        if (fallbackData.quran && fallbackData.tafseer) {
            console.log('Using cached data as fallback');
            try {
                const parsedQuran = JSON.parse(fallbackData.quran);
                const parsedTafseer = JSON.parse(fallbackData.tafseer);
                cachedQuranData = parsedQuran;
                cachedTafseerData = parsedTafseer;
                return { quran: parsedQuran, tafseer: parsedTafseer };
            } catch (parseError) {
                console.error('Error parsing fallback data:', parseError);
            }
        }

        throw error; // Re-throw if no fallback available
    }
}

// Create and append a panel
function createPanel(v, h, surah, tafseer, surahIndex, ayahIndex) {
    const ayahData = surah.ayahs[ayahIndex];
    const tafseerText = tafseer.data.surahs[surahIndex].ayahs[ayahIndex].text;

    // Strip Basmala from ayah text unless Surah Fatiha
    let ayahText = ayahData.text;
    if (ayahIndex === 0 && surahIndex > 0) {
        ayahText = ayahText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '');
    }

    const ayahNumber = ayahData.numberInSurah;
    const surahName = surah.name.replace('سُورَةُ ', '');

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = `x${h}y${v}`;
    panel.style.top = `${v * 100}vh`;
    panel.style.left = `${h * 100}vw`;

    const wrapper = document.createElement('div');
    wrapper.className = 'content-wrapper';

    const quranEl = document.createElement('p');
    quranEl.className = 'quran';
    quranEl.textContent = ayahText;

    const tafseerEl = document.createElement('p');
    tafseerEl.className = 'tafseer';
    tafseerEl.textContent = tafseerText;

    const sourceEl = document.createElement('a');
    sourceEl.className = 'source';
    sourceEl.href = `https://tarteel.ai/ayah/${surahIndex + 1}/${ayahNumber}`;
    sourceEl.textContent = `${surahName} - ${ayahNumber}`;

    const breakEl = document.createElement('br');

    wrapper.append(quranEl, tafseerEl, sourceEl, breakEl);
    panel.appendChild(wrapper);
    canvas.appendChild(panel);

    // Store panel with verse information
    const key = panelKey(v, h);
    panelMap[key] = {
        element: panel,
        surahIndex: surahIndex,
        ayahIndex: ayahIndex,
        surah: surah
    };
}

// Update current state based on visible panel
function updateCurrentState() {
    const key = panelKey(currentV, currentH);
    const panelData = panelMap[key];

    if (panelData) {
        currentSurah = panelData.surah;
        currentSurahIndex = panelData.surahIndex;
        currentAyahIndex = panelData.ayahIndex;
        console.log(`Updated state to: Surah ${currentSurahIndex + 1}, Ayah ${currentAyahIndex + 1}`);
    }
}

// Create a random surah + ayah panel
async function createRandomPanel(v, h) {
    try {
        const { quran, tafseer } = await fetchQuranAndTafseer();
        const surahs = quran.data.surahs;

        const surahIndex = Math.floor(Math.random() * surahs.length);
        const ayahs = surahs[surahIndex].ayahs;
        const ayahIndex = Math.floor(Math.random() * ayahs.length);

        createPanel(v, h, surahs[surahIndex], tafseer, surahIndex, ayahIndex);

        // Update current state after creating the panel
        updateCurrentState();
    } catch (error) {
        console.error('Error creating random panel:', error);
        // You might want to show an error message to the user here
    }
}

// Create a panel using an adjacent ayah
async function createAdjacentAyahPanel(v, h, direction) {
    const newAyahIndex = currentAyahIndex + direction;

    if (newAyahIndex < 0 || newAyahIndex >= currentSurah.ayahs.length) {
        console.warn('No more ayahs in this direction.');
        return;
    }

    try {
        const { quran, tafseer } = await fetchQuranAndTafseer();

        createPanel(v, h, currentSurah, tafseer, currentSurahIndex, newAyahIndex);
    } catch (error) {
        console.error('Error creating adjacent ayah panel:', error);
    }
}

// Update the canvas position using transform
function updateCanvasPosition() {
    const x = -currentH * 100;
    const y = -currentV * 100;
    canvas.style.transform = `translate(${x}vw, ${y}vh)`;

    // Update current state whenever we move to a different position
    updateCurrentState();
}

function ensurePanel(v, h) {
    const k = panelKey(v, h);
    if (!panelMap[k]) {
        createRandomPanel(v, h);
    }
}

// Move vertically (up/down), reset horizontal to 0
function moveVertical(dir) {
    currentV += dir;
    currentH = 0;
    ensurePanel(currentV, currentH);
    updateCanvasPosition();
}

function showWarningEdge(id) {
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
        } else if (elapsed <= duration) {
            // Contracting phase
            progress = (elapsed - halfDuration) / halfDuration;
            element.style.width = ((1 - progress) * maxWidth) + 'px';
        } else {
            // Done
            element.style.width = '0px';
            return;
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

// Move horizontally (left/right) within the same surah
function moveHorizontal(dir) {
    // Make sure we have the current state updated
    updateCurrentState();

    if (!currentSurah) {
        console.warn('Please move vertically first to load a surah.');
        return;
    }

    const nextAyahIndex = currentAyahIndex + (dir > 0 ? -1 : 1); // right = previous, left = next
    if (nextAyahIndex < 0) {
        showWarningEdge('startEdge');
        return;
    } else if (nextAyahIndex >= currentSurah.ayahs.length) {
        showWarningEdge('endEdge');
        return;
    }

    currentH += dir;

    // Check if panel already exists before creating a new one
    const targetKey = panelKey(currentV, currentH);
    if (!panelMap[targetKey]) {
        createAdjacentAyahPanel(currentV, currentH, dir > 0 ? -1 : 1);
    }

    updateCanvasPosition();
}

// Setup keyboard arrow controls
function setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') moveHorizontal(1);
        else if (e.key === 'ArrowLeft') moveHorizontal(-1);
        else if (e.key === 'ArrowDown') moveVertical(1);
        else if (e.key === 'ArrowUp') moveVertical(-1);
    });
}

function setupTouchControls() {
    let startX = 0;
    let startY = 0;
    let touchStartTarget = null; // Stores the element where the touch began

    window.addEventListener('touchstart', e => {
        // Record the starting coordinates and, most importantly, the target element.
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        touchStartTarget = e.target;
    }, { passive: true }); // This listener just records data, so it can be passive.

    window.addEventListener('touchend', e => {
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
            if (diffX > swipeThreshold) moveHorizontal(1);
            else if (diffX < -swipeThreshold) moveHorizontal(-1);
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
                if (isSwipeUp) moveVertical(1);
                else if (isSwipeDown) moveVertical(-1);
                return;
            }

            const { scrollTop, scrollHeight, clientHeight } = contentWrapper;
            const isContentScrollable = scrollHeight > clientHeight;

            // If the content isn't scrollable, any swipe moves the panel.
            if (!isContentScrollable) {
                if (isSwipeUp) moveVertical(1);
                else if (isSwipeDown) moveVertical(-1);
                return;
            }

            // Check if the scrollable content is at its boundaries.
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
            const isAtTop = scrollTop === 0;

            // If swiping up (to scroll down) AND we're already at the bottom...
            if (isSwipeUp && isAtBottom) {
                moveVertical(1); // ...then move the panel.
            }
            // If swiping down (to scroll up) AND we're already at the top...
            else if (isSwipeDown && isAtTop) {
                moveVertical(-1); // ...then move the panel.
            }
            // Otherwise, do nothing. The browser's native touch scroll has taken over.
        }

        // Reset for the next touch event.
        touchStartTarget = null;
    });
}

function setupMouseControls() {
    let startX, startY;
    let isClickedAndMovedOutside = false;

    window.addEventListener('mousedown', (e) => {
        // Check if mouse down started on or inside a content-wrapper
        if (e.target.closest('.content-wrapper')) {
            isClickedAndMovedOutside = false;
            return; // Don't handle mouse controls for content areas
        }
        startX = e.clientX;
        startY = e.clientY;
        window.addEventListener('mousemove', (e) => {
            window.getSelection().removeAllRanges();
            isClickedAndMovedOutside = true;
        }, { once: true });
    });

    window.addEventListener('mouseup', (e) => {
        if (!isClickedAndMovedOutside) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const threshold = 50; // minimum distance to be considered a swipe
        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                deltaX > 0 ? moveHorizontal(-1) : moveHorizontal(1);
            } else deltaY > 0 ? moveVertical(-1) : moveVertical(1);
        }
        isClickedAndMovedOutside = false;
    });
}

function setupScrollControls() {
    window.addEventListener('wheel', (e) => {
        // Handle horizontal scrolling first, as it's simpler.
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault(); // Prevent browser back/forward navigation.
            if (e.deltaX > 0) moveHorizontal(1);
            else moveHorizontal(-1);
            return; // Stop here.
        }

        // --- VERTICAL SCROLL LOGIC ---
        const contentWrapper = e.target.closest('.content-wrapper');
        const isScrollingDown = e.deltaY > 0;

        // If not scrolling over content, or if the panel is off-screen,
        // just move the main canvas.
        if (!contentWrapper) {
            e.preventDefault();
            moveVertical(isScrollingDown ? 1 : -1);
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = contentWrapper;

        // Check if the content is actually taller than its container.
        const isContentScrollable = scrollHeight > clientHeight;

        // If the content is NOT scrollable, any scroll should move the panel.
        if (!isContentScrollable) {
            e.preventDefault();
            moveVertical(isScrollingDown ? 1 : -1);
            return;
        }

        // If the content IS scrollable, we check the boundaries.
        if (isScrollingDown) {
            // Check if we are at the very bottom (with a 1px tolerance).
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
            if (isAtBottom) {
                // If at the bottom, move the panel.
                e.preventDefault();
                moveVertical(1);
            }
            // Otherwise, do nothing and let the browser scroll the content.
        } else { // Scrolling up
            const isAtTop = scrollTop === 0;
            if (isAtTop) {
                // If at the top, move the panel.
                e.preventDefault();
                moveVertical(-1);
            }
            // Otherwise, do nothing and let the browser scroll the content.
        }

    }, { passive: false }); // `passive: false` is required to use preventDefault().
}
function setupActionBtns() {
    document.getElementById('theme').addEventListener('click', function () {
        document.body.classList.toggle('light');
        // Toggle visibility of moon and sun icons based on theme
        const isLight = document.body.classList.contains('sun');
        document.getElementById('moon').classList.toggle('hide');
        document.getElementById('sun').classList.toggle('hide');;
    });
}

// Initialize the app
async function init() {
    try {
        // Pre-load data to show loading state if needed
        await createRandomPanel(0, 0);
        updateCanvasPosition();
        setupKeyboardControls();
        setupTouchControls();
        setupMouseControls();
        setupScrollControls();
        setupActionBtns();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

init();
