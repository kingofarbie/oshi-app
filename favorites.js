/* =========================================================
   ⭐ favorites.js
   お気に入りページ 完全独立版
   =========================================================

   【重要】
   ・photo.jsは変更しない
   ・photo.jsの状態変数を使用しない
   ・photo.jsの写真関数を使用しない
   ・お気に入り用に変数名をすべて変更
   ・お気に入り用に関数名をすべて変更
   ・ビューアも完全独立
   ・スワイプも完全独立
   ・拡大縮小も完全独立
   ・削除も完全独立
   ・共有も完全独立
   ・並べ替えも完全独立

   =========================================================
   【photo.js → favorites.js 受け渡し】

   photo.js側に存在する値を必要に応じて
   favorites.js専用の定数へ受け渡す。

   ※ favorites.js内部では下記の専用名だけを使用する。

   PHOTO_COLUMNS
        ↓
   FAVORITE_PHOTO_COLUMNS

   PHOTO_ROWS
        ↓
   FAVORITE_PHOTO_ROWS

   =========================================================
*/


/* =========================================================
   ⭐ photo.js から受け取る表示設定
========================================================= */

const FAVORITE_PHOTO_COLUMNS =
    typeof PHOTO_COLUMNS !== "undefined"
    ? PHOTO_COLUMNS
    : 3;

const FAVORITE_PHOTO_ROWS =
    typeof PHOTO_ROWS !== "undefined"
    ? PHOTO_ROWS
    : 3;


/* =========================================================
   ⭐ お気に入り専用状態
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
   ⭐ お気に入り専用表示順
========================================================= */

let favoriteEventDisplayOrder = [];
let favoritePhotoDisplayOrder = [];


/* =========================================================
   ⭐ お気に入り専用表示
========================================================= */

let favoriteShowAllPhotos = false;


/* =========================================================
   ⭐ お気に入り専用ビューア状態
========================================================= */

let favoritePhotoViewerIds = [];

let favoritePhotoViewerIndex = 0;

let favoritePhotoViewerCurrentId = null;

let favoritePhotoViewerScale = 1;

let favoritePhotoViewerTranslateX = 0;

let favoritePhotoViewerTranslateY = 0;

let favoritePhotoViewerLastDistance = 0;

let favoritePhotoViewerTouchStartX = 0;

let favoritePhotoViewerDragStartX = 0;

let favoritePhotoViewerDragStartY = 0;

let favoritePhotoViewerLastTapTime = 0;

let favoritePhotoViewerIsOpen = false;


/* =========================================================
   ⭐ お気に入り専用並べ替え状態
========================================================= */

let favoritePhotoDraggingId = null;

let favoritePhotoDraggingElement = null;

let favoritePhotoIsDragging = false;

let favoritePhotoTouchMoved = false;

let favoritePhotoTouchStartX = 0;

let favoritePhotoTouchStartY = 0;

let favoritePhotoLongPressTimer = null;


/* =========================================================
   ⭐ お気に入りページ表示
========================================================= */

function displayFavorites(){

    favoriteRenderEvents();

    favoriteRenderPhotos();

}


/* =========================================================
   ⭐ お気に入りイベント取得
========================================================= */

function favoriteGetEvents(){

    const data =
        db.load();

    const favorites =
        data.favorites?.events || [];

    if(!Array.isArray(favorites)){
        return [];
    }

    return favorites.filter(
        item => !!item
    );

}


/* =========================================================
   ⭐ お気に入り写真取得
========================================================= */

function favoriteGetPhotos(){

    const data =
        db.load();

    const favorites =
        data.favorites?.photos || [];

    if(!Array.isArray(favorites)){
        return [];
    }

    return favorites.filter(
        item => !!item
    );

}


/* =========================================================
   ⭐ 1日手帳イベント取得
========================================================= */

function favoriteGetSourceEvent(favorite){

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
   ⭐ 1日手帳写真取得
========================================================= */

function favoriteGetSourcePhoto(favorite){

    if(
        !favorite ||
        favorite.source !== "dayPlanner" ||
        favorite.sourcePhotoId == null
    ){

        return null;

    }

    const data =
        db.load();

    const memories =
        data.dayMemories || {};

    for(
        const [dayKey, day]
        of Object.entries(memories)
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
                dayKey: dayKey
            };

        }

    }

    return null;

}


/* =========================================================
   ⭐ お気に入りイベント実体
========================================================= */

