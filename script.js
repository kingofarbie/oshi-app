

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

    /* =====================
       ページ切り替え
    ===================== */

document
    .querySelectorAll('.page')
    .forEach(page => {

        page.classList.remove('active');

        page.style.display = "";

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
   最後に開いていたページを保存
===================== */

localStorage.setItem(
    "oshi_last_page",
    pageId
);

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

    /*
       カレンダーHTMLを再読み込みして
       DOM構造を確実に復元する
    */

    setTimeout(() => {

        if(
            typeof loadCalendarHTML ===
            'function'
        ){

            loadCalendarHTML();

        }else{

            console.error(
                "❌ loadCalendarHTML() が見つかりません"
            );

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
    : (
        localStorage.getItem("oshi_last_planner_date")
        || todayString
    );


        /*
           1日手帳タブから直接来た場合
           → 今日を表示
        */

if(
    !fromCalendar &&
    !localStorage.getItem("oshi_last_planner_date")
){

    selectedCalendarDate =
        todayString;

}


        /* =====================
   1日手帳の表示日を保存
===================== */

if(plannerDate){

    localStorage.setItem(
        "oshi_last_planner_date",
        plannerDate
    );

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
   ⭐ 推しタブ
   推し一覧を再読み込み
===================== */

if(pageId === 'oshiPage'){

    setTimeout(() => {

        if(
            typeof loadOshiPage ===
            'function'
        ){

            loadOshiPage();

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

        /* =====================
           ⭐ お気に入り写真枚数更新
        ===================== */

        if(
            typeof favoritePhotoUpdateHomeCount ===
            'function'
        ){

            favoritePhotoUpdateHomeCount();

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

    const repeat =
        document.getElementById('event-repeat')?.value || "none";

    const repeatEnd =
        document.getElementById('event-repeat-end')?.value || "never";

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

        // 🔁 繰り返し設定保存
        repeat:
        repeat,

        repeatInterval:
        repeat === "interval"
            ? Math.max(1, Number(document.getElementById('event-repeat-interval')?.value) || 1)
            : 1,

        repeatUnit:
        document.getElementById('event-repeat-unit')?.value || "day",

        repeatMonthly:
        repeat === "monthly"
            ? document.getElementById('event-repeat-monthly')?.value || "date"
            : "date",

        repeatWeek:
        Number(document.getElementById('event-repeat-week')?.value || 1),

        repeatWeekday:
        Number(document.getElementById('event-repeat-weekday')?.value ?? 0),

        repeatEnd:
        repeatEnd,

        repeatUntil:
        repeatEnd === "until"
            ? document.getElementById('event-repeat-until')?.value || ""
            : "",

        repeatCount:
        repeatEnd === "count"
            ? Math.max(1, Number(document.getElementById('event-repeat-count')?.value) || 10)
            : 10

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
    "appTitleMenu",
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

    initFavoritePhotoSettings();
    refreshCurrentTheme();


    await loadHtml(
        "aboutAppContainer",
        "about.html"
    );

    await loadHtml(
        "anniversaryContainer",
        "anniversary.html"
    );



    await loadHtml(
    "favoritePhotoContainer",
    "favorites-photo.html"
);


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

        initAppTitle();


/* =====================
   再読み込み時に
   最後に開いていたページを復元
===================== */

const lastPage =
    localStorage.getItem("oshi_last_page");

if(lastPage){

    const targetPage =
        document.getElementById(lastPage);

    if(targetPage){

        document
            .querySelectorAll(".page")
            .forEach(page => {
                page.classList.remove("active");
            });

        targetPage.classList.add("active");

        setHomeMenuButton("open");


        /* カレンダー */
        if(lastPage === "calendarPage"){

            renderCalendar();

        }


        /* 1日手帳 */
        if(lastPage === "plannerPage"){

            const savedDate =
                localStorage.getItem(
                    "oshi_last_planner_date"
                );

            if(
                savedDate &&
                typeof showPlanner === "function"
            ){

                selectedCalendarDate =
                    savedDate;

                showPlanner(
                    savedDate,
                    false
                );

            }

        }


        /* 推し */
        if(lastPage === "oshiPage"){

            if(
                typeof loadOshiPage === "function"
            ){

                loadOshiPage();

            }


            

        }


        /* お気に入り */
        if(lastPage === "favoritePage"){

            if(
                typeof favoritePhotoRender === "function"
            ){

                favoritePhotoRender();

            }

        }


        /* お金 */
        if(lastPage === "moneyPage"){

            if(
                typeof loadMoneyPage === "function"
            ){

                loadMoneyPage();

            }

        }


        /* ホーム */
        if(lastPage === "home"){

            displayHomeSchedule();
            displayUpcomingEvents();
            displayFavoritePhotoCard();
            favoritePhotoUpdateHomeCount();
            displayCountdown();

        }

    }

}





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



function openDayMemory() {
    const modal = document.getElementById("plannerShareModal");

    if (!modal) {
        alert("共有設定画面が見つかりません。");
        return;
    }

    modal.style.display = "block";
}

function plannerShareCloseModal() {
    const modal = document.getElementById("plannerShareModal");

    if (modal) {
        modal.style.display = "none";
    }
}

function plannerShareFamilyLaneIsVisible() {
    const lanes = document.querySelector(
        "#plannerTimeline .planner-family-lanes"
    );

    if (!lanes) {
        return false;
    }

    const style = window.getComputedStyle(lanes);

    return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        lanes.getClientRects().length > 0
    );
}

function plannerShareChooseFamily(includeFamily) {
    const familyVisible = plannerShareFamilyLaneIsVisible();

    plannerShareCloseModal();

    // 家族予定を含めたいのに、家族レーンが非表示
    if (includeFamily && !familyVisible) {
        alert(
            "家族の予定を画像に含めるには、先に1日手帳で家族レーンを表示してから、もう一度「共有」を押してください。"
        );
        return;
    }

    // 家族予定を除外したいのに、家族レーンが表示中
    if (!includeFamily && familyVisible) {
        alert(
            "個人の予定だけを画像にするには、先に1日手帳で家族レーンを非表示にしてから、もう一度「共有」を押してください。"
        );
        return;
    }

plannerCreateScheduleImage(includeFamily);


}




/* =========================================
   📤 1日手帳の予定画像を作成
   html2canvas版
   ・元画面のスクロール位置を変更しない
   ・予定と時間軸を画像化する
   ・家族レーンは選択に応じて処理する
========================================= */


async function plannerCreateScheduleImage(includeFamily) {
    if (typeof window.html2canvas !== "function") {
        alert(
            "画像生成ライブラリを読み込めませんでした。\n" +
            "インターネット接続とCDNの読み込みを確認してください。"
        );
        return;
    }

    const originalTimeline = document.getElementById("plannerTimeline");
    const originalTitle = document.getElementById("plannerTitle");
    const originalPlanner = document.getElementById("dayPlanner");

    if (!originalTimeline || !originalTitle || !originalPlanner) {
        alert("1日手帳の表示が見つかりません。");
        return;
    }

    const originalLayout = originalTimeline.querySelector(".planner-layout");

    if (!originalLayout) {
        alert("予定の表示領域が見つかりません。");
        return;
    }

    let exportRoot = null;

    try {
        const layoutRect = originalLayout.getBoundingClientRect();

        const width = Math.ceil(
            Math.max(originalLayout.scrollWidth, layoutRect.width)
        );

        exportRoot = document.createElement("div");
        exportRoot.id = "plannerScheduleExportTemp";

        Object.assign(exportRoot.style, {
            position: "fixed",
            left: "-100000px",
            top: "0",
            width: width + "px",
            height: "auto",
            overflow: "visible",
            background: "#ffffff",
            color: "#222222",
            zIndex: "-1",
            pointerEvents: "none"
        });

        const titleClone = originalTitle.cloneNode(true);
        const timelineClone = originalTimeline.cloneNode(true);

        // 記念日バブルはタイトルの兄弟要素なので、別に複製する
        const originalBadge = originalPlanner.querySelector(
            ".planner-anniversary-badge"
        );

        const badgeClone = originalBadge
            ? originalBadge.cloneNode(true)
            : null;

        titleClone.style.position = "relative";
        titleClone.style.top = "0";
        titleClone.style.width = width + "px";
        titleClone.style.transform = "none";

        if (badgeClone) {
            badgeClone.style.position = "relative";
            badgeClone.style.top = "0";
            badgeClone.style.left = "0";
            badgeClone.style.transform = "none";
        }

        timelineClone.style.width = width + "px";
        timelineClone.style.height = "auto";
        timelineClone.style.maxHeight = "none";
        timelineClone.style.overflow = "visible";
        timelineClone.style.transform = "none";

        // 複製側の不要な操作ボタンだけを除外
        timelineClone.querySelectorAll(
            ".planner-event button"
        ).forEach(button => button.remove());

        // 家族レーンを含めない場合は複製側だけ変更
        const clonedLayout = timelineClone.querySelector(".planner-layout");

        if (!includeFamily) {
            timelineClone.querySelectorAll(
                ".planner-family-lanes"
            ).forEach(element => element.remove());

            if (clonedLayout) {
                clonedLayout.style.paddingTop = "0";
            }
        }

        // 共有画像内の家族予定名を縦書き用に変換
        // 元の1日手帳には影響させない
        if (includeFamily) {
            timelineClone.querySelectorAll(
                ".planner-family-event-title"
            ).forEach(title => {
                const text = title.textContent || "";
                title.textContent = "";

                Object.assign(title.style, {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    writingMode: "horizontal-tb",
                    textOrientation: "mixed",
                    whiteSpace: "normal",
                    overflow: "hidden",
                    lineHeight: "1.2"
                });

                Array.from(text).forEach(character => {
                    const span = document.createElement("span");
                    span.textContent = character;

                    Object.assign(span.style, {
                        display: "block",
                        flex: "0 0 auto",
                        writingMode: "horizontal-tb",
                        transform: "none"
                    });

                    title.appendChild(span);
                });
            });
        }

        // 固定高・スクロール制限を複製側で解除
        timelineClone.querySelectorAll(
            ".planner-layout, .planner-board, " +
            ".planner-times, .planner-family-lanes"
        ).forEach(element => {
            element.style.maxHeight = "none";
            element.style.overflow = "visible";
        });

        exportRoot.appendChild(titleClone);

        if (badgeClone) {
            exportRoot.appendChild(badgeClone);
        }

        exportRoot.appendChild(timelineClone);
        document.body.appendChild(exportRoot);

        // レイアウト計算を待つ
        await new Promise(resolve =>
            requestAnimationFrame(() =>
                requestAnimationFrame(resolve)
            )
        );

        // ヘッダーの下端を実際の表示位置から計測する
        const rootRect = exportRoot.getBoundingClientRect();

        let headerBottom = Math.max(
            titleClone.getBoundingClientRect().bottom,
            badgeClone
                ? badgeClone.getBoundingClientRect().bottom
                : 0
        );

        if (includeFamily) {
            timelineClone.querySelectorAll(
                ".planner-family-lane-header"
            ).forEach(header => {
                headerBottom = Math.max(
                    headerBottom,
                    header.getBoundingClientRect().bottom
                );
            });
        }

        const exportHeight = Math.ceil(exportRoot.scrollHeight);

        const headerRatio = Math.max(
            0,
            Math.min(
                1,
                (headerBottom - rootRect.top) /
                    Math.max(1, exportHeight)
            )
        );

        const canvas = await window.html2canvas(exportRoot, {
            backgroundColor: "#ffffff",
            scale: Math.min(
                2,
                Math.sqrt(
                    16000000 /
                    Math.max(1, width * exportHeight)
                )
            ),
            useCORS: true,
            logging: false,
            width,
            height: exportHeight,
            windowWidth: Math.max(
                document.documentElement.clientWidth,
                width
            ),
            windowHeight: Math.max(
                window.innerHeight,
                exportHeight
            ),
            scrollX: 0,
            scrollY: 0
        });

        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, "image/png");
        });

        if (!blob) {
            throw new Error("PNG画像を作成できませんでした。");
        }

        // 実際の画像ピクセル数に変換して渡す
        const headerHeight = Math.max(
            0,
            Math.min(
                canvas.height,
                Math.round(headerRatio * canvas.height)
            )
        );

        plannerShowScheduleImage(blob, headerHeight);

    } catch (error) {
        console.error("1日手帳の画像生成エラー:", error);

        alert(
            "画像を作成できませんでした。\n" +
            "コンソールのエラーを確認してください。"
        );

    } finally {
        // 元の1日手帳には触れず、複製だけを削除
        if (exportRoot) {
            exportRoot.remove();
        }
    }
}



/* =========================================
   🖼️ 画像プレビュー・保存・共有
========================================= */






function plannerShowScheduleImage(blob, headerHeight = 0) {
    const oldModal = document.getElementById(
        "plannerScheduleImageModal"
    );

    if (oldModal) {
        if (oldModal.dataset.imageUrl) {
            URL.revokeObjectURL(oldModal.dataset.imageUrl);
        }

        if (oldModal.dataset.resultUrl) {
            URL.revokeObjectURL(oldModal.dataset.resultUrl);
        }

        oldModal.remove();
    }

    const originalUrl = URL.createObjectURL(blob);

    let currentBlob = blob;
    let currentUrl = originalUrl;
    let resultUrl = null;

    let cropRanges = [];
    let cropMode = false;
    let waitingForRange = false;
    let activeRangeIndex = -1;

    let dragStartY = null;
    let dragCurrentY = null;
    let editingEdge = null;
    let pointerMoved = false;

    let sourceImageHeight = 0;
    let sourceHeaderHeight = headerHeight;

    const modal = document.createElement("div");
    modal.id = "plannerScheduleImageModal";
    modal.className = "modal";
    modal.dataset.imageUrl = originalUrl;

    Object.assign(modal.style, {
        display: "block",
        zIndex: "20000"
    });

    const content = document.createElement("div");
    content.className = "modal-content";

    Object.assign(content.style, {
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "6px"
    });

    const heading = document.createElement("h2");
    heading.textContent = "📤 予定画像";

    Object.assign(heading.style, {
        margin: "4px 0",
        fontSize: "18px"
    });

    const toolbar = document.createElement("div");

    Object.assign(toolbar.style, {
        position: "sticky",
        top: "0",
        zIndex: "10",
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
        padding: "5px 0",
        background: "var(--card-bg, #fff)",
        borderBottom: "1px solid #ddd"
    });

    const status = document.createElement("p");





    
    // 保存完了ポップアップ
    function showSaveSuccess() {
        const toast = document.createElement("div");

        toast.innerHTML = `
            <div style="
                width: 52px;
                height: 52px;
                border-radius: 50%;
                background: #e9f9ef;
                color: #16834a;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                font-weight: bold;
            ">✓</div>
            <div style="
                color: #ffffff;
                font-size: 17px;
                font-weight: bold;
            ">保存しました！</div>
        `;

        Object.assign(toast.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            width: "min(260px, calc(100vw - 48px))",
            minHeight: "150px",
            boxSizing: "border-box",
            padding: "24px",
            background: "#22212b",
            borderRadius: "22px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
            zIndex: "30000",
            opacity: "0",
            transition: "opacity 0.2s ease, transform 0.2s ease"
        });

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translate(-50%, -50%) scale(1)";
        });

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translate(-50%, -50%) scale(0.95)";

            setTimeout(() => toast.remove(), 250);
        }, 1800);
    }





    status.textContent = "画像をそのまま保存・共有できます。";

    Object.assign(status.style, {
        margin: "6px 0",
        fontSize: "12px",
        lineHeight: "1.4"
    });

    const preview = document.createElement("img");
    preview.src = originalUrl;
    preview.alt = "1日手帳の予定画像";

    Object.assign(preview.style, {
        display: "block",
        width: "100%",
        height: "auto",
        marginBottom: "8px"
    });

    const cropArea = document.createElement("div");

    Object.assign(cropArea.style, {
        display: "none",
        position: "relative",
        width: "100%",
        touchAction: "pan-y",
        userSelect: "none",
        marginBottom: "8px"
    });

    const cropImage = document.createElement("img");
    cropImage.src = originalUrl;
    cropImage.alt = "トリミング範囲の選択";

    Object.assign(cropImage.style, {
        display: "block",
        width: "100%",
        height: "auto",
        pointerEvents: "none",
        userSelect: "none",
        WebkitUserDrag: "none"
    });

    const selectionLayer = document.createElement("div");

    Object.assign(selectionLayer.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none"
    });

    cropArea.append(cropImage, selectionLayer);

    const cropButton = document.createElement("button");
    cropButton.type = "button";
    cropButton.textContent = "✂️ トリミング";

    const addRangeButton = document.createElement("button");
    addRangeButton.type = "button";
    addRangeButton.textContent = "➕ 範囲を追加";

    const removeRangeButton = document.createElement("button");
    removeRangeButton.type = "button";
    removeRangeButton.textContent = "🗑️ 選択範囲を削除";

    const previewCropButton = document.createElement("button");
    previewCropButton.type = "button";
    previewCropButton.textContent = "👀 結果を確認";

    const undoButton = document.createElement("button");
    undoButton.type = "button";
    undoButton.textContent = "✂️ 元に戻して再トリミング";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "💾 保存";

    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.textContent = "📤 共有";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "閉じる";

    toolbar.append(
        cropButton,
        addRangeButton,
        removeRangeButton,
        previewCropButton,
        undoButton,
        saveButton,
        shareButton,
        closeButton
    );

    toolbar.querySelectorAll("button").forEach(button => {
        Object.assign(button.style, {
            fontSize: "12px",
            padding: "5px 7px",
            minHeight: "30px",
            margin: "0",
            lineHeight: "1.2",
            flex: "0 0 auto"
        });
    });

    function isResult() {
        return currentBlob !== blob;
    }

    function updateButtons() {
        const result = isResult();

        if (cropMode && waitingForRange) {
            toolbar.replaceChildren(
                saveButton,
                shareButton,
                closeButton
            );

            return;
        }

        if (cropMode) {
            toolbar.replaceChildren(
                addRangeButton,
                removeRangeButton,
                previewCropButton,
                saveButton,
                shareButton,
                closeButton
            );

            removeRangeButton.disabled =
                activeRangeIndex < 0 ||
                !cropRanges[activeRangeIndex];

            previewCropButton.disabled =
                cropRanges.length === 0;

            return;
        }

        if (result) {
            toolbar.replaceChildren(
                undoButton,
                saveButton,
                shareButton,
                closeButton
            );
        } else {
            toolbar.replaceChildren(
                cropButton,
                saveButton,
                shareButton,
                closeButton
            );

            cropButton.textContent = "✂️ トリミング";
        }
    }

    function getHeaderRatio() {
        if (!sourceImageHeight) return 0;

        return Math.max(
            0,
            Math.min(1, sourceHeaderHeight / sourceImageHeight)
        );
    }

    function getRelativeY(event) {
        const rect = cropArea.getBoundingClientRect();

        if (!rect.height) return 0;

        return Math.max(
            0,
            Math.min(1, (event.clientY - rect.top) / rect.height)
        );
    }

    function drawSelections() {
        selectionLayer.replaceChildren();

        const headerRatio = getHeaderRatio();

        // 自動で残すヘッダー領域
        if (headerRatio > 0) {
            const headerLine = document.createElement("div");

            Object.assign(headerLine.style, {
                position: "absolute",
                left: "0",
                right: "0",
                top: `${headerRatio * 100}%`,
                borderTop: "2px dashed #d97706"
            });

            selectionLayer.appendChild(headerLine);

            const headerLabel = document.createElement("span");
            headerLabel.textContent = "日付・ヘッダーは自動で残ります";

            Object.assign(headerLabel.style, {
                position: "absolute",
                left: "3px",
                top: "3px",
                padding: "3px 5px",
                background: "rgba(255,255,255,0.9)",
                color: "#92400e",
                fontSize: "11px"
            });

            selectionLayer.appendChild(headerLabel);
        }

        cropRanges.forEach((range, index) => {
            const box = document.createElement("div");

            Object.assign(box.style, {
                position: "absolute",
                left: "0",
                right: "0",
                top: `${range.start * 100}%`,
                height: `${(range.end - range.start) * 100}%`,
                boxSizing: "border-box",
                border: index === activeRangeIndex
                    ? "3px solid #2563eb"
                    : "2px solid #16a34a",
                background: index === activeRangeIndex
                    ? "rgba(37,99,235,0.10)"
                    : "rgba(22,163,74,0.10)"
            });

            const label = document.createElement("span");
            label.textContent = `残す範囲 ${index + 1}`;

            Object.assign(label.style, {
                display: "inline-block",
                background: index === activeRangeIndex
                    ? "#2563eb"
                    : "#16a34a",
                color: "#fff",
                padding: "2px 5px",
                fontSize: "11px",
                pointerEvents: "none"
            });

            box.appendChild(label);

            // 上下端の編集ハンドル
            ["start", "end"].forEach(edge => {
                const handle = document.createElement("div");

                handle.dataset.cropEdge = edge;
                handle.dataset.rangeIndex = String(index);

                Object.assign(handle.style, {
                    position: "absolute",
                    left: "0",
                    right: "0",
                    height: "32px",
                    background: "transparent",
                    pointerEvents: "auto",
                    touchAction: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    zIndex: "5",
                    [edge === "start" ? "top" : "bottom"]: "-16px"
                });

                const line = document.createElement("div");

                Object.assign(line.style, {
                    position: "absolute",
                    left: "0",
                    right: "0",
                    top: "13px",
                    height: "6px",
                    borderRadius: "4px",
                    background: index === activeRangeIndex
                        ? "#2563eb"
                        : "#16a34a",
                    pointerEvents: "none"
                });

                handle.appendChild(line);
                box.appendChild(handle);
            });

            selectionLayer.appendChild(box);
        });

        // 新しい範囲をドラッグしているときの表示
        if (
            waitingForRange &&
            dragStartY !== null &&
            dragCurrentY !== null
        ) {
            const top = Math.min(dragStartY, dragCurrentY);
            const bottom = Math.max(dragStartY, dragCurrentY);

            const box = document.createElement("div");

            Object.assign(box.style, {
                position: "absolute",
                left: "0",
                right: "0",
                top: `${top * 100}%`,
                height: `${(bottom - top) * 100}%`,
                border: "2px dashed #2563eb",
                background: "rgba(37,99,235,0.12)",
                boxSizing: "border-box"
            });

            selectionLayer.appendChild(box);
        }
    }

    function startCropSelection() {
        cropMode = true;
        waitingForRange = true;
        activeRangeIndex = -1;

        dragStartY = null;
        dragCurrentY = null;
        editingEdge = null;

        cropImage.src = currentUrl;
        cropArea.style.display = "block";
        cropArea.style.touchAction = "none";

        preview.style.display = "none";

        status.textContent =
            "残したい範囲を上下にドラッグしてください。ヘッダーは自動で残ります。";

        drawSelections();
        updateButtons();
    }

    cropButton.onclick = () => {
        cropRanges = [];
        startCropSelection();
    };

    addRangeButton.onclick = () => {
        startCropSelection();
    };

    // 範囲選択・上下端のドラッグ開始
    cropArea.addEventListener("pointerdown", event => {
        if (!cropMode) return;

        const handle = event.target instanceof Element
            ? event.target.closest("[data-crop-edge]")
            : null;

        if (handle) {
            event.preventDefault();
            event.stopPropagation();
        } else if (waitingForRange) {
            event.preventDefault();
        }

        if (typeof cropArea.setPointerCapture === "function") {
            try {
                cropArea.setPointerCapture(event.pointerId);
            } catch (error) {
                // キャプチャできない場合も通常の操作を続ける
            }
        }

        // 新しい範囲を指定中
        if (waitingForRange) {
            const y = getRelativeY(event);

            dragStartY = Math.max(getHeaderRatio(), y);
            dragCurrentY = dragStartY;
            pointerMoved = false;

            drawSelections();
            return;
        }

        // 上下端のハンドルを直接つかんだ場合
        if (handle) {
            const index = Number(handle.dataset.rangeIndex);
            const edge = handle.dataset.cropEdge;

            if (
                !Number.isInteger(index) ||
                !cropRanges[index] ||
                !["start", "end"].includes(edge)
            ) {
                return;
            }

            activeRangeIndex = index;
            editingEdge = edge;

            const range = cropRanges[index];

            dragStartY = edge === "start"
                ? range.start
                : range.end;

            dragCurrentY = dragStartY;
            pointerMoved = false;

            status.textContent =
                "上下端をドラッグして範囲を調整できます。";

            drawSelections();
            updateButtons();
            return;
        }

        // 選択済み範囲の中をタップした場合
        const y = getRelativeY(event);

        const index = cropRanges.findIndex(
            range => y >= range.start && y <= range.end
        );

        if (index === -1) {
            activeRangeIndex = -1;
            editingEdge = null;
            dragStartY = null;
            dragCurrentY = null;

            drawSelections();
            updateButtons();
            return;
        }

        activeRangeIndex = index;

        const range = cropRanges[index];
        const edgeTolerance = 0.025;

        if (Math.abs(y - range.start) <= edgeTolerance) {
            editingEdge = "start";
            dragStartY = range.start;
            dragCurrentY = range.start;
            pointerMoved = false;
        } else if (Math.abs(y - range.end) <= edgeTolerance) {
            editingEdge = "end";
            dragStartY = range.end;
            dragCurrentY = range.end;
            pointerMoved = false;
        } else {
            editingEdge = null;
            dragStartY = null;
            dragCurrentY = null;
        }

        status.textContent = editingEdge
            ? "上下端をドラッグして範囲を調整できます。"
            : "上下端のバーをドラッグすると範囲を調整できます。";

        drawSelections();
        updateButtons();
    });

    // ドラッグ中
    cropArea.addEventListener("pointermove", event => {
        if (!cropMode) return;

        if (!waitingForRange && !editingEdge) {
            return;
        }

        event.preventDefault();

        const y = getRelativeY(event);

        // 新しい範囲を指定中
        if (waitingForRange && dragStartY !== null) {
            dragCurrentY = Math.max(getHeaderRatio(), y);
            pointerMoved = true;

            drawSelections();
            return;
        }

        // 既存範囲の上下端を調整中
        if (
            activeRangeIndex !== -1 &&
            editingEdge &&
            dragStartY !== null
        ) {
            const range = cropRanges[activeRangeIndex];

            if (!range) return;

            const minY = getHeaderRatio();

            dragCurrentY = Math.max(minY, y);
            pointerMoved = true;

            if (editingEdge === "start") {
                range.start = Math.max(
                    minY,
                    Math.min(
                        dragCurrentY,
                        range.end - 0.01
                    )
                );
            } else {
                range.end = Math.min(
                    1,
                    Math.max(
                        dragCurrentY,
                        range.start + 0.01
                    )
                );
            }

            drawSelections();
        }
    });

    // ドラッグ終了
    function finishPointer() {
        if (!cropMode) return;

        // 新しい範囲の指定を完了
        if (waitingForRange && dragStartY !== null) {
            const currentY = dragCurrentY ?? dragStartY;

            const start = Math.max(
                getHeaderRatio(),
                Math.min(dragStartY, currentY)
            );

            const end = Math.max(dragStartY, currentY);

            if (end - start > 0.01) {
                const newRange = { start, end };

                cropRanges.push(newRange);

                cropRanges.sort((a, b) => a.start - b.start);

                // 追加した範囲を選択状態にする
                activeRangeIndex = cropRanges.indexOf(newRange);

                status.textContent =
                    "範囲を指定しました。選択範囲を削除する場合は、削除したい範囲をタップしてください。";
            } else {
                activeRangeIndex = -1;

                status.textContent =
                    "範囲が短すぎます。もう一度指定してください。";
            }

            waitingForRange = false;
            dragStartY = null;
            dragCurrentY = null;

            cropArea.style.touchAction = "pan-y";

            drawSelections();
            updateButtons();
            return;
        }

        // 既存範囲の調整を完了
        if (editingEdge) {
            editingEdge = null;
            dragStartY = null;
            dragCurrentY = null;

            status.textContent = "範囲を調整しました。";

            drawSelections();
            updateButtons();
        }
    }

    cropArea.addEventListener("pointerup", finishPointer);

    cropArea.addEventListener("pointercancel", () => {
        dragStartY = null;
        dragCurrentY = null;
        editingEdge = null;

        if (waitingForRange) {
            waitingForRange = false;
            cropArea.style.touchAction = "pan-y";
        }

        drawSelections();
        updateButtons();
    });


    // 横の点線で画像の省略・接続位置を示す
    function drawWaveSeparator(ctx, width, y) {
        ctx.save();

        ctx.strokeStyle = "#444";
        ctx.lineWidth = Math.max(3.5, width / 550);
        ctx.setLineDash([
            Math.max(3, width / 100),
            Math.max(3, width / 100)
        ]);

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        ctx.restore();
    }

    // トリミング結果の生成
    previewCropButton.onclick = async () => {
        if (!cropRanges.length || waitingForRange) return;

        try {
            const image = new Image();
            image.src = currentUrl;

            await image.decode();

            const naturalWidth = image.naturalWidth;
            const naturalHeight = image.naturalHeight;

            const fixedHeaderHeight = Math.max(
                0,
                Math.min(naturalHeight, sourceHeaderHeight)
            );

            const ranges = cropRanges
                .map(range => ({
                    start: Math.max(
                        fixedHeaderHeight,
                        Math.min(
                            naturalHeight,
                            Math.round(range.start * naturalHeight)
                        )
                    ),
                    end: Math.max(
                        0,
                        Math.min(
                            naturalHeight,
                            Math.round(range.end * naturalHeight)
                        )
                    )
                }))
                .filter(range => range.end > range.start)
                .sort((a, b) => a.start - b.start);

            if (!ranges.length) {
                alert("残す範囲を指定してください。");
                return;
            }

            const selectedHeight = ranges.reduce(
                (sum, range) => sum + range.end - range.start,
                0
            );

            const output = document.createElement("canvas");
            output.width = naturalWidth;
            output.height = fixedHeaderHeight + selectedHeight;

            const ctx = output.getContext("2d");

            if (!ctx) {
                throw new Error("Canvasを利用できません。");
            }

            // 自動で残すヘッダーを最初に配置
            if (fixedHeaderHeight > 0) {
                ctx.drawImage(
                    image,
                    0,
                    0,
                    naturalWidth,
                    fixedHeaderHeight,
                    0,
                    0,
                    naturalWidth,
                    fixedHeaderHeight
                );
            }

            let destinationY = fixedHeaderHeight;

            if (fixedHeaderHeight > 0) {
                drawWaveSeparator(ctx, naturalWidth, destinationY);
            }

            ranges.forEach((range, index) => {
                const height = range.end - range.start;

                ctx.drawImage(
                    image,
                    0,
                    range.start,
                    naturalWidth,
                    height,
                    0,
                    destinationY,
                    naturalWidth,
                    height
                );

                destinationY += height;

                if (index < ranges.length - 1) {
                    drawWaveSeparator(ctx, naturalWidth, destinationY);
                }
            });

            const resultBlob = await new Promise(resolve => {
                output.toBlob(resolve, "image/png");
            });

            if (!resultBlob) {
                throw new Error("PNG画像を作成できませんでした。");
            }

            if (resultUrl) {
                URL.revokeObjectURL(resultUrl);
            }

            currentBlob = resultBlob;
            resultUrl = URL.createObjectURL(resultBlob);
            currentUrl = resultUrl;

            modal.dataset.resultUrl = resultUrl;

            preview.src = resultUrl;
            preview.style.display = "block";

            cropArea.style.display = "none";
            cropMode = false;
            waitingForRange = false;
            activeRangeIndex = -1;

            dragStartY = null;
            dragCurrentY = null;
            editingEdge = null;

            status.textContent = "トリミング結果を確認してください。";

            updateButtons();

        } catch (error) {
            console.error("トリミングエラー:", error);
            alert("トリミングに失敗しました。");
        }
    };

    // 選択中の範囲だけを削除
    removeRangeButton.onclick = () => {
        if (
            activeRangeIndex < 0 ||
            !cropRanges[activeRangeIndex]
        ) {
            return;
        }

        cropRanges.splice(activeRangeIndex, 1);

        activeRangeIndex = -1;
        editingEdge = null;
        dragStartY = null;
        dragCurrentY = null;

        drawSelections();
        updateButtons();

        status.textContent = cropRanges.length
            ? "選択範囲を削除しました。削除したい範囲をタップして選択できます。"
            : "範囲をすべて削除しました。";
    };

    // 元画像に戻して、そのまま再トリミング
    undoButton.onclick = () => {
        currentBlob = blob;
        currentUrl = originalUrl;

        if (resultUrl) {
            URL.revokeObjectURL(resultUrl);
            resultUrl = null;
            delete modal.dataset.resultUrl;
        }

        preview.src = originalUrl;

        cropRanges = [];
        cropMode = false;
        waitingForRange = false;
        activeRangeIndex = -1;

        dragStartY = null;
        dragCurrentY = null;
        editingEdge = null;

        sourceImageHeight = 0;
        sourceHeaderHeight = headerHeight;

        cropArea.style.display = "none";
        cropArea.style.touchAction = "pan-y";

        startCropSelection();
    };


    // 画像を保存
    saveButton.onclick = async () => {
        const fileName =
            "1日手帳_" +
            (
                typeof selectedCalendarDate !== "undefined"
                    ? selectedCalendarDate
                    : "予定"
            ) +
            ".png";

        // 保存先を選択できるブラウザでは、
        // 実際の書き込み完了後に保存成功を表示する
        if (typeof window.showSaveFilePicker === "function") {
            try {
                status.textContent = "画像を保存しています…";

                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [
                        {
                            description: "PNG画像",
                            accept: {
                                "image/png": [".png"]
                            }
                        }
                    ]
                });

                const writable = await fileHandle.createWritable();

                await writable.write(currentBlob);
                
                
                
await writable.close();

showSaveSuccess();
            
            
            } catch (error) {
                if (error.name === "AbortError") {
                    status.textContent = "保存をキャンセルしました。";
                    return;
                }

                console.error("画像保存エラー:", error);

                status.textContent =
                    "保存できませんでした。もう一度お試しください。";
            }

            return;
        }

        // 非対応ブラウザでは従来のダウンロード方式を維持
        const link = document.createElement("a");

        link.href = currentUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        link.remove();

        status.textContent =
            "ダウンロードを開始しました。完了はブラウザのダウンロード一覧で確認してください。";
    };





    // 画像を共有
    shareButton.onclick = async () => {
        try {
            const file = new File(
                [currentBlob],
                "1日手帳.png",
                { type: "image/png" }
            );

            if (
                navigator.share &&
                navigator.canShare &&
                navigator.canShare({ files: [file] })
            ) {
                await navigator.share({
                    files: [file],
                    title: "1日手帳の予定"
                });
            } else {
                alert(
                    "このブラウザでは画像の直接共有に対応していません。" +
                    "先に「保存」を押してから共有してください。"
                );
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("画像共有エラー:", error);
                alert(
                    "共有できませんでした。画像を保存してお試しください。"
                );
            }
        }
    };

    // 閉じる
    closeButton.onclick = () => {
        if (resultUrl) URL.revokeObjectURL(resultUrl);

        URL.revokeObjectURL(originalUrl);
        modal.remove();
    };

    content.append(
        heading,
        toolbar,
        status,
        preview,
        cropArea
    );

    modal.appendChild(content);
    document.body.appendChild(modal);

    // 画像の実際の高さを取得してから範囲選択に使う
    cropImage.onload = () => {
        sourceImageHeight = cropImage.naturalHeight;
        drawSelections();
    };

    updateButtons();
}






