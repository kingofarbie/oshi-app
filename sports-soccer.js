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

/*
   延長・PKの入力値を保持するための状態

   HTMLを再描画しても、
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

   同じ選択肢を連続変更したときに
   スコアを二重交換しないために使用
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
   ⚽ 編集画面を開く
===================================================== */

async function openSoccerGameEditPage(date){

    hideSportsSubPages();


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
            "❌ スポーツカレンダーまたは編集ページが見つかりません"
        );

        return;

    }


    sportsSelectedDate =
        date;


    sportsPage.style.display =
        "none";


    editPage.style.display =
        "block";

    editPage.classList.add(
        "active"
    );


    console.log(
        "① サッカー編集ページ表示開始"
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


    console.log(
        "③ サッカー編集HTML読み込み完了"
    );


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


    /*
       現在の試合データ
    */

    const games =
        getCurrentSoccerGames();

    const game =
        games[sportsSelectedDate] ||
        {};


    console.log(
        "⚽ 編集画面読み込み game:",
        game
    );


    /*
       延長・PK状態を
       現在の保存データから初期化
    */

    soccerExtraPeriods = {

        extraFirstHalf:
            game.extraFirstHalfEnabled === true,

        extraSecondHalf:
            game.extraSecondHalfEnabled === true,

        penalty:
            game.penaltyEnabled === true

    };


    /*
       延長・PK点数を初期化

       既存保存データがあれば読み込む
    */

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


    /*
       ホーム / アウェイ状態
    */

    soccerPreviousHomeAway =
        game.homeAway || "";


    /*
       基本HTML
    */

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


                <!-- =====================
                     前半
                ====================== -->

                <div class="soccer-score-row">

                    <div>
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


                <!-- =====================
                     後半
                ====================== -->

                <div class="soccer-score-row">

                    <div>
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


                <!-- =====================
                     延長
                ====================== -->

                <div class="soccer-extra-header">

                    <span>
                        延長
                    </span>

                    <button
                        type="button"
                        id="soccerExtraToggleButton"
                        onclick="toggleSoccerExtraPeriods()"
                    >
                        ＋
                    </button>

                </div>


                <div
                    id="soccerExtraPeriods"
                    style="display:none;"
                >
                </div>


                <!-- =====================
                     PK
                ====================== -->

                <div class="soccer-extra-header">

                    <span>
                        PK
                    </span>

                    <button
                        type="button"
                        id="soccerPenaltyToggleButton"
                        onclick="toggleSoccerPenalty()"
                    >
                        ＋
                    </button>

                </div>


                <div
                    id="soccerPenaltyPeriod"
                    style="display:none;"
                >
                </div>


                <!-- =====================
                     合計
                ====================== -->

                <div class="soccer-score-row total">

                    <div>
                        計
                    </div>

                    <strong id="soccerEditTeamTotal">
                        0
                    </strong>

                    <span>
                        -
                    </span>

                    <strong id="soccerEditOpponentTotal">
                        0
                    </strong>

                </div>


            </section>


            <!-- =====================
                 会場
            ====================== -->

            <label>
                📍 会場
            </label>

            <input
                type="text"
                id="soccerEditLocation"
                autocomplete="off"
            >


            <!-- =====================
                 結果
            ====================== -->

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


            <!-- =====================
                 メモ
            ====================== -->

            <label>
                📝 メモ
            </label>

            <textarea
                id="soccerEditMemo"
            ></textarea>


            <!-- =====================
                 ボタン
            ====================== -->

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


    /*
       基本データ
    */

    const team =
        game.team ||
        "";

    const opponent =
        game.opponent ||
        "";


    document.getElementById(
        "soccerEditTeam"
    ).value =
        team;


    document.getElementById(
        "soccerEditOpponent"
    ).value =
        opponent;


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


    /*
       前半・後半
    */

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


    /*
       ホーム / アウェイ変更
    */

    const homeAwaySelect =
        document.getElementById(
            "soccerEditHomeAway"
        );


    if(homeAwaySelect){

        homeAwaySelect.addEventListener(
            "change",
            function(){

                const newHomeAway =
                    homeAwaySelect.value;


                /*
                   未設定 → home
                   未設定 → away

                   の場合はスコア交換不要。

                   home ↔ away のときだけ
                   左右のスコアを交換する。
                */

                if(
                    soccerPreviousHomeAway &&
                    newHomeAway &&
                    soccerPreviousHomeAway !==
                        newHomeAway
                ){

                    swapSoccerHomeAwayScores();

                }


                soccerPreviousHomeAway =
                    newHomeAway;


                updateSoccerScoreTeamNames();

                updateSoccerScoreboard();

            }
        );

    }


    /*
       延長・PKを描画
    */

    renderSoccerExtraPeriods();

    renderSoccerPenalty();


    /*
       初期表示
    */

    updateSoccerScoreTeamNames();

    updateSoccerScoreboard();

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


    /*
       延長・PKの内部保持値も
       同時に交換
    */

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
   ⚽ 延長項目を追加
===================================================== */

function addSoccerExtraPeriod(){

    /*
       延長前半
    */

    if(
        !soccerExtraPeriods.extraFirstHalf
    ){

        soccerExtraPeriods.extraFirstHalf =
            true;

    }
    else if(
        !soccerExtraPeriods.extraSecondHalf
    ){

        soccerExtraPeriods.extraSecondHalf =
            true;

    }
    else{

        return;

    }


    renderSoccerExtraPeriods();

    updateSoccerScoreboard();

}


/* =====================================================
   ⚽ 延長 ＋ / －
===================================================== */

function toggleSoccerExtraPeriods(){

    const area =
        document.getElementById(
            "soccerExtraPeriods"
        );

    const button =
        document.getElementById(
            "soccerExtraToggleButton"
        );


    if(!area){

        return;

    }


    /*
       まだ延長が追加されていない
       → 延長前半を追加
    */

    if(
        !soccerExtraPeriods.extraFirstHalf
    ){

        soccerExtraPeriods.extraFirstHalf =
            true;

        area.style.display =
            "";

        renderSoccerExtraPeriods();

        updateSoccerScoreboard();

        return;

    }


    /*
       すでに延長が追加されている
       → 開閉
    */

    if(
        area.style.display === "none"
    ){

        area.style.display =
            "";

        if(button){

            button.textContent =
                "－";

        }

    }
    else{

        /*
           閉じるだけ。
           HTMLは削除しない。
           → 点数保持
        */

        area.style.display =
            "none";

        if(button){

            button.textContent =
                "＋";

        }

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

    const button =
        document.getElementById(
            "soccerExtraToggleButton"
        );


    if(!area){

        return;

    }


    /*
       現在の入力値を回収

       再描画前に必ず保存する
    */

    soccerExtraScoreValues.extraFirstTeam =
        document.getElementById(
            "soccerEditTeamExtraFirstHalf"
        )?.value ??
        soccerExtraScoreValues.extraFirstTeam;

    soccerExtraScoreValues.extraFirstOpponent =
        document.getElementById(
            "soccerEditOpponentExtraFirstHalf"
        )?.value ??
        soccerExtraScoreValues.extraFirstOpponent;

    soccerExtraScoreValues.extraSecondTeam =
        document.getElementById(
            "soccerEditTeamExtraSecondHalf"
        )?.value ??
        soccerExtraScoreValues.extraSecondTeam;

    soccerExtraScoreValues.extraSecondOpponent =
        document.getElementById(
            "soccerEditOpponentExtraSecondHalf"
        )?.value ??
        soccerExtraScoreValues.extraSecondOpponent;


    /*
       延長が存在しない場合
    */

    if(
        !soccerExtraPeriods.extraFirstHalf &&
        !soccerExtraPeriods.extraSecondHalf
    ){

        area.innerHTML =
            "";

        area.style.display =
            "none";


        if(button){

            button.textContent =
                "＋";

        }

        return;

    }


    let html = "";


    /*
       延長前半
    */

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

        `;

    }


    /*
       延長後半
    */

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

    }


    area.innerHTML =
        html;


    /*
       ＋ / － ボタン
    */

    if(button){

        button.textContent =
            area.style.display === "none"
            ?
            "＋"
            :
            "－";

    }

}


/* =====================================================
   ⚽ PK ＋ / －
===================================================== */

function toggleSoccerPenalty(){

    const area =
        document.getElementById(
            "soccerPenaltyPeriod"
        );

    const button =
        document.getElementById(
            "soccerPenaltyToggleButton"
        );


    if(!area){

        return;

    }


    /*
       初回
       → PKを追加
    */

    if(
        !soccerExtraPeriods.penalty
    ){

        soccerExtraPeriods.penalty =
            true;

        renderSoccerPenalty();

        area.style.display =
            "";

        if(button){

            button.textContent =
                "－";

        }

        updateSoccerScoreboard();

        return;

    }


    /*
       開閉
    */

    if(
        area.style.display === "none"
    ){

        area.style.display =
            "";

        if(button){

            button.textContent =
                "－";

        }

    }
    else{

        area.style.display =
            "none";

        if(button){

            button.textContent =
                "＋";

        }

    }

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

    soccerExtraScoreValues.penaltyTeam =
        document.getElementById(
            "soccerEditTeamPenalty"
        )?.value ??
        soccerExtraScoreValues.penaltyTeam;

    soccerExtraScoreValues.penaltyOpponent =
        document.getElementById(
            "soccerEditOpponentPenalty"
        )?.value ??
        soccerExtraScoreValues.penaltyOpponent;


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

}




/* =====================================================
   ⚽ スコア計算
===================================================== */

function updateSoccerScoreboard(){

    const teamFirst =
        getSoccerNumber(
            "soccerEditTeamFirstHalf"
        );

    const opponentFirst =
        getSoccerNumber(
            "soccerEditOpponentFirstHalf"
        );


    const teamSecond =
        getSoccerNumber(
            "soccerEditTeamSecondHalf"
        );

    const opponentSecond =
        getSoccerNumber(
            "soccerEditOpponentSecondHalf"
        );


    const teamExtraFirst =
        getSoccerNumber(
            "soccerEditTeamExtraFirstHalf"
        );

    const opponentExtraFirst =
        getSoccerNumber(
            "soccerEditOpponentExtraFirstHalf"
        );


    const teamExtraSecond =
        getSoccerNumber(
            "soccerEditTeamExtraSecondHalf"
        );

    const opponentExtraSecond =
        getSoccerNumber(
            "soccerEditOpponentExtraSecondHalf"
        );


    /*
       内部保持値も更新
    */

    if(
        soccerExtraPeriods.extraFirstHalf
    ){

        soccerExtraScoreValues.extraFirstTeam =
            document.getElementById(
                "soccerEditTeamExtraFirstHalf"
            )?.value ??
            soccerExtraScoreValues.extraFirstTeam;

        soccerExtraScoreValues.extraFirstOpponent =
            document.getElementById(
                "soccerEditOpponentExtraFirstHalf"
            )?.value ??
            soccerExtraScoreValues.extraFirstOpponent;

    }


    if(
        soccerExtraPeriods.extraSecondHalf
    ){

        soccerExtraScoreValues.extraSecondTeam =
            document.getElementById(
                "soccerEditTeamExtraSecondHalf"
            )?.value ??
            soccerExtraScoreValues.extraSecondTeam;

        soccerExtraScoreValues.extraSecondOpponent =
            document.getElementById(
                "soccerEditOpponentExtraSecondHalf"
            )?.value ??
            soccerExtraScoreValues.extraSecondOpponent;

    }


    if(
        soccerExtraPeriods.penalty
    ){

        soccerExtraScoreValues.penaltyTeam =
            document.getElementById(
                "soccerEditTeamPenalty"
            )?.value ??
            soccerExtraScoreValues.penaltyTeam;

        soccerExtraScoreValues.penaltyOpponent =
            document.getElementById(
                "soccerEditOpponentPenalty"
            )?.value ??
            soccerExtraScoreValues.penaltyOpponent;

    }


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


    if(teamTotalElement){

        teamTotalElement.textContent =
            teamTotal;

    }


    if(opponentTotalElement){

        opponentTotalElement.textContent =
            opponentTotal;

    }


    /*
       チーム名も更新
    */

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

        console.error(
            "❌ sportsSelectedDate が空です:",
            sportsSelectedDate
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


    /*
       延長・PKの現在値を取得
    */

    soccerExtraScoreValues.extraFirstTeam =
        document.getElementById(
            "soccerEditTeamExtraFirstHalf"
        )?.value ??
        soccerExtraScoreValues.extraFirstTeam;

    soccerExtraScoreValues.extraFirstOpponent =
        document.getElementById(
            "soccerEditOpponentExtraFirstHalf"
        )?.value ??
        soccerExtraScoreValues.extraFirstOpponent;


    soccerExtraScoreValues.extraSecondTeam =
        document.getElementById(
            "soccerEditTeamExtraSecondHalf"
        )?.value ??
        soccerExtraScoreValues.extraSecondTeam;

    soccerExtraScoreValues.extraSecondOpponent =
        document.getElementById(
            "soccerEditOpponentExtraSecondHalf"
        )?.value ??
        soccerExtraScoreValues.extraSecondOpponent;


    soccerExtraScoreValues.penaltyTeam =
        document.getElementById(
            "soccerEditTeamPenalty"
        )?.value ??
        soccerExtraScoreValues.penaltyTeam;

    soccerExtraScoreValues.penaltyOpponent =
        document.getElementById(
            "soccerEditOpponentPenalty"
        )?.value ??
        soccerExtraScoreValues.penaltyOpponent;


    /*
       既存データを取得して保持
    */

    const games =
        getCurrentSoccerGames();

    const oldGame =
        games[sportsSelectedDate] ||
        {};


    /*
       保存データ
    */

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
            Number(
                soccerExtraScoreValues.extraFirstTeam
            ) || 0,

        extraFirstHalfOpponent:
            Number(
                soccerExtraScoreValues.extraFirstOpponent
            ) || 0,


        extraSecondHalfEnabled:
            soccerExtraPeriods.extraSecondHalf,

        extraSecondHalfTeam:
            Number(
                soccerExtraScoreValues.extraSecondTeam
            ) || 0,

        extraSecondHalfOpponent:
            Number(
                soccerExtraScoreValues.extraSecondOpponent
            ) || 0,


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
        "⚽ 保存直前 homeAway:",
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


    if(
        !sportsPage ||
        !detailPage
    ){

        console.error(
            "❌ スポーツカレンダーまたは結果画面が見つかりません"
        );

        return;

    }


    sportsPage.classList.remove(
        "active"
    );

    sportsPage.style.display =
        "none";


    detailPage.classList.add(
        "active"
    );

    detailPage.style.display =
        "block";


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


    const teamTotal =
        calculateSoccerTotal(
            game
        );

    const opponentTotal =
        calculateSoccerOpponentTotal(
            game
        );


    /*
       ホーム / アウェイ
    */

    let homeTeam =
        team;

    let awayTeam =
        opponent;

    let homeScore =
        teamTotal;

    let awayScore =
        opponentTotal;


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


    /*
       結果
    */

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


    /*
       各スコア行
    */

    const rows = [];


    rows.push({

        label:
            "前半",

        team:
            Number(game.firstHalfTeam) || 0,

        opponent:
            Number(game.firstHalfOpponent) || 0,

        always:
            true

    });


    rows.push({

        label:
            "後半",

        team:
            Number(game.secondHalfTeam) || 0,

        opponent:
            Number(game.secondHalfOpponent) || 0,

        always:
            true

    });


    /*
       延長前半

       どちらかに実際の得点がある場合のみ表示
    */

    if(
        Number(game.extraFirstHalfTeam) > 0 ||
        Number(game.extraFirstHalfOpponent) > 0
    ){

        rows.push({

            label:
                "延長前半",

            team:
                Number(game.extraFirstHalfTeam) || 0,

            opponent:
                Number(game.extraFirstHalfOpponent) || 0

        });

    }


    /*
       延長後半
    */

    if(
        Number(game.extraSecondHalfTeam) > 0 ||
        Number(game.extraSecondHalfOpponent) > 0
    ){

        rows.push({

            label:
                "延長後半",

            team:
                Number(game.extraSecondHalfTeam) || 0,

            opponent:
                Number(game.extraSecondHalfOpponent) || 0

        });

    }


    /*
       PK

       延長がなくても
       PKだけ入力されていれば表示
    */

    if(
        Number(game.penaltyTeam) > 0 ||
        Number(game.penaltyOpponent) > 0
    ){

        rows.push({

            label:
                "PK",

            team:
                Number(game.penaltyTeam) || 0,

            opponent:
                Number(game.penaltyOpponent) || 0

        });

    }


    /*
       スコア行HTML
    */

    let rowsHTML = "";


    rows.forEach(
        row => {

            let leftScore =
                row.team;

            let rightScore =
                row.opponent;


            /*
               結果画面も
               ホーム / アウェイ順にする
            */

            if(
                game.homeAway === "away"
            ){

                leftScore =
                    row.opponent;

                rightScore =
                    row.team;

            }


            rowsHTML += `

                <div class="soccer-view-score-row">

                    <div class="soccer-view-period">
                        ${escapeSportsHTML(
                            row.label
                        )}
                    </div>

                    <strong>
                        ${leftScore}
                    </strong>

                    <span>
                        -
                    </span>

                    <strong>
                        ${rightScore}
                    </strong>

                </div>

            `;

        }
    );


    /*
       日付
    */

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


    /*
       結果画面HTML
    */

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

    }
    catch(error){

        console.error(
            "sports-game-edit.html（サッカー）の読み込みに失敗:",
            error
        );

        return false;

    }

}