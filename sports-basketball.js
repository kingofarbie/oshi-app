/* =========================================================
   🏀 バスケットボール
   ========================================================= */


/* =========================================================
   現在のバスケットボール試合
   ========================================================= */

function getCurrentBasketballGames(){

    const data =
        db.load();

    const sportsCalendar =
        data.sportsCalendar;

    if(
        !sportsCalendar ||
        !sportsCalendar.games
    ){
        return {};
    }

    const selectedIndex =
        sportsCalendar.selectedIndex ?? 0;

    return (
        sportsCalendar.games[selectedIndex] ||
        {}
    );
}


/* =========================================================
   バスケットボール編集ページを開く
   ========================================================= */

function openBasketballGameEditPage(date){

    sportsSelectedDate =
        date;

    const subPages =
        [
            "sportsGameList",
            "sportsGameDetailPage",
            "sportsGameEditPage"
        ];

    subPages.forEach(id => {

        const element =
            document.getElementById(id);

        if(element){
            element.style.display =
                "none";
        }

    });


    const editPage =
        document.getElementById(
            "sportsGameEditPage"
        );

    if(editPage){

        editPage.style.display =
            "block";

    }


    loadBasketballGameEditHTML();

}


/* =========================================================
   編集HTML読み込み
   ========================================================= */

function loadBasketballGameEditHTML(){

    const container =
        document.getElementById(
            "sportsGameEditContainer"
        );

    if(!container){
        return;
    }


    fetch(
        "./sports-basketball-edit.html"
    )
    .then(response => {

        if(!response.ok){
            throw new Error(
                "sports-basketball-edit.html 読み込み失敗"
            );
        }

        return response.text();

    })
    .then(html => {

        container.innerHTML =
            html;

        renderBasketballGameEditForm();

    })
    .catch(error => {

        console.error(
            "バスケットボール編集HTML読み込みエラー:",
            error
        );

    });

}


/* =========================================================
   編集対象の試合
   ========================================================= */

function getCurrentBasketballGameForEdit(){

    const games =
        getCurrentBasketballGames();

    if(
        !sportsSelectedDate
    ){
        return {};
    }

    return (
        games[sportsSelectedDate] ||
        {}
    );
}


/* =========================================================
   数値取得
   ========================================================= */

function getBasketballScoreValue(
    id
){

    const element =
        document.getElementById(id);

    if(!element){
        return 0;
    }

    const value =
        Number(element.value);

    if(
        !Number.isFinite(value) ||
        value < 0
    ){
        return 0;
    }

    return value;
}


/* =========================================================
   数値入力設定
   ========================================================= */

function setBasketballScoreInput(
    id,
    value
){

    const element =
        document.getElementById(id);

    if(!element){
        return;
    }

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){
        element.value =
            "";
        return;
    }

    element.value =
        value;

}


/* =========================================================
   延長戦のIDから番号取得
   ========================================================= */

function getBasketballOvertimeNumber(
    overtime
){

    if(
        typeof overtime !== "string"
    ){
        return null;
    }

    const match =
        overtime.match(/^OT(\d+)$/);

    if(!match){
        return null;
    }

    return Number(
        match[1]
    );

}


/* =========================================================
   延長戦を読み取る
   ========================================================= */

function getBasketballOvertimeScores(){

    const area =
        document.getElementById(
            "basketballOvertimeArea"
        );

    if(!area){
        return [];
    }

    const rows =
        area.querySelectorAll(
            ".basketball-overtime-row"
        );

    const overtimeScores = [];


    rows.forEach(row => {

        const number =
            Number(
                row.dataset.overtimeNumber
            );

        const teamInput =
            row.querySelector(
                ".basketball-overtime-team"
            );

        const opponentInput =
            row.querySelector(
                ".basketball-overtime-opponent"
            );

        if(
            !Number.isFinite(number) ||
            number < 1
        ){
            return;
        }


        const teamScore =
            Number(
                teamInput?.value
            );

        const opponentScore =
            Number(
                opponentInput?.value
            );


        overtimeScores.push({

            number,

            team:
                Number.isFinite(teamScore) &&
                teamScore >= 0
                    ? teamScore
                    : 0,

            opponent:
                Number.isFinite(opponentScore) &&
                opponentScore >= 0
                    ? opponentScore
                    : 0

        });

    });


    overtimeScores.sort(
        (a, b) =>
            a.number -
            b.number
    );


    return overtimeScores;

}


/* =========================================================
   延長戦合計
   ========================================================= */

function calculateBasketballOvertimeTotal(
    overtimeScores,
    opponent = false
){

    if(
        !Array.isArray(overtimeScores)
    ){
        return 0;
    }

    return overtimeScores.reduce(
        (
            total,
            overtime
        ) => {

            return (
                total +
                (
                    opponent
                        ? Number(
                            overtime.opponent
                        )
                        : Number(
                            overtime.team
                        )
                )
            );

        },
        0
    );

}


/* =========================================================
   通常＋延長 合計
   ========================================================= */

