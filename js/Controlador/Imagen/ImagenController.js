app.controller("ImagenController", function($scope, $window, $http, $rootScope, $q, CONFIG, LifeService, $location, $sce, ETIQUETA, IMAGEN, datosUsuario)
{   
    $scope.buscarConceptoBarra = "";
    $scope.filtro = {etiqueta: [], tema: []};
    $scope.verFiltro = true;
    $scope.imagen = [];
    $scope.buscar = false;

    
    /*------- Catálogos Base ---------------*/
    $scope.GetImagen = function()
    {
         $scope.filtro.usuarioId = $rootScope.UsuarioId;
        
        (self.servicioObj = LifeService.Post('GetImagenApp', $scope.filtro )).then(function (dataResponse) 
        {
            $scope.buscar = true;
            if (dataResponse.status == 200) 
            {
                $scope.imagen = dataResponse.data;
                
            } else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
                $scope.imagen = [];
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.GetImagenEtiqueta = function(imagen)
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
            
            IMAGEN.EtiquetaImagen(imagen, $scope.etiqueta, $scope.tema, 'prev');


        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetNumeroImagen = function()
    {
        (self.servicioObj = LifeService.Get('GetNumeroImagen/' + $rootScope.UsuarioId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.NumeroImagen = parseInt(dataResponse.data);

            } else 
            {
                $scope.NumeroImagen = 0;
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.GetNumeroImagenPorConcepto = function()
    {
        (self.servicioObj = LifeService.Get('GetNumeroImagenPorConcepto/' + $rootScope.UsuarioId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.conceptoImagen = dataResponse.data;

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
        $scope.imagen = [];
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
                $scope.imagen = [];
                $scope.buscar = false;
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

        $scope.imagen = [];
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
        
        $scope.imagen = [];
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
        
         $scope.imagen = [];
         $scope.buscar = false;
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
                    $scope.GetImagen();
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
                    $scope.GetImagen();
                    break;
                }
            }
        }
    };
    
    //------------ Vista ----------

    
    //----------------------- Abrir --------------------
    $scope.AbrirImagen = function(operacion, objeto)
    {
        $scope.operacion = operacion;
        
        if($scope.operacion == "Agregar")
        {
            $scope.nuevaImagen = new Imagen();
            $scope.nuevaImagen.Imagen = [];
            $scope.nuevaImagen.ImagenSrc = [];
            
            $scope.imagenInicio = jQuery.extend({}, $scope.nuevaImagen);
            
            $scope.ActivarDesactivarTema($scope.nuevaImagen.Tema);
            $scope.ActivarDesactivarEtiqueta($scope.nuevaImagen.Etiqueta);
        
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevaImagen, 'Imagen');
        }
        
        $('#modalApp').modal('toggle');
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
    
    //---- terminar ----------
    $scope.TerminarImagen = function()
    {
        if(!$scope.ValidarImagen())
        {
            $('#mensajeImagen').modal('toggle');
            return;
        }
        else
        {
            $scope.AregarImagen();
        }
    };
    
    $scope.AregarImagen = function()
    {
        $scope.nuevaImagen.UsuarioId = $rootScope.UsuarioId;
        
        (self.servicioObj = LifeService.File('AgregarImagen', $scope.nuevaImagen)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var data = dataResponse.data;
                $('#modalApp').modal('toggle');
                $scope.mensaje = "Imágenes agregadas.";
                
                $scope.GetNumeroImagenPorConcepto();
                $scope.NumeroImagen += $scope.nuevaImagen.ImagenSrc.length;
                if($scope.buscar)
                {
                    $scope.GetImagen();
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
    
    $scope.ValidarImagen = function()
    {
        $scope.mensajeError = [];
        
        if($scope.nuevaImagen.ImagenSrc.length == 0)
        {
            $scope.mensajeError[0] = "*Selecciona al menos una imagen.";
        }
        else
        {
            for(var k=0; k<$scope.nuevaImagen.ImagenSrc.length; k++)
            {
                if(($scope.nuevaImagen.ImagenSrc[k].Tema.length + $scope.nuevaImagen.ImagenSrc[k].Etiqueta.length) == 0)
                {
                    $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos un concepto para todas las imágenes.";
                    break;
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
    $scope.CerrarImagen = function()
    {
        if(JSON.stringify($scope.imagenInicio) === JSON.stringify($scope.nuevaImagen))
        {
            $('#modalApp').modal('toggle');
        }
        else
        {
            $('#cerrarImagen').modal('toggle');
        }
    };
    
    $scope.ConfirmarCerrarImagen = function()
    {
        $('#modalApp').modal('toggle');
        $scope.mensajeError = [];
    };
    
    
    //-------------- Etiquetar ----------------------
    $scope.EtiquetarImagenEditar = function(imagen)
    {
        $scope.operacion = "Editar";
        $scope.etiquetaImagen = imagen;
        $scope.GetImagenEtiqueta(imagen);
    };
    
    $scope.$on('TerminarEtiquetaImagen',function()
    {   
        if($scope.operacion == "Editar")
        {
            var img = IMAGEN.GetImagen();
            (self.servicioObj = LifeService.Put('EditarEtiquetaImagen', img )).then(function (dataResponse) 
            {
                if (dataResponse.status == 200) 
                {   
                    for(var k=0; k<$scope.imagen.length; k++)
                    {
                        if($scope.imagen[k].ImagenId == img.ImagenId)
                        {
                            $scope.imagen[k].NumeroTema = img.Tema.length;
                            $scope.imagen[k].NumeroEtiqueta = $scope.ContarEtiquetasVisibles( img.Etiqueta);

                            break;
                        }
                    }

                    $scope.GetNumeroImagenPorConcepto();
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
        }
    });
    
    
    //-------------------- Borrar ---------------------
    $scope.BorrarImagen = function(id)
    {
        $scope.borrarImagen = id;

        $scope.mensajeBorrar = "¿Estas seguro de eliminar la imagen?";

        $("#borrarImagen").modal('toggle');
    };
    
    $scope.ConfirmarBorrarImagen = function()
    {
        (self.servicioObj = LifeService.Delete('BorrarImgen', $scope.borrarImagen )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {   
                for(var k=0; k<$scope.imagen.length; k++)
                {
                    if($scope.imagen[k].ImagenId == $scope.borrarImagen)
                    {
                        if(k == ($scope.imagen.length-1))
                        {
                            $scope.iImg = 0;
                        }
                        
                        $scope.imagen.splice(k,1);
                        $scope.NumeroImagen--;
                            
                        break;
                    }
                }
                
                $scope.GetNumeroImagenPorConcepto();
                
                if($scope.imagen.length == 0)
                {
                    $('#verImagen').modal('toggle');
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
  
    
    //-------- ver Imagenes ----------
    $scope.VerImganes = function(index)
    {
        $scope.iImg = index;
        
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
            $scope.iImg = $scope.imagen.length -1;
        }
        else if($scope.iImg >= $scope.imagen.length)
        {
            $scope.iImg = 0;
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
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        if($scope.usuarioLogeado.Aplicacion != "Mis Imágenes")
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            $scope.GetTemaActividad();
            $scope.GetEtiqueta();
            $scope.GetNumeroImagen ();
            $scope.GetNumeroImagenPorConcepto();
            
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
    
    //-------------------------------------- Imagenes de archivo ---------------
    function ImagenSeleccionada(evt) 
    {
        var files = evt.target.files;
        
        $scope.index = $scope.nuevaImagen.ImagenSrc.length;
        $scope.lastIndex = $scope.nuevaImagen.ImagenSrc.length + 1;
        $scope.srcSize = $scope.nuevaImagen.ImagenSrc.length + files.length;
        
        
        for (var i = 0, f; f = files[i]; i++) 
        {
            if (!f.type.match('image.*')) 
            {
                continue;
            }
            
            var reader = new FileReader();
            var imgc = null;
    
            reader.onload = (function(theFile) 
            {
                return function(e) 
                {
                    $scope.nuevaImagen.ImagenSrc.push(theFile);
                    
                    var compressor = new Compress();
                    
                    compressor.compress([theFile], {
                        size: 10,
                        quality: 1,
                        maxWidth: 250,
                        maxHeight: 150,
                        resize: true
                    }).then((result) => {

                        $scope.nuevaImagen.ImagenTh.push((Compress.convertBase64ToFile(result[0].data, result[0].ext)));

                    });
                    
                    var compressor2 = new Compress();
                    
                    compressor2.compress([theFile], {
                        size: 10,
                        quality: 0.4,
                        maxWidth: 1000,
                        maxHeight: 1000,
                        resize: false
                    }).then((result) => {

                        $scope.nuevaImagen.ImagenWeb.push(Compress.convertBase64ToFile(result[0].data, result[0].ext));

                    });
                    
                    $scope.nuevaImagen.ImagenSrc[$scope.nuevaImagen.ImagenSrc.length-1].Src= (e.target.result);
                    $scope.nuevaImagen.ImagenSrc[$scope.nuevaImagen.ImagenSrc.length-1].Etiqueta = [];
                    $scope.nuevaImagen.ImagenSrc[$scope.nuevaImagen.ImagenSrc.length-1].Tema = [];
                    
                    if( $scope.srcSize === $scope.nuevaImagen.ImagenSrc.length)
                    {
                        $scope.todasImg = "src";
                        $scope.SetTemaImagenPendiente($scope.nuevaImagen.ImagenSrc[$scope.index], $scope.nuevaImagen.Tema);
                    }
                    
                    $scope.SetEtiquetaImagenPendiente($scope.nuevaImagen.ImagenSrc[$scope.nuevaImagen.ImagenSrc.length-1], $scope.nuevaImagen.Etiqueta);
                    
                    $scope.$apply();
                };
                
            })(f);
            
            
            reader.readAsDataURL(f);
        }
        
        document.getElementById('cargarImagenApp').value = "";
    }
 
    document.getElementById('cargarImagenApp').addEventListener('change', ImagenSeleccionada, false);
    
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
    
    //--------------- Etiquetas de Imagenes -----------------------------
    $scope.EtiquetarImagen = function(imagen, tipo)
    {
        $scope.etiquetaImagen = imagen;
        IMAGEN.EtiquetaImagen(imagen, $scope.etiqueta, $scope.tema, tipo);
    };
    
    $scope.$on('TerminarEtiquetaImagen',function()
    {   
        if($scope.operacion == "Agregar")
        {
            //$rootScope.$broadcast('Alerta', "Imagen Etiquetada", 'exito');
            $scope.SetEtiquetaImagen(IMAGEN.GetImagen());
        }
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
            for(var k=1; k<$scope.nuevaImagen.Imagen.length; k++)
            {
                $scope.SetTemaImagenPendiente($scope.nuevaImagen.Imagen[k], $scope.temaAgregar);
            }
            
            for(var i=1; i<$scope.nuevaImagen.ImagenSrc.length; i++)
            {
                $scope.SetTemaImagenPendiente($scope.nuevaImagen.ImagenSrc[i], $scope.temaAgregar);
            }
        }
        else if(opt == "opt")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevaImagen.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta($scope.nuevaImagen.Imagen[k]);
            }
        }
        else if(opt == "src")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevaImagen.ImagenSrc.length; k++)
            {
                $scope.SetTemaImagenPendiente($scope.nuevaImagen.ImagenSrc[k], $scope.nuevaImagen.Tema);
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

        for(var i=0; i<$scope.nuevaImagen.Imagen.length; i++)
        {
            $scope.SetEtiquetaImagenPendiente($scope.nuevaImagen.Imagen[i], e);
        }
        
        for(var i=0; i<$scope.nuevaImagen.ImagenSrc.length; i++)
        {
            $scope.SetEtiquetaImagenPendiente($scope.nuevaImagen.ImagenSrc[i], e);
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
        
        if($scope.nuevaImagen.Imagen.length > 0)
        {
            $scope.SetTemaImagenPendiente($scope.nuevaImagen.Imagen[0], e);
        }
        else if($scope.nuevaImagen.ImagenSrc.length > 0)
        {
            $scope.SetTemaImagenPendiente($scope.nuevaImagen.ImagenSrc[0], e);
        }
    };
    
    $scope.$on('QuitarEtiqueta',function(nota, etiqueta)
    {
        for(var i=0; i<$scope.nuevaImagen.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevaImagen.Imagen[i].Etiqueta.length; j++)
            {
                if($scope.nuevaImagen.Imagen[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevaImagen.Imagen[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevaImagen.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevaImagen.ImagenSrc[i].Etiqueta.length; j++)
            {
                if($scope.nuevaImagen.ImagenSrc[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevaImagen.ImagenSrc[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
    });
    
    $scope.$on('QuitarTema',function(nota, tema)
    {
        for(var i=0; i<$scope.nuevaImagen.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevaImagen.Imagen[i].Tema.length; j++)
            {
                if($scope.nuevaImagen.Imagen[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevaImagen.Imagen[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevaImagen.Imagen[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevaImagen.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevaImagen.ImagenSrc[i].Tema.length; j++)
            {
                if($scope.nuevaImagen.ImagenSrc[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevaImagen.ImagenSrc[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevaImagen.ImagenSrc[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
    });
    
    
});


