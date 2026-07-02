// =====================
// アプリ更新管理
// =====================

const APP_VERSION = "v1.9";


// =====================
// 更新モーダル表示
// =====================

function openUpdateModal() {

    document.getElementById("updateModal").style.display = "flex";

}


// =====================
// 更新モーダル閉じる
// =====================

function closeUpdateModal() {

    document.getElementById("updateModal").style.display = "none";

}


// =====================
// 更新実行
// =====================

function startUpdate() {

    closeUpdateModal();


    if ("caches" in window) {

        caches.keys().then(keys => {

            return Promise.all(
                keys.map(key => caches.delete(key))
            );

        }).then(() => {

            location.reload();

        });


    } else {

        location.reload();

    }

}



// =====================
// 最新版チェック
// =====================

async function checkLatestVersion(showModal = false) {


    try {


        const res = await fetch(
            "version.json?time=" + Date.now()
        );


        const data = await res.json();



        // 設定画面表示

        const version =
        document.getElementById("appVersion");



        if(version){


            if(data.version === APP_VERSION){


                version.innerHTML =
                "現在：" + APP_VERSION +
                "<br>✅ 最新版です";


            }else{


                version.innerHTML =
                "現在：" + APP_VERSION +
                "<br>🆕 最新版：" + data.version;


            }


        }




        // 更新確認ボタンから呼ばれた場合

        if(showModal){


            openUpdateModal();



            const message =
            document.getElementById("updateMessage");


            const button =
            document.getElementById("updateButton");



            if(data.version !== APP_VERSION){


                message.innerHTML =
                "🆕 新しいバージョンがあります<br><br>" +
                "現在：" + APP_VERSION +
                "<br>最新版：" + data.version;



                button.style.display =
                "block";



            }else{


                message.innerHTML =
                "✅ 最新版です";


                button.style.display =
                "none";


            }


        }



    } catch(e) {



        const version =
        document.getElementById("appVersion");



        if(version){

            version.innerHTML =
            "現在：" + APP_VERSION +
            "<br>⚠️ バージョン確認失敗";

        }


    }


}



// =====================
// 起動時チェック
// =====================

document.addEventListener(
"DOMContentLoaded",
()=>{

    checkLatestVersion();


});