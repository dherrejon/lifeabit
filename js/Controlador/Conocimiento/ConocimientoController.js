app.controller("ConocimientoController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, LifeService, IMAGEN, ETIQUETA)
{   
    $scope.buscarConceptoBarra = "";
    $scope.filtro = {etiqueta: [], tema: []};
    $scope.verFiltro = true;
    $scope.conocimiento = [];
    $scope.fototeca = [];
    
    $scope.vercon2 = "";
    $scope.vercon = "";
    
    $scope.tabModal = "";

    //------------------ Catálogos ----------------------------
    $scope.GetConocimiento = function()
    {
        if(($scope.filtro.tema.length + $scope.filtro.etiqueta.length) > 0 )
        {
             $scope.filtro.usuarioId = $rootScope.UsuarioId;
            (self.servicioObj = LifeService.Post('GetConocimiento', $scope.filtro )).then(function (dataResponse) 
            {
                if (dataResponse.status == 200) 
                {
                    $scope.conocimiento = dataResponse.data;

                    for(var k=0; k<$scope.conocimiento.length; k++)
                    {
                        $scope.conocimiento[k].InformacionHtml = $scope.conocimiento[k].Informacion.replace(/\r?\n/g, "<br>");;
                        $scope.conocimiento[k].InformacionHtml = $sce.trustAsHtml($scope.conocimiento[k].InformacionHtml);
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
        }
        else
        {
            $scope.conocimiento = [];
        }
    };
    
    
    $scope.GetConocimientoPorId = function(conocimiento, opt)
    {
        (self.servicioObj = LifeService.Get('GetConocimientoPorId/' + conocimiento.ConocimientoId)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.OperacionConocimiento(dataResponse.data, opt);
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
    
    $scope.OperacionConocimiento = function(conocimiento, opt)
    {
        if(opt == "Editar" || opt == "Copiar")
        {            
            $scope.nuevoConocimiento = SetConocimiento(conocimiento);
            
            $scope.ActivarDesactivarTema(conocimiento.Tema);
            $scope.ActivarDesactivarEtiqueta(conocimiento.Etiqueta);
            
            $scope.conocimientoInicio = jQuery.extend({}, $scope.nuevoConocimiento);
            
            for(var k=0; k<$scope.nuevoConocimiento.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta($scope.nuevoConocimiento.Imagen[k], false);
            }
            
            $scope.$broadcast('IniciarArchivo', $scope.nuevoConocimiento);
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevoConocimiento, 'Conocimiento');
        }
        else if(opt == "Detalle")
        {
            $scope.detalle = SetConocimiento(conocimiento);
            $scope.detalle.InformacionHTML = $sce.trustAsHtml($scope.detalle.InformacionHTML);
            $scope.detalle.ObservacionHTML = $sce.trustAsHtml($scope.detalle.ObservacionHTML);
            $scope.detalle.iActive = 0;
            
            $scope.GetCarroselIntervalo();
            $scope.CambiarIndiceDetalle(0, $scope.detalle);
            
            $scope.GetEtiquetaVisible($scope.detalle);
            
            $('#detalleConocimiento').modal('toggle');
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
                $scope.SetTemaImagenPendiente(imagen, $scope.nuevoConocimiento.Tema);
                $scope.SetEtiquetaImagenPendiente(imagen, $scope.nuevoConocimiento.Etiqueta);
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
                $scope.GetConocimiento();
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
                $scope.GetConocimiento();
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
                        $scope.GetConocimiento();
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
                        $scope.GetConocimiento();
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
        
        $scope.GetConocimiento();
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
        
        $scope.GetConocimiento();
        
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
        
        $scope.GetConocimiento();
    };
    
    //-------- vista principal --------
    $scope.VerOpt = function(id)
    {
        if($scope.vercon != id)
        {
            $scope.vercon2 = $scope.vercon;
            $scope.vercon = id;
            
            setTimeout(function()
            {
                 $scope.vercon2 = "";
                $scope.$apply();
            }, 700);
        }
    };
    
    document.getElementById('conocimientoform').onclick = function(e) 
    {   
        if($scope.vercon)
        {
            if(e.target.id != "opt" && $(e.target).parents("#opt").size() == 0)
            { 
                $scope.vercon2 = $scope.vercon;
                $scope.vercon = "";
                $scope.$apply();
                
                setTimeout(function()
                {
                     $scope.vercon2 = "";
                    $scope.$apply();
                }, 700);
            }
        }        
    };
    
    $scope.VerConocimiento = function(conocimiento)
    {
        $scope.detalle = new Conocimiento();
        $scope.GetConocimientoPorId(conocimiento, "Detalle");
    };
    
      $scope.CambiarIndiceDetalle = function(val, conoccimiento)
    {
        var min = 0;
        var max = 0;
        
        
        if(conoccimiento.iActive + val < 0)
        {
            conoccimiento.iActive = conoccimiento.Imagen.length -1;
        }
        else if(conoccimiento.iActive + val >= conoccimiento.Imagen.length)
        {
            conoccimiento.iActive = 0;
        }
        else
        {
           conoccimiento.iActive += val; 
        }
        
        min = conoccimiento.iActive;
        max = min + $scope.carroselIntervalo;
        
        conoccimiento.iImg = [];
        for(var i=min; i<max; i++)
        {
            if(i<conoccimiento.Imagen.length)
            {
                conoccimiento.iImg.push(i);
            }
            else
            {
                conoccimiento.iImg.push(i-conoccimiento.Imagen.length);
            }
            
            if(conoccimiento.iImg.length >= conoccimiento.Imagen.length)
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
    
    
    //----------------------- Abrir conocimiento ------------------------
    $scope.AbrirConocimiento = function(operacion, objeto)
    {
        $scope.operacion = operacion;
        $scope.tabModal = "Datos";
        $scope.nuevoConocimiento = new Conocimiento();
        $scope.etiquetaSugerida = [];
        
        if($scope.operacion == "Agregar")
        {
            $scope.ActivarDesactivarTema([]);
            $scope.ActivarDesactivarEtiqueta([]);
            
            $scope.$broadcast('IniciarArchivo', $scope.nuevoConocimiento);
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevoConocimiento, 'Conocimiento');
            $scope.conocimientoInicio = jQuery.extend({}, $scope.nuevoConocimiento);
        }
        else if($scope.operacion == "Editar")
        {
            $scope.GetConocimientoPorId(objeto, "Editar");
        }
        
        $('#modalApp').modal('toggle');
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
    
     //--Etiquetas Sugeridas
    $scope.CrearEtiquetaSugerida = function()
    {
        if($scope.nuevoConocimiento.Titulo)
        {
            $scope.etiquetaSugerida = $scope.nuevoConocimiento.Titulo.split(" ");
            $scope.temaSugerido = [];

            for(var k=0; k<$scope.etiquetaSugerida.length; k++)
            {
                if($scope.etiquetaSugerida[k] === "")
                {
                    $scope.etiquetaSugerida.splice(k,1);
                    k--;
                    continue;
                }

                for(var i=0; i<$scope.nuevoConocimiento.Etiqueta.length; i++)
                {
                    if($scope.nuevoConocimiento.Etiqueta[i].Nombre.toLowerCase() == $scope.etiquetaSugerida[k].toLowerCase())
                    {
                        if($scope.nuevoConocimiento.Etiqueta[i].Visible)
                        {
                            $scope.etiquetaSugerida.splice(k,1);
                            k--;
                        }

                        break;
                    }
                }
            }
        }
        else
        {
            $scope.temaSugerido = [];
            $scope.etiquetaSugerida = [];
        }
    };
    
    $scope.AgregarEtiquetaSugerida = function(etiqueta, k)
    {
        if($rootScope.erEtiqueta.test(etiqueta))
        {
            $scope.$broadcast('AgregarEtiquetaSugerida', $scope.etiqueta, $scope.tema, $scope.nuevoConocimiento, 'Conocimiento', etiqueta);
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
    
    //----------------------- terminar ---------------
    $scope.TerminarConocimiento = function()
    {
        if(!$scope.ValidarConocimiento())
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
        for(var k=0; k<$scope.nuevoConocimiento.Etiqueta.length; k++)
        {
            if(!$scope.nuevoConocimiento.Etiqueta[k].Visible)
            {
                $scope.nuevoConocimiento.Etiqueta.splice(k,1);
                k--;
            }
        }
    };
    
    $scope.AgregarEtiquetaOcultar = function()
    {
        $scope.$broadcast('SepararEtiqueta', $scope.nuevoConocimiento.Tema, 'Conocimiento');
    };
    
    
    $scope.$on('TerminarEtiquetaOculta',function(evento, modal)
    {    
        if(modal == "Conocimiento")
        {
            $rootScope.$broadcast('EtiquetaOcultaArchivoIniciar', $scope.nuevoConocimiento);
        }
        
    });
    
    $scope.$on('TerminarEtiquetaOcultaArchivo',function()
    {   
        $scope.nuevoConocimiento.UsuarioId = $rootScope.UsuarioId;

        
        if($scope.operacion == "Agregar" )
        {
            $scope.AgregarConocimiento();
        }
        else if($scope.operacion == "Editar")
        {   
            $scope.EditarConocimiento();
        }
    });
    
    $scope.AgregarConocimiento = function()
    {
        (self.servicioObj = LifeService.File('AgregarConocimiento', $scope.nuevoConocimiento)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.GetConocimiento();
                $('#modalApp').modal('toggle');
                $rootScope.$broadcast('Alerta', 'El conocimiento se agrego.','exito');
                                
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
    
    $scope.EditarConocimiento = function()
    {
        (self.servicioObj = LifeService.File('EditarConocimiento', $scope.nuevoConocimiento)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.GetConocimiento();
                $('#modalApp').modal('toggle');
                $rootScope.$broadcast('Alerta', 'El conocimiento se edito.','exito');
                                
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
    
    $scope.ValidarConocimiento = function()
    {
        $scope.mensajeError = [];
        
        if(!$scope.nuevoConocimiento.Titulo)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Indica el título.";
        }
        
        if(!$scope.nuevoConocimiento.Informacion)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe la información.";
        }
        
        if(($scope.nuevoConocimiento.Etiqueta.length + $scope.nuevoConocimiento.Tema.length) < 1)
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
    
    
    //------------- Borrar ----------------
    $scope.BorrarConocimiento = function(conocimiento)
    {
        $scope.borrarConocimiento = conocimiento;

        $scope.mensajeBorrar = "¿Estas seguro de eliminar el conocimiento \"" + conocimiento.Titulo + "\"?";

        $("#borrarConocimiento").modal('toggle');
    };
    
    $scope.ConfirmarBorrarConocimiento = function()
    {
        (self.servicioObj = LifeService.Delete('BorrarConocimiento', $scope.borrarConocimiento.ConocimientoId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                for(var k=0; k<$scope.conocimiento.length; k++)
                {
                    if($scope.conocimiento[k].ConocimientoId == $scope.borrarConocimiento.ConocimientoId)
                    {
                        $scope.conocimiento.splice(k,1); 
                        break;
                    }
                }
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
    
    
    //--------------------- Cerrar ----------------
    $scope.CerrarConocimiento = function()
    {
        if(JSON.stringify($scope.nuevoConocimiento) === JSON.stringify($scope.conocimientoInicio))
        {
            $('#modalApp').modal('toggle');
        }
        else
        {
            $('#cerraConocimiento').modal('toggle');
        }
       
    };
    
    $scope.ConfirmarCerrarConocimiento = function()
    {
        $('#modalApp').modal('toggle');
        $scope.mensajeError = [];
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
                for(var i=0; i<$scope.nuevoConocimiento.Imagen.length; i++)
                {
                    if($scope.nuevoConocimiento.Imagen[i].ImagenId == $scope.fototeca[k].ImagenId)
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
                        $scope.lastIndex = $scope.nuevoConocimiento.Imagen.length + 1;
                    }
                    
                    $scope.nuevoConocimiento.Imagen.push($scope.fototeca[k]);
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
        
        $scope.index = $scope.nuevoConocimiento.ImagenSrc.length;
        $scope.lastIndex = $scope.nuevoConocimiento.ImagenSrc.length + 1;
        $scope.srcSize = $scope.nuevoConocimiento.ImagenSrc.length + files.length;
        
        
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
                    $scope.nuevoConocimiento.ImagenSrc.push(theFile);
                    $scope.nuevoConocimiento.ImagenSrc[$scope.nuevoConocimiento.ImagenSrc.length-1].Src= (e.target.result);
                    $scope.nuevoConocimiento.ImagenSrc[$scope.nuevoConocimiento.ImagenSrc.length-1].Etiqueta = [];
                    $scope.nuevoConocimiento.ImagenSrc[$scope.nuevoConocimiento.ImagenSrc.length-1].Tema = [];

                    if( $scope.srcSize === $scope.nuevoConocimiento.ImagenSrc.length)
                    {
                        $scope.todasImg = "src";
                        $scope.SetTemaImagenPendiente($scope.nuevoConocimiento.ImagenSrc[$scope.index], $scope.nuevoConocimiento.Tema);
                    }
                    
                    $scope.SetEtiquetaImagenPendiente($scope.nuevoConocimiento.ImagenSrc[$scope.nuevoConocimiento.ImagenSrc.length-1], $scope.nuevoConocimiento.Etiqueta);
                    
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
            for(var k=1; k<$scope.nuevoConocimiento.Imagen.length; k++)
            {
                $scope.SetTemaImagenPendiente($scope.nuevoConocimiento.Imagen[k], $scope.temaAgregar);
            }
            
            for(var i=1; i<$scope.nuevoConocimiento.ImagenSrc.length; i++)
            {
                $scope.SetTemaImagenPendiente($scope.nuevoConocimiento.ImagenSrc[i], $scope.temaAgregar);
            }
        }
        else if(opt == "opt")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevoConocimiento.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta($scope.nuevoConocimiento.Imagen[k]);
            }
        }
        else if(opt == "src")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevoConocimiento.ImagenSrc.length; k++)
            {
                $scope.SetTemaImagenPendiente($scope.nuevoConocimiento.ImagenSrc[k], $scope.nuevoConocimiento.Tema);
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

        for(var i=0; i<$scope.nuevoConocimiento.Imagen.length; i++)
        {
            $scope.SetEtiquetaImagenPendiente($scope.nuevoConocimiento.Imagen[i], e);
        }
        
        for(var i=0; i<$scope.nuevoConocimiento.ImagenSrc.length; i++)
        {
            $scope.SetEtiquetaImagenPendiente($scope.nuevoConocimiento.ImagenSrc[i], e);
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
        
        if($scope.nuevoConocimiento.Imagen.length > 0)
        {
            $scope.SetTemaImagenPendiente($scope.nuevoConocimiento.Imagen[0], e);
        }
        else if($scope.nuevoConocimiento.ImagenSrc.length > 0)
        {
            $scope.SetTemaImagenPendiente($scope.nuevoConocimiento.ImagenSrc[0], e);
        }
    };
    
    $scope.$on('QuitarEtiqueta',function(nota, etiqueta)
    {
        for(var i=0; i<$scope.nuevoConocimiento.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevoConocimiento.Imagen[i].Etiqueta.length; j++)
            {
                if($scope.nuevoConocimiento.Imagen[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevoConocimiento.Imagen[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevoConocimiento.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevoConocimiento.ImagenSrc[i].Etiqueta.length; j++)
            {
                if($scope.nuevoConocimiento.ImagenSrc[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevoConocimiento.ImagenSrc[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
    });
    
    $scope.$on('QuitarTema',function(nota, tema)
    {
        for(var i=0; i<$scope.nuevoConocimiento.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevoConocimiento.Imagen[i].Tema.length; j++)
            {
                if($scope.nuevoConocimiento.Imagen[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevoConocimiento.Imagen[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevoConocimiento.Imagen[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevoConocimiento.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevoConocimiento.ImagenSrc[i].Tema.length; j++)
            {
                if($scope.nuevoConocimiento.ImagenSrc[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevoConocimiento.ImagenSrc[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevoConocimiento.ImagenSrc[i], $scope.etiqueta, $scope.tema);
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
    
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        if($scope.usuarioLogeado.Aplicacion != "Mi Conocimiento")
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            $scope.GetTemaActividad();
            $scope.GetEtiqueta();
            $scope.GetConocimiento();
            
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
    
    //------- archivos -----
    $(document).on('hide.bs.modal','#EtiquetaFile', function () 
    {
        $scope.ActivarDesactivarTema($scope.nuevoConocimiento.Tema);
        $scope.ActivarDesactivarEtiqueta($scope.nuevoConocimiento.Etiqueta);
    });
    
});
