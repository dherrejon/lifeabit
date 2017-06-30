app.controller("LugarController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, LUGAR)
{   
    $scope.lugar = [];
    
    $scope.ordenarLugar = "Nombre";
    $scope.buscarLugar = "";
    
    $scope.nuevoLugar = null;
    
    $scope.mensajeError = [];
    
    $scope.GetLugar = function()              
    {
        GetLugar($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.lugar = data;
            for(var k=0; k<data.length; k++)
            {
                $scope.lugar[k].DireccionHTML = $sce.trustAsHtml($scope.lugar[k].DireccionHTML);
            }
            
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarLugar = function(campoOrdenar)
    {
        if($scope.ordenarLugar == campoOrdenar)
        {
            $scope.ordenarLugar = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarLugar = campoOrdenar;
        }
    };
    
    //Filtrar
    $scope.FiltrarBuscarLugar = function(lugar)
    {
        if($scope.buscarLugar !== undefined)
        {
            if($scope.buscarLugar.length > 0)
            {
                var index = lugar.Nombre.toLowerCase().indexOf($scope.buscarLugar.toLowerCase());


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
                        if(lugar.Nombre[index-1] == " ")
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
    $scope.AbrirLugar= function(operacion, lugar)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevoLugar = new Lugar();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoLugar = SetLugar(lugar);
            $scope.nuevoLugar.DireccionHTML = $sce.trustAsHtml($scope.nuevoLugar.DireccionHTML);
        }
    
        $('#modalLugar').modal('toggle');
    };
     
    $scope.CerrarLugar = function()
    {
        $('#cerrarLugarModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarLugar = function()
    {
        $('#modalLugar').modal('toggle');
        $scope.mensajeError = [];
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarLugar = function(lugarInvalido)
    {
        if(!$scope.ValidarDatos(lugarInvalido))
        {
            $('#mensajeLugar').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.nuevoLugar.UsuarioId = $rootScope.UsuarioId;
                $scope.AgregarLugar();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarLugar();
            }
        }
    };
    
    $scope.ValidarDatos = function(lugarInvalido)
    {
        $scope.mensajeError = [];
        
        if(lugarInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre del lugar válido.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.lugar.length; k++)
        {
            if($scope.lugar[k].Nombre.toLowerCase() == $scope.nuevoLugar.Nombre.toLowerCase()  && $scope.lugar[k].LugarId != $scope.nuevoLugar.LugarId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*El lugar  \"" + $scope.nuevoLugar.Nombre + "\" ya existe.";
                $scope.nuevoLugar.Nombre = "";
                return false;
            }
        }
        
        return true;
    };
    
    $scope.AgregarLugar = function()    
    {
        AgregarLugar($http, CONFIG, $q, $scope.nuevoLugar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.nuevoLugar.LugarId = data[1].Id; 
                $scope.lugar.push($scope.nuevoLugar);
                
                if($scope.operacion == "Agregar")
                {
                    $scope.mensaje = "Lugar agregado.";
                    $scope.EnviarAlerta('Modal');
                    $scope.nuevoLugar = new Lugar();
                }
                else
                {
                    $('#modalLugar').modal('toggle');
                    
                    LUGAR.TerminarLugar($scope.nuevoLugar);
                }
                
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeLugar').modal('toggle');
            }

        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeLugar').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarLugar = function()
    {
        EditarLugar($http, CONFIG, $q, $scope.nuevoLugar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.SetNuevoLugar($scope.nuevoLugar);
                $('#modalLugar').modal('toggle');
                $scope.mensaje = "Lugar editado.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeLugar').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeLugar').modal('toggle');
        });
    };
    
    $scope.SetNuevoLugar = function(lugar)
    {
        for(var k=0; k<$scope.lugar.length; k++)
        {
            if($scope.lugar[k].LugarId == lugar.LugarId)
            {
                $scope.lugar[k] = SetLugar(lugar);
                $scope.lugar[k].DireccionHTML = $sce.trustAsHtml($scope.lugar[k].DireccionHTML);
                break;
            }
        }
    };
    
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarLugar = "";
                break;
            case 2:
                $scope.nuevoLugar.Nombre = "";
                break;
            default: 
                break;
        }
    };
    
    //------------------------------------ Borrar -------------------------------------------------------
    $scope.BorrarLugar = function(lugar)
    {
        $scope.lugarBorrar = lugar.LugarId;
        
        $scope.mensajeBorrar = "¿Estas seguro de borrar \"" + lugar.Nombre + "\"?";
        $('#borrarLugar').modal('toggle');
    };
    
    $scope.ConfirmarBorrarLugar = function()
    {
        BorrarLugar($http, CONFIG, $q, $scope.lugarBorrar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {   
                for(var k=0; k<$scope.lugar.length; k++)
                {
                    if($scope.lugar[k].LugarId == $scope.lugarBorrar)
                    {
                        $scope.lugar.splice(k,1);
                        break;
                    }
                }
                
                $scope.mensaje = "Lugar borrada.";
                $scope.EnviarAlerta('Vista');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeLugar').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeLugar').modal('toggle');
        });
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetLugar();
    
    //------------------------ Exterior ---------------------------
    $scope.$on('AgregarLugar',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevoLugar = new Lugar();
    
        $('#modalLugar').modal('toggle');
    });
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoLugar").alert();

            $("#alertaExitosoLugar").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoLugar").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoLugar").alert();

            $("#alertaEditarExitosoLugar").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoLugar").fadeOut();
            }, 2000)
        }
    };
    
});

app.factory('LUGAR',function($rootScope)
{
  var service = {};
  service.lugar = null;
    
  service.AgregarLugar = function()
  {
      this.lugar = null;
      $rootScope.$broadcast('AgregarLugar');
  };
    
  service.TerminarLugar = function(lugar)
  {
      this.lugar = lugar;
      $rootScope.$broadcast('TerminarLugar');
  };
    
  service.GetLugar = function()
  {
      return this.lugar;
  };

  return service;
});