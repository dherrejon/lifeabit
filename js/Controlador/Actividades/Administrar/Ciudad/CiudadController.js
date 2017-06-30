app.controller("CiudadController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, CIUDAD)
{   
    $scope.ciudad = [];
    
    $scope.ciudad = [];
    $scope.pais = [];
    $scope.estado = [];
    
    $scope.ordenarCiudad = "Pais";
    $scope.buscarCiudad = "";
    
    $scope.nuevaCiudad = null;
    
    $scope.mensajeError = [];
    
    $scope.paisNuevo = false;
    $scope.estadoNuevo = false;
    
    $scope.GetCiudad = function()              
    {
        GetCiudad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.ciudad = data;
            
            $scope.SetPaisEstado($scope.ciudad);

        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetPaisEstado = function(ciudad)
    {
        var sql = "SELECT DISTINCT Pais FROM ?";
        $scope.pais = alasql(sql, [ciudad]);

        sql = "SELECT DISTINCT Pais, Estado FROM ?";
        $scope.estado = alasql(sql, [ciudad]);
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarCiudad = function(campoOrdenar)
    {
        if($scope.ordenarCiudad == campoOrdenar)
        {
            $scope.ordenarCiudad = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarCiudad = campoOrdenar;
        }
    };
    
    //Filtrar
    $scope.FiltrarBuscarCiudad = function(ciudad)
    {
        if($scope.buscarCiudad !== undefined)
        {
            if($scope.buscarCiudad.length > 0)
            {
                //Pais
                var index = ciudad.Pais.toLowerCase().indexOf($scope.buscarCiudad.toLowerCase());

                if(index >= 0)
                {
                    if(index === 0)
                    {
                        return true;
                    }
                    else
                    {
                        if(ciudad.Pais[index-1] == " ")
                        {
                            return true;
                        }
                    }
                }
                
                //Estado
                index = ciudad.Estado.toLowerCase().indexOf($scope.buscarCiudad.toLowerCase());

                if(index >= 0)
                {
                    if(index === 0)
                    {
                        return true;
                    }
                    else
                    {
                        if(ciudad.Estado[index-1] == " ")
                        {
                            return true;
                        }
                    }
                }
                
                //Ciudad
                index = ciudad.Ciudad.toLowerCase().indexOf($scope.buscarCiudad.toLowerCase());

                if(index >= 0)
                {
                    if(index === 0)
                    {
                        return true;
                    }
                    else
                    {
                        if(ciudad.Ciudad[index-1] == " ")
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
                    return false;
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
    $scope.AbrirCiudad = function(operacion, ciudad)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevaCiudad = new Ciudad();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaCiudad = SetCiudad(ciudad);
        }
    
        $('#modalCiudad').modal('toggle');
    };
     
    $scope.CerrarCiudad = function()
    {
        $('#cerrarCiudadModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarCiudad = function()
    {
        $('#modalCiudad').modal('toggle');
        $scope.mensajeError = [];
    };
    
    /*-------------- Operaciones de agergar Editar ---------------------*/
    $scope.CambiarPais = function(pais)
    {
        if(pais == 'AgregarPais')
        {
            $scope.paisNuevo = true;
            $scope.estadoNuevo = true;
            
            $scope.nuevaCiudad.Pais = "";
            $scope.nuevaCiudad.Estado = "";
            
            $("#paisNuevo").focus();
        }
        else
        {
            if(pais != $scope.nuevaCiudad.Pais)
            {
                $scope.nuevaCiudad.Pais = pais;
                
                $scope.paisNuevo = false;
                $scope.estadoNuevo = false;
                
                $scope.nuevaCiudad.Estado = "";
            }
        }
    };
    
    $scope.CambiarEstado = function(estado)
    {
        if(estado == 'AgregarEstado')
        {
            $scope.estadoNuevo = true;
            
            $scope.nuevaCiudad.Estado = "";
            
            $("#estadoNuevo").focus();
        }
        else
        {
            if(estado != $scope.nuevaCiudad.Estado)
            {
                $scope.nuevaCiudad.Estado = estado;
                
                $scope.estadoNuevo = false;
                
            }
        }
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarCiudad = function(paisInvalido, estadoInvalido, ciudadInvalido)
    {
        if(!$scope.ValidarDatos(paisInvalido, estadoInvalido, ciudadInvalido))
        {
            $('#mensajeCiudad').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.nuevaCiudad.UsuarioId = $rootScope.UsuarioId;
                $scope.AgregarCiudad();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarCiudad();
            }
        }
    };
    
    $scope.ValidarDatos = function(paisInvalido, estadoInvalido, ciudadInvalido)
    {
        $scope.mensajeError = [];
        
        if(paisInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un país.";
        }
        
        if(estadoInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un estado.";
        }
        
        
        if(ciudadInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una ciudad.";
        }
        
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.ciudad.length; k++)
        {
            if($scope.ciudad[k].Pais.toLowerCase() == $scope.nuevaCiudad.Pais.toLowerCase() && $scope.ciudad[k].Estado.toLowerCase() == $scope.nuevaCiudad.Estado.toLowerCase() && $scope.ciudad[k].Ciudad.toLowerCase() == $scope.nuevaCiudad.Ciudad.toLowerCase() && $scope.ciudad[k].CiudadId != $scope.nuevaCiudad.CiudadId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*La ciudad  \"" + $scope.nuevaCiudad.Pais + " " + $scope.nuevaCiudad.Estado + " " +$scope.nuevaCiudad.Ciudad  + "\" ya existe.";
                $scope.nuevaCiudad.Ciudad = "";
                return false;
            }
        }
        
        return true;
    };
    
    $scope.AgregarCiudad = function()    
    {
        AgregarCiudad($http, CONFIG, $q, $scope.nuevaCiudad).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.nuevaCiudad.CiudadId = data[1].Id; 
                $scope.ciudad.push($scope.nuevaCiudad);
                $scope.SetPaisEstado($scope.ciudad);
                
                if($scope.operacion == "Agregar")
                {
                    $scope.mensaje = "Ciudad agregada.";
                    $scope.EnviarAlerta('Modal');
                    $scope.nuevaCiudad = new Ciudad();
                }
                else
                {
                    $('#modalCiudad').modal('toggle');
                    CIUDAD.TerminarCiudad($scope.nuevaCiudad);
                }
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeCiudad').modal('toggle');
            }

        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeCiudad').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarCiudad = function()
    {
        EditarCiudad($http, CONFIG, $q, $scope.nuevaCiudad).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.SetNuevaCiudad($scope.nuevaCiudad);
                $('#modalCiudad').modal('toggle');
                $scope.mensaje = "Ciudad editada.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeCiudad').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeCiudad').modal('toggle');
        });
    };
    
    $scope.SetNuevaCiudad = function(ciudad)
    {
        for(var k=0; k<$scope.ciudad.length; k++)
        {
            if($scope.ciudad[k].CiudadId == ciudad.CiudadId)
            {
                $scope.ciudad[k] = SetCiudad(ciudad);
                
                $scope.SetPaisEstado($scope.ciudad);
                break;
            }
        }
    };
    
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarCiudad = "";
                break;
            case 2:
                $scope.nuevaCiudad.Ciudad = "";
                $("#ciudadNuevo").focus();
                break;
            default: 
                break;
        }
    };
    
    //------------------------------------ Borrar -------------------------------------------------------
    $scope.BorrarCiudad = function(ciudad)
    {
        $scope.ciudadBorrar = ciudad.CiudadId;
        
        $scope.mensajeBorrar = "¿Estas seguro de borrar \"" + ciudad.Pais + " " + ciudad.Estado + " " + ciudad.Ciudad +  "\"?";
        $('#borrarCiudad').modal('toggle');
    };
    
    $scope.ConfirmarBorrarCiudad= function()
    {
        BorrarCiudad($http, CONFIG, $q, $scope.ciudadBorrar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                for(var k=0; k<$scope.ciudad.length; k++)
                {
                    if($scope.ciudad[k].CiudadId == $scope.ciudadBorrar)
                    {
                        $scope.ciudad.splice(k,1);
                        break;
                    }
                }
                
                $scope.mensaje = "Ciudad borrada.";
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
    $scope.GetCiudad();
    
    //------------------------ Exterior ---------------------------
    $rootScope.$on('AgregarCiudadNuevo',function()
    {
        var campo = CIUDAD.GetCampo();
        
        if(campo == "Pais")
        {
            $scope.paisNuevo = true;
            $scope.estadoNuevo = true;
        }
        else if(campo == "Estado")
        {
            $scope.paisNuevo = false;
            $scope.estadoNuevo = true;
        }
        else if(campo == "Ciudad")
        {
            $scope.paisNuevo = false;
            $scope.estadoNuevo = false;
        }
        
        $scope.operacion = "AgregarExterior";

        $scope.nuevaCiudad = new Ciudad();
        $scope.nuevaCiudad = SetCiudad(CIUDAD.GetCiudad());
         $scope.nuevaCiudad.CiudadId = "";
    
        $('#modalCiudad').modal('toggle');
    });
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoCiudad").alert();

            $("#alertaExitosoCiudad").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoCiudad").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoCiudad").alert();

            $("#alertaEditarExitosoCiudad").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoCiudad").fadeOut();
            }, 2000)
        }
    };
    
});

app.factory('CIUDAD',function($rootScope)
{
  var service = {};
  service.ciudad = null;
  service.campo = null;
    
  service.AgregarCiudad = function(ciudad, campo)
  {
      this.ciudad = SetCiudad(ciudad);
      this.campo = campo;
      $rootScope.$broadcast('AgregarCiudadNuevo');
  };
    
  service.TerminarCiudad = function(ciudad)
  {
      this.ciudad = ciudad;
      $rootScope.$broadcast('TerminarCiudad');
  };
    
  service.GetCiudad = function()
  {
      return this.ciudad;
  };
    
  service.GetCampo = function()
  {
      return this.campo;
  };

  return service;
});