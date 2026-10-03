/* =========================================================
   推し詳細ページ
   oshi-details.js

   【写真仕様】

   ・推し写真は data.oshiDetails[oshiId].photos で管理
   ・写真データ
       {
           photoId,
           oshiId,
           src,
           favorite,
           isTop,
           order
       }

   ・⭐ favorite
       → 既存のお気に入り
         data.favorites.photos
         と連動
       → Homeのお気に入りにも表示される

   ・❤️ isTop
       → 推し詳細ページのトップ画
       → 1推しにつき1枚だけ
       → アルバム上では表示のみ
       → ビューアで設定可能

   ・photo.js は使用しない
   ・既存 photoViewer は使用しない
   ・推し写真専用ビューアを使用
========================================================= */


/* =========================================================
   ⭐ 推し写真ビューア状態
========================================================= */

let oshiPhotoViewerPhotoIds = [];
let oshiPhotoViewerIndex = 0;
let oshiPhotoViewerCurrentId = null;

let oshiPhotoViewerScale = 1;

let oshiPhotoViewerTranslateX = 0;
let oshiPhotoViewerTranslateY = 0;

let oshiPhotoViewerLastDistance = 0;
let oshiPhotoViewerPinching = false;
let oshiPhotoViewerPinchCenterX = 0;
let oshiPhotoViewerPinchCenterY = 0;

let oshiPhotoViewerTouchStartX = 0;



let oshiPhotoViewerDragStartX = 0;
let oshiPhotoViewerDragStartY = 0;

let oshiPhotoViewerLastTapTime = 0;

let oshiPhotoViewerOpen = false;


/* =========================================================
   ⭐ 現在の推しID取得
========================================================= */

function getCurrentOshiDetailsId(){

    const container =
        document.getElementById(
            "oshiContainer"
        );

    if(!container){
        return "";
    }

    return (
        container.dataset.oshiId ||
        ""
    );
}


/* =========================================================
   ⭐ 推し写真取得
========================================================= */

function getOshiPhotos(
    oshiId
){

    if(!oshiId){
        return [];
    }

    const data =
        db.load();

    const detail =
        data.oshiDetails?.[oshiId];

    const photos =
        detail?.photos;

    if(!Array.isArray(photos)){
        return [];
    }

    return photos
        .filter(
            photo =>
                photo &&
                photo.src
        )
        .sort(
            (a,b) =>
                Number(a.order || 0) -
                Number(b.order || 0)
        );

}


/* =========================================================
   ⭐ 推し写真初期化
========================================================= */

function initializeOshiPhotos(
    oshiId
){

    if(!oshiId){
        return;
    }

    const data =
        db.load();

    if(!data.oshiDetails){
        data.oshiDetails = {};
    }

    if(!data.oshiDetails[oshiId]){
        data.oshiDetails[oshiId] = {};
    }

    const detail =
        data.oshiDetails[oshiId];

    if(
        !Array.isArray(
            detail.photos
        )
    ){

        detail.photos = [];

    }

}


/* =========================================================
   ⭐ 推し詳細ページ初期化
========================================================= */

function initOshiDetailsPage(
    id
){

    console.log(
        "★ 推し詳細ページ初期化:",
        id
    );


    const data =
        db.load();


    const oshi =
        (data.oshiList || [])
        .find(
            item =>
                item.id === id
        );


    if(!oshi){

        console.error(
            "★ 推しが見つかりません:",
            id
        );

        return;

    }


    /* =========================
       推し名
    ========================= */

    const title =
        document.querySelector(
            ".oshi-detail-title"
        );


    if(title){

        title.textContent =
            oshi.name;

    }


    /* =========================
       推し活記録タイトル
    ========================= */

    const recordTitle =
        document.getElementById(
            "oshiRecordTitle"
        );


    if(recordTitle){

        recordTitle.textContent =
            oshi.name +
            "の推し活記録";

    }


    /* =========================
       写真データ初期化
    ========================= */

    initializeOshiPhotos(
        id
    );


    const dataAfterInitialize =
        db.load();


    const detail =
        dataAfterInitialize
            .oshiDetails?.[id];


    if(
        detail &&
        Array.isArray(
            detail.photos
        ) &&
        detail.photos.length > 0
    ){

        /*
           古いデータや並び順が無い場合の補正
        */

        let changed =
            false;


        detail.photos.forEach(
            (photo,index) => {

                if(!photo.photoId){

                    photo.photoId =
                        "oshi_photo_" +
                        Date.now() +
                        "_" +
                        Math.random()
                            .toString(36)
                            .slice(2);

                    changed =
                        true;

                }


                if(!photo.oshiId){

                    photo.oshiId =
                        id;

                    changed =
                        true;

                }


                if(
                    typeof photo.favorite !==
                    "boolean"
                ){

                    photo.favorite =
                        false;

                    changed =
                        true;

                }


                if(
                    typeof photo.isTop !==
                    "boolean"
                ){

                    photo.isTop =
                        false;

                    changed =
                        true;

                }


                if(
                    photo.order == null
                ){

                    photo.order =
                        index;

                    changed =
                        true;

                }

            }
        );


        /*
           トップ画が複数あった場合
           最初の1枚だけを残す
        */

        let topFound =
            false;


        detail.photos.forEach(
            photo => {

                if(
                    photo.isTop
                ){

                    if(
                        !topFound
                    ){

                        topFound =
                            true;

                    }else{

                        photo.isTop =
                            false;

                        changed =
                            true;

                    }

                }

            }
        );


        if(changed){

            db.save(
                dataAfterInitialize
            );

        }

    }


    /* =========================
       メイン写真
    ========================= */

    renderOshiMainPhoto(
        id
    );


    /* =========================
       写真 input
    ========================= */

    initOshiPhotoInputs();


    /* =========================
       写真ビューア
    ========================= */

    initOshiPhotoViewer();
    initOshiPhotoViewerButtons();


    console.log(
        "★ 推し詳細表示:",
        oshi.name
    );

}


