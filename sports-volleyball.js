/* =====================================================
   🏐 バレーボール専用処理
===================================================== */


/* =====================================================
   🏐 バレー試合データ取得
===================================================== */

function getCurrentVolleyballGames(){

    const games =
        getCurrentSportsGames();

    if(
        !games ||
        typeof games !== "object" ||
        Array.isArray(games)
    ){

        return {};

    }

    return games;

}


/* =====================================================
   🏐 現在のバレー試合を取得
===================================================== */

function getCurrentVolleyballGameForEdit(){

    const games =
        getCurrentVolleyballGames();

    if(!sportsSelectedDate){

        return null;

    }

    return (
        games[sportsSelectedDate] ||
        null
    );

}


/* =====================================================
   🏐 バレー試合保存
===================================================== */

function saveVolleyballGameData(
    date,
    game
){

    if(!date){

        console.error(
            "❌ バレー保存日がありません"
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

    return saveSportsGameData(
        date,
        game
    );

}


/* =====================================================
   🏐 バレー試合削除
===================================================== */

function deleteVolleyballGame(){

    if(!sportsSelectedDate){

        console.error(
            "❌ バレー削除日がありません"
        );

        return false;

    }

    const games =
        getCurrentVolleyballGames();

    if(
        !games ||
        !games[sportsSelectedDate]
    ){

        return false;

    }

    const confirmed =
        confirm(
            "このバレーの試合を削除しますか？"
        );

    if(!confirmed){

        return false;

    }

    delete games[
        sportsSelectedDate
    ];

    const saved =
        saveCurrentSportsGames(
            games
        );

    if(saved === false){

        console.error(
            "❌ バレー試合の削除保存に失敗しました"
        );

        return false;

    }

    closeSportsGameDetailPage();

    renderSportsCalendar();

    return true;

}


/* =====================================================
   🏐 バレー試合編集画面を開く
===================================================== */

async function openVolleyballGameEditPage(
    date
){

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
            "❌ バレースポーツカレンダーまたは編集ページが見つかりません"
        );

        return;

    }


    sportsPage.style.display =
        "none";

    sportsPage.classList.remove(
        "active"
    );


    editPage.style.display =
        "block";

    editPage.classList.add(
        "active"
    );


    const loaded =
        await loadVolleyballGameEditHTML();


    if(!loaded){

        return;

    }


    renderVolleyballGameEditForm();

}


/* =====================================================
   🏐 バレー試合詳細表示
===================================================== */

