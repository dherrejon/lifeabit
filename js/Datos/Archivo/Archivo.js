class Archivo
{
    constructor()
    {
        this.ArchivoId = "";
        this.Nombre = "";
        this.Extension = "";
        this.Size = "";
        
        this.Etiqueta = [];
        this.Tema = [];
    }
}

function SetArchivo(data)
{
    var file = jQuery.extend({}, data);
    file.Etiqueta = [];
    file.Tema = [];

    for(var k=0; k<data.Etiqueta.length; k++)
    {
        var etiqueta = new Object();
        etiqueta.EtiquetaId = data.Etiqueta[k].EtiquetaId;
        etiqueta.Nombre = data.Etiqueta[k].Nombre;
        etiqueta.Visible = data.Etiqueta[k].Visible;
        etiqueta.count = data.Etiqueta[k].count;
        file.Etiqueta.push(etiqueta);
    }

    for(var k=0; k<data.Tema.length; k++)
    {
        var tema = new Object();

        tema.TemaActividadId = data.Tema[k].TemaActividadId;
        tema.Tema = data.Tema[k].Tema;
        file.Tema.push(data.Tema[k]);
    }

    return file;
}