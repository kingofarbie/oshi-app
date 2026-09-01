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

   【延長・PK仕様】

   延長：
       extraEnabled = true / false

   延長が実施された場合、
   得点が 0 - 0 でも
   結果画面に表示する。

   PK：
       penaltyEnabled = true / false

   延長なしでPKも可能。
   延長 0 - 0 → PKも可能。

   PKスコアは通常の「計」には含めない。
===================================================== */


/* =====================================================
   状態
===================================================== */

let soccerExtraPeriods = {

    extra: false,

    penalty: false

};


/*
   延長・PKの入力値を保持

   HTMLを再描画しても
   入力済みの点数が消えないようにする
*/

let soccerExtraScoreValues = {

    extraFirstTeam: "",
    extraFirstOpponent: "",

    extraSecondTeam: "",
    extraSecondOpponent: "",

    penaltyTeam: "",
    penaltyOpponent: ""

};


/*
   ホーム / アウェイ変更の直前状態
*/

let soccerPreviousHomeAway = "";


/* =====================================================
   現在のサッカー games
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
   ⚽ サッカー合計
   ※ PKは含めない
===================================================== */

function calculateSoccerTotal(game){

    if(!game){

        return 0;

    }


    return (

        Number(game.firstHalfTeam) || 0

    ) + (

        Number(game.secondHalfTeam) || 0

    ) + (

        Number(game.extraFirstHalfTeam) || 0

    ) + (

        Number(game.extraSecondHalfTeam) || 0

    );

}


function calculateSoccerOpponentTotal(game){

    if(!game){

        return 0;

    }


    return (

        Number(game.firstHalfOpponent) || 0

    ) + (

        Number(game.secondHalfOpponent) || 0

    ) + (

        Number(game.extraFirstHalfOpponent) || 0

    ) + (

        Number(game.extraSecondHalfOpponent) || 0

    );

}


/* =====================================================
   ⚽ 編集画面を開く
===================================================== */

async function openSoccerGameEditPage(date){

    hideSportsSubPages();

    sportsSelectedDate = date;

    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );

    const editPage =
        document.getElementById(
            "sportsGameEditPage"
        );

    if(
        !sportsPage ||
        !editPage
    ){

        console.error(
            "❌ サッカースポーツカレンダーまたは編集ページが見つかりません"
        );

        return;

    }

    sportsPage.style.display =
        "none";

    sportsPage.classList.remove(
        "active"
    );

    editPage.style.display =
        "block";

    editPage.classList.add(
        "active"
    );

    console.log(
        "① サッカー編集ページ表示開始:",
        date
    );

    const loaded =
        await loadSoccerGameEditHTML();

    console.log(
        "② サッカー編集HTML読み込み結果:",
        loaded
    );

    if(!loaded){

        console.error(
            "③ サッカー編集HTML読み込み失敗"
        );

        return;

    }

    renderSoccerGameEditForm();

    console.log(
        "④ サッカー編集フォーム描画完了"
    );

}

/* =====================================================
   ⚽ 編集フォーム描画
===================================================== */

