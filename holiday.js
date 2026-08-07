// =====================
// Nager.Date
// 祝日取得
// =====================


let holidayData = [];



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



        holidayData =
            holidays;



        console.log(
            "祝日取得:",
            countryCode,
            year,
            holidays
        );



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