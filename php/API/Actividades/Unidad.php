<?php
	
function GetUnidad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT UnidadId, Unidad FROM Unidad WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Unidad":'.json_encode($response).'} ]'; 
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

function AgregarUnidad()
{
    $request = \Slim\Slim::getInstance()->request();
    $unidad = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Unidad (Unidad, UsuarioId) VALUES(:Unidad, :UsuarioId)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Unidad", $unidad->Unidad);
        $stmt->bindParam("UsuarioId", $unidad->UsuarioId);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarUnidad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $unidad = json_decode($request->getBody());
   
    $sql = "UPDATE Unidad SET Unidad='".$unidad->Unidad."' WHERE UnidadId =".$unidad->UnidadId."";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);
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

function BorrarUnidad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $id = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Unidad WHERE UnidadId=".$id;
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
    
?>
