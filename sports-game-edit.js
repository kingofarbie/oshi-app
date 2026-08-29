/* =====================================================
   ⚾ スポーツ試合結果 編集画面
   sports-game-edit.js

   ・新規試合登録
   ・既存試合編集
   ・応援チーム表示
   ・対戦相手
   ・イニングスコア
   ・勝敗
   ・メモ
   ・保存
   ・キャンセル
===================================================== */


/* =====================================================
   ⚾ 編集画面HTML読み込み
===================================================== */

async function loadSportsGameEditHTML(){

    const container =
        document.getElementById(
            "sportsGameEditContainer"
        );

    if(!container){

        console.error(
            "sportsGameEditContainer が見つかりません"
        );

        return false;

    }


    try{

        const response =
            await fetch(
                "./sports-game-edit.html"
            );


        if(!response.ok){

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const html =
            await response.text();


        container.innerHTML =
            html;


        console.log(
            "sports-game-edit.html 読み込み成功"
        );


        return true;

    }catch(error){

        console.error(
            "sports-game-edit.html の読み込みに失敗:",
            error
        );

        return false;

    }

}


/* =====================================================
   ⚾ 現在の試合データ取得
===================================================== */

function getCurrentSportsGameForEdit(){

    const data =
        db.load();


    const settings =
        data.sportsCalendar || {};


    const selectedIndex =
        typeof settings.selectedIndex === "number"
        ?
        settings.selectedIndex
        :
        0;


    const games =
        settings.games;


    if(
        games &&
        typeof games === "object" &&
        !Array.isArray(games) &&
        games[selectedIndex] &&
        typeof games[selectedIndex] === "object"
    ){

        return games[selectedIndex];

    }


    return {};

}


/* =====================================================
   ⚾ 現在の応援チーム取得
===================================================== */

function getCurrentSportsTeamForEdit(){

    const data =
        db.load();


    const settings =
        data.sportsCalendar || {};


    const selectedIndex =
        typeof settings.selectedIndex === "number"
        ?
        settings.selectedIndex
        :
        0;


    const favoriteSports =
        Array.isArray(
            settings.favoriteSports
        )
        ?
        settings.favoriteSports
        :
        [];


    const current =
        favoriteSports[selectedIndex];


    return {

        sport:
            current?.sport ||
            settings.sport ||
            "baseball",

        team:
            current?.team ||
            settings.team ||
            ""

    };

}



/* =====================================================
   ⚾ 編集画面を閉じる
===================================================== */

function cancelSportsGameEdit(){

    closeSportsGameEditPage();

}





/* =====================================================
   ⚾ 編集画面 → カレンダー
===================================================== */

function backToSportsCalendarFromEdit(){

    closeSportsGameEditPage();

}


/* =====================================================
   ⚾ 結果画面 → カレンダー
===================================================== */

function backToSportsCalendarFromDetail(){

    closeSportsGameDetailPage();

}


/* =====================================================
   ⚾ 初期化
===================================================== */

console.log(
    "sports-game-edit.js loaded"
);