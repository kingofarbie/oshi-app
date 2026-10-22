
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


if(anniversaryHtml){

    title.insertAdjacentHTML(
        "afterend",
        anniversaryHtml
    );

}


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


const allEvents = [];

(plannerData.events || []).forEach(e => {

    if(!e.start){
        return;
    }

    const occurrences = getRecurringEventOccurrences(
        e,
        dayStart,
        displayEnd
    );

    occurrences.forEach(occurrence => {

        const eventStart = occurrence.start;

        const eventEnd = occurrence.end;

        if(
            !eventStart ||
            !eventEnd ||
            Number.isNaN(eventStart.getTime()) ||
            Number.isNaN(eventEnd.getTime())
        ){
            return;
        }

        // この日の時間範囲と重なる予定だけを表示
        if(
            eventStart < displayEnd &&
            eventEnd > dayStart
        ){

            // 表示用の予定を作成。保存データは変更しない
            const startText =
                `${eventStart.getFullYear()}-` +
                `${String(eventStart.getMonth() + 1).padStart(2, "0")}-` +
                `${String(eventStart.getDate()).padStart(2, "0")}T` +
                `${String(eventStart.getHours()).padStart(2, "0")}:` +
                `${String(eventStart.getMinutes()).padStart(2, "0")}`;

            const endText =
                `${eventEnd.getFullYear()}-` +
                `${String(eventEnd.getMonth() + 1).padStart(2, "0")}-` +
                `${String(eventEnd.getDate()).padStart(2, "0")}T` +
                `${String(eventEnd.getHours()).padStart(2, "0")}:` +
                `${String(eventEnd.getMinutes()).padStart(2, "0")}`;

allEvents.push({
    ...e,
    start: startText,
    end: endText,
    occurrenceDate: occurrence.occurrenceDate || startText.slice(0, 10)
});
        }

    });

});

