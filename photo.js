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

