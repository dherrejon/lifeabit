app.controller("ControlEtiquetaController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, $location, ETIQUETA, EEQUIVALENTE)
{   
    $scope.etiqueta = [];
    $scope.buscarConcepto = "";
    $scope.tema = [];
    $scope.modal = "";
    
    $scope.$on('IniciarEtiquetaControl', function (evento, etiqueta, tema, elemento, modal) 
    {
        if($scope.modal == modal)
        {
            $scope.buscarConcepto = "";
            $scope.etiqueta = etiqueta;
            $scope.tema = tema;
            $scope.elemento = elemento;
        }
    });
    
    $scope.IniciarModal = function(modal)
    {
        $scope.modal = modal;
    };
    
    //-------- Typeahead ------------------
    $scope.FiltroConcepto = function(concepto)
    {
        var conceptos = [];
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].show)
            {
                if(BuscarEtiqueta($scope.etiqueta[k], concepto))
                {
                    conceptos.push($scope.etiqueta[k]);
                }
            }
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].show)
            {
                if(BuscarTema($scope.tema[k], concepto))
                {
                    conceptos.push($scope.tema[k]);
                }
            }
        }
        
        return conceptos;
    };
    
    $scope.SeleccionarEtiqueta = function()
    {
        $scope.evento  ="sel";
        if($scope.buscarConcepto.Nombre !== undefined)
        {
            $scope.AgregarEtiqueta($scope.buscarConcepto, true);
        }
        else if($scope.buscarConcepto.Tema !== undefined)
        {
            $scope.AgregarTema($scope.buscarConcepto);
        }
        
    };
    
    $scope.QuitarEtiquetaBuscar = function()
    {
        $scope.buscarConcepto = "";
    };
    
    document.getElementById("modalApp").onclick = function(e) 
    {
        if(!(e.target.id == "concepto" || $(e.target).parents("#concepto").size()))
        { 
            if($scope.buscarConcepto != undefined)
            {
                if($scope.buscarConcepto.length > 0)
                {
                    $scope.IdentificarEtiqueta();
                }
            }
            
            $scope.$apply();
        }
    };
                                 
    //-------------------------- Etiqueta -------------------------------
    $scope.AgregarEtiqueta = function(etiqueta, ver)
    {
        etiqueta.Visible = ver;

        etiqueta.show = false;

        $scope.buscarConcepto = "";
        
        $scope.elemento.Etiqueta.push(etiqueta);
    };
    
    /*$('#nuevoConcepto').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                console.log(e);
                console.log($scope.evento);
                debugger;
                $scope.IdentificarEtiqueta();
                $scope.$apply();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });*/
    
    $scope.PressKeyConcepto = function(e)
    {
        switch(e.which) 
        {
            case 13:
                $scope.IdentificarEtiqueta();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    };
    
    $scope.IdentificarEtiqueta = function()
    {
        if($rootScope.erEtiqueta.test($scope.buscarConcepto))
        {
            $scope.verEtiqueta  = true;
            $scope.AgregarNuevaEtiqueta($scope.buscarConcepto);
            $scope.buscarConcepto = "";
        }
        else if($rootScope.erTema.test($scope.buscarConcepto))
        {
            $scope.verEtiqueta  = false;
            var tema = $scope.buscarConcepto;
            $scope.AgregarNuevoTema(tema);
            $scope.buscarConcepto = "";
        }
        else
        {
            $rootScope.mensajeError = [];
            $rootScope.mensajeError[$rootScope.mensajeError.length] = "*Escribe una etiqueta válida. " +$scope.modal ;
            $('#mensajeError').modal('toggle');
            
            return;
        }
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
                var promesas = [];
                
                promesas[0] = $scope.EsNuevaEtiqueta(etiqueta);
                
                $q.all(promesas).then(function()
                {
                    q.resolve();
                });
                
                return q.promise;
            }
        }
    };
    
    $scope.ValidarEtiquetaAgregado = function(concepto)
    {
        if($rootScope.erEtiqueta.test(concepto))
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].Nombre.toLowerCase() == concepto.toLowerCase())
                {
                    if($scope.etiqueta[k].show)
                    {
                        $scope.AgregarEtiqueta($scope.etiqueta[k], $scope.verEtiqueta);
                        
                        return false;
                    }
                    else
                    {
                        if($scope.verEtiqueta)
                        {
                            $scope.etiqueta[k].Visible = true;
                        }
                        
                        $rootScope.mensajeError = [];
                        $scope.buscarConcepto = "";
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.elemento.Etiqueta.length; k++)
            {
                if($scope.elemento.Etiqueta[k].Nombre.toLowerCase() == concepto.toLowerCase())
                {
                    if($scope.verEtiqueta)
                    {
                        $scope.elemento.Etiqueta[k].Visible = true;
                    }
                    
                    $rootScope.mensajeError = [];
                    $scope.buscarConcepto = "";
                    return false;
                }
            }
        }
        else
        {
            $rootScope.mensajeError = [];
            $rootScope.mensajeError[$rootScope.mensajeError.length] = "*Escribe una etiqueta válida.";
            $scope.buscarConcepto = "";
            $('#mensajeError').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    
    $scope.EsNuevaEtiqueta = function(nueva)
    {
        var etiqueta = new Etiqueta();
        etiqueta.Nombre = nueva.charAt(0).toUpperCase() + nueva.substr(1).toLowerCase();
        etiqueta.UsuarioId =  $scope.usuarioLogeado.UsuarioId;
        
        var q = $q.defer();
        var promesas = [];
        promesas[0] = AgregarEtiqueta($http, CONFIG, $q, etiqueta).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                data[2].Etiqueta.Visible = $scope.verEtiqueta;
                data[2].Etiqueta.filtro = true;

                $scope.buscarConcepto = "";

                $scope.elemento.Etiqueta.push(data[2].Etiqueta);

                $scope.etiqueta.push(data[2].Etiqueta);
                
                if($scope.verEtiqueta)
                {
                    $scope.etiqueta[$scope.etiqueta.length-1].show = false;
                }
                
                
                $rootScope.mensaje = "Etiqueta Agregada.";
                $scope.EnviarAlerta('Modal');
            }
            else
            {
                 $rootScope.mensajeError[$rootScope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde.";
                 $('#mensajeError').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $rootScope.mensajeError[$rootScope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeError').modal('toggle');
        });
        
        $q.all(promesas).then(function()
        {
            q.resolve();
        });
        
        return q.promise;
    };
    
    $scope.QuitarEtiqueta = function(etiqueta)
    {
        
        for(var k=0; k<$scope.elemento.Etiqueta.length; k++)
        {
            if(etiqueta == $scope.elemento.Etiqueta[k])
            {
                $scope.elemento.Etiqueta.splice(k,1);
                break;
            }
        }
        
        if(etiqueta.EtiquetaId != "-1")
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.etiqueta[k].show = true;
                    return;
                }
            }
        }
    };
    
    
    //--------------- tema -----------
    $scope.AgregarTema = function(tema)
    {
        $scope.elemento.Tema.push(tema);
        
        tema.show = false;
        $scope.buscarConcepto = "";
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
                var tema = new TemaActividad();
                tema.Tema = nuevo;
                tema.TemaActividadId = "-1";
                $scope.buscarTema = "";
                
                $scope.elemento.Tema.push(tema);
            }
        }
    };
    
    $scope.ValidarTemaAgregado = function(nuevo)
    {
        if($rootScope.erTema.test(nuevo))
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].Tema.toLowerCase() == nuevo.toLowerCase())
                {
                    if($scope.tema[k].show)
                    {
                        $scope.AgregarTema($scope.tema[k]);
                        return false;
                    }
                    else
                    {
                        $rootScope.mensajeError = [];
                        $rootScope.mensajeError[$rootScope.mensajeError.length] = "*Este tema ya fue agregado.";
                        $scope.buscarTema = "";
                        $('#mensajeError').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.elemento.Tema.length; k++)
            {
                if($scope.elemento.Tema[k].Tema.toLowerCase() == nuevo.toLowerCase())
                {
                    $rootScope.mensajeError = [];
                    $rootScope.mensajeError[$rootScope.mensajeError.length] = "*Este tema ya fue agregado.";
                    $scope.buscarTema = "";
                    $('#mensajeError').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $rootScope.mensajeError = [];
            $rootScope.mensajeError[$rootScope.mensajeError.length] = "*Escribe un tema válido.";
            $scope.buscarTema = "";
            $('#mensajeError').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    $scope.QuitarTema = function(tema)
    {
        
        for(var k=0; k<$scope.elemento.Tema.length; k++)
        {
            if(tema == $scope.elemento.Tema[k])
            {
                $scope.elemento.Tema.splice(k,1);
                break;
            }
        }
        
        if(tema.TemaActividadId != "-1")
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.tema[k].show = true;
                    return;
                }
            }
        }
    };
    
    $scope.EditarTema = function(tema)
    {
        if(tema.TemaActividadId == "-1")
        {
            $scope.buscarConcepto = tema.Tema;
            
            for(var k=0; k<$scope.elemento.Tema.length; k++)
            {
                if($scope.elemento.Tema[k].Tema == tema.Tema)
                {
                    $scope.elemento.Tema.splice(k,1);
                    break;
                }
            }
            
            $("#nuevoTema").focus();
        }
    };
    
    $scope.$on('SepararEtiqueta', function (evento, tema, modal) 
    {
        if($scope.modal == modal)
        {
            var promesas = [];
            
            for(var k=0; k<tema.length; k++)
            {
                var promesa = $scope.SepararEtiqueta(tema[k].Tema);
                
                promesas.push(promesa);
            }
            
            $q.all(promesas).then(function()
            {
                ETIQUETA.TerminarEtiquetaOculta();
            });
        }
    });
    
    $scope.SepararEtiqueta = function(etiqueta)
    {    
        var q = $q.defer();
        
        var promesas = [];
        
        $scope.verEtiqueta = false;
        
        etiqueta = etiqueta.split(" ");
        
        for(var k=0; k<etiqueta.length; k++)
        {
            var promesa = $scope.AgregarNuevaEtiqueta(etiqueta[k], false);
            promesas.push(promesa);
        }
        
        $q.all(promesas).then(function()
        {
            q.resolve();
        });
        
        return q.promise;
    };
    
    //---------------- Editar etiqueta exterior---------------------------
    $scope.EditarRegistroEtiqueta = function(etiqueta)
    {
        ETIQUETA.EditarEtiqueta(etiqueta);
    };
    
    $scope.$on('TerminarEditarEtiqueta',function()
    {   
        $rootScope.mensaje = "Etiqueta Editada";
        $scope.EnviarAlerta('Modal');
        
        var nueva = ETIQUETA.GetEtiqueta();
        $scope.SetNuevaEtiqueta(nueva);
    });
    
    $scope.SetNuevaEtiqueta = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta[k].Nombre = etiqueta.Nombre;
                break;
            }
        }
        
        for(var k=0; k<$scope.elemento.Etiqueta.length; k++)
        {
            if($scope.elemento.Etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.elemento.Etiqueta[k].Nombre = etiqueta.Nombre;
                break;
            }
        }
    };
    
    //-------------- Etiquetas equivalentes -----------------------------
    $scope.EtiquetaEquivalente = function(etiqueta)
    {
        EEQUIVALENTE.SetEtiquetaEquivalente(etiqueta, $scope.etiqueta);
    };
    
    $scope.$on('SentNuevaEtiqueta',function()
    {   
        var nueva = EEQUIVALENTE.GetNueva();
        $scope.PushNuevaEtiqueta(nueva);
    });
    
    $scope.PushNuevaEtiqueta = function(etiqueta)
    {
        for(var k=0; k<etiqueta.length; k++)
        {
            var nueva = SetEtiqueta(etiqueta[k]);
            nueva.show = true;
            $scope.etiqueta.push(nueva);
        }
    };

    
    //------------------- Borrar Etiqueta ------
    $scope.BorraEtiqueta = function(etiqueta)
    {
        $scope.borrarEtiqueta = etiqueta;
        ETIQUETA.BorrarEtiqueta(etiqueta);
    };
    
    $scope.$on('EtiquetaBorrada',function()
    {   
        $scope.QuitarEtiqueta($scope.borrarEtiqueta);
        
        $scope.QuitarEtiquetaEtiquetas($scope.borrarEtiqueta);
    });
    
    $scope.QuitarEtiquetaEtiquetas = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta.splice(k,1);
                break;
            }
        }
    };
    
    //--------- Buscar Etiqueta --------------
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
    
    $scope.BuscarEtiqueta = function(etiqueta)
    {
        return BuscarEtiqueta(etiqueta, $scope.buscarConcepto);
    };
    
    //--------- Buscar Tema --------------
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
    
    $scope.BuscarTema = function(tema)
    {
        return BuscarTema(tema, $scope.buscarConcepto);
    };
    

});
