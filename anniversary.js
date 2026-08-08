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
    document.getElementById("memorial-color")?.value || "#ffb3cc";

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


/* =====================
記念日・誕生日ページを開く
===================== */

function openMemorialPage(){

const page =
    document.getElementById("memorialPage");

if(!page){
    return;
}

/* 他のページを非表示 */
document
    .querySelectorAll(".page")
    .forEach(p => {
        p.style.display = "none";
        p.classList.remove("active");
    });

/* 記念日ページを表示 */
page.style.display = "block";
page.classList.add("active");

/* 登録済み一覧を更新 */
if(typeof renderMemorialList === "function"){
    renderMemorialList();
}

}