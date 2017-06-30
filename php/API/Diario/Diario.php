<?php
	
function GetDiario($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT DiarioId, Notas, Fecha FROM Diario WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Diario":'.json_encode($response).'} ]'; 
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

function AgregarDiario()
{
    $request = \Slim\Slim::getInstance()->request();
    $diario = json_decode($request->getBody());
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

    $sql = "INSERT INTO Diario (UsuarioId, Notas, Fecha) VALUES(:UsuarioId, :Notas, :Fecha)";
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("UsuarioId", $diario->UsuarioId);
        $stmt->bindParam("Fecha", $diario->Fecha);
        $stmt->bindParam("Notas", $diario->Notas);

        $stmt->execute();
        
        $diarioId = $db->lastInsertId();
        //echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        //$db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countTema = count($diario->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($diario->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $diario->UsuarioId);
                    $stmt->bindParam("Tema", $diario->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $diario->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorDiario (DiarioId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$diarioId.", ".$diario->Tema[$k]->TemaActividadId."),";
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
    
    $countEtiqueta = count($diario->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($diario->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $diario->UsuarioId);
                    $stmt->bindParam("Nombre", $diario->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $diario->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
        $sql = "INSERT INTO EtiquetaPorDiario (DiarioId, EtiquetaId) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            $sql .= " (".$diarioId.", ".$diario->Etiqueta[$k]->EtiquetaId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            echo '[{"Estatus": "Exitoso"}, {"DiarioId":"'.$diarioId.'"}, {"Etiqueta":'.json_encode($diario->Etiqueta).'}, {"Tema":'.json_encode($diario->Tema).'}]';
            $db->commit();
            $db = null;
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
    else
    {
        $db->commit();
        $db = null;
        echo '[{"Estatus": "Exitoso"}, {"DiarioId":"'.$diarioId.'"}, {"Etiqueta":'.json_encode($diario->Etiqueta).'}, {"Tema":'.json_encode($diario->Tema).'}]';
    }
}


function EditarDiario()
{
    $request = \Slim\Slim::getInstance()->request();
    $diario = json_decode($request->getBody());
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

    $sql = "UPDATE Diario SET Fecha = :Fecha, Notas = :Notas WHERE DiarioId = ".$diario->DiarioId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Notas", $diario->Notas);
        $stmt->bindParam("Fecha", $diario->Fecha);

        $stmt->execute();

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM TemaPorDiario WHERE DiarioId=".$diario->DiarioId;
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
    
    $sql = "DELETE FROM EtiquetaPorDiario WHERE DiarioId=".$diario->DiarioId;
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

    
    $countTema = count($diario->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($diario->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $diario->UsuarioId);
                    $stmt->bindParam("Tema", $diario->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $diario->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorDiario (DiarioId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$diario->DiarioId.", ".$diario->Tema[$k]->TemaActividadId."),";
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
    
    $countEtiqueta = count($diario->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($diario->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $diario->UsuarioId);
                    $stmt->bindParam("Nombre", $diario->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $diario->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
        $sql = "INSERT INTO EtiquetaPorDiario (DiarioId, EtiquetaId) VALUES";
        
        
        /*Etiqueta del diario*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            $sql .= " (".$diario->DiarioId.", ".$diario->Etiqueta[$k]->EtiquetaId."),";
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            echo '[{"Estatus": "Exitoso"},  {"Etiqueta":'.json_encode($diario->Etiqueta).'}, {"Tema":'.json_encode($diario->Tema).'}]';
            $db->commit();
            $db = null;

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
    else
    {
        $db->commit();
        $db = null;
        echo '[{"Estatus": "Exitoso"},  {"Etiqueta":'.json_encode($diario->Etiqueta).'}, {"Tema":'.json_encode($diario->Tema).'}]';
    }
    
}

function BorrarDiario()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $diarioId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Diario WHERE DiarioId =".$diarioId;
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

function GetEtiquetaPorDiario($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT DiarioId, EtiquetaId, Nombre FROM EtiquetaDiarioVista WHERE UsuarioId = ".$id;

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

function GetTemaPorDiario($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT DiarioId, TemaActividadId, Tema FROM TemaDiarioVista WHERE UsuarioId = ".$id;

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

    
?>
