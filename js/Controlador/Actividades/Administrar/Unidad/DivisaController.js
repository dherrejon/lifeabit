app.controller("DivisaController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, DIVISA)
{   
    $scope.divisa = [];
    
    $scope.ordenarDivisa = "Nombre";
    $scope.buscarDivisa = "";
    
    $scope.nuevaDivisa = null;
    
    $scope.mensajeError = [];
    
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
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarDivisa = function(campoOrdenar)
    {
        if($scope.ordenarFrecuencia == campoOrdenar)
        {
            $scope.ordenarDivisa = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarDivisa = campoOrdenar;
        }
    };
    
    //Filtrar
    $scope.FiltrarBuscarDivisa = function(divisa)
    {
        if($scope.buscarDivisa !== undefined)
        {
            if($scope.buscarDivisa.length > 0)
            {
                var index = divisa.Divisa.toLowerCase().indexOf($scope.buscarDivisa.toLowerCase());


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
                        if(divisa.Divisa[index-1] == " ")
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
    $scope.AbrirDivisa = function(operacion, divisa)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevaDivisa = new Divisa();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaDivisa = SetDivisa(divisa);
        }
    
        $('#modalDivisa').modal('toggle');
    };
     
    $scope.CerrarDivisa = function()
    {
        $('#cerrarDivisaModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarDivisa = function()
    {
        $('#modalDivisa').modal('toggle');
        $scope.mensajeError = [];
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarDivisa = function(divisaInvalido)
    {
        if(!$scope.ValidarDatos(divisaInvalido))
        {
            $('#mensajeDivisa').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.nuevaDivisa.UsuarioId = $rootScope.UsuarioId;
                $scope.AgregarDivisa();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarDivisa();
            }
        }
    };
    
    $scope.AgregarDivisa = function()    
    {
        AgregarDivisa($http, CONFIG, $q, $scope.nuevaDivisa).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.nuevaDivisa.DivisaId = data[1].Id; 
                $scope.divisa.push($scope.nuevaDivisa);
                
                if($scope.operacion == "Agregar")
                {
                    $scope.mensaje = "Divisa agregada.";
                    $scope.EnviarAlerta('Modal');
                    $scope.nuevaDivisa = new Divisa();
                }
                else
                {
                    $('#modalDivisa').modal('toggle');
                    
                    DIVISA.TerminarDivisa($scope.nuevaDivisa);
                }
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeDivisa').modal('toggle');
            }

        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeDivisa').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarDivisa = function()
    {
        EditarDivisa($http, CONFIG, $q, $scope.nuevaDivisa).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.SetNuevaDivisa($scope.nuevaDivisa);
                $('#modalDivisa').modal('toggle');
                $scope.mensaje = "Divisa editado.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeDivisa').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeDivisa').modal('toggle');
        });
    };
    
    $scope.SetNuevaDivisa = function(divisa)
    {
        for(var k=0; k<$scope.divisa.length; k++)
        {
            if($scope.divisa[k].DivisaId == divisa.DivisaId)
            {
                $scope.divisa[k] = SetDivisa(divisa);
                break;
            }
        }
    };
    
    $scope.ValidarDatos = function(divisaInvalido)
    {
        $scope.mensajeError = [];
        
        if(divisaInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una divisa válida.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.divisa.length; k++)
        {
            if($scope.divisa[k].Divisa.toLowerCase() == $scope.nuevaDivisa.Divisa.toLowerCase()  && $scope.divisa[k].DivisaId != $scope.nuevaDivisa.DivisaId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*La divisa " + $scope.nuevaDivisa.Divisa + " ya existe.";
                $scope.nuevaDivisa.Divisa = "";
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
                $scope.buscarDivisa = "";
                break;
            case 2:
                $scope.nuevaDivisa.Divisa = "";
                break;
            default: 
                break;
        }
    };
    
    //------------------------------------ Borrar -------------------------------------------------------
    $scope.BorrarDivisa = function(divisa)
    {
        $scope.divisaBorrar = divisa.DivisaId;
        
        $scope.mensajeBorrar = "¿Estas seguro de borrar " + divisa.Divisa + "?";
        $('#borrarDivisa').modal('toggle');
    };
    
    $scope.ConfirmarBorrarDivisa = function()
    {
        BorrarDivisa($http, CONFIG, $q, $scope.divisaBorrar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                //$scope.GetArtista();
                
                for(var k=0; k<$scope.divisa.length; k++)
                {
                    if($scope.divisa[k].DivisaId == $scope.divisaBorrar)
                    {
                        $scope.divisa.splice(k,1);
                        break;
                    }
                }
                
                $scope.mensaje = "Divisa borrada.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeDivisa').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeDivisa').modal('toggle');
        });
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetDivisa();
    
    //------------------------ Exterior ---------------------------
    $scope.$on('AgregarDivisa',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevaDivisa = new Divisa();
    
        $('#modalDivisa').modal('toggle');
    });
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoDivisa").alert();

            $("#alertaExitosoDivisa").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoDivisa").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoDivisa").alert();

            $("#alertaEditarExitosoDivisa").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoDivisa").fadeOut();
            }, 2000);
        }
    };
    
});

app.factory('DIVISA',function($rootScope)
{
  var service = {};
  service.divisa = null;
    
  service.AgregarDivisa = function()
  {
      this.divisa = null;
      $rootScope.$broadcast('AgregarDivisa');
  };
    
  service.TerminarDivisa = function(divisa)
  {
      this.divisa = divisa;
      $rootScope.$broadcast('TerminarDivisa');
  };
    
  service.GetDivisa = function()
  {
      return this.divisa;
  };

  return service;
});