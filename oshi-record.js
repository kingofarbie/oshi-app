/* =====================================================
   📝 推し活記録
   oshi-record.js

   ・推しごとに記録を保存
   ・タグの保存、編集、一覧表示
   ・キーワード、種類、タグ、年月で検索
   ・新しい順 / 古い順
   ・写真、動画を IndexedDB に保存
   ・詳細画面で写真、動画をプレビュー
   ・編集画面で登録済み添付ファイルを表示
   ・添付ファイルの追加、個別削除
   ・削除は記録保存成功後に実行
   ・記録削除時に専用添付ファイルも削除
===================================================== */


/* =====================================================
   📝 記録の種類
===================================================== */

const OSHI_ACTIVITY_TYPES = {
    live: {
        label: "ライブ参加",
        fields: [
            "oshiActivityLiveDate",
            "oshiActivityLiveName",
            "oshiActivityLiveVenue",
            "oshiActivityLiveSeat",
            "oshiActivityLiveMemo"
        ]
    },
    media: {
        label: "テレビ・配信",
        fields: [
            "oshiActivityMediaName",
            "oshiActivityMediaDate",
            "oshiActivityMediaWatched",
            "oshiActivityMediaMemo"
        ]
    },
    work: {
        label: "CD・DVD・作品",
        fields: [
            "oshiActivityWorkDate",
            "oshiActivityWorkName",
            "oshiActivityWorkEdition",
            "oshiActivityWorkMemo"
        ]
    },
    goods: {
        label: "グッズ購入",
        fields: [
            "oshiActivityGoodsDate",
            "oshiActivityGoodsName",
            "oshiActivityGoodsPrice",
            "oshiActivityGoodsPlace"
        ]
    },
    trip: {
        label: "遠征",
        fields: [
            "oshiActivityTripDate",
            "oshiActivityTripDestination",
            "oshiActivityTripTransport",
            "oshiActivityTripHotel",
            "oshiActivityTripMemo"
        ]
    },
    memory: {
        label: "推し活の思い出",
        fields: [
            "oshiActivityMemoryDate",
            "oshiActivityMemoryMemo"
        ]
    },
    first: {
        label: "初めての記録",
        fields: [
            "oshiActivityFirstType",
            "oshiActivityFirstDate",
            "oshiActivityFirstMemo"
        ]
    }
};


/* =====================================================
   📎 添付ファイルの入力欄
===================================================== */

const OSHI_ACTIVITY_MEDIA_INPUTS = {
    live: "oshiActivityLivePhoto",
    goods: "oshiActivityGoodsPhoto",
    memory: "oshiActivityMemoryPhoto"
};


/* =====================================================
   📝 推しID
===================================================== */

function getOshiActivityTargetId() {
    return document
        .getElementById("oshiContainer")
        ?.dataset.oshiId || null;
}


/* =====================================================
   📝 ページ初期化
===================================================== */

async function initOshiRecordPage(oshiId) {
    const container =
        document.getElementById("oshiContainer");

    if (!container || !oshiId) return;

    const data = await db.load();

    const oshi = (data?.oshiList || []).find(
        item => item.id === oshiId
    );

    const title =
        container.querySelector("#oshiRecordTitle");

    if (title && oshi) {
        title.textContent = oshi.name + " の推し活記録";
    }

    setupOshiActivityFilters();

    const modal =
        container.querySelector("#oshiActivityModal");

    if (modal) {
        setupOshiActivityMediaInputs(modal);
    }

    await renderOshiActivityList(oshiId);
}


/* =====================================================
   🔎 検索・絞り込みのイベント設定
===================================================== */

function setupOshiActivityFilters() {
    const container =
        document.getElementById("oshiContainer");

    if (!container) return;

    const search =
        container.querySelector("#oshiActivitySearch");

    const typeFilter =
        container.querySelector("#oshiActivityFilterType");

    const tagFilter =
        container.querySelector("#oshiActivityFilterTag");

    const monthFilter =
        container.querySelector("#oshiActivityFilterMonth");

    const sortButton =
        container.querySelector("#oshiActivitySortButton");

    const clearButton =
        container.querySelector("#oshiActivityClearFilters");

    const refresh = () => {
        renderOshiActivityList(getOshiActivityTargetId());
    };

    if (search) search.oninput = refresh;
    if (typeFilter) typeFilter.onchange = refresh;
    if (tagFilter) tagFilter.onchange = refresh;
    if (monthFilter) monthFilter.onchange = refresh;

    if (sortButton) {
        if (!sortButton.dataset.sort) {
            sortButton.dataset.sort = "newest";
        }

        updateOshiActivitySortButton();

        sortButton.onclick = () => {
            sortButton.dataset.sort =
                sortButton.dataset.sort === "newest"
                    ? "oldest"
                    : "newest";

            updateOshiActivitySortButton();
            refresh();
        };
    }

    if (clearButton) {
        clearButton.onclick = () => {
            if (search) search.value = "";
            if (typeFilter) typeFilter.value = "";
            if (tagFilter) tagFilter.value = "";
            if (monthFilter) monthFilter.value = "";

            if (sortButton) {
                sortButton.dataset.sort = "newest";
            }

            updateOshiActivitySortButton();
            refresh();
        };
    }
}


/* =====================================================
   🔽 並べ替えボタン表示
===================================================== */

function updateOshiActivitySortButton() {
    const button = document.querySelector(
        "#oshiContainer #oshiActivitySortButton"
    );

    if (!button) return;

    button.textContent =
        button.dataset.sort === "oldest"
            ? "↑ 古い順"
            : "↓ 新しい順";
}


