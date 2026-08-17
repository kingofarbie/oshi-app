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

function displaySelectedDateEvents(){

    const box =
        document.getElementById(
            "selected-date-events"
        );

    if(!box) return;

    const events =
        db.load().events;

const list =
    events
    .filter(
        e =>
            selectedCalendarDate &&
            e.start &&
            e.start.startsWith(selectedCalendarDate)
    )
    .sort(
        (a,b) =>
            new Date(a.start) -
            new Date(b.start)
    );    

    if(list.length===0){

        box.innerHTML="該当なし";

        return;

    }

    box.innerHTML=list.map(e=>`

<div class="event-card">

    <div class="event-card-title">
        ${getCategoryInfo(e.category)?.icon || "📌"}
        ${e.title}
    </div>

    ${
        e.start
        ?
        `<div>
            🕒 ${e.start.substring(11,16)}
            ${
                e.end
                ?
                " ～ " + e.end.substring(11,16)
                :
                ""
            }
        </div>`
        :
        ""
    }

    ${
        e.place
        ?
        `<div>📍 ${e.place}</div>`
        :
        ""
    }

    <div class="event-button-area">

        <button
        class="icon-btn"
        onclick="selectEvent(${e.id})">

        ✏️

        </button>

        <button
        class="icon-btn delete-btn"
        onclick="deleteEvent(${e.id})">

        🗑️

        </button>

    </div>

</div>

`).join("");

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





/* =====================================================
   📤 予定共有機能
===================================================== */


/* =====================
   📤 共有画面を開く
===================== */

function openEventShareScreen(){

    const screen =
        document.getElementById(
            "eventShareScreen"
        );

    if(!screen){

        console.log(
            "eventShareScreen が見つかりません"
        );

        return;

    }


    /* =====================
       共有画面表示
    ===================== */

    screen.style.display = "block";


    /* =====================
       カレンダーを一時非表示
    ===================== */

    const calendar =
        document.getElementById(
            "calendar"
        );

    if(calendar){

        calendar.style.display = "none";

    }


    /* =====================
       共有日時
    ===================== */

    updateEventShareDateTime();


    /* =====================
       期間設定
    ===================== */

    const periodSelect =
        document.getElementById(
            "eventSharePeriod"
        );

    if(periodSelect){

        periodSelect.value =
            "3month";

    }


    /* =====================
       期間指定欄を非表示
    ===================== */

    const customPeriod =
        document.getElementById(
            "eventShareCustomPeriod"
        );

    if(customPeriod){

        customPeriod.style.display =
            "none";

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
       選択状態リセット
    ===================== */

    const selectAll =
        document.getElementById(
            "eventShareSelectAll"
        );

    if(selectAll){

        selectAll.checked = false;

    }


    updateEventShareSelectedCount();


    /* =====================
       ページ上部
    ===================== */

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}


/* =====================
   📤 共有画面を閉じる
===================== */

function closeEventShareScreen(){

    const screen =
        document.getElementById(
            "eventShareScreen"
        );

    if(screen){

        screen.style.display =
            "none";

    }


    const calendar =
        document.getElementById(
            "calendar"
        );

    if(calendar){

        calendar.style.display =
            "";

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


    const now =
        new Date();


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
        `${year}/${month}/${day} ${hour}:${minute}`;

}


/* =====================================================
   📂 カテゴリ一覧
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
            <option value="${escapeEventShareHtml(category.name)}">
                ${category.icon || ""} ${escapeEventShareHtml(category.name)}
            </option>
        `;

    });


    select.innerHTML =
        html;

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
   📅 予定一覧表示
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


    const events =
        data.events || [];


    const categorySelect =
        document.getElementById(
            "eventShareCategory"
        );


    const selectedCategory =
        categorySelect
        ? categorySelect.value
        : "all";


    const range =
        getEventShareDateRange();


    /* =====================
       フィルター
    ===================== */

    const filtered =
        events.filter(event => {


            /* 期間 */

            if(
                !isEventInSharePeriod(
                    event,
                    range
                )
            ){

                return false;

            }


            /* カテゴリ */

            if(
                selectedCategory !== "all" &&
                event.category !==
                    selectedCategory
            ){

                return false;

            }


            return true;

        });


    /* =====================
       日付順
    ===================== */

    filtered.sort(
        (a,b) => {

            const dateA =
                getEventShareEventDate(a)
                ?.getTime() || 0;

            const dateB =
                getEventShareEventDate(b)
                ?.getTime() || 0;

            return dateA - dateB;

        }
    );


    /* =====================
       予定なし
    ===================== */

    if(filtered.length === 0){

        list.innerHTML = `

            <div class="event-share-empty">

                📅 共有できる予定がありません

            </div>

        `;


        updateEventShareSelectedCount();

        return;

    }


    /* =====================
       一覧生成
    ===================== */

    list.innerHTML =

        filtered.map(
            (event,index) => {


                const date =
                    getEventShareEventDate(
                        event
                    );


                const dateText =
                    date
                    ? formatEventShareDate(
                        date
                    )
                    : "日時未設定";


                const category =
                    getCategoryInfo(
                        event.category
                    );


                const icon =
                    category?.icon ||
                    "📅";


                const title =
                    event.title ||
                    "無題の予定";


                return `

                    <label
                        class="event-share-event-item"
                    >

                        <input
                            type="checkbox"
                            class="event-share-event-checkbox"
                            value="${escapeEventShareHtml(String(event.id))}"
                            onchange="updateEventShareSelectedCount()"
                        >

                        <div class="event-share-event-info">

                            <div class="event-share-event-title">

                                ${icon}
                                ${escapeEventShareHtml(title)}

                            </div>

                            <div class="event-share-event-date">

                                🕒 ${dateText}

                            </div>

                            <div class="event-share-event-category">

                                ${escapeEventShareHtml(
                                    event.category ||
                                    "カテゴリなし"
                                )}

                            </div>

                        </div>

                    </label>

                `;

            }
        ).join("");


    /* =====================
       全選択状態リセット
    ===================== */

    const selectAll =
        document.getElementById(
            "eventShareSelectAll"
        );


    if(selectAll){

        selectAll.checked = false;

    }


    updateEventShareSelectedCount();

}


/* =====================================================
   📅 日付表示
===================================================== */

function formatEventShareDate(date){

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2,"0");


    const day =
        String(
            date.getDate()
        ).padStart(2,"0");


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
   ☑ 全選択
===================================================== */

function toggleEventShareSelectAll(){

    const selectAll =
        document.getElementById(
            "eventShareSelectAll"
        );


    const checkboxes =
        document.querySelectorAll(
            ".event-share-event-checkbox"
        );


    if(!selectAll){
        return;
    }


    checkboxes.forEach(
        checkbox => {

            checkbox.checked =
                selectAll.checked;

        }
    );


    updateEventShareSelectedCount();

}


/* =====================================================
   🔢 選択件数更新
===================================================== */

function updateEventShareSelectedCount(){

    const checkboxes =
        document.querySelectorAll(
            ".event-share-event-checkbox"
        );


    const selected =
        Array.from(
            checkboxes
        ).filter(
            checkbox =>
                checkbox.checked
        );


    const count =
        selected.length;


    const countElement =
        document.getElementById(
            "eventShareSelectedCount"
        );


    if(countElement){

        countElement.textContent =
            `${count}件選択`;

    }


    /* =====================
       共有ボタン
    ===================== */

    const exportButton =
        document.getElementById(
            "eventShareExportBtn"
        );


    if(exportButton){

        exportButton.disabled =
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


    const checkboxes =
        document.querySelectorAll(
            ".event-share-event-checkbox"
        );


    const selectedIds =
        Array.from(
            checkboxes
        )
        .filter(
            checkbox =>
                checkbox.checked
        )
        .map(
            checkbox =>
                String(
                    checkbox.value
                )
        );


    const text =
        summary.querySelector(
            ".event-share-summary-text"
        );


    if(!text){
        return;
    }


    if(selectedIds.length === 0){

        text.textContent =
            "予定を選択してください";

        return;

    }


    const data =
        db.load();


    const events =
        data.events || [];


    const selectedEvents =
        events.filter(
            event =>
                selectedIds.includes(
                    String(event.id)
                )
        );


    text.innerHTML = `

        <strong>
            ${selectedEvents.length}件
        </strong>
        の予定を共有します。

    `;

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
   📤 共有処理
===================================================== */

function exportSelectedEventsForShare(){

    const checkboxes =
        document.querySelectorAll(
            ".event-share-event-checkbox"
        );


    const selectedIds =
        Array.from(
            checkboxes
        )
        .filter(
            checkbox =>
                checkbox.checked
        )
        .map(
            checkbox =>
                String(
                    checkbox.value
                )
        );


    if(selectedIds.length === 0){

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


    if(recipientInput){

        normalizeEventShareRecipients();

    }


    const recipients =
        recipientInput
        ? recipientInput.value
            .split(",")
            .map(
                name =>
                    name.trim()
            )
            .filter(
                name =>
                    name.length > 0
            )
        : [];


    if(recipients.length === 0){

        alert(
            "共有先を入力してください。"
        );

        if(recipientInput){

            recipientInput.focus();

        }

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
            "発信者の名前を入力してください。"
        );


        if(senderInput){

            senderInput.focus();

        }


        return;

    }


    /* =====================
       データ取得
    ===================== */

    const data =
        db.load();


    const events =
        data.events || [];


    const selectedEvents =
        events.filter(
            event =>
                selectedIds.includes(
                    String(event.id)
                )
        );


    if(selectedEvents.length === 0){

        alert(
            "共有する予定が見つかりません。"
        );

        return;

    }


    /* =====================
       共有日時
    ===================== */

    const now =
        new Date();


    const shareData = {

        version:1,

        type:"oshi-app-event-share",

        sharedAt:
            now.toISOString(),

        sender:sender,

        recipients:recipients,

        events:selectedEvents

    };


    /* =====================
       現段階では確認表示
    ===================== */

    console.log(
        "予定共有データ:",
        shareData
    );


    alert(

        "共有データを作成しました。\n\n" +

        `予定：${selectedEvents.length}件\n` +

        `共有先：${recipients.join(", ")}\n` +

        `発信者：${sender}`

    );

}


/* =====================================================
   🔒 HTMLエスケープ
===================================================== */

function escapeEventShareHtml(value){

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}