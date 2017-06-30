class Lugar
{
    constructor()
    {
        this.LugarId = "";
        this.Nombre = "";
        this.Direccion = "";
    }
}

function GetLugar($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetLugar/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var lugar = []; 
                for(var k=0; k<data[1].Lugar.length; k++)
                {
                    lugar[k] = SetLugar(data[1].Lugar[k]);
                }
                q.resolve(lugar); 
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

function SetLugar(data)
{
    var lugar = new Lugar();
    
    lugar.LugarId = data.LugarId;
    lugar.Nombre = data.Nombre;
    lugar.Direccion = data.Direccion;
    
    if(data.Direccion !== null && data.Direccion !== undefined)
    {
         lugar.DireccionHTML = data.Direccion.replace(/\r?\n/g, "<br>");
    }
    else
    {
         lugar.DireccionHTML = "";
    }
    
    return lugar;
}

function AgregarLugar($http, CONFIG, $q, lugar)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarLugar',
          data: lugar

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarLugar($http, CONFIG, $q, lugar)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarLugar',
          data: lugar

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarLugar($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarLugar',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


  