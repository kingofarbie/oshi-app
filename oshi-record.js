
/* =====================================================
   📝 推し活記録
   oshi-record.js

   ・推しごとに記録を保存
   ・記録一覧を表示
   ・記録の編集、削除
   ・既存の推し情報、写真機能には触れない
===================================================== */


/* =====================================================
   📝 推し活記録ページ初期化
===================================================== */

async function initOshiRecordPage(oshiId) {

    const container =
        document.getElementById("oshiContainer");

    if (!container || !oshiId) return;

    const data = await db.load();

    const oshi =
        (data?.oshiList || []).find(
            item => item.id === oshiId
        );

    const title =
        container.querySelector("#oshiRecordTitle");

    if (title && oshi) {
        title.textContent =
            oshi.name + " の推し活記録";
    }

    await renderOshiActivityList(oshiId);
}


/* =====================================================
   📝 推しIDを取得
===================================================== */

function getOshiActivityTargetId() {

    const container =
        document.getElementById("oshiContainer");

    return container?.dataset.oshiId || null;
}


/* =====================================================
   📝 記録の種類
===================================================== */

const OSHI_ACTIVITY_TYPES = {

    live: {
        label: "ライブ参加",
        fields: [
            "oshiActivityLiveDate",
            "oshiActivityLiveName",
            "oshiActivityLiveVenue",
            "oshiActivityLiveSeat",
            "oshiActivityLiveMemo"
        ]
    },

    media: {
        label: "映像・メディア",
        fields: [
            "oshiActivityMediaName",
            "oshiActivityMediaDate",
            "oshiActivityMediaWatched",
            "oshiActivityMediaMemo"
        ]
    },

    work: {
        label: "出演作品",
        fields: [
            "oshiActivityWorkDate",
            "oshiActivityWorkName",
            "oshiActivityWorkEdition",
            "oshiActivityWorkMemo"
        ]
    },

    goods: {
        label: "グッズ購入",
        fields: [
            "oshiActivityGoodsDate",
            "oshiActivityGoodsName",
            "oshiActivityGoodsPrice",
            "oshiActivityGoodsPlace"
        ]
    },

    trip: {
        label: "推し活旅行",
        fields: [
            "oshiActivityTripDate",
            "oshiActivityTripDestination",
            "oshiActivityTripTransport",
            "oshiActivityTripHotel",
            "oshiActivityTripMemo"
        ]
    },

    memory: {
        label: "思い出",
        fields: [
            "oshiActivityMemoryDate",
            "oshiActivityMemoryMemo"
        ]
    },

    first: {
        label: "初めての記録",
        fields: [
            "oshiActivityFirstType",
            "oshiActivityFirstDate",
            "oshiActivityFirstMemo"
        ]
    }
};


/* =====================================================
   📝 種類に応じた入力欄の切り替え
===================================================== */

function updateOshiActivityTypeFields() {

    const container =
        document.getElementById("oshiContainer");

    if (!container) return;

    const typeSelect =
        container.querySelector("#oshiActivityType");

    if (!typeSelect) return;

    const type = typeSelect.value;

    Object.keys(OSHI_ACTIVITY_TYPES).forEach(key => {

        const group =
            container.querySelector(
                "#oshiActivity" +
                key.charAt(0).toUpperCase() +
                key.slice(1) +
                "Fields"
            );

        if (group) {
            group.style.display =
                key === type ? "" : "none";
        }
    });
}


/* =====================================================
   📝 モーダルを開く
===================================================== */

function openOshiActivityModal() {

    const container =
        document.getElementById("oshiContainer");

    const modal =
        container?.querySelector("#oshiActivityModal");

    if (!container || !modal) {
        console.error(
            "推し活記録の入力モーダルが見つかりません。"
        );
        return;
    }

    const formControls =
        modal.querySelectorAll(
            "input:not([type='file']), textarea, select"
        );

    formControls.forEach(control => {

        if (control.id === "oshiActivityType") {
            control.value = "live";
        } else if (control.type === "checkbox") {
            control.checked = false;
        } else {
            control.value = "";
        }
    });

    delete modal.dataset.editActivityId;

    const deleteButton =
        modal.querySelector(".delete-btn");

    if (deleteButton) {
        deleteButton.style.display = "none";
    }

    const typeSelect =
        modal.querySelector("#oshiActivityType");

    if (typeSelect) {
        typeSelect.onchange =
            updateOshiActivityTypeFields;
    }

    updateOshiActivityTypeFields();

    modal.classList.add("show");
}


