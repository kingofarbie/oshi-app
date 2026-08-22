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
   初期化
===================================================== */

function initSportsCalendar(){

    console.log("🏟️ スポーツ裏カレンダー初期化");

    createSportsCalendarUI();

}


/* =====================================================
   UI作成
===================================================== */

function createSportsCalendarUI(){

const container =
    document.getElementById(
        "calendar"
    );

    if(!container){

        console.log(
            "🏟️ calendarContainer がありません"
        );

        return;

    }


    /* =====================
       すでに作成済みなら終了
    ===================== */

    if(
        document.getElementById(
            "sportsCalendarButton"
        )
    ){

        return;

    }


    /* =================================================
       裏カレンダーボタン
    ================================================= */

    const button =
        document.createElement("button");

    button.id =
        "sportsCalendarButton";

    button.className =
        "sports-calendar-button";

    button.innerHTML =
        "🏟️ スポーツ";

    button.onclick =
        openSportsCalendar;


    /* =================================================
       ボタンをカレンダーの上に追加
    ================================================= */

    container.insertBefore(
        button,
        container.firstChild
    );


    /* =================================================
       スポーツ画面
    ================================================= */

    const screen =
        document.createElement("div");

    screen.id =
        "sportsCalendarScreen";

    screen.className =
        "sports-calendar-screen";

    screen.style.display =
        "none";


    screen.innerHTML = `

        <div class="sports-calendar-header">

            <button
                class="sports-back-button"
                onclick="closeSportsCalendar()"
            >
                ◀ 通常カレンダー
            </button>

            <div
                id="sportsCalendarTitle"
                class="sports-calendar-title"
            >
                🏟️ スポーツカレンダー
            </div>

        </div>


        <!-- =========================
             スポーツ設定
        ========================== -->

        <div
            id="sportsCalendarSettings"
            class="sports-calendar-settings"
        >

            <div class="sports-setting-title">
                🏟️ スポーツ設定
            </div>


            <label>
                スポーツ
            </label>

            <select
                id="sportsTypeSelect"
                onchange="changeSportsType()"
            >

                <option value="baseball">
                    ⚾ 野球
                </option>

                <option value="soccer" disabled>
                    ⚽ サッカー（準備中）
                </option>

                <option value="basketball" disabled>
                    🏀 バスケットボール（準備中）
                </option>

                <option value="volleyball" disabled>
                    🏐 バレーボール（準備中）
                </option>

                <option value="rugby" disabled>
                    🏉 ラグビー（準備中）
                </option>

                <option value="tennis" disabled>
                    🎾 テニス（準備中）
                </option>

            </select>


            <label>
                ファンのチーム名
            </label>

            <input
                id="sportsTeamName"
                type="text"
                placeholder="例：阪神タイガース"
            >


            <button
                class="sports-save-settings-button"
                onclick="saveSportsSettings()"
            >
                💾 設定を保存
            </button>

        </div>


        <!-- =========================
             カレンダー
        ========================== -->

        <div
            id="sportsCalendar"
            class="sports-calendar"
        ></div>


        <!-- =========================
             試合入力モーダル
        ========================== -->

        <div
            id="sportsGameModal"
            class="sports-modal"
            style="display:none;"
        >

            <div class="sports-modal-content">

                <div class="sports-modal-header">

                    <div
                        id="sportsGameModalTitle"
                    >
                        ⚾ 試合記録
                    </div>

                    <button
                        onclick="closeSportsGameModal()"
                    >
                        ✕
                    </button>

                </div>


                <div
                    id="sportsGameForm"
                ></div>


                <div class="sports-modal-buttons">

                    <button
                        onclick="saveSportsGame()"
                    >
                        💾 保存
                    </button>

                    <button
                        onclick="closeSportsGameModal()"
                    >
                        キャンセル
                    </button>

                </div>

            </div>

        </div>

    `;


    container.appendChild(
        screen
    );

    console.log(
    "🏟️ sportsCalendarScreen 作成完了",
    document.getElementById("sportsCalendarScreen")
);


    renderSportsCalendar();

}


/* =====================================================
   スポーツカレンダーを開く
===================================================== */



/* =====================================================
   通常カレンダーへ戻る
===================================================== */

function closeSportsCalendar(){

    const normalCalendar =
        document.getElementById(
            "calendar"
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


    if(!title){

        return;

    }


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


/* =====================================================
   月変更
===================================================== */

function changeSportsMonth(value){

    sportsCalendarDate.setMonth(
        sportsCalendarDate.getMonth() +
        value
    );


    renderSportsCalendar();

}


/* =====================================================
   今日
===================================================== */

function goToSportsToday(){

    sportsCalendarDate =
        new Date();


    renderSportsCalendar();

}


/* =====================================================
   カレンダー描画
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

        <div class="sports-month-header">

            <button
                onclick="changeSportsMonth(-1)"
            >
                ◀
            </button>

            <div>
                ${year}年 ${month + 1}月
            </div>

            <button
                onclick="changeSportsMonth(1)"
            >
                ▶
            </button>

        </div>


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
                "
                onclick="openSportsGame('${date}')"
            >

                <div class="sports-day-number">
                    ${d}
                </div>

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