/* =====================================================
   🏷️ タグ文字列を配列にする
===================================================== */

function normalizeOshiActivityTags(value) {
    if (Array.isArray(value)) {
        value = value.join("、");
    }

    return [...new Set(
        String(value || "")
            .split(/[,、，]/)
            .map(tag => tag.trim())
            .filter(Boolean)
    )];
}


/* =====================================================
   🏷️ タグ絞り込みの選択肢を更新
===================================================== */

function updateOshiActivityTagFilter(records) {
    const select = document.querySelector(
        "#oshiContainer #oshiActivityFilterTag"
    );

    if (!select) return;

    const previousValue = select.value;

    const tags = [...new Set(
        records.flatMap(record =>
            normalizeOshiActivityTags(record.tags)
        )
    )].sort((a, b) => a.localeCompare(b, "ja"));

    select.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "すべてのタグ";
    select.appendChild(allOption);

    tags.forEach(tag => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });

    select.value = tags.includes(previousValue)
        ? previousValue
        : "";
}


/* =====================================================
   📝 種類に応じた入力欄の切り替え
===================================================== */

function updateOshiActivityTypeFields() {
    const container =
        document.getElementById("oshiContainer");

    const typeSelect =
        container?.querySelector("#oshiActivityType");

    if (!container || !typeSelect) return;

    const type = typeSelect.value;

    Object.keys(OSHI_ACTIVITY_TYPES).forEach(key => {
        const group = container.querySelector(
            "#oshiActivity" +
            key.charAt(0).toUpperCase() +
            key.slice(1) +
            "Fields"
        );

        if (group) {
            group.style.display =
                key === type ? "" : "none";
        }
    });
}


/* =====================================================
   📎 プレビュー用URLの解放
===================================================== */

function revokeOshiActivityEditPreviewURLs(modal) {
    if (!modal?._oshiActivityEditURLs) return;

    modal._oshiActivityEditURLs.forEach(url => {
        try {
            URL.revokeObjectURL(url);
        } catch (error) {
            console.warn("プレビューURLを解放できませんでした。", error);
        }
    });

    modal._oshiActivityEditURLs = [];
}


/* =====================================================
   📎 添付ファイルのプレビュー欄を準備
   HTMLへの追加は不要
===================================================== */

function setupOshiActivityMediaInputs(modal) {
    if (!modal) return;

    Object.entries(OSHI_ACTIVITY_MEDIA_INPUTS).forEach(
        ([type, inputId]) => {
            const input = modal.querySelector("#" + inputId);

            if (!input) return;

            let preview = modal.querySelector(
                "#" + inputId + "Preview"
            );

            if (!preview) {
                preview = document.createElement("div");
                preview.id = inputId + "Preview";
                preview.className =
                    "oshi-activity-edit-media-preview";

                input.parentElement.appendChild(preview);
            }

            if (input.dataset.mediaHandlerReady === "true") {
                return;
            }

            input.dataset.mediaHandlerReady = "true";

            input.addEventListener("change", () => {
                renderOshiActivityEditMedia(modal);
            });
        }
    );

    if (!modal.dataset.mediaPreviewStyleReady) {
        const style = document.createElement("style");

        style.dataset.oshiActivityMediaStyle = "true";

        style.textContent = `
.oshi-activity-edit-media-preview {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    width: 100%;
    min-width: 0;
    align-self: stretch;
    margin-top: 10px;
    box-sizing: border-box;
}                

            .oshi-activity-edit-media-item {
                min-width: 0;
                overflow: hidden;
                padding: 8px;
                border: 1px solid rgba(150, 120, 150, 0.25);
                border-radius: 12px;
                box-sizing: border-box;
            }

            .oshi-activity-edit-media-item img,
            .oshi-activity-edit-media-item video {
                display: block;
                width: 100%;
                max-width: 100%;
                max-height: 180px;
                object-fit: contain;
                border-radius: 8px;
                box-sizing: border-box;
            }

            .oshi-activity-edit-media-name {
                display: block;
                overflow-wrap: anywhere;
                margin-top: 6px;
                font-size: 12px;
            }

            .oshi-activity-edit-media-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 8px;
            }

            .oshi-activity-edit-media-actions button {
                flex: 1 1 auto;
                min-height: 34px;
                padding: 5px 8px;
                border: 1px solid rgba(150, 120, 150, 0.35);
                border-radius: 8px;
                background: var(--card-bg, #fff);
                color: inherit;
                font-size: 12px;
                cursor: pointer;
            }

            .oshi-activity-edit-media-empty {
                grid-column: 1 / -1;
                margin: 0;
                padding: 10px;
                color: var(--text-secondary, #777);
                font-size: 13px;
            }
        `;

        document.head.appendChild(style);
        modal.dataset.mediaPreviewStyleReady = "true";
    }
}


/* =====================================================
   📎 現在の編集対象メディアを取得
===================================================== */

function getOshiActivityEditingMedia(modal) {
    return Array.isArray(modal?._oshiActivityEditingMedia)
        ? modal._oshiActivityEditingMedia
        : [];
}


/* =====================================================
   📎 削除予定の添付ファイルIDを取得
===================================================== */

function getOshiActivityRemovedMediaIds(modal) {
    try {
        const ids = JSON.parse(
            modal?.dataset.removedMediaIds || "[]"
        );

        return Array.isArray(ids) ? ids : [];
    } catch {
        return [];
    }
}


/* =====================================================
   📎 削除予定の添付ファイルIDを保存
===================================================== */

function setOshiActivityRemovedMediaIds(modal, ids) {
    modal.dataset.removedMediaIds =
        JSON.stringify([...new Set(ids)]);
}


