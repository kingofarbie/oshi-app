
/* =====================
   1日手帳ビュー
===================== */
/* =====================
   1日手帳ビュー v2
===================== */


let currentPhotoSrc = "";
let currentPhotoIndex = 0;
let touchStartX = 0;

let favoriteViewMode = false;

let photoScale = 1;
let lastDistance = 0;


let photoTranslateX = 0;
let photoTranslateY = 0;

let dragStartX = 0;
let dragStartY = 0;

let lastTapTime = 0;

/* =====================
   1日手帳ビュー
   左時間固定 + 予定自由配置版
===================== */

function showPlanner(date){
    
    selectedCalendarDate = date;

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

        renderDayMemory();



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


function openPhotoViewer(id){

    const data = db.load();

const photos = favoriteViewMode
    ? Object.values(data.dayMemories || {})
        .flatMap(day => day.photos || [])
        .filter(photo => photo.favorite)
    : data.dayMemories?.[selectedCalendarDate]?.photos || [];

    const photo =
        photos.find(
            p => p.id === id
        );


    if(!photo){
        return;
    }


    currentPhotoId = id;

    currentPhotoSrc = photo.src;


    currentPhotoIndex =
        photos.findIndex(
            p => p.id === id
        );



    const img =
        document.getElementById(
            "photoViewerImage"
        );


    img.src = photo.src;


const deleteBtn =
    document.querySelector(".photo-delete");

const closeBtn =
    document.querySelector(".photo-close");


if(deleteBtn){

    if(favoriteViewMode){

        deleteBtn.style.display = "none";

        if(closeBtn){
            closeBtn.style.right = "72px";
        }

    }else{

        deleteBtn.style.display = "flex";

        if(closeBtn){
            closeBtn.style.right = "20px";
        }

    }

}

    img.style.transform =
        "translate(0px,0px) scale(1)";


    photoScale = 1;

    photoTranslateX = 0;

    photoTranslateY = 0;

    lastDistance = 0;



    updateFavoriteButton();



    document
    .getElementById(
        "photoViewer"
    )
    .style.display = "flex";



    document.body.style.overflow = "hidden";

}



function closePhotoViewer(){

    document.getElementById("photoViewer").style.display = "none";

    document.body.style.overflow = "";

    photoScale = 1;
    lastDistance = 0;

    photoTranslateX = 0;
    photoTranslateY = 0;

    document.getElementById("photoViewerImage").style.transform =
        "translate(0px,0px) scale(1)";
        
    favoriteViewMode = false;

}

function deleteCurrentPhoto(){

    if(!confirm("この写真を削除しますか？")){
        return;
    }

    const data = db.load();

    const day = data.dayMemories?.[selectedCalendarDate];

    if(!day) return;

    day.photos = day.photos.filter(
        p => p.src !== currentPhotoSrc
    );

    db.save(data);

    closePhotoViewer();

    renderDayMemory();

}


function toggleFavoritePhoto(){

    const data = db.load();

    const day =
        data.dayMemories?.[selectedCalendarDate];


    if(!day) return;


const photo =
    day.photos.find(
        p => p.id === currentPhotoId
    );

    if(!photo) return;


    photo.favorite =
        !photo.favorite;


    db.save(data);


    updateFavoriteButton();

}


function updateFavoriteButton(){

    const btn =
        document.querySelector(
            ".photo-favorite"
        );


    if(!btn) return;


    const data = db.load();


    let photo = null;


    Object.values(
        data.dayMemories || {}
    )
    .forEach(day=>{

        (day.photos || [])
        .forEach(p=>{

            if(p.id === currentPhotoId){

                photo = p;

            }

        });

    });


    if(photo && photo.favorite){

        btn.textContent = "⭐";

    }else{

        btn.textContent = "☆";

    }

}

function showPhoto(index){

    const data = db.load();

const photos = favoriteViewMode
    ? Object.values(data.dayMemories || {})
        .flatMap(day => day.photos || [])
        .filter(photo => photo.favorite)
    : data.dayMemories?.[selectedCalendarDate]?.photos || [];

    if(photos.length === 0){
        return;
    }


    // 最後まで行ったら最初へ
    if(index >= photos.length){

        index = 0;

    }


    // 最初より前なら最後へ
    if(index < 0){

        index = photos.length - 1;

    }


    currentPhotoIndex = index;


    // ★重要：表示中写真のIDを更新
    currentPhotoId = photos[index].id;


    currentPhotoSrc = photos[index].src;



    document
    .getElementById(
        "photoViewerImage"
    )
    .src = currentPhotoSrc;



    // ★スワイプ後の星状態更新
    updateFavoriteButton();

}


function photoDragStart(event){

    if(photoScale <= 1) return;

    if(event.touches.length !== 1) return;

    event.preventDefault();

    dragStartX = event.touches[0].clientX;
    dragStartY = event.touches[0].clientY;

}

function photoPinch(event){

    const img =
        document.getElementById("photoViewerImage");

    // ----- 2本指ピンチ -----
    if(event.touches.length === 2){

        event.preventDefault();

        const dx =
            event.touches[0].clientX -
            event.touches[1].clientX;

        const dy =
            event.touches[0].clientY -
            event.touches[1].clientY;

        const distance =
            Math.sqrt(dx*dx + dy*dy);

        if(lastDistance !== 0){

            photoScale *= distance / lastDistance;

            if(photoScale < 1){
                photoScale = 1;
            }

            if(photoScale > 4){
                photoScale = 4;
            }

            img.style.transform =
                `translate(${photoTranslateX}px,${photoTranslateY}px) scale(${photoScale})`;

        }

        lastDistance = distance;

        return;

    }

    // ----- 1本指ドラッグ -----

    if(photoScale > 1 && event.touches.length === 1){

        event.preventDefault();

        const x =
            event.touches[0].clientX;

        const y =
            event.touches[0].clientY;

        photoTranslateX += x - dragStartX;
        photoTranslateY += y - dragStartY;

        dragStartX = x;
        dragStartY = y;

        img.style.transform =
            `translate(${photoTranslateX}px,${photoTranslateY}px) scale(${photoScale})`;

    }

}


function photoDragEnd(event){

    if(event.changedTouches.length >= 2){
        lastDistance = 0;
    }

}


function photoSwipe(event){

    if(photoScale > 1){
        return;
    }

    if(event.changedTouches.length !== 1){
        return;
    }

    const touchEndX =
        event.changedTouches[0].clientX;

    const diff =
        touchEndX - touchStartX;

    if(Math.abs(diff) < 60){
        return;
    }

    if(diff < 0){

        showPhoto(currentPhotoIndex + 1);

    }else{

        showPhoto(currentPhotoIndex - 1);

    }

}

function photoDoubleTap(event){

    // 2本指なら何もしない
    if(event.changedTouches.length !== 1){
        return;
    }

    const now = Date.now();

    if(now - lastTapTime < 300){

        if(photoScale === 1){

            photoScale = 2;

        }else{

            photoScale = 1;
            photoTranslateX = 0;
            photoTranslateY = 0;

        }

        document.getElementById("photoViewerImage").style.transform =
            `translate(${photoTranslateX}px,${photoTranslateY}px) scale(${photoScale})`;

    }

    lastTapTime = now;

}


function shareCurrentPhoto(){

    if(!currentPhotoSrc){
        return;
    }


    // 画像共有対応端末

    if(
        navigator.share
    ){

        fetch(currentPhotoSrc)

        .then(res=>res.blob())

        .then(blob=>{


            const file =
                new File(
                    [blob],
                    "oshi-photo.jpg",
                    {
                        type:"image/jpeg"
                    }
                );


            navigator.share({

                files:[file],

                title:"推し活手帳",

                text:"お気に入り写真"

            });


        });


    }else{


        alert(
            "この端末では共有機能に対応していません"
        );


    }

}