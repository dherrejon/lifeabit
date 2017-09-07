class Diario
{
    constructor()
    {
        this.DiarioId = "";
        this.Fecha = "";
        this.Notas = "";
        this.Ciudad = new Ciudad();
        
        this.Etiqueta = [];
        this.Tema = [];
        this.Imagen = [];
        this.ImagenSrc = [];
    }
}

function GetDiario($http, $q, CONFIG, datos)     
{
    var q = $q.defer();

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/GetDiario',
          data: datos

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                q.resolve(data[1].Diario);
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

function GetFechaDiario($http, $q, CONFIG, data)     
{
    var q = $q.defer();

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/GetFechaDiario',
          data: data

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                /*var diario = [];
                for(var k=0; k<data[1].Diario.length; k++)
                {
                    diario[k] = SetFechaDiario(data[1].Diario[k].Fecha);
                }
                data[1].Diario = diario;*/
                
                q.resolve(data);
            }
            else
            {
                q.resolve(data);
            }
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetImagenDiario($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetImagenDiario/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([], []);
     }); 
    return q.promise;
}

function SetDiario(data)
{
    var diario = new Diario();
    
    diario.DiarioId = data.DiarioId;
    diario.Fecha = data.Fecha;
    diario.Hora = data.Hora;
    diario.Notas = data.Notas;
    diario.Imagen = data.Imagen;
    
    diario.FechaFormato = TransformarFecha(data.Fecha);

    if(data.Hora !== null && data.Hora !== undefined)
    {
        diario.HoraFormato = convertTo24Hour(data.Hora);
    }
    else
    {
        diario.HoraFormato  = null;
    }
    
    if(data.Notas !== null && data.Notas !== undefined)
    {
         diario.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
    }
    else
    {
         diario.NotasHTML = "";
    }
    
    if(data.Etiqueta !== null && data.Etiqueta !== undefined )
    {
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            diario.Etiqueta[k] = data.Etiqueta[k];
            
            if(data.Etiqueta[k].Visible == "1")
            {
                data.Etiqueta[k].Visible = true;
            }
            else if(data.Etiqueta[k].Visible == "0")
            {
                data.Etiqueta[k].Visible = false;
            }
        }
    }
    
    if(data.Tema !== null && data.Tema !== undefined )
    {
        for(var k=0; k<data.Tema.length; k++)
        {
            diario.Tema[k] = data.Tema[k];
        }
    }
    
    diario.Ciudad = SetCiudad(data);
    
    return diario;
}

function SetFechaDiario(data)
{
    var fecha = new Object();
    
    fecha.Fecha = fecha;
    
    var year = data.slice(0,4);
    var mes = parseInt(data.slice(5,7))-1;
    var dia = data.slice(8,10);
    
    fecha.Fecha = data;
    fecha.Year = year;
    fecha.Mes = meses[mes];
    fecha.MesN = data.slice(5,7);
    
    fecha.MesYear = fecha.Mes + " " + year;
    
    var d = new Date(year, mes, dia);

    fecha.Dia = dia + " " + dias[d.getDay()];
    fecha.DiaN = dia;
    
    fecha.FechaFormato = TransformarFecha(data);
    
    return fecha;
}

function AgregarDiario($http, CONFIG, $q, diario)
{
    var q = $q.defer();
    
    var fd = new FormData();
    
    for(var k=0; k<diario.ImagenSrc.length; k++)
    {
        fd.append('file[]', diario.ImagenSrc[k]);
    }
    
    if(diario.Imagen.length > 0)
    {
        for(var k=0; k<diario.Imagen.length; k++)
        {
            if(diario.Imagen[k].Eliminada === undefined)
            {
                diario.Imagen[k].Eliminada = false;
            }
        }
    }

    var Diario = jQuery.extend({}, diario);
    Diario.AgregarImagen = diario.ImagenSrc.length;
    
    fd.append('diario', JSON.stringify(Diario));
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarDiario',
          data: fd,
          headers: 
          {
            "Content-type": undefined 
          }

      }).success(function(data)
        {

            q.resolve(data);
            
        }).error(function(data, status){
            q.resolve(status);

     }); 
    return q.promise;
}

function EditarDiario($http, CONFIG, $q, diario)
{
    var q = $q.defer();
    
    var fd = new FormData();
    
    for(var k=0; k<diario.ImagenSrc.length; k++)
    {
        fd.append('file[]', diario.ImagenSrc[k]);
    }
    
    if(diario.Imagen.length > 0)
    {
        for(var k=0; k<diario.Imagen.length; k++)
        {
            if(diario.Imagen[k].Eliminada === undefined)
            {
                diario.Imagen[k].Eliminada = false;
            }
        }
    }

    var Diario = jQuery.extend({}, diario);
    Diario.AgregarImagen = diario.ImagenSrc.length;
    
    fd.append('diario', JSON.stringify(Diario));

    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/EditarDiario',
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
                q.resolve([{Estatus: "Error"}]);
            }  
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
        console.log(data);

     }); 
    return q.promise;
}

function BorrarDiario($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarDiario',
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
function GetTemaPorDiario($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetTemaPorDiario/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetEtiquetaPorDiario($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetEtiquetaPorDiario/' + usuarioId,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetImagenEtiqueta($http, $q, CONFIG, id)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetImagenEtiqueta/' + id,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}


  