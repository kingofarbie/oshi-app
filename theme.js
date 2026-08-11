const themeNames = {

    "neon-pink":"🩷 Pink",
    "neon-blue":"💙 Blue",
    "neon-purple":"💜 Purple",
    "neon-green":"💚 Green",
    "neon-orange":"🧡 Orange",
    "love":"💕 恋愛",
    "space":"🌌 宇宙",
    // 🌌 新しい背景テーマ
    "dreamy-star":"🌌 ゆめかわ星空"

};



function setTheme(theme){

    document.body.className =
        document.body.className
        .replace(/theme-[^\s]+/g,'');


    document.body.classList.add(
        'theme-' + theme
    );


    localStorage.setItem(
        'theme',
        theme
    );


    updateThemeText(theme);

}



function updateThemeText(theme){

    const area =
        document.getElementById(
            "currentTheme"
        );


    if(!area)
        return;


    area.innerHTML =
        "現在：" +
        (themeNames[theme] || theme);

}



function loadTheme(){

    const theme =
        localStorage.getItem('theme');


    const current =
        theme || "basic";


    document.body.classList.add(
        'theme-' + current
    );


    updateThemeText(current);

}



document.addEventListener(
    'DOMContentLoaded',
    loadTheme
);