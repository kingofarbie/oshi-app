
const firebaseConfig = {
  apiKey: "AIzaSyAw4krU9eVoUQegnxTCS02G_rKFCT9HlA0",
  authDomain: "oshi-app-737c0.firebaseapp.com",
  projectId: "oshi-app-737c0",
  storageBucket: "oshi-app-737c0.firebasestorage.app",
  messagingSenderId: "545181069543",
  appId: "1:545181069543:web:33809ce86bedd3b28d7242"
};

// Firebase初期化

firebase.initializeApp(firebaseConfig);

const messaging =
    firebase.messaging();



    if ('serviceWorker' in navigator) {

    navigator.serviceWorker
    .register('./firebase-messaging-sw.js')

    .then(function(reg){

        console.log(
            'Service Worker登録成功',
            reg
        );

    })

    .catch(function(err){

        console.error(
            'Service Worker登録失敗',
            err
        );

    });

}


if ('serviceWorker' in navigator) {

    navigator.serviceWorker
    .register('./firebase-messaging-sw.js')

    .then(function(reg){

        console.log(
            'Service Worker登録成功'
        );

        return messaging.getToken({

            vapidKey:
            "BN1-_Xmg_3Ghv0gk1sJ_HuQPcl33BoHA8RzMbI0pKC3Shvet0-eLI6WI6MgKI7CQylJy7yCRBgtSpUmwcLPmtn0",

            serviceWorkerRegistration:
            reg

        });

    })

    .then(function(token){

        console.log(
            "FCMトークン:",
            token
        );

    })

    .catch(function(err){

        console.error(
            'FCMエラー:',
            err
        );

    });

}
