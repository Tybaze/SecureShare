<?php

try {

    if (!isset($_POST['share_id'])) {
        throw new Exception('missing share_id');
    }

    $shareId = $_POST['share_id'];

    if (!preg_match('#^[0-9a-f]{40}$#', $shareId)) {
        throw new Exception('invalid share_id');
    }

    $sharePath = '../../shares/';

    $shareFile = $sharePath . $shareId;

    if(!is_file($shareFile)) {
        throw new Exception('Share not found or expired');
    }

    $ciphertext = file_get_contents($shareFile);

    // Delete content
    $length = filesize($shareFile);
    // Better than nothing for the moment
    // file_put_contents($shareFile,generateRandomString($length));
    unlink($shareFile);

    $return = array('success' => true, 'ciphertext' => $ciphertext);

} catch (Exception $e) {
    $return = array('success' => false, 'error' => $e->getMessage());
}

header('Content-Type: application/json');
echo json_encode($return);



/**
 *  Generate a random string matching [0-9a-zA-Z]
 */
function generateRandomString($length = 10, $characters = null)
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