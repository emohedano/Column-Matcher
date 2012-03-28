//Variable que guarda cada ejercicio como un atributo
var ejercicios = {};

//Elemento SVG del DOM que contiene las relaciones
var contenedorCurvas;

//Variable que indica si estamos sobre el segundo endpoint
var isOverSecondEndpont = false;

//Elementos del DOM que guardan los 2 endpoints
var firstEndpoint = null;
var secondEndpoint = null;

//Variable que almacen el conlor que tomara una relacion
var connectorColor = null;


/*
createList

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

function createList(name, data, conectors) {

	var list = '';
	
		
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
							'<div class="inline center" ' + idElement + '>' + columnElement.id + '</div>' +
							'<div class="inline right" ' + idElement + '></div>' +
							'<div class="bottom" ' + idElement + '></div>' +
							'</li>';

			} else {

				element  += '<li id="' + columnElement.id + '" ' + colorElement + ' ' + listId + '>';

				if(conectors.indexOf('t') > -1)
					element  += '<div class="top" ' + idElement + '></div>';

				if(conectors.indexOf('l') > -1)
					element  += '<div class="inline left" ' + idElement + '></div>';

				element  += '<div class="inline center" ' + idElement + '>' + columnElement.id + '</div>';

				if(conectors.indexOf('r') > -1)
					element  += '<div class="inline right" ' + idElement + '></div>';

				if(conectors.indexOf('b') > -1)
					element  += '<div class="bottom" ' + idElement + '></div>';

				element  +='</li>';
			}

			list  += element;

		});

		
		$('#' + name).append(list);

		var elements =  $('#' + name + ' li div.center');

		//Permitimos que todos los elementos sean arrastrables
		elements.draggable({
		    cursor: 'pointer',
		    containment: 'document',
		    helper: 'clone',
		    start: dragStart,
		    stop: function(){

			 	if(!isOverSecondEndpont)
			 		cancelDrop();		 	

			},
			drag: draggging
		 });

		//Permitimos a todos los elementos que reciban a otos para formar una relacion
		elements.droppable({
			over:function(){					
				secondEndpoint = this;				
			},
			drop: function (){
				dragEnd();
			}

		});


		//Funcionalidad al pasar sobre algun elemento
		$('#' + name + ' li div.center').hover(function() {			
			
			$(this).css("backgroundColor","#cccccc")

		}, function() {					

			if(this != firstEndpoint)
				$(this).css("backgroundColor","#ffffff");	

		});
}

function addListValidationrules(elements){

	
	$.each(elements, function (posicion, element){

		//Se asignan los elementos validos con los que se puede conectar un elemento de la lista uno en la lista 2
		//Se usa  jQuery.data cuando se manejan objetos JSON
		jQuery.data(document.getElementById(element.id), "validMatch", element.validConnections);

	});

}



/*************************************************Inicia Funciones para crear las relaciones entr elementos*********************************/

//Funcion que crea una curva temporal entre 2 puntos
function initDefaultConnection() {

	var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	
	path.setAttribute("d", 'M 0 0 L 10 10');
	path.setAttribute("id","tempConn");
	//Se decora la curva
	path.setAttribute("stroke", "black");
	path.setAttribute("stroke-width", '5');
	path.setAttribute("fill", 'none');
	path.style.zIndex = 10;	

   	document.getElementById("curves").appendChild(path);
};


//Funcion que crea redefine una curva temporal entre 2 puntos
function updateConnection(idConecction, point1, point2, type) {

	var path = document.getElementById(idConecction);

	//Los puntos se establecen relativos al contenedor de curvas
	point1.x -= contenedorCurvas.offsetLeft;
	point1.y -= contenedorCurvas.offsetTop;

	point2.x -= contenedorCurvas.offsetLeft;
	point2.y -= contenedorCurvas.offsetTop;		
    	
	
	//Se genera la curva cuadratica
	if(type == "bezier"){
		//Calculamos los puntos de apoyo para la curva cuadratica
		var cpoint1 =calculateControlPoint(point1, point2, "first");
		var cpoint2 =calculateControlPoint(point1, point2, "second");

		path.setAttribute("d", 'M '+point1.x+' '+point1.y+' C '+ cpoint1.x + ' ' + cpoint1.y +' '+ cpoint2.x + ' ' + cpoint2.y +' '+ point2.x + ' ' + point2.y);

	}else
		path.setAttribute("d", 'M '+point1.x+' '+point1.y+' L '+point2.x+' '+point2.y);
    	
	return path;
};



//Funcion que determina la posicion del punto de control para dibujar la curva cuadratica

function calculateControlPoint(point1, point2, type) {

	var x = null;
	var y = null;
	var x1 = point1.x;
	var y1 = point1.y;
	var x2 = point2.x;
	var y2 = point2.y;

	if(type == "first"){

		x = x1+((x2-x1)/2);
		y = y1;

	}else if(type == "second"){

		x = x1+((x2-x1)/2);
		y = y2;
	}

	return {"x":x, "y":y};
}



//Funcion que determina la posicion de los puntos inicial y final de la curva


function calculateEndPoint(element) {

	var x;
	var y;

	x = element.offsetLeft + element.offsetWidth/2;
	y = element.offsetTop + element.offsetHeight/2;	

	return {"x":x, "y":y};

}

/*************************************************Termina Funciones para crear las relaciones entr elementos*********************************/

