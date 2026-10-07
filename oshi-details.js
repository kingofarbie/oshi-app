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

let oshiPhotoAlbumSelectionMode = false;
let oshiPhotoAlbumSelectedIds = [];
let oshiPhotoAlbumSelectionType = "";

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

async function getOshiPhotos(
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


    const result = [];


    for(
        const photo of photos
    ){

        if(
            !photo ||
            !photo.photoId
        ){
            continue;
        }


        try{

            const media =
                await getMediaFile(
                    photo.photoId
                );


            if(
                !media ||
                !media.file
            ){
                continue;
            }


            const src =
                createMediaURL(
                    media
                );


            if(!src){
                continue;
            }


            result.push({

                ...photo,

                src:
                    src

            });


        }catch(error){

            console.error(
                "推し写真のIndexedDB取得に失敗:",
                photo.photoId,
                error
            );

        }

    }


    return result.sort(
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

async function getOshiTopPhoto(
    oshiId
){

    const photos =
        await getOshiPhotos(
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

async function renderOshiMainPhoto(
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
        await getOshiPhotos(
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

    alert("選択された枚数：" + files.length);


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


    /*
       写真を1枚ずつ順番に処理する

       ・スマホで大量の画像を同時処理しない
       ・画像処理そのものは今までと同じ
       ・最後の保存は1回だけ
    */

    const results = [];


    function processNext(index){

        if(
            index >=
            validFiles.length
        ){

            saveOshiPhotos(
                oshiId,
                results
            );

            return;

        }


        const file =
            validFiles[index];


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

                            alert("画像処理できました：" + (index + 1) + "枚目");

                        results.push({
                            src: src
                        });


                        /*
                           今の画像を処理し終わってから
                           次の画像へ進む
                        */

                        processNext(
                            index + 1
                        );

                    };


                image.onerror =
                    function(){

                        /*
                           1枚失敗しても
                           残りの写真は続けて処理する
                        */

                        processNext(
                            index + 1
                        );

                    };


                image.src =
                    readerEvent.target.result;

            };


        reader.onerror =
            function(){

                /*
                   1枚失敗しても
                   残りの写真は続けて処理する
                */

                processNext(
                    index + 1
                );

            };


        reader.readAsDataURL(
            file
        );

    }


    /*
       1枚目から開始
    */

    processNext(0);

}


/* =========================================================
   ⭐ 写真保存
========================================================= */

async function saveOshiPhotos(
    oshiId,
    photos
){

    alert(
        "saveOshiPhotos到達：" +
        photos.length +
        "枚"
    );


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
        data.oshiDetails = {};
    }


    if(!data.oshiDetails[oshiId]){
        data.oshiDetails[oshiId] = {};
    }


    if(
        !Array.isArray(
            data.oshiDetails[oshiId].photos
        )
    ){
        data.oshiDetails[oshiId].photos = [];
    }


    const currentPhotos =
        data.oshiDetails[oshiId].photos;


    let maxOrder =
        currentPhotos.length;


    const hasTop =
        currentPhotos.some(
            photo =>
                photo.isTop === true
        );


    /*
       =====================================================
       写真本体をIndexedDBへ保存
       =====================================================
    */

    for(
        let index = 0;
        index < photos.length;
        index++
    ){

        const item =
            photos[index];


        if(
            !item ||
            !item.src
        ){
            continue;
        }


        const photoId =
            "oshi_photo_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2) +
            "_" +
            index;


        /*
           DataURL
           ↓
           Blob
        */

        let imageBlob;

        try{

            const response =
                await fetch(
                    item.src
                );

            imageBlob =
                await response.blob();

        }catch(error){

            console.error(
                "推し写真のBlob変換に失敗:",
                error
            );

            continue;
        }


        /*
           IndexedDBへ画像本体を保存
        */

        try{

            await saveMediaFile(
                photoId,
                imageBlob,
                "photo"
            );

        }catch(error){

            console.error(
                "推し写真のIndexedDB保存に失敗:",
                error
            );

            alert(
                "写真の保存に失敗しました。"
            );

            return;
        }


        /*
           localStorageには
           画像本体(src)を保存しない
        */

        const photo = {

            photoId:
                photoId,

            oshiId:
                oshiId,

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


        alert(
            "IndexedDB保存：" +
            (index + 1) +
            "/" +
            photos.length +
            "枚"
        );

    }


    /*
       =====================================================
       画像本体のないメタデータだけをlocalStorageへ保存
       =====================================================
    */

    alert(
        "db.save開始：" +
        currentPhotos.length +
        "枚"
    );


    db.save(
        data
    );


    alert(
        "db.save完了：" +
        data.oshiDetails[oshiId].photos.length +
        "枚"
    );


    /*
       =====================================================
       既存表示更新
       =====================================================
    */

    renderOshiMainPhoto(
        oshiId
    );


    renderOshiPhotoAlbum(
        oshiId
    );


    const albumViewer =
        document.getElementById(
            "oshiPhotoAlbumViewer"
        );


    if(
        albumViewer &&
        albumViewer.style.display === "flex"
    ){

        openOshiPhotoAlbum();

    }


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
        "★ 推し写真をIndexedDBへ保存:",
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
        return;

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
            photo,
            data
        );


    }else{

        removeOshiPhotoFromFavorites(
            photo,
            data

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
    photo,
    data
){

    if(
        !photo ||
        !data
    ){
        return;
    }


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


    const id =
        "oshi_favorite_" +
        photo.oshiId +
        "_" +
        photo.photoId;


    /*
       既存のお気に入りを確認

       ・現在形式
       ・移行前の古い形式

       どちらも同じお気に入りとして扱う
    */

    const existingIndex =
        data.favorites.photos.findIndex(
            favorite => {

                if(
                    !favorite ||
                    favorite.source !==
                        "favorite"
                ){

                    return false;

                }


                if(
                    String(
                        favorite.id
                    ) ===
                    String(id)
                ){

                    return true;

                }


                return (
                    String(
                        favorite.oshiId
                    ) ===
                    String(
                        photo.oshiId
                    ) &&
                    String(
                        favorite.sourceOshiPhotoId || ""
                    ) ===
                    String(
                        photo.photoId
                    )
                );

            }
        );


    /*
       既存のお気に入りがある場合
       → IndexedDB参照用情報を最新形式へ更新
    */

    if(
        existingIndex >= 0
    ){

        const existing =
            data.favorites.photos[
                existingIndex
            ];


        existing.id =
            id;

        existing.source =
            "favorite";

        existing.oshiId =
            photo.oshiId;

        existing.sourceOshiPhotoId =
            photo.photoId;


        if(
            !existing.favoriteAt
        ){

            existing.favoriteAt =
                Date.now();

        }


        /*
           photoOrderにIDがなければ追加
        */

        const orderExists =
            data.favorites.photoOrder.some(
                orderId =>
                    String(orderId) ===
                    String(id)
            );


        if(!orderExists){

            data.favorites.photoOrder.push(
                id
            );

        }


        return;

    }


    /*
       新規お気に入り
    */

    const favoritePhoto = {

        id:
            id,

        source:
            "favorite",

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

}


/* =========================================================
   ⭐ 推し写真を既存お気に入りから削除
========================================================= */

function removeOshiPhotoFromFavorites(
    photo,
    data
){

    if(
        !photo ||
        !data
    ){
        return;
    }

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
   🌌 推し写真アルバム 星空生成
   ・アルバムを開くたびに星の位置をランダム変更
========================================================= */

function createOshiPhotoAlbumStars(viewer){

    if(!viewer){
        return;
    }


    /* =========================
       星レイヤー取得・作成
    ========================= */

    let starsLayer =
        viewer.querySelector(
            ".oshi-photo-album-stars"
        );


    if(!starsLayer){

        starsLayer =
            document.createElement(
                "div"
            );

        starsLayer.className =
            "oshi-photo-album-stars";

        viewer.prepend(
            starsLayer
        );

    }


    /* =========================
       既存の星を削除
    ========================= */

    starsLayer.innerHTML = "";


    /* =========================
       星を生成
    ========================= */

    const starCount = 80;


    for(
        let i = 0;
        i < starCount;
        i++
    ){

        const star =
            document.createElement(
                "span"
            );


        star.className =
            "oshi-photo-album-star";


        /* ランダム位置 */

        star.style.left =
            (Math.random() * 100) +
            "%";

        star.style.top =
            (Math.random() * 100) +
            "%";


        /* ランダムサイズ */

        const size =
            1 +
            Math.random() * 2;


        star.style.width =
            size + "px";

        star.style.height =
            size + "px";


/* ランダム透明度 */
star.style.opacity =
    0.35 +
    Math.random() * 0.35;


/* =========================
   ✨ 星ごとに明滅をランダム化
   ========================= */

/* 明滅する速さ */
star.style.setProperty(
    "--star-duration",
    (2.8 + Math.random() * 4.5) + "s"
);

/* 明滅の開始位置 */
star.style.setProperty(
    "--star-delay",
    (-Math.random() * 6) + "s"
);

/* 星ごとの輝き */
star.style.setProperty(
    "--star-glow",
    (0.35 + Math.random() * 0.65).toFixed(2)
);

starsLayer.appendChild(
    star
);

    }

}


/* =========================================================
   ⭐ 推しアルバムを開く
========================================================= */

async function openOshiPhotoAlbum(){

    const oshiContainer =
        document.getElementById(
            "oshiContainer"
        );

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


    /* 🌌 星空を毎回ランダム生成 */

    createOshiPhotoAlbumStars(
        viewer
    );


    const photos =
        (
            await getOshiPhotos(
                oshiId
            )
        ).slice().sort(
            (a,b) =>
                (a.order ?? 0) -
                (b.order ?? 0)
        );


    grid.innerHTML = "";


    photos.forEach(
        photo => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "oshi-photo-album-viewer-item";


            if(
                oshiPhotoAlbumSelectedIds
                    .includes(
                        String(
                            photo.photoId
                        )
                    )
            ){

                button.classList.add(
                    "selected"
                );

            }


            button.innerHTML = `

                <img
                    src="${photo.src}"
                    alt="推しの写真"
                    draggable="false">

                <div
                    class="oshi-photo-album-viewer-status">

                    <span>
                        ${photo.favorite ? "⭐" : ""}
                    </span>

                    <span>
                        ${photo.isTop ? "❤️" : ""}
                    </span>

                </div>

            `;


            button.addEventListener(
                "click",
                () => {

                    const photoId =
                        String(
                            photo.photoId
                        );


                    /* =====================
                       選択モード
                    ===================== */

                    if(
                        oshiPhotoAlbumSelectionMode
                    ){

                        const index =
                            oshiPhotoAlbumSelectedIds
                                .indexOf(
                                    photoId
                                );


                        if(index >= 0){

                            oshiPhotoAlbumSelectedIds
                                .splice(
                                    index,
                                    1
                                );

                        }
                        else{

                            oshiPhotoAlbumSelectedIds
                                .push(
                                    photoId
                                );

                        }


                        updateOshiPhotoAlbumSelection();

                        openOshiPhotoAlbum();

                        return;

                    }


                    /* =====================
                       通常モード
                    ===================== */

                    closeOshiPhotoAlbum();

                    openOshiPhotoViewer(
                        photo.photoId
                    );

                }
            );


            grid.appendChild(
                button
            );

        }
    );


    const addButton =
        document.getElementById(
            "oshiPhotoAlbumAddButton"
        );

    if(addButton){

        addButton.onclick = null;

        addButton.onclick =
            function(){

                openOshiPhotoAddModal();

            };

    }


    const deleteButton =
        document.getElementById(
            "oshiPhotoAlbumDeleteButton"
        );

    if(deleteButton){

        deleteButton.onclick = null;

        deleteButton.onclick =
            function(){

                if(
                    !oshiPhotoAlbumSelectionMode
                ){

                    enterOshiPhotoAlbumSelectionMode(
                        "delete"
                    );

                }
                else if(
                    oshiPhotoAlbumSelectionType ===
                        "delete"
                ){

                    deleteSelectedOshiPhotos();

                }
                else{

                    enterOshiPhotoAlbumSelectionMode(
                        "delete"
                    );

                }

            };

    }


    const shareButton =
        document.getElementById(
            "oshiPhotoAlbumShareButton"
        );

    if(shareButton){

        shareButton.onclick = null;

        shareButton.onclick =
            function(){

                if(
                    !oshiPhotoAlbumSelectionMode
                ){

                    enterOshiPhotoAlbumSelectionMode(
                        "share"
                    );

                }
                else if(
                    oshiPhotoAlbumSelectionType ===
                        "share"
                ){

                    shareSelectedOshiPhotos();

                }
                else{

                    enterOshiPhotoAlbumSelectionMode(
                        "share"
                    );

                }

            };

    }


    const closeButton =
        document.getElementById(
            "oshiPhotoAlbumCloseButton"
        );

    if(closeButton){

        closeButton.onclick = null;

        closeButton.onclick =
            function(){

                if(
                    oshiPhotoAlbumSelectionMode
                ){

                    exitOshiPhotoAlbumSelectionMode();

                }
                else{

                    closeOshiPhotoAlbum();

                }

            };

    }


    updateOshiPhotoAlbumSelection();


    viewer.style.display =
        "flex";

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


function enterOshiPhotoAlbumSelectionMode(
    type = ""
){

    oshiPhotoAlbumSelectionMode = true;

    oshiPhotoAlbumSelectedIds = [];

    oshiPhotoAlbumSelectionType = type;

    const viewer =
        document.getElementById(
            "oshiPhotoAlbumViewer"
        );

    if(viewer){

        viewer.classList.add(
            "selection-mode"
        );

    }

    updateOshiPhotoAlbumSelection();

}


function exitOshiPhotoAlbumSelectionMode(){

    oshiPhotoAlbumSelectionMode = false;

    oshiPhotoAlbumSelectedIds = [];

    oshiPhotoAlbumSelectionType = "";

    const viewer =
        document.getElementById(
            "oshiPhotoAlbumViewer"
        );

    if(viewer){

        viewer.classList.remove(
            "selection-mode"
        );

    }

    updateOshiPhotoAlbumSelection();

    openOshiPhotoAlbum();

}



function updateOshiPhotoAlbumSelection(){

    const count =
        oshiPhotoAlbumSelectedIds.length;


    const countElement =
        document.getElementById(
            "oshiPhotoAlbumSelectedCount"
        );

    if(countElement){

const modeText =
    oshiPhotoAlbumSelectionType === "delete"
        ? "削除モード"
        : oshiPhotoAlbumSelectionType === "share"
            ? "共有モード"
            : "";

if(modeText){

    countElement.textContent =
        modeText +
        " " +
        count +
        "枚選択中";

}
else{

    countElement.textContent = "";

}


    }


    const viewer =
        document.getElementById(
            "oshiPhotoAlbumViewer"
        );

    if(viewer){

        if(
            oshiPhotoAlbumSelectionMode
        ){

            viewer.classList.add(
                "selection-mode"
            );

        }
        else{

            viewer.classList.remove(
                "selection-mode"
            );

        }

    }


    document
        .querySelectorAll(
            "#oshiPhotoAlbumViewerGrid .oshi-photo-album-viewer-item"
        )
        .forEach(
            item => {

                /*
                 * 写真IDは画像の親ボタンから
                 * 直接取得できないため、
                 * openOshiPhotoAlbum() 側で
                 * class を更新する。
                 */

            }
        );

}


/* =========================================================
   📸 推し写真アルバム
   選択写真を一括削除
========================================================= */

async function deleteSelectedOshiPhotos(){

    const selectedIds =
        [...oshiPhotoAlbumSelectedIds];

    if(selectedIds.length === 0){

        alert(
            "削除する写真を選択してください。"
        );

        return;

    }


    const ok =
        confirm(
            "選択した" +
            selectedIds.length +
            "枚の写真を削除しますか？"
        );

    if(!ok){

        return;

    }


    const oshiId =
        getCurrentOshiDetailsId();

    if(!oshiId){

        return;

    }


    const data =
        db.load();


    const details =
        data.oshiDetails?.[oshiId];


    if(
        !details ||
        !Array.isArray(details.photos)
    ){

        return;

    }


    const selectedSet =
        new Set(
            selectedIds.map(
                id => String(id)
            )
        );


    /* =========================
       削除対象
    ========================= */

    const deletedPhotos =
        details.photos.filter(
            photo =>
                selectedSet.has(
                    String(
                        photo.photoId
                    )
                )
        );


    if(deletedPhotos.length === 0){

        return;

    }


    /* =========================
       IndexedDBの写真本体を削除
    ========================= */

    try{

        for(
            const photo of deletedPhotos
        ){

            if(!photo?.photoId){

                continue;

            }


            await deleteMediaFile(
                photo.photoId
            );

        }

    }catch(error){

        console.error(
            "IndexedDB複数写真削除エラー:",
            error
        );

        alert(
            "写真の削除に失敗しました。"
        );

        return;

    }


    /* =========================
       お気に入り同期
    ========================= */

    deletedPhotos.forEach(
        photo => {

            if(
                photo.favorite &&
                typeof removeOshiPhotoFromFavorites ===
                    "function"
            ){

                removeOshiPhotoFromFavorites(
                    oshiId,
                    photo.photoId
                );

            }

        }
    );


    /* =========================
       トップ画削除判定
    ========================= */

    const deletedTopPhoto =
        deletedPhotos.some(
            photo =>
                photo.isTop === true
        );


    /* =========================
       写真削除
    ========================= */

    details.photos =
        details.photos.filter(
            photo =>
                !selectedSet.has(
                    String(
                        photo.photoId
                    )
                )
        );


    /* =========================
       並び順を再整理
    ========================= */

    details.photos.forEach(
        (photo,index) => {

            photo.order =
                index;

        }
    );


    /* =========================
       トップ画を再設定
    ========================= */

    if(deletedTopPhoto){

        details.photos.forEach(
            photo => {

                photo.isTop =
                    false;

            }
        );


        if(
            details.photos.length > 0
        ){

            details.photos[0].isTop =
                true;

        }

    }
    else{

        /*
           トップ画が残っている場合は
           そのまま維持
        */

        const topPhoto =
            details.photos.find(
                photo =>
                    photo.isTop === true
            );


        if(
            !topPhoto &&
            details.photos.length > 0
        ){

            details.photos[0].isTop =
                true;

        }

    }


    /* =========================
       保存
    ========================= */

    db.save(
        data
    );


    /* =========================
       選択解除
    ========================= */

    oshiPhotoAlbumSelectionMode =
        false;

    oshiPhotoAlbumSelectedIds =
        [];


    /* =========================
       残り写真取得
    ========================= */

    const remainingPhotos =
        await getOshiPhotos(
            oshiId
        );


    /* =========================
       表示更新
    ========================= */

    renderOshiMainPhoto(
        oshiId
    );


    renderOshiPhotoAlbum(
        oshiId
    );


    if(
        typeof refreshExistingFavoritesPage ===
            "function"
    ){

        refreshExistingFavoritesPage();

    }


    /* =========================
       アルバム更新
    ========================= */

    if(
        remainingPhotos.length > 0
    ){

        await openOshiPhotoAlbum();

    }
    else{

        closeOshiPhotoAlbum();

    }

}



/* =========================================================
   📸 推し写真アルバム
   選択写真を一括共有
========================================================= */

async function shareSelectedOshiPhotos(){

    const selectedIds =
        [...oshiPhotoAlbumSelectedIds];


    if(selectedIds.length === 0){

        alert(
            "共有する写真を選択してください。"
        );

        return;

    }


    if(
        typeof navigator.share !==
            "function"
    ){

        alert(
            "このブラウザでは写真の共有に対応していません。"
        );

        return;

    }


    const oshiId =
        getCurrentOshiDetailsId();


    if(!oshiId){

        return;

    }


    const photos =
        await getOshiPhotos(
            oshiId
        );


    const selectedPhotos =
        photos.filter(
            photo =>
                selectedIds.includes(
                    photo.photoId
                )
        );


    if(selectedPhotos.length === 0){

        return;

    }


    try{

        const files = [];


        for(
            let i = 0;
            i < selectedPhotos.length;
            i++
        ){

            const photo =
                selectedPhotos[i];


            const response =
                await fetch(
                    photo.src
                );


            if(!response.ok){

                throw new Error(
                    "写真の読み込みに失敗しました。"
                );

            }


            const blob =
                await response.blob();


            const extension =
                blob.type === "image/png"
                    ? "png"
                    : "jpg";


            const file =
                new File(
                    [
                        blob
                    ],
                    "oshi-photo-" +
                        (i + 1) +
                        "." +
                        extension,
                    {
                        type:
                            blob.type ||
                            "image/jpeg"
                    }
                );


            files.push(file);

        }


        /* =========================
           複数ファイル共有対応確認
        ========================= */

        if(
            typeof navigator.canShare ===
                "function"
        ){

            const canShare =
                navigator.canShare({
                    files: files
                });


            if(!canShare){

                alert(
                    "この端末・ブラウザでは、複数写真の共有に対応していません。"
                );

                return;

            }

        }


        await navigator.share({

            files: files,

            title:
                "推し活手帳",

            text:
                "推しの写真"

        });


        /* =========================
           共有完了
        ========================= */

        oshiPhotoAlbumSelectionMode =
            false;

        oshiPhotoAlbumSelectedIds =
            [];


        openOshiPhotoAlbum();

    }
    catch(error){

        /*
           Android等で共有画面を
           キャンセルした場合は
           エラー表示しない
        */

        if(
            error &&
            error.name ===
                "AbortError"
        ){

            return;

        }


        console.error(
            "推し写真の共有に失敗しました:",
            error
        );


        alert(
            "写真の共有に失敗しました。"
        );

    }

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

async function openOshiPhotoViewer(
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
        await getOshiPhotos(
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


    /*
       写真表示
    */

    await updateOshiPhotoViewer();


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

async function updateOshiPhotoViewer(){
    
    if(
        oshiPhotoViewerPhotoIds.length ===
        0
    ){

        return;

    }


    const oshiId =
        getCurrentOshiDetailsId();


const photos = await getOshiPhotos(oshiId);


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

async function showOshiPhotoViewerPhoto(
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


    await updateOshiPhotoViewer();

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
       1本指タッチ終了確認
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
       拡大中
       → スワイプはしない
       → ダブルタップは有効
    ===================== */

    if(
        oshiPhotoViewerScale > 1
    ){

        /*
           指を大きく動かした場合は
           ダブルタップ判定をしない
        */

        if(
            Math.abs(diffX) >= 60
        ){

            oshiPhotoViewerLastTapTime =
                0;

            oshiPhotoViewerLastDistance =
                0;

            return;

        }


        const now =
            Date.now();


        if(
            now -
            oshiPhotoViewerLastTapTime <
            300
        ){

            /*
               2回目のタップ
               → 1倍に戻す
            */

            oshiPhotoViewerScale =
                1;

            oshiPhotoViewerTranslateX =
                0;

            oshiPhotoViewerTranslateY =
                0;


            applyOshiPhotoViewerTransform();


            oshiPhotoViewerLastTapTime =
                0;

        }else{

            /*
               1回目のタップ
            */

            oshiPhotoViewerLastTapTime =
                now;

        }


        oshiPhotoViewerLastDistance =
            0;

        return;

    }


    /* =====================
       通常サイズ時のスワイプ
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
       通常サイズ時のダブルタップ
    ===================== */

    const now =
        Date.now();


    if(
        now -
        oshiPhotoViewerLastTapTime <
        300
    ){

        /*
           1倍 → 2倍
        */

        oshiPhotoViewerScale =
            2;


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

async function confirmOshiTopPhoto(){

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


    await updateOshiPhotoViewer();


    console.log(
        "★ 推しトップ画を変更:",
        photoId
    );

}


/* =========================================================
   ⭐ 現在写真削除
========================================================= */

async function deleteOshiCurrentPhoto(){
    
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


    /*
       IndexedDBの写真本体を削除
    */

    try{

        await deleteMediaFile(
            photoId
        );

    }catch(error){

        console.error(
            "IndexedDB写真削除エラー:",
            error
        );

        alert(
            "写真の削除に失敗しました。"
        );

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
       写真メタデータ削除
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
        await getOshiPhotos(
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


    await updateOshiPhotoViewer();


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
    await getOshiPhotos(
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