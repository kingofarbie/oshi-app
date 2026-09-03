/* =====================================================
   ⚽ サッカー
   sports-soccer.js

   サッカー専用処理。

   【基本仕様】
   ・モーダル方式は使用しない
   ・専用編集ページを使用
   ・専用試合結果ページを使用
   ・ホーム / アウェイ対応
   ・左右表示
   ・前半 / 後半
   ・延長戦はチェックボックスで追加
   ・PK戦はチェックボックスで追加
   ・延長前半 / 延長後半
   ・PKスコア
   ・入力中のリアルタイム合計
   ・ホーム / アウェイ変更時もリアルタイム反映
   ・通常得点とPK得点は別管理
===================================================== */


/* =====================================================
   ⚽ 現在のサッカー試合データ取得
===================================================== */

function getCurrentSoccerGames(){

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


    const soccerGames =
        games.soccer;


    if(
        !soccerGames ||
        typeof soccerGames !== "object" ||
        Array.isArray(soccerGames)
    ){

        return {};

    }


    return soccerGames;

}



/* =====================================================
   ⚽ サッカー編集ページ
===================================================== */

async function openSoccerGameEditPage(date){

    hideSportsSubPages();

    sportsSelectedDate =
        date;

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
            "❌ サッカーカレンダーまたは編集ページが見つかりません"
        );

        return;

    }


    /* =====================
       カレンダー非表示
    ===================== */

    sportsPage.classList.remove(
        "active"
    );

    sportsPage.style.display =
        "none";


    /* =====================
       編集ページ表示
    ===================== */

    editPage.classList.add(
        "active"
    );

    editPage.style.display =
        "block";


    /* =====================
       HTML読み込み
    ===================== */

    const loaded =
        await loadSoccerGameEditHTML();

    if(!loaded){

        console.error(
            "❌ サッカー編集HTML読み込み失敗"
        );

        return;

    }


    /* =====================
       フォーム描画
    ===================== */

    renderSoccerGameEditForm();

}


/* =====================================================
   ⚽ サッカー編集HTML読み込み
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

        return true;

    }
    catch(error){

        console.error(
            "❌ sports-soccer-edit.html 読み込み失敗:",
            error
        );

        return false;

    }

}


/* =====================================================
   ⚽ 現在のサッカー試合データ取得
===================================================== */

function getCurrentSoccerGameForEdit(){

    const games =
        getCurrentSoccerGames();

    if(!sportsSelectedDate){

        return null;

    }

    return (
        games[sportsSelectedDate] ||
        null
    );

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
            "❌ soccerGameEditForm が見つかりません"
        );

        return;

    }

    if(!sportsSelectedDate){

        console.error(
            "❌ sportsSelectedDate がありません"
        );

        return;

    }


    const game =
        getCurrentSoccerGameForEdit();


    const data =
        db.load() || {};


    const settings =
        data.sportsCalendar ||
        {};


    const selectedIndex =
        typeof settings.selectedIndex === "number"
        ?
        settings.selectedIndex
        :
        0;


    const currentSport =
        settings.favoriteSports?.[
            selectedIndex
        ] ||
        {};


    const defaultTeam =
        currentSport.team ||
        "";


    /* =================================================
       基本値
    ================================================= */

    const team =
        game?.team ||
        defaultTeam ||
        "";


    const opponent =
        game?.opponent ||
        "";


    const homeAway =
        game?.homeAway ||
        "home";


    const result =
        game?.result ||
        "pending";


    const location =
        game?.location ||
        "";


    const startingPlayer =
        game?.startingPlayer ||
        "";


    const opponentStartingPlayer =
        game?.opponentStartingPlayer ||
        "";


    const memo =
        game?.memo ||
        "";


    const extraTime =
        game?.extraTime === true;


    const penaltyShootout =
        game?.penaltyShootout === true;


    /* =================================================
       スコア取得
    ================================================= */

    const firstHalfTeam =
        getSoccerScoreValue(
            game?.firstHalf,
            "team"
        );


    const firstHalfOpponent =
        getSoccerScoreValue(
            game?.firstHalf,
            "opponent"
        );


    const secondHalfTeam =
        getSoccerScoreValue(
            game?.secondHalf,
            "team"
        );


    const secondHalfOpponent =
        getSoccerScoreValue(
            game?.secondHalf,
            "opponent"
        );


    const extraFirstHalfTeam =
        getSoccerScoreValue(
            game?.extraFirstHalf,
            "team"
        );


    const extraFirstHalfOpponent =
        getSoccerScoreValue(
            game?.extraFirstHalf,
            "opponent"
        );


    const extraSecondHalfTeam =
        getSoccerScoreValue(
            game?.extraSecondHalf,
            "team"
        );


    const extraSecondHalfOpponent =
        getSoccerScoreValue(
            game?.extraSecondHalf,
            "opponent"
        );


    const penaltyTeam =
        getSoccerScoreValue(
            game?.penalty,
            "team"
        );


    const penaltyOpponent =
        getSoccerScoreValue(
            game?.penalty,
            "opponent"
        );


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
       基本入力
    ================================================= */

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


    const resultSelect =
        document.getElementById(
            "soccerEditResult"
        );


    const locationInput =
        document.getElementById(
            "soccerEditLocation"
        );


    const startingPlayerInput =
        document.getElementById(
            "soccerEditStartingPlayer"
        );


    const opponentStartingPlayerInput =
        document.getElementById(
            "soccerEditOpponentStartingPlayer"
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


    if(homeAwaySelect){

        homeAwaySelect.value =
            homeAway;

    }


    if(resultSelect){

        resultSelect.value =
            result;

    }


    if(locationInput){

        locationInput.value =
            location;

    }


    if(startingPlayerInput){

        startingPlayerInput.value =
            startingPlayer;

    }


    if(opponentStartingPlayerInput){

        opponentStartingPlayerInput.value =
            opponentStartingPlayer;

    }


    if(memoInput){

        memoInput.value =
            memo;

    }


    /* =================================================
       延長戦
    ================================================= */

    const extraTimeCheckbox =
        document.getElementById(
            "soccerEditExtraTime"
        );


    if(extraTimeCheckbox){

        extraTimeCheckbox.checked =
            extraTime;

    }


    /* =================================================
       PK戦
    ================================================= */

    const penaltyCheckbox =
        document.getElementById(
            "soccerEditPenaltyShootout"
        );


    if(penaltyCheckbox){

        penaltyCheckbox.checked =
            penaltyShootout;

    }


    /* =================================================
       前半
    ================================================= */

    setSoccerScoreInput(
        "soccerEditFirstHalfTeam",
        firstHalfTeam
    );


    setSoccerScoreInput(
        "soccerEditFirstHalfOpponent",
        firstHalfOpponent
    );


    /* =================================================
       後半
    ================================================= */

    setSoccerScoreInput(
        "soccerEditSecondHalfTeam",
        secondHalfTeam
    );


    setSoccerScoreInput(
        "soccerEditSecondHalfOpponent",
        secondHalfOpponent
    );


    /* =================================================
       延長前半
    ================================================= */

    setSoccerScoreInput(
        "soccerEditExtraFirstHalfTeam",
        extraFirstHalfTeam
    );


    setSoccerScoreInput(
        "soccerEditExtraFirstHalfOpponent",
        extraFirstHalfOpponent
    );


    /* =================================================
       延長後半
    ================================================= */

    setSoccerScoreInput(
        "soccerEditExtraSecondHalfTeam",
        extraSecondHalfTeam
    );


    setSoccerScoreInput(
        "soccerEditExtraSecondHalfOpponent",
        extraSecondHalfOpponent
    );


    /* =================================================
       PK
    ================================================= */

    setSoccerScoreInput(
        "soccerEditPenaltyTeam",
        penaltyTeam
    );


    setSoccerScoreInput(
        "soccerEditPenaltyOpponent",
        penaltyOpponent
    );


    /* =================================================
       表示更新
    ================================================= */

    updateSoccerExtraTimeDisplay();

    updateSoccerPenaltyDisplay();


    /* =================================================
       イベント登録
    ================================================= */

    bindSoccerEditEvents();


    /* =================================================
       初期表示
    ================================================= */

    updateSoccerEditLive();

}


