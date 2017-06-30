class Actividad
{
    constructor()
    {
        this.ActividadId = "";
        this.Nombre = "";
        this.FechaCreacion = "";
        this.Notas = "";
        this.Frecuencia = new Frecuencia();
        this.Tema = [];
        this.Etiqueta = [];
        this.Imagen = [];
        this.Lugar = new Lugar();
    }
}

function GetActividad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetActividad/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Actividad); 
            }
            else
            {
                q.resolve([], []);
            }
             
        }).error(function(data, status){
            q.resolve([], []);
     }); 
    return q.promise;
}

function SetActividad(data)
{
    var actividad = new Actividad();
    
    actividad.ActividadId = data.ActividadId;
    actividad.Nombre = data.Nombre;
    actividad.FechaCreacion = data.FechaCreacion;
    actividad.Notas = data.Notas;
    
    actividad.FechaCreacionFormato = TransformarFecha(data.FechaCreacion);
    
    if(data.Notas !== null)
    {
         actividad.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
    }
    else
    {
         actividad.NotasHTML = "";
    }
    
    if(data.FrecuenciaId !== null)
    {
        actividad.Frecuencia.FrecuenciaId = data.FrecuenciaId;
        actividad.Frecuencia.Nombre = data.NombreFrecuencia;
    }
    
    if(data.Lugar !== null)
    {
        actividad.Lugar.LugarId = data.LugarId;
        actividad.Lugar.Nombre = data.NombreLugar;
    }
    
    if(data.Etiqueta !== null && data.Etiqueta !== undefined )
    {
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            actividad.Etiqueta[k] = data.Etiqueta[k];
        }
    }
    
    if(data.Tema !== null && data.Tema !== undefined )
    {
        for(var k=0; k<data.Tema.length; k++)
        {
            actividad.Tema[k] = data.Tema[k];
        }
    }
    
    return actividad;
}

function AgregarActividad($http, CONFIG, $q, actividad)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarActividad',
          data: actividad

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarActividad($http, CONFIG, $q, actividad)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarActividad',
          data: actividad

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarActividad($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarActividad',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


//---------- Otras operaciones ---------------
function GetTemaPorActividad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetTemaPorActividad/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetEtiquetaPorActividad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetEtiquetaPorActividad/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetFechaActividad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetFechaActividad/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}


  