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

const setText = (elementId, value, fallback = "未登録") => {

    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent =
        value == null || String(value).trim() === ""
            ? fallback
            : String(value);

};

setText("oshiHomeName", oshi.name, "—");
setText("oshiHomeGenre", oshi.genre, "—");

setText("oshiHomeBirthday", profile.birthday);
setText("oshiHomeStartDate", profile.activityStartDate);
setText("oshiHomeFormationDate", profile.formationDate);

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