/* =====================================================
   📝 モーダルを閉じる
===================================================== */

function closeOshiActivityModal() {

    const modal =
        document.querySelector(
            "#oshiContainer #oshiActivityModal"
        );

    if (!modal) return;

    modal.classList.remove("show");
}


/* =====================================================
   📝 入力内容を取得
===================================================== */

function getOshiActivityFormValues(type) {

    const container =
        document.getElementById("oshiContainer");

    const definition =
        OSHI_ACTIVITY_TYPES[type];

    if (!container || !definition) return null;

    const fields = {};

    definition.fields.forEach(id => {

        const input =
            container.querySelector("#" + id);

        if (!input) return;

        if (input.type === "checkbox") {
            fields[id] = input.checked;
        } else {
            fields[id] = input.value;
        }
    });

    return fields;
}



/* =====================================================
   📝 記録を保存・更新
   ・既存データを維持
   ・タグの保存、編集に対応
===================================================== */
async function saveOshiActivity() {
    const container = document.getElementById("oshiContainer");
    const modal = container?.querySelector("#oshiActivityModal");
    const oshiId = getOshiActivityTargetId();

    if (!container || !modal || !oshiId) {
        alert("推しの情報を取得できませんでした。");
        return;
    }

    const typeSelect = modal.querySelector("#oshiActivityType");
    const type = typeSelect?.value;

    if (!OSHI_ACTIVITY_TYPES[type]) {
        alert("記録の種類を選択してください。");
        return;
    }

    const fields = getOshiActivityFormValues(type);

    if (!fields) return;

    // 🏷️ タグを取得して整理
    const tagsInput = modal.querySelector("#oshiActivityTags");

    const tags = tagsInput
        ? [...new Set(
            tagsInput.value
                .split(/[,、，]/)
                .map(tag => tag.trim())
                .filter(Boolean)
        )]
        : [];

    const data = await db.load();

    if (!data) {
        alert("保存データを読み込めませんでした。");
        return;
    }

    if (!data.oshiRecords) {
        data.oshiRecords = {};
    }

    if (!Array.isArray(data.oshiRecords[oshiId])) {
        data.oshiRecords[oshiId] = [];
    }

    const records = data.oshiRecords[oshiId];
    const editId = modal.dataset.editActivityId;
    const now = new Date().toISOString();

    if (editId) {
        const index = records.findIndex(item => item.id === editId);

        if (index === -1) {
            alert("編集する記録が見つかりません。");
            return;
        }

        records[index] = {
            ...records[index],
            type,
            fields,
            tags,
            updatedAt: now
        };
    } else {
        records.push({
            id: Date.now().toString(36) +
                Math.random().toString(36).slice(2),
            oshiId,
            type,
            fields,
            tags,
            createdAt: now,
            updatedAt: now
        });
    }

    await db.save(data);

    closeOshiActivityModal();

    await renderOshiActivityList(oshiId);
}



/* =====================================================
   📝 記録一覧を表示
===================================================== */


/* =====================================================
   💖 推し活記録一覧
   ・カードをタップ → 詳細表示
   ・✏️ → 編集
   ・✕ → 削除
===================================================== */

