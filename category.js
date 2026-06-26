/* =====================
   カテゴリ追加
===================== */

function addCategory(){

    const name =
        document.getElementById(
            "category-name"
        ).value.trim();


    const icon =
        document.getElementById(
            "category-icon"
        ).value;


    const color =
        document.getElementById(
            "category-color"
        ).value;


    if(!name){

        alert(
            "カテゴリ名を入力してください"
        );

        return;

    }


    const data =
        db.load();



    if(!data.categories){

        data.categories=[];

    }



    data.categories.push({

        id:Date.now(),

        name:name,

        icon:icon,

        color:color

    });



    db.save(data);



    document.getElementById(
        "category-name"
    ).value="";



    displayCategories();

    updateEventCategoryOptions();



    alert(
        "カテゴリを追加しました"
    );

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

    let html =
        `<option value="イベント">🎫 イベント</option>
         <option value="フェス">🎵 フェス</option>
         <option value="試合">⚽ 試合</option>`;

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


