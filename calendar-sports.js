/* =====================================================
   🏟️ スポーツ裏カレンダー
   calendar-sports.js

   通常の calendar.js とは分離。

   ・応援スポーツ最大10種類
   ・スポーツごとに試合データを独立保存
   ・旧 games 形式との互換性あり
===================================================== */


/* =====================================================
   状態
===================================================== */

let sportsCalendarDate = new Date();

let sportsSelectedDate = null;


/* =====================================================
   🏟️ 応援スポーツ設定
===================================================== */

const MAX_FAVORITE_SPORTS = 10;


/*
   スポーツ一覧

   enabled は「現在カレンダー対応済みか」
   という意味。

   登録自体は準備中スポーツも可能。
*/

const SPORTS_TYPES = [

    {
        value: "baseball",
        label: "⚾ 野球",
        enabled: true
    },

    {
        value: "soccer",
        label: "⚽ サッカー",
        enabled: true
    },

    {
        value: "basketball",
        label: "🏀 バスケットボール",
        enabled: false
    },

    {
        value: "volleyball",
        label: "🏐 バレーボール",
        enabled: false
    },

    {
        value: "rugby",
        label: "🏉 ラグビー",
        enabled: false
    },

    {
        value: "tennis",
        label: "🎾 テニス",
        enabled: false
    }

];


/* =====================================================
   通常カレンダーへ戻る
===================================================== */

function closeSportsCalendar(){

    const normalCalendar =
        document.getElementById(
            "calendarContainer"
        );


    const screen =
        document.getElementById(
            "sportsCalendarScreen"
        );


    if(screen){

        screen.style.display =
            "none";

    }


    if(normalCalendar){

        normalCalendar.style.display =
            "";

    }

}


/* =====================================================
   🏟️ 現在選択中スポーツの games を取得
===================================================== */

function getCurrentSportsGames(){

    const data =
        db.load();


    const settings =
        data.sportsCalendar ||
        {};


    const favoriteSports =
        Array.isArray(
            settings.favoriteSports
        )
        ?
        settings.favoriteSports
        :
        [];


    const selectedIndex =
        typeof settings.selectedIndex === "number"
        ?
        settings.selectedIndex
        :
        0;


    /*
       ================================================
       現在選択中のお気に入り
       ================================================
    */

    const currentSport =
        favoriteSports[selectedIndex] ||
        {};


    /*
       ================================================
       games
       お気に入り番号ごとに完全分離

       games:
       {
           0: {
               "2026-09-12": {...}
           },

           1: {
               "2026-09-12": {...}
           },

           2: {
               "2026-09-12": {...}
           }
       }

       0 = 野球（中日）
       1 = サッカー（グランパス）
       2 = 野球（サムライJAPAN）
       ================================================
    */

    if(
        !settings.games ||
        typeof settings.games !== "object" ||
        Array.isArray(settings.games)
    ){

        return {};

    }


    const favoriteGames =
        settings.games[selectedIndex];


    if(
        !favoriteGames ||
        typeof favoriteGames !== "object" ||
        Array.isArray(favoriteGames)
    ){

        return {};

    }


    return favoriteGames;

}


/* =====================================================
   🏟️ 現在選択中スポーツの games を保存
===================================================== */

function saveCurrentSportsGames(
    games
){

    const data =
        db.load();


    if(!data.sportsCalendar){

        data.sportsCalendar = {};

    }


    if(
        !data.sportsCalendar.games ||
        typeof data.sportsCalendar.games !== "object" ||
        Array.isArray(data.sportsCalendar.games)
    ){

        data.sportsCalendar.games = {};

    }


    /*
       ================================================
       現在選択中のお気に入り番号
       ================================================
    */

    const selectedIndex =
        typeof data.sportsCalendar.selectedIndex === "number"
        ?
        data.sportsCalendar.selectedIndex
        :
        0;


    const favoriteSports =
        Array.isArray(
            data.sportsCalendar.favoriteSports
        )
        ?
        data.sportsCalendar.favoriteSports
        :
        [];


    const currentSport =
        favoriteSports[selectedIndex] ||
        {};


    /*
       ================================================
       現在選択中のスポーツが存在するか確認
       ================================================
    */

    if(!currentSport.sport){

        console.error(
            "❌ 現在選択中のスポーツが取得できません"
        );

        return false;

    }


    /*
       ================================================
       保存データの確認
       ================================================
    */

    if(
        !games ||
        typeof games !== "object" ||
        Array.isArray(games)
    ){

        console.error(
            "❌ 保存するスポーツゲームデータが不正です"
        );

        return false;

    }


    /*
       ================================================
       お気に入り番号ごとに保存
       
       games[0] → 1番目のお気に入り
       games[1] → 2番目のお気に入り
       games[2] → 3番目のお気に入り
       
       同じスポーツでも完全に別管理
       ================================================
    */

    data.sportsCalendar.games[selectedIndex] =
        games;


    /*
       ================================================
       DB保存
       ================================================
    */

    db.save(
        data
    );


    return true;

}


