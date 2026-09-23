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


    /* =================================================
       最新記録

       「記録日」が新しいものを最新とする。

       date は YYYY-MM-DD 形式なので、
       Date変換せず文字列として比較する。

       同じ記録日の場合だけ
       recordedAt（実際の入力日時）で比較する。
    ================================================= */

    const sortedRecords =
        [...records].sort(
            (a, b) => {

                const aDate =
                    String(a.date || "");

                const bDate =
                    String(b.date || "");


                /*
                   記録日が違う場合
                   → 記録日が新しいものを上
                */

                if (aDate !== bDate) {

                    return bDate.localeCompare(
                        aDate
                    );

                }


                /*
                   同じ記録日の場合だけ
                   → 入力日時が新しいものを上
                */

                const aRecordedAt =
                    a.recordedAt
                        ? new Date(
                            a.recordedAt
                        ).getTime()
                        : 0;

                const bRecordedAt =
                    b.recordedAt
                        ? new Date(
                            b.recordedAt
                        ).getTime()
                        : 0;


                return bRecordedAt - aRecordedAt;

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


    /* =================================================
       今日の日付
    ================================================= */

    const now =
        new Date();

    const today =
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0");


    /* =================================================
       画面HTML
    ================================================= */

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

        <div class="children-height-weight-add-area">

            <div class="children-height-weight-record-date">

                <label
                    for="childrenHeightWeightRecordDate"
                >
                    記録日
                </label>

                <input
                    type="date"
                    id="childrenHeightWeightRecordDate"
                    value="${today}"
                >

            </div>


            <button
                type="button"
                class="children-height-weight-add"
                id="childrenHeightWeightAddButton"
            >
                ＋ 身長・体重を記録
            </button>

        </div>



        <button
    type="button"
    class="children-height-weight-graph-open"
    id="childrenHeightWeightGraphOpenButton"
>
    📈 推移グラフを見る
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

                const dateInput =
                    document.getElementById(
                        "childrenHeightWeightRecordDate"
                    );


                const selectedDate =
                    dateInput
                        ? dateInput.value
                        : "";


                /*
                   日付未選択
                */

                if (!selectedDate) {

                    alert(
                        "記録日を選択してください。"
                    );

                    return;

                }


                /*
                   誕生日より前の日付は不可
                */

                if (
                    child.birthday &&
                    selectedDate <
                    child.birthday
                ) {

                    alert(
                        "誕生日より前の日付は記録できません。"
                    );

                    return;

                }


                /* ---------------------------------
                   身長入力
                --------------------------------- */

                const heightInput =
                    document.createElement(
                        "input"
                    );

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
                            !Number.isFinite(
                                height
                            ) ||
                            height <= 0
                        ) {

                            return;

                        }


                        /* ---------------------------------
                           体重入力
                        --------------------------------- */

                        const weightInput =
                            document.createElement(
                                "input"
                            );

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
                                    !Number.isFinite(
                                        weight
                                    ) ||
                                    weight <= 0
                                ) {

                                    return;

                                }


                                /* ---------------------------------
                                   入力した実際の日時
                                --------------------------------- */

                                const recordedAt =
                                    new Date()
                                        .toISOString();


                                /* ---------------------------------
                                   成長記録追加

                                   date
                                   → 選択した記録日

                                   recordedAt
                                   → 実際に入力した日時
                                --------------------------------- */

                                child.growth.heightWeight.push({

                                    id:
                                        "growth-" +
                                        Date.now(),

                                    date:
                                        selectedDate,

                                    recordedAt:
                                        recordedAt,

                                    height:
                                        height,

                                    weight:
                                        weight

                                });


                                /* ---------------------------------
                                   保存
                                --------------------------------- */

                                saveChildrenGrowthData();


                                /* ---------------------------------
                                   再描画
                                --------------------------------- */

                                renderChildrenHeightWeight();

                            }

                        );

                    }

                );

            };

    }


    const graphOpenButton =
    document.getElementById(
        "childrenHeightWeightGraphOpenButton"
    );


