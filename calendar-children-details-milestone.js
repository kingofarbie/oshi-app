/* =====================================================
   🌱 成長・できたこと
   -----------------------------------------------------
   ・子どもごとに完全分離
   ・同日複数記録対応
   ・年齢は保存せず自動計算
   ・追加 / 編集 / 削除
   ・新しい記録から表示
===================================================== */


/* =====================================================
   🌱 成長・できたこと画面を開く
===================================================== */

function openChildrenMilestone() {

    const child =
        getSelectedChild();

    if (!child) return;


    initializeChildrenGrowthData(
        child
    );


    /* =================================================
       他の成長ページを閉じる
    ================================================= */

    resetChildrenGrowthSubPages();


    /* =================================================
       「◀ カレンダー」を非表示
    ================================================= */

    const calendarBackButton =
        document.querySelector(
            ".children-calendar-back-button"
        );

    if (calendarBackButton) {

        calendarBackButton.style.display =
            "none";

    }


    /* =================================================
       成長・定期記録入口を非表示
    ================================================= */

    const growthSection =
        document.getElementById(
            "childrenGrowthSection"
        );

    if (growthSection) {

        growthSection.style.display =
            "none";

    }


    /* =================================================
       既存の成長・できたこと画面を取得
    ================================================= */

    let section =
        document.getElementById(
            "childrenMilestoneSection"
        );


    if (!section) {

        section =
            document.createElement(
                "section"
            );

        section.id =
            "childrenMilestoneSection";

        section.className =
            "children-milestone-section";


        const app =
            document.getElementById(
                "childrenCalendarApp"
            );

        if (!app) return;


        app.appendChild(
            section
        );

    }


    section.style.display =
        "";


    renderChildrenMilestone();

}


/* =====================================================
   🌱 成長・できたこと画面を閉じる
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


        const growthHeader =
            growthSection.querySelector(
                ".children-growth-section-header"
            );


        if (growthHeader) {

            growthHeader.style.display =
                "";

        }

    }


    /* =================================================
       「◀ カレンダー」を戻す
    ================================================= */

    const calendarBackButton =
        document.querySelector(
            ".children-calendar-back-button"
        );


    if (calendarBackButton) {

        calendarBackButton.style.display =
            "";

        calendarBackButton.textContent =
            "◀ カレンダー";

    }

}


/* =====================================================
   🌱 成長・できたこと画面描画
===================================================== */

function renderChildrenMilestone() {

    const child =
        getSelectedChild();

    if (!child) return;


    initializeChildrenGrowthData(
        child
    );


    const section =
        document.getElementById(
            "childrenMilestoneSection"
        );


    if (!section) return;


    section.innerHTML = `

        <div
            class="children-growth-detail-header"
        >

            <div
                class="children-growth-detail-title"
            >
                🌱 成長・できたこと
            </div>


            <button
                type="button"
                class="children-growth-detail-back"
                id="childrenMilestoneBackButton"
            >
                ◀ 成長・定期記録
            </button>

        </div>


        <div
            class="children-milestone-child-name"
        >
            👶 ${escapeHtml(
                child.name || ""
            )}
        </div>


        <button
            type="button"
            class="children-milestone-add-button"
            id="childrenMilestoneAddButton"
        >
            ＋ 記録を追加
        </button>


        <div
            class="children-milestone-history"
        >

            <div
                class="children-milestone-history-title"
            >
                記録一覧
            </div>


            <div
                id="childrenMilestoneHistoryList"
            ></div>

        </div>

    `;


    /* =================================================
       戻る
    ================================================= */

    const backButton =
        document.getElementById(
            "childrenMilestoneBackButton"
        );


    if (backButton) {

        backButton.onclick =
            closeChildrenMilestone;

    }


    /* =================================================
       ＋ 記録を追加
    ================================================= */

    const addButton =
        document.getElementById(
            "childrenMilestoneAddButton"
        );


    if (addButton) {

        addButton.onclick =
            function () {

                openChildrenMilestoneModal();

            };

    }


    renderChildrenMilestoneHistory();

}


/* =====================================================
   🌱 成長・できたこと 履歴
===================================================== */

