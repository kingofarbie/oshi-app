
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
===================================================== */

async function saveOshiActivity() {

    const container =
        document.getElementById("oshiContainer");

    const modal =
        container?.querySelector("#oshiActivityModal");

    const oshiId =
        getOshiActivityTargetId();

    if (!container || !modal || !oshiId) {
        alert("推しの情報を取得できませんでした。");
        return;
    }

    const typeSelect =
        modal.querySelector("#oshiActivityType");

    const type = typeSelect?.value;

    if (!OSHI_ACTIVITY_TYPES[type]) {
        alert("記録の種類を選択してください。");
        return;
    }

    const fields =
        getOshiActivityFormValues(type);

    if (!fields) return;

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

    const records =
        data.oshiRecords[oshiId];

    const editId =
        modal.dataset.editActivityId;

    const now = new Date().toISOString();

    if (editId) {

        const index =
            records.findIndex(
                item => item.id === editId
            );

        if (index !== -1) {

            records[index] = {
                ...records[index],
                type,
                fields,
                updatedAt: now
            };

        } else {

            alert("編集する記録が見つかりません。");
            return;
        }

    } else {

        records.push({

            id:
                Date.now().toString(36) +
                Math.random().toString(36).slice(2),

            oshiId,
            type,
            fields,
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

        const empty =
            document.createElement("div");

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
                a.fields?.oshiActivityLiveDate ||
                a.fields?.oshiActivityMediaDate ||
                a.fields?.oshiActivityWorkDate ||
                a.fields?.oshiActivityGoodsDate ||
                a.fields?.oshiActivityTripDate ||
                a.fields?.oshiActivityMemoryDate ||
                a.fields?.oshiActivityFirstDate ||
                a.createdAt || "";

            const dateB =
                b.fields?.oshiActivityLiveDate ||
                b.fields?.oshiActivityMediaDate ||
                b.fields?.oshiActivityWorkDate ||
                b.fields?.oshiActivityGoodsDate ||
                b.fields?.oshiActivityTripDate ||
                b.fields?.oshiActivityMemoryDate ||
                b.fields?.oshiActivityFirstDate ||
                b.createdAt || "";

            return dateB.localeCompare(dateA);
        });

    sortedRecords.forEach(record => {

        const fields = record.fields || {};

        const item =
            document.createElement("button");

        item.type = "button";
        item.className = "oshi-activity-item";

        const heading =
            document.createElement("strong");

        heading.textContent =
            getOshiActivityRecordTitle(record);

        const date =
            document.createElement("span");

        date.className = "oshi-activity-date";

        date.textContent =
            getOshiActivityRecordDate(record);

        const detail =
            document.createElement("span");

        detail.className = "oshi-activity-summary";

        detail.textContent =
            getOshiActivityRecordSummary(record);

        item.append(heading, date, detail);

        item.addEventListener("click", () => {
            editOshiActivity(record.id);
        });

        list.appendChild(item);
    });
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
===================================================== */

async function editOshiActivity(activityId) {

    const container =
        document.getElementById("oshiContainer");

    const modal =
        container?.querySelector("#oshiActivityModal");

    const oshiId =
        getOshiActivityTargetId();

    if (!container || !modal || !oshiId) return;

    const data = await db.load();

    const records =
        data?.oshiRecords?.[oshiId] || [];

    const record =
        records.find(item => item.id === activityId);

    if (!record) {
        alert("記録が見つかりません。");
        return;
    }

    const typeSelect =
        modal.querySelector("#oshiActivityType");

    if (typeSelect) {
        typeSelect.value = record.type;
        typeSelect.onchange =
            updateOshiActivityTypeFields;
    }

    const fields = record.fields || {};

    Object.keys(OSHI_ACTIVITY_TYPES).forEach(type => {

        OSHI_ACTIVITY_TYPES[type].fields.forEach(id => {

            const input =
                modal.querySelector("#" + id);

            if (!input) return;

            if (input.type === "checkbox") {
                input.checked = Boolean(fields[id]);
            } else {
                input.value = fields[id] ?? "";
            }
        });
    });

    modal.dataset.editActivityId = record.id;

    const deleteButton =
        modal.querySelector(".delete-btn");

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
