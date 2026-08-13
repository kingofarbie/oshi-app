/* =========================================================
   ⭐ お気に入りページ
   =========================================================

   【基本ルール】

   ① 1日手帳からお気に入り登録
      → 元の1日手帳との紐付きを保持

   ② お気に入りページから直接追加
      → 1日手帳には追加しない

   ③ 自由並べ替え
      → 1日手帳由来・直接追加を混在させる
      → 画面上のドラッグ後の順番をそのまま保存

   ④ 削除
      → 1日手帳由来なら元データも削除
      → 直接追加ならお気に入りだけ削除

   ⑤ イベントと写真の自由順は別管理

========================================================= */


/* =========================================================
   ⭐ 状態
========================================================= */

let favoriteDeleteModeActive = false;

let favoriteShareModeActive = false;

let favoriteSortModeActive = false;

let favoriteFreeSortModeActive = false;

let selectedFavoriteIds = [];

let selectedFavoritePhotoIds = [];

let favoriteDraggingElement = null;

let favoriteDraggingType = null;

let favoritePointerId = null;

let favoriteDragStarted = false;

let favoriteDragMoved = false;

let favoriteDragStartX = 0;

let favoriteDragStartY = 0;

let favoriteLongPressTimer = null;

let favoriteSuppressClick = false;


/* =========================================================
   ⭐ 初期化
========================================================= */

function initFavorites(){

    const data = db.load();

    let changed = false;


    /* =====================
       お気に入り直接追加イベント
    ===================== */

    if(!Array.isArray(data.favoriteEvents)){

        data.favoriteEvents = [];

        changed = true;

    }


    /* =====================
       お気に入り直接追加写真
    ===================== */

    if(!Array.isArray(data.favoritePhotos)){

        data.favoritePhotos = [];

        changed = true;

    }


    /* =====================================================
       古いデータとの互換

       favoriteOrder が無い場合、
       現在の配列順を初期順として採用
    ===================================================== */

    let eventOrder =
        getExistingFavoriteOrderValues(
            data
        );


    let nextEventOrder =
        eventOrder.length
        ? Math.max(...eventOrder) + 1
        : 1;


    data.favoriteEvents.forEach(event=>{

        if(event.favoriteOrder == null){

            event.favoriteOrder =
                nextEventOrder++;

            changed = true;

        }

    });


    let photoOrder =
        getExistingFavoritePhotoOrderValues(
            data
        );


    let nextPhotoOrder =
        photoOrder.length
        ? Math.max(...photoOrder) + 1
        : 1;


    data.favoritePhotos.forEach(photo=>{

        if(photo.favoriteOrder == null){

            photo.favoriteOrder =
                nextPhotoOrder++;

            changed = true;

        }

    });


    /*
       1日手帳側のお気に入りにも
       favoriteOrder が無い場合は
       現在取得できる順番を初期値として付与
    */

    const plannerEvents =
        getPlannerFavoriteEventsRaw(
            data
        );


    plannerEvents.forEach(item=>{

        if(item.event.favoriteOrder == null){

            item.event.favoriteOrder =
                nextEventOrder++;

            changed = true;

        }

    });


    const plannerPhotos =
        getPlannerFavoritePhotosRaw(
            data
        );


    plannerPhotos.forEach(item=>{

        if(item.photo.favoriteOrder == null){

            item.photo.favoriteOrder =
                nextPhotoOrder++;

            changed = true;

        }

    });


    if(changed){

        db.save(data);

    }


    renderFavoritesPage();

}


/* =========================================================
   ⭐ 既存イベントfavoriteOrder取得
========================================================= */

function getExistingFavoriteOrderValues(data){

    const values = [];


    (data.favoriteEvents || [])
    .forEach(event=>{

        const order =
            Number(event.favoriteOrder);

        if(Number.isFinite(order)){

            values.push(order);

        }

    });


    Object.values(
        data.dayMemories || {}
    )
    .forEach(day=>{

        (day.events || [])
        .forEach(event=>{

            if(!event.favorite){

                return;

            }


            const order =
                Number(event.favoriteOrder);

            if(Number.isFinite(order)){

                values.push(order);

            }

        });

    });


    (data.events || [])
    .forEach(event=>{

        if(!event.favorite){

            return;

        }


        const order =
            Number(event.favoriteOrder);

        if(Number.isFinite(order)){

            values.push(order);

        }

    });


    return values;

}


/* =========================================================
   ⭐ 既存写真favoriteOrder取得
========================================================= */

function getExistingFavoritePhotoOrderValues(data){

    const values = [];


    (data.favoritePhotos || [])
    .forEach(photo=>{

        const order =
            Number(photo.favoriteOrder);

        if(Number.isFinite(order)){

            values.push(order);

        }

    });


    Object.values(
        data.dayMemories || {}
    )
    .forEach(day=>{

        (day.photos || [])
        .forEach(photo=>{

            if(!photo.favorite){

                return;

            }


            const order =
                Number(photo.favoriteOrder);

            if(Number.isFinite(order)){

                values.push(order);

            }

        });

    });


    return values;

}


/* =========================================================
   ⭐ お気に入りページ表示
========================================================= */

function renderFavoritesPage(){

    renderFavoriteEvents();

    renderFavoritePhotos();

    ensureFavoritePhotoAddButton();

}


/* =========================================================
   ⭐ 写真追加ボタンを自動生成
=========================================================

   HTMLにまだ「＋写真追加」が無くても、
   お気に入りページの写真ヘッダーへ自動追加する。
========================================================= */

