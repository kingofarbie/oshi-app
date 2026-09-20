/* =====================================================
👶 こどもカレンダー
calendar-children.js

・子ども管理
・子ども選択
・カレンダー表示
・1日の記録
・項目選択モーダル
・時間入力
・備考
・記録編集
・記録削除
・時刻順ソート

データは子どもごとのIDで完全に分離する
===================================================== */


// =====================================================
// 💾 保存設定
// =====================================================

const CHILDREN_STORAGE_KEY =
    "oshi_app_children";


// =====================================================
// 👶 基本データ
// =====================================================

let childrenData = [];

let selectedChildId = null;

let childrenEditingId = null;

let childrenCalendarDate = new Date();

let childrenSelectedDate = null;


// =====================================================
// 📝 基本記録項目
// =====================================================

const CHILDREN_DAILY_RECORD_TYPES = {

    feeding: "🍼 授乳・ミルク",

    sleep: "😴 睡眠",

    diaper: "🚼 おむつ",

    stool: "💩 うんち",

    food: "🍚 食事",

    water: "💧 水分",

    condition: "🌡️ 体調・体温",

    medicine: "💊 薬"

};


// =====================================================
// 🚀 初期化
// =====================================================

function initializeChildrenCalendar() {

    loadChildrenData();

    initializeChildrenEvents();

    childrenCalendarDate = new Date();

    renderChildrenSelector();

    if (selectedChildId) {

        renderSelectedChild();

    } else {

        renderChildrenEmpty();

    }

    renderChildrenCalendar();

    renderChildrenDaily();

}


// =====================================================
// 💾 データ読み込み
// =====================================================