allEvents.sort((a, b) => {
    return new Date(a.start) - new Date(b.start);
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
   00:00より上の最上部にも線を追加
===================== */

// 時間枠の最上端の横線
html += `
    <div
        class="planner-line planner-line-major"
        style="top:0px;"
    ></div>
`;

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
                data-occurrence-date="${e.occurrenceDate || e.start.slice(0, 10)}"
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

    <button
        type="button"
        class="planner-cancel-btn"
        onclick="event.stopPropagation(); plannerCancelEditMode();"
    >
        ✖️ キャンセル
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

timeline.innerHTML = html;

plannerFamilyRenderLanes();

renderPlannerNotes(date);

/* =====================
   🎨 スタンプ表示
===================== */

renderPlannerStickers(date);




requestAnimationFrame(plannerUpdateStickyOffsets);

    /* =====================
       付箋以外をタップ
       → 編集モード解除
    ===================== */






timeline.onclick =
    function(event){

        /* =====================
           🎨 スタンプの配置
        ===================== */

        if(
            plannerStickerPlacementMode &&
            !event.target.closest(".planner-event") &&
            !event.target.closest(".planner-free-note")
        ){

            // タップした場所に関係なく、基準となるボードを取得
            const board =
                timeline.querySelector(".planner-board");

            if(board){

                event.stopPropagation();

                const rect =
                    board.getBoundingClientRect();

                // 家族レーン上のタップ位置もボード基準に変換
                const top =
                    board.scrollTop +
                    event.clientY -
                    rect.top;

                const left =
                    board.scrollLeft +
                    event.clientX -
                    rect.left;

                const position = {
                    top: Math.max(0, top),
                    left: Math.max(0, left)
                };

                const stickerId =
                    plannerSelectedStickerId;

                plannerStickerPlacementMode = false;

                plannerCancelEditMode();

                if(stickerId){

                    placePlannerStickerAtPosition(
                        selectedCalendarDate,
                        stickerId,
                        position
                    );

                }

                return;

            }

        }


        /* =====================
           📝 自由メモの配置
        ===================== */

        if(
            plannerNotePlacementMode &&
            !event.target.closest(".planner-event") &&
            !event.target.closest(".planner-free-note")
        ){

            // タップした場所に関係なく、基準となるボードを取得
            const board =
                timeline.querySelector(".planner-board");

            if(board){

                event.stopPropagation();

                const rect =
                    board.getBoundingClientRect();

                // 家族レーン上のタップ位置もボード基準に変換
                const top =
                    board.scrollTop +
                    event.clientY -
                    rect.top;

                const noteTop =
                    Math.max(15, top);

                const noteMode =
                    plannerNotePlacementMode;

                plannerNotePlacementTop =
                    noteTop;

                plannerNotePlacementMode = "";

                plannerCancelEditMode();

                /* 仮メモを表示 */

                const placeholder =
                    document.createElement("div");

                placeholder.className =
                    "planner-free-note planner-free-note-placeholder";

                placeholder.textContent =
                    noteMode === "drawing"
                        ? "ここに手書きメモを追加"
                        : "ここにメモを追加";

                Object.assign(placeholder.style, {
                    position: "absolute",
                    top: `${noteTop}px`,
                    left: "6px",
                    right: "6px",
                    minHeight: "40px",
                    padding: "8px",
                    boxSizing: "border-box",
                    border: "2px dashed #e91e63",
                    borderRadius: "8px",
                    background: "#fff0f6",
                    color: "#c2185b",
                    fontSize: "14px",
                    zIndex: "30",
                    cursor: "pointer"
                });

                placeholder.addEventListener(
                    "click",
                    function(noteEvent){

                        noteEvent.stopPropagation();

                        openPlannerNoteEditor(noteMode);

                        /* 編集画面を開く前に仮メモを削除 */
                        placeholder.remove();

                    }
                );



                
                board.appendChild(placeholder);

                return;

            }

        }


        /* =====================
           既存の予定編集モード解除
        ===================== */

        if(
            !event.target.closest(".planner-event") &&
            !event.target.closest(".planner-free-note")
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



/* =====================================================
   📝 1日手帳：保存済み文字メモを表示・ドラッグ移動
===================================================== */


function renderPlannerNotes(date) {

    const timeline =
        document.getElementById("plannerTimeline");

    const layout =
        timeline?.querySelector(".planner-layout");

    const board =
        layout?.querySelector(".planner-board");

    const times =
        layout?.querySelector(".planner-times");

    if (!layout || !board || !times) {
        return;
    }

    layout
        .querySelector(".planner-notes-layer")
        ?.remove();

    const data = db.load();

    const notes = (data.plannerNotes || []).filter(
        note =>
            note.date === date &&
            note.type === "text"
    );

    const layer =
        document.createElement("div");

    layer.className = "planner-notes-layer";


Object.assign(layer.style, {
    position: "absolute",
    top: `${board.offsetTop}px`,
    left: `${board.offsetLeft + times.offsetWidth}px`,
    width: `${board.clientWidth}px`,
    height: `${board.offsetHeight}px`,
    overflow: "visible",
    pointerEvents: "none",
    zIndex: "30",
    boxSizing: "border-box"
});
    

    notes.forEach(note => {

        const element =
            document.createElement("div");

        element.className = "planner-free-note";
        element.dataset.noteId = note.id;
        element.tabIndex = 0;
        element.setAttribute("role", "button");
        element.setAttribute(
            "aria-label",
            "メモを選択。もう一度タップすると編集"
        );

        element.textContent = note.text || "";

        Object.assign(element.style, {
            position: "absolute",
            transform:
                `rotate(${Number(note.rotation) || 0}deg)`,
            top: `${Math.max(0, Number(note.top) || 0)}px`,
            left: `${Math.max(0, Number(note.left) || 6)}px`,
            width: `${Number(note.width) || 220}px`,
            maxWidth: "calc(100% - 12px)",
            height: note.height
                ? `${Number(note.height)}px`
                : "auto",
            minWidth: "100px",
            minHeight: "40px",
            padding: "8px",
            boxSizing: "border-box",
            border: "1px solid #e8a6c1",
            borderRadius: "8px",
            background: "#fff8fc",
            color: note.color || "#333333",
            fontFamily: note.font || "sans-serif",
            fontSize: `${Number(note.fontSize) || 16}px`,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            zIndex: "31",
            cursor: "grab",
            pointerEvents: "auto",
            touchAction: "none",
            userSelect: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
        });

        /* =====================
           ✕ 削除ボタン
           スタンプと同じ左上
        ===================== */

        const deleteHandle =
            document.createElement("button");

        deleteHandle.type = "button";
        deleteHandle.className =
            "planner-note-delete-handle";

        deleteHandle.textContent = "✕";

        deleteHandle.setAttribute(
            "aria-label",
            "メモを削除"
        );

        Object.assign(deleteHandle.style, {
            position: "absolute",
            top: "-28px",
            left: "-10px",
            width: "26px",
            height: "26px",
            padding: "0",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            borderRadius: "50%",
            background: "#e85b76",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            boxSizing: "border-box",
            zIndex: "101",
            pointerEvents: "auto",
            touchAction: "manipulation"
        });

        /* 削除ボタンからのドラッグを防止 */
        deleteHandle.addEventListener(
            "pointerdown",
            function(event) {
                event.preventDefault();
                event.stopPropagation();
            }
        );

        deleteHandle.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                if (
                    !confirm("このメモを削除しますか？")
                ) {
                    return;
                }

                const latestData = db.load();

                if (
                    !Array.isArray(
                        latestData.plannerNotes
                    )
                ) {
                    return;
                }

                const exists =
                    latestData.plannerNotes.some(
                        item =>
                            String(item.id) ===
                            String(note.id)
                    );

                if (!exists) {
                    return;
                }

                latestData.plannerNotes =
                    latestData.plannerNotes.filter(
                        item =>
                            String(item.id) !==
                            String(note.id)
                    );

                db.save(latestData);

                showPlanner(date);
            }
        );

        element.appendChild(deleteHandle);

        /* =====================
           ↔ サイズ変更ハンドル
           スタンプと同じ右下
        ===================== */

        const resizeHandle =
            document.createElement("div");

        resizeHandle.className =
            "planner-note-resize-handle";

        Object.assign(resizeHandle.style, {
            position: "absolute",
            right: "0",
            bottom: "0",
            width: "22px",
            height: "22px",
            borderRadius: "6px 0 7px 0",
            background: "#e8a6c1",
            border: "1px solid #d77da3",
            boxSizing: "border-box",
            cursor: "nwse-resize",
            touchAction: "none",
            zIndex: "5",
            display: "none"
        });

        resizeHandle.setAttribute(
            "aria-label",
            "メモのサイズを変更"
        );

        element.appendChild(resizeHandle);

        /* =====================
           ↻ 回転ハンドル
           スタンプと同じ右上
        ===================== */

        const rotateHandle =
            document.createElement("div");

        rotateHandle.className =
            "planner-note-rotate-handle";

        Object.assign(rotateHandle.style, {
            position: "absolute",
            top: "-28px",
            right: "0",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "#e8a6c1",
            border: "1px solid #d77da3",
            boxSizing: "border-box",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "16px",
            cursor: "grab",
            touchAction: "none",
            zIndex: "6"
        });

        rotateHandle.textContent = "↻";

        rotateHandle.setAttribute(
            "aria-label",
            "メモを回転"
        );

        element.appendChild(rotateHandle);

        element.dataset.editMode = "false";

        /* =====================
           編集モード切り替え
        ===================== */

        function setNoteEditMode(enabled) {

            element.dataset.editMode =
                enabled ? "true" : "false";

            element.style.outline =
                enabled
                    ? "2px solid #e8a6c1"
                    : "none";

            deleteHandle.style.display =
                enabled ? "flex" : "none";

            resizeHandle.style.display =
                enabled ? "block" : "none";

            rotateHandle.style.display =
                enabled ? "flex" : "none";
        }

        /* =====================
           ↻ 回転処理
        ===================== */

        let rotating = false;
        let rotatePointerId = null;
        let rotateCenterX = 0;
        let rotateCenterY = 0;
        let rotateStartAngle = 0;
        let rotateInitialValue = 0;

        rotateHandle.addEventListener(
            "pointerdown",
            function(event) {

                if (
                    event.pointerType === "mouse" &&
                    event.button !== 0
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                const rect =
                    element.getBoundingClientRect();

                rotateCenterX =
                    rect.left + rect.width / 2;

                rotateCenterY =
                    rect.top + rect.height / 2;

                rotateStartAngle = Math.atan2(
                    event.clientY - rotateCenterY,
                    event.clientX - rotateCenterX
                );

                rotateInitialValue =
                    Number(note.rotation) || 0;

                rotatePointerId = event.pointerId;
                rotating = true;

                rotateHandle.setPointerCapture(
                    event.pointerId
                );
            }
        );

        rotateHandle.addEventListener(
            "pointermove",
            function(event) {

                if (
                    !rotating ||
                    event.pointerId !== rotatePointerId
                ) {
                    return;
                }

                const currentAngle = Math.atan2(
                    event.clientY - rotateCenterY,
                    event.clientX - rotateCenterX
                );

                const deltaAngle =
                    (currentAngle - rotateStartAngle) *
                    180 / Math.PI;

                const nextRotation =
                    rotateInitialValue + deltaAngle;

                element.style.transform =
                    `rotate(${nextRotation}deg)`;

                element.dataset.rotation =
                    String(nextRotation);

                event.preventDefault();
                event.stopPropagation();
            }
        );

        function finishNoteRotation(event) {

            if (
                !rotating ||
                event.pointerId !== rotatePointerId
            ) {
                return;
            }

            rotating = false;
            rotatePointerId = null;

            const latestData = db.load();

            const savedNotes =
                Array.isArray(latestData.plannerNotes)
                    ? latestData.plannerNotes
                    : [];

            const savedNote = savedNotes.find(
                item =>
                    String(item.id) === String(note.id)
            );

            if (!savedNote) {
                alert("メモの回転を保存できませんでした。");
                showPlanner(date);
                return;
            }

            savedNote.rotation =
                Number(element.dataset.rotation) || 0;

            db.save(latestData);

            element.dataset.dragged = "true";

            event.stopPropagation();
        }

        rotateHandle.addEventListener(
            "pointerup",
            finishNoteRotation
        );

        rotateHandle.addEventListener(
            "pointercancel",
            finishNoteRotation
        );

        rotateHandle.addEventListener(
            "click",
            function(event) {
                event.preventDefault();
                event.stopPropagation();
            }
        );

        /* =====================
           ↔ サイズ変更処理
        ===================== */

        let resizing = false;
        let resizePointerId = null;
        let resizeStartX = 0;
        let resizeStartY = 0;
        let resizeStartWidth = 0;
        let resizeStartHeight = 0;
        let resizeStartFontSize = 16;

        resizeHandle.addEventListener(
            "pointerdown",
            function(event) {

                if (
                    event.pointerType === "mouse" &&
                    event.button !== 0
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                const rect =
                    element.getBoundingClientRect();

                resizePointerId = event.pointerId;
                resizeStartX = event.clientX;
                resizeStartY = event.clientY;
                resizeStartWidth = rect.width;
                resizeStartHeight = rect.height;

                resizeStartFontSize =
                    parseFloat(
                        getComputedStyle(element).fontSize
                    ) || 16;

                resizing = true;

                resizeHandle.setPointerCapture(
                    event.pointerId
                );
            }
        );

        resizeHandle.addEventListener(
            "pointermove",
            function(event) {

                if (
                    !resizing ||
                    event.pointerId !== resizePointerId
                ) {
                    return;
                }

                const dx = event.clientX - resizeStartX;
                const dy = event.clientY - resizeStartY;

                const maxWidth = Math.max(
                    100,
                    layer.clientWidth -
                        (parseFloat(element.style.left) || 0)
                );

                const maxHeight = Math.max(
                    40,
                    layer.clientHeight -
                        (parseFloat(element.style.top) || 0)
                );

                const nextWidth = Math.max(
                    100,
                    Math.min(
                        maxWidth,
                        resizeStartWidth + dx
                    )
                );

                const nextHeight = Math.max(
                    40,
                    Math.min(
                        maxHeight,
                        resizeStartHeight + dy
                    )
                );

                element.style.width =
                    `${nextWidth}px`;

                element.style.height =
                    `${nextHeight}px`;

                element.style.maxWidth = "none";

                const scale =
                    nextWidth / resizeStartWidth;

                const desiredFontSize =
                    resizeStartFontSize * scale * scale;

                element.style.fontSize =
                    `${Math.max(6, desiredFontSize)}px`;

                while (
                    element.scrollHeight > element.clientHeight ||
                    element.scrollWidth > element.clientWidth
                ) {

                    const currentFontSize =
                        parseFloat(element.style.fontSize);

                    if (currentFontSize <= 6) {
                        break;
                    }

                    element.style.fontSize =
                        `${Math.max(
                            6,
                            currentFontSize - 1
                        )}px`;
                }

                event.preventDefault();
                event.stopPropagation();
            }
        );

        function finishNoteResize(event) {

            if (
                !resizing ||
                event.pointerId !== resizePointerId
            ) {
                return;
            }

            resizing = false;
            resizePointerId = null;

            const latestData = db.load();

            const savedNotes =
                Array.isArray(latestData.plannerNotes)
                    ? latestData.plannerNotes
                    : [];

            const savedNote = savedNotes.find(
                item =>
                    String(item.id) === String(note.id)
            );

            if (!savedNote) {
                alert("メモのサイズを保存できませんでした。");
                showPlanner(date);
                return;
            }

            savedNote.width = element.offsetWidth;
            savedNote.height = element.offsetHeight;

            db.save(latestData);

            element.dataset.dragged = "true";

            event.stopPropagation();
        }

        resizeHandle.addEventListener(
            "pointerup",
            finishNoteResize
        );

        resizeHandle.addEventListener(
            "pointercancel",
            finishNoteResize
        );

        resizeHandle.addEventListener(
            "click",
            function(event) {
                event.preventDefault();
                event.stopPropagation();
            }
        );

        /* =====================
           メモの移動処理
        ===================== */

        let startX = 0;
        let startY = 0;
        let grabOffsetX = 0;
        let grabOffsetY = 0;
        let dragging = false;
        let moved = false;
        let activePointerId = null;

        element.addEventListener(
            "pointerdown",
            function(event) {

                /* 操作ハンドルからのイベントは除外 */
                if (
                    event.target.closest(
                        ".planner-note-delete-handle, " +
                        ".planner-note-resize-handle, " +
                        ".planner-note-rotate-handle"
                    )
                ) {
                    return;
                }

                if (
                    event.pointerType === "mouse" &&
                    event.button !== 0
                ) {
                    return;
                }

                activePointerId = event.pointerId;

                startX = event.clientX;
                startY = event.clientY;

                const noteRect =
                    element.getBoundingClientRect();

                grabOffsetX =
                    event.clientX - noteRect.left;

                grabOffsetY =
                    event.clientY - noteRect.top;

                dragging = true;
                moved = false;

                element.style.cursor = "grabbing";
                element.style.zIndex = "32";

                element.setPointerCapture(
                    event.pointerId
                );

                event.preventDefault();
                event.stopPropagation();
            }
        );

        element.addEventListener(
            "pointermove",
            function(event) {

                if (
                    !dragging ||
                    event.pointerId !== activePointerId
                ) {
                    return;
                }

                const dx = event.clientX - startX;
                const dy = event.clientY - startY;

                if (
                    !moved &&
                    Math.abs(dx) < 5 &&
                    Math.abs(dy) < 5
                ) {
                    return;
                }

                moved = true;

                const layerRect =
                    layer.getBoundingClientRect();

                const maxLeft = Math.max(
                    0,
                    layer.clientWidth - element.offsetWidth
                );

                const maxTop = Math.max(
                    0,
                    layer.clientHeight - element.offsetHeight
                );

                const nextLeft = Math.max(
                    0,
                    Math.min(
                        maxLeft,
                        event.clientX -
                            layerRect.left -
                            grabOffsetX
                    )
                );

                const nextTop = Math.max(
                    0,
                    Math.min(
                        maxTop,
                        event.clientY -
                            layerRect.top -
                            grabOffsetY
                    )
                );

                element.style.left = `${nextLeft}px`;
                element.style.top = `${nextTop}px`;

                event.preventDefault();
                event.stopPropagation();
            }
        );

        function finishNoteDrag(event) {

            if (
                !dragging ||
                event.pointerId !== activePointerId
            ) {
                return;
            }

            dragging = false;
            activePointerId = null;

            element.style.cursor = "grab";
            element.style.zIndex = "31";

            if (!moved) {
                return;
            }

            const finalLeft =
                parseFloat(element.style.left) || 0;

            const finalTop =
                parseFloat(element.style.top) || 0;

            const latestData = db.load();

            const savedNotes =
                Array.isArray(latestData.plannerNotes)
                    ? latestData.plannerNotes
                    : [];

            const savedNote = savedNotes.find(
                item =>
                    String(item.id) === String(note.id)
            );

            if (!savedNote) {
                alert("メモを保存できませんでした。");
                showPlanner(date);
                return;
            }

            savedNote.left = finalLeft;
            savedNote.top = finalTop;

            db.save(latestData);

            element.dataset.dragged = "true";

            event.stopPropagation();
        }

        element.addEventListener(
            "pointerup",
            finishNoteDrag
        );

        element.addEventListener(
            "pointercancel",
            finishNoteDrag
        );

        /* =====================
           1回タップ：操作ボタン表示
           2回目：内容を編集
        ===================== */

        element.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                if (
                    event.target.closest(
                        ".planner-note-delete-handle, " +
                        ".planner-note-resize-handle, " +
                        ".planner-note-rotate-handle"
                    )
                ) {
                    return;
                }

                /* 移動・回転・サイズ変更直後は無視 */
                if (element.dataset.dragged === "true") {
                    element.dataset.dragged = "false";
                    event.preventDefault();
                    return;
                }

                /* 1回目のタップ */
                if (element.dataset.editMode !== "true") {

                    layer.querySelectorAll(
                        ".planner-free-note"
                    ).forEach(otherNote => {

                        otherNote.dataset.editMode = "false";
                        otherNote.style.outline = "none";

                        const otherDelete =
                            otherNote.querySelector(
                                ".planner-note-delete-handle"
                            );

                        const otherResize =
                            otherNote.querySelector(
                                ".planner-note-resize-handle"
                            );

                        const otherRotate =
                            otherNote.querySelector(
                                ".planner-note-rotate-handle"
                            );

                        if (otherDelete) {
                            otherDelete.style.display = "none";
                        }

                        if (otherResize) {
                            otherResize.style.display = "none";
                        }

                        if (otherRotate) {
                            otherRotate.style.display = "none";
                        }
                    });

                    setNoteEditMode(true);

                    return;
                }

                /* 2回目のタップ：内容を編集 */
                setNoteEditMode(false);

                openPlannerNoteEditor(
                    "text",
                    note.id
                );
            }
        );

        layer.appendChild(element);
    });

    /* 予定ボードと家族レーンより手前に配置 */
    layout.appendChild(layer);

    /* メモ以外をタップしたら操作ボタンを隠す */
    if (!layout.dataset.noteOutsideTapBound) {

        layout.dataset.noteOutsideTapBound = "true";

        layout.addEventListener(
            "click",
            function(event) {

                if (
                    event.target.closest(
                        ".planner-free-note"
                    )
                ) {
                    return;
                }

                layout.querySelectorAll(
                    ".planner-free-note"
                ).forEach(element => {

                    element.dataset.editMode = "false";
                    element.style.outline = "none";

                    const deleteHandle =
                        element.querySelector(
                            ".planner-note-delete-handle"
                        );

                    const resize =
                        element.querySelector(
                            ".planner-note-resize-handle"
                        );

                    const rotate =
                        element.querySelector(
                            ".planner-note-rotate-handle"
                        );

                    if (deleteHandle) {
                        deleteHandle.style.display = "none";
                    }

                    if (resize) {
                        resize.style.display = "none";
                    }

                    if (rotate) {
                        rotate.style.display = "none";
                    }
                });
            }
        );
    }
}



/* =====================================================
   📝 メモ操作メニュー
===================================================== */

function showPlannerNoteMenu(noteId) {

    const action = prompt(
        "メモの操作を選んでください\n\n" +
        "1：メモ編集\n" +
        "2：メモ削除\n\n" +
        "番号を入力してください"
    );

    if (action === "1") {

        openPlannerNoteEditor(
            "text",
            noteId
        );

        return;
    }

    if (action === "2") {

        const confirmed = confirm(
            "このメモを削除しますか？"
        );

        if (!confirmed) {
            return;
        }

        const data = db.load();

        if (!Array.isArray(data.plannerNotes)) {
            return;
        }

        data.plannerNotes =
            data.plannerNotes.filter(
                note => String(note.id) !== String(noteId)
            );

        db.save(data);

        showPlanner(
            selectedPlannerDate
        );

    }

}


/* =================================
   📅 1日手帳：今日に戻る
================================= */

function goToPlannerToday() {
    const now = new Date();

    const today =
        `${now.getFullYear()}-` +
        `${String(now.getMonth() + 1).padStart(2, "0")}-` +
        `${String(now.getDate()).padStart(2, "0")}`;

    showPlanner(today, false);
}


/* =========================================
📅 1日手帳：上部の高さに合わせて位置を調整
========================================= */

function plannerUpdateStickyOffsets() {
const planner = document.getElementById("dayPlanner");
const title = document.getElementById("plannerTitle");

if (!planner || !title) return;

const badge = planner.querySelector(".planner-anniversary-badge");

// 日付・祝日表示を含む実際の高さ
const titleHeight = title.getBoundingClientRect().height;

// 日付の下の余白も含める
const titleStyle = getComputedStyle(title);
const titleMarginBottom =
    parseFloat(titleStyle.marginBottom) || 0;

const badgeTop = titleHeight + titleMarginBottom;

// 記念日バブルを日付の直下に配置
if (badge) {
    badge.style.top = `${badgeTop}px`;
    planner.style.setProperty(
        "--planner-anniversary-top",
        `${badgeTop}px`
    );
} else {
    planner.style.setProperty(
        "--planner-anniversary-top",
        "0px"
    );
}

// 家族アイコンを記念日バブルの下に配置
const badgeHeight = badge
    ? badge.getBoundingClientRect().height
    : 0;

const familyTop = badgeTop + badgeHeight;

planner.querySelectorAll(
    ".planner-family-lane-header"
).forEach(header => {
    header.style.top = `${familyTop}px`;
});

}


if (!window.__plannerStickyOffsetResizeBound) {
window.__plannerStickyOffsetResizeBound = true;

window.addEventListener(
    "resize",
    plannerUpdateStickyOffsets
);

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
let plannerSwipeBlocked = false;

function setupPlannerSwipe(){

    const planner =
        document.getElementById("dayPlanner");

    if(!planner) return;

    if(planner.dataset.swipeReady === "true"){
        return;
    }

    planner.dataset.swipeReady = "true";

    planner.addEventListener("touchstart", function(event){

        plannerSwipeBlocked = false;

        if(window.plannerStickerIsDragging){
            plannerSwipeBlocked = true;
            return;
        }

        if(event.touches.length !== 1) return;

        if(event.target.closest(".planner-event")) return;

        if(event.target.closest(
            ".planner-stickers-layer, .planner-free-note, .memory-photo-box, .memory-photo, video, textarea, input, select, button"
        )){
            return;
        }

        plannerSwipeStartX =
            event.touches[0].clientX;

        plannerSwipeStartY =
            event.touches[0].clientY;

    }, {passive:true});


    planner.addEventListener("touchend", function(event){

        if(plannerSwipeBlocked) return;

        if(window.plannerStickerIsDragging) return;

        if(!selectedCalendarDate) return;

        if(event.target.closest(".planner-event")) return;

        if(event.target.closest(
            ".planner-stickers-layer, .planner-free-note, .memory-photo-box, .memory-photo, video, textarea, input, select, button"
        )){
            return;
        }

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
   内容が隠れている場合に展開
   再タップで元に戻す
===================== */


function plannerEventTap(event, id){

    if(event.target.closest(".planner-event-actions")){
        return;
    }

    if(plannerLongPressTriggered){
        plannerLongPressTriggered = false;
        return;
    }

    const eventBox = event.currentTarget;
    if(!eventBox) return;

    const displayHeight = Number(eventBox.dataset.displayHeight);
    const originalTop = Number(eventBox.dataset.originalTop);

    if(!Number.isFinite(displayHeight) ||
       !Number.isFinite(originalTop)){
        return;
    }

    /* 再タップ：幅・高さ・位置を元に戻す */
    if(eventBox.classList.contains("planner-event-expanded")){

        eventBox.style.height = `${displayHeight}px`;
        eventBox.style.top = `${originalTop}px`;

        eventBox.style.left = eventBox.dataset.originalLeft;
        eventBox.style.right = eventBox.dataset.originalRight;
        eventBox.style.width = eventBox.dataset.originalWidth;

        eventBox.classList.remove(
            "planner-event-expanded",
            "planner-event-compact"
        );

        eventBox.style.zIndex =
            eventBox.dataset.originalZIndex || "";

        return;
    }

    /* 元の幅・位置・重なり順を保存 */
    if(eventBox.dataset.originalLeft === undefined){
        eventBox.dataset.originalLeft = eventBox.style.left;
        eventBox.dataset.originalRight = eventBox.style.right;
        eventBox.dataset.originalWidth = eventBox.style.width;
        eventBox.dataset.originalZIndex = eventBox.style.zIndex || "";
    }

    const board = eventBox.closest(".planner-board");
    if(!board) return;

    /* ほかの付箋の重なり順を復元 */
    board.querySelectorAll(".planner-event").forEach(box => {
        if(box !== eventBox){
            box.style.zIndex =
                box.dataset.originalZIndex || "";
        }
    });

    /* 内容が全部表示される高さを計算 */
    const displayHeightNow =
        Number(eventBox.dataset.displayHeight) || 40;

    const actualHeight =
        Number(eventBox.dataset.actualHeight) || 0;

    const contentHeight =
        eventBox.scrollHeight;

    const expandedHeight = Math.max(
        displayHeightNow,
        actualHeight,
        contentHeight
    );

    /* 展開前の横位置を取得 */
    const boardRect = board.getBoundingClientRect();
    const eventRect = eventBox.getBoundingClientRect();

    const currentLeft = eventRect.left - boardRect.left;

    /*
     * 右端は個人予定ボードの右端に合わせる。
     * 家族レーン側へはみ出さず、時間軸にも重ねない。
     */
    const rightGap = 6;
    const expandedWidth = Math.max(
        eventRect.width,
        boardRect.right - eventRect.left - rightGap
    );

    /* 元の開始位置・展開方向は維持 */
    let expandedTop = originalTop;

    if(eventBox.dataset.expandDirection === "up"){
        expandedTop = Math.max(
            15,
            originalTop - (expandedHeight - displayHeightNow)
        );
    }

    eventBox.style.left = `${currentLeft}px`;
    eventBox.style.right = "auto";
    eventBox.style.width = `${expandedWidth}px`;

    eventBox.style.height = `${expandedHeight}px`;
    eventBox.style.top = `${expandedTop}px`;
    eventBox.style.zIndex = "9999";

    eventBox.classList.add(
        "planner-event-expanded",
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

    document.querySelectorAll(".planner-event").forEach(el => {

        el.classList.remove(
            "planner-event-editing",
            "planner-event-compact",
            "planner-event-expanded"
        );

        const displayHeight =
            Number(el.dataset.displayHeight);

        const originalTop =
            Number(el.dataset.originalTop);

        if(Number.isFinite(displayHeight)){
            el.style.height = `${displayHeight}px`;
        }

        if(Number.isFinite(originalTop)){
            el.style.top = `${originalTop}px`;
        }

        /* 展開した横幅も元に戻す */
        if(el.dataset.originalLeft !== undefined){
            el.style.left = el.dataset.originalLeft;
            el.style.right = el.dataset.originalRight;
            el.style.width = el.dataset.originalWidth;

            el.style.zIndex =
                el.dataset.originalZIndex || "";
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

    const target = document.querySelector(
        `.planner-event[data-event-id="${id}"]`
    );

    if(target){
        target.classList.remove("planner-event-editing");
    }

    const data = db.load();

    const eventData = (data.events || []).find(
        e => String(e.id) === String(id)
    );

    if(!eventData){
        return;
    }

    const isRecurring =
        !!eventData.repeat &&
        eventData.repeat !== "none";

    // 繰り返し予定以外は、従来どおり予定全体を削除
    if(!isRecurring){

        if(!confirm(`「${eventData.title}」を削除しますか？`)){
            return;
        }

        data.events = data.events.filter(
            e => String(e.id) !== String(id)
        );

    }
    else{

        // タップした付箋から、対象の日付を取得
        const eventElement =
            event.target.closest(".planner-event");

        const occurrenceDate =
            eventElement?.dataset.occurrenceDate;

        if(!occurrenceDate){
            alert("削除する予定の日付を取得できませんでした。");
            return;
        }

        const deleteChoice = prompt(
            `「${eventData.title}」の削除方法を選んでください。\n\n1：この日だけ削除\n2：繰り返し予定をすべて削除\n\n数字を入力してください。`,
            "1"
        );

        if(deleteChoice === null){
            return;
        }

        if(deleteChoice === "1"){

            if(!Array.isArray(eventData.excludedOccurrences)){
                eventData.excludedOccurrences = [];
            }

            if(!eventData.excludedOccurrences.includes(occurrenceDate)){
                eventData.excludedOccurrences.push(occurrenceDate);
            }

        }
        else if(deleteChoice === "2"){

            data.events = data.events.filter(
                e => String(e.id) !== String(id)
            );

        }
        else{
            alert("1 または 2 を入力してください。");
            return;
        }

    }

    db.save(data);

    showPlanner(selectedCalendarDate, false);

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




/* =====================================================
   🎨 1日手帳：スタンプ配置・保存・表示
===================================================== */

// スタンプを配置して保存

async function placePlannerStickerAtPosition(
    date,
    stickerId,
    position
) {

    try {

        /* =====================
           🎨 絵文字スタンプ
        ===================== */


const emojiStickers = {
    "emoji-heart": "❤️",
    "emoji-star": "⭐",
    "emoji-flower": "🌸",
    "emoji-ribbon": "🎀",
    "emoji-sparkles": "✨",
    "emoji-music": "🎵",
    "emoji-cat": "🐱",
    "emoji-rabbit": "🐰",
    "emoji-clap": "👏",
    "emoji-gift": "🎁",
    "emoji-crown": "👑",
    "emoji-rainbow": "🌈",
    "emoji-laugh": "😆",
    "emoji-love": "😍",
    "emoji-dog": "🐶",
    "emoji-panda": "🐼",
    "emoji-penguin": "🐧",
    "emoji-wildboar": "🐗",
    "emoji-sweat": "😰",
    "emoji-peek": "🫣",
    "emoji-down": "⬇️",
    "emoji-check": "✅",
    "emoji-repeat": "🔁",
    "emoji-eyes": "👁️‍🗨️",
    "emoji-chart": "💹",
    "emoji-laughcry": "😂"
};

        const isEmoji =
            Object.prototype.hasOwnProperty.call(
                emojiStickers,
                stickerId
            );

        let emoji = "";

        if (isEmoji) {

            emoji = emojiStickers[stickerId];

        } else {

            /* =====================
               🖼️ 登録画像スタンプ
            ===================== */

            const media =
                await getMediaFile(stickerId);

            if (!media || !media.file) {

                alert("スタンプ画像を読み込めませんでした。");
                return;

            }

        }

        /* =====================
           💾 配置データを保存
        ===================== */

        const data = db.load();

        if (!Array.isArray(data.plannerStickerPlacements)) {

            data.plannerStickerPlacements = [];

        }

        data.plannerStickerPlacements.push({

            id:
                "placement_" +
                Date.now() +
                "_" +
                Math.random().toString(36).slice(2, 8),

            date: date,

            stickerId: stickerId,

            type: isEmoji ? "emoji" : "image",

            emoji: emoji,

            top: position.top,

            left: position.left,

            width: 80,

            height: 80,

            rotation: 0,

            zIndex: Date.now()

        });

        db.save(data);

        await renderPlannerStickers(date);

    } catch (error) {

        console.error(
            "スタンプ配置エラー:",
            error
        );

        alert("スタンプを配置できませんでした。");

    }

}




// 保存済みスタンプを表示



async function renderPlannerStickers(date) {

    const board =
        document.querySelector(
            "#plannerTimeline .planner-board"
        );

    if (!board) return;

    const timeline =
        document.getElementById("plannerTimeline");

    /* =====================
       前回の専用レイヤーを削除
    ===================== */

    const oldLayer =
        board.querySelector(
            ".planner-stickers-layer"
        );

    if (oldLayer) {

        oldLayer.querySelectorAll("img").forEach(image => {

            if (image.dataset.objectUrl) {

                URL.revokeObjectURL(
                    image.dataset.objectUrl
                );

            }

        });

        oldLayer.remove();

    }

    /* =====================
       スタンプ専用レイヤー
    ===================== */

    const layer =
        document.createElement("div");

    layer.className =
        "planner-stickers-layer";

    Object.assign(layer.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
        zIndex: "40"
    });

    const data = db.load();

    const placements =
        Array.isArray(data.plannerStickerPlacements)
            ? data.plannerStickerPlacements.filter(
                item => item.date === date
            )
            : [];

    placements.sort(
        (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );

    /* =====================
       編集状態を管理
    ===================== */

    function exitStickerEditMode() {

        const currentLayer =
            timeline
                ? timeline.querySelector(
                    ".planner-stickers-layer"
                )
                : layer;

        if (!currentLayer) return;

        currentLayer.querySelectorAll(
            ".planner-sticker"
        ).forEach(sticker => {

            sticker.dataset.editMode = "false";
            sticker.style.outline = "none";

            const resizeHandle =
                sticker.querySelector(
                    ".planner-sticker-resize-handle"
                );

            const rotateHandle =
                sticker.querySelector(
                    ".planner-sticker-rotate-handle"
                );

            if (resizeHandle) {
                resizeHandle.style.display = "none";
            }

            if (rotateHandle) {
                rotateHandle.style.display = "none";
            }



            const deleteButton =
    sticker.querySelector(
        ".planner-sticker-delete-button"
    );

if (deleteButton) {
    deleteButton.style.display = "none";
}




        });

    }

    function saveStickerProperty(id, property, value) {

        const latestData = db.load();

        if (
            !Array.isArray(
                latestData.plannerStickerPlacements
            )
        ) {
            return;
        }

        const savedSticker =
            latestData.plannerStickerPlacements.find(
                placement => placement.id === id
            );

        if (!savedSticker) return;

        savedSticker[property] = value;

        db.save(latestData);

    }

    /* =====================
       スタンプ以外をタップしたら編集解除
       家族レーンを含むタイムライン全体で判定
    ===================== */

    if (
        timeline &&
        timeline.dataset.stickerOutsideTapReady !== "true"
    ) {

        timeline.dataset.stickerOutsideTapReady = "true";

        timeline.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".planner-sticker"
                    )
                ) {
                    return;
                }

                exitStickerEditMode();

            }
        );

    }

    /* =====================
       スタンプを表示
    ===================== */

    for (const item of placements) {

        let element;

        /* =====================
           絵文字スタンプ
        ===================== */

        if (
            item.type === "emoji" ||
            (
                typeof item.stickerId === "string" &&
                item.stickerId.startsWith("emoji-")
            )
        ) {

            const emojiStickers = {

                "emoji-heart": "❤️",
                "emoji-star": "⭐",
                "emoji-flower": "🌸",
                "emoji-ribbon": "🎀",
                "emoji-sparkles": "✨",
                "emoji-music": "🎵",
                "emoji-cat": "🐱",
                "emoji-rabbit": "🐰",
                "emoji-clap": "👏",
                "emoji-gift": "🎁",
                "emoji-crown": "👑",
                "emoji-rainbow": "🌈",
                "emoji-laugh": "😆",
                "emoji-love": "😍",
                "emoji-dog": "🐶",
                "emoji-panda": "🐼",
                "emoji-penguin": "🐧",
                "emoji-wildboar": "🐗",
                "emoji-sweat": "😰",
                "emoji-peek": "🫣",
                "emoji-down": "⬇️",
                "emoji-check": "✅",
                "emoji-repeat": "🔁",
                "emoji-eyes": "👁️‍🗨️",
                "emoji-chart": "💹",
                "emoji-laughcry": "😂"

            };

            const emoji =
                item.emoji ||
                emojiStickers[item.stickerId];

            if (!emoji) continue;

            element =
                document.createElement("div");

            element.textContent = emoji;

            element.setAttribute(
                "aria-label",
                "スタンプ"
            );

            Object.assign(element.style, {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px",
                lineHeight: "1"
            });

        } else {

            /* =====================
               登録画像スタンプ
            ===================== */

            const media =
                await getMediaFile(item.stickerId);

            if (!media || !media.file) continue;

            const imageUrl =
                createMediaURL(media);

            if (!imageUrl) continue;

            element =
                document.createElement("img");

            element.src = imageUrl;
            element.dataset.objectUrl = imageUrl;
            element.alt = "マイスタンプ";
            element.draggable = false;

            Object.assign(element.style, {
                objectFit: "contain"
            });

        }

        /* =====================
           共通の配置設定
        ===================== */

        element.classList.add("planner-sticker");

        element.dataset.stickerId = item.id;
        element.dataset.editMode = "false";
        element.dataset.dragged = "false";
        element.dataset.rotation =
            String(item.rotation || 0);

        Object.assign(element.style, {

            position: "absolute",
            top: `${item.top || 0}px`,
            left: `${item.left || 0}px`,
            width: `${item.width || 80}px`,
            height: `${item.height || 80}px`,
            boxSizing: "border-box",
            transform: `rotate(${item.rotation || 0}deg)`,
            transformOrigin: "center center",
            zIndex: String(item.zIndex || 1),
            pointerEvents: "auto",
            userSelect: "none",
            touchAction: "none",
            cursor: "grab",
            outline: "none"

        });

        /* =====================
           右下：拡大・縮小ハンドル
        ===================== */

        const resizeHandle =
            document.createElement("div");

        resizeHandle.className =
            "planner-sticker-resize-handle";

        resizeHandle.textContent = "↘";

        Object.assign(resizeHandle.style, {

            position: "absolute",
            right: "-9px",
            bottom: "-9px",
            width: "22px",
            height: "22px",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            borderRadius: "50%",
            background: "#e8a6c1",
            color: "white",
            fontSize: "15px",
            fontWeight: "bold",
            lineHeight: "1",
            cursor: "nwse-resize",
            touchAction: "none",
            userSelect: "none",
            zIndex: "100",
            boxSizing: "border-box"

        });

        /* =====================
           右上：回転ハンドル
        ===================== */

        const rotateHandle =
            document.createElement("div");

        rotateHandle.className =
            "planner-sticker-rotate-handle";

        rotateHandle.textContent = "↻";

        Object.assign(rotateHandle.style, {

            position: "absolute",
            top: "-28px",
            right: "-10px",
            width: "24px",
            height: "24px",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            borderRadius: "50%",
            background: "#e8a6c1",
            color: "white",
            fontSize: "17px",
            fontWeight: "bold",
            lineHeight: "1",
            cursor: "grab",
            touchAction: "none",
            userSelect: "none",
            zIndex: "100",
            boxSizing: "border-box"

        });

        element.appendChild(resizeHandle);
        element.appendChild(rotateHandle);


        
/* =====================
   ✕ スタンプ削除ボタン
===================== */

const deleteButton =
    document.createElement("button");

deleteButton.type = "button";
deleteButton.className =
    "planner-sticker-delete-button";

deleteButton.textContent = "✕";

deleteButton.setAttribute(
    "aria-label",
    "スタンプを削除"
);

Object.assign(deleteButton.style, {
    position: "absolute",
    top: "-28px",
    left: "-10px",
    width: "26px",
    height: "26px",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    border: "2px solid white",
    borderRadius: "50%",
    background: "#e85b76",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    zIndex: "101",
    boxSizing: "border-box",
    pointerEvents: "auto",
    touchAction: "manipulation"
});

deleteButton.addEventListener(
    "click",
    function(event) {

        event.preventDefault();
        event.stopPropagation();

        if (
            !confirm("このスタンプを削除しますか？")
        ) {
            return;
        }

        const latestData = db.load();

        if (
            !Array.isArray(
                latestData.plannerStickerPlacements
            )
        ) {
            return;
        }

        latestData.plannerStickerPlacements =
            latestData.plannerStickerPlacements.filter(
                placement =>
                    String(placement.id) !==
                    String(item.id)
            );

        db.save(latestData);

        renderPlannerStickers(date);

    }
);

element.appendChild(deleteButton);










        /* =====================
           編集モードの切り替え
        ===================== */

        function enterStickerEditMode() {

            exitStickerEditMode();

            element.dataset.editMode = "true";

            element.style.outline =
                "2px solid #e8a6c1";

            resizeHandle.style.display = "flex";
            rotateHandle.style.display = "flex";
            deleteButton.style.display = "flex";

        }

        /* =====================
           スタンプ本体のドラッグ移動
        ===================== */

        let dragStartX = 0;
        let dragStartY = 0;
        let originalLeft = 0;
        let originalTop = 0;
        let isDragging = false;
        let dragMoved = false;
        let dragScaleX = 1;
        let dragScaleY = 1;

        function saveStickerPosition() {

            if (!isDragging) return;

            if (dragMoved) {

                saveStickerProperty(
                    item.id,
                    "left",
                    parseFloat(element.style.left) || 0
                );

                saveStickerProperty(
                    item.id,
                    "top",
                    parseFloat(element.style.top) || 0
                );

            }

            isDragging = false;

            window.plannerStickerIsDragging = false;

            element.style.cursor = "grab";

            if (dragMoved) {
                element.dataset.dragged = "true";
            }

        }

        element.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.target.closest(
                        ".planner-sticker-resize-handle, " +
                        ".planner-sticker-rotate-handle"
                    )
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                const currentBoard =
                    element.closest(".planner-board");

                if (!currentBoard) return;

                const boardRect =
                    currentBoard.getBoundingClientRect();

                dragScaleX =
                    currentBoard.offsetWidth > 0
                        ? boardRect.width /
                          currentBoard.offsetWidth
                        : 1;

                dragScaleY =
                    currentBoard.offsetHeight > 0
                        ? boardRect.height /
                          currentBoard.offsetHeight
                        : 1;

                if (!dragScaleX) dragScaleX = 1;
                if (!dragScaleY) dragScaleY = 1;

                isDragging = true;
                dragMoved = false;

                window.plannerStickerIsDragging = true;

                dragStartX = event.clientX;
                dragStartY = event.clientY;

                originalLeft =
                    parseFloat(element.style.left) || 0;

                originalTop =
                    parseFloat(element.style.top) || 0;

                element.style.cursor = "grabbing";

                element.setPointerCapture(
                    event.pointerId
                );

            }
        );

        element.addEventListener(
            "pointermove",
            event => {

                if (!isDragging) return;

                event.preventDefault();
                event.stopPropagation();

                const rawDeltaX =
                    event.clientX - dragStartX;

                const rawDeltaY =
                    event.clientY - dragStartY;

                if (
                    Math.abs(rawDeltaX) >= 5 ||
                    Math.abs(rawDeltaY) >= 5
                ) {
                    dragMoved = true;
                }

                const deltaX =
                    rawDeltaX / dragScaleX;

                const deltaY =
                    rawDeltaY / dragScaleY;

                element.style.left =
                    `${originalLeft + deltaX}px`;

                element.style.top =
                    `${Math.max(
                        0,
                        originalTop + deltaY
                    )}px`;

            }
        );

        element.addEventListener(
            "pointerup",
            event => {

                event.stopPropagation();

                saveStickerPosition();

            }
        );

        element.addEventListener(
            "pointercancel",
            saveStickerPosition
        );

        /* =====================
           右下ハンドル：サイズ変更
        ===================== */

        let resizing = false;
        let resizeStartX = 0;
        let resizeStartY = 0;
        let resizeStartWidth = 0;
        let resizeStartHeight = 0;
        let resizeScaleX = 1;
        let resizeScaleY = 1;

        function finishStickerResize() {

            if (!resizing) return;

            resizing = false;

            saveStickerProperty(
                item.id,
                "width",
                element.offsetWidth
            );

            saveStickerProperty(
                item.id,
                "height",
                element.offsetHeight
            );

            element.dataset.dragged = "true";

        }

        resizeHandle.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();
                event.stopPropagation();

                resizing = true;

                const rect =
                    element.getBoundingClientRect();

                const currentBoard =
                    element.closest(".planner-board");

                if (!currentBoard) {
                    resizing = false;
                    return;
                }

                const boardRect =
                    currentBoard.getBoundingClientRect();

                resizeScaleX =
                    currentBoard.offsetWidth > 0
                        ? boardRect.width /
                          currentBoard.offsetWidth
                        : 1;

                resizeScaleY =
                    currentBoard.offsetHeight > 0
                        ? boardRect.height /
                          currentBoard.offsetHeight
                        : 1;

                if (!resizeScaleX) resizeScaleX = 1;
                if (!resizeScaleY) resizeScaleY = 1;

                resizeStartX = event.clientX;
                resizeStartY = event.clientY;

                resizeStartWidth =
                    parseFloat(element.style.width) ||
                    rect.width;

                resizeStartHeight =
                    parseFloat(element.style.height) ||
                    rect.height;

                resizeHandle.setPointerCapture(
                    event.pointerId
                );

            }
        );

        resizeHandle.addEventListener(
            "pointermove",
            event => {

                if (!resizing) return;

                event.preventDefault();
                event.stopPropagation();

                const deltaX =
                    (event.clientX - resizeStartX) /
                    resizeScaleX;

                const deltaY =
                    (event.clientY - resizeStartY) /
                    resizeScaleY;

                const nextWidth =
                    Math.max(
                        40,
                        resizeStartWidth + deltaX
                    );

                const nextHeight =
                    Math.max(
                        40,
                        resizeStartHeight + deltaY
                    );

                element.style.width =
                    `${nextWidth}px`;

                element.style.height =
                    `${nextHeight}px`;

                /* =====================
                   絵文字の表示サイズも連動
                ===================== */

                if (
                    element.getAttribute("aria-label") ===
                    "スタンプ"
                ) {

                    element.style.fontSize =
                        `${64 * nextWidth / 80}px`;

                }

            }
        );

        resizeHandle.addEventListener(
            "pointerup",
            event => {

                event.preventDefault();
                event.stopPropagation();

                finishStickerResize();

            }
        );

        resizeHandle.addEventListener(
            "pointercancel",
            finishStickerResize
        );

        /* =====================
           右上ハンドル：回転
        ===================== */

        let rotating = false;
        let rotateCenterX = 0;
        let rotateCenterY = 0;
        let rotateStartAngle = 0;
        let rotateInitialValue = 0;

        function finishStickerRotate() {

            if (!rotating) return;

            rotating = false;

            saveStickerProperty(
                item.id,
                "rotation",
                Number(element.dataset.rotation) || 0
            );

            element.dataset.dragged = "true";

        }

        rotateHandle.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();
                event.stopPropagation();

                rotating = true;

                const rect =
                    element.getBoundingClientRect();

                rotateCenterX =
                    rect.left + rect.width / 2;

                rotateCenterY =
                    rect.top + rect.height / 2;

                rotateStartAngle =
                    Math.atan2(
                        event.clientY - rotateCenterY,
                        event.clientX - rotateCenterX
                    ) * 180 / Math.PI;

                rotateInitialValue =
                    Number(element.dataset.rotation) || 0;

                rotateHandle.setPointerCapture(
                    event.pointerId
                );

            }
        );

        rotateHandle.addEventListener(
            "pointermove",
            event => {

                if (!rotating) return;

                event.preventDefault();
                event.stopPropagation();

                const currentAngle =
                    Math.atan2(
                        event.clientY - rotateCenterY,
                        event.clientX - rotateCenterX
                    ) * 180 / Math.PI;

                const nextRotation =
                    rotateInitialValue +
                    currentAngle -
                    rotateStartAngle;

                element.dataset.rotation =
                    String(nextRotation);

                element.style.transform =
                    `rotate(${nextRotation}deg)`;

            }
        );

        rotateHandle.addEventListener(
            "pointerup",
            event => {

                event.preventDefault();
                event.stopPropagation();

                finishStickerRotate();

            }
        );

        rotateHandle.addEventListener(
            "pointercancel",
            finishStickerRotate
        );

        /* =====================
           タップで編集モードに入る
        ===================== */

        element.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                if (
                    element.dataset.dragged === "true"
                ) {
                    element.dataset.dragged = "false";
                    return;
                }

                if (
                    element.dataset.editMode !== "true"
                ) {
                    enterStickerEditMode();
                }

            }
        );

        /* =====================
           レイヤーに追加
        ===================== */

        layer.appendChild(element);

    }

    board.appendChild(layer);

}
