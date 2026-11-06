
/* =====================================================
   💰 お金ページ
   money.js

   ・家計簿データ読み込み
   ・月別収支集計
   ・推し活費集計
   ・繰越金反映
   ・予算表示
   ・最近の明細表示
   ・金額表示 / 非表示
===================================================== */


/* =====================================================
   共通設定
===================================================== */

let moneyVisibilityHidden = false;

let moneyCurrentPeriod = "month";


/* =====================================================
   日付関連
===================================================== */

function getMoneyToday(){

    const now = new Date();

    return {
        year:now.getFullYear(),
        month:now.getMonth() + 1,
        date:now.getDate()
    };

}


function getMoneyMonthKey(date){

    const d = new Date(date);

    if(isNaN(d.getTime())){
        return "";
    }

    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2,"0")
    );

}


function getMoneyCurrentMonthKey(){

    const today = getMoneyToday();

    return (
        today.year +
        "-" +
        String(today.month).padStart(2,"0")
    );

}


function formatMoneyDate(date){

    if(!date){
        return "";
    }

    const d = new Date(date);

    if(isNaN(d.getTime())){
        return "";
    }

    return (
        d.getFullYear() +
        "/" +
        (d.getMonth() + 1) +
        "/" +
        d.getDate()
    );

}


/* =====================================================
   金額関連
===================================================== */

function formatMoney(value){

    const amount = Number(value) || 0;

    return "¥" + amount.toLocaleString("ja-JP");

}


function displayMoney(value){

    if(moneyVisibilityHidden){
        return "••••••";
    }

    return formatMoney(value);

}


/* =====================================================
   明細の日付取得
===================================================== */

function getMoneyRecordDate(record){

    if(!record){
        return "";
    }

    return (
        record.date ||
        record.recordDate ||
        record.createdAt ||
        ""
    );

}


/* =====================================================
   明細の金額取得
===================================================== */

function getMoneyRecordAmount(record){

    return Math.abs(
        Number(record?.amount) || 0
    );

}


/* =====================================================
   明細の期間判定
===================================================== */

function isMoneyRecordInMonth(record,monthKey){

    const date = getMoneyRecordDate(record);

    if(!date){
        return false;
    }

    return getMoneyMonthKey(date) === monthKey;

}


function isMoneyRecordInYear(record,year){

    const date = getMoneyRecordDate(record);

    if(!date){
        return false;
    }

    const d = new Date(date);

    if(isNaN(d.getTime())){
        return false;
    }

    return d.getFullYear() === year;

}


/* =====================================================
   収入・支出判定
===================================================== */

function isMoneyIncome(record){

    return record?.type === "income";

}


function isMoneyExpense(record){

    return record?.type === "expense";

}


/* =====================================================
   推し活費判定
===================================================== */

function isOshiMoneyRecord(record,data){

    if(!isMoneyExpense(record)){
        return false;
    }

    if(
        record.oshiId !== undefined &&
        record.oshiId !== null &&
        record.oshiId !== ""
    ){
        return true;
    }

    if(
        record.oshiCategoryId !== undefined &&
        record.oshiCategoryId !== null &&
        record.oshiCategoryId !== ""
    ){
        return true;
    }

    const category = (data.money?.categories || [])
        .find(category =>
            category.id === record.categoryId
        );

    return (
        category?.scope === "oshi" ||
        record.scope === "oshi"
    );

}


/* =====================================================
   カテゴリ名取得
===================================================== */

function getMoneyCategoryName(record,data){

    const category = (
        data.money?.categories || []
    ).find(category =>
        category.id === record.categoryId
    );

    return (
        category?.name ||
        record.categoryName ||
        "未分類"
    );

}


/* =====================================================
   今月の明細取得
===================================================== */

function getMoneyMonthRecords(data,monthKey){

    const records = data.money?.records || [];

    return records.filter(record =>
        isMoneyRecordInMonth(record,monthKey)
    );

}


/* =====================================================
   月別集計
===================================================== */

