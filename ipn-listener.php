<?php
// Enhanced PayPal IPN Listener

// 1. Read raw POST data from PayPal IPN
$raw_post_data = file_get_contents('php://input');
$raw_post_array = explode('&', $raw_post_data);
$myPost = [];
foreach ($raw_post_array as $keyval) {
    $keyval = explode('=', $keyval);
    if (count($keyval) == 2) {
        $myPost[$keyval[0]] = urldecode($keyval[1]);
    }
}

// 2. Prepare validation payload
$req = 'cmd=_notify-validate';
foreach ($myPost as $key => $value) {
    $req .= "&$key=" . urlencode($value);
}

// 3. Post back to PayPal for validation
$paypal_url = 'https://ipnpb.paypal.com/cgi-bin/webscr';
$ch = curl_init($paypal_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $req);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
    error_log('cURL error in IPN verification: ' . curl_error($ch));
}
curl_close($ch);

// 4. Process verified IPN
if (strcmp($response, "VERIFIED") === 0) {

    // Extract IPN variables
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

    // Define partner list
    $partners = [
        'john' => 'john@example.com',
        'sara' => 'sara@example.com',
        // Add more partners as needed
    ];

    // Optional: Validate partner key
    if (!isset($partners[$custom])) {
        mail('you@example.com', '❌ Invalid Partner in PayPal IPN', "Transaction ID: $txn_id\nPartner key: $custom");
        header("HTTP/1.1 200 OK");
        exit('Invalid partner key.');
    }

    // Prevent duplicate txn using local file
    $jsonPath = __DIR__ . '/purchase.json';
    $purchase = file_exists($jsonPath) ? json_decode(file_get_contents($jsonPath), true) : [];

    if (isset($purchase[$txn_id])) {
        header("HTTP/1.1 200 OK");
        exit('Duplicate transaction ID detected. Already processed.');
    }

    // Save to local JSON to track processed txn
    $purchase[$txn_id] = [
        'payment_status' => $payment_status,
        'payer_name'     => $payer_name,
        'email'          => $payer_email,
        'amount'         => $payment_amount,
        'currency'       => $payment_currency,
        'partner'        => $custom,
        'timestamp'      => date('c')
    ];
    file_put_contents($jsonPath, json_encode($purchase, JSON_PRETTY_PRINT));

    // Send to Node.js backend
    $payload = json_encode([
        'txn_id'         => $txn_id,
        'email'          => $payer_email,
        'payer_name'     => $payer_name,
        'partner'        => $custom,
        'item_name'      => $item_name,
        'amount'         => floatval($payment_amount),
        'currency'       => $payment_currency,
        'status'         => $payment_status,
        'is_digital'     => false // You can dynamically detect or flag later
    ]);

    $nodeApiUrl = 'https://llnk-token-sender-6.onrender.com/api/savepurchase';

    $ch = curl_init($nodeApiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $nodeResponse = curl_exec($ch);

    if (curl_errno($ch)) {
        error_log('Error sending purchase to Node API: ' . curl_error($ch));
    } else {
        error_log("✅ Node API response: " . $nodeResponse);
    }
    curl_close($ch);

    // Example: Payout logic placeholder
    function processPayouts($txn_id, $partners, $custom, $payment_amount) {
        $payoutPercentage = 0.8;
        $payoutAmount = $payment_amount * $payoutPercentage;
        $partnerEmail = $partners[$custom] ?? null;

        if (!$partnerEmail) {
            error_log("No payout email for partner key: $custom on txn: $txn_id");
            return;
        }

        // TODO: Real payout logic here
        error_log("Payout placeholder: Would send $payoutAmount USD to $partnerEmail for txn $txn_id");
    }

    processPayouts($txn_id, $partners, $custom, floatval($payment_amount));

    header("HTTP/1.1 200 OK");
    exit('IPN processed successfully.');

} else {
    header("HTTP/1.1 400 Bad Request");
    exit('IPN validation failed.');
}