async function renderOshiActivityList(oshiId) {

    const container =
        document.getElementById("oshiContainer");

    const list =
        container?.querySelector("#oshiActivityList");

    if (!container || !list || !oshiId) return;

    const data = await db.load();

    const records =
        data?.oshiRecords?.[oshiId] || [];

    list.replaceChildren();

    if (records.length === 0) {

        const empty = document.createElement("div");

        empty.className = "oshi-activity-empty";
        empty.textContent =
            "💖 まだ推し活記録がありません\n" +
            "ライブやグッズ購入などを記録してみましょう";

        list.appendChild(empty);
        return;
    }

    const sortedRecords =
        [...records].sort((a, b) => {

            const dateA =
                getOshiActivityRecordDate(a) ||
                a.createdAt || "";

            const dateB =
                getOshiActivityRecordDate(b) ||
                b.createdAt || "";

            return dateB.localeCompare(dateA);
        });

    const icons = {
        live: "🎤",
        media: "🎬",
        work: "🎭",
        goods: "🛍️",
        trip: "✈️",
        memory: "💖",
        first: "🌟"
    };

    sortedRecords.forEach(record => {

        const card = document.createElement("article");
        card.className = "oshi-activity-card";

        const main = document.createElement("button");
        main.type = "button";
        main.className = "oshi-activity-main";
        main.setAttribute(
            "aria-label",
            getOshiActivityRecordTitle(record) + " の詳細を見る"
        );

        const icon = document.createElement("span");
        icon.className = "oshi-activity-card-icon";
        icon.textContent = icons[record.type] || "💖";

        const info = document.createElement("span");
        info.className = "oshi-activity-card-info";

        const title = document.createElement("strong");
        title.className = "oshi-activity-card-title";
        title.textContent =
            getOshiActivityRecordTitle(record);

        const date = document.createElement("span");
        date.className = "oshi-activity-date";
        date.textContent =
            getOshiActivityRecordDate(record);

        const summary = document.createElement("span");
        summary.className = "oshi-activity-summary";
        summary.textContent =
            getOshiActivityRecordSummary(record);

        info.append(title, date);

        if (summary.textContent) {
            info.appendChild(summary);
        }

        const arrow = document.createElement("span");
        arrow.className = "oshi-activity-card-arrow";
        arrow.textContent = "›";
        arrow.setAttribute("aria-hidden", "true");

        main.append(icon, info, arrow);

        main.addEventListener("click", () => {
            showOshiActivityDetail(record);
        });

        const actions = document.createElement("div");
        actions.className = "oshi-activity-card-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "oshi-activity-action";
        editButton.textContent = "✏️";
        editButton.title = "記録を編集";
        editButton.setAttribute("aria-label", "記録を編集");

        editButton.addEventListener("click", event => {
            event.stopPropagation();
            editOshiActivity(record.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className =
            "oshi-activity-action oshi-activity-delete";
        deleteButton.textContent = "✕";
        deleteButton.title = "記録を削除";
        deleteButton.setAttribute("aria-label", "記録を削除");

        deleteButton.addEventListener("click", event => {
            event.stopPropagation();
            deleteOshiActivityById(record.id);
        });

        actions.append(editButton, deleteButton);
        card.append(main, actions);
        list.appendChild(card);
    });
}


/* =====================================================
   💖 活動の詳細表示
===================================================== */

function showOshiActivityDetail(record) {

    const container =
        document.getElementById("oshiContainer");

    if (!container || !record) return;

    let modal =
        container.querySelector("#oshiActivityDetailModal");

    if (!modal) {

        modal = document.createElement("div");
        modal.id = "oshiActivityDetailModal";
        modal.className = "oshi-activity-detail-overlay";

        const panel = document.createElement("section");
        panel.className = "oshi-activity-detail-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");
        panel.setAttribute("aria-labelledby", "oshiActivityDetailTitle");

        const header = document.createElement("div");
        header.className = "oshi-activity-detail-header";

        const heading = document.createElement("h3");
        heading.id = "oshiActivityDetailTitle";

        const close = document.createElement("button");
        close.type = "button";
        close.className = "oshi-activity-detail-close";
        close.textContent = "✕";
        close.title = "閉じる";
        close.addEventListener("click", () => {
            modal.classList.remove("show");
        });

        header.append(heading, close);

        const body = document.createElement("div");
        body.id = "oshiActivityDetailBody";
        body.className = "oshi-activity-detail-body";

        panel.append(header, body);
        modal.appendChild(panel);

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.classList.remove("show");
            }
        });

        container.appendChild(modal);
    }

    const heading =
        modal.querySelector("#oshiActivityDetailTitle");

    const body =
        modal.querySelector("#oshiActivityDetailBody");

    const fields = record.fields || {};

    const labels = {
        oshiActivityLiveDate: "日付",
        oshiActivityLiveName: "ライブ名",
        oshiActivityLiveVenue: "会場",
        oshiActivityLiveSeat: "座席",
        oshiActivityLiveMemo: "感想・メモ",

        oshiActivityMediaName: "作品・メディア名",
        oshiActivityMediaDate: "日付",
        oshiActivityMediaWatched: "視聴状況",
        oshiActivityMediaMemo: "感想・メモ",

        oshiActivityWorkDate: "日付",
        oshiActivityWorkName: "作品名",
        oshiActivityWorkEdition: "作品・公演の情報",
        oshiActivityWorkMemo: "感想・メモ",

        oshiActivityGoodsDate: "購入日",
        oshiActivityGoodsName: "グッズ名",
        oshiActivityGoodsPrice: "金額",
        oshiActivityGoodsPlace: "購入場所",

        oshiActivityTripDate: "日付",
        oshiActivityTripDestination: "行き先",
        oshiActivityTripTransport: "交通手段",
        oshiActivityTripHotel: "宿泊先",
        oshiActivityTripMemo: "旅行メモ",

        oshiActivityMemoryDate: "日付",
        oshiActivityMemoryMemo: "思い出・メモ",

        oshiActivityFirstType: "初めての出来事",
        oshiActivityFirstDate: "日付",
        oshiActivityFirstMemo: "メモ"
    };

    heading.textContent =
        getOshiActivityRecordTitle(record);

    body.replaceChildren();

    const typeLabel =
        OSHI_ACTIVITY_TYPES[record.type]?.label ||
        "推し活記録";

    const typeBadge = document.createElement("span");
    typeBadge.className = "oshi-activity-detail-type";
    typeBadge.textContent = typeLabel;
    body.appendChild(typeBadge);

    Object.entries(fields).forEach(([id, value]) => {

        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {
            return;
        }

        const row = document.createElement("div");
        row.className = "oshi-activity-detail-row";

        const label = document.createElement("div");
        label.className = "oshi-activity-detail-label";
        label.textContent = labels[id] || id;

        const text = document.createElement("div");
        text.className = "oshi-activity-detail-value";

        if (id === "oshiActivityMediaWatched") {
            text.textContent = value ? "視聴済み" : "未視聴";
        } else if (
            id === "oshiActivityFirstType" &&
            typeof value === "string"
        ) {
            const select =
                container.querySelector("#oshiActivityFirstType");

            const option = Array.from(
                select?.options || []
            ).find(item => item.value === value);

            text.textContent =
                option?.textContent || value;
        } else {
            text.textContent = String(value);
        }

        row.append(label, text);
        body.appendChild(row);
    });

    modal.classList.add("show");
}


