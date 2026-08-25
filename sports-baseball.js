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
   保存完了後は
   カレンダーへ戻らず、
   今保存した試合の閲覧画面を表示
*/

const savedDate =
    sportsSelectedDate;


const savedGames =
    getCurrentSportsGames();


const savedGame =
    savedGames[savedDate] ||
    null;


if(savedGame){

    openBaseballGameView(
        savedDate,
        savedGame
    );

}else{

    sportsSelectedDate =
        null;

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