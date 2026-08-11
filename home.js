/* =====================
   ホームHTML読み込み
===================== */

async function loadHome(){

    const home =
        document.getElementById("home");

    if(!home){
        return;
    }

    try{

        const response =
            await fetch("./home.html");

        if(!response.ok){
            throw new Error(
                "home.html 読み込み失敗"
            );
        }

        home.innerHTML =
            await response.text();

        /* ホーム内容を読み込んだ後に表示 */

displayHomeSchedule();
displayUpcomingEvents();
displayFavoritePhotoCard();
displayCountdown();
displayFavorites();

    }catch(error){

        console.error(
            "ホーム読み込みエラー:",
            error
        );

    }

}






/* =====================
   ホーム予定表示
===================== */
function displayHomeSchedule(){

    const events = db.load().events || [];

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

    if(!e.start){
        return null;
    }

    const d = new Date(e.start);

    if(isNaN(d.getTime())){
        return null;
    }

    return d;

}



    /* =====================
       今日の予定
    ===================== */

    const todayList = events
        .filter(e => {

            const d = eventStartDate(e);

            if(!d || isNaN(d.getTime())){
                return false;
            }

            return (
                d >= todayStart &&
                d < tomorrowStart
            );

        })
        .sort((a,b) => {

            return (
                eventStartDate(a) -
                eventStartDate(b)
            );

        });



    /* =====================
       表示
    ===================== */

    function render(id, list){

        const box =
            document.getElementById(id);

        if(!box){
            return;
        }


        if(list.length === 0){

            box.innerHTML =
                "該当なし";

            return;

        }


        box.innerHTML =
            list.map(e => {

                const icon =
                    getCategoryInfo(e.category)?.icon
                    || "📌";


                const date =
                    eventStartDate(e);


                const month =
                    date.getMonth() + 1;


                const day =
                    date.getDate();


                // 開始時刻
                const time =
                    e.start
                    ? e.start.substring(11,16)
                    : "";


                return `
<div
    class="schedule-item"
    onclick="openEventDetail(${e.id})">

    <div class="schedule-title">
        ${month}/${day}
        ${time ? " " + time : ""}
        ${icon}
        ${e.title}
    </div>

</div>
`;

            }).join("");

    }


    render(
        "today-schedule",
        todayList
    );

}

/* =====================
   直近のイベント
   ※本日の予定は除外
===================== */
function displayUpcomingEvents(){

    const box =
        document.getElementById("upcoming-events");

    if(!box) return;

    const now = new Date();

    // 今日の開始
    const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    // 明日の開始
    const tomorrowStart = new Date(todayStart);

    tomorrowStart.setDate(
        todayStart.getDate() + 1
    );


function eventStartDate(e){

    if(!e.start){
        return null;
    }

    const d = new Date(e.start);

    if(isNaN(d.getTime())){
        return null;
    }

    return d;

}

    

    /*
       今日の予定を除外して
       明日以降のイベントだけ取得
    */
    const events =
        db.load().events

        .filter(e=>{

            const d =
                eventStartDate(e);

            return (
                d &&
                d >= tomorrowStart
            );

        })

        .sort(
            (a,b)=>
                eventStartDate(a)
                -
                eventStartDate(b)
        )

        .slice(0,3);


    if(events.length===0){

        box.innerHTML =
            "該当なし";

        return;

    }


    box.innerHTML =
        events.map(e=>{

            const d =
                eventStartDate(e);

            const month =
                d.getMonth() + 1;

            const day =
                d.getDate();

            const icon =
                getCategoryInfo(
                    e.category
                )?.icon || "📌";


            return `
<div
    class="event-home-item"
    onclick="openEventDetail(${e.id})">

    <strong>
        ${month}/${day}
    </strong><br>

    ${icon} ${e.title}

</div>
`;

        }).join("");

}



/* =====================
ホームお気に入り写真
===================== */

