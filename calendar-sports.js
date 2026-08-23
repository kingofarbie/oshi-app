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
   🏟️ スポーツカレンダーを開く
===================================================== */

function openSportsCalendar(){

    const normalCalendar =
        document.getElementById(
            "calendarContainer"
        );

    const screen =
        document.getElementById(
            "sportsCalendarScreen"
        );


    if(normalCalendar){

        normalCalendar.style.display =
            "none";

    }


    if(screen){

        screen.style.display =
            "";

    }


    loadSportsSettings();

    updateSportsCalendarTitle();

    renderSportsCalendar();

}


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


        monthTitle.textContent =
            `📅 ${year}年 ${month}月`;

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
   📅 年月ジャンプを開く
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


    const currentMonth =
        sportsCalendarDate.getMonth();


    yearSelect.innerHTML =
        "";


    /*
     * 現在の年を中心に
     * 前後10年を選択可能
     */

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


        if(
            year === currentYear
        ){

            option.selected =
                true;

        }


        yearSelect.appendChild(
            option
        );

    }


    monthSelect.value =
        String(currentMonth);


    modal.style.display =
        "block";

}


/* =====================================================
   年月ジャンプ適用
===================================================== */

function applySportsCalendarDatePicker(){

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


    if(
        !Number.isFinite(year) ||
        !Number.isFinite(month)
    ){

        return;

    }


    sportsCalendarDate =
        new Date(
            year,
            month,
            1
        );


    closeSportsCalendarDatePicker();


    updateSportsCalendarTitle();

    renderSportsCalendar();

}


/* =====================================================
   年月ジャンプを閉じる
===================================================== */

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


/* =====================================================
   📅 祝日取得
===================================================== */

/*
 * 現段階では通常 calendar.js の
 * 祝日取得処理を直接変更しない。
 *
 * 今後、通常カレンダーで使用している
 * 祝日データ・関数が確認できたら
 * ここへ完全接続する。
 *
 * 外部から holiday データを渡せる構造に
 * しておく。
 */

function getSportsHoliday(date){

    /*
     * 既存の祝日関数が存在する場合は利用
     */

    if(
        typeof getHolidayName === "function"
    ){

        try{

            return getHolidayName(date) || "";

        }catch(e){

        }

    }


    if(
        typeof getHoliday === "function"
    ){

        try{

            const result =
                getHoliday(date);

            if(
                typeof result === "string"
            ){

                return result;

            }

            if(
                result &&
                typeof result.name === "string"
            ){

                return result.name;

            }

        }catch(e){

        }

    }


    return "";

}


/* =====================================================
   🏟️ カレンダー描画
===================================================== */

function renderSportsCalendar(){

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

            <div
                class="sports-empty-day"
            ></div>

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


        const dateObject =
            new Date(
                year,
                month,
                d
            );


        const dayOfWeek =
            dateObject.getDay();


        const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === d;


        const game =
            games[date];


        /* =====================
           祝日
        ===================== */

        const holiday =
            getSportsHoliday(date);


        /* =====================
           試合表示
        ===================== */

        let scoreHTML =
            "";


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

                <div
                    class="sports-game-preview"
                >

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


        /* =====================
           祝日表示
        ===================== */

        let holidayHTML =
            "";


        if(holiday){

            holidayHTML = `

                <div
                    class="sports-holiday-name"
                >
                    ${escapeSportsHTML(
                        holiday
                    )}
                </div>

            `;

        }


        /* =====================
           セルクラス
        ===================== */

        const cellClasses = [

            "sports-day",

            dayOfWeek === 0
                ? "sunday"
                : "",

            dayOfWeek === 6
                ? "saturday"
                : "",

            holiday
                ? "holiday"
                : "",

            isToday
                ? "today"
                : "",

            game
                ? "has-game"
                : ""

        ]
        .filter(Boolean)
        .join(" ");


        /* =====================
           HTML
        ===================== */

        html += `

            <div
                class="${cellClasses}"
                onclick="openSportsGame('${date}')"
            >

                <div
                    class="sports-day-number"
                >

                    ${d}

                    ${
                        holiday
                        ? `
                            <span
                                class="sports-holiday-label"
                            >
                                祝
                            </span>
                          `
                        : ""
                    }

                </div>


                ${holidayHTML}


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