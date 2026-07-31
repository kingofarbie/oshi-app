/* =====================
   写真用変数
===================== */
let currentPhotoSrc = "";
let currentPhotoIndex = 0;
let touchStartX = 0;

let favoriteViewMode = false;

let photoScale = 1;

let photoSortMode = false;
let currentSortType = "";

let dragPhotoId = null;

/* =====================
   写真表示設定
===================== */

const PHOTO_COLUMNS = 3; // 2列
const PHOTO_ROWS = 3;    // 2段

/* =====================
   自由並べ替え用
===================== */

let photoLongPressTimer = null;

let draggingPhotoId = null;

let draggingPhotoElement = null;

let isPhotoDragging = false;

let dragStartPoint = {
    x:0,
    y:0
};



let lastDistance = 0;


let photoTranslateX = 0;
let photoTranslateY = 0;

let dragStartX = 0;
let dragStartY = 0;

let lastTapTime = 0;

/* =====================
   写真追加
===================== */

function addPhoto(){

    document.getElementById("photoPicker").click();

}

function photoSelected(event){

    const file = event.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const img = new Image();

        img.onload = function(){

            // 最大サイズ
            const MAX = 1000;

            let width = img.width;
            let height = img.height;

            if(width > height){

                if(width > MAX){
                    height *= MAX / width;
                    width = MAX;
                }

            }else{

                if(height > MAX){
                    width *= MAX / height;
                    height = MAX;
                }

            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            ctx.drawImage(
                img,
                0,
                0,
                width,
                height
            );

            // JPEG品質 80%
            const smallImage =
                canvas.toDataURL(
                    "image/jpeg",
                    0.8
                );

            const data = db.load();

            if(!data.dayMemories){
                data.dayMemories = {};
            }

            if(!data.dayMemories[selectedCalendarDate]){

                data.dayMemories[selectedCalendarDate]={

                    memo:[],
                    photos:[],
                    videos:[],
                    expenses:[],
                    rating:0,
                    comment:""

                };

            }

data.dayMemories[selectedCalendarDate].photos.push({

    id: Date.now(),

    src: smallImage,

    favorite: false,

    star: 0,

    tags: [],

    order: Date.now()

});

            db.save(data);

            renderDayMemory();

        };

        img.src = e.target.result;

    };

    reader.readAsDataURL(file);

    event.target.value = "";

}

/* =====================
   写真ビューア
===================== */

function openPhotoViewer(id){

    const data = db.load();

const photos = favoriteViewMode
    ? Object.values(data.dayMemories || {})
        .flatMap(day => day.photos || [])
        .filter(photo => photo.favorite)
    : data.dayMemories?.[selectedCalendarDate]?.photos || [];

    const photo =
        photos.find(
            p => p.id === id
        );


    if(!photo){
        return;
    }


    currentPhotoId = id;

    currentPhotoSrc = photo.src;


    currentPhotoIndex =
        photos.findIndex(
            p => p.id === id
        );



    const img =
        document.getElementById(
            "photoViewerImage"
        );


    img.src = photo.src;


const deleteBtn =
    document.querySelector(".photo-delete");

const closeBtn =
    document.querySelector(".photo-close");


if(deleteBtn){

    if(favoriteViewMode){

        deleteBtn.style.display = "none";

        if(closeBtn){
            closeBtn.style.right = "72px";
        }

    }else{

        deleteBtn.style.display = "flex";

        if(closeBtn){
            closeBtn.style.right = "20px";
        }

    }

}

    img.style.transform =
        "translate(0px,0px) scale(1)";


    photoScale = 1;

    photoTranslateX = 0;

    photoTranslateY = 0;

    lastDistance = 0;



    updateFavoriteButton();



    document
    .getElementById(
        "photoViewer"
    )
    .style.display = "flex";



    document.body.style.overflow = "hidden";

}