function showVolleyballGameDetail(
    date
){

    sportsSelectedDate =
        date;

    const games =
        getCurrentVolleyballGames();

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


    /* =================================================
       現在のお気に入り
    ================================================= */

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
        favoriteSports[selectedIndex] ||
        {};

    const team =
        current.team ||
        game.team ||
        "自分のチーム";

    const opponent =
        game.opponent ||
        "対戦相手";

    const location =
        game.location ||
        "";


    /* =================================================
       セットデータ
    ================================================= */

    const sets =
        Array.isArray(game.sets)
        ?
        game.sets
        :
        [];


    let teamSets =
        [];

    let opponentSets =
        [];


    for(
        let i = 0;
        i < 5;
        i++
    ){

        const set =
            sets[i] ||
            {};

        teamSets.push(
            set.team ?? ""
        );

        opponentSets.push(
            set.opponent ?? ""
        );

    }


    const teamSetCount =
        teamSets.filter(
            (score, index) => {

                const opponentScore =
                    opponentSets[index];

                if(
                    score === "" ||
                    opponentScore === ""
                ){

                    return false;

                }

                return Number(score) >
                    Number(opponentScore);

            }
        ).length;


    const opponentSetCount =
        opponentSets.filter(
            (score, index) => {

                const teamScore =
                    teamSets[index];

                if(
                    score === "" ||
                    teamScore === ""
                ){

                    return false;

                }

                return Number(score) >
                    Number(teamScore);

            }
        ).length;


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
            `🏐 ${dateText} 試合結果`;

    }


    /* =================================================
       結果
    ================================================= */

    let resultHTML =
        "";

    if(game.result === "win"){

        resultHTML = `
            <div class="volleyball-view-result win">
                🏆 勝ち
            </div>
        `;

    }else if(game.result === "lose"){

        resultHTML = `
            <div class="volleyball-view-result lose">
                😢 負け
            </div>
        `;

    }else if(game.result === "draw"){

        resultHTML = `
            <div class="volleyball-view-result draw">
                🤝 引き分け
            </div>
        `;

    }else if(game.result === "cancelled"){

        resultHTML = `
            <div class="volleyball-view-result cancelled">
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
        <div class="volleyball-view-memo">

            <div class="volleyball-view-section-title">
                📝 メモ
            </div>

            <div class="volleyball-view-memo-text">
                ${escapeSportsHTML(game.memo)}
            </div>

        </div>
        `
        :
        "";


    /* =================================================
       セットスコア
    ================================================= */

    const setRows =
        Array.from(
            { length: 5 },
            (_, i) => {

                const teamScore =
                    teamSets[i];

                const opponentScore =
                    opponentSets[i];

                if(
                    teamScore === "" &&
                    opponentScore === ""
                ){

                    return "";

                }

                return `
                    <tr>

                        <th>
                            ${i + 1}
                        </th>

                        <td>
                            ${escapeSportsHTML(
                                String(teamScore)
                            )}
                        </td>

                        <td>
                            ${escapeSportsHTML(
                                String(opponentScore)
                            )}
                        </td>

                    </tr>
                `;

            }
        ).join("");


    /* =================================================
       閲覧画面
    ================================================= */

    detail.innerHTML = `

        <div class="volleyball-game-view">

            <div class="volleyball-view-date">
                ${dateText}
            </div>


<div class="volleyball-view-match">

    <div class="volleyball-view-team">

        <div class="volleyball-view-team-name">
            ${escapeSportsHTML(team)}
        </div>

        <div class="volleyball-view-team-score">
            ${teamSetCount}
        </div>

    </div>


    <div class="volleyball-view-score-separator">
        -
    </div>


    <div class="volleyball-view-team">

        <div class="volleyball-view-team-name">
            ${escapeSportsHTML(opponent)}
        </div>

        <div class="volleyball-view-team-score">
            ${opponentSetCount}
        </div>

    </div>

</div>

            ${
                location
                ?
                `
                <div class="volleyball-view-info">
                    📍 ${escapeSportsHTML(location)}
                </div>
                `
                :
                ""
            }


            ${resultHTML}


            <div class="volleyball-view-section-title">

                🏐 セットスコア

            </div>


            <div class="volleyball-score-wrapper">

                <table class="volleyball-score-table">

                    <thead>

                        <tr>

                            <th>
                                セット
                            </th>

                            <th>
                                ${escapeSportsHTML(team)}
                            </th>

                            <th>
                                ${escapeSportsHTML(opponent)}
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${setRows}

                    </tbody>

                </table>

            </div>


            ${memoHTML}


            <div class="volleyball-view-buttons">

                <button
                    type="button"
                    onclick="
                        openVolleyballGameEditPage(
                            sportsSelectedDate
                        )
                    "
                >
                    ✏️ 編集
                </button>


                <button
                    type="button"
                    onclick="
                        deleteVolleyballGame()
                    "
                >
                    🗑️ 削除
                </button>


                <button
                    type="button"
                    onclick="
                        closeSportsGameDetailPage()
                    "
                >
                    ❌ 閉じる
                </button>

            </div>

        </div>

    `;

}


/* =====================================================
   🏐 バレー試合をカレンダーから開く
===================================================== */

function openVolleyballGame(
    date
){

    sportsSelectedDate =
        date;

    const games =
        getCurrentVolleyballGames();

    if(games?.[date]){

        showVolleyballGameDetail(
            date
        );

        return;

    }

    openVolleyballGameEditPage(
        date
    );

}


/* =====================================================
   🏐 バレー試合編集フォーム表示
===================================================== */

function renderVolleyballGameEditForm(){

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
        getCurrentVolleyballGameForEdit() ||
        {};

    const dateInput =
        document.getElementById(
            "volleyballGameDate"
        );

    const teamInput =
        document.getElementById(
            "volleyballTeam"
        );

    const opponentInput =
        document.getElementById(
            "volleyballOpponent"
        );

    const locationInput =
        document.getElementById(
            "volleyballLocation"
        );

    const resultInput =
        document.getElementById(
            "volleyballResult"
        );

    const memoInput =
        document.getElementById(
            "volleyballMemo"
        );


    /* =========================
       試合日
    ========================= */

    if(dateInput){

        dateInput.value =
            sportsSelectedDate ||
            game.date ||
            "";

    }


    /* =========================
       応援チーム
    ========================= */

    if(teamInput){

        teamInput.value =
            currentFavorite.team ||
            game.team ||
            "";

    }


    /* =========================
       対戦相手
    ========================= */

    if(opponentInput){

        opponentInput.value =
            game.opponent ||
            "";

    }


    /* =========================
       会場
    ========================= */

    if(locationInput){

        locationInput.value =
            game.location ||
            "";

    }


    /* =========================
       セットスコア
    ========================= */

    const sets =
        Array.isArray(game.sets)
        ?
        game.sets
        :
        [];

    for(
        let i = 0;
        i < 5;
        i++
    ){

        const set =
            sets[i] ||
            {};

        const teamScore =
            document.getElementById(
                `volleyballTeamScore${i + 1}`
            );

        const opponentScore =
            document.getElementById(
                `volleyballOpponentScore${i + 1}`
            );

        if(teamScore){

            teamScore.value =
                set.team ?? "";

        }

        if(opponentScore){

            opponentScore.value =
                set.opponent ?? "";

        }

    }


    /* =========================
       結果
    ========================= */

    if(resultInput){

        resultInput.value =
            game.result ||
            "";

    }


    /* =========================
       メモ
    ========================= */

    if(memoInput){

        memoInput.value =
            game.memo ||
            "";

    }

}


