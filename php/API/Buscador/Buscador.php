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
    
    if($numEtiqueta > 0)
    {
        $whereEtiqueta = "(";
        
        for($k=0; $k<$numEtiqueta; $k++)
        {
            $whereEtiqueta .= $filtro->etiqueta[$k]->EtiquetaId. ",";
        }
        $whereEtiqueta = rtrim($whereEtiqueta,",");
        $whereEtiqueta .= ")";
    }
    
    
    if($numEtiqueta > 0 && $numTema > 0)
    {
         $sql = "SELECT n.NotaId, n.Titulo FROM Nota n
                    INNER JOIN (
                    
                    SELECT e.NotaId FROM EtiquetaNotaVista e   
                    INNER JOIN (SELECT t.NotaId FROM TemaNotaVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.NotaId HAVING count(*) = ".$numTema.") y ON y.NotaId = e.NotaId
                        
                    WHERE e.EtiquetaId IN ".$whereEtiqueta." GROUP BY e.NotaId HAVING count(*) = ".$numEtiqueta."
                    ) x ON x.NotaId = n.NotaId";
        
        $sqlDiario = "SELECT  d.DiarioId, d.Notas, d.Fecha FROM Diario d
                    INNER JOIN (
                    
                    SELECT e.DiarioId FROM EtiquetaDiarioVista e   
                    INNER JOIN (SELECT t.DiarioId FROM TemaDiarioVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.DiarioId HAVING count(*) = ".$numTema.") y ON y.DiarioId = e.DiarioId
                        
                    WHERE e.EtiquetaId IN ".$whereEtiqueta." GROUP BY e.DiarioId HAVING count(*) = ".$numEtiqueta."
                    ) x ON x.DiarioId = d.DiarioId";
        
        $sqlActividad = "SELECT a.ActividadId, a.Nombre FROM Actividad a
                    INNER JOIN (
                    
                    SELECT e.ActividadId FROM EtiquetaActividadVista e   
                    INNER JOIN (SELECT t.ActividadId FROM TemaActividadVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.ActividadId HAVING count(*) = ".$numTema.") y ON y.ActividadId = e.ActividadId
                        
                    WHERE e.EtiquetaId IN ".$whereEtiqueta." GROUP BY e.ActividadId HAVING count(*) = ".$numEtiqueta."
                    ) x ON x.ActividadId = a.ActividadId";
    }
    else if($numEtiqueta > 0 || $numTema > 0)
    {
        if($numEtiqueta > 0)
        {
            $sql = "SELECT n.NotaId, n.Titulo FROM Nota n 
                    INNER JOIN (
                        SELECT e.NotaId FROM EtiquetaNotaVista e WHERE e.EtiquetaId in ".$whereEtiqueta." GROUP BY e.NotaId HAVING count(*) = ".$numEtiqueta."
                    ) x ON x.NotaId = n.NotaId";
            
            $sqlDiario = "SELECT d.DiarioId, d.Notas, d.Fecha  FROM Diario d 
                    INNER JOIN (
                        SELECT e.DiarioId FROM EtiquetaDiarioVista e WHERE e.EtiquetaId in ".$whereEtiqueta." GROUP BY e.DiarioId HAVING count(*) = ".$numEtiqueta."
                    ) x ON x.DiarioId = d.DiarioId";
            
            $sqlActividad = "SELECT a.ActividadId, a.Nombre FROM Actividad a 
                    INNER JOIN (
                        SELECT e.ActividadId FROM EtiquetaActividadVista e WHERE e.EtiquetaId in ".$whereEtiqueta." GROUP BY e.ActividadId HAVING count(*) = ".$numEtiqueta."
                    ) x ON x.ActividadId = a.ActividadId";
            
            
            
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
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    //diario
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sqlDiario);
        $diario = $stmt->fetchAll(PDO::FETCH_OBJ);

 
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    //actividad
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sqlActividad);
        $actividad = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $db = null;
        echo '[{"Estatus": "Exito"}, {"Notas":'.json_encode($nota).'}, {"Diario":'.json_encode($diario).'}, {"Actividad":'.json_encode($actividad).'}]';
 
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
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
            $sql = "SELECT EtiquetaId, Nombre FROM EtiquetaDiarioVista WHERE DiarioId = ".$diario[$k]->DiarioId;
            
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
            $sql = "SELECT EtiquetaId, Nombre FROM EtiquetaActividadVista WHERE ActividadId = ".$actividad[$k]->ActividadId;
            
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