function openFavoritePhotoViewer(id){

    const data = db.load();

    let targetPhoto = null;
    let photos = [];


    Object.values(data.dayMemories || {})
    .forEach(day=>{

        (day.photos || [])
        .forEach(photo=>{

            if(photo.favorite){

                photos.push(photo);

                if(photo.id === id){
                    targetPhoto = photo;
                }

            }

        });

    });


    if(!targetPhoto){
        return;
    }


    favoriteViewMode = true;

    currentPhotoId = id;

    currentPhotoSrc = targetPhoto.src;


    currentPhotoIndex =
        photos.findIndex(
            p => p.id === id
        );


    const img =
        document.getElementById(
            "photoViewerImage"
        );


    img.src = targetPhoto.src;


    img.style.transform =
        "translate(0px,0px) scale(1)";


    photoScale = 1;
    photoTranslateX = 0;
    photoTranslateY = 0;
    lastDistance = 0;


    updateFavoriteButton();


    document.getElementById(
        "photoViewer"
    ).style.display="flex";

const deleteBtn =
    document.querySelector(".photo-delete");


if(deleteBtn){

    deleteBtn.style.display = "none";

    document.querySelector(".photo-close").style.right = "72px";

}

    document.getElementById("photoViewer").style.zIndex = "9999";

    document.body.style.overflow="hidden";

}

function closePhotoViewer(){

    document.getElementById("photoViewer").style.display = "none";

    document.body.style.overflow = "";

    photoScale = 1;
    lastDistance = 0;

    photoTranslateX = 0;
    photoTranslateY = 0;

    document.getElementById("photoViewerImage").style.transform =
        "translate(0px,0px) scale(1)";
        
    favoriteViewMode = false;

}

function showPhoto(index){

    const data = db.load();

const photos = favoriteViewMode
    ? Object.values(data.dayMemories || {})
        .flatMap(day => day.photos || [])
        .filter(photo => photo.favorite)
    : data.dayMemories?.[selectedCalendarDate]?.photos || [];

    if(photos.length === 0){
        return;
    }


    // 最後まで行ったら最初へ
    if(index >= photos.length){

        index = 0;

    }


    // 最初より前なら最後へ
    if(index < 0){

        index = photos.length - 1;

    }


    currentPhotoIndex = index;


    // ★重要：表示中写真のIDを更新
    currentPhotoId = photos[index].id;


    currentPhotoSrc = photos[index].src;



    document
    .getElementById(
        "photoViewerImage"
    )
    .src = currentPhotoSrc;



    // ★スワイプ後の星状態更新
    updateFavoriteButton();

}

/* =====================
   お気に入り
===================== */

function toggleFavoritePhoto(){

    const data = db.load();

    const day =
        data.dayMemories?.[selectedCalendarDate];


    if(!day) return;


const photo =
    day.photos.find(
        p => p.id === currentPhotoId
    );

    if(!photo) return;


    photo.favorite =
        !photo.favorite;


    db.save(data);


    updateFavoriteButton();

}

function updateFavoriteButton(){

    const btn =
        document.querySelector(
            ".photo-favorite"
        );


    if(!btn) return;


    const data = db.load();


    let photo = null;


    Object.values(
        data.dayMemories || {}
    )
    .forEach(day=>{

        (day.photos || [])
        .forEach(p=>{

            if(p.id === currentPhotoId){

                photo = p;

            }

        });

    });


    if(photo && photo.favorite){

        btn.textContent = "⭐";

    }else{

        btn.textContent = "☆";

    }

}

/* =====================
   写真操作
===================== */

function photoSwipe(event){

    if(photoScale > 1){
        return;
    }

    if(event.changedTouches.length !== 1){
        return;
    }

    const touchEndX =
        event.changedTouches[0].clientX;

    const diff =
        touchEndX - touchStartX;

    if(Math.abs(diff) < 60){
        return;
    }

    if(diff < 0){

        showPhoto(currentPhotoIndex + 1);

    }else{

        showPhoto(currentPhotoIndex - 1);

    }

}

function photoDragStart(event){

    if(photoScale <= 1) return;

    if(event.touches.length !== 1) return;

    event.preventDefault();

    dragStartX = event.touches[0].clientX;
    dragStartY = event.touches[0].clientY;

}

