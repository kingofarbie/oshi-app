const DB_KEY = 'oshi_app_data';

let oshiMaster = {
    artists: [],
    sports: []
};

let selectedOshiId = null;


const DB_KEY = 'oshi_app_data';

const PLAN = {

    free:{
        name:"無料",
        price:0,
        eventLimit:5,
        oshiLimit:3
    },

    premium:{
        name:"プレミアム",
        price:300,
        eventLimit:100,
        oshiLimit:10
    },

    vip:{
        name:"VIP",
        price:500,
        eventLimit:Infinity,
        oshiLimit:Infinity
    }

};

let oshiMaster = {
    artists: [],
    sports: []
};

let selectedOshiId = null;



/* =====================
   カレンダー状態
===================== */

let currentCalendarDate = new Date();

let selectedCalendarDate = null;

let editingEventId = null;

/* =====================
   DB
===================== */

const db = {

    load(){

        const data =
            localStorage.getItem(DB_KEY);


        return data
            ? JSON.parse(data)
            :
            {
            settings:{
                plan:'free',
                
                notifications:{
                    before:false,
                    beforeTime:"20:00",
                    
                    today:false,
                    todayTime:"09:00"

                }
            },

                oshiList:[],

                events:[],

                categories:[]
            };

    },


    save(data){

        localStorage.setItem(
            DB_KEY,
            JSON.stringify(data)
        );

    },


    /* =====================
       推し追加
    ===================== */

addOshi(masterId){

    const data = this.load();

    const plan = PLAN[data.settings.plan];

    if(data.oshiList.length >= plan.oshiLimit){

        alert(
            `${plan.name}は推し${plan.oshiLimit}件までです`
        );

        return false;

    }

    const exists =
        data.oshiList.some(
            o=>o.masterId===masterId
        );

    if(exists){

        alert(
            '既に登録されています'
        );

        return false;

    }

    data.oshiList.push({

        id:Date.now(),

        masterId

    });

    this.save(data);

    return true;

},

    deleteOshi(id){

        const data=this.load();


        data.oshiList =
            data.oshiList.filter(
                o=>o.id!==id
            );


        this.save(data);

    },



    /* =====================
       予定追加
    ===================== */

addEvent(eventData){

    const data = this.load();

    const plan = PLAN[data.settings.plan];

    if(data.events.length >= plan.eventLimit){

        alert(
            `${plan.name}は予定${plan.eventLimit}件までです`
        );

        return false;

    }

    eventData.id =
        Date.now();

    data.events.push(
        eventData
    );

    this.save(data);

    return true;

},
    deleteEvent(id){

        const data=this.load();


        data.events =
            data.events.filter(
                e=>e.id!==id
            );


        this.save(data);

    },


    updateEvent(eventData){

        const data=this.load();


        const index =
            data.events.findIndex(
                e=>e.id===eventData.id
            );


        if(index!==-1){

            data.events[index]
                =
                eventData;

        }


        this.save(data);

    }

};





/* =====================
   推しマスタ読込
===================== */

async function loadMaster(){

    try{

        const response =
            await fetch(
                './oshi-master.json'
            );


        oshiMaster =
            await response.json();


    }
    catch(error){

        console.error(
            '推しマスタ読込失敗',
            error
        );

    }

}




/* =====================
   タブ切替
===================== */

function switchTab(pageId,event){


    document
    .querySelectorAll('.page')
    .forEach(
        page=>
            page.classList.remove(
                'active'
            )
    );


    document
    .getElementById(pageId)
    .classList.add(
        'active'
    );



    document
    .querySelectorAll('.tab')
    .forEach(
        tab=>
            tab.classList.remove(
                'active'
            )
    );


    event.currentTarget
    .classList.add(
        'active'
    );



    if(pageId==='calendarPage'){

        renderCalendar();

        displayEventList();

    }


    if(pageId==='home'){

    displayHomeSchedule();

    displayUpcomingEvents();

}



}






/* =====================
   推し候補表示
===================== */

function showCandidates(){


    const category =
        document
        .getElementById(
            'category-select'
        )
        .value;



    const results =
        document
        .getElementById(
            'search-results'
        );



    const list =
        oshiMaster[category] || [];



    results.innerHTML =

        list.map(oshi=>`

<div class="master-item"
onclick="selectOshi(
${oshi.id},
'${oshi.name.replace(/'/g,"\\'")}'
)">

${oshi.name}

</div>

`).join('');

}




