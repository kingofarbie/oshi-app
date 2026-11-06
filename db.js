
/* =====================
   DB
===================== */

const DB_KEY = 'oshi_app_data';


/* =====================
   💰 お金データ初期設定
===================== */

function createDefaultMoneyData(){

    return {

        // 収入・支出の明細
        records: [],

        // 収入・支出カテゴリ
        categories: [],

        // 月ごとの予算・設定
        monthlySettings: {},

        // 月ごとの繰越情報
        carryovers: {},

        // 繰越金額の手動調整
        adjustments: {}

    };

}


/* =====================
   初期データ
===================== */

const DEFAULT_DB = {

    settings:{

        plan:"free",

        notifications:{
            before:false,
            beforeTime:"20:00",

            today:false,
            todayTime:"09:00",

            start:false,
            startMinutes:5
        },

        checklistTemplates:[]

    },

    events:[],

    dayMemories:{},

    oshiList:[],

    categories:[
        {
            id:1,
            name:"ライブ",
            icon:"🎤"
        },
        {
            id:2,
            name:"イベント",
            icon:"🎉"
        },
        {
            id:3,
            name:"試合",
            icon:"🏆"
        }
    ],

    money:createDefaultMoneyData()

};


/* =====================
   DB本体
===================== */

const db={


    /* =====================
       データ読み込み
    ===================== */

    load(){

        const saved =
            localStorage.getItem(DB_KEY);


        // 保存データがない場合
        if(!saved){

            const defaultData =
                JSON.parse(
                    JSON.stringify(DEFAULT_DB)
                );

            localStorage.setItem(
                DB_KEY,
                JSON.stringify(defaultData)
            );

            return defaultData;

        }


        const data =
            JSON.parse(saved);


        let updated = false;


        // moneyが存在しない場合だけ追加
        if(
            !data.money ||
            typeof data.money !== "object"
        ){

            data.money =
                createDefaultMoneyData();

            updated = true;

        }else{

            const defaultMoney =
                createDefaultMoneyData();

            Object.keys(defaultMoney).forEach(key=>{

                if(
                    data.money[key] === undefined ||
                    data.money[key] === null
                ){

                    data.money[key] =
                        defaultMoney[key];

                    updated = true;

                }

            });

        }


        // 既存設定の不足項目を補完
        if(!data.settings){

            data.settings =
                JSON.parse(
                    JSON.stringify(
                        DEFAULT_DB.settings
                    )
                );

            updated = true;

        }


        // 補完した場合だけ保存
        if(updated){

            this.save(data);

        }


        return data;

    },


    /* =====================
       データ保存
    ===================== */

    save(data){

        const json =
            JSON.stringify(data);


        try{

            localStorage.setItem(
                DB_KEY,
                json
            );

        }catch(error){

            alert(
                "localStorage保存エラー\n\n" +
                "名前：" +
                error.name +
                "\n\n" +
                "内容：" +
                error.message
            );

            console.error(
                "localStorage保存エラー:",
                error
            );

        }

    },


    /* =====================
       予定追加
    ===================== */

    addEvent(event){

        const data=this.load();

        const plan=PLAN[data.settings.plan];

        if(
            plan.eventLimit!==Infinity &&
            data.events.length>=plan.eventLimit
        ){

            alert("予定件数の上限です。");

            return false;

        }

        event.id=Date.now();

        data.events.push(event);

        this.save(data);

        return true;

    },


    /* =====================
       予定更新
    ===================== */

    updateEvent(event){

        const data=this.load();

        const index=data.events.findIndex(
            e=>e.id===event.id
        );

        if(index!==-1){

            data.events[index]=event;

            this.save(data);

        }

    },


    /* =====================
       予定削除
    ===================== */

    deleteEvent(id){

        const data=this.load();

        data.events=data.events.filter(
            e=>e.id!==id
        );

        this.save(data);

    },


    /* =====================
       推し追加
    ===================== */

    addOshi(masterId){

        const data=this.load();

        const plan=PLAN[data.settings.plan];

        if(
            plan.oshiLimit!==Infinity &&
            data.oshiList.length>=plan.oshiLimit
        ){

            alert("推し登録数の上限です。");

            return false;

        }

        if(
            data.oshiList.some(
                o=>o.masterId===masterId
            )
        ){

            alert("既に登録されています。");

            return false;

        }

        data.oshiList.push({

            id:Date.now(),

            masterId:masterId

        });

        this.save(data);

        return true;

    },


    /* =====================
       推し削除
    ===================== */

    deleteOshi(id){

        const data=this.load();

        data.oshiList=data.oshiList.filter(
            o=>o.id!==id
        );

        this.save(data);

    }

};
