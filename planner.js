
/* =====================
   1日手帳ビュー
   左時間固定 + 予定自由配置版
   短時間予定は最低3行表示
   タップで実時間表示
   長押しで編集・削除モード
===================== */

/* =====================
   1日手帳ビュー
   左時間固定 + 予定配置

   ・00:00～25:00表示
   ・日をまたぐ予定に対応
   ・元の予定データは変更しない
   ・短時間予定は最低40px
   ・内容が隠れた場合はタップで展開
   ・長押しで編集・削除モード
   ・短い重複予定は右へ約7mmずらす
===================== */

function showPlanner(date, fromCalendar = false){

    selectedCalendarDate = date;

    localStorage.setItem(
        "oshi_last_planner_date",
        date
    );

    const calendarBack =
        document.getElementById("plannerCalendarBack");

    if(calendarBack){

        calendarBack.style.display =
            fromCalendar ? "block" : "none";

    }

    const planner =
        document.getElementById("dayPlanner");

    const calendar =
        document.getElementById("calendar");

    const title =
        document.getElementById("plannerTitle");

    const timeline =
        document.getElementById("plannerTimeline");

    if(!planner || !title || !timeline){

        console.error(
            "1日手帳の表示に必要な要素がありません",
            { planner, title, timeline }
        );

        return;
    }

    /* =====================
       日付情報
    ===================== */

    const d =
        new Date(date + "T00:00:00");

    if(Number.isNaN(d.getTime())){

        console.error("1日手帳の日付が不正です:", date);

        return;

    }

    const dayOfWeek =
        d.getDay();

    const holiday =
        getHoliday(date);

    const plannerClass =
        holiday
            ? "planner-holiday-day"
            : dayOfWeek === 6
                ? "planner-saturday"
                : dayOfWeek === 0
                    ? "planner-sunday"
                    : "";

    if(calendar){

        calendar.style.display = "none";

    }

    planner.classList.remove(
        "planner-saturday",
        "planner-sunday",
        "planner-holiday-day"
    );

    if(plannerClass){

        planner.classList.add(plannerClass);

    }

    planner.style.display = "block";

    const oldAnniversary =
        planner.querySelector(".planner-anniversary-badge");

    if(oldAnniversary){

        oldAnniversary.remove();

    }

    const week = [
        "日", "月", "火", "水", "木", "金", "土"
    ];

    /* =====================
       タイトル
    ===================== */

    title.innerHTML = `
        <div class="planner-date-title">
            📅 ${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${week[d.getDay()]})
        </div>

        ${
            holiday
                ? `
                    <div class="planner-holiday">
                        ${holiday.localName}
                    </div>
                  `
                : ""
        }
    `;

    /* =====================
       🎂 記念日・誕生日
    ===================== */

    const plannerData =
        db.load();

    const anniversaryDays =
        plannerData.anniversaryDays || [];

    const todayAnniversaries =
        anniversaryDays.filter(m => {

            if(!m.visible || !m.date){

                return false;

            }

            if(m.yearly){

                return (
                    m.date.substring(5) ===
                    date.substring(5)
                );

            }

            return m.date === date;

        });

    let anniversaryHtml = "";

    if(todayAnniversaries.length > 0){

        anniversaryHtml = `
            <div class="planner-anniversary-badge">

                ${todayAnniversaries.map(m => {

                    let icon = "🎉";

                    if(m.type === "birthday"){

                        icon = "🎂";

                    }
                    else if(m.type === "anniversary"){

                        icon = "🎉";

                    }

                    return `
                        <div
                            class="planner-anniversary-item"
                            onclick="togglePlannerAnniversary(this)"
                        >

                            <span class="planner-anniversary-icon">
                                ${icon}
                            </span>

                            <span class="planner-anniversary-text">
                                ${m.title || ""}
                            </span>

                            ${
                                m.memo
                                    ? `
                                        <span class="planner-anniversary-memo">
                                            ${m.memo}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>
                    `;

                }).join("")}

            </div>
        `;

    }

    planner.insertAdjacentHTML(
        "afterbegin",
        anniversaryHtml
    );

    /* =====================
       現在時刻
    ===================== */

    const now =
        new Date();

    const todayString =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    /* =====================
       時間軸の設定
       30分 = 40px
       00:00～25:00
    ===================== */

    const scale =
        40 / 30;

    const minimumEventHeight =
        40;

    const displayMinutes =
        25 * 60;

    const dayStart =
        new Date(date + "T00:00:00");

    const displayEnd =
        new Date(
            dayStart.getTime() +
            displayMinutes * 60000
        );

    /* =====================
       日時表示
    ===================== */

    function plannerFormatDateTime(value){

        const dt =
            new Date(value);

        if(Number.isNaN(dt.getTime())){

            return "";

        }

        const month =
            String(dt.getMonth() + 1).padStart(2, "0");

        const day =
            String(dt.getDate()).padStart(2, "0");

        const hour =
            String(dt.getHours()).padStart(2, "0");

        const minute =
            String(dt.getMinutes()).padStart(2, "0");

        return `${month}/${day} ${hour}:${minute}`;

    }

    function plannerFormatTime(value){

        const dt =
            new Date(value);

        if(Number.isNaN(dt.getTime())){

            return "";

        }

        return (
            String(dt.getHours()).padStart(2, "0") +
            ":" +
            String(dt.getMinutes()).padStart(2, "0")
        );

    }

    /* =====================
       予定を取得
       表示日の時間範囲と重なる予定を取得
       元の保存データは変更しない
    ===================== */

    const allEvents =
        (plannerData.events || [])
        .filter(e => {

            if(!e.start){

                return false;

            }

            const eventStart =
                new Date(e.start);

            if(Number.isNaN(eventStart.getTime())){

                return false;

            }

            let eventEnd =
                e.end
                    ? new Date(e.end)
                    : new Date(eventStart.getTime() + 30 * 60000);

            if(
                Number.isNaN(eventEnd.getTime()) ||
                eventEnd <= eventStart
            ){

                eventEnd =
                    new Date(eventStart.getTime() + 30 * 60000);

            }

            return (
                eventStart < displayEnd &&
                eventEnd > dayStart
            );

        })
        .sort((a, b) => {

            return (
                new Date(a.start) -
                new Date(b.start)
            );

        });

    /* =====================
       表示区間を計算
       日をまたぐ予定は当日の範囲に切り分ける
       元の開始・終了日時は変更しない
    ===================== */

    const displayEvents =
        allEvents.map(e => {

            const eventStart =
                new Date(e.start);

            let eventEnd =
                e.end
                    ? new Date(e.end)
                    : new Date(eventStart.getTime() + 30 * 60000);

            if(
                Number.isNaN(eventEnd.getTime()) ||
                eventEnd <= eventStart
            ){

                eventEnd =
                    new Date(eventStart.getTime() + 30 * 60000);

            }

            const segmentStart =
                new Date(
                    Math.max(
                        eventStart.getTime(),
                        dayStart.getTime()
                    )
                );

            const segmentEnd =
                new Date(
                    Math.min(
                        eventEnd.getTime(),
                        displayEnd.getTime()
                    )
                );

            const startMinutes =
                (segmentStart.getTime() - dayStart.getTime()) / 60000;

            const segmentDuration =
                Math.max(
                    0,
                    (segmentEnd.getTime() - segmentStart.getTime()) / 60000
                );

            const top =
                15 + startMinutes * scale;

            const actualHeight =
                segmentDuration * scale;

            const displayHeight =
                Math.max(
                    minimumEventHeight,
                    actualHeight
                );

            return {
                event: e,
                eventStart,
                eventEnd,
                segmentStart,
                segmentEnd,
                startMinutes,
                segmentDuration,
                top,
                actualHeight,
                displayHeight,
                overlapLane: 0,
                verticalOffset: 0,
                offsetRight: false
            };

        });

    /* =====================
       重複する予定を判定・配置

       1列目：左端
       2列目：約7mm右
       3列目：約14mm右

       4件目以降：
       3列目の位置を使い、重なりを避けて下へ配置

       元の予定日時・保存データは変更しない
    ===================== */

    const overlapOffsetPx =
        26.5;

    const maxOverlapLane =
        2;

    const overlapGapPx =
        4;

    displayEvents.sort((a, b) => {

        return (
            a.segmentStart.getTime() -
            b.segmentStart.getTime() ||
            a.segmentEnd.getTime() -
            b.segmentEnd.getTime()
        );

    });

    const laneEndTimes = [];

    const thirdLaneItems = [];

    displayEvents.forEach(item => {

        const start =
            item.segmentStart.getTime();

        const end =
            item.segmentEnd.getTime();

        let lane = 0;

        while(
            lane < 3 &&
            laneEndTimes[lane] > start
        ){

            lane++;

        }

        if(lane > maxOverlapLane){

            lane = maxOverlapLane;

        }
        else{

            laneEndTimes[lane] = end;

        }

        item.overlapLane =
            lane;

        item.offsetRight =
            lane > 0;

        /*
           3列目に表示する予定同士が
           時間・縦位置の両方で重なる場合は、
           表示位置だけ下へ移動する。
        */

        if(lane === maxOverlapLane){

            let verticalOffset = 0;

            let hasCollision = true;

            while(hasCollision){

                hasCollision = false;

                const candidateTop =
                    item.top + verticalOffset;

                const candidateBottom =
                    candidateTop + item.displayHeight;

                for(const other of thirdLaneItems){

                    const timeOverlaps =
                        item.segmentStart < other.segmentEnd &&
                        item.segmentEnd > other.segmentStart;

                    if(!timeOverlaps){

                        continue;

                    }

                    const otherTop =
                        other.top + other.verticalOffset;

                    const otherBottom =
                        otherTop + other.displayHeight;

                    const verticalOverlaps =
                        candidateTop < otherBottom + overlapGapPx &&
                        candidateBottom + overlapGapPx > otherTop;

                    if(verticalOverlaps){

                        verticalOffset =
                            otherBottom + overlapGapPx - item.top;

                        hasCollision = true;

                        break;

                    }

                }

            }

            item.verticalOffset =
                verticalOffset;

            thirdLaneItems.push(item);

        }

    });

    /* =====================
       左時間軸
    ===================== */

    let html = `
        <div class="planner-layout">

            <div class="planner-times">
    `;

    for(
        let minute = 0;
        minute <= displayMinutes;
        minute += 30
    ){

        const hour =
            Math.floor(minute / 60);

        const min =
            minute % 60;

        html += `
            <div class="planner-time-fixed">
                ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}
            </div>
        `;

    }

    html += `
            </div>

            <div class="planner-board">
    `;

    /* =====================
       時間線
       30分ごとに40px間隔
       25:00の線まで描画
    ===================== */

    for(
        let i = 0;
        i <= 50;
        i++
    ){

        const top =
            15 + i * 40;

        html += `
            <div
                class="planner-line ${i % 2 === 0 ? "planner-line-major" : "planner-line-minor"}"
                style="top:${top}px;"
            ></div>
        `;

    }

    /* =====================
       現在時刻ライン
    ===================== */

    if(
        date === todayString &&
        currentMinutes <= displayMinutes
    ){

        const top =
            15 + currentMinutes * scale;

        html += `
            <div
                class="planner-now-line"
                style="top:${top}px;"
            >
                ● 現在
            </div>
        `;

    }

    /* =====================
       📌 予定配置
    ===================== */

    displayEvents.forEach(item => {

        const e =
            item.event;

        const {
            eventStart,
            eventEnd,
            top,
            actualHeight,
            displayHeight,
            segmentStart,
            segmentEnd
        } = item;

        const displayTop =
            top + item.verticalOffset;

        const finished =
            eventEnd < now;

        const category =
            getCategoryInfo(e.category);

        const categoryColor =
            category?.color || "#ffb3cc";

        const lightColor =
            getLightCategoryColor(categoryColor);

        /* =====================
           展開方向
        ===================== */

        const expandDirection =
            eventStart < dayStart
                ? "down"
                : "up";

        /* =====================
           日をまたぐ予定の判定
        ===================== */

        const crossesMidnight =
            eventStart.toDateString() !==
            eventEnd.toDateString();

        let eventTimeText = "";

        if(crossesMidnight){

            eventTimeText =
                `${plannerFormatDateTime(e.start)} ～ ${e.end ? plannerFormatDateTime(e.end) : ""}`;

        }
        else{

            eventTimeText =
                `${plannerFormatTime(e.start)}${e.end ? " ～ " + plannerFormatTime(e.end) : ""}`;

        }

        /* =====================
           継続ラベル
        ===================== */

        let continuationHtml = "";

        if(eventStart < dayStart){

            continuationHtml = `
                <div class="planner-continuation-label">
                    🔁 前日から継続中
                </div>
            `;

        }
        else if(eventEnd > displayEnd){

            continuationHtml = `
                <div class="planner-continuation-label">
                    🔁 翌日以降も継続
                </div>
            `;

        }
        else if(crossesMidnight){

            continuationHtml = `
                <div class="planner-continuation-label">
                    📅 日をまたぐ予定
                </div>
            `;

        }

        /* =====================
           共有情報
        ===================== */

        const shareInfoHtml = `
            ${
                e.shareInfo &&
                e.importedFromShare !== true
                    ? `
                        <div class="planner-share-info planner-share-sent">

                            <div>
                                📤 共有済み
                            </div>

                            ${
                                e.shareInfo.recipients &&
                                e.shareInfo.recipients.length > 0
                                    ? `
                                        <div>
                                            👥 共有先：
                                            ${
                                                Array.isArray(e.shareInfo.recipients)
                                                    ? e.shareInfo.recipients.join("、")
                                                    : e.shareInfo.recipients
                                            }
                                        </div>
                                      `
                                    : ""
                            }

                            ${
                                e.shareInfo.sharedAt
                                    ? `
                                        <div>
                                            🕒 共有日時：
                                            ${formatShareDateTime(e.shareInfo.sharedAt)}
                                        </div>
                                      `
                                    : ""
                            }

                        </div>
                      `
                    : ""
            }

            ${
                e.importedFromShare === true
                    ? `
                        <div class="planner-share-info planner-share-received">

                            <div>
                                📥 共有予定を取り込みました
                            </div>

                            <div>
                                👤 発信者：
                                ${e.shareInfo?.sender || "不明"}
                            </div>

                            ${
                                e.importedAt
                                    ? `
                                        <div>
                                            🕒 受信日時：
                                            ${formatShareDateTime(e.importedAt)}
                                        </div>
                                      `
                                    : ""
                            }

                        </div>
                      `
                    : ""
            }
        `;

        /* =====================
           重複予定の位置
        ===================== */

        const overlapStyle = `
            left:${item.overlapLane * overlapOffsetPx}px;
            right:0;
            width:auto;
            z-index:${item.overlapLane + 1};
        `;

        /* =====================
           付箋
        ===================== */

        html += `
            <div
                class="planner-event ${finished ? "finished-event" : ""}"
                data-event-id="${e.id}"
                data-actual-height="${actualHeight}"
                data-display-height="${displayHeight}"
                data-original-top="${displayTop}"
                data-expand-direction="${expandDirection}"
                data-segment-start="${segmentStart.getTime()}"
                data-segment-end="${segmentEnd.getTime()}"
                data-event-start="${eventStart.getTime()}"
                data-event-end="${eventEnd.getTime()}"
                data-overlap-short="${item.offsetRight ? "true" : "false"}"
                data-overlap-lane="${item.overlapLane}"

                style="
                    top:${displayTop}px;
                    height:${displayHeight}px;
                    background:${lightColor};
                    border-left-color:${categoryColor};
                    ${overlapStyle}
                "

                ontouchstart="plannerEventTouchStart(event, ${e.id})"
                ontouchend="plannerEventTouchEnd(event, ${e.id})"
                ontouchmove="plannerEventTouchMove(event)"

                onmousedown="plannerEventMouseDown(event, ${e.id})"
                onmouseup="plannerEventMouseUp(event)"
                onmouseleave="plannerEventMouseLeave(event)"

                onclick="plannerEventTap(event, ${e.id})"
            >

                ${continuationHtml}

                <div class="planner-event-time">
                    🕒 ${eventTimeText}
                </div>

                <div class="planner-event-title">
                    ${category?.icon || "📌"}

                    <strong>
                        ${e.title || ""}
                    </strong>
                </div>

                ${
                    e.place
                        ? `
                            <div class="planner-place">
                                📍 ${e.place}
                            </div>
                          `
                        : ""
                }

                ${
                    e.companion
                        ? `
                            <div class="planner-companion">
                                👥 ${e.companion}
                            </div>
                          `
                        : ""
                }

                ${shareInfoHtml}

                <div class="planner-event-actions">

                    <button
                        type="button"
                        class="planner-edit-btn"
                        onclick="plannerEditEvent(event, ${e.id})"
                    >
                        ✏️ 編集
                    </button>

                    <button
                        type="button"
                        class="planner-delete-btn"
                        onclick="plannerDeleteEvent(event, ${e.id})"
                    >
                        🗑️ 削除
                    </button>

                </div>

            </div>
        `;

    });

    html += `
            </div>

        </div>
    `;

    /* =====================
       描画
    ===================== */

    timeline.innerHTML =
        html;

    /* =====================
       付箋以外をタップ
       → 編集モード解除
    ===================== */

    timeline.onclick =
        function(event){

            if(
                !event.target.closest(".planner-event")
            ){

                plannerCancelEditMode();

            }

        };

    /* =====================
       写真・動画
    ===================== */

    renderDayMemory();

    /* =====================
       現在時刻へ移動
    ===================== */

    if(date === todayString){

        setTimeout(() => {

            const nowLine =
                document.querySelector(".planner-now-line");

            if(nowLine){

                nowLine.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        }, 300);

    }

    setupPlannerSwipe();

}



/* =====================
   共有日時を表示用に変換
   ISO → 日本時間 24時間表示
===================== */

function formatShareDateTime(value){

    if(!value){
        return "";
    }

    const d = new Date(value);

    if(isNaN(d.getTime())){
        return value;
    }

    return new Intl.DateTimeFormat(
        "ja-JP",
        {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    )
    .format(d)
    .replace(/\//g, "/");

}





/* =====================
   🎂 記念日タップ
   拡大 ⇄ メモ表示
===================== */

function togglePlannerAnniversary(element){

    if(!element){
        return;
    }

    element.classList.toggle(
        "planner-anniversary-expanded"
    );

}


/* =====================
   1日手帳 左右スワイプ
   左 → 翌日
   右 → 前日
===================== */

let plannerSwipeStartX = 0;
let plannerSwipeStartY = 0;

function setupPlannerSwipe(){

    const planner =
        document.getElementById("dayPlanner");

    if(!planner) return;

    if(planner.dataset.swipeReady === "true"){
        return;
    }

    planner.dataset.swipeReady = "true";

    planner.addEventListener("touchstart", function(event){

        if(event.touches.length !== 1) return;

        if(event.target.closest(".planner-event")) return;
        if(event.target.closest(".memory-photo-box, .memory-photo, video, textarea, input, select, button")){return;}

        plannerSwipeStartX =
            event.touches[0].clientX;

        plannerSwipeStartY =
            event.touches[0].clientY;

    }, {passive:true});


    planner.addEventListener("touchend", function(event){

        if(!selectedCalendarDate) return;

        if(event.target.closest(".planner-event")) return;
        if(event.target.closest(".memory-photo-box, .memory-photo, video, textarea, input, select, button")){return;}

        const diffX =
            event.changedTouches[0].clientX -
            plannerSwipeStartX;

        const diffY =
            event.changedTouches[0].clientY -
            plannerSwipeStartY;

if(
    Math.abs(diffX) < 120 ||
    Math.abs(diffX) <= Math.abs(diffY) * 1.3
){
    return;
}
        
        const current =
            new Date(
                selectedCalendarDate + "T00:00:00"
            );

        if(diffX < 0){
            current.setDate(
                current.getDate() + 1
            );
        }else{
            current.setDate(
                current.getDate() - 1
            );
        }

        const nextDate =
            `${current.getFullYear()}-` +
            `${String(current.getMonth()+1).padStart(2,"0")}-` +
            `${String(current.getDate()).padStart(2,"0")}`;

        showPlanner(nextDate, false);

    }, {passive:true});
}

/* =====================
   1日手帳
   タップ・長押し制御
===================== */

let plannerPressTimer = null;
let plannerLongPressTriggered = false;
let plannerTouchMoved = false;


/* =====================
   タッチ開始
===================== */

function plannerEventTouchStart(event, id){

    if(event.touches && event.touches.length > 1){
        return;
    }

    plannerLongPressTriggered = false;
    plannerTouchMoved = false;

    plannerPressTimer =
        setTimeout(()=>{

            plannerLongPressTriggered = true;

            plannerEnterEditMode(id);

        },700);

}


/* =====================
   タッチ終了
===================== */

function plannerEventTouchEnd(event, id){

    clearTimeout(plannerPressTimer);

    if(
        plannerTouchMoved ||
        plannerLongPressTriggered
    ){
        return;
    }

}


/* =====================
   タッチ移動
===================== */

function plannerEventTouchMove(){

    plannerTouchMoved = true;

    clearTimeout(plannerPressTimer);

}


/* =====================
   PC用マウス長押し
===================== */

function plannerEventMouseDown(event, id){

    if(event.button !== 0){
        return;
    }

    plannerLongPressTriggered = false;

    plannerPressTimer =
        setTimeout(()=>{

            plannerLongPressTriggered = true;

            plannerEnterEditMode(id);

        },700);

}


function plannerEventMouseUp(){

    clearTimeout(plannerPressTimer);

}


function plannerEventMouseLeave(){

    clearTimeout(plannerPressTimer);

}


/* =====================
   タップ
   通常 ⇄ 内容が収まる高さ
===================== */

/* =====================
   タップ
   内容が隠れている場合に展開
   再タップで元に戻す
===================== */

function plannerEventTap(event, id){

    if(
        event.target.closest(".planner-event-actions")
    ){

        return;

    }

    if(plannerLongPressTriggered){

        plannerLongPressTriggered = false;

        return;

    }

    const eventBox =
        event.currentTarget;

    if(!eventBox){

        return;

    }

    const displayHeight =
        Number(eventBox.dataset.displayHeight);

    const originalTop =
        Number(eventBox.dataset.originalTop);

    if(
        !Number.isFinite(displayHeight) ||
        !Number.isFinite(originalTop)
    ){

        return;

    }

    /* =====================
       展開中なら元に戻す
    ===================== */

    if(
        eventBox.classList.contains("planner-event-compact")
    ){

        eventBox.style.height =
            `${displayHeight}px`;

        eventBox.style.top =
            `${originalTop}px`;

        eventBox.classList.remove(
            "planner-event-compact"
        );

        return;

    }

    /* =====================
       内容が隠れているか確認
    ===================== */

    const contentHeight =
        eventBox.scrollHeight;

    if(contentHeight <= displayHeight){

        return;

    }

    /* =====================
       全内容が見える高さを計算
    ===================== */

    const actualHeight =
        Number(eventBox.dataset.actualHeight) || 0;

    const expandedHeight =
        Math.max(
            actualHeight,
            contentHeight
        );

    const expandDirection =
        eventBox.dataset.expandDirection;

    let expandedTop =
        originalTop;

    /* =====================
       開始日の予定
       → 上方向へ展開
    ===================== */

    if(expandDirection === "up"){

        expandedTop =
            Math.max(
                15,
                originalTop - (expandedHeight - displayHeight)
            );

    }

    /* =====================
       前日からの継続予定
       → 下方向へ展開
    ===================== */

    else{

        expandedTop =
            originalTop;

    }

    eventBox.style.height =
        `${expandedHeight}px`;

    eventBox.style.top =
        `${expandedTop}px`;

    eventBox.classList.add(
        "planner-event-compact"
    );

}


/* =====================
   長押し
   編集モード
===================== */

function plannerEnterEditMode(id){

    document
        .querySelectorAll(".planner-event")
        .forEach(el => {

            el.classList.remove(
                "planner-event-editing"
            );

        });

    const target =
        document.querySelector(
            `.planner-event[data-event-id="${id}"]`
        );

    if(!target){

        return;

    }

    target.classList.add(
        "planner-event-editing"
    );

    const originalTop =
        Number(target.dataset.originalTop) || 15;

    const displayHeight =
        Number(target.dataset.displayHeight) || 40;

    const actualHeight =
        Number(target.dataset.actualHeight) || 40;

    target.style.height = "auto";

    const contentHeight =
        target.scrollHeight;

    const expandedHeight =
        Math.max(
            actualHeight,
            contentHeight
        );

    target.style.height =
        `${expandedHeight}px`;

    const expandDirection =
        target.dataset.expandDirection;

    if(expandDirection === "up"){

        target.style.top =
            `${Math.max(15, originalTop - (expandedHeight - displayHeight))}px`;

    }
    else{

        target.style.top =
            `${originalTop}px`;

    }

}


/* =====================
   編集モード解除
===================== */

function plannerCancelEditMode(){

    document
        .querySelectorAll(".planner-event")
        .forEach(el => {

            el.classList.remove(
                "planner-event-editing",
                "planner-event-compact"
            );

            const displayHeight =
                Number(el.dataset.displayHeight);

            const originalTop =
                Number(el.dataset.originalTop);

            if(Number.isFinite(displayHeight)){

                el.style.height =
                    `${displayHeight}px`;

            }

            if(Number.isFinite(originalTop)){

                el.style.top =
                    `${originalTop}px`;

            }

        });

}


/* =====================
   編集
===================== */

function plannerEditEvent(event, id){

    event.stopPropagation();

    const eventData =
        db.load()
        .events
        .find(e => e.id === id);

    if(!eventData){
        return;
    }

    // 編集対象をセット
    selectedEventId = id;
    editingEventId = id;

    // 編集モード表示を解除
    const target =
        document.querySelector(
            `.planner-event[data-event-id="${id}"]`
        );

    if(target){

        target.classList.remove(
            "planner-event-editing"
        );

    }

    // 既存の編集処理をそのまま利用
    selectEvent(id);

}

/* =====================
   削除
===================== */

function plannerDeleteEvent(event, id){

    event.stopPropagation();

    const target =
        document.querySelector(
            `.planner-event[data-event-id="${id}"]`
        );

    if(target){

        target.classList.remove(
            "planner-event-editing"
        );

    }

    const eventData =
        db.load()
        .events
        .find(
            e=>e.id===id
        );

    if(!eventData){
        return;
    }

    if(
        !confirm(
            `「${eventData.title}」を削除しますか？`
        )
    ){
        return;
    }

    const data =
        db.load();

    data.events =
        data.events.filter(
            e=>e.id!==id
        );

    db.save(data);

    showPlanner(
        selectedCalendarDate,
        false
    );

    displayEventList();
    displayHomeSchedule();
    displayUpcomingEvents();
    displayCountdown();
    renderCalendar();
}



/* =====================
   時刻表示補助
===================== */

function formatPlannerTime(value){

    if(!value)
        return "";

    const d =
        new Date(value);

    return (
        String(d.getHours())
        .padStart(2,"0")
        +
        ":" +
        String(d.getMinutes())
        .padStart(2,"0")
    );

}



/* =====================
   手帳イベントクリック用
===================== */

function openPlannerEvent(id){

    const event =
        db.load()
        .events
        .find(
            e=>e.id===id
        );


    if(!event)
        return;


    selectedEventId =
        event.id;


    openEventSelectModal();

}


/* =====================
   カレンダーへ戻る
===================== */

function backToCalendar(){

    const calendar =
        document.getElementById("calendar");

    const planner =
        document.getElementById("dayPlanner");

    const calendarBack =
        document.getElementById(
            "plannerCalendarBack"
        );


    /* カレンダーを表示 */

    if(calendar){

        calendar.style.display = "block";

    }


    /* 1日手帳を非表示 */

    if(planner){

        planner.style.display = "none";

    }


    /* 戻るボタンを非表示 */

    if(calendarBack){

        calendarBack.style.display = "none";

    }


    /* カレンダーページへ移動 */

    switchTab(
        'calendarPage',
        null
    );


    /* カレンダーを再描画 */

    setTimeout(() => {

        if(typeof renderCalendar === "function"){

            renderCalendar();

        }

    }, 50);

}
