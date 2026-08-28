/* =====================================================
   ⚽ サッカー試合結果
   sports-soccer.js

   ・前半
   ・後半
   ・延長前半
   ・延長後半
   ・PK
   ・チーム名
   ・対戦相手
   ・場所
   ・勝敗
   ・メモ

   野球とは別処理。
===================================================== */


/* =====================================================
   状態
===================================================== */

let soccerExtraPeriods = {
    extraFirstHalf: false,
    extraSecondHalf: false,
    penalty: false
};


/* =====================================================
   現在のサッカー games を取得
===================================================== */

function getCurrentSoccerGames(){

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

    if(
        settings.games &&
        typeof settings.games === "object" &&
        !Array.isArray(settings.games)
    ){

        const games =
            settings.games[selectedIndex];

        if(
            games &&
            typeof games === "object"
        ){

            return games;

        }

    }

    return {};

}


/* =====================================================
   サッカー合計
===================================================== */

function calculateSoccerTotal(game){

    if(!game){

        return 0;

    }

    const firstHalf =
        Number(game.firstHalfTeam) || 0;

    const secondHalf =
        Number(game.secondHalfTeam) || 0;

    const extraFirst =
        Number(game.extraFirstHalfTeam) || 0;

    const extraSecond =
        Number(game.extraSecondHalfTeam) || 0;

    return (
        firstHalf +
        secondHalf +
        extraFirst +
        extraSecond
    );

}


function calculateSoccerOpponentTotal(game){

    if(!game){

        return 0;

    }

    const firstHalf =
        Number(game.firstHalfOpponent) || 0;

    const secondHalf =
        Number(game.secondHalfOpponent) || 0;

    const extraFirst =
        Number(game.extraFirstHalfOpponent) || 0;

    const extraSecond =
        Number(game.extraSecondHalfOpponent) || 0;

    return (
        firstHalf +
        secondHalf +
        extraFirst +
        extraSecond
    );

}


/* =====================================================
   サッカー編集HTML読み込み
===================================================== */

async function loadSportsSoccerHTML(){

    const page =
        document.getElementById(
            "sportsSoccerPage"
        );

    if(!page){

        console.error(
            "sportsSoccerPage が見つかりません"
        );

        return false;

    }

    try{

        const response =
            await fetch(
                "sports-soccer.html"
            );

        if(!response.ok){

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const html =
            await response.text();

        const parser =
            new DOMParser();

        const doc =
            parser.parseFromString(
                html,
                "text/html"
            );

        page.innerHTML =
            doc.body.innerHTML;

        return true;

    }catch(error){

        console.error(
            "sports-soccer.html の読み込みに失敗しました",
            error
        );

        return false;

    }

}


/* =====================================================
   ⚽ サッカー編集画面を開く
===================================================== */

async function openSoccerGameEditPage(date){

    hideSportsSubPages();

    sportsSelectedDate =
        date;


    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );

    const soccerPage =
        document.getElementById(
            "sportsSoccerPage"
        );


    if(!sportsPage || !soccerPage){

        console.error(
            "スポーツカレンダーまたはサッカーページが見つかりません"
        );

        return;

    }


    sportsPage.classList.remove(
        "active"
    );

    sportsPage.style.display =
        "none";


    soccerPage.classList.add(
        "active"
    );

    soccerPage.style.display =
        "block";


    const loaded =
        await loadSportsSoccerHTML();

    if(!loaded){

        return;

    }


    renderSoccerGameEditForm();

}


/* =====================================================
   ⚽ サッカー編集フォーム描画
===================================================== */

