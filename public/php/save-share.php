<?php

try {

    //
    // Share ID
    //
    if (!isset($_POST['share_id'])) {
        throw new Exception('missing share_id');
    }

    $shareId = $_POST['share_id'];

    if (!preg_match('#^[0-9a-zA-Z_.-]{40}$#', $shareId)) {
        throw new Exception('invalid share_id');
    }

    //
    // Security Level
    //
    if(!isset($_POST['level'])) {
        throw new Exception('missing level');
    }

    $level = $_POST['level'];

    if(!in_array($level, array('simple','dual','deeper','paranoid'))) {
        throw new Exception('Invalid level');
    }

    //
    // CipherText
    //
    if (!isset($_POST['ciphertext'])) {
        throw new Exception('missing share ciphertext');
    }

    $ciphertext = $_POST['ciphertext'];


    if (strlen($ciphertext) > 1000000) {
        throw new Exception('Too big data for the moment');
    }

    // could be improved
    $regCipherText = '#^-{5}BEGIN PGP MESSAGE-{5}\r\nVersion: OpenPGP.js v[0-9]+\.[0-9]+\.[0-9]+\r\nComment: https://openpgpjs.org(\r\n)+([0-9a-zA-Z/\r\n+=]+)-{5}END PGP MESSAGE-{5}#m';

    if (!preg_match($regCipherText, $ciphertext, $matches)) {
        throw new Exception('invalid ciphertext');
    }

    //
    // Private Key [Optional]
    //
    $privateKey = null;
    if(in_array($level, array('simple','dual'))) {

        if(!isset($_POST['private_key'])) {
            throw new Exception('Missing private_key');
        }

        $privateKey = $_POST['private_key'];

        // could be improved
        // Version: OpenPGP.js v[0-9]+\.[0-9]+\.[0-9]+\r\nComment: https://openpgpjs.org(\r\n)+([0-9a-zA-Z/\r\n+=]+)-{5}END PGP PRIVATE KEY BLOCK-{5}
        $regPrivateKey = '#^-{5}BEGIN PGP PRIVATE KEY BLOCK-{5}\r\nVersion: OpenPGP.js v[0-9]+\.[0-9]+\.[0-9]+\r\nComment: https://openpgpjs.org(\r\n)+([0-9a-zA-Z/\r\n+=]+)-{5}END PGP PRIVATE KEY BLOCK-{5}#m';

        if (!preg_match($regPrivateKey, $privateKey, $matches)) {

            throw new Exception('invalid private_key');
        }

    }

    //
    // Manage Files
    //
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

    $now = time();

    $shareContentArray = array(
        'time' => $now,
        'level' => $level,
        'ciphertext' => $ciphertext
    );

    if($privateKey) {
        $shareContentArray['private_key'] = $privateKey;
    }

    // All content should be ASCII, so json_encode is safe

    if (!file_put_contents($shareFile, json_encode($shareContentArray), LOCK_EX)) {
        throw new Exception('Failed to write share file');
    }

    $return = array('success' => true);

} catch (Exception $e) {
    $return = array('success' => false, 'error' => $e->getMessage());
}

header('Content-Type: application/json');
echo json_encode($return);



