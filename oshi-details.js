/* =========================
   推し詳細ページ
   oshi-details.js
========================= */


/* =========================
   推し詳細ページ初期化
========================= */

function initOshiDetailsPage(id){

    console.log(
        "★ 推し詳細ページ初期化:",
        id
    );


    const data =
        db.load();


    const oshi =
        (data.oshiList || [])
        .find(
            item =>
                item.id === id
        );


    if(!oshi){

        console.error(
            "★ 推しが見つかりません:",
            id
        );

        return;

    }


    /* =====================
       推し名を表示
    ===================== */

    const title =
        document.querySelector(
            ".oshi-detail-title"
        );


    if(title){

        title.textContent =
            oshi.name;

    }


    /* =====================
       推し活記録タイトル
    ===================== */

    const recordTitle =
        document.getElementById(
            "oshiRecordTitle"
        );


    if(recordTitle){

        recordTitle.textContent =
            oshi.name +
            "の推し活記録";

    }


    console.log(
        "★ 推し詳細表示:",
        oshi.name
    );

}


/* =========================
   推し詳細ページを閉じる
========================= */

function closeOshiDetail(){

    console.log(
        "★ 推し詳細ページを閉じる"
    );


    const container =
        document.getElementById(
            "oshiContainer"
        );


    if(!container){

        return;

    }


    /*
       詳細ページを消して、
       推し一覧を再表示する
    */

    loadOshiPage();

}


/* =========================
   推し活記録ページを閉じる
========================= */

function closeOshiRecord(){

    console.log(
        "★ 推し活記録ページを閉じる"
    );


    const container =
        document.getElementById(
            "oshiContainer"
        );


    if(!container){

        return;

    }


    /*
       推し一覧を再表示する
    */

    loadOshiPage();

}