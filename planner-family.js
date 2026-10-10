
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

    screen.appendChild(
        plannerFamilyMakeHeader(
            "← 家族一覧",
            plannerFamilyCloseMember,
            `${member.icon || "🧒"} ${member.name}の予定`
        )
    );

    const description = document.createElement("p");
    description.textContent =
        "単発予定と繰り返し予定を登録できます。";

    screen.appendChild(description);

    const list = document.createElement("div");
    list.id = "plannerFamilyMemberEvents";

    screen.appendChild(list);

    screen.appendChild(
        plannerFamilyMakeButton(
            "＋ 単発予定",
            () => plannerFamilyAddEvent(memberId)
        )
    );

    screen.appendChild(
        plannerFamilyMakeButton(
            "🔁 繰り返し予定",
            () => plannerFamilyAddRule(memberId)
        )
    );

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

    const events = family.events
        .filter(event => event.memberId === memberId)
        .map(event => ({
            date: event.date,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            kind: "単発",
            eventId: event.id
        }));

    const rules = family.rules
        .filter(rule => rule.memberId === memberId)
        .map(rule => ({
            date: `${rule.startDate} ～ ${rule.endDate}`,
            title: rule.title,
            startTime: rule.startTime,
            endTime: rule.endTime,
            kind: "繰り返し",
            ruleId: rule.id,
            weekdays: rule.weekdays
        }));

    const all = [...events, ...rules].sort((a, b) =>
        String(a.date).localeCompare(String(b.date))
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

        const edit = plannerFamilyMakeButton(
            "編集",
            () => {
                if (event.kind === "単発") {
                    plannerFamilyEditEvent(event.eventId);
                } else {
                    plannerFamilyEditRule(event.ruleId);
                }
            }
        );

        row.append(details, edit);
        list.appendChild(row);
    });
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

    const oneTime = family.events
        .filter(event =>
            event.memberId === memberId &&
            event.date === date
        )
        .map(event => ({
            id: event.id,
            memberId,
            date,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            sourceType: "event",
            eventId: event.id
        }));

    const recurring = [];

    family.rules.forEach(rule => {
        if (rule.memberId !== memberId) return;
        if (date < rule.startDate || date > rule.endDate) return;
        if (!rule.weekdays.includes(plannerFamilyWeekday(date))) return;

        const skipped = family.exceptions.some(exception =>
            exception.ruleId === rule.id &&
            exception.date === date &&
            exception.action === "skip"
        );

        if (skipped) return;

        recurring.push({
            id: `${rule.id}-${date}`,
            memberId,
            date,
            title: rule.title,
            startTime: rule.startTime,
            endTime: rule.endTime,
            sourceType: "rule",
            ruleId: rule.id
        });
    });

    return [...oneTime, ...recurring];
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
    close.textContent = "×";
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

        const identity = document.createElement("button");
        identity.type = "button";
        identity.className = "planner-family-member-identity";

        const icon = document.createElement("span");
        icon.className = "planner-family-member-icon";
        icon.textContent = member.icon || "🧒";

        const name = document.createElement("span");
        name.className = "planner-family-member-name";
        name.textContent = member.name || "";

        identity.append(icon, name);
        identity.addEventListener("click", () => {
            plannerFamilyOpenMember(member.id);
        });

        const actions = document.createElement("div");
        actions.className = "planner-family-member-actions";

        const toggle = plannerFamilyMakeButton(
            member.enabled ? "🔵" : "⚪",
            () => plannerFamilyToggleMember(member.id),
            "planner-family-icon-button"
        );
        toggle.title = member.enabled ? "表示をOFF" : "表示をON";
        toggle.setAttribute("aria-label", toggle.title);

        const edit = plannerFamilyMakeButton(
            "✏️",
            () => plannerFamilyEditMember(member.id),
            "planner-family-icon-button"
        );
        edit.title = "編集";
        edit.setAttribute("aria-label", "編集");

        const remove = plannerFamilyMakeButton(
            "🗑️",
            () => plannerFamilyDeleteMember(member.id),
            "planner-family-icon-button"
        );
        remove.title = "削除";
        remove.setAttribute("aria-label", "削除");

        actions.append(toggle, edit, remove);
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

    screen.appendChild(
        plannerFamilyMakeHeader("← 戻る", closePlannerFamily, "👨‍👩‍👧 家族管理")
    );

    const description = document.createElement("p");
    description.textContent =
        "家族の名前を押すと、その人の予定を管理できます。";

    const list = document.createElement("div");
    list.id = "plannerFamilyMemberList";

    const addButton = plannerFamilyMakeButton(
        "＋ 家族を追加",
        plannerFamilyAddMember
    );
    addButton.classList.add("planner-family-add-button");

    screen.append(description, list, addButton);
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
    const times = layout?.querySelector(".planner-times");

    if (!layout || !board || !times) return;

    layout.querySelector(".planner-family-lanes")?.remove();
    timeline.querySelector(".planner-family-header-row")?.remove();

    if (!plannerFamilyIsAllowed()) return;

    const data = db.load();
    const family = plannerFamilyEnsureData(data);
    const members = family.members.filter(member => member.enabled);

    if (!members.length) return;

    const date = plannerFamilyGetSelectedDate();

    board.style.minWidth = "0";
    board.style.flex = "1 1 0";

    const headerRow = document.createElement("div");
    headerRow.className = "planner-family-header-row";

    const spacer = document.createElement("div");
    spacer.className = "planner-family-header-spacer";

    /*
     * 時間軸の幅ではなく、
     * 「自分の予定」欄の右端までヘッダーの空白を確保する。
     *
     * 個人予定ボードの幅から、家族レーン全体の幅を引いて
     * 自分の予定欄の幅を求める。
     */
