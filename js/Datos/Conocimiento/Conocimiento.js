class Conocimiento
{
    constructor()
    {
        this.ConocimientoId = "";
        this.Fecha = "";
        this.Notas = "";
        this.Titulo = "";
        
        this.Etiqueta = [];
        this.Tema = [];
    }
}

/*function GetNotas($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetNotas/' + usuarioId,

      }).success(function(data)
        {
            var nota = [];
            if(data[0].Estatus == "Exito")
            {
                
                for(var k=0; k<data[1].Notas.length; k++)
                {
                    nota[k] = SetNota(data[1].Notas[k]);
                }
            }

            q.resolve(nota);
             
        }).error(function(data, status){
            q.resolve([]);
     }); 
    return q.promise;
}

function GetNotasPorId($http, $q, CONFIG, datos)     
{
    var q = $q.defer();

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/GetNotasPorId',
          data: datos

      }).success(function(data)
        {
            var nota = [];
            if(data[0].Estatus == "Exito")
            {
                
                for(var k=0; k<data[1].Notas.length; k++)
                {
                    nota[k] = SetNota(data[1].Notas[k]);
                }
            }

            q.resolve(nota);
             
        }).error(function(data, status){
            q.resolve([]);
     }); 
    return q.promise;
}


function SetNota(data)
{
    var nota = new Nota();
    
    nota.NotaId = data.NotaId;
    nota.Titulo = data.Titulo;
    nota.Fecha = data.Fecha;
    nota.Notas = data.Notas;
    
    if(nota.Fecha != null && nota.Fecha != undefined)
    {
        nota.FechaFormato = TransformarFecha(data.Fecha);
    }

    if(data.Notas !== null && data.Notas !== undefined)
    {
         nota.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
    }
    else
    {
         nota.NotasHTML = "";
    }
    
    if(data.Etiqueta !== null && data.Etiqueta !== undefined )
    {
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            nota.Etiqueta[k] = data.Etiqueta[k];
        }
    }
    
    if(data.Tema !== null && data.Tema !== undefined )
    {
        for(var k=0; k<data.Tema.length; k++)
        {
            nota.Tema[k] = data.Tema[k];
        }
    }

    
    return nota;
}

function AgregarNota($http, CONFIG, $q, nota)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarNota',
          data: nota

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarNota($http, CONFIG, $q, nota)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarNota',
          data: nota

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarNota($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarNota',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}*/


//---------- Otras operaciones ---------------
/*function GetTemaPorNota($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetTemaPorNota/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetEtiquetaPorNota($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetEtiquetaPorNota/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetNotasFiltro($http, $q, CONFIG, filtro)     
{
    var q = $q.defer();

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/GetNotasFiltro',
          data: filtro

      }).success(function(data)
        {
            q.resolve(data);
 
        }).error(function(data, status){
            q.resolve([]);
     }); 
    return q.promise;
}*/

  