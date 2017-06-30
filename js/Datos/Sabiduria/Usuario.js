function GetUsuarios($http, $q, CONFIG)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetUsuarios',

      }).success(function(data)
        {
            var usuario = []; 
            for(var k=0; k<data.length; k++)
            {
                usuario[k] = new Usuario();
                usuario[k] = SetUsuario2(data[k]);
            }
    
            q.resolve(usuario);  
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

function SetUsuario2(data)
{
    var usuario = new Usuario();
    
    usuario.UsuarioId = data.UsuarioId;
    usuario.NombreUsuario = data.NombreUsuario;
    usuario.Password = "";
    usuario.Activo = CambiarIntABool(data.Activo);
    usuario.Nombre = data.Nombre;
    usuario.Apellidos = data.Apellidos;
    usuario.Correo = data.Correo;
    usuario.EtiquetaMsn = data.EtiquetaMsn;
    
    return usuario;
}

function AgregarUsuario($http, CONFIG, $q, usuario)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarUsuario',
          data: usuario

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

function EditarUsuario($http, CONFIG, $q, usuario)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarUsuario',
          data: usuario

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

function ActivarDesactivarUsuario($http, $q, CONFIG, usuario) 
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/ActivarDesactivarUsuario',
          data: usuario

      }).success(function(data)
        {
            q.resolve(data); 
        }).error(function(data, Estatus){
            q.resolve(Estatus);

     }); 
    
    return q.promise;
}

/*------------ permisos ----------------*/
function GetPermiso($http, $q, CONFIG)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetPermiso',

      }).success(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                q.resolve(data[1].Permiso); 
            }
            else
            {
                q.resolve([]); 
            }
             
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

function GetPermisoUsuario($http, $q, CONFIG, id)     
{
    var q = $q.defer();
    
    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetPermisoUsuario',
      }).success(function(data)
        {
            q.resolve(data);  
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}


  