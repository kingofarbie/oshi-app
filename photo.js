/* =====================
   写真用変数
===================== */
let currentPhotoSrc = "";
let currentPhotoIndex = 0;
let touchStartX = 0;

let favoriteViewMode = false;

let photoScale = 1;
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

                id:Date.now(),

                src:smallImage,
                
                favorite:false

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


    Object.values(
        data.dayMemories || {}
    )
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
            "お気に入り写真はありません";


        }else{


            const showPhotos =
                showAllFavorites
                ?
                photos
                :
                photos.slice(0,4);



            photoBox.innerHTML =

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

        const photos = day.photos;

        const showPhotos =
            showAllDayPhotos
            ? photos
            : photos.slice(0,4);

photoArea.innerHTML =

getPhotoToolbar("calendar")

+

showPhotos.map(p=>`

<div class="memory-photo-box">

<img
src="${p.src}"
class="memory-photo"
onclick="openPhotoViewer(${p.id})">

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
showAllDayPhotos = !showAllDayPhotos;
renderDayPhotos();
">

${showAllDayPhotos ? "閉じる" : "もっと見る"}

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

    const title =
        type === "favorite"
        ? "⭐ お気に入り写真"
        : "📷 写真";

    return `

<div class="photo-toolbar">

    <div class="photo-toolbar-title">

        ${title}

    </div>

    <button
        class="photo-sort-btn"
        onclick="openPhotoSortMenu('${type}')">

        並べ替え ▼

    </button>

</div>

`;

}

function openPhotoSortMenu(type){

    alert(
        type === "favorite"
        ?
        "お気に入り写真の並べ替え（準備中）"
        :
        "写真の並べ替え（準備中）"
    );

}