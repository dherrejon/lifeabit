function GetBuscador($http, $q, CONFIG, filtro)     
{
    var q = $q.defer();

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/GetBuscador',
          data: filtro

      }).success(function(data)
        {
            q.resolve(data);
 
        }).error(function(data, status){
            q.resolve([]);
     }); 
    
    return q.promise;
}

function GetDiarioPorId($http, $q, CONFIG, datos)     
{
    var q = $q.defer();

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/GetDiarioPorId',
          data: datos

      }).success(function(data)
        {
            var diario = [];
            if(data[0].Estatus == "Exito")
            {
                
                for(var k=0; k<data[1].Diario.length; k++)
                {
                    diario[k] = SetDiario(data[1].Diario[k]);
                }
            }

            q.resolve(diario);
             
        }).error(function(data, status){
            q.resolve([]);
     }); 
    return q.promise;
}

function GetActividadPorId($http, $q, CONFIG, datos)     
{
    var q = $q.defer();

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/GetActividadPorId',
          data: datos

      }).success(function(data)
        {
            var actividad = [];
            if(data[0].Estatus == "Exito")
            {
                
                for(var k=0; k<data[1].Actividad.length; k++)
                {
                    actividad[k] = SetActividad(data[1].Actividad[k]);
                    
                    actividad[k].Evento = [];
                    for(var i=0; i<data[1].Actividad[k].Evento.length; i++)
                    {
                        actividad[k].Evento[i] = SetEventoActividad(data[1].Actividad[k].Evento[i]);
                    }
                }
            }

            q.resolve(actividad);
             
        }).error(function(data, status){
            q.resolve([]);
     }); 
    return q.promise;
}




  