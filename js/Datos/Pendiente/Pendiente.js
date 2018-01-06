class Pendiente
{
    constructor()
    {
        this.PendienteId = "";
        this.FechaCreacion = "";
        this.FechaIntencion = "";
        this.FechaRealizacion = "";
        this.Nombre = "";
        this.Nota = "";
        this.Hecho = "0";
        
        this.Prioridad = new Prioridad();
        this.Lugar = new Lugar();
        this.Unidad = new Unidad();
        this.Divisa = new Divisa();
        
        this.Etiqueta = [];
        this.Tema = [];
        this.Imagen = [];
        this.ImagenSrc = [];
    }
}

function SetPendiente(data)
{
    var pendiente = new Pendiente();
    
    pendiente.PendienteId = data.PendienteId;
    pendiente.Nombre = data.Nombre;
    pendiente.Hecho = data.Hecho;
    pendiente.Nota = data.Nota;
    
    pendiente.FechaCreacion = data.FechaCreacion;
    pendiente.FechaCreacionFormato = TransformarFecha(data.FechaCreacion);
    pendiente.FechaIntencion = data.FechaIntencion;
    pendiente.FechaIntencionFormato = TransformarFecha(data.FechaIntencion);
    pendiente.FechaRealizacion = data.FechaRealizacion;
    pendiente.FechaRealizacionFormato = TransformarFecha(data.FechaRealizacion);
    
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
    
    
    if(data.Nota)
    {
         pendiente.NotaHTML = data.Nota.replace(/\r?\n/g, "<br>");
    }
    else
    {
         pendiente.NotaHTML = "";
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


