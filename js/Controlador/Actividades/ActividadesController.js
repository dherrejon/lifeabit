app.controller("ActividadesController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, FRECUENCIA, LUGAR, CIUDAD, UNIDAD, DIVISA, IMAGEN, ETIQUETA, LifeService)
{   
    $scope.titulo = "Actividades";
    
    $scope.actividad = [];
    $scope.etiquetaActividad = [];
    $scope.temaActividad = [];
    $scope.mensajeError = [];
    
    $scope.tema = [];
    $scope.frecuencia = [];
    $scope.etiqueta = [];
    $scope.lugar = [];
    $scope.fototeca = [];
    
    $scope.temaF = [];
    $scope.frecuenciaF = [];
    $scope.etiquetaF = [];
    
    $rootScope.CargarExterior = false;
    
    $scope.detalle = new Actividad();
    $scope.verDetalle = false;
    $scope.verFiltro = true;
    $scope.nuevaActividad = new Actividad();
    
    $scope.buscarTema = "";
    $scope.buscarEtiqueta = "";
    $scope.buscarFrecuenciaOperacion = "";
    $scope.buscarLugarOperacion = "";
    
    $scope.mostrarFrecuencia = false;
    $scope.mostrarLugar = false;
    
    $scope.verpen = "";
    $scope.verpen2 = "";
    
    //filtro
    $scope.buscarTemaFiltro = "";
    $scope.buscarEtiquetaFiltro = "";
    $scope.buscarFrecuenciaFiltro = "";
    
    $scope.mostrarFiltro = "etiqueta";
    $scope.filtro = {tema:[], etiqueta:[], frecuencia:[],  fecha:{Fecha:"", FechaFormato:"", Seleccion:""}, pendiente: false};
    $scope.filtroFecha = {Fecha:"", FechaFormato:"", Seleccion:""};
    $scope.campoBuscar = "Conceptos";
    $scope.buscarActividad = "";
    
    
    
    //$scope.buscarConcepto = "";
    
    $scope.hoy = GetDate();
    $scope.filtro.fecha.Fecha = $scope.hoy;
    $scope.filtro.fecha.FechaFormato = TransformarFecha($scope.hoy);
    $scope.filtro.fecha.Seleccion = "Hoy";
    document.getElementById('fechaFiltro').value = $scope.hoy;
    
    /*--------- evento variables ------*/
     $scope.eventoActividad = [];
    $scope.persoanaEvento = [];
    $scope.nuevoEvento = null;
    
    $scope.ciudad = [];
    $scope.estado = [];
    $scope.pais = [];
    $scope.unidad = [];
    $scope.divisa = [];
    $scope.persona = [];
    
    $scope.mostrarPais = false;
    $scope.mostrarEstado = false;
    $scope.mostrarCiudad = false;
    
    $scope.buscarPais = "";
    $scope.buscarEstado = "";
    $scope.buscarCiudad = "";
    
    $scope.modulo = "";
    $scope.buscarTituloFiltro = "";
    $scope.verTodos = false;
    
    /*------------------ Catálogos -----------------------------*/
    $scope.GetActividad = function()              
    {
        $scope.filtro.UsuarioId = $rootScope.UsuarioId;
        GetActividad($http, $q, CONFIG, $scope.filtro).then(function(data)
        {
            $scope.actividad = data;
            
            for(var k=0; k<$scope.actividad.length; k++)
            {
                $scope.SetActividadEstatus($scope.actividad[k]);
            }
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetActividadEstatus = function(actividad)
    {
        var hoy = false;
        var pendiente = false;
        var futuro = false;
        var hecho = false;
        
        if(actividad.EventoAux.length > 0)
        {
            hecho = true;
        }
        
        for(var k=0; k<actividad.EventoAux.length; k++)
        {
            if(actividad.EventoAux[k].Fecha == $scope.hoy && actividad.EventoAux[k].Hecho == '0')
            {
                hoy = true;
                break;
            }
            else if(actividad.EventoAux[k].Fecha < $scope.hoy && actividad.EventoAux[k].Hecho == "0")
            {
                pendiente = true;
            }
            else if(actividad.EventoAux[k].Fecha > $scope.hoy)
            {
                futuro = true;
            }
            else if(actividad.EventoAux[k].Hecho == "0")
            {
                hecho = false;
            }
        }
        
        if(hoy)
        {
            actividad.Estatus = "Hoy";
        }
        else if(pendiente)
        {
            actividad.Estatus = "Pendiente";
        }
        else if(futuro)
        {
            actividad.Estatus = "Futuro";
        }
        else if(hecho)
        {
            actividad.Estatus = "Hecho";
        }
        else
        {
            actividad.Estatus = "";
        }
    };
    
    $scope.GetEtiquetaPorActividad = function(actividad)              
    {
        GetEtiquetaPorActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.etiquetaActividad = data[1].Etiqueta;
            }
            else
            {
                alert(data[0].Estatus);
            }
            
            $scope.GetTemaPorActividad(actividad);
        
        }).catch(function(error)
        {
            alert(data[0].Estatus);
        });
    };
    
    $scope.GetTemaPorActividad = function(actividad)              
    {
        GetTemaPorActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.temaActividad = data[1].Tema;
                $scope.GetFechaActividad(actividad);
            }
            else
            {
                alert(data[0].Estatus);
            }
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetFechaActividad = function(actividad)              
    {
        GetFechaActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.fechaActividad = data[1].Fecha;
            }
            else
            {
                alert(data[0].Estatus);
            }
            
            
            $scope.SetActividaDatos(actividad);
        
        }).catch(function(error)
        {
            alert(data[0].Estatus);
        });
    };
    
    $scope.SetActividaDatos = function(actividad)
    {   
        var sqlBaseTema = "SELECT * FROM ? WHERE ActividadId = '";
        var sqlBaseEtiqueta = "SELECT EtiquetaId, Nombre, IF(Visible='1', true, false) AS Visible  FROM ? WHERE ActividadId = '";
        var sqlBaseFecha = "SELECT * FROM ? WHERE ActividadId = '";
        var sql;
        
        for(var k=0; k<actividad.length; k++)
        {
            //tema
            sql = sqlBaseTema;
            sql += (actividad[k].ActividadId + "'");
            actividad[k].Tema = alasql(sql, [$scope.temaActividad]);
            
            //etiqueta
            sql = sqlBaseEtiqueta;
            sql += (actividad[k].ActividadId + "'");
            actividad[k].Etiqueta = alasql(sql, [$scope.etiquetaActividad]);
            
            //fecha
            sql = sqlBaseFecha;
            sql += (actividad[k].ActividadId + "'");
            actividad[k].Fecha = alasql(sql, [$scope.fechaActividad]);
        }
        
        $scope.FiltroFechaHoy();
        $scope.SetActividadFiltros();
    };
    
    $scope.SetActividadFiltros = function()
    {
        var sql = "SELECT DISTINCT EtiquetaId, Nombre  FROM ? ";
        $scope.etiquetaF = alasql(sql, [$scope.etiquetaActividad]);
        
        sql = "SELECT DISTINCT TemaActividadId, Tema  FROM ? ";
        $scope.temaF = alasql(sql, [$scope.temaActividad]);
    };
    
    /*------------- Catálogos Eventos ----------------------------------------------*/
    $scope.GetCiudad = function()              
    {
        GetCiudad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.ciudad = data;
            
            $scope.SetPaisEstado($scope.ciudad);

        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetPaisEstado = function(ciudad)
    {
        var sql = "SELECT DISTINCT Pais FROM ?";
        $scope.pais = alasql(sql, [ciudad]);

        sql = "SELECT DISTINCT Pais, Estado FROM ?";
        $scope.estado = alasql(sql, [ciudad]);
    };
    
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
    
    $scope.GetPersonaActividad = function()              
    {
        GetPersonaActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.persona = data;
        
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
                //imagen.EtiquetaVisible = $scope.GetEtiquetaVisible(data[1].Etiqueta);
            }
            else
            {
                imagen.Etiqueta = [];
                imagen.Tema = [];
            }
            
            if(val !== false)
            {
                $scope.SetTemaImagenEvento(imagen, $scope.nuevoEvento.Tema);
                $scope.SetEtiquetaImagenEvento(imagen, $scope.nuevoEvento.Etiqueta);
            }
            //console.log(imagen);
        }).catch(function(error)
        {
            alert(error);
        });
        
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
    
    /*------- Otros catálogos ---------------*/
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
    
    $scope.GetFrecuencia = function()              
    {
        GetFrecuencia($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.frecuencia = data;
        
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
    
    $scope.GetLugar = function()              
    {
        GetLugar($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.lugar = data;
            /*for(var k=0; k<data.length; k++)
            {
                $scope.lugar[k].DireccionHTML = $sce.trustAsHtml($scope.lugar[k].DireccionHTML);
            }*/
            
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    //------ Actividad -------
    $scope.GetActividadPorId = function(id, opt)
    {   
        var datos = {Id:id};
        var actividad = [];
        
        $scope.filtro.usuarioId = $rootScope.UsuarioId;
        (self.servicioObj = LifeService.Post('GetActividadPorIdDatos', datos )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var data = dataResponse.data;
                
                for(var k=0; k<data.length; k++)
                {
                    actividad[k] = SetActividad(data[k]);
                    
                    actividad[k].Evento = [];
                    for(var i=0; i<data[k].Evento.length; i++)
                    {
                        actividad[k].Evento[i] = SetEventoActividad(data[k].Evento[i]);
                        actividad[k].Evento[i].NotasHTML = $sce.trustAsHtml(actividad[k].Evento[i].NotasHTML);
                    }
                    
                    actividad[k].NotasHTML = $sce.trustAsHtml(actividad[k].NotasHTML);
                }

                if(opt)
                {
                    $scope.AbrirActividad(opt, actividad[0]);
                }
                else
                {
                    $scope.detalle = actividad[0];
                    
                    $scope.detalle.EtiquetaVisible = $scope.GetEtiquetaVisible($scope.detalle.Etiqueta);
                
                    $scope.eventoActividad = actividad[0].Evento;
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
        
        /*GetActividadPorId($http, $q, CONFIG, datos).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {   
                //Notas
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
            }
            
            $scope.detalle = data[0];
            $scope.detalle.EtiquetaVisible = $scope.GetEtiquetaVisible($scope.detalle.Etiqueta);
            
            
            if(data.length > 0)
            {
                 var eventoActividad = []; 
                for(var k=0; k<data[0].Evento.length; k++)
                {
                    //Notas
                    data[0].Evento[k].NotasHTML = $sce.trustAsHtml(data[0].Evento[k].NotasHTML);
                }

                $scope.eventoActividad = data[0].Evento;
                //console.log($scope.eventoActividad);
            }
           
            if(opt)
            {
                $scope.AbrirActividad(opt, $scope.detalle);
            }
            
            //console.log($scope.detalle);
           
        }).catch(function(error)
        {
            alert(error);
        });*/
    };
    
    $scope.GetEventoActividadPorId = function(id, opt)
    {
        $scope.tipoDetalle = "Evento";
        
        GetEventoActividadPorId($http, $q, CONFIG, id).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
                
                
                data[k].EtiquetaVisible = $scope.GetEtiquetaVisible(data[k].Etiqueta);
            }
             
            if(opt == "Editar" || opt == "Copiar")
            {
                if($scope.operacion == "Copiar")
                {
                    data[0].Hecho = "0";
                    data[0].Fecha = $scope.hoy;
                    data[0].FechaFormato = TransformarFecha($scope.hoy);
                }
                
                $scope.nuevoEvento = data[0];
                
                if($scope.nuevoEvento.Ciudad.CiudadId)
                {
                    $scope.buscarCiudad = SetCiudad($scope.nuevoEvento.Ciudad);
                }
                else
                {
                    $scope.buscarCiudad = "";
                }

                $scope.ActivarDesactivarTema($scope.nuevoEvento.Tema);
                $scope.ActivarDesactivarEtiqueta($scope.nuevoEvento.Etiqueta);

                for(var k=0; k<$scope.nuevoEvento.Imagen.length; k++)
                {
                    $scope.GetImagenEtiqueta($scope.nuevoEvento.Imagen[k], false);
                }

                $scope.inicioEvento = jQuery.extend({}, $scope.nuevoEvento);
                $scope.$broadcast('IniciarArchivo', $scope.nuevoEvento);
        
                $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevoEvento, 'Evento');
            }
            else if(opt == "Detalle")
            { 
                $scope.detalleEvento = data[0];
                
                for(var k=0; k<$scope.eventoActividad.length; k++)
                {
                    if($scope.eventoActividad[k].EventoActividadId == id)
                    {
                        $scope.eventoActividad[k] = data[0];
                        break;
                    }
                }
            }
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    //----------- Detalles -------------------
    $scope.VerDetalles = function(actividad, editar, opt)
    {
        if(actividad.ActividadId != $scope.detalle.ActividadId)
        {
            $scope.GetActividadPorId(actividad.ActividadId, opt);
            //$scope.detalle.EtiquetaVisible = $scope.GetEtiquetaVisible(actividad.Etiqueta);
            $scope.verDetalle = false;

            if($rootScope.anchoPantalla <= 767)
            {
                $scope.buscarActividad = "";
            }
        
        
            //$scope.eventoActividad = [];
            //$scope.GetEventoActividad(actividad.ActividadId);
        }
        else if(editar === true)
        {
            $scope.GetActividadPorId(actividad.ActividadId);
            //$scope.detalle.EtiquetaVisible = $scope.GetEtiquetaVisible(actividad.Etiqueta);
        }
        else if(opt)
        {
            $scope.AbrirActividad(opt, $scope.detalle);
        }
        
    };
    
    $scope.GetEtiquetaVisible = function(data)
    {
        var etiqueta = [];
        
        for(var k=0; k<data.length; k++)
        {
            if(data[k].Visible)
            {
                etiqueta.push(data[k]);
            }
        }
        
        return etiqueta;
    };
    
    $scope.GetClaseActividad = function(id)
    {
        if(id == $scope.detalle.ActividadId)
        {
            return "active";
        }
        else
        {
            return "";
        }
    };
    
    $scope.CambiarVerDetalle = function()
    {
        $scope.verDetalle = !$scope.verDetalle;
    };
    
    $scope.CambiarVerBarra = function()
    {
        $scope.detalle = new Actividad();
    };
    
    $scope.VerOptPendiente = function(id)
    {
        if($scope.verpen != id)
        {
             var y = $('#actividad' + id).height();
            $('#menuActividad' + id).css('height', y);
            
            $scope.verpen2 = $scope.verpen;
            $scope.verpen = id;
            
            setTimeout(function()
            {
                 $scope.verpen2 = "";
                $scope.$apply();
            }, 700);
        }
    };
    
    document.getElementById('body').onclick = function(e) 
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
    
    //------------------------------- Filtrar -------------------------
    $scope.FitroActividad = function(info)
    {        
        var cumple = false;
        if($scope.filtroFecha.Fecha.length > 0)
        {
            for(var k=0; k<info.Fecha.length; k++)
            {
                if(info.Fecha[k].Fecha == $scope.filtroFecha.Fecha)
                {
                    cumple = true;
                    break;
                }
            }
        }
        else
        {
            cumple = true;
        }
        
        if(!cumple)
        {
            return false;
        }
        
        cumple = false;
        
        if($scope.filtro.etiqueta.length > 0)
        {
            for(var i=0; i<$scope.filtro.etiqueta.length; i++)
            {
                cumple = false;
                for(var j=0; j<info.Etiqueta.length; j++)
                {
                    if($scope.filtro.etiqueta[i] == info.Etiqueta[j].EtiquetaId)
                    {
                        cumple = true;
                        break;
                    }
                }
                
                if(!cumple)
                {
                    return false;
                }
            }
        }
        
        cumple = false;
        
        if($scope.filtro.tema.length > 0)
        {
            for(var i=0; i<$scope.filtro.tema.length; i++)
            {
                if($scope.filtro.tema != "0")
                {
                    cumple = false;
                    for(var j=0; j<info.Tema.length; j++)
                    {
                        if($scope.filtro.tema[i] == info.Tema[j].TemaActividadId)
                        {
                            cumple = true;
                            break;
                        }
                    }

                    if(!cumple)
                    {
                        return false;
                    }
                }
                else
                {
                    if(info.Tema.length > 0)
                    {
                        return false;
                    }
                }
                
            }
        }
        
        cumple = false;
        
        if($scope.filtro.frecuencia.length === 0)
        {
            cumple = true;
        }
        else
        {
            for(var k=0; k<$scope.filtro.frecuencia.length; k++)
            {
                
                if(info.Frecuencia.FrecuenciaId == $scope.filtro.frecuencia[k])
                {
                    cumple = true;
                    break;
                }
            }
        }
        
        if(cumple)
        {
            return true;
        }
        else
        {
            return false;
        }
        
    };

    $scope.BuscarActividad = function(actividad)
    {
        if($scope.buscarActividad.length > 0)
        {
            var index = actividad.Nombre.toLowerCase().indexOf($scope.buscarActividad.toLowerCase());
            
            
            if(index < 0)
            {
                return false;
            }
            else
            {
                if(index == 0)
                {
                    return true;
                }
                else
                {
                    if(actividad.Nombre[index-1] == " ")
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
    };
    
    $scope.FiltroActividadPendiente = function(actividad)
    {
        if(!$scope.filtro.pendiente)
        {
            return true;
        }
        else
        {
            var pendiente = false;
            
            for(var k=0; k<actividad.EventoAux.length; k++)
            {
                if(actividad.EventoAux[k].Hecho == "0" && actividad.EventoAux[k].Fecha <= $scope.hoy)
                {
                    return true;
                }
            }
            
            return false;
        }
    };
    
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
    
    $scope.FiltrarBuscarFrecuencia = function(frecuencia, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = frecuencia.Nombre.toLowerCase().indexOf(buscar.toLowerCase());


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
                        if(frecuencia.Nombre[index-1] == " ")
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
    
    $scope.CambiarCampoBuscar = function(campo)
    {
        if(campo != $scope.campoBuscar)
        {
            $scope.campoBuscar = campo;
            
            $scope.buscarActividad = "";
            $scope.buscarConceptoBarra = "";
        }
    };
    
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
            $scope.GetActividad();
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
            $scope.GetActividad();
        }
        
    };
    
    //-------- Filtro Ciudad -------------
    $scope.FiltrarBuscarCiudad = function(buscarCiudad)
    {
        
        var ciudad = [];
        
        
        if(buscarCiudad !== undefined)
        {
            for(var k=0; k<$scope.ciudad.length; k++)
            {
                //pais
                var index = $scope.ciudad[k].Pais.toLowerCase().indexOf(buscarCiudad.toLowerCase());

                if(index >= 0)
                {
                    if(index === 0)
                    {
                        ciudad.push($scope.ciudad[k]);
                        continue;
                    }
                    else
                    {
                        if($scope.ciudad[k].Pais[index-1] == " ")
                        {
                            ciudad.push($scope.ciudad[k]);
                            continue;
                        }
                    }
                }
                
                //Estado
                index = $scope.ciudad[k].Estado.toLowerCase().indexOf(buscarCiudad.toLowerCase());

                if(index >= 0)
                {
                    if(index === 0)
                    {
                        ciudad.push($scope.ciudad[k]);
                        continue;
                    }
                    else
                    {
                        if($scope.ciudad[k].Estado[index-1] == " ")
                        {
                            ciudad.push($scope.ciudad[k]);
                            continue;
                        }
                    }
                }
                
                //Ciudad
                index = $scope.ciudad[k].Ciudad.toLowerCase().indexOf(buscarCiudad.toLowerCase());

                if(index >= 0)
                {
                    if(index === 0)
                    {
                        ciudad.push($scope.ciudad[k]);
                        continue;
                    }
                    else
                    {
                        if($scope.ciudad[k].Ciudad[index-1] == " ")
                        {
                            ciudad.push($scope.ciudad[k]);
                            continue;
                        }
                    }
                }
                
                
            }
        }
        
        return ciudad;
    };
    
    /*$scope.BuscarTema = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConcepto);
    };*/
    
    $scope.BuscarTemaFiltro = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConceptoBarra);
    };
    
    /*$scope.BuscarEtiqueta = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConcepto);
    };*/
    
    $scope.BuscarEtiquetaFiltro = function(etiqueta)//buscarConceptoFiltro
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConceptoBarra);
    };
    
    $scope.SetFiltroTema = function(tema)
    {
        
        if(($scope.filtro.tema.length + $scope.filtro.etiqueta.length) === 0)
        {
            $scope.LimpiarFiltroFecha();
        }
        
        tema.filtro = false;
        $scope.filtro.tema.push(tema);
        
        $scope.buscarConceptoBarra = "";
        document.getElementById('buscarConcepto').focus();
        
        //$scope.GetActividad();
    };
    
    $scope.SetFiltroFrecuencia = function(frecuencia)
    {
        var sql = "SELECT * FROM ? WHERE Filtro = true";
        
        $scope.frecuenciaFiltrada = alasql(sql, [$scope.frecuenciaF]);
        
        $scope.buscarFrecuenciaFiltro = "";
        
        for(var k=0; k<$scope.filtro.frecuencia.length; k++)
        {
            if(frecuencia == $scope.filtro.frecuencia[k])
            {
                $scope.filtro.frecuencia.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.frecuencia.push(frecuencia);
    };
    
    $scope.SetFiltroEtiqueta = function(etiqueta)
    {
        /*if(($scope.filtro.tema.length + $scope.filtro.etiqueta.length) === 0)
        {
            $scope.LimpiarFiltroFecha();
        }*/
        
        etiqueta.filtro = false;
        $scope.filtro.etiqueta.push(etiqueta);
            
        $scope.buscarConceptoBarra = "";
        document.getElementById('buscarConcepto').focus();
        
        //$scope.GetActividad();
    };
    
    
    $scope.LimpiarFiltro = function()
    {
        $scope.filtro = {tema:[], etiqueta:[], frecuencia:[],  fecha:{Fecha:"", FechaFormato:"", Seleccion:""}};
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            $scope.etiqueta[k].filtro = true;
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            $scope.tema[k].filtro = true;
        }
        
        $scope.verFiltro = true;
        
        $scope.buscarConceptoBarra = "";
        
        //$scope.verTodos = false;
        
        $scope.GetActividad();
        
        $scope.verTodos = false;
        
        //document.getElementById("fechaFiltro").value = "";
    };
    
    $scope.LimpiarBuscarFiltro = function()
    {
        $scope.buscarConceptoBarra = "";
        $scope.buscarActividad = "";
    };
    
    //Presionar enter
    $('#buscarConcepto').keydown(function(e)
    {
        switch(e.which) {
            case 13:
               var index = $scope.buscarConceptoBarra.indexOf(" ");
               
               if(index == -1)
                {
                    $scope.AgregarEtiquetaFiltro($scope.buscarConceptoBarra);
                }
                else
                {
                    var etiquetas = $scope.buscarConceptoBarra.split(" ");
                    for(var k=0; k<etiquetas.length; k++)
                    {
                        if(etiquetas[k] != "")
                        {
                            $scope.AgregarEtiquetaFiltro(etiquetas[k]);
                        }
                    }
                }
               $scope.$apply();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.AgregarEtiquetaFiltro = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].Nombre.toLowerCase() == etiqueta.toLowerCase())
            {
                if($scope.etiqueta[k].filtro)
                {
                    $scope.SetFiltroEtiqueta($scope.etiqueta[k]);
                }
                else
                {
                    $scope.buscarConceptoBarra = "";
                }
                
            }
        }
    };
    
    $('#bucarEtiquetaFiltro').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.CheckFiltroEtiqueta();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.CheckFiltroEtiqueta = function()
    {
        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            if($scope.etiquetaF[k].Nombre.toLowerCase() == $scope.buscarEtiquetaFiltro.toLowerCase() && !$scope.etiquetaF[k].Filtro)
            {
                $scope.etiquetaF[k].Filtro = true;
                $scope.SetFiltroEtiqueta($scope.etiquetaF[k].EtiquetaId);
                $scope.buscarEtiquetaFiltro = "";
                break;
            }
        }
        
        $scope.$apply();
    };
    
    $('#buscarTemaFiltro').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.CheckFiltroTema();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.CheckFiltroTema = function()
    {
        for(var k=0; k<$scope.temaF.length; k++)
        {
            if($scope.temaF[k].Tema.toLowerCase() == $scope.buscarTemaFiltro.toLowerCase() && !$scope.temaF[k].Filtro)
            {
                $scope.temaF[k].Filtro = true;
                $scope.SetFiltroTema($scope.temaF[k].TemaActividadId);
                $scope.buscarTemaFiltro = "";
                break;
            }
        }
        
        $scope.$apply();
    };
    
    $('#buscarFrecuenciaFiltro').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.CheckFiltroFrecuencia();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.CheckFiltroFrecuencia = function()
    {
        for(var k=0; k<$scope.frecuenciaF.length; k++)
        {
            if($scope.frecuenciaF[k].Nombre.toLowerCase() == $scope.buscarFrecuenciaFiltro.toLowerCase() && !$scope.frecuenciaF[k].Filtro)
            {
                $scope.frecuenciaF[k].Filtro = true;
                $scope.SetFiltroFrecuencia($scope.frecuenciaF[k].FrecuenciaId);
                $scope.buscarFrecuenciaFiltro = "";
                break;
            }
        }
        
        $scope.$apply();
    };
    
    $scope.CambiarVerFiltro = function()
    {
        $scope.verFiltro = !$scope.verFiltro;
    };
    
    $('#fechaFiltro').datetimepicker(
    { 
        locale: 'es',
        format: 'YYYY-MM-DD',//"dd DD/MMM/YYYY",
    });
    
    $scope.AbrirCalendario = function()
    {        
        document.getElementById("fechaFiltro").focus();
    };
    
    $scope.FiltroFechaHoy = function()
    {
        if($scope.filtro.fecha.Seleccion != "Hoy")
        {
            document.getElementById("fechaFiltro").value = $scope.hoy;
            $scope.filtro.fecha.Seleccion = "Hoy";
            $scope.filtro.fecha.Fecha = $scope.hoy;
            $scope.filtro.fecha.FechaFormato = TransformarFecha( $scope.hoy);
            
            $scope.GetActividad();
            //$scope.filtro.FechaFormato = TransformarFecha($scope.hoy);
            
            //document.getElementById("fechaFiltro").value = $scope.hoy;
        }
        
    };
    
    $scope.LimpiarFiltroFecha = function()
    {
        if($scope.filtro.fecha.Fecha !== "")
        {
            $scope.filtro.fecha = {Fecha:"", FechaFormato:"", Seleccion:""};
            $scope.GetActividad();
            $scope.verTodos = false;
        }
        
    };
    
    $scope.CambiarFechaFiltro = function(element) 
    {
        if(element.value != $scope.filtro.fecha.Fecha)
        {
            if(element.value != $scope.hoy)
            {
                $scope.filtro.fecha.Seleccion = "Calendario";
            }
            else
            {
                $scope.filtro.fecha.Seleccion = "Hoy";
            }
            $scope.filtro.fecha.Fecha = element.value;
            $scope.filtro.fecha.FechaFormato = "";
            $scope.filtro.fecha.FechaFormato = TransformarFecha($scope.filtro.fecha.Fecha);
            $scope.GetActividad();
        }
        
        $scope.$apply();

    };
    
    $scope.BuscarFiltroActividad = function()
    {
        $scope.LimpiarBuscarFiltro();
        $scope.LimpiarFiltroFecha();
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
        
        $scope.filtro.fecha.Fecha = year + "-" + mes + "-" + dia;
        $scope.filtro.fecha.FechaFormato = TransformarFecha($scope.filtro.fecha.Fecha);
        document.getElementById('fechaFiltro').value = $scope.filtro.fecha.Fecha;
        
        if($scope.filtro.fecha.Fecha != $scope.hoy)
        {
            $scope.filtro.fecha.Seleccion = "Calendario";
        }
        else
        {
            $scope.filtro.fecha.Seleccion = "Hoy";
        }
        
        $scope.GetActividad();
    };
    
    //Ciudad
    $scope.CambiarCiudad = function()
    {
        $scope.nuevoEvento.Ciudad = $scope.buscarCiudad;
    };
    
    $scope.QuitaCiudad = function()
    {
        $scope.nuevoEvento.Ciudad = new Ciudad();
        $scope.buscarCiudad = "";
    };
    
    
    $scope.FiltrarBuscarActividad = function(actividad)
    {
        var buscar = $scope.buscarActividad;
        
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = actividad.Nombre.toLowerCase().indexOf(buscar.toLowerCase());


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
                        if(actividad.Nombre[index-1] == " ")
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
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirActividad = function(operacion, actividad)
    {
        $scope.operacion = operacion;
        $scope.modulo = "Actividad";
        
        if(operacion == "Agregar")
        {
            $scope.nuevaActividad = new Actividad();
            $scope.ActivarDesactivarTema([]);
            $scope.ActivarDesactivarEtiqueta([]);
            
            document.getElementById("horaDiario").value = "";
            $('#horaDiario').data("DateTimePicker").clear();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaActividad = $scope.SetActvidad(actividad);
            $scope.ActivarDesactivarTema(actividad.Tema);
            $scope.ActivarDesactivarEtiqueta(actividad.Etiqueta);
            
            $('#horaDiario').data("DateTimePicker").clear();
            document.getElementById("horaDiario").value = $scope.nuevaActividad.Hora;
        }
        else if(operacion == "Copiar")
        {
            $scope.nuevaActividad = $scope.CopiarActividad(actividad);
            $scope.ActivarDesactivarTema(actividad.Tema);
            $scope.ActivarDesactivarEtiqueta(actividad.Etiqueta);
            
            $('#horaDiario').data("DateTimePicker").clear();
            document.getElementById("horaDiario").value = $scope.nuevaActividad.Hora;
        }
        
        $scope.inicioActividad = jQuery.extend({}, $scope.nuevaActividad);
    
        $('#modalApp').modal('toggle');
        
        $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevaActividad, 'Actividad');
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
    
    $scope.SetActvidad = function(data)
    {
        //console.log(data);
        var actividad = new Actividad();
        
        actividad.ActividadId = data.ActividadId;
        actividad.Nombre = data.Nombre;
        actividad.FechaCreacion = data.FechaCreacion;
        actividad.FechaCreacionFormato = data.FechaCreacionFormato;
        actividad.Notas = data.Notas;
        actividad.Hora = data.Hora;
        
        if(data.Notas !== null && data.Notas !== undefined)
        {
            actividad.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
            actividad.NotasHTML = $sce.trustAsHtml(actividad.NotasHTML);
        }
        else
        {
            actividad.NotasHTML = "";
        }
        
        actividad.Frecuencia.FrecuenciaId = data.Frecuencia.FrecuenciaId;
        actividad.Frecuencia.Nombre = data.Frecuencia.Nombre;
        
        actividad.Lugar.LugarId = data.Lugar.LugarId;
        actividad.Lugar.Nombre = data.Lugar.Nombre;
        
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            actividad.Etiqueta[k] = new Etiqueta();
            
            actividad.Etiqueta[k].EtiquetaId = data.Etiqueta[k].EtiquetaId;
            actividad.Etiqueta[k].Nombre = data.Etiqueta[k].Nombre;
            actividad.Etiqueta[k].Visible = data.Etiqueta[k].Visible;
            actividad.Etiqueta[k].count = parseInt(data.Etiqueta[k].count);
        }
        
        for(var k=0; k<data.Tema.length; k++)
        {
            actividad.Tema[k] = new TemaActividad();
            
            actividad.Tema[k].TemaActividadId = data.Tema[k].TemaActividadId;
            actividad.Tema[k].Tema = data.Tema[k].Tema;
        }
        
        return actividad;
    };
    
    $scope.CopiarActividad = function(data)
    {
        var actividad = new Actividad();
        
        actividad.Nombre = data.Nombre;
        
        actividad.Notas = data.Notas;
        actividad.Hora = data.Hora;
        
        if(data.Notas !== null && data.Notas !== undefined)
        {
            actividad.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
            actividad.NotasHTML = $sce.trustAsHtml(actividad.NotasHTML);
        }
        else
        {
            actividad.NotasHTML = "";
        }
        
        actividad.Frecuencia.FrecuenciaId = data.Frecuencia.FrecuenciaId;
        actividad.Frecuencia.Nombre = data.Frecuencia.Nombre;

        actividad.Lugar.LugarId = data.Lugar.LugarId;
        actividad.Lugar.Nombre = data.Lugar.Nombre;
        
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            actividad.Etiqueta[k] = new Etiqueta();
            
            actividad.Etiqueta[k].EtiquetaId = data.Etiqueta[k].EtiquetaId;
            actividad.Etiqueta[k].Nombre = data.Etiqueta[k].Nombre;
            actividad.Etiqueta[k].Visible = data.Etiqueta[k].Visible;
        }
        
        for(var k=0; k<data.Tema.length; k++)
        {
            actividad.Tema[k] = new TemaActividad();
            
            actividad.Tema[k].TemaActividadId = data.Tema[k].TemaActividadId;
            actividad.Tema[k].Tema = data.Tema[k].Tema;
        }
        
        return actividad;
    };
    
    $scope.CerrarActividad = function()
    {
        if(JSON.stringify($scope.inicioActividad) === JSON.stringify($scope.nuevaActividad))
        {
            $('#modalApp').modal('toggle');
        }
        else
        {
            $('#cerrarActividad').modal('toggle');
            $scope.cerrarVentana = "actividad";
        }
       
    };
    
    $scope.ConfirmarCerrarActividad = function()
    {
        if($scope.cerrarVentana == "actividad")
        {
            $('#modalApp').modal('toggle');
            $scope.mensajeError = [];
            $scope.LimpiarInterfaz();
        }
        else if($scope.cerrarVentana == "evento")
        {
            $('#modalEvento').modal('toggle');
            $scope.mensajeError = [];
        }
        
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.buscarEtiqueta = "";
        $scope.buscarTema = "";
    };
    
    $scope.CrearEtiquetaSugerida = function()
    {
        if($scope.nuevaActividad.Nombre)
        {
            $scope.etiquetaSugerida = LimiparCaracteresLabel($scope.nuevaActividad.Nombre);
            $scope.temaSugerido = [];

            for(var k=0; k<$scope.etiquetaSugerida.length; k++)
            {
                if($scope.etiquetaSugerida[k] === "")
                {
                    $scope.etiquetaSugerida.splice(k,1);
                    k--;
                    continue;
                }

                for(var i=0; i<$scope.nuevaActividad.Etiqueta.length; i++)
                {
                    if($scope.nuevaActividad.Etiqueta[i].Nombre.toLowerCase() == $scope.etiquetaSugerida[k].toLowerCase())
                    {
                        if($scope.nuevaActividad.Etiqueta[i].Visible)
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
            $scope.$broadcast('AgregarEtiquetaSugerida', $scope.etiqueta, $scope.tema, $scope.nuevaActividad, 'Actividad', etiqueta);
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
    
    //---------- Operaciones Actividad ------------------------------
    
    //Tema
    
    
    
    
    //Frecuencia
    $scope.CambiarFrecuencia = function(frecuencia)
    {
        $scope.nuevaActividad.Frecuencia = frecuencia;
        
        $scope.mostrarFrecuencia = false;
        $scope.buscarFrecuenciaOperacion = "";
    };
    
    $scope.MostrarFrecuencia = function()
    {
        $scope.mostrarFrecuencia = !$scope.mostrarFrecuencia;
    };
    
    //Lugar
    $scope.CambiarLugar = function(lugar, objeto)
    {
        $scope.mostrarLugar = false;
        $scope.buscarLugarOperacion = "";
        
        if(lugar != 'Ninguno')
        {
            if(objeto == "Actividad")
            {
                $scope.nuevaActividad.Lugar = lugar;
            }
            else if(objeto == "Evento")
            {
                $scope.nuevoEvento.Lugar = lugar;
            }
        }
        else
        {
            if(objeto == "Actividad")
            {
                $scope.nuevaActividad.Lugar = new Lugar();
            }
            else if(objeto == "Evento")
            {
                $scope.nuevoEvento.Lugar = new Lugar();
            }
        }
    };
    
    $scope.MostrarLugar = function()
    {
        $scope.mostrarLugar = !$scope.mostrarLugar;
    };
    
    document.getElementById('modalApp').onclick = function(e) 
    {
        if($scope.mostrarLugar)
        {
            if(!(e.target.id == "lugarPanel"  || $(e.target).parents("#lugarPanel").size()))
            { 
                $scope.mostrarLugar = false;
                $scope.$apply();
            }
        }
        
        if($scope.mostrarFrecuencia)
        {
            if(!(e.target.id == "frecuenciaPanel"  || $(e.target).parents("#frecuenciaPanel").size()))
            { 
                $scope.mostrarFrecuencia = false;
                $scope.$apply();
            }
        }
        
        /*if($scope.buscarTema.length > 0)
        {
            if(!(e.target.id == "temaPanel"  || $(e.target).parents("#temaPanel").size()))
            { 
                $scope.buscarTema = "";
                $scope.$apply();
            }
        }
        
        if($scope.buscarEtiqueta.length > 0)
        {
            if(!(e.target.id == "etiquetaPanel"  || $(e.target).parents("#etiquetaPanel").size()))
            { 
                $scope.buscarEtiqueta = "";
                $scope.$apply();
            }
        }*/
        
    };
    
    //----------- Hora -------------
    $('#horaDiario').datetimepicker(
    {
        locale: 'es',
        format: 'hh:mm A',
        showClear: true,
        showClose: true,
        toolbarPlacement: 'bottom'
    });
    
    $scope.CambiarHoraDiario = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevaActividad.Hora = element.value;
        });
    };
    
    //-------------------- Terminar Actividad -------------------
    $scope.TerminarActividad = function(actividadInvalida)
    {
        if(!$scope.ValidarActividad(actividadInvalida))
        {
            $('#mensajeError').modal('toggle');
            return;
        }
        else
        {
            $scope.AgregarEtiquetaOcultar('Actividad');
        }
    };
    
    $scope.QuitarEtiquetaNoVisible = function()
    {
        for(var k=0; k<$scope.nuevaActividad.Etiqueta.length; k++)
        {
            if(!$scope.nuevaActividad.Etiqueta[k].Visible)
            {
                $scope.nuevaActividad.Etiqueta.splice(k,1);
                k--;
            }
        }
    };
    
    $scope.AgregarEtiquetaOcultar = function(modulo)
    {
        $scope.modulo = modulo;
        if(modulo == 'Actividad')
        {
            for(var k=0; k<$scope.nuevaActividad.Etiqueta.length; k++)
            {
                if(!$scope.nuevaActividad.Etiqueta[k].Visible)
                {
                    $scope.nuevaActividad.Etiqueta.splice(k, 1);
                    k--;
                }
            }
            

            $scope.$broadcast('SepararEtiqueta', $scope.nuevaActividad.Tema, 'Actividad');
    
        }
        else if(modulo == 'Evento')
        {
            var promesas = [];
            for(var k=0; k<$scope.nuevoEvento.Etiqueta.length; k++)
            {
                if(!$scope.nuevoEvento.Etiqueta[k].Visible)
                {
                    $scope.nuevoEvento.Etiqueta.splice(k, 1);
                    k--;
                }
            }
            
            $scope.$broadcast('SepararEtiqueta', $scope.nuevoEvento.Tema, 'Evento');
        }
    };
    
    $scope.$on('TerminarEtiquetaOculta',function(evento, modal)
    {           
        if(modal == "Actividad")
        {
            $scope.nuevaActividad.Hora = $scope.SetNullHora($scope.nuevaActividad.Hora);
            $scope.nuevaActividad.UsuarioId = $rootScope.UsuarioId;
            if($scope.operacion == "Agregar" || $scope.operacion == "Copiar")
            {
                var d = new Date();
                $scope.nuevaActividad.FechaCreacion = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
                
                
                $scope.AgregarActividad();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarActividad();
            }
        }
        else if(modal == "Evento")
        {   
            $rootScope.$broadcast('EtiquetaOcultaArchivoIniciar', $scope.nuevoEvento); 
        }
    });
    
    $scope.$on('TerminarEtiquetaOcultaArchivo',function()
    {   
        $scope.nuevoEvento.UsuarioId = $rootScope.UsuarioId;
        $scope.nuevoEvento.Hora = $scope.SetNullHora($scope.nuevoEvento.Hora);
        if($scope.operacion == "Agregar" || $scope.operacion == "Copiar")
        {
            $scope.AgregarEventoActividad();
        }
        else if($scope.operacion == "Editar")
        {
            $scope.EditarEventoActividad();
        }
    });
    
    
    $scope.AgregarActividad = function()    
    {
        AgregarActividad($http, CONFIG, $q, $scope.nuevaActividad).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                
                $scope.mensaje = "Actividad agregada.";
                $scope.EnviarAlerta('Vista');
                
                $scope.nuevaActividad.ActividadId = data[1].ActividadId;
                //$scope.nuevaActividad.FechaCreacion = data[2].FechaCreacion;
                //$scope.nuevaActividad.FechaCreacionFormato = TransformarFecha(data[2].FechaCreacion);
                $scope.nuevaActividad.Etiqueta = data[3].Etiqueta;
                $scope.nuevaActividad.Tema = data[4].Tema;
                
                
                $scope.SetNuevaActividad($scope.nuevaActividad);
                
                //$scope.actividad.push($scope.nuevaActividad);
                //$scope.VerDetalles($scope.actividad[$scope.actividad.length-1]);
                
                $scope.mensajeEvento = "¿Desas registrar un evento de " + $scope.nuevaActividad.Nombre  + " ?";
                $('#registrarEventoPregunta').modal('toggle');
                
                
                $scope.nuevaActividad = new Actividad();
                $('#modalApp').modal('toggle');
                $scope.LimpiarInterfaz();
                
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeError').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeError').modal('toggle');
        });
    };
    
    $scope.EditarActividad = function()    
    {   
        EditarActividad($http, CONFIG, $q, $scope.nuevaActividad).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.nuevaActividad.Etiqueta = data[1].Etiqueta;
                $scope.nuevaActividad.Tema = data[2].Tema;
                
                $scope.mensaje = "Actividad editada.";
                $scope.SetNuevaActividad($scope.nuevaActividad);
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');
                
                $('#modalApp').modal('toggle');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeError').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeError').modal('toggle');
        });
    };
    
    $scope.SetNuevaActividad = function(actividad)
    {
        var nact = new Object();
        nact.Nombre = actividad.Nombre;
        nact.ActividadId = actividad.ActividadId;
        
        var sqlBase = "SELECT COUNT(*) as num FROM ? WHERE TemaActividadId= '";
        //tema
        for(var k=0; k<actividad.Tema.length; k++)
        {
            sql = sqlBase + actividad.Tema[k].TemaActividadId + "'";

            count = alasql(sql, [$scope.tema]);
            
            if(count[0].num === 0)
            {
                actividad.Tema[k].filtro = true;
               $scope.tema.push(actividad.Tema[k]);
            }
        }
        
        //etiqueta
        sqlBase = "SELECT COUNT(*) as num FROM ? WHERE EtiquetaId= '";
        for(var k=0; k<actividad.Etiqueta.length; k++)
        {
            sql = sqlBase + actividad.Etiqueta[k].EtiquetaId + "'";
            
            //etiqueta Dropdownlist
            count = alasql(sql, [$scope.etiqueta]);
            
            if(count[0].num === 0)
            {
                actividad.Etiqueta[k].filtro = true;
               $scope.etiqueta.push(actividad.Etiqueta[k]);
            }
        }
        
        //agregar y editar
        if($scope.operacion == "Agregar" || $scope.operacion == "Copiar")
        {
            //$scope.actividad.push(nact);
            $scope.VerDetalles(nact);
            $scope.GetActividad();
        }
        else if($scope.operacion == "Editar")
        {
            $scope.VerDetalles(nact, true);
            
            $scope.GetActividad();
            /*for(var k=0; k<$scope.actividad.length; k++)
            {
                if($scope.actividad[k].ActividadId == actividad.ActividadId)
                {
                    $scope.actividad[k].Nombre = nact.Nombre;
                    break;
                }
            }*/
        }
    };
    
    $scope.ValidarActividad = function(actividadInvalida)
    {
        $scope.mensajeError = [];
        
        if(actividadInvalida)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una actividad válida.";
        }
        
        if(($scope.nuevaActividad.Etiqueta.length + $scope.nuevaActividad.Tema.length) === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos una etiqueta o tema.";
        }
        
        if($scope.nuevaActividad.Frecuencia.FrecuenciaId.length === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona una frecuencia.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;
        }
        
        for(var k=0; k<$scope.actividad.length; k++)
        {
            if($scope.actividad[k].Nombre.toLowerCase() == $scope.nuevaActividad.Nombre.toLowerCase()  && $scope.actividad[k].ActividadId != $scope.nuevaActividad.ActividadId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*La actividad  \"" + $scope.nuevaActividad.Nombre + "\" ya existe.";
                $scope.nuevaActividad.Nombre = "";
                return false;
            }
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;
        }
        else
        {
            return true;
        }
        
    };
    
    //------------------------  Borrar --------------------------------------
    $scope.BorrarActividad = function(actividad, num)
    {
        if(num == 0)
        {
            $scope.borrarActividad = actividad;

            $scope.mensajeBorrar = "¿Estas seguro de eliminar " + actividad.Nombre + "?";

            $("#borrarActividad").modal('toggle');
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[0] = "Esta actividad tiene eventos registrados. Tines que borrar todos sus eventos para poder borrar la actividad.";
            $("#mensajeError").modal('toggle');
        }
    };
    
    $scope.ConfirmarBorrarActividad = function()
    {
        BorrarActividad($http, CONFIG, $q, $scope.borrarActividad.ActividadId).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {                
                for(var k=0; k<$scope.actividad.length; k++)
                {
                    if($scope.actividad[k].ActividadId == $scope.borrarActividad.ActividadId)
                    {
                        $scope.actividad.splice(k,1);
                        break;
                    }
                }
                
                $scope.detalle = new Actividad();
                $scope.verDetalle = false;
                
                $scope.mensaje = "Actividad borrada.";
                $scope.EnviarAlerta('Vista');
                
                //$scope.QuitarFiltros();
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeError').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeError').modal('toggle');
        });
    };
    
     $scope.QuitarFiltros = function()
     {
         var quitar = true;
        for(var k=0; k<$scope.actividad.length; k++)
        {
            if($scope.actividad[k].Frecuencia.FrecuenciaId == $scope.borrarActividad.Frecuencia.FrecuenciaId)
            {
                quitar = false;
                break;
            }
        }
         
        if(quitar)
        {
            for(var k=0; k<$scope.frecuenciaF.length; k++)
            {
                if($scope.frecuenciaF[k].FrecuenciaId == $scope.borrarActividad.Frecuencia.FrecuenciaId) 
                {
                    $scope.frecuenciaF.splice(k,1);
                    break;
                }
            }
        }
         
         
        for(var k=0; k<$scope.borrarActividad.Etiqueta.length; k++)
        {
            quitar = true;
            
            for(var i=0; i<$scope.actividad.length; i++)
            {
                for(var j=0; j<$scope.actividad[i].Etiqueta.length; j++)
                {
                    if($scope.borrarActividad.Etiqueta[k].EtiquetaId == $scope.actividad[i].Etiqueta[j].EtiquetaId)
                    {
                        quitar = false;
                        break;
                    }
                }
                if(!quitar)
                {
                    break;
                }
            }
            
            if(quitar)
            {
                for(var i=0; i<$scope.etiquetaF.length; i++)
                {
                    if($scope.etiquetaF[i].EtiquetaId == $scope.borrarActividad.Etiqueta[k].EtiquetaId)
                    {
                        $scope.etiquetaF.splice(i,1);
                        break;
                    }
                }
            }
        }
         
        for(var k=0; k<$scope.borrarActividad.Tema.length; k++)
        {
            quitar = true;
            
            for(var i=0; i<$scope.actividad.length; i++)
            {
                for(var j=0; j<$scope.actividad[i].Tema.length; j++)
                {
                    if($scope.borrarActividad.Tema[k].TemaActividadId == $scope.actividad[i].Tema[j].TemaActividadId)
                    {
                        quitar = false;
                        break;
                    }
                }
                if(!quitar)
                {
                    break;
                }
            }
            
            if(quitar)
            {
                for(var i=0; i<$scope.temaF.length; i++)
                {
                    if($scope.temaF[i].TemaActividadId == $scope.borrarActividad.Tema[k].TemaActividadId)
                    {
                        $scope.temaF.splice(i,1);
                        break;
                    }
                }
            }
        }
         
     };
    
    //----------------Limpiar------------------
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarActividad = "";
                $("#buscarActividad").focus();
                break;
            case 2:
                $scope.nuevaActividad.Nombre = "";
                break;
            case 3:
                $scope.buscarTema = "";
                break;
            case 4:
                $scope.buscarEtiqueta = "";
                break;
            case 5:
                $scope.buscarEtiquetaFiltro = "";
                break;
            case 6:
                $scope.buscarTemaFiltro = "";
                break;
            case 7:
                $scope.buscarFrecuenciaFiltro = "";
                break;
            case 8:
                $scope.buscarFrecuenciaOperacion = "";
                break;
            case 9:
                $scope.buscarLugarOperacion = "";
                break;
            case 10:
                $scope.buscarPais = "";
                break;
            case 11:
                $scope.buscarEstado = "";
                break;
            case 12:
                $scope.buscarCiudad = "";
                break;
            default: 
                break;
        }
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
      
        if($scope.usuarioLogeado.Aplicacion != "Mis Actividades")
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $rootScope.CargarExterior = true;
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            $scope.GetActividad();
            $scope.GetTemaActividad();
            $scope.GetEtiqueta();
            $scope.GetFrecuencia();
            $scope.GetLugar();

            //evento
            $scope.GetCiudad();
            $scope.GetUnidad();
            $scope.GetDivisa();
            $scope.GetPersonaActividad();
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
    
    //-------- Agregar Nueva Frecuencia----------
    $scope.AbrirAgregarFrecuencia = function()
    {
        FRECUENCIA.AgregarFrecuencia();
    };
    
    $scope.$on('TerminarFrecuencia',function()
    {   
        $scope.mensaje = "Frecuencia Agregada";
        $scope.EnviarAlerta('Modal');
        
        $scope.CambiarFrecuencia(FRECUENCIA.GetFrecuencia());
        $scope.frecuencia.push(FRECUENCIA.GetFrecuencia());
    });
    
    //-------- Agregar Nueva Lugar----------
    $scope.AbrirAgregarLugar = function(objeto)
    {
        $scope.objetoLugar = objeto;
        LUGAR.AgregarLugar();
    };
    
    $scope.$on('TerminarLugar',function()
    {   
        $scope.mensaje = "Lugar Agregado";
        $scope.lugar.push(LUGAR.GetLugar());
        $scope.CambiarLugar(LUGAR.GetLugar(), $scope.objetoLugar);
        
        if($scope.objetoLugar == "Actividad")
        {
            $scope.EnviarAlerta('Modal');
        }
        else if($scope.objetoLugar == "Evento")
        {
            $scope.EnviarAlerta('Evento');
        }    
    });
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoActividad").alert();

            $("#alertaExitosoActividad").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoActividad").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoActividad").alert();

            $("#alertaEditarExitosoActividad").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoActividad").fadeOut();
            }, 2000);
        }
        else if('Evento')
        {
            $("#alertaEditarExitosoEvento").alert();

            $("#alertaEditarExitosoEvento").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoEvento").fadeOut();
            }, 2000);
        }
    };
    
    
    /*--------------------------------- Eventos de actividades ------------------------------------*/
   
    
    $scope.GetEventoActividad = function(id)              
    {
        GetEventoActividad($http, $q, CONFIG, id).then(function(data)
        {
            var eventoActividad = []; 
            for(var k=0; k<data.length; k++)
            {
                //Notas
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
            }
            
            $scope.eventoActividad = data;
            
            //$scope.GetPersonaEventoActividad(id);
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetPersonaEventoActividad = function(id)              
    {
        GetPersonaEventoActividad($http, $q, CONFIG, id).then(function(data)
        {
            
            if(data[0].Estatus == "Exito")
            {
                $scope.persoanaEvento = data[1].Persona;
            }
            else
            {
                $scope.persoanaEvento = [];
            }
            
            
            $scope.SetEventoActividadDatos();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetEventoActividadDatos =  function()
    {
        var sqlBase = "SELECT PersonaId, Nombre FROM ? WHERE EventoActividadId = '";
        var sql = ""; 
        
        for(var k=0; k<$scope.eventoActividad.length; k++)
        {
            sql = sqlBase + $scope.eventoActividad[k].EventoActividadId + "'";
            $scope.eventoActividad[k].Persona = alasql(sql, [$scope.persoanaEvento]);
        }
    
    };
    
    /*--------------------------- Operaciones -----------------------------*/
    
    $scope.VerDetallesEvento = function(evento)
    {
        $scope.GetEventoActividadPorId(evento.EventoActividadId, "Detalle");
        //$scope.detalleEvento = evento;
        $('#DetalleEvento').modal('toggle');
    };
    
    $scope.RegistrarEvento = function(operacion, actividad, evento)
    {
        $scope.operacion = operacion;
        $scope.modulo = "Evento";
        $scope.tabModal = "Evento";
        
        if($scope.operacion == "Agregar")
        {
            $scope.nuevoEvento = new EventoActividad();
            
            $scope.SetValoresDefecto(actividad);
            $scope.IniciarEvento(actividad);
            
            $scope.ActivarDesactivarTema([]);
            $scope.ActivarDesactivarEtiqueta([]);
            
            $scope.inicioEvento = jQuery.extend({}, $scope.nuevoEvento);
            $scope.$broadcast('IniciarArchivo', $scope.nuevoEvento);
        
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevoEvento, 'Evento');
        }
        else if($scope.operacion == "Editar" || $scope.operacion == "Copiar")
        {
            $scope.GetEventoActividadPorId(evento.EventoActividadId, operacion);
            
            $('#horaEvento').data("DateTimePicker").clear();
            document.getElementById("fechaEvento").value = evento.Fecha;
            document.getElementById("horaEvento").value = evento.Hora;
            
            $scope.hechoInicio = evento.Hecho;
            
            /*$scope.nuevoEvento = $scope.SetEvento(evento);
            
           

            if(evento.Ciudad.CiudadId !== null && evento.Ciudad.CiudadId !== undefined)
            {
                if(evento.Ciudad.CiudadId.length > 0)
                {
                    $scope.buscarCiudad = SetCiudad(evento.Ciudad);
                }
                else
                {
                    $scope.buscarCiudad = "";
                }
            }
            else
            {
                $scope.buscarCiudad = "";
            }
            
            $scope.ActivarDesactivarTema(evento.Tema);
            $scope.ActivarDesactivarEtiqueta(evento.Etiqueta);
            
            for(var k=0; k<evento.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta(evento.Imagen[k], false);
            }
            
            if($scope.operacion == "Copiar")
            {
                $scope.nuevoEvento.Hecho = "0";
            }*/
        }
        
        $('#modalEvento').modal('toggle');
    };
    
    $scope.SetValoresDefecto = function(actividad)
    {
        /*for(var k=0; k<$scope.ciudad.length; k++)
        {
            if($scope.ciudad[k].DiarioDefecto == "1")
            {
                $scope.buscarCiudad = SetCiudad($scope.ciudad[k]);
                $scope.nuevoEvento.Ciudad = SetCiudad($scope.ciudad[k]);
                break;
            }
        }*/

        for(var k=0; k<$scope.divisa.length; k++)
        {
            if($scope.divisa[k].PorDefecto == "1")
            {
                $scope.CambiarDivisa($scope.divisa[k]);
                break;
            }
        }
        
        $scope.nuevoEvento.Hora = actividad.Hora;
         $('#horaEvento').data("DateTimePicker").clear();
        document.getElementById("horaEvento").value = actividad.Hora;
    };
    
    $scope.IniciarEvento = function(actividad)
    {
        $scope.nuevoEvento.Actividad = actividad.Nombre;
        $scope.nuevoEvento.ActividadId = actividad.ActividadId;

        $scope.nuevoEvento.Fecha = GetDate();
        $scope.nuevoEvento.FechaFormato = TransformarFecha($scope.nuevoEvento.Fecha);
        
        $scope.nuevoEvento.Lugar = SetLugar($scope.detalle.Lugar);
        
        document.getElementById("fechaEvento").value = $scope.nuevoEvento.Fecha;
    };
    
    $scope.CerrarRegistrarEvento = function()
    {
        if(JSON.stringify($scope.inicioEvento) === JSON.stringify($scope.nuevoEvento))
        {
            $('#modalEvento').modal('toggle');
        }
        else
        {
            $('#cerrarActividad').modal('toggle');
            $scope.cerrarVentana = "evento";
        }
    };
    
    $('#fechaEvento').datetimepicker(
    {
        locale: 'es',
        format: 'YYYY-MM-DD',
    });

    $scope.CambiarFecha = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevoEvento.Fecha = element.value;
            $scope.nuevoEvento.FechaFormato = TransformarFecha(element.value);
            
            if($scope.nuevoEvento.Fecha > $scope.hoy)
            {
                $scope.nuevoEvento.Hecho = "0";
            }
        });
    };
    
    //----------- Hora -------------
    $('#horaEvento').datetimepicker(
    {
        format: 'hh:mm A',
        showClear: true,
        showClose: true,
        toolbarPlacement: 'bottom'
    });
    
    $scope.CambiarHoraEvento = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevoEvento.Hora = element.value;
        });
    };
    
    //----------------- Ciudad --------------
    
    document.getElementById('modalEvento').onclick = function(e) 
    {
        if($scope.mostrarLugar)
        {
            if(!(e.target.id == "lugarEventoPanel"  || $(e.target).parents("#lugarEventoPanel").size()))
            { 
                $scope.mostrarLugar = false;
                $scope.$apply();
            }
        }
        
        if($scope.mostrarPais)
        {
            if(!(e.target.id == "paisEventoPanel"  || $(e.target).parents("#paisEventoPanel").size()))
            { 
                $scope.mostrarPais = false;
                $scope.$apply();
            }
        }
        
        if($scope.mostrarEstado)
        {
            if(!(e.target.id == "estadoEventoPanel"  || $(e.target).parents("#estadoEventoPanel").size()))
            { 
                $scope.mostrarEstado = false;
                $scope.$apply();
            }
        }
        
        if($scope.mostrarCiudad)
        {
            if(!(e.target.id == "ciudadEventoPanel"  || $(e.target).parents("#ciudadEventoPanel").size()))
            { 
                $scope.mostrarCiudad = false;
                $scope.$apply();
            }
        }
        
    };
    
    $scope.MostrarPais = function()
    {
        $scope.mostrarPais = !$scope.mostrarPais;
    };
    
    $scope.MostrarEstado = function()
    {
        $scope.mostrarEstado = !$scope.mostrarEstado;
    };
    
    $scope.MostrarCiudad= function()
    {
        $scope.mostrarCiudad = !$scope.mostrarCiudad;
    };
    
    $scope.CambiarPais = function(pais)
    {
        if(pais === "")
        {
            $scope.nuevoEvento.Ciudad.Pais = "";
            $scope.nuevoEvento.Ciudad.Estado = "";
            $scope.nuevoEvento.Ciudad.Ciudad = "";
        }
        else if(pais != $scope.nuevoEvento.Ciudad.Pais)
        {
            $scope.nuevoEvento.Ciudad.Pais = pais;
            $scope.nuevoEvento.Ciudad.Estado = "";
            $scope.nuevoEvento.Ciudad.Ciudad = "";
        }
        
        $scope.mostrarPais = false;
    };
    
    $scope.CambiarEstado = function(estado)
    {
        if(estado != $scope.nuevoEvento.Ciudad.Estado)
        {
            $scope.nuevoEvento.Ciudad.Estado = estado;
            $scope.nuevoEvento.Ciudad.Ciudad = "";
        }
        
        $scope.mostrarEstado = false;
    };
    
    /*$scope.CambiarCiudad = function(ciudad)
    {
        $scope.nuevoEvento.Ciudad.CiudadId = ciudad.CiudadId;
        $scope.nuevoEvento.Ciudad.Ciudad = ciudad.Ciudad;
        
        
        $scope.mostrarCiudad = false;
    };*/
    
    //----- Vista -----
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

    $scope.AccionEvento = function(evento)
    {   
        $scope.eventoOpt = evento;
        
        if(evento.Hecho != "1")
        {
            $('#OperacionEvento').modal('toggle');
        }
        else
        {
            $scope.mensajeAdvertencia = "¿Estás seguro de que desea desmarcar como ya realizado este evento?";
            $('#CancelarEventoHecho').modal('toggle');
        }
    };
    
    $scope.HechoEvento = function()
    {
        var evento = {hecho: "", id:$scope.eventoOpt.EventoActividadId};
    
        $scope.eventoOpt.Hecho == "1" ? evento.hecho = "0" : evento.hecho = "1";
        
        HechoEvento($http, CONFIG, $q, evento).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.eventoOpt.Hecho = evento.hecho;
                
                for(var k=0; k<$scope.actividad.length; k++)
                {
                    if($scope.actividad[k].ActividadId == $scope.eventoOpt.ActividadId)
                    {
                        for(var i=0; i<$scope.actividad[k].EventoAux.length; i++)
                        {
                            if($scope.actividad[k].EventoAux[i].EventoActividadId == $scope.eventoOpt.EventoActividadId)
                            {
                                $scope.actividad[k].EventoAux[i].Hecho = $scope.eventoOpt.Hecho;
                                break;
                            }
                        }
                        
                        $scope.SetActividadEstatus($scope.actividad[k]);
                        break;
                    }
                }
                
                if(evento.hecho == "1")
                {
                    $scope.mensajeEvento = "¿Deseas registrar un próximo evento de  " + $scope.detalle.Nombre + "?";
                    $('#registrarEventoPregunta').modal('toggle');
                }
            }
            else
            {
                 $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde.";
                 $('#mensajeError').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeError').modal('toggle');
        });
    };
    
    //-------- Agregar Ciudad ----------
    $scope.AbrirAgregarCiudad = function()
    {
        //console.log("actividad");
        //$scope.campoCiudad = campo;
        //CIUDAD.AgregarCiudad($scope.nuevoEvento.Ciudad, 'Pais');
        CIUDAD.AgregarCiudad(new Ciudad(), "Pais");
    };
    
    $scope.$on('TerminarCiudad',function()
    {   
        $scope.mensaje = "Ciudad Agregada";
        
        var city = CIUDAD.GetCiudad();
        city.DiarioDefecto = "0";
        
        $scope.ciudad.push(city);
        $scope.buscarCiudad = city;
        $scope.nuevoEvento.Ciudad = SetCiudad(city);

        $scope.EnviarAlerta('Evento');
           
    });
    
    //----------------- Unidad -----------------------
    $scope.CambiarUnidad = function(unidad)
    {
        $scope.nuevoEvento.Unidad = unidad;
    };
    
    //-------- Agregar Unidad ----------
    $scope.AbrirAgregarUnidad = function()
    {
        UNIDAD.AgregarUnidad();
    };
    
    $scope.$on('TerminarUnidad',function()
    {   
        $scope.mensaje = "Unidad Agregada";
        
        var unidad = SetUnidad(UNIDAD.GetUnidad());
            
        $scope.unidad.push(unidad);
        $scope.CambiarUnidad(unidad);

        $scope.EnviarAlerta('Evento');
           
    });
    
    //------- Divisa- -----------------
    $scope.CambiarDivisa = function(divisa)
    {
        $scope.nuevoEvento.Divisa = divisa;
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
        $scope.CambiarDivisa(divisa);

        $scope.EnviarAlerta('Evento');
           
    });

    $scope.MostrarEvento = function(fechaevento)
    {
        if($scope.filtro.fecha.Fecha.length > 0 && !$scope.verTodos)
        {
            if(fechaevento == $scope.filtro.fecha.Fecha)
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
    
    //----------------- terminar evento actividad -------------------
    $scope.TerminarEventoActividad = function()
    {
        /*if(!$scope.ValidarActividad(actividadInvalida))
        {
            $('#mensajeActividad').modal('toggle');
            return;
        }
        else
        {*/
            $scope.AgregarEtiquetaOcultar('Evento');
        //}
    };
    
    $scope.SetNullHora = function(hora)
    {
        if(hora === null || hora === undefined)
        {
            return null;
        }
        else
        {
            if(hora.length == 0)
            {
                return null;
            }
            else
            {
                return hora;
            }
        }
    };
    
    $scope.AgregarEventoActividad = function()    
    {    
        (self.servicioObj = LifeService.File('AgregarEventoActividad', $scope.nuevoEvento)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var data = dataResponse.data;
                $scope.mensaje = "Evento agregado.";
                $scope.EnviarAlerta('Vista');
                
                $scope.nuevoEvento.EventoActividadId = data[1].Id;
                $scope.nuevoEvento.Etiqueta = data[2].Etiqueta;  
                $scope.nuevoEvento.Tema = data[3].Tema;
                $scope.nuevoEvento.Imagen = data[4].Imagen;  
                
                $scope.SetNuevoEvento($scope.nuevoEvento);
        
                $('#modalEvento').modal('toggle');
                
                if( $scope.nuevoEvento.Hecho == "1")
                {
                    $scope.mensajeEvento = "¿Deseas registrar un próximo evento de  " + $scope.detalle.Nombre + "?";
                    $('#registrarEventoPregunta').modal('toggle');
                }

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
        
        /*AgregarEventoActividad($http, CONFIG, $q, $scope.nuevoEvento).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.mensaje = "Evento agregado.";
                $scope.EnviarAlerta('Vista');
                
                $scope.nuevoEvento.EventoActividadId = data[1].Id;
                $scope.nuevoEvento.Etiqueta = data[2].Etiqueta;  
                $scope.nuevoEvento.Tema = data[3].Tema;
                $scope.nuevoEvento.Imagen = data[4].Imagen;  
                
                $scope.SetNuevoEvento($scope.nuevoEvento);
        
                $('#modalEvento').modal('toggle');
                
                if( $scope.nuevoEvento.Hecho == "1")
                {
                    $scope.mensajeEvento = "¿Deseas registrar un próximo evento de  " + $scope.detalle.Nombre + "?";
                    $('#registrarEventoPregunta').modal('toggle');
                }
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeError').modal('toggle');
            }
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeError').modal('toggle');
        });*/
    };
    
    $scope.EditarEventoActividad = function()    
    {
        (self.servicioObj = LifeService.File('EditarEventoActividad', $scope.nuevoEvento)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var data = dataResponse.data;
                $scope.mensaje = "Evento editado.";
                
                $scope.nuevoEvento.Etiqueta = data[1].Etiqueta;  
                $scope.nuevoEvento.Tema = data[2].Tema;
                $scope.nuevoEvento.Imagen = data[3].Imagen;  
                
                $scope.SetNuevoEvento($scope.nuevoEvento);
                $scope.EnviarAlerta('Vista');
                
                $('#modalEvento').modal('toggle');
                
                if( $scope.nuevoEvento.Hecho == "1" && $scope.hechoInicio == "0")
                {
                    $scope.mensajeEvento = "¿Deseas registrar un próximo evento de  " + $scope.detalle.Nombre + "?";
                    $('#registrarEventoPregunta').modal('toggle');
                }
                                
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
        
        /*EditarEventoActividad($http, CONFIG, $q, $scope.nuevoEvento).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {   
                $scope.mensaje = "Evento editado.";
                
                $scope.nuevoEvento.Etiqueta = data[1].Etiqueta;  
                $scope.nuevoEvento.Tema = data[2].Tema;
                $scope.nuevoEvento.Imagen = data[3].Imagen;  
                
                $scope.SetNuevoEvento($scope.nuevoEvento);
                $scope.EnviarAlerta('Vista');
                
                $('#modalEvento').modal('toggle');
                
                if( $scope.nuevoEvento.Hecho == "1" && $scope.hechoInicio == "0")
                {
                    $scope.mensajeEvento = "¿Deseas registrar un próximo evento de  " + $scope.detalle.Nombre + "?";
                    $('#registrarEventoPregunta').modal('toggle');
                }
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeError').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeError').modal('toggle');
        });*/
    };
    
    $scope.SetNuevoEvento = function(evento)
    {
        var sqlBase = "SELECT COUNT(*) as num FROM ? WHERE TemaActividadId= '";
        //tema
        for(var k=0; k<evento.Tema.length; k++)
        {
            sql = sqlBase + evento.Tema[k].TemaActividadId + "'";

            count = alasql(sql, [$scope.tema]);
            
            if(count[0].num === 0)
            {
                evento.Tema[k].filtro = true;
               $scope.tema.push(evento.Tema[k]);
            }
        }
        
        //etiqueta
        sqlBase = "SELECT COUNT(*) as num FROM ? WHERE EtiquetaId= '";
        for(var k=0; k<evento.Etiqueta.length; k++)
        {
            sql = sqlBase + evento.Etiqueta[k].EtiquetaId + "'";
            
            //etiqueta Dropdownlist
            count = alasql(sql, [$scope.etiqueta]);
            
            if(count[0].num === 0)
            {
               evento.Etiqueta[k].filtro = true;
               $scope.etiqueta.push(evento.Etiqueta[k]);
            }
        }
        
        //imagen
        if($scope.fototeca.length > 0)
        {
            sqlBase = "SELECT COUNT(*) as num FROM ? WHERE ImagenId= '";
            for(var k=0; k<evento.Imagen.length; k++)
            {
                sql = sqlBase + evento.Imagen[k].ImagenId + "'";

                //etiqueta Dropdownlist
                count = alasql(sql, [$scope.fototeca]);

                if(count[0].num === 0)
                {
                   $scope.fototeca.push(evento.Imagen[k]);
                }
            }
        }
        
        if($scope.operacion == "Agregar" || $scope.operacion == "Copiar")
        {
            var nuevoEvento = $scope.SetEvento(evento);
            $scope.eventoActividad.push(nuevoEvento);
        }
        else if($scope.operacion == "Editar")
        {
            
            for(var k=0; k<$scope.eventoActividad.length; k++)
            {
                if($scope.eventoActividad[k].EventoActividadId == evento.EventoActividadId)
                {          
                    $scope.eventoActividad[k] = $scope.SetEvento(evento);
                    
                    break;
                }
            }
        }
        
        //Divisa Defecto
        if(evento.Divisa.DivisaId.length > 0)
        {
            for(var k=0; k<$scope.divisa.length; k++)
            {
                if(evento.Divisa.DivisaId == $scope.divisa[k].DivisaId)
                {
                    $scope.divisa[k].PorDefecto = "1";
                }
                else
                {
                    $scope.divisa[k].PorDefecto = "0";
                }
            }
        }
        
        $scope.GetActividad();
    };
    
    $scope.SetEvento = function(data)
    {
        var evento = new EventoActividad();
    
        evento.EventoActividadId = data.EventoActividadId;
        evento.Fecha = data.Fecha;
        evento.FechaFormato = data.FechaFormato;
        evento.Hora = data.Hora;
        evento.HoraFormato = $scope.SetHora(data.Hora);
        evento.ActividadId = data.ActividadId;
        evento.Actividad = data.Actividad;
        evento.Costo = data.Costo;
        evento.Cantidad = data.Cantidad;
        evento.Imagen = data.Imagen;
        
        evento.Hecho = data.Hecho;
        evento.FechaHecho = data.FechaHecho;

        if(data.Notas !== null && data.Notas !== undefined)
        {
             evento.Notas = data.Notas;
             evento.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
        }
        else
        {
             evento.Notas = ""; 
             evento.NotasHTML = "";     
        }
        
        evento.NotasHTML = $sce.trustAsHtml(evento.NotasHTML);

        if(data.Ciudad.CiudadId !== null)
        {
            evento.Ciudad.CiudadId = data.Ciudad.CiudadId;
            evento.Ciudad.Ciudad = data.Ciudad.Ciudad;
            evento.Ciudad.Estado = data.Ciudad.Estado;
            evento.Ciudad.Pais = data.Ciudad.Pais;
            evento.Ciudad.AbreviacionPais = data.Ciudad.AbreviacionPais;
        }

        if(data.Lugar.LugarId !== null)
        {
            evento.Lugar.LugarId = data.Lugar.LugarId;
            evento.Lugar.Nombre = data.Lugar.Nombre;
        }

        if(data.Unidad.UnidadId !== null)
        {
            evento.Unidad.UnidadId = data.Unidad.UnidadId;
            evento.Unidad.Unidad = data.Unidad.Unidad;
        }

        if(data.Divisa.DivisaId !== null)
        {
            evento.Divisa.DivisaId = data.Divisa.DivisaId;
            evento.Divisa.Divisa = data.Divisa.Divisa;
        }
        
        evento.EtiquetaVisible = [];
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            var etiqueta = new Etiqueta();
            etiqueta.EtiquetaId = data.Etiqueta[k].EtiquetaId;
            etiqueta.Nombre = data.Etiqueta[k].Nombre;
            etiqueta.Visible = data.Etiqueta[k].Visible;
            etiqueta.count = data.Etiqueta[k].count;
            
            evento.Etiqueta.push(etiqueta);
            
            if(data.Etiqueta[k].Visible)
            {
                evento.EtiquetaVisible.push(etiqueta);
            }
        }
        
        for(var k=0; k<data.Tema.length; k++)
        {
            var tema = new Etiqueta();
            tema.TemaActividadId = data.Tema[k].TemaActividadId;
            tema.Tema = data.Tema[k].Tema;
            
            evento.Tema.push(tema);
        }
            
        return evento;    
    };
    
    $scope.SetHora = function(hora)
    {
        if(hora === null || hora === undefined)
        {
            hora = null;
        }
        else
        {
            if(hora.length == 0)
            {
                hora = null;
            }
            else
            {
                hora = convertTo24Hour(hora);
            }
        }
        return hora;
    };
    
    //------------ Borrar evento actividad
    $scope.BorrarEventoActividad = function(evento)
    {
        $scope.borrarEventoActividad = evento;

        $scope.mensajeBorrar = "¿Estas seguro de eliminar el evento del " + evento.FechaFormato + "?";

        $("#borrarEventoActividad").modal('toggle');
        
    };
    
    $scope.ConfirmarBorrarEventoActividad = function()
    {
        BorrarEventoActividad($http, CONFIG, $q, $scope.borrarEventoActividad.EventoActividadId).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {                
                for(var k=0; k<$scope.eventoActividad.length; k++)
                {
                    if($scope.eventoActividad[k].EventoActividadId == $scope.borrarEventoActividad.EventoActividadId)
                    {   
                        $scope.eventoActividad.splice(k,1);
                        break;
                    }
                }
                
                $scope.GetActividad();
                
                $scope.mensaje = "Evento borrado.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeError').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeError').modal('toggle');
        });
    };
    
    //---------------------- Fototeca ----------------------------
    $scope.AbrirFototeca = function()
    {
        $scope.imgFototeca = [];
        
        if($scope.fototeca.length === 0)
        {
            $scope.GetGaleriaFotos();
        }
        else
        {
            for(var k=0; k<$scope.fototeca.length; k++)
            {
                $scope.fototeca[k].Seleccionada = false;
            }
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
                for(var i=0; i<$scope.nuevoEvento.Imagen.length; i++)
                {
                    if($scope.nuevoEvento.Imagen[i].ImagenId == $scope.fototeca[k].ImagenId)
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
                        $scope.lastIndex = $scope.nuevoEvento.Imagen.length + 1;
                    }
                    
                    $scope.nuevoEvento.Imagen.push($scope.fototeca[k]);
                }
            }
        }
        
        $('#fototeca').modal('toggle');
    };
    
    $scope.SetEtiquetaImagenEvento = function(imagen, etiqueta)
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
    
    $scope.SetTemaImagenEvento = function(imagen, tema)
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
        $scope.mensaje = "Imagen Etiquetada";
        $scope.EnviarAlerta('Modal');
        
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
            var index = 0;
            
            if($scope.nuevoEvento.Imagen.length === 0)
            {
                index = 1;
            }
            
            for(var k=1; k<$scope.nuevoEvento.Imagen.length; k++)
            {
                $scope.SetTemaImagenEvento($scope.nuevoEvento.Imagen[k], $scope.temaAgregar);
            }
            
            for(var i=index; i<$scope.nuevoEvento.ImagenSrc.length; i++)
            {
                $scope.SetTemaImagenEvento($scope.nuevoEvento.ImagenSrc[i], $scope.temaAgregar);
            }
        }
        else if(opt == "opt")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevoEvento.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta($scope.nuevoEvento.Imagen[k]);
            }
        }
        else if(opt == "src")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevoEvento.ImagenSrc.length; k++)
            {
                $scope.SetTemaImagenEvento($scope.nuevoEvento.ImagenSrc[k], $scope.nuevoEvento.Tema);
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
        if($scope.modulo == "Evento")
        {
            $scope.SetEtiquetaTodasImagenes(ETIQUETA.GetEtiqueta());
        }
    });
    
    $scope.SetEtiquetaTodasImagenes = function(etiqueta)
    {
        var e = [];
        e[0] = etiqueta;

        for(var i=0; i<$scope.nuevoEvento.Imagen.length; i++)
        {
            $scope.SetEtiquetaImagenEvento($scope.nuevoEvento.Imagen[i], e);
        }
        
        for(var i=0; i<$scope.nuevoEvento.ImagenSrc.length; i++)
        {
            $scope.SetEtiquetaImagenEvento($scope.nuevoEvento.ImagenSrc[i], e);
        }
    };
    
    $scope.$on('TemaSet',function(etiqueta)
    {
        if($scope.modulo == "Evento")
        {
            $scope.todasImg = "tema";
            $scope.SetTemaTodasImagenes(ETIQUETA.GetEtiqueta());
        }
    });
    
    $scope.SetTemaTodasImagenes = function(tema)
    {
        var e = [];
        e[0] = tema;
        
        $scope.temaAgregar = e;
        
        if($scope.nuevoEvento.Imagen.length > 0)
        {
            $scope.SetTemaImagenEvento($scope.nuevoEvento.Imagen[0], e);
        }
        else if($scope.nuevoEvento.ImagenSrc.length > 0)
        {
            $scope.SetTemaImagenEvento($scope.nuevoEvento.ImagenSrc[0], e);
        }
    };
    
    $scope.$on('QuitarEtiqueta',function(evento, etiqueta)
    {
        for(var i=0; i<$scope.nuevoEvento.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevoEvento.Imagen[i].Etiqueta.length; j++)
            {
                if($scope.nuevoEvento.Imagen[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevoEvento.Imagen[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevoEvento.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevoEvento.ImagenSrc[i].Etiqueta.length; j++)
            {
                if($scope.nuevoEvento.ImagenSrc[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevoEvento.ImagenSrc[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
    });
    
    $scope.$on('QuitarTema',function(evento, tema)
    {
        for(var i=0; i<$scope.nuevoEvento.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevoEvento.Imagen[i].Tema.length; j++)
            {
                if($scope.nuevoEvento.Imagen[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevoEvento.Imagen[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevoEvento.Imagen[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevoEvento.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevoEvento.ImagenSrc[i].Tema.length; j++)
            {
                if($scope.nuevoEvento.ImagenSrc[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevoEvento.ImagenSrc[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevoEvento.ImagenSrc[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
    });
    
    
    //Imagenes de archivo
    function ImagenSeleccionada(evt) 
    {
        var files = evt.target.files;
        
        $scope.index = $scope.nuevoEvento.ImagenSrc.length;
        $scope.lastIndex = $scope.nuevoEvento.ImagenSrc.length + 1;
        $scope.srcSize = $scope.nuevoEvento.ImagenSrc.length + files.length;
        
        
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
                    var compressor = new Compress();
                    
                    compressor.compress([theFile], {
                        size: 10,
                        quality: 1,
                        maxWidth: 250,
                        maxHeight: 150,
                        resize: true
                    }).then((result) => {

                        $scope.nuevoEvento.ImagenTh.push((Compress.convertBase64ToFile(result[0].data, result[0].ext)));

                    });
                    
                    var compressor2 = new Compress();
                    
                    compressor2.compress([theFile], {
                        size: 10,
                        quality: 0.4,
                        maxWidth: 1000,
                        maxHeight: 1000,
                        resize: false
                    }).then((result) => {

                        $scope.nuevoEvento.ImagenWeb.push(Compress.convertBase64ToFile(result[0].data, result[0].ext));

                    });
                    
                    $scope.nuevoEvento.ImagenSrc.push(theFile);
                    $scope.nuevoEvento.ImagenSrc[$scope.nuevoEvento.ImagenSrc.length-1].Src= (e.target.result);
                    $scope.nuevoEvento.ImagenSrc[$scope.nuevoEvento.ImagenSrc.length-1].Etiqueta = [];
                    $scope.nuevoEvento.ImagenSrc[$scope.nuevoEvento.ImagenSrc.length-1].Tema = [];

                    if( $scope.srcSize === $scope.nuevoEvento.ImagenSrc.length)
                    {
                        $scope.todasImg = "src";
                        $scope.SetTemaImagenEvento($scope.nuevoEvento.ImagenSrc[$scope.index], $scope.nuevoEvento.Tema);
                    }
                    
                    $scope.SetEtiquetaImagenEvento($scope.nuevoEvento.ImagenSrc[$scope.nuevoEvento.ImagenSrc.length-1], $scope.nuevoEvento.Etiqueta);
                    
                    $scope.$apply();
                };
                
            })(f);
            
            
            reader.readAsDataURL(f);
        }
         document.getElementById('cargarImagen').value = "";
    }
 
    document.getElementById('cargarImagen').addEventListener('change', ImagenSeleccionada, false);
    
    autosize($('textarea'));
    
    //----------- Archivos --------
    $(document).on('hide.bs.modal','#EtiquetaFile', function () 
    {
        $scope.ActivarDesactivarTema($scope.nuevoEvento.Tema);
        $scope.ActivarDesactivarEtiqueta($scope.nuevoEvento.Etiqueta);
    });
    
    
});