/* =====================================================
   ⚽ スコア値取得
===================================================== */

function getSoccerScoreValue(
    object,
    key
){

    if(
        !object ||
        typeof object !== "object"
    ){

        return "";

    }


    if(
        object[key] === "" ||
        object[key] === null ||
        typeof object[key] === "undefined"
    ){

        return "";

    }


    return object[key];

}


/* =====================================================
   ⚽ スコア入力値設定
===================================================== */

function setSoccerScoreInput(
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
        value ?? "";

}


/* =====================================================
   ⚽ イベント登録
===================================================== */

function bindSoccerEditEvents(){

    const ids = [

        "soccerEditTeam",
        "soccerEditOpponent",
        "soccerEditHomeAway",
        "soccerEditResult",
        "soccerEditLocation",
        "soccerEditStartingPlayer",
        "soccerEditOpponentStartingPlayer",
        "soccerEditMemo",

        "soccerEditFirstHalfTeam",
        "soccerEditFirstHalfOpponent",

        "soccerEditSecondHalfTeam",
        "soccerEditSecondHalfOpponent",

        "soccerEditExtraFirstHalfTeam",
        "soccerEditExtraFirstHalfOpponent",

        "soccerEditExtraSecondHalfTeam",
        "soccerEditExtraSecondHalfOpponent",

        "soccerEditPenaltyTeam",
        "soccerEditPenaltyOpponent"

    ];


    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if(!element){

                return;

            }


            element.addEventListener(
                "input",
                updateSoccerEditLive
            );


            element.addEventListener(
                "change",
                updateSoccerEditLive
            );

        }
    );


    /* =================================================
       ホーム / アウェイ
    ================================================= */

    const homeAway =
        document.getElementById(
            "soccerEditHomeAway"
        );


    if(homeAway){

        homeAway.addEventListener(
            "change",
            () => {

                updateSoccerHomeAwayDisplay();

                updateSoccerEditLive();

            }
        );

    }


    /* =================================================
       延長戦
    ================================================= */

    const extraTimeCheckbox =
        document.getElementById(
            "soccerEditExtraTime"
        );


    if(extraTimeCheckbox){

        extraTimeCheckbox.addEventListener(
            "change",
            () => {

                updateSoccerExtraTimeDisplay();

                updateSoccerEditLive();

            }
        );

    }


    /* =================================================
       PK戦
    ================================================= */

    const penaltyCheckbox =
        document.getElementById(
            "soccerEditPenaltyShootout"
        );


    if(penaltyCheckbox){

        penaltyCheckbox.addEventListener(
            "change",
            () => {

                updateSoccerPenaltyDisplay();

                updateSoccerEditLive();

            }
        );

    }

}


/* =====================================================
   ⚽ 延長戦表示
===================================================== */

function updateSoccerExtraTimeDisplay(){

    const checkbox =
        document.getElementById(
            "soccerEditExtraTime"
        );


    const area =
        document.getElementById(
            "soccerEditExtraTimeArea"
        );


    if(!area){

        return;

    }


    const enabled =
        checkbox?.checked ||
        false;


    area.style.display =
        enabled
        ?
        "block"
        :
        "none";

}


/* =====================================================
   ⚽ 延長戦切り替え
===================================================== */

function toggleSoccerExtraPeriods(){

    const checkbox =
        document.getElementById(
            "soccerEditExtraTime"
        );


    if(!checkbox){

        return;

    }


    /*
       HTML側からこの関数をonclickで呼ぶ場合だけ
       手動で切り替える。

       changeイベントと二重反転しないようにする。
    */

    checkbox.checked =
        !checkbox.checked;


    updateSoccerExtraTimeDisplay();

    updateSoccerEditLive();

}


/* =====================================================
   ⚽ 延長スコア値取得
===================================================== */

function saveSoccerExtraScoreValues(){

    return {

        extraFirstHalf: {

            team:
                getSoccerNullableNumber(
                    "soccerEditExtraFirstHalfTeam"
                ),

            opponent:
                getSoccerNullableNumber(
                    "soccerEditExtraFirstHalfOpponent"
                )

        },

        extraSecondHalf: {

            team:
                getSoccerNullableNumber(
                    "soccerEditExtraSecondHalfTeam"
                ),

            opponent:
                getSoccerNullableNumber(
                    "soccerEditExtraSecondHalfOpponent"
                )

        }

    };

}


/* =====================================================
   ⚽ 延長戦表示
===================================================== */

function renderSoccerExtraPeriods(){

    updateSoccerExtraTimeDisplay();

}


/* =====================================================
   ⚽ PK表示
===================================================== */

