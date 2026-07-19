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

function renderCalendar(){

    const area =
        document.getElementById(
            'calendar'
        );

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
        db.load().events;



    let html = `

<div class="calendar-header">

<button onclick="changeMonth(-1)">
◀
</button>


<div class="calendar-title">
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


        const hasEvent =
            events.some(
                e =>
                e.date.startsWith(date)
            );



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
    events.filter(
        e => e.date.startsWith(date)
    );

const preview =
    dayEvents
    .slice(0,3)
    .map(e=>`
        <div class="calendar-event-preview">
            ${e.title.substring(0,6)}
        </div>
    `)
    .join('');

const more =
    dayEvents.length > 3
    ? `
        <div class="calendar-more">
            +${dayEvents.length - 3}
        </div>
      `
    : '';

html += `

<div
class="calendar-day
${isToday ? 'today' : ''}
${hasEvent ? 'has-event' : ''}
${isSelected ? 'selected-day' : ''}
"
onclick="selectCalendarDate('${date}')"
ontouchstart="startPress('${date}')"
ontouchend="cancelPress()"
ontouchmove="cancelPress()">

<div class="calendar-date ${dateClass}">
${d}
</div>

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

    if(copyMode){

const data = db.load();

const plan = PLAN[data.settings.plan];

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
            e=>e.id===id
        );

    if(!event) return;

    data.events.push({

        ...event,

        id: Date.now() + Math.random(),

        date:
            date +
            event.date.substring(10)

    });

});

db.save(data);

if(ids.length < copyEventId.length){

    alert(
`上限のため${ids.length}件のみ貼り付けました`    );

}


    copyMode = false;
    copyEventId = null;

    renderCalendar();
    displayEventList();
    displayHomeSchedule();
    displayUpcomingEvents();

if(ids.length === copyEventId.length){

alert("予定を貼り付けました");
}
    return;

}

    selectedCalendarDate = date;



    // 日付変更時は予定追加フォームを閉じる
    const form =
        document.getElementById(
            'event-form-card'
        );

    if(form){

        form.style.display = "none";

    }


    // 入力途中の内容も消す
    clearEventForm();


    renderCalendar();

    showPlanner(date);


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
        events.filter(
            e =>
            selectedCalendarDate &&
            e.date.startsWith(selectedCalendarDate)
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


function startPress(date){

    pressTimer = setTimeout(()=>{

        showDayMenu(date);

    },500);

}

function cancelPress(){

    clearTimeout(pressTimer);

}

function showDayMenu(date){

    console.log("長押し:", date);

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

    console.log("削除押下");
    console.log(menuDate);

    closeDayMenu();

    openDeleteSelectModal();

}

function copyEventFromMenu(){

    closeDayMenu();

    const events =
        db.load().events.filter(
            e => e.date.startsWith(menuDate)
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
            e => e.date.startsWith(menuDate)
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
            e => e.date.startsWith(menuDate)
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


