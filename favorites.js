/* =========================================================
   ⭐ お気に入りページ
   完全新仕様版
=========================================================

【このファイルの基本方針】

・photo.js は変更しない
・planner.js / planner.html も変更しない
・CSSも既存クラスをできるだけ使用
・1日手帳の写真は photo.favorite === true を直接取得
・お気に入り直接追加写真は data.favorites.photos に保存
・イベントと写真は完全分離
・1日手帳由来とお気に入り直接追加を source で区別
・お気に入りページでは両方を混在表示
・並べ替え順は favorites 内に保存
・古いお気に入りデータとの互換処理はしない


=========================================================
⭐ photo.js から受け取って利用するもの
=========================================================

【写真データ】

data.dayMemories
    ↓
各日の
day.photos
    ↓
photo.id
photo.src
photo.favorite
photo.star


【重要】

photo.js の toggleFavoritePhoto() は

    photo.favorite =
        !photo.favorite;

としている。

そのため favorites.js では、
data.favorites.photos に1日手帳写真を
コピーして保存する方式にはしない。

毎回 dayMemories を検索し、

    photo.favorite === true

の写真を「1日手帳由来のお気に入り」として取得する。


=========================================================
⭐ favorites.js 内で使用する受け渡し変数
=========================================================

【1日手帳由来写真】

favoriteSourcePhotos

    1日手帳側の
    photo.favorite === true
    の写真一覧。


favoriteSourcePhotoMap

    お気に入りID → 1日手帳写真

    の対応表。


【直接追加写真】

favoriteDirectPhotos

    data.favorites.photos
    に保存されている写真。


【最終表示写真】

favoritePhotoItems

    1日手帳由来
    ＋
    直接追加

    をお気に入りページ用の共通形式にしたもの。


=========================================================
⭐ 新仕様のデータ区別
=========================================================

1日手帳由来

    source: "dayPlanner"

直接追加

    source: "favorite"


=========================================================
⭐ 注意
=========================================================

photo.js の以下の変数は favorites.js では
直接変更しない。

currentPhotoSrc
currentPhotoIndex
photoScale
photoDeleteMode
photoShareMode
photoSortMode

お気に入りページ専用状態は
favorite～ という名前で管理する。

========================================================= */


/* =========================================================
   ⭐ お気に入り共通状態
========================================================= */

let favoriteEventDeleteSelecting = false;
let favoritePhotoDeleteSelecting = false;

let favoriteEventShareSelecting = false;
let favoritePhotoShareSelecting = false;

let favoriteEventSortSelecting = false;
let favoritePhotoSortSelecting = false;

let selectedFavoriteEventIds = [];
let selectedFavoritePhotoIds = [];


/* =========================================================
   ⭐ お気に入り表示順
========================================================= */

let favoriteEventDisplayOrder = [];
let favoritePhotoDisplayOrder = [];


/* =========================================================
   ⭐ photo.js → favorites.js
   ⭐ 1日手帳お気に入り写真取得
========================================================= */

let favoriteSourcePhotos = [];

let favoriteSourcePhotoMap = new Map();


function collectFavoriteSourcePhotos(){

    const data = db.load();

    favoriteSourcePhotos = [];

    favoriteSourcePhotoMap =
        new Map();


    const memories =
        data.dayMemories || {};


    Object.entries(memories)
    .forEach(
        ([dayKey, day]) => {

            const photos =
                day?.photos || [];


            photos.forEach(photo => {

                if(
                    !photo ||
                    photo.favorite !== true
                ){

                    return;

                }


                const id =
                    String(photo.id);


                favoriteSourcePhotos.push({

                    id: id,

                    source:
                        "dayPlanner",

                    sourcePhotoId:
                        photo.id,

                    src:
                        photo.src,

                    star:
                        photo.star || 0,

                    dayKey:
                        dayKey,

                    photo:
                        photo,

                    day:
                        day

                });


                favoriteSourcePhotoMap.set(
                    id,
                    {
                        photo: photo,
                        day: day,
                        dayKey: dayKey
                    }
                );

            });

        }
    );


    return favoriteSourcePhotos;

}


/* =========================================================
   ⭐ 直接追加写真取得
========================================================= */

function getFavoriteDirectPhotos(){

    const data =
        db.load();


    const photos =
        data.favorites?.photos;


    if(
        !Array.isArray(photos)
    ){

        return [];

    }


    return photos.filter(
        photo =>
            photo &&
            photo.source === "favorite"
    );

}


/* =========================================================
   ⭐ お気に入り写真を共通形式にする
========================================================= */