function calculateBasketballTotal(
    firstQuarter,
    secondQuarter,
    thirdQuarter,
    fourthQuarter,
    overtimeScores,
    opponent = false
){

    const baseTotal =

        Number(firstQuarter || 0) +

        Number(secondQuarter || 0) +

        Number(thirdQuarter || 0) +

        Number(fourthQuarter || 0);


    return (
        baseTotal +
        calculateBasketballOvertimeTotal(
            overtimeScores,
            opponent
        )
    );

}


/* =========================================================
   編集フォーム表示
   ========================================================= */

function renderBasketballGameEditForm(){

    const form =
        document.getElementById(
            "basketballGameEditForm"
        );

    if(!form){
        return;
    }


    /*
       現在のデータ
    */

    const data =
        db.load();


    const selectedIndex =
        typeof data.sportsCalendar?.selectedIndex === "number"
        ?
        data.sportsCalendar.selectedIndex
        :
        0;


    const favoriteSports =
        Array.isArray(
            data.sportsCalendar?.favoriteSports
        )
        ?
        data.sportsCalendar.favoriteSports
        :
        [];


    const currentFavorite =
        favoriteSports[selectedIndex] ||
        {};


    const game =
        getCurrentBasketballGameForEdit() ||
        {};


    /*
       タイトル
    */

    const title =
        document.getElementById(
            "basketballGameEditTitle"
        );

    if(title){

        title.textContent =
            sportsSelectedDate
                ?
                `🏀 ${sportsSelectedDate} 試合結果`
                :
                "🏀 試合結果";

    }


    /*
       =====================
       応援チーム
       =====================
    */

    const teamInput =
        document.getElementById(
            "basketballEditTeam"
        );

    if(teamInput){

        teamInput.value =
            currentFavorite.team ||
            game.team ||
            "";

    }


    /*
       =====================
       対戦相手
       =====================
    */

    const opponentInput =
        document.getElementById(
            "basketballEditOpponent"
        );

    if(opponentInput){

        opponentInput.value =
            game.opponent ||
            "";

    }


    /*
       =====================
       ホーム／アウェイ
       =====================
    */

    const homeAwaySelect =
        document.getElementById(
            "basketballEditHomeAway"
        );

    if(homeAwaySelect){

        homeAwaySelect.value =
            game.homeAway ||
            "home";

    }


    /*
       =====================
       結果
       =====================
    */

    const resultSelect =
        document.getElementById(
            "basketballEditResult"
        );

    if(resultSelect){

        resultSelect.value =
            game.result ||
            "";

    }


    /*
       =====================
       場所
       =====================
    */

    const locationInput =
        document.getElementById(
            "basketballEditLocation"
        );

    if(locationInput){

        locationInput.value =
            game.location ||
            "";

    }


    /*
       =====================
       メモ
       =====================
    */

    const memoInput =
        document.getElementById(
            "basketballEditMemo"
        );

    if(memoInput){

        memoInput.value =
            game.memo ||
            "";

    }


    /*
       =====================
       第1Q
       =====================
    */

    setBasketballScoreInput(
        "basketballEditFirstQuarterTeam",
        game.firstQuarter?.team
    );

    setBasketballScoreInput(
        "basketballEditFirstQuarterOpponent",
        game.firstQuarter?.opponent
    );


    /*
       =====================
       第2Q
       =====================
    */

    setBasketballScoreInput(
        "basketballEditSecondQuarterTeam",
        game.secondQuarter?.team
    );

    setBasketballScoreInput(
        "basketballEditSecondQuarterOpponent",
        game.secondQuarter?.opponent
    );


    /*
       =====================
       第3Q
       =====================
    */

    setBasketballScoreInput(
        "basketballEditThirdQuarterTeam",
        game.thirdQuarter?.team
    );

    setBasketballScoreInput(
        "basketballEditThirdQuarterOpponent",
        game.thirdQuarter?.opponent
    );


    /*
       =====================
       第4Q
       =====================
    */

    setBasketballScoreInput(
        "basketballEditFourthQuarterTeam",
        game.fourthQuarter?.team
    );

    setBasketballScoreInput(
        "basketballEditFourthQuarterOpponent",
        game.fourthQuarter?.opponent
    );


    /*
       =====================
       延長戦
       =====================
    */

    renderBasketballOvertimeRows(
        Array.isArray(game.overtime)
            ?
            game.overtime
            :
            []
    );


    /*
       =====================
       イベント登録
       =====================
    */

    bindBasketballEditEvents();


    /*
       =====================
       ホーム／アウェイ表示更新
       =====================
    */

    updateBasketballHomeAwayDisplay();


    /*
       =====================
       リアルタイム得点更新
       =====================
    */

    updateBasketballEditLive();

}



/* =========================================================
   編集イベント
   ========================================================= */

