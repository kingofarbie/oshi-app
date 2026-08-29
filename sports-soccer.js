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

    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );

    const editPage =
        document.getElementById(
            "sportsGameEditPage"
        );

    if(!sportsPage || !editPage){

        console.error(
            "スポーツカレンダーまたは編集ページが見つかりません"
        );

        return;

    }

    sportsSelectedDate = date;

    sportsPage.style.display = "none";

    editPage.style.display = "block";
    editPage.classList.add("active");


    console.log(
        "① サッカー編集ページ表示開始"
    );


    const loaded =
        await loadSportsGameEditHTML();


    console.log(
        "② 共通編集HTML読み込み結果:",
        loaded
    );


    if(!loaded){

        console.error(
            "③ 編集HTMLの読み込みに失敗"
        );

        return;

    }


    console.log(
        "③ 共通編集HTML読み込み完了"
    );


    renderSoccerGameEditForm();


    console.log(
        "④ サッカー編集フォーム描画完了"
    );

}









/* =====================================================
   ⚽ サッカー編集フォーム描画
===================================================== */

function renderSoccerGameEditForm(){

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
            "❌ sportsSelectedDate がありません"
        );

        return;

    }


    /* =========================
       現在の試合データ
    ========================= */

    const games =
        getCurrentSoccerGames();

    const game =
        games[sportsSelectedDate] ||
        {};


    console.log(
        "⚽ 編集画面読み込み game:",
        game
    );


    /* =========================
       現在の応援チーム
    ========================= */

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
        game.team ||
        current?.team ||
        "";

    const opponent =
        game.opponent ||
        "";


    /* =========================
       編集フォーム
    ========================= */

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


            <!-- =====================
                 スコア
            ===================== -->

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


                <div class="soccer-score-row">

                    <div>
                        前半
                    </div>

                    <input
                        id="soccerEditTeamFirstHalf"
                        class="soccer-score-input"
                        type="number"
                        min="0"
                        inputmode="numeric"
                        placeholder="0"
                    >

                    <span>
                        -
                    </span>

                    <input
                        id="soccerEditOpponentFirstHalf"
                        class="soccer-score-input"
                        type="number"
                        min="0"
                        inputmode="numeric"
                        placeholder="0"
                    >

                </div>


                <div class="soccer-score-row">

                    <div>
                        後半
                    </div>

                    <input
                        id="soccerEditTeamSecondHalf"
                        class="soccer-score-input"
                        type="number"
                        min="0"
                        inputmode="numeric"
                        placeholder="0"
                    >

                    <span>
                        -
                    </span>

                    <input
                        id="soccerEditOpponentSecondHalf"
                        class="soccer-score-input"
                        type="number"
                        min="0"
                        inputmode="numeric"
                        placeholder="0"
                    >

                </div>


                <!-- 延長・PK -->

                <div id="soccerExtraPeriods"></div>


                <button
                    type="button"
                    id="soccerAddPeriodButton"
                    onclick="addSoccerExtraPeriod()"
                >
                    ＋ 延長前半を追加
                </button>


                <!-- 合計 -->

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
                 会場・結果・メモ
            ===================== -->

            <label>
                📍 会場
            </label>

            <input
                type="text"
                id="soccerEditLocation"
                placeholder="会場名"
                autocomplete="off"
            >


            <label>
                試合結果
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


            <label>
                📝 メモ
            </label>

            <textarea
                id="soccerEditMemo"
                placeholder="メモ"
            ></textarea>


            <!-- =====================
                 ボタン
            ===================== -->

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


    /* =========================
       入力欄取得
    ========================= */

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


    /* =========================
       タイトル
    ========================= */

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


    /* =========================
       基本データ復元
    ========================= */

    if(teamInput){

        teamInput.value =
            team;

    }


    if(opponentInput){

        opponentInput.value =
            opponent;

    }


    if(homeAwaySelect){

        homeAwaySelect.value =
            game.homeAway ||
            "";

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


    /* =========================
       スコア復元
    ========================= */

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


    /* =========================
       延長・PK状態
    ========================= */

    soccerExtraPeriods = {

        extraFirstHalf:
            game.extraFirstHalfEnabled === true,

        extraSecondHalf:
            game.extraSecondHalfEnabled === true,

        penalty:
            game.penaltyEnabled === true

    };


    /* =========================
       延長・PK欄描画
    ========================= */

    renderSoccerExtraPeriods();


    /* =========================
       延長・PKスコア復元
    ========================= */

    setSoccerInputValue(
        "soccerEditTeamExtraFirstHalf",
        game.extraFirstHalfTeam
    );

    setSoccerInputValue(
        "soccerEditOpponentExtraFirstHalf",
        game.extraFirstHalfOpponent
    );

    setSoccerInputValue(
        "soccerEditTeamExtraSecondHalf",
        game.extraSecondHalfTeam
    );

    setSoccerInputValue(
        "soccerEditOpponentExtraSecondHalf",
        game.extraSecondHalfOpponent
    );

    setSoccerInputValue(
        "soccerEditTeamPenalty",
        game.penaltyTeam
    );

    setSoccerInputValue(
        "soccerEditOpponentPenalty",
        game.penaltyOpponent
    );


    /* =========================
       ホーム・アウェイ変更
    ========================= */

    if(homeAwaySelect){

        homeAwaySelect.addEventListener(
            "change",
            updateSoccerScoreTeamNames
        );

    }


    /* =========================
       初期表示
    ========================= */

    updateSoccerScoreTeamNames();

    updateSoccerScoreboard();


    console.log(
        "④ サッカー編集フォーム描画完了"
    );

}


