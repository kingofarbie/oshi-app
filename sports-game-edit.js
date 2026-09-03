/* =====================================================
   ⚾ スポーツ試合結果 編集画面
   sports-baseball-edit.js

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
   ⚾ 現在の試合データ取得
===================================================== */

function getCurrentBaseballGameForEdit(){

    const data =
        db.load();


    const settings =
        data.sportsCalendar ||
        {};


    const games =
        settings.games;


    if(
        !games ||
        typeof games !== "object" ||
        Array.isArray(games)
    ){

        return {};

    }


    const baseballGames =
        games.baseball;


    if(
        !baseballGames ||
        typeof baseballGames !== "object" ||
        Array.isArray(baseballGames)
    ){

        return {};

    }


    return baseballGames;

}



/* =====================================================
   ⚾ 現在の応援チーム取得
===================================================== */

function getCurrentBaseballTeamForEdit(){

    const data =
        db.load();


    const settings =
        data.sportsCalendar ||
        {};


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
        favoriteSports[selectedIndex] ||
        {};


    return {

        sport:
            current.sport ||
            "baseball",

        team:
            current.team ||
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
    "sports-baseball-edit.js loaded"
);