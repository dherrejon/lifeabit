<?php
	
function GetEtiqueta($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT EtiquetaId, Nombre, Activo, count FROM EtiquetaVista WHERE UsuarioId  = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
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

function AgregarEtiqueta()
{
    $request = \Slim\Slim::getInstance()->request();
    $etiqueta = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Etiqueta (Nombre, Activo, UsuarioId) VALUES(:Nombre, :Activo, :UsuarioId)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $etiqueta->Nombre);
        $stmt->bindParam("Activo", $etiqueta->Activo);
        $stmt->bindParam("UsuarioId", $etiqueta->UsuarioId);

        $stmt->execute();
        
        $etiqueta->EtiquetaId = $db->lastInsertId();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}, {"Etiqueta":'.json_encode($etiqueta).'}]';
        
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarEtiqueta()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $etiqueta = json_decode($request->getBody());
   
    $sql = "UPDATE Etiqueta SET Nombre = :Nombre, Activo = '".$etiqueta->Activo."'  WHERE EtiquetaId=".$etiqueta->EtiquetaId."";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Nombre", $etiqueta->Nombre);
        
        $stmt->execute();
        $db = null;

        echo '[{"Estatus":"Exitoso"}]';
    }
    catch(PDOException $e) 
    {    
        echo '[{"Estatus": "Fallido"}]';
        $app->status(409);
        $app->stop();
    }
}

function ActivarDesactivarEtiqueta()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    try 
    {
        $db = getConnection();
        
        $sql = "UPDATE Etiqueta SET Activo = ".$datos[0]." WHERE EtiquetaId = ".$datos[1]."";
        $stmt = $db->prepare($sql);
        $stmt->execute();
    
        $db = null;
        
        echo '[{"Estatus": "Exito"}]';
    }
    catch(PDOException $e) 
    {
        echo '[{"Estatus":"Fallo"}]';
        //echo ($sql);
        $app->status(409);
        $app->stop();
    }
}

function BorrarEtiqueta()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $etiquetaId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Etiqueta WHERE EtiquetaId =".$etiquetaId;
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

//------------------------------ Etiquetas Equivalentes -------------------------------

function GetEtiquetaEquivalente($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT IF(EtiquetaId1=".$id.", EtiquetaId2, EtiquetaId1) as EtiquetaId, IF(EtiquetaId1=".$id.", Nombre2, Nombre1) as Nombre
            FROM EtiquetaEquivalenteVista
            WHERE EtiquetaId1 = ".$id." OR EtiquetaId2 =".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        
        echo json_encode($response);  
    } 
    catch(PDOException $e) 
    {
        echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

function SetEtiquetaEquivalente()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $equivalente = json_decode($request->getBody());
   
    $sql = "DELETE FROM EtiquetaEquivalente WHERE EtiquetaId1=".$equivalente->EtiquetaId." OR EtiquetaId2 = ".$equivalente->EtiquetaId;

    try 
    {
        $db = getConnection();
        $db->beginTransaction();
        $stmt = $db->prepare($sql);
        
        $stmt->execute();
    }
    catch(PDOException $e) 
    {    
        echo '[{"Estatus": "Fallido"}]';
        $db->rollBack();
        $app->status(409);
        $app->stop();
    }
    
    $countEtiqueta = count($equivalente->Etiqueta);
    
    $sql = "DELETE FROM EtiquetaEquivalente WHERE ";
    if($countEtiqueta > 1)
    {
        $count = 0;
        for($i=0; $i<($countEtiqueta-1); $i++)
        {
            for($j=($i+1); $j<$countEtiqueta; $j++)
            {
                if($equivalente->Etiqueta[$i]->EtiquetaId != "-1" && $equivalente->Etiqueta[$j]->EtiquetaId != "-1") 
                {   
                    $sql .= "(EtiquetaId1 = ".$equivalente->Etiqueta[$i]->EtiquetaId ." AND EtiquetaId2 = ".$equivalente->Etiqueta[$j]->EtiquetaId.
                        ") OR (EtiquetaId2 = ".$equivalente->Etiqueta[$i]->EtiquetaId ." AND EtiquetaId1 = ".$equivalente->Etiqueta[$j]->EtiquetaId.") OR";
                    $count++;
                }
            }
            
        }
        
        if($count > 0)
        {
            $sql = rtrim($sql,"OR");
            try 
            {
                $stmt = $db->prepare($sql);

                $stmt->execute();
            }
            catch(PDOException $e) 
            {    
                echo '[{"Estatus": "Fallido"}]';
                echo $sql;
                $db->rollBack();
                $app->status(409);
                $app->stop();
            }
        }
    }
    
    if($countEtiqueta>0)  
    {
        //etiquetas Nuevos
        for($k=0; $k<$countEtiqueta; $k++)
        {
            if($equivalente->Etiqueta[$k]->EtiquetaId == "-1")
            {
                $sql = "INSERT INTO Etiqueta (UsuarioId, Nombre, Activo) VALUES (:UsuarioId, :Nombre, 1)";
                
                try 
                {
                    $stmt = $db->prepare($sql);
                    
                    $stmt->bindParam("UsuarioId", $equivalente->UsuarioId);
                    $stmt->bindParam("Nombre", $equivalente->Etiqueta[$k]->Nombre);
                    
                    $stmt->execute();
                    
                    $equivalente->Etiqueta[$k]->EtiquetaId  = $db->lastInsertId();
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
        
        $sql = "INSERT INTO EtiquetaEquivalente (EtiquetaId1, EtiquetaId2) VALUES";
        
        
        /*Etiqueta de la actividad*/
        for($k=0; $k<$countEtiqueta; $k++)
        {
            $sql .= " (".$equivalente->EtiquetaId.", ".$equivalente->Etiqueta[$k]->EtiquetaId."),";
        }
        
        for($i=0; $i<($countEtiqueta-1); $i++)
        {
            for($j=($i+1); $j<$countEtiqueta; $j++)
            {
                $sql .= " (".$equivalente->Etiqueta[$i]->EtiquetaId.", ".$equivalente->Etiqueta[$j]->EtiquetaId."),";
            }
        }

        $sql = rtrim($sql,",");

        try 
        {
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            echo '[{"Estatus": "Exitoso"}, {"Etiqueta":'.json_encode($equivalente->Etiqueta).'}]';
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
        echo '[{"Estatus": "Exitoso"}, {"Etiqueta":'.json_encode($equivalente->Etiqueta).'}]';
    }
}
    
?>
