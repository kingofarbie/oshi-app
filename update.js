const APP_VERSION = "v1.8";

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

document.addEventListener("DOMContentLoaded", () => {

    const version = document.getElementById("appVersion");

    if (version) {
        version.textContent = "現在：" + APP_VERSION;
    }

});