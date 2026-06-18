const DB_KEY = 'oshi_app_data';

let oshiMaster = {
artists: [],
sports: []
};

let selectedOshiId = null;

/* =====================
DB
===================== */

const db = {

load() {

    const data =
        localStorage.getItem(DB_KEY);

    return data
        ? JSON.parse(data)
        : {
            settings:{
                plan:'free'
            },
            oshiList:[],
            events:[]
        };
},

save(data){

    localStorage.setItem(
        DB_KEY,
        JSON.stringify(data)
    );
},

addOshi(masterId){

    const data = this.load();

    if(
        data.settings.plan === 'free' &&
        data.oshiList.length >= 3
    ){
        alert('無料版は3件までです');
        return false;
    }

    const exists =
        data.oshiList.some(
            o => o.masterId === masterId
        );

    if(exists){
        alert('既に登録されています');
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

    const data = this.load();

    data.oshiList =
        data.oshiList.filter(
            o => o.id !== id
        );

    this.save(data);
},

addEvent(eventData){

    const data = this.load();

    if(
        data.settings.plan === 'free' &&
        data.events.length >= 5
    ){
        alert('無料版は予定5件までです');
        return false;
    }

    data.events.push(eventData);

    this.save(data);

    return true;
},

deleteEvent(id){

    const data = this.load();

    data.events =
        data.events.filter(
            e => e.id !== id
        );

    this.save(data);
}

};

/* =====================
推しマスタ読込
===================== */

async function loadMaster(){

try{

    const response =
        await fetch('./oshi-master.json');

    oshiMaster =
        await response.json();

}catch(error){

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
    .forEach(page =>
        page.classList.remove('active')
    );

document
    .getElementById(pageId)
    .classList.add('active');

document
    .querySelectorAll('.tab')
    .forEach(tab =>
        tab.classList.remove('active')
    );

event.currentTarget
    .classList.add('active');

}

/* =====================
推し候補表示
===================== */

function showCandidates(){

const category =
    document.getElementById(
        'category-select'
    ).value;

const list =
    oshiMaster[category] || [];

const results =
    document.getElementById(
        'search-results'
    );

results.innerHTML =
    list.map(oshi => `

<div
class="master-item"
onclick="selectOshi(${oshi.id}, '${oshi.name.replace(/'/g,"\\'")}')">${oshi.name}

</div>`).join('');
}

/* =====================
推し検索
===================== */

function searchOshi(){

const category =
    document.getElementById(
        'category-select'
    ).value;

const keyword =
    document.getElementById(
        'oshi-search'
    )
    .value
    .trim()
    .toLowerCase();

const list =
    oshiMaster[category] || [];

const matched =
    keyword === ''
    ? list
    : list.filter(
        o =>
            o.name
            .toLowerCase()
            .includes(keyword)
    );

document
    .getElementById(
        'search-results'
    )
    .innerHTML =
        matched.map(oshi => `

<div
class="master-item"
onclick="selectOshi(${oshi.id}, '${oshi.name.replace(/'/g,"\\'")}')">${oshi.name}

</div>`).join('');
}

/* =====================
推し選択
===================== */

function selectOshi(id,name){

selectedOshiId = id;

document
    .getElementById(
        'oshi-search'
    )
    .value = name;

}

/* =====================
推し追加
===================== */

function addSelectedOshi(){

if(!selectedOshiId){

    alert('推しを選択してください');
    return;
}

const success =
    db.addOshi(selectedOshiId);

if(!success) return;

selectedOshiId = null;

document
    .getElementById(
        'oshi-search'
    )
    .value = '';

document
    .getElementById(
        'search-results'
    )
    .innerHTML = '';

displayOshiList();

}
/* =====================
マスタ検索
===================== */

function findMasterById(id){

const all = [

    ...oshiMaster.artists,
    ...oshiMaster.sports

];

return all.find(
    o => o.id === id
);

}

/* =====================
推し削除
===================== */

function deleteOshi(id,name){

const ok =
    confirm(
        `「${name}」を削除しますか？`
    );

if(!ok) return;

db.deleteOshi(id);

displayOshiList();

}

/* =====================
推し一覧
===================== */

function displayOshiList(){

const data = db.load();

const html =
    data.oshiList.map(item => {

        const oshi =
            findMasterById(
                item.masterId
            );

        if(!oshi) return '';

        return `

<div class="item oshi-item"><div class="oshi-info">

    <div class="oshi-name">
        ${oshi.name}
    </div>

    ${
        oshi.website
        ? `<div class="oshi-link">🌐 HP</div>`
        : ''
    }

    ${
        oshi.instagram
        ? `<div class="oshi-link">📷 Instagram</div>`
        : ''
    }

    ${
        oshi.x
        ? `<div class="oshi-link">𝕏 X</div>`
        : ''
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

</div>`;

    }).join('');

document
    .getElementById(
        'oshi-list'
    )
    .innerHTML =
        html || '該当なし';

}

/* =====================
イベント追加
===================== */

function addEvent(){

const category =
    document.getElementById(
        'event-category'
    ).value;

const title =
    document.getElementById(
        'event-title'
    ).value.trim();

const date =
    document.getElementById(
        'event-date'
    ).value;

const place =
    document.getElementById(
        'event-place'
    ).value.trim();

const meetingTime =
    document.getElementById(
        'meeting-time'
    ).value.trim();

const companions =
    document.getElementById(
        'companions'
    ).value.trim();

const mapUrl =
    document.getElementById(
        'map-url'
    ).value.trim();

const ticketUrl =
    document.getElementById(
        'ticket-url'
    ).value.trim();

if(!title || !date){

    alert(
        'イベント名と日時は必須です'
    );

    return;
}

const success =
    db.addEvent({

        id: Date.now(),

        category,
        title,
        date,
        place,
        meetingTime,
        companions,
        mapUrl,
        ticketUrl

    });

if(!success) return;

displayEventList();
displayEvents();

document.getElementById('event-title').value='';
document.getElementById('event-date').value='';
document.getElementById('event-place').value='';
document.getElementById('meeting-time').value='';
document.getElementById('companions').value='';
document.getElementById('map-url').value='';
document.getElementById('ticket-url').value='';

}

/* =====================
イベント削除
===================== */

function deleteEvent(id){

if(!confirm('削除しますか？'))
    return;

db.deleteEvent(id);

displayEventList();
displayEvents();

}

/* =====================
イベント一覧
===================== */

function displayEventList(){

const data = db.load();

const html =
    data.events
    .sort(
        (a,b)=>
            new Date(a.date)
            -
            new Date(b.date)
    )
    .map(event => `

<div class="event-item"><div class="event-title">
${event.category}
 ${event.title}
</div><div class="event-meta">
📅 ${event.date}
</div><div class="event-meta">
📍 ${event.place || '-'}
</div><div class="event-meta">
🤝 ${event.companions || '-'}
</div><div class="event-actions"><button
onclick="deleteEvent(${event.id})">

削除

</button></div></div>`).join('');

document
    .getElementById(
        'event-list'
    )
    .innerHTML =
        html || '該当なし';

}

/* =====================
ホーム表示
===================== */

function displayEvents(){

const data = db.load();

const today = new Date();

const weekLater =
    new Date();

weekLater.setDate(
    today.getDate() + 7
);

const nextWeekLater =
    new Date();

nextWeekLater.setDate(
    today.getDate() + 14
);

const todayEvents = [];
const thisWeekEvents = [];
const nextWeekEvents = [];

data.events.forEach(event => {

    const d =
        new Date(event.date);

    const diff =
        (d - today)
        /
        86400000;

    if(
        d.toDateString()
        ===
        today.toDateString()
    ){
        todayEvents.push(event);
    }

    if(
        diff >= 0 &&
        diff <= 7
    ){
        thisWeekEvents.push(event);
    }

    if(
        diff > 7 &&
        diff <= 14
    ){
        nextWeekEvents.push(event);
    }
});

document
    .getElementById(
        'today-schedule'
    )
    .innerHTML =
        todayEvents.length
        ? todayEvents.map(
            e => `${e.title}`
          ).join('<br>')
        : '該当なし';

document
    .getElementById(
        'this-week-schedule'
    )
    .innerHTML =
        thisWeekEvents.length
        ? thisWeekEvents.map(
            e => `${e.title}`
          ).join('<br>')
        : '該当なし';

document
    .getElementById(
        'next-week-schedule'
    )
    .innerHTML =
        nextWeekEvents.length
        ? nextWeekEvents.map(
            e => `${e.title}`
          ).join('<br>')
        : '該当なし';

document
    .getElementById(
        'today-events'
    )
    .innerHTML =
        todayEvents.length
        ? `本日 ${todayEvents.length}件`
        : '該当なし';

}

/* =====================
起動
===================== */

window.onload = async function(){

await loadMaster();

displayOshiList();

displayEventList();

displayEvents();

document
    .getElementById(
        'oshi-search'
    )
    .addEventListener(
        'focus',
        showCandidates
    );

document
    .getElementById(
        'oshi-search'
    )
    .addEventListener(
        'input',
        searchOshi
    );

document
    .getElementById(
        'category-select'
    )
    .addEventListener(
        'change',
        () => {

            selectedOshiId = null;

            document
                .getElementById(
                    'oshi-search'
                )
                .value = '';

            showCandidates();
        }
    );

};