/* =====================================================
   ⚽ ホーム・アウェイによるチーム名変更
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
   ⚽ input値設定
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
   ⚽ 延長・PK追加 / 開閉
===================================================== */

function addSoccerExtraPeriod(){

    /*
       まだ追加されていない項目を順番に追加
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
    else if(
        !soccerExtraPeriods.penalty
    ){

        soccerExtraPeriods.penalty =
            true;

    }
    else{

        /*
           全部追加済みなら
           開閉だけ切り替える
        */

        toggleSoccerExtraPeriods();

        return;

    }


    renderSoccerExtraPeriods();

    updateSoccerScoreboard();

}


/* =====================================================
   ⚽ 延長・PK表示部分の開閉
===================================================== */

function toggleSoccerExtraPeriods(){

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


    const isClosed =
        area.style.display === "none";


    if(isClosed){

        /*
           開く
        */

        area.style.display =
            "";

        if(button){

            button.textContent =
                "－ 延長・PKを閉じる";

        }

    }
    else{

        /*
           閉じる
           ※ innerHTML は変更しない
           → 入力した点数を保持
        */

        area.style.display =
            "none";

        if(button){

            button.textContent =
                "＋ 延長・PKを開く";

        }

    }

}


/* =====================================================
   ⚽ 追加項目描画
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


    /*
       現在の表示状態を保持
       再描画時に勝手に閉じないようにする
    */

    const wasClosed =
        area.style.display === "none";


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


    /*
       追加できるものが残っているか
    */

    const allAdded =
        soccerExtraPeriods.extraFirstHalf &&
        soccerExtraPeriods.extraSecondHalf &&
        soccerExtraPeriods.penalty;


    if(button){

        if(allAdded){

            /*
               全部追加済み
               ＋追加ではなく
               開閉ボタンにする
            */

            button.style.display =
                "";

            button.onclick =
                toggleSoccerExtraPeriods;


            if(wasClosed){

                button.textContent =
                    "＋ 延長・PKを開く";

            }
            else{

                button.textContent =
                    "－ 延長・PKを閉じる";

            }

        }
        else{

            /*
               まだ追加できる
            */

            button.onclick =
                addSoccerExtraPeriod;

            button.style.display =
                "";

            if(
                !soccerExtraPeriods.extraFirstHalf
            ){

                button.textContent =
                    "＋ 延長前半を追加";

            }
            else if(
                !soccerExtraPeriods.extraSecondHalf
            ){

                button.textContent =
                    "＋ 延長後半を追加";

            }
            else if(
                !soccerExtraPeriods.penalty
            ){

                button.textContent =
                    "＋ PKを追加";

            }

        }

    }


    /*
       閉じていた場合は
       再描画後も閉じたままにする
    */

    if(wasClosed){

        area.style.display =
            "none";

    }

}

