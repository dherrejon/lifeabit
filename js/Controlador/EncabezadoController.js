app.controller("EncabezadoControlador", function($scope, $window, $http, $rootScope, $q, CONFIG, datosUsuario, $location, md5)
{   
    $scope.nuevoPassword = {nuevo:"", repetir:"", actual:""};
    $scope.clasePassword = {nuevo:"entrada", repetir:"entrada", actual:"entrada"};
    
    $rootScope.apps = aplicaciones;
    
    /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
    $scope.$on('cambioAplicaion',function()
    {
        $scope.usuario =  datosUsuario.getUsuario();
        
        if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
        {
            $scope.CambiarBarraNavegacion();
        }
    });
    
    $scope.CambiarBarraNavegacion = function()
    {
        switch($scope.usuario.Aplicacion)
        {
            case "Mis Actividades": 
                $scope.barraNavegacion = EncabezadoActividades;
                break;
                
            case "Mi Diario":
                $scope.barraNavegacion = EncabezadoDiario;
                break;
                
            case "Mis Notas":
                $scope.barraNavegacion = EncabezadoNotas;
                break;
                
            case "Mis Objetivos": 
                $scope.barraNavegacion = EncabezadoObjetivo;
                break;
                
            case "Mi Conocimiento": 
                $scope.barraNavegacion = EncabezadoConocimiento;
                break;
                
            case "Mis Imágenes": 
                $scope.barraNavegacion = EncabezadoImagen;
                break;
                
            case "Mis Archivos": 
                $scope.barraNavegacion = EncabezadoArchivo;
                break;
                
            case "Home": 
                $scope.barraNavegacion = EncabezadoAplicaciones;
                break;
            
            
            default:
                $scope.barraNavegacion = [];
                break;
        }
        
    };
    
    /*----------------------Control de vista de clases de la barra de navegación----------------------------*/ 
    $scope.MouseClickElemento = function(opcion, funcion)
    {
        $('#'+ opcion ).removeClass('open');
        
        $scope.CerrarBarraNavegacion();
        
        if(funcion == "CerrarSesion")
        {
            $rootScope.CerrarSesion();
        }
        
        else if(funcion == "CambiarPassword")
        {
            $scope.CambiarPassword();
        }
    };
    
    $scope.MouseClickOpcion = function(opcion, tipo)
    {
        if(tipo == "opc")
        {
            $('#'+ opcion.texto ).addClass('open');
        }
        else if(tipo == "pre")
        {
            $('#'+ opcion ).addClass('open');
        }
        
    };
    
    //despliega las secciones del módulo donde esta el mouse
    $scope.MouseEnterarElemento = function(index)
    {
        $('.header-horizontal-menu .navbar-nav > li.dropdown').removeClass('open');
        $('#'+$scope.barraNavegacion.opcion[index].texto).addClass('open');
    };
    
    $scope.MouseEnterarElementoPredeterminado = function(id)
    {
        $("#" + id).addClass("open");
    };

    //oculta las secciones
    $scope.MouseSalirElemento = function(index)
    {
        $('#'+$scope.barraNavegacion.opcion[index].texto).removeClass('open'); 
    };
    
    $scope.MouseSalirElementoPredeterminado = function(id)
    {
        $('#'+ id).removeClass('open'); 
    };
    
    //Cierra la barra de navegacion en el tamaño xs 
    $scope.CerrarBarraNavegacion = function()
    {
        $('#navbarCollapse').removeClass('in');
    };
    
    /*-------------------------Cerrar Sesión-----------------------------------------*/    
    $rootScope.CerrarSesion = function()
    {
        $('#navbarCollapse').removeClass('in');
        
        CerrarSesion($http, $rootScope, $q, CONFIG).then(function(data)
        {
            if(data)
            {
                $window.sessionStorage.removeItem('KeyUser'); 
                $scope.usuario = new Usuario();
                datosUsuario.enviarUsuario($scope.usuario);
                $window.location = "#Login";
                $scope.barraNavegacion = [];
            }
            else
            {
                alert("Error. Intentelo más tarde");
            }
             
        }).catch(function(error){
            alert("Error. Intentelo más tarde, " + error );
        }); 
    };

    /*------------------------------Cambiar Contraseña--------------------------------------------*/
    $scope.CambiarPassword = function()
    {
        $('#CambiarPasswordModal').modal('toggle');
    };
    
    $scope.GuardarPassword = function(passwordInvalido)
    {
        if(!$scope.ValidarPassword(passwordInvalido))
        {
            $('#mensajeEncabezado').modal('toggle');
            return;
        }
        
        var datosUsuario = [];
        datosUsuario[0] = $scope.usuario.UsuarioId;
        datosUsuario[1] = md5.createHash( $scope.nuevoPassword.actual );
        datosUsuario[2] = md5.createHash( $scope.nuevoPassword.nuevo );
        
        CambiarPasswordPorUsuario($http, CONFIG, $q, datosUsuario).then(function(data)
        {
            if(data == "Exitoso")
            {
                $scope.mensaje = "La contraseña se ha actualizado correctamente.";
                $scope.LimpiarInterfaz();
                //$('#mensajeEncabezado').modal('toggle');
                $scope.EnviarAlerta('Modal');
                $('#CambiarPasswordModal').modal('toggle');
            }
            else if(data == "ErrorPassword")
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*Tu contraseña actual es incorrecta.";
                $('#mensajeEncabezado').modal('toggle');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeEncabezado').modal('toggle');
            }
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde." + error
            $('#mensajeEncabezado').modal('toggle');
            return;
        });
    };
    
    $scope.ValidarPassword = function(passwordInvalido)
    {
        $scope.mensajeError = [];
        if(passwordInvalido)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*La contraseña solo puede tener letras y números. Mínimo debe tener 6 carácteres.";
            $scope.clasePassword.nuevo = "entradaError"; 
            return false;
        }
        else
        {
            $scope.clasePassword.nuevo = "entrada";        
        }
        if($scope.nuevoPassword.nuevo != $scope.nuevoPassword.repetir)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Las contraseñas no coinciden.";
            $scope.clasePassword.repetir = "entradaError"; 
        }
        else
        {
            $scope.clasePassword.repetir = "entrada";        
        }
        if($scope.nuevoPassword.actual === "" || $scope.nuevoPassword.actual === undefined || $scope.nuevoPassword.actual === null)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe tu contraseña actual.";
            $scope.clasePassword.actual = "entradaError"; 
        }
        else
        {
            $scope.clasePassword.actual = "entrada";        
        }
        if($scope.mensajeError.length > 0)
        {
            return false;
        }
        else
        {
            return true;
        }
    };
    
    $scope.CerrarCambiarPasswordForma = function()
    {
        $('#cerrarCambiarPassword').modal('toggle');
    };
    
    $scope.ConfirmarCerrarCambiarPasswordForma = function()
    {
        $('#CambiarPasswordModal').modal('toggle');
        $scope.LimpiarInterfaz();
        
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.nuevoPassword = {nuevo:"", repetir:"", actual:""};
        $scope.clasePassword = {nuevo:"entrada", repetir:"entrada", actual:"entrada"};
        $scope.mensajeError = [];
    };
    
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitoso").alert();

            $("#alertaExitoso").fadeIn();
            setTimeout(function () {
                $("#alertaExitoso").fadeOut();
            }, 2000);
        }
    };
    
    /*---------------- Ir a pagina Principal ------------------*/
    $rootScope.IrPaginaPrincipal = function()
    {
        if($scope.usuario !== undefined && $scope.usuario !== null)
        {
            //console.log($scope.usuario);
            if($scope.usuario.Aplicacion.length === 0 || $scope.usuario.Aplicacion == "Home")
            {
                $location.path('/Aplicacion');
            }
            else
            {
               for(var k=0; k<aplicaciones.length; k++)
                {
                    if($scope.usuario.Aplicacion == aplicaciones[k].texto)
                    {
                        $location.path(aplicaciones[k].paginaPrincipal);
                        break;
                    }
                } 
            }
        }
        
    };
    
    //---------------------------- Aplicaciones ----------------------------
    $scope.IniciarApp = function(app)
    {
        $('#app').removeClass('open'); 
        $scope.CerrarBarraNavegacion();
        
        if(app != "Home")
        { 
            datosUsuario.setAplicacion(app.texto);
        
            SetAplicacion(app.texto, $http, CONFIG);
            $location.path(app.paginaPrincipal);
        }
        else
        {
            datosUsuario.setAplicacion("Home");
        
            SetAplicacion("Home", $http, CONFIG);
        }
    };
    
   /*------------------Indentifica cuando los datos del usuario han cambiado-------------------*/
    $scope.IniciarControlador = function()
    {
        $scope.permisoUsuario = false;
        for(var k=0; k<$scope.usuario.Permiso.length; k++)
        {
            if($scope.usuario.Permiso[k] == "AdmUsuarios")
            {
                $scope.permisoUsuario = true;
                break;
            }   
        }
        
        if(!($scope.usuario.Aplicacion  === null ||  $scope.usuario.Aplicacion  === undefined))
        {
            $scope.CambiarBarraNavegacion();
        }
    };
    
    $scope.usuario =  datosUsuario.getUsuario(); 
    
    //verifica que haya un usuario logeado
    if($scope.usuario !== null)
    {
        if(!$scope.usuario.SesionIniciada)
        {
             //$location.path('/Login');
            return;
        }
        else
        {
            $scope.IniciarControlador();
        }
    }
    
    //destecta cuando los datos del usuario cambian
    $scope.$on('cambioUsuario',function()
    {
        $scope.usuario =  datosUsuario.getUsuario();
    
        if(!$scope.usuario.SesionIniciada)
        {
            //$location.path('/Login');
            return;
        }
        else
        {
            $scope.IniciarControlador();
        }
    });
});