/* =========================================================
   ❤️ 推しトップ画取得
========================================================= */

function getOshiTopPhoto(
    oshiId
){

    const photos =
        getOshiPhotos(
            oshiId
        );

    return (
        photos.find(
            photo =>
                photo.isTop === true
        ) ||
        null
    );

}


/* =========================================================
   ⭐ メイン写真表示
========================================================= */

function renderOshiMainPhoto(
    id
){

    const placeholder =
        document.getElementById(
            "oshiMainPhotoPlaceholder"
        );

    const imageButton =
        document.getElementById(
            "oshiMainPhotoImageButton"
        );

    const image =
        document.getElementById(
            "oshiMainPhotoImage"
        );


    if(
        !placeholder ||
        !imageButton ||
        !image
    ){

        return;

    }


    const photos =
        getOshiPhotos(
            id
        );


    /*
       ❤️トップ画を取得
    */

    const topPhoto =
        photos.find(
            photo =>
                photo.isTop === true
        );


    /*
       トップ画がある場合
    */

    if(topPhoto){

        image.src =
            topPhoto.src;

        image.dataset.photoId =
            topPhoto.photoId;

        placeholder.style.display =
            "none";

        imageButton.style.display =
            "block";

        return;

    }


    /*
       トップ画がない場合
    */

    image.removeAttribute(
        "src"
    );

    image.removeAttribute(
        "data-photo-id"
    );


    /*
       写真が存在する場合は
       先頭写真を表示する

       ※トップ画としては扱わない
    */

    if(photos.length > 0){

        image.src =
            photos[0].src;

        image.dataset.photoId =
            photos[0].photoId;

        placeholder.style.display =
            "none";

        imageButton.style.display =
            "block";

    }else{

        placeholder.style.display =
            "flex";

        imageButton.style.display =
            "none";

    }

}


/* =========================================================
   ⭐ 写真追加モーダル
========================================================= */

function openOshiPhotoAddModal(){

    const modal =
        document.getElementById(
            "oshiPhotoAddModal"
        );


    if(!modal){
        return;
    }


    modal.style.display =
        "flex";

}


/* =========================================================
   ⭐ 写真追加モーダル閉じる
========================================================= */

function closeOshiPhotoAddModal(){

    const modal =
        document.getElementById(
            "oshiPhotoAddModal"
        );


    if(!modal){
        return;
    }


    modal.style.display =
        "none";

}


/* =========================================================
   ⭐ カメラ
========================================================= */

function openOshiCamera(){

    const input =
        document.getElementById(
            "oshiCameraInput"
        );


    if(!input){
        return;
    }


    closeOshiPhotoAddModal();


    input.value =
        "";


    input.click();

}


/* =========================================================
   ⭐ アルバム
========================================================= */

function openOshiAlbum(){

    const input =
        document.getElementById(
            "oshiAlbumInput"
        );


    if(!input){
        return;
    }


    closeOshiPhotoAddModal();


    input.value =
        "";


    input.click();

}


/* =========================================================
   ⭐ 写真input初期化
========================================================= */

function initOshiPhotoInputs(){

    const cameraInput =
        document.getElementById(
            "oshiCameraInput"
        );

    const albumInput =
        document.getElementById(
            "oshiAlbumInput"
        );


    if(cameraInput){

        cameraInput.onchange =
            function(){

                handleOshiPhotoFiles(
                    this.files
                );

            };

    }


    if(albumInput){

        albumInput.onchange =
            function(){

                handleOshiPhotoFiles(
                    this.files
                );

            };

    }

}


/* =========================================================
   ⭐ 複数写真読み込み
========================================================= */

function handleOshiPhotoFiles(
    fileList
){

    const files =
        Array.from(
            fileList || []
        );


    if(files.length === 0){
        return;
    }


    const oshiId =
        getCurrentOshiDetailsId();


    if(!oshiId){

        console.error(
            "★ 推しIDが取得できません"
        );

        return;

    }


    readOshiPhotoFiles(
        oshiId,
        files
    );

}


/* =========================================================
   ⭐ 写真読み込み・縮小
========================================================= */

