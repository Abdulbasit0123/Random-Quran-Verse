async function loadRandomQuranVerse() {
    const verseId = Math.floor(Math.random() * 6236) + 1;
    const urlArabic = `https://api.alquran.cloud/v1/ayah/${verseId}/ar.sahih`;
    const urlTafseer = `https://api.alquran.cloud/v1/ayah/${verseId}/ku.asan`;

    try {
        const [tafseerRes, arabicRes] = await Promise.all([
            fetch(urlTafseer),
            fetch(urlArabic)
        ]);

        const tafseerData = await tafseerRes.json();
        const arabicData = await arabicRes.json();

        if (tafseerData.status === "OK" && arabicData.status === "OK") {
            const arabicText = arabicData.data.text;
            const tafseerText = tafseerData.data.text;
            const surahName = tafseerData.data.surah.name.replace('سُورَةُ ', '') || 'Unknown';
            const surahNumber = tafseerData.data.surah.number;
            const ayahNumber = tafseerData.data.numberInSurah;
            const tarteelUrl = `https://tarteel.ai/ayah/${surahNumber}/${ayahNumber}`;

            document.getElementById("quran").textContent = arabicText || '—';
            document.getElementById("tafseer").textContent = tafseerText || '—';
            const sourceEl = document.getElementById("source");
            sourceEl.textContent = `${ayahNumber} - ${surahName}`;
            sourceEl.onclick = () => window.open(tarteelUrl, "_blank");
        } else {
            document.getElementById("tafseer").textContent = "Error fetching verse";
        }
    } catch (err) {
        console.error("Fetch error:", err);
        document.getElementById("tafseer").textContent = "Connection error";
    }
}

loadRandomQuranVerse();
