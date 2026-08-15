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

    console.log("📅 selectCalendarDate 実行:", date);
    console.log("📅 date:", date);
    console.log("📅 copyMode:", copyMode);

    /* =====================
       コピー貼り付け
    ===================== */

    if(copyMode){

        console.log("📋 コピー貼り付けモード");

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


        ids.forEach(id=>{

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
           貼り付け先の日付
        */

        selectedCalendarDate = date;

        window.selectedCalendarDate =
            selectedCalendarDate;


        console.log(
            "📅 コピー後 selectedCalendarDate:",
            selectedCalendarDate
        );

        console.log(
            "📅 window.selectedCalendarDate:",
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


    selectedCalendarDate = date;

    window.selectedCalendarDate =
        selectedCalendarDate;


    console.log(
        "📅 selectedCalendarDate 設定:",
        selectedCalendarDate
    );

    console.log(
        "📅 window.selectedCalendarDate 設定:",
        window.selectedCalendarDate
    );


    /*
       日付変更時は予定追加フォームを閉じる
    */

    const form =
        document.getElementById(
            'event-form-card'
        );

    if(form){

        form.style.display =
            "none";

    }


    /*
       入力途中の内容も消す
    */

    clearEventForm();


    /*
       カレンダー再描画
    */

    renderCalendar();


    /*
       1日手帳へ
    */

    switchTab(
        'plannerPage',
        null,
        true
    );


    /*
       動画表示
    */

    console.log(
        "🎥 renderDayMovies 呼び出し"
    );

    renderDayMovies();

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