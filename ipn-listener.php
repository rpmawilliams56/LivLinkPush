<?php
// secure-paypal-ipn.php

// Step 1: Read raw POST data
$raw_post_data = file_get_contents('php://input');
$raw_post_array = explode('&', $raw_post_data);
$my_post = [];
foreach ($raw_post_array as $keyval) {
    $keyval = explode('=', $keyval);
    if (count($keyval) == 2) {
        $my_post[$keyval[0]] = urldecode($keyval[1]);
    }
}

// Step 2: Validate with PayPal
$req = 'cmd=_notify-validate';
foreach ($my_post as $key => $value) {
    $req .= "&$key=" . urlencode($value);
}

$paypal_url = 'https://ipnpb.paypal.com/cgi-bin/webscr';
$ch = curl_init($paypal_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $req);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
$response = curl_exec($ch);
curl_close($ch);

if (strcmp($response, "VERIFIED") === 0) {

    // Step 3: Extract values from IPN POST
    $first_name       = $_POST['first_name'] ?? 'N/A';
    $last_name        = $_POST['last_name'] ?? '';
    $payer_email      = $_POST['payer_email'] ?? 'N/A';
    $payment_status   = $_POST['payment_status'] ?? 'N/A';
    $payment_amount   = $_POST['mc_gross'] ?? '0';
    $payment_currency = $_POST['mc_currency'] ?? 'USD';
    $txn_id           = $_POST['txn_id'] ?? 'N/A';
    $receiver_email   = $_POST['receiver_email'] ?? 'N/A';
    $item_name        = $_POST['item_name'] ?? '';
    $custom           = $_POST['custom'] ?? ''; // partner key

    $payer_name = trim("$first_name $last_name");

    // Detect if it's a digital item
    $is_digital = stripos($item_name, 'mp3') !== false || stripos($item_name, 'download') !== false;

    // Partner routing
    $partners = [
        'john' => 'john@example.com',
        'sara' => 'sara@example.com',
        // Add more here
    ];

    if (!isset($partners[$custom])) {
        mail('you@example.com', '❌ Invalid Partner in PayPal IPN', "TXN: $txn_id\nPartner: $custom");
        header("HTTP/1.1 200 OK");
        exit('Invalid partner key.');
    }

    // Step 4: Write to local JSON
    $json_path = __DIR__ . '/purchases.json';
    $purchases = file_exists($json_path) ? json_decode(file_get_contents($json_path), true) : [];

    if (isset($purchases[$txn_id])) {
        header("HTTP/1.1 200 OK");
        exit('Duplicate transaction.');
    }

    $purchases[$txn_id] = [
        'payment_status' => $payment_status,
        'payer_name'     => $payer_name,
        'email'          => $payer_email,
        'amount'         => $payment_amount,
        'currency'       => $payment_currency,
        'partner'        => $custom,
        'item_name'      => $item_name,
        'is_digital'     => $is_digital,
        'timestamp'      => date('c')
    ];
    file_put_contents($json_path, json_encode($purchases, JSON_PRETTY_PRINT));

    // Step 5: Send to Node API
    $payload = json_encode([
        'txn_id'     => $txn_id,
        'email'      => $payer_email,
        'payer_name' => $payer_name,
        'partner'    => $custom,
        'item_name'  => $item_name,
        'amount'     => floatval($payment_amount),
        'currency'   => $payment_currency,
        'status'     => $payment_status,
        'is_digital' => $is_digital
    ]);

    $node_api_url = $is_digital
        ? 'https://llnk-token-sender-6.onrender.com/api/savedigitaldownload'
        : 'https://llnk-token-sender-6.onrender.com/api/savepurchase';

    $ch = curl_init($node_api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $node_response = curl_exec($ch);

    if (curl_errno($ch)) {
        error_log("❌ Error sending to Node API: " . curl_error($ch));
    } else {
        error_log("✅ Node API response: " . $node_response);
    }

    curl_close($ch);

    // Step 6: Log/placeholder for payouts
    function process_payout($txn_id, $partners, $custom, $payment_amount) {
        $payout_pct = 0.8;
        $payout = $payment_amount * $payout_pct;
        $to = $partners[$custom] ?? null;

        if (!$to) {
            error_log("❌ No payout email for partner: $custom");
            return;
        }

        error_log("💸 Would send $payout USD to $to for txn $txn_id");
    }

    process_payout($txn_id, $partners, $custom, floatval($payment_amount));

    header("HTTP/1.1 200 OK");
    exit('✅ IPN processed.');

} else {
    header("HTTP/1.1 400 Bad Request");
    exit('❌ IPN not verified.');
}

