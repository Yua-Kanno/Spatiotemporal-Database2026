let currentRouteData = {};
let currentMapMode = 'all';

// ★学校の手順で取得したGoogle Maps Embed APIキーをここに入れてください★
// (Maps Embed APIは無料。課金設定は「キャンセル」でOK)
const GOOGLE_MAPS_API_KEY = "AIzaSyC0qAAuBpgo7dh6GhTY-tSUc6mKDCRJu9o";

window.onload = function() {
    renderSavedList();
    searchRoute(); // 初期表示でフォームの値を読み込んで検索
};

function searchRoute() {
    currentRouteData = getFormData();

    if (!currentRouteData.origin && !currentRouteData.dest && !currentRouteData.offIc && !currentRouteData.onIc) {
        alert("少なくとも1つの場所を入力してください");
        return;
    }

    renderTimeline(currentRouteData);
    renderSuggestions(currentRouteData);
    updateGoogleRouteMap(currentRouteData, currentMapMode);
}

function getFormData() {
    return {
        origin: document.getElementById('origin-input') ? document.getElementById('origin-input').value.trim() : '',
        offIc: document.getElementById('off-input') ? document.getElementById('off-input').value.trim() : '',
        viaSpot: document.getElementById('via-input') ? document.getElementById('via-input').value.trim() : '',
        onIc: document.getElementById('on-input') ? document.getElementById('on-input').value.trim() : '',
        dest: document.getElementById('dest-input') ? document.getElementById('dest-input').value.trim() : ''
    };
}

function reverseRoute() {
    const data = getFormData();
    document.getElementById('origin-input').value = data.dest;
    document.getElementById('off-input').value = data.onIc;
    document.getElementById('on-input').value = data.offIc;
    document.getElementById('dest-input').value = data.origin;

    searchRoute();
}

