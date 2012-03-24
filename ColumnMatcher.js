var selectedElement = null;
var connectorColor = null;

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

function generaLista(name, urlData, conectors) {

	var list = '';


	$.getJSON(urlData, function (data) {		
		
		//var fragment = document.createDocumentFragment();
		
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
			if(this != selectedElement)
				$(this).css("backgroundColor","#ffffff")

		});

	});
}


function clickOnEndpoint(element) {

	var thisElement= element;

	var idSelectedElement = null;

			if( selectedElement == null) {

				selectedElement = thisElement;

				idSelectedElement = thisElement.dataset.idElement

				if(connectorColor == null || connectorColor == "null" || connectorColor == "")
					connectorColor=document.getElementById(idSelectedElement).dataset.colorElement;

				
				$(selectedElement).css("backgroundColor","#cccccc")

			} else {

				idSelectedElement = selectedElement.dataset.idElement;

				
				if(connectorColor == null || connectorColor == "null" || connectorColor == "")
					connectorColor=document.getElementById(thisElement.dataset.idElement).dataset.colorElement;

				var xSelectedElement = selectedElement.offsetLeft;
				var ySelectedElement = selectedElement.offsetTop;

				var xCurrentElement = thisElement.offsetLeft;
				var yCurrentElement = thisElement.offsetTop;


				if(document.getElementById(idSelectedElement  +  thisElement.dataset.idElement + "Curve") != null)
					$("#" + idSelectedElement  +  thisElement.dataset.idElement + "Curve").attr("d","M " + xSelectedElement + " " + ySelectedElement + " T " + e.x + " " + e.y);
				else {

					var SVG = {};
					SVG.ns = "http://www.w3.org/2000/svg";

					var path = document.createElementNS(SVG.ns, "path");

					path.setAttribute("id", '"' + idSelectedElement  +  thisElement.dataset.idElement + 'Curve"');
					path.setAttribute("d", 'M ' + xSelectedElement + ' ' + ySelectedElement + ' Q ' + (xCurrentElement  +  300) + ' ' + (yCurrentElement) + ' ' + xCurrentElement + ' ' + yCurrentElement);
					
					path.setAttribute("stroke", connectorColor);
					path.setAttribute("stroke-width", '5');
					path.setAttribute("fill", 'none');

					document.getElementById("curves").appendChild(path);
				}

				selectedElement = null;
				connectorColor = null;
				$('#' + idSelectedElement + ' div').css("backgroundColor","#ffffff")

			}

}


generaLista('fruits','fruits.json','lr');
generaLista('colors','colors.json','lr');