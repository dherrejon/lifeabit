app.controller("ArchivoController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, ETIQUETA)
{   
    $scope.$on('IniciarArchivo', function(evento, objeto, misarchivos)
    {
        $scope.objeto = objeto;
        $scope.showEliminada = false;
        $scope.misarchivos = misarchivos;
    });
    
    $scope.IniciarArchivoApp = function() 
    {
        $rootScope.$broadcast('IniciarArchivoApp');
    };
    
    
    
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
                    $scope.objeto.ArchivoSrc.push(theFile);
                    var i = $scope.objeto.ArchivoSrc.length - 1;
                    
                    $scope.objeto.ArchivoSrc[i].Src= (e.target.result);
                    $scope.objeto.ArchivoSrc[i].Etiqueta = [];
                    $scope.objeto.ArchivoSrc[i].Tema = [];
                    
                    $rootScope.$broadcast('SetEtiquetaElemento', $scope.objeto.ArchivoSrc[i], $scope.objeto.Etiqueta);
                    $rootScope.$broadcast('SetTemaElemento',$scope.objeto.ArchivoSrc[i], $scope.objeto.Tema);
                    
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
        var url = 'data:application/PDF;' + file;
        window.open(url, '_blank');

        /*var link = document.createElement('a');
        
        link.href = file;
        link.setAttribute('target','_blank');

        link.download = nombre;
        
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        link.dispatchEvent(e);*/
    };
    
    //--------------------------- Etiqueta -----------------
    $scope.EtiquetarFile = function(archivo, nombre)
    {
        $rootScope.$broadcast('AbrirEtiquetaArchivo', archivo, nombre, 'Archivo');
    };
    
    
     //------- Set Conceptos ------------
    $scope.$on('EtiquetaSet',function(evento, etiqueta, modal)
    {
        if(modal != "Archivo")
        {
            $scope.SetEtiquetaTodosArchivos(etiqueta);
        }
    });
    
    $scope.$on('TemaSet',function(evento, tema, modal)
    {
        if(modal != "Archivo")
        {
            $scope.SetTemaTodosArchivos(tema);
        }
    });
    
    $scope.$on('SetEtiquetaElemento',function(evento, archivo, etiqueta)
    {
        $scope.SetEtiquetaArchivo(archivo, etiqueta);
    });
    
    $scope.$on('SetTemaElemento',function(evento, archivo, tema)
    {
        $scope.SetTemaArchivo(archivo, tema);
    });
    
    $scope.SetEtiquetaTodosArchivos = function(etiqueta)
    {
        var e = [];
        e[0] = etiqueta;

        for(var i=0; i<$scope.objeto.Archivo.length; i++)
        {
            $scope.SetEtiquetaArchivo($scope.objeto.Archivo[i], e);
        }
        
        for(var i=0; i<$scope.objeto.ArchivoSrc.length; i++)
        {
            $scope.SetEtiquetaArchivo($scope.objeto.ArchivoSrc[i], e);
        }
    };
    
    $scope.SetEtiquetaArchivo = function(archivo, etiqueta)
    {
        for(var j=0; j<etiqueta.length; j++)
        {
            if(etiqueta[j].Visible)
            {
                var label = false;
                for(var i=0; i<archivo.Etiqueta.length; i++)
                {
                    if(etiqueta[j].EtiquetaId == archivo.Etiqueta[i].EtiquetaId)
                    {
                        label = true;
                        archivo.Etiqueta[i].Visible = etiqueta[j].Visible ? true : false; 
                        break;
                    }
                }

                if(!label)
                {
                    var e = new Object();

                    e.EtiquetaId = etiqueta[j].EtiquetaId;
                    e.Nombre = etiqueta[j].Nombre;
                    e.Visible = etiqueta[j].Visible ? true : false;
                    e.count = etiqueta[j].count;

                    archivo.Etiqueta.push(e);
                }
            }
        }
    };
    
    $scope.SetTemaTodosArchivos = function(tema)
    {
        var e = [];
        e[0] = tema;
        
        $scope.temaAgregar = e;
        
        for(var i=0; i<$scope.objeto.Archivo.length; i++)
        {
            $scope.SetTemaArchivo($scope.objeto.Archivo[i], e);
        }
        
        for(var i=0; i<$scope.objeto.ArchivoSrc.length; i++)
        {
            $scope.SetTemaArchivo($scope.objeto.ArchivoSrc[i], e);
        }
    };
    
    $scope.SetTemaArchivo = function(archivo, tema)
    {
        var agregado = false;
        for(var j=0; j<tema.length; j++)
        {
            var label = false;
            for(var i=0; i<archivo.Tema.length; i++)
            {
                if(tema[j].TemaActividadId == archivo.Tema[i].TemaActividadId)
                {
                    label = true;
                    break;
                }
            }
            
            if(!label)
            {
                var t = new Object();
                
                t.TemaActividadId = tema[j].TemaActividadId;
                t.Tema = tema[j].Tema;
                
                archivo.Tema.push(t);
                
                agregado = true;
            }
        }
    };
    
    $scope.$on('QuitarEtiqueta',function(evento, etiqueta, modal)
    {
        if(modal != "Archivo")
        {
            for(var i=0; i<$scope.objeto.Archivo.length; i++)
            {
                for(var j=0; j<$scope.objeto.Archivo[i].Etiqueta.length; j++)
                {
                    if($scope.objeto.Archivo[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                    {
                        $scope.objeto.Archivo[i].Etiqueta.splice(j,1);
                        break;
                    }
                }
            }

            for(var i=0; i<$scope.objeto.ArchivoSrc.length; i++)
            {
                for(var j=0; j<$scope.objeto.ArchivoSrc[i].Etiqueta.length; j++)
                {
                    if($scope.objeto.ArchivoSrc[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                    {
                        $scope.objeto.ArchivoSrc[i].Etiqueta.splice(j,1);
                        break;
                    }
                }
            }
        }
    });
    
    $scope.$on('QuitarTema',function(evento, tema, modal)
    {
        if(modal != "Archivo")
        {   
            for(var i=0; i<$scope.objeto.Archivo.length; i++)
            {
                for(var j=0; j<$scope.objeto.Archivo[i].Tema.length; j++)
                {
                    if($scope.objeto.Archivo[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                    {
                        $scope.objeto.Archivo[i].Tema.splice(j,1);
                        break;
                    }
                }
            }

            for(var i=0; i<$scope.objeto.ArchivoSrc.length; i++)
            {
                for(var j=0; j<$scope.objeto.ArchivoSrc[i].Tema.length; j++)
                {
                    if($scope.objeto.ArchivoSrc[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                    {
                        $scope.objeto.ArchivoSrc[i].Tema.splice(j,1);
                        break;
                    }
                }
            }
        }
    });
    
    $scope.$on('EtiquetaOcultaArchivoIniciar', function(evento, objeto)
    {
        $rootScope.$broadcast('EtiquetaOcultaArchivo', objeto);
    });
    
    
    //-------------- Editar -------------------------------------
    $scope.$on('TerminarEditarEtiqueta',function()
    {   
        var etiqueta = ETIQUETA.GetEtiqueta();
    

        if($scope.objeto.Archivo)
        {
            for(var k=0; k<$scope.objeto.Archivo.length; k++)
            {
                for(var i=0; i<$scope.objeto.Archivo[k].Etiqueta.length; i++)
                {
                    if($scope.objeto.Archivo[k].Etiqueta[i].EtiquetaId == etiqueta.EtiquetaId)
                    {
                        $scope.objeto.Archivo[k].Etiqueta[i].Nombre = etiqueta.Nombre;
                        break;
                    }
                }
            }  

            for(var k=0; k<$scope.objeto.ArchivoSrc.length; k++)
            {
                for(var i=0; i<$scope.objeto.ArchivoSrc[k].Etiqueta.length; i++)
                {
                    if($scope.objeto.ArchivoSrc[k].Etiqueta[i].EtiquetaId == etiqueta.EtiquetaId)
                    {
                        $scope.objeto.ArchivoSrc[k].Etiqueta[i].Nombre = etiqueta.Nombre;
                        break;
                    }
                }
            }  
        }
    });
    
     $scope.$on('TerminarEditarEtiqueta',function()
    {   
        var tema = ETIQUETA.GetEtiqueta();
    

        if($scope.objeto.Archivo)
        {
            for(var k=0; k<$scope.objeto.Archivo.length; k++)
            {
                for(var i=0; i<$scope.objeto.Archivo[k].Etiqueta.length; i++)
                {
                    if($scope.objeto.Archivo[k].Etiqueta[i].EtiquetaId == etiqueta.EtiquetaId)
                    {
                        $scope.objeto.Archivo[k].Etiqueta[i].Nombre = etiqueta.Nombre;
                        break;
                    }
                }
            }  

            for(var k=0; k<$scope.objeto.ArchivoSrc.length; k++)
            {
                for(var i=0; i<$scope.objeto.ArchivoSrc[k].Etiqueta.length; i++)
                {
                    if($scope.objeto.ArchivoSrc[k].Etiqueta[i].EtiquetaId == etiqueta.EtiquetaId)
                    {
                        $scope.objeto.ArchivoSrc[k].Etiqueta[i].Nombre = etiqueta.Nombre;
                        break;
                    }
                }
            }  
        }
    });
    
    $scope.$on('TemaEditado', function(evento, tema)
    {
        if($scope.objeto.Archivo)
        {
            for(var k=0; k<$scope.objeto.Archivo.length; k++)
            {
                for(var i=0; i<$scope.objeto.Archivo[k].Tema.length; i++)
                {
                    if($scope.objeto.Archivo[k].Tema[i].TemaActividadId == tema.TemaActividadId)
                    {
                        $scope.objeto.Archivo[k].Tema[i].Tema = tema.Tema;
                        break;
                    }
                }
            }  

            for(var k=0; k<$scope.objeto.ArchivoSrc.length; k++)
            {
                for(var i=0; i<$scope.objeto.ArchivoSrc[k].Tema.length; i++)
                {
                    if($scope.objeto.ArchivoSrc[k].Tema[i].TemaActividadId == tema.TemaActividadId)
                    {
                        $scope.objeto.ArchivoSrc[k].Tema[i].Tema = tema.Tema;
                        break;
                    }
                }
            } 
        }
    });
    
    $scope.GetNumeroVisible = function(data)
    {
        var count = 0;
        for(var k=0; k<data.length; k++)
        {
            if(data[k].Visible == true || data[k].Visible == "1")
            {
                count++;
            }
        }
        
        return count;
    };
    
    
    //_----------- driver ---------------
    $scope.AbrirDriver = function()
    {
        $rootScope.$broadcast('VerDriver', $scope.objeto.Archivo);
    };
    
    $scope.$on('ArchivoSeleccionado', function(evento, data)
    {
        for(var k=0; k<data.length; k++)
        {
            $rootScope.$broadcast('SetEtiquetaElemento', data[k], $scope.objeto.Etiqueta);
            $rootScope.$broadcast('SetTemaElemento', data[k], $scope.objeto.Tema);
            
            $scope.objeto.Archivo.push(jQuery.extend({}, data[k]));
        }
    });
});