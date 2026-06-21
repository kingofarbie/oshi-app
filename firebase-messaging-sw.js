// Firebase Cloud Messaging Service Worker


importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);




const firebaseConfig = {
  apiKey: "AIzaSyAw4krU9eVoUQegnxTCS02G_rKFCT9HlA0",
  authDomain: "oshi-app-737c0.firebaseapp.com",
  projectId: "oshi-app-737c0",
  storageBucket: "oshi-app-737c0.firebasestorage.app",
  messagingSenderId: "545181069543",
  appId: "1:545181069543:web:33809ce86bedd3b28d7242"
};

firebase.initializeApp(firebaseConfig);


const messaging =
    firebase.messaging();


messaging.onBackgroundMessage(
    function(payload){

        console.log(
            "バックグラウンド通知:",
            payload
        );


        self.registration.showNotification(
            payload.notification.title,
            {
                body:
                payload.notification.body
            }
        );

    }
);