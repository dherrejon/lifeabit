app.controller("EtiquetaImagenController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, IMAGEN, ETIQUETA, EEQUIVALENTE)
{   
    $scope.etiqueta = [];
    $scope.tema = [];
    $scope.imagen = null;
    $scope.tipo = null;
    
    $scope.$on('EtiquetaImagen',function()
    {
        $scope.img = IMAGEN.GetImagen();
        
        $scope.imagen = new Object();
        $scope.imagen = $scope.SetImagen($scope.img);
    
        $scope.tipo = IMAGEN.GetTipoImagen();
        $scope.etiqueta = IMAGEN.GetEtiqueta();
        $scope.tema = IMAGEN.GetTema();
        
        $scope.buscarConceptoImg = "";
        
        $scope.IniciarImagen();
        
        $('#EtiquetaImagen').modal('toggle');
    });

    $scope.$on('EtiquetaOculta',function()
    {
        $scope.imagen = IMAGEN.GetImagen();
        $scope.etiqueta = IMAGEN.GetEtiqueta();
        $scope.tema = IMAGEN.GetTema();
        $scope.IniciarImagen();
        
        $scope.TerminarEtiquetaImagenOculta();
    });
    
    $scope.IniciarImagen = function()
    {
        $scope.ValidarEtiqueta($scope.etiqueta, $scope.imagen.Etiqueta);
        $scope.ValidarTema($scope.tema, $scope.imagen.Tema);
    };
    
    $scope.ValidarEtiqueta = function(etiqueta, data)
    {
        for(var k=0; k<etiqueta.length; k++)
        {
            etiqueta[k].ShowImg = true;
            
            for(var i=0; i<data.length; i++)
            {
                if(data[i].EtiquetaId == etiqueta[k].EtiquetaId)
                {
                    if(data[i].Visible == "1")
                    {
                        etiqueta[k].ShowImg = false;
                    }
                    
                    break;
                }
            }
        }
    };
    
    $scope.ValidarTema = function(tema, data)
    {
        for(var k=0; k<tema.length; k++)
        {
            tema[k].ShowImg = true;
            
            for(var i=0; i<data.length; i++)
            {
                if(data[i].TemaActividadId == tema[k].TemaActividadId)
                {
                    tema[k].ShowImg = false;
                    break;
                }
            }
        }
    };
    
    $scope.SetImagen = function(data)
    {
        var imagen = jQuery.extend({}, data);
        imagen.Etiqueta = [];
        imagen.Tema = [];
        
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            var etiqueta = new Object();
            etiqueta.EtiquetaId = data.Etiqueta[k].EtiquetaId;
            etiqueta.Nombre = data.Etiqueta[k].Nombre;
            etiqueta.Visible = data.Etiqueta[k].Visible;
            etiqueta.count = data.Etiqueta[k].count;
            imagen.Etiqueta.push(etiqueta);
        }
        
        for(var k=0; k<data.Tema.length; k++)
        {
            var tema = new Object();
            
            tema.TemaActividadId = data.Tema[k].TemaActividadId;
            tema.Tema = data.Tema[k].Tema;
            imagen.Tema.push(data.Tema[k]);
        }
        
        return imagen;
    };
    
    //--------- control de etiquetas ------
    $('#temaImg').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.IdentificarEtiqueta();
                $scope.$apply();
              break;

            default:
                return;
        }
        e.preventDefault();
    });
    
    $scope.AgregarEtiqueta = function(etiqueta, ver)
    {
        etiqueta.Visible = ver;
        $scope.imagen.Etiqueta.push($scope.SetGetEtiquetaEtiqueta(etiqueta));
        
        etiqueta.ShowImg = false;
        $scope.buscarConceptoImg = "";
    };
    
    
    $scope.SetGetEtiquetaEtiqueta = function(data)
    {
        var etiqueta = new Object();
        
        etiqueta.EtiquetaId = data.EtiquetaId;
        etiqueta.Nombre = data.Nombre;
        etiqueta.Visible = data.Visible;
        etiqueta.count = data.count;
        
        return etiqueta;
    };
    
    $scope.IdentificarEtiqueta = function()
    {
        if($rootScope.erEtiqueta.test($scope.buscarConceptoImg))
        {
            $scope.verEtiqueta  = "1";
            $scope.AgregarNuevaEtiqueta($scope.buscarConceptoImg);
            $scope.buscarConceptoImg = "";
        }
        else if($rootScope.erTema.test($scope.buscarConceptoImg))
        {
            $scope.AgregarNuevoTema($scope.buscarConceptoImg);
            $scope.buscarConceptoImg = "";
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            //$scope.buscarConcepto = "";
            $('#mensajeEtiquetaImg').modal('toggle');
            $scope.$apply();
            return;
        }
    };
    
    $scope.SepararEtiqueta = function(etiqueta)
    {   
        var q = $q.defer();
        
        $scope.verEtiqueta = "0";
        
        etiqueta = etiqueta.split(" ");
        
        var promesas = [];
        for(var k=0; k<etiqueta.length; k++)
        {
            var promesa = $scope.AgregarNuevaEtiqueta(etiqueta[k]);
            promesas.push(promesa);
        }
        
        $q.all(promesas).then(function()
        {
            q.resolve();
        });
        
        return q.promise;
    };
    
    $scope.AgregarNuevaEtiqueta = function(etiqueta)
    {
        if(etiqueta.length > 0)
        {
            if(!$scope.ValidarEtiquetaAgregado(etiqueta))
            {
                return;    
            }
            else
            {
                var q = $q.defer();
                
                var promise = [];
                promise[0] = $scope.EsNuevaEtiqueta(etiqueta);
                
                $q.all(promise).then(function()
                {
                    q.resolve();
                });
                
                return q.promise;
            }
        }
    };
    
    $scope.EsNuevaEtiqueta = function(nueva)
    {
        var q = $q.defer();
        
        var etiqueta = new Etiqueta();
        etiqueta.Nombre = nueva.charAt(0).toUpperCase() + nueva.substr(1).toLowerCase();
        etiqueta.UsuarioId =  $rootScope.UsuarioId;
        
        var promesas = [];
        promesas[0] = AgregarEtiqueta($http, CONFIG, $q, etiqueta).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                data[2].Etiqueta.Visible = $scope.verEtiqueta;
                data[2].Etiqueta.filtro = true;
                data[2].Etiqueta.count = 0;

                $scope.buscarConceptoImg = "";

                $scope.imagen.Etiqueta.push($scope.SetGetEtiquetaEtiqueta(data[2].Etiqueta));

                $scope.etiqueta.push(data[2].Etiqueta);
                $scope.etiqueta[$scope.etiqueta.length-1].show = true;
                $scope.etiqueta[$scope.etiqueta.length-1].ShowImg = false;
                
                
                $scope.mensaje = "Etiqueta Agregada.";
                
                if($scope.verEtiqueta == "1")
                {
                    $scope.EnviarAlerta('Modal');
                }
                else
                {
                    $scope.etiqueta[$scope.etiqueta.length-1].ShowImg = true;
                }
                //$scope.$apply();
            }
            else
            {
                 $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeEtiquetaImg').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeEtiquetaImg').modal('toggle');
        });
        
        $q.all(promesas).then(function()
        {
            q.resolve();
        });
        
        return q.promise;
    };
    
    $scope.ValidarEtiquetaAgregado = function(concepto)
    {
        if($rootScope.erEtiqueta.test(concepto))
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].Nombre.toLowerCase() == concepto.toLowerCase())
                {
                    if($scope.etiqueta[k].ShowImg)
                    {
                        $scope.AgregarEtiqueta($scope.etiqueta[k], $scope.verEtiqueta);
                        return false;
                    }
                    else
                    {
                        if($scope.verEtiqueta == "1")
                        {
                            $scope.etiqueta[k].Visible = "1";
                        }
                        
                        $scope.mensajeError = [];
                        //$scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                        $scope.buscarConceptoImg = "";
                        //$('#mensajeNota').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.imagen.Etiqueta.length; k++)
            {
                if($scope.imagen.Etiqueta[k].Nombre.toLowerCase() == concepto.toLowerCase())
                {
                    if($scope.verEtiqueta)
                    {
                        $scope.imagen.Etiqueta[k].Visible = "1";
                    }
                    $scope.mensajeError = [];
                    //$scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                    $scope.buscarConceptoImg = "";
                    //$('#mensajeNota').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            $scope.buscarConceptoImg = "";
            $('#mensajeEtiquetaImg').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    //-------------- Control de temas -----------------
    $scope.AgregarTema = function(tema)
    {
        $scope.imagen.Tema.push(tema);
        
        tema.ShowImg = false;
        $scope.buscarConceptoImg = "";
    };
    
    $scope.AgregarNuevoTema = function(nuevo)
    {
        if(nuevo.length > 0)
        {
            if(!$scope.ValidarTemaAgregado(nuevo))
            {
                return;    
            }
            else
            {
                $scope.EsNuevoTema(nuevo);
            }
        }
    };
    
    $scope.EsNuevoTema = function(nueva)
    {
        var tema = new TemaActividad();
        tema.Tema = nueva;
        tema.UsuarioId =  $rootScope.UsuarioId;
        
        AgregarTemaActividad($http, CONFIG, $q, tema).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.buscarConceptoImg = "";

                $scope.imagen.Tema.push(data[2].Tema);

                $scope.tema.push(data[2].Tema);
                $scope.tema[$scope.tema.length-1].show = true;
                $scope.tema[$scope.tema.length-1].ShowImg = false;
                
                
                $scope.mensaje = "Tema Agregado.";

                $scope.EnviarAlerta('Modal');

                //$scope.$apply();
            }
            else
            {
                 $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeEtiquetaImg').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeEtiquetaImg').modal('toggle');
        });
    };
    
    $scope.ValidarTemaAgregado = function(nuevo)
    {
        if($rootScope.erTema.test(nuevo))
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].Tema.toLowerCase() == nuevo.toLowerCase())
                {
                    if($scope.tema[k].ShowImg)
                    {
                        $scope.AgregarTema($scope.tema[k]);
                        return false;
                    }
                    else
                    {
                        $scope.mensajeError = [];
                        //$scope.mensajeError[$scope.mensajeError.length] = "*Este tema ya fue agregado.";
                        $scope.buscarConceptoImg = "";
                        //$('#mensajeDiario').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.imagen.Tema.length; k++)
            {
                if($scope.imagen.Tema[k].Tema.toLowerCase() == nuevo.toLowerCase())
                {
                    $scope.mensajeError = [];
                    //$scope.mensajeError[$scope.mensajeError.length] = "*Este tema ya fue agregado.";
                    $scope.buscarConceptoImg = "";
                    //$('#mensajeDiario').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un tema válido.";
            $scope.buscarTema = "";
            $('#mensajeEtiquetaImg').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    $scope.EditarTema = function(tema)
    {
        if(tema.TemaActividadId == "-1")
        {
            $scope.buscarConceptoImg = tema.Tema;
            
            for(var k=0; k<$scope.imagen.Tema.length; k++)
            {
                if($scope.imagen.Tema[k].Tema == tema.Tema)
                {
                    $scope.imagen.Tema.splice(k,1);
                    break;
                }
            }
            
            $("#temaImg").focus();
        }
    };
    
    
    //----- Quitar -----
    $scope.QuitarTema = function(tema)
    {
        
        for(var k=0; k<$scope.imagen.Tema.length; k++)
        {
            if(tema == $scope.imagen.Tema[k])
            {
                $scope.imagen.Tema.splice(k,1);
                break;
            }
        }
        
        if(tema != "-1")
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.tema[k].ShowImg = true;
                    return;
                }
            }
        }
    };
    
    $scope.QuitarEtiqueta = function(etiqueta)
    {
        
        for(var k=0; k<$scope.imagen.Etiqueta.length; k++)
        {
            if(etiqueta == $scope.imagen.Etiqueta[k])
            {
                $scope.imagen.Etiqueta.splice(k,1);
                break;
            }
        }
        
        if(etiqueta.EtiquetaId != "-1")
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.etiqueta[k].ShowImg = true;
                    return;
                }
            }
        }
    };
    
    //------------- Filtrar --------------
    $scope.BuscarEtiqueta = function(etiqueta)
    {
        return FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConceptoImg);
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
    
    $scope.BuscarTema = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConceptoImg);
    };
    
    $scope.LimpiarBuscar = function()
    {
        $scope.buscarConceptoImg = "";
        $('#temaImg').focus();
    };
    
    $scope.TerminarEtiquetaImagen = function()
    {
        $scope.QuitarEtiquetaNoVisible();
        
        var promesas = [];
        for(var k=0; k<$scope.imagen.Tema.length; k++)
        {
            var promesa = $scope.SepararEtiqueta($scope.imagen.Tema[k].Tema);
            promesas.push(promesa);
        }
        
        
        $q.all(promesas).then(function(data)
        {
            IMAGEN.TerminarEtiquetaImagen($scope.imagen);
            $('#EtiquetaImagen').modal('toggle');
        });
    };
    
    $scope.TerminarEtiquetaImagenOculta = function()
    {
        $scope.QuitarEtiquetaNoVisible();
        
        var promesas = [];
        for(var k=0; k<$scope.imagen.Tema.length; k++)
        {
            var promesa = $scope.SepararEtiqueta($scope.imagen.Tema[k].Tema);
            promesas.push(promesa);
        }
        
        
        $q.all(promesas).then(function(data)
        {
            IMAGEN.TerminarEtiquetasOcultas();
        });
    };
    
    $scope.QuitarEtiquetaNoVisible = function()
    {
        for(var k=0; k<$scope.imagen.Etiqueta.length; k++)
        {
            if($scope.imagen.Etiqueta[k].Visible == "0")
            {
                $scope.imagen.Etiqueta.splice(k,1);
                k--;
            }
        }

    };
    
    //---------------- Editar etiqueta exterior---------------------------
    $scope.EditarRegistroEtiqueta = function(etiqueta)
    {
        ETIQUETA.EditarEtiqueta(etiqueta);
    };
    
    $scope.$on('TerminarEditarEtiqueta',function()
    {   
        $scope.mensaje = "Etiqueta Editada";
        $scope.EnviarAlerta('Modal');
        
        var nueva = ETIQUETA.GetEtiqueta();
        
        $scope.SetNuevaEtiqueta(nueva);
    });
    
    $scope.SetNuevaEtiqueta = function(etiqueta)
    {
        /*for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta[k].Nombre = etiqueta.Nombre;
                break;
            }
        }*/
        
        for(var k=0; k<$scope.imagen.Etiqueta.length; k++)
        {
            if($scope.imagen.Etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.imagen.Etiqueta[k].Nombre = etiqueta.Nombre;
                break;
            }
        }
    };
    
    //-------------- Etiquetas equivalentes -----------------------------
    $scope.EtiquetaEquivalente = function(etiqueta)
    {
        $scope.etiquetaActualizar = etiqueta;
        EEQUIVALENTE.SetEtiquetaEquivalente(etiqueta, $scope.etiqueta);
    };
    
    $scope.$on('SentNuevaEtiqueta',function(evento, nueva, count)
    {   
        if($scope.etiquetaActualizar != undefined)
        {
            $scope.etiquetaActualizar.count = count;
        }
    });
    
    
    /*$scope.PushNuevaEtiqueta = function(etiqueta)
    {
        for(var k=0; k<etiqueta.length; k++)
        {
            var nueva = SetEtiqueta(etiqueta[k]);
            nueva.show = true;
            $scope.etiqueta.push(nueva);
        }
    };*/
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoImg").alert();

            $("#alertaExitosoImg").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoImg").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoImg").alert();

            $("#alertaEditarExitosoImg").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoImg").fadeOut();
            }, 2000);
        }
    };
    
    $scope.EtiquetaEquivalenteLista = function(etiqueta)              
    {
        $scope.ee = [];
        GetEtiquetaEquivalente($http, $q, CONFIG, etiqueta.EtiquetaId).then(function(data)
        {
            $scope.ee = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
});

app.factory('IMAGEN',function($rootScope)
{
  var service = {};
  service.etiqueta = null;
  service.tema = null;
  service.imagen = null;
  service.tipoImagen = null;
    
  service.EtiquetaImagen = function(imagen, etiqueta, tema, tipo)
  {
      this.imagen = imagen;
      this.etiqueta = etiqueta;
      this.tema = tema;
      this.tipo = tipo;
      
      $rootScope.$broadcast('EtiquetaImagen'); 
  };
    
  service.CambiarEtiquetasOcultas = function(imagen, etiqueta, tema)
  {
      this.imagen = imagen;
      this.etiqueta = etiqueta;
      this.tema = tema;
      $rootScope.$broadcast('EtiquetaOculta'); 
  };
    
  service.GetEtiqueta = function()
  {
      return this.etiqueta;
  };
    
  service.GetTema = function()
  {
      return this.tema;
  };
    
  service.GetImagen = function()
  {
      return this.imagen;
  };
    
  service.GetTipoImagen = function()
  {
      return this.tipo;
  };
    
  service.TerminarEtiquetaImagen = function(imagen)
  {
      this.imagen = imagen;
      $rootScope.$broadcast('TerminarEtiquetaImagen');
  };
    
  service.TerminarEtiquetasOcultas = function()
  {
      $rootScope.$broadcast('TerminarEtiquetaImagenOcultas');
  };

  return service;
});