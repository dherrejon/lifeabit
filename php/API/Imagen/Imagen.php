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

function GetFototeca()
{
    $request = \Slim\Slim::getInstance()->request();
    $datos = json_decode($request->getBody());
    global $app;

    $sql = "SELECT ImagenId, Extension, Nombre, Size FROM Imagen WHERE UsuarioId = ".$datos[0];

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ);
        
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

function GetImagenEtiqueta($id)
{
    $request = \Slim\Slim::getInstance()->request();
    global $app;

    $sql = "SELECT TemaActividadId, Tema FROM TemaImagenVista WHERE ImagenId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $tema = $stmt->fetchAll(PDO::FETCH_OBJ);
    } 
    catch(PDOException $e) 
    {
        echo($sql);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
     $sql = "SELECT EtiquetaId, Nombre, Visible FROM EtiquetaImagenVista WHERE ImagenId = ".$id;

    try 
    {
        $stmt = $db->query($sql);
        $etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        echo '[ { "Estatus": "Exito"}, {"Etiqueta":'.json_encode($etiqueta).'}, {"Tema":'.json_encode($tema).'} ]'; 
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
