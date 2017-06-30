app.controller("BucadorController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce)
{   
    $scope.permiso = false;
    
    $scope.ValidarPermiso = function()
    {
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "BucadorAcc")
            {
                $scope.permiso = true;
                break;
            }
        }
    };
    
    $scope.etiqueta = [];
    $scope.tema = [];
    
    $scope.nota = [];
    $scope.diario = [];
    $scope.actividad = [];
    $scope.detalle = [];
    $scope.tipoDetalle = "";
    $scope.verDetalle = false;
    $scope.hoy = GetDate();
    
    $scope.verFiltro = true;
    $scope.filtro = {etiqueta:[], tema:[], fecha: "", fechaFormato: ""};
    
    $scope.buscarConcepto = "";
    $scope.campoBuscar = "Conceptos";
    
    $scope.appBuscar = ["Todo", "Actividades", "Diario", "Notas"];
    $scope.appFiltro = "Todo";
    $scope.verApp = {actividad:true, diario: true, nota:true};
    
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
            }
             
            $scope.detalle = data;
        
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
                    $scope.AgregarEtiquetaFiltro();
                }
                else
                {
                    $scope.AgregarTemaFiltro();
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
    
    $scope.AgregarEtiquetaFiltro = function()
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].Nombre.toLowerCase() == $scope.buscarConcepto.toLowerCase())
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
    
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        $scope.ValidarPermiso();
        if($scope.permiso)
        {
            if($scope.usuarioLogeado.Aplicacion != "Mi Buscador")
            {
                $rootScope.IrPaginaPrincipal();
            }
            else
            {
                $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
                $scope.GetEtiqueta();
                $scope.GetTemaActividad();
            }
        }
        else
        {
            $rootScope.IrPaginaPrincipal();
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
            $scope.InicializarControlador();
        }
    });
    
    //------------------- Alertas ---------------------------
    /*$scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoNota").alert();

            $("#alertaExitosoNota").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoNota").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoNota").alert();

            $("#alertaEditarExitosoNota").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoNota").fadeOut();
            }, 2000);
        }
    };*/
    
});
