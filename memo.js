/* =====================
   📝 1日手帳 メモ機能
   最終版
===================== */


/* ==================================================
   メモ追加
================================================== */

function addMemo(){

    const input =
        document.getElementById("memoText");

    if(input){
        input.value = "";
    }

    const modal =
        document.getElementById("memoModal");

    if(modal){

        modal.style.display = "block";

        const title =
            modal.querySelector("h2");

        if(title){
            title.textContent = "📝 メモ追加";
        }

    }

}

/* ==================================================
   メモ追加モーダル閉じる
================================================== */

function closeMemoModal(){

    const modal =
        document.getElementById("memoModal");

    if(modal){
        modal.style.display = "none";
    }

}


/* ==================================================
   メモ保存
================================================== */

function saveMemo(){

    const input =
        document.getElementById("memoText");

    if(!input){
        return;
    }

    const text =
        input.value.trim();

    if(!text){
        return;
    }

    const data =
        db.load();


    if(!data.dayMemories){

        data.dayMemories = {};

    }


    if(
        !data.dayMemories[
            selectedCalendarDate
        ]
    ){

        data.dayMemories[
            selectedCalendarDate
        ] = {

            memo: [],
            photos: [],
            videos: [],
            expenses: [],
            rating: 0,
            comment: ""

        };

    }


    const day =
        data.dayMemories[
            selectedCalendarDate
        ];


    if(
        !Array.isArray(day.memo)
    ){

        day.memo = [];

    }


    /*
       ✏️ 編集中
    */

    if(
        memoEditingId !== null
    ){

        const memo =
            day.memo.find(
                item =>
                    item.id === memoEditingId
            );


        if(memo){

            memo.text =
                text;

        }


        memoEditingId =
            null;


        db.save(data);

        closeMemoModal();

        renderDayMemory();

        return;

    }


    /*
       📝 新規追加
    */

    day.memo.push({

        id: Date.now(),

        text: text

    });


    db.save(data);

    closeMemoModal();

    renderDayMemory();

}


/* ==================================================
   メモ表示
================================================== */

function renderDayMemos(){

    const data =
        db.load();

    const day =
        data.dayMemories?.[
            selectedCalendarDate
        ];

    const memoArea =
        document.getElementById("memoList");

    if(!memoArea){
        return;
    }

    /*
       メモがない場合
    */

    if(
        !day ||
        !Array.isArray(day.memo) ||
        day.memo.length === 0
    ){

        memoArea.innerHTML =
            "<div class='check-empty'>まだメモはありません</div>";

        return;

    }


    /*
       モードに応じて表示
    */

    const selectable =
        memoMode === "delete" ||
        memoMode === "edit";

    const sorting =
        memoMode === "sort";


    memoArea.innerHTML =
        day.memo.map(
            (memo,index)=>{

                const selected =
                    selectedMemoIds.includes(
                        memo.id
                    );


                return `

<div
    class="
        memory-card
        memo-card-item
        ${selected ? "memo-selected" : ""}
        ${sorting ? "memo-sort-item" : ""}
    "
    data-memo-id="${memo.id}"
    data-memo-index="${index}"
>


${
    selectable
    ?
    `

<label
    class="memo-select-box"
    onclick="event.stopPropagation()"
>

<input
    type="checkbox"
    ${selected ? "checked" : ""}
    onchange="
        toggleMemoSelection(
            ${memo.id},
            this.checked
        )
    "
>

<span class="memo-checkbox-mark">
    ${selected ? "☑" : "☐"}
</span>

</label>

`
    :
    ""
}


<span class="memo-card-text">
    ${escapeMemoHtml(memo.text)}
</span>


${
    sorting
    ?
    `

<span
    class="memo-drag-handle"
    data-memo-id="${memo.id}"
    aria-label="メモを並び替える"
>
    ☰
</span>

`
    :
    ""
}


</div>

`;

            }
        ).join("");


    /*
       削除・編集
    */

    if(selectable){

        setupMemoSelection();

    }


    /*
       並び替え
    */

    if(sorting){

        setupMemoDragSort();

    }

}


/* ==================================================
   HTMLエスケープ
================================================== */

