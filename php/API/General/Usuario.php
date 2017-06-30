<?php

function GetUsuarios()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT UsuarioId, Nombre, Apellidos, NombreUsuario, Correo, Activo FROM Usuario";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo json_encode($response);  
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function AgregarUsuario()
{
    $request = \Slim\Slim::getInstance()->request();
    $usuario = json_decode($request->getBody());
    global $app;
    
    $caracter = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $numero = strlen($caracter) - 1;
    $password = substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1);
    $password64 = md5($password);
    
    $sql = "INSERT INTO Usuario(Nombre, Apellidos, NombreUsuario, Correo, Password, Activo) 
            VALUES( :Nombre, :Apellidos, :NombreUsuario, :Correo, :Password, 1)";
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Nombre", $usuario->Nombre);
        $stmt->bindParam("Apellidos", $usuario->Apellidos);
        $stmt->bindParam("NombreUsuario", $usuario->NombreUsuario);
        $stmt->bindParam("Correo", $usuario->Correo);
        $stmt->bindParam("Password", $password64);

        $stmt->execute();
        $usuarioId = $db->lastInsertId();
    } 
    catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countPermiso = count($usuario->Permiso);
    if($countPermiso>0)  
    {
        $sql = "INSERT INTO PermisoPorUsuario (UsuarioId, PermisoId) VALUES";
        
        for($k=0; $k<$countPermiso; $k++)
        {
            if($usuario->Permiso[$k]->Usuario)
            {
                $sql .= " (".$usuarioId.", ".$usuario->Permiso[$k]->PermisoId."),";
            }
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();

            $db->commit();
            $db = null; 

            echo '[{"Estatus": "Exitoso"}]';
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallido"}]';
            echo $sql;
             echo $usuarioId;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    else
    {
        $db->commit();
        $db = null; 

        echo '[{"Estatus": "Exitoso"}]';
    }
    
    //Enviar Correo
    $to= $usuario->Correo;
    $subject_message = "Bienvenido al Sistema MQR.";
    $body_message = "Ya puedes acceder a Lifeabit (http://lifeabit.com/). Tu usuario y " .utf8_decode("contraseña"). " son los siguientes:";
    $body_message .= "\n\n";
    $body_message .="Usario: ". $usuario->Correo;
    $body_message .= "\n  ".utf8_decode("contraseña").": ". $password;
    $body_message .= "\n\n";
    $body_message .= "Te recomendamos entrar al sistema y cambiar tu ".utf8_decode("contraseña"). " inmediatamente." ;


    $header = "De: Sistema MQR\r\n";

    $bool = mail($to,$subject_message,$body_message,$header);
}


function EditarUsuario()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $usuario = json_decode($request->getBody());
   
    $sql = "UPDATE Usuario SET Nombre='".$usuario->Nombre."', Apellidos='".$usuario->Apellidos."', NombreUsuario='".$usuario->NombreUsuario."', Correo='".$usuario->Correo."' WHERE UsuarioId=".$usuario->UsuarioId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->execute();
    }
    catch(PDOException $e) 
    {    
        echo '[{"Estatus": "Fallido"}]';
        echo $sql;
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM PermisoPorUsuario WHERE UsuarioId=".$usuario->UsuarioId;
    try 
    {
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        echo $e;
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countPermiso = count($usuario->Permiso);
    if($countPermiso>0)  
    {
        $sql = "INSERT INTO PermisoPorUsuario (UsuarioId, PermisoId) VALUES";
        
        for($k=0; $k<$countPermiso; $k++)
        {
            if($usuario->Permiso[$k]->Usuario)
            {
                $sql .= " (".$usuario->UsuarioId.", ".$usuario->Permiso[$k]->PermisoId."),";
            }
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();

            $db->commit();
            $db = null; 

            echo '[{"Estatus": "Exitoso"}]';
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallido"}]';
            echo $sql;
             echo $usuarioId;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    else
    {
        $db->commit();
        $db = null; 

        echo '[{"Estatus": "Exitoso"}]';
    }
}

function ActivarDesactivarUsuario()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    try 
    {
        $db = getConnection();
        
        $sql = "UPDATE Usuario SET Activo = ".$datos[0]." WHERE UsuarioId = ".$datos[1]."";
        $stmt = $db->prepare($sql);
        $stmt->execute();
    
        $db = null;
        
        echo '[{"Estatus": "Exito"}]';
    }
    catch(PDOException $e) 
    {
        echo '[{"Estatus":"Fallo"}]';
        //echo ($sql);
        $app->status(409);
        $app->stop();
    }
}

function GetPermisoUsuario()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT p.PermisoId, p.UsuarioId FROM PermisoPorUsuario p";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo json_encode($response);  
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}


/*-------------------- Contraseña ------------------------*/
function RecuperarPassword()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $usuario = json_decode($request->getBody());
   
    $db;
    $stmt;
    $response;
    $contacto;
    $solicitud;
    $codigo;
    $sql = "SELECT UsuarioId, Correo FROM Usuario WHERE Correo= '".$usuario->Correo."' AND Activo = 1";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);  
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        //$app->status(409);
        $app->stop();
    }
    
    $count = count($response);
    if($count != 1)
    {
        echo '[ { "Estatus": "ErrorUsuario" } ]';
        $db = null;
        $app->stop();
    }
    else
    {   
        $sql = "SELECT SolicitudRecuperarPasswordId FROM SolicitudRecuperarPassword  WHERE FechaCaducidad > NOW() AND UsuarioId = ".$response[0]->UsuarioId;

        try 
        {
            $db = getConnection();
            $stmt = $db->query($sql);
            $solicitud = $stmt->fetchAll(PDO::FETCH_OBJ);

        } 
        catch(PDOException $e) 
        {
            echo '[ { "Estatus": "Fallo" } ]';
            //$app->status(409);
            $app->stop();
        }

        $caracter = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        $numero = strlen($caracter) - 1;
        $codigo = substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1).substr($caracter, rand(0, $numero), 1);
        $sql = "INSERT INTO SolicitudRecuperarPassword(UsuarioId, Codigo, Fecha, FechaCaducidad) VALUES(".$response[0]->UsuarioId.",'".$codigo."', NOW(), adddate(NOW(), INTERVAL 2 HOUR))";

        try 
        {
            $db->beginTransaction();
            $stmt = $db->prepare($sql);
            $stmt->execute();

        } catch(PDOException $e) 
        {
            echo $e;
            echo '[{"Estatus": "Fallido"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();   
        }

        $countSolicitud = count($solicitud);
        if($countSolicitud > 0)
        {
            for($k=0; $k<$countSolicitud; $k++)
            {
                $sql = "UPDATE SolicitudRecuperarPassword SET ESTATUS= 'Usado' WHERE SolicitudRecuperarPasswordId=".$solicitud[$k]->SolicitudRecuperarPasswordId;

                try 
                {
                    $stmt = $db->prepare($sql);
                    $stmt->execute();

                }
                catch(PDOException $e) 
                {
                    $db->rollBack();
                    echo '[{"Estatus":"Fallo"}]';
                    $app->status(409);
                    $app->stop();
                }
            }
            $db->commit();
            $db = null;
            echo '[ { "Estatus": "Exitoso" } ]';
        }
        else
        {
            $db->commit();
            $db = null;
            echo '[ { "Estatus": "Exitoso" } ]';
        } 
    }
    
    $to= $response[0]->Correo;
    $subject_message = "Recuperar contraseña";
    $body_message = "Accede al enlace especificado para que puedas reiniciar tu " .utf8_decode("contraseña");
    $body_message .= "\n\n";
    $body_message .="Enlace: http://lifeabit.com/#/RecuperarPassword/".$response[0]->UsuarioId."/".$codigo;

    $header = "De: Sistemas MQR K\r\n";

    $bool = mail($to,$subject_message,$body_message,$header);  
}

