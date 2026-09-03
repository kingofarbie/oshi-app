
function getCurrentSportsGamesForDetail(){

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


    const favoriteSports =
        Array.isArray(
            settings.favoriteSports
        )
        ?
        settings.favoriteSports
        :
        [];


    const currentSport =
        favoriteSports[selectedIndex] ||
        {};


    const sport =
        currentSport.sport ||
        "";


    if(!sport){

        return {};

    }


    const games =
        settings.games;


    if(
        !games ||
        typeof games !== "object" ||
        Array.isArray(games)
    ){

        return {};

    }


    const currentGames =
        games[sport];


    if(
        !currentGames ||
        typeof currentGames !== "object" ||
        Array.isArray(currentGames)
    ){

        return {};

    }


    return currentGames;

}


/* =====================================================
   ⚾ 野球試合 閲覧画面
===================================================== */

function showBaseballGameDetail(date){

    console.log("★★ showBaseballGameDetail 本体に入った", date);

    sportsSelectedDate =
        date;


    const games =
        getCurrentSportsGamesForDetail();


    const game =
        games[date] ||
        null;

        console.log("★★ game:", game);
console.log("★★ battingOrder:", game?.battingOrder);


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

console.log("★★ detail =", detail);


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
        game.team ||
        data.sportsCalendar?.team ||
        "自分のチーム";


    const opponent =
        game.opponent ||
        "対戦相手";

const battingOrder =
    game.battingOrder ||
    "";

    const location =
        game.location ||
        "";


    const startingPitcher =
        game.startingPitcher ||
        "";


    const opponentStartingPitcher =
        game.opponentStartingPitcher ||
        "";

    const opponentFirst =
    game.battingOrder === "opponent_first";

    console.log(
    "★ battingOrder:",
    game.battingOrder
);

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

    }else if(game.result === "cancelled"){

        resultHTML = `
            <div class="baseball-view-result cancelled">
                ⛔ 中止
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


            <!-- =========================
                 日付
            ========================== -->

            <div class="baseball-view-date">

                ${dateText}

            </div>


            <!-- =========================
                 対戦カード
            ========================== -->

<div class="baseball-view-match">

    <div class="baseball-view-team">

        <div class="baseball-view-team-name">
            ${escapeSportsHTML(team)}
        </div>

    </div>


    <div class="baseball-view-score">

        <strong>
            ${teamTotal}
        </strong>

        <span>
            -
        </span>

        <strong>
            ${opponentTotal}
        </strong>

    </div>


    <div class="baseball-view-team">

        <div class="baseball-view-team-name">
            ${escapeSportsHTML(opponent)}
        </div>

    </div>

</div>

            <!-- =========================
                 試合情報
            ========================== -->

            <div class="baseball-view-info">

                ${
                    location
                    ?
                    `📍 ${escapeSportsHTML(location)}`
                    :
                    ""
                }

                ${
                    startingPitcher
                    ?
                    `<div>
                        ⚾ ${escapeSportsHTML(team)}
                        先発：
                        ${escapeSportsHTML(startingPitcher)}
                    </div>`
                    :
                    ""
                }

                ${
                    opponentStartingPitcher
                    ?
                    `<div>
                        ⚾ ${escapeSportsHTML(opponent)}
                        先発：
                        ${escapeSportsHTML(
                            opponentStartingPitcher
                        )}
                    </div>`
                    :
                    ""
                }

            </div>


            <!-- =========================
                 結果
            ========================== -->

            ${resultHTML}


            <!-- =========================
                 イニングスコア
            ========================== -->

            <div class="baseball-view-section-title">

                ⚾ イニング別スコア

            </div>


            <div class="baseball-score-wrapper">

                <div class="baseball-score-scroll">

                    <table class="baseball-score-table">


                        <thead>

                            <tr>

                                <th class="baseball-score-team">

                                    チーム

                                </th>


                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                                <th>6</th>
                                <th>7</th>
                                <th>8</th>
                                <th>9</th>
                                <th>10</th>
                                <th>11</th>
                                <th>12</th>


                                <th class="baseball-score-total">

                                    計

                                </th>

                            </tr>

                        </thead>


<tbody>

${
    opponentFirst
    ?
        `
        <!-- =====================
             応援チームが後攻
             相手チーム → 応援チーム
        ====================== -->

        <tr>

            <th class="baseball-score-team">
                ${escapeSportsHTML(opponent)}
            </th>

            ${
                Array.from(
                    { length: 12 },
                    (_, i) => {

                        const score =
                            opponentScores[i];

                        return `
                            <td>
                                ${
                                    score === "" ||
                                    score === undefined
                                    ?
                                    "-"
                                    :
                                    escapeSportsHTML(score)
                                }
                            </td>
                        `;

                    }
                ).join("")
            }

            <td class="baseball-score-total">
                ${opponentTotal}
            </td>

        </tr>


        <tr>

            <th class="baseball-score-team">
                ${escapeSportsHTML(team)}
            </th>

            ${
                Array.from(
                    { length: 12 },
                    (_, i) => {

                        const score =
                            teamScores[i];

                        return `
                            <td>
                                ${
                                    score === "" ||
                                    score === undefined
                                    ?
                                    "-"
                                    :
                                    escapeSportsHTML(score)
                                }
                            </td>
                        `;

                    }
                ).join("")
            }

            <td class="baseball-score-total">
                ${teamTotal}
            </td>

        </tr>
        `

    :

        `
        <!-- =====================
             応援チームが先攻
             応援チーム → 相手チーム
        ====================== -->

        <tr>

            <th class="baseball-score-team">
                ${escapeSportsHTML(team)}
            </th>

            ${
                Array.from(
                    { length: 12 },
                    (_, i) => {

                        const score =
                            teamScores[i];

                        return `
                            <td>
                                ${
                                    score === "" ||
                                    score === undefined
                                    ?
                                    "-"
                                    :
                                    escapeSportsHTML(score)
                                }
                            </td>
                        `;

                    }
                ).join("")
            }

            <td class="baseball-score-total">
                ${teamTotal}
            </td>

        </tr>


        <tr>

            <th class="baseball-score-team">
                ${escapeSportsHTML(opponent)}
            </th>

            ${
                Array.from(
                    { length: 12 },
                    (_, i) => {

                        const score =
                            opponentScores[i];

                        return `
                            <td>
                                ${
                                    score === "" ||
                                    score === undefined
                                    ?
                                    "-"
                                    :
                                    escapeSportsHTML(score)
                                }
                            </td>
                        `;

                    }
                ).join("")
            }

            <td class="baseball-score-total">
                ${opponentTotal}
            </td>

        </tr>
        `
}

</tbody>


                    </table>

                </div>

            </div>


            <!-- =========================
                 メモ
            ========================== -->

            ${memoHTML}


            <!-- =========================
                 ボタン
            ========================== -->

            <div class="baseball-view-buttons">


                <button
                    type="button"
                    onclick="openBaseballGameEditPage(sportsSelectedDate)"
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
    console.log(
    "★★ 結果画面HTML描画完了",
    detail.innerHTML.length
);

}


