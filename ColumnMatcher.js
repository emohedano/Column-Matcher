
var firstElement = null;
var connectorColor = null;

var existentColumns = {};

function is_array (object) {
    return typeof(object) == 'object' && (object instanceof Array);
}


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

function generaLista(name, urlData, conectors, relatedLists) {

	var list = '';


	$.getJSON(urlData, function (data) {		
		
		//var fragment = document.createDocumentFragment();
		

		existentColumns[name] = data;

		$.each(data, function (key, val) {


			var columnElement = val;

			var element = '';

			
			var idElement = 'data-id-element="' + columnElement.id + '"';

			var colorElement = 'data-color-element="' + columnElement.color + '"';


			
			if(conectors.indexOf('*') >- 1) {

				element = '<li id="' + columnElement.id + '" ' + colorElement + '>' +
							'<div class="top" ' + idElement + '></div>' +
							'<div class="inline left" ' + idElement + '></div>' +
							'<div class="inline center">' + columnElement.label + '</div>' +
							'<div class="inline right" ' + idElement + '></div>' +
							'<div class="bottom" ' + idElement + '></div>' +
							'</li>';

			} else {

				element  += '<li id="' + columnElement.id + '" ' + colorElement + '>';

				if(conectors.indexOf('t') > -1)
					element  += '<div class="top" ' + idElement + '></div>';

				if(conectors.indexOf('l') > -1)
					element  += '<div class="inline left" ' + idElement + '></div>';

				element  += '<div class="inline center">' + columnElement.label + '</div>';

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
					
		$('#' + name + ' li ').find("div.top, div.left, div.right, div.bottom").click( function(e) {				
			
			clickOnEndpoint(this);

		});

		$('#' + name + ' li ').find("div.top, div.left, div.right, div.bottom").hover(function() {				
			
			$(this).css("backgroundColor","#cccccc")

		}, function() {					
			if(this != firstElement)
				$(this).css("backgroundColor","#ffffff")

		});

	});
}


function clickOnEndpoint(element) {

	var secondElement= element;

	var idSelectedElement = null;

			if( firstElement == null) {

				firstElement = secondElement;

				idSelectedElement = secondElement.dataset.idElement

				if(connectorColor == null || connectorColor == "null" || connectorColor == "")
					connectorColor=document.getElementById(idSelectedElement).dataset.colorElement;
				
				$(firstElement).css("backgroundColor","#cccccc")

			} else {

				idSelectedElement = firstElement.dataset.idElement;

				
				if(connectorColor == null || connectorColor == "null" || connectorColor == "")
					connectorColor=document.getElementById(secondElement.dataset.idElement).dataset.colorElement;

				//Se determinan las coordenadas de los endpoints
				var firstEndpoint = calculateEndPoint(firstElement);
				var secondEndpoint = calculateEndPoint(secondElement);


				var x1 = firstEndpoint.x;
				var y1 = firstEndpoint.y;

				var x2 = secondEndpoint.x;
				var y2 = secondEndpoint.y;


				//Se determinan las coordenadas del punto de control utilizado para modificar la curva cuadratica
				var controlPoint = calculateControlPoint(x1, y1, x2, y2);


				if(document.getElementById(idSelectedElement  +  secondElement.dataset.idElement + "Curve") != null)
					$("#" + idSelectedElement  +  secondElement.dataset.idElement + "Curve").attr("d","M " + x1 + " " + y1 + " T " + e.x + " " + e.y);
				else {

					var SVG = {};
					SVG.ns = "http://www.w3.org/2000/svg";

					var path = document.createElementNS(SVG.ns, "path");

					path.setAttribute("id", '"' + idSelectedElement  +  secondElement.dataset.idElement + 'Curve"');

					//Se genera la curva cuadratica
					path.setAttribute("d", 'M ' + x1 + ' ' + y1 + ' Q ' + controlPoint.x + ' ' + controlPoint.y + ' ' + x2 + ' ' + y2);
					
					//Se decora la curva
					path.setAttribute("stroke", connectorColor);
					path.setAttribute("stroke-width", '5');
					path.setAttribute("fill", 'none');

					document.getElementById("curves").appendChild(path);
				}

				firstElement = null;
				connectorColor = null;
				$('#' + idSelectedElement + ' div').css("backgroundColor","#ffffff")

			}

}

function calculateControlPoint(x1, y1, x2, y2) {

	var x = x2;
	var y = y1;

	return {"x":x, "y":y};
}


function calculateEndPoint(element) {

	var x;
	var y;

	if(element.className.indexOf("left") > -1 || element.className.indexOf("right") > -1){
		x = element.offsetLeft + element.offsetWidth/2;
		y = element.offsetTop + element.offsetHeight/2;
	}
	
	if(element.className.indexOf("top") > -1 || element.className.indexOf("bottom") > -1){
		x = element.offsetLeft + element.offsetWidth/2;
		y = element.offsetTop + element.offsetHeight/2;
	}
	
	return {"x":x, "y":y};
}



generaLista('fruits','fruits.json','lr');
generaLista('colors','colors.json','lr');