function updateSoccerPenaltyDisplay(){

    const checkbox =
        document.getElementById(
            "soccerEditPenaltyShootout"
        );


    const area =
        document.getElementById(
            "soccerEditPenaltyArea"
        );


    if(!area){

        return;

    }


    const enabled =
        checkbox?.checked ||
        false;


    area.style.display =
        enabled
        ?
        "block"
        :
        "none";

}


/* =====================================================
   ⚽ PK切り替え
===================================================== */

function toggleSoccerPenalty(){

    const checkbox =
        document.getElementById(
            "soccerEditPenaltyShootout"
        );


    if(!checkbox){

        return;

    }


    checkbox.checked =
        !checkbox.checked;


    updateSoccerPenaltyDisplay();

    updateSoccerEditLive();

}


/* =====================================================
   ⚽ PK表示
===================================================== */

function renderSoccerPenalty(){

    updateSoccerPenaltyDisplay();

}


/* =====================================================
   ⚽ チーム名取得
===================================================== */

function getSoccerEditTeamNames(){

    return {

        team:
            document.getElementById(
                "soccerEditTeam"
            )?.value.trim() ||
            "応援チーム",

        opponent:
            document.getElementById(
                "soccerEditOpponent"
            )?.value.trim() ||
            "相手チーム"

    };

}


/* =====================================================
   ⚽ ホーム / アウェイ表示名
===================================================== */

function getSoccerDisplayedSides(){

    const names =
        getSoccerEditTeamNames();


    const homeAway =
        document.getElementById(
            "soccerEditHomeAway"
        )?.value ||
        "home";


    if(homeAway === "away"){

        return {

            leftName:
                names.opponent,

            rightName:
                names.team,

            leftKey:
                "opponent",

            rightKey:
                "team"

        };

    }


    return {

        leftName:
            names.team,

        rightName:
            names.opponent,

        leftKey:
            "team",

        rightKey:
            "opponent"

    };

}


/* =====================================================
   ⚽ ホーム / アウェイ表示
   左右のチーム名・スコアを完全に同期
===================================================== */

function updateSoccerHomeAwayDisplay() {

    const homeAway =
        document.getElementById("soccerEditHomeAway")?.value || "home";

    const form =
        document.getElementById("soccerGameEditForm");

    if (!form) return;


    /* =====================================================
       ⚽ チーム名

       保存上の team / opponent は変更しない。

       ホーム
       team - opponent

       アウェイ
       opponent - team
    ===================================================== */

    const teamName =
        form.querySelector("[data-soccer-team-name]");

    const opponentName =
        form.querySelector("[data-soccer-opponent-name]");

    const names =
        getSoccerEditTeamNames();

    if (teamName && opponentName) {

        if (homeAway === "home") {

            teamName.textContent =
                names.team;

            opponentName.textContent =
                names.opponent;

        } else {

            teamName.textContent =
                names.opponent;

            opponentName.textContent =
                names.team;
        }
    }


    /* =====================================================
       ⚽ スコア入力欄

       対象
       ・前半
       ・後半
       ・延長前半
       ・延長後半
       ・PK

       inputの「値」を交換するのではなく、
       team / opponent のinput要素そのものを
       DOM上で左右交換する。

       そのため、

       team input
       opponent input

       のIDは一切変更しない。
    ===================================================== */

    const scoreRows =
        form.querySelectorAll(".soccer-score-row");

    scoreRows.forEach(row => {

        const inputs =
            Array.from(
                row.querySelectorAll(
                    "input[type='number']"
                )
            );

        /* 左右2つの入力欄がある行だけ */

        if (inputs.length !== 2) {
            return;
        }


        /* =================================================
           team / opponent の入力欄を
           IDから特定
        ================================================= */

        const teamInput =
            inputs.find(input =>
                input.id.includes("Team")
            );

        const opponentInput =
            inputs.find(input =>
                input.id.includes("Opponent")
            );

        if (!teamInput || !opponentInput) {
            return;
        }


        /* =================================================
           現在の左右
        ================================================= */

        const currentLeft =
            inputs[0];

        const currentRight =
            inputs[1];


        /* =================================================
           目的の左右

           ホーム
           team - opponent

           アウェイ
           opponent - team
        ================================================= */

        const desiredLeft =
            homeAway === "home"
                ? teamInput
                : opponentInput;

        const desiredRight =
            homeAway === "home"
                ? opponentInput
                : teamInput;


        /* =================================================
           すでに正しい場合は何もしない
        ================================================= */

        if (
            currentLeft === desiredLeft &&
            currentRight === desiredRight
        ) {
            return;
        }


        /* =================================================
           ⚽ 確実なDOM交換

           元の構造

           label
           teamInput
           span
           opponentInput

           ↓

           label
           opponentInput
           span
           teamInput

           input.valueは触らない。
           input要素そのものを移動する。
        ================================================= */

        const leftMarker =
            document.createComment(
                "soccer-left-input"
            );

        const rightMarker =
            document.createComment(
                "soccer-right-input"
            );


        row.insertBefore(
            leftMarker,
            currentLeft
        );

        row.insertBefore(
            rightMarker,
            currentRight
        );


        row.insertBefore(
            desiredLeft,
            leftMarker
        );

        row.insertBefore(
            desiredRight,
            rightMarker
        );


        leftMarker.remove();
        rightMarker.remove();
    });


    /* =====================================================
       ⚽ 試合ボード上の合計得点

       ホーム
       teamTotal - opponentTotal

       アウェイ
       opponentTotal - teamTotal

       こちらも値ではなく
       DOM要素そのものを左右移動する。
    ===================================================== */

    const teamTotal =
        document.getElementById(
            "soccerEditTeamTotal"
        );

    const opponentTotal =
        document.getElementById(
            "soccerEditOpponentTotal"
        );

    const scoreDash =
        form.querySelector(
            ".soccer-score-dash"
        );

    if (
        teamTotal &&
        opponentTotal &&
        scoreDash
    ) {

        const parent =
            scoreDash.parentElement;

        if (parent) {

            const currentLeft =
                scoreDash.previousElementSibling;

            const currentRight =
                scoreDash.nextElementSibling;

            const desiredLeft =
                homeAway === "home"
                    ? teamTotal
                    : opponentTotal;

            const desiredRight =
                homeAway === "home"
                    ? opponentTotal
                    : teamTotal;


            if (
                currentLeft !== desiredLeft ||
                currentRight !== desiredRight
            ) {

                const leftMarker =
                    document.createComment(
                        "soccer-total-left"
                    );

                const rightMarker =
                    document.createComment(
                        "soccer-total-right"
                    );


                parent.insertBefore(
                    leftMarker,
                    currentLeft
                );

                parent.insertBefore(
                    rightMarker,
                    currentRight
                );


                parent.insertBefore(
                    desiredLeft,
                    leftMarker
                );

                parent.insertBefore(
                    desiredRight,
                    rightMarker
                );


                leftMarker.remove();
                rightMarker.remove();
            }
        }
    }


    /* =====================================================
       ⚽ その他の左右表示
    ===================================================== */

    updateSoccerHorizontalScoreDisplay(
        getSoccerDisplayedSides()
    );
}



