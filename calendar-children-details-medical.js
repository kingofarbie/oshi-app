/* =====================================================
   🏥 健診・病院画面を開く
===================================================== */

function openChildrenMedical() {

    const child =
        getSelectedChild();

    if (!child) return;


    /* ---------------------------------------------
       他の成長ページを閉じる
    --------------------------------------------- */

    resetChildrenGrowthSubPages();


    const calendarBackButton =
        document.querySelector(
            ".children-calendar-back-button"
        );

    if (calendarBackButton) {

        calendarBackButton.style.display =
            "none";

    }


    const growthSection =
        document.getElementById(
            "childrenGrowthSection"
        );

    if (growthSection) {

        growthSection.style.display =
            "none";

    }


    /* ---------------------------------------------
       健診・病院ページを取得
    --------------------------------------------- */

    let section =
        document.getElementById(
            "childrenMedicalSection"
        );


    if (!section) {

        section =
            document.createElement(
                "section"
            );

        section.id =
            "childrenMedicalSection";

        section.className =
            "children-medical-section";


        const app =
            document.getElementById(
                "childrenCalendarApp"
            );

        if (!app) return;

        app.appendChild(section);

    }


    section.style.display =
        "";

    renderChildrenMedical();

}


/* =====================================================
   🏥 健診・病院画面
===================================================== */

/* =====================================================
   🏥 健診・病院画面
===================================================== */

function renderChildrenMedical() {

    const section =
        document.getElementById(
            "childrenMedicalSection"
        );

    const child =
        typeof getSelectedChild === "function"
            ? getSelectedChild()
            : null;

    if (!section || !child) return;

    initializeChildrenGrowthData(
        child
    );

    section.innerHTML = `

        <div class="children-growth-detail-header">

            <div class="children-growth-detail-title">
                🏥 健診・病院
            </div>

            <button
                type="button"
                class="children-growth-detail-back"
                id="childrenMedicalBackButton"
            >
                ◀ 成長・定期記録
            </button>

        </div>


        <!-- =========================================
             ＋ 記録を追加
        ========================================== -->

        <div class="children-medical-add-area">

            <button
                type="button"
                class="children-medical-add-button"
                id="childrenMedicalAddButton"
            >
                ＋ 記録を追加
            </button>

        </div>


        <!-- =========================================
             🏥 健診・病院の記録一覧
        ========================================== -->

        <div
            class="children-medical-record-list"
            id="childrenMedicalRecordList"
        ></div>

    `;


    /* =================================================
       ◀ 成長・定期記録へ戻る
    ================================================= */

    const backButton =
        document.getElementById(
            "childrenMedicalBackButton"
        );

    if (backButton) {

        backButton.onclick =
            closeChildrenMedical;

    }


    /* =================================================
       ＋ 記録を追加
    ================================================= */

    const addButton =
        document.getElementById(
            "childrenMedicalAddButton"
        );

    if (addButton) {

        addButton.onclick =
            function () {

                /*
                 * 次の段階で
                 * 「記録の種類を選ぶ画面」
                 * をここから開く
                 */

                alert(
                    "ここから健診・病院の記録を追加します。"
                );

            };

    }


    /* =================================================
       記録一覧
    ================================================= */

    const recordList =
        document.getElementById(
            "childrenMedicalRecordList"
        );

    if (!recordList) return;


    const records =
        Array.isArray(child.growth.medical)
            ? child.growth.medical
            : [];


    if (!records.length) {

        recordList.innerHTML = `

            <div class="children-medical-empty">

                まだ健診・病院の記録がありません。

            </div>

        `;

        return;

    }


    /* =================================================
       日付順
    ================================================= */

    const sortedRecords =
        records
            .slice()
            .sort(function (a, b) {

                const dateA =
                    a.date || "";

                const dateB =
                    b.date || "";

                return dateB.localeCompare(
                    dateA
                );

            });


    /* =================================================
       記録表示
    ================================================= */

    recordList.innerHTML =
        sortedRecords
            .map(function (record) {

                return `

                    <div
                        class="children-medical-record"
                    >

                        <div
                            class="children-medical-record-date"
                        >
                            ${escapeHtml(
                                record.date || ""
                            )}
                        </div>

                        <div
                            class="children-medical-record-title"
                        >
                            ${escapeHtml(
                                record.title || "健診・病院"
                            )}
                        </div>

                        <div
                            class="children-medical-record-detail"
                        >
                            ${escapeHtml(
                                record.memo || ""
                            )}
                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =====================================================
   🏥 健診・病院画面を閉じる
===================================================== */

function closeChildrenMedical() {

    const section =
        document.getElementById(
            "childrenMedicalSection"
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

    }


    const categoryList =
        growthSection
            ? growthSection.querySelector(
                ".children-growth-category-list"
            )
            : null;

    if (categoryList) {

        categoryList.style.display =
            "";

    }


    const growthHeader =
        growthSection
            ? growthSection.querySelector(
                ".children-growth-section-header"
            )
            : null;

    if (growthHeader) {

        growthHeader.style.display =
            "";

    }

}