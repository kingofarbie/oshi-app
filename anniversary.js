/* =====================
🎂 記念日・誕生日
===================== */

function getMemorialDays(){

const data = db.load();

if(!data.memorialDays){
    data.memorialDays = [];
    db.save(data);
}

return data.memorialDays;

}

/* =====================
記念日追加
===================== */

function addMemorialDay(){

const date =
    document.getElementById("memorial-date")?.value;

const title =
    document.getElementById("memorial-title")?.value.trim();

const type =
    document.getElementById("memorial-type")?.value || "other";

const icon =
    document.getElementById("memorial-icon")?.value || "⭐";

const color =
    memorialSelectedColor;
    
const memo =
    document.getElementById("memorial-memo")?.value.trim() || "";

const yearly =
    document.getElementById("memorial-yearly")?.checked || false;

const visible =
    document.getElementById("memorial-visible")?.checked !== false;


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


if(!data.memorialDays){

    data.memorialDays = [];

}


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

        x: null,
        y: null

    },

    size: {

        scale: 1

    }

};


data.memorialDays.push(item);


db.save(data);


clearMemorialForm();

renderMemorialList();

}

/* =====================
記念日一覧
===================== */

function renderMemorialList(){

const box =
    document.getElementById(
        "memorial-list"
    );

if(!box) return;


const list =
    getMemorialDays()
    .sort(
        (a,b)=>
            a.date.localeCompare(b.date)
    );


if(list.length === 0){

    box.innerHTML = `
    <div class="memorial-empty">
        🎂 まだ記念日・誕生日がありません
    </div>
    `;

    return;

}


box.innerHTML =
    list.map(item => `

    <div
        class="memorial-list-item
        ${item.visible ? "" : "memorial-hidden"}"
    >

        <div
            class="memorial-list-icon"
            style="background:${item.color};"
        >
            ${item.icon}
        </div>


        <div class="memorial-list-info">

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


        <div class="memorial-list-actions">

            <button
                onclick="toggleMemorialVisibility(${item.id})"
            >
                ${item.visible ? "👁" : "🙈"}
            </button>

            <button
                onclick="deleteMemorialDay(${item.id})"
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

function toggleMemorialVisibility(id){

const data =
    db.load();

const item =
    data.memorialDays?.find(
        m => m.id === id
    );

if(!item) return;


item.visible =
    !item.visible;


db.save(data);

renderMemorialList();

}

/* =====================
削除
===================== */

function deleteMemorialDay(id){

const data =
    db.load();


const item =
    data.memorialDays?.find(
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


data.memorialDays =
    data.memorialDays.filter(
        m => m.id !== id
    );


db.save(data);

renderMemorialList();

}

/* =====================
入力クリア
===================== */

function clearMemorialForm(){

const ids = [

    "memorial-date",
    "memorial-title",
    "memorial-icon",
    "memorial-memo"

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
        "memorial-yearly"
    );

if(yearly){

    yearly.checked = false;

}


const visible =
    document.getElementById(
        "memorial-visible"
    );

if(visible){

    visible.checked = true;

}

}

console.log("anniversary.js loaded");
/* =====================
記念日・誕生日ページを開く
===================== */

function openMemorialPage(){

    const page =
        document.getElementById("memorialPage");

    if(!page){
        console.error("memorialPage が見つかりません");
        return;
    }

    switchTab("memorialPage");

    renderMemorialList();
}

function closeMemorialPage() {

    const memorialPage =
        document.getElementById("memorialPage");

    if (memorialPage) {
        memorialPage.style.display = "";
    }

    switchTab("settingsPage");

}




/* =====================
   🎨 記念日 色選択
===================== */

const MEMORIAL_COLOR_HISTORY_KEY =
    "memorial_color_history";


const MEMORIAL_COLORS = [

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


let memorialSelectedColor =
    "#ffb3cc";


/* =====================
   色名取得
===================== */

function getMemorialColorName(color){

    const found =
        MEMORIAL_COLORS.find(
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

function getMemorialColorHistory(){

    try{

        const data =
            localStorage.getItem(
                MEMORIAL_COLOR_HISTORY_KEY
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

function saveMemorialColorHistory(color){

    let history =
        getMemorialColorHistory();


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
        MEMORIAL_COLOR_HISTORY_KEY,
        JSON.stringify(history)
    );

}


/* =====================
   色選択パネル表示
===================== */

function toggleMemorialColorPicker(){

    const picker =
        document.getElementById(
            "memorialColorPicker"
        );

    if(!picker){

        return;

    }


    const isHidden =
        picker.style.display === "none"
        || picker.style.display === "";


    if(isHidden){

        renderMemorialColorPicker();

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

function renderMemorialColorPicker(){

    const matrix =
        document.getElementById(
            "memorialColorMatrix"
        );

    const recent =
        document.getElementById(
            "memorialRecentColors"
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
        getMemorialColorHistory();


    history.forEach(color => {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "memorial-recent-choice";


        button.style.background =
            color;


        if(
            color.toLowerCase()
            === memorialSelectedColor.toLowerCase()
        ){

            button.classList.add(
                "selected"
            );

        }


        button.title =
            getMemorialColorName(color);


        button.onclick =
            function(){

                selectMemorialColor(color);

            };


        recent.appendChild(button);

    });


    /* =====================
       カラーマトリックス
    ===================== */

    MEMORIAL_COLORS.forEach(item => {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "memorial-color-choice";


        button.style.background =
            item.color;


        button.title =
            item.name;


        if(
            item.color.toLowerCase()
            === memorialSelectedColor.toLowerCase()
        ){

            button.classList.add(
                "selected"
            );

        }


        button.onclick =
            function(){

                selectMemorialColor(
                    item.color
                );

            };


        matrix.appendChild(button);

    });

}


/* =====================
   色を選択
===================== */

function selectMemorialColor(color){

    memorialSelectedColor =
        color;



    const preview =
        document.getElementById(
            "memorialColorPreview"
        );


    if(preview){

        preview.style.background =
            color;

    }


    const name =
        document.getElementById(
            "memorialColorName"
        );


    if(name){

        name.textContent =
            getMemorialColorName(color);

    }


    saveMemorialColorHistory(
        color
    );


    renderMemorialColorPicker();


    /*
       選択後は閉じる
    */

    const picker =
        document.getElementById(
            "memorialColorPicker"
        );


    if(picker){

        picker.style.display =
            "none";

    }

}


/* =====================
   初期化
===================== */

function initMemorialColorSelector(
    initialColor
){

    if(initialColor){

        memorialSelectedColor =
            initialColor;

    }


    const preview =
        document.getElementById(
            "memorialColorPreview"
        );


    const name =
        document.getElementById(
            "memorialColorName"
        );


    if(preview){

        preview.style.background =
            memorialSelectedColor;

    }


    if(name){

        name.textContent =
            getMemorialColorName(
                memorialSelectedColor
            );

    }

}