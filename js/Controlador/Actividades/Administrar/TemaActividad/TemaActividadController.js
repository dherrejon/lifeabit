app.controller("TemaActividadController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.tema = [];
    
    $scope.ordenarTema = "Tema";
    $scope.buscarTema = "";
    
    $scope.nuevoTema = null;
    
    $scope.mensajeError = [];
    
    $scope.GetTemaActividad = function()              
    {
        GetTemaActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.tema = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarTema = function(campoOrdenar)
    {
        if($scope.ordenarTema == campoOrdenar)
        {
            $scope.ordenarTema = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarTema = campoOrdenar;
        }
    };
    
    //Filtrar
    $scope.FiltrarBuscarTema = function(tema)
    {
        if($scope.buscarTema !== undefined)
        {
            if($scope.buscarTema.length > 0)
            {
                var index = tema.Tema.toLowerCase().indexOf($scope.buscarTema.toLowerCase());


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
        else
        {
            return true;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirTemaActividad = function(operacion, tema)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevoTema = new TemaActividad();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoTema = SetTemaActividad(tema);
        }
    
        $('#modalTema').modal('toggle');
    };
     
    $scope.CerrarTema = function()
    {
        $('#cerrarTemaModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarTema = function()
    {
        $('#modalTema').modal('toggle');
        $scope.mensajeError = [];
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarTema = function(temaInvalido)
    {
        if(!$scope.ValidarDatos(temaInvalido))
        {
            $('#mensajeTema').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.nuevoTema.UsuarioId = $rootScope.UsuarioId;
                $scope.AgregarTemaActividad();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarTemaActividad();
            }
        }
    };
    
    $scope.ValidarDatos = function(temaInvalido)
    {
        $scope.mensajeError = [];
        
        if(temaInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un tema válido.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].Tema.toLowerCase() == $scope.nuevoTema.Tema.toLowerCase()  && $scope.tema[k].TemaActividadId != $scope.nuevoTema.TemaActividadId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*El Tema  \"" + $scope.nuevoTema.Tema + "\" ya existe.";
                $scope.nuevoTema.Tema = "";
                return false;
            }
        }
        
        return true;
    };
    
    $scope.AgregarTemaActividad = function()    
    {
        AgregarTemaActividad($http, CONFIG, $q, $scope.nuevoTema).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.nuevoTema.TemaActividadId = data[1].Id; 
                $scope.tema.push($scope.nuevoTema);
                

                /*else
                {
                    //$('#modalTema').modal('toggle');
                    
                    ARTISTA.TerminarArtista($scope.nuevoArtista);
                }*/
                
                $scope.mensaje = "Tema agregado.";
                $scope.EnviarAlerta('Modal');
                $scope.nuevoTema = new TemaActividad();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeTema').modal('toggle');
            }

        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeTema').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarTemaActividad = function()
    {
        EditarTemaActividad($http, CONFIG, $q, $scope.nuevoTema).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.SetNuevoTema($scope.nuevoTema);
                $('#modalTema').modal('toggle');
                $scope.mensaje = "Tema editado.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeTema').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeTema').modal('toggle');
        });
    };
    
    $scope.SetNuevoTema = function(tema)
    {
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].TemaActividadId == tema.TemaActividadId)
            {
                $scope.tema[k] = SetTemaActividad(tema);
                break;
            }
        }
    };
    
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarTema = "";
                break;
            case 2:
                $scope.nuevoTema.Tema = "";
                break;
            default: 
                break;
        }
    };
    
    //------------------------------------ Borrar -------------------------------------------------------
    $scope.BorrarTema = function(tema)
    {
        $scope.temaBorrar = tema.TemaActividadId;
        
        $scope.mensajeBorrar = "¿Estas seguro de borrar \"" + tema.Tema + "\"?";
        $('#borrarTema').modal('toggle');
    };
    
    $scope.ConfirmarBorrarTema = function()
    {
        BorrarTemaActividad($http, CONFIG, $q, $scope.temaBorrar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                //$scope.GetArtista();
                
                for(var k=0; k<$scope.tema.length; k++)
                {
                    if($scope.tema[k].TemaActividadId == $scope.temaBorrar)
                    {
                        $scope.tema.splice(k,1);
                        break;
                    }
                }
                
                $scope.mensaje = "Tema borrado.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeTema').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeTema').modal('toggle');
        });
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetTemaActividad();
    
    //------------------------ Exterior ---------------------------
    /*$scope.$on('AgregarArtista',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevoArtista = new Artista();
    
        $('#mensajeArtista').modal('toggle');
    });*/
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoTema").alert();

            $("#alertaExitosoTema").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoTema").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoTema").alert();

            $("#alertaEditarExitosoTema").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoTema").fadeOut();
            }, 2000)
        }
    };
    
});

/*app.factory('ARTISTA',function($rootScope)
{
  var service = {};
  service.artista = null;
    
  service.AgregarArtista = function()
  {
      this.artista = null;
      $rootScope.$broadcast('AgregarArtista');
  };
    
  service.TerminarArtista = function(artista)
  {
      this.artista = artista;
      $rootScope.$broadcast('TerminarArtista');
  };
    
  service.GetArtista = function()
  {
      return this.artista;
  };

  return service;
});*/