var EncabezadoActividades =
{ 
    titulo:"Mis Actividades", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Actividades", show: true},
                    { texto:"Administrar", tipo:"dropdown", show: true,
                                                elemento:
                                                [
                                                    {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                    {texto:"Frecuencias", referencia:"#Frecuencia", funcion:"", show:true},
                                                    {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true},
                                                    {texto:"Personas", referencia:"#PersonaActividad", funcion:"", show:true},
                                                    {texto:"Lugares", referencia:"#Lugar", funcion:"", show:true},
                                                    {texto:"Unidades", referencia:"#Unidades", funcion:"", show:true},
                                                ]},
              ]                       
};

var EncabezadoDiario =
{ 
    titulo:"Mi Diario", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Diario", show: true},
                    { texto:"Administrar", tipo:"dropdown", show: true,
                                            elemento:
                                            [
                                                {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true},
                                                {texto:"Ciudades", referencia:"#Lugar", funcion:"", show:true},
                                            ]},
                    
              ]                       
};

var EncabezadoNotas =
{ 
    titulo:"Mis Notas", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Notas", show: true},
                    { texto:"Administrar", tipo:"dropdown", show: true,
                                            elemento:
                                            [
                                                {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true}
                                            ]},
                    
              ]                       
};

var EncabezadoObjetivo =
{ 
    titulo:"Mis Objetivos", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Objetivo", show: true},
                    { texto:"Administrar", tipo:"dropdown", show: true,
                                                elemento:
                                                [
                                                    {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                    {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true},
                                                ]},
              ]                       
};


