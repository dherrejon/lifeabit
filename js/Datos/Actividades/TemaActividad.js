class TemaActividad
{
    constructor()
    {
        this.TemaActividadId = "";
        this.Tema = "";
    }
}

function GetTemaActividad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetTemaActividad/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var temaActividad = []; 
                for(var k=0; k<data[1].TemaActividad.length; k++)
                {
                    temaActividad[k] = SetTemaActividad(data[1].TemaActividad[k]);
                }
                q.resolve(temaActividad); 
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

function SetTemaActividad(data)
{
    var tema = new TemaActividad();
    
    tema.TemaActividadId = data.TemaActividadId;
    tema.Tema = data.Tema;
    
    return tema;
}

function AgregarTemaActividad($http, CONFIG, $q, tema)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarTemaActividad',
          data: tema

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarTemaActividad($http, CONFIG, $q, tema)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarTemaActividad',
          data: tema

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarTemaActividad($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarTemaActividad',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


  