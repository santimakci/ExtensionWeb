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

	linksResultados() {
		var busquedas = []
		document.querySelectorAll("div cite").forEach(H3 => {
			if (H3.innerText != "") {
				busquedas.push(H3.innerText)
			}
		});
		return busquedas
	}

	captarBusqueda() {
		const params = new URL(location.href).searchParams; //Estas dos lineas captar la busqueda enviada por metodo get en los buscadores
		const busqueda = params.get('q');					// y la guardan en la variable busqueda
		if (busqueda != null) {
			var buscador = this.identificarBuscador(window.location.hostname)
			var url = window.location.href
			if (buscador == 'duckduckgo') {
				window.addEventListener("load", () => {
					var busquedas = []
					var anchors = document.getElementsByClassName("result__a")
					Array.from(anchors).forEach(link => {
						busquedas.push(link.getAttribute('href'))
					});
				});
			}
			else {
				var busquedas = this.linksResultados()
			}
			
			var searchResult = new SearchResult(buscador, busqueda, busquedas);
			console.log(searchResult)

			browser.runtime.sendMessage({
				"call": buscador,
				"args": {
					"busqueda": busqueda,
					"url": url
				}
			}).then(news => {
				console.log(news)
			});

		}
	}


}

 class SearchResult {

	constructor (buscador, busqueda, resultados) {

		this.buscador = buscador;
		this.busqueda = busqueda;
		this.resultados = resultados;
	} }






var pageManager = new contentPage();

pageManager.captarBusqueda()


browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[content-side] calling the message: " + request.call);
	if (pageManager[request.call]) {
		pageManager[request.call](request.args);
	}
});
