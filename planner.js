/* =====================
   1日手帳ビュー
===================== */
/* =====================
   1日手帳ビュー v2
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
        db.load().events

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



    let html = "";



    for(
        let hour=0;
        hour<24;
        hour++
    ){

        for(
            let minute=0;
            minute<60;
            minute+=30
        ){


            const time =
                `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;



            html += `

<div class="planner-row">


<div class="planner-time">

${time}

</div>


<div class="planner-content">

`;



            // 現在時刻表示

            if(
                date===todayString &&
                currentMinutes >= hour*60+minute &&
                currentMinutes < hour*60+minute+30
            ){

                html += `

<div class="planner-now">
● 現在時刻
</div>

`;

            }

// 予定表示

events.forEach(e=>{


    if(!e.start)
        return;



    const start =
        new Date(e.start);


    const end =
        new Date(e.end || e.start);



    const startMinutes =
        start.getHours()*60 +
        start.getMinutes();



    const rowMinutes =
        hour*60 + minute;



    if(
        startMinutes >= rowMinutes &&
        startMinutes < rowMinutes + 30
    ){


        const finished =
            end < now;



        const duration =
            Math.max(
                30,
                (end - start) / 60000
            );

        const height =
        Math.max(30, duration);


        const category =
            getCategoryInfo(
                e.category
            );



        html += `


<div
class="planner-event ${finished ? "finished-event" : ""}"
style="
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

    }


});



html += `

</div>

</div>

`;


        }

    }



    timeline.innerHTML =
        html;



    // 今日なら現在時刻付近へ移動

    if(date===todayString){

        setTimeout(()=>{

            const nowLine =
                document.querySelector(
                    ".planner-now"
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