/* =====================
   推し検索
===================== */

function searchOshi(){


    const category =
        document
        .getElementById(
            'category-select'
        )
        .value;



    const keyword =
        document
        .getElementById(
            'oshi-search'
        )
        .value
        .trim()
        .toLowerCase();



    const list =
        oshiMaster[category] || [];



    const matched =
        keyword===''

        ?
        list

        :

        list.filter(
            o=>
            o.name
            .toLowerCase()
            .includes(keyword)
        );



    document
    .getElementById(
        'search-results'
    )
    .innerHTML =


    matched.map(oshi=>`

<div class="master-item"
onclick="selectOshi(
${oshi.id},
'${oshi.name.replace(/'/g,"\\'")}'
)">

${oshi.name}

</div>

`).join('');

}




/* =====================
   推し選択
===================== */

function selectOshi(id,name){

    selectedOshiId=id;


    document
    .getElementById(
        'oshi-search'
    )
    .value=name;

}

/* =====================
   推し追加
===================== */

function addSelectedOshi(){

    if(!selectedOshiId){

        alert(
            '推しを選択してください'
        );

        return;

    }


    const success =
        db.addOshi(
            selectedOshiId
        );


    if(!success) return;



    selectedOshiId=null;


    document
    .getElementById(
        'oshi-search'
    )
    .value='';



    document
    .getElementById(
        'search-results'
    )
    .innerHTML='';



    displayOshiList();

}



/* =====================
   推し検索
===================== */

function findMasterById(id){

    const all=[

        ...oshiMaster.artists,

        ...oshiMaster.sports

    ];


    return all.find(
        o=>o.id===id
    );

}




/* =====================
   推し一覧
===================== */

function displayOshiList(){

    const data=db.load();


    const html =
        data.oshiList.map(item=>{


            const oshi =
                findMasterById(
                    item.masterId
                );


            if(!oshi) return '';



            return `

<div class="item oshi-item">

<div class="oshi-info">

<div class="oshi-name">
${oshi.name}
</div>

${
oshi.website
?
`<div class="oshi-link">🌐 HP</div>`
:''
}

${
oshi.instagram
?
`<div class="oshi-link">📷 Instagram</div>`
:''
}

${
oshi.x
?
`<div class="oshi-link">𝕏 X</div>`
:''
}

</div>


<div class="oshi-actions">

<button
class="icon-btn delete-btn"
onclick="deleteOshi(
${item.id},
'${oshi.name.replace(/'/g,"\\'")}'
)">
✕
</button>


</div>


</div>

`;

        }).join('');



    document
    .getElementById(
        'oshi-list'
    )
    .innerHTML =
        html || '該当なし';

}





function deleteOshi(id,name){

    if(
        !confirm(
            `「${name}」を削除しますか？`
        )
    )
    return;


    db.deleteOshi(id);


    displayOshiList();

}



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



let pressTimer;
let menuDate = null;
let selectedEventId = null;

let copyEventId = [];
let copyMode = false;

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


/* =====================
   日付選択
===================== */


