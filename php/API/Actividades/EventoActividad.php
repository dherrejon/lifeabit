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
        
        //echo '[ { "Estatus": "Exito"}, {"Evento":'.json_encode($response).'} ]'; 
        //$db = null;
 
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $countEvento = count($response);
    
    if($countEvento > 0)
    {
        for($k=0; $k<$countEvento; $k++)
        {
            $sql = "SELECT EventoActividadId, EtiquetaId, Nombre, Visible FROM EtiquetaEventoVista WHERE EventoActividadId = ".$response[$k]->EventoActividadId;

            try 
            {
                $stmt = $db->query($sql);
                $response[$k]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);
            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
            
            $sql = "SELECT EventoActividadId, TemaActividadId, Tema FROM TemaEventoVista WHERE EventoActividadId = ".$response[$k]->EventoActividadId;

            try 
            {
                $stmt = $db->query($sql);
                $response[$k]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);
            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
            
            /*$sql = "SELECT ImagenId, Nombre, Extension, Size FROM ImagenDiarioVista WHERE DiarioId = ".$response[$k]->DiarioId;

            try 
            {
                $stmt = $db->query($sql);
                $response[$k]->Imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }*/
        }
    }
    
    echo '[ { "Estatus": "Exito"}, {"Evento":'.json_encode($response).'} ]'; 
    $db = null;$app->stop();
    
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

    $sql = "INSERT INTO EventoActividad (ActividadId, Fecha, Notas, Cantidad, Costo, Hora) VALUES(:ActividadId, :Fecha, :Notas, :Cantidad, :Costo, STR_TO_DATE( :Hora, '%h:%i %p' ))";
    
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
        $stmt->bindParam("Hora", $evento->Hora);

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
    
    $countTema = count($evento->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($evento->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $evento->UsuarioId);
                    $stmt->bindParam("Tema", $evento->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $evento->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorEvento (EventoActividadId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$eventoId.", ".$evento->Tema[$k]->TemaActividadId."),";
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
    
    $countEtiqueta = count($evento->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($evento->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $evento->UsuarioId);
                    $stmt->bindParam("Nombre", $evento->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $evento->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
        $sql = "INSERT INTO EtiquetaPorEvento (EventoActividadId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($evento->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$eventoId.", ".$evento->Etiqueta[$k]->EtiquetaId.", true),";
            }
            else
            {
                $sql .= " (".$eventoId.", ".$evento->Etiqueta[$k]->EtiquetaId.", false),";
            }
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
        
        $sql = "UPDATE Divisa SET PorDefecto = 0 WHERE PorDefecto = 1 AND UsuarioId = :UsuarioId";
    
        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("UsuarioId", $evento->UsuarioId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }

        $sql = "UPDATE Divisa SET PorDefecto = 1 WHERE DivisaId = :DivisaId";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("DivisaId", $evento->Divisa->DivisaId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    echo '[{"Estatus": "Exitoso"}, {"Id":"'.$eventoId.'"}, {"Etiqueta":'.json_encode($evento->Etiqueta).'}, {"Tema":'.json_encode($evento->Tema).'}]';
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

    $sql = "UPDATE EventoActividad SET Fecha = :Fecha, Notas = :Notas,  Costo = :Costo,  Cantidad = :Cantidad, Hora = STR_TO_DATE( :Hora, '%h:%i %p' ) WHERE EventoActividadId = ".$evento->EventoActividadId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Fecha", $evento->Fecha);
        $stmt->bindParam("Notas", $evento->Notas);
        $stmt->bindParam("Costo", $evento->Costo);
        $stmt->bindParam("Cantidad", $evento->Cantidad);
        $stmt->bindParam("Hora", $evento->Hora);

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
    
    $sql = "DELETE FROM TemaPorEvento WHERE EventoActividadId=".$evento->EventoActividadId;
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
    
    $sql = "DELETE FROM EtiquetaPorEvento WHERE EventoActividadId=".$evento->EventoActividadId;
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
    
    $countTema = count($evento->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($evento->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $evento->UsuarioId);
                    $stmt->bindParam("Tema", $evento->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $evento->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorEvento (EventoActividadId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$evento->EventoActividadId.", ".$evento->Tema[$k]->TemaActividadId."),";
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
            echo $sql;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    $countEtiqueta = count($evento->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($evento->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $evento->UsuarioId);
                    $stmt->bindParam("Nombre", $evento->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $evento->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $e;
                    //$db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
            }
        }
        
        $sql = "INSERT INTO EtiquetaPorEvento (EventoActividadId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($evento->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$evento->EventoActividadId.", ".$evento->Etiqueta[$k]->EtiquetaId.", true),";
            }
            else
            {
                $sql .= " (".$evento->EventoActividadId.", ".$evento->Etiqueta[$k]->EtiquetaId.", false),";
            }
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
        
         $sql = "UPDATE Divisa SET PorDefecto = 0 WHERE PorDefecto = 1 AND UsuarioId = :UsuarioId";
    
        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("UsuarioId", $evento->UsuarioId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }

        $sql = "UPDATE Divisa SET PorDefecto = 1 WHERE DivisaId = :DivisaId";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("DivisaId", $evento->Divisa->DivisaId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    
    echo '[{"Estatus": "Exitoso"}, {"Etiqueta":'.json_encode($evento->Etiqueta).'}, {"Tema":'.json_encode($evento->Tema).'}]';
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

function HechoEvento()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $eventoId = json_decode($request->getBody());
   
    
    $sql = "UPDATE EventoActividad SET Hecho = '1', FechaHecho = NOW() WHERE EventoActividadId=".$eventoId;
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
