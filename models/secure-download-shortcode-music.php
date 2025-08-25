<?php
/*
Plugin Name: Secure Download Shortcode
Description: Shortcode to verify purchase and show protected download link.
Version: 1.0
Author: Your Name
*/

function sds_secure_download_shortcode($atts) {
    // Default attributes, can be customized in shortcode
    $atts = shortcode_atts([
        'file_param' => 'song',     // URL param key for purchased file
        'email_param' => 'email',   // URL param key for buyer email
        'purchases_file' => __DIR__ . '/purchases.json', // Path to purchases JSON file
        'download_base_url' => '/wp-content/downloads/protected-music/', // Base URL for protected downloads
    ], $atts, 'secure_download');

    // Get buyer info from URL parameters
    $email = isset($_GET[$atts['email_param']]) ? sanitize_email($_GET[$atts['email_param']]) : '';
    $file = isset($_GET[$atts['file_param']]) ? sanitize_text_field($_GET[$atts['file_param']]) : '';

    if (empty($email) || empty($file)) {
        return "<p><strong>Error:</strong> Missing purchase verification details.</p>";
    }

    // Check if purchase file exists and readable
    if (!file_exists($atts['purchases_file'])) {
        return "<p><strong>Error:</strong> Purchase data file not found.</p>";
    }

    $json_data = file_get_contents($atts['purchases_file']);
    $purchases = json_decode($json_data, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($purchases)) {
        return "<p><strong>Error:</strong> Could not read purchase data.</p>";
    }

    // Check if purchase matches email and item
    $valid = false;
    foreach ($purchases as $purchase) {
        if (
            isset($purchase['email'], $purchase['item_name']) &&
            strtolower($purchase['email']) === strtolower($email) &&
            strtolower($purchase['item_name']) === strtolower($file)
        ) {
            $valid = true;
            break;
        }
    }

    if (!$valid) {
        return "<p><strong>Sorry,</strong> we couldn't verify your purchase. Please contact support.</p>";
    }

    // Prepare download URL (escape for safety)
    $download_url = esc_url(trailingslashit($atts['download_base_url']) . $file);

    // Output download button/link
    return "<p><a href='{$download_url}' class='wp-block-button__link' download>⬇️ Download Your Song Now</a></p>";
}

add_shortcode('secure_download', 'sds_secure_download_shortcode');
