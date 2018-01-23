class Pendiente
{
    constructor()
    {
        this.PendienteId = "";
        this.FechaCreacion = "";
        this.FechaIntencion = "";
        this.FechaRealizacion = "";
        this.HoraIntencion = "";
        this.HoraRealizacion = "";
        this.Nombre = "";
        this.Nota = "";
        this.Hecho = "0";
        this.Recordatorio = "";
        
        this.Prioridad = new Prioridad();
        this.Lugar = new Lugar();
        this.Unidad = new Unidad();
        this.Divisa = new Divisa();
        
        this.Etiqueta = [];
        this.Tema = [];
        this.Imagen = [];
        this.ImagenSrc = [];
        this.Archivo = [];
        this.ArchivoSrc = [];
    }
}

function GetDatosPendiente($http, $q, CONFIG, id)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetPendiente/Datos/' + id,

      }).success(function(data)
        {
            q.resolve(data);
             
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

function SetPendiente(data)
{
    var pendiente = new Pendiente();
    
    pendiente.PendienteId = data.PendienteId;
    pendiente.Nombre = data.Nombre;
    pendiente.Hecho = data.Hecho;
    pendiente.Nota = data.Nota;
    pendiente.Recordatorio = data.Recordatorio;
    
    pendiente.FechaCreacion = data.FechaCreacion;
    pendiente.FechaCreacionFormato = TransformarFecha(data.FechaCreacion);
    pendiente.FechaIntencion = data.FechaIntencion;
    pendiente.FechaIntencionFormato = TransformarFecha(data.FechaIntencion);
    pendiente.FechaRealizacion = data.FechaRealizacion;
    pendiente.FechaRealizacionFormato = TransformarFecha(data.FechaRealizacion);
    
    pendiente.HoraIntencion = data.HoraIntencion;
    pendiente.HoraRealizacion = data.HoraRealizacion;
    
    pendiente.Prioridad.PrioridadId = data.PrioridadId;
    pendiente.Prioridad.Nombre = data.NombrePrioridad;
    
    pendiente.Lugar.LugarId = data.LugarId;
    pendiente.Lugar.Nombre = data.NombreLugar;
    
    pendiente.Unidad.UnidadId = data.UnidadId;
    pendiente.Unidad.Unidad = data.Unidad;
    pendiente.Unidad.Cantidad = data.Cantidad;
    
    pendiente.Divisa.DivisaId = data.DivisaId;
    pendiente.Divisa.Divisa = data.Divisa;
    pendiente.Divisa.Costo = data.Costo;
    
    pendiente.Imagen = data.Imagen;
    pendiente.Archivo = data.Archivo;
    pendiente.Archivo = data.Archivo;
    
    if(data.Nota)
    {
         pendiente.NotaHTML = data.Nota.replace(/\r?\n/g, "<br>");
    }
    else
    {
         pendiente.NotaHTML = "";
    }
    
    if(data.Recordatorio)
    {
         pendiente.RecordatorioHTML = data.Recordatorio.replace(/\r?\n/g, "<br>");
    }
    else
    {
         pendiente.RecordatorioHTML = "";
    }
    
    pendiente.EtiquetaVisible = [];
    
    if(data.Etiqueta)
    {
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            pendiente.Etiqueta[k] = data.Etiqueta[k];
            
            if(data.Etiqueta[k].Visible == "1")
            {
                pendiente.Etiqueta[k].Visible = true;
                pendiente.EtiquetaVisible.push(pendiente.Etiqueta[k]);
            }
            else
            {
                pendiente.Etiqueta[k].Visible = false;
            }
        }
    }
    
    if(data.Tema)
    {
        for(var k=0; k<data.Tema.length; k++)
        {
            pendiente.Tema[k] = data.Tema[k];
        }
    }
    
    return pendiente;
}

class Prioridad
{
    constructor()
    {
        this.PrioridadId = "";
        this.Importancia = "";
        this.Nombre = "";
    }
}

function GetPrioridad()
{
    var prioridad = [];
    
    prioridad[0] = new Prioridad();
    prioridad[0].PrioridadId = "1";
    prioridad[0].Nombre = "Prioritario";
    prioridad[0].Importancia = "1";
    
    prioridad[1] = new Prioridad();
    prioridad[1].PrioridadId = "2";
    prioridad[1].Nombre = "Importante";
    prioridad[1].Importancia = "2";
    
    prioridad[2] = new Prioridad();
    prioridad[2].PrioridadId = "3";
    prioridad[2].Nombre = "Urgente";
    prioridad[2].Importancia = "3";
    
    prioridad[3] = new Prioridad();
    prioridad[3].PrioridadId = null;
    prioridad[3].Nombre = "Normal";
    prioridad[3].Importancia = null;
    
    return prioridad;
}


