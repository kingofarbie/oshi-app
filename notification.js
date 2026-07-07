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

}