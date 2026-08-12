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


            console.log(
                "★ initOshiReadingHelper() 実行直前"
            );


            initOshiReadingHelper();


            console.log(
                "★ initOshiReadingHelper() 実行完了"
            );

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

    console.log("★ 推し登録ボタンが押された");

    const modal =
        document.getElementById(
            "oshiRegisterModal"
        );

    console.log(
        "★ モーダル:",
        modal
    );

    if(!modal){

        console.error(
            "★ oshiRegisterModal が見つからない"
        );

        return;

    }

    modal.classList.add("show");

    console.log(
        "★ showを追加しました:",
        modal.className
    );

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




/* =========================
   ローマ字入力補助
========================= */

const OSHI_ROMAJI_MAP = {

    "あ":"a",
    "い":"i",
    "う":"u",
    "え":"e",
    "お":"o",

    "か":"ka",
    "き":"ki",
    "く":"ku",
    "け":"ke",
    "こ":"ko",

    "さ":"sa",
    "し":"shi",
    "す":"su",
    "せ":"se",
    "そ":"so",

    "た":"ta",
    "ち":"chi",
    "つ":"tsu",
    "て":"te",
    "と":"to",

    "な":"na",
    "に":"ni",
    "ぬ":"nu",
    "ね":"ne",
    "の":"no",

    "は":"ha",
    "ひ":"hi",
    "ふ":"fu",
    "へ":"he",
    "ほ":"ho",

    "ま":"ma",
    "み":"mi",
    "む":"mu",
    "め":"me",
    "も":"mo",

    "や":"ya",
    "ゆ":"yu",
    "よ":"yo",

    "ら":"ra",
    "り":"ri",
    "る":"ru",
    "れ":"re",
    "ろ":"ro",

    "わ":"wa",
    "を":"wo",
    "ん":"n",

    "が":"ga",
    "ぎ":"gi",
    "ぐ":"gu",
    "げ":"ge",
    "ご":"go",

    "ざ":"za",
    "じ":"ji",
    "ず":"zu",
    "ぜ":"ze",
    "ぞ":"zo",

    "だ":"da",
    "ぢ":"ji",
    "づ":"zu",
    "で":"de",
    "ど":"do",

    "ば":"ba",
    "び":"bi",
    "ぶ":"bu",
    "べ":"be",
    "ぼ":"bo",

    "ぱ":"pa",
    "ぴ":"pi",
    "ぷ":"pu",
    "ぺ":"pe",
    "ぽ":"po",

    "きゃ":"kya",
    "きゅ":"kyu",
    "きょ":"kyo",

    "しゃ":"sha",
    "しゅ":"shu",
    "しょ":"sho",

    "ちゃ":"cha",
    "ちゅ":"chu",
    "ちょ":"cho",

    "にゃ":"nya",
    "にゅ":"nyu",
    "にょ":"nyo",

    "ひゃ":"hya",
    "ひゅ":"hyu",
    "ひょ":"hyo",

    "みゃ":"mya",
    "みゅ":"myu",
    "みょ":"myo",

    "りゃ":"rya",
    "りゅ":"ryu",
    "りょ":"ryo",

    "ぎゃ":"gya",
    "ぎゅ":"gyu",
    "ぎょ":"gyo",

    "じゃ":"ja",
    "じゅ":"ju",
    "じょ":"jo",

    "びゃ":"bya",
    "びゅ":"byu",
    "びょ":"byo",

    "ぴゃ":"pya",
    "ぴゅ":"pyu",
    "ぴょ":"pyo"

};


/* =========================
   かな → ローマ字
========================= */

