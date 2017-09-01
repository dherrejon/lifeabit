<?php
	
function GetBuscador()
{
    $request = \Slim\Slim::getInstance()->request();
    $filtro = json_decode($request->getBody());
    global $app;
    
    $numTema = count($filtro->tema);
    $numEtiqueta = count($filtro->etiqueta);

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
    
    $sqlEtiquetaNota = "";
    $sqlEtiquetaBaseNota1 = " SELECT e.NotaId FROM EtiquetaNotaVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseNota2 = " GROUP BY e.NotaId";
    
    $sqlEtiquetaDiario = "";
    $sqlEtiquetaBaseDiario1 = " SELECT e.DiarioId FROM EtiquetaDiarioVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseDiario2 = " GROUP BY e.DiarioId";
    
    $sqlEtiquetaActividad = "";
    $sqlEtiquetaBaseActividad1 = " SELECT e.ActividadId FROM EtiquetaActividadVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseActividad2 = " GROUP BY e.ActividadId";
    
    $sqlEtiquetaImagen = "";
    $sqlEtiquetaBaseImagen1 = " SELECT e.ImagenId FROM EtiquetaImagenVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseImagen2 = " GROUP BY e.ImagenId";
    
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
                $sqlEtiquetaDiario .= $sqlEtiquetaBaseDiario1.$whereEtiqueta.$sqlEtiquetaBaseDiario2;
                $sqlEtiquetaActividad .= $sqlEtiquetaBaseActividad1.$whereEtiqueta.$sqlEtiquetaBaseActividad2;
                $sqlEtiquetaImagen .= $sqlEtiquetaBaseImagen1.$whereEtiqueta.$sqlEtiquetaBaseImagen2;
            }
            else
            {
                $sqlEtiquetaNota .= " UNION ALL ".$sqlEtiquetaBaseNota1.$whereEtiqueta.$sqlEtiquetaBaseNota2;
                $sqlEtiquetaDiario .= " UNION ALL ".$sqlEtiquetaBaseDiario1.$whereEtiqueta.$sqlEtiquetaBaseDiario2;
                $sqlEtiquetaActividad .= " UNION ALL ".$sqlEtiquetaBaseActividad1.$whereEtiqueta.$sqlEtiquetaBaseActividad2;
                $sqlEtiquetaImagen .= " UNION ALL ".$sqlEtiquetaBaseImagen1.$whereEtiqueta.$sqlEtiquetaBaseImagen2;
            }
        }
    }
    
    
    if($numEtiqueta > 0 && $numTema > 0)
    {
         $sql = "SELECT n.NotaId, n.Titulo FROM Nota n 
                    INNER JOIN ("
                        .$sqlEtiquetaNota.
             
                    " UNION ALL SELECT t.NotaId FROM TemaNotaVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.NotaId HAVING count(*) = ".$numTema.
             
                    ") x ON x.NotaId = n.NotaId GROUP BY n.NotaId  HAVING count(*) = ".($numEtiqueta+1);
            
            $sqlDiario = "SELECT d.DiarioId, d.Notas, d.Fecha  FROM Diario d 
                    INNER JOIN ("
                         .$sqlEtiquetaDiario.
                
                    " UNION ALL SELECT t.DiarioId FROM TemaDiarioVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.DiarioId HAVING count(*) = ".$numTema.
                    
                    ") x ON x.DiarioId = d.DiarioId GROUP BY d.DiarioId  HAVING count(*) = ".($numEtiqueta+1);
            
            $sqlActividad = "SELECT a.ActividadId, a.Nombre FROM Actividad a 
                    INNER JOIN ("
                        .$sqlEtiquetaActividad.
                
                    " UNION ALL SELECT t.ActividadId FROM TemaActividadVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.ActividadId HAVING count(*) = ".$numTema.
                
                    ") x ON x.ActividadId = a.ActividadId GROUP BY a.ActividadId HAVING count(*) = ".($numEtiqueta+1);
        
            $sqlImagen = "SELECT i.ImagenId, i.Nombre FROM Imagen i 
                    INNER JOIN ("
                        .$sqlEtiquetaImagen.
                
                    " UNION ALL SELECT t.ImagenId FROM TemaImagenVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.ImagenId HAVING count(*) = ".$numTema.
                
                    ") x ON x.ImagenId = i.ImagenId GROUP BY i.ImagenId HAVING count(*) = ".($numEtiqueta+1);
        
    }
    else if($numEtiqueta > 0 || $numTema > 0)
    {
        if($numEtiqueta > 0)
        {
            $sql = "SELECT n.NotaId, n.Titulo FROM Nota n 
                    INNER JOIN ("
                        .$sqlEtiquetaNota.
                    ") x ON x.NotaId = n.NotaId GROUP BY n.NotaId  HAVING count(*) = ".$numEtiqueta;
            
            $sqlDiario = "SELECT d.DiarioId, d.Notas, d.Fecha  FROM Diario d 
                    INNER JOIN ("
                         .$sqlEtiquetaDiario.
                    ") x ON x.DiarioId = d.DiarioId GROUP BY d.DiarioId  HAVING count(*) = ".$numEtiqueta;
            
            $sqlActividad = "SELECT a.ActividadId, a.Nombre FROM Actividad a 
                    INNER JOIN ("
                        .$sqlEtiquetaActividad.
                    ") x ON x.ActividadId = a.ActividadId GROUP BY a.ActividadId HAVING count(*) = ".$numEtiqueta;
            
            $sqlImagen = "SELECT i.ImagenId, i.Nombre FROM Imagen i 
                    INNER JOIN ("
                        .$sqlEtiquetaImagen.
                    ") x ON x.ImagenId = i.ImagenId GROUP BY i.ImagenId HAVING count(*) = ".$numEtiqueta;
        }
        else if($numTema > 0)
        {
            $sql = "SELECT n.NotaId, n.Titulo FROM Nota n
                    INNER JOIN (
                        SELECT t.NotaId FROM TemaNotaVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.NotaId HAVING count(*) = ".$numTema."
                    ) x ON x.NotaId = n.NotaId";
            
            $sqlDiario = "SELECT  d.DiarioId, d.Notas, d.Fecha FROM Diario d
                    INNER JOIN (
                        SELECT t.DiarioId FROM TemaDiarioVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.DiarioId HAVING count(*) = ".$numTema."
                    ) x ON x.DiarioId = d.DiarioId";
            
            $sqlActividad = "SELECT a.ActividadId, a.Nombre FROM Actividad a
                    INNER JOIN (
                        SELECT t.ActividadId FROM TemaActividadVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.ActividadId HAVING count(*) = ".$numTema."
                    ) x ON x.ActividadId = a.ActividadId";
            
            $sqlImagen = "SELECT i.ImagenId, i.Nombre FROM Imagen i
                    INNER JOIN (
                        SELECT t.ImagenId FROM TemaImagenVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.ImagenId HAVING count(*) = ".$numTema."
                    ) x ON x.ImagenId = i.ImagenId";
        }
    }

    if($filtro->fecha != "")
    {
        $sql = "SELECT n.NotaId, n.Titulo FROM Nota n WHERE UsuarioId = '".$filtro->usuarioId ."' AND Fecha = '". $filtro->fecha."'";
        
        $sqlDiario = "SELECT d.DiarioId, d.Notas, d.Fecha FROM Diario d WHERE UsuarioId = '".$filtro->usuarioId ."' AND  Fecha = '". $filtro->fecha."'";
        
        $sqlActividad = "SELECT a.ActividadId, a.Nombre FROM Actividad a
                        
                        INNER JOIN (SELECT DISTINCT e.ActividadId FROM EventoActividad e WHERE  Fecha = '". $filtro->fecha."') x
                        ON x.ActividadId = a.ActividadId
                        WHERE UsuarioId = '".$filtro->usuarioId ."'";
    }
    
    //nota
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $nota = $stmt->fetchAll(PDO::FETCH_OBJ);

    } 
    catch(PDOException $e) 
    {
        echo '[ { "Estatus": '.$e.' } ]';
        $app->status(409);
        $app->stop();
    }
    
    //diario
    try 
    {
        //$db = getConnection();
        $stmt = $db->query($sqlDiario);
        $diario = $stmt->fetchAll(PDO::FETCH_OBJ);

 
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": '.$e.' } ]';
        $app->status(409);
        $app->stop();
    }
    
    //actividad
    try 
    {
        //$db = getConnection();
        $stmt = $db->query($sqlActividad);
        $actividad = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        //$db = null;
        //echo '[{"Estatus": "Exito"}, {"Notas":'.json_encode($nota).'}, {"Diario":'.json_encode($diario).'}, {"Actividad":'.json_encode($actividad).'}]';
 
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": '.$e.' } ]';
        $app->status(409);
        $app->stop();
    }
    
    //Imagen
    if($filtro->fecha == "")
    {
        try 
        {
            $db = getConnection();
            $stmt = $db->query($sqlImagen);
            $imagen = $stmt->fetchAll(PDO::FETCH_OBJ);

            $db = null;
            echo '[{"Estatus": "Exito"}, {"Notas":'.json_encode($nota).'}, {"Diario":'.json_encode($diario).'}, {"Actividad":'.json_encode($actividad).'}, {"Imagen":'.json_encode($imagen).'}]';

        } 
        catch(PDOException $e) 
        {
            echo($e);
            echo '[ { "Estatus": '.$e.' } ]';
            $app->status(409);
            $app->stop();
        }
    }
    else
    {
        $db = null;
        echo '[{"Estatus": "Exito"}, {"Notas":'.json_encode($nota).'}, {"Diario":'.json_encode($diario).'}, {"Actividad":'.json_encode($actividad).'},  {"Imagen":[]}]';
    }
}

function GetDiarioPorId()
{
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    global $app;
    
    $sql = "SELECT * FROM Diario WHERE DiarioId = ".$datos->Id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $diario = $stmt->fetchAll(PDO::FETCH_OBJ);
 
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $numDiario = count($diario);
    
    if($numDiario > 0)
    {
        for($k=0; $k<$numDiario; $k++)
        {
            $sql = "SELECT EtiquetaId, Nombre, Visible FROM EtiquetaDiarioVista WHERE DiarioId = ".$diario[$k]->DiarioId;
            
            try 
            {
                $stmt = $db->query($sql);
                $diario[$k]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);

            } 
            catch(PDOException $e) 
            {
                //echo($e);
                echo '[ { "Estatus": "Fallo" } ]';
                $app->status(409);
                $app->stop();
            }
            
            $sql = "SELECT TemaActividadId, Tema FROM TemaDiarioVista WHERE DiarioId = ".$diario[$k]->DiarioId;
            
            try 
            {
                $stmt = $db->query($sql);
                $diario[$k]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ);
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
    echo '[{"Estatus": "Exito"},  {"Diario":'.json_encode($diario).'}]';
    
}

function GetActividadPorId()
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
            $sql = "SELECT EtiquetaId, Nombre, Visible FROM EtiquetaActividadVista WHERE ActividadId = ".$actividad[$k]->ActividadId;
            
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
            
            $sql = "SELECT * FROM EventoActividadVista WHERE ActividadId = ".$actividad[$k]->ActividadId;
            
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
        }
    }
    
    $db = null;
    echo '[{"Estatus": "Exito"},  {"Actividad":'.json_encode($actividad).'}]';
    
}

?>
