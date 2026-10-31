
// =====================
// Nager.Date
// 祝日取得
// =====================

let holidayData = [];

// 年・国ごとの祝日キャッシュ
const holidayCache = new Map();


// =====================
// 指定年・指定国の祝日取得
// =====================

async function loadHolidays(
    year,
    countryCode
){

    if(
        !year ||
        !countryCode
    ){

        return [];

    }

    // =====================
    // キャッシュ確認
    // =====================

    const cacheKey =
        `${year}_${countryCode}`;

    if(holidayCache.has(cacheKey)){

        holidayData =
            holidayCache.get(cacheKey);

        return holidayData;

    }

    try {

        const response =
            await fetch(
                `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
            );

        if(!response.ok){

            throw new Error(
                "祝日取得失敗"
            );

        }

        const holidays =
            await response.json();

        // =====================
        // 取得成功時のみキャッシュ
        // =====================

        holidayCache.set(
            cacheKey,
            holidays
        );

        holidayData =
            holidays;

        return holidays;

    }catch(error){

        console.error(
            "祝日取得エラー:",
            error
        );

        holidayData = [];

        return [];

    }

}


// =====================
// 指定日の祝日取得
// =====================

function getHoliday(
    date
){

    return holidayData.find(
        holiday =>
            holiday.date === date
    );

}