function renderSoccerGameEditForm(){

    const form =
        document.getElementById(
            "soccerGameEditForm"
        );

    if(!form){

        console.error(
            "soccerGameEditForm が見つかりません"
        );

        return;

    }


    if(!sportsSelectedDate){

        return;

    }


    const games =
        getCurrentSoccerGames();

    const game =
        games[sportsSelectedDate] ||
        {};


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


    const team =
        current?.team ||
        game.team ||
        settings.team ||
        "";


    const opponent =
        game.opponent ||
        "";


    /* =================================================
       タイトル
    ================================================= */

    const title =
        document.getElementById(
            "soccerGameEditTitle"
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
            `⚽ ${dateObject.getFullYear()}年` +
            `${dateObject.getMonth() + 1}月` +
            `${dateObject.getDate()}日` +
            `（${weekdays[dateObject.getDay()]}） 試合結果編集`;

    }


    /* =================================================
       チーム
    ================================================= */

    const teamInput =
        document.getElementById(
            "soccerEditTeam"
        );

    const opponentInput =
        document.getElementById(
            "soccerEditOpponent"
        );

    const locationInput =
        document.getElementById(
            "soccerEditLocation"
        );

    const resultSelect =
        document.getElementById(
            "soccerEditResult"
        );

    const memoInput =
        document.getElementById(
            "soccerEditMemo"
        );


    if(teamInput){

        teamInput.value =
            team;

    }


    if(opponentInput){

        opponentInput.value =
            opponent;

    }


    if(locationInput){

        locationInput.value =
            game.location ||
            "";

    }


    if(resultSelect){

        resultSelect.value =
            game.result ||
            "";

    }


    if(memoInput){

        memoInput.value =
            game.memo ||
            "";

    }


    /* =================================================
       前半・後半
    ================================================= */

    setSoccerInputValue(
        "soccerEditTeamFirstHalf",
        game.firstHalfTeam
    );

    setSoccerInputValue(
        "soccerEditOpponentFirstHalf",
        game.firstHalfOpponent
    );

    setSoccerInputValue(
        "soccerEditTeamSecondHalf",
        game.secondHalfTeam
    );

    setSoccerInputValue(
        "soccerEditOpponentSecondHalf",
        game.secondHalfOpponent
    );


    /* =================================================
       追加項目状態
    ================================================= */

    soccerExtraPeriods = {

        extraFirstHalf:
            game.extraFirstHalfEnabled === true,

        extraSecondHalf:
            game.extraSecondHalfEnabled === true,

        penalty:
            game.penaltyEnabled === true

    };


    renderSoccerExtraPeriods();


    updateSoccerScoreboard();


    updateSoccerScoreTeamNames();

}


/* =====================================================
   input値設定
===================================================== */

function setSoccerInputValue(
    id,
    value
){

    const input =
        document.getElementById(
            id
        );

    if(!input){

        return;

    }

    input.value =
        value === undefined ||
        value === null
        ?
        ""
        :
        value;

}


/* =====================================================
   ⚽ 延長・PK追加
===================================================== */

function addSoccerExtraPeriod(){

    if(
        !soccerExtraPeriods.extraFirstHalf
    ){

        soccerExtraPeriods.extraFirstHalf =
            true;

    }else if(
        !soccerExtraPeriods.extraSecondHalf
    ){

        soccerExtraPeriods.extraSecondHalf =
            true;

    }else if(
        !soccerExtraPeriods.penalty
    ){

        soccerExtraPeriods.penalty =
            true;

    }else{

        return;

    }


    renderSoccerExtraPeriods();

    updateSoccerScoreboard();

}


/* =====================================================
   追加項目描画
===================================================== */