function escapeMemoHtml(text){

    return String(text || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* ==================================================
   メモ操作モード
================================================== */

let memoMode = "normal";

let selectedMemoIds = [];

// ✏️ 編集中のメモID
let memoEditingId = null;

// 並び替え前のメモ順を一時保存
let memoSortOriginalOrder = null;

// 並び替え中の作業用メモ順
let memoSortWorkingOrder = null;



/* ==================================================
   削除・編集 選択
================================================== */

function toggleMemoSelection(
    id,
    checked
){

    /*
       編集は1件だけ
    */

    if(memoMode === "edit"){

        selectedMemoIds = [];


        if(checked){

            selectedMemoIds.push(id);

        }


        updateMemoSelectionDisplay();

        return;

    }


    /*
       削除は複数
    */

    if(memoMode === "delete"){

        if(checked){

            if(
                !selectedMemoIds.includes(id)
            ){

                selectedMemoIds.push(id);

            }

        }else{

            selectedMemoIds =
                selectedMemoIds.filter(
                    memoId =>
                        memoId !== id
                );

        }


        updateMemoSelectionDisplay();

    }

}


/* ==================================================
   選択表示更新
================================================== */

function updateMemoSelectionDisplay(){

    document
        .querySelectorAll(
            ".memo-card-item"
        )
        .forEach(card=>{

            const id =
                Number(
                    card.dataset.memoId
                );


            const selected =
                selectedMemoIds.includes(id);


            card.classList.toggle(
                "memo-selected",
                selected
            );


            const mark =
                card.querySelector(
                    ".memo-checkbox-mark"
                );


            if(mark){

                mark.textContent =
                    selected
                    ? "☑"
                    : "☐";

            }


            const checkbox =
                card.querySelector(
                    ".memo-select-box input"
                );


            if(checkbox){

                checkbox.checked =
                    selected;

            }

        });

}


/* ==================================================
   🗑 削除モード開始
================================================== */

function startMemoDeleteMode(){

    const data =
        db.load();

    const list =
        data.dayMemories?.[
            selectedCalendarDate
        ]?.memo || [];


    if(list.length === 0){

        alert(
            "削除するメモがありません"
        );

        return;

    }


    memoMode =
        "delete";

    selectedMemoIds = [];


    renderMemoModeMessage(
        "🗑 削除するメモを選択してください"
    );


    renderDayMemos();

    setupMemoSelectionButtons();

}


/* ==================================================
   ✏️ 編集モード開始
================================================== */

function startMemoEditMode(){

    const data =
        db.load();

    const list =
        data.dayMemories?.[
            selectedCalendarDate
        ]?.memo || [];


    if(list.length === 0){

        alert(
            "編集するメモがありません"
        );

        return;

    }


    memoMode =
        "edit";

    selectedMemoIds = [];


    renderMemoModeMessage(
        "✏️ 編集するメモを1つ選択してください"
    );


    renderDayMemos();

    setupMemoSelectionButtons();

}


/* ==================================================
   🔀 並び替えモード開始
================================================== */

function startMemoSortMode(){

    const data =
        db.load();

    const list =
        data.dayMemories?.[
            selectedCalendarDate
        ]?.memo || [];


    if(list.length < 2){

        alert(
            "並び替えるにはメモが2つ以上必要です"
        );

        return;

    }


memoMode =
    "sort";

selectedMemoIds = [];

// 並び替え開始時の順番を保存
memoSortOriginalOrder =
    list.map(memo => ({
        ...memo
    }));

// 並び替え中の作業用順番
memoSortWorkingOrder =
    list.map(memo => ({
        ...memo
    }));





renderMemoModeMessage(
    "🔀 右側の☰をドラッグして並び替えてください"
);

renderDayMemos();

}


/* ==================================================
   モード案内
================================================== */

function renderMemoModeMessage(text){

    let box =
        document.getElementById(
            "memoModeMessage"
        );


    if(!box){

        const memoArea =
            document.getElementById(
                "memoList"
            );


        if(!memoArea){
            return;
        }


        box =
            document.createElement("div");


        box.id =
            "memoModeMessage";


        memoArea.parentNode.insertBefore(
            box,
            memoArea
        );

    }


    box.innerHTML = `

<div class="memo-mode-message">

<span>
    ${text}
</span>

<button
    type="button"
    onclick="cancelMemoMode()"
>
    キャンセル
</button>

${
    memoMode === "sort"
    ?
    `
    <button
        type="button"
        class="memo-sort-confirm"
        onclick="confirmMemoSort()"
    >
        確定
    </button>
    `
    :
    ""
}

</div>

`;

}


/* ==================================================
   選択モード
================================================== */

function setupMemoSelection(){

    document
        .querySelectorAll(
            ".memo-card-item"
        )
        .forEach(card=>{

            /*
               既存イベントを上書き
            */

            card.onclick =
                function(event){

                    if(
                        event.target.closest(
                            ".memo-select-box"
                        )
                    ){

                        return;

                    }


                    const id =
                        Number(
                            this.dataset.memoId
                        );


                    const selected =
                        selectedMemoIds.includes(
                            id
                        );


                    toggleMemoSelection(
                        id,
                        !selected
                    );

                };

        });

}


/* ==================================================
   選択確定
================================================== */

function finishMemoSelection(){

    if(
        selectedMemoIds.length === 0
    ){

        alert(
            "メモを選択してください"
        );

        return;

    }


    /*
       削除
    */

    if(
        memoMode === "delete"
    ){

        deleteSelectedMemos();

        return;

    }


    /*
       編集
    */

    if(
        memoMode === "edit"
    ){

        if(
            selectedMemoIds.length !== 1
        ){

            alert(
                "編集するメモを1つだけ選択してください"
            );

            return;

        }


        editMemo(
            selectedMemoIds[0]
        );

    }

}


/* ==================================================
   決定ボタン
================================================== */

function setupMemoSelectionButtons(){

    const box =
        document.getElementById(
            "memoModeMessage"
        );


    if(!box){
        return;
    }


    if(
        memoMode === "delete" ||
        memoMode === "edit"
    ){

        /*
           二重追加防止
        */

        if(
            box.querySelector(
                ".memo-selection-confirm"
            )
        ){

            return;

        }


        box.innerHTML += `

<button
    type="button"
    class="memo-selection-confirm"
    onclick="finishMemoSelection()"
>
    決定
</button>

`;

    }

}


/* ==================================================
   📱 ドラッグ並び替え
================================================== */

let memoDragId = null;

let memoDragTargetIndex = null;


/* ==================================================
   ドラッグ設定
================================================== */

function setupMemoDragSort(){

    document
        .querySelectorAll(
            ".memo-drag-handle"
        )
        .forEach(handle=>{

            handle.addEventListener(
                "touchstart",
                memoDragTouchStart,
                {
                    passive:false
                }
            );


            handle.addEventListener(
                "touchmove",
                memoDragTouchMove,
                {
                    passive:false
                }
            );


            handle.addEventListener(
                "touchend",
                memoDragTouchEnd,
                {
                    passive:false
                }
            );


            /*
               PC
            */

            handle.addEventListener(
                "mousedown",
                memoDragMouseDown
            );

        });

}


/* ==================================================
   タッチ開始
================================================== */

function memoDragTouchStart(event){

    if(
        event.touches.length !== 1
    ){
        return;
    }


    const handle =
        event.currentTarget;


    memoDragId =
        Number(
            handle.dataset.memoId
        );


    memoDragTargetIndex =
        null;


    const card =
        handle.closest(
            ".memo-card-item"
        );


    if(card){

        card.classList.add(
            "memo-dragging"
        );

    }


    event.preventDefault();

}


/* ==================================================
   タッチ移動
================================================== */

function memoDragTouchMove(event){

    if(
        memoDragId === null ||
        event.touches.length !== 1
    ){

        return;

    }


    const y =
        event.touches[0].clientY;


    updateMemoDragPosition(y);


    event.preventDefault();

}


/* ==================================================
   ドラッグ位置計算
================================================== */

function updateMemoDragPosition(y){

    const draggingCard =
        document.querySelector(
            `.memo-card-item[data-memo-id="${memoDragId}"]`
        );


    if(!draggingCard){
        return;
    }


    const cards =
        [
            ...document.querySelectorAll(
                ".memo-card-item"
            )
        ].filter(
            card =>
                Number(
                    card.dataset.memoId
                ) !== memoDragId
        );


    let targetIndex =
        cards.length;


    for(
        let i = 0;
        i < cards.length;
        i++
    ){

        const rect =
            cards[i].getBoundingClientRect();


        const middle =
            rect.top +
            rect.height / 2;


        if(y < middle){

            targetIndex =
                i;

            break;

        }

    }


    memoDragTargetIndex =
        targetIndex;


    /*
       古い表示を削除
    */

    document
        .querySelectorAll(
            ".memo-drag-placeholder"
        )
        .forEach(
            el =>
                el.remove()
        );


    /*
       新しい挿入位置を表示
    */

    const placeholder =
        document.createElement(
            "div"
        );


    placeholder.className =
        "memo-drag-placeholder";


    if(
        targetIndex >= cards.length
    ){

        draggingCard.parentNode.appendChild(
            placeholder
        );

    }else{

        cards[
            targetIndex
        ].parentNode.insertBefore(
            placeholder,
            cards[targetIndex]
        );

    }

}


/* ==================================================
   タッチ終了
================================================== */

function memoDragTouchEnd(event){

    if(
        memoDragId === null
    ){

        return;

    }


    const id =
        memoDragId;


    let targetIndex =
        memoDragTargetIndex;


    if(
        targetIndex === null
    ){

        resetMemoDrag();

        return;

    }


    reorderMemoInDB(
        id,
        targetIndex
    );


    resetMemoDrag();


    event.preventDefault();

}


/* ==================================================
   マウス開始
================================================== */

function memoDragMouseDown(event){

    if(
        event.button !== 0
    ){

        return;

    }


    const handle =
        event.currentTarget;


    memoDragId =
        Number(
            handle.dataset.memoId
        );


    memoDragTargetIndex =
        null;


    const card =
        handle.closest(
            ".memo-card-item"
        );


    if(card){

        card.classList.add(
            "memo-dragging"
        );

    }


    document.addEventListener(
        "mousemove",
        memoDragMouseMove
    );


    document.addEventListener(
        "mouseup",
        memoDragMouseUp
    );


    event.preventDefault();

}


/* ==================================================
   マウス移動
================================================== */

function memoDragMouseMove(event){

    if(
        memoDragId === null
    ){

        return;

    }


    updateMemoDragPosition(
        event.clientY
    );

}


/* ==================================================
   マウス終了
================================================== */

function memoDragMouseUp(){

    if(
        memoDragId === null
    ){

        return;

    }


    const id =
        memoDragId;


    const targetIndex =
        memoDragTargetIndex;


    if(
        targetIndex !== null
    ){

        reorderMemoInDB(
            id,
            targetIndex
        );

    }


    resetMemoDrag();

}


/* ==================================================
   DB上でメモを並び替える
   ※ 並び替え中は画面上だけ変更
================================================== */

function reorderMemoInDB(
    id,
    targetIndex
){

    if(
        !Array.isArray(
            memoSortWorkingOrder
        )
    ){

        return;

    }


    const list =
        memoSortWorkingOrder;


    const oldIndex =
        list.findIndex(
            memo =>
                memo.id === id
        );


    if(oldIndex < 0){

        return;

    }


    /*
       移動するメモを取り出す
    */

    const item =
        list.splice(
            oldIndex,
            1
        )[0];


    /*
       移動先を補正
    */

    if(targetIndex < 0){

        targetIndex = 0;

    }


    if(
        targetIndex > list.length
    ){

        targetIndex =
            list.length;

    }


    /*
       新しい位置へ入れる
    */

    list.splice(
        targetIndex,
        0,
        item
    );


    /*
       ★ 作業用配列を画面に反映
       ★ DBにはまだ保存しない
    */

    const memoArea =
        document.getElementById(
            "memoList"
        );


    if(!memoArea){

        return;

    }


    memoArea.innerHTML =
        list.map(
            (memo,index)=>{

                return `

<div
    class="
        memory-card
        memo-card-item
        memo-sort-item
    "
    data-memo-id="${memo.id}"
    data-memo-index="${index}"
>

<span class="memo-card-text">
    ${escapeMemoHtml(memo.text)}
</span>

<span
    class="memo-drag-handle"
    data-memo-id="${memo.id}"
    aria-label="メモを並び替える"
>
    ☰
</span>

</div>

`;

            }
        ).join("");


    /*
       ドラッグ機能を再設定
    */

    setupMemoDragSort();

}


/* ==================================================
   ドラッグ終了処理
================================================== */

function resetMemoDrag(){

    memoDragId =
        null;

    memoDragTargetIndex =
        null;


    document
        .querySelectorAll(
            ".memo-dragging"
        )
        .forEach(
            card =>
                card.classList.remove(
                    "memo-dragging"
                )
        );


    document
        .querySelectorAll(
            ".memo-drag-placeholder"
        )
        .forEach(
            element =>
                element.remove()
        );


    document.removeEventListener(
        "mousemove",
        memoDragMouseMove
    );


    document.removeEventListener(
        "mouseup",
        memoDragMouseUp
    );

}


/* ==================================================
   ✏️ 個別編集
================================================== */

function editMemo(id){

    const data =
        db.load();


    const list =
        data.dayMemories?.[
            selectedCalendarDate
        ]?.memo || [];


    const memo =
        list.find(
            item =>
                item.id === id
        );


    if(!memo){
        return;
    }


    /*
       編集対象を記憶
    */

    memoEditingId =
        id;


    /*
       既存文章を入力欄へ
    */

    const input =
        document.getElementById(
            "memoText"
        );


    if(input){

        input.value =
            memo.text;

    }


    /*
       モーダルタイトル変更
    */

    const modal =
        document.getElementById(
            "memoModal"
        );


    if(modal){

        const title =
            modal.querySelector("h2");


        if(title){

            title.textContent =
                "✏️ メモ編集";

        }


        modal.style.display =
            "block";

    }

}


/* ==================================================
   🗑 個別削除
   ※現在のUIでは基本的に
     「選択削除」から使用
================================================== */

function deleteMemo(id){

    const data =
        db.load();


    const day =
        data.dayMemories?.[
            selectedCalendarDate
        ];


    if(
        !day ||
        !Array.isArray(day.memo)
    ){

        return;

    }


    const memo =
        day.memo.find(
            item =>
                item.id === id
        );


    if(!memo){
        return;
    }


    if(
        !confirm(
            `「${memo.text}」を削除しますか？`
        )
    ){

        return;

    }


    day.memo =
        day.memo.filter(
            item =>
                item.id !== id
        );


    db.save(data);


    cancelMemoMode();

    renderDayMemory();

}


/* ==================================================
   🗑 選択したメモを削除
================================================== */

function deleteSelectedMemos(){

    const data =
        db.load();


    const day =
        data.dayMemories?.[
            selectedCalendarDate
        ];


    if(
        !day ||
        !Array.isArray(day.memo)
    ){

        return;

    }


    const targets =
        day.memo.filter(
            memo =>
                selectedMemoIds.includes(
                    memo.id
                )
        );


    if(
        targets.length === 0
    ){

        alert(
            "メモを選択してください"
        );

        return;

    }


    if(
        !confirm(
            `${targets.length}件のメモを削除しますか？`
        )
    ){

        return;

    }


    day.memo =
        day.memo.filter(
            memo =>
                !selectedMemoIds.includes(
                    memo.id
                )
        );


    db.save(data);


    cancelMemoMode();

    renderDayMemory();

}



/* ==================================================
   🔀 並び替え確定
================================================== */

function confirmMemoSort(){

    if(
        !Array.isArray(
            memoSortWorkingOrder
        )
    ){

        cancelMemoMode();

        return;

    }


    const data =
        db.load();


    if(!data.dayMemories){

        return;

    }


    if(
        !data.dayMemories[
            selectedCalendarDate
        ]
    ){

        return;

    }


    /*
       作業中の並びをDBへ反映
    */

    data.dayMemories[
        selectedCalendarDate
    ].memo =
        memoSortWorkingOrder.map(
            memo => ({
                ...memo
            })
        );


    /*
       ★ ここで初めて保存
    */

    db.save(data);


    /*
       作業用データを終了
    */

    memoSortOriginalOrder =
        null;

    memoSortWorkingOrder =
        null;


    /*
       通常モードへ戻る
    */

    memoMode =
        "normal";

    selectedMemoIds =
        [];


    resetMemoDrag();


    const message =
        document.getElementById(
            "memoModeMessage"
        );


    if(message){

        message.remove();

    }


    renderDayMemos();

}


/* ==================================================
   モード終了
================================================== */

function cancelMemoMode(){

    /*
       🔀 並び替えモードをキャンセル
       → DBは変更しない
    */

    if(
        memoMode === "sort"
    ){

        /*
           作業用並びを破棄
        */

        memoSortWorkingOrder =
            null;

        memoSortOriginalOrder =
            null;

    }


    /*
       モード終了
    */

    memoMode =
        "normal";

    selectedMemoIds =
        [];


    resetMemoDrag();


    const message =
        document.getElementById(
            "memoModeMessage"
        );


    if(message){

        message.remove();

    }


    /*
       DBに保存されている
       本来の順番を再表示
    */

    renderDayMemos();

}