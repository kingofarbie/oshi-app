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