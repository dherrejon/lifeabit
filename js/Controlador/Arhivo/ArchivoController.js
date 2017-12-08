app.controller("ArchivoController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG)
{   
    $scope.archivo = [];
    
    //------------ CARGAR ARCHIVOS ---------------
    function LoadFiles(evt) 
    {
        var files = evt.target.files;
        
        for (var i = 0, f; f = files[i]; i++) 
        {
            if (!f.type.match('.pdf')) 
            {
                continue;
            }

            var reader = new FileReader();

            reader.onload = (function(theFile) 
            {
                return function(e) 
                {
                    $scope.archivo.push(theFile);
                    var i = $scope.archivo.length - 1;
                    
                    $scope.archivo[i].Src= (e.target.result);
                    $scope.archivo[i].Etiqueta = [];
                    $scope.archivo[i].Tema = [];
                    
                    $scope.$apply();
                };
                
                debugger;
            })(f);
            
            
            reader.readAsDataURL(f);
        }
        
        document.getElementById('loadfile').value = "";
    }
 
    document.getElementById('loadfile').addEventListener('change', LoadFiles, false);
    
    
    $scope.DescargarArchivo = function(file, nombre)
    {        
        var link = document.createElement('a');
        
        link.href = file;
        link.setAttribute('target','_blank');

        link.download = nombre;
        
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        link.dispatchEvent(e);
    };
    
    //----------- Etiqueta ------
    $scope.EtiquetarFile = function(archivo, nombre)
    {
        console.log("archivos");
        $rootScope.$broadcast('AbrirEtiquetaArchivo', archivo, nombre);
    };
    
});