<?php
// ==============================
// Enhanced PayPal IPN Listener
// ==============================

// STEP 1: Read and validate IPN message
$raw_post_data = file_get_contents('php://input');
$raw_post_array = explode('&', $raw_post_data);
$myPost = [];

foreach ($raw_post_array as $keyval) {
    $keyval = explode('=', $keyval);
    if (count($keyval) === 2) {
        $myPost[$keyval[0]] = urldecode($keyval[1]);
    }
}

$req = 'cmd=_notify-validate';
foreach ($myPost as $key => $value) {
    $value = urlencode($value);
    $req .= "&$key=$value";
}

// STEP 2: Send back to PayPal for verification
$paypal_url = 'https://ipnpb.paypal.com/cgi-bin/webscr';
$ch = curl_init($paypal_url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $req,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_HTTPHEADER => ['Connection: Close']
]);
$response = curl_exec($ch);
curl_close($ch);

if (strcmp($response, "VERIFIED") === 0) {
    // STEP 3: Extract useful data
    $txn_id         = $_POST['txn_id'] ?? '';
    $payment_status = $_POST['payment_status'] ?? '';
    $payer_email    = $_POST['payer_email'] ?? '';
    $payment_amount = $_POST['mc_gross'] ?? '0.00';
    $payment_currency = $_POST['mc_currency'] ?? 'USD';
    $first_name     = $_POST['first_name'] ?? '';
    $last_name      = $_POST['last_name'] ?? '';
    $item_name      = $_POST['item_name'] ?? '';
    $partner_key    = $_POST['custom'] ?? ''; // used as partner code

    $payer_name = trim("$first_name $last_name");

    // STEP 4: Load purchases.json
    $jsonPath = __DIR__ . '/purchases.json';
    $purchases = file_exists($jsonPath) ? json_decode(file_get_contents($jsonPath), true) : [];

    // STEP 5: Handle duplicates gracefully
    if (isset($purchases[$txn_id]) && $purchases[$txn_id]['status'] === 'Completed') {
        exit('Already completed.');
    }

    // Save or update transaction
    $purchases[$txn_id] = [
        'txn_id' => $txn_id,
        'email' => $payer_email,
        'payer_name' => $payer_name,
        'item_name' => $item_name,
        'partner' => $partner_key,
        'amount' => floatval($payment_amount),
        'currency' => $payment_currency,
        'status' => $payment_status,
        'timestamp' => date('c')
    ];

    file_put_contents($jsonPath, json_encode($purchases, JSON_PRETTY_PRINT));

    // STEP 6: Only continue if status is Completed
    if ($payment_status !== 'Completed') {
        exit("Status: $payment_status — waiting for completion.");
    }

    // STEP 7: Define partners
    $partners = [
        'john' => 'john@example.com',
        'sara' => 'sara@example.com'
    ];

    if (!isset($partners[$partner_key])) {
        mail('you@example.com', '❌ Invalid partner', "Transaction ID: $txn_id\nPartner: $partner_key");
        exit('Invalid partner key');
    }

    // STEP 8: Payout (optional)
    // — Skipped here for simplicity. You can include PayPal Payout API here —

    // STEP 9: Forward data to Node.js backend
    $payload = json_encode([
        'txn_id' => $txn_id,
        'email' => $payer_email,
        'payer_name' => $payer_name,
        'partner' => $partner_key,
        'amount' => floatval($payment_amount),
        'currency' => $payment_currency,
        'item_name' => $item_name
    ]);

    $nodeApiUrl = 'https://your-node-server.com/api/savePurchase';

    $ch = curl_init($nodeApiUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json']
    ]);
    $res = curl_exec($ch);
    curl_close($ch);

    exit('✅ Payment processed.');
} else {
    // INVALID IPN
    http_response_code(400);
    exit('Invalid IPN');
}
?>