function renderSoccerGameEditForm(){

    const form =
        document.getElementById(
            "sportsGameEditForm"
        );


    if(!form){

        console.error(
            "❌ sportsGameEditForm が見つかりません"
        );

        return;

    }


    if(!sportsSelectedDate){

        console.error(
            "❌ sportsSelectedDate がありません"
        );

        return;

    }


    /* =================================================
       現在のスポーツ設定
    ================================================= */

    const data =
        db.load();


    const sportsCalendar =
        data.sportsCalendar || {};


    const favoriteSports =
        Array.isArray(
            sportsCalendar.favoriteSports
        )
        ?
        sportsCalendar.favoriteSports
        :
        [];


    const selectedIndex =
        typeof sportsCalendar.selectedIndex === "number"
        ?
        sportsCalendar.selectedIndex
        :
        0;


    const currentFavorite =
        favoriteSports[selectedIndex] ||
        {};


    const calendarTeam =
        currentFavorite.team ||
        sportsCalendar.team ||
        "";


    /* =================================================
       現在の試合データ
    ================================================= */

    const games =
        getCurrentSoccerGames();


    const savedGame =
        games[sportsSelectedDate] ||
        null;


    const game =
        savedGame
        ?
        { ...savedGame }
        :
        {

            team:
                calendarTeam,

            opponent:
                "",

            homeAway:
                "",

            location:
                "",

            result:
                "",

            memo:
                "",

            firstHalfTeam:
                0,

            firstHalfOpponent:
                0,

            secondHalfTeam:
                0,

            secondHalfOpponent:
                0,

            extraEnabled:
                false,

            extraFirstHalfTeam:
                0,

            extraFirstHalfOpponent:
                0,

            extraSecondHalfTeam:
                0,

            extraSecondHalfOpponent:
                0,

            penaltyEnabled:
                false,

            penaltyTeam:
                0,

            penaltyOpponent:
                0

        };


    console.log(
        "⚽ 編集画面読み込み game:",
        game
    );


    /* =================================================
       延長・PK状態
    ================================================= */

    soccerExtraPeriods = {

        /*
           新形式を優先。

           旧データも認識する。
        */

        extra:
            game.extraEnabled === true ||
            game.extraFirstHalfEnabled === true ||
            game.extraSecondHalfEnabled === true,

        penalty:
            game.penaltyEnabled === true

    };


    /* =================================================
       延長・PK点数
    ================================================= */

    soccerExtraScoreValues = {

        extraFirstTeam:
            game.extraFirstHalfTeam ?? "",

        extraFirstOpponent:
            game.extraFirstHalfOpponent ?? "",

        extraSecondTeam:
            game.extraSecondHalfTeam ?? "",

        extraSecondOpponent:
            game.extraSecondHalfOpponent ?? "",

        penaltyTeam:
            game.penaltyTeam ?? "",

        penaltyOpponent:
            game.penaltyOpponent ?? ""

    };


    /* =================================================
       ホーム / アウェイ初期状態
    ================================================= */

    soccerPreviousHomeAway =
        game.homeAway || "";


    /* =================================================
       編集フォーム
    ================================================= */

    form.innerHTML = `

        <section class="sports-edit-section">

            <h2>⚽ 試合情報</h2>


            <label>
                自分の応援チーム
            </label>

            <input
                type="text"
                id="soccerEditTeam"
                placeholder="応援チーム名"
                autocomplete="off"
            >


            <label>
                相手チーム
            </label>

            <input
                type="text"
                id="soccerEditOpponent"
                placeholder="相手チーム名"
                autocomplete="off"
            >


            <label>
                ホーム・アウェイ
            </label>

            <select id="soccerEditHomeAway">

                <option value="">
                    未設定
                </option>

                <option value="home">
                    応援チームがホーム
                </option>

                <option value="away">
                    応援チームがアウェイ
                </option>

            </select>


            <!-- =========================================
                 スコア
            ========================================== -->

            <section class="sports-edit-section">

                <h2>📊 スコア</h2>


                <div class="soccer-score-teams">

                    <div id="soccerEditHomeTeamName">
                        ホーム
                    </div>

                    <div>
                        -
                    </div>

                    <div id="soccerEditAwayTeamName">
                        アウェイ
                    </div>

                </div>


                <!-- 前半 -->

                <div class="soccer-score-row">

                    <div class="soccer-score-period">
                        前半
                    </div>

                    <input
                        type="number"
                        id="soccerEditTeamFirstHalf"
                        class="soccer-score-input"
                        min="0"
                        inputmode="numeric"
                        placeholder="0"
                    >

                    <span>
                        -
                    </span>

                    <input
                        type="number"
                        id="soccerEditOpponentFirstHalf"
                        class="soccer-score-input"
                        min="0"
                        inputmode="numeric"
                        placeholder="0"
                    >

                </div>


                <!-- 後半 -->

                <div class="soccer-score-row">

                    <div class="soccer-score-period">
                        後半
                    </div>

                    <input
                        type="number"
                        id="soccerEditTeamSecondHalf"
                        class="soccer-score-input"
                        min="0"
                        inputmode="numeric"
                        placeholder="0"
                    >

                    <span>
                        -
                    </span>

                    <input
                        type="number"
                        id="soccerEditOpponentSecondHalf"
                        class="soccer-score-input"
                        min="0"
                        inputmode="numeric"
                        placeholder="0"
                    >

                </div>


                <!-- =====================================
                     延長
                ====================================== -->

                <div class="soccer-extra-header">

                    <label>

                        <input
                            type="checkbox"
                            id="soccerExtraEnabled"
                            onchange="toggleSoccerExtraPeriods()"
                        >

                        延長あり

                    </label>

                </div>


                <div
                    id="soccerExtraPeriods"
                    style="display:none;"
                ></div>


                <!-- =====================================
                     PK
                ====================================== -->

                <div class="soccer-extra-header">

                    <label>

                        <input
                            type="checkbox"
                            id="soccerPenaltyEnabled"
                            onchange="toggleSoccerPenalty()"
                        >

                        PKあり

                    </label>

                </div>


                <div
                    id="soccerPenaltyPeriod"
                    style="display:none;"
                ></div>


                <!-- =====================================
                     合計
                ====================================== -->

<div class="soccer-score-row total">

    <div class="soccer-score-period">
        計
    </div>

    <strong id="soccerEditTeamTotal">
    </strong>

    <span>
        -
    </span>

    <strong id="soccerEditOpponentTotal">
    </strong>

</div>

            </section>


            <!-- 会場 -->

            <label>
                📍 会場
            </label>

            <input
                type="text"
                id="soccerEditLocation"
                autocomplete="off"
            >


            <!-- 結果 -->

            <label>
                結果
            </label>

            <select id="soccerEditResult">

                <option value="">
                    未設定
                </option>

                <option value="win">
                    🏆 勝ち
                </option>

                <option value="lose">
                    😢 負け
                </option>

                <option value="draw">
                    🤝 引き分け
                </option>

                <option value="cancelled">
                    ⛔ 中止
                </option>

            </select>


            <!-- メモ -->

            <label>
                📝 メモ
            </label>

            <textarea
                id="soccerEditMemo"
            ></textarea>


            <!-- ボタン -->

            <div class="sports-edit-buttons">

                <button
                    type="button"
                    onclick="saveSoccerGameEdit()"
                >
                    💾 保存
                </button>

                <button
                    type="button"
                    onclick="cancelSoccerGameEdit()"
                >
                    キャンセル
                </button>

            </div>

        </section>

    `;


    /* =================================================
       基本情報
    ================================================= */

    document.getElementById(
        "soccerEditTeam"
    ).value =
        game.team ||
        calendarTeam ||
        "";


    document.getElementById(
        "soccerEditOpponent"
    ).value =
        game.opponent ||
        "";


    document.getElementById(
        "soccerEditHomeAway"
    ).value =
        game.homeAway ||
        "";


    document.getElementById(
        "soccerEditLocation"
    ).value =
        game.location ||
        "";


    document.getElementById(
        "soccerEditResult"
    ).value =
        game.result ||
        "";


    document.getElementById(
        "soccerEditMemo"
    ).value =
        game.memo ||
        "";


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
       延長チェック
    ================================================= */

    const extraCheckbox =
        document.getElementById(
            "soccerExtraEnabled"
        );


    if(extraCheckbox){

        extraCheckbox.checked =
            soccerExtraPeriods.extra;

    }


    /* =================================================
       PKチェック
    ================================================= */

    const penaltyCheckbox =
        document.getElementById(
            "soccerPenaltyEnabled"
        );


    if(penaltyCheckbox){

        penaltyCheckbox.checked =
            soccerExtraPeriods.penalty;

    }


/* =================================================
   ホーム / アウェイ変更
================================================= */

const homeAwaySelect =
    document.getElementById(
        "soccerEditHomeAway"
    );

if(homeAwaySelect){

    homeAwaySelect.addEventListener(
        "change",
        function(){

            if(
                soccerPreviousHomeAway &&
                homeAwaySelect.value &&
                soccerPreviousHomeAway !== homeAwaySelect.value
            ){

                swapSoccerHomeAwayScores();

            }

            soccerPreviousHomeAway =
                homeAwaySelect.value;

            updateSoccerScoreTeamNames();

            updateSoccerScoreboard();

        }
    );

}


    /* =================================================
       チーム名入力
    ================================================= */

    const teamInput =
        document.getElementById(
            "soccerEditTeam"
        );


    const opponentInput =
        document.getElementById(
            "soccerEditOpponent"
        );


    if(teamInput){

        teamInput.addEventListener(
            "input",
            function(){

                updateSoccerScoreTeamNames();

            }
        );

    }


    if(opponentInput){

        opponentInput.addEventListener(
            "input",
            function(){

                updateSoccerScoreTeamNames();

            }
        );

    }



    /* =================================================
       延長・PK描画
    ================================================= */

    renderSoccerExtraPeriods();

    renderSoccerPenalty();


    /* =================================================
       初期表示
    ================================================= */

    updateSoccerScoreTeamNames();

    updateSoccerScoreboard();


    console.log(
        "⚽ サッカー編集フォーム描画完了"
    );

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


    const homeAwaySelect =
        document.getElementById(
            "soccerEditHomeAway"
        );


    const homeName =
        document.getElementById(
            "soccerEditHomeTeamName"
        );


    const awayName =
        document.getElementById(
            "soccerEditAwayTeamName"
        );


    if(
        !homeName ||
        !awayName
    ){

        return;

    }


    const team =
        teamInput?.value.trim() ||
        "応援チーム";


    const opponent =
        opponentInput?.value.trim() ||
        "相手チーム";


    const homeAway =
        homeAwaySelect?.value ||
        "";


    if(homeAway === "home"){

        homeName.textContent =
            team;

        awayName.textContent =
            opponent;

    }
    else if(homeAway === "away"){

        homeName.textContent =
            opponent;

        awayName.textContent =
            team;

    }
    else{

        homeName.textContent =
            "ホーム";

        awayName.textContent =
            "アウェイ";

    }

}


