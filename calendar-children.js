/* =====================================================
👶 こどもカレンダー
calendar-children.js

・子ども管理
・子ども選択
・データ保存
・カレンダー表示
・1日の記録
・記録の追加 / 編集 / 削除
・時刻順自動ソート

データは子どもごとのIDで完全に分離する
===================================================== */


// =====================================================
// 💾 保存設定
// =====================================================

const CHILDREN_STORAGE_KEY = "oshi_app_children";


// =====================================================
// 👶 子どもデータ
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

    }
    else {

        renderChildrenEmpty();

    }

    renderChildrenCalendar();

    renderChildrenDaily();

}


// =====================================================
// 💾 子どもデータ読み込み
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


        // ---------------------------------------------
        // 既存データに records がない場合の補正
        // ---------------------------------------------

        childrenData.forEach(function(child) {

            if (
                !child.records ||
                typeof child.records !== "object" ||
                Array.isArray(child.records)
            ) {

                child.records = {};

            }

        });


        const savedSelectedChildId =
            localStorage.getItem(
                `${CHILDREN_STORAGE_KEY}_selected`
            );


        if (
            savedSelectedChildId &&
            childrenData.some(
                child =>
                    child.id === savedSelectedChildId
            )
        ) {

            selectedChildId =
                savedSelectedChildId;

        }
        else {

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
// 💾 子どもデータ保存
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

    }
    else {

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

    // ---------------------------------------------
    // 子ども選択
    // ---------------------------------------------

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


    // ---------------------------------------------
    // 前月
    // ---------------------------------------------

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


    // ---------------------------------------------
    // 次月
    // ---------------------------------------------

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


    // ---------------------------------------------
    // 設定モーダル
    // ---------------------------------------------

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


    // ---------------------------------------------
    // 子ども追加
    // ---------------------------------------------

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


    // ---------------------------------------------
    // 編集モーダル
    // ---------------------------------------------

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


    // ---------------------------------------------
    // 基本記録ボタン
    // ---------------------------------------------

    const recordButtons =
        document.querySelectorAll(
            ".children-daily-record-button"
        );


    recordButtons.forEach(
        function(button) {

            button.onclick =
                function() {

                    const type =
                        button.dataset.recordType;

                    openChildrenDailyRecord(type);

                };

        }
    );


    // ---------------------------------------------
    // その他
    // ---------------------------------------------

    const otherButton =
        document.getElementById(
            "childrenDailyOtherButton"
        );


    if (otherButton) {

        otherButton.onclick =
            openChildrenOtherRecord;

    }

}


// =====================================================
// 👶 子ども選択
// =====================================================

function selectChild(childId) {

    const child =
        childrenData.find(
            item => item.id === childId
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
// 👶 子どもプロフィール
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

            👶 ${escapeChildrenHTML(child.name)}

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
// 👶 子ども未選択
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
// 📅 日付のみを安全に解析
// =====================================================

function parseDateOnly(value) {

    if (!value) return null;


    const parts =
        value
            .split("-")
            .map(Number);


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
// ⚙️ 子ども設定を開く
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


// =====================================================
// ⚙️ 子ども設定を閉じる
// =====================================================

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
                        data-child-id="${child.id}"
                    >
                        編集
                    </button>

                    <button
                        type="button"
                        class="children-list-action-button"
                        data-action="delete"
                        data-child-id="${child.id}"
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


            list.appendChild(item);

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
                item => item.id === childId
            );


        if (!child) return;


        title.textContent =
            "✏️ 子どもを編集";


        nameInput.value =
            child.name || "";


        birthdayInput.value =
            child.birthday || "";

    }
    else {

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


// =====================================================
// ✖️ 子ども編集を閉じる
// =====================================================

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

    }
    else {

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
        selectedChildId === childId
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


    calendar.innerHTML =
        "";


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
                document.createElement(
                    "div"
                );


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
            document.createElement(
                "div"
            );


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
            document.createElement(
                "button"
            );


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
            formatChildrenDate(
                date
            );


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
// 📅 日付 → YYYY-MM-DD
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


    return (
        `${year}-${month}-${day}`
    );

}


// =====================================================
// 📝 子どもの1日記録を取得
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

        child.records[dateString] =
            [];

    }


    return child.records[dateString];

}


// =====================================================
// ⏰ 記録を時刻順に並べる
// =====================================================

function sortChildrenDailyRecords(
    records
) {

    records.sort(
        function(a, b) {

            const timeA =
                String(
                    a.time || ""
                );


            const timeB =
                String(
                    b.time || ""
                );


            const result =
                timeA.localeCompare(
                    timeB
                );


            if (result !== 0) {

                return result;

            }


            // 同時刻の場合は登録順を維持
            return (
                Number(
                    a.createdAt || 0
                ) -
                Number(
                    b.createdAt || 0
                )
            );

        }
    );


    return records;

}


