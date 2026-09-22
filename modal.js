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
// 共通モーダル読み込み開始
// =====================================================

loadCommonModalHTML();