/* =====================================================
   ⚽ ホーム / アウェイ スコア交換
===================================================== */

function swapSoccerHomeAwayScores(){

    const scorePairs = [

        [
            "soccerEditTeamFirstHalf",
            "soccerEditOpponentFirstHalf"
        ],

        [
            "soccerEditTeamSecondHalf",
            "soccerEditOpponentSecondHalf"
        ],

        [
            "soccerEditTeamExtraFirstHalf",
            "soccerEditOpponentExtraFirstHalf"
        ],

        [
            "soccerEditTeamExtraSecondHalf",
            "soccerEditOpponentExtraSecondHalf"
        ],

        [
            "soccerEditTeamPenalty",
            "soccerEditOpponentPenalty"
        ]

    ];


    scorePairs.forEach(
        pair => {

            const left =
                document.getElementById(
                    pair[0]
                );

            const right =
                document.getElementById(
                    pair[1]
                );


            if(
                !left ||
                !right
            ){

                return;

            }


            const temp =
                left.value;

            left.value =
                right.value;

            right.value =
                temp;

        }
    );


    /* =========================
       延長・PKの内部値も交換
    ========================= */

    const tempExtraFirst =
        soccerExtraScoreValues.extraFirstTeam;

    soccerExtraScoreValues.extraFirstTeam =
        soccerExtraScoreValues.extraFirstOpponent;

    soccerExtraScoreValues.extraFirstOpponent =
        tempExtraFirst;


    const tempExtraSecond =
        soccerExtraScoreValues.extraSecondTeam;

    soccerExtraScoreValues.extraSecondTeam =
        soccerExtraScoreValues.extraSecondOpponent;

    soccerExtraScoreValues.extraSecondOpponent =
        tempExtraSecond;


    const tempPenalty =
        soccerExtraScoreValues.penaltyTeam;

    soccerExtraScoreValues.penaltyTeam =
        soccerExtraScoreValues.penaltyOpponent;

    soccerExtraScoreValues.penaltyOpponent =
        tempPenalty;


    /*
       ★ 入れ替えた値を
       内部保持値へ反映
    */

    saveSoccerExtraScoreValues();


    /*
       ★ ここでリアルタイム再計算
    */

    updateSoccerScoreboard();

}

