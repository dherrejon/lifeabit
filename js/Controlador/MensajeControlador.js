app.controller("MensajeController", function($window,$scope, $http, $rootScope)
{   
    
    //Alerta para mostrar un mensaje breve
    $scope.$on('Alerta', function(evento, mensaje, estatus)
    {
        $scope.mensajeAlerta = mensaje;
        
        if(estatus == "exito")  //alerta de exito
        {
            $("#AlertaExito").alert();
            $("#AlertaExito").show();

            setTimeout(function () 
            {
                $("#AlertaExito").fadeOut();
            }, 2000);
        }
        else if(estatus == "error")     //alerta de error
        {
            $("#AlertaError").alert();
            $("#AlertaError").fadeIn();

            //Cerrar Alerta
            setTimeout(function () 
            {
                $("#AlertaError").fadeOut();
            }, 2000);
        }
        
    });
});