/* =====================================================
   ⚽ スコアリアルタイム更新
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


    updateSoccerScoreTeamNames();

}


/* =====================================================
   ⚽ リアルタイム入力監視
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
   ⚽ サッカー試合保存
===================================================== */

function saveSoccerGameEdit(){

    /* =========================
       試合日チェック
    ========================= */

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


    /* =========================
       入力欄取得
    ========================= */

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


    /* =========================
       チーム名
    ========================= */

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


    /* =========================
       サッカー試合データ
    ========================= */

    const game = {

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


        /* 前半 */

        firstHalfTeam:
            getSoccerNumber(
                "soccerEditTeamFirstHalf"
            ),

        firstHalfOpponent:
            getSoccerNumber(
                "soccerEditOpponentFirstHalf"
            ),


        /* 後半 */

        secondHalfTeam:
            getSoccerNumber(
                "soccerEditTeamSecondHalf"
            ),

        secondHalfOpponent:
            getSoccerNumber(
                "soccerEditOpponentSecondHalf"
            ),


        /* 延長前半 */

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


        /* 延長後半 */

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


        /* PK */

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


    /* =========================
       保存前ログ
    ========================= */

    console.log(
        "⚽ 保存直前 homeAway:",
        game.homeAway
    );

    console.log(
        "⚽ 保存する game:",
        game
    );


    /* =========================
       サッカー専用保存
    ========================= */

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


    /* =========================
       結果画面へ
    ========================= */

    openSoccerGameDetailPage(
        sportsSelectedDate
    );

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

function saveSoccerGameData(
    date,
    game
){

    /* =========================
       基本チェック
    ========================= */

    if(!date){

        console.error(
            "❌ サッカー試合保存失敗：date がありません",
            date
        );

        return false;

    }


    if(!game || typeof game !== "object"){

        console.error(
            "❌ サッカー試合保存失敗：game が不正です",
            game
        );

        return false;

    }


    /* =========================
       DB取得
    ========================= */

    const data =
        db.load();


    /* =========================
       sportsCalendar 初期化
    ========================= */

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


    /* =========================
       現在選択中スポーツ
    ========================= */

    const selectedIndex =
        typeof data.sportsCalendar.selectedIndex === "number"
        ?
        data.sportsCalendar.selectedIndex
        :
        0;


    /* =========================
       スポーツ別 games 初期化
    ========================= */

    if(
        !data.sportsCalendar.games[selectedIndex] ||
        typeof data.sportsCalendar.games[selectedIndex] !== "object"
    ){

        data.sportsCalendar.games[selectedIndex] =
            {};

    }


    /* =========================
       サッカー試合データ保存
    ========================= */

    data.sportsCalendar.games[selectedIndex][date] =
        {
            ...game
        };


    /* =========================
       DB保存
    ========================= */

    db.save(data);


    console.log(
        "⚽ サッカー試合データ保存完了:",
        {
            date:
                date,

            selectedIndex:
                selectedIndex,

            game:
                data.sportsCalendar.games[selectedIndex][date]
        }
    );


    /* =========================
       カレンダー更新
    ========================= */

    renderSportsCalendar();


    return true;

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



/*
   ホーム・アウェイを判定
*/

let homeTeam =
    team;

let awayTeam =
    opponent;


let homeScore =
    teamTotal;

let awayScore =
    opponentTotal;


if(game.homeAway === "away"){

    homeTeam =
        opponent;

    awayTeam =
        team;

    homeScore =
        opponentTotal;

    awayScore =
        teamTotal;

}



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

        <small>
            🏠 ホーム
        </small>

        ${escapeSportsHTML(homeTeam)}

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

        ${escapeSportsHTML(awayTeam)}

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