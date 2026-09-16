/* =====================================================
   💊 健康管理
   calendar-health.js

   ・健康カレンダー
   ・📖 日めくり
   ・健康データは data.healthCalendar に保存
===================================================== */


/* =====================================================
   状態
===================================================== */

let healthCalendarDate = new Date();

let healthSelectedDate = null;

let healthCalendarHolidays = {};

let healthDailyDate = null;



/* =====================================================
   💊 健康カレンダーを開く
===================================================== */

async function openHealthCalendar() {

    const container =
        document.getElementById("calendarContainer");

    if (!container) {

        console.error(
            "calendarContainer がありません"
        );

        return;

    }


    try {

        const response =
            await fetch("./calendar-health.html");


        if (!response.ok) {

            throw new Error(
                "calendar-health.html の読み込みに失敗しました"
            );

        }


        container.innerHTML =
            await response.text();


        initializeHealthCalendar();


    }
    catch (error) {

        console.error(
            "健康カレンダー読み込みエラー:",
            error
        );

    }

}



/* =====================================================
   初期化
===================================================== */

function initializeHealthCalendar() {

    healthCalendarDate =
        new Date();


    healthSelectedDate =
        formatHealthDate(
            healthCalendarDate
        );


    updateHealthCalendarTitle();

    initializeHealthCalendarDatePicker();

    renderHealthCalendar();

}



/* =====================================================
   年月タイトル
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
   今日
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
   年月選択
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


    for (
        let year = currentYear - 10;
        year <= currentYear + 10;
        year++
    ) {

        const option =
            document.createElement("option");


        option.value =
            year;


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
   年月選択を開く
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


    modal.style.display =
        "block";

}



/* =====================================================
   年月選択を閉じる
===================================================== */

function closeHealthCalendarDatePicker() {

    const modal =
        document.getElementById(
            "healthCalendarDatePickerModal"
        );


    if (!modal) {
        return;
    }


    modal.style.display =
        "none";

}



/* =====================================================
   年月適用
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
   健康データ取得
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
   健康記録アイコン
===================================================== */

function getHealthRecordIcons(record) {

    if (
        !record ||
        typeof record !== "object"
    ) {

        return [];

    }


    const icons = [];


    if (record.medications) {

        if (
            record.medications.morning ||
            record.medications.noon ||
            record.medications.night
        ) {

            icons.push("💊");

        }

    }


    if (
        record.temperature !== undefined &&
        record.temperature !== null &&
        record.temperature !== ""
    ) {

        icons.push("🌡️");

    }


    if (
        record.bloodPressure ||
        record.pulse !== undefined
    ) {

        icons.push("🩺");

    }


    if (record.menstrual) {

        icons.push("🌸");

    }


    return icons;

}



