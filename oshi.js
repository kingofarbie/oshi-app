console.log("★ oshi.js 読み込みOK");


/* =========================
   推しページ読み込み
========================= */

function loadOshiPage(){

    const container =
        document.getElementById("oshiContainer");

    if(!container){

        console.error(
            "oshiContainer が見つかりません"
        );

        return;

    }


    fetch("oshi.html")

        .then(response => {

            if(!response.ok){

                throw new Error(
                    "oshi.html の読み込みに失敗しました"
                );

            }

            return response.text();

        })

        .then(html => {

            container.innerHTML = html;

            console.log(
                "★ oshi.html 読み込みOK"
            );


            /* =====================
               HTML読み込み後に初期化
            ===================== */

            initOshiList();

        })

        .catch(error => {

            console.error(
                "oshi.html 読み込みエラー:",
                error
            );

            container.innerHTML = `
                <div class="card">
                    <p>
                        推しページを読み込めませんでした。
                    </p>
                </div>
            `;

        });

}


/* =========================
   推しリスト
========================= */


/*
    付箋カラー

    後からここだけ変更すれば
    推し付箋のデザインを変更できる。
*/

const OSHI_PIN_COLORS = [

    "#fff3f8",
    "#f3f7ff",
    "#f5f0ff",
    "#effff6",
    "#fff8ed",
    "#f3faff",
    "#fff1f5",
    "#f4f1ff"

];


/* =========================
   ジャンル名
========================= */

const OSHI_GENRE_NAMES = {

    artists: "🎤 アーティスト",
    sports: "⚽ スポーツ",
    other: "その他"

};


/* =========================
   区分名
========================= */

const OSHI_TYPE_NAMES = {

    individual: "👤 個人",
    group: "👥 団体"

};


/* =========================
   登録モーダル
========================= */

function openOshiRegisterModal(){

    const modal =
        document.getElementById(
            "oshiRegisterModal"
        );

    if(!modal){
        return;
    }

    modal.classList.add("show");

}


function closeOshiRegisterModal(){

    const modal =
        document.getElementById(
            "oshiRegisterModal"
        );

    if(!modal){
        return;
    }

    modal.classList.remove("show");

}


/* =========================
   推し登録
========================= */

function registerOshi(){

    const name =
        document.getElementById(
            "oshiRegisterName"
        )?.value.trim();

    const reading =
        document.getElementById(
            "oshiRegisterReading"
        )?.value.trim();

    const genre =
        document.getElementById(
            "oshiRegisterGenre"
        )?.value;

    const type =
        document.getElementById(
            "oshiRegisterType"
        )?.value;


    if(!name){

        alert(
            "名前・名称を入力してください。"
        );

        return;

    }


    const data =
        db.load();


    if(!data.oshiList){

        data.oshiList = [];

    }


    const oshi = {

        id:
            "oshi_" +
            Date.now(),

        name:
            name,

        reading:
            reading || name,

        genre:
            genre || "other",

        type:
            type || "individual",

        registeredAt:
            Date.now(),

        listed:
            true

    };


    data.oshiList.push(oshi);


    db.save(data);


    closeOshiRegisterModal();


    clearOshiRegisterForm();


    renderOshiList();

}


/* =========================
   登録フォームクリア
========================= */

function clearOshiRegisterForm(){

    const name =
        document.getElementById(
            "oshiRegisterName"
        );

    const reading =
        document.getElementById(
            "oshiRegisterReading"
        );


    if(name){

        name.value = "";

    }


    if(reading){

        reading.value = "";

    }

}


/* =========================
   推しリスト表示
========================= */