/* =====================================================
   📎 編集画面の写真・動画を表示
===================================================== */


async function renderOshiActivityEditMedia(modal) {
    if (!modal) return;

    setupOshiActivityMediaInputs(modal);

    const renderToken =
        (modal._oshiActivityMediaRenderToken || 0) + 1;

    modal._oshiActivityMediaRenderToken = renderToken;

    revokeOshiActivityEditPreviewURLs(modal);

    const type =
        modal.querySelector("#oshiActivityType")?.value || "live";

    const inputId = OSHI_ACTIVITY_MEDIA_INPUTS[type];

    const input = inputId
        ? modal.querySelector("#" + inputId)
        : null;

    const preview = inputId
        ? modal.querySelector("#" + inputId + "Preview")
        : null;

    Object.values(OSHI_ACTIVITY_MEDIA_INPUTS).forEach(id => {
        const otherPreview =
            modal.querySelector("#" + id + "Preview");

        if (otherPreview && otherPreview !== preview) {
            otherPreview.replaceChildren();
        }
    });

    if (!preview || !input) return;

    preview.replaceChildren();

    const removedIds =
        getOshiActivityRemovedMediaIds(modal);

    const existingMedia =
        getOshiActivityEditingMedia(modal).filter(
            media => !removedIds.includes(media.id)
        );

    const selectedFiles =
        Array.from(input.files || []);

    if (!existingMedia.length && !selectedFiles.length) {
        const empty = document.createElement("p");
        empty.className = "oshi-activity-edit-media-empty";
        empty.textContent =
            "登録されている写真・動画はありません。";

        preview.appendChild(empty);
        return;
    }

    /* =========================
       📐 プレビューの表示設定
    ========================= */

function setPreviewMediaStyle(element) {
    element.style.display = "block";
    element.style.width = "100%";
    element.style.height = "auto";
    element.style.maxWidth = "100%";
    element.style.maxHeight = "180px";
    element.style.minWidth = "0";
    element.style.objectFit = "contain";
    element.style.boxSizing = "border-box";
    element.style.borderRadius = "8px";
}

    /* =========================
       📷 登録済み写真・動画
    ========================= */

    for (const attachment of existingMedia) {
        if (modal._oshiActivityMediaRenderToken !== renderToken) {
            return;
        }

const item = document.createElement("div");
item.className = "oshi-activity-edit-media-item";
item.style.width = "100%";
item.style.minWidth = "0";
item.style.boxSizing = "border-box";


        try {
            const savedMedia =
                await getMediaFile(attachment.id);

            if (modal._oshiActivityMediaRenderToken !== renderToken) {
                return;
            }

            if (!savedMedia) {
                const missing = document.createElement("p");
                missing.textContent =
                    "この添付ファイルを読み込めませんでした。";

                item.appendChild(missing);
            } else {
                const url = createMediaURL(savedMedia);

                if (url) {
                    modal._oshiActivityEditURLs =
                        modal._oshiActivityEditURLs || [];

                    modal._oshiActivityEditURLs.push(url);

                    if (
                        attachment.type === "video" ||
                        savedMedia.type === "video"
                    ) {
                        const video =
                            document.createElement("video");

                        video.src = url;
                        video.controls = true;
                        video.preload = "metadata";
                        video.playsInline = true;

                        setPreviewMediaStyle(video);

                        item.appendChild(video);
                    } else {
                        const image =
                            document.createElement("img");

                        image.src = url;
                        image.alt =
                            attachment.name || "登録済みの写真";
                        image.loading = "lazy";

                        setPreviewMediaStyle(image);

                        item.appendChild(image);
                    }
                }
            }
        } catch (error) {
            console.error(
                "編集画面の添付ファイル表示に失敗しました。",
                error
            );

            const errorText = document.createElement("p");
            errorText.textContent =
                "添付ファイルを表示できませんでした。";

            item.appendChild(errorText);
        }

        const name = document.createElement("small");
        name.className = "oshi-activity-edit-media-name";
        name.textContent =
            attachment.name || "登録済みファイル";

        item.appendChild(name);

        const actions = document.createElement("div");
        actions.className = "oshi-activity-edit-media-actions";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "🗑️ この写真を削除";

        removeButton.addEventListener("click", () => {
            if (
                !confirm(
                    "この写真・動画を削除予定にしますか？\n\n" +
                    "実際の削除は、記録の保存ボタンを押した後に行われます。"
                )
            ) {
                return;
            }

            const ids =
                getOshiActivityRemovedMediaIds(modal);

            if (!ids.includes(attachment.id)) {
                ids.push(attachment.id);
            }

            setOshiActivityRemovedMediaIds(modal, ids);

            renderOshiActivityEditMedia(modal);
        });

        actions.appendChild(removeButton);
        item.appendChild(actions);
        preview.appendChild(item);
    }

    /* =========================
       🆕 追加予定の写真・動画
    ========================= */

    selectedFiles.forEach((file, index) => {
        if (modal._oshiActivityMediaRenderToken !== renderToken) {
            return;
        }

        const item = document.createElement("div");
        item.className = "oshi-activity-edit-media-item";

        const url = URL.createObjectURL(file);

        modal._oshiActivityEditURLs =
            modal._oshiActivityEditURLs || [];

        modal._oshiActivityEditURLs.push(url);

        if (file.type.startsWith("video/")) {
            const video = document.createElement("video");

            video.src = url;
            video.controls = true;
            video.preload = "metadata";
            video.playsInline = true;

            setPreviewMediaStyle(video);

            item.appendChild(video);
        } else if (file.type.startsWith("image/")) {
            const image = document.createElement("img");

            image.src = url;
            image.alt = file.name;
            image.loading = "lazy";

            setPreviewMediaStyle(image);

            item.appendChild(image);
        }

        const name = document.createElement("small");
        name.className = "oshi-activity-edit-media-name";
        name.textContent = "追加予定：" + file.name;

        item.appendChild(name);

        const actions = document.createElement("div");
        actions.className = "oshi-activity-edit-media-actions";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "追加を取り消す";

        removeButton.addEventListener("click", () => {
            const currentFiles =
                Array.from(input.files || []);

            currentFiles.splice(index, 1);

            const transfer = new DataTransfer();

            currentFiles.forEach(currentFile => {
                transfer.items.add(currentFile);
            });

            input.files = transfer.files;

            renderOshiActivityEditMedia(modal);
        });

        actions.appendChild(removeButton);
        item.appendChild(actions);
        preview.appendChild(item);
    });
}




