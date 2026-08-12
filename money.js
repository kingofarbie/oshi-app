/* =========================
   💰 お金ページ
   money.js
========================= */


/* =========================
   お金ページ読み込み
========================= */

function loadMoneyPage(){

    console.log(
        "★ お金ページ読み込み"
    );


    const container =
        document.getElementById(
            "moneyContainer"
        );


    if(!container){

        console.error(
            "★ moneyContainer が見つかりません"
        );

        return;

    }


    fetch("money.html")

        .then(response => {

            if(!response.ok){

                throw new Error(
                    "money.html の読み込みに失敗しました"
                );

            }

            return response.text();

        })


        .then(html => {

            container.innerHTML =
                html;


            console.log(
                "★ money.html 読み込みOK"
            );

        })


        .catch(error => {

            console.error(
                "★ お金ページ読み込みエラー:",
                error
            );


            container.innerHTML = `

                <div class="card">

                    <p>
                        お金ページを
                        読み込めませんでした。
                    </p>

                </div>

            `;

        });

}