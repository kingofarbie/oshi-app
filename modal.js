// =====================================================
// 共通モーダル
// modal.js
// =====================================================


// =====================================================
// 🔢 数値 / ⏰ 時刻入力モーダル
// =====================================================

let numberInputTarget = null;
let numberInputValue = "";
let numberInputAllowDecimal = false;

// number / time
let numberInputMode = "number";

// 保存・削除時のコールバック
let numberInputSaveCallback = null;
let numberInputDeleteCallback = null;


// =====================================================
// 共通モーダルHTML読み込み
// =====================================================

async function loadCommonModalHTML() {

    const container =
        document.getElementById("modalContainer");

    if (!container) {
        console.error(
            "modalContainer がありません"
        );
        return;
    }

    try {

        const response =
            await fetch("./modal.html");

        if (!response.ok) {
            throw new Error(
                "modal.html の読み込みに失敗しました"
            );
        }

        container.innerHTML =
            await response.text();

        initializeNumberInputModal();
        initializeCommonConfirmModal();
        initializeRecurringDeleteModal();
        initializePlannerNoteEditor();


    }
    catch (error) {

        console.error(
            "共通モーダル読み込みエラー:",
            error
        );

    }

}


// =====================================================
// 初期化
// =====================================================

function initializeNumberInputModal() {

    const modal =
        document.getElementById(
            "numberInputModal"
        );

    const display =
        document.getElementById(
            "numberInputDisplay"
        );

    if (!modal || !display) {
        return;
    }


    modal
        .querySelectorAll("[data-number]")
        .forEach(button => {

            button.onclick = function() {

                const value =
                    button.dataset.number;

                appendNumberInput(value);

            };

        });


    modal
        .querySelectorAll("[data-action]")
        .forEach(button => {

            button.onclick = function() {

                const action =
                    button.dataset.action;


                if (action === "backspace") {

                    backspaceNumberInput();

                }
                else if (action === "delete") {

                    deleteNumberInput();

                }
                else if (action === "reset") {

                    resetNumberInput();

                }
                else if (action === "save") {

                    saveNumberInput();

                }

            };

        });

}


// =====================================================
// ✅ 共通確認モーダル
// =====================================================

let commonConfirmResolve = null;


// =====================================================
// ✅ 共通確認モーダル 初期化
// =====================================================

function initializeCommonConfirmModal() {

    const modal =
        document.getElementById("commonConfirmModal");

    const completeButton =
        document.getElementById("commonConfirmCancelButton");

    const incompleteButton =
        document.getElementById("commonConfirmOkButton");

    if (
        !modal ||
        !completeButton ||
        !incompleteButton
    ) {
        return;
    }


    /* =================================================
       左ボタン
       → 結果：完了
    ================================================= */

    completeButton.onclick = function() {

        modal.style.display = "none";

        if (typeof commonConfirmResolve === "function") {

            const resolve =
                commonConfirmResolve;

            commonConfirmResolve = null;

            resolve("completed");

        }

    };


    /* =================================================
       右ボタン
       → 結果：未完了
    ================================================= */

    incompleteButton.onclick = function() {

        modal.style.display = "none";

        if (typeof commonConfirmResolve === "function") {

            const resolve =
                commonConfirmResolve;

            commonConfirmResolve = null;

            resolve("incomplete");

        }

    };

}



// =====================================================
// 数値 / 時刻入力モーダルを開く
//
// 既存:
// openNumberInputModal(input, title, decimal)
//
// 時刻:
// openNumberInputModal(
//     input,
//     title,
//     false,
//     "time",
//     saveCallback,
//     deleteCallback
// )
// =====================================================

