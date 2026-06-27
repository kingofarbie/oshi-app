const DEFAULT_CATEGORIES = [

{ name:"イベント", icon:"🎫", color:"#ff66aa" },
{ name:"ライブ", icon:"🎤", color:"#ff66aa" },
{ name:"フェス", icon:"🎵", color:"#9966ff" },
{ name:"試合", icon:"⚽", color:"#33cc66" },
{ name:"遠征", icon:"✈️", color:"#3399ff" },
{ name:"特典会", icon:"🎁", color:"#ff9933" },
{ name:"握手会", icon:"🤝", color:"#ff66aa" },
{ name:"配信", icon:"📺", color:"#3399ff" },
{ name:"テレビ", icon:"📺", color:"#9966ff" },
{ name:"ラジオ", icon:"📻", color:"#33cc66" },
{ name:"病院", icon:"🏥", color:"#3399ff" },
{ name:"仕事", icon:"💼", color:"#9966ff" },
{ name:"学校", icon:"📚", color:"#33cc66" },
{ name:"旅行", icon:"✈️", color:"#ff9933" },
{ name:"誕生日", icon:"🎂", color:"#ff66aa" }

];


function initializeCategories(){

    const data = db.load();

    if(!data.categories || data.categories.length===0){

        data.categories =
            DEFAULT_CATEGORIES.map((c,i)=>({

                id:i+1,

                ...c

            }));

        db.save(data);

    }

}




/* =====================
   カテゴリ追加
===================== */

function addCategory(){

    const name =
        document.getElementById("category-name")
        .value
        .trim();


    const icon =
        document.getElementById("category-icon")
        .value;


    const color =
        document.getElementById("category-color")
        .value;


    if(!name){

        alert("カテゴリ名を入力してください");

        return;

    }


    const data = db.load();


    if(!data.categories){

        data.categories = [];

    }


    data.categories.push({

        id: Date.now(),

        name: name,

        icon: icon,

        color: color

    });


    db.save(data);



    // 入力欄リセット

    document.getElementById("category-name")
    .value = "";


    // アイコンを初期値へ戻す

    document.getElementById("category-icon")
    .value = "📌";


    // 色を初期値へ戻す

    document.getElementById("category-color")
    .value = "#ff66aa";



    displayCategories();

    updateEventCategoryOptions();


    alert("カテゴリを追加しました");

}

/* =====================
   カテゴリ削除
===================== */

function deleteCategory(id){


    if(
        !confirm(
            "このカテゴリを削除しますか？"
        )
    ){

        return;

    }



    const data =
        db.load();



    data.categories =
        data.categories.filter(
            c=>c.id !== id
        );



    db.save(data);



    displayCategories();
    
    updateEventCategoryOptions();

}



/* =====================
   カテゴリ表示
===================== */

function displayCategories(){

const box =
    document.getElementById(
        "category-list"
    );

if(!box)
    return;

const data =
    db.load();

const categories =
    data.categories || [];

if(categories.length===0){

    box.innerHTML =
    "現在カテゴリなし";

    return;

}


box.innerHTML =

categories.map(c=>`

<div style="
color:${c.color};
margin:8px 0;
">${c.icon}
${c.name}

<span
onclick="deleteCategory(${c.id})"
style="
cursor:pointer;
margin-left:8px;
">

🗑

</span></div>`).join("");


}



/* =====================
イベントカテゴリ更新
===================== */

function updateEventCategoryOptions(){

    const eventSelect =
        document.getElementById("event-category");

    const filterSelect =
        document.getElementById("event-filter");

    const data = db.load();
    const categories = data.categories || [];
    
    let html = "";

    categories.forEach(c=>{

        html += `
        <option value="${c.name}">
            ${c.icon} ${c.name}
        </option>`;

    });

    if(eventSelect){
        eventSelect.innerHTML = html;
    }

    if(filterSelect){

        filterSelect.innerHTML =
            `<option value="all">すべて</option>` + html;

    }

}

/* =====================
カテゴリ情報取得
===================== */

function getCategoryInfo(name){

const data = db.load();

const categories =
    data.categories || [];

const category =
    categories.find(
        c => c.name === name
    );

return category || null;

}