function renderChildrenMilestoneHistory() {

    const child =
        getSelectedChild();

    const list =
        document.getElementById(
            "childrenMilestoneHistoryList"
        );


    if (!child || !list) return;


    initializeChildrenGrowthData(
        child
    );


    const records =
        [...child.growth.milestone]
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


                    if (
                        aDate !==
                        bDate
                    ) {

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

            <div
                class="children-growth-empty"
            >
                まだ記録がありません。
            </div>

        `;

        return;

    }


    /* =================================================
       表示件数
    ================================================= */

    const displayAll =
        list.dataset.displayAll ===
        "true";


    const displayRecords =
        displayAll
            ? records
            : records.slice(
                0,
                3
            );


    list.innerHTML =
        displayRecords
            .map(
                record => {

                    const age =
                        calculateChildrenAgeAtDate(
                            child.birthday,
                            record.date
                        );


                    return `

                        <div
                            class="children-milestone-item"
                            data-milestone-id="${escapeHtml(
                                record.id
                            )}"
                        >

                            <div
                                class="children-milestone-item-header"
                            >

                                <div
                                    class="children-milestone-item-date"
                                >
                                    ${escapeHtml(
                                        record.date
                                    )}
                                </div>


                                <div
                                    class="children-milestone-item-age"
                                >
                                    👶 ${
                                        escapeHtml(
                                            age || "―"
                                        )
                                    }
                                </div>


                                <div
                                    class="children-milestone-item-actions"
                                >

                                    <button
                                        type="button"
                                        class="children-milestone-edit"
                                        data-milestone-action="edit"
                                        data-milestone-id="${escapeHtml(
                                            record.id
                                        )}"
                                        aria-label="編集"
                                        title="編集"
                                    >
                                        ✎
                                    </button>


                                    <button
                                        type="button"
                                        class="children-milestone-delete"
                                        data-milestone-action="delete"
                                        data-milestone-id="${escapeHtml(
                                            record.id
                                        )}"
                                        aria-label="削除"
                                        title="削除"
                                    >
                                        ×
                                    </button>

                                </div>

                            </div>


                            <div
                                class="children-milestone-item-content"
                            >

                                🌱
                                ${escapeHtml(
                                    record.title
                                )}

                            </div>


                            ${
                                record.memo
                                    ? `

                                        <div
                                            class="children-milestone-item-memo"
                                        >
                                            📝
                                            ${escapeHtml(
                                                record.memo
                                            )}
                                        </div>

                                    `
                                    : ""
                            }

                        </div>

                    `;

                }
            )
            .join("");


    /* =================================================
       さらに表示
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
            "children-milestone-history-more";


        moreButton.textContent =
            displayAll
                ? "閉じる"
                : "さらに表示";


        moreButton.onclick =
            function () {

                list.dataset.displayAll =
                    displayAll
                        ? "false"
                        : "true";


                renderChildrenMilestoneHistory();

            };


        list.appendChild(
            moreButton
        );

    }


    /* =================================================
       編集・削除
    ================================================= */

    list
        .querySelectorAll(
            "[data-milestone-action]"
        )
        .forEach(
            button => {

                button.onclick =
                    function () {

                        const action =
                            this.dataset.milestoneAction;


                        const milestoneId =
                            this.dataset.milestoneId;


                        const recordIndex =
                            child.growth.milestone
                                .findIndex(
                                    item =>
                                        item.id ===
                                        milestoneId
                                );


                        if (
                            recordIndex <
                            0
                        ) {

                            return;

                        }


                        const record =
                            child.growth.milestone[
                                recordIndex
                            ];


                        /* =============================
                           削除
                        ============================= */

                        if (
                            action ===
                            "delete"
                        ) {

                            const confirmed =
                                window.confirm(
                                    "この成長記録を削除しますか？"
                                );


                            if (!confirmed) {

                                return;

                            }


                            child.growth.milestone
                                .splice(
                                    recordIndex,
                                    1
                                );


                            saveChildrenGrowthData();


                            list.dataset.displayAll =
                                "false";


                            renderChildrenMilestone();

                            return;

                        }


                        /* =============================
                           編集
                        ============================= */

                        if (
                            action ===
                            "edit"
                        ) {

                            openChildrenMilestoneModal(
                                record
                            );

                        }

                    };

            }
        );

}


/* =====================================================
   🌱 記録追加・編集
===================================================== */

function openChildrenMilestoneModal(
    editRecord = null
) {

    const child =
        getSelectedChild();

    if (!child) return;


    initializeChildrenGrowthData(
        child
    );


    const modalId =
        "childrenMilestoneModal";


    const oldModal =
        document.getElementById(
            modalId
        );


    if (oldModal) {

        oldModal.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        modalId;

    modal.className =
        "children-modal";


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
        ).padStart(2, "0"
        );


    modal.innerHTML = `

        <div
            class="children-modal-overlay"
        ></div>


        <div
            class="children-modal-content children-milestone-modal"
        >

            <div
                class="children-modal-header"
            >

                <h2>
                    🌱 ${
                        editRecord
                            ? "成長記録を編集"
                            : "成長記録を追加"
                    }
                </h2>


                <button
                    type="button"
                    class="children-modal-close-button"
                    id="childrenMilestoneModalClose"
                >
                    ×
                </button>

            </div>


            <div
                class="children-milestone-form"
            >

                <label>

                    記録日

                    <input
                        type="date"
                        id="childrenMilestoneDateInput"
                        value="${
                            editRecord?.date ||
                            todayText
                        }"
                    >

                </label>


                <div
                    id="childrenMilestoneAgeDisplay"
                    class="children-milestone-age-display"
                ></div>


                <label>

                    できたこと

                    <input
                        type="text"
                        id="childrenMilestoneTitleInput"
                        maxlength="200"
                        value="${escapeHtml(
                            editRecord?.title ||
                            ""
                        )}"
                        placeholder="例：ひとりで歩けた"
                    >

                </label>


                <label>

                    メモ

                    <textarea
                        id="childrenMilestoneMemoInput"
                        maxlength="500"
                        rows="4"
                        placeholder="気づいたことなど"
                    >${escapeHtml(
                        editRecord?.memo ||
                        ""
                    )}</textarea>

                </label>


                <div
                    class="children-milestone-form-actions"
                >

                    <button
                        type="button"
                        id="childrenMilestoneCancelButton"
                        class="children-milestone-cancel"
                    >
                        キャンセル
                    </button>


                    <button
                        type="button"
                        id="childrenMilestoneSaveButton"
                        class="children-milestone-save"
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
            "childrenMilestoneDateInput"
        );


    const titleInput =
        document.getElementById(
            "childrenMilestoneTitleInput"
        );


    const memoInput =
        document.getElementById(
            "childrenMilestoneMemoInput"
        );


    const ageDisplay =
        document.getElementById(
            "childrenMilestoneAgeDisplay"
        );


    /* =================================================
       年齢表示
    ================================================= */

    function updateAge() {

        const age =
            calculateChildrenAgeAtDate(
                child.birthday,
                dateInput.value
            );


        ageDisplay.textContent =
            age
                ? "記録時年齢：" + age
                : "記録時年齢：―";

    }


    updateAge();


    dateInput.addEventListener(
        "change",
        updateAge
    );


    /* =================================================
       閉じる
    ================================================= */

    document
        .getElementById(
            "childrenMilestoneModalClose"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    document
        .getElementById(
            "childrenMilestoneCancelButton"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );


    /* =================================================
       保存
    ================================================= */

    document
        .getElementById(
            "childrenMilestoneSaveButton"
        )
        .addEventListener(
            "click",
            function () {

                const date =
                    dateInput.value;


                const title =
                    titleInput.value.trim();


                const memo =
                    memoInput.value.trim();


                if (!date) {

                    alert(
                        "記録日を入力してください。"
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


                if (!title) {

                    alert(
                        "できたことを入力してください。"
                    );

                    return;

                }


                const now =
                    new Date().toISOString();


                if (editRecord) {

                    editRecord.date =
                        date;

                    editRecord.title =
                        title;

                    editRecord.memo =
                        memo;


                    /*
                       編集時も
                       元の recordedAt は維持。
                    */

                }
                else {

                    child.growth.milestone.push({

                        id:
                            "milestone-" +
                            Date.now() +
                            "-" +
                            Math.random()
                                .toString(36)
                                .slice(2, 8),

                        date:
                            date,

                        title:
                            title,

                        memo:
                            memo,

                        recordedAt:
                            now

                    });

                }


                saveChildrenGrowthData();


                modal.remove();


                renderChildrenMilestone();

            }
        );

}