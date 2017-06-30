app.controller("PersonaActividadController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.persona = [];
    
    $scope.ordenarPersona= "Nombre";
    $scope.buscarPersona = "";
    
    $scope.nuevaPersona = null;
    
    $scope.mensajeError = [];
    
    $scope.GetPersonaActividad = function()              
    {
        GetPersonaActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.persona = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarPersona = function(campoOrdenar)
    {
        if($scope.ordenarPersona == campoOrdenar)
        {
            $scope.ordenarPersona = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarPersona = campoOrdenar;
        }
    };
    
    //Filtrar
    $scope.FiltrarBuscarPersona = function(persona)
    {
        if($scope.buscarPersona !== undefined)
        {
            if($scope.buscarPersona.length > 0)
            {
                var index = persona.Nombre.toLowerCase().indexOf($scope.buscarPersona.toLowerCase());


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
                        if(persona.Nombre[index-1] == " ")
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
    $scope.AbrirPersonaActividad = function(operacion, persona)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Agregar")
        {
            $scope.nuevaPersona = new PersonaActividad();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaPersona = SetPersonaActividad(persona);
        }
    
        $('#modalPersona').modal('toggle');
    };
     
    $scope.CerrarPersona = function()
    {
        $('#cerrarPersonaModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarPersona = function()
    {
        $('#modalPersona').modal('toggle');
        $scope.mensajeError = [];
    };
    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarPersona = function(personaInvalida)
    {
        if(!$scope.ValidarDatos(personaInvalida))
        {
            $('#mensajePersona').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar" || $scope.operacion == "AgregarExterior")
            {
                $scope.nuevaPersona.UsuarioId = $rootScope.UsuarioId;
                $scope.AgregarPersonaActividad();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarPersonaActividad();
            }
        }
    };
    
    $scope.ValidarDatos = function(personaInvalida)
    {
        $scope.mensajeError = [];
        
        if(personaInvalida)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre de la persona válido.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        for(var k=0; k<$scope.persona.length; k++)
        {
            if($scope.persona[k].Nombre.toLowerCase() == $scope.nuevaPersona.Nombre.toLowerCase()  && $scope.persona[k].PersonaId != $scope.nuevaPersona.PersonaId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*La persona  \"" + $scope.nuevaPersona.Nombre + "\" ya existe.";
                $scope.nuevaPersona.Nombre = "";
                return false;
            }
        }
        
        return true;
    };
    
    $scope.AgregarPersonaActividad = function()    
    {
        AgregarPersonaActividad($http, CONFIG, $q, $scope.nuevaPersona).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.nuevaPersona.PersonaId = data[1].Id; 
                $scope.persona.push($scope.nuevaPersona);
                
                $scope.mensaje = "Persona agregada.";
                $scope.EnviarAlerta('Modal');
                $scope.nuevaPersona = new PersonaActividad();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajePersona').modal('toggle');
            }

        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajePersona').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarPersonaActividad = function()
    {
        EditarPersonaActividad($http, CONFIG, $q, $scope.nuevaPersona).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.SetNuevaPersona($scope.nuevaPersona);
                $('#modalPersona').modal('toggle');
                $scope.mensaje = "Persona editada.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajePersona').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajePersona').modal('toggle');
        });
    };
    
    $scope.SetNuevaPersona = function(persona)
    {
        for(var k=0; k<$scope.persona.length; k++)
        {
            if($scope.persona[k].PersonaId == persona.PersonaId)
            {
                $scope.persona[k] = SetPersonaActividad(persona);
                break;
            }
        }
    };
    
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarPersona = "";
                break;
            case 2:
                $scope.nuevaPersona.Nombre = "";
                break;
            default: 
                break;
        }
    };
    
    //------------------------------------ Borrar -------------------------------------------------------
    $scope.BorrarPersona = function(persona)
    {
        $scope.personaBorrar = persona.PersonaId;
        
        $scope.mensajeBorrar = "¿Estas seguro de borrar \"" + persona.Nombre + "\"?";
        $('#borrarPersona').modal('toggle');
    };
    
    $scope.ConfirmarBorrarPersona = function()
    {
        BorrarPersonaActividad($http, CONFIG, $q, $scope.personaBorrar).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                //$scope.GetArtista();
                
                for(var k=0; k<$scope.persona.length; k++)
                {
                    if($scope.persona[k].PersonaId == $scope.personaBorrar)
                    {
                        $scope.persona.splice(k,1);
                        break;
                    }
                }
                
                $scope.mensaje = "Persona borrada.";
                $scope.EnviarAlerta('Vista');
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajePersona').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajePersona').modal('toggle');
        });
    };
    
    //----------------------Inicializar---------------------------------
    $scope.GetPersonaActividad();
    
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
            $("#alertaExitosoPersona").alert();

            $("#alertaExitosoPersona").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoPersona").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoPersona").alert();

            $("#alertaEditarExitosoPersona").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoPersona").fadeOut();
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