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
   スポーツカレンダーを開く
===================================================== */



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


    const settings =
        data.sportsCalendar || {};


    const typeSelect =
        document.getElementById(
            "sportsTypeSelect"
        );


    const teamInput =
        document.getElementById(
            "sportsTeamName"
        );


    if(typeSelect){

        typeSelect.value =
            settings.sport ||
            "baseball";

    }


    if(teamInput){

        teamInput.value =
            settings.team ||
            "";

    }


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




