<?php
	
function GetConocimiento()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $filtro = json_decode($request->getBody());
    
    
    $numTema = count($filtro->tema);
    $numEtiqueta = count($filtro->etiqueta);
    
    $sqlEtiquetaConocimiento = "";
    $sqlEtiquetaBaseConocimiento1 = " SELECT e.ConocimientoId FROM EtiquetaConocimientoVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseConocimiento2 = " GROUP BY e.ConocimientoId";
    
    
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
                $sqlEtiquetaConocimiento .= $sqlEtiquetaBaseConocimiento1.$whereEtiqueta.$sqlEtiquetaBaseConocimiento2;
            }
            else
            {
                $sqlEtiquetaConocimiento .= " UNION ALL ".$sqlEtiquetaBaseConocimiento1.$whereEtiqueta.$sqlEtiquetaBaseConocimiento2;
            }
        }
    }
    
    
    if($numEtiqueta > 0 && $numTema > 0)
    {
         $sql = "SELECT c.ConocimientoId, c.Titulo, c.Informacion, c.Hecho FROM Conocimiento c
                    INNER JOIN ("
                        .$sqlEtiquetaConocimiento.
             
                    " UNION ALL SELECT t.ConocimientoId FROM TemaConocimientoVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.ConocimientoId HAVING count(*) = ".$numTema.
             
                    ") x ON x.ConocimientoId = c.ConocimientoId";
        
        $sql .= " GROUP BY c.ConocimientoId  HAVING count(*) = ".($numEtiqueta+1);
    }
    else if($numEtiqueta > 0 || $numTema > 0)
    {
        if($numEtiqueta > 0)
        {
            $sql = "SELECT c.ConocimientoId, c.Titulo, c.Informacion, c.Hecho FROM Conocimiento c
                    INNER JOIN ("
                        .$sqlEtiquetaConocimiento.
                    ") x ON x.ConocimientoId = c.ConocimientoId";
        }
        else if($numTema > 0)
        {
            $sql = "SELECT c.ConocimientoId, c.Titulo, c.Informacion, c.Hecho FROM Conocimiento c
                    INNER JOIN (
                        SELECT t.ConocimientoId FROM TemaConocimientoVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.ConocimientoId HAVING count(*) = ".$numTema."
                    ) x ON x.ConocimientoId = c.ConocimientoId";
        }
        if($numEtiqueta > 0)
        {
            $sql .= " GROUP BY c.ConocimientoId  HAVING count(*) = ".$numEtiqueta;
        }
    }
    else
    {
        $sql = "SELECT c.ConocimientoId, c.Titulo, c.Informacion,  c.Hecho FROM Conocimiento c WHERE UsuarioId = ".$filtro->usuarioId;
    }
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $conocimiento = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo json_encode($conocimiento);
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

function GetConocimientoPorId($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM Conocimiento WHERE ConocimientoId = ".$id;

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
    
    $countConocimiento = count($response);
    
    if($countConocimiento > 0)
    {
        $conocimiento = $response[0];
        
        $sql = "SELECT * FROM EtiquetaConocimientoVista WHERE ConocimientoId = ".$id;

        try 
        {
            $stmt = $db->query($sql);
            $conocimiento->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);
        } 
        catch(PDOException $e) 
        {
            //echo($e);
            echo '[ { "Estatus": "Fallo" } ]';
            $app->status(409);
            $app->stop();
        }

        $sql = "SELECT ConocimientoId, TemaActividadId, Tema FROM TemaConocimientoVista WHERE ConocimientoId = ".$id;

        try 
        {
            $stmt = $db->query($sql);
            $conocimiento->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);
        } 
        catch(PDOException $e) 
        {
            //echo($e);
            echo '[ { "Estatus": "Fallo" } ]';
            $app->status(409);
            $app->stop();
        }

        $sql = "SELECT ConocimientoId, Nombre, Extension, Size, ImagenId FROM ImagenConocimientoVista WHERE ConocimientoId = ".$id;

        try 
        {
            $stmt = $db->query($sql);
            $conocimiento->Imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
            
            foreach ($conocimiento->Imagen  as $aux) 
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
        
        $sql = "SELECT ArchivoId, Nombre, Extension, Size FROM ArchivoConocimientoVista WHERE ConocimientoId = ".$conocimiento->ConocimientoId;

        try 
        {
            $stmt = $db->query($sql);
            $conocimiento->Archivo = $stmt->fetchAll(PDO::FETCH_OBJ);

            $archivo = count($conocimiento->Archivo);

            if($archivo > 0)
            {
                for($i=0; $i<$archivo; $i++)
                {

                    $sql =  $sql = "SELECT TemaActividadId, Tema FROM TemaArchivoVista WHERE ArchivoId = ".$conocimiento->Archivo[$i]->ArchivoId;

                    try 
                    {
                        $stmt = $db->query($sql);
                        $conocimiento->Archivo[$i]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);
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

                    $sql = "SELECT EtiquetaId, Nombre, Visible, count FROM EtiquetaArchivoVista WHERE ArchivoId = ".$conocimiento->Archivo[$i]->ArchivoId;

                    try 
                    {
                        $stmt = $db->query($sql);
                        $conocimiento->Archivo[$i]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);
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
    
    $app->status(200);
        
    echo json_encode($conocimiento); 
    $db = null;
}

function BorrarConocimiento()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $conocimientoId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Conocimiento WHERE ConocimientoId =".$conocimientoId;
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

function AgregarConocimiento()
{
    $request = \Slim\Slim::getInstance()->request();
    $conocimiento = json_decode($_POST['datos']);
    global $app;


    $sql = "INSERT INTO Conocimiento (UsuarioId, Titulo, Informacion, Observacion, Hecho) VALUES(:UsuarioId, :Titulo, :Informacion, :Observacion, :Hecho)";
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("UsuarioId", $conocimiento->UsuarioId);
        $stmt->bindParam("Titulo", $conocimiento->Titulo);
        $stmt->bindParam("Informacion", $conocimiento->Informacion);
        $stmt->bindParam("Observacion", $conocimiento->Observacion);
        $stmt->bindParam("Hecho", $conocimiento->Hecho);

        $stmt->execute();
        
        $conocimiento->ConocimientoId = $db->lastInsertId();

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
    if($conocimiento->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$conocimiento->UsuarioId."/IMG/Original/";
        $dirweb = "ArchivosUsuario/".$conocimiento->UsuarioId."/IMG/Web/";
        $dirtn = "ArchivosUsuario/".$conocimiento->UsuarioId."/IMG/Thumbnail/";
        
        if(!is_dir("ArchivosUsuario/".$conocimiento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$conocimiento->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        if(!is_dir("ArchivosUsuario/".$conocimiento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$conocimiento->UsuarioId,0777);
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
                
                $sql = "INSERT INTO Imagen (Imagen, Nombre, Extension, Size, UsuarioId) VALUES ('".$imagen."', '".$name."', '".$ext."', ".$size.", ".$conocimiento->UsuarioId.")";
                
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
                move_uploaded_file($_FILES['imgth']['tmp_name'][$k], $dirtn.$name);
                move_uploaded_file($_FILES['imgweb']['tmp_name'][$k], $dirweb.$name);
                
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($conocimiento->ImagenSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$conocimiento->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$conocimiento->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                $countTema = count($conocimiento->ImagenSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$conocimiento->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
            $sql = "INSERT INTO ImagenPorConocimiento (ConocimientoId, ImagenId) VALUES";
            
            //Imagen del conocimiento
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$conocimiento->ConocimientoId.", ".$imagenId[$k]."),";
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
    
     $countImg = count($conocimiento->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorConocimiento (ConocimientoId, ImagenId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countImg; $k++)
        {
            if(!$conocimiento->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Imagen[$k]->ImagenId."),";
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
                $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$conocimiento->Imagen[$k]->ImagenId;
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

                $countEtiqueta = count($conocimiento->Imagen[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$conocimiento->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$conocimiento->Imagen[$k]->ImagenId.", '".$conocimiento->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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
                $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$conocimiento->Imagen[$k]->ImagenId;
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

                $countTema = count($conocimiento->Imagen[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$conocimiento->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$conocimiento->Imagen[$k]->ImagenId."),";
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
    
    //------------------------------ Archivos inicia --------------------------------------
    $countFile = 0;
    if($conocimiento->AgregarArchivo > 0)
    {
        $countFile = count($_FILES['Archivo']['name']);
    }
        
    $count= 0;
    $archivoId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$conocimiento->UsuarioId."/Archivo/";
        if(!is_dir("ArchivosUsuario/".$conocimiento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$conocimiento->UsuarioId,0777);
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
                
                $sql = "INSERT INTO Archivo (Nombre, Extension, Size, UsuarioId) VALUES ('".$name."', '".$ext."', '".$size."', ".$conocimiento->UsuarioId.")";
                
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
                $countEtiqueta = count($conocimiento->ArchivoSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        if($conocimiento->ArchivoSrc[$k]->Etiqueta[$i]->Visible || $conocimiento->ArchivoSrc[$k]->Etiqueta[$i]->Visible == "1")
                        {
                            $sql .= " (".$conocimiento->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 1),";
                        }
                        else
                        {
                             $sql .= " (".$conocimiento->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 0),";
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
                $countTema = count($conocimiento->ArchivoSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$conocimiento->ArchivoSrc[$k]->Tema[$i]->TemaActividadId.", ".$archivoId[$k]."),";
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
            $sql = "INSERT INTO ArchivoPorConocimiento(ConocimientoId, ArchivoId) VALUES";
            
            //Imagen de la nota
            for($k=0; $k<$countFile; $k++)
            {
                if($archivoId[$k] != 0)
                {
                    $sql .= " (".$conocimiento->ConocimientoId.", ".$archivoId[$k]."),";
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
    
     $countArch = count($conocimiento->Archivo);
    
    if($countArch>0)  
    {    
        $sql = "INSERT INTO ArchivoPorConocimiento (ConocimientoId, ArchivoId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countArch; $k++)
        {
            if(!$conocimiento->Archivo[$k]->Eliminado)
            {
                $count++;
                $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Archivo[$k]->ArchivoId."),";
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
                $sql = "DELETE FROM EtiquetaPorArchivo WHERE ArchivoId =".$conocimiento->Archivo[$k]->ArchivoId;
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

                $countEtiqueta = count($conocimiento->Archivo[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        if($conocimiento->Archivo[$k]->Etiqueta[$i]->Visible || $conocimiento->Archivo[$k]->Etiqueta[$i]->Visible == "1")
                        {
                            $sql .= " (".$conocimiento->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$conocimiento->Archivo[$k]->ArchivoId.", 1),";
                        }
                        else
                        {
                            $sql .= " (".$conocimiento->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$conocimiento->Archivo[$k]->ArchivoId.", 0),";
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
                $sql = "DELETE FROM TemaPorArchivo WHERE ArchivoId =".$conocimiento->Archivo[$k]->ArchivoId;
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

                $countTema = count($conocimiento->Archivo[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$conocimiento->Archivo[$k]->Tema[$i]->TemaActividadId.", ".$conocimiento->Archivo[$k]->ArchivoId."),";
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
    $countTema = count($conocimiento->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($conocimiento->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $conocimiento->UsuarioId);
                    $stmt->bindParam("Tema", $conocimiento->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $conocimiento->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorConocimiento (ConocimientoId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Tema[$k]->TemaActividadId."),";
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
    
    $countEtiqueta = count($conocimiento->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($conocimiento->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    $stmt->bindParam("UsuarioId", $conocimiento->UsuarioId);
                    $stmt->bindParam("Nombre", $conocimiento->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $conocimiento->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
        $sql = "INSERT INTO EtiquetaPorConocimiento (ConocimientoId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($conocimiento->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Etiqueta[$k]->EtiquetaId.", 1),";
            }
            else
            {
                $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Etiqueta[$k]->EtiquetaId.", 0),";
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

function EditarConocimiento()
{
    $request = \Slim\Slim::getInstance()->request();
    $conocimiento = json_decode($_POST['datos']);
    global $app;
    
    $sql = "DELETE FROM Conocimiento WHERE ConocimientoId =".$conocimiento->ConocimientoId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->execute();
    } catch(PDOException $e) 
    {
        echo $sql;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
    }
    
    $sql = "INSERT INTO Conocimiento (ConocimientoId, UsuarioId, Titulo, Informacion, Observacion, Hecho) VALUES(:ConocimientoId, :UsuarioId, :Titulo, :Informacion, :Observacion, :Hecho)";
    
    try 
    {
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("ConocimientoId", $conocimiento->ConocimientoId);
        $stmt->bindParam("UsuarioId", $conocimiento->UsuarioId);
        $stmt->bindParam("Titulo", $conocimiento->Titulo);
        $stmt->bindParam("Informacion", $conocimiento->Informacion);
        $stmt->bindParam("Observacion", $conocimiento->Observacion);
        $stmt->bindParam("Hecho", $conocimiento->Hecho);

        $stmt->execute();

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
    if($conocimiento->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$conocimiento->UsuarioId."/IMG/Original/";
        $dirweb = "ArchivosUsuario/".$conocimiento->UsuarioId."/IMG/Web/";
        $dirtn = "ArchivosUsuario/".$conocimiento->UsuarioId."/IMG/Thumbnail/";
        
        if(!is_dir("ArchivosUsuario/".$conocimiento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$conocimiento->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        if(!is_dir("ArchivosUsuario/".$conocimiento->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$conocimiento->UsuarioId,0777);
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
                
            
                $sql = "INSERT INTO Imagen (Nombre, Extension, Size, UsuarioId) VALUES ('".$name."', '".$ext."', ".$size.", ".$conocimiento->UsuarioId.")";
                
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
                move_uploaded_file($_FILES['imgth']['tmp_name'][$k], $dirtn.$name);
                move_uploaded_file($_FILES['imgweb']['tmp_name'][$k], $dirweb.$name);
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($conocimiento->ImagenSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$conocimiento->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$conocimiento->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                $countTema = count($conocimiento->ImagenSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$conocimiento->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
                echo "error imagen";
                $imagenId[$k] = 0;
            }
        }
        
        
        if($count > 0)
        {
            $sql = "INSERT INTO ImagenPorConocimiento (ConocimientoId, ImagenId) VALUES";
            
            //Imagen del conocimiento
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$conocimiento->ConocimientoId.", ".$imagenId[$k]."),";
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
    
     $countImg = count($conocimiento->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorConocimiento (ConocimientoId, ImagenId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countImg; $k++)
        {
            if(!$conocimiento->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Imagen[$k]->ImagenId."),";
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
                $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$conocimiento->Imagen[$k]->ImagenId;
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

                $countEtiqueta = count($conocimiento->Imagen[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$conocimiento->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$conocimiento->Imagen[$k]->ImagenId.", '".$conocimiento->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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
                $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$conocimiento->Imagen[$k]->ImagenId;
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

                $countTema = count($conocimiento->Imagen[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$conocimiento->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$conocimiento->Imagen[$k]->ImagenId."),";
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
    
    //------------------------------ Archivos inicia --------------------------------------
        $sql = "DELETE FROM ArchivoPorConocimiento WHERE ConocimientoId =".$conocimiento->ConocimientoId;
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
        if($conocimiento->AgregarArchivo > 0)
        {
            $countFile = count($_FILES['Archivo']['name']);
        }

        $count= 0;
        $archivoId = [];
        if($countFile > 0)
        {
            $dir = "ArchivosUsuario/".$conocimiento->UsuarioId."/Archivo/";
            if(!is_dir("ArchivosUsuario/".$conocimiento->UsuarioId))
            {
                mkdir("ArchivosUsuario/".$conocimiento->UsuarioId, 0777);
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

                    $sql = "INSERT INTO Archivo (Nombre, Extension, Size, UsuarioId) VALUES ('".$name."', '".$ext."', '".$size."', ".$conocimiento->UsuarioId.")";

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
                    $countEtiqueta = count($conocimiento->ArchivoSrc[$k]->Etiqueta);

                    if($countEtiqueta > 0)
                    {
                        $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                        for($i=0; $i<$countEtiqueta; $i++)
                        {
                            if($conocimiento->ArchivoSrc[$k]->Etiqueta[$i]->Visible == "1" || $conocimiento->ArchivoSrc[$k]->Etiqueta[$i]->Visible == true)
                            {
                                $sql .= " (".$conocimiento->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 1),";
                            }
                            else
                            {
                                $sql .= " (".$conocimiento->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 0),";
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
                    $countTema = count($conocimiento->ArchivoSrc[$k]->Tema);

                    if($countTema > 0)
                    {
                        $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                        for($i=0; $i<$countTema; $i++)
                        {
                            $sql .= " (".$conocimiento->ArchivoSrc[$k]->Tema[$i]->TemaActividadId.", ".$archivoId[$k]."),";
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
                $sql = "INSERT INTO ArchivoPorConocimiento(ConocimientoId, ArchivoId) VALUES";

                //Imagen del conocimiento
                for($k=0; $k<$countFile; $k++)
                {
                    if($archivoId[$k] != 0)
                    {
                        $sql .= " (".$conocimiento->ConocimientoId.", ".$archivoId[$k]."),";
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

         $countArch = count($conocimiento->Archivo);

        if($countArch>0)  
        {    
            $sql = "INSERT INTO ArchivoPorConocimiento(ConocimientoId, ArchivoId) VALUES";

            $count = 0;
            for($k=0; $k<$countArch; $k++)
            {
                if(!$conocimiento->Archivo[$k]->Eliminado)
                {
                    $count++;
                    $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Archivo[$k]->ArchivoId."),";
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
                    $sql = "DELETE FROM EtiquetaPorArchivo WHERE ArchivoId =".$conocimiento->Archivo[$k]->ArchivoId;
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

                    $countEtiqueta = count($conocimiento->Archivo[$k]->Etiqueta);
                    if($countEtiqueta > 0)
                    {
                        $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                        for($i=0; $i<$countEtiqueta; $i++)
                        {
                            if($conocimiento->Archivo[$k]->Etiqueta[$i]->Visible == "1" || $conocimiento->ArchivoSrc[$k]->Etiqueta[$i]->Visible == true)
                            {
                                $sql .= " (".$conocimiento->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$conocimiento->Archivo[$k]->ArchivoId.", 1),";
                            }
                            else
                            {
                                $sql .= " (".$conocimiento->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$conocimiento->Archivo[$k]->ArchivoId.", 0),";
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
                    $sql = "DELETE FROM TemaPorArchivo WHERE ArchivoId =".$conocimiento->Archivo[$k]->ArchivoId;
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

                    $countTema = count($conocimiento->Archivo[$k]->Tema);

                    if($countTema > 0)
                    {
                        $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                        for($i=0; $i<$countTema; $i++)
                        {
                            $sql .= " (".$conocimiento->Archivo[$k]->Tema[$i]->TemaActividadId.", ".$conocimiento->Archivo[$k]->ArchivoId."),";
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
    
    $countTema = count($conocimiento->Tema);
    
    if($countTema>0)  
    {
        //temas Nuevos
        for($k=0; $k<$countTema; $k++)
        {
            if($conocimiento->Tema[$k]->TemaActividadId == "-1")
            {
                $sql = "INSERT INTO TemaActividad (UsuarioId, Tema) VALUES (:UsuarioId, :Tema)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $conocimiento->UsuarioId);
                    $stmt->bindParam("Tema", $conocimiento->Tema[$k]->Tema);
                    
                    $stmt->execute();
                    
                    $conocimiento->Tema[$k]->TemaActividadId = $db->lastInsertId();
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
        
        $sql = "INSERT INTO TemaPorConocimiento (ConocimientoId, TemaActividadId) VALUES";
        
        
        /*Artista de cancion*/
        for($k=0; $k<$countTema; $k++)
        {
            $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Tema[$k]->TemaActividadId."),";
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
    
    $countEtiqueta = count($conocimiento->Etiqueta);
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($conocimiento->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $conocimiento->UsuarioId);
                    $stmt->bindParam("Nombre", $conocimiento->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $conocimiento->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
         $sql = "INSERT INTO EtiquetaPorConocimiento (ConocimientoId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($conocimiento->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Etiqueta[$k]->EtiquetaId.", 1),";
            }
            else
            {
                $sql .= " (".$conocimiento->ConocimientoId.", ".$conocimiento->Etiqueta[$k]->EtiquetaId.", 0),";
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
    
    
    echo '[{"Estatus": "Exitoso"}]';
    $app->status(200);
    $db->commit();
    $db = null;
    
  
}

function GetNumeroConocimiento($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT COUNT(*) as Numero FROM Conocimiento WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ); 
        
        $app->status(200);
        $db = null;
        echo $response[0]->Numero; 
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function GetNumeroConocimientoPorConcepto($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT Nombre, ConceptoId, Tipo, UsuarioId FROM NumeroConocimientoPorConceptoVista WHERE UsuarioId = ".$id;
 
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ); 
        
        $app->status(200);
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



?>