function bindBasketballEditEvents(){

    const inputIds =
        [

            "basketballEditOpponent",

            "basketballEditFirstQuarterTeam",
            "basketballEditFirstQuarterOpponent",

            "basketballEditSecondQuarterTeam",
            "basketballEditSecondQuarterOpponent",

            "basketballEditThirdQuarterTeam",
            "basketballEditThirdQuarterOpponent",

            "basketballEditFourthQuarterTeam",
            "basketballEditFourthQuarterOpponent",

            "basketballEditLocation",
            "basketballEditMemo"

        ];


    inputIds.forEach(id => {

        const element =
            document.getElementById(id);

        if(!element){
            return;
        }


        element.addEventListener(
            "input",
            updateBasketballEditLive
        );

        element.addEventListener(
            "change",
            updateBasketballEditLive
        );

    });


    const homeAway =
        document.getElementById(
            "basketballEditHomeAway"
        );

    if(homeAway){

        homeAway.addEventListener(
            "change",
            function(){

                updateBasketballHomeAwayDisplay();

                updateBasketballEditLive();

            }
        );

    }


    const addOvertimeButton =
        document.getElementById(
            "basketballAddOvertimeButton"
        );

    if(addOvertimeButton){

        addOvertimeButton.addEventListener(
            "click",
            addBasketballOvertime
        );

    }

}


/* =========================================================
   延長行を作る
   ========================================================= */

function createBasketballOvertimeRow(
    number,
    teamScore = "",
    opponentScore = ""
){

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "basketball-overtime-row";

    row.dataset.overtimeNumber =
        number;


    row.innerHTML = `

        <label>
            OT${number}
        </label>

        <input
            type="number"
            class="basketball-overtime-team"
            min="0"
            inputmode="numeric"
            value="${teamScore}"
        >

        <span>－</span>

        <input
            type="number"
            class="basketball-overtime-opponent"
            min="0"
            inputmode="numeric"
            value="${opponentScore}"
        >

        <button
            type="button"
            class="basketball-remove-overtime-button"
        >
            ×
        </button>

    `;


    const inputs =
        row.querySelectorAll(
            "input"
        );


    inputs.forEach(input => {

        input.addEventListener(
            "input",
            updateBasketballEditLive
        );

        input.addEventListener(
            "change",
            updateBasketballEditLive
        );

    });


    const removeButton =
        row.querySelector(
            ".basketball-remove-overtime-button"
        );


    if(removeButton){

        removeButton.addEventListener(
            "click",
            function(){

                row.remove();

                renumberBasketballOvertimeRows();

                updateBasketballEditLive();

            }
        );

    }


    return row;

}


/* =========================================================
   延長行を表示
   ========================================================= */

function renderBasketballOvertimeRows(
    overtimeScores
){

    const area =
        document.getElementById(
            "basketballOvertimeArea"
        );

    if(!area){
        return;
    }


    area.innerHTML =
        "";


    if(
        !Array.isArray(overtimeScores)
    ){
        return;
    }


    overtimeScores
        .sort(
            (a, b) =>
                Number(a.number || 0) -
                Number(b.number || 0)
        )
        .forEach(overtime => {

            const number =
                Number(
                    overtime.number
                );

            if(
                !Number.isFinite(number) ||
                number < 1
            ){
                return;
            }


            const row =
                createBasketballOvertimeRow(

                    number,

                    overtime.team ??
                        "",

                    overtime.opponent ??
                        ""

                );


            area.appendChild(
                row
            );

        });

}


/* =========================================================
   延長追加
   ========================================================= */

function addBasketballOvertime(){

    const area =
        document.getElementById(
            "basketballOvertimeArea"
        );

    if(!area){
        return;
    }


    const rows =
        area.querySelectorAll(
            ".basketball-overtime-row"
        );


    let maxNumber = 0;


    rows.forEach(row => {

        const number =
            Number(
                row.dataset.overtimeNumber
            );


        if(
            Number.isFinite(number) &&
            number > maxNumber
        ){
            maxNumber =
                number;
        }

    });


    const nextNumber =
        maxNumber + 1;


    const row =
        createBasketballOvertimeRow(
            nextNumber
        );


    area.appendChild(
        row
    );


    updateBasketballEditLive();


    const input =
        row.querySelector(
            ".basketball-overtime-team"
        );


    if(input){

        setTimeout(
            function(){

                input.focus();

            },
            0
        );

    }

}


/* =========================================================
   延長番号を振り直す
   ========================================================= */

function renumberBasketballOvertimeRows(){

    const area =
        document.getElementById(
            "basketballOvertimeArea"
        );

    if(!area){
        return;
    }


    const rows =
        area.querySelectorAll(
            ".basketball-overtime-row"
        );


    rows.forEach(
        (row, index) => {

            const number =
                index + 1;


            row.dataset.overtimeNumber =
                number;


            const label =
                row.querySelector(
                    "label"
                );


            if(label){

                label.textContent =
                    `OT${number}`;

            }

        }
    );

}


/* =========================================================
   ホーム／アウェイ表示
   ========================================================= */