const boardRect = board.getBoundingClientRect();
const layoutRect = layout.getBoundingClientRect();

spacer.style.flexBasis =
    `${Math.max(0, boardRect.right - layoutRect.left)}px`;
    

        
    const headerLanes = document.createElement("div");
    headerLanes.className = "planner-family-header-lanes";

    const lanes = document.createElement("div");
    lanes.className = "planner-family-lanes";
    lanes.style.height = `${board.offsetHeight}px`;

    members.forEach(member => {
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
        headerLanes.appendChild(header);

        const lane = document.createElement("div");
        lane.className = "planner-family-lane";
        lane.dataset.memberId = member.id;
        lane.style.height = `${board.offsetHeight}px`;

        plannerFamilyGetEventsForDate(member.id, date).forEach(event => {
            plannerFamilyDrawEvent(lane, event);
        });

        lanes.appendChild(lane);
    });

    headerRow.append(spacer, headerLanes);

    layout.insertAdjacentElement("beforebegin", headerRow);
    board.insertAdjacentElement("afterend", lanes);
}



function plannerFamilyDrawEvent(lane, event) {
    const [startHour, startMinute] = event.startTime.split(":").map(Number);
    const [endHour, endMinute] = event.endTime.split(":").map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    if (end <= start) return;

    const scale = PLANNER_FAMILY_PIXELS_PER_30_MINUTES / 30;
    const top = PLANNER_FAMILY_TOP_OFFSET + start * scale;
    const height = Math.max(4, (end - start) * scale);

    /*
     * 外側はレーン幅全体を使う。
     * 棒線とタイトルを別々にすることで、
     * 棒線の幅に文字が切られる問題を防ぐ。
     */
    const item = document.createElement("div");
    item.className = "planner-family-event-item";
    item.style.top = `${top}px`;
    item.style.height = `${height}px`;

    const bar = document.createElement("span");
    bar.className = "planner-family-event-bar";

    const title = document.createElement("span");
    title.className = "planner-family-event-title";
    title.textContent = event.title;

    const fontSize = window.matchMedia("(max-width: 480px)").matches
        ? 11
        : 12;

    const requiredHeight = [...event.title].length * fontSize * 1.2;

    if (height < requiredHeight) {
        title.textContent = "⋮";
        title.classList.add("is-ellipsis");
    }

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
