/* =====================================================
   💊 健康管理
   calendar-health.js

   ・健康カレンダー
   ・📖 日めくり
   ・📊 グラフ
   ・服薬記録
   ・服薬記録時刻
   ・服薬記録削除
   ・健康データ保存
===================================================== */


/* =====================================================
   状態
===================================================== */

let healthCalendarDate = new Date();

let healthSelectedDate = null;

let healthCalendarHolidays = {};

let healthDailyDate = null;

let healthMedicationDeleteTarget = null;


/* =====================================================
   📊 健康グラフ
===================================================== */
/*
 * グラフ状態
 */

let healthGraphPeriod = 7;

let healthGraphMetric = "temperature";


/*
 * 祝日読み込み状態
 */

let healthHolidayLoadedYear = null;

let healthHolidayLoadingYear = null;


/* =====================================================
   💊 健康カレンダーを開く
===================================================== */

async function openHealthCalendar() {

    const container =
        document.getElementById(
            "calendarContainer"
        );


    if (!container) {

        console.error(
            "calendarContainer がありません"
        );

        return;

    }


    try {

        const response =
            await fetch(
                "./calendar-health.html"
            );


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


    healthDailyDate =
        healthSelectedDate;


    healthCalendarHolidays = {};

    healthHolidayLoadedYear = null;

    healthHolidayLoadingYear = null;


    /*
     * グラフ初期状態
     */

    healthGraphPeriod = 7;

    healthGraphMetric =
        "temperature";


    updateHealthCalendarTitle();

    initializeHealthCalendarDatePicker();

    renderHealthCalendar();
    
    initializeHealthCalendarSwipe();

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
   📅 今日
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
   📅 年月選択
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
        healthCalendarDate.getFullYear();


    monthSelect.value =
        healthCalendarDate.getMonth();

}



/* =====================================================
   📅 年月選択を開く
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
   📅 年月選択を閉じる
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
   📅 年月を適用
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


    healthSelectedDate = null;


    /*
     * 年が変わった場合は
     * 新しい年の祝日を取得
     */

    if (
        healthHolidayLoadedYear !== year
    ) {

        healthCalendarHolidays = {};

    }


    updateHealthCalendarTitle();

    renderHealthCalendar();

    closeHealthCalendarDatePicker();

}



/* =====================================================
   💾 健康データ取得
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


    /*
     * 💊 服薬
     */

    if (record.medications) {

        if (
            record.medications.morning ||
            record.medications.noon ||
            record.medications.night
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
     * 🩺 血圧
     * または脈拍
     */

    if (
        record.bloodPressure &&
        (
            record.bloodPressure.systolic ||
            record.bloodPressure.diastolic
        )
    ) {

        icons.push("🩺");

    }
    else if (
        record.pulse !== undefined &&
        record.pulse !== null &&
        record.pulse !== ""
    ) {

        icons.push("🩺");

    }


    /*
     * 🌸 生理
     */

    if (record.menstrual) {

        icons.push("🌸");

    }


    return icons;

}



/* =====================================================
   📅 カレンダー描画
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


    /* =================================================
       日付
    ================================================= */

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
            getHealthRecordIcons(
                record
            );


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


    /*
     * 必要な年だけ祝日を取得
     */

    if (
        healthHolidayLoadedYear !== year &&
        healthHolidayLoadingYear !== year
    ) {

        loadHealthHolidays(year);

    }

}



/* =====================================================
   📖 日付選択
===================================================== */

function selectHealthCalendarDate(
    dateString
) {

    healthSelectedDate =
        dateString;


    healthDailyDate =
        dateString;


    openHealthDailyView();

}



/* =====================================================
   📖 日めくりを開く
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


    const graphPage =
        document.getElementById(
            "healthGraphPage"
        );


    if (!calendarPage || !dailyPage) {
        return;
    }


    if (graphPage) {

        graphPage.style.display =
            "none";

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
   📖 日めくり読み込み
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
   💊 服薬ボタン
===================================================== */

function toggleHealthMedication(type) {

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


    if (!record.medications) {

        record.medications = {};

    }


    /*
     * すでに服用済みなら
     * 削除確認へ
     */

    if (record.medications[type]) {

        openHealthMedicationDeleteModal(
            type
        );

        return;

    }


    /*
     * 新規服用記録
     */

    const takenAt =
        new Date();


    record.medications[type] = {

        takenAt:
            takenAt.toISOString()

    };


    saveHealthCalendarData(
        data
    );


    updateHealthMedicationButtons(
        record.medications
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

                button.classList.add(
                    "taken"
                );


                const time =
                    medication.takenAt
                        ? formatHealthTakenTime(
                            medication.takenAt
                        )
                        : "";


                button.textContent =
                    time
                        ? `✓ 服用済み ${time}`
                        : "✓ 服用済み";


                if (time) {

                    button.title =
                        `服用時刻 ${time}`;

                }
                else {

                    button.title =
                        "";

                }

            }
            else {

                button.classList.remove(
                    "taken"
                );


                button.textContent =
                    "服用した";


                button.title =
                    "";

            }

        });

}



