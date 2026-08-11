// =====================
// Nager.Date API
// 国一覧取得
// =====================

async function loadHolidayCountries() {

    const select =
        document.getElementById("holidayCountry");

    // 設定画面がまだ読み込まれていない場合
    if (!select) {
        return false;
    }


    // すでに読み込み済みなら何もしない
    if (
        select.dataset.loaded === "true"
    ) {
        return true;
    }


    // =====================
    // 読み込み中表示
    // =====================

    select.innerHTML = "";

    const loadingOption =
        document.createElement("option");

    loadingOption.value = "";

    loadingOption.textContent =
        "国・地域を読み込み中...";

    select.appendChild(loadingOption);

    select.disabled = true;


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

        // =====================
        // Nager.Date API
        // =====================

        const response =
            await fetch(
                "https://date.nager.at/api/v3/AvailableCountries",
                {
                    method:"GET",
                    cache:"no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }


        const countries =
            await response.json();


        if (
            !Array.isArray(countries) ||
            countries.length === 0
        ) {

            throw new Error(
                "国一覧が空です"
            );

        }


        console.log(
            "Nager.Date 国一覧取得:",
            countries.length,
            "か国"
        );


        // =====================
        // 一旦クリア
        // =====================

        select.innerHTML = "";


        const added =
            new Set();


        // =====================
        // 主要国追加
        // =====================

        priorityCountries.forEach(
            country => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    country.countryCode;

                option.textContent =
                    country.name;

                select.appendChild(
                    option
                );

                added.add(
                    country.countryCode
                );

            }
        );


        // =====================
        // その他の国
        // =====================

        countries
            .sort(
                (a,b) =>
                    a.name.localeCompare(
                        b.name
                    )
            )
            .forEach(
                country => {

                    if (
                        added.has(
                            country.countryCode
                        )
                    ) {
                        return;
                    }


                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        country.countryCode;

                    option.textContent =
                        country.name;

                    select.appendChild(
                        option
                    );

                }
            );


        // =====================
        // 保存済み設定復元
        // =====================

        loadSavedHolidayCountry();


        // =====================
        // 変更時保存
        // =====================

        select.onchange =
            saveHolidayCountry;


        // =====================
        // 読み込み完了
        // =====================

        select.disabled = false;

        select.dataset.loaded = "true";


        return true;


    } catch(error) {

        console.error(
            "Nager.Date 国一覧取得エラー:",
            error
        );


        // =====================
        // エラー表示
        // =====================

        select.innerHTML = "";

        const errorOption =
            document.createElement(
                "option"
            );

        errorOption.value = "";

        errorOption.textContent =
            "国・地域を読み込めませんでした";

        select.appendChild(
            errorOption
        );

        select.disabled = false;


        return false;

    }

}


// =====================
// 設定画面が後から生成される場合に対応
// =====================

function tryLoadHolidayCountries() {

    const select =
        document.getElementById(
            "holidayCountry"
        );


    if (!select) {

        // まだ設定画面が作られていない
        // 少し待って再確認

        setTimeout(
            tryLoadHolidayCountries,
            300
        );

        return;
    }


    loadHolidayCountries();

}


// =====================
// ページ読み込み
// =====================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        tryLoadHolidayCountries();

    }
);


// =====================
// 祝日国 保存
// =====================

function saveHolidayCountry() {

    const select =
        document.getElementById(
            "holidayCountry"
        );


    if (!select) {
        return;
    }


    const data =
        db.load();


    if (!data.settings) {

        data.settings = {};

    }


    data.settings.holidayCountry =
        select.value;


    db.save(data);

}


// =====================
// 祝日国 読み込み
// =====================

function loadSavedHolidayCountry() {

    const select =
        document.getElementById(
            "holidayCountry"
        );


    if (!select) {
        return;
    }


    const data =
        db.load();


    if (
        data.settings &&
        data.settings.holidayCountry
    ) {

        select.value =
            data.settings.holidayCountry;

    }

}