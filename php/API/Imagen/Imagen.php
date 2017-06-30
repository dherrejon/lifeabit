<?php
	
function GetGaleriaFotos()
{
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    global $app;

    $sql = "SELECT ImagenId, Imagen, Extension, Nombre, Size FROM Imagen WHERE UsuarioId = ".$datos[2]." LIMIT ".$datos[0].",".$datos[1];

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        foreach ($response as $aux) 
        {
            $aux->Imagen =  base64_encode($aux->Imagen);
        }
        
        echo '[ { "Estatus": "Exito"}, {"Fotos":'.json_encode($response).'} ]'; 
        $db = null;
 
    } 
    catch(PDOException $e) 
    {
        echo($sql);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}
    
?>
