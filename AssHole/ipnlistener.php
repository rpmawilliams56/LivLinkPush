New Code Multiple Payments

<?php
// ==============================
// Enhanced PayPal IPN Listener
// ==============================

// Step 1: Read raw POST data
$raw_post_data = file_get_contents('php://input');
$raw_post_array = explode('&', $raw_post_data);
$myPost = [];
foreach ($raw_post_array as $keyval) {
    $keyval = explode('=', $keyval);
    if (count($keyval) == 2) {
        $myPost[$keyval[0]] = urldecode($keyval[1]);
    }
}

// Step 2: Prepare validation payload
$req = 'cmd=_notify-validate';
foreach ($myPost as $key => $value) {
    $value = urlencode($value);
    $req .= "&$key=$value";
}

// Step 3: Send to PayPal for verification
$paypal_url = 'https://ipnpb.paypal.com/cgi-bin/webscr';
$ch = curl_init($paypal_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $req);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
$response = curl_exec($ch);
curl_close($ch);

// Step 4: Process if VERIFIED
if (strcmp($response, "VERIFIED") == 0) {

    // Pull IPN data
    $first_name     = $_POST['first_name'] ?? 'N/A';
    $last_name      = $_POST['last_name'] ?? '';
    $payer_email    = $_POST['payer_email'] ?? 'N/A';
    $payment_status = $_POST['payment_status'] ?? 'N/A';
    $payment_amount = $_POST['mc_gross'] ?? '0';
    $payment_currency = $_POST['mc_currency'] ?? 'USD';
    $txn_id         = $_POST['txn_id'] ?? 'N/A';
    $receiver_email = $_POST['receiver_email'] ?? 'N/A';
    $item_name      = $_POST['item_name'] ?? '';
    $custom         = $_POST['custom'] ?? ''; // This is used as partner key

    $payer_name = trim("$first_name $last_name");

    // === START: NEW FUNCTIONALITY ===

    // CONFIG
    $clientId = 'YOUR_PAYPAL_CLIENT_ID';
    $clientSecret = 'YOUR_PAYPAL_CLIENT_SECRET';
    $jsonPath = __DIR__ . '/purchases.json';

    // Define partners
    $partners = [
        'john' => 'john@example.com',
        'sara' => 'sara@example.com',
        // add more here
    ];

    // Load existing purchases
    $purchases = file_exists($jsonPath) ? json_decode(file_get_contents($jsonPath), true) : [];

    // If already recorded, skip (idempotent)
    if (isset($purchases[$txn_id])) {
        header("HTTP/1.1 200 OK");
        exit('Already processed.');
    }

    // Validate partner
    if (!isset($partners[$custom])) {
        // Send alert if invalid partner
        mail('you@example.com', '❌ Invalid Partner in PayPal IPN', "Transaction: $txn_id\nPartner key: $custom");
        header("HTTP/1.1 200 OK");
        exit('Invalid partner.');
    }

    // Send 80% payout
    function getPaypalToken($clientId, $clientSecret) {
        $ch = curl_init("https://api-m.paypal.com/v1/oauth2/token");
        curl_setopt_array($ch, [
            CURLOPT_USERPWD => "$clientId:$clientSecret",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => "grant_type=client_credentials",
            CURLOPT_HTTPHEADER => ["Accept: application/json"]
        ]);
        $res = curl_exec($ch);
        curl_close($ch);
        $data = json_decode($res, true);
        return $data['access_token'] ?? null;
    }

    function sendPayout($accessToken, $toEmail, $amount) {
        $payout = [
            "sender_batch_header" => [
                "sender_batch_id" => uniqid("batch_", true),
                "email_subject" => "LLNK Sale Payout"
            ],
            "items" => [[
                "recipient_type" => "EMAIL",
                "amount" => [
                    "value" => number_format($amount, 2, '.', ''),
                    "currency" => "USD"
                ],
                "receiver" => $toEmail,
                "note" => "Profit share from LLNK token sale",
                "sender_item_id" => uniqid("item_", true)
            ]]
        ];

        $ch = curl_init("https://api-m.paypal.com/v1/payments/payouts");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payout),
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "Authorization: Bearer $accessToken"
            ]
        ]);
        $res = curl_exec($ch);
        curl_close($ch);
        return json_decode($res, true);
    }

    $par

// Send purchase to Node backend
$payload = json_encode([
  'txn_id' => $txn_id,
  'email' => $payer_email,
  'payer_name' => $payer_name,
  'partner' => $custom,
  'amount' => floatval($payment_amount),
  'currency' => $payment_currency
]);

$ch = curl_init('https://your-node-server-url.com/api/savePurchase');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_exec($ch);
curl_close($ch);

