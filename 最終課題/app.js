window.onload = function() {
    // 起動時に保存済みリストを描画（検索フォーム自体はリロードで初期化）
    renderSavedList();
};

// 1. ルートを検索
function searchRoute() {
    const routeData = getFormData();

    if (!routeData.origin && !routeData.dest && !routeData.offIc && !routeData.onIc) {
        alert("少なくとも1つの場所を入力してください");
        return;
    }

    renderTimeline(routeData);
    renderSuggestions(routeData);
    updateGoogleRouteMap(routeData);
}

// フォームから入力値を取得
function getFormData() {
    return {
        origin: document.getElementById('origin-input').value.trim(),
        offIc: document.getElementById('off-input').value.trim(),
        onIc: document.getElementById('on-input').value.trim(),
        dest: document.getElementById('dest-input').value.trim()
    };
}

// 2. 現在の入力ルートを名前付きで保存
function saveCurrentRoute() {
    const data = getFormData();
    if (!data.origin && !data.dest && !data.offIc && !data.onIc) {
        alert("保存するルートを入力してください");
        return;
    }

    const title = prompt("ルート名（旅のタイトル）を入力してください", `${data.origin || '出発'} ➔ ${data.dest || '到着'}`);
    if (!title) return; // キャンセルされた場合

    const savedRoutes = JSON.parse(localStorage.getItem('saved_drive_routes') || '[]');
    
    const newRoute = {
        id: Date.now(),
        title: title,
        data: data
    };

    savedRoutes.unshift(newRoute); // 新しいものを先頭に追加
    localStorage.setItem('saved_drive_routes', JSON.stringify(savedRoutes));

    renderSavedList();
    alert("ルートを保存しました！");
}

// 3. 保存済みリストを表示
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
        const subText = [d.origin, d.offIc, d.onIc, d.dest].filter(Boolean).join(" ➔ ");
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

// 4. 保存リストから選択して読み込み＆即検索
function loadRoute(id) {
    const savedRoutes = JSON.parse(localStorage.getItem('saved_drive_routes') || '[]');
    const route = savedRoutes.find(r => r.id === id);
    if (!route) return;

    const data = route.data;
    document.getElementById('origin-input').value = data.origin || "";
    document.getElementById('off-input').value = data.offIc || "";
    document.getElementById('on-input').value = data.onIc || "";
    document.getElementById('dest-input').value = data.dest || "";

    searchRoute(); // 検索・地図反映を同時実行
}

// 5. 個別削除
function deleteRoute(id) {
    let savedRoutes = JSON.parse(localStorage.getItem('saved_drive_routes') || '[]');
    savedRoutes = savedRoutes.filter(r => r.id !== id);
    localStorage.setItem('saved_drive_routes', JSON.stringify(savedRoutes));
    renderSavedList();
}

// 6. 全削除
function clearAllSavedRoutes() {
    if (confirm("保存されたルートをすべて削除してもよろしいですか？")) {
        localStorage.removeItem('saved_drive_routes');
        renderSavedList();
    }
}

// 7. タイムライン表示更新
function renderTimeline(data) {
    const originEl = document.getElementById('trip-origin');
    const destEl = document.getElementById('trip-destination');
    const timelineEl = document.getElementById('route-timeline');

    if (originEl) {
        originEl.innerText = data.origin || "未設定";
        if (data.origin) originEl.classList.remove('empty');
    }
    if (destEl) {
        destEl.innerText = data.dest || "未設定";
        if (data.dest) destEl.classList.remove('empty');
    }

    if (timelineEl) {
        let html = '';
        if (data.origin) html += `<li class="timeline-item"><span class="spot-name">🛣️ ① 高速乗る: ${data.origin}</span></li>`;
        if (data.offIc) html += `<li class="timeline-item"><span class="spot-name">🚗 ② 降りる: ${data.offIc}</span><span class="spot-time">ここから一般道ドライブ 🍃</span></li>`;
        if (data.onIc) html += `<li class="timeline-item"><span class="spot-name">🛣️ ③ 再び乗る: ${data.onIc}</span></li>`;
        if (data.dest) html += `<li class="timeline-item"><span class="spot-name">🏁 ④ 到着: ${data.dest}</span></li>`;
        
        timelineEl.innerHTML = html || `<li class="empty-msg">まだルートが検索されていません</li>`;
    }
}