function getBasketballEditTeamNames(){

    const teamInput =
        document.getElementById(
            "basketballEditTeam"
        );

    const opponentInput =
        document.getElementById(
            "basketballEditOpponent"
        );


    return {

        team:
            teamInput?.value ||
            "",

        opponent:
            opponentInput?.value ||
            ""

    };

}


/* =========================================================
   表示上のホーム／アウェイを取得
   ========================================================= */

function getBasketballDisplayedSides(){

    const names =
        getBasketballEditTeamNames();


    const homeAway =
        document.getElementById(
            "basketballEditHomeAway"
        )?.value ||
        "home";


    if(homeAway === "away"){

        return {

            leftName:
                names.opponent,

            rightName:
                names.team,

            leftIsTeam:
                false

        };

    }


    return {

        leftName:
            names.team,

        rightName:
            names.opponent,

        leftIsTeam:
            true

    };

}


/* =========================================================
   ホーム／アウェイ表示更新
   ========================================================= */

function updateBasketballHomeAwayDisplay(){

    const sides =
        getBasketballDisplayedSides();


    /*
       🏀 チーム名表示
    */

    const teamNameElements =
        document.querySelectorAll(
            "[data-basketball-team-name]"
        );


    teamNameElements.forEach(
        element => {

            element.textContent =
                sides.leftIsTeam
                    ? sides.leftName
                    : sides.rightName;

        }
    );


    /*
       🏀 相手チーム名表示
    */

    const opponentNameElements =
        document.querySelectorAll(
            "[data-basketball-opponent-name]"
        );


    opponentNameElements.forEach(
        element => {

            element.textContent =
                sides.leftIsTeam
                    ? sides.rightName
                    : sides.leftName;

        }
    );


    /*
       🏀 Q1〜Q4
       ホーム／アウェイの左右を入れ替える
    */

    const quarterPairs = [

        [
            "basketballEditFirstQuarterTeam",
            "basketballEditFirstQuarterOpponent"
        ],

        [
            "basketballEditSecondQuarterTeam",
            "basketballEditSecondQuarterOpponent"
        ],

        [
            "basketballEditThirdQuarterTeam",
            "basketballEditThirdQuarterOpponent"
        ],

        [
            "basketballEditFourthQuarterTeam",
            "basketballEditFourthQuarterOpponent"
        ]

    ];


    /*
       現在のDOM上の左右と
       表示したい左右が違う場合だけ入れ替える
    */

    quarterPairs.forEach(
        pair => {

            const teamInput =
                document.getElementById(
                    pair[0]
                );

            const opponentInput =
                document.getElementById(
                    pair[1]
                );


            if(
                !teamInput ||
                !opponentInput
            ){
                return;
            }


            const teamIsLeft =
                teamInput.compareDocumentPosition(
                    opponentInput
                ) &
                Node.DOCUMENT_POSITION_FOLLOWING;


            const shouldTeamBeLeft =
                sides.leftIsTeam;


            if(
                Boolean(teamIsLeft) !==
                shouldTeamBeLeft
            ){

                swapBasketballScoreInputs(
                    teamInput,
                    opponentInput
                );

            }

        }
    );


    /*
       🏀 横方向の表示を更新
    */

    updateBasketballHorizontalScoreDisplay(
        sides
    );


    /*
       🏀 合計得点の左右表示を更新
    */

    updateBasketballDisplayedTotalOrder(
        sides
    );

}


/* =========================================================
   ホーム／アウェイに合わせて左右スコア表示を更新
   ========================================================= */

function updateBasketballHorizontalScoreDisplay(
    sides
){

    const periods =
        [

            "FirstQuarter",
            "SecondQuarter",
            "ThirdQuarter",
            "FourthQuarter"

        ];


    periods.forEach(period => {

        const teamInput =
            document.getElementById(
                `basketballEdit${period}Team`
            );

        const opponentInput =
            document.getElementById(
                `basketballEdit${period}Opponent`
            );


        if(
            !teamInput ||
            !opponentInput
        ){
            return;
        }


        if(sides.leftIsTeam){

            teamInput.dataset.basketballSide =
                "left";

            opponentInput.dataset.basketballSide =
                "right";

        }else{

            teamInput.dataset.basketballSide =
                "right";

            opponentInput.dataset.basketballSide =
                "left";

        }

    });


    const overtimeRows =
        document.querySelectorAll(
            ".basketball-overtime-row"
        );


    overtimeRows.forEach(row => {

        const teamInput =
            row.querySelector(
                ".basketball-overtime-team"
            );

        const opponentInput =
            row.querySelector(
                ".basketball-overtime-opponent"
            );


        if(
            !teamInput ||
            !opponentInput
        ){
            return;
        }


        if(sides.leftIsTeam){

            teamInput.dataset.basketballSide =
                "left";

            opponentInput.dataset.basketballSide =
                "right";

        }else{

            teamInput.dataset.basketballSide =
                "right";

            opponentInput.dataset.basketballSide =
                "left";

        }

    });


    updateBasketballDisplayedTotalOrder(
        sides
    );

}


