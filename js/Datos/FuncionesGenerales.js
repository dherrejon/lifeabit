function LimiparCaracteresLabel(label)
{
    var txt = label.split(" ");

    for(var i=0; i<txt.length; i++)
    {
        for(var k=0; k<caracter.length; k++)
        {
            if(txt[i].endsWith(caracter[k]) || txt[i].indexOf(caracter[k]) === 0)
            {
                txt[i] = txt[i].replace(caracter[k], "");
                k = -1;
            }
        }
        
        txt[i] = txt[i].toLocaleLowerCase();
        
        for(var m=0; m<nosugerir.length; m++)
        {
            var found = false;
            
            for(var n=0; n<nosugerir[m].length; n++)
            {
                if(txt[i] == nosugerir[m][n])
                {
                    found = true;
                    txt.splice(i, 1);
                    i--;
                }
            }
            
            if(found)
            {
                break;
            }
        }
    }
    
    return txt;
}

var caracter = [",", ".", "(", ")", ":", ";", "[", "]", "{", "}", "?", "¿", "!", "¡", "$", "%"];

var pronombre = ["yo", "tu", "ella", "el", "él", "usted", "ustedes", "nosotros", "nosotras", "ellos", "ellas"];
var pronombreprogresivo = ["mio", "mia", "mía", "mío", "tuyo", "tuya", "tuyos", "tuyas", "mios", "mias", "mías", "míos", "nuestro", "nuestros", "nuestras", "nuestra", "suya", "suyas", "suyo", "suyos"];
var pronombredemostrativo = ["aquí", "acá", "aqui", "aca", "ahí", "ahi", "allá", "alla", "éste", "ése", "aquél", "ésta", "ésa", "aquélla", "éstos", "ésos", "aquéllos", "éstas", "ésas", "aquéllas", "esto", "eso", "aquello"];
var pronombreindefinido = ["mucho", "muchos", "mucha", "muchas", "poco", "pocos", "poca", "pocas", "tanto", "tantos", "tanta", "tantas", "bastante", "bastantes", "demaciado", "demaciados", "demaciada", "demaciadas", "alguno", "algunos", "alguna", "algunas", "ninguno", "ninguna", "algo", "nada"];
var pronombrerelativo = ["que", "quien", "quienes", "cuyo", "cuyos", "cuya", "cuyas", "donde"];
var pronombreinterrogativos = ["qué", "cual", "cuales", "cuanto", "cuantos", "cuanta", "cuantas"];
var pronombreexclamativos = ["cómo", "cuál", "dónde", "quién", "cuánto"];
var pronombrereflexivo = ["conmigo", "contigo", "consigo", "se", "me", "te", "le", "les", "nos"];
var preposicion = ["a", "ante", "con", "contra", "de", "desde", "durante", "en", "entre", "hacia", "hasta", "para", "por", "según", "sin", "sobre", "tras"];
var articulo = ["el", "la", "los", "las", "un", "una", "unos", "unas", "al", "del"];
var conjuncion = ["y", "e", "ni", "o", "más", "pero", "sino", "sea", "porque", "pues"];
var posesivo = ["mi", "mis", "tu", "tus", "su", "sus", "nuestro", "nuestros", "nuestra", "nuestras"];

var nosugerir = [];
nosugerir.push(pronombre);
nosugerir.push(pronombreprogresivo);
nosugerir.push(pronombredemostrativo);
nosugerir.push(pronombreindefinido);
nosugerir.push(pronombrerelativo);
nosugerir.push(pronombreinterrogativos);
nosugerir.push(pronombreexclamativos);
nosugerir.push(preposicion);
nosugerir.push(articulo);
nosugerir.push(conjuncion);
nosugerir.push(posesivo);
nosugerir.push(pronombrereflexivo);