
var firstEndpoint = null;
var connectorColor = null;
/*
GeneraLista

 @name: nombre de la lista
 @urlData: url de donde se obtienen los datos
 @conectors: cadena que indica que indica los endpoints que seran mostrados. Los valores que puede klevar la cadena son combinaciones de los siguientes simbolos:
  r: right
  l: left
  t: top
  b:bottom:
  *: todos

Ejemplos: 

-Si se pasa la cadena "rl" se muestran solo los endpoints de izquierda y derecha.
-Si se pasa la cadena "rtb" se muestran solo los endpoints de derecha arriba y abajo.

*/

function generaLista(name, urlData, conectors, callback) {

	var list = '';


	$.getJSON(urlData, function (data) {		
		
		//var fragment = document.createDocumentFragment();
		

		$.each(data, function (key, val) {


			var columnElement = val;
			var element = '';			
			var idElement = 'data-id-element="' + columnElement.id + '"';
			var colorElement = 'data-color-element="' + columnElement.color + '"';
			var listId = 'data-list-id="' + name + '"';


			//Si se van a agregar todos los endpoints
			if(conectors.indexOf('*') >- 1) {

				element = '<li id="' + columnElement.id + '" ' + colorElement + ' ' + listId + '>' +
							'<div class="top" ' + idElement + '></div>' +
							'<div class="inline left" ' + idElement + '></div>' +
							'<div class="inline center" ' + idElement + '>' + columnElement.label + '</div>' +
							'<div class="inline right" ' + idElement + '></div>' +
							'<div class="bottom" ' + idElement + '></div>' +
							'</li>';

			} else {

				element  += '<li id="' + columnElement.id + '" ' + colorElement + ' ' + listId + '>';

				if(conectors.indexOf('t') > -1)
					element  += '<div class="top" ' + idElement + '></div>';

				if(conectors.indexOf('l') > -1)
					element  += '<div class="inline left" ' + idElement + '></div>';

				element  += '<div class="inline center" ' + idElement + '>' + columnElement.label + '</div>';

				if(conectors.indexOf('r') > -1)
					element  += '<div class="inline right" ' + idElement + '></div>';

				if(conectors.indexOf('b') > -1)
					element  += '<div class="bottom" ' + idElement + '></div>';

				element  +='</li>';
			}

			list  += element;

		});

	
		$('#' + name).append(list);

		//funcion que se ejecuta al dar click a cualquier endpoint
					
		$('#' + name + ' li ').find("div.top, div.left, div.right, div.bottom, div.center").click( function(e) {				
			
			clickOnEndpoint(this);

		});

		$('#' + name + ' li ').find("div.top, div.left, div.right, div.bottom, div.center").hover(function() {				
			
			$(this).css("backgroundColor","#cccccc")

		}, function() {					
			if(this != firstEndpoint)
				$(this).css("backgroundColor","#ffffff")

		});

		//Se ejecuta la funcion de callback
		if(callback != undefined)			
			callback();
		


	});
}


