class Conocimiento
{
    constructor()
    {
        this.ConocimientoId = "";
        this.Informacion = "";
        this.Observacion = "";
        this.Titulo = "";
        
        this.Etiqueta = [];
        this.Tema = [];
        
        this.Imagen = [];
        this.ImagenSrc = [];
        this.Archivo = [];
        this.ArchivoSrc = [];
    }
}

function SetConocimiento(data)
{
    var conocimiento = new Conocimiento();
    
    conocimiento.ConocimientoId = data.ConocimientoId;
    conocimiento.Titulo = data.Titulo;
    conocimiento.Informacion = data.Informacion;
    conocimiento.Observacion = data.Observacion;
    conocimiento.Imagen = data.Imagen;
    conocimiento.Archivo = data.Archivo;
    
    if(data.Informacion)
    {
         conocimiento.InformacionHTML = data.Informacion.replace(/\r?\n/g, "<br>");
    }
    else
    {
         conocimiento.InformacionHTML = "";
    }
    
    if(data.Observacion)
    {
         conocimiento.ObservacionHTML = data.Observacion.replace(/\r?\n/g, "<br>");
    }
    else
    {
         conocimiento.ObservacionHTML = "";
    }
    
    conocimiento.EtiquetaVisible = [];
    
    if(data.Etiqueta)
    {
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            conocimiento.Etiqueta[k] = data.Etiqueta[k];
            
            if(data.Etiqueta[k].Visible == "1")
            {
                conocimiento.Etiqueta[k].Visible = true;
                conocimiento.EtiquetaVisible.push(conocimiento.Etiqueta[k]);
            }
            else
            {
                conocimiento.Etiqueta[k].Visible = false;
            }
        }
    }
    
    if(data.Tema)
    {
        for(var k=0; k<data.Tema.length; k++)
        {
            conocimiento.Tema[k] = data.Tema[k];
        }
    }
    
    return conocimiento;
}