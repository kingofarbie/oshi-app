
/* =====================
   1日手帳ビュー
   左時間固定 + 予定自由配置版
   短時間予定は最低3行表示
   タップで実時間表示
   長押しで編集・削除モード
===================== */

function showPlanner(date, fromCalendar = false){

    selectedCalendarDate = date;

    const calendarBack =
        document.getElementById("plannerCalendarBack");

    if(calendarBack){

        calendarBack.style.display =
            fromCalendar
            ? "block"
            : "none";

    }

    const planner =
        document.getElementById("dayPlanner");

    const calendar =
        document.getElementById("calendar");

    const title =
        document.getElementById("plannerTitle");

    const timeline =
        document.getElementById("plannerTimeline");

    if(
        !planner ||
        !calendar ||
        !title ||
        !timeline
    ){
        return;
    }


    /* =====================
       日付情報
    ===================== */

    const d =
        new Date(date + "T00:00:00");

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


    calendar.style.display = "none";


    planner.classList.remove(
        "planner-saturday",
        "planner-sunday",
        "planner-holiday-day"
    );


    if(plannerClass){

        planner.classList.add(
            plannerClass
        );

    }


    planner.style.display = "block";


    const oldAnniversary =
        planner.querySelector(
            ".planner-anniversary-badge"
        );

    if(oldAnniversary){

        oldAnniversary.remove();

    }


    const week =
    [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ];


    /* =====================
       タイトル
    ===================== */

    title.innerHTML =
    `
    <div class="planner-date-title">
    📅 ${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日(${week[d.getDay()]})
    </div>

    ${
        holiday
        ?
        `
        <div class="planner-holiday">
            ${holiday.localName}
        </div>
        `
        :
        ""
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

            if(
                !m.visible ||
                !m.date
            ){
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


    /* =====================
       記念日バッジ
    ===================== */

    let anniversaryHtml = "";


    if(todayAnniversaries.length > 0){

        anniversaryHtml =
        `
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
                        ?
                        `
                        <span class="planner-anniversary-memo">
                            ${m.memo}
                        </span>
                        `
                        :
                        ""
                    }

                </div>
                `;

            }).join("")}

        </div>
        `;

    }


    /* =====================
       1日手帳に追加
    ===================== */

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
        `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    /* =====================
       予定取得
    ===================== */

    const events =
        db.load()
        .events
        .filter(
            e =>
            e.start &&
            e.start.startsWith(date)
        )
        .sort(
            (a,b) =>
            new Date(a.start) -
            new Date(b.start)
        );


    /* =====================
       30分 = 40px
    ===================== */

    const scale =
        40 / 30;


    /* =====================
       最低表示高さ
       30分 × 3行
       = 120px
    ===================== */

    const minimumEventHeight =
        120;


    let html =
    `
    <div class="planner-layout">

        <div class="planner-times">
    `;


    /* =====================
       左時間軸
    ===================== */

    for(
        let minute = 0;
        minute < 1440;
        minute += 30
    ){

        const hour =
            Math.floor(minute / 60);

        const min =
            minute % 60;


        html +=
        `
        <div class="planner-time-fixed">
            ${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}
        </div>
        `;

    }


    html +=
    `
        </div>

        <div class="planner-board">
    `;


    /* =====================
       時間線
    ===================== */

    for(
        let i = 0;
        i < 96;
        i++
    ){

        const top =
            15 + (i * 20);


        if(i % 2 === 0){

            html +=
            `
            <div
                class="planner-line planner-line-major"
                style="top:${top}px;">
            </div>
            `;

        }
        else{

            html +=
            `
            <div
                class="planner-line planner-line-minor"
                style="top:${top}px;">
            </div>
            `;

        }

    }


    /* =====================
       現在時刻ライン
    ===================== */

    if(
        date === todayString
    ){

        const top =
            15 + (currentMinutes * scale);


        html +=
        `
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

    events.forEach(e => {

        const start =
            new Date(e.start);

        const end =
            new Date(
                e.end || e.start
            );


        const startMinutes =
            start.getHours() * 60 +
            start.getMinutes();


        const duration =
            Math.max(
                30,
                (end - start) / 60000
            );


        const top =
            15 + (startMinutes * scale);


        const actualHeight =
            duration * scale;


        const displayHeight =
            Math.max(
                minimumEventHeight,
                actualHeight
            );


        const finished =
            end < now;


        const category =
            getCategoryInfo(
                e.category
            );


        const categoryColor =
            category?.color ||
            "#ffb3cc";


        const lightColor =
            getLightCategoryColor(
                categoryColor
            );


        /* =====================
           共有情報
        ===================== */



        /* =====================
           付箋
        ===================== */

        html +=
        `
        <div
            class="planner-event ${finished ? "finished-event" : ""}"
            data-event-id="${e.id}"
            data-actual-height="${actualHeight}"
            data-display-height="${displayHeight}"

            style="
                top:${top}px;
                height:${displayHeight}px;
                background:${lightColor};
                border-left-color:${categoryColor};
            "

            ontouchstart="plannerEventTouchStart(event, ${e.id})"
            ontouchend="plannerEventTouchEnd(event, ${e.id})"
            ontouchmove="plannerEventTouchMove(event)"

            onmousedown="plannerEventMouseDown(event, ${e.id})"
            onmouseup="plannerEventMouseUp(event)"
            onmouseleave="plannerEventMouseLeave(event)"

            onclick="plannerEventTap(event, ${e.id})"
        >


            <div class="planner-event-time">

                🕒
                ${e.start.substring(11,16)}

                ${
                    e.end
                    ?
                    " ～ " + e.end.substring(11,16)
                    :
                    ""
                }

            </div>


            <div class="planner-event-title">

                ${category?.icon || "📌"}

                <strong>
                    ${e.title}
                </strong>

            </div>


            ${
                e.place
                ?
                `
                <div class="planner-place">
                    📍 ${e.place}
                </div>
                `
                :
                ""
            }


            ${
                e.companion
                ?
                `
                <div class="planner-companion">
                    👥 ${e.companion}
                </div>
                `
                :
                ""
            }



${
    e.shareInfo && e.importedFromShare !== true
    ?
    `
    <div class="planner-share-info planner-share-sent">

        <div>
            📤 共有済み
        </div>

        ${
            e.shareInfo.recipients &&
            e.shareInfo.recipients.length > 0
            ?
            `
            <div>
                👥 共有先：
                ${Array.isArray(e.shareInfo.recipients)
                    ? e.shareInfo.recipients.join("、")
                    : e.shareInfo.recipients}
            </div>
            `
            :
            ""
        }

        ${
            e.shareInfo.sharedAt
            ?
            `
            <div>
                🕒 共有日時：
                ${formatShareDateTime(e.shareInfo.sharedAt)}
            </div>
            `
            :
            ""
        }

    </div>
    `
    :
    ""
}

${
    e.importedFromShare === true
    ?
    `
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
            ?
            `
            <div>
                🕒 受信日時：
                ${formatShareDateTime(e.importedAt)}
            </div>
            `
            :
            ""
        }

    </div>
    `
    :
    ""
}








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


    html +=
    `
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
                !event.target.closest(
                    ".planner-event"
                )
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

    if(
        date === todayString
    ){

        setTimeout(() => {

            const nowLine =
                document.querySelector(
                    ".planner-now-line"
                );


            if(nowLine){

                nowLine.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        },300);

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
   通常 ⇄ 実時間サイズ
===================== */

function plannerEventTap(event, id){

    /* ボタンを押した場合は無視 */

    if(
        event.target.closest(
            ".planner-event-actions"
        )
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

    const actualHeight =
        Number(
            eventBox.dataset.actualHeight
        );

    const displayHeight =
        Number(
            eventBox.dataset.displayHeight
        );

    if(
        !actualHeight ||
        !displayHeight
    ){
        return;
    }

    /* 実時間表示中か */

    const compact =
        eventBox.classList.contains(
            "planner-event-compact"
        );

    if(compact){

        eventBox.style.height =
            `${displayHeight}px`;

        eventBox.classList.remove(
            "planner-event-compact"
        );

    }else{

        eventBox.style.height =
            `${actualHeight}px`;

        eventBox.classList.add(
            "planner-event-compact"
        );

    }

}


/* =====================
   長押し
   編集モード
===================== */

function plannerEnterEditMode(id){

    document
        .querySelectorAll(
            ".planner-event"
        )
        .forEach(el=>{

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

}


function plannerCancelEditMode(){

    document
        .querySelectorAll(
            ".planner-event"
        )
        .forEach(el=>{

            el.classList.remove(
                "planner-event-editing"
            );

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
