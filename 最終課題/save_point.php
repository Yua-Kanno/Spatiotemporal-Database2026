<?php
// 1. APIキーを設定
$apiKey = "AIzaSyDWsM3gWEejoiDVZazSn8GVyg8HZnKTT_I";

// 2. 初期表示用の座標を設定（例: 東京駅、または取得できた現在地）
// データベースから取得するコードが入るまでは、仮の数値をセットしておきます
$lat = $lat ?? 35.681236;
$lng = $lng ?? 139.767125;

// 3. Embed API の URLを作成
$mapUrl = "https://www.google.com/maps/embed/v1/place?key={$apiKey}&q={$lat},{$lng}";
?>

<!-- HTML出力部分 -->
<iframe
    id="map-iframe"
    width="100%"
    height="450"
    style="border:0"
    loading="lazy"
    allowfullscreen
    src="<?php echo $mapUrl; ?>">
</iframe>