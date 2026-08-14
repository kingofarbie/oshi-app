/* =====================
   📝 1日手帳 メモ機能
===================== */


/* =====================
   メモ追加
===================== */

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
    }

}


/* =====================
   メモ追加モーダル閉じる
===================== */

function closeMemoModal(){

    const modal =
        document.getElementById("memoModal");

    if(modal){
        modal.style.display = "none";
    }

}


/* =====================
   メモ保存
===================== */

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

    if(!data.dayMemories[selectedCalendarDate]){

        data.dayMemories[selectedCalendarDate] = {

            memo: [],
            photos: [],
            videos: [],
            expenses: [],
            rating: 0,
            comment: ""

        };

    }

    data.dayMemories[selectedCalendarDate].memo.push({

        id: Date.now(),

        text: text

    });

    db.save(data);

    closeMemoModal();

    renderDayMemory();

}


/* =====================
   メモ表示
===================== */

function renderDayMemos(){

    const data =
        db.load();

    const day =
        data.dayMemories?.[selectedCalendarDate];

    const memoArea =
        document.getElementById("memoList");

    if(!memoArea){
        return;
    }

    renderMemoToolbar();

    if(
        !day ||
        !day.memo ||
        day.memo.length === 0
    ){

        memoArea.innerHTML =
            "<div class='check-empty'>まだメモはありません</div>";

        return;

    }

    memoArea.innerHTML =
        day.memo.map((m,index)=>`

<div
    class="memory-card memo-card-item"
    data-memo-id="${m.id}"
    data-memo-index="${index}"
>

    <span class="memo-card-text">
        ${escapeMemoHtml(m.text)}
    </span>

</div>

`).join("");


    setupMemoLongPress();

}


/* =====================
   メモ用HTMLエスケープ
===================== */

