/* =========================================================
   ⭐ favorites-photo.js
   お気に入り写真 完全独立版
   =========================================================

   【重要】
   ・photo.jsは変更しない
   ・photo.jsの関数を使用しない
   ・photo.jsの状態変数を使用しない
   ・ビューア完全独立
   ・削除完全独立
   ・共有完全独立
   ・並べ替え完全独立
   ========================================================= */


/* =========================================================
   ⭐ お気に入り写真専用状態
========================================================= */

let favoritePhotoDeleteSelecting = false;
let favoritePhotoShareSelecting = false;
let favoritePhotoSortSelecting = false;

let selectedFavoritePhotoIds = [];

let favoritePhotoDisplayOrder = [];

let favoritePhotoShowAll = false;


/* =========================================================
   ⭐ お気に入り写真ビューア専用状態
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
   ⭐ 並べ替え専用状態
========================================================= */

let favoritePhotoDraggingId = null;

let favoritePhotoDraggingElement = null;

let favoritePhotoIsDragging = false;

let favoritePhotoTouchMoved = false;

let favoritePhotoTouchStartX = 0;

let favoritePhotoTouchStartY = 0;

let favoritePhotoLongPressTimer = null;


/* =========================================================
   ⭐ お気に入り写真取得
========================================================= */

function favoritePhotoGetPhotos(){

    const data = db.load();

    const photos =
        data.favorites?.photos || [];


    if(!Array.isArray(photos)){
        return [];
    }

    return photos.filter(
        photo => !!photo
    );

}


/* =========================================================
   ⭐ 1日手帳由来写真取得
========================================================= */

function favoritePhotoGetSourcePhoto(
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
   ⭐ 実際に表示する写真取得
========================================================= */

function favoritePhotoGetData(
    favorite
){

    if(!favorite){
        return null;
    }

    if(
        favorite.source ===
        "dayPlanner"
    ){

        const result =
            favoritePhotoGetSourcePhoto(
                favorite
            );

        return result
            ? result.photo
            : null;

    }

    if(
        favorite.source ===
        "favorite"
    ){

        return favorite;

    }

    return null;

}


/* =========================================================
   ⭐ 写真表示順取得
========================================================= */

function favoritePhotoGetOrdered(){

    const data = db.load();

    const result = [];

    /* =====================================================
       1日手帳からお気に入り写真を取得
    ===================================================== */

    const memories =
        data.dayMemories || {};

    Object.entries(memories).forEach(
        ([dayKey, day]) => {

            const photos =
                day?.photos || [];

            if(!Array.isArray(photos)){
                return;
            }

            photos.forEach(
                photo => {

                    if(
                        photo &&
                        photo.favorite === true
                    ){

                        result.push({

                            id:
                                photo.id,

                            source:
                                "dayPlanner",

                            sourcePhotoId:
                                photo.id,

                            src:
                                photo.src,

                            favoriteAt:
                                photo.favoriteAt ||
                                photo.favoriteOrder ||
                                0

                        });

                    }

                }
            );

        }
    );


    /* =====================================================
       直接追加お気に入り写真
       ※ 今後使用するため残しておく
    ===================================================== */

    const directFavorites =
        data.favorites?.photos || [];

    if(
        Array.isArray(
            directFavorites
        )
    ){

        directFavorites.forEach(
            photo => {

                if(!photo){
                    return;
                }

                /*
                 * 1日手帳由来として
                 * すでに取得した写真と
                 * 同じIDなら重複させない
                 */

                const exists =
                    result.some(
                        item =>
                            String(item.id) ===
                            String(photo.id)
                    );

                if(!exists){

                    result.push(
                        photo
                    );

                }

            }
        );

    }


    /* =====================================================
       保存されている並び順があれば反映
    ===================================================== */

    const order =
        data.favorites?.photoOrder || [];


    if(
        Array.isArray(order) &&
        order.length > 0
    ){

        const ordered = [];


        order.forEach(
            id => {

                const photo =
                    result.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );

                if(photo){

                    ordered.push(
                        photo
                    );

                }

            }
        );


        result.forEach(
            photo => {

                const exists =
                    ordered.some(
                        item =>
                            String(item.id) ===
                            String(photo.id)
                    );

                if(!exists){

                    ordered.push(
                        photo
                    );

                }

            }
        );


        return ordered;

    }


    return result;

}



