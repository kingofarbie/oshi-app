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


    /* =====================
       メイン写真表示
    ===================== */

    renderOshiMainPhoto(
        id
    );


    /* =====================
       写真 input 初期化
    ===================== */

    initOshiPhotoInputs();


    console.log(
        "★ 推し詳細表示:",
        oshi.name
    );

}


/* =========================
   推しメイン写真表示
========================= */

function renderOshiMainPhoto(id){

    const placeholder =
        document.getElementById(
            "oshiMainPhotoPlaceholder"
        );

    const imageButton =
        document.getElementById(
            "oshiMainPhotoImageButton"
        );

    const image =
        document.getElementById(
            "oshiMainPhotoImage"
        );


    if(
        !placeholder ||
        !imageButton ||
        !image
    ){

        return;

    }


    const data =
        db.load();


    const detail =
        data.oshiDetails?.[id];


    const photo =
        detail?.mainPhoto || "";


    if(photo){

        image.src =
            photo;

        placeholder.style.display =
            "none";

        imageButton.style.display =
            "block";

    }
    else{

        image.removeAttribute(
            "src"
        );

        placeholder.style.display =
            "flex";

        imageButton.style.display =
            "none";

    }

}


/* =========================
   写真追加モーダルを開く
========================= */

function openOshiPhotoAddModal(){

    const modal =
        document.getElementById(
            "oshiPhotoAddModal"
        );


    if(!modal){

        return;

    }


    modal.style.display =
        "flex";

}


/* =========================
   写真追加モーダルを閉じる
========================= */

function closeOshiPhotoAddModal(){

    const modal =
        document.getElementById(
            "oshiPhotoAddModal"
        );


    if(!modal){

        return;

    }


    modal.style.display =
        "none";

}


/* =========================
   カメラを開く
========================= */

function openOshiCamera(){

    const input =
        document.getElementById(
            "oshiCameraInput"
        );


    if(!input){

        return;

    }


    closeOshiPhotoAddModal();


    input.value =
        "";


    input.click();

}


/* =========================
   アルバムを開く
========================= */

function openOshiAlbum(){

    const input =
        document.getElementById(
            "oshiAlbumInput"
        );


    if(!input){

        return;

    }


    closeOshiPhotoAddModal();


    input.value =
        "";


    input.click();

}


/* =========================
   写真 input 初期化
========================= */

function initOshiPhotoInputs(){

    const cameraInput =
        document.getElementById(
            "oshiCameraInput"
        );

    const albumInput =
        document.getElementById(
            "oshiAlbumInput"
        );


    if(cameraInput){

        cameraInput.onchange =
            function(){

                handleOshiMainPhotoFile(
                    this.files?.[0]
                );

            };

    }


    if(albumInput){

        albumInput.onchange =
            function(){

                handleOshiMainPhotoFile(
                    this.files?.[0]
                );

            };

    }

}


/* =========================
   写真保存
========================= */

function handleOshiMainPhotoFile(file){

    if(!file){

        return;

    }


    if(
        !file.type ||
        !file.type.startsWith(
            "image/"
        )
    ){

        alert(
            "画像ファイルを選択してください。"
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(){

            const photo =
                reader.result;


            const container =
                document.getElementById(
                    "oshiContainer"
                );


            if(!container){

                return;

            }


            const oshiId =
                container.dataset.oshiId;


            if(!oshiId){

                console.error(
                    "★ 推しIDが取得できません"
                );

                return;

            }


            const data =
                db.load();


            if(!data.oshiDetails){

                data.oshiDetails =
                    {};

            }


            if(!data.oshiDetails[oshiId]){

                data.oshiDetails[oshiId] =
                    {};

            }


            data.oshiDetails[oshiId]
                .mainPhoto =
                    photo;


            db.save(
                data
            );


            renderOshiMainPhoto(
                oshiId
            );


            console.log(
                "★ 推しメイン写真を保存:",
                oshiId
            );

        };


    reader.onerror =
        function(){

            console.error(
                "★ 写真の読み込みに失敗しました"
            );

            alert(
                "写真の読み込みに失敗しました。"
            );

        };


    reader.readAsDataURL(
        file
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