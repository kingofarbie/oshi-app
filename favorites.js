/* =========================================================
   ⭐ お気に入りページ
   完全新仕様版
   =========================================================

   【重要】
   ・古いデータとの互換処理は行わない
   ・イベントと写真を完全分離
   ・1日手帳由来とお気に入り直接追加を区別
   ・お気に入りページでは両方を混在表示
   ・自由並べ替えは最終表示順をそのまま保存
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

    const data = db.load();

    const favorites =
        data.favorites?.events || [];

    return favorites.filter(item => {

        if(!item){
            return false;
        }

        return true;

    });

}


/* =========================================================
   ⭐ お気に入り写真取得
========================================================= */

function getFavoritePhotos(){

    const data = db.load();

    const favorites =
        data.favorites?.photos || [];

    return favorites.filter(item => {

        if(!item){
            return false;
        }

        return true;

    });

}


/* =========================================================
   ⭐ 1日手帳イベントを取得
========================================================= */

function getFavoriteSourceEvent(favorite){

    if(
        !favorite ||
        favorite.source !== "dayPlanner" ||
        favorite.sourceEventId == null
    ){

        return null;

    }


    const data = db.load();

    const events =
        data.events || [];


    return events.find(
        event =>
            String(event.id) ===
            String(favorite.sourceEventId)
    ) || null;

}


/* =========================================================
   ⭐ 1日手帳写真を取得
========================================================= */

function getFavoriteSourcePhoto(favorite){

    if(
        !favorite ||
        favorite.source !== "dayPlanner" ||
        favorite.sourcePhotoId == null
    ){

        return null;

    }


    const data = db.load();


    const memories =
        data.dayMemories || {};


    for(
        const day of Object.values(memories)
    ){

        const photos =
            day?.photos || [];


        const photo =
            photos.find(
                item =>
                    String(item.id) ===
                    String(favorite.sourcePhotoId)
            );


        if(photo){

            return {

                photo: photo,

                day: day,

                dayKey:
                    Object.keys(memories)
                    .find(
                        key =>
                            memories[key] === day
                    )

            };

        }

    }


    return null;

}


/* =========================================================
   ⭐ お気に入りイベントの実体を取得
========================================================= */