function calculateMoneyMonth(data,monthKey){

    const records =
        getMoneyMonthRecords(data,monthKey);

    let income = 0;
    let expense = 0;
    let oshiExpense = 0;

    records.forEach(record => {

        const amount =
            getMoneyRecordAmount(record);

        if(isMoneyIncome(record)){

            income += amount;

        }

        if(isMoneyExpense(record)){

            expense += amount;

            if(isOshiMoneyRecord(record,data)){

                oshiExpense += amount;

            }

        }

    });


    return {

        income,
        expense,
        oshiExpense,

        balance:
            income - expense,

        records

    };

}


/* =====================================================
   繰越金取得
===================================================== */

function getMoneyCarryover(data,monthKey){

    const carryovers =
        data.money?.carryovers || {};

    const adjustments =
        data.money?.adjustments || {};


    let carryover =
        carryovers[monthKey];


    if(
        carryover &&
        typeof carryover === "object"
    ){

        carryover =
            carryover.amount ?? 0;

    }


    let adjustment =
        adjustments[monthKey];


    if(
        adjustment &&
        typeof adjustment === "object"
    ){

        adjustment =
            adjustment.amount ?? 0;

    }


    return (
        (Number(carryover) || 0) +
        (Number(adjustment) || 0)
    );

}


/* =====================================================
   今月の予算取得
===================================================== */

function getMoneyBudget(data,monthKey){

    const setting =
        data.money?.monthlySettings?.[monthKey];


    if(
        setting === undefined ||
        setting === null
    ){

        return null;

    }


    if(typeof setting === "number"){

        return setting;

    }


    if(typeof setting === "object"){

        const budget =
            setting.budget ??
            setting.monthlyBudget ??
            setting.expenseBudget;

        if(
            budget === undefined ||
            budget === null ||
            budget === ""
        ){

            return null;

        }

        return Number(budget) || 0;

    }


    return null;

}


/* =====================================================
   HTMLへの安全な文字表示
===================================================== */

function setMoneyText(id,value){

    const element =
        document.getElementById(id);

    if(!element){
        return;
    }

    element.textContent = value;

}


/* =====================================================
   お金ページ読み込み
===================================================== */

function loadMoneyPage(){

    console.log(
        "★ お金ページ読み込み"
    );


    const container =
        document.getElementById("moneyContainer");


    if(!container){

        console.error(
            "★ moneyContainer が見つかりません"
        );

        return;

    }


    fetch("money.html")

        .then(response => {

            if(!response.ok){

                throw new Error(
                    "money.html の読み込みに失敗しました"
                );

            }

            return response.text();

        })


        .then(html => {

            container.innerHTML = html;

            moneyCurrentPeriod = "month";

            renderMoneyPage();

        })


        .catch(error => {

            console.error(
                "★ お金ページ読み込みエラー:",
                error
            );


            container.innerHTML = `

                <div class="card">

                    <p>
                        お金ページを
                        読み込めませんでした。
                    </p>

                </div>

            `;

        });

}


/* =====================================================
   💰 お金ページ表示
===================================================== */

function renderMoneyPage(){

    const container =
        document.getElementById("moneyContainer");

    if(!container){
        return;
    }


    const moneyContent =
        container.querySelector("#moneyContent");

    if(!moneyContent){
        return;
    }


    const data = db.load();

    if(!data.money){
        return;
    }


    const monthKey =
        getMoneyCurrentMonthKey();


    const today =
        getMoneyToday();


    const summary =
        calculateMoneyMonth(data,monthKey);


    const carryover =
        getMoneyCarryover(data,monthKey);


    const balance =
        carryover +
        summary.income -
        summary.expense;


    const budget =
        getMoneyBudget(data,monthKey);


    /* =====================
       今月の残高
    ===================== */

    setMoneyText(
        "moneyCurrentBalance",
        displayMoney(balance)
    );

    setMoneyText(
        "moneyBalancePeriod",
        today.year +
        "年" +
        today.month +
        "月"
    );


    /* =====================
       収入・支出
    ===================== */

    setMoneyText(
        "moneyIncomeTotal",
        displayMoney(summary.income)
    );

    setMoneyText(
        "moneyExpenseTotal",
        displayMoney(summary.expense)
    );


    /* =====================
       推し活費
    ===================== */

    setMoneyText(
        "moneyOshiTotal",
        displayMoney(summary.oshiExpense)
    );


    /* =====================
       今月の収支
    ===================== */

    setMoneyText(
        "moneyCarryover",
        displayMoney(carryover)
    );

    setMoneyText(
        "moneyDetailIncome",
        displayMoney(summary.income)
    );

    setMoneyText(
        "moneyDetailExpense",
        displayMoney(summary.expense)
    );

    setMoneyText(
        "moneyDetailBalance",
        displayMoney(balance)
    );

    setMoneyText(
        "moneyCarryoverDisplay",
        displayMoney(carryover)
    );


    /* =====================
       予算
    ===================== */

    renderMoneyBudget(
        budget,
        summary.expense
    );


    /* =====================
       最近の明細
    ===================== */

    renderMoneyRecentRecords(
        summary.records,
        data
    );


    /* =====================
       期間別集計
    ===================== */

    renderMoneyPeriodSummary(data);


    /* =====================
       金額表示状態
    ===================== */

    updateMoneyVisibilityButton();

}


