/* =====================
   1日手帳ビュー
===================== */
/* =====================
   1日手帳ビュー v2
===================== */
/* =====================
   1日手帳ビュー
   左時間固定 + 予定自由配置版
===================== */

function showPlanner(date){

    const planner =
        document.getElementById("dayPlanner");

    const calendar =
        document.getElementById("calendar");

    const title =
        document.getElementById("plannerTitle");

    const timeline =
        document.getElementById("plannerTimeline");


    if(
        !planner ||
        !calendar ||
        !title ||
        !timeline
    ){
        return;
    }


    calendar.style.display = "none";

    planner.style.display = "block";


    const d =
        new Date(date);


    const week =
    [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ];


    title.textContent =
        `📅 ${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日(${week[d.getDay()]})`;



    const now =
        new Date();



    const todayString =
        `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;



    const currentMinutes =
        now.getHours()*60 +
        now.getMinutes();



    const events =
        db.load()
        .events
        .filter(
            e =>
            e.start &&
            e.start.startsWith(date)
        )
        .sort(
            (a,b)=>
            new Date(a.start)
            -
            new Date(b.start)
        );



    // 30分 = 40px
    const scale =
        40 / 30;



    let html = `

<div class="planner-layout">


<div class="planner-times">
`;



for(
    let minute=0;
    minute<1440;
    minute+=30
){

    const hour =
        Math.floor(minute / 60);

    const min =
        minute % 60;

    html += `
<div class="planner-time-fixed">
${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}
</div>
`;
}    


    html += `

</div>



<div class="planner-board">

`;

// 時間線を描画
for(let i=0; i<96; i++){

const top = 15 + (i * 20);

    if(i % 2 === 0){

        html += `
<div
class="planner-line planner-line-major"
style="top:${top}px;">
</div>
`;

    }else{

        html += `
<div
class="planner-line planner-line-minor"
style="top:${top}px;">
</div>
`;

    }

}



    // 現在時刻ライン

    if(
        date===todayString
    ){

const top =
    15 + (currentMinutes * scale);

        html += `

<div
class="planner-now-line"
style="
top:${top}px;
">

● 現在

</div>

`;

    }



    // 予定配置

    events.forEach(e=>{


        const start =
            new Date(e.start);


        const end =
            new Date(
                e.end || e.start
            );



        const startMinutes =
            start.getHours()*60 +
            start.getMinutes();



        const duration =
            Math.max(
                30,
                (end-start)/60000
            );



const top =
    15 + (startMinutes * scale);


        const height =
            duration * scale;



        const finished =
            end < now;



        const category =
            getCategoryInfo(
                e.category
            );



        html += `


<div
class="planner-event ${finished ? "finished-event" : ""}"
style="
top:${top}px;
height:${height}px;
background:${category?.color || "#fff5fb"};
">


<div class="planner-event-time">

🕒
${e.start.substring(11,16)}

${
e.end
?
" ～ " + e.end.substring(11,16)
:
""
}

</div>


<div class="planner-event-title">

${category?.icon || "📌"}

<strong>
${e.title}
</strong>

</div>


${
e.place
?
`
<div class="planner-place">

📍 ${e.place}

</div>
`
:
""
}


${
e.companion
?
`
<div class="planner-companion">

👥 ${e.companion}

</div>
`
:
""
}


</div>


`;

    });



    html += `

</div>

</div>

`;



    timeline.innerHTML =
        html;



    // 現在時刻へ移動

    if(
        date===todayString
    ){

        setTimeout(()=>{


            const nowLine =
                document.querySelector(
                    ".planner-now-line"
                );


            if(nowLine){

                nowLine.scrollIntoView({
                    behavior:"smooth",
                    block:"center"
                });

            }


        },300);

    }

}

/* =====================
   手帳イベントクリック用
===================== */

function openPlannerEvent(id){

    const event =
        db.load()
        .events
        .find(
            e=>e.id===id
        );


    if(!event)
        return;


    selectedEventId =
        event.id;


    openEventSelectModal();

}


/* =====================
   時刻表示補助
===================== */

function formatPlannerTime(value){

    if(!value)
        return "";

    const d =
        new Date(value);


    return (
        String(d.getHours())
        .padStart(2,"0")
        +
        ":" +
        String(d.getMinutes())
        .padStart(2,"0")
    );

}





/* =====================
   カレンダーへ戻る
===================== */

function backToCalendar(){

    document.getElementById("dayPlanner").style.display = "none";

    document.getElementById("calendar").style.display = "block";

}