function renderSoccerExtraPeriods(){

    const area =
        document.getElementById(
            "soccerExtraPeriods"
        );

    const button =
        document.getElementById(
            "soccerAddPeriodButton"
        );


    if(!area){

        return;

    }


    let html = "";


    /* =================================================
       延長前半
    ================================================= */

    if(
        soccerExtraPeriods.extraFirstHalf
    ){

        html += `

            <div
                class="soccer-score-row"
                data-period="extraFirstHalf"
            >

                <div class="soccer-score-period">
                    延長前半
                </div>

                <input
                    id="soccerEditTeamExtraFirstHalf"
                    class="soccer-score-input"
                    type="number"
                    min="0"
                    inputmode="numeric"
                >

                <span class="soccer-score-dash">
                    -
                </span>

                <input
                    id="soccerEditOpponentExtraFirstHalf"
                    class="soccer-score-input"
                    type="number"
                    min="0"
                    inputmode="numeric"
                >

            </div>

        `;

    }


    /* =================================================
       延長後半
    ================================================= */

    if(
        soccerExtraPeriods.extraSecondHalf
    ){

        html += `

            <div
                class="soccer-score-row"
                data-period="extraSecondHalf"
            >

                <div class="soccer-score-period">
                    延長後半
                </div>

                <input
                    id="soccerEditTeamExtraSecondHalf"
                    class="soccer-score-input"
                    type="number"
                    min="0"
                    inputmode="numeric"
                >

                <span class="soccer-score-dash">
                    -
                </span>

                <input
                    id="soccerEditOpponentExtraSecondHalf"
                    class="soccer-score-input"
                    type="number"
                    min="0"
                    inputmode="numeric"
                >

            </div>

        `;

    }


    /* =================================================
       PK
    ================================================= */

    if(
        soccerExtraPeriods.penalty
    ){

        html += `

            <div
                class="soccer-score-row"
                data-period="penalty"
            >

                <div class="soccer-score-period">
                    PK
                </div>

                <input
                    id="soccerEditTeamPenalty"
                    class="soccer-score-input"
                    type="number"
                    min="0"
                    inputmode="numeric"
                >

                <span class="soccer-score-dash">
                    -
                </span>

                <input
                    id="soccerEditOpponentPenalty"
                    class="soccer-score-input"
                    type="number"
                    min="0"
                    inputmode="numeric"
                >

            </div>

        `;

    }


    area.innerHTML =
        html;


    if(button){

        if(
            !soccerExtraPeriods.extraFirstHalf
        ){

            button.textContent =
                "＋ 延長前半を追加";

        }else if(
            !soccerExtraPeriods.extraSecondHalf
        ){

            button.textContent =
                "＋ 延長後半を追加";

        }else if(
            !soccerExtraPeriods.penalty
        ){

            button.textContent =
                "＋ PKを追加";

        }else{

            button.style.display =
                "none";

        }

    }

}


/* =====================================================
   ⚽ チーム名表示
===================================================== */

function updateSoccerScoreTeamNames(){

    const teamInput =
        document.getElementById(
            "soccerEditTeam"
        );

    const opponentInput =
        document.getElementById(
            "soccerEditOpponent"
        );

    const teamName =
        document.getElementById(
            "soccerEditScoreTeamName"
        );

    const opponentName =
        document.getElementById(
            "soccerEditScoreOpponentName"
        );


    const team =
        teamInput?.value.trim() ||
        "応援チーム";

    const opponent =
        opponentInput?.value.trim() ||
        "相手チーム";


    if(teamName){

        teamName.textContent =
            team;

    }


    if(opponentName){

        opponentName.textContent =
            opponent;

    }

}


/* =====================================================
   ⚽ スコア計算
===================================================== */

function updateSoccerScoreboard(){

    const teamFirst =
        Number(
            document.getElementById(
                "soccerEditTeamFirstHalf"
            )?.value
        ) || 0;

    const opponentFirst =
        Number(
            document.getElementById(
                "soccerEditOpponentFirstHalf"
            )?.value
        ) || 0;


    const teamSecond =
        Number(
            document.getElementById(
                "soccerEditTeamSecondHalf"
            )?.value
        ) || 0;

    const opponentSecond =
        Number(
            document.getElementById(
                "soccerEditOpponentSecondHalf"
            )?.value
        ) || 0;


    const teamExtraFirst =
        Number(
            document.getElementById(
                "soccerEditTeamExtraFirstHalf"
            )?.value
        ) || 0;

    const opponentExtraFirst =
        Number(
            document.getElementById(
                "soccerEditOpponentExtraFirstHalf"
            )?.value
        ) || 0;


    const teamExtraSecond =
        Number(
            document.getElementById(
                "soccerEditTeamExtraSecondHalf"
            )?.value
        ) || 0;

    const opponentExtraSecond =
        Number(
            document.getElementById(
                "soccerEditOpponentExtraSecondHalf"
            )?.value
        ) || 0;


    const teamTotal =
        teamFirst +
        teamSecond +
        teamExtraFirst +
        teamExtraSecond;


    const opponentTotal =
        opponentFirst +
        opponentSecond +
        opponentExtraFirst +
        opponentExtraSecond;


    const teamTotalElement =
        document.getElementById(
            "soccerEditTeamTotal"
        );

    const opponentTotalElement =
        document.getElementById(
            "soccerEditOpponentTotal"
        );


    const finalTeam =
        document.getElementById(
            "soccerEditFinalTeamScore"
        );

    const finalOpponent =
        document.getElementById(
            "soccerEditFinalOpponentScore"
        );


    if(teamTotalElement){

        teamTotalElement.textContent =
            teamTotal;

    }


    if(opponentTotalElement){

        opponentTotalElement.textContent =
            opponentTotal;

    }


    if(finalTeam){

        finalTeam.textContent =
            teamTotal;

    }


    if(finalOpponent){

        finalOpponent.textContent =
            opponentTotal;

    }


    updateSoccerScoreTeamNames();

}