function getFavoriteEventData(favorite){

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
   ⭐ お気に入り写真の実体を取得
========================================================= */

function getFavoritePhotoData(favorite){

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
   ⭐ イベント表示順を取得
========================================================= */

function getOrderedFavoriteEvents(){

    const data = db.load();

    const favorites =
        data.favorites?.events || [];


    if(!Array.isArray(favorites)){
        return [];
    }


    const order =
        data.favorites?.eventOrder || [];


    /*
       eventOrder に保存されているID順にする
    */

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


        /*
           orderに存在しない新規データがあれば
           最後に追加
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

    return [...favorites];

}


/* =========================================================
   ⭐ 写真表示順を取得
========================================================= */

function getOrderedFavoritePhotos(){

    const data = db.load();

    const favorites =
        data.favorites?.photos || [];


    if(!Array.isArray(favorites)){
        return [];
    }


    const order =
        data.favorites?.photoOrder || [];


    /*
       保存済み順序を最優先
    */

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


        /*
           新規追加分は最後
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


    return [...favorites];

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
            item => item.id
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


            /*
               1日手帳由来なのに
               元イベントが存在しない場合
            */

            if(
                favorite.source ===
                    "dayPlanner" &&
                !event
            ){

                /*
                   ここでは勝手に削除しない。
                   新仕様では本来発生しない状態。
                */

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
            favoriteEventDeleteSelecting &&
            selected
            ?
            "favorite-item-selected"
            :
            ""
        }

        ${
            favoriteEventShareSelecting &&
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

}


/* =========================================================
   ⭐ イベント日時表示
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
            item => item.id
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


            /*
               1日手帳由来なのに
               元写真が存在しない場合
            */

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


            html += `

<div
    class="
        favorite-photo-item

        ${
            favoritePhotoDeleteSelecting &&
            selected
            ?
            "favorite-item-selected"
            :
            ""
        }

        ${
            favoritePhotoShareSelecting &&
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
            !favoritePhotoShareSelecting
            ?
            `onclick="openFavoritePhotoViewerNew('${favorite.id}')"`
            :
            ""
        }
    >

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

}


/* =========================================================
   ⭐ お気に入りイベント直接追加
========================================================= */

function openFavoriteAddEvent(){

    /*
       次の段階で専用入力モーダルを接続する。

       ここでは関数名だけ確保しておく。
    */

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
   ⭐ お気に入り写真直接追加
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

        data.favorites = {

            events: [],

            photos: [],

            eventOrder: [],

            photoOrder: []

        };

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
                            Date.now()
                            +
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
                            id
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


/* =========================================================
   ⭐ イベント削除選択
========================================================= */

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


    /*
       1日手帳由来と直接追加を分離
    */

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


    if(
        !confirm(message)
    ){

        return;

    }


    /*
       =========================
       1日手帳由来イベント削除
       =========================
    */

    if(
        dayPlannerTargets.length
    ){

        if(
            !Array.isArray(data.events)
        ){

            data.events = [];

        }


        dayPlannerTargets.forEach(
            favorite => {

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

    }


    /*
       =========================
       お気に入り側削除
       =========================
    */

    data.favorites.events =
        favorites.filter(
            favorite =>
                !selectedFavoriteEventIds
                .includes(
                    String(favorite.id)
                )
        );


    /*
       並び順からも削除
    */

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


    /*
       他画面も更新
    */

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


/* =========================================================
   ⭐ イベント削除キャンセル
========================================================= */

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


/* =========================================================
   ⭐ 写真削除選択
========================================================= */

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
        data.favorites?.photos || [];


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


    if(
        !confirm(message)
    ){

        return;

    }


    /*
       =========================
       1日手帳写真を削除
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
                !source.day
            ){

                return;

            }


            if(
                !source.day.photos
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
       お気に入り写真を削除
       =========================
    */

    data.favorites.photos =
        favorites.filter(
            favorite =>
                !selectedFavoritePhotoIds
                .includes(
                    String(favorite.id)
                )
        );


    /*
       並び順からも削除
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
       1日手帳側も更新
    */

    if(
        typeof renderDayMemory ===
        "function"
    ){

        renderDayMemory();

    }

}


/* =========================================================
   ⭐ 写真削除キャンセル
========================================================= */

function cancelFavoritePhotoDelete(){

    favoritePhotoDeleteSelecting =
        false;

    selectedFavoritePhotoIds = [];

    renderFavoritePhotos();

}


/* =========================================================
   ⭐ イベント並べ替えモード
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


/* =========================================================
   ⭐ 写真並べ替えモード
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


/* =========================================================
   ⭐ イベント自由並べ替え保存
========================================================= */

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
                item.dataset.favoriteEventId
        );


    if(
        !data.favorites
    ){

        data.favorites = {

            events: [],

            photos: [],

            eventOrder: [],

            photoOrder: []

        };

    }


    data.favorites.eventOrder =
        order;


    db.save(data);


    favoriteEventSortSelecting =
        false;


    renderFavoriteEvents();

}


/* =========================================================
   ⭐ 写真自由並べ替え保存
========================================================= */

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
                item.dataset.favoritePhotoId
        );


    if(
        !data.favorites
    ){

        data.favorites = {

            events: [],

            photos: [],

            eventOrder: [],

            photoOrder: []

        };

    }


    data.favorites.photoOrder =
        order;


    db.save(data);


    favoritePhotoSortSelecting =
        false;


    renderFavoritePhotos();

}


/* =========================================================
   ⭐ お気に入りイベント共有モード
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


/* =========================================================
   ⭐ お気に入り写真共有モード
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


/* =========================================================
   ⭐ イベント共有選択
========================================================= */

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
   ⭐ 写真共有選択
========================================================= */

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
   ⭐ 写真ビューア
   お気に入り専用
========================================================= */

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


    /*
       既存PhotoViewerとは別管理にする。
    */

    favoriteViewerIds =
        favorites.map(
            item => item.id
        );


    favoriteViewerIndex =
        index;


    favoriteViewerCurrentId =
        favorites[index].id;


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


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   ⭐ お気に入り写真ビューア状態
========================================================= */

let favoriteViewerIds = [];

let favoriteViewerIndex = 0;

let favoriteViewerCurrentId = null;


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
        favorite.id;


    const image =
        document.getElementById(
            "photoViewerImage"
        );


    if(image){

        image.src =
            photo.src;

    }

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
        getFavoritePhotos();


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

        }

    }else{

        alert(
            text
        );

    }


    favoriteEventShareSelecting =
        false;

    selectedFavoriteEventIds = [];


    renderFavoriteEvents();

}


/* =========================================================
   ⭐ 共通終了
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