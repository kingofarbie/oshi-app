/* =====================================================
   🌱 こどもカレンダー
   成長・できたこと

   calendar-children-details-milestone.js

   ・既存の成長・定期記録下位ページと同じ構造
   ・子どもごとに保存
   ・複数同日記録対応
   ・年齢は誕生日＋記録日から自動計算
   ・追加 / 編集 / 削除
   ・長文は省略表示 → タップで全文
   ・9分類に対応
   ・分類ごとの絞り込みに対応
===================================================== */


/* =====================================================
   🌱 成長・できたこと 分類
===================================================== */

const CHILDREN_MILESTONE_CATEGORIES = [

    {
        id: "movement",
        label: "🚶 動作・運動"
    },

    {
        id: "language",
        label: "🗣️ 言葉"
    },

    {
        id: "teeth",
        label: "🦷 歯・口"
    },

    {
        id: "food",
        label: "🍚 食事"
    },

    {
        id: "life",
        label: "🚽 生活"
    },

    {
        id: "learning",
        label: "🧠 理解・学習"
    },

    {
        id: "social",
        label: "❤️ 心・社会性"
    },

    {
        id: "interest",
        label: "🎨 好き・興味"
    },

    {
        id: "first",
        label: "✨ 初めて・思い出"
    }

];


/* =====================================================
   🌱 現在選択しているフィルター

   all
   movement
   language
   teeth
   food
   life
   learning
   social
   interest
   first
===================================================== */

let childrenMilestoneFilter =
    "all";


/* =====================================================
   🌱 分類名取得
===================================================== */

function getChildrenMilestoneCategoryLabel(
    categoryId
) {

    const category =
        CHILDREN_MILESTONE_CATEGORIES.find(
            item =>
                item.id ===
                categoryId
        );


    return category
        ? category.label
        : "";

}


/* =====================================================
   🌱 データ初期化
===================================================== */

function initializeChildrenMilestoneData(child) {

    if (!child) return;


    if (
        !child.growth ||
        typeof child.growth !== "object"
    ) {

        child.growth = {};

    }


    if (
        !Array.isArray(
            child.growth.milestone
        )
    ) {

        child.growth.milestone = [];

    }

}


/* =====================================================
   🌱 現在の子ども
===================================================== */

function getCurrentChildrenMilestoneChild() {

    if (
        typeof childrenData ===
        "undefined"
    ) {
        return null;
    }


    if (
        typeof selectedChildId ===
        "undefined"
    ) {
        return null;
    }


    return (
        childrenData.find(
            child =>
                child.id ===
                selectedChildId
        ) || null
    );

}


/* =====================================================
   🌱 成長・できたことを開く
===================================================== */

function openChildrenMilestone() {

    const growthSection =
        document.getElementById(
            "childrenGrowthSection"
        );


    if (!growthSection) return;


    if (
        typeof resetChildrenGrowthSubPages ===
        "function"
    ) {

        resetChildrenGrowthSubPages();

    }


    /* ---------------------------------------------
       フィルターを「全て」に戻す
    --------------------------------------------- */

    childrenMilestoneFilter =
        "all";


    /* ---------------------------------------------
       成長カテゴリー一覧を隠す
    --------------------------------------------- */

    const categoryList =
        growthSection.querySelector(
            ".children-growth-category-list"
        );


    if (categoryList) {

        categoryList.style.display =
            "none";

    }


    /* ---------------------------------------------
       成長・定期記録の共通ヘッダーを隠す
    --------------------------------------------- */

    const growthHeader =
        growthSection.querySelector(
            ".children-growth-section-header"
        );


    if (growthHeader) {

        growthHeader.style.display =
            "none";

    }


    /* ---------------------------------------------
       カレンダー側の戻るボタンを隠す
    --------------------------------------------- */

    const calendarBackButton =
        document.querySelector(
            ".children-calendar-back-button"
        );


    if (calendarBackButton) {

        calendarBackButton.style.display =
            "none";

    }


    /* ---------------------------------------------
       🌱 下位ページ
    --------------------------------------------- */

    let section =
        document.getElementById(
            "childrenMilestoneSection"
        );


    if (!section) {

        section =
            document.createElement("div");

        section.id =
            "childrenMilestoneSection";

        section.className =
            "children-milestone-section";

        growthSection.appendChild(
            section
        );

    }


    section.style.display =
        "";


    renderChildrenMilestone();

}


/* =====================================================
   🌱 成長・定期記録へ戻る
===================================================== */