function ValidarRecuperarPassword()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();
    $solicitud = json_decode($request->getBody());
    
    
    $sql = "SELECT SolicitudRecuperarPasswordId FROM SolicitudRecuperarPassword WHERE FechaCaducidad > NOW() AND Estatus IS NULL AND UsuarioId = ".$solicitud->UsuarioId." AND Codigo = '".$solicitud->Codigo."'";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo '[ { "Estatus": "Exitoso"}, {"Solicitud":'.json_encode($response).'} ]';  
    } 
    catch(PDOException $e) 
    {
        //echo $e;
        echo '[ { "Estatus": "Fallo" } ]';
        //$app->status(409);
        $app->stop();
    }
}

function ReiniciarPassword()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $usuario = json_decode($request->getBody());
   
    $sql = "UPDATE Usuario SET Password='".$usuario->Password."' WHERE UsuarioId=".$usuario->UsuarioId."";
    $db;
    $stmt;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        $stmt->execute();
    }
    catch(PDOException $e) 
    {
        echo ($e);
        $db->rollBack();
        echo '[{"Estatus":"Fallo"}]';
        $app->status(409);
        $app->stop();
    }
    
    $sql = "UPDATE SolicitudRecuperarPassword SET Estatus='Usado' WHERE SolicitudRecuperarPasswordId=".$usuario->SolicitudRecuperarPasswordId."";
    try 
    {
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db->commit();
        $db = null;
        echo '[{"Estatus":"Exitoso"}]';
    }
    catch(PDOException $e) 
    {
        echo ($e);
        $db->rollBack();
        echo '[{"Estatus":"Fallo"}]';
        $app->status(409);
        $app->stop();
    }
}

function CambiarPasswordPorUsuario()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $usuario = json_decode($request->getBody());
    
    $db;
    $stmt;
    $response;
    $sql = "SELECT COUNT(*) as count FROM Usuario WHERE UsuarioId='".$usuario[0]."' AND Password = '".$usuario[1]."'";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
    } 
    catch(PDOException $e) 
    {
        //echo $e;
        echo '[ { "Estatus": "Fallo" } ]';
        //$app->status(409);
        $app->stop();
    }
    
    if($response[0]->count != "1")
    {
        echo '[ { "Estatus": "ErrorPassword" } ]';
        $db = null;
        $app->stop();
    }
    else
    {   
        $sql = "UPDATE Usuario SET Password='".$usuario[2]."' WHERE UsuarioId=".$usuario[0]."";

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $db = null;
            //if($stmt->rowCount() == 1)
            echo '[{"Estatus":"Exitoso"}]';
        }
        catch(PDOException $e) 
        {
            echo ($e);
            echo '[{"Estatus":"Fallo"}]';
            $app->status(409);
            $app->stop();
        }
    }
}

/*---------------------  Permiso --------------*/
function GetPermiso()
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT PermisoId, Nombre, AplicacionId, Clave, NombreAplicacion FROM PermisoVista";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo '[ { "Estatus": "Exitoso"}, {"Permiso":'.json_encode($response).'} ]';
        
        //echo json_encode($response);  
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

?>