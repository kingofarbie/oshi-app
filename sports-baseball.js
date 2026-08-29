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

/* =====================================================
   ⚾ 野球編集フォーム
===================================================== */

function renderBaseballGameEditForm(){

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


    const team =
        currentTeam.team ||
        game.team ||
        "";


    const opponent =
        game.opponent ||
        "";


    /* =================================================
       タイトル
    ================================================= */

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


    /* =================================================
       入力欄
    ================================================= */

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


    const battingOrderSelect =
        document.getElementById(
            "sportsEditBattingOrder"
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


    const opponentPitcherInput =
        document.getElementById(
            "sportsEditOpponentPitcher"
        );


    /* =================================================
       応援チーム
    ================================================= */

    if(teamInput){

        teamInput.value =
            currentTeam.team ||
            game.team ||
            "";

    }


    /* =================================================
       対戦相手
    ================================================= */

    if(opponentInput){

        opponentInput.value =
            game.opponent ||
            "";

    }


    /* =================================================
       勝敗
    ================================================= */

    if(resultSelect){

        resultSelect.value =
            game.result ||
            "";

    }


    /* =================================================
       先攻・後攻
    ================================================= */

    if(battingOrderSelect){

        battingOrderSelect.value =
            game.battingOrder ||
            "";

    }


    /* =================================================
       メモ
    ================================================= */

    if(memoInput){

        memoInput.value =
            game.memo ||
            "";

    }


    /* =================================================
       場所
    ================================================= */

    if(locationInput){

        locationInput.value =
            game.location ||
            "";

    }


    /* =================================================
       応援チーム先発投手
    ================================================= */

    if(startingPitcherInput){

        startingPitcherInput.value =
            game.startingPitcher ||
            "";

    }


    /* =================================================
       相手チーム先発投手
    ================================================= */

    if(opponentPitcherInput){

        opponentPitcherInput.value =
            game.opponentStartingPitcher ||
            "";

    }


    /* =================================================
       イニングスコア
    ================================================= */

    const teamScores =
        Array.isArray(
            game.teamScores
        )
        ?
        game.teamScores
        :
        [];


    const opponentScores =
        Array.isArray(
            game.opponentScores
        )
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


    /* =================================================
       先攻・後攻変更イベント
    ================================================= */

    if(battingOrderSelect){

        battingOrderSelect.addEventListener(
            "change",
            updateBaseballEditBattingOrder
        );

    }


    /*
       応援チーム・相手チーム名変更時も
       スコアボードの名前を更新
    */

    if(teamInput){

        teamInput.addEventListener(
            "input",
            updateBaseballEditBattingOrder
        );

    }


    if(opponentInput){

        opponentInput.addEventListener(
            "input",
            updateBaseballEditBattingOrder
        );

    }


    /* =================================================
       初期表示時にも先攻・後攻を反映
    ================================================= */

    updateBaseballEditBattingOrder();


    /* =================================================
       編集画面を表示
    ================================================= */

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
   ⚾ 編集画面スコアボード
   先攻・後攻変更
===================================================== */

function updateBaseballEditBattingOrder(){

    const battingOrderSelect =
        document.getElementById(
            "sportsEditBattingOrder"
        );

    if(!battingOrderSelect){

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


    const team =
        teamInput
        ?
        teamInput.value.trim()
        :
        "応援チーム";


    const opponent =
        opponentInput
        ?
        opponentInput.value.trim()
        :
        "相手チーム";


    /* =================================================
       スコアボードの行
    ================================================= */

    const teamScoreInput =
        document.getElementById(
            "sportsEditTeamScore1"
        );

    const opponentScoreInput =
        document.getElementById(
            "sportsEditOpponentScore1"
        );


    if(
        !teamScoreInput ||
        !opponentScoreInput
    ){

        return;

    }


    const teamRow =
        teamScoreInput.closest(
            "tr"
        );


    const opponentRow =
        opponentScoreInput.closest(
            "tr"
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
       現在の表示順を確認
    ================================================= */

    const rows =
        Array.from(
            tbody.querySelectorAll("tr")
        );


    if(rows.length < 2){

        return;

    }


    const firstRow =
        rows[0];


    const secondRow =
        rows[1];


    /* =================================================
       応援チームが後攻
    ================================================= */

    if(
        battingOrderSelect.value ===
        "opponent_first"
    ){

        /*
           相手チーム
           ↓
           応援チーム
        */

        if(firstRow !== opponentRow){

            tbody.insertBefore(
                opponentRow,
                teamRow
            );

        }

    }


    /* =================================================
       応援チームが先攻
    ================================================= */

    else{

        /*
           応援チーム
           ↓
           相手チーム
        */

        if(firstRow !== teamRow){

            tbody.insertBefore(
                teamRow,
                opponentRow
            );

        }

    }


    /* =================================================
       行を入れ替えた後の名前
    ================================================= */

    const currentRows =
        tbody.querySelectorAll("tr");


    if(currentRows.length < 2){

        return;

    }


    const firstName =
        currentRows[0].querySelector(
            ".baseball-score-team"
        );


    const secondName =
        currentRows[1].querySelector(
            ".baseball-score-team"
        );


    if(
        battingOrderSelect.value ===
        "opponent_first"
    ){

        if(firstName){

            firstName.textContent =
                opponent ||
                "相手チーム";

        }


        if(secondName){

            secondName.textContent =
                team ||
                "応援チーム";

        }

    }else{

        if(firstName){

            firstName.textContent =
                team ||
                "応援チーム";

        }


        if(secondName){

            secondName.textContent =
                opponent ||
                "相手チーム";

        }

    }

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