function closeChildrenMilestone() {

    const section =
        document.getElementById(
            "childrenMilestoneSection"
        );


    if (section) {

        section.style.display =
            "none";

    }


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
            "";

    }


    const growthHeader =
        growthSection.querySelector(
            ".children-growth-section-header"
        );


    if (growthHeader) {

        growthHeader.style.display =
            "";

    }

}


/* =====================================================
   🌱 日付表示
===================================================== */

function formatChildrenMilestoneDate(date) {

    if (!date) return "";


    if (
        typeof formatChildrenMedicalDate ===
        "function"
    ) {

        return formatChildrenMedicalDate(
            date
        );

    }


    const parts =
        String(date).split("-");


    if (
        parts.length !== 3
    ) {

        return String(date);

    }


    return (
        Number(parts[0]) +
        "年" +
        Number(parts[1]) +
        "月" +
        Number(parts[2]) +
        "日"
    );

}


/* =====================================================
   🌱 年齢表示
===================================================== */

function getChildrenMilestoneAgeText(
    child,
    date
) {

    if (
        !child ||
        !child.birthday ||
        !date
    ) {

        return "";

    }


    if (
        typeof calculateChildrenAgeAtDate ===
        "function"
    ) {

        return calculateChildrenAgeAtDate(
            child.birthday,
            date
        );

    }


    return "";

}


/* =====================================================
   🌱 フィルター変更
===================================================== */

function setChildrenMilestoneFilter(
    categoryId
) {

    childrenMilestoneFilter =
        categoryId || "all";


    renderChildrenMilestone();

}


/* =====================================================
   🌱 フィルター描画
===================================================== */

function renderChildrenMilestoneFilters() {

    let html = "";


    /* ---------------------------------------------
       全て
    --------------------------------------------- */

    html += `

        <label
            class="
                children-milestone-filter-item
            "
        >

            <input
                type="radio"
                name="childrenMilestoneFilter"
                value="all"
                ${
                    childrenMilestoneFilter ===
                    "all"
                        ? "checked"
                        : ""
                }
                onchange="
                    setChildrenMilestoneFilter(
                        'all'
                    )
                "
            >

            <span>
                全て
            </span>

        </label>

    `;


    /* ---------------------------------------------
       9分類
    --------------------------------------------- */

    CHILDREN_MILESTONE_CATEGORIES.forEach(
        category => {

            html += `

                <label
                    class="
                        children-milestone-filter-item
                    "
                >

                    <input
                        type="radio"
                        name="childrenMilestoneFilter"
                        value="${escapeHtml(
                            category.id
                        )}"
                        ${
                            childrenMilestoneFilter ===
                            category.id
                                ? "checked"
                                : ""
                        }
                        onchange="
                            setChildrenMilestoneFilter(
                                '${escapeHtml(
                                    category.id
                                )}'
                            )
                        "
                    >

                    <span>
                        ${escapeHtml(
                            category.label
                        )}
                    </span>

                </label>

            `;

        }
    );


    return `

        <div
            class="
                children-milestone-filter
            "
        >

            <div
                class="
                    children-milestone-filter-title
                "
            >
                絞り込み
            </div>

            <div
                class="
                    children-milestone-filter-list
                "
            >

                ${html}

            </div>

        </div>

    `;

}


/* =====================================================
   🌱 一覧描画
===================================================== */

