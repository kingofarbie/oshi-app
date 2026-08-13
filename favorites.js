/* =========================================================
   ⭐ favorites.js
   お気に入りページ 完全独立システム

   【重要】

   photo.js の写真機能とは完全分離。

   photo.js の以下の変数は使用しない。

   currentPhotoSrc
   currentPhotoIndex
   currentPhotoId
   photoScale
   photoTranslateX
   photoTranslateY
   touchStartX
   touchStartY
   lastDistance
   lastTapTime
   favoriteViewMode
   photoDeleteMode
   photoShareMode
   photoSortMode
   selectedDeletePhotoIds
   selectedSharePhotoIds
   draggingPhotoId
   draggingPhotoElement
   isPhotoDragging
   photoLongPressTimer

   ↓

   favorites.js ではすべて
   favoritePhoto... 系の専用変数を使用する。


   【写真データ】

   ① 1日手帳由来
      data.dayMemories[日付].photos
      photo.favorite === true

   ② お気に入り直接追加
      data.favorites.photos
      favorite.source === "favorite"

   この2種類を
   getAllFavoritePhotoItems()
   で統合して表示する。


   【削除】

   1日手帳由来
      → 元の1日手帳写真も削除
      → お気に入り状態も消える

   直接追加
      → お気に入り側だけ削除


   【ビューア】

   既存 photoViewer / photoViewerImage を使用するが、
   状態管理は完全に favorites.js 専用。


   【重要】

   photo.js / planner.js / planner.html は変更しない。
========================================================= */


/* =========================================================
   ⭐ お気に入りイベント状態
========================================================= */

let favoriteEventDeleteSelecting = false;
let favoriteEventShareSelecting = false;
let favoriteEventSortSelecting = false;

let selectedFavoriteEventIds = [];

let favoriteEventDisplayOrder = [];


/* =========================================================
   ⭐ お気に入り写真状態
========================================================= */

let favoritePhotoDeleteSelecting = false;
let favoritePhotoShareSelecting = false;
let favoritePhotoSortSelecting = false;

let selectedFavoritePhotoIds = [];

let favoritePhotoDisplayOrder = [];


/* =========================================================
   ⭐ お気に入り写真ビューア専用状態
========================================================= */

let favoritePhotoViewerItems = [];

let favoritePhotoViewerIndex = 0;

let favoritePhotoViewerCurrentId = null;

let favoritePhotoViewerSrc = "";

let favoritePhotoViewerScale = 1;

let favoritePhotoViewerTranslateX = 0;

let favoritePhotoViewerTranslateY = 0;

let favoritePhotoViewerTouchStartX = 0;

let favoritePhotoViewerTouchStartY = 0;

let favoritePhotoViewerLastDistance = 0;

let favoritePhotoViewerLastTapTime = 0;

let favoritePhotoViewerDragging = false;

let favoritePhotoViewerDragStartX = 0;

let favoritePhotoViewerDragStartY = 0;


/* =========================================================
   ⭐ お気に入り写真自由並べ替え専用状態
========================================================= */

let favoritePhotoDraggingId = null;

let favoritePhotoDraggingElement = null;

let favoritePhotoIsDragging = false;

let favoritePhotoTouchMoved = false;

let favoritePhotoTouchStartX = 0;

let favoritePhotoTouchStartY = 0;

let favoritePhotoLongPressTimer = null;


/* =========================================================
   ⭐ お気に入り写真表示
========================================================= */

let showAllFavoritePhotos = false;


/* =========================================================
   ⭐ 共通表示
========================================================= */

function displayFavorites(){

    renderFavoriteEvents();

    renderFavoritePhotos();

}


/* =========================================================
   ⭐ データ初期化
========================================================= */

function ensureFavoritesData(data){

    if(!data.favorites){

        data.favorites = {};

    }


    if(
        !Array.isArray(
            data.favorites.events
        )
    ){

        data.favorites.events = [];

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
            data.favorites.eventOrder
        )
    ){

        data.favorites.eventOrder = [];

    }


    if(
        !Array.isArray(
            data.favorites.photoOrder
        )
    ){

        data.favorites.photoOrder = [];

    }


    return data;

}