function openNumberInputModal(
    input,
    title,
    allowDecimal = false,
    mode = "number",
    saveCallback = null,
    deleteCallback = null,
    childrenGender = ""
) {

    const modal =
        document.getElementById(
            "numberInputModal"
        );

    const titleElement =
        document.getElementById(
            "numberInputTitle"
        );

    const display =
        document.getElementById(
            "numberInputDisplay"
        );


    if (
        !modal ||
        !titleElement ||
        !display
    ) {

        return;

    }


    numberInputTarget = input;

    numberInputMode = mode;

    numberInputAllowDecimal =
        allowDecimal;


    numberInputSaveCallback =
        typeof saveCallback === "function"
            ? saveCallback
            : null;

    numberInputDeleteCallback =
        typeof deleteCallback === "function"
            ? deleteCallback
            : null;


    /* =================================================
       👶 子どもカレンダー用カラー
    ================================================= */

    modal.classList.remove(
        "children-number-boy",
        "children-number-girl"
    );


    if (childrenGender === "boy") {

        modal.classList.add(
            "children-number-boy"
        );

    }
    else if (childrenGender === "girl") {

        modal.classList.add(
            "children-number-girl"
        );

    }


    // =================================================
    // ⏰ 時刻モード
    // =================================================

    if (mode === "time") {

        let currentValue =
            input.value || "";


        if (!currentValue) {

            const now = new Date();

            const hours =
                String(now.getHours())
                    .padStart(2, "0");

            const minutes =
                String(now.getMinutes())
                    .padStart(2, "0");

            currentValue =
                hours + minutes;

        }
        else {

            currentValue =
                currentValue
                    .replace(":", "");

        }


        numberInputValue =
            currentValue;

    }


    // =================================================
    // 🔢 数値モード
    // =================================================

    else {

        numberInputValue =
            input.value || "";

    }


    titleElement.textContent =
        title;


    updateNumberInputDisplay();


    const decimalButton =
        modal.querySelector(
            ".decimal-button"
        );


    if (decimalButton) {

        decimalButton.style.display =
            mode === "time"
                ? "none"
                : allowDecimal
                    ? "block"
                    : "none";

    }


    modal.style.display =
        "flex";

}

// =====================================================
// 数字を追加
// =====================================================

function appendNumberInput(value) {

    if (!numberInputTarget) {
        return;
    }


    // =================================================
    // ⏰ 時刻モード
    // =================================================

    if (numberInputMode === "time") {

        if (!/^\d$/.test(value)) {
            return;
        }


        // 4桁まで
        if (numberInputValue.length >= 4) {
            return;
        }


        numberInputValue += value;

        updateNumberInputDisplay();

        return;
    }


    // =================================================
    // 🔢 数値モード
    // =================================================

    if (value === ".") {

        if (!numberInputAllowDecimal) {
            return;
        }


        if (numberInputValue.includes(".")) {
            return;
        }


        if (numberInputValue === "") {

            numberInputValue =
                "0.";

        }
        else {

            numberInputValue += ".";

        }

    }
    else {

        numberInputValue += value;

    }


    updateNumberInputDisplay();

}


// =====================================================
// 1文字削除
// =====================================================

function backspaceNumberInput() {

    if (!numberInputValue) {
        return;
    }


    numberInputValue =
        numberInputValue.slice(0, -1);


    updateNumberInputDisplay();

}


// =====================================================
// リセット
// =====================================================

function resetNumberInput() {

    // 時刻モードは現在時刻へ戻す
    if (numberInputMode === "time") {

        const now = new Date();

        numberInputValue =
            String(now.getHours())
                .padStart(2, "0") +
            String(now.getMinutes())
                .padStart(2, "0");

    }
    else {

        numberInputValue = "";

    }


    updateNumberInputDisplay();

}


// =====================================================
// 削除
// =====================================================

function deleteNumberInput() {

    if (!numberInputTarget) {

        closeNumberInputModal();

        return;

    }


    const deleteCallback =
        numberInputDeleteCallback;


    numberInputTarget.value = "";


    closeNumberInputModal();


    if (deleteCallback) {

        deleteCallback();

    }

}


// =====================================================
// 保存
// =====================================================

function saveNumberInput() {

    if (!numberInputTarget) {

        closeNumberInputModal();

        return;

    }


    // =================================================
    // ⏰ 時刻モード
    // =================================================

    if (numberInputMode === "time") {

        // 4桁未満なら保存しない
        if (numberInputValue.length !== 4) {

            alert(
                "時刻を4桁で入力してください。"
            );

            return;

        }


        const hours =
            Number(
                numberInputValue.slice(0, 2)
            );

        const minutes =
            Number(
                numberInputValue.slice(2, 4)
            );


        if (
            !Number.isInteger(hours) ||
            !Number.isInteger(minutes) ||
            hours < 0 ||
            hours > 23 ||
            minutes < 0 ||
            minutes > 59
        ) {

            alert(
                "正しい時刻を入力してください。"
            );

            return;

        }


        const formattedTime =
            String(hours).padStart(2, "0") +
            ":" +
            String(minutes).padStart(2, "0");


        numberInputTarget.value =
            formattedTime;


        const saveCallback =
            numberInputSaveCallback;


        closeNumberInputModal();


        if (saveCallback) {

            saveCallback(
                formattedTime
            );

        }


        return;

    }


    // =================================================
    // 🔢 数値モード
    // =================================================

    numberInputTarget.value =
        numberInputValue;


    const saveCallback =
        numberInputSaveCallback;


    closeNumberInputModal();


    if (saveCallback) {

        saveCallback(
            numberInputValue
        );

    }

}