function renderChildrenMilestone() {

    const child =
        getCurrentChildrenMilestoneChild();


    if (!child) return;


    initializeChildrenMilestoneData(
        child
    );


    const growthSection =
        document.getElementById(
            "childrenGrowthSection"
        );


    if (!growthSection) return;


    let section =
        document.getElementById(
            "childrenMilestoneSection"
        );


    if (!section) {

        section =
            document.createElement("div");

        section.id =
            "childrenMilestoneSection";

        section.className =
            "children-milestone-section";

        growthSection.appendChild(
            section
        );

    }


    /* ---------------------------------------------
       全記録
    --------------------------------------------- */

    let records =
        [...child.growth.milestone];


    /* ---------------------------------------------
       分類フィルター
    --------------------------------------------- */

    if (
        childrenMilestoneFilter !==
        "all"
    ) {

        records =
            records.filter(
                record =>
                    record.category ===
                    childrenMilestoneFilter
            );

    }


    /* ---------------------------------------------
       日付順
    --------------------------------------------- */

    records.sort(
        (a, b) => {

            const dateA =
                String(a.date || "");


            const dateB =
                String(b.date || "");


            if (
                dateA !== dateB
            ) {

                return dateB.localeCompare(
                    dateA
                );

            }


            return String(
                b.createdAt || ""
            ).localeCompare(
                String(
                    a.createdAt || ""
                )
            );

        }
    );


    let recordsHtml = "";


    if (!records.length) {

        if (
            childrenMilestoneFilter ===
            "all"
        ) {

            recordsHtml = `

                <div class="
                    children-milestone-empty
                ">

                    まだ記録がありません。

                </div>

            `;

        } else {

            recordsHtml = `

                <div class="
                    children-milestone-empty
                ">

                    この分類の記録はありません。

                </div>

            `;

        }

    } else {

        recordsHtml =
            records
                .map(
                    record =>
                        renderChildrenMilestoneRecord(
                            child,
                            record
                        )
                )
                .join("");

    }


    /* =================================================
       👶 性別カラー
    ================================================= */

    let genderClass = "";


    if (child.gender === "boy") {

        genderClass =
            "children-milestone-boy";

    }
    else if (child.gender === "girl") {

        genderClass =
            "children-milestone-girl";

    }


    /* =================================================
       ★ 共通ヘッダー
    ================================================= */

    section.innerHTML = `

        <div class="
            children-growth-detail-header
        ">

            <div class="
                children-growth-detail-title
            ">

                🌱 成長・できたこと

            </div>


            <button
                type="button"
                class="
                    children-growth-detail-back
                "
                onclick="
                    closeChildrenMilestone()
                "
            >

                ◀ 成長・定期記録

            </button>

        </div>


        ${renderChildrenMilestoneFilters()}


        <div class="
            children-milestone-add-area
        ">

            <button
                type="button"
                class="
                    children-milestone-add-button
                    ${genderClass}
                "
                onclick="
                    openChildrenMilestoneForm()
                "
            >

                ＋ 記録を追加

            </button>

        </div>


        <div class="
            children-milestone-record-list
        ">

            ${recordsHtml}

        </div>

    `;

}

/* =====================================================
   🌱 1件の記録
===================================================== */

function renderChildrenMilestoneRecord(
    child,
    record
) {

    const ageText =
        getChildrenMilestoneAgeText(
            child,
            record.date
        );


    const dateText =
        formatChildrenMilestoneDate(
            record.date
        );


    const content =
        record.title ||
        record.content ||
        "";


    const categoryLabel =
        getChildrenMilestoneCategoryLabel(
            record.category
        );


    return `

        <div
            class="
                children-milestone-record
            "
            data-record-id="${escapeHtml(
                record.id
            )}"
        >

            <div class="
                children-milestone-record-row1
            ">

                <div class="
                    children-milestone-date-area
                ">

                    <span class="
                        children-milestone-date
                    ">

                        ${escapeHtml(
                            dateText
                        )}

                    </span>


                    ${
                        ageText
                            ? `
                                <span class="
                                    children-milestone-age
                                ">

                                    👶 ${escapeHtml(
                                        ageText
                                    )}

                                </span>
                              `
                            : ""
                    }

                </div>


                <div class="
                    children-milestone-actions
                ">

                    <span
                        class="
                            children-milestone-edit-icon
                        "
                        onclick="
                            editChildrenMilestone(
                                '${escapeHtml(
                                    record.id
                                )}'
                            )
                        "
                        role="button"
                        tabindex="0"
                        aria-label="編集"
                        title="編集"
                    >
                        ✎
                    </span>


                    <span
                        class="
                            children-milestone-delete-icon
                        "
                        onclick="
                            deleteChildrenMilestone(
                                '${escapeHtml(
                                    record.id
                                )}'
                            )
                        "
                        role="button"
                        tabindex="0"
                        aria-label="削除"
                        title="削除"
                    >
                        ×
                    </span>

                </div>

            </div>


            <div
                class="
                    children-milestone-record-row2
                    children-milestone-expandable
                "
                onclick="
                    toggleChildrenMilestoneText(this)
                "
                role="button"
                tabindex="0"
                title="タップで全文表示"
            >

                <span class="
                    children-milestone-record-icon
                ">

                    🌱

                </span>


                <span class="
                    children-milestone-record-content
                ">

                    ${escapeHtml(
                        content
                    )}

                </span>

            </div>


            ${
                categoryLabel
                    ? `
                        <div
                            class="
                                children-milestone-category-label
                            "
                        >

                            ${escapeHtml(
                                categoryLabel
                            )}

                        </div>
                      `
                    : ""
            }


            ${
                record.memo
                    ? `
                        <div class="
                            children-milestone-record-row3
                        ">

                            <div
                                class="
                                    children-milestone-memo
                                    children-milestone-expandable
                                "
                                onclick="
                                    toggleChildrenMilestoneText(
                                        this
                                    )
                                "
                                role="button"
                                tabindex="0"
                                title="タップで全文表示"
                            >

                                📝

                                <span>

                                    ${escapeHtml(
                                        record.memo
                                    )}

                                </span>

                            </div>

                        </div>
                      `
                    : ""
            }

        </div>

    `;

}