var EncabezadoAplicaciones =
{ 
    titulo:"Life@Bit", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Aplicacion", show: true},
                    { texto:"Administrar", tipo:"dropdown", show: true,
                                            elemento:
                                            [
                                                {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true},
                                            ]},
                    
              ] 
                        
};

var EncabezadoConocimiento =
{ 
    titulo:"Mi Conocimiento", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Conocimiento", show: true},
                    { texto:"Administrar", tipo:"dropdown", show: true,
                                                elemento:
                                                [
                                                    {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                    {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true},
                                                ]},
              ]                       
};

var EncabezadoImagen =
{ 
    titulo:"Mis Imágenes", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Imagen", show: true},
                    { texto:"Administrar", tipo:"dropdown", show: true,
                                                elemento:
                                                [
                                                    {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                    {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true},
                                                ]},
              ]                       
};

var EncabezadoArchivo =
{ 
    titulo:"Mis Archivos", 
    opcion: [ 
                    { texto:"Inicio", tipo:"link", referencia:"#Archivo", show: true},
                    { texto:"Administrar", tipo:"dropdown", show: true,
                                                elemento:
                                                [
                                                    {texto:"Etiquetas", referencia:"#Etiqueta", funcion:"", show:true},
                                                    {texto:"Temas", referencia:"#TemaActividad", funcion:"", show:true},
                                                ]},
              ]                       
};

