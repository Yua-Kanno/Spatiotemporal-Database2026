<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ドライブ旅の軌跡 - ROAD TRIP LOG</title>
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
</head>
<body>

    <header class="app-header">
        <div class="header-content">
            <span class="eyebrow">ROAD TRIP LOG</span>
            <h1>🚗 ドライブ旅の軌跡</h1>
            <div id="status" class="status-badge">ルート検索準備完了</div>
        </div>
    </header>

    <main class="main-container">

        <!-- 👈 左パネル：入力フォーム・工程・提案・保存リスト -->
        <div class="left-panel">
            
            <!-- 1. ドライブコース設定フォーム -->
            <div class="card">
                <div class="card-header">
                    <h2>🗺️ ドライブコース設定（高速 ⇄ 一般道）</h2>
                </div>
                
                <div class="form-group-list">
                    <div class="form-item">
                        <label>① 出発・高速に乗るIC</label>
                        <input type="text" id="origin-input" class="text-input" placeholder="例: 東松山IC">
                    </div>
                    <div class="form-item">
                        <label>② 高速を降りるIC / スポット</label>
                        <input type="text" id="off-input" class="text-input" placeholder="例: 前橋IC">
                    </div>
                    <div class="form-item">
                        <label>③ 一般道を通って再び乗るIC</label>
                        <input type="text" id="on-input" class="text-input" placeholder="例: 湯沢IC">
                    </div>
                    <div class="form-item">
                        <label>④ 最終目的地・降りるIC</label>
                        <input type="text" id="dest-input" class="text-input" placeholder="例: 新潟">
                    </div>

                    <div class="btn-group">
                        <button type="button" class="btn-primary" onclick="searchRoute()">🔍 ルートを検索・地図に反映</button>
                        <button type="button" class="btn-outline-sm" onclick="clearRoute()">入力クリア</button>
                    </div>
                    <div style="margin-top: 6px;">
                        <button type="button" class="btn-save" onclick="saveCurrentRoute()">💾 このルートを保存する</button>
                    </div>
                </div>
            </div>

            <!-- 2. 保存済みルート一覧 -->
            <div class="card">
                <div class="card-header flex-between">
                    <h2>📁 保存済みルート</h2>
                    <button type="button" class="btn-outline-sm" style="font-size:0.7rem; padding:2px 6px;" onclick="clearAllSavedRoutes()">全削除</button>
                </div>
                <div id="saved-routes-list" class="saved-list-container">
                    <p class="empty-msg">保存されたルートはありません</p>
                </div>
            </div>

            <!-- 3. 今日の旅程カード -->
            <div class="card">
                <div class="card-header">
                    <h2>🎫 今日の旅程</h2>
                </div>
                <div class="trip-ticket">
                    <div class="trip-point">
                        <span class="pt-label">DEPARTURE</span>
                        <div id="trip-origin" class="pt-name empty">未設定</div>
                    </div>
                    <div class="trip-divider">
                        <span class="car-icon">🚗</span>
                        <div class="road-line"></div>
                    </div>
                    <div class="trip-point">
                        <span class="pt-label">DESTINATION</span>
                        <div id="trip-destination" class="pt-name empty">未設定</div>
                    </div>
                </div>
            </div>

            <!-- 4. タイムライン表示 -->
            <div class="card">
                <div class="card-header">
                    <h2>🛣️ ドライブ工程（乗り降り・経由地）</h2>
                </div>
                <div class="timeline-wrapper">
                    <ul id="route-timeline" class="timeline-list">
                        <li class="empty-msg">まだルートが検索されていません</li>
                    </ul>
                </div>
            </div>

            <!-- 5. おすすめの道・スポット提案 -->
            <div class="card">
                <div class="card-header">
                    <h2>💡 おすすめの道・道の駅の候補</h2>
                </div>
                <div id="suggestion-area">
                    <p class="empty-msg">「①乗る」「②降りる」「③再び乗る」「④到着」を入力してルート検索してみましょう！</p>
                </div>
            </div>

        </div>

        <!-- 👉 右パネル：固定表示型Googleマップ -->
        <div class="right-panel sticky-map">
            <div class="card">
                <div class="card-header flex-between">
                    <h2>🗺️ ドライブ検索マップ</h2>
                    <button type="button" class="btn-app-open" onclick="openExternalMap()">アプリでナビ ↗</button>
                </div>
                <div id="map-container">
                    <iframe id="map-iframe" src="https://maps.google.com/maps?q=東松山IC&z=10&output=embed" loading="lazy"></iframe>
                </div>
            </div>
        </div>

    </main>

    <script src="app.js?v=<?php echo time(); ?>"></script>
</body>
</html>