/* =====================================================
   🌱 長文展開
===================================================== */

function toggleChildrenMilestoneText(
    element
) {

    if (!element) return;


    element.classList.toggle(
        "is-expanded"
    );


    element.setAttribute(
        "title",
        element.classList.contains(
            "is-expanded"
        )
            ? "タップで閉じる"
            : "タップで全文表示"
    );

}


/* =====================================================
   🌱 記録フォーム
===================================================== */

function openChildrenMilestoneForm(
    recordId = null
) {

    const child =
        getCurrentChildrenMilestoneChild();


    if (!child) return;


    initializeChildrenMilestoneData(
        child
    );


    let record = null;


    if (recordId) {

        record =
            child.growth.milestone.find(
                item =>
                    item.id ===
                    recordId
            ) || null;

    }


    let modal =
        document.getElementById(
            "childrenMilestoneFormModal"
        );


    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "childrenMilestoneFormModal";

        modal.className =
            "children-milestone-form-modal";

        document.body.appendChild(
            modal
        );

    }


    /* =================================================
       👶 子どもカレンダー用カラー
       身長・体重と同じ性別判定
    ================================================= */

    modal.classList.remove(
        "children-milestone-boy",
        "children-milestone-girl"
    );


    if (child.gender === "boy") {

        modal.classList.add(
            "children-milestone-boy"
        );

    }
    else if (child.gender === "girl") {

        modal.classList.add(
            "children-milestone-girl"
        );

    }


    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    const date =
        record?.date ||
        today;


    const content =
        record?.title ||
        record?.content ||
        "";


    const memo =
        record?.memo ||
        "";


    const selectedCategory =
        record?.category ||
        "";


    modal.innerHTML = `

        <div
            class="
                children-milestone-form-overlay
            "
            onclick="
                closeChildrenMilestoneForm()
            "
        ></div>


        <div class="
            children-milestone-form
        ">

            <div class="
                children-milestone-form-title
            ">

                ${
                    recordId
                        ? "🌱 成長記録を編集"
                        : "🌱 成長・できたことを記録"
                }

            </div>


            <label class="
                children-milestone-form-label
            ">

                記録日

                <input
                    type="date"
                    id="childrenMilestoneFormDate"
                    value="${escapeHtml(
                        date
                    )}"
                >

            </label>


            <label class="
                children-milestone-form-label
            ">

                できたこと・成長

                <textarea
                    id="childrenMilestoneFormContent"
                    rows="4"
                    maxlength="1000"
                    placeholder="例：ひとりで靴を履けるようになった"
                >${escapeHtml(
                    content
                )}</textarea>

            </label>


            <label class="
                children-milestone-form-label
            ">

                メモ

                <textarea
                    id="childrenMilestoneFormMemo"
                    rows="3"
                    maxlength="2000"
                    placeholder="気づいたことなど"
                >${escapeHtml(
                    memo
                )}</textarea>

            </label>


            <!-- =====================================
                 🌱 分類
            ====================================== -->

            <div class="
                children-milestone-form-category
            ">

                <div class="
                    children-milestone-form-category-title
                ">

                    分類

                </div>


                <div class="
                    children-milestone-form-category-list
                ">

                    ${
                        CHILDREN_MILESTONE_CATEGORIES
                            .map(
                                category => `
                                    <label
                                        class="
                                            children-milestone-form-category-item
                                        "
                                    >

                                        <input
                                            type="radio"
                                            name="childrenMilestoneFormCategory"
                                            value="${escapeHtml(
                                                category.id
                                            )}"
                                            ${
                                                selectedCategory ===
                                                category.id
                                                    ? "checked"
                                                    : ""
                                            }
                                        >

                                        <span>
                                            ${escapeHtml(
                                                category.label
                                            )}
                                        </span>

                                    </label>
                                `
                            )
                            .join("")
                    }

                </div>

            </div>


            <div class="
                children-milestone-form-actions
            ">

                <button
                    type="button"
                    class="
                        children-milestone-form-cancel
                    "
                    onclick="
                        closeChildrenMilestoneForm()
                    "
                >

                    キャンセル

                </button>


                <button
                    type="button"
                    class="
                        children-milestone-form-save
                    "
                    onclick="
                        saveChildrenMilestoneRecord(
                            ${
                                recordId
                                    ? `'${escapeHtml(
                                        recordId
                                    )}'`
                                    : "null"
                            }
                        )
                    "
                >

                    保存

                </button>

            </div>

        </div>

    `;


    modal.style.display =
        "flex";

}



/* =====================================================
   🌱 編集
===================================================== */

function editChildrenMilestone(
    recordId
) {

    openChildrenMilestoneForm(
        recordId
    );

}


/* =====================================================
   🌱 保存
===================================================== */

function saveChildrenMilestoneRecord(
    recordId = null
) {

    const child =
        getCurrentChildrenMilestoneChild();


    if (!child) return;


    initializeChildrenMilestoneData(
        child
    );


    const dateInput =
        document.getElementById(
            "childrenMilestoneFormDate"
        );


    const contentInput =
        document.getElementById(
            "childrenMilestoneFormContent"
        );


    const memoInput =
        document.getElementById(
            "childrenMilestoneFormMemo"
        );


    const categoryInput =
        document.querySelector(
            'input[name="childrenMilestoneFormCategory"]:checked'
        );


    const date =
        dateInput
            ? dateInput.value
            : "";


    const content =
        contentInput
            ? contentInput.value.trim()
            : "";


    const memo =
        memoInput
            ? memoInput.value.trim()
            : "";


    const category =
        categoryInput
            ? categoryInput.value
            : "";


    if (!date) {

        alert(
            "記録日を入力してください。"
        );

        return;

    }


    if (!content) {

        alert(
            "できたこと・成長を入力してください。"
        );

        return;

    }


    if (!category) {

        alert(
            "分類を選択してください。"
        );

        return;

    }


    if (recordId) {

        const index =
            child.growth.milestone.findIndex(
                item =>
                    item.id ===
                    recordId
            );


        if (index !== -1) {

            const oldRecord =
                child.growth.milestone[
                    index
                ];


            child.growth.milestone[
                index
            ] = {

                ...oldRecord,

                date,

                title:
                    content,

                content,

                memo,

                category,

                updatedAt:
                    new Date()
                        .toISOString()

            };

        }

    } else {

        child.growth.milestone.push({

            id:
                "milestone_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .slice(2, 8),

            date,

            title:
                content,

            content,

            memo,

            category,

            createdAt:
                new Date()
                    .toISOString(),

            updatedAt:
                new Date()
                    .toISOString()

        });

    }


    if (
        typeof saveChildrenGrowthData ===
        "function"
    ) {

        saveChildrenGrowthData();

    } else if (
        typeof saveChildrenData ===
        "function"
    ) {

        saveChildrenData();

    }


    closeChildrenMilestoneForm();


    renderChildrenMilestone();

}


/* =====================================================
   🌱 削除
===================================================== */

function deleteChildrenMilestone(
    recordId
) {

    const child =
        getCurrentChildrenMilestoneChild();


    if (!child) return;


    const record =
        child.growth.milestone.find(
            item =>
                item.id ===
                recordId
        );


    if (!record) return;


    if (
        !confirm(
            "この成長記録を削除しますか？"
        )
    ) {

        return;

    }


    child.growth.milestone =
        child.growth.milestone.filter(
            item =>
                item.id !==
                recordId
        );


    if (
        typeof saveChildrenGrowthData ===
        "function"
    ) {

        saveChildrenGrowthData();

    } else if (
        typeof saveChildrenData ===
        "function"
    ) {

        saveChildrenData();

    }


    renderChildrenMilestone();

}


/* =====================================================
   🌱 フォームを閉じる
===================================================== */

function closeChildrenMilestoneForm() {

    const modal =
        document.getElementById(
            "childrenMilestoneFormModal"
        );


    if (!modal) return;


    modal.style.display =
        "none";

}


/* =====================================================
   🌱 カテゴリークリック
===================================================== */

if (
    !window.childrenMilestoneDetailsInitialized
) {

    window.childrenMilestoneDetailsInitialized =
        true;


    document.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    ".children-growth-category"
                );


            if (!button) return;


            const category =
                button.dataset.growthCategory;


            if (
                category ===
                "milestone"
            ) {

                openChildrenMilestone();

            }

        }
    );

}