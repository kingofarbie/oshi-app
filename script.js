const DB_KEY = 'oshi_app_data';

let oshiMaster = {
    artists: [],
    sports: []
};

let selectedOshiId = null;

/* =====================
   DB
===================== */

const db = {

    load() {

        const data =
            localStorage.getItem(DB_KEY);

        return data
            ? JSON.parse(data)
            : {
                settings: {
                    plan: 'free'
                },
                oshiList: [],
                events: []
            };
    },

    save(data) {

        localStorage.setItem(
            DB_KEY,
            JSON.stringify(data)
        );
    },

    addOshi(masterId) {

        const data = this.load();

        if (
            data.settings.plan === 'free' &&
            data.oshiList.length >= 3
        ) {

            alert('無料版は3件までです');
            return false;
        }

        const exists =
            data.oshiList.some(
                o => o.masterId === masterId
            );

        if (exists) {

            alert('既に登録されています');
            return false;
        }

        data.oshiList.push({
            id: Date.now(),
            masterId
        });

        this.save(data);

        return true;
    },

    deleteOshi(id) {

        const data = this.load();

        data.oshiList =
            data.oshiList.filter(
                o => o.id !== id
            );

        this.save(data);
    }
};

/* =====================
   推しマスタ読込
===================== */

async function loadMaster() {

    try {

        const response =
            await fetch('./oshi-master.json');

        oshiMaster =
            await response.json();

    } catch (error) {

        console.error(
            '推しマスタ読込失敗',
            error
        );
    }
}

/* =====================
   タブ切替
===================== */

function switchTab(pageId, event) {

    document
        .querySelectorAll('.page')
        .forEach(page =>
            page.classList.remove('active')
        );

    document
        .getElementById(pageId)
        .classList.add('active');

    document
        .querySelectorAll('.tab')
        .forEach(tab =>
            tab.classList.remove('active')
        );

    event.currentTarget
        .classList.add('active');
}

/* =====================
   候補表示
===================== */

function showCandidates() {

    const category =
        document.getElementById(
            'category-select'
        ).value;

    const results =
        document.getElementById(
            'search-results'
        );

    const list =
        oshiMaster[category] || [];

    results.innerHTML =
        list.map(oshi => `

<div
class="master-item"
onclick="selectOshi(${oshi.id}, '${oshi.name.replace(/'/g,"\\'")}')">

${oshi.name}

</div>

`).join('');
}

/* =====================
   検索
===================== */

function searchOshi() {

    const category =
        document.getElementById(
            'category-select'
        ).value;

    const keyword =
        document.getElementById(
            'oshi-search'
        )
        .value
        .trim()
        .toLowerCase();

    const results =
        document.getElementById(
            'search-results'
        );

    const list =
        oshiMaster[category] || [];

    const matched =
        keyword === ''
        ? list
        : list.filter(
            o =>
                o.name
                .toLowerCase()
                .includes(keyword)
        );

    results.innerHTML =
        matched.map(oshi => `

<div
class="master-item"
onclick="selectOshi(${oshi.id}, '${oshi.name.replace(/'/g,"\\'")}')">

${oshi.name}

</div>

`).join('');
}

/* =====================
   候補選択
===================== */

function selectOshi(id, name) {

    selectedOshiId = id;

    document
        .getElementById(
            'oshi-search'
        )
        .value = name;
}

/* =====================
   追加ボタン
===================== */

function addSelectedOshi() {

    if (!selectedOshiId) {

        alert('推しを選択してください');
        return;
    }

    const success =
        db.addOshi(selectedOshiId);

    if (!success) return;

    selectedOshiId = null;

    document
        .getElementById(
            'oshi-search'
        )
        .value = '';

    document
        .getElementById(
            'search-results'
        )
        .innerHTML = '';

    displayOshiList();
}

/* =====================
   マスタ検索
===================== */

function findMasterById(id) {

    const all = [

        ...oshiMaster.artists,
        ...oshiMaster.sports

    ];

    return all.find(
        o => o.id === id
    );
}

/* =====================
   削除
===================== */

function deleteOshi(id, name) {

    const ok = confirm(
        `「${name}」を削除しますか？`
    );

    if (!ok) return;

    db.deleteOshi(id);

    displayOshiList();
}

/* =====================
   推し一覧
===================== */

function displayOshiList() {

    const data = db.load();

    const html =
        data.oshiList.map(item => {

            const oshi =
                findMasterById(
                    item.masterId
                );

            if (!oshi) return '';

            return `

<div class="item oshi-item">

    <div class="oshi-info">

        <div class="oshi-name">
            ${oshi.name}
        </div>

        ${
            oshi.website
            ? `<div class="oshi-link">🌐 HP</div>`
            : ''
        }

        ${
            oshi.instagram
            ? `<div class="oshi-link">📷 Instagram</div>`
            : ''
        }

        ${
            oshi.x
            ? `<div class="oshi-link">𝕏 X</div>`
            : ''
        }

    </div>

    <div class="oshi-actions">

        <button
            class="icon-btn delete-btn"
            onclick="deleteOshi(
                ${item.id},
                '${oshi.name.replace(/'/g,"\\'")}'
            )">

            ✕

        </button>

    </div>

</div>

`;

        }).join('');

    document
        .getElementById(
            'oshi-list'
        )
        .innerHTML =
            html || '該当なし';
}

/* =====================
   イベント
===================== */

function displayEvents() {

    document.getElementById(
        'today-events'
    ).innerHTML = '該当なし';

    document.getElementById(
        'today-schedule'
    ).innerHTML = '該当なし';

    document.getElementById(
        'this-week-schedule'
    ).innerHTML = '該当なし';

    document.getElementById(
        'next-week-schedule'
    ).innerHTML = '該当なし';
}

/* =====================
   起動
===================== */

window.onload = async function() {

    await loadMaster();

    displayEvents();

    displayOshiList();

    document
        .getElementById(
            'oshi-search'
        )
        .addEventListener(
            'focus',
            showCandidates
        );

    document
        .getElementById(
            'oshi-search'
        )
        .addEventListener(
            'input',
            searchOshi
        );

    document
        .getElementById(
            'category-select'
        )
        .addEventListener(
            'change',
            () => {

                selectedOshiId = null;

                document
                    .getElementById(
                        'oshi-search'
                    )
                    .value = '';

                showCandidates();
            }
        );
};