/* =====================================================
   ⚽ input値設定
===================================================== */

function setSoccerInputValue(
    id,
    value
){

    const input =
        document.getElementById(id);


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
   ⚽ 延長 ON / OFF
===================================================== */

function toggleSoccerExtraPeriods(){

    const checkbox =
        document.getElementById(
            "soccerExtraEnabled"
        );


    const area =
        document.getElementById(
            "soccerExtraPeriods"
        );


    if(
        !checkbox ||
        !area
    ){

        return;

    }


    /*
       現在の入力値を保持
    */

    saveSoccerExtraScoreValues();


    soccerExtraPeriods.extra =
        checkbox.checked;


    if(
        soccerExtraPeriods.extra
    ){

        renderSoccerExtraPeriods();

        area.style.display =
            "";

    }
    else{

        /*
           OFFにしても
           点数自体は内部状態に残す。
        */

        area.style.display =
            "none";

    }


    updateSoccerScoreboard();

}


/* =====================================================
   ⚽ 延長入力値保持
===================================================== */

function saveSoccerExtraScoreValues(){

    const firstTeam =
        document.getElementById(
            "soccerEditTeamExtraFirstHalf"
        );


    const firstOpponent =
        document.getElementById(
            "soccerEditOpponentExtraFirstHalf"
        );


    const secondTeam =
        document.getElementById(
            "soccerEditTeamExtraSecondHalf"
        );


    const secondOpponent =
        document.getElementById(
            "soccerEditOpponentExtraSecondHalf"
        );


    const penaltyTeam =
        document.getElementById(
            "soccerEditTeamPenalty"
        );


    const penaltyOpponent =
        document.getElementById(
            "soccerEditOpponentPenalty"
        );


    if(firstTeam){

        soccerExtraScoreValues.extraFirstTeam =
            firstTeam.value;

    }


    if(firstOpponent){

        soccerExtraScoreValues.extraFirstOpponent =
            firstOpponent.value;

    }


    if(secondTeam){

        soccerExtraScoreValues.extraSecondTeam =
            secondTeam.value;

    }


    if(secondOpponent){

        soccerExtraScoreValues.extraSecondOpponent =
            secondOpponent.value;

    }


    if(penaltyTeam){

        soccerExtraScoreValues.penaltyTeam =
            penaltyTeam.value;

    }


    if(penaltyOpponent){

        soccerExtraScoreValues.penaltyOpponent =
            penaltyOpponent.value;

    }

}


/* =====================================================
   ⚽ 延長項目描画
===================================================== */

function renderSoccerExtraPeriods(){

    const area =
        document.getElementById(
            "soccerExtraPeriods"
        );


    if(!area){

        return;

    }


    /*
       現在の入力値を保持
    */

    saveSoccerExtraScoreValues();


    /*
       延長OFF
    */

    if(
        !soccerExtraPeriods.extra
    ){

        area.innerHTML =
            "";

        area.style.display =
            "none";

        return;

    }


    /*
       延長ON

       前半・後半を必ず両方表示。

       0-0でも表示される。
    */

    area.innerHTML = `

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
                value="${escapeSportsHTML(
                    soccerExtraScoreValues.extraFirstTeam
                )}"
            >

            <span>
                -
            </span>

            <input
                id="soccerEditOpponentExtraFirstHalf"
                class="soccer-score-input"
                type="number"
                min="0"
                inputmode="numeric"
                value="${escapeSportsHTML(
                    soccerExtraScoreValues.extraFirstOpponent
                )}"
            >

        </div>


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
                value="${escapeSportsHTML(
                    soccerExtraScoreValues.extraSecondTeam
                )}"
            >

            <span>
                -
            </span>

            <input
                id="soccerEditOpponentExtraSecondHalf"
                class="soccer-score-input"
                type="number"
                min="0"
                inputmode="numeric"
                value="${escapeSportsHTML(
                    soccerExtraScoreValues.extraSecondOpponent
                )}"
            >

        </div>

    `;


    area.style.display =
        "";

}


/* =====================================================
   ⚽ PK ON / OFF
===================================================== */

function toggleSoccerPenalty(){

    const checkbox =
        document.getElementById(
            "soccerPenaltyEnabled"
        );


    const area =
        document.getElementById(
            "soccerPenaltyPeriod"
        );


    if(
        !checkbox ||
        !area
    ){

        return;

    }


    saveSoccerExtraScoreValues();


    soccerExtraPeriods.penalty =
        checkbox.checked;


    if(
        soccerExtraPeriods.penalty
    ){

        renderSoccerPenalty();

        area.style.display =
            "";

    }
    else{

        area.style.display =
            "none";

    }


    updateSoccerScoreboard();

}


/* =====================================================
   ⚽ PK描画
===================================================== */

function renderSoccerPenalty(){

    const area =
        document.getElementById(
            "soccerPenaltyPeriod"
        );


    if(!area){

        return;

    }


    /*
       現在値を保持
    */

    saveSoccerExtraScoreValues();


    if(
        !soccerExtraPeriods.penalty
    ){

        area.innerHTML =
            "";

        area.style.display =
            "none";

        return;

    }


    area.innerHTML = `

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
                value="${escapeSportsHTML(
                    soccerExtraScoreValues.penaltyTeam
                )}"
            >

            <span>
                -
            </span>

            <input
                id="soccerEditOpponentPenalty"
                class="soccer-score-input"
                type="number"
                min="0"
                inputmode="numeric"
                value="${escapeSportsHTML(
                    soccerExtraScoreValues.penaltyOpponent
                )}"
            >

        </div>

    `;


    area.style.display =
        "";

}


/* =====================================================
   ⚽ 編集画面スコア合計 リアルタイム更新
===================================================== */

function updateSoccerScoreboard(){

    console.log(
        "⚽ updateSoccerScoreboard 実行"
    );


    /* =================================================
       現在表示されている編集フォーム
    ================================================= */

    const form =
        document.getElementById(
            "sportsGameEditForm"
        );


    if(!form){

        console.error(
            "❌ sportsGameEditForm が見つかりません"
        );

        return;

    }


    /* =================================================
       前半
    ================================================= */

    const teamFirst =
        getSoccerNumber(
            "soccerEditTeamFirstHalf"
        );

    const opponentFirst =
        getSoccerNumber(
            "soccerEditOpponentFirstHalf"
        );


    /* =================================================
       後半
    ================================================= */

    const teamSecond =
        getSoccerNumber(
            "soccerEditTeamSecondHalf"
        );

    const opponentSecond =
        getSoccerNumber(
            "soccerEditOpponentSecondHalf"
        );


    /* =================================================
       延長前半
    ================================================= */

    const teamExtraFirst =
        getSoccerNumber(
            "soccerEditTeamExtraFirstHalf"
        );

    const opponentExtraFirst =
        getSoccerNumber(
            "soccerEditOpponentExtraFirstHalf"
        );


    /* =================================================
       延長後半
    ================================================= */

    const teamExtraSecond =
        getSoccerNumber(
            "soccerEditTeamExtraSecondHalf"
        );

    const opponentExtraSecond =
        getSoccerNumber(
            "soccerEditOpponentExtraSecondHalf"
        );


    /* =================================================
       応援チーム基準で合計
       ★ PKは含めない
    ================================================= */

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


    /* =================================================
       ★★★ 重要 ★★★
       
       編集画面の「計」は
       
       応援チーム - 相手チーム
       
       の順番で固定する。

       ホーム / アウェイによる
       左右入れ替えはここでは絶対にしない。
    ================================================= */

    const displayTeamScore =
        teamTotal;

    const displayOpponentScore =
        opponentTotal;


    /* =================================================
       編集画面「計」
    ================================================= */

    const teamTotalElement =
        form.querySelector(
            "#soccerEditTeamTotal"
        );


    const opponentTotalElement =
        form.querySelector(
            "#soccerEditOpponentTotal"
        );


    if(teamTotalElement){

        teamTotalElement.textContent =
            String(displayTeamScore);

    }
    else{

        console.error(
            "❌ soccerEditTeamTotal が見つかりません"
        );

    }


    if(opponentTotalElement){

        opponentTotalElement.textContent =
            String(displayOpponentScore);

    }
    else{

        console.error(
            "❌ soccerEditOpponentTotal が見つかりません"
        );

    }


    /* =================================================
       上部の最終スコア
       
       編集画面ではこちらも
       
       応援チーム - 相手チーム
       
       の順番で固定
    ================================================= */

    const finalTeamScoreElement =
        form.querySelector(
            "#soccerEditFinalTeamScore"
        );


    const finalOpponentScoreElement =
        form.querySelector(
            "#soccerEditFinalOpponentScore"
        );


    if(finalTeamScoreElement){

        finalTeamScoreElement.textContent =
            String(displayTeamScore);

    }


    if(finalOpponentScoreElement){

        finalOpponentScoreElement.textContent =
            String(displayOpponentScore);

    }


    /* =================================================
       デバッグ確認
    ================================================= */

    console.log(
        "⚽ 編集画面スコア更新:",
        {
            teamFirst,
            teamSecond,
            teamExtraFirst,
            teamExtraSecond,

            opponentFirst,
            opponentSecond,
            opponentExtraFirst,
            opponentExtraSecond,

            teamTotal,
            opponentTotal,

            displayTeamScore,
            displayOpponentScore,

            teamTotalElementFound:
                !!teamTotalElement,

            opponentTotalElementFound:
                !!opponentTotalElement,

            teamTotalDisplayed:
                teamTotalElement?.textContent,

            opponentTotalDisplayed:
                opponentTotalElement?.textContent,

            finalTeamScoreDisplayed:
                finalTeamScoreElement?.textContent,

            finalOpponentScoreDisplayed:
                finalOpponentScoreElement?.textContent
        }
    );


    /* =================================================
       チーム名表示
    ================================================= */

    updateSoccerScoreTeamNames();

}

/* =====================================================
   ⚽ 入力イベント
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
            "試合日が設定されていません。\n" +
            "もう一度、カレンダーから試合日を選択してください。"
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


    const homeAwaySelect =
        document.getElementById(
            "soccerEditHomeAway"
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


    const extraCheckbox =
        document.getElementById(
            "soccerExtraEnabled"
        );


    const penaltyCheckbox =
        document.getElementById(
            "soccerPenaltyEnabled"
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


    /* =================================================
       現在の延長・PK状態
    ================================================= */

    soccerExtraPeriods.extra =
        extraCheckbox?.checked === true;


    soccerExtraPeriods.penalty =
        penaltyCheckbox?.checked === true;


    /*
       入力値を保持
    */

    saveSoccerExtraScoreValues();


    /* =================================================
       既存データ
    ================================================= */

    const games =
        getCurrentSoccerGames();


    const oldGame =
        games[sportsSelectedDate] ||
        {};


    /* =================================================
       保存データ
    ================================================= */

console.log(
    "⚽ 保存直前確認:",
    {
        homeAway:
            homeAwaySelect?.value,

        team:
            team,

        opponent:
            opponent,

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
            )
    }
);




    const game = {

        ...oldGame,


        team:
            team,

        opponent:
            opponent,


        homeAway:
            homeAwaySelect?.value ||
            "",


        location:
            locationInput?.value.trim() ||
            "",


        result:
            resultSelect?.value ||
            "",


        memo:
            memoInput?.value.trim() ||
            "",


        /* =========================
           前半
        ========================= */

        firstHalfTeam:
            getSoccerNumber(
                "soccerEditTeamFirstHalf"
            ),

        firstHalfOpponent:
            getSoccerNumber(
                "soccerEditOpponentFirstHalf"
            ),


        /* =========================
           後半
        ========================= */

        secondHalfTeam:
            getSoccerNumber(
                "soccerEditTeamSecondHalf"
            ),

        secondHalfOpponent:
            getSoccerNumber(
                "soccerEditOpponentSecondHalf"
            ),


        /* =========================
           延長
        ========================= */

        extraEnabled:
            soccerExtraPeriods.extra,


        /*
           旧形式との互換性も残す
        */

        extraFirstHalfEnabled:
            soccerExtraPeriods.extra,

        extraSecondHalfEnabled:
            soccerExtraPeriods.extra,


        extraFirstHalfTeam:
            Number(
                soccerExtraScoreValues.extraFirstTeam
            ) || 0,

        extraFirstHalfOpponent:
            Number(
                soccerExtraScoreValues.extraFirstOpponent
            ) || 0,


        extraSecondHalfTeam:
            Number(
                soccerExtraScoreValues.extraSecondTeam
            ) || 0,

        extraSecondHalfOpponent:
            Number(
                soccerExtraScoreValues.extraSecondOpponent
            ) || 0,


        /* =========================
           PK
        ========================= */

        penaltyEnabled:
            soccerExtraPeriods.penalty,


        penaltyTeam:
            Number(
                soccerExtraScoreValues.penaltyTeam
            ) || 0,

        penaltyOpponent:
            Number(
                soccerExtraScoreValues.penaltyOpponent
            ) || 0

    };

    console.log(
    "⚽ 保存 homeAway:",
    game.homeAway
);


    console.log(
        "⚽ 保存する game:",
        game
    );


    const saved =
        saveSoccerGameData(
            sportsSelectedDate,
            game
        );


    if(saved === false){

        alert(
            "⚽ 試合結果の保存に失敗しました。"
        );

        return;

    }


    console.log(
        "⚽ サッカー試合結果を保存:",
        game
    );


    /*
       結果画面へ
    */

    openSoccerGameDetailPage(
        sportsSelectedDate
    );

}


