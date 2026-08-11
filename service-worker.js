const CACHE_NAME = "oshi-app-v2";

self.addEventListener("install", event => {

    self.skipWaiting();

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))

            );

        }).then(() => {

            return self.clients.claim();

        })

    );

});


self.addEventListener("fetch", event => {

    event.respondWith(
        fetch(event.request)
    );

});


self.addEventListener("notificationclick", event => {

    event.notification.close();

    event.waitUntil(

        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(clientList => {

            if (clientList.length) {

                return clientList[0].focus();

            }

            return clients.openWindow("./");

        })

    );

});