class PersonaActividad
{
    constructor()
    {
        this.PersonaId = "";
        this.Nombre = "";
    }
}

function GetPersonaActividad($http, $q, CONFIG, usuarioId)     
{
    var q = $q.defer();

    $http({      
          method: 'GET',
          url: CONFIG.APIURL + '/GetPersonaActividad/' + usuarioId,

      }).success(function(data)
        {
            if(data[0].Estatus == "Exito")
            {
                var persona = []; 
                for(var k=0; k<data[1].Persona.length; k++)
                {
                    persona[k] = SetPersonaActividad(data[1].Persona[k]);
                }
                q.resolve(persona); 
            }
            else
            {
                q.resolve([]);
            }
             
        }).error(function(data, status){
            q.resolve(status);
     }); 
    return q.promise;
}

function SetPersonaActividad(data)
{
    var persona = new PersonaActividad();
    
    persona.PersonaId = data.PersonaId;
    persona.Nombre = data.Nombre;
    
    return persona;
}

function AgregarPersonaActividad($http, CONFIG, $q, persona)
{
    var q = $q.defer();
    
    $http({      
          method: 'POST',
          url: CONFIG.APIURL + '/AgregarPersonaActividad',
          data: persona

      }).success(function(data)
        {
            q.resolve(data);
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function EditarPersonaActividad($http, CONFIG, $q, persona)
{
    var q = $q.defer();

    $http({      
          method: 'PUT',
          url: CONFIG.APIURL + '/EditarPersonaActividad',
          data: persona

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}

function BorrarPersonaActividad($http, CONFIG, $q, id)
{
    var q = $q.defer();

    $http({      
          method: 'DELETE',
          url: CONFIG.APIURL + '/BorrarPersonaActividad',
          data: id

      }).success(function(data)
        {
            q.resolve(data);    
        }).error(function(data, status){
            q.resolve([{Estatus:status}]);

     }); 
    return q.promise;
}


  