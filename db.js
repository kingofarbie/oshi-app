
/* =====================
   DB
===================== */

const DB_KEY = 'oshi_app_data';


/* =====================
   💰 お金カテゴリ初期設定
===================== */

function createDefaultMoneyCategories(){

    return [

        // 収入
        {
            id:"income_salary",
            type:"income",
            name:"給与",
            icon:"💼",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"income_temporary",
            type:"income",
            name:"臨時収入",
            icon:"💰",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"income_side",
            type:"income",
            name:"副収入",
            icon:"✨",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"income_other",
            type:"income",
            name:"その他",
            icon:"📦",
            scope:"household",
            isDefault:true,
            active:true
        },


        // 支出
        {
            id:"expense_food",
            type:"expense",
            name:"食費",
            icon:"🍚",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"expense_daily",
            type:"expense",
            name:"日用品",
            icon:"🧻",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"expense_utility",
            type:"expense",
            name:"光熱費",
            icon:"💡",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"expense_communication",
            type:"expense",
            name:"通信費",
            icon:"📱",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"expense_transport",
            type:"expense",
            name:"交通費",
            icon:"🚃",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"expense_medical",
            type:"expense",
            name:"医療費",
            icon:"🏥",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"expense_social",
            type:"expense",
            name:"交際費",
            icon:"🎁",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"expense_entertainment",
            type:"expense",
            name:"娯楽費",
            icon:"🎮",
            scope:"household",
            isDefault:true,
            active:true
        },
        {
            id:"expense_oshi",
            type:"expense",
            name:"推し活費",
            icon:"💖",
            scope:"oshi",
            isDefault:true,
            active:true
        },
        {
            id:"expense_other",
            type:"expense",
            name:"その他",
            icon:"📦",
            scope:"household",
            isDefault:true,
            active:true
        }

    ];

}


/* =====================
   ⭐ 推し活費の内訳
===================== */

function createDefaultOshiCategories(){

    return [

        {
            id:"oshi_goods",
            name:"グッズ",
            icon:"🛍️",
            isDefault:true,
            active:true
        },
        {
            id:"oshi_live",
            name:"ライブ",
            icon:"🎤",
            isDefault:true,
            active:true
        },
        {
            id:"oshi_ticket",
            name:"チケット",
            icon:"🎫",
            isDefault:true,
            active:true
        },
        {
            id:"oshi_transport",
            name:"交通費",
            icon:"🚃",
            isDefault:true,
            active:true
        },
        {
            id:"oshi_hotel",
            name:"宿泊費",
            icon:"🏨",
            isDefault:true,
            active:true
        },
        {
            id:"oshi_fc",
            name:"ファンクラブ",
            icon:"💌",
            isDefault:true,
            active:true
        },
        {
            id:"oshi_streaming",
            name:"配信・映像",
            icon:"📺",
            isDefault:true,
            active:true
        },
        {
            id:"oshi_other",
            name:"その他",
            icon:"⭐",
            isDefault:true,
            active:true
        }

    ];

}


/* =====================
   💰 お金データ初期設定
===================== */

function createDefaultMoneyData(){

    return {

        records:[],

        categories:
            createDefaultMoneyCategories(),

        oshiCategories:
            createDefaultOshiCategories(),

        monthlySettings:{},

        carryovers:{},

        adjustments:{},

        categorySetupVersion:1

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

        // moneyが存在しない場合
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

            // 不足項目を補完
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

            // 空のカテゴリ一覧を補完
            if(
                !Array.isArray(data.money.categories) ||
                data.money.categories.length === 0
            ){

                data.money.categories =
                    createDefaultMoneyCategories();

                updated = true;
            }

            // 空の推し活費内訳を補完
            if(
                !Array.isArray(data.money.oshiCategories) ||
                data.money.oshiCategories.length === 0
            ){

                data.money.oshiCategories =
                    createDefaultOshiCategories();

                updated = true;
            }

            // 初回設定バージョン
            if(
                !data.money.categorySetupVersion
            ){

                data.money.categorySetupVersion = 1;

                updated = true;
            }

        }

        // settingsがない場合
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