// =====================================================
// 表示更新
// =====================================================

function updateNumberInputDisplay() {

    const display =
        document.getElementById(
            "numberInputDisplay"
        );


    if (!display) {
        return;
    }


    // =================================================
    // ⏰ 時刻表示
    // =================================================

    if (numberInputMode === "time") {

        if (!numberInputValue) {

            display.textContent =
                "";

            return;

        }


        if (numberInputValue.length <= 2) {

            display.textContent =
                numberInputValue;

            return;

        }


        display.textContent =
            numberInputValue.slice(0, 2) +
            ":" +
            numberInputValue.slice(2);

        return;

    }


    // =================================================
    // 🔢 数値表示
    // =================================================

    display.textContent =
        numberInputValue;

}


// =====================================================
// 閉じる
// =====================================================

function closeNumberInputModal() {

    const modal =
        document.getElementById(
            "numberInputModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    numberInputTarget = null;

    numberInputValue = "";

    numberInputAllowDecimal = false;

    numberInputMode = "number";

    numberInputSaveCallback = null;

    numberInputDeleteCallback = null;

}




// =====================================================
// ✅ 共通確認モーダルを開く
// =====================================================

function openCommonConfirmModal(
    message,
    completeText = "完了",
    incompleteText = "未完了",
    childrenGender = ""
) {

    const modal =
        document.getElementById("commonConfirmModal");

    const messageElement =
        document.getElementById("commonConfirmMessage");

    const completeButton =
        document.getElementById(
            "commonConfirmCancelButton"
        );

    const incompleteButton =
        document.getElementById(
            "commonConfirmOkButton"
        );

    if (
        !modal ||
        !messageElement ||
        !completeButton ||
        !incompleteButton
    ) {
        return Promise.resolve(null);
    }


    /* =================================================
       👶 予防接種用 性別カラーをリセット
    ================================================= */

    modal.classList.remove(
        "children-vaccination-boy",
        "children-vaccination-girl"
    );


    if (childrenGender === "boy") {

        modal.classList.add(
            "children-vaccination-boy"
        );

    }
    else if (childrenGender === "girl") {

        modal.classList.add(
            "children-vaccination-girl"
        );

    }


    messageElement.textContent =
        message;


    /* =================================================
       左 → 完了
    ================================================= */

    completeButton.textContent =
        completeText;


    /* =================================================
       右 → 未完了
    ================================================= */

    incompleteButton.textContent =
        incompleteText;


    modal.style.display =
        "flex";


    return new Promise(resolve => {

        commonConfirmResolve =
            resolve;

    });

}





/* =================================
   🔁 繰り返し予定の削除専用モーダル
================================= */

let recurringDeleteModalResolver = null;

function openRecurringDeleteModal(title, date) {
    const modal = document.getElementById("recurringDeleteModal");
    const message = document.getElementById("recurringDeleteMessage");

    if (!modal || !message) {
        console.error("繰り返し予定削除モーダルが見つかりません");
        return Promise.resolve(null);
    }

    // 前の選択待ちが残っていた場合はキャンセル扱いにする
    if (recurringDeleteModalResolver) {
        const previousResolver = recurringDeleteModalResolver;
        recurringDeleteModalResolver = null;
        previousResolver(null);
    }

    message.textContent =
        `予定：${title}\n対象日：${date}\n\n削除方法を選択してください。`;

    modal.style.display = "flex";

    return new Promise(resolve => {
        recurringDeleteModalResolver = resolve;
    });
}

function closeRecurringDeleteModal(result = null) {
    const modal = document.getElementById("recurringDeleteModal");

    if (modal) {
        modal.style.display = "none";
    }

    const resolve = recurringDeleteModalResolver;
    recurringDeleteModalResolver = null;

    if (resolve) {
        resolve(result);
    }
}

function initializeRecurringDeleteModal() {
    const modal = document.getElementById("recurringDeleteModal");
    const oneButton = document.getElementById("recurringDeleteOneButton");
    const allButton = document.getElementById("recurringDeleteAllButton");
    const cancelButton = document.getElementById("recurringDeleteCancelButton");

    if (!modal || !oneButton || !allButton || !cancelButton) {
        return;
    }

    oneButton.onclick = () => closeRecurringDeleteModal("one");
    allButton.onclick = () => closeRecurringDeleteModal("all");
    cancelButton.onclick = () => closeRecurringDeleteModal(null);

    modal.onclick = event => {
        if (event.target === modal) {
            closeRecurringDeleteModal(null);
        }
    };
}



// =====================================================
// 共通モーダル読み込み開始
// =====================================================

loadCommonModalHTML();



/* =====================================================
   📝 自由メモ・手書きメモ 共通モーダル
===================================================== */

let plannerNoteEditorMode = "text";
let plannerNoteEditingId = null;

function openPlannerNoteEditor(mode = "text", noteId = null) {

    const modal =
        document.getElementById("plannerNoteEditorModal");

    const title =
        document.getElementById("plannerNoteEditorTitle");

    const textSettings =
        document.getElementById("plannerNoteTextSettings");

    const drawingSettings =
        document.getElementById("plannerNoteDrawingSettings");

    if (!modal || !title || !textSettings || !drawingSettings) {
        console.error("メモ編集モーダルが見つかりません");
        return;
    }

    plannerNoteEditorMode =
        mode === "drawing" ? "drawing" : "text";

    plannerNoteEditingId = noteId;

    title.textContent =
        plannerNoteEditorMode === "drawing"
            ? "✍️ 手書きメモ"
            : "📝 自由メモ";

    textSettings.style.display =
        plannerNoteEditorMode === "text" ? "block" : "none";

    drawingSettings.style.display =
        plannerNoteEditorMode === "drawing" ? "block" : "none";

    const textInput =
        document.getElementById("plannerNoteText");

    const fontInput =
        document.getElementById("plannerNoteFont");

    const sizeInput =
        document.getElementById("plannerNoteFontSize");

    const colorInput =
        document.getElementById("plannerNoteColor");

    // 初期値
    if (textInput) textInput.value = "";
    if (fontInput) fontInput.value = "sans-serif";
    if (sizeInput) sizeInput.value = "16";
    if (colorInput) colorInput.value = "#333333";

    // 保存済みメモを編集する場合
    if (noteId !== null) {

        const data = db.load();

        const note = (data.plannerNotes || []).find(
            item => String(item.id) === String(noteId)
        );

        if (!note) {
            alert("編集するメモが見つかりませんでした。");
            return;
        }

        if (textInput) textInput.value = note.text || "";
        if (fontInput) fontInput.value = note.font || "sans-serif";
        if (sizeInput) sizeInput.value = String(note.fontSize || 16);
        if (colorInput) colorInput.value = note.color || "#333333";
    }

    modal.style.display = "flex";
}


function initializePlannerNoteEditor() {

    const saveButton =
        document.getElementById("plannerNoteSaveButton");

    const cancelButton =
        document.getElementById("plannerNoteCancelButton");

    if (saveButton) {

        saveButton.onclick = function() {

            // 手書きメモの保存処理は次の段階で実装
            if (plannerNoteEditorMode === "drawing") {
                alert("手書きメモの保存機能は、次の段階で追加します。");
                return;
            }

            const textInput =
                document.getElementById("plannerNoteText");

            const fontInput =
                document.getElementById("plannerNoteFont");

            const sizeInput =
                document.getElementById("plannerNoteFontSize");

            const colorInput =
                document.getElementById("plannerNoteColor");

            const text =
                textInput ? textInput.value.trim() : "";

            if (!text) {
                alert("メモの内容を入力してください。");
                return;
            }

            if (!selectedCalendarDate) {
                alert("メモの日付を取得できませんでした。");
                return;
            }

            const data = db.load();

            if (!Array.isArray(data.plannerNotes)) {
                data.plannerNotes = [];
            }

            let note = null;

            if (plannerNoteEditingId !== null) {

                note = data.plannerNotes.find(
                    item =>
                        String(item.id) ===
                        String(plannerNoteEditingId)
                );

                if (!note) {
                    alert("編集するメモが見つかりませんでした。");
                    return;
                }

            } else {

                note = {
                    id: "planner-note-" + Date.now(),
                    date: selectedCalendarDate,
                    top: plannerNotePlacementTop,
                    type: "text"
                };

                data.plannerNotes.push(note);
            }

            note.date = selectedCalendarDate;
            note.type = "text";
            note.text = text;
            note.font = fontInput ? fontInput.value : "sans-serif";
            note.fontSize = Number(sizeInput ? sizeInput.value : 16) || 16;
            note.color = colorInput ? colorInput.value : "#333333";

            db.save(data);

            closePlannerNoteEditor();

            showPlanner(selectedCalendarDate);
        };
    }

    if (cancelButton) {
        cancelButton.onclick = closePlannerNoteEditor;
    }
}




function closePlannerNoteEditor() {

    const modal =
        document.getElementById("plannerNoteEditorModal");

    if (modal) {
        modal.style.display = "none";
    }
}
