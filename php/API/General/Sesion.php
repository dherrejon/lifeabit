<?php

//Iniciar sesión
function Login()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();
    $datosUsuario = json_decode($request->getBody());

    $sql = "SELECT NombreUsuario, Nombre, Apellidos, UsuarioId, Clave, Correo, EtiquetaMsn FROM UsuarioVista WHERE Correo = '".$datosUsuario->correo."' AND Password = '".$datosUsuario->clave."' AND Activo = 1";
    
    try 
    {

        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;

        if($stmt->rowCount() > 0)
        {
            if( !isset( $_SESSION['MQR'] ) )
            {
                foreach ($response as $aux) 
                {
                    $aux->Password = "";
                }

                $_SESSION['MQR'] = $response;
                $_SESSION['Aplicacion'] = '';
                $_SESSION['sitio'] = 'www.mqrSistemas.com';
                $_SESSION['timeout'] = strtotime( $session_expiration_time );

                $rspH = $app->response();
                $rspH['X-Api-Key'] = generateToken(false);
                
                echo '[ { "Estatus": "Iniciado"}, {"Usuario":'.json_encode($response).'} ]'; 
            }
            else
            {
               echo '[ { "Estatus": "SesionInicada" } ]';
            } 
        }
        else
        {
           echo '[ { "Estatus": "Error" } ]';
        }
    } 
    catch(PDOException $e) 
    {
        echo($e);
        $app->status(409);
        $app->stop();
    }
}

//Obtiene el estado actual de la sesión del usuario
function GetEstadoSesion()
{
    global $app;

    if( null == $app->response->headers->get('X-Api-Key') )
        $app->response->headers->set('X-Api-Key', generateToken(false));


    if( isset( $_SESSION['MQR'] ) )
    { 
        //echo json_encode($_SESSION['Usuario']);
        echo '[ { "Estatus": true, "Aplicacion": "'.$_SESSION['Aplicacion'].'"}, {"Usuario":'.json_encode($_SESSION['MQR']).'} ]';        
    }
    else
    {
        echo '[ { "Estatus": false } ]';
    }
}

function CerrarSesion()
{   
    global $app;

    quitarSesion();

    $response = $app->response();
    $response['X-Api-Key'] = generateToken(false);

    echo '[ { "Estatus": true } ]';

}

//guarda el perfil que selecciono el usurio en las variable de php
function SetAplicacion()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $aplicacion = json_decode($request->getBody());
    
    $_SESSION['Aplicacion'] = $aplicacion[0];

    //echo $_SESSION['Aplicacion'];
}

?>