/* =====================
   動画用変数
===================== */


let currentMovieSrc = "";
let currentMovieIndex = 0;
let currentMovieId = null;
let movieViewerTouchStartX = 0;
let movieFavoriteViewMode = false;

let movieScale = 1;

let movieSortMode = false;
let movieCurrentSortType = "";

let dragMovieId = null;
let draggingMovieId = null;

let draggingMovieElement = null;

let isMovieDragging = false;

let movieTouchMoved = false;

let movieTouchStartX = 0;
let movieTouchStartY = 0;

let movieLongPressTimer = null;
/* =====================
これ使ってる？
let dragStartPoint = {
    x: 0,
    y: 0
};
===================== */
let movieDragStartX = 0;
let movieDragStartY = 0;

let movieLastDistance = 0;

let movieTranslateX = 0;
let movieTranslateY = 0;

let movieLastTapTime = 0;


/* =====================
   動画表示設定
===================== */

const MOVIE_COLUMNS = 3;
const MOVIE_ROWS = 3;


/* =====================
   動画削除モード
===================== */

let movieDeleteMode = false;
let selectedDeleteMovieIds = [];


/* =====================
   動画共有モード
===================== */

let movieShareMode = false;
let selectedShareMovieIds = [];


/* =====================
   お気に入り表示
===================== */

let movieShowAllFavorites = false;


/* =====================
   1日動画表示
===================== */

let showAllDayMovies = false;


/* =========================================================
   動画追加
========================================================= */

function addMovie(){

    const picker =
        document.getElementById("moviePicker");

    if(!picker){
        return;
    }

    picker.click();

}


/* =========================================================
   動画選択・追加
========================================================= */

async function movieSelected(event){

    console.log("🎥 movieSelected 実行");

    const files =
        Array.from(
            event.target.files || []
        );

    console.log(
        "🎥 選択されたファイル:",
        files
    );


    if(!files.length){
        return;
    }


    const data =
        db.load();


    console.log(
        "🎥 DB:",
        data
    );

    console.log(
        "🎥 selectedCalendarDate:",
        selectedCalendarDate
    );


    if(!data.dayMemories){
        data.dayMemories = {};
    }


    if(
        !data.dayMemories[
            selectedCalendarDate
        ]
    ){

        data.dayMemories[
            selectedCalendarDate
        ] = {

            memo: [],
            movies: [],
            videos: [],
            expenses: [],
            rating: 0,
            comment: ""

        };

    }


    const movies =
        data.dayMemories[
            selectedCalendarDate
        ].movies;


    let completed = 0;


    for(const file of files){

        /*
        =====================
           動画ファイルだけ
        =====================
        */

        if(
            !file.type.startsWith("video/")
        ){

            completed++;

            continue;

        }


        try{

            /*
            =====================
               動画ID
            =====================
            */

            const movieId =
                Date.now() +
                Math.random();


            /*
            =====================
               IndexedDBへ保存
            =====================
            */

            await saveMediaFile(
                movieId,
                file,
                "movie"
            );


            /*
            =====================
               動画URL作成
            =====================
            */

            const media =
                await getMediaFile(
                    movieId
                );



                

            const movieURL =
                createMediaURL(
                    media
                );


            /*
            =====================
               DBには管理情報だけ保存
            =====================
            */

            movies.push({

                id:
                    movieId,

                /*
                現在の画面で表示するためのURL
                */

                src:
                    movieURL,

                /*
                IndexedDB上のID
                */

                mediaId:
                    movieId,

                type:
                    file.type,

                date:
                    selectedCalendarDate,

                favorite:
                    false,

                star:
                    0,

                tags:
                    [],

                order:
                    movieId

            });


            completed++;


            console.log(
                "🎥 動画保存完了:",
                movieId
            );


        }catch(error){

            console.error(
                "🎥 動画保存エラー:",
                error
            );

        }

    }


    /*
    =====================
       管理情報だけ保存
    =====================
    */

    try{

        db.save(data);

        console.log(
            "🎥 動画情報保存完了"
        );


    }catch(error){

        console.error(
            "🎥 DB保存エラー:",
            error
        );

        alert(
            "動画情報の保存に失敗しました"
        );

        return;

    }


    /*
    =====================
       画面更新
    =====================
    */

    renderDayMemory();


    /*
    =====================
       同じファイルを
       再選択可能にする
    =====================
    */

    event.target.value = "";

}

/* =========================================================
   ビューア状態リセット
========================================================= */

function resetMovieViewerState(){

    movieScale = 1;

    movieTranslateX = 0;

    movieTranslateY = 0;

    movieLastDistance = 0;

    movieDragStartX = 0;

    movieDragStartY = 0;

    movieViewerTouchStartX = 0;

    movieLastTapTime = 0;

}


/* =========================================================
   ビューア動画取得
========================================================= */

