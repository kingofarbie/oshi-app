
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

    Notification.requestPermission()
.then(permission => {

    console.log(
        "通知権限:",
        permission
    );

    if(permission === "granted"){

        new Notification(
            "推し活手帳",
            {
                body:"通知テストです🎉"
            }
        );

    }

});
