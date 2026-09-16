/* =====================================================
   💊 健康カレンダー
   calendar-health.js

   ・スポーツカレンダーとは完全分離
   ・通常カレンダーと同じ基本仕様
   ・年月移動
   ・今日
   ・年月選択
   ・日曜 / 土曜
   ・祝日
   ・今日表示
   ・選択日
===================================================== */


/* =====================================================
   💊 健康カレンダー状態
===================================================== */

let healthCalendarDate = new Date();

let healthSelectedDate = null;


/* =====================================================
   💊 健康カレンダーを開く
===================================================== */

function openHealthCalendar() {

    /*
     * 通常カレンダー側から呼ばれた場合、
     * calendar-health.html を読み込む。
     *
     * loadCalendarHTML() と同じ構成を想定。
     */

    const container =
        document.getElementById("calendar");

    if (!container) {

        console.error(
            "通常カレンダーの #calendar が見つかりません。"
        );

        return;
    }


    fetch("calendar-health.html")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "calendar-health.html の読み込みに失敗しました。"
                );

            }

            return response.text();

        })

        .then(html => {

            container.innerHTML = html;

            /*
             * 読み込んだHTML内のscriptは
             * innerHTMLでは実行されないため、
             * 健康JSの初期化をここで行う。
             */

            initializeHealthCalendar();

        })

        .catch(error => {

            console.error(
                "健康カレンダー読み込みエラー:",
                error
            );

        });

}


/* =====================================================
   💊 健康カレンダー初期化
===================================================== */

function initializeHealthCalendar() {

    healthCalendarDate = new Date();

    healthSelectedDate = null;


    updateHealthCalendarTitle();

    renderHealthCalendar();

}


/* =====================================================
   📅 月タイトル更新
===================================================== */

function updateHealthCalendarTitle() {

    const title =
        document.getElementById(
            "healthCalendarMonthTitle"
        );

    if (!title) {
        return;
    }


    const year =
        healthCalendarDate.getFullYear();

    const month =
        healthCalendarDate.getMonth() + 1;


    title.textContent =
        `📅 ${year}年${month}月`;

}


/* =====================================================
   ◀ 前月
===================================================== */

function healthCalendarPrevMonth() {

    healthCalendarDate.setMonth(
        healthCalendarDate.getMonth() - 1
    );


    updateHealthCalendarTitle();

    renderHealthCalendar();

}


/* =====================================================
   ▶ 次月
===================================================== */

function healthCalendarNextMonth() {

    healthCalendarDate.setMonth(
        healthCalendarDate.getMonth() + 1
    );


    updateHealthCalendarTitle();

    renderHealthCalendar();

}


/* =====================================================
   📅 今日
===================================================== */

function healthCalendarToday() {

    healthCalendarDate = new Date();

    healthSelectedDate = null;


    updateHealthCalendarTitle();

    renderHealthCalendar();

}


/* =====================================================
   📅 年月選択モーダル
===================================================== */

function openHealthCalendarDatePicker() {

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


    if (
        !modal ||
        !yearSelect ||
        !monthSelect
    ) {
        return;
    }


    /*
     * 現在年を中心に前後10年を表示
     */

    const currentYear =
        healthCalendarDate.getFullYear();


    yearSelect.innerHTML = "";


    for (
        let year = currentYear - 10;
        year <= currentYear + 10;
        year++
    ) {

        const option =
            document.createElement("option");

        option.value = year;

        option.textContent =
            `${year}年`;

        yearSelect.appendChild(option);

    }


    yearSelect.value =
        currentYear;


    monthSelect.value =
        healthCalendarDate.getMonth();


    modal.style.display = "flex";

}


/* =====================================================
   ❌ 年月選択を閉じる
===================================================== */

