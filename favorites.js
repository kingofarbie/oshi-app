/* =========================================================
   ⭐ favorites.js
   お気に入りページ 完全独立版

   【完全独立ルール】

   ・photo.js を使用しない
   ・photo.js の変数を使用しない
   ・photo.js の関数を使用しない
   ・renderDayMemory() を使用しない
   ・既存 photoViewer を使用しない
   ・既存 photoViewerImage を使用しない
   ・既存 photo-delete / photo-share / photo-close を使用しない

   ・お気に入り専用変数
   ・お気に入り専用関数
   ・お気に入り専用DOM ID
   ・お気に入り専用ビューア
   ・お気に入り専用操作
   ・お気に入り専用並べ替え

   ※ 外部依存はDBとして既存の db.load() / db.save() のみ。
========================================================= */


/* =========================================================
   ⭐ お気に入り専用状態
========================================================= */

let favoritesEventDeleteSelecting = false;
let favoritesPhotoDeleteSelecting = false;

let favoritesEventShareSelecting = false;
let favoritesPhotoShareSelecting = false;

let favoritesEventSortSelecting = false;
let favoritesPhotoSortSelecting = false;

let favoritesSelectedEventIds = [];
let favoritesSelectedPhotoIds = [];


/* =========================================================
   ⭐ お気に入り専用表示順
========================================================= */

let favoritesEventDisplayOrder = [];
let favoritesPhotoDisplayOrder = [];


/* =========================================================
   ⭐ お気に入り写真表示状態
========================================================= */

let favoritesShowAllPhotos = false;


/* =========================================================
   ⭐ お気に入り専用写真ビューア状態
========================================================= */

let favoritesViewerPhotoIds = [];
let favoritesViewerIndex = 0;
let favoritesViewerCurrentId = null;

let favoritesViewerScale = 1;

let favoritesViewerTranslateX = 0;
let favoritesViewerTranslateY = 0;

let favoritesViewerLastDistance = 0;

let favoritesViewerTouchStartX = 0;

let favoritesViewerDragStartX = 0;
let favoritesViewerDragStartY = 0;

let favoritesViewerLastTapTime = 0;

let favoritesViewerOpen = false;


/* =========================================================
   ⭐ お気に入り写真並べ替え状態
========================================================= */

let favoritesPhotoDraggingId = null;
let favoritesPhotoDraggingElement = null;

let favoritesPhotoIsDragging = false;
let favoritesPhotoTouchMoved = false;

let favoritesPhotoTouchStartX = 0;
let favoritesPhotoTouchStartY = 0;

let favoritesPhotoLongPressTimer = null;


/* =========================================================
   ⭐ お気に入りイベント取得
========================================================= */

function favoritesGetEvents(){

    const data = db.load();

    const events =
        data?.favorites?.events || [];

    if(!Array.isArray(events)){
        return [];
    }

    return events.filter(
        item => !!item
    );
}


/* =========================================================
   ⭐ お気に入り写真取得
========================================================= */

function favoritesGetPhotos(){

    const data = db.load();

    const photos =
        data?.favorites?.photos || [];

    if(!Array.isArray(photos)){
        return [];
    }

    return photos.filter(
        item => !!item
    );
}


/* =========================================================
   ⭐ 1日手帳由来イベント取得
========================================================= */

function favoritesGetSourceEvent(
    favorite
){

    if(
        !favorite ||
        favorite.source !== "dayPlanner" ||
        favorite.sourceEventId == null
    ){

        return null;

    }

    const data = db.load();

    const events =
        Array.isArray(data?.events)
        ?
        data.events
        :
        [];

    return events.find(
        event =>
            String(event.id) ===
            String(favorite.sourceEventId)
    ) || null;
}


/* =========================================================
   ⭐ 1日手帳由来写真取得

   ※ photo.js は使用しない
========================================================= */