function getFavoritePhotoItems(){

    collectFavoriteSourcePhotos();


    const sourcePhotos =
        favoriteSourcePhotos;


    const directPhotos =
        getFavoriteDirectPhotos();


    const result = [];


    /*
       =========================
       1日手帳由来
       =========================
    */

    sourcePhotos.forEach(
        item => {

            result.push({

                id:
                    String(item.id),

                source:
                    "dayPlanner",

                sourcePhotoId:
                    item.sourcePhotoId,

                src:
                    item.src,

                star:
                    item.star || 0,

                dayKey:
                    item.dayKey

            });

        }
    );


    /*
       =========================
       直接追加
       =========================
    */

    directPhotos.forEach(
        item => {

            result.push({

                id:
                    String(item.id),

                source:
                    "favorite",

                src:
                    item.src,

                star:
                    item.star || 0,

                favoriteAt:
                    item.favoriteAt || item.id

            });

        }
    );


    return result;

}


/* =========================================================
   ⭐ お気に入りページ表示
========================================================= */

function displayFavorites(){

    renderFavoriteEvents();

    renderFavoritePhotos();

}


/* =========================================================
   ⭐ お気に入りイベント取得
========================================================= */

function getFavoriteEvents(){

    const data =
        db.load();


    const favorites =
        data.favorites?.events || [];


    if(
        !Array.isArray(favorites)
    ){

        return [];

    }


    return favorites.filter(
        item =>
            item
    );

}


/* =========================================================
   ⭐ お気に入り写真取得
========================================================= */

function getFavoritePhotos(){

    return getFavoritePhotoItems();

}


/* =========================================================
   ⭐ 1日手帳イベント取得
========================================================= */

function getFavoriteSourceEvent(favorite){

    if(
        !favorite ||
        favorite.source !== "dayPlanner" ||
        favorite.sourceEventId == null
    ){

        return null;

    }


    const data =
        db.load();


    const events =
        data.events || [];


    return events.find(
        event =>
            String(event.id) ===
            String(favorite.sourceEventId)
    ) || null;

}


/* =========================================================
   ⭐ お気に入りイベント実体
========================================================= */

function getFavoriteEventData(favorite){

    if(!favorite){
        return null;
    }


    if(
        favorite.source === "dayPlanner"
    ){

        return getFavoriteSourceEvent(
            favorite
        );

    }


    if(
        favorite.source === "favorite"
    ){

        return favorite;

    }


    return null;

}


/* =========================================================
   ⭐ 1日手帳写真実体取得
========================================================= */

function getFavoriteSourcePhoto(favorite){

    if(
        !favorite ||
        favorite.source !== "dayPlanner"
    ){

        return null;

    }


    collectFavoriteSourcePhotos();


    return favoriteSourcePhotoMap.get(
        String(
            favorite.sourcePhotoId ??
            favorite.id
        )
    ) || null;

}


/* =========================================================
   ⭐ お気に入り写真実体
========================================================= */

function getFavoritePhotoData(favorite){

    if(!favorite){
        return null;
    }


    if(
        favorite.source === "dayPlanner"
    ){

        const result =
            getFavoriteSourcePhoto(
                favorite
            );


        return result
            ? result.photo
            : null;

    }


    if(
        favorite.source === "favorite"
    ){

        return favorite;

    }


    return null;

}


/* =========================================================
   ⭐ イベント表示順
========================================================= */

function getOrderedFavoriteEvents(){

    const data =
        db.load();


    const favorites =
        data.favorites?.events || [];


    if(
        !Array.isArray(favorites)
    ){

        return [];

    }


    const order =
        data.favorites?.eventOrder || [];


    if(order.length){

        const result = [];


        order.forEach(id => {

            const item =
                favorites.find(
                    favorite =>
                        String(favorite.id) ===
                        String(id)
                );


            if(item){

                result.push(item);

            }

        });


        favorites.forEach(item => {

            const exists =
                result.some(
                    x =>
                        String(x.id) ===
                        String(item.id)
                );


            if(!exists){

                result.push(item);

            }

        });


        return result;

    }


    return [...favorites];

}


/* =========================================================
   ⭐ 写真表示順
========================================================= */

function getOrderedFavoritePhotos(){

    const favorites =
        getFavoritePhotoItems();


    if(
        !favorites.length
    ){

        return [];

    }


    const data =
        db.load();


    const order =
        data.favorites?.photoOrder || [];


    /*
       保存された自由並べ替え順
    */

    if(
        Array.isArray(order) &&
        order.length
    ){

        const result = [];


        order.forEach(id => {

            const item =
                favorites.find(
                    favorite =>
                        String(favorite.id) ===
                        String(id)
                );


            if(item){

                result.push(item);

            }

        });


        /*
           新しく追加されたものは最後
        */

        favorites.forEach(item => {

            const exists =
                result.some(
                    x =>
                        String(x.id) ===
                        String(item.id)
                );


            if(!exists){

                result.push(item);

            }

        });


        return result;

    }


    /*
       初回は登録順
    */

    return favorites;

}


/* =========================================================
   ⭐ お気に入りイベント表示
========================================================= */

