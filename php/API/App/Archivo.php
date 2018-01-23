<?php
	
function GetArchivo($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT ArchivoId, Size, Nombre, Extension FROM Archivo WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ); 
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
    
    $count = count($response);
    
    for($k=0; $k<$count; $k++)
    {
        $sql = "SELECT EtiquetaId, Nombre, Visible, count FROM EtiquetaArchivoVista WHERE ArchivoId = ".$response[$k]->ArchivoId;

        try 
        {
            $db = getConnection();
            $stmt = $db->query($sql);
            $response[$k]->Etiqueta = $stmt->fetchAll(PDO::FETCH_OBJ); 
        } 
        catch(PDOException $e) 
        {
            echo($e);
            echo '[ { "Estatus": "Fallo" } ]';
            $app->status(409);
            $app->stop();
        }
        
        $sql = "SELECT TemaActividadId, Tema FROM TemaArchivoVista WHERE ArchivoId = ".$response[$k]->ArchivoId;

        try 
        {
            $db = getConnection();
            $stmt = $db->query($sql);
            $response[$k]->Tema = $stmt->fetchAll(PDO::FETCH_OBJ); 
        } 
        catch(PDOException $e) 
        {
            echo($e);
            echo '[ { "Estatus": "Fallo" } ]';
            $app->status(409);
            $app->stop();
        }
    }
    
    $app->status(200);
    $db = null;
    echo json_encode($response); 
}

function GetNumeroArchivo($id)
{
    global $app;
    global $session_expiration_time;

    $request = \Slim\Slim::getInstance()->request();

    $sql = "SELECT COUNT(*) as Numero FROM Archivo WHERE UsuarioId = ".$id;

    try 
    {
        $db = getConnection();
        $stmt = $db->query($sql);
        $response = $stmt->fetchAll(PDO::FETCH_OBJ); 
        
        $app->status(200);
        $db = null;
        echo $response[0]->Numero; 
    } 
    catch(PDOException $e) 
    {
        //echo($e);
        echo '[ { "Estatus": "Fallo" } ]';
        $app->status(409);
        $app->stop();
    }
}

?>
