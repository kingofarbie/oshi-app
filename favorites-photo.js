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

let favoritePhotoViewerFavoritePendingIds = [];

let favoritePhotoViewerScale = 1;

let favoritePhotoViewerTranslateX = 0;

let favoritePhotoViewerTranslateY = 0;

let favoritePhotoViewerLastDistance = 0;

let favoritePhotoViewerTouchStartX = 0;

let favoritePhotoViewerTouchStartY = 0;

let favoritePhotoViewerDragStartX = 0;

let favoritePhotoViewerDragStartY = 0;

let favoritePhotoViewerLastTapTime = 0;

let favoritePhotoViewerIsOpen = false;



let favoritePhotoViewerFavoritePending = false;



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


    /* =====================================================
       お気に入りページに現在表示されている写真を取得

       1日手帳由来 ＋ 直接追加
    ===================================================== */

    const photos =
        favoritePhotoGetOrdered();


    const targets =
        photos.filter(
            photo =>
                selectedFavoritePhotoIds.includes(
                    String(photo.id)
                )
        );


    /* =====================================================
       📅 1日手帳由来
    ===================================================== */

    const dayPlannerTargets =
        targets.filter(
            photo =>
                photo.source ===
                "dayPlanner"
        );


    /* =====================================================
       ⭐ 直接追加
    ===================================================== */

    const directTargets =
        targets.filter(
            photo =>
                photo.source ===
                "favorite"
        );


    let message = "";


    /* =====================================================
       確認メッセージ
    ===================================================== */

    if(
        dayPlannerTargets.length
    ){

        message +=
            `📅 1日手帳由来：${dayPlannerTargets.length}枚\n` +
            "お気に入りから外します。\n" +
            "1日手帳の写真は残ります。\n\n";

    }


    if(
        directTargets.length
    ){

        message +=
            `⭐ 直接追加：${directTargets.length}枚\n` +
            "アプリ内のお気に入り登録を削除します。\n\n";

    }


    if(
        !message
    ){

        alert(
            "削除対象の写真が見つかりませんでした。"
        );

        return;

    }


    message +=
        "実行してよろしいですか？";


    if(
        !confirm(message)
    ){

        return;

    }


    /* =====================================================
       📅 1日手帳由来
       元の写真は残してお気に入りだけ解除
    ===================================================== */

    const memories =
        data.dayMemories || {};


    dayPlannerTargets.forEach(
        favorite => {

            Object.values(memories).forEach(
                day => {

                    if(
                        !day ||
                        !Array.isArray(
                            day.photos
                        )
                    ){

                        return;

                    }


                    const photo =
                        day.photos.find(
                            item =>
                                String(item.id) ===
                                String(
                                    favorite.sourcePhotoId
                                )
                        );


                    if(photo){

                        /* お気に入り解除 */

                        photo.favorite =
                            false;


                        /* お気に入り関連情報も解除 */

                        delete photo.favoriteOrder;

                        delete photo.favoriteAt;

                    }

                }
            );

        }
    );


    /* =====================================================
       ⭐ お気に入り登録データから削除

       1日手帳由来の場合も、
       直接追加の場合も、
       お気に入りページの登録データは削除する。

       ※ 1日手帳の元写真そのものは削除しない
    ===================================================== */

    if(
        !data.favorites
    ){

        data.favorites = {};

    }


    const favoritePhotos =
        data.favorites.photos || [];


    data.favorites.photos =
        favoritePhotos.filter(
            photo =>
                !selectedFavoritePhotoIds.includes(
                    String(photo.id)
                )
        );


    /* =====================================================
       🔀 並べ替え情報からも削除
    ===================================================== */

    data.favorites.photoOrder =
        (
            data.favorites.photoOrder || []
        ).filter(
            id =>
                !selectedFavoritePhotoIds.includes(
                    String(id)
                )
        );


    /* =====================================================
       保存
    ===================================================== */

    db.save(data);


    console.log(
        "削除処理完了:",
        selectedFavoritePhotoIds
    );


    /* =====================================================
       選択状態解除
    ===================================================== */

    favoritePhotoDeleteSelecting =
        false;


    selectedFavoritePhotoIds =
        [];


    /* =====================================================
       再表示
    ===================================================== */

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
        favoritePhotoGetOrdered();


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



