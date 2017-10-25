<?php
	
function GetNotas($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT NotaId, Titulo, FechaModificacion, Fecha FROM Nota WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Notas":'.json_encode($response).'} ]'; 
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

function GetNotasPorId()
{
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    global $app;
    
    
    //if($datos->Tipo == "Nota")
    //{
    $sql = "SELECT * FROM Nota WHERE NotaId = ".$datos->Id;
    //}
    /*else if($datos->Tipo == "Etiqueta")
    {
        $sql = "SELECT * FROM Nota n INNER JOIN EtiquetaPorNota en ON en.NotaId = n.NotaId WHERE en.EtiquetaId = " .$datos->Id;
    }
    else if($datos->Tipo == "Tema")
    {
        $sql = "SELECT * FROM Nota n INNER JOIN TemaPorNota tn ON tn.NotaId = n.NotaId WHERE tn.TemaActividadId = " .$datos->Id;
    }*/

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $nota = $stmt->fetchAll(PDO::FETCH_OBJ);
 
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $numNota = count($nota);
    
    if($numNota > 0)
    {
        for($k=0; $k<$numNota; $k++)
        {
            $sql = "SELECT EtiquetaId, Nombre, Visible, count FROM EtiquetaNotaVista WHERE NotaId = ".$nota[$k]->NotaId;
            
            try 
            {
                $stmt = $db->query($sql);
                $nota[$k]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);

            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
            
            
            $sql = "SELECT TemaActividadId, Tema FROM TemaNotaVista WHERE NotaId = ".$nota[$k]->NotaId;
            
            try 
            {
                $stmt = $db->query($sql);
                $nota[$k]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);

            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
            
            $sql = "SELECT ImagenId, Nombre, Extension, Size FROM ImagenNotaVista WHERE NotaId = ".$nota[$k]->NotaId;
            
            try 
            {
                $stmt = $db->query($sql);
                
                $response = $stmt->fetchAll(PDO::FETCH_OBJ);
                
                /*foreach ($response as $aux) 
                {
                    $aux->Imagen =  base64_encode($aux->Imagen);
                }*/
                
                $nota[$k]->Imagen = $response;
            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
        }
    }
    
    $db = null;
    echo '[{"Estatus": "Exito"},  {"Notas":'.json_encode($nota).'}]';
    
}

function GetNotasFiltro()
{
    $request = \Slim\Slim::getInstance()->request();
    $filtro = json_decode($request->getBody());
    global $app;
    
    
    $numTema = count($filtro->tema);
    $numEtiqueta = count($filtro->etiqueta);
    
    $sqlEtiquetaNota = "";
    $sqlEtiquetaBaseNota1 = " SELECT e.NotaId FROM EtiquetaNotaVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseNota2 = " GROUP BY e.NotaId";
    
    
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
                $sqlEtiquetaNota .= $sqlEtiquetaBaseNota1.$whereEtiqueta.$sqlEtiquetaBaseNota2;
            }
            else
            {
                $sqlEtiquetaNota .= " UNION ALL ".$sqlEtiquetaBaseNota1.$whereEtiqueta.$sqlEtiquetaBaseNota2;
            }
        }
    }
    
    
    if($numEtiqueta > 0 && $numTema > 0)
    {
         $sql = "SELECT n.NotaId, n.Titulo, n.FechaModificacion FROM Nota n
                    INNER JOIN ("
                        .$sqlEtiquetaNota.
             
                    " UNION ALL SELECT t.NotaId FROM TemaNotaVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.NotaId HAVING count(*) = ".$numTema.
             
                    ") x ON x.NotaId = n.NotaId";
        
        if($filtro->fecha != "")
        {
            $sql .= " WHERE  Fecha = '". $filtro->fecha."'";
        }
        
        $sql .= " GROUP BY n.NotaId  HAVING count(*) = ".($numEtiqueta+1);
    }
    else if($numEtiqueta > 0 || $numTema > 0)
    {
        if($numEtiqueta > 0)
        {
            $sql = "SELECT n.NotaId, n.Titulo, n.FechaModificacion FROM Nota n 
                    INNER JOIN ("
                        .$sqlEtiquetaNota.
                    ") x ON x.NotaId = n.NotaId";
        }
        else if($numTema > 0)
        {
            $sql = "SELECT n.NotaId, n.Titulo, n.FechaModificacion FROM Nota n
                    INNER JOIN (
                        SELECT t.NotaId FROM TemaNotaVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.NotaId HAVING count(*) = ".$numTema."
                    ) x ON x.NotaId = n.NotaId";
        }
        
        if($filtro->fecha != "")
        {
            $sql .= " WHERE  Fecha = '". $filtro->fecha."'";
        }
        if($numEtiqueta > 0)
        {
            $sql .= " GROUP BY n.NotaId  HAVING count(*) = ".$numEtiqueta;
        }
    }
    else
    {
        $sql = "SELECT n.NotaId, n.Titulo, n.FechaModificacion FROM Nota n WHERE UsuarioId = ".$filtro->usuarioId;
        
        if($filtro->fecha != "")
        {
            $sql .= " AND  Fecha = '". $filtro->fecha."'";
        }
    }
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $nota = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[{"Estatus": "Exito"},  {"Notas":'.json_encode($nota).'}]';
        $db = null;
    } 
    catch(PDOException $e) 
    {
        echo($sql);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
}

function AgregarNota()
{
    $request = \Slim\Slim::getInstance()->request();
    $nota = json_decode($_POST['nota']);
    global $app;

    $sql = "INSERT INTO Nota (UsuarioId, Notas, Fecha, Titulo,  Observacion, FechaModificacion) VALUES(:UsuarioId, :Notas, :Fecha, :Titulo, :Observacion, NOW())";
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("UsuarioId", $nota->UsuarioId);
        $stmt->bindParam("Fecha", $nota->Fecha);
        $stmt->bindParam("Notas", $nota->Notas);
        $stmt->bindParam("Titulo", $nota->Titulo);
        $stmt->bindParam("Observacion", $nota->Observacion);

        $stmt->execute();
        
        $notaId = $db->lastInsertId();
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
    
    $sql = "SELECT FechaModificacion FROM Nota WHERE NotaId = ".$notaId;
    
    try 
    {
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $nota->FechaModificacion = $response[0]->FechaModificacion;

    } 
    catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countFile = 0;
    if($nota->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$nota->UsuarioId."/IMG/";
        if(!is_dir("ArchivosUsuario/".$nota->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$nota->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        for($k=0; $k<$countFile; $k++)
        {
            if($_FILES['file']['error'][$k] == 0)
            {
                $count++;
                
                $name = $_FILES['file']['name'][$k];
                $size = $_FILES['file']['size'][$k];
                $ext = pathinfo($name, PATHINFO_EXTENSION);
                //$imagen = addslashes(file_get_contents($_FILES['file']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Imagen (Imagen, Nombre, Extension, Size, UsuarioId) VALUES (null, '".$name."', '".$ext."', ".$size.", ".$nota->UsuarioId.")";
                
                try 
                {
                    $stmt = $db->prepare($sql);                
                    $stmt->execute();
                    
                    $imagenId[$k]  = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $sql;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
                
                //Subir Imagen
                //$uploadfile = $_FILES['file']['name'];
                move_uploaded_file($_FILES['file']['tmp_name'][$k], $dir.$name);
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($nota->ImagenSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$nota->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$nota->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                
                //----------------------- Temas ---------------------------------
                $countTema = count($nota->ImagenSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$nota->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
            }
            else
            {
                $imagenId[$k] = 0;
            }
            
        }
        
        if($count > 0)
        {
            $sql = "INSERT INTO ImagenPorNota (NotaId, ImagenId) VALUES";
            
            //Imagen de la nota
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$notaId.", ".$imagenId[$k]."),";
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
                echo $sql;
                $db->rollBack();
                $app->status(409);
                $app->stop();
            }
        }
    }
    
     $countImg = count($nota->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorNota (NotaId, ImagenId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countImg; $k++)
        {
            if(!$nota->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$notaId.", ".$nota->Imagen[$k]->ImagenId."),";
            }
        }
        if($count > 0)
        {
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
        
        
        //----------------------- Etiquetas --------------------
        for($k=0; $k<$countImg; $k++)
        {
            $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$nota->Imagen[$k]->ImagenId;
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

            $countEtiqueta = count($nota->Imagen[$k]->Etiqueta);
            if($countEtiqueta > 0)
            {
                $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                for($i=0; $i<$countEtiqueta; $i++)
                {
                    $sql .= " (".$nota->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$nota->Imagen[$k]->ImagenId.", '".$nota->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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


            //----------------------- Temas ---------------------------------
            $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$nota->Imagen[$k]->ImagenId;
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

            $countTema = count($nota->Imagen[$k]->Tema);

            if($countTema > 0)
            {
                $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                for($i=0; $i<$countTema; $i++)
                {
                    $sql .= " (".$nota->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$nota->Imagen[$k]->ImagenId."),";
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
        }
    }
    
    $countTema = count($nota->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($nota->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $nota->UsuarioId);
                    $stmt->bindParam("Tema", $nota->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $nota->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorNota (NotaId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$notaId.", ".$nota->Tema[$k]->TemaActividadId."),";
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
    
    $countEtiqueta = count($nota->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($nota->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $nota->UsuarioId);
                    $stmt->bindParam("Nombre", $nota->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $nota->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
        $sql = "INSERT INTO EtiquetaPorNota (NotaId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($nota->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$notaId.", ".$nota->Etiqueta[$k]->EtiquetaId.", true),";
            }
            else
            {
                $sql .= " (".$notaId.", ".$nota->Etiqueta[$k]->EtiquetaId.", false),";
            }
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            echo '[{"Estatus": "Exitoso"}, {"NotaId":"'.$notaId.'"}, {"Etiqueta":'.json_encode($nota->Etiqueta).'}, {"Tema":'.json_encode($nota->Tema).'}, {"FechaModificacion": "'.$nota->FechaModificacion.'"}]';
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
        echo '[{"Estatus": "Exitoso"}, {"NotaId":"'.$notaId.'"}, {"Etiqueta":'.json_encode($nota->Etiqueta).'}, {"Tema":'.json_encode($nota->Tema).'}, {"FechaModificacion": "'.$nota->FechaModificacion.'"}]';
    }
}

function EditarNota()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();

    $nota = json_decode($_POST['nota']);
    
    //$cancion = json_decode($_POST['cancion']);
    
    $sql = "UPDATE Nota SET Notas = :Notas, Titulo= :Titulo, Fecha = :Fecha, Observacion = :Observacion, FechaModificacion = NOW() WHERE NotaId = ".$nota->NotaId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Notas", $nota->Notas);
        $stmt->bindParam("Titulo", $nota->Titulo);
        $stmt->bindParam("Fecha", $nota->Fecha);
        $stmt->bindParam("Observacion", $nota->Observacion);

        $stmt->execute();

    } catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "SELECT FechaModificacion FROM Nota WHERE NotaId = ".$nota->NotaId;
    
    try 
    {
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $nota->FechaModificacion = $response[0]->FechaModificacion;
    } 
    catch(PDOException $e) 
    {
        //echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM TemaPorNota WHERE NotaId =".$nota->NotaId;
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
    
    $sql = "DELETE FROM EtiquetaPorNota WHERE NotaId =".$nota->NotaId;
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
    
    $sql = "DELETE FROM ImagenPorNota WHERE NotaId =".$nota->NotaId;
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
    
    /*$countImagen = count($nota->Imagen);
    
    for($k=0; $k<$countImagen; $k++)
    {
        if($nota->Imagen[$k]->Eliminada == true)
        {
            $sql = "DELETE FROM ImagenPorNota WHERE NotaId = ".$nota->NotaId. " AND ImagenId = ".$nota->Imagen[$k]->ImagenId;
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
        }
    }*/
    
    $countFile = 0;
    if($nota->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    
    $dir = "ArchivosUsuario/".$nota->UsuarioId."/IMG/";
        if(!is_dir("ArchivosUsuario/".$nota->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$nota->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }

    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$nota->UsuarioId."/IMG/";
        if(!is_dir("ArchivosUsuario/".$nota->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$nota->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        for($k=0; $k<$countFile; $k++)
        {
            if($_FILES['file']['error'][$k] == 0)
            {
                $count++;
                
                $name = $_FILES['file']['name'][$k];
                $size = $_FILES['file']['size'][$k];
                $ext = pathinfo($name, PATHINFO_EXTENSION);
                //$imagen = addslashes(file_get_contents($_FILES['file']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Imagen (Imagen, Nombre, Extension, Size, UsuarioId) VALUES (null, '".$name."', '".$ext."', ".$size.", ".$nota->UsuarioId.")";
                
                try 
                {
                    $stmt = $db->prepare($sql);                
                    $stmt->execute();
                    
                    $imagenId[$k]  = $db->lastInsertId();
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
            else
            {
                $imagenId[$k] = 0;
            }
            
            move_uploaded_file($_FILES['file']['tmp_name'][$k], $dir.$name);
            
            //----------------------- Etiquetas --------------------
            $countEtiqueta = count($nota->ImagenSrc[$k]->Etiqueta);

            if($countEtiqueta > 0)
            {
                $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                for($i=0; $i<$countEtiqueta; $i++)
                {
                    $sql .= " (".$nota->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$nota->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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

            //----------------------- Temas ---------------------------------
            $countTema = count($nota->ImagenSrc[$k]->Tema);

            if($countTema > 0)
            {
                $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                for($i=0; $i<$countTema; $i++)
                {
                    $sql .= " (".$nota->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
        }
        
        
        if($count > 0)
        {
            $sql = "INSERT INTO ImagenPorNota (NotaId, ImagenId) VALUES";
            
            //Imagen de la nota
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$nota->NotaId.", ".$imagenId[$k]."),";
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
                echo $sql;
                $db->rollBack();
                $app->status(409);
                $app->stop();
            }
        }
    }
    
    
    $countImg = count($nota->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorNota (NotaId, ImagenId) VALUES";
        
        $count = 0;
        /*Artista de cancion*/
        for($k=0; $k<$countImg; $k++)
        {
            if(!$nota->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$nota->NotaId.", ".$nota->Imagen[$k]->ImagenId."),";
            }
        }
        if($count > 0)
        {
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
        
        //----------------------- Etiquetas --------------------
        for($k=0; $k<$countImg; $k++)
        {
            $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$nota->Imagen[$k]->ImagenId;
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

            $countEtiqueta = count($nota->Imagen[$k]->Etiqueta);
            if($countEtiqueta > 0)
            {
                $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                for($i=0; $i<$countEtiqueta; $i++)
                {
                    $sql .= " (".$nota->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$nota->Imagen[$k]->ImagenId.", '".$nota->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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


            //----------------------- Temas ---------------------------------
            $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$nota->Imagen[$k]->ImagenId;
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

            $countTema = count($nota->Imagen[$k]->Tema);

            if($countTema > 0)
            {
                $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                for($i=0; $i<$countTema; $i++)
                {
                    $sql .= " (".$nota->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$nota->Imagen[$k]->ImagenId."),";
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
        }
    }
    
    $countTema = count($nota->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($nota->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $nota->UsuarioId);
                    $stmt->bindParam("Tema", $nota->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $nota->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorNota (NotaId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$nota->NotaId.", ".$nota->Tema[$k]->TemaActividadId."),";
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
    
    $countEtiqueta = count($nota->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($nota->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $nota->UsuarioId);
                    $stmt->bindParam("Nombre", $nota->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $nota->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
        $sql = "INSERT INTO EtiquetaPorNota (NotaId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta del diario*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($nota->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$nota->NotaId.", ".$nota->Etiqueta[$k]->EtiquetaId.", true),";
            }
            else
            {
                $sql .= " (".$nota->NotaId.", ".$nota->Etiqueta[$k]->EtiquetaId.", false),";
            }
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            echo '[{"Estatus": "Exitoso"},  {"Etiqueta":'.json_encode($nota->Etiqueta).'}, {"Tema":'.json_encode($nota->Tema).'}, {"FechaModificacion":"'.$nota->FechaModificacion.'"}]';
            $db->commit();
            $db = null;

        } 
        catch(PDOException $e) 
        {
            echo '[{"Estatus": "Fallo"}, {"Etiqueta":'.json_encode($nota->Etiqueta).'}]';
            //echo $e;
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }
    }
    else
    {
        $db->commit();
        $db = null;
        echo '[{"Estatus": "Exitoso"},  {"Etiqueta":'.json_encode($nota->Etiqueta).'}, {"Tema":'.json_encode($nota->Tema).'}, {"FechaModificacion":"'.$nota->FechaModificacion.'"}]';
    }
}

function BorrarNota()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $notaId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Nota WHERE NotaId =".$notaId;
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
function GetEtiquetaPorNota($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT DISTINCT EtiquetaId, Nombre FROM EtiquetaNotaVista WHERE UsuarioId = ".$id;

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

function GetTemaPorNota($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT DISTINCT TemaActividadId, Tema FROM TemaNotaVista WHERE UsuarioId = ".$id;

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


//-------- Orden de notas ------------
function GetNotaOrdenUsuario($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT NotaOrdenId as Id FROM NotaOrdenPorUsuario WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Id":'.json_encode($response[0]).'} ]'; 
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

function EditarNotaOrdenUsuario()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
   
    $sql = "SELECT NotaOrdenId FROM NotaOrdenPorUsuario WHERE UsuarioId =".$datos->UsuarioId."";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
    } 
    catch(PDOException $e) 
    {
        //echo($sql);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $count = count($response);
    
    if($count > 0)
    {
        $sql = "UPDATE NotaOrdenPorUsuario SET NotaOrdenId = '".$datos->NotaOrdenId."' WHERE UsuarioId =".$datos->UsuarioId."";
        
        try 
        {
            $db = getConnection();
            $stmt = $db->prepare($sql);

            $stmt->execute();
            $db = null;

            echo '[{"Estatus":"Exitoso"}]';
        }
        catch(PDOException $e) 
        {   
            echo $e;
            echo '[{"Estatus": "Fallido"}]';
            $app->status(409);
            $app->stop();
        }
    }
    else
    {
        $sql = "INSERT INTO NotaOrdenPorUsuario (NotaOrdenId, UsuarioId) VALUES (".$datos->NotaOrdenId.", ".$datos->UsuarioId.")";
        
        try 
        {
            $db = getConnection();
            $stmt = $db->prepare($sql);

            $stmt->execute();
            $db = null;

            echo '[{"Estatus":"Exitoso"}]';
        }
        catch(PDOException $e) 
        {   
            echo $e;
            echo '[{"Estatus": "Fallido"}]';
            $app->status(409);
            $app->stop();
        }
    }
}


?>
