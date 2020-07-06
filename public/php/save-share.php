<?php

try {

    if (!isset($_POST['share_id'])) {
        throw new Exception('missing share_id');
    }

    $shareId = $_POST['share_id'];

    if (!isset($_POST['ciphertext'])) {
        throw new Exception('missing share ciphertext');
    }

    $ciphertext = $_POST['ciphertext'];

    if (!preg_match('#^[0-9a-zA-Z_.-]{40}$#', $shareId)) {
        throw new Exception('invalid share_id');
    }

    if (strlen($ciphertext) > 1000000) {
        throw new Exception('Too big data for the moment');
    }

    // could be improved
    $regCipherText = '#^-{5}BEGIN PGP MESSAGE-{5}\r\nVersion: OpenPGP.js v[0-9]+\.[0-9]+\.[0-9]+\r\nComment: https://openpgpjs.org(\r\n)+([0-9a-zA-Z/\r\n+=]+)-{5}END PGP MESSAGE-{5}#m';

    if (!preg_match($regCipherText, $ciphertext, $matches)) {
        throw new Exception('invalid ciphertext');
    }

    $sharePath = '../../shares/';

    if (!is_dir($sharePath)) {
        throw new Exception('share path is not a directory');
    }

    if (!is_writable($sharePath)) {
        throw new Exception('Share path is not writable');
    }
    $shareFile = $sharePath . $shareId;

    if (is_file($shareFile)) {
        throw new Exception('Share already exists');
    }

    if (!file_put_contents($shareFile, $ciphertext, LOCK_EX)) {
        throw new Exception('Failed to write share file');
    }

    $return = array('success' => true);

} catch (Exception $e) {
    $return = array('success' => false, 'error' => $e->getMessage());
}

header('Content-Type: application/json');
echo json_encode($return);