/* =====================================================
   🗑️ 一覧から記録を削除
===================================================== */

async function deleteOshiActivityById(activityId) {

    const oshiId = getOshiActivityTargetId();

    if (!oshiId || !activityId) return;

    if (!confirm("この推し活記録を削除しますか？")) {
        return;
    }

    const data = await db.load();

    const records =
        data?.oshiRecords?.[oshiId];

    if (!Array.isArray(records)) return;

    data.oshiRecords[oshiId] =
        records.filter(item => item.id !== activityId);

    await db.save(data);

    const detailModal =
        document.querySelector(
            "#oshiContainer #oshiActivityDetailModal"
        );

    if (detailModal) {
        detailModal.classList.remove("show");
    }

    await renderOshiActivityList(oshiId);
}




/* =====================================================
   📝 記録タイトル
===================================================== */

function getOshiActivityRecordTitle(record) {

    const fields = record.fields || {};

    const titleFields = {

        live: "oshiActivityLiveName",
        media: "oshiActivityMediaName",
        work: "oshiActivityWorkName",
        goods: "oshiActivityGoodsName",
        trip: "oshiActivityTripDestination",
        memory: "oshiActivityMemoryMemo",
        first: "oshiActivityFirstType"

    };

    const value =
        fields[titleFields[record.type]];

    if (record.type === "first") {

        const select =
            document.querySelector(
                "#oshiContainer #oshiActivityFirstType"
            );

        const option =
            select?.querySelector(
                `option[value="${CSS.escape(value || "")}"]`
            );

        if (option?.textContent) {
            return "初めて： " + option.textContent;
        }
    }

    return (
        value ||
        OSHI_ACTIVITY_TYPES[record.type]?.label ||
        "推し活記録"
    );
}


