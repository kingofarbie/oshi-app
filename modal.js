// =====================================================
// 共通モーダル
// modal.js
// =====================================================


// =====================================================
// 🔢 数値入力モーダル
// =====================================================

let numberInputTarget = null;
let numberInputValue = "";
let numberInputAllowDecimal = false;


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
// 数値入力モーダルを開く
// =====================================================

function openNumberInputModal(
    input,
    title,
    allowDecimal = false
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

    numberInputValue =
        input.value || "";

    numberInputAllowDecimal =
        allowDecimal;


    titleElement.textContent =
        title;

    display.textContent =
        numberInputValue;


    const decimalButton =
        modal.querySelector(
            ".decimal-button"
        );


    if (decimalButton) {

        decimalButton.style.display =
            allowDecimal
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

    numberInputValue = "";

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


    numberInputTarget.value = "";

    closeNumberInputModal();

}


// =====================================================
// 保存
// =====================================================

function saveNumberInput() {

    if (!numberInputTarget) {

        closeNumberInputModal();

        return;

    }


    numberInputTarget.value =
        numberInputValue;


    closeNumberInputModal();

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

}


// =====================================================
// 共通モーダル読み込み開始
// =====================================================

loadCommonModalHTML();