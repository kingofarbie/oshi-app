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


/* =========================
   ⭐ 推し活費ページを開く
========================= */

function openOshiMoney(){

    console.log(
        "★ 推し活費ページを開く"
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


    fetch("oshi-money.html")

        .then(response => {

            if(!response.ok){

                throw new Error(
                    "oshi-money.html の読み込みに失敗しました"
                );

            }

            return response.text();

        })


        .then(html => {

            container.innerHTML =
                html;


            console.log(
                "★ oshi-money.html 読み込みOK"
            );

        })


        .catch(error => {

            console.error(
                "★ 推し活費ページ読み込みエラー:",
                error
            );

            container.innerHTML = `

                <div class="card">

                    <p>
                        推し活費ページを
                        読み込めませんでした。
                    </p>

                </div>

            `;

        });

}


/* =========================
   ⭐ 推し活費ページを閉じる
========================= */

function closeOshiMoney(){

    console.log(
        "★ 推し活費ページを閉じる"
    );


    const container =
        document.getElementById(
            "moneyContainer"
        );


    if(!container){
        return;
    }


    /*
       お金の入口へ戻す
    */

    loadMoneyPage();

}