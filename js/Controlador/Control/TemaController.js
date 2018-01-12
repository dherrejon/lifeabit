app.controller("TemaController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    
    $scope.mensajeError = [];

    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirTema = function(operacion, tema)
    {
        $scope.operacion = operacion;
        
        if(operacion == "Editar")
        {
            $scope.nuevoTema = SetTemaActividad(tema);
        }
    
        $('#modalTema').modal('toggle');
    };    
    
    /*----------------- Terminar agregar-editar tema --------------------*/
    $scope.TerminarTema = function(nombreInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido))
        {
            $('#mensajeTema').modal('toggle');
            return;
        }
        else
        {
            if($scope.operacion == "Editar")
            {
                $scope.EditarTema();
            }
        }
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarTema = function()
    {
        EditarTemaActividad($http, CONFIG, $q, $scope.nuevoTema).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalTema').modal('toggle');
                $rootScope.$broadcast('TemaEditado', $scope.nuevoTema);
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
    
    $scope.ValidarDatos = function()
    {
        $scope.mensajeError = [];
        
        if(!$scope.nuevoTema.Tema)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre válido.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
    
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].Tema.toLowerCase() == $scope.nuevoTema.Tema.toLowerCase()  && $scope.tema[k].TemaActividadId != $scope.nuevoTema.TemaActividadId)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*El tema " + $scope.nuevoTema.Tema.toLowerCase() + " ya existe.";
                return false;
            }
        }
        
        return true;
    };
        

    //------------------------ Exterior ---------------------------

    $scope.$on('EditarTema',function(evento, tema, temas)
    {
        $scope.opt = "EditarTema";
        $scope.tema = temas;

        $scope.AbrirTema('Editar', tema);
    });
    
});
