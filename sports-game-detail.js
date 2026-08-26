
function getCurrentSportsGamesForDetail(){

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

    const games =
        settings.games;

    if(
        games &&
        !Array.isArray(games) &&
        typeof games === "object" &&
        games[selectedIndex] &&
        typeof games[selectedIndex] === "object"
    ){

        return games[selectedIndex];

    }

    return {};

}




/* =====================================================
   ⚾ 野球試合 閲覧画面
===================================================== */

function openBaseballGameView(
    date
){


    sportsSelectedDate =
        date;


const games =
    getCurrentSportsGamesForDetail();


const game =
    games[date] ||
    null;


if(!game){

    return;

}



    const title =
        document.getElementById(
            "sportsGameDetailTitle"
        );


    const detail =
        document.getElementById(
            "sportsGameDetail"
        );


    if(!detail){

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


    const favoriteSports =
        Array.isArray(
            data.sportsCalendar?.favoriteSports
        )
        ?
        data.sportsCalendar.favoriteSports
        :
        [];


    const current =
        favoriteSports[selectedIndex];


    const team =
        current?.team ||
        data.sportsCalendar?.team ||
        "自分のチーム";


    const opponent =
        game.opponent ||
        "対戦相手";


    const teamScores =
        Array.isArray(game.teamScores)
        ?
        game.teamScores
        :
        [];


    const opponentScores =
        Array.isArray(game.opponentScores)
        ?
        game.opponentScores
        :
        [];


    const teamTotal =
        calculateBaseballTotal(
            teamScores
        );


    const opponentTotal =
        calculateBaseballTotal(
            opponentScores
        );


    /* =================================================
       日付表示
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


    const dateText =
        `${dateObject.getFullYear()}年` +
        `${dateObject.getMonth() + 1}月` +
        `${dateObject.getDate()}日` +
        `（${weekdays[dateObject.getDay()]}）`;


    if(title){

        title.innerHTML =
            `⚾ ${dateText} 試合結果`;

    }


    /* =================================================
       結果表示
    ================================================= */

    let resultHTML = "";


    if(game.result === "win"){

        resultHTML = `
            <div class="baseball-view-result win">
                🏆 勝ち
            </div>
        `;

    }else if(game.result === "lose"){

        resultHTML = `
            <div class="baseball-view-result lose">
                😢 負け
            </div>
        `;

    }else if(game.result === "draw"){

        resultHTML = `
            <div class="baseball-view-result draw">
                🤝 引き分け
            </div>
        `;

    }


    /* =================================================
       イニングスコア
    ================================================= */

    let inningRows = "";


    const maxInnings =
        Math.max(
            teamScores.length,
            opponentScores.length,
            9
        );


    for(
        let i = 0;
        i < maxInnings;
        i++
    ){

        const teamScore =
            teamScores[i] === "" ||
            teamScores[i] === undefined
            ?
            "-"
            :
            teamScores[i];


        const opponentScore =
            opponentScores[i] === "" ||
            opponentScores[i] === undefined
            ?
            "-"
            :
            opponentScores[i];


        inningRows += `

            <div class="baseball-view-inning">

                <div class="baseball-view-inning-number">
                    ${i + 1}
                </div>

                <div class="baseball-view-inning-team">
                    ${escapeSportsHTML(teamScore)}
                </div>

                <div class="baseball-view-inning-opponent">
                    ${escapeSportsHTML(opponentScore)}
                </div>

            </div>

        `;

    }


    /* =================================================
       メモ
    ================================================= */

    const memoHTML =
        game.memo
        ?
        `
        <div class="baseball-view-memo">

            <div class="baseball-view-section-title">
                📝 メモ
            </div>

            <div class="baseball-view-memo-text">
                ${escapeSportsHTML(game.memo)}
            </div>

        </div>
        `
        :
        "";


    /* =================================================
       閲覧画面
    ================================================= */

    detail.innerHTML = `

        <div class="baseball-game-view">

            <!-- 日付 -->

            <div class="baseball-view-date">
                ${dateText}
            </div>


            <!-- 対戦カード -->

            <div class="baseball-view-match">

                <div class="baseball-view-team">

                    <div class="baseball-view-team-name">
                        ${escapeSportsHTML(team)}
                    </div>

                    <div class="baseball-view-total">
                        ${teamTotal}
                    </div>

                </div>


                <div class="baseball-view-vs">
                    −
                </div>


                <div class="baseball-view-team">

                    <div class="baseball-view-team-name">
                        ${escapeSportsHTML(opponent)}
                    </div>

                    <div class="baseball-view-total">
                        ${opponentTotal}
                    </div>

                </div>

            </div>


            <!-- 結果 -->

            ${resultHTML}


            <!-- イニング -->

            <div class="baseball-view-section-title">
                ⚾ イニング別スコア
            </div>


            <div class="baseball-view-inning-board">

                <div class="baseball-view-inning-header">

                    <div>
                        回
                    </div>

                    <div>
                        ${escapeSportsHTML(team)}
                    </div>

                    <div>
                        ${escapeSportsHTML(opponent)}
                    </div>

                </div>


                ${inningRows}

            </div>


            <!-- メモ -->

            ${memoHTML}


            <!-- ボタン -->

            <div class="baseball-view-buttons">

                <button
                    type="button"
                    onclick="editBaseballGame()"
                >
                    ✏️ 編集
                </button>

                <button
                    type="button"
                        onclick="deleteBaseballGame()"
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
   ⚾ 試合結果ページ → スポーツカレンダーへ戻る
===================================================== */

function closeSportsGameDetailPage(){

    const detailPage =
        document.getElementById(
            "sportsGameDetailPage"
        );

    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );


    if(detailPage){

        detailPage.classList.remove(
            "active"
        );

    }


    if(sportsPage){

        sportsPage.classList.add(
            "active"
        );

    }


    /*
       スポーツカレンダーを最新状態で再描画
    */

    renderSportsCalendar();

}