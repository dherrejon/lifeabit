<?php
	
function GetEventoActividad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM EventoActividadVista WHERE ActividadId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Evento":'.json_encode($response).'} ]'; 
        $db = null;
 
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function AgregarEventoActividad()
{
    $request = \Slim\Slim::getInstance()->request();
    $evento = json_decode($request->getBody());
    global $app;
    
    //$cancion = json_decode($_POST['cancion']);
    
    /*if($_FILES['file']['error'] == 0)
    {
        $name = $_FILES['file']['name'];

        $archivo = addslashes(file_get_contents($_FILES['file']['tmp_name']));
        
         $sql = "INSERT INTO Cancion (UsuarioId, Titulo, Cancionero, NombreArchivo) VALUES(:UsuarioId, :Titulo, '".$archivo."', :NombreArchivo)";
    }
    else
    {
        echo '[ { "Estatus": "No se puedo leer el archivo" } ]';
        $app->stop();
    }*/

    $sql = "INSERT INTO EventoActividad (ActividadId, Fecha, Notas, Cantidad, Costo) VALUES(:ActividadId, :Fecha, :Notas, :Cantidad, :Costo)";
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("ActividadId", $evento->ActividadId);
        $stmt->bindParam("Fecha", $evento->Fecha);
        $stmt->bindParam("Notas", $evento->Notas);
        $stmt->bindParam("Cantidad", $evento->Cantidad);
        $stmt->bindParam("Costo", $evento->Costo);

        $stmt->execute();
        
        $eventoId = $db->lastInsertId();
        //echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        //$db = null;

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    if(strlen($evento->Lugar->LugarId) > 0) 
    {
        $sql = "INSERT INTO LugarEventoActividad (EventoActividadId, LugarId) VALUES(:EventoActividadId, :LugarId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("EventoActividadId", $eventoId);
            $stmt->bindParam("LugarId", $evento->Lugar->LugarId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            //echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    if(strlen($evento->Ciudad->CiudadId) > 0) 
    {
        $sql = "INSERT INTO CiudadEventoActividad (EventoActividadId, CiudadId) VALUES(:EventoActividadId, :CiudadId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("EventoActividadId", $eventoId);
            $stmt->bindParam("CiudadId", $evento->Ciudad->CiudadId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            //echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    if(strlen($evento->Unidad->UnidadId) > 0) 
    {
        $sql = "INSERT INTO UnidadEventoActividad (EventoActividadId, UnidadId) VALUES(:EventoActividadId, :UnidadId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("EventoActividadId", $eventoId);
            $stmt->bindParam("UnidadId", $evento->Unidad->UnidadId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            //echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    if(strlen($evento->Divisa->DivisaId) > 0) 
    {
        $sql = "INSERT INTO DivisaEventoActividad (EventoActividadId, DivisaId) VALUES(:EventoActividadId, :DivisaId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("EventoActividadId", $eventoId);
            $stmt->bindParam("DivisaId", $evento->Divisa->DivisaId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            //echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    echo '[{"Estatus": "Exitoso"}, {"Id":"'.$eventoId.'"}]';
    $db->commit();
    $db = null;

}

function EditarEventoActividad()
{
    $request = \Slim\Slim::getInstance()->request();
    $evento = json_decode($request->getBody());
    global $app;
    
    //$cancion = json_decode($_POST['cancion']);
    
    /*if($cancion->ArchivoSeleccionado)
    {
        if($_FILES['file']['error'] == 0)
        {
            $name = $_FILES['file']['name'];

            $archivo = addslashes(file_get_contents($_FILES['file']['tmp_name']));

             $sql = "UPDATE Cancion SET Titulo = :Titulo, Cancionero = '".$archivo."', NombreArchivo = '".$cancion->NombreArchivo."' WHERE CancionId = ".$cancion->CancionId;
        }
        else
        {
            echo '[ { "Estatus": "No se puedo leer el archivo" } ]';
            $app->stop();
        }
    }
    else
    {
         $sql = "UPDATE Cancion SET Titulo = :Titulo WHERE CancionId = ".$cancion->CancionId;
    }*/

    $sql = "UPDATE EventoActividad SET Fecha = :Fecha, Notas = :Notas,  Costo = :Costo,  Cantidad = :Cantidad WHERE EventoActividadId = ".$evento->EventoActividadId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Fecha", $evento->Fecha);
        $stmt->bindParam("Notas", $evento->Notas);
        $stmt->bindParam("Costo", $evento->Costo);
        $stmt->bindParam("Cantidad", $evento->Cantidad);

        $stmt->execute();

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM DivisaEventoActividad WHERE EventoActividadId=".$evento->EventoActividadId;
    try 
    {
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        //echo $e;
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM LugarEventoActividad WHERE EventoActividadId=".$evento->EventoActividadId;
    try 
    {
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        //echo $e;
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM UnidadEventoActividad WHERE EventoActividadId=".$evento->EventoActividadId;
    try 
    {
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        //echo $e;
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM CiudadEventoActividad WHERE EventoActividadId=".$evento->EventoActividadId;
    try 
    {
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        //echo $e;
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    if(strlen($evento->Lugar->LugarId) > 0) 
    {
        $sql = "INSERT INTO LugarEventoActividad (EventoActividadId, LugarId) VALUES(:EventoActividadId, :LugarId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("EventoActividadId", $evento->EventoActividadId);
            $stmt->bindParam("LugarId", $evento->Lugar->LugarId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            //echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    if(strlen($evento->Ciudad->CiudadId) > 0) 
    {
        $sql = "INSERT INTO CiudadEventoActividad (EventoActividadId, CiudadId) VALUES(:EventoActividadId, :CiudadId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("EventoActividadId", $evento->EventoActividadId);
            $stmt->bindParam("CiudadId", $evento->Ciudad->CiudadId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            //echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    if(strlen($evento->Unidad->UnidadId) > 0) 
    {
        $sql = "INSERT INTO UnidadEventoActividad (EventoActividadId, UnidadId) VALUES(:EventoActividadId, :UnidadId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("EventoActividadId", $evento->EventoActividadId);
            $stmt->bindParam("UnidadId", $evento->Unidad->UnidadId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            //echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    if(strlen($evento->Divisa->DivisaId) > 0) 
    {
        $sql = "INSERT INTO DivisaEventoActividad (EventoActividadId, DivisaId) VALUES(:EventoActividadId, :DivisaId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("EventoActividadId", $evento->EventoActividadId);
            $stmt->bindParam("DivisaId", $evento->Divisa->DivisaId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            //echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    echo '[{"Estatus": "Exitoso"}]';
    $db->commit();
    $db = null;
    
  
    
}


function BorrarEventoActividad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $eventoId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM EventoActividad WHERE EventoActividadId=".$eventoId;
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
        $db = null;
        echo '[ { "Estatus": "Exitoso" } ]';
        
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        //echo $e;
        $app->status(409);
        $app->stop();
    }

}


//------------------------------------------ Otros Catálogos---------------------
function GetPersonaEventoActividad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM PersonaEventoActividadVista WHERE ActividadId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Persona":'.json_encode($response).'} ]'; 
        $db = null;
 
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