function swapSoccerScoreInputs(firstInput, secondInput) {

    if (!firstInput || !secondInput) return;

    const parent =
        firstInput.parentElement;

    if (!parent || parent !== secondInput.parentElement) {
        return;
    }

    const marker =
        document.createComment("soccer-score-swap");

    parent.insertBefore(
        marker,
        firstInput
    );

    parent.insertBefore(
        firstInput,
        secondInput
    );

    parent.insertBefore(
        secondInput,
        marker
    );

    marker.remove();
}




function moveSoccerScoreTotal(
    leftElement,
    rightElement,
    separator
) {

    if (
        !leftElement ||
        !rightElement ||
        !separator
    ) {
        return;
    }

    const parent =
        separator.parentElement;

    if (!parent) return;

    /*
     * すでに
     *
     * left - right
     *
     * になっている場合は何もしない
     */

    if (
        separator.previousElementSibling === leftElement &&
        separator.nextElementSibling === rightElement
    ) {
        return;
    }

    const marker =
        document.createComment("soccer-total-swap");

    parent.insertBefore(
        marker,
        rightElement
    );

    parent.insertBefore(
        leftElement,
        separator
    );

    parent.insertBefore(
        rightElement,
        separator
    );

    marker.remove();
}







/* =====================================================
   ⚽ 左右スコア表示
===================================================== */

function updateSoccerHorizontalScoreDisplay(
    sides
){

    /*
       HTML側で左右表示を作る場合に対応。

       data-soccer-left-score / right-score
       があれば、そこへ現在の左右スコアを表示する。
    */

    const scorePairs = [

        {
            left:
                "[data-soccer-left-score='first-half']",

            right:
                "[data-soccer-right-score='first-half']",

            team:
                "soccerEditFirstHalfTeam",

            opponent:
                "soccerEditFirstHalfOpponent"

        },

        {
            left:
                "[data-soccer-left-score='second-half']",

            right:
                "[data-soccer-right-score='second-half']",

            team:
                "soccerEditSecondHalfTeam",

            opponent:
                "soccerEditSecondHalfOpponent"

        },

        {
            left:
                "[data-soccer-left-score='extra-first-half']",

            right:
                "[data-soccer-right-score='extra-first-half']",

            team:
                "soccerEditExtraFirstHalfTeam",

            opponent:
                "soccerEditExtraFirstHalfOpponent"

        },

        {
            left:
                "[data-soccer-left-score='extra-second-half']",

            right:
                "[data-soccer-right-score='extra-second-half']",

            team:
                "soccerEditExtraSecondHalfTeam",

            opponent:
                "soccerEditExtraSecondHalfOpponent"

        },

        {
            left:
                "[data-soccer-left-score='penalty']",

            right:
                "[data-soccer-right-score='penalty']",

            team:
                "soccerEditPenaltyTeam",

            opponent:
                "soccerEditPenaltyOpponent"

        }

    ];


    scorePairs.forEach(
        pair => {

            const teamValue =
                document.getElementById(
                    pair.team
                )?.value ?? "";


            const opponentValue =
                document.getElementById(
                    pair.opponent
                )?.value ?? "";


            const leftValue =
                sides.leftKey === "team"
                ?
                teamValue
                :
                opponentValue;


            const rightValue =
                sides.rightKey === "team"
                ?
                teamValue
                :
                opponentValue;


            document
                .querySelectorAll(pair.left)
                .forEach(
                    element => {

                        element.textContent =
                            leftValue;

                    }
                );


            document
                .querySelectorAll(pair.right)
                .forEach(
                    element => {

                        element.textContent =
                            rightValue;

                    }
                );

        }
    );


    /* =================================================
       合計
    ================================================= */

    const teamTotal =
        document.getElementById(
            "soccerEditTeamTotal"
        )?.textContent ||
        "0";


    const opponentTotal =
        document.getElementById(
            "soccerEditOpponentTotal"
        )?.textContent ||
        "0";


    const leftTotal =
        sides.leftKey === "team"
        ?
        teamTotal
        :
        opponentTotal;


    const rightTotal =
        sides.rightKey === "team"
        ?
        teamTotal
        :
        opponentTotal;


    document
        .querySelectorAll(
            "[data-soccer-left-total]"
        )
        .forEach(
            element => {

                element.textContent =
                    leftTotal;

            }
        );


    document
        .querySelectorAll(
            "[data-soccer-right-total]"
        )
        .forEach(
            element => {

                element.textContent =
                    rightTotal;

            }
        );

}


/* =====================================================
   ⚽ ホーム / アウェイ変更
   チーム名と左右スコアを完全同期
===================================================== */

function swapSoccerHomeAwayScores(){

    const homeAway =
        document.getElementById(
            "soccerEditHomeAway"
        );


    if(!homeAway){

        return;

    }


    /* =================================================
       ホーム ⇔ アウェイ
    ================================================= */

    homeAway.value =
        homeAway.value === "home"
        ?
        "away"
        :
        "home";


    /* =================================================
       表示更新
    ================================================= */

    updateSoccerHomeAwayDisplay();


    /* =================================================
       リアルタイム合計更新
    ================================================= */

    updateSoccerEditLive();

}


/* =====================================================
   ⚽ チーム名リアルタイム更新
===================================================== */

function updateSoccerTeamNames(
    team,
    opponent
){

    const teamLabels =
        document.querySelectorAll(
            "[data-soccer-team-name]"
        );


    teamLabels.forEach(
        element => {

            element.textContent =
                team;

        }
    );


    const opponentLabels =
        document.querySelectorAll(
            "[data-soccer-opponent-name]"
        );


    opponentLabels.forEach(
        element => {

            element.textContent =
                opponent;

        }
    );


    const homeAway =
        document.getElementById(
            "soccerEditHomeAway"
        );


    if(homeAway){

        updateSoccerHomeAwayDisplay();

    }

}


/* =====================================================
   ⚽ 旧チーム名更新関数互換
===================================================== */

