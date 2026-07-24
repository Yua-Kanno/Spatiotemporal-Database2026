<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>環境アンケート</title>
  <style>
    body{font-family: Arial, sans-serif; max-width:800px}
    label{display:inline-block; width:120px}
    table{border-collapse:collapse; width:100%}
    th,td{border:1px solid #ccc;padding:6px}
  </style>
</head>
<body>
<?php
session_start();
if (!isset($_SESSION['surveys'])) $_SESSION['surveys'] = array();

$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
function detect_device($ua){
  if (preg_match('/iPad|Tablet/i',$ua)) return 'Tablet';
  if (preg_match('/Mobile|Android|iPhone|iPod/i',$ua)) return 'Mobile';
  if (preg_match('/Windows/i',$ua)) return 'Windows';
  if (preg_match('/Macintosh|Mac OS X/i',$ua)) return 'Mac';
  return 'Other';
}
$detected = detect_device($ua);

if (isset($_POST['action']) && $_POST['action'] === 'clear'){
  $_SESSION['surveys'] = array();
}

$saved = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST'){
  if (isset($_POST['step']) && $_POST['step'] === 'select_device'){
    $chosen = $_POST['device'] ?? $detected;
  } elseif (isset($_POST['step']) && $_POST['step'] === 'submit_survey'){
    $entry = array(
      'time' => date('Y-m-d H:i:s'),
      'device' => $_POST['device'] ?? $detected,
      'os' => $_POST['os'] ?? '',
      'browser' => $_POST['browser'] ?? '',
      'screen' => $_POST['screen'] ?? '',
      'usage' => $_POST['usage'] ?? '',
      'freq' => $_POST['freq'] ?? '',
      'comment' => $_POST['comment'] ?? '',
    );
    $_SESSION['surveys'][] = $entry;
    $saved = true;
  }
}
?>

<h1>使用環境アンケート</h1>

<?php if (!isset($chosen) && !$saved): ?>
  <p>自動検出された端末種別: <strong><?php echo htmlspecialchars($detected, ENT_QUOTES, 'UTF-8'); ?></strong></p>
  <form method="POST">
    <input type="hidden" name="step" value="select_device">
    <label>端末を選択:</label>
    <select name="device">
      <option value="Mobile" <?php if($detected==='Mobile') echo 'selected'; ?>>Mobile</option>
      <option value="Tablet" <?php if($detected==='Tablet') echo 'selected'; ?>>Tablet</option>
      <option value="Windows" <?php if($detected==='Windows') echo 'selected'; ?>>Windows</option>
      <option value="Mac" <?php if($detected==='Mac') echo 'selected'; ?>>Mac</option>
      <option value="Other" <?php if($detected==='Other') echo 'selected'; ?>>Other</option>
    </select>
    <input type="submit" value="この端末で回答する">
  </form>

<?php elseif (isset($chosen) && !$saved): ?>
  <h2>アンケート（<?php echo htmlspecialchars($chosen, ENT_QUOTES, 'UTF-8'); ?>）</h2>
  <form method="POST">
    <input type="hidden" name="step" value="submit_survey">
    <input type="hidden" name="device" value="<?php echo htmlspecialchars($chosen, ENT_QUOTES, 'UTF-8'); ?>">
    <p><label>OS:</label><input type="text" name="os" required></p>
    <p><label>ブラウザ:</label><input type="text" name="browser" required></p>
    <p><label>画面解像度:</label><input type="text" name="screen" placeholder="例: 1920x1080"></p>
    <p><label>主な用途:</label>
      <select name="usage">
        <option value="browsing">閲覧</option>
        <option value="app">アプリ利用</option>
        <option value="dev">開発</option>
        <option value="game">ゲーム</option>
      </select>
    </p>
    <p><label>利用頻度:</label>
      <select name="freq">
        <option value="daily">毎日</option>
        <option value="weekly">週に数回</option>
        <option value="monthly">月に数回</option>
        <option value="rare">稀</option>
      </select>
    </p>
    <p><label>備考:</label><input type="text" name="comment" size="40"></p>
    <p><input type="submit" value="送信する"></p>
  </form>

<?php elseif ($saved): ?>
  <h2>送信ありがとうございました</h2>
  <p>ご協力ありがとうございます。</p>
<?php endif; ?>

<h3>これまでの回答（セッション保存）</h3>
<?php if (empty($_SESSION['surveys'])): ?>
  <p>まだ回答はありません。</p>
<?php else: ?>
  <table>
    <thead><tr><th>日時</th><th>端末</th><th>OS</th><th>ブラウザ</th><th>画面</th><th>用途</th><th>頻度</th><th>備考</th></tr></thead>
    <tbody>
    <?php foreach ($_SESSION['surveys'] as $s): ?>
      <tr>
        <td><?php echo htmlspecialchars($s['time'], ENT_QUOTES, 'UTF-8'); ?></td>
        <td><?php echo htmlspecialchars($s['device'], ENT_QUOTES, 'UTF-8'); ?></td>
        <td><?php echo htmlspecialchars($s['os'], ENT_QUOTES, 'UTF-8'); ?></td>
        <td><?php echo htmlspecialchars($s['browser'], ENT_QUOTES, 'UTF-8'); ?></td>
        <td><?php echo htmlspecialchars($s['screen'], ENT_QUOTES, 'UTF-8'); ?></td>
        <td><?php echo htmlspecialchars($s['usage'], ENT_QUOTES, 'UTF-8'); ?></td>
        <td><?php echo htmlspecialchars($s['freq'], ENT_QUOTES, 'UTF-8'); ?></td>
        <td><?php echo htmlspecialchars($s['comment'], ENT_QUOTES, 'UTF-8'); ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>

<form method="POST" style="margin-top:10px">
  <input type="hidden" name="action" value="clear">
  <input type="submit" value="回答を全てクリア">
</form>

</body>
</html>