/* =====================
   ⭐ ホームお気に入り写真設定
===================== */


/* =====================
   設定読み込み
===================== */

function loadFavoritePhotoSettings(){

    const data = db.load();

    if(!data.settings){
        data.settings = {};
    }

    if(!data.settings.favoritePhoto){

        data.settings.favoritePhoto = {
            count: 3,
            fade: true,
            interval: 7000
        };

        db.save(data);
    }

    const settings =
        data.settings.favoritePhoto;


    /* =====================
       表示枚数
    ===================== */

    const countSelect =
        document.getElementById(
            "favoritePhotoCount"
        );

    if(countSelect){

        countSelect.value =
            String(
                settings.count ?? 3
            );

    }


    /* =====================
       フェイド
    ===================== */

    const fadeBtn =
        document.getElementById(
            "favoritePhotoFadeBtn"
        );

    if(fadeBtn){

        const enabled =
            settings.fade !== false;

        fadeBtn.textContent =
            enabled
            ? "🟢 ON"
            : "⚪ OFF";

        fadeBtn.classList.toggle(
            "off",
            !enabled
        );

    }


    /* =====================
       表示時間
    ===================== */

    const intervalSelect =
        document.getElementById(
            "favoritePhotoInterval"
        );

    if(intervalSelect){

        intervalSelect.value =
            String(
                settings.interval ?? 7000
            );

    }

}


/* =====================
   表示枚数変更
===================== */

function changeFavoritePhotoCount(){

    const select =
        document.getElementById(
            "favoritePhotoCount"
        );

    if(!select){
        return;
    }


    const data = db.load();

    if(!data.settings){
        data.settings = {};
    }

    if(!data.settings.favoritePhoto){
        data.settings.favoritePhoto = {};
    }


    data.settings.favoritePhoto.count =
        select.value === "all"
        ? "all"
        : Number(select.value);


    db.save(data);


    /* ホーム表示を更新 */
    displayFavoritePhotoCard();

}


/* =====================
   フェイド ON / OFF
===================== */

function toggleFavoritePhotoFade(){

    const data = db.load();

    if(!data.settings){
        data.settings = {};
    }

    if(!data.settings.favoritePhoto){
        data.settings.favoritePhoto = {};
    }


    const current =
        data.settings.favoritePhoto.fade !== false;


    data.settings.favoritePhoto.fade =
        !current;


    db.save(data);


    const btn =
        document.getElementById(
            "favoritePhotoFadeBtn"
        );


    if(btn){

        const enabled =
            data.settings.favoritePhoto.fade;

        btn.textContent =
            enabled
            ? "🟢 ON"
            : "⚪ OFF";

        btn.classList.toggle(
            "off",
            !enabled
        );

    }


    /* ホーム表示を更新 */
    displayFavoritePhotoCard();

}


/* =====================
   表示時間変更
===================== */

function changeFavoritePhotoInterval(){

    const select =
        document.getElementById(
            "favoritePhotoInterval"
        );

    if(!select){
        return;
    }


    const data = db.load();

    if(!data.settings){
        data.settings = {};
    }

    if(!data.settings.favoritePhoto){
        data.settings.favoritePhoto = {};
    }


    data.settings.favoritePhoto.interval =
        Number(select.value);


    db.save(data);


    /* ホーム表示を更新 */
    displayFavoritePhotoCard();

}


/* =====================
   設定画面イベント登録
===================== */

function initFavoritePhotoSettings(){

    const countSelect =
        document.getElementById(
            "favoritePhotoCount"
        );

    if(countSelect){

        countSelect.addEventListener(
            "change",
            changeFavoritePhotoCount
        );

    }


    const intervalSelect =
        document.getElementById(
            "favoritePhotoInterval"
        );

    if(intervalSelect){

        intervalSelect.addEventListener(
            "change",
            changeFavoritePhotoInterval
        );

    }


    loadFavoritePhotoSettings();

}





/* =====================
   📖 アプリタイトル
===================== */

function loadAppTitle(){

    const data = db.load();

    const title =
        data.settings?.appTitle ||
        "推し活日記";

    const titleElement =
        document.getElementById("app-title");

    if(titleElement){

        titleElement.textContent =
            title;

        titleElement.style.visibility = 
            "visible";

    }

    const input =
        document.getElementById(
            "appTitleInput"
        );

    if(input){

        input.value =
            title;

    }

}


/* =====================
   📖 アプリタイトル保存
===================== */

function saveAppTitle(){

    const input =
        document.getElementById(
            "appTitleInput"
        );

    if(!input){
        return;
    }

    const title =
        input.value.trim();

    const finalTitle =
        title || "推し活日記";

    const data =
        db.load();

    if(!data.settings){

        data.settings = {};

    }

    data.settings.appTitle =
        finalTitle;

    db.save(data);


    /* =====================
       画面上のタイトル更新
    ===================== */

    const titleElement =
        document.getElementById(
            "app-title"
        );

    if(titleElement){

        titleElement.textContent =
            finalTitle;

    }

}


/* =====================
   📖 アプリタイトル初期化
===================== */

