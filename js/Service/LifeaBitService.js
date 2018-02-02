app.factory('LifeService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope, CONFIG) 
{   
    var self = this;
    self.urlBase = getUrlBase();
    self.LifeService = {};
    self.tiempoEspera = 120000;
    
    self.LifeService.Get = function (metodo) 
    {
        var tiempo = $q.defer();
        var url = self.urlBase + metodo;
        var peticion = $http(
        {
            method: 'GET',
            url: url,
            cache: false,
            timeout: tiempo.promise
        });
        var contador = setTimeout(function () 
        {
            tiempo.resolve();
        }, self.tiempoEspera);

        var promesa = peticion.then(function (respuesta) 
        {
            return respuesta;
        }, function (error) 
        {
            return error;

        });
        promesa.abortar = function () 
        {
            tiempo.resolve();
            clearTimeout(contador);
        };

        promesa.detenerTiempo = function () 
        {
            clearTimeout(contador);
        };
        promesa.finally(function () 
        {
            promesa.abortar = angular.noop;
            clearTimeout(contador);
            peticion = null;
            promesa = null;
            tiempo = null;
        });

        return promesa;
    };
    
    self.LifeService.Post = function (url, data) 
    {
        var tiempo = $q.defer();
        var url = self.urlBase + url;
        var peticion = $http(
        {
            method: 'POST',
            data: data,
            headers: {'Content-Type': 'application/json'},
            url: url,
            cache: false,
            timeout: tiempo.promise
        });


        var contador = setTimeout(function () 
        {
            tiempo.resolve();
        }, self.tiempoEspera);

        var promesa = peticion.then(function (respuesta) 
        {
            return respuesta;
        }, function (error) 
        {
            return error;

        });

        promesa.abortar = function () 
        {
            tiempo.resolve();
            clearTimeout(contador);
        };

        promesa.detenerTiempo = function () 
        {
            clearTimeout(contador);
        };

        promesa.finally(function () 
        {
            promesa.abortar = angular.noop;
            clearTimeout(contador);
            peticion = null;
            promesa = null;
            tiempo = null;
        });


        return promesa;
    };

    self.LifeService.Put = function (url, data) 
    {
        var tiempo = $q.defer();
        var url = self.urlBase + url;
        var peticion = $http(
        {
            method: 'PUT',
            data: data,
            headers: {'Content-Type': 'application/json'},
            url: url,
            cache: false,
            timeout: tiempo.promise
        });


        var contador = setTimeout(function () 
        {
            tiempo.resolve();
        }, self.tiempoEspera);

        var promesa = peticion.then(function (respuesta) 
        {
            return respuesta;
        }, function (error) 
        {
            return error;

        });

        promesa.abortar = function () 
        {
            tiempo.resolve();
            clearTimeout(contador);
        };

        promesa.detenerTiempo = function () 
        {
            clearTimeout(contador);
        };

        promesa.finally(function () 
        {
            promesa.abortar = angular.noop;
            clearTimeout(contador);
            peticion = null;
            promesa = null;
            tiempo = null;
        });


        return promesa;
    };
    
    self.LifeService.Delete = function (url, data) 
    {
        var tiempo = $q.defer();
        var url = self.urlBase + url;
        var peticion = $http(
        {
            method: 'DELETE',
            data: data,
            headers: {'Content-Type': 'application/json'},
            url: url,
            cache: false,
            timeout: tiempo.promise
        });


        var contador = setTimeout(function () 
        {
            tiempo.resolve();
        }, self.tiempoEspera);

        var promesa = peticion.then(function (respuesta) 
        {
            return respuesta;
        }, function (error) 
        {
            return error;

        });

        promesa.abortar = function () 
        {
            tiempo.resolve();
            clearTimeout(contador);
        };

        promesa.detenerTiempo = function () 
        {
            clearTimeout(contador);
        };

        promesa.finally(function () 
        {
            promesa.abortar = angular.noop;
            clearTimeout(contador);
            peticion = null;
            promesa = null;
            tiempo = null;
        });


        return promesa;
    };
    

    
    self.LifeService.File = function (url, data) 
    {
        var tiempo = $q.defer();
        var url = self.urlBase + url;
        
        var fd = new FormData();
    
        for(var k=0; k<data.ImagenSrc.length; k++)
        {
            fd.append('file[]', data.ImagenSrc[k]);
        }
        
        for(var k=0; k<data.ImagenTh.length; k++)
        {
            fd.append('imgth[]', data.ImagenTh[k]);
        }
        
        for(var k=0; k<data.ImagenWeb.length; k++)
        {
            fd.append('imgweb[]', data.ImagenWeb[k]);
        }
        
        if(data.ArchivoSrc)
        {
            for(var k=0; k<data.ArchivoSrc.length; k++)
            {
                fd.append('Archivo[]', data.ArchivoSrc[k]);
            }
        }

        if(data.Imagen.length > 0)
        {
            for(var k=0; k<data.Imagen.length; k++)
            {
                if(data.Imagen[k].Eliminada === undefined)
                {
                    data.Imagen[k].Eliminada = false;
                }
            }
        }
        
        if(data.Archivo)
        {
            for(var k=0; k<data.Archivo.length; k++)
            {
                if(data.Archivo[k].Eliminado != true)
                {
                    data.Archivo[k].Eliminado = false;
                }
            }
        }
        
        var Datos = jQuery.extend({}, data);

        Datos.AgregarImagen = data.ImagenSrc.length;
        
        Datos.AgregarArchivo = data.ArchivoSrc ? data.ArchivoSrc.length: 0;
        
        
        Datos.ImagenWeb = null;
        Datos.ImagenTh = null;
        Datos.ImagenSrc = [];
        Datos.ArchivoSrc = [];
        
        for(var k=0; k<data.ImagenSrc.length; k++)
        {
            Datos.ImagenSrc[k] =  new Object();
            Datos.ImagenSrc[k].Etiqueta = data.ImagenSrc[k].Etiqueta;
            Datos.ImagenSrc[k].Tema = data.ImagenSrc[k].Tema;
        }
        
        for(var k=0; k<data.ArchivoSrc.length; k++)
        {
            Datos.ArchivoSrc[k] =  new Object();
            Datos.ArchivoSrc[k].Etiqueta = data.ArchivoSrc[k].Etiqueta;
            Datos.ArchivoSrc[k].Tema = data.ArchivoSrc[k].Tema;
        }

        fd.append('datos', JSON.stringify(Datos));
        
        var peticion = $http(
        {
            method: 'POST',
            data: fd,
            headers: {'Content-Type': undefined},
            url: url,
            cache: false,
            timeout: tiempo.promise
        });
        
        var contador = setTimeout(function () 
        {
            tiempo.resolve();
        }, self.tiempoEspera);

        var promesa = peticion.then(function (respuesta) 
        {
            return respuesta;
        }, function (error) 
        {
            return error;

        });

        promesa.abortar = function () 
        {
            tiempo.resolve();
            clearTimeout(contador);
        };

        promesa.detenerTiempo = function () 
        {
            clearTimeout(contador);
        };

        promesa.finally(function () 
        {
            promesa.abortar = angular.noop;
            clearTimeout(contador);
            peticion = null;
            promesa = null;
            tiempo = null;
        });


        return promesa;
    };

    return self.LifeService;
}]);