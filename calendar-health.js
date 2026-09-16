/* =====================================================
   💊 健康カレンダー
   calendar-health.js

   ・通常カレンダーから独立
   ・data.healthCalendar を使用
   ・スポーツカレンダーとは別管理
===================================================== */


/* =====================================================
   💊 状態
===================================================== */

let healthCalendarDate = new Date();

let healthSelectedDate = null;

let healthCalendarHolidays = {};



/* =====================================================
   💊 健康カレンダーを開く
===================================================== */

function openHealthCalendar() {

    const container =
        document.getElementById("calendar");

    if (!container) {
        return;
    }


    /*
     * CSSを確実に読み込む
     */
    ensureHealthCalendarCSS();


    fetch("calendar-health.html")
        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "calendar-health.html の読み込みに失敗しました"
                );

            }

            return response.text();

        })
        .then(html => {

            container.innerHTML = html;

            initializeHealthCalendar();

        })
        .catch(error => {

            console.error(
                "健康カレンダー読み込みエラー:",
                error
            );

            container.innerHTML =
                "<p>健康カレンダーを読み込めませんでした。</p>";

        });

}



/* =====================================================
   💊 CSSを確実に読み込む
===================================================== */

function ensureHealthCalendarCSS() {

    const existing =
        document.querySelector(
            'link[data-health-calendar-css="true"]'
        );

    if (existing) {
        return;
    }


    const link =
        document.createElement("link");

    link.rel = "stylesheet";

    link.href = "calendar-health.css";

    link.dataset.healthCalendarCss = "true";

    document.head.appendChild(link);

}



/* =====================================================
   💊 初期化
===================================================== */

function initializeHealthCalendar() {

    healthCalendarDate = new Date();

    healthSelectedDate =
        formatHealthDate(
            healthCalendarDate
        );


    updateHealthCalendarTitle();

    initializeHealthCalendarDatePicker();

    renderHealthCalendar();

}



/* =====================================================
   💊 年月タイトル
===================================================== */

function updateHealthCalendarTitle() {

    const title =
        document.getElementById(
            "healthCalendarMonthTitle"
        );

    if (!title) {
        return;
    }


    title.textContent =
        `${healthCalendarDate.getFullYear()}年` +
        `${healthCalendarDate.getMonth() + 1}月`;

}



/* =====================================================
   💊 前月
===================================================== */

function healthCalendarPrevMonth() {

    healthCalendarDate =
        new Date(
            healthCalendarDate.getFullYear(),
            healthCalendarDate.getMonth() - 1,
            1
        );


    healthSelectedDate = null;

    updateHealthCalendarTitle();

    renderHealthCalendar();

}



/* =====================================================
   💊 次月
===================================================== */

function healthCalendarNextMonth() {

    healthCalendarDate =
        new Date(
            healthCalendarDate.getFullYear(),
            healthCalendarDate.getMonth() + 1,
            1
        );


    healthSelectedDate = null;

    updateHealthCalendarTitle();

    renderHealthCalendar();

}



/* =====================================================
   💊 今日
===================================================== */

function healthCalendarToday() {

    const today =
        new Date();


    healthCalendarDate =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    healthSelectedDate =
        formatHealthDate(today);


    updateHealthCalendarTitle();

    renderHealthCalendar();

}



/* =====================================================
   💊 年月選択 初期化
===================================================== */

function initializeHealthCalendarDatePicker() {

    const yearSelect =
        document.getElementById(
            "healthCalendarYearSelect"
        );

    const monthSelect =
        document.getElementById(
            "healthCalendarMonthSelect"
        );


    if (!yearSelect || !monthSelect) {
        return;
    }


    const currentYear =
        new Date().getFullYear();


    yearSelect.innerHTML = "";


    /*
     * 現在年の前後10年
     */
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
        healthCalendarDate.getFullYear();


    monthSelect.value =
        healthCalendarDate.getMonth();

}



/* =====================================================
   💊 年月選択を開く
===================================================== */

function openHealthCalendarDatePicker() {

    const modal =
        document.getElementById(
            "healthCalendarDatePickerModal"
        );

    if (!modal) {
        return;
    }


    const yearSelect =
        document.getElementById(
            "healthCalendarYearSelect"
        );

    const monthSelect =
        document.getElementById(
            "healthCalendarMonthSelect"
        );


    if (yearSelect) {

        yearSelect.value =
            healthCalendarDate.getFullYear();

    }


    if (monthSelect) {

        monthSelect.value =
            healthCalendarDate.getMonth();

    }


    modal.style.display = "block";

}



/* =====================================================
   💊 年月選択を閉じる
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
   💊 年月選択を適用
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


    if (!yearSelect || !monthSelect) {
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


    updateHealthCalendarTitle();

    renderHealthCalendar();

    closeHealthCalendarDatePicker();

}



/* =====================================================
   💊 健康データ取得
===================================================== */

function getHealthCalendarData() {

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
            !data.healthCalendar ||
            typeof data.healthCalendar !== "object"
        ) {

            return {
                records: {}
            };

        }


        if (
            !data.healthCalendar.records ||
            typeof data.healthCalendar.records !== "object"
        ) {

            data.healthCalendar.records = {};

        }


        return data.healthCalendar;

    }
    catch (error) {

        console.error(
            "健康データの読み込みに失敗しました:",
            error
        );


        return {
            records: {}
        };

    }

}