function searchMichiNoEki() {
    const data = getFormData();
    const target = [data.offIc, data.onIc].filter(Boolean).join(" ");

    if (!target) {
        alert("降りるICまたは乗るICを入力してください");
        return;
    }

    const query = encodeURIComponent(`${target} 周辺 道の駅 おすすめ`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
}

function switchMapTab(mode) {
    currentMapMode = mode;
    const btnAll = document.getElementById('tab-all');
    const btnLocal = document.getElementById('tab-local');

    if (mode === 'all') {
        if (btnAll) btnAll.className = "map-tab active";
        if (btnLocal) btnLocal.className = "map-tab";
    } else {
        if (btnAll) btnAll.className = "map-tab";
        if (btnLocal) btnLocal.className = "map-tab active-local";
    }

    updateGoogleRouteMap(currentRouteData, mode);
}

// 9. 地図更新ロジック（Google Maps Embed API に統一）
// 「一般道」タブ: avoid=highways で高速道路を確実に回避
// 「全体」タブ　: avoidなしの通常ルート（高速道路も使う参考ルート）
function updateGoogleRouteMap(data, mode = 'all') {
    if (!data) return;

    const iframe = document.getElementById('map-iframe');
    if (!iframe) return;

    if (mode === 'local') {
        // 🍃 【一般道モード】offIc → (viaSpot) → onIc の区間だけを高速回避で表示
        let startSpot = (data.offIc || "前橋").replace(/IC|インター/g, '');
        let endSpot = (data.onIc || "越後湯沢").replace(/IC|インター/g, '');
        if (endSpot === "湯沢") endSpot = "越後湯沢";

        let url = `https://www.google.com/maps/embed/v1/directions` +
            `?key=${GOOGLE_MAPS_API_KEY}` +
            `&origin=${encodeURIComponent(startSpot)}` +
            `&destination=${encodeURIComponent(endSpot)}` +
            `&avoid=highways`;

        if (data.viaSpot) {
            url += `&waypoints=${encodeURIComponent(data.viaSpot)}`;
        }

        iframe.src = url;

    } else {
        // 📍 【全体モード】出発〜到着までの全区間を通常ルートで表示
        let origin = data.origin || "東松山IC";
        let dest = data.dest || "新潟";
        const waypoints = [data.offIc, data.viaSpot, data.onIc].filter(Boolean);

        let url = `https://www.google.com/maps/embed/v1/directions` +
            `?key=${GOOGLE_MAPS_API_KEY}` +
            `&origin=${encodeURIComponent(origin)}` +
            `&destination=${encodeURIComponent(dest)}`;

        if (waypoints.length > 0) {
            url += `&waypoints=${waypoints.map(w => encodeURIComponent(w)).join('|')}`;
        }

        iframe.src = url;
    }
}

// タイムライン描画
function renderTimeline(data) {
    const originEl = document.getElementById('trip-origin');
    const destEl = document.getElementById('trip-destination');
    const timelineEl = document.getElementById('route-timeline');

    if (originEl) originEl.innerText = data.origin || "未設定";
    if (destEl) destEl.innerText = data.dest || "未設定";

    if (timelineEl) {
        let html = '';
        if (data.origin) html += `<li class="timeline-item"><span class="spot-name">🛣️ ① 高速乗る: ${data.origin}</span></li>`;
        if (data.offIc) html += `<li class="timeline-item"><span class="spot-name" style="color:#28a745;">🚗 ② 降りる: ${data.offIc}</span></li>`;

        if (data.viaSpot) {
            html += `
                <li style="margin: 8px 0 8px 12px; padding: 6px 10px; background: #e8f5e9; border-left: 3px solid #28a745; border-radius: 4px; font-size: 0.8rem; color: #2e7d32;">
                    🍃 <b>一般道ドライブ・立ち寄りスポット</b><br>
                    🍦 ${data.viaSpot}<br>
                    <span style="font-size:0.75rem; color:#555;">下道ドライブの休憩・お買い物</span>
                </li>
            `;
        }

        if (data.onIc) html += `<li class="timeline-item"><span class="spot-name" style="color:#28a745;">🛣️ ④ 再び乗る: ${data.onIc}</span></li>`;
        if (data.dest) html += `<li class="timeline-item"><span class="spot-name">🏁 ⑤ 到着: ${data.dest}</span></li>`;

        timelineEl.innerHTML = html || `<li class="empty-msg">まだルートが検索されていません</li>`;
    }
}

// おすすめ提案
function renderSuggestions(data) {
    const suggestionEl = document.getElementById('suggestion-area');
    if (!suggestionEl) return;

    const queryText = (data.offIc + " " + data.onIc + " " + data.origin + " " + data.dest);

    if (queryText.includes("前橋") || queryText.includes("湯沢") || queryText.includes("沼田") || queryText.includes("渋川")) {
        suggestionEl.innerHTML = `
            <div style="background:#f0f7ff; border:1px solid #b3d8ff; padding:12px; border-radius:8px;">
                <h3 style="margin:0 0 6px 0; color:#0056b3; font-size:0.95rem;">🛣️ おすすめ: 国道17号（三国峠超えルート）</h3>
                <p style="font-size:0.85rem; margin:0 0 8px 0; color:#444;">前橋〜湯沢間は、絶景＆道の駅がいっぱいの名物ドライブコースです！</p>
                <div style="font-size:0.8rem; font-weight:bold; color:#333;">📍 おすすめ立ち寄りスポット:</div>
                <ul style="margin:4px 0 0 18px; padding:0; font-size:0.85rem; color:#555;">
                    <li>道の駅 ふじみ（見晴らし抜群）</li>
                    <li>道の駅 あぐりーむ昭和</li>
                    <li>道の駅 みつまた（温泉・足湯あり）</li>
                </ul>
            </div>
        `;
    } else {
        suggestionEl.innerHTML = `<p class="empty-msg">条件に合うおすすめルートを表示します</p>`;
    }
}

function renderSavedList() {
    const listEl = document.getElementById('saved-routes-list');
    if (!listEl) return;

    const savedRoutes = JSON.parse(localStorage.getItem('saved_drive_routes') || '[]');

    if (savedRoutes.length === 0) {
        listEl.innerHTML = `<p class="empty-msg">保存されたルートはありません</p>`;
        return;
    }

    let html = '';
    savedRoutes.forEach(item => {
        const d = item.data;
        const subText = [d.origin, d.offIc, d.viaSpot, d.onIc, d.dest].filter(Boolean).join(" ➔ ");
        html += `
            <div class="saved-item">
                <div class="saved-info" onclick="loadRoute(${item.id})">
                    <div class="saved-title">📌 ${item.title}</div>
                    <div class="saved-sub">${subText}</div>
                </div>
                <button class="btn-del" onclick="deleteRoute(${item.id})">削除</button>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

function saveCurrentRoute() {
    const data = getFormData();
    if (!data.origin && !data.dest && !data.offIc && !data.onIc) {
        alert("保存するルートを入力してください");
        return;
    }

    const title = prompt("ルート名（旅のタイトル）を入力してください", `${data.origin || '出発'} ➔ ${data.dest || '到着'}`);
    if (!title) return;

    const savedRoutes = JSON.parse(localStorage.getItem('saved_drive_routes') || '[]');
    savedRoutes.unshift({ id: Date.now(), title: title, data: data });
    localStorage.setItem('saved_drive_routes', JSON.stringify(savedRoutes));

    renderSavedList();
    alert("ルートを保存しました！");
}

function loadRoute(id) {
    const savedRoutes = JSON.parse(localStorage.getItem('saved_drive_routes') || '[]');
    const route = savedRoutes.find(r => r.id === id);
    if (!route) return;

    const data = route.data;
    if (document.getElementById('origin-input')) document.getElementById('origin-input').value = data.origin || "";
    if (document.getElementById('off-input')) document.getElementById('off-input').value = data.offIc || "";
    if (document.getElementById('via-input')) document.getElementById('via-input').value = data.viaSpot || "";
    if (document.getElementById('on-input')) document.getElementById('on-input').value = data.onIc || "";
    if (document.getElementById('dest-input')) document.getElementById('dest-input').value = data.dest || "";

    searchRoute();
}

function deleteRoute(id) {
    let savedRoutes = JSON.parse(localStorage.getItem('saved_drive_routes') || '[]');
    savedRoutes = savedRoutes.filter(r => r.id !== id);
    localStorage.setItem('saved_drive_routes', JSON.stringify(savedRoutes));
    renderSavedList();
}

function clearAllSavedRoutes() {
    if (confirm("保存されたルートをすべて削除してもよろしいですか？")) {
        localStorage.removeItem('saved_drive_routes');
        renderSavedList();
    }
}

function openExternalMap() {
    const data = getFormData();
    const points = [data.origin, data.offIc, data.viaSpot, data.onIc, data.dest].filter(Boolean);

    if (points.length === 0) {
        alert("ルートを入力してから押してください");
        return;
    }

    const saddr = encodeURIComponent(points[0]);
    const daddr = encodeURIComponent(points.slice(1).join("+to:"));
    const url = `https://www.google.com/maps?saddr=${saddr}&daddr=${daddr}`;
    window.open(url, '_blank');
}

function clearRoute() {
    if (document.getElementById('origin-input')) document.getElementById('origin-input').value = "";
    if (document.getElementById('off-input')) document.getElementById('off-input').value = "";
    if (document.getElementById('via-input')) document.getElementById('via-input').value = "";
    if (document.getElementById('on-input')) document.getElementById('on-input').value = "";
    if (document.getElementById('dest-input')) document.getElementById('dest-input').value = "";

    const originEl = document.getElementById('trip-origin');
    const destEl = document.getElementById('trip-destination');
    if (originEl) originEl.innerText = "未設定";
    if (destEl) destEl.innerText = "未設定";

    const timelineEl = document.getElementById('route-timeline');
    if (timelineEl) timelineEl.innerHTML = `<li class="empty-msg">まだルートが検索されていません</li>`;

    const suggestionEl = document.getElementById('suggestion-area');
    if (suggestionEl) suggestionEl.innerHTML = `<p class="empty-msg">条件に合うおすすめルートを表示します</p>`;

    const iframe = document.getElementById('map-iframe');
    if (iframe) {
        iframe.src = "https://maps.google.com/maps?q=東松山IC&z=10&output=embed";
    }
}