function getViewerMovies(){

    const data =
        db.load();


    let movies;


    /*
    =====================
       お気に入りビュー
    =====================
    */

    if(movieFavoriteViewMode){

        movies =
            Object.values(
                data.dayMemories || {}
            )
            .flatMap(
                day =>
                    day.movies || []
            )
            .filter(
                movie =>
                    movie.favorite
            );


        const sortMode =
            localStorage.getItem(
                "favoriteMovieSort"
            ) || "new";


        /*
        新しい順
        */

        if(sortMode === "new"){

            movies.sort(
                (a,b) =>
                    Number(b.id) -
                    Number(a.id)
            );

        }


        /*
        古い順
        */

        else if(sortMode === "old"){

            movies.sort(
                (a,b) =>
                    Number(a.id) -
                    Number(b.id)
            );

        }


        /*
        星順＋新しい順
        */

        else if(sortMode === "favoriteNew"){

            movies.sort(
                (a,b) => {

                    const starA =
                        Number(a.star || 0);

                    const starB =
                        Number(b.star || 0);


                    if(starA !== starB){

                        return starB - starA;

                    }


                    return Number(b.id) -
                           Number(a.id);

                }
            );

        }


        /*
        星順＋古い順
        */

        else if(sortMode === "favoriteOld"){

            movies.sort(
                (a,b) => {

                    const starA =
                        Number(a.star || 0);

                    const starB =
                        Number(b.star || 0);


                    if(starA !== starB){

                        return starB - starA;

                    }


                    return Number(a.id) -
                           Number(b.id);

                }
            );

        }

    }


    /*
    =====================
       通常の1日動画
    =====================
    */

    else{

        movies = [

            ...(
                data.dayMemories
                ?. [selectedCalendarDate]
                ?. movies || []

            )

        ];


        const sortMode =
            localStorage.getItem(
                "calendarMovieSort"
            ) || "new";


        /*
        自由並べ替え
        */

        if(sortMode === "free"){

            movies.sort(
                (a,b) =>
                    Number(
                        a.order ?? a.id
                    ) -
                    Number(
                        b.order ?? b.id
                    )
            );

        }


        /*
        古い順
        */

        else if(sortMode === "old"){

            movies.sort(
                (a,b) =>
                    Number(a.id) -
                    Number(b.id)
            );

        }


        /*
        お気に入り＋新しい順
        */

        else if(sortMode === "favoriteNew"){

            movies.sort(
                (a,b) => {

                    if(
                        a.favorite !==
                        b.favorite
                    ){

                        return b.favorite -
                               a.favorite;

                    }


                    return Number(b.id) -
                           Number(a.id);

                }
            );

        }


        /*
        お気に入り＋古い順
        */

        else if(sortMode === "favoriteOld"){

            movies.sort(
                (a,b) => {

                    if(
                        a.favorite !==
                        b.favorite
                    ){

                        return b.favorite -
                               a.favorite;

                    }


                    return Number(a.id) -
                           Number(b.id);

                }
            );

        }


        /*
        新しい順
        */

        else{

            movies.sort(
                (a,b) =>
                    Number(b.id) -
                    Number(a.id)
            );

        }

    }


    return movies;

}


/* =========================================================
   動画ビューアを開く
========================================================= */

function openMovieViewer(id){

    /*
    =====================
       通常動画ビューに戻す
    =====================
    */

    movieFavoriteViewMode = false;


    const movies =
        getViewerMovies();


    const movie =
        movies.find(
            p =>
                Number(p.id) ===
                Number(id)
        );


    if(!movie){

        console.warn(
            "動画が見つかりません:",
            id
        );

        return;

    }


    currentMovieId =
        movie.id;


    currentMovieSrc =
        movie.src;


    currentMovieIndex =
        movies.findIndex(
            p =>
                Number(p.id) ===
                Number(id)
        );


    const video =
        document.getElementById(
            "movieViewerVideo"
        );


    if(!video){

        console.warn(
            "movieViewerVideo が見つかりません"
        );

        return;

    }


    /*
    =====================
       動画セット
    =====================
    */

    video.pause();

    video.src =
        movie.src;

    video.load();


    /*
    =====================
       ビューア状態リセット
    =====================
    */

    resetMovieViewerState();


    video.style.transform =
        "translate(0px,0px) scale(1)";


    /*
    =====================
       お気に入りボタン
    =====================
    */

    updateFavoriteButton();


    /*
    =====================
       削除ボタン
    =====================
    */

    updateMovieViewerButtons();


    /*
    =====================
       ビューア表示
    =====================
    */

    const viewer =
        document.getElementById(
            "movieViewer"
        );


    if(!viewer){

        return;

    }


    viewer.style.display =
        "flex";


    viewer.style.zIndex =
        "9999";


    document.body.style.overflow =
        "hidden";


    /*
    =====================
       自動再生
    =====================
    */

    video.play()
        .catch(() => {});

}


/* =========================================================
   お気に入り動画ビューア
========================================================= */

function openFavoriteMovieViewer(id){

    /*
    =====================
       お気に入りビューON
    =====================
    */

    movieFavoriteViewMode = true;


    const movies =
        getViewerMovies();


    const movie =
        movies.find(
            p =>
                Number(p.id) ===
                Number(id)
        );


    if(!movie){

        movieFavoriteViewMode = false;

        return;

    }


    currentMovieId =
        movie.id;


    currentMovieSrc =
        movie.src;


    currentMovieIndex =
        movies.findIndex(
            p =>
                Number(p.id) ===
                Number(id)
        );


    const video =
        document.getElementById(
            "movieViewerVideo"
        );


    if(!video){

        movieFavoriteViewMode = false;

        return;

    }


    /*
    =====================
       動画セット
    =====================
    */

    video.pause();

    video.src =
        movie.src;

    video.load();


    /*
    =====================
       再生位置
    =====================
    */

    video.currentTime =
        0;


    /*
    =====================
       ビューア状態リセット
    =====================
    */

    resetMovieViewerState();


    video.style.transform =
        "translate(0px,0px) scale(1)";


    /*
    =====================
       お気に入りボタン
    =====================
    */

    updateFavoriteButton();


    /*
    =====================
       お気に入りビューでは
       削除ボタンを非表示
    =====================
    */

    updateMovieViewerButtons();


    /*
    =====================
       ビューア表示
    =====================
    */

    const viewer =
        document.getElementById(
            "movieViewer"
        );


    if(!viewer){

        return;

    }


    viewer.style.display =
        "flex";


    viewer.style.zIndex =
        "9999";


    document.body.style.overflow =
        "hidden";


    /*
    =====================
       自動再生
    =====================
    */

    video.play()
        .catch(() => {});

}