/* =====================================================
   入力イベント
===================================================== */

document.addEventListener(
    "input",
    function(event){

        if(
            event.target.matches(
                ".soccer-score-input"
            ) ||
            event.target.id ===
                "soccerEditTeam" ||
            event.target.id ===
                "soccerEditOpponent"
        ){

            updateSoccerScoreboard();

        }

    }
);


/* =====================================================
   ⚽ 保存
===================================================== */

function saveSoccerGameEdit(){

    if(!sportsSelectedDate){

        alert(
            "試合日が設定されていません。"
        );

        return;

    }


    const teamInput =
        document.getElementById(
            "soccerEditTeam"
        );

    const opponentInput =
        document.getElementById(
            "soccerEditOpponent"
        );

    const locationInput =
        document.getElementById(
            "soccerEditLocation"
        );

    const resultSelect =
        document.getElementById(
            "soccerEditResult"
        );

    const memoInput =
        document.getElementById(
            "soccerEditMemo"
        );


    const team =
        teamInput?.value.trim() ||
        "";

    const opponent =
        opponentInput?.value.trim() ||
        "";


    if(!team){

        alert(
            "応援チーム名を入力してください。"
        );

        teamInput?.focus();

        return;

    }


    if(!opponent){

        alert(
            "相手チーム名を入力してください。"
        );

        opponentInput?.focus();

        return;

    }


    const game = {

        team:
            team,

        opponent:
            opponent,

        location:
            locationInput?.value.trim() ||
            "",

        result:
            resultSelect?.value ||
            "",

        memo:
            memoInput?.value.trim() ||
            "",

        firstHalfTeam:
            getSoccerNumber(
                "soccerEditTeamFirstHalf"
            ),

        firstHalfOpponent:
            getSoccerNumber(
                "soccerEditOpponentFirstHalf"
            ),

        secondHalfTeam:
            getSoccerNumber(
                "soccerEditTeamSecondHalf"
            ),

        secondHalfOpponent:
            getSoccerNumber(
                "soccerEditOpponentSecondHalf"
            ),

        extraFirstHalfEnabled:
            soccerExtraPeriods.extraFirstHalf,

        extraFirstHalfTeam:
            getSoccerNumber(
                "soccerEditTeamExtraFirstHalf"
            ),

        extraFirstHalfOpponent:
            getSoccerNumber(
                "soccerEditOpponentExtraFirstHalf"
            ),

        extraSecondHalfEnabled:
            soccerExtraPeriods.extraSecondHalf,

        extraSecondHalfTeam:
            getSoccerNumber(
                "soccerEditTeamExtraSecondHalf"
            ),

        extraSecondHalfOpponent:
            getSoccerNumber(
                "soccerEditOpponentExtraSecondHalf"
            ),

        penaltyEnabled:
            soccerExtraPeriods.penalty,

        penaltyTeam:
            getSoccerNumber(
                "soccerEditTeamPenalty"
            ),

        penaltyOpponent:
            getSoccerNumber(
                "soccerEditOpponentPenalty"
            )

    };


    saveSportsGameData(
        sportsSelectedDate,
        game
    );


    alert(
        "⚽ 試合結果を保存しました。"
    );


    closeSoccerGameEditPage();

}


/* =====================================================
   数値取得
===================================================== */