function favoritePhotoViewerTouchStart(
    event
){

    if(
        !favoritePhotoViewerIsOpen
    ){

        return;

    }


    /*
     * 1本指だけを対象にする
     */
    if(
        !event.touches ||
        event.touches.length !== 1
    ){

        return;

    }


    const touch =
        event.touches[0];


    /*
     * ⭐ スワイプ開始位置
     */
    favoritePhotoViewerTouchStartX =
        touch.clientX;


    favoritePhotoViewerTouchStartY =
        touch.clientY;


    /*
     * 📷 拡大写真のドラッグ開始位置
     */
    favoritePhotoViewerDragStartX =
        touch.clientX;


    favoritePhotoViewerDragStartY =
        touch.clientY;


    /*
     * ピンチ距離をリセット
     */
    favoritePhotoViewerLastDistance =
        0;

}


/* =========================================================
   ⭐ ビューアを開く
========================================================= */

function favoritePhotoOpenViewer(
    favoriteId
){

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


    /* =====================================================
       ビューア対象写真
    ===================================================== */

    favoritePhotoViewerIds =
        favorites.map(
            item => item.id
        );


    favoritePhotoViewerIndex =
        index;


    favoritePhotoViewerCurrentId =
        favorite.id;


    /* =====================================================
       ⭐ 新しくビューアを開いたら
       解除予定をリセット
    ===================================================== */

    favoritePhotoViewerFavoritePendingIds =
        [];


    /* =====================================================
       ビューア状態初期化
    ===================================================== */

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

    favoritePhotoViewerIsOpen =
        true;


    /* =====================================================
       HTML取得
    ===================================================== */

    const viewer =
        document.getElementById(
            "favoritePhotoViewer"
        );


    const image =
        document.getElementById(
            "favoritePhotoViewerImage"
        );


    const favoriteButton =
        document.getElementById(
            "favoritePhotoViewerFavorite"
        );


    const deleteButton =
        document.getElementById(
            "favoritePhotoViewerDelete"
        );


    if(
        !viewer ||
        !image
    ){

        return;

    }


    /* =====================================================
       写真表示
    ===================================================== */

    image.src =
        photo.src;


    /* =====================================================
       ⭐ / 🗑 ボタン表示制御
       
       📅 1日手帳由来
       → ⭐表示
       → 🗑非表示
       
       ⭐ 直接追加
       → ⭐非表示
       → 🗑表示
    ===================================================== */

    if(
        favorite.source ===
        "dayPlanner"
    ){

        if(favoriteButton){

            favoriteButton.style.display =
                "flex";

            favoriteButton.textContent =
                "⭐";

        }


        if(deleteButton){

            deleteButton.style.display =
                "none";

        }

    }


    else{

        if(favoriteButton){

            favoriteButton.style.display =
                "none";

        }


        if(deleteButton){

            deleteButton.style.display =
                "flex";

        }

    }


    /* =====================================================
       画像位置リセット
    ===================================================== */

    favoritePhotoApplyTransform();


    /* =====================================================
       ビューア表示
    ===================================================== */

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


    /*
     * 最後まで行ったら最初へ
     */
    if(
        index >=
        favoritePhotoViewerIds.length
    ){

        index = 0;

    }


    /*
     * 最初より前なら最後へ
     */
    if(
        index < 0
    ){

        index =
            favoritePhotoViewerIds.length - 1;

    }


    favoritePhotoViewerIndex =
        index;


    /*
     * 次に表示する写真ID
     */
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


    /*
     * 現在写真IDを更新
     */
    favoritePhotoViewerCurrentId =
        favorite.id;


    /*
     * 写真切り替え時は
     * ズーム状態をリセット
     */
    favoritePhotoViewerScale =
        1;

    favoritePhotoViewerTranslateX =
        0;

    favoritePhotoViewerTranslateY =
        0;

    favoritePhotoViewerLastDistance =
        0;


    /*
     * 写真表示
     */
    const image =
        document.getElementById(
            "favoritePhotoViewerImage"
        );


    if(image){

        image.src =
            photo.src;

        favoritePhotoApplyTransform();

    }


    /*
     * =====================================================
     * ⭐ / 🗑 ボタン切り替え
     * =====================================================
     */

    const favoriteButton =
        document.getElementById(
            "favoritePhotoViewerFavorite"
        );


    const deleteButton =
        document.getElementById(
            "favoritePhotoViewerDelete"
        );


    /*
     * 1日手帳由来
     */
    if(
        favorite.source ===
        "dayPlanner"
    ){

        if(favoriteButton){

            favoriteButton.style.display =
                "flex";


            /*
             * この写真が解除予定なら ☆
             * 解除予定でなければ ⭐
             */
            favoriteButton.textContent =
                favoritePhotoViewerFavoritePendingIds.includes(
                    String(favorite.id)
                )
                ? "☆"
                : "⭐";

        }


        if(deleteButton){

            deleteButton.style.display =
                "none";

        }

    }


    /*
     * 直接追加
     */
    else{

        if(favoriteButton){

            favoriteButton.style.display =
                "none";

        }


        if(deleteButton){

            deleteButton.style.display =
                "flex";

        }

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

    /*
     * ⭐解除予定になっている写真を
     * ビューアを閉じる瞬間にまとめて確定
     */
    if(
        Array.isArray(
            favoritePhotoViewerFavoritePendingIds
        ) &&
        favoritePhotoViewerFavoritePendingIds.length > 0
    ){

        const data =
            db.load();

        const memories =
            data.dayMemories || {};


        Object.values(memories).forEach(
            day => {

                if(
                    !day ||
                    !Array.isArray(
                        day.photos
                    )
                ){

                    return;

                }


                day.photos.forEach(
                    photo => {

                        if(
                            favoritePhotoViewerFavoritePendingIds
                                .includes(
                                    String(photo.id)
                                )
                        ){

                            /*
                             * ⭐お気に入り解除
                             */
                            photo.favorite =
                                false;


                            delete photo.favoriteAt;

                            delete photo.favoriteOrder;

                        }

                    }
                );

            }
        );


        /*
         * DB保存
         */
        db.save(data);

    }


    /*
     * ビューアを閉じる
     */
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


    /*
     * ビューア状態リセット
     */
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


    /*
     * ⭐解除予定を全部リセット
     *
     * 次にビューアを開いたときに
     * 前回の解除予定が残らないようにする
     */
    favoritePhotoViewerFavoritePendingIds =
        [];


    /*
     * ボタンを⭐に戻す
     */
    const favoriteButton =
        document.getElementById(
            "favoritePhotoViewerFavorite"
        );


    if(favoriteButton){

        favoriteButton.textContent =
            "⭐";

    }


    /*
     * お気に入りページを更新
     */
    favoritePhotoRender();

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


    /*
     * 拡大中はスワイプで写真を切り替えない
     */
    if(
        favoritePhotoViewerScale > 1
    ){

        return;

    }


    /*
     * 指1本で終了した場合だけ判定
     */
    if(
        !event.changedTouches ||
        event.changedTouches.length !== 1
    ){

        return;

    }


    const touch =
        event.changedTouches[0];


    /*
     * 開始位置
     */
    const startX =
        favoritePhotoViewerTouchStartX;

    const startY =
        favoritePhotoViewerTouchStartY;


    /*
     * 終了位置
     */
    const endX =
        touch.clientX;

    const endY =
        touch.clientY;


    /*
     * 移動量
     */
    const diffX =
        endX -
        startX;

    const diffY =
        endY -
        startY;


    /*
     * =====================================================
     * タップ判定
     *
     * 横方向の移動が60px未満なら
     * 写真を切り替えない
     * =====================================================
     */

    if(
        Math.abs(diffX) < 60
    ){

        return;

    }


    /*
     * =====================================================
     * 縦方向の移動の方が大きい場合
     *
     * 縦スクロール的な操作なので
     * 写真を切り替えない
     * =====================================================
     */

    if(
        Math.abs(diffY) >=
        Math.abs(diffX)
    ){

        return;

    }


    /*
     * =====================================================
     * 左へスワイプ
     * → 次の写真
     * =====================================================
     */

    if(
        diffX < 0
    ){

        favoritePhotoNext();

    }


    /*
     * =====================================================
     * 右へスワイプ
     * → 前の写真
     * =====================================================
     */

    else{

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
   ⭐ ビューア現在写真 お気に入り解除予約
========================================================= */

function favoritePhotoToggleCurrentFavorite(){

    if(
        favoritePhotoViewerCurrentId == null
    ){

        return;

    }


    /*
     * 現在表示している写真ID
     */
    const id =
        String(
            favoritePhotoViewerCurrentId
        );


    /*
     * 1日手帳由来の写真だけ
     * ⭐解除処理を行う
     */
    const favorites =
        favoritePhotoGetOrdered();


    const favorite =
        favorites.find(
            item =>
                String(item.id) ===
                id
        );


    if(
        !favorite ||
        favorite.source !==
        "dayPlanner"
    ){

        return;

    }


    /*
     * 現在の写真が
     * 解除予定に入っているか確認
     */
    const index =
        favoritePhotoViewerFavoritePendingIds.indexOf(
            id
        );


    /*
     * ⭐ → ☆
     *
     * DBはまだ変更しない
     * 「閉じる時に解除する予定」
     */
    if(index === -1){

        favoritePhotoViewerFavoritePendingIds.push(
            id
        );

    }


    /*
     * ☆ → ⭐
     *
     * 解除予定から取り消す
     */
    else{

        favoritePhotoViewerFavoritePendingIds.splice(
            index,
            1
        );

    }


    /*
     * ボタン表示を即時変更
     */
    const button =
        document.getElementById(
            "favoritePhotoViewerFavorite"
        );


    if(button){

        button.textContent =
            favoritePhotoViewerFavoritePendingIds.includes(
                id
            )
            ? "☆"
            : "⭐";

    }

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


    /* =====================================================
       📷 ビューアで表示している一覧そのものから
       現在の写真を取得する
    ===================================================== */

    const favorites =
        favoritePhotoGetOrdered();


    const target =
        favorites.find(
            photo =>
                String(photo.id) ===
                String(
                    favoritePhotoViewerCurrentId
                )
        );


    if(!target){

        alert(
            "削除対象の写真が見つかりませんでした。"
        );

        return;

    }


    /* =====================================================
       📅 1日手帳由来
       → ⭐お気に入り解除
       → 元写真は残す
    ===================================================== */

    if(
        target.source ===
        "dayPlanner"
    ){

        if(
            !confirm(
                "この写真をお気に入りから外しますか？\n\n" +
                "1日手帳の写真は残ります。"
            )
        ){

            return;

        }


        const memories =
            data.dayMemories || {};


        Object.values(memories).forEach(
            day => {

                if(
                    !day ||
                    !Array.isArray(
                        day.photos
                    )
                ){

                    return;

                }


                const photo =
                    day.photos.find(
                        item =>
                            String(item.id) ===
                            String(
                                target.sourcePhotoId
                            )
                    );


                if(photo){

                    photo.favorite =
                        false;

                    delete photo.favoriteOrder;

                    delete photo.favoriteAt;

                }

            }
        );


        /*
         * favorites.photos に
         * 1日手帳由来の登録データが存在する場合も削除
         */

        if(
            data.favorites &&
            Array.isArray(
                data.favorites.photos
            )
        ){

            data.favorites.photos =
                data.favorites.photos.filter(
                    photo =>
                        String(photo.id) !==
                        String(target.id)
                );

        }


        if(
            data.favorites
        ){

            data.favorites.photoOrder =
                (
                    data.favorites.photoOrder ||
                    []
                ).filter(
                    id =>
                        String(id) !==
                        String(target.id)
                );

        }

    }


    /* =====================================================
       ⭐ 直接追加
       → 写真そのものを削除
    ===================================================== */

    else if(
        target.source ===
        "favorite"
    ){

        if(
            !confirm(
                "この写真をお気に入りから削除しますか？"
            )
        ){

            return;

        }


        if(
            data.favorites &&
            Array.isArray(
                data.favorites.photos
            )
        ){

            data.favorites.photos =
                data.favorites.photos.filter(
                    photo =>
                        String(photo.id) !==
                        String(target.id)
                );

        }


        if(
            data.favorites
        ){

            data.favorites.photoOrder =
                (
                    data.favorites.photoOrder ||
                    []
                ).filter(
                    id =>
                        String(id) !==
                        String(target.id)
                );

        }

    }


    /* =====================================================
       💾 保存
    ===================================================== */

    db.save(data);


    /* =====================================================
       📷 削除後の一覧
    ===================================================== */

    const remaining =
        favoritePhotoGetOrdered();


    /* =====================================================
       写真がもう無い
    ===================================================== */

    if(
        remaining.length === 0
    ){

        favoritePhotoCloseViewer();

        favoritePhotoRender();

        return;

    }


    /* =====================================================
       ビューア一覧を更新
    ===================================================== */

    favoritePhotoViewerIds =
        remaining.map(
            photo => photo.id
        );


    /*
     * 現在位置を維持。
     * 最後の写真を削除した場合だけ
     * 1つ前へ戻す。
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
   長押しのみドラッグ
   短い操作はスクロール
========================================================= */

function favoritePhotoInstallSortEvents(){

    /* =====================================================
       二重登録防止
    ===================================================== */

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


    /* =====================================================
       指を置いた時
       長押しするまでドラッグしない
    ===================================================== */

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


            /* ---------------------------------------------
               ドラッグ対象
            --------------------------------------------- */

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


            /* ---------------------------------------------
               指を置いた位置
            --------------------------------------------- */

            favoritePhotoTouchStartX =
                event.touches[0].clientX;


            favoritePhotoTouchStartY =
                event.touches[0].clientY;


            /* ---------------------------------------------
               長押しタイマー
            --------------------------------------------- */

            favoritePhotoLongPressTimer =
                setTimeout(
                    function(){

                        /* ---------------------------------
                           長押し前に動いていたらキャンセル
                        --------------------------------- */

                        if(
                            favoritePhotoTouchMoved
                        ){

                            return;

                        }


                        /* ---------------------------------
                           ドラッグ開始
                        --------------------------------- */

                        favoritePhotoIsDragging =
                            true;


                        box.classList.add(
                            "favorite-photo-dragging"
                        );


                        /* ---------------------------------
                           バイブ
                        --------------------------------- */

                        if(
                            navigator.vibrate
                        ){

                            navigator.vibrate(
                                30
                            );

                        }

                    },
                    70
                );

        },
        {
            passive: true
        }
    );


    /* =====================================================
       写真移動
       長押し後だけ実行
       
       ・左 → 右
       ・右 → 左
       ・上 → 下
       ・下 → 上
       
       2列グリッドにも対応
    ===================================================== */

    document.addEventListener(
        "touchmove",
        function(event){

            if(
                !favoritePhotoSortSelecting
            ){

                return;

            }


            /* =================================================
               ドラッグ開始前
               → 普通にスクロール
            ================================================= */

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


            /* =================================================
               ドラッグ中
               → スクロール停止
            ================================================= */

            event.preventDefault();


            const touch =
                event.touches[0];


            const dragging =
                favoritePhotoDraggingElement;


            if(!dragging){

                return;

            }


            /* =================================================
               現在表示されている写真枠
            ================================================= */

            const boxes =
                [
                    ...document.querySelectorAll(
                        ".favorite-photo-sort-item"
                    )
                ];


            if(
                boxes.length < 2
            ){

                return;

            }


            /* =================================================
               指が入っている写真を探す
            ================================================= */

            let targetBox =
                null;


            boxes.forEach(
                box => {

                    if(
                        box === dragging
                    ){

                        return;

                    }


                    const rect =
                        box.getBoundingClientRect();


                    if(

                        touch.clientX >=
                            rect.left &&

                        touch.clientX <=
                            rect.right &&

                        touch.clientY >=
                            rect.top &&

                        touch.clientY <=
                            rect.bottom

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


            /* =================================================
               現在の位置
            ================================================= */

            const dragRect =
                dragging.getBoundingClientRect();


            const targetRect =
                targetBox.getBoundingClientRect();


            const dragCenterX =
                dragRect.left +
                dragRect.width / 2;


            const dragCenterY =
                dragRect.top +
                dragRect.height / 2;


            const targetCenterX =
                targetRect.left +
                targetRect.width / 2;


            const targetCenterY =
                targetRect.top +
                targetRect.height / 2;


            const draggingIndex =
                boxes.indexOf(
                    dragging
                );


            const targetIndex =
                boxes.indexOf(
                    targetBox
                );


            if(
                draggingIndex < 0 ||
                targetIndex < 0
            ){

                return;

            }


            const parent =
                dragging.parentNode;


            /* =================================================
               ⭐ 横方向の移動
            ================================================= */


            /* ---------------------------------------------
               左 → 右
            --------------------------------------------- */

            if(
                touch.clientX >
                    targetCenterX &&
                draggingIndex <
                    targetIndex
            ){

                parent.insertBefore(
                    dragging,
                    targetBox.nextSibling
                );


                return;

            }


            /* ---------------------------------------------
               右 → 左
            --------------------------------------------- */

            if(
                touch.clientX <
                    targetCenterX &&
                draggingIndex >
                    targetIndex
            ){

                parent.insertBefore(
                    dragging,
                    targetBox
                );


                return;

            }


            /* =================================================
               ⭐ 縦方向の移動
               2列グリッド対応
            ================================================= */


            /* ---------------------------------------------
               上 → 下
            --------------------------------------------- */

            if(
                touch.clientY >
                    targetCenterY &&
                draggingIndex <
                    targetIndex
            ){

                parent.insertBefore(
                    dragging,
                    targetBox.nextSibling
                );


                return;

            }


            /* ---------------------------------------------
               下 → 上
            --------------------------------------------- */

            if(
                touch.clientY <
                    targetCenterY &&
                draggingIndex >
                    targetIndex
            ){

                parent.insertBefore(
                    dragging,
                    targetBox
                );


                return;

            }

        },
        {
            passive: false
        }
    );


    /* =====================================================
       指を離した時
    ===================================================== */

    document.addEventListener(
        "touchend",
        function(){

            clearTimeout(
                favoritePhotoLongPressTimer
            );


            /* ---------------------------------------------
               ドラッグ表示解除
            --------------------------------------------- */

            if(
                favoritePhotoDraggingElement
            ){

                favoritePhotoDraggingElement
                    .classList
                    .remove(
                        "favorite-photo-dragging"
                    );

            }


            /* ---------------------------------------------
               状態リセット
            --------------------------------------------- */

            favoritePhotoIsDragging =
                false;


            favoritePhotoDraggingId =
                null;


            favoritePhotoDraggingElement =
                null;


            favoritePhotoTouchMoved =
                false;

        },
        {
            passive: true
        }
    );


    /* =====================================================
       指をキャンセルした場合
       ※ スマホ操作対策
    ===================================================== */

    document.addEventListener(
        "touchcancel",
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


            favoritePhotoTouchMoved =
                false;

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