/* =====================================================
   📝 新規記録モーダルを開く
===================================================== */

function openOshiActivityModal() {
    const container =
        document.getElementById("oshiContainer");

    const modal =
        container?.querySelector("#oshiActivityModal");

    if (!container || !modal) {
        console.error("推し活記録の入力モーダルが見つかりません。");
        return;
    }

    setupOshiActivityMediaInputs(modal);
    revokeOshiActivityEditPreviewURLs(modal);

    modal.querySelectorAll(
        "input:not([type='file']), textarea, select"
    ).forEach(control => {
        if (control.id === "oshiActivityType") {
            control.value = "live";
        } else if (control.type === "checkbox") {
            control.checked = false;
        } else {
            control.value = "";
        }
    });

    modal.querySelectorAll("input[type='file']").forEach(input => {
        input.value = "";
    });

    delete modal.dataset.editActivityId;

    modal._oshiActivityEditingMedia = [];
    modal.dataset.removedMediaIds = "[]";

    const deleteButton =
        modal.querySelector(".delete-btn");

    if (deleteButton) {
        deleteButton.style.display = "none";
    }

    const typeSelect =
        modal.querySelector("#oshiActivityType");

    if (typeSelect) {
        typeSelect.onchange = () => {
            updateOshiActivityTypeFields();
            renderOshiActivityEditMedia(modal);
        };
    }

    updateOshiActivityTypeFields();
    renderOshiActivityEditMedia(modal);

    modal.classList.add("show");
}


/* =====================================================
   📝 入力モーダルを閉じる
===================================================== */

function closeOshiActivityModal() {
    const modal = document.querySelector(
        "#oshiContainer #oshiActivityModal"
    );

    if (modal) {
        revokeOshiActivityEditPreviewURLs(modal);
        modal.classList.remove("show");
    }
}


/* =====================================================
   📝 入力欄の値を取得
===================================================== */

function getOshiActivityFormValues(type) {
    const container =
        document.getElementById("oshiContainer");

    const definition = OSHI_ACTIVITY_TYPES[type];

    if (!container || !definition) return null;

    const fields = {};

    definition.fields.forEach(id => {
        const input = container.querySelector("#" + id);

        if (!input) return;

        fields[id] = input.type === "checkbox"
            ? input.checked
            : input.value;
    });

    return fields;
}


/* =====================================================
   📎 添付ファイルを保存
===================================================== */

async function saveOshiActivityAttachments(type, recordId) {
    const container =
        document.getElementById("oshiContainer");

    if (!container) return [];

    const inputId = OSHI_ACTIVITY_MEDIA_INPUTS[type];
    const input = inputId
        ? container.querySelector("#" + inputId)
        : null;

    const savedAttachments = [];

    if (!input?.files?.length) return savedAttachments;

    for (const file of Array.from(input.files)) {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (!isImage && !(type === "memory" && isVideo)) {
            continue;
        }

        const mediaId =
            "oshi-activity-" +
            recordId + "-" +
            Date.now().toString(36) + "-" +
            Math.random().toString(36).slice(2);

        const mediaType = isVideo ? "video" : "photo";

        if (typeof saveMediaFile !== "function") {
            throw new Error(
                "media-db.js の saveMediaFile() が見つかりません。"
            );
        }

        await saveMediaFile(mediaId, file, mediaType);

        savedAttachments.push({
            id: mediaId,
            type: mediaType,
            name: file.name,
            mimeType: file.type || "",
            recordId
        });
    }

    return savedAttachments;
}


/* =====================================================
   📎 保存途中の添付ファイルを削除
===================================================== */

async function rollbackOshiActivityAttachments(attachments) {
    if (typeof deleteMediaFile !== "function") return;

    for (const media of attachments || []) {
        try {
            await deleteMediaFile(media.id);
        } catch (error) {
            console.error("添付ファイルの後片付けに失敗しました。", error);
        }
    }
}


/* =====================================================
   📝 記録を保存・更新
===================================================== */

