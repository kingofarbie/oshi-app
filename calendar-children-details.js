/* =====================================================
   👶 子ども 成長・定期記録
   calendar-children-details.js

   ・身長・体重
   ・予防接種
   ・健診・病院
   ・成長・できたこと

   ※ 子どもごとに完全分離
   ※ 年齢は保存せず、誕生日＋記録日から自動計算
===================================================== */


/* =====================================================
   👶 成長データ初期化
===================================================== */

function initializeChildrenGrowthData(child) {

    if (!child) return;

    if (!child.growth) {

        child.growth = {};

    }

    if (!Array.isArray(child.growth.heightWeight)) {

        child.growth.heightWeight = [];

    }

    if (!Array.isArray(child.growth.vaccination)) {

        child.growth.vaccination = [];

    }

    if (!Array.isArray(child.growth.medical)) {

        child.growth.medical = [];

    }

    if (!Array.isArray(child.growth.milestone)) {

        child.growth.milestone = [];

    }

}


/* =====================================================
   👶 選択中の子どもの成長データ
===================================================== */

function getChildrenGrowthData() {

    const child =
        typeof getSelectedChild === "function"
            ? getSelectedChild()
            : null;

    if (!child) {

        return null;

    }

    initializeChildrenGrowthData(child);

    return child.growth;

}


/* =====================================================
   👶 記録時点の年齢
===================================================== */

function calculateChildrenAgeAtDate(
    birthday,
    recordDate
) {

    if (!birthday || !recordDate) {

        return "";

    }

    const birth =
        parseDateOnly(birthday);

    const record =
        parseDateOnly(recordDate);

    if (!birth || !record) {

        return "";

    }

    if (record < birth) {

        return "";

    }

    let years =
        record.getFullYear() -
        birth.getFullYear();

    let months =
        record.getMonth() -
        birth.getMonth();

    const days =
        record.getDate() -
        birth.getDate();

    if (days < 0) {

        months--;

    }

    if (months < 0) {

        years--;
        months += 12;

    }

    if (years < 0) {

        return "";

    }

    return `${years}歳${months}ヶ月`;

}


/* =====================================================
   👶 成長データ保存
===================================================== */

function saveChildrenGrowthData() {

    if (
        typeof saveChildrenData ===
        "function"
    ) {

        saveChildrenData();

    }

}


/* =====================================================
   👶 成長カテゴリー名
===================================================== */

const CHILDREN_GROWTH_CATEGORY_NAMES = {

    heightWeight:
        "⚖️ 身長・体重",

    vaccination:
        "💉 予防接種",

    medical:
        "🏥 健診・病院",

    milestone:
        "🌱 成長・できたこと"

};


/* =====================================================
   ⚖️ 身長・体重画面を開く
===================================================== */

function openChildrenHeightWeight() {

    const growthSection =
        document.getElementById(
            "childrenGrowthSection"
        );

    if (!growthSection) return;


    const categoryList =
        growthSection.querySelector(
            ".children-growth-category-list"
        );

    if (categoryList) {

        categoryList.style.display =
            "none";

    }


    let heightWeightSection =
        document.getElementById(
            "childrenHeightWeightSection"
        );


    if (!heightWeightSection) {

        heightWeightSection =
            document.createElement("div");

        heightWeightSection.id =
            "childrenHeightWeightSection";

        heightWeightSection.className =
            "children-height-weight-section";

        growthSection.appendChild(
            heightWeightSection
        );

    }


    heightWeightSection.style.display =
        "";


    renderChildrenHeightWeight();

}


/* =====================================================
   ⚖️ 身長・体重画面
   ※ 追加処理もこの関数内で完結
===================================================== */

