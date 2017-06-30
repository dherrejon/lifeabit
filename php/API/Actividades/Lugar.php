<?php
	
function GetLugar($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT LugarId, Nombre, Direccion FROM Lugar WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Lugar":'.json_encode($response).'} ]'; 
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

function AgregarLugar()
{
    $request = \Slim\Slim::getInstance()->request();
    $lugar = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Lugar(Nombre, UsuarioId, Direccion) VALUES(:Nombre, :UsuarioId, :Direccion)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $lugar->Nombre);
        $stmt->bindParam("UsuarioId", $lugar->UsuarioId);
        $stmt->bindParam("Direccion", $lugar->Direccion);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarLugar()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $lugar = json_decode($request->getBody());
   
    $sql = "UPDATE Lugar SET Nombre= :Nombre, Direccion= :Direccion  WHERE LugarId =".$lugar->LugarId."";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Nombre", $lugar->Nombre);
        $stmt->bindParam("Direccion", $lugar->Direccion);
        
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

function BorrarLugar()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $lugarId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Lugar WHERE LugarId=".$lugarId;
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
