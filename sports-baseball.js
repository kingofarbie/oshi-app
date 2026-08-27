/* =====================================================
   ⚾ 野球
   sports-baseball.js

   野球専用処理。
===================================================== */




/* =====================================================
   ⚾ 閲覧画面 → 編集画面
===================================================== */

function editBaseballGame(){

    if(!sportsSelectedDate){

        return;

    }


    const date =
        sportsSelectedDate;


    const games =
        getCurrentSportsGames();


    const game =
        games[date] ||
        null;


    closeSportsGameDetailModal();


    openBaseballGameForm(
        date,
        game
    );

}


/* =====================================================
   ⚾ 試合詳細モーダルを閉じる
===================================================== */

function closeSportsGameDetailModal(){

    const modal =
        document.getElementById(
            "sportsGameDetailModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }


    sportsSelectedDate =
        null;

}










/* =====================================================
   野球試合入力画面
===================================================== */

function openBaseballGameForm(
    date,
    game
){

    const modal =
        document.getElementById(
            "sportsGameModal"
        );


    const form =
        document.getElementById(
            "sportsGameForm"
        );


    const title =
        document.getElementById(
            "sportsGameModalTitle"
        );


    if(
        !modal ||
        !form
    ){

        return;

    }


    const data =
        db.load();


    const team =
        data.sportsCalendar?.team ||
        "自分のチーム";


    /* =====================
       既存データ
    ===================== */

    const opponent =
        game?.opponent ||
        "";


    const teamScores =
        Array.isArray(
            game?.teamScores
        )
        ?
        game.teamScores
        :
        Array(12).fill("");


    const opponentScores =
        Array.isArray(
            game?.opponentScores
        )
        ?
        game.opponentScores
        :
        Array(12).fill("");


    const memo =
        game?.memo ||
        "";


    if(title){

        title.innerHTML =
            `⚾ ${escapeSportsHTML(date)} 試合記録`;

    }


    /* =================================================
       スコアボード
    ================================================= */

    let scoreboard = `

        <div class="baseball-opponent-area">

            <label>
                対戦相手
            </label>

            <input
                id="baseballOpponent"
                type="text"
                value="${escapeSportsHTML(opponent)}"
                placeholder="例：巨人"
            >

        </div>


        <div class="baseball-score-wrapper">

            <div class="baseball-score-scroll">

                <table class="baseball-score-table">

                    <thead>

                        <tr>

                            <th>
                                チーム
                            </th>

    `;


    for(
        let inning = 1;
        inning <= 12;
        inning++
    ){

        scoreboard += `
            <th>${inning}</th>
        `;

    }


    scoreboard += `

                            <th>
                                計
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        <tr>

                            <th>
                                ${escapeSportsHTML(team)}
                            </th>

    `;


    for(
        let inning = 0;
        inning < 12;
        inning++
    ){

        scoreboard += `

            <td>

                <input
                    type="number"
                    min="0"
                    max="99"
                    class="baseball-score-input"
                    data-team-inning="${inning}"
                    value="${escapeSportsHTML(
                        teamScores[inning]
                    )}"
                >

            </td>

        `;

    }


    scoreboard += `

                            <td>

                                <strong
                                    id="baseballTeamTotal"
                                >
                                    ${calculateBaseballTotal(
                                        teamScores
                                    )}
                                </strong>

                            </td>

                        </tr>


                        <tr>

                            <th>
                                <span
                                    id="baseballOpponentLabel"
                                >
                                    ${escapeSportsHTML(
                                        opponent ||
                                        "対戦相手"
                                    )}
                                </span>
                            </th>

    `;


    for(
        let inning = 0;
        inning < 12;
        inning++
    ){

        scoreboard += `

            <td>

                <input
                    type="number"
                    min="0"
                    max="99"
                    class="baseball-score-input"
                    data-opponent-inning="${inning}"
                    value="${escapeSportsHTML(
                        opponentScores[inning]
                    )}"
                >

            </td>

        `;

    }


    scoreboard += `

                            <td>

                                <strong
                                    id="baseballOpponentTotal"
                                >
                                    ${calculateBaseballTotal(
                                        opponentScores
                                    )}
                                </strong>

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>


        <div class="baseball-final-score">

            <span>
                ${escapeSportsHTML(team)}
            </span>

            <strong id="baseballFinalScore">
                ${calculateBaseballTotal(teamScores)}
                -
                ${calculateBaseballTotal(opponentScores)}
            </strong>

            <span
                id="baseballFinalOpponent"
            >
                ${escapeSportsHTML(
                    opponent ||
                    "対戦相手"
                )}
            </span>

        </div>


        <div class="baseball-result-area">

            <label>
                試合結果
            </label>

            <select id="baseballResult">

                <option value="">
                    選択してください
                </option>

                <option
                    value="win"
                    ${game?.result === "win" ? "selected" : ""}
                >
                    🏆 勝ち
                </option>

                <option
                    value="lose"
                    ${game?.result === "lose" ? "selected" : ""}
                >
                    😢 負け
                </option>

                <option
                    value="draw"
                    ${game?.result === "draw" ? "selected" : ""}
                >
                    🤝 引き分け
                </option>

            </select>

        </div>


        <div class="baseball-memo-area">

            <label>
                📝 メモ
            </label>

            <textarea
                id="baseballMemo"
                rows="5"
                placeholder="試合のメモを入力..."
            >${escapeSportsHTML(memo)}</textarea>

        </div>

    `;


    form.innerHTML =
        scoreboard;


    /* =================================================
       入力イベント
    ================================================= */

    const opponentInput =
        document.getElementById(
            "baseballOpponent"
        );


    if(opponentInput){

        opponentInput.addEventListener(
            "input",
            updateBaseballLiveScore
        );

    }


    const scoreInputs =
        form.querySelectorAll(
            ".baseball-score-input"
        );


    scoreInputs.forEach(
        input => {

            input.addEventListener(
                "input",
                updateBaseballLiveScore
            );

        }
    );


    /* =================================================
       モーダル表示
    ================================================= */

    modal.style.display =
        "block";

}


/* =====================================================
   リアルタイム合計
===================================================== */

function updateBaseballLiveScore(){

    const teamInputs =
        document.querySelectorAll(
            "[data-team-inning]"
        );


    const opponentInputs =
        document.querySelectorAll(
            "[data-opponent-inning]"
        );


    const teamScores =
        Array.from(
            teamInputs
        ).map(
            input =>
                input.value
        );


    const opponentScores =
        Array.from(
            opponentInputs
        ).map(
            input =>
                input.value
        );


    const teamTotal =
        calculateBaseballTotal(
            teamScores
        );


    const opponentTotal =
        calculateBaseballTotal(
            opponentScores
        );


    const teamTotalElement =
        document.getElementById(
            "baseballTeamTotal"
        );


    const opponentTotalElement =
        document.getElementById(
            "baseballOpponentTotal"
        );


    const finalScore =
        document.getElementById(
            "baseballFinalScore"
        );


    if(teamTotalElement){

        teamTotalElement.textContent =
            teamTotal;

    }


    if(opponentTotalElement){

        opponentTotalElement.textContent =
            opponentTotal;

    }


    if(finalScore){

        finalScore.textContent =
            `${teamTotal} - ${opponentTotal}`;

    }


    const opponentInput =
        document.getElementById(
            "baseballOpponent"
        );


    const opponentLabel =
        document.getElementById(
            "baseballOpponentLabel"
        );


    const finalOpponent =
        document.getElementById(
            "baseballFinalOpponent"
        );


    const opponent =
        opponentInput
        ? opponentInput.value.trim()
        : "";


    if(opponentLabel){

        opponentLabel.textContent =
            opponent ||
            "対戦相手";

    }


    if(finalOpponent){

        finalOpponent.textContent =
            opponent ||
            "対戦相手";

    }

}


/* =====================================================
   野球試合保存
===================================================== */

function saveSportsGame(){

    if(!sportsSelectedDate){

        alert(
            "日付が選択されていません。"
        );

        return;

    }


    const opponentInput =
        document.getElementById(
            "baseballOpponent"
        );


    const resultSelect =
        document.getElementById(
            "baseballResult"
        );


    const memoInput =
        document.getElementById(
            "baseballMemo"
        );


    const opponent =
        opponentInput
        ? opponentInput.value.trim()
        : "";


    if(!opponent){

        alert(
            "対戦相手を入力してください。"
        );

        if(opponentInput){

            opponentInput.focus();

        }

        return;

    }


    /* =================================================
       スコア取得
    ================================================= */

    const teamInputs =
        document.querySelectorAll(
            "[data-team-inning]"
        );


    const opponentInputs =
        document.querySelectorAll(
            "[data-opponent-inning]"
        );


    const teamScores =
        Array.from(
            teamInputs
        ).map(
            input => {

                if(
                    input.value === ""
                ){

                    return "";

                }

                return Number(
                    input.value
                );

            }
        );


    const opponentScores =
        Array.from(
            opponentInputs
        ).map(
            input => {

                if(
                    input.value === ""
                ){

                    return "";

                }

                return Number(
                    input.value
                );

            }
        );


    const teamTotal =
        calculateBaseballTotal(
            teamScores
        );


    const opponentTotal =
        calculateBaseballTotal(
            opponentScores
        );


    /* =================================================
       データ
    ================================================= */

    const game = {

        sport:
            "baseball",

        opponent:
            opponent,

        teamScores:
            teamScores,

        opponentScores:
            opponentScores,

        teamTotal:
            teamTotal,

        opponentTotal:
            opponentTotal,

        result:
            resultSelect
            ? resultSelect.value
            : "",

        memo:
            memoInput
            ? memoInput.value.trim()
            : "",

        updatedAt:
            new Date().toISOString()

    };


    /* =================================================
       保存
    ================================================= */

    saveSportsGameData(
        sportsSelectedDate,
        game
    );


closeSportsGameModal();


/*
   保存後は
   今保存した試合の閲覧ページへ移動
*/

const savedDate =
    sportsSelectedDate;


if(savedDate){

    openBaseballGameDetailPage(
        savedDate
    );

}

/*
   保存完了メッセージは
   閲覧画面を邪魔するので表示しない
*/
}


/* =====================================================
   野球データ削除
===================================================== */
function deleteBaseballGame(){

    if(!sportsSelectedDate){

        return;

    }


    const data =
        db.load();


    if(!data.sportsCalendar){

        return;

    }


    /*
       現在選択中スポーツの games を取得

       ※ sportsCalendar.games[日付]
       ではなく、

       sportsCalendar.games[selectedIndex][日付]

       を扱うため、必ず
       getCurrentSportsGames()
       を使用する。
    */

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


    /*
       現在選択中スポーツの
       試合データだけ削除
    */

    delete games[
        sportsSelectedDate
    ];


    /*
       現在選択中スポーツの games を保存
    */

    saveCurrentSportsGames(
        games
    );


    /*
       モーダルを閉じる
    */

    closeSportsGameDetailModal();


    /*
       カレンダー再描画
    */

    renderSportsCalendar();


    /*
       選択日を解除
    */

    sportsSelectedDate =
        null;

}




/* =====================================================
   ⚾ 野球編集フォーム
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


    /*
       現在のスポーツ設定
    */

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


    const sport =
        current?.sport ||
        settings.sport ||
        "baseball";


    /*
       現在の日付
    */

    const date =
        sportsSelectedDate;


    if(!date){

        form.innerHTML = `

            <div class="card">

                <p>
                    試合日が選択されていません。
                </p>

            </div>

        `;

        return;

    }


    /*
       現在の試合データ
    */

    const games =
        getCurrentSportsGames();


    const game =
        games[date] ||
        {};


    /*
       野球以外はまだ未対応
    */

    if(sport !== "baseball"){

        form.innerHTML = `

            <div class="card">

                <p>
                    このスポーツの編集画面は
                    現在準備中です。
                </p>

            </div>

        `;

        return;

    }


    /*
       基本情報
    */

    const team =
        current?.team ||
        settings.team ||
        "";


    const opponent =
        game.opponent ||
        "";


    const venue =
        game.venue ||
        "";


    const startTime =
        game.startTime ||
        "";


    const inningSide =
        game.inningSide ||
        "";


    const result =
        game.result ||
        "";


    const memo =
        game.memo ||
        "";


    /*
       イニングスコア
    */

    const teamScores =
        Array.isArray(game.teamScores)
        ?
        game.teamScores
        :
        Array(12).fill("");


    const opponentScores =
        Array.isArray(game.opponentScores)
        ?
        game.opponentScores
        :
        Array(12).fill("");


    let html = `

        <section class="sports-edit-section">

            <h2>
                ⚾ 試合情報
            </h2>


            <div class="sports-edit-date">

                📅 ${escapeSportsHTML(date)}

            </div>


            <div class="sports-edit-field">

                <label>
                    応援チーム
                </label>

                <input
                    type="text"
                    id="baseballEditTeam"
                    value="${escapeSportsHTML(team)}"
                    readonly
                >

            </div>


            <div class="sports-edit-field">

                <label>
                    対戦相手
                </label>

                <input
                    type="text"
                    id="baseballEditOpponent"
                    value="${escapeSportsHTML(opponent)}"
                    placeholder="例：巨人"
                    autocomplete="off"
                >

            </div>


            <div class="sports-edit-field">

                <label>
                    球場
                </label>

                <input
                    type="text"
                    id="baseballEditVenue"
                    value="${escapeSportsHTML(venue)}"
                    placeholder="例：東京ドーム"
                    autocomplete="off"
                >

            </div>


            <div class="sports-edit-field">

                <label>
                    開始時間
                </label>

                <input
                    type="time"
                    id="baseballEditStartTime"
                    value="${escapeSportsHTML(startTime)}"
                >

            </div>


            <div class="sports-edit-field">

                <label>
                    自分のチームは
                </label>


                <div class="baseball-side-selector">

                    <label>

                        <input
                            type="radio"
                            name="baseballInningSide"
                            value="top"
                            ${inningSide === "top" ? "checked" : ""}
                        >

                        表

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="baseballInningSide"
                            value="bottom"
                            ${inningSide === "bottom" ? "checked" : ""}
                        >

                        裏

                    </label>

                </div>

            </div>

        </section>


        <section class="sports-edit-section">

            <h2>
                📊 イニングスコア
            </h2>


            <div class="baseball-score-wrapper">

                <div class="baseball-score-scroll">

                    <table class="baseball-score-table">

                        <thead>

                            <tr>

                                <th>
                                    チーム
                                </th>
    `;


    for(
        let inning = 1;
        inning <= 12;
        inning++
    ){

        html += `
            <th>${inning}</th>
        `;

    }


    html += `

                                <th>
                                    計
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            <tr>

                                <th id="baseballEditTeamLabel">
                                    ${escapeSportsHTML(
                                        team ||
                                        "自分のチーム"
                                    )}
                                </th>
    `;


    for(
        let inning = 0;
        inning < 12;
        inning++
    ){

        html += `

            <td>

                <input
                    type="number"
                    min="0"
                    max="99"
                    class="baseball-score-input"
                    data-team-inning="${inning}"
                    value="${escapeSportsHTML(
                        teamScores[inning]
                    )}"
                >

            </td>

        `;

    }


    html += `

                                <td>

                                    <strong
                                        id="baseballEditTeamTotal"
                                    >
                                        ${calculateBaseballTotal(
                                            teamScores
                                        )}
                                    </strong>

                                </td>

                            </tr>


                            <tr>

                                <th id="baseballEditOpponentLabel">
                                    ${escapeSportsHTML(
                                        opponent ||
                                        "対戦相手"
                                    )}
                                </th>
    `;


    for(
        let inning = 0;
        inning < 12;
        inning++
    ){

        html += `

            <td>

                <input
                    type="number"
                    min="0"
                    max="99"
                    class="baseball-score-input"
                    data-opponent-inning="${inning}"
                    value="${escapeSportsHTML(
                        opponentScores[inning]
                    )}"
                >

            </td>

        `;

    }


    html += `

                                <td>

                                    <strong
                                        id="baseballEditOpponentTotal"
                                    >
                                        ${calculateBaseballTotal(
                                            opponentScores
                                        )}
                                    </strong>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>


            <div
                id="baseballEditScorePreview"
                class="baseball-final-score"
            >

                <span>
                    ${escapeSportsHTML(
                        team ||
                        "自分のチーム"
                    )}
                </span>


                <strong>

                    ${calculateBaseballTotal(teamScores)}
                    -
                    ${calculateBaseballTotal(opponentScores)}

                </strong>


                <span>

                    ${escapeSportsHTML(
                        opponent ||
                        "対戦相手"
                    )}

                </span>

            </div>

        </section>


        <section class="sports-edit-section">

            <h2>
                🏆 試合結果
            </h2>


            <div class="baseball-result-buttons">

                <label>

                    <input
                        type="radio"
                        name="baseballResult"
                        value="win"
                        ${result === "win" ? "checked" : ""}
                    >

                    🏆 勝ち

                </label>


                <label>

                    <input
                        type="radio"
                        name="baseballResult"
                        value="lose"
                        ${result === "lose" ? "checked" : ""}
                    >

                    😢 負け

                </label>


                <label>

                    <input
                        type="radio"
                        name="baseballResult"
                        value="draw"
                        ${result === "draw" ? "checked" : ""}
                    >

                    🤝 引き分け

                </label>


                <label>

                    <input
                        type="radio"
                        name="baseballResult"
                        value=""
                        ${result === "" ? "checked" : ""}
                    >

                    未入力

                </label>

            </div>

        </section>


        <section class="sports-edit-section">

            <h2>
                📝 メモ
            </h2>


            <textarea
                id="baseballEditMemo"
                rows="5"
                placeholder="試合についてのメモを入力..."
            >${escapeSportsHTML(memo)}</textarea>

        </section>


        <div class="sports-edit-actions">

            <button
                type="button"
                onclick="saveBaseballGameFromEditPage()"
            >
                💾 保存
            </button>


            <button
                type="button"
                onclick="deleteBaseballGame()"
            >
                🗑️ 削除
            </button>


            <button
                type="button"
                onclick="closeSportsGameEditPage()"
            >
                キャンセル
            </button>

        </div>

    `;


    form.innerHTML =
        html;


    /*
       対戦相手変更
    */

    const opponentInput =
        document.getElementById(
            "baseballEditOpponent"
        );


    if(opponentInput){

        opponentInput.addEventListener(
            "input",
            updateBaseballEditLive
        );

    }


    /*
       イニングスコア
    */

    const scoreInputs =
        form.querySelectorAll(
            ".baseball-score-input"
        );


    scoreInputs.forEach(
        input => {

            input.addEventListener(
                "input",
                updateBaseballEditLive
            );

        }
    );


    /*
       表・裏変更
    */

    const sideInputs =
        form.querySelectorAll(
            'input[name="baseballInningSide"]'
        );


    sideInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                updateBaseballEditLive
            );

        }
    );

}


