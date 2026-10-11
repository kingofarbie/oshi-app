
/* =====================================================
   👨‍👩‍👧 家族スケジュール
   planner-family.js

   ・家族メンバー最大4人
   ・プレミアム / VIP 限定
   ・単発予定、繰り返し予定、日別例外を分離保存
   ・繰り返し予定の変更は指定日以降に適用
   ・個人予定の編集処理には干渉しない
===================================================== */

const PLANNER_FAMILY_MAX_MEMBERS = 4;
const PLANNER_FAMILY_DESKTOP_LANE = 54;
const PLANNER_FAMILY_MOBILE_LANE = 46;
const PLANNER_FAMILY_MINUTES_PER_HOUR = 60;
const PLANNER_FAMILY_PIXELS_PER_30_MINUTES = 40;
const PLANNER_FAMILY_TOP_OFFSET = 15;

/* =====================================================
   共通処理
===================================================== */

function plannerFamilyIsAllowed() {
    const data = db.load();
    const plan = data.settings?.plan || "free";
    return plan === "premium" || plan === "vip";
}

function plannerFamilyEnsureData(data) {
    if (!data.familySchedule || typeof data.familySchedule !== "object") {
        data.familySchedule = {};
    }

    const family = data.familySchedule;

    if (!Array.isArray(family.members)) family.members = [];
    if (!Array.isArray(family.events)) family.events = [];
    if (!Array.isArray(family.rules)) family.rules = [];
    if (!Array.isArray(family.exceptions)) family.exceptions = [];

    return family;
}

function plannerFamilyNewId() {
    return "family-" +
        Date.now().toString(36) + "-" +
        Math.random().toString(36).slice(2, 9);
}

function plannerFamilyDateIsValid(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;
}

function plannerFamilyTimeIsValid(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");
}

function plannerFamilyAddDays(dateString, amount) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    date.setUTCDate(date.getUTCDate() + amount);

    return [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, "0"),
        String(date.getUTCDate()).padStart(2, "0")
    ].join("-");
}

