class contentPage {


	identificarBuscador(buscador){
			var separador = "."
			var limite = 2
			var arregloDeSubCadenas = buscador.split(separador, limite)
			if( arregloDeSubCadenas[1] === "com"){
				return "duckduckgo"
			}
			else{
				return arregloDeSubCadenas[1]
			}
	}	

	captarBusqueda() {
		const params = new URL(location.href).searchParams; //Estas dos lineas captar la busqueda enviada por metodo get en los buscadores
		const busqueda = params.get('q');					// y la guardan en la variable busqueda
		if (busqueda != null ) {
			var busquedas = []
			var buscador = this.identificarBuscador(window.location.hostname)
			var url = window.location.href
			
			

			console.log(busqueda)
			console.log(buscador)
			console.log(url)
			document.querySelectorAll("div cite").forEach(H3 => {
				if (H3.innerText != "") {
					busquedas.push(H3.innerText)
				}

			});

			browser.runtime.sendMessage({
				"call": "googleResults",
				"args": {
					"buscador": buscador,
					"busqueda": busqueda,
					"url": url
				}
			}).then(news => {
				console.log(news)
			});
		}
	}

}


var pageManager = new contentPage();

pageManager.captarBusqueda()


browser.runtime.onMessage.addListener((request, sender) => {
	console.log("[content-side] calling the message: " + request.call);
	if (pageManager[request.call]) {
		pageManager[request.call](request.args);
	}
});