/* =========================================================
   合計得点の左右表示
   ========================================================= */

function updateBasketballDisplayedTotalOrder(
    sides
){

    const teamTotal =
        document.getElementById(
            "basketballEditTeamTotal"
        );

    const opponentTotal =
        document.getElementById(
            "basketballEditOpponentTotal"
        );


    const dash =
        document.querySelector(
            ".basketball-score-dash"
        );


    if(
        !teamTotal ||
        !opponentTotal ||
        !dash
    ){
        return;
    }


    if(
        !sides.leftIsTeam
    ){

        teamTotal.dataset.basketballSide =
            "right";

        opponentTotal.dataset.basketballSide =
            "left";

    }else{

        teamTotal.dataset.basketballSide =
            "left";

        opponentTotal.dataset.basketballSide =
            "right";

    }

}


/* =========================================================
   ホーム／アウェイ変更
   ========================================================= */

function swapBasketballHomeAwayScores(){

    const select =
        document.getElementById(
            "basketballEditHomeAway"
        );

    if(!select){
        return;
    }


    select.value =
        select.value === "home"
            ? "away"
            : "home";


    updateBasketballHomeAwayDisplay();

    updateBasketballEditLive();

}


/* =========================================================
   チーム名更新
   ========================================================= */

function updateBasketballTeamNames(){

    updateBasketballHomeAwayDisplay();

}


/* =========================================================
   リアルタイム合計
   ========================================================= */

function updateBasketballEditLive(){

    const firstQuarterTeam =
        getBasketballScoreValue(
            "basketballEditFirstQuarterTeam"
        );

    const firstQuarterOpponent =
        getBasketballScoreValue(
            "basketballEditFirstQuarterOpponent"
        );


    const secondQuarterTeam =
        getBasketballScoreValue(
            "basketballEditSecondQuarterTeam"
        );

    const secondQuarterOpponent =
        getBasketballScoreValue(
            "basketballEditSecondQuarterOpponent"
        );


    const thirdQuarterTeam =
        getBasketballScoreValue(
            "basketballEditThirdQuarterTeam"
        );

    const thirdQuarterOpponent =
        getBasketballScoreValue(
            "basketballEditThirdQuarterOpponent"
        );


    const fourthQuarterTeam =
        getBasketballScoreValue(
            "basketballEditFourthQuarterTeam"
        );

    const fourthQuarterOpponent =
        getBasketballScoreValue(
            "basketballEditFourthQuarterOpponent"
        );


    const overtimeScores =
        getBasketballOvertimeScores();


    const teamTotal =
        calculateBasketballTotal(

            firstQuarterTeam,
            secondQuarterTeam,
            thirdQuarterTeam,
            fourthQuarterTeam,

            overtimeScores,

            false

        );


    const opponentTotal =
        calculateBasketballTotal(

            firstQuarterOpponent,
            secondQuarterOpponent,
            thirdQuarterOpponent,
            fourthQuarterOpponent,

            overtimeScores,

            true

        );


    const teamTotalElement =
        document.getElementById(
            "basketballEditTeamTotal"
        );


    const opponentTotalElement =
        document.getElementById(
            "basketballEditOpponentTotal"
        );


    if(teamTotalElement){

        teamTotalElement.textContent =
            teamTotal;

    }


    if(opponentTotalElement){

        opponentTotalElement.textContent =
            opponentTotal;

    }


    const finalTeamScore =
        document.getElementById(
            "basketballEditFinalTeamScore"
        );


    const finalOpponentScore =
        document.getElementById(
            "basketballEditFinalOpponentScore"
        );


    if(finalTeamScore){

        finalTeamScore.textContent =
            teamTotal;

    }


    if(finalOpponentScore){

        finalOpponentScore.textContent =
            opponentTotal;

    }


    updateBasketballHomeAwayDisplay();

}


/* =========================================================
   自動勝敗判定
   ========================================================= */

function calculateBasketballResult(
    teamTotal,
    opponentTotal
){

    if(
        teamTotal >
        opponentTotal
    ){
        return "win";
    }


    if(
        teamTotal <
        opponentTotal
    ){
        return "lose";
    }


    return "draw";

}


/* =========================================================
   試合結果ラベル
   ========================================================= */

function getBasketballResultLabel(
    result
){

    if(result === "win"){
        return "○ 勝ち";
    }

    if(result === "lose"){
        return "× 負け";
    }

    if(result === "draw"){
        return "△ 引分";
    }

    if(result === "scheduled"){
        return "－ 予定";
    }

    if(result === "cancelled"){
        return "中止";
    }

    if(result === "postponed"){
        return "延期";
    }

    return "";

}


/* =========================================================
   試合結果保存
   ========================================================= */

