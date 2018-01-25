var app = angular.module('MQR',['ngRoute','angular-md5', 'angular-loading-bar', 'ui.bootstrap']);

function getUrlBase ()
{
    return "php/API/index.php/";
}

app.constant('CONFIG',{
        APIURL: "php/API/index.php",
        APIKEY: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoid2ViLmFwcCIsImlhdCI6MTQ4NjUyMDMzMn0.y0ZN77h-2Ur4Sv4LkwW8XIuJ8sg6BIThF8dI2amVXPg",
});

app.factory('mhttpInterceptor', function($q,CONFIG,$rootScope,$window,$location) 
{
    
    return{
        
        'request': function(config)
        {
            if(config.url.indexOf( CONFIG.APIURL) !== -1)
            {

                if($rootScope.status)
                {
                    if($window.sessionStorage.getItem('Sistema_MQR') !== null)
                    {
                        config.headers['X-Api-Key'] = $window.sessionStorage.getItem('Sistema_MQR');    
                    }
                    else
                    {
                        config.headers['X-Api-Key'] = CONFIG.APIKEY;       
                    }
                }
                else
                {
                    config.headers['X-Api-Key'] = CONFIG.APIKEY;
                }
            }

            return config;

        },

        'response': function(response){

            if(response.headers('X-Api-Key') !== null)
            {
                if(response.headers('X-Origin-Response') === $location.host())
                {
                   $window.sessionStorage.setItem('Sistema_MQR', response.headers('X-Api-Key')); 
                   $rootScope.ChecarSesion( response.headers('X-Api-Key') );
                }

            }

            return response;
        },

        responseError: function(response)
        {
            if(response.status === 401)
            {
                $location.path('/Login');
            }

            return $q.reject(response);
        }
    };
});


app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) 
{   
    $httpProvider.interceptors.push('mhttpInterceptor');
    
    $routeProvider.
    when('/Login',{
        templateUrl: 'html/Login.html'
    }).
    when('/Aplicacion',{
        templateUrl: 'html/Aplicacion.html'
    }).
    when('/RecuperarPassword/:usuarioId/:codigo',{
        templateUrl: 'html/RecuperarPassword.html'
    }).
    //Sabiduría
       
        //administrar
        when('/Etiqueta',{
            templateUrl: 'html/Sabiduria/Administrar/AdministrarEtiqueta.html'
        }).
       
        when('/Usuario',{
            templateUrl: 'html/Sabiduria/Administrar/Usuario.html'
        }).

    
    //Actividades
        when('/Actividades',{
            templateUrl: 'html/Actividades/Actividades.html'
        }).
        when('/Frecuencia',{
            templateUrl: 'html/Actividades/Administrar/AdministrarFrecuencia.html'
        }).
        when('/TemaActividad',{
            templateUrl: 'html/Actividades/Administrar/AdministrarTemaActividad.html'
        }).
        when('/PersonaActividad',{
            templateUrl: 'html/Actividades/Administrar/AdministrarPersonaActividad.html'
        }).
        when('/Lugar',{
            templateUrl: 'html/Actividades/Administrar/AdministrarLugar.html'
        }).
        when('/Unidades',{
            templateUrl: 'html/Actividades/Administrar/AdministrarUnidades.html'
        }).
    
    //Diario
        when('/Diario',{
            templateUrl: 'html/Diario/Diario.html'
        }).
    
    //Notas
        when('/Notas',{
            templateUrl: 'html/Notas/Notas.html'
        }).
    
    //Pendiente
        when('/Objetivo',{
            templateUrl: 'html/Pendiente/Pendiente.html'
        }).
    
    
    //Conocimiento
        when('/Conocimiento',{
            templateUrl: 'html/Conocimiento/Conocimiento.html'
        }).
    
    //Buscador
        when('/Buscador',{
            templateUrl: 'html/Buscador/Buscador.html'
        }).
    
    
    otherwise({
        templateUrl: 'html/Login.html'
    });
}]);

app.run(function($rootScope, $location, $window, $http, CONFIG, $q, datosUsuario)
{   
    $rootScope.claseApp = "col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2 appPanel";
    
    $rootScope.erNombrePersonal = /^([A-Z]|Ñ|[a-z]|[ñáéíóú]|[ÁÉÍÓÚ])+((\s|\.\s)([A-Z]|Ñ|[a-z]|[ñáéíóú]|[ÁÉÍÓÚ])+)*\.?\s?$/;   //expresion regular para los apellido y el nombre de una persona
    $rootScope.erEtiqueta = /^([^\s]){1,250}$/;   //expresion regular para los apellido y el nombre de una etiqueta
    $rootScope.erPassword = /^(\w){6}(\w)*$/;   //expresion regular para la contraseña
    $rootScope.erNombreUsuario = /^(\w|ñ){3}(\w|ñ)*$/;   //expresion regular para el nombre de usurio
    $rootScope.erNumeroEntero = /^([0-9]){0,5}$/;   //número entero
    $rootScope.erTema = /^\S+\s(\S+\s?){1,5}$/;   //expresion regular para los apellido y el nombre de una etiqueta
    
    
    $rootScope.ChecarSesion = function(token)           //verifica el esatdo de la sesión
    {  
        var payload = token.split(".");
        var decode_payload = $.parseJSON( atob( payload[1] ) );
        
        if( decode_payload.state !== true )
        {
            if($window.sessionStorage.getItem('Sistema_MQR') !== null)
            {
                $window.sessionStorage.removeItem('Sistema_MQR'); 
            }
        
            if(decode_payload.state === 'expired')
            {
                 $rootScope.CerrarSesion();
                 if($location.path() !== "/Login")
                 {
                    $window.location = "#Login";
                 }
            }
        }  
    }; 
    
    $rootScope.GetEstadoSesion = function()            //Si el usuario ha iniciado sesion obtine los datos de este si se ha actualizado la aplicación web
    {
       SesionIniciada($http, $q, CONFIG).then(function(data)
       {
            if(data.SesionIniciada)
            {
                datosUsuario.enviarUsuario(data);
            }
           else
            {
                datosUsuario.enviarUsuario(new Usuario());
            }
        }).catch(function(error){
            alert(error);
        });
    };

    $rootScope.GetEstadoSesion();                     //Cada ves que se inicializa la aplicación verifica los datos del ususario
    
    /*-----tamaño de la pantalla -----------*/
    $rootScope.anchoPantalla = $( window ).width();
    $( window ).resize(function() 
    {
        $rootScope.anchoPantalla = $( window ).width();
        $rootScope.$apply();       
    });
});

//identificas cuando los datos del usuario cambian
app.factory('datosUsuario',function($rootScope)
{
  var service = {};
  service.usuario = null;
    
  service.enviarUsuario = function(usuario)
  {
      this.usuario = usuario;
      $rootScope.$broadcast('cambioUsuario');
  };
  service.getUsuario = function()
  {
      return this.usuario;
  };
  service.getUsuarioId = function()
  {
      return this.usuario.UsuarioId;
  };
  service.setAplicacion = function(aplicacion)
  {
      this.usuario.Aplicacion = aplicacion;
      $rootScope.$broadcast('cambioAplicaion');
  };
    
  return service;
});

/*--------Trabajar con multiples modales---------*/
$(document).on('show.bs.modal', '.modal', function () 
{
    var zIndex = Math.max.apply(null, Array.prototype.map.call(document.querySelectorAll('*'), function(el) 
    {
        return +el.style.zIndex;
    })) + 9999999;
    
    $(document).on('hidden.bs.modal', '.modal', function () 
    {
        $('.modal:visible').length && $(document.body).addClass('modal-open');
    });
});


