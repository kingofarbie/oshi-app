/* =====================
🎂 記念日・誕生日
===================== */

function getAnniversaryDays(){

const data = db.load();

if(!data.anniversaryDays){
    data.anniversaryDays = [];
    db.save(data);
}

return data.anniversaryDays;

}


/* =====================
記念日追加・編集
===================== */

function addAnniversaryDay(){

    const date =
        document.getElementById("anniversary-date")?.value;

    const title =
        document.getElementById("anniversary-title")?.value.trim();

    const type =
        document.getElementById("anniversary-type")?.value || "other";

    const icon =
        document.getElementById("anniversary-icon")?.value || "⭐";

    const color =
        anniversarySelectedColor;

    const memo =
        document.getElementById("anniversary-memo")?.value.trim() || "";

    const yearly =
        document.getElementById("anniversary-yearly")?.checked || false;

    const visible =
        document.getElementById("anniversary-visible")?.checked !== false;


    if(!date){

        alert("日付を入力してください");

        return;

    }

    if(!title){

        alert("タイトルを入力してください");

        return;

    }


    const data =
        db.load();


    if(!data.anniversaryDays){

        data.anniversaryDays = [];

    }


    /*
       編集モード
    */

    if(window.editingAnniversaryId){

        const item =
            data.anniversaryDays.find(
                m =>
                    m.id ===
                    window.editingAnniversaryId
            );


        if(item){

            item.date = date;
            item.title = title;
            item.type = type;
            item.icon = icon;
            item.color = color;
            item.memo = memo;
            item.yearly = yearly;
            item.visible = visible;


            db.save(data);

            window.editingAnniversaryId =
                null;


            clearAnniversaryForm();

            const button =
                document.querySelector(
                    ".anniversary-add-button"
                );

            if(button){

                button.textContent =
                    "🎂 記念日を登録";

            }


            renderAnniversaryList();

            return;

        }

    }


    /*
       新規登録
    */

    const item = {

        id:
            Date.now() +
            Math.random(),

        date,

        title,

        type,

        icon,

        color,

        memo,

        yearly,

        visible,

        position: {

            x:null,
            y:null

        },

        size: {

            scale:1

        }

    };


    data.anniversaryDays.push(item);


    db.save(data);


    clearAnniversaryForm();

    renderAnniversaryList();

}


/* =====================
記念日一覧
===================== */

function renderAnniversaryList(){

const box =
    document.getElementById(
        "anniversary-list"
    );

if(!box) return;


const list =
    getAnniversaryDays()
    .sort(
        (a,b)=>
            a.date.localeCompare(b.date)
    );


if(list.length === 0){

    box.innerHTML = `
    <div class="anniversary-empty">
        🎂 まだ記念日・誕生日がありません
    </div>
    `;

    return;

}


box.innerHTML =
    list.map(item => `

    <div
        class="anniversary-list-item
        ${item.visible ? "" : "anniversary-hidden"}"
    >

        <div
            class="anniversary-list-icon"
            style="background:${item.color};"
        >
            ${item.icon}
        </div>


        <div class="anniversary-list-info">

            <strong>
                ${item.title}
            </strong>

            <span>
                ${item.date}
            </span>

            ${
                item.yearly
                ?
                `<small>🔁 毎年</small>`
                :
                ""
            }

        </div>


<div class="anniversary-list-actions">

    <button
        onclick="editAnniversaryDay(${item.id})"
        title="編集"
    >
        ✏️
    </button>

    <button
        onclick="toggleAnniversaryVisibility(${item.id})"
        title="表示・非表示"
    >
        ${item.visible ? "👁" : "🙈"}
    </button>

    <button
        onclick="deleteAnniversaryDay(${item.id})"
        title="削除"
    >
        🗑️
    </button>

</div>



    </div>

    `)
    .join("");

}

/* =====================
表示 / 非表示
===================== */

function toggleAnniversaryVisibility(id){

const data =
    db.load();

const item =
    data.anniversaryDays?.find(
        m => m.id === id
    );

if(!item) return;


item.visible =
    !item.visible;


db.save(data);

renderAnniversaryList();

}

/* =====================
削除
===================== */

function deleteAnniversaryDay(id){

const data =
    db.load();


const item =
    data.anniversaryDays?.find(
        m => m.id === id
    );


if(!item) return;


if(
    !confirm(
        `「${item.title}」を削除しますか？`
    )
){
    return;
}


data.anniversaryDays =
    data.anniversaryDays.filter(
        m => m.id !== id
    );


db.save(data);

renderAnniversaryList();

}

/* =====================
   記念日編集
===================== */

