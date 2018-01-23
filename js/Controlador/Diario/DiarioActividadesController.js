app.controller("DiarioController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, ETIQUETA, CIUDAD, IMAGEN, LifeService)
{   
    $scope.titulo = "Diario";
    
    $scope.diario = [];
    $scope.fecha = [];
    $scope.etiquetaDiario = [];
    $scope.temaDiario = [];
    $scope.mensajeError = [];
    
    $scope.tema = [];
    $scope.etiqueta = [];
    
    $scope.buscarEtiqueta = "";
    $scope.buscarTema = "";
    
    $scope.etiquetaF = [];
    $scope.temaF = [];
    $scope.detalle = [];
    
    $scope.buscarFecha = "";
    $scope.agruparDiario = "Fecha";
    $scope.tabModal = "Diario";
    
    $scope.hoy = GetDate();
    
    //filtro
    $scope.buscarTemaFiltro = "";
    $scope.buscarEtiquetaFiltro = "";
    $scope.verFiltro = true;
    $scope.buscarEtiquetaBarra = "";
    $scope.buscarTemaBarra = "";
    $scope.buscarConceptoBarra = "";
    
    $scope.verConcepto = {etiqueta:true, tema:true};
    
    $scope.filtro = {etiqueta:[], tema:[], fecha: "", fechaFormato: ""};
    $scope.buscarCiudad = "";   //typeahead
    $scope.noResultados=false;  //typeahead
    
    $scope.fototeca = [];
    
    $scope.campoBuscar = "Conceptos";
    
    $scope.verTodos = false;

    
    /*------------------ Catálogos -----------------------------*/
    $scope.GetDiario = function(fecha)              
    {
        var datos = new Object();
        datos.UsuarioId = $rootScope.UsuarioId;
        datos.Fecha = fecha;
        
        GetDiario($http, $q, CONFIG, datos).then(function(data)
        {
            var diario = [];
            for(var k=0; k<data.length; k++)
            {
                diario[k] = SetDiario(data[k]);
                
                //Notas
                diario[k].NotasHTML = $sce.trustAsHtml(diario[k].NotasHTML);
                
                //$scope.GetImagenDiario(diario[k]);
                diario[k].iActive = 0;
                
                /*for(var k=0; k<diario[k].Imagen.length; k++)
                {
                    diario[k].Imagen[k].Seleccionada = true;
                }*/
                
                $scope.CambiarIndiceDetalle(0, diario[k]);
            }    
            
            $scope.detalle = diario;
            
           //$scope.GetEtiquetaPorDiario();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetFechaDiario = function(filtro)              
    {
        filtro.UsuarioId = $rootScope.UsuarioId;
        GetFechaDiario($http, $q, CONFIG, filtro).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.mes = [];
                $scope.year = [];
                
                var sql = "SELECT DISTINCT Fecha FROM ?";
                
                $scope.diario = alasql(sql, [data[1].Diario]);
                
                for(var k=0; k<$scope.diario.length; k++)
                {
                    sql = "SELECT DiarioId FROM ? WHERE Fecha = '" + $scope.diario[k].Fecha + "'";
                    $scope.diario[k] = SetFechaDiario($scope.diario[k].Fecha);
                    
                    $scope.diario[k].Diario = alasql(sql, [data[1].Diario]);
                }
                
                sql = "SELECT DISTINCT MesYear, MesN, Year, Mes FROM ? ORDER BY Year DESC, MesN DESC";
                
                $scope.mes = alasql(sql, [$scope.diario]);
                    
                sql = "SELECT DISTINCT Year FROM ? ORDER BY Year DESC";
                $scope.year = alasql(sql, [$scope.mes]);
                
                if($scope.diario.length > 0 && $scope.detalle.length === 0)
                {
                    $scope.yearSel = $scope.year[0].Year;
                    $scope.mesSel = $scope.mes[0].Mes;
                }
            }
            else
            {
                $scope.diario = [];
                $scope.mes = [];
                $scope.year = [];
                
                $scope.mensajeError = [];
                $scope.mensajeError[0] = 'Ocurrio un Error. Intenlo más tarde. ' + data[0].Estatus;
                $('#mensajeDiario').modal('toggle');
            }
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetImagenDiario = function(diario)              
    {
        GetImagenDiario($http, $q, CONFIG, diario.DiarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                diario.Imagen = data[1].Imagen;
                for(var k=0; k<diario.Imagen.length; k++)
                {
                    diario.Imagen[k].Seleccionada = true;
                }
                
                $scope.CambiarIndiceDetalle(0, diario);
            }
            else
            {
                diario.Imagen = [];
            }
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetEtiquetaPorDiario = function()              
    {
        GetEtiquetaPorDiario($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.etiquetaDiario = data[1].Etiqueta;
            }
            else
            {
                $scope.etiquetaDiario = [];
            }
            
            $scope.GetTemaPorDiario();
        
        }).catch(function(error)
        {
            alert(data[0].Estatus);
        });
    };
    
    $scope.GetTemaPorDiario = function()              
    {
        GetTemaPorDiario($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.temaDiario = data[1].Tema;
                
            }
            else
            {
                $scope.temaDiario = [];
            }
            
            $scope.SetDiarioDatos();
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.SetDiarioDatos = function()
    {   
        var sql;
        var sqlBase;
        
        sql = "SELECT DISTINCT Fecha, FechaFormato FROM ?";
        var fecha= alasql(sql, [$scope.diario]);
    
        sqlBase = "SELECT * FROM ? WHERE DiarioId = '";
        
        sqlBase2 = "SELECT EtiquetaId, Nombre, IF(Visible = '1', true, false) as Visible FROM ? WHERE DiarioId = '";
    
        for(var i=0; i<$scope.diario.length; i++)
        {

            sql =  sqlBase + $scope.diario[i].DiarioId + "'";
            //tema
            $scope.diario[i].Tema = alasql(sql, [$scope.temaDiario]);
            sql =  sqlBase2 + $scope.diario[i].DiarioId + "'";
            //etiqueta
            $scope.diario[i].Etiqueta = alasql(sql, [$scope.etiquetaDiario]);
        }
        
       //eventos fecha 
        sqlBase = "SELECT * FROM ? WHERE Fecha = '";
        
        for(var k=0; k<fecha.length; k++)
        {
            sql = sqlBase + fecha[k].Fecha + "'";
            fecha[k].Diario = alasql(sql, [$scope.diario]);
        }
        
        $scope.fecha = fecha;
        
        $scope.SetDiarioFiltros();
    };
    
    $scope.SetDiarioFiltros = function()
    {           
        $scope.temaF = [];
        $scope.etiquetaF = [];
        
        
        var sql = "SELECT DISTINCT EtiquetaId, Nombre  FROM ? ";
        $scope.etiquetaF = alasql(sql, [$scope.etiquetaDiario]);
        
        sql = "SELECT DISTINCT TemaActividadId, Tema  FROM ? ";
        $scope.temaF = alasql(sql, [$scope.temaDiario]);

        //agrupar por tema
        for(var k=0; k<$scope.temaF.length; k++)
        {
            $scope.temaF[k].Diario = $scope.GetDiarioTemas($scope.temaF[k].TemaActividadId);
        }
        
        //agrupar por etiquetas
        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            $scope.etiquetaF[k].Diario = $scope.GetDiarioEtiquetas($scope.etiquetaF[k].EtiquetaId);
        }
    };
    
    $scope.GetCiudad = function()              
    {
        GetCiudad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.ciudad = data;

        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetGaleriaFotos = function()
    {
 
        var datos = [];
        datos[0] = $rootScope.UsuarioId;


        GetFototeca($http, $q, CONFIG, datos).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].Seleccionada = false;
            }

            $scope.fototeca = data;


        }).catch(function(error)
        {
            alert(error);
        });
        
    };
    
    $scope.GetImagenEtiqueta = function(imagen, val)
    {
        GetImagenEtiqueta($http, $q, CONFIG, imagen.ImagenId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                imagen.Etiqueta = data[1].Etiqueta;
                imagen.Tema = data[2].Tema;
            }
            else
            {
                imagen.Etiqueta = [];
                imagen.Tema = [];
            }
            
            if(val !== false)
            {
                $scope.SetTemaImagenDiario(imagen, $scope.nuevoDiario.Tema);
                $scope.SetEtiquetaImagenDiario(imagen, $scope.nuevoDiario.Etiqueta);
            }


        }).catch(function(error)
        {
            alert(error);
        });
        
    };
    
    /*------- Otros catálogos ---------------*/
    $scope.GetTemaActividad = function()              
    {
        GetTemaActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].filtro = true;
            }
               
            
            $scope.tema = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetEtiqueta = function()              
    {
        GetEtiqueta($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].filtro = true;
            }
                
            $scope.etiqueta = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    
    //----------- Detalles -------------------
    $scope.VerDetalles = function(diario)
    {
        if($scope.fechaDetalle != diario.Fecha)
        {
            $scope.fechaFormatoDetalle = diario.FechaFormato;
             
            $scope.GetDiario(diario.Fecha);
            $scope.fechaDetalle = diario.Fecha;
        }
    };
    
    
    $scope.CambiarIndiceDetalle = function(val, diario)
    {
        var min = 0;
        var max = 0;
        
        
        if(diario.iActive + val < 0)
        {
            diario.iActive = diario.Imagen.length -1;
        }
        else if(diario.iActive + val >= diario.Imagen.length)
        {
            diario.iActive = 0;
        }
        else
        {
           diario.iActive += val; 
        }
        
        min = diario.iActive;
        max = min + $scope.carroselIntervalo;
        
        diario.iImg = [];
        for(var i=min; i<max; i++)
        {
            if(i<diario.Imagen.length)
            {
                diario.iImg.push(i);
            }
            else
            {
                diario.iImg.push(i-diario.Imagen.length);
            }
            
            if(diario.iImg.length >= diario.Imagen.length)
            {
                break;        
            }
        }
    };
    
    $scope.CambiarMes = function(mes)
    {
        $scope.mesSel = mes;
    };
    
    $scope.CambiarYear = function(year)
    {
        $scope.yearSel = year;
    };

    
    $( window ).resize(function() 
    {
        $scope.GetCarroselIntervalo();
        for(var k=0; k<$scope.detalle.length; k++)
        {
            $scope.CambiarIndiceDetalle(0, $scope.detalle[k]);
        }

        $scope.$apply();       
    });
    
    $scope.GetCarroselIntervalo = function()
    {
        if($rootScope.anchoPantalla <= 766)
        {
            $scope.carroselIntervalo = 3;
        }
        else if($rootScope.anchoPantalla > 766 && $rootScope.anchoPantalla < 1200)
        {
            $scope.carroselIntervalo = 4;
        }
        else if($rootScope.anchoPantalla >= 1200)
        {
            $scope.carroselIntervalo = 6;
        }
    };
    
    $scope.CambiarCampoBuscar = function(campo)
    {
        if(campo != $scope.campoBuscar)
        {
            $scope.campoBuscar = campo;
            
            if(campo == "Fecha")
            {
                $scope.buscarConceptoBarra = "";
                $scope.AbrirCalendario();
            }
            
            $scope.LimpiarFiltro();
        }
    };
    
    /*$scope.GetDiarioFecha = function(fecha)
    {
        var sql = "SELECT * FROM ? WHERE Fecha = '" + fecha + "'";
        
        
        return alasql(sql, [$scope.diario]);
    };*/
    
    $scope.GetDiarioEtiquetas = function(etiqueta)
    {
        var sql = "SELECT d.* FROM ? ed JOIN ? d ON d.DiarioId = ed.DiarioId WHERE ed.EtiquetaId = '" + etiqueta + "'";
        
        return alasql(sql, [$scope.etiquetaDiario, $scope.diario]);
    };
    
    $scope.GetDiarioTemas = function(tema)
    {
        var sql = "SELECT d.* FROM ? td JOIN ? d ON d.DiarioId = td.DiarioId WHERE td.TemaActividadId = '" + tema + "'";
        
        return alasql(sql, [$scope.temaDiario, $scope.diario]);
    };
    
    
    
    $scope.GetClaseDiario = function(dato)
    {
        if(dato == $scope.fechaDetalle)
        {
            return "active";
        }
        else
        {
            return "";
        }
    };
    
    $scope.VerDetallesDiario = function(diario)
    {
        $scope.detalleDiario = diario;
        $scope.detalleDiario.EtiquetaVisible = $scope.GetEtiquetaVisible(diario.Etiqueta);
        $('#detalleDiario').modal('toggle');
    };
    
    $scope.GetEtiquetaVisible = function(data)
    {
        var etiqueta = [];
        
        for(var k=0; k<data.length; k++)
        {
            if(data[k].Visible)
            {
                etiqueta.push(data[k]);
            }
        }
        
        return etiqueta;
    };
    
    $scope.CambiarVerBarra = function()
    {
        $scope.detalle = [];
        $scope.fechaDetalle = "";
    };
    
    $scope.CambiarAgruparDiario = function(agrupar)
    {
        if(agrupar != $scope.agruparDiario)
        {
            $scope.agruparDiario = agrupar;
            //$scope.AgruparDiario(agrupar);
            
            $scope.buscarEtiquetaBarra = "";
            $scope.buscarTemaBarra = "";
            document.getElementById("fechaBuscar").value = "";
        }
    };
    
    $scope.CambiarVerConcepto = function(concepto)
    {
        if(concepto == "tema")
        {
            $scope.verConcepto.tema = !$scope.verConcepto.tema;
        }
        else if(concepto == "etiqueta")
        {
            $scope.verConcepto.etiqueta = !$scope.verConcepto.etiqueta;
        }
    };
    
    $scope.MostrarDetalle = function(DiarioId)
    {
        if($scope.filtro.tema.length === 0 && $scope.filtro.etiqueta.length === 0)
        {
            return true;
        }
        else if($scope.verTodos)
        {
            return true;
        }
        else
        {
            for(var i=0; i<$scope.diario.length; i++)
            {
                if($scope.diario[i].Fecha == $scope.fechaDetalle)
                {
                    for(var k=0; k<$scope.diario[i].Diario.length; k++)
                    {
                        if($scope.diario[i].Diario[k].DiarioId == DiarioId)
                        {
                            return true;
                        }
                    }
                }
            }
            
            
            return false;
        }
    };
    
    //------------------------------- Filtrar -------------------------
    $scope.FiltrarDiario = function(diario)
    {        
        var cumple = false;
        
        if($scope.filtro.etiqueta.length > 0)
        {
            for(var i=0; i<$scope.filtro.etiqueta.length; i++)
            {
                cumple = false;
                for(var j=0; j<diario.Etiqueta.length; j++)
                {
                    if($scope.filtro.etiqueta[i] == diario.Etiqueta[j].EtiquetaId)
                    {
                        cumple = true;
                        break;
                    }
                }
                
                if(!cumple)
                {
                    return false;
                }
            }
        }
        else
        {
            cumple = true;
        }
        
        cumple = false;
        
        if($scope.filtro.tema.length > 0)
        {
            for(var i=0; i<$scope.filtro.tema.length; i++)
            {
                if($scope.filtro.tema != "0")
                {
                    cumple = false;
                    for(var j=0; j<diario.Tema.length; j++)
                    {
                        if($scope.filtro.tema[i] == diario.Tema[j].TemaActividadId)
                        {
                            cumple = true;
                            break;
                        }
                    }

                    if(!cumple)
                    {
                        return false;
                    }
                }
                else
                {
                    if(info.Tema.length > 0)
                    {
                        return false;
                    }
                }
                
            }
        }
        else
        {
            cumple = true;
        }
        
        if(cumple)
        {
            return true;
        }
        else
        {
            return false;
        }
        
    };
    
    //tema
    $scope.BuscarTemaFiltro = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConceptoBarra);
    };
    
    //etiqueta
    $scope.BuscarEtiquetaFiltro = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConceptoBarra);
    };
    
    $('#buscarConcepto').keydown(function(e)
    {
        switch(e.which) {
            case 13:
               var index = $scope.buscarConceptoBarra.indexOf(" ");
               
               if(index == -1)
                {
                    $scope.AgregarEtiquetaFiltro($scope.buscarConceptoBarra);
                }
                else
                {
                    var etiquetas = $scope.buscarConceptoBarra.split(" ");
                    for(var k=0; k<etiquetas.length; k++)
                    {
                        if(etiquetas[k] != "")
                        {
                            $scope.AgregarEtiquetaFiltro(etiquetas[k]);
                        }
                    }
                }
               $scope.$apply();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.AgregarEtiquetaFiltro = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].Nombre.toLowerCase() == etiqueta.toLowerCase())
            {
                if($scope.etiqueta[k].filtro)
                {
                    $scope.SetFiltroEtiqueta($scope.etiqueta[k]);
                }
                else
                {
                    $scope.buscarConceptoBarra = "";
                }
                
            }
        }
    };
    
    
    $scope.SetFiltroEtiqueta = function(etiqueta)
    {
        etiqueta.filtro = false;
        $scope.filtro.etiqueta.push(etiqueta);
            
        $scope.buscarConceptoBarra = "";
        document.getElementById('buscarConcepto').focus();
        
        $scope.GetFechaDiario($scope.filtro);
    };
    
    $scope.SetFiltroTema = function(tema)
    {
        tema.filtro = false;
        $scope.filtro.tema.push(tema);
        
        $scope.buscarConceptoBarra = "";
        document.getElementById('buscarConcepto').focus();
        
        $scope.GetFechaDiario($scope.filtro);
    };
    
     $scope.QuitarTemaFiltro = function(tema)
    {
        for(var k=0; k<$scope.tema.length; k++)
        {
            if($scope.tema[k].TemaActividadId == tema.TemaActividadId)
            {
                $scope.tema[k].filtro = true;
                break;
            }
        }
        
        for(var k=0; k<$scope.filtro.tema.length; k++)
        {
            if($scope.filtro.tema[k].TemaActividadId == tema.TemaActividadId)
            {
                $scope.filtro.tema.splice(k,1);
                break;
            }
        }
        
        $scope.GetFechaDiario($scope.filtro);
    };
    
    $scope.QuitaretiquetaFiltro = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta[k].filtro = true;
                break;
            }
        }
        
        for(var k=0; k<$scope.filtro.etiqueta.length; k++)
        {
            if($scope.filtro.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.filtro.etiqueta.splice(k,1);
                break;
            }
        }
        
        $scope.GetFechaDiario($scope.filtro);
        
    };

    $scope.LimpiarFiltro = function()
    {
        $scope.filtro = {etiqueta:[], tema:[], fecha: "", fechaFormato: ""};
        
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            $scope.etiqueta[k].filtro = true;
        }
        
        for(var k=0; k<$scope.tema.length; k++)
        {
            $scope.tema[k].filtro = true;
        }
        
        $scope.verFiltro = true;
        
        $scope.buscarConceptoBarra = "";
        
        $scope.verTodos = false;
        
        $scope.GetFechaDiario($scope.filtro);
        
        //document.getElementById("fechaFiltro").value = "";
    };
    
    $scope.LimpiarBuscarFiltro = function()
    {
        $scope.buscarConceptoBarra = "";
        //$scope.LimpiarFiltroFecha();
        
        if($scope.campoBuscar == "Conceptos")
        {
            document.getElementById("buscarConcepto").focus();
        }
    };
    
    $scope.AbrirCalendario = function()
    {        
        document.getElementById("fechaFiltro").focus();
    };
    
    //Presionar enter etiqueta
    $('#bucarEtiquetaFiltro').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.CheckFiltroEtiqueta();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.CheckFiltroEtiqueta = function()
    {
        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            if($scope.etiquetaF[k].Nombre.toLowerCase() == $scope.buscarEtiquetaFiltro.toLowerCase() && !$scope.etiquetaF[k].Filtro)
            {
                $scope.etiquetaF[k].Filtro = true;
                $scope.SetFiltroEtiqueta($scope.etiquetaF[k].EtiquetaId);
                $scope.buscarEtiquetaFiltro = "";
                break;
            }
        }
        
        $scope.$apply();
    };
    
    $('#buscarTemaFiltro').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.CheckFiltroTema();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.CheckFiltroTema = function()
    {
        for(var k=0; k<$scope.temaF.length; k++)
        {
            if($scope.temaF[k].Tema.toLowerCase() == $scope.buscarTemaFiltro.toLowerCase() && !$scope.temaF[k].Filtro)
            {
                $scope.temaF[k].Filtro = true;
                $scope.SetFiltroTema($scope.temaF[k].TemaActividadId);
                $scope.buscarTemaFiltro = "";
                break;
            }
        }
        
        $scope.$apply();
    };
    
    $scope.CambiarVerFiltro = function()
    {
        $scope.verFiltro = !$scope.verFiltro;
    };
    
    $scope.AgregarDiarioEtiquetas = function(diario)
    {
        $scope.AbrirDiario("ClonarEtiquetas", diario, null);
    };  
    
    //------------ Abrir - Editar -----------------
    $scope.AbrirDiario = function(operacion, objeto, fecha)
    {
        $scope.operacion = operacion;
    
        document.getElementById("fechaDiaria");
        $scope.tabModal = "Diario";
        
        if(operacion == "Agregar")
        {
            $scope.nuevoDiario = new Diario();
            $scope.ActivarDesactivarTema([]);
            $scope.ActivarDesactivarEtiqueta([]);
            $scope.IniciarDiario(fecha);
            
            
            document.getElementById("horaDiario").value = "";
            $('#horaDiario').data("DateTimePicker").clear();

            $scope.SetCiudadDefecto();
            
            $scope.$broadcast('IniciarArchivo', $scope.nuevoDiario);
            $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevoDiario, 'Diario');
            $scope.inicioDiario = jQuery.extend({}, $scope.nuevoDiario);
        }
        else if(operacion == "Editar")
        {
            $scope.nuevoDiario = $scope.SetDiario(objeto);
            
            $scope.FechaDefinida = false;
            $scope.ActivarDesactivarTema($scope.nuevoDiario.Tema);
            $scope.ActivarDesactivarEtiqueta($scope.nuevoDiario.Etiqueta);
            
            document.getElementById("fechaDiario").value = $scope.nuevoDiario.Fecha;
            $('#horaDiario').data("DateTimePicker").clear();
            document.getElementById("horaDiario").value = $scope.nuevoDiario.Hora;
            
             if(objeto.Ciudad.CiudadId != null)
            {
                $scope.buscarCiudad = SetCiudad(objeto.Ciudad);
            }
            
            for(var k=0; k<objeto.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta(objeto.Imagen[k], false);
            }
            
            $scope.$broadcast('IniciarArchivo', $scope.nuevoDiario);
            $scope.inicioDiario = jQuery.extend({}, $scope.nuevoDiario);
            
            $scope.ciudadActual = objeto.Ciudad.CiudadId;
        }
        else if(operacion == "ClonarEtiquetas")
        {
            $scope.FechaDefinida = false;
            $scope.nuevoDiario = $scope.SetDiarioEtiqueta(objeto);
            $scope.ActivarDesactivarTema(objeto.Tema);
            $scope.ActivarDesactivarEtiqueta(objeto.Etiqueta);
            
            document.getElementById("fechaDiario").value = $scope.nuevoDiario.Fecha;
            
            $scope.operacion = "Agregar";
            
            if(objeto.Ciudad.CiudadId !== null)
            {
                $scope.buscarCiudad = SetCiudad(objeto.Ciudad);
            }
            
            for(var k=0; k<objeto.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta(objeto.Imagen[k], false);
            }
            
            $scope.inicioDiario = jQuery.extend({}, $scope.nuevoDiario);
        }
        
        $('#modalApp').modal('toggle');
        $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevoDiario, 'Diario');
    };
    
    $scope.SetDiario = function(data)
    {
        var diario = new Diario();
        
        diario.DiarioId = data.DiarioId;
        diario.Notas = data.Notas;
        diario.Fecha = data.Fecha;
        diario.Hora = data.Hora;
        diario.FechaFormato = data.FechaFormato;
        diario.HoraFormato = $scope.SetHora(data.Hora);
        diario.Imagen = data.Imagen;
        diario.Archivo = data.Archivo;
        
        diario.iActive = data.iActive;
        
        if(diario.Notas !== null && diario !==undefined)
        {
             diario.NotasHTML = data.Notas.replace(/\r?\n/g, "<br>");
             diario.NotasHTML = $sce.trustAsHtml(diario.NotasHTML);
        }
        else
        {
            diario.NotasHTML = "";
            diario.NotasHTML = $sce.trustAsHtml(diario.NotasHTML);
        }
        
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            diario.Etiqueta[k] = SetEtiqueta(data.Etiqueta[k]);
            diario.Etiqueta[k].Visible = data.Etiqueta[k].Visible;
        }
        
        for(var k=0; k<data.Tema.length; k++)
        {
            diario.Tema[k] = SetTemaActividad(data.Tema[k]);
        }
        
        diario.Ciudad = SetCiudad(data.Ciudad);
        
        return diario;

    };
    
    $scope.SetHora = function(hora)
    {
        if(hora === null || hora === undefined)
        {
            hora = null;
        }
        else
        {
            if(hora.length == 0)
            {
                hora = null;
            }
            else
            {
                hora = convertTo24Hour(hora);
            }
        }
        return hora;
    };
    
    $scope.SetCiudadDefecto = function()
    {
        for(var k=0; k<$scope.ciudad.length; k++)
        {
            if($scope.ciudad[k].DiarioDefecto == "1")
            {
                $scope.buscarCiudad = SetCiudad($scope.ciudad[k]);
                $scope.nuevoDiario.Ciudad = SetCiudad($scope.ciudad[k]);
                break;
            }
        }
    };
    
    $scope.SetDiarioEtiqueta = function(data)
    {
        var diario = new Diario();
        
        diario.Fecha = data.Fecha;
        diario.FechaFormato = data.FechaFormato;
        diario.Ciudad = data.Ciudad;
        diario.Imagen = data.Imagen;
        
        diario.NotasHTML = "";
        
        for(var k=0; k<data.Etiqueta.length; k++)
        {
            diario.Etiqueta[k] = SetEtiqueta(data.Etiqueta[k]);
            diario.Etiqueta[k].Visible = data.Etiqueta[k].Visible;
        }
        
        for(var k=0; k<data.Tema.length; k++)
        {
            diario.Tema[k] = SetTemaActividad(data.Tema[k]);
        }
        
        return diario;
    };
    
    $scope.IniciarDiario = function(fecha)
    {
        if(fecha !== null && $scope.agruparDiario == "Fecha")
        {
            $scope.FechaDefinida = true;
            $scope.nuevoDiario.Fecha = fecha;
            $scope.nuevoDiario.FechaFormato = TransformarFecha(fecha);
        }
        else
        {
            $scope.FechaDefinida = false;
            $scope.nuevoDiario.Fecha = GetDate();
            $scope.nuevoDiario.FechaFormato = TransformarFecha($scope.nuevoDiario.Fecha);
        }
        
        if($scope.tipoConcepto == "Temas" && $scope.operacion == "Agregar")
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].Tema == $scope.detalleDato)
                {
                    $scope.nuevoDiario.Tema.push($scope.tema[k]);
                    $scope.tema[k].show = false;
                    break;
                }
            }
        }
        
        if($scope.tipoConcepto == "Etiquetas" && $scope.operacion == "Agregar")
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].Nombre == $scope.detalleDato)
                {
                    $scope.nuevoDiario.Etiqueta.push($scope.etiqueta[k]);
                    $scope.etiqueta[k].show = false;
                    break;
                }
            }
        }

        document.getElementById("fechaDiario").value = $scope.nuevoDiario.Fecha;
    };
    
    $scope.ActivarDesactivarTema = function(tema)
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
    
    $scope.ActivarDesactivarEtiqueta = function(etiqueta)
    {
        for(var i=0; i<$scope.etiqueta.length; i++)
        {
            $scope.etiqueta[i].show = true;
            for(var j=0; j<etiqueta.length; j++)
            {
                if($scope.etiqueta[i].EtiquetaId == etiqueta[j].EtiquetaId)
                {
                    if(etiqueta[j].Visible)
                    {
                        $scope.etiqueta[i].show = false;
                    }
                    
                    break;
                }
            }
        }
    };
    
    //----------- Cerrar
    $scope.CerrarDiario = function()
    {
        if(JSON.stringify($scope.inicioDiario) === JSON.stringify($scope.nuevoDiario))
        {
            $('#modalApp').modal('toggle');
            $scope.LimpiarInterfaz();
        }
        else
        {
            $('#cerrarDiario').modal('toggle');
        }
    };
    
    $scope.ConfirmarCerrarDiario = function()
    {
        $('#modalApp').modal('toggle');
        $scope.mensajeError = [];
        $scope.LimpiarInterfaz();
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.buscarEtiqueta = "";
        $scope.buscarTema = "";
        $scope.buscarCiudad = "";
    };
    
    //_-------- Buscar Fecha Buscar -------------------
    $('#fechaFiltro').datetimepicker(
    { 
        locale: 'es',
        format: 'YYYY-MM-DD',
        maxDate: new Date(),
        date: new Date() 
    });
    
    $scope.CambiarFechaBuscar = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            var fecha = element.value;
            
            
            var year = fecha.slice(0,4);
            var mes = parseInt(fecha.slice(5,7)-1);
            var dia = fecha.slice(8,10);
            
            $scope.CambiarYear(year);
            $scope.CambiarMes(meses[mes]);
            
            
            for(var k=0; k<$scope.diario.length; k++)
            {
                if($scope.diario[k].Year == year && $scope.diario[k].Mes == meses[mes] && $scope.diario[k].DiaN == dia)
                {
                    $scope.VerDetalles($scope.diario[k]);
                    break;
                }
            }
            
            /*$scope.filtro.fecha = element.value;
            if($scope.filtro.fecha.length > 0)
            {
                $scope.filtro.fechaFormato = TransformarFecha(element.value);
            }
            else
            {
                $scope.filtro.fechaFormato  = "";
            }*/
        });
    };
    
    //--------- Fecha -------------------
     $('#fechaDiario').datetimepicker(
    {
        locale: 'es',
        format: 'YYYY-MM-DD',
        maxDate: new Date(),
    });
    
    $scope.CambiarFechaDiario = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevoDiario.Fecha = element.value;
            $scope.nuevoDiario.FechaFormato = TransformarFecha(element.value);
        });
    };
    
    //----------- Hora -------------
    $('#horaDiario').datetimepicker(
    {
        locale: 'es',
        format: 'hh:mm A',
        showClear: true,
        showClose: true,
        toolbarPlacement: 'bottom'
    });
    
    $scope.CambiarHoraDiario = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevoDiario.Hora = element.value;
        });
    };
    
    //Ciudad
    $scope.CambiarCiudad = function()
    {
        $scope.nuevoDiario.Ciudad = $scope.buscarCiudad;
    };
    
    $scope.QuitaCiudad = function()
    {
        $scope.nuevoDiario.Ciudad = new Ciudad();
        $scope.buscarCiudad = "";
    };
    
    //etiqueta
    $('#nuevaEtiqueta').keydown(function(e)
    {
        switch(e.which) {
            case 13:
               $scope.IdentificarEtiqueta();
                $scope.$apply();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.AgregarEtiqueta = function(etiqueta, ver)
    {
        etiqueta.Visible = ver;
        $scope.nuevoDiario.Etiqueta.push(etiqueta);
        
        etiqueta.show = false;
        $scope.buscarConcepto = "";
        
        if(ver)
        {
            $scope.SetEtiquetaTodasImagenes(etiqueta);
        }
    };
    
    $scope.IdentificarEtiqueta = function()
    {
        if($rootScope.erEtiqueta.test($scope.buscarConcepto))
        {
            $scope.verEtiqueta  = true;
            $scope.AgregarNuevaEtiqueta($scope.buscarConcepto);
            $scope.buscarConcepto = "";
        }
        else if($rootScope.erTema.test($scope.buscarConcepto))
        {
            $scope.verEtiqueta  = false;
            var tema = $scope.buscarConcepto;
            $scope.AgregarNuevoTema(tema);
            //$scope.SepararEtiqueta(tema);
            $scope.buscarConcepto = "";
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            //$scope.buscarConcepto = "";
            $('#mensajeDiario').modal('toggle');
            $scope.$apply();
            return;
        }
    };
    
    $scope.SepararEtiqueta = function(etiqueta)
    {        
        $scope.verEtiqueta = false;
        
        etiqueta = etiqueta.split(" ");
        
        for(var k=0; k<etiqueta.length; k++)
        {
            $scope.AgregarNuevaEtiqueta(etiqueta[k], false);
        }
    };
    
    $scope.AgregarNuevaEtiqueta = function(etiqueta, insertEtiqueta)
    {
        if(etiqueta.length > 0)
        {
            if(!$scope.ValidarEtiquetaAgregado(etiqueta))
            {
                //$scope.$apply();
                return;    
            }
            else
            {
                if(insertEtiqueta !== false)
                {
                     $scope.EsNuevaEtiqueta(etiqueta);
                }
                else
                {
                    $scope.EsEtiquetaSinInsert(etiqueta);
                }
            }
        }
    };
    
    
    $scope.EsNuevaEtiqueta = function(nueva)
    {
        var etiqueta = new Etiqueta();
        etiqueta.Nombre = nueva.charAt(0).toUpperCase() + nueva.substr(1).toLowerCase();
        etiqueta.UsuarioId =  $scope.usuarioLogeado.UsuarioId;
        
        AgregarEtiqueta($http, CONFIG, $q, etiqueta).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                data[2].Etiqueta.Visible = $scope.verEtiqueta;
                data[2].Etiqueta.filtro = true;

                $scope.buscarConcepto = "";

                $scope.nuevoDiario.Etiqueta.push(data[2].Etiqueta);

                $scope.etiqueta.push(data[2].Etiqueta);
                $scope.etiqueta[$scope.etiqueta.length-1].show = false;
                
                
                $scope.mensaje = "Etiqueta Agregada.";
                $scope.EnviarAlerta('Modal');
                
                if($scope.verEtiqueta)
                {   
                    $scope.SetEtiquetaTodasImagenes(data[2].Etiqueta);
                }
                //$scope.$apply();
            }
            else
            {
                 $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeEtiqueta').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeEtiqueta').modal('toggle');
        });
    };
    
    $scope.EsEtiquetaSinInsert = function(nueva)
    {
        console.log("entra");
        var etiqueta = new Etiqueta();
        etiqueta.Nombre = nueva.charAt(0).toUpperCase() + nueva.substr(1).toLowerCase();
        etiqueta.EtiquetaId = "-1";
        etiqueta.Visible = $scope.verEtiqueta;

        $scope.nuevoDiario.Etiqueta.push(etiqueta);
    };
    
    $scope.ValidarEtiquetaAgregado = function(concepto)
    {
        if($rootScope.erEtiqueta.test(concepto))
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].Nombre.toLowerCase() == concepto.toLowerCase())
                {
                    if($scope.etiqueta[k].show)
                    {
                        $scope.AgregarEtiqueta($scope.etiqueta[k], $scope.verEtiqueta);
                        return false;
                    }
                    else
                    {
                        if($scope.verEtiqueta)
                        {
                            $scope.etiqueta[k].Visible = true;
                        }
                        
                        $scope.mensajeError = [];
                        //$scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                        $scope.buscarConcepto = "";
                        //$('#mensajeNota').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.nuevoDiario.Etiqueta.length; k++)
            {
                if($scope.nuevoDiario.Etiqueta[k].Nombre.toLowerCase() == concepto.toLowerCase())
                {
                    if($scope.verEtiqueta)
                    {
                        $scope.nuevoDiario.Etiqueta[k].Visible = true;
                    }
                    $scope.mensajeError = [];
                    //$scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                    $scope.buscarConcepto = "";
                    //$('#mensajeNota').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            $scope.buscarConcepto = "";
            $('#mensajeNota').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    /*----------------- Crear concepto -------------*/
    $scope.CrearConcepto = function()
    {
        $('#modalConcepto').modal('toggle');
    };
    
    $scope.TerminarDefinicionConcepto = function()
    {
        $scope.EsNuevaEtiqueta();
        $("#modalConcepto").modal("toggle");
    };
    
    $scope.QuitarEtiqueta = function(etiqueta)
    {
        
        for(var k=0; k<$scope.nuevoDiario.Etiqueta.length; k++)
        {
            if(etiqueta == $scope.nuevoDiario.Etiqueta[k])
            {
                $scope.nuevoDiario.Etiqueta.splice(k,1);
                break;
            }
        }
        
        if(etiqueta.EtiquetaId != "-1")
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.etiqueta[k].show = true;
                    break;
                }
            }
        }

        for(var i=0; i<$scope.nuevoDiario.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevoDiario.Imagen[i].Etiqueta.length; j++)
            {
                if($scope.nuevoDiario.Imagen[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevoDiario.Imagen[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevoDiario.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevoDiario.ImagenSrc[i].Etiqueta.length; j++)
            {
                if($scope.nuevoDiario.ImagenSrc[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevoDiario.ImagenSrc[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
    };
    
    $scope.EditarEtiqueta = function(etiqueta)
    {
        if(etiqueta.EtiquetaId == "-1")
        {
            $scope.buscarEtiqueta = etiqueta.Nombre;
            
            for(var k=0; k<$scope.nuevoDiario.Etiqueta.length; k++)
            {
                if($scope.nuevoDiario.Etiqueta[k].Nombre == etiqueta.Nombre)
                {
                    $scope.nuevoDiario.Etiqueta.splice(k,1);
                    break;
                }
            }
            
            $("#nuevaEtiqueta").focus();
        }
    };
    
    $scope.FiltrarBuscarEtiqueta = function(etiqueta, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = etiqueta.Nombre.toLowerCase().indexOf(buscar.toLowerCase());


                if(index < 0)
                {
                    return false;
                }
                else
                {
                    if(index === 0)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
            else
            {
                return true;
            }
        }
    };
    
    $scope.BuscarEtiqueta = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConcepto);
    };
    
    
    //----Tema-----
    $('#nuevoTema').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.AgregarNuevoTema();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.AgregarTema = function(tema)
    {
        $scope.nuevoDiario.Tema.push(tema);
        
        tema.show = false;
        $scope.buscarConcepto = "";
        
        $scope.todasImg = "tema";
        $scope.SetTemaTodasImagenes(tema);
    };
    
    $scope.AgregarNuevoTema = function(nuevo)
    {
        if(nuevo.length > 0)
        {
            if(!$scope.ValidarTemaAgregado(nuevo))
            {
                $scope.$apply();
                return;    
            }
            else
            {
                $scope.EsNuevoTema(nuevo);
            }
        }
    };
    
    $scope.EsNuevoTema = function(nueva)
    {
        var tema = new TemaActividad();
        tema.Tema = nueva;
        tema.UsuarioId =  $rootScope.UsuarioId;
        
        AgregarTemaActividad($http, CONFIG, $q, tema).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.buscarConcepto = "";
                data[2].Tema.filtro = true;
                
                $scope.nuevoDiario.Tema.push(data[2].Tema);

                $scope.tema.push(data[2].Tema);
                $scope.tema[$scope.tema.length-1].show = false;
                
                
                $scope.mensaje = "Tema Agregado.";

                $scope.EnviarAlerta('Modal');
                
                $scope.todasImg = "tema";
                $scope.SetTemaTodasImagenes(data[2].Tema);

                //$scope.$apply();
            }
            else
            {
                 $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeDiario').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length]  = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeDiario').modal('toggle');
        });
    };
    
    $scope.ValidarTemaAgregado = function(nuevo)
    {
        if($rootScope.erTema.test(nuevo))
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].Tema.toLowerCase() == nuevo.toLowerCase())
                {
                    if($scope.tema[k].show)
                    {
                        $scope.AgregarTema($scope.tema[k]);
                        return false;
                    }
                    else
                    {
                        $scope.mensajeError = [];
                        //$scope.mensajeError[$scope.mensajeError.length] = "*Este tema ya fue agregado.";
                        $scope.buscarTema = "";
                        //$('#mensajeDiario').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.nuevoDiario.Tema.length; k++)
            {
                if($scope.nuevoDiario.Tema[k].Tema.toLowerCase() == nuevo.toLowerCase())
                {
                    $scope.mensajeError = [];
                    //$scope.mensajeError[$scope.mensajeError.length] = "*Este tema ya fue agregado.";
                    $scope.buscarTema = "";
                    //$('#mensajeDiario').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un tema válido.";
            $scope.buscarTema = "";
            $('#mensajeDiario').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    $scope.QuitarTema = function(tema)
    {
        
        for(var k=0; k<$scope.nuevoDiario.Tema.length; k++)
        {
            if(tema == $scope.nuevoDiario.Tema[k])
            {
                $scope.nuevoDiario.Tema.splice(k,1);
                break;
            }
        }
        
        if(tema != "-1")
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.tema[k].show = true;
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevoDiario.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevoDiario.Imagen[i].Tema.length; j++)
            {
                if($scope.nuevoDiario.Imagen[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevoDiario.Imagen[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevoDiario.Imagen[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevoDiario.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevoDiario.ImagenSrc[i].Tema.length; j++)
            {
                if($scope.nuevoDiario.ImagenSrc[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevoDiario.ImagenSrc[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevoDiario.ImagenSrc[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }  
    };
    
    
    $scope.EditarTema = function(tema)
    {
        if(tema.TemaActividadId == "-1")
        {
            $scope.buscarConcepto = tema.Tema;
            
            for(var k=0; k<$scope.nuevoDiario.Tema.length; k++)
            {
                if($scope.nuevoDiario.Tema[k].Tema == tema.Tema)
                {
                    $scope.nuevoDiario.Tema.splice(k,1);
                    break;
                }
            }
            
            $("#nuevaEtiqueta").focus();
        }
    };
    
    $scope.FiltrarBuscarTema = function(tema, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = tema.Tema.toLowerCase().indexOf(buscar.toLowerCase());


                if(index < 0)
                {
                    return false;
                }
                else
                {
                    if(index === 0)
                    {
                        return true;
                    }
                    else
                    {
                        if(tema.Tema[index-1] == " ")
                        {
                            return true;
                        }
                        else
                        {
                            return false;
                        }
                    }
                }
            }
            else
            {
                return true;
            }
        }
    };
    
    $scope.BuscarTema = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConcepto);
    };
    
    
    //------------ terminar ---------
    $scope.TerminarDiario = function()
    {
        if(!$scope.ValidarDatos())
        {
            $('#mensajeDiario').modal('toggle');
            return;
        }
        else
        {
            //----- Diario
            $scope.QuitarEtiquetaNoVisible();
            
            $scope.nuevoDiario.Hora = $scope.SetNullHora($scope.nuevoDiario.Hora);
            $scope.nuevoDiario.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            
            $scope.AgregarEtiquetaOcultar();
            
            /*if($scope.operacion == "Agregar")
            {
                $scope.AgregarDiario();
            }
            if($scope.operacion == "Editar")
            {
                $scope.EditarDiario();
            }*/
        }
    };
    
    $scope.QuitarEtiquetaNoVisible = function()
    {
        for(var k=0; k<$scope.nuevoDiario.Etiqueta.length; k++)
        {
            if(!$scope.nuevoDiario.Etiqueta[k].Visible)
            {
                $scope.nuevoDiario.Etiqueta.splice(k,1);
                k--;
            }
        }

    };
    
    $scope.SetNullHora = function(hora)
    {
        if(hora === null || hora === undefined)
        {
            return null;
        }
        else
        {
            if(hora.length == 0)
            {
                return null;
            }
            else
            {
                return hora;
            }
        }
    };
    
    $scope.AgregarEtiquetaOcultar = function()
    {
        $scope.$broadcast('SepararEtiqueta', $scope.nuevoDiario.Tema, 'Diario');
        
        /*for(var k=0; k<$scope.nuevoDiario.Tema.length; k++)
        {
            $scope.SepararEtiqueta($scope.nuevoDiario.Tema[k].Tema);
        }*/
    };
    
    $scope.$on('TerminarEtiquetaOculta',function(evento, modal)
    {    
        if(modal == "Diario")
        {
            $rootScope.$broadcast('EtiquetaOcultaArchivoIniciar', $scope.nuevoDiario);
        }
        
    });
    
    $scope.$on('TerminarEtiquetaOcultaArchivo',function()
    {    
        if($scope.operacion == "Agregar")
        {
            $scope.AgregarDiario();
        }
        if($scope.operacion == "Editar")
        {
            $scope.EditarDiario();
        }
    });
    
    $scope.AgregarDiario = function()    
    {
        (self.servicioObj = LifeService.File('AgregarDiario', $scope.nuevoDiario)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var data = dataResponse.data;
                $('#modalApp').modal('toggle');
                $scope.mensaje = "Diario agregado.";
                $scope.EnviarAlerta('Vista');
                
                $scope.nuevoDiario.DiarioId = data[1].DiarioId;
                $scope.nuevoDiario.Etiqueta = data[2].Etiqueta;
                $scope.nuevoDiario.Tema = data[3].Tema;
                
                $scope.SetNuevoDiario($scope.nuevoDiario);
                $scope.GetFechaDiario($scope.filtro);
            
                $scope.nuevoDiario = new Diario();
                
                $scope.LimpiarInterfaz();
                                
            } else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede realizar la operación, intentelo más tarde", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
        
        /*AgregarDiario($http, CONFIG, $q, $scope.nuevoDiario).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalApp').modal('toggle');
                $scope.mensaje = "Diario agregado.";
                $scope.EnviarAlerta('Vista');
                
                $scope.nuevoDiario.DiarioId = data[1].DiarioId;
                $scope.nuevoDiario.Etiqueta = data[2].Etiqueta;
                $scope.nuevoDiario.Tema = data[3].Tema;
                
                $scope.SetNuevoDiario($scope.nuevoDiario);
                $scope.GetFechaDiario($scope.filtro);
            
                $scope.nuevoDiario = new Diario();
                
                $scope.LimpiarInterfaz();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeDiario').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeDiario').modal('toggle');
        });*/
    };
    
    $scope.EditarDiario = function()    
    {
        
        $scope.nuevoDiario.CambiarCiudad = $scope.nuevoDiario.Ciudad.CiudadId == $scope.ciudadActual ? false : true;
        
        
        (self.servicioObj = LifeService.File('EditarDiario', $scope.nuevoDiario)).then(function (dataResponse) 
        {
            if (dataResponse.status == 200) 
            {
                var data = dataResponse.data;
                 $('#modalApp').modal('toggle');
                $scope.nuevoDiario.Etiqueta = data[1].Etiqueta;
                $scope.nuevoDiario.Tema = data[2].Tema;
                
                $scope.mensaje = "Diario editado.";
                
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');
                
                $scope.SetNuevoDiario($scope.nuevoDiario);
                $scope.GetFechaDiario($scope.filtro);
                                
            } else 
            {
                $rootScope.$broadcast('Alerta', "Por el momento no se puede realizar la operación, intentelo más tarde", 'error');
            }
            self.servicioObj.detenerTiempo();
        }, 
        function (error) 
        {
            $rootScope.$broadcast('Alerta', error, 'error');
        });
            
        /*EditarDiario($http, CONFIG, $q, $scope.nuevoDiario).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $('#modalApp').modal('toggle');
                $scope.nuevoDiario.Etiqueta = data[1].Etiqueta;
                $scope.nuevoDiario.Tema = data[2].Tema;
                
                $scope.mensaje = "Diario editado.";
                
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');
                
                $scope.SetNuevoDiario($scope.nuevoDiario);
                $scope.GetFechaDiario($scope.filtro);
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeDiario').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeDiario').modal('toggle');
        });*/
    };
    
    $scope.SetNuevoDiario = function(diario)
    {
        var ndiario = $scope.SetDiario(diario);
        $scope.GetDiario(diario.Fecha);
        ndiario.iActive = 0;
        $scope.GetImagenDiario(ndiario);
        //$scope.CambiarIndiceDetalle(0, ndiario);
        
        var sqlBase = "SELECT COUNT(*) as num FROM ? WHERE TemaActividadId= '";
        //tema
        for(var k=0; k<diario.Tema.length; k++)
        {
            sql = sqlBase + diario.Tema[k].TemaActividadId + "'";

            count = alasql(sql, [$scope.tema]);
            
            if(count[0].num === 0)
            {
                diario.Tema[k].filtro = true;
                $scope.tema.push(diario.Tema[k]);
            }
        }
        
        //etiqueta
        sqlBase = "SELECT COUNT(*) as num FROM ? WHERE EtiquetaId= '";
        for(var k=0; k<diario.Etiqueta.length; k++)
        {
            sql = sqlBase + diario.Etiqueta[k].EtiquetaId + "'";
            
            //etiqueta Dropdownlist
            count = alasql(sql, [$scope.etiqueta]);
            
            if(count[0].num === 0)
            {
               diario.Etiqueta[k].filtro = true;
               $scope.etiqueta.push(diario.Etiqueta[k]);
            }
        }
        
        
        //Agregar
        if($scope.operacion == "Agregar")
        {
            if(ndiario.Fecha == $scope.fechaDetalle)
            {
                $scope.detalle.push(ndiario);
            }
            else
            {
                var nf = SetFechaDiario(ndiario.Fecha);
                //$scope.ValidarAgregarFecha(ndiario.Fecha);
                
                $scope.mesSel = nf.Mes;
                $scope.yearSel = nf.Year;
                $scope.VerDetalles(nf);
            }
        }
        else if($scope.operacion == "Editar")
        {
            if(ndiario.Fecha == $scope.fechaDetalle)
            {
                for(var k=0; k<$scope.detalle.length; k++)
                {
                    if($scope.detalle[k].DiarioId == ndiario.DiarioId)
                    {
                        $scope.detalle[k] = ndiario;
                    }
                }
            }
            else
            {
                /*if($scope.detalle.length < 2)
                {
                    $scope.ValidarQuitarFecha($scope.fechaDetalle);
                }*/
                
                var nf = SetFechaDiario(ndiario.Fecha);
                //$scope.ValidarAgregarFecha(ndiario.Fecha);
                
                $scope.mesSel = nf.Mes;
                $scope.yearSel = nf.Year;
                $scope.VerDetalles(nf);
            }
        }

        //Ciudad
        if($scope.operacion != "Editar" || diario.CambiarCiudad)
        {
            for(var k=0; k<$scope.ciudad.length; k++)
            {
                if(ndiario.Ciudad.CiudadId == $scope.ciudad[k].CiudadId)
                {
                    $scope.ciudad[k].DiarioDefecto = "1";
                }
                else
                {
                    $scope.ciudad[k].DiarioDefecto = "0";
                }
            }
        }
        
    };
    
    $scope.ValidarAgregarFecha = function(fecha)
    {
        var agregado = false;
        for(var k=0; k<$scope.diario.length; k++)
        {
            if($scope.diario[k].Fecha == fecha)
            {
                agregado = true;
                break;
            }
        }
        
        if(!agregado)
        {
            var nf = SetFechaDiario(fecha);
            $scope.diario.push(nf);
            
            agregado = false;
            for(var k=0; k<$scope.mes.length; k++)
            {
                if($scope.mes[k].MesYear == nf.MesYear)
                {
                    agregado = true;
                    break;
                }
            }
            
            if(!agregado)
            {
                var nm = new Object();
                nm.MesYear =  nf.MesYear;
                nm.MesN = nf.MesN;
                nm.Year = nf.Year;
                nm.Mes = nf.Mes;
                
                $scope.mes.push(nm);
                
                // validar año
                agregado = false;
                for(var k=0; k<$scope.year.length; k++)
                {
                    if($scope.year[k].Year == nf.Year)
                    {
                        agregado = true;
                        break;
                    }
                }
                
                if(!agregado)
                {
                    var ny = new Object();
                    ny.Year = nf.Year;
                    $scope.year.push(ny);
                }
            }
        }
    };
    
    $scope.ValidarQuitarFecha = function(fecha)
    {
        $scope.detalle = [];
        $scope.fechaDetalle = "";

        var mesBorrar, yearBorrar;
        /*----borrar fecha del diario---*/
        for(var k=0; k<$scope.diario.length; k++)
        {
            if($scope.diario[k].Fecha == fecha)
            {
                mesBorrar = $scope.diario[k].MesYear;
                yearBorrar = $scope.diario[k].Year;
                $scope.diario.splice(k,1);
                break;
            }
        }

        /*------- Borrar mes ------------*/
        var borrar = true;
        for(var k=0; k<$scope.diario.length; k++)
        {
            if($scope.diario[k].Fecha != fecha && $scope.diario[k].MesYear ==  mesBorrar)
            {
                borrar = false;
                break;
            }
        }

        if(borrar)
        {
            for(var k=0; k<$scope.mes.length; k++)
            {
                if($scope.mes[k].MesYear == mesBorrar)
                {
                    $scope.mes.splice(k,1);
                    break;
                }
            }    
        }
        
        /*----------- Borrar año ----------------*/
        borrar = true;
        for(var k=0; k<$scope.diario.length; k++)
        {
            if($scope.diario[k].Fecha != fecha && $scope.diario[k].Year ==  yearBorrar)
            {
                borrar = false;
                break;
            }
        }

        if(borrar)
        {
            for(var k=0; k<$scope.year.length; k++)
            {
                if($scope.year[k].Year == yearBorrar)
                {
                    $scope.year.splice(k,1);
                    break;
                }
            }    
        }
    };
    
    $scope.ValidarDatos = function()
    {
        $scope.mensajeError = [];
        
        if($scope.nuevoDiario.Fecha.length === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona una fecha.";
        }
        
        if($scope.nuevoDiario.Ciudad.CiudadId === null)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona una ciudad.";
        }
        else if($scope.nuevoDiario.Ciudad.CiudadId.length === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona una ciudad.";
        }
        
        if($scope.nuevoDiario.Notas !== undefined && $scope.nuevoDiario.Notas !== null)
        {
            if($scope.nuevoDiario.Notas.length === 0)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una nota del diario.";
            }
        }
        else
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una nota del diario.";
        }
        
        if(($scope.nuevoDiario.Etiqueta.length + $scope.nuevoDiario.Tema.length) === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona al menos una etiqueta o un tema.";
        }
        
        if($scope.mensajeError.length > 0)
        {
            return false;
        }
        else
        {
            return true;
        }
    };
    

    //----------------Limpiar------------------
    $scope.LimpiarBuscar = function(buscar)
    {
        switch(buscar)
        {
            case 1:
                $scope.buscarFecha = "";
                document.getElementById("fechaFiltro").value = "";
                break;
            case 2:
                $scope.buscarEtiqueta = "";
                break;
            case 3:
                $scope.buscarTema = "";
                break;
            case 4:
                $scope.buscarEtiquetaFiltro = "";
                break;
            case 5:
                $scope.buscarTemaFiltro = "";
                break;

            default: 
                break;
        }
    };
    
    //-------------- Borrar Diario -----------------
    $scope.BorrarDiario= function(diario)
    {
        $scope.borrarDiario = diario;

        $scope.mensajeBorrar = "¿Estas seguro de eliminar el diario?";

        $("#borrarDiario").modal('toggle');
        
    };
    
    $scope.ConfirmarBorrarDiario = function()
    {
        BorrarDiario($http, CONFIG, $q, $scope.borrarDiario.DiarioId).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {                
                for(var i=0; i<$scope.detalle.length; i++)
                {
                    if($scope.detalle[i].DiarioId == $scope.borrarDiario.DiarioId)
                    {
                        $scope.detalle.splice(i,1);
                        
                        if($scope.detalle.length === 0)
                        {
                            $scope.detalle = [];
                            $scope.fechaDetalle = "";
                            
                            $scope.GetFechaDiario($scope.filtro);
                            //$scope.ValidarQuitarFecha($scope.borrarDiario.Fecha);
                        }
                        break;
                    }
                }
                
                //$scope.ValidarQuitarFecha($scope.borrarDiario.Fecha);
                
                $scope.mensaje = "Diario borrado.";
                $scope.EnviarAlerta('Vista');
                
                //$scope.QuitarFiltros();
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeActividad').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeActividad').modal('toggle');
        });
    };
    
    $scope.QuitarFiltros = function()
     {
         var quitar = true;

                 
        for(var k=0; k<$scope.borrarDiario.Etiqueta.length; k++)
        {
            quitar = true;
            
            for(var i=0; i<$scope.fecha.length; i++)
            {
                for(var j=0; j<$scope.fecha[i].Diario.length; j++)
                {
                    for(var m=0; m<$scope.fecha[i].Diario[j].Etiqueta.length; m++)
                    {
                        if($scope.borrarDiario.Etiqueta[k].EtiquetaId == $scope.fecha[i].Diario[j].Etiqueta[m].EtiquetaId)
                        {
                            quitar = false;
                            break;
                        }
                    }
                    if(!quitar)
                    {
                        break;
                    }
                }
            }
            
            if(quitar)
            {
                for(var i=0; i<$scope.etiquetaF.length; i++)
                {
                    if($scope.etiquetaF[i].EtiquetaId == $scope.borrarDiario.Etiqueta[k].EtiquetaId)
                    {
                        $scope.etiquetaF.splice(i,1);
                        break;
                    }
                }
            }
        }
        
        for(var k=0; k<$scope.borrarDiario.Tema.length; k++)
        {
            quitar = true;
            
            for(var i=0; i<$scope.fecha.length; i++)
            {
                for(var j=0; j<$scope.fecha[i].Diario.length; j++)
                {
                    for(var m=0; m<$scope.fecha[i].Diario[j].Tema.length; m++)
                    {
                        if($scope.borrarDiario.Tema[k].TemaActividadId == $scope.fecha[i].Diario[j].Tema[m].TemaActividadId)
                        {
                            quitar = false;
                            break;
                        }
                    }
                    if(!quitar)
                    {
                        break;
                    }
                }
            }
            
            if(quitar)
            {
                for(var i=0; i<$scope.temaF.length; i++)
                {
                    if($scope.temaF[i].TemaActividadId == $scope.borrarDiario.Tema[k].TemaActividadId)
                    {
                        $scope.temaF.splice(i,1);
                        break;
                    }
                }
            }
        }
    };

    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        if($scope.usuarioLogeado.Aplicacion != "Mi Diario")
        {
            $rootScope.IrPaginaPrincipal();
        }
        else
        {
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            $scope.GetFechaDiario( {etiqueta:[], tema:[]});
            $scope.GetTemaActividad();
            $scope.GetEtiqueta();
            $scope.GetCiudad();
            $scope.GetCarroselIntervalo();
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
    
    
    
    //-------- Agregar Ciudad ----------
    $scope.AbrirAgregarCiudad = function()
    {
        CIUDAD.AgregarCiudad(new Ciudad(), "Pais");
    };
    
    $scope.$on('TerminarCiudad',function()
    {   
        $scope.mensaje = "Ciudad Agregada";
        
        var city = CIUDAD.GetCiudad();
        city.DiarioDefecto = "0";
        
        $scope.ciudad.push(city);
        $scope.buscarCiudad = city;
        $scope.nuevoDiario.Ciudad = SetCiudad(city);

        $scope.EnviarAlerta('Modal');
           
    });
    
    
    //Imagenes de archivo
    function ImagenSeleccionada(evt) 
    {
        var files = evt.target.files;
        
        $scope.index = $scope.nuevoDiario.ImagenSrc.length;
        $scope.lastIndex = $scope.nuevoDiario.ImagenSrc.length + 1;
        $scope.srcSize = $scope.nuevoDiario.ImagenSrc.length + files.length;
        
        
        for (var i = 0, f; f = files[i]; i++) 
        {
            if (!f.type.match('image.*')) 
            {
                continue;
            }

            var reader = new FileReader();

            reader.onload = (function(theFile) 
            {
                return function(e) 
                {
                    $scope.nuevoDiario.ImagenSrc.push(theFile);
                    $scope.nuevoDiario.ImagenSrc[$scope.nuevoDiario.ImagenSrc.length-1].Src= (e.target.result);
                    $scope.nuevoDiario.ImagenSrc[$scope.nuevoDiario.ImagenSrc.length-1].Etiqueta = [];
                    $scope.nuevoDiario.ImagenSrc[$scope.nuevoDiario.ImagenSrc.length-1].Tema = [];

                    if( $scope.srcSize === $scope.nuevoDiario.ImagenSrc.length)
                    {
                        $scope.todasImg = "src";
                        $scope.SetTemaImagenDiario($scope.nuevoDiario.ImagenSrc[$scope.index], $scope.nuevoDiario.Tema);
                    }
                    
                    $scope.SetEtiquetaImagenDiario($scope.nuevoDiario.ImagenSrc[$scope.nuevoDiario.ImagenSrc.length-1], $scope.nuevoDiario.Etiqueta);
                    
                    $scope.$apply();
                };
                
                debugger;
            })(f);
            
            
            reader.readAsDataURL(f);
        }
         document.getElementById('cargarImagen').value = "";
    }
 
    document.getElementById('cargarImagen').addEventListener('change', ImagenSeleccionada, false);
    
    //---------------------- Fototeca ----------------------------
    $scope.AbrirFototeca = function()
    {
        $scope.imgFototeca = [];
        
        for(var k=0; k<$scope.fototeca.length; k++)
        {
            $scope.fototeca[k].Seleccionada = false;
        }
        
        if($scope.fototeca.length === 0)
        {
            $scope.GetGaleriaFotos();
        }
        
        $('#fototeca').modal('toggle');
    };
    
    $scope.AgregarQuitarImagenFototeca = function(imagen)
    {
        imagen.Seleccionada = !imagen.Seleccionada;
    };
    
    $scope.AgregarImagenes = function()
    {
        var agregada = false;
        var count = 0;
        for(var k=0; k< $scope.fototeca.length; k++)
        {
            if($scope.fototeca[k].Seleccionada)
            {
                agregada = false;
                for(var i=0; i<$scope.nuevoDiario.Imagen.length; i++)
                {
                    if($scope.nuevoDiario.Imagen[i].ImagenId == $scope.fototeca[k].ImagenId)
                    {
                        agregada = true;
                        break;
                    }
                }
                if(!agregada)
                {
                    if(count === 0)
                    {
                        count ++;
                        $scope.todasImg = "opt";
                        $scope.GetImagenEtiqueta($scope.fototeca[k]);
                        $scope.lastIndex = $scope.nuevoDiario.Imagen.length + 1;
                    }
                    
                    $scope.nuevoDiario.Imagen.push($scope.fototeca[k]);
                }
            }
        }
        
        $('#fototeca').modal('toggle');
    };
    
    $scope.SetEtiquetaImagenDiario = function(imagen, etiqueta)
    {
        for(var j=0; j<etiqueta.length; j++)
        {
            if(etiqueta[j].Visible)
            {
                var label = false;
                for(var i=0; i<imagen.Etiqueta.length; i++)
                {
                    if(etiqueta[j].EtiquetaId == imagen.Etiqueta[i].EtiquetaId)
                    {
                        label = true;
                        imagen.Etiqueta[i].Visible = "1"; 
                        break;
                    }
                }

                if(!label)
                {
                    var e = new Object();

                    e.EtiquetaId = etiqueta[j].EtiquetaId;
                    e.Nombre = etiqueta[j].Nombre;
                    e.Visible = "1";

                    imagen.Etiqueta.push(e);
                }
            }
        }
    };
    
    $scope.SetTemaImagenDiario = function(imagen, tema)
    {
        var agregado = false;
        for(var j=0; j<tema.length; j++)
        {
            var label = false;
            for(var i=0; i<imagen.Tema.length; i++)
            {
                if(tema[j].TemaActividadId == imagen.Tema[i].TemaActividadId)
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
                
                imagen.Tema.push(t);
                
                agregado = true;
            }
        }
        
        if(agregado)
        {
            IMAGEN.CambiarEtiquetasOcultas(imagen, $scope.etiqueta, $scope.tema);
        }
        else if($scope.todasImg == "opt" || $scope.todasImg == "tema" || $scope.todasImg == "src")
        {
            $scope.TerminarAgregarTemaImagen();
        }
    };
    
    //-------- ver Imagenes ----------
    $scope.VerImganes = function(Agregadas, Seleccionadas, Eliminadas, ImagenA, ImagenS, index, indexOrigen)
    {
        $scope.detalleImagenEliminadas = false;
        $scope.iLmt = 0;
        $scope.detalleImagen = [];
        
        if(Agregadas)
        {
            for(var k=0; k<ImagenA.length; k++)
            {
                if(ImagenA[k].Eliminada !== true)
                {
                    $scope.detalleImagen.push(ImagenA[k]);
                    
                    if(k==index)
                    {
                       $scope.iImg = $scope.detalleImagen.length-1;
                    }
                }
                
            }
            
            $scope.iLmt = $scope.detalleImagen.length-1;
        }
        
        if(Seleccionadas)
        {
            if(indexOrigen === 0)
            {
                  $scope.iImg = index + $scope.iLmt+1;  
            }
            
            for(var k=0; k<ImagenS.length; k++)
            {
                $scope.detalleImagen.push(ImagenS[k]);
            }
        }
        
        if(Eliminadas)
        {
            $scope.detalleImagenEliminadas = true;
            
            for(var k=0; k<ImagenA.length; k++)
            {
                if(ImagenA[k].Eliminada == true)
                {
                    $scope.detalleImagen.push(ImagenA[k]);
                    
                    if(k==index)
                    {
                       $scope.iImg = $scope.detalleImagen.length-1;
                    }
                }
                
            }
            
            $scope.iLmt = $scope.detalleImagen.length-1;
        }
        
        $('#verImagen').modal('toggle');
    };
    
    $('#verImagen').keydown(function(e)
    {
        switch(e.which) {
            case 37:
              $scope.changeImageViewed(-1);
              $scope.$apply();
              break;
            /*
            case 38: console.log('up');
            break;
            */
            case 39:
              $scope.changeImageViewed(1);
              $scope.$apply();
              break;
            /*
            case 40: console.log('down');
            break;
            */
            default: return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
    
    $scope.changeImageViewed = function(val)
    {
        $scope.iImg += val; 
        if($scope.iImg < 0)
        {
            $scope.iImg = $scope.detalleImagen.length -1;
        }
        else if($scope.iImg >= $scope.detalleImagen.length)
        {
            $scope.iImg = 0;
        }
    };
    
    //--------------- Etiquetas de Imagenes -----------------------------
    $scope.EtiquetarImagen = function(imagen, tipo)
    {
        $scope.etiquetaImagen = imagen;
        IMAGEN.EtiquetaImagen(imagen, $scope.etiqueta, $scope.tema, tipo);
    };
    
    $scope.$on('TerminarEtiquetaImagen',function()
    {   
        $scope.mensaje = "Imagen Etiquetada";
        $scope.EnviarAlerta('Modal');
        
        $scope.SetEtiquetaImagen(IMAGEN.GetImagen());
    });
    
    $scope.$on('TerminarEtiquetaImagenOcultas',function()
    {   
        
        if($scope.todasImg == "opt" || $scope.todasImg == "tema" || $scope.todasImg == "src")
        {
            $scope.TerminarAgregarTemaImagen();
        }
    });
    
    $scope.TerminarAgregarTemaImagen = function()
    {
        var opt = $scope.todasImg;
        $scope.todasImg = "";
        
        if(opt === "tema")
        {   
            for(var k=1; k<$scope.nuevoDiario.Imagen.length; k++)
            {
                $scope.SetTemaImagenDiario($scope.nuevoDiario.Imagen[k], $scope.temaAgregar);
            }
            
            for(var i=1; i<$scope.nuevoDiario.ImagenSrc.length; i++)
            {
                $scope.SetTemaImagenDiario($scope.nuevoDiario.ImagenSrc[i], $scope.temaAgregar);
            }
        }
        else if(opt == "opt")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevoDiario.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta($scope.nuevoDiario.Imagen[k]);
            }
        }
        else if(opt == "src")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevoDiario.ImagenSrc.length; k++)
            {
                $scope.SetTemaImagenDiario($scope.nuevoDiario.ImagenSrc[k], $scope.nuevoDiario.Tema);
            }
        }
    };

    $scope.SetEtiquetaImagen = function(imagen)
    {
        $scope.etiquetaImagen.Etiqueta  = [];
        $scope.etiquetaImagen.Tema = []; 
        
        
        for(var k=0; k<imagen.Etiqueta.length; k++)
        {
            var etiqueta = new Object();
            etiqueta.Nombre = imagen.Etiqueta[k].Nombre;
            etiqueta.EtiquetaId = imagen.Etiqueta[k].EtiquetaId;
            etiqueta.Visible = imagen.Etiqueta[k].Visible;
            
            $scope.etiquetaImagen.Etiqueta.push(etiqueta);
        }
        
        for(var k=0; k<imagen.Tema.length; k++)
        {
            var tema = new Object();
        
            tema.TemaActividadId = imagen.Tema[k].TemaActividadId;
            tema.Tema = imagen.Tema[k].Tema;
            
            $scope.etiquetaImagen.Tema.push(tema);
        }
    }
    
    $scope.ContarEtiquetasVisibles = function(etiqueta)
    {
        if(etiqueta != undefined)
        {
            var con = 0;
        
            for(var k=0; k<etiqueta.length; k++)
            {
                if(etiqueta[k].Visible == "1")
                {
                    con++;
                }
            }

            return con;
        }
    };
    
    //destecta cuando se agrego una etiqueta
    $scope.$on('EtiquetaSet',function(evento, etiqueta, modal)
    {
        if(modal == "Diario")
        {
            $scope.SetEtiquetaTodasImagenes(etiqueta);
        }
    });
    
    $scope.SetEtiquetaTodasImagenes = function(etiqueta)
    {
        var e = [];
        e[0] = etiqueta;

        for(var i=0; i<$scope.nuevoDiario.Imagen.length; i++)
        {
            $scope.SetEtiquetaImagenDiario($scope.nuevoDiario.Imagen[i], e);
        }
        
        for(var i=0; i<$scope.nuevoDiario.ImagenSrc.length; i++)
        {
            $scope.SetEtiquetaImagenDiario($scope.nuevoDiario.ImagenSrc[i], e);
        }
    };
    
    $scope.$on('TemaSet',function(evento, tema, modal)
    {
        if(modal == "Diario")
        {
            $scope.todasImg = "tema";
            $scope.SetTemaTodasImagenes(tema);
        }
    });
    
    $scope.SetTemaTodasImagenes = function(tema)
    {
        var e = [];
        e[0] = tema;
        
        $scope.temaAgregar = e;
        
        if($scope.nuevoDiario.Imagen.length > 0)
        {
            $scope.SetTemaImagenDiario($scope.nuevoDiario.Imagen[0], e);
        }
        else if($scope.nuevoDiario.ImagenSrc.length > 0)
        {
            $scope.SetTemaImagenDiario($scope.nuevoDiario.ImagenSrc[0], e);
        }
    };
    
    $scope.$on('QuitarEtiqueta',function(nota, etiqueta, modal)
    {
        if(modal == "Diario")
        {
            for(var i=0; i<$scope.nuevoDiario.Imagen.length; i++)
            {
                for(var j=0; j<$scope.nuevoDiario.Imagen[i].Etiqueta.length; j++)
                {
                    if($scope.nuevoDiario.Imagen[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                    {
                        $scope.nuevoDiario.Imagen[i].Etiqueta.splice(j,1);
                        break;
                    }
                }
            }

            for(var i=0; i<$scope.nuevoDiario.ImagenSrc.length; i++)
            {
                for(var j=0; j<$scope.nuevoDiario.ImagenSrc[i].Etiqueta.length; j++)
                {
                    if($scope.nuevoDiario.ImagenSrc[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                    {
                        $scope.nuevoDiario.ImagenSrc[i].Etiqueta.splice(j,1);
                        break;
                    }
                }
            }
        }
    });
    
    $scope.$on('QuitarTema',function(evento, tema, modal)
    {
        if(modal == "Diario")
        {
            for(var i=0; i<$scope.nuevoDiario.Imagen.length; i++)
            {
                for(var j=0; j<$scope.nuevoDiario.Imagen[i].Tema.length; j++)
                {
                    if($scope.nuevoDiario.Imagen[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                    {
                        $scope.nuevoDiario.Imagen[i].Tema.splice(j,1);
                        IMAGEN.CambiarEtiquetasOcultas($scope.nuevoDiario.Imagen[i], $scope.etiqueta, $scope.tema);
                        break;
                    }
                }
            }

            for(var i=0; i<$scope.nuevoDiario.ImagenSrc.length; i++)
            {
                for(var j=0; j<$scope.nuevoDiario.ImagenSrc[i].Tema.length; j++)
                {
                    if($scope.nuevoDiario.ImagenSrc[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                    {
                        $scope.nuevoDiario.ImagenSrc[i].Tema.splice(j,1);
                        IMAGEN.CambiarEtiquetasOcultas($scope.nuevoDiario.ImagenSrc[i], $scope.etiqueta, $scope.tema);
                        break;
                    }
                }
            }
        }
    });
    
    
    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoDiario").alert();

            $("#alertaExitosoDiario").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoDiario").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoDiario").alert();

            $("#alertaEditarExitosoDiario").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoDiario").fadeOut();
            }, 2000);
        }
    };
    
    //-------- Filtro Ciudad -------------
    $scope.FiltrarBuscarCiudad = function(buscarCiudad)
    {
        
        var ciudad = [];
        
        
        if(buscarCiudad !== undefined)
        {
            for(var k=0; k<$scope.ciudad.length; k++)
            {
                //pais
                var index = $scope.ciudad[k].Pais.toLowerCase().indexOf(buscarCiudad.toLowerCase());

                if(index >= 0)
                {
                    if(index === 0)
                    {
                        ciudad.push($scope.ciudad[k]);
                        continue;
                    }
                    else
                    {
                        if($scope.ciudad[k].Pais[index-1] == " ")
                        {
                            ciudad.push($scope.ciudad[k]);
                            continue;
                        }
                    }
                }
                
                //Estado
                index = $scope.ciudad[k].Estado.toLowerCase().indexOf(buscarCiudad.toLowerCase());

                if(index >= 0)
                {
                    if(index === 0)
                    {
                        ciudad.push($scope.ciudad[k]);
                        continue;
                    }
                    else
                    {
                        if($scope.ciudad[k].Estado[index-1] == " ")
                        {
                            ciudad.push($scope.ciudad[k]);
                            continue;
                        }
                    }
                }
                
                //Ciudad
                index = $scope.ciudad[k].Ciudad.toLowerCase().indexOf(buscarCiudad.toLowerCase());

                if(index >= 0)
                {
                    if(index === 0)
                    {
                        ciudad.push($scope.ciudad[k]);
                        continue;
                    }
                    else
                    {
                        if($scope.ciudad[k].Ciudad[index-1] == " ")
                        {
                            ciudad.push($scope.ciudad[k]);
                            continue;
                        }
                    }
                }
                
                
            }
        }
        
        return ciudad;
    };
    
    $scope.EtiquetaEquivalenteLista = function(etiqueta)              
    {
        $scope.ee = [];
        GetEtiquetaEquivalente($http, $q, CONFIG, etiqueta.EtiquetaId).then(function(data)
        {
            $scope.ee = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    autosize($('textarea'));
    
    //----------- Archivos --------
    $(document).on('hide.bs.modal','#EtiquetaFile', function () 
    {
        $scope.ActivarDesactivarTema($scope.nuevoDiario.Tema);
        $scope.ActivarDesactivarEtiqueta($scope.nuevoDiario.Etiqueta);
    });
    
});
