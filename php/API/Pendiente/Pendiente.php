<?php
	
function GetPendiente()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $filtro = json_decode($request->getBody());
    
    
    $numTema = count($filtro->tema);
    $numEtiqueta = count($filtro->etiqueta);
    
    $sqlEtiquetaPendiente = "";
    $sqlEtiquetaBasePendiente1 = " SELECT e.PendienteId FROM EtiquetaPendienteVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBasePendiente2 = " GROUP BY e.PendienteId";
    
    
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
                $sqlEtiquetaPendiente .= $sqlEtiquetaBasePendiente1.$whereEtiqueta.$sqlEtiquetaBasePendiente2;
            }
            else
            {
                $sqlEtiquetaPendiente .= " UNION ALL ".$sqlEtiquetaBasePendiente1.$whereEtiqueta.$sqlEtiquetaBasePendiente2;
            }
        }
    }
    
    
    if($numEtiqueta > 0 && $numTema > 0)
    {
         $sql = "SELECT p.PendienteId, p.Nombre, p.Hecho, p.FechaIntencion, p.FechaRealizacion, p.NombrePrioridad, p.Importancia, p.HoraIntencion, p.HoraRealizacion FROM PendienteVista p
                    INNER JOIN ("
                        .$sqlEtiquetaPendiente.
             
                    " UNION ALL SELECT t.PendienteId FROM TemaPendienteVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.PendienteId HAVING count(*) = ".$numTema.
             
                    ") x ON x.PendienteId = p.PendienteId";
        
        if($filtro->fecha != "")
        {
            $sql .= " WHERE  FechaRealizacion = '". $filtro->fecha."'";
        }
        
        $sql .= " GROUP BY p.PendienteId  HAVING count(*) = ".($numEtiqueta+1);
    }
    else if($numEtiqueta > 0 || $numTema > 0)
    {
        if($numEtiqueta > 0)
        {
            $sql = "SELECT p.PendienteId, p.Nombre, p.Hecho, p.FechaIntencion, p.FechaRealizacion, p.NombrePrioridad, p.Importancia, p.HoraIntencion, p.HoraRealizacion FROM PendienteVista p 
                    INNER JOIN ("
                        .$sqlEtiquetaPendiente.
                    ") x ON x.PendienteId = p.PendienteId";
        }
        else if($numTema > 0)
        {
            $sql = "SELECT p.PendienteId, p.Nombre, p.Hecho, p.FechaIntencion, p.FechaRealizacion, p.NombrePrioridad, p.Importancia, p.HoraIntencion, p.HoraRealizacion FROM PendienteVista p
                    INNER JOIN (
                        SELECT t.PendienteId FROM TemaPendienteVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.PendienteId HAVING count(*) = ".$numTema."
                    ) x ON x.PendienteId = p.PendienteId";
        }
        
        if($filtro->fecha != "")
        {
            $sql .= " WHERE  FechaRealizacion = '". $filtro->fecha."'";
        }
        if($numEtiqueta > 0)
        {
            $sql .= " GROUP BY p.PendienteId  HAVING count(*) = ".$numEtiqueta;
        }
    }
    else
    {
        $sql = "SELECT p.PendienteId, p.Nombre, p.Hecho, p.FechaIntencion, p.FechaRealizacion, p.NombrePrioridad, p.Importancia, p.HoraIntencion, p.HoraRealizacion FROM PendienteVista p WHERE UsuarioId = ".$filtro->usuarioId;
        
        if($filtro->fecha != "")
        {
            $sql .= " AND  FechaRealizacion = '". $filtro->fecha."'";
        }
    }
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $pendiente = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo json_encode($pendiente);
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

function GetPendienteDatos($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM PendienteVista WHERE PendienteId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $countPendiente = count($response);
    
    if($countPendiente > 0)
    {
        $pendiente = $response[0];
        
        $sql = "SELECT * FROM EtiquetaPendienteVista WHERE PendienteId = ".$id;

        try 
        {
            $stmt = $db->query($sql);
            $pendiente->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);
        } 
        catch(PDOException $e) 
        {
            //echo($e);
            echo '[ { "Estatus": "Fallo" } ]';
            $app->status(409);
            $app->stop();
        }

        $sql = "SELECT PendienteId, TemaActividadId, Tema FROM TemaPendienteVista WHERE PendienteId = ".$id;

        try 
        {
            $stmt = $db->query($sql);
            $pendiente->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);
        } 
        catch(PDOException $e) 
        {
            //echo($e);
            echo '[ { "Estatus": "Fallo" } ]';
            $app->status(409);
            $app->stop();
        }

        $sql = "SELECT PendienteId, Nombre, Extension, Size, Imagen, ImagenId FROM ImagenPendienteVista WHERE PendienteId = ".$id;

        try 
        {
            $stmt = $db->query($sql);
            $pendiente->Imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
            
            foreach ($pendiente->Imagen  as $aux) 
            {
                $aux->Imagen =  base64_encode($aux->Imagen);
            }
        } 
        catch(PDOException $e) 
        {
            echo($e);
            echo '[ { "Estatus": "Fallo" } ]';
            $app->status(409);
            $app->stop();
        }
        
    }
    
    $app->status(200);
        
    echo json_encode($pendiente); 
    $db = null;
}

