const DB_KEY = 'oshi_app_data';

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


    /* =====================
       推し追加
    ===================== */

    addOshi(masterId){

        const data=this.load();


        if(
            data.settings.plan==='free'
            &&
            data.oshiList.length>=3
        ){

            alert(
                '無料版は3件までです'
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

        const data=this.load();


        if(
            data.settings.plan==='free'
            &&
            data.events.length>=5
        ){

            alert(
                '無料版は予定5件までです'
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

    alert("カレンダー実行");

    const area =
        document.getElementById(
            'calendar-box'
        );


    if(!area) return;


    const year =
        currentCalendarDate
        .getFullYear();


    const month =
        currentCalendarDate
        .getMonth();



    const first =
        new Date(
            year,
            month,
            1
        );


    const last =
        new Date(
            year,
            month+1,
            0
        );



    const today =
        new Date();



    let html=`


<div class="calendar-header">

<button onclick="changeMonth(-1)">
◀
</button>


<div class="calendar-title">

${year}年 ${month+1}月

</div>


<button onclick="changeMonth(1)">
▶
</button>


</div>


<div class="calendar-grid">


<div class="calendar-week">
日
</div>

<div class="calendar-week">
月
</div>

<div class="calendar-week">
火
</div>

<div class="calendar-week">
水
</div>

<div class="calendar-week">
木
</div>

<div class="calendar-week">
金
</div>

<div class="calendar-week">
土
</div>

`;



    for(
        let i=0;
        i<first.getDay();
        i++
    ){

        html+=`
        <div></div>
        `;

    }



    const events =
        db.load().events;



    for(
        let d=1;
        d<=last.getDate();
        d++
    ){


        const date =
            `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;



        const has =
            events.some(
                e=>
                e.date.startsWith(date)
            );



        const isToday =
            today.getFullYear()===year
            &&
            today.getMonth()===month
            &&
            today.getDate()===d;



        html+=`

<div
class="calendar-day
${isToday?'today':''}
${has?'has-event':''}"
onclick="selectCalendarDate('${date}')">

${d}

</div>

`;

    }



    html+=`

</div>


<div class="selected-date">

選択日：
${selectedCalendarDate || '未選択'}

</div>

`;



    area.innerHTML=html;


}






function changeMonth(value){

    currentCalendarDate
    .setMonth(
        currentCalendarDate.getMonth()
        +
        value
    );


    renderCalendar();

}




function selectCalendarDate(date){

    selectedCalendarDate=date;


    document
    .getElementById(
        'event-date'
    )
    .value =
        date+"T12:00";


    renderCalendar();

}







/* =====================
   予定追加
===================== */


function addEvent(){


    if(!selectedCalendarDate){

        alert(
            'カレンダーから日付を選択してください'
        );

        return;

    }



    const data={


        category:
        document
        .getElementById(
            'event-category'
        )
        .value,


        title:
        document
        .getElementById(
            'event-title'
        )
        .value,


        date:
        document
        .getElementById(
            'event-date'
        )
        .value,


        place:
        document
        .getElementById(
            'event-place'
        )
        .value,


        meeting:
        document
        .getElementById(
            'meeting-time'
        )
        .value,


        companion:
        document
        .getElementById(
            'companions'
        )
        .value,


        map:
        document
        .getElementById(
            'map-url'
        )
        .value,


        ticket:
        document
        .getElementById(
            'ticket-url'
        )
        .value

    };



    if(!data.title){

        alert(
            'イベント名を入力してください'
        );

        return;

    }



    if(
        db.addEvent(data)
    ){

        alert(
            '予定を追加しました'
        );


        displayEventList();

        renderCalendar();

        displayHomeSchedule();

    }

}





/* =====================
   登録済み予定表示
===================== */


function displayEventList(){

    const box =
        document.getElementById(
            'event-list'
        );


    if(!box) return;



    const events =
        db.load().events;



    box.innerHTML =


    events.length

    ?

    events.map(e=>`

<div class="event-card">

<div class="event-card-title">
${e.category}
${e.title}
</div>


<div>
📅 ${e.date}
</div>


<div>
📍 ${e.place}
</div>


<div>
👥 ${e.companion}
</div>


<div class="event-button-area">


<button
onclick="deleteEvent(${e.id})">
削除
</button>


${
e.map
?
`
<button
class="map-btn"
onclick="location.href='${e.map}'">
地図
</button>
`
:''
}


</div>


</div>

`).join('')


:

'該当なし';


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



    const today =
        events.filter(
            e=>
            e.date.slice(0,10)
            ===
            now.toISOString()
            .slice(0,10)
        );



    document
    .getElementById(
        'today-schedule'
    )
    .innerHTML =
        today.length
        ?
        today.map(e=>e.title).join('<br>')
        :
        '該当なし';


}





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

console.log(
    "calendar確認",
    document.getElementById("calendar-box")
);

renderCalendar();

};

};