console.log("notification.js 読み込み成功");

async function initNotification(){

    if(!("Notification" in window)){
        return;
    }

    if(Notification.permission === "default"){
        await Notification.requestPermission();
    }

    if(Notification.permission !== "granted"){
        return;
    }

    // 5秒後にテスト
    setTimeout(showTestNotification,5000);

}

async function showTestNotification(){

    const registration = await navigator.serviceWorker.ready;

    registration.showNotification("推し活手帳",{
        body:"Android通知テストです🎉",
        icon:"./icon-192.png",
        badge:"./icon-192.png",
        tag:"test",
        vibrate:[200,100,200]
    });

}