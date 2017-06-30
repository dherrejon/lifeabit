<?php
	
function GetTemaActividad($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT TemaActividadId, Tema FROM TemaActividad WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"TemaActividad":'.json_encode($response).'} ]'; 
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

function AgregarTemaActividad()
{
    $request = \Slim\Slim::getInstance()->request();
    $tema = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO TemaActividad (Tema, UsuarioId) VALUES(:Tema, :UsuarioId)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Tema", $tema->Tema);
        $stmt->bindParam("UsuarioId", $tema->UsuarioId);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarTemaActividad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $tema = json_decode($request->getBody());
   
    $sql = "UPDATE TemaActividad SET Tema= :Tema WHERE TemaActividadId =".$tema->TemaActividadId."";
    
    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);
        
        $stmt->bindParam("Tema", $tema->Tema);
        
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

function BorrarTemaActividad()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $temaId = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM TemaActividad WHERE TemaActividadId=".$temaId;
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
