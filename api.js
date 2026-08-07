// =====================
// Nager.Date API
// 国一覧取得
// =====================

async function loadHolidayCountries() {

    const select =
        document.getElementById("holidayCountry");


    if (!select) {
        return;
    }



    // =====================
    // ⭐ 主要国（上部固定）
    // =====================

    const priorityCountries = [

        {
            countryCode:"JP",
            name:"🇯🇵 Japan"
        },

        {
            countryCode:"US",
            name:"🇺🇸 United States"
        },

        {
            countryCode:"KR",
            name:"🇰🇷 South Korea"
        },

        {
            countryCode:"CN",
            name:"🇨🇳 China"
        },

        {
            countryCode:"TW",
            name:"🇹🇼 Taiwan"
        },

        {
            countryCode:"GB",
            name:"🇬🇧 United Kingdom"
        },

        {
            countryCode:"DE",
            name:"🇩🇪 Germany"
        },

        {
            countryCode:"FR",
            name:"🇫🇷 France"
        },

        {
            countryCode:"AU",
            name:"🇦🇺 Australia"
        },

        {
            countryCode:"CA",
            name:"🇨🇦 Canada"
        }

    ];



    try {


        const response =
            await fetch(
                "https://date.nager.at/api/v3/AvailableCountries"
            );


        if (!response.ok) {

            throw new Error(
                "国一覧の取得に失敗しました"
            );

        }



        const countries =
            await response.json();



        console.log(
            "Nager.Date 国一覧取得:",
            countries.length,
            "か国"
        );



        select.innerHTML = "";



        const added =
            new Set();



        // =====================
        // 主要国追加
        // =====================

        priorityCountries.forEach(country=>{


            const option =
                document.createElement("option");


            option.value =
                country.countryCode;


            option.textContent =
                country.name;


            select.appendChild(option);



            added.add(
                country.countryCode
            );


        });




        // =====================
        // その他の国追加
        // =====================

        countries

        .sort(
            (a,b)=>
                a.name.localeCompare(b.name)
        )

        .forEach(country=>{


            if(
                added.has(
                    country.countryCode
                )
            ){

                return;

            }



            const option =
                document.createElement("option");


            option.value =
                country.countryCode;


            option.textContent =
                country.name;


            select.appendChild(option);


        });



        // 保存済み設定復元

        loadSavedHolidayCountry();



        // 変更時保存

        select.onchange =
            saveHolidayCountry;



    } catch(error) {


        console.error(
            "Nager.Date 国一覧取得エラー:",
            error
        );


    }

}




// =====================
// ページ読み込み時
// =====================

document.addEventListener(
"DOMContentLoaded",
function(){

    loadHolidayCountries();

});






// =====================
// 祝日国 保存
// =====================

function saveHolidayCountry(){


    const select =
        document.getElementById("holidayCountry");


    if(!select) return;



    const data =
        db.load();



    if(!data.settings){

        data.settings = {};

    }



    data.settings.holidayCountry =
        select.value;



    db.save(data);


}






// =====================
// 祝日国 読み込み
// =====================

function loadSavedHolidayCountry(){


    const select =
        document.getElementById("holidayCountry");


    if(!select) return;



    const data =
        db.load();



    if(
        data.settings &&
        data.settings.holidayCountry
    ){

        select.value =
            data.settings.holidayCountry;

    }


}