function selectCalendarDate(date){

    if(copyMode){

const data = db.load();

copyEventId.forEach(id=>{

    const event =
        data.events.find(
            e=>e.id===id
        );

    if(!event)
        return;

    data.events.push({

        ...event,

        id: Date.now() + Math.random(),

        date:
            date +
            event.date.substring(10)

    });

});

db.save(data);



    copyMode = false;
    copyEventId = null;

    renderCalendar();
    displayEventList();
    displayHomeSchedule();
    displayUpcomingEvents();

    alert("コピーしました");

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
===================== *
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
   予定追加フォーム開閉
===================== */
function openEventForm(){

    if(!selectedCalendarDate){
        return;
    }

    document
    .getElementById(
        "eventFormModal"
    ).style.display = "block";

}






/* =====================
   保存
===================== */

function saveEvent(){


    const data = {


        category:
        document.getElementById(
            'event-category'
        ).value,


        title:
        document.getElementById(
            'event-title'
        ).value,


        date:
        document.getElementById(
            'event-date'
        ).value,


        place:
        document.getElementById(
            'event-place'
        ).value,


        meeting:
        document.getElementById(
            'meeting-time'
        ).value,


        companion:
        document.getElementById(
            'companions'
        ).value,


        map:
        document.getElementById(
            'map-url'
        ).value,


        ticket:
        document.getElementById(
            'ticket-url'
        ).value


    };




    if(!data.title){

        alert(
            "イベント名を入力してください"
        );

        return;

    }




if(editingEventId){

    data.id = editingEventId;

    db.updateEvent(data);

    editingEventId = null;

}else{

    if(!db.addEvent(data)){
        return;
    }

}

        closeEventModal();


        clearEventForm();


        displayEventList();


        displaySelectedDateEvents();


        renderCalendar();


        displayHomeSchedule();
        displayUpcomingEvents();


}







function clearEventForm(){


    document
    .getElementById(
        'event-title'
    ).value = "";


    document
    .getElementById(
        'event-place'
    ).value = "";


    document
    .getElementById(
        'meeting-time'
    ).value = "";


    document
    .getElementById(
        'companions'
    ).value = "";


    document
    .getElementById(
        'map-url'
    ).value = "";


    document
    .getElementById(
        'ticket-url'
    ).value = "";


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


function displayEventList(){

    const box =
        document.getElementById(
            'event-list'
        );


    if(!box) return;



    let events =
        db.load().events;



    const filter =
        document
        .getElementById(
            'event-filter'
        )
        ?.value || 'all';



    // カテゴリー絞り込み

    if(filter !== 'all'){

        events =
        events.filter(
            e =>
            e.category === filter
        );

    }



    // 日付順

    events.sort(
        (a,b)=>
        new Date(a.date)
        -
        new Date(b.date)
    );




    if(events.length===0){

        box.innerHTML =
        '該当なし';

        return;

    }




    box.innerHTML =


    events.map(e=>`


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

<div class="event-button-area">

${e.map ? `
<button
class="map-btn"
onclick="location.href='${e.map}'">
🗺 地図
</button>
` : ''}

${e.ticket ? `
<button
class="map-btn"
onclick="location.href='${e.ticket}'">
🎫 チケット
</button>
` : ''}

<button
class="icon-btn delete-btn"
onclick="deleteEvent(${e.id})">
🗑
</button>

</div>

</div>

`).join('');

}




function deleteEvent(id){

    db.deleteEvent(id);


    displayEventList();

    renderCalendar();

    displayHomeSchedule();

}







/* =====================
   ホーム予定表示
===================== */



function displayHomeSchedule(){

    const events =
        db.load().events;


    const now =
        new Date();


    const todayStart =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const tomorrow =
        new Date(todayStart);

    tomorrow.setDate(
        todayStart.getDate()+1
    );



    // 今週（日曜始まり）
    const weekStart =
        new Date(todayStart);

    weekStart.setDate(
        todayStart.getDate()
        -
        todayStart.getDay()
    );


    const nextWeekStart =
        new Date(weekStart);

    nextWeekStart.setDate(
        weekStart.getDate()+7
    );


    const nextWeekEnd =
        new Date(nextWeekStart);

    nextWeekEnd.setDate(
        nextWeekStart.getDate()+7
    );



    function eventDate(e){

        return new Date(
            e.date
        );

    }



    const todayList =
        events.filter(
            e=>{

                const d=eventDate(e);

                return d >= todayStart
                &&
                d < tomorrow;

            }
        );



    const weekList =
        events.filter(
            e=>{

                const d=eventDate(e);

                return d >= weekStart
                &&
                d < nextWeekStart;

            }
        );



    const nextWeekList =
        events.filter(
            e=>{

                const d=eventDate(e);

                return d >= nextWeekStart
                &&
                d < nextWeekEnd;

            }
        );



    function render(id,list){

        const box =
            document.getElementById(id);


        if(!box) return;


        box.innerHTML =

        list.length

        ?

        list.map(
            e=>
            `
            ${getCategoryInfo(e.category)?.icon || "📌"}
            ${e.title}
            `
        ).join('<br>')


        :

        '該当なし';

    }



    render(
        'today-schedule',
        todayList
    );


    render(
        'this-week-schedule',
        weekList
    );


    render(
        'next-week-schedule',
        nextWeekList
    );

}





function displayUpcomingEvents(){

const box =
    document.getElementById(
        'upcoming-events'
    );

if(!box) return;


const now = new Date();


const events =
    db.load().events

    .filter(
        e =>
        new Date(e.date) >= now
    )

    .sort(
        (a,b)=>
        new Date(a.date)
        -
        new Date(b.date)
    )

    .slice(0,3);


box.innerHTML =

    events.length

    ?

    events.map(
        e =>

        `
        ${getCategoryInfo(e.category)?.icon || "📌"}
        ${e.title}<br>
        ${e.date.slice(0,10)}`
    ).join('<hr>')

    :

    '該当なし';

}



/* =====================
   設定メニュー開閉
===================== */

let openSettingMenu = null;


function toggleSetting(menuId){

    const menus = [
        "planMenu",
        "themeMenu",
        "notificationMenu",
        "categoryMenu"
    ];


    menus.forEach(id=>{

        const menu =
            document.getElementById(id);


        if(!menu) return;


        const icon =
            document.getElementById(
                id.replace("Menu","Icon")
            );


        if(id === menuId){

            if(
                menu.style.display === "block"
            ){

                menu.style.display =
                    "none";


                if(icon)
                    icon.textContent = "＋";


                openSettingMenu = null;


            }else{

                // 他を閉じる
                menus.forEach(otherId=>{

                    const other =
                        document.getElementById(otherId);


                    if(other){

                        other.style.display =
                            "none";

                    }


                    const otherIcon =
                        document.getElementById(
                            otherId.replace("Menu","Icon")
                        );


                    if(otherIcon){

                        otherIcon.textContent =
                            "＋";

                    }

                });



                menu.style.display =
                    "block";


                if(icon)
                    icon.textContent =
                        "−";


                openSettingMenu =
                    menuId;

            }


        }

    });

}


/* =====================
   通知設定
===================== */


function toggleNotification(type){


    const data = db.load();


    if(!data.settings.notifications){

        data.settings.notifications = {

            event:false,

            before:false,

            time:"20:00"

        };

    }



    data.settings.notifications[type] =
        !data.settings.notifications[type];



    db.save(data);


    updateNotificationButtons();

}





function updateNotificationButtons(){


    const data = db.load();


    if(
        !data.settings.notifications
    )
        return;



    const n =
        data.settings.notifications;


    const beforeBtn =
        document.getElementById(
            "beforeNotificationBtn"
        );
    
    

    const todayBtn =
        document.getElementById(
            "todayNotificationBtn"
        );


    if(beforeBtn){

        beforeBtn.textContent =
            n.before ? "ON" : "OFF";

    }
    
    if(todayBtn){

        todayBtn.textContent =
            n.today ? "ON" : "OFF";

    }



const beforeTime =
    document.getElementById(
        "beforeNotificationTime"
    );

if(beforeTime){

    beforeTime.value =
        n.beforeTime || "20:00";

}


const todayTime =
    document.getElementById(
        "todayNotificationTime"
    );

if(todayTime){

    todayTime.value =
        n.todayTime || "09:00";

}


    

}




document.addEventListener(
"change",
function(e){


  if(
    e.target.id ===
    "beforeNotificationTime"
){

    const data = db.load();

    data.settings.notifications.beforeTime =
        e.target.value;

    db.save(data);

}


if(
    e.target.id ===
    "todayNotificationTime"
){

    const data = db.load();

    data.settings.notifications.todayTime =
        e.target.value;

    db.save(data);

}  


});






/* =====================
   起動
===================== */


window.onload =
async function(){


    await loadMaster();


    displayOshiList();


    displayHomeSchedule();



    const search =
        document
        .getElementById(
            'oshi-search'
        );


    if(search){


        search.addEventListener(
            'focus',
            showCandidates
        );


        search.addEventListener(
            'input',
            searchOshi
        );

    }




    const category =
        document
        .getElementById(
            'category-select'
        );


    if(category){

        category.addEventListener(
            'change',
            function(){

                selectedOshiId=null;

                search.value='';

                showCandidates();

            }
        );

    }



    displayEventList();


    renderCalendar();
    
    displayUpcomingEvents();
    
    updateNotificationButtons();
    
    displayCategories();
    
    updateEventCategoryOptions();

    updatePlanDisplay();

};

/* =====================
   カテゴリ追加
===================== */

function addCategory(){

    const name =
        document.getElementById(
            "category-name"
        ).value.trim();


    const icon =
        document.getElementById(
            "category-icon"
        ).value;


    const color =
        document.getElementById(
            "category-color"
        ).value;


    if(!name){

        alert(
            "カテゴリ名を入力してください"
        );

        return;

    }


    const data =
        db.load();



    if(!data.categories){

        data.categories=[];

    }



    data.categories.push({

        id:Date.now(),

        name:name,

        icon:icon,

        color:color

    });



    db.save(data);



    document.getElementById(
        "category-name"
    ).value="";



    displayCategories();

    updateEventCategoryOptions();



    alert(
        "カテゴリを追加しました"
    );

}



/* =====================
   カテゴリ削除
===================== */

function deleteCategory(id){


    if(
        !confirm(
            "このカテゴリを削除しますか？"
        )
    ){

        return;

    }



    const data =
        db.load();



    data.categories =
        data.categories.filter(
            c=>c.id !== id
        );



    db.save(data);



    displayCategories();
    
    updateEventCategoryOptions();

}



/* =====================
   カテゴリ表示
===================== */

function displayCategories(){

const box =
    document.getElementById(
        "category-list"
    );

if(!box)
    return;

const data =
    db.load();

const categories =
    data.categories || [];

if(categories.length===0){

    box.innerHTML =
    "現在カテゴリなし";

    return;

}


box.innerHTML =

categories.map(c=>`

<div style="
color:${c.color};
margin:8px 0;
">${c.icon}
${c.name}

<span
onclick="deleteCategory(${c.id})"
style="
cursor:pointer;
margin-left:8px;
">

🗑

</span></div>`).join("");


}



/* =====================
イベントカテゴリ更新
===================== */

function updateEventCategoryOptions(){

const select =
    document.getElementById(
        "event-category"
    );

if(!select)
    return;

const data =
    db.load();

const categories =
    data.categories || [];

let html = `
    <option value="イベント">🎫 イベント</option>
    <option value="フェス">🎵 フェス</option>
    <option value="試合">⚽ 試合</option>
`;

categories.forEach(c=>{

    html += `
    <option value="${c.name}">
        ${c.icon} ${c.name}
    </option>
    `;

});

select.innerHTML = html;

}




/* =====================
カテゴリ情報取得
===================== */

function getCategoryInfo(name){

const data = db.load();

const categories =
    data.categories || [];

const category =
    categories.find(
        c => c.name === name
    );

return category || null;

}



function closeDayMenu(){

    document.getElementById(
        "dayMenuModal"
    ).style.display = "none";

}

function openEventSelectModal(){

    const list =
        document.getElementById(
            "eventSelectList"
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

        <button
        onclick="selectEvent(${e.id})">

        ${getCategoryInfo(e.category)?.icon || "📌"}
        ${e.title}

        </button>
        <br>

    `).join('');


    document.getElementById(
        "eventSelectModal"
    ).style.display = "block";

}



function closeEventSelectModal(){



    document.getElementById(
        "eventSelectModal"
    ).style.display = "none";

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






function selectEvent(id){

    selectedEventId = id;

    closeEventSelectModal();

    const event =
        db.load().events.find(
            e=>e.id===selectedEventId
        );


    if(!event)
        return;


    editingEventId = event.id;


    document.getElementById(
        "event-category"
    ).value = event.category;


    document.getElementById(
        "event-title"
    ).value = event.title;


    document.getElementById(
        "event-date"
    ).value = event.date;


    document.getElementById(
        "event-place"
    ).value = event.place || "";


    document.getElementById(
        "meeting-time"
    ).value = event.meeting || "";


    document.getElementById(
        "companions"
    ).value = event.companion || "";


    document.getElementById(
        "map-url"
    ).value = event.map || "";


    document.getElementById(
        "ticket-url"
    ).value = event.ticket || "";


    document.getElementById(
        "eventFormModal"
    ).style.display="block";

}

function closeEventModal(){

    document.getElementById(
        "eventFormModal"
    ).style.display = "none";

    editingEventId = null;

    clearEventForm();

}

function addEventFromMenu(){

    closeDayMenu();

    selectedCalendarDate =
        menuDate;

    document.getElementById(
        'event-date'
    ).value =
        menuDate + "T12:00";

    openEventForm();

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

    alert("コピー先の日付を選択してください");

}


function updatePlanDisplay(){

    const data = db.load();

    const plan = PLAN[data.settings.plan];

    const text =
        plan.eventLimit === Infinity

        ? `現在${plan.name}プランです（予定無制限・推し無制限）`

        : `現在${plan.name}プランです（予定${plan.eventLimit}件・推し${plan.oshiLimit}件）`;

    document.getElementById(
        "current-plan"
    ).textContent = text;

}