<?php
	
function GetActividad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM ActividadVista WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Actividad":'.json_encode($response).'} ]'; 
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

function AgregarActividad()
{
    $request = \Slim\Slim::getInstance()->request();
    $actividad = json_decode($request->getBody());
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

    $sql = "INSERT INTO Actividad (UsuarioId, Nombre, Notas, FechaCreacion) VALUES(:UsuarioId, :Nombre, :Notas, :FechaCreacion)";
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("UsuarioId", $actividad->UsuarioId);
        $stmt->bindParam("Nombre", $actividad->Nombre);
        $stmt->bindParam("Notas", $actividad->Notas);
        $stmt->bindParam("FechaCreacion", $actividad->FechaCreacion);

        $stmt->execute();
        
        $actividadId = $db->lastInsertId();
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
    
    $countTema = count($actividad->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($actividad->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $actividad->UsuarioId);
                    $stmt->bindParam("Tema", $actividad->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $actividad->Tema[$k]->TemaActividadId = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    //echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }
        
        $sql = "INSERT INTO TemaPorActividad (ActividadId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$actividadId.", ".$actividad->Tema[$k]->TemaActividadId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallo"}]';
            //echo $e;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    $countEtiqueta = count($actividad->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($actividad->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $actividad->UsuarioId);
                    $stmt->bindParam("Nombre", $actividad->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $actividad->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    //echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }
        
        $sql = "INSERT INTO EtiquetaPorActividad (ActividadId, EtiquetaId) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            $sql .= " (".$actividadId.", ".$actividad->Etiqueta[$k]->EtiquetaId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallo"}]';
            //echo $e;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    $sql = "INSERT INTO FrecuenciaPorActividad (ActividadId, FrecuenciaId) VALUES(:ActividadId, :FrecuenciaId)";
    
    try 
    {
        $stmt = $db->prepare($sql);

        $stmt->bindParam("ActividadId", $actividadId);
        $stmt->bindParam("FrecuenciaId", $actividad->Frecuencia->FrecuenciaId);

        $stmt->execute();

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    if(strlen($actividad->Lugar->LugarId) > 0) 
    {
        $sql = "INSERT INTO LugarDefectoActividad (ActividadId, LugarId) VALUES(:ActividadId, :LugarId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("ActividadId", $actividadId);
            $stmt->bindParam("LugarId", $actividad->Lugar->LugarId);

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

    $sql = "SELECT FechaCreacion FROM Actividad WHERE ActividadId = '".$actividadId."'";
    
    try 
    {
        $stmt = $db->prepare($sql);

        $stmt->execute();
        
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[{"Estatus": "Exitoso"}, {"ActividadId":"'.$actividadId.'"}, {"FechaCreacion":"'.$response[0]->FechaCreacion.'"},  {"Etiqueta":'.json_encode($actividad->Etiqueta).'}, {"Tema":'.json_encode($actividad->Tema).'}]';
        $db->commit();
        $db = null;

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
}

function EditarActividad()
{
    $request = \Slim\Slim::getInstance()->request();
    $actividad = json_decode($request->getBody());
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

    $sql = "UPDATE Actividad SET Nombre = :Nombre, Notas = :Notas WHERE ActividadId = ".$actividad->ActividadId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Nombre", $actividad->Nombre);
        $stmt->bindParam("Notas", $actividad->Notas);

        $stmt->execute();

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM TemaPorActividad WHERE ActividadId=".$actividad->ActividadId;
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
    
    $sql = "DELETE FROM EtiquetaPorActividad WHERE ActividadId=".$actividad->ActividadId;
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
    
    $sql = "DELETE FROM FrecuenciaPorActividad WHERE ActividadId=".$actividad->ActividadId;
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
    
    $sql = "DELETE FROM LugarDefectoActividad WHERE ActividadId=".$actividad->ActividadId;
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
    
    $countTema = count($actividad->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($actividad->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $actividad->UsuarioId);
                    $stmt->bindParam("Tema", $actividad->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $actividad->Tema[$k]->TemaActividadId = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }
        
        $sql = "INSERT INTO TemaPorActividad (ActividadId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$actividad->ActividadId.", ".$actividad->Tema[$k]->TemaActividadId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallo"}]';
            echo $e;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    $countEtiqueta = count($actividad->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($actividad->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $actividad->UsuarioId);
                    $stmt->bindParam("Nombre", $actividad->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $actividad->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }
        
        $sql = "INSERT INTO EtiquetaPorActividad (ActividadId, EtiquetaId) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            $sql .= " (".$actividad->ActividadId.", ".$actividad->Etiqueta[$k]->EtiquetaId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallo"}]';
            echo $e;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    if(strlen($actividad->Lugar->LugarId) > 0) 
    {
        $sql = "INSERT INTO LugarDefectoActividad (ActividadId, LugarId) VALUES(:ActividadId, :LugarId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("ActividadId", $actividad->ActividadId);
            $stmt->bindParam("LugarId", $actividad->Lugar->LugarId);

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
    
    $sql = "INSERT INTO FrecuenciaPorActividad (ActividadId, FrecuenciaId) VALUES(:ActividadId, :FrecuenciaId)";
    
    try 
    {
        $stmt = $db->prepare($sql);

        $stmt->bindParam("ActividadId", $actividad->ActividadId);
        $stmt->bindParam("FrecuenciaId", $actividad->Frecuencia->FrecuenciaId);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"},  {"Etiqueta":'.json_encode($actividad->Etiqueta).'}, {"Tema":'.json_encode($actividad->Tema).'}]';
        $db->commit();
        $db = null;

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
}

function BorrarActividad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $actividadId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Actividad WHERE ActividadId=".$actividadId;
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
        echo $e;
        $app->status(409);
        $app->stop();
    }

}

//------------- Otas operaciones -----------------

function GetEtiquetaPorActividad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM EtiquetaActividadVista WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Etiqueta":'.json_encode($response).'} ]'; 
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

function GetTemaPorActividad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM TemaActividadVista WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Tema":'.json_encode($response).'} ]'; 
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

function GetFechaActividad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT ea.ActividadId, ea.Fecha FROM EventoActividad ea INNER JOIN Actividad a ON a.ActividadId = ea.ActividadId  WHERE a.UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Fecha":'.json_encode($response).'} ]'; 
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