/* =========================================================
   ⭐ お気に入りイベント取得
========================================================= */

function getFavoriteEvents(){

    const data = db.load();

    return Array.isArray(
        data.favorites?.events
    )
    ?
    data.favorites.events.filter(Boolean)
    :
    [];

}


/* =========================================================
   ⭐ お気に入り写真取得
========================================================= */

function getFavoritePhotos(){

    const data = db.load();

    return Array.isArray(
        data.favorites?.photos
    )
    ?
    data.favorites.photos.filter(Boolean)
    :
    [];

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


    const data = db.load();

    const events =
        Array.isArray(data.events)
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
   ⭐ 1日手帳写真取得
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
                    String(
                        favorite.sourcePhotoId
                    )
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

function getFavoriteEventData(favorite){

    if(
        !favorite
    ){

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
   ⭐ お気に入り写真実体
========================================================= */

function getFavoritePhotoData(favorite){

    if(
        !favorite
    ){

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
   ⭐⭐⭐ お気に入り写真統合取得
========================================================= */

function getAllFavoritePhotoItems(){

    const data = db.load();

    const result = [];


    /* =====================================================
       ① 1日手帳由来
    ===================================================== */

    Object.entries(
        data.dayMemories || {}
    ).forEach(
        ([dayKey, day]) => {

            const photos =
                Array.isArray(day?.photos)
                ?
                day.photos
                :
                [];


            photos.forEach(
                photo => {

                    if(
                        !photo ||
                        !photo.favorite
                    ){

                        return;

                    }


                    result.push({

                        id:
                            String(photo.id),

                        type:
                            "dayPlanner",

                        photo:
                            photo,

                        dayKey:
                            dayKey,

                        sourceId:
                            String(photo.id),

                        favoriteAt:
                            photo.id

                    });

                }
            );

        }
    );


    /* =====================================================
       ② お気に入り直接追加
    ===================================================== */

    const direct =
        Array.isArray(
            data.favorites?.photos
        )
        ?
        data.favorites.photos
        :
        [];


    direct.forEach(
        favorite => {

            if(
                !favorite ||
                favorite.source !== "favorite"
            ){

                return;

            }


            result.push({

                id:
                    String(favorite.id),

                type:
                    "favorite",

                photo:
                    favorite,

                dayKey:
                    null,

                sourceId:
                    String(favorite.id),

                favoriteAt:
                    favorite.favoriteAt ||
                    favorite.id

            });

        }
    );


    return result;

}


/* =========================================================
   ⭐ お気に入り写真IDから取得
========================================================= */

function findFavoritePhotoItem(id){

    const items =
        getAllFavoritePhotoItems();


    return items.find(
        item =>
            String(item.id) ===
            String(id)
    ) || null;

}


/* =========================================================
   ⭐ イベント表示順
========================================================= */

function getOrderedFavoriteEvents(){

    const favorites =
        getFavoriteEvents();


    if(
        favorites.length === 0
    ){

        return [];

    }


    const data = db.load();

    const order =
        Array.isArray(
            data.favorites?.eventOrder
        )
        ?
        data.favorites.eventOrder
        :
        [];


    if(
        order.length === 0
    ){

        return [...favorites];

    }


    const result = [];


    order.forEach(
        id => {

            const item =
                favorites.find(
                    favorite =>
                        String(favorite.id) ===
                        String(id)
                );


            if(item){

                result.push(item);

            }

        }
    );


    favorites.forEach(
        item => {

            const exists =
                result.some(
                    x =>
                        String(x.id) ===
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
   ⭐ 写真表示順
========================================================= */

function getOrderedFavoritePhotos(){

    const items =
        getAllFavoritePhotoItems();


    if(
        items.length === 0
    ){

        return [];

    }


    const data = db.load();

    const order =
        Array.isArray(
            data.favorites?.photoOrder
        )
        ?
        data.favorites.photoOrder
        :
        [];


    if(
        order.length === 0
    ){

        return [...items];

    }


    const result = [];


    order.forEach(
        id => {

            const item =
                items.find(
                    x =>
                        String(x.id) ===
                        String(id)
                );


            if(item){

                result.push(item);

            }

        }
    );


    items.forEach(
        item => {

            const exists =
                result.some(
                    x =>
                        String(x.id) ===
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
   ⭐ イベント表示
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


            if(
                !event
            ){

                return;

            }


            const selected =
                selectedFavoriteEventIds.includes(
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

}


/* =========================================================
   ⭐ 日時
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


    let photos =
        getOrderedFavoritePhotos();


    favoritePhotoDisplayOrder =
        photos.map(
            item => item.id
        );


    if(
        photos.length === 0
    ){

        box.innerHTML = `
            <div class="favorites-empty">
                写真はありません
            </div>
        `;

        return;

    }


    let html = "";


    const displayPhotos =
        showAllFavoritePhotos
        ?
        photos
        :
        photos.slice(
            0,
            6
        );


    displayPhotos.forEach(
        item => {

            const photo =
                item.photo;


            const selected =
                selectedFavoritePhotoIds.includes(
                    String(item.id)
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

    data-favorite-photo-id="${item.id}"

    ${
        favoritePhotoDeleteSelecting
        ?
        `onclick="toggleFavoritePhotoDelete('${item.id}')"`
        :
        ""
    }

    ${
        favoritePhotoShareSelecting
        ?
        `onclick="toggleFavoritePhotoShare('${item.id}')"`
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
            `onclick="openFavoritePhotoViewerNew('${item.id}')"`
            :
            ""
        }

        draggable="false"
    >

</div>

`;

        }
    );


    if(
        photos.length > 6
    ){

        html += `

<div
    class="favorite-more"

    onclick="
        showAllFavoritePhotos =
            !showAllFavoritePhotos;

        renderFavoritePhotos();
    "
>

    ${
        showAllFavoritePhotos
        ?
        "閉じる"
        :
        "もっと見る"
    }

</div>

`;

    }


    box.innerHTML =
        html;

}


/* =========================================================
   ⭐ お気に入り直接追加イベント
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
   ⭐ お気に入り直接追加写真
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
   ⭐ 直接追加写真保存
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
        ensureFavoritesData(
            db.load()
        );


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


                            data.favorites.photos.push({

                                id:
                                    id,

                                source:
                                    "favorite",

                                src:
                                    src,

                                favoriteAt:
                                    Date.now()

                            });


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


            reader.readAsDataURL(
                file
            );

        }
    );


    event.target.value = "";

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


    renderFavoritePhotos();

}


/* =========================================================
   ⭐ 写真削除実行
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
        ensureFavoritesData(
            db.load()
        );


    const targets =
        getAllFavoritePhotoItems()
        .filter(
            item =>
                selectedFavoritePhotoIds.includes(
                    String(item.id)
                )
        );


    if(
        targets.length === 0
    ){

        alert(
            "削除対象の写真が見つかりません"
        );

        return;

    }


    const dayPlannerTargets =
        targets.filter(
            item =>
                item.type ===
                "dayPlanner"
        );


    const directTargets =
        targets.filter(
            item =>
                item.type ===
                "favorite"
        );


    let message =
        "";


    if(
        dayPlannerTargets.length
    ){

        message +=
            `📅 1日手帳由来\n` +
            `${dayPlannerTargets.length}枚\n` +
            `元の1日手帳写真も削除されます。\n\n`;

    }


    if(
        directTargets.length
    ){

        message +=
            `⭐ お気に入り直接追加\n` +
            `${directTargets.length}枚\n` +
            `お気に入りからのみ削除されます。\n\n`;

    }


    message +=
        "削除してよろしいですか？";


    if(
        !confirm(message)
    ){

        return;

    }


    /* =====================================================
       1日手帳由来を削除
    ===================================================== */

    dayPlannerTargets.forEach(
        item => {

            const day =
                data.dayMemories?.[
                    item.dayKey
                ];


            if(
                !day ||
                !Array.isArray(day.photos)
            ){

                return;

            }


            day.photos =
                day.photos.filter(
                    photo =>
                        String(photo.id) !==
                        String(item.sourceId)
                );

        }
    );


    /* =====================================================
       直接追加を削除
    ===================================================== */

    const directIds =
        directTargets.map(
            item =>
                String(item.id)
        );


    data.favorites.photos =
        data.favorites.photos.filter(
            favorite =>
                !directIds.includes(
                    String(favorite.id)
                )
        );


    /* =====================================================
       並び順からも削除
    ===================================================== */

    data.favorites.photoOrder =
        (
            data.favorites.photoOrder ||
            []
        ).filter(
            id =>
                !selectedFavoritePhotoIds.includes(
                    String(id)
                )
        );


    db.save(data);


    favoritePhotoDeleteSelecting =
        false;

    selectedFavoritePhotoIds = [];


    closeFavoritePhotoViewer();


    renderFavoritePhotos();


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


/* =========================================================
   ⭐ 写真共有選択
========================================================= */

function toggleFavoritePhotoShare(id){

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


    renderFavoritePhotos();

}


/* =========================================================
   ⭐ 写真共有
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


    const targets =
        getAllFavoritePhotoItems()
        .filter(
            item =>
                selectedFavoritePhotoIds.includes(
                    String(item.id)
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
                targets[i].photo;


            if(
                !photo ||
                !photo.src
            ){

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
            files.length === 0
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

            files:
                files,

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
   ⭐ 写真並べ替え保存
========================================================= */

function saveFavoritePhotoOrder(){

    const data =
        ensureFavoritesData(
            db.load()
        );


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


    data.favorites.photoOrder =
        order;


    db.save(data);


    favoritePhotoSortSelecting =
        false;


    favoritePhotoDraggingId =
        null;

    favoritePhotoDraggingElement =
        null;


    renderFavoritePhotos();

}


/* =========================================================
   ⭐ 写真並べ替えキャンセル
========================================================= */

function cancelFavoritePhotoSort(){

    favoritePhotoSortSelecting =
        false;

    favoritePhotoDraggingId =
        null;

    favoritePhotoDraggingElement =
        null;


    renderFavoritePhotos();

}


/* =========================================================
   ⭐ お気に入り写真ビューア開始
========================================================= */

function openFavoritePhotoViewerNew(
    favoriteId
){

    const items =
        getOrderedFavoritePhotos();


    const index =
        items.findIndex(
            item =>
                String(item.id) ===
                String(favoriteId)
        );


    if(index < 0){

        return;

    }


    const item =
        items[index];


    if(
        !item ||
        !item.photo ||
        !item.photo.src
    ){

        return;

    }


    favoritePhotoViewerItems =
        items;


    favoritePhotoViewerIndex =
        index;


    favoritePhotoViewerCurrentId =
        String(item.id);


    favoritePhotoViewerSrc =
        item.photo.src;


    favoritePhotoViewerScale =
        1;

    favoritePhotoViewerTranslateX =
        0;

    favoritePhotoViewerTranslateY =
        0;

    favoritePhotoViewerLastDistance =
        0;

    favoritePhotoViewerLastTapTime =
        0;


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
        favoritePhotoViewerSrc;


    image.style.transform =
        "translate(0px,0px) scale(1)";


    viewer.style.display =
        "flex";


    viewer.style.zIndex =
        "9999";


    const deleteBtn =
        document.querySelector(
            ".photo-delete"
        );


    if(deleteBtn){

        deleteBtn.style.display =
            "none";

    }


    const closeBtn =
        document.querySelector(
            ".photo-close"
        );


    if(closeBtn){

        closeBtn.style.right =
            "72px";

    }


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   ⭐ お気に入りビューアを閉じる
========================================================= */

function closeFavoritePhotoViewer(){

    const viewer =
        document.getElementById(
            "photoViewer"
        );


    if(viewer){

        viewer.style.display =
            "none";

    }


    const image =
        document.getElementById(
            "photoViewerImage"
        );


    if(image){

        image.style.transform =
            "translate(0px,0px) scale(1)";

    }


    document.body.style.overflow =
        "";


    favoritePhotoViewerItems =
        [];

    favoritePhotoViewerIndex =
        0;

    favoritePhotoViewerCurrentId =
        null;

    favoritePhotoViewerSrc =
        "";

    favoritePhotoViewerScale =
        1;

    favoritePhotoViewerTranslateX =
        0;

    favoritePhotoViewerTranslateY =
        0;

    favoritePhotoViewerLastDistance =
        0;

    favoritePhotoViewerDragging =
        false;

}


/* =========================================================
   ⭐ 既存 closePhotoViewer からの独立対策
========================================================= */

/*
   お気に入りビューアを閉じる時に
   既存 photo.js の状態へ触れない。

   ボタン側が closePhotoViewer() を呼ぶ場合にも、
   お気に入り表示中ならこちらへ切り替える。
*/

function closeFavoriteViewerIfNeeded(){

    if(
        favoritePhotoViewerCurrentId !== null
    ){

        closeFavoritePhotoViewer();

        return true;

    }


    return false;

}


/* =========================================================
   ⭐ お気に入り写真切り替え
========================================================= */

function showFavoritePhoto(index){

    const items =
        favoritePhotoViewerItems.length
        ?
        favoritePhotoViewerItems
        :
        getOrderedFavoritePhotos();


    if(
        items.length === 0
    ){

        return;

    }


    if(
        index >= items.length
    ){

        index = 0;

    }


    if(
        index < 0
    ){

        index =
            items.length - 1;

    }


    favoritePhotoViewerItems =
        items;


    favoritePhotoViewerIndex =
        index;


    const item =
        items[index];


    if(
        !item ||
        !item.photo
    ){

        return;

    }


    favoritePhotoViewerCurrentId =
        String(item.id);


    favoritePhotoViewerSrc =
        item.photo.src;


    const image =
        document.getElementById(
            "photoViewerImage"
        );


    if(!image){

        return;

    }


    image.src =
        favoritePhotoViewerSrc;


    /*
       写真切り替え時はズーム状態をリセット
    */

    favoritePhotoViewerScale =
        1;

    favoritePhotoViewerTranslateX =
        0;

    favoritePhotoViewerTranslateY =
        0;

    favoritePhotoViewerLastDistance =
        0;


    image.style.transform =
        "translate(0px,0px) scale(1)";

}


/* =========================================================
   ⭐ お気に入りビューア タッチ開始
========================================================= */

function favoritePhotoViewerTouchStart(event){

    if(
        !event.touches ||
        event.touches.length === 0
    ){

        return;

    }


    if(
        event.touches.length === 1
    ){

        favoritePhotoViewerTouchStartX =
            event.touches[0].clientX;

        favoritePhotoViewerTouchStartY =
            event.touches[0].clientY;


        favoritePhotoViewerDragging =
            favoritePhotoViewerScale > 1;


        favoritePhotoViewerDragStartX =
            event.touches[0].clientX;

        favoritePhotoViewerDragStartY =
            event.touches[0].clientY;

    }


    if(
        event.touches.length === 2
    ){

        favoritePhotoViewerLastDistance =
            favoritePhotoViewerGetDistance(
                event.touches
            );

    }

}


/* =========================================================
   ⭐ 距離
========================================================= */

function favoritePhotoViewerGetDistance(
    touches
){

    const dx =
        touches[0].clientX -
        touches[1].clientX;


    const dy =
        touches[0].clientY -
        touches[1].clientY;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


/* =========================================================
   ⭐ お気に入りビューア タッチ移動
========================================================= */

function favoritePhotoViewerTouchMove(
    event
){

    const image =
        document.getElementById(
            "photoViewerImage"
        );


    if(!image){

        return;

    }


    /* =====================================================
       2本指 → ピンチズーム
    ===================================================== */

    if(
        event.touches.length === 2
    ){

        event.preventDefault();


        const distance =
            favoritePhotoViewerGetDistance(
                event.touches
            );


        if(
            favoritePhotoViewerLastDistance > 0
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


            image.style.transform =
                `
                translate(
                    ${favoritePhotoViewerTranslateX}px,
                    ${favoritePhotoViewerTranslateY}px
                )
                scale(
                    ${favoritePhotoViewerScale}
                )
                `;

        }


        favoritePhotoViewerLastDistance =
            distance;


        return;

    }


    /* =====================================================
       拡大中1本指 → 写真移動
    ===================================================== */

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


        image.style.transform =
            `
            translate(
                ${favoritePhotoViewerTranslateX}px,
                ${favoritePhotoViewerTranslateY}px
            )
            scale(
                ${favoritePhotoViewerScale}
            )
            `;


        return;

    }

}


/* =========================================================
   ⭐ お気に入りビューア タッチ終了
========================================================= */

function favoritePhotoViewerTouchEnd(
    event
){

    if(
        event.touches &&
        event.touches.length === 0
    ){

        favoritePhotoViewerLastDistance =
            0;

    }

}


/* =========================================================
   ⭐ お気に入りビューア スワイプ
========================================================= */

function favoritePhotoViewerSwipe(
    event
){

    /*
       拡大中はスワイプしない
    */

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


    if(
        diff < 0
    ){

        showFavoritePhoto(
            favoritePhotoViewerIndex + 1
        );

    }else{

        showFavoritePhoto(
            favoritePhotoViewerIndex - 1
        );

    }

}


/* =========================================================
   ⭐ ダブルタップ
========================================================= */

function favoritePhotoViewerDoubleTap(
    event
){

    if(
        event.changedTouches &&
        event.changedTouches.length !== 1
    ){

        return;

    }


    const now =
        Date.now();


    if(
        now -
        favoritePhotoViewerLastTapTime
        <
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


        const image =
            document.getElementById(
                "photoViewerImage"
            );


        if(image){

            image.style.transform =
                `
                translate(
                    ${favoritePhotoViewerTranslateX}px,
                    ${favoritePhotoViewerTranslateY}px
                )
                scale(
                    ${favoritePhotoViewerScale}
                )
                `;

        }

    }


    favoritePhotoViewerLastTapTime =
        now;

}


/* =========================================================
   ⭐ お気に入りビューア用タッチイベント
========================================================= */

(function setupFavoritePhotoViewerEvents(){

    const image =
        document.getElementById(
            "photoViewerImage"
        );


    if(!image){

        /*
           HTML読み込み時にまだ存在しない場合は
           後から再設定できるようにする。
        */

        return;

    }


    image.addEventListener(
        "touchstart",
        favoritePhotoViewerTouchStart,
        {
            passive: true
        }
    );


    image.addEventListener(
        "touchmove",
        favoritePhotoViewerTouchMove,
        {
            passive: false
        }
    );


    image.addEventListener(
        "touchend",
        function(event){

            favoritePhotoViewerSwipe(
                event
            );

            favoritePhotoViewerTouchEnd(
                event
            );

            favoritePhotoViewerDoubleTap(
                event
            );

        },
        {
            passive: true
        }
    );

})();


/* =========================================================
   ⭐ お気に入り写真ビューアの後からイベント設定
========================================================= */

function setupFavoritePhotoViewer(){

    const image =
        document.getElementById(
            "photoViewerImage"
        );


    if(!image){

        return;

    }


    if(
        image.dataset.favoriteViewerReady ===
        "true"
    ){

        return;

    }


    image.dataset.favoriteViewerReady =
        "true";


    image.addEventListener(
        "touchstart",
        favoritePhotoViewerTouchStart,
        {
            passive: true
        }
    );


    image.addEventListener(
        "touchmove",
        favoritePhotoViewerTouchMove,
        {
            passive: false
        }
    );


    image.addEventListener(
        "touchend",
        function(event){

            favoritePhotoViewerSwipe(
                event
            );

            favoritePhotoViewerTouchEnd(
                event
            );

            favoritePhotoViewerDoubleTap(
                event
            );

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   ⭐ お気に入り写真自由並べ替え
========================================================= */

function setupFavoritePhotoSortEvents(){

    if(
        document.body.dataset.favoritePhotoSortReady ===
        "true"
    ){

        return;

    }


    document.body.dataset.favoritePhotoSortReady =
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
                    "[data-favorite-photo-id]"
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


            favoritePhotoIsDragging =
                false;

            favoritePhotoTouchMoved =
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
                !favoritePhotoIsDragging
            ){

                if(
                    !event.touches.length
                ){

                    return;

                }


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

                }


                return;

            }


            event.preventDefault();


            const touch =
                event.touches[0];


            const boxes =
                [
                    ...document.querySelectorAll(
                        "#favorite-photo-list [data-favorite-photo-id]"
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


            if(
                !targetBox
            ){

                return;

            }


            const parent =
                favoritePhotoDraggingElement.parentNode;


            const next =
                favoritePhotoDraggingElement.nextSibling;


            if(
                next === targetBox
            ){

                parent.insertBefore(
                    targetBox,
                    favoritePhotoDraggingElement
                );

            }else{

                parent.insertBefore(
                    favoritePhotoDraggingElement,
                    targetBox
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

                favoritePhotoDraggingElement.classList.remove(
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
   ⭐ 並べ替えイベントを初期化
========================================================= */

setupFavoritePhotoSortEvents();


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
        ensureFavoritesData(
            db.load()
        );


    const targets =
        data.favorites.events.filter(
            favorite =>
                selectedFavoriteEventIds.includes(
                    String(favorite.id)
                )
        );


    let message =
        "";


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


    if(
        dayPlannerTargets.length
    ){

        message +=
            `📅 1日手帳からのお気に入り\n` +
            `${dayPlannerTargets.length}件\n` +
            `元の1日手帳予定も削除されます。\n\n`;

    }


    if(
        directTargets.length
    ){

        message +=
            `⭐ お気に入り直接追加\n` +
            `${directTargets.length}件\n` +
            `お気に入りからのみ削除されます。\n\n`;

    }


    message +=
        "削除してよろしいですか？";


    if(
        !confirm(message)
    ){

        return;

    }


    /* 1日手帳イベント削除 */

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


    /* お気に入り削除 */

    data.favorites.events =
        data.favorites.events.filter(
            favorite =>
                !selectedFavoriteEventIds.includes(
                    String(favorite.id)
                )
        );


    /* 並び順削除 */

    data.favorites.eventOrder =
        (
            data.favorites.eventOrder ||
            []
        ).filter(
            id =>
                !selectedFavoriteEventIds.includes(
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


/* =========================================================
   ⭐ イベント並べ替え保存
========================================================= */

function saveFavoriteEventOrder(){

    const data =
        ensureFavoritesData(
            db.load()
        );


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
                String(
                    item.dataset.favoriteEventId
                )
        );


    db.save(data);


    favoriteEventSortSelecting =
        false;


    renderFavoriteEvents();

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


    renderFavoriteEvents();

}


/* =========================================================
   ⭐ イベント共有選択
========================================================= */

function toggleFavoriteEventShare(id){

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


    renderFavoriteEvents();

}


/* =========================================================
   ⭐ イベント共有
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


    const targets =
        getFavoriteEvents()
        .filter(
            favorite =>
                selectedFavoriteEventIds.includes(
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


    try{

        if(
            navigator.share
        ){

            await navigator.share({

                title:
                    "推し活手帳",

                text:
                    text

            });

        }else{

            alert(text);

        }

    }catch(error){

        console.log(
            "お気に入りイベント共有:",
            error
        );

    }


    favoriteEventShareSelecting =
        false;

    selectedFavoriteEventIds = [];


    renderFavoriteEvents();

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


    favoritePhotoDraggingId =
        null;

    favoritePhotoDraggingElement =
        null;


    renderFavoriteEvents();

    renderFavoritePhotos();

}