/* =====================================================
   ⚾ 編集画面リアルタイム更新
===================================================== */

function updateBaseballEditLive(){

    const opponentInput =
        document.getElementById(
            "baseballEditOpponent"
        );


    const opponent =
        opponentInput
        ?
        opponentInput.value.trim()
        :
        "";


    const opponentLabel =
        document.getElementById(
            "baseballEditOpponentLabel"
        );


    if(opponentLabel){

        opponentLabel.textContent =
            opponent ||
            "対戦相手";

    }


    const teamInputs =
        document.querySelectorAll(
            "[data-team-inning]"
        );


    const opponentInputs =
        document.querySelectorAll(
            "[data-opponent-inning]"
        );


    const teamScores =
        Array.from(
            teamInputs
        ).map(
            input =>
                input.value
        );


    const opponentScores =
        Array.from(
            opponentInputs
        ).map(
            input =>
                input.value
        );


    const teamTotal =
        calculateBaseballTotal(
            teamScores
        );


    const opponentTotal =
        calculateBaseballTotal(
            opponentScores
        );


    const teamTotalElement =
        document.getElementById(
            "baseballEditTeamTotal"
        );


    const opponentTotalElement =
        document.getElementById(
            "baseballEditOpponentTotal"
        );


    if(teamTotalElement){

        teamTotalElement.textContent =
            teamTotal;

    }


    if(opponentTotalElement){

        opponentTotalElement.textContent =
            opponentTotal;

    }


    const preview =
        document.querySelector(
            "#baseballEditScorePreview strong"
        );


    if(preview){

        preview.textContent =
            `${teamTotal} - ${opponentTotal}`;

    }


    /*
       表・裏による表示順変更
    */

    updateBaseballEditSideDisplay();

}