function getSoccerNumber(id){

    const input =
        document.getElementById(id);

    if(!input){

        return 0;

    }


    const value =
        input.value;


    if(value === ""){

        return 0;

    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ?
        number
        :
        0;

}


/* =====================================================
   ⚽ データ保存
===================================================== */

function saveSportsGameData(
    date,
    game
){

    const data =
        db.load();


    if(!data.sportsCalendar){

        data.sportsCalendar = {

            selectedIndex: 0,

            favoriteSports: [],

            games: {}

        };

    }


    if(!data.sportsCalendar.games){

        data.sportsCalendar.games = {};

    }


    const selectedIndex =
        typeof data.sportsCalendar.selectedIndex === "number"
        ?
        data.sportsCalendar.selectedIndex
        :
        0;


    if(
        !data.sportsCalendar.games[selectedIndex] ||
        typeof data.sportsCalendar.games[selectedIndex] !== "object"
    ){

        data.sportsCalendar.games[selectedIndex] =
            {};

    }


    data.sportsCalendar.games[selectedIndex][date] =
        game;


    db.save(data);


    renderSportsCalendar();

}


/* =====================================================
   ⚽ 編集キャンセル
===================================================== */

function cancelSportsGameEdit(){

    closeSoccerGameEditPage();

}


/* =====================================================
   ⚽ 編集画面を閉じる
===================================================== */

function closeSoccerGameEditPage(){

    const soccerPage =
        document.getElementById(
            "sportsSoccerPage"
        );

    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );

    const sportsScreen =
        document.getElementById(
            "sportsCalendarScreen"
        );


    if(soccerPage){

        soccerPage.classList.remove(
            "active"
        );

        soccerPage.style.display =
            "none";

    }


    if(sportsPage){

        sportsPage.classList.add(
            "active"
        );

        sportsPage.style.display =
            "";

    }


    if(sportsScreen){

        sportsScreen.style.display =
            "";

    }


    renderSportsCalendar();


    sportsSelectedDate =
        null;

}


/* =====================================================
   ⚽ サッカー結果閲覧
===================================================== */

/* =====================================================
   ⚽ サッカー結果閲覧
===================================================== */

function openSoccerGameDetailPage(date){

    hideSportsSubPages();

    sportsSelectedDate =
        date;


    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );


    const detailPage =
        document.getElementById(
            "sportsGameDetailPage"
        );


    if(!sportsPage || !detailPage){

        console.error(
            "スポーツカレンダーまたは試合結果ページが見つかりません"
        );

        return;

    }


    /*
       スポーツカレンダーを非表示
    */

    sportsPage.classList.remove("active");

    sportsPage.style.display =
        "none";


    /*
       共通の試合結果ページを表示
    */

    detailPage.classList.add("active");

    detailPage.style.display =
        "block";


    /*
       サッカー結果を表示
    */

    renderSoccerGameView(
        date
    );

}


/* =====================================================
   ⚽ 結果画面描画
===================================================== */