/* =====================================================
   ⚽ 数値取得
===================================================== */

function getSoccerNumber(id){

    const input =
        document.getElementById(id);


    if(!input){

        return 0;

    }


    if(input.value === ""){

        return 0;

    }


    const number =
        Number(input.value);


    return Number.isFinite(number)
        ?
        number
        :
        0;

}


/* =====================================================
   ⚽ サッカー専用保存
===================================================== */

function saveSoccerGameData(
    date,
    game
){

    if(!date){

        console.error(
            "❌ サッカー試合保存失敗：date がありません",
            date
        );

        return false;

    }


    if(
        !game ||
        typeof game !== "object"
    ){

        console.error(
            "❌ サッカー試合保存失敗：game が不正です",
            game
        );

        return false;

    }


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

        data.sportsCalendar.games =
            {};

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
        {
            ...game
        };


    db.save(data);


    console.log(
        "⚽ サッカー試合データ保存完了:",
        {
            date:
                date,

            selectedIndex:
                selectedIndex,

            game:
                data.sportsCalendar.games[
                    selectedIndex
                ][date]
        }
    );


    renderSportsCalendar();


    return true;

}


/* =====================================================
   ⚽ 編集キャンセル
===================================================== */

function cancelSoccerGameEdit(){

    closeSoccerGameEditPage();

}


