app.controller("BotonTop", function($scope)
{   
   //----- boton arriba
    $scope.GoToTop = function() 
    {
        //document.body.scrollTop = 0;
        //document.documentElement.scrollTop = 0;
        $('html, body').animate({scrollTop : 0},800);
    };
    
    window.onscroll = function() 
    {
        scrollFunction();
    };

    function scrollFunction() 
    {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) 
        {
            document.getElementById("btnTop").style.display = "block";
        } 
        else 
        {
            document.getElementById("btnTop").style.display = "none";
        }
    }

});
