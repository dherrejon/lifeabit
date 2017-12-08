app.controller("NotasController", function($scope, $window, $http, $rootScope, md5, $q, CONFIG, datosUsuario, $location, $sce, ETIQUETA, IMAGEN)
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
    
    $scope.campoBuscar = "Conceptos";
    
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
    
    //Orden
    $scope.notaOrden = GetNotaOrden();
    $scope.ordenNota = $scope.notaOrden[0];
    
    
    /*------------------ Catálogos -----------------------------*/
    $scope.GetNotas = function()              
    {
        GetNotas($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {      
            $scope.nota = data;
            
            //$scope.GetEtiquetaPorNota();
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    $scope.GetNotaOrdenUsuario = function()              
    {
        GetNotaOrdenUsuario($http, $q, CONFIG, $rootScope.UsuarioId).then(function(data)
        {    
            if(data == null)
            {
                return;
            }
            for(var k=0; k<$scope.notaOrden.length; k++)
            {
                if(data.Id == $scope.notaOrden[k].Id)
                {
                    $scope.ordenNota = $scope.notaOrden[k];
                    break;
                }
            }
            
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
        GetEtiqueta($http, $q, CONFIG, $scope.usuarioLogeado.UsuarioId).then(function(data)
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
                $scope.SetTemaImagenNota(imagen, $scope.nuevaNota.Tema);
                $scope.SetEtiquetaImagenNota(imagen, $scope.nuevaNota.Etiqueta);
            }

        }).catch(function(error)
        {
            alert(error);
        });
        
    };
    
    //---- Oredenar -------
    $scope.CambiarOrden = function(orden)
    {
        if(orden.Id != $scope.ordenNota)
        {
            $scope.ordenNota = orden;
            $scope.EditarNotaOrdenUsuario($rootScope.UsuarioId, orden.Id);
        }
    };
    
    $scope.EditarNotaOrdenUsuario = function(usuarioId, notaOrdenId)              
    {
        EditarNotaOrdenUsuario($http, $q, CONFIG, usuarioId, notaOrdenId).then(function(data)
        {      
        }).catch(function(error)
        {
            alert(error);
        });
    };
    
    
    //-------- Notas de detalles --------
    $scope.GetNotasPorId = function(id, tipo)
    {
        var datos = {Id:id};
        
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
    
    $scope.GetNotasFiltro = function()
    {   
        $scope.filtro.usuarioId = $rootScope.UsuarioId;
        
        GetNotasFiltro($http, $q, CONFIG, $scope.filtro).then(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                $scope.nota = data[1].Notas;
                //$scope.etiquetaB = data[2].Etiquetas;
                //$scope.temaB = data[3].Temas;
            }
            else
            {
                $scope.nota = [];
                //$scope.etiquetaB = [];
                //$scope.temaB = []; 
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
    $scope.VerDetalles = function(id, entrar)
    {
        if($scope.idDetalle != id || entrar === true)
        {
            $scope.idDetalle = id;
            
            $scope.GetNotasPorId(id);
        }
    };
    
    $scope.GetClaseDiario = function(dato)
    {
        if($scope.idDetalle == dato)
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
        var count = 0;
        for(var k=0; k< $scope.fototeca.length; k++)
        {
            if($scope.fototeca[k].Seleccionada)
            {
                agregada = false;
                for(var i=0; i<$scope.nuevaNota.Imagen.length; i++)
                {
                    if($scope.nuevaNota.Imagen[i].ImagenId == $scope.fototeca[k].ImagenId)
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
                        $scope.lastIndex = $scope.nuevaNota.Imagen.length + 1;
                    }
                    
                    $scope.nuevaNota.Imagen.push($scope.fototeca[k]);
                }
            }
        }
        
        $('#fototeca').modal('toggle');
    };
    
    $scope.SetEtiquetaImagenNota = function(imagen, etiqueta)
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
    
    $scope.SetTemaImagenNota = function(imagen, tema)
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
        return $scope.FiltrarBuscarTema(tema, $scope.buscarConceptoBarra);
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
        return $scope.FiltrarBuscarEtiqueta(etiqueta, $scope.buscarConceptoBarra);
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
    $('#fechaFiltro').datetimepicker(
    { 
        locale: 'es',
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
        $('#fechaFiltro').data("DateTimePicker").clear();
    };
    
    $scope.CambiarFechaFiltro = function(element) 
    {
        $scope.$apply(function($scope) 
        {   
            if(element.value.length > 0 && element.value != $scope.filtro.fecha)
            {
                $scope.filtro.fecha = element.value;
                $scope.filtro.fechaFormato = TransformarFecha(element.value);
                $scope.GetNotasFiltro();
            }
            
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
                    if($scope.filtro.etiqueta[i].EtiquetaId == nota.Etiqueta[j].EtiquetaId)
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
                        if($scope.filtro.tema[i].TemaActividadId == nota.Tema[j].TemaActividadId)
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
        tema.filtro = false;
        $scope.filtro.tema.push(tema);
        
        $scope.buscarConceptoBarra = "";
        document.getElementById('buscarConcepto').focus();
        
        $scope.GetNotasFiltro();
    };
    
    $scope.SetFiltroEtiqueta = function(etiqueta)
    {
        etiqueta.filtro = false;
        $scope.filtro.etiqueta.push(etiqueta);
            
        $scope.buscarConceptoBarra = "";
        document.getElementById('buscarConcepto').focus();
        
        $scope.GetNotasFiltro();
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
        $('#fechaFiltro').data("DateTimePicker").clear();
        
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
        //$scope.buscarTemaFiltro = "";
        
        $scope.GetNotasFiltro();
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
        
        $scope.GetNotasFiltro();
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
        
        $scope.GetNotasFiltro();
    };
    
    $scope.LimpiarBuscarFiltro = function()
    {
        $scope.buscarConceptoBarra = "";
        $scope.buscarTituloBarra = "";
        
        if($scope.campoBuscar == "Fecha")
        {
            $scope.LimpiarFiltroFecha();
            $scope.GetNotasFiltro();
        }
    };
    
    $scope.CambiarCampoBuscar = function(campo)
    {
        if(campo != $scope.campoBuscar)
        {
            $scope.campoBuscar = campo;
            
            $scope.buscarTituloBarra = "";
            $scope.buscarConceptoBarra = ""; 
        }
        
        if(campo == "Fecha")
        {
            $scope.AbrirCalendario();
        }
    };
    
    //Presionar enter
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
            
            $scope.ActivarDesactivarTema($scope.nuevaNota.Tema);
            $scope.ActivarDesactivarEtiqueta($scope.nuevaNota.Etiqueta);
            
            for(var k=0; k<$scope.nuevaNota.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta($scope.nuevaNota.Imagen[k], false);
            }
            
            $scope.notaInicial = SetNota($scope.nuevaNota);   
            document.getElementById("fechaNota").value = $scope.nuevaNota.Fecha;
        }
        
        $scope.$broadcast('IniciarEtiquetaControl', $scope.etiqueta, $scope.tema, $scope.nuevaNota, 'Nota');
        
        $('#modalApp').modal('toggle'); 
        
        
        //document.getElementById('contenido').value = $scope.nuevaNota.Notas;
        //autosize.update($scope.nuevaNota.Notas);
    };
    
    /*$('textarea').each(function(){
        autosize(this);
    }).on('autosize:resized', function(){
      console.log('textarea height updated');
        
        
    });*/
    
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
            $('#modalApp').modal('toggle');
        }
        else
        {
            $('#cerrarNota').modal('toggle');
        }
        
        $scope.etiquetaSugerida = [];
        $rootScope.buscarConcepto = "";
    };
    
    $scope.ConfirmarCerrarNota = function()
    {
        $('#modalApp').modal('toggle');
        $scope.mensajeError = [];
        $scope.LimpiarInterfaz();
    };
    
    $scope.LimpiarInterfaz = function()
    {
        $scope.etiquetaSugerida = [];
        //$scope.buscarTema = "";
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
            $scope.$broadcast('AgregarEtiquetaSugerida', $scope.etiqueta, $scope.tema, $scope.nuevaNota, 'Nota', etiqueta);
        }
        else
        {
            $scope.mensajeError = [];
            $scope.mensajeError[0] = "*Etiqueta no válida. " + etiqueta;
        }
        
        if( k != -1)
        {
            $scope.etiquetaSugerida.splice(k,1);
        }
    };
    
    $scope.AgregarTodaEtiquetaSugerida = function()
    {
        $scope.verEtiqueta = true;
        
        for(var k=0; k<$scope.etiquetaSugerida.length; k++)
        {
            $scope.AgregarEtiquetaSugerida($scope.etiquetaSugerida[k], -1);
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
        $scope.$broadcast('SepararEtiqueta', $scope.nuevaNota.Tema, 'Nota');
    };
    
    $scope.$on('TerminarEtiquetaOculta',function()
    {           
        $scope.nuevaNota.UsuarioId = $scope.usuarioLogeado.UsuarioId;
        if($scope.operacion == "Agregar")
        {
            $scope.AgregarNota();
        }
        if($scope.operacion == "Editar")
        {
            $scope.EditarNota();
        }
    });
    
    $scope.AgregarNota = function()    
    {
        AgregarNota($http, CONFIG, $q, $scope.nuevaNota).then(function(data)
        {
            if(data[0].Estatus == "Exitoso")
            {
                
                $scope.mensaje = "Nota agregada.";
                $scope.EnviarAlerta('Vista');
                
                $('#modalApp').modal('toggle');
                
                $scope.nuevaNota.NotaId = data[1].NotaId;
                $scope.nuevaNota.Etiqueta = data[2].Etiqueta;
                $scope.nuevaNota.Tema = data[3].Tema;
                 $scope.nuevaNota.FechaModificacion = data[4].FechaModificacion;
                
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
                $('#modalApp').modal('toggle');
                
                $scope.nuevaNota.Etiqueta = data[1].Etiqueta;
                $scope.nuevaNota.Tema = data[2].Tema;
                $scope.nuevaNota.FechaModificacion = data[3].FechaModificacion;
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
        //console.log(nota);
        //tema
        var sqlBase = "SELECT COUNT(*) as num FROM ? WHERE TemaActividadId= '";
        for(var k=0; k<nota.Tema.length; k++)
        {
            sql = sqlBase + nota.Tema[k].TemaActividadId + "'";
            //tema Filtro
            /*count = alasql(sql, [$scope.temaF]);
            
            if(count[0].num === 0)
            {
               $scope.temaF.push(nota.Tema[k]);
            }*/
            
            //dropdown
            count = alasql(sql, [$scope.tema]);
            
            if(count[0].num === 0)
            {
                nota.Tema[k].filtro = true;
               $scope.tema.push(nota.Tema[k]);
            }
        }
        
        //etiqueta
        sqlBase = "SELECT COUNT(*) as num FROM ? WHERE EtiquetaId= '";
        for(var k=0; k<nota.Etiqueta.length; k++)
        {
            sql = sqlBase + nota.Etiqueta[k].EtiquetaId + "'";
            //etiqueta Filtro
            /*count = alasql(sql, [$scope.etiquetaF]);
            
            if(count[0].num === 0)
            {
               $scope.etiquetaF.push(nota.Etiqueta[k]);
            }*/
            
            //etiqueta Dropdownlist
            count = alasql(sql, [$scope.etiqueta]);
            
            if(count[0].num === 0)
            {
                nota.Etiqueta[k].filtro = true;
               $scope.etiqueta.push(nota.Etiqueta[k]);
            }
        }
        
         $scope.VerDetalles(nota.NotaId, true);
        
        /*if($scope.tipoDato == "Nota")
        {
            $scope.VerDetalles(nota.NotaId, true);
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
        }*/
        
        if($scope.operacion == "Agregar" && $scope.FiltrarNota(nota))
        { 
            $scope.GetNotasFiltro();
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
    };
    
    $scope.LimpiarDetalle = function()
    {
        $scope.detalle = [];
        $scope.idDetalle = "";
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
                
                $scope.LimpiarDetalle();
                       
                /*if($scope.detalle.length == 1)
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
                }*/
                
                $scope.mensaje = "Nota borrada.";
                $scope.EnviarAlerta('Vista');
                
                for(var k=0; k<$scope.nota.length; k++)
                {
                    if($scope.nota[k].NotaId == $scope.borrarNota.NotaId)
                    {
                        $scope.nota.splice(k,1);
                        break;
                    }
                }
                //$scope.GetNotasFiltro();
                
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

    
    //Imagenes de archivo
    function ImagenSeleccionada(evt) 
    {
        var files = evt.target.files;
        
        $scope.index = $scope.nuevaNota.ImagenSrc.length;
        $scope.lastIndex = $scope.nuevaNota.ImagenSrc.length + 1;
        $scope.srcSize = $scope.nuevaNota.ImagenSrc.length + files.length;
        
        
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
                    $scope.nuevaNota.ImagenSrc.push(theFile);
                    $scope.nuevaNota.ImagenSrc[$scope.nuevaNota.ImagenSrc.length-1].Src= (e.target.result);
                    $scope.nuevaNota.ImagenSrc[$scope.nuevaNota.ImagenSrc.length-1].Etiqueta = [];
                    $scope.nuevaNota.ImagenSrc[$scope.nuevaNota.ImagenSrc.length-1].Tema = [];

                    if( $scope.srcSize === $scope.nuevaNota.ImagenSrc.length)
                    {
                        $scope.todasImg = "src";
                        $scope.SetTemaImagenNota($scope.nuevaNota.ImagenSrc[$scope.index], $scope.nuevaNota.Tema);
                    }
                    
                    $scope.SetEtiquetaImagenNota($scope.nuevaNota.ImagenSrc[$scope.nuevaNota.ImagenSrc.length-1], $scope.nuevaNota.Etiqueta);
                    
                    $scope.$apply();
                };
                
                debugger;
            })(f);
            
            
            reader.readAsDataURL(f);
        }
         document.getElementById('cargarImagen').value = "";
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
            $scope.GetNotaOrdenUsuario();
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
            var index = 0;
            
            if($scope.nuevaNota.Imagen.length === 0)
            {
                index = 1;
            }
            
            for(var k=1; k<$scope.nuevaNota.Imagen.length; k++)
            {
                $scope.SetTemaImagenNota($scope.nuevaNota.Imagen[k], $scope.temaAgregar);
            }
            
            for(var i=index; i<$scope.nuevaNota.ImagenSrc.length; i++)
            {
                $scope.SetTemaImagenNota($scope.nuevaNota.ImagenSrc[i], $scope.temaAgregar);
            }
        }
        else if(opt == "opt")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevaNota.Imagen.length; k++)
            {
                $scope.GetImagenEtiqueta($scope.nuevaNota.Imagen[k]);
            }
        }
        else if(opt == "src")
        {
            for(var k=$scope.lastIndex; k<$scope.nuevaNota.ImagenSrc.length; k++)
            {
                $scope.SetTemaImagenNota($scope.nuevaNota.ImagenSrc[k], $scope.nuevaNota.Tema);
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
    };
    
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
    $scope.$on('EtiquetaSet',function(etiqueta)
    {
        $scope.SetEtiquetaTodasImagenes(ETIQUETA.GetEtiqueta());
    });
    
    $scope.SetEtiquetaTodasImagenes = function(etiqueta)
    {
        var e = [];
        e[0] = etiqueta;

        for(var i=0; i<$scope.nuevaNota.Imagen.length; i++)
        {
            $scope.SetEtiquetaImagenNota($scope.nuevaNota.Imagen[i], e);
        }
        
        for(var i=0; i<$scope.nuevaNota.ImagenSrc.length; i++)
        {
            $scope.SetEtiquetaImagenNota($scope.nuevaNota.ImagenSrc[i], e);
        }
    };
    
    $scope.$on('TemaSet',function(etiqueta)
    {
        $scope.todasImg = "tema";
        $scope.SetTemaTodasImagenes(ETIQUETA.GetEtiqueta());
    });
    
    $scope.SetTemaTodasImagenes = function(tema)
    {
        var e = [];
        e[0] = tema;
        
        $scope.temaAgregar = e;
        
        if($scope.nuevaNota.Imagen.length > 0)
        {
            $scope.SetTemaImagenNota($scope.nuevaNota.Imagen[0], e);
        }
        else if($scope.nuevaNota.ImagenSrc.length > 0)
        {
            $scope.SetTemaImagenNota($scope.nuevaNota.ImagenSrc[0], e);
        }
    };
    
    $scope.$on('QuitarEtiqueta',function(nota, etiqueta)
    {
        for(var i=0; i<$scope.nuevaNota.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevaNota.Imagen[i].Etiqueta.length; j++)
            {
                if($scope.nuevaNota.Imagen[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevaNota.Imagen[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevaNota.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevaNota.ImagenSrc[i].Etiqueta.length; j++)
            {
                if($scope.nuevaNota.ImagenSrc[i].Etiqueta[j].EtiquetaId == etiqueta.EtiquetaId)
                {
                    $scope.nuevaNota.ImagenSrc[i].Etiqueta.splice(j,1);
                    break;
                }
            }
        }
    });
    
    $scope.$on('QuitarTema',function(nota, tema)
    {
        for(var i=0; i<$scope.nuevaNota.Imagen.length; i++)
        {
            for(var j=0; j<$scope.nuevaNota.Imagen[i].Tema.length; j++)
            {
                if($scope.nuevaNota.Imagen[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevaNota.Imagen[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevaNota.Imagen[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
        
        for(var i=0; i<$scope.nuevaNota.ImagenSrc.length; i++)
        {
            for(var j=0; j<$scope.nuevaNota.ImagenSrc[i].Tema.length; j++)
            {
                if($scope.nuevaNota.ImagenSrc[i].Tema[j].TemaActividadId == tema.TemaActividadId)
                {
                    $scope.nuevaNota.ImagenSrc[i].Tema.splice(j,1);
                    IMAGEN.CambiarEtiquetasOcultas($scope.nuevaNota.ImagenSrc[i], $scope.etiqueta, $scope.tema);
                    break;
                }
            }
        }
    });
    

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
    
    autosize(('#contenido'));
    
});


