/* =====================
   calendar.html 読み込み
===================== */

async function loadCalendarHTML(){

    const container =
        document.getElementById("calendarContainer");

    if(!container){
        return;
    }

    try{

        const response =
            await fetch("./calendar.html");

        if(!response.ok){
            throw new Error(
                "calendar.html の読み込みに失敗しました"
            );
        }

container.innerHTML =
    await response.text();

renderCalendar();



        

    }catch(error){

        console.error(
            "calendar.html 読み込みエラー:",
            error
        );

        container.innerHTML = `
            <div class="card">
                <p>
                    カレンダーを読み込めませんでした。
                </p>
            </div>
        `;

    }

}


/* =====================
   カレンダー状態
===================== */


let currentCalendarDate = new Date();

let selectedCalendarDate = null;

let editingEventId = null;


let pressTimer;
let menuDate = null;
let selectedEventId = null;

let copyEventId = [];
let copyMode = false;




/* =====================
   カレンダー生成
===================== */
async function renderCalendar(){

    const area =
        document.getElementById('calendar');

        
    if(!area) return;


    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();


    const first =
        new Date(
            year,
            month,
            1
        );


    const last =
        new Date(
            year,
            month + 1,
            0
        );


    const today =
        new Date();

    
const events =
    db.load().events || [];

// =====================
// 祝日取得
// =====================

const data =
    db.load();

const countryCode =
    data.settings?.holidayCountry || "JP";

const holidays =
    await loadHolidays(
        year,
        countryCode
    );

    

    let html = `

<div class="calendar-header">

<button onclick="changeMonth(-1)">
◀
</button>


<div
    class="calendar-title"
    onclick="openCalendarDatePicker()"
>
    ${year}年 ${month + 1}月
</div>

<button onclick="changeMonth(1)">
▶
</button>

</div>


<div class="calendar-grid">


<div class="calendar-week sunday">日</div>
<div class="calendar-week">月</div>
<div class="calendar-week">火</div>
<div class="calendar-week">水</div>
<div class="calendar-week">木</div>
<div class="calendar-week">金</div>
<div class="calendar-week saturday">土</div>
`;



    for(
        let i = 0;
        i < first.getDay();
        i++
    ){

        html += `<div></div>`;

    }




    for(
        let d = 1;
        d <= last.getDate();
        d++
    ){


        const date =
        `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;


const holiday =
    holidays.find(
        h =>
        h.date === date
    );
        
const hasEvent =
    events.some(
        e =>
        e.start &&
        e.start.startsWith(date)
    );


// =====================
// 🎉 記念日・誕生日
// 📸 写真・動画
// =====================

const anniversaries =
    data.anniversaryDays || [];

const hasAnniversary =
    anniversaries.some(a => {

        if(!a.visible || !a.date){
            return false;
        }

        if(a.yearly){

            const ad =
                a.date.substring(5);

            return ad === date.substring(5);

        }

        return a.date === date;

    });

const dayMemory =
    data.dayMemories?.[date];

const hasPhoto =
    !!(
        dayMemory &&
        dayMemory.photos &&
        dayMemory.photos.length > 0
    );

const dayIcons =
    (hasAnniversary ? '<span class="calendar-day-icon">🎉</span>' : '') +
    (hasPhoto ? '<span class="calendar-day-icon">📸</span>' : '');
    
        const isToday =
            today.getFullYear() === year
            &&
            today.getMonth() === month
            &&
            today.getDate() === d;



        const isSelected =
            selectedCalendarDate === date;


            const dayOfWeek =
    new Date(year, month, d).getDay();

let dateClass = '';

if(dayOfWeek === 0){
    dateClass = 'sunday';
}
else if(dayOfWeek === 6){
    dateClass = 'saturday';
}


const dayEvents =
    events
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

const preview =
    dayEvents
    .slice(0,2)
    .map(e=>{

        const category =
            getCategoryInfo(e.category);

        const color =
            category?.color || "#ffb3cc";

        return `
        <div
            class="calendar-event-preview"
            style="
                border-left:2px solid ${color};
            "
        >
            ${e.title.substring(0,6)}
        </div>
        `;

    })
    .join('');



const more =
    dayEvents.length > 2
    ? `
        <div class="calendar-more">
            +${dayEvents.length - 2}
        </div>
      `
    : '';

html += `

<div
class="calendar-day
${dateClass}
${holiday ? 'holiday' : ''}
${isToday ? 'today' : ''}
${hasEvent ? 'has-event' : ''}
${isSelected ? 'selected-day' : ''}
"

onclick="selectCalendarDate('${date}')"
ontouchstart="startPress('${date}', event)"
ontouchend="cancelPress()"
ontouchmove="cancelPress()">

<div class="calendar-date ${dateClass}">
${d}${dayIcons}
</div>


${
holiday
?
`
<div class="holiday-name">
${holiday.localName}
</div>
`
:
""
}



${preview}

${more}

</div>

`;


    }



    html += `

</div>

`;



    area.innerHTML = html;



    updateSelectedDateArea();

}



/* =====================
   今日に戻る
===================== */

function goToToday(){

    currentCalendarDate =
        new Date();

    selectedCalendarDate =
        null;

    window.selectedCalendarDate =
        null;

    renderCalendar();

}


/* =====================
   月変更
===================== */

function changeMonth(value){


    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth()
        +
        value
    );


    renderCalendar();

}

/* =====================
   日付選択
===================== */


function selectCalendarDate(date){

    console.log("📅 ===============================");
    console.log("📅 selectCalendarDate 実行:", date);
    console.log("📅 date:", date);
    console.log("📅 copyMode:", copyMode);


    /* =====================
       コピー貼り付け
    ===================== */

    if(copyMode){

        const data = db.load();

        const plan =
            PLAN[data.settings.plan];

        const remain =
            plan.eventLimit === Infinity
            ? Infinity
            : plan.eventLimit - data.events.length;


        if(remain <= 0){

            alert(
                `${plan.name}は予定${plan.eventLimit}件までです`
            );

            copyMode = false;
            copyEventId = [];

            return;

        }


        const ids =
            copyEventId.slice(
                0,
                remain === Infinity
                    ? copyEventId.length
                    : remain
            );


        ids.forEach(id => {

            const event =
                data.events.find(
                    e => e.id === id
                );

            if(!event) return;


            const startTime =
                event.start
                ? event.start.substring(11,16)
                : null;


            const endTime =
                event.end
                ? event.end.substring(11,16)
                : null;


            const newEvent = {

                ...event,

                id:
                    Date.now() +
                    Math.random(),

                start:
                    startTime
                    ? `${date}T${startTime}`
                    : "",

                end:
                    endTime
                    ? `${date}T${endTime}`
                    : ""

            };


            data.events.push(newEvent);

        });


        const copiedCount =
            ids.length;


        const originalCount =
            copyEventId.length;


        copyMode = false;
        copyEventId = [];


        /*
        =====================
           コピー先の日付を選択
        =====================
        */

        selectedCalendarDate =
            date;

        window.selectedCalendarDate =
            date;


        console.log(
            "📅 コピー先 selectedCalendarDate:",
            selectedCalendarDate
        );

        console.log(
            "📅 コピー先 window.selectedCalendarDate:",
            window.selectedCalendarDate
        );


        db.save(data);


        renderCalendar();

        displayEventList();

        displaySelectedDateEvents();

        displayHomeSchedule();

        displayUpcomingEvents();

        displayCountdown();


        if(copiedCount < originalCount){

            alert(
                `予定の上限のため、${copiedCount}件のみ貼り付けました`
            );

        }else{

            alert(
                "予定を貼り付けました"
            );

        }


        return;

    }


    /* =====================
       通常の日付選択
    ===================== */

    console.log(
        "📅 通常の日付選択:"
    );


    selectedCalendarDate =
        date;


    window.selectedCalendarDate =
        date;


    console.log(
        "📅 selectedCalendarDate 設定:",
        selectedCalendarDate
    );


    console.log(
        "📅 window.selectedCalendarDate 設定:",
        window.selectedCalendarDate
    );


    /* =====================
       予定追加フォームを閉じる
    ===================== */

    const form =
        document.getElementById(
            "event-form-card"
        );


    if(form){

        form.style.display =
            "none";

    }


    /* =====================
       入力途中の内容を消す
    ===================== */

    if(typeof clearEventForm === "function"){

        clearEventForm();

    }


    /* =====================
       カレンダー再描画
    ===================== */

    if(typeof renderCalendar === "function"){

        renderCalendar();

    }


    /* =====================
       予定表示更新
    ===================== */

    if(typeof displayEventList === "function"){

        displayEventList();

    }


    if(typeof displaySelectedDateEvents === "function"){

        displaySelectedDateEvents();

    }


    /* =====================
       1日手帳へ
    ===================== */

    switchTab(
        "plannerPage",
        null,
        true
    );


    /* =====================
       🎥 動画表示
       
       movie.js が読み込まれていて
       renderDayMovies が存在する場合だけ実行
    ===================== */

    console.log(
        "🎥 renderDayMovies 存在確認:",
        typeof renderDayMovies
    );


    if(
        typeof renderDayMovies === "function"
    ){

        console.log(
            "🎥 renderDayMovies 呼び出し"
        );

        renderDayMovies();

    }else{

        console.error(
            "❌ renderDayMovies が見つかりません"
        );

        console.error(
            "❌ movie.js が読み込まれているか確認してください"
        );

    }


    console.log("📅 ===============================");

}

/* =====================
   選択日の表示更新
===================== */
function updateSelectedDateArea(){

    const area =
        document.getElementById(
            'selected-event-area'
        );

    if(!area)
        return;

    if(!selectedCalendarDate){

        area.innerHTML =
        `
        📌 日付を選択してください
        `;

        return;

    }

    // 選択日の文字表示は削除
    area.innerHTML = "";

    displaySelectedDateEvents();

}

/* =====================
   選択日の予定表示
===================== */

/* =====================
   選択日の予定表示
===================== */

function displaySelectedDateEvents(){

    const box =
        document.getElementById(
            "selected-date-events"
        );

    if(!box) return;


    const events =
        db.load().events || [];


    const list =
        events
        .filter(
            e =>
                selectedCalendarDate &&
                e.start &&
                e.start.startsWith(
                    selectedCalendarDate
                )
        )
        .sort(
            (a,b) =>
                new Date(a.start) -
                new Date(b.start)
        );


    if(list.length === 0){

        box.innerHTML =
            "該当なし";

        return;

    }


    box.innerHTML =
        list.map(e => {

            /* =====================
               📤 送信情報
            ===================== */

            const shareInfo =
                e.shareInfo;


            let shareHTML = "";


            if(
                shareInfo &&
                shareInfo.sharedAt
            ){

                const recipients =
                    Array.isArray(
                        shareInfo.recipients
                    )
                    ? shareInfo.recipients.join("、")
                    : "";


                const sharedDate =
                    formatEventImportDate(
                        shareInfo.sharedAt
                    );


                shareHTML = `

                    <div class="event-share-record">

                        <div>
                            📤 共有済み
                        </div>

                        ${
                            recipients
                            ?
                            `
                            <div>
                                👥 共有先：
                                ${escapeEventShareHTML(
                                    recipients
                                )}
                            </div>
                            `
                            :
                            ""
                        }

                        <div>
                            🕒 共有日時：
                            ${sharedDate}
                        </div>

                    </div>

                `;

            }


            /* =====================
               📥 取り込み情報
            ===================== */

            let importHTML = "";


            if(
                e.importedFromShare &&
                e.importedAt
            ){

                const sender =
                    e.shareInfo?.sender ||
                    "不明";


                const importedDate =
                    formatEventImportDate(
                        e.importedAt
                    );


                importHTML = `

                    <div class="event-import-record">

                        <div>
                            📥 共有予定を取り込みました
                        </div>

                        <div>
                            👤 発信者：
                            ${escapeEventShareHTML(
                                sender
                            )}
                        </div>

                        <div>
                            🕒 受信日時：
                            ${importedDate}
                        </div>

                    </div>

                `;

            }


            return `

                <div class="event-card">

                    <div class="event-card-title">

                        ${
                            getCategoryInfo(
                                e.category
                            )?.icon ||
                            "📌"
                        }

                        ${escapeEventShareHTML(
                            e.title
                        )}

                    </div>


                    ${
                        e.start
                        ?
                        `
                        <div>
                            🕒 ${e.start.substring(11,16)}

                            ${
                                e.end
                                ?
                                " ～ " +
                                e.end.substring(
                                    11,
                                    16
                                )
                                :
                                ""
                            }
                        </div>
                        `
                        :
                        ""
                    }


                    ${
                        e.place
                        ?
                        `
                        <div>
                            📍
                            ${escapeEventShareHTML(
                                e.place
                            )}
                        </div>
                        `
                        :
                        ""
                    }


                    ${shareHTML}

                    ${importHTML}


                    <div class="event-button-area">

                        <button
                            class="icon-btn"
                            onclick="selectEvent(${e.id})"
                        >
                            ✏️
                        </button>


                        <button
                            class="icon-btn delete-btn"
                            onclick="deleteEvent(${e.id})"
                        >
                            🗑️
                        </button>

                    </div>

                </div>

            `;

        })
        .join("");

}

function startPress(date, event){

    if(event.touches.length > 1){
        return;
    }

    pressTimer = setTimeout(()=>{

        showDayMenu(date);

    },1000);

}


function cancelPress(){

    clearTimeout(pressTimer);

}

function showDayMenu(date){

    menuDate = date;

    document.getElementById(
        "dayMenuDate"
    ).textContent = date;

    document.getElementById(
        "dayMenuModal"
    ).style.display = "block";

}

function closeDayMenu(){

    document.getElementById(
        "dayMenuModal"
    ).style.display = "none";

}


function addEventFromMenu(){

    closeDayMenu();

    selectedCalendarDate = menuDate;

    openEventForm();


    const start = menuDate + "T18:00";
    const end   = menuDate + "T21:00";

    document.getElementById("event-start").value = start;
    document.getElementById("event-end").value = end;

}

function editEventFromMenu(){

    closeDayMenu();

    openEventSelectModal();

}


function deleteEventFromMenu(){

    closeDayMenu();

    openDeleteSelectModal();

}

function copyEventFromMenu(){

    closeDayMenu();

    const events =
        db.load().events.filter(
            e => e.start && e.start.startsWith(menuDate)
        );

    if(events.length === 0){

        alert("予定がありません");

        return;

    }

    openCopySelectModal();

}


function openDeleteSelectModal(){

    const list =
        document.getElementById(
            "deleteEventList"
        );


    const events =
        db.load().events.filter(
            e => e.start && e.start.startsWith(menuDate)
        );


    if(events.length === 0){

        alert("予定がありません");

        return;

    }

    list.innerHTML =

    events.map(e=>`

<label class="delete-item">
<input
type="checkbox"
value="${e.id}"
class="delete-check">

${getCategoryInfo(e.category)?.icon || "📌"}
${e.title}

</label>

`).join('');


    document.getElementById(
        "deleteSelectModal"
    ).style.display="block";

}


function closeDeleteSelectModal(){

    document.getElementById(
        "deleteSelectModal"
    ).style.display="none";

}

function deleteSelectedEvents(){

    const checks =
        document.querySelectorAll(
            ".delete-check:checked"
        );


    if(checks.length === 0){

        alert("削除する予定を選択してください");

        return;

    }


    if(!confirm(
        "選択した予定を削除しますか？"
    )){

        return;

    }


    const ids =
        Array.from(checks)
        .map(
            c=>Number(c.value)
        );


    const data =
        db.load();


    data.events =
        data.events.filter(
            e=>!ids.includes(e.id)
        );


    db.save(data);


    closeDeleteSelectModal();


    displayEventList();

    displaySelectedDateEvents();

    renderCalendar();

    displayHomeSchedule();

    displayUpcomingEvents();

}


function openCopySelectModal(){

    const list =
        document.getElementById(
            "copyEventList"
        );

    const events =
        db.load().events.filter(
            e => e.start && e.start.startsWith(menuDate)
        );

    if(events.length === 0){

        alert("予定がありません");

        return;

    }

    list.innerHTML =

    events.map(e=>`

    <label>

    <input
    type="checkbox"
    value="${e.id}"
    class="copy-check">

    ${getCategoryInfo(e.category)?.icon || "📌"}
    ${e.title}

    </label>

    <br>

    `).join('');

    document.getElementById(
        "copySelectModal"
    ).style.display="block";

}

function closeCopySelectModal(){

    document.getElementById(
        "copySelectModal"
    ).style.display = "none";

}

function copySelectedEvents(){

    const checks =
        document.querySelectorAll(
            ".copy-check:checked"
        );

    if(checks.length===0){

        alert("コピーする予定を選択してください");

        return;

    }

    copyEventId =
        Array.from(checks)
        .map(c=>Number(c.value));

    copyMode = true;

    closeCopySelectModal();

    alert("貼り付け先の日付を選択してください");

}


/* =====================
   カレンダー年月選択
===================== */

function openCalendarDatePicker(){

    const modal =
        document.getElementById(
            "calendarDatePickerModal"
        );

    const yearSelect =
        document.getElementById(
            "calendarYearSelect"
        );

    const monthSelect =
        document.getElementById(
            "calendarMonthSelect"
        );


    if(
        !modal ||
        !yearSelect ||
        !monthSelect
    ){
        return;
    }


    /* =====================
       年の選択肢を作成
    ===================== */

    const currentYear =
        currentCalendarDate.getFullYear();


    yearSelect.innerHTML = "";


    /*
       現在年の前後10年を選択可能
    */

    for(
        let year = currentYear - 10;
        year <= currentYear + 10;
        year++
    ){

        const option =
            document.createElement("option");

        option.value = year;

        option.textContent =
            `${year}年`;

        yearSelect.appendChild(option);

    }


    /* =====================
       現在の年月を選択状態にする
    ===================== */

    yearSelect.value =
        currentYear;


    monthSelect.value =
        currentCalendarDate.getMonth();


    /* =====================
       モーダル表示
    ===================== */

    modal.style.display = "block";

}


/* =====================
   年月選択を閉じる
===================== */

function closeCalendarDatePicker(){

    const modal =
        document.getElementById(
            "calendarDatePickerModal"
        );

    if(!modal){
        return;
    }


    modal.style.display = "none";

}


/* =====================
   選択した年月へ移動
===================== */

function applyCalendarDatePicker(){

    const yearSelect =
        document.getElementById(
            "calendarYearSelect"
        );

    const monthSelect =
        document.getElementById(
            "calendarMonthSelect"
        );


    if(
        !yearSelect ||
        !monthSelect
    ){
        return;
    }


    const year =
        Number(yearSelect.value);


    const month =
        Number(monthSelect.value);


    /* =====================
       カレンダー年月を変更
    ===================== */

    currentCalendarDate =
        new Date(
            year,
            month,
            1
        );


    /* =====================
       モーダルを閉じる
    ===================== */

    closeCalendarDatePicker();


    /* =====================
       カレンダー再描画
    ===================== */

    renderCalendar();

}




/* =====================
   初期読み込み
===================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCalendarHTML();

    }
);





/* =====================
   共有対象の予定
===================== */

let eventShareSelectedIds = [];

/* =====================================================
   📤 予定共有画面を開く
===================================================== */

function openEventShareScreen(){

    const screen =
        document.getElementById("eventShareScreen");

    if(!screen){
        console.log(
            "eventShareScreen が見つかりません"
        );
        return;
    }


    /* =====================
       共有画面を表示
    ===================== */

    screen.style.display = "block";


    /* =====================
       カレンダーを一時的に非表示
    ===================== */

    const calendar =
        document.getElementById("calendar");

    if(calendar){
        calendar.style.display = "none";
    }


    /* =====================
       共有日時
    ===================== */

    updateEventShareDateTime();


    /* =====================
       選択状態をリセット
    ===================== */

    eventShareSelectedIds = [];


    const selectAll =
        document.getElementById(
            "eventShareSelectAll"
        );

    if(selectAll){
        selectAll.checked = false;
    }


    /* =====================
       カテゴリ作成
    ===================== */

    updateEventShareCategories();


    /* =====================
       予定一覧表示
    ===================== */

    renderEventShareList();


    /* =====================
       選択件数更新
    ===================== */

    updateEventShareSelectedCount();


    /* =====================
       上部へ
    ===================== */

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}

/* =====================================================
   📤 予定共有画面を閉じる
===================================================== */

function closeEventShareScreen(){

    const screen =
        document.getElementById(
            "eventShareScreen"
        );

    if(screen){

        screen.style.display = "none";

    }


    const calendar =
        document.getElementById("calendar");

    if(calendar){

        calendar.style.display = "";

    }

}

/* =====================================================
   🕒 共有日時
===================================================== */

function updateEventShareDateTime(){

    const dateTime =
        document.getElementById(
            "eventShareDateTime"
        );

    if(!dateTime){
        return;
    }


    const now = new Date();


    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2,"0");

    const day =
        String(
            now.getDate()
        ).padStart(2,"0");

    const hour =
        String(
            now.getHours()
        ).padStart(2,"0");

    const minute =
        String(
            now.getMinutes()
        ).padStart(2,"0");


    dateTime.textContent =
        `${year}/${month}/${day} ` +
        `${hour}:${minute}`;

}

/* =====================================================
   📂 共有カテゴリ
===================================================== */

function updateEventShareCategories(){

    const select =
        document.getElementById(
            "eventShareCategory"
        );

    if(!select){
        return;
    }


    const data =
        db.load();

    const categories =
        data.categories || [];


    let html =
        `<option value="all">
            すべてのカテゴリ
        </option>`;


    categories.forEach(category => {

        html += `
            <option value="${escapeEventShareHTML(category.name)}">
                ${category.icon || ""} 
                ${escapeEventShareHTML(category.name)}
            </option>
        `;

    });


    select.innerHTML = html;


    /* =====================
       カテゴリ変更
    ===================== */

    select.onchange = function(){

        eventShareSelectedIds = [];

        const selectAll =
            document.getElementById(
                "eventShareSelectAll"
            );

        if(selectAll){
            selectAll.checked = false;
        }

        renderEventShareList();

        updateEventShareSelectedCount();

    };

}

/* =====================================================
   📅 共有予定一覧
===================================================== */

function renderEventShareList(){

    const list =
        document.getElementById(
            "eventShareEventList"
        );

    if(!list){
        return;
    }


    const data =
        db.load();

    let events =
        data.events || [];


    /* =====================
       📅 共有期間
    ===================== */

    const range =
        getEventShareDateRange();


    /* =====================
       今日以降＋期間内
    ===================== */

    events =
        events.filter(event => {

            if(!event.start){
                return false;
            }

            return isEventInSharePeriod(
                event,
                range
            );

        });


    /* =====================
       📂 カテゴリ絞り込み
    ===================== */

    const categorySelect =
        document.getElementById(
            "eventShareCategory"
        );

    const selectedCategory =
        categorySelect
        ? categorySelect.value
        : "all";


    if(selectedCategory !== "all"){

        events =
            events.filter(
                event =>
                    event.category ===
                    selectedCategory
            );

    }


    /* =====================
       📅 日付順
    ===================== */

    events.sort(
        (a,b) =>
            new Date(a.start) -
            new Date(b.start)
    );


    /* =====================
       📭 予定なし
    ===================== */

    if(events.length === 0){

        list.innerHTML = `
            <div class="event-share-empty">
                📭 指定した期間に共有できる予定がありません
            </div>
        `;

        updateEventShareSelectedCount();

        return;

    }


    /* =====================
       📋 一覧作成
    ===================== */

    list.innerHTML =
        events.map(event => {

            const checked =
                eventShareSelectedIds
                .includes(event.id)
                ? "checked"
                : "";


            const date =
                formatEventShareDate(
                    event.start
                );


            const category =
                getCategoryInfo(
                    event.category
                );


            const icon =
                category?.icon ||
                "📅";


            return `

                <label
                    class="event-share-event-item"
                >

                    <input
                        type="checkbox"
                        class="event-share-event-checkbox"
                        value="${event.id}"
                        ${checked}
                        onchange="toggleEventShareSelection(${event.id})"
                    >

                    <div
                        class="event-share-event-info"
                    >

                        <div
                            class="event-share-event-title"
                        >
                            ${icon}
                            ${escapeEventShareHTML(
                                event.title ||
                                "予定"
                            )}
                        </div>

                        <div
                            class="event-share-event-date"
                        >
                            📅 ${date}
                        </div>

                        ${
                            event.place
                            ? `
                            <div
                                class="event-share-event-place"
                            >
                                📍
                                ${escapeEventShareHTML(
                                    event.place
                                )}
                            </div>
                            `
                            : ""
                        }

                    </div>

                </label>

            `;

        }).join("");


    /* =====================
       選択件数更新
    ===================== */

    updateEventShareSelectedCount();

}

/* =====================================================
   ☑️ 個別選択
===================================================== */

function toggleEventShareSelection(id){

    const index =
        eventShareSelectedIds.indexOf(id);


    if(index === -1){

        eventShareSelectedIds.push(id);

    }else{

        eventShareSelectedIds.splice(
            index,
            1
        );

    }


    /* =====================
       すべて選択の状態更新
    ===================== */

    const selectAll =
        document.getElementById(
            "eventShareSelectAll"
        );

    const checkboxes =
        document.querySelectorAll(
            ".event-share-event-checkbox"
        );


    if(
        selectAll &&
        checkboxes.length > 0
    ){

        selectAll.checked =
            eventShareSelectedIds.length ===
            checkboxes.length;

    }


    updateEventShareSelectedCount();

    updateEventShareSummary();

}

/* =====================================================
   ☑️ すべて選択
===================================================== */

function toggleEventShareSelectAll(){

    const selectAll =
        document.getElementById(
            "eventShareSelectAll"
        );

    const list =
        document.getElementById(
            "eventShareEventList"
        );

    if(
        !selectAll ||
        !list
    ){
        return;
    }


    const checkboxes =
        list.querySelectorAll(
            ".event-share-event-checkbox"
        );


    eventShareSelectedIds = [];


    checkboxes.forEach(
        checkbox => {

            checkbox.checked =
                selectAll.checked;


            if(selectAll.checked){

                eventShareSelectedIds.push(
                    Number(
                        checkbox.value
                    )
                );

            }

        }
    );


    updateEventShareSelectedCount();

    updateEventShareSummary();

}


/* =====================================================
   🗓 共有期間変更
===================================================== */

function changeEventSharePeriod(){

    const periodSelect =
        document.getElementById(
            "eventSharePeriod"
        );

    if(!periodSelect){
        return;
    }


    const period =
        periodSelect.value;


    const customPeriod =
        document.getElementById(
            "eventShareCustomPeriod"
        );


    /* =====================
       期間指定
    ===================== */

    if(customPeriod){

        customPeriod.style.display =
            period === "custom"
            ? "block"
            : "none";

    }


    renderEventShareList();

}

/* =====================================================
   📂 カテゴリ変更
===================================================== */

function changeEventShareCategory(){

    renderEventShareList();

}

/* =====================================================
   📅 共有対象期間取得
===================================================== */

function getEventShareDateRange(){

    const periodSelect =
        document.getElementById(
            "eventSharePeriod"
        );


    const period =
        periodSelect
        ? periodSelect.value
        : "3month";


    const now =
        new Date();


    /* =====================
       今日の開始
    ===================== */

    const start =
        new Date(

            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0,
            0

        );


    /* =====================
       すべて
    ===================== */

    if(period === "all"){

        return {

            start:null,

            end:null

        };

    }


    /* =====================
       期間指定
    ===================== */

    if(period === "custom"){

        const startInput =
            document.getElementById(
                "eventShareStartDate"
            );

        const endInput =
            document.getElementById(
                "eventShareEndDate"
            );


        const startDate =
            startInput?.value
            ? new Date(
                startInput.value +
                "T00:00:00"
            )
            : start;


        const endDate =
            endInput?.value
            ? new Date(
                endInput.value +
                "T23:59:59"
            )
            : null;


        return {

            start:startDate,

            end:endDate

        };

    }


    /* =====================
       ○か月
    ===================== */

    const months = {

        "1month":1,

        "3month":3,

        "6month":6

    };


    if(period === "1year"){

        const end =
            new Date(

                start.getFullYear() + 1,
                start.getMonth(),
                start.getDate(),
                23,
                59,
                59,
                999

            );


        return {

            start:start,

            end:end

        };

    }


    const monthCount =
        months[period] || 3;


    const end =
        new Date(

            start.getFullYear(),
            start.getMonth() +
                monthCount,
            start.getDate(),
            23,
            59,
            59,
            999

        );


    return {

        start:start,

        end:end

    };

}

/* =====================================================
   📅 予定が期間内か確認
===================================================== */

function isEventInSharePeriod(
    event,
    range
){

    if(
        !range.start &&
        !range.end
    ){

        return true;

    }


    const eventDate =
        getEventShareEventDate(event);


    if(!eventDate){

        return false;

    }


    if(
        range.start &&
        eventDate < range.start
    ){

        return false;

    }


    if(
        range.end &&
        eventDate > range.end
    ){

        return false;

    }


    return true;

}

/* =====================================================
   📅 予定の日付取得
===================================================== */

function getEventShareEventDate(event){

    if(!event){
        return null;
    }


    const value =
        event.start ||
        event.date ||
        event.startDate;


    if(!value){
        return null;
    }


    const date =
        new Date(value);


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return null;

    }


    return date;

}

/* =====================================================
   📅 日付表示
===================================================== */

function formatEventShareDate(value){

    const date =
        new Date(value);


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return "";

    }


    const year =
        date.getFullYear();

    const month =
        date.getMonth() + 1;

    const day =
        date.getDate();


    const hour =
        String(
            date.getHours()
        ).padStart(2,"0");

    const minute =
        String(
            date.getMinutes()
        ).padStart(2,"0");


    return (
        `${year}/${month}/${day} ` +
        `${hour}:${minute}`
    );

}

/* =====================================================
   🔢 選択件数
===================================================== */

function updateEventShareSelectedCount(){

    const count =
        eventShareSelectedIds.length;


    const countElement =
        document.getElementById(
            "eventShareSelectedCount"
        );

    if(countElement){

        countElement.textContent =
            `${count}件選択`;

    }


    const exportBtn =
        document.getElementById(
            "eventShareExportBtn"
        );

    if(exportBtn){

        exportBtn.disabled =
            count === 0;

    }


    updateEventShareSummary();

}

/* =====================================================
   📋 共有内容確認
===================================================== */

function updateEventShareSummary(){

    const summary =
        document.getElementById(
            "eventShareSummary"
        );

    if(!summary){
        return;
    }


    const text =
        summary.querySelector(
            ".event-share-summary-text"
        );

    if(!text){
        return;
    }


    if(eventShareSelectedIds.length === 0){

        text.textContent =
            "予定を選択してください";

        return;

    }


    const data =
        db.load();


    const selectedEvents =
        (data.events || [])
        .filter(event =>
            eventShareSelectedIds
            .includes(event.id)
        );


    if(selectedEvents.length === 0){

        text.textContent =
            "予定を選択してください";

        return;

    }


    const names =
        selectedEvents
        .map(event =>
            event.title || "予定"
        );


    text.textContent =
        `${selectedEvents.length}件の予定を共有します。\n` +
        names.join("、");

}

/* =====================================================
   👥 共有先
   「、」→「,」
===================================================== */

function normalizeEventShareRecipients(){

    const input =
        document.getElementById(
            "eventShareRecipients"
        );


    if(!input){
        return;
    }


    let value =
        input.value;


    /* =====================
       全角読点を半角カンマへ
    ===================== */

    value =
        value.replace(
            /、/g,
            ","
        );


    /* =====================
       全角カンマも変換
    ===================== */

    value =
        value.replace(
            /，/g,
            ","
        );


    /* =====================
       連続カンマを整理
    ===================== */

    value =
        value.replace(
            /,{2,}/g,
            ","
        );


    input.value =
        value;

}

/* =====================================================
   📤 共有実行
===================================================== */

/* =====================================================
   📤 予定共有・エクスポート
===================================================== */

function exportSelectedEventsForShare(){

    /* =====================
       プランチェック
    ===================== */

    const data = db.load();

    const plan =
        PLAN[data.settings?.plan];

    if(!plan){

        alert(
            "プラン情報を確認できません。"
        );

        return;

    }


    /* =====================
       無料プラン
    ===================== */

    if(data.settings?.plan === "free"){

        alert(
            "🔒 予定共有はプレミアム以上で利用できます。"
        );

        return;

    }


    /* =====================
       共有予定チェック
    ===================== */

    if(
        eventShareSelectedIds.length === 0
    ){

        alert(
            "共有する予定を選択してください。"
        );

        return;

    }


    /* =====================
       共有先
    ===================== */

    const recipientInput =
        document.getElementById(
            "eventShareRecipients"
        );

    let recipients =
        recipientInput
        ? recipientInput.value.trim()
        : "";


    if(!recipients){

        alert(
            "共有先を入力してください。"
        );

        if(recipientInput){
            recipientInput.focus();
        }

        return;

    }


    recipients =
        recipients
        .replace(/、/g,",")
        .replace(/，/g,",");


    const recipientList =
        recipients
        .split(",")
        .map(name => name.trim())
        .filter(name => name);


    if(recipientList.length === 0){

        alert(
            "共有先を入力してください。"
        );

        return;

    }


    /* =====================
       発信者
    ===================== */

    const senderInput =
        document.getElementById(
            "eventShareSender"
        );

    const sender =
        senderInput
        ? senderInput.value.trim()
        : "";


    if(!sender){

        alert(
            "発信者名を入力してください。"
        );

        if(senderInput){
            senderInput.focus();
        }

        return;

    }


    /* =====================
       選択予定取得
    ===================== */

    const selectedEvents =
        (data.events || [])
        .filter(event =>
            eventShareSelectedIds
                .includes(event.id)
        );


    if(selectedEvents.length === 0){

        alert(
            "共有する予定がありません。"
        );

        return;

    }


    /* =====================
       共有日時
    ===================== */

    const sharedAt =
        new Date().toISOString();


    /* =================================================
       自分側の予定に共有情報を保存
    ================================================= */

    data.events =
        (data.events || []).map(event => {

            if(
                !eventShareSelectedIds
                    .includes(event.id)
            ){

                return event;

            }


            return {

                ...event,

                shareStatus:
                    "sent",

                shareRecipients:
                    recipientList.join("、"),

                sharedAt:
                    sharedAt

            };

        });


    /* =====================
       DB保存
    ===================== */

    db.save(data);


    /* =====================
       共有データ作成
    ===================== */

    const shareData = {

        type:
            "oshi-app-event-share",

        version:
            1,

        sharedAt:
            sharedAt,

        sender:
            sender,

        recipients:
            recipientList,

        events:
            selectedEvents.map(event => ({

                ...event,

                shareInfo: {

                    sender:
                        sender,

                    recipients:
                        recipientList,

                    sharedAt:
                        sharedAt

                }

            }))

    };


    /* =====================
       JSON作成
    ===================== */

    const json =
        JSON.stringify(
            shareData,
            null,
            2
        );


    const file =
        new File(
            [json],
            "oshi-app-events.json",
            {
                type:
                    "application/json"
            }
        );


    /* =================================================
       スマホ共有
    ================================================= */

    if(navigator.share){

        let canShareFile = false;

        try{

            if(navigator.canShare){

                canShareFile =
                    navigator.canShare({
                        files:[file]
                    });

            }

        }
        catch(error){

            console.log(
                "canShare確認エラー:",
                error
            );

        }


        if(canShareFile){

            navigator.share({

                title:
                    "推し活手帳 予定共有",

                text:
                    `${sender}さんから予定が共有されました。`,

                files:[
                    file
                ]

            })
            .then(() => {

                console.log(
                    "📤 共有成功"
                );


                saveEventShareHistory(
                    recipientList,
                    sender,
                    selectedEvents,
                    sharedAt
                );


                /* =====================
                   1日手帳を更新
                ===================== */

                if(
                    selectedCalendarDate
                ){

                    showPlanner(
                        selectedCalendarDate,
                        false
                    );

                }

            })
            .catch(error => {

                console.log(
                    "📤 共有エラー:",
                    error
                );


                if(
                    error &&
                    error.name === "AbortError"
                ){

                    return;

                }


                downloadEventShareFile(
                    json,
                    recipientList,
                    sender,
                    selectedEvents,
                    sharedAt
                );

            });


            return;

        }

    }


    /* =================================================
       共有非対応
       → ファイル保存
    ================================================= */

    downloadEventShareFile(
        json,
        recipientList,
        sender,
        selectedEvents,
        sharedAt
    );

}

/* =================================================
   📥 予定共有ファイル保存
================================================= */

function downloadEventShareFile(
    json,
    recipientList,
    sender,
    selectedEvents,
    sharedAt
){

    try{

        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const a =
            document.createElement("a");


        a.href =
            url;


        a.download =
            "oshi-app-events.json";


        document.body.appendChild(a);


        a.click();


        a.remove();


        setTimeout(() => {

            URL.revokeObjectURL(url);

        },1000);


        /* =====================
           共有履歴保存
        ===================== */

        saveEventShareHistory(
            recipientList,
            sender,
            selectedEvents,
            sharedAt
        );


        alert(
            "📥 共有ファイルを保存しました。\n\n" +
            "保存した「oshi-app-events.json」を\n" +
            "LINEなどで送信してください。"
        );


    }catch(error){

        console.error(
            "📥 ファイル保存エラー:",
            error
        );


        alert(
            "共有ファイルを作成できませんでした。"
        );

    }

}

/* =====================================================
   💾 共有履歴
   ＋ 予定そのものにも共有情報を保存
===================================================== */

function saveEventShareHistory(
    recipients,
    sender,
    events,
    sharedAt
){

    const data =
        db.load();


    /* =====================
       共有履歴
    ===================== */

    if(
        !data.eventShareHistory
    ){

        data.eventShareHistory = [];

    }


    data.eventShareHistory.push({

        id:
            Date.now(),

        sender:
            sender,

        recipients:
            recipients,

        eventIds:
            events.map(
                event => event.id
            ),

        sharedAt:
            sharedAt

    });


    /* =====================
       📤 予定そのものに
       共有情報を保存
    ===================== */

    if(
        Array.isArray(data.events)
    ){

        data.events =
            data.events.map(event => {

                const sharedEvent =
                    events.find(
                        target =>
                            target.id ===
                            event.id
                    );


                if(!sharedEvent){

                    return event;

                }


                return {

                    ...event,

                    shareInfo: {

                        sender:
                            sender,

                        recipients:
                            recipients,

                        sharedAt:
                            sharedAt

                    }

                };

            });

    }


    /* =====================
       保存
    ===================== */

    db.save(data);


    /* =====================
       📅 予定表示を更新
    ===================== */

    renderCalendar();

    displaySelectedDateEvents();

    displayEventList();

}

/* =====================================================
   🔒 HTMLエスケープ
===================================================== */

function escapeEventShareHTML(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* =====================================================
   📅 共有期間指定の日付変更
===================================================== */

function changeEventShareCustomDate(){

    eventShareSelectedIds = [];


    const selectAll =
        document.getElementById(
            "eventShareSelectAll"
        );

    if(selectAll){

        selectAll.checked = false;

    }


    renderEventShareList();

    updateEventShareSelectedCount();

}





/* =====================================================
   📥 予定取り込み
===================================================== */


/* =====================
   取り込みデータ
===================== */

let eventImportData = null;


/* =====================
   取り込み選択ID
===================== */

let eventImportSelectedIds = [];


/* =====================================================
   📥 取り込み画面を開く
===================================================== */
function openEventImportScreen(){

    const screen =
        document.getElementById(
            "eventImportScreen"
        );

    if(!screen){
        return;
    }


    /* =====================
       🔒 プラン確認
    ===================== */

    const data =
        db.load();

    const plan =
        PLAN[data.settings?.plan];


    if(!plan){

        alert(
            "プラン情報を確認できません。"
        );

        return;

    }


    const isFree =
        data.settings?.plan === "free";


    /* =====================
       初期化
    ===================== */

    eventImportData = null;

    eventImportSelectedIds = [];


    const fileInput =
        document.getElementById(
            "eventImportFile"
        );

    if(fileInput){

        fileInput.value = "";

    }


    const info =
        document.getElementById(
            "eventImportInfo"
        );

    if(info){

        info.style.display = "none";

    }


    const list =
        document.getElementById(
            "eventImportEventList"
        );

    if(list){

        list.innerHTML = "";

    }


    const count =
        document.getElementById(
            "eventImportCount"
        );

    if(count){

        count.textContent = "";

    }


    const button =
        document.getElementById(
            "eventImportExecuteBtn"
        );

    if(button){

        button.disabled = true;

    }


    /* =====================
       🔒 プラン案内
    ===================== */

    const notice =
        document.getElementById(
            "eventImportPlanNotice"
        );


    if(notice){

        if(isFree){

            notice.innerHTML = `
                🔒 <strong>予定の取り込みは有料プラン限定です。</strong>
                <br>
                プレミアム以上のプランで利用できます。
            `;

            notice.style.display = "block";

        }else{

            notice.innerHTML = `
                📥 <strong>${plan.name}</strong>で予定を取り込めます。
            `;

            notice.style.display = "block";

        }

    }


    /* =====================
       📂 ファイル選択ボタン
    ===================== */

    const fileLabel =
        document.getElementById(
            "eventImportFileLabel"
        );


    if(fileLabel){

        if(isFree){

            fileLabel.style.opacity = "0.5";

            fileLabel.style.pointerEvents =
                "none";

        }else{

            fileLabel.style.opacity = "";

            fileLabel.style.pointerEvents =
                "";

        }

    }


    /* =====================
       ファイル入力自体も無効化
    ===================== */

    if(fileInput){

        fileInput.disabled =
            isFree;

    }


    /* =====================
       画面表示
    ===================== */

    screen.style.display = "block";


    /* =====================
       カレンダー非表示
    ===================== */

    const calendar =
        document.getElementById(
            "calendar"
        );

    if(calendar){

        calendar.style.display = "none";

    }


    /* =====================
       上部へ
    ===================== */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

/* =====================================================
   📥 取り込み画面を閉じる
===================================================== */
function closeEventImportScreen(){

    const screen =
        document.getElementById(
            "eventImportScreen"
        );

    if(screen){

        screen.style.display = "none";

    }


    const calendar =
        document.getElementById(
            "calendar"
        );

    if(calendar){

        calendar.style.display = "";

    }

}

/* =====================================================
   📂 JSONファイル読み込み
===================================================== */
function handleEventImportFile(event){

    const file =
        event.target.files?.[0];


    if(!file){

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(){

            try{

                const json =
                    JSON.parse(
                        reader.result
                    );


                validateEventShareData(
                    json
                );


                eventImportData =
                    json;


                eventImportSelectedIds =
                    [];


                renderEventImportInfo();

                renderEventImportList();


            }catch(error){

                console.error(
                    "予定取り込みエラー:",
                    error
                );


                eventImportData =
                    null;


                alert(
                    "共有ファイルを読み込めませんでした。\n\n" +
                    "推し活手帳から作成した共有ファイルか確認してください。"
                );

            }

        };


    reader.onerror =
        function(){

            alert(
                "ファイルを読み込めませんでした。"
            );

        };


    reader.readAsText(
        file,
        "UTF-8"
    );

}
/* =====================================================
   🔒 共有データ確認
===================================================== */
function validateEventShareData(data){

    if(!data){

        throw new Error(
            "データがありません"
        );

    }


    if(
        data.type !==
        "oshi-app-event-share"
    ){

        throw new Error(
            "共有ファイルではありません"
        );

    }


    if(
        !Array.isArray(
            data.events
        )
    ){

        throw new Error(
            "予定データがありません"
        );

    }


    if(
        data.version !== 1
    ){

        throw new Error(
            "対応していない共有ファイルです"
        );

    }

}
/* =====================================================
   📋 共有情報表示
===================================================== */
function renderEventImportInfo(){

    if(!eventImportData){

        return;

    }


    const info =
        document.getElementById(
            "eventImportInfo"
        );


    const sender =
        document.getElementById(
            "eventImportSender"
        );


    const recipients =
        document.getElementById(
            "eventImportRecipients"
        );


    const sharedAt =
        document.getElementById(
            "eventImportSharedAt"
        );


    if(info){

        info.style.display = "block";

    }


    if(sender){

        sender.textContent =
            eventImportData.sender ||
            "不明";

    }


    if(recipients){

        recipients.textContent =
            Array.isArray(
                eventImportData.recipients
            )
            ? eventImportData.recipients.join("、")
            : "不明";

    }


    if(sharedAt){

        sharedAt.textContent =
            formatEventImportDate(
                eventImportData.sharedAt
            );

    }

}
/* =====================================================
   📅 取り込み予定一覧
===================================================== */
function renderEventImportList(){

    const list =
        document.getElementById(
            "eventImportEventList"
        );


    if(!list){

        return;

    }


    if(
        !eventImportData ||
        !Array.isArray(
            eventImportData.events
        )
    ){

        list.innerHTML = "";

        return;

    }


    const data =
        db.load();


    const existingEvents =
        data.events || [];


    /*
    =====================
       選択状態を一度リセット
    =====================
    */

    eventImportSelectedIds = [];


    list.innerHTML =
        eventImportData.events
        .map(event => {

            const duplicate =
                isDuplicateImportedEvent(
                    event,
                    existingEvents
                );


            /*
            =====================
               重複していない予定だけ
               初期選択
            =====================
            */

            const checked =
                !duplicate;


            if(
                checked
            ){

                eventImportSelectedIds.push(
                    event.id
                );

            }


            const icon =
                getCategoryInfo(
                    event.category
                )?.icon ||
                "📅";


            return `

                <label
                    class="event-import-event-item"
                >

                    <input
                        type="checkbox"
                        class="event-import-event-checkbox"
                        value="${event.id}"
                        ${checked ? "checked" : ""}
                        ${duplicate ? "disabled" : ""}
                        onchange="toggleEventImportSelection(${event.id})"
                    >

                    <div
                        class="event-import-event-info"
                    >

                        <div
                            class="event-import-event-title"
                        >
                            ${icon}
                            ${escapeEventShareHTML(
                                event.title ||
                                "予定"
                            )}
                        </div>


                        <div
                            class="event-import-event-date"
                        >
                            📅
                            ${formatEventShareDate(
                                event.start
                            )}
                        </div>


                        ${
                            event.place
                            ? `
                            <div
                                class="event-import-event-place"
                            >
                                📍
                                ${escapeEventShareHTML(
                                    event.place
                                )}
                            </div>
                            `
                            : ""
                        }


                        ${
                            duplicate
                            ? `
                            <div
                                class="event-import-duplicate"
                            >
                                ⚠️ すでに登録されています
                            </div>
                            `
                            : ""
                        }

                    </div>

                </label>

            `;

        })
        .join("");


    updateEventImportCount();

}

/* =====================================================
   ☑️ 取り込み選択
===================================================== */
function toggleEventImportSelection(id){

    const index =
        eventImportSelectedIds
            .indexOf(id);


    if(index === -1){

        eventImportSelectedIds.push(
            id
        );

    }else{

        eventImportSelectedIds.splice(
            index,
            1
        );

    }


    updateEventImportCount();

}

/* =====================================================
   🔢 取り込み件数
===================================================== */
function updateEventImportCount(){

    const count =
        eventImportSelectedIds.length;


    const countElement =
        document.getElementById(
            "eventImportCount"
        );


    if(countElement){

        countElement.textContent =
            `${count}件の予定を取り込みます`;

    }


    const button =
        document.getElementById(
            "eventImportExecuteBtn"
        );


    if(button){

        button.disabled =
            count === 0;

    }

}


/* =====================================================
   🔍 重複チェック
===================================================== */

function isDuplicateImportedEvent(
    importedEvent,
    existingEvents
){

    return existingEvents.some(
        event => {

            if(
                importedEvent.shareInfo &&
                importedEvent.shareInfo.sharedAt &&
                event.shareInfo &&
                event.shareInfo.sharedAt ===
                    importedEvent.shareInfo.sharedAt
            ){

                return (
                    event.title ===
                    importedEvent.title &&
                    event.start ===
                    importedEvent.start
                );

            }


            return (
                event.title ===
                importedEvent.title &&
                event.start ===
                importedEvent.start &&
                event.place ===
                importedEvent.place
            );

        }
    );

}


/* =====================================================
   📥 予定取り込み実行
===================================================== */

function importSelectedEvents(){

    /* =====================
       共有データ確認
    ===================== */

    if(
        !eventImportData ||
        !Array.isArray(
            eventImportData.events
        )
    ){

        alert(
            "取り込む予定がありません。"
        );

        return;

    }


    /* =====================
       プランチェック
    ===================== */

    const data =
        db.load();

    const plan =
        PLAN[data.settings?.plan];


    if(!plan){

        alert(
            "プラン情報を確認できません。"
        );

        return;

    }


    /* =====================
       無料プラン
    ===================== */

    if(
        data.settings?.plan === "free"
    ){

        alert(
            "🔒 予定の取り込みはプレミアム以上で利用できます。"
        );

        return;

    }


    /* =====================
       選択確認
    ===================== */

    if(
        eventImportSelectedIds.length === 0
    ){

        alert(
            "取り込む予定を選択してください。"
        );

        return;

    }


    /* =====================
       events 初期化
    ===================== */

    if(
        !Array.isArray(data.events)
    ){

        data.events = [];

    }


    /* =====================
       選択された予定
    ===================== */

    const selectedEvents =
        eventImportData.events
        .filter(event =>
            eventImportSelectedIds
                .includes(event.id)
        );


    if(selectedEvents.length === 0){

        alert(
            "取り込む予定がありません。"
        );

        return;

    }


    /* =====================
       取り込み前件数
    ===================== */

    const originalSelectedCount =
        selectedEvents.length;


    const currentCount =
        data.events.length;


    const limit =
        plan.eventLimit;


    /* =====================
       残り枠
    ===================== */

    let remain;

    if(limit === Infinity){

        remain = Infinity;

    }else{

        remain =
            Math.max(
                0,
                limit - currentCount
            );

    }


    /* =====================
       上限到達
    ===================== */

    if(remain === 0){

        alert(
            `${plan.name}の予定上限に達しています。\n\n` +
            `現在の予定数：${currentCount}件\n` +
            `上限：${limit}件`
        );

        return;

    }


    /* =====================
       取り込み対象
    ===================== */

    const importTargets =
        remain === Infinity
        ? selectedEvents
        : selectedEvents.slice(
            0,
            remain
        );


    let importedCount = 0;


    /* =====================
       予定取り込み
    ===================== */

    importTargets.forEach(
        importedEvent => {

            /* =====================
               重複確認
            ===================== */

            if(
                isDuplicateImportedEvent(
                    importedEvent,
                    data.events
                )
            ){

                return;

            }


            /* =====================
               受信日時
            ===================== */

            const importedAt =
                new Date().toISOString();


            /* =====================
               発信者
            ===================== */

            const sender =
                eventImportData.sender ||
                importedEvent.shareInfo?.sender ||
                "不明";


            /* =====================
               共有先
            ===================== */

            const recipients =
                Array.isArray(
                    eventImportData.recipients
                )
                ?
                eventImportData.recipients
                :
                (
                    importedEvent.shareInfo?.recipients ||
                    []
                );


            /* =====================
               共有日時
            ===================== */

            const sharedAt =
                eventImportData.sharedAt ||
                importedEvent.shareInfo?.sharedAt ||
                null;


            /* =====================
               新しい予定
            ===================== */

            const newEvent = {

                ...importedEvent,

                /* 新しいID */

                id:
                    Date.now() +
                    Math.random(),


                /* =====================
                   取り込み情報
                ===================== */

                importedFromShare:
                    true,

                importedAt:
                    importedAt,


                /* =====================
                   受信側として保存
                ===================== */

                shareStatus:
                    "received",

                shareSender:
                    sender,

                receivedAt:
                    importedAt,


                /* =====================
                   共有情報
                ===================== */

                shareInfo: {

                    sender:
                        sender,

                    recipients:
                        recipients,

                    sharedAt:
                        sharedAt

                }

            };


            data.events.push(
                newEvent
            );


            importedCount++;

        }
    );


    /* =====================
       重複だけだった
    ===================== */

    if(importedCount === 0){

        alert(
            "選択した予定はすでに登録されています。"
        );

        renderEventImportList();

        return;

    }


    /* =====================
       共有履歴
    ===================== */

    if(
        !data.eventShareImportHistory
    ){

        data.eventShareImportHistory = [];

    }


    const historyImportedAt =
        new Date().toISOString();


    data.eventShareImportHistory.push({

        id:
            Date.now(),

        sender:
            eventImportData.sender ||
            "",

        recipients:
            eventImportData.recipients ||
            [],

        eventIds:
            importTargets.map(
                event => event.id
            ),

        importedCount:
            importedCount,

        importedAt:
            historyImportedAt,

        sharedAt:
            eventImportData.sharedAt ||
            null

    });


    /* =====================
       保存
    ===================== */

    db.save(data);


    /* =====================
       表示更新
    ===================== */

    renderCalendar();

    displayEventList();

    displaySelectedDateEvents();

    displayHomeSchedule();

    displayUpcomingEvents();

    displayCountdown();


    /* =====================
       上限による一部取り込み
    ===================== */

    if(
        importedCount <
        originalSelectedCount
    ){

        alert(
            `上限に達したので、` +
            `${originalSelectedCount}件中` +
            `${importedCount}件しか読み込めませんでした。\n\n` +
            `現在の予定数：${data.events.length}件\n` +
            `上限：${limit}件`
        );


        renderEventImportList();

        updateEventImportCount();

        return;

    }


    /* =====================
       完全取り込み
    ===================== */

    alert(
        `${importedCount}件の予定を取り込みました。`
    );


    closeEventImportScreen();

}

/* =====================================================
   📅 取り込み日時表示
===================================================== */

function formatEventImportDate(value){

    if(!value){

        return "不明";

    }


    const date =
        new Date(value);


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return "不明";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const hour =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );


    const minute =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}/${month}/${day} ` +
        `${hour}:${minute}`
    );

}


