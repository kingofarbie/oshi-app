/* =====================
   Notification
===================== */

let notifiedEvents = [];

/* =====================
   通知許可
===================== */

async function initNotification(){

    if(!("Notification" in window)){
        console.log("このブラウザは通知に対応していません");
        return;
    }

    if(Notification.permission === "default"){

        const permission = await Notification.requestPermission();

        console.log("通知許可:", permission);

    }

}