app.controller("AdministrarEtiquetaController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location)
{   
    $scope.titulo = "Etiquetas";
    
    $scope.tabs = tabEtiqueta;
    
    //Cambia el contenido de la pestaña
    $scope.SeleccionarTab = function(tab, index)    
    {
        $scope.titulo = tab.titulo;
        
        switch (index)
        {
            case 0:  
                $('#Etiqueta').show();
                break;
            default:
                break;
        }        
    };
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        if($scope.usuarioLogeado.Aplicacion != "Mis Actividades" && $scope.usuarioLogeado.Aplicacion != "Mi Diario" && $scope.usuarioLogeado.Aplicacion != "Mis Notas")
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


var tabEtiqueta = [
                    {titulo:"Etiquetas", referencia: "#Etiqueta", clase:"active", area:"etiqueta"}
                ];
