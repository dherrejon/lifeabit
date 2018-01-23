app.controller("AdministrarTemaActividadController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.titulo = "Temas";
    
    $scope.tabs = tabTemaActividad;
    
    //Cambia el contenido de la pestaña
    $scope.SeleccionarTab = function(tab)    
    {
        $scope.titulo = tab.titulo;
        
        /*switch (index)
        {
            case 0:  
                $('#Autor').show();
                $('#Prefijo').hide();
                break;
            case 1:  
                $('#Prefijo').show();
                $('#Autor').hide();
                break;
            default:
                break;
        } */       
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        if(!$scope.usuarioLogeado.Aplicacion)
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
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
    
    //destecta cuando los datos del usuario cambian
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
    
    
});


var tabTemaActividad = [
                        {titulo:"Temas", referencia: "#Tema", clase:"active", area:"tema"}
                    ];