/* =====================================================
   💊 健康記録があるか
===================================================== */

function getHealthRecordIcons(record) {

    if (
        !record ||
        typeof record !== "object"
    ) {

        return [];

    }


    const icons = [];


    /*
     * 💊 服薬
     */
    if (record.medications) {

        const medications =
            record.medications;


        if (
            medications.morning ||
            medications.noon ||
            medications.night
        ) {

            icons.push("💊");

        }

    }


    /*
     * 🌡️ 体温
     */
    if (
        record.temperature !== undefined &&
        record.temperature !== null &&
        record.temperature !== ""
    ) {

        icons.push("🌡️");

    }


    /*
     * 🩺 血圧・脈拍
     */
    if (
        record.bloodPressure ||
        record.pulse !== undefined
    ) {

        icons.push("🩺");

    }


    /*
     * 🌸 月経
     */
    if (record.menstrual) {

        icons.push("🌸");

    }


    return icons;

}



/* =====================================================
   💊 カレンダー描画
===================================================== */

function renderHealthCalendar() {

    const container =
        document.getElementById(
            "healthCalendar"
        );

    if (!container) {
        return;
    }


    const year =
        healthCalendarDate.getFullYear();

    const month =
        healthCalendarDate.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const startWeek =
        firstDay.getDay();


    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const data =
        getHealthCalendarData();


    let html = "";


    /* =================================================
       曜日
    ================================================= */

    html += `
        <div class="health-week-grid">

            <div class="health-week-cell sunday">
                日
            </div>

            <div class="health-week-cell">
                月
            </div>

            <div class="health-week-cell">
                火
            </div>

            <div class="health-week-cell">
                水
            </div>

            <div class="health-week-cell">
                木
            </div>

            <div class="health-week-cell">
                金
            </div>

            <div class="health-week-cell saturday">
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
     * 月初の空白
     */
    for (
        let i = 0;
        i < startWeek;
        i++
    ) {

        html += `
            <div class="health-calendar-empty"></div>
        `;

    }


    const today =
        formatHealthDate(
            new Date()
        );


    /*
     * 日付
     */
    for (
        let day = 1;
        day <= lastDate;
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


        const weekDay =
            date.getDay();


        const record =
            data.records?.[dateString];


        const icons =
            getHealthRecordIcons(record);


        let classes =
            "health-calendar-day";


        if (weekDay === 0) {

            classes += " sunday";

        }


        if (weekDay === 6) {

            classes += " saturday";

        }


        if (
            healthCalendarHolidays &&
            healthCalendarHolidays[dateString]
        ) {

            classes += " holiday";

        }


        if (dateString === today) {

            classes += " today";

        }


        if (
            healthSelectedDate &&
            dateString === healthSelectedDate
        ) {

            classes += " selected";

        }


        html += `
            <div
                class="${classes}"
                data-date="${dateString}"
                onclick="selectHealthCalendarDate('${dateString}')"
            >

                <div class="health-calendar-day-number">
                    ${day}
                </div>
        `;


        /*
         * 祝日名
         */
        if (
            healthCalendarHolidays &&
            healthCalendarHolidays[dateString]
        ) {

            html += `
                <div class="health-holiday-name">
                    ${escapeHealthCalendarHTML(
                        healthCalendarHolidays[dateString]
                    )}
                </div>
            `;

        }


        /*
         * 健康記録アイコン
         */
        if (icons.length > 0) {

            html += `
                <div class="health-record-icons">
            `;


            icons.forEach(icon => {

                html += `
                    <span
                        class="health-record-icon"
                    >
                        ${icon}
                    </span>
                `;

            });


            html += `
                </div>
            `;

        }


        html += `
            </div>
        `;

    }


    /*
     * 月末の空白
     */
    const totalCells =
        startWeek + lastDate;


    const remainder =
        totalCells % 7;


    if (remainder !== 0) {

        for (
            let i = remainder;
            i < 7;
            i++
        ) {

            html += `
                <div class="health-calendar-empty"></div>
            `;

        }

    }


    html += `
        </div>
    `;


    container.innerHTML =
        html;


    loadHealthHolidays(year);

}



/* =====================================================
   💊 日付選択
===================================================== */

function selectHealthCalendarDate(dateString) {

    healthSelectedDate =
        dateString;


    renderHealthCalendar();

}



/* =====================================================
   💊 日付フォーマット
===================================================== */

function formatHealthDate(date) {

    const y =
        date.getFullYear();


    const m =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const d =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${y}-${m}-${d}`;

}



/* =====================================================
   💊 祝日取得
===================================================== */

function loadHealthHolidays(year) {

    if (
        typeof loadHolidays !== "function"
    ) {

        return;

    }


    loadHolidays(
        year,
        "JP"
    )
    .then(holidays => {

        healthCalendarHolidays = {};


        if (Array.isArray(holidays)) {

            holidays.forEach(holiday => {

                if (
                    holiday &&
                    holiday.date
                ) {

                    healthCalendarHolidays[
                        holiday.date
                    ] =
                        holiday.localName ||
                        holiday.name ||
                        "";

                }

            });

        }


        renderHealthCalendar();

    })
    .catch(error => {

        console.error(
            "健康カレンダー祝日取得エラー:",
            error
        );

    });

}



/* =====================================================
   💊 HTMLエスケープ
===================================================== */

function escapeHealthCalendarHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}