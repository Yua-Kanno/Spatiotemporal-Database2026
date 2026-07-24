 <!DOCTYPE html>
 <html lang="ja">
 <head>
   <meta charset="utf-8" />
   <title>出納帳</title>
   <style>
     table {border-collapse: collapse; width: 100%; max-width: 600px}
     th, td {border: 1px solid #ccc; padding: 6px; text-align: left}
     .plus {color: green}
     .minus {color: red}
   </style>
 </head>
 <body>

<?php
session_start();
if (!isset($_SESSION['transactions'])) {
  $_SESSION['transactions'] = array();
}

// クリア処理
if (isset($_POST['action']) && $_POST['action'] === 'clear') {
  $_SESSION['transactions'] = array();
}

// フォーム送信処理
if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_POST['action'])) {
  $pm = isset($_POST['pm']) ? $_POST['pm'] : '';
  $kagaku_raw = isset($_POST['kagaku']) ? $_POST['kagaku'] : '';
  $desc = isset($_POST['desc']) ? $_POST['desc'] : '';

  // カンマや空白除去して数値化
  $kagaku = floatval(str_replace(',', '', trim($kagaku_raw)));
  if ($kagaku > 0 && ($pm === 'plus' || $pm === 'minus')) {
    $amount = ($pm === 'plus') ? $kagaku : -$kagaku;
    $_SESSION['transactions'][] = array(
      'time' => date('Y-m-d H:i:s'),
      'type' => $pm,
      'amount' => $amount,
      'desc' => $desc,
    );
  }
}

$balance = 0.0;
foreach ($_SESSION['transactions'] as $t) {
  $balance += floatval($t['amount']);
}
?>

<h1>簡易 出納帳</h1>

<form action="" method="POST">
  用途:
  <select name="pm" required>
    <option value="">選択してください</option>
    <option value="plus">収入</option>
    <option value="minus">支出</option>
  </select>
  金額:
  <input type="number" name="kagaku" step="0.01" required>
  説明:
  <input type="text" name="desc" size="30">
  <input type="submit" value="追加">
</form>

<form action="" method="POST" style="margin-top:8px">
  <input type="hidden" name="action" value="clear">
  <input type="submit" value="取引を全てリセット">
</form>

<h2>残金: <?php echo number_format($balance, 2); ?> 円</h2>

<h3>取引一覧</h3>
<?php if (empty($_SESSION['transactions'])): ?>
  <p>取引はまだありません。</p>
<?php else: ?>
  <table>
    <thead>
      <tr><th>日時</th><th>種類</th><th>説明</th><th>金額</th></tr>
    </thead>
    <tbody>
    <?php foreach ($_SESSION['transactions'] as $t): ?>
      <tr>
        <td><?php echo htmlspecialchars($t['time'], ENT_QUOTES, 'UTF-8'); ?></td>
        <td><?php echo ($t['type'] === 'plus') ? '収入' : '支出'; ?></td>
        <td><?php echo htmlspecialchars($t['desc'], ENT_QUOTES, 'UTF-8'); ?></td>
        <td class="<?php echo ($t['amount'] >= 0) ? 'plus' : 'minus'; ?>">
          <?php echo number_format($t['amount'], 2); ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>

</body>
</html>