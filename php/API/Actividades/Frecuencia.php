<?php
	
function GetFrecuencia($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT FrecuenciaId, Nombre FROM Frecuencia WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Frecuencia":'.json_encode($response).'} ]'; 
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

function AgregarFrecuencia()
{
    $request = \Slim\Slim::getInstance()->request();
    $frecuencia = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Frecuencia (Nombre, UsuarioId) VALUES(:Nombre, :UsuarioId)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $frecuencia->Nombre);
        $stmt->bindParam("UsuarioId", $frecuencia->UsuarioId);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarFrecuencia()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $frecuencia = json_decode($request->getBody());
   
    $sql = "UPDATE Frecuencia SET Nombre='".$frecuencia->Nombre."' WHERE FrecuenciaId =".$frecuencia->FrecuenciaId."";
    
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

function BorrarFrecuencia()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $frecuenciaId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Frecuencia WHERE FrecuenciaId=".$frecuenciaId;
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
