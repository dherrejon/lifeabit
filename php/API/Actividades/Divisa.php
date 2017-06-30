<?php
	
function GetDivisa($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT DivisaId, Divisa FROM Divisa WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Divisa":'.json_encode($response).'} ]'; 
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

function AgregarDivisa()
{
    $request = \Slim\Slim::getInstance()->request();
    $divisa = json_decode($request->getBody());
    global $app;
    $sql = "INSERT INTO Divisa (Divisa, UsuarioId) VALUES(:Divisa, :UsuarioId)";

    try 
    {
        $db = getConnection();
        $stmt = $db->prepare($sql);

        $stmt->bindParam("Divisa", $divisa->Divisa);
        $stmt->bindParam("UsuarioId", $divisa->UsuarioId);

        $stmt->execute();
        
        echo '[{"Estatus": "Exitoso"}, {"Id": "'.$db->lastInsertId().'"}]';
        $db = null;

    } catch(PDOException $e) 
    {
        echo $e;
        echo '[{"Estatus": "Fallido"}]';
    }
}

function EditarDivisa()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $divisa = json_decode($request->getBody());
   
    $sql = "UPDATE Divisa SET Divisa='".$divisa->Divisa."' WHERE DivisaId =".$divisa->DivisaId."";
    
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

function BorrarDivisa()
{
    global $app;
    $request = \Slim\Slim::getInstance()->request();
    $id = json_decode($request->getBody());
   
    
    $sql = "DELETE FROM Divisa WHERE DivisaId=".$id;
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