function displayFavoritePhotoCard(){

const box =
    document.getElementById(
        "favorite-photo-card"
    );

if(!box){
    return;
}


const data = db.load();


/* =====================
   設定取得
===================== */

const settings =
    data.settings?.favoritePhoto || {};


/* =====================
   表示枚数
   初期値：3枚
===================== */

const countSetting =
    settings.count ?? 3;


/* =====================
   フェイド設定
   初期値：ON
===================== */

const fadeEnabled =
    settings.fade !== false;


/* =====================
   表示時間
   初期値：7秒
===================== */

const interval =
    Number(
        settings.interval || 7000
    );


/* =====================
   お気に入り写真取得
===================== */

let photos = [];


Object.values(
    data.dayMemories || {}
).forEach(day => {

    (day.photos || []).forEach(photo => {

        if(photo.favorite){

            photos.push(photo);

        }

    });

});


/* =====================
   自由並べ替え順
   ===================== */

photos.sort((a,b) => {

    return (
        (a.order ?? a.id)
        -
        (b.order ?? b.id)
    );

});


/* =====================
   表示枚数
===================== */

if(countSetting !== "all"){

    const displayCount =
        Number(countSetting);

    photos =
        photos.slice(
            0,
            displayCount
        );

}


console.log(
    "ホームお気に入り写真:",
    photos
);

console.log(
    "表示枚数:",
    countSetting
);

console.log(
    "フェイド:",
    fadeEnabled
);

console.log(
    "表示時間:",
    interval
);


/* =====================
   写真なし
===================== */

if(photos.length === 0){

    box.innerHTML = `
        <div class="favorite-photo-empty">
            ⭐ お気に入り写真はありません
        </div>
    `;

    return;

}


/* =====================
   1枚だけ
===================== */

if(photos.length === 1){

    box.innerHTML = `

        <div class="home-favorite-photo-view">

            <img
                src="${photos[0].src}"
                class="home-favorite-photo"
                onclick="openFavoritePhotoViewer(${photos[0].id})"
            >

        </div>

    `;

    return;

}


/* =====================
   複数枚
===================== */

box.innerHTML = `

    <div class="home-favorite-slideshow">

        ${photos.map((photo,index) => `

            <img
                src="${photo.src}"
                class="home-favorite-photo
                ${index === 0 ? "active" : ""}"
                data-favorite-index="${index}"
                onclick="openFavoritePhotoViewer(${photo.id})"
            >

        `).join("")}

    </div>

`;

/* =====================
   スライドショー
===================== */

let current = 0;


const slideshow =
    box.querySelector(
        ".home-favorite-slideshow"
    );


const images =
    box.querySelectorAll(
        ".home-favorite-photo"
    );


/* =====================
   フェイド設定
===================== */

if(slideshow){

    if(fadeEnabled){

        slideshow.classList.remove(
            "no-fade"
        );

    }else{

        slideshow.classList.add(
            "no-fade"
        );

    }

}


/* =====================
   最初の写真
===================== */

images.forEach((img,index)=>{

    img.classList.toggle(
        "active",
        index === 0
    );

});


/* =====================
   写真切り替え
===================== */

setInterval(() => {

    if(images.length <= 1){
        return;
    }


    images[current].classList.remove(
        "active"
    );


    current =
        (current + 1)
        % images.length;


    images[current].classList.add(
        "active"
    );


}, interval);
}



function displayCountdown() {

const box =
    document.getElementById("countdown-card");

if(!box) return;


const now = new Date();

const events =
    db.load().events
    .filter(e => e.start)
    .sort(
        (a,b) =>
            new Date(a.start) -
            new Date(b.start)
    );


/*
   現在時刻より後の
   一番近いイベント
*/
const next =
    events.find(
        e => new Date(e.start) > now
    );


if(!next){

    box.innerHTML =
        "予定はありません";

    box.style.background = "";
    box.style.border = "";

    return;

}


const start =
    new Date(next.start);


/*
   今日の日付
*/
const today =
    new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );


/*
   イベントの日付
*/
const eventDay =
    new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
    );


/*
   日付の差
*/
const days =
    Math.floor(
        (eventDay - today) /
        86400000
    );


/*
   現在時刻との差
*/
const diff =
    start - now;


const hours =
    Math.floor(
        (diff % 86400000) /
        3600000
    );


const mins =
    Math.floor(
        (diff % 3600000) /
        60000
    );


/*
   カウントダウン文字
*/
let countdownText = "";


if(days >= 5){

    countdownText =
        "あと " + days + "日";

}
else if(days >= 1){

    countdownText =
        "あと " + days + "日";

}
else if(diff > 0){

    countdownText =
        `あと ${hours}時間 ${mins}分`;

}
else{

    countdownText =
        "🎉 開催中";

}


/*
   カテゴリー
*/
const category =
    getCategoryInfo(next.category);


const icon =
    category?.icon || "📌";


/*
   日付・時刻
*/
const dateText =
    `${start.getMonth() + 1}月` +
    `${start.getDate()}日` +
    ` ${String(start.getHours()).padStart(2,"0")}:` +
    `${String(start.getMinutes()).padStart(2,"0")}まで`;


/*
   前日・当日の色
*/
let cardClass = "";


if(days === 1){

    cardClass =
        "countdown-tomorrow";

}
else if(days === 0){

    cardClass =
        "countdown-today";

}


/*
   カード表示
   ※ schedule-item を入れ子にしない
*/
box.innerHTML = `

<div
    class="countdown-inner ${cardClass}"
    onclick="openEventDetail(${next.id})"
><div class="countdown-top">

    <div class="countdown-number">
        ${countdownText}
    </div>

    <div class="countdown-date">
        ${dateText}
    </div>

</div>


<div class="countdown-event">

    ${icon}
    ${next.title}

</div>


${
    next.place
    ?
    `
    <div class="countdown-place">
        📍 ${next.place}
    </div>
    `
    :
    ""
}

</div>`;

}



