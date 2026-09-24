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
    ================================================= */

    const sortedRecords =
        [...records].sort(
            (a, b) => {

                const aDate =
                    String(a.date || "");

                const bDate =
                    String(b.date || "");


                if (aDate !== bDate) {

                    return bDate.localeCompare(
                        aDate
                    );

                }


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

            <button
                type="button"
                class="children-height-weight-add"
                id="childrenHeightWeightAddButton"
                aria-label="身長・体重を記録"
                title="身長・体重を記録"
            >
                ＋
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

                /* =====================================
                   記録日の選択エリア
                ===================================== */

                if (
                    document.getElementById(
                        "childrenHeightWeightDateChooser"
                    )
                ) {

                    return;

                }


                const chooser =
                    document.createElement(
                        "div"
                    );


                chooser.id =
                    "childrenHeightWeightDateChooser";


                const title =
                    document.createElement(
                        "div"
                    );


                title.textContent =
                    "記録する日";


                chooser.appendChild(
                    title
                );


                /* =====================================
                   日付入力
                ===================================== */

                const dateInput =
                    document.createElement(
                        "input"
                    );


                dateInput.type =
                    "date";


                dateInput.value =
                    today;


                if (child.birthday) {

                    dateInput.min =
                        child.birthday;

                }


                chooser.appendChild(
                    dateInput
                );


                /* =====================================
                   ボタン
                ===================================== */

                const actions =
                    document.createElement(
                        "div"
                    );


                const cancelButton =
                    document.createElement(
                        "button"
                    );


                cancelButton.type =
                    "button";

                cancelButton.textContent =
                    "キャンセル";


                const nextButton =
                    document.createElement(
                        "button"
                    );


                nextButton.type =
                    "button";

                nextButton.textContent =
                    "次へ";


                actions.appendChild(
                    cancelButton
                );

                actions.appendChild(
                    nextButton
                );


                chooser.appendChild(
                    actions
                );


                /* =====================================
                   表示
                ===================================== */

                const addArea =
                    document.querySelector(
                        ".children-height-weight-add-area"
                    );


                if (addArea) {

                    addArea.after(
                        chooser
                    );

                } else {

                    section.prepend(
                        chooser
                    );

                }


                /* =====================================
                   キャンセル
                ===================================== */

                cancelButton.onclick =
                    function () {

                        chooser.remove();

                    };


                /* =====================================
                   次へ
                ===================================== */

                nextButton.onclick =
                    function () {

                        const selectedDate =
                            dateInput.value;


                        if (!selectedDate) {

                            alert(
                                "記録する日を選択してください。"
                            );

                            return;

                        }


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


                        chooser.remove();


                        /* =================================
                           身長
                        ================================= */

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


                                /* =============================
                                   体重
                                ============================= */

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


                                        /* =============================
                                           保存
                                        ============================= */

                                        child.growth.heightWeight.push({

                                            id:
                                                "growth-" +
                                                Date.now(),

                                            date:
                                                selectedDate,

                                            recordedAt:
                                                new Date()
                                                    .toISOString(),

                                            height:
                                                height,

                                            weight:
                                                weight

                                        });


                                        saveChildrenGrowthData();

                                        renderChildrenHeightWeight();

                                    },

                                    null,

                                    child.gender

                                );

                            },

                            null,

                            child.gender

                        );

                    };

            };

    }


    /* =================================================
       📈 推移グラフ
    ================================================= */

    const graphOpenButton =
        document.getElementById(
            "childrenHeightWeightGraphOpenButton"
        );


    if (graphOpenButton) {

        graphOpenButton.onclick =
            openChildrenHeightWeightGraph;

    }


    /* =================================================
       履歴
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

       記録日が最優先。
       同じ記録日の場合だけ recordedAt を使用。
    ================================================= */

    const records =
        [...child.growth.heightWeight]
            .sort(
                (a, b) => {

                    const aDate =
                        String(
                            a.date || ""
                        );

                    const bDate =
                        String(
                            b.date || ""
                        );


                    /*
                       記録日が違う
                       → 記録日が新しいものを上
                    */

                    if (
                        aDate !==
                        bDate
                    ) {

                        return bDate.localeCompare(
                            aDate
                        );

                    }


                    /*
                       同じ記録日
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


                    return (
                        bRecordedAt -
                        aRecordedAt
                    );

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
       表示件数

       最初は3件。
       4件以上の場合だけ
       「さらに表示」を出す。
    ================================================= */

    const displayAll =
        list.dataset.displayAll === "true";


    const displayRecords =
        displayAll
            ? records
            : records.slice(
                0,
                3
            );


    /* =================================================
       履歴表示
    ================================================= */

    list.innerHTML =

        displayRecords
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
                                    aria-label="編集"
                                    title="編集"
                                >
                                    ✎
                                </button>


                                <button
                                    type="button"
                                    class="children-height-weight-delete"
                                    data-growth-action="delete"
                                    data-growth-id="${record.id}"
                                    aria-label="削除"
                                    title="削除"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    /* =================================================
       さらに表示 / 閉じる
    ================================================= */

    if (
        records.length >
        3
    ) {

        const moreButton =
            document.createElement(
                "button"
            );


        moreButton.type =
            "button";


        moreButton.className =
            "children-height-weight-history-more";


        if (displayAll) {

            moreButton.textContent =
                "閉じる";

        } else {

            moreButton.textContent =
                "さらに表示";

        }


        moreButton.onclick =
            function () {

                if (
                    list.dataset.displayAll ===
                    "true"
                ) {

                    list.dataset.displayAll =
                        "false";

                } else {

                    list.dataset.displayAll =
                        "true";

                }


                renderChildrenHeightWeightHistory();

            };


        list.appendChild(
            moreButton
        );

    }


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
                            recordIndex <
                            0
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


                            /*
                               削除後は
                               履歴を通常の3件表示に戻す。
                            */

                            list.dataset.displayAll =
                                "false";


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
                                               recordedAt は変更しない。
                                               元の記録日時を維持。
                                            */


                                            saveChildrenGrowthData();


                                            renderChildrenHeightWeight();

                                        },

                                        null,

                                        child.gender

                                    );

                                },

                                null,

                                child.gender

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