function updateSoccerScoreTeamNames(
    team,
    opponent
){

    updateSoccerTeamNames(
        team,
        opponent
    );

}


/* =====================================================
   ⚽ 数値取得
===================================================== */

function getSoccerNumber(id){

    const input =
        document.getElementById(
            id
        );


    if(!input){

        return 0;

    }


    if(input.value === ""){

        return 0;

    }


    const number =
        Number(
            input.value
        );


    if(
        !Number.isFinite(number) ||
        number < 0
    ){

        return 0;

    }


    return Math.floor(
        number
    );

}


/* =====================================================
   ⚽ 空欄対応数値
===================================================== */

function getSoccerNullableNumber(id){

    const input =
        document.getElementById(
            id
        );


    if(!input){

        return "";

    }


    if(input.value === ""){

        return "";

    }


    const number =
        Number(
            input.value
        );


    if(
        !Number.isFinite(number) ||
        number < 0
    ){

        return "";

    }


    return Math.floor(
        number
    );

}


/* =====================================================
   ⚽ スコア → 数値
===================================================== */

function soccerScoreToNumber(
    value
){

    if(
        value === "" ||
        value === null ||
        typeof value === "undefined"
    ){

        return 0;

    }


    const number =
        Number(
            value
        );


    if(
        !Number.isFinite(number) ||
        number < 0
    ){

        return 0;

    }


    return number;

}


/* =====================================================
   ⚽ 通常得点合計
===================================================== */

function calculateSoccerRegularTotal(
    firstHalf,
    secondHalf,
    extraFirstHalf,
    extraSecondHalf,
    opponent = false
){

    const key =
        opponent
        ?
        "opponent"
        :
        "team";


    let total =
        0;


    total +=
        soccerScoreToNumber(
            firstHalf?.[key]
        );


    total +=
        soccerScoreToNumber(
            secondHalf?.[key]
        );


    total +=
        soccerScoreToNumber(
            extraFirstHalf?.[key]
        );


    total +=
        soccerScoreToNumber(
            extraSecondHalf?.[key]
        );


    return total;

}


/* =====================================================
   ⚽ 旧版互換：チーム合計
===================================================== */

function calculateSoccerTotal(
    firstHalf,
    secondHalf,
    extraFirstHalf = null,
    extraSecondHalf = null
){

    return calculateSoccerRegularTotal(
        firstHalf,
        secondHalf,
        extraFirstHalf,
        extraSecondHalf,
        false
    );

}


/* =====================================================
   ⚽ 旧版互換：相手合計
===================================================== */

function calculateSoccerOpponentTotal(
    firstHalf,
    secondHalf,
    extraFirstHalf = null,
    extraSecondHalf = null
){

    return calculateSoccerRegularTotal(
        firstHalf,
        secondHalf,
        extraFirstHalf,
        extraSecondHalf,
        true
    );

}


/* =====================================================
   ⚽ リアルタイム更新
===================================================== */

function updateSoccerEditLive(){

    const names =
        getSoccerEditTeamNames();


    /* =================================================
       通常時間
    ================================================= */

    const firstHalfTeam =
        getSoccerNumber(
            "soccerEditFirstHalfTeam"
        );


    const firstHalfOpponent =
        getSoccerNumber(
            "soccerEditFirstHalfOpponent"
        );


    const secondHalfTeam =
        getSoccerNumber(
            "soccerEditSecondHalfTeam"
        );


    const secondHalfOpponent =
        getSoccerNumber(
            "soccerEditSecondHalfOpponent"
        );


    let teamTotal =
        firstHalfTeam +
        secondHalfTeam;


    let opponentTotal =
        firstHalfOpponent +
        secondHalfOpponent;


    /* =================================================
       延長戦
    ================================================= */

    const extraTime =
        document.getElementById(
            "soccerEditExtraTime"
        )?.checked ||
        false;


    if(extraTime){

        teamTotal +=
            getSoccerNumber(
                "soccerEditExtraFirstHalfTeam"
            );


        teamTotal +=
            getSoccerNumber(
                "soccerEditExtraSecondHalfTeam"
            );


        opponentTotal +=
            getSoccerNumber(
                "soccerEditExtraFirstHalfOpponent"
            );


        opponentTotal +=
            getSoccerNumber(
                "soccerEditExtraSecondHalfOpponent"
            );

    }


    /* =================================================
       合計表示
    ================================================= */

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


    /* =================================================
       最終スコア
    ================================================= */

    const teamScore =
        document.getElementById(
            "soccerEditFinalTeamScore"
        );


    const opponentScore =
        document.getElementById(
            "soccerEditFinalOpponentScore"
        );


    if(teamScore){

        teamScore.textContent =
            teamTotal;

    }


    if(opponentScore){

        opponentScore.textContent =
            opponentTotal;

    }


    /* =================================================
       チーム名
    ================================================= */

    updateSoccerTeamNames(
        names.team,
        names.opponent
    );


    /* =================================================
       ホーム / アウェイ
    ================================================= */

    updateSoccerHomeAwayDisplay();


    /* =================================================
       PK表示
    ================================================= */

    const penaltyEnabled =
        document.getElementById(
            "soccerEditPenaltyShootout"
        )?.checked ||
        false;


    const penaltyPreview =
        document.getElementById(
            "soccerEditPenaltyPreview"
        );


    if(penaltyPreview){

        if(penaltyEnabled){

            const penaltyTeam =
                getSoccerNumber(
                    "soccerEditPenaltyTeam"
                );


            const penaltyOpponent =
                getSoccerNumber(
                    "soccerEditPenaltyOpponent"
                );


            const sides =
                getSoccerDisplayedSides();


            const leftPenalty =
                sides.leftKey === "team"
                ?
                penaltyTeam
                :
                penaltyOpponent;


            const rightPenalty =
                sides.rightKey === "team"
                ?
                penaltyTeam
                :
                penaltyOpponent;


            penaltyPreview.textContent =
                `${leftPenalty} - ${rightPenalty}`;

        }
        else{

            penaltyPreview.textContent =
                "";

        }

    }

}


/* =====================================================
   ⚽ スコアボード更新
===================================================== */

function updateSoccerScoreboard(){

    updateSoccerEditLive();

}


/* =====================================================
   ⚽ 保存
===================================================== */

