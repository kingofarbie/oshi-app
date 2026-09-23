/* =====================================================
   👶 子ども 成長・定期記録
   calendar-children-details.js

   ・身長・体重
   ・予防接種
   ・健診・病院
   ・成長・できたこと

   ※ 子どもごとに完全分離
   ※ 年齢は保存せず、誕生日＋記録日から自動計算
   ※ 同日複数記録に対応
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

       recordedAt が新しいものを最新とする。
       古いデータで recordedAt が無い場合は
       date を代用する。
    ------------------------------------------------- */

    const sortedRecords =
        [...records].sort(
            (a, b) => {

                const aTime =
                    a.recordedAt
                        ? new Date(a.recordedAt).getTime()
                        : new Date(
                            `${a.date}T00:00:00`
                        ).getTime();

                const bTime =
                    b.recordedAt
                        ? new Date(b.recordedAt).getTime()
                        : new Date(
                            `${b.date}T00:00:00`
                        ).getTime();

                return bTime - aTime;

            }
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


                                /* ---------------------------------
                                   記録日時

                                   date      → 記録した日
                                   recordedAt → 実際の記録日時

                                   同じ日でも recordedAt が違うので
                                   最新の記録を正確に判定できる。
                                --------------------------------- */

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


                                const recordedAt =
                                    now.toISOString();


                                /*
                                   成長記録を追加
                                */

                                child.growth.heightWeight.push({

                                    id:
                                        "growth-" +
                                        Date.now(),

                                    date:
                                        date,

                                    recordedAt:
                                        recordedAt,

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
                                   再描画
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


    /* =================================================
       履歴を新しい順に並べる
    ================================================= */

    const records =
        [...child.growth.heightWeight]
            .sort(
                (a, b) => {

                    const aTime =
                        a.recordedAt
                            ? new Date(
                                a.recordedAt
                            ).getTime()
                            : new Date(
                                `${a.date}T00:00:00`
                            ).getTime();

                    const bTime =
                        b.recordedAt
                            ? new Date(
                                b.recordedAt
                            ).getTime()
                            : new Date(
                                `${b.date}T00:00:00`
                            ).getTime();

                    return bTime - aTime;

                }
            );


    /* =================================================
       記録なし
    ================================================= */

    if (!records.length) {

        list.innerHTML = `
            <div class="children-growth-empty">
                まだ記録がありません。
            </div>
        `;

        return;

    }


    /* =================================================
       履歴表示
    ================================================= */

    list.innerHTML =
        records
            .map(
                record => {

                    const age =
                        calculateChildrenAgeAtDate(
                            child.birthday,
                            record.date
                        );


                    const recordedTime =
                        record.recordedAt
                            ? new Date(
                                record.recordedAt
                            )
                            : null;


                    const timeText =
                        recordedTime
                            ? recordedTime
                                .toLocaleTimeString(
                                    "ja-JP",
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    }
                                )
                            : "";


                    return `

                        <div
                            class="children-height-weight-history-item"
                            data-growth-id="${record.id}"
                        >

                            <div
                                class="children-height-weight-history-date"
                            >
                                ${record.date}
                                ${
                                    timeText
                                        ? ` ${timeText}`
                                        : ""
                                }
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


                            <div
                                class="children-height-weight-history-actions"
                            >

                                <button
                                    type="button"
                                    class="children-height-weight-edit"
                                    data-growth-action="edit"
                                    data-growth-id="${record.id}"
                                >
                                    編集
                                </button>

                                <button
                                    type="button"
                                    class="children-height-weight-delete"
                                    data-growth-action="delete"
                                    data-growth-id="${record.id}"
                                >
                                    削除
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    /* =================================================
       編集・削除ボタン
    ================================================= */

    list
        .querySelectorAll(
            "[data-growth-action]"
        )
        .forEach(
            button => {

                button.onclick =
                    function () {

                        const action =
                            this.dataset.growthAction;

                        const growthId =
                            this.dataset.growthId;


                        const recordIndex =
                            child.growth.heightWeight
                                .findIndex(
                                    item =>
                                        item.id ===
                                        growthId
                                );


                        if (
                            recordIndex < 0
                        ) {

                            return;

                        }


                        const record =
                            child.growth.heightWeight[
                                recordIndex
                            ];


                        /* =================================
                           削除
                        ================================= */

                        if (
                            action ===
                            "delete"
                        ) {

                            const confirmed =
                                window.confirm(
                                    "この身長・体重の記録を削除しますか？"
                                );


                            if (!confirmed) {

                                return;

                            }


                            child.growth.heightWeight
                                .splice(
                                    recordIndex,
                                    1
                                );


                            saveChildrenGrowthData();


                            renderChildrenHeightWeight();


                            return;

                        }


                        /* =================================
                           編集
                        ================================= */

                        if (
                            action ===
                            "edit"
                        ) {

                            /*
                               身長
                            */

                            const heightInput =
                                document.createElement(
                                    "input"
                                );

                            heightInput.type =
                                "number";

                            heightInput.value =
                                record.height;


                            openNumberInputModal(

                                heightInput,

                                "身長（cm）を編集",

                                true,

                                "number",

                                function () {

                                    const height =
                                        Number(
                                            heightInput.value
                                        );


                                    if (
                                        !Number.isFinite(
                                            height
                                        ) ||
                                        height <= 0
                                    ) {

                                        return;

                                    }


                                    /*
                                       体重
                                    */

                                    const weightInput =
                                        document.createElement(
                                            "input"
                                        );

                                    weightInput.type =
                                        "number";

                                    weightInput.value =
                                        record.weight;


                                    openNumberInputModal(

                                        weightInput,

                                        "体重（kg）を編集",

                                        true,

                                        "number",

                                        function () {

                                            const weight =
                                                Number(
                                                    weightInput.value
                                                );


                                            if (
                                                !Number.isFinite(
                                                    weight
                                                ) ||
                                                weight <= 0
                                            ) {

                                                return;

                                            }


                                            /*
                                               記録内容を更新
                                            */

                                            record.height =
                                                height;

                                            record.weight =
                                                weight;


                                            /*
                                               recordedAt は
                                               編集した時刻に
                                               変更しない。

                                               元の記録日時を
                                               維持する。
                                            */


                                            saveChildrenGrowthData();


                                            renderChildrenHeightWeight();

                                        }

                                    );

                                }

                            );

                        }

                    };

            }
        );

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