/* =====================================================
   💊 削除確認を開く
===================================================== */

function openHealthMedicationDeleteModal(
    type
) {

    healthMedicationDeleteTarget =
        type;


    const modal =
        document.getElementById(
            "healthMedicationDeleteModal"
        );


    const message =
        document.getElementById(
            "healthMedicationDeleteMessage"
        );


    if (!modal) {
        return;
    }


    const names = {

        morning: "🌅 朝",

        noon: "☀️ 昼",

        night: "🌙 夜"

    };


    const data =
        getHealthCalendarData();


    const medication =
        data.records?.[
            healthDailyDate
        ]?.medications?.[type];


    const time =
        medication?.takenAt
            ? formatHealthTakenTime(
                medication.takenAt
            )
            : "";


    if (message) {

        message.textContent =
            time
                ? `${names[type] || ""} の服用記録を削除しますか？\n服用時刻：${time}`
                : `${names[type] || ""} の服用記録を削除しますか？`;

    }


    modal.style.display =
        "block";

}



/* =====================================================
   💊 削除確認を閉じる
===================================================== */

function closeHealthMedicationDeleteModal() {

    const modal =
        document.getElementById(
            "healthMedicationDeleteModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    healthMedicationDeleteTarget =
        null;

}



/* =====================================================
   💊 服薬記録削除
===================================================== */

function confirmDeleteHealthMedication() {

    if (!healthMedicationDeleteTarget) {

        closeHealthMedicationDeleteModal();

        return;

    }


    const data =
        getHealthCalendarData();


    const record =
        data.records?.[
            healthDailyDate
        ];


    if (
        record &&
        record.medications
    ) {

        delete record.medications[
            healthMedicationDeleteTarget
        ];


        if (
            Object.keys(
                record.medications
            ).length === 0
        ) {

            delete record.medications;

        }


        saveHealthCalendarData(
            data
        );

    }


    updateHealthMedicationButtons(
        record?.medications
    );


    closeHealthMedicationDeleteModal();

}



/* =====================================================
   💊 服用時刻表示
===================================================== */

function formatHealthTakenTime(
    value
) {

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
        `${String(
            date.getHours()
        ).padStart(2, "0")}:` +

        `${String(
            date.getMinutes()
        ).padStart(2, "0")}`
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


    saveHealthCalendarData(
        data
    );


    updateHealthMenstrualButton(
        data.records[
            healthDailyDate
        ].menstrual
    );

}



/* =====================================================
   🌸 生理ボタン
===================================================== */

function updateHealthMenstrualButton(
    active
) {

    const button =
        document.getElementById(
            "healthMenstrualButton"
        );


    if (!button) {
        return;
    }


    if (active) {

        button.classList.add(
            "active"
        );


        button.textContent =
            "✓ 記録済み";

    }
    else {

        button.classList.remove(
            "active"
        );


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


/* =====================================================
   数値入力
   ・入力されている場合だけ保存
   ・空欄は保存しない
   ・placeholder はデータにならない
===================================================== */

if (temperature?.value !== "") {
    record.temperature =
        Number(temperature.value);
} else {
    delete record.temperature;
}


/* =====================================================
   🩺 血圧
   ・収縮期、拡張期を個別に保存
   ・両方空欄なら bloodPressure 自体を削除
===================================================== */

const hasSystolic =
    systolic?.value !== "";

const hasDiastolic =
    diastolic?.value !== "";

if (hasSystolic || hasDiastolic) {

    record.bloodPressure = {};

    if (hasSystolic) {
        record.bloodPressure.systolic =
            Number(systolic.value);
    }

    if (hasDiastolic) {
        record.bloodPressure.diastolic =
            Number(diastolic.value);
    }

} else {

    delete record.bloodPressure;

}


/* =====================================================
   💓 脈拍
===================================================== */

if (pulse?.value !== "") {
    record.pulse =
        Number(pulse.value);
} else {
    delete record.pulse;
}


/* =====================================================
   😊 体調
===================================================== */

if (condition?.value !== "") {
    record.condition =
        condition.value;
} else {
    delete record.condition;
}


/* =====================================================
   😴 睡眠
===================================================== */

if (sleep?.value !== "") {
    record.sleep =
        Number(sleep.value);
} else {
    delete record.sleep;
}


/* =====================================================
   💧 水分
===================================================== */

if (water?.value !== "") {
    record.water =
        Number(water.value);
} else {
    delete record.water;
}


/* =====================================================
   ⚖️ 体重
===================================================== */

if (weight?.value !== "") {
    record.weight =
        Number(weight.value);
} else {
    delete record.weight;
}


/* =====================================================
   📝 メモ
===================================================== */

if (memo?.value !== "") {
    record.memo =
        memo.value;
} else {
    delete record.memo;
}



    saveHealthCalendarData(
        data
    );


    alert(
        "健康記録を保存しました"
    );

}



/* =====================================================
   📊 グラフ
===================================================== */


/*
 * グラフ画面を開く
 */

function openHealthGraph() {

    const calendarPage =
        document.getElementById(
            "healthCalendarPage"
        );


    const dailyPage =
        document.getElementById(
            "healthDailyPage"
        );


    const graphPage =
        document.getElementById(
            "healthGraphPage"
        );


    if (!graphPage) {

        console.error(
            "healthGraphPage がありません"
        );

        return;

    }


    if (calendarPage) {

        calendarPage.style.display =
            "none";

    }


    if (dailyPage) {

        dailyPage.style.display =
            "none";

    }


    graphPage.style.display =
        "block";


    /*
     * 📅 期間ボタン
     */

    document
        .querySelectorAll(
            ".health-graph-period-button"
        )
        .forEach(button => {

            button.onclick = () => {

                setHealthGraphPeriod(
                    button.dataset.period
                );

            };

        });


    /*
     * 📊 表示項目ボタン
     */

    document
        .querySelectorAll(
            ".health-graph-metric-button"
        )
        .forEach(button => {

            button.onclick = () => {

                setHealthGraphMetric(
                    button.dataset.metric
                );

            };

        });


    updateHealthGraphControls();

    renderHealthGraph();
}



/*
 * グラフ画面を閉じる
 */

function closeHealthGraph() {

    const graphPage =
        document.getElementById(
            "healthGraphPage"
        );


    const calendarPage =
        document.getElementById(
            "healthCalendarPage"
        );


    if (graphPage) {

        graphPage.style.display =
            "none";

    }


    if (calendarPage) {

        calendarPage.style.display =
            "block";

    }


    renderHealthCalendar();

}



/*
 * 期間変更
 */

function setHealthGraphPeriod(
    days
) {

    const value =
        Number(days);


    if (
        value !== 7 &&
        value !== 30 &&
        value !== 90
    ) {

        return;

    }


    healthGraphPeriod =
        value;


    updateHealthGraphControls();

    renderHealthGraph();

}



/*
 * 項目変更
 */

function setHealthGraphMetric(
    metric
) {

    const allowed = [

        "temperature",

        "bloodPressure",

        "pulse",

        "weight",

        "sleep",

        "water"

    ];


    if (
        !allowed.includes(metric)
    ) {

        return;

    }


    healthGraphMetric =
        metric;


    updateHealthGraphControls();

    renderHealthGraph();

}



/*
 * ボタン状態更新
 */

function updateHealthGraphControls() {

    document
        .querySelectorAll(
            ".health-graph-period-button"
        )
        .forEach(button => {

            const period =
                Number(
                    button.dataset.period
                );


            button.classList.toggle(
                "active",
                period === healthGraphPeriod
            );

        });


    document
        .querySelectorAll(
            ".health-graph-metric-button"
        )
        .forEach(button => {

            const metric =
                button.dataset.metric;


            button.classList.toggle(
                "active",
                metric === healthGraphMetric
            );

        });

}



/*
 * グラフタイトル
 */

function getHealthGraphMetricInfo(
    metric
) {

    const info = {

        temperature: {

            title: "🌡️ 体温",

            unit: "℃",

            decimals: 1

        },


        bloodPressure: {

            title: "🩺 血圧",

            unit: "mmHg",

            decimals: 0

        },


        pulse: {

            title: "❤️ 脈拍",

            unit: "bpm",

            decimals: 0

        },


        weight: {

            title: "⚖️ 体重",

            unit: "kg",

            decimals: 1

        },


        sleep: {

            title: "😴 睡眠",

            unit: "時間",

            decimals: 1

        },


        water: {

            title: "💧 水分",

            unit: "ml",

            decimals: 0

        }

    };


    return (
        info[metric] ||
        info.temperature
    );

}



/*
 * グラフ用の日付一覧
 */

function getHealthGraphDates() {

    /*
     * 📊 グラフの基準日
     *
     * ・カレンダーで日付を選択している場合
     *   → その日を基準にする
     *
     * ・まだ日付を選択していない場合
     *   → 今日を基準にする
     */
    const endDate =
        healthSelectedDate
            ? createHealthDate(healthSelectedDate)
            : new Date();

    const dates = [];

    /*
     * 基準日を含めて、
     * 選択した期間の日数分だけ過去へ遡る
     *
     * 7日  → 基準日を含む7日間
     * 30日 → 基準日を含む30日間
     * 90日 → 基準日を含む90日間
     */
    for (
        let i = healthGraphPeriod - 1;
        i >= 0;
        i--
    ) {

        const date = new Date(endDate);

        date.setDate(
            date.getDate() - i
        );

        dates.push(
            formatHealthDate(date)
        );
    }

    return dates;
}


/*
 * 数値変換
 */

function healthGraphNumber(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return null;

    }


    return number;

}



/*
 * グラフデータ取得
 */

function getHealthGraphSeries() {

    const data =
        getHealthCalendarData();


    const dates =
        getHealthGraphDates();


    const series = {

        dates,

        values: []

    };


    dates.forEach(dateString => {

        const record =
            data.records?.[dateString];


        if (!record) {

            series.values.push(
                null
            );

            return;

        }


        let value = null;


        switch (
            healthGraphMetric
        ) {

            case "temperature":

                value =
                    healthGraphNumber(
                        record.temperature
                    );

                break;


            case "bloodPressure":

                value = {

                    systolic:
                        healthGraphNumber(
                            record.bloodPressure?.systolic
                        ),

                    diastolic:
                        healthGraphNumber(
                            record.bloodPressure?.diastolic
                        )

                };


                if (
                    value.systolic === null &&
                    value.diastolic === null
                ) {

                    value = null;

                }

                break;


            case "pulse":

                value =
                    healthGraphNumber(
                        record.pulse
                    );

                break;


            case "weight":

                value =
                    healthGraphNumber(
                        record.weight
                    );

                break;


            case "sleep":

                value =
                    healthGraphNumber(
                        record.sleep
                    );

                break;


            case "water":

                value =
                    healthGraphNumber(
                        record.water
                    );

                break;

        }


        series.values.push(
            value
        );

    });


    return series;

}



/*
 * SVG要素作成
 */

function createHealthSVGElement(
    name,
    attributes = {}
) {

    const SVG_NS =
        "http://www.w3.org/2000/svg";


    const element =
        document.createElementNS(
            SVG_NS,
            name
        );


    Object.entries(
        attributes
    ).forEach(
        ([key, value]) => {

            element.setAttribute(
                key,
                String(value)
            );

        }
    );


    return element;

}



/*
 * SVGテキスト
 */

function createHealthSVGText(
    text,
    x,
    y,
    className
) {

    const element =
        createHealthSVGElement(
            "text",
            {
                x,
                y
            }
        );


    if (className) {

        element.setAttribute(
            "class",
            className
        );

    }


    element.textContent =
        text;


    return element;

}



/*
 * グラフ描画
 */

function renderHealthGraph() {

    const chart =
        document.getElementById(
            "healthGraphChart"
        );


    const noData =
        document.getElementById(
            "healthGraphNoData"
        );


    const title =
        document.getElementById(
            "healthGraphTitle"
        );


    if (!chart) {
        return;
    }


    const info =
        getHealthGraphMetricInfo(
            healthGraphMetric
        );


    if (title) {

        title.textContent =
            info.title;

    }


    chart.innerHTML = "";


    if (noData) {

        noData.style.display =
            "none";

    }


    const series =
        getHealthGraphSeries();


    /*
     * データの存在確認
     */

    let hasData = false;


    series.values.forEach(value => {

        if (
            healthGraphMetric ===
            "bloodPressure"
        ) {

            if (
                value &&
                (
                    value.systolic !== null ||
                    value.diastolic !== null
                )
            ) {

                hasData = true;

            }

        }
        else if (
            value !== null
        ) {

            hasData = true;

        }

    });


    if (!hasData) {

        if (noData) {

            noData.style.display =
                "block";

        }

        return;

    }


    /*
     * グラフサイズ
     */

    const width =
        Math.max(
            320,
            chart.clientWidth || 700
        );


    const height =
        390;


    const padding = {

        top: 30,

        right: 20,

        bottom: 65,

        left: 58

    };


    const graphWidth =
        width -
        padding.left -
        padding.right;


    const graphHeight =
        height -
        padding.top -
        padding.bottom;


    /*
     * SVG
     */

    const svg =
        createHealthSVGElement(
            "svg",
            {
                viewBox:
                    `0 0 ${width} ${height}`,

                width:
                    "100%",

                height:
                    height,

                role:
                    "img",

                "aria-label":
                    info.title

            }
        );


    /*
     * 数値を集める
     */

    const numericValues = [];


    series.values.forEach(value => {

        if (
            healthGraphMetric ===
            "bloodPressure"
        ) {

            if (
                value?.systolic !== null &&
                value?.systolic !== undefined
            ) {

                numericValues.push(
                    value.systolic
                );

            }


            if (
                value?.diastolic !== null &&
                value?.diastolic !== undefined
            ) {

                numericValues.push(
                    value.diastolic
                );

            }

        }
        else if (
            value !== null
        ) {

            numericValues.push(
                value
            );

        }

    });


    let minValue =
        Math.min(
            ...numericValues
        );


    let maxValue =
        Math.max(
            ...numericValues
        );


    /*
     * 少し余白をつける
     */

    if (
        minValue === maxValue
    ) {

        minValue -= 1;

        maxValue += 1;

    }
    else {

        const range =
            maxValue - minValue;


        minValue -=
            range * 0.1;


        maxValue +=
            range * 0.1;

    }


    /*
     * グリッド5本
     */

    const gridCount = 5;


    for (
        let i = 0;
        i <= gridCount;
        i++
    ) {

        const ratio =
            i / gridCount;


        const y =
            padding.top +
            graphHeight * ratio;


        const line =
            createHealthSVGElement(
                "line",
                {

                    x1:
                        padding.left,

                    y1:
                        y,

                    x2:
                        padding.left +
                        graphWidth,

                    y2:
                        y,

                    class:
                        "health-graph-grid-line"

                }
            );


        svg.appendChild(
            line
        );


        const value =
            maxValue -
            (
                maxValue -
                minValue
            ) *
            ratio;


        const label =
            createHealthSVGText(
                formatHealthGraphValue(
                    value,
                    info.decimals
                ),
                padding.left - 10,
                y + 5,
                "health-graph-axis-label"
            );


        label.setAttribute(
            "text-anchor",
            "end"
        );


        svg.appendChild(
            label
        );

    }


    /*
     * X軸日付
     */

    const dateCount =
        series.dates.length;


    const xStep =
        dateCount > 1
            ? graphWidth /
              (dateCount - 1)
            : 0;


    const labelStep =
        healthGraphPeriod === 7
            ? 1
            : healthGraphPeriod === 30
                ? 5
                : 15;


    series.dates.forEach(
        (dateString, index) => {

            if (
                index % labelStep !== 0 &&
                index !== dateCount - 1
            ) {

                return;

            }


            const x =
                padding.left +
                xStep * index;


            const date =
                createHealthDate(
                    dateString
                );


            const label =
                createHealthSVGText(
                    `${date.getMonth() + 1}/${date.getDate()}`,
                    x,
                    height - 25,
                    "health-graph-date-label"
                );


            label.setAttribute(
                "text-anchor",
                "middle"
            );


            svg.appendChild(
                label
            );

        }
    );


    /*
     * 線を作る
     */

    if (
        healthGraphMetric ===
        "bloodPressure"
    ) {

        renderHealthGraphLine(
            svg,
            series,
            "systolic",
            minValue,
            maxValue,
            padding,
            graphWidth,
            graphHeight,
            xStep
        );


        renderHealthGraphLine(
            svg,
            series,
            "diastolic",
            minValue,
            maxValue,
            padding,
            graphWidth,
            graphHeight,
            xStep
        );

    }
    else {

        renderHealthGraphLine(
            svg,
            series,
            "value",
            minValue,
            maxValue,
            padding,
            graphWidth,
            graphHeight,
            xStep
        );

    }


    /*
     * 単位
     */

    const unit =
        createHealthSVGText(
            info.unit,
            padding.left,
            18,
            "health-graph-unit-label"
        );


    svg.appendChild(
        unit
    );


    chart.appendChild(
        svg
    );


    /*
     * 血圧凡例
     */

    if (
        healthGraphMetric ===
        "bloodPressure"
    ) {

        const legend =
            document.createElement(
                "div"
            );


        legend.className =
            "health-graph-legend";


        legend.innerHTML = `
            <span class="health-graph-legend-item">
                <span class="health-graph-legend-line systolic"></span>
                最高血圧
            </span>

            <span class="health-graph-legend-item">
                <span class="health-graph-legend-line diastolic"></span>
                最低血圧
            </span>
        `;


        chart.appendChild(
            legend
        );

    }


        /* グラフ描画が全部終わった後 */

    initializeHealthGraphSelection();


}



/*
 * グラフ線描画
 */

function renderHealthGraphLine(
    svg,
    series,
    type,
    minValue,
    maxValue,
    padding,
    graphWidth,
    graphHeight,
    xStep
) {

    const points = [];


    series.values.forEach(
        (value, index) => {

            let numericValue =
                null;


            if (
                type === "systolic"
            ) {

                numericValue =
                    value?.systolic ??
                    null;

            }
            else if (
                type === "diastolic"
            ) {

                numericValue =
                    value?.diastolic ??
                    null;

            }
            else {

                numericValue =
                    value;

            }


            if (
                numericValue === null ||
                numericValue === undefined
            ) {

                points.push(null);

                return;

            }


            const x =
                padding.left +
                xStep * index;


            const ratio =
                (
                    maxValue -
                    numericValue
                ) /
                (
                    maxValue -
                    minValue
                );


            const y =
                padding.top +
                graphHeight * ratio;


            points.push({

                x,

                y

            });

        }
    );


    /*
     * 欠測部分で線を切る
     */

    let currentPath = "";


    const paths = [];


    points.forEach(point => {

        if (!point) {

            if (currentPath) {

                paths.push(
                    currentPath
                );

                currentPath = "";

            }

            return;

        }


        if (!currentPath) {

            currentPath =
                `M ${point.x} ${point.y}`;

        }
        else {

            currentPath +=
                ` L ${point.x} ${point.y}`;

        }

    });


    if (currentPath) {

        paths.push(
            currentPath
        );

    }


    paths.forEach(pathData => {

        const path =
            createHealthSVGElement(
                "path",
                {

                    d:
                        pathData,

                    fill:
                        "none",

                    class:
                        `health-graph-line ${type}`

                }
            );


        svg.appendChild(
            path
        );

    });


    /*
     * 記録点
     */

    points.forEach(point => {

        if (!point) {
            return;
        }


        const circle =
            createHealthSVGElement(
                "circle",
                {

                    cx:
                        point.x,

                    cy:
                        point.y,

                    r:
                        4,

                    class:
                        `health-graph-point ${type}`

                }
            );


        svg.appendChild(
            circle
        );

    });

}




/* =====================================================
   📊 健康グラフ 選択表示
===================================================== */

let healthGraphSelectedIndex = null;
let healthGraphDragging = false;


/* =====================================================
   選択表示をセット
===================================================== */

function initializeHealthGraphSelection() {

    const chart =
        document.getElementById(
            "healthGraphChart"
        );

    if (!chart) return;


    /*
     * 既存の選択用要素を削除
     */

    const svg =
        chart.querySelector("svg");

    if (!svg) return;


    svg
        .querySelectorAll(
            ".health-graph-selection-group"
        )
        .forEach(element => {

            element.remove();

        });


    /*
     * 現在のグラフの日付
     */

    const dates =
        getHealthGraphDates();

    if (!dates.length) return;


    /*
     * viewBox
     */

    const viewBox =
        svg.viewBox.baseVal;

    const width =
        viewBox.width;

    const height =
        viewBox.height;


    /*
     * 現在のグラフと同じ余白
     */

    const padding = {

        top: 30,

        right: 20,

        bottom: 65,

        left: 58

    };


    const chartWidth =
        width -
        padding.left -
        padding.right;


    const chartHeight =
        height -
        padding.top -
        padding.bottom;


    /*
     * 選択表示用グループ
     */

    const group =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );


    group.setAttribute(
        "class",
        "health-graph-selection-group"
    );


    group.style.display =
        "block";


    /*
     * 縦線
     */

    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );


    line.setAttribute(
        "class",
        "health-graph-selection-line"
    );


    /*
     * 日付・数値の下から
     * 縦線を開始する
     */

    line.setAttribute(
        "y1",
        58
    );


    line.setAttribute(
        "y2",
        padding.top + chartHeight
    );


    line.style.display =
        "none";


    group.appendChild(
        line
    );


    /*
     * 日付表示
     */

    const dateText =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    dateText.setAttribute(
        "class",
        "health-graph-selection-label"
    );


    dateText.setAttribute(
        "text-anchor",
        "middle"
    );


    dateText.style.display =
        "none";


    group.appendChild(
        dateText
    );


    /*
     * 数値表示
     */

    const valueText =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    valueText.setAttribute(
        "class",
        "health-graph-selection-value"
    );


    valueText.setAttribute(
        "text-anchor",
        "middle"
    );


    valueText.style.display =
        "none";


    group.appendChild(
        valueText
    );


    /*
     * グラフ上のタッチ・クリック判定
     */

    const hitArea =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );


    hitArea.setAttribute(
        "class",
        "health-graph-selection-hit-area"
    );


    hitArea.setAttribute(
        "x",
        padding.left
    );


    hitArea.setAttribute(
        "y",
        padding.top
    );


    hitArea.setAttribute(
        "width",
        chartWidth
    );


    hitArea.setAttribute(
        "height",
        chartHeight
    );


    hitArea.setAttribute(
        "fill",
        "rgba(124, 77, 255, 0.001)"
    );


    hitArea.setAttribute(
        "pointer-events",
        "all"
    );


    group.appendChild(
        hitArea
    );


    /*
     * SVGへ追加
     */

    svg.appendChild(
        group
    );


    /*
     * 選択位置を更新
     */

    function updateSelection(
        clientX
    ) {

        const rect =
            svg.getBoundingClientRect();


        if (!rect.width) return;


        /*
         * SVG座標へ変換
         */

        const svgX =
            (
                clientX -
                rect.left
            )
            *
            (
                width /
                rect.width
            );


        let relativeX =
            svgX -
            padding.left;


        /*
         * グラフ範囲内に制限
         */

        relativeX =
            Math.max(
                0,
                Math.min(
                    chartWidth,
                    relativeX
                )
            );


        /*
         * 日付間隔
         */

        const step =
            dates.length > 1
                ? chartWidth /
                  (dates.length - 1)
                : 0;


        let index = 0;


        if (step > 0) {

            index =
                Math.round(
                    relativeX /
                    step
                );

        }


        index =
            Math.max(
                0,
                Math.min(
                    dates.length - 1,
                    index
                )
            );


        healthGraphSelectedIndex =
            index;


        /*
         * 選択X座標
         */

        const x =
            padding.left +
            (
                dates.length > 1
                    ? index * step
                    : chartWidth / 2
            );


        /*
         * 縦線
         */

        line.setAttribute(
            "x1",
            x
        );


        line.setAttribute(
            "x2",
            x
        );


        line.style.display =
            "block";


        line.style.visibility =
            "visible";


        /*
         * 日付
         */

        const date =
            dates[index];


        dateText.textContent =
            formatHealthGraphDisplayDate(
                date
            );


        /*
         * 左右端では
         * 日付・数値だけ中央寄りにする
         */

        const textX =
            Math.max(
                padding.left + 50,
                Math.min(
                    padding.left + chartWidth - 50,
                    x
                )
            );


        dateText.setAttribute(
            "x",
            textX
        );


        dateText.setAttribute(
            "y",
            28
        );


        dateText.style.display =
            "block";


        /*
         * 数値
         */

        const record =
            getHealthCalendarData()
                .records?.[date];


        valueText.textContent =
            getHealthGraphDisplayValue(
                record,
                healthGraphMetric
            );


        valueText.setAttribute(
            "x",
            textX
        );


        valueText.setAttribute(
            "y",
            48
        );


        valueText.style.display =
            "block";

    }


    /*
     * タップ・ドラッグ開始
     */

    hitArea.addEventListener(
        "pointerdown",
        event => {

            healthGraphDragging =
                true;


            hitArea.setPointerCapture(
                event.pointerId
            );


            updateSelection(
                event.clientX
            );

        }
    );


    /*
     * ポインター移動
     */

    hitArea.addEventListener(
        "pointermove",
        event => {

            if (
                event.pointerType === "mouse" &&
                !healthGraphDragging
            ) {

                updateSelection(
                    event.clientX
                );

                return;

            }


            if (
                healthGraphDragging
            ) {

                updateSelection(
                    event.clientX
                );

            }

        }
    );


    /*
     * タップ・ドラッグ終了
     */

    hitArea.addEventListener(
        "pointerup",
        event => {

            healthGraphDragging =
                false;


            try {

                hitArea.releasePointerCapture(
                    event.pointerId
                );

            }
            catch (error) {

                // 何もしない

            }

        }
    );


    /*
     * 操作キャンセル
     */

    hitArea.addEventListener(
        "pointercancel",
        event => {

            healthGraphDragging =
                false;


            try {

                hitArea.releasePointerCapture(
                    event.pointerId
                );

            }
            catch (error) {

                // 何もしない

            }

        }
    );


    /*
     * PCではグラフから離れたら
     * 選択表示を消す
     *
     * スマホでは残す
     */

    hitArea.addEventListener(
        "pointerleave",
        event => {

            if (
                event.pointerType === "mouse" &&
                !healthGraphDragging
            ) {

                line.style.display =
                    "none";


                dateText.style.display =
                    "none";


                valueText.style.display =
                    "none";

            }

        }
    );

}