function plannerFamilyWeekday(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function plannerFamilyToday() {
    const now = new Date();

    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");
}

function plannerFamilyAskDate(message, defaultValue) {
    const value = prompt(message, defaultValue || "");

    if (value === null) return null;

    const result = value.trim();

    if (!plannerFamilyDateIsValid(result)) {
        alert("日付は YYYY-MM-DD 形式で正しく入力してください。");
        return undefined;
    }

    return result;
}

function plannerFamilyAskTime(message, defaultValue) {
    const value = prompt(message, defaultValue || "09:00");

    if (value === null) return null;

    const result = value.trim();

    if (!plannerFamilyTimeIsValid(result)) {
        alert("時刻は HH:MM 形式で入力してください。");
        return undefined;
    }

    return result;
}

function plannerFamilyAskTitle(message, defaultValue, maxLength = 5) {
    const value = prompt(message, defaultValue || "");

    if (value === null) return null;

    const result = value.trim();

    if (!result || [...result].length > maxLength) {
        alert(`名前は1〜${maxLength}文字で入力してください。`);
        return undefined;
    }

    return result;
}

function plannerFamilyGetSelectedDate() {
    if (
        typeof selectedCalendarDate !== "undefined" &&
        plannerFamilyDateIsValid(selectedCalendarDate)
    ) {
        return selectedCalendarDate;
    }

    const stored = localStorage.getItem("oshi_last_planner_date");

    if (plannerFamilyDateIsValid(stored)) return stored;

    return plannerFamilyToday();
}

function plannerFamilyGetMember(memberId) {
    const data = db.load();
    const family = plannerFamilyEnsureData(data);

    return family.members.find(member => member.id === memberId) || null;
}

function plannerFamilySave(data) {
    db.save(data);
}

/* =====================================================
   画面共通
===================================================== */

function plannerFamilyCreateScreen(id, zIndex) {
    let screen = document.getElementById(id);

    if (screen) return screen;

    screen = document.createElement("section");
    screen.id = id;
    screen.className = "planner-family-screen";
    screen.style.zIndex = String(zIndex);
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");

    document.body.appendChild(screen);

    return screen;
}

function plannerFamilyMakeButton(label, handler, className = "") {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;

    if (className) button.className = className;

    button.addEventListener("click", handler);

    return button;
}

function plannerFamilyMakeHeader(backLabel, backHandler, title) {
    const header = document.createElement("div");
    header.className = "planner-family-header";

    header.appendChild(
        plannerFamilyMakeButton(backLabel, backHandler)
    );

    const heading = document.createElement("h2");
    heading.textContent = title;

    header.appendChild(heading);

    return header;
}

/* =====================================================
   家族管理画面
===================================================== */


function closePlannerFamily() {
    const screen = document.getElementById("plannerFamilyScreen");

    if (screen) screen.style.display = "none";
}



function plannerFamilyToggleMember(memberId) {
    const data = db.load();
    const family = plannerFamilyEnsureData(data);
    const member = family.members.find(item => item.id === memberId);

    if (!member) return;

    member.enabled = !member.enabled;

    plannerFamilySave(data);
    plannerFamilyRenderMembers();
    plannerFamilyRenderLanes();
}


function plannerFamilyDeleteMember(memberId) {
    if (!confirm(
        "この家族メンバーを削除しますか？\nこのメンバーの予定・繰り返し設定・例外も削除されます。"
    )) {
        return;
    }

    const data = db.load();
    const family = plannerFamilyEnsureData(data);

    family.members = family.members.filter(
        member => member.id !== memberId
    );

    family.events = family.events.filter(
        event => event.memberId !== memberId
    );

    family.rules = family.rules.filter(
        rule => rule.memberId !== memberId
    );

    family.exceptions = family.exceptions.filter(
        exception => exception.memberId !== memberId
    );

    plannerFamilySave(data);
    plannerFamilyRenderMembers();
    plannerFamilyRenderLanes();

    const screen = document.getElementById("plannerFamilyMemberScreen");

    if (screen && screen.dataset.memberId === memberId) {
        screen.style.display = "none";
    }
}

/* =====================================================
   家族メンバー別の予定管理画面
===================================================== */


function plannerFamilyOpenMember(memberId) {
    if (!plannerFamilyIsAllowed()) {
        alert("家族スケジュールはプレミアム以上で利用できます。");
        return;
    }

    const member = plannerFamilyGetMember(memberId);
    if (!member) return;

    const screen = plannerFamilyCreateScreen(
        "plannerFamilyMemberScreen",
        10001
    );

    screen.dataset.memberId = memberId;
    screen.replaceChildren();

    // タイトル行：左にタイトル、右端に ＋・🔁・×
    const header = document.createElement("div");
    header.className = "planner-family-header";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.width = "100%";
    header.style.boxSizing = "border-box";
    header.style.gap = "8px";

    const heading = document.createElement("h2");
    heading.textContent =
        `${member.icon || "🧒"} ${member.name}の予定`;
    heading.style.margin = "0";
    heading.style.flex = "1";
    heading.style.minWidth = "0";

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.alignItems = "center";
    actions.style.gap = "8px";
    actions.style.flexShrink = "0";

    // ＋：単発予定を追加
    const addEventButton = plannerFamilyMakeButton(
        "＋",
        () => plannerFamilyAddEvent(memberId)
    );
    addEventButton.title = "単発予定を追加";
    addEventButton.setAttribute("aria-label", "単発予定を追加");

    // 🔁：繰り返し予定を追加
    const addRuleButton = plannerFamilyMakeButton(
        "🔁",
        () => plannerFamilyAddRule(memberId)
    );
    addRuleButton.title = "繰り返し予定を追加";
    addRuleButton.setAttribute("aria-label", "繰り返し予定を追加");

    // ×：スケジュール画面に戻る
    const closeButton = plannerFamilyMakeButton(
        "✕",
        plannerFamilyCloseMember,
        "planner-family-modal-close"
    );
    closeButton.title = "スケジュール画面に戻る";
    closeButton.setAttribute(
        "aria-label",
        "スケジュール画面に戻る"
    );

    actions.append(addEventButton, addRuleButton, closeButton);
    header.append(heading, actions);
    screen.appendChild(header);


const list = document.createElement("div");
list.id = "plannerFamilyMemberEvents";
screen.appendChild(list);

// 期間を指定して一括削除
const bulkDeleteButton = plannerFamilyMakeButton(
    "🗑️ 期間を指定して一括削除",
    plannerFamilyOpenBulkDelete
);
bulkDeleteButton.className = "planner-family-bulk-delete-button";
screen.appendChild(bulkDeleteButton);

    screen.style.display = "block";

    plannerFamilyRenderEvents(memberId);
}




function plannerFamilyCloseMember() {
    const screen = document.getElementById("plannerFamilyMemberScreen");

    if (screen) screen.style.display = "none";
}


function plannerFamilyRenderEvents(memberId) {
    const screen = document.getElementById("plannerFamilyMemberScreen");
    const list = document.getElementById("plannerFamilyMemberEvents");

    if (!screen || !list) return;

    const data = db.load();
    const family = plannerFamilyEnsureData(data);

    // 単発予定：日付の新しい順で最大20件を表示
    const events = family.events
        .filter(event => event.memberId === memberId)
        .sort((a, b) => {
            const dateOrder = String(b.date).localeCompare(String(a.date));
            return dateOrder || String(b.startTime).localeCompare(String(a.startTime));
        })
        .slice(0, 20)
        .map(event => ({
            date: event.date,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            kind: "単発",
            eventId: event.id,
            sortDate: event.date
        }));

    // 繰り返し予定：開始日の新しい順で最大10種類を表示
    const rules = family.rules
        .filter(rule => rule.memberId === memberId)
        .sort((a, b) => {
            const dateOrder = String(b.startDate).localeCompare(String(a.startDate));
            return dateOrder || String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
        })
        .slice(0, 10)
        .map(rule => ({
            date: `${rule.startDate} ～ ${rule.endDate}`,
            title: rule.title,
            startTime: rule.startTime,
            endTime: rule.endTime,
            kind: "繰り返し",
            ruleId: rule.id,
            weekdays: rule.weekdays,
            sortDate: rule.startDate
        }));

    const all = [...events, ...rules].sort((a, b) =>
        String(b.sortDate).localeCompare(String(a.sortDate))
    );

    list.replaceChildren();

    if (all.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "登録された予定はありません。";
        list.appendChild(empty);
        return;
    }

    all.forEach(event => {
        const row = document.createElement("div");
        row.className = "planner-family-member";

        const details = document.createElement("div");
        details.className = "planner-family-event-details";

        const title = document.createElement("strong");
        title.textContent = event.title;

        const time = document.createElement("div");
        time.textContent =
            `${event.date}　${event.startTime}〜${event.endTime}`;

        const kind = document.createElement("small");
        kind.textContent = event.kind;

        details.append(title, time, kind);

        const actions = document.createElement("div");
        actions.className = "planner-family-member-actions";

        const edit = plannerFamilyMakeButton(
            "✏️",
            () => {
                if (event.kind === "単発") {
                    plannerFamilyEditEvent(event.eventId);
                } else {
                    plannerFamilyEditRule(event.ruleId);
                }
            },
            "planner-family-icon-button"
        );
        edit.title = "編集";
        edit.setAttribute("aria-label", "編集");

        const remove = plannerFamilyMakeButton(
            "🗑️",
            () => {
                if (event.kind === "単発") {
                    plannerFamilyDeleteEvent(event.eventId);
                } else {
                    plannerFamilyDeleteRule(event.ruleId);
                }
            },
            "planner-family-icon-button"
        );
        remove.title = "削除";
        remove.setAttribute("aria-label", "削除");

        actions.append(edit, remove);
        row.append(details, actions);
        list.appendChild(row);
    });

    // 上限を超えた予定は削除せず、表示件数だけを制限する
    const counts = document.createElement("small");
    counts.className = "planner-family-event-history-note";
    counts.textContent =
        `表示：単発 ${events.length}/20件・繰り返し ${rules.length}/10種類`;
    list.appendChild(counts);
}





/* =====================================================
   単発予定
===================================================== */


function plannerFamilyEditEvent(eventId) {
    const data = db.load();
    const family = plannerFamilyEnsureData(data);
    const event = family.events.find(item => item.id === eventId);

    if (!event) return;

    const date = plannerFamilyAskDate(
        "日付（YYYY-MM-DD）",
        event.date
    );

    if (date === null || date === undefined) return;

    const title = plannerFamilyAskTitle(
        "予定名（1〜5文字）",
        event.title,
        5
    );

    if (title === null || title === undefined) return;

    const startTime = plannerFamilyAskTime(
        "開始時刻（HH:MM）",
        event.startTime
    );

    if (startTime === null || startTime === undefined) return;

    const endTime = plannerFamilyAskTime(
        "終了時刻（HH:MM）",
        event.endTime
    );

    if (endTime === null || endTime === undefined) return;

    if (endTime <= startTime) {
        alert("終了時刻は開始時刻より後にしてください。");
        return;
    }

    event.date = date;
    event.title = title;
    event.startTime = startTime;
    event.endTime = endTime;

    plannerFamilySave(data);
    plannerFamilyRenderEvents(event.memberId);
    plannerFamilyRenderLanes();
}

function plannerFamilyDeleteEvent(eventId) {
    const data = db.load();
    const family = plannerFamilyEnsureData(data);
    const event = family.events.find(item => item.id === eventId);

    if (!event) return;

    if (!confirm(`「${event.title}」を削除しますか？`)) return;

    family.events = family.events.filter(item => item.id !== eventId);

    plannerFamilySave(data);
    plannerFamilyRenderEvents(event.memberId);
    plannerFamilyRenderLanes();
}

/* =====================================================
   繰り返し予定
   曜日：0=日、1=月、2=火、3=水、4=木、5=金、6=土
===================================================== */

function plannerFamilyAskWeekdays(defaultValue) {
    const value = prompt(
        "曜日を数字で入力してください。\n日=0 月=1 火=2 水=3 木=4 金=5 土=6\n複数指定はカンマ区切り（例：1,5）",
        defaultValue || "1,5"
    );

    if (value === null) return null;

    const weekdays = [...new Set(
        value.split(",")
            .map(item => item.trim())
            .filter(Boolean)
            .map(Number)
    )].sort((a, b) => a - b);

    if (
        weekdays.length === 0 ||
        weekdays.some(day => !Number.isInteger(day) || day < 0 || day > 6)
    ) {
        alert("曜日は0〜6の数字で入力してください。例：1,5");
        return undefined;
    }

    return weekdays;
}


function plannerFamilyEditRule(ruleId) {
    const data = db.load();
    const family = plannerFamilyEnsureData(data);
    const rule = family.rules.find(item => item.id === ruleId);

    if (!rule) return;

    const effectiveFrom = plannerFamilyAskDate(
        "変更を適用する日付（この日より前の予定は保持されます）",
        plannerFamilyToday()
    );

    if (effectiveFrom === null || effectiveFrom === undefined) return;

    const title = plannerFamilyAskTitle(
        "新しい予定名（1〜5文字）",
        rule.title,
        5
    );

    if (title === null || title === undefined) return;

    const weekdays = plannerFamilyAskWeekdays(
        rule.weekdays.join(",")
    );

    if (weekdays === null || weekdays === undefined) return;

    const startTime = plannerFamilyAskTime(
        "新しい開始時刻（HH:MM）",
        rule.startTime
    );

    if (startTime === null || startTime === undefined) return;

    const endTime = plannerFamilyAskTime(
        "新しい終了時刻（HH:MM）",
        rule.endTime
    );

    if (endTime === null || endTime === undefined) return;

    if (endTime <= startTime) {
        alert("終了時刻は開始時刻より後にしてください。");
        return;
    }

    const endDate = plannerFamilyAskDate(
        "新しい繰り返し終了日（YYYY-MM-DD）",
        rule.endDate
    );

    if (endDate === null || endDate === undefined) return;

    if (endDate < effectiveFrom) {
        alert("終了日は変更適用日以降にしてください。");
        return;
    }

    /*
     * 元ルールは変更適用日の前日まで残す。
     * 変更適用日以降は新ルールで表示する。
     */
    if (effectiveFrom <= rule.startDate) {
        family.rules = family.rules.filter(item => item.id !== rule.id);
    } else {
        const previousDate = plannerFamilyAddDays(effectiveFrom, -1);

        if (previousDate < rule.endDate) {
            rule.endDate = previousDate;
        }
    }

    family.rules.push({
        id: plannerFamilyNewId(),
        memberId: rule.memberId,
        title,
        weekdays,
        startDate: effectiveFrom,
        endDate,
        startTime,
        endTime,
        createdAt: plannerFamilyToday()
    });

    plannerFamilySave(data);
    plannerFamilyRenderEvents(rule.memberId);
    plannerFamilyRenderLanes();
}

function plannerFamilyDeleteRule(ruleId) {
    const data = db.load();
    const family = plannerFamilyEnsureData(data);
    const rule = family.rules.find(item => item.id === ruleId);

    if (!rule) return;

    const effectiveFrom = plannerFamilyAskDate(
        "繰り返しを終了する日付を入力してください。\nこの日より前の予定は保持されます。",
        plannerFamilyToday()
    );

    if (effectiveFrom === null || effectiveFrom === undefined) return;

    if (!confirm(
        `「${rule.title}」の繰り返しを ${effectiveFrom} から終了しますか？`
    )) {
        return;
    }

    if (effectiveFrom <= rule.startDate) {
        family.rules = family.rules.filter(item => item.id !== rule.id);
    } else {
        rule.endDate = plannerFamilyAddDays(effectiveFrom, -1);
    }

    plannerFamilySave(data);
    plannerFamilyRenderEvents(rule.memberId);
    plannerFamilyRenderLanes();
}

/* =====================================================
   特定日だけの例外
===================================================== */

function plannerFamilySkipOccurrence(ruleId, date) {
    const data = db.load();
    const family = plannerFamilyEnsureData(data);
    const rule = family.rules.find(item => item.id === ruleId);

    if (!rule) return;

    const exists = family.exceptions.some(exception =>
        exception.ruleId === ruleId &&
        exception.date === date &&
        exception.action === "skip"
    );

    if (!exists) {
        family.exceptions.push({
            id: plannerFamilyNewId(),
            ruleId,
            memberId: rule.memberId,
            date,
            action: "skip"
        });
    }

    plannerFamilySave(data);
    plannerFamilyRenderEvents(rule.memberId);
    plannerFamilyRenderLanes();
}

/* =====================================================
   指定日の家族予定を取得
===================================================== */


function plannerFamilyGetEventsForDate(memberId, date) {
    const data = db.load();
    const family = plannerFamilyEnsureData(data);
    const events = [];

    function addSegment(item, originalDate, startTime, endTime, sourceType) {
        events.push({
            ...item,
            date: originalDate,
            displayDate: date,
            displayStartTime: startTime,
            displayEndTime: endTime,
            sourceType
        });
    }

    // 単発予定：当日分と前日からの日跨ぎ分
    family.events.forEach(event => {
        if (event.memberId !== memberId) return;

        const crossesMidnight = event.endTime <= event.startTime;
        const nextDate = plannerFamilyAddDays(event.date, 1);

        if (event.date === date) {
            addSegment(
                {
                    id: event.id,
                    memberId,
                    title: event.title,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    eventId: event.id
                },
                event.date,
                event.startTime,
                crossesMidnight ? "24:00" : event.endTime,
                "event"
            );
        }

        if (crossesMidnight && nextDate === date) {
            addSegment(
                {
                    id: event.id + "-continuation",
                    memberId,
                    title: event.title,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    eventId: event.id
                },
                event.date,
                "00:00",
                event.endTime,
                "event"
            );
        }
    });

    // 繰り返し予定：当日分と前日からの日跨ぎ分
    family.rules.forEach(rule => {
        if (rule.memberId !== memberId) return;

        const crossesMidnight = rule.endTime <= rule.startTime;

        function addRuleOccurrence(occurrenceDate, segmentStart, segmentEnd) {
            if (
                occurrenceDate < rule.startDate ||
                occurrenceDate > rule.endDate
            ) {
                return;
            }

            if (!rule.weekdays.includes(
                plannerFamilyWeekday(occurrenceDate)
            )) {
                return;
            }

            const skipped = family.exceptions.some(exception =>
                exception.ruleId === rule.id &&
                exception.date === occurrenceDate &&
                exception.action === "skip"
            );

            if (skipped) return;

            addSegment(
                {
                    id: `${rule.id}-${occurrenceDate}`,
                    memberId,
                    title: rule.title,
                    startTime: rule.startTime,
                    endTime: rule.endTime,
                    ruleId: rule.id
                },
                occurrenceDate,
                segmentStart,
                segmentEnd,
                "rule"
            );
        }

        if (date >= rule.startDate && date <= rule.endDate) {
            addRuleOccurrence(
                date,
                rule.startTime,
                crossesMidnight ? "24:00" : rule.endTime
            );
        }

        const previousDate = plannerFamilyAddDays(date, -1);

        if (crossesMidnight) {
            addRuleOccurrence(previousDate, "00:00", rule.endTime);
        }
    });

    return events;
}




/* =====================================================
   家族予定の詳細
===================================================== */

function plannerFamilyShowEventDetail(event) {
    const member = plannerFamilyGetMember(event.memberId);

    if (!member) return;

    const screen = plannerFamilyCreateScreen(
        "plannerFamilyDetailScreen",
        10002
    );

    screen.replaceChildren();

    screen.appendChild(
        plannerFamilyMakeHeader(
            "← 閉じる",
            () => {
                screen.style.display = "none";
            },
            "家族の予定"
        )
    );

    const detail = document.createElement("div");
    detail.className = "planner-family-detail";

    const title = document.createElement("h3");
    title.textContent = event.title;

    const memberName = document.createElement("p");
    memberName.textContent =
        `${member.icon || "🧒"} ${member.name}`;

    const date = document.createElement("p");
    date.textContent = event.date;

    const time = document.createElement("p");
    time.textContent =
        `${event.startTime}〜${event.endTime}`;

    const type = document.createElement("p");
    type.textContent =
        event.sourceType === "rule" ? "繰り返し予定" : "単発予定";

    detail.append(title, memberName, date, time, type);
    screen.appendChild(detail);

    if (event.sourceType === "event") {
        screen.appendChild(
            plannerFamilyMakeButton(
                "編集",
                () => {
                    screen.style.display = "none";
                    plannerFamilyEditEvent(event.eventId);
                }
            )
        );

        screen.appendChild(
            plannerFamilyMakeButton(
                "削除",
                () => {
                    screen.style.display = "none";
                    plannerFamilyDeleteEvent(event.eventId);
                }
            )
        );
    } else {
        screen.appendChild(
            plannerFamilyMakeButton(
                "繰り返し設定を変更",
                () => {
                    screen.style.display = "none";
                    plannerFamilyEditRule(event.ruleId);
                }
            )
        );

        screen.appendChild(
            plannerFamilyMakeButton(
                "この日だけ取り消す",
                () => {
                    if (!confirm(
                        `${event.date} の「${event.title}」だけを取り消しますか？`
                    )) {
                        return;
                    }

                    screen.style.display = "none";
                    plannerFamilySkipOccurrence(
                        event.ruleId,
                        event.date
                    );
                }
            )
        );

        screen.appendChild(
            plannerFamilyMakeButton(
                "この日以降の繰り返しを終了",
                () => {
                    screen.style.display = "none";
                    plannerFamilyDeleteRule(event.ruleId);
                }
            )
        );
    }

    screen.style.display = "block";
}



/* =====================================================
   家族スケジュール改善
   ・入力を1つのモーダルに集約
   ・家族管理をアイコン操作に変更
   ・レーン見出しと時間軸を位置合わせ
   ・予定名を棒線とは別の要素で描画
===================================================== */

function plannerFamilyOpenFormModal({
    title,
    fields,
    submitLabel = "保存",
    onSubmit
}) {
    document.getElementById("plannerFamilyFormModal")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "plannerFamilyFormModal";
    overlay.className = "planner-family-form-overlay";

    const modal = document.createElement("form");
    modal.className = "planner-family-form-modal";

    const heading = document.createElement("h2");
    heading.textContent = title;

    const close = document.createElement("button");
    close.type = "button";
    close.className = "planner-family-modal-close";
    close.textContent = "✕";
    close.setAttribute("aria-label", "閉じる");
    close.addEventListener("click", () => overlay.remove());

    const top = document.createElement("div");
    top.className = "planner-family-modal-top";
    top.append(heading, close);

    const fieldMap = {};

    fields.forEach(field => {
        const label = document.createElement("label");
        label.className = "planner-family-form-field";
        label.textContent = field.label;

        let input;

        if (field.type === "checkboxes") {
            input = document.createElement("div");
            input.className = "planner-family-weekdays";

            const weekdayNames = ["日", "月", "火", "水", "木", "金", "土"];

            weekdayNames.forEach((day, index) => {
                const item = document.createElement("label");
                item.className = "planner-family-weekday";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = String(index);
                checkbox.checked = (field.value || []).includes(index);

                const text = document.createElement("span");
                text.textContent = day;

                item.append(checkbox, text);
                input.appendChild(item);
            });
        } else {
            input = document.createElement("input");
            input.type = field.type || "text";
            input.value = field.value ?? "";

            if (field.placeholder) input.placeholder = field.placeholder;
            if (field.maxLength) input.maxLength = field.maxLength;
            if (field.required !== false) input.required = true;

            if (field.type === "date") {
                input.min = field.min || "";
                input.max = field.max || "";
            }

            if (field.type === "time") {
                input.step = "300";
            }
        }

        if (field.help) {
            const help = document.createElement("small");
            help.className = "planner-family-form-help";
            help.textContent = field.help;
            label.appendChild(help);
        }

        label.appendChild(input);
        modal.appendChild(label);
        fieldMap[field.name] = { input, field };
    });

    const actions = document.createElement("div");
    actions.className = "planner-family-modal-actions";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "キャンセル";
    cancel.addEventListener("click", () => overlay.remove());

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = submitLabel;
    submit.className = "planner-family-modal-submit";

    actions.append(cancel, submit);
    modal.appendChild(actions);

    modal.addEventListener("submit", event => {
        event.preventDefault();

        const values = {};

        for (const [name, entry] of Object.entries(fieldMap)) {
            if (entry.field.type === "checkboxes") {
                values[name] = [
                    ...entry.input.querySelectorAll("input:checked")
                ].map(input => Number(input.value));
            } else {
                values[name] = entry.input.value.trim();
            }
        }

        if (onSubmit(values) !== false) {
            overlay.remove();
        }
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay) overlay.remove();
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const firstInput = modal.querySelector(
        'input:not([type="checkbox"])'
    );

    firstInput?.focus();

    return overlay;
}

/* ---------- 家族管理：アイコン操作 ---------- */

function plannerFamilyRenderMembers() {
    const screen = document.getElementById("plannerFamilyScreen");
    const list = document.getElementById("plannerFamilyMemberList");

    if (!screen || !list) return;

    const data = db.load();
    const family = plannerFamilyEnsureData(data);

    list.replaceChildren();

    if (!family.members.length) {
        const empty = document.createElement("p");
        empty.textContent = "家族メンバーはまだ登録されていません。";
        list.appendChild(empty);
    }

    family.members.forEach(member => {
        const row = document.createElement("div");
        row.className = "planner-family-member";

        /* アイコンと名前：表示のみ */
        const identity = document.createElement("div");
        identity.className = "planner-family-member-identity";

        const icon = document.createElement("span");
        icon.className = "planner-family-member-icon";
        icon.textContent = member.icon || "🧒";

        const name = document.createElement("span");
        name.className = "planner-family-member-name";
        name.textContent = member.name || "";

        identity.append(icon, name);

        /* 操作ボタン：削除 → 編集 → ON/OFF */
        const actions = document.createElement("div");
        actions.className = "planner-family-member-actions";

        const remove = plannerFamilyMakeButton(
            "🗑️",
            () => plannerFamilyDeleteMember(member.id),
            "planner-family-icon-button"
        );
        remove.title = "削除";
        remove.setAttribute("aria-label", "削除");

        const edit = plannerFamilyMakeButton(
            "✏️",
            () => plannerFamilyEditMember(member.id),
            "planner-family-icon-button"
        );
        edit.title = "編集";
        edit.setAttribute("aria-label", "編集");

        const toggle = plannerFamilyMakeButton(
            member.enabled ? "🔵" : "⚪",
            () => plannerFamilyToggleMember(member.id),
            "planner-family-icon-button"
        );
        toggle.title = member.enabled ? "表示をOFF" : "表示をON";
        toggle.setAttribute("aria-label", toggle.title);
        toggle.setAttribute("aria-pressed", String(!!member.enabled));

        actions.append(remove, edit, toggle);
        row.append(identity, actions);
        list.appendChild(row);
    });

    const addButton = screen.querySelector(
        ".planner-family-add-button"
    );

    if (addButton) {
        addButton.disabled =
            family.members.length >= PLANNER_FAMILY_MAX_MEMBERS;
    }
}


function openPlannerFamily() {
    if (!plannerFamilyIsAllowed()) {
        alert("家族スケジュールはプレミアム以上で利用できます。");
        return;
    }

    const screen = plannerFamilyCreateScreen(
        "plannerFamilyScreen",
        10000
    );

    screen.replaceChildren();

    /* タイトル行：左にタイトル、右に閉じるボタン */
    const header = document.createElement("div");
    header.className = "planner-family-header";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.width = "100%";
    header.style.boxSizing = "border-box";

    const heading = document.createElement("h2");
    heading.textContent = "家族の管理";
    heading.style.margin = "0";

    const closeButton = plannerFamilyMakeButton(
        "✕",
        closePlannerFamily,
        "planner-family-modal-close"
    );
    closeButton.setAttribute("aria-label", "スケジュール画面に戻る");
    closeButton.title = "スケジュール画面に戻る";

    header.append(heading, closeButton);

    const description = document.createElement("p");
    description.textContent = "家族の名前・アイコンと表示設定を管理できます。";

    const list = document.createElement("div");
    list.id = "plannerFamilyMemberList";

    /* 家族の追加は従来どおり残す */
    const addButton = plannerFamilyMakeButton(
        "＋ 家族を追加",
        plannerFamilyAddMember
    );
    addButton.classList.add("planner-family-add-button");

    screen.append(header, description, list, addButton);
    screen.style.display = "block";

    plannerFamilyRenderMembers();
}


function plannerFamilyAddMember() {
    if (!plannerFamilyIsAllowed()) return;

    const data = db.load();
    const family = plannerFamilyEnsureData(data);

    if (family.members.length >= PLANNER_FAMILY_MAX_MEMBERS) {
        alert("家族メンバーは4人まで登録できます（自分を除く）。");
        return;
    }

    plannerFamilyOpenFormModal({
        title: "家族を追加",
        fields: [
            {
                name: "name",
                label: "名前（1〜3文字）",
                type: "text",
                maxLength: 3,
                value: "",
                placeholder: "例：太郎"
            },
            {
                name: "icon",
                label: "アイコン",
                type: "text",
                value: "🧒",
                placeholder: "例：👧"
            }
        ],
        onSubmit(values) {
            if (!values.name || [...values.name].length > 3) {
                alert("名前は1〜3文字で入力してください。");
                return false;
            }

            if (!values.icon) {
                alert("アイコンを入力してください。");
                return false;
            }

            const latest = db.load();
            const latestFamily = plannerFamilyEnsureData(latest);

            if (latestFamily.members.length >= PLANNER_FAMILY_MAX_MEMBERS) {
                alert("家族メンバーは4人まで登録できます。");
                return false;
            }

            latestFamily.members.push({
                id: plannerFamilyNewId(),
                name: values.name,
                icon: values.icon,
                enabled: true
            });

            plannerFamilySave(latest);
            plannerFamilyRenderMembers();
            plannerFamilyRenderLanes();
        }
    });
}

function plannerFamilyEditMember(memberId) {
    const member = plannerFamilyGetMember(memberId);
    if (!member) return;

    plannerFamilyOpenFormModal({
        title: "家族情報を編集",
        fields: [
            {
                name: "name",
                label: "名前（1〜3文字）",
                type: "text",
                maxLength: 3,
                value: member.name
            },
            {
                name: "icon",
                label: "アイコン",
                type: "text",
                value: member.icon || "🧒"
            }
        ],
        onSubmit(values) {
            if (!values.name || [...values.name].length > 3) {
                alert("名前は1〜3文字で入力してください。");
                return false;
            }

            if (!values.icon) {
                alert("アイコンを入力してください。");
                return false;
            }

            const data = db.load();
            const family = plannerFamilyEnsureData(data);
            const target = family.members.find(item => item.id === memberId);

            if (!target) return;

            target.name = values.name;
            target.icon = values.icon;

            plannerFamilySave(data);
            plannerFamilyRenderMembers();
            plannerFamilyRenderLanes();
        }
    });
}

/* ---------- 単発予定：一つのモーダルで入力 ---------- */

function plannerFamilyAddEvent(memberId) {
    const member = plannerFamilyGetMember(memberId);
    if (!member || !plannerFamilyIsAllowed()) return;

    plannerFamilyOpenFormModal({
        title: `${member.icon || "🧒"} ${member.name}：予定追加`,
        fields: [
            {
                name: "date",
                label: "日付",
                type: "date",
                value: plannerFamilyGetSelectedDate()
            },
            {
                name: "title",
                label: "予定名（1〜5文字）",
                type: "text",
                maxLength: 5,
                value: "",
                placeholder: "例：ピアノ"
            },
            {
                name: "startTime",
                label: "開始時刻",
                type: "time",
                value: "17:00"
            },
            {
                name: "endTime",
                label: "終了時刻",
                type: "time",
                value: "18:30"
            }
        ],
        onSubmit(values) {
            if (!plannerFamilyDateIsValid(values.date)) {
                alert("日付を正しく入力してください。");
                return false;
            }

            if (!values.title || [...values.title].length > 5) {
                alert("予定名は1〜5文字で入力してください。");
                return false;
            }

            if (
                !plannerFamilyTimeIsValid(values.startTime) ||
                !plannerFamilyTimeIsValid(values.endTime) ||
                values.endTime <= values.startTime
            ) {
                alert("開始・終了時刻を正しく入力してください。");
                return false;
            }

            const data = db.load();
            const family = plannerFamilyEnsureData(data);

            family.events.push({
                id: plannerFamilyNewId(),
                memberId,
                date: values.date,
                title: values.title,
                startTime: values.startTime,
                endTime: values.endTime
            });

            plannerFamilySave(data);
            plannerFamilyRenderEvents(memberId);
            plannerFamilyRenderLanes();
        }
    });
}

/* ---------- 繰り返し予定：曜日も同じ画面で入力 ---------- */

function plannerFamilyAddRule(memberId) {
    const member = plannerFamilyGetMember(memberId);
    if (!member || !plannerFamilyIsAllowed()) return;

    plannerFamilyOpenFormModal({
        title: `${member.icon || "🧒"} ${member.name}：繰り返し予定`,
        fields: [
            {
                name: "startDate",
                label: "開始日",
                type: "date",
                value: plannerFamilyGetSelectedDate()
            },
            {
                name: "endDate",
                label: "終了日",
                type: "date",
                value: `${plannerFamilyGetSelectedDate().slice(0, 4)}-12-31`
            },
            {
                name: "weekdays",
                label: "繰り返す曜日",
                type: "checkboxes",
                value: [1, 5],
                help: "複数の曜日を選択できます。"
            },
            {
                name: "title",
                label: "予定名（1〜5文字）",
                type: "text",
                maxLength: 5,
                value: "",
                placeholder: "例：ピアノ"
            },
            {
                name: "startTime",
                label: "開始時刻",
                type: "time",
                value: "17:00"
            },
            {
                name: "endTime",
                label: "終了時刻",
                type: "time",
                value: "18:30"
            }
        ],
        onSubmit(values) {
            if (
                !plannerFamilyDateIsValid(values.startDate) ||
                !plannerFamilyDateIsValid(values.endDate) ||
                values.endDate < values.startDate
            ) {
                alert("開始日と終了日を正しく入力してください。");
                return false;
            }

            if (!values.weekdays.length) {
                alert("繰り返す曜日を1つ以上選んでください。");
                return false;
            }

            if (!values.title || [...values.title].length > 5) {
                alert("予定名は1〜5文字で入力してください。");
                return false;
            }

            if (
                !plannerFamilyTimeIsValid(values.startTime) ||
                !plannerFamilyTimeIsValid(values.endTime) ||
                values.endTime <= values.startTime
            ) {
                alert("開始・終了時刻を正しく入力してください。");
                return false;
            }

            const data = db.load();
            const family = plannerFamilyEnsureData(data);

            family.rules.push({
                id: plannerFamilyNewId(),
                memberId,
                title: values.title,
                weekdays: values.weekdays,
                startDate: values.startDate,
                endDate: values.endDate,
                startTime: values.startTime,
                endTime: values.endTime,
                createdAt: plannerFamilyToday()
            });

            plannerFamilySave(data);
            plannerFamilyRenderEvents(memberId);
            plannerFamilyRenderLanes();
        }
    });
}

/* ---------- レーン位置と予定表示の修正 ---------- */


function plannerFamilyRenderLanes() {
    const timeline = document.getElementById("plannerTimeline");
    if (!timeline) return;

    const layout = timeline.querySelector(".planner-layout");
    const board = layout?.querySelector(".planner-board");

    if (!layout || !board) return;

    layout.querySelector(".planner-family-lanes")?.remove();

    const HEADER_HEIGHT = 66;

    // 家族レーンがないときは、追加した上部スペースを解除
    layout.style.paddingTop = "0px";

    if (!plannerFamilyIsAllowed()) return;

    const data = db.load();
    const family = plannerFamilyEnsureData(data);
    const members = family.members.filter(member => member.enabled);

    if (!members.length) return;

    const date = plannerFamilyGetSelectedDate();

    const laneWidth = window.matchMedia("(max-width: 480px)").matches
        ? 46
        : 54;

    // 時間軸と予定ボードを一緒に下げ、上部にヘッダー用の空間を作る
    layout.style.paddingTop = `${HEADER_HEIGHT}px`;


const lanes = document.createElement("div");
lanes.className = "planner-family-lanes";

// 25:00の横ラインまで表示できる高さを確保
const laneHeight = Math.max(
    board.offsetHeight,
    PLANNER_FAMILY_TOP_OFFSET +
        (25 * 60 / 30) * PLANNER_FAMILY_PIXELS_PER_30_MINUTES + 1
);

lanes.style.height = `${laneHeight}px`;

    
    members.forEach(member => {
        const lane = document.createElement("div");
        lane.className = "planner-family-lane";
        lane.dataset.memberId = member.id;
        lane.style.flexBasis = `${laneWidth}px`;
        lane.style.width = `${laneWidth}px`;
        lane.style.height = `${laneHeight}px`;

        // アイコン・名前を各レーン自身の中に配置
        const header = document.createElement("div");
        header.className = "planner-family-lane-header";

        const nameButton = document.createElement("button");
        nameButton.type = "button";
        nameButton.className = "planner-family-lane-name-button";

        const icon = document.createElement("span");
        icon.className = "planner-family-lane-icon";
        icon.textContent = member.icon || "🧒";

        const name = document.createElement("span");
        name.className = "planner-family-lane-name";
        name.textContent = member.name || "";

        nameButton.append(icon, name);
        nameButton.addEventListener("click", () => {
            plannerFamilyOpenMember(member.id);
        });

        header.appendChild(nameButton);


        // 予定を描画する領域は、これまでの時間軸の位置に維持
const eventLayer = document.createElement("div");
eventLayer.className = "planner-family-lane-events";

// 個人予定と同じ時間線を家族レーンにも描画
// 00:00の上端にも横線を追加
const topLine = document.createElement("div");
topLine.className = "planner-line planner-line-major";
topLine.style.top = "0px";
eventLayer.appendChild(topLine);

for (let i = 0; i <= 50; i++) {
    const line = document.createElement("div");

    line.className =
        `planner-line ${i % 2 === 0
            ? "planner-line-major"
            : "planner-line-minor"}`;

    line.style.top = `${15 + i * 40}px`;

    eventLayer.appendChild(line);
}


// 家族の予定は時間線の上に描画
plannerFamilyGetEventsForDate(member.id, date).forEach(event => {
    plannerFamilyDrawEvent(eventLayer, event);
});



        lane.append(header, eventLayer);
        lanes.appendChild(lane);
    });

    board.insertAdjacentElement("afterend", lanes);
}




function plannerFamilyDrawEvent(lane, event) {
    const startValue = event.displayStartTime || event.startTime;
    const endValue = event.displayEndTime || event.endTime;

    const [startHour, startMinute] = startValue.split(":").map(Number);
    const [endHour, endMinute] = endValue.split(":").map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (end <= start) return;

    const scale = PLANNER_FAMILY_PIXELS_PER_30_MINUTES / 30;
    const top = PLANNER_FAMILY_TOP_OFFSET + start * scale;
    const height = Math.max(4, (end - start) * scale);

    const item = document.createElement("div");
    item.className = "planner-family-event-item";
    item.style.top = `${top}px`;
    item.style.height = `${height}px`;

    const bar = document.createElement("span");
    bar.className = "planner-family-event-bar";

    const title = document.createElement("span");
    title.className = "planner-family-event-title";
    title.textContent = event.title;

    // 予定名は折り返さない。
    // 時間が短いだけでは「⋮」に置き換えない。
    title.style.whiteSpace = "nowrap";

    item.append(bar, title);
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute(
        "aria-label",
        `${event.title}、${event.date}、${event.startTime}〜${event.endTime}`
    );
    item.title =
        `${event.title} ${event.startTime}〜${event.endTime}`;

    const openDetail = eventObject => {
        eventObject.preventDefault();
        eventObject.stopPropagation();
        plannerFamilyShowEventDetail(event);
    };

    item.addEventListener("click", openDetail);
    item.addEventListener("keydown", eventObject => {
        if (eventObject.key === "Enter" || eventObject.key === " ") {
            openDetail(eventObject);
        }
    });

    lane.appendChild(item);
}



/* =====================================================
   🗑️ 家族予定の期間指定一括削除
   ・家族メンバーを選択
   ・単発／繰り返し／両方を選択
   ・指定期間内の単発予定を削除
   ・繰り返し予定は期間内の発生分だけ取り消す
   ・期間外の予定や繰り返し設定は保持する
===================================================== */

function plannerFamilyOpenBulkDelete() {
    if (!plannerFamilyIsAllowed()) {
        alert("家族スケジュールはプレミアム以上で利用できます。");
        return;
    }

    const data = db.load();
    const family = plannerFamilyEnsureData(data);

    if (!family.members.length) {
        alert("家族メンバーが登録されていません。");
        return;
    }

    document.getElementById("plannerFamilyBulkDeleteModal")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "plannerFamilyBulkDeleteModal";
    overlay.className = "planner-family-form-overlay";

    const form = document.createElement("form");
    form.className = "planner-family-form-modal";

    const heading = document.createElement("h2");
    heading.textContent = "予定の一括削除";

    const warning = document.createElement("p");
    warning.textContent =
        "指定期間内の予定だけが対象です。削除前に対象件数を確認できます。";

    const memberLabel = document.createElement("label");
    memberLabel.className = "planner-family-form-field";
    memberLabel.textContent = "削除する家族";

    const memberSelect = document.createElement("select");
    memberSelect.name = "memberId";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "家族全員";
    memberSelect.appendChild(allOption);

    family.members.forEach(member => {
        const option = document.createElement("option");
        option.value = member.id;
        option.textContent =
            `${member.icon || "🧒"} ${member.name}`;
        memberSelect.appendChild(option);
    });

    const typeLabel = document.createElement("label");
    typeLabel.className = "planner-family-form-field";
    typeLabel.textContent = "予定の種類";

    const typeSelect = document.createElement("select");
    typeSelect.name = "kind";

    [
        ["all", "単発・繰り返し両方"],
        ["event", "単発予定のみ"],
        ["rule", "繰り返し予定のみ"]
    ].forEach(([value, text]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        typeSelect.appendChild(option);
    });

    function makeDateField(labelText, name, value) {
        const label = document.createElement("label");
        label.className = "planner-family-form-field";
        label.textContent = labelText;

        const input = document.createElement("input");
        input.type = "date";
        input.name = name;
        input.value = value;
        input.required = true;

        label.appendChild(input);
        return { label, input };
    }

    const today = plannerFamilyToday();
    const startField = makeDateField("開始日", "startDate", today);
    const endField = makeDateField("終了日", "endDate", today);

    const count = document.createElement("p");
    count.setAttribute("aria-live", "polite");

    const actions = document.createElement("div");
    actions.className = "planner-family-modal-actions";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "キャンセル";
    cancel.addEventListener("click", () => overlay.remove());

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "対象を確認して削除";
    submit.className = "planner-family-modal-submit";

    actions.append(cancel, submit);

    form.append(
        heading,
        warning,
        memberLabel,
        typeLabel
    );

    memberLabel.appendChild(memberSelect);
    typeLabel.appendChild(typeSelect);

    form.append(
        startField.label,
        endField.label,
        count,
        actions
    );

    function getTargets() {
        const latest = db.load();
        const latestFamily = plannerFamilyEnsureData(latest);

        const memberId = memberSelect.value;
        const kind = typeSelect.value;
        const startDate = startField.input.value;
        const endDate = endField.input.value;

        if (
            !plannerFamilyDateIsValid(startDate) ||
            !plannerFamilyDateIsValid(endDate) ||
            endDate < startDate
        ) {
            return null;
        }

        const memberIds = memberId === "all"
            ? latestFamily.members.map(member => member.id)
            : [memberId];

        const memberIdSet = new Set(memberIds);

        const events = kind === "rule"
            ? []
            : latestFamily.events.filter(event =>
                memberIdSet.has(event.memberId) &&
                event.date >= startDate &&
                event.date <= endDate
            );

        const rules = kind === "event"
            ? []
            : latestFamily.rules.filter(rule =>
                memberIdSet.has(rule.memberId) &&
                rule.endDate >= startDate &&
                rule.startDate <= endDate
            );

        let occurrences = 0;

        rules.forEach(rule => {
            const from = rule.startDate > startDate
                ? rule.startDate
                : startDate;

            const to = rule.endDate < endDate
                ? rule.endDate
                : endDate;

            for (
                let date = from;
                date <= to;
                date = plannerFamilyAddDays(date, 1)
            ) {
                if (!rule.weekdays.includes(plannerFamilyWeekday(date))) {
                    continue;
                }

                const alreadySkipped = latestFamily.exceptions.some(exception =>
                    exception.ruleId === rule.id &&
                    exception.date === date &&
                    exception.action === "skip"
                );

                if (!alreadySkipped) occurrences++;
            }
        });

        return {
            data: latest,
            family: latestFamily,
            memberIds,
            startDate,
            endDate,
            events,
            rules,
            occurrences
        };
    }

    function updateCount() {
        const targets = getTargets();

        if (!targets) {
            count.textContent = "期間を正しく選択してください。";
            submit.disabled = true;
            return;
        }

        submit.disabled = false;
        count.textContent =
            `対象：単発 ${targets.events.length}件` +
            `／繰り返し ${targets.occurrences}回`;
    }

    [
        memberSelect,
        typeSelect,
        startField.input,
        endField.input
    ].forEach(input => {
        input.addEventListener("change", updateCount);
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const targets = getTargets();

        if (!targets) {
            alert("開始日と終了日を正しく選択してください。");
            return;
        }

        if (
            !targets.events.length &&
            !targets.occurrences
        ) {
            alert("指定条件に該当する予定はありません。");
            return;
        }

        const memberNames = targets.family.members
            .filter(member => targets.memberIds.includes(member.id))
            .map(member => member.name)
            .join("、");

        const message =
            `削除対象を確認してください。\n\n` +
            `家族：${memberNames || "対象なし"}\n` +
            `期間：${targets.startDate} ～ ${targets.endDate}\n` +
            `単発予定：${targets.events.length}件\n` +
            `繰り返し予定の発生分：${targets.occurrences}回\n\n` +
            `繰り返し設定そのものは残し、期間内の発生分だけを取り消します。\n` +
            `この内容で実行しますか？`;

        if (!confirm(message)) return;

        // 確認後、最新データを読み直して対象を再判定
        const latest = db.load();
        const latestFamily = plannerFamilyEnsureData(latest);
        const selectedMembers = new Set(targets.memberIds);

        const eventIds = new Set(
            latestFamily.events
                .filter(item =>
                    selectedMembers.has(item.memberId) &&
                    item.date >= targets.startDate &&
                    item.date <= targets.endDate &&
                    typeSelect.value !== "rule"
                )
                .map(item => item.id)
        );

        latestFamily.events = latestFamily.events.filter(
            item => !eventIds.has(item.id)
        );

        let addedExceptions = 0;

        if (typeSelect.value !== "event") {
            latestFamily.rules.forEach(rule => {
                if (!selectedMembers.has(rule.memberId)) return;

                const from = rule.startDate > targets.startDate
                    ? rule.startDate
                    : targets.startDate;

                const to = rule.endDate < targets.endDate
                    ? rule.endDate
                    : targets.endDate;

                for (
                    let date = from;
                    date <= to;
                    date = plannerFamilyAddDays(date, 1)
                ) {
                    if (!rule.weekdays.includes(plannerFamilyWeekday(date))) {
                        continue;
                    }

                    const exists = latestFamily.exceptions.some(exception =>
                        exception.ruleId === rule.id &&
                        exception.date === date &&
                        exception.action === "skip"
                    );

                    if (exists) continue;

                    latestFamily.exceptions.push({
                        id: plannerFamilyNewId(),
                        ruleId: rule.id,
                        memberId: rule.memberId,
                        date,
                        action: "skip"
                    });

                    addedExceptions++;
                }
            });
        }

        plannerFamilySave(latest);

        overlay.remove();

        const memberScreen =
            document.getElementById("plannerFamilyMemberScreen");

        const currentMemberId = memberScreen?.dataset.memberId;

        if (currentMemberId) {
            plannerFamilyRenderEvents(currentMemberId);
        }

        plannerFamilyRenderLanes();

        alert(
            `一括削除処理が完了しました。\n` +
            `単発予定：${eventIds.size}件を削除\n` +
            `繰り返し予定：${addedExceptions}回分を取り消し`
        );
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay) overlay.remove();
    });

    overlay.appendChild(form);
    document.body.appendChild(overlay);

    updateCount();
}
