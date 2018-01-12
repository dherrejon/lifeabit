<?php
	
function GetPrioridad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT * FROM Prioridad WHERE UsuarioId = ".$id." ORDER BY Orden ASC";

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        $app->status(200);
        
        echo json_encode($response); 
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


function AgregarPrioridad()
{
    $request = \Slim\Slim::getInstance()->request();
    $prioridad = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Prioridad(Nombre, UsuarioId, Orden) VALUES(:Nombre, :UsuarioId, :Orden)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $prioridad->Nombre);
        $stmt->bindParam("UsuarioId", $prioridad->UsuarioId);
        $stmt->bindParam("Orden", $prioridad->Orden);

        $stmt->execute();
        
        
        $app->status(200);
        echo '[{"Estatus": "Exitoso"}]';
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        $app->status(409);
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarPrioridad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $prioridad = json_decode($request->getBody());
   
    $sql = "UPDATE Prioridad SET Nombre= :Nombre WHERE PrioridadId =".$prioridad->PrioridadId."";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Nombre", $prioridad->Nombre);
        
        $stmt->execute();
        $db = null;

        echo '[{"Estatus":"Exitoso"}]';
    }
    catch(PDOException $e) 
    {   
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
        $app->status(409);
        $app->stop();
    }
}


function BorrarPrioridad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $prioridad = json_decode($request->getBody());
   
    $count = count($prioridad);

    
    //--------- Iniciar Conexion
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
    } 
    catch(PDOException $e) 
    {
        $db->rollBack();
        echo '[ { "Estatus": "Fallo" } ]';
        //echo $e;
        $app->status(409);
        $app->stop();
    }
    
    
    //--------- Borrar Prioridad
    for($k=0; $k<$count; $k++)
    {
        if($prioridad[$k]->Eliminar)
        {
            $sql = "DELETE FROM Prioridad WHERE PrioridadId =".$prioridad[$k]->PrioridadId;
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
        }
        else
        {
            $sql = "UPDATE Prioridad SET Orden = ".$prioridad[$k]->Orden." WHERE PrioridadId =".$prioridad[$k]->PrioridadId;
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
        }
    }
    
    //--------- Terminar conexión
    $app->status(200);
    $db->commit();
    $db = null;
    echo '[ { "Estatus": "Exitoso" } ]';

}

function EditarOrdenPrioridad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $prioridad = json_decode($request->getBody());
   
    $count = count($prioridad);

    
    //--------- Iniciar Conexion
    try 
    {
        $db = getConnection();
        $db->beginTransaction();
    } 
    catch(PDOException $e) 
    {
        $db->rollBack();
        echo '[ { "Estatus": "Fallo" } ]';
        //echo $e;
        $app->status(409);
        $app->stop();
    }
    
    
    for($k=0; $k<$count; $k++)
    {
        $sql = "UPDATE Prioridad SET Orden = ".$prioridad[$k]->Orden." WHERE PrioridadId =".$prioridad[$k]->PrioridadId;
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
    }
    
    //--------- Terminar conexión
    $app->status(200);
    $db->commit();
    $db = null;
    echo '[ { "Estatus": "Exitoso" } ]';

}


?>
