<?php

function GetArchivoApp()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $filtro = json_decode($request->getBody());
    
    
    $numTema = count($filtro->tema);
    $numEtiqueta = count($filtro->etiqueta);
    
    $sqlEtiqueta = "";
    $sqlEtiquetaBase1 = " SELECT e.ArchivoId FROM EtiquetaArchivoVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBase2 = " GROUP BY e.ArchivoId";
    
    
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
                $sqlEtiqueta .= $sqlEtiquetaBase1.$whereEtiqueta.$sqlEtiquetaBase2;
            }
            else
            {
                $sqlEtiqueta .= " UNION ALL ".$sqlEtiquetaBase1.$whereEtiqueta.$sqlEtiquetaBase2;
            }
        }
    }
    
    
    if($numEtiqueta > 0 && $numTema > 0)
    {
         $sql = "SELECT a.ArchivoId, a.Nombre, a.Size, a.NumeroEtiqueta, a.NumeroTema FROM ArchivoVista a
                    INNER JOIN ("
                        .$sqlEtiqueta.
             
                    " UNION ALL SELECT t.ArchivoId FROM TemaArchivoVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.ArchivoId HAVING count(*) = ".$numTema.
             
                    ") x ON x.ArchivoId = a.ArchivoId";
    
        
        $sql .= " GROUP BY a.ArchivoId  HAVING count(*) = ".($numEtiqueta+1);
    }
    else if($numEtiqueta > 0 || $numTema > 0)
    {
        if($numEtiqueta > 0)
        {
            $sql = "SELECT a.ArchivoId, a.Nombre, a.Size, a.NumeroEtiqueta, a.NumeroTema FROM ArchivoVista a
                    INNER JOIN ("
                        .$sqlEtiqueta.
                    ") x ON x.ArchivoId = a.ArchivoId";
        }
        else if($numTema > 0)
        {
            $sql = "SELECT a.ArchivoId, a.Nombre, a.Size, a.NumeroEtiqueta, a.NumeroTema FROM ArchivoVista a
                    INNER JOIN (
                        SELECT t.ArchivoId FROM TemaArchivoVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.ArchivoId HAVING count(*) = ".$numTema."
                    ) x ON x.ArchivoId = a.ArchivoId";
        }
    
        if($numEtiqueta > 0)
        {
            $sql .= " GROUP BY a.ArchivoId  HAVING count(*) = ".$numEtiqueta;
        }
    }
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $archivo = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo json_encode($archivo);
        $db = null;
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function GetArchivo($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT ArchivoId, Size, Nombre, Extension FROM Archivo WHERE UsuarioId = ".$id;

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
    
    $count = count($response);
    
    for($k=0; $k<$count; $k++)
    {
        $sql = "SELECT EtiquetaId, Nombre, Visible, count FROM EtiquetaArchivoVista WHERE ArchivoId = ".$response[$k]->ArchivoId;

        try 
        {
            $db = getConnection();
            $stmt = $db->query($sql);
            $response[$k]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ); 
        } 
        catch(PDOException $e) 
        {
            echo($e);
            echo '[ { "Estatus": "Fallo" } ]';
            $app->status(409);
            $app->stop();
        }
        
        $sql = "SELECT TemaActividadId, Tema FROM TemaArchivoVista WHERE ArchivoId = ".$response[$k]->ArchivoId;

        try 
        {
            $db = getConnection();
            $stmt = $db->query($sql);
            $response[$k]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ); 
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
    $db = null;
    echo json_encode($response); 
}

function GetNumeroArchivo($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT COUNT(*) as Numero FROM Archivo WHERE UsuarioId = ".$id;

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

function BorrarArchivo()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $id = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Archivo WHERE ArchivoId =".$id;
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

function GetEtiquetaPorArchivo($id)
{
    $request = \Slim\Slim::getInstance()->request();
    global $app;

    $sql = "SELECT TemaActividadId, Tema FROM TemaArchivoVista WHERE ArchivoId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $tema = $stmt->fetchAll(PDO::FETCH_OBJ);
    } 
    catch(PDOException $e) 
    {
        echo($sql);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
     $sql = "SELECT EtiquetaId, Nombre, Visible, count FROM EtiquetaArchivoVista WHERE ArchivoId = ".$id;

    try 
    {
        $stmt = $db->query($sql);
        $etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Etiqueta":'.json_encode($etiqueta).'}, {"Tema":'.json_encode($tema).'} ]'; 
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

function EditarEtiquetaArchivo()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $archivo = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM EtiquetaPorArchivo WHERE ArchivoId =".$archivo->ArchivoId;
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql); 
        $stmt->execute(); 
        
    } 
    catch(PDOException $e) 
    {
        $db->rollBack();
        echo '[ { "Estatus": "Fallo" } ]';
        echo $e;
        $app->status(409);
        $app->stop();
    }
    
    $sql = "DELETE FROM TemaPorArchivo WHERE ArchivoId =".$archivo->ArchivoId;
    try 
    {
        $stmt = $db->prepare($sql); 
        $stmt->execute();    
    } 
    catch(PDOException $e) 
    {
        $db->rollBack();
        echo '[ { "Estatus": "Fallo" } ]';
        echo $e;
        $app->status(409);
        $app->stop();
    }
    
    
    $countEtiqueta = count($archivo->Etiqueta);
    
    //----------------------- Etiquetas --------------------
    if($countEtiqueta > 0)
    {
        $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

        for($i=0; $i<$countEtiqueta; $i++)
        {
            if($archivo->Etiqueta[$i]->Visible)
            {
                $sql .= " (".$archivo->Etiqueta[$i]->EtiquetaId.", ".$archivo->ArchivoId.", 1),";
            }
            else
            {
                $sql .= " (".$archivo->Etiqueta[$i]->EtiquetaId.", ".$archivo->ArchivoId.", 0),";
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
    $countTema = count($archivo->Tema);

    if($countTema > 0)
    {
        $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

        for($i=0; $i<$countTema; $i++)
        {
            $sql .= " (".$archivo->Tema[$i]->TemaActividadId.", ".$archivo->ArchivoId."),";
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
    
    $app->status(200);
    $db->commit();
    $db = null;
    echo '[ { "Estatus": "Exitoso" } ]';
}

function GetNumeroArchivoPorConcepto($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT Nombre, ConceptoId, Tipo, UsuarioId FROM NumeroArchivoPorConceptoVista WHERE UsuarioId = ".$id;
 
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

function AgregarArchivo()
{
    $request = \Slim\Slim::getInstance()->request();
    $archivo = json_decode($_POST['datos']);
    global $app;

    //------------------------------ Archivos inicia --------------------------------------
    $countFile = 0;
    if($archivo->AgregarArchivo > 0)
    {
        $countFile = count($_FILES['Archivo']['name']);
    }
        
    $count= 0;
    $archivoId = [];
    if($countFile > 0)
    {
        try 
        {
            $db = getConnection();
            $db->beginTransaction();

        } catch(PDOException $e) 
        {
            echo $e;
            echo '[{"Estatus": "Fallo"}]';
            $db->rollBack();
            $app->status(409);
            $app->stop();
        }

        $dir = "ArchivosUsuario/".$archivo->UsuarioId."/Archivo/";
        if(!is_dir("ArchivosUsuario/".$archivo->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$archivo->UsuarioId,0777);
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
                //$archivo = addslashes(file_get_contents($_FILES['Archivo']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Archivo (Nombre, Extension, Size, UsuarioId) VALUES ('".$name."', '".$ext."', '".$size."', ".$archivo->UsuarioId.")";
                
                try 
                {
                    $stmt = $db->prepare($sql);                
                    $stmt->execute();
                    
                    $archivoId[$k]  = $db->lastInsertId();
                } 
                catch(PDOException $e) 
                {
                    echo '[{"Estatus": "Fallo"}]';
                    $db->rollBack();
                    $app->status(409);
                    $app->stop();
                }
                
                //Subir Imagen
                //$uploadfile = $_FILES['file']['name'];
                move_uploaded_file($_FILES['Archivo']['tmp_name'][$k], $dir.$name);
                
                
                //----------------------- Etiquetas --------------------
                $countEtiqueta = count($archivo->ArchivoSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorArchivo (EtiquetaId, ArchivoId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        if($archivo->ArchivoSrc[$k]->Etiqueta[$i]->Visible || $archivo->ArchivoSrc[$k]->Etiqueta[$i]->Visible == "1")
                        {
                            $sql .= " (".$archivo->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 1),";
                        }
                        else
                        {
                             $sql .= " (".$archivo->ArchivoSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$archivoId[$k].", 0),";
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
                $countTema = count($archivo->ArchivoSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorArchivo (TemaActividadId, ArchivoId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$archivo->ArchivoSrc[$k]->Tema[$i]->TemaActividadId.", ".$archivoId[$k]."),";
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
       
    }
    
    //----------------------------- archvios  fin--------------------------------------- 
    
    echo '[{"Estatus": "Exitoso"}]';
    $app->status(200);
    $db->commit();
    $db = null;
    
  
}


?>
