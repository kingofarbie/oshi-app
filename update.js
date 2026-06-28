const APP_VERSION = "v1.7";

function openUpdateModal() {
    document.getElementById("updateModal").style.display = "flex";
}

function closeUpdateModal() {
    document.getElementById("updateModal").style.display = "none";
}

function startUpdate() {

    closeUpdateModal();

    if ("caches" in window) {
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => caches.delete(key)));
        }).then(() => {
            location.reload();
        });
    } else {
        location.reload();
    }

}

async function checkLatestVersion() {

    try {

        const res = await fetch("version.json?time=" + Date.now());
        const data = await res.json();

        const version = document.getElementById("appVersion");

        if (!version) return;

        if (data.version === APP_VERSION) {

            version.innerHTML =
                "現在：" + APP_VERSION + "<br>✅ 最新版です";

        } else {

            version.innerHTML =
                "現在：" + APP_VERSION +
                "<br>🆕 最新版：" + data.version;

        }

    } catch {

        const version = document.getElementById("appVersion");

        if (version) {
            version.innerHTML =
                "現在：" + APP_VERSION +
                "<br>⚠️ バージョン確認失敗";
        }

    }

}

document.addEventListener("DOMContentLoaded", () => {

    checkLatestVersion();

});