async function saveOshiActivity() {
    const container =
        document.getElementById("oshiContainer");

    const modal =
        container?.querySelector("#oshiActivityModal");

    const oshiId = getOshiActivityTargetId();

    if (!container || !modal || !oshiId) {
        alert("推しの情報を取得できませんでした。");
        return;
    }

    const type =
        modal.querySelector("#oshiActivityType")?.value;

    if (!OSHI_ACTIVITY_TYPES[type]) {
        alert("記録の種類を選択してください。");
        return;
    }

    const fields = getOshiActivityFormValues(type);
    if (!fields) return;

    const tagsInput =
        modal.querySelector("#oshiActivityTags");

    const tags = normalizeOshiActivityTags(
        tagsInput?.value || ""
    );

    const data = await db.load();

    if (!data) {
        alert("保存データを読み込めませんでした。");
        return;
    }

    if (!data.oshiRecords) data.oshiRecords = {};

    if (!Array.isArray(data.oshiRecords[oshiId])) {
        data.oshiRecords[oshiId] = [];
    }

    const records = data.oshiRecords[oshiId];
    const editId = modal.dataset.editActivityId;
    const now = new Date().toISOString();

    let record;
    let isNew = false;
    let oldRecord = null;

    if (editId) {
        const index = records.findIndex(item => item.id === editId);

        if (index === -1) {
            alert("編集する記録が見つかりません。");
            return;
        }

        oldRecord = records[index];

        record = {
            ...oldRecord,
            type,
            fields,
            tags,
            updatedAt: now
        };
    } else {
        isNew = true;

        record = {
            id: Date.now().toString(36) +
                Math.random().toString(36).slice(2),
            oshiId,
            type,
            fields,
            tags,
            media: [],
            createdAt: now,
            updatedAt: now
        };
    }

    let newAttachments = [];

    const removedIds =
        getOshiActivityRemovedMediaIds(modal);

    try {
        // 新しく選択されたファイルを保存
        newAttachments =
            await saveOshiActivityAttachments(type, record.id);

        const existingAttachments =
            Array.isArray(record.media) ? record.media : [];

        // 削除対象を除き、新しい添付ファイルを追加
        record.media = [
            ...existingAttachments.filter(
                media => !removedIds.includes(media.id)
            ),
            ...newAttachments
        ];

        if (isNew) {
            records.push(record);
        } else {
            const index = records.findIndex(item => item.id === editId);
            records[index] = record;
        }

        await db.save(data);

    } catch (error) {
        console.error("推し活記録の保存に失敗しました。", error);

        // 新規添付ファイルのみ後片付けする。
        // 既存ファイルは削除しない。
        await rollbackOshiActivityAttachments(newAttachments);

        alert(
            "記録を保存できませんでした。\n" +
            "入力内容や通信状態を確認して、もう一度お試しください。"
        );
        return;
    }

    // 記録の保存が成功した後で、削除対象のファイルを削除
    if (
        removedIds.length &&
        typeof deleteMediaFile === "function"
    ) {
        for (const mediaId of removedIds) {
            try {
                await deleteMediaFile(mediaId);
            } catch (error) {
                console.error(
                    "削除対象の添付ファイルを削除できませんでした。",
                    error
                );
            }
        }
    }

    closeOshiActivityModal();

    await renderOshiActivityList(oshiId);
}


/* =====================================================
   📝 記録一覧
===================================================== */