/* =====================================================
   設定読み込み
===================================================== */

function loadSportsSettings(){

    const data =
        db.load();


    /*
       sportsCalendar が無ければ作成
    */

    if(!data.sportsCalendar){

        data.sportsCalendar = {

            selectedIndex: 0,

            favoriteSports: [

                {
                    sport: "baseball",
                    team: ""
                }

            ],

            games: {}

        };

    }


    const settings =
        data.sportsCalendar;


    /*
       favoriteSports が無ければ作成
    */

    if(
        !Array.isArray(
            settings.favoriteSports
        ) ||
        settings.favoriteSports.length === 0
    ){

        settings.favoriteSports = [

            {
                sport: "baseball",
                team: ""
            }

        ];

    }


    /*
       selectedIndex
    */

    if(
        typeof settings.selectedIndex !== "number"
    ){

        settings.selectedIndex = 0;

    }


    /*
       selectedIndex の範囲チェック
    */

    if(
        settings.selectedIndex < 0 ||
        settings.selectedIndex >=
        settings.favoriteSports.length
    ){

        settings.selectedIndex = 0;

    }


    /*
       games が無ければ作成
    */

    if(
        !settings.games ||
        typeof settings.games !== "object" ||
        Array.isArray(settings.games)
    ){

        settings.games = {};

    }


    /*
       現在選択中のスポーツを確認
    */

    const current =
        settings.favoriteSports[
            settings.selectedIndex
        ];


    /*
       現在のスポーツ設定が
       不正なら baseball に戻す
    */

    if(
        !current ||
        !current.sport
    ){

        settings.favoriteSports[
            settings.selectedIndex
        ] = {

            sport: "baseball",
            team: ""

        };

    }


    db.save(data);


    renderCurrentFavoriteSports();

    updateSportsCalendarTitle();

}


/* =====================================================
   設定保存
===================================================== */

function saveSportsSettings(){

    const data =
        db.load();


    const typeSelect =
        document.getElementById(
            "sportsTypeSelect"
        );


    const teamInput =
        document.getElementById(
            "sportsTeamName"
        );


    const sport =
        typeSelect
        ?
        typeSelect.value
        :
        "baseball";


    const team =
        teamInput
        ?
        teamInput.value.trim()
        :
        "";


    if(!team){

        alert(
            "ファンのチーム名を入力してください。"
        );

        if(teamInput){

            teamInput.focus();

        }

        return;

    }


    if(!data.sportsCalendar){

        data.sportsCalendar = {

            selectedIndex: 0,

            favoriteSports: [],

            games: {}

        };

    }


    if(
        !Array.isArray(
            data.sportsCalendar.favoriteSports
        )
    ){

        data.sportsCalendar.favoriteSports = [];

    }


    /*
       現在選択中のスポーツを更新
    */

    const selectedIndex =
        typeof data.sportsCalendar.selectedIndex === "number"
        ?
        data.sportsCalendar.selectedIndex
        :
        0;


    data.sportsCalendar.favoriteSports[
        selectedIndex
    ] = {

        sport:
            sport,

        team:
            team

    };


    /*
       旧コードとの互換
    */

    data.sportsCalendar.sport =
        sport;

    data.sportsCalendar.team =
        team;


    if(!data.sportsCalendar.games){

        data.sportsCalendar.games = {};

    }


    db.save(data);


    updateSportsCalendarTitle();

    renderCurrentFavoriteSports();

    renderSportsCalendar();


    alert(
        "🏟️ スポーツ設定を保存しました。"
    );

}



