/* =====================
   1日手帳ビュー
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

    if(!planner || !calendar || !title || !timeline)
        return;


    // カレンダーを隠す
    calendar.style.display = "none";

    // 手帳を表示
    planner.style.display = "block";


    const d = new Date(date);

    const week = [
        "日","月","火","水","木","金","土"
    ];

    title.textContent =
        `📅 ${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日(${week[d.getDay()]})`;


    const now = new Date();

    const todayString =
        `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

    const currentMinutes =
        now.getHours()*60 + now.getMinutes();


    const events =
        db.load().events
        .filter(e=>e.date.startsWith(date))
        .sort((a,b)=>(a.meeting || "").localeCompare(b.meeting || ""));


    let html = "";


    for(let hour=0; hour<=23; hour++){

        const hh =
            String(hour).padStart(2,"0");

        html += `
        <div class="planner-row">

            <div class="planner-time">
                ${hh}:00
            </div>

            <div class="planner-content">
        `;


        // 現在時刻ライン
        if(date===todayString){

            if(currentMinutes >= hour*60 &&
               currentMinutes < (hour+1)*60){

                html += `
                <div class="planner-now">
                    ───────── 今ここ
                </div>
                `;

            }

        }


events.forEach(e=>{

    if(!e.start) return;

    const startHour =
        Number(e.start.substring(11,13));

    if(startHour===hour){

        const finished =
            new Date(e.end || e.start) < now;

        const start =
            new Date(e.start);

        const end =
            new Date(e.end || e.start);

        const durationMinutes =
            (end - start) / 60000;

        // 1分＝1px（最低60px）
        const height =
            Math.max(60, durationMinutes);

        html += `

<div
class="planner-event ${finished ? "finished-event" : ""}"
style="height:${height}px;">

    <div class="planner-event-time">
        🕒 ${e.start.substring(11,16)}
        ${e.end ? " ～ " + e.end.substring(11,16) : ""}
    </div>

    <div class="planner-event-title">
        ${getCategoryInfo(e.category)?.icon || "📌"}
        <strong>${e.title}</strong>
    </div>

    ${
        e.place
        ? `<div class="planner-place">
            📍 ${e.place}
           </div>`
        : ""
    }

    ${
        e.companion
        ? `<div class="planner-companion">
            👥 ${e.companion}
           </div>`
        : ""
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


    timeline.innerHTML = html;

}


/* =====================
   カレンダーへ戻る
===================== */

function backToCalendar(){

    document.getElementById("dayPlanner").style.display = "none";

    document.getElementById("calendar").style.display = "block";

}