/* =====================================================
   📅 グラフ日付表示
===================================================== */

function formatHealthGraphDisplayDate(date) {

    const parts =
        date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return (
        Number(parts[1]) +
        "/" +
        Number(parts[2])
    );
}


/* =====================================================
   📊 グラフ数値表示
===================================================== */

function getHealthGraphDisplayValue(
    record,
    metric
) {

    if (!record) {
        return "記録なし";
    }

    if (metric === "temperature") {

        return record.temperature != null
            ? `${record.temperature}℃`
            : "記録なし";
    }

    if (metric === "bloodPressure") {

        const systolic =
            record.bloodPressure?.systolic;

        const diastolic =
            record.bloodPressure?.diastolic;

        if (
            systolic == null
            &&
            diastolic == null
        ) {
            return "記録なし";
        }

        if (
            systolic != null
            &&
            diastolic != null
        ) {
            return `${systolic}/${diastolic} mmHg`;
        }

        if (systolic != null) {
            return `上 ${systolic} mmHg`;
        }

        return `下 ${diastolic} mmHg`;
    }

    if (metric === "pulse") {

        return record.pulse != null
            ? `${record.pulse} bpm`
            : "記録なし";
    }

    if (metric === "weight") {

        return record.weight != null
            ? `${record.weight} kg`
            : "記録なし";
    }

    if (metric === "sleep") {

        return record.sleep != null
            ? `${record.sleep} 時間`
            : "記録なし";
    }

    if (metric === "water") {

        return record.water != null
            ? `${record.water} ml`
            : "記録なし";
    }

    return "記録なし";
}




