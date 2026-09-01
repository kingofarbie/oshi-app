/* =====================================================
   ⚽ サッカー
   sports-soccer.js

   サッカー専用処理。

   【基本仕様】
   ・モーダル方式は使用しない
   ・専用編集ページを使用
   ・専用試合結果ページを使用
   ・ホーム / アウェイ対応
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


    if(
        !data ||
        !data.sportsCalendar
    ){

        return {};

    }


    return (
        data.sportsCalendar.soccerGames ||
        {}
    );

}


/* =====================================================
   ⚽ サッカー編集ページ
===================================================== */

/**
 * サッカー試合編集ページを開く
 *
 * @param {string} date
 */
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
            "soccerGameEditPage"
        );


    if(
        !sportsPage ||
        !editPage
    ){

        console.error(
            "❌ サッカーカレンダーまたはサッカー編集ページが見つかりません"
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


    console.log(
        "① サッカー編集ページ表示:",
        date
    );


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
       編集フォーム描画
    ===================== */

    renderSoccerGameEditForm();


    console.log(
        "② サッカー編集フォーム描画完了"
    );

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


        console.log(
            "sports-soccer-edit.html 読み込み成功"
        );


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

    const games = getCurrentSoccerGames();

    if(!sportsSelectedDate){
        return null;
    }

    return games[sportsSelectedDate] || null;
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


    const currentSport =
        settings.favoriteSports?.[
            selectedIndex
        ] ||
        {};


    const defaultTeam =
        currentSport.team ||
        settings.team ||
        "";


    /* =================================================
       既存値
    ================================================= */

    const team =
        game.team ||
        defaultTeam ||
        "";


    const opponent =
        game.opponent ||
        "";


    const homeAway =
        game.homeAway ||
        "home";


    const result =
        game.result ||
        "";


    const location =
        game.location ||
        "";


    const startingPlayer =
        game.startingPlayer ||
        "";


    const opponentStartingPlayer =
        game.opponentStartingPlayer ||
        "";


    const memo =
        game.memo ||
        "";


    const extraTime =
        game.extraTime === true;


    const penaltyShootout =
        game.penaltyShootout === true;


    const firstHalfTeam =
        getSoccerScoreValue(
            game.firstHalf,
            "team"
        );


    const firstHalfOpponent =
        getSoccerScoreValue(
            game.firstHalf,
            "opponent"
        );


    const secondHalfTeam =
        getSoccerScoreValue(
            game.secondHalf,
            "team"
        );


    const secondHalfOpponent =
        getSoccerScoreValue(
            game.secondHalf,
            "opponent"
        );


    const extraFirstHalfTeam =
        getSoccerScoreValue(
            game.extraFirstHalf,
            "team"
        );


    const extraFirstHalfOpponent =
        getSoccerScoreValue(
            game.extraFirstHalf,
            "opponent"
        );


    const extraSecondHalfTeam =
        getSoccerScoreValue(
            game.extraSecondHalf,
            "team"
        );


    const extraSecondHalfOpponent =
        getSoccerScoreValue(
            game.extraSecondHalf,
            "opponent"
        );


    const penaltyTeam =
        getSoccerScoreValue(
            game.penalty,
            "team"
        );


    const penaltyOpponent =
        getSoccerScoreValue(
            game.penalty,
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
       基本入力欄
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
       延長戦チェック
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
       PK戦チェック
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
       基本スコア
    ================================================= */

    setSoccerScoreInput(
        "soccerEditFirstHalfTeam",
        firstHalfTeam
    );


    setSoccerScoreInput(
        "soccerEditFirstHalfOpponent",
        firstHalfOpponent
    );


    setSoccerScoreInput(
        "soccerEditSecondHalfTeam",
        secondHalfTeam
    );


    setSoccerScoreInput(
        "soccerEditSecondHalfOpponent",
        secondHalfOpponent
    );


    /* =================================================
       延長スコア
    ================================================= */

    setSoccerScoreInput(
        "soccerEditExtraFirstHalfTeam",
        extraFirstHalfTeam
    );


    setSoccerScoreInput(
        "soccerEditExtraFirstHalfOpponent",
        extraFirstHalfOpponent
    );


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
       延長欄表示
    ================================================= */

    updateSoccerExtraTimeDisplay();


    /* =================================================
       PK欄表示
    ================================================= */

    updateSoccerPenaltyDisplay();


    /* =================================================
       イベント登録
    ================================================= */

    bindSoccerEditEvents();


    /* =================================================
       初期リアルタイム更新
    ================================================= */

    updateSoccerEditLive();


    /* =================================================
       ページ表示
    ================================================= */

    const editPage =
        document.getElementById(
            "soccerGameEditPage"
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
        checkbox
        ?
        checkbox.checked
        :
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
        checkbox
        ?
        checkbox.checked
        :
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
   ⚽ リアルタイム更新
===================================================== */

function updateSoccerEditLive(){

    const team =
        document.getElementById(
            "soccerEditTeam"
        )?.value.trim() ||
        "応援チーム";


    const opponent =
        document.getElementById(
            "soccerEditOpponent"
        )?.value.trim() ||
        "相手チーム";


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
       延長
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
       最終スコア表示
    ================================================= */

const teamScore =
    document.getElementById("soccerEditFinalTeamScore");

const opponentScore =
    document.getElementById("soccerEditFinalOpponentScore");

if(teamScore){
    teamScore.textContent = teamTotal;
}

if(opponentScore){
    opponentScore.textContent = opponentTotal;
}


    /* =================================================
       チーム名
    ================================================= */

    updateSoccerTeamNames(
        team,
        opponent
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


    if(penaltyEnabled){

        const penaltyTeam =
            getSoccerNumber(
                "soccerEditPenaltyTeam"
            );


        const penaltyOpponent =
            getSoccerNumber(
                "soccerEditPenaltyOpponent"
            );


        const penaltyPreview =
            document.getElementById(
                "soccerEditPenaltyPreview"
            );


        if(penaltyPreview){

            penaltyPreview.textContent =
                `${penaltyTeam} - ${penaltyOpponent}`;

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
   ⚽ ホーム / アウェイ表示
===================================================== */

function updateSoccerHomeAwayDisplay(){

    const homeAway =
        document.getElementById(
            "soccerEditHomeAway"
        )?.value ||
        "home";


    const team =
        document.getElementById(
            "soccerEditTeam"
        )?.value.trim() ||
        "応援チーム";


    const opponent =
        document.getElementById(
            "soccerEditOpponent"
        )?.value.trim() ||
        "相手チーム";


    const teamRow =
        document.getElementById(
            "soccerEditTeamRow"
        );


    const opponentRow =
        document.getElementById(
            "soccerEditOpponentRow"
        );


    if(
        !teamRow ||
        !opponentRow
    ){

        return;

    }


    const tbody =
        teamRow.parentElement;


    if(!tbody){

        return;

    }


    /* =================================================
       ホーム
    ================================================= */

    if(homeAway === "home"){

        if(
            tbody.firstElementChild !==
            teamRow
        ){

            tbody.insertBefore(
                teamRow,
                opponentRow
            );

        }

    }


    /* =================================================
       アウェイ
    ================================================= */

    else{

        if(
            tbody.firstElementChild !==
            opponentRow
        ){

            tbody.insertBefore(
                opponentRow,
                teamRow
            );

        }

    }


    /* =================================================
       表示名更新
    ================================================= */

    const rows =
        tbody.querySelectorAll(
            "tr"
        );


    if(rows.length < 2){

        return;

    }


    const firstName =
        rows[0].querySelector(
            ".soccer-score-team"
        );


    const secondName =
        rows[1].querySelector(
            ".soccer-score-team"
        );


    if(homeAway === "home"){

        if(firstName){

            firstName.textContent =
                team;

        }


        if(secondName){

            secondName.textContent =
                opponent;

        }

    }
    else{

        if(firstName){

            firstName.textContent =
                opponent;

        }


        if(secondName){

            secondName.textContent =
                team;

        }

    }

}


/* =====================================================
   ⚽ ホーム / アウェイ スコア入れ替え
===================================================== */

function swapSoccerHomeAwayScores(){

    const homeAway =
        document.getElementById(
            "soccerEditHomeAway"
        );


    if(!homeAway){

        return;

    }


    homeAway.value =
        homeAway.value === "home"
        ?
        "away"
        :
        "home";


    updateSoccerHomeAwayDisplay();

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
       通常時間
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

    saveSoccerGameData(
        sportsSelectedDate,
        game
    );


    console.log(
        "⚽ サッカー試合データ保存完了"
    );


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
        typeof saveSportsGameData ===
        "function"
    ){

        saveSportsGameData(
            date,
            game
        );

        return true;

    }


    /* =================================================
       念のため直接保存
    ================================================= */

    const data =
        db.load();


    if(!data.sportsCalendar){

        data.sportsCalendar =
            {};

    }


    if(!data.sportsCalendar.soccerGames){

        data.sportsCalendar.soccerGames =
            {};

    }


    data.sportsCalendar.soccerGames[
        date
    ] =
        game;


    db.save(
        data
    );


    return true;

}


/* =====================================================
   ⚽ 編集ページを閉じる
===================================================== */

function closeSoccerGameEditPage(){

    const editPage =
        document.getElementById(
            "soccerGameEditPage"
        );


    if(editPage){

        editPage.classList.remove(
            "active"
        );

        editPage.style.display =
            "none";

    }

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


        console.log(
            "sports-soccer-detail.html 読み込み成功"
        );


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
            "soccerGameDetailPage"
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


    /* =====================
       カレンダー非表示
    ===================== */

    sportsPage.classList.remove(
        "active"
    );

    sportsPage.style.display =
        "none";


    /* =====================
       結果ページ表示
    ===================== */

    detailPage.classList.add(
        "active"
    );

    detailPage.style.display =
        "block";


    /* =================================================
       結果HTML読み込み
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

        await loadSoccerGameDetailHTML();

    }


    /* =====================
       結果描画
    ===================== */

    renderSoccerGameDetail(
        date
    );

}


/* =====================================================
   ⚽ 試合結果描画
===================================================== */

function renderSoccerGameDetail(date){

const games = getCurrentSoccerGames();

    const game =
        games?.[date];


    if(!game){

        console.error(
            "❌ サッカー試合データがありません:",
            date
        );

        return;

    }


    const team =
        game.team ||
        "応援チーム";


    const opponent =
        game.opponent ||
        "相手チーム";


    const regularTeam =
        game.teamTotal ??
        calculateSoccerRegularTotal(
            game.firstHalf,
            game.secondHalf,
            game.extraFirstHalf,
            game.extraSecondHalf
        );


    const regularOpponent =
        game.opponentTotal ??
        calculateSoccerRegularTotal(
            game.firstHalf,
            game.secondHalf,
            game.extraFirstHalf,
            game.extraSecondHalf,
            true
        );


    /* =================================================
       通常スコア
    ================================================= */

    const regularScore =
        document.getElementById(
            "soccerDetailRegularScore"
        );


    if(regularScore){

        regularScore.textContent =
            `${regularTeam} - ${regularOpponent}`;

    }


    /* =================================================
       チーム名
    ================================================= */

    const teamName =
        document.getElementById(
            "soccerDetailTeam"
        );


    const opponentName =
        document.getElementById(
            "soccerDetailOpponent"
        );


    if(teamName){

        teamName.textContent =
            team;

    }


    if(opponentName){

        opponentName.textContent =
            opponent;

    }


    /* =================================================
       前半
    ================================================= */

    setSoccerDetailText(
        "soccerDetailFirstHalf",
        formatSoccerScore(
            game.firstHalf
        )
    );


    /* =================================================
       後半
    ================================================= */

    setSoccerDetailText(
        "soccerDetailSecondHalf",
        formatSoccerScore(
            game.secondHalf
        )
    );


    /* =================================================
       延長
    ================================================= */

    const extraArea =
        document.getElementById(
            "soccerDetailExtraTimeArea"
        );


    if(extraArea){

        extraArea.style.display =
            game.extraTime
            ?
            "block"
            :
            "none";

    }


    if(game.extraTime){

        setSoccerDetailText(
            "soccerDetailExtraFirstHalf",
            formatSoccerScore(
                game.extraFirstHalf
            )
        );


        setSoccerDetailText(
            "soccerDetailExtraSecondHalf",
            formatSoccerScore(
                game.extraSecondHalf
            )
        );

    }


    /* =================================================
       PK
    ================================================= */

    const penaltyArea =
        document.getElementById(
            "soccerDetailPenaltyArea"
        );


    if(penaltyArea){

        penaltyArea.style.display =
            game.penaltyShootout
            ?
            "block"
            :
            "none";

    }


    if(game.penaltyShootout){

        setSoccerDetailText(
            "soccerDetailPenalty",
            formatSoccerScore(
                game.penalty
            )
        );

    }


    /* =================================================
       結果
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

    if(!score){

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
        getCurrentSportsGames();


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


    delete games[
        sportsSelectedDate
    ];


    saveCurrentSportsGames(
        games
    );


    const deletedDate =
        sportsSelectedDate;


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
            "soccerGameDetailPage"
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
