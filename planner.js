/* =====================
   1日手帳ビュー
===================== */

function showPlanner(date){

    const planner =
        document.getElementById("dayPlanner");

    const title =
        document.getElementById("plannerTitle");

    const timeline =
        document.getElementById("plannerTimeline");

    if(!planner || !title || !timeline)
        return;


    planner.style.display = "block";


    const d = new Date(date);

    const week = [
        "日","月","火","水","木","金","土"
    ];

    title.textContent =
        `📅 ${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日(${week[d.getDay()]})`;


    const events =
        db.load().events
        .filter(e=>e.date.startsWith(date))
        .sort((a,b)=>
            (a.meeting || "").localeCompare(b.meeting || "")
        );


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


        events.forEach(e=>{

            if(!e.meeting) return;

            if(e.meeting.substring(0,2)===hh){

                html += `
                <div class="planner-event">

                    ${getCategoryInfo(e.category)?.icon || "📌"}
                    <strong>${e.title}</strong>

                    ${e.place
                        ? `<br>${e.place}`
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