/* =====================================================
   カレンダー描画
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


    /* 曜日 */

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


    html += `
        <div class="health-day-grid">
    `;


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
            healthSelectedDate === dateString
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


        if (icons.length > 0) {

            html += `
                <div class="health-record-icons">
            `;


            icons.forEach(icon => {

                html += `
                    <span class="health-record-icon">
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
   📖 日めくりを開く
===================================================== */

function selectHealthCalendarDate(dateString) {

    healthSelectedDate =
        dateString;


    healthDailyDate =
        dateString;


    openHealthDailyView();

}



/* =====================================================
   📖 日めくり表示
===================================================== */

function openHealthDailyView() {

    const calendarPage =
        document.getElementById(
            "healthCalendarPage"
        );


    const dailyPage =
        document.getElementById(
            "healthDailyPage"
        );


    if (!calendarPage || !dailyPage) {
        return;
    }


    calendarPage.style.display =
        "none";


    dailyPage.style.display =
        "block";


    loadHealthDailyRecord();

}



/* =====================================================
   📖 日めくりを閉じる
===================================================== */

function closeHealthDailyView() {

    const calendarPage =
        document.getElementById(
            "healthCalendarPage"
        );


    const dailyPage =
        document.getElementById(
            "healthDailyPage"
        );


    if (!calendarPage || !dailyPage) {
        return;
    }


    dailyPage.style.display =
        "none";


    calendarPage.style.display =
        "block";


    renderHealthCalendar();

}



/* =====================================================
   📖 日付表示
===================================================== */

function updateHealthDailyDate() {

    const element =
        document.getElementById(
            "healthDailyDate"
        );


    if (!element || !healthDailyDate) {
        return;
    }


    const date =
        createHealthDate(
            healthDailyDate
        );


    const weekNames =
        [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ];


    element.textContent =
        `${date.getFullYear()}年` +
        `${date.getMonth() + 1}月` +
        `${date.getDate()}日` +
        `(${weekNames[date.getDay()]})`;

}



/* =====================================================
   📖 前の日
===================================================== */

function healthDailyPreviousDay() {

    const date =
        createHealthDate(
            healthDailyDate
        );


    date.setDate(
        date.getDate() - 1
    );


    healthDailyDate =
        formatHealthDate(date);


    loadHealthDailyRecord();

}



/* =====================================================
   📖 次の日
===================================================== */

function healthDailyNextDay() {

    const date =
        createHealthDate(
            healthDailyDate
        );


    date.setDate(
        date.getDate() + 1
    );


    healthDailyDate =
        formatHealthDate(date);


    loadHealthDailyRecord();

}



/* =====================================================
   📖 日めくりデータ読み込み
===================================================== */

function loadHealthDailyRecord() {

    updateHealthDailyDate();


    const data =
        getHealthCalendarData();


    const record =
        data.records?.[healthDailyDate] || {};


    const temperature =
        document.getElementById(
            "healthTemperatureInput"
        );


    const systolic =
        document.getElementById(
            "healthSystolicInput"
        );


    const diastolic =
        document.getElementById(
            "healthDiastolicInput"
        );


    const pulse =
        document.getElementById(
            "healthPulseInput"
        );


    const condition =
        document.getElementById(
            "healthConditionInput"
        );


    const sleep =
        document.getElementById(
            "healthSleepInput"
        );


    const water =
        document.getElementById(
            "healthWaterInput"
        );


    const weight =
        document.getElementById(
            "healthWeightInput"
        );


    const memo =
        document.getElementById(
            "healthMemoInput"
        );


    if (temperature) {

        temperature.value =
            record.temperature ?? "";

    }


    if (systolic) {

        systolic.value =
            record.bloodPressure?.systolic ?? "";

    }


    if (diastolic) {

        diastolic.value =
            record.bloodPressure?.diastolic ?? "";

    }


    if (pulse) {

        pulse.value =
            record.pulse ?? "";

    }


    if (condition) {

        condition.value =
            record.condition ?? "";

    }


    if (sleep) {

        sleep.value =
            record.sleep ?? "";

    }


    if (water) {

        water.value =
            record.water ?? "";

    }


    if (weight) {

        weight.value =
            record.weight ?? "";

    }


    if (memo) {

        memo.value =
            record.memo ?? "";

    }


    updateHealthMedicationButtons(
        record.medications
    );


    updateHealthMenstrualButton(
        !!record.menstrual
    );

}



/* =====================================================
   💊 服薬
===================================================== */

function takeHealthMedication(type) {

    const data =
        getHealthCalendarData();


    if (!data.records) {

        data.records = {};

    }


    if (!data.records[healthDailyDate]) {

        data.records[healthDailyDate] = {};

    }


    if (!data.records[healthDailyDate].medications) {

        data.records[healthDailyDate].medications = {};

    }


    /*
     * 服用した時刻を自動保存
     */

    data.records[
        healthDailyDate
    ].medications[type] = {

        takenAt:
            new Date().toISOString()

    };


    saveHealthCalendarData(data);


    updateHealthMedicationButtons(
        data.records[
            healthDailyDate
        ].medications
    );

}



/* =====================================================
   💊 服薬ボタン表示
===================================================== */

function updateHealthMedicationButtons(
    medications
) {

    document
        .querySelectorAll(
            ".health-medication-button"
        )
        .forEach(button => {

            const type =
                button.dataset.medication;


            const medication =
                medications?.[type];


            if (medication) {

                button.classList.add("taken");

                button.textContent =
                    "✓ 服用済み";

                if (medication.takenAt) {

                    button.title =
                        formatHealthTakenTime(
                            medication.takenAt
                        );

                }

            }
            else {

                button.classList.remove("taken");

                button.textContent =
                    "服用した";

                button.title = "";

            }

        });

}



/* =====================================================
   💊 服用時刻
===================================================== */

function formatHealthTakenTime(value) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return (
        `${String(date.getHours()).padStart(2, "0")}:` +
        `${String(date.getMinutes()).padStart(2, "0")}`
    );

}



/* =====================================================
   🌸 生理
===================================================== */

function toggleHealthMenstrual() {

    const data =
        getHealthCalendarData();


    if (!data.records) {

        data.records = {};

    }


    if (!data.records[healthDailyDate]) {

        data.records[healthDailyDate] = {};

    }


    data.records[
        healthDailyDate
    ].menstrual =
        !data.records[
            healthDailyDate
        ].menstrual;


    saveHealthCalendarData(data);


    updateHealthMenstrualButton(
        data.records[
            healthDailyDate
        ].menstrual
    );

}



/* =====================================================
   🌸 生理ボタン表示
===================================================== */

function updateHealthMenstrualButton(active) {

    const button =
        document.getElementById(
            "healthMenstrualButton"
        );


    if (!button) {
        return;
    }


    if (active) {

        button.classList.add("active");

        button.textContent =
            "✓ 記録済み";

    }
    else {

        button.classList.remove("active");

        button.textContent =
            "記録する";

    }

}



/* =====================================================
   ＋ その他
===================================================== */

function toggleHealthOtherFields() {

    const fields =
        document.getElementById(
            "healthOtherFields"
        );


    const button =
        document.getElementById(
            "healthOtherToggleButton"
        );


    if (!fields || !button) {
        return;
    }


    if (
        fields.style.display === "none"
    ) {

        fields.style.display =
            "block";


        button.textContent =
            "− その他を閉じる";

    }
    else {

        fields.style.display =
            "none";


        button.textContent =
            "＋ その他を記録";

    }

}



/* =====================================================
   💾 保存
===================================================== */

function saveHealthDailyRecord() {

    const data =
        getHealthCalendarData();


    if (!data.records) {

        data.records = {};

    }


    if (!data.records[healthDailyDate]) {

        data.records[healthDailyDate] = {};

    }


    const record =
        data.records[
            healthDailyDate
        ];


    const temperature =
        document.getElementById(
            "healthTemperatureInput"
        );


    const systolic =
        document.getElementById(
            "healthSystolicInput"
        );


    const diastolic =
        document.getElementById(
            "healthDiastolicInput"
        );


    const pulse =
        document.getElementById(
            "healthPulseInput"
        );


    const condition =
        document.getElementById(
            "healthConditionInput"
        );


    const sleep =
        document.getElementById(
            "healthSleepInput"
        );


    const water =
        document.getElementById(
            "healthWaterInput"
        );


    const weight =
        document.getElementById(
            "healthWeightInput"
        );


    const memo =
        document.getElementById(
            "healthMemoInput"
        );


    record.temperature =
        temperature?.value || "";


    record.bloodPressure = {

        systolic:
            systolic?.value || "",

        diastolic:
            diastolic?.value || ""

    };


    record.pulse =
        pulse?.value || "";


    record.condition =
        condition?.value || "";


    record.sleep =
        sleep?.value || "";


    record.water =
        water?.value || "";


    record.weight =
        weight?.value || "";


    record.memo =
        memo?.value || "";


    saveHealthCalendarData(
        data
    );


    alert(
        "健康記録を保存しました"
    );

}



/* =====================================================
   💾 健康データ保存
===================================================== */

function saveHealthCalendarData(data) {

    try {

        const raw =
            localStorage.getItem(
                "oshi_app_data"
            );


        const allData =
            raw
                ? JSON.parse(raw)
                : {};


        allData.healthCalendar =
            data;


        localStorage.setItem(
            "oshi_app_data",
            JSON.stringify(allData)
        );

    }
    catch (error) {

        console.error(
            "健康データの保存に失敗しました:",
            error
        );

    }

}



/* =====================================================
   📅 祝日
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
   日付生成
===================================================== */

function createHealthDate(
    dateString
) {

    const parts =
        String(dateString)
            .split("-")
            .map(Number);


    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );

}



/* =====================================================
   日付フォーマット
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
   HTMLエスケープ
===================================================== */

function escapeHealthCalendarHTML(
    value
) {

    return String(value)

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