function saveSoccerGameFromEditPage(){

    console.log(
        "⚽ saveSoccerGameFromEditPage 実行"
    );


    /* =================================================
       日付確認
    ================================================= */

    if(!sportsSelectedDate){

        alert(
            "試合日が選択されていません。"
        );

        return;

    }


    /* =================================================
       入力値
    ================================================= */

    const team =
        document.getElementById(
            "soccerEditTeam"
        )?.value.trim() ||
        "";


    const opponent =
        document.getElementById(
            "soccerEditOpponent"
        )?.value.trim() ||
        "";


    const homeAway =
        document.getElementById(
            "soccerEditHomeAway"
        )?.value ||
        "home";


    const result =
        document.getElementById(
            "soccerEditResult"
        )?.value ||
        "";


    const location =
        document.getElementById(
            "soccerEditLocation"
        )?.value.trim() ||
        "";


    const startingPlayer =
        document.getElementById(
            "soccerEditStartingPlayer"
        )?.value.trim() ||
        "";


    const opponentStartingPlayer =
        document.getElementById(
            "soccerEditOpponentStartingPlayer"
        )?.value.trim() ||
        "";


    const memo =
        document.getElementById(
            "soccerEditMemo"
        )?.value.trim() ||
        "";


    /* =================================================
       入力チェック
    ================================================= */

    if(!team){

        alert(
            "応援チームを入力してください。"
        );

        document.getElementById(
            "soccerEditTeam"
        )?.focus();

        return;

    }


    if(!opponent){

        alert(
            "相手チームを入力してください。"
        );

        document.getElementById(
            "soccerEditOpponent"
        )?.focus();

        return;

    }


    /* =================================================
       延長 / PK
    ================================================= */

    const extraTime =
        document.getElementById(
            "soccerEditExtraTime"
        )?.checked ||
        false;


    const penaltyShootout =
        document.getElementById(
            "soccerEditPenaltyShootout"
        )?.checked ||
        false;


    /* =================================================
       前半
    ================================================= */

    const firstHalf = {

        team:
            getSoccerNullableNumber(
                "soccerEditFirstHalfTeam"
            ),

        opponent:
            getSoccerNullableNumber(
                "soccerEditFirstHalfOpponent"
            )

    };


    /* =================================================
       後半
    ================================================= */

    const secondHalf = {

        team:
            getSoccerNullableNumber(
                "soccerEditSecondHalfTeam"
            ),

        opponent:
            getSoccerNullableNumber(
                "soccerEditSecondHalfOpponent"
            )

    };


    /* =================================================
       延長
    ================================================= */

    let extraFirstHalf =
        null;


    let extraSecondHalf =
        null;


    if(extraTime){

        const extraValues =
            saveSoccerExtraScoreValues();


        extraFirstHalf =
            extraValues.extraFirstHalf;


        extraSecondHalf =
            extraValues.extraSecondHalf;

    }


    /* =================================================
       PK
    ================================================= */

    let penalty =
        null;


    if(penaltyShootout){

        penalty = {

            team:
                getSoccerNullableNumber(
                    "soccerEditPenaltyTeam"
                ),

            opponent:
                getSoccerNullableNumber(
                    "soccerEditPenaltyOpponent"
                )

        };

    }


    /* =================================================
       通常得点合計
    ================================================= */

    const teamTotal =
        calculateSoccerTotal(
            firstHalf,
            secondHalf,
            extraFirstHalf,
            extraSecondHalf
        );


    const opponentTotal =
        calculateSoccerOpponentTotal(
            firstHalf,
            secondHalf,
            extraFirstHalf,
            extraSecondHalf
        );


    /* =================================================
       PK勝敗
    ================================================= */

    let penaltyResult =
        "";


    if(penaltyShootout){

        const penaltyTeam =
            penalty?.team;


        const penaltyOpponent =
            penalty?.opponent;


        if(
            typeof penaltyTeam === "number" &&
            typeof penaltyOpponent === "number"
        ){

            if(
                penaltyTeam >
                penaltyOpponent
            ){

                penaltyResult =
                    "win";

            }
            else if(
                penaltyTeam <
                penaltyOpponent
            ){

                penaltyResult =
                    "lose";

            }
            else{

                penaltyResult =
                    "draw";

            }

        }

    }


    /* =================================================
       最終勝敗
    ================================================= */

    let finalResult =
        result;


    if(!finalResult){

        if(
            teamTotal >
            opponentTotal
        ){

            finalResult =
                "win";

        }
        else if(
            teamTotal <
            opponentTotal
        ){

            finalResult =
                "lose";

        }
        else if(
            penaltyResult
        ){

            finalResult =
                penaltyResult;

        }
        else{

            finalResult =
                "draw";

        }

    }


    /* =================================================
       保存データ
    ================================================= */

    const game = {

        sport:
            "soccer",

        team:
            team,

        opponent:
            opponent,

        homeAway:
            homeAway,

        firstHalf:
            firstHalf,

        secondHalf:
            secondHalf,

        extraTime:
            extraTime,

        extraFirstHalf:
            extraFirstHalf,

        extraSecondHalf:
            extraSecondHalf,

        penaltyShootout:
            penaltyShootout,

        penalty:
            penalty,

        /*
           teamTotal / opponentTotal は
           PKを含まない通常得点合計
        */

        teamTotal:
            teamTotal,

        opponentTotal:
            opponentTotal,

        result:
            finalResult,

        location:
            location,

        startingPlayer:
            startingPlayer,

        opponentStartingPlayer:
            opponentStartingPlayer,

        memo:
            memo,

        updatedAt:
            new Date().toISOString()

    };


    console.log(
        "⚽ 保存するサッカーデータ:",
        game
    );


    /* =================================================
       保存
    ================================================= */

    const saved =
        saveSoccerGameData(
            sportsSelectedDate,
            game
        );


    if(saved === false){

        console.error(
            "❌ サッカー試合データの保存に失敗"
        );

        return;

    }


    /* =================================================
       保存日保持
    ================================================= */

    const savedDate =
        sportsSelectedDate;


    /* =================================================
       編集ページ終了
    ================================================= */

    closeSoccerGameEditPage();


    /* =================================================
       結果ページ
    ================================================= */

    if(savedDate){

        openSoccerGameDetailPage(
            savedDate
        );

    }

}


/* =====================================================
   ⚽ 旧版互換：編集保存
===================================================== */

function saveSoccerGameEdit(){

    saveSoccerGameFromEditPage();

}


/* =====================================================
   ⚽ サッカー試合データ保存
===================================================== */