function favoritesGetSourcePhoto(
    favorite
){

    if(
        !favorite ||
        favorite.source !== "dayPlanner" ||
        favorite.sourcePhotoId == null
    ){

        return null;

    }

    const data = db.load();

    const memories =
        data?.dayMemories || {};

    for(
        const [dayKey, day]
        of Object.entries(memories)
    ){

        const photos =
            Array.isArray(day?.photos)
            ?
            day.photos
            :
            [];

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
   ⭐ お気に入りイベント実体取得
========================================================= */

function favoritesGetEventData(
    favorite
){

    if(!favorite){
        return null;
    }

    if(
        favorite.source === "dayPlanner"
    ){

        return favoritesGetSourceEvent(
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
   ⭐ お気に入り写真実体取得
========================================================= */

function favoritesGetPhotoData(
    favorite
){

    if(!favorite){
        return null;
    }

    if(
        favorite.source === "dayPlanner"
    ){

        const result =
            favoritesGetSourcePhoto(
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
   ⭐ イベント表示順取得
========================================================= */

function favoritesGetOrderedEvents(){

    const data = db.load();

    const events =
        data?.favorites?.events || [];

    if(!Array.isArray(events)){
        return [];
    }

    const order =
        data?.favorites?.eventOrder || [];

    if(
        !Array.isArray(order) ||
        order.length === 0
    ){

        return [...events];

    }

    const result = [];

    order.forEach(
        id => {

            const item =
                events.find(
                    favorite =>
                        String(favorite.id) ===
                        String(id)
                );

            if(item){
                result.push(item);
            }

        }
    );

    events.forEach(
        item => {

            const exists =
                result.some(
                    existing =>
                        String(existing.id) ===
                        String(item.id)
                );

            if(!exists){
                result.push(item);
            }

        }
    );

    return result;
}


/* =========================================================
   ⭐ 写真表示順取得
========================================================= */

function favoritesGetOrderedPhotos(){

    const data = db.load();

    const photos =
        data?.favorites?.photos || [];

    if(!Array.isArray(photos)){
        return [];
    }

    const order =
        data?.favorites?.photoOrder || [];

    if(
        !Array.isArray(order) ||
        order.length === 0
    ){

        return [...photos];

    }

    const result = [];

    order.forEach(
        id => {

            const item =
                photos.find(
                    favorite =>
                        String(favorite.id) ===
                        String(id)
                );

            if(item){
                result.push(item);
            }

        }
    );

    photos.forEach(
        item => {

            const exists =
                result.some(
                    existing =>
                        String(existing.id) ===
                        String(item.id)
                );

            if(!exists){
                result.push(item);
            }

        }
    );

    return result;
}


/* =========================================================
   ⭐ お気に入りページ表示
========================================================= */

function favoritesDisplay(){

    favoritesRenderEvents();

    favoritesRenderPhotos();

}


/* =========================================================
   ⭐ イベント日時表示
========================================================= */

function favoritesFormatEventDate(
    value
){

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

        return String(value);

    }

    const week = [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ];

    return (
        `${date.getFullYear()}年` +
        `${date.getMonth() + 1}月` +
        `${date.getDate()}日` +
        `(${week[date.getDay()]}) ` +
        `${String(date.getHours()).padStart(2,"0")}:` +
        `${String(date.getMinutes()).padStart(2,"0")}`
    );
}


/* =========================================================
   ⭐ イベント表示
========================================================= */

function favoritesRenderEvents(){

    const box =
        document.getElementById(
            "favorites-event-list"
        );

    if(!box){
        return;
    }

    const events =
        favoritesGetOrderedEvents();

    favoritesEventDisplayOrder =
        events.map(
            item => item.id
        );

    if(events.length === 0){

        box.innerHTML = `
            <div class="favorites-empty">
                🏆
                <br>
                お気に入りイベントはありません
            </div>
        `;

        return;
    }

    let html = "";

    events.forEach(
        favorite => {

            const event =
                favoritesGetEventData(
                    favorite
                );

            if(!event){
                return;
            }

            const id =
                String(favorite.id);

            const selected =
                favoritesSelectedEventIds
                    .includes(id);

            const sourceLabel =
                favorite.source === "dayPlanner"
                ?
                "📅 1日手帳"
                :
                "⭐ お気に入りに追加";

            let className =
                "favorites-event-item";

            if(
                (
                    favoritesEventDeleteSelecting ||
                    favoritesEventShareSelecting
                ) &&
                selected
            ){

                className +=
                    " favorites-item-selected";

            }

            let clickAction = "";

            if(
                favoritesEventDeleteSelecting
            ){

                clickAction =
                    `onclick="favoritesToggleEventDelete('${id}')"`;


            }else if(
                favoritesEventShareSelecting
            ){

                clickAction =
                    `onclick="favoritesToggleEventShare('${id}')"`;


            }

            html += `

<div
    class="${className}"
    data-favorites-event-id="${id}"
    ${clickAction}
>

    <div class="favorites-event-source">
        ${sourceLabel}
    </div>

    <div class="favorites-event-title">
        ${event.title || "無題の予定"}
    </div>

    ${
        event.start
        ?
        `
        <div class="favorites-event-date">
            ${favoritesFormatEventDate(event.start)}
        </div>
        `
        :
        ""
    }

    ${
        event.place
        ?
        `
        <div class="favorites-event-place">
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
        <div class="favorites-event-companion">
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
            🏆
            <br>
            お気に入りイベントはありません
        </div>
        `;
}


/* =========================================================
   ⭐ 写真表示
========================================================= */

function favoritesRenderPhotos(){

    const box =
        document.getElementById(
            "favorites-photo-list"
        );

    if(!box){
        return;
    }

    const photos =
        favoritesGetOrderedPhotos();

    favoritesPhotoDisplayOrder =
        photos.map(
            item => item.id
        );

    let html = "";


    /* =========================
       削除モード
    ========================= */

    if(
        favoritesPhotoDeleteSelecting
    ){

        html += `

<div class="favorites-photo-action-bar">

    <span>
        🗑 写真を選択中
    </span>

    <span>
        ${favoritesSelectedPhotoIds.length}枚選択
    </span>

    <button
        type="button"
        onclick="favoritesCancelPhotoDelete()">
        キャンセル
    </button>

    <button
        type="button"
        onclick="favoritesConfirmPhotoDelete()"
        ${
            favoritesSelectedPhotoIds.length === 0
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


    /* =========================
       共有モード
    ========================= */

    if(
        favoritesPhotoShareSelecting
    ){

        html += `

<div class="favorites-photo-action-bar">

    <span>
        📤 写真を選択中
    </span>

    <span>
        ${favoritesSelectedPhotoIds.length}枚選択
    </span>

    <button
        type="button"
        onclick="favoritesCancelPhotoShare()">
        キャンセル
    </button>

    <button
        type="button"
        onclick="favoritesShareSelectedPhotos()"
        ${
            favoritesSelectedPhotoIds.length === 0
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


    /* =========================
       並べ替えモード
    ========================= */

    if(
        favoritesPhotoSortSelecting
    ){

        html += `

<div class="favorites-photo-sort-bar">

    <div>
        📷 自由並べ替え中
        <br>
        <small>
            写真を長押ししてドラッグしてください
        </small>
    </div>

    <button
        type="button"
        onclick="favoritesFinishPhotoSort()">
        完了
    </button>

</div>

`;

    }


    /* =========================
       写真本体
    ========================= */

    photos.forEach(
        favorite => {

            const photo =
                favoritesGetPhotoData(
                    favorite
                );

            if(!photo){
                return;
            }

            const id =
                String(favorite.id);

            const selected =
                favoritesSelectedPhotoIds
                    .includes(id);

            let className =
                "favorites-photo-item";

            if(
                (
                    favoritesPhotoDeleteSelecting ||
                    favoritesPhotoShareSelecting
                ) &&
                selected
            ){

                className +=
                    " favorites-item-selected";

            }

            if(
                favoritesPhotoSortSelecting
            ){

                className +=
                    " favorites-photo-sort-item";

            }

            let clickAction = "";

            if(
                favoritesPhotoDeleteSelecting
            ){

                clickAction =
                    `onclick="favoritesTogglePhotoDelete('${id}')"`;


            }else if(
                favoritesPhotoShareSelecting
            ){

                clickAction =
                    `onclick="favoritesTogglePhotoShare('${id}')"`;


            }

            html += `

<div
    class="${className}"
    data-favorites-photo-id="${id}"
    ${clickAction}
>

    <img
        src="${photo.src}"
        class="favorites-photo-image"
        draggable="false"
        ${
            !favoritesPhotoDeleteSelecting &&
            !favoritesPhotoShareSelecting &&
            !favoritesPhotoSortSelecting
            ?
            `onclick="favoritesOpenPhotoViewer('${id}')"`
            :
            ""
        }
    >

    ${
        favoritesPhotoDeleteSelecting ||
        favoritesPhotoShareSelecting
        ?
        `
        <div class="favorites-photo-check">
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


    if(
        photos.length === 0
    ){

        html += `

<div class="favorites-empty">

    📷
    <br>
    お気に入り写真はありません

</div>

`;

    }

    box.innerHTML = html;
}


/* =========================================================
   ⭐ お気に入り直接イベント追加
========================================================= */

function favoritesOpenAddEvent(){

    const modal =
        document.getElementById(
            "favorites-event-add-modal"
        );

    if(!modal){
        console.warn(
            "favorites-event-add-modal がありません"
        );

        return;
    }

    modal.style.display =
        "flex";
}


/* =========================================================
   ⭐ イベント追加閉じる
========================================================= */

function favoritesCloseAddEvent(){

    const modal =
        document.getElementById(
            "favorites-event-add-modal"
        );

    if(modal){

        modal.style.display =
            "none";

    }

}


/* =========================================================
   ⭐ お気に入り直接写真追加
========================================================= */

function favoritesOpenPhotoPicker(){

    const picker =
        document.getElementById(
            "favorites-photo-picker"
        );

    if(!picker){

        console.warn(
            "favorites-photo-picker がありません"
        );

        return;

    }

    picker.click();
}


/* =========================================================
   ⭐ 直接追加写真
========================================================= */

function favoritesPhotoSelected(
    event
){

    const files =
        Array.from(
            event.target.files || []
        );

    if(files.length === 0){
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

    files.forEach(
        file => {

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
                function(readerEvent){

                    const image =
                        new Image();

                    image.onload =
                        function(){

                            const maxSize =
                                1000;

                            let width =
                                image.width;

                            let height =
                                image.height;

                            if(
                                width > height
                            ){

                                if(width > maxSize){

                                    height *=
                                        maxSize / width;

                                    width =
                                        maxSize;

                                }

                            }else{

                                if(height > maxSize){

                                    width *=
                                        maxSize / height;

                                    height =
                                        maxSize;

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

                            const context =
                                canvas.getContext(
                                    "2d"
                                );

                            context.drawImage(
                                image,
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
                                `${Date.now()}_${Math.random()
                                    .toString(36)
                                    .slice(2)}`;

                            const favoritePhoto = {

                                id: id,

                                source:
                                    "favorite",

                                src: src,

                                favoriteAt:
                                    Date.now()

                            };

                            data.favorites.photos.push(
                                favoritePhoto
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

                                favoritesRenderPhotos();

                            }

                        };

                    image.src =
                        readerEvent.target.result;

                };

            reader.readAsDataURL(file);

        }
    );

    event.target.value = "";
}


/* =========================================================
   ⭐ イベント削除モード
========================================================= */

function favoritesEventDeleteMode(){

    favoritesEventDeleteSelecting =
        true;

    favoritesEventShareSelecting =
        false;

    favoritesEventSortSelecting =
        false;

    favoritesSelectedEventIds = [];

    favoritesRenderEvents();
}


/* =========================================================
   ⭐ イベント削除選択
========================================================= */

function favoritesToggleEventDelete(
    id
){

    id = String(id);

    const index =
        favoritesSelectedEventIds.indexOf(id);

    if(index >= 0){

        favoritesSelectedEventIds.splice(
            index,
            1
        );

    }else{

        favoritesSelectedEventIds.push(
            id
        );

    }

    favoritesRenderEvents();
}


/* =========================================================
   ⭐ イベント削除実行
========================================================= */

function favoritesConfirmEventDelete(){

    if(
        favoritesSelectedEventIds.length === 0
    ){

        alert(
            "削除するイベントを選択してください"
        );

        return;

    }

    const data =
        db.load();

    const favorites =
        data?.favorites?.events || [];

    const targets =
        favorites.filter(
            favorite =>
                favoritesSelectedEventIds.includes(
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

    if(dayPlannerTargets.length){

        message +=
            "📅 1日手帳からのお気に入り\n" +
            `${dayPlannerTargets.length}件あります。\n` +
            "お気に入りから削除すると、" +
            "元の1日手帳の予定も削除されます。\n\n";

    }

    if(directTargets.length){

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

    if(dayPlannerTargets.length){

        if(!Array.isArray(data.events)){
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
                !favoritesSelectedEventIds.includes(
                    String(favorite.id)
                )
        );

    data.favorites.eventOrder =
        (
            data.favorites.eventOrder || []
        ).filter(
            id =>
                !favoritesSelectedEventIds.includes(
                    String(id)
                )
        );

    db.save(data);

    favoritesEventDeleteSelecting =
        false;

    favoritesSelectedEventIds = [];

    favoritesRenderEvents();
}


/* =========================================================
   ⭐ イベント削除キャンセル
========================================================= */

function favoritesCancelEventDelete(){

    favoritesEventDeleteSelecting =
        false;

    favoritesSelectedEventIds = [];

    favoritesRenderEvents();
}


/* =========================================================
   ⭐ 写真削除モード
========================================================= */

function favoritesPhotoDeleteMode(){

    favoritesPhotoDeleteSelecting =
        true;

    favoritesPhotoShareSelecting =
        false;

    favoritesPhotoSortSelecting =
        false;

    favoritesSelectedPhotoIds = [];

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ 写真削除選択
========================================================= */

function favoritesTogglePhotoDelete(
    id
){

    id = String(id);

    const index =
        favoritesSelectedPhotoIds.indexOf(id);

    if(index >= 0){

        favoritesSelectedPhotoIds.splice(
            index,
            1
        );

    }else{

        favoritesSelectedPhotoIds.push(
            id
        );

    }

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ 写真削除
========================================================= */

function favoritesConfirmPhotoDelete(){

    if(
        favoritesSelectedPhotoIds.length === 0
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
                favoritesSelectedPhotoIds.includes(
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

    if(dayPlannerTargets.length){

        message +=
            "📅 1日手帳からのお気に入り写真\n" +
            `${dayPlannerTargets.length}枚あります。\n` +
            "お気に入りから削除すると、" +
            "元の1日手帳の写真も削除されます。\n\n";

    }

    if(directTargets.length){

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


    /* =========================
       1日手帳側
    ========================= */

    dayPlannerTargets.forEach(
        favorite => {

            const source =
                favoritesGetSourcePhoto(
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
       お気に入り側
    ========================= */

    data.favorites.photos =
        favorites.filter(
            favorite =>
                !favoritesSelectedPhotoIds.includes(
                    String(favorite.id)
                )
        );


    data.favorites.photoOrder =
        (
            data.favorites.photoOrder || []
        ).filter(
            id =>
                !favoritesSelectedPhotoIds.includes(
                    String(id)
                )
        );


    db.save(data);

    favoritesPhotoDeleteSelecting =
        false;

    favoritesSelectedPhotoIds = [];

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ 写真削除キャンセル
========================================================= */

function favoritesCancelPhotoDelete(){

    favoritesPhotoDeleteSelecting =
        false;

    favoritesSelectedPhotoIds = [];

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ イベント並べ替えモード
========================================================= */

function favoritesEventSortMode(){

    favoritesEventDeleteSelecting =
        false;

    favoritesEventShareSelecting =
        false;

    favoritesEventSortSelecting =
        true;

    favoritesSelectedEventIds = [];

    const modal =
        document.getElementById(
            "favorites-event-sort-modal"
        );

    if(modal){

        modal.style.display =
            "flex";

    }

    favoritesRenderEvents();
}


/* =========================================================
   ⭐ イベント並べ替え設定
========================================================= */

function favoritesSetEventSort(
    type
){

    const data =
        db.load();

    if(!data.favorites){
        return;
    }

    if(
        type === "new" ||
        type === "old"
    ){

        const events =
            favoritesGetEvents();

        events.sort(
            (a,b) => {

                const aEvent =
                    favoritesGetEventData(a);

                const bEvent =
                    favoritesGetEventData(b);

                const aTime =
                    new Date(
                        aEvent?.start || 0
                    ).getTime();

                const bTime =
                    new Date(
                        bEvent?.start || 0
                    ).getTime();

                return type === "new"
                    ?
                    bTime - aTime
                    :
                    aTime - bTime;

            }
        );

        data.favorites.eventOrder =
            events.map(
                item => item.id
            );

        db.save(data);

        favoritesEventSortSelecting =
            false;

        favoritesRenderEvents();

        favoritesCloseEventSortModal();

        return;

    }

    if(type === "free"){

        favoritesEventSortSelecting =
            true;

        favoritesCloseEventSortModal();

        favoritesRenderEvents();

    }

}


/* =========================================================
   ⭐ イベント自由並べ替え保存
========================================================= */

function favoritesSaveEventOrder(){

    const data =
        db.load();

    if(!data.favorites){
        return;
    }

    const container =
        document.getElementById(
            "favorites-event-list"
        );

    if(!container){
        return;
    }

    const items =
        [
            ...container.querySelectorAll(
                "[data-favorites-event-id]"
            )
        ];

    data.favorites.eventOrder =
        items.map(
            item =>
                item.dataset.favoritesEventId
        );

    db.save(data);

    favoritesEventSortSelecting =
        false;

    favoritesRenderEvents();
}


/* =========================================================
   ⭐ イベント並べ替え閉じる
========================================================= */

function favoritesCloseEventSortModal(){

    const modal =
        document.getElementById(
            "favorites-event-sort-modal"
        );

    if(modal){

        modal.style.display =
            "none";

    }

}


/* =========================================================
   ⭐ 写真並べ替えモード
========================================================= */

function favoritesPhotoSortMode(){

    favoritesPhotoDeleteSelecting =
        false;

    favoritesPhotoShareSelecting =
        false;

    favoritesPhotoSortSelecting =
        true;

    favoritesSelectedPhotoIds = [];

    const modal =
        document.getElementById(
            "favorites-photo-sort-modal"
        );

    if(modal){

        modal.style.display =
            "flex";

    }

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ 写真並べ替え設定
========================================================= */

function favoritesSetPhotoSort(
    type
){

    const data =
        db.load();

    if(!data.favorites){
        return;
    }

    if(
        type === "new" ||
        type === "old"
    ){

        const photos =
            favoritesGetPhotos();

        photos.sort(
            (a,b) => {

                const aTime =
                    Number(
                        a.favoriteAt || 0
                    );

                const bTime =
                    Number(
                        b.favoriteAt || 0
                    );

                return type === "new"
                    ?
                    bTime - aTime
                    :
                    aTime - bTime;

            }
        );

        data.favorites.photoOrder =
            photos.map(
                item => item.id
            );

        db.save(data);

        favoritesPhotoSortSelecting =
            false;

        favoritesRenderPhotos();

        favoritesClosePhotoSortModal();

        return;

    }

    if(type === "free"){

        favoritesPhotoSortSelecting =
            true;

        favoritesClosePhotoSortModal();

        favoritesRenderPhotos();

    }

}


/* =========================================================
   ⭐ 写真自由並べ替え保存
========================================================= */

function favoritesSavePhotoOrder(){

    const data =
        db.load();

    if(!data.favorites){
        return;
    }

    const container =
        document.getElementById(
            "favorites-photo-list"
        );

    if(!container){
        return;
    }

    const items =
        [
            ...container.querySelectorAll(
                "[data-favorites-photo-id]"
            )
        ];

    data.favorites.photoOrder =
        items.map(
            item =>
                item.dataset.favoritesPhotoId
        );

    db.save(data);

    favoritesPhotoSortSelecting =
        false;

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ 写真並べ替え閉じる
========================================================= */

function favoritesClosePhotoSortModal(){

    const modal =
        document.getElementById(
            "favorites-photo-sort-modal"
        );

    if(modal){

        modal.style.display =
            "none";

    }

}


/* =========================================================
   ⭐ 写真共有モード
========================================================= */

function favoritesPhotoShareMode(){

    favoritesPhotoDeleteSelecting =
        false;

    favoritesPhotoSortSelecting =
        false;

    favoritesPhotoShareSelecting =
        true;

    favoritesSelectedPhotoIds = [];

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ 写真共有選択
========================================================= */

function favoritesTogglePhotoShare(
    id
){

    id = String(id);

    const index =
        favoritesSelectedPhotoIds.indexOf(id);

    if(index >= 0){

        favoritesSelectedPhotoIds.splice(
            index,
            1
        );

    }else{

        favoritesSelectedPhotoIds.push(
            id
        );

    }

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ 写真共有キャンセル
========================================================= */

function favoritesCancelPhotoShare(){

    favoritesPhotoShareSelecting =
        false;

    favoritesSelectedPhotoIds = [];

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ 写真共有
========================================================= */

async function favoritesShareSelectedPhotos(){

    if(
        favoritesSelectedPhotoIds.length === 0
    ){

        alert(
            "共有する写真を選択してください"
        );

        return;

    }

    const favorites =
        favoritesGetPhotos();

    const targets =
        favorites.filter(
            favorite =>
                favoritesSelectedPhotoIds.includes(
                    String(favorite.id)
                )
        );

    try{

        const files = [];

        for(
            let index = 0;
            index < targets.length;
            index++
        ){

            const photo =
                favoritesGetPhotoData(
                    targets[index]
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
                    `oshi-favorites-${index + 1}.jpg`,
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

        favoritesPhotoShareSelecting =
            false;

        favoritesSelectedPhotoIds = [];

        favoritesRenderPhotos();

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

function favoritesEventShareMode(){

    favoritesEventDeleteSelecting =
        false;

    favoritesEventSortSelecting =
        false;

    favoritesEventShareSelecting =
        true;

    favoritesSelectedEventIds = [];

    favoritesRenderEvents();
}


/* =========================================================
   ⭐ イベント共有選択
========================================================= */

function favoritesToggleEventShare(
    id
){

    id = String(id);

    const index =
        favoritesSelectedEventIds.indexOf(id);

    if(index >= 0){

        favoritesSelectedEventIds.splice(
            index,
            1
        );

    }else{

        favoritesSelectedEventIds.push(
            id
        );

    }

    favoritesRenderEvents();
}


/* =========================================================
   ⭐ イベント共有
========================================================= */

async function favoritesShareSelectedEvents(){

    if(
        favoritesSelectedEventIds.length === 0
    ){

        alert(
            "共有するイベントを選択してください"
        );

        return;

    }

    const favorites =
        favoritesGetEvents();

    const targets =
        favorites.filter(
            favorite =>
                favoritesSelectedEventIds.includes(
                    String(favorite.id)
                )
        );

    const text =
        targets
            .map(
                favorite => {

                    const event =
                        favoritesGetEventData(
                            favorite
                        );

                    if(!event){
                        return "";
                    }

                    let result =
                        `📅 ${event.title || "無題の予定"}`;

                    if(event.start){

                        result +=
                            `\n${favoritesFormatEventDate(
                                event.start
                            )}`;

                    }

                    if(event.place){

                        result +=
                            `\n📍 ${event.place}`;

                    }

                    return result;

                }
            )
            .filter(Boolean)
            .join("\n\n");

    if(navigator.share){

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

    favoritesEventShareSelecting =
        false;

    favoritesSelectedEventIds = [];

    favoritesRenderEvents();
}


/* =========================================================
   ⭐ お気に入り専用ビューアを開く
========================================================= */

function favoritesOpenPhotoViewer(
    favoriteId
){

    const photos =
        favoritesGetOrderedPhotos();

    const index =
        photos.findIndex(
            item =>
                String(item.id) ===
                String(favoriteId)
        );

    if(index < 0){
        return;
    }

    const favorite =
        photos[index];

    const photo =
        favoritesGetPhotoData(
            favorite
        );

    if(!photo){
        return;
    }

    favoritesViewerPhotoIds =
        photos.map(
            item => item.id
        );

    favoritesViewerIndex =
        index;

    favoritesViewerCurrentId =
        favorite.id;

    favoritesViewerScale =
        1;

    favoritesViewerTranslateX =
        0;

    favoritesViewerTranslateY =
        0;

    favoritesViewerLastDistance =
        0;

    favoritesViewerOpen =
        true;


    const viewer =
        document.getElementById(
            "favorites-photo-viewer"
        );

    const image =
        document.getElementById(
            "favorites-photo-viewer-image"
        );

    if(
        !viewer ||
        !image
    ){

        console.warn(
            "お気に入り専用ビューアDOMがありません"
        );

        return;

    }

    image.src =
        photo.src;

    favoritesApplyViewerTransform();

    viewer.style.display =
        "flex";

    viewer.style.zIndex =
        "10000";

    document.body.style.overflow =
        "hidden";
}


/* =========================================================
   ⭐ ビューア変形
========================================================= */

function favoritesApplyViewerTransform(){

    const image =
        document.getElementById(
            "favorites-photo-viewer-image"
        );

    if(!image){
        return;
    }

    image.style.transform =
        `translate(${favoritesViewerTranslateX}px,${favoritesViewerTranslateY}px) scale(${favoritesViewerScale})`;
}


/* =========================================================
   ⭐ ビューア写真表示
========================================================= */

function favoritesShowPhoto(
    index
){

    if(
        favoritesViewerPhotoIds.length === 0
    ){

        return;

    }

    if(
        index >=
        favoritesViewerPhotoIds.length
    ){

        index = 0;

    }

    if(index < 0){

        index =
            favoritesViewerPhotoIds.length - 1;

    }

    favoritesViewerIndex =
        index;

    const id =
        favoritesViewerPhotoIds[index];

    const photos =
        favoritesGetOrderedPhotos();

    const favorite =
        photos.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if(!favorite){
        return;
    }

    const photo =
        favoritesGetPhotoData(
            favorite
        );

    if(!photo){
        return;
    }

    favoritesViewerCurrentId =
        favorite.id;

    favoritesViewerScale =
        1;

    favoritesViewerTranslateX =
        0;

    favoritesViewerTranslateY =
        0;

    favoritesViewerLastDistance =
        0;

    const image =
        document.getElementById(
            "favorites-photo-viewer-image"
        );

    if(image){

        image.src =
            photo.src;

        favoritesApplyViewerTransform();

    }
}


/* =========================================================
   ⭐ お気に入り専用スワイプ
========================================================= */

function favoritesPhotoSwipe(
    event
){

    if(!favoritesViewerOpen){
        return;
    }

    if(
        favoritesViewerScale > 1
    ){

        return;

    }

    if(
        !event.changedTouches ||
        event.changedTouches.length !== 1
    ){

        return;

    }

    const endX =
        event.changedTouches[0].clientX;

    const difference =
        endX -
        favoritesViewerTouchStartX;

    if(
        Math.abs(difference) < 60
    ){

        return;

    }

    if(difference < 0){

        favoritesShowPhoto(
            favoritesViewerIndex + 1
        );

    }else{

        favoritesShowPhoto(
            favoritesViewerIndex - 1
        );

    }
}


/* =========================================================
   ⭐ ピンチ・ドラッグ
========================================================= */

function favoritesPhotoPinch(
    event
){

    if(!favoritesViewerOpen){
        return;
    }

    const image =
        document.getElementById(
            "favorites-photo-viewer-image"
        );

    if(!image){
        return;
    }


    /* =========================
       2本指ピンチ
    ========================= */

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
            favoritesViewerLastDistance !== 0
        ){

            favoritesViewerScale *=
                distance /
                favoritesViewerLastDistance;

            if(
                favoritesViewerScale < 1
            ){

                favoritesViewerScale =
                    1;

            }

            if(
                favoritesViewerScale > 4
            ){

                favoritesViewerScale =
                    4;

            }

            favoritesApplyViewerTransform();

        }

        favoritesViewerLastDistance =
            distance;

        return;

    }


    /* =========================
       1本指ドラッグ
    ========================= */

    if(
        favoritesViewerScale > 1 &&
        event.touches.length === 1
    ){

        event.preventDefault();

        const x =
            event.touches[0].clientX;

        const y =
            event.touches[0].clientY;

        favoritesViewerTranslateX +=
            x -
            favoritesViewerDragStartX;

        favoritesViewerTranslateY +=
            y -
            favoritesViewerDragStartY;

        favoritesViewerDragStartX =
            x;

        favoritesViewerDragStartY =
            y;

        favoritesApplyViewerTransform();

    }

}


/* =========================================================
   ⭐ ビューアドラッグ開始
========================================================= */

function favoritesPhotoDragStart(
    event
){

    if(!favoritesViewerOpen){
        return;
    }

    if(
        event.touches.length !== 1
    ){

        return;

    }

    const x =
        event.touches[0].clientX;

    const y =
        event.touches[0].clientY;

    favoritesViewerTouchStartX =
        x;

    if(
        favoritesViewerScale > 1
    ){

        event.preventDefault();

        favoritesViewerDragStartX =
            x;

        favoritesViewerDragStartY =
            y;

    }

}


/* =========================================================
   ⭐ ビューアドラッグ終了
========================================================= */

function favoritesPhotoDragEnd(
    event
){

    if(
        event.changedTouches &&
        event.changedTouches.length >= 2
    ){

        favoritesViewerLastDistance =
            0;

    }

}


/* =========================================================
   ⭐ ダブルタップ
========================================================= */

function favoritesPhotoDoubleTap(
    event
){

    if(!favoritesViewerOpen){
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
        favoritesViewerLastTapTime <
        300
    ){

        if(
            favoritesViewerScale === 1
        ){

            favoritesViewerScale =
                2;

        }else{

            favoritesViewerScale =
                1;

            favoritesViewerTranslateX =
                0;

            favoritesViewerTranslateY =
                0;

        }

        favoritesApplyViewerTransform();

    }

    favoritesViewerLastTapTime =
        now;
}


/* =========================================================
   ⭐ ビューアを閉じる
========================================================= */

function favoritesClosePhotoViewer(){

    const viewer =
        document.getElementById(
            "favorites-photo-viewer"
        );

    if(viewer){

        viewer.style.display =
            "none";

    }

    document.body.style.overflow =
        "";

    favoritesViewerOpen =
        false;

    favoritesViewerPhotoIds =
        [];

    favoritesViewerIndex =
        0;

    favoritesViewerCurrentId =
        null;

    favoritesViewerScale =
        1;

    favoritesViewerTranslateX =
        0;

    favoritesViewerTranslateY =
        0;

    favoritesViewerLastDistance =
        0;
}


/* =========================================================
   ⭐ ビューア現在写真削除
========================================================= */

function favoritesDeleteCurrentPhoto(){

    if(
        favoritesViewerCurrentId == null
    ){

        return;

    }

    const data =
        db.load();

    const photos =
        data?.favorites?.photos || [];

    const target =
        photos.find(
            favorite =>
                String(favorite.id) ===
                String(
                    favoritesViewerCurrentId
                )
        );

    if(!target){
        return;
    }

    let message;

    if(
        target.source === "dayPlanner"
    ){

        message =
            "この写真は1日手帳からのお気に入りです。\n\n" +
            "お気に入りから削除すると、" +
            "1日手帳からも削除されます。\n\n" +
            "削除してよろしいですか？";

    }else{

        message =
            "この写真をお気に入りから削除しますか？";

    }

    if(!confirm(message)){
        return;
    }


    /* =========================
       1日手帳由来
    ========================= */

    if(
        target.source === "dayPlanner"
    ){

        const source =
            favoritesGetSourcePhoto(
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


    /* =========================
       お気に入り側
    ========================= */

    data.favorites.photos =
        photos.filter(
            favorite =>
                String(favorite.id) !==
                String(target.id)
        );


    data.favorites.photoOrder =
        (
            data.favorites.photoOrder || []
        ).filter(
            id =>
                String(id) !==
                String(target.id)
        );


    db.save(data);


    const remaining =
        favoritesGetOrderedPhotos();

    if(
        remaining.length === 0
    ){

        favoritesClosePhotoViewer();

        favoritesRenderPhotos();

        return;

    }


    let nextIndex =
        favoritesViewerIndex;

    if(
        nextIndex >=
        remaining.length
    ){

        nextIndex =
            remaining.length - 1;

    }

    favoritesViewerPhotoIds =
        remaining.map(
            item => item.id
        );

    favoritesShowPhoto(
        nextIndex
    );

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ ビューア現在写真共有
========================================================= */

async function favoritesShareCurrentPhoto(){

    if(
        favoritesViewerCurrentId == null
    ){

        return;

    }

    const photos =
        favoritesGetPhotos();

    const favorite =
        photos.find(
            item =>
                String(item.id) ===
                String(
                    favoritesViewerCurrentId
                )
        );

    if(!favorite){
        return;
    }

    const photo =
        favoritesGetPhotoData(
            favorite
        );

    if(!photo){
        return;
    }

    if(!navigator.share){

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
                "oshi-favorites.jpg",
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
   ⭐ お気に入り専用ビューアボタン接続
========================================================= */

function favoritesInstallViewerButtons(){

    const deleteButton =
        document.getElementById(
            "favorites-viewer-delete"
        );

    const shareButton =
        document.getElementById(
            "favorites-viewer-share"
        );

    const closeButton =
        document.getElementById(
            "favorites-viewer-close"
        );


    if(deleteButton){

        deleteButton.onclick =
            function(event){

                event.preventDefault();
                event.stopPropagation();

                favoritesDeleteCurrentPhoto();

            };

    }


    if(shareButton){

        shareButton.onclick =
            function(event){

                event.preventDefault();
                event.stopPropagation();

                favoritesShareCurrentPhoto();

            };

    }


    if(closeButton){

        closeButton.onclick =
            function(event){

                event.preventDefault();
                event.stopPropagation();

                favoritesClosePhotoViewer();

            };

    }

}


/* =========================================================
   ⭐ お気に入り専用ビューアイベント接続
========================================================= */

function favoritesInstallViewerEvents(){

    const image =
        document.getElementById(
            "favorites-photo-viewer-image"
        );

    if(!image){
        return;
    }

    if(
        image.dataset.favoritesViewerInstalled ===
        "true"
    ){

        return;

    }

    image.dataset.favoritesViewerInstalled =
        "true";


    image.addEventListener(
        "touchstart",
        function(event){

            if(!favoritesViewerOpen){
                return;
            }

            favoritesPhotoDragStart(
                event
            );

        },
        {
            capture: true,
            passive: true
        }
    );


    image.addEventListener(
        "touchmove",
        function(event){

            if(!favoritesViewerOpen){
                return;
            }

            event.stopImmediatePropagation();

            favoritesPhotoPinch(
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

            if(!favoritesViewerOpen){
                return;
            }

            event.stopImmediatePropagation();

            favoritesPhotoSwipe(
                event
            );

            favoritesPhotoDoubleTap(
                event
            );

            favoritesPhotoDragEnd(
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
   ⭐ 写真自由並べ替えイベント
========================================================= */

function favoritesInstallPhotoSortEvents(){

    if(
        document.body.dataset.favoritesSortInstalled ===
        "true"
    ){

        return;

    }

    document.body.dataset.favoritesSortInstalled =
        "true";


    document.addEventListener(
        "touchstart",
        function(event){

            if(
                !favoritesPhotoSortSelecting
            ){

                return;

            }

            const box =
                event.target.closest(
                    ".favorites-photo-item"
                );

            if(!box){
                return;
            }

            const id =
                box.dataset.favoritesPhotoId;

            if(!id){
                return;
            }

            favoritesPhotoDraggingId =
                String(id);

            favoritesPhotoDraggingElement =
                box;

            favoritesPhotoTouchMoved =
                false;

            favoritesPhotoIsDragging =
                false;

            favoritesPhotoTouchStartX =
                event.touches[0].clientX;

            favoritesPhotoTouchStartY =
                event.touches[0].clientY;

            clearTimeout(
                favoritesPhotoLongPressTimer
            );

            favoritesPhotoLongPressTimer =
                setTimeout(
                    function(){

                        if(
                            favoritesPhotoTouchMoved
                        ){

                            return;

                        }

                        favoritesPhotoIsDragging =
                            true;

                        box.classList.add(
                            "favorites-photo-dragging"
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
                !favoritesPhotoSortSelecting
            ){

                return;

            }

            if(
                !favoritesPhotoDraggingElement
            ){

                return;

            }

            if(
                !favoritesPhotoIsDragging
            ){

                const dx =
                    Math.abs(
                        event.touches[0].clientX -
                        favoritesPhotoTouchStartX
                    );

                const dy =
                    Math.abs(
                        event.touches[0].clientY -
                        favoritesPhotoTouchStartY
                    );

                if(
                    dx > 10 ||
                    dy > 10
                ){

                    favoritesPhotoTouchMoved =
                        true;

                    clearTimeout(
                        favoritesPhotoLongPressTimer
                    );

                    favoritesPhotoDraggingId =
                        null;

                    favoritesPhotoDraggingElement =
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
                        ".favorites-photo-item"
                    )
                ];

            let targetBox = null;

            boxes.forEach(
                box => {

                    if(
                        box ===
                        favoritesPhotoDraggingElement
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
                favoritesPhotoDraggingElement.parentNode;

            const nextAfterDragging =
                favoritesPhotoDraggingElement.nextSibling;

            const nextAfterTarget =
                targetBox.nextSibling;


            if(
                nextAfterDragging ===
                targetBox
            ){

                parent.insertBefore(
                    targetBox,
                    favoritesPhotoDraggingElement
                );

            }else if(
                nextAfterTarget ===
                favoritesPhotoDraggingElement
            ){

                parent.insertBefore(
                    favoritesPhotoDraggingElement,
                    targetBox
                );

            }else{

                parent.insertBefore(
                    favoritesPhotoDraggingElement,
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
                favoritesPhotoLongPressTimer
            );

            if(
                favoritesPhotoDraggingElement
            ){

                favoritesPhotoDraggingElement
                    .classList
                    .remove(
                        "favorites-photo-dragging"
                    );

            }

            favoritesPhotoIsDragging =
                false;

            favoritesPhotoDraggingId =
                null;

            favoritesPhotoDraggingElement =
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

function favoritesFinishPhotoSort(){

    const data =
        db.load();

    if(!data.favorites){
        return;
    }

    const container =
        document.getElementById(
            "favorites-photo-list"
        );

    if(!container){
        return;
    }

    const items =
        [
            ...container.querySelectorAll(
                "[data-favorites-photo-id]"
            )
        ];

    data.favorites.photoOrder =
        items.map(
            item =>
                item.dataset.favoritesPhotoId
        );

    db.save(data);

    favoritesPhotoSortSelecting =
        false;

    favoritesPhotoDraggingId =
        null;

    favoritesPhotoDraggingElement =
        null;

    favoritesRenderPhotos();

    alert(
        "✅ 並び順を保存しました"
    );
}


/* =========================================================
   ⭐ 全モード終了
========================================================= */

function favoritesCancelAllModes(){

    favoritesEventDeleteSelecting =
        false;

    favoritesEventShareSelecting =
        false;

    favoritesEventSortSelecting =
        false;

    favoritesPhotoDeleteSelecting =
        false;

    favoritesPhotoShareSelecting =
        false;

    favoritesPhotoSortSelecting =
        false;

    favoritesSelectedEventIds = [];

    favoritesSelectedPhotoIds = [];

    favoritesRenderEvents();

    favoritesRenderPhotos();
}


/* =========================================================
   ⭐ 初期化
========================================================= */

function favoritesInitialize(){

    favoritesInstallViewerEvents();

    favoritesInstallViewerButtons();

    favoritesInstallPhotoSortEvents();

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
        favoritesInitialize
    );

}else{

    favoritesInitialize();

}