function saveBasketballGameFromEditPage(){

    const date =
        sportsSelectedDate;


    if(!date){

        alert(
            "試合日が取得できません。"
        );

        return;

    }


    const team =
        document.getElementById(
            "basketballEditTeam"
        )?.value.trim() ||
        "";


    const opponent =
        document.getElementById(
            "basketballEditOpponent"
        )?.value.trim() ||
        "";


    if(!team){

        alert(
            "応援チームを確認してください。"
        );

        return;

    }


    if(!opponent){

        alert(
            "相手チームを入力してください。"
        );

        return;

    }


    const homeAway =
        document.getElementById(
            "basketballEditHomeAway"
        )?.value ||
        "home";


    const resultSelect =
        document.getElementById(
            "basketballEditResult"
        );


    const manualResult =
        resultSelect?.value ||
        "";


    const location =
        document.getElementById(
            "basketballEditLocation"
        )?.value.trim() ||
        "";


    const memo =
        document.getElementById(
            "basketballEditMemo"
        )?.value ||
        "";


    /* =====================
       Q1～Q4
       ===================== */

    const firstQuarterTeam =
        getBasketballScoreValue(
            "basketballEditFirstQuarterTeam"
        );

    const firstQuarterOpponent =
        getBasketballScoreValue(
            "basketballEditFirstQuarterOpponent"
        );


    const secondQuarterTeam =
        getBasketballScoreValue(
            "basketballEditSecondQuarterTeam"
        );

    const secondQuarterOpponent =
        getBasketballScoreValue(
            "basketballEditSecondQuarterOpponent"
        );


    const thirdQuarterTeam =
        getBasketballScoreValue(
            "basketballEditThirdQuarterTeam"
        );

    const thirdQuarterOpponent =
        getBasketballScoreValue(
            "basketballEditThirdQuarterOpponent"
        );


    const fourthQuarterTeam =
        getBasketballScoreValue(
            "basketballEditFourthQuarterTeam"
        );

    const fourthQuarterOpponent =
        getBasketballScoreValue(
            "basketballEditFourthQuarterOpponent"
        );


    const overtimeScores =
        getBasketballOvertimeScores();


    const teamTotal =
        calculateBasketballTotal(

            firstQuarterTeam,
            secondQuarterTeam,
            thirdQuarterTeam,
            fourthQuarterTeam,

            overtimeScores,

            false

        );


    const opponentTotal =
        calculateBasketballTotal(

            firstQuarterOpponent,
            secondQuarterOpponent,
            thirdQuarterOpponent,
            fourthQuarterOpponent,

            overtimeScores,

            true

        );


    let finalResult =
        manualResult;


    /* =====================
       結果未設定なら自動判定
       ===================== */

    if(
        !finalResult
    ){

        finalResult =
            calculateBasketballResult(
                teamTotal,
                opponentTotal
            );

    }


    const game = {

        sport:
            "basketball",

        team,

        opponent,

        homeAway,

        firstQuarter: {

            team:
                firstQuarterTeam,

            opponent:
                firstQuarterOpponent

        },

        secondQuarter: {

            team:
                secondQuarterTeam,

            opponent:
                secondQuarterOpponent

        },

        thirdQuarter: {

            team:
                thirdQuarterTeam,

            opponent:
                thirdQuarterOpponent

        },

        fourthQuarter: {

            team:
                fourthQuarterTeam,

            opponent:
                fourthQuarterOpponent

        },

        overtime:
            overtimeScores,

        teamTotal,

        opponentTotal,

        result:
            finalResult,

        location,

        memo,

        updatedAt:
            new Date().toISOString()

    };


    saveBasketballGameData(
        date,
        game
    );


    closeSportsGameEditPage();

}


/* =========================================================
   バスケットボールデータ保存
   ========================================================= */

function saveBasketballGameData(
    date,
    game
){

    saveSportsGameData(
        date,
        game
    );

}


/* =========================================================
   結果画面
   ========================================================= */