/* =====================================================
   🎯 予算表示
===================================================== */

function renderMoneyBudget(budget,expense){

    setMoneyText(
        "moneyBudgetUsed",
        displayMoney(expense)
    );


    if(budget === null){

        setMoneyText(
            "moneyBudgetTotal",
            "未設定"
        );

        setMoneyText(
            "moneyBudgetRemaining",
            "-"
        );

        setMoneyText(
            "moneyBudgetPercent",
            "予算未設定"
        );

        const bar =
            document.getElementById(
                "moneyBudgetProgress"
            );

        if(bar){
            bar.style.width = "0%";
        }

        return;

    }


    const remaining =
        budget - expense;


    const percent =
        budget > 0
            ? Math.round(
                expense / budget * 100
            )
            : 0;


    setMoneyText(
        "moneyBudgetTotal",
        displayMoney(budget)
    );

    setMoneyText(
        "moneyBudgetRemaining",
        displayMoney(remaining)
    );

    setMoneyText(
        "moneyBudgetPercent",
        percent + "% 使用"
    );


    const bar =
        document.getElementById(
            "moneyBudgetProgress"
        );

    if(bar){

        bar.style.width =
            Math.min(
                Math.max(percent,0),
                100
            ) + "%";

    }

}


/* =====================================================
   📋 最近の明細
===================================================== */

function renderMoneyRecentRecords(records,data){

    const container =
        document.getElementById(
            "moneyRecentRecords"
        );

    if(!container){
        return;
    }


    container.innerHTML = "";


    const sorted = [...records].sort(
        (a,b) => {

            const dateA =
                new Date(getMoneyRecordDate(a)).getTime() || 0;

            const dateB =
                new Date(getMoneyRecordDate(b)).getTime() || 0;

            return dateB - dateA;

        }
    );


    const recent =
        sorted.slice(0,5);


    if(recent.length === 0){

        const empty =
            document.createElement("div");

        empty.className =
            "money-empty-message";

        empty.textContent =
            "まだ明細がありません";

        container.appendChild(empty);

        return;

    }


    recent.forEach(record => {

        const row =
            document.createElement("div");

        row.className =
            "money-recent-record";


        const left =
            document.createElement("div");

        left.className =
            "money-recent-record-info";


        const title =
            document.createElement("strong");

        title.textContent =
            record.memo ||
            getMoneyCategoryName(record,data);


        const date =
            document.createElement("span");

        date.textContent =
            formatMoneyDate(
                getMoneyRecordDate(record)
            );


        left.appendChild(title);
        left.appendChild(date);


        const amount =
            document.createElement("strong");

        amount.className =
            "money-recent-record-amount";


        const sign =
            isMoneyIncome(record) ? "+" : "-";


        amount.textContent =
            sign +
            displayMoney(
                getMoneyRecordAmount(record)
            );


        row.appendChild(left);
        row.appendChild(amount);

        container.appendChild(row);

    });

}


/* =====================================================
   📅 期間別集計
===================================================== */