function editAnniversaryDay(id){

    const data =
        db.load();

    const item =
        data.anniversaryDays?.find(
            m => m.id === id
        );

    if(!item) return;


    const date =
        document.getElementById("anniversary-date");

    const title =
        document.getElementById("anniversary-title");

    const type =
        document.getElementById("anniversary-type");

    const icon =
        document.getElementById("anniversary-icon");

    const memo =
        document.getElementById("anniversary-memo");

    const yearly =
        document.getElementById("anniversary-yearly");

    const visible =
        document.getElementById("anniversary-visible");


    if(date){
        date.value = item.date || "";
    }

    if(title){
        title.value = item.title || "";
    }

    if(type){
        type.value = item.type || "other";
    }

    if(icon){
        icon.value = item.icon || "⭐";
    }

    if(memo){
        memo.value = item.memo || "";
    }

    if(yearly){
        yearly.checked =
            item.yearly === true;
    }

    if(visible){
        visible.checked =
            item.visible !== false;
    }


    /*
       登録時と同じ色をセット
    */

    if(item.color){

        initAnniversaryColorSelector(
            item.color
        );

    }


    /*
       編集対象を記憶
    */

    window.editingAnniversaryId =
        id;


    /*
       ページ上部へ移動
    */

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });


    /*
       登録ボタンの表示を変更
    */

    const button =
        document.querySelector(
            ".anniversary-add-button"
        );

    if(button){

        button.textContent =
            "💾 記念日を保存";

    }

}


/* =====================
入力クリア
===================== */

function clearAnniversaryForm(){

const ids = [

    "anniversary-date",
    "anniversary-title",
    "anniversary-icon",
    "anniversary-memo"

];


ids.forEach(id => {

    const el =
        document.getElementById(id);

    if(el){

        el.value = "";

    }

});


const yearly =
    document.getElementById(
        "anniversary-yearly"
    );

if(yearly){

    yearly.checked = false;

}


const visible =
    document.getElementById(
        "anniversary-visible"
    );

if(visible){

    visible.checked = true;

}

}

console.log("anniversary.js loaded");
/* =====================
記念日・誕生日ページを開く
===================== */

function openAnniversaryPage(){

    const page =
        document.getElementById("anniversaryPage");

    if(!page){
        console.error("anniversaryPage が見つかりません");
        return;
    }

    switchTab("anniversaryPage");

    renderAnniversaryList();
}

function closeAnniversaryPage() {

    const anniversaryPage =
        document.getElementById("anniversaryPage");

    if (anniversaryPage) {
        anniversaryPage.style.display = "";
    }

    switchTab("settingsPage");

}




/* =====================
   🎨 記念日 色選択
===================== */

const ANNIVERSARY_COLOR_HISTORY_KEY =
    "anniversary_color_history";


const ANNIVERSARY_COLORS = [

    /* 淡い色 */
    {
        color:"#ffd6e3",
        name:"淡いピンク"
    },
    {
        color:"#ffd9c2",
        name:"淡いオレンジ"
    },
    {
        color:"#fff0b8",
        name:"淡いイエロー"
    },
    {
        color:"#d8f3dc",
        name:"淡いグリーン"
    },
    {
        color:"#cfe8ff",
        name:"淡いブルー"
    },
    {
        color:"#ddd0ff",
        name:"淡いパープル"
    },
    {
        color:"#ffd6f2",
        name:"淡いピンク紫"
    },
    {
        color:"#d8f5f5",
        name:"淡い水色"
    },


    /* 標準 */
    {
        color:"#ff9fbd",
        name:"ピンク"
    },
    {
        color:"#ffb36b",
        name:"オレンジ"
    },
    {
        color:"#f5d76e",
        name:"イエロー"
    },
    {
        color:"#72d39a",
        name:"グリーン"
    },
    {
        color:"#69aefc",
        name:"ブルー"
    },
    {
        color:"#a98af5",
        name:"パープル"
    },
    {
        color:"#ec8ac4",
        name:"ローズ"
    },
    {
        color:"#65caca",
        name:"ターコイズ"
    },


    /* 濃い色 */
    {
        color:"#e85d85",
        name:"濃いピンク"
    },
    {
        color:"#ed7d31",
        name:"濃いオレンジ"
    },
    {
        color:"#d4b72c",
        name:"濃いイエロー"
    },
    {
        color:"#42a96b",
        name:"濃いグリーン"
    },
    {
        color:"#397fd3",
        name:"濃いブルー"
    },
    {
        color:"#7655c7",
        name:"濃いパープル"
    },
    {
        color:"#c65391",
        name:"濃いローズ"
    },
    {
        color:"#329999",
        name:"濃いターコイズ"
    },


    /* モノトーン・ブラウン */
    {
        color:"#d8b29a",
        name:"ベージュ"
    },
    {
        color:"#a97858",
        name:"ブラウン"
    },
    {
        color:"#8f8f8f",
        name:"グレー"
    },
    {
        color:"#555555",
        name:"ダークグレー"
    },
    {
        color:"#ffffff",
        name:"ホワイト"
    },
    {
        color:"#222222",
        name:"ブラック"
    },
    {
        color:"#f3d6c8",
        name:"サーモン"
    },
    {
        color:"#c9b8a5",
        name:"グレージュ"
    }

];