/******************************************************Inicia Funcionalidad de Drag and Drop*******************************************/


// Inicia arrastre de elemento
function dragStart() {

	firstEndpoint = this;

	isOverSecondEndpont = false;

	var idFirstElement = this.dataset.idElement;

	if(connectorColor == null || connectorColor == "null" || connectorColor == "")
		connectorColor=document.getElementById(idFirstElement).dataset.colorElement;
	
	$(firstEndpoint).css("backgroundColor","#cccccc");

	initDefaultConnection();	

}

// Se esta arrastrando un elemento
function draggging(event, ui){

	var point1 = calculateEndPoint(this);
	var point2 = {x:(ui.offset.left-50),y:(ui.offset.top+20)} ;
	
	updateConnection("tempConn", point1, point2, "line");

}

// Se suelta elemento en otro elemento
function dragEnd(){

	isOverSecondEndpont = true;
				
	var idFirstElement = firstEndpoint.dataset.idElement;
	var idSecondElement = secondEndpoint.dataset.idElement;	
	

	var firstElement = document.getElementById(idFirstElement);
	var secondElement = document.getElementById(idSecondElement);
	
	//Si no son elementos de la misma lista
	if(firstElement.dataset.listId != secondElement.dataset.listId){

		if(connectorColor == null || connectorColor == "null" || connectorColor == "")
			connectorColor = secondElement.dataset.colorElement;

		var point2 = calculateEndPoint(secondEndpoint);
		var point1 = calculateEndPoint(firstEndpoint);

		var path = updateConnection("tempConn", point1, point2, "bezier");

		path.setAttribute("id", '"' + idFirstElement  +  secondEndpoint.dataset.idElement + 'Curve"');
		path.setAttribute("class", firstElement.dataset.listId  + ' ' + secondElement.dataset.listId);
		path.setAttribute("implicatedElements", idFirstElement  + ' ' + secondEndpoint.dataset.idElement);				
		path.setAttribute("stroke", connectorColor);
		
		//Se asigna un nombre a la relacion temporal
		path.id = idFirstElement +secondEndpoint.dataset.idElement +"Conn";				

		$('#' + idFirstElement + ' div').css("backgroundColor","#ffffff");

	    //Se elimina la relacion temporal
	    $("#tempEndpoint").remove(); 

	    firstEndpoint = null;
		secondEndpoint = null;
		connectorColor = null;
	}else{
		cancelDrop();
	}

}


function cancelDrop(){

	$("#tempConn").remove();	
	
	$(firstEndpoint).css("backgroundColor","#ffffff");

	firstEndpoint = null;	
}



/******************************************************Termina Funcionalidad de Drag and Drop*******************************************/





function validate(listName) {

	var aciertos = 0;
	var errores = 0;

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
			if(validElements[implicatedColumns[1]].indexOf(implicatedElements[1]) < 0){				
				this.setAttribute("stroke-dasharray", "5,5");
				this.setAttribute("stroke", "#000000");		

				errores += 1;
				$("#"+implicatedElements[0]).find("div.center").css({backgroundImage:"url(images/bad.png)"})

			}else{
				aciertos += 1;
				$("#"+implicatedElements[0]).find("div.center").css({backgroundImage:"url(images/good.png)"})
			}

		}else{

			validElements = jQuery.data(document.getElementById(implicatedElements[1]), "validMatch");

			//Si el primer elemento no es un elemento valido
			if(validElements[implicatedColumns[0]].indexOf(implicatedElements[0]) < 0){
				this.setAttribute("stroke-dasharray", "5,5");
				this.setAttribute("stroke", "#000000");

				errores += 1;
				$("#"+implicatedElements[1]).find("div.center").css({backgroundImage:"url(images/bad.png)"})

			}else{
				aciertos += 1;
				$("#"+implicatedElements[1]).find("div.center").css({backgroundImage:"url(images/good.png)"})
			}
			
		}


	});

	document.getElementById("txtAciertos").value = aciertos;
	document.getElementById("txtErrores").value = errores;

	$("#btnValidator").css("visibility","hidden");

}

function resetExercise(listName) {

	$("path"+((listName != "")?("."+listName):"")).each(function (key, val) {
			
		$(this).remove();

	});	

	$("div.center").css({backgroundImage:""});

	document.getElementById("txtAciertos").value = 0;
	document.getElementById("txtErrores").value = 0;

	$("#btnValidator").css("visibility","visible");
}


function resetAll() {

	$("#curves").empty();

	$("#columnA,#columnB").empty();

	$("#btnValidator").css("visibility","visible");

	document.getElementById("txtAciertos").value = 0;
	document.getElementById("txtErrores").value = 0;

}


function loadExercise(excericiseName){

	if (excericiseName == "-1")
		return;

	var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", "exercises/"+excericiseName+".json");

	document.getElementsByTagName("head")[0].appendChild(fileref);

	resetAll();

	//Se retrasa la carga del ejercicio para que pueda cargar el JSON
	window.setTimeout(function (){	
		
		var ejercicioActual = ejercicios[excericiseName];
		
		$.each(ejercicioActual, function (columnName, elements){		

			createList(columnName,elements,'c');
			addListValidationrules(elements);

		});

	}, 500);
	

};


$(document).ready(function (){

	contenedorCurvas = document.getElementById("curves");	

});
