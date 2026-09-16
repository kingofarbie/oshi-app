/* =====================================================
   💊 健康カレンダー
   calendar-health.js

   calendar-sports.js の
   カレンダー表示・操作仕様を踏襲。

   ・スポーツデータとは完全分離
   ・healthCalendar のみ使用
   ・月移動
   ・今日
   ・年月選択
   ・祝日
   ・月スワイプ
   ・日付選択
===================================================== */


/* =====================================================
   状態
===================================================== */

let healthCalendarDate =
    new Date();

let healthSelectedDate =
    null;


/* =====================================================
   💊 健康カレンダー月スワイプ
===================================================== */

let healthCalendarSwipeStartX =
    0;

let healthCalendarSwipeStartY =
    0;


/* =====================================================
   通常カレンダーへ戻る
===================================================== */

function closeHealthCalendar(){

    const normalCalendar =
        document.getElementById(
            "calendarContainer"
        );


    const screen =
        document.getElementById(
            "healthCalendarScreen"
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
   💊 健康カレンダー入口
===================================================== */

async function openHealthCalendar(){

    const container =
        document.getElementById(
            "calendar"
        );


    if(!container){

        console.error(
            "❌ 通常カレンダーの表示領域が見つかりません"
        );

        return;

    }


    try{

        const response =
            await fetch(
                "calendar-health.html"
            );


        if(!response.ok){

            throw new Error(
                "calendar-health.html の読み込みに失敗しました"
            );

        }


        const html =
            await response.text();


        /*
           =================================================
           HTMLを読み込み
           =================================================
        */

        container.innerHTML =
            html;


        /*
           =================================================
           健康CSSを確実に読み込む

           innerHTMLで読み込んだHTML内の
           linkに依存しない。
           =================================================
        */

        loadHealthCalendarCSS();


        /*
           =================================================
           初期化
           =================================================
        */

        initializeHealthCalendar();


    }catch(error){

        console.error(
            "❌ 健康カレンダーを開けません:",
            error
        );

        alert(
            "健康カレンダーを開けませんでした。"
        );

    }

}


/* =====================================================
   💊 健康CSS読み込み
===================================================== */

function loadHealthCalendarCSS(){

    const existing =
        document.querySelector(
            'link[data-health-calendar-css="true"]'
        );


    if(existing){

        return;

    }


    const link =
        document.createElement(
            "link"
        );


    link.rel =
        "stylesheet";

    link.href =
        "calendar-health.css";

    link.dataset.healthCalendarCss =
        "true";


    document.head.appendChild(
        link
    );

}


/* =====================================================
   初期化
===================================================== */

function initializeHealthCalendar(){

    healthCalendarDate =
        new Date();

    healthSelectedDate =
        null;


    updateHealthCalendarTitle();

    renderHealthCalendar();

}


/* =====================================================
   タイトル更新
===================================================== */

function updateHealthCalendarTitle(){

    const title =
        document.getElementById(
            "healthCalendarTitle"
        );


    if(title){

        title.innerHTML =
            "💊 健康カレンダー";

    }


    const monthTitle =
        document.getElementById(
            "healthCalendarMonthTitle"
        );


    if(monthTitle){

        const year =
            healthCalendarDate.getFullYear();


        const month =
            healthCalendarDate.getMonth() + 1;


        monthTitle.innerHTML =
            `📅 ${year}年 ${month}月`;


        monthTitle.onclick =
            openHealthCalendarDatePicker;

    }

}


/* =====================================================
   月変更
===================================================== */

function changeHealthMonth(
    value
){

    healthCalendarDate.setMonth(
        healthCalendarDate.getMonth() +
        value
    );


    updateHealthCalendarTitle();

    renderHealthCalendar();

}


/* =====================================================
   今日
===================================================== */

function goToHealthToday(){

    healthCalendarDate =
        new Date();


    updateHealthCalendarTitle();

    renderHealthCalendar();

}


/* =====================================================
   HTMLボタン用
===================================================== */

function healthCalendarPrevMonth(){

    changeHealthMonth(-1);

}


function healthCalendarNextMonth(){

    changeHealthMonth(1);

}


function healthCalendarToday(){

    goToHealthToday();

}


/* =====================================================
   💊 健康データ取得
===================================================== */

function getHealthCalendarData(){

    const data =
        db.load();


    /*
       sportsCalendar には触れない。

       健康データは必ず
       healthCalendar に保存する。
    */

    if(
        !data.healthCalendar ||
        typeof data.healthCalendar !== "object" ||
        Array.isArray(data.healthCalendar)
    ){

        return {

            records: {}

        };

    }


    const health =
        data.healthCalendar;


    if(
        !health.records ||
        typeof health.records !== "object" ||
        Array.isArray(health.records)
    ){

        return {

            records: {}

        };

    }


    return health;

}


/* =====================================================
   💊 健康カレンダー描画
===================================================== */

async function renderHealthCalendar(){

    const area =
        document.getElementById(
            "healthCalendar"
        );


    if(!area){

        return;

    }


    const year =
        healthCalendarDate.getFullYear();


    const month =
        healthCalendarDate.getMonth();


    /*
       =================================================
       祝日
       =================================================
    */

    const data =
        db.load();


    const countryCode =
        data.settings?.holidayCountry ||
        "JP";


    const holidays =
        await loadHolidays(
            year,
            countryCode
        );


    /*
       =================================================
       月初・月末
       =================================================
    */

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


    /*
       =================================================
       健康データ
       =================================================
    */

    const healthData =
        getHealthCalendarData();


    const records =
        healthData.records ||
        {};


    /*
       =================================================
       HTML開始
       =================================================
    */

    let html = `

        <div class="health-week-grid">

            <div class="health-week sunday">
                日
            </div>

            <div class="health-week">
                月
            </div>

            <div class="health-week">
                火
            </div>

            <div class="health-week">
                水
            </div>

            <div class="health-week">
                木
            </div>

            <div class="health-week">
                金
            </div>

            <div class="health-week saturday">
                土
            </div>

        </div>


        <div class="health-day-grid">
    `;


    /*
       =================================================
       月初の空白
       =================================================
    */

    for(
        let i = 0;
        i < first.getDay();
        i++
    ){

        html += `

            <div
                class="health-empty-day"
            ></div>

        `;

    }


    /*
       =================================================
       今日
       =================================================
    */

    const today =
        new Date();


    /*
       =================================================
       日付
       =================================================
    */

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


        const isSelected =
            healthSelectedDate ===
            date;


        const dayRecord =
            records[date];


        /*
           =================================================
           健康記録アイコン
           =================================================
        */

        let recordHTML =
            "";


        if(
            dayRecord &&
            typeof dayRecord === "object"
        ){

            const icons = [];


            /*
               💊 服薬
            */

            if(
                dayRecord.medication
            ){

                icons.push(
                    "💊"
                );

            }


            /*
               🌡️ 体温
            */

            if(
                dayRecord.temperature != null
            ){

                icons.push(
                    "🌡️"
                );

            }


            /*
               🩺 血圧
            */

            if(
                dayRecord.bloodPressure
            ){

                icons.push(
                    "🩺"
                );

            }


            /*
               ❤️ 脈拍
            */

            if(
                dayRecord.pulse != null
            ){

                icons.push(
                    "❤️"
                );

            }


            /*
               🌸 月経
            */

            if(
                dayRecord.menstrual
            ){

                icons.push(
                    "🌸"
                );

            }


            /*
               😊 体調
            */

            if(
                dayRecord.condition
            ){

                icons.push(
                    "😊"
                );

            }


            if(
                icons.length > 0
            ){

                recordHTML = `

                    <div
                        class="health-day-records"
                    >

                        ${icons
                            .map(
                                icon =>
                                    `<span class="health-record-icon">${icon}</span>`
                            )
                            .join("")
                        }

                    </div>

                `;

            }

        }


        /*
           =================================================
           日付セル
           =================================================
        */

        html += `

            <div
                class="
                    health-day
                    ${dayOfWeek === 0 ? "sunday" : ""}
                    ${dayOfWeek === 6 ? "saturday" : ""}
                    ${isToday ? "today" : ""}
                    ${isSelected ? "selected" : ""}
                    ${holiday ? "holiday" : ""}
                "
                onclick="openHealthDay('${date}')"
            >

                <div
                    class="health-day-number"
                >
                    ${d}
                </div>


                ${
                    holiday
                    ?
                    `
                    <div
                        class="holiday-name"
                    >
                        ${escapeHealthHTML(
                            holiday.localName
                        )}
                    </div>
                    `
                    :
                    ""
                }


                ${recordHTML}

            </div>

        `;

    }


    html += `

        </div>

    `;


    area.innerHTML =
        html;


    /*
       =================================================
       💊 健康カレンダー月スワイプ
       スポーツと同じ判定
       =================================================
    */

    area.ontouchstart =
        function(event){

            if(
                event.touches.length !== 1
            ){

                return;

            }


            healthCalendarSwipeStartX =
                event.touches[0].clientX;


            healthCalendarSwipeStartY =
                event.touches[0].clientY;

        };


    area.ontouchend =
        function(event){

            if(
                event.changedTouches.length !== 1
            ){

                return;

            }


            const touch =
                event.changedTouches[0];


            const diffX =
                touch.clientX -
                healthCalendarSwipeStartX;


            const diffY =
                touch.clientY -
                healthCalendarSwipeStartY;


            /*
               縦スクロールを
               月スワイプとして扱わない
            */

            if(
                Math.abs(diffX) < 60
            ){

                return;

            }


            if(
                Math.abs(diffX) <=
                Math.abs(diffY)
            ){

                return;

            }


            /*
               左スワイプ
               → 次月
            */

            if(diffX < 0){

                changeHealthMonth(
                    1
                );

            }


            /*
               右スワイプ
               → 前月
            */

            else{

                changeHealthMonth(
                    -1
                );

            }

        };

}


/* =====================================================
   💊 健康日付タップ
===================================================== */

function openHealthDay(
    date
){

    healthSelectedDate =
        date;


    /*
       今は健康日めくり画面が
       未実装なので、まず選択状態だけ更新。
    */

    renderHealthCalendar();


    console.log(
        "💊 健康カレンダー選択日:",
        date
    );

}


/* =====================================================
   健康HTMLエスケープ
===================================================== */

function escapeHealthHTML(
    value
){

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =====================================================
   年月選択
===================================================== */

function openHealthCalendarDatePicker(){

    const modal =
        document.getElementById(
            "healthCalendarDatePickerModal"
        );


    const yearSelect =
        document.getElementById(
            "healthCalendarYearSelect"
        );


    const monthSelect =
        document.getElementById(
            "healthCalendarMonthSelect"
        );


    if(
        !modal ||
        !yearSelect ||
        !monthSelect
    ){

        return;

    }


    const currentYear =
        healthCalendarDate.getFullYear();


    yearSelect.innerHTML =
        "";


    /*
       スポーツと同じ
       前後10年
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


        yearSelect.appendChild(
            option
        );

    }


    yearSelect.value =
        currentYear;


    monthSelect.value =
        healthCalendarDate.getMonth();


    modal.style.display =
        "block";

}


/* =====================================================
   年月選択を閉じる
===================================================== */

function closeHealthCalendarDatePicker(){

    const modal =
        document.getElementById(
            "healthCalendarDatePickerModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}


/* =====================================================
   年月適用
===================================================== */

async function applyHealthCalendarDatePicker(){

    const yearSelect =
        document.getElementById(
            "healthCalendarYearSelect"
        );


    const monthSelect =
        document.getElementById(
            "healthCalendarMonthSelect"
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


    healthCalendarDate =
        new Date(
            year,
            month,
            1
        );


    closeHealthCalendarDatePicker();


    updateHealthCalendarTitle();


    await renderHealthCalendar();

}


/* =====================================================
   初期状態
===================================================== */

console.log(
    "💊 calendar-health.js 読み込み完了"
);