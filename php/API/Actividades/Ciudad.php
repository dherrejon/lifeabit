<?php
	
function GetCiudad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT CiudadId, Pais, Estado, Ciudad FROM Ciudad WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Ciudad":'.json_encode($response).'} ]'; 
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

function AgregarCiudad()
{
    $request = \Slim\Slim::getInstance()->request();
    $ciudad = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Ciudad(UsuarioId, Pais, Estado, Ciudad) VALUES(:UsuarioId, :Pais, :Estado, :Ciudad)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("UsuarioId", $ciudad->UsuarioId);
        $stmt->bindParam("Pais", $ciudad->Pais);
        $stmt->bindParam("Estado", $ciudad->Estado);
        $stmt->bindParam("Ciudad", $ciudad->Ciudad);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarCiudad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $ciudad = json_decode($request->getBody());
   
    $sql = "UPDATE Ciudad SET Pais = :Pais, Estado = :Estado, Ciudad = :Ciudad  WHERE CiudadId =".$ciudad->CiudadId."";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Pais", $ciudad->Pais);
        $stmt->bindParam("Estado", $ciudad->Estado);
        $stmt->bindParam("Ciudad", $ciudad->Ciudad);
        
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

function BorrarCiudad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $id = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Ciudad WHERE CiudadId=".$id;
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