ctx.textAlign = "center";

ctx.fillText(
    unit,
    paddingLeft - 18,
    paddingTop - 8
);

ctx.textAlign = "right";
}







/* =====================================================
   💉 予防接種
   -----------------------------------------------------
   ・子どもごとに完全分離
   ・標準的な定期接種スケジュールを表示
   ・実際の接種記録は別管理
   ・接種年齢は誕生日＋接種日から自動計算
   ・種類別 / 時系列表示
   ・追加 / 編集 / 削除
   ・任意ワクチン追加対応
===================================================== */


/* =====================================================
   💉 定期接種マスター

   ※「予定された接種記録」ではない。
   ※ 実際に接種した記録は child.growth.vaccination に保存する。
===================================================== */

const CHILDREN_VACCINATION_MASTER = [

    {
        id: "rotavirus",
        name: "ロタウイルス",
        icon: "🦠",
        target: "生後2か月ごろ",
        doses: "2回または3回",
        gender: "all"
    },

    {
        id: "hepb",
        name: "B型肝炎",
        icon: "💉",
        target: "生後2か月ごろ～1歳未満",
        doses: "3回",
        gender: "all"
    },

    {
        id: "five_combined",
        name: "5種混合",
        icon: "💉",
        target: "生後2～7か月ごろ開始",
        doses: "初回3回＋追加1回",
        gender: "all"
    },

    {
        id: "pneumococcus",
        name: "小児肺炎球菌",
        icon: "💉",
        target: "生後2か月ごろ～",
        doses: "接種開始年齢により異なる",
        gender: "all"
    },

    {
        id: "bcg",
        name: "BCG",
        icon: "💉",
        target: "1歳未満",
        doses: "1回",
        gender: "all"
    },

    {
        id: "mr",
        name: "MR（麻しん・風しん）",
        icon: "💉",
        target: "1歳ごろ・就学前",
        doses: "2回",
        gender: "all"
    },

    {
        id: "varicella",
        name: "水痘",
        icon: "💉",
        target: "1～3歳未満",
        doses: "2回",
        gender: "all"
    },

    {
        id: "japanese_encephalitis",
        name: "日本脳炎",
        icon: "💉",
        target: "3～4歳ごろ・9～10歳ごろ",
        doses: "1期3回＋2期1回",
        gender: "all"
    },

    {
        id: "dt",
        name: "DT（ジフテリア・破傷風）",
        icon: "💉",
        target: "11～12歳ごろ",
        doses: "1回",
        gender: "all"
    },

    {
        id: "hpv",
        name: "HPV（子宮頸がん予防）",
        icon: "💉",
        target: "小学6年～高校1年相当の女子",
        doses: "2回または3回",
        gender: "girl"
    }

];