function saveSoccerGameData(
    date,
    game
){

    if(!date){

        console.error(
            "❌ サッカー保存日がありません"
        );

        return false;

    }


    if(
        typeof saveSportsGameData !==
        "function"
    ){

        console.error(
            "❌ saveSportsGameData が見つかりません"
        );

        return false;

    }


    const result =
        saveSportsGameData(
            date,
            game
        );


    return result === false
        ?
        false
        :
        true;

}

/* =====================================================
   ⚽ 編集ページを閉じる
===================================================== */

function closeSoccerGameEditPage(){

    /*
       現在編集中の試合日を保持
    */

    const date =
        sportsSelectedDate;

    if(!date){

        console.error(
            "❌ 編集中の試合日が設定されていません"
        );

        return;

    }

    /*
       編集ページを閉じる
    */

    const editPage =
        document.getElementById(
            "sportsGameEditPage"
        );

    if(editPage){

        editPage.classList.remove(
            "active"
        );

        editPage.style.display =
            "none";

    }

    /*
       サッカーの詳細ページへ戻る
    */

    openSoccerGameDetailPage(
        date
    );

}



/* =====================================================
   ⚽ 試合結果HTML読み込み
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


        return true;

    }
    catch(error){

        console.error(
            "❌ sports-soccer-detail.html 読み込み失敗:",
            error
        );

        return false;

    }

}


/* =====================================================
   ⚽ 試合結果ページ
===================================================== */

async function openSoccerGameDetailPage(date){

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
            "❌ サッカーカレンダーまたは試合結果ページが見つかりません"
        );

        return;

    }


    /* =================================================
       カレンダー非表示
    ================================================= */

    sportsPage.classList.remove(
        "active"
    );

    sportsPage.style.display =
        "none";


    /* =================================================
       結果ページ表示
    ================================================= */

    detailPage.classList.add(
        "active"
    );

    detailPage.style.display =
        "block";


    /* =================================================
       HTML読み込み
    ================================================= */

    const container =
        document.getElementById(
            "sportsGameDetailContainer"
        );


    if(
        container &&
        !container.querySelector(
            "[data-soccer-detail]"
        )
    ){

        const loaded =
            await loadSoccerGameDetailHTML();


        if(!loaded){

            return;

        }

    }


    /* =================================================
       結果描画
    ================================================= */

    renderSoccerGameDetail(
        date
    );

}


/* =====================================================
   ⚽ 試合結果描画
===================================================== */

function renderSoccerGameDetail(date){

const games =
    getCurrentSoccerGames();


const game =
    games?.[date];


if(!game){

    console.error(
        "❌ サッカー試合データがありません:",
        date
    );

    return;

}


/* =================================================
   基本情報
================================================= */

const team =
    game.team ||
    "応援チーム";


const opponent =
    game.opponent ||
    "相手チーム";


const homeAway =
    game.homeAway ||
    "home";


/* =================================================
   通常得点合計

   PKは含めない。
   前半
   ＋後半
   ＋延長前半
   ＋延長後半
================================================= */

const regularTeam =
    calculateSoccerRegularTotal(
        game.firstHalf,
        game.secondHalf,
        game.extraFirstHalf,
        game.extraSecondHalf
    );


const regularOpponent =
    calculateSoccerRegularTotal(
        game.firstHalf,
        game.secondHalf,
        game.extraFirstHalf,
        game.extraSecondHalf,
        true
    );


/* =================================================
   ホーム / アウェイによる表示順

   保存データは変更しない。

   home
   左 = team
   右 = opponent

   away
   左 = opponent
   右 = team
================================================= */

let leftName =
    team;

let rightName =
    opponent;

let leftIsTeam =
    true;


if(homeAway === "away"){

    leftName =
        opponent;

    rightName =
        team;

    leftIsTeam =
        false;

}


/* =================================================
   応援チーム
================================================= */

setSoccerDetailText(
    "soccerDetailTeam",
    team
);


/* =================================================
   相手チーム
================================================= */

setSoccerDetailText(
    "soccerDetailOpponent",
    opponent
);


/* =================================================
   ホーム / アウェイ
================================================= */

setSoccerDetailText(
    "soccerDetailHomeAway",
    homeAway === "away"
        ? "アウェイ"
        : "ホーム"
);


/* =================================================
   ホーム側チーム名
================================================= */

document
    .querySelectorAll(
        "[data-soccer-detail-home-name]"
    )
    .forEach(
        element => {

            element.textContent =
                leftName;

        }
    );


/* =================================================
   アウェイ側チーム名
================================================= */

document
    .querySelectorAll(
        "[data-soccer-detail-away-name]"
    )
    .forEach(
        element => {

            element.textContent =
                rightName;

        }
    );


/* =================================================
   前半
================================================= */

const firstHalfTeam =
    soccerScoreToNumber(
        game.firstHalf?.team
    );


const firstHalfOpponent =
    soccerScoreToNumber(
        game.firstHalf?.opponent
    );


const firstHalfLeft =
    leftIsTeam
        ? firstHalfTeam
        : firstHalfOpponent;


const firstHalfRight =
    leftIsTeam
        ? firstHalfOpponent
        : firstHalfTeam;


setSoccerDetailText(
    "soccerDetailFirstHalf",
    `${firstHalfLeft} - ${firstHalfRight}`
);


/* =================================================
   後半
================================================= */

const secondHalfTeam =
    soccerScoreToNumber(
        game.secondHalf?.team
    );


const secondHalfOpponent =
    soccerScoreToNumber(
        game.secondHalf?.opponent
    );


const secondHalfLeft =
    leftIsTeam
        ? secondHalfTeam
        : secondHalfOpponent;


const secondHalfRight =
    leftIsTeam
        ? secondHalfOpponent
        : secondHalfTeam;


setSoccerDetailText(
    "soccerDetailSecondHalf",
    `${secondHalfLeft} - ${secondHalfRight}`
);


/* =================================================
   延長
================================================= */

const extraArea =
    document.getElementById(
        "soccerDetailExtraTimeArea"
    );


const extraCheck =
    document.getElementById(
        "soccerDetailExtraCheck"
    );


if(game.extraTime){

    if(extraArea){

        extraArea.style.display =
            "block";

    }


    if(extraCheck){

        extraCheck.textContent =
            "☑ 延長";

    }


    /* ---------------------------------------------
       延長前半
    --------------------------------------------- */

    const extraFirstHalfTeam =
        soccerScoreToNumber(
            game.extraFirstHalf?.team
        );


    const extraFirstHalfOpponent =
        soccerScoreToNumber(
            game.extraFirstHalf?.opponent
        );


    const extraFirstHalfLeft =
        leftIsTeam
            ? extraFirstHalfTeam
            : extraFirstHalfOpponent;


    const extraFirstHalfRight =
        leftIsTeam
            ? extraFirstHalfOpponent
            : extraFirstHalfTeam;


    setSoccerDetailText(
        "soccerDetailExtraFirstHalf",
        `${extraFirstHalfLeft} - ${extraFirstHalfRight}`
    );


    /* ---------------------------------------------
       延長後半
    --------------------------------------------- */

    const extraSecondHalfTeam =
        soccerScoreToNumber(
            game.extraSecondHalf?.team
        );


    const extraSecondHalfOpponent =
        soccerScoreToNumber(
            game.extraSecondHalf?.opponent
        );


    const extraSecondHalfLeft =
        leftIsTeam
            ? extraSecondHalfTeam
            : extraSecondHalfOpponent;


    const extraSecondHalfRight =
        leftIsTeam
            ? extraSecondHalfOpponent
            : extraSecondHalfTeam;


    setSoccerDetailText(
        "soccerDetailExtraSecondHalf",
        `${extraSecondHalfLeft} - ${extraSecondHalfRight}`
    );

}
else{

    if(extraArea){

        extraArea.style.display =
            "none";

    }


    if(extraCheck){

        extraCheck.textContent =
            "□ 延長";

    }

}


/* =================================================
   PK
================================================= */

const penaltyArea =
    document.getElementById(
        "soccerDetailPenaltyArea"
    );


const penaltyCheck =
    document.getElementById(
        "soccerDetailPenaltyCheck"
    );


if(game.penaltyShootout){

    if(penaltyArea){

        penaltyArea.style.display =
            "block";

    }


    if(penaltyCheck){

        penaltyCheck.textContent =
            "☑ PK";

    }


    const penaltyTeam =
        soccerScoreToNumber(
            game.penalty?.team
        );


    const penaltyOpponent =
        soccerScoreToNumber(
            game.penalty?.opponent
        );


    const penaltyLeft =
        leftIsTeam
            ? penaltyTeam
            : penaltyOpponent;


    const penaltyRight =
        leftIsTeam
            ? penaltyOpponent
            : penaltyTeam;


    setSoccerDetailText(
        "soccerDetailPenalty",
        `${penaltyLeft} - ${penaltyRight}`
    );

}
else{

    if(penaltyArea){

        penaltyArea.style.display =
            "none";

    }


    if(penaltyCheck){

        penaltyCheck.textContent =
            "□ PK";

    }

}


/* =================================================
   合計

   PKは含めない。
================================================= */

const leftTotal =
    leftIsTeam
        ? regularTeam
        : regularOpponent;


const rightTotal =
    leftIsTeam
        ? regularOpponent
        : regularTeam;


setSoccerDetailText(
    "soccerDetailLeftTotal",
    leftTotal
);


setSoccerDetailText(
    "soccerDetailRightTotal",
    rightTotal
);


/* =================================================
   試合結果
================================================= */

setSoccerDetailText(
    "soccerDetailResult",
    getSoccerResultLabel(
        game.result
    )
);


/* =================================================
   場所
================================================= */

setSoccerDetailText(
    "soccerDetailLocation",
    game.location ||
    ""
);


/* =================================================
   メモ
================================================= */

setSoccerDetailText(
    "soccerDetailMemo",
    game.memo ||
    ""
);

}



