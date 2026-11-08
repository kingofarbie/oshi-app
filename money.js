
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

    renderOshiMoneyBudget(data, monthKey);

    applyMoneyBudgetStatus();


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
       総合計
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
       推し表示枠の取得・初期化
    ===================== */

    if(
        !Array.isArray(
            data.money.oshiDisplaySlots
        )
    ){

        data.money.oshiDisplaySlots = [
            null,
            null,
            null,
            null,
            null
        ];

        db.save(data);

    }

    const slots =
        data.money.oshiDisplaySlots;


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


    /* =====================
       推し登録がない場合
    ===================== */

    if(oshiList.length === 0){

        const empty =
            document.createElement("div");

        empty.className =
            "money-empty-message";

        empty.textContent =
            "先に「推し」ページで推しを登録してください";

        container.appendChild(empty);

    }


    /* =====================
       表示枠を作成
    ===================== */

    slots.forEach((selectedId,index) => {

        const row =
            document.createElement("div");

        row.className =
            "oshi-money-person";


        /* =====================
           推し番号
        ===================== */

        const number =
            document.createElement("span");

        number.className =
            "oshi-money-person-name";

        number.textContent =
            "⭐ 推し" +
            (index + 1);


        /* =====================
           推し選択
        ===================== */

        const select =
            document.createElement("select");

        select.className =
            "oshi-money-select";

        select.style.minWidth = "0";
        select.style.maxWidth = "100%";
        select.style.flex = "1";


        const placeholder =
            document.createElement("option");

        placeholder.value = "";

        placeholder.textContent =
            "推しを選択";

        select.appendChild(placeholder);


        const usedIds =
            slots.filter((id,slotIndex) => {

                return (
                    id &&
                    slotIndex !== index
                );

            });


        oshiList.forEach(oshi => {

            if(
                usedIds.includes(oshi.id)
            ){
                return;
            }

            const option =
                document.createElement("option");

            option.value =
                oshi.id;

            option.textContent =
                oshi.name || "名前未設定";

            select.appendChild(option);

        });


        select.value =
            selectedId || "";


        select.addEventListener(
            "change",
            () => {

                changeOshiMoneySlot(
                    index,
                    select.value
                );

            }
        );


        /* =====================
           金額
        ===================== */

        const amount =
            document.createElement("span");

        amount.className =
            "oshi-money-person-value";


        amount.textContent =
            displayMoney(
                selectedId
                    ? totals[selectedId] || 0
                    : 0
            );


        /* =====================
           詳細ボタン
        ===================== */

        const detail =
            document.createElement("button");

        detail.type = "button";

        detail.className =
            "oshi-money-arrow";

        detail.textContent = "›";

        detail.disabled =
            !selectedId;

        detail.addEventListener(
            "click",
            () => {

                if(selectedId){

                    openOshiMoneyDetail(
                        selectedId
                    );

                }

            }
        );


        row.appendChild(number);
        row.appendChild(select);
        row.appendChild(amount);
        row.appendChild(detail);

        container.appendChild(row);

    });


    /* =====================
       推し追加ボタン
    ===================== */

    const addButton =
        document.createElement("button");

    addButton.type = "button";

    addButton.className =
        "money-small-btn";

    addButton.textContent =
        "＋ 推しを追加";

    addButton.style.marginTop = "12px";


    const unassignedOshi =
        oshiList.filter(oshi => {

            return !slots.includes(oshi.id);

        });


    addButton.disabled =
        unassignedOshi.length === 0;


    addButton.addEventListener(
        "click",
        addOshiMoneySlot
    );


    container.appendChild(addButton);




}




/* =====================================================
   💖 推し活費の内訳管理
===================================================== */


