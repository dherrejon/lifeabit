<?php
	
function GetImagenApp()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $filtro = json_decode($request->getBody());
    
    
    $numTema = count($filtro->tema);
    $numEtiqueta = count($filtro->etiqueta);
    
    $sqlEtiquetaImagen = "";
    $sqlEtiquetaBaseImagen1 = " SELECT e.ImagenId FROM EtiquetaImagenVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseImagen2 = " GROUP BY e.ImagenId";
    
    
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
                $sqlEtiquetaImagen .= $sqlEtiquetaBaseImagen1.$whereEtiqueta.$sqlEtiquetaBaseImagen2;
            }
            else
            {
                $sqlEtiquetaImagen .= " UNION ALL ".$sqlEtiquetaBaseImagen1.$whereEtiqueta.$sqlEtiquetaBaseImagen2;
            }
        }
    }
    
    
    if($numEtiqueta > 0 && $numTema > 0)
    {
         $sql = "SELECT i.ImagenId, i.Nombre, i.NumeroEtiqueta, i.NumeroTema FROM ImagenVista i
                    INNER JOIN ("
                        .$sqlEtiquetaImagen.
             
                    " UNION ALL SELECT t.ImagenId FROM TemaImagenVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.ImagenId HAVING count(*) = ".$numTema.
             
                    ") x ON x.ImagenId = i.ImagenId";
    
        
        $sql .= " GROUP BY i.ImagenId  HAVING count(*) = ".($numEtiqueta+1);
    }
    else if($numEtiqueta > 0 || $numTema > 0)
    {
        if($numEtiqueta > 0)
        {
            $sql = "SELECT i.ImagenId, i.Nombre, i.NumeroEtiqueta, i.NumeroTema FROM ImagenVista i
                    INNER JOIN ("
                        .$sqlEtiquetaImagen.
                    ") x ON x.ImagenId = i.ImagenId";
        }
        else if($numTema > 0)
        {
            $sql = "SELECT i.ImagenId, i.Nombre, i.NumeroEtiqueta, i.NumeroTema FROM ImagenVista i
                    INNER JOIN (
                        SELECT t.ImagenId FROM TemaImagenVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.ImagenId HAVING count(*) = ".$numTema."
                    ) x ON x.ImagenId = i.ImagenId";
        }
    
        if($numEtiqueta > 0)
        {
            $sql .= " GROUP BY i.ImagenId  HAVING count(*) = ".$numEtiqueta;
        }
    }
    
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo json_encode($imagen);
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

function GetGaleriaFotos()
{
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    global $app;

    $sql = "SELECT ImagenId, Imagen, Extension, Nombre, Size FROM Imagen WHERE UsuarioId = ".$datos[2]." LIMIT ".$datos[0].",".$datos[1];

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        foreach ($response as $aux) 
        {
            $aux->Imagen =  base64_encode($aux->Imagen);
        }
        
        echo '[ { "Estatus": "Exito"}, {"Fotos":'.json_encode($response).'} ]'; 
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

function GetFototeca()
{
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    global $app;

    $sql = "SELECT ImagenId, Extension, Nombre, Size FROM Imagen WHERE UsuarioId = ".$datos[0];

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Fotos":'.json_encode($response).'} ]'; 
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

function GetImagenEtiqueta($id)
{
    $request = \Slim\Slim::getInstance()->request();
    global $app;

    $sql = "SELECT TemaActividadId, Tema FROM TemaImagenVista WHERE ImagenId = ".$id;

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
    
     $sql = "SELECT EtiquetaId, Nombre, Visible, count FROM EtiquetaImagenVista WHERE ImagenId = ".$id;

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

function BorrarImgen()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $id = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Imagen WHERE ImagenId =".$id;
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

function EditarEtiquetaImagen()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $imagen = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM EtiquetaPorImagen WHERE ImagenId =".$imagen->ImagenId;
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
    
    $sql = "DELETE FROM TemaPorImagen WHERE ImagenId =".$imagen->ImagenId;
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
    
    
    $countEtiqueta = count($imagen->Etiqueta);
    
    //----------------------- Etiquetas --------------------
    if($countEtiqueta > 0)
    {
        $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

        for($i=0; $i<$countEtiqueta; $i++)
        {
            $sql .= " (".$imagen->Etiqueta[$i]->EtiquetaId.", ".$imagen->ImagenId.", '".$imagen->Etiqueta[$i]->Visible."'),";
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
    $countTema = count($imagen->Tema);

    if($countTema > 0)
    {
        $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

        for($i=0; $i<$countTema; $i++)
        {
            $sql .= " (".$imagen->Tema[$i]->TemaActividadId.", ".$imagen->ImagenId."),";
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
    
    $app->status(200);
    $db->commit();
    $db = null;
    echo '[ { "Estatus": "Exitoso" } ]';
}

function GetNumeroImagen($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT COUNT(*) as Numero FROM Imagen WHERE UsuarioId = ".$id;

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

function GetNumeroImagenPorConcepto($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT Nombre, ConceptoId, Tipo, UsuarioId FROM NumeroImagenPorConceptoVista WHERE UsuarioId = ".$id;
 
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


function AgregarImagen()
{
    $request = \Slim\Slim::getInstance()->request();
    $imagen = json_decode($_POST['datos']);
    global $app;

    try 
    {
        $db = getConnection();
        $db->beginTransaction();

    } catch(PDOException $e) 
    {
        echo '[{"Estatus": "Fallo"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    } 
    
    
    /*------------------ Imagenes ---------------------*/
    $countFile = 0;
    if($imagen->AgregarImagen > 0)
    {
        $countFile = count($_FILES['file']['name']);
    }
        
    $count= 0;
    $imagenId = [];
    if($countFile > 0)
    {
        $dir = "ArchivosUsuario/".$imagen->UsuarioId."/IMG/Original/";
        $dirweb = "ArchivosUsuario/".$imagen->UsuarioId."/IMG/Web/";
        $dirtn = "ArchivosUsuario/".$imagen->UsuarioId."/IMG/Thumbnail/";
        
        if(!is_dir("ArchivosUsuario/".$imagen->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$imagen->UsuarioId,0777);
        }
        
        if(!is_dir($dir))
        {
            mkdir($dir,0777);
        }
        
        if(!is_dir("ArchivosUsuario/".$imagen->UsuarioId))
        {
            mkdir("ArchivosUsuario/".$imagen->UsuarioId,0777);
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
                //$imagen = addslashes(file_get_contents($_FILES['file']['tmp_name'][$k]));
                
                $sql = "INSERT INTO Imagen (Nombre, Extension, Size, UsuarioId) VALUES ( '".$name."', '".$ext."', ".$size.", ".$imagen->UsuarioId.")";
                
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
                $countEtiqueta = count($imagen->ImagenSrc[$k]->Etiqueta);
                
                if($countEtiqueta > 0)
                {
                    $sql = "INSERT INTO EtiquetaPorImagen (EtiquetaId, ImagenId, Visible) VALUES";

                    for($i=0; $i<$countEtiqueta; $i++)
                    {
                        $sql .= " (".$imagen->ImagenSrc[$k]->Etiqueta[$i]->EtiquetaId.", ".$imagenId[$k].", '".$imagen->ImagenSrc[$k]->Etiqueta[$i]->Visible."'),";
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
                $countTema = count($imagen->ImagenSrc[$k]->Tema);
                
                if($countTema > 0)
                {
                    $sql = "INSERT INTO TemaPorImagen (TemaId, ImagenId) VALUES";

                    for($i=0; $i<$countTema; $i++)
                    {
                        $sql .= " (".$imagen->ImagenSrc[$k]->Tema[$i]->TemaActividadId.", ".$imagenId[$k]."),";
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
       
    }
    /*------------------Termina Imagenes --------------*/
    
    echo '[{"Estatus": "Exitoso"}]';
    $app->status(200);
    $db->commit();
    $db = null;
    
  
}



?>
