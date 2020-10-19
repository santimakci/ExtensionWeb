class contentPage {

	identificarBuscador(buscador) {
		var separador = "."
		var limite = 2
		var arregloDeSubCadenas = buscador.split(separador, limite)
		if (arregloDeSubCadenas[1] === "com") {
			return "duckduckgo"
		}
		else {
			return arregloDeSubCadenas[1]
		}
	}

	mostrarPos(){
		var divs = document.getElementsByClassName("yuRUbf")
		Array.from(divs).forEach(div => {
			div.innerHTML += 'resultado' 
			
		});

	}

	bing() {
		var busquedas = []
		var anchors = document.getElementsByClassName("b_title")
		
		Array.from(anchors).forEach(link => {
/* 			href = link.getElementsByTagName('a')
 */			Array.from(link.getElementsByTagName('a')).forEach( href =>{
				busquedas.push(href.getAttribute('href')) })

		})
		busquedas = Array.from(new Set(busquedas))
		console.log(busquedas)
		return busquedas
	}

	google() {
		var busquedas = []
		var divs = document.getElementsByClassName("yuRUbf")
		Array.from(divs).forEach(div => {
			busquedas.push((div.querySelector('a')['href']))
		});
		busquedas = Array.from(new Set(busquedas))
		return busquedas
	}

	duckduckgo() {
		var busquedas = []
		var anchors = document.getElementsByClassName("result__a")
		Array.from(anchors).forEach(link => {
			busquedas.push(link.getAttribute('href'))
		})
		busquedas = Array.from(new Set(busquedas))
		return busquedas

	}


	captarBusqueda() {
		return new Promise((resolve) => {
			const params = new URL(location.href).searchParams; //Estas dos lineas captar la busqueda enviada por metodo get en los buscadores
			const busqueda = params.get('q');
			var results = []
			if (busqueda != null) {
				var buscador = this.identificarBuscador(window.location.hostname)
				var busquedas = eval('this.' + buscador + '()')
				var search = new SearchResult(buscador, busqueda, busquedas);
				results.push(search)
				console.log(search)

				browser.runtime.sendMessage({
					"call": buscador,
					"args": {
						"busqueda": busqueda,
						"search": search
					}
				}).then(news => {
					resolve(news)
				});

			}

		});
	}

}


class SearchResult {

	constructor(buscador, busqueda, resultados) {

		this.buscador = buscador;
		this.busqueda = busqueda;
		this.busquedas = resultados;
	}


}


var pageManager = new contentPage();


browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[content-side] calling the message: " + request.call);
	if (pageManager[request.call]) {
		pageManager[request.call](request.args)
	}
});
