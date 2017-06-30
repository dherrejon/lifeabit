class EventoActividad
{
    constructor()
    {
        this.EventoActividadId = "";
        this.Notas = "";
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
    evento.ActividadId = data.ActividadId;
    evento.Actividad = data.Actividad;
    evento.Costo = data.Costo;
    evento.Cantidad = data.Cantidad;
    evento.FechaFormato = TransformarFecha(data.Fecha);
    
    if(data.Notas !== null)
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
    
    return evento;
}

function AgregarEventoActividad($http, CONFIG, $q, evento)
{
    var q = $q.defer();
    
    if(evento.Costo !== undefined && evento.Costo !== null)
    {
        if(evento.Costo.length === 0)
        {
            evento.Costo = null;
        }
    }
    else
    {
        evento.Costo = null;
    }
    
    if(evento.Cantidad !== undefined && evento.Cantidad !== null)
    {
        if(evento.Cantidad.length === 0)
        {
            evento.Cantidad = null;
        }
    }
    else
    {
        evento.Cantidad = null;
    }
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarEventoActividad',
          data: evento

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarEventoActividad($http, CONFIG, $q, evento)
{
    var q = $q.defer();
    
    if(evento.Costo !== undefined && evento.Costo !== null)
    {
        if(evento.Costo.length === 0)
        {
            evento.Costo = null;
        }
    }
    else
    {
        evento.Costo = null;
    }
    
    if(evento.Cantidad !== undefined && evento.Cantidad !== null)
    {
        if(evento.Cantidad.length === 0)
        {
            evento.Cantidad = null;
        }
    }
    else
    {
        evento.Cantidad = null;
    }

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarEventoActividad',
          data: evento

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

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


var dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiempre", "Octubre", "Noviembre", "Diciembre"];


  