function ensureFavoritePhotoAddButton(){

    const section =
        document.querySelector(
            ".favorites-photo-list"
        )
        ?.closest(
            ".favorites-section"
        );


    if(!section){

        return;

    }


    const header =
        section.querySelector(
            ".favorites-section-header"
        );


    if(!header){

        return;

    }


    if(
        header.querySelector(
            ".favorites-photo-add-btn"
        )
    ){

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";

    button.className =
        "favorites-add-btn favorites-photo-add-btn";

    button.textContent =
        "＋写真追加";

    button.onclick =
        openFavoritePhotoPicker;


    header.appendChild(
        button
    );

}


/* =========================================================
   ⭐ 1日手帳由来イベント取得
========================================================= */

function getPlannerFavoriteEventsRaw(data){

    const result = [];

    const already =
        new Set();


    /*
       dayMemories側
    */

    Object.entries(
        data.dayMemories || {}
    )
    .forEach(([date,day])=>{

        (day.events || [])
        .forEach(event=>{

            if(!event.favorite){

                return;

            }


            const key =
                String(event.id);


            if(already.has(key)){

                return;

            }


            already.add(key);


            result.push({

                event: event,

                date: date

            });

        });

    });


    /*
       data.events側
    */

    (data.events || [])
    .forEach(event=>{

        if(!event.favorite){

            return;

        }


        const key =
            String(event.id);


        if(already.has(key)){

            return;

        }


        already.add(key);


        let sourceDates =
            Array.isArray(
                event.sourceDates
            )
            ?
            event.sourceDates
            :
            [];


        if(
            sourceDates.length === 0 &&
            event.start
        ){

            sourceDates = [
                String(
                    event.start
                ).substring(
                    0,
                    10
                )
            ];

        }


        result.push({

            event: event,

            date:
                sourceDates[0] || ""

        });

    });


    return result;

}


/* =========================================================
   ⭐ お気に入りイベント取得
========================================================= */

function getFavoriteEvents(){

    const data =
        db.load();

    const result = [];


    /* =====================================================
       ① お気に入りページから直接追加
    ===================================================== */

    (data.favoriteEvents || [])
    .forEach(event=>{

        result.push({

            ...event,

            favoriteSource:
                "favorite",

            favoriteKey:
                createFavoriteKey(
                    "favorite",
                    event.id
                )

        });

    });


    /* =====================================================
       ② 1日手帳由来
    ===================================================== */

    const planner =
        getPlannerFavoriteEventsRaw(
            data
        );


    planner.forEach(item=>{

        const event =
            item.event;


        let sourceDates =
            Array.isArray(
                event.sourceDates
            )
            ?
            event.sourceDates
            :
            [];


        if(
            sourceDates.length === 0 &&
            event.start
        ){

            sourceDates = [
                String(
                    event.start
                ).substring(
                    0,
                    10
                )
            ];

        }


        result.push({

            ...event,

            favoriteSource:
                "planner",

            sourceDate:
                item.date,

            sourceDates:
                sourceDates,

            favoriteKey:
                createFavoriteKey(
                    "planner",
                    event.id
                )

        });

    });


    /* =====================================================
       並べ替え
    ===================================================== */

    const sortMode =
        localStorage.getItem(
            "favoriteEventSort"
        )
        ||
        "new";


    if(sortMode === "free"){

        /*
           ⭐ 最重要

           favoriteOrder の値だけを使う。

           IDや日時では並べ替えない。
           画面上で保存した順番を守る。
        */

        result.sort(
            (a,b)=>{

                const orderA =
                    Number(
                        a.favoriteOrder
                    );

                const orderB =
                    Number(
                        b.favoriteOrder
                    );


                const validA =
                    Number.isFinite(
                        orderA
                    );

                const validB =
                    Number.isFinite(
                        orderB
                    );


                if(validA && validB){

                    return orderA - orderB;

                }


                if(validA){

                    return -1;

                }


                if(validB){

                    return 1;

                }


                return 0;

            }
        );

    }else if(sortMode === "old"){

        result.sort(
            (a,b)=>{

                const aTime =
                    getFavoriteEventTime(
                        a,
                        false
                    );

                const bTime =
                    getFavoriteEventTime(
                        b,
                        false
                    );


                return aTime - bTime;

            }
        );

    }else{

        result.sort(
            (a,b)=>{

                const aTime =
                    getFavoriteEventTime(
                        a,
                        true
                    );

                const bTime =
                    getFavoriteEventTime(
                        b,
                        true
                    );


                return bTime - aTime;

            }
        );

    }


    return result;

}


/* =========================================================
   ⭐ イベント日時
========================================================= */

function getFavoriteEventTime(
    event,
    fallbackNow
){

    if(event.start){

        const time =
            new Date(
                event.start
            ).getTime();


        if(Number.isFinite(time)){

            return time;

        }

    }


    if(fallbackNow){

        return 0;

    }


    const id =
        Number(event.id);


    return Number.isFinite(id)
        ? id
        : 0;

}


/* =========================================================
   ⭐ 共通キー
========================================================= */

function createFavoriteKey(
    source,
    id
){

    return (
        String(source)
        +
        ":"
        +
        String(id)
    );

}


/* =========================================================
   ⭐ イベント表示
========================================================= */

function renderFavoriteEvents(){

    const box =
        document.getElementById(
            "favorite-event-list"
        );


    if(!box){

        return;

    }


    const events =
        getFavoriteEvents();


    let html = "";


    /* =====================================================
       削除モード
    ===================================================== */

    if(favoriteDeleteModeActive){

        html += `

        <div class="favorites-action-bar">

            <strong>
                🗑 イベントを選択中
            </strong>

            <span>
                ${selectedFavoriteIds.length}件選択
            </span>

            <button
                type="button"
                onclick="cancelFavoriteDeleteMode()">
                キャンセル
            </button>

            <button
                type="button"
                onclick="deleteSelectedFavoriteEvents()"
                ${
                    selectedFavoriteIds.length === 0
                    ? "disabled"
                    : ""
                }>
                🗑 削除
            </button>

        </div>

        `;

    }


    /* =====================================================
       共有モード
    ===================================================== */

    if(favoriteShareModeActive){

        html += `

        <div class="favorites-action-bar">

            <strong>
                📤 イベントを選択中
            </strong>

            <span>
                ${selectedFavoriteIds.length}件選択
            </span>

            <button
                type="button"
                onclick="cancelFavoriteShareMode()">
                キャンセル
            </button>

            <button
                type="button"
                onclick="shareSelectedFavoriteEvents()"
                ${
                    selectedFavoriteIds.length === 0
                    ? "disabled"
                    : ""
                }>
                📤 共有
            </button>

        </div>

        `;

    }


    /* =====================================================
       自由並べ替え
    ===================================================== */

    if(favoriteFreeSortModeActive){

        html += `

        <div class="favorites-action-bar">

            <strong>
                ✋ 自由変更中
            </strong>

            <small>
                ドラッグして好きな順番に並べ替えてください
            </small>

            <button
                type="button"
                onclick="finishFavoriteEventSort()">
                完了
            </button>

        </div>

        `;

    }


    /* =====================================================
       空
    ===================================================== */

    if(events.length === 0){

        html += `

        <div class="favorites-empty">
            イベントはありません
        </div>

        `;

        box.innerHTML =
            html;

        return;

    }


    html += `

    <div class="favorites-event-items">

    `;


    events.forEach(event=>{

        const selected =
            selectedFavoriteIds.includes(
                String(
                    event.favoriteKey
                )
            );


        const sourceLabel =
            event.favoriteSource === "planner"
            ?
            "📖 1日手帳"
            :
            "⭐ お気に入り追加";


        const key =
            String(
                event.favoriteKey
            );


        html += `

        <div
            class="
                favorites-event-item
                ${
                    selected
                    ?
                    "favorite-selected"
                    :
                    ""
                }
            "
            data-favorite-id="${escapeFavoriteText(event.id)}"
            data-favorite-key="${escapeFavoriteText(key)}"
            data-favorite-source="${escapeFavoriteText(event.favoriteSource)}"
        >

            ${
                favoriteDeleteModeActive ||
                favoriteShareModeActive
                ?
                `

                <div
                    class="favorite-select-check"
                    onclick="
                        toggleFavoriteEventSelection(
                            '${escapeFavoriteText(key)}'
                        )
                    "
                >

                    ${selected ? "✓" : ""}

                </div>

                `
                :
                ""
            }


            <div
                class="favorites-event-main"
                onclick="
                    ${
                        favoriteDeleteModeActive ||
                        favoriteShareModeActive ||
                        favoriteFreeSortModeActive
                        ?
                        ""
                        :
                        `openFavoriteEventDetail('${escapeFavoriteText(event.id)}')`
                    }
                "
            >

                <div class="favorites-event-title">

                    ${
                        getCategoryInfo(event.category)?.icon
                        ||
                        "📌"
                    }

                    <strong>
                        ${escapeFavoriteText(
                            event.title || ""
                        )}
                    </strong>

                </div>


                ${
                    event.start
                    ?
                    `

                    <div class="favorites-event-date">

                        📅
                        ${formatFavoriteDateTime(
                            event.start
                        )}

                        ${
                            event.end
                            ?
                            `
                            ～ ${formatFavoriteTime(
                                event.end
                            )}
                            `
                            :
                            ""
                        }

                    </div>

                    `
                    :
                    ""
                }


                ${
                    event.place
                    ?
                    `

                    <div class="favorites-event-place">

                        📍
                        ${escapeFavoriteText(
                            event.place
                        )}

                    </div>

                    `
                    :
                    ""
                }


                <div class="favorites-event-source">

                    ${sourceLabel}

                </div>

            </div>

        </div>

        `;

    });


    html += `

    </div>

    `;


    box.innerHTML =
        html;


    setupFavoriteDragStyles();

}


/* =========================================================
   📷 1日手帳由来写真取得
========================================================= */

function getPlannerFavoritePhotosRaw(data){

    const result = [];

    const already =
        new Set();


    Object.entries(
        data.dayMemories || {}
    )
    .forEach(([date,day])=>{

        (day.photos || [])
        .forEach(photo=>{

            if(!photo.favorite){

                return;

            }


            const key =
                String(photo.id);


            if(already.has(key)){

                return;

            }


            already.add(key);


            result.push({

                photo: photo,

                date: date

            });

        });

    });


    return result;

}


/* =========================================================
   📷 お気に入り写真取得
========================================================= */

function getFavoritePhotos(){

    const data =
        db.load();

    const result = [];


    /* =====================================================
       ① 1日手帳由来
    ===================================================== */

    const planner =
        getPlannerFavoritePhotosRaw(
            data
        );


    planner.forEach(item=>{

        const photo =
            item.photo;


        result.push({

            ...photo,

            favoriteSource:
                "planner",

            sourceDate:
                item.date,

            sourceDates:
                photo.sourceDates ||
                [item.date],

            favoriteKey:
                createFavoriteKey(
                    "planner",
                    photo.id
                )

        });

    });


    /* =====================================================
       ② お気に入りページから直接追加
    ===================================================== */

    (data.favoritePhotos || [])
    .forEach(photo=>{

        result.push({

            ...photo,

            favoriteSource:
                "favorite",

            favoriteKey:
                createFavoriteKey(
                    "favorite",
                    photo.id
                )

        });

    });


    /* =====================================================
       並べ替え
    ===================================================== */

    const sortMode =
        localStorage.getItem(
            "favoritePhotoSort"
        )
        ||
        "new";


    if(sortMode === "free"){

        result.sort(
            (a,b)=>{

                const orderA =
                    Number(
                        a.favoriteOrder
                    );

                const orderB =
                    Number(
                        b.favoriteOrder
                    );


                const validA =
                    Number.isFinite(
                        orderA
                    );

                const validB =
                    Number.isFinite(
                        orderB
                    );


                if(validA && validB){

                    return orderA - orderB;

                }


                if(validA){

                    return -1;

                }


                if(validB){

                    return 1;

                }


                return 0;

            }
        );

    }else if(sortMode === "old"){

        result.sort(
            (a,b)=>
                getFavoritePhotoTime(a)
                -
                getFavoritePhotoTime(b)
        );

    }else{

        result.sort(
            (a,b)=>
                getFavoritePhotoTime(b)
                -
                getFavoritePhotoTime(a)
        );

    }


    return result;

}


/* =========================================================
   📷 写真日時
========================================================= */

function getFavoritePhotoTime(photo){

    const id =
        Number(photo.id);


    return Number.isFinite(id)
        ? id
        : 0;

}


/* =========================================================
   📷 写真表示
========================================================= */

function renderFavoritePhotos(){

    const box =
        document.getElementById(
            "favorite-photo-list"
        );


    if(!box){

        return;

    }


    const photos =
        getFavoritePhotos();


    let html = "";


    /* =====================================================
       削除モード
    ===================================================== */

    if(favoriteDeleteModeActive){

        html += `

        <div class="favorites-action-bar">

            <strong>
                🗑 写真を選択中
            </strong>

            <span>
                ${selectedFavoritePhotoIds.length}枚選択
            </span>

            <button
                type="button"
                onclick="cancelFavoriteDeleteMode()">
                キャンセル
            </button>

            <button
                type="button"
                onclick="deleteSelectedFavoritePhotos()"
                ${
                    selectedFavoritePhotoIds.length === 0
                    ? "disabled"
                    : ""
                }>
                🗑 削除
            </button>

        </div>

        `;

    }


    /* =====================================================
       共有モード
    ===================================================== */

    if(favoriteShareModeActive){

        html += `

        <div class="favorites-action-bar">

            <strong>
                📤 写真を選択中
            </strong>

            <span>
                ${selectedFavoritePhotoIds.length}枚選択
            </span>

            <button
                type="button"
                onclick="cancelFavoriteShareMode()">
                キャンセル
            </button>

            <button
                type="button"
                onclick="shareSelectedFavoritePhotos()"
                ${
                    selectedFavoritePhotoIds.length === 0
                    ? "disabled"
                    : ""
                }>
                📤 共有
            </button>

        </div>

        `;

    }


    /* =====================================================
       自由並べ替え
    ===================================================== */

    if(favoriteFreeSortModeActive){

        html += `

        <div class="favorites-action-bar">

            <strong>
                ✋ 自由変更中
            </strong>

            <small>
                ドラッグして好きな順番に並べ替えてください
            </small>

            <button
                type="button"
                onclick="finishFavoritePhotoSort()">
                完了
            </button>

        </div>

        `;

    }


    /* =====================================================
       空
    ===================================================== */

    if(photos.length === 0){

        html += `

        <div class="favorites-empty">
            写真はありません
        </div>

        `;

        box.innerHTML =
            html;

        return;

    }


    html += `

    <div class="favorites-photo-grid">

    `;


    photos.forEach(photo=>{

        const selected =
            selectedFavoritePhotoIds.includes(
                String(
                    photo.favoriteKey
                )
            );


        const key =
            String(
                photo.favoriteKey
            );


        html += `

        <div
            class="
                favorites-photo-item
                ${
                    selected
                    ?
                    "favorite-selected"
                    :
                    ""
                }
            "
            data-favorite-photo-id="${escapeFavoriteText(photo.id)}"
            data-favorite-photo-key="${escapeFavoriteText(key)}"
            data-favorite-source="${escapeFavoriteText(photo.favoriteSource)}"
        >

            <img
                src="${escapeFavoriteText(photo.src)}"
                draggable="false"
                ${
                    favoriteDeleteModeActive ||
                    favoriteShareModeActive ||
                    favoriteFreeSortModeActive
                    ?
                    ""
                    :
                    `onclick="openFavoritePhotoViewerNew('${escapeFavoriteText(photo.id)}')"`
                }
            >


            ${
                favoriteDeleteModeActive ||
                favoriteShareModeActive
                ?
                `

                <div
                    class="favorite-select-check"
                    onclick="
                        toggleFavoritePhotoSelection(
                            '${escapeFavoriteText(key)}'
                        )
                    "
                >

                    ${selected ? "✓" : ""}

                </div>

                `
                :
                ""
            }

        </div>

        `;

    });


    html += `

    </div>

    `;


    box.innerHTML =
        html;


    setupFavoriteDragStyles();

}


/* =========================================================
   ➕ お気に入りイベント直接追加
========================================================= */

function openFavoriteAddEvent(){

    let modal =
        document.getElementById(
            "favoriteAddEventModal"
        );


    if(!modal){

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "favoriteAddEventModal";


        modal.className =
            "modal";


        modal.innerHTML = `

        <div class="modal-content">

            <h2>
                ⭐ お気に入りイベント追加
            </h2>


            <div class="event-form-row">

                <label>
                    種類
                </label>

                <select id="favorite-add-category">

                    <option value="イベント">
                        🎫 イベント
                    </option>

                    <option value="フェス">
                        🎵 フェス
                    </option>

                    <option value="試合">
                        ⚽ 試合
                    </option>

                </select>

            </div>


            <div class="event-form-row">

                <label>
                    イベント名
                </label>

                <input
                    id="favorite-add-title"
                    type="text"
                    placeholder="イベント名"
                >

            </div>


            <div class="event-form-row">

                <label>
                    開始日時
                </label>

                <input
                    id="favorite-add-start"
                    type="datetime-local"
                >

            </div>


            <div class="event-form-row">

                <label>
                    終了日時
                </label>

                <input
                    id="favorite-add-end"
                    type="datetime-local"
                >

            </div>


            <div class="event-form-row">

                <label>
                    場所
                </label>

                <input
                    id="favorite-add-place"
                    type="text"
                    placeholder="場所"
                >

            </div>


            <div class="event-form-row">

                <label>
                    同伴者
                </label>

                <input
                    id="favorite-add-companion"
                    type="text"
                    placeholder="同伴者"
                >

            </div>


            <div class="favorites-modal-buttons">

                <button
                    type="button"
                    onclick="saveFavoriteDirectEvent()">
                    💾 保存
                </button>

                <button
                    type="button"
                    onclick="closeFavoriteAddEvent()">
                    キャンセル
                </button>

            </div>

        </div>

        `;


        document.body.appendChild(
            modal
        );

    }


    /*
       前回入力値をクリア
    */

    const fields = [

        "favorite-add-title",
        "favorite-add-start",
        "favorite-add-end",
        "favorite-add-place",
        "favorite-add-companion"

    ];


    fields.forEach(id=>{

        const el =
            document.getElementById(id);

        if(el){

            el.value = "";

        }

    });


    modal.style.display =
        "flex";

}


/* =========================================================
   ⭐ 直接追加イベント保存
========================================================= */

function saveFavoriteDirectEvent(){

    const title =
        document.getElementById(
            "favorite-add-title"
        )?.value.trim();


    if(!title){

        alert(
            "イベント名を入力してください"
        );

        return;

    }


    const data =
        db.load();


    if(!Array.isArray(data.favoriteEvents)){

        data.favoriteEvents = [];

    }


    const order =
        getNextFavoriteEventOrder(
            data
        );


    data.favoriteEvents.push({

        id:
            Date.now()
            +
            Math.random(),


        title:
            title,


        category:
            document.getElementById(
                "favorite-add-category"
            )?.value
            ||
            "イベント",


        start:
            document.getElementById(
                "favorite-add-start"
            )?.value
            ||
            "",


        end:
            document.getElementById(
                "favorite-add-end"
            )?.value
            ||
            "",


        place:
            document.getElementById(
                "favorite-add-place"
            )?.value
            ||
            "",


        companion:
            document.getElementById(
                "favorite-add-companion"
            )?.value
            ||
            "",


        favoriteSource:
            "favorite",


        favoriteOrder:
            order

    });


    db.save(data);


    closeFavoriteAddEvent();


    /*
       自由モードなら
       新規追加を一番最後にする。
    */

    localStorage.setItem(
        "favoriteEventSort",
        "free"
    );


    renderFavoriteEvents();

}


/* =========================================================
   ⭐ 次のイベント順
========================================================= */

function getNextFavoriteEventOrder(data){

    const values =
        getExistingFavoriteOrderValues(
            data
        );


    if(!values.length){

        return 1;

    }


    return (
        Math.max(
            ...values
        )
        +
        1
    );

}


/* =========================================================
   📷 次の写真順
========================================================= */

function getNextFavoritePhotoOrder(data){

    const values =
        getExistingFavoritePhotoOrderValues(
            data
        );


    if(!values.length){

        return 1;

    }


    return (
        Math.max(
            ...values
        )
        +
        1
    );

}


/* =========================================================
   ⭐ イベント追加モーダル閉じる
========================================================= */

function closeFavoriteAddEvent(){

    const modal =
        document.getElementById(
            "favoriteAddEventModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}


/* =========================================================
   🗑 削除モード
========================================================= */

function favoriteDeleteMode(){

    favoriteDeleteModeActive =
        true;

    favoriteShareModeActive =
        false;

    favoriteFreeSortModeActive =
        false;

    selectedFavoriteIds = [];

    selectedFavoritePhotoIds = [];


    renderFavoritesPage();

}


/* =========================================================
   🗑 削除モードキャンセル
========================================================= */

function cancelFavoriteDeleteMode(){

    favoriteDeleteModeActive =
        false;

    selectedFavoriteIds = [];

    selectedFavoritePhotoIds = [];


    renderFavoritesPage();

}


/* =========================================================
   ⭐ イベント選択
========================================================= */

function toggleFavoriteEventSelection(
    key
){

    key =
        String(key);


    const index =
        selectedFavoriteIds.indexOf(
            key
        );


    if(index >= 0){

        selectedFavoriteIds.splice(
            index,
            1
        );

    }else{

        selectedFavoriteIds.push(
            key
        );

    }


    renderFavoriteEvents();

}


/* =========================================================
   📷 写真直接追加
========================================================= */

function openFavoritePhotoPicker(){

    let input =
        document.getElementById(
            "favoritePhotoPicker"
        );


    if(!input){

        input =
            document.createElement(
                "input"
            );


        input.type =
            "file";


        input.accept =
            "image/*";


        input.multiple =
            true;


        input.id =
            "favoritePhotoPicker";


        input.style.display =
            "none";


        input.addEventListener(
            "change",
            favoritePhotosSelected
        );


        document.body.appendChild(
            input
        );

    }


    input.click();

}


/* =========================================================
   📷 写真選択
========================================================= */

function favoritePhotosSelected(event){

    const files =
        Array.from(
            event.target.files || []
        );


    if(!files.length){

        return;

    }


    const data =
        db.load();


    if(!Array.isArray(data.favoritePhotos)){

        data.favoritePhotos = [];

    }


    let completed =
        0;


    let nextOrder =
        getNextFavoritePhotoOrder(
            data
        );


    files.forEach(file=>{

        if(
            !file.type.startsWith(
                "image/"
            )
        ){

            completed++;

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(e){

                const img =
                    new Image();


                img.onload =
                    function(){

                        const MAX =
                            1000;


                        let width =
                            img.width;


                        let height =
                            img.height;


                        if(
                            width > MAX ||
                            height > MAX
                        ){

                            const ratio =
                                Math.min(
                                    MAX / width,
                                    MAX / height
                                );


                            width *=
                                ratio;


                            height *=
                                ratio;

                        }


                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        canvas.width =
                            Math.round(
                                width
                            );


                        canvas.height =
                            Math.round(
                                height
                            );


                        const ctx =
                            canvas.getContext(
                                "2d"
                            );


                        ctx.drawImage(
                            img,
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );


                        const smallImage =
                            canvas.toDataURL(
                                "image/jpeg",
                                0.8
                            );


                        data.favoritePhotos.push({

                            id:
                                Date.now()
                                +
                                Math.random(),


                            src:
                                smallImage,


                            favoriteSource:
                                "favorite",


                            favoriteOrder:
                                nextOrder++

                        });


                        completed++;


                        if(
                            completed >=
                            files.length
                        ){

                            db.save(
                                data
                            );


                            localStorage.setItem(
                                "favoritePhotoSort",
                                "free"
                            );


                            renderFavoritePhotos();

                        }

                    };


                img.src =
                    e.target.result;

            };


        reader.readAsDataURL(
            file
        );

    });


    event.target.value = "";

}


/* =========================================================
   📷 写真選択
========================================================= */

function toggleFavoritePhotoSelection(
    key
){

    key =
        String(key);


    const index =
        selectedFavoritePhotoIds.indexOf(
            key
        );


    if(index >= 0){

        selectedFavoritePhotoIds.splice(
            index,
            1
        );

    }else{

        selectedFavoritePhotoIds.push(
            key
        );

    }


    renderFavoritePhotos();

}


/* =========================================================
   🔀 並べ替えモード
========================================================= */

function favoriteSortMode(){

    favoriteDeleteModeActive =
        false;

    favoriteShareModeActive =
        false;

    favoriteFreeSortModeActive =
        false;

    selectedFavoriteIds = [];

    selectedFavoritePhotoIds = [];


    const modal =
        document.getElementById(
            "favoriteSortModal"
        );


    if(modal){

        modal.style.display =
            "flex";

    }

}


/* =========================================================
   🔀 並べ替え設定
========================================================= */

function setFavoriteSort(mode){

    /*
       イベントと写真を同じ設定で
       切り替える仕様を維持。
    */

    localStorage.setItem(
        "favoriteEventSort",
        mode
    );


    localStorage.setItem(
        "favoritePhotoSort",
        mode
    );


    favoriteSortModeActive =
        false;


    const modal =
        document.getElementById(
            "favoriteSortModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }


    favoriteFreeSortModeActive =
        mode === "free";


    renderFavoritesPage();

}


/* =========================================================
   🔀 並べ替えモーダル閉じる
========================================================= */

function closeFavoriteSortModal(){

    const modal =
        document.getElementById(
            "favoriteSortModal"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}


/* =========================================================
   ✋ ドラッグ用CSS
========================================================= */

function setupFavoriteDragStyles(){

    const containers = [

        document.getElementById(
            "favorite-event-list"
        ),

        document.getElementById(
            "favorite-photo-list"
        )

    ];


    containers.forEach(container=>{

        if(!container){

            return;

        }


        container.style.touchAction =
            favoriteFreeSortModeActive
            ?
            "none"
            :
            "";

    });

}


/* =========================================================
   ✋ 自由並べ替え
========================================================= */

function setupFavoriteDragDrop(){

    if(
        document.body.dataset.favoriteDragReady ===
        "true"
    ){

        setupFavoriteDragStyles();

        return;

    }


    document.body.dataset.favoriteDragReady =
        "true";


    /*
       =====================================================
       pointerdown
       =====================================================
    */

    document.addEventListener(
        "pointerdown",
        function(event){

            if(
                !favoriteFreeSortModeActive
            ){

                return;

            }


            /*
               ボタンなどからのドラッグは無視
            */

            if(
                event.target.closest(
                    "button,input,select,textarea"
                )
            ){

                return;

            }


            const item =
                event.target.closest(
                    ".favorites-event-item, .favorites-photo-item"
                );


            if(!item){

                return;

            }


            favoriteDraggingElement =
                item;


            favoriteDraggingType =
                item.classList.contains(
                    "favorites-event-item"
                )
                ?
                "event"
                :
                "photo";


            favoritePointerId =
                event.pointerId;


            favoriteDragStarted =
                false;


            favoriteDragMoved =
                false;


            favoriteDragStartX =
                event.clientX;


            favoriteDragStartY =
                event.clientY;


            favoriteSuppressClick =
                false;


            /*
               pointer capture
            */

            try{

                item.setPointerCapture(
                    event.pointerId
                );

            }catch(error){}


            /*
               スマホでは少し長押しして
               ドラッグ開始
            */

            clearTimeout(
                favoriteLongPressTimer
            );


            favoriteLongPressTimer =
                setTimeout(
                    ()=>{

                        if(
                            favoriteDraggingElement &&
                            !favoriteDragMoved
                        ){

                            startFavoriteDrag();

                        }

                    },
                    180
                );

        },
        {
            passive: true
        }
    );


    /*
       =====================================================
       pointermove
       =====================================================
    */

    document.addEventListener(
        "pointermove",
        function(event){

            if(
                !favoriteDraggingElement
            ){

                return;

            }


            if(
                event.pointerId !==
                favoritePointerId
            ){

                return;

            }


            const dx =
                event.clientX -
                favoriteDragStartX;


            const dy =
                event.clientY -
                favoriteDragStartY;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            /*
               長押し前に少し動いたら
               ドラッグ開始
            */

            if(
                distance > 8
            ){

                favoriteDragMoved =
                    true;


                clearTimeout(
                    favoriteLongPressTimer
                );


                if(
                    !favoriteDragStarted
                ){

                    startFavoriteDrag();

                }

            }


            if(
                !favoriteDragStarted
            ){

                return;

            }


            event.preventDefault();


            moveFavoriteDrag(
                event.clientX,
                event.clientY
            );

        },
        {
            passive: false
        }
    );


    /*
       =====================================================
       pointerup
       =====================================================
    */

    document.addEventListener(
        "pointerup",
        function(event){

            if(
                event.pointerId !==
                favoritePointerId
            ){

                return;

            }


            clearTimeout(
                favoriteLongPressTimer
            );


            if(
                favoriteDraggingElement
            ){

                if(
                    favoriteDragStarted
                ){

                    favoriteSuppressClick =
                        true;

                    favoriteDraggingElement.classList.remove(
                        "favorite-dragging"
                    );

                }

            }


            favoriteDraggingElement =
                null;

            favoriteDraggingType =
                null;

            favoritePointerId =
                null;

            favoriteDragStarted =
                false;

            favoriteDragMoved =
                false;


            /*
               クリック抑制を少しだけ保持
            */

            setTimeout(
                ()=>{
                    favoriteSuppressClick =
                        false;
                },
                250
            );

        },
        {
            passive: true
        }
    );


    /*
       =====================================================
       pointercancel
       =====================================================
    */

    document.addEventListener(
        "pointercancel",
        function(){

            clearTimeout(
                favoriteLongPressTimer
            );


            if(
                favoriteDraggingElement
            ){

                favoriteDraggingElement.classList.remove(
                    "favorite-dragging"
                );

            }


            favoriteDraggingElement =
                null;

            favoriteDraggingType =
                null;

            favoritePointerId =
                null;

            favoriteDragStarted =
                false;

            favoriteDragMoved =
                false;

        }
    );


    setupFavoriteDragStyles();

}


/* =========================================================
   ✋ ドラッグ開始
========================================================= */

function startFavoriteDrag(){

    if(
        !favoriteDraggingElement
    ){

        return;

    }


    favoriteDragStarted =
        true;


    favoriteSuppressClick =
        true;


    favoriteDraggingElement.classList.add(
        "favorite-dragging"
    );

}


/* =========================================================
   ✋ ドラッグ移動
========================================================= */

function moveFavoriteDrag(
    x,
    y
){

    if(
        !favoriteDraggingElement
    ){

        return;

    }


    const selector =
        favoriteDraggingType === "event"
        ?
        ".favorites-event-item"
        :
        ".favorites-photo-item";


    const items =
        Array.from(
            document.querySelectorAll(
                selector
            )
        );


    let target =
        null;


    let bestDistance =
        Infinity;


    items.forEach(item=>{

        if(
            item ===
            favoriteDraggingElement
        ){

            return;

        }


        const rect =
            item.getBoundingClientRect();


        const centerX =
            rect.left +
            rect.width / 2;


        const centerY =
            rect.top +
            rect.height / 2;


        const distance =
            Math.sqrt(
                Math.pow(
                    x - centerX,
                    2
                )
                +
                Math.pow(
                    y - centerY,
                    2
                )
            );


        /*
           一定範囲内で
           一番近いアイテムを対象にする
        */

        const maxDistance =
            Math.max(
                rect.width,
                rect.height
            ) * 1.5;


        if(
            distance <= maxDistance &&
            distance < bestDistance
        ){

            bestDistance =
                distance;


            target =
                item;

        }

    });


    if(!target){

        return;

    }


    const rect =
        target.getBoundingClientRect();


    /*
       アイテムの中心より上/左なら前へ。
       下/右なら後ろへ。
    */

    const horizontal =
        favoriteDraggingType === "photo";


    const before =
        horizontal
        ?
        x <
        rect.left +
        rect.width / 2
        :
        y <
        rect.top +
        rect.height / 2;


    const parent =
        favoriteDraggingElement.parentNode;


    if(!parent){

        return;

    }


    if(before){

        parent.insertBefore(
            favoriteDraggingElement,
            target
        );

    }else{

        parent.insertBefore(
            favoriteDraggingElement,
            target.nextSibling
        );

    }

}


/* =========================================================
   ✋ 自由並べ替え完了
========================================================= */

function finishFavoriteEventSort(){

    const boxes =
        Array.from(
            document.querySelectorAll(
                ".favorites-event-item"
            )
        );


    if(!boxes.length){

        favoriteFreeSortModeActive =
            false;

        return;

    }


    const data =
        db.load();


    /*
       =====================================================
       ここが最重要

       DOMに現在並んでいる順番を
       上から順番に保存する。

       source + id で対象を特定するため、

       📖 1日手帳
       ⭐ 直接追加

       が混ざっていても問題ない。
    =====================================================
    */

    boxes.forEach(
        (box,index)=>{

            const id =
                String(
                    box.dataset.favoriteId
                );


            const source =
                String(
                    box.dataset.favoriteSource
                );


            const order =
                index + 1;


            /*
               直接追加
            */

            if(
                source ===
                "favorite"
            ){

                const event =
                    (data.favoriteEvents || [])
                    .find(
                        e =>
                            String(e.id)
                            ===
                            id
                    );


                if(event){

                    event.favoriteOrder =
                        order;

                }


                return;

            }


            /*
               1日手帳由来
            */

            const plannerEvent =
                (data.events || [])
                .find(
                    e =>
                        String(e.id)
                        ===
                        id
                );


            if(plannerEvent){

                plannerEvent.favoriteOrder =
                    order;

            }


            /*
               dayMemories側も更新
            */

            Object.values(
                data.dayMemories || {}
            )
            .forEach(day=>{

                (day.events || [])
                .forEach(event=>{

                    if(
                        String(event.id)
                        ===
                        id
                    ){

                        event.favoriteOrder =
                            order;

                    }

                });

            });

        }
    );


    db.save(
        data
    );


    /*
       自由モードを終了
    */

    favoriteFreeSortModeActive =
        false;


    localStorage.setItem(
        "favoriteEventSort",
        "free"
    );


    renderFavoriteEvents();

}


/* =========================================================
   📷 写真自由並べ替え完了
========================================================= */

function finishFavoritePhotoSort(){

    const boxes =
        Array.from(
            document.querySelectorAll(
                ".favorites-photo-item"
            )
        );


    if(!boxes.length){

        favoriteFreeSortModeActive =
            false;

        return;

    }


    const data =
        db.load();


    /*
       DOM順をそのまま保存
    */

    boxes.forEach(
        (box,index)=>{

            const id =
                String(
                    box.dataset.favoritePhotoId
                );


            const source =
                String(
                    box.dataset.favoriteSource
                );


            const order =
                index + 1;


            /*
               直接追加写真
            */

            if(
                source ===
                "favorite"
            ){

                const photo =
                    (data.favoritePhotos || [])
                    .find(
                        p =>
                            String(p.id)
                            ===
                            id
                    );


                if(photo){

                    photo.favoriteOrder =
                        order;

                }


                return;

            }


            /*
               1日手帳写真
            */

            Object.values(
                data.dayMemories || {}
            )
            .forEach(day=>{

                (day.photos || [])
                .forEach(photo=>{

                    if(
                        String(photo.id)
                        ===
                        id
                    ){

                        photo.favoriteOrder =
                            order;

                    }

                });

            });

        }
    );


    db.save(
        data
    );


    favoriteFreeSortModeActive =
        false;


    localStorage.setItem(
        "favoritePhotoSort",
        "free"
    );


    renderFavoritePhotos();

}


/* =========================================================
   🗑 選択したイベント削除
========================================================= */

function deleteSelectedFavoriteEvents(){

    if(
        selectedFavoriteIds.length === 0
    ){

        return;

    }


    const events =
        getFavoriteEvents()
        .filter(
            event =>
                selectedFavoriteIds.includes(
                    String(
                        event.favoriteKey
                    )
                )
        );


    if(!events.length){

        return;

    }


    const linked =
        events.filter(
            event =>
                event.favoriteSource ===
                "planner"
        );


    let message =
        "";


    if(linked.length > 0){

        const dates =
            [];


        linked.forEach(event=>{

            const sourceDates =
                event.sourceDates ||
                (
                    event.start
                    ?
                    [
                        String(
                            event.start
                        ).substring(
                            0,
                            10
                        )
                    ]
                    :
                    []
                );


            sourceDates.forEach(date=>{

                if(
                    date &&
                    !dates.includes(date)
                ){

                    dates.push(
                        date
                    );

                }

            });

        });


        dates.sort();


        if(dates.length){

            message +=
                dates
                .map(
                    date =>
                        formatFavoriteDateJapanese(
                            date
                        )
                )
                .join("\n");


            message +=
                "\n\n";

        }


        message +=
            "の1日手帳からも削除されます。\n\n";

    }


    message +=
        "よろしいですか？";


    if(
        !confirm(message)
    ){

        return;

    }


    const data =
        db.load();


    events.forEach(event=>{

        const id =
            String(
                event.id
            );


        /*
           =================================================
           直接追加
           → お気に入りだけ削除
        =================================================
        */

        if(
            event.favoriteSource ===
            "favorite"
        ){

            data.favoriteEvents =
                (data.favoriteEvents || [])
                .filter(
                    e =>
                        String(e.id)
                        !==
                        id
                );


            return;

        }


        /*
           =================================================
           1日手帳由来
           → 元イベント削除
        =================================================
        */

        data.events =
            (data.events || [])
            .filter(
                e =>
                    String(e.id)
                    !==
                    id
            );


        Object.values(
            data.dayMemories || {}
        )
        .forEach(day=>{

            if(day.events){

                day.events =
                    day.events.filter(
                        e =>
                            String(e.id)
                            !==
                            id
                    );

            }

        });

    });


    db.save(
        data
    );


    favoriteDeleteModeActive =
        false;


    selectedFavoriteIds =
        [];


    renderFavoritesPage();


    /*
       =====================================================
       1日手帳・カレンダー・ホーム更新
    =====================================================
    */

    refreshFavoriteRelatedViews();

}


/* =========================================================
   📷 写真削除
========================================================= */

function deleteSelectedFavoritePhotos(){

    if(
        selectedFavoritePhotoIds.length === 0
    ){

        return;

    }


    const photos =
        getFavoritePhotos()
        .filter(
            photo =>
                selectedFavoritePhotoIds.includes(
                    String(
                        photo.favoriteKey
                    )
                )
        );


    if(!photos.length){

        return;

    }


    const linked =
        photos.filter(
            photo =>
                photo.favoriteSource ===
                "planner"
        );


    let message =
        "";


    if(linked.length > 0){

        const dates =
            [];


        linked.forEach(photo=>{

            const sourceDates =
                photo.sourceDates ||
                (
                    photo.sourceDate
                    ?
                    [photo.sourceDate]
                    :
                    []
                );


            sourceDates.forEach(date=>{

                if(
                    date &&
                    !dates.includes(date)
                ){

                    dates.push(
                        date
                    );

                }

            });

        });


        dates.sort();


        if(dates.length){

            message +=
                dates
                .map(
                    date =>
                        formatFavoriteDateJapanese(
                            date
                        )
                )
                .join("\n");


            message +=
                "\n\n";

        }


        message +=
            "の1日手帳からも削除されます。\n\n";

    }


    message +=
        "よろしいですか？";


    if(
        !confirm(message)
    ){

        return;

    }


    const data =
        db.load();


    photos.forEach(photo=>{

        const id =
            String(
                photo.id
            );


        /*
           直接追加写真
        */

        if(
            photo.favoriteSource ===
            "favorite"
        ){

            data.favoritePhotos =
                (data.favoritePhotos || [])
                .filter(
                    p =>
                        String(p.id)
                        !==
                        id
                );


            return;

        }


        /*
           1日手帳由来写真
        */

        Object.values(
            data.dayMemories || {}
        )
        .forEach(day=>{

            if(day.photos){

                day.photos =
                    day.photos.filter(
                        p =>
                            String(p.id)
                            !==
                            id
                    );

            }

        });

    });


    db.save(
        data
    );


    favoriteDeleteModeActive =
        false;


    selectedFavoritePhotoIds =
        [];


    renderFavoritesPage();


    refreshFavoriteRelatedViews();

}


/* =========================================================
   🔄 関連画面更新
========================================================= */

function refreshFavoriteRelatedViews(){

    if(
        typeof showPlanner ===
        "function" &&
        typeof selectedCalendarDate !==
        "undefined" &&
        selectedCalendarDate
    ){

        try{

            showPlanner(
                selectedCalendarDate,
                false
            );

        }catch(error){

            console.log(
                "お気に入り関連planner更新:",
                error
            );

        }

    }


    if(
        typeof renderCalendar ===
        "function"
    ){

        try{

            renderCalendar();

        }catch(error){

            console.log(
                "お気に入り関連calendar更新:",
                error
            );

        }

    }


    if(
        typeof displayEventList ===
        "function"
    ){

        try{

            displayEventList();

        }catch(error){

            console.log(
                "お気に入り関連event更新:",
                error
            );

        }

    }


    if(
        typeof displayHomeSchedule ===
        "function"
    ){

        try{

            displayHomeSchedule();

        }catch(error){

            console.log(
                "お気に入り関連home更新:",
                error
            );

        }

    }

}


/* =========================================================
   📤 共有モード
========================================================= */

function favoriteShareMode(){

    favoriteDeleteModeActive =
        false;

    favoriteShareModeActive =
        true;

    favoriteFreeSortModeActive =
        false;


    selectedFavoriteIds =
        [];

    selectedFavoritePhotoIds =
        [];


    renderFavoritesPage();

}


/* =========================================================
   📤 共有モードキャンセル
========================================================= */

function cancelFavoriteShareMode(){

    favoriteShareModeActive =
        false;


    selectedFavoriteIds =
        [];

    selectedFavoritePhotoIds =
        [];


    renderFavoritesPage();

}


/* =========================================================
   📤 イベント共有
========================================================= */

async function shareSelectedFavoriteEvents(){

    const events =
        getFavoriteEvents()
        .filter(
            event =>
                selectedFavoriteIds.includes(
                    String(
                        event.favoriteKey
                    )
                )
        );


    if(!events.length){

        return;

    }


    const text =
        events
        .map(event=>{

            return (

                "📌 " +
                (event.title || "") +

                "\n" +

                (
                    event.start
                    ?
                    formatFavoriteDateTime(
                        event.start
                    )
                    :
                    ""
                ) +

                (
                    event.place
                    ?
                    "\n📍 " +
                    event.place
                    :
                    ""
                )

            );

        })
        .join(
            "\n\n"
        );


    try{

        if(
            navigator.share
        ){

            await navigator.share({

                title:
                    "推し活手帳",

                text:
                    text

            });

        }else{

            await navigator.clipboard.writeText(
                text
            );


            alert(
                "共有内容をコピーしました"
            );

        }

    }catch(error){

        console.log(
            "お気に入りイベント共有:",
            error
        );

    }

}


/* =========================================================
   📷 写真共有
========================================================= */

async function shareSelectedFavoritePhotos(){

    const photos =
        getFavoritePhotos()
        .filter(
            photo =>
                selectedFavoritePhotoIds.includes(
                    String(
                        photo.favoriteKey
                    )
                )
        );


    if(!photos.length){

        return;

    }


    try{

        const files =
            [];


        for(
            let i = 0;
            i < photos.length;
            i++
        ){

            const response =
                await fetch(
                    photos[i].src
                );


            const blob =
                await response.blob();


            files.push(
                new File(
                    [
                        blob
                    ],
                    `favorite-photo-${i+1}.jpg`,
                    {
                        type:
                            blob.type ||
                            "image/jpeg"
                    }
                )
            );

        }


        if(
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files
            })
        ){

            await navigator.share({

                files:

                    files,

                title:
                    "推し活手帳"

            });

        }else{

            alert(
                "この端末では写真共有に対応していません"
            );

        }

    }catch(error){

        console.log(
            "お気に入り写真共有:",
            error
        );

    }

}


/* =========================================================
   📷 お気に入り写真ビューア
========================================================= */

function openFavoritePhotoViewerNew(
    id
){

    if(
        favoriteSuppressClick
    ){

        return;

    }


    const photos =
        getFavoritePhotos();


    const photo =
        photos.find(
            p =>
                String(p.id)
                ===
                String(id)
        );


    if(!photo){

        return;

    }


    /*
       既存ビューアを利用
    */

    if(
        typeof favoriteViewMode !==
        "undefined"
    ){

        favoriteViewMode =
            true;

    }else{

        window.favoriteViewMode =
            true;

    }


    currentPhotoId =
        photo.id;


    currentPhotoSrc =
        photo.src;


    currentPhotoIndex =
        photos.findIndex(
            p =>
                String(p.id)
                ===
                String(photo.id)
        );


    const img =
        document.getElementById(
            "photoViewerImage"
        );


    if(!img){

        return;

    }


    img.src =
        photo.src;


    img.style.transform =
        "translate(0px,0px) scale(1)";


    photoScale =
        1;


    photoTranslateX =
        0;


    photoTranslateY =
        0;


    lastDistance =
        0;


    if(
        typeof updateFavoriteButton ===
        "function"
    ){

        updateFavoriteButton();

    }


    const viewer =
        document.getElementById(
            "photoViewer"
        );


    if(viewer){

        viewer.style.display =
            "flex";


        viewer.style.zIndex =
            "9999";

    }


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   📅 日付表示
========================================================= */

function formatFavoriteDateJapanese(
    date
){

    if(!date){

        return "";

    }


    const d =
        new Date(
            date +
            "T00:00:00"
        );


    const week =
        [
            "日",
            "月",
            "火",
            "水",
            "木",
            "金",
            "土"
        ];


    return (

        `${d.getMonth()+1}月` +
        `${d.getDate()}日` +
        `（${week[d.getDay()]}）`

    );

}


/* =========================================================
   📅 日時表示
========================================================= */

function formatFavoriteDateTime(
    value
){

    if(!value){

        return "";

    }


    const d =
        new Date(
            value
        );


    if(
        Number.isNaN(
            d.getTime()
        )
    ){

        return String(
            value
        );

    }


    return (

        `${d.getFullYear()}年` +
        `${d.getMonth()+1}月` +
        `${d.getDate()}日` +
        ` ${String(
            d.getHours()
        ).padStart(
            2,
            "0"
        )}:` +
        `${String(
            d.getMinutes()
        ).padStart(
            2,
            "0"
        )}`

    );

}


/* =========================================================
   ⏰ 時刻表示
========================================================= */

function formatFavoriteTime(
    value
){

    if(!value){

        return "";

    }


    const d =
        new Date(
            value
        );


    if(
        Number.isNaN(
            d.getTime()
        )
    ){

        return "";

    }


    return (

        `${String(
            d.getHours()
        ).padStart(
            2,
            "0"
        )}:` +

        `${String(
            d.getMinutes()
        ).padStart(
            2,
            "0"
        )}`

    );

}


/* =========================================================
   🛡 HTMLエスケープ
========================================================= */

function escapeFavoriteText(
    value
){

    return String(
        value ?? ""
    )
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


/* =========================================================
   🚀 DOMContentLoaded
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        setupFavoriteDragDrop();

    }
);