/* =====================================================
   ⚽ 旧版互換：結果描画
===================================================== */

function renderSoccerGameView(
    date
){

    renderSoccerGameDetail(
        date
    );

}


/* =====================================================
   ⚽ 詳細表示用スコア
===================================================== */

function formatSoccerScore(
    score
){

    if(
        !score ||
        typeof score !== "object"
    ){

        return "-";

    }


    const team =
        soccerScoreToNumber(
            score.team
        );


    const opponent =
        soccerScoreToNumber(
            score.opponent
        );


    return `${team} - ${opponent}`;

}


/* =====================================================
   ⚽ 詳細テキスト設定
===================================================== */

function setSoccerDetailText(
    id,
    value
){

    const element =
        document.getElementById(
            id
        );


    if(element){

        element.textContent =
            value;

    }

}


/* =====================================================
   ⚽ 勝敗表示
===================================================== */

function getSoccerResultLabel(
    result
){

    switch(result){

        case "win":

            return "🏆 勝ち";


        case "lose":

            return "😢 負け";


        case "draw":

            return "🤝 引き分け";


        default:

            return "";

    }

}


/* =====================================================
   ⚽ 試合結果編集へ
===================================================== */

function editSoccerGame(){

    if(!sportsSelectedDate){

        return;

    }


    openSoccerGameEditPage(
        sportsSelectedDate
    );

}




/* =====================================================
   ⚽ サッカー試合削除
===================================================== */

function deleteSoccerGame(){

    if(!sportsSelectedDate){

        return;

    }


    const games =
        getCurrentSoccerGames();


    if(
        !games ||
        !games[sportsSelectedDate]
    ){

        return;

    }


    if(
        !confirm(
            "この試合記録を削除しますか？"
        )
    ){

        return;

    }


    const deletedDate =
        sportsSelectedDate;


    delete games[
        deletedDate
    ];


    /* =================================================
       削除後データ保存
    ================================================= */

    const data =
        db.load();


    if(!data.sportsCalendar){

        data.sportsCalendar =
            {};

    }


    if(
        !data.sportsCalendar.games ||
        typeof data.sportsCalendar.games !== "object" ||
        Array.isArray(
            data.sportsCalendar.games
        )
    ){

        data.sportsCalendar.games =
            {};

    }


    data.sportsCalendar.games.soccer =
        games;


    db.save(
        data
    );


    /* =================================================
       状態リセット
    ================================================= */

    sportsSelectedDate =
        null;


    hideSportsSubPages();


    renderSportsCalendar();


    console.log(
        "⚽ サッカー試合削除:",
        deletedDate
    );

}

/* =====================================================
   ⚽ 結果ページを閉じる
===================================================== */

function closeSoccerGameDetailPage(){

    const detailPage =
        document.getElementById(
            "sportsGameDetailPage"
        );


    if(detailPage){

        detailPage.classList.remove(
            "active"
        );

        detailPage.style.display =
            "none";

    }


    sportsSelectedDate =
        null;


    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );


    if(sportsPage){

        sportsPage.classList.add(
            "active"
        );

        sportsPage.style.display =
            "block";

    }


    renderSportsCalendar();

}



