/* =========================================================
   推し活手帳
   写真・動画用 IndexedDB
========================================================= */

const MEDIA_DB_NAME = "oshi_app_media";
const MEDIA_DB_VERSION = 1;
const MEDIA_STORE_NAME = "media";


/* =========================================================
   IndexedDBを開く
========================================================= */

function openMediaDB(){

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                MEDIA_DB_NAME,
                MEDIA_DB_VERSION
            );


        request.onupgradeneeded = function(event){

            const database =
                event.target.result;


            if(
                !database.objectStoreNames.contains(
                    MEDIA_STORE_NAME
                )
            ){

                database.createObjectStore(
                    MEDIA_STORE_NAME,
                    {
                        keyPath: "id"
                    }
                );

            }

        };


        request.onsuccess = function(){

            resolve(
                request.result
            );

        };


        request.onerror = function(){

            console.error(
                "IndexedDBを開けません:",
                request.error
            );

            reject(
                request.error
            );

        };

    });

}


/* =========================================================
   メディア保存
========================================================= */

async function saveMediaFile(
    id,
    file,
    type = "photo"
){

    const database =
        await openMediaDB();


    return new Promise((resolve, reject) => {

        const transaction =
            database.transaction(
                MEDIA_STORE_NAME,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                MEDIA_STORE_NAME
            );


        store.put({

            id:
                Number(id),

            type:
                type,

            file:
                file,

            savedAt:
                Date.now()

        });


        transaction.oncomplete =
            function(){

                database.close();

                resolve(true);

            };


        transaction.onerror =
            function(){

                database.close();

                reject(
                    transaction.error
                );

            };

    });

}


/* =========================================================
   メディア取得
========================================================= */

async function getMediaFile(id){

    const database =
        await openMediaDB();


    return new Promise((resolve, reject) => {

        const transaction =
            database.transaction(
                MEDIA_STORE_NAME,
                "readonly"
            );


        const store =
            transaction.objectStore(
                MEDIA_STORE_NAME
            );


        const request =
            store.get(
                Number(id)
            );


        request.onsuccess =
            function(){

                database.close();

                resolve(
                    request.result || null
                );

            };


        request.onerror =
            function(){

                database.close();

                reject(
                    request.error
                );

            };

    });

}


/* =========================================================
   メディア削除
========================================================= */

async function deleteMediaFile(id){

    const database =
        await openMediaDB();


    return new Promise((resolve, reject) => {

        const transaction =
            database.transaction(
                MEDIA_STORE_NAME,
                "readwrite"
            );


        const store =
            transaction.objectStore(
                MEDIA_STORE_NAME
            );


        store.delete(
            Number(id)
        );


        transaction.oncomplete =
            function(){

                database.close();

                resolve(true);

            };


        transaction.onerror =
            function(){

                database.close();

                reject(
                    transaction.error
                );

            };

    });

}


/* =========================================================
   メディア一覧取得
========================================================= */

async function getAllMediaFiles(){

    const database =
        await openMediaDB();


    return new Promise((resolve, reject) => {

        const transaction =
            database.transaction(
                MEDIA_STORE_NAME,
                "readonly"
            );


        const store =
            transaction.objectStore(
                MEDIA_STORE_NAME
            );


        const request =
            store.getAll();


        request.onsuccess =
            function(){

                database.close();

                resolve(
                    request.result || []
                );

            };


        request.onerror =
            function(){

                database.close();

                reject(
                    request.error
                );

            };

    });

}


/* =========================================================
   メディア存在確認
========================================================= */

async function hasMediaFile(id){

    const media =
        await getMediaFile(id);

    return !!media;

}


/* =========================================================
   Blob / File → 表示用URL
========================================================= */

function createMediaURL(media){

    if(
        !media ||
        !media.file
    ){

        return null;

    }


    return URL.createObjectURL(
        media.file
    );

}