/* =========================================================
   ビューアボタン状態
========================================================= */

function updateMovieViewerButtons(){

    const deleteBtn =
        document.querySelector(
            ".movie-delete"
        );


    const closeBtn =
        document.querySelector(
            ".movie-close"
        );


    /*
    =====================
       お気に入りビュー
    =====================
    */

    if(movieFavoriteViewMode){

        if(deleteBtn){

            deleteBtn.style.display =
                "none";

        }


        if(closeBtn){

            closeBtn.style.right =
                "72px";

        }


        return;

    }


    /*
    =====================
       通常ビュー
    =====================
    */

    if(deleteBtn){

        deleteBtn.style.display =
            "flex";

    }


    if(closeBtn){

        closeBtn.style.right =
            "20px";

    }

}


/* =========================================================
   動画ビューア終了
========================================================= */

function closeMovieViewer(){

    const viewer =
        document.getElementById(
            "movieViewer"
        );


    if(viewer){

        viewer.style.display =
            "none";

    }


    document.body.style.overflow =
        "";


    /*
    =====================
       動画停止
    =====================
    */

    const video =
        document.getElementById(
            "movieViewerVideo"
        );


    if(video){

        video.pause();

        video.removeAttribute(
            "src"
        );

        video.load();

        video.style.transform =
            "translate(0px,0px) scale(1)";

    }


    /*
    =====================
       状態リセット
    =====================
    */

    resetMovieViewerState();


    currentMovieSrc =
        "";

    currentMovieId =
        null;

    currentMovieIndex =
        0;


    /*
    =====================
       お気に入りビュー解除
    =====================
    */

    movieFavoriteViewMode =
        false;

}


/* =========================================================
   動画表示
========================================================= */

function showMovie(index){

    const movies =
        getViewerMovies();


    if(!movies.length){

        closeMovieViewer();

        return;

    }


    /*
    =====================
       循環
    =====================
    */

    if(index >= movies.length){

        index = 0;

    }


    if(index < 0){

        index =
            movies.length - 1;

    }


    const movie =
        movies[index];


    if(!movie){

        return;

    }


    currentMovieIndex =
        index;


    currentMovieId =
        movie.id;


    currentMovieSrc =
        movie.src;


    const video =
        document.getElementById(
            "movieViewerVideo"
        );


    if(!video){

        return;

    }


    /*
    =====================
       動画切り替え
    =====================
    */

    video.pause();

    video.src =
        currentMovieSrc;

    video.load();


    /*
    =====================
       ズーム状態リセット
    =====================
    */

    resetMovieViewerState();


    video.style.transform =
        "translate(0px,0px) scale(1)";


    /*
    =====================
       お気に入り状態更新
    =====================
    */

    updateFavoriteButton();


    /*
    =====================
       ボタン状態更新
    =====================
    */

    updateMovieViewerButtons();


    /*
    =====================
       再生
    =====================
    */

    video.play()
        .catch(() => {});

}


/* =========================================================
   スワイプ開始
========================================================= */

function movieSwipeStart(event){

    if(!event.touches){

        return;

    }


    if(
        event.touches.length !== 1
    ){

        return;

    }


    movieViewerTouchStartX =
        event.touches[0].clientX;

}


/* =========================================================
   動画スワイプ
========================================================= */

