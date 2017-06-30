/*------Medio Contacto---------*/

class Etiqueta
{
    constructor()
    {
        this.EtiquetaId = "";
        this.Nombre = "";
    }
}

//obtiene los tipos de módulos
function GetEtiqueta($http, $q, CONFIG, id)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetEtiqueta/' + id,

      }).success(function(data)
        {
            var etiqueta = []; 
            for(var k=0; k<data.length; k++)
            {
                etiqueta[k] = new Etiqueta();
                etiqueta[k] = SetEtiqueta(data[k]);
            }
    
            q.resolve(etiqueta);  
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

//copia los datos de un material
function SetEtiqueta(data)
{
    var etiqueta = new Etiqueta();
    
    etiqueta.EtiquetaId = data.EtiquetaId;
    etiqueta.Nombre = data.Nombre;
    
    return etiqueta;
}

//agregaga un maqueo
function AgregarEtiqueta($http, CONFIG, $q, etiqueta)
{
    var q = $q.defer();
    
    etiqueta.Activo = CambiarBoolAInt(etiqueta.Activo);
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarEtiqueta',
          data: etiqueta

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

//edita un consumible
function EditarEtiqueta($http, CONFIG, $q, etiqueta)
{
    var q = $q.defer();
    
    etiqueta.Activo = CambiarBoolAInt(etiqueta.Activo);

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarEtiqueta',
          data: etiqueta

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

function ActivarDesactivarEtiqueta($http, $q, CONFIG, etiqueta) 
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/ActivarDesactivarEtiqueta',
          data: etiqueta

      }).success(function(data)
        {
            q.resolve(data); 
        }).error(function(data, Estatus){
            q.resolve(Estatus);

     }); 
    
    return q.promise;
}

function BorrarEtiqueta($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarEtiqueta',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


  