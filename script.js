
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
let currentDetailEventId = null;


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
                    todayTime:"09:00",
                    
                    start:false,
                    startMinutes:5

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

        start:
        document.getElementById(
            'event-start'
        ).value,

        end:
        document.getElementById(
            'event-end'
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
        ).value,

        // カレンダー表示用の日付は開始日時から自動生成
        date:
        document.getElementById(
            'event-start'
        ).value.split("T")[0]

    };

    if(!data.title){

        alert(
            "イベント名を入力してください"
        );

        return;

    }

    if(!data.start){

        alert(
            "開始日時を入力してください"
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
    
    displayCountdown();

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

    const events = db.load().events;

    const now = new Date();

    // 今日の開始
    const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    // 明日の開始
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);


    function eventStartDate(e){
        if(e.start){
            return new Date(e.start);
        }
        if(e.date){
            return new Date(e.date);
        }
        return null;
    }

    // 今日の予定
    const todayList = events.filter(e=>{

        const d = eventStartDate(e);
        if(!d) return false;

        return d >= todayStart && d < tomorrowStart;

    });


    function render(id,list){

        const box = document.getElementById(id);
        if(!box) return;

        if(list.length===0){

            box.innerHTML = "該当なし";
            return;

        }

        box.innerHTML = list.map(e=>{

            const icon = getCategoryInfo(e.category)?.icon || "📌";

            const date = eventStartDate(e);

            const month = date.getMonth()+1;
            const day = date.getDate();

            return `
<div class="schedule-item"
     onclick="openEventDetail(${e.id})">

    <div class="schedule-title">
        ${month}/${day} ${icon} ${e.title}
    </div>

</div>
`;

        }).join("");

    }

    render("today-schedule",todayList);

}

/* =====================
   直近のイベント
===================== */
function displayUpcomingEvents(){

    const box = document.getElementById("upcoming-events");
    if(!box) return;

    const now = new Date();

    function eventStartDate(e){

        if(e.start){
            return new Date(e.start);
        }

        if(e.date){
            return new Date(e.date);
        }

        return null;
    }

    const events = db.load().events
        .filter(e=>{

            const d = eventStartDate(e);
            return d && d >= now;

        })
        .sort((a,b)=>eventStartDate(a)-eventStartDate(b))
        .slice(0,3);


    if(events.length===0){

        box.innerHTML = "該当なし";
        return;

    }


    box.innerHTML = events.map(e=>{

        const d = eventStartDate(e);

        const month = d.getMonth()+1;
        const day = d.getDate();

        const icon = getCategoryInfo(e.category)?.icon || "📌";


        return `
        <div 
        class="event-home-item"
        onclick="openEventDetail(${e.id})">

            <strong>${month}/${day}</strong><br>
            ${icon} ${e.title}

        </div>
        `;


    }).join("");

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

        data.settings.notifications = {};

    }


    const n =
        data.settings.notifications;


    if(type === "start"){

        n.start =
            !n.start;


        if(!n.startMinutes){

            n.startMinutes = 5;

        }

    }


    else if(type === "before"){

        n.before =
            !n.before;

    }


    else if(type === "today"){

        n.today =
            !n.today;

    }



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


    const startBtn =
        document.getElementById(
            "startNotificationBtn"
        );



    if(beforeBtn){

        beforeBtn.textContent =
            n.before ? "ON" : "OFF";

    }


    if(todayBtn){

        todayBtn.textContent =
            n.today ? "ON" : "OFF";

    }


    if(startBtn){

        startBtn.textContent =
            n.start ? "ON" : "OFF";

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




    const startMinutes =
        document.getElementById(
            "startNotificationMinutes"
        );


    if(startMinutes){

        startMinutes.value =
            n.startMinutes || 5;

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




    if(
        e.target.id ===
        "startNotificationMinutes"
    ){

        const data = db.load();


        data.settings.notifications.startMinutes =
            Number(e.target.value);


        db.save(data);

    }


});


/* =====================
   起動
===================== */


window.onload =
async function(){

 await loadHtml(
     "plannerContainer",
     "planner.html"
 );
 
    initializeCategories();


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

    displayPlans();
    
    displayCountdown();
    
    await initNotification();


};



/* =====================
   HTML読込
===================== */

async function loadHtml(id,file){

    const response = await fetch(file);

    const html = await response.text();

    document.getElementById(id).innerHTML = html;

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
    "event-start"
).value = event.start || "";


document.getElementById(
    "event-end"
).value = event.end || "";


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