function addVideo(){

    alert("動画追加（次で実装します）");

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



let showAllDayPhotos = false;

function renderDayMemory(){

    renderDayMemos();

    renderDayPhotos();
    
    renderDayMovies();

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

    }



    /* =====================
   推し詳細ページを復元
===================== */

if(
    previousPageBeforeSettings === "oshiPage"
){

    const oshiContainer =
        document.getElementById(
            "oshiContainer"
        );

    const oshiDetailPage =
        document.getElementById(
            "oshiDetailPage"
        );

    if(
        oshiContainer &&
        oshiContainer.dataset.oshiId &&
        oshiDetailPage
    ){

        oshiDetailPage.classList.add(
            "active"
        );

    }

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



// =====================
// 🔁 繰り返し設定の表示切り替え
// =====================

function toggleRepeatOptions() {

    const repeat =
        document.getElementById("event-repeat")?.value || "none";

    const options =
        document.getElementById("repeatOptions");

    const intervalRow =
        document.getElementById("repeatIntervalRow");

    const monthlyRow =
        document.getElementById("repeatMonthlyRow");

    if (!options) return;

    const enabled = repeat !== "none";

    options.style.display =
        enabled ? "block" : "none";

    if (intervalRow) {
        intervalRow.style.display =
            repeat === "interval" ? "flex" : "none";
    }

    if (monthlyRow) {
        monthlyRow.style.display =
            repeat === "monthly" ? "flex" : "none";
    }

    toggleMonthlyOptions();
    toggleRepeatEndOptions();
}


// =====================
// 🔁 毎月の曜日指定
// =====================

function toggleMonthlyOptions() {

    const monthly =
        document.getElementById("event-repeat-monthly")?.value || "date";

    const weekdayOptions =
        document.getElementById("repeatWeekdayOptions");

    if (!weekdayOptions) return;

    weekdayOptions.style.display =
        monthly === "weekday" || monthly === "lastWeekday"
            ? "block"
            : "none";

    const weekSelect =
        document.getElementById("event-repeat-week");

    if (weekSelect) {
        weekSelect.disabled = monthly === "lastWeekday";
    }
}


// =====================
// 🔁 繰り返し終了条件
// =====================

function toggleRepeatEndOptions() {

    const endType =
        document.getElementById("event-repeat-end")?.value || "never";

    const untilRow =
        document.getElementById("repeatUntilRow");

    const countRow =
        document.getElementById("repeatCountRow");

    if (untilRow) {
        untilRow.style.display =
            endType === "until" ? "flex" : "none";
    }

    if (countRow) {
        countRow.style.display =
            endType === "count" ? "flex" : "none";
    }
}


/* ========================================
   🔁 繰り返し予定の共通処理
   ・予定データは複製しない
   ・指定期間内の発生日を計算する
   ・既存のDBデータは変更しない
======================================== */

function getRecurringEventOccurrences(event, rangeStart, rangeEnd) {

    if (!event || !event.start || !rangeStart || !rangeEnd) {
        return [];
    }

    const originalStart = new Date(event.start);
    const startLimit = new Date(rangeStart);
    const endLimit = new Date(rangeEnd);

    if (
        Number.isNaN(originalStart.getTime()) ||
        Number.isNaN(startLimit.getTime()) ||
        Number.isNaN(endLimit.getTime()) ||
        endLimit <= startLimit
    ) {
        return [];
    }

    const repeat = event.repeat || "none";

    // 繰り返さない予定
    if (repeat === "none") {
        const eventEnd = event.end
            ? new Date(event.end)
            : new Date(originalStart.getTime() + 30 * 60000);

        const safeEnd =
            !Number.isNaN(eventEnd.getTime()) && eventEnd > originalStart
                ? eventEnd
                : new Date(originalStart.getTime() + 30 * 60000);

        return originalStart < endLimit && safeEnd > startLimit
            ? [{ event, start: originalStart, end: safeEnd, occurrenceDate: event.start.slice(0, 10) }]
            : [];
    }

    const results = [];
    const originalDate = new Date(
        originalStart.getFullYear(),
        originalStart.getMonth(),
        originalStart.getDate()
    );

    const originalDay = originalDate.getDate();
    const originalMonth = originalDate.getMonth();
    const originalYear = originalDate.getFullYear();

    const interval = Math.max(1, Number(event.repeatInterval) || 1);
    const unit = event.repeatUnit || "day";
    const repeatEnd = event.repeatEnd || "never";
    const repeatUntil = event.repeatUntil
        ? new Date(event.repeatUntil + "T23:59:59")
        : null;
    const repeatCount = Math.max(1, Number(event.repeatCount) || 10);

    function makeDate(year, month, day) {
        const date = new Date(year, month, day);

        // 月末に存在しない日付を翌月へ繰り越さない
        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }

    function getMonthlyWeekday(year, month) {
        const weekday = Number(event.repeatWeekday ?? originalDate.getDay());
        const week = Number(event.repeatWeek || 1);

        if (event.repeatMonthly === "lastWeekday") {
            const lastDay = new Date(year, month + 1, 0);
            const offset = (lastDay.getDay() - weekday + 7) % 7;
            return new Date(year, month, lastDay.getDate() - offset);
        }

        if (event.repeatMonthly === "weekday") {
            const firstDay = new Date(year, month, 1);
            const firstOffset = (weekday - firstDay.getDay() + 7) % 7;

            if (week === -1) {
                const lastDay = new Date(year, month + 1, 0);
                const lastOffset = (lastDay.getDay() - weekday + 7) % 7;
                return new Date(year, month, lastDay.getDate() - lastOffset);
            }

            return makeDate(
                year,
                month,
                1 + firstOffset + (Math.max(1, week) - 1) * 7
            );
        }

        return makeDate(year, month, originalDay);
    }

    function getOccurrenceDate(index) {
        if (index === 0) {
            return originalDate;
        }

        if (repeat === "daily") {
            const date = new Date(originalDate);
            date.setDate(date.getDate() + index);
            return date;
        }

        if (repeat === "weekly") {
            const date = new Date(originalDate);
            date.setDate(date.getDate() + index * 7);
            return date;
        }

        if (repeat === "monthly") {
            const monthOffset = index;
            const monthDate = new Date(
                originalYear,
                originalMonth + monthOffset,
                1
            );

            return getMonthlyWeekday(
                monthDate.getFullYear(),
                monthDate.getMonth()
            );
        }

        if (repeat === "yearly") {
            return makeDate(
                originalYear + index,
                originalMonth,
                originalDay
            );
        }

        if (repeat === "interval") {
            const date = new Date(originalDate);
            const amount = index * interval;

            if (unit === "day") {
                date.setDate(date.getDate() + amount);
                return date;
            }

            if (unit === "week") {
                date.setDate(date.getDate() + amount * 7);
                return date;
            }

            if (unit === "month") {
                const monthDate = new Date(
                    originalYear,
                    originalMonth + amount,
                    1
                );
                return makeDate(
                    monthDate.getFullYear(),
                    monthDate.getMonth(),
                    originalDay
                );
            }

            if (unit === "year") {
                return makeDate(
                    originalYear + amount,
                    originalMonth,
                    originalDay
                );
            }
        }

        return null;
    }

    // 時刻・期間は元の予定を維持し、発生日だけを移動する
    const duration = event.end
        ? new Date(event.end).getTime() - originalStart.getTime()
        : 30 * 60000;

    if (!Number.isFinite(duration) || duration <= 0) {
        return [];
    }

    // 無期限の繰り返しでも計算量を抑える
    const MAX_OCCURRENCES = 5000;

    for (let index = 0; index < MAX_OCCURRENCES; index++) {

        const occurrenceDate = getOccurrenceDate(index);

        // 存在しない日付（例：2月30日）はその月・年の発生を飛ばす
        if (!occurrenceDate) {
            if (repeatEnd === "count" && index + 1 >= repeatCount) {
                break;
            }
            continue;
        }

        if (repeatEnd === "count" && index >= repeatCount) {
            break;
        }

        if (repeatEnd === "until" && repeatUntil && occurrenceDate > repeatUntil) {
            break;
        }

        // 発生日が検索期間の終わりを超えたら終了
        if (occurrenceDate >= endLimit) {
            break;
        }

        const occurrenceStart = new Date(occurrenceDate);
        occurrenceStart.setHours(
            originalStart.getHours(),
            originalStart.getMinutes(),
            originalStart.getSeconds(),
            originalStart.getMilliseconds()
        );

        const occurrenceEnd = new Date(
            occurrenceStart.getTime() + duration
        );

        // この日だけ削除された繰り返し予定は表示しない
        const occurrenceDateText =
            occurrenceStart.getFullYear() + "-" +
            String(occurrenceStart.getMonth() + 1).padStart(2, "0") + "-" +
            String(occurrenceStart.getDate()).padStart(2, "0");

        const excludedOccurrences =
            Array.isArray(event.excludedOccurrences)
                ? event.excludedOccurrences
                : [];

        if (excludedOccurrences.includes(occurrenceDateText)) {
            continue;
        }

        if (
            occurrenceStart < endLimit &&
            occurrenceEnd > startLimit
        ) {

            results.push({
                event,
                start: occurrenceStart,
                end: occurrenceEnd,
                occurrenceDate: occurrenceDateText            
            
                });
        }
    }

    return results;
}