function convertKanaToRomaji(text){

    let result = "";

    const normalized =
        text
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[\u30a1-\u30f6]/g, function(char){

            return String.fromCharCode(
                char.charCodeAt(0) - 0x60
            );

        });


    let i = 0;


    while(i < normalized.length){

        /* 2文字の拗音 */

        const pair =
            normalized.substring(i, i + 2);

        if(OSHI_ROMAJI_MAP[pair]){

            result += OSHI_ROMAJI_MAP[pair];

            i += 2;

            continue;

        }


        /* 小さい「っ」 */

        if(normalized[i] === "っ"){

            const next =
                normalized.substring(i + 1, i + 3);

            const nextRomaji =
                OSHI_ROMAJI_MAP[next] ||
                OSHI_ROMAJI_MAP[normalized[i + 1]];

            if(nextRomaji){

                result += nextRomaji.charAt(0);

            }

            i++;

            continue;

        }


        /* 通常の1文字 */

        if(OSHI_ROMAJI_MAP[normalized[i]]){

            result +=
                OSHI_ROMAJI_MAP[normalized[i]];

        }else{

            /*
                英数字・記号などは
                そのまま残す
            */

            result += normalized[i];

        }


        i++;

    }


    return result
        .replace(/\s+/g, " ")
        .trim();

}


/* =========================
   ローマ字候補を表示
========================= */

function updateOshiReadingSuggestion(){

    const nameInput =
        document.getElementById(
            "oshiRegisterName"
        );

    const readingInput =
        document.getElementById(
            "oshiRegisterReading"
        );

    const suggestionArea =
        document.getElementById(
            "oshiReadingSuggestion"
        );

    const suggestionButton =
        document.getElementById(
            "oshiReadingSuggestionButton"
        );


if(
    !nameInput ||
    !readingInput ||
    !suggestionArea ||
    !suggestionButton
){

    alert(
        "候補欄のどれかが見つかりません\n" +
        "名前:" + !!nameInput + "\n" +
        "ローマ字:" + !!readingInput + "\n" +
        "候補エリア:" + !!suggestionArea + "\n" +
        "候補ボタン:" + !!suggestionButton
    );

    return;

}

    const name =
        nameInput.value.trim();


    if(!name){

        suggestionArea.style.display =
            "none";

        return;

    }


    const suggestion =
        convertKanaToRomaji(name);


    /*
        変換できる文字がない場合は
        候補を表示しない。
    */

    if(
        !suggestion ||
        suggestion === name.toLowerCase()
    ){

        suggestionArea.style.display =
            "none";

        return;

    }


    suggestionButton.textContent =
        suggestion;


suggestionArea.style.display = "block";
alert("候補表示処理が実行されました");

    suggestionButton.onclick =
        function(){

            readingInput.value =
                suggestion;

            readingInput.focus();

        };

        console.log(
    "★候補表示:",
    suggestion,
    suggestionArea.style.display
);

}


/* =========================
   ローマ字欄を小文字化
========================= */

function normalizeOshiReading(){

    const input =
        document.getElementById(
            "oshiRegisterReading"
        );


    if(!input){
        return;
    }


    input.value =
        input.value
        .normalize("NFKC")
        .toLowerCase();

}


/* =========================
   ローマ字入力補助を初期化
========================= */

/* =========================
   ローマ字入力補助を初期化
========================= */

function initOshiReadingHelper(){

    console.log(
        "★★★ ローマ字補助を接続します ★★★"
    );


    const nameInput =
        document.getElementById(
            "oshiRegisterName"
        );

    const readingInput =
        document.getElementById(
            "oshiRegisterReading"
        );


    console.log(
        "★★★ 接続対象 名前:",
        nameInput
    );

    console.log(
        "★★★ 接続対象 ローマ字:",
        readingInput
    );


    if(!nameInput || !readingInput){

        console.error(
            "★★★ 入力欄が見つかりません"
        );

        return;

    }


    nameInput.addEventListener(
        "input",
        function(){

            console.log(
                "★★★ 名前入力検知:",
                nameInput.value
            );

            updateOshiReadingSuggestion();

        }
    );


    readingInput.addEventListener(
        "input",
        function(){

            console.log(
                "★★★ ローマ字入力検知:",
                readingInput.value
            );

            normalizeOshiReading();

        }
    );


    console.log(
        "★★★ イベント接続完了 ★★★"
    );

}