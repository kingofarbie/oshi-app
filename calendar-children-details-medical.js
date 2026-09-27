/* =====================================================
   🏥 健診・病院
   calendar-children-details-medical.js

   ・妊娠中の健診
   ・出産
   ・乳幼児健診
   ・病院受診
   ・その他の健診・検査
   ・子どもごとに完全分離
   ・時系列で記録
===================================================== */


/* =====================================================
   🏥 健診・病院画面を開く
===================================================== */

function openChildrenMedical() {

    const child =
        getSelectedChild();

    if (!child) return;

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

    const records =
        Array.isArray(child.growth.medical)
            ? child.growth.medical
            : [];


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


        <div class="children-medical-child-name">
            👶 ${escapeHtml(child.name || "")}
        </div>


        <div class="children-medical-note">

            妊娠中から出産後までの
            健診・病院・検査などを
            子どもごとに時系列で記録できます。

        </div>


        <div class="children-medical-add-area">

            <button
                type="button"
                class="children-medical-add-button"
                id="childrenMedicalAddButton"
            >
                ＋ 記録を追加
            </button>

        </div>


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

                openChildrenMedicalRecordModal();

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


    /* =================================================
       記録なし
    ================================================= */

    if (!records.length) {

        recordList.innerHTML = `

            <div class="children-medical-empty">

                まだ健診・病院の記録がありません。

                <div>
                    「＋ 記録を追加」から
                    最初の記録を登録できます。
                </div>

            </div>

        `;

        return;

    }


    /* =================================================
       日付・登録日時で新しい順
    ================================================= */

    const sortedRecords =
        records
            .slice()
            .sort(function (a, b) {

                const dateA =
                    a.date || "";

                const dateB =
                    b.date || "";

                const dateCompare =
                    dateB.localeCompare(
                        dateA
                    );

                if (dateCompare !== 0) {
                    return dateCompare;
                }

                return (
                    b.recordedAt || ""
                ).localeCompare(
                    a.recordedAt || ""
                );

            });


    /* =================================================
       🏥 3段表示
    ================================================= */

    recordList.innerHTML =
        sortedRecords
            .map(function (record) {

                return renderChildrenMedicalRecord(
                    child,
                    record
                );

            })
            .join("");
}


/* =====================================================
   🏥 医療記録1件

   1段目
   日付・年齢                         編集・削除

   2段目
   種類・内容                         病院・施設

   3段目
   メモ
===================================================== */

/* =====================================================
   🏥 医療記録1件

   1段目
   日付・年齢                         編集・削除

   2段目
   種類・内容　病院・施設

   3段目
   メモ
===================================================== */