/* =====================================================
   ⚽ 編集画面を閉じる
===================================================== */

function closeSoccerGameEditPage(){

    const editPage =
        document.getElementById(
            "sportsGameEditPage"
        );


    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );


    const sportsScreen =
        document.getElementById(
            "sportsCalendarScreen"
        );


    if(editPage){

        editPage.classList.remove(
            "active"
        );

        editPage.style.display =
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
   ⚽ 結果画面を開く
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


    const detailScreen =
        document.getElementById(
            "sportsGameDetailScreen"
        );


    const detail =
        document.getElementById(
            "sportsGameDetail"
        );


    if(
        !sportsPage ||
        !detailPage ||
        !detailScreen ||
        !detail
    ){

        console.error(
            "❌ スポーツ共通の結果画面が見つかりません"
        );

        return;

    }


    /* =========================
       カレンダーを非表示
    ========================= */

    sportsPage.classList.remove(
        "active"
    );

    sportsPage.style.display =
        "none";


    /* =========================
       結果画面を表示
    ========================= */

    detailPage.classList.add(
        "active"
    );

    detailPage.style.display =
        "block";


    detailScreen.style.display =
        "";


    /* =========================
       サッカー結果を描画
    ========================= */

    renderSoccerGameView(
        date
    );

}


/* =====================================================
   ⚽ 結果画面
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


    /*
       通常＋延長の合計
       PKは含めない
    */

    const teamTotal =
        calculateSoccerTotal(
            game
        );


    const opponentTotal =
        calculateSoccerOpponentTotal(
            game
        );