function renderFavoriteEvents(){

    const box =
        document.getElementById(
            "favorite-event-list"
        );


    if(!box){
        return;
    }


    const favorites =
        getOrderedFavoriteEvents();


    favoriteEventDisplayOrder =
        favorites.map(
            item => String(item.id)
        );


    if(
        favorites.length === 0
    ){

        box.innerHTML = `
            <div class="favorites-empty">
                イベントはありません
            </div>
        `;

        return;

    }


    let html = "";


    favorites.forEach(
        favorite => {

            const event =
                getFavoriteEventData(
                    favorite
                );


            if(
                favorite.source ===
                    "dayPlanner" &&
                !event
            ){

                return;

            }


            if(!event){
                return;
            }


            const selected =
                selectedFavoriteEventIds
                .includes(
                    String(favorite.id)
                );


            const sourceLabel =
                favorite.source ===
                    "dayPlanner"
                ?
                "📅 1日手帳"
                :
                "⭐ お気に入りに追加";


            html += `

<div
    class="
        favorite-event-item

        ${
            (
                favoriteEventDeleteSelecting ||
                favoriteEventShareSelecting
            ) &&
            selected
            ?
            "favorite-item-selected"
            :
            ""
        }
    "

    data-favorite-event-id="${favorite.id}"

    ${
        favoriteEventDeleteSelecting
        ?
        `onclick="toggleFavoriteEventDelete('${favorite.id}')"`
        :
        ""
    }

    ${
        favoriteEventShareSelecting
        ?
        `onclick="toggleFavoriteEventShare('${favorite.id}')"`
        :
        ""
    }

>

    <div class="favorite-event-source">
        ${sourceLabel}
    </div>

    <div class="favorite-event-title">
        ${event.title || "無題の予定"}
    </div>

    <div class="favorite-event-date">
        ${
            event.start
            ?
            formatFavoriteEventDate(
                event.start
            )
            :
            ""
        }
    </div>

    ${
        event.place
        ?
        `
        <div class="favorite-event-place">
            📍 ${event.place}
        </div>
        `
        :
        ""
    }

    ${
        event.companion
        ?
        `
        <div class="favorite-event-companion">
            👥 ${event.companion}
        </div>
        `
        :
        ""
    }

</div>

`;

        }
    );


    box.innerHTML =
        html ||
        `
        <div class="favorites-empty">
            イベントはありません
        </div>
        `;


    /*
       並べ替えモード
    */

    if(
        favoriteEventSortSelecting
    ){

        enableFavoriteEventSorting();

    }

}


/* =========================================================
   ⭐ イベント日時
========================================================= */

function formatFavoriteEventDate(value){

    if(!value){
        return "";
    }


    const date =
        new Date(value);


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return value;

    }


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


    return `
        ${date.getFullYear()}年
        ${date.getMonth()+1}月
        ${date.getDate()}日
        (${week[date.getDay()]})
        ${String(date.getHours()).padStart(2,"0")}:
        ${String(date.getMinutes()).padStart(2,"0")}
    `;

}


/* =========================================================
   ⭐ お気に入り写真表示
========================================================= */

function renderFavoritePhotos(){

    const box =
        document.getElementById(
            "favorite-photo-list"
        );


    if(!box){
        return;
    }


    const favorites =
        getOrderedFavoritePhotos();


    favoritePhotoDisplayOrder =
        favorites.map(
            item => String(item.id)
        );


    if(
        favorites.length === 0
    ){

        box.innerHTML = `
            <div class="favorites-empty">
                写真はありません
            </div>
        `;

        return;

    }


    let html = "";


    favorites.forEach(
        favorite => {

            const photo =
                getFavoritePhotoData(
                    favorite
                );


            if(
                favorite.source ===
                    "dayPlanner" &&
                !photo
            ){

                return;

            }


            if(!photo){
                return;
            }


            const selected =
                selectedFavoritePhotoIds
                .includes(
                    String(favorite.id)
                );


            const sourceLabel =
                favorite.source ===
                    "dayPlanner"
                ?
                "📅"
                :
                "⭐";


            html += `

<div
    class="
        favorite-photo-item

        ${
            (
                favoritePhotoDeleteSelecting ||
                favoritePhotoShareSelecting
            ) &&
            selected
            ?
            "favorite-item-selected"
            :
            ""
        }
    "

    data-favorite-photo-id="${favorite.id}"

    ${
        favoritePhotoDeleteSelecting
        ?
        `onclick="toggleFavoritePhotoDelete('${favorite.id}')"`
        :
        ""
    }

    ${
        favoritePhotoShareSelecting
        ?
        `onclick="toggleFavoritePhotoShare('${favorite.id}')"`
        :
        ""
    }

>

    <img
        src="${photo.src}"
        class="favorite-photo-image"

        ${
            !favoritePhotoDeleteSelecting &&
            !favoritePhotoShareSelecting &&
            !favoritePhotoSortSelecting
            ?
            `onclick="openFavoritePhotoViewerNew('${favorite.id}')"`
            :
            ""
        }
    >

    <div class="favorite-photo-source-badge">
        ${sourceLabel}
    </div>

</div>

`;

        }
    );


    box.innerHTML =
        html ||
        `
        <div class="favorites-empty">
            写真はありません
        </div>
        `;


    if(
        favoritePhotoSortSelecting
    ){

        enableFavoritePhotoSorting();

    }

}


