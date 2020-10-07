class BackgroundExtension {

	captarBusqueda() {
		browser.tabs.sendMessage({
			call: "captarBusqueda"
		})
	}

	googleResults(busqueda) {
		var url = 'http://www.google.com/' + 'search?q=' + busqueda + '&oq=' + busqueda
		var request = new XMLHttpRequest();
		request.open("GET", url, false);
		request.setRequestHeader("Access-Control-Allow-Origin", "*");
		request.send();

		if (request.status === 200 && request.readyState === 4) {
			var parser = new DOMParser()
			var doc = parser.parseFromString(request.response, "text/html");
			var busquedas = []

			var divs = doc.getElementsByClassName("yuRUbf")
			Array.from(divs).forEach(div => {
				busquedas.push((div.querySelector('a')['href']))
			});
			
			var search = new SearchResult('google', busqueda, busquedas);
			return search
		}
	}

	bingResult(busqueda) {

		var url = 'http://www.bing.com/' + 'search?q=' + busqueda + '&oq=' + busqueda
		var request = new XMLHttpRequest();
		request.open("GET", url, false);
		request.setRequestHeader("Access-Control-Allow-Origin", "*");
		request.send();

		if (request.status === 200 && request.readyState === 4) {
			var parser = new DOMParser()
			var doc = parser.parseFromString(request.response, "text/html");
			var busquedas = []


			doc.querySelectorAll("div cite").forEach(H3 => {
				if (H3.innerText != "") {
					busquedas.push(H3.innerText)
				}
			})
			busquedas = Array.from(new Set(busquedas))
			var search = new SearchResult('bing', busqueda, busquedas);
			return search

		}

	}

	google(args) {
		return new Promise((resolve, reject) => {
			resolve('request')

		});
	}

	duckduckgo(args) {
		return new Promise((resolve) => {
			var results = []
			results.push(this.googleResults(args.busqueda))
			results.push(this.bingResult(args.busqueda))


			resolve(results)
		});
	}

	bing(args) {
		return new Promise((resolve) => {


			resolve('resultado')

		});
	}

}

class SearchResult {

	constructor(buscador, busqueda, resultados) {

		this.buscador = buscador;
		this.busqueda = busqueda;
		this.resultados = resultados;
	}

}

var extension = new BackgroundExtension()

browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[background-side] calling the message: " + request.call);
	if (extension[request.call]) {
		return extension[request.call](request.args);
	}
})