function favoriteGetEventData(favorite){

    if(!favorite){
        return null;
    }

    if(
        favorite.source === "dayPlanner"
    ){

        return favoriteGetSourceEvent(
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
   ⭐ お気に入り写真実体
========================================================= */

function favoriteGetPhotoData(favorite){

    if(!favorite){
        return null;
    }

    if(
        favorite.source === "dayPlanner"
    ){

        const result =
            favoriteGetSourcePhoto(
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

function favoriteGetOrderedEvents(){

    const data =
        db.load();

    const favorites =
        data.favorites?.events || [];

    if(!Array.isArray(favorites)){
        return [];
    }

    const order =
        data.favorites?.eventOrder || [];

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

function favoriteGetOrderedPhotos(){

    const data =
        db.load();

    const favorites =
        data.favorites?.photos || [];

    if(!Array.isArray(favorites)){
        return [];
    }

    const order =
        data.favorites?.photoOrder || [];

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
   ⭐ イベント表示
========================================================= */

function favoriteRenderEvents(){

    const box =
        document.getElementById(
            "favorite-event-list"
        );

    if(!box){
        return;
    }

    const favorites =
        favoriteGetOrderedEvents();

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
                favoriteGetEventData(
                    favorite
                );

            if(
                favorite.source === "dayPlanner" &&
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
                favorite.source === "dayPlanner"
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
        `onclick="favoriteToggleEventDelete('${favorite.id}')"`
        :
        favoriteEventShareSelecting
        ?
        `onclick="favoriteToggleEventShare('${favorite.id}')"`
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
            favoriteFormatEventDate(
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
   ⭐ イベント日時
========================================================= */

function favoriteFormatEventDate(value){

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
   ⭐ 写真表示
========================================================= */

function favoriteRenderPhotos(){

    const box =
        document.getElementById(
            "favorite-photo-list"
        );

    if(!box){
        return;
    }

    const favorites =
        favoriteGetOrderedPhotos();

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


    /*
       ⭐ 選択・並べ替えモードバー
    */

    if(
        favoritePhotoDeleteSelecting
    ){

        html += `
        <div class="photo-delete-bar">

            <span class="photo-delete-title">
                🗑 写真を選択中
            </span>

            <span class="photo-delete-count">
                ${selectedFavoritePhotoIds.length}枚選択
            </span>

            <button
                type="button"
                onclick="favoriteCancelPhotoDelete()">
                キャンセル
            </button>

            <button
                type="button"
                onclick="favoriteConfirmPhotoDelete()"
                ${
                    selectedFavoritePhotoIds.length === 0
                    ?
                    "disabled"
                    :
                    ""
                }>
                🗑 削除
            </button>

        </div>
        `;

    }


    if(
        favoritePhotoShareSelecting
    ){

        html += `
        <div class="photo-delete-bar">

            <span class="photo-delete-title">
                📤 写真を選択中
            </span>

            <span class="photo-delete-count">
                ${selectedFavoritePhotoIds.length}枚選択
            </span>

            <button
                type="button"
                onclick="favoriteCancelPhotoShare()">
                キャンセル
            </button>

            <button
                type="button"
                onclick="favoriteShareSelectedPhotos()"
                ${
                    selectedFavoritePhotoIds.length === 0
                    ?
                    "disabled"
                    :
                    ""
                }>
                📤 共有
            </button>

        </div>
        `;

    }


    if(
        favoritePhotoSortSelecting
    ){

        html += `
        <div class="photo-free-bar">

            <div>
                📷 自由変更中<br>
                <small>
                    写真をドラッグして並べ替えてください
                </small>
            </div>

            <button
                type="button"
                onclick="favoriteFinishPhotoSort()">
                完了
            </button>

        </div>
        `;

    }


    /*
       ⭐ 写真
    */

    favorites.forEach(
        favorite => {

            const photo =
                favoriteGetPhotoData(
                    favorite
                );

            if(
                favorite.source === "dayPlanner" &&
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

        ${
            favoritePhotoSortSelecting
            ?
            "favorite-photo-sort-item"
            :
            ""
        }
    "

    data-favorite-photo-id="${favorite.id}"

    ${
        favoritePhotoDeleteSelecting
        ?
        `onclick="favoriteTogglePhotoDelete('${favorite.id}')"`
        :
        favoritePhotoShareSelecting
        ?
        `onclick="favoriteTogglePhotoShare('${favorite.id}')"`
        :
        ""
    }
>

    <img
        src="${photo.src}"
        class="favorite-photo-image"

        style="
            width:100%;
            max-width:100%;
            height:auto;
            object-fit:cover;
        "

        draggable="false"

        ${
            !favoritePhotoDeleteSelecting &&
            !favoritePhotoShareSelecting &&
            !favoritePhotoSortSelecting
            ?
            `onclick="favoriteOpenPhotoViewer('${favorite.id}')"`
            :
            ""
        }
    >

    ${
        favoritePhotoDeleteSelecting ||
        favoritePhotoShareSelecting
        ?
        `
        <div class="photo-delete-check">
            ${
                selected
                ?
                "✓"
                :
                ""
            }
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
            写真はありません
        </div>
        `;

}


/* =========================================================
   ⭐ お気に入り直接イベント追加
========================================================= */

function favoriteOpenAddEvent(){

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

function favoriteOpenPhotoPicker(){

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

                            favoriteRenderPhotos();

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
   ⭐ イベント削除
========================================================= */

function favoriteEventDeleteMode(){

    favoriteEventDeleteSelecting =
        true;

    favoriteEventShareSelecting =
        false;

    favoriteEventSortSelecting =
        false;

    selectedFavoriteEventIds = [];

    favoriteRenderEvents();

}


function favoriteToggleEventDelete(id){

    id =
        String(id);

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

    favoriteRenderEvents();

}


function favoriteConfirmEventDelete(){

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

    if(
        !confirm(message)
    ){

        return;

    }

    if(
        dayPlannerTargets.length
    ){

        if(
            !Array.isArray(
                data.events
            )
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

    favoriteRenderEvents();

}


/* =========================================================
   ⭐ イベント削除キャンセル
========================================================= */

function favoriteCancelEventDelete(){

    favoriteEventDeleteSelecting =
        false;

    selectedFavoriteEventIds = [];

    favoriteRenderEvents();

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

    favoriteRenderPhotos();

}


function favoriteTogglePhotoDelete(id){

    id =
        String(id);

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

    favoriteRenderPhotos();

}


/* =========================================================
   ⭐ 写真削除
========================================================= */

function favoriteConfirmPhotoDelete(){

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

    if(!data.favorites){
        return;
    }

    const favorites =
        data.favorites.photos || [];

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


    /* =========================
       1日手帳側を削除
    ========================= */

    dayPlannerTargets.forEach(
        favorite => {

            const source =
                favoriteGetSourcePhoto(
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


    /* =========================
       お気に入り側を削除
    ========================= */

    data.favorites.photos =
        favorites.filter(
            favorite =>
                !selectedFavoritePhotoIds
                .includes(
                    String(favorite.id)
                )
        );


    /* =========================
       並び順から削除
    ========================= */

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


    favoriteRenderPhotos();


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

function favoriteCancelPhotoDelete(){

    favoritePhotoDeleteSelecting =
        false;

    selectedFavoritePhotoIds = [];

    favoriteRenderPhotos();

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

    favoriteRenderEvents();

}


function favoriteSaveEventOrder(){

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

    data.favorites.eventOrder =
        items.map(
            item =>
                item.dataset.favoriteEventId
        );

    db.save(data);

    favoriteEventSortSelecting =
        false;

    favoriteRenderEvents();

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

    favoriteRenderPhotos();

}


/* =========================================================
   ⭐ 写真並べ替え保存
========================================================= */

function favoriteSavePhotoOrder(){

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

    data.favorites.photoOrder =
        items.map(
            item =>
                item.dataset.favoritePhotoId
        );

    db.save(data);

    favoritePhotoSortSelecting =
        false;

    favoriteRenderPhotos();

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

    favoriteRenderPhotos();

}


function favoriteTogglePhotoShare(id){

    id =
        String(id);

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

    favoriteRenderPhotos();

}


function favoriteCancelPhotoShare(){

    favoritePhotoShareSelecting =
        false;

    selectedFavoritePhotoIds = [];

    favoriteRenderPhotos();

}


/* =========================================================
   ⭐ 写真共有
========================================================= */

async function favoriteShareSelectedPhotos(){

    if(
        selectedFavoritePhotoIds.length === 0
    ){

        alert(
            "共有する写真を選択してください"
        );

        return;

    }

    const favorites =
        favoriteGetPhotos();

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
                favoriteGetPhotoData(
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

        favoriteRenderPhotos();

    }catch(error){

        console.log(
            "お気に入り写真共有エラー:",
            error
        );

    }

}


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

    favoriteRenderEvents();

}


function favoriteToggleEventShare(id){

    id =
        String(id);

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

    favoriteRenderEvents();

}


/* =========================================================
   ⭐ イベント共有
========================================================= */

async function favoriteShareSelectedEvents(){

    if(
        selectedFavoriteEventIds.length === 0
    ){

        alert(
            "共有するイベントを選択してください"
        );

        return;

    }

    const favorites =
        favoriteGetEvents();

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
                    favoriteGetEventData(
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
                        favoriteFormatEventDate(
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
                "お気に入りイベント共有キャンセル:",
                error
            );

        }

    }else{

        alert(text);

    }

    favoriteEventShareSelecting =
        false;

    selectedFavoriteEventIds = [];

    favoriteRenderEvents();

}


/* =========================================================
   ⭐ お気に入り写真ビューア
========================================================= */

function favoriteOpenPhotoViewer(
    favoriteId
){

    const favorites =
        favoriteGetOrderedPhotos();

    const index =
        favorites.findIndex(
            item =>
                String(item.id) ===
                String(favoriteId)
        );

    if(index < 0){
        return;
    }

    const favorite =
        favorites[index];

    const photo =
        favoriteGetPhotoData(
            favorite
        );

    if(!photo){
        return;
    }


    /*
       ⭐ お気に入り専用ビューア配列
       photo.jsのgetViewerPhotos()は使わない
    */

    favoritePhotoViewerIds =
        favorites.map(
            item => item.id
        );

    favoritePhotoViewerIndex =
        index;

    favoritePhotoViewerCurrentId =
        favorite.id;

    favoritePhotoViewerScale =
        1;

    favoritePhotoViewerTranslateX =
        0;

    favoritePhotoViewerTranslateY =
        0;

    favoritePhotoViewerLastDistance =
        0;

    favoritePhotoViewerIsOpen =
        true;


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


    favoriteApplyViewerTransform();


    /*
       ⭐ お気に入りビューアでは
       削除アイコンを必ず表示
    */

    const deleteBtn =
        document.querySelector(
            ".photo-delete"
        );

    if(deleteBtn){

        deleteBtn.style.display =
            "flex";

    }


    const closeBtn =
        document.querySelector(
            ".photo-close"
        );

    if(closeBtn){

        closeBtn.style.right =
            "72px";

    }


    viewer.style.display =
        "flex";

    viewer.style.zIndex =
        "9999";

    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   ⭐ ビューア変形適用
========================================================= */

function favoriteApplyViewerTransform(){

    const image =
        document.getElementById(
            "photoViewerImage"
        );

    if(!image){
        return;
    }

    image.style.transform =
        `translate(${favoritePhotoViewerTranslateX}px,${favoritePhotoViewerTranslateY}px) scale(${favoritePhotoViewerScale})`;

}


/* =========================================================
   ⭐ お気に入りビューア表示
========================================================= */

function favoriteShowPhoto(index){

    if(
        favoritePhotoViewerIds.length === 0
    ){

        return;

    }

    if(
        index >=
        favoritePhotoViewerIds.length
    ){

        index = 0;

    }

    if(index < 0){

        index =
            favoritePhotoViewerIds.length - 1;

    }

    favoritePhotoViewerIndex =
        index;

    const id =
        favoritePhotoViewerIds[index];

    const favorites =
        favoriteGetOrderedPhotos();

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
        favoriteGetPhotoData(
            favorite
        );

    if(!photo){
        return;
    }

    favoritePhotoViewerCurrentId =
        favorite.id;

    favoritePhotoViewerScale =
        1;

    favoritePhotoViewerTranslateX =
        0;

    favoritePhotoViewerTranslateY =
        0;

    favoritePhotoViewerLastDistance =
        0;

    const image =
        document.getElementById(
            "photoViewerImage"
        );

    if(image){

        image.src =
            photo.src;

        favoriteApplyViewerTransform();

    }

}


/* =========================================================
   ⭐ お気に入り専用スワイプ
========================================================= */

function favoritePhotoSwipe(
    event
){

    if(
        !favoritePhotoViewerIsOpen
    ){

        return;

    }

    if(
        favoritePhotoViewerScale > 1
    ){

        return;

    }

    if(
        !event.changedTouches ||
        event.changedTouches.length !== 1
    ){

        return;

    }

    const touchEndX =
        event.changedTouches[0].clientX;

    const diff =
        touchEndX -
        favoritePhotoViewerTouchStartX;

    if(
        Math.abs(diff) < 60
    ){

        return;

    }

    if(diff < 0){

        favoriteShowPhoto(
            favoritePhotoViewerIndex + 1
        );

    }else{

        favoriteShowPhoto(
            favoritePhotoViewerIndex - 1
        );

    }

}


/* =========================================================
   ⭐ お気に入り専用ピンチ・ドラッグ
========================================================= */

function favoritePhotoPinch(
    event
){

    if(
        !favoritePhotoViewerIsOpen
    ){

        return;

    }

    const image =
        document.getElementById(
            "photoViewerImage"
        );

    if(!image){
        return;
    }


    /*
       2本指ピンチ
    */

    if(
        event.touches.length === 2
    ){

        event.preventDefault();

        const dx =
            event.touches[0].clientX -
            event.touches[1].clientX;

        const dy =
            event.touches[0].clientY -
            event.touches[1].clientY;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if(
            favoritePhotoViewerLastDistance !== 0
        ){

            favoritePhotoViewerScale *=
                distance /
                favoritePhotoViewerLastDistance;

            if(
                favoritePhotoViewerScale < 1
            ){

                favoritePhotoViewerScale =
                    1;

            }

            if(
                favoritePhotoViewerScale > 4
            ){

                favoritePhotoViewerScale =
                    4;

            }

            favoriteApplyViewerTransform();

        }

        favoritePhotoViewerLastDistance =
            distance;

        return;

    }


    /*
       1本指ドラッグ
    */

    if(
        favoritePhotoViewerScale > 1 &&
        event.touches.length === 1
    ){

        event.preventDefault();

        const x =
            event.touches[0].clientX;

        const y =
            event.touches[0].clientY;

        favoritePhotoViewerTranslateX +=
            x -
            favoritePhotoViewerDragStartX;

        favoritePhotoViewerTranslateY +=
            y -
            favoritePhotoViewerDragStartY;

        favoritePhotoViewerDragStartX =
            x;

        favoritePhotoViewerDragStartY =
            y;

        favoriteApplyViewerTransform();

    }

}


/* =========================================================
   ⭐ お気に入り専用ドラッグ開始
========================================================= */

function favoritePhotoDragStart(
    event
){

    if(
        !favoritePhotoViewerIsOpen
    ){

        return;

    }

    if(
        favoritePhotoViewerScale <= 1
    ){

        if(
            event.touches.length === 1
        ){

            favoritePhotoViewerTouchStartX =
                event.touches[0].clientX;

        }

        return;

    }

    if(
        event.touches.length !== 1
    ){

        return;

    }

    event.preventDefault();

    favoritePhotoViewerDragStartX =
        event.touches[0].clientX;

    favoritePhotoViewerDragStartY =
        event.touches[0].clientY;

}


/* =========================================================
   ⭐ お気に入り専用ドラッグ終了
========================================================= */

function favoritePhotoDragEnd(
    event
){

    if(
        event.changedTouches &&
        event.changedTouches.length >= 2
    ){

        favoritePhotoViewerLastDistance =
            0;

    }

}


/* =========================================================
   ⭐ お気に入り専用ダブルタップ
========================================================= */

function favoritePhotoDoubleTap(
    event
){

    if(
        !favoritePhotoViewerIsOpen
    ){

        return;

    }

    if(
        !event.changedTouches ||
        event.changedTouches.length !== 1
    ){

        return;

    }

    const now =
        Date.now();

    if(
        now -
        favoritePhotoViewerLastTapTime <
        300
    ){

        if(
            favoritePhotoViewerScale === 1
        ){

            favoritePhotoViewerScale =
                2;

        }else{

            favoritePhotoViewerScale =
                1;

            favoritePhotoViewerTranslateX =
                0;

            favoritePhotoViewerTranslateY =
                0;

        }

        favoriteApplyViewerTransform();

    }

    favoritePhotoViewerLastTapTime =
        now;

}


/* =========================================================
   ⭐ お気に入りビューアを閉じる
========================================================= */

function favoriteClosePhotoViewer(){

    const viewer =
        document.getElementById(
            "photoViewer"
        );

    if(viewer){

        viewer.style.display =
            "none";

    }

    document.body.style.overflow =
        "";

    favoritePhotoViewerIsOpen =
        false;

    favoritePhotoViewerIds =
        [];

    favoritePhotoViewerIndex =
        0;

    favoritePhotoViewerCurrentId =
        null;

    favoritePhotoViewerScale =
        1;

    favoritePhotoViewerTranslateX =
        0;

    favoritePhotoViewerTranslateY =
        0;

    favoritePhotoViewerLastDistance =
        0;

}


/* =========================================================
   ⭐ お気に入りビューア現在写真削除
========================================================= */

function favoriteDeleteCurrentPhoto(){

    if(
        !favoritePhotoViewerCurrentId
    ){

        return;

    }

    const data =
        db.load();

    const favorites =
        data.favorites?.photos || [];

    const target =
        favorites.find(
            favorite =>
                String(favorite.id) ===
                String(
                    favoritePhotoViewerCurrentId
                )
        );

    if(!target){
        return;
    }

    const isDayPlanner =
        target.source ===
        "dayPlanner";

    let message = "";

    if(isDayPlanner){

        message =
            "この写真は1日手帳からのお気に入りです。\n\n" +
            "お気に入りから削除すると、" +
            "1日手帳からも削除されます。\n\n" +
            "削除してよろしいですか？";

    }else{

        message =
            "この写真をお気に入りから削除しますか？";

    }

    if(
        !confirm(message)
    ){

        return;

    }


    /*
       1日手帳由来
    */

    if(isDayPlanner){

        const source =
            favoriteGetSourcePhoto(
                target
            );

        if(
            source &&
            source.day &&
            Array.isArray(
                source.day.photos
            )
        ){

            source.day.photos =
                source.day.photos.filter(
                    photo =>
                        String(photo.id) !==
                        String(
                            target.sourcePhotoId
                        )
                );

        }

    }


    /*
       お気に入り側
    */

    data.favorites.photos =
        favorites.filter(
            favorite =>
                String(favorite.id) !==
                String(target.id)
        );


    /*
       並び順
    */

    data.favorites.photoOrder =
        (
            data.favorites.photoOrder ||
            []
        ).filter(
            id =>
                String(id) !==
                String(target.id)
        );


    db.save(data);


    /*
       残りの写真
    */

    const remaining =
        favoriteGetOrderedPhotos();


    if(
        remaining.length === 0
    ){

        favoriteClosePhotoViewer();

        favoriteRenderPhotos();

        if(
            typeof renderDayMemory ===
            "function"
        ){

            renderDayMemory();

        }

        return;

    }


    /*
       削除した位置の次を表示
    */

    let nextIndex =
        favoritePhotoViewerIndex;

    if(
        nextIndex >=
        remaining.length
    ){

        nextIndex =
            remaining.length - 1;

    }

    favoritePhotoViewerIds =
        remaining.map(
            item => item.id
        );

    favoriteShowPhoto(
        nextIndex
    );

    favoriteRenderPhotos();


    if(
        typeof renderDayMemory ===
        "function"
    ){

        renderDayMemory();

    }

}


/* =========================================================
   ⭐ お気に入り現在写真共有
========================================================= */

async function favoriteShareCurrentPhoto(){

    if(
        !favoritePhotoViewerCurrentId
    ){

        return;

    }

    const favorites =
        favoriteGetPhotos();

    const favorite =
        favorites.find(
            item =>
                String(item.id) ===
                String(
                    favoritePhotoViewerCurrentId
                )
        );

    if(!favorite){
        return;
    }

    const photo =
        favoriteGetPhotoData(
            favorite
        );

    if(!photo){
        return;
    }

    if(
        !navigator.share
    ){

        alert(
            "この端末では共有機能に対応していません"
        );

        return;

    }

    try{

        const response =
            await fetch(
                photo.src
            );

        const blob =
            await response.blob();

        const file =
            new File(
                [blob],
                "oshi-favorite.jpg",
                {
                    type:
                        blob.type ||
                        "image/jpeg"
                }
            );

        if(
            navigator.canShare &&
            !navigator.canShare({
                files: [file]
            })
        ){

            alert(
                "この端末では写真共有に対応していません"
            );

            return;

        }

        await navigator.share({

            files: [file],

            title:
                "推し活手帳",

            text:
                "お気に入り写真"

        });

    }catch(error){

        console.log(
            "お気に入り写真共有エラー:",
            error
        );

    }

}


/* =========================================================
   ⭐ お気に入り専用ビューアイベント接続
   photo.jsとは独立
========================================================= */

function favoriteInstallViewerEvents(){

    const image =
        document.getElementById(
            "photoViewerImage"
        );

    if(!image){
        return;
    }


    /*
       既存のphoto.js側イベントより先に
       お気に入り専用イベントを処理する。

       お気に入りビューア中は
       photo.js側へイベントを流さない。
    */

    if(
        image.dataset.favoriteViewerEventsInstalled ===
        "true"
    ){

        return;

    }


    image.dataset.favoriteViewerEventsInstalled =
        "true";


    image.addEventListener(
        "touchstart",
        function(event){

            if(
                !favoritePhotoViewerIsOpen
            ){

                return;

            }

            if(
                event.touches.length === 1
            ){

                favoritePhotoViewerTouchStartX =
                    event.touches[0].clientX;

                favoritePhotoViewerDragStartX =
                    event.touches[0].clientX;

                favoritePhotoViewerDragStartY =
                    event.touches[0].clientY;

            }

        },
        {
            capture: true,
            passive: true
        }
    );


    image.addEventListener(
        "touchmove",
        function(event){

            if(
                !favoritePhotoViewerIsOpen
            ){

                return;

            }

            /*
               photo.jsへ流さない
            */

            event.stopImmediatePropagation();

            favoritePhotoPinch(
                event
            );

        },
        {
            capture: true,
            passive: false
        }
    );


    image.addEventListener(
        "touchend",
        function(event){

            if(
                !favoritePhotoViewerIsOpen
            ){

                return;

            }

            event.stopImmediatePropagation();

            favoritePhotoSwipe(
                event
            );

            favoritePhotoDoubleTap(
                event
            );

            favoritePhotoDragEnd(
                event
            );

        },
        {
            capture: true,
            passive: false
        }
    );

}


/* =========================================================
   ⭐ ビューアボタンをお気に入り専用へ接続
========================================================= */

function favoriteInstallViewerButtons(){

    const deleteBtn =
        document.querySelector(
            ".photo-delete"
        );

    const shareBtn =
        document.querySelector(
            ".photo-share"
        );

    const closeBtn =
        document.querySelector(
            ".photo-close"
        );


    if(deleteBtn){

        deleteBtn.onclick =
            function(event){

                if(
                    !favoritePhotoViewerIsOpen
                ){

                    return;

                }

                event.preventDefault();
                event.stopImmediatePropagation();

                favoriteDeleteCurrentPhoto();

            };

    }


    if(shareBtn){

        shareBtn.onclick =
            function(event){

                if(
                    !favoritePhotoViewerIsOpen
                ){

                    return;

                }

                event.preventDefault();
                event.stopImmediatePropagation();

                favoriteShareCurrentPhoto();

            };

    }


    if(closeBtn){

        closeBtn.onclick =
            function(event){

                if(
                    !favoritePhotoViewerIsOpen
                ){

                    return;

                }

                event.preventDefault();
                event.stopImmediatePropagation();

                favoriteClosePhotoViewer();

            };

    }

}


/* =========================================================
   ⭐ 写真自由並べ替えタッチ処理
   favorites.js専用
========================================================= */

function favoriteInstallPhotoSortEvents(){

    if(
        document.body.dataset.favoriteSortEventsInstalled ===
        "true"
    ){

        return;

    }

    document.body.dataset.favoriteSortEventsInstalled =
        "true";


    document.addEventListener(
        "touchstart",
        function(event){

            if(
                !favoritePhotoSortSelecting
            ){

                return;

            }

            const box =
                event.target.closest(
                    ".favorite-photo-item"
                );

            if(!box){
                return;
            }

            favoritePhotoDraggingId =
                String(
                    box.dataset.favoritePhotoId
                );

            favoritePhotoDraggingElement =
                box;

            favoritePhotoTouchMoved =
                false;

            favoritePhotoIsDragging =
                false;

            favoritePhotoTouchStartX =
                event.touches[0].clientX;

            favoritePhotoTouchStartY =
                event.touches[0].clientY;

            favoritePhotoLongPressTimer =
                setTimeout(
                    function(){

                        if(
                            favoritePhotoTouchMoved
                        ){

                            return;

                        }

                        favoritePhotoIsDragging =
                            true;

                        box.classList.add(
                            "photo-dragging"
                        );

                        if(
                            navigator.vibrate
                        ){

                            navigator.vibrate(
                                30
                            );

                        }

                    },
                    250
                );

        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchmove",
        function(event){

            if(
                !favoritePhotoSortSelecting
            ){

                return;

            }

            if(
                !favoritePhotoDraggingElement
            ){

                return;

            }

            if(
                !favoritePhotoIsDragging
            ){

                const dx =
                    Math.abs(
                        event.touches[0].clientX -
                        favoritePhotoTouchStartX
                    );

                const dy =
                    Math.abs(
                        event.touches[0].clientY -
                        favoritePhotoTouchStartY
                    );

                if(
                    dx > 10 ||
                    dy > 10
                ){

                    favoritePhotoTouchMoved =
                        true;

                    clearTimeout(
                        favoritePhotoLongPressTimer
                    );

                    favoritePhotoDraggingId =
                        null;

                    favoritePhotoDraggingElement =
                        null;

                }

                return;

            }

            event.preventDefault();

            const touch =
                event.touches[0];

            const boxes =
                [
                    ...document.querySelectorAll(
                        ".favorite-photo-item"
                    )
                ];

            let targetBox =
                null;

            boxes.forEach(
                box => {

                    if(
                        box ===
                        favoritePhotoDraggingElement
                    ){

                        return;

                    }

                    const rect =
                        box.getBoundingClientRect();

                    if(
                        touch.clientX >= rect.left &&
                        touch.clientX <= rect.right &&
                        touch.clientY >= rect.top &&
                        touch.clientY <= rect.bottom
                    ){

                        targetBox =
                            box;

                    }

                }
            );

            if(!targetBox){
                return;
            }

            const parent =
                favoritePhotoDraggingElement.parentNode;

            const nextAfterDragging =
                favoritePhotoDraggingElement.nextSibling;

            const nextAfterTarget =
                targetBox.nextSibling;

            if(
                nextAfterDragging ===
                targetBox
            ){

                parent.insertBefore(
                    targetBox,
                    favoritePhotoDraggingElement
                );

            }else if(
                nextAfterTarget ===
                favoritePhotoDraggingElement
            ){

                parent.insertBefore(
                    favoritePhotoDraggingElement,
                    targetBox
                );

            }else{

                parent.insertBefore(
                    favoritePhotoDraggingElement,
                    targetBox
                );

                parent.insertBefore(
                    targetBox,
                    nextAfterDragging
                );

            }

        },
        {
            passive: false
        }
    );


    document.addEventListener(
        "touchend",
        function(){

            clearTimeout(
                favoritePhotoLongPressTimer
            );

            if(
                favoritePhotoDraggingElement
            ){

                favoritePhotoDraggingElement
                    .classList
                    .remove(
                        "photo-dragging"
                    );

            }

            favoritePhotoIsDragging =
                false;

            favoritePhotoDraggingId =
                null;

            favoritePhotoDraggingElement =
                null;

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   ⭐ 自由並べ替え完了
========================================================= */

function favoriteFinishPhotoSort(){

    const data =
        db.load();

    if(!data.favorites){
        return;
    }

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

    data.favorites.photoOrder =
        items.map(
            item =>
                item.dataset.favoritePhotoId
        );

    db.save(data);

    favoritePhotoSortSelecting =
        false;

    favoritePhotoDraggingId =
        null;

    favoritePhotoDraggingElement =
        null;

    favoriteRenderPhotos();

    alert(
        "✅ 並び順を保存しました"
    );

}


/* =========================================================
   ⭐ すべてのモード終了
========================================================= */

function favoriteCancelAllModes(){

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

    selectedFavoriteEventIds =
        [];

    selectedFavoritePhotoIds =
        [];

    favoriteRenderEvents();

    favoriteRenderPhotos();

}


/* =========================================================
   ⭐ 初期接続
========================================================= */

function favoriteInitialize(){

    favoriteInstallViewerEvents();

    favoriteInstallViewerButtons();

    favoriteInstallPhotoSortEvents();

}


/* =========================================================
   ⭐ DOM読み込み後
========================================================= */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        favoriteInitialize
    );

}else{

    favoriteInitialize();

}