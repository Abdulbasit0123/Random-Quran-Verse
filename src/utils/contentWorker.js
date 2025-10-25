//there's an error while changing the language, fix it.
self.onmessage = async (event) => {
    const { type, language } = event.data;

    if (type === 'loadContent') {
        try {
            const [quranRes, tafseerRes] = await Promise.all([
                fetch('https://api.alquran.cloud/v1/quran/ar.sahih'),
                fetch(`https://api.alquran.cloud/v1/quran/${language}`)
            ]);

            if (!quranRes.ok || !tafseerRes.ok) {
                throw new Error('Failed to fetch data from API');
            }

            const quran = await quranRes.json();
            const tafseer = await tafseerRes.json();

            // Send back to main thread
            self.postMessage({ status: 'success', type: 'loadContent', quran, tafseer });
        } catch (error) {
            self.postMessage({ status: 'error', message: error.message });
        }
    }
    if (type === 'loadNewTafseer') {
        try {
            const tafseerRes = await fetch(`https://api.alquran.cloud/v1/quran/${language}`);
            if (!tafseerRes.ok) throw new Error('Failed to fetch data from API');
            
            const tafseer = await tafseerRes.json();

            // Send back to main thread
            self.postMessage({ status: 'success', type: 'loadNewTafseer', tafseer });
        } catch (error) {
            self.postMessage({ status: 'error', message: error.message });
        }
    }
};