let anniversarySelectedColor =
    "#ffb3cc";


/* =====================
   色名取得
===================== */

function getAnniversaryColorName(color){

    const found =
        ANNIVERSARY_COLORS.find(
            item =>
                item.color.toLowerCase()
                === color.toLowerCase()
        );

    return found
        ? found.name
        : "カスタムカラー";

}


/* =====================
   履歴取得
===================== */

function getAnniversaryColorHistory(){

    try{

        const data =
            localStorage.getItem(
                ANNIVERSARY_COLOR_HISTORY_KEY
            );

        if(!data){

            return [];

        }

        const parsed =
            JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

    }catch(error){

        console.error(
            "色履歴読み込みエラー",
            error
        );

        return [];

    }

}


/* =====================
   履歴保存
===================== */

function saveAnniversaryColorHistory(color){

    let history =
        getAnniversaryColorHistory();


    history =
        history.filter(
            item =>
                item.toLowerCase()
                !== color.toLowerCase()
        );


    history.unshift(color);


    history =
        history.slice(0,8);


    localStorage.setItem(
        ANNIVERSARY_COLOR_HISTORY_KEY,
        JSON.stringify(history)
    );

}


/* =====================
   色選択パネル表示
===================== */

function toggleAnniversaryColorPicker(){

    const picker =
        document.getElementById(
            "anniversaryColorPicker"
        );

    if(!picker){

        return;

    }


    const isHidden =
        picker.style.display === "none"
        || picker.style.display === "";


    if(isHidden){

        renderAnniversaryColorPicker();

        picker.style.display =
            "block";

    }else{

        picker.style.display =
            "none";

    }

}


/* =====================
   色選択UI生成
===================== */

function renderAnniversaryColorPicker(){

    const matrix =
        document.getElementById(
            "anniversaryColorMatrix"
        );

    const recent =
        document.getElementById(
            "anniversaryRecentColors"
        );


    if(!matrix || !recent){

        return;

    }


    matrix.innerHTML = "";
    recent.innerHTML = "";


    /* =====================
       最近使った色
    ===================== */

    const history =
        getAnniversaryColorHistory();


    history.forEach(color => {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "anniversary-recent-choice";


        button.style.background =
            color;


        if(
            color.toLowerCase()
            === anniversarySelectedColor.toLowerCase()
        ){

            button.classList.add(
                "selected"
            );

        }


        button.title =
            getAnniversaryColorName(color);


        button.onclick =
            function(){

                selectAnniversaryColor(color);

            };


        recent.appendChild(button);

    });


    /* =====================
       カラーマトリックス
    ===================== */

    ANNIVERSARY_COLORS.forEach(item => {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "anniversary-color-choice";


        button.style.background =
            item.color;


        button.title =
            item.name;


        if(
            item.color.toLowerCase()
            === anniversarySelectedColor.toLowerCase()
        ){

            button.classList.add(
                "selected"
            );

        }


        button.onclick =
            function(){

                selectAnniversaryColor(
                    item.color
                );

            };


        matrix.appendChild(button);

    });

}


/* =====================
   色を選択
===================== */

function selectAnniversaryColor(color){

    anniversarySelectedColor =
        color;



    const preview =
        document.getElementById(
            "anniversaryColorPreview"
        );


    if(preview){

        preview.style.background =
            color;

    }


    const name =
        document.getElementById(
            "anniversaryColorName"
        );


    if(name){

        name.textContent =
            getAnniversaryColorName(color);

    }


    saveAnniversaryColorHistory(
        color
    );


    renderAnniversaryColorPicker();


    /*
       選択後は閉じる
    */

    const picker =
        document.getElementById(
            "anniversaryColorPicker"
        );


    if(picker){

        picker.style.display =
            "none";

    }

}


/* =====================
   初期化
===================== */

function initAnniversaryColorSelector(
    initialColor
){

    if(initialColor){

        anniversarySelectedColor =
            initialColor;

    }


    const preview =
        document.getElementById(
            "anniversaryColorPreview"
        );


    const name =
        document.getElementById(
            "anniversaryColorName"
        );


    if(preview){

        preview.style.background =
            anniversarySelectedColor;

    }


    if(name){

        name.textContent =
            getAnniversaryColorName(
                anniversarySelectedColor
            );

    }

}