function closeHealthCalendarDatePicker() {

    const modal =
        document.getElementById(
            "healthCalendarDatePickerModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display = "none";

}


/* =====================================================
   📅 年月選択を適用
===================================================== */

function applyHealthCalendarDatePicker() {

    const yearSelect =
        document.getElementById(
            "healthCalendarYearSelect"
        );

    const monthSelect =
        document.getElementById(
            "healthCalendarMonthSelect"
        );


    if (
        !yearSelect ||
        !monthSelect
    ) {
        return;
    }


    const year =
        Number(yearSelect.value);

    const month =
        Number(monthSelect.value);


    healthCalendarDate =
        new Date(
            year,
            month,
            1
        );


    healthSelectedDate = null;


    closeHealthCalendarDatePicker();

    updateHealthCalendarTitle();

    renderHealthCalendar();

}


/* =====================================================
   💊 健康データ取得
===================================================== */

function getHealthCalendarData() {

    /*
     * まだ健康記録機能は実装していないため、
     * 現段階では空データを返す。
     *
     * 後で data.healthCalendar を接続する。
     */

    try {

        const raw =
            localStorage.getItem(
                "oshi_app_data"
            );


        if (!raw) {

            return {
                records: {}
            };

        }


        const data =
            JSON.parse(raw);


        if (
            !data.healthCalendar
        ) {

            return {
                records: {}
            };

        }


        return data.healthCalendar;

    } catch (error) {

        console.error(
            "健康データ取得エラー:",
            error
        );


        return {
            records: {}
        };

    }

}


/* =====================================================
   📅 健康カレンダー描画
===================================================== */

function renderHealthCalendar() {

    const calendar =
        document.getElementById(
            "healthCalendar"
        );


    if (!calendar) {
        return;
    }


    const year =
        healthCalendarDate.getFullYear();

    const month =
        healthCalendarDate.getMonth();


    /*
     * その月の1日
     */

    const firstDay =
        new Date(
            year,
            month,
            1
        );


    /*
     * その月の最終日
     */

    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );


    /*
     * 月初の曜日
     * 日曜 = 0
     */

    const startWeekday =
        firstDay.getDay();


    const daysInMonth =
        lastDay.getDate();


    const healthData =
        getHealthCalendarData();


    let html = "";


    /* =================================================
       曜日
    ================================================= */

    html += `

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

    `;


    /* =================================================
       日付
    ================================================= */

    html += `
        <div class="health-day-grid">
    `;


    /*
     * 月初までの空白
     */

    for (
        let i = 0;
        i < startWeekday;
        i++
    ) {

        html += `
            <div class="health-empty-day"></div>
        `;

    }


    /*
     * 日付生成
     */

    const today =
        new Date();

    const todayString =
        formatHealthDate(today);


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateString =
            formatHealthDate(date);


        const weekday =
            date.getDay();


        let classes =
            "health-day";


        if (weekday === 0) {

            classes +=
                " sunday";

        }


        if (weekday === 6) {

            classes +=
                " saturday";

        }


        if (
            dateString === todayString
        ) {

            classes +=
                " today";

        }


        if (
            healthSelectedDate ===
            dateString
        ) {

            classes +=
                " selected";

        }


        const record =
            healthData.records?.[
                dateString
            ];


        let recordHTML = "";


        /*
         * 健康記録が存在する場合
         */

        if (record) {

            recordHTML = `
                <div class="health-day-records">
                    <span class="health-record-icon">
                        💊
                    </span>
                </div>
            `;

        }


        html += `

            <div
                class="${classes}"
                data-date="${dateString}"
                onclick="selectHealthCalendarDate('${dateString}')"
            >

                <div class="health-day-number">
                    ${day}
                </div>

                ${recordHTML}

            </div>

        `;

    }


    html += `
        </div>
    `;


    calendar.innerHTML =
        html;


    /*
     * 祝日取得
     */

    loadHealthHolidays(
        year
    );

}


/* =====================================================
   📅 日付選択
===================================================== */

function selectHealthCalendarDate(
    dateString
) {

    healthSelectedDate =
        dateString;


    renderHealthCalendar();

}


/* =====================================================
   📅 日付 → YYYY-MM-DD
===================================================== */

function formatHealthDate(
    date
) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* =====================================================
   🎌 祝日
===================================================== */

function loadHealthHolidays(
    year
) {

    /*
     * 既存 holiday.js の
     * loadHolidays() を利用する。
     *
     * ただし、健康側の表示処理は
     * health専用で行う。
     */

    if (
        typeof loadHolidays !==
        "function"
    ) {

        return;

    }


    /*
     * 日本の祝日
     */

    loadHolidays(
        year,
        "JP"
    )

        .then(holidays => {

            if (
                !Array.isArray(
                    holidays
                )
            ) {
                return;
            }


            holidays.forEach(
                holiday => {

                    const dateString =
                        holiday.date;


                    const day =
                        document.querySelector(
                            `.health-day[data-date="${dateString}"]`
                        );


                    if (!day) {
                        return;
                    }


                    day.classList.add(
                        "holiday"
                    );


                    const name =
                        document.createElement(
                            "div"
                        );


                    name.className =
                        "health-holiday-name";


                    name.textContent =
                        holiday.localName ||
                        holiday.name ||
                        "祝日";


                    day.appendChild(
                        name
                    );

                }
            );

        })

        .catch(error => {

            console.error(
                "健康カレンダー祝日取得エラー:",
                error
            );

        });

}