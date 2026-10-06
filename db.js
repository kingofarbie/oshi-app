/* =====================
   DB
===================== */
const DB_KEY = 'oshi_app_data';

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
    ]

};


const db={

load(){

    const data = localStorage.getItem(DB_KEY);

    if(data){
        return JSON.parse(data);
    }

    const defaultData = {

        settings:{
            plan:"free",
            notifications:{}
        },

        events:[],

        oshiList:[],

        categories:[],

        checklistTemplates:[]
    };

    localStorage.setItem(
        DB_KEY,
        JSON.stringify(defaultData)
    );

    return defaultData;

},


save(data){

    alert("JSON化開始");

    const json =
        JSON.stringify(data);

    alert(
        "JSON化完了：" +
        (json.length / 1024 / 1024).toFixed(2) +
        "MB"
    );

    alert("localStorage保存開始");

    try{

        localStorage.setItem(
            DB_KEY,
            json
        );

        alert("localStorage保存完了");

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

    deleteEvent(id){

        const data=this.load();

        data.events=data.events.filter(
            e=>e.id!==id
        );

        this.save(data);

    },

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

    deleteOshi(id){

        const data=this.load();

        data.oshiList=data.oshiList.filter(
            o=>o.id!==id
        );

        this.save(data);

    }

};