/* =========================================================
   ⭐ 写真一覧表示
========================================================= */

function favoritePhotoRender(){

    const box =
        document.getElementById(
            "favorite-photo-list"
        );

    if(!box){
        return;
    }

    const photos =
        favoritePhotoGetOrdered();

    favoritePhotoDisplayOrder =
        photos.map(
            photo => photo.id
        );


    if(
        photos.length === 0
    ){

        box.innerHTML = `
            <div class="favorites-empty">
                📷
                <br>
                お気に入り写真はありません
            </div>
        `;

        return;

    }


    let html = "";


    /* =====================================================
       削除モード
    ===================================================== */

    if(
        favoritePhotoDeleteSelecting
    ){

        html += `
            <div class="favorite-photo-action-bar">

                <span>
                    🗑 ${selectedFavoritePhotoIds.length}枚選択
                </span>

                <button
                    type="button"
                    onclick="favoritePhotoCancelDelete()">
                    キャンセル
                </button>

                <button
                    type="button"
                    onclick="favoritePhotoConfirmDelete()"
                    ${
                        selectedFavoritePhotoIds.length === 0
                        ? "disabled"
                        : ""
                    }>
                    🗑 削除
                </button>

            </div>
        `;

    }


    /* =====================================================
       共有モード
    ===================================================== */

    if(
        favoritePhotoShareSelecting
    ){

        html += `
            <div class="favorite-photo-action-bar">

                <span>
                    📤 ${selectedFavoritePhotoIds.length}枚選択
                </span>

                <button
                    type="button"
                    onclick="favoritePhotoCancelShare()">
                    キャンセル
                </button>

                <button
                    type="button"
                    onclick="favoritePhotoShareSelected()"
                    ${
                        selectedFavoritePhotoIds.length === 0
                        ? "disabled"
                        : ""
                    }>
                    📤 共有
                </button>

            </div>
        `;

    }


    /* =====================================================
       自由並べ替え
    ===================================================== */

    if(
        favoritePhotoSortSelecting
    ){

        html += `
            <div class="favorite-photo-sort-bar">

                <span>
                    🔀 写真をドラッグして並べ替え
                </span>

                <button
                    type="button"
                    onclick="favoritePhotoFinishSort()">
                    完了
                </button>

            </div>
        `;

    }


    /* =====================================================
       写真本体
    ===================================================== */

    photos.forEach(
        favorite => {

            const photo =
                favoritePhotoGetData(
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


            const id =
                String(favorite.id);


            const selected =
                selectedFavoritePhotoIds.includes(
                    id
                );


            const selectable =
                favoritePhotoDeleteSelecting ||
                favoritePhotoShareSelecting;


            html += `

                <div
                    class="
                        favorite-photo-item
                        ${
                            selected
                            ?
                            "favorite-photo-selected"
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

                    data-favorite-photo-id="${id}"

                    ${
                        selectable
                        ?
                        `onclick="favoritePhotoToggleSelect('${id}')"`
                        :
                        ""
                    }
                >

                    <img
                        src="${photo.src}"
                        class="favorite-photo-image"

                        draggable="false"

                        ${
                            !selectable &&
                            !favoritePhotoSortSelecting
                            ?
                            `onclick="favoritePhotoOpenViewer('${id}')"`
                            :
                            ""
                        }
                    >

                    ${
                        selectable
                        ?
                        `
                            <div
                                class="favorite-photo-check">
                                ${
                                    selected
                                    ? "✓"
                                    : ""
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
                📷
                <br>
                お気に入り写真はありません
            </div>
        `;

}


/* =========================================================
   ⭐ 写真追加
========================================================= */

function favoritePhotoOpenPicker(){

    const picker =
        document.getElementById(
            "favoritePhotoPicker"
        );

    if(!picker){
        return;
    }

    picker.click();

}


/* =========================================================
   ⭐ 写真選択後
========================================================= */

function favoritePhotoSelected(
    event
){

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

                    const image =
                        new Image();


                    image.onload =
                        function(){

                            const MAX =
                                1000;

                            let width =
                                image.width;

                            let height =
                                image.height;


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
                                id
                            );


                            completed++;


                            if(
                                completed >=
                                files.length
                            ){

                                db.save(
                                    data
                                );

                                favoritePhotoRender();

                            }

                        };


                    image.src =
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
   ⭐ 選択モード
========================================================= */

function favoritePhotoDeleteMode(){

    favoritePhotoDeleteSelecting =
        true;

    favoritePhotoShareSelecting =
        false;

    favoritePhotoSortSelecting =
        false;

    selectedFavoritePhotoIds = [];

    favoritePhotoRender();

}


function favoritePhotoShareMode(){

    favoritePhotoDeleteSelecting =
        false;

    favoritePhotoShareSelecting =
        true;

    favoritePhotoSortSelecting =
        false;

    selectedFavoritePhotoIds = [];

    favoritePhotoRender();

}


/* =========================================================
   ⭐ 写真選択切り替え
========================================================= */

function favoritePhotoToggleSelect(
    id
){

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


    favoritePhotoRender();

}


/* =========================================================
   ⭐ 削除キャンセル
========================================================= */

function favoritePhotoCancelDelete(){

    favoritePhotoDeleteSelecting =
        false;

    selectedFavoritePhotoIds = [];

    favoritePhotoRender();

}


/* =========================================================
   ⭐ 共有キャンセル
========================================================= */

function favoritePhotoCancelShare(){

    favoritePhotoShareSelecting =
        false;

    selectedFavoritePhotoIds = [];

    favoritePhotoRender();

}


/* =========================================================
   ⭐ 選択写真削除
========================================================= */

function favoritePhotoConfirmDelete(){

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


    const photos =
        data.favorites.photos || [];


    const targets =
        photos.filter(
            photo =>
                selectedFavoritePhotoIds.includes(
                    String(photo.id)
                )
        );


    const dayPlannerTargets =
        targets.filter(
            photo =>
                photo.source ===
                "dayPlanner"
        );


    const directTargets =
        targets.filter(
            photo =>
                photo.source ===
                "favorite"
        );


    let message = "";


    if(
        dayPlannerTargets.length
    ){

        message +=
            `📅 1日手帳由来：${dayPlannerTargets.length}枚\n` +
            "お気に入りから削除すると、" +
            "元の1日手帳写真も削除されます。\n\n";

    }


    if(
        directTargets.length
    ){

        message +=
            `⭐ 直接追加：${directTargets.length}枚\n` +
            "お気に入りからのみ削除されます。\n\n";

    }


    message +=
        "削除してよろしいですか？";


    if(
        !confirm(message)
    ){

        return;

    }


    /* =====================================================
       1日手帳由来写真を削除
    ===================================================== */

    dayPlannerTargets.forEach(
        favorite => {

            const source =
                favoritePhotoGetSourcePhoto(
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


    /* =====================================================
       お気に入りから削除
    ===================================================== */

    data.favorites.photos =
        photos.filter(
            photo =>
                !selectedFavoritePhotoIds.includes(
                    String(photo.id)
                )
        );


    data.favorites.photoOrder =
        (
            data.favorites.photoOrder || []
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


    favoritePhotoRender();

}


/* =========================================================
   ⭐ 写真共有
========================================================= */

async function favoritePhotoShareSelected(){

    if(
        selectedFavoritePhotoIds.length === 0
    ){

        alert(
            "共有する写真を選択してください"
        );

        return;

    }


    const favorites =
        favoritePhotoGetPhotos();


    const targets =
        favorites.filter(
            photo =>
                selectedFavoritePhotoIds.includes(
                    String(photo.id)
                )
        );


    if(
        !navigator.share
    ){

        alert(
            "この端末では共有機能に対応していません"
        );

        return;

    }


    try{

        const files = [];


        for(
            let i = 0;
            i < targets.length;
            i++
        ){

            const photo =
                favoritePhotoGetData(
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
                    `oshi-favorite-${i + 1}.jpg`,
                    {
                        type:
                            blob.type ||
                            "image/jpeg"
                    }
                )
            );

        }


        if(
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


        favoritePhotoCancelShare();

    }catch(error){

        console.log(
            "お気に入り写真共有エラー:",
            error
        );

    }

}


/* =========================================================
   ⭐ 並べ替え開始
========================================================= */

function favoritePhotoSortMode(){

    favoritePhotoDeleteSelecting =
        false;

    favoritePhotoShareSelecting =
        false;

    favoritePhotoSortSelecting =
        true;

    selectedFavoritePhotoIds = [];

    favoritePhotoRender();

}


/* =========================================================
   ⭐ 並べ替え保存
========================================================= */

function favoritePhotoFinishSort(){

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


    favoritePhotoRender();

}


/* =========================================================
   ⭐ ビューアを開く
========================================================= */

function favoritePhotoOpenViewer(
    favoriteId
){

console.log("★★★★★ お気に入り写真ビューア呼び出し ★★★★★", favoriteId);


    const favorites =
        favoritePhotoGetOrdered();


    const index =
        favorites.findIndex(
            photo =>
                String(photo.id) ===
                String(favoriteId)
        );


    if(index < 0){
        return;
    }


    const favorite =
        favorites[index];


    const photo =
        favoritePhotoGetData(
            favorite
        );


    if(!photo){
        return;
    }


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
            "favoritePhotoViewer"
        );


    const image =
        document.getElementById(
            "favoritePhotoViewerImage"
        );


    if(
        !viewer ||
        !image
    ){

        return;

    }


    image.src =
        photo.src;


    favoritePhotoApplyTransform();


    viewer.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   ⭐ ビューア画像変形
========================================================= */

function favoritePhotoApplyTransform(){

    const image =
        document.getElementById(
            "favoritePhotoViewerImage"
        );


    if(!image){
        return;
    }


    image.style.transform =
        `translate(${favoritePhotoViewerTranslateX}px,${favoritePhotoViewerTranslateY}px) scale(${favoritePhotoViewerScale})`;

}


/* =========================================================
   ⭐ ビューア写真切り替え
========================================================= */

function favoritePhotoShow(
    index
){

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
        favoritePhotoGetOrdered();


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
        favoritePhotoGetData(
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
            "favoritePhotoViewerImage"
        );


    if(image){

        image.src =
            photo.src;

        favoritePhotoApplyTransform();

    }

}


/* =========================================================
   ⭐ 前へ
========================================================= */

function favoritePhotoPrevious(){

    favoritePhotoShow(
        favoritePhotoViewerIndex - 1
    );

}


/* =========================================================
   ⭐ 次へ
========================================================= */

function favoritePhotoNext(){

    favoritePhotoShow(
        favoritePhotoViewerIndex + 1
    );

}


/* =========================================================
   ⭐ ビューア閉じる
========================================================= */

function favoritePhotoCloseViewer(){

    const viewer =
        document.getElementById(
            "favoritePhotoViewer"
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
   ⭐ スワイプ
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


    const endX =
        event.changedTouches[0].clientX;


    const diff =
        endX -
        favoritePhotoViewerTouchStartX;


    if(
        Math.abs(diff) < 60
    ){

        return;

    }


    if(diff < 0){

        favoritePhotoNext();

    }else{

        favoritePhotoPrevious();

    }

}


/* =========================================================
   ⭐ ピンチ・ドラッグ
========================================================= */

function favoritePhotoPinch(
    event
){

    if(
        !favoritePhotoViewerIsOpen
    ){

        return;

    }


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


            favoritePhotoViewerScale =
                Math.max(
                    1,
                    Math.min(
                        4,
                        favoritePhotoViewerScale
                    )
                );


            favoritePhotoApplyTransform();

        }


        favoritePhotoViewerLastDistance =
            distance;


        return;

    }


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


        favoritePhotoApplyTransform();

    }

}


/* =========================================================
   ⭐ ダブルタップ
========================================================= */

function favoritePhotoDoubleTap(
    event
){

    if(
        !favoritePhotoViewerIsOpen
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


        favoritePhotoApplyTransform();

    }


    favoritePhotoViewerLastTapTime =
        now;

}


/* =========================================================
   ⭐ ドラッグ開始
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
        event.touches.length !== 1
    ){

        return;

    }


    const x =
        event.touches[0].clientX;


    const y =
        event.touches[0].clientY;


    favoritePhotoViewerTouchStartX =
        x;


    favoritePhotoViewerDragStartX =
        x;


    favoritePhotoViewerDragStartY =
        y;

}


/* =========================================================
   ⭐ ドラッグ終了
========================================================= */

function favoritePhotoDragEnd(){

    favoritePhotoViewerLastDistance =
        0;

}


/* =========================================================
   ⭐ ビューア現在写真削除
========================================================= */

function favoritePhotoDeleteCurrent(){

    if(
        favoritePhotoViewerCurrentId == null
    ){

        return;

    }


    const data =
        db.load();


    const favorites =
        data.favorites?.photos || [];


    const target =
        favorites.find(
            photo =>
                String(photo.id) ===
                String(
                    favoritePhotoViewerCurrentId
                )
        );


    if(!target){
        return;
    }


    let message;


    if(
        target.source ===
        "dayPlanner"
    ){

        message =
            "この写真は1日手帳由来です。\n\n" +
            "お気に入りから削除すると、" +
            "元の1日手帳写真も削除されます。\n\n" +
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


    if(
        target.source ===
        "dayPlanner"
    ){

        const source =
            favoritePhotoGetSourcePhoto(
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


    data.favorites.photos =
        favorites.filter(
            photo =>
                String(photo.id) !==
                String(target.id)
        );


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


    const remaining =
        favoritePhotoGetOrdered();


    if(
        remaining.length === 0
    ){

        favoritePhotoCloseViewer();

        favoritePhotoRender();

        return;

    }


    favoritePhotoViewerIds =
        remaining.map(
            photo => photo.id
        );


    let nextIndex =
        favoritePhotoViewerIndex;


    if(
        nextIndex >=
        remaining.length
    ){

        nextIndex =
            remaining.length - 1;

    }


    favoritePhotoShow(
        nextIndex
    );


    favoritePhotoRender();

}


/* =========================================================
   ⭐ ビューア現在写真共有
========================================================= */

async function favoritePhotoShareCurrent(){

    if(
        favoritePhotoViewerCurrentId == null
    ){

        return;

    }


    const favorites =
        favoritePhotoGetPhotos();


    const favorite =
        favorites.find(
            photo =>
                String(photo.id) ===
                String(
                    favoritePhotoViewerCurrentId
                )
        );


    if(!favorite){
        return;
    }


    const photo =
        favoritePhotoGetData(
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
   ⭐ 写真自由並べ替え
========================================================= */

function favoritePhotoInstallSortEvents(){

    if(
        document.body.dataset
            .favoritePhotoSortInstalled ===
        "true"
    ){

        return;

    }


    document.body.dataset
        .favoritePhotoSortInstalled =
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
                    ".favorite-photo-sort-item"
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
                            "favorite-photo-dragging"
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
                !favoritePhotoSortSelecting ||
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
                        ".favorite-photo-sort-item"
                    )
                ];


            let target =
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

                        target =
                            box;

                    }

                }
            );


            if(!target){
                return;
            }


            const parent =
                favoritePhotoDraggingElement.parentNode;


            parent.insertBefore(
                favoritePhotoDraggingElement,
                target
            );

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
                        "favorite-photo-dragging"
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
   ⭐ 初期化
========================================================= */

function favoritePhotoInitialize(){

    favoritePhotoInstallSortEvents();

    favoritePhotoRender();

}


if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        favoritePhotoInitialize
    );

}else{

    favoritePhotoInitialize();

}


/* =========================================================
   📷 お気に入り写真表示
   DBからお気に入り写真だけを取得して表示する

   ※ お気に入りページ全体は表示しない
   ※ イベントは扱わない
   ※ 並べ替えボタンは生成しない
   ※ favoritesDisplay() は使用しない
========================================================= */

/* =========================================================
   📷 お気に入り写真表示
   DBからお気に入り写真だけを取得して表示する

   ※ お気に入りページ全体は表示しない
   ※ イベントは扱わない
   ※ 並べ替えボタンは生成しない
   ※ favoritesDisplay() は使用しない
========================================================= */

function displayFavoritePhotos(){

    const data = db.load();

    if(!data){
        return;
    }

    favoritePhotoRender();
}