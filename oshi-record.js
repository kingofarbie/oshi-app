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