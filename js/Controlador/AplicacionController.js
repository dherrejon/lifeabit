app.controller("AplicacionController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, LifeService)
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
    $scope.evento = [];
    $scope.conocimiento = [];
    $scope.archivo = [];
    $scope.detalle = [];
    $scope.tipoDetalle = "";
    $scope.verDetalle = false;
    $scope.hoy = GetDate();
    
    $scope.buscado = false;
    
    $scope.verFiltro = true;
    $scope.verAppPanel = true;
    $scope.filtro = {etiqueta:[], tema:[], fecha: "", fechaFormato: ""};
    
    $scope.buscarConcepto = "";
    $scope.campoBuscar = "Conceptos";
    
    $scope.appBuscar = ["Todo", "Actividades", "Archivos", "Conocimiento", "Diario", "Eventos", "Imagenes", "Notas", "Objetivos"];
    $scope.appFiltro = "Todo";
    $scope.verApp = {actividad:true, diario: true, nota:true, imagen:true, evento:true, pendiente:true, archivo:true, conocimiento:true};
    $scope.filtroApp = {todo: true, actividad:false, diario: false, nota:false, imagen:false, evento:false, pendiente:false, archivo:false, conocimiento:false};
    
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
        $scope.buscado = true;
    
        $scope.filtro.Aplicacion = $scope.filtroApp;
        
        GetBuscador($http, $q, CONFIG, $scope.filtro).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                for(var k=0; k<data[2].Diario.length; k++)
                {                    
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
                }
                
                for(var k=0; k<data[5].Evento.length; k++)
                {                    
                    data[5].Evento[k].FechaFormato = TransformarFecha( data[5].Evento[k].Fecha);
                }
                
                $scope.nota = data[1].Notas;
                $scope.diario = data[2].Diario;
                $scope.actividad = data[3].Actividad;
                $scope.imagen = data[4].Imagen;
                $scope.evento = data[5].Evento;
                $scope.pendiente = data[6].Pendiente;
                $scope.archivo = data[7].Archivo;
                $scope.conocimiento = data[8].Conocimiento;
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
        
        var actividad = [];
        
        $scope.filtro.usuarioId = $rootScope.UsuarioId;
        (self.servicioObj = LifeService.Post('GetActividadPorIdDatos', datos )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var data = dataResponse.data;
                
                $scope.detalle = [];
                
                for(var k=0; k<data.length; k++)
                {
                    $scope.detalle[k] = SetActividad(data[k]);
                    $scope.detalle[k].NotasHTML = $sce.trustAsHtml($scope.detalle[k].NotasHTML);
                    
                    $scope.detalle[k].Evento = [];
                    for(var i=0; i<data[k].Evento.length; i++)
                    {
                        $scope.detalle[k].Evento[i] = SetEventoActividad(data[k].Evento[i]);
                        $scope.detalle[k].Evento[i].NotasHTML = $sce.trustAsHtml( $scope.detalle[k].Evento[i].NotasHTML);
                    }

                    $scope.detalle[k].EtiquetaVisible = $scope.GetEtiquetaVisible($scope.detalle[k].Etiqueta);
                }

                $scope.eventoData = $scope.detalle[0].Evento;
            } 
            else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.GetEventoActividadPorId = function(id)
    {
        $scope.tipoDetalle = "Evento";
        
        GetEventoActividadPorId($http, $q, CONFIG, id).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
                
                
                data[k].EtiquetaVisible = $scope.GetEtiquetaVisible(data[k].Etiqueta);
            }
             
            $scope.detalle = data;
            $scope.eventoData = data;
        
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
    
    $scope.GetConocimientoPorId = function(id)
    {
        (self.servicioObj = LifeService.Get('GetConocimientoPorId/' + id)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var conocimiento = SetConocimiento(dataResponse.data);
                conocimiento.InformacionHTML = $sce.trustAsHtml(conocimiento.InformacionHTML);
                conocimiento.ObservacionHTML = $sce.trustAsHtml(conocimiento.ObservacionHTML);
                
                $scope.detalle = [];
                $scope.detalle[0] = conocimiento;
                $scope.tipoDetalle = "Conocimiento";
            } 
            else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.GetAplicacion = function()
    {
        (self.servicioObj = LifeService.Get('GetAplicacion/' + $rootScope.UsuarioId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var data = dataResponse.data;
                
                for(var k=0; k<data.length; k++)
                {
                    $scope.CambiarAppFiltro(data[k].Nombre);
                }
                
            } 
            else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
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
        if(evento.Hecho == "1")
        {
            evento.EstatusTexto = "Hecho";
            evento.Clase = "done";
            return "done";
        }
        else if(evento.Fecha < $scope.hoy)
        {
            evento.EstatusTexto = "Atrasado";
            evento.Clase = "pendiente";
            return "pendiente";
        }
        else if(evento.Fecha > $scope.hoy)
        {
            evento.EstatusTexto = "En espera";
            evento.Clase = "enEspera";
            return "enEspera";
        }
        else if(evento.Fecha == $scope.hoy)
        {
            evento.EstatusTexto = "Pendiente";
            evento.Clase = "hoyPendiente";
            return "hoyPendiente";
        }
    };
    
     $scope.GetEventoActividadPorId2 = function(id, opt)
     {   
        GetEventoActividadPorId($http, $q, CONFIG, id).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
                
                
                data[k].EtiquetaVisible = $scope.GetEtiquetaVisible(data[k].Etiqueta);
            }
             
            $scope.detalleEvento = data[0];
        
        }).catch(function(error)
        {
            alert(error);
        });
    };

    
    $scope.VerDetallesEvento = function(evento)
    {
        if($scope.tipoDetalle == "Evento")
        {
            $scope.detalleEvento = evento;
        }
        else
        {
            $scope.GetEventoActividadPorId2(evento.EventoActividadId);
        }
        
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
    
    $scope.VerImganes = function(imagen, i)
    {
        $scope.img = imagen;
        $scope.iImg = i;
        $('#verImagen').modal('toggle');
    };
    
    $('#verImagen').keydown(function(e)
    {
        switch(e.which) {
            case 37:
              $scope.changeImageViewed(-1);
              $scope.$apply();
              break;
            /*
            case 38: console.log('up');
            break;
            */
            case 39:
              $scope.changeImageViewed(1);
              $scope.$apply();
              break;
            /*
            case 40: console.log('down');
            break;
            */
            default: return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.changeImageViewed = function(val)
    {
        $scope.iImg += val; 
        if($scope.iImg < 0)
        {
            $scope.iImg = $scope.img.length -1;
        }
        else if($scope.iImg >= $scope.img.length)
        {
            $scope.iImg = 0;
        }
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
        $scope.LimpiarBusqueda();
            
        $scope.buscarConcepto = "";
        document.getElementById('buscarConcepto').focus();
        
        //$scope.GetBuscador();
    };
    
    $scope.SetFiltroTema = function(tema)
    {
        tema.mostrar = false;
        $scope.filtro.tema.push(tema);
        $scope.LimpiarBusqueda();
        
        $scope.buscarConcepto = "";
        document.getElementById('buscarConcepto').focus();
        
        //$scope.GetBuscador();
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
        
        $('#fechaFiltro').data("DateTimePicker").clear();
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

        $scope.LimpiarBusqueda();
        
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
        
        $scope.LimpiarBusqueda();
        
    };
    
     $scope.LimpiarBusqueda = function()
     {
         $scope.nota = [];
         $scope.diario = [];
         $scope.actividad = [];
         $scope.imagen = [];
         $scope.evento = [];
         $scope.pendiente = [];
         $scope.archivo = [];
         $scope.conocimiento = [];
         
         $scope.buscado = false;
     };
    
    $scope.CambiarAppFiltro = function(app)
    {
        var buscar = false;
        
        if(app == "Todo")
        {
            if(!$scope.filtroApp.todo)
            {
                $scope.filtroApp = {todo: true, actividad:false, diario: false, nota:false, imagen:false, evento:false, pendiente:false, archivo:false, conocimiento:false};
                buscar = true;
            }
        }
        else
        {
            $scope.filtroApp.todo = false;

            switch(app)
            {
                case "Actividades":
                    $scope.filtroApp.actividad = !$scope.filtroApp.actividad;
                    $scope.filtroApp.actividad ? buscar = true : $scope.actividad = [];
                    break;
                case "Diario":
                    $scope.filtroApp.diario = !$scope.filtroApp.diario;
                    $scope.filtroApp.diario ? buscar = true : $scope.diario = [];
                    break;
                case "Notas":
                    $scope.filtroApp.nota = !$scope.filtroApp.nota;
                    $scope.filtroApp.nota ? buscar = true : $scope.nota = [];
                    break;
                case "Imagenes":
                    $scope.filtroApp.imagen = !$scope.filtroApp.imagen;
                    $scope.filtroApp.imagen ? buscar = true : $scope.imagen = [];
                    break;
                case "Eventos":
                    $scope.filtroApp.evento = !$scope.filtroApp.evento;
                    $scope.filtroApp.evento ? buscar = true : $scope.evento = [];
                    break;
                case "Objetivos":
                    $scope.filtroApp.pendiente = !$scope.filtroApp.pendiente;
                    $scope.filtroApp.pendiente ? buscar = true : $scope.pendiente = [];
                    break;
                case "Archivos":
                    $scope.filtroApp.archivo = !$scope.filtroApp.archivo;
                    $scope.filtroApp.archivo ? buscar = true : $scope.archivo = [];
                    break;
                case "Conocimiento":
                    $scope.filtroApp.conocimiento = !$scope.filtroApp.conocimiento;
                    $scope.filtroApp.conocimiento ? buscar = true : $scope.conocimiento = [];
                    break;

                default:
                    break;
            }
            
            if(!$scope.filtroApp.actividad && !$scope.filtroApp.diario && !$scope.filtroApp.nota && !$scope.filtroApp.imagen  && !$scope.filtroApp.evento && !$scope.filtroApp.pendiente && !$scope.filtroApp.archivo && !$scope.filtroApp.conocimiento )
            {
                $scope.filtroApp.todo = true;
                buscar = true;
            }
        }
        
        if(buscar && ($scope.filtro.etiqueta.length > 0 || $scope.filtro.tema.length > 0 || $scope.filtro.fecha))
        {
            $scope.GetBuscador();
        }
    };
    
    $scope.GetClaseApp = function(app)
    {
        switch(app)
        {
            case "Todo":
                if($scope.filtroApp.todo) return true;
                break;
            case "Actividades":
                if($scope.filtroApp.actividad) return true;
                break;
            case "Diario":
                if($scope.filtroApp.diario) return true;
                break;
            case "Notas":
                if($scope.filtroApp.nota) return true;
                break;
            case "Imagenes":
                if($scope.filtroApp.imagen) return true;
                break;
            case "Eventos":
                if($scope.filtroApp.evento) return true;
                break;
            case "Objetivos":
                if($scope.filtroApp.pendiente) return true;
                break;
            case "Archivos":
                if($scope.filtroApp.archivo) return true;
                break;
            case "Conocimiento":
                if($scope.filtroApp.conocimiento) return true;
                break;

            default:
                return false;
                break;
        }
        
        return false;
    };
    
    //-- fecha filtro
    /*$('#fechaFiltro').bootstrapMaterialDatePicker(
    { 
        weekStart : 0, 
        time: false,
        format: "YYYY-MM-DD"
    });*/
    
    $('#fechaFiltro').datetimepicker(
    {
        locale: 'es',
        format: 'YYYY-MM-DD',
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
            if($scope.filtro.fecha.length > 0)
            {
                $scope.filtro.fechaFormato = TransformarFecha(element.value);
                $scope.GetBuscador();
            }
            else
            {
                $scope.filtro.fechaFormato  = "";
            }
            
            
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
            
            $scope.LimpiarFiltro();
            
            if(campo == "Fecha")
            {
                $scope.AbrirCalendario();
            }
        }
    };
    
    //---Pendiente --
     $scope.GetDatosPendiente = function(pendiente)
    {
          var datos = {Tipo:"Pendiente", Id:pendiente.PendienteId};
            $scope.tipoDetalle = "Pendiente";
         
        (self.servicioObj = LifeService.Get('GetPendiente/Datos/' + pendiente.PendienteId)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.detalle[0] = SetPendiente(dataResponse.data);
                $scope.detalle[0].NotaHTML = $sce.trustAsHtml($scope.detalle[0].NotaHTML);
                $scope.detalle[0].RecordatorioHTML = $sce.trustAsHtml($scope.detalle[0].RecordatorioHTML);
                $scope.GetEtiquetaVisible($scope.detalle[0]);
            } 
            else 
            {
                 $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
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
            $scope.GetAplicacion();
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
                        {texto:"Mis Archivos", habilitada:true, paginaPrincipal:"/Archivo",   icono:"fa fa-file-o"},
                        {texto:"Mi Conocimiento", habilitada:true, paginaPrincipal:"/Conocimiento", icono:"fa fa-book"},
                        {texto:"Mi Diario", habilitada:true, paginaPrincipal:"/Diario", icono:"fa fa-clock-o"},
                        {texto:"Mis Imágenes", habilitada:true, paginaPrincipal:"/Imagen", icono:"fa fa-picture-o"},
                        {texto:"Mis Notas", habilitada:true, paginaPrincipal:"/Notas", icono:"fa fa-sticky-note"},
                        {texto:"Mis Objetivos", habilitada:true, paginaPrincipal:"/Objetivo", icono:"fa fa-calendar-times-o"},
                        
                    ];

