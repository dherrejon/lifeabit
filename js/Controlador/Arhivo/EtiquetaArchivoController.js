app.controller("EtiquetaArchivoController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, ETIQUETA, EEQUIVALENTE)
{  
    $scope.$on('AbrirEtiquetaArchivo', function(evento, archivo, nombre)
    {
        console.log(archivo);
        $scope.fl = archivo;
        $scope.nombreArchivo = nombre;
        
        $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, archivo, 'Archivo');
        
        $('#EtiquetaFile').modal('toggle');
    });
    
});
