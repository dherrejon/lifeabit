class EventoActividad
{
    constructor()
    {
        this.EventoActividadId = "";
        this.Notas = "";
        this.Hora = "";
        this.Fecha = "";
        this.Cantidad = "";
        this.Costo = "";
        this.Actividad = "";
        this.ActividadId = "";
        
        this.Ciudad = new Ciudad();
        this.Persona = [];
        this.Lugar = new Lugar();
        this.Unidad = new Unidad();
        this.Divisa = new Divisa();
        
        this.Hecho = "0";
        this.FechaHecho = "";
        
        this.Tema = [];
        this.Etiqueta = [];
        
        this.Imagen = [];
        this.ImagenSrc = [];
        
        this.Archivo = [];
        this.ArchivoSrc = [];
    }
}

function GetEventoActividad($http, $q, CONFIG, id)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetEventoActividad/' + id,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var evento = []; 
                for(var k=0; k<data[1].Evento.length; k++)
                {
                    evento[k] = SetEventoActividad(data[1].Evento[k]);
                }
                q.resolve(evento); 
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

function SetEventoActividad(data)
{
    var evento = new EventoActividad();
    
    evento.EventoActividadId = data.EventoActividadId;
    evento.Fecha = data.Fecha;
    evento.Hora = data.Hora;
    evento.ActividadId = data.ActividadId;
    evento.Actividad = data.Actividad;
    evento.Costo = data.Costo;
    evento.Cantidad = data.Cantidad;
    evento.FechaFormato = TransformarFecha(data.Fecha);
    evento.Imagen = data.Imagen;
    evento.Archivo = data.Archivo;
    
    evento.Hecho = data.Hecho;
    evento.FechaHecho = data.FechaHecho;
    
    if(data.Hora !== null)
    {
        evento.HoraFormato = convertTo24Hour(data.Hora);
    }
    else
    {
        evento.HoraFormato  = null;
    }
    
    if(data.Notas)
    {
         evento.Notas = data.Notas;
         evento.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
    }
    else
    {
         evento.Notas = ""; 
         evento.NotasHTML = "";
    }
    
    if(data.CiudadId !== null)
    {
        evento.Ciudad.CiudadId = data.CiudadId;
        evento.Ciudad.Ciudad = data.Ciudad;
        evento.Ciudad.Estado = data.Estado;
        evento.Ciudad.Pais = data.Pais;
        evento.Ciudad.AbreviacionPais = data.AbreviacionPais;
    }
    
    if(data.LugarId !== null)
    {
        evento.Lugar.LugarId = data.LugarId;
        evento.Lugar.Nombre = data.Lugar;
    }
    
    if(data.UnidadId !== null)
    {
        evento.Unidad.UnidadId = data.UnidadId;
        evento.Unidad.Unidad = data.Unidad;
    }
    
    if(data.DivisaId !== null)
    {
        evento.Divisa.DivisaId = data.DivisaId;
        evento.Divisa.Divisa = data.Divisa;
    }
    
    
    evento.EtiquetaVisible = [];
    
    if(data.Etiqueta !== null && data.Etiqueta !== undefined )
    {
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            evento.Etiqueta[k] = data.Etiqueta[k];
            
            if(data.Etiqueta[k].Visible == "1")
            {
                evento.Etiqueta[k].Visible = true;
                evento.EtiquetaVisible.push(evento.Etiqueta[k]);
            }
            else
            {
                evento.Etiqueta[k].Visible = false;
            }
        }
    }
    
    if(data.Tema !== null && data.Tema !== undefined )
    {
        for(var k=0; k<data.Tema.length; k++)
        {
            evento.Tema[k] = data.Tema[k];
        }
    }
    
    return evento;
}

function AgregarEventoActividad($http, CONFIG, $q, evento)
{
    var q = $q.defer();
    
    var fd = new FormData();
    
    for(var k=0; k<evento.ImagenSrc.length; k++)
    {
        fd.append('file[]', evento.ImagenSrc[k]);
    }
    
    if(evento.Imagen.length > 0)
    {
        for(var k=0; k<evento.Imagen.length; k++)
        {
            if(evento.Imagen[k].Eliminada === undefined)
            {
                evento.Imagen[k].Eliminada = false;
            }
        }
    }

    var Evento = jQuery.extend({}, evento);
    Evento.Cantidad = SetValNull(Evento.Cantidad);
    Evento.Costo = SetValNull(Evento.Costo);
    
    Evento.AgregarImagen = Evento.ImagenSrc.length;
    
    fd.append('evento', JSON.stringify(Evento));
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarEventoActividad',
          data: fd,
          headers: 
          {
            "Content-type": undefined 
          }

      }).success(function(data)
        {

            q.resolve(data);
            
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);

     }); 
    return q.promise;
}