function renderChildrenMedicalRecord(
    child,
    record
) {

    const type =
        record.type ||
        "other";

    const typeInfo =
        getChildrenMedicalRecordType(
            type
        );


    /* =================================================
       年齢
    ================================================= */

    let ageText = "";

    /*
     * 妊娠中の記録は
     * 子どもの誕生日より前になるため
     * 年齢は表示しない
     */

    if (
        type !== "pregnancy" &&
        child.birthday &&
        record.date
    ) {

        if (
            typeof calculateChildrenAgeAtDate ===
            "function"
        ) {

            ageText =
                calculateChildrenAgeAtDate(
                    child.birthday,
                    record.date
                );

        }

    }


    /* =================================================
       1段目
       日付＋年齢
    ================================================= */

    let dateAgeHtml = `

        <span class="children-medical-record-date">

            ${escapeHtml(
                formatChildrenMedicalDate(
                    record.date
                )
            )}

        </span>

    `;


    if (
        type === "pregnancy" &&
        record.pregnancyWeek
    ) {

        dateAgeHtml += `

            <span class="children-medical-record-age">

                🤰 妊娠${escapeHtml(
                    record.pregnancyWeek
                )}週

            </span>

        `;

    } else if (
        ageText
    ) {

        dateAgeHtml += `

            <span class="children-medical-record-age">

                👶 ${escapeHtml(
                    ageText
                )}

            </span>

        `;

    }


    /* =================================================
       2段目
       種類・内容＋病院・施設

       例：
       3〜4ヶ月健診　○○小児科
    ================================================= */

    let secondRowParts = [];


    /* ---------------------------------------------
       種類
    --------------------------------------------- */

    secondRowParts.push(`

        <span class="children-medical-record-type">

            ${typeInfo.icon}

            ${escapeHtml(
                typeInfo.name
            )}

        </span>

    `);


    /* ---------------------------------------------
       内容
    --------------------------------------------- */

    if (
        record.title &&
        record.title !== typeInfo.name
    ) {

        secondRowParts.push(`

            <span
                class="children-medical-record-title children-medical-expandable"
                onclick="toggleChildrenMedicalText(this)"
                role="button"
                tabindex="0"
                title="タップで全文表示"
            >

                ${escapeHtml(
                    record.title
                )}

            </span>

        `);

    }


    /* ---------------------------------------------
       出産情報
    --------------------------------------------- */

    if (
        type === "birth"
    ) {

        const birthParts = [];


        if (
            record.deliveryMethod
        ) {

            birthParts.push(
                escapeHtml(
                    record.deliveryMethod
                )
            );

        }


        if (
            record.birthWeight
        ) {

            birthParts.push(
                `体重 ${escapeHtml(
                    record.birthWeight
                )}g`
            );

        }


        if (
            record.birthHeight
        ) {

            birthParts.push(
                `身長 ${escapeHtml(
                    record.birthHeight
                )}cm`
            );

        }


        if (
            record.birthHead
        ) {

            birthParts.push(
                `頭囲 ${escapeHtml(
                    record.birthHead
                )}cm`
            );

        }


        if (
            record.birthChest
        ) {

            birthParts.push(
                `胸囲 ${escapeHtml(
                    record.birthChest
                )}cm`
            );

        }


        if (
            birthParts.length
        ) {

            secondRowParts.push(`

                <span
                    class="children-medical-record-birth-info children-medical-expandable"
                    onclick="toggleChildrenMedicalText(this)"
                    role="button"
                    tabindex="0"
                    title="タップで全文表示"
                >

                    ${birthParts.join("　")}

                </span>

            `);

        }

    }


    /* ---------------------------------------------
       病院・施設
    --------------------------------------------- */

    if (
        record.hospital
    ) {

        secondRowParts.push(`

            <span
                class="children-medical-record-hospital children-medical-expandable"
                onclick="toggleChildrenMedicalText(this)"
                role="button"
                tabindex="0"
                title="タップで全文表示"
            >

                🏥 ${escapeHtml(
                    record.hospital
                )}

            </span>

        `);

    }


    /* =================================================
       3段目
       メモ
    ================================================= */

    let memoHtml = "";

    if (
        record.memo
    ) {

        memoHtml = `

            <div class="children-medical-record-row3">

                <div
                    class="children-medical-record-memo children-medical-expandable"
                    onclick="toggleChildrenMedicalText(this)"
                    role="button"
                    tabindex="0"
                    title="タップで全文表示"
                >

                    📝

                    <span class="children-medical-expandable-text">

                        ${escapeHtml(
                            record.memo
                        )}

                    </span>

                </div>

            </div>

        `;

    }


    /* =================================================
       1記録
    ================================================= */

    return `

        <div
            class="children-medical-record"
            data-record-id="${escapeHtml(record.id)}"
        >

            <!-- =====================================
                 1段目
            ====================================== -->

            <div class="children-medical-record-row1">

                <div class="children-medical-record-date-area">

                    ${dateAgeHtml}

                </div>


                <div class="children-medical-record-actions">

                    <span
                        class="children-medical-edit-icon"
                        onclick="editChildrenMedicalRecord('${escapeHtml(record.id)}')"
                        role="button"
                        tabindex="0"
                        aria-label="編集"
                        title="編集"
                    >
                        ✎
                    </span>

                    <span
                        class="children-medical-delete-icon"
                        onclick="deleteChildrenMedicalRecord('${escapeHtml(record.id)}')"
                        role="button"
                        tabindex="0"
                        aria-label="削除"
                        title="削除"
                    >
                        ×
                    </span>

                </div>

            </div>


            <!-- =====================================
                 2段目
            ====================================== -->

            <div
                class="children-medical-record-row2 children-medical-expandable"
                onclick="toggleChildrenMedicalText(this)"
                role="button"
                tabindex="0"
                title="タップで全文表示"
            >

                ${secondRowParts.join("")}

            </div>


            <!-- =====================================
                 3段目
            ====================================== -->

            ${memoHtml}

        </div>

    `;

}


/* =====================================================
   🏥 長い文字の展開 / 折りたたみ
===================================================== */

function toggleChildrenMedicalText(
    element
) {

    if (!element) return;


    element.classList.toggle(
        "is-expanded"
    );


    if (
        element.classList.contains(
            "is-expanded"
        )
    ) {

        element.setAttribute(
            "title",
            "タップで閉じる"
        );

    } else {

        element.setAttribute(
            "title",
            "タップで全文表示"
        );

    }

}

/* =====================================================
   🏥 記録種類
===================================================== */

