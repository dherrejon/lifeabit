class Unidad
{
    constructor()
    {
        this.UnidadId = "";
        this.Unidad = "";
    }
}

function GetUnidad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetUnidad/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var unidad = []; 
                for(var k=0; k<data[1].Unidad.length; k++)
                {
                    unidad[k] = SetUnidad(data[1].Unidad[k]);
                }
                q.resolve(unidad); 
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

function SetUnidad(data)
{
    var unidad = new Unidad();
    
    unidad.UnidadId = data.UnidadId;
    unidad.Unidad = data.Unidad;
    
    return unidad;
}

function AgregarUnidad($http, CONFIG, $q, unidad)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarUnidad',
          data: unidad

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarUnidad($http, CONFIG, $q, unidad)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarUnidad',
          data: unidad

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarUnidad($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarUnidad',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


  