app.controller("AplicacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce)
{   
    
    $scope.IniciarApp = function(app)
    {
        if(app != "Home")
        { 
            datosUsuario.setAplicacion(app.texto);
        
            SetAplicacion(app.texto, $http, CONFIG);
            $location.path(app.paginaPrincipal);
        }
        else
        {
            datosUsuario.setAplicacion("Home");
        
            SetAplicacion("Home", $http, CONFIG);
        }
    };
    
    $scope.etiqueta = [];
    $scope.tema = [];
    
    $scope.nota = [];
    $scope.diario = [];
    $scope.actividad = [];
    $scope.imagen = [];
    $scope.detalle = [];
    $scope.tipoDetalle = "";
    $scope.verDetalle = false;
    $scope.hoy = GetDate();
    
    $scope.verFiltro = true;
    $scope.filtro = {etiqueta:[], tema:[], fecha: "", fechaFormato: ""};
    
    $scope.buscarConcepto = "";
    $scope.campoBuscar = "Conceptos";
    
    $scope.appBuscar = ["Todo", "Actividades", "Diario", "Imagenes", "Notas"];
    $scope.appFiltro = "Todo";
    $scope.verApp = {actividad:true, diario: true, nota:true, imagen:true};
    
    //------------------- Catálogos (coneptos) -----------------------------------
    $scope.GetTemaActividad = function()              
    {
        GetTemaActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].mostrar = true;
            }
            
            $scope.tema = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetEtiqueta = function()              
    {
        GetEtiqueta($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].mostrar = true;
            }
            
            $scope.etiqueta = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    //------------- otras operaciones --------------------
    $scope.GetBuscador = function()
    {   
        $scope.filtro.usuarioId = $rootScope.UsuarioId;
        
        GetBuscador($http, $q, CONFIG, $scope.filtro).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                for(var k=0; k<data[2].Diario.length; k++)
                {
                    /*if($scope.campoBuscar == "Conceptos")
                    {
                       data[2].Diario[k].FechaFormato = TransformarFecha( data[2].Diario[k].Fecha); 
                    }
                    else if($scope.campoBuscar == "Fecha")
                    {*/
                    
                    data[2].Diario[k].FechaFormato = TransformarFecha( data[2].Diario[k].Fecha);
                    
                    if(data[2].Diario[k].Notas !== null && data[2].Diario[k].Notas !== undefined)
                    {
                         data[2].Diario[k].NotasHTML = data[2].Diario[k].Notas.replace(/\r?\n/g, "<br>");
                         data[2].Diario[k].NotasHTML = $sce.trustAsHtml(data[2].Diario[k].NotasHTML);
                    }
                    else
                    {
                         data[2].Diario[k].NotasHTML = "";
                    }
                    //}
                }
                
                $scope.nota = data[1].Notas;
                $scope.diario = data[2].Diario;
                $scope.actividad = data[3].Actividad;
                $scope.imagen = data[4].Imagen;
            }
            else
            {
                $scope.LimpiarBusqueda();
            }
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*---------------- Get detalles --------------------------------*/
    $scope.GetNotasPorId = function(id)
    {
        var datos = {Tipo:"Nota", Id:id};
        $scope.tipoDetalle = "Nota";
        
        GetNotasPorId($http, $q, CONFIG, datos).then(function(data)
        {
            
            for(var k=0; k<data.length; k++)
            {
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
                
                data[k].EtiquetaVisible = $scope.GetEtiquetaVisible(data[k].Etiqueta);
            }

            $scope.detalle = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
        
    };
    
    $scope.GetDiarioPorId = function(id)
    {
        var datos = {Id:id};
        $scope.tipoDetalle = "Diario";
        
        GetDiarioPorId($http, $q, CONFIG, datos).then(function(data)
        {
            
            for(var k=0; k<data.length; k++)
            {
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
                
                data[k].EtiquetaVisible = $scope.GetEtiquetaVisible(data[k].Etiqueta);
            }
            
            $scope.detalle = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetActividadPorId = function(id)
    {
        var datos = {Id:id};
        $scope.tipoDetalle = "Actividad";
        
        GetActividadPorId($http, $q, CONFIG, datos).then(function(data)
        {
            
            for(var k=0; k<data.length; k++)
            {
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
                
                for(var i=0; i<data[k].Evento.length; i++)
                {
                    data[k].Evento[i].NotasHTML = $sce.trustAsHtml( data[k].Evento[i].NotasHTML);
                }
                
                data[k].EtiquetaVisible = $scope.GetEtiquetaVisible(data[k].Etiqueta);
            }
             
            $scope.detalle = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetActividadPorId = function(id)
    {
        var datos = {Id:id};
        $scope.tipoDetalle = "Actividad";
        
        GetActividadPorId($http, $q, CONFIG, datos).then(function(data)
        {
            
            for(var k=0; k<data.length; k++)
            {
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
                
                for(var i=0; i<data[k].Evento.length; i++)
                {
                    data[k].Evento[i].NotasHTML = $sce.trustAsHtml( data[k].Evento[i].NotasHTML);
                }
                
                data[k].EtiquetaVisible = $scope.GetEtiquetaVisible(data[k].Etiqueta);
            }
             
            $scope.detalle = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetImagenEtiqueta = function(imagen)
    {
        $scope.tipoDetalle = "Imagen";
        
        GetImagenEtiqueta($http, $q, CONFIG, imagen.ImagenId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                imagen.Etiqueta = data[1].Etiqueta;
                imagen.Tema = data[2].Tema;
            }
            else
            {
                imagen.Etiqueta = [];
                imagen.Tema = [];
            }
            
            for(var k=0; k<imagen.Etiqueta.length; k++)
            {
                if(imagen.Etiqueta[k].Visible == "1")
                {
                    imagen.Etiqueta[k].Visible = true;
                }
                else
                {
                    imagen.Etiqueta[k].Visible = false;
                }
            }
            
            imagen.EtiquetaVisible = $scope.GetEtiquetaVisible(imagen.Etiqueta);
            $scope.detalle[0] = imagen;

        }).catch(function(error)
        {
            alert(error);
        });
        
    };
    
    //-------------------------- Detalles ------------------------
    $scope.LimpiarDetalle = function()
    {
        $scope.detalle = [];
        $scope.tipoDetalle = "Nota";
        $scope.verDetalle = false;
    };
    
    $scope.GetClaseEvento = function(evento)
    {
        if($scope.hoy > evento.Fecha)
        {
            return "Pasada";
        }
        else
        {
            return "";
        }
    };
    
    $scope.VerDetallesEvento = function(evento)
    {
        $scope.detalleEvento = evento;
        $('#DetalleEvento').modal('toggle');
    };
    
    
    $scope.GetEtiquetaVisible = function(etiqueta)
    {
        var visible = [];
        
        for(var k=0; k<etiqueta.length; k++)
        {
            if(etiqueta[k].Visible)
            {
                visible.push(etiqueta[k]);
            }
        }
        
        return visible;
    };
    
    //----------------- buscar concepto ----------------
    //------ Tema --------
    $scope.FiltrarBuscarTema = function(tema, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = tema.Tema.toLowerCase().indexOf(buscar.toLowerCase());


                if(index < 0)
                {
                    return false;
                }
                else
                {
                    if(index === 0)
                    {
                        return true;
                    }
                    else
                    {
                        if(tema.Tema[index-1] == " ")
                        {
                            return true;
                        }
                        else
                        {
                            return false;
                        }
                    }
                }
            }
            else
            {
                return true;
            }
        }
    };
    
    $scope.BuscarTemaFiltro = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConcepto);
    };
    
    //------ etiqueta ------
    $scope.FiltrarBuscarEtiqueta = function(etiqueta, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = etiqueta.Nombre.toLowerCase().indexOf(buscar.toLowerCase());


                if(index < 0)
                {
                    return false;
                }
                else
                {
                    if(index === 0)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
            else
            {
                return true;
            }
        }
    };
    
    $scope.BuscarEtiquetaFiltro = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConcepto);
    };

    
    //-------------------- Filtro ----------------------------
    $('#buscarConcepto').keydown(function(e)
    {
        switch(e.which) {
            case 13:
               var index = $scope.buscarConcepto.indexOf(" ");
               
               if(index == -1)
                {
                    $scope.AgregarEtiquetaFiltro($scope.buscarConcepto);
                }
                else
                {
                    var etiquetas = $scope.buscarConcepto.split(" ");
                    for(var k=0; k<etiquetas.length; k++)
                    {
                        if(etiquetas[k] != "")
                        {
                            $scope.AgregarEtiquetaFiltro(etiquetas[k]);
                        }
                    }
                }
               
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.SetFiltroEtiqueta = function(etiqueta)
    {
        etiqueta.mostrar = false;
        $scope.filtro.etiqueta.push(etiqueta);
            
        $scope.buscarConcepto = "";
        document.getElementById('buscarConcepto').focus();
        
        $scope.GetBuscador();
    };
    
    $scope.SetFiltroTema = function(tema)
    {
        tema.mostrar = false;
        $scope.filtro.tema.push(tema);
        
        $scope.buscarConcepto = "";
        document.getElementById('buscarConcepto').focus();
        
        $scope.GetBuscador();
    };
    
    $scope.AgregarTemaFiltro = function()
    {
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].Tema.toLowerCase() == $scope.buscarConcepto.toLowerCase())
            {
                if($scope.tema[k].mostrar)
                {
                    $scope.SetFiltroTema($scope.tema[k]);
                }
                else
                {
                    $scope.buscarConcepto = "";
                    
                }
                $scope.$apply();
            }
        }
    };
    
    $scope.AgregarEtiquetaFiltro = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].Nombre.toLowerCase() == etiqueta.toLowerCase())
            {
                if($scope.etiqueta[k].mostrar)
                {
                    $scope.SetFiltroEtiqueta($scope.etiqueta[k]);
                }
                else
                {
                    $scope.buscarConcepto = "";
                }
                $scope.$apply();
            }
        }
    };
    
    $scope.CambiarVerFiltro = function()
    {
        $scope.verFiltro = !$scope.verFiltro;
    };
    
    $scope.LimpiarFiltro = function()
    {
        $scope.filtro = {tema:[], etiqueta: [], fecha:"", fechaFormato:""};
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            $scope.etiqueta[k].mostrar = true;
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            $scope.tema[k].mostrar = true;
        }
        
        $scope.verFiltro = true;
        
        $scope.buscarConcepto = "";
        
        $scope.LimpiarBusqueda();
        
        document.getElementById("fechaFiltro").value = "";
    };
    
    $scope.QuitarTemaFiltro = function(tema)
    {
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].TemaActividadId == tema.TemaActividadId)
            {
                $scope.tema[k].mostrar = true;
                break;
            }
        }
        
        for(var k=0; k<$scope.filtro.tema.length; k++)
        {
            if($scope.filtro.tema[k].TemaActividadId == tema.TemaActividadId)
            {
                $scope.filtro.tema.splice(k,1);
                break;
            }
        }
        
        if($scope.filtro.etiqueta.length > 0 || $scope.filtro.tema.length > 0)
        {
            $scope.GetBuscador();
        }
        else
        {
            $scope.LimpiarBusqueda();
        }
    };
    
    $scope.QuitaretiquetaFiltro = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta[k].mostrar = true;
                break;
            }
        }
        
        for(var k=0; k<$scope.filtro.etiqueta.length; k++)
        {
            if($scope.filtro.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.filtro.etiqueta.splice(k,1);
                break;
            }
        }
        
        if($scope.filtro.etiqueta.length > 0 || $scope.filtro.tema.length > 0)
        {
            $scope.GetBuscador();
        }
        else
        {
            $scope.LimpiarBusqueda();
        }
    };
    
     $scope.LimpiarBusqueda = function()
     {
         $scope.nota = [];
         $scope.diario = [];
         $scope.actividad = [];
         $scope.imagen = [];
     };
    
    $scope.CambiarAppFiltro = function(app)
    {
        if(app != $scope.appFiltro)
        {
            $scope.appFiltro = app;
        }
    };
    
    //-- fecha filtro
    $('#fechaFiltro').bootstrapMaterialDatePicker(
    { 
        weekStart : 0, 
        time: false,
        format: "YYYY-MM-DD"
    });
    
    $scope.AbrirCalendario = function()
    {        
        document.getElementById("fechaFiltro").focus();
    };
    
    
    $scope.LimpiarFiltroFecha = function()
    {
        $scope.filtro.fecha = "";
        $scope.filtro.fechaFormato = "";
        
        document.getElementById("fechaFiltro").value = "";
    };
    
    $scope.CambiarFechaFiltro = function(element) 
    {
        $scope.$apply(function($scope) 
        {   
            $scope.filtro.fecha = element.value;
            $scope.filtro.fechaFormato = TransformarFecha(element.value);
            
            $scope.GetBuscador();
        });
    };
    
    $scope.LimpiarBuscar = function()
    {
        $scope.buscarConcepto = "";
        $scope.LimpiarFiltroFecha();
        
        if($scope.campoBuscar == "Conceptos")
        {
            document.getElementById("buscarConcepto").focus();
        }
    };
    
    //----------------------------------------------------- Busqueda ----------------------------------    
    $scope.CambiarCampoBuscar = function(campo)
    {
        if(campo != $scope.campoBuscar)
        {
            $scope.campoBuscar = campo;
            
            if(campo == "Fecha")
            {
                $scope.AbrirCalendario();
            }
            
            $scope.LimpiarFiltro();
        }
    };
    
    /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
    $scope.InicializarControlador = function()
    {
        if($scope.usuarioLogeado.Aplicacion != "Home")
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            $scope.GetEtiqueta();
            $scope.GetTemaActividad();
        }
    };
    
    $scope.usuarioLogeado =  datosUsuario.getUsuario(); 
    
    //verifica que haya un usuario logeado
    if($scope.usuarioLogeado !== null)
    {
        if(!$scope.usuarioLogeado.SesionIniciada)
        {
             $location.path('/Login');
        }
        else
        {
            $scope.IniciarApp("Home");
            $scope.InicializarControlador();
        }
    }
    
    //destecta cuando los datos del usuario cambian
    $scope.$on('cambioUsuario',function()
    {
        $scope.usuarioLogeado =  datosUsuario.getUsuario();
    
        if(!$scope.usuarioLogeado.SesionIniciada)
        {
            $location.path('/Login');
            return;
        }
        else
        {
            $scope.IniciarApp("Home");
            $scope.InicializarControlador();
        }
    });
        
});

var aplicaciones = [
                        {texto:"Mis Actividades", habilitada:true, paginaPrincipal:"/Actividades",   icono:"fa fa-calendar"},
                        {texto:"Mi Diario", habilitada:true, paginaPrincipal:"/Diario", icono:"fa fa-clock-o"},
                        {texto:"Mis Notas", habilitada:true, paginaPrincipal:"/Notas", icono:"fa fa-sticky-note"},
                    ];

