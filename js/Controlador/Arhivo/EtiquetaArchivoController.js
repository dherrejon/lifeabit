app.controller("EtiquetaArchivoController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, LifeService)
{  
    
    $scope.$on('AbrirEtiquetaArchivo', function(evento, archivo, nombre, modal)
    {
        $scope.fl = archivo;
        $scope.nombreArchivo = nombre;
        $scope.modal = modal;
        
        $scope.ValidarEtiquetaArchivo(archivo.Etiqueta);
        $scope.ValidarTemaArchivo(archivo.Tema);
        
        $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.fl, 'Archivo');
        
        $('#EtiquetaFile').modal('toggle');
    });
    
    $scope.ValidarEtiquetaArchivo = function(etiqueta)
    {
        for(var i=0; i<$scope.etiqueta.length; i++)
        {            
            $scope.etiqueta[i].show = true;
            for(var j=0; j<etiqueta.length; j++)
            {
                if(etiqueta[j].Visible == true || etiqueta[j].Visible == "1")
                {
                    if($scope.etiqueta[i].EtiquetaId == etiqueta[j].EtiquetaId)
                    {
                        $scope.etiqueta[i].show = false;
                        break;
                    }
                }
            }
        }  
    };
    
    $scope.ValidarTemaArchivo = function(tema)
    {
        for(var i=0; i<$scope.tema.length; i++)
        {
            $scope.tema[i].show = true;
            for(var j=0; j<tema.length; j++)
            {
                if($scope.tema[i].TemaActividadId == tema[j].TemaActividadId)
                {
                    $scope.tema[i].show = false;
                    break;
                }
            }
        }  
    };
    
    //-------------------------------------------- DRIVER -----------------------------------------------------
    $scope.archivo= [];
    
    $scope.GetArchivo = function(data)
    {
        (self.servicioObj = LifeService.Get('GetArchivo/' + $rootScope.UsuarioId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                $scope.archivo = dataResponse.data;
                $scope.IniciarArchivo(data);

            } else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.GetNumeroArchivo = function(data)
    {
        (self.servicioObj = LifeService.Get('GetNumeroArchivo/' + $rootScope.UsuarioId )).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                if($scope.archivo.length < dataResponse.data)
                {
                    $scope.GetArchivo(data);
                }
                else
                {
                    $scope.IniciarArchivo(data);
                }

            } else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede cargar la información.", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
    };
    
    $scope.$on('VerDriver', function(evento, data)
    {       
        $scope.GetNumeroArchivo(data);
        $('#driver').modal('toggle');
    });
    
    $scope.IniciarArchivo = function(data)
    {
         for(var k=0; k<$scope.archivo.length; k++)
        {
            $scope.archivo[k].Seleccionado = false;
        }

        for(var k=0; k<$scope.archivo.length; k++)
        {
            $scope.archivo[k].show = true;
            
            for(var i=0; i<data.length; i++)
            {
                if($scope.archivo[k].ArchivoId == data[i].ArchivoId)
                {
                    $scope.archivo[k].show = false;
                    break;
                }
            }
        }
    };
    
    $scope.AgregarArchivos = function()
    {
        var newFile = [];
        
        for(var k=0; k<$scope.archivo.length; k++)
        {
            if($scope.archivo[k].Seleccionado)
            {
                newFile.push($scope.archivo[k]);
            }
        }
        
        if(newFile.length > 0)
        {
           $rootScope.$broadcast('ArchivoSeleccionado', newFile); 
        }
        
        $('#driver').modal('toggle');
    };
    
    //_------------------- Etiquetas ocultas ----------------
    $scope.$on('EtiquetaOcultaArchivo',function(evento, objeto)
    {
        $scope.modal = "App";
        $scope.admObjeto = objeto;
        
        $scope.QuitarEtiquetasOcultasArchivo();
        
        
        
        $scope.ifile = 0;
        
        if($scope.admObjeto.Archivo.length > 0)
        {
            $scope.ValidarEtiquetaArchivo($scope.admObjeto.Archivo[$scope.ifile].Etiqueta);
            $scope.ValidarTemaArchivo($scope.admObjeto.Archivo[$scope.ifile].Tema);
            
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.admObjeto.Archivo[$scope.ifile], 'Archivo');
            $rootScope.$broadcast('SepararEtiqueta', $scope.admObjeto.Archivo[$scope.ifile].Tema, 'Archivo');
        }
        else if($scope.admObjeto.ArchivoSrc.length > 0)
        {
            $scope.ValidarEtiquetaArchivo($scope.admObjeto.ArchivoSrc[$scope.ifile].Etiqueta);
            $scope.ValidarTemaArchivo($scope.admObjeto.ArchivoSrc[$scope.ifile].Tema);
            
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.admObjeto.ArchivoSrc[$scope.ifile], 'Archivo');
            $rootScope.$broadcast('SepararEtiqueta', $scope.admObjeto.ArchivoSrc[$scope.ifile].Tema, 'Archivo');
        }
        else
        {
            $rootScope.$broadcast('TerminarEtiquetaOcultaArchivo');
        }
    });
    
    $scope.$on('EtiquetaOcultaArchivoApp',function(evento, objeto)
    {
        $scope.archivo = objeto;
        $scope.modal = "Archivo";
        
        $scope.QuitarEtiquetasOcultasArchivoApp();
    
        $scope.ValidarEtiquetaArchivo($scope.archivo.Etiqueta);
        $scope.ValidarTemaArchivo($scope.archivo.Tema);
            
        $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.archivo, 'Archivo');
        $rootScope.$broadcast('SepararEtiqueta', $scope.archivo.Tema, 'Archivo');
    });
    
    $scope.QuitarEtiquetasOcultasArchivoApp = function()
    {

        for(var j=0; j<$scope.archivo.Etiqueta.length; j++)
        {
            if($scope.archivo.Etiqueta[j].Visible != "1" && $scope.archivo.Etiqueta[j].Visible != true )
            {
                $scope.archivo.Etiqueta.splice(j,1);
                j--;
            }
        }
    
    };
    
    $scope.$on('TerminarEtiquetaOculta',function(evento, modal)
    {    
        if(modal == "Archivo" && $scope.modal =="App")
        {
            $scope.ifile += 1;
            
            var isrc = $scope.ifile - $scope.admObjeto.Archivo.length;
            
            if($scope.admObjeto.Archivo.length > $scope.ifile)
            {
                $scope.ValidarEtiquetaArchivo($scope.admObjeto.Archivo[$scope.ifile].Etiqueta);
                $scope.ValidarTemaArchivo($scope.admObjeto.Archivo[$scope.ifile].Tema);
                
                $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.admObjeto.Archivo[$scope.ifile], 'Archivo');
                $rootScope.$broadcast('SepararEtiqueta', $scope.admObjeto.Archivo[$scope.ifile].Tema, 'Archivo');
            }
            else if($scope.admObjeto.ArchivoSrc.length > isrc )
            {
                $scope.ValidarEtiquetaArchivo($scope.admObjeto.ArchivoSrc[isrc].Etiqueta);
                $scope.ValidarTemaArchivo($scope.admObjeto.ArchivoSrc[isrc].Tema);
                
                $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.admObjeto.ArchivoSrc[isrc], 'Archivo');
                $rootScope.$broadcast('SepararEtiqueta', $scope.admObjeto.ArchivoSrc[isrc].Tema, 'Archivo');
            }
            else
            {
                $rootScope.$broadcast('TerminarEtiquetaOcultaArchivo');
            }
        }
        if(modal == "Archivo" && $scope.modal =="Archivo")
        {
            $rootScope.$broadcast('TerminarEtiquetaOcultaArchivo2', $scope.archivo);
        }
        
    });
    
    $scope.QuitarEtiquetasOcultasArchivo = function()
    {
        for(var i=0; i<$scope.admObjeto.Archivo.length; i++)
        {
            for(var j=0; j<$scope.admObjeto.Archivo[i].Etiqueta.length; j++)
            {
                if($scope.admObjeto.Archivo[i].Etiqueta[j].Visible != "1" && $scope.admObjeto.Archivo[i].Etiqueta[j].Visible != true )
                {
                    $scope.admObjeto.Archivo[i].Etiqueta.splice(j,1);
                    j--;
                }
            }
        }
        
        for(var i=0; i<$scope.admObjeto.ArchivoSrc.length; i++)
        {
            for(var j=0; j<$scope.admObjeto.ArchivoSrc[i].Etiqueta.length; j++)
            {
                if($scope.admObjeto.ArchivoSrc[i].Etiqueta[j].Visible != "1" && $scope.admObjeto.ArchivoSrc[i].Etiqueta[j].Visible != true )
                {
                    $scope.admObjeto.ArchivoSrc[i].Etiqueta.splice(j,1);
                    j--;
                }
            }
        }
    };
    
    $scope.TerminarEtiquetaArchivo = function()
    {
        if($scope.modal == "Archivo")
        {
            $('#EtiquetaFile').modal('hide');
        }
        else if ($scope.modal == "App")
        {
            $rootScope.$broadcast('TerminarEtiquetas');
        }
        
    };
    
});

