class Divisa
{
    constructor()
    {
        this.DivisaId = "";
        this.Divisa = "";
    }
}

function GetDivisa($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetDivisa/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var divisa = []; 
                for(var k=0; k<data[1].Divisa.length; k++)
                {
                    divisa[k] = SetDivisa(data[1].Divisa[k]);
                }
                q.resolve(divisa); 
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

function SetDivisa(data)
{
    var divisa = new Divisa();
    
    divisa.DivisaId = data.DivisaId;
    divisa.Divisa = data.Divisa;
    
    return divisa;
}

function AgregarDivisa($http, CONFIG, $q, divisa)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarDivisa',
          data: divisa

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarDivisa($http, CONFIG, $q, divisa)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarDivisa',
          data: divisa

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarDivisa($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarDivisa',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


  