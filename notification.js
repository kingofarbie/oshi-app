console.log("notification.js 読み込み成功");


/* =====================
   通知済み管理
===================== */

const NOTIFIED_KEY = "oshi_notification_history";


function getNotified(){

    return JSON.parse(
        localStorage.getItem(
            NOTIFIED_KEY
        ) || "[]"
    );

}


function saveNotified(list){

    localStorage.setItem(
        NOTIFIED_KEY,
        JSON.stringify(list)
    );

}



/* =====================
   通知許可
===================== */

async function initNotification(){

    console.log("initNotification開始");


    if(!("Notification" in window)){

        console.log(
            "通知非対応"
        );

        return;

    }


    if(Notification.permission === "default"){

        await Notification.requestPermission();

    }


    console.log(
        "通知状態:",
        Notification.permission
    );


    if(Notification.permission !== "granted"){

        return;

    }


    console.log(
        "通知許可OK"
    );


    startNotificationWatcher();

}



/* =====================
   通知送信
===================== */

async function sendNotification(
    title,
    body,
    tag
){

    const registration =
        await navigator.serviceWorker.ready;


    registration.showNotification(
        title,
        {

            body:body,

            icon:"./icon-192.png",

            badge:"./icon-192.png",

            tag:tag,

            vibrate:[
                200,
                100,
                200
            ]

        }
    );

}


/* =====================
   通知済みチェック
===================== */

function alreadyNotified(id,type){

    const list =
        getNotified();


    return list.includes(
        `${id}_${type}`
    );

}



function markNotified(id,type){

    const list =
        getNotified();


    list.push(
        `${id}_${type}`
    );


    saveNotified(list);

}



/* =====================
   通知チェック本体
===================== */

async function checkEventNotification(){


    const data =
        db.load();


    const events =
        data.events || [];


    const settings =
        data.settings.notifications || {};


    const now =
        new Date();



    events.forEach(async event=>{


        if(!event.start)
            return;



        const start =
            new Date(
                event.start
            );


        const diffMinutes =
            (start - now)
            /
            60000;



        /*
          開始前通知
        */

        const startMinutes =
            settings.startMinutes || 5;



        if(
            settings.start &&
            diffMinutes >=0 &&
            diffMinutes <= startMinutes
        ){

            if(
                !alreadyNotified(
                    event.id,
                    "start"
                )
            ){

                await sendNotification(

                    "🔔 開始前のお知らせ",

                    `${event.title} が ${startMinutes}分後に始まります`,

                    `start_${event.id}`

                );


                markNotified(
                    event.id,
                    "start"
                );

            }

        }





        /*
          当日通知
        */

        const today =
            new Date(
                start
            );


        const sameDay =
            now.getFullYear()
            === today.getFullYear()
            &&
            now.getMonth()
            === today.getMonth()
            &&
            now.getDate()
            === today.getDate();



        if(
            settings.today &&
            sameDay
        ){


            const time =
                settings.todayTime
                ||
                "09:00";


            const [
                h,
                m
            ] =
            time.split(":");


            const notifyTime =
                new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    h,
                    m
                );



            const gap =
                (now-notifyTime)
                /
                60000;



            if(
                gap >=0 &&
                gap <=5
            ){


                if(
                    !alreadyNotified(
                        event.id,
                        "today"
                    )
                ){


                    await sendNotification(

                        "📅 本日の予定",

                        `${event.title} は今日です`,

                        `today_${event.id}`

                    );


                    markNotified(
                        event.id,
                        "today"
                    );


                }

            }

        }





        /*
          前日通知
        */

        if(
            settings.before
        ){


            const before =
                new Date(start);


            before.setDate(
                before.getDate()-1
            );



            const [
                bh,
                bm
            ] =
            (
                settings.beforeTime
                ||
                "20:00"
            )
            .split(":");



            before.setHours(
                bh,
                bm,
                0,
                0
            );



            const gap =
                (now-before)
                /
                60000;



            if(
                gap >=0 &&
                gap <=5
            ){


                if(
                    !alreadyNotified(
                        event.id,
                        "before"
                    )
                ){


                    await sendNotification(

                        "📅 明日の予定",

                        `${event.title} は明日です`,

                        `before_${event.id}`

                    );


                    markNotified(
                        event.id,
                        "before"
                    );


                }

            }

        }



    });


}




/* =====================
   自動チェック開始
===================== */

function startNotificationWatcher(){

    checkEventNotification();


    setInterval(

        checkEventNotification,

        60000

    );

}