function getChildrenMedicalRecordType(
    type
) {

    const types = {

        pregnancy: {
            icon: "🤰",
            name: "妊婦健診"
        },

        birth: {
            icon: "👶",
            name: "出産"
        },

        infant_checkup: {
            icon: "🍼",
            name: "乳幼児健診"
        },

        hospital: {
            icon: "🏥",
            name: "病院受診"
        },

        examination: {
            icon: "🩺",
            name: "健診・検査"
        },

        other: {
            icon: "📋",
            name: "その他"
        }

    };

    return (
        types[type] ||
        types.other
    );
}


/* =====================================================
   🏥 記録追加・編集モーダル
===================================================== */

function openChildrenMedicalRecordModal(
    editId = ""
) {

    const child =
        getSelectedChild();

    if (!child) return;

    initializeChildrenGrowthData(
        child
    );


    const existing =
        editId
            ? child.growth.medical.find(
                function (record) {
                    return record.id === editId;
                }
            )
            : null;


    const modalId =
        "childrenMedicalRecordModal";


    const oldModal =
        document.getElementById(
            modalId
        );

    if (oldModal) {
        oldModal.remove();
    }


    const today =
        new Date();


    const defaultDate =
        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            today.getDate()
        ).padStart(2, "0");


    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        modalId;

    modal.className =
        "children-modal";


    modal.innerHTML = `

        <div
            class="children-modal-overlay"
            id="childrenMedicalModalOverlay"
        ></div>


        <div
            class="children-modal-content children-medical-record-modal"
        >

            <div class="children-modal-header">

                <h2>
                    🏥 ${editId
                        ? "記録を編集"
                        : "記録を追加"}
                </h2>

                <button
                    type="button"
                    class="children-modal-close-button"
                    id="childrenMedicalModalClose"
                >
                    ×
                </button>

            </div>


            <div class="children-medical-form">


                <!-- =================================
                     記録日
                ================================== -->

                <label>

                    記録日

                    <input
                        type="date"
                        id="childrenMedicalDateInput"
                        value="${escapeHtml(
                            existing?.date ||
                            defaultDate
                        )}"
                    >

                </label>


                <!-- =================================
                     記録種類
                ================================== -->

                <label>

                    記録の種類

                    <select
                        id="childrenMedicalTypeInput"
                    >

                        <option
                            value="pregnancy"
                            ${existing?.type === "pregnancy"
                                ? "selected"
                                : ""}
                        >
                            🤰 妊婦健診
                        </option>

                        <option
                            value="birth"
                            ${existing?.type === "birth"
                                ? "selected"
                                : ""}
                        >
                            👶 出産
                        </option>

                        <option
                            value="infant_checkup"
                            ${existing?.type === "infant_checkup"
                                ? "selected"
                                : ""}
                        >
                            🍼 乳幼児健診
                        </option>

                        <option
                            value="hospital"
                            ${existing?.type === "hospital"
                                ? "selected"
                                : ""}
                        >
                            🏥 病院受診
                        </option>

                        <option
                            value="examination"
                            ${existing?.type === "examination"
                                ? "selected"
                                : ""}
                        >
                            🩺 健診・検査
                        </option>

                        <option
                            value="other"
                            ${existing?.type === "other"
                                ? "selected"
                                : ""}
                        >
                            📋 その他
                        </option>

                    </select>

                </label>


                <!-- =================================
                     内容
                ================================== -->

                <label>

                    タイトル

                    <input
                        type="text"
                        id="childrenMedicalTitleInput"
                        maxlength="200"
                        placeholder="例：1か月健診"
                        value="${escapeHtml(
                            existing?.title ||
                            ""
                        )}"
                    >

                </label>


                <!-- =================================
                     病院
                ================================== -->

                <label>

                    病院・施設名

                    <input
                        type="text"
                        id="childrenMedicalHospitalInput"
                        maxlength="200"
                        placeholder="例：○○小児科"
                        value="${escapeHtml(
                            existing?.hospital ||
                            ""
                        )}"
                    >

                </label>


                <!-- =================================
                     妊娠週数
                ================================== -->

                <div
                    id="childrenMedicalPregnancyFields"
                    class="children-medical-extra-fields"
                >

                    <label>

                        妊娠週数

                        <input
                            type="number"
                            id="childrenMedicalPregnancyWeekInput"
                            min="1"
                            max="45"
                            placeholder="例：12"
                            value="${escapeHtml(
                                existing?.pregnancyWeek ||
                                ""
                            )}"
                        >

                    </label>

                </div>


                <!-- =================================
                     出産情報
                ================================== -->

                <div
                    id="childrenMedicalBirthFields"
                    class="children-medical-extra-fields"
                >

                    <div class="children-medical-subtitle">

                        👶 出生時の記録

                    </div>


                    <label>

                        出産方法

                        <select
                            id="childrenMedicalDeliveryMethodInput"
                        >

                            <option value="">
                                選択してください
                            </option>

                            <option
                                value="経腟分娩"
                                ${existing?.deliveryMethod === "経腟分娩"
                                    ? "selected"
                                    : ""}
                            >
                                経腟分娩
                            </option>

                            <option
                                value="帝王切開"
                                ${existing?.deliveryMethod === "帝王切開"
                                    ? "selected"
                                    : ""}
                            >
                                帝王切開
                            </option>

                            <option
                                value="その他"
                                ${existing?.deliveryMethod === "その他"
                                    ? "selected"
                                    : ""}
                            >
                                その他
                            </option>

                        </select>

                    </label>


                    <label>

                        出生体重（g）

                        <input
                            type="number"
                            id="childrenMedicalBirthWeightInput"
                            min="0"
                            placeholder="例：3120"
                            value="${escapeHtml(
                                existing?.birthWeight ||
                                ""
                            )}"
                        >

                    </label>


                    <label>

                        出生身長（cm）

                        <input
                            type="number"
                            id="childrenMedicalBirthHeightInput"
                            min="0"
                            step="0.1"
                            placeholder="例：49.5"
                            value="${escapeHtml(
                                existing?.birthHeight ||
                                ""
                            )}"
                        >

                    </label>


                    <label>

                        頭囲（cm）

                        <input
                            type="number"
                            id="childrenMedicalBirthHeadInput"
                            min="0"
                            step="0.1"
                            value="${escapeHtml(
                                existing?.birthHead ||
                                ""
                            )}"
                        >

                    </label>


                    <label>

                        胸囲（cm）

                        <input
                            type="number"
                            id="childrenMedicalBirthChestInput"
                            min="0"
                            step="0.1"
                            value="${escapeHtml(
                                existing?.birthChest ||
                                ""
                            )}"
                        >

                    </label>

                </div>


                <!-- =================================
                     メモ
                ================================== -->

                <label>

                    メモ

                    <textarea
                        id="childrenMedicalMemoInput"
                        maxlength="2000"
                        rows="5"
                        placeholder="検査結果・先生からの説明・気になったことなど"
                    >${escapeHtml(
                        existing?.memo ||
                        ""
                    )}</textarea>

                </label>


                <div class="children-medical-form-actions">

                    <button
                        type="button"
                        id="childrenMedicalCancelButton"
                        class="children-medical-cancel"
                    >
                        キャンセル
                    </button>

                    <button
                        type="button"
                        id="childrenMedicalSaveButton"
                        class="children-medical-save"
                    >
                        ${editId
                            ? "変更を保存"
                            : "保存"}
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /* =================================================
       種類による入力欄切り替え
    ================================================= */

    const typeInput =
        document.getElementById(
            "childrenMedicalTypeInput"
        );

    const pregnancyFields =
        document.getElementById(
            "childrenMedicalPregnancyFields"
        );

    const birthFields =
        document.getElementById(
            "childrenMedicalBirthFields"
        );


    function updateMedicalExtraFields() {

        const type =
            typeInput.value;


        if (pregnancyFields) {

            pregnancyFields.style.display =
                type === "pregnancy"
                    ? ""
                    : "none";

        }


        if (birthFields) {

            birthFields.style.display =
                type === "birth"
                    ? ""
                    : "none";

        }

    }


    if (typeInput) {

        typeInput.addEventListener(
            "change",
            updateMedicalExtraFields
        );

    }


    updateMedicalExtraFields();


    /* =================================================
       閉じる
    ================================================= */

    const closeButton =
        document.getElementById(
            "childrenMedicalModalClose"
        );

    const cancelButton =
        document.getElementById(
            "childrenMedicalCancelButton"
        );

    const overlay =
        document.getElementById(
            "childrenMedicalModalOverlay"
        );


    function closeModal() {

        modal.remove();

    }


    if (closeButton) {
        closeButton.onclick =
            closeModal;
    }

    if (cancelButton) {
        cancelButton.onclick =
            closeModal;
    }

    if (overlay) {
        overlay.onclick =
            closeModal;
    }


    /* =================================================
       保存
    ================================================= */

    const saveButton =
        document.getElementById(
            "childrenMedicalSaveButton"
        );


    if (saveButton) {

        saveButton.onclick =
            function () {

                const date =
                    document.getElementById(
                        "childrenMedicalDateInput"
                    ).value;


                const type =
                    document.getElementById(
                        "childrenMedicalTypeInput"
                    ).value;


                const title =
                    document.getElementById(
                        "childrenMedicalTitleInput"
                    ).value.trim();


                const hospital =
                    document.getElementById(
                        "childrenMedicalHospitalInput"
                    ).value.trim();


                const pregnancyWeek =
                    document.getElementById(
                        "childrenMedicalPregnancyWeekInput"
                    ).value.trim();


                const deliveryMethod =
                    document.getElementById(
                        "childrenMedicalDeliveryMethodInput"
                    ).value;


                const birthWeight =
                    document.getElementById(
                        "childrenMedicalBirthWeightInput"
                    ).value.trim();


                const birthHeight =
                    document.getElementById(
                        "childrenMedicalBirthHeightInput"
                    ).value.trim();


                const birthHead =
                    document.getElementById(
                        "childrenMedicalBirthHeadInput"
                    ).value.trim();


                const birthChest =
                    document.getElementById(
                        "childrenMedicalBirthChestInput"
                    ).value.trim();


                const memo =
                    document.getElementById(
                        "childrenMedicalMemoInput"
                    ).value.trim();


                if (!date) {

                    alert(
                        "記録日を入力してください。"
                    );

                    return;

                }


                if (!type) {

                    alert(
                        "記録の種類を選択してください。"
                    );

                    return;

                }


                if (!title) {

                    alert(
                        "タイトルを入力してください。"
                    );

                    return;

                }


                if (
                    type === "pregnancy" &&
                    pregnancyWeek
                ) {

                    const week =
                        Number(
                            pregnancyWeek
                        );

                    if (
                        !Number.isFinite(week) ||
                        week < 1 ||
                        week > 45
                    ) {

                        alert(
                            "妊娠週数は1～45週で入力してください。"
                        );

                        return;

                    }

                }


                const record = {

                    id:
                        existing?.id ||
                        "medical_" +
                        Date.now() +
                        "_" +
                        Math.random()
                            .toString(36)
                            .slice(2, 8),

                    date:
                        date,

                    type:
                        type,

                    title:
                        title,

                    hospital:
                        hospital,

                    pregnancyWeek:
                        type === "pregnancy"
                            ? pregnancyWeek
                            : "",

                    deliveryMethod:
                        type === "birth"
                            ? deliveryMethod
                            : "",

                    birthWeight:
                        type === "birth"
                            ? birthWeight
                            : "",

                    birthHeight:
                        type === "birth"
                            ? birthHeight
                            : "",

                    birthHead:
                        type === "birth"
                            ? birthHead
                            : "",

                    birthChest:
                        type === "birth"
                            ? birthChest
                            : "",

                    memo:
                        memo,

                    recordedAt:
                        existing?.recordedAt ||
                        new Date().toISOString()

                };


                if (editId) {

                    const index =
                        child.growth.medical.findIndex(
                            function (item) {
                                return item.id === editId;
                            }
                        );


                    if (index !== -1) {

                        child.growth.medical[
                            index
                        ] = record;

                    }

                } else {

                    child.growth.medical.push(
                        record
                    );

                }


                saveChildrenGrowthData();

                closeModal();

                renderChildrenMedical();

            };

    }

}


/* =====================================================
   🏥 編集
===================================================== */

function editChildrenMedicalRecord(
    recordId
) {

    openChildrenMedicalRecordModal(
        recordId
    );

}


/* =====================================================
   🏥 削除
===================================================== */

function deleteChildrenMedicalRecord(
    recordId
) {

    const child =
        getSelectedChild();

    if (!child) return;

    initializeChildrenGrowthData(
        child
    );


    const record =
        child.growth.medical.find(
            function (item) {
                return item.id === recordId;
            }
        );


    if (!record) return;


    const typeInfo =
        getChildrenMedicalRecordType(
            record.type
        );


    const confirmed =
        confirm(
            "この記録を削除しますか？\n\n" +
            typeInfo.icon +
            " " +
            (record.title || typeInfo.name)
        );


    if (!confirmed) return;


    child.growth.medical =
        child.growth.medical.filter(
            function (item) {
                return item.id !== recordId;
            }
        );


    saveChildrenGrowthData();

    renderChildrenMedical();

}


/* =====================================================
   🏥 日付表示
===================================================== */

function formatChildrenMedicalDate(
    date
) {

    if (!date) return "";

    const parts =
        String(date).split("-");

    if (parts.length !== 3) {
        return date;
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