/* =====================================================
   💉 予防接種データ初期化
===================================================== */

function initializeChildrenVaccinationData(child) {

    if (!child) return;

    if (
        !child.growth ||
        typeof child.growth !== "object"
    ) {

        child.growth = {};

    }


    if (
        !Array.isArray(
            child.growth.vaccination
        )
    ) {

        child.growth.vaccination = [];

    }

}


/* =====================================================
   💉 予防接種データ取得
===================================================== */

function getChildrenVaccinationData() {

    const child =
        getSelectedChild();

    if (!child) {

        return [];

    }

    initializeChildrenVaccinationData(
        child
    );

    return child.growth.vaccination;

}


/* =====================================================
   💉 接種記録の保存
===================================================== */

function saveChildrenVaccinationData() {

    saveChildrenData();

}


/* =====================================================
   💉 年齢計算
===================================================== */

function calculateChildrenVaccinationAge(
    birthday,
    recordDate
) {

    if (
        !birthday ||
        !recordDate
    ) {

        return "";

    }

    const birth =
        new Date(
            birthday + "T00:00:00"
        );

    const date =
        new Date(
            recordDate + "T00:00:00"
        );


    if (
        Number.isNaN(
            birth.getTime()
        ) ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    if (date < birth) {

        return "";

    }


    let years =
        date.getFullYear() -
        birth.getFullYear();

    let months =
        date.getMonth() -
        birth.getMonth();


    if (
        date.getDate() <
        birth.getDate()
    ) {

        months--;

    }


    if (months < 0) {

        years--;

        months += 12;

    }


    return (
        years +
        "歳" +
        months +
        "ヶ月"
    );

}


/* =====================================================
   💉 日付表示
===================================================== */

function formatChildrenVaccinationDate(
    date
) {

    if (!date) return "";

    const parts =
        date.split("-");

    if (parts.length !== 3) {

        return date;

    }

    return (
        parts[0] +
        "年" +
        Number(parts[1]) +
        "月" +
        Number(parts[2]) +
        "日"
    );

}


/* =====================================================
   💉 マスター取得
===================================================== */

function getChildrenVaccinationMaster(
    vaccineId
) {

    return CHILDREN_VACCINATION_MASTER.find(
        item =>
            item.id === vaccineId
    );

}


/* =====================================================
   💉 予防接種ページを開く
===================================================== */

function openChildrenVaccination() {

    const child =
        getSelectedChild();

    if (!child) return;


    initializeChildrenVaccinationData(
        child
    );


    /* ---------------------------------------------
       他の成長ページを閉じる
    --------------------------------------------- */

    resetChildrenGrowthSubPages();


    const growthSection =
        document.getElementById(
            "childrenGrowthSection"
        );


    if (growthSection) {

        growthSection.style.display =
            "none";

    }


    /* ---------------------------------------------
       既存ページを取得
    --------------------------------------------- */

    let section =
        document.getElementById(
            "childrenVaccinationSection"
        );


    if (!section) {

        section =
            document.createElement(
                "section"
            );

        section.id =
            "childrenVaccinationSection";

        section.className =
            "children-vaccination-section";


        const app =
            document.getElementById(
                "childrenCalendarApp"
            );

        if (!app) return;

        app.appendChild(section);

    }


    section.style.display =
        "";


    renderChildrenVaccination();

}


/* =====================================================
   💉 予防接種ページを閉じる
===================================================== */

function closeChildrenVaccination() {

    const section =
        document.getElementById(
            "childrenVaccinationSection"
        );


    if (section) {

        section.style.display =
            "none";

    }


    const growthSection =
        document.getElementById(
            "childrenGrowthSection"
        );


    if (growthSection) {

        growthSection.style.display =
            "";

        const categoryList =
            growthSection.querySelector(
                ".children-growth-category-list"
            );

        if (categoryList) {

            categoryList.style.display =
                "";

        }

    }

}


/* =====================================================
   💉 表示モード
===================================================== */

let childrenVaccinationViewMode =
    "type";


/* =====================================================
   💉 予防接種画面描画
===================================================== */

function renderChildrenVaccination() {

    const child =
        getSelectedChild();

    if (!child) return;


    initializeChildrenVaccinationData(
        child
    );


    const section =
        document.getElementById(
            "childrenVaccinationSection"
        );


    if (!section) return;


    const records =
        child.growth.vaccination;


    const app =
        document.getElementById(
            "childrenCalendarApp"
        );


    const gender =
        child.gender === "girl"
            ? "girl"
            : "boy";


    section.innerHTML = `

        <div class="children-vaccination-header">

            <button
                type="button"
                class="children-vaccination-back"
                onclick="closeChildrenVaccination()"
            >
                ◀ 成長・定期記録
            </button>

            <div class="children-vaccination-title">
                💉 予防接種
            </div>

        </div>


        <div class="children-vaccination-child-name">

            👶 ${child.name || ""}
        </div>


        <div class="children-vaccination-note">

            定期接種の標準的な接種時期を確認しながら、
            実際に接種した記録を登録できます。

        </div>


        <div class="children-vaccination-actions">

            <button
                type="button"
                class="children-vaccination-add"
                onclick="openChildrenVaccinationRecordModal()"
            >
                ＋ 接種記録を追加
            </button>

        </div>


        <div class="children-vaccination-view-switch">

            <button
                type="button"
                class="children-vaccination-view-button ${childrenVaccinationViewMode === "type" ? "active" : ""}"
                onclick="switchChildrenVaccinationView('type')"
            >
                種類別
            </button>

            <button
                type="button"
                class="children-vaccination-view-button ${childrenVaccinationViewMode === "timeline" ? "active" : ""}"
                onclick="switchChildrenVaccinationView('timeline')"
            >
                時系列
            </button>

        </div>


        <div
            id="childrenVaccinationContent"
            class="children-vaccination-content"
        ></div>

    `;


    if (app) {

        app.classList.toggle(
            "boy",
            gender === "boy"
        );

        app.classList.toggle(
            "girl",
            gender === "girl"
        );

    }


    renderChildrenVaccinationContent();

}


/* =====================================================
   💉 表示切替
===================================================== */

function switchChildrenVaccinationView(
    mode
) {

    childrenVaccinationViewMode =
        mode === "timeline"
            ? "timeline"
            : "type";


    renderChildrenVaccination();

}


/* =====================================================
   💉 内容描画
===================================================== */

function renderChildrenVaccinationContent() {

    const child =
        getSelectedChild();

    if (!child) return;


    const container =
        document.getElementById(
            "childrenVaccinationContent"
        );


    if (!container) return;


    if (
        childrenVaccinationViewMode ===
        "timeline"
    ) {

        renderChildrenVaccinationTimeline(
            container
        );

        return;

    }


    renderChildrenVaccinationByType(
        container
    );

}


/* =====================================================
   💉 種類別
===================================================== */

function renderChildrenVaccinationByType(
    container
) {

    const child =
        getSelectedChild();

    if (!child) return;


    const records =
        getChildrenVaccinationData();


    let html = `

        <div class="children-vaccination-master-title">
            📋 定期接種
        </div>

        <div class="children-vaccination-master-list">
    `;


    CHILDREN_VACCINATION_MASTER.forEach(
        vaccine => {

            if (
                vaccine.gender === "girl" &&
                child.gender !== "girl"
            ) {

                return;

            }


            const vaccineRecords =
                records
                    .filter(
                        record =>
                            record.vaccineId ===
                            vaccine.id
                    )
                    .sort(
                        (a, b) =>
                            (
                                b.date || ""
                            ).localeCompare(
                                a.date || ""
                            )
                    );


            html += `

                <div
                    class="children-vaccination-type-card"
                >

                    <div
                        class="children-vaccination-type-header"
                    >

                        <div>

                            <div
                                class="children-vaccination-type-name"
                            >
                                ${vaccine.icon}
                                ${escapeHtml(vaccine.name)}
                            </div>

                            <div
                                class="children-vaccination-type-target"
                            >
                                標準時期：
                                ${escapeHtml(vaccine.target)}
                            </div>

                            <div
                                class="children-vaccination-type-dose"
                            >
                                ${escapeHtml(vaccine.doses)}
                            </div>

                        </div>

                        <button
                            type="button"
                            class="children-vaccination-small-add"
                            onclick="openChildrenVaccinationRecordModal('${vaccine.id}')"
                        >
                            ＋
                        </button>

                    </div>

            `;


            if (!vaccineRecords.length) {

                html += `

                    <div
                        class="children-vaccination-unrecorded"
                    >
                        まだ接種記録がありません
                    </div>

                `;

            }
            else {

                vaccineRecords.forEach(
                    record => {

                        html +=
                            renderChildrenVaccinationRecordHtml(
                                record,
                                child
                            );

                    }
                );

            }


            html += `</div>`;

        }
    );


    html += `</div>`;


    /* ---------------------------------------------
       任意ワクチン
    --------------------------------------------- */

    const customRecords =
        records.filter(
            record =>
                record.custom === true
        );


    html += `

        <div class="children-vaccination-master-title custom">
            ➕ 任意・その他のワクチン
        </div>

    `;


    if (!customRecords.length) {

        html += `

            <div class="children-vaccination-empty">
                任意・その他の接種記録はありません
            </div>

        `;

    }
    else {

        customRecords
            .slice()
            .sort(
                (a, b) =>
                    (
                        b.date || ""
                    ).localeCompare(
                        a.date || ""
                    )
            )
            .forEach(
                record => {

                    html +=
                        renderChildrenVaccinationRecordHtml(
                            record,
                            child
                        );

                }
            );

    }


    container.innerHTML =
        html;

}


/* =====================================================
   💉 時系列
===================================================== */

function renderChildrenVaccinationTimeline(
    container
) {

    const child =
        getSelectedChild();

    if (!child) return;


    const records =
        getChildrenVaccinationData()
            .slice()
            .sort(
                (a, b) => {

                    const dateCompare =
                        (
                            b.date || ""
                        ).localeCompare(
                            a.date || ""
                        );

                    if (
                        dateCompare !== 0
                    ) {

                        return dateCompare;

                    }


                    return (
                        b.recordedAt || ""
                    ).localeCompare(
                        a.recordedAt || ""
                    );

                }
            );


    let html = `

        <div class="children-vaccination-master-title">
            🗓️ 接種記録の時系列
        </div>

    `;


    if (!records.length) {

        html += `

            <div class="children-vaccination-empty">
                まだ接種記録がありません。
            </div>

        `;

        container.innerHTML =
            html;

        return;

    }


    records.forEach(
        record => {

            html +=
                renderChildrenVaccinationRecordHtml(
                    record,
                    child
                );

        }
    );


    container.innerHTML =
        html;

}


/* =====================================================
   💉 個別記録表示
===================================================== */

function renderChildrenVaccinationRecordHtml(
    record,
    child
) {

    const master =
        getChildrenVaccinationMaster(
            record.vaccineId
        );


    const vaccineName =
        record.vaccineName ||
        (
            master
                ? master.name
                : "その他のワクチン"
        );


    const age =
        calculateChildrenVaccinationAge(
            child.birthday,
            record.date
        );


    return `

        <div
            class="children-vaccination-record"
        >

            <div
                class="children-vaccination-record-main"
                onclick="editChildrenVaccinationRecord('${record.id}')"
            >

                <div
                    class="children-vaccination-record-date"
                >
                    ${formatChildrenVaccinationDate(record.date)}
                </div>

                <div
                    class="children-vaccination-record-name"
                >
                    ${escapeHtml(vaccineName)}
                </div>

                <div
                    class="children-vaccination-record-age"
                >
                    接種時：
                    ${escapeHtml(age || "―")}
                </div>

                ${
                    record.dose
                        ? `
                            <div
                                class="children-vaccination-record-dose"
                            >
                                ${escapeHtml(record.dose)}
                            </div>
                        `
                        : ""
                }

                ${
                    record.hospital
                        ? `
                            <div
                                class="children-vaccination-record-hospital"
                            >
                                🏥
                                ${escapeHtml(record.hospital)}
                            </div>
                        `
                        : ""
                }

                ${
                    record.memo
                        ? `
                            <div
                                class="children-vaccination-record-memo"
                            >
                                ${escapeHtml(record.memo)}
                            </div>
                        `
                        : ""
                }

            </div>


            <div
                class="children-vaccination-record-actions"
            >

                <button
                    type="button"
                    class="children-vaccination-edit"
                    onclick="editChildrenVaccinationRecord('${record.id}')"
                >
                    ✎
                </button>

                <button
                    type="button"
                    class="children-vaccination-delete"
                    onclick="deleteChildrenVaccinationRecord('${record.id}')"
                >
                    ×
                </button>

            </div>

        </div>

    `;

}


/* =====================================================
   💉 記録追加 / 編集モーダル
===================================================== */

function openChildrenVaccinationRecordModal(
    vaccineId = "",
    editId = ""
) {

    const child =
        getSelectedChild();

    if (!child) return;


    initializeChildrenVaccinationData(
        child
    );


    let record =
        null;


    if (editId) {

        record =
            child.growth.vaccination.find(
                item =>
                    item.id === editId
            );

    }


    const modalId =
        "childrenVaccinationRecordModal";


    let modal =
        document.getElementById(
            modalId
        );


    if (modal) {

        modal.remove();

    }


    modal =
        document.createElement(
            "div"
        );


    modal.id =
        modalId;

    modal.className =
        "children-modal";


    const master =
        vaccineId
            ? getChildrenVaccinationMaster(
                vaccineId
            )
            : null;


    const currentVaccineId =
        record?.vaccineId ||
        vaccineId ||
        "";


    const currentVaccineName =
        record?.vaccineName ||
        (
            master
                ? master.name
                : ""
        );


    const today =
        new Date();


    const todayText =
        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            today.getDate()
        ).padStart(2, "0");


    modal.innerHTML = `

        <div
            class="children-modal-overlay"
        ></div>

        <div
            class="children-modal-content children-vaccination-record-modal"
        >

            <div
                class="children-modal-header"
            >

                <h2>
                    💉 ${
                        record
                            ? "接種記録を編集"
                            : "接種記録を追加"
                    }
                </h2>

                <button
                    type="button"
                    class="children-modal-close-button"
                    id="childrenVaccinationModalClose"
                >
                    ×
                </button>

            </div>


            <div class="children-vaccination-form">

                <label>
                    接種日
                    <input
                        type="date"
                        id="childrenVaccinationDateInput"
                        value="${
                            record?.date ||
                            todayText
                        }"
                    >
                </label>


                <div
                    id="childrenVaccinationAgeDisplay"
                    class="children-vaccination-age-display"
                ></div>


                <label>
                    ワクチンの種類

                    <select
                        id="childrenVaccinationTypeInput"
                    >

                        <option value="">
                            選択してください
                        </option>

                        ${CHILDREN_VACCINATION_MASTER.map(
                            item => {

                                if (
                                    item.gender === "girl" &&
                                    child.gender !== "girl"
                                ) {

                                    return "";

                                }

                                return `

                                    <option
                                        value="${item.id}"
                                        ${
                                            currentVaccineId ===
                                            item.id
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${item.icon}
                                        ${escapeHtml(item.name)}
                                    </option>

                                `;

                            }
                        ).join("")}

                        <option
                            value="custom"
                            ${
                                record?.custom
                                    ? "selected"
                                    : ""
                            }
                        >
                            ➕ 任意・その他
                        </option>

                    </select>

                </label>


                <label>
                    ワクチン名

                    <input
                        type="text"
                        id="childrenVaccinationNameInput"
                        maxlength="100"
                        value="${escapeHtml(
                            currentVaccineName
                        )}"
                        placeholder="例：○○ワクチン"
                    >

                </label>


                <label>
                    接種回数

                    <input
                        type="text"
                        id="childrenVaccinationDoseInput"
                        maxlength="30"
                        value="${escapeHtml(
                            record?.dose || ""
                        )}"
                        placeholder="例：1回目"
                    >

                </label>


                <label>
                    医療機関名

                    <input
                        type="text"
                        id="childrenVaccinationHospitalInput"
                        maxlength="100"
                        value="${escapeHtml(
                            record?.hospital || ""
                        )}"
                        placeholder="例：○○小児科"
                    >

                </label>


                <label>
                    メモ

                    <textarea
                        id="childrenVaccinationMemoInput"
                        maxlength="500"
                        rows="4"
                        placeholder="気になることなど"
                    >${escapeHtml(
                        record?.memo || ""
                    )}</textarea>

                </label>


                <div
                    class="children-vaccination-form-actions"
                >

                    <button
                        type="button"
                        id="childrenVaccinationCancelButton"
                        class="children-vaccination-cancel"
                    >
                        キャンセル
                    </button>

                    <button
                        type="button"
                        id="childrenVaccinationSaveButton"
                        class="children-vaccination-save"
                    >
                        保存
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const dateInput =
        document.getElementById(
            "childrenVaccinationDateInput"
        );


    const typeInput =
        document.getElementById(
            "childrenVaccinationTypeInput"
        );


    const nameInput =
        document.getElementById(
            "childrenVaccinationNameInput"
        );


    const ageDisplay =
        document.getElementById(
            "childrenVaccinationAgeDisplay"
        );


    function updateAge() {

        const age =
            calculateChildrenVaccinationAge(
                child.birthday,
                dateInput.value
            );


        ageDisplay.textContent =
            age
                ? "接種時年齢：" + age
                : "接種時年齢：―";

    }


    updateAge();


    dateInput.addEventListener(
        "change",
        updateAge
    );


    typeInput.addEventListener(
        "change",
        function () {

            const selected =
                getChildrenVaccinationMaster(
                    this.value
                );


            if (selected) {

                nameInput.value =
                    selected.name;

            }
            else if (
                this.value === "custom"
            ) {

                nameInput.value =
                    "";

            }

        }
    );


    document
        .getElementById(
            "childrenVaccinationModalClose"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    document
        .getElementById(
            "childrenVaccinationCancelButton"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    document
        .getElementById(
            "childrenVaccinationSaveButton"
        )
        .addEventListener(
            "click",
            function () {

                const date =
                    dateInput.value;


                if (!date) {

                    alert(
                        "接種日を入力してください。"
                    );

                    return;

                }


                if (
                    child.birthday &&
                    date <
                    child.birthday
                ) {

                    alert(
                        "誕生日より前の日付は登録できません。"
                    );

                    return;

                }


                const selectedType =
                    typeInput.value;


                const vaccineName =
                    nameInput.value.trim();


                if (!selectedType) {

                    alert(
                        "ワクチンの種類を選択してください。"
                    );

                    return;

                }


                if (
                    selectedType === "custom" &&
                    !vaccineName
                ) {

                    alert(
                        "ワクチン名を入力してください。"
                    );

                    return;

                }


                const dose =
                    document
                        .getElementById(
                            "childrenVaccinationDoseInput"
                        )
                        .value
                        .trim();


                const hospital =
                    document
                        .getElementById(
                            "childrenVaccinationHospitalInput"
                        )
                        .value
                        .trim();


                const memo =
                    document
                        .getElementById(
                            "childrenVaccinationMemoInput"
                        )
                        .value
                        .trim();


                const now =
                    new Date().toISOString();


                const data =
                    child.growth.vaccination;


                if (record) {

                    record.date =
                        date;

                    record.vaccineId =
                        selectedType === "custom"
                            ? ""
                            : selectedType;

                    record.vaccineName =
                        vaccineName;

                    record.dose =
                        dose;

                    record.hospital =
                        hospital;

                    record.memo =
                        memo;

                    record.custom =
                        selectedType === "custom";

                    record.recordedAt =
                        now;

                }
                else {

                    data.push({

                        id:
                            "vaccination-" +
                            Date.now() +
                            "-" +
                            Math.random()
                                .toString(36)
                                .slice(2, 8),

                        date:
                            date,

                        recordedAt:
                            now,

                        vaccineId:
                            selectedType === "custom"
                                ? ""
                                : selectedType,

                        vaccineName:
                            vaccineName,

                        dose:
                            dose,

                        hospital:
                            hospital,

                        memo:
                            memo,

                        custom:
                            selectedType === "custom"

                    });

                }


                saveChildrenVaccinationData();

                modal.remove();

                renderChildrenVaccination();

            }
        );

}


/* =====================================================
   💉 編集
===================================================== */

function editChildrenVaccinationRecord(
    recordId
) {

    const records =
        getChildrenVaccinationData();


    const record =
        records.find(
            item =>
                item.id === recordId
        );


    if (!record) return;


    openChildrenVaccinationRecordModal(
        record.vaccineId,
        record.id
    );

}


/* =====================================================
   💉 削除
===================================================== */

function deleteChildrenVaccinationRecord(
    recordId
) {

    const child =
        getSelectedChild();

    if (!child) return;


    initializeChildrenVaccinationData(
        child
    );


    const index =
        child.growth.vaccination.findIndex(
            item =>
                item.id === recordId
        );


    if (index < 0) return;


    const record =
        child.growth.vaccination[index];


    const vaccineName =
        record.vaccineName ||
        "この接種記録";


    if (
        !confirm(
            vaccineName +
            "の接種記録を削除しますか？"
        )
    ) {

        return;

    }


    child.growth.vaccination.splice(
        index,
        1
    );


    saveChildrenVaccinationData();

    renderChildrenVaccination();

}


/* =====================================================
   💉 成長カテゴリークリック
===================================================== */

if (
    !
    window.childrenVaccinationDetailsInitialized
) {
    window.childrenVaccinationDetailsInitialized =
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


            if (
                category ===
                "heightWeight"
            ) {

                openChildrenHeightWeight();

                return;

            }


            if (
                category ===
                "vaccination"
            ) {

                openChildrenVaccination();

                return;

            }

        }
    );

}