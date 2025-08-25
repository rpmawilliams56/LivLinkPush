<?php
// claim_backend.php

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$purchasesFile = __DIR__ . '/purchases.json';

// Load purchases
$purchases = file_exists($purchasesFile)
    ? json_decode(file_get_contents($purchasesFile), true)
    : [];

if ($method === 'GET') {
    // Check txn ID
    $txn = $_GET['txn'] ?? '';
    if (!$txn || !isset($purchases[$txn])) {
        echo json_encode(['error' => 'Transaction not found']);
        exit;
    }

    $entry = $purchases[$txn];
    echo json_encode([
        'txn_id' => $txn,
        'claimed' => $entry['claimed'],
        'wallet_address' => $entry['wallet_address']
    ]);
    exit;
}

if ($method === 'POST') {
    // Receive wallet address + txn ID
    $input = json_decode(file_get_contents('php://input'), true);
    $txn = $input['txn_id'] ?? '';
    $wallet = $input['wallet_address'] ?? '';

    if (!$txn || !$wallet || !isset($purchases[$txn])) {
        echo json_encode(['error' => 'Invalid request']);
        exit;
    }

    // Prevent duplicate claims
    if ($purchases[$txn]['claimed']) {
        echo json_encode(['error' => 'Already claimed']);
        exit;
    }

    // Update record
    $purchases[$txn]['claimed'] = true;
    $purchases[$txn]['wallet_address'] = $wallet;
    file_put_contents($purchasesFile, json_encode($purchases, JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'wallet_address' => $wallet
    ]);
    exit;
}

echo json_encode(['error' => 'Unsupported method']);
exit;
