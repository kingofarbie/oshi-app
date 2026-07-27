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