console.log(
    "⚽ 結果画面・保存データ確認:",
    {
        homeAway: game.homeAway,

        team: game.team,
        opponent: game.opponent,

        firstHalfTeam:
            game.firstHalfTeam,

        firstHalfOpponent:
            game.firstHalfOpponent,

        secondHalfTeam:
            game.secondHalfTeam,

        secondHalfOpponent:
            game.secondHalfOpponent,

        extraFirstHalfTeam:
            game.extraFirstHalfTeam,

        extraFirstHalfOpponent:
            game.extraFirstHalfOpponent,

        extraSecondHalfTeam:
            game.extraSecondHalfTeam,

        extraSecondHalfOpponent:
            game.extraSecondHalfOpponent,

        teamTotal:
            teamTotal,

        opponentTotal:
            opponentTotal
    }
);



        console.log(
    "⚽ 結果画面スコア確認:",
    {
        homeAway: game.homeAway,
        firstHalfTeam: game.firstHalfTeam,
        firstHalfOpponent: game.firstHalfOpponent,
        secondHalfTeam: game.secondHalfTeam,
        secondHalfOpponent: game.secondHalfOpponent,
        teamTotal: teamTotal,
        opponentTotal: opponentTotal
    }
);

    /* =================================================
       ホーム / アウェイ
    ================================================= */

/* =================================================
   ホーム / アウェイ
================================================= */

let homeTeam =
    team;

let awayTeam =
    opponent;

let homeScore =
    teamTotal;

let awayScore =
    opponentTotal;


/*
   応援チームがアウェイの場合

   ホーム ＝ 相手チーム
   アウェイ ＝ 応援チーム

   スコアも同じ順番にする。
*/

if(
    game.homeAway === "away"
){

    homeTeam =
        opponent;

    awayTeam =
        team;

    homeScore =
        opponentTotal;

    awayScore =
        teamTotal;

}


    /* =================================================
       結果
    ================================================= */

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


/* =================================================
   スコア行
   内部データは「応援チーム基準」
   表示時に「ホーム・アウェイ順」へ変換する
================================================= */

const rows = [];


/* =================================================
   ホーム・アウェイ判定
================================================= */

const isAway =
    game.homeAway === "away";


/* =================================================
   前半
================================================= */

rows.push({

    label:
        "前半",

    home:
        isAway
        ?
        Number(game.firstHalfOpponent) || 0
        :
        Number(game.firstHalfTeam) || 0,

    away:
        isAway
        ?
        Number(game.firstHalfTeam) || 0
        :
        Number(game.firstHalfOpponent) || 0

});


/* =================================================
   後半
================================================= */

rows.push({

    label:
        "後半",

    home:
        isAway
        ?
        Number(game.secondHalfOpponent) || 0
        :
        Number(game.secondHalfTeam) || 0,

    away:
        isAway
        ?
        Number(game.secondHalfTeam) || 0
        :
        Number(game.secondHalfOpponent) || 0

});