/*
 * グラフ数値表示
 */

function formatHealthGraphValue(
    value,
    decimals
) {

    if (
        !Number.isFinite(value)
    ) {

        return "";

    }


    return Number(
        value
    ).toFixed(
        decimals
    );

}



/* =====================================================
   📅 祝日
===================================================== */

function loadHealthHolidays(
    year
) {

    if (
        typeof loadHolidays !== "function"
    ) {

        return;

    }


    if (
        healthHolidayLoadedYear === year
    ) {

        return;

    }


    if (
        healthHolidayLoadingYear === year
    ) {

        return;

    }


    healthHolidayLoadingYear =
        year;


    loadHolidays(
        year,
        "JP"
    )
    .then(holidays => {

        healthCalendarHolidays = {};


        if (Array.isArray(holidays)) {

            holidays.forEach(
                holiday => {

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

                }
            );

        }


        healthHolidayLoadedYear =
            year;


        healthHolidayLoadingYear =
            null;


        if (
            healthCalendarDate.getFullYear() ===
            year
        ) {

            renderHealthCalendar();

        }

    })
    .catch(error => {

        healthHolidayLoadingYear =
            null;


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

function formatHealthDate(
    date
) {

    const y =
        date.getFullYear();


    const m =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const d =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


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


/* =====================================================
   💊 健康カレンダー 月スワイプ
===================================================== */

function initializeHealthCalendarSwipe() {

    const calendar =
        document.getElementById(
            "healthCalendar"
        );

    if (!calendar) return;


    let startX = 0;
    let startY = 0;


    /*
     * スワイプ開始
     */

    calendar.addEventListener(
        "touchstart",
        event => {

            if (!event.touches.length) return;

            startX =
                event.touches[0].clientX;

            startY =
                event.touches[0].clientY;

        },
        { passive: true }
    );


    /*
     * スワイプ終了
     */

    calendar.addEventListener(
        "touchend",
        event => {

            if (
                !event.changedTouches.length
            ) {
                return;
            }


            const endX =
                event.changedTouches[0].clientX;

            const endY =
                event.changedTouches[0].clientY;


            const diffX =
                endX - startX;

            const diffY =
                endY - startY;


            /*
             * 縦方向の操作なら無視
             */

            if (
                Math.abs(diffX) < 50 ||
                Math.abs(diffX) <= Math.abs(diffY)
            ) {
                return;
            }


            /*
             * 👈 左 → 右
             * 前の月
             */

            if (diffX > 0) {

                healthCalendarDate.setMonth(
                    healthCalendarDate.getMonth() - 1
                );

            }


            /*
             * 👉 右 → 左
             * 次の月
             */

            else {

                healthCalendarDate.setMonth(
                    healthCalendarDate.getMonth() + 1
                );

            }


            /*
             * 月を変更したので
             * 選択日はリセット
             */

            healthSelectedDate = null;


            /*
             * 年月タイトル更新
             */

            updateHealthCalendarTitle();


            /*
             * カレンダー再描画
             */

            renderHealthCalendar();

        },
        { passive: true }
    );

}