function escapeMemoHtml(text){

    return String(text || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* =====================
   メモ操作モード
===================== */

let memoMode = "normal";

let selectedMemoIds = [];


/* =====================
   メモ操作ボタン表示
===================== */

function renderMemoToolbar(){

    const memoArea =
        document.getElementById("memoList");

    if(!memoArea){
        return;
    }

    let toolbar =
        document.getElementById("memoToolbar");

    if(!toolbar){

        toolbar =
            document.createElement("div");

        toolbar.id =
            "memoToolbar";

        memoArea.parentNode.insertBefore(
            toolbar,
            memoArea
        );

    }

    toolbar.innerHTML = `

<div class="memo-toolbar">

<button
    type="button"
    onclick="addMemo()">
    ＋ 追加
</button>

<button
    type="button"
    onclick="startMemoDeleteMode()">
    🗑 削除
</button>

<button
    type="button"
    onclick="startMemoEditMode()">
    ✏️ 編集
</button>

<button
    type="button"
    onclick="startMemoSortMode()">
    🔀 並び替え
</button>

</div>

`;

}


/* =====================
   メモ選択
===================== */

function toggleMemoSelection(id){

    const index =
        selectedMemoIds.indexOf(id);

    if(index >= 0){

        selectedMemoIds.splice(
            index,
            1
        );

    }else{

        selectedMemoIds.push(id);

    }

    updateMemoSelectionDisplay();

}


/* =====================
   選択表示
===================== */

function updateMemoSelectionDisplay(){

    document
        .querySelectorAll(".memo-card-item")
        .forEach(card=>{

            const id =
                Number(
                    card.dataset.memoId
                );

            card.classList.toggle(
                "memo-selected",
                selectedMemoIds.includes(id)
            );

        });

}


/* =====================
   削除モード
===================== */

function startMemoDeleteMode(){

    const data =
        db.load();

    const list =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo || [];

    if(list.length === 0){

        alert("削除するメモがありません");

        return;

    }

    memoMode = "delete";

    selectedMemoIds = [];

    renderMemoModeMessage(
        "🗑 削除するメモを選択してください"
    );

    setupMemoSelection();

}


/* =====================
   編集モード
===================== */

function startMemoEditMode(){

    const data =
        db.load();

    const list =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo || [];

    if(list.length === 0){

        alert("編集するメモがありません");

        return;

    }

    memoMode = "edit";

    selectedMemoIds = [];

    renderMemoModeMessage(
        "✏️ 編集するメモを1つ選択してください"
    );

    setupMemoSelection();

}


/* =====================
   並び替えモード
===================== */

function startMemoSortMode(){

    const data =
        db.load();

    const list =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo || [];

    if(list.length < 2){

        alert("並び替えるにはメモが2つ以上必要です");

        return;

    }

    memoMode = "sort";

    selectedMemoIds = [];

    renderMemoModeMessage(
        "🔀 並び替えるメモを選択してください"
    );

    setupMemoSelection();

}


/* =====================
   モード案内
===================== */

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

${text}

<button
    type="button"
    onclick="cancelMemoMode()">
    キャンセル
</button>

</div>

`;

}


/* =====================
   メモ選択モード
===================== */

function setupMemoSelection(){

    document
        .querySelectorAll(".memo-card-item")
        .forEach(card=>{

            card.onclick =
                function(){

                    const id =
                        Number(
                            this.dataset.memoId
                        );

                    if(memoMode === "sort"){

                        selectMemoForSort(id);

                        return;

                    }

                    toggleMemoSelection(id);

                };

        });

}


/* =====================
   長押し
===================== */

function setupMemoLongPress(){

    document
        .querySelectorAll(".memo-card-item")
        .forEach(card=>{

            let timer = null;

            card.addEventListener(
                "touchstart",
                function(){

                    timer =
                        setTimeout(()=>{

                            openMemoActionMenu(
                                Number(
                                    card.dataset.memoId
                                )
                            );

                        },700);

                },
                {passive:true}
            );

            card.addEventListener(
                "touchend",
                function(){

                    clearTimeout(timer);

                }
            );

            card.addEventListener(
                "touchmove",
                function(){

                    clearTimeout(timer);

                },
                {passive:true}
            );

        });

}


/* =====================
   長押しメニュー
===================== */

function openMemoActionMenu(id){

    const data =
        db.load();

    const memo =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo
        ?.find(m=>m.id===id);

    if(!memo){
        return;
    }

    const result =
        confirm(
            `「${memo.text}」\n\nOK → 編集\nキャンセル → 削除確認`
        );

    if(result){

        editMemo(id);

    }else{

        deleteMemo(id);

    }

}


/* =====================
   個別編集
===================== */

function editMemo(id){

    const data =
        db.load();

    const list =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo || [];

    const memo =
        list.find(
            m=>m.id===id
        );

    if(!memo){
        return;
    }

    const text =
        prompt(
            "メモを編集してください",
            memo.text
        );

    if(text === null){
        return;
    }

    const newText =
        text.trim();

    if(!newText){
        return;
    }

    memo.text =
        newText;

    db.save(data);

    cancelMemoMode();

    renderDayMemory();

}


/* =====================
   個別削除
===================== */

function deleteMemo(id){

    const data =
        db.load();

    const list =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo || [];

    const memo =
        list.find(
            m=>m.id===id
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

    data.dayMemories[selectedCalendarDate].memo =
        list.filter(
            m=>m.id!==id
        );

    db.save(data);

    cancelMemoMode();

    renderDayMemory();

}


/* =====================
   選択したメモを処理
===================== */

function finishMemoSelection(){

    if(selectedMemoIds.length === 0){

        alert("メモを選択してください");

        return;

    }

    if(memoMode === "delete"){

        deleteSelectedMemos();

    }

    else if(memoMode === "edit"){

        if(selectedMemoIds.length !== 1){

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


/* =====================
   選択削除
===================== */

function deleteSelectedMemos(){

    const data =
        db.load();

    const list =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo || [];

    const targets =
        list.filter(
            m =>
            selectedMemoIds.includes(
                m.id
            )
        );

    if(
        !confirm(
            `${targets.length}件のメモを削除しますか？`
        )
    ){
        return;
    }

    data.dayMemories[selectedCalendarDate].memo =
        list.filter(
            m =>
            !selectedMemoIds.includes(
                m.id
            )
        );

    db.save(data);

    cancelMemoMode();

    renderDayMemory();

}


/* =====================
   並び替え選択
===================== */

function selectMemoForSort(id){

    selectedMemoIds = [id];

    const data =
        db.load();

    const list =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo || [];

    const index =
        list.findIndex(
            m=>m.id===id
        );

    renderMemoSortControls(
        index,
        list.length
    );

}


/* =====================
   ↑ ↓ 操作用ボタン
===================== */

function renderMemoSortControls(
    index,
    length
){

    const box =
        document.getElementById(
            "memoModeMessage"
        );

    if(!box){
        return;
    }

    box.innerHTML = `

<div class="memo-mode-message">

🔀 選択中

<button
    type="button"
    onclick="moveMemoUp(${index})"
    ${index === 0 ? "disabled" : ""}>
    ↑ 上へ
</button>

<button
    type="button"
    onclick="moveMemoDown(${index})"
    ${index === length-1 ? "disabled" : ""}>
    ↓ 下へ
</button>

<button
    type="button"
    onclick="cancelMemoMode()">
    完了
</button>

</div>

`;

    updateMemoSelectionDisplay();

}


/* =====================
   メモを上へ
===================== */

function moveMemoUp(index){

    const data =
        db.load();

    const list =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo;

    if(!list || index <= 0){
        return;
    }

    const temp =
        list[index - 1];

    list[index - 1] =
        list[index];

    list[index] =
        temp;

    db.save(data);

    renderDayMemory();

    setTimeout(()=>{

        startMemoSortMode();

    },50);

}


/* =====================
   メモを下へ
===================== */

function moveMemoDown(index){

    const data =
        db.load();

    const list =
        data.dayMemories
        ?. [selectedCalendarDate]
        ?.memo;

    if(
        !list ||
        index >= list.length - 1
    ){
        return;
    }

    const temp =
        list[index + 1];

    list[index + 1] =
        list[index];

    list[index] =
        temp;

    db.save(data);

    renderDayMemory();

    setTimeout(()=>{

        startMemoSortMode();

    },50);

}


/* =====================
   メモ操作モード終了
===================== */

function cancelMemoMode(){

    memoMode =
        "normal";

    selectedMemoIds = [];

    const box =
        document.getElementById(
            "memoModeMessage"
        );

    if(box){
        box.remove();
    }

    renderDayMemos();

}


/* =====================
   メモ選択モード用
===================== */

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

        box.innerHTML += `

<button
    type="button"
    onclick="finishMemoSelection()">

決定

</button>

`;

    }

}