function photoPinch(event){

    const img =
        document.getElementById("photoViewerImage");

    // ----- 2本指ピンチ -----
    if(event.touches.length === 2){

        event.preventDefault();

        const dx =
            event.touches[0].clientX -
            event.touches[1].clientX;

        const dy =
            event.touches[0].clientY -
            event.touches[1].clientY;

        const distance =
            Math.sqrt(dx*dx + dy*dy);

        if(lastDistance !== 0){

            photoScale *= distance / lastDistance;

            if(photoScale < 1){
                photoScale = 1;
            }

            if(photoScale > 4){
                photoScale = 4;
            }

            img.style.transform =
                `translate(${photoTranslateX}px,${photoTranslateY}px) scale(${photoScale})`;

        }

        lastDistance = distance;

        return;

    }

    // ----- 1本指ドラッグ -----

    if(photoScale > 1 && event.touches.length === 1){

        event.preventDefault();

        const x =
            event.touches[0].clientX;

        const y =
            event.touches[0].clientY;

        photoTranslateX += x - dragStartX;
        photoTranslateY += y - dragStartY;

        dragStartX = x;
        dragStartY = y;

        img.style.transform =
            `translate(${photoTranslateX}px,${photoTranslateY}px) scale(${photoScale})`;

    }

}

function photoDragEnd(event){

    if(event.changedTouches.length >= 2){
        lastDistance = 0;
    }

}

function photoDoubleTap(event){

    // 2本指なら何もしない
    if(event.changedTouches.length !== 1){
        return;
    }

    const now = Date.now();

    if(now - lastTapTime < 300){

        if(photoScale === 1){

            photoScale = 2;

        }else{

            photoScale = 1;
            photoTranslateX = 0;
            photoTranslateY = 0;

        }

        document.getElementById("photoViewerImage").style.transform =
            `translate(${photoTranslateX}px,${photoTranslateY}px) scale(${photoScale})`;

    }

    lastTapTime = now;

}

/* =====================
   共有・削除
===================== */

function shareCurrentPhoto(){

    if(!currentPhotoSrc){
        return;
    }


    // 画像共有対応端末

    if(
        navigator.share
    ){

        fetch(currentPhotoSrc)

        .then(res=>res.blob())

        .then(blob=>{


            const file =
                new File(
                    [blob],
                    "oshi-photo.jpg",
                    {
                        type:"image/jpeg"
                    }
                );


            navigator.share({

                files:[file],

                title:"推し活手帳",

                text:"お気に入り写真"

            });


        });


    }else{


        alert(
            "この端末では共有機能に対応していません"
        );


    }

}

function deleteCurrentPhoto(){

    if(!confirm("この写真を削除しますか？")){
        return;
    }

    const data = db.load();

    const day = data.dayMemories?.[selectedCalendarDate];

    if(!day) return;

    day.photos = day.photos.filter(
        p => p.src !== currentPhotoSrc
    );

    db.save(data);

    closePhotoViewer();

    renderDayMemory();

}


/* =====================
   お気に入り表示
===================== */
let showAllFavorites = false;


/* =====================
   お気に入り表示
===================== */

function displayFavorites(){

    const data = db.load();

    // 写真
    const photos = [];

    Object.values(data.dayMemories || {})
    .forEach(day=>{

        (day.photos || [])
        .forEach(photo=>{

            if(photo.favorite){

                photos.push(photo);

            }

        });

    });

    const photoBox =
        document.getElementById(
            "favorite-photo-list"
        );

    if(photoBox){

        if(photos.length === 0){

            photoBox.innerHTML =
                getPhotoToolbar("favorite") +
                "お気に入り写真はありません";

        }else{


// お気に入り写真 並べ替え
const favoriteSort =
    localStorage.getItem("favoritePhotoSort")
    || "new";


if(favoriteSort === "new"){

    photos.sort(
        (a,b)=> b.id - a.id
    );

}


if(favoriteSort === "old"){

    photos.sort(
        (a,b)=> a.id - b.id
    );

}


if(favoriteSort === "favoriteNew"){

    photos.sort(
        (a,b)=>{

            const starA = a.star || 0;
            const starB = b.star || 0;


            if(starA !== starB){

                return starB - starA;

            }


            return b.id - a.id;

        }
    );

}


if(favoriteSort === "favoriteOld"){

    photos.sort(
        (a,b)=>{

            const starA = a.star || 0;
            const starB = b.star || 0;


            if(starA !== starB){

                return starB - starA;

            }


            return a.id - b.id;

        }
    );

}




            const showPhotos =
                showAllFavorites
                ?
                photos
                :
                photos.slice(0,4);

            photoBox.innerHTML =

                getPhotoToolbar("favorite")

                +

                showPhotos.map(p=>`

<div class="memory-photo-box">

<img
src="${p.src}"
class="memory-photo"
onclick="openFavoritePhotoViewer(${p.id})">

</div>

`).join("")

                +

                (

                    photos.length > 4

                    ?

`

<div
class="favorite-more"
onclick="
showAllFavorites = !showAllFavorites;
displayFavorites();
">

${showAllFavorites ? "閉じる" : "もっと見る"}

</div>

`

                    :

                    ""

                );

        }

    }

    const count =
        document.getElementById(
            "favorite-photo-count"
        );

    if(count){

        count.textContent =
            photos.length;

    }

}


