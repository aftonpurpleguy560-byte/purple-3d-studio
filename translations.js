/* Purple-3D-Studio Localization Engine */

const translations = {
    "tr": {
        "topbar": "🟣 Purple Engine - V1.5 | Stüdyo Modu",
        "explorer": "Gezgin",
        "project": "Proje",
        "hierarchy": "Hiyerarşi",
        "inspector": "Özellikler",
        "save": "Kaydet",
        "delete": "Sil",
        "translate": "Sürükle",
        "rotate": "Döndür",
        "scale": "Ölçek",
        "console": "Konsol",
        "unsaved_changes": "Yaptığınız değişiklikler kaydedilmedi. Çıkmak istediğinizden emin misiniz?"
    },
    "en": {
        "topbar": "🟣 Purple Engine - V1.5 | Studio Mode",
        "explorer": "Explorer",
        "project": "Project",
        "hierarchy": "Hierarchy",
        "inspector": "Inspector",
        "save": "Save",
        "delete": "Delete",
        "translate": "Translate",
        "rotate": "Rotate",
        "scale": "Scale",
        "console": "Console",
        "unsaved_changes": "Changes you made may not be saved. Are you sure you want to leave?"
    },
    "de": {
        "topbar": "🟣 Purple Engine - V1.5 | Studio-Modus",
        "explorer": "Explorer",
        "project": "Projekt",
        "hierarchy": "Hierarchie",
        "inspector": "Inspektor",
        "save": "Speichern",
        "delete": "Löschen",
        "translate": "Verschieben",
        "rotate": "Drehen",
        "scale": "Skalieren",
        "console": "Konsole",
        "unsaved_changes": "Änderungen werden eventuell nicht gespeichert. Möchten Sie wirklich gehen?"
    }
};

export function getLanguage() {
    const lang = navigator.language.split('-')[0]; // tr-TR -> tr
    return translations[lang] ? lang : "en"; // Dil yoksa İngilizce default
}

export function translateUI() {
    const lang = getLanguage();
    const dict = translations[lang];
    
    // UI elemanlarını ID üzerinden güncelle (Örnek)
    if(document.getElementById('topbar')) document.getElementById('topbar').innerText = dict.topbar;
    if(document.getElementById('tab-hierarchy')) document.getElementById('tab-hierarchy').innerText = dict.explorer;
    // ... Bu mantıkla tüm butonlar taranır
    return dict;
}

