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

}