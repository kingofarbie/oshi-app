const CACHE_NAME = "oshi-app-v1";

self.addEventListener("install",event=>{
    self.skipWaiting();
});

self.addEventListener("activate",event=>{
    event.waitUntil(
        self.clients.claim()
    );
});

self.addEventListener("fetch",event=>{

    event.respondWith(
        fetch(event.request)
    );

});

self.addEventListener("notificationclick",event=>{

    event.notification.close();

    event.waitUntil(

        clients.matchAll({
            type:"window",
            includeUncontrolled:true
        }).then(clientList=>{

            if(clientList.length){

                return clientList[0].focus();

            }

            return clients.openWindow("./");

        })

    );

});