function EditarEventoActividad($http, CONFIG, $q, evento)
{
    var q = $q.defer();
    
    var fd = new FormData();
    
    for(var k=0; k<evento.ImagenSrc.length; k++)
    {
        fd.append('file[]', evento.ImagenSrc[k]);
    }
    
    if(evento.Imagen.length > 0)
    {
        for(var k=0; k<evento.Imagen.length; k++)
        {
            if(evento.Imagen[k].Eliminada === undefined)
            {
                evento.Imagen[k].Eliminada = false;
            }
        }
    }

    var Evento = jQuery.extend({}, evento);
    Evento.Cantidad = SetValNull(Evento.Cantidad);
    Evento.Costo = SetValNull(Evento.Costo);
    
    Evento.AgregarImagen = Evento.ImagenSrc.length;
    
    //console.log(evento);
    fd.append('evento', JSON.stringify(Evento));
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/EditarEventoActividad',
          data: fd,
          headers: 
          {
            "Content-type": undefined 
          }

      }).success(function(data)
        {

            q.resolve(data);
            
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);

     }); 
    return q.promise;
}

function BorrarEventoActividad($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarEventoActividad',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function HechoEvento($http, CONFIG, $q, evento)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/HechoEvento',
          data: evento

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


//------------------- Otros catálogos ---------------------------------------
function GetPersonaEventoActividad($http, $q, CONFIG, id)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetPersonaEventoActividad/' + id,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function GetEventoActividadPorId($http, $q, CONFIG, id)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetEventoActividadPorId/' + id,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var evento = []; 
                for(var k=0; k<data[1].Evento.length; k++)
                {
                    evento[k] = SetEventoActividad(data[1].Evento[k]);
                }
                q.resolve(evento); 
            }
            else
            {
                q.resolve([]);
            }
             
        }).error(function(data, status){
            q.resolve([{Estatus: status}]);
     }); 
    return q.promise;
}

function TransformarFecha(fecha)
{
    var year = fecha.slice(0,4);
    var mes = parseInt(fecha.slice(5,7))-1;
    var dia = fecha.slice(8,10);
    
    var d = new Date(year, mes, dia);
    
    mes = meses[d.getMonth()];
    var diaNombre = dias[d.getDay()];
    
    var fechaF = diaNombre + " " + dia + " de "  + mes + " de " + year;
    
    return fechaF;
}

function TransformarFecha2(fecha)
{
    var year = fecha.slice(6,10);
    var mes = fecha.slice(3,5);
    var dia = fecha.slice(0,2);
    
    
    var fechaF = year + "-" + mes + "-" + dia;
    
    return fechaF;
}

function TransformarDateToFecha(fecha)
{
    var mes = parseInt(fecha.getMonth());
    
    var mes2 = mes + 1;
    if(mes2 < 10)
    {
        mes2 = "0" + mes2;
    }

    var dia = parseInt(fecha.getDate());
    if(dia < 10)
    {
        dia = "0" + dia;
    }


    return fecha.getFullYear()+ "-" + mes2 + "-" + dia;
}

function GetDate()
{
    var fecha;
    var d = new Date();
    
    var dia = d.getDate();
    var mes = d.getMonth() +1;
    
    if(mes<10)
    {
        mes = "0" + mes;
    }
    if(dia<10)
    {
        dia = "0" + dia;
    }
    
    fecha = d.getFullYear() + "-" + mes + "-" + dia;
    
    return fecha;
}


function convertTo24Hour(time) 
{
    if(time.indexOf('PM')  != -1) 
    {
        var horaAux = time.slice(0,2);
        var hora;

        hora = parseInt(horaAux);
        
        if(hora != 12)
        {
            hora += 12;
        }
        
        hora = hora.toString();
        
        time = time.replace(horaAux, hora);
        time = time.replace("PM", "");
    }
    else
    {
        time = time.replace("12", "00");
        time = time.replace("AM", "");
    }
    
    return time;
}

function SetValNull(val)
{
    if(val !== undefined && val !== null)
    {
        if(val.length === 0)
        {
            return null;
        }
    }
    else
    {
        return null;
    }
    
    return val;
}

var dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiempre", "Octubre", "Noviembre", "Diciembre"];


  