console.log("★ oshi.js 読み込みOK");

/* =========================
推しページ読み込み
========================= */

function loadOshiPage(){

const container =
    document.getElementById("oshiContainer");

if(!container){

    console.error(
        "oshiContainer が見つかりません"
    );

    return;
}


fetch("oshi.html")
    .then(response => {

        if(!response.ok){

            throw new Error(
                "oshi.html の読み込みに失敗しました"
            );

        }

        return response.text();

    })
    .then(html => {

        container.innerHTML = html;

        console.log(
            "★ oshi.html 読み込み完了"
        );

    })
    .catch(error => {

        console.error(
            "oshi.html 読み込みエラー:",
            error
        );

        container.innerHTML = `
            <div class="card">
                <p>推しページの読み込みに失敗しました。</p>
            </div>
        `;

    });

}

/* =========================
推し詳細ページ
========================= */

function openOshiDetail(){

window.location.href =
    "oshi-details.html";

}

/* =========================
起動
========================= */

document.addEventListener(
"DOMContentLoaded",
loadOshiPage
);