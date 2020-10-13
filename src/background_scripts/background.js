var resultados = []

class BackgroundExtension {
	

	/* 	captarBusqueda() {
			this.getCurrentTab().then((tabs) => {
				browser.tabs.sendMessage(tabs[0].id, {
					call: "captarBusqueda"
				}).then(results => {
					console.log(results)
				});
			}
		}
	 */

	prueba() {
		return new Promise(resolve => {

			this.getCurrentTab().then((tabs) => {
				browser.tabs.sendMessage(tabs[0].id, {
					call: "captarBusqueda"
				}).then( () => {
					resolve(resultados)
				})
			})
			
		})
	}

	getCurrentTab(callback) {
		return browser.tabs.query({
			active: true,
			currentWindow: true
		});
	}

	consulta(url) {
		var request = new XMLHttpRequest();
		request.open("GET", url, false);
		request.setRequestHeader("Access-Control-Allow-Origin", "*");
		request.send();

		if (request.status === 200 && request.readyState === 4) {
			var parser = new DOMParser()
			var doc = parser.parseFromString(request.response, "text/html");
			return doc
		}


	}

	duckduckgoResults(busqueda) {
		var url = 'https://duckduckgo.com/' + '?q=' + busqueda + '&t=h_&ia=web'
		this.consulta(url).then(doc => {
			var busquedas = []
			var anchors = doc.getElementsByClassName('result__a')
			console.log(Array.from(anchors))
			busquedas = Array.from(new Set(busquedas))
			var search = new SearchResult('duckduckgo', busqueda, busquedas);
			return search
		})

	}


	googleResults(busqueda) {
		var url = 'http://www.google.com/' + 'search?q=' + busqueda + '&oq=' + busqueda
		var doc = this.consulta(url)
		var busquedas = []
		var divs = doc.getElementsByClassName("yuRUbf")
		Array.from(divs).forEach(div => {
			busquedas.push((div.querySelector('a')['href']))
		});

		var search = new SearchResult('google', busqueda, busquedas);
		return search
	}

	bingResults(busqueda) {

		var url = 'http://www.bing.com/' + 'search?q=' + busqueda + '&oq=' + busqueda
		var doc = this.consulta(url)
		var busquedas = []
		doc.querySelectorAll("div cite").forEach(H3 => {
			if ((H3.innerText).includes('http')) {
				busquedas.push(H3.innerText)
			}
		})
		busquedas = Array.from(new Set(busquedas))
		var search = new SearchResult('bing', busqueda, busquedas);
		return search

	}

	google(args) {
		return new Promise((resolve, reject) => {
			var results = []
			results.push(this.duckduckgoResults(args.busqueda))
			results.push(this.bingResults(args.busqueda))
			results.push(args.search)
			resultados = results
			resolve(resultados)
		});
	}

	duckduckgo(args) {
		return new Promise((resolve) => {

			var results = []
			results.push(this.googleResults(args.busqueda))
			results.push(this.bingResults(args.busqueda))
			results.push(args.search)
			resultados = results
			resolve(resultados)
		});
	}

	bing(args) {
		return new Promise((resolve) => {
			var results = []
			results.push(this.duckduckgoResults(args.busqueda))
			results.push(this.googleResults(args.busqueda))
			results.push(args.search)
			resultados = results
			resolve(resultados)

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