function closeCopySelectModal(){

    document.getElementById(
        "copySelectModal"
    ).style.display = "none";

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



function displayPlans(){

    const data = db.load();

    const current = data.settings.plan;

    const box =
        document.getElementById("planList");

    if(!box) return;

    box.innerHTML = "";

    Object.keys(PLAN).forEach(key=>{

        const p = PLAN[key];

        const eventText =
            p.eventLimit === Infinity
            ? "無制限"
            : p.eventLimit + "件";

        const oshiText =
            p.oshiLimit === Infinity
            ? "無制限"
            : p.oshiLimit + "件";

        box.innerHTML += `

<div class="plan-card">

<h3>${p.name}</h3>

<p>
料金：${p.price}円 / 30日
</p>

<p>
予定：${eventText}
</p>

<p>
推し：${oshiText}
</p>

${
current===key

?

`<button disabled>現在利用中</button>`

:

`<button onclick="changePlan('${key}')">
このプランを見る
</button>`

}

</div>

`;

    });

}

function changePlan(plan){

    const data = db.load();

    data.settings.plan = plan;

    db.save(data);

    updatePlanDisplay();

    displayPlans();

}


function displayCountdown() {

    const box = document.getElementById("countdown-card");
    if (!box) return;

    const now = new Date();

    const events = db.load().events
        .filter(e => e.start)
        .sort((a, b) => new Date(a.start) - new Date(b.start));

    const next = events.find(e => new Date(e.start) > now);

    if (!next) {
        box.innerHTML = "予定はありません";
        return;
    }

    const start = new Date(next.start);

    // 日数差（時間ではなく日付基準）
    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const eventDay = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
    );

    const days = Math.floor(
        (eventDay - today) / 86400000
    );

    const diff = start - now;
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);

    let text = "";

    if (days >= 5) {

        text = "イベントまでまだあります";

    } else if (days >= 1) {

        text = `あと ${days} 日`;

    } else if (diff > 0) {

        text = `あと ${hours}時間 ${mins}分`;

    } else {

        text = "🎉 開催中";

    }

    const category = getCategoryInfo(next.category);

    box.innerHTML = `
        <div class="schedule-item"
             onclick="openEventDetail(${next.id})">

            <div style="font-size:28px;font-weight:bold;margin-bottom:10px;">
                ${text}
            </div>

            <div>
                ${category?.icon || "📌"} ${next.title}
            </div>

            <div style="margin-top:6px;font-size:13px;">
                📅 ${start.toLocaleString("ja-JP")}
            </div>

            ${
                next.place
                ? `<div style="margin-top:4px;">📍 ${next.place}</div>`
                : ""
            }

        </div>
    `;
}


/* =====================
   イベント詳細表示
===================== */
function openEventDetail(id){

const event = db.load().events.find(e => e.id === id);

if (!event) return;

    currentDetailEventId = id;

    const category =
        getCategoryInfo(event.category);

    document.getElementById(
        "detail-title"
    ).innerHTML =

    `
    ${category?.icon || "📌"}
    ${event.title}
    `;

    document.getElementById(
        "detail-content"
    ).innerHTML =

    `

    <p>
    📅 ${event.date}
    </p>

    ${
        event.start
        ?
        `<p>
        🕒 開始：${new Date(event.start).toLocaleString("ja-JP")}
        </p>`
        :
        ""
    }

    ${
        event.end
        ?
        `<p>
        🕔 終了：${new Date(event.end).toLocaleString("ja-JP")}
        </p>`
        :
        ""
    }

    ${
        event.place
        ?
        `<p>
        📍 ${event.place}
        </p>`
        :
        ""
    }

    ${
        event.meeting
        ?
        `<p>
        🤝 集合：${event.meeting}
        </p>`
        :
        ""
    }

    ${
        event.companion
        ?
        `<p>
        👥 ${event.companion}
        </p>`
        :
        ""
    }

    <div class="event-button-area">

        ${
            event.map
            ?
            `
            <button
            class="map-btn"
            onclick="location.href='${event.map}'">
            🗺 地図
            </button>
            `
            :
            ""
        }

        ${
            event.ticket
            ?
            `
            <button
            class="map-btn"
            onclick="location.href='${event.ticket}'">
            🎫 チケット
            </button>
            `
            :
            ""
        }

    </div>

    <div class="event-button-area">

        <button
        class="edit-btn"
        onclick="editCurrentEvent()">
        ✏️ 編集
        </button>

        <button
        class="event-delete-btn"
        onclick="deleteCurrentEvent()">
        🗑 削除
        </button>

    </div>

    `;

    document.getElementById(
        "eventDetailModal"
    ).style.display="block";


}


function closeEventDetail(){

    document.getElementById(
        "eventDetailModal"
    ).style.display="none";

}

function editCurrentEvent(){

    closeEventDetail();

    selectEvent(currentDetailEventId);

}

function deleteCurrentEvent(){

    if(!confirm("この予定を削除しますか？"))
        return;

    db.deleteEvent(currentDetailEventId);

    closeEventDetail();

    displayEventList();

    renderCalendar();

    displayHomeSchedule();

    displayUpcomingEvents();

    displayCountdown();

}