/* =====================================================
   タイトル更新
===================================================== */

function updateSportsCalendarTitle(){

    const title =
        document.getElementById(
            "sportsCalendarTitle"
        );


    if(title){

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


title.innerHTML =
    "🏟️ スポーツカレンダー";
    }


    const monthTitle =
        document.getElementById(
            "sportsCalendarMonthTitle"
        );


    if(monthTitle){

        const year =
            sportsCalendarDate.getFullYear();


        const month =
            sportsCalendarDate.getMonth() + 1;


        monthTitle.innerHTML =
            `📅 ${year}年 ${month}月`;


        monthTitle.onclick =
            openSportsCalendarDatePicker;

    }

}


/* =====================================================
   月変更
===================================================== */

function changeSportsMonth(value){

    sportsCalendarDate.setMonth(
        sportsCalendarDate.getMonth() +
        value
    );


    updateSportsCalendarTitle();

    renderSportsCalendar();

}


/* =====================================================
   今日
===================================================== */

function goToSportsToday(){

    sportsCalendarDate =
        new Date();


    updateSportsCalendarTitle();

    renderSportsCalendar();

}


/* =====================================================
   カレンダー描画
===================================================== */

async function renderSportsCalendar(){

    const area =
        document.getElementById(
            "sportsCalendar"
        );


    if(!area){

        return;

    }


    const data =
        db.load();


    const settings =
        data.sportsCalendar || {};



        console.log(
    "🏟️ sportsCalendar設定:",
    settings
);


    /*
       現在選択中スポーツ専用 games
    */

    const games =
        getCurrentSportsGames();


    const year =
        sportsCalendarDate.getFullYear();


    const month =
        sportsCalendarDate.getMonth();


    /* =====================
       🎌 祝日取得
    ===================== */

    const countryCode =
        data.settings?.holidayCountry || "JP";


    const holidays =
        await loadHolidays(
            year,
            countryCode
        );


    const first =
        new Date(
            year,
            month,
            1
        );


    const last =
        new Date(
            year,
            month + 1,
            0
        );


    let html = `

        <div class="sports-week-grid">

            <div class="sports-week sunday">
                日
            </div>

            <div class="sports-week">
                月
            </div>

            <div class="sports-week">
                火
            </div>

            <div class="sports-week">
                水
            </div>

            <div class="sports-week">
                木
            </div>

            <div class="sports-week">
                金
            </div>

            <div class="sports-week saturday">
                土
            </div>

        </div>


        <div class="sports-day-grid">
    `;


    /* =====================
       月初の空白
    ===================== */

    for(
        let i = 0;
        i < first.getDay();
        i++
    ){

        html += `
            <div class="sports-empty-day"></div>
        `;

    }


    /* =====================
       今日
    ===================== */

    const today =
        new Date();


    /* =====================
       日付
    ===================== */

    for(
        let d = 1;
        d <= last.getDate();
        d++
    ){

        const date =
            `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;


        const dayOfWeek =
            new Date(
                year,
                month,
                d
            ).getDay();


        const holiday =
            holidays.find(
                h =>
                    h.date === date
            );


        const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === d;


        const game =
            games[date];


        let scoreHTML = "";


if(game){

    let teamScore = 0;
    let opponentScore = 0;


    /*
       ⚾ 野球
    */

    if(
        settings.favoriteSports?.[
            settings.selectedIndex || 0
        ]?.sport === "baseball"
    ){

        teamScore =
            calculateBaseballTotal(
                game.teamScores
            );

        opponentScore =
            calculateBaseballTotal(
                game.opponentScores
            );

    }


    /*
       ⚽ サッカー
    */

    else if(
        settings.favoriteSports?.[
            settings.selectedIndex || 0
        ]?.sport === "soccer"
    ){

teamScore =
    calculateSoccerTotal(
        game.firstHalf,
        game.secondHalf,
        game.extraFirstHalf,
        game.extraSecondHalf
    );

opponentScore =
    calculateSoccerOpponentTotal(
        game.firstHalf,
        game.secondHalf,
        game.extraFirstHalf,
        game.extraSecondHalf
    );
    }


    scoreHTML = `

        <div class="sports-game-preview">

            <div>
                ${escapeSportsHTML(
                    game.opponent ||
                    "対戦相手"
                )}
            </div>

            <strong>
                ${teamScore}
                -
                ${opponentScore}
            </strong>

        </div>

    `;

}

        html += `

            <div
                class="
                    sports-day
                    ${dayOfWeek === 0 ? "sunday" : ""}
                    ${dayOfWeek === 6 ? "saturday" : ""}
                    ${isToday ? "today" : ""}
                    ${game ? "has-game" : ""}
                    ${holiday ? "holiday" : ""}
                "
                onclick="openSportsGame('${date}')"
            >

                <div class="sports-day-number">
                    ${d}
                </div>

                ${
                    holiday
                    ?
                    `
                    <div class="holiday-name">
                        ${escapeSportsHTML(
                            holiday.localName
                        )}
                    </div>
                    `
                    :
                    ""
                }

                ${scoreHTML}

            </div>

        `;

    }


    html += `
        </div>
    `;


    area.innerHTML =
        html;

}


/* =====================================================
   日付タップ
===================================================== */

function openSportsGame(date){

    sportsSelectedDate = date;


    /* =====================
       現在のスポーツの試合データ
    ===================== */

    const games =
        getCurrentSportsGames();


    /* =====================
       試合あり → 共通結果画面
       試合なし → 共通編集画面
    ===================== */

    if(games?.[date]){

        openSportsGameDetailPage(
            date
        );

        return;
    }


    openSportsGameEditPage(
        date
    );

}


/* =====================================================
   試合モーダルを閉じる
===================================================== */

function closeSportsGameModal(){

    const modal =
        document.getElementById(
            "sportsGameModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}


/* =====================================================
   スポーツHTMLエスケープ
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
   野球合計
===================================================== */

function calculateBaseballTotal(scores){

    if(!Array.isArray(scores)){

        return 0;

    }


    return scores.reduce(
        (total, value) => {

            const number =
                Number(value);


            return total +
                (
                    Number.isFinite(number)
                    ? number
                    : 0
                );

        },
        0
    );

}


/* =====================================================
   スポーツデータ保存
===================================================== */

function saveSportsGameData(
    date,
    game
){

    const data =
        db.load();


    if(!data.sportsCalendar){

        data.sportsCalendar = {

            selectedIndex: 0,

            favoriteSports: [

                {
                    sport: "baseball",
                    team: ""
                }

            ],

            games: {}

        };

    }


    const settings =
        data.sportsCalendar;


    if(!settings.games){

        settings.games = {};

    }


    /*
       ================================================
       現在選択中のお気に入り番号
       ================================================
    */

    const selectedIndex =
        typeof settings.selectedIndex === "number"
        ?
        settings.selectedIndex
        :
        0;


    const favoriteSports =
        Array.isArray(settings.favoriteSports)
        ?
        settings.favoriteSports
        :
        [];


    const currentSport =
        favoriteSports[selectedIndex] ||
        {};


    /*
       ================================================
       現在選択中のスポーツを確認
       ================================================
    */

    if(!currentSport.sport){

        console.error(
            "❌ 現在選択中のスポーツがありません"
        );

        return false;

    }


    /*
       ================================================
       お気に入り番号ごとに
       試合データを完全分離
       
       例：

       games:
       {
           0: {
               "2026-09-12": {...}
           },

           1: {
               "2026-09-12": {...}
           },

           2: {
               "2026-09-12": {...}
           }
       }

       0 = 野球（中日）
       1 = サッカー（グランパス）
       2 = 野球（サムライJAPAN）
       ================================================
    */

    if(
        !settings.games[selectedIndex] ||
        typeof settings.games[selectedIndex] !== "object" ||
        Array.isArray(settings.games[selectedIndex])
    ){

        settings.games[selectedIndex] = {};

    }


    /*
       ================================================
       試合データ保存
       ================================================
    */

    settings.games[selectedIndex][date] =
        game;


    /*
       ================================================
       DB保存
       ================================================
    */

    db.save(
        data
    );


    /*
       ================================================
       スポーツカレンダー再描画
       ================================================
    */

    renderSportsCalendar();


    return true;

}



/* =====================================================
   初期表示
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        loadSportsSettings();

        renderSportsCalendar();

    }
);


/* =====================================================
   HTMLボタン用
===================================================== */

function sportsCalendarPrevMonth(){

    changeSportsMonth(-1);

}


function sportsCalendarNextMonth(){

    changeSportsMonth(1);

}


function sportsCalendarToday(){

    goToSportsToday();

}


/* =====================================================
   年月選択
===================================================== */

function openSportsCalendarDatePicker(){

    const modal =
        document.getElementById(
            "sportsCalendarDatePickerModal"
        );


    const yearSelect =
        document.getElementById(
            "sportsCalendarYearSelect"
        );


    const monthSelect =
        document.getElementById(
            "sportsCalendarMonthSelect"
        );


    if(
        !modal ||
        !yearSelect ||
        !monthSelect
    ){

        return;

    }


    const currentYear =
        sportsCalendarDate.getFullYear();


    yearSelect.innerHTML = "";


    for(
        let year = currentYear - 10;
        year <= currentYear + 10;
        year++
    ){

        const option =
            document.createElement(
                "option"
            );


        option.value =
            year;


        option.textContent =
            `${year}年`;


        yearSelect.appendChild(
            option
        );

    }


    yearSelect.value =
        currentYear;


    monthSelect.value =
        sportsCalendarDate.getMonth();


    modal.style.display =
        "block";

}


function closeSportsCalendarDatePicker(){

    const modal =
        document.getElementById(
            "sportsCalendarDatePickerModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}


async function applySportsCalendarDatePicker(){

    const yearSelect =
        document.getElementById(
            "sportsCalendarYearSelect"
        );


    const monthSelect =
        document.getElementById(
            "sportsCalendarMonthSelect"
        );


    if(
        !yearSelect ||
        !monthSelect
    ){

        return;

    }


    const year =
        Number(
            yearSelect.value
        );


    const month =
        Number(
            monthSelect.value
        );


    sportsCalendarDate =
        new Date(
            year,
            month,
            1
        );


    closeSportsCalendarDatePicker();


    updateSportsCalendarTitle();


    await renderSportsCalendar();

}


/* =====================================================
   🏟️ 現在の応援スポーツ表示
===================================================== */

function renderCurrentFavoriteSports(){

    const data =
        db.load();


    const settings =
        data.sportsCalendar || {};


    const favoriteSports =
        Array.isArray(
            settings.favoriteSports
        )
        ?
        settings.favoriteSports
        :
        [];


    const selectedIndex =
        typeof settings.selectedIndex === "number"
        ?
        settings.selectedIndex
        :
        0;


    const select =
        document.getElementById(
            "sportsCurrentSelect"
        );


const sportName =
    document.getElementById(
        "sportsCurrentSportName"
    );

    if(!select){

        return;

    }


    select.innerHTML = "";


    favoriteSports.forEach(
        (item, index) => {

            if(!item){

                return;

            }


            const sport =
                SPORTS_TYPES.find(
                    s =>
                        s.value === item.sport
                );


            if(!sport){

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                index;


option.textContent =
    `${sport.icon || ""} ${sport.label} (${item.team || "チーム未設定"})`;

            select.appendChild(
                option
            );

        }
    );


    /*
       現在選択
    */

    if(favoriteSports.length > 0){

        select.value =
            String(selectedIndex);


        const current =
            favoriteSports[selectedIndex];


if(sportName){

    const currentSport =
        SPORTS_TYPES.find(
            s =>
                s.value === current?.sport
        );

    const sportLabel =
        sportName.querySelector(
            ".sports-current-sport-label"
        );

    const teamLabel =
        sportName.querySelector(
            ".sports-current-team-name"
        );

    if(sportLabel){

        sportLabel.textContent =
            currentSport?.label ||
            "スポーツ未設定";

    }

    if(teamLabel){

        teamLabel.textContent =
            current?.team ||
            "";

    }

}

    }else{

if(sportName){

    sportName.textContent =
        "スポーツ未設定";

}
    }

}



/* =====================================================
   🏟️ 現在の応援スポーツ変更
===================================================== */

function changeCurrentFavoriteSport(){

    const select =
        document.getElementById(
            "sportsCurrentSelect"
        );


    if(!select){

        return;

    }


    const index =
        Number(
            select.value
        );


    const data =
        db.load();


    if(!data.sportsCalendar){

        return;

    }


    const favoriteSports =
        data.sportsCalendar.favoriteSports;


    if(
        !Array.isArray(favoriteSports) ||
        !favoriteSports[index]
    ){

        return;

    }


    data.sportsCalendar.selectedIndex =
        index;


    /*
       現在選択中のスポーツを
       従来の sport / team にも反映
    */

    data.sportsCalendar.sport =
        favoriteSports[index].sport;


    data.sportsCalendar.team =
        favoriteSports[index].team;


    db.save(data);


    renderCurrentFavoriteSports();

    updateSportsCalendarTitle();

    renderSportsCalendar();

}


/* =====================================================
   🏟️ 応援スポーツ設定モーダルを開く
===================================================== */

function openFavoriteSportsSettings(){

    const modal =
        document.getElementById(
            "favoriteSportsSettingsModal"
        );


    const list =
        document.getElementById(
            "favoriteSportsSettingsList"
        );


    if(!modal || !list){

        return;

    }


    const data =
        db.load();


    const settings =
        data.sportsCalendar || {};


    let favoriteSports =
        Array.isArray(
            settings.favoriteSports
        )
        ?
        settings.favoriteSports
        :
        [];


    /*
       最大10件分を表示
    */

    while(
        favoriteSports.length <
        MAX_FAVORITE_SPORTS
    ){

        favoriteSports.push({

            sport: "",

            team: ""

        });

    }


    list.innerHTML = "";


    favoriteSports
        .slice(0, MAX_FAVORITE_SPORTS)
        .forEach(
            (item, index) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "favorite-sports-row";


                /*
                   スポーツ選択
                */

                let options =
                    `<option value="">スポーツ選択</option>`;


                SPORTS_TYPES.forEach(
                    sport => {

                        options += `
                            <option
                                value="${sport.value}"
                                ${
                                    item.sport ===
                                    sport.value
                                    ?
                                    "selected"
                                    :
                                    ""
                                }
                            >
                                ${sport.label}
                            </option>
                        `;

                    }
                );


                row.innerHTML = `

                    <div
                        class="favorite-sports-number"
                    >
                        ${index + 1}
                    </div>


                    <select
                        class="favorite-sport-type"
                    >
                        ${options}
                    </select>


                    <input
                        type="text"
                        class="favorite-sport-team"
                        value="${escapeSportsHTML(
                            item.team || ""
                        )}"
                        placeholder="応援チーム名"
                        autocomplete="off"
                    >

                `;


                list.appendChild(row);

            }
        );


    modal.style.display =
        "block";

}


/* =====================================================
   🏟️ 応援スポーツ設定を保存
===================================================== */

function saveFavoriteSportsSettings(){

    const list =
        document.getElementById(
            "favoriteSportsSettingsList"
        );


    if(!list){

        return;

    }


    const rows =
        list.querySelectorAll(
            ".favorite-sports-row"
        );


    const favoriteSports = [];


    let hasInvalidRow = false;


    rows.forEach(
        row => {

            if(hasInvalidRow){

                return;

            }


            const type =
                row.querySelector(
                    ".favorite-sport-type"
                );


            const team =
                row.querySelector(
                    ".favorite-sport-team"
                );


            const sport =
                type
                ?
                type.value
                :
                "";


            const teamName =
                team
                ?
                team.value.trim()
                :
                "";


            /*
               ================================================
               両方空欄なら登録しない
               ================================================
            */

            if(!sport && !teamName){

                return;

            }


            /*
               ================================================
               スポーツ未選択
               ================================================
            */

            if(!sport){

                alert(
                    "スポーツを選択してください。"
                );

                hasInvalidRow = true;

                return;

            }


            /*
               ================================================
               チーム名未入力
               ================================================
            */

            if(!teamName){

                alert(
                    "応援チーム名を入力してください。"
                );

                hasInvalidRow = true;

                return;

            }


            /*
               ================================================
               お気に入りスポーツ登録
               ================================================
            */

            favoriteSports.push({

                sport:
                    sport,

                team:
                    teamName

            });

        }
    );


    /*
       ================================================
       入力エラーがあれば保存しない
       ================================================
    */

    if(hasInvalidRow){

        return;

    }


    /*
       ================================================
       1件以上必要
       ================================================
    */

    if(favoriteSports.length === 0){

        alert(
            "少なくとも1件、応援スポーツを登録してください。"
        );

        return;

    }


    const data =
        db.load();


    if(!data.sportsCalendar){

        data.sportsCalendar = {};

    }


    /*
       ================================================
       現在選択中のお気に入りを確認
       ================================================
    */

    const oldIndex =
        typeof data.sportsCalendar.selectedIndex === "number"
        ?
        data.sportsCalendar.selectedIndex
        :
        0;


    const oldCurrent =
        data.sportsCalendar.favoriteSports?.[
            oldIndex
        ];


    let newIndex = 0;


    /*
       ================================================
       現在選択中のスポーツを
       新しい設定でもできるだけ維持
       ================================================
    */

    if(oldCurrent){

        const found =
            favoriteSports.findIndex(
                item =>
                    item.sport ===
                    oldCurrent.sport &&
                    item.team ===
                    oldCurrent.team
            );


        if(found >= 0){

            newIndex = found;

        }

    }


    /*
       ================================================
       お気に入りスポーツを保存
       ================================================
    */

    data.sportsCalendar.favoriteSports =
        favoriteSports;


    data.sportsCalendar.selectedIndex =
        newIndex;


    /*
       ================================================
       既存コードとの互換
       ================================================
    */

    data.sportsCalendar.sport =
        favoriteSports[newIndex].sport;


    data.sportsCalendar.team =
        favoriteSports[newIndex].team;


    /*
       ================================================
       games は絶対に削除しない
       
       既に保存されている
       
       games[0]
       games[1]
       games[2]
       
       などをそのまま維持する。
       
       新しくお気に入りを追加した場合は、
       その番号の games がまだ無ければ
       後から試合登録時に作成される。
       ================================================
    */

    if(
        !data.sportsCalendar.games ||
        typeof data.sportsCalendar.games !== "object" ||
        Array.isArray(data.sportsCalendar.games)
    ){

        data.sportsCalendar.games = {};

    }


    /*
       ================================================
       DB保存
       ================================================
    */

    db.save(
        data
    );


    /*
       ================================================
       設定画面を閉じる
       ================================================
    */

    closeFavoriteSportsSettings();


    /*
       ================================================
       表示更新
       ================================================
    */

    renderCurrentFavoriteSports();

    updateSportsCalendarTitle();

    renderSportsCalendar();

}



/* =====================================================
   🏟️ 応援スポーツ設定を閉じる
===================================================== */

function closeFavoriteSportsSettings(){

    const modal =
        document.getElementById(
            "favoriteSportsSettingsModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}



/* =====================================================
   ⚾ 試合結果ページ → スポーツカレンダーへ戻る
===================================================== */

function closeSportsGameDetailPage(){

    const detailPage =
        document.getElementById(
            "sportsGameDetailPage"
        );

    const editPage =
        document.getElementById(
            "sportsGameEditPage"
        );

    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );

    const sportsScreen =
        document.getElementById(
            "sportsCalendarScreen"
        );


    /*
       結果画面を非表示
    */

    if(detailPage){

        detailPage.classList.remove("active");
        detailPage.style.display = "none";

    }


    /*
       編集画面も念のため非表示
    */

    if(editPage){

        editPage.classList.remove("active");
        editPage.style.display = "none";

    }


    /*
       スポーツカレンダーを再表示
    */

    if(sportsPage){

        sportsPage.classList.add("active");
        sportsPage.style.display = "";

    }


    if(sportsScreen){

        sportsScreen.style.display = "";

    }


    /*
       最新状態で再描画
    */

    renderSportsCalendar();


    /*
       選択日を解除
    */

    sportsSelectedDate =
        null;

}


/* =====================================================
   試合結果編集ページを開く
===================================================== */

async function closeSportsGameEditPage(){


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
       編集対象の日付がある場合
       → 共通結果画面へ戻る
    */

const games =
    getCurrentSportsGames();


if(
    sportsSelectedDate &&
    games?.[sportsSelectedDate]
){

    openSportsGameDetailPage(
        sportsSelectedDate
    );

    return;

}

    /*
       日付がない場合
       → スポーツカレンダーへ戻る
    */

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


    const sportsScreen =
    document.getElementById(
        "sportsCalendarScreen"
    );

if(sportsScreen){

    sportsScreen.style.display =
        "block";

}






await renderSportsCalendar();


console.log(
    "★★ キャンセル後 sportsCalendarPage:",
    document.getElementById("sportsCalendarPage")
);

console.log(
    "★★ キャンセル後 display:",
    document.getElementById("sportsCalendarPage")?.style.display
);

console.log(
    "★★ キャンセル後 class:",
    document.getElementById("sportsCalendarPage")?.className
);



setTimeout(() => {

    console.log(
        "★★★ 100ms後 display:",
        document.getElementById(
            "sportsCalendarPage"
        )?.style.display
    );

    console.log(
        "★★★ 100ms後 class:",
        document.getElementById(
            "sportsCalendarPage"
        )?.className
    );

}, 100);




}



function hideSportsSubPages(){

    document
        .querySelectorAll(".sports-sub-page")
        .forEach(page => {

            page.classList.remove("active");
            page.style.display = "none";

        });


    const sportsScreen =
        document.getElementById(
            "sportsCalendarScreen"
        );

    if(sportsScreen){

        sportsScreen.style.display = "none";

    }

}



function openSportsGameDetailPage(date){

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
            "❌ スポーツカレンダーまたは試合結果ページが見つかりません"
        );

        return;
    }

    /* =====================
       スポーツ判定
    ===================== */

    const data =
        db.load();

    const settings =
        data.sportsCalendar ||
        {};

    const selectedIndex =
        typeof settings.selectedIndex === "number"
        ? settings.selectedIndex
        : 0;

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


    /* =====================
       ページ切り替え
    ===================== */

    hideSportsSubPages();

    sportsPage.classList.remove(
        "active"
    );

    sportsPage.style.display =
        "none";

    detailPage.classList.add(
        "active"
    );

    detailPage.style.display =
        "block";


    /* =====================
       スポーツ別結果表示
    ===================== */

    if(sport === "baseball"){

        showBaseballGameDetail(
            date
        );

        return;
    }

    if(sport === "soccer"){

        showSoccerGameDetail(
            date
        );

        return;
    }


    /* =====================
       未対応スポーツ
    ===================== */

    console.error(
        "❌ 未対応のスポーツです:",
        sport
    );

    alert(
        "このスポーツの試合結果表示にはまだ対応していません。"
    );

}



function openSportsGameEditPage(date){

    if(!date){
        console.error("❌ 編集する試合日がありません");
        return;
    }

    sportsSelectedDate = date;

    const data = db.load();
    const settings = data.sportsCalendar || {};

    const selectedIndex =
        typeof settings.selectedIndex === "number"
        ? settings.selectedIndex
        : 0;

    const favoriteSports =
        Array.isArray(settings.favoriteSports)
        ? settings.favoriteSports
        : [];

    const currentSport =
        favoriteSports[selectedIndex] ||
        {};

    const sport =
        currentSport.sport ||
        "";

    /* =====================
       ページ切り替え
    ===================== */

    hideSportsSubPages();

    const sportsPage =
        document.getElementById(
            "sportsCalendarPage"
        );

    const editPage =
        document.getElementById(
            "sportsGameEditPage"
        );

    if(sportsPage){
        sportsPage.classList.remove("active");
        sportsPage.style.display = "none";
    }

    if(editPage){
        editPage.classList.add("active");
        editPage.style.display = "block";
    }


    /* =====================
       スポーツ別編集画面
    ===================== */

    if(sport === "baseball"){

        openBaseballGameEditPage(date);

        return;
    }

    if(sport === "soccer"){

        openSoccerGameEditPage(date);

        return;
    }


    console.error(
        "❌ 未対応のスポーツです:",
        sport
    );

    alert(
        "このスポーツの試合編集にはまだ対応していません。"
    );
}