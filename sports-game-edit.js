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
   ⚾ 編集フォーム描画
===================================================== */

function renderSportsGameEditForm(){

    const form =
        document.getElementById(
            "sportsGameEditForm"
        );


    if(!form){

        console.error(
            "sportsGameEditForm が見つかりません"
        );

        return;

    }


    if(!sportsSelectedDate){

        console.error(
            "sportsSelectedDate が設定されていません"
        );

        return;

    }


    const games =
        getCurrentSportsGameForEdit();


    const game =
        games[sportsSelectedDate] ||
        {};


    const currentTeam =
        getCurrentSportsTeamForEdit();


    const title =
        document.getElementById(
            "sportsGameEditTitle"
        );


    if(title){

        const dateObject =
            new Date(
                `${sportsSelectedDate}T00:00:00`
            );


        const weekdays = [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ];


        title.textContent =
            `⚾ ${dateObject.getFullYear()}年` +
            `${dateObject.getMonth() + 1}月` +
            `${dateObject.getDate()}日` +
            `（${weekdays[dateObject.getDay()]}） 試合結果編集`;

    }


    const teamInput =
        document.getElementById(
            "sportsEditTeam"
        );


    const opponentInput =
        document.getElementById(
            "sportsEditOpponent"
        );


    const resultSelect =
        document.getElementById(
            "sportsEditResult"
        );


    const memoInput =
        document.getElementById(
            "sportsEditMemo"
        );

    const locationInput =
    document.getElementById(
        "sportsEditLocation"
    );

const startingPitcherInput =
    document.getElementById(
        "sportsEditStartingPitcher"
    );



    /*
       応援チーム
    */

    if(teamInput){

        teamInput.value =
            currentTeam.team ||
            game.team ||
            "";

    }


    /*
       対戦相手
    */

    if(opponentInput){

        opponentInput.value =
            game.opponent ||
            "";

    }


    /*
       勝敗
    */

    if(resultSelect){

        resultSelect.value =
            game.result ||
            "";

    }


    /*
       メモ
    */

    if(memoInput){

        memoInput.value =
            game.memo ||
            "";

    }

    if(locationInput){

    locationInput.value =
        game.location ||
        "";

}

if(startingPitcherInput){

    startingPitcherInput.value =
        game.startingPitcher ||
        "";

}


    /*
       イニング
    */

    const teamScores =
        Array.isArray(game.teamScores)
        ?
        game.teamScores
        :
        [];


    const opponentScores =
        Array.isArray(game.opponentScores)
        ?
        game.opponentScores
        :
        [];


    for(
        let i = 0;
        i < 12;
        i++
    ){

        const teamScore =
            document.getElementById(
                `sportsEditTeamScore${i + 1}`
            );


        const opponentScore =
            document.getElementById(
                `sportsEditOpponentScore${i + 1}`
            );


        if(teamScore){

            teamScore.value =
                teamScores[i] ??
                "";

        }


        if(opponentScore){

            opponentScore.value =
                opponentScores[i] ??
                "";

        }

    }


    /*
       編集画面を表示
    */

    const editPage =
        document.getElementById(
            "sportsGameEditPage"
        );


    if(editPage){

        editPage.classList.add(
            "active"
        );

        editPage.style.display =
            "block";

    }

}


/* =====================================================
   ⚾ スコア取得
===================================================== */

function collectSportsGameScores(){

    const teamScores = [];

    const opponentScores = [];


    for(
        let i = 0;
        i < 12;
        i++
    ){

        const teamInput =
            document.getElementById(
                `sportsEditTeamScore${i + 1}`
            );


        const opponentInput =
            document.getElementById(
                `sportsEditOpponentScore${i + 1}`
            );


        const teamValue =
            teamInput
            ?
            teamInput.value.trim()
            :
            "";


        const opponentValue =
            opponentInput
            ?
            opponentInput.value.trim()
            :
            "";


        teamScores.push(
            teamValue
        );


        opponentScores.push(
            opponentValue
        );

    }


    /*
       後ろの空欄を削除
    */

    while(
        teamScores.length > 0 &&
        opponentScores.length > 0 &&
        teamScores[teamScores.length - 1] === "" &&
        opponentScores[opponentScores.length - 1] === ""
    ){

        teamScores.pop();
        opponentScores.pop();

    }


    return {

        teamScores,
        opponentScores

    };

}