if (graphOpenButton) {

    graphOpenButton.onclick =
        openChildrenHeightWeightGraph;

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


/* =====================================================
   📈 身長・体重 推移グラフ
===================================================== */


/* =====================================================
   📈 グラフ画面を開く
===================================================== */

function openChildrenHeightWeightGraph() {

    const heightWeightSection =
        document.getElementById(
            "childrenHeightWeightSection"
        );

    if (!heightWeightSection) return;


    /*
       履歴などを隠す
    */

    const children =
        heightWeightSection.children;


    Array.from(children)
        .forEach(
            element => {

                /*
                   詳細グラフ自身は残す
                */

                if (
                    element.id ===
                    "childrenHeightWeightGraphSection"
                ) {

                    return;

                }

                element.style.display =
                    "none";

            }
        );


    let graphSection =
        document.getElementById(
            "childrenHeightWeightGraphSection"
        );


    /*
       初回だけ作成
    */

    if (!graphSection) {

        graphSection =
            document.createElement("div");

        graphSection.id =
            "childrenHeightWeightGraphSection";

        graphSection.className =
            "children-height-weight-graph-section";

        heightWeightSection.appendChild(
            graphSection
        );

    }


    graphSection.style.display =
        "";


    renderChildrenHeightWeightGraph();

}


/* =====================================================
   📈 グラフ画面を閉じる
===================================================== */

function closeChildrenHeightWeightGraph() {

    const graphSection =
        document.getElementById(
            "childrenHeightWeightGraphSection"
        );

    const heightWeightSection =
        document.getElementById(
            "childrenHeightWeightSection"
        );


    if (graphSection) {

        graphSection.style.display =
            "none";

    }


    if (heightWeightSection) {

        Array.from(
            heightWeightSection.children
        )
        .forEach(
            element => {

                if (
                    element.id ===
                    "childrenHeightWeightGraphSection"
                ) {

                    return;

                }

                element.style.display =
                    "";

            }
        );

    }

}


/* =====================================================
   📈 グラフ描画
===================================================== */

function renderChildrenHeightWeightGraph(
    graphType = "height"
) {

    const graphSection =
        document.getElementById(
            "childrenHeightWeightGraphSection"
        );

    const child =
        typeof getSelectedChild === "function"
            ? getSelectedChild()
            : null;


    if (!graphSection || !child) return;


    initializeChildrenGrowthData(child);


    const records =
        [...child.growth.heightWeight]
            .filter(
                record =>
                    record &&
                    record.date
            )
            .sort(
                (a, b) => {

                    /*
                       YYYY-MM-DDなので
                       文字列比較で正確に日付順になる。
                    */

                    const dateCompare =
                        String(a.date)
                            .localeCompare(
                                String(b.date)
                            );


                    if (
                        dateCompare !== 0
                    ) {

                        return dateCompare;

                    }


                    /*
                       同じ日の場合は
                       入力日時順
                    */

                    const aTime =
                        a.recordedAt
                            ? new Date(
                                a.recordedAt
                            ).getTime()
                            : 0;

                    const bTime =
                        b.recordedAt
                            ? new Date(
                                b.recordedAt
                            ).getTime()
                            : 0;


                    return aTime - bTime;

                }
            );


    /* =================================================
       データなし
    ================================================= */

    if (!records.length) {

        graphSection.innerHTML = `

            <div
                class="children-growth-detail-header"
            >

                <button
                    type="button"
                    class="children-growth-detail-back"
                    id="childrenHeightWeightGraphBackButton"
                >
                    ◀ 身長・体重
                </button>

                <div
                    class="children-growth-detail-title"
                >
                    📈 推移グラフ
                </div>

            </div>


            <div
                class="children-growth-empty"
            >
                まだ記録がありません。
            </div>

        `;


        const backButton =
            document.getElementById(
                "childrenHeightWeightGraphBackButton"
            );


        if (backButton) {

            backButton.onclick =
                closeChildrenHeightWeightGraph;

        }


        return;

    }


    /* =================================================
       表示対象
    ================================================= */

    const valueKey =
        graphType === "weight"
            ? "weight"
            : "height";


    const graphTitle =
        graphType === "weight"
            ? "体重の推移"
            : "身長の推移";


    const unit =
        graphType === "weight"
            ? "kg"
            : "cm";


    /* =================================================
       有効な値だけ取得
    ================================================= */

    const graphRecords =
        records.filter(
            record =>
                Number.isFinite(
                    Number(
                        record[valueKey]
                    )
                ) &&
                Number(
                    record[valueKey]
                ) > 0
        );


    /* =================================================
       HTML
    ================================================= */

    graphSection.innerHTML = `

        <div
            class="children-growth-detail-header"
        >

            <button
                type="button"
                class="children-growth-detail-back"
                id="childrenHeightWeightGraphBackButton"
            >
                ◀ 身長・体重
            </button>

            <div
                class="children-growth-detail-title"
            >
                📈 推移グラフ
            </div>

        </div>


        <div
            class="children-height-weight-graph-switch"
        >

            <button
                type="button"
                class="children-height-weight-graph-tab
                ${
                    graphType === "height"
                        ? "active"
                        : ""
                }"
                data-graph-type="height"
            >
                身長
            </button>


            <button
                type="button"
                class="children-height-weight-graph-tab
                ${
                    graphType === "weight"
                        ? "active"
                        : ""
                }"
                data-graph-type="weight"
            >
                体重
            </button>

        </div>


        <div
            class="children-height-weight-graph-title"
        >
            ${graphTitle}
        </div>


        <div
            class="children-height-weight-graph-wrapper"
        >

            ${
                graphRecords.length
                    ? `
                        <canvas
                            id="childrenHeightWeightGraphCanvas"
                        ></canvas>
                    `
                    : `
                        <div
                            class="children-growth-empty"
                        >
                            ${graphTitle}の記録がありません。
                        </div>
                    `
            }

        </div>


        <div
            class="children-height-weight-graph-history"
        >

            ${
                graphRecords
                    .map(
                        record => {

                            const age =
                                calculateChildrenAgeAtDate(
                                    child.birthday,
                                    record.date
                                );


                            return `

                                <div
                                    class="children-height-weight-graph-record"
                                >

                                    <span>
                                        ${record.date}
                                    </span>

                                    <span>
                                        ${age}
                                    </span>

                                    <strong>
                                        ${record[valueKey]}
                                        ${unit}
                                    </strong>

                                </div>

                            `;

                        }
                    )
                    .join("")
            }

        </div>

    `;


    /* =================================================
       戻る
    ================================================= */

    const backButton =
        document.getElementById(
            "childrenHeightWeightGraphBackButton"
        );


    if (backButton) {

        backButton.onclick =
            closeChildrenHeightWeightGraph;

    }


    /* =================================================
       身長 / 体重切り替え
    ================================================= */

    graphSection
        .querySelectorAll(
            "[data-graph-type]"
        )
        .forEach(
            button => {

                button.onclick =
                    function () {

                        renderChildrenHeightWeightGraph(
                            this.dataset.graphType
                        );

                    };

            }
        );


    /* =================================================
       Canvas描画
    ================================================= */

    if (!graphRecords.length) {

        return;

    }


    const canvas =
        document.getElementById(
            "childrenHeightWeightGraphCanvas"
        );


    if (!canvas) return;


    drawChildrenHeightWeightGraph(
        canvas,
        graphRecords,
        valueKey,
        unit
    );

}


/* =====================================================
   📈 Canvasグラフ本体
===================================================== */

function drawChildrenHeightWeightGraph(
    canvas,
    records,
    valueKey,
    unit
) {

    const wrapper =
        canvas.parentElement;


    if (!wrapper) return;


    const rect =
        wrapper.getBoundingClientRect();


    const width =
        Math.max(
            300,
            Math.floor(
                rect.width
            )
        );


    const height =
        300;


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;


    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";


    const ctx =
        canvas.getContext("2d");


    if (!ctx) return;


    ctx.scale(
        dpr,
        dpr
    );


    /*
       余白
    */

    const paddingLeft =
        48;

    const paddingRight =
        20;

    const paddingTop =
        25;

    const paddingBottom =
        48;


    const graphWidth =
        width -
        paddingLeft -
        paddingRight;


    const graphHeight =
        height -
        paddingTop -
        paddingBottom;


    /* =================================================
       値
    ================================================= */

    const values =
        records.map(
            record =>
                Number(
                    record[valueKey]
                )
        );


    let minValue =
        Math.min(
            ...values
        );

    let maxValue =
        Math.max(
            ...values
        );


    /*
       1件しかない場合も
       グラフとして見えるようにする。
    */

    if (
        minValue ===
        maxValue
    ) {

        minValue -= 1;
        maxValue += 1;

    }


    /*
       少し余白を作る
    */

    const range =
        maxValue -
        minValue;


    minValue -=
        range * 0.1;

    maxValue +=
        range * 0.1;


    /* =================================================
       背景
    ================================================= */

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* =================================================
       横軸・縦軸
    ================================================= */

    ctx.strokeStyle =
        "#cccccc";

    ctx.lineWidth =
        1;


    ctx.beginPath();

    ctx.moveTo(
        paddingLeft,
        paddingTop
    );

    ctx.lineTo(
        paddingLeft,
        paddingTop +
        graphHeight
    );

    ctx.lineTo(
        paddingLeft +
        graphWidth,
        paddingTop +
        graphHeight
    );

    ctx.stroke();


    /* =================================================
       横線
    ================================================= */

    const gridCount =
        5;


    ctx.fillStyle =
        "#777777";

    ctx.font =
        "12px sans-serif";

    ctx.textAlign =
        "right";


    for (
        let i = 0;
        i <= gridCount;
        i++
    ) {

        const ratio =
            i /
            gridCount;


        const y =
            paddingTop +
            graphHeight -
            graphHeight *
            ratio;


        const value =
            minValue +
            (
                maxValue -
                minValue
            ) *
            ratio;


        ctx.strokeStyle =
            "#eeeeee";


        ctx.beginPath();

        ctx.moveTo(
            paddingLeft,
            y
        );

        ctx.lineTo(
            paddingLeft +
            graphWidth,
            y
        );

        ctx.stroke();


        ctx.fillStyle =
            "#777777";


        ctx.fillText(
            value.toFixed(
                valueKey === "weight"
                    ? 1
                    : 1
            ),
            paddingLeft - 8,
            y + 4
        );

    }


    /* =================================================
       データ座標
    ================================================= */

    const points =
        records.map(
            (record, index) => {

                const value =
                    Number(
                        record[valueKey]
                    );


                const x =
                    records.length === 1
                        ? paddingLeft +
                          graphWidth / 2
                        : paddingLeft +
                          (
                              graphWidth *
                              index /
                              (
                                  records.length -
                                  1
                              )
                          );


                const ratio =
                    (
                        value -
                        minValue
                    ) /
                    (
                        maxValue -
                        minValue
                    );


                const y =
                    paddingTop +
                    graphHeight -
                    graphHeight *
                    ratio;


                return {
                    x,
                    y,
                    value,
                    date:
                        record.date
                };

            }
        );


    /* =================================================
       線
    ================================================= */

    if (
        points.length > 1
    ) {

        ctx.strokeStyle =
            "#8b5cf6";

        ctx.lineWidth =
            3;

        ctx.lineJoin =
            "round";

        ctx.lineCap =
            "round";


        ctx.beginPath();


        points.forEach(
            (point, index) => {

                if (
                    index === 0
                ) {

                    ctx.moveTo(
                        point.x,
                        point.y
                    );

                } else {

                    ctx.lineTo(
                        point.x,
                        point.y
                    );

                }

            }
        );


        ctx.stroke();

    }


    /* =================================================
       点
    ================================================= */

    points.forEach(
        point => {

            ctx.fillStyle =
                "#ffffff";


            ctx.strokeStyle =
                "#8b5cf6";

            ctx.lineWidth =
                3;


            ctx.beginPath();

            ctx.arc(
                point.x,
                point.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.stroke();

        }
    );


    /* =================================================
       X軸の日付
    ================================================= */

    ctx.fillStyle =
        "#777777";

    ctx.font =
        "11px sans-serif";

    ctx.textAlign =
        "center";


    /*
       全件表示すると多すぎる場合は
       適度に間引いて表示。
       データ自体は削らない。
    */

    const maxLabels =
        6;


    const labelStep =
        Math.max(
            1,
            Math.ceil(
                records.length /
                maxLabels
            )
        );


    records.forEach(
        (record, index) => {

            if (
                index % labelStep !== 0 &&
                index !==
                    records.length - 1
            ) {

                return;

            }


            const point =
                points[index];


            if (!point) return;


            const date =
                String(
                    record.date
                );


            const label =
                date.substring(
                    5
                );


            ctx.fillText(
                label,
                point.x,
                paddingTop +
                graphHeight +
                24
            );

        }
    );


    /* =================================================
       単位
    ================================================= */

    ctx.textAlign =
        "left";

    ctx.fillStyle =
        "#777777";

    ctx.fillText(
        unit,
        8,
        paddingTop
    );

}

