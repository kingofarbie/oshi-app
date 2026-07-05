const firebaseConfig = {
  apiKey: "AIzaSyAw4krU9eVoUQegnxTCS02G_rKFCT9HlA0",
  authDomain: "oshi-app-737c0.firebaseapp.com",
  projectId: "oshi-app-737c0",
  storageBucket: "oshi-app-737c0.firebasestorage.app",
  messagingSenderId: "545181069543",
  appId: "1:545181069543:web:33809ce86bedd3b28d7242"
};

// Firebase初期化（重複防止）
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// Service Worker登録＋FCMトークン取得
if ("serviceWorker" in navigator) {

    navigator.serviceWorker
        .register("./firebase-messaging-sw.js")
        .then(function(reg) {

            console.log("Firebase Service Worker登録成功");

            return messaging.getToken({
                vapidKey: "BN1-_Xmg_3Ghv0gk1sJ_HuQPcl33BoHA8RzMbI0pKC3Shvet0-eLI6WI6MgKI7CQylJy7yCRBgtSpUmwcLPmtn0",
                serviceWorkerRegistration: reg
            });

        })

        .then(function(token) {

            if (token) {

                console.log("FCMトークン:", token);

                // ★Firestoreへ保存
                firebase.firestore()
                    .collection("devices")
                    .add({
                        token: token,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        platform: navigator.userAgent
                    })
                    .then(function() {
                        console.log("Firestore保存成功");
                    })
                    .catch(function(err) {
                        console.error("Firestore保存失敗:", err);
                    });

            } else {
                console.log("FCMトークン取得できませんでした");
            }

        })

        .catch(function(err) {

            console.error("Firebaseエラー:", err);

        });

}