/* =====================================================
   🏟️ スポーツ裏カレンダー
   calendar-sports.js

   通常の calendar.js とは分離。
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
        enabled: false
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
    document.getElementById("calendarContainer");


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
   設定読み込み
===================================================== */

function loadSportsSettings(){

    const data =
        db.load();


    /*
       古いデータ形式との互換性を確保
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

        db.save(data);

    }


    /*
       favoriteSports が無い場合
    */

    if(
        !Array.isArray(
            data.sportsCalendar.favoriteSports
        )
    ){

        const oldSport =
            data.sportsCalendar.sport ||
            "baseball";


        const oldTeam =
            data.sportsCalendar.team ||
            "";


        data.sportsCalendar.favoriteSports = [

            {
                sport: oldSport,
                team: oldTeam
            }

        ];

    }


    /*
       selectedIndex
    */

    if(
        typeof data.sportsCalendar.selectedIndex
        !== "number"
    ){

        data.sportsCalendar.selectedIndex = 0;

    }


    /*
       範囲チェック
    */

    if(
        data.sportsCalendar.selectedIndex < 0 ||
        data.sportsCalendar.selectedIndex >=
        data.sportsCalendar.favoriteSports.length
    ){

        data.sportsCalendar.selectedIndex = 0;

    }


    /*
       games が無ければ作る
    */

    if(!data.sportsCalendar.games){

        data.sportsCalendar.games = {};

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
        ? typeSelect.value
        : "baseball";


    const team =
        teamInput
        ? teamInput.value.trim()
        : "";


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

            sport:
                sport,

            team:
                team,

            games:{}

        };

    }else{

        data.sportsCalendar.sport =
            sport;

        data.sportsCalendar.team =
            team;


        if(
            !data.sportsCalendar.games
        ){

            data.sportsCalendar.games = {};

        }

    }


    db.save(data);


    updateSportsCalendarTitle();

    renderSportsCalendar();


    alert(
        "🏟️ スポーツ設定を保存しました。"
    );

}


/* =====================================================
   スポーツ変更
===================================================== */

function changeSportsType(){

    const typeSelect =
        document.getElementById(
            "sportsTypeSelect"
        );


    if(!typeSelect){

        return;

    }


    const sport =
        typeSelect.value;


    if(sport !== "baseball"){

        alert(
            "現在は野球のみ対応しています。"
        );


        typeSelect.value =
            "baseball";

    }

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

        const team =
            settings.team ||
            "チーム未設定";

        title.innerHTML =
            `🏟️ スポーツカレンダー<br>
             <span>${escapeSportsHTML(team)}</span>`;

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

    updateSportsCalendarTitle();  // ← これを追加

    renderSportsCalendar();

}

/* =====================================================
   今日
===================================================== */

function goToSportsToday(){

    sportsCalendarDate =
        new Date();

    updateSportsCalendarTitle();  // ← これを追加

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


    const games =
        settings.games || {};


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
       日付
    ===================== */

    const today =
        new Date();


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
        h => h.date === date
    );







        const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === d;


        const game =
            games[date];


        let scoreHTML = "";


        if(game){

            const teamScore =
                calculateBaseballTotal(
                    game.teamScores
                );


            const opponentScore =
                calculateBaseballTotal(
                    game.opponentScores
                );


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

    sportsSelectedDate =
        date;


    const data =
        db.load();


    const game =
        data.sportsCalendar?.games?.[date] ||
        null;


    const sport =
        data.sportsCalendar?.sport ||
        "baseball";


    /* =====================
       現在は野球のみ
    ===================== */

    if(sport === "baseball"){

        openBaseballGameForm(
            date,
            game
        );

        return;

    }


    alert(
        "このスポーツはまだ対応していません。"
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

            sport:
                "baseball",

            team:
                "",

            games:{}

        };

    }


    if(
        !data.sportsCalendar.games
    ){

        data.sportsCalendar.games = {};

    }


    data.sportsCalendar.games[date] =
        game;


    db.save(data);


    renderSportsCalendar();

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
            document.createElement("option");

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


    const team =
        document.getElementById(
            "sportsCurrentTeam"
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
                document.createElement("option");


            option.value =
                index;


            option.textContent =
                sport.label;


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


        if(team){

            team.textContent =
                current?.team ||
                "チーム未設定";

        }

    }else{

        if(team){

            team.textContent =
                "チーム未設定";

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
        Number(select.value);


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

       ※既存コードとの互換用
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
       最大10件
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


    rows.forEach(
        row => {

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
               両方空欄なら登録しない
            */

            if(!sport && !teamName){

                return;

            }


            /*
               スポーツだけ / チームだけ
               の状態は登録不可
            */

            if(!sport){

                alert(
                    "スポーツを選択してください。"
                );

                return;

            }


            if(!teamName){

                alert(
                    "応援チーム名を入力してください。"
                );

                return;

            }


            favoriteSports.push({

                sport:
                    sport,

                team:
                    teamName

            });

        }
    );


    /*
       1件以上必要
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
       現在選択しているものを
       できるだけ維持
    */

    const oldIndex =
        data.sportsCalendar.selectedIndex || 0;


    const oldCurrent =
        data.sportsCalendar.favoriteSports?.[
            oldIndex
        ];


    let newIndex = 0;


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


    data.sportsCalendar.favoriteSports =
        favoriteSports;


    data.sportsCalendar.selectedIndex =
        newIndex;


    /*
       既存コードとの互換
    */

    data.sportsCalendar.sport =
        favoriteSports[newIndex].sport;


    data.sportsCalendar.team =
        favoriteSports[newIndex].team;


    if(!data.sportsCalendar.games){

        data.sportsCalendar.games = {};

    }


    db.save(data);


    closeFavoriteSportsSettings();


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



