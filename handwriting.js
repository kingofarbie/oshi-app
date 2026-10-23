
/* =====================================================
   ✍️ 共通手書き機能
   handwriting.js

   ・ページ全体に描画
   ・ペンの色、太さを変更
   ・部分消しゴム
   ・元に戻す、やり直す
   ・全消去、全消去の取り消し
   ・ページ、日付ごとに保存と復元
   ・既存の画面再描画に自動対応
   ・外部ライブラリ不使用

   保存処理：handwriting-db.js
   表示スタイル：handwriting.css
===================================================== */

(function () {

    "use strict";

    const HANDWRITING_MAX_HISTORY = 100;

    const HANDWRITING_COLORS = [
        "#222222",
        "#e53935",
        "#1976d2",
        "#00897b",
        "#8e24aa",
        "#f57c00",
        "#ec407a"
    ];

    let handwritingEnabled = false;
    let handwritingTool = "pen";
    let handwritingColor = "#222222";
    let handwritingWidth = 3;

    let handwritingPageType = "";
    let handwritingPageId = "";

    let handwritingLayout = null;
    let handwritingCanvas = null;
    let handwritingContext = null;
    let handwritingToolbar = null;

    let handwritingStrokes = [];
    let handwritingUndoStack = [];
    let handwritingRedoStack = [];

    let handwritingCurrentStroke = null;
    let handwritingLoading = false;
    let handwritingSaveVersion = 0;
    let handwritingLoadVersion = 0;

    let handwritingResizeObserver = null;
    let handwritingMutationObserver = null;

    const handwritingCanvasState = new WeakMap();


    /* =====================================================
       🧰 共通処理
    ===================================================== */

    function handwritingClone(value) {

        return JSON.parse(JSON.stringify(value));

    }


    function handwritingGetTarget() {

        const planner =
            document.getElementById("dayPlanner");

        const timeline =
            document.getElementById("plannerTimeline");

        const layout =
            timeline?.querySelector(".planner-layout");

        const date =
            typeof selectedCalendarDate === "string"
                ? selectedCalendarDate
                : "";

        if (!planner || !timeline || !layout || !date) {

            return null;

        }

        return {
            planner,
            timeline,
            layout,
            pageType: "planner",
            pageId: date
        };

    }


    function handwritingCreateToolbar() {

        if (handwritingToolbar?.isConnected) {

            return handwritingToolbar;

        }

        const toolbar =
            document.createElement("div");

        toolbar.className =
            "handwriting-toolbar";

        toolbar.innerHTML = `
            <button
                type="button"
                data-handwriting-action="toggle"
            >
                ✍️ 手書き OFF
            </button>

            <label>
                色
                <input
                    type="color"
                    data-handwriting-color
                    value="#222222"
                    aria-label="ペンの色"
                >
            </label>

            <label>
                太さ
                <input
                    type="range"
                    data-handwriting-width
                    min="1"
                    max="20"
                    value="3"
                    aria-label="ペンの太さ"
                >
                <span data-handwriting-width-value>3</span>
            </label>

            <button
                type="button"
                data-handwriting-action="pen"
                aria-pressed="true"
            >
                ✏️ ペン
            </button>

            <button
                type="button"
                data-handwriting-action="eraser"
                aria-pressed="false"
            >
                🩹 消しゴム
            </button>

            <button
                type="button"
                data-handwriting-action="undo"
            >
                ↩️ 戻す
            </button>

            <button
                type="button"
                data-handwriting-action="redo"
            >
                ↪️ やり直す
            </button>

            <button
                type="button"
                data-handwriting-action="clear"
            >
                🗑️ 全消去
            </button>

            <button
                type="button"
                data-handwriting-action="close"
            >
                ✖️ 終了
            </button>

            <span
                class="handwriting-status"
                data-handwriting-status
                aria-live="polite"
            ></span>
        `;

        toolbar.addEventListener(
            "pointerdown",
            function (event) {

                event.stopPropagation();

            }
        );

        toolbar.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                const button =
                    event.target.closest(
                        "[data-handwriting-action]"
                    );

                if (!button) {

                    return;

                }

                const action =
                    button.dataset.handwritingAction;

                if (action === "toggle") {

                    handwritingSetEnabled(
                        !handwritingEnabled
                    );

                }
                else if (action === "pen") {

                    handwritingSetTool("pen");

                }
                else if (action === "eraser") {

                    handwritingSetTool("eraser");

                }
                else if (action === "undo") {

                    handwritingUndo();

                }
                else if (action === "redo") {

                    handwritingRedo();

                }
                else if (action === "clear") {

                    handwritingClear();

                }
                else if (action === "close") {

                    handwritingSetEnabled(false);

                }

            }
        );

        const colorInput =
            toolbar.querySelector(
                "[data-handwriting-color]"
            );

        colorInput.addEventListener(
            "input",
            function () {

                handwritingColor = this.value;

                handwritingSetStatus(
                    "ペンの色を変更しました"
                );

            }
        );

        const widthInput =
            toolbar.querySelector(
                "[data-handwriting-width]"
            );

        widthInput.addEventListener(
            "input",
            function () {

                handwritingWidth =
                    Number(this.value);

                const widthLabel =
                    toolbar.querySelector(
                        "[data-handwriting-width-value]"
                    );

                if (widthLabel) {

                    widthLabel.textContent =
                        String(handwritingWidth);

                }

            }
        );

        handwritingToolbar = toolbar;

        return toolbar;

    }


    function handwritingSetStatus(message) {

        if (!handwritingToolbar) {

            return;

        }

        const status =
            handwritingToolbar.querySelector(
                "[data-handwriting-status]"
            );

        if (status) {

            status.textContent = message;

        }

    }


    function handwritingUpdateToolbar() {

        if (!handwritingToolbar) {

            return;

        }

        const toggle =
            handwritingToolbar.querySelector(
                '[data-handwriting-action="toggle"]'
            );

        if (toggle) {

            toggle.textContent =
                handwritingEnabled
                    ? "✍️ 手書き ON"
                    : "✍️ 手書き OFF";

            toggle.setAttribute(
                "aria-pressed",
                String(handwritingEnabled)
            );

        }

        const pen =
            handwritingToolbar.querySelector(
                '[data-handwriting-action="pen"]'
            );

        const eraser =
            handwritingToolbar.querySelector(
                '[data-handwriting-action="eraser"]'
            );

        if (pen) {

            pen.setAttribute(
                "aria-pressed",
                String(handwritingTool === "pen")
            );

        }

        if (eraser) {

            eraser.setAttribute(
                "aria-pressed",
                String(handwritingTool === "eraser")
            );

        }

        if (handwritingCanvas) {

            handwritingCanvas.style.pointerEvents =
                handwritingEnabled ? "auto" : "none";

        }

    }


    function handwritingSetEnabled(enabled) {

        handwritingEnabled = !!enabled;

        handwritingUpdateToolbar();

        if (handwritingEnabled) {

            handwritingSetStatus(
                "描画できます"
            );

        }
        else {

            handwritingSetStatus(
                "手書き OFF"
            );

        }

    }


    function handwritingSetTool(tool) {

        if (
            tool !== "pen" &&
            tool !== "eraser"
        ) {

            return;

        }

        handwritingTool = tool;

        handwritingUpdateToolbar();

        handwritingSetStatus(
            tool === "pen"
                ? "ペンを選択しました"
                : "消しゴムを選択しました"
        );

    }


    /* =====================================================
       🖼️ 描画レイヤーを準備
    ===================================================== */

    function handwritingAttach(target) {

        if (!target) {

            return;

        }

        const {
            planner,
            layout,
            pageType,
            pageId
        } = target;

        const sameLayout =
            handwritingLayout === layout &&
            handwritingCanvas?.isConnected;

        const samePage =
            handwritingPageType === pageType &&
            handwritingPageId === pageId;

        if (sameLayout && samePage) {

            handwritingUpdateToolbar();

            return;

        }

        handwritingSaveVersion++;

        handwritingLoadVersion++;

        handwritingCurrentStroke = null;

        handwritingLayout = layout;
        handwritingPageType = pageType;
        handwritingPageId = pageId;

        handwritingStrokes = [];
        handwritingUndoStack = [];
        handwritingRedoStack = [];

        const toolbar =
            handwritingCreateToolbar();

        if (
            toolbar.parentElement !== planner
        ) {

            planner.appendChild(toolbar);

        }

        if (handwritingCanvas) {

            handwritingCanvas.remove();

        }

        const canvas =
            document.createElement("canvas");

        canvas.className =
            "handwriting-canvas";

        canvas.setAttribute(
            "aria-label",
            "手書き描画エリア"
        );

        canvas.style.pointerEvents = "none";

        layout.appendChild(canvas);

        handwritingCanvas = canvas;

        handwritingContext =
            canvas.getContext("2d");

        if (!handwritingContext) {

            handwritingSetStatus(
                "描画エリアを準備できませんでした"
            );

            return;

        }

        handwritingCanvasState.set(
            canvas,
            {
                layout,
                pageType,
                pageId
            }
        );

        handwritingBindCanvas(canvas);

        if (handwritingResizeObserver) {

            handwritingResizeObserver.disconnect();

        }

        if (typeof ResizeObserver !== "undefined") {

            handwritingResizeObserver =
                new ResizeObserver(function () {

                    if (
                        handwritingCanvas !== canvas ||
                        !canvas.isConnected
                    ) {

                        return;

                    }

                    handwritingResizeCanvas();

                });

            handwritingResizeObserver.observe(layout);

        }

        handwritingResizeCanvas();

        handwritingSetEnabled(handwritingEnabled);

        handwritingLoadPage(
            pageType,
            pageId
        );

    }


    function handwritingResizeCanvas() {

        if (
            !handwritingCanvas ||
            !handwritingLayout ||
            !handwritingContext
        ) {

            return;

        }

        const rect =
            handwritingLayout.getBoundingClientRect();

        const width =
            Math.max(1, handwritingLayout.clientWidth);

        const height =
            Math.max(1, handwritingLayout.clientHeight);

        const pixelRatio =
            Math.max(1, window.devicePixelRatio || 1);

        handwritingCanvas.width =
            Math.round(width * pixelRatio);

        handwritingCanvas.height =
            Math.round(height * pixelRatio);

        handwritingCanvas.style.width =
            `${width}px`;

        handwritingCanvas.style.height =
            `${height}px`;

        handwritingCanvas.style.left = "0";
        handwritingCanvas.style.top = "0";

        handwritingContext.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        handwritingRedraw();

    }


    /* =====================================================
       ✍️ 線の描画
    ===================================================== */

    function handwritingDrawStroke(context, stroke, width, height) {

        if (
            !stroke ||
            !Array.isArray(stroke.points) ||
            stroke.points.length === 0
        ) {

            return;

        }

        context.save();

        context.globalCompositeOperation =
            stroke.tool === "eraser"
                ? "destination-out"
                : "source-over";

        context.strokeStyle =
            stroke.color || "#222222";

        context.fillStyle =
            stroke.color || "#222222";

        context.lineWidth =
            Number(stroke.width) || 3;

        context.lineCap = "round";
        context.lineJoin = "round";

        const points =
            stroke.points;

        if (points.length === 1) {

            const point =
                points[0];

            context.beginPath();

            context.arc(
                point.x * width,
                point.y * height,
                context.lineWidth / 2,
                0,
                Math.PI * 2
            );

            context.fill();

        }
        else {

            context.beginPath();

            context.moveTo(
                points[0].x * width,
                points[0].y * height
            );

            for (
                let i = 1;
                i < points.length;
                i++
            ) {

                context.lineTo(
                    points[i].x * width,
                    points[i].y * height
                );

            }

            context.stroke();

        }

        context.restore();

    }


    function handwritingRedraw() {

        if (
            !handwritingCanvas ||
            !handwritingContext ||
            !handwritingLayout
        ) {

            return;

        }

        const width =
            handwritingLayout.clientWidth;

        const height =
            handwritingLayout.clientHeight;

        handwritingContext.clearRect(
            0,
            0,
            width,
            height
        );

        handwritingStrokes.forEach(stroke => {

            handwritingDrawStroke(
                handwritingContext,
                stroke,
                width,
                height
            );

        });

        if (handwritingCurrentStroke) {

            handwritingDrawStroke(
                handwritingContext,
                handwritingCurrentStroke,
                width,
                height
            );

        }

    }


    function handwritingGetPoint(event) {

        const rect =
            handwritingCanvas.getBoundingClientRect();

        if (!rect.width || !rect.height) {

            return null;

        }

        return {

            x: Math.max(
                0,
                Math.min(
                    1,
                    (event.clientX - rect.left) / rect.width
                )
            ),

            y: Math.max(
                0,
                Math.min(
                    1,
                    (event.clientY - rect.top) / rect.height
                )
            )

        };

    }


    function handwritingBindCanvas(canvas) {

        canvas.addEventListener(
            "pointerdown",
            function (event) {

                if (
                    !handwritingEnabled ||
                    handwritingCanvas !== canvas
                ) {

                    return;

                }

                if (
                    event.pointerType === "mouse" &&
                    event.button !== 0
                ) {

                    return;

                }

                event.preventDefault();
                event.stopPropagation();

                const point =
                    handwritingGetPoint(event);

                if (!point) {

                    return;

                }

                handwritingPushUndo();

                handwritingRedoStack = [];

                handwritingCurrentStroke = {

                    tool: handwritingTool,
                    color: handwritingColor,
                    width: handwritingWidth,
                    points: [point]

                };

                try {

                    canvas.setPointerCapture(
                        event.pointerId
                    );

                }
                catch (error) {

                    // Pointer Capture 非対応時も描画を続ける

                }

                handwritingRedraw();

            }
        );

        canvas.addEventListener(
            "pointermove",
            function (event) {

                if (
                    !handwritingEnabled ||
                    !handwritingCurrentStroke ||
                    handwritingCanvas !== canvas
                ) {

                    return;

                }

                event.preventDefault();
                event.stopPropagation();

                const point =
                    handwritingGetPoint(event);

                if (!point) {

                    return;

                }

                handwritingCurrentStroke.points.push(
                    point
                );

                handwritingRedraw();

            }
        );

        function finishStroke(event) {

            if (
                !handwritingCurrentStroke ||
                handwritingCanvas !== canvas
            ) {

                return;

            }

            if (event) {

                event.preventDefault();
                event.stopPropagation();

            }

            const finishedStroke =
                handwritingCurrentStroke;

            handwritingCurrentStroke = null;

            if (
                finishedStroke.points.length > 0
            ) {

                handwritingStrokes.push(
                    finishedStroke
                );

                handwritingRedraw();

                handwritingSavePage();

            }

        }

        canvas.addEventListener(
            "pointerup",
            finishStroke
        );

        canvas.addEventListener(
            "pointercancel",
            finishStroke
        );

        canvas.addEventListener(
            "lostpointercapture",
            function () {

                if (handwritingCurrentStroke) {

                    finishStroke();

                }

            }
        );

    }


    /* =====================================================
       ↩️ 履歴
    ===================================================== */

    function handwritingPushUndo() {

        handwritingUndoStack.push(
            handwritingClone(handwritingStrokes)
        );

        if (
            handwritingUndoStack.length >
            HANDWRITING_MAX_HISTORY
        ) {

            handwritingUndoStack.shift();

        }

    }


    function handwritingUndo() {

        if (handwritingCurrentStroke) {

            handwritingCurrentStroke = null;

        }

        if (handwritingUndoStack.length === 0) {

            handwritingSetStatus(
                "これ以上戻せません"
            );

            handwritingRedraw();

            return;

        }

        handwritingRedoStack.push(
            handwritingClone(handwritingStrokes)
        );

        handwritingStrokes =
            handwritingUndoStack.pop();

        handwritingRedraw();

        handwritingSavePage();

        handwritingSetStatus(
            "元に戻しました"
        );

    }


    function handwritingRedo() {

        if (handwritingRedoStack.length === 0) {

            handwritingSetStatus(
                "やり直せる操作がありません"
            );

            return;

        }

        handwritingUndoStack.push(
            handwritingClone(handwritingStrokes)
        );

        handwritingStrokes =
            handwritingRedoStack.pop();

        handwritingRedraw();

        handwritingSavePage();

        handwritingSetStatus(
            "やり直しました"
        );

    }


    function handwritingClear() {

        if (
            handwritingStrokes.length === 0 &&
            !handwritingCurrentStroke
        ) {

            handwritingSetStatus(
                "消去する線がありません"
            );

            return;

        }

        if (
            !confirm(
                "このページの手書きをすべて消去しますか？\n\n「戻す」で復元できます。"
            )
        ) {

            return;

        }

        handwritingPushUndo();

        handwritingRedoStack = [];

        handwritingCurrentStroke = null;

        handwritingStrokes = [];

        handwritingRedraw();

        handwritingSavePage();

        handwritingSetStatus(
            "全消去しました（戻すで復元できます）"
        );

    }


    /* =====================================================
       💾 保存・読み込み
    ===================================================== */

    async function handwritingSavePage() {

        if (
            handwritingLoading ||
            !handwritingPageType ||
            !handwritingPageId
        ) {

            return;

        }

        const pageType =
            handwritingPageType;

        const pageId =
            handwritingPageId;

        const version =
            ++handwritingSaveVersion;

        const snapshot =
            handwritingClone(handwritingStrokes);

        try {

            await handwritingSave(
                pageType,
                pageId,
                snapshot
            );

            if (
                version === handwritingSaveVersion &&
                pageType === handwritingPageType &&
                pageId === handwritingPageId
            ) {

                handwritingSetStatus(
                    "保存しました"
                );

            }

        }
        catch (error) {

            console.error(
                "手書きデータの保存に失敗しました:",
                error
            );

            handwritingSetStatus(
                "保存できませんでした"
            );

        }

    }


    async function handwritingLoadPage(pageType, pageId) {

        const version =
            ++handwritingLoadVersion;

        handwritingLoading = true;

        handwritingSetStatus(
            "読み込み中..."
        );

        try {

            const strokes =
                await handwritingLoad(
                    pageType,
                    pageId
                );

            if (
                version !== handwritingLoadVersion ||
                pageType !== handwritingPageType ||
                pageId !== handwritingPageId
            ) {

                return;

            }

            handwritingStrokes =
                Array.isArray(strokes)
                    ? strokes
                    : [];

            handwritingUndoStack = [];
            handwritingRedoStack = [];

            handwritingRedraw();

            handwritingSetStatus(
                handwritingStrokes.length
                    ? "保存した手書きを復元しました"
                    : "新しいページです"
            );

        }
        catch (error) {

            console.error(
                "手書きデータの読み込みに失敗しました:",
                error
            );

            handwritingSetStatus(
                "読み込みに失敗しました"
            );

        }
        finally {

            if (version === handwritingLoadVersion) {

                handwritingLoading = false;

            }

        }

    }


    /* =====================================================
       🔄 画面再描画への対応
    ===================================================== */

    function handwritingCheckPage() {

        const target =
            handwritingGetTarget();

        if (!target) {

            return;

        }

        handwritingAttach(target);

    }


    function handwritingStart() {

        handwritingCheckPage();

        const timeline =
            document.getElementById("plannerTimeline");

        if (
            timeline &&
            !handwritingMutationObserver &&
            typeof MutationObserver !== "undefined"
        ) {

            handwritingMutationObserver =
                new MutationObserver(function () {

                    handwritingCheckPage();

                });

            handwritingMutationObserver.observe(
                timeline,
                {
                    childList: true,
                    subtree: true
                }
            );

        }

        window.addEventListener(
            "resize",
            handwritingResizeCanvas
        );

    }


    /* =====================================================
       🌐 共通機能として公開
    ===================================================== */

    window.handwritingSetEnabled =
        handwritingSetEnabled;

    window.handwritingSetTool =
        handwritingSetTool;

    window.handwritingUndo =
        handwritingUndo;

    window.handwritingRedo =
        handwritingRedo;

    window.handwritingClear =
        handwritingClear;

    window.handwritingAttach =
        handwritingAttach;

    window.handwritingStart =
        handwritingStart;


    /* =====================================================
       🚀 初期化
    ===================================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            handwritingStart,
            { once: true }
        );

    }
    else {

        handwritingStart();

    }

})();
