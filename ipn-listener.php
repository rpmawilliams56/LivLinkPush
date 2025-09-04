<?php
// secure-paypal-ipn.php

// Helper: Normalize item name to PascalCase (e.g., "play that kick ass" => "PlayThatKickAss")
function normalize_item_name_pascal_case($name) {
    $words = preg_split('/\s+/', trim($name));
    return implode('', array_map('ucfirst', array_map('strtolower', $words)));
}

// Step 1: Read raw POST data from PayPal IPN
$raw_post_data = file_get_contents('php://input');
$raw_post_array = explode('&', $raw_post_data);
$my_post = [];
foreach ($raw_post_array as $keyval) {
    $keyval = explode('=', $keyval);
    if (count($keyval) == 2) {
        $my_post[$keyval[0]] = urldecode($keyval[1]);
    }
}

// Step 2: Prepare 'cmd=_notify-validate' with received data
$req = 'cmd=_notify-validate';
foreach ($my_post as $key => $value) {
    $req .= "&$key=" . urlencode($value);
}

// Step 3: Post data back to PayPal for validation
$paypal_url = 'https://ipnpb.paypal.com/cgi-bin/webscr';
$ch = curl_init($paypal_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $req);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
$response = curl_exec($ch);
curl_close($ch);

if (strcmp($response, "VERIFIED") === 0) {
    // Step 4: Extract IPN POST variables safely
    $first_name       = $_POST['first_name'] ?? '';
    $last_name        = $_POST['last_name'] ?? '';
    $payer_email      = $_POST['payer_email'] ?? '';
    $payment_status   = $_POST['payment_status'] ?? '';
    $payment_amount   = $_POST['mc_gross'] ?? '0';
    $payment_currency = $_POST['mc_currency'] ?? '';
    $txn_id           = $_POST['txn_id'] ?? '';
    $receiver_email   = $_POST['receiver_email'] ?? '';
    $item_name_raw    = $_POST['item_name'] ?? '';
    $custom           = $_POST['custom'] ?? ''; // Partner key

    $payer_name = trim("$first_name $last_name");

    // Validate partner key (list your partners here)
    $partners = [
        'john' => 'john@example.com',
        'sara' => 'sara@example.com',
        // Add more partners as needed
    ];

    if (!isset($partners[$custom])) {
        mail('you@example.com', '❌ Invalid Partner in PayPal IPN', "TXN: $txn_id\nPartner: $custom");
        header("HTTP/1.1 200 OK");
        exit('Invalid partner key.');
    }

    // Normalize item_name to PascalCase for consistent storage & lookup
    $item_key = normalize_item_name_pascal_case($item_name_raw);

    // Step 5: Load existing purchases or create empty array
    $json_path = __DIR__ . '/purchases.json';
    $purchases = file_exists($json_path) ? json_decode(file_get_contents($json_path), true) : [];

    // Prevent duplicate txn processing
    if (isset($purchases[$txn_id])) {
        header("HTTP/1.1 200 OK");
        exit('Duplicate transaction.');
    }

    // Step 6: Save purchase data (including normalized item_key)
    $purchases[$txn_id] = [
        'payment_status' => $payment_status,
        'payer_name'     => $payer_name,
        'email'          => $payer_email,
        'amount'         => $payment_amount,
        'currency'       => $payment_currency,
        'partner'        => $custom,
        'item_name'      => $item_name_raw,   // raw for display
        'item_key'       => $item_key,        // normalized for lookup
        'timestamp'      => date('c')
    ];
    file_put_contents($json_path, json_encode($purchases, JSON_PRETTY_PRINT));

    // Step 7: Optionally send to Node API (update URLs as needed)
    $payload = json_encode([
        'txn_id'     => $txn_id,
        'email'      => $payer_email,
        'payer_name' => $payer_name,
        'partner'    => $custom,
        'item_name'  => $item_name_raw,
        'item_key'   => $item_key,
        'amount'     => floatval($payment_amount),
        'currency'   => $payment_currency,
        'status'     => $payment_status
    ]);

    $node_api_url = 'https://llnk-token-sender-6.onrender.com/api/savepurchase';

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

    // Step 8: Log payout (replace with actual payout logic)
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

    // Respond 200 OK to PayPal
    header("HTTP/1.1 200 OK");
    exit('✅ IPN processed.');

} else {
    // IPN not verified
    header("HTTP/1.1 400 Bad Request");
    exit('❌ IPN not verified.');
}
