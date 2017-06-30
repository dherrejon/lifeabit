class Ciudad
{
    constructor()
    {
        this.CiudadId = "";
        this.Pais = "";
        this.Estado = "";
        this.Ciudad = "";
    }
}

function GetCiudad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetCiudad/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var ciudad = []; 
                for(var k=0; k<data[1].Ciudad.length; k++)
                {
                    ciudad[k] = SetCiudad(data[1].Ciudad[k]);
                }
                q.resolve(ciudad); 
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

function SetCiudad(data)
{
    var ciudad = new Ciudad();
    
    ciudad.CiudadId = data.CiudadId;
    ciudad.Pais = data.Pais;
    ciudad.Estado = data.Estado;
    ciudad.Ciudad = data.Ciudad;
    
    return ciudad;
}

function AgregarCiudad($http, CONFIG, $q, ciudad)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarCiudad',
          data: ciudad

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarCiudad($http, CONFIG, $q, ciudad)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarCiudad',
          data: ciudad

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarCiudad($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarCiudad',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


  