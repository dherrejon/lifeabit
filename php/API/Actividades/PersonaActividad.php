<?php
	
function GetPersonaActividad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT PersonaId, Nombre FROM PersonaActividad WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Persona":'.json_encode($response).'} ]'; 
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

function AgregarPersonaActividad()
{
    $request = \Slim\Slim::getInstance()->request();
    $persona = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO PersonaActividad (Nombre, UsuarioId) VALUES(:Nombre, :UsuarioId)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Nombre", $persona->Nombre);
        $stmt->bindParam("UsuarioId", $persona->UsuarioId);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarPersonaActividad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $persona = json_decode($request->getBody());
   
    $sql = "UPDATE PersonaActividad SET Nombre= :Nombre WHERE PersonaId =".$persona->PersonaId."";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Nombre", $persona->Nombre);
        
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

function BorrarPersonaActividad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $personaId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM PersonaActividad WHERE PersonaId=".$personaId;
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
