app.controller("LoginController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.mensajeError = "";
    $scope.mensajeErrorPassword = "";
    $scope.usuarioLogin = {correo:"", password:""};
    
    $scope.usuario = datosUsuario.getUsuario();
    /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
    $scope.$on('cambioUsuario',function()
    {
        $scope.usuario =  datosUsuario.getUsuario();    
        if($scope.usuario.SesionIniciada)
        {
            $rootScope.IrPaginaPrincipal();
        }
    });
    
    $scope.IniciarSesion = function(usuarioInvalido, passwordInvalido)
    {
        if(!$scope.ValidarDatos(usuarioInvalido, passwordInvalido))
        {
            $('#mensajeLoginError').modal('toggle');
            return;
        }
        else
        {
            IniciarSesion($http, $scope.usuarioLogin, $q, CONFIG, md5).then(function(data) //iniciar sesion
            {
                if(data == "SesionInicada")     //Verifica que la sesión no este iniciada
                {
                    $scope.usuarioLogin = {correo:"", password:""};
                    $scope.mensajeError = "Hay una sesión conectada, cierra la sesión para que puedas iniciar sesión.";
                    return;
                }

                //$scope.usuario = data;
                if(data.SesionIniciada)
                {   
                    $window.location = "#Aplicacion";
                    $scope.messageError = "";
                    datosUsuario.enviarUsuario(data);
                }
                else if(!data.SesionIniciada)
                {
                    $scope.usuarioLogin.password = "";
                    $scope.mensajeError = "*Verifica que tu usuario y contraseña sean correctas";
                    $('#mensajeLoginError').modal('toggle');
                }
                else
                {
                     $scope.usuarioLogin = {correo:"", password:""};
                     $scope.mensajeError = "*Error de conexión. Intenta más tarde.";
                     $('#mensajeLoginError').modal('toggle');
                }


            }).catch(function(error){
                $scope.usuarioLogin = {correo:"", password:""};
                 $scope.mensajeError = error;
                $('#mensajeLoginError').modal('toggle');
            });
        }
    };
    
    $scope.ValidarDatos = function(usuarioInvalido, passwordInvalido)
    {
        if(usuarioInvalido) //verifica que los campos de nombre de usuario y de password contengan datos
        {
            $scope.mensajeError = "*Debes escribir un usuario"; 
            return false;
        }
        
        if(passwordInvalido)
        {
            $scope.mensajeError = "*Debes escribir una contraseña"; 
            return false;
        }
        
        return true;
    };
    
    if($scope.usuario !== null)
    {
        if($scope.usuario.SesionIniciada)
        {
            $scope.IrPaginaPrincipal();
        }
    }
    
    //------------------- Recuperar contraseña ----------------------
    $scope.RecuperarPassword = function(usuarioInvalido)
    {
        $scope.mensajeErrorPassword = "";
        if(usuarioInvalido)
        {
            $scope.mensajeErrorPassword = "*Escribe un usuario válido.";
            return;
        }
        
        var usuario = new Object();
        usuario.Correo = $scope.usuarioLogin.correo;
        
        RecuperarPassword($http, CONFIG, $q, usuario).then(function(data)
        {
            if(data == "Exitoso")
            {
                $scope.mensaje = "Se te ha enviado un correo para que puedas reiniciar tu contraseña.";
                $('#recuperarPasswordModal').modal('toggle');
                $('#mensajeLogin').modal('toggle');
            }
            else if(data == "ErrorUsuario")
            {
                $('#mensajeLoginError').modal('toggle');
                $scope.mensajeError = "*El usuario no es válido.";
            }
            else
            {
                $('#mensajeLoginError').modal('toggle');
                $scope.mensajeError = "Ha ocurrido un error. Intente más tarde.";
            }
        }).catch(function(error)
        {
            $('#mensajeLoginError').modal('toggle');
            $scope.mensajeError = "Ha ocurrido un error. Intente más tarde." +error;
            return;
        });
    };
    
    $scope.CerrarRecuperarPasswordForma = function()
    {
        $scope.mensajeError = "";
    };
    
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.usuarioLogin.correo = "";
                break;
            case 2:
                $scope.usuarioLogin.password = "";
                break;
            default: 
                break;
        }
        
    };
    
    //Presionar enter para login
    $('#loginPanel').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                document.getElementById("botonLogin").click();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

});