function initAppTitle(){

    loadAppTitle();

}



/* =====================================================
   🎨 ページ別背景設定
   ・5ページを個別に設定
   ・5ページへの一括設定
   ・アプリ内データベースへ保存
===================================================== */

const PAGE_BACKGROUND_CLASSES = [
    "available-bg-pastel",
    "available-bg-starry",
    "available-bg-botanical",
    "available-bg-peach",
    "available-bg-aurora"
];

const PAGE_BACKGROUND_SELECTORS = {
    home: "bg-home",
    plannerPage: "bg-planner",
    calendarPage: "bg-calendar",
    oshiPage: "bg-oshi",
    moneyPage: "bg-money"
};

const PAGE_BACKGROUND_NAMES = {
    none: "現在のテーマ背景",
    pastel: "ゆめかわパステル",
    starry: "星空ファンタジー",
    botanical: "ボタニカル",
    peach: "ピーチロマンス",
    aurora: "オーロラ"
};


/* =====================================================
   背景設定データを取得
===================================================== */

async function getPageBackgroundSettings() {

    const data = await db.load();

    if (!data.settings) {
        data.settings = {};
    }

    if (!data.settings.pageBackgrounds) {
        data.settings.pageBackgrounds = {};
    }

    return {
        data,
        backgrounds: data.settings.pageBackgrounds
    };
}


/* =====================================================
   指定ページに背景を反映
===================================================== */

function applyPageBackgroundToElement(pageId, background) {

    const page = document.getElementById(pageId);

    if (!page) return;

    page.classList.remove(...PAGE_BACKGROUND_CLASSES);

    if (
        background &&
        background !== "none" &&
        PAGE_BACKGROUND_CLASSES.includes(
            "available-bg-" + background
        )
    ) {
        page.classList.add("available-bg-" + background);
    }
}


/* =====================================================
   保存済み背景を5ページに反映
===================================================== */

async function loadPageBackgroundSettings() {

    try {

        const { backgrounds } =
            await getPageBackgroundSettings();

        Object.keys(PAGE_BACKGROUND_SELECTORS).forEach(pageId => {

            const background = backgrounds[pageId] || "none";

            applyPageBackgroundToElement(
                pageId,
                background
            );

            const select = document.getElementById(
                PAGE_BACKGROUND_SELECTORS[pageId]
            );

            if (select) {
                select.value = background;
            }
        });

        const allSelect =
            document.getElementById("bg-all");

        if (allSelect) {
            allSelect.value = "";
        }

    } catch (error) {

        console.error(
            "ページ別背景設定の読み込みに失敗しました",
            error
        );

    }
}


/* =====================================================
   個別ページの背景を変更・保存
===================================================== */

async function changePageBackground(pageId, background) {

    if (!PAGE_BACKGROUND_SELECTORS[pageId]) return;

    try {

        const { data, backgrounds } =
            await getPageBackgroundSettings();

        backgrounds[pageId] = background;

        data.settings.pageBackgrounds = backgrounds;

        await db.save(data);

        applyPageBackgroundToElement(
            pageId,
            background
        );

        const message = document.getElementById(
            "pageBackgroundMessage"
        );

        if (message) {

            const pageNames = {
                home: "ホーム",
                plannerPage: "1日手帳",
                calendarPage: "カレンダー",
                oshiPage: "推し",
                moneyPage: "お金"
            };

            message.textContent =
                pageNames[pageId] + "の背景を「" +
                (PAGE_BACKGROUND_NAMES[background] || "現在のテーマ背景") +
                "」に設定しました。";
        }

    } catch (error) {

        console.error(
            "ページ別背景設定の保存に失敗しました",
            error
        );

        alert("背景設定を保存できませんでした。もう一度お試しください。");
    }
}


/* =====================================================
   5ページに一括設定
===================================================== */

async function applyAllPageBackgrounds() {

    const select = document.getElementById("bg-all");

    if (!select) return;

    const background = select.value;

    if (!PAGE_BACKGROUND_NAMES.hasOwnProperty(background)) {
        alert("適用する背景を選択してください。");
        return;
    }

    try {

        const { data, backgrounds } =
            await getPageBackgroundSettings();

        Object.keys(PAGE_BACKGROUND_SELECTORS).forEach(pageId => {

            backgrounds[pageId] = background;

            applyPageBackgroundToElement(
                pageId,
                background
            );

            const pageSelect = document.getElementById(
                PAGE_BACKGROUND_SELECTORS[pageId]
            );

            if (pageSelect) {
                pageSelect.value = background;
            }
        });

        data.settings.pageBackgrounds = backgrounds;

        await db.save(data);

        const message = document.getElementById(
            "pageBackgroundMessage"
        );

        if (message) {
            message.textContent =
                "5ページすべてを「" +
                PAGE_BACKGROUND_NAMES[background] +
                "」に設定しました。";
        }

    } catch (error) {

        console.error(
            "背景の一括設定に失敗しました",
            error
        );

        alert("背景設定を保存できませんでした。もう一度お試しください。");
    }
}
