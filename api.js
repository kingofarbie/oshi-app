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

    // 既存の選択肢をクリア
    select.innerHTML = "";

    // 初期表示
    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        "国を選択してください";

    select.appendChild(defaultOption);


    // 国一覧
    countries.forEach(country => {

        const option =
            document.createElement("option");

        option.value =
            country.countryCode;

        option.textContent =
            country.name;

        select.appendChild(option);

    });


    console.log(
        "Nager.Date 国一覧取得:",
        countries.length,
        "か国"
    );

} catch (error) {

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
function() {

    loadHolidayCountries();

}

);