/* =================================================
   延長
================================================= */

const extraEnabled =
    game.extraEnabled === true ||
    game.extraFirstHalfEnabled === true ||
    game.extraSecondHalfEnabled === true;


if(extraEnabled){

    rows.push({

        label:
            "延長前半",

        home:
            isAway
            ?
            Number(game.extraFirstHalfOpponent) || 0
            :
            Number(game.extraFirstHalfTeam) || 0,

        away:
            isAway
            ?
            Number(game.extraFirstHalfTeam) || 0
            :
            Number(game.extraFirstHalfOpponent) || 0

    });


    rows.push({

        label:
            "延長後半",

        home:
            isAway
            ?
            Number(game.extraSecondHalfOpponent) || 0
            :
            Number(game.extraSecondHalfTeam) || 0,

        away:
            isAway
            ?
            Number(game.extraSecondHalfTeam) || 0
            :
            Number(game.extraSecondHalfOpponent) || 0

    });

}


/* =================================================
   PK
   PKもホーム・アウェイ順
   ただし「計」には含めない
================================================= */

const penaltyEnabled =
    game.penaltyEnabled === true;


if(penaltyEnabled){

    rows.push({

        label:
            "PK",

        home:
            isAway
            ?
            Number(game.penaltyOpponent) || 0
            :
            Number(game.penaltyTeam) || 0,

        away:
            isAway
            ?
            Number(game.penaltyTeam) || 0
            :
            Number(game.penaltyOpponent) || 0

    });

}


    /* =================================================
       スコア行HTML
    ================================================= */

    let rowsHTML = "";


rows.forEach(
    row => {

        rowsHTML += `

            <div class="soccer-view-score-row">

                <div class="soccer-view-period">
                    ${escapeSportsHTML(
                        row.label
                    )}
                </div>

                <strong>
                    ${row.home}
                </strong>

                <span>
                    -
                </span>

                <strong>
                    ${row.away}
                </strong>

            </div>

        `;

    }
);


    /* =================================================
       日付
    ================================================= */

    const dateObject =
        new Date(
            `${date}T00:00:00`
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


    const formattedDate =
        `${dateObject.getFullYear()}年` +
        `${dateObject.getMonth() + 1}月` +
        `${dateObject.getDate()}日` +
        `（${weekdays[
            dateObject.getDay()
        ]}）`;


    /* =================================================
       結果画面HTML
    ================================================= */

    page.innerHTML = `

        <div class="soccer-game-view">


            <div class="soccer-view-date">
                ${escapeSportsHTML(
                    formattedDate
                )}
            </div>


            <div class="soccer-view-match">

                <div class="soccer-view-team">

                    <small>
                        🏠 ホーム
                    </small>

                    ${escapeSportsHTML(
                        homeTeam
                    )}

                </div>


                <div class="soccer-view-final">

                    <strong>
                        ${homeScore}
                    </strong>

                    <span>
                        -
                    </span>

                    <strong>
                        ${awayScore}
                    </strong>

                </div>


                <div class="soccer-view-team">

                    <small>
                        ✈️ アウェイ
                    </small>

                    ${escapeSportsHTML(
                        awayTeam
                    )}

                </div>

            </div>


            <div class="soccer-view-scoreboard">

                ${rowsHTML}


                <div class="soccer-view-score-row total">

                    <div class="soccer-view-period">
                        計
                    </div>

                    <strong>
                        ${homeScore}
                    </strong>

                    <span>
                        -
                    </span>

                    <strong>
                        ${awayScore}
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
                    📍 ${escapeSportsHTML(
                        game.location
                    )}
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
                        ${escapeSportsHTML(
                            game.memo
                        )}
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


    closeSoccerGameDetailPage();

}


/* =====================================================
   ⚽ HTMLエスケープ
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
   ⚽ 編集HTML読み込み
===================================================== */

async function loadSoccerGameEditHTML(){

    const container =
        document.getElementById(
            "sportsGameEditContainer"
        );


    if(!container){

        console.error(
            "❌ sportsGameEditContainer が見つかりません"
        );

        return false;

    }


    try{

        const response =
            await fetch(
                "./sports-soccer-edit.html"
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
            "sports-baseball-edit.html（サッカー）読み込み成功"
        );


        return true;

    }
    catch(error){

        console.error(
            "sports-baseball-edit.html（サッカー）の読み込みに失敗:",
            error
        );

        return false;

    }

}



/* =====================================================
   ⚽ 結果HTML読み込み
===================================================== */

async function loadSoccerGameDetailHTML(){

    const container =
        document.getElementById(
            "sportsGameDetailContainer"
        );


    if(!container){

        console.error(
            "❌ sportsGameDetailContainer が見つかりません"
        );

        return false;

    }


    try{

        const response =
            await fetch(
                "./sports-soccer-detail.html"
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
            "⚽ sports-soccer-detail.html 読み込み成功"
        );


        return true;

    }
    catch(error){

        console.error(
            "⚽ sports-soccer-detail.html の読み込みに失敗:",
            error
        );

        return false;

    }

}