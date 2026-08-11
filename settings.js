/* =====================
   🖼 ホームお気に入り写真設定
===================== */

/* =====================
   設定読み込み
===================== */

function loadFavoritePhotoSettings(){

    const data = db.load();

    if(!data.settings){
        data.settings = {};
    }

    if(!data.settings.favoritePhoto){

        data.settings.favoritePhoto = {
            count: 3,
            fade: true,
            interval: 7000
        };

        db.save(data);
    }

    const settings =
        data.settings.favoritePhoto;


    /* 表示枚数 */

    const countSelect =
        document.getElementById(
            "homeFavoriteCount"
        );

    if(countSelect){

        countSelect.value =
            String(settings.count ?? 3);

    }


    /* フェイド */

    const fadeBtn =
        document.getElementById(
            "homeFavoriteFadeBtn"
        );

    if(fadeBtn){

        fadeBtn.textContent =
            settings.fade !== false
            ? "ON"
            : "OFF";

    }


    /* 表示時間 */

    const intervalSelect =
        document.getElementById(
            "homeFavoriteInterval"
        );

    if(intervalSelect){

        intervalSelect.value =
            String(settings.interval ?? 7000);

    }

}


/* =====================
   表示枚数変更
===================== */

function changeFavoritePhotoCount(){

    const select =
        document.getElementById(
            "homeFavoriteCount"
        );

    if(!select){
        return;
    }

    const data = db.load();

    if(!data.settings){
        data.settings = {};
    }

    if(!data.settings.favoritePhoto){
        data.settings.favoritePhoto = {};
    }

    data.settings.favoritePhoto.count =
        select.value === "all"
        ? "all"
        : Number(select.value);

    db.save(data);

    displayFavoritePhotoCard();
}


/* =====================
   フェイド ON / OFF
===================== */

function toggleHomeFavoriteFade(){

    const data = db.load();

    if(!data.settings){
        data.settings = {};
    }

    if(!data.settings.favoritePhoto){
        data.settings.favoritePhoto = {};
    }

    const current =
        data.settings.favoritePhoto.fade !== false;

    data.settings.favoritePhoto.fade =
        !current;

    db.save(data);


    const btn =
        document.getElementById(
            "homeFavoriteFadeBtn"
        );

    if(btn){

        btn.textContent =
            data.settings.favoritePhoto.fade
            ? "ON"
            : "OFF";

    }


    displayFavoritePhotoCard();
}


/* =====================
   表示時間変更
===================== */

function changeFavoritePhotoInterval(){

    const select =
        document.getElementById(
            "homeFavoriteInterval"
        );

    if(!select){
        return;
    }

    const data = db.load();

    if(!data.settings){
        data.settings = {};
    }

    if(!data.settings.favoritePhoto){
        data.settings.favoritePhoto = {};
    }

    data.settings.favoritePhoto.interval =
        Number(select.value);

    db.save(data);

    displayFavoritePhotoCard();
}