/* =====================================================
   ⚾ 試合結果保存
===================================================== */

function saveSportsGameEdit(){

    console.log("★ saveSportsGameEdit 実行");

    if(!sportsSelectedDate){

        alert(
            "試合日が取得できません。"
        );

        return;

    }


    const teamInput =
        document.getElementById(
            "sportsEditTeam"
        );


    const opponentInput =
        document.getElementById(
            "sportsEditOpponent"
        );


    const resultSelect =
        document.getElementById(
            "sportsEditResult"
        );


    const memoInput =
        document.getElementById(
            "sportsEditMemo"
        );


        const locationInput =
    document.getElementById(
        "sportsEditLocation"
    );

const startingPitcherInput =
    document.getElementById(
        "sportsEditStartingPitcher"
    );


    const location =
    locationInput
    ?
    locationInput.value.trim()
    :
    "";

const startingPitcher =
    startingPitcherInput
    ?
    startingPitcherInput.value.trim()
    :
    "";


    const team =
        teamInput
        ?
        teamInput.value.trim()
        :
        "";


    const opponent =
        opponentInput
        ?
        opponentInput.value.trim()
        :
        "";


    const result =
        resultSelect
        ?
        resultSelect.value
        :
        "";


    const memo =
        memoInput
        ?
        memoInput.value.trim()
        :
        "";


    /*
       応援チームは必須
    */

    if(!team){

        alert(
            "応援チーム名を入力してください。"
        );


        if(teamInput){

            teamInput.focus();

        }


        return;

    }


    /*
       対戦相手は必須
    */

    if(!opponent){

        alert(
            "対戦相手を入力してください。"
        );


        if(opponentInput){

            opponentInput.focus();

        }


        return;

    }


    const scores =
        collectSportsGameScores();


    /*
       試合データ
    */

    const game = {

        date:
            sportsSelectedDate,

        team:
            team,

        opponent:
            opponent,
        
        location:
    location,

startingPitcher:
    startingPitcher,

        teamScores:
            scores.teamScores,

        opponentScores:
            scores.opponentScores,

        result:
            result,

        memo:
            memo,

        updatedAt:
            new Date().toISOString()

    };


    /*
       Firestore / local DBへ保存
    */

    saveSportsGameData(
        sportsSelectedDate,
        game
    );


    /*
       保存成功後は
       結果画面へ移動
    */

    openBaseballGameDetailPage(
        sportsSelectedDate
    );

}


/* =====================================================
   ⚾ 編集画面を閉じる
===================================================== */

function cancelSportsGameEdit(){

    closeSportsGameEditPage();

}


/* =====================================================
   ⚾ 結果画面から編集
===================================================== */

function editBaseballGame(){

    if(!sportsSelectedDate){

        alert(
            "試合日が取得できません。"
        );

        return;

    }


    openBaseballGameEditPage(
        sportsSelectedDate
    );

}


/* =====================================================
   ⚾ 試合削除
===================================================== */

function deleteBaseballGame(){

    if(!sportsSelectedDate){

        alert(
            "試合日が取得できません。"
        );

        return;

    }


    const games =
        getCurrentSportsGameForEdit();


    const game =
        games[sportsSelectedDate];


    if(!game){

        alert(
            "削除する試合がありません。"
        );

        return;

    }


    const opponent =
        game.opponent ||
        "対戦相手";


    const confirmed =
        confirm(
            `「${opponent}」との試合結果を削除しますか？`
        );


    if(!confirmed){

        return;

    }


    const data =
        db.load();


    if(
        data.sportsCalendar &&
        data.sportsCalendar.games
    ){

        const selectedIndex =
            typeof data.sportsCalendar.selectedIndex === "number"
            ?
            data.sportsCalendar.selectedIndex
            :
            0;


        if(
            data.sportsCalendar.games[selectedIndex]
        ){

            delete
                data.sportsCalendar.games[selectedIndex][
                    sportsSelectedDate
                ];

        }

    }


    db.save(data);


    alert(
        "🗑️ 試合結果を削除しました。"
    );


    closeSportsGameDetailPage();

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