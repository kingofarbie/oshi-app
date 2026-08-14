
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

function switchTab(pageId, event, fromCalendar = false){

    console.log("switchTab実行:", pageId);


    /* =====================
       ページ切り替え
    ===================== */

    document
        .querySelectorAll('.page')
        .forEach(page => {

            page.classList.remove('active');

        });


    const targetPage =
        document.getElementById(pageId);


    if(!targetPage){

        console.error(
            "ページが見つかりません:",
            pageId
        );

        return;

    }


    targetPage.classList.add('active');


    /* =====================
       ページ切り替え時に
       ☰メニュー表示へ戻す
    ===================== */

    setHomeMenuButton("open");


    /* =====================
       ページ切り替え時に上へ戻す
    ===================== */

    window.scrollTo({

        top: 0,
        behavior: "instant"

    });


    /* =====================
       タブ切り替え
    ===================== */

    document
        .querySelectorAll('.tab')
        .forEach(tab => {

            tab.classList.remove('active');

        });


    if(
        event &&
        event.currentTarget
    ){

        event.currentTarget.classList.add(
            'active'
        );

    }


    /* =====================
       カレンダー
    ===================== */

    if(pageId === 'calendarPage'){

        const calendar =
            document.getElementById(
                'calendar'
            );


        if(calendar){

            calendar.style.display =
                'block';

        }


        setTimeout(() => {

            if(
                typeof renderCalendar ===
                'function'
            ){

                renderCalendar();

            }

        }, 50);

    }


    /* =====================
       1日手帳
    ===================== */

    if(pageId === 'plannerPage'){

        const today =
            new Date();


        const todayString =
            `${today.getFullYear()}-${
                String(
                    today.getMonth() + 1
                ).padStart(2,'0')
            }-${
                String(
                    today.getDate()
                ).padStart(2,'0')
            }`;


        /*
           カレンダーから来た場合
           → 選択した日を表示
        */

        const plannerDate =
            fromCalendar
            ? selectedCalendarDate
            : todayString;


        /*
           1日手帳タブから直接来た場合
           → 今日を表示
        */

        if(!fromCalendar){

            selectedCalendarDate =
                todayString;

        }


        setTimeout(() => {

            if(
                typeof showPlanner ===
                'function'
            ){

                showPlanner(
                    plannerDate,
                    fromCalendar
                );

            }

        }, 50);

    }


    /* =====================
       ホーム
    ===================== */

    if(pageId === 'home'){

        if(
            typeof displayHomeSchedule ===
            'function'
        ){

            displayHomeSchedule();

        }


        if(
            typeof displayUpcomingEvents ===
            'function'
        ){

            displayUpcomingEvents();

        }


        if(
            typeof displayFavoritePhotoCard ===
            'function'
        ){

            displayFavoritePhotoCard();

        }


        if(
            typeof displayCountdown ===
            'function'
        ){

            displayCountdown();

        }


    }


    /* =====================
       お気に入り
    ===================== */
    if(pageId === 'favoritePage'){

    setTimeout(() => {

        if(
            typeof favoritePhotoRender ===
            'function'
        ){

            favoritePhotoRender();

        }else{

            console.error(
                "★ favoritePhotoRender() が見つかりません"
            );

        }

    }, 50);

}



    /* =====================
       💰 お金
    ===================== */

    if(pageId === 'moneyPage'){

        console.log(
            "★ お金ページを読み込みます"
        );


        setTimeout(() => {

            if(
                typeof loadMoneyPage ===
                'function'
            ){

                loadMoneyPage();

            }else{

                console.error(
                    "★ loadMoneyPage() が見つかりません"
                );

            }

        }, 50);

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

    loadTemplateSelect();

    document.getElementById("event-start").value =
        selectedCalendarDate + "T12:00";

    document.getElementById("event-end").value =
        selectedCalendarDate + "T13:00";

    document.getElementById("eventFormModal").style.display =
        "block";

}

/* =====================
   保存
===================== */

function saveEvent(){

    const start =
        document.getElementById('event-start').value;

    const data = {

        category:
        document.getElementById('event-category').value,

        title:
        document.getElementById('event-title').value,

        start:
        start,

        end:
        document.getElementById('event-end').value,

        place:
        document.getElementById('event-place').value,

        meeting:
        document.getElementById('meeting-time').value,

        companion:
        document.getElementById('companions').value,

        map:
        document.getElementById('map-url').value,

        ticket:
        document.getElementById('ticket-url').value,

        // ★ 持ち物リスト保存
        checklist:
        JSON.parse(JSON.stringify(checklistItems)),


    };


    if(!data.title){

        alert("イベント名を入力してください");

        return;

    }


    if(!data.start){

        alert("開始日時を入力してください");

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


    // 次回入力用に持ち物をリセット
    checklistItems = [];

    renderChecklistEditor();

    closeEventModal();

    clearEventForm();


    displayEventList();

    displaySelectedDateEvents();


    displayHomeSchedule();

displayUpcomingEvents();

displayFavoritePhotoCard();

displayCountdown();


/* =====================
   保存後の画面更新
===================== */

const plannerPage =
    document.getElementById("plannerPage");

const calendarPage =
    document.getElementById("calendarPage");

/* 1日手帳を開いている場合だけ更新 */

if(
    plannerPage &&
    plannerPage.classList.contains("active") &&
    selectedCalendarDate
){

    showPlanner(
        selectedCalendarDate,
        false
    );

}

/* カレンダーを開いている場合は
   カレンダーのまま */

if(
    calendarPage &&
    calendarPage.classList.contains("active")
){

    renderCalendar();

}



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
    new Date(a.start)
    -
    new Date(b.start)
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
📅 ${e.start ? e.start.substring(0,10) : ""}
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

    displaySelectedDateEvents();
    
}



/* =====================
   設定メニュー開閉
===================== */

let openSettingMenu = null;


function toggleSetting(menuId){

const menus = [
    "planMenu",
    "themeMenu",
    "holidayMenu",
    "memorialMenu",
    "anniversaryMenu",
    "notificationMenu",
    "favoritePhotoMenu",
    "templateMenu",
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

    /* =====================
       ホームHTML読み込み
    ===================== */

    await loadHtml(
        "home",
        "home.html"
    );

    /* =====================
       ホームHTMLが入った直後に
       ホームを表示
    ===================== */

    displayHomeSchedule();
    displayUpcomingEvents();
    displayFavoritePhotoCard();
    displayCountdown();


    /* =====================
       その他HTML読み込み
    ===================== */

    await loadHtml(
        "homeMenuContainer",
        "home-menu.html"
    );

    console.log(
        "appShareModal:",
        document.getElementById("appShareModal")
    );


    await loadHtml(
        "plannerContainer",
        "planner.html"
    );

    await loadHtml(
        "calendarContainer",
        "calendar.html"
    );

    await loadHtml(
        "settingsContainer",
        "settings.html"
    );

    await loadHtml(
        "aboutAppContainer",
        "about.html"
    );

    await loadHtml(
        "anniversaryContainer",
        "anniversary.html"
    );


console.log("★★★★★ anniversary の次まで来た ★★★★★");

    await loadHtml(
    "favoritePhotoContainer",
    "favorites-photo.html"
);

console.log("★★★★★ favorites-photo.html 読み込み確認 ★★★★★");

displayFavoritePhotos();



    await loadHtml(
    "oshiContainer",
    "oshi.html"
);


    /* =====================
       初期化
    ===================== */

    initializeCategories();

    await loadMaster();
    
    initOshiList();


    /* =====================
       イベント
    ===================== */

    displayEventList();


    /* =====================
       カレンダー
    ===================== */

    renderCalendar();


    /* =====================
       通知
    ===================== */

    updateNotificationButtons();

    await initNotification();


    /* =====================
       カテゴリ
    ===================== */

    displayCategories();

    updateEventCategoryOptions();


    /* =====================
       プラン
    ===================== */

    updatePlanDisplay();

    displayPlans();


    /* =====================
       テンプレート
    ===================== */

    displayTemplateList();

    updateTemplateSelect();

};

/* =====================
   HTML読込
===================== */

async function loadHtml(id, file){

    try {

        const response = await fetch(file);

        if(!response.ok){
            throw new Error(
                `${file} の読み込みに失敗しました: ${response.status}`
            );
        }

        const html = await response.text();

        const container =
            document.getElementById(id);

        if(!container){
            throw new Error(
                `HTML内に ${id} が見つかりません`
            );
        }

        container.innerHTML = html;

        console.log(
            `★★★★★ ${file} 読み込み成功 ★★★★★`
        );

    } catch(error){

        console.error(
            `★★★★★ ${file} 読み込み失敗 ★★★★★`,
            error
        );

        // ここで起動処理全体を止めない
        return false;
    }

    return true;
}




function openEventSelectModal(){

    const list =
        document.getElementById(
            "eventSelectList"
        );


const events =
    db.load().events
    .filter(
        e =>
            e.start &&
            e.start.startsWith(menuDate)
    )
    .sort(
        (a,b) =>
            new Date(a.start) -
            new Date(b.start)
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
            e => e.id === selectedEventId
        );

    if(!event) return;

    editingEventId = event.id;

    document.getElementById("event-category").value = event.category;
    document.getElementById("event-title").value = event.title;
    document.getElementById("event-start").value = event.start || "";
    document.getElementById("event-end").value = event.end || "";
    document.getElementById("event-place").value = event.place || "";
    document.getElementById("meeting-time").value = event.meeting || "";
    document.getElementById("companions").value = event.companion || "";
    document.getElementById("map-url").value = event.map || "";
    document.getElementById("ticket-url").value = event.ticket || "";

    // 持ち物を復元
    checklistItems = event.checklist
        ? JSON.parse(JSON.stringify(event.checklist))
        : [];

    renderChecklistEditor();
    
    loadTemplateSelect();
    
    document.getElementById("templateSelect").value = "";




    document.getElementById("eventFormModal").style.display = "block";

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



/* =====================
   イベント詳細表示
===================== */
/* =====================
   イベント詳細表示
===================== */
function openEventDetail(id){

    const event =
        db.load().events.find(e => e.id === id);

    if(!event) return;

    currentDetailEventId = id;

    const modal = document.getElementById("eventDetailModal");
    const title = document.getElementById("detail-title");
    const content = document.getElementById("detail-content");
    const checklist = document.getElementById("detail-checklist");

    const mapBtn = document.getElementById("detailMapBtn");
    const ticketBtn = document.getElementById("detailTicketBtn");

    const category = getCategoryInfo(event.category);

    title.innerHTML =
        `${category?.icon || "📌"} ${event.title}`;

    content.innerHTML = `

<div class="detail-card">

<div class="detail-row">
<span class="detail-icon">📅</span>
<span>${event.start ? event.start.substring(0,10) : ""}</span>
</div>

${
event.start
?
`<div class="detail-row">
<span class="detail-icon">🕕</span>
<span>
${event.start.substring(11,16)}
${event.end ? " ～ " + event.end.substring(11,16) : ""}
</span>
</div>`
:""
}

${
event.place
?
`<div class="detail-row">
<span class="detail-icon">📍</span>
<span>${event.place}</span>
</div>`
:""
}

${
event.meeting
?
`<div class="detail-row">
<span class="detail-icon">🤝</span>
<span>${event.meeting}</span>
</div>`
:""
}

${
event.companion
?
`<div class="detail-row">
<span class="detail-icon">👥</span>
<span>${event.companion}</span>
</div>`
:""
}

</div>

`;

    // 持ち物表示
    if(event.checklist && event.checklist.length){

        checklist.innerHTML = event.checklist.map(item => `
<div class="check-item">

<input
type="checkbox"
${item.checked ? "checked" : ""}
disabled>

<span class="check-text">
${item.text}
</span>

</div>
`).join("");

    }else{

        checklist.innerHTML = `
<div class="check-empty">
持ち物はありません
</div>
`;

    }

    if(event.map){

        mapBtn.style.display="inline-block";

        mapBtn.onclick=()=>window.open(event.map,"_blank");

    }else{

        mapBtn.style.display="none";

        mapBtn.onclick=null;

    }

    if(event.ticket){

        ticketBtn.style.display="inline-block";

        ticketBtn.onclick=()=>window.open(event.ticket,"_blank");

    }else{

        ticketBtn.style.display="none";

        ticketBtn.onclick=null;

    }

    modal.style.display="block";

}

function closeEventDetail(){

    document.getElementById(
        "eventDetailModal"
    ).style.display="none";

}

function editCurrentEvent(){

    closeEventDetail();

    setTimeout(function(){

        selectEvent(currentDetailEventId);

    },100);

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



let checklistItems = [];

let templateItems = [];
let editingTemplateId = null;

function addChecklistItem(){

    const input = document.getElementById("newChecklistItem");

    const text = input.value.trim();

    if(!text) return;

    checklistItems.push({
        text:text,
        checked:false
    });

    input.value="";

    renderChecklistEditor();

}

function removeChecklistItem(index){

    checklistItems.splice(index,1);

    renderChecklistEditor();

}

function toggleChecklistItem(index,checked){

    checklistItems[index].checked = checked;

}


function renderChecklistEditor(){

    const box = document.getElementById("checklistContainer");

    if(!box) return;

    if(checklistItems.length === 0){

        box.innerHTML = `
            <div class="check-empty">
                持ち物はありません
            </div>
        `;

        return;

    }

    let html = "";

    checklistItems.forEach((item,index)=>{

        html += `

<div class="check-item">

    <input
        type="checkbox"
        ${item.checked ? "checked" : ""}
        onchange="toggleChecklistItem(${index},this.checked)">

    <span class="check-text">
        ${item.text}
    </span>

    <button
        type="button"
        class="check-delete"
        onclick="removeChecklistItem(${index})">
        🗑️
    </button>

</div>

`;

    });

    box.innerHTML = html;

}


function addTemplate(){

    const name =
        document.getElementById("template-name").value.trim();

    if(!name){

        alert("テンプレート名を入力してください");

        return;

    }

    const data = db.load();

    if(!data.settings.checklistTemplates){

        data.settings.checklistTemplates=[];

    }

    data.settings.checklistTemplates.push({

        id:Date.now(),

        name:name,

        items:[]

    });

    db.save(data);

    document.getElementById("template-name").value="";

    displayTemplateList();

}


function displayTemplateList(){

    const box =
        document.getElementById("template-list");

    if(!box) return;

    const data = db.load();

    const list =
        data.settings.checklistTemplates || [];

    if(list.length===0){

        box.innerHTML = "テンプレートはありません";

        return;

    }

    box.innerHTML = list.map(t=>`

<div class="item">

    <button
        onclick="openTemplateEditor(${t.id})">

        👜 ${t.name}

    </button>

</div>

`).join("");

}

function updateTemplateSelect(){

    const select =
        document.getElementById("templateSelect");

    if(!select) return;

    const data = db.load();

    const list =
        data.settings.checklistTemplates || [];

    select.innerHTML =
        '<option value="">テンプレートを選択</option>';

    list.forEach(t=>{

        select.innerHTML +=
        `<option value="${t.id}">
            ${t.name}
        </option>`;

    });

}



function openTemplateEditor(id){

    const data = db.load();

    const template =
        data.settings.checklistTemplates.find(
            t => t.id === id
        );

    if(!template) return;

    editingTemplateId = id;

    templateItems = JSON.parse(
        JSON.stringify(template.items || [])
    );

    document.getElementById(
        "templateEditorTitle"
    ).textContent =
        "👜 " + template.name;

    renderTemplateItems();

    document.getElementById(
        "templateEditorModal"
    ).style.display = "block";

}

function closeTemplateEditor(){

    const modal =
        document.getElementById(
            "templateEditorModal"
        );

    if(modal){

        modal.style.display = "none";

    }

}


function renderTemplateItems(){

    const box =
        document.getElementById("templateEditorList");

    if(!box) return;

    if(templateItems.length===0){

        box.innerHTML =
        "<div class='check-empty'>持ち物はありません</div>";

        return;

    }

    box.innerHTML = templateItems.map((item,index)=>`

<div class="check-item">

<input
type="checkbox"
disabled>

<span class="check-text">

${item.text}

</span>

<button
type="button"
class="check-delete"
onclick="removeTemplateItem(${index})">

🗑️

</button>

</div>

`).join("");

}


function removeTemplateItem(index){

    templateItems.splice(index,1);

    renderTemplateItems();

}

function addTemplateItem(){

    const input =
        document.getElementById("newTemplateItem");

    const text =
        input.value.trim();

    if(!text) return;

    templateItems.push({

        text:text,
        checked:false

    });

    input.value="";

    renderTemplateItems();

}


function saveTemplate(){

    const data = db.load();

    const template =
        data.settings.checklistTemplates.find(
            t => t.id === editingTemplateId
        );

    if(!template) return;

    template.items = JSON.parse(
        JSON.stringify(templateItems)
    );

    db.save(data);

    closeTemplateEditor();

    displayTemplateList();

}

function loadTemplateSelect(){

    const select =
        document.getElementById("templateSelect");

    if(!select) return;

    const data = db.load();

    const list =
        data.settings.checklistTemplates || [];

    select.innerHTML =
        `<option value="">テンプレートを選択</option>` +
        list.map(t=>`
<option value="${t.id}">
${t.name}
</option>
`).join("");

}

function applyTemplate(){

    const select =
        document.getElementById("templateSelect");

    if(!select.value) return;

    const data = db.load();

    const template =
        data.settings.checklistTemplates.find(
            t=>t.id==select.value
        );

    if(!template) return;

    checklistItems =
        JSON.parse(
            JSON.stringify(template.items || [])
        );

    renderChecklistEditor();

}


function openDayMemory(){

    alert("1日手帳は次のStepで作成します😊");

}





function addVideo(){

    alert("動画追加（次で実装します）");

}

function addMemo(){

    document.getElementById("memoText").value="";

    document.getElementById("memoModal").style.display="block";

}

function closeMemoModal(){

    document.getElementById("memoModal").style.display="none";

}


function addExpense(){

    alert("支出追加（次で実装します）");

}

function addRating(){

    alert("評価追加（次で実装します）");

}

function addComment(){

    alert("今日の一言追加（次で実装します）");

}


function saveMemo(){

    const text =
        document.getElementById("memoText").value.trim();

    if(!text){
        return;
    }

    const data = db.load();

    if(!data.dayMemories){
        data.dayMemories = {};
    }

    if(!data.dayMemories[selectedCalendarDate]){

        data.dayMemories[selectedCalendarDate]={

            memo:[],

            photos:[],

            videos:[],

            expenses:[],

            rating:0,

            comment:""

        };

    }

    data.dayMemories[selectedCalendarDate].memo.push({

        id:Date.now(),

        text:text

    });

    db.save(data);

    closeMemoModal();
    
    renderDayMemory();

}

let showAllDayPhotos = false;

function renderDayMemory(){

    const data = db.load();

    const day =
        data.dayMemories?.[selectedCalendarDate];

    /* =====================
       メモ
    ===================== */

    const memoArea =
        document.getElementById("memoList");

    if(memoArea){

        if(day && day.memo && day.memo.length){

            memoArea.innerHTML =
                day.memo.map(m=>`

<div class="memory-card">

${m.text}

</div>

`).join("");

        }else{

            memoArea.innerHTML =
                "<div class='check-empty'>まだメモはありません</div>";

        }

    }

    /* =====================
       写真
    ===================== */

    renderDayPhotos();

}


let previousPageBeforeSettings = "home";

function openSettingsFromMenu(){

    closeHomeMenu();

    /* 設定を開く前のページを記憶 */
    const currentPage =
        document.querySelector(".page.active");

    if(currentPage){

        previousPageBeforeSettings =
            currentPage.id;

        console.log(
            "設定前のページ:",
            previousPageBeforeSettings
        );

    }

    /* すべてのページを閉じる */
    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    /* 設定を開く */
    const settings =
        document.getElementById("settingsPage");

    if(!settings){

        console.error(
            "settingsPage が見つかりません"
        );

        return;

    }

    settings.classList.add("active");

    /* ☰ → ✕ */
    setHomeMenuButton("close");

}

function closeSettingsFromMenu(){

    /* 設定を閉じる */
    const settings =
        document.getElementById("settingsPage");

    if(settings){

        settings.classList.remove("active");

    }

    /* 設定を開く前のページへ戻る */
    const previousPage =
        document.getElementById(
            previousPageBeforeSettings
        );

    if(previousPage){

        previousPage.classList.add("active");

        console.log(
            "設定から戻る:",
            previousPageBeforeSettings
        );

    }

    /* ✕ → ☰ */
    setHomeMenuButton("open");

}

function setHomeMenuButton(mode){

    const button =
        document.getElementById("homeMenuButton");

    if(!button) return;

    if(mode === "close"){

        button.textContent = "✕";

        button.setAttribute(
            "aria-label",
            "閉じる"
        );

        button.onclick =
            closeSettingsFromMenu;

    }else{

        button.textContent = "☰";

        button.setAttribute(
            "aria-label",
            "メニュー"
        );

        button.onclick =
            toggleHomeMenu;

    }

}