<?php
	
function GetFechaDiario()
{
    $request = \Slim\Slim::getInstance()->request();
    $filtro = json_decode($request->getBody());
    global $app;
    
    $numTema = count($filtro->tema);
    $numEtiqueta = count($filtro->etiqueta);
    
    
    if($numEtiqueta == 0 && $numTema == 0)
    {
        $sql = "SELECT Fecha, DiarioId FROM Diario WHERE UsuarioId = ".$filtro->UsuarioId;
    }
    else
    {
        $sqlEtiquetaDiario = "";
        $sqlEtiquetaBaseDiario1 = " SELECT e.DiarioId FROM EtiquetaDiarioVista e WHERE EtiquetaId IN ";
        $sqlEtiquetaBaseDiario2 = " GROUP BY e.DiarioId";
        
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
                    $sqlEtiquetaDiario .= $sqlEtiquetaBaseDiario1.$whereEtiqueta.$sqlEtiquetaBaseDiario2;;
                }
                else
                {
                    $sqlEtiquetaDiario .= " UNION ALL ".$sqlEtiquetaBaseDiario1.$whereEtiqueta.$sqlEtiquetaBaseDiario2;
                }
            }
        }
        
        if($numEtiqueta > 0 && $numTema > 0)
        {
            $sql = "SELECT d.DiarioId, d.Fecha  FROM Diario d 
                    INNER JOIN ("
                         .$sqlEtiquetaDiario.

                    " UNION ALL SELECT t.DiarioId FROM TemaDiarioVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.DiarioId HAVING count(*) = ".$numTema.

                    ") x ON x.DiarioId = d.DiarioId GROUP BY d.DiarioId  HAVING count(*) = ".($numEtiqueta+1);

        }
        else if($numEtiqueta > 0 || $numTema > 0)
        {
            if($numEtiqueta > 0)
            {
                $sql = "SELECT d.DiarioId, d.Fecha FROM Diario d 
                        INNER JOIN ("
                             .$sqlEtiquetaDiario.
                        ") x ON x.DiarioId = d.DiarioId GROUP BY d.DiarioId  HAVING count(*) = ".$numEtiqueta;

            }
            else if($numTema > 0)
            {

                $sql = "SELECT  d.DiarioId, d.Fecha FROM Diario d
                        INNER JOIN (
                            SELECT t.DiarioId FROM TemaDiarioVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.DiarioId HAVING count(*) = ".$numTema."
                        ) x ON x.DiarioId = d.DiarioId";
            }
        }
    }

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

function GetDiario()
{
   
    $request = \Slim\Slim::getInstance()->request();
    $diario = json_decode($request->getBody());
    global $app;

    $sql = "SELECT * FROM DiarioVista WHERE UsuarioId = ".$diario->UsuarioId. " AND Fecha = '".$diario->Fecha."'";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $countDiario = count($response);
    
    if($countDiario > 0)
    {
        for($k=0; $k<$countDiario; $k++)
        {
            $sql = "SELECT DiarioId, EtiquetaId, Nombre, Visible, count FROM EtiquetaDiarioVista WHERE DiarioId = ".$response[$k]->DiarioId;

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
            
            $sql = "SELECT DiarioId, TemaActividadId, Tema FROM TemaDiarioVista WHERE DiarioId = ".$response[$k]->DiarioId;

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
            
            $sql = "SELECT ImagenId, Nombre, Extension, Size FROM ImagenDiarioVista WHERE DiarioId = ".$response[$k]->DiarioId;

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
            
            $sql = "SELECT ArchivoId, Nombre, Extension, Size FROM ArchivoDiarioVista WHERE DiarioId = ".$response[$k]->DiarioId;

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
                echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
        }
    }
    
    echo '[ { "Estatus": "Exito"}, {"Diario":'.json_encode($response).'} ]'; 
    $db = null;
}

function GetImagenDiario($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT ImagenId, Nombre, Extension, Size FROM ImagenDiarioVista WHERE DiarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Imagen":'.json_encode($imagen).'} ]'; 
        $db = null;
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $countImg = count($imagen);
    
    
    /*if($countImg > 0)
    {
        
        for($k=0; $k<$countImg; $k++)
        {
            $sql = "SELECT TemaActividadId, Tema FROM TemaImagenVista WHERE ImagenId = ".$imagen[$k]->ImagenId;

            try 
            {
                $stmt = $db->query($sql);
                $imagen[$k]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);
            } 
            catch(PDOException $e) 
            {
                echo($sql);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }

             $sql = "SELECT EtiquetaId, Nombre, Visible FROM EtiquetaImagenVista WHERE ImagenId = ".$imagen[$k]->ImagenId;

            try 
            {
                $stmt = $db->query($sql);
                $imagen[$k]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);
            } 
            catch(PDOException $e) 
            {
                echo($sql);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
        }
    }*/
}

function AgregarDiario()
{
    $request = \Slim\Slim::getInstance()->request();
    $diario = json_decode($_POST['datos']);
    global $app;

    $sql = "INSERT INTO Diario (UsuarioId, Notas, Fecha, Hora) VALUES(:UsuarioId, :Notas, :Fecha, STR_TO_DATE( :Hora, '%h:%i %p' ))";
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("UsuarioId", $diario->UsuarioId);
        $stmt->bindParam("Fecha", $diario->Fecha);
        $stmt->bindParam("Notas", $diario->Notas);
        $stmt->bindParam("Hora", $diario->Hora);

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
    
    $countFile = 0;
    if($diario->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$diario->UsuarioId."/IMG/Original/";
        $dirweb = "ArchivosUsuario/".$diario->UsuarioId."/IMG/Web/";
        $dirtn = "ArchivosUsuario/".$diario->UsuarioId."/IMG/Thumbnail/";
        
        if(!is_dir("ArchivosUsuario/".$diario->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$diario->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        if(!is_dir("ArchivosUsuario/".$diario->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$diario->UsuarioId,0777);
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
                
                $sql = "INSERT INTO Imagen (Imagen, Nombre, Extension, Size, UsuarioId) VALUES ('".$imagen."', '".$name."', '".$ext."', ".$size.", ".$diario->UsuarioId.")";
                
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
                move_uploaded_file($_FILES['file']['tmp_name'][$k], $dir.$name);
                move_uploaded_file($_FILES['imgth']['tmp_name'][$k], $dirtn.$name);
                move_uploaded_file($_FILES['imgweb']['tmp_name'][$k], $dirweb.$name);
                
                
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($diario->ImagenSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$diario->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$diario->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                $countTema = count($diario->ImagenSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$diario->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
            $sql = "INSERT INTO ImagenPorDiario (DiarioId, ImagenId) VALUES";
            
            //Imagen del diario
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$diarioId.", ".$imagenId[$k]."),";
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
    
     $countImg = count($diario->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorDiario (DiarioId, ImagenId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countImg; $k++)
        {
            if(!$diario->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$diarioId.", ".$diario->Imagen[$k]->ImagenId."),";
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
                $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$diario->Imagen[$k]->ImagenId;
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

                $countEtiqueta = count($diario->Imagen[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$diario->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$diario->Imagen[$k]->ImagenId.", '".$diario->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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
                $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$diario->Imagen[$k]->ImagenId;
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

                $countTema = count($diario->Imagen[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$diario->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$diario->Imagen[$k]->ImagenId."),";
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
    
    
    //------------------------------ Archivos inicia --------------------------------------
    $countFile = 0;
    if($diario->AgregarArchivo > 0)
    {
        $countFile = count($_FILES['Archivo']['name']);
    }
        
    $count= 0;
    $archivoId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$diario->UsuarioId."/Archivo/";
        if(!is_dir("ArchivosUsuario/".$diario->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$diario->UsuarioId,0777);
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
                
                $sql = "INSERT INTO Archivo (Nombre, Extension, Size, UsuarioId) VALUES ('".$name."', '".$ext."', '".$size."', ".$diario->UsuarioId.")";
                
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
                $countEtiqueta = count($diario->ArchivoSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        if($diario->ArchivoSrc[$k]->Etiqueta[$i]->Visible || $diario->ArchivoSrc[$k]->Etiqueta[$i]->Visible == "1")
                        {
                            $sql .= " (".$diario->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 1),";
                        }
                        else
                        {
                             $sql .= " (".$diario->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 0),";
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
                $countTema = count($diario->ArchivoSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$diario->ArchivoSrc[$k]->Tema[$i]->TemaActividadId.", ".$archivoId[$k]."),";
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
            $sql = "INSERT INTO ArchivoPorDiario (DiarioId, ArchivoId) VALUES";
            
            //Imagen del diario
            for($k=0; $k<$countFile; $k++)
            {
                if($archivoId[$k] != 0)
                {
                    $sql .= " (".$diarioId.", ".$archivoId[$k]."),";
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
    
     $countArch = count($diario->Archivo);
    
    if($countArch>0)  
    {    
        $sql = "INSERT INTO ArchivoPorDiario (DiarioId, ArchivoId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countArch; $k++)
        {
            if(!$diario->Archivo[$k]->Eliminado)
            {
                $count++;
                $sql .= " (".$diarioId.", ".$diario->Archivo[$k]->ArchivoId."),";
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
                $sql = "DELETE FROM EtiquetaPorArchivo WHERE ArchivoId =".$diario->Archivo[$k]->ArchivoId;
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

                $countEtiqueta = count($diario->Archivo[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        if($diario->Archivo[$k]->Etiqueta[$i]->Visible || $diario->Archivo[$k]->Etiqueta[$i]->Visible == "1")
                        {
                            $sql .= " (".$diario->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$diario->Archivo[$k]->ArchivoId.", 1),";
                        }
                        else
                        {
                            $sql .= " (".$diario->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$diario->Archivo[$k]->ArchivoId.", 0),";
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
                $sql = "DELETE FROM TemaPorArchivo WHERE ArchivoId =".$diario->Archivo[$k]->ArchivoId;
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

                $countTema = count($diario->Archivo[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$diario->Archivo[$k]->Tema[$i]->TemaActividadId.", ".$diario->Archivo[$k]->ArchivoId."),";
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
    
    $sql = "INSERT INTO DiarioCiudad (DiarioId, CiudadId) VALUES(:DiarioId, :CiudadId)";
    
    try 
    {
        $stmt = $db->prepare($sql);

        $stmt->bindParam("DiarioId", $diarioId);
        $stmt->bindParam("CiudadId", $diario->Ciudad->CiudadId);

        $stmt->execute();

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "UPDATE Ciudad SET DiarioDefecto = 0 WHERE DiarioDefecto = 1 AND UsuarioId = :UsuarioId";
    
    try 
    {
        $stmt = $db->prepare($sql);

        $stmt->bindParam("UsuarioId", $diario->UsuarioId);

        $stmt->execute();

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "UPDATE Ciudad SET DiarioDefecto = 1 WHERE CiudadId = :CiudadId";
    
    try 
    {
        $stmt = $db->prepare($sql);

        $stmt->bindParam("CiudadId", $diario->Ciudad->CiudadId);

        $stmt->execute();

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
        
        $sql = "INSERT INTO EtiquetaPorDiario (DiarioId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($diario->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$diarioId.", ".$diario->Etiqueta[$k]->EtiquetaId.", true),";
            }
            else
            {
                $sql .= " (".$diarioId.", ".$diario->Etiqueta[$k]->EtiquetaId.", false),";
            }
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
    global $app;
    $request = \Slim\Slim::getInstance()->request();

    $diario = json_decode($_POST['datos']);
    
    //$cancion = json_decode($_POST['cancion']);
    
    $sql = "UPDATE Diario SET Fecha = :Fecha, Notas = :Notas, Hora = STR_TO_DATE( :Hora, '%h:%i %p' )  WHERE DiarioId = ".$diario->DiarioId;
    
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Notas", $diario->Notas);
        $stmt->bindParam("Fecha", $diario->Fecha);
        $stmt->bindParam("Hora", $diario->Hora);

        $stmt->execute();

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM DiarioCiudad WHERE DiarioId=".$diario->DiarioId;
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
    
    $sql = "INSERT INTO DiarioCiudad (DiarioId, CiudadId) VALUES (:DiarioId, :CiudadId)";
    
    try 
    {
        $stmt = $db->prepare($sql);

        $stmt->bindParam("DiarioId", $diario->DiarioId);
        $stmt->bindParam("CiudadId", $diario->Ciudad->CiudadId);

        $stmt->execute();

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    if($diario->CambiarCiudad)
    {
        $sql = "UPDATE Ciudad SET DiarioDefecto = 0 WHERE DiarioDefecto = 1 AND UsuarioId = :UsuarioId";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("UsuarioId", $diario->UsuarioId);

            $stmt->execute();

        } catch(PDOException $e) 
        {
            echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }

        $sql = "UPDATE Ciudad SET DiarioDefecto = 1 WHERE CiudadId = :CiudadId";

        try 
        {
            $stmt = $db->prepare($sql);

            $stmt->bindParam("CiudadId", $diario->Ciudad->CiudadId);

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
    
    $sql = "DELETE FROM TemaPorDiario WHERE DiarioId =".$diario->DiarioId;
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
    
    $sql = "DELETE FROM EtiquetaPorDiario WHERE DiarioId =".$diario->DiarioId;
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
    
    $sql = "DELETE FROM ImagenPorDiario WHERE DiarioId =".$diario->DiarioId;
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
    
    $sql = "DELETE FROM ArchivoPorDiario WHERE DiarioId =".$diario->DiarioId;
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
    if($diario->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$diario->UsuarioId."/IMG/Original/";
        $dirweb = "ArchivosUsuario/".$diario->UsuarioId."/IMG/Web/";
        $dirtn = "ArchivosUsuario/".$diario->UsuarioId."/IMG/Thumbnail/";
        
        if(!is_dir("ArchivosUsuario/".$diario->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$diario->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        if(!is_dir("ArchivosUsuario/".$diario->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$diario->UsuarioId,0777);
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
                //imagen = addslashes(file_get_contents($_FILES['file']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Imagen (Nombre, Extension, Size, UsuarioId) VALUES ('".$name."', '".$ext."', ".$size.", ".$diario->UsuarioId.")";
                
                try 
                {
                    $stmt = $db->prepare($sql);                
                    $stmt->execute();
                    
                    $imagenId[$k]  = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": ".$e."}]';
                    echo $e;
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
                
                move_uploaded_file($_FILES['file']['tmp_name'][$k], $dir.$name);
                move_uploaded_file($_FILES['imgth']['tmp_name'][$k], $dirtn.$name);
                move_uploaded_file($_FILES['imgweb']['tmp_name'][$k], $dirweb.$name);
            
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($diario->ImagenSrc[$k]->Etiqueta);

                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$diario->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$diario->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                $countTema = count($diario->ImagenSrc[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$diario->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
            $sql = "INSERT INTO ImagenPorDiario (DiarioId, ImagenId) VALUES";
            
            //Imagen de la diario
            for($k=0; $k<$countFile; $k++)
            {
                if($imagenId[$k] != 0)
                {
                    $sql .= " (".$diario->DiarioId.", ".$imagenId[$k]."),";
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
    
    
    $countImg = count($diario->Imagen);
    
    if($countImg>0)  
    {    
        $sql = "INSERT INTO ImagenPorDiario (DiarioId, ImagenId) VALUES";
        
        $count = 0;
        /*Artista de cancion*/
        for($k=0; $k<$countImg; $k++)
        {
            if(!$diario->Imagen[$k]->Eliminada)
            {
                $count++;
                $sql .= " (".$diario->DiarioId.", ".$diario->Imagen[$k]->ImagenId."),";
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
                $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$diario->Imagen[$k]->ImagenId;
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

                $countEtiqueta = count($diario->Imagen[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$diario->Imagen[$k]->Etiqueta[$i]->EtiquetaId.", ".$diario->Imagen[$k]->ImagenId.", '".$diario->Imagen[$k]->Etiqueta[$i]->Visible."'),";
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
                $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$diario->Imagen[$k]->ImagenId;
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

                $countTema = count($diario->Imagen[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$diario->Imagen[$k]->Tema[$i]->TemaActividadId.", ".$diario->Imagen[$k]->ImagenId."),";
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
    
    //------------------------------ Archivos inicia --------------------------------------
    $countFile = 0;
    if($diario->AgregarArchivo > 0)
    {
        $countFile = count($_FILES['Archivo']['name']);
    }
        
    $count= 0;
    $archivoId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$diario->UsuarioId."/Archivo/";
        if(!is_dir("ArchivosUsuario/".$diario->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$diario->UsuarioId, 0777);
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
                
                $sql = "INSERT INTO Archivo (Nombre, Extension, Size, UsuarioId) VALUES ('".$name."', '".$ext."', '".$size."', ".$diario->UsuarioId.")";
                
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
                $countEtiqueta = count($diario->ArchivoSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        if($diario->ArchivoSrc[$k]->Etiqueta[$i]->Visible == "1" || $diario->ArchivoSrc[$k]->Etiqueta[$i]->Visible == true)
                        {
                            $sql .= " (".$diario->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 1),";
                        }
                        else
                        {
                            $sql .= " (".$diario->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 0),";
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
                $countTema = count($diario->ArchivoSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$diario->ArchivoSrc[$k]->Tema[$i]->TemaActividadId.", ".$archivoId[$k]."),";
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
            $sql = "INSERT INTO ArchivoPorDiario (DiarioId, ArchivoId) VALUES";
            
            //Imagen del diario
            for($k=0; $k<$countFile; $k++)
            {
                if($archivoId[$k] != 0)
                {
                    $sql .= " (".$diario->DiarioId.", ".$archivoId[$k]."),";
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
    
     $countArch = count($diario->Archivo);
    
    if($countArch>0)  
    {    
        $sql = "INSERT INTO ArchivoPorDiario (DiarioId, ArchivoId) VALUES";
        
        $count = 0;
        for($k=0; $k<$countArch; $k++)
        {
            if(!$diario->Archivo[$k]->Eliminado)
            {
                $count++;
                $sql .= " (".$diario->DiarioId.", ".$diario->Archivo[$k]->ArchivoId."),";
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
                $sql = "DELETE FROM EtiquetaPorArchivo WHERE ArchivoId =".$diario->Archivo[$k]->ArchivoId;
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

                $countEtiqueta = count($diario->Archivo[$k]->Etiqueta);
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        if($diario->Archivo[$k]->Etiqueta[$i]->Visible == "1" || $diario->ArchivoSrc[$k]->Etiqueta[$i]->Visible == true)
                        {
                            $sql .= " (".$diario->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$diario->Archivo[$k]->ArchivoId.", 1),";
                        }
                        else
                        {
                            $sql .= " (".$diario->Archivo[$k]->Etiqueta[$i]->EtiquetaId.", ".$diario->Archivo[$k]->ArchivoId.", 0),";
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
                $sql = "DELETE FROM TemaPorArchivo WHERE ArchivoId =".$diario->Archivo[$k]->ArchivoId;
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

                $countTema = count($diario->Archivo[$k]->Tema);

                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$diario->Archivo[$k]->Tema[$i]->TemaActividadId.", ".$diario->Archivo[$k]->ArchivoId."),";
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
        
        $sql = "INSERT INTO EtiquetaPorDiario (DiarioId, EtiquetaId, Visible) VALUES";
        
        
        /*Etiqueta del diario*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($diario->Etiqueta[$k]->Visible)
            {
                $sql .= " (".$diario->DiarioId.", ".$diario->Etiqueta[$k]->EtiquetaId.", true),";
            }
            else
            {
                $sql .= " (".$diario->DiarioId.", ".$diario->Etiqueta[$k]->EtiquetaId.", false),";
            }
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

    $sql = "SELECT DiarioId, EtiquetaId, Nombre, Visible FROM EtiquetaDiarioVista WHERE UsuarioId = ".$id;

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