function readOshiPhotoFiles(
    oshiId,
    files
){

    const validFiles =
        files.filter(
            file =>
                file &&
                file.type &&
                file.type.startsWith(
                    "image/"
                )
        );


    if(validFiles.length === 0){

        alert(
            "画像ファイルを選択してください。"
        );

        return;

    }


    let completed =
        0;


    const results =
        [];


    validFiles.forEach(
        file => {

            const reader =
                new FileReader();


            reader.onload =
                function(
                    readerEvent
                ){

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

                                if(
                                    width >
                                    maxSize
                                ){

                                    height *=
                                        maxSize /
                                        width;

                                    width =
                                        maxSize;

                                }

                            }else{

                                if(
                                    height >
                                    maxSize
                                ){

                                    width *=
                                        maxSize /
                                        height;

                                    height =
                                        maxSize;

                                }

                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                Math.round(
                                    width
                                );

                            canvas.height =
                                Math.round(
                                    height
                                );


                            const context =
                                canvas.getContext(
                                    "2d"
                                );


                            context.drawImage(
                                image,
                                0,
                                0,
                                canvas.width,
                                canvas.height
                            );


                            const src =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.8
                                );


                            results.push({
                                src: src
                            });


                            completed++;


                            if(
                                completed >=
                                validFiles.length
                            ){

                                saveOshiPhotos(
                                    oshiId,
                                    results
                                );

                            }

                        };


                    image.onerror =
                        function(){

                            completed++;


                            if(
                                completed >=
                                validFiles.length
                            ){

                                saveOshiPhotos(
                                    oshiId,
                                    results
                                );

                            }

                        };


                    image.src =
                        readerEvent.target.result;

                };


            reader.onerror =
                function(){

                    completed++;


                    if(
                        completed >=
                        validFiles.length
                    ){

                        saveOshiPhotos(
                            oshiId,
                            results
                        );

                    }

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   ⭐ 写真保存
========================================================= */

function saveOshiPhotos(
    oshiId,
    photos
){

    if(
        !oshiId ||
        !Array.isArray(photos) ||
        photos.length === 0
    ){

        return;

    }


    const data =
        db.load();


    if(!data.oshiDetails){

        data.oshiDetails =
            {};

    }


    if(!data.oshiDetails[oshiId]){

        data.oshiDetails[oshiId] =
            {};

    }


    if(
        !Array.isArray(
            data.oshiDetails[oshiId].photos
        )
    ){

        data.oshiDetails[oshiId].photos =
            [];

    }


    const currentPhotos =
        data.oshiDetails[oshiId].photos;


    let maxOrder =
        currentPhotos.length;


    /*
       まだトップ画が存在しない場合、
       最初に追加する写真を❤️トップ画にする
    */

    const hasTop =
        currentPhotos.some(
            photo =>
                photo.isTop === true
        );


    photos.forEach(
        (item,index) => {

            const photoId =
                "oshi_photo_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .slice(2) +
                "_" +
                index;


            const photo = {

                photoId:
                    photoId,

                oshiId:
                    oshiId,

                src:
                    item.src,

                favorite:
                    false,

                isTop:
                    !hasTop &&
                    index === 0,

                order:
                    maxOrder++

            };


            currentPhotos.push(
                photo
            );

        }
    );


    db.save(
        data
    );


    renderOshiMainPhoto(
        oshiId
    );


    renderOshiPhotoAlbum(
        oshiId
    );


    /*
       inputをリセット
    */

    const cameraInput =
        document.getElementById(
            "oshiCameraInput"
        );

    const albumInput =
        document.getElementById(
            "oshiAlbumInput"
        );


    if(cameraInput){

        cameraInput.value =
            "";

    }


    if(albumInput){

        albumInput.value =
            "";

    }


    console.log(
        "★ 推し写真を保存:",
        photos.length,
        "枚"
    );

}


/* =========================================================
   ⭐ アルバム表示
========================================================= */

function renderOshiPhotoAlbum(
    oshiId
){

    const profileCard =
        document.querySelector(
            "#oshiDetailPage .oshi-profile-card"
        );


    if(!profileCard){
        return;
    }


    let album =
        document.getElementById(
            "oshiPhotoAlbum"
        );


    /*
       初回のみ作成
    */

    if(!album){

        album =
            document.createElement(
                "div"
            );

        album.id =
            "oshiPhotoAlbum";

        album.className =
            "oshi-photo-album";


        profileCard.insertAdjacentElement(
            "afterend",
            album
        );

    }


    const photos =
        getOshiPhotos(
            oshiId
        );


    /*
       写真なし
    */

    if(photos.length === 0){

        album.innerHTML =
            "";

        album.style.display =
            "none";

        return;

    }


    album.style.display =
        "block";


    let html = `

<div class="oshi-photo-album-header">

    <h3>
        📸 写真
    </h3>

    <button
        type="button"
        class="oshi-photo-add-button"
        onclick="openOshiPhotoAddModal()"
    >
        ＋ 写真を追加
    </button>

</div>

<div class="oshi-photo-grid">

`;


    photos.forEach(
        photo => {

            html +=
                createOshiPhotoThumbnailHtml(
                    photo
                );

        }
    );


    html += `

</div>

`;


    album.innerHTML =
        html;

}


/* =========================================================
   ⭐ 写真サムネイルHTML
========================================================= */

function createOshiPhotoThumbnailHtml(
    photo
){

    const photoId =
        String(
            photo.photoId
        );


    const favoriteIcon =
        photo.favorite === true
        ?
        `<span
            class="oshi-photo-status-favorite"
            title="お気に入り">
            ⭐
        </span>`
        :
        "";


    const topIcon =
        photo.isTop === true
        ?
        `<span
            class="oshi-photo-status-top"
            title="トップ画">
            ❤️
        </span>`
        :
        "";


    return `

<div
    class="oshi-photo-thumbnail"
    data-oshi-photo-id="${photoId}"
>

    <button
        type="button"
        class="oshi-photo-thumbnail-button"
        onclick="openOshiPhotoViewer('${photoId}')"
    >

        <img
            src="${photo.src}"
            class="oshi-photo-thumbnail-image"
            alt="推しの写真"
            draggable="false"
        >

    </button>


    <div
        class="oshi-photo-status"
    >

        ${topIcon}

        <button
            type="button"
            class="oshi-photo-favorite-button"
            onclick="event.stopPropagation(); toggleOshiPhotoFavorite('${photoId}')"
            title="${
                photo.favorite === true
                ?
                "お気に入りを外す"
                :
                "お気に入りに追加"
            }"
        >
            ${
                favoriteIcon
                ?
                "⭐"
                :
                ""
            }
        </button>

    </div>

</div>

`;

}


/* =========================================================
   ⭐ 推し写真お気に入りON/OFF
========================================================= */

function toggleOshiPhotoFavorite(
    photoId
){

    const oshiId =
        getCurrentOshiDetailsId();


    if(
        !oshiId ||
        !photoId
    ){

        return;

    }


    const data =
        db.load();


    const photos =
        data.oshiDetails
            ?. [oshiId]
            ?.photos;


    if(!Array.isArray(photos)){
        return;
    }


    const photo =
        photos.find(
            item =>
                String(item.photoId) ===
                String(photoId)
        );


    if(!photo){
        return;
    }


    const newFavorite =
        photo.favorite !== true;


    photo.favorite =
        newFavorite;


    /*
       ⭐ ON
       → 既存お気に入りにも登録
    */

    if(newFavorite){

        addOshiPhotoToFavorites(
            photo
        );

    }else{

        removeOshiPhotoFromFavorites(
            photo
        );

    }


    db.save(
        data
    );


    /*
       DB保存後に再描画
    */

    renderOshiPhotoAlbum(
        oshiId
    );


    /*
       既存お気に入り画面が
       現在表示されている場合に更新
    */

    refreshExistingFavoritesPage();


    console.log(
        "★ 推し写真お気に入り:",
        photoId,
        newFavorite
    );

}


/* =========================================================
   ⭐ 推し写真を既存お気に入りへ追加
========================================================= */

function addOshiPhotoToFavorites(
    photo
){

    if(!photo){
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

        data.favorites.photos =
            [];

    }


    if(
        !Array.isArray(
            data.favorites.photoOrder
        )
    ){

        data.favorites.photoOrder =
            [];

    }


    /*
       同じ写真が既にあれば追加しない
    */

    const exists =
        data.favorites.photos.some(
            favorite =>
                favorite.source ===
                    "favorite" &&
                String(
                    favorite.oshiId
                ) ===
                    String(
                        photo.oshiId
                    ) &&
                String(
                    favorite.sourceOshiPhotoId
                ) ===
                    String(
                        photo.photoId
                    )
        );


    if(exists){

        return;

    }


    const id =
        "oshi_favorite_" +
        photo.oshiId +
        "_" +
        photo.photoId;


    const favoritePhoto = {

        id:
            id,

        source:
            "favorite",

        src:
            photo.src,

        oshiId:
            photo.oshiId,

        sourceOshiPhotoId:
            photo.photoId,

        favoriteAt:
            Date.now()

    };


    data.favorites.photos.push(
        favoritePhoto
    );


    data.favorites.photoOrder.push(
        id
    );


    db.save(
        data
    );

}


/* =========================================================
   ⭐ 推し写真を既存お気に入りから削除
========================================================= */

function removeOshiPhotoFromFavorites(
    photo
){

    if(!photo){
        return;
    }


    const data =
        db.load();


    if(
        !data.favorites ||
        !Array.isArray(
            data.favorites.photos
        )
    ){

        return;

    }


    const targetIds =
        data.favorites.photos
            .filter(
                favorite =>
                    favorite.source ===
                        "favorite" &&
                    String(
                        favorite.oshiId
                    ) ===
                        String(
                            photo.oshiId
                        ) &&
                    String(
                        favorite.sourceOshiPhotoId
                    ) ===
                        String(
                            photo.photoId
                        )
            )
            .map(
                favorite =>
                    String(
                        favorite.id
                    )
            );


    if(
        targetIds.length === 0
    ){

        return;

    }


    data.favorites.photos =
        data.favorites.photos.filter(
            favorite =>
                !targetIds.includes(
                    String(
                        favorite.id
                    )
                )
        );


    if(
        Array.isArray(
            data.favorites.photoOrder
        )
    ){

        data.favorites.photoOrder =
            data.favorites.photoOrder.filter(
                id =>
                    !targetIds.includes(
                        String(id)
                    )
            );

    }


    db.save(
        data
    );

}


/* =========================================================
   ⭐ 既存お気に入り画面更新
========================================================= */

function refreshExistingFavoritesPage(){

    /*
       favorites.js が読み込まれている場合のみ更新。

       推し詳細ページ側では
       favorites.js に依存しない。
    */

    if(
        typeof favoritesDisplay ===
        "function"
    ){

        try{

            favoritesDisplay();

        }catch(error){

            console.log(
                "★ お気に入り画面更新エラー:",
                error
            );

        }

    }

}


/* =========================================================
   ⭐ 推しアルバムを開く
========================================================= */

function openOshiPhotoAlbum(){

    const oshiContainer =
        document.getElementById("oshiContainer");

    const oshiId =
        oshiContainer?.dataset.oshiId;

    if(!oshiId){
        return;
    }


    const viewer =
        document.getElementById(
            "oshiPhotoAlbumViewer"
        );

    const grid =
        document.getElementById(
            "oshiPhotoAlbumViewerGrid"
        );

    if(!viewer || !grid){
        return;
    }


    /* =====================================================
       写真取得
    ===================================================== */

    const photos =
        getOshiPhotos(oshiId)
            .slice()
            .sort(
                (a,b) =>
                    (a.order ?? 0) -
                    (b.order ?? 0)
            );


    /* =====================================================
       一覧を作り直す
    ===================================================== */

    grid.innerHTML = "";


    photos.forEach(photo => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "oshi-photo-album-viewer-item";


        button.innerHTML = `

            <img
                src="${photo.src}"
                alt="推しの写真"
                draggable="false"
            >

            <div
                class="oshi-photo-album-viewer-status"
            >

                <span>
                    ${photo.favorite ? "⭐" : ""}
                </span>

                <span>
                    ${photo.isTop ? "❤️" : ""}
                </span>

            </div>

        `;


        /* =================================================
           写真タップ
        ================================================= */

        button.addEventListener(
            "click",
            () => {

                closeOshiPhotoAlbum();

                openOshiPhotoViewer(
                    photo.photoId
                );

            }
        );


        grid.appendChild(button);

    });


    /* =====================================================
       ＋ 写真追加
    ===================================================== */

    const addButton =
        document.getElementById(
            "oshiPhotoAlbumAddButton"
        );

    if(addButton){

        addButton.onclick = null;

        addButton.onclick = function(){

            openOshiPhotoAddModal();

        };

    }


    /* =====================================================
       ✕ 一覧を閉じる
    ===================================================== */

    const closeButton =
        document.getElementById(
            "oshiPhotoAlbumCloseButton"
        );

    if(closeButton){

        closeButton.onclick = null;

        closeButton.onclick = function(){

            closeOshiPhotoAlbum();

        };

    }


    /* =====================================================
       表示
    ===================================================== */

    viewer.style.display = "flex";

}



function closeOshiPhotoAlbum(){

    const viewer =
        document.getElementById(
            "oshiPhotoAlbumViewer"
        );

    if(!viewer){
        return;
    }

    viewer.style.display = "none";

}



/* =========================================================
   ⭐ 推し写真ビューア初期化
========================================================= */

function initOshiPhotoViewer(){

    const image =
        document.getElementById(
            "oshiPhotoViewerImage"
        );


    if(!image){
        return;
    }


    if(
        image.dataset.oshiViewerInstalled ===
        "true"
    ){

        return;

    }


    image.dataset.oshiViewerInstalled =
        "true";


    image.addEventListener(
        "touchstart",
        function(event){

            if(
                !oshiPhotoViewerOpen
            ){

                return;

            }


            oshiPhotoViewerTouchStart(
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

            if(
                !oshiPhotoViewerOpen
            ){

                return;

            }


            event.stopImmediatePropagation();


            oshiPhotoViewerTouchMove(
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
                !oshiPhotoViewerOpen
            ){

                return;

            }


            event.stopImmediatePropagation();


            oshiPhotoViewerTouchEnd(
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
   ⭐ 推し写真ビューアを開く
========================================================= */

function openOshiPhotoViewer(
    photoId
){

    const oshiId =
        getCurrentOshiDetailsId();


    if(
        !oshiId ||
        !photoId
    ){

        return;

    }


    const photos =
        getOshiPhotos(
            oshiId
        );


    const index =
        photos.findIndex(
            photo =>
                String(
                    photo.photoId
                ) ===
                String(
                    photoId
                )
        );


    if(index < 0){
        return;
    }


    oshiPhotoViewerPhotoIds =
        photos.map(
            photo =>
                photo.photoId
        );


    oshiPhotoViewerIndex =
        index;


    oshiPhotoViewerCurrentId =
        photoId;


    oshiPhotoViewerScale =
        1;


    oshiPhotoViewerTranslateX =
        0;


    oshiPhotoViewerTranslateY =
        0;


    oshiPhotoViewerLastDistance =
        0;


    oshiPhotoViewerLastTapTime =
        0;


    oshiPhotoViewerOpen =
        true;


    const viewer =
        document.getElementById(
            "oshiPhotoViewer"
        );


    const image =
        document.getElementById(
            "oshiPhotoViewerImage"
        );


    if(
        !viewer ||
        !image
    ){

        console.warn(
            "oshiPhotoViewer のDOMがありません"
        );

        return;

    }


    updateOshiPhotoViewer();

updateOshiPhotoViewerTopButton();

updateOshiPhotoViewerFavoriteButton();



    viewer.style.display =
        "flex";


    viewer.style.zIndex =
        "10000";


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   ⭐ ビューア写真更新
========================================================= */

function updateOshiPhotoViewer(){

    if(
        oshiPhotoViewerPhotoIds.length ===
        0
    ){

        return;

    }


    const oshiId =
        getCurrentOshiDetailsId();


    const photos =
        getOshiPhotos(
            oshiId
        );


    const photo =
        photos.find(
            item =>
                String(
                    item.photoId
                ) ===
                String(
                    oshiPhotoViewerCurrentId
                )
        );


    if(!photo){
        return;
    }


    const image =
        document.getElementById(
            "oshiPhotoViewerImage"
        );


    if(image){

        image.src =
            photo.src;

        applyOshiPhotoViewerTransform();

    }


    /*
       ❤️トップ画ボタン表示
    */
    updateOshiPhotoViewerTopButton(
        photo
    );

    updateOshiPhotoViewerFavoriteButton();


}


/* =========================================================
   ❤️ ビューアのトップ画ボタン
========================================================= */

function updateOshiPhotoViewerTopButton(
    photo
){

    const button =
        document.getElementById(
            "oshiPhotoViewerTopButton"
        );


    if(!button){
        return;
    }


    if(
        photo &&
        photo.isTop === true
    ){

        button.textContent =
            "❤️";

        button.title =
            "トップ画";

        button.classList.add(
            "active"
        );

    }else{

        button.textContent =
            "♡";

        button.title =
            "トップ画にする";

        button.classList.remove(
            "active"
        );

    }

}


function updateOshiPhotoViewerFavoriteButton(){

    const button =
        document.getElementById(
            "oshiPhotoViewerFavoriteButton"
        );

    if(!button){
        return;
    }


    const oshiId =
        getCurrentOshiDetailsId();

    const photoId =
        oshiPhotoViewerCurrentId;


    if(
        !oshiId ||
        !photoId
    ){

        button.textContent =
            "☆";

        return;

    }


    const data =
        db.load();


    const photos =
        data.oshiDetails
            ?. [oshiId]
            ?.photos;


    if(!Array.isArray(photos)){

        button.textContent =
            "☆";

        return;

    }


    const photo =
        photos.find(
            item =>
                String(item.photoId) ===
                String(photoId)
        );


    if(!photo){

        button.textContent =
            "☆";

        return;

    }


    button.textContent =
        photo.favorite === true
            ? "⭐"
            : "☆";
}


/* =========================================================
   ⭐ ビューア変形
========================================================= */

function applyOshiPhotoViewerTransform(){

    const image =
        document.getElementById(
            "oshiPhotoViewerImage"
        );


    if(!image){
        return;
    }


    image.style.transform =
        `translate(${oshiPhotoViewerTranslateX}px,${oshiPhotoViewerTranslateY}px) scale(${oshiPhotoViewerScale})`;

}


/* =========================================================
   ⭐ ビューア次の写真
========================================================= */

function showOshiPhotoViewerPhoto(
    index
){

    if(
        oshiPhotoViewerPhotoIds.length ===
        0
    ){

        return;

    }


    if(
        index >=
        oshiPhotoViewerPhotoIds.length
    ){

        index = 0;

    }


    if(index < 0){

        index =
            oshiPhotoViewerPhotoIds.length - 1;

    }


    oshiPhotoViewerIndex =
        index;


    oshiPhotoViewerCurrentId =
        oshiPhotoViewerPhotoIds[index];


    oshiPhotoViewerScale =
        1;


    oshiPhotoViewerTranslateX =
        0;


    oshiPhotoViewerTranslateY =
        0;


    oshiPhotoViewerLastDistance =
        0;


    updateOshiPhotoViewer();

}


/* =========================================================
   ⭐ ビューアタッチ開始
========================================================= */

function oshiPhotoViewerTouchStart(
    event
){

    if(
        !oshiPhotoViewerOpen
    ){

        return;

    }


if(
    event.touches.length ===
    2
){

    oshiPhotoViewerPinching =
        true;

    oshiPhotoViewerLastTapTime =
        0;

    oshiPhotoViewerLastDistance =
        getOshiPhotoViewerDistance(
            event.touches
        );

    oshiPhotoViewerPinchCenterX =
        (
            event.touches[0].clientX +
            event.touches[1].clientX
        ) / 2;

    oshiPhotoViewerPinchCenterY =
        (
            event.touches[0].clientY +
            event.touches[1].clientY
        ) / 2;

    return;
}

if(
    event.touches.length ===
    1
){

    oshiPhotoViewerPinching =
        false;
}


    if(
        event.touches.length !==
        1
    ){

        return;

    }


    const x =
        event.touches[0].clientX;


    const y =
        event.touches[0].clientY;


    oshiPhotoViewerTouchStartX =
        x;


    if(
        oshiPhotoViewerScale > 1
    ){

        event.preventDefault();


        oshiPhotoViewerDragStartX =
            x;


        oshiPhotoViewerDragStartY =
            y;

    }

}


/* =========================================================
   ⭐ ピンチ距離
========================================================= */

function getOshiPhotoViewerDistance(
    touches
){

    if(
        !touches ||
        touches.length !== 2
    ){

        return 0;

    }


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
   ⭐ ビューアタッチ移動
========================================================= */

function oshiPhotoViewerTouchMove(
    event
){

    if(
        !oshiPhotoViewerOpen
    ){

        return;

    }


    /*
       2本指
    */

    if(
        event.touches.length ===
        2
    ){

        event.preventDefault();


        const distance =
            getOshiPhotoViewerDistance(
                event.touches
            );


if(
    oshiPhotoViewerLastDistance >
    0 &&
    distance > 0
){

    const distanceDifference =
        distance -
        oshiPhotoViewerLastDistance;




    oshiPhotoViewerScale +=
        distanceDifference *
        0.01;


    if(
        oshiPhotoViewerScale <
        1
    ){

        oshiPhotoViewerScale =
            1;

    }


    if(
        oshiPhotoViewerScale >
        4
    ){

        oshiPhotoViewerScale =
            4;

    }


    /*
       ピンチの中心を基準にするため、
       拡大率の変化分だけ画像位置を補正
    */



    applyOshiPhotoViewerTransform();

}



        oshiPhotoViewerLastDistance =
            distance;


        return;

    }


    /*
       拡大中の1本指ドラッグ
    */

    if(
        oshiPhotoViewerScale > 1 &&
        event.touches.length === 1
    ){

        event.preventDefault();


        const x =
            event.touches[0].clientX;


        const y =
            event.touches[0].clientY;


        oshiPhotoViewerTranslateX +=
            x -
            oshiPhotoViewerDragStartX;


        oshiPhotoViewerTranslateY +=
            y -
            oshiPhotoViewerDragStartY;


        oshiPhotoViewerDragStartX =
            x;


        oshiPhotoViewerDragStartY =
            y;


        applyOshiPhotoViewerTransform();

    }

}


/* =========================================================
   ⭐ ビューアタッチ終了
========================================================= */

/* =========================================================
   ⭐ ビューアタッチ終了
========================================================= */

function oshiPhotoViewerTouchEnd(
    event
){

    if(
        !oshiPhotoViewerOpen
    ){

        return;

    }


    /* =====================
       2本指ピンチ終了処理
    ===================== */

    if(
        oshiPhotoViewerPinching
    ){

        oshiPhotoViewerLastDistance =
            0;


        /*
           まだ1本指が残っている場合も
           スワイプ・ダブルタップには移行しない
        */

        if(
            event.touches &&
            event.touches.length === 0
        ){

            oshiPhotoViewerPinching =
                false;

        }

        return;

    }


    /* =====================
       拡大中はスワイプしない
    ===================== */

    if(
        oshiPhotoViewerScale > 1
    ){

        oshiPhotoViewerLastDistance =
            0;

        return;

    }


    /* =====================
       通常サイズ時のスワイプ
    ===================== */

    if(
        !event.changedTouches ||
        event.changedTouches.length !== 1
    ){

        oshiPhotoViewerLastDistance =
            0;

        return;

    }


    const endX =
        event.changedTouches[0].clientX;


    const diffX =
        endX -
        oshiPhotoViewerTouchStartX;


    /* =====================
       左右スワイプ
    ===================== */

    if(
        Math.abs(diffX) >= 60
    ){

        if(
            diffX < 0
        ){

            /*
               次の写真
            */

            showOshiPhotoViewerPhoto(
                oshiPhotoViewerIndex + 1
            );

        }else{

            /*
               前の写真
            */

            showOshiPhotoViewerPhoto(
                oshiPhotoViewerIndex - 1
            );

        }


        oshiPhotoViewerLastTapTime =
            0;

        oshiPhotoViewerLastDistance =
            0;

        return;

    }


    /* =====================
       ダブルタップ
    ===================== */

    const now =
        Date.now();


    if(
        now -
        oshiPhotoViewerLastTapTime <
        300
    ){

        if(
            oshiPhotoViewerScale === 1
        ){

            oshiPhotoViewerScale =
                2;

        }else{

            oshiPhotoViewerScale =
                1;

            oshiPhotoViewerTranslateX =
                0;

            oshiPhotoViewerTranslateY =
                0;

        }


        applyOshiPhotoViewerTransform();


        oshiPhotoViewerLastTapTime =
            0;

    }else{

        oshiPhotoViewerLastTapTime =
            now;

    }


    oshiPhotoViewerLastDistance =
        0;

}

/* =========================================================
   ❤️ トップ画設定確認
========================================================= */

function confirmOshiTopPhoto(){

    const oshiId =
        getCurrentOshiDetailsId();


    const photoId =
        oshiPhotoViewerCurrentId;


    if(
        !oshiId ||
        !photoId
    ){

        return;

    }


    const data =
        db.load();


    const photos =
        data.oshiDetails
            ?. [oshiId]
            ?.photos;


    if(!Array.isArray(photos)){
        return;
    }


    const target =
        photos.find(
            photo =>
                String(
                    photo.photoId
                ) ===
                String(
                    photoId
                )
        );


    if(!target){
        return;
    }


    /*
       すでにトップ画なら
       解除はしない。

       ❤️は1推しにつき1枚。
    */

    if(
        target.isTop === true
    ){

        return;

    }


    const confirmed =
        window.confirm(
            "この写真をトップ画にしますか？"
        );


    if(!confirmed){
        return;
    }


    /*
       全写真の❤️をOFF
    */

    photos.forEach(
        photo => {

            photo.isTop =
                String(
                    photo.photoId
                ) ===
                String(
                    photoId
                );

        }
    );


    db.save(
        data
    );


    renderOshiMainPhoto(
        oshiId
    );


    renderOshiPhotoAlbum(
        oshiId
    );


    updateOshiPhotoViewer();


    console.log(
        "★ 推しトップ画を変更:",
        photoId
    );

}


/* =========================================================
   ⭐ 現在写真削除
========================================================= */

function deleteOshiCurrentPhoto(){

    const oshiId =
        getCurrentOshiDetailsId();


    const photoId =
        oshiPhotoViewerCurrentId;


    if(
        !oshiId ||
        !photoId
    ){

        return;

    }


    const data =
        db.load();


    const photos =
        data.oshiDetails
            ?. [oshiId]
            ?.photos;


    if(!Array.isArray(photos)){
        return;
    }


    const targetIndex =
        photos.findIndex(
            photo =>
                String(
                    photo.photoId
                ) ===
                String(
                    photoId
                )
        );


    if(targetIndex < 0){
        return;
    }


    const target =
        photos[targetIndex];


    const confirmed =
        window.confirm(
            "この写真を削除しますか？"
        );


    if(!confirmed){
        return;
    }


    const wasTop =
        target.isTop === true;


    /*
       ⭐お気に入りなら
       Homeのお気に入りからも削除
    */

    if(
        target.favorite === true
    ){

        removeOshiPhotoFromFavorites(
            target
        );

    }


    /*
       写真本体削除
    */

    photos.splice(
        targetIndex,
        1
    );


    /*
       orderを詰め直す
    */

    photos.forEach(
        (photo,index) => {

            photo.order =
                index;

        }
    );


    /*
       トップ画を削除した場合、
       残っている先頭写真を
       新しいトップ画にする
    */

    if(
        wasTop &&
        photos.length > 0
    ){

        photos.forEach(
            photo => {

                photo.isTop =
                    false;

            }
        );


        photos[0].isTop =
            true;

    }


    db.save(
        data
    );


    /*
       残り写真
    */

    const remaining =
        getOshiPhotos(
            oshiId
        );


    if(
        remaining.length === 0
    ){

        closeOshiPhotoViewer();


        renderOshiMainPhoto(
            oshiId
        );


        renderOshiPhotoAlbum(
            oshiId
        );


        return;

    }


    /*
       ビューアに残りを反映
    */

    oshiPhotoViewerPhotoIds =
        remaining.map(
            photo =>
                photo.photoId
        );


    let nextIndex =
        targetIndex;


    if(
        nextIndex >=
        remaining.length
    ){

        nextIndex =
            remaining.length - 1;

    }


    oshiPhotoViewerIndex =
        nextIndex;


    oshiPhotoViewerCurrentId =
        remaining[nextIndex].photoId;


    updateOshiPhotoViewer();


    renderOshiMainPhoto(
        oshiId
    );


    renderOshiPhotoAlbum(
        oshiId
    );


    refreshExistingFavoritesPage();


    console.log(
        "★ 推し写真削除:",
        photoId
    );

}


/* =========================================================
   ⭐ 現在写真共有
========================================================= */

async function shareOshiCurrentPhoto(){

    const oshiId =
        getCurrentOshiDetailsId();


    const photoId =
        oshiPhotoViewerCurrentId;


    if(
        !oshiId ||
        !photoId
    ){

        return;

    }


    const photos =
        getOshiPhotos(
            oshiId
        );


    const photo =
        photos.find(
            item =>
                String(
                    item.photoId
                ) ===
                String(
                    photoId
                )
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
                "oshi-photo.jpg",
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
                "推しの写真"

        });


    }catch(error){

        console.log(
            "★ 推し写真共有エラー:",
            error
        );

    }

}


/* =========================================================
   ⭐ ビューアを閉じる
========================================================= */

function closeOshiPhotoViewer(){

    const viewer =
        document.getElementById(
            "oshiPhotoViewer"
        );


    if(viewer){

        viewer.style.display =
            "none";

    }


    document.body.style.overflow =
        "";


    oshiPhotoViewerOpen =
        false;


    oshiPhotoViewerPhotoIds =
        [];


    oshiPhotoViewerIndex =
        0;


    oshiPhotoViewerCurrentId =
        null;


    oshiPhotoViewerScale =
        1;


    oshiPhotoViewerTranslateX =
        0;


    oshiPhotoViewerTranslateY =
        0;


    oshiPhotoViewerLastDistance =
        0;

}


/* =========================================================
   ⭐ ビューアボタン接続
========================================================= */

function initOshiPhotoViewerButtons(){

    const addButton =
        document.getElementById(
            "oshiPhotoViewerAddButton"
        );

const topButton =
    document.getElementById(
        "oshiPhotoViewerTopButton"
    );

const favoriteButton =
    document.getElementById(
        "oshiPhotoViewerFavoriteButton"
    );

const deleteButton =
    document.getElementById(
        "oshiPhotoViewerDeleteButton"
    );

    const shareButton =
        document.getElementById(
            "oshiPhotoViewerShareButton"
        );

    const closeButton =
        document.getElementById(
            "oshiPhotoViewerCloseButton"
        );

    const albumAddButton =
        document.getElementById(
            "oshiPhotoAlbumAddButton"
        );

    const albumCloseButton =
        document.getElementById(
            "oshiPhotoAlbumCloseButton"
        );


    /* =========================
       ＋ 写真追加
    ========================= */

    if(addButton){

        addButton.onclick = () => {

            closeOshiPhotoViewer();

            openOshiPhotoAddModal();

        };

    }


    /* =========================
       ❤️ トップ画
    ========================= */

if(topButton){
    topButton.onclick = () => {
        if(!oshiPhotoViewerCurrentId){
            return;
        }

        confirmOshiTopPhoto();
    };

    if(favoriteButton){
    favoriteButton.onclick = () => {
        if(!oshiPhotoViewerCurrentId){ return; }

        toggleOshiPhotoFavorite(
            oshiPhotoViewerCurrentId
        );

        updateOshiPhotoViewerFavoriteButton();
    };
}

}

    /* =========================
       🗑️ 削除
    ========================= */

if(deleteButton){
    deleteButton.onclick = () => {
        if(!oshiPhotoViewerCurrentId){
            return;
        }

        deleteOshiCurrentPhoto();
    };
}

    /* =========================
       📤 共有
    ========================= */

if(shareButton){
    shareButton.onclick = () => {
        if(!oshiPhotoViewerCurrentId){
            return;
        }

        shareOshiCurrentPhoto();
    };
}

    /* =========================
       ✕ 拡大ビューア
    ========================= */

    if(closeButton){

        closeButton.onclick = () => {

            closeOshiPhotoViewer();

            openOshiPhotoAlbum();

        };

    }


    /* =========================
       ＋ 一覧から追加
    ========================= */

    if(albumAddButton){

        albumAddButton.onclick = () => {

            openOshiPhotoAddModal();

        };

    }


    /* =========================
       ✕ 一覧を閉じる
    ========================= */

    if(albumCloseButton){

        albumCloseButton.onclick = () => {

            closeOshiPhotoAlbum();

        };

    }

}


/* =========================================================
   ⭐ ビューアDOMが後から存在する場合の初期化
========================================================= */

function initializeOshiPhotoViewer(){

    initOshiPhotoViewer();

    initOshiPhotoViewerButtons();

}


/* =========================================================
   ⭐ 推し詳細ページを閉じる
========================================================= */

function closeOshiDetail(){

    console.log(
        "★ 推し詳細ページを閉じる"
    );


    closeOshiPhotoViewer();


    closeOshiPhotoAddModal();


    const container =
        document.getElementById(
            "oshiContainer"
        );


    if(!container){
        return;
    }


    loadOshiPage();

}


/* =========================================================
   ⭐ 推し活記録ページを閉じる
========================================================= */

function closeOshiRecord(){

    console.log(
        "★ 推し活記録ページを閉じる"
    );


    closeOshiPhotoViewer();


    const container =
        document.getElementById(
            "oshiContainer"
        );


    if(!container){
        return;
    }


    loadOshiPage();

}


/* =========================================================
   ⭐ 推し詳細ページ表示後の追加初期化
========================================================= */

function initializeOshiDetailsPhotoFeature(){

    const oshiId =
        getCurrentOshiDetailsId();


    if(!oshiId){
        return;
    }


    initializeOshiPhotos(
        oshiId
    );


    renderOshiMainPhoto(
        oshiId
    );


    renderOshiPhotoAlbum(
        oshiId
    );


    initializeOshiPhotoViewer();

}


/* =========================================================
   ⭐ グローバル初期化
========================================================= */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            initializeOshiPhotoViewer();

        }
    );

}else{

    initializeOshiPhotoViewer();

}