function openOshiMoneyCategoryManager(){

    const data = db.load();

    if(!data.money){
        return;
    }

    if(!Array.isArray(data.money.oshiCategories)){
        data.money.oshiCategories = [];
        db.save(data);
    }

    const overlay = document.createElement("div");

    overlay.className =
        "oshi-money-category-overlay";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10001;
        background:rgba(0,0,0,.55);
        display:flex;
        justify-content:center;
        align-items:center;
        padding:16px;
        box-sizing:border-box;
    `;

    const panel = document.createElement("div");

    panel.style.cssText = `
        width:100%;
        max-width:460px;
        max-height:85vh;
        overflow-y:auto;
        background:white;
        color:#333;
        border-radius:18px;
        padding:20px;
        box-sizing:border-box;
    `;

    overlay.appendChild(panel);


    /* =====================
       画面描画
    ===================== */

    function render(){

        const latestData = db.load();

        const categories =
            latestData.money.oshiCategories || [];

        panel.innerHTML = "";


        /* ヘッダー */

        const header = document.createElement("div");

        header.style.cssText = `
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:10px;
            margin-bottom:12px;
        `;

        const title = document.createElement("h3");

        title.textContent =
            "💖 推し活費の内訳管理";

        title.style.cssText = `
            margin:0;
            font-size:18px;
        `;

        const closeButton =
            document.createElement("button");

        closeButton.type = "button";
        closeButton.textContent = "✕";

        closeButton.style.cssText = `
            border:none;
            background:#f3f3f3;
            border-radius:50%;
            width:36px;
            height:36px;
            font-size:16px;
        `;

        closeButton.onclick = () => {
            overlay.remove();
            renderOshiMoneyPage();
        };

        header.append(title, closeButton);

        panel.appendChild(header);


        /* 説明 */

        const description =
            document.createElement("p");

        description.textContent =
            "内訳項目を追加・編集したり、使わない項目を非表示にできます。";

        description.style.cssText = `
            font-size:13px;
            color:#777;
            line-height:1.6;
            margin:0 0 18px;
        `;

        panel.appendChild(description);


        /* =====================
           新規追加
        ===================== */

        const addButton =
            document.createElement("button");

        addButton.type = "button";

        addButton.textContent =
            "＋ 内訳項目を追加";

        addButton.style.cssText = `
            width:100%;
            padding:13px;
            border:none;
            border-radius:10px;
            background:#e978a5;
            color:white;
            font-weight:bold;
            font-size:15px;
            margin-bottom:18px;
        `;

        addButton.onclick = () => {

            const name = prompt(
                "追加する内訳の名前を入力してください"
            );

            if(name === null) return;

            const trimmedName = name.trim();

            if(!trimmedName){
                alert("項目名を入力してください。");
                return;
            }

            const icon = prompt(
                "アイコンを入力してください。\n\n" +
                "例：💖 🎁 🎤 🚃\n\n" +
                "空欄の場合は 💖 になります。"
            );

            if(icon === null) return;

            const saveData = db.load();

            const newCategory = {
                id: "oshi_cat_" + Date.now(),
                name: trimmedName,
                icon: icon.trim() || "💖",
                active: true,
                isDefault: false
            };

            saveData.money.oshiCategories.push(
                newCategory
            );

            db.save(saveData);

            render();

        };

        panel.appendChild(addButton);


        /* =====================
           項目一覧
        ===================== */

        categories.forEach(category => {

            const row = document.createElement("div");

            row.style.cssText = `
                display:flex;
                align-items:center;
                gap:8px;
                padding:12px 0;
                border-top:1px solid #eee;
                flex-wrap:wrap;
            `;


            /* 項目名 */

            const name = document.createElement("div");

            name.textContent =
                (category.icon || "💖") +
                " " +
                category.name;

            name.style.cssText = `
                flex:1;
                min-width:100px;
                font-weight:bold;
            `;

            if(category.active === false){
                name.style.opacity = ".4";
                name.style.textDecoration = "line-through";
            }


            /* 編集 */

            const editButton =
                document.createElement("button");

            editButton.type = "button";
            editButton.textContent = "編集";

            editButton.style.cssText = `
                padding:7px 10px;
                border:1px solid #e5a2bd;
                border-radius:7px;
                background:#fff5f9;
                color:#c94c80;
                font-size:12px;
            `;

            editButton.onclick = () => {

                const newName = prompt(
                    "内訳の名前を変更してください",
                    category.name
                );

                if(newName === null) return;

                const trimmedName = newName.trim();

                if(!trimmedName){
                    alert("項目名を入力してください。");
                    return;
                }

                const newIcon = prompt(
                    "アイコンを変更してください",
                    category.icon || "💖"
                );

                if(newIcon === null) return;

                const saveData = db.load();

                const target =
                    saveData.money.oshiCategories.find(
                        item => item.id === category.id
                    );

                if(!target) return;

                target.name = trimmedName;
                target.icon = newIcon.trim() || "💖";

                db.save(saveData);

                render();

            };


            /* 有効・停止 */

            const toggleButton =
                document.createElement("button");

            toggleButton.type = "button";

            toggleButton.textContent =
                category.active === false
                    ? "再開"
                    : "停止";

            toggleButton.style.cssText = `
                padding:7px 10px;
                border:1px solid #ddd;
                border-radius:7px;
                background:#f7f7f7;
                color:#555;
                font-size:12px;
            `;

            toggleButton.onclick = () => {

                const saveData = db.load();

                const target =
                    saveData.money.oshiCategories.find(
                        item => item.id === category.id
                    );

                if(!target) return;

                target.active =
                    target.active === false;

                db.save(saveData);

                render();

            };


            /* 削除 */

            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "削除";

            deleteButton.style.cssText = `
                padding:7px 10px;
                border:1px solid #ddd;
                border-radius:7px;
                background:#f7f7f7;
                color:#b44;
                font-size:12px;
            `;

            deleteButton.onclick = () => {

                const saveData = db.load();

                const usedRecords =
                    saveData.money.records.filter(
                        record =>
                            record.oshiCategoryId === category.id
                    );

                let message =
                    "「" + category.name +
                    "」を削除しますか？";

                if(usedRecords.length > 0){

                    message +=
                        "\n\n過去の明細 " +
                        usedRecords.length +
                        " 件で使用されています。" +
                        "\n過去の記録を守るため、項目は削除せず非表示にします。";

                }else{

                    message +=
                        "\n\nこの項目を削除します。";

                }

                if(!confirm(message)) return;

                if(usedRecords.length > 0){

                    const target =
                        saveData.money.oshiCategories.find(
                            item => item.id === category.id
                        );

                    if(target){
                        target.active = false;
                    }

                }else{

                    saveData.money.oshiCategories =
                        saveData.money.oshiCategories.filter(
                            item => item.id !== category.id
                        );

                }

                db.save(saveData);

                render();

            };


            row.append(
                name,
                editButton,
                toggleButton,
                deleteButton
            );

            panel.appendChild(row);

        });


        /* 項目なし */

        if(categories.length === 0){

            const empty = document.createElement("p");

            empty.textContent =
                "内訳項目はまだありません。";

            empty.style.cssText = `
                text-align:center;
                color:#888;
                padding:20px 0;
            `;

            panel.appendChild(empty);

        }

    }


    overlay.addEventListener("click", event => {

        if(event.target === overlay){

            overlay.remove();
            renderOshiMoneyPage();

        }

    });

    document.body.appendChild(overlay);

    render();

}




/* =====================================================
   ⭐ 推し枠に推しを割り当てる
===================================================== */

function changeOshiMoneySlot(index,oshiId){

    const data = db.load();

    if(!data.money){
        return;
    }

    if(
        !Array.isArray(
            data.money.oshiDisplaySlots
        )
    ){
        return;
    }


    const slots =
        data.money.oshiDisplaySlots;


    if(
        index < 0 ||
        index >= slots.length
    ){
        return;
    }


    /* =====================
       登録済みの推しか確認
    ===================== */

    if(oshiId){

        const exists =
            (data.oshiList || []).some(
                oshi => oshi.id === oshiId
            );

        if(!exists){
            alert(
                "登録済みの推しを選択してください"
            );

            renderOshiMoneyPage();

            return;
        }


        /* 重複登録防止 */

        const duplicate =
            slots.some(
                (id,slotIndex) => {

                    return (
                        id === oshiId &&
                        slotIndex !== index
                    );

                }
            );

        if(duplicate){

            alert(
                "この推しはすでに選択されています"
            );

            renderOshiMoneyPage();

            return;

        }

    }


    slots[index] =
        oshiId || null;


    db.save(data);

    renderOshiMoneyPage();

}


/* =====================================================
   ⭐ 推し表示枠を追加
===================================================== */

function addOshiMoneySlot(){

    const data = db.load();

    if(!data.money){
        return;
    }

    if(
        !Array.isArray(
            data.money.oshiDisplaySlots
        )
    ){

        data.money.oshiDisplaySlots = [
            null,
            null,
            null,
            null,
            null
        ];

    }


    const slots =
        data.money.oshiDisplaySlots;

    const oshiList =
        data.oshiList || [];


    const available =
        oshiList.some(oshi => {

            return !slots.includes(oshi.id);

        });


    if(!available){

        alert(
            "選択できる未設定の推しがいません"
        );

        return;

    }


    slots.push(null);

    db.save(data);

    renderOshiMoneyPage();

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

    oshiMoneyCurrentPeriod =
        period;


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
===================================================== */

/* =====================================================
   ⭐ 推し別・推し活費詳細
===================================================== */


function openOshiMoneyDetail(oshiId) {

    const data = db.load();
    const money = data.money || {};
    const records = money.records || [];
    const oshiCategories = money.oshiCategories || [];
    const moneyCategories = money.categories || [];

    const oshi = (data.oshiList || []).find(
        item => item.id === oshiId
    );

    const oshiName = oshi
        ? oshi.name
        : "登録解除された推し";


    /* =====================
       期間で絞り込み
    ===================== */

    const filteredRecords = records.filter(record => {

        if (record.oshiId !== oshiId) return false;
        if (!isMoneyExpense(record)) return false;
        if (!isOshiMoneyRecord(record, data)) return false;

        if (
            oshiMoneyCurrentPeriod === "month" &&
            !isMoneyRecordInMonth(
                record,
                getMoneyCurrentMonthKey()
            )
        ) return false;

        if (
            oshiMoneyCurrentPeriod === "year" &&
            !isMoneyRecordInYear(
                record,
                getMoneyToday().year
            )
        ) return false;

        return true;

    });


    /* =====================
       カテゴリ名
    ===================== */

    function getOshiDetailCategory(record) {

        const category = oshiCategories.find(
            item => item.id === record.oshiCategoryId
        );

        if (category) return category.name;

        const moneyCategory = moneyCategories.find(
            item => item.id === record.categoryId
        );

        return moneyCategory
            ? moneyCategory.name
            : "その他";
    }


    /* =====================
       編集画面
    ===================== */

    function openEditForm(recordId) {

        const latestData = db.load();
        const latestMoney = latestData.money;

        const record = latestMoney.records.find(
            item => item.id === recordId
        );

        if (!record) {
            alert("明細が見つかりません。");
            return;
        }

        const editOverlay = document.createElement("div");

        editOverlay.style.cssText = `
            position:fixed;
            inset:0;
            z-index:10002;
            background:rgba(0,0,0,.6);
            display:flex;
            justify-content:center;
            align-items:center;
            padding:16px;
            box-sizing:border-box;
        `;

        const editPanel = document.createElement("div");

        editPanel.style.cssText = `
            width:100%;
            max-width:440px;
            max-height:90vh;
            overflow-y:auto;
            background:white;
            color:#333;
            border-radius:18px;
            padding:20px;
            box-sizing:border-box;
        `;

        const heading = document.createElement("h3");
        heading.textContent = "明細を編集";
        heading.style.margin = "0 0 18px";

        editPanel.appendChild(heading);


        function addInput(labelText, element) {

            const wrapper = document.createElement("label");

            wrapper.style.cssText = `
                display:block;
                margin-bottom:15px;
                font-size:14px;
                font-weight:bold;
            `;

            const label = document.createElement("div");
            label.textContent = labelText;
            label.style.marginBottom = "7px";

            element.style.cssText += `
                display:block;
                width:100%;
                min-height:44px;
                padding:10px;
                border:1px solid #ddd;
                border-radius:9px;
                box-sizing:border-box;
                background:white;
                color:#333;
                font-size:16px;
            `;

            wrapper.append(label, element);
            editPanel.appendChild(wrapper);

        }


        // 日付
        const dateInput = document.createElement("input");
        dateInput.type = "date";

        const recordDate = getMoneyRecordDate(record);

        dateInput.value = recordDate
            ? String(recordDate).slice(0, 10)
            : "";

        addInput("📅 日付", dateInput);


        // 金額
        const amountInput = document.createElement("input");
        amountInput.type = "number";
        amountInput.min = "1";
        amountInput.step = "1";
        amountInput.value = getMoneyRecordAmount(record);

        addInput("💴 金額（円）", amountInput);


        // 推し
        const oshiSelect = document.createElement("select");

        const editableOshiList =
            (latestData.oshiList || []).filter(
                item =>
                    item.listed !== false ||
                    item.id === record.oshiId
            );

        editableOshiList.forEach(item => {

            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = item.name;

            if (item.id === record.oshiId) {
                option.selected = true;
            }

            oshiSelect.appendChild(option);

        });

        addInput("⭐ 推し", oshiSelect);


        // 内訳
        const categorySelect = document.createElement("select");

        const editableCategories =
            (latestMoney.oshiCategories || []).filter(
                item =>
                    item.active !== false ||
                    item.id === record.oshiCategoryId
            );

        editableCategories.forEach(category => {

            const option = document.createElement("option");

            option.value = category.id;
            option.textContent =
                (category.icon || "") + " " + category.name;

            if (category.id === record.oshiCategoryId) {
                option.selected = true;
            }

            categorySelect.appendChild(option);

        });

        addInput("💖 推し活費の内訳", categorySelect);


        // メモ
        const memoInput = document.createElement("textarea");

        memoInput.rows = 3;
        memoInput.value =
            record.memo ||
            record.description ||
            record.title ||
            "";

        addInput("📝 メモ", memoInput);


        // ボタン
        const buttons = document.createElement("div");

        buttons.style.cssText = `
            display:flex;
            gap:10px;
            margin-top:20px;
        `;

        const cancelButton = document.createElement("button");

        cancelButton.type = "button";
        cancelButton.textContent = "キャンセル";

        cancelButton.style.cssText = `
            flex:1;
            padding:13px;
            border:1px solid #ddd;
            border-radius:10px;
            background:#f5f5f5;
        `;

        cancelButton.onclick = () => editOverlay.remove();


        const saveButton = document.createElement("button");

        saveButton.type = "button";
        saveButton.textContent = "変更を保存";

        saveButton.style.cssText = `
            flex:1;
            padding:13px;
            border:none;
            border-radius:10px;
            background:#e978a5;
            color:white;
            font-weight:bold;
        `;


        saveButton.onclick = () => {

            const amount = Number(amountInput.value);

            if (!dateInput.value) {
                alert("日付を入力してください");
                return;
            }

            if (!Number.isFinite(amount) || amount <= 0) {
                alert("金額を正しく入力してください");
                return;
            }

            if (!oshiSelect.value) {
                alert("推しを選択してください");
                return;
            }

            if (!categorySelect.value) {
                alert("内訳を選択してください");
                return;
            }

            const saveData = db.load();

            const target = saveData.money.records.find(
                item => item.id === recordId
            );

            if (!target) {
                alert("明細が見つかりません。");
                return;
            }

            target.date = dateInput.value;
            target.amount = amount;
            target.oshiId = oshiSelect.value;
            target.oshiCategoryId = categorySelect.value;
            target.memo = memoInput.value.trim();

            db.save(saveData);

editOverlay.remove();
overlay.remove();

renderMoneyPage();
renderOshiMoneyPage();
openOshiMoneyDetail(target.oshiId);

alert("明細を更新しました！");


        };


        buttons.append(cancelButton, saveButton);
        editPanel.appendChild(buttons);

        editOverlay.appendChild(editPanel);

        editOverlay.addEventListener("click", event => {

            if (event.target === editOverlay) {
                editOverlay.remove();
            }

        });

        document.body.appendChild(editOverlay);

    }


    /* =====================
       明細削除
    ===================== */

    function deleteOshiMoneyRecord(recordId) {

        const ok = confirm(
            "この推し活費の明細を削除しますか？\n\n" +
            "削除した明細は元に戻せません。"
        );

        if (!ok) return;

        const saveData = db.load();

        const before = saveData.money.records.length;

        saveData.money.records =
            saveData.money.records.filter(
                record => record.id !== recordId
            );

        if (saveData.money.records.length === before) {
            alert("明細が見つかりません。");
            return;
        }

db.save(saveData);

overlay.remove();

renderMoneyPage();
renderOshiMoneyPage();
openOshiMoneyDetail(oshiId);

alert("明細を削除しました。");


    }


    /* =====================
       金額集計
    ===================== */

    const categoryGroups = {};

    filteredRecords.forEach(record => {

        const categoryName = getOshiDetailCategory(record);

        if (!categoryGroups[categoryName]) {
            categoryGroups[categoryName] = {
                total: 0,
                records: []
            };
        }

        const amount = getMoneyRecordAmount(record);

        categoryGroups[categoryName].total += amount;
        categoryGroups[categoryName].records.push(record);

    });

    const total = filteredRecords.reduce(
        (sum, record) =>
            sum + getMoneyRecordAmount(record),
        0
    );


    /* =====================
       期間ラベル
    ===================== */

    let periodLabel = "今月";

    if (oshiMoneyCurrentPeriod === "year") {
        periodLabel = "今年";
    }

    if (oshiMoneyCurrentPeriod === "all") {
        periodLabel = "累計";
    }


    /* =====================
       古い詳細画面を削除
    ===================== */

    const oldOverlay = document.querySelector(
        ".oshi-money-detail-overlay"
    );

    if (oldOverlay) oldOverlay.remove();


    /* =====================
       詳細画面
    ===================== */

    const overlay = document.createElement("div");

    overlay.className = "oshi-money-detail-overlay";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10000;
        background:rgba(0,0,0,.55);
        display:flex;
        justify-content:center;
        align-items:center;
        padding:16px;
        box-sizing:border-box;
    `;

    const panel = document.createElement("div");

    panel.style.cssText = `
        width:100%;
        max-width:520px;
        max-height:85vh;
        overflow-y:auto;
        background:white;
        border-radius:18px;
        padding:20px;
        box-sizing:border-box;
        color:#333;
    `;


    /* ヘッダー */

    const header = document.createElement("div");

    header.style.cssText = `
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        margin-bottom:16px;
    `;

    const title = document.createElement("h2");

    title.textContent = "⭐ " + oshiName + " の推し活費";

    title.style.cssText = `
        font-size:18px;
        margin:0;
    `;

    const closeButton = document.createElement("button");

    closeButton.type = "button";
    closeButton.textContent = "✕";

    closeButton.style.cssText = `
        border:none;
        background:#f3f3f3;
        border-radius:50%;
        width:36px;
        height:36px;
        font-size:16px;
        cursor:pointer;
        flex-shrink:0;
    `;

    closeButton.onclick = () => overlay.remove();

    header.append(title, closeButton);
    panel.appendChild(header);


    /* 合計金額 */

    const totalBox = document.createElement("div");

    totalBox.style.cssText = `
        background:#fff0f6;
        border-radius:14px;
        padding:18px;
        text-align:center;
        margin-bottom:20px;
    `;

    const totalLabel = document.createElement("div");

    totalLabel.textContent = periodLabel + "の推し活費";

    totalLabel.style.cssText = `
        font-size:13px;
        margin-bottom:8px;
    `;

    const totalValue = document.createElement("strong");

    totalValue.textContent = formatMoney(total);

    totalValue.style.cssText = `
        font-size:26px;
        color:#e75491;
    `;

    totalBox.append(totalLabel, totalValue);
    panel.appendChild(totalBox);


    /* =====================
       カテゴリ別内訳・明細
    ===================== */

    Object.entries(categoryGroups).forEach(
        ([categoryName, group]) => {

            const section = document.createElement("section");

            section.style.cssText = `
                margin-bottom:18px;
                border:1px solid #eee;
                border-radius:12px;
                overflow:hidden;
            `;

            const categoryHeader = document.createElement("div");

            categoryHeader.style.cssText = `
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:10px;
                padding:12px;
                background:#fff7fa;
                font-weight:bold;
            `;

            const categoryTitle = document.createElement("span");

            categoryTitle.textContent = "💗 " + categoryName;

            const categoryTotal = document.createElement("strong");

            categoryTotal.textContent = formatMoney(group.total);

            categoryHeader.append(categoryTitle, categoryTotal);
            section.appendChild(categoryHeader);


            group.records.forEach(record => {

                const row = document.createElement("div");

                row.style.cssText = `
                    padding:12px;
                    border-top:1px solid #eee;
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:10px;
                `;

                const detail = document.createElement("div");

                detail.style.cssText = `
                    min-width:0;
                    flex:1;
                `;

                const date = document.createElement("div");

                const recordDate = getMoneyRecordDate(record);

                date.textContent = recordDate
                    ? String(recordDate).slice(0, 10)
                    : "日付なし";

                date.style.cssText = `
                    font-size:12px;
                    color:#888;
                    margin-bottom:4px;
                `;

                const memo = document.createElement("div");

                memo.textContent =
                    record.memo ||
                    record.description ||
                    record.title ||
                    categoryName;

                memo.style.cssText = `
                    font-size:14px;
                    overflow-wrap:anywhere;
                `;

                detail.append(date, memo);


                const right = document.createElement("div");

                right.style.cssText = `
                    display:flex;
                    flex-direction:column;
                    align-items:flex-end;
                    gap:8px;
                    flex-shrink:0;
                `;

                const amount = document.createElement("strong");

                amount.textContent = formatMoney(
                    getMoneyRecordAmount(record)
                );

                amount.style.cssText = `
                    white-space:nowrap;
                    color:#e75491;
                `;


                const actions = document.createElement("div");

                actions.style.cssText = `
                    display:flex;
                    gap:6px;
                `;


                const editButton = document.createElement("button");

                editButton.type = "button";
                editButton.textContent = "編集";

                editButton.style.cssText = `
                    padding:6px 10px;
                    border:1px solid #e5a2bd;
                    border-radius:7px;
                    background:#fff5f9;
                    color:#c94c80;
                    font-size:12px;
                `;

                editButton.onclick = () => {
                    openEditForm(record.id);
                };


                const deleteButton = document.createElement("button");

                deleteButton.type = "button";
                deleteButton.textContent = "削除";

                deleteButton.style.cssText = `
                    padding:6px 10px;
                    border:1px solid #ddd;
                    border-radius:7px;
                    background:#f7f7f7;
                    color:#666;
                    font-size:12px;
                `;

                deleteButton.onclick = () => {
                    deleteOshiMoneyRecord(record.id);
                };


                actions.append(editButton, deleteButton);

                right.append(amount, actions);

                row.append(detail, right);

                section.appendChild(row);

            });

            panel.appendChild(section);

        }
    );


    /* 明細なし */

    if (filteredRecords.length === 0) {

        const empty = document.createElement("p");

        empty.textContent =
            "この期間の推し活費はまだありません。";

        empty.style.cssText = `
            text-align:center;
            color:#888;
            padding:25px 10px;
        `;

        panel.appendChild(empty);

    }


    /* 閉じる */

    overlay.appendChild(panel);

    overlay.addEventListener("click", event => {

        if (event.target === overlay) {
            overlay.remove();
        }

    });

    document.body.appendChild(overlay);

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

/* =====================================================
   💰 収入・支出 登録画面
===================================================== */



/* =====================================================
   💰 収入・支出 登録 / 編集フォーム
===================================================== */


function openMoneyRecordForm(type, recordId = null) {

    const data = db.load();

    if (!data.money) {
        data.money = {};
    }

    const money = data.money;

    if (!Array.isArray(money.records)) {
        money.records = [];
    }

    const editingRecord = recordId
        ? money.records.find(record => record.id === recordId)
        : null;

    if (recordId && !editingRecord) {
        alert("編集する明細が見つかりません");
        return;
    }

    const categories =
        Array.isArray(money.categories) &&
        money.categories.length > 0
            ? money.categories
            : createDefaultMoneyCategories();

    const oshiCategories =
        Array.isArray(money.oshiCategories) &&
        money.oshiCategories.length > 0
            ? money.oshiCategories
            : createDefaultOshiCategories();

    const oshiList = (data.oshiList || []).filter(
        oshi => oshi.listed !== false
    );

    const isIncome = type === "income";

    const title = editingRecord
        ? "明細を編集"
        : (isIncome ? "収入を登録" : "支出を登録");

    const now = new Date();

    const today =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");

    const dateValue = editingRecord
        ? getMoneyRecordDate(editingRecord)
        : today;


    /* =====================
       既存画面を閉じる
    ===================== */

    const old = document.querySelector(
        ".money-record-overlay"
    );

    if (old) old.remove();


    /* =====================
       オーバーレイ
    ===================== */

    const overlay = document.createElement("div");

    overlay.className = "money-record-overlay";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10000;
        background:rgba(0,0,0,.5);
        display:flex;
        justify-content:center;
        align-items:center;
        padding:16px;
        box-sizing:border-box;
    `;


    const panel = document.createElement("div");

    panel.style.cssText = `
        width:100%;
        max-width:480px;
        max-height:90vh;
        overflow-y:auto;
        background:white;
        color:#333;
        border-radius:18px;
        padding:20px;
        box-sizing:border-box;
    `;


    const heading = document.createElement("h2");

    heading.textContent = title;

    heading.style.cssText = `
        margin:0 0 20px;
        font-size:20px;
    `;

    panel.appendChild(heading);


    /* =====================
       入力欄作成
    ===================== */

    function createField(labelText, element, parent = panel) {

        const wrapper = document.createElement("label");

        wrapper.style.cssText = `
            display:block;
            margin-bottom:16px;
            font-size:14px;
            font-weight:bold;
        `;

        const label = document.createElement("div");

        label.textContent = labelText;

        label.style.marginBottom = "7px";

        element.style.cssText += `
            display:block;
            width:100%;
            min-height:44px;
            padding:10px;
            border:1px solid #ddd;
            border-radius:9px;
            box-sizing:border-box;
            background:white;
            color:#333;
            font-size:16px;
        `;

        wrapper.append(label, element);

        parent.appendChild(wrapper);

        return wrapper;
    }


    /* =====================
       日付
    ===================== */

    const dateInput = document.createElement("input");

    dateInput.type = "date";
    dateInput.value = dateValue || today;

    createField("📅 日付", dateInput);


    /* =====================
       金額
    ===================== */

    const amountInput = document.createElement("input");

    amountInput.type = "number";
    amountInput.min = "1";
    amountInput.step = "1";
    amountInput.placeholder = "金額を入力";

    if (editingRecord) {
        amountInput.value =
            getMoneyRecordAmount(editingRecord);
    }

    createField("💴 金額（円）", amountInput);


    /* =====================
       カテゴリ
    ===================== */

    const categorySelect = document.createElement("select");

    const availableCategories = categories.filter(category => {

        if (category.type !== type) return false;

        // 通常は有効なカテゴリだけ表示
        // ただし編集中の明細で使用中なら表示する
        if (
            category.active === false &&
            (!editingRecord ||
             editingRecord.categoryId !== category.id)
        ) {
            return false;
        }

        return true;

    });

    availableCategories.forEach(category => {

        const option = document.createElement("option");

        option.value = category.id;

        option.textContent =
            (category.icon || "") + " " + category.name;

        categorySelect.appendChild(option);

    });

    if (editingRecord) {
        categorySelect.value = editingRecord.categoryId;
    }

    createField("📂 カテゴリ", categorySelect);


    /* =====================
       推し活費の追加項目
    ===================== */

    const oshiArea = document.createElement("div");

    oshiArea.style.cssText = `
        display:none;
        margin-bottom:16px;
        padding:14px;
        background:#fff5f9;
        border-radius:12px;
    `;


    /* 推し選択 */

    const oshiSelect = document.createElement("select");

    oshiList.forEach(oshi => {

        const option = document.createElement("option");

        option.value = oshi.id;
        option.textContent = oshi.name;

        oshiSelect.appendChild(option);

    });

    if (editingRecord) {
        oshiSelect.value = editingRecord.oshiId || "";
    }

    createField("⭐ 推し", oshiSelect, oshiArea);


    /* 推し活費の内訳 */

    const oshiCategorySelect =
        document.createElement("select");

    oshiCategories
        .filter(category => {

            // 有効な内訳は表示
            if (category.active !== false) {
                return true;
            }

            // 編集中の明細で使用している内訳は
            // 停止済みでも表示する
            return !!(
                editingRecord &&
                editingRecord.oshiCategoryId === category.id
            );

        })
        .forEach(category => {

            const option = document.createElement("option");

            option.value = category.id;

            option.textContent =
                (category.icon || "") + " " + category.name;

            oshiCategorySelect.appendChild(option);

        });

    if (editingRecord) {
        oshiCategorySelect.value =
            editingRecord.oshiCategoryId || "";
    }

    createField(
        "💖 推し活費の内訳",
        oshiCategorySelect,
        oshiArea
    );

    panel.appendChild(oshiArea);


    /* =====================
       メモ
    ===================== */

    const memoInput = document.createElement("textarea");

    memoInput.rows = 3;
    memoInput.placeholder = "内容やメモ（任意）";

    if (editingRecord) {
        memoInput.value = editingRecord.memo || "";
    }

    createField("📝 メモ", memoInput);


    /* =====================
       推し活費か判定
    ===================== */

    function isOshiCategory(categoryId) {

        const category = categories.find(
            item => item.id === categoryId
        );

        return !!(
            category &&
            (
                category.scope === "oshi" ||
                category.id === "oshi" ||
                category.id === "expense_oshi"
            )
        );

    }


    function updateOshiArea() {

        const show =
            !isIncome &&
            isOshiCategory(categorySelect.value);

        oshiArea.style.display =
            show ? "block" : "none";

    }

    categorySelect.addEventListener(
        "change",
        updateOshiArea
    );

    updateOshiArea();


    /* =====================
       ボタン
    ===================== */

    const buttons = document.createElement("div");

    buttons.style.cssText = `
        display:flex;
        gap:10px;
        margin-top:20px;
    `;


    const cancelButton = document.createElement("button");

    cancelButton.type = "button";
    cancelButton.textContent = "キャンセル";

    cancelButton.style.cssText = `
        flex:1;
        padding:13px;
        border:1px solid #ddd;
        border-radius:10px;
        background:#f5f5f5;
        font-size:15px;
    `;

    cancelButton.onclick = () => overlay.remove();


    const saveButton = document.createElement("button");

    saveButton.type = "button";

    saveButton.textContent =
        editingRecord ? "変更を保存" : "登録する";

    saveButton.style.cssText = `
        flex:1;
        padding:13px;
        border:none;
        border-radius:10px;
        background:#e978a5;
        color:white;
        font-weight:bold;
        font-size:15px;
    `;


    /* =====================
       保存
    ===================== */

    saveButton.onclick = () => {

        const amount = Number(amountInput.value);

        if (!dateInput.value) {
            alert("日付を入力してください");
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            alert("金額を正しく入力してください");
            return;
        }

        if (!categorySelect.value) {
            alert("カテゴリを選択してください");
            return;
        }

        const oshiExpense =
            !isIncome &&
            isOshiCategory(categorySelect.value);

        if (oshiExpense && oshiList.length === 0) {
            alert("先に「推し」ページで推しを登録してください");
            return;
        }

        if (
            oshiExpense &&
            (!oshiSelect.value || !oshiCategorySelect.value)
        ) {
            alert("推しと内訳を選択してください");
            return;
        }


        /* =====================
           明細データ作成
        ===================== */

        const record = editingRecord
            ? {
                ...editingRecord,
                date: dateInput.value,
                type: type,
                amount: amount,
                categoryId: categorySelect.value,
                memo: memoInput.value.trim()
            }
            : {
                id: "money_" + Date.now(),
                date: dateInput.value,
                type: type,
                amount: amount,
                categoryId: categorySelect.value,
                memo: memoInput.value.trim(),
                createdAt: Date.now()
            };


        /* =====================
           推し活情報
        ===================== */

        if (oshiExpense) {

            record.oshiId = oshiSelect.value;

            record.oshiCategoryId =
                oshiCategorySelect.value;

        } else {

            delete record.oshiId;
            delete record.oshiCategoryId;

        }


        /* =====================
           保存
        ===================== */

        if (editingRecord) {

            const index = money.records.findIndex(
                item => item.id === recordId
            );

            if (index === -1) {
                alert("編集する明細が見つかりません");
                return;
            }

            money.records[index] = record;

        } else {

            money.records.push(record);

        }

        db.save(data);

        overlay.remove();

        loadMoneyPage();

        alert(
            editingRecord
                ? "変更しました！"
                : "登録しました！"
        );

    };


    buttons.append(cancelButton, saveButton);

    panel.appendChild(buttons);

    overlay.appendChild(panel);

    overlay.addEventListener("click", event => {

        if (event.target === overlay) {
            overlay.remove();
        }

    });

    document.body.appendChild(overlay);

}






function openMoneyBudgetSettings() {

    const data = db.load();

    if (!data.money) {
        data.money = {};
    }

    if (!data.money.monthlySettings) {
        data.money.monthlySettings = {};
    }

    const monthKey = getMoneyCurrentMonthKey();

    const currentBudget = getMoneyBudget(data, monthKey);

    const currentValue =
        currentBudget !== null &&
        currentBudget !== undefined
            ? currentBudget
            : "";

    const input = prompt(
        "今月の支出予算を入力してください。\n\n" +
        "例：200000\n\n" +
        "現在の予算：" +
        (currentValue !== ""
            ? Number(currentValue).toLocaleString("ja-JP") + "円"
            : "未設定"),
        currentValue
    );

    if (input === null) {
        return;
    }

    const normalizedInput =
        String(input).replace(/[,\s円￥¥]/g, "");

    if (
        normalizedInput === "" ||
        !/^\d+$/.test(normalizedInput)
    ) {
        alert("0以上の数字で入力してください。");
        return;
    }

    const budget = Number(normalizedInput);

    if (!Number.isSafeInteger(budget)) {
        alert("金額が大きすぎます。");
        return;
    }

    const oldSetting =
        data.money.monthlySettings[monthKey];

    if (
        oldSetting &&
        typeof oldSetting === "object"
    ) {

        data.money.monthlySettings[monthKey] = {
            ...oldSetting,
            budget: budget
        };

    } else {

        data.money.monthlySettings[monthKey] = {
            budget: budget
        };

    }

    db.save(data);

    renderMoneyPage();

    alert("今月の予算を保存しました。");
}






function openMoneyCategorySettings() {

    const data = db.load();

    if (!data.money) {
        data.money = {};
    }

    if (!Array.isArray(data.money.categories) ||
        data.money.categories.length === 0) {

        data.money.categories =
            createDefaultMoneyCategories();

        db.save(data);
    }

    const overlay = document.createElement("div");

    overlay.className = "money-category-overlay";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10001;
        background:rgba(0,0,0,.55);
        display:flex;
        justify-content:center;
        align-items:center;
        padding:16px;
        box-sizing:border-box;
    `;

    const panel = document.createElement("div");

    panel.style.cssText = `
        width:100%;
        max-width:460px;
        max-height:85vh;
        overflow-y:auto;
        background:white;
        color:#333;
        border-radius:18px;
        padding:20px;
        box-sizing:border-box;
    `;

    overlay.appendChild(panel);


    /* =====================
       推し活費の判定
    ===================== */

    function isOshiCategory(category) {

        return !!(
            category &&
            category.type === "expense" &&
            (
                category.scope === "oshi" ||
                category.id === "oshi" ||
                category.id === "expense_oshi" ||
                category.name === "推し活費"
            )
        );

    }


    /* =====================
       最新データ取得
    ===================== */

    function getLatestCategories() {

        const latestData = db.load();

        if (
            !latestData.money ||
            !Array.isArray(latestData.money.categories)
        ) {
            return [];
        }

        return latestData.money.categories;

    }


    /* =====================
       保存
    ===================== */

    function saveCategories(categories) {

        const saveData = db.load();

        if (!saveData.money) {
            saveData.money = {};
        }

        saveData.money.categories = categories;

        db.save(saveData);

        render();

        if (typeof loadMoneyPage === "function") {
            loadMoneyPage();
        }

    }


    /* =====================
       画面描画
    ===================== */

    function render() {

        const categories = getLatestCategories();

        panel.innerHTML = "";


        /* ヘッダー */

        const header = document.createElement("div");

        header.style.cssText = `
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:10px;
            margin-bottom:12px;
        `;

        const title = document.createElement("h3");

        title.textContent = "📂 家計簿カテゴリ管理";

        title.style.cssText = `
            margin:0;
            font-size:18px;
        `;

        const closeButton =
            document.createElement("button");

        closeButton.type = "button";
        closeButton.textContent = "✕";

        closeButton.style.cssText = `
            border:none;
            background:#f3f3f3;
            border-radius:50%;
            width:36px;
            height:36px;
            font-size:16px;
        `;

        closeButton.onclick = close;

        header.append(title, closeButton);

        panel.appendChild(header);


        /* 説明 */

        const description =
            document.createElement("p");

        description.textContent =
            "家計簿で使用する収入・支出カテゴリを管理します。";

        description.style.cssText = `
            font-size:13px;
            color:#777;
            line-height:1.6;
            margin:0 0 16px;
        `;

        panel.appendChild(description);


        /* 新規追加 */

        const addArea = document.createElement("div");

        addArea.style.cssText = `
            display:flex;
            gap:8px;
            margin-bottom:18px;
        `;

        function createAddButton(type, label) {

            const button =
                document.createElement("button");

            button.type = "button";
            button.textContent = label;

            button.style.cssText = `
                flex:1;
                padding:12px 6px;
                border:none;
                border-radius:10px;
                background:#e978a5;
                color:white;
                font-weight:bold;
                font-size:14px;
            `;

            button.onclick = () => {

                const name = prompt(
                    label + "のカテゴリ名を入力してください"
                );

                if (name === null) return;

                const trimmedName = name.trim();

                if (!trimmedName) {
                    alert("カテゴリ名を入力してください。");
                    return;
                }

                if (
                    type === "expense" &&
                    trimmedName === "推し活費"
                ) {
                    alert(
                        "推し活費は既に専用カテゴリがあります。\n" +
                        "重複して追加することはできません。"
                    );
                    return;
                }

                const latestCategories =
                    getLatestCategories();

                const duplicate =
                    latestCategories.some(category =>
                        category.type === type &&
                        category.name.trim() === trimmedName
                    );

                if (duplicate) {
                    alert("同じ名前のカテゴリが既にあります。");
                    return;
                }

                const icon = prompt(
                    "アイコンを入力してください。\n" +
                    "例：🍚 🧻 💡\n" +
                    "空欄の場合は 📦 になります。"
                );

                if (icon === null) return;

                latestCategories.push({

                    id: "money_category_" + Date.now(),

                    type: type,

                    name: trimmedName,

                    icon: icon.trim() || "📦",

                    scope: "household",

                    isDefault: false,

                    active: true

                });

                saveCategories(latestCategories);

            };

            return button;

        }

        addArea.append(
            createAddButton("income", "＋ 収入カテゴリ"),
            createAddButton("expense", "＋ 支出カテゴリ")
        );

        panel.appendChild(addArea);


        /* カテゴリ一覧 */

        function renderCategoryGroup(type, heading) {

            const section =
                document.createElement("section");

            section.style.marginBottom = "20px";

            const sectionTitle =
                document.createElement("h4");

            sectionTitle.textContent = heading;

            sectionTitle.style.cssText = `
                margin:12px 0;
                padding-bottom:8px;
                border-bottom:2px solid #f2d6e2;
                font-size:15px;
            `;

            section.appendChild(sectionTitle);

            const items = categories.filter(
                category => category.type === type
            );

            items.forEach(category => {

                const row = document.createElement("div");

                row.style.cssText = `
                    display:flex;
                    align-items:center;
                    flex-wrap:wrap;
                    gap:7px;
                    padding:11px 0;
                    border-bottom:1px solid #eee;
                `;

                const name =
                    document.createElement("div");

                name.textContent =
                    (category.icon || "📦") +
                    " " +
                    category.name;

                name.style.cssText = `
                    flex:1;
                    min-width:110px;
                    font-size:14px;
                    font-weight:bold;
                `;

                if (category.active === false) {
                    name.style.opacity = ".4";
                    name.style.textDecoration = "line-through";
                }

                const protectedCategory =
                    isOshiCategory(category);


                /* 推し活費の固定表示 */

                if (protectedCategory) {

                    const fixedLabel =
                        document.createElement("span");

                    fixedLabel.textContent = "固定";

                    fixedLabel.style.cssText = `
                        font-size:11px;
                        color:#c94c80;
                        background:#fff0f6;
                        padding:5px 8px;
                        border-radius:6px;
                    `;

                    row.append(name, fixedLabel);

                    section.appendChild(row);

                    return;

                }


                /* 編集 */

                const editButton =
                    document.createElement("button");

                editButton.type = "button";
                editButton.textContent = "編集";

                editButton.style.cssText = `
                    padding:7px 10px;
                    border:1px solid #e5a2bd;
                    border-radius:7px;
                    background:#fff5f9;
                    color:#c94c80;
                    font-size:12px;
                `;

                editButton.onclick = () => {

                    const newName = prompt(
                        "カテゴリ名を変更してください",
                        category.name
                    );

                    if (newName === null) return;

                    const trimmedName = newName.trim();

                    if (!trimmedName) {
                        alert("カテゴリ名を入力してください。");
                        return;
                    }

                    if (
                        type === "expense" &&
                        trimmedName === "推し活費"
                    ) {
                        alert(
                            "推し活費は専用カテゴリとして使用されています。"
                        );
                        return;
                    }

                    const latestCategories =
                        getLatestCategories();

                    const duplicate =
                        latestCategories.some(item =>
                            item.id !== category.id &&
                            item.type === type &&
                            item.name.trim() === trimmedName
                        );

                    if (duplicate) {
                        alert("同じ名前のカテゴリが既にあります。");
                        return;
                    }

                    const newIcon = prompt(
                        "アイコンを変更してください",
                        category.icon || "📦"
                    );

                    if (newIcon === null) return;

                    const target =
                        latestCategories.find(
                            item => item.id === category.id
                        );

                    if (!target) return;

                    target.name = trimmedName;

                    target.icon =
                        newIcon.trim() || "📦";

                    saveCategories(latestCategories);

                };


                /* 停止・再開 */

                const toggleButton =
                    document.createElement("button");

                toggleButton.type = "button";

                toggleButton.textContent =
                    category.active === false
                        ? "再開"
                        : "停止";

                toggleButton.style.cssText = `
                    padding:7px 10px;
                    border:1px solid #ddd;
                    border-radius:7px;
                    background:#f7f7f7;
                    color:#555;
                    font-size:12px;
                `;

                toggleButton.onclick = () => {

                    const latestCategories =
                        getLatestCategories();

                    const target =
                        latestCategories.find(
                            item => item.id === category.id
                        );

                    if (!target) return;

                    if (isOshiCategory(target)) {
                        alert("推し活費は停止できません。");
                        return;
                    }

                    target.active =
                        target.active === false;

                    saveCategories(latestCategories);

                };


                row.append(
                    name,
                    editButton,
                    toggleButton
                );

                section.appendChild(row);

            });


            if (items.length === 0) {

                const empty =
                    document.createElement("p");

                empty.textContent =
                    "カテゴリはありません。";

                empty.style.cssText = `
                    color:#999;
                    font-size:13px;
                    padding:10px 0;
                `;

                section.appendChild(empty);

            }

            panel.appendChild(section);

        }


        renderCategoryGroup("income", "💰 収入カテゴリ");

        renderCategoryGroup("expense", "💸 支出カテゴリ");

    }


    /* =====================
       閉じる
    ===================== */

    function close() {

        overlay.remove();

        if (typeof loadMoneyPage === "function") {
            loadMoneyPage();
        }

    }


    overlay.addEventListener("click", event => {

        if (event.target === overlay) {
            close();
        }

    });

    document.body.appendChild(overlay);

    render();

}






function openMoneyCarryoverSettings(){

    alert(
        "繰越金設定画面は次の段階で実装します。"
    );

}


/* =====================================================
   ⭐ 推し活予算
===================================================== */

function renderOshiMoneyBudget(data, monthKey) {

    const money = data.money || {};
    const records = money.records || [];
    const settings = money.monthlySettings || {};

    const setting = settings[monthKey];

    const budget =
        setting && typeof setting === "object" &&
        setting.oshiBudget !== undefined
            ? Number(setting.oshiBudget)
            : null;

    // 今月の推し活費だけを集計
    const used = records
.filter(record =>
    isOshiMoneyRecord(record, data) &&
    isMoneyExpense(record) &&
    isMoneyRecordInMonth(record, monthKey)
)

        .reduce((total, record) => {
            return total + getMoneyRecordAmount(record);
        }, 0);

    setMoneyText(
        "moneyOshiBudgetTotal",
        budget === null
            ? "未設定"
            : displayMoney(budget)
    );

    setMoneyText(
        "moneyOshiBudgetUsed",
        displayMoney(used)
    );

    const remaining =
        budget === null ? null : budget - used;

    setMoneyText(
        "moneyOshiBudgetRemaining",
        remaining === null
            ? "-"
            : displayMoney(remaining)
    );

    const percent =
        budget === null || budget === 0
            ? 0
            : Math.round(used / budget * 100);

    const progress =
        document.getElementById("moneyOshiBudgetProgress");

    if (progress) {
        progress.style.width =
            Math.min(percent, 100) + "%";
    }

    setMoneyText(
        "moneyOshiBudgetPercent",
        budget === null
            ? "予算未設定"
            : `予算の${percent}%を使用`
    );
}


/* =====================================================
   ⭐ 推し活予算設定
===================================================== */

function openOshiMoneyBudgetSettings() {

    const data = db.load();

    if (!data.money) {
        data.money = {};
    }

    if (!data.money.monthlySettings) {
        data.money.monthlySettings = {};
    }

    const monthKey = getMoneyCurrentMonthKey();

    const oldSetting =
        data.money.monthlySettings[monthKey];

    const currentBudget =
        oldSetting && typeof oldSetting === "object"
            ? oldSetting.oshiBudget
            : undefined;

    const input = prompt(
        "今月の推し活予算を入力してください。\n\n" +
        "例：30000\n\n" +
        "現在の予算：" +
        (currentBudget !== undefined
            ? Number(currentBudget).toLocaleString("ja-JP") + "円"
            : "未設定"),
        currentBudget !== undefined
            ? String(currentBudget)
            : ""
    );

    if (input === null) {
        return;
    }

    const normalizedInput =
        String(input).replace(/[,\s円￥¥]/g, "");

    if (
        normalizedInput === "" ||
        !/^\d+$/.test(normalizedInput)
    ) {
        alert("0以上の数字で入力してください。");
        return;
    }

    const budget = Number(normalizedInput);

    if (!Number.isSafeInteger(budget)) {
        alert("金額が大きすぎます。");
        return;
    }

    let setting = {};

    if (oldSetting && typeof oldSetting === "object") {
        setting = { ...oldSetting };
    } else if (
        typeof oldSetting === "number" &&
        Number.isFinite(oldSetting)
    ) {
        // 以前の家計予算をそのまま引き継ぐ
        setting.budget = oldSetting;
    }

    setting.oshiBudget = budget;

    data.money.monthlySettings[monthKey] = setting;

    db.save(data);

    renderMoneyPage();

    alert("推し活予算を保存しました。");
}




/* =====================================================
   💰 予算使用率の警告表示
===================================================== */

function applyMoneyBudgetStatus() {

    const budgetTypes = [
        {
            total: "moneyBudgetTotal",
            used: "moneyBudgetUsed",
            remaining: "moneyBudgetRemaining",
            progress: "moneyBudgetProgress",
            percent: "moneyBudgetPercent"
        },
        {
            total: "moneyOshiBudgetTotal",
            used: "moneyOshiBudgetUsed",
            remaining: "moneyOshiBudgetRemaining",
            progress: "moneyOshiBudgetProgress",
            percent: "moneyOshiBudgetPercent"
        }
    ];

    budgetTypes.forEach(ids => {

        const totalEl = document.getElementById(ids.total);
        const usedEl = document.getElementById(ids.used);
        const remainingEl = document.getElementById(ids.remaining);
        const progressEl = document.getElementById(ids.progress);
        const percentEl = document.getElementById(ids.percent);

        if (!totalEl || !usedEl || !percentEl) return;

        const total = Number(
            totalEl.textContent.replace(/[^\d.-]/g, "")
        );

        const used = Number(
            usedEl.textContent.replace(/[^\d.-]/g, "")
        );

        // 初期状態に戻す
        percentEl.style.color = "";
        percentEl.style.fontWeight = "";

        if (remainingEl) {
            remainingEl.style.color = "";
        }

        if (progressEl) {
            progressEl.style.backgroundColor = "";
        }

        // 予算未設定
        if (!Number.isFinite(total) || total <= 0) return;

        const rate = used / total * 100;

        if (rate > 100) {

            percentEl.textContent =
                Math.floor(rate) + "% ⚠ 予算オーバー";

            percentEl.style.color = "#dc3545";
            percentEl.style.fontWeight = "bold";

            if (remainingEl) {
                remainingEl.style.color = "#dc3545";
            }

            if (progressEl) {
                progressEl.style.backgroundColor = "#dc3545";
            }

        } else if (rate >= 80) {

            percentEl.textContent =
                Math.floor(rate) + "% ⚠ 予算に注意";

            percentEl.style.color = "#e69500";
            percentEl.style.fontWeight = "bold";

            if (progressEl) {
                progressEl.style.backgroundColor = "#e69500";
            }
        }
    });
}



/* =====================================================
   💰 家計明細一覧
===================================================== */


/* =====================================================
   💰 家計明細一覧・絞り込み
===================================================== */

function openMoneyRecordList() {

    const data = db.load();

    const money = data.money || {};

    const records = Array.isArray(money.records)
        ? money.records
        : [];

    const categories = Array.isArray(money.categories)
        ? money.categories
        : [];

    const old = document.querySelector(
        ".money-list-overlay"
    );

    if (old) old.remove();


    /* =====================
       オーバーレイ
    ===================== */

    const overlay = document.createElement("div");

    overlay.className = "money-list-overlay";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10001;
        background:rgba(0,0,0,.5);
        display:flex;
        justify-content:center;
        align-items:center;
        padding:12px;
        box-sizing:border-box;
    `;


    const panel = document.createElement("div");

    panel.style.cssText = `
        width:100%;
        max-width:520px;
        max-height:90vh;
        overflow-y:auto;
        background:white;
        color:#333;
        border-radius:18px;
        padding:18px;
        box-sizing:border-box;
    `;


    /* =====================
       ヘッダー
    ===================== */

    const header = document.createElement("div");

    header.style.cssText = `
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:16px;
    `;

    const heading = document.createElement("h2");

    heading.textContent = "💰 家計明細";

    heading.style.margin = "0";

    const closeButton = document.createElement("button");

    closeButton.type = "button";
    closeButton.textContent = "閉じる";

    closeButton.onclick = () => overlay.remove();

    header.append(heading, closeButton);

    panel.appendChild(header);


    /* =====================
       絞り込みエリア
    ===================== */

    const filterArea = document.createElement("div");

    filterArea.style.cssText = `
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
        padding:12px;
        margin-bottom:14px;
        background:#fff5f9;
        border-radius:12px;
    `;


    function createFilter(labelText, options) {

        const wrapper = document.createElement("label");

        wrapper.style.cssText = `
            display:block;
            min-width:0;
            font-size:13px;
            font-weight:bold;
        `;

        const label = document.createElement("div");

        label.textContent = labelText;

        label.style.marginBottom = "5px";

        const select = document.createElement("select");

        select.style.cssText = `
            width:100%;
            min-height:40px;
            padding:7px;
            border:1px solid #ddd;
            border-radius:8px;
            background:white;
            color:#333;
            font-size:14px;
            box-sizing:border-box;
        `;

        options.forEach(item => {

            const option = document.createElement("option");

            option.value = item.value;
            option.textContent = item.label;

            select.appendChild(option);

        });

        wrapper.append(label, select);

        filterArea.appendChild(wrapper);

        return select;
    }


    /* 期間 */

    const periodSelect = createFilter(
        "📅 期間",
        [
            { value: "month", label: "今月" },
            { value: "lastMonth", label: "先月" },
            { value: "year", label: "今年" },
            { value: "all", label: "すべて" }
        ]
    );


    /* 種類 */

    const typeSelect = createFilter(
        "📂 種類",
        [
            { value: "all", label: "すべて" },
            { value: "income", label: "収入" },
            { value: "expense", label: "支出" }
        ]
    );


    /* カテゴリ */

    const categoryOptions = [
        { value: "all", label: "すべて" }
    ];

    categories.forEach(category => {

        if (!category.id) return;

        categoryOptions.push({
            value: category.id,
            label:
                (category.icon || "") +
                " " +
                category.name
        });

    });

    const categorySelect = createFilter(
        "🏷 カテゴリ",
        categoryOptions
    );


    /* 並び順 */

    const sortSelect = createFilter(
        "↕ 並び順",
        [
            { value: "new", label: "新しい順" },
            { value: "old", label: "古い順" }
        ]
    );

    panel.appendChild(filterArea);


    /* =====================
       集計表示
    ===================== */

    const summary = document.createElement("div");

    summary.style.cssText = `
        padding:12px;
        background:#fff5f9;
        border-radius:10px;
        margin-bottom:14px;
        line-height:1.8;
        font-size:14px;
    `;

    panel.appendChild(summary);


    /* =====================
       明細一覧
    ===================== */

    const list = document.createElement("div");

    panel.appendChild(list);


    /* =====================
       絞り込み・表示
    ===================== */

    function renderList() {

        list.innerHTML = "";

        const now = new Date();

        const currentYear = now.getFullYear();

        const currentMonth =
            String(now.getMonth() + 1).padStart(2, "0");

        const currentPeriod =
            currentYear + "-" + currentMonth;

        const previousDate = new Date(
            currentYear,
            now.getMonth() - 1,
            1
        );

        const previousPeriod =
            previousDate.getFullYear() + "-" +
            String(previousDate.getMonth() + 1).padStart(2, "0");


        /* =====================
           条件で絞り込み
        ===================== */

        let filtered = records.filter(record => {

            const date = String(
                getMoneyRecordDate(record) || ""
            );

            const recordPeriod = date.slice(0, 7);

            const recordYear = date.slice(0, 4);


            /* 期間 */

            if (
                periodSelect.value === "month" &&
                recordPeriod !== currentPeriod
            ) {
                return false;
            }

            if (
                periodSelect.value === "lastMonth" &&
                recordPeriod !== previousPeriod
            ) {
                return false;
            }

            if (
                periodSelect.value === "year" &&
                recordYear !== String(currentYear)
            ) {
                return false;
            }


            /* 収入・支出 */

            if (
                typeSelect.value === "income" &&
                !isMoneyIncome(record)
            ) {
                return false;
            }

            if (
                typeSelect.value === "expense" &&
                isMoneyIncome(record)
            ) {
                return false;
            }


            /* カテゴリ */

            if (
                categorySelect.value !== "all" &&
                record.categoryId !== categorySelect.value
            ) {
                return false;
            }

            return true;

        });


        /* =====================
           並び順
        ===================== */

        filtered.sort((a, b) => {

            const dateA = String(
                getMoneyRecordDate(a) || ""
            );

            const dateB = String(
                getMoneyRecordDate(b) || ""
            );

            if (sortSelect.value === "old") {
                return dateA.localeCompare(dateB);
            }

            return dateB.localeCompare(dateA);

        });


        /* =====================
           絞り込み後の集計
        ===================== */

        const income = filtered
            .filter(isMoneyIncome)
            .reduce((sum, record) =>
                sum + getMoneyRecordAmount(record), 0);

        const expense = filtered
            .filter(record => !isMoneyIncome(record))
            .reduce((sum, record) =>
                sum + getMoneyRecordAmount(record), 0);

        const balance = income - expense;

        summary.textContent =
            "表示件数：" + filtered.length + "件\n" +
            "収入合計：" + displayMoney(income) + "\n" +
            "支出合計：" + displayMoney(expense) + "\n" +
            "収支：" + (balance >= 0 ? "+" : "") +
            displayMoney(balance);

        summary.style.whiteSpace = "pre-line";


        /* =====================
           明細がない場合
        ===================== */

        if (filtered.length === 0) {

            const empty = document.createElement("div");

            empty.textContent =
                "該当する明細はありません";

            empty.style.cssText = `
                padding:25px 10px;
                text-align:center;
                color:#888;
            `;

            list.appendChild(empty);

            return;
        }


        /* =====================
           明細表示
        ===================== */

        filtered.forEach(record => {

            const row = document.createElement("div");

            row.style.cssText = `
                padding:13px 0;
                border-bottom:1px solid #eee;
            `;


            const title = document.createElement("strong");

            title.textContent =
                getMoneyCategoryName(record, data);


            const date = document.createElement("div");

            date.textContent =
                formatMoneyDate(getMoneyRecordDate(record));

            date.style.cssText = `
                color:#888;
                font-size:12px;
                margin-top:4px;
            `;


            const amount = document.createElement("strong");

            amount.textContent =
                (isMoneyIncome(record) ? "+" : "-") +
                displayMoney(getMoneyRecordAmount(record));

            amount.style.cssText = `
                display:block;
                margin-top:5px;
            `;


            const memo = document.createElement("div");

            memo.textContent = record.memo || "";

            memo.style.cssText = `
                font-size:13px;
                margin-top:4px;
                color:#666;
                white-space:pre-wrap;
            `;


            /* =====================
               編集・削除ボタン
            ===================== */

            const actions = document.createElement("div");

            actions.style.cssText = `
                display:flex;
                justify-content:flex-end;
                gap:8px;
                margin-top:10px;
            `;


            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.textContent = "編集";

            editButton.onclick = () => {

                overlay.remove();

                openMoneyRecordForm(
                    record.type,
                    record.id
                );

            };


            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "削除";

            deleteButton.style.color = "#dc3545";

            deleteButton.onclick = () => {

                if (!confirm(
                    "この明細を削除しますか？"
                )) {
                    return;
                }

                const latest = db.load();

                if (
                    !latest.money ||
                    !Array.isArray(latest.money.records)
                ) {
                    alert("明細データが見つかりません");
                    return;
                }

                latest.money.records =
                    latest.money.records.filter(
                        item => item.id !== record.id
                    );

                db.save(latest);

                overlay.remove();

                loadMoneyPage();

                openMoneyRecordList();

            };

            actions.append(editButton, deleteButton);

            row.append(
                title,
                date,
                amount,
                memo,
                actions
            );

            list.appendChild(row);

        });

    }


    /* =====================
       絞り込み変更時に再表示
    ===================== */

    periodSelect.addEventListener("change", renderList);

    typeSelect.addEventListener("change", renderList);

    categorySelect.addEventListener("change", renderList);

    sortSelect.addEventListener("change", renderList);


    /* =====================
       表示
    ===================== */

    renderList();

    overlay.appendChild(panel);

    overlay.addEventListener("click", event => {

        if (event.target === overlay) {
            overlay.remove();
        }

    });

    document.body.appendChild(overlay);

}