function AgregarPendiente()
{
    $request = \Slim\Slim::getInstance()->request();
    $pendiente = json_decode($_POST['datos']);
    global $app;


    $sql = "INSERT INTO Pendiente (UsuarioId, Nombre, FechaCreacion, FechaIntencion, FechaRealizacion, HoraIntencion, HoraRealizacion, Hecho, Nota) VALUES(:UsuarioId, :Nombre, :FechaCreacion, :FechaIntencion, :FechaIntencion, STR_TO_DATE( :HoraIntencion, '%h:%i %p' ), STR_TO_DATE( :HoraIntencion, '%h:%i %p' ), :Hecho, :Nota)";
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("UsuarioId", $pendiente->UsuarioId);
        $stmt->bindParam("Nombre", $pendiente->Nombre);
        $stmt->bindParam("FechaCreacion", $pendiente->FechaCreacion);
        $stmt->bindParam("FechaIntencion", $pendiente->FechaIntencion);
        $stmt->bindParam("FechaRealizacion", $pendiente->FechaRealizacion);
        $stmt->bindParam("HoraIntencion", $pendiente->HoraIntencion);
        $stmt->bindParam("HoraRealizacion", $pendiente->HoraRealizacion);
        $stmt->bindParam("Hecho", $pendiente->Hecho);
        $stmt->bindParam("Nota", $pendiente->Nota);

        $stmt->execute();
        
        $pendiente->PendienteId = $db->lastInsertId();

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    /*------------------ Imagenes ---------------------*/
    $countFile = 0;
    if($pendiente->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$pendiente->UsuarioId."/IMG/";
        if(!is_dir("ArchivosUsuario/".$pendiente->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$pendiente->UsuarioId,0777);
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
                $imagen = addslashes(file_get_contents($_FILES['file']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Imagen (Imagen, Nombre, Extension, Size, UsuarioId) VALUES ('".$imagen."', '".$name."', '".$ext."', ".$size.", ".$pendiente->UsuarioId.")";
                
                try 
                {
                    $stmt = $db->prepare($sql);                
                    $stmt->execute();
                    
                    $imagenId[$k]  = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
                
                //Subir Imagen
                //$uploadfile = $_FILES['file']['name'];
                move_uploaded_file($_FILES['file']['tmp_name'][$k], $dir.$name);
                
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($pendiente->ImagenSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$pendiente->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$pendiente->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                $countTema = count($pendiente->ImagenSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$pendiente->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
            $sql = "INSERT INTO ImagenPorPendiente (PendienteId, ImagenId) VALUES";
            
            //Imagen del pendiente
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$pendiente->PendienteId.", ".$imagenId[$k]."),";
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
    
     $countImg = count($pendiente->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorPendiente (PendienteId, ImagenId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countImg; $k++)
        {
            if(!$pendiente->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$pendiente->PendienteId.", ".$pendiente->Imagen[$k]->ImagenId."),";
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
            
            //----------------------- Etiquetas --------------------
            for($k=0; $k<$countImg; $k++)
            {
                $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$pendiente->Imagen[$k]->ImagenId;
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

                $countEtiqueta = count($pendiente->Imagen[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$pendiente->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$pendiente->Imagen[$k]->ImagenId.", '".$pendiente->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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
                $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$pendiente->Imagen[$k]->ImagenId;
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

                $countTema = count($pendiente->Imagen[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$pendiente->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$pendiente->Imagen[$k]->ImagenId."),";
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
        
       
    }
    
    /*------------------Termina Imagenes --------------*/
    
    if($pendiente->Lugar->LugarId) 
    {
        $sql = "INSERT INTO LugarPendiente (PendienteId, LugarId) VALUES(:PendienteId, :LugarId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("PendienteId", $pendiente->PendienteId);
            $stmt->bindParam("LugarId", $pendiente->Lugar->LugarId);

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
    
    
    if($pendiente->Unidad->UnidadId) 
    {
        $sql = "INSERT INTO CantidadPendiente (PendienteId, UnidadId, Cantidad) VALUES(:PendienteId, :UnidadId, :Cantidad)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("PendienteId", $pendiente->PendienteId);
            $stmt->bindParam("UnidadId", $pendiente->Unidad->UnidadId);
            $stmt->bindParam("Cantidad", $pendiente->Unidad->Cantidad);

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
    
    if($pendiente->Prioridad->PrioridadId) 
    {
        $sql = "INSERT INTO PrioridadPendiente (PendienteId, PrioridadId) VALUES(:PendienteId, :PrioridadId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("PendienteId", $pendiente->PendienteId);
            $stmt->bindParam("PrioridadId", $pendiente->Prioridad->PrioridadId);

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
    
    if($pendiente->Divisa->DivisaId) 
    {
        $sql = "INSERT INTO CostoPendiente (PendienteId, DivisaId, Costo) VALUES(:PendienteId, :DivisaId, :Costo)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("PendienteId", $pendiente->PendienteId);
            $stmt->bindParam("DivisaId", $pendiente->Divisa->DivisaId);
            $stmt->bindParam("Costo", $pendiente->Divisa->Costo);

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
    
    $countTema = count($pendiente->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($pendiente->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $pendiente->UsuarioId);
                    $stmt->bindParam("Tema", $pendiente->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $pendiente->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorPendiente (PendienteId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$pendiente->PendienteId.", ".$pendiente->Tema[$k]->TemaActividadId."),";
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
    
    $countEtiqueta = count($pendiente->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($pendiente->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $pendiente->UsuarioId);
                    $stmt->bindParam("Nombre", $pendiente->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $pendiente->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
        $sql = "INSERT INTO EtiquetaPorPendiente (PendienteId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($pendiente->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$pendiente->PendienteId.", ".$pendiente->Etiqueta[$k]->EtiquetaId.", 1),";
            }
            else
            {
                $sql .= " (".$pendiente->PendienteId.", ".$pendiente->Etiqueta[$k]->EtiquetaId.", 0),";
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
    
    
    echo '[{"Estatus": "Exitoso"}]';
    $app->status(200);
    $db->commit();
    $db = null;
    
  
}

function EditarPendiente()
{
    $request = \Slim\Slim::getInstance()->request();
    $pendiente = json_decode($_POST['datos']);
    global $app;
    
    $sql = "DELETE FROM Pendiente WHERE PendienteId =".$pendiente->PendienteId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->execute();
    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
    }
    
    if($pendiente->FechaMod == "FechaIntencion" && $pendiente->Hecho == "0" )
    {
        $sql = "INSERT INTO Pendiente (PendienteId, UsuarioId, Nombre, FechaCreacion, FechaIntencion, FechaRealizacion, Hecho, Nota, HoraIntencion, HoraRealizacion) VALUES(:PendienteId, :UsuarioId, :Nombre, :FechaCreacion, :FechaRealizacion, :FechaRealizacion, :Hecho, :Nota,  STR_TO_DATE( :HoraRealizacion, '%h:%i %p' ),  STR_TO_DATE( :HoraRealizacion, '%h:%i %p' ))";
    }
    else
    {
        $sql = "INSERT INTO Pendiente (PendienteId, UsuarioId, Nombre, FechaCreacion, FechaIntencion, FechaRealizacion, Hecho, Nota, HoraIntencion, HoraRealizacion) VALUES(:PendienteId, :UsuarioId, :Nombre, :FechaCreacion, :FechaIntencion, :FechaRealizacion, :Hecho, :Nota,  STR_TO_DATE( :HoraIntencion, '%h:%i %p' ),  STR_TO_DATE( :HoraRealizacion, '%h:%i %p' ))";
    }
    
    try 
    {
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("PendienteId", $pendiente->PendienteId);
        $stmt->bindParam("UsuarioId", $pendiente->UsuarioId);
        $stmt->bindParam("Nombre", $pendiente->Nombre);
        $stmt->bindParam("FechaCreacion", $pendiente->FechaCreacion);
        $stmt->bindParam("FechaIntencion", $pendiente->FechaIntencion);
        $stmt->bindParam("FechaRealizacion", $pendiente->FechaRealizacion);
        $stmt->bindParam("HoraIntencion", $pendiente->HoraIntencion);
        $stmt->bindParam("HoraRealizacion", $pendiente->HoraRealizacion);
        $stmt->bindParam("Hecho", $pendiente->Hecho);
        $stmt->bindParam("Nota", $pendiente->Nota);

        $stmt->execute();
        
        $pendiente->PendienteId = $db->lastInsertId();

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    /*------------------ Imagenes ---------------------*/
    $countFile = 0;
    if($pendiente->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$pendiente->UsuarioId."/IMG/";
        if(!is_dir("ArchivosUsuario/".$pendiente->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$pendiente->UsuarioId,0777);
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
                $imagen = addslashes(file_get_contents($_FILES['file']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Imagen (Imagen, Nombre, Extension, Size, UsuarioId) VALUES ('".$imagen."', '".$name."', '".$ext."', ".$size.", ".$pendiente->UsuarioId.")";
                
                try 
                {
                    $stmt = $db->prepare($sql);                
                    $stmt->execute();
                    
                    $imagenId[$k]  = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
                
                //Subir Imagen
                //$uploadfile = $_FILES['file']['name'];
                move_uploaded_file($_FILES['file']['tmp_name'][$k], $dir.$name);
                
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($pendiente->ImagenSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$pendiente->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$pendiente->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                $countTema = count($pendiente->ImagenSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$pendiente->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
            $sql = "INSERT INTO ImagenPorPendiente (PendienteId, ImagenId) VALUES";
            
            //Imagen del pendiente
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$pendiente->PendienteId.", ".$imagenId[$k]."),";
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
    
     $countImg = count($pendiente->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorPendiente (PendienteId, ImagenId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countImg; $k++)
        {
            if(!$pendiente->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$pendiente->PendienteId.", ".$pendiente->Imagen[$k]->ImagenId."),";
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
            
            //----------------------- Etiquetas --------------------
            for($k=0; $k<$countImg; $k++)
            {
                $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$pendiente->Imagen[$k]->ImagenId;
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

                $countEtiqueta = count($pendiente->Imagen[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$pendiente->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$pendiente->Imagen[$k]->ImagenId.", '".$pendiente->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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
                $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$pendiente->Imagen[$k]->ImagenId;
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

                $countTema = count($pendiente->Imagen[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$pendiente->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$pendiente->Imagen[$k]->ImagenId."),";
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
        
       
    }
    
    /*------------------Termina Imagenes --------------*/
    
    if($pendiente->Lugar->LugarId) 
    {
        $sql = "INSERT INTO LugarPendiente (PendienteId, LugarId) VALUES(:PendienteId, :LugarId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("PendienteId", $pendiente->PendienteId);
            $stmt->bindParam("LugarId", $pendiente->Lugar->LugarId);

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
    
    
    if($pendiente->Unidad->UnidadId) 
    {
        $sql = "INSERT INTO CantidadPendiente (PendienteId, UnidadId, Cantidad) VALUES(:PendienteId, :UnidadId, :Cantidad)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("PendienteId", $pendiente->PendienteId);
            $stmt->bindParam("UnidadId", $pendiente->Unidad->UnidadId);
            $stmt->bindParam("Cantidad", $pendiente->Unidad->Cantidad);

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
    
    if($pendiente->Prioridad->PrioridadId) 
    {
        $sql = "INSERT INTO PrioridadPendiente (PendienteId, PrioridadId) VALUES(:PendienteId, :PrioridadId)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("PendienteId", $pendiente->PendienteId);
            $stmt->bindParam("PrioridadId", $pendiente->Prioridad->PrioridadId);

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
    
    if($pendiente->Divisa->DivisaId) 
    {
        $sql = "INSERT INTO CostoPendiente (PendienteId, DivisaId, Costo) VALUES(:PendienteId, :DivisaId, :Costo)";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("PendienteId", $pendiente->PendienteId);
            $stmt->bindParam("DivisaId", $pendiente->Divisa->DivisaId);
            $stmt->bindParam("Costo", $pendiente->Divisa->Costo);

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
    
    $countTema = count($pendiente->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($pendiente->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $pendiente->UsuarioId);
                    $stmt->bindParam("Tema", $pendiente->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $pendiente->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorPendiente (PendienteId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$pendiente->PendienteId.", ".$pendiente->Tema[$k]->TemaActividadId."),";
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
    
    $countEtiqueta = count($pendiente->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($pendiente->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $pendiente->UsuarioId);
                    $stmt->bindParam("Nombre", $pendiente->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $pendiente->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
        $sql = "INSERT INTO EtiquetaPorPendiente (PendienteId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($pendiente->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$pendiente->PendienteId.", ".$pendiente->Etiqueta[$k]->EtiquetaId.", 1),";
            }
            else
            {
                $sql .= " (".$pendiente->PendienteId.", ".$pendiente->Etiqueta[$k]->EtiquetaId.", 0),";
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
    
    
    echo '[{"Estatus": "Exitoso"}]';
    $app->status(200);
    $db->commit();
    $db = null;
    
  
}

function BorrarPendiente()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $pendienteId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Pendiente WHERE PendienteId =".$pendienteId;
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
        $app->status(200);
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

function HechoPendiente()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $pendiente = json_decode($request->getBody());
   

    $sql = "UPDATE Pendiente SET Hecho = '".$pendiente->hecho."' WHERE PendienteId=".$pendiente->id;

   
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
        echo $sql;
        $app->status(409);
        $app->stop();
    }

}


?>