function loadChildrenData() {

    try {

        const saved =
            localStorage.getItem(
                CHILDREN_STORAGE_KEY
            );


        if (!saved) {

            childrenData = [];

            selectedChildId = null;

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (!Array.isArray(parsed)) {

            childrenData = [];

            selectedChildId = null;

            return;

        }


        childrenData = parsed;


        childrenData.forEach(
            function(child) {

                if (
                    !child.records ||
                    typeof child.records !== "object" ||
                    Array.isArray(child.records)
                ) {

                    child.records = {};

                }

            }
        );


        const savedSelectedChildId =
            localStorage.getItem(
                `${CHILDREN_STORAGE_KEY}_selected`
            );


        if (
            savedSelectedChildId &&
            childrenData.some(
                child =>
                    child.id ===
                    savedSelectedChildId
            )
        ) {

            selectedChildId =
                savedSelectedChildId;

        } else {

            selectedChildId =
                childrenData.length > 0
                    ? childrenData[0].id
                    : null;

        }

    }
    catch (error) {

        console.error(
            "子どもデータ読み込みエラー:",
            error
        );

        childrenData = [];

        selectedChildId = null;

    }

}


// =====================================================
// 💾 データ保存
// =====================================================

function saveChildrenData() {

    localStorage.setItem(
        CHILDREN_STORAGE_KEY,
        JSON.stringify(childrenData)
    );


    if (selectedChildId) {

        localStorage.setItem(
            `${CHILDREN_STORAGE_KEY}_selected`,
            selectedChildId
        );

    } else {

        localStorage.removeItem(
            `${CHILDREN_STORAGE_KEY}_selected`
        );

    }

}


// =====================================================
// 🆔 子どもID
// =====================================================

function createChildId() {

    return (
        "child_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );

}


// =====================================================
// 🆔 記録ID
// =====================================================

function createChildrenRecordId() {

    return (
        "record_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );

}


// =====================================================
// 🎛️ イベント初期化
// =====================================================

function initializeChildrenEvents() {

    // =================================================
    // 子ども選択
    // =================================================

    const selector =
        document.getElementById(
            "childrenSelector"
        );


    if (selector) {

        selector.onchange =
            function() {

                const value =
                    selector.value;


                if (value === "settings") {

                    selector.value =
                        selectedChildId || "";

                    openChildrenSettings();

                    return;

                }


                if (!value) {

                    selectedChildId = null;

                    childrenSelectedDate = null;

                    saveChildrenData();

                    renderSelectedChild();

                    renderChildrenCalendar();

                    renderChildrenDaily();

                    return;

                }


                selectChild(value);

            };

    }


    // =================================================
    // 前月
    // =================================================

    const previousButton =
        document.getElementById(
            "childrenPreviousMonthButton"
        );


    if (previousButton) {

        previousButton.onclick =
            function() {

                childrenCalendarDate.setMonth(
                    childrenCalendarDate.getMonth() - 1
                );

                renderChildrenCalendar();

            };

    }


    // =================================================
    // 次月
    // =================================================

    const nextButton =
        document.getElementById(
            "childrenNextMonthButton"
        );


    if (nextButton) {

        nextButton.onclick =
            function() {

                childrenCalendarDate.setMonth(
                    childrenCalendarDate.getMonth() + 1
                );

                renderChildrenCalendar();

            };

    }


    // =================================================
    // 設定モーダル
    // =================================================

    const settingsClose =
        document.getElementById(
            "childrenSettingsCloseButton"
        );


    if (settingsClose) {

        settingsClose.onclick =
            closeChildrenSettings;

    }


    const settingsOverlay =
        document.querySelector(
            "#childrenSettingsModal .children-modal-overlay"
        );


    if (settingsOverlay) {

        settingsOverlay.onclick =
            closeChildrenSettings;

    }


    const addButton =
        document.getElementById(
            "childrenAddButton"
        );


    if (addButton) {

        addButton.onclick =
            function() {

                openChildrenEdit();

            };

    }


    // =================================================
    // 子ども編集
    // =================================================

    const editClose =
        document.getElementById(
            "childrenEditCloseButton"
        );


    if (editClose) {

        editClose.onclick =
            closeChildrenEdit;

    }


    const editCancel =
        document.getElementById(
            "childrenEditCancelButton"
        );


    if (editCancel) {

        editCancel.onclick =
            closeChildrenEdit;

    }


    const editOverlay =
        document.querySelector(
            "#childrenEditModal .children-modal-overlay"
        );


    if (editOverlay) {

        editOverlay.onclick =
            closeChildrenEdit;

    }


    const editForm =
        document.getElementById(
            "childrenEditForm"
        );


    if (editForm) {

        editForm.onsubmit =
            function(event) {

                event.preventDefault();

                saveChildrenEdit();

            };

    }


    // =================================================
    // ＋項目追加
    // =================================================

    const dailyAddButton =
        document.getElementById(
            "childrenDailyAddButton"
        );


    if (dailyAddButton) {

        dailyAddButton.onclick =
            openChildrenRecordTypeModal;

    }

}


// =====================================================
// 👶 子ども選択
// =====================================================

function selectChild(childId) {

    const child =
        childrenData.find(
            item =>
                item.id === childId
        );


    if (!child) return;


    selectedChildId =
        child.id;

    childrenSelectedDate = null;

    saveChildrenData();

    renderChildrenSelector();

    renderSelectedChild();

    renderChildrenCalendar();

    renderChildrenDaily();

}


// =====================================================
// 👶 選択中の子ども
// =====================================================

function getSelectedChild() {

    if (!selectedChildId) {

        return null;

    }


    return (
        childrenData.find(
            child =>
                child.id === selectedChildId
        ) || null
    );

}


// =====================================================
// 🔽 子どもセレクター
// =====================================================

function renderChildrenSelector() {

    const selector =
        document.getElementById(
            "childrenSelector"
        );


    if (!selector) return;


    selector.innerHTML = "";


    const emptyOption =
        document.createElement("option");


    emptyOption.value = "";

    emptyOption.textContent =
        "子どもを選択";


    selector.appendChild(
        emptyOption
    );


    childrenData.forEach(
        function(child) {

            const option =
                document.createElement("option");


            option.value =
                child.id;


            option.textContent =
                `👶 ${child.name}`;


            selector.appendChild(
                option
            );

        }
    );


    const settingsOption =
        document.createElement("option");


    settingsOption.value =
        "settings";


    settingsOption.textContent =
        "⚙️ 子どもの設定";


    selector.appendChild(
        settingsOption
    );


    selector.value =
        selectedChildId || "";

}


// =====================================================
// 👶 プロフィール
// =====================================================

function renderSelectedChild() {

    const profile =
        document.getElementById(
            "childrenProfile"
        );


    const calendarSection =
        document.getElementById(
            "childrenCalendarSection"
        );


    if (!profile) return;


    const child =
        getSelectedChild();


    if (!child) {

        renderChildrenEmpty();

        if (calendarSection) {

            calendarSection.style.display =
                "none";

        }

        return;

    }


    profile.innerHTML = `

        <h2 class="children-profile-name">

            👶 ${escapeChildrenHTML(
                child.name
            )}

        </h2>

        <p class="children-profile-birthday">

            🎂 誕生日：

            ${
                child.birthday
                    ? escapeChildrenHTML(
                        child.birthday
                    )
                    : "未登録"
            }

        </p>

        <div class="children-profile-age">

            ${calculateChildAgeText(child)}

        </div>

    `;


    if (calendarSection) {

        calendarSection.style.display =
            "";

    }

}


// =====================================================
// 👶 未選択
// =====================================================

function renderChildrenEmpty() {

    const profile =
        document.getElementById(
            "childrenProfile"
        );


    const calendarSection =
        document.getElementById(
            "childrenCalendarSection"
        );


    if (profile) {

        profile.innerHTML = `

            <div class="children-profile-empty">

                まず「子どもの設定」から<br>

                子どもを追加してください。

            </div>

        `;

    }


    if (calendarSection) {

        calendarSection.style.display =
            "none";

    }

}


// =====================================================
// 🎂 年齢計算
// =====================================================

function calculateChildAgeText(child) {

    if (!child.birthday) return "";


    const birthday =
        parseDateOnly(
            child.birthday
        );


    if (!birthday) return "";


    const today =
        new Date();


    let years =
        today.getFullYear() -
        birthday.getFullYear();


    let months =
        today.getMonth() -
        birthday.getMonth();


    if (
        today.getDate() <
        birthday.getDate()
    ) {

        months--;

    }


    if (months < 0) {

        years--;

        months += 12;

    }


    if (years < 0) return "";


    if (years === 0) {

        return `現在 ${months}か月`;

    }


    return `現在 ${years}歳${months}か月`;

}


// =====================================================
// 📅 日付解析
// =====================================================

function parseDateOnly(value) {

    if (!value) return null;


    const parts =
        value.split("-").map(Number);


    if (parts.length !== 3) {

        return null;

    }


    const date =
        new Date(
            parts[0],
            parts[1] - 1,
            parts[2]
        );


    if (
        date.getFullYear() !== parts[0] ||
        date.getMonth() !== parts[1] - 1 ||
        date.getDate() !== parts[2]
    ) {

        return null;

    }


    return date;

}


// =====================================================
// ⚙️ 子ども設定
// =====================================================

function openChildrenSettings() {

    renderChildrenList();


    const modal =
        document.getElementById(
            "childrenSettingsModal"
        );


    if (modal) {

        modal.style.display =
            "block";

    }

}


function closeChildrenSettings() {

    const modal =
        document.getElementById(
            "childrenSettingsModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    renderChildrenSelector();

}


// =====================================================
// 📋 子ども一覧
// =====================================================

function renderChildrenList() {

    const list =
        document.getElementById(
            "childrenList"
        );


    if (!list) return;


    list.innerHTML = "";


    if (childrenData.length === 0) {

        list.innerHTML = `

            <div class="children-list-empty">

                まだ子どもが登録されていません。

            </div>

        `;

        return;

    }


    childrenData.forEach(
        function(child) {

            const item =
                document.createElement("div");


            item.className =
                "children-list-item";


            item.innerHTML = `

                <div class="children-list-info">

                    <p class="children-list-name">

                        👶 ${escapeChildrenHTML(
                            child.name
                        )}

                    </p>

                    <p class="children-list-birthday">

                        🎂 ${
                            child.birthday
                                ? escapeChildrenHTML(
                                    child.birthday
                                )
                                : "誕生日未登録"
                        }

                    </p>

                </div>

                <div class="children-list-actions">

                    <button
                        type="button"
                        class="children-list-action-button"
                        data-action="edit"
                    >
                        編集
                    </button>

                    <button
                        type="button"
                        class="children-list-action-button"
                        data-action="delete"
                    >
                        削除
                    </button>

                </div>

            `;


            const editButton =
                item.querySelector(
                    '[data-action="edit"]'
                );


            if (editButton) {

                editButton.onclick =
                    function() {

                        openChildrenEdit(
                            child.id
                        );

                    };

            }


            const deleteButton =
                item.querySelector(
                    '[data-action="delete"]'
                );


            if (deleteButton) {

                deleteButton.onclick =
                    function() {

                        deleteChild(
                            child.id
                        );

                    };

            }


            list.appendChild(
                item
            );

        }
    );

}


// =====================================================
// ✏️ 子ども編集
// =====================================================

function openChildrenEdit(
    childId = null
) {

    childrenEditingId =
        childId;


    const title =
        document.getElementById(
            "childrenEditTitle"
        );


    const nameInput =
        document.getElementById(
            "childrenNameInput"
        );


    const birthdayInput =
        document.getElementById(
            "childrenBirthdayInput"
        );


    if (
        !title ||
        !nameInput ||
        !birthdayInput
    ) {

        return;

    }


    if (childId) {

        const child =
            childrenData.find(
                item =>
                    item.id === childId
            );


        if (!child) return;


        title.textContent =
            "✏️ 子どもを編集";


        nameInput.value =
            child.name || "";


        birthdayInput.value =
            child.birthday || "";

    } else {

        title.textContent =
            "👶 子どもを追加";


        nameInput.value =
            "";


        birthdayInput.value =
            "";

    }


    const modal =
        document.getElementById(
            "childrenEditModal"
        );


    if (modal) {

        modal.style.display =
            "block";

    }


    setTimeout(
        function() {

            nameInput.focus();

        },
        0
    );

}


function closeChildrenEdit() {

    const modal =
        document.getElementById(
            "childrenEditModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    childrenEditingId =
        null;

}


// =====================================================
// 💾 子ども保存
// =====================================================

function saveChildrenEdit() {

    const nameInput =
        document.getElementById(
            "childrenNameInput"
        );


    const birthdayInput =
        document.getElementById(
            "childrenBirthdayInput"
        );


    if (
        !nameInput ||
        !birthdayInput
    ) {

        return;

    }


    const name =
        nameInput.value.trim();


    const birthday =
        birthdayInput.value;


    if (!name) {

        alert(
            "子どもの名前を入力してください。"
        );

        nameInput.focus();

        return;

    }


    if (childrenEditingId) {

        const child =
            childrenData.find(
                item =>
                    item.id ===
                    childrenEditingId
            );


        if (!child) return;


        child.name =
            name;


        child.birthday =
            birthday;


        if (
            !child.records ||
            typeof child.records !== "object" ||
            Array.isArray(child.records)
        ) {

            child.records = {};

        }

    } else {

        const newChild = {

            id:
                createChildId(),

            name:
                name,

            birthday:
                birthday,

            records:
                {},

            milestones:
                [],

            photos:
                []

        };


        childrenData.push(
            newChild
        );


        selectedChildId =
            newChild.id;

    }


    saveChildrenData();

    renderChildrenSelector();

    renderSelectedChild();

    renderChildrenCalendar();

    renderChildrenDaily();

    closeChildrenEdit();

    renderChildrenList();

}


// =====================================================
// 🗑️ 子ども削除
// =====================================================

function deleteChild(childId) {

    const child =
        childrenData.find(
            item =>
                item.id === childId
        );


    if (!child) return;


    const confirmed =
        window.confirm(
            `「${child.name}」を削除しますか？\n\n` +
            "この子どもに保存されている記録も削除対象になります。"
        );


    if (!confirmed) return;


    childrenData =
        childrenData.filter(
            item =>
                item.id !== childId
        );


    if (
        selectedChildId ===
        childId
    ) {

        selectedChildId =
            childrenData.length > 0
                ? childrenData[0].id
                : null;

        childrenSelectedDate =
            null;

    }


    saveChildrenData();

    renderChildrenSelector();

    renderSelectedChild();

    renderChildrenCalendar();

    renderChildrenDaily();

    renderChildrenList();

}


// =====================================================
// 📅 カレンダー表示
// =====================================================

function renderChildrenCalendar() {

    const calendar =
        document.getElementById(
            "childrenCalendar"
        );


    const monthTitle =
        document.getElementById(
            "childrenMonthTitleButton"
        );


    if (
        !calendar ||
        !monthTitle
    ) {

        return;

    }


    const child =
        getSelectedChild();


    if (!child) {

        calendar.innerHTML = "";

        return;

    }


    const year =
        childrenCalendarDate.getFullYear();


    const month =
        childrenCalendarDate.getMonth();


    monthTitle.textContent =
        `${year}年${month + 1}月`;


    calendar.innerHTML = "";


    const weekdays =
        [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ];


    weekdays.forEach(
        function(day, index) {

            const element =
                document.createElement("div");


            element.className =
                "children-calendar-weekday";


            element.textContent =
                day;


            if (index === 0) {

                element.classList.add(
                    "sunday"
                );

            }


            if (index === 6) {

                element.classList.add(
                    "saturday"
                );

            }


            calendar.appendChild(
                element
            );

        }
    );


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement("div");


        empty.className =
            "children-calendar-day empty";


        calendar.appendChild(
            empty
        );

    }


    const today =
        new Date();


    for (
        let day = 1;
        day <= lastDate;
        day++
    ) {

        const cell =
            document.createElement("button");


        cell.type =
            "button";


        cell.className =
            "children-calendar-day";


        const date =
            new Date(
                year,
                month,
                day
            );


        const dateString =
            formatChildrenDate(date);


        cell.innerHTML = `

            <div class="children-calendar-day-number">

                ${day}

            </div>

        `;


        if (
            date.getFullYear() ===
                today.getFullYear() &&
            date.getMonth() ===
                today.getMonth() &&
            date.getDate() ===
                today.getDate()
        ) {

            cell.classList.add(
                "today"
            );

        }


        if (
            childrenSelectedDate ===
            dateString
        ) {

            cell.classList.add(
                "selected"
            );

        }


        cell.onclick =
            function() {

                childrenSelectedDate =
                    dateString;

                renderChildrenCalendar();

                renderChildrenDaily();

            };


        calendar.appendChild(
            cell
        );

    }

}


// =====================================================
// 📅 YYYY-MM-DD
// =====================================================

function formatChildrenDate(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// =====================================================
// 📝 その日の記録取得
// =====================================================

function getChildrenDailyRecords(
    child,
    dateString
) {

    if (!child) return [];


    if (
        !child.records ||
        typeof child.records !== "object" ||
        Array.isArray(child.records)
    ) {

        child.records = {};

    }


    if (
        !Array.isArray(
            child.records[dateString]
        )
    ) {

        child.records[dateString] = [];

    }


    return child.records[dateString];

}


// =====================================================
// ⏰ 時刻順
// =====================================================

function sortChildrenDailyRecords(
    records
) {

    records.sort(
        function(a, b) {

            const timeA =
                String(a.time || "");


            const timeB =
                String(b.time || "");


            const result =
                timeA.localeCompare(
                    timeB
                );


            if (result !== 0) {

                return result;

            }


            return (
                Number(a.createdAt || 0) -
                Number(b.createdAt || 0)
            );

        }
    );


    return records;

}


// =====================================================
// 📝 1日の記録
// =====================================================

function renderChildrenDaily() {

    const section =
        document.getElementById(
            "childrenDailySection"
        );


    const title =
        document.getElementById(
            "childrenDailyTitle"
        );


    const recordsContainer =
        document.getElementById(
            "childrenDailyRecords"
        );


    if (
        !section ||
        !title ||
        !recordsContainer
    ) {

        return;

    }


    const child =
        getSelectedChild();


    if (
        !child ||
        !childrenSelectedDate
    ) {

        section.style.display =
            "none";

        return;

    }


    const date =
        parseDateOnly(
            childrenSelectedDate
        );


    if (!date) return;


    const year =
        date.getFullYear();


    const month =
        date.getMonth() + 1;


    const day =
        date.getDate();


    const weekday =
        [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ][date.getDay()];


    title.textContent =
        `👶 ${child.name}　${year}年${month}月${day}日（${weekday}）`;


    const addButton =
        document.getElementById(
            "childrenDailyAddButton"
        );


    if (addButton) {

        addButton.onclick =
            openChildrenRecordTypeModal;

    }


    renderChildrenDailyRecords(
        child,
        childrenSelectedDate,
        recordsContainer
    );


    section.style.display =
        "";

}


// =====================================================
// 📋 記録表
// =====================================================

function renderChildrenDailyRecords(
    child,
    dateString,
    container
) {

    const records =
        getChildrenDailyRecords(
            child,
            dateString
        );


    sortChildrenDailyRecords(
        records
    );


    if (records.length === 0) {

        container.innerHTML = `

            <div class="children-daily-empty">

                この日の記録はまだありません。

            </div>

        `;

        return;

    }


    let html = `

        <div class="children-daily-table-wrapper">

            <table class="children-daily-table">

                <thead>

                    <tr>

                        <th>時間</th>

                        <th>項目内容</th>

                        <th>備考</th>

                    </tr>

                </thead>

                <tbody>

    `;


    records.forEach(
        function(record) {

            const label =
                record.type === "other"
                    ? (
                        record.label ||
                        "その他"
                    )
                    : (
                        CHILDREN_DAILY_RECORD_TYPES[
                            record.type
                        ] ||
                        record.type ||
                        "記録"
                    );


            html += `

                <tr
                    class="children-daily-table-row"
                    data-record-id="${escapeChildrenHTML(
                        record.id
                    )}"
                >

                    <td class="children-daily-time">

                        ${escapeChildrenHTML(
                            record.time || ""
                        )}

                    </td>

                    <td class="children-daily-label">

                        ${escapeChildrenHTML(
                            label
                        )}

                    </td>

                    <td class="children-daily-memo">

                        ${escapeChildrenHTML(
                            record.memo || ""
                        )}

                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

        <div class="children-daily-table-hint">

            記録をタップすると編集できます

        </div>

    `;


    container.innerHTML =
        html;


    container
        .querySelectorAll(
            ".children-daily-table-row"
        )
        .forEach(
            function(row) {

                row.onclick =
                    function() {

                        editChildrenDailyRecord(
                            row.dataset.recordId
                        );

                    };

            }
        );

}


// =====================================================
// 📝 項目選択モーダル
// =====================================================

function openChildrenRecordTypeModal() {

    if (
        !getSelectedChild() ||
        !childrenSelectedDate
    ) {

        return;

    }


    closeChildrenRecordTypeModal();


    const modal =
        document.createElement("div");


    modal.id =
        "childrenRecordTypeModal";


    modal.className =
        "children-record-type-modal";


    modal.innerHTML = `

        <div class="children-record-type-overlay"></div>

        <div class="children-record-type-dialog">

            <div class="children-record-type-header">

                <h2>
                    📝 記録する項目
                </h2>

                <button
                    type="button"
                    id="childrenRecordTypeClose"
                    class="children-record-type-close"
                >
                    ×
                </button>

            </div>


            <div class="children-record-type-list">

                ${createChildrenRecordTypeButtons()}

                <button
                    type="button"
                    class="children-record-type-button other"
                    data-record-type="other"
                >
                    ✏️ その他
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const overlay =
        modal.querySelector(
            ".children-record-type-overlay"
        );


    if (overlay) {

        overlay.onclick =
            closeChildrenRecordTypeModal;

    }


    const closeButton =
        modal.querySelector(
            "#childrenRecordTypeClose"
        );


    if (closeButton) {

        closeButton.onclick =
            closeChildrenRecordTypeModal;

    }


    modal
        .querySelectorAll(
            ".children-record-type-button"
        )
        .forEach(
            function(button) {

                button.onclick =
                    function() {

                        const type =
                            button.dataset.recordType;


                        closeChildrenRecordTypeModal();


                        if (
                            type === "other"
                        ) {

                            openChildrenOtherRecord();

                        } else {

                            openChildrenDailyRecord(
                                type
                            );

                        }

                    };

            }
        );

}


// =====================================================
// 🧱 項目ボタン生成
// =====================================================

function createChildrenRecordTypeButtons() {

    let html = "";


    Object.entries(
        CHILDREN_DAILY_RECORD_TYPES
    )
    .forEach(
        function([type, label]) {

            html += `

                <button
                    type="button"
                    class="children-record-type-button"
                    data-record-type="${type}"
                >

                    ${escapeChildrenHTML(
                        label
                    )}

                </button>

            `;

        }
    );


    return html;

}


// =====================================================
// ✖️ 項目モーダルを閉じる
// =====================================================

function closeChildrenRecordTypeModal() {

    const modal =
        document.getElementById(
            "childrenRecordTypeModal"
        );


    if (modal) {

        modal.remove();

    }

}


// =====================================================
// ➕ 基本項目
// =====================================================

function openChildrenDailyRecord(type) {

    if (
        !CHILDREN_DAILY_RECORD_TYPES[type]
    ) {

        return;

    }


    openChildrenTimeInput(
        function(time) {

            openChildrenMemoInput(
                "",
                function(memo) {

                    addChildrenDailyRecord(
                        type,
                        time,
                        "",
                        memo
                    );

                }
            );

        }
    );

}


// =====================================================
// ✏️ その他
// =====================================================

function openChildrenOtherRecord() {

    const label =
        window.prompt(
            "記録する項目名を入力してください。\n\n例：お風呂、散歩、病院など"
        );


    if (label === null) {

        return;

    }


    const trimmedLabel =
        label.trim();


    if (!trimmedLabel) {

        alert(
            "項目名を入力してください。"
        );

        return;

    }


    if (trimmedLabel.length > 50) {

        alert(
            "項目名は50文字以内で入力してください。"
        );

        return;

    }


    openChildrenTimeInput(
        function(time) {

            openChildrenMemoInput(
                "",
                function(memo) {

                    addChildrenDailyRecord(
                        "other",
                        time,
                        trimmedLabel,
                        memo
                    );

                }
            );

        }
    );

}


// =====================================================
// ⏰ 時間入力
// =====================================================

function openChildrenTimeInput(
    callback,
    currentValue = ""
) {

    const input =
        document.createElement("input");


    input.type =
        "text";


    input.value =
        currentValue || "";


    input.style.display =
        "none";


    document.body.appendChild(
        input
    );


    openNumberInputModal(
        input,
        "⏰ 時刻",
        false,
        "time",
        function(time) {

            if (callback) {

                callback(time);

            }


            input.remove();

        },
        function() {

            input.remove();

        }
    );

}


// =====================================================
// 📝 備考入力
// =====================================================

function openChildrenMemoInput(
    currentMemo,
    callback
) {

    const memo =
        window.prompt(
            "備考を入力してください。\n\n空欄のままOKでも保存できます。",
            currentMemo || ""
        );


    if (memo === null) {

        return;

    }


    const trimmedMemo =
        memo.trim();


    if (trimmedMemo.length > 200) {

        alert(
            "備考は200文字以内で入力してください。"
        );

        return;

    }


    if (callback) {

        callback(
            trimmedMemo
        );

    }

}


// =====================================================
// 💾 記録追加
// =====================================================

function addChildrenDailyRecord(
    type,
    time,
    label = "",
    memo = ""
) {

    const child =
        getSelectedChild();


    if (
        !child ||
        !childrenSelectedDate
    ) {

        return;

    }


    const records =
        getChildrenDailyRecords(
            child,
            childrenSelectedDate
        );


    records.push({

        id:
            createChildrenRecordId(),

        type:
            type,

        label:
            label,

        time:
            time,

        memo:
            memo,

        createdAt:
            Date.now()

    });


    sortChildrenDailyRecords(
        records
    );


    saveChildrenData();

    renderChildrenDaily();

}


// =====================================================
// ✏️ 記録編集モーダル
// =====================================================

function editChildrenDailyRecord(
    recordId
) {

    const child =
        getSelectedChild();


    if (
        !child ||
        !childrenSelectedDate
    ) {

        return;

    }


    const records =
        getChildrenDailyRecords(
            child,
            childrenSelectedDate
        );


    const record =
        records.find(
            item =>
                item.id === recordId
        );


    if (!record) return;


    openChildrenRecordEditModal(
        record
    );

}


// =====================================================
// 📝 編集モーダル表示
// =====================================================

function openChildrenRecordEditModal(
    record
) {

    closeChildrenRecordEditModal();


    const label =
        record.type === "other"
            ? (
                record.label ||
                "その他"
            )
            : (
                CHILDREN_DAILY_RECORD_TYPES[
                    record.type
                ] ||
                record.type ||
                "記録"
            );


    const modal =
        document.createElement("div");


    modal.id =
        "childrenRecordEditModal";


    modal.className =
        "children-record-edit-modal";


    modal.innerHTML = `

        <div
            class="children-record-edit-overlay"
        ></div>


        <div
            class="children-record-edit-dialog"
        >

            <div
                class="children-record-edit-header"
            >

                <h2>
                    📝 記録を編集
                </h2>

                <button
                    type="button"
                    id="childrenRecordEditClose"
                    class="children-record-edit-close"
                >
                    ×
                </button>

            </div>


            <div
                class="children-record-edit-current"
            >

                <div
                    class="children-record-edit-time"
                >
                    ${escapeChildrenHTML(
                        record.time || ""
                    )}
                </div>


                <div
                    class="children-record-edit-label"
                >
                    ${escapeChildrenHTML(
                        label
                    )}
                </div>


                <div
                    class="children-record-edit-memo"
                >

                    ${
                        record.memo
                            ? escapeChildrenHTML(
                                record.memo
                            )
                            : "備考なし"
                    }

                </div>

            </div>


            <div
                class="children-record-edit-actions"
            >

                ${
                    record.type === "other"
                        ? `
                            <button
                                type="button"
                                id="childrenEditLabelButton"
                                class="children-record-edit-action"
                            >
                                ✏️ 項目名を変更
                            </button>
                        `
                        : ""
                }


                <button
                    type="button"
                    id="childrenEditTimeButton"
                    class="children-record-edit-action"
                >
                    ⏰ 時刻を変更
                </button>


                <button
                    type="button"
                    id="childrenEditMemoButton"
                    class="children-record-edit-action"
                >
                    📝 備考を変更
                </button>


                <button
                    type="button"
                    id="childrenDeleteRecordButton"
                    class="children-record-edit-action delete"
                >
                    🗑️ 削除
                </button>


                <button
                    type="button"
                    id="childrenEditCancelButton"
                    class="children-record-edit-action cancel"
                >
                    キャンセル
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // =================================================
    // 閉じる
    // =================================================

    const overlay =
        modal.querySelector(
            ".children-record-edit-overlay"
        );


    if (overlay) {

        overlay.onclick =
            closeChildrenRecordEditModal;

    }


    const closeButton =
        modal.querySelector(
            "#childrenRecordEditClose"
        );


    if (closeButton) {

        closeButton.onclick =
            closeChildrenRecordEditModal;

    }


    const cancelButton =
        modal.querySelector(
            "#childrenEditCancelButton"
        );


    if (cancelButton) {

        cancelButton.onclick =
            closeChildrenRecordEditModal;

    }


    // =================================================
    // 項目名変更
    // =================================================

    const labelButton =
        modal.querySelector(
            "#childrenEditLabelButton"
        );


    if (labelButton) {

        labelButton.onclick =
            function() {

                const newLabel =
                    window.prompt(
                        "項目名を変更してください。",
                        record.label || ""
                    );


                if (newLabel === null) {

                    return;

                }


                const trimmedLabel =
                    newLabel.trim();


                if (!trimmedLabel) {

                    alert(
                        "項目名を入力してください。"
                    );

                    return;

                }


                if (
                    trimmedLabel.length > 50
                ) {

                    alert(
                        "項目名は50文字以内で入力してください。"
                    );

                    return;

                }


                record.label =
                    trimmedLabel;


                saveChildrenData();

                closeChildrenRecordEditModal();

                renderChildrenDaily();

            };

    }


    // =================================================
    // 時刻変更
    // =================================================

    const timeButton =
        modal.querySelector(
            "#childrenEditTimeButton"
        );


    if (timeButton) {

        timeButton.onclick =
            function() {

                closeChildrenRecordEditModal();


                openChildrenTimeInput(
                    function(time) {

                        record.time =
                            time;


                        sortChildrenDailyRecords(
                            records
                        );


                        saveChildrenData();

                        renderChildrenDaily();

                    },
                    record.time || ""
                );

            };

    }


    // =================================================
    // 備考変更
    // =================================================

    const memoButton =
        modal.querySelector(
            "#childrenEditMemoButton"
        );


    if (memoButton) {

        memoButton.onclick =
            function() {

                const memo =
                    window.prompt(
                        "備考を変更してください。\n\n空欄にすると備考を削除できます。",
                        record.memo || ""
                    );


                if (memo === null) {

                    return;

                }


                const trimmedMemo =
                    memo.trim();


                if (
                    trimmedMemo.length > 200
                ) {

                    alert(
                        "備考は200文字以内で入力してください。"
                    );

                    return;

                }


                record.memo =
                    trimmedMemo;


                saveChildrenData();

                closeChildrenRecordEditModal();

                renderChildrenDaily();

            };

    }


    // =================================================
    // 削除
    // =================================================

    const deleteButton =
        modal.querySelector(
            "#childrenDeleteRecordButton"
        );


    if (deleteButton) {

        deleteButton.onclick =
            function() {

                deleteChildrenDailyRecord(
                    record.id
                );

            };

    }

}


// =====================================================
// ✖️ 編集モーダルを閉じる
// =====================================================

function closeChildrenRecordEditModal() {

    const modal =
        document.getElementById(
            "childrenRecordEditModal"
        );


    if (modal) {

        modal.remove();

    }

}


// =====================================================
// 🗑️ 記録削除
// =====================================================

function deleteChildrenDailyRecord(
    recordId
) {

    const child =
        getSelectedChild();


    if (
        !child ||
        !childrenSelectedDate
    ) {

        return;

    }


    const records =
        getChildrenDailyRecords(
            child,
            childrenSelectedDate
        );


    const index =
        records.findIndex(
            item =>
                item.id === recordId
        );


    if (index === -1) {

        return;

    }


    const record =
        records[index];


    const label =
        record.type === "other"
            ? (
                record.label ||
                "その他"
            )
            : (
                CHILDREN_DAILY_RECORD_TYPES[
                    record.type
                ] ||
                "記録"
            );


    const confirmed =
        window.confirm(
            `${record.time || ""} ${label}\n\nこの記録を削除しますか？`
        );


    if (!confirmed) {

        return;

    }


    records.splice(
        index,
        1
    );


    if (records.length === 0) {

        delete child.records[
            childrenSelectedDate
        ];

    }


    saveChildrenData();

    closeChildrenRecordEditModal();

    renderChildrenDaily();

}


// =====================================================
// 🛡️ HTMLエスケープ
// =====================================================

function escapeChildrenHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// =====================================================
// ◀ 通常カレンダー
// =====================================================

function closeChildrenCalendar() {

    if (
        typeof loadCalendarHTML ===
        "function"
    ) {

        loadCalendarHTML();

        return;

    }


    console.warn(
        "loadCalendarHTML() が見つかりません。"
    );

}


// =====================================================
// 🌐 グローバル公開
// =====================================================

window.initializeChildrenCalendar =
    initializeChildrenCalendar;

window.closeChildrenCalendar =
    closeChildrenCalendar;


// =====================================================
// 👶 こどもカレンダーを開く
// =====================================================

async function openChildrenCalendar() {

    const container =
        document.getElementById(
            "calendarContainer"
        );


    if (!container) {

        console.error(
            "calendarContainer がありません"
        );

        return;

    }


    try {

        const response =
            await fetch(
                "./calendar-children.html"
            );


        if (!response.ok) {

            throw new Error(
                "calendar-children.html の読み込みに失敗しました"
            );

        }


        container.innerHTML =
            await response.text();


        initializeChildrenCalendar();

    }
    catch (error) {

        console.error(
            "こどもカレンダー読み込みエラー:",
            error
        );

    }

}