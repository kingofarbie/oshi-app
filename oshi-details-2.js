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



/* =====================================================
   🔗 推し公式リンク・SNS管理
===================================================== */


/* =========================
   サービス一覧
========================= */

const OSHI_HOME_LINK_SERVICES = [

    "X",
    "Instagram",
    "TikTok",
    "YouTube",
    "Facebook",
    "Weverse",
    "Weibo",
    "その他"

];


/* =========================
   現在の編集データ
========================= */

let oshiHomeLinksDraft = [];


/* =========================
   リンク編集画面を開く
========================= */

function openOshiHomeLinksEditor() {

    const container =
        document.getElementById("oshiContainer");

    const oshiId =
        container?.dataset.oshiId;

    if (!oshiId) return;

    const data = db.load();

    const detail =
        data.oshiDetails?.[oshiId] || {};

    oshiHomeLinksDraft =
        Array.isArray(detail.links)
            ? detail.links.map(link => ({
                ...link
            }))
            : [];

    renderOshiHomeLinksEditor();

    document.getElementById(
        "oshiHomeLinksList"
    ).hidden = true;

    document.getElementById(
        "oshiHomeLinksEditButton"
    ).hidden = true;

    document.getElementById(
        "oshiHomeLinksEditor"
    ).hidden = false;
}


/* =========================
   編集欄の表示
========================= */


function renderOshiHomeLinksEditor() {

    const list =
        document.getElementById(
            "oshiHomeLinksEditList"
        );

    if (!list) return;

    list.innerHTML = "";

    oshiHomeLinksDraft.forEach(
        (link, index) => {

            const item =
                document.createElement("div");

            item.className =
                "oshi-home-link-edit-item";


            /* =========================
               サービス選択
            ========================= */

            const select =
                document.createElement("select");

            OSHI_HOME_LINK_SERVICES.forEach(
                service => {

                    const option =
                        document.createElement("option");

                    option.value = service;
                    option.textContent = service;

                    select.appendChild(option);

                }
            );

            select.value =
                OSHI_HOME_LINK_SERVICES.includes(
                    link.service
                )
                    ? link.service
                    : "その他";


            /* =========================
               その他のサイト名
            ========================= */

            const nameInput =
                document.createElement("input");

            nameInput.type = "text";
            nameInput.placeholder = "サイト名";

            nameInput.value =
                link.service === "その他"
                    ? link.name || ""
                    : link.service || "";

            nameInput.hidden =
                select.value !== "その他";


            /* =========================
               URL
            ========================= */

            const urlInput =
                document.createElement("input");

            urlInput.type = "url";

            urlInput.placeholder =
                "https://example.com";

            urlInput.value =
                link.url || "";


            /* =========================
               ひと言
            ========================= */

            const descriptionInput =
                document.createElement("input");

            descriptionInput.type = "text";

            descriptionInput.placeholder =
                "公式・個人など（5文字以内）";

            descriptionInput.maxLength = 5;

            descriptionInput.value =
                link.description || "";


            /* =========================
               サービス変更
            ========================= */

            select.addEventListener(
                "change",
                () => {

                    nameInput.hidden =
                        select.value !== "その他";

                    if (
                        select.value !== "その他"
                    ) {

                        nameInput.value =
                            select.value;

                    }

                    oshiHomeLinksDraft[index].service =
                        select.value;

                    oshiHomeLinksDraft[index].name =
                        nameInput.value;

                }
            );


            /* =========================
               サイト名変更
            ========================= */

            nameInput.addEventListener(
                "input",
                () => {

                    oshiHomeLinksDraft[index].name =
                        nameInput.value;

                }
            );


            /* =========================
               URL変更
            ========================= */

            urlInput.addEventListener(
                "input",
                () => {

                    oshiHomeLinksDraft[index].url =
                        urlInput.value;

                }
            );


            /* =========================
               ひと言変更
            ========================= */

            descriptionInput.addEventListener(
                "input",
                () => {

                    oshiHomeLinksDraft[index].description =
                        descriptionInput.value;

                }
            );


            /* =========================
               削除
            ========================= */

            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";

            deleteButton.textContent =
                "🗑️ 削除";

            deleteButton.addEventListener(
                "click",
                () => {

                    oshiHomeLinksDraft.splice(
                        index,
                        1
                    );

                    renderOshiHomeLinksEditor();

                }
            );


            /* =========================
               編集欄に追加
            ========================= */

            item.appendChild(select);
            item.appendChild(nameInput);
            item.appendChild(urlInput);
            item.appendChild(descriptionInput);
            item.appendChild(deleteButton);

            list.appendChild(item);

        }
    );

}


