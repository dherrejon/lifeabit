app.controller("ArchivoAppController", function($scope, $window, $http, $rootScope, $q, CONFIG, LifeService, $location, $sce, ETIQUETA, IMAGEN, datosUsuario)
{   
    $scope.buscarConceptoBarra = "";
    $scope.filtro = {etiqueta: [], tema: []};
    $scope.verFiltro = true;
    $scope.archivo = [];
    $scope.buscar = false;
    
    $scope.verpen = "";
    $scope.verpen2 = "";

    
    /*------- Catálogos Base ---------------*/
    $scope.GetArchivo = function()
    {
         $scope.filtro.usuarioId = $rootScope.UsuarioId;
        
        (self.servicioObj = LifeService.Post('GetArchivoApp', $scope.filtro )).then(function (dataResponse) 
        {
            $scope.buscar = true;
            if (dataResponse.status == 200) 
            {
                $scope.archivo = dataResponse.data;
                
            } else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
                $scope.archivo = [];
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
        
        
    };
    
    $scope.GetNumeroArchivo = function()
    {
        (self.servicioObj = LifeService.Get('GetNumeroArchivo/' + $rootScope.UsuarioId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.NumeroArchivo = parseInt(dataResponse.data);

            } else 
            {
                $scope.NumeroArchivo = 0;
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.GetNumeroArchivoPorConcepto = function()
    {
        (self.servicioObj = LifeService.Get('GetNumeroArchivoPorConcepto/' + $rootScope.UsuarioId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.conceptoArchivo = dataResponse.data;

            } else 
            {
                $scope.conceptoArchivo = [];
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $scope.conceptoArchivo = [];
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.GetEtiquetaPorArchivo = function(archivo)
    {
        (self.servicioObj = LifeService.Get('GetEtiquetaPorArchivo/' + archivo.ArchivoId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                archivo.Etiqueta = dataResponse.data[1].Etiqueta;
                archivo.Tema = dataResponse.data[2].Tema;
                
                
                $scope.archivoEtiquetar = archivo;
                $scope.EtiquetarFile(archivo, archivo.Nombre );

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
        $scope.archivo = [];
        $scope.buscar = false;
    };
    
    $scope.AgregarEtiquetaFiltro = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].Nombre == etiqueta)
            {
                $scope.etiqueta[k].filtro = false;
                $scope.filtro.etiqueta.push($scope.etiqueta[k]);
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
                $scope.archivo = [];
                $scope.buscar = false;
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

        $scope.archivo = [];
        $scope.buscar = false;
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
        
        $scope.archivo = [];
        $scope.buscar = false;
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
        
         $scope.archivo = [];
         $scope.buscar = false;
    };
    
    //------------ Vista ----------
    //--Menú contextual--
    $scope.VerOpt = function(id)
    {
        if($scope.verpen != id)
        {
             var y = $('#archivo' + id).height();
            $('#menuArchivo' + id).css('height', y);
            
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
    
    $scope.BuscarCarpetaConcepto = function(concepto)
    {
        if(concepto.Tipo == "Etiqueta")
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].EtiquetaId == concepto.ConceptoId)
                {
                    $scope.etiqueta[k].filtro = false;
                    $scope.filtro.etiqueta.push($scope.etiqueta[k]);
                    $scope.GetArchivo();
                    break;
                }
            }
        }
        else if(concepto.Tipo == "Tema")
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].TemaActividadId == concepto.ConceptoId)
                {
                    $scope.tema[k].filtro = false;
                    $scope.filtro.tema.push($scope.tema[k]);
                    $scope.GetArchivo();
                    break;
                }
            }
        }
    };

    
    //----------------------- Abrir --------------------
    $scope.AbrirArchivo = function(operacion, objeto)
    {
        $scope.operacion = operacion;
        
        if($scope.operacion == "Agregar")
        {
            $scope.nuevoArchivo = new Archivo();
            $scope.nuevoArchivo.Archivo = [];
            $scope.nuevoArchivo.ArchivoSrc = [];
            
            $scope.archivoInicio = jQuery.extend({}, $scope.nuevoArchivo);
            
            $scope.ActivarDesactivarTema($scope.nuevoArchivo.Tema);
            $scope.ActivarDesactivarEtiqueta($scope.nuevoArchivo.Etiqueta);
            
            $scope.$broadcast('IniciarArchivo', $scope.nuevoArchivo, true);
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevoArchivo, 'File');
        }
        
        $('#modalApp').modal('toggle');
    };
    
    //---- terminar ----------
    $scope.TerminarArchivo = function()
    {
        if(!$scope.ValidarArchivo())
        {
            $('#mensajeArchivo').modal('toggle');
            return;
        }
        else
        {
            $rootScope.$broadcast('EtiquetaOcultaArchivo', $scope.nuevoArchivo);
        }
    };
    
    $scope.$on('TerminarEtiquetaOcultaArchivo',function()
    {    
        if($scope.operacion == "Agregar")
        {
            $scope.AgregarArchivo();
        }
    });
    
    $scope.AgregarArchivo = function()
    {
        $scope.nuevoArchivo.UsuarioId = $rootScope.UsuarioId;
        
        (self.servicioObj = LifeService.File('AgregarArchivo', $scope.nuevoArchivo)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var data = dataResponse.data;
                $('#modalApp').modal('toggle');
                $scope.mensaje = "Archivo(s) agregado(s).";
                
                $scope.GetNumeroArchivoPorConcepto();
                $scope.NumeroArchivo += $scope.nuevoArchivo.ArchivoSrc.length;
                if($scope.buscar)
                {
                    $scope.GetArchivo();
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
    };
    
    $scope.ValidarArchivo = function()
    {
        $scope.mensajeError = [];
        
        if($scope.nuevoArchivo.ArchivoSrc.length == 0)
        {
            $scope.mensajeError[0] = "*Selecciona al menos un archivo.";
        }
        else
        {
            for(var k=0; k<$scope.nuevoArchivo.ArchivoSrc.length; k++)
            {
                if(($scope.nuevoArchivo.ArchivoSrc[k].Tema.length + $scope.nuevoArchivo.ArchivoSrc[k].Etiqueta.length) == 0)
                {
                    $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos un concepto para el archivo " + $scope.nuevoArchivo.ArchivoSrc[k].name;
                }
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
    
    //----------- Cerrar ------------
    $scope.CerrarArchivo = function()
    {
        if(JSON.stringify($scope.archivoInicio) === JSON.stringify($scope.nuevoArchivo))
        {
            $('#modalApp').modal('toggle');
        }
        else
        {
            $('#cerrarArchivo').modal('toggle');
        }
    };
    
    $scope.ConfirmarCerrarArchivo = function()
    {
        $('#modalApp').modal('toggle');
        $scope.mensajeError = [];
    };
    
    //-------------- Etiquetar ----------------------
    $scope.EtiquetarFile = function(archivo, nombre)
    {
        $rootScope.$broadcast('AbrirEtiquetaArchivo', archivo, nombre, 'App');
    };
    
    $scope.$on('TerminarEtiquetas', function()
    {
        $rootScope.$broadcast('EtiquetaOcultaArchivoApp', $scope.archivoEtiquetar);
    });
    
    $scope.$on('TerminarEtiquetaOcultaArchivo2',function(evento, archivo)
    {     
        (self.servicioObj = LifeService.Put('EditarEtiquetaArchivo', archivo )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {   
                for(var k=0; k<$scope.archivo.length; k++)
                {
                    if($scope.archivo[k].ArchivoId == archivo.ArchivoId)
                    {
                        $scope.archivo[k].NumeroTema = archivo.Tema.length;
                        $scope.archivo[k].NumeroEtiqueta = $scope.ContarEtiquetasVisibles( archivo.Etiqueta);
                        $scope.GetNumeroArchivoPorConcepto();
                        break;
                    }
                }
                
                 $('#EtiquetaFile').modal('toggle');
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
    });
    
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
    
    //-------------------- Borrar ---------------------
    $scope.BorrarArchivo = function(file)
    {
        $scope.borrarArchivo = file.ArchivoId;

        $scope.mensajeBorrar = "¿Estas seguro de eliminar el Archivo \"" + file.Nombre + "\"?";

        $("#borrarArchivo").modal('toggle');
    };
    
    $scope.ConfirmarBorrarArchivo = function()
    {
        (self.servicioObj = LifeService.Delete('BorrarArchivo', $scope.borrarArchivo )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {   
                for(var k=0; k<$scope.archivo.length; k++)
                {
                    if($scope.archivo[k].ArchivoId == $scope.borrarArchivo)
                    {                        
                        $scope.archivo.splice(k,1);
                        $scope.NumeroArchivo--;
                        $scope.GetNumeroArchivoPorConcepto();
                        break;
                    }
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
  

    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        if($scope.usuarioLogeado.Aplicacion != "Mis Archivos")
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            $scope.GetTemaActividad();
            $scope.GetEtiqueta();
            $scope.GetNumeroArchivo();
            $scope.GetNumeroArchivoPorConcepto();
            
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
    
    
    /*------------- Cambiar tamaño de la pantalla y ajustar carpetas --------------------*/
    $( window ).resize(function() 
    {
        $scope.CambiarNumeroCarpeta();
    });
    
    $scope.CambiarNumeroCarpeta = function()
    {
        if($rootScope.anchoPantalla <= 767)
        {
            $scope.numeroCarpeta = 3;
        }
        else if($rootScope.anchoPantalla > 767 && $rootScope.anchoPantalla < 1200)
        {
            $scope.numeroCarpeta = 4;
        }
        else if($rootScope.anchoPantalla >= 1200)
        {
            $scope.numeroCarpeta = 6;
        }
    };
    
    //----------- Archivos --------
    $(document).on('hide.bs.modal','#EtiquetaFile', function () 
    {
        if($scope.nuevoArchivo)
        {
            $scope.ActivarDesactivarTema($scope.nuevoArchivo.Tema);
            $scope.ActivarDesactivarEtiqueta($scope.nuevoArchivo.Etiqueta);
        }
    });
    
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
    
});


