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
    
    //Nota
    $sqlEtiquetaNota = "";
    $sqlEtiquetaBaseNota1 = " SELECT e.NotaId FROM EtiquetaNotaVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseNota2 = " GROUP BY e.NotaId";
    
    //Diario
    $sqlEtiquetaDiario = "";
    $sqlEtiquetaBaseDiario1 = " SELECT e.DiarioId FROM EtiquetaDiarioVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseDiario2 = " GROUP BY e.DiarioId";
    
    //Actividad
    $sqlEtiquetaActividad = "";
    $sqlEtiquetaBaseActividad1 = " SELECT e.ActividadId FROM EtiquetaActividadVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseActividad2 = " GROUP BY e.ActividadId";
    
    //Imagen
    $sqlEtiquetaImagen = "";
    $sqlEtiquetaBaseImagen1 = " SELECT e.ImagenId FROM EtiquetaImagenVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseImagen2 = " GROUP BY e.ImagenId";
    
    //Evento
    $sqlEtiquetaEvento = "";
    $sqlEtiquetaBaseEvento1 = " SELECT e.EventoActividadId FROM EtiquetaEventoVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseEvento2 = " GROUP BY e.EventoActividadId";
    
    //Pendiente
    $sqlEtiquetaPendiente = "";
    $sqlEtiquetaBasePendiente1 = " SELECT e.PendienteId FROM EtiquetaPendienteVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBasePendiente2 = " GROUP BY e.PendienteId";
    
     //Archivo
    $sqlEtiquetaArchivo = "";
    $sqlEtiquetaBaseArchivo1 = " SELECT e.ArchivoId FROM EtiquetaArchivoVista e WHERE EtiquetaId IN ";
    $sqlEtiquetaBaseArchivo2 = " GROUP BY e.ArchivoId";
    
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
                $sqlEtiquetaEvento .= $sqlEtiquetaBaseEvento1.$whereEtiqueta.$sqlEtiquetaBaseEvento2;
                $sqlEtiquetaPendiente .= $sqlEtiquetaBasePendiente1.$whereEtiqueta.$sqlEtiquetaBasePendiente2;
                $sqlEtiquetaArchivo .= $sqlEtiquetaBaseArchivo1.$whereEtiqueta.$sqlEtiquetaBaseArchivo2;
            }
            else
            {
                $sqlEtiquetaNota .= " UNION ALL ".$sqlEtiquetaBaseNota1.$whereEtiqueta.$sqlEtiquetaBaseNota2;
                $sqlEtiquetaDiario .= " UNION ALL ".$sqlEtiquetaBaseDiario1.$whereEtiqueta.$sqlEtiquetaBaseDiario2;
                $sqlEtiquetaActividad .= " UNION ALL ".$sqlEtiquetaBaseActividad1.$whereEtiqueta.$sqlEtiquetaBaseActividad2;
                $sqlEtiquetaImagen .= " UNION ALL ".$sqlEtiquetaBaseImagen1.$whereEtiqueta.$sqlEtiquetaBaseImagen2;
                $sqlEtiquetaEvento .= " UNION ALL ".$sqlEtiquetaBaseEvento1.$whereEtiqueta.$sqlEtiquetaBaseEvento2;
                $sqlEtiquetaPendiente .= " UNION ALL ".$sqlEtiquetaBasePendiente1.$whereEtiqueta.$sqlEtiquetaBasePendiente2;
                $sqlEtiquetaArchivo .= " UNION ALL ".$sqlEtiquetaBaseArchivo1.$whereEtiqueta.$sqlEtiquetaBaseArchivo2;
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
        
            $sqlEvento = "SELECT e.EventoActividadId, e.Fecha, e.Actividad, e.ActividadId FROM EventoActividadVista e 
                    INNER JOIN ("
                        .$sqlEtiquetaEvento.
                
                    " UNION ALL SELECT t.EventoActividadId FROM TemaEventoVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.EventoActividadId HAVING count(*) = ".$numTema.
                
                    ") x ON x.EventoActividadId = e.EventoActividadId GROUP BY e.EventoActividadId HAVING count(*) = ".($numEtiqueta+1);
        
            $sqlPendiente = "SELECT p.PendienteId, p.Nombre, p.Hecho, p.FechaIntencion, p.FechaRealizacion, p.NombrePrioridad, p.Importancia   FROM PendienteVista p
                    INNER JOIN ("
                        .$sqlEtiquetaPendiente.
                
                    " UNION ALL SELECT t.PendienteId FROM TemaPendienteVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.PendienteId HAVING count(*) = ".$numTema.
                
                    ") x ON x.PendienteId = p.PendienteId GROUP BY p.PendienteId HAVING count(*) = ".($numEtiqueta+1);
        
            $sqlArchivo = "SELECT i.ArchivoId, i.Nombre FROM Archivo i 
                    INNER JOIN ("
                        .$sqlEtiquetaArchivo.
                
                    " UNION ALL SELECT t.ArchivoId FROM TemaArchivoVista t
                    WHERE TemaActividadId  IN ".$whereTema." GROUP BY t.ArchivoId HAVING count(*) = ".$numTema.
                
                    ") x ON x.ArchivoId = i.ArchivoId GROUP BY i.ArchivoId HAVING count(*) = ".($numEtiqueta+1);
        
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
            
            $sqlEvento = "SELECT e.EventoActividadId, e.Fecha, e.Actividad, e.ActividadId FROM EventoActividadVista e
                    INNER JOIN ("
                        .$sqlEtiquetaEvento.
                    ") x ON x.EventoActividadId = e.EventoActividadId GROUP BY e.EventoActividadId HAVING count(*) = ".$numEtiqueta;
            
            $sqlPendiente = "SELECT p.PendienteId, p.Nombre, p.Hecho, p.FechaIntencion, p.FechaRealizacion, p.NombrePrioridad, p.Importancia   FROM PendienteVista p
                    INNER JOIN ("
                        .$sqlEtiquetaPendiente.
                    ") x ON x.PendienteId = p.PendienteId GROUP BY p.PendienteId HAVING count(*) = ".$numEtiqueta;
            
            $sqlArchivo = "SELECT i.ArchivoId, i.Nombre FROM Archivo i 
                    INNER JOIN ("
                        .$sqlEtiquetaArchivo.
                    ") x ON x.ArchivoId = i.ArchivoId GROUP BY i.ArchivoId HAVING count(*) = ".$numEtiqueta;
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
            
            $sqlEvento = "SELECT e.EventoActividadId, e.Fecha, e.Actividad, e.ActividadId FROM EventoActividadVista e
                    INNER JOIN (
                        SELECT t.EventoActividadId FROM TemaEventoVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.EventoActividadId HAVING count(*) = ".$numTema."
                    ) x ON x.EventoActividadId = e.EventoActividadId";
            
            $sqlPendiente = "SELECT p.PendienteId, p.Nombre, p.Hecho, p.FechaIntencion, p.FechaRealizacion, p.NombrePrioridad, p.Importancia   FROM PendienteVista p
                    INNER JOIN (
                        SELECT t.PendienteId FROM TemaPendienteVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.PendienteId HAVING count(*) = ".$numTema."
                    ) x ON x.PendienteId = p.PendienteId";
            
            $sqlArchivo = "SELECT i.ArchivoId, i.Nombre FROM Archivo i
                    INNER JOIN (
                        SELECT t.ArchivoId FROM TemaArchivoVista t WHERE t.TemaActividadId in ".$whereTema." GROUP BY t.ArchivoId HAVING count(*) = ".$numTema."
                    ) x ON x.ArchivoId = i.ArchivoId";
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
        
        $sqlEvento = "SELECT e.EventoActividadId, e.Fecha, e.Actividad, e.ActividadId FROM EventoActividadVista e WHERE UsuarioId = '".$filtro->usuarioId ."' AND  Fecha = '". $filtro->fecha."'";
    
        $sqlPendiente = "SELECT p.PendienteId, p.Nombre, p.Hecho, p.FechaIntencion, p.FechaRealizacion, p.NombrePrioridad, p.Importancia   FROM PendienteVista p WHERE p.UsuarioId = '".$filtro->usuarioId ."' AND p.FechaRealizacion = '". $filtro->fecha."'";
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
    
    //Evento
    try 
    {
        //$db = getConnection();
        $stmt = $db->query($sqlEvento);
        $evento = $stmt->fetchAll(PDO::FETCH_OBJ);
        
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
    
    //Pendiente
    try 
    {
        $db = getConnection();
        $stmt = $db->query($sqlPendiente);
        $pendiente = $stmt->fetchAll(PDO::FETCH_OBJ);

    } 
    catch(PDOException $e) 
    {
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
            $stmt = $db->query($sqlArchivo);
            $archivo = $stmt->fetchAll(PDO::FETCH_OBJ);

        } 
        catch(PDOException $e) 
        {
            echo($e);
            echo '[ { "Estatus": '.$e.' } ]';
            $app->status(409);
            $app->stop();
        }
        
        try 
        {
            $db = getConnection();
            $stmt = $db->query($sqlImagen);
            $imagen = $stmt->fetchAll(PDO::FETCH_OBJ);

            $db = null;
            echo '[{"Estatus": "Exito"}, {"Notas":'.json_encode($nota).'}, {"Diario":'.json_encode($diario).'}, {"Actividad":'.json_encode($actividad).'}, {"Imagen":'.json_encode($imagen).'}, {"Evento":'.json_encode($evento).'}, {"Pendiente":'.json_encode($pendiente).'}, {"Archivo":'.json_encode($archivo).'}]';

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
        echo '[{"Estatus": "Exito"}, {"Notas":'.json_encode($nota).'}, {"Diario":'.json_encode($diario).'}, {"Actividad":'.json_encode($actividad).'},  {"Imagen":[]}, {"Evento":'.json_encode($evento).'}, {"Pendiente":'.json_encode($pendiente).'},  {"Archivo":[]}]';
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
            
            $sql = "SELECT ImagenId, Nombre, Extension, Size FROM ImagenDiarioVista WHERE DiarioId = ".$diario[$k]->DiarioId;

            try 
            {
                $stmt = $db->query($sql);
                $diario[$k]->Imagen = $stmt->fetchAll(PDO::FETCH_OBJ);
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
            
            $countEvento = count($actividad[$k]->Evento);
    
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
            }
        }
    }
    
    $db = null;
    echo '[{"Estatus": "Exito"},  {"Actividad":'.json_encode($actividad).'}]';
    
}

?>