// 8. おすすめ提案エリアの更新
function renderSuggestions(data) {
    const suggestionEl = document.getElementById('suggestion-area');
    if (!suggestionEl) return;

    const queryText = (data.offIc + " " + data.onIc + " " + data.origin + " " + data.dest);

    if (queryText.includes("前橋") || queryText.includes("湯沢") || queryText.includes("沼田") || queryText.includes("渋川")) {
        suggestionEl.innerHTML = `
            <div style="background:#f0f7ff; border:1px solid #b3d8ff; padding:12px; border-radius:8px;">
                <h3 style="margin:0 0 6px 0; color:#0056b3; font-size:0.95rem;">🛣️ おすすめ: 国道17号（三国峠超えルート）</h3>
                <p style="font-size:0.85rem; margin:0 0 8px 0; color:#444;">前橋・渋川〜湯沢間の一般道区間は、関越道の抜け道としても人気の絶景ドライブコースです！</p>
                <div style="font-size:0.8rem; font-weight:bold; color:#333;">📍 おすすめ立ち寄り候補:</div>
                <ul style="margin:4px 0 0 18px; padding:0; font-size:0.85rem; color:#555;">
                    <li>道の駅 ふじみ（見晴らし抜群）</li>
                    <li>渋川伊香保温泉エリア</li>
                    <li>道の駅 みつまた（足湯でリフレッシュ）</li>
                </ul>
            </div>
        `;
    } else if (data.offIc || data.onIc) {
        suggestionEl.innerHTML = `
            <div style="padding:10px; background:#f9f9f9; border-radius:6px; font-size:0.85rem; color:#666;">
                💡 <b>一般道ドライブのヒント:</b><br>
                「${data.offIc || '降りるIC'}」から「${data.onIc || '乗るIC'}」の間にある国道沿いの「道の駅」をチェックしてみましょう！
            </div>
        `;
    } else {
        suggestionEl.innerHTML = `<p class="empty-msg">条件に合うおすすめルートを表示します</p>`;
    }
}

// 9. Googleマップ表示更新
function updateGoogleRouteMap(data) {
    const points = [data.origin, data.offIc, data.onIc, data.dest].filter(Boolean);

    if (points.length === 0) return;

    let routeUrl = "";
    if (points.length === 1) {
        routeUrl = `https://maps.google.com/maps?q=${encodeURIComponent(points[0])}&z=12&output=embed`;
    } else {
        const saddr = encodeURIComponent(points[0]);
        const daddr = encodeURIComponent(points.slice(1).join(" to:"));
        routeUrl = `https://maps.google.com/maps?saddr=${saddr}&daddr=${daddr}&output=embed`;
    }

    const iframe = document.getElementById('map-iframe');
    if (iframe) {
        iframe.src = routeUrl;
    }
}

// 10. Googleマップアプリで直接開く
function openExternalMap() {
    const data = getFormData();
    const points = [data.origin, data.offIc, data.onIc, data.dest].filter(Boolean);

    if (points.length === 0) {
        alert("ルートを入力してから押してください");
        return;
    }

    const saddr = encodeURIComponent(points[0]);
    const daddr = encodeURIComponent(points.slice(1).join(" to:"));
    const url = `https://www.google.com/maps?saddr=${saddr}&daddr=${daddr}`;
    
    window.open(url, '_blank');
}

// 11. 入力・表示クリア
function clearRoute() {
    document.getElementById('origin-input').value = "";
    document.getElementById('off-input').value = "";
    document.getElementById('on-input').value = "";
    document.getElementById('dest-input').value = "";

    document.getElementById('trip-origin').innerText = "未設定";
    document.getElementById('trip-origin').classList.add('empty');
    document.getElementById('trip-destination').innerText = "未設定";
    document.getElementById('trip-destination').classList.add('empty');
    document.getElementById('route-timeline').innerHTML = `<li class="empty-msg">まだルートが検索されていません</li>`;
    document.getElementById('suggestion-area').innerHTML = `<p class="empty-msg">「①乗る」「②降りる」「③再び乗る」「④到着」を入力してルート検索してみましょう！</p>`;
    
    const iframe = document.getElementById('map-iframe');
    if (iframe) {
        iframe.src = "https://maps.google.com/maps?q=東松山IC&z=10&output=embed";
    }
}