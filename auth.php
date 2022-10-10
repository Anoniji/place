<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('max_execution_time', 300);

error_reporting(E_ALL);

$code = isset($_REQUEST['code']) ? $_REQUEST['code'] : '';

// Config file
$json = file_get_contents('./config.json');
$json_data = json_decode($json, true);

define('OAUTH2_CLIENT_ID', $json_data['discord']['OAUTH2_CLIENT_ID']);
define('OAUTH2_CLIENT_SECRET', $json_data['discord']['OAUTH2_CLIENT_SECRET']);

$authorizeURL = 'https://discord.com/api/oauth2/authorize';
$tokenURL = 'https://discord.com/api/oauth2/token';
$apiURLBase = 'https://discord.com/api/users/@me';
$redirectAUTH = $json_data['discord']['redirectAUTH'];
if(get('code')) {

  session_start();

  // Exchange the auth code for a token
  $token = apiRequest($tokenURL, array(
    "grant_type" => "authorization_code",
    'client_id' => OAUTH2_CLIENT_ID,
    'client_secret' => OAUTH2_CLIENT_SECRET,
    'redirect_uri' => $redirectAUTH,
    'code' => get('code')
  ));
  $logout_token = $token->access_token;
  $_SESSION['access_token'] = $token->access_token;

  $user = apiRequest($apiURLBase); ?>

<script>
    localStorage.setItem("id", "<?= $user->id; ?>");
    localStorage.setItem("username", "<?= $user->username; ?>");
    localStorage.setItem("email", "<?= $user->email; ?>");

    function checkStorage() {
        userid = localStorage.getItem("id");
        if(userid) {
            location.href = "<?= $json_data['discord']['redirectURL']; ?>";
        } else {
            setTimeout(function() {
                checkStorage();
            }, 500);
        }
    }
    checkStorage();
</script>

Redirecting....

<?php }

function apiRequest($url, $post=FALSE, $headers=array()) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

    $response = curl_exec($ch);
    if($post){
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
    }
    $headers[] = 'Accept: application/json';
    if(isset($_SESSION['access_token']))
    $headers[] = 'Authorization: Bearer ' . $_SESSION['access_token'];
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    return json_decode($response);
}

function get($key, $default=NULL) {
    return array_key_exists($key, $_GET) ? $_GET[$key] : $default;
}
?>