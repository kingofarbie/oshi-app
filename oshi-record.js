/* =========================
   推し活記録
   oshi-record.js
========================= */


/* =========================
   推し活記録ページ初期化
========================= */

function initOshiRecordPage(id){

    console.log(
        "★ 推し活記録ページ初期化:",
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


    console.log(
        "★ 推し活記録対象:",
        oshi.name
    );


    /*
       今後ここに

       ・記録一覧表示
       ・記録追加
       ・記録編集
       ・記録削除
       ・localDB保存

       を追加していきます。
    */

}



/* =====================================================
   📝 推し活記録入力モーダル
===================================================== */

function openOshiActivityModal() {

    const container =
        document.getElementById("oshiContainer");

    if (!container) return;

    const modal =
        container.querySelector("#oshiActivityModal");

    if (!modal) {
        console.error(
            "oshiActivityModal が見つかりません。"
        );
        return;
    }

    // 新しい記録として開く
    modal.classList.add("show");

    // 最初はライブ参加の入力欄を表示
    const typeSelect =
        modal.querySelector("#oshiActivityType");

    if (typeSelect) {
        typeSelect.value = "live";
        typeSelect.dispatchEvent(
            new Event("change")
        );
    }
}


/* =====================================================
   📝 推し活記録入力を閉じる
===================================================== */

function closeOshiActivityModal() {

    const modal =
        document.querySelector(
            "#oshiContainer #oshiActivityModal"
        );

    if (!modal) return;

    modal.classList.remove("show");
}
