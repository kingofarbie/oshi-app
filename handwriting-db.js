
/* =====================================================
   ✍️ 共通手書き機能
   handwriting-db.js

   ・手書きデータ専用の IndexedDB
   ・ページ、日付ごとに保存
   ・保存済みデータの読み込み
   ・データの削除
   ・ほかのアプリデータや写真・動画DBには干渉しない
===================================================== */

const HANDWRITING_DB_NAME = "oshi_app_handwriting";
const HANDWRITING_DB_VERSION = 1;
const HANDWRITING_STORE_NAME = "pages";


/* =====================================================
   🗄️ データベースを開く
===================================================== */

function handwritingOpenDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            HANDWRITING_DB_NAME,
            HANDWRITING_DB_VERSION
        );

        request.onupgradeneeded = function (event) {

            const database = event.target.result;

            if (
                !database.objectStoreNames.contains(
                    HANDWRITING_STORE_NAME
                )
            ) {

                database.createObjectStore(
                    HANDWRITING_STORE_NAME,
                    {
                        keyPath: "id"
                    }
                );

            }

        };

        request.onsuccess = function () {

            resolve(request.result);

        };

        request.onerror = function () {

            reject(
                request.error ||
                new Error(
                    "手書き用データベースを開けませんでした。"
                )
            );

        };

        request.onblocked = function () {

            reject(
                new Error(
                    "手書き用データベースがほかの処理によってブロックされています。"
                )
            );

        };

    });

}


/* =====================================================
   🔑 保存データの識別キーを作る
===================================================== */

function handwritingCreateKey(pageType, pageId) {

    if (
        typeof pageType !== "string" ||
        !pageType.trim() ||
        typeof pageId !== "string" ||
        !pageId.trim()
    ) {

        throw new Error(
            "ページの種類とページIDを指定してください。"
        );

    }

    return `${pageType.trim()}::${pageId.trim()}`;

}


/* =====================================================
   💾 手書きデータを保存
===================================================== */

async function handwritingSave(pageType, pageId, strokes) {

    const id = handwritingCreateKey(
        pageType,
        pageId
    );

    const database = await handwritingOpenDB();

    try {

        await new Promise((resolve, reject) => {

            const transaction = database.transaction(
                HANDWRITING_STORE_NAME,
                "readwrite"
            );

            const store = transaction.objectStore(
                HANDWRITING_STORE_NAME
            );

            store.put({

                id,

                pageType,
                pageId,

                strokes,

                updatedAt: Date.now()

            });

            transaction.oncomplete = function () {

                resolve();

            };

            transaction.onerror = function () {

                reject(
                    transaction.error ||
                    new Error(
                        "手書きデータを保存できませんでした。"
                    )
                );

            };

            transaction.onabort = function () {

                reject(
                    transaction.error ||
                    new Error(
                        "手書きデータの保存が中断されました。"
                    )
                );

            };

        });

    } finally {

        database.close();

    }

}


/* =====================================================
   📂 手書きデータを読み込む
===================================================== */

async function handwritingLoad(pageType, pageId) {

    const id = handwritingCreateKey(
        pageType,
        pageId
    );

    const database = await handwritingOpenDB();

    try {

        return await new Promise((resolve, reject) => {

            const transaction = database.transaction(
                HANDWRITING_STORE_NAME,
                "readonly"
            );

            const store = transaction.objectStore(
                HANDWRITING_STORE_NAME
            );

            const request = store.get(id);

            request.onsuccess = function () {

                const record = request.result;

                resolve(
                    record && Array.isArray(record.strokes)
                        ? record.strokes
                        : []
                );

            };

            request.onerror = function () {

                reject(
                    request.error ||
                    new Error(
                        "手書きデータを読み込めませんでした。"
                    )
                );

            };

        });

    } finally {

        database.close();

    }

}


/* =====================================================
   🗑️ ページの手書きデータを削除
===================================================== */

async function handwritingDelete(pageType, pageId) {

    const id = handwritingCreateKey(
        pageType,
        pageId
    );

    const database = await handwritingOpenDB();

    try {

        await new Promise((resolve, reject) => {

            const transaction = database.transaction(
                HANDWRITING_STORE_NAME,
                "readwrite"
            );

            const store = transaction.objectStore(
                HANDWRITING_STORE_NAME
            );

            store.delete(id);

            transaction.oncomplete = function () {

                resolve();

            };

            transaction.onerror = function () {

                reject(
                    transaction.error ||
                    new Error(
                        "手書きデータを削除できませんでした。"
                    )
                );

            };

            transaction.onabort = function () {

                reject(
                    transaction.error ||
                    new Error(
                        "手書きデータの削除が中断されました。"
                    )
                );

            };

        });

    } finally {

        database.close();

    }

}