/* =========================
   リンクを追加
========================= */

function addOshiHomeLink() {

    oshiHomeLinksDraft.push({

        service: "X",
        name: "X",
        url: ""

    });

    renderOshiHomeLinksEditor();

}


/* =========================
   リンクを保存
========================= */

function saveOshiHomeLinks() {

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

    const links =
        oshiHomeLinksDraft
        .map(link => ({

            service: link.service,

            name: link.name,

            url: link.url.trim(),

            description:
                (link.description || "")
                .trim()
                .slice(0, 5)

        }))
        .filter(link => link.url);

    data.oshiDetails[oshiId].links =
        links;

    db.save(data);

    renderOshiHomeLinks(oshiId);

    document.getElementById(
        "oshiHomeLinksEditor"
    ).hidden = true;

    document.getElementById(
        "oshiHomeLinksList"
    ).hidden = false;

    document.getElementById(
        "oshiHomeLinksEditButton"
    ).hidden = false;

}


/* =========================
   編集キャンセル
========================= */

function cancelOshiHomeLinksEdit() {

    const container =
        document.getElementById("oshiContainer");

    const oshiId =
        container?.dataset.oshiId;

    if (!oshiId) return;

    document.getElementById(
        "oshiHomeLinksEditor"
    ).hidden = true;

    document.getElementById(
        "oshiHomeLinksList"
    ).hidden = false;

    document.getElementById(
        "oshiHomeLinksEditButton"
    ).hidden = false;

    renderOshiHomeLinks(oshiId);

}


/* =========================
   登録リンクの表示
========================= */


function renderOshiHomeLinks(oshiId) {

    const list =
        document.getElementById(
            "oshiHomeLinksList"
        );

    if (!list) return;

    const data = db.load();

    const links =
        data.oshiDetails?.[oshiId]?.links || [];

    list.innerHTML = "";

    if (!links.length) {

        const empty =
            document.createElement("span");

        empty.className =
            "oshi-home-links-empty";

        empty.textContent =
            "公式サイトやSNSを登録してみよう♡";

        list.appendChild(empty);

        return;

    }

    /* =========================
       サービスアイコン
    ========================= */

    const serviceIcons = {

        "X": "𝕏",
        "Instagram": "◎",
        "TikTok": "♪",
        "YouTube": "▶",
        "Facebook": "f",
        "Weverse": "♡",
        "Weibo": "◉",
        "その他": "✦"

    };

    /* =========================
       リンクタイル
    ========================= */

    links.forEach(link => {

        const card =
            document.createElement("div");

        card.className =
            "oshi-home-link-card";

        /* 正方形ボタン */

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "oshi-home-link-button";

        /* アイコン */

        const icon =
            document.createElement("span");

        icon.className =
            "oshi-home-link-icon";

        icon.textContent =
            serviceIcons[link.service] || "✦";

        /* 🌸 ゆめかわカラーを直接指定 */

        icon.style.setProperty(
            "color",
            "#C49BCB",
            "important"
        );

        icon.style.setProperty(
            "background-color",
            "#FFFCFF",
            "important"
        );

        /* サービス名 */

        const name =
            document.createElement("span");

        name.className =
            "oshi-home-link-name";

        name.textContent =
            link.name || link.service || "サイト";

        button.appendChild(icon);
        button.appendChild(name);

        /* リンク先を開く */

        button.addEventListener(
            "click",
            () => {

                let url;

                try {

                    url = new URL(link.url);

                } catch {

                    return;

                }

                if (
                    url.protocol !== "https:" &&
                    url.protocol !== "http:"
                ) return;

                window.open(
                    url.href,
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

        /* ひと言 */

        const description =
            document.createElement("span");

        description.className =
            "oshi-home-link-description";

        description.textContent =
            link.description || "\u00A0";

        card.appendChild(button);
        card.appendChild(description);

        list.appendChild(card);

    });

}



/* 推しページ内のカレンダー導線 */
/* =========================
   📅 推し別カレンダーを開く
========================= */

function oshiHomeOpenCalendar(){

    const container =
        document.getElementById(
            "oshiContainer"
        );

    if(!container){

        console.error(
            "★ oshiContainer が見つかりません"
        );

        return;

    }

    const oshiId =
        container.dataset.oshiId;

    if(!oshiId){

        console.error(
            "★ 推しIDを取得できません"
        );

        return;

    }

    // 📅 推し別表示対象を保存
    window.currentCalendarOshiId =
        String(oshiId);

    console.log(
        "★ 推し別カレンダー:",
        window.currentCalendarOshiId
    );

    switchTab("calendarPage");

}
