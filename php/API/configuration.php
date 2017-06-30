<?php	

    $time_zone = "America/Mexico_City";
    $db_host = "localhost"; /*h2mysql20*/
    $db_user = "root";
    $db_password = "";
    $db_name = "sabiduria";

    $key = "2017.s1St3m4MQr.M4R10Qu1J4DarZ";
    $token_expiration_time = '+1 hour';
    $session_expiration_time = '+20 hour';

    function getConnection() 
    {

        global $db_host;
        global $db_user;
        global $db_password;
        global $db_name;

        $dbh = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_password, array(PDO::MYSQL_ATTR_INIT_COMMAND => 
                                                                                            'SET NAMES  \'UTF8\''));

        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $dbh;

    };
    
?>