function renderMoneyPeriodSummary(data){

    const container =
        document.getElementById(
            "moneyPeriodSummary"
        );

    if(!container){
        return;
    }


    const today =
        getMoneyToday();


    let records = [];


    if(moneyCurrentPeriod === "month"){

        records =
            getMoneyMonthRecords(
                data,
                getMoneyCurrentMonthKey()
            );

    }else if(moneyCurrentPeriod === "year"){

        records =
            (data.money.records || []).filter(
                record =>
                    isMoneyRecordInYear(
                        record,
                        today.year
                    )
            );

    }else{

        container.textContent =
            "指定期間の集計は、期間選択機能の追加後に表示します";

        return;

    }


    let income = 0;
    let expense = 0;


    records.forEach(record => {

        const amount =
            getMoneyRecordAmount(record);

        if(isMoneyIncome(record)){
            income += amount;
        }

        if(isMoneyExpense(record)){
            expense += amount;
        }

    });


    container.innerHTML = "";


    const rows = [

        {
            label:"収入合計",
            value:income
        },

        {
            label:"支出合計",
            value:expense
        },

        {
            label:"収支",
            value:income - expense
        }

    ];


    rows.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "money-detail-row";


        const label =
            document.createElement("span");

        label.textContent =
            item.label;


        const value =
            document.createElement("strong");

        value.textContent =
            displayMoney(item.value);


        row.appendChild(label);
        row.appendChild(value);

        container.appendChild(row);

    });


}


/* =====================================================
   📅 期間切り替え
===================================================== */

function changeMoneyPeriod(period){

    moneyCurrentPeriod = period;


    document.querySelectorAll(
        "#moneyContent .money-period-btn"
    ).forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.period === period
        );

    });


    const data = db.load();

    renderMoneyPeriodSummary(data);

}


/* =====================================================
   👁 金額表示切り替え
===================================================== */

function toggleMoneyVisibility(){

    moneyVisibilityHidden =
        !moneyVisibilityHidden;


    renderMoneyPage();

}


function updateMoneyVisibilityButton(){

    const button =
        document.getElementById(
            "moneyVisibilityBtn"
        );

    if(!button){
        return;
    }


    button.textContent =
        moneyVisibilityHidden
            ? "🙈 金額非表示中"
            : "👁 金額表示";

}


/* =====================================================
   ⭐ 推し活費ページを開く
===================================================== */

function openOshiMoney(){

    console.log(
        "★ 推し活費ページを開く"
    );


    const container =
        document.getElementById(
            "moneyContainer"
        );


    if(!container){

        console.error(
            "★ moneyContainer が見つかりません"
        );

        return;

    }


    fetch("oshi-money.html")

        .then(response => {

            if(!response.ok){

                throw new Error(
                    "oshi-money.html の読み込みに失敗しました"
                );

            }

            return response.text();

        })


        .then(html => {

            container.innerHTML = html;

            renderOshiMoneyPage();

        })


        .catch(error => {

            console.error(
                "★ 推し活費ページ読み込みエラー:",
                error
            );


            container.innerHTML = `

                <div class="card">

                    <p>
                        推し活費ページを
                        読み込めませんでした。
                    </p>

                </div>

            `;

        });

}


/* =====================================================
   ⭐ 推し活費ページ表示
   ※一覧表示の本実装は次の段階
===================================================== */


/* =====================================================
   ⭐ 推し活費ページ表示
===================================================== */

let oshiMoneyCurrentPeriod = "month";


