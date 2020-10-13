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

	bing() {
		var busquedas = []
		document.querySelectorAll("div cite").forEach(H3 => {
			if (H3.innerText != "") {
				busquedas.push(H3.innerText)
			}
		});
		busquedas = Array.from(new Set(busquedas))
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
		window.addEventListener("load", () => {
			var anchors = document.getElementsByClassName("result__a")
			Array.from(anchors).forEach(link => {
				busquedas.push(link.getAttribute('href'))
			})
			busquedas = Array.from(new Set(busquedas))

			return busquedas

		});



	}
	prueba() {
		return new Promise(resolve => {
			resolve('prueba')
		})
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
					resolve()
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

	getBuscador() {
		return this.buscador
	}

}


var pageManager = new contentPage();



browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[content-side] calling the message: " + request.call);
	if (pageManager[request.call]) {
		pageManager[request.call](request.args)
	}
});