function renderChildrenHeightWeight() {

    const section =
        document.getElementById(
            "childrenHeightWeightSection"
        );

    const child =
        typeof getSelectedChild === "function"
            ? getSelectedChild()
            : null;

    if (!section || !child) return;


    initializeChildrenGrowthData(child);


    const records =
        child.growth.heightWeight || [];


    /* -------------------------------------------------
       最新記録
    ------------------------------------------------- */

    const sortedRecords =
        [...records].sort(
            (a, b) =>
                String(b.date)
                    .localeCompare(
                        String(a.date)
                    )
        );


    const latestRecord =
        sortedRecords[0] || null;


    const latestHeight =
        latestRecord &&
        latestRecord.height != null
            ? latestRecord.height
            : "--";


    const latestWeight =
        latestRecord &&
        latestRecord.weight != null
            ? latestRecord.weight
            : "--";


    /* -------------------------------------------------
       画面HTML
    ------------------------------------------------- */

    section.innerHTML = `

        <div class="children-growth-detail-header">

            <button
                type="button"
                class="children-growth-detail-back"
                id="childrenHeightWeightBackButton"
            >
                ◀ 成長・定期記録
            </button>

            <div class="children-growth-detail-title">
                ⚖️ 身長・体重
            </div>

        </div>


        <!-- =========================================
             最新の記録
        ========================================== -->

        <div class="children-height-weight-latest">

            <div class="children-height-weight-latest-title">
                最新の記録
            </div>

            <div class="children-height-weight-latest-values">

                <div class="children-height-weight-value">

                    <span>
                        身長
                    </span>

                    <strong>
                        ${latestHeight}
                    </strong>

                    <small>
                        cm
                    </small>

                </div>


                <div class="children-height-weight-value">

                    <span>
                        体重
                    </span>

                    <strong>
                        ${latestWeight}
                    </strong>

                    <small>
                        kg
                    </small>

                </div>

            </div>


            ${
                latestRecord
                    ? `
                        <div class="children-height-weight-latest-date">
                            ${latestRecord.date}
                        </div>
                    `
                    : ""
            }

        </div>


        <!-- =========================================
             身長・体重追加
        ========================================== -->

        <button
            type="button"
            class="children-height-weight-add"
            id="childrenHeightWeightAddButton"
        >
            ＋ 身長・体重を記録
        </button>


        <!-- =========================================
             履歴
        ========================================== -->

        <div class="children-height-weight-history">

            <div class="children-height-weight-history-title">
                記録履歴
            </div>

            <div
                id="childrenHeightWeightHistoryList"
            ></div>

        </div>

    `;


    /* =================================================
       ◀ 成長・定期記録へ戻る
    ================================================= */

    const backButton =
        document.getElementById(
            "childrenHeightWeightBackButton"
        );


    if (backButton) {

        backButton.onclick =
            closeChildrenHeightWeight;

    }


    /* =================================================
       ＋ 身長・体重を記録
       ※ 別関数にはしない
    ================================================= */

    const addButton =
        document.getElementById(
            "childrenHeightWeightAddButton"
        );


    if (addButton) {

        addButton.onclick =
            function () {

                /*
                   身長入力
                */

                const heightInput =
                    document.createElement("input");

                heightInput.type =
                    "number";


                openNumberInputModal(

                    heightInput,

                    "身長（cm）",

                    true,

                    "number",

                    function () {

                        const height =
                            Number(
                                heightInput.value
                            );


                        if (
                            !Number.isFinite(height) ||
                            height <= 0
                        ) {

                            return;

                        }


                        /*
                           体重入力
                        */

                        const weightInput =
                            document.createElement("input");

                        weightInput.type =
                            "number";


                        openNumberInputModal(

                            weightInput,

                            "体重（kg）",

                            true,

                            "number",

                            function () {

                                const weight =
                                    Number(
                                        weightInput.value
                                    );


                                if (
                                    !Number.isFinite(weight) ||
                                    weight <= 0
                                ) {

                                    return;

                                }


                                /*
                                   記録日
                                   現段階では今日
                                */

                                const now =
                                    new Date();


                                const date =
                                    now.getFullYear() +
                                    "-" +
                                    String(
                                        now.getMonth() + 1
                                    ).padStart(2, "0") +
                                    "-" +
                                    String(
                                        now.getDate()
                                    ).padStart(2, "0");


                                /*
                                   成長記録を保存
                                */

                                child.growth.heightWeight.push({

                                    id:
                                        "growth-" +
                                        Date.now(),

                                    date:
                                        date,

                                    height:
                                        height,

                                    weight:
                                        weight

                                });


                                /*
                                   保存
                                */

                                saveChildrenGrowthData();


                                /*
                                   画面を再描画
                                */

                                renderChildrenHeightWeight();

                            }

                        );

                    }

                );

            };

    }


    /* =================================================
       履歴表示
    ================================================= */

    renderChildrenHeightWeightHistory();

}


/* =====================================================
   ⚖️ 身長・体重画面を閉じる
===================================================== */

function closeChildrenHeightWeight() {

    const section =
        document.getElementById(
            "childrenHeightWeightSection"
        );

    const categoryList =
        document.querySelector(
            "#childrenGrowthSection .children-growth-category-list"
        );


    if (section) {

        section.style.display =
            "none";

    }


    if (categoryList) {

        categoryList.style.display =
            "";

    }

}


/* =====================================================
   ⚖️ 身長・体重 履歴
===================================================== */

function renderChildrenHeightWeightHistory() {

    const list =
        document.getElementById(
            "childrenHeightWeightHistoryList"
        );

    const child =
        typeof getSelectedChild === "function"
            ? getSelectedChild()
            : null;


    if (!list || !child) return;


    initializeChildrenGrowthData(child);


    const records =
        [...child.growth.heightWeight]
            .sort(
                (a, b) =>
                    String(b.date)
                        .localeCompare(
                            String(a.date)
                        )
            );


    if (!records.length) {

        list.innerHTML = `
            <div class="children-growth-empty">
                まだ記録がありません。
            </div>
        `;

        return;

    }


    list.innerHTML =
        records
            .map(
                record => {

                    const age =
                        calculateChildrenAgeAtDate(
                            child.birthday,
                            record.date
                        );


                    return `

                        <div
                            class="children-height-weight-history-item"
                        >

                            <div
                                class="children-height-weight-history-date"
                            >
                                ${record.date}
                            </div>


                            <div
                                class="children-height-weight-history-age"
                            >
                                ${age}
                            </div>


                            <div
                                class="children-height-weight-history-values"
                            >

                                <span>
                                    身長
                                    <strong>
                                        ${record.height ?? "--"}
                                    </strong>
                                    cm
                                </span>


                                <span>
                                    体重
                                    <strong>
                                        ${record.weight ?? "--"}
                                    </strong>
                                    kg
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   👶 成長カテゴリークリック
===================================================== */

if (!window.childrenGrowthDetailsInitialized) {

    window.childrenGrowthDetailsInitialized =
        true;


    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".children-growth-category"
                );


            if (!button) return;


            const category =
                button.dataset.growthCategory;


            if (category === "heightWeight") {

                openChildrenHeightWeight();

            }

        }
    );

}