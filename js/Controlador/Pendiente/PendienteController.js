app.controller("PendienteController", function($scope, $window, $http, $rootScope, $q, CONFIG, LifeService, $location, $sce, LUGAR, UNIDAD, DIVISA, ETIQUETA, IMAGEN, datosUsuario)
{   
    $scope.buscarConceptoBarra = "";
    $scope.filtro = {etiqueta: [], tema: [], fecha:"", pendiente:false, fechaFormato:"", futuro:false};
    $scope.verFiltro = true;
    $scope.pendiente = [];
    $scope.fototeca = [];
    $scope.verpen = "";
    $scope.verpen2 = "";
    $scope.cargoCatalogos = false;
    $rootScope.CargarExterior = false;
    
    // fecha
    $scope.hoy = GetDate();
    $scope.filtro.fecha = $scope.hoy;
    $scope.filtro.fechaFormato = TransformarFecha($scope.hoy);
    document.getElementById('fechaFiltro').value = $scope.hoy;
    
    /*------- Catálogos Base ---------------*/
    $scope.GetPendiente = function()
    {
         $scope.filtro.usuarioId = $rootScope.UsuarioId;
        (self.servicioObj = LifeService.Post('GetPendiente', $scope.filtro )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.pendiente = dataResponse.data;
                
                for(var k=0; k<$scope.pendiente.length; k++)
                {
                    $scope.pendiente[k].FechaIntencionFormato = TransformarFecha($scope.pendiente[k].FechaIntencion);
                    $scope.pendiente[k].FechaRealizacionFormato = TransformarFecha($scope.pendiente[k].FechaRealizacion);
                    $scope.GetClasePendiente($scope.pendiente[k]);
                }
            
                
            } else 
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
    
    $scope.GetDatosPendiente = function(pendiente, opt)
    {
         
        /*GetDatosPendiente($http, $q, CONFIG, pendiente.PendienteId).then(function(data)
        {
            $scope.OperacionPendiente(data, opt);
        }).catch(function(error)
        {
            alert(error);
        });*/
         
        (self.servicioObj = LifeService.Get('GetPendiente/Datos/' + pendiente.PendienteId)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.OperacionPendiente(dataResponse.data, opt);
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
    
    $scope.OperacionPendiente = function(pendiente, opt)
    {
        if(opt == "Editar" || opt == "Copiar")
        {
            if($scope.operacion == "Copiar")
            {
                pendiente.Hecho = "0";
                pendiente.FechaIntencion = $scope.hoy;
                pendiente.FechaRealizacion = $scope.hoy;
                pendiente.Nota = "";
            }
            
            $scope.nuevoPendiente = SetPendiente(pendiente);
            
            $scope.ActivarDesactivarTema(pendiente.Tema);
            $scope.ActivarDesactivarEtiqueta(pendiente.Etiqueta);
            
            $scope.buscarDivisa = jQuery.extend({}, $scope.nuevoPendiente.Divisa);
            $scope.buscarUnidad = jQuery.extend({}, $scope.nuevoPendiente.Unidad);
            $scope.buscarprioridad =jQuery.extend({}, $scope.nuevoPendiente.Prioridad);
            $scope.busacarLugar =jQuery.extend({}, $scope.nuevoPendiente.Lugar);
            
            document.getElementById('fechaIntencion').value = $scope.nuevoPendiente.FechaIntencion;
            document.getElementById('fechaRealizacion').value = $scope.nuevoPendiente.FechaRealizacion;
            document.getElementById('horaIntencion').value = $scope.nuevoPendiente.HoraIntencion;
            document.getElementById('horaRealizacion').value = $scope.nuevoPendiente.HoraRealizacion;
            
            $scope.nuevoPendiente.FechaMod = opt == "Copiar" ? "FechaIntencion" : $scope.nuevoPendiente.FechaIntencion > $scope.hoy ? "FechaIntencion" : "FechaRealizacion";
           
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevoPendiente, 'Pendiente');
            $scope.pendienteInicio = jQuery.extend({}, $scope.nuevoPendiente);
            
            for(var k=0; k<$scope.nuevoPendiente.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta($scope.nuevoPendiente.Imagen[k], false);
            }
            
            $scope.$broadcast('IniciarArchivo', $scope.nuevoPendiente);
        }
        else if(opt == "Detalle")
        {
            $scope.detalle = SetPendiente(pendiente);
            $scope.detalle.NotaHTML = $sce.trustAsHtml($scope.detalle.NotaHTML);
            $scope.detalle.RecordatorioHTML = $sce.trustAsHtml($scope.detalle.RecordatorioHTML);
            $scope.detalle.iActive = 0;
            
            $scope.GetCarroselIntervalo();
            $scope.CambiarIndiceDetalle(0, $scope.detalle);
            
            $scope.GetEtiquetaVisible($scope.detalle);
            
            $('#detallePendiente').modal('toggle');
        }
    };
    
    $scope.GetEtiquetaVisible = function(data)
    {
        data.EtiquetaVisible = [];
        
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            if(data.Etiqueta[k].Visible)
            {
                data.EtiquetaVisible.push(data.Etiqueta[k]);
            }
        }
             
    };

    $scope.GetTemaActividad = function()              
    {
        GetTemaActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].filtro = true;
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
                data[k].filtro = true;
            }
                
            $scope.etiqueta = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    
    /*------ Otros Catálogos -------------*/
    $scope.GetUnidad = function()              
    {
        GetUnidad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.unidad = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetDivisa = function()              
    {
        GetDivisa($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.divisa = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetLugar = function()              
    {
        GetLugar($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.lugar = data;
            
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*$scope.GetPrioridad = function()
    {
        (self.servicioObj = LifeService.Get('GetPrioridad/' + $rootScope.UsuarioId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.prioridad = dataResponse.data;
                            
            } else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };*/
    
    $scope.GetPrioridad = function()
    {
        $scope.prioridad = GetPrioridad();
    };
    
    $scope.GetGaleriaFotos = function()
    {
 
        var datos = [];
        datos[0] = $rootScope.UsuarioId;


        GetFototeca($http, $q, CONFIG, datos).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].Seleccionada = false;
            }

            $scope.fototeca = data;


        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetImagenEtiqueta = function(imagen, val)
    {
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
            
            if(val !== false)
            {
                $scope.SetTemaImagenPendiente(imagen, $scope.nuevoPendiente.Tema);
                $scope.SetEtiquetaImagenPendiente(imagen, $scope.nuevoPendiente.Etiqueta);
            }


        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    
    //--------------------- Filtro ----------------
    $scope.SetFiltroEtiqueta = function()
    {
        if($scope.buscarConceptoBarra.Nombre)
        {
            $scope.AgregarEtiquetaFiltro($scope.buscarConceptoBarra.Nombre);
        }
        else if($scope.buscarConceptoBarra.Tema)
        {
            $scope.AgregarTemaFiltro($scope.buscarConceptoBarra.Tema);
        }
        
        $scope.buscarConceptoBarra = "";
    };
    
    $scope.AgregarEtiquetaFiltro = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].Nombre == etiqueta)
            {
                $scope.etiqueta[k].filtro = false;
                $scope.filtro.etiqueta.push($scope.etiqueta[k]);
                //$scope.GetPendiente();
                break;
            }
        }
    };
    
    $scope.AgregarTemaFiltro = function(tema)
    {
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].Tema == tema)
            {
                $scope.tema[k].filtro = false;
                $scope.filtro.tema.push($scope.tema[k]);
                //$scope.GetPendiente();
                break;
            }
        }
    };
    
    $scope.SetFiltroEtiquetaBlur = function(seleccionado)
    {
        if($scope.buscarConceptoBarra)
        {
           
            var concepto = $scope.buscarConceptoBarra.toLocaleLowerCase();

            if($rootScope.erEtiqueta.test($scope.buscarConceptoBarra))
            {
                for(var k=0; k<$scope.etiqueta.length; k++)
                {
                    if($scope.etiqueta[k].Nombre.toLowerCase() == concepto && $scope.etiqueta[k].filtro )
                    {
                        $scope.etiqueta[k].filtro = false;
                        $scope.filtro.etiqueta.push($scope.etiqueta[k]);
                        $scope.GetPendiente();
                        break;
                    }
                }
            }
            else if($rootScope.erTema.test($scope.buscarConceptoBarra))
            {
                for(var k=0; k<$scope.tema.length; k++)
                {
                    if($scope.tema[k].Tema == concepto && $scope.tema[k].filtro)
                    {
                        $scope.tema[k].filtro = false;
                        $scope.filtro.tema.push($scope.tema[k]);
                        $scope.GetPendiente();
                        break;
                    }
                }
            }
            
            $scope.buscarConceptoBarra = "";
        }
    };
    
    $scope.CambiarVerFiltro = function()
    {
        $scope.verFiltro = !$scope.verFiltro;
    };
    
    
    $scope.FiltroPendiente = function(pendiente)
    {
        if($scope.filtro.pendiente)
        {
            if(pendiente.Hecho == "0" && pendiente.FechaRealizacion <= $scope.hoy)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        if($scope.filtro.futuro)
        {
            if(pendiente.FechaRealizacion > $scope.hoy)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return true;
        }
    };
    
    
    $scope.CambiarFiltroFuturo = function()
    {
        $scope.filtro.futuro = !$scope.filtro.futuro;
      
        if($scope.filtro.futuro)
        {
            if($scope.filtro.fecha)
            {
                $scope.GetPendiente();
            }
            
            $scope.filtro.pendiente = false;
            $scope.filtro.fecha = "";
            $scope.filtro.fechaFormato = "";
            
            
        }
    };
    
    //--funciones para manejo de filtro por fecha
    
    $('#fechaFiltro').datetimepicker(
    { 
        locale: 'es',
        format: 'YYYY-MM-DD',
    });
    
    $scope.FiltroFechaHoy = function()
    {
        if($scope.filtro.fecha != $scope.hoy)
        {
            document.getElementById("fechaFiltro").value = $scope.hoy;
            $scope.filtro.fecha = $scope.hoy;
            $scope.filtro.fechaFormato = TransformarFecha($scope.hoy);
            
            $scope.GetPendiente();
        }
    };
    
    $scope.LimpiarFiltroFecha = function()
    {
        if($scope.filtro.fecha !== "")
        {
            $scope.filtro.fecha = "";
            $scope.filtro.fechaFormato = "";
            $scope.GetPendiente();
        }
        
    };
    
    $scope.CambiarFechaFiltro = function(element) 
    {
        if(element.value != $scope.filtro.fecha.Fecha)
        {
            $scope.filtro.fecha = element.value;
            $scope.filtro.fechaFormato = TransformarFecha($scope.filtro.fecha);
            $scope.GetPendiente();
        }
        
        $scope.$apply();

    };
    
    $scope.CambiarFechaBtn = function(val, fecha)
    {
        var year = fecha.slice(0,4);
        var mes = parseInt(fecha.slice(5,7)-1);
        var dia = fecha.slice(8,10);
        
        var nd = new Date(year, mes, dia);
        nd.setDate(nd.getDate()+val);
        
        year = nd.getFullYear();
        mes = parseInt(nd.getMonth())+1;
        dia = parseInt(nd.getDate());
        
        if(mes < 10)
        {
            mes = "0" + mes;
        }
        if(dia < 10)
        {
            dia = "0" + dia;
        }
        
        $scope.filtro.fecha = year + "-" + mes + "-" + dia;
        $scope.filtro.fechaFormato = TransformarFecha($scope.filtro.fecha);
        document.getElementById('fechaFiltro').value = $scope.filtro.fecha;
        
        $scope.GetPendiente();
    };
    
    //-------- Typeahead ------------------
    $scope.FiltroConcepto = function(concepto)
    {
        var conceptos = [];
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].filtro)
            {
                if(BuscarEtiqueta($scope.etiqueta[k], concepto))
                {
                    conceptos.push($scope.etiqueta[k]);
                }
            }
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].filtro)
            {
                if(BuscarTema($scope.tema[k], concepto))
                {
                    conceptos.push($scope.tema[k]);
                }
            }
        }
        
        return conceptos;
    };
    
    function BuscarEtiqueta(etiqueta, buscar)
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
    }
    
    function BuscarTema(tema, buscar)
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
    }
    
    
    $scope.QuitarTemaFiltro = function(tema)
    {
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].TemaActividadId == tema.TemaActividadId)
            {
                $scope.tema[k].filtro = true;
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
        
        if(($scope.filtro.tema.length + $scope.filtro.etiqueta.length) == 0)
        {
            $scope.GetPendiente();
        }
    };
    
    $scope.QuitaretiquetaFiltro = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta[k].filtro = true;
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
        
        if(($scope.filtro.tema.length + $scope.filtro.etiqueta.length) == 0)
        {
            $scope.GetPendiente();
        }
    };
    
     $scope.LimpiarFiltro = function()
    {
        $scope.filtro.tema = [];
        $scope.filtro.etiqueta = [];
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            $scope.etiqueta[k].filtro = true;
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            $scope.tema[k].filtro = true;
        }
        
        $scope.GetPendiente();
    };
    
    //------------ Vista ----------
    $scope.GetClasePendiente = function(pendiente)
    {
        if(pendiente.Hecho == "1")
        {
            /*if(pendiente.FechaRealizacion == $scope.hoy)
            {
                pendiente.EstatusTexto = "Hoy";
            }
            else
            {
                
            }*/
            pendiente.EstatusTexto = "Hecho";
            pendiente.Clase = "done";
            return;
        }
        else if(pendiente.FechaRealizacion < $scope.hoy)
        {
            pendiente.EstatusTexto = "Atrasado";
            pendiente.Clase = "pendiente";
            return;
        }
        else if(pendiente.FechaRealizacion > $scope.hoy)
        {
            pendiente.EstatusTexto = "En espera";
            pendiente.Clase  = "enEspera";
            return;
        }
        else if(pendiente.FechaRealizacion == $scope.hoy)
        {
            pendiente.EstatusTexto = "Pendiente";
            pendiente.Clase = "hoyPendiente";
            return;
        }
    };
    
     $scope.AbrirCalendario = function(id)
    {        
        document.getElementById(id).focus();
    };
    
    
    $scope.VerOptPendiente = function(id)
    {
        if($scope.verpen != id)
        {
            $scope.verpen2 = $scope.verpen;
            $scope.verpen = id;
            
            setTimeout(function()
            {
                 $scope.verpen2 = "";
                $scope.$apply();
            }, 700);
        }
    };
    
    document.getElementById('pendienteform').onclick = function(e) 
    {   
        if($scope.verpen)
        {
            if(e.target.id != "optPen" && $(e.target).parents("#optPen").size() == 0)
            { 
                $scope.verpen2 = $scope.verpen;
                $scope.verpen = "";
                $scope.$apply();
                
                setTimeout(function()
                {
                     $scope.verpen2 = "";
                    $scope.$apply();
                }, 700);
            }
        }        
    };
    
    //----------------------- Abrir --------------------
    $scope.AbrirPendiente = function(operacion, data)
    {
        $scope.operacion = operacion;
        $scope.tabModal = "Datos";
        $scope.verRecordatorio = true;
        $scope.etiquetaSugerida = [];
        
        $('#fechaIntencion').data("DateTimePicker").clear();
        $('#fechaRealizacion').data("DateTimePicker").clear();
        $('#horaRealizacion').data("DateTimePicker").clear();
        $('#horaIntencion').data("DateTimePicker").clear();
        
        $scope.nuevoPendiente = new Pendiente();
        
        if(operacion == "Agregar")
        {
            $scope.ActivarDesactivarTema([]);
            $scope.ActivarDesactivarEtiqueta([]);
            $scope.SetValoresDefecto();
            
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevoPendiente, 'Pendiente');
        }
        else if(operacion == "Editar" || operacion == "Copiar")
        {
            $scope.GetDatosPendiente(data, operacion);
        }
        
        $("#modalApp").modal('toggle');
        
        
        if(!$scope.cargoCatalogos)
        {
            $scope.cargoCatalogos = true;
            $scope.CargarCatalogosAuxiliares();
        }
        
        $scope.IniciarPendiente();
        $scope.pendienteInicio = jQuery.extend({}, $scope.nuevoPendiente);
    };
    
    $scope.SetValoresDefecto = function(actividad)
    {
        for(var k=0; k<$scope.divisa.length; k++)
        {
            if($scope.divisa[k].DivisaObjetivo == "1")
            {
                $scope.CambiarDivisa($scope.divisa[k]);
                break;
            }
        }
    };
    
    $scope.IniciarPendiente = function()
    {
        $scope.cargarFechaRealizacion = false;
        $scope.buscarprioridad = "";
        $scope.busacarLugar = "";
        $scope.buscarUnidad = "";
        $scope.buscarDivisa = "";
        
        if($scope.operacion == "Agregar")
        {   
            var fecha = new Date();
            //fecha.setDate(fecha.getDate() +1);
            fecha = TransformarDateToFecha(fecha);
            document.getElementById('fechaIntencion').value = fecha;
            $scope.nuevoPendiente.FechaIntencion = fecha;
            $scope.nuevoPendiente.FechaIntencionFormato = TransformarFecha(fecha);
            
            $scope.nuevoPendiente.FechaRealizacion = fecha;
            $scope.nuevoPendiente.FechaRealizacionFormato = TransformarFecha(fecha);
            
            $scope.nuevoPendiente.FechaMod = "FechaIntencion";
            
            $scope.nuevoPendiente.Prioridad = $scope.prioridad[0];
            
            $scope.$broadcast('IniciarArchivo', $scope.nuevoPendiente);
        }
        
    };
    
    $scope.CargarCatalogosAuxiliares = function()
    {
        $scope.GetPrioridad();
        $scope.GetLugar();
        $scope.GetUnidad();
    };
    
     $scope.ActivarDesactivarEtiqueta = function(etiqueta)
    {
        for(var i=0; i<$scope.etiqueta.length; i++)
        {
            $scope.etiqueta[i].show = true;
            for(var j=0; j<etiqueta.length; j++)
            {
                if($scope.etiqueta[i].EtiquetaId == etiqueta[j].EtiquetaId)
                {
                    if(etiqueta[j].Visible)
                    {
                        $scope.etiqueta[i].show = false;
                    }
                    
                    break;
                }
            }
        }
    };
    
    $scope.ActivarDesactivarTema = function(tema)
    {
        for(var i=0; i<$scope.tema.length; i++)
        {
            $scope.tema[i].show = true;
            for(var j=0; j<tema.length; j++)
            {
                if($scope.tema[i].TemaActividadId == tema[j].TemaActividadId)
                {
                    $scope.tema[i].show = false;
                    break;
                }
            }
        }
    };
    
    $('#fechaIntencion').datetimepicker(
    {
        locale: 'es',
        format: 'YYYY-MM-DD',
    });

    $scope.CambiarFechaIntencion = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevoPendiente.FechaIntencion = element.value;
            $scope.nuevoPendiente.FechaIntencionFormato = TransformarFecha(element.value);
            
            if($scope.nuevoPendiente.FechaIntencion > $scope.hoy)
            {
                $scope.nuevoPendiente.Hecho = "0";
            }
            
            if(!$scope.cargarFechaRealizacion)
            {
                document.getElementById('fechaRealizacion').value = element.value;
                $scope.nuevoPendiente.FechaRealizacion = element.value;
                $scope.nuevoPendiente.FechaRealizacionFormato = TransformarFecha(element.value);
            }
        });
    };
    
    
    $('#fechaRealizacion').datetimepicker(
    {
        locale: 'es',
        format: 'YYYY-MM-DD',
    });

    $scope.CambiarFechaRealizacion = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.cargarFechaRealizacion = true;
            $scope.nuevoPendiente.FechaRealizacion = element.value;
            $scope.nuevoPendiente.FechaRealizacionFormato = TransformarFecha(element.value);
        });
    };
    
    //--prioridad
    
    $scope.CambiarPrioridad = function()
    {
        $scope.nuevoPendiente.Prioridad.PrioridadId = $scope.buscarprioridad.PrioridadId;
        $scope.nuevoPendiente.Prioridad.Nombre = $scope.buscarprioridad.Nombre;
    };
    
    $scope.QuitarPrioridad = function()
    {
        $scope.buscarprioridad = "";
        $scope.nuevoPendiente.Prioridad = new Prioridad();
    };
    
    //--Etiquetas Sugeridas
    $scope.CrearEtiquetaSugerida = function()
    {
        if($scope.nuevoPendiente.Nombre)
        {
            $scope.etiquetaSugerida = LimiparCaracteresLabel($scope.nuevoPendiente.Nombre);
            $scope.temaSugerido = [];

            for(var k=0; k<$scope.etiquetaSugerida.length; k++)
            {
                if($scope.etiquetaSugerida[k] === "")
                {
                    $scope.etiquetaSugerida.splice(k,1);
                    k--;
                    continue;
                }

                for(var i=0; i<$scope.nuevoPendiente.Etiqueta.length; i++)
                {
                    if($scope.nuevoPendiente.Etiqueta[i].Nombre.toLowerCase() == $scope.etiquetaSugerida[k].toLowerCase())
                    {
                        if($scope.nuevoPendiente.Etiqueta[i].Visible)
                        {
                            $scope.etiquetaSugerida.splice(k,1);
                            k--;
                        }

                        break;
                    }
                }
            }
        }
    };
    
    $scope.AgregarEtiquetaSugerida = function(etiqueta, k)
    {
        if($rootScope.erEtiqueta.test(etiqueta))
        {
            $scope.$broadcast('AgregarEtiquetaSugerida', $scope.etiqueta, $scope.tema, $scope.nuevoPendiente, 'Pendiente', etiqueta);
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[0] = "*Etiqueta no válida. " + etiqueta;
        }
        
        if( k != -1)
        {
            $scope.etiquetaSugerida.splice(k,1);
        }
    };
    
    $scope.AgregarTodaEtiquetaSugerida = function()
    {
        $scope.verEtiqueta = true;
        
        for(var k=0; k<$scope.etiquetaSugerida.length; k++)
        {
            $scope.AgregarEtiquetaSugerida($scope.etiquetaSugerida[k], -1);
        }
        
        $scope.etiquetaSugerida = [];
    };
    
    //--Lugar
    $scope.CambiarLugar = function()
    {
        $scope.nuevoPendiente.Lugar.LugarId = $scope.busacarLugar.LugarId;
        $scope.nuevoPendiente.Lugar.Nombre = $scope.busacarLugar.Nombre;
    };
    
    $scope.QuitarLugar = function()
    {
        $scope.busacarLugar = "";
        $scope.nuevoPendiente.Lugar = new Lugar();
    };
    
    //-------- Agregar Nueva Lugar----------
    $scope.AbrirAgregarLugar = function()
    {
        LUGAR.AgregarLugar();
    };
    
    $scope.$on('TerminarLugar',function()
    {   
        $rootScope.$broadcast('Alerta', 'Lugar Agregado', 'exito');
        $scope.lugar.push(LUGAR.GetLugar());
        
        $scope.busacarLugar = LUGAR.GetLugar();
        $scope.CambiarLugar();   
    });
    
    //--Unidad
    $scope.CambiarUnidad = function(unidad)
    {
        $scope.nuevoPendiente.Unidad.UnidadId = unidad.UnidadId;
        $scope.nuevoPendiente.Unidad.Unidad = unidad.Unidad;
    };
    
    $scope.QuitarUnidad = function()
    {
        $scope.buscarUnidad = "";
        
        $scope.nuevoPendiente.Unidad.UnidadId = "";
        $scope.nuevoPendiente.Unidad.Unidad = "";
    };
    
    //-------- Agregar Unidad ----------
    $scope.AbrirAgregarUnidad = function()
    {
        UNIDAD.AgregarUnidad();
    };
    
    $scope.$on('TerminarUnidad',function()
    {   
        $rootScope.$broadcast('Alerta', 'Unidad Agregada', 'exito');
        
        var unidad = SetUnidad(UNIDAD.GetUnidad());
        $scope.buscarUnidad = unidad;
        
        $scope.unidad.push(unidad);
        $scope.CambiarUnidad(unidad);           
    });
    
    //--Divisa
    $scope.CambiarDivisa = function(divisa)
    {
        $scope.nuevoPendiente.Divisa.DivisaId = divisa.DivisaId;
        $scope.nuevoPendiente.Divisa.Divisa = divisa.Divisa;
    };
    
    $scope.QuitarDivisa = function()
    {
        $scope.buscarDivisa = "";
        
        $scope.nuevoPendiente.Divisa.DivisaId = "";
        $scope.nuevoPendiente.Divisa.Divisa = "";
    };
    
    //-------- Agregar Divisa ----------
    $scope.AbrirAgregarDivisa = function()
    {
        DIVISA.AgregarDivisa();
    };
    
    $scope.$on('TerminarDivisa',function()
    {   
        $scope.mensaje = "Divisa Agregada";
        
        var divisa = SetDivisa(DIVISA.GetDivisa());
            
        $scope.divisa.push(divisa);
        $scope.buscarDivisa = divisa;
        $scope.CambiarDivisa(divisa);

        $rootScope.$broadcast('Alerta', 'Divisa Agregada', 'exito');
    });
    
    //--------------------- Cerrar ----------------
    $scope.CerrarPendiente = function()
    {
        if(JSON.stringify($scope.nuevoPendiente) === JSON.stringify($scope.pendienteInicio))
        {
            $('#modalApp').modal('toggle');
        }
        else
        {
            $('#cerraPendiente').modal('toggle');
        }
       
    };
    
    $scope.ConfirmarCerrarPendiente = function()
    {
        $('#modalApp').modal('toggle');
        $scope.mensajeError = [];
    };

    $scope.TerminarPendiente = function()
    {
        if(!$scope.ValidarPendiente())
        {
            $('#mensajeError').modal('toggle');
            return;
        }
        else
        {
            $scope.QuitarEtiquetaNoVisible();
            $scope.AgregarEtiquetaOcultar();
        }
    };
    
    $scope.QuitarEtiquetaNoVisible = function()
    {
        for(var k=0; k<$scope.nuevoPendiente.Etiqueta.length; k++)
        {
            if(!$scope.nuevoPendiente.Etiqueta[k].Visible)
            {
                $scope.nuevoPendiente.Etiqueta.splice(k,1);
                k--;
            }
        }
    };
    
    $scope.AgregarEtiquetaOcultar = function()
    {
        $scope.$broadcast('SepararEtiqueta', $scope.nuevoPendiente.Tema, 'Pendiente');
    };
    
    
    $scope.$on('TerminarEtiquetaOculta',function(evento, modal)
    {    
        if(modal == "Pendiente")
        {
            $rootScope.$broadcast('EtiquetaOcultaArchivoIniciar', $scope.nuevoPendiente);
        }
        
    });
    
    $scope.$on('TerminarEtiquetaOcultaArchivo',function()
    {   
        $scope.nuevoPendiente.UsuarioId = $rootScope.UsuarioId;

        if(!$scope.nuevoPendiente.HoraIntencion)
        {
            $scope.nuevoPendiente.HoraIntencion = null;
        }
        if(!$scope.nuevoPendiente.HoraRealizacion)
        {
            $scope.nuevoPendiente.HoraRealizacion = null;
        }
        
        if($scope.operacion == "Agregar" || $scope.operacion == "Copiar")
        {
            $scope.nuevoPendiente.FechaCreacion = GetDate();
            $scope.AgregarPendiente();
        }
        else if($scope.operacion == "Editar")
        {   
            $scope.EditarPendiente();
        }
    });
    
    $scope.AgregarPendiente = function()
    {
        (self.servicioObj = LifeService.File('AgregarPendiente', $scope.nuevoPendiente)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.GetPendiente();
                $scope.GetDivisa();
                $('#modalApp').modal('toggle');
                $rootScope.$broadcast('Alerta', 'El pendiente se agrego.','exito');
                                
            } else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede realizar la operación, intentelo más tarde", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.EditarPendiente = function()
    {
        (self.servicioObj = LifeService.File('EditarPendiente', $scope.nuevoPendiente)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.GetPendiente();
                $scope.GetDivisa();
                $('#modalApp').modal('toggle');
                $rootScope.$broadcast('Alerta', 'El pendiente se edito.','exito');
                                
            } else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede realizar la operación, intentelo más tarde", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.ValidarPendiente = function()
    {
        $scope.mensajeError = [];
        
        if(!$scope.nuevoPendiente.Nombre)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Indica el nombre del pendiente.";
        }
        
        if(!$scope.nuevoPendiente.FechaIntencion)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Indica la fecha de intención.";
        }
        
        if($scope.nuevoPendiente.Hecho == "1" && !$scope.nuevoPendiente.FechaRealizacion)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Indica la fecha de realización.";
        }
        
        if($scope.nuevoPendiente.Unidad.Cantidad && !$scope.nuevoPendiente.Unidad.UnidadId)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Indica la unidad de la cantidad.";
        }
        
        if($scope.nuevoPendiente.Divisa.Costo && !$scope.nuevoPendiente.Divisa.DivisaId)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Indica la divisa del costo.";
        }
        
        if(($scope.nuevoPendiente.Etiqueta.length + $scope.nuevoPendiente.Tema.length) < 1)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Debes de seleccionar al menos una etiqueta o un tema.";
        }
        
        if($scope.mensajeError.length)
        {
            return false;
        }
        else
        {
            return true;
        }
    };
    
    //---------------------- Fototeca ----------------------------
    $scope.AbrirFototeca = function()
    {
        $scope.imgFototeca = [];
        
        for(var k=0; k<$scope.fototeca.length; k++)
        {
            $scope.fototeca[k].Seleccionada = false;
        }
        
        if($scope.fototeca.length === 0)
        {
            $scope.GetGaleriaFotos();
        }
        
        $('#fototeca').modal('toggle');
    };
    
    $scope.AgregarQuitarImagenFototeca = function(imagen)
    {
        imagen.Seleccionada = !imagen.Seleccionada;
    };
    
    $scope.AgregarImagenes = function()
    {
        var agregada = false;
        var count = 0;
        for(var k=0; k< $scope.fototeca.length; k++)
        {
            if($scope.fototeca[k].Seleccionada)
            {
                agregada = false;
                for(var i=0; i<$scope.nuevoPendiente.Imagen.length; i++)
                {
                    if($scope.nuevoPendiente.Imagen[i].ImagenId == $scope.fototeca[k].ImagenId)
                    {
                        agregada = true;
                        break;
                    }
                }
                if(!agregada)
                {
                    if(count === 0)
                    {
                        count ++;
                        $scope.todasImg = "opt";
                        $scope.GetImagenEtiqueta($scope.fototeca[k]);
                        $scope.lastIndex = $scope.nuevoPendiente.Imagen.length + 1;
                    }
                    
                    $scope.nuevoPendiente.Imagen.push($scope.fototeca[k]);
                }
            }
        }
        
        $('#fototeca').modal('toggle');
    };
    
    $scope.SetEtiquetaImagenPendiente = function(imagen, etiqueta)
    {
        for(var j=0; j<etiqueta.length; j++)
        {
            if(etiqueta[j].Visible)
            {
                var label = false;
                for(var i=0; i<imagen.Etiqueta.length; i++)
                {
                    if(etiqueta[j].EtiquetaId == imagen.Etiqueta[i].EtiquetaId)
                    {
                        label = true;
                        imagen.Etiqueta[i].Visible = "1"; 
                        break;
                    }
                }

                if(!label)
                {
                    var e = new Object();

                    e.EtiquetaId = etiqueta[j].EtiquetaId;
                    e.Nombre = etiqueta[j].Nombre;
                    e.Visible = "1";

                    imagen.Etiqueta.push(e);
                }
            }
        }
    };
    
    $scope.SetTemaImagenPendiente = function(imagen, tema)
    {
        var agregado = false;
        for(var j=0; j<tema.length; j++)
        {
            var label = false;
            for(var i=0; i<imagen.Tema.length; i++)
            {
                if(tema[j].TemaActividadId == imagen.Tema[i].TemaActividadId)
                {
                    label = true;
                    break;
                }
            }
            
            if(!label)
            {
                var t = new Object();
                
                t.TemaActividadId = tema[j].TemaActividadId;
                t.Tema = tema[j].Tema;
                
                imagen.Tema.push(t);
                
                agregado = true;
            }
        }
        
        if(agregado)
        {
            IMAGEN.CambiarEtiquetasOcultas(imagen, $scope.etiqueta, $scope.tema);
        }
        else if($scope.todasImg == "opt" || $scope.todasImg == "tema" || $scope.todasImg == "src")
        {
            $scope.TerminarAgregarTemaImagen();
        }
    };
    
    //Imagenes de archivo
    function ImagenSeleccionada(evt) 
    {
        var files = evt.target.files;
        
        $scope.index = $scope.nuevoPendiente.ImagenSrc.length;
        $scope.lastIndex = $scope.nuevoPendiente.ImagenSrc.length + 1;
        $scope.srcSize = $scope.nuevoPendiente.ImagenSrc.length + files.length;
        
        
        for (var i = 0, f; f = files[i]; i++) 
        {
            if (!f.type.match('image.*')) 
            {
                continue;
            }

            var reader = new FileReader();

            reader.onload = (function(theFile) 
            {
                return function(e) 
                {
                    $scope.nuevoPendiente.ImagenSrc.push(theFile);
                    $scope.nuevoPendiente.ImagenSrc[$scope.nuevoPendiente.ImagenSrc.length-1].Src= (e.target.result);
                    $scope.nuevoPendiente.ImagenSrc[$scope.nuevoPendiente.ImagenSrc.length-1].Etiqueta = [];
                    $scope.nuevoPendiente.ImagenSrc[$scope.nuevoPendiente.ImagenSrc.length-1].Tema = [];

                    if( $scope.srcSize === $scope.nuevoPendiente.ImagenSrc.length)
                    {
                        $scope.todasImg = "src";
                        $scope.SetTemaImagenPendiente($scope.nuevoPendiente.ImagenSrc[$scope.index], $scope.nuevoPendiente.Tema);
                    }
                    
                    $scope.SetEtiquetaImagenPendiente($scope.nuevoPendiente.ImagenSrc[$scope.nuevoPendiente.ImagenSrc.length-1], $scope.nuevoPendiente.Etiqueta);
                    
                    $scope.$apply();
                };
                
            })(f);
            
            
            reader.readAsDataURL(f);
        }
         document.getElementById('cargarImagen').value = "";
    }
 
    document.getElementById('cargarImagen').addEventListener('change', ImagenSeleccionada, false);
    
    //-------- ver Imagenes ----------
    $scope.VerImganes = function(Agregadas, Seleccionadas, Eliminadas, ImagenA, ImagenS, index, indexOrigen)
    {
        $scope.detalleImagenEliminadas = false;
        $scope.iLmt = 0;
        $scope.detalleImagen = [];
        
        if(Agregadas)
        {
            for(var k=0; k<ImagenA.length; k++)
            {
                if(ImagenA[k].Eliminada !== true)
                {
                    $scope.detalleImagen.push(ImagenA[k]);
                    
                    if(k==index)
                    {
                       $scope.iImg = $scope.detalleImagen.length-1;
                    }
                }
                
            }
            
            $scope.iLmt = $scope.detalleImagen.length-1;
        }
        
        if(Seleccionadas)
        {
            if(indexOrigen === 0)
            {
                  $scope.iImg = index + $scope.iLmt+1;  
            }
            
            for(var k=0; k<ImagenS.length; k++)
            {
                $scope.detalleImagen.push(ImagenS[k]);
            }
        }
        
        if(Eliminadas)
        {
            $scope.detalleImagenEliminadas = true;
            
            for(var k=0; k<ImagenA.length; k++)
            {
                if(ImagenA[k].Eliminada == true)
                {
                    $scope.detalleImagen.push(ImagenA[k]);
                    
                    if(k==index)
                    {
                       $scope.iImg = $scope.detalleImagen.length-1;
                    }
                }
                
            }
            
            $scope.iLmt = $scope.detalleImagen.length-1;
        }
        
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
            $scope.iImg = $scope.detalleImagen.length -1;
        }
        else if($scope.iImg >= $scope.detalleImagen.length)
        {
            $scope.iImg = 0;
        }
    };
    
    //--------------- Etiquetas de Imagenes -----------------------------
    $scope.EtiquetarImagen = function(imagen, tipo)
    {
        $scope.etiquetaImagen = imagen;
        IMAGEN.EtiquetaImagen(imagen, $scope.etiqueta, $scope.tema, tipo);
    };
    
    $scope.$on('TerminarEtiquetaImagen',function()
    {   
        $rootScope.$broadcast('Alerta', "Imagen Etiquetada", 'exito');
        
        $scope.SetEtiquetaImagen(IMAGEN.GetImagen());
    });
    
    $scope.$on('TerminarEtiquetaImagenOcultas',function()
    {   
        
        if($scope.todasImg == "opt" || $scope.todasImg == "tema" || $scope.todasImg == "src")
        {
            $scope.TerminarAgregarTemaImagen();
        }
    });
    
    $scope.TerminarAgregarTemaImagen = function()
    {
        var opt = $scope.todasImg;
        $scope.todasImg = "";
        
        if(opt === "tema")
        {   
            for(var k=1; k<$scope.nuevoPendiente.Imagen.length; k++)
            {
                $scope.SetTemaImagenPendiente($scope.nuevoPendiente.Imagen[k], $scope.temaAgregar);
            }
            
            for(var i=1; i<$scope.nuevoPendiente.ImagenSrc.length; i++)
            {
                $scope.SetTemaImagenPendiente($scope.nuevoPendiente.ImagenSrc[i], $scope.temaAgregar);
            }
        }
        else if(opt == "opt")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevoPendiente.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta($scope.nuevoPendiente.Imagen[k]);
            }
        }
        else if(opt == "src")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevoPendiente.ImagenSrc.length; k++)
            {
                $scope.SetTemaImagenPendiente($scope.nuevoPendiente.ImagenSrc[k], $scope.nuevoPendiente.Tema);
            }
        }
    };

    $scope.SetEtiquetaImagen = function(imagen)
    {
        $scope.etiquetaImagen.Etiqueta  = [];
        $scope.etiquetaImagen.Tema = []; 
        
        
        for(var k=0; k<imagen.Etiqueta.length; k++)
        {
            var etiqueta = new Object();
            etiqueta.Nombre = imagen.Etiqueta[k].Nombre;
            etiqueta.EtiquetaId = imagen.Etiqueta[k].EtiquetaId;
            etiqueta.Visible = imagen.Etiqueta[k].Visible;
            
            $scope.etiquetaImagen.Etiqueta.push(etiqueta);
        }
        
        for(var k=0; k<imagen.Tema.length; k++)
        {
            var tema = new Object();
        
            tema.TemaActividadId = imagen.Tema[k].TemaActividadId;
            tema.Tema = imagen.Tema[k].Tema;
            
            $scope.etiquetaImagen.Tema.push(tema);
        }
    };
    
    $scope.ContarEtiquetasVisibles = function(etiqueta)
    {
        if(etiqueta != undefined)
        {
            var con = 0;
        
            for(var k=0; k<etiqueta.length; k++)
            {
                if(etiqueta[k].Visible == "1")
                {
                    con++;
                }
            }

            return con;
        }
    };

    
    //destecta cuando se agrego una etiqueta
    $scope.$on('EtiquetaSet',function(etiqueta)
    {
        $scope.SetEtiquetaTodasImagenes(ETIQUETA.GetEtiqueta());
    });
    
    $scope.SetEtiquetaTodasImagenes = function(etiqueta)
    {
        var e = [];
        e[0] = etiqueta;

        for(var i=0; i<$scope.nuevoPendiente.Imagen.length; i++)
        {
            $scope.SetEtiquetaImagenPendiente($scope.nuevoPendiente.Imagen[i], e);
        }
        
        for(var i=0; i<$scope.nuevoPendiente.ImagenSrc.length; i++)
        {
            $scope.SetEtiquetaImagenPendiente($scope.nuevoPendiente.ImagenSrc[i], e);
        }
    };
    
    $scope.$on('TemaSet',function(etiqueta)
    {
        $scope.todasImg = "tema";
        $scope.SetTemaTodasImagenes(ETIQUETA.GetEtiqueta());
    });
    
    $scope.SetTemaTodasImagenes = function(tema)
    {
        var e = [];
        e[0] = tema;
        
        $scope.temaAgregar = e;
        
        if($scope.nuevoPendiente.Imagen.length > 0)
        {
            $scope.SetTemaImagenPendiente($scope.nuevoPendiente.Imagen[0], e);
        }
        else if($scope.nuevoPendiente.ImagenSrc.length > 0)
        {
            $scope.SetTemaImagenPendiente($scope.nuevoPendiente.ImagenSrc[0], e);
        }
    };
    
    $scope.$on('QuitarEtiqueta',function(nota, etiqueta)
    {
        for(var i=0; i<$scope.nuevoPendiente.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevoPendiente.Imagen[i].Etiqueta.length; j++)
            {
                if($scope.nuevoPendiente.Imagen[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevoPendiente.Imagen[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevoPendiente.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevoPendiente.ImagenSrc[i].Etiqueta.length; j++)
            {
                if($scope.nuevoPendiente.ImagenSrc[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevoPendiente.ImagenSrc[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
    });
    
    $scope.$on('QuitarTema',function(nota, tema)
    {
        for(var i=0; i<$scope.nuevoPendiente.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevoPendiente.Imagen[i].Tema.length; j++)
            {
                if($scope.nuevoPendiente.Imagen[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevoPendiente.Imagen[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevoPendiente.Imagen[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevoPendiente.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevoPendiente.ImagenSrc[i].Tema.length; j++)
            {
                if($scope.nuevoPendiente.ImagenSrc[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevoPendiente.ImagenSrc[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevoPendiente.ImagenSrc[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
    });
    
    //------------- Borrar ----------------
    $scope.BorrarPendiente = function(pendiente)
    {
        $scope.borrarPendiente = pendiente;

        $scope.mensajeBorrar = "¿Estas seguro de eliminar el pendiente \"" + pendiente.Nombre + "\"?";

        $("#borrarPendiente").modal('toggle');
    };
    
    $scope.ConfirmarBorrarPendiente = function()
    {
        (self.servicioObj = LifeService.Delete('BorrarPendiente', $scope.borrarPendiente.PendienteId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.GetPendiente();    
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
    
    //Detalle 
    $scope.VerPendiente = function(pendiente)
    {
        $scope.detalle = new Pendiente();
        $scope.GetDatosPendiente(pendiente, "Detalle");
    };
    
    
    $scope.CambiarIndiceDetalle = function(val, pendiente)
    {
        var min = 0;
        var max = 0;
        
        
        if(pendiente.iActive + val < 0)
        {
            pendiente.iActive = pendiente.Imagen.length -1;
        }
        else if(pendiente.iActive + val >= pendiente.Imagen.length)
        {
            pendiente.iActive = 0;
        }
        else
        {
           pendiente.iActive += val; 
        }
        
        min = pendiente.iActive;
        max = min + $scope.carroselIntervalo;
        
        pendiente.iImg = [];
        for(var i=min; i<max; i++)
        {
            if(i<pendiente.Imagen.length)
            {
                pendiente.iImg.push(i);
            }
            else
            {
                pendiente.iImg.push(i-pendiente.Imagen.length);
            }
            
            if(pendiente.iImg.length >= pendiente.Imagen.length)
            {
                break;        
            }
        }
    };
    
    $( window ).resize(function() 
    {
        if($scope.detalle)
        {
            $scope.GetCarroselIntervalo();
    
            $scope.CambiarIndiceDetalle(0, $scope.detalle);
            

            $scope.$apply();    
        }
    });
    
    $scope.GetCarroselIntervalo = function()
    {
        if($rootScope.anchoPantalla <= 766)
        {
            $scope.carroselIntervalo = 3;
        }
        else if($rootScope.anchoPantalla > 766 && $rootScope.anchoPantalla < 1200)
        {
            $scope.carroselIntervalo = 4;
        }
        else if($rootScope.anchoPantalla >= 1200)
        {
            $scope.carroselIntervalo = 6;
        }
    };
    
    
    //.--------- Boton Accion Pendiente --
    $scope.AccionPendiente = function(pendiente)
    {   
        $scope.pendienteOpt = pendiente;
        
        if(pendiente.Hecho != "1")
        {
            $('#OperacionEvento').modal('toggle');
        }
        else
        {
            $scope.mensajeAdvertencia = "¿Estás seguro de que desea desmarcar como ya realizado este pendiente?";
            $('#CancelarEventoHecho').modal('toggle');
        }
    };
    
    $scope.HechoPendiente = function()
    {
        var pendiente = {hecho: "", id:$scope.pendienteOpt.PendienteId};
    
        pendiente.hecho = $scope.pendienteOpt.Hecho == "1" ?  "0" : "1";
        
        (self.servicioObj = LifeService.Put('HechoPendiente', pendiente)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.pendienteOpt.Hecho = pendiente.hecho;
                
                $scope.GetClasePendiente($scope.pendienteOpt);
            }
            else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede realizar la operación.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    //----------- Hora -------------
    $('#horaIntencion').datetimepicker(
    {
        format: 'hh:mm A',
        showClear: true,
        showClose: true,
        toolbarPlacement: 'bottom'
    });
    
    $scope.CambiarHoraIntencion = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevoPendiente.HoraIntencion = element.value;
        });
    };
    
    
    $('#horaRealizacion').datetimepicker(
    {
        format: 'hh:mm A',
        showClear: true,
        showClose: true,
        toolbarPlacement: 'bottom'
    });
    
    $scope.CambiarHoraRealizacion = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevoPendiente.HoraRealizacion = element.value;
        });
    };
    
    //----------- Prioridad ------------------
    $scope.AbrirAgregarPrioridad = function()
    {
        $rootScope.$broadcast('AdministrarPrioridad', $scope.prioridad);
    };
    
    $scope.$on('TerminarPrioridad',function(evento)
    {    
        if($scope.nuevoPendiente.Prioridad.PrioridadId)
        {
            var id = $scope.nuevoPendiente.Prioridad.PrioridadId;
            $scope.nuevoPendiente.Prioridad = new Prioridad();
            $scope.buscarprioridad = "";
            
            for(var k=0; k<$scope.prioridad.length; k++)
            {
                if($scope.prioridad[k].PrioridadId == id)
                {
                    $scope.buscarprioridad = $scope.prioridad[k];
                    $scope.CambiarPrioridad();
                    break;
                }
            }
        }
    });
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        if($scope.usuarioLogeado.Aplicacion != "Mis Objetivos")
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            $scope.GetTemaActividad();
            $scope.GetEtiqueta();
            $scope.GetPendiente();
            $scope.GetDivisa();
            
            $rootScope.CargarExterior = true;
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
    
    autosize($('textarea'));
    
    //----------- Archivos --------
    $(document).on('hide.bs.modal','#EtiquetaFile', function () 
    {
        $scope.ActivarDesactivarTema($scope.nuevoPendiente.Tema);
        $scope.ActivarDesactivarEtiqueta($scope.nuevoPendiente.Etiqueta);
    });
    
});


