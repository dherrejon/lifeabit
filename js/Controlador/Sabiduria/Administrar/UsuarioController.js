app.controller("UsuarioController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.ValidarPermiso = function()
    {
        $scope.permisoValido = false;
        for(var k=0; k<$scope.usuarioLogeado.Permiso.length; k++)
        {
            if($scope.usuarioLogeado.Permiso[k] == "AdmUsuarios")
            {
                $scope.permisoValido = true;
                break;
            }
        }
    };
    
    $scope.usuario = [];
    $scope.permiso = [];
    
    $scope.ordenarUsuario = "Nombre";
    $scope.buscarUsuario = "";
    $scope.buscarAplicacion = "";
    
    $scope.nuevoUsuario = null;
    $scope.usuarioActualizar = null;
    
    $scope.mensajeError = [];
    $scope.claseUsuario = {nombre:"entrada", apellidos:"entrada", nombreUsuario:"entrada", correo:"entrada", permiso:"dropdownListModal"};
        
    $scope.detalle = "";
    $scope.mostrarOpcionUsuario = "";
    
    $scope.GetUsuarios = function()              
    {
        GetUsuarios($http, $q, CONFIG).then(function(data)
        {
            $scope.usuario = data;

            $scope.GetPermisoUsuario();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetPermisoUsuario = function()              
    {
        GetPermisoUsuario($http, $q, CONFIG).then(function(data)
        {
            $scope.permisoUsuario = data;
            $scope.SetPermisoUsuarioSQL();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetPermiso = function()              
    {
        GetPermiso($http, $q, CONFIG).then(function(data)
        {
            $scope.permiso = data;        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
     $scope.SetPermisoUsuarioSQL = function()
    {
        var sqlBase = "Select PermisoId From ? WHERE UsuarioId = '";
        var sql = "";
        
        for(var k=0; k<$scope.usuario.length; k++)
        {
            sql = sqlBase;
            sql +=  $scope.usuario[k].UsuarioId + "'";
           
            $scope.usuario[k].Permiso = alasql(sql,[$scope.permisoUsuario]);
        } 
    };
    
    
    /*------ Ordenar ------------*/
    //cambia el campo por el cual
    $scope.CambiarOrdenarUsuario = function(campoOrdenar)
    {
        if($scope.ordenarUsuario == campoOrdenar)
        {
            $scope.ordenarUsuario = "-" + campoOrdenar;
        }
        else
        {
            $scope.ordenarUsuario = campoOrdenar;
        }
    };
    
    /*---------------------- Detalle --------------------------*/
    $scope.DetalleUsuario = function(usuario)
    {
        $scope.usuarioActualizar = usuario;
        $scope.SetPermisoUsuario(usuario);
    };
    
    $scope.SetPermisoUsuario = function(usuario)
    {
        for(var k=0; k<$scope.permiso.length; k++)
        {
            $scope.permiso[k].Usuario = false;
            for(var i=0; i<usuario.Permiso.length; i++)
            {
                if(usuario.Permiso[i].PermisoId == $scope.permiso[k].PermisoId)
                {
                     $scope.permiso[k].Usuario = true;
                    break;
                }
            }
        }
    };
    
    $scope.GetClaseDetallesSeccion = function(seccion)
    {
        if($scope.detalle == seccion)
        {
            return "opcionAcordionSeleccionado";
        }
        else
        {
            return "opcionAcordion";
        }
    };
    
    $scope.MostrarDetalle = function(detalle)
    {
        if($scope.detalle == detalle)
        {
            $scope.detalle = "";
        }
        else
        {
            $scope.detalle = detalle;
        }
    };
    
    /*-----------------Abrir Panel Agregar-Editar termino-------------------*/
    $scope.AbrirUsuario = function(operacion, usuario)
    {
        $scope.operacion = operacion;
        $scope.mostrarOpcionFuente = "";
        
        if(operacion == "Agregar")
        {
            $scope.InicializarUsuarioNuevo();
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoUsuario = $scope.SetUsuario(usuario);
        }
    
        $('#modalUsuario').modal('toggle');
    };
    
    $scope.InicializarUsuarioNuevo = function()
    {
        $scope.nuevoUsuario = new Usuario();
        $scope.nuevoUsuario.Permiso = [];
        $scope.SetPermisoUsuario($scope.nuevoUsuario);
    };
    
    $scope.SetUsuario = function(data)
    {
        var usuario = new Usuario();
        
        usuario.UsuarioId = data.UsuarioId;
        usuario.Nombre = data.Nombre;
        usuario.Apellidos = data.Apellidos;
        usuario.NombreUsuario = data.NombreUsuario;
        usuario.Correo = data.Correo;
        
        $scope.SetPermisoUsuario(data);
    
        return usuario;
    };
    
    
    $scope.MostrarOpcionUsuario =function(opcion)
    {
        if(opcion == $scope.mostrarOpcionUsuario )
        {
            $scope.mostrarOpcionUsuario = "";
        }
        else
        {
            $scope.mostrarOpcionUsuario = opcion;
        }
        
    };
    
    $scope.CerrarModalUsuario = function()
    {
        $('#cerrarUsuarioModal').modal('toggle');
    };
    
    $scope.ConfirmarCerrarModalUsuario = function()
    {
        $('#modalUsuario').modal('toggle');
        $scope.LimpiarInterfaz();
        $scope.mensajeError = [];
        $scope.claseUsuario = {nombre:"entrada", apellidos:"entrada", nombreUsuario:"entrada", correo:"entrada", permiso:"dropdownListModal"};
    };
    
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.buscarAplicacion = "";
        $scope.mostrarOpcionUsuario = "";
    };
    
    /*----------------- Terminar agregar-editar etiqueta --------------------*/
    $scope.TerminarUsuario = function(nombreInvalido, apellidoInvalido, nombreUsuarioInvalido, correoInvalido)
    {
        if(!$scope.ValidarDatos(nombreInvalido, apellidoInvalido, nombreUsuarioInvalido, correoInvalido))
        {
             $('#mensajeUsuario').modal('toggle');
            return;
        }
        else
        {
            $scope.nuevoUsuario.Permiso = $scope.permiso;
            
            if($scope.operacion == "Agregar")
            {
                $scope.AgregarUsuario();
            }
            else if($scope.operacion == "Editar")
            {
                $scope.EditarUsuario();
            }
        }
    };
    
    //agrega un tipo de unidad
    $scope.AgregarUsuario = function()    
    {
        AgregarUsuario($http, CONFIG, $q, $scope.nuevoUsuario).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                //$('#modalUsuario').modal('toggle');
                $scope.mensaje = "Usuario agregado.";
                $scope.GetUsuarios();
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Modal');
                $scope.InicializarUsuarioNuevo();
            }
            else
            {
                $('#mensajeUsuario').modal('toggle');
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeUsuario').modal('toggle');
        });
    };
    
    //edita el tipo de unidad seleccionado
    $scope.EditarUsuario = function()
    {
        EditarUsuario($http, CONFIG, $q, $scope.nuevoUsuario).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalUsuario').modal('toggle');
                $scope.mensaje = "Usuario editado.";
                $scope.GetUsuarios();
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('vista');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde"; 
                $('#mensajeUsuario').modal('toggle');
            }
           
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeUsuario').modal('toggle');
        });
    };
    
    $scope.ValidarDatos = function(nombreInvalido, apellidoInvalido, nombreUsuarioInvalido, correoInvalido)
    {
        $scope.mensajeError = [];
        
        if(nombreInvalido)
        {
            $scope.claseUsuario.nombre = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un nombre válido.";
        }
        else
        {
             $scope.claseUsuario.nombre = "entrada";
        }
        
        if(apellidoInvalido)
        {
            $scope.claseUsuario.apellidos = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un apellido válido.";
        }
        else
        {
             $scope.claseUsuario.apellidos = "entrada";
        }
        
        if(nombreUsuarioInvalido)
        {
            $scope.claseUsuario.nombreUsuario = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*El nombre de usuario sólo acepta letras y números, debe de tener 3 carácteres como mínimo.";
        }
        else
        {
             $scope.claseUsuario.nombreUsuario = "entrada";
        }
        
        if(correoInvalido)
        {
            $scope.claseUsuario.correo = "entradaError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un correo válido.";
        }
        else
        {
             $scope.claseUsuario.correo = "entrada";
        }
        
        var permiso = false;
        
        for(var k=0; k<$scope.permiso.length; k++)
        {
            if($scope.permiso[k].Usuario)
            {
                permiso = true;
                break;
            }
        }
        
        if(!permiso)
        {
            $scope.claseUsuario.permiso = "dropdownListModalError";
            $scope.mensajeError[$scope.mensajeError.length] = "*Debes de seleccionar mínimo un permiso.";
        }
        else
        {
             $scope.claseUsuario.permiso = "dropdownListModal";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;        
        }
        
        //datos repetidos
        for(var k=0; k<$scope.usuario.length; k++)
        {
            if($scope.usuario[k].NombreUsuario.toLowerCase() == $scope.nuevoUsuario.NombreUsuario.toLowerCase() && $scope.usuario[k].UsuarioId != $scope.nuevoUsuario.UsuarioId)
            {
                $scope.claseUsuario.nombreUsuario = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*El usuario " + $scope.nuevoUsuario.NombreUsuario.toLowerCase() + " ya existe.";
                return false;
            }
            
            if($scope.usuario[k].Nombre.toLowerCase() == $scope.nuevoUsuario.Nombre.toLowerCase() && $scope.usuario[k].Apellidos.toLowerCase() == $scope.nuevoUsuario.Apellidos.toLowerCase() && $scope.usuario[k].UsuarioId != $scope.nuevoUsuario.UsuarioId)
            {
                $scope.claseUsuario.nombre = "entradaError";
                $scope.claseUsuario.apellidos = "entradaError";
                $scope.mensajeError[$scope.mensajeError.length] = "*El usuario " + $scope.nuevoUsuario.Nombre.toLowerCase() + " " + $scope.nuevoUsuario.Apellidos.toLowerCase() +" ya existe.";
                return false;
            }
        }
        
        return true;
    };
    
    /*-------------- Activar y desactivar etiqueta ------------------*/
    $scope.ActivarDesactivarUsuario = function(usuario) //Activa o desactiva un elemento (empresa y tipo de unidad de negocio)
    {
        $scope.usuarioActualizar = usuario;
        
        if(usuario.Activo)
        {
            $scope.mensajeAdvertencia = "¿Estas seguro de ACTIVAR - " + usuario.NombreUsuario + "?";
        }
        else
        {
            $scope.mensajeAdvertencia = "¿Estas seguro de DESACRIVAR - " + usuario.NombreUsuario + "?";
        }
        $('#modalActivarDesactivarUsuario').modal('toggle'); 
    };
    
    /*Se confirmo que se quiere cambiar el estado de activo del elemeneto*/ 
    $scope.ConfirmarActualizarUsuario= function()  
    {
        var datos = [];
        if($scope.usuarioActualizar.Activo)
        {
            datos[0] = 1;
        }
        else
        {
            datos[0] = 0;
        }
        
        datos[1] = $scope.usuarioActualizar.UsuarioId;

        ActivarDesactivarUsuario($http, $q, CONFIG, datos).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.mensaje = "Usuario actualizado.";
                $scope.EnviarAlerta('Vista');
            }
            else
            {
                $scope.usuarioActualizar.Activo = !$scope.usuarioActualizar.Activo;
                $scope.mensaje = "Ha ocurrido un error. Intente más tarde.";
                 $('#mensajeUsuario').modal('toggle');
            }
           
        }).catch(function(error)
        {
            $scope.usuarioActualizar.Activo = !$scope.usuarioActualizar.Activo;
            $scope.mensaje = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeUsuario').modal('toggle');
        });
    };
        
    /*Se cancelo el cambiar el estado de activo del elemento*/
    $scope.CancelarCambiarActivoUsuario = function()           
    {
        $scope.usuarioActualizar.Activo = !$scope.usuarioActualizar.Activo;
    };
    
    document.getElementById('modalUsuario').onclick = function(e) 
    {
        if($scope.mostrarOpcionUsuario == "permiso")
        {
            if(!(e.target.id == "usuarioPermisos" || $(e.target).parents("#usuarioPermisos").size()))
            { 
                $scope.mostrarOpcionUsuario = "";
                $scope.$apply();
            }
        }

    };
    
    //-----------------  Limpiar ----------------------
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarUsuario = "";
                break;
            case 2:
                $scope.buscarAplicacion = "";
                break;
            default: 
                break;
        }
    };
    
    //----------------------Inicializar---------------------------------
    $scope.InicializarUsuario = function()
    {
        $scope.GetUsuarios();
        $scope.GetPermiso();
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        $scope.ValidarPermiso();
        if($scope.permisoValido)
        {
            if($scope.usuarioLogeado.Aplicacion.length == 0 || $scope.usuarioLogeado.Aplicacion == "Aplicaciones")
            {
                $rootScope.IrPaginaPrincipal();
            }
            else
            {
                $scope.InicializarUsuario();
            }
        }
        else
        {
            $rootScope.IrPaginaPrincipal();
        }
    };
    
    $scope.usuarioLogeado =  datosUsuario.getUsuario(); 
    
    //verifica que haya un usuario logeado
    if($scope.usuarioLogeado !== null)
    {
        if(!$scope.usuarioLogeado.SesionIniciada)
        {
             $location.path('/Login');
        }
        else
        {
            $scope.InicializarControlador();
        }
    }
    
    //detecta cuando los datos del usuario cambian
    $scope.$on('cambioUsuario',function()
    {
        $scope.usuarioLogeado =  datosUsuario.getUsuario();
    
        if(!$scope.usuarioLogeado.SesionIniciada)
        {
            $location.path('/Login');
            return;
        }
        else
        {
            $scope.InicializarControlador();
        }
    });
    
     //--------------------- Alertas --------------------------
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
        else if('Vista')
        {
            $("#alertaEditarExitoso").alert();

            $("#alertaEditarExitoso").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitoso").fadeOut();
            }, 2000)
        }
    };
    
    
});