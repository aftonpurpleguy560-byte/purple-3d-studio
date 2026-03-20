/* Purple-3D-Studio Global Archive Edition 
    Author: Purpleguy © 2026 - tablet power
    Languages: TR, EN, ES, DE, FR, RU, JA, ZH, AR, PT, HI, IT, KO
*/

const translations = {
    "tr": { "topbar": "🟣 Purple Engine - V1.5", "save": "Kaydet", "delete": "Sil", "translate": "Sürükle", "rotate": "Döndür", "scale": "Ölçek" },
    "en": { "topbar": "🟣 Purple Engine - V1.5", "save": "Save", "delete": "Delete", "translate": "Translate", "rotate": "Rotate", "scale": "Scale" },
    "es": { "topbar": "🟣 Purple Engine - V1.5", "save": "Guardar", "delete": "Eliminar", "translate": "Mover", "rotate": "Rotar", "scale": "Escalar" },
    "de": { "topbar": "🟣 Purple Engine - V1.5", "save": "Speichern", "delete": "Löschen", "translate": "Verschieben", "rotate": "Drehen", "scale": "Skalieren" },
    "fr": { "topbar": "🟣 Purple Engine - V1.5", "save": "Sauvegarder", "delete": "Supprimer", "translate": "Déplacer", "rotate": "Pivoter", "scale": "Échelle" },
    "ru": { "topbar": "🟣 Purple Engine - V1.5", "save": "Сохранить", "delete": "Удалить", "translate": "Переместить", "rotate": "Вращать", "scale": "Масштаб" },
    "ja": { "topbar": "🟣 Purple Engine - V1.5", "save": "保存", "delete": "削除", "translate": "移動", "rotate": "回転", "scale": "スケール" },
    "zh": { "topbar": "🟣 Purple Engine - V1.5", "save": "保存", "delete": "删除", "translate": "移动", "rotate": "旋转", "scale": "缩放" },
    "ar": { "topbar": "🟣 Purple Engine - V1.5", "save": "حفظ", "delete": "حذف", "translate": "نقل", "rotate": "تدوير", "scale": "توسيع" },
    "pt": { "topbar": "🟣 Purple Engine - V1.5", "save": "Salvar", "delete": "Excluir", "translate": "Mover", "rotate": "Girar", "scale": "Escala" },
    "hi": { "topbar": "🟣 Purple Engine - V1.5", "save": "सहेजें", "delete": "हटाएं", "translate": "स्थानांतरित", "rotate": "घुमाएं", "scale": "पैमाना" },
    "it": { "topbar": "🟣 Purple Engine - V1.5", "save": "Salva", "delete": "Elimina", "translate": "Sposta", "rotate": "Ruota", "scale": "Scala" },
    "ko": { "topbar": "🟣 Purple Engine - V1.5", "save": "저장", "delete": "삭제", "translate": "이동", "rotate": "회전", "scale": "크기 조절" }
};

export function getLanguage() {
    const lang = navigator.language.split('-')[0];
    return translations[lang] ? lang : "en";
}

export function translateUI() {
    const lang = getLanguage();
    const dict = translations[lang];
    const map = {
        'topbar': 'topbar', 'btn-save': 'save', 'btn-delete': 'delete',
        'btn-translate': 'translate', 'btn-rotate': 'rotate', 'btn-scale': 'scale'
    };
    for (let id in map) {
        const el = document.getElementById(id);
        if (el && dict[map[id]]) el.innerText = (id === 'btn-save') ? `${dict[map[id]]} 💾` : dict[map[id]];
    }
    return dict;
}
