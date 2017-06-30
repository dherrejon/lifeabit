app.controller("UnidadController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, UNIDAD)
{   
    $scope.unidad = [];
    
    $scope.ordenarUnidad = "Unidad";
    $scope.buscarUnidad = "";
    
    $scope.nuevaUnidad = null;
    
    $scope.mensajeError = [];
    
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
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarUnidad = function(campoOrdenar)
    {
        if($scope.ordenarUnidad == campoOrdenar)
        {
            $scope.ordenarUnidad = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarUnidad = campoOrdenar;
        }
    };

    //Filtrar
    $scope.FiltrarBuscarUnidad = function(unidad)
    {
        if($scope.buscarUnidad !== undefined)
        {
            if($scope.buscarUnidad.length > 0)
            {
                var index = unidad.Unidad.toLowerCase().indexOf($scope.buscarUnidad.toLowerCase());


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
                        if(unidad.Unidad[index-1] == " ")
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
    $scope.AbrirUnidad= function(operacion, unidad)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevaUnidad = new Unidad();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaUnidad = SetUnidad(unidad);
        }
    
        $('#modalUnidad').modal('toggle');
    };
     
    $scope.CerrarUnidad = function()
    {
        $('#cerrarUnidadModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarUnidad = function()
    {
        $('#modalUnidad').modal('toggle');
        $scope.mensajeError = [];
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarUnidad = function(unidadInvalido)
    {
        if(!$scope.ValidarDatos(unidadInvalido))
        {
            $('#mensajeUnidad').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.nuevaUnidad.UsuarioId = $rootScope.UsuarioId;
                $scope.AgregarUnidad();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarUnidad();
            }
        }
    };
    
    $scope.AgregarUnidad = function()    
    {
        AgregarUnidad($http, CONFIG, $q, $scope.nuevaUnidad).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.nuevaUnidad.UnidadId = data[1].Id; 
                $scope.unidad.push($scope.nuevaUnidad);
                
                if($scope.operacion == "Agregar")
                {
                    $scope.mensaje = "Unidad agregada.";
                    $scope.EnviarAlerta('Modal');
                    $scope.nuevaUnidad = new Unidad();
                }
                else
                {
                    $('#modalUnidad').modal('toggle');
                    
                    UNIDAD.TerminarUnidad($scope.nuevaUnidad);
                }
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeUnidad').modal('toggle');
            }

        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeUnidad').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarUnidad = function()
    {
        EditarUnidad($http, CONFIG, $q, $scope.nuevaUnidad).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.SetNuevaUnidad($scope.nuevaUnidad);
                $('#modalUnidad').modal('toggle');
                $scope.mensaje = "Unidad editada.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeUnidad').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeUnidad').modal('toggle');
        });
    };
    
    $scope.SetNuevaUnidad = function(unidad)
    {
        for(var k=0; k<$scope.unidad.length; k++)
        {
            if($scope.unidad[k].UnidadId == unidad.UnidadId)
            {
                $scope.unidad[k] = SetUnidad(unidad);
                break;
            }
        }
    };
    
    $scope.ValidarDatos = function(unidadInvalido)
    {
        $scope.mensajeError = [];
        
        if(unidadInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una unidad válida.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.unidad.length; k++)
        {
            if($scope.unidad[k].Unidad.toLowerCase() == $scope.nuevaUnidad.Unidad.toLowerCase()  && $scope.unidad[k].UnidadId != $scope.nuevaUnidad.UnidadId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*La unidad \"" + $scope.nuevaUnidad.Unidad + "\" ya existe.";
                $scope.nuevaUnidad.Unidad = "";
                return false;
            }
        }
        
        return true;
    };
    
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarUnidad = "";
                break;
            case 2:
                $scope.nuevaUnidad.Unidad = "";
                break;
            default: 
                break;
        }
    };
    
    //------------------------------------ Borrar -------------------------------------------------------
    $scope.BorrarUnidad = function(unidad)
    {
        $scope.unidadBorrar = unidad.UnidadId;
        
        $scope.mensajeBorrar = "¿Estas seguro de borrar " + unidad.Unidad + "?";
        $('#borrarUnidad').modal('toggle');
    };
    
    $scope.ConfirmarBorrarUnidad = function()
    {
        BorrarUnidad($http, CONFIG, $q, $scope.unidadBorrar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                //$scope.GetArtista();
                
                for(var k=0; k<$scope.unidad.length; k++)
                {
                    if($scope.unidad[k].UnidadId == $scope.unidadBorrar)
                    {
                        $scope.unidad.splice(k,1);
                        break;
                    }
                }
                
                $scope.mensaje = "Unidad borrada.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeUnidad').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeUnidad').modal('toggle');
        });
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetUnidad();
    
    //------------------------ Exterior ---------------------------
    $scope.$on('AgregarUnidad',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevaUnidad = new Unidad();
    
        $('#modalUnidad').modal('toggle');
    });
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoUnidad").alert();

            $("#alertaExitosoUnidad").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoUnidad").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoUnidad").alert();

            $("#alertaEditarExitosoUnidad").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoUnidad").fadeOut();
            }, 2000)
        }
    };
    
});

app.factory('UNIDAD',function($rootScope)
{
  var service = {};
  service.unidad = null;
    
  service.AgregarUnidad = function()
  {
      this.unidad = null;
      $rootScope.$broadcast('AgregarUnidad');
  };
    
  service.TerminarUnidad = function(unidad)
  {
      this.unidad = unidad;
      $rootScope.$broadcast('TerminarUnidad');
  };
    
  service.GetUnidad = function()
  {
      return this.unidad;
  };

  return service;
});   