function renderOshiMoneyPage(){

    console.log(
        "★ 推し活費ページ表示"
    );

    const data = db.load();

    if(!data.money){
        return;
    }

    const records =
        data.money.records || [];

    const oshiList =
        data.oshiList || [];

    const today =
        getMoneyToday();

    const currentYear =
        today.year;

    const currentMonth =
        getMoneyCurrentMonthKey();


    /* =====================
       期間に応じた明細取得
    ===================== */

    const oshiRecords =
        records.filter(record => {

            if(!isOshiMoneyRecord(record,data)){
                return false;
            }

            const date =
                getMoneyRecordDate(record);

            if(!date){
                return false;
            }

            if(
                oshiMoneyCurrentPeriod === "month"
            ){

                return (
                    getMoneyMonthKey(date) ===
                    currentMonth
                );

            }

            if(
                oshiMoneyCurrentPeriod === "year"
            ){

                return isMoneyRecordInYear(
                    record,
                    currentYear
                );

            }

            return true;

        });


    /* =====================
       推し別集計
    ===================== */

    const totals = {};

    oshiRecords.forEach(record => {

        const oshiId =
            record.oshiId;

        if(!oshiId){
            return;
        }

        if(!totals[oshiId]){
            totals[oshiId] = 0;
        }

        totals[oshiId] +=
            getMoneyRecordAmount(record);

    });


    /* =====================
       全体合計
    ===================== */

    const grandTotal =
        oshiRecords.reduce(
            (total,record) => {

                return (
                    total +
                    getMoneyRecordAmount(record)
                );

            },
            0
        );


    /* =====================
       合計表示
    ===================== */

    const periodLabels = {

        month:"今月の推し活費",
        year:"今年の推し活費",
        all:"累計の推し活費"

    };

    setMoneyText(
        "oshiMoneyTotalLabel",
        periodLabels[oshiMoneyCurrentPeriod]
    );

    setMoneyText(
        "oshiMoneyTotalValue",
        displayMoney(grandTotal)
    );

    setMoneyText(
        "oshiMoneyGrandTotal",
        displayMoney(grandTotal)
    );


    /* =====================
       推し一覧表示
    ===================== */

    const container =
        document.getElementById(
            "oshiMoneyPersonList"
        );

    if(!container){
        return;
    }

    container.innerHTML = "";


    /*
       登録中の推しは表示する。

       登録解除済みの推しも、
       過去の支出があれば表示する。
    */

    const displayOshiList =
        oshiList.filter(oshi => {

            return (
                oshi.listed !== false ||
                (totals[oshi.id] || 0) > 0
            );

        });


    /* =====================
       推し未登録
    ===================== */

    if(displayOshiList.length === 0){

        const empty =
            document.createElement("div");

        empty.className =
            "money-empty-message";

        empty.textContent =
            "登録されている推しはいません";

        container.appendChild(empty);

        return;

    }


    /* =====================
       推し別の行を作成
    ===================== */

    displayOshiList.forEach(oshi => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "oshi-money-person";

        button.addEventListener(
            "click",
            () => openOshiMoneyDetail(oshi.id)
        );


        const name =
            document.createElement("span");

        name.className =
            "oshi-money-person-name";

        name.textContent =
            "⭐ " + (
                oshi.name ||
                "名前未設定"
            );


        const amount =
            document.createElement("span");

        amount.className =
            "oshi-money-person-value";

        amount.textContent =
            displayMoney(
                totals[oshi.id] || 0
            );


        const arrow =
            document.createElement("span");

        arrow.className =
            "oshi-money-arrow";

        arrow.textContent = "›";


        button.appendChild(name);
        button.appendChild(amount);
        button.appendChild(arrow);

        container.appendChild(button);

    });

}


/* =====================================================
   ⭐ 推し活費の期間切り替え
===================================================== */

function changeOshiMoneyPeriod(period){

    if(
        !["month","year","all"].includes(period)
    ){
        return;
    }

    oshiMoneyCurrentPeriod = period;


    document.querySelectorAll(
        ".oshi-money-period button"
    ).forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.period === period
        );

    });


    renderOshiMoneyPage();

}


/* =====================================================
   ⭐ 推し別明細
   詳細画面は次の段階で実装
===================================================== */

function openOshiMoneyDetail(oshiId){

    console.log(
        "★ 推し別明細:",
        oshiId
    );

    alert(
        "推し別の支出明細画面は次の段階で実装します。"
    );

}



/* =====================================================
   ⭐ 推し活費ページを閉じる
===================================================== */

function closeOshiMoney(){

    console.log(
        "★ 推し活費ページを閉じる"
    );


    const container =
        document.getElementById(
            "moneyContainer"
        );


    if(!container){
        return;
    }


    loadMoneyPage();

}


/* =====================================================
   次の段階で実装する操作
===================================================== */

function openMoneyRecordForm(type){

    alert(
        "収入・支出の登録画面は次の段階で実装します。"
    );

}


function openMoneyBudgetSettings(){

    alert(
        "予算設定画面は次の段階で実装します。"
    );

}


function openMoneyRecordList(){

    alert(
        "明細一覧画面は次の段階で実装します。"
    );

}


function openMoneyCategorySettings(){

    alert(
        "カテゴリ設定画面は次の段階で実装します。"
    );

}


function openMoneyCarryoverSettings(){

    alert(
        "繰越金設定画面は次の段階で実装します。"
    );

}