function renderSoccerGameView(date){

    const page =
        document.getElementById(
            "sportsGameDetail"
        );


    if(!page){

        return;

    }


    const games =
        getCurrentSoccerGames();

    const game =
        games[date];


    if(!game){

        return;

    }


    const team =
        game.team ||
        "応援チーム";

    const opponent =
        game.opponent ||
        "相手チーム";


    const teamTotal =
        calculateSoccerTotal(
            game
        );

    const opponentTotal =
        calculateSoccerOpponentTotal(
            game
        );


    const penaltyEnabled =
        game.penaltyEnabled === true;


    const resultText =
        game.result === "win"
        ?
        "🏆 勝ち"
        :
        game.result === "lose"
        ?
        "😢 負け"
        :
        game.result === "draw"
        ?
        "🤝 引き分け"
        :
        game.result === "cancelled"
        ?
        "⛔ 中止"
        :
        "";


    const rows = [];


    rows.push({

        label: "前半",

        team:
            game.firstHalfTeam,

        opponent:
            game.firstHalfOpponent

    });


    rows.push({

        label: "後半",

        team:
            game.secondHalfTeam,

        opponent:
            game.secondHalfOpponent

    });


    if(game.extraFirstHalfEnabled){

        rows.push({

            label: "延長前半",

            team:
                game.extraFirstHalfTeam,

            opponent:
                game.extraFirstHalfOpponent

        });

    }


    if(game.extraSecondHalfEnabled){

        rows.push({

            label: "延長後半",

            team:
                game.extraSecondHalfTeam,

            opponent:
                game.extraSecondHalfOpponent

        });

    }


    if(penaltyEnabled){

        rows.push({

            label: "PK",

            team:
                game.penaltyTeam,

            opponent:
                game.penaltyOpponent

        });

    }


    let rowsHTML = "";


    rows.forEach(
        row => {

            rowsHTML += `

                <div class="soccer-view-score-row">

                    <div class="soccer-view-period">
                        ${row.label}
                    </div>

                    <strong>
                        ${Number(row.team) || 0}
                    </strong>

                    <span>
                        -
                    </span>

                    <strong>
                        ${Number(row.opponent) || 0}
                    </strong>

                </div>

            `;

        }
    );


    page.innerHTML = `

        <div class="soccer-game-view">

            <header class="sports-calendar-header">

                <h1 class="sports-calendar-title">
                    ⚽ 試合結果
                </h1>

                <button
                    type="button"
                    class="sports-back-button"
                    onclick="closeSportsGameDetailPage()"
                >
                    ◀ カレンダーへ戻る
                </button>

            </header>


            <div class="soccer-view-content">

                <div class="soccer-view-date">
                    ${escapeSportsHTML(date)}
                </div>


                <div class="soccer-view-match">

                    <div class="soccer-view-team">
                        ${escapeSportsHTML(team)}
                    </div>

                    <div class="soccer-view-final">
                        <strong>
                            ${teamTotal}
                        </strong>

                        <span>
                            -
                        </span>

                        <strong>
                            ${opponentTotal}
                        </strong>
                    </div>

                    <div class="soccer-view-team">
                        ${escapeSportsHTML(opponent)}
                    </div>

                </div>


                <div class="soccer-view-scoreboard">

                    ${rowsHTML}


                    <div class="soccer-view-score-row total">

                        <div class="soccer-view-period">
                            計
                        </div>

                        <strong>
                            ${teamTotal}
                        </strong>

                        <span>
                            -
                        </span>

                        <strong>
                            ${opponentTotal}
                        </strong>

                    </div>

                </div>


                ${
                    resultText
                    ?
                    `
                    <div class="soccer-view-result">
                        ${resultText}
                    </div>
                    `
                    :
                    ""
                }


                ${
                    game.location
                    ?
                    `
                    <div class="soccer-view-info">
                        📍 ${escapeSportsHTML(game.location)}
                    </div>
                    `
                    :
                    ""
                }


                ${
                    game.memo
                    ?
                    `
                    <div class="soccer-view-memo">

                        <div>
                            📝 メモ
                        </div>

                        <p>
                            ${escapeSportsHTML(game.memo)}
                        </p>

                    </div>
                    `
                    :
                    ""
                }


                <div class="soccer-view-buttons">

                    <button
                        type="button"
                        onclick="openSoccerGameEditPage(sportsSelectedDate)"
                    >
                        ✏️ 編集
                    </button>


                    <button
                        type="button"
                        onclick="deleteSoccerGame()"
                    >
                        🗑️ 削除
                    </button>


                    <button
                        type="button"
                        onclick="closeSportsGameDetailPage()"
                    >
                        ❌ 閉じる
                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =====================================================
   ⚽ 削除
===================================================== */

function deleteSoccerGame(){

    if(!sportsSelectedDate){

        return;

    }


    if(
        !confirm(
            "この試合結果を削除しますか？"
        )
    ){

        return;

    }


    const data =
        db.load();


    const selectedIndex =
        typeof data.sportsCalendar?.selectedIndex === "number"
        ?
        data.sportsCalendar.selectedIndex
        :
        0;


    if(
        data.sportsCalendar?.games?.[
            selectedIndex
        ]
    ){

        delete data.sportsCalendar.games[
            selectedIndex
        ][sportsSelectedDate];

    }


    db.save(data);


    alert(
        "⚽ 試合結果を削除しました。"
    );


    closeSoccerGameEditPage();

}


/* =====================================================
   HTMLエスケープ
===================================================== */

function escapeSportsHTML(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* =====================================================
   ⚽ サッカー試合結果編集HTML読み込み
===================================================== */

async function loadSoccerGameEditHTML(){

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
            "sports-game-edit.html（サッカー）読み込み成功"
        );


        return true;

    }catch(error){

        console.error(
            "sports-game-edit.html（サッカー）の読み込みに失敗:",
            error
        );

        return false;

    }

}