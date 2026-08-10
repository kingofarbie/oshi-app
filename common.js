/* =====================
   アプリ共有
===================== */

function openAppShare(){

console.log("★★★★★ openAppShare 実行 ★★★★★");


    closeHomeMenu();

    const appUrl =
        window.location.href;

    const modal =
        document.getElementById("appShareModal");

    const urlText =
        document.getElementById("appShareUrl");

    const qrCode =
        document.getElementById("appShareQr");

    if(!modal || !urlText || !qrCode){

        console.error(
            "アプリ共有用HTMLが見つかりません"
        );

        return;
    }


    /* 現在のURLを表示 */

    urlText.textContent =
        appUrl;


    /* QRコード生成 */

    qrCode.innerHTML = "";

    new QRCode(
        qrCode,
        {
            text: appUrl,
            width: 220,
            height: 220
        }
    );


    /* モーダル表示 */

    modal.style.display =
        "flex";

}

/* =====================
   アプリ共有を閉じる
===================== */

function closeAppShare(){

    const modal =
        document.getElementById("appShareModal");

    if(modal){

        modal.style.display =
            "none";

    }

}

/* =====================
   URLコピー
===================== */

async function copyAppUrl(){

    const appUrl =
        window.location.href;

    try{

        await navigator.clipboard.writeText(
            appUrl
        );

        alert(
            "アプリのURLをコピーしました！"
        );

    }catch(error){

        console.error(
            "URLコピー失敗:",
            error
        );

        alert(
            "URLをコピーできませんでした"
        );

    }

}


/* =====================
   OSの共有メニュー
===================== */

async function shareAppUrl(){

    const appUrl =
        window.location.href;

    const shareData = {

        title:
            "推し活手帳",

        text:
            "推し活手帳を使ってみてね！",

        url:
            appUrl

    };


    if(
        navigator.share
    ){

        try{

            await navigator.share(
                shareData
            );

        }catch(error){

            /*
               キャンセルした場合は
               エラー表示しない
            */

            if(
                error.name !==
                "AbortError"
            ){

                console.error(
                    "共有失敗:",
                    error
                );

            }

        }

    }else{

        await copyAppUrl();

    }

}


/* =====================
アプリについて
===================== */

function openAboutApp(){

closeHomeMenu();

const modal =
    document.getElementById("aboutAppModal");

if(modal){

    modal.style.display = "flex";

}

}

/* =====================
アプリについてを閉じる
===================== */

function closeAboutApp(){

const modal =
    document.getElementById("aboutAppModal");

if(modal){

    modal.style.display = "none";

}

}

