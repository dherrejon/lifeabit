app.controller("FrecuenciaController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, FRECUENCIA)
{   
    $scope.frecuencia = [];
    
    $scope.ordenarFrecuencia = "Nombre";
    $scope.buscarFrecuencia = "";
    
    $scope.nuevaFrecuencia = null;
    
    $scope.mensajeError = [];
    
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
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarFrecuencia = function(campoOrdenar)
    {
        if($scope.ordenarFrecuencia == campoOrdenar)
        {
            $scope.ordenarFrecuencia = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarFrecuencia = campoOrdenar;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirFrecuencia = function(operacion, frecuencia)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevaFrecuencia = new Frecuencia();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaFrecuencia = SetFrecuencia(frecuencia);
        }
    
        $('#modalFrecuencia').modal('toggle');
    };
     
    $scope.CerrarFrecuencia = function()
    {
        $('#cerrarFrecuenciaModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarFrecuencia = function()
    {
        $('#modalFrecuencia').modal('toggle');
        $scope.mensajeError = [];
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarFrecuencia = function(frecuenciaInvalido)
    {
        if(!$scope.ValidarDatos(frecuenciaInvalido))
        {
            $('#mensajeFrecuencia').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.nuevaFrecuencia.UsuarioId = $rootScope.UsuarioId;
                $scope.AgregarFrecuencia();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarFrecuencia();
            }
        }
    };
    
    $scope.AgregarFrecuencia = function()    
    {
        AgregarFrecuencia($http, CONFIG, $q, $scope.nuevaFrecuencia).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.nuevaFrecuencia.FrecuenciaId = data[1].Id; 
                $scope.frecuencia.push($scope.nuevaFrecuencia);
                
                if($scope.operacion == "Agregar")
                {
                    $scope.mensaje = "Frecuencia agregado.";
                    $scope.EnviarAlerta('Modal');
                    $scope.nuevaFrecuencia = new Frecuencia();
                }
                else
                {
                    $('#modalFrecuencia').modal('toggle');
                    
                    FRECUENCIA.TerminarFrecuencia($scope.nuevaFrecuencia);
                }
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeFrecuencia').modal('toggle');
            }

        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeFrecuencia').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarFrecuencia = function()
    {
        EditarFrecuencia($http, CONFIG, $q, $scope.nuevaFrecuencia).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.SetNuevaFrecuencia($scope.nuevaFrecuencia);
                $('#modalFrecuencia').modal('toggle');
                $scope.mensaje = "Frecuencia editado.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeFrecuencia').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeFrecuencia').modal('toggle');
        });
    };
    
    $scope.SetNuevaFrecuencia = function(frecuencia)
    {
        for(var k=0; k<$scope.frecuencia.length; k++)
        {
            if($scope.frecuencia[k].FrecuenciaId == frecuencia.FrecuenciaId)
            {
                $scope.frecuencia[k] = SetFrecuencia(frecuencia);
                break;
            }
        }
    };
    
    $scope.ValidarDatos = function(frecuenciaInvalido)
    {
        $scope.mensajeError = [];
        
        if(frecuenciaInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una frecuencia válida.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.frecuencia.length; k++)
        {
            if($scope.frecuencia[k].Nombre.toLowerCase() == $scope.nuevaFrecuencia.Nombre.toLowerCase()  && $scope.frecuencia[k].FrecuenciaId != $scope.nuevaFrecuencia.FrecuenciaId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*La frecuencia " + $scope.nuevaFrecuencia.Nombre + " ya existe.";
                $scope.nuevaFrecuencia.Nombre = "";
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
                $scope.buscarFrecuencia = "";
                break;
            case 2:
                $scope.nuevaFrecuencia.Nombre = "";
                break;
            default: 
                break;
        }
    };
    
    //------------------------------------ Borrar -------------------------------------------------------
    $scope.BorrarFrecuencia = function(frecuencia)
    {
        $scope.frecuenciaBorrar = frecuencia.FrecuenciaId;
        
        $scope.mensajeBorrar = "¿Estas seguro de borrar " + frecuencia.Nombre + "?";
        $('#borrarFrecuencia').modal('toggle');
    };
    
    $scope.ConfirmarBorrarFrecuencia = function()
    {
        BorrarFrecuencia($http, CONFIG, $q, $scope.frecuenciaBorrar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                //$scope.GetArtista();
                
                for(var k=0; k<$scope.frecuencia.length; k++)
                {
                    if($scope.frecuencia[k].FrecuenciaId == $scope.frecuenciaBorrar)
                    {
                        $scope.frecuencia.splice(k,1);
                        break;
                    }
                }
                
                $scope.mensaje = "Frecuencia borrado.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeFrecuencia').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeFrecuencia').modal('toggle');
        });
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetFrecuencia();
    
    //------------------------ Exterior ---------------------------
    $scope.$on('AgregarFrecuencia',function()
    {
        $scope.operacion = "AgregarExterior";

        $scope.nuevaFrecuencia = new Frecuencia();
    
        $('#modalFrecuencia').modal('toggle');
    });
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoFrecuencia").alert();

            $("#alertaExitosoFrecuencia").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoFrecuencia").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoFrecuencia").alert();

            $("#alertaEditarExitosoFrecuencia").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoFrecuencia").fadeOut();
            }, 2000)
        }
    };
    
});

app.factory('FRECUENCIA',function($rootScope)
{
  var service = {};
  service.frecuencia = null;
    
  service.AgregarFrecuencia = function()
  {
      this.frecuencia = null;
      $rootScope.$broadcast('AgregarFrecuencia');
  };
    
  service.TerminarFrecuencia = function(frecuencia)
  {
      this.frecuencia = frecuencia;
      $rootScope.$broadcast('TerminarFrecuencia');
  };
    
  service.GetFrecuencia = function()
  {
      return this.frecuencia;
  };

  return service;
});