function renderDayPhotos(){

    const data = db.load();

    const day =
        data.dayMemories?.[selectedCalendarDate];

    const photoArea =
        document.getElementById("photoList");

    if(!photoArea) return;


    if(day && day.photos && day.photos.length){

        let photos = [...day.photos];


        const sortMode =
            localStorage.getItem("calendarPhotoSort") || "new";


        if(sortMode === "free"){

            photos.sort(
                (a,b)=>
                (a.order || a.id) -
                (b.order || b.id)
            );

        }else if(sortMode === "old"){

            photos.sort(
                (a,b)=> a.id - b.id
            );

        }else{

            photos.sort(
                (a,b)=> b.id - a.id
            );

        }


        /* =====================
           表示枚数を自動計算
        ===================== */

        const photoDisplayCount =
            PHOTO_COLUMNS * PHOTO_ROWS;


        const showPhotos =
            showAllDayPhotos
            ? photos
            : photos.slice(
                0,
                photoDisplayCount
            );


        /* =====================
           写真エリア
        ===================== */

        photoArea.style.setProperty(
            "--photo-columns",
            PHOTO_COLUMNS
        );


        photoArea.innerHTML =

            (photoSortMode
                ? getPhotoFreeModeBar()
                : ""
            )

            +

            getPhotoToolbar("calendar")

            +

            showPhotos.map(p=>`

                <div
                    class="memory-photo-box"
                    data-photo-id="${p.id}"
                >

                    <img
                        src="${p.src}"
                        class="memory-photo"
                        draggable="false"
                        ${
                            photoSortMode
                            ? ""
                            : `onclick="openPhotoViewer(${p.id})"`
                        }
                    >

                </div>

            `).join("")

            +

            (
                photos.length > photoDisplayCount

                ?

                `

                <div
                    class="favorite-more"
                    onclick="
                        showAllDayPhotos = !showAllDayPhotos;
                        renderDayPhotos();
                    "
                >

                    ${
                        showAllDayPhotos
                        ? "閉じる"
                        : "もっと見る"
                    }

                </div>

                `

                :

                ""

            );


    }else{

        photoArea.innerHTML =
            "写真はありません";

    }

}

function getPhotoToolbar(type){

    return `

<div class="photo-toolbar">

    <button
        class="photo-sort-btn"
        onclick="openPhotoSortMenu('${type}')">

        並べ替え ▼

    </button>

</div>

`;

}


function openPhotoSortMenu(type){

    const menu = document.getElementById("photoSortMenu");

    if(!menu) return;

    menu.dataset.type = type;

    menu.style.display = "block";

}

function closePhotoSortMenu(){

    document.getElementById(
        "photoSortMenu"
    ).style.display = "none";

}