function movieSwipe(event){

    /*
    =====================
       拡大中はスワイプ無効
    =====================
    */

    if(movieScale > 1){

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
        movieViewerTouchStartX;


    /*
    =====================
       小さい移動は無視
    =====================
    */

    if(
        Math.abs(diff) < 60
    ){

        return;

    }


    /*
    =====================
       左 → 次
    =====================
    */

    if(diff < 0){

        showMovie(
            currentMovieIndex + 1
        );

    }


    /*
    =====================
       右 → 前
    =====================
    */

    else{

        showMovie(
            currentMovieIndex - 1
        );

    }

}


/* =========================================================
   動画ドラッグ開始
========================================================= */

function movieDragStart(event){

    /*
    =====================
       拡大中のみ移動可能
    =====================
    */

    if(movieScale <= 1){

        return;

    }


    if(
        !event.touches ||
        event.touches.length !== 1
    ){

        return;

    }


    event.preventDefault();


    movieDragStartX =
        event.touches[0].clientX;


    movieDragStartY =
        event.touches[0].clientY;

}


/* =========================================================
   ピンチズーム・動画移動
========================================================= */

function moviePinch(event){

    const video =
        document.getElementById(
            "movieViewerVideo"
        );


    if(!video){

        return;

    }


    /*
    =====================
       2本指ピンチ
    =====================
    */

    if(
        event.touches &&
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


        if(movieLastDistance !== 0){

            movieScale *=
                distance /
                movieLastDistance;


            /*
            最小倍率
            */

            if(movieScale < 1){

                movieScale =
                    1;

                movieTranslateX =
                    0;

                movieTranslateY =
                    0;

            }


            /*
            最大倍率
            */

            if(movieScale > 4){

                movieScale =
                    4;

            }


            video.style.transform =
                `translate(
                    ${movieTranslateX}px,
                    ${movieTranslateY}px
                ) scale(${movieScale})`;

        }


        movieLastDistance =
            distance;


        return;

    }


    /*
    =====================
       1本指ドラッグ
    =====================
    */

    if(
        movieScale > 1 &&
        event.touches &&
        event.touches.length === 1
    ){

        event.preventDefault();


        const x =
            event.touches[0].clientX;


        const y =
            event.touches[0].clientY;


        movieTranslateX +=
            x -
            movieDragStartX;


        movieTranslateY +=
            y -
            movieDragStartY;


        movieDragStartX =
            x;


        movieDragStartY =
            y;


        video.style.transform =
            `translate(
                ${movieTranslateX}px,
                ${movieTranslateY}px
            ) scale(${movieScale})`;

    }

}


/* =========================================================
   タッチ終了
========================================================= */

function movieDragEnd(event){

    if(
        event.changedTouches &&
        event.changedTouches.length >= 2
    ){

        movieLastDistance =
            0;

    }

}


/* =========================================================
   ダブルタップ
========================================================= */

function movieDoubleTap(event){

    if(
        !event.changedTouches ||
        event.changedTouches.length !== 1
    ){

        return;

    }


    const now =
        Date.now();


    if(
        now -
        movieLastTapTime <
        300
    ){

        /*
        =====================
           1倍 → 2倍
        =====================
        */

        if(movieScale === 1){

            movieScale =
                2;

        }


        /*
        =====================
           拡大 → 1倍
        =====================
        */

        else{

            movieScale =
                1;

            movieTranslateX =
                0;

            movieTranslateY =
                0;

        }


        const video =
            document.getElementById(
                "movieViewerVideo"
            );


        if(video){

            video.style.transform =
                `translate(
                    ${movieTranslateX}px,
                    ${movieTranslateY}px
                ) scale(${movieScale})`;

        }

    }


    movieLastTapTime =
        now;

}


/* =========================================================
   動画お気に入り切り替え
========================================================= */

function toggleFavoriteMovie(){

    if(!currentMovieId){

        return;

    }


    const data =
        db.load();


    let targetMovie =
        null;


    /*
    =====================
       全日付から動画検索
    =====================
    */

    Object.values(
        data.dayMemories || {}
    )
    .some(day => {

        const movie =
            (day.movies || [])
            .find(
                p =>
                    Number(p.id) ===
                    Number(currentMovieId)
            );


        if(movie){

            targetMovie =
                movie;

            return true;

        }


        return false;

    });


    if(!targetMovie){

        return;

    }


    /*
    =====================
       お気に入り切り替え
    =====================
    */

    targetMovie.favorite =
        !targetMovie.favorite;


    db.save(data);


    /*
    =====================
       ボタン更新
    =====================
    */

    updateFavoriteButton();


    /*
    =====================
       お気に入り一覧更新
    =====================
    */

    displayFavorites();


    /*
    =====================
       お気に入りビューで
       ☆を外した場合
    =====================
    */

    if(
        movieFavoriteViewMode &&
        !targetMovie.favorite
    ){

        const movies =
            getViewerMovies();


        if(movies.length === 0){

            closeMovieViewer();

            return;

        }


        /*
        現在位置を補正
        */

        if(
            currentMovieIndex >=
            movies.length
        ){

            currentMovieIndex =
                movies.length - 1;

        }


        showMovie(
            currentMovieIndex
        );

    }

}


/* =========================================================
   お気に入りボタン表示
========================================================= */

function updateFavoriteButton(){

    const btn =
        document.querySelector(
            ".movie-favorite"
        );


    if(!btn){

        return;

    }


    if(!currentMovieId){

        btn.textContent =
            "☆";

        return;

    }


    const data =
        db.load();


    let targetMovie =
        null;


    Object.values(
        data.dayMemories || {}
    )
    .some(day => {

        const movie =
            (day.movies || [])
            .find(
                p =>
                    Number(p.id) ===
                    Number(currentMovieId)
            );


        if(movie){

            targetMovie =
                movie;

            return true;

        }


        return false;

    });


    if(
        targetMovie &&
        targetMovie.favorite
    ){

        btn.textContent =
            "⭐";

    }else{

        btn.textContent =
            "☆";

    }

}


/* =========================================================
   現在の動画を共有
========================================================= */

async function shareCurrentMovie(){

    if(!currentMovieSrc){

        return;

    }


    try{

        const response =
            await fetch(
                currentMovieSrc
            );


        const blob =
            await response.blob();


        const movie =
            new File(
                [blob],
                "oshi-movie.mp4",
                {
                    type:
                        blob.type ||
                        "video/mp4"
                }
            );


        if(
            !navigator.share ||
            !navigator.canShare ||
            !navigator.canShare({
                files: [movie]
            })
        ){

            alert(
                "この端末では動画共有に対応していません"
            );

            return;

        }


        await navigator.share({

            files: [movie],

            title:
                "推し活手帳",

            text:
                "推し活動画"

        });

    }catch(error){

        if(
            error &&
            error.name === "AbortError"
        ){

            return;

        }


        console.error(
            "動画共有エラー:",
            error
        );


        alert(
            "動画を共有できませんでした"
        );

    }

}


/* =========================================================
   動画複数共有モード開始
========================================================= */

function startMovieShareMode(){

    movieShareMode =
        true;


    movieDeleteMode =
        false;


    selectedDeleteMovieIds =
        [];


    movieSortMode =
        false;


    selectedShareMovieIds =
        [];


    renderDayMovies();

}


/* =========================================================
   動画複数共有
========================================================= */

async function shareSelectedMovies(){

    if(
        selectedShareMovieIds.length === 0
    ){

        alert(
            "共有する動画を選択してください"
        );

        return;

    }


    const data =
        db.load();


    const movies =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?. movies || [];


    const selectedMovies =
        movies.filter(
            movie =>
                selectedShareMovieIds.includes(
                    Number(movie.id)
                )
        );


    if(
        selectedMovies.length === 0
    ){

        return;

    }


    try{

        const files =
            [];


        for(
            let i = 0;
            i < selectedMovies.length;
            i++
        ){

            const movie =
                selectedMovies[i];


            const response =
                await fetch(
                    movie.src
                );


            const blob =
                await response.blob();


            const extension =
                movie.type === "video/webm"
                ? "webm"
                :
                movie.type === "video/ogg"
                ? "ogv"
                :
                "mp4";


            const file =
                new File(
                    [blob],
                    `oshi-movie-${i + 1}.${extension}`,
                    {
                        type:
                            blob.type ||
                            movie.type ||
                            "video/mp4"
                    }
                );


            files.push(file);

        }


        if(
            !navigator.share ||
            !navigator.canShare ||
            !navigator.canShare({
                files
            })
        ){

            alert(
                "この端末では複数動画の共有に対応していません"
            );

            return;

        }


        await navigator.share({

            files,

            title:
                "推し活手帳",

            text:
                `${files.length}本の動画`

        });


        /*
        =====================
           共有完了
        =====================
        */

        movieShareMode =
            false;


        selectedShareMovieIds =
            [];


        renderDayMovies();

    }catch(error){

        if(
            error &&
            error.name === "AbortError"
        ){

            return;

        }


        console.error(
            "動画複数共有エラー:",
            error
        );


        alert(
            "動画を共有できませんでした"
        );

    }

}


/* =========================================================
   共有選択
========================================================= */

function toggleMovieShareSelection(id){

    id =
        Number(id);


    const index =
        selectedShareMovieIds.indexOf(id);


    if(index >= 0){

        selectedShareMovieIds.splice(
            index,
            1
        );

    }else{

        selectedShareMovieIds.push(id);

    }


    renderDayMovies();

}


/* =========================================================
   共有モード終了
========================================================= */

function cancelMovieShareMode(){

    movieShareMode =
        false;


    selectedShareMovieIds =
        [];


    renderDayMovies();

}


/* =========================================================
   共有モードバー
========================================================= */

function getMovieShareModeBar(){

    return `

<div class="movie-delete-bar">

    <div class="movie-delete-title">
        📤 動画を選択中
    </div>

    <div class="movie-delete-count">
        ${selectedShareMovieIds.length}本選択
    </div>

    <button
        onclick="cancelMovieShareMode()">

        キャンセル

    </button>

    <button
        onclick="shareSelectedMovies()"
        ${
            selectedShareMovieIds.length === 0
            ? "disabled"
            : ""
        }>

        📤 共有

    </button>

</div>

`;

}


/* =========================================================
   お気に入り動画表示
========================================================= */

function displayFavorites(){

    const data =
        db.load();


    const movies = [];


    Object.values(
        data.dayMemories || {}
    )
    .forEach(day => {

        (day.movies || [])
        .forEach(movie => {

            if(movie.favorite){

                movies.push(movie);

            }

        });

    });


    /*
    =====================
       並べ替え
    =====================
    */

    const favoriteSort =
        localStorage.getItem(
            "favoriteMovieSort"
        ) || "new";


    if(favoriteSort === "new"){

        movies.sort(
            (a,b) =>
                Number(b.id) -
                Number(a.id)
        );

    }


    if(favoriteSort === "old"){

        movies.sort(
            (a,b) =>
                Number(a.id) -
                Number(b.id)
        );

    }


    if(
        favoriteSort === "favoriteNew" ||
        favoriteSort === "favoriteOld"
    ){

        movies.sort(
            (a,b) => {

                const starA =
                    Number(a.star || 0);

                const starB =
                    Number(b.star || 0);


                if(starA !== starB){

                    return starB - starA;

                }


                return favoriteSort === "favoriteNew"
                    ? Number(b.id) - Number(a.id)
                    : Number(a.id) - Number(b.id);

            }
        );

    }


    const movieBox =
        document.getElementById(
            "favorite-movie-list"
        );


    if(movieBox){

        if(movies.length === 0){

            movieBox.innerHTML =
                getMovieToolbar("favorite") +
                "お気に入り動画はありません";

        }else{

            const showMovies =
                movieShowAllFavorites
                ? movies
                : movies.slice(0,4);


            movieBox.innerHTML =

                getMovieToolbar("favorite")

                +

                showMovies
                .map(movie => `

<div class="memory-movie-box">

<img
    src="${movie.src}"
    class="memory-movie"
    onclick="openFavoriteMovieViewer(${movie.id})">

</div>

`)
                .join("")

                +

                (
                    movies.length > 4
                    ?
                    `

<div
    class="favorite-more"
    onclick="
        movieShowAllFavorites =
            !movieShowAllFavorites;

        displayFavorites();
    "
>

    ${
        movieShowAllFavorites
        ? "閉じる"
        : "もっと見る"
    }

</div>

`
                    :
                    ""
                );

        }

    }


    const count =
        document.getElementById(
            "favorite-movie-count"
        );


    if(count){

        count.textContent =
            movies.length;

    }

}


/* =========================================================
   1日動画表示
========================================================= */

async function renderDayMovies(){

    const data =
        db.load();


    const day =
        data.dayMemories
        ?. [selectedCalendarDate];


    const movieArea =
        document.getElementById(
            "movieList"
        );


    if(!movieArea){

        return;

    }


    if(
        !day ||
        !day.movies ||
        !day.movies.length
    ){

        movieArea.innerHTML =
            "動画はありません";

        return;

    }


    let movies =
        [
            ...day.movies
        ];


    /*
    =====================
       並び順
    =====================
    */

    const sortMode =
        localStorage.getItem(
            "calendarMovieSort"
        ) || "new";


    if(sortMode === "free"){

        movies.sort(
            (a,b) =>
                Number(
                    a.order ?? a.id
                ) -
                Number(
                    b.order ?? b.id
                )
        );

    }


    else if(sortMode === "old"){

        movies.sort(
            (a,b) =>
                Number(a.id) -
                Number(b.id)
        );

    }


    else if(
        sortMode === "favoriteNew"
    ){

        movies.sort(
            (a,b) => {

                if(
                    a.favorite !==
                    b.favorite
                ){

                    return b.favorite -
                           a.favorite;

                }


                return Number(b.id) -
                       Number(a.id);

            }
        );

    }


    else if(
        sortMode === "favoriteOld"
    ){

        movies.sort(
            (a,b) => {

                if(
                    a.favorite !==
                    b.favorite
                ){

                    return b.favorite -
                           a.favorite;

                }


                return Number(a.id) -
                       Number(b.id);

            }
        );

    }


    else{

        movies.sort(
            (a,b) =>
                Number(b.id) -
                Number(a.id)
        );

    }


    /*
    =====================
       表示枚数
    =====================
    */

    const movieDisplayCount =
        MOVIE_COLUMNS *
        MOVIE_ROWS;


    const showMovies =
        showAllDayMovies
        ? movies
        : movies.slice(
            0,
            movieDisplayCount
        );


    /*
    =====================
       列数
    =====================
    */

    movieArea.style.setProperty(
        "--movie-columns",
        MOVIE_COLUMNS
    );


    /*
    =====================
       IndexedDBから
       動画URLを作成
    =====================
    */

    const movieURLs = {};


    for(const movie of showMovies){

        const mediaId =
            movie.mediaId ?? movie.id;


        try{

            const media =
                await getMediaFile(
                    mediaId
                );


                console.log(
    "🎥 IndexedDB取得結果:",
    media
);


            if(media){

                movieURLs[movie.id] =
                    createMediaURL(
                        media
                    );

            }

        }catch(error){

            console.error(
                "🎥 IndexedDB動画取得エラー:",
                error
            );

        }

    }


    /*
    =====================
       動画が取得できない場合
    =====================
    */

    if(
        showMovies.some(
            movie =>
                !movieURLs[movie.id]
        )
    ){

        console.warn(
            "🎥 一部の動画ファイルを取得できませんでした"
        );

    }


    /*
    =====================
       動画一覧
    =====================
    */

    movieArea.innerHTML =

        /*
        削除モード
        */

        (
            movieDeleteMode
            ?
            getMovieDeleteModeBar()
            :
            ""
        )

        +

        /*
        共有モード
        */

        (
            movieShareMode
            ?
            getMovieShareModeBar()
            :
            ""
        )

        +

        /*
        自由並べ替え
        */

        (
            movieSortMode
            ?
            getMovieFreeModeBar()
            :
            ""
        )

        +

        /*
        =====================
           動画
        =====================
        */

        showMovies
        .map(movie => {

            const id =
                Number(movie.id);


            const deleteSelected =
                movieDeleteMode &&
                selectedDeleteMovieIds.includes(
                    id
                );


            const shareSelected =
                movieShareMode &&
                selectedShareMovieIds.includes(
                    id
                );


            const movieSrc =
                movieURLs[movie.id];


            return `

<div
    class="
        memory-movie-box
        ${
            deleteSelected ||
            shareSelected
            ?
            "movie-delete-selected"
            :
            ""
        }
    "

    data-movie-id="${movie.id}"

    ${
        movieDeleteMode
        ?
        `onclick="toggleDeleteMovie(${movie.id})"`

        :

        movieShareMode
        ?
        `onclick="toggleMovieShareSelection(${movie.id})"`

        :

        ""
    }

>

${
    movieSrc
    ?

    `<video
        src="${movieSrc}"

        class="memory-movie"

        muted

        playsinline

        preload="metadata"

        draggable="false"

        ${
            movieSortMode ||
            movieDeleteMode ||
            movieShareMode
            ?
            ""
            :
            `onclick="openMovieViewer(${movie.id})"`
        }

    ></video>`

    :

    `<div
        class="movie-loading"
    >
        🎥 読み込み中...
    </div>`

}


${
    movieDeleteMode
    ?
    `

<div class="movie-delete-check">

    ${
        deleteSelected
        ?
        "✓"
        :
        ""
    }

</div>

`
    :
    ""
}


${
    movieShareMode
    ?
    `

<div class="movie-delete-check">

    ${
        shareSelected
        ?
        "✓"
        :
        ""
    }

</div>

`
    :
    ""
}

</div>

`;

        })
        .join("")

        +

        /*
        =====================
           もっと見る
        =====================
        */

        (
            movies.length >
            movieDisplayCount

            ?

            `

<div
    class="favorite-more"

    onclick="
        showAllDayMovies =
            !showAllDayMovies;

        renderDayMovies();
    "
>

    ${
        showAllDayMovies
        ?
        "閉じる"
        :
        "もっと見る"
    }

</div>

`

            :

            ""

        );

}

/* =========================================================
   動画ツールバー
========================================================= */

function getMovieToolbar(type){

    return `

<div class="movie-toolbar">

    <button
        class="movie-sort-btn"
        onclick="openMovieSortMenu('${type}')">

        並べ替え ▼

    </button>

</div>

`;

}


/* =========================================================
   動画並べ替えメニュー
========================================================= */

function openMovieSortMenu(type){

    /*
    =====================
       他モード解除
    =====================
    */

    movieDeleteMode =
        false;

    selectedDeleteMovieIds =
        [];


    movieShareMode =
        false;

    selectedShareMovieIds =
        [];


    movieSortMode =
        false;


    /*
    =====================
       画面更新
    =====================
    */

    renderDayMovies();


    const menu =
        document.getElementById(
            "movieSortMenu"
        );


    if(!menu){

        return;

    }


    menu.dataset.type =
        type;


    menu.style.display =
        "block";

}


/* =========================================================
   並べ替えメニュー終了
========================================================= */

function closeMovieSortMenu(){

    const menu =
        document.getElementById(
            "movieSortMenu"
        );


    if(menu){

        menu.style.display =
            "none";

    }

}


/* =========================================================
   動画並べ替え
========================================================= */

function setMovieSort(mode){

    const menu =
        document.getElementById(
            "movieSortMenu"
        );


    if(!menu){

        return;

    }


    const type =
        menu.dataset.type;


    /*
    =====================
       カレンダー
    =====================
    */

    if(type === "calendar"){

        localStorage.setItem(
            "calendarMovieSort",
            mode
        );

    }


    /*
    =====================
       お気に入り
    =====================
    */

    if(type === "favorite"){

        localStorage.setItem(
            "favoriteMovieSort",
            mode
        );

    }


    /*
    =====================
       自由並べ替え
    =====================
    */

    if(mode === "free"){

        movieSortMode =
            true;


        movieDeleteMode =
            false;

        selectedDeleteMovieIds =
            [];


        movieShareMode =
            false;

        selectedShareMovieIds =
            [];


        movieCurrentSortType =
            type;


        closeMovieSortMenu();


        if(type === "calendar"){

            renderDayMovies();

        }


        if(type === "favorite"){

            displayFavorites();

        }


        return;

    }


    /*
    =====================
       通常並べ替え
    =====================
    */

    movieSortMode =
        false;


    if(type === "calendar"){

        const data =
            db.load();


        const movies =
            data.dayMemories
            ?. [selectedCalendarDate]
            ?. movies;


        if(movies){

            if(mode === "new"){

                movies.sort(
                    (a,b) =>
                        Number(b.id) -
                        Number(a.id)
                );

            }


            if(mode === "old"){

                movies.sort(
                    (a,b) =>
                        Number(a.id) -
                        Number(b.id)
                );

            }


            if(mode === "favoriteNew"){

                movies.sort(
                    (a,b) => {

                        if(
                            a.favorite !==
                            b.favorite
                        ){

                            return b.favorite -
                                   a.favorite;

                        }


                        return Number(b.id) -
                               Number(a.id);

                    }
                );

            }


            if(mode === "favoriteOld"){

                movies.sort(
                    (a,b) => {

                        if(
                            a.favorite !==
                            b.favorite
                        ){

                            return b.favorite -
                                   a.favorite;

                        }


                        return Number(a.id) -
                               Number(b.id);

                    }
                );

            }


            db.save(data);

        }


        renderDayMovies();

    }


    if(type === "favorite"){

        displayFavorites();

    }


    closeMovieSortMenu();

}


/* =========================================================
   動画自由並べ替え
========================================================= */


/* 指を置いた時 */

document.addEventListener(
    "touchstart",
    function(e){

        if(!movieSortMode){

            return;

        }


        const box =
            e.target.closest(
                ".memory-movie-box"
            );


        if(!box){

            return;

        }


        if(
            !e.touches ||
            e.touches.length !== 1
        ){

            return;

        }


        draggingMovieId =
            Number(
                box.dataset.movieId
            );


        draggingMovieElement =
            box;


        movieTouchMoved =
            false;


        movieTouchStartX =
            e.touches[0].clientX;


        movieTouchStartY =
            e.touches[0].clientY;


        clearTimeout(
            movieLongPressTimer
        );


        movieLongPressTimer =
            setTimeout(
                () => {

                    if(movieTouchMoved){

                        return;

                    }


                    isMovieDragging =
                        true;


                    box.classList.add(
                        "movie-dragging"
                    );


                    if(
                        navigator.vibrate
                    ){

                        navigator.vibrate(
                            30
                        );

                    }

                },
                300
            );

    },
    {
        passive: true
    }
);


/* =========================================================
   動画自由並べ替え移動
========================================================= */

document.addEventListener(
    "touchmove",
    function(e){

        if(!movieSortMode){

            return;

        }


        if(
            !e.touches ||
            e.touches.length !== 1
        ){

            return;

        }


        /*
        =====================
           ドラッグ開始前
           → 通常スクロール
        =====================
        */

        if(!isMovieDragging){

            const dx =
                Math.abs(
                    e.touches[0].clientX -
                    movieTouchStartX
                );


            const dy =
                Math.abs(
                    e.touches[0].clientY -
                    movieTouchStartY
                );


            if(
                dx > 10 ||
                dy > 10
            ){

                movieTouchMoved =
                    true;


                clearTimeout(
                    movieLongPressTimer
                );

            }


            return;

        }


        /*
        =====================
           ドラッグ中
        =====================
        */

        e.preventDefault();


        const touch =
            e.touches[0];


        const boxes =
            [
                ...document.querySelectorAll(
                    ".memory-movie-box"
                )
            ];


        let targetBox =
            null;


        boxes.forEach(box => {

            if(
                box ===
                draggingMovieElement
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

        });


        if(!targetBox){

            return;

        }


        /*
        =====================
           DOM上で位置交換
        =====================
        */

        const parent =
            draggingMovieElement.parentNode;


        const nextAfterTarget =
            targetBox.nextSibling;


        const nextAfterDragging =
            draggingMovieElement.nextSibling;


        if(
            nextAfterDragging ===
            targetBox
        ){

            parent.insertBefore(
                targetBox,
                draggingMovieElement
            );

        }


        else if(
            nextAfterTarget ===
            draggingMovieElement
        ){

            parent.insertBefore(
                draggingMovieElement,
                targetBox
            );

        }


        else{

            parent.insertBefore(
                draggingMovieElement,
                targetBox
            );


            parent.insertBefore(
                targetBox,
                nextAfterDragging
            );

        }

    },
    {
        passive: false
    }
);


/* =========================================================
   自由並べ替え終了
========================================================= */

document.addEventListener(
    "touchend",
    function(){

        clearTimeout(
            movieLongPressTimer
        );


        if(draggingMovieElement){

            draggingMovieElement.classList.remove(
                "movie-dragging"
            );

        }


        isMovieDragging =
            false;


        draggingMovieId =
            null;


        draggingMovieElement =
            null;

    },
    {
        passive: true
    }
);


/* =========================================================
   自由並べ替えバー
========================================================= */

function getMovieFreeModeBar(){

    return `

<div class="movie-free-bar">

    <div>

        📷 自由変更中<br>

        <small>
            動画を長押ししてドラッグしてください
        </small>

    </div>


    <button
        onclick="finishMovieSort()">

        完了

    </button>

</div>

`;

}


/* =========================================================
   自由並べ替え保存
========================================================= */

function finishMovieSort(){

    const data =
        db.load();


    const movies =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?. movies;


    if(movies){

        const boxes =
            document.querySelectorAll(
                ".memory-movie-box"
            );


        boxes.forEach(
            (box,index) => {

                const id =
                    Number(
                        box.dataset.movieId
                    );


                const movie =
                    movies.find(
                        p =>
                            Number(p.id) ===
                            id
                    );


                if(movie){

                    movie.order =
                        index + 1;

                }

            }
        );


        db.save(data);

    }


    movieSortMode =
        false;


    draggingMovieElement =
        null;


    draggingMovieId =
        null;


    isMovieDragging =
        false;


    renderDayMovies();


    alert(
        "✅ 並び順を保存しました"
    );

}


/* =========================================================
   動画削除モード開始
========================================================= */

function startMovieDeleteMode(){

    movieDeleteMode =
        true;


    movieShareMode =
        false;


    selectedShareMovieIds =
        [];


    movieSortMode =
        false;


    selectedDeleteMovieIds =
        [];


    renderDayMovies();

}


/* =========================================================
   動画削除選択
========================================================= */

function toggleDeleteMovie(id){

    id =
        Number(id);


    const index =
        selectedDeleteMovieIds.indexOf(
            id
        );


    if(index >= 0){

        selectedDeleteMovieIds.splice(
            index,
            1
        );

    }else{

        selectedDeleteMovieIds.push(
            id
        );

    }


    renderDayMovies();

}


/* =========================================================
   削除モードバー
========================================================= */

function getMovieDeleteModeBar(){

    return `

<div class="movie-delete-bar">

    <span class="movie-delete-title">

        🗑 動画を選択中

    </span>


    <span class="movie-delete-count">

        ${selectedDeleteMovieIds.length}本選択

    </span>


    <button
        onclick="cancelMovieDeleteMode()">

        キャンセル

    </button>


    <button
        onclick="deleteSelectedMovies()"
        ${
            selectedDeleteMovieIds.length === 0
            ? "disabled"
            : ""
        }>

        🗑 削除

    </button>

</div>

`;

}


/* =========================================================
   削除モードキャンセル
========================================================= */

function cancelMovieDeleteMode(){

    movieDeleteMode =
        false;


    selectedDeleteMovieIds =
        [];


    renderDayMovies();

}


/* =========================================================
   現在の動画を1件削除
========================================================= */

function deleteCurrentMovie(){

    if(!currentMovieId){

        return;

    }


    /*
    =====================
       お気に入りビューでは
       削除させない
    =====================
    */

    if(movieFavoriteViewMode){

        return;

    }


    if(
        !confirm(
            "この動画を削除しますか？"
        )
    ){

        return;

    }


    const data =
        db.load();


    let deleted =
        false;


    /*
    =====================
       現在の動画IDを
       全日付から探して削除
    =====================
    */

    Object.values(
        data.dayMemories || {}
    )
    .forEach(day => {

        if(!day.movies){

            return;

        }


        const before =
            day.movies.length;


        day.movies =
            day.movies.filter(
                movie =>
                    Number(movie.id) !==
                    Number(currentMovieId)
            );


        if(
            day.movies.length !==
            before
        ){

            deleted =
                true;

        }

    });


    if(!deleted){

        return;

    }


    db.save(data);


    /*
    =====================
       ビューア終了
    =====================
    */

    closeMovieViewer();


    renderDayMemory();

}


/* =========================================================
   動画複数削除
========================================================= */

function deleteSelectedMovies(){

    if(
        selectedDeleteMovieIds.length === 0
    ){

        return;

    }


    const count =
        selectedDeleteMovieIds.length;


    if(
        !confirm(
            `${count}本の動画を削除しますか？`
        )
    ){

        return;

    }


    const data =
        db.load();


    let deleted =
        false;


    /*
    =====================
       選択IDを全日付から削除
    =====================
    */

    Object.values(
        data.dayMemories || {}
    )
    .forEach(day => {

        if(!day.movies){

            return;

        }


        const before =
            day.movies.length;


        day.movies =
            day.movies.filter(
                movie =>
                    !selectedDeleteMovieIds.includes(
                        Number(movie.id)
                    )
            );


        if(
            day.movies.length !==
            before
        ){

            deleted =
                true;

        }

    });


    if(!deleted){

        return;

    }


    db.save(data);


    movieDeleteMode =
        false;


    selectedDeleteMovieIds =
        [];


    renderDayMemory();

}