import { searchInput, saveLanguageBtn, modalBackdrop, languageList, languageModal } from '../dom';
import { currentLanguage, updateLanguage } from '../utils/loadContent';
import { setAreEventsPaused } from '../events/controls';
import { hideModal } from '../utils/hideModal';

const languages = [["ku.asan", "Kurdish", "تەفسیری ئاسان", "rtl"], ["en.sahih", "English", "Saheeh International", "ltr"], ["en.pickthall", "English", "Pickthall", "ltr"], ["en.itani", "English", "Clear Qur'an - Talal Itani", "ltr"], ["en.yusufali", "English", "Yusuf Ali", "ltr"], ["en.hilali", "English", "Hilali & Khan", "ltr"], ["en.maududi", "English", "Maududi", "ltr"], ["en.asad", "English", "Asad", "ltr"], ["en.daryabadi", "English", "Daryabadi", "ltr"], ["en.arberry", "English", "Arberry", "ltr"], ["en.shakir", "English", "Shakir", "ltr"], ["en.ahmedraza", "English", "Ahmed Raza Khan", "ltr"], ["en.sarwar", "English", "Sarwar", "ltr"], ["en.ahmedali", "English", "Ahmed Ali", "ltr"], ["en.qaribullah", "English", "Qaribullah & Darwish", "ltr"], ["en.mubarakpuri", "English", "Mubarakpuri", "ltr"], ["en.qarai", "English", "Qarai", "ltr"], ["en.wahiduddin", "English", "Wahiduddin Khan", "ltr"], ["ar.qurtubi", "Arabic", "تفسير القرطبي", "rtl"], ["ar.baghawi", "Arabic", "تفسير البغوي", "rtl"], ["ar.jalalayn", "Arabic", "تفسير الجلالين", "rtl"], ["ar.muyassar", "Arabic", "تفسير المیسر", "rtl"], ["ar.waseet", "Arabic", "الـتـفـسـيـر الـوسـيـط", "rtl"], ["ar.miqbas", "Arabic", "تنوير المقباس من تفسير بن عباس", "rtl"], ["zh.jian", "Chinese", "Ma Jian", "ltr"], ["zh.majian", "Chinese", "Ma Jian (Traditional)", "ltr"], ["zh.mazhonggang", "Chinese", "Ma Zhong Gang", "ltr"], ["hi.farooq", "Hindi", "फ़ारूक़ ख़ान & अहमद", "ltr"], ["hi.hindi", "Hindi", "फ़ारूक़ ख़ान & नदवी", "ltr"], ["es.bornez", "Spanish", "Bornez", "ltr"], ["es.garcia", "Spanish", "Garcia", "ltr"], ["es.cortes", "Spanish", "Cortes", "ltr"], ["es.asad", "Spanish", "Asad", "ltr"], ["fr.hamidullah", "French", "Hamidullah", "ltr"], ["bn.bengali", "Bengali", "মুহিউদ্দীন খান", "ltr"], ["bn.hoque", "Bengali", "জহুরুল হক", "ltr"], ["pt.elhayek", "Portuguese", "El-Hayek", "ltr"], ["ru.kuliev", "Russian", "Кулиев", "ltr"], ["ru.osmanov", "Russian", "Османов", "ltr"], ["ru.porokhova", "Russian", "Порохова", "ltr"], ["ru.abuadel", "Russian", "Абу Адель", "ltr"], ["ru.krachkovsky", "Russian", "Крачковский", "ltr"], ["ru.muntahab", "Russian", "Аль-Мунтахаб", "ltr"], ["ru.sablukov", "Russian", "Саблуков", "ltr"], ["ru.kuliev-alsaadi", "Russian", "Кулиев + ас-Саади", "ltr"], ["id.muntakhab", "Indonesian", "Quraish Shihab", "ltr"], ["id.indonesian", "Indonesian", "Bahasa Indonesia", "ltr"], ["id.jalalayn", "Indonesian", "Tafsir Jalalayn", "ltr"], ["de.aburida", "German", "Abu Rida", "ltr"], ["de.bubenheim", "German", "Bubenheim & Elyas", "ltr"], ["de.khoury", "German", "Khoury", "ltr"], ["de.zaidan", "German", "Zaidan", "ltr"], ["ja.japanese", "Japanese", "Japanese", "ltr"], ["fa.ansarian", "Persian", "انصاریان", "rtl"], ["fa.bahrampour", "Persian", "بهرام پور", "rtl"], ["fa.khorramshahi", "Persian", "خرمشاهی", "rtl"], ["fa.mojtabavi", "Persian", "مجتبوی", "rtl"], ["fa.khorramdel", "Persian", "خرمدل", "rtl"], ["fa.moezzi", "Persian", "معزی", "rtl"], ["fa.ayati", "Persian", "آیتی", "rtl"], ["fa.fooladvand", "Persian", "فولادوند", "rtl"], ["fa.ghomshei", "Persian", "الهی قمشه‌ای", "rtl"], ["fa.makarem", "Persian", "مکارم شیرازی", "rtl"], ["fa.gharaati", "Persian", "قرائتی", "rtl"], ["fa.sadeqi", "Persian", "صادقی تهرانی", "rtl"], ["fa.safavi", "Persian", "صفوی", "rtl"], ["tr.ates", "Turkish", "Süleyman Ateş", "ltr"], ["tr.bulac", "Turkish", "Alİ Bulaç", "ltr"], ["tr.diyanet", "Turkish", "Diyanet İşleri", "ltr"], ["tr.golpinarli", "Turkish", "Abdulbakî Gölpınarlı", "ltr"], ["tr.ozturk", "Turkish", "Öztürk", "ltr"], ["tr.vakfi", "Turkish", "Diyanet Vakfı", "ltr"], ["tr.yazir", "Turkish", "Elmalılı Hamdi Yazır", "ltr"], ["tr.yildirim", "Turkish", "Suat Yıldırım", "ltr"], ["tr.yuksel", "Turkish", "Edip Yüksel", "ltr"], ["ur.ahmedali", "Urdu", "احمد علی", "rtl"], ["ur.jalandhry", "Urdu", "جالندہری", "rtl"], ["ur.jawadi", "Urdu", "علامہ جوادی", "rtl"], ["ur.kanzuliman", "Urdu", "احمد رضا خان", "rtl"], ["ur.qadri", "Urdu", "طاہر القادری", "rtl"], ["ur.junagarhi", "Urdu", "محمد جوناگڑھی", "rtl"], ["ur.maududi", "Urdu", "ابوالاعلی مودودی", "rtl"], ["ur.najafi", "Urdu", "محمد حسین نجفی", "rtl"], ["nl.keyzer", "Dutch", "Keyzer", "ltr"], ["nl.leemhuis", "Dutch", "Leemhuis", "ltr"], ["nl.siregar", "Dutch", "Siregar", "ltr"], ["sq.ahmeti", "Albanian", "Sherif Ahmeti", "ltr"], ["sq.mehdiu", "Albanian", "Feti Mehdiu", "ltr"], ["sq.nahi", "Albanian", "Efendi Nahi", "ltr"], ["cs.hrbek", "Czech", "Hrbek", "ltr"], ["cs.nykl", "Czech", "Nykl", "ltr"], ["az.mammadaliyev", "Azerbaijani", "Məmmədəliyev & Bünyadov", "ltr"], ["az.musayev", "Azerbaijani", "Musayev", "ltr"], ["dv.divehi", "Divehi", "ދިވެހި", "rtl"], ["ha.gumi", "Hausa", "Gumi", "ltr"], ["it.piccardo", "Italian", "Piccardo", "ltr"], ["ko.korean", "Korean", "Korean", "ltr"], ["no.berg", "Norwegian", "Einar Berg", "ltr"], ["pl.bielawskiego", "Polish", "Bielawskiego", "ltr"], ["ro.grigore", "Romanian", "Grigore", "ltr"], ["sd.amroti", "Sindhi", "امروٽي", "rtl"], ["so.abduh", "Somali", "Abduh", "ltr"], ["sv.bernstrom", "Swedish", "Bernström", "ltr"], ["sw.barwani", "Swahili", "Al-Barwani", "ltr"], ["ta.tamil", "Tamil", "ஜான் டிரஸ்ட்", "ltr"], ["tg.ayati", "Tajik", "Оятӣ", "ltr"], ["th.thai", "Thai", "ภาษาไทย", "ltr"], ["uz.sodik", "Uzbek", "Мухаммад Содик", "ltr"], ["tt.nugman", "Tatar", "Yakub Ibn Nugman", "ltr"], ["ug.saleh", "Uyghur", "محمد صالح", "rtl"], ["bg.theophanov", "Bulgarian", "Теофанов", "ltr"], ["bs.mlivo", "Bosnian", "Mlivo", "ltr"], ["ms.basmeih", "Malay", "Basmeih", "ltr"], ["bs.korkut", "Bosnian", "Korkut", "ltr"], ["si.naseemismail", "Sinhala", "Naseem Ismail", "ltr"], ["ba.mehanovic", "Bashkir", "Kur'an - sa prevodom (značenja) na bosanski jezik,utemeljen na Ibn Kesirovom tumačenju,i kratki komentar", "ltr"], ["my.ghazi", "Burmese", "Ghazi Muhammed Hashim", "ltr"], ["am.sadiq", "Amharic", "ሳዲቅ & ሳኒ ሐቢብ", "ltr"], ["ber.mensur", "Berber", "At Mensur", "ltr"], ["ml.karakunnu", "Malayalam", "കാരകുന്ന് & എളയാവൂര്", "ltr"], ["ml.abdulhameed", "Malayalam", "അബ്ദുല്‍ ഹമീദ് & പറപ്പൂര്‍", "ltr"], ["ps.abdulwali", "Pashto", "عبدالولي", "rtl"], ["ce.magomedov", "Chechen", "Chechen by Magomedov", "ltr"]];
export let currentDirection = 'ltr';
let isListCreatedBefore = false;