function clickOnEndpoint(element) {

	

	var idFirstElement = null;



			if( firstEndpoint == null) {

				firstEndpoint = element;
				idFirstElement = element.dataset.idElement

				if(connectorColor == null || connectorColor == "null" || connectorColor == "")
					connectorColor=document.getElementById(idFirstElement).dataset.colorElement;
				
				$(firstEndpoint).css("backgroundColor","#cccccc")


			} else {


				var secondEndpoint= element;
				idFirstElement = firstEndpoint.dataset.idElement;
				idSecondElement = secondEndpoint.dataset.idElement;

				var firstElement = document.getElementById(idFirstElement);
				var secondElement = document.getElementById(idSecondElement);
				
				if(connectorColor == null || connectorColor == "null" || connectorColor == "")
					connectorColor = secondElement.dataset.colorElement;

				//Se determinan las coordenadas de los endpoints
				firstEndpoint.coords = calculateEndPoint(firstEndpoint);
				secondEndpoint.coords = calculateEndPoint(secondEndpoint);


				var x1 = firstEndpoint.coords.x;
				var y1 = firstEndpoint.coords.y;

				var x2 = secondEndpoint.coords.x;
				var y2 = secondEndpoint.coords.y;


				//Se determinan las coordenadas del punto de control utilizado para modificar la curva cuadratica
				var controlPoint = calculateControlPoint(x1, y1, x2, y2);


				if(document.getElementById(idFirstElement  +  secondEndpoint.dataset.idElement + "Curve") != null)
					$("#" + idFirstElement  +  secondEndpoint.dataset.idElement + "Curve").attr("d","M " + x1 + " " + y1 + " T " + e.x + " " + e.y);
				else {

					var SVG = { ns: "http://www.w3.org/2000/svg" };
					var path = document.createElementNS(SVG.ns, "path");

					path.setAttribute("id", '"' + idFirstElement  +  secondEndpoint.dataset.idElement + 'Curve"');
					path.setAttribute("class", firstElement.dataset.listId  + ' ' + secondElement.dataset.listId);
					path.setAttribute("implicatedElements", idFirstElement  + ' ' + secondEndpoint.dataset.idElement);

					//Se genera la curva cuadratica
					path.setAttribute("d", 'M ' + x1 + ' ' + y1 + ' Q ' + controlPoint.x + ' ' + controlPoint.y + ' ' + x2 + ' ' + y2);
					
					//Se decora la curva
					path.setAttribute("stroke", connectorColor);
					path.setAttribute("stroke-width", '5');
					path.setAttribute("fill", 'none');

					document.getElementById("curves").appendChild(path);
				}

				firstEndpoint = null;
				connectorColor = null;

				$('#' + idFirstElement + ' div').css("backgroundColor","#ffffff")

			}

}

/*
 *Funcion que determina la posicion del punto de control para dibujar la curva cuadratica
*/
function calculateControlPoint(x1, y1, x2, y2) {

	var x = x2;
	var y = y1;

	return {"x":x, "y":y};
}



/*
 *Funcion que determina la posicion de los puntos inicial y final de la curva
*/

function calculateEndPoint(element) {

	var x;
	var y;

	x = element.offsetLeft + element.offsetWidth/2;
	y = element.offsetTop + element.offsetHeight/2;	

	return {"x":x, "y":y};

}


function validate(listName) {

	$("path"+((listName != "")?("."+listName):"")).each(function (key, val) {
		
		var connection = document.getElementById(this.id);

		//Se obtienen los IDs de las comlumnas implicadas en la relacion
		var implicatedColumns = connection.getAttribute("class").split(" ");

		//Se obtienen los IDs de los elementos implicadas en la relacion
		var implicatedElements = connection.getAttribute("implicatedElements").split(" ");

		//Se usa  jQuery.data cuando se manejan objetos JSON
		var validElements = jQuery.data(document.getElementById(implicatedElements[0]), "validMatch");

		//Si el primer elemento tiene las lista de elementos validos
		if(validElements != undefined){
		
			//Si el segundo elemento no es un elemento valido
			if(validElements[implicatedColumns[1]].indexOf(implicatedElements[1]) < 0)
				$(this).remove();

		}else{

			validElements = jQuery.data(document.getElementById(implicatedElements[1]), "validMatch");

			//Si el primer elemento no es un elemento valido
			if(validElements[implicatedColumns[0]].indexOf(implicatedElements[0]) < 0)
				$(this).remove();
			
		}


	});

}

function reset(listName) {

	$("path"+((listName != "")?("."+listName):"")).each(function (key, val) {
			
		$(this).remove();

	});

}


function addListValidationrules(list1, list2, urlValidationData){

	$.getJSON(urlValidationData, function (data){

		$.each(data, function (key, val){

			var validMatch= {};

			validMatch[list2] = val;

			//Se asignan los elementos validos con los que se puede conectar un elemento de la lista uno en la lista 2
			//Se usa  jQuery.data cuando se manejan objetos JSON
			jQuery.data(document.getElementById(key), "validMatch", validMatch);

		});

	});

}


generaLista('fruits','/gh/get/response.json/emohedano/Column-Matcher/tree/master/Demo/fruits/','rc', function(){

	addListValidationrules('fruits', 'colors', '/gh/get/response.json/emohedano/Column-Matcher/tree/master/Demo/fruits_color/');	
});

generaLista('colors','/gh/get/response.json/emohedano/Column-Matcher/tree/master/Demo/colors/','lc');
