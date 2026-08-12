const themeNames = {

"basic": "⚪ Basic",

"neon-pink": "🩷 Pink",
"neon-blue": "💙 Blue",
"neon-purple": "💜 Purple",
"neon-green": "💚 Green",
"neon-orange": "🧡 Orange",

"love": "💕 恋愛",
"space": "🌌 宇宙",
"dreamy-star": "🌌 ゆめかわ星空"

};

/* =========================
テーマ変更
========================= */

function setTheme(theme){

/* 現在のテーマを削除 */

document.body.className =
    document.body.className
    .replace(/theme-[^\s]+/g, '');


/* 新しいテーマを追加 */

document.body.classList.add(
    'theme-' + theme
);


/* 保存 */

localStorage.setItem(
    'theme',
    theme
);


/* 表示更新 */

updateThemeText(theme);

}

/* =========================
現在のテーマ表示
========================= */

function updateThemeText(theme){

const area =
    document.getElementById(
        "currentTheme"
    );


if(!area){
    return;
}


area.textContent =
    "現在：" +
    (
        themeNames[theme]
        || theme
    );

}

/* =========================
テーマ読み込み
========================= */

function loadTheme(){

let theme =
    localStorage.getItem('theme');


/* =========================
   初期テーマ
   → Basic（白）
========================= */

if(!theme){

    theme = "basic";

    localStorage.setItem(
        'theme',
        theme
    );

}


/* =========================
   既存テーマを削除
========================= */

document.body.className =
    document.body.className
    .replace(/theme-[^\s]+/g, '');


/* =========================
   テーマ適用
========================= */

document.body.classList.add(
    'theme-' + theme
);


/* =========================
   現在表示
========================= */

updateThemeText(theme);

}

/* =========================
設定画面が後から表示された時
========================= */

function refreshCurrentTheme(){

const theme =
    localStorage.getItem('theme')
    || "basic";


updateThemeText(theme);

}

/* =========================
起動
========================= */

document.addEventListener(
'DOMContentLoaded',
loadTheme
);