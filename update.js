// =====================
// アプリ更新
// =====================

const APP_VERSION = "v1.8";

function checkForUpdates() {

    const ok = confirm(
        "最新版を確認します。\n\n更新しても保存済みデータは消えません。\n\n続行しますか？"
    );

    if (!ok) return;

    // キャッシュ削除（将来Service Worker導入時にも対応）
    if ("caches" in window) {
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => caches.delete(key))
            );
        }).then(() => {

            alert("更新しました。\nページを再読み込みします。");

            location.reload();

        });
    } else {

        alert("更新しました。\nページを再読み込みします。");

        location.reload();

    }

}


document.addEventListener("DOMContentLoaded", () => {

    const version = document.getElementById("appVersion");

    if(version){

        version.textContent = "現在：" + APP_VERSION;

    }

});