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
favoritePhotoUpdateHomeCount();
displayCountdown();

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
       繰り返し予定にも対応
       保存データは複製しない
    ===================== */

    const todayList = [];

    events.forEach(e => {

        if(!e.start){
            return;
        }

        const occurrences =
            getRecurringEventOccurrences(
                e,
                todayStart,
                tomorrowStart
            );

        occurrences.forEach(occurrence => {

            const eventStart =
                occurrence.start;

            const eventEnd =
                occurrence.end;

            if(
                !eventStart ||
                !eventEnd ||
                Number.isNaN(eventStart.getTime()) ||
                Number.isNaN(eventEnd.getTime())
            ){
                return;
            }

            // 今日に発生する予定だけを表示
            if(
                eventStart >= todayStart &&
                eventStart < tomorrowStart
            ){

                const startText =
                    `${eventStart.getFullYear()}-` +
                    `${String(eventStart.getMonth() + 1).padStart(2, "0")}-` +
                    `${String(eventStart.getDate()).padStart(2, "0")}T` +
                    `${String(eventStart.getHours()).padStart(2, "0")}:` +
                    `${String(eventStart.getMinutes()).padStart(2, "0")}`;

                const endText =
                    `${eventEnd.getFullYear()}-` +
                    `${String(eventEnd.getMonth() + 1).padStart(2, "0")}-` +
                    `${String(eventEnd.getDate()).padStart(2, "0")}T` +
                    `${String(eventEnd.getHours()).padStart(2, "0")}:` +
                    `${String(eventEnd.getMinutes()).padStart(2, "0")}`;

                todayList.push({
                    ...e,
                    start: startText,
                    end: endText
                });

            }

        });

    });

    todayList.sort((a, b) => {
        return eventStartDate(a) - eventStartDate(b);
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
   今日の予定は除外
   繰り返し予定に対応
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
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const savedEvents =
        db.load().events || [];

    const upcomingEvents = [];

    // 直近1年分を検索範囲にする
    const searchEnd = new Date(tomorrowStart);
    searchEnd.setFullYear(searchEnd.getFullYear() + 1);

    savedEvents.forEach(e => {

        if(!e.start){
            return;
        }

        const occurrences =
            getRecurringEventOccurrences(
                e,
                tomorrowStart,
                searchEnd
            );

        occurrences.forEach(occurrence => {

            const start =
                occurrence.start;

            const end =
                occurrence.end;

            if(
                !start ||
                !end ||
                Number.isNaN(start.getTime()) ||
                Number.isNaN(end.getTime())
            ){
                return;
            }

            // 明日以降に始まる発生分だけを追加
            if(start >= tomorrowStart){

                const startText =
                    `${start.getFullYear()}-` +
                    `${String(start.getMonth() + 1).padStart(2, "0")}-` +
                    `${String(start.getDate()).padStart(2, "0")}T` +
                    `${String(start.getHours()).padStart(2, "0")}:` +
                    `${String(start.getMinutes()).padStart(2, "0")}`;

                const endText =
                    `${end.getFullYear()}-` +
                    `${String(end.getMonth() + 1).padStart(2, "0")}-` +
                    `${String(end.getDate()).padStart(2, "0")}T` +
                    `${String(end.getHours()).padStart(2, "0")}:` +
                    `${String(end.getMinutes()).padStart(2, "0")}`;

                upcomingEvents.push({
                    ...e,
                    start: startText,
                    end: endText
                });

            }

        });

    });

    // 発生日時の早い順に並べて3件に絞る
    upcomingEvents.sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
    });

    const events =
        upcomingEvents.slice(0, 3);

    if(events.length === 0){

        box.innerHTML = "該当なし";
        return;

    }

    box.innerHTML =
        events.map(e => {

            const d = new Date(e.start);

            const month =
                d.getMonth() + 1;

            const day =
                d.getDate();

            const icon =
                getCategoryInfo(e.category)?.icon || "📌";

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

/* =====================
ホームお気に入り写真
===================== */

let favoritePhotoHomeSlideTimer = null;

async function displayFavoritePhotoCard(){

    const box =
        document.getElementById(
            "home-favorite-photo"
        );

    if(!box){
        return;
    }


    /* =====================
       既存タイマー停止
       設定変更時の多重実行防止
    ===================== */

    if(
        favoritePhotoHomeSlideTimer
    ){

        clearInterval(
            favoritePhotoHomeSlideTimer
        );

        favoritePhotoHomeSlideTimer =
            null;

    }


    const data =
        db.load();


    /* =====================
       設定取得
    ===================== */

    const settings =
        data.settings?.favoritePhoto || {};


    const countSetting =
        settings.count ?? 3;


    const fadeEnabled =
        settings.fade !== false;


    const interval =
        Number(
            settings.interval ?? 7000
        );


    /* =====================
       お気に入りページと
       完全に同じ写真一覧を使用
    ===================== */

    const favorites =
        favoritePhotoGetOrdered();


    const photos = [];


    /*
       推し写真はIndexedDBから取得
       1日手帳写真は従来方式を維持
    */

    for(
        const favorite of favorites
    ){

        let photo = null;


        if(
            favorite?.source ===
            "favorite"
        ){

            photo =
                await favoritesGetPhotoDataAsync(
                    favorite
                );

        }else{

            photo =
                favoritePhotoGetData(
                    favorite
                );

        }


        if(photo){

            photos.push({

                ...photo,

                favoriteId:
                    favorite.id

            });

        }

    }


    console.log(
    "ホームお気に入り写真:",
    photos
);

    /* =====================
       表示枚数
    ===================== */

    let displayPhotos =
        photos;


    if(
        countSetting !== "all"
    ){

        const displayCount =
            Number(
                countSetting
            );


        displayPhotos =
            photos.slice(
                0,
                displayCount
            );

    }


    /* =====================
       写真なし
    ===================== */

    if(
        displayPhotos.length === 0
    ){

        box.innerHTML = `

            <div
                class="favorite-photo-empty">

                ⭐ お気に入り写真はありません

            </div>

        `;

        return;

    }


    /* =====================
       1枚だけ
    ===================== */

    if(
        displayPhotos.length === 1
    ){

        const photo =
            displayPhotos[0];


        box.innerHTML = `

            <div
                class="home-favorite-photo-view">

                <img
                    src="${photo.src}"
                    class="home-favorite-photo"

                    onclick="
                        openFavoritePhotoViewer(
                            '${photo.favoriteId}'
                        )
                    "
                >

            </div>

        `;

        return;

    }


    /* =====================
       複数枚
       スライドショー
    ===================== */

    box.innerHTML = `

        <div
            class="
                home-favorite-slideshow
                ${fadeEnabled
                    ? ""
                    : "no-fade"
                }
            "
        >

            ${
                displayPhotos.map(
                    (photo,index) => `

                        <img
                            src="${photo.src}"

                            class="
                                home-favorite-photo
                                ${
                                    index === 0
                                    ? "active"
                                    : ""
                                }
                            "

                            data-favorite-index="${index}"

                            onclick="
                                openFavoritePhotoViewer(
                                    '${photo.favoriteId}'
                                )
                            "
                        >

                    `
                ).join("")
            }

        </div>

    `;


    /* =====================
       スライドショー開始
    ===================== */

    let current = 0;


    const images =
        box.querySelectorAll(
            ".home-favorite-photo"
        );


    if(
        images.length <= 1
    ){

        return;

    }


    favoritePhotoHomeSlideTimer =
        setInterval(
            () => {

                images[
                    current
                ].classList.remove(
                    "active"
                );


                current =
                    (
                        current + 1
                    )
                    %
                    images.length;


                images[
                    current
                ].classList.add(
                    "active"
                );


            },
            interval
        );

}



function displayCountdown() {

    const box =
        document.getElementById("countdown-card");

    if(!box) return;

    const now = new Date();

    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

    // 1年先までの開催を検索
    const searchEnd = new Date(today);
    searchEnd.setFullYear(searchEnd.getFullYear() + 1);

    const savedEvents =
        db.load().events || [];

    const upcomingEvents = [];

    savedEvents.forEach(e => {

        if(!e.start) return;

        const occurrences =
            getRecurringEventOccurrences(
                e,
                now,
                searchEnd
            );

        occurrences.forEach(occurrence => {

            const start = occurrence.start;
            const end = occurrence.end;

            if(
                !start ||
                !end ||
                Number.isNaN(start.getTime()) ||
                Number.isNaN(end.getTime()) ||
                start <= now
            ){
                return;
            }

            // 表示用データのみ作成。保存データは変更しない
            const startText =
                `${start.getFullYear()}-` +
                `${String(start.getMonth() + 1).padStart(2, "0")}-` +
                `${String(start.getDate()).padStart(2, "0")}T` +
                `${String(start.getHours()).padStart(2, "0")}:` +
                `${String(start.getMinutes()).padStart(2, "0")}`;

            const endText =
                `${end.getFullYear()}-` +
                `${String(end.getMonth() + 1).padStart(2, "0")}-` +
                `${String(end.getDate()).padStart(2, "0")}T` +
                `${String(end.getHours()).padStart(2, "0")}:` +
                `${String(end.getMinutes()).padStart(2, "0")}`;

            upcomingEvents.push({
                ...e,
                start: startText,
                end: endText
            });

        });

    });

    // 次に始まる予定を選ぶ
    upcomingEvents.sort(
        (a, b) =>
            new Date(a.start) - new Date(b.start)
    );

    const next = upcomingEvents[0];

    if(!next){

        box.innerHTML = "予定はありません";
        box.style.background = "";
        box.style.border = "";

        return;
    }

    const start = new Date(next.start);

    const eventDay =
        new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
        );

    const days =
        Math.floor(
            (eventDay - today) / 86400000
        );

    const diff = start - now;

    const hours =
        Math.floor(
            (diff % 86400000) / 3600000
        );

    const mins =
        Math.floor(
            (diff % 3600000) / 60000
        );

    let countdownText = "";

    if(days >= 1){

        countdownText =
            `あと <span class="countdown-number-large">${days}</span>日`;

    }
    else{

        countdownText =
            `あと <span class="countdown-number-large">${hours}</span>時間 <span class="countdown-number-large">${mins}</span>分`;

    }

    const category =
        getCategoryInfo(next.category);

    const icon =
        category?.icon || "📌";

    const dateText =
        `${start.getMonth() + 1}月` +
        `${start.getDate()}日` +
        ` ${String(start.getHours()).padStart(2, "0")}:` +
        `${String(start.getMinutes()).padStart(2, "0")}まで`;

    let cardClass = "";

    if(days === 1){

        cardClass = "countdown-tomorrow";

    }
    else if(days === 0){

        cardClass = "countdown-today";

    }

    box.innerHTML = `
<div
    class="countdown-inner ${cardClass}"
    onclick="openEventDetail(${next.id})"
>
    <div class="countdown-event">
        ${icon}
        ${next.title}
    </div>

    <div class="countdown-date">
        ${dateText}
    </div>

    <div class="countdown-number">
        ${countdownText}
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



function openFavoritePhotoPage(){

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(
        page => {
            page.classList.remove("active");
        }
    );

    const page =
        document.getElementById(
            "favoritePhotoPage"
        );

    if(!page){
        console.error(
            "favoritePhotoPage が見つかりません"
        );
        return;
    }

    page.classList.add("active");

    favoritePhotoRender();

}