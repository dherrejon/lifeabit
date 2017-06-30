class Frecuencia
{
    constructor()
    {
        this.FrecuenciaId = "";
        this.Nombre = "";
    }
}

function GetFrecuencia($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetFrecuencia/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var frecuencia = []; 
                for(var k=0; k<data[1].Frecuencia.length; k++)
                {
                    frecuencia[k] = SetFrecuencia(data[1].Frecuencia[k]);
                }
                q.resolve(frecuencia); 
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

function SetFrecuencia(data)
{
    var frecuencia = new Frecuencia();
    
    frecuencia.FrecuenciaId = data.FrecuenciaId;
    frecuencia.Nombre = data.Nombre;
    
    return frecuencia;
}

function AgregarFrecuencia($http, CONFIG, $q, frecuencia)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarFrecuencia',
          data: frecuencia

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarFrecuencia($http, CONFIG, $q, frecuencia)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarFrecuencia',
          data: frecuencia

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarFrecuencia($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarFrecuencia',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


  