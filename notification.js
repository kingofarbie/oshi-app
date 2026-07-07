console.log("notification.js 読み込み成功");


/* =====================
   通知済み管理
===================== */

let notifiedEvents = JSON.parse(
    localStorage.getItem("notifiedEvents") || "[]"
);


/* =====================
   通知初期化
===================== */

async function initNotification(){

    console.log("initNotification開始");


    if(!("Notification" in window)){

        console.log("通知非対応");

        return;

    }


    if(Notification.permission === "default"){

        await Notification.requestPermission();

    }


    if(Notification.permission !== "granted"){

        console.log("通知許可なし");

        return;

    }


    console.log("通知許可OK");


    // すぐ確認
    checkEventNotification();


    // 1分ごと確認
    setInterval(
        checkEventNotification,
        60000
    );

}




/* =====================
   通知表示
===================== */

async function sendNotification(title,body,id){

    if(
        notifiedEvents.includes(id)
    ){

        return;

    }


    const registration =
        await navigator.serviceWorker.ready;


    registration.showNotification(
        title,
        {

            body:body,

            icon:"./icon-192.png",

            badge:"./icon-192.png",

            tag:String(id),

            vibrate:[
                200,
                100,
                200
            ]

        }
    );


    notifiedEvents.push(id);


    localStorage.setItem(
        "notifiedEvents",
        JSON.stringify(notifiedEvents)
    );

}





/* =====================
   イベント確認
===================== */

function checkEventNotification(){


    const data =
        db.load();


    const events =
        data.events || [];


    const settings =
        data.settings?.notifications || {};


    const now =
        new Date();



    events.forEach(event=>{


        if(!event.start){

            return;

        }



        const start =
            new Date(event.start);



        /*
          開始通知
          開始時間ぴったり
        */

        const diff =
            (start - now) / 60000;



        if(
            diff >=0 &&
            diff <1
        ){

            sendNotification(

                "🔔 開始時間です",

                `${event.title} が始まります`,

                event.id + "_start"

            );

        }





        /*
          当日通知
        */


        if(settings.today){


            const todayTime =
                settings.todayTime || "09:00";


            const target =
                new Date(start);


            const [
                h,
                m
            ] =
            todayTime.split(":");


            target.setHours(
                Number(h),
                Number(m),
                0,
                0
            );



            const todayDiff =
                (target-now)/60000;



            if(
                todayDiff >=0 &&
                todayDiff <1
            ){

                sendNotification(

                    "📅 今日の予定",

                    `${event.title} があります`,

                    event.id + "_today"

                );

            }


        }





        /*
          前日通知
        */


        if(settings.before){


            const beforeTime =
                settings.beforeTime || "20:00";



            const target =
                new Date(start);



            target.setDate(
                target.getDate()-1
            );



            const [
                bh,
                bm
            ] =
            beforeTime.split(":");



            target.setHours(
                Number(bh),
                Number(bm),
                0,
                0
            );



            const beforeDiff =
                (target-now)/60000;



            if(
                beforeDiff >=0 &&
                beforeDiff <1
            ){


                sendNotification(

                    "🔔 明日の予定",

                    `${event.title} は明日です`,

                    event.id + "_before"

                );


            }


        }


    });


}