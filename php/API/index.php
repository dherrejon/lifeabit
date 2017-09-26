<?php

    require 'Slim/Slim.php';
    require 'configuration.php';

    require 'General/Sesion.php';
    require 'General/Usuario.php';

    require 'Sabiduria/Administrar/Etiqueta.php';


    require 'Actividades/Frecuencia.php';
    require 'Actividades/TemaActividad.php';
    require 'Actividades/Actividad.php';
    require 'Actividades/PersonaActividad.php';
    require 'Actividades/Lugar.php';
    require 'Actividades/Ciudad.php';
    require 'Actividades/Unidad.php';
    require 'Actividades/Divisa.php';
    require 'Actividades/EventoActividad.php';

    require 'Diario/Diario.php';

    require 'Notas/Notas.php';

    require 'Conocimiento/Conocimiento.php';

    require 'Buscador/Buscador.php';

    require 'Imagen/Imagen.php';

    /*-----Seguridad-----*/
    require 'PHP-JWT/Authentication/JWT.php';
    require 'PHP-JWT/Exceptions/SignatureInvalidException.php';
    require 'PHP-JWT/Exceptions/BeforeValidException.php';
    require 'PHP-JWT/Exceptions/ExpiredException.php';

    $host = $_SERVER['SERVER_NAME'];

    \Slim\Slim::registerAutoloader();
    $app = new \Slim\Slim();

    date_default_timezone_set($time_zone);

    session_start();

    //-------------------------------------------------Seguridad------------------------------------------
    $seguridad = function() use ($key, $host) 
    {

        $app = \Slim\Slim::getInstance();

        $jwt = $app->request->headers->get('X-Api-Key');

        if( null != $jwt )
        {
             try
             {
                    $app->response->headers->set('X-Origin-Response', $host); 
                    $jwtDecoded = JWT::decode($jwt, $key, array('HS256'));
             }
             catch ( SignatureInvalidException $excepcionSE )
             {
                    $app->status(401);
                    $app->stop();
             }
             catch ( BeforeValidException $excepcionBE )
             {
                    $app->status(401);
                    $app->stop();
             }
             catch ( ExpiredException $excepcionEE )
             {

                    try{
                            $app->response->headers->set('X-Api-Key', generateToken(false)); 
                    }
                    catch ( DomainException $excepcion )
                    {
                            $app->status(401);
                            $app->stop();
                    }

             }
             catch ( DomainException $excepcionDE )
             {
                    $app->status(401);
                    $app->stop();
             }
             catch ( UnexpectedValueException $excepcionUE )
             {
                    $app->status(401);
                    $app->stop();               
             }
        }
        else
        {
            $app->status(401);
            $app->stop();
        }        
    };

    //------------------------------------ Inicio de sesion ------------------------------------------------
    function generateToken($expired)
    {
        global $key;
        global $host;
        global $app;
        global $token_expiration_time;
        $state;
        
        if(!$expired)
        {
            if ( isset( $_SESSION['MQR'] ) )
                $state = true;
            else
                $state = false;
        }
        else
            $state = 'expired';
            
        try{
                $newPayload = array(
                    "state" => $state,
                    "iat" => time(),
                    "exp" => strtotime($token_expiration_time)
                );

                $newJWT = JWT::encode($newPayload, $key);

                return $newJWT;
        }
        catch ( DomainException $excepcion )
        {
                $app->status(401);
                $app->stop();
        }
    }

    function quitarSesion()
    {
        
        if( isset( $_SESSION['MQR'] ) )
        {
            
            if ( ini_get("session.use_cookies") ) 
            {
            
                $params = session_get_cookie_params();
                setcookie(session_name(), 
                                      '', 
                          time() - 42000,
                         $params["path"], 
                       $params["domain"],
                       $params["secure"], 
                    $params["httponly"]);
                
            }
            
            session_unset();
            session_destroy();
            
        }
    }

    $ChecarSesion = function() use ($session_expiration_time)
    {
        
        $app = \Slim\Slim::getInstance();
        
        if( isset( $_SESSION['MQR'] ) ) 
        {

            if( ( $_SESSION['timeout'] - time() ) < 0 )
            {
                quitarSesion();
                
                $app->response->headers->set('X-Api-Key', generateToken(true));
            }
            else
            {
                $_SESSION['timeout'] = strtotime( $session_expiration_time );   
            }
                
        }        
    };

    /*-----------Sesion-------------*/
    $app->post('/Login', $seguridad, 'Login');
    $app->get('/GetEstadoSesion', $seguridad, $ChecarSesion, 'GetEstadoSesion');
    $app->get('/CerrarSesion', $seguridad, 'CerrarSesion');
    $app->put('/SetAplicacion', $seguridad, 'SetAplicacion');

    /*----------------------Usuario ----------------------*/
    $app->get('/GetUsuarios', $seguridad, $ChecarSesion, 'GetUsuarios');
    $app->post('/AgregarUsuario', $seguridad, $ChecarSesion, 'AgregarUsuario');
    $app->put('/EditarUsuario', $seguridad, $ChecarSesion, 'EditarUsuario');
    $app->post('/ActivarDesactivarUsuario', $seguridad, $ChecarSesion, 'ActivarDesactivarUsuario');
    
    $app->get('/GetPermiso', $seguridad, $ChecarSesion, 'GetPermiso');
    
    $app->get('/GetPermisoUsuario', $seguridad, $ChecarSesion, 'GetPermisoUsuario');
    $app->put('/CambiarPasswordPorUsuario', $seguridad, $ChecarSesion, 'CambiarPasswordPorUsuario');

    $app->put('/RecuperarPassword', $seguridad, $ChecarSesion, 'RecuperarPassword');
    $app->post('/ValidarRecuperarPassword', $seguridad, $ChecarSesion, 'ValidarRecuperarPassword');
    $app->put('/ReiniciarPassword', $seguridad, $ChecarSesion, 'ReiniciarPassword');

    /*----------------------- Etiqueta ------------------------------------------*/
    $app->get('/GetEtiqueta/:id', $seguridad, $ChecarSesion, 'GetEtiqueta');
    $app->post('/AgregarEtiqueta', $seguridad, $ChecarSesion, 'AgregarEtiqueta');
    $app->put('/EditarEtiqueta', $seguridad, $ChecarSesion, 'EditarEtiqueta');
    $app->post('/ActivarDesactivarEtiqueta', $seguridad, $ChecarSesion, 'ActivarDesactivarEtiqueta');
    $app->delete('/BorrarEtiqueta', $seguridad, $ChecarSesion, 'BorrarEtiqueta');

    $app->get('/GetEtiquetaEquivalente/:id', $seguridad, $ChecarSesion, 'GetEtiquetaEquivalente');
    $app->put('/SetEtiquetaEquivalente', $seguridad, $ChecarSesion, 'SetEtiquetaEquivalente');

    //---------------------------------------------------------------------------------------------------------------Actividades
    
    /*-----------------------  Frecuencia ------------------------------------------*/
    $app->get('/GetFrecuencia/:id', $seguridad, $ChecarSesion, 'GetFrecuencia');
    $app->post('/AgregarFrecuencia', $seguridad, $ChecarSesion, 'AgregarFrecuencia');
    $app->put('/EditarFrecuencia', $seguridad, $ChecarSesion, 'EditarFrecuencia');
    $app->delete('/BorrarFrecuencia', $seguridad, $ChecarSesion, 'BorrarFrecuencia');

    /*-----------------------  Tema Actividad ------------------------------------------*/
    $app->get('/GetTemaActividad/:id', $seguridad, $ChecarSesion, 'GetTemaActividad');
    $app->post('/AgregarTemaActividad', $seguridad, $ChecarSesion, 'AgregarTemaActividad');
    $app->put('/EditarTemaActividad', $seguridad, $ChecarSesion, 'EditarTemaActividad');
    $app->delete('/BorrarTemaActividad', $seguridad, $ChecarSesion, 'BorrarTemaActividad');

    /*-----------------------  Persona ------------------------------------------*/
    $app->get('/GetPersonaActividad/:id', $seguridad, $ChecarSesion, 'GetPersonaActividad');
    $app->post('/AgregarPersonaActividad', $seguridad, $ChecarSesion, 'AgregarPersonaActividad');
    $app->put('/EditarPersonaActividad', $seguridad, $ChecarSesion, 'EditarPersonaActividad');
    $app->delete('/BorrarPersonaActividad', $seguridad, $ChecarSesion, 'BorrarPersonaActividad');

    /*-----------------------  Lugar ------------------------------------------*/
    $app->get('/GetLugar/:id', $seguridad, $ChecarSesion, 'GetLugar');
    $app->post('/AgregarLugar', $seguridad, $ChecarSesion, 'AgregarLugar');
    $app->put('/EditarLugar', $seguridad, $ChecarSesion, 'EditarLugar');
    $app->delete('/BorrarLugar', $seguridad, $ChecarSesion, 'BorrarLugar');

    /*-----------------------  Ciudad ------------------------------------------*/
    $app->get('/GetCiudad/:id', $seguridad, $ChecarSesion, 'GetCiudad');
    $app->post('/AgregarCiudad', $seguridad, $ChecarSesion, 'AgregarCiudad');
    $app->put('/EditarCiudad', $seguridad, $ChecarSesion, 'EditarCiudad');
    $app->delete('/BorrarCiudad', $seguridad, $ChecarSesion, 'BorrarCiudad');

    /*-----------------------  Unidad ------------------------------------------*/
    $app->get('/GetUnidad/:id', $seguridad, $ChecarSesion, 'GetUnidad');
    $app->post('/AgregarUnidad', $seguridad, $ChecarSesion, 'AgregarUnidad');
    $app->put('/EditarUnidad', $seguridad, $ChecarSesion, 'EditarUnidad');
    $app->delete('/BorrarUnidad', $seguridad, $ChecarSesion, 'BorrarUnidad');

    /*-----------------------  Divisa ------------------------------------------*/
    $app->get('/GetDivisa/:id', $seguridad, $ChecarSesion, 'GetDivisa');
    $app->post('/AgregarDivisa', $seguridad, $ChecarSesion, 'AgregarDivisa');
    $app->put('/EditarDivisa', $seguridad, $ChecarSesion, 'EditarDivisa');
    $app->delete('/BorrarDivisa', $seguridad, $ChecarSesion, 'BorrarDivisa');

    /*-----------------------  Actividad ------------------------------------------*/
    $app->post('/GetActividad', $seguridad, $ChecarSesion, 'GetActividad');
    $app->post('/AgregarActividad', $seguridad, $ChecarSesion, 'AgregarActividad');
    $app->put('/EditarActividad', $seguridad, $ChecarSesion, 'EditarActividad');
    $app->delete('/BorrarActividad', $seguridad, $ChecarSesion, 'BorrarActividad');

    $app->get('/GetEtiquetaPorActividad/:id', $seguridad, $ChecarSesion, 'GetEtiquetaPorActividad');
    $app->get('/GetTemaPorActividad/:id', $seguridad, $ChecarSesion, 'GetTemaPorActividad');
    $app->get('/GetFechaActividad/:id', $seguridad, $ChecarSesion, 'GetFechaActividad');

    /*-----------------------  Evento Actividad ------------------------------------------*/
    $app->get('/GetEventoActividad/:id', $seguridad, $ChecarSesion, 'GetEventoActividad');
    $app->post('/AgregarEventoActividad', $seguridad, $ChecarSesion, 'AgregarEventoActividad');
    $app->put('/EditarEventoActividad', $seguridad, $ChecarSesion, 'EditarEventoActividad');
    $app->delete('/BorrarEventoActividad', $seguridad, $ChecarSesion, 'BorrarEventoActividad');

    $app->get('/GetPersonaEventoActividad/:id', $seguridad, $ChecarSesion, 'GetPersonaEventoActividad');

    

    //---------------------------------------------------------------------------------------------------------------Diario

    /*-----------------------  Diario ------------------------------------------*/
    $app->post('/GetFechaDiario', 'GetFechaDiario');
    $app->post('/GetDiario', $seguridad, $ChecarSesion, 'GetDiario');
    $app->post('/AgregarDiario', $seguridad, $ChecarSesion, 'AgregarDiario');
    $app->post('/EditarDiario', $seguridad, $ChecarSesion, 'EditarDiario');
    $app->delete('/BorrarDiario', $seguridad, $ChecarSesion, 'BorrarDiario');

    $app->get('/GetEtiquetaPorDiario/:id', $seguridad, $ChecarSesion, 'GetEtiquetaPorDiario');
    $app->get('/GetTemaPorDiario/:id', $seguridad, $ChecarSesion, 'GetTemaPorDiario');
    $app->get('/GetImagenDiario/:id', $seguridad, $ChecarSesion, 'GetImagenDiario');

    //---------------------------------------------------------------------------------------------------------------Notas

    /*-----------------------  Notas ------------------------------------------*/
    $app->get('/GetNotas/:id', $seguridad, $ChecarSesion, 'GetNotas');
    $app->post('/GetNotasPorId', $seguridad, $ChecarSesion, 'GetNotasPorId');
    $app->post('/AgregarNota', $seguridad, $ChecarSesion, 'AgregarNota');
    $app->post('/EditarNota', $seguridad, $ChecarSesion, 'EditarNota');
    $app->delete('/BorrarNota', $seguridad, $ChecarSesion, 'BorrarNota');

    $app->get('/GetEtiquetaPorNota/:id', $seguridad, $ChecarSesion, 'GetEtiquetaPorNota');
    $app->get('/GetTemaPorNota/:id', $seguridad, $ChecarSesion, 'GetTemaPorNota');
    $app->post('/GetNotasFiltro', $seguridad, $ChecarSesion, 'GetNotasFiltro');

    //---------------------------------------------------------------------------------------------------------------Buscador

    /*-----------------------  Notas ------------------------------------------*/
    $app->post('/GetBuscador', $seguridad, $ChecarSesion, 'GetBuscador');

    $app->post('/GetDiarioPorId', $seguridad, $ChecarSesion, 'GetDiarioPorId');
    $app->post('/GetActividadPorId', $seguridad, $ChecarSesion, 'GetActividadPorId');
    

    //---------------------------------------------------------------------------------------------------------------Imagenes  
    /*-----------------------  Imagenes ------------------------------------------*/
    $app->post('/GetGaleriaFotos', $seguridad, $ChecarSesion, 'GetGaleriaFotos');
    $app->post('/GetFototeca', $seguridad, $ChecarSesion, 'GetFototeca');
    $app->get('/GetImagenEtiqueta/:id', $seguridad, $ChecarSesion, 'GetImagenEtiqueta');


    $app->run(); 


?>