function setPhotoSort(mode){

    const menu =
        document.getElementById("photoSortMenu");


    if(!menu) return;


    const type =
        menu.dataset.type;


    const data =
        db.load();


        localStorage.setItem(
    "calendarPhotoSort",
    mode
);

if(mode !== "free"){

    photoSortMode = false;

}

if(mode === "free"){

    photoSortMode = true;

    currentSortType = type;

    closePhotoSortMenu();

    if(type === "calendar"){

        renderDayPhotos();

    }

    if(type === "favorite"){

        displayFavorites();

    }

    return;

}


    // カレンダー写真
    if(type === "calendar"){


        const photos =
            data.dayMemories?.[selectedCalendarDate]?.photos;


        if(!photos) return;



        if(mode === "new"){

            photos.sort(
                (a,b)=> b.id - a.id
            );

        }


        if(mode === "old"){

            photos.sort(
                (a,b)=> a.id - b.id
            );

        }


        if(mode === "favoriteNew"){

            photos.sort(
                (a,b)=>{

                    if(a.favorite !== b.favorite){

                        return b.favorite - a.favorite;

                    }

                    return b.id - a.id;

                }
            );

        }


        if(mode === "favoriteOld"){

            photos.sort(
                (a,b)=>{

                    if(a.favorite !== b.favorite){

                        return b.favorite - a.favorite;

                    }

                    return a.id - b.id;

                }
            );

        }


        db.save(data);


        renderDayPhotos();


    }



    // お気に入り写真
if(type === "favorite"){

    localStorage.setItem(
        "favoritePhotoSort",
        mode
    );

    displayFavorites();

}


    closePhotoSortMenu();

}



/* =====================
   長押し自由並べ替え
   長押しのみドラッグ
   短い操作はスクロール
===================== */

let photoTouchMoved = false;

let photoTouchStartX = 0;
let photoTouchStartY = 0;


/* 指を置いた時 */
document.addEventListener(
"touchstart",
function(e){

    if(!photoSortMode){
        return;
    }


    const box =
        e.target.closest(
            ".memory-photo-box"
        );


    if(!box){
        return;
    }


    draggingPhotoId =
        Number(
            box.dataset.photoId
        );


    draggingPhotoElement = box;


    photoTouchMoved = false;


    photoTouchStartX =
        e.touches[0].clientX;

    photoTouchStartY =
        e.touches[0].clientY;


    photoLongPressTimer =
        setTimeout(()=>{


            // 長押し成功
            if(photoTouchMoved){
                return;
            }


            isPhotoDragging = true;


            box.classList.add(
                "photo-dragging"
            );


            if(navigator.vibrate){

                navigator.vibrate(30);

            }


        },100);


},
{
    passive:true
}
);



/* 指を動かした時 */
document.addEventListener(
"touchmove",
function(e){

    if(!photoSortMode){
        return;
    }


    const dx =
        Math.abs(
            e.touches[0].clientX -
            photoTouchStartX
        );


    const dy =
        Math.abs(
            e.touches[0].clientY -
            photoTouchStartY
        );


    // 少しでも動いたらスクロール扱い
    if(!isPhotoDragging){

        if(dx > 10 || dy > 10){

            photoTouchMoved = true;


            clearTimeout(
                photoLongPressTimer
            );


            draggingPhotoId = null;

        }


        return;

    }



    // ドラッグ中だけ止める
    e.preventDefault();


    const touch =
        e.touches[0];


    const target =
        document.elementFromPoint(
            touch.clientX,
            touch.clientY
        );


    const box =
        target?.closest(
            ".memory-photo-box"
        );


    if(
        box &&
        box !== draggingPhotoElement
    ){

        box.parentNode.insertBefore(
            draggingPhotoElement,
            box
        );

    }


},
{
    passive:false
}
);



/* 指を離した時 */
document.addEventListener(
"touchend",
function(){


    clearTimeout(
        photoLongPressTimer
    );


    if(draggingPhotoElement){

        draggingPhotoElement.classList.remove(
            "photo-dragging"
        );

    }


    isPhotoDragging = false;


    draggingPhotoId = null;


},
{
    passive:true
}
);


function getPhotoFreeModeBar(){

return `

<div class="photo-free-bar">

    <div>
        📷 自由変更中<br>
        <small>
        写真をドラッグして並べ替えてください
        </small>
    </div>


    <button
    onclick="finishPhotoSort()">

        完了

    </button>


</div>

`;

}

function finishPhotoSort(){

    const data = db.load();

    const photos =
        data.dayMemories?.[selectedCalendarDate]?.photos;

    if(photos){

        document
        .querySelectorAll(".memory-photo-box")
        .forEach((box,index)=>{

            const id =
                Number(box.dataset.photoId);

            const photo =
                photos.find(
                    p => p.id === id
                );

            if(photo){

                photo.order = index + 1;

            }

        });

        db.save(data);

    }

    photoSortMode = false;

    renderDayPhotos();

    alert("✅ 並び順を保存しました");

}