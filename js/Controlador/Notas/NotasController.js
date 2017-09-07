app.controller("NotasController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, ETIQUETA, EEQUIVALENTE)
{   
    $scope.titulo = "Notas";
    
    $scope.nota = [];
    $scope.fecha = [];
    $scope.etiquetaNota = [];
    $scope.temaNota = [];
    $scope.mensajeError = [];
    
    $scope.tema = [];
    $scope.etiqueta = [];
    
    $scope.etiquetaF = [];
    $scope.temaF = [];
    
    $scope.etiquetaB = [];
    $scope.temaB = [];
    
    $scope.detalle = new Nota();
    
    //vista
    $scope.detalle = [];
    $scope.agrupar = "Titulo";
    $scope.verConcepto = {etiqueta:true, tema:true};
    
    $scope.buscarTituloBarra = "";
    $scope.buscarConceptoBarra = "";
    
    $scope.tabModal = "Nota";
    $scope.datosNota = false;
    $scope.showEliminada = false;
    
    //filtro
    $scope.filtro = {tema:[], etiqueta:[], fecha:"", fechaFormato: "", usuarioId: ""};
    
    $scope.buscarTemaFiltro = "";
    $scope.buscarEtiquetaFiltro = "";
    
    $scope.verFiltro = true;
    
    $scope.limite = 10;
    $scope.limiteDesde = 0;
    $scope.fototeca = [];
    $scope.cargaAllImage = true;
    $scope.imgFototeca = [];
    $scope.Login = false;
    
    EditarConcepto = false;
    
    
    /*------------------ Catálogos -----------------------------*/
    $scope.GetNotas = function()              
    {
        GetNotas($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {      
            $scope.nota = data;
            
            $scope.GetEtiquetaPorNota();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetEtiquetaPorNota = function()              
    {
        GetEtiquetaPorNota($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.etiquetaF = data[1].Etiqueta;
                $scope.etiquetaB = data[1].Etiqueta;
            }
            else
            {
                $scope.etiquetaF = [];
                $scope.etiquetaB = [];
            }
            
            $scope.GetTemaPorNota();
        
        }).catch(function(error)
        {
            alert(data[0].Estatus);
        });
    };
    
    $scope.GetTemaPorNota = function()              
    {
        GetTemaPorNota($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.temaF = data[1].Tema;
                $scope.temaB = data[1].Tema;
            }
            else
            {
                $scope.temaF = [];
                $scope.temaB = [];
            }
            
            //$scope.SetNotaDatos();
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*$scope.SetNotaDatos = function()
    {   
        var sql;
        var sqlBase;
        
    
        sqlBase = "SELECT * FROM ? WHERE NotaId = '";
    
        for(var i=0; i<$scope.nota.length; i++)
        {
            sql =  sqlBase + $scope.nota[i].NotaId + "'";
            //tema
            $scope.nota[i].Tema = alasql(sql, [$scope.temaNota]);

            //etiqueta
            $scope.nota[i].Etiqueta = alasql(sql, [$scope.etiquetaNota]);
        }
        
        
        $scope.SetDiarioFiltros();
    };*/
    
    /*$scope.SetDiarioFiltros = function()
    {           
        $scope.temaF = [];
        $scope.etiquetaF = [];
        
        
        var sql = "SELECT DISTINCT EtiquetaId, Nombre  FROM ? ";
        $scope.etiquetaF = alasql(sql, [$scope.etiquetaNota]);
        
        sql = "SELECT DISTINCT TemaActividadId, Tema  FROM ? ";
        $scope.temaF = alasql(sql, [$scope.temaNota]);
        
    };*/
    
    /*------- Otros catálogos ---------------*/
    $scope.GetTemaActividad = function()              
    {
        GetTemaActividad($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {
            $scope.tema = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetEtiqueta = function()              
    {
        GetEtiqueta($http, $q, CONFIG, $scope.usuarioLogeado.UsuarioId).then(function(data)
        {
            $scope.etiqueta = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    //-------- Notas de detalles --------
    $scope.GetNotasPorId = function(id, tipo)
    {
        var datos = {Tipo:tipo, Id:id};
        
        GetNotasPorId($http, $q, CONFIG, datos).then(function(data)
        {
            for(var k=0; k<data.length; k++)
            {
                data[k].NotasHTML = $sce.trustAsHtml(data[k].NotasHTML);
                data[k].ObservacionHTML = $sce.trustAsHtml(data[k].ObservacionHTML);
            }
             
            $scope.detalle = data;
        
        }).catch(function(error)
        {
            alert(error);
        });
        
    };
    
    $scope.GetNotasFiltro = function(id, tipo)
    {   
        
        $scope.filtro.usuarioId = $rootScope.UsuarioId;
        
        GetNotasFiltro($http, $q, CONFIG, $scope.filtro).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.nota = data[1].Notas;
                $scope.etiquetaB = data[2].Etiquetas;
                $scope.temaB = data[3].Temas;
            }
            else
            {
                $scope.nota = [];
                $scope.etiquetaB = [];
                $scope.temaB = []; 
            }
        
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    /*$scope.GetGaleriaFotos = function(id, tipo)
    {
        if($scope.cargaAllImage)
        {
            var datos = [];
            datos[0] = $scope.limiteDesde;
            datos[1] = $scope.limite;
            datos[2] = $rootScope.UsuarioId;


            GetGaleriaFotos($http, $q, CONFIG, datos).then(function(data)
            {
                if(data.length > 0)
                {
                    for(var k=0; k<data.length; k++)
                    {
                        data[k].Seleccionada = false;
                        $scope.fototeca.push(data[k]);
                    }
                    //
                    $scope.limiteDesde += data.length;
                    
                    if(data.length < $scope.limite)
                    {
                       $scope.cargaAllImage = false;
                    }
                }
                else
                {
                    $scope.cargaAllImage = false;
                }

            }).catch(function(error)
            {
                alert(error);
            });
        }
        
    };*/
    
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
    
    //-------------------------------------Vista--------------------------------
    $scope.CambiarAgrupar = function(grupo)
    {
        if(grupo != $scope.agrupar)
        {
           $scope.agrupar = grupo;
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
    
    //-----------------------------------Detalles--------------------------------
    $scope.VerDetalles = function(dato, id ,tipo, entrar)
    {
        if(dato != $scope.datoDetalle || entrar === true)
        {
            $scope.datoDetalle = dato;
            $scope.tipoDato = tipo;
            $scope.idDetalle = id;
            
            $scope.GetNotasPorId(id, tipo);
        }
    };
    
    $scope.GetClaseDiario = function(dato)
    {
        if($scope.datoDetalle == dato)
        {
            return "active";
        }
        else
        {
            return "";
        }
    };
    
    $scope.VerDetallesNota = function(nota)
    {
        $scope.detalleNota = nota;
        $scope.detalleNota.EtiquetaVisible = $scope.GetEtiquetaVisible(nota.Etiqueta);
        
        $('#detalleNota').modal('toggle');
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
    
    /*fototeca*/
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
        
        if(imagen.Seleccionada)
        {
            $scope.imgFototeca.push(imagen);
        }
        else
        {
            for(var k=0; k< $scope.imgFototeca.length; k++)
            {
                if(imagen.ImagenId == $scope.imgFototeca[k].ImagenId)
                {
                    $scope.imgFototeca.splice(k,1);
                    break;
                }
            }
        }
    };
    
    $scope.AgregarImagenes = function()
    {
        var agregada = false;
        for(var k=0; k< $scope.imgFototeca.length; k++)
        {
            agregada = false;
            for(var i=0; i<$scope.nuevaNota.Imagen.length; i++)
            {
                if($scope.nuevaNota.Imagen[i].ImagenId == $scope.imgFototeca[k].ImagenId)
                {
                    agregada = true;
                    break;
                }
            }
            if(!agregada)
            {
                $scope.nuevaNota.Imagen.push($scope.imgFototeca[k]);
            }
        }
        
        $('#fototeca').modal('toggle');
    };
    
    //----------------------- Buscar Barra --------------------------
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
    
    $scope.BuscarTemaBarra = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConceptoBarra);
    };
    
    $scope.BuscarTemaFiltro = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarTemaFiltro);
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
    
    $scope.BuscarEtiquetaBarra = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConceptoBarra);
    };
    
    $scope.BuscarEtiquetaFiltro = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarEtiquetaFiltro);
    };
    
    $scope.FiltrarBuscarTitulo = function(titulo, buscar)
    {
        if(buscar !== undefined)
        {
            if(buscar.length > 0)
            {
                var index = titulo.toLowerCase().indexOf(buscar.toLowerCase());


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
                        if(titulo[index-1] == " ")
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
        else
        {
            return true;
        }
        
        return true;
    };
    
    $scope.BuscarTituloBarra = function(nota)
    {
        return $scope.FiltrarBuscarTitulo(nota.Titulo, $scope.buscarTituloBarra);
    };
    
    //-- fecha filtro
    $('#fechaFiltro').bootstrapMaterialDatePicker(
    { 
        weekStart : 0, 
        time: false,
        format: "YYYY-MM-DD",
        maxDate: new Date()
    });
    
    $scope.AbrirCalendario = function()
    {        
        document.getElementById("fechaFiltro").focus();
    };
    
    $scope.AbrirCalendarioFecha = function()
    {    
        document.getElementById("fechaNota").focus();
    };
    
    
    $scope.LimpiarFiltroFecha = function()
    {
        $scope.filtro.fecha = "";
        $scope.filtro.fechaFormato = "";
        
    };
    
    $scope.CambiarFechaFiltro = function(element) 
    {
        $scope.$apply(function($scope) 
        {   
            $scope.filtro.fecha = element.value;
            $scope.filtro.fechaFormato = TransformarFecha(element.value);
        });
    };
    
    //---------------------------- Filtros ----------------------------------------
    $scope.FiltrarNota = function(nota)
    {        
        var cumple = false;
        
        if($scope.filtro.etiqueta.length > 0)
        {
            for(var i=0; i<$scope.filtro.etiqueta.length; i++)
            {
                cumple = false;
                for(var j=0; j<nota.Etiqueta.length; j++)
                {
                    if($scope.filtro.etiqueta[i] == nota.Etiqueta[j].EtiquetaId)
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
                    for(var j=0; j<nota.Tema.length; j++)
                    {
                        if($scope.filtro.tema[i] == nota.Tema[j].TemaActividadId)
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
        
        
        cumple = false;
        
        if($scope.filtro.fecha.length > 0)
        {
            if($scope.filtro.fecha == nota.Fecha)
            {
                cumple = true;
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
    
    $scope.SetFiltroTema = function(tema)
    {
        var sql = "SELECT * FROM ? WHERE Filtro = true";
        
        $scope.temaFiltrado = alasql(sql, [$scope.temaF]);
        
        $scope.buscarTemaFiltro = "";
        
        for(var k=0; k<$scope.filtro.tema.length; k++)
        {
            if(tema == $scope.filtro.tema[k])
            {
                $scope.filtro.tema.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.tema.push(tema);
    };
    
     $scope.SetFiltroEtiqueta = function(etiqueta)
    {
        var sql = "SELECT * FROM ? WHERE Filtro = true";
        
        $scope.EtiquetaFiltrada = alasql(sql, [$scope.etiquetaF]);
        
        $scope.buscarEtiquetaFiltro = "";
        
        for(var k=0; k<$scope.filtro.etiqueta.length; k++)
        {
            if(etiqueta == $scope.filtro.etiqueta[k])
            {
                $scope.filtro.etiqueta.splice(k,1);
                return;
            }
        }
        
        $scope.filtro.etiqueta.push(etiqueta);
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
    
    
    $scope.GetDatosFiltro = function()
    {
        $scope.LimpiarBuscarFiltro();
        $scope.GetNotasFiltro();
    };
    
    $scope.LimpiarFiltro = function()
    {
        $scope.filtro = {tema:[], etiqueta:[], fecha:"", fechaFormato: ""};
        
        for(var k=0; k<$scope.etiquetaF.length; k++)
        {
            $scope.etiquetaF[k].Filtro = false;
        }
        
        for(var k=0; k<$scope.temaF.length; k++)
        {
            $scope.temaF[k].Filtro = false;
        }
        
        $scope.verFiltro = true;
        
        $scope.buscarEtiquetaFiltro = "";
        $scope.buscarTemaFiltro = "";
        
        $scope.GetNotasFiltro();
    };
    
    $scope.LimpiarBuscarFiltro = function()
    {
        $scope.buscarEtiquetaFiltro = "";
        $scope.buscarTemaFiltro = "";
    };
    
    
    //--------------------------- Agregar - Editar ------------------------
    $scope.AbrirNota = function(operacion, objeto)
    {
        $scope.operacion = operacion;
        $scope.tabModal = "Nota";
        
        $scope.terminarHabilitado = false;
        
        if(operacion == "Agregar")
        {
            $scope.nuevaNota = new Nota();
            $scope.ActivarDesactivarTema([]);
            $scope.ActivarDesactivarEtiqueta([]);
            $scope.IniciarNota();
            $scope.notaInicial =  jQuery.extend({}, $scope.nuevaNota);
            
        }
        else if(operacion == "Editar")
        {
            $scope.nuevaNota = SetNota(objeto);   
            $scope.notaInicial = SetNota(objeto);   
            
            $scope.ActivarDesactivarTema($scope.nuevaNota.Tema);
            $scope.ActivarDesactivarEtiqueta($scope.nuevaNota.Etiqueta);
            
            document.getElementById("fechaNota").value = $scope.nuevaNota.Fecha;
        }
        
        $('#modalNota').modal('toggle');
    };
    
    $scope.IniciarNota = function(fecha)
    {
        $scope.nuevaNota.Fecha = GetDate();
        $scope.nuevaNota.FechaFormato = TransformarFecha($scope.nuevaNota.Fecha);


        /*if($scope.tipoDato == "Tema")
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].TemaActividadId == $scope.idDetalle)
                {
                    $scope.nuevaNota.Tema.push($scope.tema[k]);
                    $scope.tema[k].show = false;
                    break;
                }
            }
        }
        
        if($scope.tipoDato == "Etiqueta")
        {
            for(var k=0; k<$scope.etiqueta.length; k++)
            {
                if($scope.etiqueta[k].EtiquetaId == $scope.idDetalle)
                {
                    $scope.nuevaNota.Etiqueta.push($scope.etiqueta[k]);
                    $scope.etiqueta[k].show = false;
                    break;
                }
            }
        }*/

        document.getElementById("fechaNota").value = $scope.nuevaNota.Fecha;
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
    
    
    //------ Fecha ---
    $('#fechaNota').datetimepicker(
    {
        locale: 'es',
        format: 'YYYY-MM-DD',
        maxDate: new Date(),
    });
    
    $scope.CambiarFechaNota = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            $scope.nuevaNota.Fecha = element.value;
            $scope.nuevaNota.FechaFormato = TransformarFecha(element.value);
        });
    };
    
    $scope.TerminarDeshabilitado = function()
    {
        if($scope.terminarHabilitado === true)
        {
            return false;
        }
        else
        {
            if(JSON.stringify($scope.notaInicial) === JSON.stringify($scope.nuevaNota))
            {
                return true;
            }
            else
            {
                $scope.terminarHabilitado = true;
                return false;
            }
        }
        
    };
    
    //----------- Cerrar
    $scope.CerrarNota = function()
    {
        if(JSON.stringify($scope.notaInicial) === JSON.stringify($scope.nuevaNota))
        {
            $('#modalNota').modal('toggle');
        }
        else
        {
            $('#cerrarNota').modal('toggle');
        }
    };
    
    $scope.ConfirmarCerrarNota = function()
    {
        $('#modalNota').modal('toggle');
        $scope.mensajeError = [];
        $scope.LimpiarInterfaz();
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.buscarConcepto = "";
        $scope.etiquetaSugerida = [];
        //$scope.buscarTema = "";
    };
    
    //----Tema-----
    /*$('#nuevoTema').keydown(function(e)
    {
        switch(e.which) {
            case 13:
                $scope.AgregarNuevoTema();
              break;

            default:
                return;
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });*/
    
    $scope.AgregarTema = function(tema)
    {
        $scope.nuevaNota.Tema.push(tema);
        
        //$scope.SepararEtiqueta(tema.Tema);
        
        tema.show = false;
        $scope.buscarConcepto = "";
    };
    
    $scope.AgregarNuevoTema = function(nuevo)
    {
        if(nuevo.length > 0)
        {
            if(!$scope.ValidarTemaAgregado(nuevo))
            {
                return;    
            }
            else
            {
                var tema = new TemaActividad();
                tema.Tema = nuevo;
                tema.TemaActividadId = "-1";
                $scope.buscarConcepto = "";
                
                //$scope.SepararEtiqueta(nuevo);
                
                $scope.nuevaNota.Tema.push(tema);
            }
        }
    };
    
    /*$scope.AgregarTemaBlur = function()
    {
        if($scope.buscarConcepto !== undefined)
        {
            if($scope.buscarConcepto.length > 0)
            {
                $scope.AgregarNuevoTema();
            }
        }
    };*/
    
    $scope.ValidarTemaAgregado = function(tema)
    {
        if($rootScope.erTema.test(tema))
        {
            for(var k=0; k<$scope.tema.length; k++)
            {
                if($scope.tema[k].Tema.toLowerCase() == tema.toLowerCase())
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
                        $scope.buscarConcepto = "";
                        //$('#mensajeNota').modal('toggle');
                        return false;
                    }
                }
            }

            for(var k=0; k<$scope.nuevaNota.Tema.length; k++)
            {
                if($scope.nuevaNota.Tema[k].Tema.toLowerCase() == tema.toLowerCase())
                {
                    $scope.mensajeError = [];
                    //$scope.mensajeError[$scope.mensajeError.length] = "*Este tema ya fue agregado.";
                    $scope.buscarConcepto = "";
                    //$('#mensajeNota').modal('toggle');
                    return false;
                }
            }
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un tema válido.";
            $scope.buscarConcepto = "";
            $('#mensajeNota').modal('toggle');
            
            return false;
        }
        
        
        return true;
    };
    
    $scope.QuitarTema = function(tema)
    {
        
        for(var k=0; k<$scope.nuevaNota.Tema.length; k++)
        {
            if(tema == $scope.nuevaNota.Tema[k])
            {
                $scope.nuevaNota.Tema.splice(k,1);
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
                    return;
                }
            }
        }
    };
    
    $scope.EditarTema = function(tema)
    {
        EditarConcepto = true;
        if(tema.TemaActividadId == "-1")
        {
            $scope.buscarConcepto = tema.Tema;
            
            for(var k=0; k<$scope.nuevaNota.Tema.length; k++)
            {
                if($scope.nuevaNota.Tema[k].Tema == tema.Tema)
                {
                    $scope.nuevaNota.Tema.splice(k,1);
                    break;
                }
            }
            
            $("#nuevoConcepto").focus();
        }
    };
    
    $scope.BuscarTema = function(tema)
    {
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConcepto);
    };
    
    //etiqueta
    $('#nuevoConcepto').keydown(function(e)
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
        $scope.nuevaNota.Etiqueta.push(etiqueta);
        
        etiqueta.show = false;
        $scope.buscarConcepto = "";
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
            $scope.buscarConcepto = "";
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta válida.";
            //$scope.buscarConcepto = "";
            $('#mensajeNota').modal('toggle');
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

                $scope.buscarConcepto = "";

                $scope.nuevaNota.Etiqueta.push(data[2].Etiqueta);

                $scope.etiqueta.push(data[2].Etiqueta);
                $scope.etiqueta[$scope.etiqueta.length-1].show = false;
                
                
                $scope.mensaje = "Etiqueta Agregada.";
                $scope.EnviarAlerta('Modal');
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
        var etiqueta = new Etiqueta();
        etiqueta.Nombre = nueva.charAt(0).toUpperCase() + nueva.substr(1).toLowerCase();
        etiqueta.EtiquetaId = "-1";
        etiqueta.Visible = $scope.verEtiqueta;

        $scope.nuevaNota.Etiqueta.push(etiqueta);
    };
    
    /*document.getElementById('modalNota').onclick = function(e) 
    {
        if(!EditarConcepto)
        {
            if(!($(e.target).parents("#AgregarConcepto").size()))
            { 
                if($scope.buscarConcepto !== undefined)
                {
                    if($scope.buscarConcepto.length > 0)
                    {
                        $scope.EsTemaEtiqueta($scope.buscarConcepto);
                        //$scope.$apply();
                    }
                }
            }
        }
        else
        {
            EditarConcepto = false;
        }
        
    };*/
    
    
    /*$scope.EsTemaEtiqueta = function(texto)
    {
        if($rootScope.erEtiqueta.test(texto))
        {
            $scope.AgregarNuevaEtiqueta();
        }
        else if($rootScope.erTema.test(texto))
        {
           $scope.CrearConcepto();
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una etiqueta o un tema válido.";
            $('#mensajeNota').modal('toggle');
            $scope.$apply();
        }
    };*/
    
    $scope.ValidarEtiquetaAgregado = function(concepto)
    {
        if($rootScope.erEtiqueta.test(concepto))
        {
            for(var k=0; k<$scope.nuevaNota.Etiqueta.length; k++)
            {
                if($scope.nuevaNota.Etiqueta[k].Nombre.toLowerCase() == concepto.toLowerCase())
                {
                    if($scope.verEtiqueta)
                    {
                        $scope.nuevaNota.Etiqueta[k].Visible = true;
                    }
                    
                    $scope.mensajeError = [];
                    //$scope.mensajeError[$scope.mensajeError.length] = "*Esta etiqueta ya fue agregada.";
                    $scope.buscarConcepto = "";
                    //$('#mensajeNota').modal('toggle');
                    return false;
                }
            }
            
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
    
    $scope.QuitarEtiqueta = function(etiqueta)
    {
        
        for(var k=0; k<$scope.nuevaNota.Etiqueta.length; k++)
        {
            if(etiqueta == $scope.nuevaNota.Etiqueta[k])
            {
                $scope.nuevaNota.Etiqueta.splice(k,1);
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
                    return;
                }
            }
        }
    };
    
    $scope.EditarEtiqueta = function(etiqueta)
    {
        EditarConcepto = true;
        if(etiqueta.EtiquetaId == "-1")
        {
            $scope.buscarConcepto = etiqueta.Nombre;
            
            for(var k=0; k<$scope.nuevaNota.Etiqueta.length; k++)
            {
                if($scope.nuevaNota.Etiqueta[k].Nombre == etiqueta.Nombre)
                {
                    $scope.nuevaNota.Etiqueta.splice(k,1);
                    break;
                }
            }
            
            $("#nuevoConcepto").focus();
        }
    };
    
    $scope.BuscarEtiqueta = function(etiqueta)
    {
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConcepto);
    };
    
    $scope.CrearEtiquetaSugerida = function()
    {
        $scope.etiquetaSugerida = $scope.nuevaNota.Titulo.split(" ");
        $scope.temaSugerido = [];
        
        for(var k=0; k<$scope.etiquetaSugerida.length; k++)
        {
            if($scope.etiquetaSugerida[k] === "")
            {
                $scope.etiquetaSugerida.splice(k,1);
                k--;
                continue;
            }
            
            for(var i=0; i<$scope.nuevaNota.Etiqueta.length; i++)
            {
                if($scope.nuevaNota.Etiqueta[i].Nombre.toLowerCase() == $scope.etiquetaSugerida[k].toLowerCase())
                {
                    if($scope.nuevaNota.Etiqueta[i].Visible)
                    {
                        $scope.etiquetaSugerida.splice(k,1);
                        k--;
                    }
                    
                    break;
                }
            }
        }
        
        /*if($rootScope.erTema.test($scope.nuevaNota.Titulo))
        {
            $scope.temaSugerido[0] = $scope.nuevaNota.Titulo;
        }*/
    };
        
    $scope.AgregarEtiquetaSugerida = function(etiqueta, k)
    {
        if($rootScope.erEtiqueta.test(etiqueta))
        {
            $scope.verEtiqueta = true;
            $scope.AgregarNuevaEtiqueta(etiqueta);
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[0] = "*Etiqueta no válida.";
        }
        
        $scope.etiquetaSugerida.splice(k,1);
    };
    
    $scope.AgregarTodaEtiquetaSugerida = function()
    {
        $scope.verEtiqueta = true;
        
        for(var k=0; k<$scope.etiquetaSugerida.length; k++)
        {
            if($rootScope.erEtiqueta.test($scope.etiquetaSugerida[k]))
            {
                $scope.AgregarNuevaEtiqueta($scope.etiquetaSugerida[k]);
            }
        }
        
        $scope.etiquetaSugerida = [];
    };
    
     $scope.AgregarTemaSugerido = function(tema, k)
    {

        $scope.AgregarNuevoTema(tema);

        $scope.temaSugerido.splice(k,1);
    };
    
    //------------------------------------- terminar --------------------------------------
    $scope.TerminarNota = function()
    {
        if(!$scope.ValidarDatos())
        {
            $('#mensajeNota').modal('toggle');
            return;
        }
        else
        {
            $scope.QuitarEtiquetaNoVisible();
            $scope.AgregarEtiquetaOcultar();
            
            $scope.nuevaNota.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            if($scope.operacion == "Agregar")
            {
                $scope.AgregarNota();
            }
            if($scope.operacion == "Editar")
            {
                $scope.EditarNota();
            }
        }
        
        if($scope.nuevaNota.ImagenSrc.length > 0)
        {
            $scope.cargaAllImage = true;
        }
    };
    
    $scope.QuitarEtiquetaNoVisible = function()
    {
        for(var k=0; k<$scope.nuevaNota.Etiqueta.length; k++)
        {
            if(!$scope.nuevaNota.Etiqueta[k].Visible)
            {
                $scope.nuevaNota.Etiqueta.splice(k,1);
                k--;
            }
        }
    };
    
    $scope.AgregarEtiquetaOcultar = function()
    {
        for(var k=0; k<$scope.nuevaNota.Tema.length; k++)
        {
            $scope.SepararEtiqueta($scope.nuevaNota.Tema[k].Tema);
        }
    };
    
    $scope.AgregarNota = function()    
    {
        AgregarNota($http, CONFIG, $q, $scope.nuevaNota).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                
                $scope.mensaje = "Nota agregada.";
                $scope.EnviarAlerta('Vista');
                
                $('#modalNota').modal('toggle');
                
                $scope.nuevaNota.NotaId = data[1].NotaId;
                $scope.nuevaNota.Etiqueta = data[2].Etiqueta;
                $scope.nuevaNota.Tema = data[3].Tema;
                
                $scope.SetNuevaNota($scope.nuevaNota);
                
                $scope.LimpiarInterfaz();
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeNota').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeNota').modal('toggle');
        });
    };
    
    $scope.EditarNota = function()    
    {
        
        EditarNota($http, CONFIG, $q, $scope.nuevaNota).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                $scope.mensaje = "Nota editada.";
                $('#modalNota').modal('toggle');
                
                $scope.nuevaNota.Etiqueta = data[1].Etiqueta;
                $scope.nuevaNota.Tema = data[2].Tema;
                $scope.SetNuevaNota($scope.nuevaNota);
                
                $scope.LimpiarInterfaz();
                $scope.EnviarAlerta('Vista');
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde.";
                $('#mensajeNota').modal('toggle');
            }
            
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeNota').modal('toggle');
        });
    };
    
    $scope.SetNuevaNota = function(data)
    {
        var nota = SetNota(data);
        
        //tema
        var sqlBase = "SELECT COUNT(*) as num FROM ? WHERE TemaActividadId= '";
        for(var k=0; k<nota.Tema.length; k++)
        {
            sql = sqlBase + nota.Tema[k].TemaActividadId + "'";
            //tema Filtro
            count = alasql(sql, [$scope.temaF]);
            
            if(count[0].num === 0)
            {
               $scope.temaF.push(nota.Tema[k]);
            }
            
            //dropdown
            count = alasql(sql, [$scope.tema]);
            
            if(count[0].num === 0)
            {
               $scope.tema.push(nota.Tema[k]);
            }
        }
        
        //etiqueta
        sqlBase = "SELECT COUNT(*) as num FROM ? WHERE EtiquetaId= '";
        for(var k=0; k<nota.Etiqueta.length; k++)
        {
            sql = sqlBase + nota.Etiqueta[k].EtiquetaId + "'";
            //etiqueta Filtro
            count = alasql(sql, [$scope.etiquetaF]);
            
            if(count[0].num === 0)
            {
               $scope.etiquetaF.push(nota.Etiqueta[k]);
            }
            
            //etiqueta Dropdownlist
            count = alasql(sql, [$scope.etiqueta]);
            
            if(count[0].num === 0)
            {
               $scope.etiqueta.push(nota.Etiqueta[k]);
            }
        }
        
        
        if($scope.tipoDato == "Nota")
        {
            $scope.VerDetalles(nota.Titulo, nota.NotaId, 'Nota', true);
        }
        else if($scope.tipoDato == "Etiqueta")
        {
            if(nota.Etiqueta.length > 0)
            {
                var permanece = false;

                for(var k=0; k<nota.Etiqueta.length; k++)
                {
                    if(nota.Etiqueta[k].EtiquetaId == $scope.idDetalle)
                    {
                        $scope.VerDetalles(nota.Etiqueta[k].Nombre, nota.Etiqueta[k].EtiquetaId, 'Etiqueta', true);
                        permanece = true;
                        break;
                    }
                }

                if(!permanece)
                {
                    $scope.VerDetalles(nota.Etiqueta[0].Nombre, nota.Etiqueta[0].EtiquetaId, 'Etiqueta', true);
                }
            }
            else
            {
                  $scope.LimpiarDetalle();
            }
          
        }
        else if($scope.tipoDato == "Tema")
        {
            if(nota.Tema.length > 0)
            {
                var permanece = false;

                for(var k=0; k<nota.Tema.length; k++)
                {
                    if(nota.Tema[k].TemaActividadId == $scope.idDetalle)
                    {
                        $scope.VerDetalles(nota.Tema[k].Tema, nota.Tema[k].TemaActividadId, 'Tema', true);
                        permanece = true;
                        break;
                    }
                }

                if(!permanece)
                {
                    $scope.VerDetalles(nota.Tema[0].Tema, nota.Tema[0].TemaActividadId, 'Tema', true);
                }
            }
            else
            {
                $scope.LimpiarDetalle();
            }
        }
        else
        {
            $scope.VerDetalles(nota.Titulo, nota.NotaId, 'Nota', true);
        }
        
        if($scope.operacion == "Agregar" && $scope.FiltrarNota(nota))
        {
            $scope.nota.push(nota);
        }
        else if($scope.operacion == "Editar")
        {
            for(var k=0; k<$scope.nota.length; k++)
            {
                if($scope.nota[k].NotaId == nota.NotaId)
                {
                    if($scope.FiltrarNota(nota))
                    {
                        $scope.nota[k] = nota;
                    }
                    else
                    {
                        $scope.nota.splice(k,1);
                    }
                    break;
                }
            }
        }
        
        $scope.GetNotasFiltro();
    
    };
    
    $scope.LimpiarDetalle = function()
    {
        $scope.detalle = [];
        $scope.datoDetalle = "";
        $scope.idDetalle = "";
        $scope.tipoDato = "";
    };
    
    $scope.ValidarDatos = function()
    {
        $scope.mensajeError = [];
         
        if($scope.nuevaNota.Titulo !== undefined && $scope.nuevaNota.Titulo !== null)
        {
            if($scope.nuevaNota.Titulo.length === 0)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un titulo.";
            }
        }
        else
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe un titulo.";
        }
        
        if($scope.nuevaNota.Fecha.length === 0)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Selecciona una fecha.";
        }
        
        if($scope.nuevaNota.Notas !== undefined && $scope.nuevaNota.Notas !== null)
        {
            if($scope.nuevaNota.Notas.length === 0)
            {
                $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una nota.";
            }
        }
        else
        {
            $scope.mensajeError[$scope.mensajeError.length] = "*Escribe una nota.";
        }
        
        if(($scope.nuevaNota.Etiqueta.length + $scope.nuevaNota.Tema.length) === 0)
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

    
    //-------------- Borrar Diario -----------------
    $scope.BorrarNota = function(nota)
    {
        $scope.borrarNota = nota;

        $scope.mensajeBorrar = "¿Estas seguro de eliminar la nota?";

        $("#borrarNota").modal('toggle');
        
    };
    
    $scope.ConfirmarBorrarNota = function()
    {
        BorrarNota($http, CONFIG, $q, $scope.borrarNota.NotaId).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {                
                for(var k=0; k<$scope.nota.length; k++)
                {
                    if($scope.borrarNota.NotaId == $scope.nota[k].NotaId)
                    {
                        $scope.nota.splice(k,1);
                        break;
                    }
                }
                       
                if($scope.detalle.length == 1)
                {
                    $scope.LimpiarDetalle();
                }
                else
                {
                    for(var k=0; k<$scope.detalle.length; k++)
                    {
                        if($scope.detalle[k].NotaId == $scope.borrarNota.NotaId)
                        {
                           $scope.detalle.splice(k,1); 
                        }
                    }
                }
                
                $scope.mensaje = "Nota borrada.";
                $scope.EnviarAlerta('Vista');
                $scope.GetNotasFiltro();
                
            }
            else
            {
                $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde";
                $('#mensajeNota').modal('toggle');
            }
            
        }).catch(function(error)
        {
            $scope.mensajeError[$scope.mensajeError.length] = "Ha ocurrido un error. Intente más tarde. Error: " + error;
            $('#mensajeNota').modal('toggle');
        });
    };
    
    //------------------- Borrar Etiqueta ------
    $scope.BorraEtiqueta = function(etiqueta)
    {
        $scope.borrarEtiqueta = etiqueta;
        ETIQUETA.BorrarEtiqueta(etiqueta);
    };
    
    $scope.$on('EtiquetaBorrada',function()
    {   
        $scope.QuitarEtiqueta($scope.borrarEtiqueta);
        
        $scope.QuitarEtiquetaEtiquetas($scope.borrarEtiqueta);
    });
    
    $scope.QuitarEtiquetaEtiquetas = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta.splice(k,1);
                break;
            }
        }
    };
    
    /*--------------------   Imagenes  ----------------*/
    /*$scope.CargarArchivo = function(element) 
    {
        $scope.$apply(function($scope) 
        {
            if(element.files.length >0 )
            {
                
                for(var k=0; k<element.files.length; k++)
                {
                    $scope.nuevaNota.Imagen.push(element.files[k]);
                    $scope.nuevaNota.Imagen[$scope.nuevaNota.Imagen.length-1].src = $scope.srcImg[k];
                }
                /*$scope.nuevaInformacion.Archivo = element.files[0];
                $scope.nuevaInformacion.NombreArchivo = element.files[0].name;
                $scope.archivoSeleccionado = true;--
                console.log($scope.srcImg[k]);
                console.log($scope.nuevaNota.Imagen);
            }
        });
    };*/
    
    function ImagenSeleccionada(evt) 
    {
        var files = evt.target.files;
        

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
                    //$scope.srcImg.push(e.target.result);
                    
                    $scope.nuevaNota.ImagenSrc.push(theFile);
                    
                    //console.log(theFile);
                    //console.log($scope.nuevaNota.ImagenSrc);
                    
                    
                    $scope.nuevaNota.ImagenSrc[$scope.nuevaNota.ImagenSrc.length-1].Src= (e.target.result);
                   
                    //$scope.nuevaNota.Imagen[$scope.nuevaNota.Imagen.length-1].src = e.target.result;
                    
                    $scope.$apply();
                    //document.getElementById("PrevisualizarImagenColor").innerHTML = ['<img class="imagenModulo center-block" src="', e.target.result,'" title="', escape(theFile.name), '"/>'].join('');
                    //document.getElementById("PrevisualizarImagenColorDetalles").innerHTML = ['<img class=" center-block img-responsive" src="', e.target.result,'" title="', escape(theFile.name), '"/>'].join('');
                    
                };
            })(f);
            
            
            reader.readAsDataURL(f);
            
             
        }
         document.getElementById('cargarImagen').value = "";
        
        //$scope.CargarArchivo(document.getElementById('cargarImagen'));
    }
 
    document.getElementById('cargarImagen').addEventListener('change', ImagenSeleccionada, false);
    
    /*----------------------- Usuario logeado --------------------------*/
    $scope.InicializarControlador = function()
    {
        if($scope.usuarioLogeado.Aplicacion != "Mis Notas")
        {
            $rootScope.IrPaginaPrincipal();
            $scope.Login = false;
        }
        else
        {
            $rootScope.UsuarioId = $scope.usuarioLogeado.UsuarioId;
            $scope.GetNotas();
            $scope.GetTemaActividad();
            $scope.GetEtiqueta();
            $scope.Login = true;
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
    
    //---------------- Editar etiqueta exterior---------------------------
    $scope.EditarRegistroEtiqueta = function(etiqueta)
    {
        ETIQUETA.EditarEtiqueta(etiqueta);
    };
    
    $scope.$on('TerminarEditarEtiqueta',function()
    {   
        $scope.mensaje = "Etiqueta Editada";
        $scope.EnviarAlerta('Modal');
        
        var nueva = ETIQUETA.GetEtiqueta();
        $scope.SetNuevaEtiqueta(nueva);
    });
    
    $scope.SetNuevaEtiqueta = function(etiqueta)
    {
        for(var k=0; k<$scope.etiqueta.length; k++)
        {
            if($scope.etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.etiqueta[k].Nombre = etiqueta.Nombre;
                break;
            }
        }
        
        for(var k=0; k<$scope.nuevaNota.Etiqueta.length; k++)
        {
            if($scope.nuevaNota.Etiqueta[k].EtiquetaId == etiqueta.EtiquetaId)
            {
                $scope.nuevaNota.Etiqueta[k].Nombre = etiqueta.Nombre;
                break;
            }
        }
    };
    
    //-------------- Etiquetas equivalentes -----------------------------
    $scope.EtiquetaEquivalente = function(etiqueta)
    {
        EEQUIVALENTE.SetEtiquetaEquivalente(etiqueta, $scope.etiqueta);
    };
    
    $scope.$on('SentNuevaEtiqueta',function()
    {   
        var nueva = EEQUIVALENTE.GetNueva();
        $scope.PushNuevaEtiqueta(nueva);
    });
    
    $scope.PushNuevaEtiqueta = function(etiqueta)
    {
        for(var k=0; k<etiqueta.length; k++)
        {
            var nueva = SetEtiqueta(etiqueta[k]);
            nueva.show = true;
            $scope.etiqueta.push(nueva);
        }
    };
    

    //------------------- Alertas ---------------------------
    $scope.EnviarAlerta = function(alerta)
    {
        if(alerta == "Modal")
        {
            $("#alertaExitosoNota").alert();

            $("#alertaExitosoNota").fadeIn();
            setTimeout(function () {
                $("#alertaExitosoNota").fadeOut();
            }, 2000);
        }
        else if('Vista')
        {
            $("#alertaEditarExitosoNota").alert();

            $("#alertaEditarExitosoNota").fadeIn();
            setTimeout(function () {
                $("#alertaEditarExitosoNota").fadeOut();
            }, 2000);
        }
    };
    
    /*window.onbeforeunload = confirmExit;
    function confirmExit()
    {
        if($("#modalNota").is(":visible"))
        {
            return "Ha intentado salir de esta pagina. Si ha realizado algun cambio en los campos sin hacer clic en el boton Guardar, los cambios se perderan. Seguro que desea salir de esta pagina? ";
        }
    }*/
    
});


