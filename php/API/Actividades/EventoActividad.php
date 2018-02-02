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
    $evento = json_decode($_POST['datos']);
    global $app;
    

    $sql = "INSERT INTO EventoActividad (ActividadId, Fecha, Notas, Cantidad, Costo, Hora, Hecho) VALUES(:ActividadId, :Fecha, :Notas, :Cantidad, :Costo, STR_TO_DATE( :Hora, '%h:%i %p' ), :Hecho)";
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("ActividadId", $evento->ActividadId);
        $stmt->bindParam("Fecha", $evento->Fecha);
        $stmt->bindParam("Notas", $evento->Notas);
        $stmt->bindParam("Costo", $evento->Costo);
        $stmt->bindParam("Hora", $evento->Hora);
        $stmt->bindParam("Hecho", $evento->Hecho);
        
        if(!$evento->Cantidad)
        {
            $evento->Cantidad = null;
        }
        
        if(!$evento->Costo)
        {
            $evento->Costo = null;
        }
        
        $stmt->bindParam("Cantidad", $evento->Cantidad);
        $stmt->bindParam("Costo", $evento->Costo);
        
        $stmt->execute();
        
        $eventoId = $db->lastInsertId();
        $evento->EventoActividadId = $eventoId;
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
    
    /*------------------ Imagenes ---------------------*/
    $countFile = 0;
    if($evento->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$evento->UsuarioId."/IMG/Original/";
        $dirweb = "ArchivosUsuario/".$evento->UsuarioId."/IMG/Web/";
        $dirtn = "ArchivosUsuario/".$evento->UsuarioId."/IMG/Thumbnail/";
        
        if(!is_dir("ArchivosUsuario/".$evento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$evento->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        if(!is_dir("ArchivosUsuario/".$evento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$evento->UsuarioId,0777);
        }
        
        if(!is_dir($dirweb))
        {
            mkdir($dirweb,0777);
        }
        
        if(!is_dir($dirtn))
        {
            mkdir($dirtn,0777);
        }
        
        for($k=0; $k<$countFile; $k++)
        {
            if($_FILES['imgweb']['error'][$k] == 0)
            {
                $count++;
                
                $name = $_FILES['file']['name'][$k];
                $size = $_FILES['imgweb']['size'][$k];
                $ext = pathinfo($name, PATHINFO_EXTENSION);
                $imagen = addslashes(file_get_contents($_FILES['file']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Imagen ( Nombre, Extension, Size, UsuarioId) VALUES ( '".$name."', '".$ext."', ".$size.", ".$evento->UsuarioId.")";
                
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
                move_uploaded_file($_FILES['file']['tmp_name'][$k], $dir.$name);
                move_uploaded_file($_FILES['imgth']['tmp_name'][$k], $dirtn.$name);
                move_uploaded_file($_FILES['imgweb']['tmp_name'][$k], $dirweb.$name);
                
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($evento->ImagenSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$evento->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$evento->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                $countTema = count($evento->ImagenSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$evento->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
            $sql = "INSERT INTO ImagenPorEventoActividad (EventoActividadId, ImagenId) VALUES";
            
            //Imagen del evento
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$eventoId.", ".$imagenId[$k]."),";
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
    
     $countImg = count($evento->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorEventoActividad (EventoActividadId, ImagenId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countImg; $k++)
        {
            if(!$evento->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$eventoId.", ".$evento->Imagen[$k]->ImagenId."),";
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
                $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$evento->Imagen[$k]->ImagenId;
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

                $countEtiqueta = count($evento->Imagen[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$evento->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$evento->Imagen[$k]->ImagenId.", '".$evento->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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
                $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$evento->Imagen[$k]->ImagenId;
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

                $countTema = count($evento->Imagen[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$evento->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$evento->Imagen[$k]->ImagenId."),";
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
    
    $sql = "SELECT ImagenId, Nombre, Extension, Size FROM ImagenEventoVista WHERE EventoActividadId = ".$eventoId;

    try 
    {
        $stmt = $db->query($sql);
        $evento->Imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    /*------------------Termina Imagenes --------------*/
    
    //------------------------------ Archivos inicia --------------------------------------
    $countFile = 0;
    if($evento->AgregarArchivo > 0)
    {
        $countFile = count($_FILES['Archivo']['name']);
    }
        
    $count= 0;
    $archivoId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$evento->UsuarioId."/Archivo/";
        if(!is_dir("ArchivosUsuario/".$evento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$evento->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        for($k=0; $k<$countFile; $k++)
        {
            if($_FILES['Archivo']['error'][$k] == 0)
            {
                $count++;
                
                $name = $_FILES['Archivo']['name'][$k];
                $size = $_FILES['Archivo']['size'][$k];
                $ext = pathinfo($name, PATHINFO_EXTENSION);
                $archivo = addslashes(file_get_contents($_FILES['Archivo']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Archivo (Nombre, Extension, Size, UsuarioId) VALUES ('".$name."', '".$ext."', '".$size."', ".$evento->UsuarioId.")";
                
                try 
                {
                    $stmt = $db->prepare($sql);                
                    $stmt->execute();
                    
                    $archivoId[$k]  = $db->lastInsertId();
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
                move_uploaded_file($_FILES['Archivo']['tmp_name'][$k], $dir.$name);
                
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($evento->ArchivoSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        if($evento->ArchivoSrc[$k]->Etiqueta[$i]->Visible || $evento->ArchivoSrc[$k]->Etiqueta[$i]->Visible == "1")
                        {
                            $sql .= " (".$evento->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 1),";
                        }
                        else
                        {
                             $sql .= " (".$evento->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 0),";
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
                
                
                //----------------------- Temas ---------------------------------
                $countTema = count($evento->ArchivoSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$evento->ArchivoSrc[$k]->Tema[$i]->TemaActividadId.", ".$archivoId[$k]."),";
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
                $archivoId[$k] = 0;
            }
            
        }
        
        
        if($count > 0)
        {
            $sql = "INSERT INTO ArchivoPorEvento (EventoActividadId, ArchivoId) VALUES";
            
            //Imagen de la nota
            for($k=0; $k<$countFile; $k++)
            {
                if($archivoId[$k] != 0)
                {
                    $sql .= " (".$evento->EventoActividadId.", ".$archivoId[$k]."),";
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
    
     $countArch = count($evento->Archivo);
    
    if($countArch>0)  
    {    
        $sql = "INSERT INTO ArchivoPorEvento (EventoActividadId, ArchivoId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countArch; $k++)
        {
            if(!$evento->Archivo[$k]->Eliminado)
            {
                $count++;
                $sql .= " (".$evento->EventoActividadId.", ".$evento->Archivo[$k]->ArchivoId."),";
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
            for($k=0; $k<$countArch; $k++)
            {
                $sql = "DELETE FROM EtiquetaPorArchivo WHERE ArchivoId =".$evento->Archivo[$k]->ArchivoId;
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

                $countEtiqueta = count($evento->Archivo[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        if($evento->Archivo[$k]->Etiqueta[$i]->Visible || $evento->Archivo[$k]->Etiqueta[$i]->Visible == "1")
                        {
                            $sql .= " (".$evento->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$evento->Archivo[$k]->ArchivoId.", 1),";
                        }
                        else
                        {
                            $sql .= " (".$evento->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$evento->Archivo[$k]->ArchivoId.", 0),";
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


                //----------------------- Temas ---------------------------------
                $sql = "DELETE FROM TemaPorArchivo WHERE ArchivoId =".$evento->Archivo[$k]->ArchivoId;
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

                $countTema = count($evento->Archivo[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$evento->Archivo[$k]->Tema[$i]->TemaActividadId.", ".$evento->Archivo[$k]->ArchivoId."),";
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
    
    //----------------------------- archvios  fin---------------------------------------
    
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
    
    echo '[{"Estatus": "Exitoso"}, {"Id":"'.$eventoId.'"}, {"Etiqueta":'.json_encode($evento->Etiqueta).'}, {"Tema":'.json_encode($evento->Tema).'}, {"Imagen":'.json_encode($evento->Imagen).'}]';
    $db->commit();
    $db = null;

}

function EditarEventoActividad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();

    $evento = json_decode($_POST['datos']);
    
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
    
    if($evento->Hecho == "1")
    {
        $sql = "UPDATE EventoActividad SET Fecha = :Fecha, Notas = :Notas,  Costo = :Costo,  Cantidad = :Cantidad, Hora = STR_TO_DATE( :Hora, '%h:%i %p' ), Hecho = '1' WHERE EventoActividadId = ".$evento->EventoActividadId;
    }
    else
    {
        $sql = "UPDATE EventoActividad SET Fecha = :Fecha, Notas = :Notas,  Costo = :Costo,  Cantidad = :Cantidad, Hora = STR_TO_DATE( :Hora, '%h:%i %p' ), Hecho = '0', FechaHecho = null WHERE EventoActividadId = ".$evento->EventoActividadId;
    }
    
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
    
    /*------------------ Imagenes ---------------------*/
    $eventoId = $evento->EventoActividadId;
    $sql = "DELETE FROM ImagenPorEventoActividad WHERE EventoActividadId =".$evento->EventoActividadId;
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
    
    
    $countFile = 0;
    if($evento->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$evento->UsuarioId."/IMG/Original/";
        $dirweb = "ArchivosUsuario/".$evento->UsuarioId."/IMG/Web/";
        $dirtn = "ArchivosUsuario/".$evento->UsuarioId."/IMG/Thumbnail/";
        
        if(!is_dir("ArchivosUsuario/".$evento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$evento->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        if(!is_dir("ArchivosUsuario/".$evento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$evento->UsuarioId,0777);
        }
        
        if(!is_dir($dirweb))
        {
            mkdir($dirweb,0777);
        }
        
        if(!is_dir($dirtn))
        {
            mkdir($dirtn,0777);
        }

        for($k=0; $k<$countFile; $k++)
        {
            if($_FILES['imgweb']['error'][$k] == 0)
            {
                $count++;
                
                $name = $_FILES['file']['name'][$k];
                $size = $_FILES['imgweb']['size'][$k];
                $ext = pathinfo($name, PATHINFO_EXTENSION);
                $imagen = addslashes(file_get_contents($_FILES['file']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Imagen ( Nombre, Extension, Size, UsuarioId) VALUES ( '".$name."', '".$ext."', ".$size.", ".$evento->UsuarioId.")";
                
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
                move_uploaded_file($_FILES['file']['tmp_name'][$k], $dir.$name);
                move_uploaded_file($_FILES['imgth']['tmp_name'][$k], $dirtn.$name);
                move_uploaded_file($_FILES['imgweb']['tmp_name'][$k], $dirweb.$name);
                
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($evento->ImagenSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$evento->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$evento->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                $countTema = count($evento->ImagenSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$evento->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
            $sql = "INSERT INTO ImagenPorEventoActividad (EventoActividadId, ImagenId) VALUES";
            
            //Imagen del evento
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$eventoId.", ".$imagenId[$k]."),";
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
    
     $countImg = count($evento->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorEventoActividad (EventoActividadId, ImagenId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countImg; $k++)
        {
            if(!$evento->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$eventoId.", ".$evento->Imagen[$k]->ImagenId."),";
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
                echo $sql;
                $db->rollBack();
                $app->status(409);
                $app->stop();
            }
            
            //----------------------- Etiquetas --------------------
            for($k=0; $k<$countImg; $k++)
            {
                $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$evento->Imagen[$k]->ImagenId;
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

                $countEtiqueta = count($evento->Imagen[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$evento->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$evento->Imagen[$k]->ImagenId.", '".$evento->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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
                $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$evento->Imagen[$k]->ImagenId;
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

                $countTema = count($evento->Imagen[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$evento->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$evento->Imagen[$k]->ImagenId."),";
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
    
    $sql = "SELECT ImagenId, Nombre, Extension, Size FROM ImagenEventoVista WHERE EventoActividadId = ".$evento->EventoActividadId;

    try 
    {
        $stmt = $db->query($sql);
        $evento->Imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": "Fallo" } ]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    /*------------------Termina Imagenes --------------*/
    
    //------------------------------ Archivos inicia --------------------------------------
        $sql = "DELETE FROM ArchivoPorEvento WHERE EventoActividadId =".$evento->EventoActividadId;
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
        
        $countFile = 0;
        if($evento->AgregarArchivo > 0)
        {
            $countFile = count($_FILES['Archivo']['name']);
        }

        $count= 0;
        $archivoId = [];
        if($countFile > 0)
        {
            $dir = "ArchivosUsuario/".$evento->UsuarioId."/Archivo/";
            if(!is_dir("ArchivosUsuario/".$evento->UsuarioId))
            {
                mkdir("ArchivosUsuario/".$evento->UsuarioId, 0777);
            }

            if(!is_dir($dir))
            {
                mkdir($dir, 0777);
            }

            for($k=0; $k<$countFile; $k++)
            {
                if($_FILES['Archivo']['error'][$k] == 0)
                {
                    $count++;

                    $name = $_FILES['Archivo']['name'][$k];
                    $size = $_FILES['Archivo']['size'][$k];
                    $ext = pathinfo($name, PATHINFO_EXTENSION);
                    $archivo = addslashes(file_get_contents($_FILES['Archivo']['tmp_name'][$k]));

                    $sql = "INSERT INTO Archivo (Nombre, Extension, Size, UsuarioId) VALUES ('".$name."', '".$ext."', '".$size."', ".$evento->UsuarioId.")";

                    try 
                    {
                        $stmt = $db->prepare($sql);                
                        $stmt->execute();

                        $archivoId[$k]  = $db->lastInsertId();
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
                    move_uploaded_file($_FILES['Archivo']['tmp_name'][$k], $dir.$name);


                    //----------------------- Etiquetas --------------------
                    $countEtiqueta = count($evento->ArchivoSrc[$k]->Etiqueta);

                    if($countEtiqueta > 0)
                    {
                        $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                        for($i=0; $i<$countEtiqueta; $i++)
                        {
                            if($evento->ArchivoSrc[$k]->Etiqueta[$i]->Visible == "1" || $evento->ArchivoSrc[$k]->Etiqueta[$i]->Visible == true)
                            {
                                $sql .= " (".$evento->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 1),";
                            }
                            else
                            {
                                $sql .= " (".$evento->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 0),";
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


                    //----------------------- Temas ---------------------------------
                    $countTema = count($evento->ArchivoSrc[$k]->Tema);

                    if($countTema > 0)
                    {
                        $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                        for($i=0; $i<$countTema; $i++)
                        {
                            $sql .= " (".$evento->ArchivoSrc[$k]->Tema[$i]->TemaActividadId.", ".$archivoId[$k]."),";
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
                    $archivoId[$k] = 0;
                }

            }


            if($count > 0)
            {
                $sql = "INSERT INTO ArchivoPorEvento(EventoActividadId, ArchivoId) VALUES";

                //Imagen del evento
                for($k=0; $k<$countFile; $k++)
                {
                    if($archivoId[$k] != 0)
                    {
                        $sql .= " (".$evento->EventoActividadId.", ".$archivoId[$k]."),";
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
        }

         $countArch = count($evento->Archivo);

        if($countArch>0)  
        {    
            $sql = "INSERT INTO ArchivoPorEvento(EventoActividadId, ArchivoId) VALUES";

            $count = 0;
            for($k=0; $k<$countArch; $k++)
            {
                if(!$evento->Archivo[$k]->Eliminado)
                {
                    $count++;
                    $sql .= " (".$evento->EventoActividadId.", ".$evento->Archivo[$k]->ArchivoId."),";
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
                for($k=0; $k<$countArch; $k++)
                {
                    $sql = "DELETE FROM EtiquetaPorArchivo WHERE ArchivoId =".$evento->Archivo[$k]->ArchivoId;
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

                    $countEtiqueta = count($evento->Archivo[$k]->Etiqueta);
                    if($countEtiqueta > 0)
                    {
                        $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                        for($i=0; $i<$countEtiqueta; $i++)
                        {
                            if($evento->Archivo[$k]->Etiqueta[$i]->Visible == "1" || $evento->ArchivoSrc[$k]->Etiqueta[$i]->Visible == true)
                            {
                                $sql .= " (".$evento->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$evento->Archivo[$k]->ArchivoId.", 1),";
                            }
                            else
                            {
                                $sql .= " (".$evento->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$evento->Archivo[$k]->ArchivoId.", 0),";
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


                    //----------------------- Temas ---------------------------------
                    $sql = "DELETE FROM TemaPorArchivo WHERE ArchivoId =".$evento->Archivo[$k]->ArchivoId;
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

                    $countTema = count($evento->Archivo[$k]->Tema);

                    if($countTema > 0)
                    {
                        $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                        for($i=0; $i<$countTema; $i++)
                        {
                            $sql .= " (".$evento->Archivo[$k]->Tema[$i]->TemaActividadId.", ".$evento->Archivo[$k]->ArchivoId."),";
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

        //----------------------------- archvios  fin---------------------------------------
    
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
    
    echo '[{"Estatus": "Exitoso"}, {"Etiqueta":'.json_encode($evento->Etiqueta).'}, {"Tema":'.json_encode($evento->Tema).'}, {"Imagen":'.json_encode($evento->Imagen).'}]';
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
    $evento = json_decode($request->getBody());
   
    if($evento->hecho == "1")
    {
        $sql = "UPDATE EventoActividad SET Hecho = '1', FechaHecho = NOW() WHERE EventoActividadId=".$evento->id;
    }
    else
    {
        $sql = "UPDATE EventoActividad SET Hecho = '0', FechaHecho = null WHERE EventoActividadId=".$evento->id;
    }
    
   
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

function GetEventoActividadPorId($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM EventoActividadVista WHERE EventoActividadId = ".$id;

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
            $sql = "SELECT EventoActividadId, EtiquetaId, Nombre, Visible, count FROM EtiquetaEventoVista WHERE EventoActividadId = ".$id;

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
            
            $sql = "SELECT EventoActividadId, TemaActividadId, Tema FROM TemaEventoVista WHERE EventoActividadId = ".$id;

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
            
            $sql = "SELECT EventoActividadId, ImagenId, Nombre, Extension, Size FROM ImagenEventoVista WHERE EventoActividadId = ".$id;

            try 
            {
                $stmt = $db->query($sql);
                $response[$k]->Imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
            } 
            catch(PDOException $e) 
            {
                echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
            
            $sql = "SELECT ArchivoId, Nombre, Extension, Size FROM ArchivoEventoVista WHERE EventoActividadId = ".$response[$k]->EventoActividadId;

            try 
            {
                $stmt = $db->query($sql);
                $response[$k]->Archivo = $stmt->fetchAll(PDO::FETCH_OBJ);
                
                $archivo = count($response[$k]->Archivo);
                
                if($archivo > 0)
                {
                    for($i=0; $i<$archivo; $i++)
                    {
                        
                        $sql =  $sql = "SELECT TemaActividadId, Tema FROM TemaArchivoVista WHERE ArchivoId = ".$response[$k]->Archivo[$i]->ArchivoId;

                        try 
                        {
                            $stmt = $db->query($sql);
                            $response[$k]->Archivo[$i]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);
                        } 
                        catch(PDOException $e) 
                        {
                            echo($e);
                            echo '[ { "Estatus": "Fallo" } ]';
                            $app->status(409);
                            $app->stop();
                        }
                        
                    }
                    
                    for($i=0; $i<$archivo; $i++)
                    {
                        
                        $sql = "SELECT EtiquetaId, Nombre, Visible, count FROM EtiquetaArchivoVista WHERE ArchivoId = ".$response[$k]->Archivo[$i]->ArchivoId;

                        try 
                        {
                            $stmt = $db->query($sql);
                            $response[$k]->Archivo[$i]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);
                        } 
                        catch(PDOException $e) 
                        {
                            echo($e);
                            echo '[ { "Estatus": "Fallo" } ]';
                            $app->status(409);
                            $app->stop();
                        }
                        
                    }
                }
            }
            catch(PDOException $e) 
            {
                echo($sql);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
        }
    }
    
    echo '[ { "Estatus": "Exito"}, {"Evento":'.json_encode($response).'} ]'; 
    $db = null;$app->stop();
    
}

    
?>