async function renderOshiActivityList(oshiId) {
    const container =
        document.getElementById("oshiContainer");

    const list =
        container?.querySelector("#oshiActivityList");

    if (!container || !list || !oshiId) return;

    const data = await db.load();

    const records =
        data?.oshiRecords?.[oshiId] || [];

    list.replaceChildren();

    updateOshiActivityTagFilter(records);

    if (records.length === 0) {
        const empty = document.createElement("div");
        empty.className = "oshi-activity-empty";
        empty.textContent =
            "💖 まだ推し活記録がありません\n" +
            "ライブやグッズ購入などを記録してみましょう";
        list.appendChild(empty);
        return;
    }

    const search =
        container.querySelector("#oshiActivitySearch")
            ?.value.trim().toLocaleLowerCase("ja") || "";

    const typeFilter =
        container.querySelector("#oshiActivityFilterType")?.value || "";

    const tagFilter =
        container.querySelector("#oshiActivityFilterTag")?.value || "";

    const monthFilter =
        container.querySelector("#oshiActivityFilterMonth")?.value || "";

    const sortOrder =
        container.querySelector("#oshiActivitySortButton")
            ?.dataset.sort || "newest";

    const filtered = records.filter(record => {
        if (typeFilter && record.type !== typeFilter) {
            return false;
        }

        const tags = normalizeOshiActivityTags(record.tags);

        if (tagFilter && !tags.includes(tagFilter)) {
            return false;
        }

        if (monthFilter) {
            const date = getOshiActivityRecordDate(record);

            if (!date || !date.startsWith(monthFilter)) {
                return false;
            }
        }

        if (search) {
            const searchableText = [
                getOshiActivityRecordTitle(record),
                getOshiActivityRecordDate(record),
                getOshiActivityRecordSummary(record),
                OSHI_ACTIVITY_TYPES[record.type]?.label || "",
                ...Object.values(record.fields || {}).map(value =>
                    typeof value === "boolean"
                        ? (value ? "視聴済み" : "未視聴")
                        : String(value ?? "")
                ),
                ...tags
            ].join(" ").toLocaleLowerCase("ja");

            if (!searchableText.includes(search)) {
                return false;
            }
        }

        return true;
    });

    filtered.sort((a, b) => {
        const dateA =
            getOshiActivityRecordDate(a) || a.createdAt || "";

        const dateB =
            getOshiActivityRecordDate(b) || b.createdAt || "";

        const comparison = dateA.localeCompare(dateB);

        return sortOrder === "oldest"
            ? comparison
            : -comparison;
    });

    if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "oshi-activity-empty";
        empty.textContent =
            "🔎 条件に合う記録がありません。\n" +
            "検索語や絞り込み条件を変更してみてください。";
        list.appendChild(empty);
        return;
    }

    const icons = {
        live: "🎤",
        media: "📺",
        work: "💿",
        goods: "🛍️",
        trip: "✈️",
        memory: "💖",
        first: "🌟"
    };

    filtered.forEach(record => {
        const card = document.createElement("article");
        card.className = "oshi-activity-card";

        const main = document.createElement("button");
        main.type = "button";
        main.className = "oshi-activity-main";
        main.setAttribute(
            "aria-label",
            getOshiActivityRecordTitle(record) + " の詳細を見る"
        );

        const icon = document.createElement("span");
        icon.className = "oshi-activity-card-icon";
        icon.textContent = icons[record.type] || "💖";

        const info = document.createElement("span");
        info.className = "oshi-activity-card-info";

        const title = document.createElement("strong");
        title.className = "oshi-activity-card-title";
        title.textContent = getOshiActivityRecordTitle(record);

        const date = document.createElement("span");
        date.className = "oshi-activity-date";
        date.textContent = getOshiActivityRecordDate(record);

        const summary = document.createElement("span");
        summary.className = "oshi-activity-summary";
        summary.textContent = getOshiActivityRecordSummary(record);

        info.append(title, date);

        if (summary.textContent) {
            info.appendChild(summary);
        }

        main.append(icon, info);

        const arrow = document.createElement("span");
        arrow.className = "oshi-activity-card-arrow";
        arrow.textContent = "›";
        arrow.setAttribute("aria-hidden", "true");
        main.appendChild(arrow);

        main.addEventListener("click", () => {
            showOshiActivityDetail(record);
        });

        const tags = normalizeOshiActivityTags(record.tags);

        if (tags.length) {
            const tagList = document.createElement("div");
            tagList.className = "oshi-activity-card-tags";

            tags.forEach(tag => {
                const chip = document.createElement("span");
                chip.className = "oshi-activity-tag";
                chip.textContent = "🏷️ " + tag;
                tagList.appendChild(chip);
            });

            card.appendChild(tagList);
        }

        const actions = document.createElement("div");
        actions.className = "oshi-activity-card-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "oshi-activity-action";
        editButton.textContent = "✏️";
        editButton.title = "記録を編集";
        editButton.setAttribute("aria-label", "記録を編集");
        editButton.addEventListener("click", event => {
            event.stopPropagation();
            editOshiActivity(record.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className =
            "oshi-activity-action oshi-activity-delete";
        deleteButton.textContent = "✕";
        deleteButton.title = "記録を削除";
        deleteButton.setAttribute("aria-label", "記録を削除");
        deleteButton.addEventListener("click", event => {
            event.stopPropagation();
            deleteOshiActivityById(record.id);
        });

        actions.append(editButton, deleteButton);
        card.append(main, actions);
        list.appendChild(card);
    });
}


/* =====================================================
   💖 記録の詳細表示
===================================================== */

async function showOshiActivityDetail(record) {
    const container =
        document.getElementById("oshiContainer");

    if (!container || !record) return;

    let modal =
        container.querySelector("#oshiActivityDetailModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "oshiActivityDetailModal";
        modal.className = "oshi-activity-detail-overlay";

        const panel = document.createElement("section");
        panel.className = "oshi-activity-detail-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");
        panel.setAttribute("aria-labelledby", "oshiActivityDetailTitle");

        const header = document.createElement("div");
        header.className = "oshi-activity-detail-header";

        const heading = document.createElement("h3");
        heading.id = "oshiActivityDetailTitle";

        const close = document.createElement("button");
        close.type = "button";
        close.className = "oshi-activity-detail-close";
        close.textContent = "✕";
        close.title = "閉じる";

        const closeDetail = () => {
            revokeOshiActivityDetailURLs(modal);
            modal.classList.remove("show");
        };

        close.addEventListener("click", closeDetail);

        header.append(heading, close);

        const body = document.createElement("div");
        body.id = "oshiActivityDetailBody";
        body.className = "oshi-activity-detail-body";

        panel.append(header, body);
        modal.appendChild(panel);

        modal.addEventListener("click", event => {
            if (event.target === modal) closeDetail();
        });

        container.appendChild(modal);
    }

    revokeOshiActivityDetailURLs(modal);

    const heading =
        modal.querySelector("#oshiActivityDetailTitle");

    const body =
        modal.querySelector("#oshiActivityDetailBody");

    const fields = record.fields || {};

    const labels = {
        oshiActivityLiveDate: "日付",
        oshiActivityLiveName: "ライブ名",
        oshiActivityLiveVenue: "会場",
        oshiActivityLiveSeat: "座席",
        oshiActivityLiveMemo: "感想・メモ",
        oshiActivityMediaName: "番組名",
        oshiActivityMediaDate: "放送日",
        oshiActivityMediaWatched: "視聴状況",
        oshiActivityMediaMemo: "感想・メモ",
        oshiActivityWorkDate: "購入日",
        oshiActivityWorkName: "作品名",
        oshiActivityWorkEdition: "仕様",
        oshiActivityWorkMemo: "感想・メモ",
        oshiActivityGoodsDate: "購入日",
        oshiActivityGoodsName: "商品",
        oshiActivityGoodsPrice: "金額",
        oshiActivityGoodsPlace: "購入場所",
        oshiActivityTripDate: "日程",
        oshiActivityTripDestination: "行き先",
        oshiActivityTripTransport: "交通費",
        oshiActivityTripHotel: "宿泊費",
        oshiActivityTripMemo: "感想",
        oshiActivityMemoryDate: "日付",
        oshiActivityMemoryMemo: "コメント",
        oshiActivityFirstType: "種類",
        oshiActivityFirstDate: "日付",
        oshiActivityFirstMemo: "メモ"
    };

    heading.textContent = getOshiActivityRecordTitle(record);
    body.replaceChildren();

    const typeBadge = document.createElement("span");
    typeBadge.className = "oshi-activity-detail-type";
    typeBadge.textContent =
        OSHI_ACTIVITY_TYPES[record.type]?.label || "推し活記録";
    body.appendChild(typeBadge);

    const tags = normalizeOshiActivityTags(record.tags);

    if (tags.length) {
        const tagRow = document.createElement("div");
        tagRow.className = "oshi-activity-detail-row";

        const label = document.createElement("div");
        label.className = "oshi-activity-detail-label";
        label.textContent = "🏷️ タグ";

        const value = document.createElement("div");
        value.className = "oshi-activity-detail-value";
        value.textContent = tags.join("、");

        tagRow.append(label, value);
        body.appendChild(tagRow);
    }

    Object.entries(fields).forEach(([id, value]) => {
        if (value === "" || value === null || value === undefined) {
            return;
        }

        const row = document.createElement("div");
        row.className = "oshi-activity-detail-row";

        const label = document.createElement("div");
        label.className = "oshi-activity-detail-label";
        label.textContent = labels[id] || id;

        const text = document.createElement("div");
        text.className = "oshi-activity-detail-value";

        if (id === "oshiActivityMediaWatched") {
            text.textContent = value ? "視聴済み" : "未視聴";
        } else if (id === "oshiActivityFirstType") {
            const select =
                container.querySelector("#oshiActivityFirstType");

            const option = Array.from(select?.options || [])
                .find(item => item.value === value);

            text.textContent = option?.textContent || String(value);
        } else {
            text.textContent = String(value);
        }

        row.append(label, text);
        body.appendChild(row);
    });

    const attachments =
        Array.isArray(record.media) ? record.media : [];

    if (attachments.length) {
        const mediaSection = document.createElement("section");
        mediaSection.className = "oshi-activity-detail-media";

        const mediaHeading = document.createElement("h4");
        mediaHeading.textContent = "📷 写真・動画";
        mediaSection.appendChild(mediaHeading);

        const mediaGrid = document.createElement("div");
        mediaGrid.className = "oshi-activity-detail-media-grid";
        mediaSection.appendChild(mediaGrid);
        body.appendChild(mediaSection);

        for (const attachment of attachments) {
            const item = document.createElement("div");
            item.className = "oshi-activity-detail-media-item";

            try {
                if (
                    typeof getMediaFile !== "function" ||
                    typeof createMediaURL !== "function"
                ) {
                    throw new Error("メディア保存機能を利用できません。");
                }

                const savedMedia = await getMediaFile(attachment.id);

                if (!savedMedia) {
                    const missing = document.createElement("p");
                    missing.textContent =
                        "添付ファイルを読み込めませんでした。";
                    item.appendChild(missing);
                    mediaGrid.appendChild(item);
                    continue;
                }

                const url = createMediaURL(savedMedia);

                if (!url) {
                    throw new Error("プレビューURLを作成できません。");
                }

                modal._oshiActivityObjectURLs =
                    modal._oshiActivityObjectURLs || [];

                modal._oshiActivityObjectURLs.push(url);

                if (
                    attachment.type === "video" ||
                    savedMedia.type === "video"
                ) {
                    const video = document.createElement("video");
                    video.src = url;
                    video.controls = true;
                    video.preload = "metadata";
                    video.playsInline = true;
                    video.className = "oshi-activity-detail-video";
                    item.appendChild(video);
                } else {
                    const image = document.createElement("img");
                    image.src = url;
                    image.alt = attachment.name || "推し活記録の写真";
                    image.loading = "lazy";
                    image.className = "oshi-activity-detail-image";
                    item.appendChild(image);
                }

                if (attachment.name) {
                    const name = document.createElement("small");
                    name.textContent = attachment.name;
                    item.appendChild(name);
                }
            } catch (error) {
                console.error("添付ファイルの表示に失敗しました。", error);

                const errorText = document.createElement("p");
                errorText.textContent =
                    "添付ファイルを表示できませんでした。";
                item.appendChild(errorText);
            }

            mediaGrid.appendChild(item);
        }
    }

    modal.classList.add("show");
}


/* =====================================================
   📎 詳細画面のオブジェクトURLを解放
===================================================== */

function revokeOshiActivityDetailURLs(modal) {
    if (!modal?._oshiActivityObjectURLs) return;

    modal._oshiActivityObjectURLs.forEach(url => {
        try {
            URL.revokeObjectURL(url);
        } catch (error) {
            console.warn("プレビューURLの解放に失敗しました。", error);
        }
    });

    modal._oshiActivityObjectURLs = [];
}


/* =====================================================
   🗑️ 記録に紐づく添付ファイルを削除
===================================================== */

async function deleteOshiActivityAttachments(record) {
    if (typeof deleteMediaFile !== "function") return;

    const attachments =
        Array.isArray(record?.media) ? record.media : [];

    for (const attachment of attachments) {
        try {
            await deleteMediaFile(attachment.id);
        } catch (error) {
            console.error("添付ファイルを削除できませんでした。", error);
        }
    }
}


/* =====================================================
   🗑️ 一覧から記録を削除
===================================================== */

async function deleteOshiActivityById(activityId) {
    const oshiId = getOshiActivityTargetId();

    if (!oshiId || !activityId) return;

    if (!confirm("この推し活記録を削除しますか？")) return;

    const data = await db.load();
    const records = data?.oshiRecords?.[oshiId];

    if (!Array.isArray(records)) return;

    const record = records.find(item => item.id === activityId);

    if (!record) return;

    data.oshiRecords[oshiId] =
        records.filter(item => item.id !== activityId);

    try {
        await db.save(data);
    } catch (error) {
        console.error("記録の削除に失敗しました。", error);
        alert("記録を削除できませんでした。");
        return;
    }

    await deleteOshiActivityAttachments(record);

    const detailModal = document.querySelector(
        "#oshiContainer #oshiActivityDetailModal"
    );

    if (detailModal) {
        revokeOshiActivityDetailURLs(detailModal);
        detailModal.classList.remove("show");
    }

    await renderOshiActivityList(oshiId);
}


/* =====================================================
   📝 記録タイトル
===================================================== */

function getOshiActivityRecordTitle(record) {
    const fields = record.fields || {};

    const titleFields = {
        live: "oshiActivityLiveName",
        media: "oshiActivityMediaName",
        work: "oshiActivityWorkName",
        goods: "oshiActivityGoodsName",
        trip: "oshiActivityTripDestination",
        memory: "oshiActivityMemoryMemo",
        first: "oshiActivityFirstType"
    };

    const value = fields[titleFields[record.type]];

    if (record.type === "first") {
        const select = document.querySelector(
            "#oshiContainer #oshiActivityFirstType"
        );

        const option = Array.from(select?.options || [])
            .find(item => item.value === value);

        if (option?.textContent) {
            return "初めて： " + option.textContent;
        }
    }

    if (record.type === "memory" && value) {
        return String(value).slice(0, 45);
    }

    return value ||
        OSHI_ACTIVITY_TYPES[record.type]?.label ||
        "推し活記録";
}


/* =====================================================
   📝 記録の日付
===================================================== */

function getOshiActivityRecordDate(record) {
    const fields = record.fields || {};

    const dateFields = [
        "oshiActivityLiveDate",
        "oshiActivityMediaDate",
        "oshiActivityWorkDate",
        "oshiActivityGoodsDate",
        "oshiActivityTripDate",
        "oshiActivityMemoryDate",
        "oshiActivityFirstDate"
    ];

    for (const id of dateFields) {
        if (fields[id]) return fields[id];
    }

    return "";
}


/* =====================================================
   📝 一覧用の概要
===================================================== */

function getOshiActivityRecordSummary(record) {
    const fields = record.fields || {};

    const summaryFields = {
        live: [
            "oshiActivityLiveVenue",
            "oshiActivityLiveSeat"
        ],
        media: [
            "oshiActivityMediaMemo"
        ],
        work: [
            "oshiActivityWorkEdition"
        ],
        goods: [
            "oshiActivityGoodsPlace",
            "oshiActivityGoodsPrice"
        ],
        trip: [
            "oshiActivityTripTransport",
            "oshiActivityTripHotel"
        ],
        memory: [
            "oshiActivityMemoryDate"
        ],
        first: [
            "oshiActivityFirstMemo"
        ]
    };

    return (summaryFields[record.type] || [])
        .map(id => fields[id])
        .filter(value =>
            value !== undefined &&
            value !== null &&
            value !== ""
        )
        .join(" ・ ");
}


/* =====================================================
   📝 記録を編集
===================================================== */

async function editOshiActivity(activityId) {
    const container =
        document.getElementById("oshiContainer");

    const modal =
        container?.querySelector("#oshiActivityModal");

    const oshiId = getOshiActivityTargetId();

    if (!container || !modal || !oshiId) return;

    setupOshiActivityMediaInputs(modal);

    const data = await db.load();
    const records = data?.oshiRecords?.[oshiId] || [];

    const record = records.find(item => item.id === activityId);

    if (!record) {
        alert("記録が見つかりません。");
        return;
    }

    revokeOshiActivityEditPreviewURLs(modal);

    const typeSelect =
        modal.querySelector("#oshiActivityType");

    if (typeSelect) {
        typeSelect.value = record.type;

        typeSelect.onchange = () => {
            updateOshiActivityTypeFields();
            renderOshiActivityEditMedia(modal);
        };
    }

    const fields = record.fields || {};

    Object.keys(OSHI_ACTIVITY_TYPES).forEach(type => {
        OSHI_ACTIVITY_TYPES[type].fields.forEach(id => {
            const input = modal.querySelector("#" + id);

            if (!input) return;

            if (input.type === "checkbox") {
                input.checked = Boolean(fields[id]);
            } else {
                input.value = fields[id] ?? "";
            }
        });
    });

    const tagsInput =
        modal.querySelector("#oshiActivityTags");

    if (tagsInput) {
        tagsInput.value = normalizeOshiActivityTags(
            record.tags
        ).join("、");
    }

    modal.querySelectorAll("input[type='file']").forEach(input => {
        input.value = "";
    });

    modal._oshiActivityEditingMedia =
        Array.isArray(record.media)
            ? record.media.map(media => ({ ...media }))
            : [];

    modal.dataset.removedMediaIds = "[]";
    modal.dataset.editActivityId = record.id;

    const deleteButton =
        modal.querySelector(".delete-btn");

    if (deleteButton) {
        deleteButton.style.display = "";
    }

    updateOshiActivityTypeFields();

    await renderOshiActivityEditMedia(modal);

    modal.classList.add("show");
}


/* =====================================================
   🗑️ 編集モーダルから記録を削除
===================================================== */

async function deleteOshiActivity() {
    const modal = document.querySelector(
        "#oshiContainer #oshiActivityModal"
    );

    const activityId = modal?.dataset.editActivityId;

    if (!modal || !activityId) return;

    await deleteOshiActivityById(activityId);

    // 削除確認をキャンセルした場合はモーダルを閉じない。
    const oshiId = getOshiActivityTargetId();
    const data = await db.load();
    const records = data?.oshiRecords?.[oshiId] || [];

    if (!records.some(item => item.id === activityId)) {
        closeOshiActivityModal();
    }
}