function getEventShareInfoHTML(event){

    let html = "";


    /* =====================
       📤 自分が共有した予定
    ===================== */

    if(
        event?.shareInfo &&
        event.shareInfo.sharedAt
    ){

        const recipients =
            Array.isArray(
                event.shareInfo.recipients
            )
            ?
            event.shareInfo.recipients.join("、")
            :
            "";


        html += `

            <div class="planner-share-info">

                <div>
                    📤 共有済み
                </div>

                ${
                    recipients
                    ?
                    `
                    <div>
                        👥 共有先：
                        ${escapeEventShareHTML(
                            recipients
                        )}
                    </div>
                    `
                    :
                    ""
                }

                <div>
                    🕒 共有日時：
                    ${formatEventImportDate(
                        event.shareInfo.sharedAt
                    )}
                </div>

            </div>

        `;

    }


    /* =====================
       📥 相手から取り込んだ予定
    ===================== */

    if(
        event?.importedFromShare &&
        event?.importedAt
    ){

        const sender =
            event.shareInfo?.sender ||
            "不明";


        html += `

            <div class="planner-import-info">

                <div>
                    📥 共有予定を取り込みました
                </div>

                <div>
                    👤 発信者：
                    ${escapeEventShareHTML(
                        sender
                    )}
                </div>

                <div>
                    🕒 受信日時：
                    ${formatEventImportDate(
                        event.importedAt
                    )}
                </div>

            </div>

        `;

    }


    return html;

}


async function openSportsCalendar() {

    const container =
        document.getElementById("calendarContainer");

    if (!container) {
        console.error("calendarContainer がありません");
        return;
    }

    try {

        const response =
            await fetch("./calendar-sports.html");

        if (!response.ok) {
            throw new Error(
                "calendar-sports.html の読み込みに失敗しました"
            );
        }

        container.innerHTML =
            await response.text();

    } catch (error) {

        console.error(
            "スポーツカレンダー読み込みエラー:",
            error
        );

    }

}