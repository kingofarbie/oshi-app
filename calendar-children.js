/* =====================================================
👶 こどもカレンダー
calendar-children.js

・子ども管理
・子ども選択
・データ保存
・カレンダー表示
・モーダル操作

データは子どもごとのIDで完全に分離する
===================================================== */

/* =====================================================
保存先
===================================================== */

const CHILDREN_STORAGE_KEY = "oshi_app_children";

/* =====================================================
状態
===================================================== */

let childrenData = [];
let selectedChildId = null;
let childrenEditingId = null;

let childrenCalendarDate = new Date();
let childrenSelectedDate = null;

/* =====================================================
初期化
===================================================== */

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

}

/* =====================================================
データ読み込み
===================================================== */

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

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
        childrenData = [];
        selectedChildId = null;
        return;
    }

    childrenData = parsed;

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

    } else {

        selectedChildId =
            childrenData.length > 0
                ? childrenData[0].id
                : null;
    }

} catch (error) {

    console.error(
        "子どもデータ読み込みエラー:",
        error
    );

    childrenData = [];
    selectedChildId = null;
}

}

/* =====================================================
データ保存
===================================================== */

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

/* =====================================================
子どもID生成
===================================================== */

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

/* =====================================================
イベント初期化
===================================================== */

function initializeChildrenEvents() {

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

                saveChildrenData();

                renderSelectedChild();

                renderChildrenCalendar();

                return;
            }

            selectChild(value);
        };
}


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

}

/* =====================================================
子ども選択
===================================================== */

function selectChild(childId) {

const child =
    childrenData.find(
        item =>
            item.id === childId
    );

if (!child) {
    return;
}

selectedChildId =
    child.id;

saveChildrenData();

childrenSelectedDate = null;

renderSelectedChild();

renderChildrenCalendar();

}

/* =====================================================
現在の子ども
===================================================== */

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

/* =====================================================
セレクター表示
===================================================== */

function renderChildrenSelector() {

const selector =
    document.getElementById(
        "childrenSelector"
    );

if (!selector) {
    return;
}

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

/* =====================================================
プロフィール表示
===================================================== */

function renderSelectedChild() {

const profile =
    document.getElementById(
        "childrenProfile"
    );

const calendarSection =
    document.getElementById(
        "childrenCalendarSection"
    );

if (!profile) {
    return;
}

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
        ${child.birthday
            ? escapeChildrenHTML(child.birthday)
            : "未登録"}
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

/* =====================================================
子ども未選択
===================================================== */

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

/* =====================================================
年齢表示
===================================================== */

function calculateChildAgeText(child) {

if (!child.birthday) {
    return "";
}

const birthday =
    parseDateOnly(child.birthday);

if (!birthday) {
    return "";
}

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

if (years < 0) {
    return "";
}

if (years === 0) {

    return `現在 ${months}か月`;
}

return `現在 ${years}歳${months}か月`;

}

/* =====================================================
日付
===================================================== */

function parseDateOnly(value) {

if (!value) {
    return null;
}

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

/* =====================================================
設定を開く
===================================================== */

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

/* =====================================================
設定を閉じる
===================================================== */

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

/* =====================================================
子ども一覧
===================================================== */

function renderChildrenList() {

const list =
    document.getElementById(
        "childrenList"
    );

if (!list) {
    return;
}

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
                    👶 ${escapeChildrenHTML(child.name)}
                </p>

                <p class="children-list-birthday">
                    🎂
                    ${child.birthday
                        ? escapeChildrenHTML(child.birthday)
                        : "誕生日未登録"}
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

/* =====================================================
追加・編集画面
===================================================== */

function openChildrenEdit(childId = null) {

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


if (!title ||
    !nameInput ||
    !birthdayInput) {

    return;
}


if (childId) {

    const child =
        childrenData.find(
            item =>
                item.id === childId
        );

    if (!child) {
        return;
    }

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

/* =====================================================
追加・編集を閉じる
===================================================== */

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

/* =====================================================
追加・編集を保存
===================================================== */

function saveChildrenEdit() {

const nameInput =
    document.getElementById(
        "childrenNameInput"
    );

const birthdayInput =
    document.getElementById(
        "childrenBirthdayInput"
    );


if (!nameInput ||
    !birthdayInput) {

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

    if (!child) {
        return;
    }

    child.name =
        name;

    child.birthday =
        birthday;


} else {

    const newChild = {

        id:
            createChildId(),

        name:
            name,

        birthday:
            birthday,

        /*
         * 子どもごとのデータ領域
         * 今後ここへ機能を追加していく
         */
        records: {},

        milestones: [],

        photos: []

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

closeChildrenEdit();

renderChildrenList();

}

/* =====================================================
子ども削除
===================================================== */

function deleteChild(childId) {

const child =
    childrenData.find(
        item =>
            item.id === childId
    );

if (!child) {
    return;
}


const confirmed =
    window.confirm(
        `「${child.name}」を削除しますか？\n\nこの子どもに保存されている記録も削除対象になります。`
    );


if (!confirmed) {
    return;
}


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
}


saveChildrenData();

renderChildrenSelector();

renderSelectedChild();

renderChildrenCalendar();

renderChildrenList();

}

/* =====================================================
カレンダー表示
===================================================== */

function renderChildrenCalendar() {

const calendar =
    document.getElementById(
        "childrenCalendar"
    );

const monthTitle =
    document.getElementById(
        "childrenMonthTitleButton"
    );


if (!calendar ||
    !monthTitle) {

    return;
}


const child =
    getSelectedChild();


if (!child) {

    calendar.innerHTML =
        "";

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


const weekdays = [
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

        /*
         * 日付の選択色は変更しない
         */

        renderChildrenCalendar();

        /*
         * カレンダー下の日別記録を更新
         */
        renderChildrenDaily();
    };

    calendar.appendChild(
        cell
    );
}

}

/* =====================================================
日付文字列
===================================================== */

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

/* =====================================================
HTMLエスケープ
===================================================== */

function escapeChildrenHTML(value) {

return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

/* =====================================================
通常カレンダーへ戻る
===================================================== */

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

/* =====================================================
グローバル公開
===================================================== */

window.initializeChildrenCalendar =
initializeChildrenCalendar;

window.closeChildrenCalendar =
closeChildrenCalendar;



/* =====================================================
👶 こどもカレンダーを開く
===================================================== */

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


} catch (error) {

    console.error(
        "こどもカレンダー読み込みエラー:",
        error
    );
}

}



/* =====================================================
👶 選択日の記録表示
===================================================== */

function renderChildrenDaily() {

    const section =
        document.getElementById(
            "childrenDailySection"
        );

    const title =
        document.getElementById(
            "childrenDailyTitle"
        );

    const content =
        document.getElementById(
            "childrenDailyContent"
        );

    if (
        !section ||
        !title ||
        !content
    ) {
        return;
    }


    const child =
        getSelectedChild();


    /*
     * 子どもが選択されていない場合
     */
    if (!child || !childrenSelectedDate) {

        section.style.display =
            "none";

        content.innerHTML =
            "";

        return;
    }


    /*
     * 日付を表示用に変換
     */
    const date =
        parseDateOnly(
            childrenSelectedDate
        );


    if (!date) {
        return;
    }


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


    /*
     * まずは表示確認用の基本画面
     *
     * 記録機能はこのあと追加する
     */
    content.innerHTML = `
        <div class="children-daily-empty">
            この日の記録はまだありません。
        </div>

        <button
            type="button"
            class="children-daily-add-button"
        >
            ＋ この日の記録を追加
        </button>
    `;


    section.style.display =
        "";
}
