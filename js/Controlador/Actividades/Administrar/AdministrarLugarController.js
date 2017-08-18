app.controller("AdministrarLugarController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.tabs = tabLugar;
    
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
        if($scope.usuarioLogeado.Aplicacion != "Mis Actividades" && $scope.usuarioLogeado.Aplicacion != "Mi Diario")
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            
            if($scope.usuarioLogeado.Aplicacion == "Mi Diario")
            {
                $scope.tabs[0].show = false;
                $scope.titulo = "Ciudades";
            }
            else
            if($scope.usuarioLogeado.Aplicacion == "Mis Actividades")
            {
                $scope.tabs[0].show = true;
                $scope.titulo = "Lugares";
            }
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


var tabLugar = [
                        {titulo:"Lugares", referencia: "#Lugar", clase:"active", area:"lugar", show: true},
                        {titulo:"Ciudades", referencia: "#Ciudad", clase:"", area:"ciudad", show:true}
                    ];