/* =========================================================
   ⭐ お気に入り直接イベント追加
========================================================= */

function openFavoriteAddEvent(){

    const modal =
        document.getElementById(
            "favoriteEventAddModal"
        );


    if(modal){

        modal.style.display =
            "flex";

    }else{

        console.warn(
            "favoriteEventAddModal がありません"
        );

    }

}


/* =========================================================
   ⭐ お気に入り直接写真追加
========================================================= */

function openFavoritePhotoPicker(){

    const picker =
        document.getElementById(
            "favoritePhotoPicker"
        );


    if(!picker){

        console.warn(
            "favoritePhotoPicker がありません"
        );

        return;

    }


    picker.click();

}


/* =========================================================
   ⭐ 直接追加写真
========================================================= */

function favoritePhotoSelected(event){

    const files =
        Array.from(
            event.target.files || []
        );


    if(
        files.length === 0
    ){

        return;

    }


    const data =
        db.load();


    if(!data.favorites){

        data.favorites = {};

    }


    if(
        !Array.isArray(
            data.favorites.photos
        )
    ){

        data.favorites.photos = [];

    }


    if(
        !Array.isArray(
            data.favorites.photoOrder
        )
    ){

        data.favorites.photoOrder = [];

    }


    let completed = 0;


    files.forEach(file => {

        if(
            !file.type.startsWith(
                "image/"
            )
        ){

            completed++;

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(e){

                const img =
                    new Image();


                img.onload =
                    function(){

                        const MAX =
                            1000;


                        let width =
                            img.width;

                        let height =
                            img.height;


                        if(
                            width > height
                        ){

                            if(
                                width > MAX
                            ){

                                height *=
                                    MAX / width;

                                width =
                                    MAX;

                            }

                        }else{

                            if(
                                height > MAX
                            ){

                                width *=
                                    MAX / height;

                                height =
                                    MAX;

                            }

                        }


                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        canvas.width =
                            width;

                        canvas.height =
                            height;


                        const ctx =
                            canvas.getContext(
                                "2d"
                            );


                        ctx.drawImage(
                            img,
                            0,
                            0,
                            width,
                            height
                        );


                        const src =
                            canvas.toDataURL(
                                "image/jpeg",
                                0.8
                            );


                        const id =
                            Date.now() +
                            Math.random();


                        const favorite = {

                            id: id,

                            source:
                                "favorite",

                            src: src,

                            favoriteAt:
                                Date.now()

                        };


                        data.favorites.photos.push(
                            favorite
                        );


                        data.favorites.photoOrder.push(
                            String(id)
                        );


                        completed++;


                        if(
                            completed >=
                            files.length
                        ){

                            db.save(data);

                            renderFavoritePhotos();

                        }

                    };


                img.src =
                    e.target.result;

            };


        reader.readAsDataURL(file);

    });


    event.target.value = "";

}


/* =========================================================
   ⭐ イベント削除モード
========================================================= */

function favoriteEventDeleteMode(){

    favoriteEventDeleteSelecting =
        true;

    favoriteEventShareSelecting =
        false;

    favoriteEventSortSelecting =
        false;

    selectedFavoriteEventIds = [];

    renderFavoriteEvents();

}


function toggleFavoriteEventDelete(id){

    id = String(id);


    const index =
        selectedFavoriteEventIds.indexOf(
            id
        );


    if(index >= 0){

        selectedFavoriteEventIds.splice(
            index,
            1
        );

    }else{

        selectedFavoriteEventIds.push(
            id
        );

    }


    renderFavoriteEvents();

}


/* =========================================================
   ⭐ イベント削除
========================================================= */

function confirmFavoriteEventDelete(){

    if(
        selectedFavoriteEventIds.length === 0
    ){

        alert(
            "削除するイベントを選択してください"
        );

        return;

    }


    const data =
        db.load();


    const favorites =
        data.favorites?.events || [];


    const targets =
        favorites.filter(
            favorite =>
                selectedFavoriteEventIds
                .includes(
                    String(favorite.id)
                )
        );


    const dayPlannerTargets =
        targets.filter(
            favorite =>
                favorite.source ===
                "dayPlanner"
        );


    const directTargets =
        targets.filter(
            favorite =>
                favorite.source ===
                "favorite"
        );


    let message = "";


    if(
        dayPlannerTargets.length
    ){

        message +=
            "📅 1日手帳からのお気に入り\n" +
            `${dayPlannerTargets.length}件あります。\n` +
            "お気に入りから削除すると、" +
            "元の1日手帳の予定も削除されます。\n\n";

    }


    if(
        directTargets.length
    ){

        message +=
            "⭐ お気に入りに直接追加した予定\n" +
            `${directTargets.length}件あります。\n` +
            "お気に入りからのみ削除されます。\n\n";

    }


    message +=
        "削除してよろしいですか？";


    if(!confirm(message)){
        return;
    }


    /*
       1日手帳イベント削除
    */

    dayPlannerTargets.forEach(
        favorite => {

            if(
                !Array.isArray(
                    data.events
                )
            ){

                return;

            }


            data.events =
                data.events.filter(
                    event =>
                        String(event.id) !==
                        String(
                            favorite.sourceEventId
                        )
                );

        }
    );


    /*
       お気に入り削除
    */

    if(
        !data.favorites
    ){

        data.favorites = {};

    }


    data.favorites.events =
        favorites.filter(
            favorite =>
                !selectedFavoriteEventIds
                .includes(
                    String(favorite.id)
                )
        );


    data.favorites.eventOrder =
        (
            data.favorites.eventOrder ||
            []
        ).filter(
            id =>
                !selectedFavoriteEventIds
                .includes(
                    String(id)
                )
        );


    db.save(data);


    favoriteEventDeleteSelecting =
        false;

    selectedFavoriteEventIds = [];


    renderFavoriteEvents();


    if(
        typeof displayEventList ===
        "function"
    ){

        displayEventList();

    }


    if(
        typeof displayHomeSchedule ===
        "function"
    ){

        displayHomeSchedule();

    }


    if(
        typeof displayUpcomingEvents ===
        "function"
    ){

        displayUpcomingEvents();

    }


    if(
        typeof renderCalendar ===
        "function"
    ){

        renderCalendar();

    }

}


function cancelFavoriteEventDelete(){

    favoriteEventDeleteSelecting =
        false;

    selectedFavoriteEventIds = [];

    renderFavoriteEvents();

}


/* =========================================================
   ⭐ 写真削除モード
========================================================= */

function favoritePhotoDeleteMode(){

    favoritePhotoDeleteSelecting =
        true;

    favoritePhotoShareSelecting =
        false;

    favoritePhotoSortSelecting =
        false;

    selectedFavoritePhotoIds = [];

    renderFavoritePhotos();

}


function toggleFavoritePhotoDelete(id){

    id = String(id);


    const index =
        selectedFavoritePhotoIds.indexOf(
            id
        );


    if(index >= 0){

        selectedFavoritePhotoIds.splice(
            index,
            1
        );

    }else{

        selectedFavoritePhotoIds.push(
            id
        );

    }


    renderFavoritePhotos();

}


/* =========================================================
   ⭐ 写真削除
========================================================= */

function confirmFavoritePhotoDelete(){

    if(
        selectedFavoritePhotoIds.length === 0
    ){

        alert(
            "削除する写真を選択してください"
        );

        return;

    }


    const data =
        db.load();


    const favorites =
        getFavoritePhotoItems();


    const targets =
        favorites.filter(
            favorite =>
                selectedFavoritePhotoIds
                .includes(
                    String(favorite.id)
                )
        );


    const dayPlannerTargets =
        targets.filter(
            favorite =>
                favorite.source ===
                "dayPlanner"
        );


    const directTargets =
        targets.filter(
            favorite =>
                favorite.source ===
                "favorite"
        );


    let message = "";


    if(
        dayPlannerTargets.length
    ){

        message +=
            "📅 1日手帳からのお気に入り写真\n" +
            `${dayPlannerTargets.length}枚あります。\n` +
            "お気に入りから削除すると、" +
            "元の1日手帳の写真も削除されます。\n\n";

    }


    if(
        directTargets.length
    ){

        message +=
            "⭐ お気に入りに直接追加した写真\n" +
            `${directTargets.length}枚あります。\n` +
            "お気に入りからのみ削除されます。\n\n";

    }


    message +=
        "削除してよろしいですか？";


    if(!confirm(message)){
        return;
    }


    /*
       =========================
       1日手帳写真削除
       =========================
    */

    dayPlannerTargets.forEach(
        favorite => {

            const source =
                getFavoriteSourcePhoto(
                    favorite
                );


            if(
                !source ||
                !source.day ||
                !Array.isArray(
                    source.day.photos
                )
            ){

                return;

            }


            source.day.photos =
                source.day.photos.filter(
                    photo =>
                        String(photo.id) !==
                        String(
                            favorite.sourcePhotoId
                        )
                );

        }
    );


    /*
       =========================
       直接追加写真削除
       =========================
    */

    if(
        !data.favorites
    ){

        data.favorites = {};

    }


    if(
        !Array.isArray(
            data.favorites.photos
        )
    ){

        data.favorites.photos = [];

    }


    data.favorites.photos =
        data.favorites.photos.filter(
            favorite =>
                !selectedFavoritePhotoIds
                .includes(
                    String(favorite.id)
                )
        );


    /*
       =========================
       並び順削除
       =========================
    */

    data.favorites.photoOrder =
        (
            data.favorites.photoOrder ||
            []
        ).filter(
            id =>
                !selectedFavoritePhotoIds
                .includes(
                    String(id)
                )
        );


    db.save(data);


    favoritePhotoDeleteSelecting =
        false;

    selectedFavoritePhotoIds = [];


    renderFavoritePhotos();


    /*
       1日手帳側更新
    */

    if(
        typeof renderDayMemory ===
        "function"
    ){

        renderDayMemory();

    }

}


function cancelFavoritePhotoDelete(){

    favoritePhotoDeleteSelecting =
        false;

    selectedFavoritePhotoIds = [];

    renderFavoritePhotos();

}


/* =========================================================
   ⭐ イベント並べ替え
========================================================= */

function favoriteEventSortMode(){

    favoriteEventDeleteSelecting =
        false;

    favoriteEventShareSelecting =
        false;

    favoriteEventSortSelecting =
        true;

    selectedFavoriteEventIds = [];

    renderFavoriteEvents();

}


function saveFavoriteEventOrder(){

    const data =
        db.load();


    const container =
        document.getElementById(
            "favorite-event-list"
        );


    if(!container){
        return;
    }


    const items =
        [
            ...container.querySelectorAll(
                "[data-favorite-event-id]"
            )
        ];


    const order =
        items.map(
            item =>
                String(
                    item.dataset.favoriteEventId
                )
        );


    if(!data.favorites){

        data.favorites = {};

    }


    data.favorites.eventOrder =
        order;


    db.save(data);


    favoriteEventSortSelecting =
        false;


    renderFavoriteEvents();

}


/* =========================================================
   ⭐ 写真並べ替え
========================================================= */

function favoritePhotoSortMode(){

    favoritePhotoDeleteSelecting =
        false;

    favoritePhotoShareSelecting =
        false;

    favoritePhotoSortSelecting =
        true;

    selectedFavoritePhotoIds = [];

    renderFavoritePhotos();

}


function saveFavoritePhotoOrder(){

    const data =
        db.load();


    const container =
        document.getElementById(
            "favorite-photo-list"
        );


    if(!container){
        return;
    }


    const items =
        [
            ...container.querySelectorAll(
                "[data-favorite-photo-id]"
            )
        ];


    const order =
        items.map(
            item =>
                String(
                    item.dataset.favoritePhotoId
                )
        );


    if(!data.favorites){

        data.favorites = {};

    }


    data.favorites.photoOrder =
        order;


    db.save(data);


    favoritePhotoSortSelecting =
        false;


    renderFavoritePhotos();

}


/* =========================================================
   ⭐ イベント並べ替え実装
========================================================= */

let favoriteEventDragging = false;
let favoriteEventDragElement = null;


function enableFavoriteEventSorting(){

    const container =
        document.getElementById(
            "favorite-event-list"
        );


    if(!container){
        return;
    }


    container
    .querySelectorAll(
        "[data-favorite-event-id]"
    )
    .forEach(item => {

        item.style.cursor =
            "grab";

    });

}


/* =========================================================
   ⭐ 写真並べ替え実装
========================================================= */

let favoritePhotoDragging = false;
let favoritePhotoDragElement = null;
let favoritePhotoTouchTimer = null;
let favoritePhotoSortStarted = false;


/*
   タッチ開始
*/

document.addEventListener(
    "touchstart",
    function(e){

        if(
            !favoritePhotoSortSelecting
        ){

            return;

        }


        const item =
            e.target.closest(
                ".favorite-photo-item"
            );


        if(!item){
            return;
        }


        favoritePhotoDragElement =
            item;


        favoritePhotoSortStarted =
            false;


        favoritePhotoTouchTimer =
            setTimeout(
                function(){

                    favoritePhotoDragging =
                        true;

                    favoritePhotoSortStarted =
                        true;


                    item.classList.add(
                        "photo-dragging"
                    );


                    if(
                        navigator.vibrate
                    ){

                        navigator.vibrate(30);

                    }

                },
                150
            );

    },
    {
        passive:true
    }
);


/*
   タッチ移動
*/

document.addEventListener(
    "touchmove",
    function(e){

        if(
            !favoritePhotoSortSelecting ||
            !favoritePhotoDragging ||
            !favoritePhotoDragElement
        ){

            return;

        }


        e.preventDefault();


        const touch =
            e.touches[0];


        const items =
            [
                ...
                document.querySelectorAll(
                    ".favorite-photo-item"
                )
            ];


        let target = null;


        items.forEach(item => {

            if(
                item ===
                favoritePhotoDragElement
            ){

                return;

            }


            const rect =
                item.getBoundingClientRect();


            if(
                touch.clientX >= rect.left &&
                touch.clientX <= rect.right &&
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom
            ){

                target = item;

            }

        });


        if(!target){
            return;
        }


        const parent =
            target.parentNode;


        if(
            target ===
            favoritePhotoDragElement
        ){

            return;

        }


        const targetRect =
            target.getBoundingClientRect();


        const before =
            touch.clientY <
            targetRect.top +
            targetRect.height / 2;


        if(before){

            parent.insertBefore(
                favoritePhotoDragElement,
                target
            );

        }else{

            parent.insertBefore(
                favoritePhotoDragElement,
                target.nextSibling
            );

        }

    },
    {
        passive:false
    }
);


/*
   タッチ終了
*/

document.addEventListener(
    "touchend",
    function(){

        clearTimeout(
            favoritePhotoTouchTimer
        );


        if(
            favoritePhotoDragElement
        ){

            favoritePhotoDragElement
            .classList
            .remove(
                "photo-dragging"
            );

        }


        favoritePhotoDragging =
            false;

        favoritePhotoDragElement =
            null;

    },
    {
        passive:true
    }
);


/* =========================================================
   ⭐ イベント並べ替え用簡易ドラッグ
========================================================= */

document.addEventListener(
    "pointerdown",
    function(e){

        if(
            !favoriteEventSortSelecting
        ){

            return;

        }


        const item =
            e.target.closest(
                ".favorite-event-item"
            );


        if(!item){
            return;
        }


        favoriteEventDragging =
            true;

        favoriteEventDragElement =
            item;


        item.setPointerCapture?.(
            e.pointerId
        );

    }
);


document.addEventListener(
    "pointermove",
    function(e){

        if(
            !favoriteEventDragging ||
            !favoriteEventDragElement
        ){

            return;

        }


        const container =
            document.getElementById(
                "favorite-event-list"
            );


        if(!container){
            return;
        }


        const items =
            [
                ...container.querySelectorAll(
                    "[data-favorite-event-id]"
                )
            ];


        let target = null;


        items.forEach(item => {

            if(
                item ===
                favoriteEventDragElement
            ){

                return;

            }


            const rect =
                item.getBoundingClientRect();


            if(
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            ){

                target = item;

            }

        });


        if(!target){
            return;
        }


        const rect =
            target.getBoundingClientRect();


        if(
            e.clientY <
            rect.top +
            rect.height / 2
        ){

            container.insertBefore(
                favoriteEventDragElement,
                target
            );

        }else{

            container.insertBefore(
                favoriteEventDragElement,
                target.nextSibling
            );

        }

    }
);


document.addEventListener(
    "pointerup",
    function(){

        favoriteEventDragging =
            false;

        favoriteEventDragElement =
            null;

    }
);


/* =========================================================
   ⭐ イベント共有モード
========================================================= */

function favoriteEventShareMode(){

    favoriteEventDeleteSelecting =
        false;

    favoriteEventSortSelecting =
        false;

    favoriteEventShareSelecting =
        true;

    selectedFavoriteEventIds = [];

    renderFavoriteEvents();

}


function toggleFavoriteEventShare(id){

    id = String(id);


    const index =
        selectedFavoriteEventIds.indexOf(
            id
        );


    if(index >= 0){

        selectedFavoriteEventIds.splice(
            index,
            1
        );

    }else{

        selectedFavoriteEventIds.push(
            id
        );

    }


    renderFavoriteEvents();

}


/* =========================================================
   ⭐ 写真共有モード
========================================================= */

function favoritePhotoShareMode(){

    favoritePhotoDeleteSelecting =
        false;

    favoritePhotoSortSelecting =
        false;

    favoritePhotoShareSelecting =
        true;

    selectedFavoritePhotoIds = [];

    renderFavoritePhotos();

}


function toggleFavoritePhotoShare(id){

    id = String(id);


    const index =
        selectedFavoritePhotoIds.indexOf(
            id
        );


    if(index >= 0){

        selectedFavoritePhotoIds.splice(
            index,
            1
        );

    }else{

        selectedFavoritePhotoIds.push(
            id
        );

    }


    renderFavoritePhotos();

}


/* =========================================================
   ⭐ お気に入り写真共有
========================================================= */

async function shareFavoriteSelectedPhotos(){

    if(
        selectedFavoritePhotoIds.length === 0
    ){

        alert(
            "共有する写真を選択してください"
        );

        return;

    }


    const favorites =
        getFavoritePhotoItems();


    const targets =
        favorites.filter(
            favorite =>
                selectedFavoritePhotoIds
                .includes(
                    String(favorite.id)
                )
        );


    try{

        const files = [];


        for(
            let i = 0;
            i < targets.length;
            i++
        ){

            const photo =
                getFavoritePhotoData(
                    targets[i]
                );


            if(!photo){
                continue;
            }


            const response =
                await fetch(
                    photo.src
                );


            const blob =
                await response.blob();


            files.push(
                new File(
                    [blob],
                    `oshi-favorite-${i+1}.jpg`,
                    {
                        type:
                            blob.type ||
                            "image/jpeg"
                    }
                )
            );

        }


        if(
            !files.length
        ){

            alert(
                "共有できる写真がありません"
            );

            return;

        }


        if(
            !navigator.share ||
            !navigator.canShare ||
            !navigator.canShare({
                files: files
            })
        ){

            alert(
                "この端末では複数写真の共有に対応していません"
            );

            return;

        }


        await navigator.share({

            files: files,

            title:
                "推し活手帳",

            text:
                "お気に入り写真"

        });


        favoritePhotoShareSelecting =
            false;

        selectedFavoritePhotoIds = [];


        renderFavoritePhotos();


    }catch(error){

        console.log(
            "お気に入り写真共有エラー:",
            error
        );

    }

}


/* =========================================================
   ⭐ お気に入りイベント共有
========================================================= */

async function shareFavoriteSelectedEvents(){

    if(
        selectedFavoriteEventIds.length === 0
    ){

        alert(
            "共有するイベントを選択してください"
        );

        return;

    }


    const favorites =
        getFavoriteEvents();


    const targets =
        favorites.filter(
            favorite =>
                selectedFavoriteEventIds
                .includes(
                    String(favorite.id)
                )
        );


    const text =
        targets
        .map(
            favorite => {

                const event =
                    getFavoriteEventData(
                        favorite
                    );


                if(!event){
                    return "";
                }


                return (
                    `📅 ${event.title || "無題"}\n` +
                    (
                        event.start
                        ?
                        formatFavoriteEventDate(
                            event.start
                        )
                        :
                        ""
                    ) +
                    (
                        event.place
                        ?
                        `\n📍 ${event.place}`
                        :
                        ""
                    )
                );

            }
        )
        .filter(Boolean)
        .join("\n\n");


    if(
        !text
    ){

        alert(
            "共有できるイベントがありません"
        );

        return;

    }


    if(
        navigator.share
    ){

        try{

            await navigator.share({

                title:
                    "推し活手帳",

                text:
                    text

            });

        }catch(error){

            console.log(
                "共有キャンセル:",
                error
            );

            return;

        }

    }else{

        alert(text);

    }


    favoriteEventShareSelecting =
        false;

    selectedFavoriteEventIds = [];


    renderFavoriteEvents();

}


/* =========================================================
   ⭐ お気に入り写真ビューア
========================================================= */

let favoriteViewerIds = [];

let favoriteViewerIndex = 0;

let favoriteViewerCurrentId = null;


function openFavoritePhotoViewerNew(
    favoriteId
){

    const favorites =
        getOrderedFavoritePhotos();


    const index =
        favorites.findIndex(
            item =>
                String(item.id) ===
                String(favoriteId)
        );


    if(index < 0){
        return;
    }


    const photo =
        getFavoritePhotoData(
            favorites[index]
        );


    if(!photo){
        return;
    }


    favoriteViewerIds =
        favorites.map(
            item => String(item.id)
        );


    favoriteViewerIndex =
        index;


    favoriteViewerCurrentId =
        String(
            favorites[index].id
        );


    const viewer =
        document.getElementById(
            "photoViewer"
        );


    const image =
        document.getElementById(
            "photoViewerImage"
        );


    if(
        !viewer ||
        !image
    ){

        return;

    }


    image.src =
        photo.src;


    image.style.transform =
        "translate(0px,0px) scale(1)";


    viewer.style.display =
        "flex";


    viewer.style.zIndex =
        "9999";


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   ⭐ お気に入り写真ビューア切り替え
========================================================= */

function showFavoritePhoto(index){

    if(
        favoriteViewerIds.length === 0
    ){

        return;

    }


    if(
        index >=
        favoriteViewerIds.length
    ){

        index = 0;

    }


    if(index < 0){

        index =
            favoriteViewerIds.length - 1;

    }


    favoriteViewerIndex =
        index;


    const id =
        favoriteViewerIds[index];


    const favorites =
        getOrderedFavoritePhotos();


    const favorite =
        favorites.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if(!favorite){
        return;
    }


    const photo =
        getFavoritePhotoData(
            favorite
        );


    if(!photo){
        return;
    }


    favoriteViewerCurrentId =
        String(
            favorite.id
        );


    const image =
        document.getElementById(
            "photoViewerImage"
        );


    if(image){

        image.src =
            photo.src;

        image.style.transform =
            "translate(0px,0px) scale(1)";

    }

}


/* =========================================================
   ⭐ 全モード終了
========================================================= */

function cancelFavoriteAllModes(){

    favoriteEventDeleteSelecting =
        false;

    favoriteEventShareSelecting =
        false;

    favoriteEventSortSelecting =
        false;

    favoritePhotoDeleteSelecting =
        false;

    favoritePhotoShareSelecting =
        false;

    favoritePhotoSortSelecting =
        false;


    selectedFavoriteEventIds = [];

    selectedFavoritePhotoIds = [];


    renderFavoriteEvents();

    renderFavoritePhotos();

}


/* =========================================================
   ⭐ 初期化
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        /*
           お気に入りページを開いた時に
           必ず現在の1日手帳データから
           favorite=true の写真を拾えるようにする。
        */

        collectFavoriteSourcePhotos();

    }
);