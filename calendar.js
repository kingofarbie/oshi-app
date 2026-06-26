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


    document
    .getElementById(
        'event-date'
    )
    .value =
        date + "T12:00";


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


}


/* =====================
   選択日の表示更新
===================== */
function updateSelectedDateArea(){


    const area =
        document.getElementById(
            'selected-event-area'
        );


    const btn =
        document.getElementById(
            'add-event-open-btn'
        );



    if(!area || !btn)
        return;



    if(!selectedCalendarDate){


        area.innerHTML =
        `
        📌 日付を選択してください
        `;


        btn.style.display =
            "none";


        return;

    }



    // 選択日の文字表示は削除

    area.innerHTML = "";



    btn.style.display =
        "block";



    displaySelectedDateEvents();


}



/* =====================
   選択日の予定表示
===================== */

function displaySelectedDateEvents(){


    const box =
        document.getElementById(
            'selected-date-events'
        );


    if(!box)
        return;



    const events =
        db.load().events;



    const list =
        events.filter(
            e =>
            selectedCalendarDate
            &&
            e.date.startsWith(
                selectedCalendarDate
            )
        );



    box.innerHTML =


    list.length

    ?

    list.map(e=>`

<div class="event-card">

<div class="event-card-title">
${getCategoryInfo(e.category)?.icon || "📌"}
${e.title}
</div>

<div>
📅 ${e.date}
</div>

${e.place ? `
<div>
📍 ${e.place}
</div>
` : ''}

${e.meeting ? `
<div>
⏰ ${e.meeting}
</div>
` : ''}

${e.companion ? `
<div>
👥 ${e.companion}
</div>
` : ''}

${e.map ? `
<div>
🗺 地図登録済み
</div>
` : ''}

${e.ticket ? `
<div>
🎫 チケット登録済み
</div>
` : ''}

</div>

`).join('')


:

'該当なし';



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

