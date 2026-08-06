// =====================
// OpenHolidays API
// 国一覧取得
// =====================

async function loadHolidayCountries() {

    const select =
        document.getElementById("holidayCountry");

    if (!select) {
        return;
    }

    try {

        const response =
            await fetch(
                "https://openholidaysapi.org/Countries"
            );

        if (!response.ok) {
            throw new Error(
                "国一覧の取得に失敗しました"
            );
        }

        const countries =
            await response.json();

        select.innerHTML = "";

        countries.forEach(country => {

            const option =
                document.createElement("option");

            option.value =
                country.isoCode;

option.textContent =
    country.name?.[0]?.text
    || country.isoCode;
    
            select.appendChild(option);

        });

    } catch (error) {

        console.error(
            "祝日国一覧取得エラー:",
            error
        );

    }

}

document.addEventListener(
    "DOMContentLoaded",
    function(){

        loadHolidayCountries();

    }
);