/* =====================================================
   ⚾ 表・裏表示
===================================================== */

function updateBaseballEditSideDisplay(){

    const side =
        document.querySelector(
            'input[name="baseballInningSide"]:checked'
        )?.value ||
        "";


    const teamLabel =
        document.getElementById(
            "baseballEditTeamLabel"
        );


    const opponentLabel =
        document.getElementById(
            "baseballEditOpponentLabel"
        );


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


    const current =
        settings.favoriteSports?.[
            selectedIndex
        ];


    const team =
        current?.team ||
        settings.team ||
        "自分のチーム";


    const opponent =
        document.getElementById(
            "baseballEditOpponent"
        )?.value.trim() ||
        "対戦相手";


    if(side === "top"){

        if(teamLabel){

            teamLabel.textContent =
                `${team}（表）`;

        }


        if(opponentLabel){

            opponentLabel.textContent =
                `${opponent}（裏）`;

        }

    }else if(side === "bottom"){

        if(teamLabel){

            teamLabel.textContent =
                `${team}（裏）`;

        }


        if(opponentLabel){

            opponentLabel.textContent =
                `${opponent}（表）`;

        }

    }else{

        if(teamLabel){

            teamLabel.textContent =
                team;

        }


        if(opponentLabel){

            opponentLabel.textContent =
                opponent;

        }

    }

}


