<?php
	
function GetActividad()
{
    $request = \Slim\Slim::getInstance()->request();
    $filtro = json_decode($request->getBody());
    global $app;
    
    $numTema = count($filtro->tema);
    $numEtiqueta = count($filtro->etiqueta);
    
    if($numEtiqueta == 0 && $numTema == 0 && strlen($filtro->fecha->Fecha) == 0)
    {
        $sql = "SELECT  ActividadId, Nombre, DATE_FORMAT(Hora, '%h:%i %p') as Hora FROM Actividad WHERE UsuarioId = ".$filtro->UsuarioId;
    }
    else
    {
        $sqlEtiquetaActividad = "";
        $sqlEtiquetaBaseActividad1 = " SELECT e.ActividadId FROM EtiquetaActividadVista e WHERE EtiquetaId IN ";
        $sqlEtiquetaBaseActividad2 = " GROUP BY e.ActividadId";
        
        if($numTema > 0)
        {
            $whereTema = "(";

            for($k=0; $k<$numTema; $k++)
            {
                $whereTema .= $filtro->tema[$k]->TemaActividadId. ",";
            }
            $whereTema = rtrim($whereTema,",");
            $whereTema .= ")";
        }
        
        if($numEtiqueta > 0)
        {
            //Equivalencias
            for($k=0; $k<$numEtiqueta; $k++)
            {
                $sql = "SELECT IF(EtiquetaId1=".$filtro->etiqueta[$k]->EtiquetaId.", EtiquetaId2, EtiquetaId1) as EtiquetaId
                        FROM EtiquetaEquivalenteVista
                        WHERE EtiquetaId1 = ".$filtro->etiqueta[$k]->EtiquetaId." OR EtiquetaId2 =".$filtro->etiqueta[$k]->EtiquetaId;

                try 
                {
                    $db = getConnection();
                    $stmt = $db->query($sql);
                    $filtro->etiqueta[$k]->Equivalente = $stmt->fetchAll(PDO::FETCH_OBJ);
                } 

                catch(PDOException $e) 
                {
                    echo($e);
                    echo '[ { "Estatus": '.$e.' } ]';
                    $app->status(409);
                    $app->stop();
                }
            }



            //Crear IN en el where de etiquetas        
            for($k=0; $k<$numEtiqueta; $k++)
            {
                $whereEtiqueta = "(";
                $whereEtiqueta .= $filtro->etiqueta[$k]->EtiquetaId. ",";


                $numEquivalente = count($filtro->etiqueta[$k]->Equivalente);
                for($i=0; $i<$numEquivalente; $i++)
                {
                    $whereEtiqueta .= $filtro->etiqueta[$k]->Equivalente[$i]->EtiquetaId. ",";
                }

                $whereEtiqueta = rtrim($whereEtiqueta,",");
                $whereEtiqueta .= ")";

                //$filtro->etiqueta[$k]->Where = $whereEtiqueta;

                if($k==0)
                {
                    $sqlEtiquetaActividad .= $sqlEtiquetaBaseActividad1.$whereEtiqueta.$sqlEtiquetaBaseActividad2;
                }
                else
                {
                    $sqlEtiquetaActividad .= " UNION ALL ".$sqlEtiquetaBaseActividad1.$whereEtiqueta.$sqlEtiquetaBaseActividad2;
                }
            }
        }
        
        if($numEtiqueta > 0 && $numTema > 0)
        {
            $sql = "SELECT a.ActividadId, a.Nombre, DATE_FORMAT(a.Hora, '%h:%i %p') as Hora FROM Actividad a 
                    INNER JOIN ("
                        .$sqlEtiquetaActividad.
                
                    " UNION ALL SELECT t.ActividadId FROM TemaActividadVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.ActividadId HAVING count(*) = ".$numTema.
                
                    ") x ON x.ActividadId = a.ActividadId";
            
            
            if(strlen($filtro->fecha->Fecha) > 0)
            {
                $sql .= " WHERE a.ActividadId IN (SELECT aa.ActividadId FROM Actividad aa

                            INNER JOIN (SELECT DISTINCT e.ActividadId FROM EventoActividad e WHERE  Fecha = '". $filtro->fecha->Fecha."') y
                            ON y.ActividadId = aa.ActividadId
                            WHERE UsuarioId = '".$filtro->UsuarioId ."')";
            }
            
            $sql .= " GROUP BY a.ActividadId HAVING count(*) = ".($numEtiqueta + 1);
        }
        else if($numEtiqueta > 0 || $numTema > 0)
        {
            if($numEtiqueta > 0)
            {
                $sql = "SELECT a.ActividadId, a.Nombre, DATE_FORMAT(a.Hora, '%h:%i %p') as Hora FROM Actividad a 
                    INNER JOIN ("
                        .$sqlEtiquetaActividad.
                    ") x ON x.ActividadId = a.ActividadId ";

            }
            else if($numTema > 0)
            {

                $sql = "SELECT a.ActividadId, a.Nombre, DATE_FORMAT(a.Hora, '%h:%i %p') as Hora FROM Actividad a
                    INNER JOIN (
                        SELECT t.ActividadId FROM TemaActividadVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.ActividadId HAVING count(*) = ".$numTema."
                    ) x ON x.ActividadId = a.ActividadId";
            }
            if(strlen($filtro->fecha->Fecha) > 0)
            {
                $sql .= " WHERE a.ActividadId IN (SELECT aa.ActividadId FROM Actividad aa

                            INNER JOIN (SELECT DISTINCT e.ActividadId FROM EventoActividad e WHERE  Fecha = '". $filtro->fecha->Fecha."') y
                            ON y.ActividadId = aa.ActividadId
                            WHERE UsuarioId = '".$filtro->UsuarioId ."')";
            }
            if($numEtiqueta > 0)
            {
                $sql .= " GROUP BY a.ActividadId HAVING count(*) = ".$numEtiqueta;
            }
        }
        else if(strlen($filtro->fecha->Fecha) > 0)
        {
            $sql = "SELECT a.ActividadId, a.Nombre, DATE_FORMAT(a.Hora, '%h:%i %p') as Hora FROM Actividad a

                            INNER JOIN (SELECT DISTINCT e.ActividadId FROM EventoActividad e WHERE  Fecha = '". $filtro->fecha->Fecha."') x
                            ON x.ActividadId = a.ActividadId
                            WHERE UsuarioId = '".$filtro->UsuarioId ."'";
        }
    }
    
    /*if(strlen($filtro->fecha->Fecha) > 0)
    {
        $sql = "SELECT a.ActividadId, a.Nombre FROM Actividad a
                        
                        INNER JOIN (SELECT DISTINCT e.ActividadId FROM EventoActividad e WHERE  Fecha = '". $filtro->fecha->Fecha."') x
                        ON x.ActividadId = a.ActividadId
                        WHERE UsuarioId = '".$filtro->UsuarioId ."'";
    }
    else
    {
        $sql = "SELECT ActividadId, Nombre FROM Actividad WHERE UsuarioId = '".$filtro->UsuarioId ."'";
    }*/

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        //echo '[ { "Estatus": "Exito"}, {"Actividad":'.json_encode($response).'} ]'; 
        //$db = null;
 
    } 
    catch(PDOException $e) 
    {
        echo($sql);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $numAct = count($response);
    
    for($k=0; $k<$numAct; $k++)
    {
        $sql = "SELECT Hecho, Fecha, EventoActividadId FROM EventoActividad WHERE ActividadId = ".$response[$k]->ActividadId;
        
        try 
        {
            $db = getConnection();
            $stmt = $db->query($sql);
            $response[$k]->EventoAux = $stmt->fetchAll(PDO::FETCH_OBJ);
        } 
        catch(PDOException $e) 
        {
            echo($sql);
            echo '[ { "Estatus": "Fallo" } ]';
            $app->status(409);
            $app->stop();
        }
    }
    
    echo '[ { "Estatus": "Exito"}, {"Actividad":'.json_encode($response).'} ]'; 
    $db = null;
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

    $sql = "INSERT INTO Actividad (UsuarioId, Nombre, Notas, FechaCreacion, Hora) VALUES(:UsuarioId, :Nombre, :Notas, :FechaCreacion, STR_TO_DATE( :Hora, '%h:%i %p' ))";
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("UsuarioId", $actividad->UsuarioId);
        $stmt->bindParam("Nombre", $actividad->Nombre);
        $stmt->bindParam("Notas", $actividad->Notas);
        $stmt->bindParam("FechaCreacion", $actividad->FechaCreacion);
        $stmt->bindParam("Hora", $actividad->Hora);

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
        
        $sql = "INSERT INTO EtiquetaPorActividad (ActividadId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($actividad->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$actividadId.", ".$actividad->Etiqueta[$k]->EtiquetaId.", true),";
            }
            else
            {
                $sql .= " (".$actividadId.", ".$actividad->Etiqueta[$k]->EtiquetaId.", false),";
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

    $sql = "UPDATE Actividad SET Nombre = :Nombre, Notas = :Notas, Hora = STR_TO_DATE( :Hora, '%h:%i %p' ) WHERE ActividadId = ".$actividad->ActividadId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Nombre", $actividad->Nombre);
        $stmt->bindParam("Notas", $actividad->Notas);
        $stmt->bindParam("Hora", $actividad->Hora);

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
        
        $sql = "INSERT INTO EtiquetaPorActividad (ActividadId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($actividad->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$actividad->ActividadId.", ".$actividad->Etiqueta[$k]->EtiquetaId.", true),";
            }
            else
            {
                $sql .= " (".$actividad->ActividadId.", ".$actividad->Etiqueta[$k]->EtiquetaId.", false),";
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

function GetActividadPorIdDatos()
{
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    global $app;
    
    $sql = "SELECT * FROM ActividadVista WHERE ActividadId = ".$datos->Id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $actividad = $stmt->fetchAll(PDO::FETCH_OBJ);
 
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $numActividad = count($actividad);
    
    if($numActividad > 0)
    {
        for($k=0; $k<$numActividad; $k++)
        {
            $sql = "SELECT EtiquetaId, Nombre, Visible, count FROM EtiquetaActividadVista WHERE ActividadId = ".$actividad[$k]->ActividadId;
            
            try 
            {
                $stmt = $db->query($sql);
                $actividad[$k]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);

            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
            
            $sql = "SELECT TemaActividadId, Tema FROM TemaActividadVista WHERE ActividadId = ".$actividad[$k]->ActividadId;
            
            try 
            {
                $stmt = $db->query($sql);
                $actividad[$k]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);
            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
            
            $sql = "SELECT EventoActividadId, Fecha, Hora, Lugar, LugarId, Hecho FROM EventoActividadVista WHERE  ActividadId = ".$actividad[$k]->ActividadId;
            
            try 
            {
                $stmt = $db->query($sql);
                $actividad[$k]->Evento = $stmt->fetchAll(PDO::FETCH_OBJ);
            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
            
            /*$countEvento = count($actividad[$k]->Evento);
    
            if($countEvento > 0)
            {
                for($j=0; $j<$countEvento; $j++)
                {
                    $sql = "SELECT EventoActividadId, EtiquetaId, Nombre, Visible, count FROM EtiquetaEventoVista WHERE EventoActividadId = ".$actividad[$k]->Evento[$j]->EventoActividadId;

                    try 
                    {
                        $stmt = $db->query($sql);
                        $actividad[$k]->Evento[$j]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);
                    } 
                    catch(PDOException $e) 
                    {
                        //echo($e);
                        echo '[ { "Estatus": "Fallo" } ]';
                        $app->status(409);
                        $app->stop();
                    }

                    $sql = "SELECT EventoActividadId, TemaActividadId, Tema FROM TemaEventoVista WHERE EventoActividadId = ".$actividad[$k]->Evento[$j]->EventoActividadId;

                    try 
                    {
                        $stmt = $db->query($sql);
                        $actividad[$k]->Evento[$j]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);
                    } 
                    catch(PDOException $e) 
                    {
                        //echo($e);
                        echo '[ { "Estatus": "Fallo" } ]';
                        $app->status(409);
                        $app->stop();
                    }

                    $sql = "SELECT ImagenId, Nombre, Extension, Size FROM ImagenEventoVista WHERE EventoActividadId = ".$actividad[$k]->Evento[$j]->EventoActividadId;

                    try 
                    {
                        $stmt = $db->query($sql);
                        $actividad[$k]->Evento[$j]->Imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
                    } 
                    catch(PDOException $e) 
                    {
                        //echo($e);
                        echo '[ { "Estatus": "Fallo" } ]';
                        $app->status(409);
                        $app->stop();
                    }
                }
            }*/
        }
    }
    
    $app->status(200);
    $db = null;
    echo json_encode($actividad);
    
}
    
?>
