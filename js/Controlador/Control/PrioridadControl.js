app.controller("PrioridadController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, $location, LifeService)
{   
    
    $scope.$on('AdministrarPrioridad',function(evento)
    {        
        $('#prioridadModal').modal('toggle');
    });
    
    
    $scope.AbrirPrioridad = function(operacion, prioridad)
    {
        $scope.mesajeError = [];
        $scope.operacion = operacion;
        
        $scope.nuevaPrioridad = new Prioridad();
        
        if(operacion == "Editar")
        {
            $scope.nuevaPrioridad.PrioridadId =  prioridad.PrioridadId;
            $scope.nuevaPrioridad.Nombre =  prioridad.Nombre;
            $scope.nuevaPrioridad.Orden =  prioridad.Orden;
        }
        
        $scope.init = jQuery.extend({}, $scope.nuevaPrioridad);
        $('#prioridadAdmModal').modal('toggle');
    };
    
    $scope.TerminarPrioridad = function()
    {
        if(!$scope.ValidarPrioridad())
        {
            $('#mensajeError').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Agregar")
            {
                $scope.nuevaPrioridad.UsuarioId =  $scope.usuarioLogeado.UsuarioId;
                $scope.nuevaPrioridad.Orden = $scope.prioridad.length + 1;
                $scope.AgregarPrioridad();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarPrioridad();
            }
        }
    };
    
    $scope.ValidarPrioridad = function()
    {
        $rootScope.mensajeError = [];
        
        //var orden = parseInt($scope.nuevaPrioridad.Orden);
        
        if(!$scope.nuevaPrioridad.Nombre)
        {
            $rootScope.mensajeError[$rootScope.mensajeError.length] = "*Escribe el nombre de la prioridad";
        }
        
        /*if(!orden || (orden < 1 || orden >5))
        {
             $rootScope.mensajeError[$rootScope.mensajeError.length] = "*El orden puede ser entre 1 y 5";
        }*/
        
        if($rootScope.mensajeError.length > 0)
        {
            return false;
        }
        else
        {
            return true;
        }
    };
    
    $scope.AgregarPrioridad = function()
    {
        (self.servicioObj = LifeService.Post('AgregarPrioridad', $scope.nuevaPrioridad)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.GetPrioridad();
                $('#prioridadAdmModal').modal('toggle');
                $rootScope.$broadcast('Alerta', 'La prioridad se agrego.','exito');
                                
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
    
    $scope.EditarPrioridad = function()
    {
        (self.servicioObj = LifeService.Put('EditarPrioridad', $scope.nuevaPrioridad)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.GetPrioridad();
                $('#prioridadAdmModal').modal('toggle');
                //$rootScope.$broadcast('Alerta', 'La prioridad se agrego.','exito');
                                
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
    
    //------------- Borrar ----------------
    $scope.BorrarPrioridad = function(prioridad)
    {
        $scope.borrarPrioridad = prioridad;

        $scope.mensajeBorrar = "¿Estas seguro de eliminar la prioridad \"" + prioridad.Nombre + "\"?";

        $("#borrarPrioridad").modal('toggle');
    };
    
    $scope.ConfirmarBorrarPrioridad = function()
    {
        var prioridad = [];
        var orden = parseInt($scope.borrarPrioridad.Orden);
        
        for(var k=0; k<$scope.prioridad.length; k++)
        {
            var p = new Prioridad();
            p.PrioridadId = $scope.prioridad[k].PrioridadId;
            p.Orden = parseInt($scope.prioridad[k].Orden);
            p.Eliminar = false;
            if($scope.prioridad[k].PrioridadId == $scope.borrarPrioridad.PrioridadId)
            {
                p.Eliminar = true;
            }
            else
            {
                if(p.Orden > orden)
                {
                    p.Orden--;
                }
            }
            
            prioridad.push(p);
        }
        
        (self.servicioObj = LifeService.Delete('BorrarPrioridad', prioridad )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.Borrar = $scope.borrarPrioridad.PrioridadId;
                
                setTimeout(function()
                {
                    for(var i=0; i<prioridad.length; i++)
                    {
                        for(var j=0; j<$scope.prioridad.length; j++)
                        {
                            if($scope.prioridad[j].PrioridadId == prioridad[i].PrioridadId)
                            {
                                if(!prioridad[i].Eliminar)
                                {
                                    $scope.prioridad[j].Orden = prioridad[i].Orden.toString(); 
                                }
                                else
                                {
                                    $scope.prioridad.splice(j,1);
                                }
                                
                                break;
                            }

                        }
                    }   
                    
                    $scope.Borrar = "";
                    
                    $scope.$apply();
                }, 700);
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

    //----------------- cambiar orden ---
    $scope.BajarOrdenPrioridad = function(data)
    {
        $scope.optOrden = "Bajar";
        var priordidad = [];
        var p = new Prioridad();
        p.PrioridadId = data.PrioridadId;
        p.Orden = parseInt(data.Orden) +1;
        priordidad.push(p);
        
        for(var k=0; k<$scope.prioridad.length; k++)
        {
            if(parseInt($scope.prioridad[k].Orden) ==  priordidad[0].Orden)
            {
                p = new Prioridad();
                p.PrioridadId = $scope.prioridad[k].PrioridadId;
                p.Orden = parseInt($scope.prioridad[k].Orden) -1;
                priordidad.push(p);
                break;
            }
        }
        
        $scope.EditarOrdenPrioridad(priordidad);
    };
    
    $scope.SubirOrdenPrioridad = function(data)
    {
        $scope.optOrden = "Subir";
        var priordidad = [];
        var p = new Prioridad();
        p.PrioridadId = data.PrioridadId;
        p.Orden = parseInt(data.Orden) -1;
        priordidad.push(p);
        
        for(var k=0; k<$scope.prioridad.length; k++)
        {
            if(parseInt($scope.prioridad[k].Orden) ==  priordidad[0].Orden)
            {
                p = new Prioridad();
                p.PrioridadId = $scope.prioridad[k].PrioridadId;
                p.Orden = parseInt($scope.prioridad[k].Orden) +1;
                priordidad.push(p);
                break;
            }
        }
        
        $scope.EditarOrdenPrioridad(priordidad);
    };
    
    $scope.EditarOrdenPrioridad = function(prioridad)
    {
        (self.servicioObj = LifeService.Put('EditarOrdenPrioridad', prioridad )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                //$scope.GetPrioridad();
                for(var i=0; i<prioridad.length; i++)
                {
                    for(var j=0; j<$scope.prioridad.length; j++)
                    {
                        if($scope.prioridad[j].PrioridadId == prioridad[i].PrioridadId )
                        {
                            $scope.prioridad[j].Orden = prioridad[i].Orden.toString(); 
                            break;
                        }
                    }
                }
                
                if($scope.optOrden == "Subir")
                {
                    $scope.Subir = prioridad[0].PrioridadId;
                    $scope.Bajar = prioridad[1].PrioridadId;
                }
                else if($scope.optOrden == "Bajar")
                {
                    $scope.Subir = prioridad[1].PrioridadId;
                    $scope.Bajar = prioridad[0].PrioridadId;
                }
                
                $scope.priodadOrden = prioridad;
                setTimeout(function()
                {
                     $scope.Bajar = "";
                     $scope.Subir = "";
                     $scope.$apply();
                }, 700);
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
    
    $(document).on('hide.bs.modal','#prioridadModal', function () 
    {
        $rootScope.$broadcast('TerminarPrioridad');
        $scope.$apply();
    });
    
});
