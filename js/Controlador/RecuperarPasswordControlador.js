app.controller("RecuperarPasswordControlador", function($scope, $window, $rootScope, $http, CONFIG, datosUsuario, $routeParams, $q, md5)
{   
    $scope.solicitud = new Object();
    
    $scope.solicitud.UsuarioId = $routeParams.usuarioId;
    $scope.solicitud.Codigo = $routeParams.codigo;
    $scope.operacion = "";
    $scope.nuevoPassword = {password:"", repetir:""};
    $scope.mensajeError = [];
    
    
    $scope.ValidarRecuperarPassword = function()
    {
        ValidarRecuperarPassword($http, $q, CONFIG,  $scope.solicitud).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                if(data[1].Solicitud.length > 0)
                {
                    $scope.solicitud.SolicitudRecuperarPasswordId = data[1].Solicitud[0].SolicitudRecuperarPasswordId;
                    $scope.operacion = "Cambiar";
                }
                else
                {
                    $scope.operacion = "No Cambiar";
                }
            }
            else
            {
                $scope.operacion = "No Cambiar";
            }

        }).catch(function(error)
        {
            alert("Ha ocurrido un error al obtener las piezas del componente." + error);
            return;
        });
    };
    
    /*--------Reiniciar Password------------*/
    $scope.ReiniciarPassword = function(passwordInvalido)
    {
        if(!$scope.ValidarPassword(passwordInvalido))
        {
            return;
        }
        console.log("termina");
        $scope.solicitud.Password = md5.createHash( $scope.nuevoPassword.password );
        
        ReiniciarPassword($http, CONFIG, $q, $scope.solicitud).then(function(data)
        {
            if(data == "Exitoso")
            {
                $scope.operacion = "";
                $scope.mensaje = "La contraseña se ha actualizado correctamente.";
                $('#mensajeRecuperarPassword').modal('toggle');
            }
            else
            {
                alert("Ha ocurrido un error. Intente más tarde.");
            }
        }).catch(function(error)
        {
            alert("Ha ocurrido un error. Intente más tarde." +error);
            return;
        });
    };
    
    $scope.ValidarPassword = function(passwordInvalido)
    {
        $scope.mensajeError = [];
        if(passwordInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una contraseña válida. La contraseña solo puede tener letras y números y un mínimo de 6 carácteres.";
            return false;
        }
        if($scope.nuevoPassword.repetir != $scope.nuevoPassword.password)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Las contraseñas no coinciden.";
            return false;
        }
        
        return true;
    };
    
    $scope.IrIniciarSesion = function()
    {
        $window.location = "#Login";
    };
    
    /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
    $scope.usuarioLogeado =  datosUsuario.getUsuario(); 
    
    //verifica que haya un usuario logeado
    if($scope.usuarioLogeado !== null)
    {
        if($scope.usuarioLogeado.SesionIniciada)
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $scope.ValidarRecuperarPassword();
        }
    }
    
    //destecta cuando los datos del usuario cambian
    $scope.$on('cambioUsuario',function()
    {
        $scope.usuarioLogeado =  datosUsuario.getUsuario();
    
        if($scope.usuarioLogeado.SesionIniciada)
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $scope.ValidarRecuperarPassword();
        }
    }); 
});