function renderOshiList(){

    const container =
        document.getElementById(
            "oshiList"
        );

    if(!container){

        console.warn(
            "oshiList がまだ存在しません"
        );

        return;

    }


    const data =
        db.load();


    const list =
        (data.oshiList || [])
        .filter(
            oshi =>
                oshi.listed !== false
        );


    const genreFilter =
        document.getElementById(
            "oshiGenreFilter"
        )?.value || "all";


    const typeFilter =
        document.getElementById(
            "oshiTypeFilter"
        )?.value || "all";


    const sort =
        document.getElementById(
            "oshiSort"
        )?.value || "registered";


    /* =====================
       絞り込み
    ===================== */

    let filtered =
        list.filter(oshi => {

            if(
                genreFilter !== "all" &&
                oshi.genre !== genreFilter
            ){

                return false;

            }


            if(
                typeFilter !== "all" &&
                oshi.type !== typeFilter
            ){

                return false;

            }


            return true;

        });


    /* =====================
       並べ替え
    ===================== */

    if(sort === "reading"){

        filtered.sort(
            (a,b) =>

                String(
                    a.reading ||
                    a.name
                ).localeCompare(
                    String(
                        b.reading ||
                        b.name
                    ),
                    "ja"
                )

        );

    }else{

        filtered.sort(
            (a,b) =>
                (a.registeredAt || 0) -
                (b.registeredAt || 0)
        );

    }


    /* =====================
       表示
    ===================== */

    if(filtered.length === 0){

        container.innerHTML = `

            <div class="oshi-empty">

                ⭐

                <br>

                まだ推しが登録されていません

            </div>

        `;

        return;

    }


    container.innerHTML =

        filtered.map(
            (oshi,index) => {

                const color =
                    OSHI_PIN_COLORS[
                        index %
                        OSHI_PIN_COLORS.length
                    ];


                return `

                    <div
                        class="oshi-list-card"
                        style="
                            --oshi-pin-color:
                                ${color};
                        "
                        onclick="
                            openOshiDetail(
                                '${oshi.id}'
                            )
                        ">


                        <div
                            class="oshi-list-name">

                            ${escapeOshiHtml(
                                oshi.name
                            )}

                        </div>


                        <div
                            class="oshi-list-info">

                            <span>

                                ${
                                    OSHI_GENRE_NAMES[
                                        oshi.genre
                                    ]
                                    ||
                                    "その他"
                                }

                            </span>


                            <span>

                                ${
                                    OSHI_TYPE_NAMES[
                                        oshi.type
                                    ]
                                    ||
                                    "個人"
                                }

                            </span>

                        </div>


                        <button
                            type="button"
                            class="oshi-list-delete"
                            title="リストから削除"
                            onclick="
                                event.stopPropagation();
                                removeOshiFromList(
                                    '${oshi.id}'
                                );
                            ">

                            ×

                        </button>


                    </div>

                `;

            }

        ).join("");

}


/* =========================
   リストから削除
========================= */

function removeOshiFromList(id){

    if(
        !confirm(
            "推しリストから外しますか？\n\n詳細データは削除されません。"
        )
    ){

        return;

    }


    const data =
        db.load();


    const oshi =
        (data.oshiList || [])
        .find(
            item =>
                item.id === id
        );


    if(!oshi){

        return;

    }


    /*
       完全削除ではなく
       listed=false にする。

       詳細データは残す。
    */

    oshi.listed =
        false;


    db.save(data);


    renderOshiList();

}


/* =========================
   絞り込み・並べ替え
========================= */

function initOshiList(){

    const genre =
        document.getElementById(
            "oshiGenreFilter"
        );

    const type =
        document.getElementById(
            "oshiTypeFilter"
        );

    const sort =
        document.getElementById(
            "oshiSort"
        );


    if(genre){

        genre.addEventListener(
            "change",
            renderOshiList
        );

    }


    if(type){

        type.addEventListener(
            "change",
            renderOshiList
        );

    }


    if(sort){

        sort.addEventListener(
            "change",
            renderOshiList
        );

    }


    renderOshiList();

}


/* =========================
   HTMLエスケープ
========================= */

function escapeOshiHtml(value){

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================
   詳細ページ
========================= */

function openOshiDetail(id){

    /*
       次の段階で
       oshi-details.html に接続する。
    */

    console.log(
        "推し詳細を開く:",
        id
    );

}


/* =========================
   起動
========================= */

document.addEventListener(
    "DOMContentLoaded",
    loadOshiPage
);