/* =====================================================
   📝 記録の日付
===================================================== */

function getOshiActivityRecordDate(record) {

    const fields = record.fields || {};

    const dateFields = [
        "oshiActivityLiveDate",
        "oshiActivityMediaDate",
        "oshiActivityWorkDate",
        "oshiActivityGoodsDate",
        "oshiActivityTripDate",
        "oshiActivityMemoryDate",
        "oshiActivityFirstDate"
    ];

    for (const id of dateFields) {
        if (fields[id]) return fields[id];
    }

    return "";
}


/* =====================================================
   📝 一覧用の概要
===================================================== */

function getOshiActivityRecordSummary(record) {

    const fields = record.fields || {};

    const summaryFields = {

        live: [
            "oshiActivityLiveVenue",
            "oshiActivityLiveSeat"
        ],

        media: [
            "oshiActivityMediaMemo"
        ],

        work: [
            "oshiActivityWorkEdition"
        ],

        goods: [
            "oshiActivityGoodsPlace",
            "oshiActivityGoodsPrice"
        ],

        trip: [
            "oshiActivityTripTransport",
            "oshiActivityTripHotel"
        ],

        memory: [
            "oshiActivityMemoryDate"
        ],

        first: [
            "oshiActivityFirstMemo"
        ]
    };

    return (summaryFields[record.type] || [])
        .map(id => fields[id])
        .filter(value =>
            value !== undefined &&
            value !== null &&
            value !== ""
        )
        .join(" ・ ");
}



/* =====================================================
   📝 記録を編集
   ・既存の入力項目を復元
   ・保存済みタグを復元
   ・既存の添付ファイル入力を勝手に変更しない
===================================================== */
async function editOshiActivity(activityId) {
    const container = document.getElementById("oshiContainer");
    const modal = container?.querySelector("#oshiActivityModal");
    const oshiId = getOshiActivityTargetId();

    if (!container || !modal || !oshiId) return;

    const data = await db.load();
    const records = data?.oshiRecords?.[oshiId] || [];

    const record = records.find(item => item.id === activityId);

    if (!record) {
        alert("記録が見つかりません。");
        return;
    }

    const typeSelect = modal.querySelector("#oshiActivityType");

    if (typeSelect) {
        typeSelect.value = record.type;
        typeSelect.onchange = updateOshiActivityTypeFields;
    }

    const fields = record.fields || {};

    // 📝 各種類の入力項目を復元
    Object.keys(OSHI_ACTIVITY_TYPES).forEach(type => {
        OSHI_ACTIVITY_TYPES[type].fields.forEach(id => {
            const input = modal.querySelector("#" + id);

            if (!input) return;

            if (input.type === "checkbox") {
                input.checked = Boolean(fields[id]);
            } else {
                input.value = fields[id] ?? "";
            }
        });
    });

    // 🏷️ 保存済みタグを復元
    const tagsInput = modal.querySelector("#oshiActivityTags");

    if (tagsInput) {
        tagsInput.value = Array.isArray(record.tags)
            ? record.tags.join("、")
            : "";
    }

    modal.dataset.editActivityId = record.id;

    const deleteButton = modal.querySelector(".delete-btn");

    if (deleteButton) {
        deleteButton.style.display = "";
    }

    updateOshiActivityTypeFields();

    modal.classList.add("show");
}



/* =====================================================
   📝 記録を削除
===================================================== */

async function deleteOshiActivity() {

    const container =
        document.getElementById("oshiContainer");

    const modal =
        container?.querySelector("#oshiActivityModal");

    const oshiId =
        getOshiActivityTargetId();

    const activityId =
        modal?.dataset.editActivityId;

    if (!container || !modal || !oshiId || !activityId) {
        return;
    }

    if (!confirm("この推し活記録を削除しますか？")) {
        return;
    }

    const data = await db.load();

    const records =
        data?.oshiRecords?.[oshiId];

    if (!Array.isArray(records)) return;

    data.oshiRecords[oshiId] =
        records.filter(
            item => item.id !== activityId
        );

    await db.save(data);

    closeOshiActivityModal();

    await renderOshiActivityList(oshiId);
}
