class Nota
{
    constructor()
    {
        this.NotaId = "";
        this.Fecha = "";
        this.Notas = "";
        this.Titulo = "";
        this.Observacion = "";
        this.FechaModificacion = "";
        
        this.Etiqueta = [];
        this.Tema = [];
        this.Imagen = [];
        this.ImagenSrc = [];
    }
}

function GetNotas($http, $q, CONFIG, usuarioId)     
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
    nota.FechaModificacion = data.FechaModificacion;
    nota.Notas = data.Notas;
    nota.Observacion = data.Observacion;
    
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
    
    if(data.Observacion !== null && data.Observacion !== undefined)
    {
         nota.ObservacionHTML = data.Observacion.replace(/\r?\n/g, "<br>");
    }
    else
    {
         nota.ObservacionHTML = "";
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
    
    if(data.Imagen !== null && data.Imagen !== undefined )
    {
        for(var k=0; k<data.Imagen.length; k++)
        {
            nota.Imagen[k] = jQuery.extend({}, data.Imagen[k]);
        }
    }

    
    return nota;
}

function AgregarNota($http, CONFIG, $q, nota)
{
    var q = $q.defer();
    
    var fd = new FormData();
    
    for(var k=0; k<nota.ImagenSrc.length; k++)
    {
        fd.append('file[]', nota.ImagenSrc[k]);
    }
    
    if(nota.Imagen.length > 0)
    {
        for(var k=0; k<nota.Imagen.length; k++)
        {
            if(nota.Imagen[k].Eliminada === undefined)
            {
                nota.Imagen[k].Eliminada = false;
            }
        }
    }
    
    var Nota = SetNota(nota);
    Nota.UsuarioId = nota.UsuarioId;
    Nota.AgregarImagen = nota.ImagenSrc.length;
    
    fd.append('nota', JSON.stringify(Nota));
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarNota',
          data: fd,
          headers: 
          {
            "Content-type": undefined 
          }

      }).success(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                q.resolve(data);
            }
            else
            {
                q.resolve(data);
            }
            
            
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

function EditarNota($http, CONFIG, $q, nota)
{
    var q = $q.defer();
    
    
    var fd = new FormData();
    
    for(var k=0; k<nota.ImagenSrc.length; k++)
    {
        fd.append('file[]', nota.ImagenSrc[k]);
    }
    
    if(nota.Imagen.length > 0)
    {
        for(var k=0; k<nota.Imagen.length; k++)
        {
            if(nota.Imagen[k].Eliminada === undefined)
            {
                nota.Imagen[k].Eliminada = false;
            }
        }
    }

    var Nota = SetNota(nota);
    Nota.UsuarioId = nota.UsuarioId;
    Nota.AgregarImagen = nota.ImagenSrc.length;
    
    fd.append('nota', JSON.stringify(Nota));

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/EditarNota',
          data: fd,
          headers: 
          {
            "Content-type": undefined 
          }

      }).success(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                q.resolve(data);
            }
            else
            {
                q.resolve(data);
            }  
        }).error(function(data, status){
            q.resolve(status);

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
}

//---------- Otras operaciones ---------------
function GetTemaPorNota($http, $q, CONFIG, usuarioId)     
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
}


function GetGaleriaFotos($http, $q, CONFIG, datos)     
{
    var q = $q.defer();

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/GetGaleriaFotos',
          data: datos

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Fotos);
            }

            q.resolve([]);
             
        }).error(function(data, status){
            q.resolve([]);
     }); 
    return q.promise;
}

  