/* =====================================================
   🏐 バレー試合保存
===================================================== */

function saveVolleyballGameFromEditPage(){

    const dateInput =
        document.getElementById(
            "volleyballGameDate"
        );

    const opponentInput =
        document.getElementById(
            "volleyballOpponent"
        );

    const locationInput =
        document.getElementById(
            "volleyballLocation"
        );

    const resultInput =
        document.getElementById(
            "volleyballResult"
        );

    const memoInput =
        document.getElementById(
            "volleyballMemo"
        );


    const date =
        dateInput?.value ||
        sportsSelectedDate ||
        "";


    if(!date){

        alert(
            "試合日を入力してください。"
        );

        return false;

    }


    /* =========================
       現在のお気に入り
    ========================= */

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


    const team =
        currentFavorite.team ||
        "";


    /* =========================
       セットスコア
    ========================= */

    const sets =
        [];

    for(
        let i = 0;
        i < 5;
        i++
    ){

        const teamInput =
            document.getElementById(
                `volleyballTeamScore${i + 1}`
            );

        const opponentScoreInput =
            document.getElementById(
                `volleyballOpponentScore${i + 1}`
            );

        const teamScore =
            teamInput?.value ?? "";

        const opponentScore =
            opponentScoreInput?.value ?? "";


        /*
         * 両方空欄なら
         * そのセットは保存しない
         */

        if(
            teamScore === "" &&
            opponentScore === ""
        ){

            continue;

        }


        sets.push({

            team:
                teamScore,

            opponent:
                opponentScore

        });

    }


    /* =========================
       試合データ
    ========================= */

    const game = {

        date:
            date,

        sport:
            "volleyball",

        team:
            team,

        opponent:
            opponentInput?.value ||
            "",

        location:
            locationInput?.value ||
            "",

        sets:
            sets,

        result:
            resultInput?.value ||
            "",

        memo:
            memoInput?.value ||
            ""

    };


    /* =========================
       保存
    ========================= */

    const saved =
        saveVolleyballGameData(
            date,
            game
        );


    if(saved === false){

        alert(
            "バレー試合の保存に失敗しました。"
        );

        return false;

    }


/*
 * 保存後
 * → 試合結果画面へ戻る
 */

openSportsGameDetailPage(
    date
);

return true;

}


/* =====================================================
   🏐 バレー編集画面を閉じる
===================================================== */

function closeVolleyballEditPage(){

    const editPage =
        document.getElementById(
            "sportsGameEditPage"
        );

    const detailPage =
        document.getElementById(
            "sportsGameDetailPage"
        );

    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );

    const sportsScreen =
        document.getElementById(
            "sportsCalendarScreen"
        );


    /* =====================
       編集画面を閉じる
    ===================== */

    if(editPage){

        editPage.classList.remove(
            "active"
        );

        editPage.style.display =
            "none";

    }


    /* =====================
       結果画面を閉じる
    ===================== */

    if(detailPage){

        detailPage.classList.remove(
            "active"
        );

        detailPage.style.display =
            "none";

    }


    /* =====================
       スポーツカレンダーを表示
    ===================== */

    if(sportsScreen){

        sportsScreen.style.display =
            "block";

    }


    if(sportsPage){

        sportsPage.classList.add(
            "active"
        );

        sportsPage.style.display =
            "block";

    }


    renderSportsCalendar();

}


/* =====================================================
   🏐 バレー試合編集HTML読み込み
===================================================== */

async function loadVolleyballGameEditHTML(){

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
                "./sports-volleyball-edit.html"
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
            "sports-volleyball-edit.html（バレー）読み込み成功"
        );


        return true;

    }
    catch(error){

        console.error(
            "sports-volleyball-edit.html（バレー）の読み込みに失敗:",
            error
        );

        return false;

    }

}