function showBasketballGameDetail(date){

    const detail =
        document.getElementById(
            "sportsGameDetail"
        );

    if(!detail){

        console.error(
            "❌ sportsGameDetail が見つかりません"
        );

        return;
    }


    const games =
        getCurrentBasketballGames();


    const game =
        games?.[date];


    if(
        !game ||
        game.sport !== "basketball"
    ){

        console.error(
            "❌ バスケットボール試合データがありません:",
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
       ホーム / アウェイによる表示順

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
       第1Q～第4Q
    ================================================= */

    const firstQuarterTeam =
        Number(
            game.firstQuarter?.team || 0
        );


    const firstQuarterOpponent =
        Number(
            game.firstQuarter?.opponent || 0
        );


    const secondQuarterTeam =
        Number(
            game.secondQuarter?.team || 0
        );


    const secondQuarterOpponent =
        Number(
            game.secondQuarter?.opponent || 0
        );


    const thirdQuarterTeam =
        Number(
            game.thirdQuarter?.team || 0
        );


    const thirdQuarterOpponent =
        Number(
            game.thirdQuarter?.opponent || 0
        );


    const fourthQuarterTeam =
        Number(
            game.fourthQuarter?.team || 0
        );


    const fourthQuarterOpponent =
        Number(
            game.fourthQuarter?.opponent || 0
        );


    /* =================================================
       延長戦
    ================================================= */

    const overtimeScores =
        Array.isArray(game.overtime)
            ?
            game.overtime
            :
            [];


    /* =================================================
       通常＋延長 合計

       team / opponent のデータを
       まず応援チーム基準で計算する。

       その後、
       homeAway に応じて左右を決める。
    ================================================= */

    const teamTotal =
        calculateBasketballTotal(

            firstQuarterTeam,
            secondQuarterTeam,
            thirdQuarterTeam,
            fourthQuarterTeam,

            overtimeScores,

            false

        );


    const opponentTotal =
        calculateBasketballTotal(

            firstQuarterOpponent,
            secondQuarterOpponent,
            thirdQuarterOpponent,
            fourthQuarterOpponent,

            overtimeScores,

            true

        );


    const leftTotal =
        leftIsTeam
            ?
            teamTotal
            :
            opponentTotal;


    const rightTotal =
        leftIsTeam
            ?
            opponentTotal
            :
            teamTotal;


    /* =================================================
       結果画面HTML

       ⚠️ サッカーと同じく
       結果画面そのものに
       閉じる / 編集ボタンを持たせる
    ================================================= */

    detail.innerHTML = `

        <form
            id="basketballGameDetailForm"
            class="
                basketball-edit-screen
                basketball-detail-screen
            "
        >

            <h2 id="basketballGameDetailTitle">
                🏀 試合結果
            </h2>


            <!-- =====================
                 試合日
            ====================== -->

            <div class="basketball-detail-date">

                ${escapeSportsHTML(
                    formatBasketballDate(date)
                )}

            </div>


            <!-- =====================
                 ホーム・アウェイ
            ====================== -->

            <div class="basketball-view-match">

                <!-- ホーム -->

                <div class="basketball-view-team">

                    <div class="basketball-view-side">
                        ホーム
                    </div>

                    <div class="basketball-view-team-name">

                        ${escapeSportsHTML(
                            leftName
                        )}

                    </div>

                    <div class="basketball-view-team-score">

                        ${leftTotal}

                    </div>

                </div>


                <!-- 区切り -->

                <div class="
                    basketball-view-score-separator
                ">
                    －
                </div>


                <!-- アウェイ -->

                <div class="basketball-view-team">

                    <div class="basketball-view-side">
                        アウェイ
                    </div>

                    <div class="basketball-view-team-name">

                        ${escapeSportsHTML(
                            rightName
                        )}

                    </div>

                    <div class="basketball-view-team-score">

                        ${rightTotal}

                    </div>

                </div>

            </div>


            <!-- =====================
                 第1Q
            ====================== -->

            <div class="
                basketball-detail-score-section
            ">

                <div class="
                    basketball-detail-score-row
                ">

                    <label>
                        第1Q
                    </label>

                    <span>

                        ${
                            leftIsTeam
                                ?
                                firstQuarterTeam
                                :
                                firstQuarterOpponent
                        }

                    </span>

                    <strong>
                        －
                    </strong>

                    <span>

                        ${
                            leftIsTeam
                                ?
                                firstQuarterOpponent
                                :
                                firstQuarterTeam
                        }

                    </span>

                </div>


                <!-- =====================
                     第2Q
                ====================== -->

                <div class="
                    basketball-detail-score-row
                ">

                    <label>
                        第2Q
                    </label>

                    <span>

                        ${
                            leftIsTeam
                                ?
                                secondQuarterTeam
                                :
                                secondQuarterOpponent
                        }

                    </span>

                    <strong>
                        －
                    </strong>

                    <span>

                        ${
                            leftIsTeam
                                ?
                                secondQuarterOpponent
                                :
                                secondQuarterTeam
                        }

                    </span>

                </div>


                <!-- =====================
                     第3Q
                ====================== -->

                <div class="
                    basketball-detail-score-row
                ">

                    <label>
                        第3Q
                    </label>

                    <span>

                        ${
                            leftIsTeam
                                ?
                                thirdQuarterTeam
                                :
                                thirdQuarterOpponent
                        }

                    </span>

                    <strong>
                        －
                    </strong>

                    <span>

                        ${
                            leftIsTeam
                                ?
                                thirdQuarterOpponent
                                :
                                thirdQuarterTeam
                        }

                    </span>

                </div>


                <!-- =====================
                     第4Q
                ====================== -->

                <div class="
                    basketball-detail-score-row
                ">

                    <label>
                        第4Q
                    </label>

                    <span>

                        ${
                            leftIsTeam
                                ?
                                fourthQuarterTeam
                                :
                                fourthQuarterOpponent
                        }

                    </span>

                    <strong>
                        －
                    </strong>

                    <span>

                        ${
                            leftIsTeam
                                ?
                                fourthQuarterOpponent
                                :
                                fourthQuarterTeam
                        }

                    </span>

                </div>


                <!-- =====================
                     延長
                ====================== -->

                ${
                    overtimeScores.length
                        ?
                        `
                            <div class="
                                basketball-detail-overtime
                            ">

                                ${
                                    overtimeScores
                                        .map(
                                            overtime => {

                                                const overtimeTeam =
                                                    Number(
                                                        overtime.team ||
                                                        0
                                                    );


                                                const overtimeOpponent =
                                                    Number(
                                                        overtime.opponent ||
                                                        0
                                                    );


                                                const leftScore =
                                                    leftIsTeam
                                                        ?
                                                        overtimeTeam
                                                        :
                                                        overtimeOpponent;


                                                const rightScore =
                                                    leftIsTeam
                                                        ?
                                                        overtimeOpponent
                                                        :
                                                        overtimeTeam;


                                                return `

                                                    <div class="
                                                        basketball-detail-score-row
                                                    ">

                                                        <label>

                                                            OT${Number(
                                                                overtime.number ||
                                                                0
                                                            )}

                                                        </label>

                                                        <span>

                                                            ${leftScore}

                                                        </span>

                                                        <strong>
                                                            －
                                                        </strong>

                                                        <span>

                                                            ${rightScore}

                                                        </span>

                                                    </div>

                                                `;

                                            }
                                        )
                                        .join("")
                                }

                            </div>
                        `
                        :
                        ""
                }

            </div>


            <!-- =====================
                 結果
            ====================== -->

            <div class="
                basketball-info-section
            ">

                <label>
                    結果
                </label>

                <div
                    id="basketballDetailResult"
                    class="basketball-view-result ${
                        escapeSportsHTML(
                            game.result || ""
                        )
                    }"
                >

                    ${escapeSportsHTML(
                        getBasketballResultLabel(
                            game.result
                        )
                    )}

                </div>

            </div>


            <!-- =====================
                 場所
            ====================== -->

            ${
                game.location
                    ?
                    `
                        <div class="
                            basketball-info-section
                        ">

                            <label>
                                場所
                            </label>

                            <div class="
                                basketball-detail-info
                            ">

                                <div>
                                    ${escapeSportsHTML(
                                        game.location
                                    )}
                                </div>

                            </div>

                        </div>
                    `
                    :
                    ""
            }


            <!-- =====================
                 メモ
            ====================== -->

            ${
                game.memo
                    ?
                    `
                        <div class="
                            basketball-info-section
                        ">

                            <label>
                                メモ
                            </label>

                            <div class="
                                basketball-detail-info
                            ">

                                <div>
                                    ${escapeSportsHTML(
                                        game.memo
                                    )}
                                </div>

                            </div>

                        </div>
                    `
                    :
                    ""
            }


            <!-- =====================
                 ボタン
            ====================== -->

            <div class="
                basketball-edit-buttons
            ">

                <button
                    type="button"
                    onclick="closeSportsGameDetailPage()"
                >
                    閉じる
                </button>


                <button
                    type="button"
                    onclick="
                        openSportsGameEditPage(
                            sportsSelectedDate
                        )
                    "
                >
                    編集
                </button>

            </div>


        </form>

    `;

}



/* =========================================================
   日付表示
   ========================================================= */

function formatBasketballDate(
    date
){

    if(!date){
        return "";
    }


    const parts =
        date.split("-");


    if(parts.length !== 3){
        return date;
    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);


    const dateObject =
        new Date(
            year,
            month - 1,
            day
        );


    if(
        Number.isNaN(
            dateObject.getTime()
        )
    ){
        return date;
    }


    const weekdays =
        [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ];


    return `
        ${year}年${month}月${day}日
        （${weekdays[
            dateObject.getDay()
        ]}）
    `.replace(
        /\s+/g,
        ""
    );

}


/* =========================================================
   結果画面編集
   ========================================================= */

function editBasketballGame(){

    if(!sportsSelectedDate){
        return;
    }


    openBasketballGameEditPage(
        sportsSelectedDate
    );

}


/* =========================================================
   結果削除
   ========================================================= */

function deleteBasketballGame(){

    if(!sportsSelectedDate){
        return;
    }


    const confirmed =
        confirm(
            "この試合結果を削除しますか？"
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
            data.sportsCalendar.selectedIndex ?? 0;


        const games =
            data.sportsCalendar
                .games[selectedIndex];


        if(
            games &&
            games[sportsSelectedDate]
        ){

            delete games[
                sportsSelectedDate
            ];

        }


        db.save(
            data
        );

    }


    closeSportsGameDetailPage();

}


/* =========================================================
   互換用
   ========================================================= */

function renderBasketballGameView(
    date
){

    showBasketballGameDetail(
        date
    );

}


/* =========================================================
   初期化
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const form =
            document.getElementById(
                "basketballGameEditForm"
            );


        if(form){

            renderBasketballGameEditForm();

        }

    }
);




function swapBasketballScoreInputs(firstInput, secondInput) {

    if (!firstInput || !secondInput) return;

    const parent =
        firstInput.parentElement;

    if (!parent || parent !== secondInput.parentElement) {
        return;
    }

    const marker =
        document.createComment("basketball-score-swap");

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