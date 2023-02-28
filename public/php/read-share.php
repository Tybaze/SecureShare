<?php

try {

    if (!isset($_POST['share_id'])) {
        throw new Exception('missing share_id');
    }

    $shareId = $_POST['share_id'];

    if (!preg_match('#^[0-9a-zA-Z_.-]{40}$#', $shareId)) {
        throw new Exception('invalid share_id');
    }

    $sharePath = '../../shares/';

    $shareFile = $sharePath . $shareId;

    if (!is_file($shareFile)) {
        throw new Exception('Share not found or expired');
    }

    $json = file_get_contents($shareFile);


    $share = json_decode($json, TRUE);
    if ($share === NULL) {
        // Should be investigated
        throw new Exception('Failed to parse share');
    }

    // Delete content after json validation
    shred($shareFile);

    $expiration = $share['expiration'] ?? 86400;

    // 24 hours for the moment
    if ($share['time'] + $expiration < time()) {
        throw new Exception('This share is too old, we just destroy it');
    }

    $return = array(
        'success' => true,
        'level' => $share['level'],
        'ciphertext' => $share['ciphertext']);

    // Only for Level simple and dual
    if (isset($share['private_key'])) {
        $return['private_key'] = $share['private_key'];
    }

} catch (Exception $e) {
    $return = array(
        'success' => false,
        'error' => $e->getMessage()
    );
}

header('Content-Type: application/json');
echo json_encode($return);


/**
 *  Generate a random string matching [0-9a-zA-Z]
 *
 * @param $length
 * @param $characters
 * @return string
 */
function generateRandomString($length = 10, $characters = null): string
{

    if (!$characters) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[mt_rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

/**
 * @param $filePath
 * @return void
 * @throws Exception
 */
function shred($filePath): void
{
    if (!is_readable($filePath)) {
        throw new Exception('Failed to read share - please contact administrator');
    }

    if (!is_writable($filePath)) {
        throw new Exception('Failed to write share - please contact administrator');
    }

    $length = filesize($filePath);

    for ($i = 0; $i < 5; $i++) {
        file_put_contents($filePath, generateRandomString($length));
    }

    if (!unlink($filePath)) {
        throw new Exception('Failed to Delete shared - please contact administrator');
    }
}