/* =====================================================
   ⚾ 編集画面から野球試合を保存
===================================================== */

function saveBaseballGameFromEditPage(){

    console.log(
        "saveBaseballGameFromEditPage 実行"
    );


    if(!sportsSelectedDate){

        alert(
            "試合日が選択されていません。"
        );

        return;

    }


    /* =====================
       入力値取得
    ===================== */

    const opponentInput =
        document.getElementById(
            "baseballEditOpponent"
        );


    const venueInput =
        document.getElementById(
            "baseballEditVenue"
        );


    const startTimeInput =
        document.getElementById(
            "baseballEditStartTime"
        );


    const memoInput =
        document.getElementById(
            "baseballEditMemo"
        );


    const opponent =
        opponentInput
        ?
        opponentInput.value.trim()
        :
        "";


    const venue =
        venueInput
        ?
        venueInput.value.trim()
        :
        "";


    const startTime =
        startTimeInput
        ?
        startTimeInput.value
        :
        "";


    const memo =
        memoInput
        ?
        memoInput.value.trim()
        :
        "";


    /* =====================
       対戦相手チェック
    ===================== */

    if(!opponent){

        alert(
            "対戦相手を入力してください。"
        );

        if(opponentInput){

            opponentInput.focus();

        }

        return;

    }


    /* =====================
       表・裏
    ===================== */

    const side =
        document.querySelector(
            'input[name="baseballInningSide"]:checked'
        )?.value ||
        "";


    /* =====================
       イニングスコア
    ===================== */

    const teamInputs =
        document.querySelectorAll(
            "#sportsGameEditForm [data-team-inning]"
        );


    const opponentInputs =
        document.querySelectorAll(
            "#sportsGameEditForm [data-opponent-inning]"
        );


    const teamScores =
        Array.from(
            teamInputs
        ).map(
            input => {

                if(input.value === ""){

                    return "";

                }

                return Number(
                    input.value
                );

            }
        );


    const opponentScores =
        Array.from(
            opponentInputs
        ).map(
            input => {

                if(input.value === ""){

                    return "";

                }

                return Number(
                    input.value
                );

            }
        );


    /* =====================
       合計
    ===================== */

    const teamTotal =
        calculateBaseballTotal(
            teamScores
        );


    const opponentTotal =
        calculateBaseballTotal(
            opponentScores
        );


    /* =====================
       試合結果
    ===================== */

    const result =
        document.querySelector(
            'input[name="baseballResult"]:checked'
        )?.value ||
        "";


    /* =====================
       保存データ
    ===================== */

    const game = {

        sport:
            "baseball",

        opponent:
            opponent,

        venue:
            venue,

        startTime:
            startTime,

        inningSide:
            side,

        teamScores:
            teamScores,

        opponentScores:
            opponentScores,

        teamTotal:
            teamTotal,

        opponentTotal:
            opponentTotal,

        result:
            result,

        memo:
            memo,

        updatedAt:
            new Date().toISOString()

    };


    console.log(
        "保存する野球データ:",
        game
    );


    /* =====================
       保存
    ===================== */

    saveSportsGameData(
        sportsSelectedDate,
        game
    );


    console.log(
        "野球試合データ保存完了"
    );


    /* =====================
       保存した日付を保持
    ===================== */

    const savedDate =
        sportsSelectedDate;


    /* =====================
       編集画面を閉じる
    ===================== */

    closeSportsGameEditPage();


    /* =====================
       保存した試合の詳細画面
    ===================== */

    if(savedDate){

        openBaseballGameDetailPage(
            savedDate
        );

    }

}