export function toggleLanguageModal() {
    modalBackdrop.classList.remove('hide');
    languageModal.classList.remove('hide');
    setAreEventsPaused(true);

    if (isListCreatedBefore) {
        document.querySelector('input[name="language"]:checked').scrollIntoView({ behavior: 'instant', block: 'center', container: 'nearest', inline: 'center' });
        return;
    }
    languages.forEach(lang => {
        const li = document.createElement('li');
        const input = document.createElement('input');
        const label = document.createElement('label');
        const span = document.createElement('span');
        const italic = document.createElement('i');

        li.classList.add('list-item');
        input.type = 'radio';
        input.id = `${lang[0]}`;
        input.value = `${lang[0]}`;
        input.name = 'language';
        input.setAttribute('data-direction', `${lang[3]}`);

        span.append(document.createTextNode(`${lang[1]}`));
        italic.append(document.createTextNode(` – ${lang[2]}`));

        label.setAttribute('for', `${lang[0]}`);
        label.classList.add('item-label');
        label.append(span, italic);

        li.append(input, label);
        languageList.append(li);
    });
    isListCreatedBefore = true;
    if (localStorage.getItem('isNoneChecked') === 'true') document.getElementById('none').checked = true;
    else document.getElementById(currentLanguage).checked = true;
    document.getElementById(currentLanguage).scrollIntoView({ behavior: 'instant', block: 'center', container: 'nearest', inline: 'center' });
}
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const items = languageList.querySelectorAll('li');

    items.forEach(item => {
        const text = item.querySelector('label').textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

saveLanguageBtn.addEventListener('click', () => {
    const selectedRadio = document.querySelector('input[name="language"]:checked');
    if (selectedRadio) {
        const selectedLanguage = selectedRadio.value;
        currentDirection = selectedRadio.dataset.direction;

        hideModal();
        updateLanguage(selectedLanguage);
    }
});