// =====================================================
// 📝 日記録画面
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


    const basicSection =
        document.querySelector(
            ".children-daily-basic-section"
        );


    const recordsContainer =
        document.getElementById(
            "childrenDailyRecords"
        );


    if (
        !section ||
        !title ||
        !basicSection ||
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
        ][
            date.getDay()
        ];


    title.textContent =
        `👶 ${child.name}　${year}年${month}月${day}日（${weekday}）`;


    // ---------------------------------------------
    // 基本項目ボタン
    // ---------------------------------------------

    const buttons =
        basicSection.querySelectorAll(
            ".children-daily-record-button"
        );


    buttons.forEach(
        function(button) {

            button.onclick =
                function() {

                    const type =
                        button.dataset.recordType;


                    openChildrenDailyRecord(
                        type
                    );

                };

        }
    );


    // ---------------------------------------------
    // その他
    // ---------------------------------------------

    const otherButton =
        document.getElementById(
            "childrenDailyOtherButton"
        );


    if (otherButton) {

        otherButton.onclick =
            openChildrenOtherRecord;

    }


    // ---------------------------------------------
    // 記録一覧
    // ---------------------------------------------

    renderChildrenDailyRecords(
        child,
        childrenSelectedDate,
        recordsContainer
    );


    section.style.display =
        "";

}


// =====================================================
// 📋 記録一覧
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


    container.innerHTML = "";


    records.forEach(
        function(record) {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "children-daily-record-item";


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


            item.innerHTML = `

                <span class="children-daily-record-time">

                    ${escapeChildrenHTML(
                        record.time || ""
                    )}

                </span>

                <span class="children-daily-record-label">

                    ${escapeChildrenHTML(
                        label
                    )}

                </span>

                <span class="children-daily-record-arrow">

                    ›
                    
                </span>

            `;


            item.onclick =
                function() {

                    editChildrenDailyRecord(
                        record.id
                    );

                };


            container.appendChild(
                item
            );

        }
    );

}


// =====================================================
// ➕ 基本記録追加
// =====================================================

function openChildrenDailyRecord(
    type
) {

    const child =
        getSelectedChild();


    if (
        !child ||
        !childrenSelectedDate
    ) {

        return;

    }


    if (
        !CHILDREN_DAILY_RECORD_TYPES[
            type
        ]
    ) {

        return;

    }


    // ---------------------------------------------
    // 一時的な time input
    // ---------------------------------------------

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


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

            addChildrenDailyRecord(
                type,
                time
            );


            input.remove();

        },
        function() {

            input.remove();

        }
    );

}


// =====================================================
// ➕ その他記録
// =====================================================

function openChildrenOtherRecord() {

    const child =
        getSelectedChild();


    if (
        !child ||
        !childrenSelectedDate
    ) {

        return;

    }


    const label =
        window.prompt(
            "記録する項目名を入力してください。\n\n例：お風呂、散歩、検温、病院など"
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


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


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

            addChildrenDailyRecord(
                "other",
                time,
                trimmedLabel
            );


            input.remove();

        },
        function() {

            input.remove();

        }
    );

}


// =====================================================
// 💾 記録追加
// =====================================================

function addChildrenDailyRecord(
    type,
    time,
    label = ""
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
// ✏️ 記録編集
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


    // ---------------------------------------------
    // その他は項目名も編集
    // ---------------------------------------------

    if (record.type === "other") {

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


        if (trimmedLabel.length > 50) {

            alert(
                "項目名は50文字以内で入力してください。"
            );

            return;

        }


        record.label =
            trimmedLabel;

    }


    // ---------------------------------------------
    // 時刻変更
    // ---------------------------------------------

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


    input.value =
        record.time || "";


    input.style.display =
        "none";


    document.body.appendChild(
        input
    );


    openNumberInputModal(
        input,
        "⏰ 時刻を変更",
        false,
        "time",
        function(time) {

            record.time =
                time;


            sortChildrenDailyRecords(
                records
            );


            saveChildrenData();

            renderChildrenDaily();


            input.remove();

        },
        function() {

            // -------------------------------------
            // 削除
            // -------------------------------------

            const index =
                records.findIndex(
                    item =>
                        item.id === recordId
                );


            if (index !== -1) {

                records.splice(
                    index,
                    1
                );

            }


            // 空になった日付は削除
            if (
                records.length === 0
            ) {

                delete child.records[
                    childrenSelectedDate
                ];

            }


            saveChildrenData();

            renderChildrenDaily();


            input.remove();

        }
    );

}


// =====================================================
// 🛡️ HTMLエスケープ
// =====================================================

function escapeChildrenHTML(value) {

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
// ◀ 通常カレンダーへ戻る
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