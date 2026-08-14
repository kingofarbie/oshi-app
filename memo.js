function addMemo(){

    document.getElementById("memoText").value="";

    document.getElementById("memoModal").style.display="block";

}

function closeMemoModal(){

    document.getElementById("memoModal").style.display="none";

}

function saveMemo(){

    const text =
        document.getElementById("memoText").value.trim();

    if(!text){
        return;
    }

    const data = db.load();

    if(!data.dayMemories){
        data.dayMemories = {};
    }

    if(!data.dayMemories[selectedCalendarDate]){

        data.dayMemories[selectedCalendarDate]={

            memo:[],

            photos:[],

            videos:[],

            expenses:[],

            rating:0,

            comment:""

        };

    }

    data.dayMemories[selectedCalendarDate].memo.push({

        id:Date.now(),

        text:text

    });

    db.save(data);

    closeMemoModal();
    
    renderDayMemory();

}


/* =====================
   📝 メモ表示
===================== */

function renderDayMemos(){

    const data = db.load();

    const day =
        data.dayMemories?.[selectedCalendarDate];

    const memoArea =
        document.getElementById("memoList");

    if(!memoArea){
        return;
    }

    if(day && day.memo && day.memo.length){

        memoArea.innerHTML =
            day.memo.map(m => `

<div class="memory-card">

${m.text}

</div>

`).join("");

    }else{

        memoArea.innerHTML =
            "<div class='check-empty'>まだメモはありません</div>";

    }

}