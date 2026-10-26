/* =========================================================
💗 推しプロフィール機能
oshi-details-2.js

・既存の写真機能には手を加えない
・プロフィール情報の表示を担当
・既存データを削除・初期化しない
========================================================= */

/* =========================================================
💗 プロフィール表示
========================================================= */


/* =========================================================
💗 プロフィール表示
・登録された日付から経過日数を自動計算
・日付未登録の場合は「未登録」と表示
・既存の保存データ、写真機能には手を加えない
========================================================= */

function renderOshiProfile2(oshiId) {

    if (!oshiId) {
        return;
    }

    const data = db.load();

    const oshi = (data.oshiList || []).find(
        item => String(item.id) === String(oshiId)
    );

    if (!oshi) {
        return;
    }

    const detail =
        data.oshiDetails?.[oshiId] || {};

    const profile =
        detail.profile || {};


    /* =====================
       通常の文字表示
    ===================== */

    const setText = (
        elementId,
        value,
        fallback = "未登録"
    ) => {

        const element =
            document.getElementById(elementId);

        if (!element) {
            return;
        }

        element.textContent =
            value == null || String(value).trim() === ""
                ? fallback
                : String(value);
    };


    /* =====================
       日付と経過日数の表示
    ===================== */

    const setDateAndDays = (
        elementId,
        dateValue,
        description
    ) => {

        const element =
            document.getElementById(elementId);

        if (!element) {
            return;
        }

        if (!dateValue) {
            element.textContent = "未登録";
            return;
        }

        // YYYY-MM-DD 形式の日付だけを受け付ける
        const match =
            /^(\d{4})-(\d{2})-(\d{2})$/.exec(
                String(dateValue)
            );

        if (!match) {
            element.textContent = "未登録";
            return;
        }

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);

        const dateNumber =
            Date.UTC(year, month - 1, day);

        const checkedDate =
            new Date(dateNumber);

        // 実在する日付か確認
        if (
            checkedDate.getUTCFullYear() !== year ||
            checkedDate.getUTCMonth() !== month - 1 ||
            checkedDate.getUTCDate() !== day
        ) {
            element.textContent = "未登録";
            return;
        }

        // 今日の日付をローカル時間で取得
        const today = new Date();

        const todayNumber = Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        const difference =
            Math.floor(
                (todayNumber - dateNumber) /
                86400000
            );

        // 日付を日本語形式で表示
        const formattedDate =
            `${year}年${month}月${day}日`;

        if (difference < 0) {

            element.textContent =
                `${formattedDate}（あと${Math.abs(difference)}日）`;

            return;
        }

        // 登録日当日を「1日目」とする
        const elapsedDays = difference + 1;

        element.textContent =
            `${formattedDate}（${description}${elapsedDays}日目）`;
    };


    /* =====================
       プロフィール情報
    ===================== */

    setText("oshiHomeName", oshi.name, "—");

    setText("oshiHomeGenre", oshi.genre, "—");

    setDateAndDays(
        "oshiHomeBirthday",
        profile.birthday,
        "生まれて"
    );

    setDateAndDays(
        "oshiHomeStartDate",
        profile.activityStartDate,
        "推し始めて"
    );

    setDateAndDays(
        "oshiHomeFormationDate",
        profile.formationDate,
        "結成・デビューから"
    );

    setText(
        "oshiHomeMessage",
        profile.favoritePoints,
        "好きなところも、心に残った瞬間も。ここに少しずつ集めていこう。"
    );

}







/* =====================================================
   💗 推しプロフィール編集
===================================================== */

function openOshiProfileEditor() {

    const container =
        document.getElementById("oshiContainer");

    const oshiId =
        container?.dataset.oshiId;

    if (!oshiId) return;

    const data = db.load();

    const detail =
        data.oshiDetails?.[oshiId] || {};

    const profile =
        detail.profile || {};

    const view =
        document.getElementById("oshiProfileView");

    const editor =
        document.getElementById("oshiProfileEditor");

    if (!view || !editor) return;

    document.getElementById(
        "oshiProfileFavoritePoints"
    ).value = profile.favoritePoints || "";

    document.getElementById(
        "oshiProfileBirthday"
    ).value = profile.birthday || "";

    document.getElementById(
        "oshiProfileStartDate"
    ).value = profile.activityStartDate || "";

    document.getElementById(
        "oshiProfileFormationDate"
    ).value = profile.formationDate || "";

    view.hidden = true;
    editor.hidden = false;
}


/* =====================
   保存
===================== */

function saveOshiProfile() {

    const container =
        document.getElementById("oshiContainer");

    const oshiId =
        container?.dataset.oshiId;

    if (!oshiId) return;

    const data = db.load();

    if (!data.oshiDetails) {
        data.oshiDetails = {};
    }

    if (!data.oshiDetails[oshiId]) {
        data.oshiDetails[oshiId] = {};
    }

    const detail =
        data.oshiDetails[oshiId];

    if (!detail.profile) {
        detail.profile = {};
    }

    detail.profile.favoritePoints =
        document.getElementById(
            "oshiProfileFavoritePoints"
        ).value;

    detail.profile.birthday =
        document.getElementById(
            "oshiProfileBirthday"
        ).value;

    detail.profile.activityStartDate =
        document.getElementById(
            "oshiProfileStartDate"
        ).value;

    detail.profile.formationDate =
        document.getElementById(
            "oshiProfileFormationDate"
        ).value;

    db.save(data);

    renderOshiProfile2(oshiId);

    document.getElementById(
        "oshiProfileEditor"
    ).hidden = true;

    document.getElementById(
        "oshiProfileView"
    ).hidden = false;
}


/* =====================
   キャンセル
===================== */

function cancelOshiProfileEdit() {

    const view =
        document.getElementById("oshiProfileView");

    const editor =
        document.getElementById("oshiProfileEditor");

    if (!view || !editor) return;

    editor.hidden = true;
    view.hidden = false;

}



