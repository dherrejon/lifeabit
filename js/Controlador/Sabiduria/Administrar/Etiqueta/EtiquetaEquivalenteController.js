app.controller("EtiquetaEquivalenteController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, EEQUIVALENTE)
{   
    $scope.equivalente = null;
    $scope.etiqueta = [];
    
    $scope.buscarEtiqueta = "";
    
    $scope.GetEtiquetaEquivalente = function(id)              
    {
        GetEtiquetaEquivalente($http, $q, CONFIG, id).then(function(data)
        {
            $scope.equivalente.Etiqueta = data;
            $scope.equivalenteInicial = jQuery.extend({}, $scope.equivalente);
        
            $scope.OcultarEtiqueta(data);
            $scope.OcultarEtiquetaEquivalente();
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetEtiquetaEquivalenteAgregar = function(id)              
    {
        GetEtiquetaEquivalente($http, $q, CONFIG, id).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                for(var i=0; i<$scope.etiqueta.length; i++)
                {
                    if(data[k].EtiquetaId == $scope.etiqueta[i].EtiquetaId)
                    {
                        if($scope.etiqueta[i].mostrar)
                        {
                            $scope.AgregarEtiqueta($scope.etiqueta[i], false);
                        }
                        
                        break;
                    }
                }
            }
            
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    //-------------------- Filtro -----------------
    $scope.BuscarEtiqueta = function(etiqueta)
    {
        return FiltrarBuscarEtiqueta(etiqueta, $scope.buscarEtiqueta);
    };
    
    
    //----Quitar
    $scope.QuitarEtiquetaEquivalente = function(etiqueta)
    {
        
        for(var k=0; k<$scope.equivalente.Etiqueta.length; k++)
        {
            if(etiqueta == $scope.equivalente.Etiqueta[k])
            {
                $scope.equivalente.Etiqueta.splice(k,1);
                break;
            }
        }
        
        if(etiqueta.EtiquetaId != "-1")
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.etiqueta[k].mostrar = true;
                    return;
                }
            }
        }
    };
    
    //--------- control de etiquetas ------
    $('#nuevaEtiquetaEquivalente').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.IdentificarEtiqueta();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.AgregarEtiqueta = function(etiqueta, getEquivalente)
    {
        $scope.equivalente.Etiqueta.push(etiqueta);
        
        etiqueta.mostrar = false;
        $scope.buscarEtiqueta = "";
        
        if(getEquivalente)
        {
            $scope.GetEtiquetaEquivalenteAgregar(etiqueta.EtiquetaId);
        }
    };
    
    $scope.IdentificarEtiqueta = function()
    {
        if($rootScope.erEtiqueta.test($scope.buscarEtiqueta))
        {
            $scope.AgregarNuevaEtiqueta($scope.buscarEtiqueta);
            $scope.buscarEtiqueta = "";
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            //$scope.buscarEtiqueta = "";
            $('#mensajeEtiquetaEquivalente').modal('toggle');
            $scope.$apply();
            return;
        }
    };
    
    $scope.AgregarNuevaEtiqueta = function(etiqueta)
    {
        if(etiqueta.length > 0)
        {
            if(!$scope.ValidarEtiquetaAgregado(etiqueta))
            {
                $scope.$apply();
                return;    
            }
            else
            {
                $scope.EsNuevaEtiqueta(etiqueta);
            }
        }
    };
    
    $scope.EsNuevaEtiqueta = function(nueva)
    {
        var etiqueta = new Etiqueta();
        etiqueta.Nombre = nueva.charAt(0).toUpperCase() + nueva.substr(1).toLowerCase();
        etiqueta.EtiquetaId = "-1";
        
        $scope.equivalente.Etiqueta.push(etiqueta);
        $scope.buscarEtiqueta = "";
        $scope.$apply();
    };

    
    $scope.ValidarEtiquetaAgregado = function(concepto)
    {
        if($rootScope.erEtiqueta.test(concepto))
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].Nombre.toLowerCase() == concepto.toLowerCase())
                {
                    if($scope.etiqueta[k].mostrar)
                    {
                        $scope.AgregarEtiqueta($scope.etiqueta[k], true);
                        return false;
                    }
                    else
                    {
                        $scope.mensajeError = [];
                        //$scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                        $scope.buscarEtiqueta = "";
                        //$('#mensajeEtiquetaEquivalente').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.equivalente.Etiqueta.length; k++)
            {
                if($scope.equivalente.Etiqueta[k].Nombre.toLowerCase() == concepto.toLowerCase())
                {                    
                    $scope.mensajeError = [];
                    //$scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                    $scope.buscarEtiqueta = "";
                    //$('#mensajeEtiquetaEquivalente').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            $scope.buscarEtiqueta = "";
            $('#mensajeEtiquetaEquivalente').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    $scope.QuitarEtiqueta = function(etiqueta)
    {
        
        for(var k=0; k<$scope.nuevaNota.Etiqueta.length; k++)
        {
            if(etiqueta == $scope.nuevaNota.Etiqueta[k])
            {
                $scope.nuevaNota.Etiqueta.splice(k,1);
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
    
    $scope.EditarEtiqueta = function(etiqueta)
    {
        if(etiqueta.EtiquetaId == "-1")
        {
            $scope.buscarEtiqueta = etiqueta.Nombre;
            
            for(var k=0; k<$scope.equivalente.Etiqueta.length; k++)
            {
                if($scope.equivalente.Etiqueta[k].Nombre == etiqueta.Nombre)
                {
                    $scope.equivalente.Etiqueta.splice(k,1);
                    break;
                }
            }
            
            $("#nuevaEtiquetaEquivalente").focus();
        }
    };
    
    //------------ Terminar Etiqueta Equivalente ------------
    $scope.TerminarEtiquetaEquivalente = function()
    {
        $scope.equivalente.UsuarioId = $rootScope.UsuarioId;
        
        SetEtiquetaEquivalente($http, CONFIG, $q, $scope.equivalente).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.SetNuevasEtiquetas($scope.equivalente.Etiqueta, data[1].Etiqueta);
                $('#modalEtiquetaEquivalente').modal('toggle');
            }
            else
            {
                $scope.mensajeError = [];
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeEtiquetaEquivalente').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeEtiquetaEquivalente').modal('toggle');
        });  
    };
    
    $scope.SetNuevasEtiquetas = function(nueva, etiqueta)
    {
        var count  = nueva.length;
        var sql = "SELECT * FROM ? WHERE EtiquetaId = '-1'";
        nueva = alasql(sql, [nueva]);
        
        for(var i=0; i<nueva.length; i++)
        {
            for(var j=0; j<etiqueta.length; j++)
            {
                if(etiqueta[j].Nombre == nueva[i].Nombre)
                {
                    nueva[i].EtiquetaId = etiqueta[j].EtiquetaId;
                    //nueva[i].show = true;
                    etiqueta.splice(j,1);
                    
                    break;
                }
            }
        }
        
        EEQUIVALENTE.SentNuevaEtiqueta(nueva, count);
    };
    
    //-------------------- Cerrar modal -----------------
    $scope.CerrarEtiquetaEquivalenteModal = function()
    {
        if(JSON.stringify($scope.equivalente) === JSON.stringify($scope.equivalenteInicial))
        {
            $scope.ConfirmarCerrarEtiquetaModal();
        }
        else
        {
            $('#cerrarEtiquetaEquivalenteModal').modal('toggle');
        }
    };
    
    $scope.ConfirmarCerrarEtiquetaModal = function()
    {
        $('#modalEtiquetaEquivalente').modal('toggle');
        $scope.mensajeError = [];
        $scope.buscarEtiqueta = "";
    };
    
    
    /*---------------- EXTERIOR -------------------------*/
    $scope.$on('SetEtiquetaEquivalente',function()
    {
        $('#modalEtiquetaEquivalente').modal('toggle');
           
        $scope.equivalente = jQuery.extend({}, EEQUIVALENTE.GetEquivalente());
        $scope.etiqueta = EEQUIVALENTE.GetEtiqueta();
        
        $scope.GetEtiquetaEquivalente($scope.equivalente.EtiquetaId);
        
        $scope.MostrarEtiqueta();
    });
    
    $scope.MostrarEtiqueta = function()
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            $scope.etiqueta[k].mostrar = true;
        }
    };
    
    $scope.OcultarEtiqueta = function(etiqueta)
    {
        for(var i=0; i<etiqueta.length; i++)
        {
            for(var j=0; j<$scope.etiqueta.length; j++)
            {
                if($scope.etiqueta[j].EtiquetaId == etiqueta[i].EtiquetaId)
                {
                    $scope.etiqueta[j].mostrar = false;
                    break;
                }
            }
        }
    };
    
    $scope.OcultarEtiquetaEquivalente = function(etiqueta)
    {
        for(var j=0; j<$scope.etiqueta.length; j++)
        {
            if($scope.etiqueta[j].EtiquetaId == $scope.equivalente.EtiquetaId)
            {
                $scope.etiqueta[j].mostrar = false;
                break;
            }
        }
    };
});

app.factory('EEQUIVALENTE',function($rootScope)
{
  var service = {};
  service.equivalente = null;
  service.etiqueta = null;
  service.nueva = null;
    
  service.SetEtiquetaEquivalente = function(equivalente, etiqueta)
  {
      this.etiqueta = etiqueta;
      this.equivalente = equivalente;
      
      $rootScope.$broadcast('SetEtiquetaEquivalente'); 
  };
    
  service.SentNuevaEtiqueta = function(nueva, count)
  {
      $rootScope.$broadcast('SentNuevaEtiqueta', nueva, count); 
  };
    
  service.GetEquivalente = function()
  {
      return this.equivalente;
  };
    
  service.GetNueva = function()
  {
      return this.nueva;
  };
    
  service.GetEtiqueta = function()
  {
      return this.etiqueta;
  };

  return service;
});