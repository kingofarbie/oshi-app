console.log("notification.js 読み込み成功");

/* =====================
   Notification
===================== */

let notifiedEvents = [];

/* =====================
   通知許可
===================== */

async function initNotification(){

    console.log("initNotification 開始");

    if(!("Notification" in window)){
        console.log("このブラウザは通知に対応していません");
        return;
    }

    console.log("通知状態:", Notification.permission);

    if(Notification.permission === "default"){

        const permission = await Notification.requestPermission();

        console.log("通知許可:", permission);

    }

    // 5秒後にテスト通知
    testNotification();

}


/* =====================
   テスト通知
===================== */

function testNotification(){

    if(Notification.permission !== "granted"){
        console.log("通知が許可されていません");
        return;
    }

    setTimeout(function(){

        new Notification("推し活手帳",{
            body:"🎉 通知テスト成功です！"
        });

        console.log("テスト通知送信");

    },5000);

}